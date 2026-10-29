// What it does: Level overview screen listing client site details, 5 puzzle cards, status badges, and progress bar.
// What it uses: config.js, copy.js, js/content.js, js/progress.js, js/events.js.
// What uses it: js/router.js.

import { t } from "../copy.js";
import { getLevel, getSite, getPuzzles } from "../content.js";
import { getProgress, isUnlocked, getLevelSummary } from "../progress.js";
import { emit } from "../events.js";

let rootContainer = null;

export function mount(container) {
  rootContainer = container;
}

export function enter(params) {
  const levelId = params?.level || "beginner";
  render(levelId);
}

export function leave() {}

function render(levelId) {
  if (!rootContainer) return;
  rootContainer.replaceChildren();

  const level = getLevel(levelId) || { id: levelId, name: levelId, site: "kaapi" };
  const site = getSite(level.site);
  const puzzles = getPuzzles(levelId);
  const progress = getProgress();
  const summary = getLevelSummary(levelId, progress);

  emit("level:open", { level: levelId });

  const screen = document.createElement("div");
  screen.className = "level-screen";

  // Top Bar Navigation
  const topbar = document.createElement("div");
  topbar.className = "level-topbar";
  topbar.innerHTML = `
    <div class="level-topbar-left">
      <a href="#/" class="level-back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg> Home
      </a>
      <span class="level-breadcrumb">${level.name}</span>
    </div>
    <div class="level-topbar-right">
      <a href="#/start" class="level-change-link">${t("picker.change")}</a>
    </div>
  `;
  screen.appendChild(topbar);

  // Client Site Card
  const siteCard = document.createElement("div");
  siteCard.className = "card level-site-card";
  siteCard.innerHTML = `
    <div class="site-card-header">
      <div class="site-card-meta">
        <span class="site-client-tag">Client: ${site?.client || "Owner"}</span>
        <span class="site-kind-tag">${site?.kind || "Website"}</span>
      </div>
      <h1 class="site-card-title">${site?.name || "Client Site"}</h1>
      <p class="site-card-domain">https://${site?.domain || "example.com"}/</p>
    </div>
    <div class="site-card-progress">
      <div class="site-progress-label">
        <span>${t("level.restored", { n: summary.solvedCount, total: puzzles.length })}</span>
        <span class="site-progress-score">${summary.points} pts</span>
      </div>
      <div class="site-progress-track">
        <div class="site-progress-bar" style="width: ${(summary.solvedCount / puzzles.length) * 100}%"></div>
      </div>
    </div>
  `;
  screen.appendChild(siteCard);

  // All 5 Done Celebration Banner
  if (summary.solvedCount === puzzles.length && puzzles.length > 0) {
    const doneBanner = document.createElement("div");
    doneBanner.className = "level-all-done-banner";
    doneBanner.innerHTML = `
      <span>All ${puzzles.length} puzzles fixed!</span>
      <a href="#/done/${levelId}" class="btn btn-primary btn-sm">See restored site</a>
    `;
    screen.appendChild(doneBanner);
  }

  // Five Puzzle Cards
  const grid = document.createElement("div");
  grid.className = "level-puzzles-grid";

  puzzles.forEach((p, idx) => {
    const puzzleNum = idx + 1;
    const unlocked = isUnlocked(levelId, p.id, progress);
    const pData = progress.puzzles[p.id];
    const isSolved = Boolean(pData && pData.solved);
    const isRevealed = Boolean(pData && pData.revealed);

    const card = document.createElement("div");
    card.className = `puzzle-card ${!unlocked ? "is-locked" : ""} ${isSolved ? "is-solved" : ""}`;

    // Header with number and device icon
    const cardHeader = document.createElement("div");
    cardHeader.className = "puzzle-card-header";

    const numSpan = document.createElement("span");
    numSpan.className = "puzzle-num-badge";
    numSpan.textContent = `Puzzle ${puzzleNum}`;

    const deviceIcon = document.createElement("span");
    deviceIcon.className = "puzzle-device-icon";
    deviceIcon.title = p.device === "phone" ? "Mobile view" : "Laptop view";
    if (p.device === "phone") {
      deviceIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`;
    } else {
      deviceIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`;
    }

    cardHeader.appendChild(numSpan);
    cardHeader.appendChild(deviceIcon);
    card.appendChild(cardHeader);

    // Title
    const title = document.createElement("h2");
    title.className = "puzzle-card-title";
    title.textContent = p.title;
    card.appendChild(title);

    // Concept Chips
    if (p.concepts && p.concepts.length > 0) {
      const conceptsWrap = document.createElement("div");
      conceptsWrap.className = "puzzle-concepts-row";
      p.concepts.forEach((c) => {
        const chip = document.createElement("span");
        chip.className = "concept-chip";
        chip.textContent = c;
        conceptsWrap.appendChild(chip);
      });
      card.appendChild(conceptsWrap);
    }

    // Status and Score Footer
    const footer = document.createElement("div");
    footer.className = "puzzle-card-footer";

    if (!unlocked) {
      const lockNote = document.createElement("span");
      lockNote.className = "puzzle-status-locked";
      lockNote.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> ${t("level.locked", { n: puzzleNum - 1 })}`;
      footer.appendChild(lockNote);
    } else if (isSolved) {
      const statusBadge = document.createElement("span");
      statusBadge.className = isRevealed ? "puzzle-status-seen" : "puzzle-status-fixed";
      statusBadge.textContent = isRevealed ? t("level.status.seen") : t("level.status.fixed");

      const scoreInfo = document.createElement("div");
      scoreInfo.className = "puzzle-score-info";
      const starsSpan = document.createElement("span");
      starsSpan.className = "puzzle-stars";
      starsSpan.textContent = "★".repeat(pData.stars || 0) + "☆".repeat(3 - (pData.stars || 0));
      const ptsSpan = document.createElement("span");
      ptsSpan.className = "puzzle-pts";
      ptsSpan.textContent = `${pData.points || 0} pts`;

      scoreInfo.appendChild(starsSpan);
      scoreInfo.appendChild(ptsSpan);
      footer.appendChild(statusBadge);
      footer.appendChild(scoreInfo);
    } else {
      const newBadge = document.createElement("span");
      newBadge.className = "puzzle-status-new";
      newBadge.textContent = t("level.status.new");
      footer.appendChild(newBadge);
    }

    card.appendChild(footer);

    if (unlocked) {
      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        window.location.hash = `#/puzzle/${p.id}`;
      });
    }

    grid.appendChild(card);
  });

  screen.appendChild(grid);
  rootContainer.appendChild(screen);
}
