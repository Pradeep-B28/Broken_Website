// What it does: Animated test runner results display showing status icons, test names, failure notes, and live summaries.
// What it uses: js/copy.js, DOM elements.
// What uses it: js/screens/spot.js, js/screens/edit.js.

import { t } from "../copy.js";

export function createChecksList({ checks = [] }) {
  const root = document.createElement("div");
  root.className = "checks-card";

  const summary = document.createElement("div");
  summary.className = "checks-summary";
  summary.setAttribute("aria-live", "polite");
  summary.textContent = `0 of ${checks.length} checks run`;

  const list = document.createElement("div");
  list.className = "checks-list";

  root.appendChild(summary);
  root.appendChild(list);

  async function renderResults(results) {
    list.replaceChildren();
    let passedCount = 0;

    for (let i = 0; i < results.length; i++) {
      const res = results[i];
      if (res.pass) passedCount++;

      const row = document.createElement("div");
      row.className = "check-row";

      const icon = document.createElement("span");
      icon.className = "check-icon";
      if (res.pass) {
        icon.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>`;
      } else {
        icon.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E11D48" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>`;
      }

      const info = document.createElement("div");
      info.className = "check-info";

      const name = document.createElement("span");
      name.className = "check-name";
      name.textContent = res.name;

      info.appendChild(name);

      if (!res.pass && res.msg) {
        const msg = document.createElement("span");
        msg.className = "check-msg";
        msg.textContent = res.msg;
        info.appendChild(msg);
      }

      row.appendChild(icon);
      row.appendChild(info);
      list.appendChild(row);

      summary.textContent = t("edit.summary", {
        n: passedCount,
        total: results.length
      });

      // Small delay between rows landing
      await new Promise((r) => setTimeout(r, 80));
    }

    summary.textContent = t("edit.summary", {
      n: passedCount,
      total: results.length
    });

    return passedCount === results.length;
  }

  return {
    el: root,
    renderResults
  };
}
