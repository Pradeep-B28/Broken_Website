// What it does: Browser frame mockup with sandboxed iframe, aspect scaling, glitch effect, and repair sweep transition.
// What it uses: config.js, js/engine/sandbox.js, DOM elements.
// What uses it: js/screens/spot.js, js/screens/edit.js, js/screens/room.js.

import { CONFIG } from "../../config.js";
import { load } from "../engine/sandbox.js";

export function createBrowserFrame({
  site = {},
  puzzle = {},
  files = {},
  status = "broken", // "broken" | "fixed" | "locked"
  onReload = null,
  onLog = null,
  onError = null
}) {
  const root = document.createElement("div");
  root.className = "browser-frame";

  // Top Bar
  const bar = document.createElement("div");
  bar.className = "browser-bar";

  const dots = document.createElement("div");
  dots.className = "browser-dots";
  ["close", "min", "max"].forEach((d) => {
    const dot = document.createElement("span");
    dot.className = `browser-dot browser-dot--${d}`;
    dots.appendChild(dot);
  });

  const navIcons = document.createElement("div");
  navIcons.className = "browser-nav-icons";

  const refreshBtn = document.createElement("button");
  refreshBtn.type = "button";
  refreshBtn.className = "browser-icon-btn";
  refreshBtn.title = "Reload preview";
  refreshBtn.setAttribute("aria-label", "Reload preview");
  refreshBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
    </svg>`;
  refreshBtn.addEventListener("click", () => {
    if (typeof onReload === "function") {
      onReload();
    } else {
      reload();
    }
  });
  navIcons.appendChild(refreshBtn);

  const addressPill = document.createElement("div");
  addressPill.className = "browser-address-pill";
  addressPill.innerHTML = `
    <svg class="browser-lock-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
    <span class="browser-address-text"></span>
  `;
  const addressText = addressPill.querySelector(".browser-address-text");
  const domain = site.domain || "example.com";
  addressText.textContent = `${domain}/${puzzle.id || ""}`;

  const statusTag = document.createElement("span");
  statusTag.className = `browser-status-tag browser-status-tag--${status}`;
  statusTag.textContent = status === "fixed" ? "Fixed" : "Broken";

  bar.appendChild(dots);
  bar.appendChild(navIcons);
  bar.appendChild(addressPill);
  bar.appendChild(statusTag);

  // Viewport Area
  const viewportWrapper = document.createElement("div");
  viewportWrapper.className = "browser-viewport-wrapper";

  const stage = document.createElement("div");
  stage.className = "browser-stage";

  // Top/broken iframe
  const brokenIframe = document.createElement("iframe");
  brokenIframe.className = "browser-iframe browser-iframe--broken";

  // Under/fixed iframe for repair sweep
  const fixedIframe = document.createElement("iframe");
  fixedIframe.className = "browser-iframe browser-iframe--under";
  fixedIframe.style.display = "none";

  const glitchOverlay = document.createElement("div");
  glitchOverlay.className = "browser-glitch-overlay";

  const sweepBand = document.createElement("div");
  sweepBand.className = "browser-sweep-band";

  stage.appendChild(fixedIframe);
  stage.appendChild(brokenIframe);
  stage.appendChild(glitchOverlay);
  stage.appendChild(sweepBand);
  viewportWrapper.appendChild(stage);

  root.appendChild(bar);
  root.appendChild(viewportWrapper);

  const device = puzzle.device === "phone" ? CONFIG.devices.phone : CONFIG.devices.laptop;
  stage.style.width = `${device.width}px`;
  stage.style.height = `${device.height}px`;

  let currentFiles = { ...files };
  let currentLoadHandle = null;
  let glitchTimer = null;
  let lastSweepFps = 60;

  function updateScale() {
    const rect = viewportWrapper.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const pad = 16;
    const scaleX = (rect.width - pad) / device.width;
    const scaleY = (rect.height - pad) / device.height;
    const scale = Math.min(scaleX, scaleY, 1);
    stage.style.transform = `scale(${scale})`;
  }

  const resizeObserver = new ResizeObserver(() => {
    updateScale();
  });
  resizeObserver.observe(viewportWrapper);

  async function reload(filesToLoad = null, checks = null) {
    if (filesToLoad) {
      currentFiles = { ...filesToLoad };
    }
    if (currentLoadHandle && typeof currentLoadHandle.stop === "function") {
      currentLoadHandle.stop();
    }
    currentLoadHandle = load(brokenIframe, {
      files: currentFiles,
      base: site.base || "",
      checks: checks || null,
      onLog: (msg) => {
        if (typeof onLog === "function") onLog(msg);
      },
      onError: (err) => {
        if (typeof onError === "function") onError(err);
      }
    });
    return currentLoadHandle.done;
  }

  function startGlitch() {
    stopGlitch();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    function scheduleNext() {
      const delay = 4000 + Math.random() * 3000; // 4 to 7 seconds
      glitchTimer = setTimeout(() => {
        if (document.hidden) {
          scheduleNext();
          return;
        }
        root.classList.add("is-glitching");
        setTimeout(() => {
          root.classList.remove("is-glitching");
          scheduleNext();
        }, 300);
      }, delay);
    }
    scheduleNext();
  }

  function stopGlitch() {
    if (glitchTimer) {
      clearTimeout(glitchTimer);
      glitchTimer = null;
    }
    root.classList.remove("is-glitching");
  }

  async function performRepairSweep(fixedFiles) {
    stopGlitch();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Load fixed files into under-iframe
    fixedIframe.style.display = "block";
    const underHandle = load(fixedIframe, {
      files: fixedFiles,
      base: site.base || ""
    });
    await underHandle.done;

    if (reducedMotion) {
      // 150 ms cross-fade
      brokenIframe.style.transition = "opacity 150ms ease";
      brokenIframe.style.opacity = "0";
      await new Promise((r) => setTimeout(r, 150));
      statusTag.className = "browser-status-tag browser-status-tag--fixed";
      statusTag.textContent = "Fixed";
      lastSweepFps = 60;
      return 60;
    }

    sweepBand.classList.add("is-sweeping");

    // Animate sweep and clip-path over 900 ms
    const duration = 900;
    const start = performance.now();
    let frameCount = 0;

    return new Promise((resolve) => {
      function step(now) {
        frameCount++;
        const elapsed = now - start;
        const progress = Math.min(1, elapsed / duration);
        // Ease progress: cubic-bezier(0.22, 1, 0.36, 1) approx
        const pct = progress * 100;

        brokenIframe.style.clipPath = `inset(${pct}% 0 0 0)`;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          sweepBand.classList.remove("is-sweeping");
          brokenIframe.style.display = "none";
          statusTag.className = "browser-status-tag browser-status-tag--fixed";
          statusTag.textContent = "Fixed";

          const fps = Math.round((frameCount / (elapsed / 1000)));
          lastSweepFps = fps > 0 ? fps : 60;
          resolve(lastSweepFps);
        }
      }
      requestAnimationFrame(step);
    });
  }

  // Initial setup
  setTimeout(() => {
    updateScale();
    reload();
    if (status === "broken") {
      startGlitch();
    }
  }, 0);

  return {
    el: root,
    getIframe: () => brokenIframe,
    getFixedIframe: () => fixedIframe,
    reload,
    performRepairSweep,
    getSweepFps: () => lastSweepFps,
    setStatus: (newStatus) => {
      statusTag.className = `browser-status-tag browser-status-tag--${newStatus}`;
      statusTag.textContent = newStatus === "fixed" ? "Fixed" : "Broken";
      if (newStatus === "fixed") {
        stopGlitch();
      } else {
        startGlitch();
      }
    },
    destroy: () => {
      stopGlitch();
      resizeObserver.disconnect();
      if (currentLoadHandle && typeof currentLoadHandle.stop === "function") {
        currentLoadHandle.stop();
      }
    }
  };
}
