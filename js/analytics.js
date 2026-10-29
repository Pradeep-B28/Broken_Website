// What it does: Conditionally loads Google Analytics 4 and Meta Pixel, forwarding game events without leaking player code.
// What it uses: config.js, js/links.js, js/events.js.
// What uses it: js/main.js.

import { CONFIG } from "../config.js";
import { payloadsFor } from "./links.js";
import { on } from "./events.js";

let initialized = false;

export function shouldLoadAnalytics() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get("test") === "1" || params.get("demo") === "1" || params.get("present") === "1") {
    return false;
  }
  return Boolean(CONFIG.analytics?.ga4Id || CONFIG.analytics?.metaPixelId);
}

export function initAnalytics() {
  if (initialized) return;
  if (!shouldLoadAnalytics()) return;

  initialized = true;

  const ga4Id = CONFIG.analytics?.ga4Id;
  const metaId = CONFIG.analytics?.metaPixelId;

  // 1. Initialize GA4
  if (ga4Id) {
    const gaScript = document.createElement("script");
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`;
    document.head.appendChild(gaScript);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag("js", new Date());
    // Strip query string from page_location
    const cleanLocation = window.location.origin + window.location.pathname;
    gtag("config", ga4Id, {
      page_location: cleanLocation,
      send_page_view: true
    });
  }

  // 2. Initialize Meta Pixel
  if (metaId) {
    window._fbq = window._fbq || [];
    function fbq() {
      if (window.fbq.callMethod) {
        window.fbq.callMethod.apply(window.fbq, arguments);
      } else {
        window.fbq.queue.push(arguments);
      }
    }
    window.fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];

    const fbScript = document.createElement("script");
    fbScript.async = true;
    fbScript.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(fbScript);

    fbq("init", metaId);
    fbq("track", "PageView");
  }

  // 3. Listen to all game events
  const trackedEvents = [
    "level:open",
    "path:choose",
    "room:start",
    "code:try",
    "room:escaped",
    "room:skip",
    "escape:done",
    "puzzle:start",
    "spot:tap",
    "fix:pick",
    "hint:open",
    "checks:run",
    "puzzle:solved",
    "solution:reveal",
    "level:done",
    "result:view",
    "result:shown",
    "whatsapp:click",
    "cta:sales",
    "program:click",
    "cta:program",
    "website:click",
    "cta:website",
    "session:click",
    "cta:session",
    "share:image",
    "share:whatsapp",
    "copy:link",
    "share:copy"
  ];

  trackedEvents.forEach((eventName) => {
    on(eventName, (data) => {
      sendAnalyticsEvent(eventName, data);
    });
  });
}

export function sendAnalyticsEvent(eventName, data = {}) {
  const { ga4, meta } = payloadsFor(eventName, data);

  // Dispatch to GA4
  if (ga4 && typeof window.gtag === "function") {
    window.gtag("event", ga4.name, ga4.params);
  }

  // Dispatch to Meta Pixel
  if (meta && typeof window.fbq === "function") {
    if (meta.type === "track") {
      window.fbq("track", meta.event, meta.params);
    } else {
      window.fbq("trackCustom", meta.event, meta.params);
    }
  }

  // Debug log for development and verification
  if (window.__tbw_analytics_log) {
    window.__tbw_analytics_log.push({ eventName, ga4, meta });
  }
}
