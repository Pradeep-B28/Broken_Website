// Everything the game knows, in one place. The app reads content only through js/content.js.
// To add or change puzzles, follow content/SCHEMA.md, then run: node tools/verify-content.mjs
// and open tools/puzzle-lab.html (both must pass).

export { SITES } from "./sites.js";
export { BEGINNER } from "./beginner.js";
export { MODERATE } from "./moderate.js";
export { EXPERT } from "./expert.js";
export { ESCAPE } from "./escape.js";

export const LEVELS = [
  { id: "escape", name: "Escape Room", site: "museum", mode: "escape", blurb: "No coding needed. Find the clues hidden in a hacked website's code and get out." },
  { id: "beginner", name: "Beginner", site: "kaapi", mode: "spot", blurb: "Find the line that breaks the page, then pick the right fix." },
  { id: "moderate", name: "Moderate", site: "marina", mode: "edit", blurb: "Edit the real code. Two bugs hide in every puzzle." },
  { id: "expert", name: "Expert", site: "reel", mode: "edit", blurb: "Three or four bugs per puzzle. Some only show up when you are fast." }
];

// Raise by 1 whenever anything in content/ changes.
export const CONTENT_VERSION = 1;
