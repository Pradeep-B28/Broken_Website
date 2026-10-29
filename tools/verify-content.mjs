// Content check for The Broken Website. Run from the project folder:  node tools/verify-content.mjs
//
// It checks, without a browser:
//   1. every field in content/ against content/SCHEMA.md
//   2. every fix applies cleanly, and every alternative fix too
//   3. beginner answers: the fix only changes the lines the player must tap
//   4. every check script is valid JavaScript and has at least 3 checks
//   5. all player-facing text for long dashes, emojis and banned words
//   6. the scoring maths and the diff, against fixed expected values
// The browser half (broken pages fail, fixed pages pass) is tools/puzzle-lab.html.
// Prints PASS or FAIL and exits with code 1 if anything fails.

import vm from "node:vm";
import { SITES, BEGINNER, MODERATE, EXPERT, ESCAPE, LEVELS, CONTENT_VERSION } from "../content/index.js";
import { normalizeCode, checkCode, formatClock } from "../js/engine/lock.js";
import { applyFixes, touchedLines, FILES, FILE_NAMES } from "../js/engine/fixes.js";
import { diffLines, diffStats } from "../js/engine/diff.js";
import { puzzlePoints, stars, maxTotal, rankFor } from "../js/engine/score.js";
import { CONFIG } from "../config.js";

const DASHES = /[\u2012\u2013\u2014\u2015]/;
const EMOJI = /\p{Extended_Pictographic}/u;
const BANNED = [
  "guarantee", "placement", "salary", "lakh", "get hired", "seats left", "take your job", "replace you",
  "stupid", "dumb", "idiot", "noob", "loser", "useless"
];

let failures = 0;
function fail(where, msg) {
  failures++;
  console.log(`  FAIL  ${where}: ${msg}`);
}
const isStr = (v) => typeof v === "string" && v.trim().length > 0;
function checkText(where, label, text) {
  if (typeof text !== "string") return;
  if (DASHES.test(text)) fail(where, `${label} has a long dash`);
  if (EMOJI.test(text)) fail(where, `${label} has an emoji`);
  const lower = text.toLowerCase();
  for (const b of BANNED) if (lower.includes(b)) fail(where, `${label} uses the banned word "${b}"`);
}

// ---------- Sites and levels ----------
const siteById = {};
for (const s of SITES) {
  const w = `site ${s.id}`;
  if (!/^[a-z]{2,12}$/.test(s.id)) fail(w, "id must be 2 to 12 lowercase letters");
  if (siteById[s.id]) fail(w, "id used twice");
  siteById[s.id] = s;
  for (const k of ["name", "domain", "kind", "client", "base"]) if (!isStr(s[k])) fail(w, `${k} missing`);
  if (!/\.example$/.test(s.domain)) fail(w, "domain must end in .example (a reserved, made-up domain)");
  for (const k of ["name", "kind", "client"]) checkText(w, k, s[k]);
}
const levelIds = LEVELS.map((l) => l.id);
for (const l of LEVELS) {
  if (!siteById[l.site]) fail(`level ${l.id}`, `site "${l.site}" does not exist`);
  if (!["spot", "edit", "escape"].includes(l.mode)) fail(`level ${l.id}`, "mode must be spot, edit or escape");
  checkText(`level ${l.id}`, "blurb", l.blurb);
}

// ---------- Puzzles ----------
const ALL = [...BEGINNER, ...MODERATE, ...EXPERT];
const seen = new Set();
const rows = [];
const lists = { beginner: BEGINNER, moderate: MODERATE, expert: EXPERT };

for (const [level, list] of Object.entries(lists)) {
  list.forEach((p, i) => {
    const w = `puzzle ${p && p.id}`;
    const prefix = level[0];
    if (p.id !== `${prefix}${i + 1}`) fail(w, `id should be ${prefix}${i + 1} (level letter and position)`);
    if (seen.has(p.id)) fail(w, "id used twice");
    seen.add(p.id);
    if (p.level !== level) fail(w, `level is "${p.level}", but it sits in the ${level} list`);
    const site = siteById[p.site];
    if (!site) fail(w, `site "${p.site}" does not exist`);
    else if (site.level !== level) fail(w, `site "${p.site}" belongs to the ${site.level} level`);
    if (!CONFIG.devices[p.device]) fail(w, `device "${p.device}" is not in config.devices`);
    for (const k of ["title", "ticket", "symptom"]) {
      if (!isStr(p[k])) fail(w, `${k} missing`);
      checkText(w, k, p[k]);
    }
    if (!Array.isArray(p.concepts) || !p.concepts.length) fail(w, "concepts must list at least one idea");
    (p.concepts || []).forEach((c) => checkText(w, "concept", c));

    // Files
    for (const f of FILES) {
      if (typeof p.files?.[f] !== "string") fail(w, `files.${f} must be text`);
      else {
        if (DASHES.test(p.files[f])) fail(w, `${FILE_NAMES[f]} has a long dash`);
        if (EMOJI.test(p.files[f])) fail(w, `${FILE_NAMES[f]} has an emoji`);
        if (/\t/.test(p.files[f])) fail(w, `${FILE_NAMES[f]} has a tab character (use 2 spaces)`);
        if (p.files[f].length > CONFIG.limits.maxFileChars) fail(w, `${FILE_NAMES[f]} is longer than limits.maxFileChars`);
      }
    }

    // Fixes
    let fixed = null;
    if (!Array.isArray(p.fixes) || !p.fixes.length) fail(w, "fixes missing");
    else {
      try {
        fixed = applyFixes(p.files, p.fixes);
        if (FILES.every((f) => fixed[f] === p.files[f])) fail(w, "the fixes change nothing");
      } catch (e) {
        fail(w, e.message);
      }
    }
    (p.alts || []).forEach((a, k) => {
      if (!isStr(a.note)) fail(w, `alt ${k + 1} needs a note`);
      checkText(w, `alt ${k + 1} note`, a.note);
      try {
        applyFixes(p.files, a.fixes);
      } catch (e) {
        fail(w, `alt ${k + 1}: ${e.message}`);
      }
    });

    // Hints and explanation
    if (!Array.isArray(p.hints) || p.hints.length !== 3) fail(w, "needs exactly 3 hints");
    (p.hints || []).forEach((h, k) => {
      if (!isStr(h)) fail(w, `hint ${k + 1} is empty`);
      checkText(w, `hint ${k + 1}`, h);
    });
    for (const k of ["what", "why", "tip"]) {
      if (!isStr(p.explain?.[k])) fail(w, `explain.${k} missing`);
      checkText(w, `explain.${k}`, p.explain?.[k]);
    }

    // Checks: valid JavaScript, at least 3
    let checkCount = 0;
    if (!isStr(p.checks)) fail(w, "checks missing");
    else {
      try {
        new vm.Script("(async function () {\n" + p.checks + "\n})");
      } catch (e) {
        fail(w, `checks are not valid JavaScript: ${e.message}`);
      }
      checkCount = (p.checks.match(/^test\(/gm) || []).length;
      if (checkCount < 3) fail(w, `needs at least 3 checks, has ${checkCount}`);
      for (const m of p.checks.matchAll(/^test\("([^"]+)"/gm)) checkText(w, "check name", m[1]);
      for (const m of p.checks.matchAll(/t\.expect\([^]*?,\s*"([^"]+)"/g)) checkText(w, "check message", m[1]);
    }

    // Level-specific fields
    let touched = "";
    if (level === "beginner") {
      const ans = p.answer || {};
      const files = Object.keys(ans);
      if (!files.length) fail(w, "answer missing");
      for (const f of files) {
        if (!FILES.includes(f)) fail(w, `answer file "${f}" is not html, css or js`);
        const max = (p.files[f] || "").split("\n").length;
        for (const l of ans[f] || []) {
          if (!Number.isInteger(l) || l < 1 || l > max) fail(w, `answer line ${l} is not a line of ${FILE_NAMES[f]}`);
          else if (!p.files[f].split("\n")[l - 1].trim()) fail(w, `answer line ${l} of ${FILE_NAMES[f]} is blank`);
        }
      }
      const opts = p.options || [];
      if (opts.length !== 4) fail(w, "needs exactly 4 options");
      if (opts.filter((o) => o.correct === true).length !== 1) fail(w, "exactly one option must be correct");
      opts.forEach((o, k) => {
        if (!isStr(o.text) || !isStr(o.why)) fail(w, `option ${k + 1} needs text and why`);
        checkText(w, `option ${k + 1}`, o.text);
        checkText(w, `option ${k + 1} why`, o.why);
      });
      if (p.accept !== undefined || p.alts !== undefined) fail(w, "beginner puzzles have no accept or alts");
      if (fixed) {
        const t = touchedLines(p.files, p.fixes);
        for (const f of FILES) {
          for (const l of t[f]) {
            if (!(ans[f] || []).includes(l)) fail(w, `the fix changes ${FILE_NAMES[f]} line ${l}, which is not an answer line`);
          }
        }
        touched = files.map((f) => `${FILE_NAMES[f]}:${ans[f].join("+")} "${p.files[f].split("\n")[ans[f][0] - 1].trim().slice(0, 34)}"`).join(" or ");
      }
    } else {
      if (!Array.isArray(p.accept) || p.accept.length < 2) fail(w, "accept needs at least 2 lines");
      (p.accept || []).forEach((a, k) => checkText(w, `accept ${k + 1}`, a));
      if (p.answer !== undefined || p.options !== undefined) fail(w, "edit puzzles have no answer or options");
      if (fixed) {
        const t = touchedLines(p.files, p.fixes);
        touched = FILES.filter((f) => t[f].length).map((f) => `${FILE_NAMES[f]}:${t[f].join(",")}`).join(" ");
      }
    }

    rows.push({
      id: p.id,
      device: p.device,
      lines: FILES.map((f) => (p.files?.[f] || "").split("\n").length).join("/"),
      fixes: (p.fixes || []).length,
      alts: (p.alts || []).length,
      checks: checkCount,
      [level === "beginner" ? "answer" : "changes"]: touched
    });
  });
}


// ---------- Escape room ----------
const escapeRows = [];
ESCAPE.forEach((r, i) => {
  const w = `room ${r && r.id}`;
  if (r.id !== `r${i + 1}`) fail(w, `id should be r${i + 1}`);
  if (seen.has(r.id)) fail(w, "id used twice");
  seen.add(r.id);
  if (r.level !== "escape") fail(w, "level must be escape");
  if (!siteById[r.site] || siteById[r.site].level !== "escape") fail(w, `site "${r.site}" is not the escape room site`);
  if (!CONFIG.devices[r.device]) fail(w, `device "${r.device}" is not in config.devices`);
  if (!["read", "edit"].includes(r.kind)) fail(w, "kind must be read or edit");
  if (!["letters", "digits", "mixed"].includes(r.format)) fail(w, "format must be letters, digits or mixed");
  for (const k of ["title", "story", "goal"]) {
    if (!isStr(r[k])) fail(w, `${k} missing`);
    checkText(w, k, r[k]);
  }
  if (!Array.isArray(r.concepts) || !r.concepts.length) fail(w, "concepts must list at least one idea");
  for (const f of FILES) {
    if (typeof r.files?.[f] !== "string") fail(w, `files.${f} must be text`);
    else if (DASHES.test(r.files[f]) || EMOJI.test(r.files[f]) || /\t/.test(r.files[f])) fail(w, `${FILE_NAMES[f]} has a long dash, emoji or tab`);
  }
  // Answers and decoys
  const answers = (r.answers || []).map(normalizeCode);
  if (!answers.length || answers.some((a) => !a)) fail(w, "answers missing");
  if (new Set(answers).size !== answers.length) fail(w, "two answers are the same once normalised");
  if (r.format === "digits" && !answers.every((a) => /^\d+$/.test(a))) fail(w, "a digits room needs digit answers");
  if (r.format === "letters" && !/^[A-Z]+$/.test(answers[0])) fail(w, "the first answer of a letters room must be letters");
  for (const a of r.answers || []) if (checkCode(r, a).result !== "right") fail(w, `answer ${a} does not open the lock`);
  for (const d of r.decoys || []) {
    if (!isStr(d.code) || !isStr(d.reply)) fail(w, "each decoy needs code and reply");
    checkText(w, "decoy reply", d.reply);
    const c = checkCode(r, d.code);
    if (c.result !== "decoy") fail(w, `decoy ${d.code} is treated as ${c.result}`);
  }
  if (checkCode(r, "definitely not it").result !== "wrong") fail(w, "a random code should be wrong");
  // Kind-specific
  if (r.kind === "read") {
    const src = (r.files.html + "\n" + r.files.css + "\n" + r.files.js).toUpperCase();
    if (!answers.some((a) => src.includes(a))) fail(w, "a read room must contain its answer somewhere in the code");
    if (r.fixes || r.checks || r.traps) fail(w, "a read room has no fixes, checks or traps");
  } else {
    if (!Array.isArray(r.fixes) || !r.fixes.length) fail(w, "an edit room needs fixes (the intended edit)");
    else {
      try {
        applyFixes(r.files, r.fixes);
      } catch (e) {
        fail(w, e.message);
      }
    }
    for (const group of ["alts", "traps"]) {
      (r[group] || []).forEach((a, k) => {
        if (!isStr(a.note)) fail(w, `${group} ${k + 1} needs a note`);
        try {
          applyFixes(r.files, a.fixes);
        } catch (e) {
          fail(w, `${group} ${k + 1}: ${e.message}`);
        }
      });
    }
    if (!isStr(r.checks)) fail(w, "an edit room needs checks");
    else {
      try {
        new vm.Script("(async function () {\n" + r.checks + "\n})");
      } catch (e) {
        fail(w, `checks are not valid JavaScript: ${e.message}`);
      }
      if ((r.checks.match(/^test\(/gm) || []).length < 2) fail(w, "an edit room needs at least 2 checks");
    }
  }
  if (!Array.isArray(r.hints) || r.hints.length !== 3) fail(w, "needs exactly 3 hints");
  (r.hints || []).forEach((h, k) => checkText(w, `hint ${k + 1}`, h));
  for (const k of ["what", "why", "tip"]) {
    if (!isStr(r.explain?.[k])) fail(w, `explain.${k} missing`);
    checkText(w, `explain.${k}`, r.explain?.[k]);
  }
  escapeRows.push({ id: r.id, title: r.title, kind: r.kind, answer: r.answers[0], decoys: (r.decoys || []).length, alts: (r.alts || []).length, traps: (r.traps || []).length });
});

// ---------- Scoring, lock and diff, against fixed values ----------
const S = CONFIG.scoring;
const expectEq = (label, got, want) => {
  if (JSON.stringify(got) !== JSON.stringify(want)) fail("engine", `${label}: got ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);
};
expectEq("beginner perfect", puzzlePoints("beginner", { spotTries: 1, fixTries: 1, hints: 0 }, S), 100);
expectEq("beginner spot 2nd, fix 1st", puzzlePoints("beginner", { spotTries: 2, fixTries: 1, hints: 0 }, S), 80);
expectEq("beginner spot 4th, fix 3rd, 2 hints", puzzlePoints("beginner", { spotTries: 4, fixTries: 3, hints: 2 }, S), 10);
expectEq("beginner revealed", puzzlePoints("beginner", { spotTries: 1, fixTries: 1, hints: 0, revealed: true }, S), 0);
expectEq("moderate perfect", puzzlePoints("moderate", { failedRuns: 0, hints: 0 }, S), 200);
expectEq("moderate 1 failed run is free", puzzlePoints("moderate", { failedRuns: 1, hints: 0 }, S), 200);
expectEq("moderate 3 failed, 1 hint", puzzlePoints("moderate", { failedRuns: 3, hints: 1 }, S), 150);
expectEq("moderate floor", puzzlePoints("moderate", { failedRuns: 20, hints: 3 }, S), 40);
expectEq("expert 2 failed, 2 hints", puzzlePoints("expert", { failedRuns: 2, hints: 2 }, S), 195);
expectEq("expert revealed", puzzlePoints("expert", { failedRuns: 9, hints: 3, revealed: true }, S), 0);
expectEq("stars", [stars("beginner", 100, S), stars("beginner", 80, S), stars("moderate", 150, S), stars("expert", 195, S), stars("expert", 60, S), stars("expert", 0, S, true)], [3, 2, 2, 2, 1, 0]);
expectEq("max total", maxTotal({ beginner: BEGINNER.length, moderate: MODERATE.length, expert: EXPERT.length }, S), 3000);
expectEq("ranks", [0, 899, 900, 1799, 1800, 2599, 2600, 3000].map((n) => rankFor(n, S.ranks).name), ["Trainee", "Trainee", "Bug Fixer", "Bug Fixer", "Debugger", "Debugger", "Lead Debugger", "Lead Debugger"]);
const d = diffLines("a\nb\nc", "a\nB\nc\nd");
expectEq("diff", d.map((o) => o.type + (o.a || "-") + (o.b || "-")), ["same11", "del2-", "add-2", "same33", "add-4"]);
expectEq("diff stats", diffStats(d), { del: 1, add: 2, changed: 2 });
expectEq("escape perfect", puzzlePoints("escape", { wrongCodes: 0, hints: 0 }, S), 100);
expectEq("escape 2 wrong codes are free", puzzlePoints("escape", { wrongCodes: 2, hints: 0 }, S), 100);
expectEq("escape 5 wrong, 1 hint", puzzlePoints("escape", { wrongCodes: 5, hints: 1 }, S), 65);
expectEq("escape floor", puzzlePoints("escape", { wrongCodes: 30, hints: 3 }, S), 20);
expectEq("escape skipped", puzzlePoints("escape", { wrongCodes: 0, hints: 3, revealed: true }, S), 0);
expectEq("escape max", ESCAPE.length * S.escape.max, 500);
expectEq("normalise", ["  #ff bf-00 ", "amber", "1 9 4 7", ""].map(normalizeCode), ["FFBF00", "AMBER", "1947", ""]);
expectEq("lock", ["amber", " #FFBF00", "ruby", "yellow", "", "pizza"].map((c) => checkCode(ESCAPE[0], c).result), ["right", "right", "decoy", "decoy", "empty", "wrong"]);
expectEq("clock", [0, 59, 60, 760, 3599, 3725, -5].map(formatClock), ["0:00", "0:59", "1:00", "12:40", "59:59", "1:02:05", "0:00"]);

// ---------- Report ----------
console.log(`Content version ${CONTENT_VERSION}. Levels: ${levelIds.join(", ")}. Sites: ${SITES.map((s) => s.name).join(", ")}.`);
console.log(`Puzzles: ${BEGINNER.length} beginner, ${MODERATE.length} moderate, ${EXPERT.length} expert. Checks in total: ${rows.reduce((n, r) => n + r.checks, 0)}. Alternative fixes: ${rows.reduce((n, r) => n + r.alts, 0)}.`);
console.table(rows);
console.log(`Escape rooms: ${ESCAPE.length} (${ESCAPE.filter((r) => r.kind === "read").length} read, ${ESCAPE.filter((r) => r.kind === "edit").length} edit).`);
console.table(escapeRows);
console.log("Scoring, lock and diff: " + (failures ? "see failures above" : "all fixed values match") + ".");
if (failures) {
  console.log(`RESULT: FAIL (${failures} problem${failures === 1 ? "" : "s"})`);
  process.exit(1);
} else {
  console.log("RESULT: ALL PASS");
}
