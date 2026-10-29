// What it does: Client support ticket card displaying owner, issue description, symptom, and acceptance criteria.
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

  return {
    el: root
  };
}
