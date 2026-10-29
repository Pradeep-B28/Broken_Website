# Content: what each field means

Everything the game knows lives in this folder: the hacked museum and its 5 escape rooms, the three client websites, and their 15 puzzles.

After any change here, run both checks. Both must end with `RESULT: ALL PASS`.

```
node tools/verify-content.mjs
```

Then open `tools/puzzle-lab.html` through the local server. It loads every puzzle in a real browser and proves that the broken page fails its checks and the fixed page passes them.

## Sites (`sites.js`)

| Field | What it is |
|---|---|
| `id` | Lowercase letters, like `kaapi`. Never change it. |
| `level` | The level this site belongs to: `escape`, `beginner`, `moderate` or `expert`. |
| `name`, `kind`, `client` | Shown on the level screen and the ticket, like "Mylapore Kaapi Club", "Cafe website", "Meena, owner". All made up. |
| `domain` | Shown in the fake address bar. Must end in `.example`, a domain that can never belong to anyone. |
| `base` | Site-wide CSS loaded before every puzzle's own CSS. The player never sees it. Keep bugs out of it. |

## Puzzles (`beginner.js`, `moderate.js`, `expert.js`)

Fields every puzzle has:

| Field | What it is |
|---|---|
| `id` | The level letter and position: `b1` to `b5`, `m1` to `m5`, `e1` to `e5`. Saved progress uses it, so never change or reuse one. |
| `level`, `site` | Must match the list the puzzle sits in, and that level's site. |
| `title` | Short name, shown on the puzzle card. |
| `device` | `phone` or `laptop`. The page is drawn at that size from `config.devices`. Checks depend on it. |
| `concepts` | The ideas the puzzle teaches, shown as chips and in the explanation. |
| `ticket` | The client's message, in their words. Describes symptoms, never the cause. |
| `symptom` | One line saying what is visibly wrong. |
| `files` | `{ html, css, js }`: the broken code the player sees, named index.html, styles.css and script.js. Two spaces for indents, no tabs. |
| `fixes` | List of `{ file, find, replace }`. Applied in order to `files`, they give the fixed code. Each `find` must appear exactly once. |
| `hints` | Exactly 3, from a gentle nudge to almost the answer. |
| `explain` | `{ what, why, tip }`: shown after the puzzle is solved. |
| `checks` | JavaScript run inside the puzzle page. Each `test("name", async (t) => { ... })` is one check. At least 3. |

Beginner puzzles only (spot and pick):

| Field | What it is |
|---|---|
| `answer` | The lines the player may tap, by file: `{ css: [25], html: [7] }`. Any one of them counts. The fixes may only change these lines (the check enforces it). |
| `options` | Exactly 4 fixes to pick from, each `{ text, correct, why }`. Exactly one is correct. `why` is shown when it is picked. |

Moderate and expert puzzles only (edit the code):

| Field | What it is |
|---|---|
| `accept` | The acceptance criteria shown next to the ticket, like a real job ticket. |
| `alts` | Optional. Other correct fixes, each `{ note, fixes }`. The Puzzle Lab proves they pass too, so the checks test behaviour, not one exact answer. |

## Escape rooms (`escape.js`)

| Field | What it is |
|---|---|
| `id` | `r1` to `r5`, in order. Never change or reuse one. |
| `level`, `site` | Always `escape` and `museum`. |
| `kind` | `read`: the code can be found by reading. `edit`: a small edit makes the code appear on screen or in the console. |
| `title`, `story`, `goal` | The room's name, the story text shown before it, and what the player must find. |
| `device` | `phone`. Every room must be playable with taps and a phone keyboard. |
| `concepts` | What the room teaches, shown after it is solved. |
| `format` | `letters`, `digits` or `mixed`. Labels the lock. |
| `answers` | Codes that open the lock. Capitals, spaces, dashes and # do not matter (`normalizeCode`). |
| `decoys` | Codes hidden in the room on purpose, each `{ code, reply }`. The reply explains why it is wrong without giving the answer. |
| `files` | `{ html, css, js }`: the room as the player first sees it. |
| `fixes` | Edit rooms only. The intended edit that reveals the code. |
| `alts` | Edit rooms only. Other edits that also reveal it. |
| `traps` | Edit rooms only. Tempting half-fixes that must NOT reveal it. The Puzzle Lab proves they fail. |
| `checks` | Edit rooms only. Pass when the code is revealed. Same helpers as puzzle checks, plus `t.logs()` for console output. |
| `hints`, `explain` | Exactly 3 hints, and `{ what, why, tip }` for the "What you just did" card. |

The Puzzle Lab also checks that every room's code is not on the screen or in the console when the room first loads.

## Writing checks

Checks run inside the puzzle page after it loads, one after another, in order, on the same page. Each one gets `t`:

| Helper | What it does |
|---|---|
| `t.$(sel)`, `t.$$(sel)` | One element, or a list of elements. |
| `t.click(x)` | Clicks a selector or an element. |
| `t.type(x, value)` | Puts text in an input and fires input and change events. |
| `t.key(name, x)` | Presses a key, like `"Escape"`, on `x` or the focused element. |
| `t.wait(ms)`, `t.until(fn, ms)`, `t.settle()` | Wait a time, wait for something to be true, wait for scrolling to stop. |
| `t.css(x, prop)`, `t.text(x)`, `t.visible(x)`, `t.rect(x)` | Read styles, text, visibility and position. |
| `t.logs()`, `t.errors()` | What the page printed to the console, and its errors. |
| `t.expect(condition, message)` | Fails the check with that message. Write the message for the player: say what you saw, not what they should code. |

Rules for checks:
- Test what the client asked for, never one exact line of code. Add an `alts` entry to prove it.
- The broken page must fail at least one check, and fixing only some of the bugs must still fail.
- Each check has 4 seconds. A check run has 30 seconds.
- The puzzle page cannot use the network or the app's storage.

## Adding a puzzle

1. Copy a puzzle of the same level, give it the next id, and write the broken files.
2. Write the fixes, the checks and at least one alternative fix.
3. Run `node tools/verify-content.mjs`, then the Puzzle Lab. Both must pass.
4. Raise `CONTENT_VERSION` in `content/index.js`.

## Writing rules

- Plain English. No emojis. No long dashes.
- Never use: guarantee, placement, salary, lakh, "get hired", "seats left", or anything that mocks the reader.
- Client businesses, people and addresses are made up. Never use a real company's name or brand colours.
