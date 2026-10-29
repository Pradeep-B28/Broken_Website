// What it does: Museum doors opening animation with audio thunk/chime and post-escape explanation card.
// What it uses: copy.js, js/sound.js.
// What uses it: js/screens/room.js.

import { t } from "../copy.js";
import { playThunk, playChime } from "../sound.js";

export function playDoorsAnimation(targetContainer) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "doors-overlay";

    const leftDoor = document.createElement("div");
    leftDoor.className = "door-panel door-panel--left";

    const rightDoor = document.createElement("div");
    rightDoor.className = "door-panel door-panel--right";

    const lightLine = document.createElement("div");
    lightLine.className = "door-light-line";

    overlay.appendChild(leftDoor);
    overlay.appendChild(rightDoor);
    overlay.appendChild(lightLine);
    targetContainer.appendChild(overlay);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      playThunk();
      setTimeout(() => {
        playChime();
        overlay.style.opacity = "0";
        overlay.style.transition = "opacity 200ms ease";
        setTimeout(() => {
          overlay.remove();
          resolve();
        }, 200);
      }, 400);
      return;
    }

    // Sequence:
    // 1. Initial closed state (panels centered, light line starts glow)
    setTimeout(() => {
      lightLine.classList.add("is-glowing");
      playThunk();
    }, 150);

    // 2. Unlock & chime, doors slide apart over 700 ms
    setTimeout(() => {
      playChime();
      lightLine.classList.remove("is-glowing");
      leftDoor.classList.add("is-opening");
      rightDoor.classList.add("is-opening");
    }, 550);

    // 3. Clean up after doors slide open (550 + 750 = 1300 ms)
    setTimeout(() => {
      overlay.remove();
      resolve();
    }, 1350);
  });
}

export function createRoomSolvedCard({
  room,
  points,
  starsCount,
  isLast,
  onNext
}) {
  const card = document.createElement("div");
  card.className = "card room-solved-card";

  const header = document.createElement("div");
  header.className = "room-solved-header";

  const title = document.createElement("h2");
  title.className = "room-solved-title";
  title.textContent = t("room.did");

  const scoreBadge = document.createElement("div");
  scoreBadge.className = "solved-score-badge";

  const ptsText = document.createElement("span");
  ptsText.className = "solved-points";
  ptsText.textContent = `+${points} pts`;

  const starsEl = document.createElement("div");
  starsEl.className = "solved-stars";
  for (let i = 0; i < 3; i++) {
    const star = document.createElement("span");
    star.className = `star-icon ${i < starsCount ? "is-filled" : ""}`;
    star.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="${i < starsCount ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    `;
    starsEl.appendChild(star);
  }

  scoreBadge.appendChild(ptsText);
  scoreBadge.appendChild(starsEl);
  header.appendChild(title);
  header.appendChild(scoreBadge);
  card.appendChild(header);

  // Concepts
  if (room.concepts && room.concepts.length > 0) {
    const chips = document.createElement("div");
    chips.className = "room-concepts-row";
    room.concepts.forEach((concept) => {
      const chip = document.createElement("span");
      chip.className = "concept-chip";
      chip.textContent = concept;
      chips.appendChild(chip);
    });
    card.appendChild(chips);
  }

  // Explanation blocks
  const explain = room.explain || {};
  const sections = [
    { title: t("solved.what"), text: explain.what },
    { title: t("solved.why"), text: explain.why },
    { title: t("solved.tip"), text: explain.tip }
  ];

  sections.forEach((sec) => {
    if (!sec.text) return;
    const block = document.createElement("div");
    block.className = "solved-explain-block";

    const h4 = document.createElement("h4");
    h4.className = "solved-explain-title";
    h4.textContent = sec.title;

    const p = document.createElement("p");
    p.className = "solved-explain-text";
    p.textContent = sec.text;

    block.appendChild(h4);
    block.appendChild(p);
    card.appendChild(block);
  });

  // Action Button
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn btn-primary room-next-btn";
  btn.textContent = isLast ? "Finish escape" : t("room.next");
  btn.addEventListener("click", () => {
    if (typeof onNext === "function") {
      onNext();
    }
  });
  card.appendChild(btn);

  return { el: card };
}
