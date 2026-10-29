// What it does: Bootstraps the application, parses URL flags (?test=1, ?demo=1, ?present=1), and launches selftest or router.
// What it uses: config.js, js/selftest.js, js/router.js, js/events.js.
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

  // Normal app startup: mount router into #app
  const appRoot = document.getElementById("app");
  if (appRoot) {
    const { initThemeUI } = await import("./theme.js");
    initThemeUI();

    const { initSoundUI } = await import("./sound.js");
    initSoundUI();

    const { initPresenter } = await import("./presenter.js");
    initPresenter();

    const { initAnalytics } = await import("./analytics.js");
    initAnalytics();

    const { initRouter } = await import("./router.js");
    initRouter(appRoot);

    if (params.get("demo") === "1") {
      const { runDemo } = await import("./demo.js");
      runDemo();
    }
  }

  emit("app:ready");
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", init);
}
