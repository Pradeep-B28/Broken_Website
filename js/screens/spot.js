// What it does: Beginner spot mode screen managing line tapping, fix picking, fix animation, checks, and solved state.
// What it uses: config.js, js/content.js, js/progress.js, js/copy.js, js/events.js, js/ui/*, js/engine/*.
// What uses it: js/router.js.

import { CONFIG } from "../../config.js";
import { getPuzzle, getSite, getFixedFiles } from "../content.js";
import { recordPuzzle } from "../progress.js";
import { t } from "../copy.js";
import { emit } from "../events.js";
import { puzzlePoints, stars } from "../engine/score.js";

import { createPuzzleTopbar } from "../ui/topbar.js";
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

  const topbar = createPuzzleTopbar({
    level: "beginner",
    puzzleId: currentPuzzle.id,
    totalPuzzles: 5,
    initialPoints: CONFIG.scoring.beginner.max
  });
  screenEl.appendChild(topbar.el);

  timerInterval = setInterval(() => {
    if (!document.hidden && !isSolved) {
      elapsedSeconds++;
      topbar.setTime(elapsedSeconds);
    }
  }, 1000);

  const segmented = document.createElement("div");
  segmented.className = "puzzle-tabs-segmented";
  let activeTab = "page";
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
  ticketComponent.el.querySelector(".ticket-symptom")?.addEventListener("click", () => selectTab("code"));
  colLeft.appendChild(ticketComponent.el);

  const hintsComponent = createHints({
    hints: currentPuzzle.hints,
    cost: CONFIG.scoring.beginner.hint,
    onHintOpen: (n) => {
      emit("hint:open", { id: currentPuzzle.id, n });
      const currentPts = puzzlePoints("beginner", { spotTries: Math.max(1, spotTries), fixTries: Math.max(1, fixTries), hints: n }, CONFIG.scoring);
      topbar.setPoints(currentPts);
    }
  });
  colLeft.appendChild(hintsComponent.el);

  const actionContainer = document.createElement("div");
  actionContainer.className = "spot-action-area";
  colLeft.appendChild(actionContainer);

  const optionsWrapper = document.createElement("div");
  optionsWrapper.className = "options-container";
  optionsWrapper.style.display = "none";
  const optTitle = document.createElement("div");
  optTitle.className = "options-title";
  optTitle.textContent = t("spot.pick");
  optionsWrapper.appendChild(optTitle);

  browserComponent = createBrowserFrame({
    site: currentSite,
    puzzle: currentPuzzle,
    files: currentPuzzle.files,
    status: "broken"
  });
  colMid.appendChild(browserComponent.el);

  const codeView = createCodeView({
    files: currentPuzzle.files,
    onLineTap: (file, line) => {
      if (lineFound) return;
      spotTries++;
      const isCorrect = Boolean(currentPuzzle.answer?.[file]?.includes(line));
      emit("spot:tap", { id: currentPuzzle.id, file, line, correct: isCorrect });

      if (isCorrect) {
        lineFound = true;
        codeView.markLineRight(file, line);
        optionsWrapper.style.display = "flex";
        if (window.innerWidth < 1024) {
          setTimeout(() => optionsWrapper.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
        }
      } else {
        codeView.markLineWrong(file, line);
        if (spotTries >= 3) hintsComponent.pulse();
      }
    }
  });
  colRight.appendChild(codeView.el);

  const options = (currentPuzzle.options || []).map((o, idx) => ({ ...o, origIndex: idx }));
  const isDemo = new URLSearchParams(window.location.search).get("demo") === "1";
  if (!isDemo) {
    options.sort(() => Math.random() - 0.5);
  }

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
      emit("fix:pick", { id: currentPuzzle.id, option: opt.origIndex, correct: isCorrect });
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
    const fix = currentPuzzle.fixes?.[0];
    if (fix) {
      const brokenLineNum = currentPuzzle.answer?.[fix.file]?.[0] || 1;
      await codeView.animateLineReplacement(fix.file, brokenLineNum, fix.replace.trim());
    }

    selectTab("page");
    const sweepFps = await browserComponent.performRepairSweep(fixedFiles);
    if (typeof window !== "undefined") window.__lastSweepFps = sweepFps;

    optionsWrapper.remove();
    const checksList = createChecksList({ checks: currentPuzzle.checks });
    actionContainer.replaceChildren(checksList.el);
    selectTab("checks");

    const checkRun = await browserComponent.reload(fixedFiles, currentPuzzle.checks);
    const results = checkRun?.results || [];
    emit("checks:run", { id: currentPuzzle.id, passed: results.filter((r) => r.pass).length, total: results.length, status: "done" });
    await checksList.renderResults(results);

    const hintsCount = hintsComponent.getOpenedCount();
    const finalPoints = puzzlePoints("beginner", { spotTries, fixTries, hints: hintsCount }, CONFIG.scoring);
    const finalStars = stars("beginner", finalPoints, CONFIG.scoring);

    recordPuzzle(currentPuzzle.id, { points: finalPoints, stars: finalStars, revealed: false, seconds: elapsedSeconds });
    emit("puzzle:solved", { id: currentPuzzle.id, level: "beginner", points: finalPoints, stars: finalStars, seconds: elapsedSeconds, hints: hintsCount, tries: spotTries + fixTries });

    const isLast = currentPuzzle.id === "b5";
    const solvedCard = createSolvedCard({
      puzzle: currentPuzzle,
      points: finalPoints,
      starsCount: finalStars,
      isLast,
      onNext: () => {
        window.location.hash = isLast ? "#/done/beginner" : `#/puzzle/b${Number(currentPuzzle.id.slice(1)) + 1}`;
      },
      onBack: () => { window.location.hash = "#/level/beginner"; }
    });
    actionContainer.replaceChildren(solvedCard.el);
  }

  function selectTab(tab) {
    activeTab = tab;
    ["page", "code", "checks"].forEach((t) => tabButtons[t].classList.toggle("is-active", t === tab));
    if (window.innerWidth < 1024) window.scrollTo(0, 0);
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

    colLeft.style.display = activeTab === "code" ? "none" : "flex";
    colMid.style.display = activeTab === "page" ? "flex" : "none";
    colRight.style.display = activeTab === "code" ? "flex" : "none";
    ticketComponent.el.style.display = (activeTab === "checks" && isSolved) ? "none" : "flex";
    hintsComponent.el.style.display = (activeTab === "checks" && isSolved) ? "none" : "block";
    actionContainer.style.display = activeTab === "page" ? "none" : "block";
    if (activeTab === "code") colRight.appendChild(optionsWrapper);
  }

  window.addEventListener("resize", applyResponsiveLayout);
  workspace.appendChild(colLeft);
  workspace.appendChild(colMid);
  workspace.appendChild(colRight);
  screenEl.appendChild(workspace);
  rootContainer.appendChild(screenEl);
  applyResponsiveLayout();
}
