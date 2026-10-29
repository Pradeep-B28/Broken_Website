# The Broken Website: Reel Scripts

Short-form video scripts designed for recording reels, shorts, and social clips using Demo Mode (`?demo=1`).

> Note: All client businesses are fictional debugging scenarios. Captions must never claim they are real companies.

---

## Script 1: Vertical Reel (30 Seconds)
**URL:** `https://the-broken-website.vercel.app/?demo=1&puzzle=b2`
**Format:** 9:16 Vertical (1080 x 1920)

### On-Screen Hook (First 2 Seconds)
**"One missing slash broke this whole website."**

### Shot List and Demo Timing
- **0:00 - 0:02 (Hook):** Close-up on the Mylapore Kaapi Club preview. Text flashes: "One missing slash broke this whole website."
- **0:02 - 0:06 (The Ticket):** Pan up to Meena's client ticket: "Everything turned bold on our menu."
- **0:06 - 0:12 (Inspect Code):** Tap dot switches to Code view (`index.html`). Code scrolls to line 4.
- **0:12 - 0:17 (Spot the Bug):** Tap dot taps line 4: `<p>Try our <strong>Rose Milk<strong>...</p>`.
- **0:17 - 0:23 (The Fix):** Tap dot picks the fix: `change the second <strong> to </strong>`. Repair sweep wipes down the screen.
- **0:23 - 0:27 (Green Checks):** Checks list ticks green one by one. Solved card stamps "Fixed" with 100 points.
- **0:27 - 0:30 (Outro):** Closing card with Wrench Wise logo.

### Captions
- 0:00: One missing slash broke this whole website.
- 0:04: The owner reported that every word turned bold.
- 0:09: Inspecting line 4 in the HTML.
- 0:14: Notice the opening tag without a closing slash.
- 0:19: Add the forward slash to close the strong tag.
- 0:24: All checks pass. Site restored.
- 0:28: Learn real web debugging with Wrench Wise.

### Voiceover
"One missing slash broke this entire website. The owner opened a ticket saying all their text turned bold. Look at line four of the HTML. They opened a strong tag, but forgot the slash on the second one. One forward slash closes the tag, and the page is fixed. Learn to debug real code with Wrench Wise."

### Closing Line
**"Practice real debugging free with Wrench Wise."**

---

## Script 2: Horizontal Video (60 Seconds)
**URL:** `https://the-broken-website.vercel.app/?demo=1&puzzle=e1&theme=dark`
**Format:** 16:9 Horizontal (1920 x 1080)

### On-Screen Hook (First 2 Seconds)
**"Every seat you tap books the same seat. Why?"**

### Shot List and Demo Timing
- **0:00 - 0:04 (Hook & Bug):** Reel Seats booking grid shown in dark theme. User taps seat A1, but the booking confirmation says E8. Text: "Every seat you tap books the same seat. Why?"
- **0:04 - 0:12 (The Ticket):** Ticket view: "Customers are booking different seats, but checkout always shows the last seat in the row."
- **0:12 - 0:20 (Failing Checks):** Tap dot clicks "Run checks". Checks list lights up red: "Expected seat A1 but booked E8".
- **0:20 - 0:34 (The Editor):** Editor tab opens `script.js`. Focus on the seat loop: `for (var i = 0; i < seats.length; i++)`.
- **0:34 - 0:44 (Typing the Fix):** Tap dot selects `var i` and replaces it with `let i`. Explain block scoping.
- **0:44 - 0:54 (Passing Checks):** Tap dot clicks "Run checks" again. Green checks land with rising chime notes. Repair sweep restores cinema grid.
- **0:54 - 1:00 (Outro):** Solved card pops with 195 points. Wrench Wise callout.

### Captions
- 0:02: Every seat you tap books the same seat. Why?
- 0:07: Customers try booking seat A1, but checkout always says E8.
- 0:15: The test fails immediately.
- 0:24: Look at how the loop variable was declared.
- 0:32: The keyword var is function-scoped, not block-scoped.
- 0:38: By the time the click listener runs, the loop has already finished at the last seat.
- 0:45: Changing var to let gives each seat its own closure.
- 0:52: Checks pass. All 60 seats book correctly.
- 0:57: Master full stack problem solving with Wrench Wise.

### Voiceover
"Every seat you tap books the exact same seat. Why? On this cinema booking site, tapping seat A1 always books seat E8. When we run the automated checks, the test fails. Look at line twelve of script dot js. The loop uses var instead of let. Because var is function-scoped, every click listener shares the exact same variable after the loop finishes. Changing var to let creates a fresh binding for each seat. Now every seat books the right ticket. Learn full stack engineering with Wrench Wise."

### Closing Line
**"Master real full stack engineering with Wrench Wise."**

---

## Script 3: Comment Bait Reel (15 Seconds)
**URL:** `https://the-broken-website.vercel.app/?demo=1&puzzle=b4`
**Format:** 9:16 Vertical (1080 x 1920)

### On-Screen Hook (First 2 Seconds)
**"Which line breaks the menu? Comment the line number."**

### Shot List and Demo Timing
- **0:00 - 0:03 (Hook):** Split screen: Kaapi Club menu stacked in one awkward column on the left, stylesheet on the right.
- **0:03 - 0:12 (Code Freeze):** Video freezes on lines 1 through 10 of `styles.css`.
  - Line 1: `.menu-grid {`
  - Line 2: `  display: grid;`
  - Line 3: `  grid-template-columns: repeat(3 1fr);`
  - Line 4: `  gap: 16px;`
  - Line 5: `}`
- **0:12 - 0:15 (Call to Action):** Big text: "Which line breaks the menu? Comment the line number below."

### Captions
- 0:00: Which line breaks the menu?
- 0:04: The owner wanted 3 columns, but it displays as a single column.
- 0:09: Inspect lines 1 through 5 of the CSS.
- 0:12: Comment the broken line number before reading the comments.

### Voiceover
"Which line breaks this three-column menu? Comment the line number before you check the comments. Hint: look closely at the grid syntax on line three."

### Closing Line
**"Test your developer instincts with Wrench Wise."**

---

## Script 4: Escape Room Reel (30 Seconds)
**URL:** `https://the-broken-website.vercel.app/?demo=1&room=r4`
**Format:** 9:16 Vertical (1080 x 1920)

### On-Screen Hook (First 2 Seconds)
**"This website locked me in. The way out is hidden in its code."**

### Shot List and Demo Timing
- **0:00 - 0:03 (Hook):** Dark screen with flickering Night Museum website. Red banner: "Locked by Glitch".
- **0:03 - 0:08 (The Clue):** Story text types out: "Glitch disabled the emergency release terminal."
- **0:08 - 0:16 (Code Search):** Switch to Code view. Scroll down to line 18: `<button class="btn" disabled style="pointer-events: none;">`.
- **0:16 - 0:22 (Single-Line Edit):** Tap dot opens the bottom sheet editor. Removes `disabled` and changes style. Terminal activates.
- **0:22 - 0:26 (Unlock Doors):** Secret passcode `404` reveals. Tap dot types `404` into museum keypad.
- **0:26 - 0:30 (Doors Open):** Dark sliding doors slide apart with chime and thunk. "You escaped."

### Captions
- 0:00: This website locked me in.
- 0:04: Glitch disabled the control room release button.
- 0:10: Tapping line 18 in the source code.
- 0:17: Removing the disabled attribute and pointer-events.
- 0:23: Terminal powers on and gives passcode 404.
- 0:27: Doors unlock. Room 4 cleared.
- 0:29: Play the Night Museum escape room free at Wrench Wise.

### Voiceover
"This website locked me in, and the way out is hidden in its code. A hacker called Glitch disabled the control room door. But inside the code, the button is simply set to disabled with pointer events turned off. We open the code editor, delete the disabled attribute, and the button turns live. Entering code 404 unlocks the blast doors. Escape the Night Museum free with Wrench Wise."

### Closing Line
**"Escape the hacked website free at Wrench Wise."**
