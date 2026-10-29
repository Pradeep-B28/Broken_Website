// Every business setting for The Broken Website lives in this file.
// Change values here. Never hard-code any of these anywhere else in the app.
// After any change, open the app with ?test=1 and check that every test passes.

export const CONFIG = {
  version: "1.0.0",

  // The live address, with no slash at the end, for example "https://the-broken-website.vercel.app".
  // Set in Phase 7. While empty, the app uses the address it was opened from.
  siteUrl: "https://broken-website.vercel.app",

  // The program the result screen recommends, then the backup program. Names are in Section 1 of the brief.
  program: {
    id: "fsd",
    name: "Certification Program in AI-Powered Full Stack Development",
    page: ""
  },
  secondProgram: {
    id: "sde",
    name: "Certification Program in AI-Powered Software Engineering & DSA",
    page: ""
  },

  // Sales WhatsApp number: country code then number, digits only, for example "919000000000".
  // While empty, the WhatsApp button is hidden and "See the program" shows instead.
  salesWhatsApp: "917550077725",
  website: "https://wrench-wise.com/",
  utm: { source: "the-broken-website", medium: "web-app", campaign: "broken-website-2026" },

  // Free live session card on the home and final screens. Turn on when a session is coming up.
  session: {
    enabled: false,
    title: "",
    when: "",
    url: ""
  },

  // Analytics. An empty ID switches that tracker off.
  analytics: {
    ga4Id: "",
    metaPixelId: "1504538090837971"
  },

  // The size each puzzle page is drawn at, before it is scaled to fit the screen.
  devices: {
    phone: { width: 360, height: 740 },
    laptop: { width: 1024, height: 680 }
  },

  scoring: {
    freeRuns: 1, // the first failed check run in a puzzle costs nothing
    beginner: { max: 100, spot: [50, 30, 10], fix: [50, 20, 0], hint: 10, floor: 10 },
    moderate: { max: 200, hint: 30, failedRun: 10, floor: 40 },
    expert: { max: 300, hint: 45, failedRun: 15, floor: 60 },
    escape: { max: 100, hint: 20, wrongCode: 5, freeWrong: 2, floor: 20 },
    ranks: [
      { from: 0, name: "Trainee" },
      { from: 900, name: "Bug Fixer" },
      { from: 1800, name: "Debugger" },
      { from: 2600, name: "Lead Debugger" }
    ]
  },

  limits: {
    maxFileChars: 20000,   // longest a player's edited file may be
    revealAfterRuns: 3,    // "Show the fix" unlocks after this many failed runs, or after all hints
    runCooldownMs: 600     // stops double-taps on Run checks
  },

  // Optional features. false hides the feature completely, with no errors.
  features: {
    sound: true,
    darkTheme: true,
    timer: true,
    console: true,
    saveDrafts: true,
    shareImage: true,
    beforeAfter: true,
    presenterMode: true
  }
};
