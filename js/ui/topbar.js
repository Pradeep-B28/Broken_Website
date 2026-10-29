// What it does: Shared puzzle screen top bar with back navigation, level breadcrumb, timer, and points badge.
// What it uses: config.js, js/copy.js, js/engine/lock.js, DOM methods.
// What uses it: js/screens/spot.js, js/screens/edit.js.

import { t } from "../copy.js";
import { formatClock } from "../engine/lock.js";

export function createPuzzleTopbar({ level = "beginner", puzzleId = "b1", totalPuzzles = 5, initialPoints = 100 }) {
  const root = document.createElement("div");
  root.className = "puzzle-topbar";

  const levelCap = level.charAt(0).toUpperCase() + level.slice(1);

  const topLeft = document.createElement("div");
  topLeft.className = "puzzle-topbar-left";

  const backLink = document.createElement("a");
  backLink.href = `#/level/${level}`;
  backLink.className = "puzzle-back-link";
  backLink.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
    <span>${levelCap}</span>
  `;

  const breadcrumb = document.createElement("span");
  breadcrumb.className = "puzzle-breadcrumb";
  breadcrumb.textContent = t("puzzle.of", {
    level: levelCap,
    n: puzzleId.slice(1),
    total: totalPuzzles
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
  pointsBadge.textContent = t("puzzle.pointsLeft", { n: initialPoints });

  topRight.appendChild(timerEl);
  topRight.appendChild(pointsBadge);

  root.appendChild(topLeft);
  root.appendChild(topRight);

  return {
    el: root,
    setPoints: (n) => {
      pointsBadge.textContent = t("puzzle.pointsLeft", { n });
    },
    setTime: (seconds) => {
      timerEl.textContent = formatClock(seconds);
    }
  };
}