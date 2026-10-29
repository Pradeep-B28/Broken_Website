// What it does: the code that runs INSIDE the sandboxed puzzle page. PREAMBLE catches errors and console
// output. HARNESS gives the checks their helpers (t.click, t.type, t.expect...) and reports results.
// Uses: nothing. Used by: js/engine/sandbox.js only.
// LOCKED. Do not edit. Checked by tools/puzzle-lab.html. Plain ES5-style code on purpose: it runs next to player code.

// __NONCE__ and __JSLINE__ are filled in by sandbox.js. Keep each on its own line: line counts matter.
export const PREAMBLE = `(function () {
  var NONCE = "__NONCE__";
  var JSLINE = __JSLINE__;
  var JSLINES = __JSLINES__;
  var sent = 0;
  function post(type, extra) {
    if (sent > 300) return;
    sent++;
    var msg = { tbw: NONCE, type: type };
    for (var k in extra) msg[k] = extra[k];
    try { parent.postMessage(msg, "*"); } catch (e) {}
  }
  function str(v) {
    try {
      if (typeof v === "string") return v;
      if (v instanceof Error) return v.name + ": " + v.message;
      if (v && v.nodeType === 1) return "<" + v.tagName.toLowerCase() + (v.id ? "#" + v.id : "") + ">";
      if (typeof v === "undefined") return "undefined";
      if (typeof v === "function") return "function " + (v.name || "");
      return JSON.stringify(v);
    } catch (e) {
      return String(v);
    }
  }
  function where(lineno) {
    var n = lineno - JSLINE + 1;
    return n >= 1 && n <= JSLINES ? " (script.js line " + n + ")" : "";
  }
  window.__tbw = { errors: [], logs: [], post: post };
  ["log", "info", "warn", "error"].forEach(function (level) {
    var original = console[level];
    console[level] = function () {
      var text = Array.prototype.map.call(arguments, str).join(" ").slice(0, 300);
      if (window.__tbw.logs.length < 200) window.__tbw.logs.push(text);
      post("log", { level: level, text: text });
      if (original) original.apply(console, arguments);
    };
  });
  window.addEventListener("error", function (e) {
    var text = (e.message || "Error") + where(e.lineno || 0);
    window.__tbw.errors.push(text);
    post("error", { text: text });
  });
  window.addEventListener("unhandledrejection", function (e) {
    var r = e.reason;
    var text = "Uncaught (in promise) " + (r && r.message ? r.message : String(r));
    window.__tbw.errors.push(text);
    post("error", { text: text });
  });
  window.addEventListener("load", function () {
    post("ready", {});
  });
})();`;

// __TIMEOUT__ is filled in by sandbox.js.
export const HARNESS = `(function () {
  var TIMEOUT = __TIMEOUT__;
  var tests = [];
  function CheckFail(message) {
    this.message = message;
  }
  window.test = function (name, fn) {
    tests.push({ name: String(name), fn: fn });
  };
  function sleep(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }
  function describe(x) {
    return typeof x === "string" ? x : "that element";
  }
  var t = {
    $: function (s) { return document.querySelector(s); },
    $$: function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); },
    el: function (x) {
      var e = typeof x === "string" ? document.querySelector(x) : x;
      if (!e) throw new CheckFail("Could not find " + describe(x) + " on the page. Was it renamed or removed?");
      return e;
    },
    click: function (x) { t.el(x).click(); },
    type: function (x, value) {
      var e = t.el(x);
      e.focus();
      e.value = value;
      e.dispatchEvent(new Event("input", { bubbles: true }));
      e.dispatchEvent(new Event("change", { bubbles: true }));
    },
    key: function (key, x) {
      var target = x ? t.el(x) : (document.activeElement || document.body);
      target.dispatchEvent(new KeyboardEvent("keydown", { key: key, bubbles: true, cancelable: true }));
      target.dispatchEvent(new KeyboardEvent("keyup", { key: key, bubbles: true, cancelable: true }));
    },
    wait: sleep,
    until: function (fn, ms, step) {
      var end = Date.now() + (ms || 2000);
      return new Promise(function (resolve) {
        (function loop() {
          var ok = false;
          try { ok = !!fn(); } catch (e) { ok = false; }
          if (ok) return resolve(true);
          if (Date.now() > end) return resolve(false);
          setTimeout(loop, step || 25);
        })();
      });
    },
    settle: function () {
      var last = -1;
      var same = 0;
      var end = Date.now() + 2500;
      return new Promise(function (resolve) {
        (function loop() {
          var y = window.scrollY;
          if (y === last) { same++; } else { same = 0; last = y; }
          if (same >= 6 || Date.now() > end) return resolve();
          setTimeout(loop, 25);
        })();
      });
    },
    css: function (x, prop) { return getComputedStyle(t.el(x)).getPropertyValue(prop); },
    text: function (x) { return t.el(x).textContent.replace(/\\s+/g, " ").trim(); },
    visible: function (x) {
      var e = typeof x === "string" ? document.querySelector(x) : x;
      if (!e) return false;
      return e.getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden";
    },
    rect: function (x) { return t.el(x).getBoundingClientRect(); },
    expect: function (cond, message) {
      if (!cond) throw new CheckFail(message);
    },
    errors: function () { return window.__tbw.errors.slice(); },
    logs: function () { return window.__tbw.logs.slice(); }
  };
  function runOne(test) {
    return new Promise(function (resolve) {
      var done = false;
      var timer = setTimeout(function () {
        if (done) return;
        done = true;
        resolve({ name: test.name, pass: false, msg: "This check took too long. Something may be stuck or waiting forever." });
      }, TIMEOUT);
      Promise.resolve()
        .then(function () { return test.fn(t); })
        .then(function () {
          if (done) return;
          done = true;
          clearTimeout(timer);
          resolve({ name: test.name, pass: true, msg: "" });
        }, function (err) {
          if (done) return;
          done = true;
          clearTimeout(timer);
          var msg = err instanceof CheckFail ? err.message : "The page threw an error during this check: " + (err && err.message ? err.message : String(err));
          resolve({ name: test.name, pass: false, msg: msg });
        });
    });
  }
  window.__tbwRun = function () {
    var start = function () {
      setTimeout(function () {
        var results = [];
        var i = 0;
        (function next() {
          if (i >= tests.length) {
            if (!tests.length) {
              results.push({ name: "Checks loaded", pass: false, msg: "No checks could run. The page may have stopped loading early." });
            }
            window.__tbw.post("results", { results: results, errors: window.__tbw.errors.slice(0, 5) });
            return;
          }
          runOne(tests[i++]).then(function (r) { results.push(r); next(); });
        })();
      }, 30);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
  };
})();`;
