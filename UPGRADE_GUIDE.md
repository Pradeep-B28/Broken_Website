# The Broken Website: Upgrade Guide

This guide explains how to maintain, configure, and expand The Broken Website in plain language. Follow these practical recipes whenever you need to adjust business settings, add puzzles, update content, or roll out new features.

---

## Recipe 1: Change Business Settings, Programs, or Links

All business settings live in one single file: `config.js`. You never need to touch application code to update them.

- **To update the sales WhatsApp number:**
  Open `config.js` and set `salesWhatsApp`. Use country code first with digits only (11 to 15 digits), for example `"917550077725"`. If left empty, the WhatsApp button is automatically hidden.
- **To update recommended programs:**
  In `config.js`, change `program.name`, `program.page`, or `secondProgram.name`. Full program names should always be written out in plain words.
- **To enable a free live workshop or session:**
  In `config.js`, set `session.enabled` to `true`, then fill in `session.title`, `session.when`, and `session.url`.
- **To tune scoring, hint costs, or timeouts:**
  Adjust the values under `scoring` or `limits` in `config.js`.
- **After making changes:**
  Open `http://localhost:8000/?test=1` in your browser to confirm all self-tests pass.

---

## Recipe 2: Add a Puzzle to an Existing Level

1. Open the level file in `content/` (for example `content/beginner.js`, `content/moderate.js`, or `content/expert.js`).
2. Copy an existing puzzle object as your template.
3. Define the puzzle details:
   - Assign a unique `id` (e.g. `b6` or `m6`).
   - Write the ticket `title`, client `ticket`, and short `symptom`.
   - Provide the broken code files (`html`, `css`, `js`).
   - Define the primary `fixes` and at least one alternative fix in `alts` if applicable.
   - For beginner puzzles, identify the `answer` file and line numbers, and supply four `options` (one correct, three plausible distractors with plain explanations).
   - Write behavioral `checks` that run against the sandboxed DOM.
   - Write the `explain` object (`what`, `why`, `tip`) and `concepts` tags.
4. Open `content/index.js` and raise `CONTENT_VERSION` (for example from `1` to `2`).
5. Run the verification checks:
   ```bash
   node tools/verify-content.mjs
   ```
   Open `http://localhost:8000/tools/puzzle-lab.html` in your browser and confirm that all checks pass for both broken and fixed states.

---

## Recipe 3: Add a New Level, Client Site, or Escape Room

### Adding a New Level and Client Site:
1. In `content/sites.js`, add a new client site object with `id`, `name`, `client`, `domain`, `kind`, and `base` CSS.
2. Create a new puzzle file (e.g. `content/advanced.js`) exporting an array of puzzle objects.
3. In `content/index.js`, import the new file and add the level to `LEVELS`.
4. In `js/router.js`, add the route mapping if a unique screen layout is needed.
5. In `styles/tokens.css`, define any client-specific color variables if needed.
6. Run `node tools/verify-content.mjs` and check Puzzle Lab.

### Adding an Escape Room:
1. Open `content/escape.js`.
2. Copy an existing room object. Give it a new `id` (e.g. `r6`), `title`, and `story`.
3. Provide the room files, clue, intended single-line edit, and correct passcode in `answer`.
4. Include decoy codes with custom responses, alternative valid edits, and at least one trap check.
5. In `js/progress.js` and `js/router.js`, update the room count from 5 to 6.
6. Verify with `node tools/verify-content.mjs` and play through in the browser.

---

## Recipe 4: When Players Report a Puzzle is Unfair or Broken

1. **Reproduce the player's approach:**
   Open the puzzle in the browser. Paste or enter the exact fix the player submitted.
2. **If their code is valid but failed:**
   Open the corresponding file in `content/`. Add their solution as an entry under `alts` (alternative fixes), or adjust the check query selector in `checks` so it recognizes both equivalent CSS or JS patterns.
3. **If their code is incorrect:**
   Add a specific failure message in the failing check description to clarify why that syntax does not satisfy the ticket requirements.
4. **Re-run verification:**
   ```bash
   node tools/verify-content.mjs
   ```
   Confirm that all existing tests and the new solution pass in `tools/puzzle-lab.html`.

---

## Recipe 5: Turn Features On or Off

In `config.js`, locate `features`:

```javascript
features: {
  sound: true,           // Web Audio effects and mute toggle
  timer: true,           // Clock display on puzzle screen
  console: true,         // In-game console drawer
  saveDrafts: true,      // Save in-progress editor code to localStorage
  beforeAfter: true,     // Interactive before/after slider on complete screen
  presenterMode: true    // Presenter mode with hotkeys on ?present=1
}
```

Set any flag to `false` to disable that feature cleanly. The interface automatically adapts with no empty gaps and no console errors.

---

## Recipe 6: Use GA4 to Tune Difficulty

When Google Analytics 4 is connected, inspect the following metrics in your GA4 reports:

- **Puzzles that are too hard:** Look for puzzles with high ratios of `hint_open` and `solution_reveal` relative to `puzzle_start`. If players frequently reveal the fix, reword the client ticket or add a clarifying hint.
- **Puzzles that are too easy:** Puzzles where `puzzle_solved` happens quickly with zero failed checks and zero hints can be made more interesting by adding stricter acceptance criteria.
- **Player Drop-off:** Compare `room_start` and `room_escaped` across rooms 1 through 5, and `checks_run` across levels, to discover where players pause or stop.

---

## Recipe 7: Release Steps for Upgrades

1. Update version numbers:
   - Raise `config.version` in `config.js` (for example to `"1.1.0"`).
   - If puzzle or room content changed, raise `CONTENT_VERSION` in `content/index.js`.
2. Add an entry to `CHANGELOG.md` under the new version header detailing what changed.
3. Run both verification suites:
   ```bash
   node tools/verify-content.mjs
   ```
   Open `http://localhost:8000/?test=1` in your browser and confirm 10/10 checks pass.
4. Commit and tag the release in git:
   ```bash
   git add .
   git commit -m "Release v1.1.0: [short summary of changes]"
   git tag v1.1.0
   git push origin main --tags
   ```

---

## Recipe 8: How to Prompt Antigravity for Future Upgrades

When you want an AI assistant like Antigravity to build a new feature or level, paste this exact prompt:

```text
Read PROJECT_BRIEF.md, UPGRADE_GUIDE.md and CHANGELOG.md. I want to add: [describe the feature or content]. Create a branch called upgrade-[short-name]. Follow Section 3 of PROJECT_BRIEF.md. Plan the work in phases and stop after each one with a Phase Report. Do not change content/, tools/ or js/engine/ unless I ask. Keep the content check, the Puzzle Lab and every self-test passing, and add tests for the new feature. Give me the Vercel preview link and wait. Merge only when I reply "Ship it".
```

---

## Recipe 9: Upgrades This Architecture is Prepared For

The modular design of The Broken Website makes several natural extensions straightforward:

1. **More Puzzles per Level:** The UI grids and progress counters automatically adjust when additional puzzles are added to `content/`.
2. **A Fourth Level (e.g. React or Backend APIs):** Add a new client site in `sites.js` and register the level in `content/index.js`.
3. **Regional Localization (e.g. Tamil version):** Create `js/copy.ta.js` matching every key in `js/copy.js` and add a language toggle.
4. **Second Escape Room Story:** Add a second story file in `content/` with unique rooms, clues, and passwords.
5. **Daily Challenge Mode:** Pick one puzzle each day based on calendar date hash with a dedicated countdown timer.
6. **Global Leaderboard:** Can be connected by sending completed run stats to a lightweight backend API.
7. **AI Debugging Coach:** A secure server endpoint that accepts the player's draft and returns conversational hints without exposing the API key to client browsers.
