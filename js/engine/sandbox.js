// What it does: builds the sandboxed page for a puzzle (a live preview or a check run) and listens
// for its console output, errors and check results. The only code that loads puzzle pages.
// Uses: harness.js. Used by: the puzzle screens, demo.js, selftest.js, tools/lab.js.
// LOCKED. Do not edit. Checked by tools/puzzle-lab.html.

import { PREAMBLE, HARNESS } from "./harness.js";

// The puzzle page may not load anything from the network: no fetch, no outside scripts or images.
export const CSP = "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:; media-src data:";
export const SANDBOX = "allow-scripts";
export const CHECK_TIMEOUT_MS = 4000;   // one check
export const RUN_TIMEOUT_MS = 30000;    // a whole check run
export const READY_TIMEOUT_MS = 8000;   // a preview finishing loading

const active = new WeakMap();

function safe(text, tag) {
  return String(text == null ? "" : text).replace(new RegExp("</(" + tag + ")", "gi"), "<\\/$1");
}

function lineCount(text) {
  return String(text == null ? "" : text).split("\n").length;
}

export function makeNonce() {
  const a = new Uint32Array(2);
  crypto.getRandomValues(a);
  return "tbw" + a[0].toString(36) + a[1].toString(36);
}

// files: { html, css, js } as the player sees them. base: the site's hidden CSS.
// checks: the puzzle's check code, or null for a plain preview.
export function buildDoc({ files, base = "", checks = null, nonce }) {
  const js = safe(files.js, "script");
  const head = [
    "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\">",
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
    "<meta http-equiv=\"Content-Security-Policy\" content=\"" + CSP + "\">",
    "<script>" + PREAMBLE + "</" + "script>",
    "<style>" + safe(base, "style") + "</style>",
    "<style>" + safe(files.css, "style") + "</style>",
    "</head><body>",
    String(files.html == null ? "" : files.html)
  ].join("\n");
  // script.js line 1 sits on this line of the generated page. Used to report errors as "script.js line N".
  const jsLine = lineCount(head) + 1;
  const parts = [head, "<script>" + js + "</" + "script>"];
  if (checks != null) {
    parts.push("<script>" + HARNESS.replace("__TIMEOUT__", String(CHECK_TIMEOUT_MS)) + "</" + "script>");
    parts.push("<script>(function () {\n" + safe(checks, "script") + "\n})();</" + "script>");
    parts.push("<script>window.__tbwRun && window.__tbwRun();</" + "script>");
  }
  parts.push("</body></html>");
  return parts
    .join("\n")
    .replace("__NONCE__", nonce)
    .replace("__JSLINE__", String(jsLine))
    .replace("__JSLINES__", String(lineCount(files.js)));
}

function cleanResults(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, 40).map((r) => ({
    name: String(r && r.name || "").slice(0, 200),
    pass: !!(r && r.pass === true),
    msg: String(r && r.msg || "").slice(0, 400)
  }));
}

// Loads a puzzle page into the iframe. Returns { done, stop }.
//   done resolves once with { status, results, logs, errors }:
//     status "ready"   preview finished loading (no checks)
//     status "done"    checks finished, results is a list of { name, pass, msg }
//     status "timeout" the page never reported back (a stuck loop, or an unclosed tag that swallowed the checks)
//   onLog({ level, text }) and onError(text) keep firing for a preview until stop() or the next load.
export function load(iframe, { files, base = "", checks = null, onLog = null, onError = null } = {}) {
  const prev = active.get(iframe);
  if (prev) prev();
  const nonce = makeNonce();
  const logs = [];
  const errors = [];
  let finish;
  const done = new Promise((resolve) => { finish = resolve; });
  let settled = false;

  function settle(status, results) {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    finish({ status, results: results || [], logs: logs.slice(), errors: errors.slice() });
    if (checks != null) stop();
  }
  function onMessage(event) {
    if (event.source !== iframe.contentWindow) return;
    const d = event.data;
    if (!d || d.tbw !== nonce) return;
    if (d.type === "log") {
      const entry = { level: String(d.level || "log"), text: String(d.text || "").slice(0, 300) };
      if (logs.length < 200) logs.push(entry);
      if (onLog) onLog(entry);
    } else if (d.type === "error") {
      const text = String(d.text || "").slice(0, 300);
      if (errors.length < 50) errors.push(text);
      if (onError) onError(text);
    } else if (d.type === "ready" && checks == null) {
      settle("ready", []);
    } else if (d.type === "results" && checks != null) {
      settle("done", cleanResults(d.results));
    }
  }
  function stop() {
    window.removeEventListener("message", onMessage);
    clearTimeout(timer);
    if (active.get(iframe) === stop) active.delete(iframe);
    if (!settled) {
      settled = true;
      finish({ status: "stopped", results: [], logs: logs.slice(), errors: errors.slice() });
    }
  }

  window.addEventListener("message", onMessage);
  active.set(iframe, stop);
  const timer = setTimeout(() => settle("timeout", []), checks != null ? RUN_TIMEOUT_MS : READY_TIMEOUT_MS);
  iframe.setAttribute("sandbox", SANDBOX);
  iframe.srcdoc = buildDoc({ files, base, checks, nonce });
  return { done, stop };
}
