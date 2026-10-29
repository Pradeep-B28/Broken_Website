// What it does: Escape room screen managing story, line editor, lock keypad, console ping, doors, and progression.
// What it uses: config.js, js/content.js, js/copy.js, js/progress.js, js/store.js, js/events.js, js/ui/*, js/engine/*.
// What uses it: js/router.js.

import { CONFIG } from "../../config.js";
import { getRoom, getSite } from "../content.js";
import { getProgress, recordRoom, recordEscapeDone } from "../progress.js";
import { getJSON, setJSON, removeItem } from "../store.js";
import { t } from "../copy.js";
import { emit } from "../events.js";
import { puzzlePoints, stars } from "../engine/score.js";
import { formatClock } from "../engine/lock.js";
import { playPing } from "../sound.js";

import { createBrowserFrame } from "../ui/browser.js";
import { createCodeView } from "../ui/codeview.js";
import { createConsole } from "../ui/console.js";
import { createLineEditor } from "../ui/lineEditor.js";
import { createLock } from "../ui/lock.js";
import { playDoorsAnimation, createRoomSolvedCard } from "../ui/doors.js";
import { createHints } from "../ui/hints.js";

let rootContainer = null;
let currentRoom = null;
let currentSite = null;
let escapeInterval = null;
let flickerTimer = null;
let browserComponent = null;

export function mount(container) {
  rootContainer = container;
}

export function enter(params) {
  const roomId = params?.id || "r1";
  currentRoom = getRoom(roomId);
  if (!currentRoom) {
    if (rootContainer) rootContainer.textContent = "Room not found";
    return;
  }
  currentSite = getSite("museum");
  emit("room:start", { room: currentRoom.id });
  render();
}

export function leave() {
  if (escapeInterval) {
    clearInterval(escapeInterval);
    escapeInterval = null;
  }
  if (flickerTimer) {
    clearTimeout(flickerTimer);
    flickerTimer = null;
  }
  if (browserComponent) {
    browserComponent.destroy();
    browserComponent = null;
  }
}

function render() {
  if (!rootContainer || !currentRoom) return;
  rootContainer.replaceChildren();

  const originalFiles = { ...currentRoom.files };
  const draftKey = `tbw-draft-${currentRoom.id}`;
  const savedDraft = CONFIG.features.saveDrafts ? getJSON(draftKey, null) : null;
  let workingFiles = savedDraft ? { ...savedDraft } : { ...originalFiles };
  let undoStack = [];
  const editedLines = new Set();

  let wrongCodes = 0;
  let hintsOpened = 0;
  let isSkipped = false;
  let isSolved = false;
  let firstLogPing = false;
  let activeTab = "room";

  const escapeState = getJSON("tbw-escape-save", { elapsedSeconds: 0 });
  let totalEscapeSeconds = escapeState.elapsedSeconds || 0;

  const screenEl = document.createElement("div");
  screenEl.className = "room-screen";

  // Top Bar
  const topbar = document.createElement("div");
  topbar.className = "room-topbar";
  const rNum = currentRoom.id.replace("r", "");
  topbar.innerHTML = `
    <div class="room-topbar-left">
      <a href="#/escape" class="room-back-link"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg> Back</a>
      <span class="room-breadcrumb">Room ${rNum} of 5, ${currentRoom.title}</span>
    </div>
    <div class="room-topbar-right">
      <div class="room-timer">${formatClock(totalEscapeSeconds)}</div>
      <a href="#/start" class="room-change-level-link">${t("picker.change")}</a>
    </div>
  `;
  screenEl.appendChild(topbar);

  const timerEl = topbar.querySelector(".room-timer");
  escapeInterval = setInterval(() => {
    if (!document.hidden && !isSolved) {
      totalEscapeSeconds++;
      timerEl.textContent = formatClock(totalEscapeSeconds);
      setJSON("tbw-escape-save", { elapsedSeconds: totalEscapeSeconds });
    }
  }, 1000);

  // Phone Segmented Switch
  const segmented = document.createElement("div");
  segmented.className = "puzzle-tabs-segmented room-tabs-segmented";
  ["room", "code"].forEach((tab) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `seg-btn ${tab === activeTab ? "is-active" : ""}`;
    btn.textContent = tab.charAt(0).toUpperCase() + tab.slice(1);
    btn.addEventListener("click", () => selectTab(tab));
    segmented.appendChild(btn);
  });
  screenEl.appendChild(segmented);

  const workspace = document.createElement("div");
  workspace.className = "room-workspace";
  const colLeft = document.createElement("div");
  colLeft.className = "room-col room-col--left";
  const colMid = document.createElement("div");
  colMid.className = "room-col room-col--mid";
  const colRight = document.createElement("div");
  colRight.className = "room-col room-col--right";

  // Left Column
  const storyCard = document.createElement("div");
  storyCard.className = "card room-story-card";
  storyCard.innerHTML = `<p class="room-story-text">${currentRoom.story}</p><p class="room-goal-text"><strong>${currentRoom.goal}</strong></p>`;
  colLeft.appendChild(storyCard);

  const hintsComp = createHints({
    hints: currentRoom.hints,
    cost: CONFIG.scoring.escape.hint,
    onHintOpen: (n) => {
      hintsOpened = n;
      emit("hint:open", { room: currentRoom.id, n });
      if (n >= 3) skipBtn.style.display = "inline-flex";
    }
  });
  colLeft.appendChild(hintsComp.el);

  const skipBtn = document.createElement("button");
  skipBtn.type = "button";
  skipBtn.className = "btn btn-secondary room-skip-btn";
  skipBtn.style.display = "none";
  skipBtn.textContent = t("room.skip");
  skipBtn.addEventListener("click", () => {
    if (!window.confirm(t("room.skipConfirm"))) return;
    isSkipped = true;
    emit("room:skip", { room: currentRoom.id });
    unlockSequence();
  });
  colLeft.appendChild(skipBtn);

  const lockComp = createLock({
    room: currentRoom,
    onUnlock: () => unlockSequence(),
    onTry: (res) => {
      if (res === "wrong" || res === "decoy") wrongCodes++;
      emit("code:try", { room: currentRoom.id, result: res });
    }
  });
  colLeft.appendChild(lockComp.el);

  // Middle Column
  const consoleComp = createConsole();
  browserComponent = createBrowserFrame({
    site: currentSite,
    puzzle: { ...currentRoom, statusText: "Locked by Glitch" },
    files: workingFiles,
    status: "locked",
    onLog: (msg) => {
      if (!firstLogPing) {
        firstLogPing = true;
        playPing();
        consoleComp.setCollapsed(false);
      }
      if (msg && msg.level === "error") {
        consoleComp.addError(msg.text || msg);
      } else {
        consoleComp.addLog(msg && msg.text ? msg.text : msg);
      }
    },
    onError: (err) => consoleComp.addError(err)
  });
  browserComponent.setStatus("locked");
  colMid.appendChild(browserComponent.el);
  if (CONFIG.features.console) colMid.appendChild(consoleComp.el);

  function scheduleFlicker() {
    flickerTimer = setTimeout(() => {
      const stage = browserComponent.el.querySelector(".browser-stage");
      if (stage && !isSolved) {
        stage.classList.add("is-flickering");
        setTimeout(() => stage.classList.remove("is-flickering"), 400);
      }
      scheduleFlicker();
    }, 8000 + Math.random() * 4000);
  }
  scheduleFlicker();

  // Right Column
  const codeHeader = document.createElement("div");
  codeHeader.className = "room-code-header";
  codeHeader.innerHTML = `
    <span class="room-tap-note">${t("room.tapLine")}</span>
    <div class="room-code-actions">
      <button type="button" class="chip-undo" style="display:none;">${t("room.undo")}</button>
      <button type="button" class="btn btn-secondary room-reset-btn">${t("room.reset")}</button>
    </div>
  `;
  colRight.appendChild(codeHeader);

  const undoBtn = codeHeader.querySelector(".chip-undo");
  undoBtn.addEventListener("click", () => {
    if (undoStack.length === 0) return;
    workingFiles = { ...undoStack.pop() };
    if (undoStack.length === 0) {
      undoBtn.style.display = "none";
      editedLines.clear();
    }
    applyFilesUpdate();
  });

  const resetBtn = codeHeader.querySelector(".room-reset-btn");
  resetBtn.addEventListener("click", () => {
    if (window.confirm(t("room.resetConfirm"))) {
      workingFiles = { ...originalFiles };
      undoStack = [];
      editedLines.clear();
      undoBtn.style.display = "none";
      if (CONFIG.features.saveDrafts) removeItem(draftKey);
      applyFilesUpdate();
    }
  });

  let activeCodeView = null;
  function renderCodeViewer() {
    if (activeCodeView) activeCodeView.el.remove();
    activeCodeView = createCodeView({
      files: workingFiles,
      onLineTap: (file, lineNum) => handleLineTap(file, lineNum)
    });
    colRight.appendChild(activeCodeView.el);
    editedLines.forEach((key) => {
      const [f, l] = key.split(":");
      activeCodeView.markLineEdited(f, Number(l));
    });
  }
  renderCodeViewer();

  function handleLineTap(file, lineNum) {
    const lines = (workingFiles[file] || "").split("\n");
    const lineText = lines[lineNum - 1] || "";
    const fName = file === "html" ? "index.html" : file === "css" ? "styles.css" : "script.js";

    const editorModal = createLineEditor({
      fileName: fName,
      lineNumber: lineNum,
      initialText: lineText,
      onApply: (newText) => {
        editorModal.destroy();
        undoStack.push({ ...workingFiles });
        undoBtn.style.display = "inline-flex";
        lines[lineNum - 1] = newText;
        workingFiles[file] = lines.join("\n");
        editedLines.add(`${file}:${lineNum}`);
        applyFilesUpdate();
        emit("room:edit", { room: currentRoom.id, file, line: lineNum });
      },
      onCancel: () => editorModal.destroy()
    });
    document.body.appendChild(editorModal.el);
  }

  function applyFilesUpdate() {
    if (CONFIG.features.saveDrafts) setJSON(draftKey, workingFiles);
    browserComponent.reload(workingFiles);
    renderCodeViewer();
  }

  async function unlockSequence() {
    isSolved = true;
    lockComp.setDisabled(true);
    await playDoorsAnimation(browserComponent.el.querySelector(".browser-viewport-wrapper"));

    const finalPts = puzzlePoints("escape", { wrongCodes, hints: hintsOpened, revealed: isSkipped }, CONFIG.scoring);
    const finalStars = stars("escape", finalPts, CONFIG.scoring, isSkipped);

    recordRoom(currentRoom.id, { points: finalPts, stars: finalStars, skipped: isSkipped, seconds: totalEscapeSeconds });
    emit("room:escaped", { room: currentRoom.id, points: finalPts, seconds: totalEscapeSeconds, hints: hintsOpened, wrong_codes: wrongCodes });

    if (CONFIG.features.saveDrafts) removeItem(draftKey);

    const isLast = currentRoom.id === "r5";
    const solvedCard = createRoomSolvedCard({
      room: currentRoom,
      points: finalPts,
      starsCount: finalStars,
      isLast,
      onNext: () => {
        if (isLast) {
          recordEscapeDone(totalEscapeSeconds);
          emit("escape:done", { seconds: totalEscapeSeconds, points: finalPts });
          window.location.hash = "#/escaped";
        } else {
          const nextNum = Number(currentRoom.id.replace("r", "")) + 1;
          window.location.hash = `#/room/r${nextNum}`;
        }
      }
    });

    colLeft.replaceChildren(solvedCard.el);
    if (window.innerWidth < 1024) selectTab("room");
  }

  function selectTab(tab) {
    activeTab = tab;
    segmented.querySelectorAll(".seg-btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.textContent.toLowerCase() === tab);
    });
    applyResponsiveLayout();
  }

  function applyResponsiveLayout() {
    const isMobile = window.innerWidth < 1024;
    colLeft.style.display = !isMobile || activeTab === "room" ? "flex" : "none";
    colMid.style.display = !isMobile || activeTab === "room" ? "flex" : "none";
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
