// What it does: proves every puzzle and escape room in a real browser. Each broken page must fail at least one check,
// the fixed page must pass every check, and so must every alternative fix. Escape room codes must stay hidden until
// the intended edit, and traps must not reveal them. Also tests the sandbox itself.
// Uses: content/, js/engine/, config.js. Used by: tools/puzzle-lab.html and the app's ?test=1 self-test.
// LOCKED. Do not edit. Open tools/puzzle-lab.html through the local server. Add ?only=m3 or ?only=r2 to run one.

import { SITES, BEGINNER, MODERATE, EXPERT, ESCAPE, CONTENT_VERSION } from "../content/index.js";
import { load } from "../js/engine/sandbox.js";
import { applyFixes } from "../js/engine/fixes.js";
import { CONFIG } from "../config.js";

const ALL = [...BEGINNER, ...MODERATE, ...EXPERT];
const baseOf = (siteId) => SITES.find((s) => s.id === siteId).base;

function frameFor(stage, device) {
  const d = CONFIG.devices[device];
  const frame = document.createElement("iframe");
  frame.title = "Puzzle page under test";
  frame.style.width = d.width + "px";
  frame.style.height = d.height + "px";
  frame.style.border = "1px solid #ccc";
  frame.style.background = "#fff";
  stage.replaceChildren(frame);
  return frame;
}

async function run(stage, device, opts) {
  const frame = frameFor(stage, device);
  const r = await load(frame, opts).done;
  return r;
}

// Sandbox self-checks: things every puzzle relies on.
async function sandboxChecks(stage) {
  const out = [];
  const plain = { html: "<p id='x'>hi</p>", css: "", js: "" };

  let r = await run(stage, "phone", { files: plain });
  out.push({ name: "A preview reports ready", pass: r.status === "ready" });

  r = await run(stage, "phone", { files: { html: "<p>x</p>", css: "", js: "const a = 1;\nnull.boom;" } });
  out.push({ name: "Errors name the script.js line", pass: r.errors.some((e) => e.includes("script.js line 2")), info: r.errors.join(" | ") });

  r = await run(stage, "phone", {
    files: { html: "<p>x</p>", css: "", js: "fetch('https://example.com/').then(() => console.log('NETWORK OPEN')).catch(() => console.log('NETWORK BLOCKED'));" },
    checks: "test('wait', async (t) => { await t.wait(400); });"
  });
  out.push({ name: "The puzzle page cannot reach the network", pass: r.logs.some((l) => l.text === "NETWORK BLOCKED") && !r.logs.some((l) => l.text === "NETWORK OPEN"), info: r.logs.map((l) => l.text).join(" | ") });

  r = await run(stage, "phone", {
    files: { html: "<p id='x'>hi</p>", css: "", js: "const tag = \"</script><b id='leak'>x</b>\";\nconsole.log(tag.length);" },
    checks: "test('still running', async (t) => { t.expect(!t.$('#leak'), 'leaked'); });\ntest('second', async (t) => { t.expect(t.text('#x') === 'hi', 'no'); });\ntest('third', async () => {});"
  });
  out.push({ name: "A </script> inside player code cannot break out", pass: r.status === "done" && r.results.length === 3 && r.results.every((x) => x.pass), info: JSON.stringify(r.results) });

  r = await run(stage, "phone", {
    files: plain,
    checks: "test('fails', async (t) => { t.expect(false, 'Plain message'); });\ntest('throws', async () => { null.x; });\ntest('slow', async (t) => { await new Promise(() => {}); });"
  });
  const [a, b, c] = r.results;
  out.push({
    name: "Failed, crashing and stuck checks are reported in plain words",
    pass: r.status === "done" && a && !a.pass && a.msg === "Plain message" && b && !b.pass && /threw an error/.test(b.msg) && c && !c.pass && /too long/.test(c.msg),
    info: JSON.stringify(r.results)
  });

  r = await run(stage, "phone", { files: { html: "<p>x</p>", css: "", js: "localStorage.setItem('a', '1');" } });
  out.push({ name: "Player code cannot touch the app's storage", pass: r.errors.length > 0, info: r.errors.join(" | ") });
  return out;
}

export async function runLab({ stage, onRow, only = null } = {}) {
  const rows = [];
  const engine = only ? [] : await sandboxChecks(stage);
  for (const p of ALL) {
    if (only && p.id !== only) continue;
    const base = baseOf(p.site);
    const variants = [{ kind: "broken", files: p.files }];
    try {
      variants.push({ kind: "fixed", files: applyFixes(p.files, p.fixes) });
      (p.alts || []).forEach((a, i) => variants.push({ kind: "alt " + (i + 1), files: applyFixes(p.files, a.fixes) }));
    } catch (e) {
      const row = { id: p.id, kind: "fixes", pass: false, detail: e.message };
      rows.push(row);
      if (onRow) onRow(row);
      continue;
    }
    for (const v of variants) {
      const t0 = performance.now();
      const r = await run(stage, p.device, { files: v.files, base, checks: p.checks });
      const ms = Math.round(performance.now() - t0);
      const passed = r.results.filter((x) => x.pass).length;
      const failed = r.results.filter((x) => !x.pass);
      let pass;
      let detail;
      if (r.status !== "done") {
        pass = false;
        detail = "status " + r.status;
      } else if (v.kind === "broken") {
        pass = failed.length > 0;
        detail = failed.length + " of " + r.results.length + " checks fail: " + failed.map((x) => x.name).join("; ");
      } else {
        pass = failed.length === 0 && r.errors.length === 0;
        detail = passed + " of " + r.results.length + " pass" + (failed.length ? ". Failing: " + failed.map((x) => x.name + " (" + x.msg + ")").join("; ") : "") + (r.errors.length ? ". Errors: " + r.errors.join(" | ") : "");
      }
      const row = { id: p.id, kind: v.kind, pass, detail, ms, firstFail: v.kind === "broken" && failed[0] ? failed[0].msg : "" };
      rows.push(row);
      if (onRow) onRow(row);
    }
  }
  // Escape rooms: the code is hidden at the start, the intended edit reveals it, alternative edits reveal it,
  // and traps (tempting half-fixes) do not.
  for (const room of ESCAPE) {
    if (only && room.id !== only) continue;
    const base = baseOf(room.site);
    const codes = room.answers.map((a) => a.toUpperCase());
    const hidden = "test('code hidden', async (t) => { await t.wait(1200); const A = " + JSON.stringify(codes) +
      "; const seen = (document.body.innerText + ' ' + t.logs().join(' ')).toUpperCase(); t.expect(!A.some((a) => seen.indexOf(a) !== -1), 'The code is already on the screen or in the console.'); });";
    const variants = [{ kind: "hidden", files: room.files, checks: hidden, expect: "pass" }];
    if (room.kind === "edit") {
      try {
        variants.push({ kind: "start", files: room.files, checks: room.checks, expect: "fail" });
        variants.push({ kind: "fixed", files: applyFixes(room.files, room.fixes), checks: room.checks, expect: "pass" });
        (room.alts || []).forEach((a, i) => variants.push({ kind: "alt " + (i + 1), files: applyFixes(room.files, a.fixes), checks: room.checks, expect: "pass" }));
        (room.traps || []).forEach((a, i) => variants.push({ kind: "trap " + (i + 1), files: applyFixes(room.files, a.fixes), checks: room.checks, expect: "fail" }));
      } catch (e) {
        const row = { id: room.id, kind: "fixes", pass: false, detail: e.message };
        rows.push(row);
        if (onRow) onRow(row);
        continue;
      }
    }
    for (const v of variants) {
      const t0 = performance.now();
      const r = await run(stage, room.device, { files: v.files, base, checks: v.checks });
      const ms = Math.round(performance.now() - t0);
      const failed = r.results.filter((x) => !x.pass);
      const pass = r.status === "done" && (v.expect === "pass" ? failed.length === 0 && r.errors.length === 0 : failed.length > 0);
      const detail = r.status !== "done"
        ? "status " + r.status
        : (v.expect === "pass" ? "expected all checks to pass" : "expected a check to fail") + ": " +
          (r.results.length - failed.length) + " of " + r.results.length + " pass" +
          (failed.length ? ". Failing: " + failed.map((x) => x.name).join("; ") : "") +
          (r.errors.length ? ". Errors: " + r.errors.join(" | ") : "");
      const row = { id: room.id, kind: v.kind, pass, detail, ms };
      rows.push(row);
      if (onRow) onRow(row);
    }
  }

  const pass = engine.every((e) => e.pass) && rows.length > 0 && rows.every((r) => r.pass);
  return { version: CONFIG.version, content: CONTENT_VERSION, pass, engine, rows };
}
