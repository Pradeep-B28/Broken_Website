// What it does: checks a code typed into an escape room lock, and formats the escape timer. No DOM.
// Uses: the room passed in by the caller (content/escape.js). Used by: ui/lock.js, links.js, selftest.js, tools/.
// LOCKED. Do not edit. Checked by tools/verify-content.mjs.

// Capitals, spaces, dashes and # do not matter: "#ff bf-00" and "FFBF00" are the same code.
export function normalizeCode(text) {
  return String(text == null ? "" : text).toUpperCase().replace(/[\s#\-_.]+/g, "");
}

// Returns { result, reply }:
//   result "right"  the code opens the lock
//   result "decoy"  a code hidden in the room on purpose (an old code, the wrong order). reply says why it fails
//   result "empty"  nothing typed
//   result "wrong"  anything else
export function checkCode(room, input) {
  const code = normalizeCode(input);
  if (!code) return { result: "empty", reply: "" };
  if (room.answers.some((a) => normalizeCode(a) === code)) return { result: "right", reply: "" };
  const decoy = (room.decoys || []).find((d) => normalizeCode(d.code) === code);
  if (decoy) return { result: "decoy", reply: decoy.reply };
  return { result: "wrong", reply: "" };
}

// 59 -> "0:59", 760 -> "12:40", 3725 -> "1:02:05". Negative or missing counts as 0.
export function formatClock(totalSeconds) {
  const t = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const two = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${two(m)}:${two(s)}` : `${m}:${two(s)}`;
}
