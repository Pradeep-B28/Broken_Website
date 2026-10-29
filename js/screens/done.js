// What it does: Level complete screen celebrating restored sites with interactive before/after slider, points, and progression.
// What it uses: config.js, copy.js, js/content.js, js/progress.js, js/events.js, js/sound.js, js/ui/beforeAfter.js.
// What uses it: js/router.js.

import { CONFIG } from "../../config.js";
import { t } from "../copy.js";
import { getLevel, getSite, getPuzzles } from "../content.js";
import { getProgress, getLevelSummary } from "../progress.js";
import { emit } from "../events.js";
import { playLevelDone } from "../sound.js";
import { createBeforeAfterSlider } from "../ui/beforeAfter.js";

let rootContainer = null;
let sliderComponent = null;

export function mount(container) {
  rootContainer = container;
}

export function enter(params) {
  const levelId = params?.level || "beginner";
  render(levelId);
}

export function leave() {
  if (sliderComponent && typeof sliderComponent.destroy === "function") {
    sliderComponent.destroy();
    sliderComponent = null;
  }
}

function render(levelId) {
  if (!rootContainer) return;
  rootContainer.replaceChildren();

  const level = getLevel(levelId) || { id: levelId, name: levelId, site: "kaapi" };
  const site = getSite(level.site);
  const puzzles = getPuzzles(levelId);
  const progress = getProgress();
  const summary = getLevelSummary(levelId, progress);

  emit("level:done", {
    level: levelId,
    points: summary.points,
    stars: summary.stars
  });
  playLevelDone();

  const screen = document.createElement("div");
  screen.className = "done-screen";

  // Header celebration card
  const headerCard = document.createElement("div");
  headerCard.className = "card done-header-card";

  const siteTitle = document.createElement("h1");
  siteTitle.className = "done-title";
  siteTitle.textContent = t("done.title", { site: site?.name || "Client site" });

  const statsRow = document.createElement("div");
  statsRow.className = "done-stats-row";

  const pointsBadge = document.createElement("div");
  pointsBadge.className = "done-stat-badge";
  pointsBadge.innerHTML = `<span class="stat-value">${summary.points}</span><span class="stat-label">of ${CONFIG.scoring[levelId]?.max * 5 || 500} pts</span>`;

  const starsBadge = document.createElement("div");
  starsBadge.className = "done-stat-badge";
  starsBadge.innerHTML = `<span class="stat-value">${"★".repeat(Math.min(summary.stars, 15))}</span><span class="stat-label">stars earned</span>`;

  const solvedBadge = document.createElement("div");
  solvedBadge.className = "done-stat-badge";
  solvedBadge.innerHTML = `<span class="stat-value">${summary.solvedCount} of 5</span><span class="stat-label">puzzles fixed</span>`;

  statsRow.appendChild(pointsBadge);
  statsRow.appendChild(starsBadge);
  statsRow.appendChild(solvedBadge);

  headerCard.appendChild(siteTitle);
  headerCard.appendChild(statsRow);
  screen.appendChild(headerCard);

  // Before & After Slider
  if (CONFIG.features.beforeAfter && puzzles.length > 0) {
    const sliderSection = document.createElement("div");
    sliderSection.className = "card done-slider-card";

    const sliderHeading = document.createElement("div");
    sliderHeading.className = "done-slider-heading";
    sliderHeading.textContent = t("done.drag");
    sliderSection.appendChild(sliderHeading);

    sliderComponent = createBeforeAfterSlider({
      puzzles,
      site,
      initialPuzzleIndex: 4
    });
    sliderSection.appendChild(sliderComponent.el);
    screen.appendChild(sliderSection);
  }

  // Action Buttons
  const actionsCard = document.createElement("div");
  actionsCard.className = "done-actions-card";

  const nextRoute = levelId === "beginner" ? "#/level/moderate" : levelId === "moderate" ? "#/level/expert" : "#/result";
  const nextLabel = levelId === "expert" ? t("home.result") : t("done.next");

  const nextBtn = document.createElement("a");
  nextBtn.href = nextRoute;
  nextBtn.className = "btn btn-primary done-next-btn";
  nextBtn.textContent = nextLabel;

  const resultBtn = document.createElement("a");
  resultBtn.href = "#/result";
  resultBtn.className = "btn btn-secondary done-result-btn";
  resultBtn.textContent = t("home.result");

  actionsCard.appendChild(nextBtn);
  if (levelId !== "expert") {
    actionsCard.appendChild(resultBtn);
  }
  screen.appendChild(actionsCard);

  rootContainer.appendChild(screen);
}
