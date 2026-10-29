// What it does: Interactive before-and-after comparison slider with draggable split handle, keyboard support, and puzzle tabs.
// What it uses: config.js, js/content.js, js/engine/sandbox.js.
// What uses it: js/screens/done.js.

import { CONFIG } from "../../config.js";
import { getFixedFiles } from "../content.js";
import { load } from "../engine/sandbox.js";

export function createBeforeAfterSlider({ puzzles, site, initialPuzzleIndex = 4 }) {
  const root = document.createElement("div");
  root.className = "before-after-container";

  let currentIndex = Math.min(Math.max(initialPuzzleIndex, 0), puzzles.length - 1);
  let sliderPos = 50; // percentage 0 to 100
  let isDragging = false;
  let sweepRaf = null;

  // Tabs Header
  const tabsBar = document.createElement("div");
  tabsBar.className = "before-after-tabs";

  puzzles.forEach((p, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `before-after-tab-btn ${idx === currentIndex ? "is-active" : ""}`;
    btn.textContent = `Puzzle ${idx + 1}`;
    btn.addEventListener("click", () => {
      if (currentIndex === idx) return;
      currentIndex = idx;
      tabsBar.querySelectorAll(".before-after-tab-btn").forEach((b, i) => {
        b.classList.toggle("is-active", i === currentIndex);
      });
      loadPages();
    });
    tabsBar.appendChild(btn);
  });
  root.appendChild(tabsBar);

  // Stage Area
  const stage = document.createElement("div");
  stage.className = "before-after-stage";

  const device = CONFIG.devices.phone;
  stage.style.width = `${device.width}px`;
  stage.style.height = `${device.height}px`;

  // Under iframe (Fixed)
  const fixedIframe = document.createElement("iframe");
  fixedIframe.className = "before-after-iframe before-after-iframe--fixed";

  // Over iframe (Broken)
  const brokenIframe = document.createElement("iframe");
  brokenIframe.className = "before-after-iframe before-after-iframe--broken";

  // Draggable Divider & Handle
  const divider = document.createElement("div");
  divider.className = "before-after-divider";
  divider.setAttribute("role", "slider");
  divider.setAttribute("tabindex", "0");
  divider.setAttribute("aria-label", "Before and after comparison");
  divider.setAttribute("aria-valuemin", "0");
  divider.setAttribute("aria-valuemax", "100");
  divider.setAttribute("aria-valuenow", String(sliderPos));

  const handle = document.createElement("div");
  handle.className = "before-after-handle";
  handle.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  `;
  divider.appendChild(handle);

  stage.appendChild(fixedIframe);
  stage.appendChild(brokenIframe);
  stage.appendChild(divider);

  const stageWrapper = document.createElement("div");
  stageWrapper.className = "before-after-viewport";
  stageWrapper.appendChild(stage);
  root.appendChild(stageWrapper);

  function setSliderPosition(pos) {
    sliderPos = Math.max(0, Math.min(100, pos));
    divider.style.left = `${sliderPos}%`;
    divider.setAttribute("aria-valuenow", String(Math.round(sliderPos)));
    brokenIframe.style.clipPath = `inset(0 calc(100% - ${sliderPos}%) 0 0)`;
  }

  function loadPages() {
    const puzzle = puzzles[currentIndex];
    const fixedFiles = getFixedFiles(puzzle);

    load(fixedIframe, {
      files: fixedFiles,
      base: site.base || ""
    });
    load(brokenIframe, {
      files: puzzle.files,
      base: site.base || ""
    });
  }

  // Pointer drag events
  function onPointerDown(e) {
    isDragging = true;
    divider.setPointerCapture(e.pointerId);
    updateFromPointer(e);
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    updateFromPointer(e);
  }

  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    try {
      divider.releasePointerCapture(e.pointerId);
    } catch {}
  }

  function updateFromPointer(e) {
    const rect = stage.getBoundingClientRect();
    if (rect.width === 0) return;
    const x = e.clientX - rect.left;
    const pct = (x / rect.width) * 100;
    setSliderPosition(pct);
  }

  divider.addEventListener("pointerdown", onPointerDown);
  divider.addEventListener("pointermove", onPointerMove);
  divider.addEventListener("pointerup", onPointerUp);
  divider.addEventListener("pointercancel", onPointerUp);

  // Keyboard accessibility
  divider.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setSliderPosition(sliderPos - 5);
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setSliderPosition(sliderPos + 5);
    } else if (e.key === "Home") {
      e.preventDefault();
      setSliderPosition(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setSliderPosition(100);
    }
  });

  // Responsive scaling
  function updateScale() {
    const rect = stageWrapper.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const scale = Math.min((rect.width - 24) / device.width, (rect.height - 24) / device.height, 1);
    stage.style.transform = `scale(${scale})`;
  }

  const resizeObserver = new ResizeObserver(() => updateScale());
  resizeObserver.observe(stageWrapper);

  // Auto-play one slow sweep on mount
  function autoPlaySweep() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setSliderPosition(50);
      return;
    }
    const duration = 2000;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Sinusoidal sweep: 50 -> 85 -> 15 -> 50
      const sweep = 50 + Math.sin(progress * Math.PI * 2) * 35;
      setSliderPosition(sweep);

      if (progress < 1 && !isDragging) {
        sweepRaf = requestAnimationFrame(step);
      } else if (!isDragging) {
        setSliderPosition(50);
      }
    }
    sweepRaf = requestAnimationFrame(step);
  }

  setTimeout(() => {
    updateScale();
    loadPages();
    setSliderPosition(50);
    autoPlaySweep();
  }, 50);

  return {
    el: root,
    destroy: () => {
      if (sweepRaf) cancelAnimationFrame(sweepRaf);
      resizeObserver.disconnect();
    }
  };
}
