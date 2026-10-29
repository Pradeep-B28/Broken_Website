// What it does: Level picker screen allowing players to select their skill path and experience level.
// What it uses: copy.js, js/progress.js, js/events.js.
// What uses it: js/router.js.

import { t } from "../copy.js";
import { setPath } from "../progress.js";
import { emit } from "../events.js";

let rootContainer = null;

export function mount(container) {
  rootContainer = container;
}

export function enter() {
  render();
}

export function leave() {}

function render() {
  if (!rootContainer) return;
  rootContainer.replaceChildren();

  const screen = document.createElement("div");
  screen.className = "picker-screen";

  const title = document.createElement("h1");
  title.className = "picker-title";
  title.textContent = t("picker.title");
  screen.appendChild(title);

  const cardsContainer = document.createElement("div");
  cardsContainer.className = "picker-cards-grid";

  const options = [
    {
      id: "escape",
      title: t("picker.never"),
      desc: t("picker.neverSub"),
      route: "#/escape",
      iconSvg: `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      `
    },
    {
      id: "beginner",
      title: t("picker.little"),
      desc: t("picker.littleSub"),
      route: "#/level/beginner",
      iconSvg: `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      `
    },
    {
      id: "moderate",
      title: t("picker.some"),
      desc: t("picker.someSub"),
      route: "#/level/moderate",
      iconSvg: `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      `
    },
    {
      id: "expert",
      title: t("picker.lots"),
      desc: t("picker.lotsSub"),
      route: "#/level/expert",
      iconSvg: `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      `
    }
  ];

  options.forEach((opt, idx) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "picker-card";
    card.style.animationDelay = `${idx * 60}ms`;

    const iconWrapper = document.createElement("div");
    iconWrapper.className = "picker-card-icon";
    iconWrapper.innerHTML = opt.iconSvg;

    const contentWrapper = document.createElement("div");
    contentWrapper.className = "picker-card-content";

    const cardTitle = document.createElement("h2");
    cardTitle.className = "picker-card-title";
    cardTitle.textContent = opt.title;

    const cardDesc = document.createElement("p");
    cardDesc.className = "picker-card-desc";
    cardDesc.textContent = opt.desc;

    contentWrapper.appendChild(cardTitle);
    contentWrapper.appendChild(cardDesc);

    card.appendChild(iconWrapper);
    card.appendChild(contentWrapper);

    card.addEventListener("click", () => {
      card.classList.add("is-selected");
      setPath(opt.id);
      emit("path:choose", { path: opt.id });

      setTimeout(() => {
        screen.classList.add("is-sliding-out");
        setTimeout(() => {
          window.location.hash = opt.route;
        }, 180);
      }, 200);
    });

    cardsContainer.appendChild(card);
  });

  screen.appendChild(cardsContainer);

  const sub = document.createElement("p");
  sub.className = "picker-switch-note";
  sub.textContent = t("picker.switch");
  screen.appendChild(sub);

  rootContainer.appendChild(screen);
}
