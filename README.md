# The Broken Website

An interactive web debugging game by Wrench Wise. Three client websites are broken, and a hacker has locked the Night Museum. Read the client ticket, inspect the code, fix the bug, and run checks to restore each website.

Live link: https://the-broken-website.vercel.app/

Built by Wrench Wise.

---

## How to Play in 3 Steps

1. **Read the Ticket:** Every puzzle begins with a ticket from a client explaining what went wrong on their website.
2. **Find the Bug:**
   - In Beginner mode: inspect the code and tap the line causing the issue.
   - In Moderate and Expert modes: edit the code directly in the code editor.
   - In the Escape Room: discover hidden clues in the code, make targeted single-line edits, and enter the password into the room lock.
3. **Run Checks and Restore:** Run the behavior checks in the browser. When all checks pass, the repair sweep restores the live website, awarding points and stars.

---

## How to Run Locally

You only need Python or Node.js. No build steps or bundlers are required.

### Option 1: Python Simple Server (Recommended)
Open a terminal in this directory and run:

```bash
python -m http.server 8000
```

Then open your browser to `http://localhost:8000/`.

### Option 2: Node.js Serve
If you prefer Node.js, run:

```bash
npx serve .
```

Then visit the address shown in your terminal (usually `http://localhost:3000/`).

> Note: Always open the game through an HTTP server, never by double-clicking index.html directly. Browsers require HTTP to load ES modules and sandboxed previews.

---

## How to Run Tests and Verification

### 1. Content Verification Check
Validates all puzzle schemas, answer lines, alternative fixes, checks, and escape room definitions:

```bash
node tools/verify-content.mjs
```

Expected result: `RESULT: ALL PASS`.

### 2. Puzzle Lab (Browser Test Harness)
To run every check on both broken and fixed pages in a live browser, open:

```
http://localhost:8000/tools/puzzle-lab.html
```

Or open the game in self-test mode to verify all 10 engine and scoring checks:

```
http://localhost:8000/?test=1
```

---

## Project Structure

```
the-broken-website/
  index.html            App shell, header, and footer
  manifest.json         PWA application manifest
  config.js             Business settings, WhatsApp numbers, scoring, and limits
  styles/               CSS tokens, base layout, frames, code views, and screens
  assets/               Branding, icons, and social preview images
  content/              Locked puzzle definitions, client sites, and escape rooms
  tools/                Verification scripts and puzzle lab harness
  js/
    engine/             Sandboxed iframe harness, scoring, fixes, and diff engine
    main.js             App bootstrapper, theme initialization, and URL routing
    router.js           Hash-based screen router
    events.js           Application event bus
    copy.js             User interface copy and localization
    content.js          Content loading helper
    progress.js         Progress tracking and localStorage persistence
    theme.js            Light and dark theme controller
    share.js            Social score sharing and image generation
    demo.js             Automated demonstration runner
    presenter.js        Live session presenter mode
```

---

## Built by Wrench Wise
Created for developers, students, and aspiring engineers to master real-world web debugging. Visit https://wrench-wise.com/ to learn more about our certification programs.
