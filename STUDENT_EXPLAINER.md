# The Broken Website: Student Explainer

Welcome to The Broken Website. This guide explains what every puzzle and room teaches, how your code runs safely in the browser, how the application is built under the hood, and three extension projects you can build next.

---

## 1. What Each Room and Puzzle Teaches

### The Night Museum (Escape Room)
- **Room 1: The Lobby (`r1`):** Teaches how HTML comments, element attributes, and CSS comments can hide or reveal crucial information.
- **Room 2: The Gallery (`r2`):** Teaches how `display: none` and flexbox ordering control element visibility and positioning.
- **Room 3: The Archive (`r3`):** Teaches boolean logic (`true` and `false`) and using browser console output to retrieve dynamic state.
- **Room 4: The Control Room (`r4`):** Teaches how the `disabled` attribute and CSS `pointer-events` disable user interaction.
- **Room 5: The Exit (`r5`):** Teaches variable assignment and exact comparisons (`===` vs `==`) in conditional checks.

### Beginner Level (Mylapore Kaapi Club)
- **Puzzle 1: The flat button (`b1`):** Teaches CSS class names and selector targeting between HTML markup and stylesheets.
- **Puzzle 2: Everything turned bold (`b2`):** Teaches closing HTML tags properly to prevent styles from bleeding across the DOM.
- **Puzzle 3: The silent Subscribe button (`b3`):** Teaches JavaScript event listener names (`click` vs inline `onclick`).
- **Puzzle 4: The menu forgot its columns (`b4`):** Teaches CSS grid syntax and comma placement inside `repeat()` rules.
- **Puzzle 5: The page that slides sideways (`b5`):** Teaches the CSS box model (`box-sizing: border-box`) and preventing horizontal viewport overflow.

### Moderate Level (Marina Mart)
- **Puzzle 1: Search that finds the wrong things (`m1`):** Teaches JavaScript string methods (`toLowerCase`, `includes`) and the `hidden` attribute.
- **Puzzle 2: Add to cart works once (`m2`):** Teaches `querySelector` versus `querySelectorAll` and variable scoping across events.
- **Puzzle 3: The bill that says NaN (`m3`):** Teaches data types (numbers versus strings), `parseFloat`, and comparison operators.
- **Puzzle 4: The header that wanders off (`m4`):** Teaches `position: sticky`, containing block limitations, and scroll offset calculations.
- **Puzzle 5: Checkout says no to good numbers (`m5`):** Teaches regular expressions, phone number validation, and clear form error states.

### Expert Level (Reel Seats)
- **Puzzle 1: Every seat picks E8 (`e1`):** Teaches closures, the classic `var` vs `let` loop scope trap, and off-by-one boundary limits.
- **Puzzle 2: Showtimes from the wrong day (`e2`):** Teaches race conditions, asynchronous execution order, and tracking active request state.
- **Puzzle 3: The popup stuck in its card (`e3`):** Teaches CSS containing blocks with transforms, event bubbling, and keyboard escape handling.
- **Puzzle 4: The coupon that gives too much (`e4`):** Teaches enforcing business limits in code, `Math.min` vs `Math.max`, and sanitizing user inputs.
- **Puzzle 5: Details for the wrong movie (`e5`):** Teaches re-rendering dynamic lists, avoiding duplicate event listeners, and array indexing after filters.

---

## 2. How the Game Runs Your Code Safely

When you edit code in the browser, how does the game run it without crashing the tab or creating security risks? It uses three layers of defense:

1. **Sandboxed Iframes (`sandbox="allow-scripts"`):**
   Your code runs inside an isolated `<iframe>` element. Notice that `allow-same-origin` is omitted. This ensures that code running inside the preview cannot read cookies, cannot access `localStorage`, cannot access the parent page DOM, and cannot steal your score or progress.
2. **Strict Content Security Policy (CSP):**
   Each puzzle preview is injected with a Content Security Policy:
   `default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:; media-src data:`
   This blocks network calls, prevents external image loading, and stops third-party trackers or popups.
3. **Behavioral Checks (Not String Matching):**
   The game does not test your code by searching for exact text. Instead, it tests real behavior inside the rendered page. A check queries DOM elements, clicks buttons, types values into inputs, and verifies that the output matches what the client requested. This means multiple valid ways of coding the solution will all pass.
4. **Infinite Loop Protection:**
   If a script contains a loop that never ends (such as `while (true) {}`), the execution harness detects that the iframe failed to complete checks within the timeout limit and reports a clear timeout error, keeping the outer game responsive.

---

## 3. How the Application is Built

The Broken Website was built without heavy frameworks or build tools. Here is how the pieces fit together:

- **Zero-Build ES Modules:** The app uses native JavaScript modules (`import` and `export`). You can edit a file, refresh your browser, and see your changes instantly without running Webpack, Vite, or Babel.
- **Hash-Based Router:** Navigation uses the URL hash (`#/`, `#/level/beginner`, `#/puzzle/b1`). When the hash changes, the router unmounts the previous view, dynamically imports the requested screen module, and mounts it into `#app`.
- **Decoupled Architecture:** Logic files (`content.js`, `progress.js`, `links.js`, `score.js`, `lock.js`) have no DOM access. They take pure inputs and return pure outputs, making them easy to unit test.
- **Design Tokens:** All styles derive from CSS variables in `styles/tokens.css`. Switching to dark theme simply changes CSS variable values on the `:root` element without re-rendering components.
- **Pure Web Audio Synthesizer:** Sounds are not pre-recorded audio files. Every click, chime, wrong note, and thunk is synthesized mathematically using the browser's native `AudioContext` with sine and square oscillators and gain envelopes.

---

## 4. Three Extension Tasks

Ready to take your skills further? Try building these three real features:

### Task 1: Write a 16th Puzzle
Create a new puzzle in `content/moderate.js` called `m6`:
1. Pick a real-world bug you have encountered (such as an unclosed modal, a broken tab switcher, or a double form submission).
2. Write the client ticket, broken files, fixes, alternative fixes, and three behavioral checks.
3. Run `node tools/verify-content.mjs` and open `tools/puzzle-lab.html` to verify that your new puzzle passes both broken and fixed checks.

### Task 2: Build a Targeted Hint Helper
Currently, the hint system shows three static hints per puzzle.
- Update `ui/hints.js` so that when a check fails during "Run checks", the hint button detects which check failed and offers a tailored tip pointing directly at that specific behavior.

### Task 3: Add a "Format Code" Button
In `ui/editor.js`:
- Add a "Format" button next to "Reset this file".
- Write a lightweight indentation function that cleans up indentation (2 spaces per nesting level) and strips trailing whitespace from the active file when clicked.
