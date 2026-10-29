// What it does: Moderate and expert edit mode screen managing live code editing, running checks, console, and solutions.
// What it uses: config.js, js/content.js, js/store.js, js/progress.js, js/copy.js, js/events.js, js/ui/*, js/engine/*.
// What uses it: js/router.js.

import { CONFIG } from "../../config.js";
import { getPuzzle, getSite, getFixedFiles } from "../content.js";
import { getJSON as storeGet, setJSON as storeSet, removeItem as storeRemove } from "../store.js";
import { recordPuzzle } from "../progress.js";
import { emit } from "../events.js";
import { puzzlePoints, stars } from "../engine/score.js";

import { createPuzzleTopbar } from "../ui/topbar.js";
import { createBrowserFrame } from "../ui/browser.js";
import { createEditor } from "../ui/editor.js";
import { createTicket } from "../ui/ticket.js";
import { createHints } from "../ui/hints.js";
import { createChecksList } from "../ui/checks.js";
import { createSolvedCard } from "../ui/solved.js";
import { createConsole } from "../ui/console.js";
import { createDiffView } from "../ui/diffview.js";

let rootContainer = null;
let currentPuzzle = null;
let currentSite = null;
let timerInterval = null;
let elapsedSeconds = 0;
let browserComponent = null;

export function mount(container) {
  rootContainer = container;
}

export function enter(params) {
  const puzzleId = params?.id || "m1";
  currentPuzzle = getPuzzle(puzzleId);
  if (!currentPuzzle) {
    if (rootContainer) rootContainer.textContent = "Puzzle not found";
    return;
  }
  currentSite = getSite(currentPuzzle.site);
  elapsedSeconds = 0;
  emit("puzzle:start", { id: currentPuzzle.id, level: currentPuzzle.level });
  render();
}

export function leave() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  if (browserComponent) {
    browserComponent.destroy();
    browserComponent = null;
  }
}

function render() {
  if (!rootContainer || !currentPuzzle) return;
  rootContainer.replaceChildren();

  const level = currentPuzzle.level;
  const originalBrokenFiles = { ...currentPuzzle.files };
  const fixedFiles = getFixedFiles(currentPuzzle);
  const draftKey = `tbw-draft-${currentPuzzle.id}`;
  const savedDraft = CONFIG.features.saveDrafts ? storeGet(draftKey) : null;
  let workingFiles = savedDraft ? { ...savedDraft } : { ...originalBrokenFiles };

  let failedRuns = 0;
  let hintsOpened = 0;
  let isRevealed = false;
  let isSolved = false;
  let isRunning = false;
  let isCoolingDown = false;
  let activeTab = "code";

  const screenEl = document.createElement("div");
  screenEl.className = "puzzle-screen";

  const topbar = createPuzzleTopbar({
    level,
    puzzleId: currentPuzzle.id,
    totalPuzzles: 5,
    initialPoints: CONFIG.scoring[level].max
  });
  screenEl.appendChild(topbar.el);

  timerInterval = setInterval(() => {
    if (!document.hidden && !isSolved) {
      elapsedSeconds++;
      topbar.setTime(elapsedSeconds);
    }
  }, 1000);

  if (savedDraft) {
    const draftBanner = document.createElement("div");
    draftBanner.className = "editor-limit-banner";
    draftBanner.style.cssText = "background-color: var(--surface-2); color: var(--text);";
    draftBanner.innerHTML = `<span>Restored your last edits.</span>
      <button type="button" style="margin-left:8px; color:var(--brand); text-decoration:underline; font-weight:700; background:none; border:none; cursor:pointer;">Undo</button>`;
    draftBanner.querySelector("button").addEventListener("click", () => {
      workingFiles = { ...originalBrokenFiles };
      editorComponent.setFiles(workingFiles);
      browserComponent.reload(workingFiles);
      storeRemove(draftKey);
      draftBanner.remove();
    });
    screenEl.appendChild(draftBanner);
  }

  const segmented = document.createElement("div");
  segmented.className = "puzzle-tabs-segmented";
  const tabButtons = {};
  ["page", "code", "checks"].forEach((tab) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `seg-btn ${tab === activeTab ? "is-active" : ""}`;
    btn.textContent = tab.charAt(0).toUpperCase() + tab.slice(1);
    btn.addEventListener("click", () => selectTab(tab));
    tabButtons[tab] = btn;
    segmented.appendChild(btn);
  });
  screenEl.appendChild(segmented);

  const workspace = document.createElement("div");
  workspace.className = "puzzle-workspace";
  const colLeft = document.createElement("div");
  colLeft.className = "puzzle-col puzzle-col--left";
  const colMid = document.createElement("div");
  colMid.className = "puzzle-col puzzle-col--mid";
  const colRight = document.createElement("div");
  colRight.className = "puzzle-col puzzle-col--right";

  const ticketComponent = createTicket({ site: currentSite, puzzle: currentPuzzle });
  colLeft.appendChild(ticketComponent.el);

  const hintsComponent = createHints({
    hints: currentPuzzle.hints,
    cost: CONFIG.scoring[level].hint,
    onHintOpen: (n) => {
      hintsOpened = n;
      emit("hint:open", { id: currentPuzzle.id, n });
      updatePointsDisplay();
      checkShowFixUnlock();
    }
  });
  colLeft.appendChild(hintsComponent.el);

  const showFixBtn = document.createElement("button");
  showFixBtn.type = "button";
  showFixBtn.className = "btn btn-secondary";
  showFixBtn.style.display = "none";
  showFixBtn.textContent = "Show the fix";
  showFixBtn.addEventListener("click", () => {
    if (!window.confirm("You will get 0 points for this puzzle. Are you sure you want to see the solution?")) return;
    isRevealed = true;
    emit("solution:reveal", { id: currentPuzzle.id });
    updatePointsDisplay();

    const diffModal = createDiffView({
      brokenFiles: originalBrokenFiles,
      fixedFiles,
      onCopyFix: () => {
        editorComponent.setFiles(fixedFiles);
        workingFiles = { ...fixedFiles };
        browserComponent.reload(workingFiles);
        diffModal.el.remove();
      },
      onClose: () => diffModal.el.remove()
    });
    document.body.appendChild(diffModal.el);
  });
  colLeft.appendChild(showFixBtn);

  const checksContainer = document.createElement("div");
  checksContainer.className = "spot-action-area";
  colLeft.appendChild(checksContainer);
  checksContainer.appendChild(createChecksList({ checks: currentPuzzle.checks }).el);

  const consoleComponent = createConsole();
  browserComponent = createBrowserFrame({
    site: currentSite,
    puzzle: currentPuzzle,
    files: workingFiles,
    status: "broken",
    onLog: (msg) => {
      if (msg && msg.level === "error") {
        consoleComponent.addError(msg.text || msg);
      } else {
        consoleComponent.addLog(msg && msg.text ? msg.text : msg);
      }
    },
    onError: (err) => consoleComponent.addError(err)
  });
  colMid.appendChild(browserComponent.el);
  if (CONFIG.features.console) colMid.appendChild(consoleComponent.el);

  let previewDebounce = null;
  let draftDebounce = null;
  const editorComponent = createEditor({
    initialFiles: workingFiles,
    originalFiles: originalBrokenFiles,
    onChange: (updatedFiles) => {
      workingFiles = { ...updatedFiles };
      clearTimeout(previewDebounce);
      previewDebounce = setTimeout(() => browserComponent.reload(workingFiles), 600);
      if (CONFIG.features.saveDrafts) {
        clearTimeout(draftDebounce);
        draftDebounce = setTimeout(() => storeSet(draftKey, workingFiles), 1000);
      }
    }
  });
  colRight.appendChild(editorComponent.el);

  const runBar = document.createElement("div");
  runBar.className = "editor-run-bar";
  runBar.style.cssText = "display: flex; gap: 0.75rem; margin-top: 0.5rem;";

  const runBtn = document.createElement("button");
  runBtn.type = "button";
  runBtn.className = "btn btn-primary run-checks-btn";
  runBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
    <span>Run checks</span>
    <kbd style="font-size:0.6875rem; opacity:0.8; margin-left:4px; font-family:var(--font-mono);">Ctrl+Enter</kbd>
  `;
  runBtn.addEventListener("click", () => handleRunChecks());
  runBar.appendChild(runBtn);
  colRight.appendChild(runBar);

  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleRunChecks();
    }
  });

  function checkShowFixUnlock() {
    if (failedRuns >= CONFIG.limits.revealAfterRuns || hintsOpened >= 3) {
      showFixBtn.style.display = "inline-flex";
    }
  }

  function updatePointsDisplay() {
    const pts = puzzlePoints(level, { failedRuns, hints: hintsOpened, revealed: isRevealed }, CONFIG.scoring);
    topbar.setPoints(pts);
  }

  async function handleRunChecks() {
    if (isRunning || isCoolingDown || isSolved) return;
    isRunning = true;
    runBtn.disabled = true;
    runBtn.querySelector("span").textContent = "Running...";

    if (window.innerWidth < 1024) selectTab("checks");

    const checksList = createChecksList({ checks: currentPuzzle.checks });
    checksContainer.replaceChildren(checksList.el);

    const checkRun = await browserComponent.reload(workingFiles, currentPuzzle.checks);
    const results = checkRun?.results || [];
    const passedCount = results.filter((r) => r.pass).length;
    const totalCount = results.length;
    const allPass = checkRun?.status === "done" && passedCount === totalCount && totalCount > 0;

    ticketComponent.updateAcceptance(passedCount, totalCount);
    emit("checks:run", { id: currentPuzzle.id, passed: passedCount, total: totalCount, status: checkRun?.status || "done" });

    if (checkRun?.status === "timeout") {
      failedRuns++;
      updatePointsDisplay();
      checkShowFixUnlock();
      const timeoutNotice = document.createElement("div");
      timeoutNotice.className = "editor-limit-banner check-timeout-notice";
      timeoutNotice.textContent = "Your page never finished loading. Check for a loop that never ends, or an unclosed tag or comment.";
      checksContainer.prepend(timeoutNotice);
    } else {
      await checksList.renderResults(results);
    }

    if (allPass) {
      isSolved = true;
      runBtn.style.display = "none";
      if (window.innerWidth < 1024) selectTab("page");
      await browserComponent.performRepairSweep(workingFiles);
      if (window.innerWidth < 1024) selectTab("checks");

      const finalPoints = puzzlePoints(level, { failedRuns, hints: hintsOpened, revealed: isRevealed }, CONFIG.scoring);
      const finalStars = stars(level, finalPoints, CONFIG.scoring, isRevealed);

      recordPuzzle(currentPuzzle.id, { points: finalPoints, stars: finalStars, revealed: isRevealed, seconds: elapsedSeconds });
      emit("puzzle:solved", { id: currentPuzzle.id, level, points: finalPoints, stars: finalStars, seconds: elapsedSeconds, hints: hintsOpened, tries: failedRuns });
      if (CONFIG.features.saveDrafts) storeRemove(draftKey);

      const isLast = currentPuzzle.id === "m5" || currentPuzzle.id === "e5";
      const solvedCard = createSolvedCard({
        puzzle: currentPuzzle,
        points: finalPoints,
        starsCount: finalStars,
        isLast,
        onNext: () => {
          if (isLast) {
            window.location.hash = `#/done/${level}`;
          } else {
            const nextNum = Number(currentPuzzle.id.slice(1)) + 1;
            window.location.hash = `#/puzzle/${currentPuzzle.id.charAt(0)}${nextNum}`;
          }
        },
        onBack: () => { window.location.hash = `#/level/${level}`; }
      });
      checksContainer.replaceChildren(solvedCard.el);
    } else if (checkRun?.status !== "timeout") {
      failedRuns++;
      updatePointsDisplay();
      checkShowFixUnlock();
    }

    isRunning = false;
    isCoolingDown = true;
    runBtn.querySelector("span").textContent = "Run checks";
    setTimeout(() => {
      isCoolingDown = false;
      if (!isSolved) runBtn.disabled = false;
    }, CONFIG.limits.runCooldownMs);
  }

  function selectTab(tab) {
    activeTab = tab;
    ["page", "code", "checks"].forEach((t) => tabButtons[t].classList.toggle("is-active", t === tab));
    if (window.innerWidth < 1024) window.scrollTo(0, 0);
    applyResponsiveLayout();
  }

  function applyResponsiveLayout() {
    const isMobile = window.innerWidth < 1024;
    colLeft.style.display = !isMobile || activeTab === "checks" ? "flex" : "none";
    colMid.style.display = !isMobile || activeTab === "page" ? "flex" : "none";
    colRight.style.display = !isMobile || activeTab === "code" ? "flex" : "none";
  }

  window.addEventListener("resize", applyResponsiveLayout);
  workspace.appendChild(colLeft);
  workspace.appendChild(colMid);
  workspace.appendChild(colRight);
  screenEl.appendChild(workspace);
  rootContainer.appendChild(screenEl);
  applyResponsiveLayout();
}
