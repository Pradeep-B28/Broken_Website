# The Broken Website: Project Brief (v1, built to upgrade)

You are building a web game in this folder. Read this whole file before writing any code. Then read `content/SCHEMA.md`. Follow the phases in Section 11 in order, and stop at the end of each phase.

Some files are already here. Keep them:
- `config.js`: every business setting (Section 5)
- `content/`: the hacked museum and its 5 escape rooms, the three client websites and their 15 puzzles (all written and tested), and `SCHEMA.md`
- `js/engine/sandbox.js` and `js/engine/harness.js`: the locked code that loads a puzzle page safely and runs its checks
- `js/engine/fixes.js`, `js/engine/diff.js`, `js/engine/score.js`, `js/engine/lock.js`: locked helpers for fixes, line diffs, scoring, escape room codes and the escape timer
- `tools/verify-content.mjs`: the content check (runs in Node)
- `tools/puzzle-lab.html` and `tools/lab.js`: the browser check that proves every puzzle and escape room works
- `package.json`: only so Node can run the content check. It has no dependencies. Never add any.

---

## 1. What we are building

The Broken Website is a web game with two modes. Before playing, the player answers one question: how much code have you written? The answer sends them to the right place.

| The player says | They go to |
|---|---|
| I've never written code | The Escape Room |
| I know a little HTML or CSS | The Broken Website, Beginner |
| I've built small projects | The Broken Website, Moderate |
| I code regularly | The Broken Website, Expert |

The answer is a suggestion, never a lock. Everyone can switch anytime, and every level stays open.

**Mode 1: The Escape Room** (no coding needed). A hacker called Glitch has locked the Night Museum's website, and the player is trapped inside. Five rooms, five codes, and every clue is hidden in the page's code: an old code in a comment, a wall that is switched off, a message only the console hears, a button locked twice, and a clock that can never reach zero. The player reads the code in a built-in code viewer, taps a line to change it, and types each room's code into a lock. It works fully on a phone. The finish line: "You just edited a website's code to escape. Developers do this every day." Then a nudge to try Beginner.

**Mode 2: The Broken Website** (Beginner, Moderate, Expert). Three real-looking client websites are broken, and the support tickets are waiting. The player is the developer on call.

- **Beginner: Mylapore Kaapi Club**, a cafe website. Spot and pick: read the client's ticket, look at the broken page, tap the exact line of code that causes it, then pick the right fix from four.
- **Moderate: Marina Mart**, a grocery store. Edit the real code: two bugs per puzzle, fixed by typing in a code editor, proven by running checks.
- **Expert: Reel Seats**, a movie ticket booking site. Edit the real code: three or four bugs per puzzle, including race conditions, closures and stacking contexts.

Five puzzles per level, 15 in total. They are deliberately tough. Every one was tested in a real browser: the broken page fails its checks, the fixed page passes, alternative correct fixes pass, and fixing only some of the bugs still fails. The escape rooms were tested the same way: each code is hidden at the start, the intended edit reveals it, and tempting half-fixes (the traps) do not.

The headline moments: the museum doors sliding open when a code is right, the broken page glitching inside a browser frame, the line lighting up when you find it, the **repair sweep** that turns the page from broken to fixed, the checks ticking green one by one, and the **"Site restored"** before and after slider at the end of a level. Spend the most care there.

**The message.** For the escape room: you just edited a website's code to escape, and developers do this every day. For the Broken Website: real developers spend most of their time fixing, not writing, and if you can fix these bugs, you think like a developer. We never promise a job, an interview or a result.

**It must look like it belongs to wrench-wise.com.** The game itself uses the site's colours, font, buttons and white cards (Section 7). The client websites inside it keep their own looks, because they are someone else's sites.

**The business goal.** A lead magnet for the Certification Program in AI-Powered Full Stack Development, with the Certification Program in AI-Powered Software Engineering & DSA as the backup. Someone who escapes or finishes a level is a high-intent lead. The sales team gets the player's own answer to "how much code have you written?", their escape time or score, and their rank in the first message.

Who it is for:
- **People who have never coded:** students from any stream, career switchers and the curious. They get the escape room.
- **Students and freshers** who know a little HTML, CSS and JavaScript and want to test themselves.
- **Career switchers** who want to see what development work actually feels like.
- **Working developers**, who will go straight to Expert and share their rank.
- **Reel viewers.** It must look great in screen recordings, vertical and horizontal.

When there is a trade-off, follow this order:
1. Player code only ever runs inside the sandbox (Section 2, rule 4).
2. The level picker, the escape room doors, the puzzle screen, the repair sweep and the checks look stunning.
3. Every check result and every score is exactly right (Section 10).
4. It runs smoothly on a mid-range Android phone.
5. The WhatsApp and share buttons work in one tap.
6. It is easy to upgrade (Section 3).
7. Everything else.

---

## 2. Hard rules

1. **Code.** Plain HTML, CSS and JavaScript (ES modules) only. No frameworks, libraries, CDNs, npm packages or web fonts. That includes the code editor: build it yourself (6F). The only image files are the logo, the link preview image and app icons. Draw everything else in code.
2. **Front-end only.** No backend, database, API keys, AI calls or accounts.
3. **Locked files.** Never edit anything in `content/`, `js/engine/` or `tools/`. At the start of every phase, run `node tools/verify-content.mjs` (it must end with `RESULT: ALL PASS`) and open `tools/puzzle-lab.html` (it must show `RESULT: ALL PASS`). If you think a puzzle, check or engine rule is wrong, stop and tell me. Do not fix it yourself.
4. **The sandbox is the only place player code runs.** Player code (what the puzzle files contain and what the player types) is loaded only with `load()` from `js/engine/sandbox.js`, into an iframe. Never add `allow-same-origin` or any other permission to that iframe, never change its Content Security Policy, never `eval` or `new Function` anything, never put player code into the app's own page, and never read anything from inside the iframe except through `load()`.
5. **One engine.** Only the engine files load puzzle pages, apply fixes, diff code and calculate points. No other file does that work.
6. **Storage.** `localStorage` may hold only: `tbw-theme`, `tbw-muted`, `tbw-progress` (progress and best scores, Section 6B) and `tbw-draft-<puzzle or room id>` (the player's edited files, when `features.saveDrafts` is on). Wrap every read and write in try and catch, and make the game work fine when storage is blocked.
7. **No personal data.** The game never asks for a name, phone number or email.
8. **External scripts.** Only GA4 and the Meta Pixel, and only when their IDs are set in `config.js`. Never load them with `?test=1`, `?demo=1` or `?present=1`.
9. **Tone.** Never mock the player. Wrong answers get a helpful reason, never a joke at their expense. Never promise a job, an interview or a result. Never use these anywhere a user can see them: stupid, dumb, idiot, noob, loser, useless, "take your job", "replace you", guarantee, placement, salary, lakh, "get hired", "seats left", or any countdown.
10. **Program names.** Always the full name from `config.js`. Never shorten it.
11. **Writing style.** All UI text and docs are in plain English with short sentences. No emojis. No em dashes (the long dash).
12. **Safety.** Never use `innerHTML` or `insertAdjacentHTML` with changing values. Code is shown with text nodes and `textContent` only, including syntax highlighting. Players will paste strange things into the editor.
13. **Hidden means hidden.** `base.css` must include `[hidden] { display: none !important; }`. (In an earlier project, a CSS rule kept a "hidden" debug panel visible on the live site. Puzzle m1 in this game teaches exactly this bug.)
14. **No debug output live.** No debug panels, test overlays or `console.log` in the live game. Test output appears only with `?test=1`.
15. **File size.** One job per file, under about 350 lines. Start every JS file with a 3-line comment: what it does, what it uses, what uses it.
16. **Phases.** At the end of every phase, stop and give a Phase Report (Section 12). Do not start the next phase until I say so.
17. **Stubborn bugs.** If the same bug survives two fix attempts, stop. Explain it in plain words and give me options. Do not keep looping.
18. **My actions.** I am not from a tech background. When you need me to do something (click, log in, approve), give numbered click-by-click steps.
19. **Commands.** Before running a terminal command, tell me in one line what it does.
20. **Branding.** Wrench Wise only. The Night Museum, Glitch, the three client businesses, their people and addresses are all made up and must stay exactly as written in `content/`. No real company names, logos or brand colours anywhere.

---

## 3. Built to upgrade

We have rebuilt earlier apps to add features. This one must be easy to grow. **An upgrade should feel like adding data or one new file, not rewriting code.**

1. **One settings file.** `config.js` holds every business setting. Changing the WhatsApp number, the program, scoring, limits, links, analytics IDs or features must never need a code change anywhere else.
2. **One text file.** `js/copy.js` holds every word the player sees, except content (puzzle text, site names). Group the text by screen. Fill values with a small `t(key, values)` function, for example `t("level.progress", { n: 3, total: 5 })`. When a value named `n` is 1 and a key ending in `.one` exists, `t()` uses that key. A Tamil version later is a new `copy.ta.js`, not a rewrite.
3. **Content as data.** Sites and puzzles live in `content/`, follow `SCHEMA.md` and are listed in `content/index.js`. The game reads them only through `js/content.js`. A 16th puzzle, a 6th room or a new level must need no code change.
4. **Screens are modules.** `js/router.js` shows one screen at a time and keeps the address in the hash (`#/`, `#/start`, `#/escape`, `#/room/r2`, `#/escaped`, `#/level/moderate`, `#/puzzle/m3`, `#/done/moderate`, `#/result`), so the back button and shared links work. Each screen file exports `mount(root)`, `enter(params)` and `leave()`. Adding a screen means one new file and one line in the router's list.
5. **An event bus.** Game code never calls sound, analytics or sharing code directly. It sends events through `js/events.js` (`emit(name, data)` and `on(name, handler)`), and those modules listen. Use exactly these events:

| Event | Data |
|---|---|
| `app:ready` | none |
| `level:open` | `level` |
| `path:choose` | `path` (`escape`, `beginner`, `moderate`, `expert`) |
| `room:start` | `id` |
| `room:edit` | `id`, `file`, `line` |
| `code:try` | `id`, `result` (`right`, `decoy`, `wrong`) |
| `room:escaped` | `id`, `points`, `stars`, `seconds`, `hints`, `wrongCodes` |
| `room:skip` | `id` |
| `escape:done` | `seconds`, `points` |
| `puzzle:start` | `id`, `level` |
| `spot:tap` | `id`, `file`, `line`, `correct` |
| `fix:pick` | `id`, `option` (0 to 3, the position in content), `correct` |
| `hint:open` | `id`, `n` (1 to 3) |
| `checks:run` | `id`, `passed`, `total`, `status` |
| `puzzle:solved` | `id`, `level`, `points`, `stars`, `seconds`, `hints`, `tries` (spot and fix tries, or failed runs) |
| `solution:reveal` | `id` |
| `level:done` | `level`, `points`, `stars` |
| `result:shown` | `solved`, `total`, `rank` |
| `cta:sales` | `spot` (`escaped`, `level`, `result`) |
| `cta:program` | `spot` |
| `cta:website` | `spot` (`home`, `result`, `footer`) |
| `cta:session` | none |
| `share:image` | `size` (`post`, `status`) |
| `share:whatsapp` | none |
| `share:copy` | none |
| `theme:change` | `theme` |
| `sound:toggle` | `muted` |

6. **Logic without the page.** `content.js`, `progress.js`, `links.js` and the engine files contain no DOM code. They take inputs and return results, so they are testable and reusable.
7. **Design tokens.** Every colour, shadow and easing lives in `styles/tokens.css`. JavaScript reads tokens with `getComputedStyle`. A new look touches one file.
8. **Feature flags.** Every optional feature checks `config.features`. Turning one off hides it cleanly, with no errors and no empty gaps.
9. **Versions.** `config.version` (starting at 1.0.0) shows in the footer as "v1.0.0". The self-test prints it with `CONTENT_VERSION`. Keep `CHANGELOG.md`. Tag each release in git (`v1.0.0`).
10. **Saved progress survives upgrades.** `tbw-progress` is `{ v: 1, path, puzzles: { b1: { solved, points, stars, revealed, seconds } }, rooms: { r1: { solved, points, stars, skipped, seconds } }, escape: { seconds, done } }`. `path` is the picker answer, or null. Unknown puzzle and room ids are ignored, missing ones count as not started. If `v` is not 1, start fresh rather than crash.
11. **Tests grow with features.** Every feature adds its own checks to `selftest.js`. All must pass before any release.
12. **Upgrades use branches.** v1 deploys from `main` in Phase 7. Every later upgrade happens on a branch named `upgrade-<name>`, gets a Vercel preview link, and is merged only after I reply "Ship it".

---

## 4. Tech setup

- Check `node --version` is 18 or newer.
- Run locally with a simple static server: `npx serve .` If that fails, use `python -m http.server 8000`. Files must be opened through the server, not by double-clicking, because ES modules do not work from `file://`.
- Use ES modules (`<script type="module">`).
- Folder structure (new files in plain text, files already here marked "given"):

```
the-broken-website/
  index.html
  manifest.json
  package.json          given
  config.js             given
  styles/
    tokens.css          every colour, shadow and easing (Section 7)
    base.css            reset, layout, header, footer, buttons, cards
    game.css            home, level and result screens
    puzzle.css          puzzle screen, ticket, options, checks list
    code.css            code view, editor, syntax colours, diff view
    browser.css         browser frame, glitch, repair sweep, before and after
  assets/               logo.png (I provide), og-image.png, app icons
  content/              given and locked
  tools/                given and locked (verify-content.mjs, puzzle-lab.html, lab.js)
  js/
    engine/             given and locked (sandbox, harness, fixes, diff, score, lock)
    main.js             starts the app, reads URL flags, starts the router
    router.js           hash routes, one screen at a time
    events.js           tiny event bus
    copy.js             every piece of UI text, and t()
    content.js          loads content, lookups, fixed files per puzzle. No DOM
    progress.js         solved state, points, stars, totals, rank, unlocks. No DOM
    store.js            safe localStorage for the allowed keys
    links.js            WhatsApp links, share text, UTM links, analytics payloads. No DOM
    theme.js            light and dark switch
    sound.js            Web Audio sounds and mute
    share.js            share sheet, WhatsApp, copy link
    shareImage.js       draws share images on a canvas
    analytics.js        GA4 and Meta Pixel, listening to events
    demo.js             demo mode
    presenter.js        presenter mode (nice to have)
    selftest.js         runs with ?test=1
    screens/
      home.js           hero, level cards
      level.js          one site and its five puzzles
      spot.js           a beginner puzzle
      edit.js           a moderate or expert puzzle
      done.js           level complete, before and after
      result.js         the overall result and the CTA
      picker.js         "How much code have you written?"
      escape.js         the escape room intro
      room.js           one escape room
      escaped.js        the escape room finish and the CTA
    ui/
      browser.js        browser frame, preview scaling, glitch, repair sweep
      codeview.js       read-only code with tappable lines (beginner)
      editor.js         the code editor (moderate and expert)
      highlight.js      syntax colouring with text nodes
      checks.js         the animated checks list
      console.js        the console panel
      ticket.js         ticket card and acceptance list
      hints.js          hint drawer
      diffview.js       "Show the fix" view
      beforeAfter.js    the before and after slider
      countup.js        counting numbers
      stars.js          star rating with a pop
      lineEditor.js     tap a line, edit it in a sheet (escape room)
      lock.js           the code lock (escape room)
      doors.js          the doors opening (escape room)
```

- **How to call the engine:**
  - `load(iframe, { files, base, checks, onLog, onError })` from `sandbox.js` returns `{ done, stop }`. `done` resolves once with `{ status, results, logs, errors }`. Status is `ready` (a preview finished loading), `done` (checks finished; `results` is a list of `{ name, pass, msg }`), `timeout` or `stopped`. For a preview, pass no `checks`, and `onLog` and `onError` keep firing as the player clicks around, until `stop()` or the next `load()` on the same iframe. `base` is the site's `base` CSS from `content/sites.js`.
  - `applyFixes(files, fixes)` gives the fixed files. `touchedLines(files, fixes)` gives the broken lines a fix changes.
  - `diffLines(oldText, newText)` and `diffStats(ops)` for the "Show the fix" view and demo mode.
  - `puzzlePoints(level, stats, config.scoring)`, `stars(level, points, config.scoring, revealed)`, `maxTotal(counts, config.scoring)` and `rankFor(total, config.scoring.ranks)`. Read the comments at the top of `score.js` for what `stats` holds.
  - `checkCode(room, input)` from `lock.js` returns `{ result, reply }`, where result is `right`, `decoy`, `wrong` or `empty`. `formatClock(seconds)` gives the escape timer text. Escape room points use `puzzlePoints("escape", { wrongCodes, hints, revealed })`.
- **Drawing puzzle pages.** Each puzzle page is drawn at its `device` size from `config.devices` (phone 360 x 740, laptop 1024 x 680), then scaled with a CSS `transform` to fit the preview area. Never resize it to fit: the checks depend on that exact size.
- **Checks run in the visible preview.** Never run checks in a hidden or off-screen iframe. Browsers slow those down, and timing checks (m4, e2) would fail. "Run checks" reloads the visible preview with the checks.
- **One animation loop** for UI motion that needs JavaScript, using `requestAnimationFrame` and delta time capped at 0.05 s. CSS animations are fine for simple motion. Pause everything when the tab is hidden.
- Add a `.gitignore` with `node_modules/`, `.DS_Store` and `Thumbs.db`.

---

## 5. config.js

`config.js` is already in the folder. Keep its structure and comments. You may change only:
- `salesWhatsApp`, when I give you the number
- `siteUrl`, in Phase 7

What each setting does:
- `program` and `secondProgram`: the programs the result screen recommends, with their full names. `page` is the program page on wrench-wise.com, or `""` to use the main website.
- `salesWhatsApp`: digits only, country code first, 11 to 15 digits. If empty or not in that format, hide the WhatsApp button and show "See the program" instead.
- `website` and `utm`: build every link to wrench-wise.com, adding `utm_content` (`home`, `level`, `result` or `footer`).
- `session`: when `enabled` is true, show the free session card on the home and result screens.
- `analytics`: an empty ID switches that tracker off.
- `devices`: the size each puzzle page is drawn at.
- `scoring`: points per level and per escape room, hint, run and wrong-code costs, stars and ranks. Only `score.js` uses these.
- `limits`: `maxFileChars` (the editor stops accepting text past this, with a note), `revealAfterRuns` (when "Show the fix" unlocks), `runCooldownMs`.
- `features`: switches. Every optional feature checks its switch.

---

## 6. Features

### Must have

**A. Home screen**
- **Background:** `--bg-grad` with a very faint grid (24px squares, `--brand` at 5% opacity) and two large soft glows (`--accent` at 8%) drifting slowly, 20 to 30 second loops.
- **Hero:** a browser frame (6E) showing the Kaapi Club hero section, with the b1 broken files. Every 6 seconds it glitches for 400 ms, then the repair sweep plays and it shows the fixed version for 3 seconds, then flips back to broken. On laptop it is tilted in 3D (rotateX 6deg, rotateY -10deg) and follows the pointer by up to 5 degrees. Flat on phone. Pointer events off inside the frame.
- **Text:** eyebrow chip "A debugging game". Title "The Broken Website" in weight 800, with the word "Broken" in `--broken` and a gentle RGB-split glitch on it every few seconds. Subtitle and the primary button "Start", which opens the level picker (6S). Once the player has picked, it reads "Continue" and opens their next unsolved room or puzzle.
- **Four level cards:** Escape Room first, then Beginner, Moderate and Expert. Each shows a small live preview of its first room or puzzle (scaled down, pointer events off, loaded only when the card scrolls into view), the level name, the site name and kind, the level blurb, a progress line ("3 of 5 fixed", or "3 of 5 rooms" for the escape room), stars earned and best points (best time for the escape room). The card matching the player's picker answer has a "Your level" tag. All four are open from the start.
- **How it works:** three small steps with inline SVG icons (`home.how1` to `home.how3`).
- **Your result** link, once the player has solved at least one puzzle.
- **Session card**, if `config.session.enabled`.
- **Layout:** phone stacked; laptop with the text left and the hero right, level cards in a row of four below (two by two under 1024px).

**B. Progress** (`progress.js`, no DOM)
- Tracks each puzzle: solved, points, stars, revealed, seconds. Keeps the best points if a puzzle is played again.
- Inside a level, puzzle 1 is open and each next puzzle opens when the one before is solved or revealed.
- Gives level totals (points, stars, solved count), the game total, `maxTotal` (3,000) and the rank from `rankFor`.
- Saves to `tbw-progress` (Section 3, rule 10).

**C. Level screen**
- Header: a browser-style card with the site's name, domain, kind and client.
- Five puzzle cards: number, title, concept chips, device icon (phone or laptop), status (Not started, Fixed, Seen the fix, Locked), stars and best points. Locked cards say what to solve first.
- "Restored 3 of 5" with a progress bar in `--fixed`.
- When all five are done, a button to the level complete screen.

**D. The puzzle screen** (shared by spot and edit)
- **Top bar:** back to the level, "Beginner, puzzle 2 of 5", the timer (when `features.timer` is on; counts up, pauses when the tab is hidden), and the points still available.
- **Ticket card** (`ui/ticket.js`): "From Meena, owner, Mylapore Kaapi Club" (from the site's `client` and `name`), the ticket text, and the symptom line. Edit puzzles also show "Acceptance" with the `accept` list as a checklist that ticks as matching checks pass.
- **Preview:** the browser frame (6E) with the puzzle's broken page, live and clickable.
- **Code:** tabs index.html, styles.css and script.js, with line numbers.
- **Layout on laptop:** three columns: ticket and checks on the left (320px), preview in the middle, code on the right. **On phone:** the ticket at the top, then a segmented control "Page / Code / Checks" switching the main area, with the action button in a sticky bottom bar.
- **Hints** (`ui/hints.js`): a "Hint" button opens the next hint in a drawer, showing its cost first ("Hint 2 of 3 costs 30 points"). Opened hints stay readable.
- **Console** (`ui/console.js`, when `features.console` is on): a collapsible panel listing the preview's `console.log` output and errors, newest last, errors in `--broken`. A badge shows the error count. This is part of learning to debug, so make it clear and calm.

**E. Browser frame, glitch and repair sweep** (`ui/browser.js`)
- A rounded window with a top bar: three dots, back and refresh icons, and an address pill showing a lock icon and the site's `domain` with the puzzle path, like `kaapiclub.example/menu`.
- A status tag in the bar: "Broken" in `--broken` while unsolved, "Fixed" in `--fixed` after.
- **Glitch** (while broken): every 4 to 7 seconds for 300 ms, the frame jitters by 2px, a red and cyan split shadow flashes on its edge, and faint scanlines pass over the page (an overlay, never inside the iframe). Calm, not seizure-like: never more than 3 flashes per second.
- **Repair sweep** (when solved): a second iframe loads the fixed page under the broken one. A bright horizontal band (`--sweep`) moves top to bottom over 900 ms, and the broken page is clipped away behind it (`clip-path: inset()`), revealing the fixed page. The tag flips from Broken to Fixed with a small scale pop. A soft chime plays.
- Refresh icon reloads the preview with the current files.

**F. Code view and editor**
- **Code view** (`ui/codeview.js`, beginner): read-only, each line a button with its number, at least 28px tall, full width, coloured by `ui/highlight.js`. Long lines scroll sideways inside the panel, never the page.
- **Editor** (`ui/editor.js`, moderate and expert), built by hand:
  - A `<textarea>` exactly on top of a highlighted `<pre>` (same font, size, line height, padding and tab size), with a line number gutter. The textarea text is transparent with a visible caret. Scroll positions stay in sync.
  - Tab inserts 2 spaces, Shift+Tab removes them, Enter keeps the current indent. Use `document.execCommand("insertText")` for these so Ctrl+Z still works.
  - `spellcheck`, `autocapitalize` and `autocorrect` off. Font 13px on phone, 14px on laptop, mono font from Section 7.
  - A dot on a tab shows that file has changes. "Reset this file" and "Reset all" (with a confirm) restore the broken files.
  - The live preview reloads 600 ms after typing stops.
  - Drafts save to `tbw-draft-<id>` 1 second after typing stops (when `features.saveDrafts` is on) and load when the puzzle opens, with a note "Restored your last edits" and an undo link.
- **Highlighting** (`ui/highlight.js`): a small tokenizer per language, building spans with `textContent`. HTML: tags, attributes, strings, comments. CSS: selectors, properties, values, numbers, comments, at-rules. JS: keywords, strings, numbers, comments, regex is fine as plain text. Fast enough to re-run on every keystroke for 200 lines.

**G. Spot mode** (`screens/spot.js`, beginner)
1. **Find it.** The instruction "Tap the line that causes this". The player may switch tabs. A tap on a line in `answer` (any listed file and line) is right: the line glows `--fixed`, and step 2 opens. A wrong tap shakes that line, tints it `--broken` for 800 ms and says "Not this line". Count the tries.
2. **Fix it.** Four option cards, shuffled per visit (demo mode uses content order). A wrong pick shows its `why` on the card and greys it out. The right pick shows its `why` in green.
3. **The fix lands.** The changed lines in the code view animate: the old line strikes through and fades, the new line types in (from `diffLines` of broken and fixed). Then the repair sweep, then the checks run visibly on the fixed page (6I), then the explanation card (6J).
- Points: `puzzlePoints("beginner", { spotTries, fixTries, hints })`.
- After 3 wrong taps, the Hint button pulses once.

**H. Edit mode** (`screens/edit.js`, moderate and expert)
- **Run checks** (primary button, Ctrl+Enter or Cmd+Enter) reloads the visible preview with the checks and shows results (6I). Disabled for `runCooldownMs` after a run and while one is running.
- A run with any failed check counts as a failed run. All checks passing solves the puzzle: the repair sweep from the original broken page to the player's own working page, the explanation card, points from `puzzlePoints(level, { failedRuns, hints })`.
- **Show the fix** unlocks after `revealAfterRuns` failed runs or after all 3 hints. It asks to confirm ("You will get 0 points for this puzzle"), then opens `ui/diffview.js`: each changed file as a diff of broken and fixed, with removed lines in `--broken` tint and added lines in `--fixed` tint, plus "Copy the fix into the editor". Marks the puzzle revealed. Send `solution:reveal`.
- If a run returns `timeout`, say "Your page never finished loading. Check for a loop that never ends, or an unclosed tag or comment." and count it as a failed run.
- If the editor content is longer than `limits.maxFileChars`, stop accepting text and say so.

**I. Checks list** (`ui/checks.js`)
- Each check is a row: a status icon, its name and, when failed, its message under it in plain text.
- While running: rows appear one by one, 120 ms apart, with a small spinner. Results land top to bottom, 150 ms apart: a green tick that draws itself, or a red cross with a short shake. A rising note plays for each pass.
- A summary line: "4 of 5 checks pass". `aria-live` reads it.

**J. Solved card**
- "Fixed" stamp (scale 1.4 to 1, rotated -6deg, 220 ms), points counting up, stars popping in one by one.
- The explanation: "What was wrong" (`explain.what`), "Why it happens" (`explain.why`), "Pro tip" (`explain.tip`), and the concept chips.
- Buttons: "Next puzzle" (primary), "Back to level". On the last puzzle of a level, "See the restored site".

**K. Level complete** (`screens/done.js`)
- Title from copy: "Mylapore Kaapi Club is back online".
- **Before and after slider** (`ui/beforeAfter.js`, when `features.beforeAfter` is on): the broken and fixed pages of a puzzle on top of each other, a draggable handle (pointer and keyboard arrows) revealing one over the other. Five small tabs pick the puzzle. It opens on puzzle 5 and auto-plays one slow sweep.
- Level points counting up, stars, puzzles solved, then "Next level" (primary) and "See my result".
- Send `level:done`.

**L. Result screen** (`screens/result.js`)
- Total points out of 3,000 in a large count-up, the rank, puzzles solved out of 15, and stars per level. If the player has played the escape room, a row above shows rooms escaped and the best escape time.
- **The program card:** "Want to fix bugs like this for real?" with the full program name, a short line from copy, "Talk to us on WhatsApp" (the sales link, Section 10) when `salesWhatsApp` is valid, and "See the program". A smaller line under it for the second program.
- The session card if on, and the share card (6M).
- "Play again" (keeps best scores) and "Back to levels".

**M. Sharing** (`share.js`, `shareImage.js`)
- "Share my score": makes the share image and opens the phone share sheet with the image and the share text when `navigator.canShare({ files })` is true. Otherwise downloads the PNG as `broken-website-2140.png`.
- "Send on WhatsApp": `https://wa.me/?text=` plus the encoded share text.
- "Copy link": copies the site address. Changes to "Copied" for 2 seconds.
- Size pills: "Status" (1080 x 1920, default) and "Post" (1080 x 1350).
- **Escape room version:** shared from the finish screen (6V), with the escape share text (Section 10) and an image showing the open museum doors, the escape time and the rooms escaped.
- **The share image:** `--bg-grad` background, a 6px brand gradient bar, the logo, "The Broken Website" in weight 800, a drawn browser frame with a green "Fixed" tag, the score huge ("2,140" with "of 3,000"), the rank, three rows for the levels with their stars, and "Can you beat that?" with the site address. Never any code the player typed. Nothing important within 220px of the top or bottom edge in the Status size.

**N. Sound** (`sound.js`)
- Web Audio only, synthesised in code. Create the AudioContext on the first tap.
- Glitch: a 120 ms filtered noise burst, gain 0.03. Tap a line: a soft 4 ms click. Wrong: a low 180 Hz blip, 120 ms. Check pass: a 60 ms sine, each pass 2 semitones higher. Check fail: a short muted thud. Solved: a three-note rising chime. Level done: a slightly longer four-note phrase.
- Master volume 0.25. A speaker button in the header mutes and unmutes and saves `tbw-muted`. Respect `features.sound`.

**O. Branding**
- **Header:** the logo (`assets/logo.png`, 28px tall), a thin divider, "The Broken Website" in weight 800. On the right: the mute button and the theme button. A 3px brand gradient bar under the header. If the logo is missing, use a text wordmark "Wrench Wise".
- **Footer:** "Built with code by Wrench Wise", a link "Learn to build apps like this" (website with UTM, `utm_content=footer`) and the version.

**P. Layout**
- **Phone portrait first** (360 to 430px wide).
- **The reel frame:** at 390 x 844, a beginner puzzle shows the ticket, the preview and the code view's answer line without scrolling once "Code" is selected, and the solved card shows the stamp, points and stars without scrolling.
- **Laptop (1024px and wider):** the three-column puzzle screen. Max content width 1280px on the puzzle screen, 1100px elsewhere.
- **General:** use `100dvh`, respect `env(safe-area-inset-*)`, touch targets at least 44px (code lines at least 28px), no horizontal page scroll at any width from 360px up.

**Q. Demo mode** (for recording reels)
- Opens with `?demo=1`. Options: `&puzzle=b1` to `&puzzle=e5` or `&room=r1` to `&room=r5` (default b2), `&theme=light` or `&theme=dark`, `&loop=0` to stop after one run.
- A visible tap dot (a 28px translucent circle) does everything:
  - **Beginner:** shows the ticket for 2 s, switches to Code, taps one wrong line, then the right line, picks one wrong option (its why shows for 1.5 s), then the right one, and lets the fix, sweep, checks and solved card play.
  - **Edit puzzles:** shows the ticket for 2 s, taps Run checks once on the broken code (red results), then for each changed file opens its tab and types the fix from `diffLines` (deleted lines vanish, added lines type at 25 ms per character), runs checks again (green), and lets the solved card play.
  - **Escape rooms:** shows the story for 2 s, opens the code, scrolls to the clue, taps the line and makes the intended edit in the line editor (typing at 25 ms per character), shows the result in the room (or the Console for r3), types the code into the lock, and lets the doors open. For r1, which needs no edit, it highlights the clue lines one by one instead.
  - Holds the solved card for 3 s, then starts again.
- Demo mode never sends analytics, never saves anything and never changes progress.

**R. Analytics** (`analytics.js`, listening to events only)
- Load only when the ID is set in `config.js`. Never with `?test=1`, `?demo=1` or `?present=1`.
- Build every payload in one pure function, `payloadsFor(eventName, data)` in `links.js`. The self-test checks it.
- **GA4.** Set `page_location` to the page address without the query. Events:

| GA4 event | Parameters |
|---|---|
| `level_open` | `level` |
| `path_choose` | `path` |
| `room_start` | `room` |
| `code_try` | `room`, `result` |
| `room_escaped` | `room`, `points`, `seconds`, `hints`, `wrong_codes` |
| `room_skip` | `room` |
| `escape_done` | `seconds`, `points` |
| `puzzle_start` | `puzzle`, `level` |
| `spot_tap` | `puzzle`, `correct` |
| `fix_pick` | `puzzle`, `option`, `correct` |
| `hint_open` | `puzzle`, `hint` |
| `checks_run` | `puzzle`, `passed`, `total` |
| `puzzle_solved` | `puzzle`, `level`, `points`, `stars`, `seconds`, `hints`, `tries` |
| `solution_reveal` | `puzzle` |
| `level_done` | `level`, `points`, `stars` |
| `result_view` | `solved`, `total`, `rank` |
| `whatsapp_sales_click` | `spot`, `total` |
| `program_click` | `spot` |
| `website_click` | `spot` |
| `session_click` | none |
| `share_image` | `size` |
| `share_whatsapp` | none |
| `copy_link` | none |

- **Meta Pixel.** `PageView` on load. The standard `Lead` event on the WhatsApp sales click. Custom events `PathChosen` (`path`), `EscapeDone` (`seconds`), `PuzzleSolved` (`level`) and `LevelDone` (`level`, `points`).
- Send nothing else. **Never any code the player typed.**
- `hint_open`, `solution_reveal` and `checks_run` per puzzle show which puzzles are too hard, and `puzzle_solved` by level shows how far people get. `room_skip` and `code_try` do the same for the escape room, and `path_choose` shows who the game attracts. See `UPGRADE_GUIDE.md`.

### Escape room and level picker (must have)

**S. Level picker** (`screens/picker.js`, `#/start`)
- Title "How much code have you written?" and four large cards, each with an inline SVG icon, the answer in the player's own words, and one line on where it leads:
  1. "I've never written code": "Escape the hacked museum. No coding needed." Goes to `#/escape`.
  2. "I know a little HTML or CSS": "Beginner: spot the bug, pick the fix." Goes to `#/level/beginner`.
  3. "I've built small projects": "Moderate: fix real code." Goes to `#/level/moderate`.
  4. "I code regularly": "Expert: race conditions, closures and worse." Goes to `#/level/expert`.
- Under them: "You can switch anytime." Cards enter 60 ms apart. The chosen card lifts slightly, then the screen slides away.
- Saves `path` in progress and sends `path:choose`. A "Change level" link on every level, puzzle and room screen opens the picker again.

**T. Escape room intro** (`screens/escape.js`, `#/escape`)
- A dark, cinematic screen: the museum's browser frame flickers to "Connection lost", then Glitch's message types out line by line (`escape.intro`), with five locked room dots and the button "Enter the museum". It shows the best time if the player has escaped before.
- The escape timer starts when room 1 opens, runs across all five rooms, pauses when the tab is hidden, and shows with `formatClock`.

**U. A room** (`screens/room.js`, `#/room/r1`)
- **Top bar:** back, "Room 2 of 5, The Gallery", the escape timer, hints and "Change level".
- **Story card:** the room's `story`, then its `goal` in bold.
- **The room:** the browser frame (6E) with the museum page, live and clickable. The status tag shows a padlock and "Locked by Glitch" instead of "Broken". No glitch effect here; instead the page's light flickers softly once every 8 to 12 seconds.
- **Code viewer:** the read-only code view from 6F (tabs, line numbers, highlighting), with the note "Tap any line to change it".
- **Line editor** (`ui/lineEditor.js`): tapping a line opens a bottom sheet showing "styles.css, line 22", the line in a single-line mono input (no autocorrect, spellcheck or autocapitalise), and "Apply" and "Cancel". Apply replaces that line, reloads the room and puts a dot in the gutter. An "Undo" chip undoes the last change. "Reset room" (with a confirm) restores the original files. Edits save as a draft like 6F.
- **Console** (6D) under the room, collapsed until something is logged. The first time a message arrives it opens by itself with a soft ping. Room 3 depends on it.
- **The lock** (`ui/lock.js`): a large input styled like a museum keypad, labelled by the room's `format` ("Letters", "Digits"), and an "Unlock" button. Uses `checkCode`:
  - `right`: the doors open (below).
  - `decoy`: the room's reply in an amber note, tagged "Glitch left that on purpose".
  - `wrong`: a short shake and "That's not it."
  - `empty`: nothing happens.
  - Wrong and decoy tries count for scoring. Send `code:try`.
- **Phone layout:** a segmented control "Room / Code" switches the main area, the lock sits in a sticky bottom bar, and the story card shrinks to one line after the first scroll. **Laptop:** story and lock on the left, the room in the middle, the code on the right.
- **Hints:** 3 per room, each costing `scoring.escape.hint` points. After the third hint, "Skip this room" appears. It shows the code with a short explanation and gives 0 points for the room. Send `room:skip`.
- **The doors open** (`ui/doors.js`): two dark panels close over the room frame, a light line glows down the middle, then the panels slide apart over 700 ms. A low unlock thunk and a short rising chime play. Then a "What you just did" card with the room's `explain` (what, why, tip), the concept chips, points and stars, and "Next room".
- Points: `puzzlePoints("escape", { wrongCodes, hints, revealed })`. Rooms open in order. Send `room:start`, `room:edit` for each applied edit, and `room:escaped`.

**V. Escape room finish** (`screens/escaped.js`, `#/escaped`)
- "You escaped." with the escape time huge (`formatClock`), points out of 500 and the five rooms with their stars.
- The pitch in its own card: "You just edited a website's code to escape. Developers do this every day."
- "Ready for real bugs?" with the primary button "Try the Beginner level".
- The program card from 6L (WhatsApp and "See the program"), the session card if on, and the share card with the escape share text.
- Send `escape:done`.

**W. Escape room sounds:** a lock click on Unlock, the thunk and chime for the doors, and a soft ping when the console gets a message. Same master volume and mute as 6N.

### Nice to have (only if time allows, in this order)
1. **Presenter mode** (`?present=1`, `features.presenterMode`), for our free live sessions on Zoom or Meet: code at 18px or more, the preview and code side by side on a laptop screen, keys 1 to 5 open that puzzle of the current level, H shows the next hint, S shows the fix. No analytics, nothing saved, no WhatsApp button. The result screen says "Questions? Ask in the chat."
2. **Keyboard map:** "?" opens a small list of shortcuts.
3. **Installable app:** `manifest.json` with app icons.

---

## 7. Visual style: matched to wrench-wise.com

These values were measured from the live wrench-wise.com site: emerald as the main brand colour, teal and cyan as accents, gray text, white cards and soft emerald-to-cyan gradients. The code, browser and status colours are added for this game.

**Colours.** Every colour is a CSS variable in `styles/tokens.css`. First visit follows the device's light or dark setting. The theme button switches it and saves `tbw-theme`.

**Site tokens**

| Token | Light (default) | Dark |
|---|---|---|
| `--bg` | `#FFFFFF` | `#0F172A` |
| `--bg-grad` | `linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 45%, #ECFEFF 100%)` | `linear-gradient(135deg, #0F172A 0%, #1E293B 100%)` |
| `--surface` | `#FFFFFF` | `#1E293B` |
| `--surface-2` | `#F3F4F6` | `#334155` |
| `--border` | `#E5E7EB` | `#334155` |
| `--text` | `#111827` | `#F1F5F9` |
| `--text-2` | `#374151` | `#CBD5E1` |
| `--muted` | `#6B7280` | `#94A3B8` |
| `--brand` | `#059669` | `#10B981` |
| `--brand-strong` | `#047857` | `#34D399` |
| `--brand-soft` | `#D1FAE5` | `rgba(16,185,129,0.15)` |
| `--accent` | `#0891B2` | `#22D3EE` |
| `--warn` | `#B45309` | `#FBBF24` |

**Game tokens**

| Token | Light (default) | Dark |
|---|---|---|
| `--broken` | `#E11D48` | `#FB7185` |
| `--broken-soft` | `#FFF1F2` | `rgba(251,113,133,0.14)` |
| `--fixed` | `#059669` | `#34D399` |
| `--fixed-soft` | `#D1FAE5` | `rgba(16,185,129,0.18)` |
| `--frame-bar` | `#F3F4F6` | `#1E293B` |
| `--frame-border` | `#E5E7EB` | `#334155` |
| `--frame-dots` | `#F87171`, `#FBBF24`, `#34D399` | same as light |
| `--sweep` | `linear-gradient(180deg, transparent, rgba(34,211,238,0.55) 45%, #ECFEFF 50%, rgba(16,185,129,0.55) 55%, transparent)` | same as light |
| `--glitch-a` / `--glitch-b` | `rgba(225,29,72,0.55)` / `rgba(34,211,238,0.55)` | same as light |
| `--door` | `#111827` | `#020617` |
| `--door-light` | `#FDE68A` | same as light |
| `--lock-bg` | `#0F172A` | `#020617` |

**Code tokens** (the code panel is dark in both themes, like a real editor)

| Token | Value |
|---|---|
| `--code-bg` | `#0B1220` (dark theme `#050A14`) |
| `--code-gutter` | `#64748B` |
| `--code-text` | `#E2E8F0` |
| `--code-line-hover` | `rgba(34,211,238,0.08)` |
| `--code-line-right` | `rgba(16,185,129,0.22)` |
| `--code-line-wrong` | `rgba(244,63,94,0.22)` |
| `--tok-comment` | `#64748B` |
| `--tok-keyword` | `#67E8F9` |
| `--tok-string` | `#FDE68A` |
| `--tok-number` | `#FCA5A5` |
| `--tok-tag` | `#6EE7B7` |
| `--tok-attr` | `#FDBA74` |
| `--tok-prop` | `#93C5FD` |
| `--tok-punct` | `#94A3B8` |

**Brand gradient:** `--brand-grad: linear-gradient(90deg, #059669, #0D9488, #06B6D4)`. Use it for the primary button, the bar under the header, the result score and the share image bar.

**Fonts**
- Text: `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. Headings weight 800, letter spacing -0.01em. Body 400 to 500.
- Code and the address bar: `ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", "Courier New", monospace`.
- All numbers use `font-variant-numeric: tabular-nums`.

**Shapes:** buttons, pills and chips fully rounded (999px). Cards and the browser frame 16px. Code panel 12px. Stamps 8px.

**Shadows** (light; in dark use the same shapes with `rgba(0,0,0,0.40)`)
- `--shadow-sm: 0 1px 3px rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.10)`
- `--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)`
- `--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.10)`
- `--shadow-xl: 0 20px 40px -12px rgba(15,23,42,0.35)`

**Meta:** `theme-color` `#FFFFFF` (light) and `#0F172A` (dark) using media queries. In `manifest.json`: `theme_color` `#059669`, `background_color` `#FFFFFF`.

**Contrast:** all game text at least 4.5 to 1 against its background. The client pages inside the frame are content and are not changed.

**Motion rules**
- UI animates only `transform`, `opacity` and `clip-path`. Never width, height, top, left or margins.
- Easing: `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)` and `--ease: cubic-bezier(0.4, 0, 0.2, 1)`. Durations 150, 200, 300 and 500 ms, plus the 900 ms repair sweep.
- Professional and calm. Small distances. Nothing bounces more than once. The glitch is the only "noisy" motion, and it is brief.
- **Reduced motion** (`prefers-reduced-motion: reduce`): no glitch, no jitter, no tilt, no drifting glows. The repair sweep becomes a 150 ms cross-fade. Checks appear without staggering. Numbers show without counting. Typing animations show the final text at once. Sounds still play unless muted.

---

## 8. Words (copy.js)

Use exactly these. Values in braces are filled by `t()`. Keys ending in `.one` are used when `n` is 1. Add any small labels you need in the same plain style, and list them in your Phase 1 report.

| Key | Text |
|---|---|
| `home.eyebrow` | A debugging game |
| `home.title` | The Broken Website |
| `home.subtitle` | Three client websites are broken. Read the ticket, find the bug, fix the code. |
| `home.start` / `home.continue` | Start fixing / Continue |
| `home.how1` / `how2` / `how3` | Read the client's ticket / Find what breaks the page / Fix it and run the checks |
| `home.levelProgress` | {n} of {total} fixed |
| `home.result` | See my result |
| `picker.title` | How much code have you written? |
| `picker.never` / `picker.neverSub` | I've never written code / Escape the hacked museum. No coding needed. |
| `picker.little` / `picker.littleSub` | I know a little HTML or CSS / Beginner: spot the bug, pick the fix. |
| `picker.some` / `picker.someSub` | I've built small projects / Moderate: fix real code. |
| `picker.lots` / `picker.lotsSub` | I code regularly / Expert: race conditions, closures and worse. |
| `picker.switch` / `picker.change` | You can switch anytime. / Change level |
| `path.escape` / `beginner` / `moderate` / `expert` | I have never written code / I know a little HTML and CSS / I have built small projects / I code regularly |
| `escape.title` | The Night Museum |
| `escape.intro` | 11:02 PM. The Night Museum's website just went dark. A hacker called Glitch has locked you inside. Five rooms. Five codes. Every clue is hidden in the page's code. |
| `escape.enter` | Enter the museum |
| `escape.best` | Your best time: {time} |
| `room.of` | Room {n} of {total}, {title} |
| `room.locked` | Locked by Glitch |
| `room.tapLine` | Tap any line to change it |
| `room.apply` / `room.cancel` / `room.undo` / `room.reset` | Apply / Cancel / Undo / Reset room |
| `room.resetConfirm` | Put the room back the way Glitch left it? |
| `room.skip` / `room.skipConfirm` | Skip this room / You will get 0 points for this room. Show the code? |
| `room.did` / `room.next` | What you just did / Next room |
| `lock.letters` / `lock.digits` / `lock.mixed` | Letters / Digits / Letters and digits |
| `lock.unlock` / `lock.wrong` / `lock.decoyTag` | Unlock / That's not it. / Glitch left that on purpose |
| `escaped.title` | You escaped. |
| `escaped.pitch` | You just edited a website's code to escape. Developers do this every day. |
| `escaped.points` | {n} of {max} points |
| `escaped.next` / `escaped.beginner` | Ready for real bugs? / Try the Beginner level |
| `result.escape` | Escape room: {n} of 5 rooms, best time {time} |
| `level.restored` | Restored {n} of {total} |
| `level.locked` | Solve puzzle {n} first |
| `level.status.new` / `fixed` / `seen` | Not started / Fixed / Seen the fix |
| `puzzle.of` | {level}, puzzle {n} of {total} |
| `puzzle.from` | From {client}, {site} |
| `puzzle.accept` | Acceptance |
| `puzzle.pointsLeft` | {n} points available |
| `tab.page` / `tab.code` / `tab.checks` | Page / Code / Checks |
| `spot.find` | Tap the line that causes this |
| `spot.wrongLine` | Not this line |
| `spot.right` | Found it |
| `spot.pick` | Now pick the fix |
| `edit.run` | Run checks |
| `edit.running` | Running checks |
| `edit.summary` / `edit.summary.one` | {n} of {total} checks pass / 1 of {total} checks pass |
| `edit.timeout` | Your page never finished loading. Check for a loop that never ends, or an unclosed tag or comment. |
| `edit.resetFile` / `edit.resetAll` | Reset this file / Reset all |
| `edit.resetConfirm` | Put back the original broken code? Your edits will be lost. |
| `edit.draftRestored` | Restored your last edits. |
| `edit.undoRestore` | Start fresh instead |
| `edit.tooLong` | This file is too long. Remove some code to keep typing. |
| `hint.button` | Hint |
| `hint.cost` | Hint {n} of 3 costs {cost} points |
| `fix.show` | Show the fix |
| `fix.confirm` | You will get 0 points for this puzzle. Show the fix? |
| `fix.copy` | Copy the fix into the editor |
| `fix.changed` / `fix.changed.one` | {n} lines changed / 1 line changed |
| `console.title` | Console |
| `console.empty` | Nothing logged yet. Try console.log() in script.js. |
| `solved.stamp` | Fixed |
| `solved.what` / `why` / `tip` | What was wrong / Why it happens / Pro tip |
| `solved.next` / `solved.back` / `solved.site` | Next puzzle / Back to level / See the restored site |
| `done.title` | {site} is back online |
| `done.drag` | Drag to compare before and after |
| `done.next` | Next level |
| `result.title` | Your result |
| `result.points` | of {max} points |
| `result.solved` | {n} of {total} puzzles solved |
| `result.ctaTitle` | Want to fix bugs like this for real? |
| `result.ctaBody` | This is what developers do every day. Our program teaches you to build and fix real websites, step by step. |
| `result.second` | Prefer problem solving and DSA? See the {program}. |
| `result.again` | Play again |
| `cta.whatsapp` | Talk to us on WhatsApp |
| `cta.program` | See the program |
| `session.label` / `session.btn` | Free live session / Save my seat |
| `share.title` | Challenge a friend |
| `share.image` / `share.whatsapp` / `share.copy` / `share.copied` | Share my score / Send on WhatsApp / Copy link / Copied |
| `share.status` / `share.post` | Status / Post |
| `share.ask` | Can you beat that? |
| `presenter.end` | Questions? Ask in the chat. |
| `footer.built` / `footer.learn` | Built with code by Wrench Wise / Learn to build apps like this |

The sales message and share text are in Section 10. Build them only in `links.js`.

---

## 9. Link preview (the WhatsApp card)

- Title: "The Broken Website by Wrench Wise". Description: "Escape a hacked website, or fix three broken ones. No coding needed to start."
- Open Graph tags: `og:title`, `og:description`, `og:image`, `og:url`, `og:type` (website), and `twitter:card` set to `summary_large_image`. `og:image` and `og:url` are full addresses, set to the live address in Phase 7.
- If I put my own `assets/og-image.png` in the folder, use it. Otherwise build a 1200 x 630 page: `--bg-grad` background, a browser frame showing the Kaapi Club hero half broken and half fixed with the sweep band in the middle, "The Broken Website" in weight 800 and the logo. Screenshot it in Chrome at exactly that size and save it under 300 KB.

---

## 10. Correctness checks (must pass)

### 1. Content check
`node tools/verify-content.mjs` must end with `RESULT: ALL PASS`. It reports 4 sites, 15 puzzles, 56 checks, 8 alternative fixes and 5 escape rooms, and checks the scoring, lock and timer maths.

### 2. Puzzle Lab
Open `tools/puzzle-lab.html` through the local server. It must end with `RESULT: ALL PASS (60 page runs, 6 sandbox checks)`. It proves, in your browser, that each broken page fails, each fixed page and alternative fix passes, each escape room code stays hidden until the right edit and the traps never reveal it, and the sandbox blocks the network and the app's storage. It takes about 45 seconds.

### 3. Self-test
With `?test=1`, run `selftest.js` and show a clear PASS or FAIL table on the page and in the console, with `config.version` and `CONTENT_VERSION` at the top. Every value below must match exactly.

**a. Content:** 4 sites, 4 levels (escape first), 15 puzzles (5 per level) and 5 escape rooms, every puzzle's and room's site matches its level, every id unique.

**b. Puzzles and rooms in the browser:** import `runLab` from `tools/lab.js` and run it with a visible stage element. `pass` must be true.

**c. Scoring** (with the given `config.scoring`)

| Case | Points |
|---|---|
| Beginner, spot 1st try, fix 1st try, no hints | 100 |
| Beginner, spot 2nd try, fix 1st try | 80 |
| Beginner, spot 4th try, fix 3rd try, 2 hints | 10 |
| Moderate, 0 failed runs, no hints | 200 |
| Moderate, 1 failed run (free), no hints | 200 |
| Moderate, 3 failed runs, 1 hint | 150 |
| Moderate, 20 failed runs, 3 hints | 40 |
| Expert, 2 failed runs, 2 hints | 195 |
| Any level, fix revealed | 0 |
| Escape room, 0 wrong codes, no hints | 100 |
| Escape room, 2 wrong codes (free), no hints | 100 |
| Escape room, 5 wrong codes, 1 hint | 65 |
| Escape room, 30 wrong codes, 3 hints | 20 |
| Escape room, skipped | 0 |

Stars: beginner 100 is 3, beginner 80 is 2, moderate 150 is 2, expert 195 is 2, expert 60 is 1, revealed is 0. Max total 3,000. Ranks: 0 and 899 Trainee, 900 and 1,799 Bug Fixer, 1,800 and 2,599 Debugger, 2,600 and 3,000 Lead Debugger. The escape room has its own total, out of 500, and no rank.

**c2. Lock and timer:** `checkCode` on r1: `amber` and ` #FFBF00` are right, `ruby` and `yellow` are decoys with their replies, an empty string is `empty`, `pizza` is wrong. On r2, `7491` is a decoy and `1 9 4 7` is right. `formatClock`: 0 is 0:00, 59 is 0:59, 760 is 12:40, 3599 is 59:59, 3725 is 1:02:05, -5 is 0:00.

**d. Progress:** solve b1 for 80 and then again for 100: the best (100) is kept. Solve b1 and the level shows "1 of 5", b2 opens and b3 stays locked. Reveal m1: m2 opens and m1 counts 0 points. Load a progress object with `v: 2`: the game starts fresh without errors. Load one with an unknown id `z9`: it is ignored. Pick the escape path: `path` saves as `escape` and Home's Continue opens r1. Escape r1: r2 opens and the Beginner card is unchanged.

**e. Sales message.** The test number `910000000000` is for the test only and never goes in config. The message is built from what the player has done:
- Escape room finished: "I escaped all 5 rooms in {time}." Part way: "I got through {n} of 5 escape rooms."
- Puzzles solved: "I solved {n} of 15 puzzles and scored {points} of 3,000 ({rank})."
- Then, if the player picked a path: "About me: {path text}." using `path.*` from copy.
- With nothing played it starts "Hi, I tried The Broken Website." instead of "Hi, I played The Broken Website."

Numbers use `toLocaleString("en-IN")` and times use `formatClock`. `salesUrl` must give exactly these.

Path moderate, 12 puzzles, 2,140 points, rank Debugger:

```
https://wa.me/910000000000?text=Hi%2C%20I%20played%20The%20Broken%20Website.%20I%20solved%2012%20of%2015%20puzzles%20and%20scored%202%2C140%20of%203%2C000%20(Debugger).%20About%20me%3A%20I%20have%20built%20small%20projects.%20I%20would%20like%20to%20know%20more%20about%20the%20Certification%20Program%20in%20AI-Powered%20Full%20Stack%20Development.
```

Path escape, all 5 rooms in 760 seconds, no puzzles:

```
https://wa.me/910000000000?text=Hi%2C%20I%20played%20The%20Broken%20Website.%20I%20escaped%20all%205%20rooms%20in%2012%3A40.%20About%20me%3A%20I%20have%20never%20written%20code.%20I%20would%20like%20to%20know%20more%20about%20the%20Certification%20Program%20in%20AI-Powered%20Full%20Stack%20Development.
```

Path escape, all 5 rooms in 760 seconds, and 2 puzzles for 280 points (Trainee). The text before encoding:

```
Hi, I played The Broken Website. I escaped all 5 rooms in 12:40. I solved 2 of 15 puzzles and scored 280 of 3,000 (Trainee). About me: I have never written code. I would like to know more about the Certification Program in AI-Powered Full Stack Development.
```

Path beginner, 3 rooms, no puzzles:

```
Hi, I played The Broken Website. I got through 3 of 5 escape rooms. About me: I know a little HTML and CSS. I would like to know more about the Certification Program in AI-Powered Full Stack Development.
```

Nothing played, no path:

```
https://wa.me/910000000000?text=Hi%2C%20I%20tried%20The%20Broken%20Website.%20I%20would%20like%20to%20know%20more%20about%20the%20Certification%20Program%20in%20AI-Powered%20Full%20Stack%20Development.
```

If `config.salesWhatsApp` is not empty, it must be 11 to 15 digits only.

**f. Share text.** For the same result with site address `https://the-broken-website.vercel.app/`:

```
I solved 12 of 15 puzzles on The Broken Website and scored 2,140 of 3,000. Rank: Debugger. Can you beat that? https://the-broken-website.vercel.app/
```

and its WhatsApp link is exactly:

```
https://wa.me/?text=I%20solved%2012%20of%2015%20puzzles%20on%20The%20Broken%20Website%20and%20scored%202%2C140%20of%203%2C000.%20Rank%3A%20Debugger.%20Can%20you%20beat%20that%3F%20https%3A%2F%2Fthe-broken-website.vercel.app%2F
```

For the escape room finish, all 5 rooms in 760 seconds, the share text is:

```
I escaped all 5 rooms of The Broken Website in 12:40. Can you get out faster? https://the-broken-website.vercel.app/
```

and its WhatsApp link is exactly:

```
https://wa.me/?text=I%20escaped%20all%205%20rooms%20of%20The%20Broken%20Website%20in%2012%3A40.%20Can%20you%20get%20out%20faster%3F%20https%3A%2F%2Fthe-broken-website.vercel.app%2F
```

**g. Analytics payloads:** run `payloadsFor` for every event in the Section 3 table with sample data. No parameter is longer than 100 characters, and none contains any line of any puzzle's or room's code.

**h. Words:** no text in `copy.js` contains a banned word from Rule 9, an emoji or a long dash. Program names come from `config.js` in full.

**i. Storage:** after picking a path, solving b1, editing m1 and editing a line in r2, `localStorage` holds only allowed keys (Rule 6), and `tbw-progress` parses as JSON with `v: 1`.

### 4. Other checks
1. **Console.** No errors in the game's own console on any screen. (Errors inside a puzzle page are expected and belong in the game's Console panel.)
2. **Speed.** Chrome DevTools at 390 x 844 with 4x CPU throttling: the glitch, the repair sweep and the checks animation average above 50 fps. Typing in the editor stays smooth on e1 (60 lines). Report the numbers.
3. **Layout.** Screenshots at 360 x 740, 390 x 844, 768 x 1024 and 1440 x 900. No horizontal page scroll anywhere.
4. **Reel frame.** At 390 x 844, check the frame rules in 6P for b2 and e1.
5. **Brand match.** Open wrench-wise.com and the game side by side and screenshot both. Every colour in the game's own CSS comes from Section 7.
6. **Tone.** Search all user-facing text for the banned words. None.
7. **Safety.** Search the app code outside `js/engine/`, `content/` and `tools/` for `innerHTML`, `insertAdjacentHTML`, `eval(`, `new Function`, `onclick=`, `srcdoc` and `allow-same-origin`. None may appear. Paste `<img src=x onerror=alert(1)>` into the editor: it shows as plain text in the editor, and runs only inside the sandboxed preview, where `alert` is blocked.
8. **Stuck code.** Type `while (true) {}` into script.js of m1 and run checks. The game must stay usable and show the timeout message within about 30 seconds. Report what happens. (In some browsers a stuck sandbox can slow the whole tab. If that happens, tell me rather than work around the sandbox.)
9. **Escape room on a phone.** At 390 x 844, play r1 to r5 using only taps and the phone keyboard, with the edits from `content/escape.js`. Report your time and anything awkward.

---

## 11. Phases

Total target is about 10 and a half hours. Take the time needed to get each phase right.

### Phase 0: Setup and checks (target 20 min)
- Run `node --version`, then `node tools/verify-content.mjs`.
- `git init`, add `.gitignore`.
- Create the folders from Section 4, `styles/tokens.css` with every token from Section 7, and an `index.html` shell with the header and footer.
- Start the local server and open `tools/puzzle-lab.html`.
- **Report:** the Node version, the full content check output, a screenshot of the Puzzle Lab showing ALL PASS, and a screenshot of the shell page.

### Phase 1: Wiring and self-test (target 60 min)
- **Build:** `events.js`, `copy.js`, `content.js`, `progress.js`, `store.js`, `links.js` (with `payloadsFor`), and `selftest.js` with checks a to i (including c2).
- **Report:** the full self-test table. Every value must match Section 10. Do not continue with a mismatch. Explain it in plain words instead.

### Phase 2: Browser frame and spot mode (target 120 min)
- **Build:** `router.js`, `ui/browser.js` (frame, scaling, glitch, repair sweep), `ui/highlight.js`, `ui/codeview.js`, `ui/ticket.js`, `ui/hints.js`, `ui/checks.js`, the solved card and `screens/spot.js`, playable for b1 to b5 through `#/puzzle/b1`.
- **Report:** screenshots of b2 at each step (find, pick, sweep, solved) at 390 x 844 and 1440 x 900, the repair sweep fps, and click steps for me to play b1.

### Phase 3: The editor and edit mode (target 120 min)
- **Build:** `ui/editor.js`, `ui/console.js`, `ui/diffview.js` and `screens/edit.js`, playable for m1 to e5. Drafts, reset, hints, Show the fix, timeouts.
- **Report:** screenshots of m3 before and after a correct fix, of e1 with failing checks and the Console showing an error, and of the Show the fix view. Confirm you solved all ten edit puzzles yourself with the fixes in `content/`, and what the stuck-code test (check 8) did.

### Phase 4: Level picker and escape room (target 120 min)
- **Build:** `screens/picker.js`, `screens/escape.js`, `screens/room.js`, `screens/escaped.js`, `ui/lineEditor.js`, `ui/lock.js` and `ui/doors.js`, playable from `#/start` through r1 to r5.
- **Report:** screenshots of the picker, r2 before and after the edit, the doors opening (3 frames), r3 with the Console open, and the finish screen, at 390 x 844 and 1440 x 900. Confirm you escaped all 5 rooms yourself on a phone-sized screen with the edits in `content/escape.js`, and give me click steps to do the same.

### Phase 5: Game shell (target 75 min)
- **Build:** `screens/home.js`, `screens/level.js`, `screens/done.js` with `ui/beforeAfter.js`, `screens/result.js` with the CTA, and `sound.js`.
- **Report:** screenshots of every screen on phone and laptop, and click steps for me to finish the beginner level.

### Phase 6: Sharing and polish (target 60 min)
- **Build:** sharing and both share images, link preview tags and `og-image.png`, dark theme, reduced motion, demo mode, analytics loading, accessibility (keyboard use, focus rings, `aria-live` for check results), then the Nice to Have items in order if time allows.
- **Report:** screenshots in both themes, both share images, confirmation that demo mode loops cleanly with r2, b2, m3 and e1, the speed numbers, the brand match screenshots, and click steps for me to check analytics in GA4 DebugView and with the Meta Pixel Helper Chrome extension.

### Phase 7: Docs and deploy (target 45 min)
- **README.md:** what the game is and the live link, how to play in 3 steps, how to run it locally, how to run the content check and the Puzzle Lab, and "Built by Wrench Wise".
- **UPGRADE_GUIDE.md**, in plain words for me, with these recipes:
  1. Change the WhatsApp number, the program, the session card, scoring or links (`config.js` only)
  2. Add a puzzle: copy one, write the files, fixes, checks and an alternative fix, run the content check and the Puzzle Lab, raise `CONTENT_VERSION`
  3. Add a whole level with a new client site (a new site in `sites.js`, a new puzzle file, one line in `content/index.js`), or add an escape room (copy a room in `content/escape.js`, write its clue, answer, decoys, the intended edit and at least one trap, then run both checks)
  4. When players say a puzzle is wrong or unfair: reproduce it in the game, add a check or an alternative fix in content, re-run both checks
  5. Turn a feature on or off (`config.features`)
  6. Use GA4 to tune difficulty: puzzles with many `hint_open` and `solution_reveal` events are too hard; puzzles nobody fails are too easy
  7. Release steps: raise `config.version` (and `CONTENT_VERSION` if content changed), add a `CHANGELOG.md` entry, tag in git
  8. How to run any future upgrade with Antigravity, with this ready-to-paste prompt:
     > Read PROJECT_BRIEF.md, UPGRADE_GUIDE.md and CHANGELOG.md. I want to add: [describe the feature]. Create a branch called upgrade-[short-name]. Follow Section 3 of PROJECT_BRIEF.md. Plan the work in phases and stop after each one with a Phase Report. Do not change content/, tools/ or js/engine/ unless I ask. Keep the content check, the Puzzle Lab and every self-test passing, and add tests for the new feature. Give me the Vercel preview link and wait. Merge only when I reply "Ship it".
  9. Upgrades this structure is ready for: more puzzles per level, a fourth level (for example React or an API), a Tamil version (`copy.ta.js`), a second escape room story with a new site, a daily puzzle, timed challenge mode, a leaderboard (needs a backend, so a separate project), and an AI code review hint that explains the player's own mistake (needs a backend to keep the API key secret, so a separate project)
- **CHANGELOG.md:** a "1.0.0" entry listing what v1 includes.
- **STUDENT_EXPLAINER.md:** for students:
  - What each room and puzzle teaches, using its `concepts`, one line each
  - How the game runs your code safely: the sandboxed iframe, the Content Security Policy, and checks that test behaviour
  - How the app is built, in plain words
  - 3 extension tasks: write a 16th puzzle that passes the content check and the Puzzle Lab, add a hint system that points at the failing check, and add a "Format code" button
- **REEL_SCRIPT.md:** three scripts, each with a hook as on-screen text in the first 2 seconds, a shot list matched to demo mode timing, captions, optional voiceover lines and a closing line with Wrench Wise:
  - Vertical, 30 seconds (`?demo=1&puzzle=b2`): "One missing slash broke this whole website."
  - Horizontal, 60 seconds (`?demo=1&puzzle=e1&theme=dark`): "Every seat you tap books the same seat. Why?"
  - Comment bait: freeze on the code view of b4, "Which line breaks the menu? Comment the line number."
  - Escape room, vertical, 30 seconds (`?demo=1&room=r4`): "This website locked me in. The way out is hidden in its code."
  - Client businesses are made up. Captions never say they are real.
  - No emojis, no em dashes, none of the banned words
- **Deploy:**
  1. Help me push the folder to GitHub. I will give you my empty repository URL.
  2. Deploy it on Vercel as a static site, with no build command.
  3. Set `config.siteUrl`, `og:url` and `og:image` to the live address, then redeploy.
  4. Give click-by-click steps for anything I must do myself.
  5. Confirm the live site works on a phone-sized screen, that `?test=1` passes live, and that the Puzzle Lab passes live.
  6. Tag the release `v1.0.0` and push the tag.
  7. Give me the live link and the demo links for r4, b2, m3 and e1.

---

## 12. Phase Report format

- **What I built** (3 to 5 bullets)
- **How to check it** (click steps)
- **Screenshots** (phone and laptop, where relevant)
- **Not working or cut,** explained in plain words
- **Time used** against the target

---

## 13. If something keeps breaking

- If the same bug survives two fix attempts, stop. Explain it in plain words and give me options. Do not keep looping.
- If I say "Park it", move that feature to a "Parked" list in the Phase Report and continue with the next phase.
- If I want to ship sooner, park in this order:
  1. Presenter mode and the keyboard map
  2. The Post size share image (keep Status)
  3. Syntax highlighting in the editor (keep it in the read-only code view)
  4. The 3D tilt and pointer follow on the home hero
  5. Saved drafts
  6. The light flicker on escape room frames

**Never park:**
- The sandbox rules (Rule 4) and the safety checks
- Spot mode, edit mode, Run checks, the checks list, hints and Show the fix
- The level picker, all five escape rooms, the line editor, the lock and the doors opening
- The browser frame, the glitch, the repair sweep and the solved card
- The before and after slider and the result screen with the WhatsApp CTA
- The content check, the Puzzle Lab and every value in Section 10
- Every rule in Section 3
- The tone and privacy rules
- Light and dark theme
- Demo mode
- Reduced motion rules
- Deployment
