// What it does: Hint disclosure button and drawer showing incremental hints with point cost notices.
// What it uses: js/copy.js, DOM elements.
// What uses it: js/screens/spot.js, js/screens/edit.js, js/screens/room.js.

import { t } from "../copy.js";

export function createHints({ hints = [], cost = 10, onHintOpen = null }) {
  const root = document.createElement("div");
  root.className = "hint-btn-wrapper";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn btn-secondary";
  btn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
    <span class="hint-btn-label">${t("hint.button")}</span>
  `;

  const drawer = document.createElement("div");
  drawer.className = "hint-drawer";
  drawer.style.display = "none";

  root.appendChild(btn);
  root.appendChild(drawer);

  let openedCount = 0;

  function updateDrawer() {
    drawer.replaceChildren();
    if (openedCount === 0) {
      drawer.style.display = "none";
      return;
    }
    drawer.style.display = "block";

    for (let i = 0; i < openedCount; i++) {
      const item = document.createElement("div");
      item.className = "hint-item";
      item.textContent = `${i + 1}. ${hints[i]}`;
      drawer.appendChild(item);
    }

    if (openedCount < hints.length) {
      const costNote = document.createElement("div");
      costNote.className = "hint-cost-note";
      costNote.style.marginTop = "0.5rem";
      costNote.textContent = t("hint.cost", {
        n: openedCount + 1,
        cost: cost
      });
      drawer.appendChild(costNote);
    }
  }

  btn.addEventListener("click", () => {
    if (openedCount < hints.length) {
      openedCount++;
      updateDrawer();
      if (typeof onHintOpen === "function") {
        onHintOpen(openedCount);
      }
    } else {
      // Toggle drawer visibility if all opened
      drawer.style.display = drawer.style.display === "none" ? "block" : "none";
    }
  });

  function pulse() {
    btn.classList.add("pulse-once");
    setTimeout(() => {
      btn.classList.remove("pulse-once");
    }, 600);
  }

  return {
    el: root,
    pulse,
    getOpenedCount: () => openedCount
  };
}
