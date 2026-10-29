// LOCKED CONTENT. The fictional websites: the hacked museum for the escape room, and one client site per Broken Website level.
// "base" is site-wide CSS the player never sees. It loads before each puzzle's own CSS.
// The businesses are made up. The addresses use the reserved .example domain.
// Field meanings are in content/SCHEMA.md.

export const SITES = [
  {
    id: "museum",
    level: "escape",
    name: "The Night Museum",
    domain: "nightmuseum.example",
    kind: "Online museum, hacked",
    client: "Glitch",
    base: `* {
  box-sizing: border-box;
}
:root {
  --nm-bg: #0d1021;
  --nm-panel: #161a33;
  --nm-line: #2a3058;
  --nm-text: #e8e6f2;
  --nm-muted: #9a98b8;
  --nm-gold: #d4a94a;
  --nm-red: #e5484d;
}
body {
  margin: 0;
  min-height: 100vh;
  font-family: Georgia, "Times New Roman", serif;
  color: var(--nm-text);
  background: radial-gradient(circle at 50% 0%, #1d2350, var(--nm-bg) 60%);
  line-height: 1.5;
}
.room {
  padding: 28px 20px 40px;
  text-align: center;
}
.room-tag {
  margin: 0;
  font: 600 11px/1 system-ui, sans-serif;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--nm-gold);
}
h1 {
  margin: 8px 0 10px;
  font-size: 30px;
  font-weight: normal;
}
.note {
  max-width: 300px;
  margin: 0 auto 18px;
  padding: 10px 14px;
  border: 1px dashed var(--nm-line);
  border-radius: 10px;
  color: var(--nm-muted);
  font-style: italic;
  font-size: 14px;
}`
  },
  {
    id: "kaapi",
    level: "beginner",
    name: "Mylapore Kaapi Club",
    domain: "kaapiclub.example",
    kind: "Cafe website",
    client: "Meena, owner",
    base: `:root {
  --kc-brown: #6b3e26;
  --kc-cream: #fdf6ec;
  --kc-ink: #2b1d14;
  --kc-gold: #b7791f;
}
body {
  margin: 0;
  font-family: Georgia, "Times New Roman", serif;
  color: var(--kc-ink);
  background: var(--kc-cream);
  line-height: 1.5;
}
h1, h2, h3 {
  line-height: 1.2;
  margin: 0 0 8px;
}
h1 {
  font-size: 34px;
}
a {
  color: var(--kc-brown);
}
.wrap {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 20px;
}`
  },
  {
    id: "marina",
    level: "moderate",
    name: "Marina Mart",
    domain: "marinamart.example",
    kind: "Grocery store",
    client: "Arun, operations",
    base: `* {
  box-sizing: border-box;
}
:root {
  --mm-brand: #c2410c;
  --mm-green: #166534;
  --mm-ink: #0f172a;
  --mm-muted: #64748b;
  --mm-line: #e2e8f0;
  --mm-bg: #f8fafc;
  --mm-red: #dc2626;
}
body {
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  color: var(--mm-ink);
  background: var(--mm-bg);
  line-height: 1.45;
}
button,
input {
  font: inherit;
}
button {
  cursor: pointer;
}`
  },
  {
    id: "reel",
    level: "expert",
    name: "Reel Seats",
    domain: "reelseats.example",
    kind: "Movie ticket booking",
    client: "Divya, QA lead",
    base: `* {
  box-sizing: border-box;
}
:root {
  --rs-bg: #0b0b12;
  --rs-panel: #171724;
  --rs-line: #2b2b3d;
  --rs-text: #f4f4f8;
  --rs-muted: #a1a1b5;
  --rs-rose: #f43f5e;
  --rs-amber: #fbbf24;
}
body {
  margin: 0;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  color: var(--rs-text);
  background: var(--rs-bg);
  line-height: 1.45;
}
button,
input {
  font: inherit;
  color: inherit;
}
button {
  cursor: pointer;
}
.btn {
  border: 0;
  border-radius: 999px;
  padding: 11px 18px;
  font-weight: 700;
  background: var(--rs-rose);
  color: #fff;
}`
  }
];
