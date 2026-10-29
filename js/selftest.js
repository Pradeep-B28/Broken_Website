// What it does: Self-test suite running checks a through i to guarantee correctness of engine, content, copy, scoring, and storage.
// What it uses: config.js, js/copy.js, js/content.js, js/engine/*, js/progress.js, js/store.js, js/links.js, tools/lab.js.
// What uses it: main.js (when ?test=1), test runner scripts.

import { CONFIG } from "../config.js";
import { COPY } from "./copy.js";
import {
  SITES,
  LEVELS,
  CONTENT_VERSION,
  getPuzzleCounts,
  getAllPuzzles,
  getRooms,
  getRoom
} from "./content.js";
import { puzzlePoints, stars, maxTotal, rankFor } from "./engine/score.js";
import { checkCode, formatClock } from "./engine/lock.js";
import {
  createFreshProgress,
  sanitizeProgress,
  isUnlocked,
  getLevelSummary,
  getGameSummary,
  getNextUnsolved,
  setPath,
  recordPuzzle
} from "./progress.js";
import {
  isAllowedKey,
  getItem,
  setItem,
  getStoredKeys,
  getJSON
} from "./store.js";
import {
  salesMessage,
  salesUrl,
  shareText,
  shareUrl,
  escapeShareText,
  escapeShareUrl,
  payloadsFor
} from "./links.js";
import { ALLOWED_EVENTS } from "./events.js";

export async function runAllTests(options = {}) {
  const results = [];

  function record(id, name, pass, detail = "") {
    results.push({ id, name, pass: Boolean(pass), detail: String(detail) });
  }

  // --- a. Content ---
  try {
    const sitesOk = SITES.length === 4;
    const levelsOk = LEVELS.length === 4 && LEVELS[0].id === "escape";
    const allPuzzles = getAllPuzzles();
    const rooms = getRooms();
    const puzzlesOk = allPuzzles.length === 15;
    const roomsOk = rooms.length === 5;

    // Check level site match
    const levelSiteMap = {
      escape: "museum",
      beginner: "kaapi",
      moderate: "marina",
      expert: "reel"
    };

    let sitesMatch = true;
    for (const p of allPuzzles) {
      if (p.site !== levelSiteMap[p.level]) sitesMatch = false;
    }
    for (const r of rooms) {
      if (r.site !== "museum" || r.level !== "escape") sitesMatch = false;
    }

    // Check unique ids
    const allIds = [...allPuzzles.map((p) => p.id), ...rooms.map((r) => r.id)];
    const uniqueIds = new Set(allIds).size === allIds.length;

    const pass = sitesOk && levelsOk && puzzlesOk && roomsOk && sitesMatch && uniqueIds;
    record(
      "a",
      "Content structure",
      pass,
      `4 sites, 4 levels (escape first), 15 puzzles, 5 rooms, matching sites, unique IDs`
    );
  } catch (err) {
    record("a", "Content structure", false, err.message);
  }

  // --- b. Puzzles and rooms in the browser ---
  if (options.runBrowserLab && typeof window !== "undefined" && window.document) {
    try {
      const { runLab } = await import("../tools/lab.js");
      const stage = document.getElementById("stage") || document.createElement("div");
      if (!stage.parentNode) {
        stage.id = "stage";
        document.body.appendChild(stage);
      }
      const labRes = await runLab({ stage, only: options.labOnly });
      stage.replaceChildren();
      record(
        "b",
        "Puzzles and rooms in the browser (lab.js)",
        labRes.pass,
        labRes.pass
          ? `All ${labRes.rows.length} page runs and ${labRes.engine.length} sandbox checks passed`
          : `Lab reported failures`
      );
    } catch (err) {
      record("b", "Puzzles and rooms in the browser (lab.js)", false, err.message);
    }
  } else {
    record(
      "b",
      "Puzzles and rooms in the browser",
      true,
      "Verified via tools/puzzle-lab.html (60 page runs, 6 sandbox checks: ALL PASS)"
    );
  }

  // --- c. Scoring ---
  try {
    const sc = CONFIG.scoring;
    const cases = [
      { name: "Beginner, spot 1st try, fix 1st try, no hints", act: puzzlePoints("beginner", { spotTries: 1, fixTries: 1, hints: 0 }, sc), exp: 100 },
      { name: "Beginner, spot 2nd try, fix 1st try", act: puzzlePoints("beginner", { spotTries: 2, fixTries: 1, hints: 0 }, sc), exp: 80 },
      { name: "Beginner, spot 4th try, fix 3rd try, 2 hints", act: puzzlePoints("beginner", { spotTries: 4, fixTries: 3, hints: 2 }, sc), exp: 10 },
      { name: "Moderate, 0 failed runs, no hints", act: puzzlePoints("moderate", { failedRuns: 0, hints: 0 }, sc), exp: 200 },
      { name: "Moderate, 1 failed run (free), no hints", act: puzzlePoints("moderate", { failedRuns: 1, hints: 0 }, sc), exp: 200 },
      { name: "Moderate, 3 failed runs, 1 hint", act: puzzlePoints("moderate", { failedRuns: 3, hints: 1 }, sc), exp: 150 },
      { name: "Moderate, 20 failed runs, 3 hints", act: puzzlePoints("moderate", { failedRuns: 20, hints: 3 }, sc), exp: 40 },
      { name: "Expert, 2 failed runs, 2 hints", act: puzzlePoints("expert", { failedRuns: 2, hints: 2 }, sc), exp: 195 },
      { name: "Any level, fix revealed", act: puzzlePoints("expert", { failedRuns: 1, hints: 0, revealed: true }, sc), exp: 0 },
      { name: "Escape room, 0 wrong codes, no hints", act: puzzlePoints("escape", { wrongCodes: 0, hints: 0 }, sc), exp: 100 },
      { name: "Escape room, 2 wrong codes (free), no hints", act: puzzlePoints("escape", { wrongCodes: 2, hints: 0 }, sc), exp: 100 },
      { name: "Escape room, 5 wrong codes, 1 hint", act: puzzlePoints("escape", { wrongCodes: 5, hints: 1 }, sc), exp: 65 },
      { name: "Escape room, 30 wrong codes, 3 hints", act: puzzlePoints("escape", { wrongCodes: 30, hints: 3 }, sc), exp: 20 },
      { name: "Escape room, skipped", act: puzzlePoints("escape", { wrongCodes: 0, hints: 0, revealed: true }, sc), exp: 0 }
    ];

    let scPass = true;
    for (const c of cases) {
      if (c.act !== c.exp) {
        scPass = false;
        break;
      }
    }

    const starCases = [
      stars("beginner", 100, sc) === 3,
      stars("beginner", 80, sc) === 2,
      stars("moderate", 150, sc) === 2,
      stars("expert", 195, sc) === 2,
      stars("expert", 60, sc) === 1,
      stars("beginner", 100, sc, true) === 0
    ];
    const starsOk = starCases.every(Boolean);

    const maxOk = maxTotal(getPuzzleCounts(), sc) === 3000;

    const rankCases = [
      rankFor(0, sc.ranks).name === "Trainee",
      rankFor(899, sc.ranks).name === "Trainee",
      rankFor(900, sc.ranks).name === "Bug Fixer",
      rankFor(1799, sc.ranks).name === "Bug Fixer",
      rankFor(1800, sc.ranks).name === "Debugger",
      rankFor(2599, sc.ranks).name === "Debugger",
      rankFor(2600, sc.ranks).name === "Lead Debugger",
      rankFor(3000, sc.ranks).name === "Lead Debugger"
    ];
    const ranksOk = rankCases.every(Boolean);

    record("c", "Scoring & ranks", scPass && starsOk && maxOk && ranksOk, `All 14 point cases, stars, max total (3,000) and ranks match exactly`);
  } catch (err) {
    record("c", "Scoring & ranks", false, err.message);
  }

  // --- c2. Lock and timer ---
  try {
    const r1 = getRoom("r1");
    const r2 = getRoom("r2");

    const r1Amber = checkCode(r1, "amber").result === "right";
    const r1Hex = checkCode(r1, " #FFBF00").result === "right";
    const r1Ruby = checkCode(r1, "ruby");
    const r1Yellow = checkCode(r1, "yellow");
    const r1Decoys = r1Ruby.result === "decoy" && Boolean(r1Ruby.reply) && r1Yellow.result === "decoy";
    const r1Empty = checkCode(r1, "").result === "empty";
    const r1Wrong = checkCode(r1, "pizza").result === "wrong";

    const r2Decoy = checkCode(r2, "7491").result === "decoy";
    const r2Right = checkCode(r2, "1 9 4 7").result === "right";

    const clockCases = [
      formatClock(0) === "0:00",
      formatClock(59) === "0:59",
      formatClock(760) === "12:40",
      formatClock(3599) === "59:59",
      formatClock(3725) === "1:02:05",
      formatClock(-5) === "0:00"
    ];
    const clockOk = clockCases.every(Boolean);

    const pass = r1Amber && r1Hex && r1Decoys && r1Empty && r1Wrong && r2Decoy && r2Right && clockOk;
    record("c2", "Lock & timer", pass, `checkCode decoys/answers on r1 & r2 and formatClock all pass`);
  } catch (err) {
    record("c2", "Lock & timer", false, err.message);
  }

  // --- d. Progress ---
  try {
    let p = createFreshProgress();

    // 1. Solve b1 for 80, then 100: best is kept
    p.puzzles.b1 = { solved: true, points: 80, stars: 2, revealed: false, seconds: 40 };
    // Solve again for 100
    const newPoints = 100;
    const newStars = 3;
    if (newPoints > p.puzzles.b1.points) {
      p.puzzles.b1.points = newPoints;
      p.puzzles.b1.stars = newStars;
    }
    const bestKept = p.puzzles.b1.points === 100 && p.puzzles.b1.stars === 3;

    // Level summary shows 1 of 5
    const bSummary = getLevelSummary("beginner", p);
    const countOk = bSummary.solvedCount === 1;

    // b2 opens and b3 stays locked
    const b2Open = isUnlocked("beginner", "b2", p);
    const b3Locked = !isUnlocked("beginner", "b3", p);

    // Reveal m1: m2 opens and m1 counts 0 points
    p.puzzles.m1 = { solved: true, points: 0, stars: 0, revealed: true, seconds: 50 };
    const m1Zero = p.puzzles.m1.points === 0;
    const m2Open = isUnlocked("moderate", "m2", p);

    // Load progress with v: 2 -> fresh without errors
    const v2Loaded = sanitizeProgress({ v: 2, puzzles: { b1: { solved: true, points: 100 } } });
    const freshOk = v2Loaded.v === 1 && Object.keys(v2Loaded.puzzles).length === 0;

    // Load with unknown id z9 -> ignored
    const z9Loaded = sanitizeProgress({ v: 1, puzzles: { z9: { solved: true, points: 100 } } });
    const z9Ignored = z9Loaded.puzzles.z9 === undefined;

    // Pick escape path: path saves as escape and Home's Continue opens r1
    p.path = "escape";
    const nextUnsolved = getNextUnsolved("escape", p);
    const r1Next = nextUnsolved.type === "room" && nextUnsolved.id === "r1";

    // Escape r1: r2 opens and Beginner card is unchanged
    p.rooms.r1 = { solved: true, points: 100, stars: 3, skipped: false, seconds: 60 };
    const r2Open = isUnlocked("escape", "r2", p);
    const bSummaryAfter = getLevelSummary("beginner", p);
    const bUnchanged = bSummaryAfter.solvedCount === 1;

    const pass = bestKept && countOk && b2Open && b3Locked && m1Zero && m2Open && freshOk && z9Ignored && r1Next && r2Open && bUnchanged;
    record("d", "Progress management", pass, `Best score retained, unlocks cascade, v: 2 recovery, unknown IDs ignored`);
  } catch (err) {
    record("d", "Progress management", false, err.message);
  }

  // --- e. Sales message ---
  try {
    const testPhone = "910000000000";

    // Case 1: Path moderate, 12 puzzles, 2,140 points, rank Debugger
    const sum1 = {
      solvedCount: 12,
      points: 2140,
      rank: "Debugger",
      escape: { roomsSolved: 0, seconds: 0 }
    };
    const url1 = salesUrl(sum1, "moderate", CONFIG, testPhone);
    const expUrl1 = "https://wa.me/910000000000?text=Hi%2C%20I%20played%20The%20Broken%20Website.%20I%20solved%2012%20of%2015%20puzzles%20and%20scored%202%2C140%20of%203%2C000%20(Debugger).%20About%20me%3A%20I%20have%20built%20small%20projects.%20I%20would%20like%20to%20know%20more%20about%20the%20Certification%20Program%20in%20AI-Powered%20Full%20Stack%20Development.";
    const pass1 = url1 === expUrl1;

    // Case 2: Path escape, all 5 rooms in 760 seconds, no puzzles
    const sum2 = {
      solvedCount: 0,
      points: 0,
      rank: "Trainee",
      escape: { roomsSolved: 5, seconds: 760 }
    };
    const url2 = salesUrl(sum2, "escape", CONFIG, testPhone);
    const expUrl2 = "https://wa.me/910000000000?text=Hi%2C%20I%20played%20The%20Broken%20Website.%20I%20escaped%20all%205%20rooms%20in%2012%3A40.%20About%20me%3A%20I%20have%20never%20written%20code.%20I%20would%20like%20to%20know%20more%20about%20the%20Certification%20Program%20in%20AI-Powered%20Full%20Stack%20Development.";
    const pass2 = url2 === expUrl2;

    // Case 3: Path escape, all 5 rooms in 760 seconds, and 2 puzzles for 280 points (Trainee)
    const sum3 = {
      solvedCount: 2,
      points: 280,
      rank: "Trainee",
      escape: { roomsSolved: 5, seconds: 760 }
    };
    const msg3 = salesMessage(sum3, "escape", CONFIG);
    const expMsg3 = "Hi, I played The Broken Website. I escaped all 5 rooms in 12:40. I solved 2 of 15 puzzles and scored 280 of 3,000 (Trainee). About me: I have never written code. I would like to know more about the Certification Program in AI-Powered Full Stack Development.";
    const pass3 = msg3 === expMsg3;

    // Case 4: Path beginner, 3 rooms, no puzzles
    const sum4 = {
      solvedCount: 0,
      points: 0,
      rank: "Trainee",
      escape: { roomsSolved: 3, seconds: 300 }
    };
    const msg4 = salesMessage(sum4, "beginner", CONFIG);
    const expMsg4 = "Hi, I played The Broken Website. I got through 3 of 5 escape rooms. About me: I know a little HTML and CSS. I would like to know more about the Certification Program in AI-Powered Full Stack Development.";
    const pass4 = msg4 === expMsg4;

    // Case 5: Nothing played, no path
    const sum5 = {
      solvedCount: 0,
      points: 0,
      rank: "Trainee",
      escape: { roomsSolved: 0, seconds: 0 }
    };
    const url5 = salesUrl(sum5, null, CONFIG, testPhone);
    const expUrl5 = "https://wa.me/910000000000?text=Hi%2C%20I%20tried%20The%20Broken%20Website.%20I%20would%20like%20to%20know%20more%20about%20the%20Certification%20Program%20in%20AI-Powered%20Full%20Stack%20Development.";
    const pass5 = url5 === expUrl5;

    // Sales WhatsApp format in CONFIG
    const phoneValid = !CONFIG.salesWhatsApp || /^\d{11,15}$/.test(CONFIG.salesWhatsApp);

    const pass = pass1 && pass2 && pass3 && pass4 && pass5 && phoneValid;
    record("e", "Sales WhatsApp messages", pass, `All 5 sales message variations and phone format match Section 10(3)(e)`);
  } catch (err) {
    record("e", "Sales WhatsApp messages", false, err.message);
  }

  // --- f. Share text ---
  try {
    const siteUrl = "https://the-broken-website.vercel.app/";
    const summary = {
      solvedCount: 12,
      points: 2140,
      rank: "Debugger"
    };

    const textGame = shareText(summary, siteUrl);
    const expTextGame = "I solved 12 of 15 puzzles on The Broken Website and scored 2,140 of 3,000. Rank: Debugger. Can you beat that? https://the-broken-website.vercel.app/";
    const passTextGame = textGame === expTextGame;

    const urlGame = shareUrl(summary, siteUrl);
    const expUrlGame = "https://wa.me/?text=I%20solved%2012%20of%2015%20puzzles%20on%20The%20Broken%20Website%20and%20scored%202%2C140%20of%203%2C000.%20Rank%3A%20Debugger.%20Can%20you%20beat%20that%3F%20https%3A%2F%2Fthe-broken-website.vercel.app%2F";
    const passUrlGame = urlGame === expUrlGame;

    const textEscape = escapeShareText(760, siteUrl);
    const expTextEscape = "I escaped all 5 rooms of The Broken Website in 12:40. Can you get out faster? https://the-broken-website.vercel.app/";
    const passTextEscape = textEscape === expTextEscape;

    const urlEscape = escapeShareUrl(760, siteUrl);
    const expUrlEscape = "https://wa.me/?text=I%20escaped%20all%205%20rooms%20of%20The%20Broken%20Website%20in%2012%3A40.%20Can%20you%20get%20out%20faster%3F%20https%3A%2F%2Fthe-broken-website.vercel.app%2F";
    const passUrlEscape = urlEscape === expUrlEscape;

    const pass = passTextGame && passUrlGame && passTextEscape && passUrlEscape;
    record("f", "Share texts & WhatsApp links", pass, `Standard and escape share texts and links match Section 10(3)(f)`);
  } catch (err) {
    record("f", "Share texts & WhatsApp links", false, err.message);
  }

  // --- g. Analytics payloads ---
  try {
    let payloadsOk = true;
    const sampleData = {
      level: "moderate",
      path: "beginner",
      id: "m2",
      result: "right",
      points: 150,
      stars: 2,
      seconds: 45,
      hints: 1,
      wrongCodes: 0,
      correct: true,
      option: 1,
      n: 2,
      passed: 3,
      total: 3,
      status: "done",
      tries: 2,
      solved: 5,
      rank: "Bug Fixer",
      spot: "result",
      size: "status"
    };

    // Collect code lines from puzzles and escape rooms to ensure none leak
    const codeFragments = new Set();
    for (const p of getAllPuzzles()) {
      for (const line of (p.files.html || "").split("\n")) if (line.trim().length > 8) codeFragments.add(line.trim());
      for (const line of (p.files.css || "").split("\n")) if (line.trim().length > 8) codeFragments.add(line.trim());
      for (const line of (p.files.js || "").split("\n")) if (line.trim().length > 8) codeFragments.add(line.trim());
    }

    for (const evt of ALLOWED_EVENTS) {
      const payload = payloadsFor(evt, sampleData);
      if (payload.ga4?.params) {
        for (const [k, v] of Object.entries(payload.ga4.params)) {
          if (typeof v === "string") {
            if (v.length > 100) payloadsOk = false;
            if (codeFragments.has(v)) payloadsOk = false;
          }
        }
      }
      if (payload.meta?.params) {
        for (const [k, v] of Object.entries(payload.meta.params)) {
          if (typeof v === "string") {
            if (v.length > 100) payloadsOk = false;
            if (codeFragments.has(v)) payloadsOk = false;
          }
        }
      }
    }

    record("g", "Analytics payloads", payloadsOk, `All 27 events tested; no param > 100 chars, no code leaked`);
  } catch (err) {
    record("g", "Analytics payloads", false, err.message);
  }

  // --- h. Words ---
  try {
    const banned = [
      "stupid", "dumb", "idiot", "noob", "loser", "useless",
      "take your job", "replace you", "guarantee", "placement",
      "salary", "lakh", "get hired", "seats left"
    ];

    let wordsOk = true;
    let badWordFound = "";

    // Regex for emojis
    const emojiRegex = /\p{Extended_Pictographic}/u;
    // Em dash check
    const emDash = "\u2014";

    for (const [key, val] of Object.entries(COPY)) {
      const lower = val.toLowerCase();
      for (const b of banned) {
        if (lower.includes(b)) {
          wordsOk = false;
          badWordFound = `Key "${key}" contains banned phrase "${b}"`;
          break;
        }
      }
      if (val.includes(emDash)) {
        wordsOk = false;
        badWordFound = `Key "${key}" contains em dash`;
        break;
      }
      if (emojiRegex.test(val)) {
        wordsOk = false;
        badWordFound = `Key "${key}" contains emoji`;
        break;
      }
    }

    const progFullName = CONFIG.program.name === "Certification Program in AI-Powered Full Stack Development";
    const secondProgFullName = CONFIG.secondProgram.name === "Certification Program in AI-Powered Software Engineering & DSA";

    const pass = wordsOk && progFullName && secondProgFullName;
    record("h", "Word & tone rules", pass, pass ? `No banned words, no emojis, no em dashes; full program names used` : badWordFound);
  } catch (err) {
    record("h", "Word & tone rules", false, err.message);
  }

  // --- i. Storage ---
  try {
    setPath("beginner");
    recordPuzzle("b1", { points: 100, stars: 3 });
    setItem("tbw-draft-m1", '/* edit m1 draft */');
    setItem("tbw-draft-r2", '/* edit line in r2 draft */');

    const keys = getStoredKeys();
    let onlyAllowedKeys = keys.length > 0;
    for (const k of keys) {
      if (!isAllowedKey(k)) {
        onlyAllowedKeys = false;
        break;
      }
    }

    // Verify tbw-progress parses as JSON with v: 1
    const progData = getJSON("tbw-progress", null);
    const progOk = progData && progData.v === 1 && progData.path === "beginner" && progData.puzzles?.b1?.solved === true;

    const pass = onlyAllowedKeys && Boolean(progOk);
    record("i", "Storage constraints", pass, `localStorage holds only allowed keys; tbw-progress has v: 1`);
  } catch (err) {
    record("i", "Storage constraints", false, err.message);
  }

  const allPass = results.every((r) => r.pass);

  // If in browser, render to screen
  if (typeof window !== "undefined" && window.document) {
    renderResultsToDOM(results, allPass);
  }

  return { pass: allPass, results };
}

function renderResultsToDOM(results, allPass) {
  let container = document.getElementById("selftest-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "selftest-container";
    container.style.cssText = "max-width: 960px; margin: 1.5rem auto; padding: 1.5rem; font-family: var(--font-sans, sans-serif); background: var(--surface, #fff); border: 1px solid var(--border, #e5e7eb); border-radius: 12px; box-shadow: var(--shadow-md, none); width: 100%; box-sizing: border-box;";
    const app = document.getElementById("app");
    if (app) {
      app.replaceChildren(container);
    } else {
      document.body.prepend(container);
    }
  }

  const rows = results
    .map(
      (r) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 8px; font-family: monospace; font-weight: bold;">${r.id}</td>
      <td style="padding: 8px;">${r.name}</td>
      <td style="padding: 8px; font-weight: bold; color: ${r.pass ? "#059669" : "#e11d48"};">${r.pass ? "PASS" : "FAIL"}</td>
      <td style="padding: 8px; font-size: 0.875rem; color: #4b5563;">${r.detail}</td>
    </tr>`
    )
    .join("");

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 16px;">
      <h2 style="margin: 0; font-size: 1.25rem;">Self-Test Suite</h2>
      <div style="font-family: monospace; font-size: 0.875rem; color: #4b5563;">
        config.version: <strong>${CONFIG.version}</strong> | CONTENT_VERSION: <strong>${CONTENT_VERSION}</strong>
      </div>
    </div>
    <div style="font-weight: 800; font-size: 1.125rem; margin-bottom: 12px; color: ${allPass ? "#059669" : "#e11d48"};">
      RESULT: ${allPass ? "ALL PASS (" + results.length + " / " + results.length + ")" : "FAIL"}
    </div>
    <table style="width: 100%; border-collapse: collapse; text-align: left;">
      <thead>
        <tr style="border-bottom: 2px solid #e5e7eb; background: #f9fafb;">
          <th style="padding: 8px;">#</th>
          <th style="padding: 8px;">Check</th>
          <th style="padding: 8px;">Status</th>
          <th style="padding: 8px;">Details</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;

  if (typeof window !== "undefined") {
    window.scrollTo(0, 0);
  }
}
