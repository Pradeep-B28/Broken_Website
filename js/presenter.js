// What it does: Presenter mode for live demonstration sessions with enlarged code font, keyboard switching, and shortcuts map.
// What it uses: config.js, js/copy.js, js/router.js, DOM elements.
// What uses it: js/main.js.

import { CONFIG } from "../config.js";
import { t } from "./copy.js";
import { navigate, getCurrentPath } from "./router.js";

let shortcutsModal = null;

export function isPresenterMode() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("present") === "1" && CONFIG.features.presenterMode;
}

export function initPresenter() {
  if (!isPresenterMode()) return;

  document.documentElement.classList.add("presenter-mode");

  // Add Presenter Mode badge in header
  const headerContent = document.querySelector(".header-content");
  if (headerContent) {
    const badge = document.createElement("span");
    badge.className = "presenter-badge";
    badge.style.cssText = "background: var(--brand); color:#fff; font-size:0.75rem; font-weight:800; padding:4px 10px; border-radius:999px; margin-left:8px;";
    badge.textContent = "PRESENTER";
    headerContent.appendChild(badge);
  }

  // Register global presenter hotkeys
  window.addEventListener("keydown", (e) => {
    // Ignore hotkeys when typing in textareas or inputs
    const targetTag = e.target?.tagName?.toLowerCase();
    if (targetTag === "input" || targetTag === "textarea") return;

    const path = getCurrentPath() || window.location.hash || "";

    // Keys 1 to 5: switch puzzle of current level
    if (["1", "2", "3", "4", "5"].includes(e.key)) {
      const match = path.match(/#\/?puzzle\/([bme])([1-5])/);
      if (match) {
        const prefix = match[1];
        navigate(`#/puzzle/${prefix}${e.key}`);
      }
      return;
    }

    // Key H: open next hint
    if (e.key === "h" || e.key === "H") {
      const hintBtn = document.querySelector(".hint-drawer-btn") || document.querySelector(".hints-toggle-btn");
      if (hintBtn) hintBtn.click();
      return;
    }

    // Key S: show the fix
    if (e.key === "s" || e.key === "S") {
      const showFixBtn = Array.from(document.querySelectorAll("button")).find(
        (b) => b.textContent.includes("Show the fix")
      );
      if (showFixBtn) showFixBtn.click();
      return;
    }

    // Key ?: toggle keyboard map
    if (e.key === "?") {
      toggleShortcutsModal();
    }
  });
}

export function toggleShortcutsModal() {
  if (shortcutsModal) {
    shortcutsModal.remove();
    shortcutsModal = null;
    return;
  }

  shortcutsModal = document.createElement("div");
  shortcutsModal.className = "shortcuts-modal-overlay";
  shortcutsModal.style.cssText = `
    position: fixed; inset: 0; background: rgba(15, 23, 42, 0.65);
    display: flex; align-items: center; justify-content: center;
    z-index: 999999; backdrop-filter: blur(4px);
  `;

  const card = document.createElement("div");
  card.className = "card shortcuts-card";
  card.style.cssText = "max-width: 480px; width: 90%; padding: 2rem; border-radius: 16px;";

  const heading = document.createElement("h2");
  heading.style.cssText = "margin: 0 0 1rem; font-size: 1.25rem; font-weight: 800;";
  heading.textContent = "Keyboard Shortcuts";

  const list = document.createElement("div");
  list.style.cssText = "display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.9375rem;";

  const shortcuts = [
    { key: "1 - 5", desc: "Jump to puzzle 1 to 5" },
    { key: "H", desc: "Open next hint" },
    { key: "S", desc: "Show the fix" },
    { key: "Ctrl + Enter", desc: "Run checks on code" },
    { key: "← / →", desc: "Move before/after comparison slider" },
    { key: "?", desc: "Toggle this shortcut guide" }
  ];

  shortcuts.forEach(({ key, desc }) => {
    const row = document.createElement("div");
    row.style.cssText = "display: flex; justify-content: space-between; align-items: center;";

    const descSpan = document.createElement("span");
    descSpan.textContent = desc;

    const kbd = document.createElement("kbd");
    kbd.style.cssText = "background: var(--surface-2); border: 1px solid var(--border); border-radius: 6px; padding: 3px 8px; font-family: var(--font-mono); font-size: 0.8125rem; font-weight: 700;";
    kbd.textContent = key;

    row.appendChild(descSpan);
    row.appendChild(kbd);
    list.appendChild(row);
  });

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "btn btn-primary";
  closeBtn.style.cssText = "margin-top: 1.5rem; width: 100%;";
  closeBtn.textContent = "Got it";
  closeBtn.addEventListener("click", () => {
    shortcutsModal.remove();
    shortcutsModal = null;
  });

  card.appendChild(heading);
  card.appendChild(list);
  card.appendChild(closeBtn);
  shortcutsModal.appendChild(card);

  shortcutsModal.addEventListener("click", (e) => {
    if (e.target === shortcutsModal) {
      shortcutsModal.remove();
      shortcutsModal = null;
    }
  });

  document.body.appendChild(shortcutsModal);
}
