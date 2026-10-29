// What it does: Home screen featuring interactive 3D hero preview loop, start/continue CTA, level cards, and how-it-works.
// What it uses: config.js, copy.js, js/content.js, js/progress.js, js/ui/browser.js.
// What uses it: js/router.js.

import { CONFIG } from "../../config.js";
import { t } from "../copy.js";
import { getPuzzle, getFixedFiles, getSite, getRooms } from "../content.js";
import { getProgress, getLevelSummary } from "../progress.js";
import { formatClock } from "../engine/lock.js";
import { createBrowserFrame } from "../ui/browser.js";

let rootContainer = null;
let heroLoopTimer = null;
let heroBrowserComponent = null;

export function mount(container) {
  rootContainer = container;
}

export function enter() {
  render();
}

export function leave() {
  if (heroLoopTimer) {
    clearInterval(heroLoopTimer);
    heroLoopTimer = null;
  }
  if (heroBrowserComponent) {
    heroBrowserComponent.destroy();
    heroBrowserComponent = null;
  }
}

function render() {
  if (!rootContainer) return;
  rootContainer.replaceChildren();

  const progress = getProgress();
  const screen = document.createElement("div");
  screen.className = "home-screen";

  // --- Hero Section ---
  const heroSection = document.createElement("section");
  heroSection.className = "home-hero-section";

  const heroTextCol = document.createElement("div");
  heroTextCol.className = "home-hero-text";

  const eyebrow = document.createElement("span");
  eyebrow.className = "home-eyebrow";
  eyebrow.textContent = t("home.eyebrow");

  const title = document.createElement("h1");
  title.className = "home-title";
  title.innerHTML = `The <span class="home-title-broken">Broken</span> Website`;

  const subtitle = document.createElement("p");
  subtitle.className = "home-subtitle";
  subtitle.textContent = t("home.subtitle");

  // Determine Start vs Continue action
  const ctaBtn = document.createElement("a");
  ctaBtn.className = "btn btn-primary btn-lg home-start-btn";

  if (!progress.path) {
    ctaBtn.href = "#/start";
    ctaBtn.textContent = t("home.start");
  } else {
    ctaBtn.textContent = t("home.continue");
    if (progress.path === "escape") {
      const rooms = getRooms();
      const firstUnsolved = rooms.find((r) => !progress.rooms[r.id]?.solved) || rooms[0];
      ctaBtn.href = `#/room/${firstUnsolved.id}`;
    } else {
      const pfx = progress.path === "beginner" ? "b" : progress.path === "moderate" ? "m" : "e";
      let nextId = `${pfx}1`;
      for (let i = 1; i <= 5; i++) {
        if (!progress.puzzles[`${pfx}${i}`]?.solved) {
          nextId = `${pfx}${i}`;
          break;
        }
      }
      ctaBtn.href = `#/puzzle/${nextId}`;
    }
  }

  heroTextCol.appendChild(eyebrow);
  heroTextCol.appendChild(title);
  heroTextCol.appendChild(subtitle);
  heroTextCol.appendChild(ctaBtn);

  // Result link if solved at least one
  const anySolved = Object.values(progress.puzzles).some((p) => p.solved) || progress.rooms.r1?.solved;
  if (anySolved) {
    const resLink = document.createElement("a");
    resLink.href = "#/result";
    resLink.className = "home-result-link";
    resLink.textContent = t("home.result");
    heroTextCol.appendChild(resLink);
  }

  // Hero Preview Frame (Kaapi Club b1)
  const heroFrameWrapper = document.createElement("div");
  heroFrameWrapper.className = "home-hero-preview-wrapper";

  const b1 = getPuzzle("b1");
  const kaapiSite = getSite("kaapi");
  const b1Fixed = getFixedFiles(b1);

  heroBrowserComponent = createBrowserFrame({
    site: kaapiSite,
    puzzle: b1,
    files: b1.files,
    status: "broken"
  });
  heroFrameWrapper.appendChild(heroBrowserComponent.el);

  // 3D Tilt follow pointer on laptop
  heroFrameWrapper.addEventListener("mousemove", (e) => {
    if (window.innerWidth < 1024) return;
    const rect = heroFrameWrapper.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    heroFrameWrapper.style.transform = `perspective(1000px) rotateX(${6 - y * 6}deg) rotateY(${-10 + x * 8}deg)`;
  });

  heroFrameWrapper.addEventListener("mouseleave", () => {
    heroFrameWrapper.style.transform = "";
  });

  // Loop: glitch -> sweep fixed -> 3s -> revert broken every 7s
  heroLoopTimer = setInterval(async () => {
    if (document.hidden) return;
    await heroBrowserComponent.performRepairSweep(b1Fixed);
    setTimeout(() => {
      heroBrowserComponent.setStatus("broken");
      heroBrowserComponent.reload(b1.files);
    }, 3000);
  }, 7000);

  heroSection.appendChild(heroTextCol);
  heroSection.appendChild(heroFrameWrapper);
  screen.appendChild(heroSection);

  // --- Four Level Cards ---
  const levelCardsSection = document.createElement("section");
  levelCardsSection.className = "home-levels-section";

  const levelsData = [
    {
      id: "escape",
      name: "The Night Museum",
      kind: "Escape room",
      blurb: "Escape a hacked website. No coding needed.",
      route: "#/escape",
      progressText: `${getLevelSummary("escape", progress).solvedCount} of 5 rooms`,
      scoreText: progress.escape?.done ? `Best: ${formatClock(progress.escape.seconds)}` : "500 pts max"
    },
    {
      id: "beginner",
      name: "Mylapore Kaapi Club",
      kind: "Beginner",
      blurb: "Spot the bug, pick the fix.",
      route: "#/level/beginner",
      progressText: `${getLevelSummary("beginner", progress).solvedCount} of 5 fixed`,
      scoreText: `${getLevelSummary("beginner", progress).points} pts`
    },
    {
      id: "moderate",
      name: "Marina Mart",
      kind: "Moderate",
      blurb: "Fix real code in an editor.",
      route: "#/level/moderate",
      progressText: `${getLevelSummary("moderate", progress).solvedCount} of 5 fixed`,
      scoreText: `${getLevelSummary("moderate", progress).points} pts`
    },
    {
      id: "expert",
      name: "Reel Seats",
      kind: "Expert",
      blurb: "Race conditions, closures and worse.",
      route: "#/level/expert",
      progressText: `${getLevelSummary("expert", progress).solvedCount} of 5 fixed`,
      scoreText: `${getLevelSummary("expert", progress).points} pts`
    }
  ];

  const grid = document.createElement("div");
  grid.className = "home-levels-grid";

  levelsData.forEach((lvl) => {
    const card = document.createElement("a");
    card.href = lvl.route;
    card.className = "card home-level-card";

    if (progress.path === lvl.id) {
      const yourBadge = document.createElement("span");
      yourBadge.className = "home-your-level-tag";
      yourBadge.textContent = "Your level";
      card.appendChild(yourBadge);
    }

    const cardKind = document.createElement("span");
    cardKind.className = "home-level-kind";
    cardKind.textContent = lvl.kind;

    const cardTitle = document.createElement("h3");
    cardTitle.className = "home-level-title";
    cardTitle.textContent = lvl.name;

    const cardBlurb = document.createElement("p");
    cardBlurb.className = "home-level-blurb";
    cardBlurb.textContent = lvl.blurb;

    const cardFooter = document.createElement("div");
    cardFooter.className = "home-level-footer";
    cardFooter.innerHTML = `
      <span class="home-level-progress">${lvl.progressText}</span>
      <span class="home-level-score">${lvl.scoreText}</span>
    `;

    card.appendChild(cardKind);
    card.appendChild(cardTitle);
    card.appendChild(cardBlurb);
    card.appendChild(cardFooter);
    grid.appendChild(card);
  });

  levelCardsSection.appendChild(grid);
  screen.appendChild(levelCardsSection);

  // --- How It Works ---
  const howSection = document.createElement("section");
  howSection.className = "home-how-section";

  const howHeading = document.createElement("h2");
  howHeading.className = "home-how-heading";
  howHeading.textContent = "How it works";
  howSection.appendChild(howHeading);

  const stepsGrid = document.createElement("div");
  stepsGrid.className = "home-how-grid";

  const steps = [
    { num: "1", text: t("home.how1"), svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>` },
    { num: "2", text: t("home.how2"), svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>` },
    { num: "3", text: t("home.how3"), svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>` }
  ];

  steps.forEach((s) => {
    const stepCard = document.createElement("div");
    stepCard.className = "home-step-card";
    stepCard.innerHTML = `
      <div class="step-icon">${s.svg}</div>
      <div class="step-content">
        <span class="step-num">Step ${s.num}</span>
        <p class="step-text">${s.text}</p>
      </div>
    `;
    stepsGrid.appendChild(stepCard);
  });

  howSection.appendChild(stepsGrid);
  screen.appendChild(howSection);

  rootContainer.appendChild(screen);
}
