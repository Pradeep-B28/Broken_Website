// What it does: Tracks player progress, solved puzzles, scores, stars, unlocked levels, and rank. Pure logic, no DOM.
// What it uses: config.js, js/store.js, js/content.js, js/engine/score.js.
// What uses it: All screens, links.js, selftest.js.

import { CONFIG } from "../config.js";
import { getJSON, setJSON } from "./store.js";
import {
  getPuzzles,
  getAllPuzzles,
  getRooms,
  getPuzzleCounts
} from "./content.js";
import { maxTotal, rankFor } from "./engine/score.js";

const PROGRESS_KEY = "tbw-progress";

export function createFreshProgress() {
  return {
    v: 1,
    path: null,
    puzzles: {},
    rooms: {},
    escape: {
      seconds: 0,
      done: false
    }
  };
}

export function sanitizeProgress(raw) {
  if (!raw || typeof raw !== "object" || raw.v !== 1) {
    return createFreshProgress();
  }

  const validPuzzleIds = new Set(getAllPuzzles().map((p) => p.id));
  const validRoomIds = new Set(getRooms().map((r) => r.id));

  const cleanPuzzles = {};
  if (raw.puzzles && typeof raw.puzzles === "object") {
    for (const [id, val] of Object.entries(raw.puzzles)) {
      if (validPuzzleIds.has(id) && val && typeof val === "object") {
        cleanPuzzles[id] = {
          solved: Boolean(val.solved),
          points: Number(val.points) || 0,
          stars: Number(val.stars) || 0,
          revealed: Boolean(val.revealed),
          seconds: Number(val.seconds) || 0
        };
      }
    }
  }

  const cleanRooms = {};
  if (raw.rooms && typeof raw.rooms === "object") {
    for (const [id, val] of Object.entries(raw.rooms)) {
      if (validRoomIds.has(id) && val && typeof val === "object") {
        cleanRooms[id] = {
          solved: Boolean(val.solved),
          points: Number(val.points) || 0,
          stars: Number(val.stars) || 0,
          skipped: Boolean(val.skipped),
          seconds: Number(val.seconds) || 0
        };
      }
    }
  }

  const cleanEscape = {
    seconds: Math.max(0, Number(raw.escape?.seconds) || 0),
    done: Boolean(raw.escape?.done)
  };

  return {
    v: 1,
    path: typeof raw.path === "string" ? raw.path : null,
    puzzles: cleanPuzzles,
    rooms: cleanRooms,
    escape: cleanEscape
  };
}

let activeProgress = null;

export function getProgress() {
  if (!activeProgress) {
    const stored = getJSON(PROGRESS_KEY, null);
    activeProgress = sanitizeProgress(stored);
  }
  return activeProgress;
}

export function saveProgress(progress = null) {
  if (progress) {
    activeProgress = sanitizeProgress(progress);
  }
  if (!activeProgress) {
    activeProgress = createFreshProgress();
  }
  setJSON(PROGRESS_KEY, activeProgress);
  return activeProgress;
}

export function resetProgress() {
  activeProgress = createFreshProgress();
  setJSON(PROGRESS_KEY, activeProgress);
  return activeProgress;
}

export function setPath(path) {
  const p = getProgress();
  p.path = path;
  saveProgress(p);
  return p;
}

export function recordPuzzle(id, stats) {
  const p = getProgress();
  const existing = p.puzzles[id];
  const newPoints = stats.revealed ? 0 : (Number(stats.points) || 0);
  const newStars = stats.revealed ? 0 : (Number(stats.stars) || 0);
  const newSeconds = Number(stats.seconds) || 0;

  if (!existing) {
    p.puzzles[id] = {
      solved: true,
      points: newPoints,
      stars: newStars,
      revealed: Boolean(stats.revealed),
      seconds: newSeconds
    };
  } else {
    const keepBest = newPoints > existing.points;
    p.puzzles[id] = {
      solved: true,
      points: keepBest ? newPoints : existing.points,
      stars: keepBest ? newStars : existing.stars,
      revealed: existing.revealed || Boolean(stats.revealed),
      seconds: newSeconds > 0 ? newSeconds : existing.seconds
    };
  }
  saveProgress(p);
  return p.puzzles[id];
}

export function recordRoom(id, stats) {
  const p = getProgress();
  const existing = p.rooms[id];
  const newPoints = stats.skipped ? 0 : (Number(stats.points) || 0);
  const newStars = stats.skipped ? 0 : (Number(stats.stars) || 0);
  const newSeconds = Number(stats.seconds) || 0;

  if (!existing) {
    p.rooms[id] = {
      solved: true,
      points: newPoints,
      stars: newStars,
      skipped: Boolean(stats.skipped),
      seconds: newSeconds
    };
  } else {
    const keepBest = newPoints > existing.points;
    p.rooms[id] = {
      solved: true,
      points: keepBest ? newPoints : existing.points,
      stars: keepBest ? newStars : existing.stars,
      skipped: existing.skipped || Boolean(stats.skipped),
      seconds: newSeconds > 0 ? newSeconds : existing.seconds
    };
  }
  saveProgress(p);
  return p.rooms[id];
}

export function recordEscapeDone(totalSeconds) {
  const p = getProgress();
  p.escape.seconds = Math.max(0, Number(totalSeconds) || 0);
  p.escape.done = true;
  saveProgress(p);
  return p.escape;
}

export function isUnlocked(levelId, puzzleOrRoomId, progress = null) {
  const prog = progress || getProgress();

  if (levelId === "escape") {
    const rooms = getRooms();
    const idx = rooms.findIndex((r) => r.id === puzzleOrRoomId);
    if (idx === -1) return false;
    if (idx === 0) return true;
    const prevRoomId = rooms[idx - 1].id;
    const prev = prog.rooms[prevRoomId];
    return Boolean(prev && (prev.solved || prev.skipped));
  }

  const puzzles = getPuzzles(levelId);
  const idx = puzzles.findIndex((p) => p.id === puzzleOrRoomId);
  if (idx === -1) return false;
  if (idx === 0) return true;
  const prevPuzzleId = puzzles[idx - 1].id;
  const prev = prog.puzzles[prevPuzzleId];
  return Boolean(prev && (prev.solved || prev.revealed));
}

export function getLevelSummary(levelId, progress = null) {
  const prog = progress || getProgress();

  if (levelId === "escape") {
    const rooms = getRooms();
    let solvedCount = 0;
    let points = 0;
    let stars = 0;
    for (const r of rooms) {
      const rec = prog.rooms[r.id];
      if (rec && rec.solved) {
        solvedCount++;
        points += rec.points || 0;
        stars += rec.stars || 0;
      }
    }
    return {
      level: "escape",
      solvedCount,
      totalCount: rooms.length,
      points,
      stars,
      seconds: prog.escape?.seconds || 0,
      isComplete: prog.escape?.done || solvedCount === rooms.length
    };
  }

  const puzzles = getPuzzles(levelId);
  let solvedCount = 0;
  let points = 0;
  let stars = 0;
  for (const p of puzzles) {
    const rec = prog.puzzles[p.id];
    if (rec && (rec.solved || rec.revealed)) {
      solvedCount++;
      points += rec.points || 0;
      stars += rec.stars || 0;
    }
  }

  return {
    level: levelId,
    solvedCount,
    totalCount: puzzles.length,
    points,
    stars,
    isComplete: solvedCount === puzzles.length
  };
}

export function getGameSummary(progress = null) {
  const prog = progress || getProgress();
  const counts = getPuzzleCounts();
  const maxPossible = maxTotal(counts, CONFIG.scoring);

  let totalSolved = 0;
  let totalPoints = 0;
  let totalStars = 0;

  for (const level of ["beginner", "moderate", "expert"]) {
    const sum = getLevelSummary(level, prog);
    totalSolved += sum.solvedCount;
    totalPoints += sum.points;
    totalStars += sum.stars;
  }

  const currentRank = rankFor(totalPoints, CONFIG.scoring.ranks);
  const escapeSum = getLevelSummary("escape", prog);

  return {
    solvedCount: totalSolved,
    totalPuzzles: 15,
    points: totalPoints,
    maxPoints: maxPossible,
    stars: totalStars,
    rank: currentRank.name,
    escape: {
      roomsSolved: escapeSum.solvedCount,
      totalRooms: 5,
      points: escapeSum.points,
      seconds: prog.escape?.seconds || 0,
      done: Boolean(prog.escape?.done)
    }
  };
}

export function getNextUnsolved(path, progress = null) {
  const prog = progress || getProgress();
  const chosenPath = path || prog.path;

  if (chosenPath === "escape") {
    const rooms = getRooms();
    for (const r of rooms) {
      const rec = prog.rooms[r.id];
      if (!rec || (!rec.solved && !rec.skipped)) {
        return { type: "room", id: r.id };
      }
    }
    return { type: "room", id: rooms[0].id };
  }

  const levelId = chosenPath && ["beginner", "moderate", "expert"].includes(chosenPath)
    ? chosenPath
    : "beginner";
  const puzzles = getPuzzles(levelId);
  for (const p of puzzles) {
    const rec = prog.puzzles[p.id];
    if (!rec || (!rec.solved && !rec.revealed)) {
      return { type: "puzzle", id: p.id, level: levelId };
    }
  }
  return { type: "puzzle", id: puzzles[0].id, level: levelId };
}
