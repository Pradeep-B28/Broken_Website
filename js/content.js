// What it does: Central interface to load and query sites, levels, puzzles, and escape rooms. Pure data, no DOM.
// What it uses: content/index.js, js/engine/fixes.js.
// What uses it: All screens, progress.js, selftest.js.

import {
  SITES,
  BEGINNER,
  MODERATE,
  EXPERT,
  ESCAPE,
  LEVELS,
  CONTENT_VERSION
} from "../content/index.js";
import { applyFixes, touchedLines } from "./engine/fixes.js";

export { SITES, LEVELS, CONTENT_VERSION };

const PUZZLES_BY_LEVEL = {
  beginner: BEGINNER,
  moderate: MODERATE,
  expert: EXPERT
};

const ALL_PUZZLES = [...BEGINNER, ...MODERATE, ...EXPERT];
const PUZZLES_BY_ID = new Map(ALL_PUZZLES.map((p) => [p.id, p]));
const SITES_BY_ID = new Map(SITES.map((s) => [s.id, s]));
const ROOMS_BY_ID = new Map(ESCAPE.map((r) => [r.id, r]));
const LEVELS_BY_ID = new Map(LEVELS.map((l) => [l.id, l]));

export function getLevels() {
  return LEVELS;
}

export function getLevel(levelId) {
  return LEVELS_BY_ID.get(levelId) || null;
}

export function getSites() {
  return SITES;
}

export function getSite(siteId) {
  return SITES_BY_ID.get(siteId) || null;
}

export function getPuzzles(levelId) {
  return PUZZLES_BY_LEVEL[levelId] || [];
}

export function getPuzzle(id) {
  return PUZZLES_BY_ID.get(id) || null;
}

export function getAllPuzzles() {
  return ALL_PUZZLES;
}

export function getRooms() {
  return ESCAPE;
}

export function getRoom(id) {
  return ROOMS_BY_ID.get(id) || null;
}

export function getFixedFiles(puzzle) {
  if (!puzzle || !puzzle.files) return null;
  if (!puzzle.fixes || puzzle.fixes.length === 0) return { ...puzzle.files };
  return applyFixes(puzzle.files, puzzle.fixes);
}

export function getAltFiles(puzzle, altIndex = 0) {
  if (!puzzle || !puzzle.files || !puzzle.alts || !puzzle.alts[altIndex]) return null;
  return applyFixes(puzzle.files, puzzle.alts[altIndex].fixes);
}

export function getPuzzleTouchedLines(puzzle) {
  if (!puzzle || !puzzle.files || !puzzle.fixes) return { html: [], css: [], js: [] };
  return touchedLines(puzzle.files, puzzle.fixes);
}

export function getPuzzleCounts() {
  return {
    beginner: BEGINNER.length,
    moderate: MODERATE.length,
    expert: EXPERT.length
  };
}
