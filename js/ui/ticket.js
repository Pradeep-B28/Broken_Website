// What it does: Client support ticket card displaying client details, issue text, symptom, and acceptance criteria.
// What it uses: js/copy.js, DOM elements.
// What uses it: js/screens/spot.js, js/screens/edit.js.

import { t } from "../copy.js";

export function createTicket({ site = {}, puzzle = {} }) {
  const root = document.createElement("div");
  root.className = "ticket-card";

  const header = document.createElement("div");
  header.className = "ticket-header";

  const from = document.createElement("span");
  from.className = "ticket-from";
  from.textContent = t("puzzle.from", {
    client: site.client || "Client",
    site: site.name || "Website"
  });
  header.appendChild(from);

  const text = document.createElement("p");
  text.className = "ticket-text";
  text.textContent = puzzle.ticket || "";

  const symptom = document.createElement("div");
  symptom.className = "ticket-symptom";
  symptom.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; margin-top:2px;">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
    <span class="symptom-text"></span>
  `;
  symptom.querySelector(".symptom-text").textContent = puzzle.symptom || "";

  root.appendChild(header);
  root.appendChild(text);
  root.appendChild(symptom);

  // Acceptance Checklist (Moderate and Expert)
  const acceptanceItems = [];
  if (Array.isArray(puzzle.accept) && puzzle.accept.length > 0) {
    const accWrap = document.createElement("div");
    accWrap.className = "ticket-acceptance";

    const accTitle = document.createElement("div");
    accTitle.className = "acceptance-title";
    accTitle.textContent = "Acceptance";
    accWrap.appendChild(accTitle);

    const list = document.createElement("ul");
    list.className = "acceptance-list";

    puzzle.accept.forEach((crit, idx) => {
      const li = document.createElement("li");
      li.className = "acceptance-item";

      const checkIcon = document.createElement("span");
      checkIcon.className = "acceptance-icon";
      checkIcon.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        </svg>
      `;

      const span = document.createElement("span");
      span.className = "acceptance-text";
      span.textContent = crit;

      li.appendChild(checkIcon);
      li.appendChild(span);
      list.appendChild(li);

      acceptanceItems.push({ el: li, icon: checkIcon });
    });

    accWrap.appendChild(list);
    root.appendChild(accWrap);
  }

  function updateAcceptance(passedCount, totalCount) {
    if (acceptanceItems.length === 0) return;
    const allPass = passedCount === totalCount && totalCount > 0;
    acceptanceItems.forEach((item, idx) => {
      // If all checks pass, all acceptance pass; or proportionally tick
      const isItemPassed = allPass || (idx < passedCount);
      item.el.classList.toggle("is-passed", isItemPassed);
      item.icon.innerHTML = isItemPassed
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--fixed);">
             <polyline points="20 6 9 17 4 12"></polyline>
           </svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
           </svg>`;
    });
  }

  return {
    el: root,
    updateAcceptance
  };
}