// What it does: Beginner spot mode screen managing line tapping, fix picking, fix animation, checks, and solved state.
// What it uses: config.js, js/content.js, js/progress.js, js/copy.js, js/events.js, js/ui/*, js/engine/*.
// What uses it: js/router.js.

import { CONFIG } from "../../config.js";
import { getPuzzle, getSite, getFixedFiles } from "../content.js";
import { recordPuzzle } from "../progress.js";
import { t } from "../copy.js";
import { emit } from "../events.js";
import { puzzlePoints, stars } from "../engine/score.js";
import { formatClock } from "../engine/lock.js";

import { createBrowserFrame } from "../ui/browser.js";
import { createCodeView } from "../ui/codeview.js";
import { createTicket } from "../ui/ticket.js";
import { createHints } from "../ui/hints.js";
import { createChecksList } from "../ui/checks.js";
import { createSolvedCard } from "../ui/solved.js";

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
  const puzzleId = params?.id || "b1";
  currentPuzzle = getPuzzle(puzzleId);
  if (!currentPuzzle) {
    if (rootContainer) rootContainer.textContent = "Puzzle not found";
    return;
  }
  currentSite = getSite(currentPuzzle.site);

  elapsedSeconds = 0;
  emit("puzzle:start", { id: currentPuzzle.id, level: "beginner" });

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

  const screenEl = document.createElement("div");
  screenEl.className = "puzzle-screen";

  let spotTries = 0;
  let fixTries = 0;
  let lineFound = false;
  let isSolved = false;

  // --- Top Bar ---
  const topbar = document.createElement("div");
  topbar.className = "puzzle-topbar";

  const topLeft = document.createElement("div");
  topLeft.className = "puzzle-topbar-left";

  const backLink = document.createElement("a");
  backLink.href = "#/level/beginner";
  backLink.className = "puzzle-back-link";
  backLink.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
    <span>Beginner</span>
  `;

  const breadcrumb = document.createElement("span");
  breadcrumb.className = "puzzle-breadcrumb";
  breadcrumb.textContent = t("puzzle.of", {
    level: "Beginner",
    n: currentPuzzle.id.slice(1),
    total: 5
  });

  topLeft.appendChild(backLink);
  topLeft.appendChild(breadcrumb);

  const topRight = document.createElement("div");
  topRight.className = "puzzle-topbar-right";

  const timerEl = document.createElement("div");
  timerEl.className = "puzzle-timer";
  timerEl.textContent = formatClock(0);

  const pointsBadge = document.createElement("div");
  pointsBadge.className = "puzzle-points-badge";
  pointsBadge.textContent = t("puzzle.pointsLeft", { n: CONFIG.scoring.beginner.max });

  topRight.appendChild(timerEl);
  topRight.appendChild(pointsBadge);

  topbar.appendChild(topLeft);
  topbar.appendChild(topRight);
  screenEl.appendChild(topbar);

  // Timer loop
  timerInterval = setInterval(() => {
    if (!document.hidden && !isSolved) {
      elapsedSeconds++;
      timerEl.textContent = formatClock(elapsedSeconds);
    }
  }, 1000);

  // Mobile Segmented Switch
  const segmented = document.createElement("div");
  segmented.className = "puzzle-tabs-segmented";
  let activeTab = "page";

  const tabs = ["page", "code", "checks"];
  const tabButtons = {};

  tabs.forEach((tab) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.tab = tab;
    btn.className = `seg-btn ${tab === activeTab ? "is-active" : ""}`;
    btn.textContent = tab.charAt(0).toUpperCase() + tab.slice(1);
    btn.addEventListener("click", () => selectTab(tab));
    tabButtons[tab] = btn;
    segmented.appendChild(btn);
  });
  screenEl.appendChild(segmented);

  // Workspace Columns
  const workspace = document.createElement("div");
  workspace.className = "puzzle-workspace";

  const colLeft = document.createElement("div");
  colLeft.className = "puzzle-col puzzle-col--left";

  const colMid = document.createElement("div");
  colMid.className = "puzzle-col puzzle-col--mid";

  const colRight = document.createElement("div");
  colRight.className = "puzzle-col puzzle-col--right";

  // Left Column Components
  const ticketComponent = createTicket({
    site: currentSite,
    puzzle: currentPuzzle
  });
  // Tapping ticket symptom on mobile switches to code tab
  ticketComponent.el.querySelector(".ticket-symptom")?.addEventListener("click", () => {
    selectTab("code");
  });
  colLeft.appendChild(ticketComponent.el);

  const hintsComponent = createHints({
    hints: currentPuzzle.hints,
    cost: CONFIG.scoring.beginner.hint,
    onHintOpen: (n) => {
      emit("hint:open", { id: currentPuzzle.id, n });
      const currentPts = puzzlePoints("beginner", {
        spotTries: Math.max(1, spotTries),
        fixTries: Math.max(1, fixTries),
        hints: n
      }, CONFIG.scoring);
      pointsBadge.textContent = t("puzzle.pointsLeft", { n: currentPts });
    }
  });
  colLeft.appendChild(hintsComponent.el);

  // Dynamic Action Container (holds options, checks, or solved card)
  const actionContainer = document.createElement("div");
  actionContainer.className = "spot-action-area";
  colLeft.appendChild(actionContainer);

  // Fix Options Section
  const optionsWrapper = document.createElement("div");
  optionsWrapper.className = "options-container";
  optionsWrapper.style.display = "none";

  const optTitle = document.createElement("div");
  optTitle.className = "options-title";
  optTitle.textContent = t("spot.pick");
  optionsWrapper.appendChild(optTitle);

  // Middle Column: Browser Frame
  browserComponent = createBrowserFrame({
    site: currentSite,
    puzzle: currentPuzzle,
    files: currentPuzzle.files,
    status: "broken"
  });
  colMid.appendChild(browserComponent.el);

  // Right Column: Code View
  const codeView = createCodeView({
    files: currentPuzzle.files,
    onLineTap: (file, line) => {
      if (lineFound) return;
      spotTries++;
      const isCorrect = Boolean(currentPuzzle.answer?.[file]?.includes(line));

      emit("spot:tap", {
        id: currentPuzzle.id,
        file,
        line,
        correct: isCorrect
      });

      if (isCorrect) {
        lineFound = true;
        codeView.markLineRight(file, line);
        optionsWrapper.style.display = "flex";
        if (window.innerWidth < 1024) {
          setTimeout(() => {
            optionsWrapper.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 150);
        }
      } else {
        codeView.markLineWrong(file, line);
        if (spotTries >= 3) {
          hintsComponent.pulse();
        }
      }
    }
  });
  colRight.appendChild(codeView.el);

  // Options cards
  const options = (currentPuzzle.options || []).map((o, idx) => ({ ...o, origIndex: idx }));
  options.sort(() => Math.random() - 0.5);

  options.forEach((opt) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "option-card";

    const code = document.createElement("code");
    code.className = "option-code";
    code.textContent = opt.text;

    const why = document.createElement("span");
    why.className = "option-why";
    why.style.display = "none";
    why.textContent = opt.why;

    card.appendChild(code);
    card.appendChild(why);

    card.addEventListener("click", async () => {
      if (isSolved) return;
      fixTries++;
      const isCorrect = Boolean(opt.correct);

      emit("fix:pick", {
        id: currentPuzzle.id,
        option: opt.origIndex,
        correct: isCorrect
      });

      why.style.display = "block";

      if (!isCorrect) {
        card.classList.add("is-wrong");
        card.disabled = true;
      } else {
        card.classList.add("is-correct");
        isSolved = true;
        optionsWrapper.querySelectorAll(".option-card").forEach((c) => (c.disabled = true));

        await applyFixSequence();
      }
    });

    optionsWrapper.appendChild(card);
  });
  actionContainer.appendChild(optionsWrapper);

  async function applyFixSequence() {
    const fixedFiles = getFixedFiles(currentPuzzle);

    // 1. Animate code line change
    const fix = currentPuzzle.fixes?.[0];
    if (fix) {
      const brokenLineNum = currentPuzzle.answer?.[fix.file]?.[0] || 1;
      await codeView.animateLineReplacement(fix.file, brokenLineNum, fix.replace.trim());
    }

    // 2. Perform repair sweep (on mobile, switch to Page tab to see sweep)
    selectTab("page");
    const sweepFps = await browserComponent.performRepairSweep(fixedFiles);
    if (typeof window !== "undefined") {
      window.__lastSweepFps = sweepFps;
    }

    // 3. Run checks visibly
    optionsWrapper.remove();
    const checksList = createChecksList({ checks: currentPuzzle.checks });
    actionContainer.replaceChildren(checksList.el);

    // Switch to checks tab on mobile so results are visible
    selectTab("checks");

    const checkRun = await browserComponent.reload(fixedFiles, currentPuzzle.checks);
    const results = checkRun?.results || [];

    emit("checks:run", {
      id: currentPuzzle.id,
      passed: results.filter((r) => r.pass).length,
      total: results.length,
      status: "done"
    });

    await checksList.renderResults(results);

    // 4. Score & Solved Card
    const hintsCount = hintsComponent.getOpenedCount();
    const finalPoints = puzzlePoints("beginner", {
      spotTries,
      fixTries,
      hints: hintsCount
    }, CONFIG.scoring);
    const finalStars = stars("beginner", finalPoints, CONFIG.scoring);

    recordPuzzle(currentPuzzle.id, {
      points: finalPoints,
      stars: finalStars,
      revealed: false,
      seconds: elapsedSeconds
    });

    emit("puzzle:solved", {
      id: currentPuzzle.id,
      level: "beginner",
      points: finalPoints,
      stars: finalStars,
      seconds: elapsedSeconds,
      hints: hintsCount,
      tries: spotTries + fixTries
    });

    const isLast = currentPuzzle.id === "b5";
    const solvedCard = createSolvedCard({
      puzzle: currentPuzzle,
      points: finalPoints,
      starsCount: finalStars,
      isLast,
      onNext: () => {
        if (isLast) {
          window.location.hash = "#/done/beginner";
        } else {
          const nextNum = Number(currentPuzzle.id.slice(1)) + 1;
          window.location.hash = `#/puzzle/b${nextNum}`;
        }
      },
      onBack: () => {
        window.location.hash = "#/level/beginner";
      }
    });

    actionContainer.replaceChildren(solvedCard.el);
  }

  function selectTab(tab) {
    activeTab = tab;
    tabs.forEach((tName) => {
      tabButtons[tName].classList.toggle("is-active", tName === tab);
    });
    if (window.innerWidth < 1024) {
      window.scrollTo(0, 0);
    }
    applyResponsiveLayout();
  }

  function applyResponsiveLayout() {
    const isMobile = window.innerWidth < 1024;
    if (!isMobile) {
      colLeft.style.display = "flex";
      colMid.style.display = "flex";
      colRight.style.display = "flex";
      ticketComponent.el.style.display = "flex";
      hintsComponent.el.style.display = "block";
      actionContainer.style.display = "block";
      if (!actionContainer.contains(optionsWrapper) && optionsWrapper.parentElement !== actionContainer) {
        actionContainer.appendChild(optionsWrapper);
      }
      return;
    }

    // Mobile layout
    if (activeTab === "page") {
      colLeft.style.display = "flex";
      colMid.style.display = "flex";
      colRight.style.display = "none";
      ticketComponent.el.style.display = "flex";
      hintsComponent.el.style.display = "block";
      actionContainer.style.display = "none";
    } else if (activeTab === "code") {
      colLeft.style.display = "none";
      colMid.style.display = "none";
      colRight.style.display = "flex";
      colRight.appendChild(optionsWrapper);
      actionContainer.style.display = "block";
    } else { // "checks"
      colLeft.style.display = "flex";
      colMid.style.display = "none";
      colRight.style.display = "none";
      ticketComponent.el.style.display = isSolved ? "none" : "flex";
      hintsComponent.el.style.display = isSolved ? "none" : "block";
      actionContainer.style.display = "block";
    }
  }

  window.addEventListener("resize", applyResponsiveLayout);

  workspace.appendChild(colLeft);
  workspace.appendChild(colMid);
  workspace.appendChild(colRight);
  screenEl.appendChild(workspace);

  rootContainer.appendChild(screenEl);
  applyResponsiveLayout();
}