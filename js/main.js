// What it does: Bootstraps the application, parses URL flags (?test=1, ?demo=1, ?present=1), and launches selftest or router.
// What it uses: config.js, js/selftest.js, js/events.js.
// What uses it: index.html entry point (<script type="module" src="js/main.js">).

import { CONFIG } from "../config.js";
import { emit } from "./events.js";

async function init() {
  const params = new URLSearchParams(window.location.search);

  // Check URL flag for test mode (?test=1)
  if (params.get("test") === "1") {
    console.log(`[The Broken Website] Running Self-Test Suite (v${CONFIG.version})`);
    const { runAllTests } = await import("./selftest.js");
    const labOnly = params.get("labOnly");
    const skipLab = params.get("skiplab") === "1";
    const res = await runAllTests({
      runBrowserLab: !skipLab,
      labOnly
    });
    console.table(res.results);
    window.__selftest = res;
    return;
  }

  // Normal app startup (in later phases router mounts screens here)
  emit("app:ready");
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", init);
}
