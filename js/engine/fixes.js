// What it does: turns a puzzle's broken files into fixed files, and finds which lines a fix touches. No DOM.
// Uses: nothing. Used by: content.js (solutions, beginner answers), demo.js, selftest.js, tools/.
// LOCKED. Do not edit. Checked by tools/verify-content.mjs.

export const FILES = ["html", "css", "js"];
export const FILE_NAMES = { html: "index.html", css: "styles.css", js: "script.js" };

function count(haystack, needle) {
  let n = 0;
  let at = haystack.indexOf(needle);
  while (at !== -1) {
    n++;
    at = haystack.indexOf(needle, at + 1);
  }
  return n;
}

// Applies each { file, find, replace } in order. Every "find" must appear exactly once at that moment.
// Returns new files. Throws a plain-English Error if a fix does not fit.
export function applyFixes(files, fixes) {
  const out = { html: files.html || "", css: files.css || "", js: files.js || "" };
  fixes.forEach((f, i) => {
    if (!FILES.includes(f.file)) throw new Error(`Fix ${i + 1}: unknown file "${f.file}"`);
    const n = count(out[f.file], f.find);
    if (n !== 1) throw new Error(`Fix ${i + 1}: "${f.find.slice(0, 40)}" appears ${n} times in ${FILE_NAMES[f.file]}, expected once`);
    out[f.file] = out[f.file].replace(f.find, () => f.replace);
  });
  return out;
}

// The lines (1-based) of the BROKEN files that the fixes change, as { html: [..], css: [..], js: [..] }.
// Works on the original files, so it is exact for fixes that do not overlap.
export function touchedLines(files, fixes) {
  const out = { html: [], css: [], js: [] };
  for (const f of fixes) {
    const src = files[f.file] || "";
    const at = src.indexOf(f.find);
    if (at === -1) continue;
    const first = src.slice(0, at).split("\n").length;
    const last = first + f.find.split("\n").length - 1 - (f.find.endsWith("\n") ? 1 : 0);
    for (let l = first; l <= Math.max(first, last); l++) {
      if (!out[f.file].includes(l)) out[f.file].push(l);
    }
  }
  for (const k of FILES) out[k].sort((a, b) => a - b);
  return out;
}
