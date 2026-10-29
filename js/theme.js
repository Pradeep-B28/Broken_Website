// What it does: Manages light and dark theme switching, local storage persistence, and header toggle button.
// What it uses: config.js, js/store.js, js/events.js, js/sound.js.
// What uses it: js/main.js.

import { getItem, setItem } from "./store.js";
import { emit } from "./events.js";
import { playClick } from "./sound.js";

const THEME_KEY = "tbw-theme";

export function getSystemTheme() {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

export function getCurrentTheme() {
  const saved = getItem(THEME_KEY, null);
  if (saved === "dark" || saved === "light") {
    return saved;
  }
  return getSystemTheme();
}

export function setTheme(theme, emitEvent = true) {
  const root = document.documentElement;
  const isDark = theme === "dark";

  root.setAttribute("data-theme", isDark ? "dark" : "light");
  setItem(THEME_KEY, isDark ? "dark" : "light");

  // Update theme-color meta tags
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute("content", isDark ? "#0F172A" : "#FFFFFF");
  }

  // Update button icon & aria
  updateThemeButtonUI(isDark);

  if (emitEvent) {
    emit("theme:change", { theme: isDark ? "dark" : "light" });
  }
}

export function toggleTheme() {
  playClick();
  const current = getCurrentTheme();
  const next = current === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

function updateThemeButtonUI(isDark) {
  const btn = document.getElementById("btn-theme");
  if (!btn) return;

  btn.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  btn.setAttribute("title", isDark ? "Switch to light theme" : "Switch to dark theme");

  // Swap sun / moon icon safely with createElement
  btn.replaceChildren();
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "20");
  svg.setAttribute("height", "20");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");

  if (isDark) {
    // Moon icon for dark theme
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z");
    svg.appendChild(path);
  } else {
    // Sun icon for light theme
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "12");
    circle.setAttribute("cy", "12");
    circle.setAttribute("r", "5");
    svg.appendChild(circle);

    const coords = [
      [12, 1, 12, 3], [12, 21, 12, 23],
      [4.22, 4.22, 5.64, 5.64], [18.36, 18.36, 19.78, 19.78],
      [1, 12, 3, 12], [21, 12, 23, 12],
      [4.22, 19.78, 5.64, 18.36], [18.36, 5.64, 19.78, 4.22]
    ];
    coords.forEach(([x1, y1, x2, y2]) => {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(x1));
      line.setAttribute("y1", String(y1));
      line.setAttribute("x2", String(x2));
      line.setAttribute("y2", String(y2));
      svg.appendChild(line);
    });
  }
  btn.appendChild(svg);
}

export function initThemeUI() {
  const initialTheme = getCurrentTheme();
  setTheme(initialTheme, false);

  const btn = document.getElementById("btn-theme");
  if (btn) {
    btn.addEventListener("click", () => {
      toggleTheme();
    });
  }

  // Listen for system theme changes if user has no saved preference
  if (typeof window !== "undefined" && window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      const saved = getItem(THEME_KEY, null);
      if (!saved) {
        setTheme(e.matches ? "dark" : "light");
      }
    });
  }
}
