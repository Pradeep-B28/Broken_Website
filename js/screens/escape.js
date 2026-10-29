// What it does: Cinematic dark intro screen for The Night Museum escape room with glitch typing and room progress.
// What it uses: copy.js, js/progress.js, js/engine/lock.js, js/store.js.
// What uses it: js/router.js.

import { t } from "../copy.js";
import { getProgress } from "../progress.js";
import { formatClock } from "../engine/lock.js";
import { setJSON } from "../store.js";

let rootContainer = null;
let typewriterTimer = null;

export function mount(container) {
  rootContainer = container;
}

export function enter() {
  render();
}

export function leave() {
  if (typewriterTimer) {
    clearInterval(typewriterTimer);
    typewriterTimer = null;
  }
}

function render() {
  if (!rootContainer) return;
  rootContainer.replaceChildren();

  const progress = getProgress();
  const screen = document.createElement("div");
  screen.className = "escape-intro-screen";

  // Header card / Frame
  const frame = document.createElement("div");
  frame.className = "escape-intro-frame";

  const frameBar = document.createElement("div");
  frameBar.className = "escape-frame-bar";

  const dots = document.createElement("div");
  dots.className = "escape-frame-dots";
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("span");
    dot.className = "escape-dot";
    dots.appendChild(dot);
  }

  const address = document.createElement("div");
  address.className = "escape-frame-pill";
  address.textContent = "nightmuseum.example/locked";

  const status = document.createElement("span");
  status.className = "escape-frame-status";
  status.textContent = "Connection lost";

  frameBar.appendChild(dots);
  frameBar.appendChild(address);
  frameBar.appendChild(status);
  frame.appendChild(frameBar);

  // Frame body / Message container
  const frameBody = document.createElement("div");
  frameBody.className = "escape-intro-body";

  const glitchHeader = document.createElement("div");
  glitchHeader.className = "escape-glitch-header";
  glitchHeader.textContent = "GLITCH // OVERRIDE";

  const messageP = document.createElement("p");
  messageP.className = "escape-typewriter-text";

  frameBody.appendChild(glitchHeader);
  frameBody.appendChild(messageP);
  frame.appendChild(frameBody);
  screen.appendChild(frame);

  // Typewriter effect for Glitch's message
  const fullText = t("escape.intro");
  let charIdx = 0;
  messageP.textContent = "";

  typewriterTimer = setInterval(() => {
    if (charIdx < fullText.length) {
      messageP.textContent = fullText.slice(0, charIdx + 1);
      charIdx++;
    } else {
      clearInterval(typewriterTimer);
      typewriterTimer = null;
    }
  }, 22);

  // Five Room Dots
  const dotsContainer = document.createElement("div");
  dotsContainer.className = "escape-rooms-progress";

  for (let i = 1; i <= 5; i++) {
    const roomDot = document.createElement("div");
    const rId = `r${i}`;
    const isSolved = Boolean(progress.rooms[rId]?.solved);
    roomDot.className = `room-progress-dot ${isSolved ? "is-solved" : ""}`;
    roomDot.title = `Room ${i}`;
    dotsContainer.appendChild(roomDot);
  }
  screen.appendChild(dotsContainer);

  // Best time if escaped before
  if (progress.escape?.done && progress.escape?.seconds > 0) {
    const bestP = document.createElement("p");
    bestP.className = "escape-best-time";
    bestP.textContent = t("escape.best", { time: formatClock(progress.escape.seconds) });
    screen.appendChild(bestP);
  }

  // Enter button
  const enterBtn = document.createElement("button");
  enterBtn.type = "button";
  enterBtn.className = "btn btn-primary escape-enter-btn";
  enterBtn.textContent = t("escape.enter");
  enterBtn.addEventListener("click", () => {
    // Reset or start escape session
    setJSON("tbw-escape-save", {
      startedAt: Date.now(),
      elapsedSeconds: 0
    });
    window.location.hash = "#/room/r1";
  });
  screen.appendChild(enterBtn);

  rootContainer.appendChild(screen);
}
