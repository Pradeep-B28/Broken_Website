// What it does: points, stars and rank. Pure maths, no DOM. The numbers come from config.scoring.
// Uses: rules passed in by the caller (config.js). Used by: the puzzle screens, the result screens, selftest.js.
// LOCKED. Do not edit. Checked by tools/verify-content.mjs.

// stats for a solved puzzle:
//   beginner:            { spotTries, fixTries, hints, revealed }
//   moderate and expert: { failedRuns, hints, revealed }
//   escape:              { wrongCodes, hints, revealed }   (revealed = the player skipped the room)
// spotTries and fixTries count the attempt that was right (first try = 1).
// failedRuns counts check runs with at least one failed check before the passing run.
// wrongCodes counts wrong and decoy codes typed into the lock. The first rules.escape.freeWrong are free.
export function puzzlePoints(level, stats, rules) {
  const r = rules[level];
  if (!r) throw new Error("Unknown level " + level);
  if (stats.revealed) return 0;
  const hints = stats.hints || 0;
  if (level === "beginner") {
    const pick = (list, tries) => list[Math.min(Math.max(tries, 1), list.length) - 1];
    const raw = pick(r.spot, stats.spotTries || 1) + pick(r.fix, stats.fixTries || 1) - r.hint * hints;
    return Math.min(r.max, Math.max(r.floor, raw));
  }
  if (level === "escape") {
    const wrong = Math.max(0, (stats.wrongCodes || 0) - r.freeWrong);
    return Math.min(r.max, Math.max(r.floor, r.max - r.hint * hints - r.wrongCode * wrong));
  }
  const paid = Math.max(0, (stats.failedRuns || 0) - rules.freeRuns);
  const raw = r.max - r.hint * hints - r.failedRun * paid;
  return Math.min(r.max, Math.max(r.floor, raw));
}

// 3 stars from 90% of the level's max, 2 from 60%, otherwise 1. 0 if the solution was revealed.
export function stars(level, points, rules, revealed = false) {
  if (revealed) return 0;
  const pct = points / rules[level].max;
  if (pct >= 0.9) return 3;
  if (pct >= 0.6) return 2;
  return 1;
}

// The highest possible total for the whole game.
export function maxTotal(puzzleCounts, rules) {
  return Object.keys(puzzleCounts).reduce((sum, level) => sum + puzzleCounts[level] * rules[level].max, 0);
}

// The rank for a total score: the last rank whose "from" is at or below the total.
export function rankFor(total, ranks) {
  let best = ranks[0];
  for (const r of ranks) if (total >= r.from) best = r;
  return best;
}
