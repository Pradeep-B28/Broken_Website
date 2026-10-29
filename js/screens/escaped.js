// What it does: Escape room finish screen presenting escape time, points, room stars, sales CTA, and sharing.
// What it uses: config.js, copy.js, js/progress.js, js/links.js, js/events.js, js/engine/lock.js.
// What uses it: js/router.js.

import { CONFIG } from "../../config.js";
import { t } from "../copy.js";
import { getProgress, getLevelSummary } from "../progress.js";
import { formatClock } from "../engine/lock.js";
import { salesUrl, programUrl } from "../links.js";
import { emit } from "../events.js";
import { createShareCard } from "../share.js";

let rootContainer = null;

export function mount(container) {
  rootContainer = container;
}

export function enter() {
  render();
}

export function leave() {}

function render() {
  if (!rootContainer) return;
  rootContainer.replaceChildren();

  const progress = getProgress();
  const summary = getLevelSummary("escape", progress);
  const totalSeconds = progress.escape?.seconds || 0;
  const timeFormatted = formatClock(totalSeconds);

  emit("escape:done", { seconds: totalSeconds, points: summary.points });

  const screen = document.createElement("div");
  screen.className = "escaped-screen";

  // Top header card with time and score
  const heroCard = document.createElement("div");
  heroCard.className = "card escaped-hero-card";

  const title = document.createElement("h1");
  title.className = "escaped-title";
  title.textContent = t("escaped.title");

  const timeHuge = document.createElement("div");
  timeHuge.className = "escaped-time-huge";
  timeHuge.textContent = timeFormatted;

  const pointsText = document.createElement("p");
  pointsText.className = "escaped-points-sub";
  pointsText.textContent = `${summary.points} of 500 points`;

  // 5 Rooms with stars
  const roomsGrid = document.createElement("div");
  roomsGrid.className = "escaped-rooms-grid";

  for (let i = 1; i <= 5; i++) {
    const rId = `r${i}`;
    const rData = progress.rooms[rId] || { stars: 0, points: 0 };
    const rCard = document.createElement("div");
    rCard.className = "escaped-room-badge";

    const rLabel = document.createElement("span");
    rLabel.className = "escaped-room-label";
    rLabel.textContent = `Room ${i}`;

    const rStars = document.createElement("div");
    rStars.className = "escaped-room-stars";
    const starCount = rData.stars || 0;
    rStars.textContent = "★".repeat(starCount) + "☆".repeat(3 - starCount);

    rCard.appendChild(rLabel);
    rCard.appendChild(rStars);
    roomsGrid.appendChild(rCard);
  }

  heroCard.appendChild(title);
  heroCard.appendChild(timeHuge);
  heroCard.appendChild(pointsText);
  heroCard.appendChild(roomsGrid);
  screen.appendChild(heroCard);

  // Pitch card
  const pitchCard = document.createElement("div");
  pitchCard.className = "card escaped-pitch-card";
  const pitchP = document.createElement("p");
  pitchP.className = "escaped-pitch-text";
  pitchP.textContent = t("escaped.pitch");

  const nextTitle = document.createElement("h3");
  nextTitle.className = "escaped-next-title";
  nextTitle.textContent = t("escaped.next");

  const beginnerBtn = document.createElement("a");
  beginnerBtn.href = "#/level/beginner";
  beginnerBtn.className = "btn btn-primary escaped-beginner-btn";
  beginnerBtn.textContent = t("escaped.beginner");

  pitchCard.appendChild(pitchP);
  pitchCard.appendChild(nextTitle);
  pitchCard.appendChild(beginnerBtn);
  screen.appendChild(pitchCard);

  // Program Card
  const programCard = document.createElement("div");
  programCard.className = "card escaped-program-card";

  const progTitle = document.createElement("h3");
  progTitle.className = "escaped-card-heading";
  progTitle.textContent = t("result.ctaTitle");

  const progBody = document.createElement("p");
  progBody.className = "escaped-card-body";
  progBody.textContent = `Learn AI-Powered full stack development with Wrench Wise. ${t("result.ctaBody")}`;

  const progActions = document.createElement("div");
  progActions.className = "escaped-program-actions";

  const waLink = salesUrl(
    { escape: { roomsSolved: 5, seconds: totalSeconds }, points: summary.points },
    progress.path,
    CONFIG
  );

  if (CONFIG.salesWhatsApp && waLink) {
    const waBtn = document.createElement("a");
    waBtn.href = waLink;
    waBtn.target = "_blank";
    waBtn.rel = "noopener noreferrer";
    waBtn.className = "btn btn-primary";
    waBtn.textContent = t("cta.whatsapp");
    waBtn.addEventListener("click", () => emit("whatsapp:click", { spot: "escaped" }));
    progActions.appendChild(waBtn);
  }

  const progBtn = document.createElement("a");
  progBtn.href = programUrl("escaped", CONFIG);
  progBtn.target = "_blank";
  progBtn.rel = "noopener noreferrer";
  progBtn.className = "btn btn-secondary";
  progBtn.textContent = t("cta.program");
  progBtn.addEventListener("click", () => emit("program:click", { spot: "escaped" }));
  progActions.appendChild(progBtn);

  programCard.appendChild(progTitle);
  programCard.appendChild(progBody);
  programCard.appendChild(progActions);
  screen.appendChild(programCard);

  // Share Card with dynamic image synthesis, Status/Post sizes, WhatsApp & Copy link
  const shareCard = createShareCard({
    summary: { seconds: totalSeconds, roomsSolved: 5, points: summary.points },
    isEscape: true
  });
  screen.appendChild(shareCard);

  rootContainer.appendChild(screen);
}
