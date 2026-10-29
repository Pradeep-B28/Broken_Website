// What it does: Automated presentation and reel recording controller with animated tap dot for beginner, edit, and escape rooms.
// What it uses: config.js, js/content.js, js/theme.js, js/engine/fixes.js, js/engine/diff.js.
// What uses it: js/main.js.

import { getPuzzle, getFixedFiles, getRoom } from "./content.js";
import { setTheme } from "./theme.js";
import { touchedLines } from "./engine/fixes.js";

let tapDotEl = null;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureTapDot() {
  if (!tapDotEl) {
    tapDotEl = document.createElement("div");
    tapDotEl.className = "demo-tap-dot";
    document.body.appendChild(tapDotEl);
  }
  return tapDotEl;
}

async function moveDotTo(x, y, duration = 300) {
  const dot = ensureTapDot();
  dot.style.transition = `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
  dot.style.transform = `translate(${x}px, ${y}px)`;
  await sleep(duration + 40);
}

async function tapElement(element, delayAfter = 300) {
  if (!element) return;
  const rect = element.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  await moveDotTo(x, y, 320);

  const dot = ensureTapDot();
  dot.classList.add("is-tapping");
  await sleep(150);
  element.click();
  dot.classList.remove("is-tapping");
  await sleep(delayAfter);
}

export async function runDemo() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("demo") !== "1") return;

  const targetTheme = params.get("theme");
  if (targetTheme === "dark" || targetTheme === "light") {
    setTheme(targetTheme, false);
  }

  const loop = params.get("loop") !== "0";
  const roomParam = params.get("room");
  const puzzleParam = params.get("puzzle");

  const isRoom = Boolean(roomParam);
  const targetId = roomParam || puzzleParam || "b2";

  do {
    if (isRoom) {
      await runEscapeDemo(targetId);
    } else if (targetId.startsWith("b")) {
      await runBeginnerDemo(targetId);
    } else {
      await runEditDemo(targetId);
    }
    // Hold solved state for 3 seconds before next iteration
    await sleep(3000);
  } while (loop);
}

async function runBeginnerDemo(puzzleId) {
  const puzzle = getPuzzle(puzzleId);
  if (!puzzle) return;

  // Navigate to puzzle
  window.location.hash = `#/puzzle/${puzzleId}`;
  await sleep(1200);

  // Show ticket for 2 seconds
  await sleep(2000);

  // Phone view: switch to Code tab
  const codeTabBtn = Array.from(document.querySelectorAll(".seg-btn")).find(
    (b) => b.textContent.trim().toLowerCase() === "code"
  );
  if (codeTabBtn && window.getComputedStyle(codeTabBtn).display !== "none") {
    await tapElement(codeTabBtn, 400);
  }

  // Find file tab if answer is in non-default file
  const answerFile = Object.keys(puzzle.answer || {})[0];
  if (answerFile) {
    const fileLabel = answerFile === "html" ? "index.html" : answerFile === "css" ? "styles.css" : "script.js";
    const fileTab = Array.from(document.querySelectorAll(".code-tab-btn")).find(
      (b) => b.textContent.trim().toLowerCase() === fileLabel.toLowerCase()
    );
    if (fileTab && !fileTab.classList.contains("is-active")) {
      await tapElement(fileTab, 400);
    }
  }

  // Tap one wrong line first
  const allLines = Array.from(document.querySelectorAll(".code-line"));
  const correctLineNums = puzzle.answer?.[answerFile] || [];
  const wrongLine = allLines.find((btn) => !correctLineNums.includes(Number(btn.dataset.line)));
  if (wrongLine) {
    await tapElement(wrongLine, 600);
  }

  // Tap the right line
  const rightLineNum = correctLineNums[0];
  const rightLine = allLines.find((btn) => Number(btn.dataset.line) === rightLineNum);
  if (rightLine) {
    await tapElement(rightLine, 800);
  }

  // Wait for options container to open
  await sleep(500);

  // Pick one wrong option first (shows why for 1.5s)
  const optionCards = Array.from(document.querySelectorAll(".option-card"));
  const wrongOption = optionCards.find((card) => {
    const text = card.textContent;
    const optObj = puzzle.options.find((o) => text.includes(o.text));
    return optObj && !optObj.correct;
  });

  if (wrongOption) {
    await tapElement(wrongOption, 1500);
  }

  // Pick the correct option
  const rightOption = optionCards.find((card) => {
    const text = card.textContent;
    const optObj = puzzle.options.find((o) => text.includes(o.text));
    return optObj && optObj.correct;
  });

  if (rightOption) {
    await tapElement(rightOption, 500);
  }

  // Wait for fix animation, repair sweep, checks, and solved card
  await sleep(4000);
}

async function runEditDemo(puzzleId) {
  const puzzle = getPuzzle(puzzleId);
  if (!puzzle) return;

  window.location.hash = `#/puzzle/${puzzleId}`;
  await sleep(1200);

  // Show ticket for 2 seconds
  await sleep(2000);

  // Tap Run checks once on broken code (shows red failing checks)
  const runBtn = document.querySelector(".run-checks-btn");
  if (runBtn) {
    await tapElement(runBtn, 2500);
  }

  // Switch to code tab on phone view
  const codeTabBtn = Array.from(document.querySelectorAll(".seg-btn")).find(
    (b) => b.textContent.trim().toLowerCase() === "code"
  );
  if (codeTabBtn && window.getComputedStyle(codeTabBtn).display !== "none") {
    await tapElement(codeTabBtn, 400);
  }

  // Get fixed files
  const fixed = getFixedFiles(puzzle);

  // Open changed file tabs and type the fix
  for (const fileKey of ["html", "css", "js"]) {
    const brokenText = puzzle.files[fileKey];
    const fixedText = fixed[fileKey];
    if (brokenText === undefined || fixedText === undefined || brokenText === fixedText) continue;

    const fileLabel = fileKey === "html" ? "index.html" : fileKey === "css" ? "styles.css" : "script.js";
    const tabBtn = Array.from(document.querySelectorAll(".code-tab")).find(
      (b) => b.textContent.trim().toLowerCase().includes(fileLabel.toLowerCase())
    );
    if (tabBtn) {
      await tapElement(tabBtn, 300);
    }

    const textarea = document.querySelector(".editor-textarea");
    if (textarea) {
      // Type characters smoothly or set final text to simulate typing
      await simulateEditorTyping(textarea, fixedText);
    }
  }

  // Tap Run checks again (all pass)
  if (runBtn) {
    await tapElement(runBtn, 3500);
  }

  // Wait for solved card
  await sleep(3500);
}

async function runEscapeDemo(roomId) {
  const room = getRoom(roomId);
  if (!room) return;

  window.location.hash = `#/room/${roomId}`;
  await sleep(1200);

  // Show story for 2 seconds
  await sleep(2000);

  // Switch to Code on phone view if needed
  const codeTab = Array.from(document.querySelectorAll(".room-tab-btn")).find(
    (b) => b.textContent.trim().toLowerCase() === "code"
  );
  if (codeTab && window.getComputedStyle(codeTab).display !== "none") {
    await tapElement(codeTab, 400);
  }

  // Scroll to clue and tap line
  const lines = Array.from(document.querySelectorAll(".code-line"));
  if (room.kind === "read") {
    // r1 read room: highlight clues
    for (const l of lines.slice(5, 8)) {
      await tapElement(l, 400);
    }
  } else {
    // Edit room: tap line and edit
    const editLine = room.edit?.line || 10;
    const lineBtn = lines.find((b) => Number(b.dataset.line) === editLine) || lines[5];
    if (lineBtn) {
      await tapElement(lineBtn, 500);

      // Sheet opens: type in line editor
      const input = document.querySelector(".line-editor-input");
      const applyBtn = document.querySelector(".line-editor-apply-btn");
      if (input && applyBtn && room.edit?.after) {
        input.value = "";
        for (const char of room.edit.after) {
          input.value += char;
          await sleep(25);
        }
        await tapElement(applyBtn, 800);
      }
    }
  }

  // Switch back to room/lock
  const roomTab = Array.from(document.querySelectorAll(".room-tab-btn")).find(
    (b) => b.textContent.trim().toLowerCase() === "room"
  );
  if (roomTab && window.getComputedStyle(roomTab).display !== "none") {
    await tapElement(roomTab, 400);
  }

  // Enter code into keypad
  const lockInput = document.querySelector(".lock-display-text");
  const lockCard = document.querySelector(".room-lock-card");
  const unlockBtn = document.querySelector(".lock-unlock-btn");

  if (unlockBtn) {
    const answer = room.answer;
    for (const char of answer) {
      // Find key on virtual keypad or deliver input
      const keyBtn = Array.from(document.querySelectorAll(".keypad-btn")).find(
        (k) => k.textContent.trim().toUpperCase() === char.toUpperCase()
      );
      if (keyBtn) {
        await tapElement(keyBtn, 120);
      } else {
        await sleep(100);
      }
    }
    await tapElement(unlockBtn, 1500);
  }

  // Wait for doors opening animation
  await sleep(3500);
}

async function simulateEditorTyping(textarea, newText) {
  textarea.focus();
  // Smoothly update value and trigger input event
  textarea.value = newText;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  await sleep(400);
}
