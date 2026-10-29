// LOCKED CONTENT. The escape room for people who have never written code: The Night Museum.
// A hacker called Glitch has locked the museum's website. Five rooms, five codes. Every clue is in the code.
// "read" rooms are solved by reading the code. "edit" rooms need a small edit before the code appears.
// tools/puzzle-lab.html proves each code is hidden at first, appears after the intended edit, and that
// the traps (tempting half-fixes) do not reveal it. Field meanings are in content/SCHEMA.md.

export const ESCAPE = [
  {
    id: "r1",
    level: "escape",
    site: "museum",
    kind: "read",
    title: "The Lobby",
    device: "phone",
    concepts: ["HTML comments", "Attributes", "CSS comments"],
    story: "11:02 PM. You were browsing the Night Museum's website when the screen went dark. A door appeared, and a note from someone called Glitch. You are locked in.",
    goal: "Find the code for the front door.",
    format: "letters",
    answers: ["AMBER", "FFBF00"],
    decoys: [
      { code: "RUBY", reply: "That was the old code. Glitch says it was changed." },
      { code: "YELLOW", reply: "Good eye. But Glitch wrote the colour's exact name somewhere in the code." },
      { code: "ORANGE", reply: "Good eye. But Glitch wrote the colour's exact name somewhere in the code." }
    ],
    files: {
      html: `<main class="room">
  <p class="room-tag">Room 1 of 5</p>
  <h1>The Lobby</h1>
  <p class="note">Glitch: "The door code is right in front of you. Just not on the screen."</p>
  <!-- Glitch was here. Old door code: RUBY. I changed it. -->
  <div class="front-door" title="The new code is the colour of this door.">
    <span class="sign">Locked</span>
  </div>
  <p class="plaque">Night Museum, est. 1952. Open 6 PM to midnight.</p>
</main>`,
      css: `.front-door {
  position: relative;
  width: 170px;
  height: 250px;
  margin: 10px auto 18px;
  border: 6px solid #5b4a2a;
  border-radius: 85px 85px 6px 6px;
  /* Glitch repainted the door. New colour: amber. */
  background: #ffbf00;
  box-shadow: 0 0 60px rgba(255, 191, 0, 0.25);
}
.front-door::after {
  content: "";
  position: absolute;
  right: 22px;
  top: 128px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #5b4a2a;
}
.sign {
  position: absolute;
  left: 50%;
  top: 60px;
  transform: translateX(-50%);
  padding: 4px 10px;
  background: var(--nm-red);
  color: #fff;
  font: 700 12px system-ui, sans-serif;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.plaque {
  color: var(--nm-muted);
  font-size: 13px;
}`,
      js: `// Glitch: the lobby code is not in this file. Keep looking.`
    },
    hints: [
      "The screen will not help. Open the code and read it like a letter.",
      "There are two clues in index.html. One is an old code. The other points at the door's colour.",
      "Find .front-door in styles.css. The colour's name is written in a comment."
    ],
    explain: {
      what: "You read the page's code, not the page. The old code hid in an HTML comment, the clue in a title attribute, and the answer in a CSS comment.",
      why: "Comments and attributes never show on screen, but anyone can read them. Developers use them to leave notes for each other.",
      tip: "On a laptop, right-click any website and choose View page source. Every website's code is there to read."
    }
  },

  {
    id: "r2",
    level: "escape",
    site: "museum",
    kind: "edit",
    title: "The Gallery",
    device: "phone",
    concepts: ["display: none", "Flexbox order"],
    story: "The lobby door swings open. Three paintings hang in the dark. Somewhere on this wall, Glitch has painted the next code.",
    goal: "Find the 4-digit code painted on the wall.",
    format: "digits",
    answers: ["1947"],
    decoys: [
      { code: "7491", reply: "Right digits, wrong order. The page decides the order you see them in. Switch the wall on and look." }
    ],
    files: {
      html: `<main class="room">
  <p class="room-tag">Room 2 of 5</p>
  <h1>The Gallery</h1>
  <p class="note">Glitch: "I painted the code on the wall. Then I switched the wall off."</p>
  <div class="wall">
    <figure class="frame"><div class="art art-1"></div><figcaption>Sunrise at the Marina</figcaption></figure>
    <figure class="frame"><div class="art art-2"></div><figcaption>Temple Bells</figcaption></figure>
    <figure class="frame"><div class="art art-3"></div><figcaption>The Last Tram</figcaption></figure>
  </div>
  <div class="secret" aria-label="Painted code">
    <span class="a">7</span>
    <span class="b">4</span>
    <span class="c">9</span>
    <span class="d">1</span>
  </div>
</main>`,
      css: `.wall {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.frame {
  margin: 0;
  padding: 6px;
  border: 3px solid var(--nm-gold);
  background: #0a0c1a;
}
.art {
  aspect-ratio: 3 / 4;
}
.art-1 {
  background: linear-gradient(180deg, #f59e0b, #be185d 60%, #1e3a8a);
}
.art-2 {
  background: radial-gradient(circle at 50% 35%, #fde68a, #92400e 70%);
}
.art-3 {
  background: linear-gradient(135deg, #0f766e, #064e3b 50%, #111827);
}
figcaption {
  margin-top: 6px;
  font-size: 11px;
  color: var(--nm-muted);
}
.secret {
  display: none;
  justify-content: center;
  gap: 18px;
  margin-top: 28px;
  font: 700 54px/1 Georgia, serif;
  color: var(--nm-gold);
  text-shadow: 0 0 18px rgba(212, 169, 74, 0.6);
}
.a {
  order: 4;
}
.b {
  order: 3;
}
.c {
  order: 2;
}
.d {
  order: 1;
}`,
      js: `// The gallery has no script. Everything you need is in the HTML and CSS.`
    },
    fixes: [{ file: "css", find: "  display: none;\n  justify-content", replace: "  display: flex;\n  justify-content" }],
    alts: [{ note: "inline-flex works too", fixes: [{ file: "css", find: "  display: none;\n  justify-content", replace: "  display: inline-flex;\n  justify-content" }] }],
    traps: [{ note: "display: block shows the digits in the wrong order", fixes: [{ file: "css", find: "  display: none;\n  justify-content", replace: "  display: block;\n  justify-content" }] }],
    checks: `test("The painted code is visible", async (t) => {
  t.expect(t.visible(".secret"), "The wall is still switched off.");
});
test("The wall reads 1947", async (t) => {
  const order = t.$$(".secret span")
    .map((s) => ({ s: s, r: s.getBoundingClientRect() }))
    .sort((a, b) => (Math.round(a.r.top) - Math.round(b.r.top)) || (a.r.left - b.r.left))
    .map((x) => x.s.textContent)
    .join("");
  t.expect(order === "1947", "The wall shows " + order + ".");
});`,
    hints: [
      "The digits are already in the code. Something stops them showing.",
      "In styles.css, .secret has display: none, which hides it. It also uses gap and justify-content, which only work with one kind of display.",
      "Change display: none to display: flex. Then read the digits on the wall, not in the code."
    ],
    explain: {
      what: "You switched the wall on by changing display: none to display: flex.",
      why: "display: none hides an element completely. With flex, CSS can show items in a different order from the HTML. That is why 7491 in the code became 1947 on screen.",
      tip: "What you see on a website is HTML plus CSS. The same HTML can look completely different with different CSS."
    }
  },

  {
    id: "r3",
    level: "escape",
    site: "museum",
    kind: "edit",
    title: "The Archive",
    device: "phone",
    concepts: ["true and false", "The console"],
    story: "Behind the gallery, rows of locked drawers. A screen blinks: Archive locked. Only curators may enter.",
    goal: "Find the archive code.",
    format: "letters",
    answers: ["MADRAS"],
    decoys: [
      { code: "RASMAD", reply: "So close. Look at what happens to the shelves before they are joined." },
      { code: "MYLAPORE", reply: "That code expired last week." }
    ],
    files: {
      html: `<main class="room">
  <p class="room-tag">Room 3 of 5</p>
  <h1>The Archive</h1>
  <p class="note">Glitch: "The archive only talks to curators. And curators read the console."</p>
  <div class="drawers">
    <div class="drawer">A to D</div>
    <div class="drawer">E to H</div>
    <div class="drawer">I to L</div>
    <div class="drawer">M to P</div>
    <div class="drawer">Q to T</div>
    <div class="drawer">U to Z</div>
  </div>
  <p id="status" class="status">Archive locked</p>
</main>`,
      css: `.drawers {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  max-width: 300px;
  margin: 0 auto;
}
.drawer {
  padding: 18px 10px;
  border: 1px solid var(--nm-line);
  border-radius: 8px;
  background: linear-gradient(180deg, #232850, #161a33);
  color: var(--nm-muted);
  font: 600 13px system-ui, sans-serif;
}
.status {
  margin-top: 20px;
  color: var(--nm-red);
  font: 700 14px system-ui, sans-serif;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}`,
      js: `// Archive system, version 2.3
const curatorMode = false;
const shelves = ["RAS", "MAD"];
const expiredCode = "MYLAPORE"; // expired last week

function openArchive() {
  const code = shelves.reverse().join("");
  console.log("Archive code: " + code);
  document.getElementById("status").textContent = "Archive open. Check the console.";
}

if (curatorMode) {
  openArchive();
} else {
  console.log("Access denied. Curators only.");
}`
    },
    fixes: [{ file: "js", find: "const curatorMode = false;", replace: "const curatorMode = true;" }],
    alts: [{ note: "Call openArchive() directly", fixes: [{ file: "js", find: "if (curatorMode) {", replace: "if (true) {" }] }],
    checks: `test("The archive opens", async (t) => {
  t.expect(/open/i.test(t.text("#status")), "The archive is still locked.");
});
test("The console shows the archive code", async (t) => {
  t.expect(t.logs().some((l) => l.indexOf("Archive code: MADRAS") !== -1), "The archive code was not printed to the console.");
});`,
    hints: [
      "Glitch says curators read the console. Open the Console panel and see what it says.",
      "Near the top of script.js, curatorMode decides who gets in.",
      "Tap line 2 and change false to true. Then check the Console."
    ],
    explain: {
      what: "You changed false to true, and the code printed the answer to the console.",
      why: "Programs make decisions with true and false. The console is where developers print messages to see what their code is doing.",
      tip: "Open any website on a laptop, press F12 and click Console. That is the same tool developers use every day."
    }
  },

  {
    id: "r4",
    level: "escape",
    site: "museum",
    kind: "edit",
    title: "The Control Room",
    device: "phone",
    concepts: ["The disabled attribute", "pointer-events"],
    story: "The archive leads to a room full of screens. One big red button opens the shutters to the exit. It will not budge.",
    goal: "Get the shutter button working, press it, and read the code.",
    format: "digits",
    answers: ["404"],
    decoys: [
      { code: "202", reply: "That is the signal before the machine works on it. Get the button working and press it." }
    ],
    files: {
      html: `<main class="room">
  <p class="room-tag">Room 4 of 5</p>
  <h1>The Control Room</h1>
  <p class="note">Glitch: "The shutter button works fine. I just made sure you cannot press it. Twice."</p>
  <div class="panel">
    <div id="readout" class="readout">----</div>
    <button id="shutters" class="big-button" type="button" disabled>Open shutters</button>
    <p class="small">Maintenance mode</p>
  </div>
</main>`,
      css: `.panel {
  max-width: 300px;
  margin: 0 auto;
  padding: 22px;
  border: 1px solid var(--nm-line);
  border-radius: 18px;
  background: var(--nm-panel);
  /* Maintenance mode: nothing in this panel can be pressed */
  pointer-events: none;
}
.readout {
  margin-bottom: 18px;
  padding: 14px;
  border-radius: 10px;
  background: #050713;
  color: #4ade80;
  font: 700 36px/1 ui-monospace, monospace;
  letter-spacing: 0.3em;
}
.big-button {
  width: 100%;
  padding: 16px;
  border: 0;
  border-radius: 999px;
  background: var(--nm-red);
  color: #fff;
  font: 700 16px system-ui, sans-serif;
  cursor: pointer;
}
.big-button:disabled {
  background: #4b5563;
  color: #9ca3af;
  cursor: not-allowed;
}
.small {
  margin: 10px 0 0;
  color: var(--nm-muted);
  font: 12px system-ui, sans-serif;
}`,
      js: `const readout = document.getElementById("readout");
const button = document.getElementById("shutters");
const signal = [2, 0, 2];

button.addEventListener("click", function () {
  const digits = signal.map(function (n) {
    return n * 2;
  });
  readout.textContent = "";
  digits.forEach(function (digit, i) {
    setTimeout(function () {
      readout.textContent += digit;
    }, 500 * (i + 1));
  });
});`
    },
    fixes: [
      { file: "html", find: " disabled>Open shutters", replace: ">Open shutters" },
      { file: "css", find: "  /* Maintenance mode: nothing in this panel can be pressed */\n  pointer-events: none;\n", replace: "" }
    ],
    alts: [
      {
        note: "Set pointer-events back to auto instead of deleting it",
        fixes: [
          { file: "html", find: " disabled>Open shutters", replace: ">Open shutters" },
          { file: "css", find: "  pointer-events: none;", replace: "  pointer-events: auto;" }
        ]
      }
    ],
    traps: [
      { note: "Only removing disabled", fixes: [{ file: "html", find: " disabled>Open shutters", replace: ">Open shutters" }] },
      { note: "Only removing pointer-events", fixes: [{ file: "css", find: "  pointer-events: none;\n", replace: "" }] }
    ],
    checks: `test("The button is switched on", async (t) => {
  t.expect(!t.$("#shutters").disabled, "The button is still disabled.");
});
test("Taps reach the button", async (t) => {
  const r = t.rect("#shutters");
  const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  t.expect(el === t.$("#shutters"), "Something stops taps from reaching the button.");
});
test("Pressing it shows the code", async (t) => {
  t.click("#shutters");
  await t.wait(1800);
  t.expect(t.text("#readout") === "404", "The screen shows " + t.text("#readout") + ".");
});`,
    hints: [
      "Glitch said twice. There are two separate locks on this button.",
      "One lock is a single word on the button in index.html. The other is on .panel in styles.css.",
      "Remove disabled from the button in index.html, and remove pointer-events: none from .panel. Then press the button in the room."
    ],
    explain: {
      what: "You removed two locks: the disabled attribute in the HTML and pointer-events: none in the CSS.",
      why: "disabled tells the browser a button is switched off. pointer-events: none makes taps pass straight through an element. Either one alone is enough to stop a button.",
      tip: "When something on a page does not respond, the cause can be in the HTML, the CSS or the JavaScript. Developers check all three."
    }
  },

  {
    id: "r5",
    level: "escape",
    site: "museum",
    kind: "edit",
    title: "The Exit",
    device: "phone",
    concepts: ["Variables", "Exact comparisons"],
    story: "The shutters roll up. One last door, with a clock above it counting down. Glitch's last note is taped to the frame.",
    goal: "Make the exit door open and read the code it shows.",
    format: "letters",
    answers: ["FREEDOM"],
    decoys: [],
    files: {
      html: `<main class="room">
  <p class="room-tag">Room 5 of 5</p>
  <h1>The Exit</h1>
  <p class="note">Glitch: "The exit opens when the clock hits zero. Make yourself comfortable."</p>
  <div id="clock" class="clock">--:--:--</div>
  <div id="door" class="exit-door">
    <span id="door-text" class="door-text">Sealed</span>
  </div>
</main>`,
      css: `.clock {
  margin: 4px auto 18px;
  color: var(--nm-red);
  font: 700 40px/1 ui-monospace, monospace;
  letter-spacing: 0.06em;
  text-shadow: 0 0 14px rgba(229, 72, 77, 0.5);
}
.exit-door {
  display: grid;
  place-items: center;
  width: 190px;
  height: 260px;
  margin: 0 auto;
  border: 6px solid #3b3f63;
  border-radius: 8px;
  background: repeating-linear-gradient(90deg, #1c2042 0 18px, #20254a 18px 36px);
  transition: background 0.6s, box-shadow 0.6s;
}
.exit-door.open {
  background: #ecfdf5;
  box-shadow: 0 0 80px rgba(74, 222, 128, 0.6);
}
.door-text {
  font: 700 22px system-ui, sans-serif;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--nm-muted);
}
.exit-door.open .door-text {
  color: #047857;
}`,
      js: `// Glitch: I made the clock run at double speed. You are welcome.
let secondsLeft = 86401;

const clock = document.getElementById("clock");
const door = document.getElementById("door");
const doorText = document.getElementById("door-text");
const exitCode = [70, 82, 69, 69, 68, 79, 77];

function pad(n) {
  return String(n).padStart(2, "0");
}

function showTime() {
  const h = Math.floor(secondsLeft / 3600);
  const m = Math.floor((secondsLeft % 3600) / 60);
  const s = secondsLeft % 60;
  clock.textContent = pad(h) + ":" + pad(m) + ":" + pad(s);
}

function tick() {
  secondsLeft = secondsLeft - 2;
  showTime();
  if (secondsLeft === 0) {
    clearInterval(timer);
    door.classList.add("open");
    doorText.textContent = String.fromCharCode.apply(null, exitCode);
  }
}

showTime();
const timer = setInterval(tick, 1000);`
    },
    fixes: [{ file: "js", find: "let secondsLeft = 86401;", replace: "let secondsLeft = 4;" }],
    alts: [
      {
        note: "Any small number, with the check changed to <= 0",
        fixes: [
          { file: "js", find: "let secondsLeft = 86401;", replace: "let secondsLeft = 5;" },
          { file: "js", find: "if (secondsLeft === 0) {", replace: "if (secondsLeft <= 0) {" }
        ]
      }
    ],
    traps: [
      { note: "An odd number skips zero", fixes: [{ file: "js", find: "let secondsLeft = 86401;", replace: "let secondsLeft = 5;" }] },
      { note: "Zero straight away never ticks to zero", fixes: [{ file: "js", find: "let secondsLeft = 86401;", replace: "let secondsLeft = 0;" }] }
    ],
    checks: `test("The exit door opens", async (t) => {
  const ok = await t.until(() => t.$("#door").classList.contains("open"), 3600);
  t.expect(ok, "The door never opened. Did the clock land exactly on zero?");
});
test("The door shows the exit code", async (t) => {
  t.expect(t.text("#door-text") === "FREEDOM", "The door shows " + t.text("#door-text") + ".");
});
test("The clock stops", async (t) => {
  const before = t.text("#clock");
  await t.wait(1200);
  t.expect(t.text("#clock") === before, "The clock keeps running after the door opened.");
});`,
    hints: [
      "86401 seconds is a whole day. You do not have that long. You can change it.",
      "Read Glitch's comment: the clock goes down by 2 every second. If it starts on an odd number, can it ever land exactly on 0?",
      "Tap line 2 and set secondsLeft to a small even number, like 4. Then watch the door."
    ],
    explain: {
      what: "You gave the clock a time it could actually finish. It counts down by 2, so it needed an even number to land exactly on zero.",
      why: "Computers do exactly what the code says, not what you meant. A clock that checks for exactly 0 never stops if it jumps from 1 to -1.",
      tip: "That gap between what the code says and what you expected is what developers call a bug. You just found and fixed one."
    }
  }
];
