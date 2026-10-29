// What it does: a line-by-line diff of two texts, for the "Show the fix" view and demo mode. No DOM.
// Uses: nothing. Used by: the solution view, demo.js, selftest.js.
// LOCKED. Do not edit. Checked by tools/verify-content.mjs.

// Returns a list of { type: "same" | "del" | "add", a, b, text } in order.
// a is the 1-based line in the old text (null for "add"). b is the 1-based line in the new text (null for "del").
export function diffLines(oldText, newText) {
  const A = String(oldText).split("\n");
  const B = String(newText).split("\n");
  const n = A.length;
  const m = B.length;
  // Longest common subsequence table, built from the end.
  const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    }
  }
  const out = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) {
      out.push({ type: "same", a: i + 1, b: j + 1, text: A[i] });
      i++;
      j++;
    } else if (L[i + 1][j] >= L[i][j + 1]) {
      out.push({ type: "del", a: i + 1, b: null, text: A[i] });
      i++;
    } else {
      out.push({ type: "add", a: null, b: j + 1, text: B[j] });
      j++;
    }
  }
  while (i < n) {
    out.push({ type: "del", a: i + 1, b: null, text: A[i] });
    i++;
  }
  while (j < m) {
    out.push({ type: "add", a: null, b: j + 1, text: B[j] });
    j++;
  }
  return out;
}

// How many lines were removed and added. Shown as "3 lines changed" in the solution view.
export function diffStats(ops) {
  let del = 0;
  let add = 0;
  for (const o of ops) {
    if (o.type === "del") del++;
    if (o.type === "add") add++;
  }
  return { del, add, changed: Math.max(del, add) };
}
