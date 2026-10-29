// What it does: Final result screen showcasing total points, rank, program recommendations, sales CTA, and sharing.
// What it uses: config.js, copy.js, js/progress.js, js/links.js, js/events.js, js/engine/lock.js.
// What uses it: js/router.js.

import { CONFIG } from "../../config.js";
import { t } from "../copy.js";
import { getProgress, getGameSummary, getLevelSummary } from "../progress.js";
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
  const summary = getGameSummary(progress);
  const liveSiteUrl = CONFIG.siteUrl || window.location.origin;

  emit("result:view", {
    solved: summary.solvedCount,
    total: summary.totalPuzzles || 15,
    rank: summary.rank
  });

  const screen = document.createElement("div");
  screen.className = "result-screen";

  // Escape Room row if played
  if (summary.escape && summary.escape.roomsSolved > 0) {
    const escapeBanner = document.createElement("div");
    escapeBanner.className = "result-escape-banner";
    const escapeTimeStr = formatClock(summary.escape.seconds || 0);
    escapeBanner.innerHTML = `
      <span class="escape-banner-tag">Escape Room</span>
      <span>${summary.escape.roomsSolved} of 5 rooms, best time ${escapeTimeStr}</span>
    `;
    screen.appendChild(escapeBanner);
  }

  // Hero Card with Total Points & Rank
  const heroCard = document.createElement("div");
  heroCard.className = "card result-hero-card";

  const title = document.createElement("h1");
  title.className = "result-title";
  title.textContent = t("result.title");

  const pointsHuge = document.createElement("div");
  pointsHuge.className = "result-points-huge";
  pointsHuge.textContent = summary.points.toLocaleString("en-IN");

  const maxPointsSub = document.createElement("p");
  maxPointsSub.className = "result-points-sub";
  maxPointsSub.textContent = t("result.points", { max: "3,000" });

  const rankBadge = document.createElement("div");
  rankBadge.className = "result-rank-badge";
  rankBadge.textContent = summary.rank;

  const solvedSub = document.createElement("p");
  solvedSub.className = "result-solved-sub";
  solvedSub.textContent = t("result.solved", { n: summary.solvedCount, total: summary.totalPuzzles || 15 });

  // Level Breakdown Row
  const levelsRow = document.createElement("div");
  levelsRow.className = "result-levels-grid";

  ["beginner", "moderate", "expert"].forEach((lvlId) => {
    const lvlData = (summary.levels && summary.levels[lvlId]) || getLevelSummary(lvlId, progress) || { points: 0, stars: 0, solvedCount: 0 };
    const lvlCard = document.createElement("div");
    lvlCard.className = "result-level-item";

    const lvlName = document.createElement("span");
    lvlName.className = "result-level-name";
    lvlName.textContent = lvlId.charAt(0).toUpperCase() + lvlId.slice(1);

    const lvlScore = document.createElement("span");
    lvlScore.className = "result-level-score";
    lvlScore.textContent = `${lvlData.points} pts`;

    const lvlStars = document.createElement("span");
    lvlStars.className = "result-level-stars";
    lvlStars.textContent = "★".repeat(Math.min(lvlData.stars, 15));

    lvlCard.appendChild(lvlName);
    lvlCard.appendChild(lvlScore);
    lvlCard.appendChild(lvlStars);
    levelsRow.appendChild(lvlCard);
  });

  heroCard.appendChild(title);
  heroCard.appendChild(pointsHuge);
  heroCard.appendChild(maxPointsSub);
  heroCard.appendChild(rankBadge);
  heroCard.appendChild(solvedSub);
  heroCard.appendChild(levelsRow);
  screen.appendChild(heroCard);

  // The Program Card (WhatsApp + CTA)
  const progCard = document.createElement("div");
  progCard.className = "card result-program-card";

  const progHeading = document.createElement("h2");
  progHeading.className = "result-card-heading";
  progHeading.textContent = t("result.ctaTitle");

  const progBody = document.createElement("p");
  progBody.className = "result-card-body";
  progBody.textContent = `Master web development with our ${CONFIG.program.name}. ${t("result.ctaBody")}`;

  const isPresent = new URLSearchParams(window.location.search).get("present") === "1";
  if (isPresent) {
    progHeading.textContent = t("presenter.end");
    progBody.textContent = "Feel free to share your debugging thoughts or ask questions live in the session chat.";
  }

  const progActions = document.createElement("div");
  progActions.className = "result-card-actions";

  const waLink = salesUrl(summary, progress.path, CONFIG);
  if (!isPresent && CONFIG.salesWhatsApp && waLink) {
    const waBtn = document.createElement("a");
    waBtn.href = waLink;
    waBtn.target = "_blank";
    waBtn.rel = "noopener noreferrer";
    waBtn.className = "btn btn-primary result-sales-btn";
    waBtn.textContent = t("cta.whatsapp");
    waBtn.addEventListener("click", () => emit("whatsapp:click", { spot: "result", total: summary.points }));
    progActions.appendChild(waBtn);
  }

  const progBtn = document.createElement("a");
  progBtn.href = programUrl("result", CONFIG, "program");
  progBtn.target = "_blank";
  progBtn.rel = "noopener noreferrer";
  progBtn.className = "btn btn-secondary";
  progBtn.textContent = t("cta.program");
  progBtn.addEventListener("click", () => emit("program:click", { spot: "result" }));
  progActions.appendChild(progBtn);

  progCard.appendChild(progHeading);
  progCard.appendChild(progBody);
  progCard.appendChild(progActions);

  if (CONFIG.secondProgram?.name) {
    const secondLink = document.createElement("a");
    secondLink.href = programUrl("result", CONFIG, "second");
    secondLink.target = "_blank";
    secondLink.rel = "noopener noreferrer";
    secondLink.className = "result-second-program-link";
    secondLink.textContent = t("result.second", { program: CONFIG.secondProgram.name });
    progCard.appendChild(secondLink);
  }

  screen.appendChild(progCard);

  // Free Live Session Card (if enabled)
  if (CONFIG.session?.enabled) {
    const sessionCard = document.createElement("div");
    sessionCard.className = "card result-session-card";
    sessionCard.innerHTML = `
      <span class="session-label">${t("session.label")}</span>
      <h3 class="session-title">${CONFIG.session.title}</h3>
      <p class="session-when">${CONFIG.session.when}</p>
      <a href="${CONFIG.session.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">${t("session.btn")}</a>
    `;
    screen.appendChild(sessionCard);
  }

  // Share Card with dynamic image synthesis, Status/Post sizes, WhatsApp & Copy link
  const shareCard = createShareCard({ summary, isEscape: false });
  screen.appendChild(shareCard);

  // Footer Actions: Play Again & Back to Levels
  const footerActions = document.createElement("div");
  footerActions.className = "result-footer-actions";

  const againBtn = document.createElement("a");
  againBtn.href = "#/start";
  againBtn.className = "btn btn-secondary";
  againBtn.textContent = t("result.again");

  const backLevelsBtn = document.createElement("a");
  backLevelsBtn.href = "#/";
  backLevelsBtn.className = "btn btn-secondary";
  backLevelsBtn.textContent = "Back to home";

  footerActions.appendChild(againBtn);
  footerActions.appendChild(backLevelsBtn);
  screen.appendChild(footerActions);

  rootContainer.appendChild(screen);
}
