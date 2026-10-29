// What it does: Celebratory solved summary card with fixed stamp, star rating, point counter, and technical explanation.
// What it uses: js/copy.js, DOM elements.
// What uses it: js/screens/spot.js, js/screens/edit.js.

import { t } from "../copy.js";

export function createSolvedCard({
  puzzle = {},
  points = 100,
  starsCount = 3,
  isLast = false,
  onNext = null,
  onBack = null
}) {
  const root = document.createElement("div");
  root.className = "solved-card";

  const header = document.createElement("div");
  header.className = "solved-header";

  const stamp = document.createElement("div");
  stamp.className = "solved-stamp";
  stamp.textContent = t("solved.stamp");

  const scoreRow = document.createElement("div");
  scoreRow.className = "solved-score-row";

  const pointsEl = document.createElement("span");
  pointsEl.className = "solved-points";
  pointsEl.textContent = `+${points} pts`;

  const starsEl = document.createElement("div");
  starsEl.className = "solved-stars";
  for (let i = 0; i < 3; i++) {
    const star = document.createElement("span");
    star.className = "star-icon";
    star.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="${i < starsCount ? "#FBBF24" : "none"}" stroke="#FBBF24" stroke-width="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>`;
    starsEl.appendChild(star);
  }

  scoreRow.appendChild(pointsEl);
  scoreRow.appendChild(starsEl);
  header.appendChild(stamp);
  header.appendChild(scoreRow);

  // Explanation Section
  const explain = document.createElement("div");
  explain.className = "solved-explanation";

  const expData = puzzle.explain || {};
  const sections = [
    { label: t("solved.what"), text: expData.what },
    { label: t("solved.why"), text: expData.why },
    { label: t("solved.tip"), text: expData.tip }
  ];

  sections.forEach(({ label, text }) => {
    if (!text) return;
    const sec = document.createElement("div");
    sec.className = "explain-section";
    const lbl = document.createElement("span");
    lbl.className = "explain-label";
    lbl.textContent = label;
    const p = document.createElement("p");
    p.className = "explain-text";
    p.textContent = text;
    sec.appendChild(lbl);
    sec.appendChild(p);
    explain.appendChild(sec);
  });

  if (puzzle.concepts && puzzle.concepts.length > 0) {
    const chipsRow = document.createElement("div");
    chipsRow.className = "concepts-row";
    puzzle.concepts.forEach((c) => {
      const chip = document.createElement("span");
      chip.className = "concept-chip";
      chip.textContent = c;
      chipsRow.appendChild(chip);
    });
    explain.appendChild(chipsRow);
  }

  // Action Buttons
  const actions = document.createElement("div");
  actions.className = "solved-actions";

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "btn btn-primary";
  nextBtn.textContent = isLast ? t("solved.site") : t("solved.next");
  nextBtn.addEventListener("click", () => {
    if (typeof onNext === "function") onNext();
  });

  const backBtn = document.createElement("button");
  backBtn.type = "button";
  backBtn.className = "btn btn-secondary";
  backBtn.textContent = t("solved.back");
  backBtn.addEventListener("click", () => {
    if (typeof onBack === "function") onBack();
  });

  actions.appendChild(nextBtn);
  actions.appendChild(backBtn);

  root.appendChild(header);
  root.appendChild(explain);
  root.appendChild(actions);

  return {
    el: root
  };
}
