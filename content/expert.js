// LOCKED CONTENT. Expert level: Reel Seats (movie ticket booking).
// Expert puzzles are "edit the code" with three or four bugs each, some of them subtle.
// The checks test behaviour, so any correct fix passes. "alts" are other correct fixes.
// Field meanings are in content/SCHEMA.md.

export const EXPERT = [
  {
    id: "e1",
    level: "expert",
    site: "reel",
    title: "Every seat picks E8",
    device: "phone",
    concepts: ["Closures and var", "Class names", "Off-by-one limits"],
    ticket: "Tapping any seat highlights E8, which is already booked. Booked seats should never be pickable. And our limit is 6 seats per booking.",
    symptom: "Every tap selects E8. Booked seats can be picked, and the limit lets a 7th seat through.",
    accept: [
      "Tapping a seat selects that seat",
      "Booked (grey) seats cannot be picked",
      "At most 6 seats, with a message when someone tries a 7th",
      "Tapping a selected seat removes it and clears the message"
    ],
    files: {
      html: `<section class="booking">
  <div class="screen" aria-hidden="true">Screen this way</div>
  <div id="seats" class="seats" role="group" aria-label="Seats"></div>
  <div class="legend">
    <span><i class="dot"></i> Available</span>
    <span><i class="dot is-selected"></i> Selected</span>
    <span><i class="dot is-booked"></i> Booked</span>
  </div>
  <p id="summary" class="summary">No seats selected</p>
  <p id="notice" class="notice" aria-live="polite"></p>
</section>`,
      css: `.booking {
  padding: 20px 16px;
}
.screen {
  margin: 0 auto 18px;
  width: 80%;
  padding: 6px;
  border-top: 3px solid var(--rs-amber);
  border-radius: 50% 50% 0 0 / 14px 14px 0 0;
  color: var(--rs-muted);
  font-size: 12px;
  text-align: center;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.seats {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
}
.seat,
.dot {
  aspect-ratio: 1;
  border: 1px solid var(--rs-line);
  border-radius: 8px 8px 4px 4px;
  background: var(--rs-panel);
  font-size: 12px;
  color: var(--rs-muted);
}
.seat.is-selected,
.dot.is-selected {
  background: var(--rs-rose);
  border-color: var(--rs-rose);
  color: #fff;
}
.seat.is-booked,
.dot.is-booked {
  background: #3a3a4a;
  color: #6b6b80;
  cursor: not-allowed;
}
.legend {
  display: flex;
  gap: 14px;
  margin-top: 16px;
  font-size: 12px;
  color: var(--rs-muted);
}
.dot {
  display: inline-block;
  width: 12px;
  vertical-align: -2px;
}
.summary {
  margin-top: 16px;
  font-weight: 700;
}
.notice {
  min-height: 20px;
  color: var(--rs-amber);
  font-size: 14px;
}`,
      js: `const ROWS = ["A", "B", "C", "D", "E"];
const SEATS_PER_ROW = 8;
const BOOKED = ["A3", "A4", "C5", "D1", "D2", "E8"];
const MAX_SEATS = 6;
const PRICE = 180;

const grid = document.getElementById("seats");
const summary = document.getElementById("summary");
const notice = document.getElementById("notice");
const selected = new Set();

for (var r = 0; r < ROWS.length; r++) {
  for (var n = 1; n <= SEATS_PER_ROW; n++) {
    var id = ROWS[r] + n;
    var seat = document.createElement("button");
    seat.type = "button";
    seat.className = "seat";
    seat.textContent = n;
    seat.dataset.id = id;
    seat.setAttribute("aria-label", "Seat " + id);
    if (BOOKED.includes(id)) {
      seat.classList.add("is-booked");
    }
    seat.addEventListener("click", function () {
      toggleSeat(seat, id);
    });
    grid.appendChild(seat);
  }
}

function toggleSeat(el, seatId) {
  if (el.classList.contains("booked")) {
    return;
  }
  if (selected.has(seatId)) {
    selected.delete(seatId);
    el.classList.remove("is-selected");
    notice.textContent = "";
  } else {
    if (selected.size > MAX_SEATS) {
      notice.textContent = "You can pick up to " + MAX_SEATS + " seats.";
      return;
    }
    selected.add(seatId);
    el.classList.add("is-selected");
  }
  renderSummary();
}

function renderSummary() {
  if (selected.size === 0) {
    summary.textContent = "No seats selected";
    return;
  }
  const label = selected.size === 1 ? "1 seat" : selected.size + " seats";
  summary.textContent = label + ": " + Array.from(selected).join(", ") + ". Total ₹" + selected.size * PRICE;
}`
    },
    fixes: [
      { file: "js", find: "for (var r = 0;", replace: "for (let r = 0;" },
      { file: "js", find: "for (var n = 1;", replace: "for (let n = 1;" },
      { file: "js", find: "    var id = ROWS[r] + n;", replace: "    const id = ROWS[r] + n;" },
      { file: "js", find: "    var seat = document.createElement(\"button\");", replace: "    const seat = document.createElement(\"button\");" },
      { file: "js", find: "contains(\"booked\")", replace: "contains(\"is-booked\")" },
      { file: "js", find: "selected.size > MAX_SEATS", replace: "selected.size >= MAX_SEATS" }
    ],
    alts: [
      {
        note: "Keep var, read the tapped seat from the event, and disable booked seats",
        fixes: [
          { file: "js", find: "      toggleSeat(seat, id);", replace: "      toggleSeat(event.currentTarget, event.currentTarget.dataset.id);" },
          { file: "js", find: "seat.addEventListener(\"click\", function () {", replace: "seat.addEventListener(\"click\", function (event) {" },
          { file: "js", find: "      seat.classList.add(\"is-booked\");", replace: "      seat.classList.add(\"is-booked\");\n      seat.disabled = true;" },
          { file: "js", find: "selected.size > MAX_SEATS", replace: "selected.size >= MAX_SEATS" }
        ]
      }
    ],
    hints: [
      "Three bugs. Start with why every click lands on the same seat: E8 is the last seat the loop makes.",
      "var is shared by the whole function, so every click handler sees the last seat and id. Then compare the class the code adds for booked seats with the class it checks for. Then count: when 6 are selected, should a 7th be allowed?",
      "Use let or const in the loop (or read event.currentTarget). Check for is-booked. Block new seats when selected.size >= MAX_SEATS."
    ],
    explain: {
      what: "The loop used var, so all 40 click handlers shared one seat and one id: the last ones, E8. The booked check looked for booked instead of is-booked. And > MAX_SEATS let a 7th seat in.",
      why: "var is scoped to the whole function, not the loop, so by the time anyone clicks, it holds its final value. let and const create a fresh copy for each loop round. Off-by-one errors live wherever > and >= meet a limit.",
      tip: "Avoid var in new code. When a handler acts on the wrong item, log the variable inside the handler and see what it holds at click time."
    },
    checks: `function seat(id) {
  return document.querySelector("[data-id=\\"" + id + "\\"]");
}
function picked() {
  return Array.from(document.querySelectorAll(".seat.is-selected")).map((s) => s.dataset.id);
}
test("Tapping B4 selects B4", async (t) => {
  t.click(seat("B4"));
  const p = picked();
  t.expect(p.length === 1 && p[0] === "B4", "After tapping B4, the selected seats are: " + (p.join(", ") || "none") + ".");
  t.expect(t.text("#summary").includes("B4"), "The summary does not mention B4.");
});
test("Booked seats cannot be picked", async (t) => {
  t.click(seat("A3"));
  t.expect(!seat("A3").classList.contains("is-selected"), "Booked seat A3 was selected.");
  t.expect(picked().length === 1, "Tapping a booked seat changed the selection.");
});
test("No more than 6 seats", async (t) => {
  ["B5", "C1", "C2", "C3", "C4", "C6", "C7"].forEach((id) => t.click(seat(id)));
  const n = picked().length;
  t.expect(n === 6, n + " seats are selected. The limit is 6.");
  t.expect(t.text("#notice").includes("6"), "The limit message does not show.");
  t.expect(t.text("#summary").includes("Total ₹1080"), "The summary should say Total ₹1080 for 6 seats.");
});
test("Tapping a selected seat removes it", async (t) => {
  t.click(seat("B4"));
  t.expect(!seat("B4").classList.contains("is-selected"), "B4 is still selected.");
  t.expect(!t.text("#summary").includes("B4"), "The summary still lists B4.");
  t.expect(t.text("#notice") === "", "The limit message should clear once a seat is removed.");
});`
  },

  {
    id: "e2",
    level: "expert",
    site: "reel",
    title: "Showtimes from the wrong day",
    device: "phone",
    concepts: ["Race conditions", "Async code", "UI state"],
    ticket: "If you tap Sat and then quickly Fri, Friday is highlighted but Saturday's times show. Sometimes two days look selected at once. Please make the list always match the highlighted day.",
    symptom: "Fast taps show times for the wrong day, and old tabs stay highlighted.",
    accept: [
      "Only one day is highlighted at a time",
      "The list always shows the highlighted day, however fast people tap",
      "The loading message clears when the right times arrive",
      "Do not change the fake server at the top of script.js"
    ],
    files: {
      html: `<section class="times-page">
  <h2>Kadal Kaatru <span class="tag">U/A</span></h2>
  <div class="days" role="tablist" aria-label="Pick a day">
    <button class="day" role="tab" data-day="thu" aria-selected="false">Thu 5</button>
    <button class="day" role="tab" data-day="fri" aria-selected="false">Fri 6</button>
    <button class="day" role="tab" data-day="sat" aria-selected="false">Sat 7</button>
  </div>
  <p id="status" class="status" aria-live="polite"></p>
  <ul id="times" class="times"></ul>
</section>`,
      css: `.times-page {
  padding: 20px 16px;
}
.tag {
  margin-left: 6px;
  padding: 2px 8px;
  border: 1px solid var(--rs-line);
  border-radius: 6px;
  font-size: 12px;
  color: var(--rs-muted);
  vertical-align: middle;
}
.days {
  display: flex;
  gap: 8px;
  margin: 16px 0 8px;
}
.day {
  flex: 1;
  padding: 10px 0;
  border: 1px solid var(--rs-line);
  border-radius: 12px;
  background: var(--rs-panel);
  font-weight: 600;
}
.day.is-active {
  border-color: var(--rs-rose);
  background: rgba(244, 63, 94, 0.15);
  color: #fff;
}
.status {
  min-height: 20px;
  color: var(--rs-muted);
  font-size: 13px;
}
.times {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.time {
  width: 100%;
  padding: 12px 0;
  border: 1px solid #22c55e;
  border-radius: 10px;
  background: transparent;
  color: #86efac;
  font-weight: 700;
}`,
      js: `// ----- Fake server. It answers after a short delay. Do not change this part. -----
const SHOWTIMES = {
  thu: ["10:15 AM", "1:30 PM", "6:45 PM"],
  fri: ["11:00 AM", "3:20 PM", "7:10 PM", "10:30 PM"],
  sat: ["9:30 AM", "12:45 PM", "4:00 PM", "8:15 PM", "11:15 PM"]
};
const DELAY = { thu: 700, fri: 150, sat: 400 };
function fetchShowtimes(day) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(SHOWTIMES[day].slice());
    }, DELAY[day]);
  });
}
// ----- App code -----

const tabs = document.querySelectorAll(".day");
const list = document.getElementById("times");
const statusLine = document.getElementById("status");

function showTimes(times) {
  list.textContent = "";
  times.forEach(function (time) {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "time";
    button.textContent = time;
    li.appendChild(button);
    list.appendChild(li);
  });
}

function selectDay(tab) {
  tab.setAttribute("aria-selected", "true");
  tab.classList.add("is-active");
  statusLine.textContent = "Loading showtimes...";
  fetchShowtimes(tab.dataset.day).then(function (times) {
    statusLine.textContent = "";
    showTimes(times);
  });
}

tabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    selectDay(tab);
  });
});

selectDay(tabs[0]);`
    },
    fixes: [
      {
        file: "js",
        find: "function selectDay(tab) {\n  tab.setAttribute(\"aria-selected\", \"true\");\n  tab.classList.add(\"is-active\");\n  statusLine.textContent = \"Loading showtimes...\";\n  fetchShowtimes(tab.dataset.day).then(function (times) {\n",
        replace: "let latestRequest = 0;\n\nfunction selectDay(tab) {\n  tabs.forEach(function (other) {\n    const isThis = other === tab;\n    other.setAttribute(\"aria-selected\", String(isThis));\n    other.classList.toggle(\"is-active\", isThis);\n  });\n  statusLine.textContent = \"Loading showtimes...\";\n  const request = ++latestRequest;\n  fetchShowtimes(tab.dataset.day).then(function (times) {\n    if (request !== latestRequest) {\n      return;\n    }\n"
      }
    ],
    alts: [
      {
        note: "Ignore any answer for a day that is no longer selected",
        fixes: [
          {
            file: "js",
            find: "  tab.setAttribute(\"aria-selected\", \"true\");\n  tab.classList.add(\"is-active\");\n",
            replace: "  tabs.forEach(function (other) {\n    other.setAttribute(\"aria-selected\", \"false\");\n    other.classList.remove(\"is-active\");\n  });\n  tab.setAttribute(\"aria-selected\", \"true\");\n  tab.classList.add(\"is-active\");\n"
          },
          {
            file: "js",
            find: "  fetchShowtimes(tab.dataset.day).then(function (times) {\n",
            replace: "  fetchShowtimes(tab.dataset.day).then(function (times) {\n    if (tab.getAttribute(\"aria-selected\") !== \"true\") {\n      return;\n    }\n"
          }
        ]
      }
    ],
    hints: [
      "Two bugs. Tap the days slowly and it works. That is the clue for the first one. The second is about the tabs you leave behind.",
      "Saturday's answer takes 400 ms, Friday's only 150 ms. Tap Sat then Fri: Friday arrives first, then Saturday's late answer overwrites it. And selectDay never un-highlights the old tab.",
      "Give each request a number and only show the answer if it is still the latest one (or if its tab is still selected). Reset aria-selected and is-active on every tab before setting the new one."
    ],
    explain: {
      what: "A slow answer for an old day arrived after the new one and overwrote it. And old tabs were never un-highlighted.",
      why: "Network answers do not come back in the order you asked. Code that shows whatever arrives last will sometimes show stale data. This is called a race condition.",
      tip: "Whenever a newer request can replace an older one (search boxes, tabs, filters), ignore answers that are no longer the latest. AbortController is another way to cancel the old request."
    },
    checks: `function times() {
  return Array.from(document.querySelectorAll("#times .time")).map((b) => b.textContent);
}
const FRI = "11:00 AM,3:20 PM,7:10 PM,10:30 PM";
const SAT = "9:30 AM,12:45 PM,4:00 PM,8:15 PM,11:15 PM";
test("Thursday loads first", async (t) => {
  const ok = await t.until(() => times().length > 0, 1500);
  t.expect(ok && times().join(",") === "10:15 AM,1:30 PM,6:45 PM", "Thursday should load with 3 shows, starting 10:15 AM.");
});
test("Tapping Sat then Fri shows Friday", async (t) => {
  t.click("[data-day=\\"sat\\"]");
  t.click("[data-day=\\"fri\\"]");
  await t.wait(800);
  t.expect(times().join(",") === FRI, "Friday is selected, but the list shows: " + (times().join(", ") || "nothing") + ".");
  t.expect(t.text("#status") === "", "The loading message is still showing.");
});
test("Only the chosen day is highlighted", async (t) => {
  const on = Array.from(document.querySelectorAll(".day[aria-selected=\\"true\\"]")).map((b) => b.dataset.day);
  t.expect(on.length === 1 && on[0] === "fri", "Highlighted days: " + on.join(", ") + ". Only Friday should be.");
  t.expect(document.querySelectorAll(".day.is-active").length === 1, "More than one day looks active.");
});
test("Tapping Thu then Sat shows Saturday", async (t) => {
  t.click("[data-day=\\"thu\\"]");
  t.click("[data-day=\\"sat\\"]");
  await t.wait(900);
  t.expect(times().join(",") === SAT, "Saturday is selected, but the list shows: " + (times().join(", ") || "nothing") + ".");
  t.expect(document.querySelector(".day.is-active").dataset.day === "sat", "Saturday should be the highlighted day.");
});`
  },

  {
    id: "e3",
    level: "expert",
    site: "reel",
    title: "The popup stuck in its card",
    device: "phone",
    concepts: ["Containing blocks", "Event bubbling", "Keyboard events"],
    ticket: "The booking popup only darkens the movie card, and the header shows on top of it. Tapping Pay closes the popup instead of confirming. Escape does nothing on laptops.",
    symptom: "The popup is trapped inside the card, closes on any tap, and ignores Escape.",
    accept: [
      "The dark backdrop covers the whole screen, above the header",
      "The dialog sits in the centre of the screen with keyboard focus inside it",
      "Tapping inside the dialog keeps it open. Pay shows Booked",
      "Escape and tapping the dark backdrop both close it"
    ],
    files: {
      html: `<header class="rs-header">
  <strong class="rs-logo">Reel Seats</strong>
  <span class="rs-city">Chennai</span>
</header>
<main class="rs-main">
  <article class="movie">
    <div class="poster" aria-hidden="true"></div>
    <div class="info">
      <h2>Kadal Kaatru</h2>
      <p>Tamil, 2h 18m. Tonight 7:10 PM, Screen 2.</p>
      <p class="picked">Seats F7, F8. Total ₹360</p>
      <button id="book" class="btn" type="button">Book now</button>
    </div>
    <div id="booking" class="overlay" hidden>
      <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <h3 id="dialog-title">Confirm your booking</h3>
        <p>Kadal Kaatru, tonight 7:10 PM. Seats F7, F8.</p>
        <div class="dialog-actions">
          <button id="cancel" class="btn btn-ghost" type="button">Cancel</button>
          <button id="confirm" class="btn" type="button">Pay ₹360</button>
        </div>
      </div>
    </div>
  </article>
  <p class="more">More shows tomorrow from 9:30 AM.</p>
</main>`,
      css: `.rs-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: rgba(11, 11, 18, 0.94);
  border-bottom: 1px solid var(--rs-line);
}
.rs-logo {
  color: var(--rs-rose);
  font-size: 18px;
}
.rs-city {
  color: var(--rs-muted);
  font-size: 13px;
}
.rs-main {
  padding: 84px 16px 40px;
}
.movie {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 14px;
  padding: 14px;
  background: var(--rs-panel);
  border: 1px solid var(--rs-line);
  border-radius: 16px;
  transform: translateZ(0);
  transition: box-shadow 0.2s;
}
.movie:hover {
  box-shadow: 0 10px 30px rgba(244, 63, 94, 0.18);
}
.poster {
  aspect-ratio: 2 / 3;
  border-radius: 10px;
  background: linear-gradient(160deg, #1e3a8a, #f43f5e);
}
.info h2 {
  margin: 0 0 4px;
  font-size: 18px;
}
.info p {
  margin: 0 0 8px;
  color: var(--rs-muted);
  font-size: 13px;
}
.overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.7);
}
.overlay[hidden] {
  display: none;
}
.dialog {
  width: min(100%, 320px);
  padding: 20px;
  background: var(--rs-panel);
  border: 1px solid var(--rs-line);
  border-radius: 16px;
}
.dialog h3 {
  margin: 0 0 6px;
}
.dialog p {
  margin: 0 0 16px;
  color: var(--rs-muted);
  font-size: 14px;
}
.dialog-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.btn-ghost {
  background: transparent;
  border: 1px solid var(--rs-line);
}
.more {
  color: var(--rs-muted);
  font-size: 13px;
}`,
      js: `const overlay = document.getElementById("booking");
const bookButton = document.getElementById("book");
const confirmButton = document.getElementById("confirm");
const dialogTitle = document.getElementById("dialog-title");

function openBooking() {
  overlay.hidden = false;
  confirmButton.focus();
}

function closeBooking() {
  overlay.hidden = true;
  bookButton.focus();
}

bookButton.addEventListener("click", openBooking);
document.getElementById("cancel").addEventListener("click", closeBooking);
overlay.addEventListener("click", closeBooking);

confirmButton.addEventListener("click", function () {
  dialogTitle.textContent = "Booked. Enjoy the show.";
  confirmButton.disabled = true;
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Esc" && !overlay.hidden) {
    closeBooking();
  }
});`
    },
    fixes: [
      { file: "css", find: "  border-radius: 16px;\n  transform: translateZ(0);\n", replace: "  border-radius: 16px;\n" },
      { file: "js", find: "overlay.addEventListener(\"click\", closeBooking);", replace: "overlay.addEventListener(\"click\", function (event) {\n  if (event.target === overlay) {\n    closeBooking();\n  }\n});" },
      { file: "js", find: "event.key === \"Esc\"", replace: "event.key === \"Escape\"" }
    ],
    alts: [
      {
        note: "Move the popup out of the card instead of removing the transform",
        fixes: [
          {
            file: "html",
            find: "    <div id=\"booking\" class=\"overlay\" hidden>\n      <div class=\"dialog\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"dialog-title\">\n        <h3 id=\"dialog-title\">Confirm your booking</h3>\n        <p>Kadal Kaatru, tonight 7:10 PM. Seats F7, F8.</p>\n        <div class=\"dialog-actions\">\n          <button id=\"cancel\" class=\"btn btn-ghost\" type=\"button\">Cancel</button>\n          <button id=\"confirm\" class=\"btn\" type=\"button\">Pay ₹360</button>\n        </div>\n      </div>\n    </div>\n",
            replace: ""
          },
          {
            file: "html",
            find: "</main>",
            replace: "</main>\n<div id=\"booking\" class=\"overlay\" hidden>\n  <div class=\"dialog\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"dialog-title\">\n    <h3 id=\"dialog-title\">Confirm your booking</h3>\n    <p>Kadal Kaatru, tonight 7:10 PM. Seats F7, F8.</p>\n    <div class=\"dialog-actions\">\n      <button id=\"cancel\" class=\"btn btn-ghost\" type=\"button\">Cancel</button>\n      <button id=\"confirm\" class=\"btn\" type=\"button\">Pay ₹360</button>\n    </div>\n  </div>\n</div>"
          },
          { file: "js", find: "overlay.addEventListener(\"click\", closeBooking);", replace: "overlay.addEventListener(\"click\", function (event) {\n  if (!event.target.closest(\".dialog\")) {\n    closeBooking();\n  }\n});" },
          { file: "js", find: "event.key === \"Esc\"", replace: "event.key === \"Escape\"" }
        ]
      }
    ],
    hints: [
      "Three bugs: one in styles.css, two in script.js. The overlay's CSS looks right. So why does position: fixed not cover the screen?",
      "A transform on any ancestor makes position: fixed children use that ancestor as their box, and traps their z-index. Clicks inside the dialog also bubble up to the overlay. And check the exact key name for Escape.",
      "Remove transform: translateZ(0) from .movie, or move the overlay out of the card. Close only when event.target is the overlay itself. Use event.key === \"Escape\"."
    ],
    explain: {
      what: "transform: translateZ(0) on the card trapped the fixed popup inside the card and under the header. Clicks anywhere in the dialog bubbled up and closed it. And the key name is Escape, not Esc.",
      why: "transform, filter and a few other properties turn an element into the containing block for fixed children and start a new stacking context, so z-index: 1000 only counts inside the card. Events travel up through every parent, so a listener on the overlay hears clicks from inside the dialog too.",
      tip: "Put modals at the end of body, or use the native <dialog> element with showModal(), which handles the backdrop, focus and Escape for you."
    },
    checks: `function size() {
  return { w: document.documentElement.clientWidth, h: window.innerHeight };
}
test("The popup covers the whole screen", async (t) => {
  t.click("#book");
  t.expect(t.visible("#booking"), "The popup did not open.");
  const r = t.rect("#booking");
  const s = size();
  t.expect(r.left <= 0.5 && r.top <= 0.5 && r.width >= s.w - 1 && r.height >= s.h - 1, "The dark backdrop only covers " + Math.round(r.width) + " x " + Math.round(r.height) + "px, not the whole screen.");
});
test("The popup sits above the header", async (t) => {
  const el = document.elementFromPoint(20, 20);
  t.expect(t.$("#booking").contains(el), "The header is drawn on top of the popup.");
});
test("The dialog is centred and has focus", async (t) => {
  const r = t.rect(".dialog");
  const s = size();
  t.expect(Math.abs((r.left + r.right) / 2 - s.w / 2) <= 2 && Math.abs((r.top + r.bottom) / 2 - s.h / 2) <= 2, "The dialog is not in the middle of the screen.");
  t.expect(t.$(".dialog").contains(document.activeElement), "Keyboard focus is not inside the dialog.");
});
test("Tapping inside the dialog keeps it open", async (t) => {
  t.click("#dialog-title");
  t.expect(t.visible("#booking"), "Tapping the dialog's own title closed the popup.");
  t.click("#confirm");
  t.expect(t.visible("#booking") && /Booked/.test(t.text("#dialog-title")), "After tapping Pay, the popup should stay open and say Booked.");
});
test("Escape closes the popup", async (t) => {
  if (!t.visible("#booking")) {
    t.click("#book");
  }
  t.key("Escape");
  t.expect(!t.visible("#booking"), "Pressing Escape did not close the popup.");
});
test("Tapping the dark backdrop closes it", async (t) => {
  t.click("#book");
  t.click("#booking");
  t.expect(!t.visible("#booking"), "Tapping outside the dialog did not close the popup.");
});`
  },

  {
    id: "e4",
    level: "expert",
    site: "reel",
    title: "The coupon that gives too much",
    device: "phone",
    concepts: ["Business rules in code", "Math.min vs Math.max", "Input clean-up"],
    ticket: "Finance flagged REEL20. It should be 20% off the ticket price only, never the fee, and never more than ₹150. Right now 2 tickets get ₹150 off. Also reel20 in small letters is refused, and a wrong code keeps the old discount.",
    symptom: "REEL20 takes off too much, small letters are refused, and a bad code keeps the old discount.",
    accept: [
      "Ticket ₹180, fee ₹30 per ticket. REEL20 is 20% off tickets only, at most ₹150",
      "Codes ignore capitals and spaces",
      "An invalid code removes any discount",
      "2 tickets: ₹420, with REEL20 ₹348. 6 tickets with REEL20: ₹1,110"
    ],
    files: {
      html: `<section class="pay">
  <h2>Kadal Kaatru, tonight 7:10 PM</h2>
  <div class="stepper">
    <span>Tickets</span>
    <button id="minus" type="button" aria-label="One less ticket">-</button>
    <output id="qty">2</output>
    <button id="plus" type="button" aria-label="One more ticket">+</button>
  </div>
  <div class="coupon">
    <input id="code" placeholder="Coupon code" autocomplete="off" aria-label="Coupon code">
    <button id="apply" type="button">Apply</button>
  </div>
  <p id="coupon-msg" class="coupon-msg" aria-live="polite"></p>
  <dl class="bill">
    <div><dt>Tickets</dt><dd id="base"></dd></div>
    <div><dt>Convenience fee</dt><dd id="fee"></dd></div>
    <div id="discount-row"><dt>Discount</dt><dd id="discount"></dd></div>
    <div class="grand"><dt>Total</dt><dd id="total"></dd></div>
  </dl>
  <p class="rules">REEL20: 20% off the ticket price, up to ₹150. Fees are never discounted.</p>
</section>`,
      css: `.pay {
  padding: 20px 16px;
}
.pay h2 {
  font-size: 18px;
}
.stepper {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
}
.stepper span {
  flex: 1;
  color: var(--rs-muted);
}
.stepper button {
  width: 40px;
  height: 40px;
  border: 1px solid var(--rs-line);
  border-radius: 999px;
  background: var(--rs-panel);
  font-size: 20px;
}
#qty {
  min-width: 24px;
  text-align: center;
  font-weight: 800;
}
.coupon {
  display: flex;
  gap: 8px;
}
.coupon input {
  flex: 1;
  min-width: 0;
  padding: 11px 12px;
  border: 1px solid var(--rs-line);
  border-radius: 10px;
  background: var(--rs-panel);
  text-transform: uppercase;
}
.coupon button {
  padding: 0 16px;
  border: 1px solid var(--rs-rose);
  border-radius: 10px;
  background: transparent;
  color: var(--rs-rose);
  font-weight: 700;
}
.coupon-msg {
  min-height: 20px;
  font-size: 13px;
  color: var(--rs-amber);
}
.bill {
  margin: 0;
  padding: 6px 14px;
  border: 1px solid var(--rs-line);
  border-radius: 12px;
  background: var(--rs-panel);
}
.bill > div:not([hidden]) {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}
.bill dd {
  margin: 0;
}
#discount {
  color: #86efac;
}
.grand {
  border-top: 1px solid var(--rs-line);
  font-size: 18px;
  font-weight: 800;
}
.rules {
  color: var(--rs-muted);
  font-size: 12px;
}`,
      js: `const TICKET_PRICE = 180;
const FEE_PER_TICKET = 30;
const COUPONS = {
  REEL20: { percent: 20, cap: 150 },
  FIRST15: { percent: 15, cap: 100 }
};

let tickets = 2;
let coupon = null;

const qtyOut = document.getElementById("qty");
const codeInput = document.getElementById("code");
const couponMsg = document.getElementById("coupon-msg");

function money(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}

function calculate() {
  const base = tickets * TICKET_PRICE;
  const fee = tickets * FEE_PER_TICKET;
  let discount = 0;
  if (coupon) {
    discount = Math.max((base + fee) * coupon.percent / 100, coupon.cap);
  }
  return { base: base, fee: fee, discount: discount, total: base + fee - discount };
}

function render() {
  const bill = calculate();
  qtyOut.textContent = tickets;
  document.getElementById("base").textContent = money(bill.base);
  document.getElementById("fee").textContent = money(bill.fee);
  document.getElementById("discount").textContent = "- " + money(bill.discount);
  document.getElementById("discount-row").hidden = bill.discount === 0;
  document.getElementById("total").textContent = money(bill.total);
}

document.getElementById("plus").addEventListener("click", function () {
  tickets = Math.min(tickets + 1, 10);
  render();
});

document.getElementById("minus").addEventListener("click", function () {
  tickets = Math.max(tickets - 1, 1);
  render();
});

document.getElementById("apply").addEventListener("click", function () {
  const code = codeInput.value;
  if (COUPONS[code]) {
    coupon = COUPONS[code];
    couponMsg.textContent = code + " applied.";
  } else {
    couponMsg.textContent = "This coupon is not valid.";
  }
  render();
});

render();`
    },
    fixes: [
      { file: "js", find: "discount = Math.max((base + fee) * coupon.percent / 100, coupon.cap);", replace: "discount = Math.min(Math.round(base * coupon.percent / 100), coupon.cap);" },
      { file: "js", find: "const code = codeInput.value;", replace: "const code = codeInput.value.trim().toUpperCase();" },
      { file: "js", find: "  } else {\n    couponMsg.textContent = \"This coupon is not valid.\";", replace: "  } else {\n    coupon = null;\n    couponMsg.textContent = \"This coupon is not valid.\";" }
    ],
    hints: [
      "Four bugs, all in script.js. Work out by hand what 2 tickets with REEL20 should cost, then compare.",
      "The discount is worked out on tickets plus fee, and Math.max picks the bigger of the two numbers. The code is used exactly as typed. And the else branch never forgets the old coupon.",
      "Discount = Math.min(20% of base, cap). Clean the code with trim().toUpperCase(). Set coupon = null when a code is invalid."
    ],
    explain: {
      what: "The discount included the fee, Math.max turned the cap into a minimum, the code was matched exactly as typed, and an invalid code left the old coupon in place.",
      why: "A cap means take the smaller value, which is Math.min. Business rules like never discount the fee must be written into the formula itself. And every state change needs a path back: if one branch sets coupon, the other must clear it.",
      tip: "Before touching a pricing bug, write 3 or 4 expected totals by hand. They become your tests and catch the next mistake too."
    },
    checks: `function plus(t, n) {
  for (let i = 0; i < n; i++) t.click("#plus");
}
function minus(t, n) {
  for (let i = 0; i < n; i++) t.click("#minus");
}
test("2 tickets cost ₹420", async (t) => {
  t.expect(t.text("#base") === "₹360" && t.text("#fee") === "₹60", "Tickets should be ₹360 and the fee ₹60.");
  t.expect(t.text("#total") === "₹420", "The total should be ₹420. It shows " + t.text("#total") + ".");
});
test("reel20 in small letters with spaces works", async (t) => {
  t.type("#code", "  reel20 ");
  t.click("#apply");
  t.expect(/applied/i.test(t.text("#coupon-msg")), "The coupon was refused: " + t.text("#coupon-msg"));
  t.expect(t.text("#discount") === "- ₹72", "20% off ₹360 is ₹72. The discount shows " + t.text("#discount") + ".");
  t.expect(t.text("#total") === "₹348", "The total should be ₹348. It shows " + t.text("#total") + ".");
});
test("The discount never goes above ₹150", async (t) => {
  plus(t, 4);
  t.expect(t.text("#qty") === "6", "There should be 6 tickets.");
  t.expect(t.text("#discount") === "- ₹150", "6 tickets with REEL20 should get ₹150 off (the cap). It shows " + t.text("#discount") + ".");
  t.expect(t.text("#total") === "₹1,110", "The total should be ₹1,110. It shows " + t.text("#total") + ".");
});
test("The fee is never discounted", async (t) => {
  minus(t, 5);
  t.expect(t.text("#discount") === "- ₹36" && t.text("#total") === "₹174", "1 ticket with REEL20 should be ₹180 + ₹30 - ₹36 = ₹174. It shows " + t.text("#total") + ".");
});
test("A wrong code removes the discount", async (t) => {
  t.type("#code", "REEL50");
  t.click("#apply");
  t.expect(/not valid/i.test(t.text("#coupon-msg")), "REEL50 should be refused.");
  t.expect(t.text("#total") === "₹210", "After a wrong code, 1 ticket should cost ₹210 with no discount. It shows " + t.text("#total") + ".");
  t.expect(!t.visible("#discount-row"), "The discount line should hide.");
});`
  },

  {
    id: "e5",
    level: "expert",
    site: "reel",
    title: "Details for the wrong movie",
    device: "laptop",
    concepts: ["Re-rendering and event listeners", "Indexes after filtering", "Plurals"],
    ticket: "After you pick a language, the Details buttons stop working. When they did work, they opened the wrong movie. The count also always says Showing 6 movies, and it should say 1 movie, not 1 movies.",
    symptom: "Filtering kills the Details buttons, the count never changes, and details can show the wrong film.",
    accept: [
      "The count matches the visible movies, with 1 movie for one",
      "Details works after any filter, any number of times",
      "Details always shows the movie on that card"
    ],
    files: {
      html: `<section class="browse">
  <div class="chips" role="group" aria-label="Language">
    <button class="chip is-active" type="button" data-lang="All">All</button>
    <button class="chip" type="button" data-lang="Tamil">Tamil</button>
    <button class="chip" type="button" data-lang="English">English</button>
    <button class="chip" type="button" data-lang="Malayalam">Malayalam</button>
  </div>
  <p id="count" class="count"></p>
  <div class="layout">
    <ul id="movies" class="movies"></ul>
    <aside id="details" class="details" aria-live="polite">
      <h3 id="details-title">Pick a movie</h3>
      <p id="details-text">Tap Details on any movie to see more.</p>
    </aside>
  </div>
</section>`,
      css: `.browse {
  max-width: 980px;
  margin: 0 auto;
  padding: 24px;
}
.chips {
  display: flex;
  gap: 8px;
}
.chip {
  padding: 8px 16px;
  border: 1px solid var(--rs-line);
  border-radius: 999px;
  background: var(--rs-panel);
  color: var(--rs-muted);
  font-weight: 600;
}
.chip.is-active {
  border-color: var(--rs-rose);
  background: var(--rs-rose);
  color: #fff;
}
.count {
  color: var(--rs-muted);
  font-size: 14px;
}
.layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  align-items: start;
}
.movies {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.movie {
  padding: 14px;
  border: 1px solid var(--rs-line);
  border-radius: 14px;
  background: var(--rs-panel);
}
.movie h4 {
  margin: 0 0 4px;
}
.movie p {
  margin: 0 0 12px;
  color: var(--rs-muted);
  font-size: 13px;
}
.details-btn {
  padding: 6px 12px;
  border: 1px solid var(--rs-line);
  border-radius: 999px;
  background: transparent;
  font-size: 13px;
}
.details {
  position: sticky;
  top: 16px;
  padding: 18px;
  border: 1px solid var(--rs-rose);
  border-radius: 16px;
  background: rgba(244, 63, 94, 0.08);
}
.details h3 {
  margin: 0 0 8px;
}
.details p {
  margin: 0;
  color: var(--rs-muted);
}`,
      js: `const MOVIES = [
  { title: "Kadal Kaatru", lang: "Tamil", runtime: "2h 18m", about: "A fisherman's daughter takes on the sea that took her father." },
  { title: "Signal Lost", lang: "English", runtime: "1h 52m", about: "A radio engineer hears a call from a ship that sank in 1994." },
  { title: "Neelam", lang: "Tamil", runtime: "2h 05m", about: "Two sisters run a sari shop, and a secret." },
  { title: "Monsoon Letters", lang: "English", runtime: "2h 10m", about: "Letters left in a library book connect two strangers." },
  { title: "Ammini's Kitchen", lang: "Malayalam", runtime: "1h 58m", about: "A home cook enters a TV contest at sixty-two." },
  { title: "Last Bus to Adyar", lang: "Tamil", runtime: "2h 01m", about: "Six strangers, one late-night bus, one wrong turn." }
];

const list = document.getElementById("movies");
const countLine = document.getElementById("count");
const chips = document.querySelectorAll(".chip");
let currentLang = "All";

function render() {
  const visible = currentLang === "All"
    ? MOVIES
    : MOVIES.filter(function (movie) { return movie.lang === currentLang; });
  list.textContent = "";
  visible.forEach(function (movie, index) {
    const li = document.createElement("li");
    li.className = "movie";
    li.dataset.index = index;
    const heading = document.createElement("h4");
    heading.textContent = movie.title;
    const meta = document.createElement("p");
    meta.textContent = movie.lang + ", " + movie.runtime;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "details-btn";
    button.textContent = "Details";
    li.append(heading, meta, button);
    list.appendChild(li);
  });
  countLine.textContent = "Showing " + MOVIES.length + " movies";
}

function showDetails(movie) {
  document.getElementById("details-title").textContent = movie.title;
  document.getElementById("details-text").textContent = movie.about;
}

function bindDetails() {
  document.querySelectorAll(".details-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      const index = button.closest(".movie").dataset.index;
      showDetails(MOVIES[index]);
    });
  });
}

chips.forEach(function (chip) {
  chip.addEventListener("click", function () {
    chips.forEach(function (c) { c.classList.toggle("is-active", c === chip); });
    currentLang = chip.dataset.lang;
    render();
  });
});

render();
bindDetails();`
    },
    fixes: [
      { file: "js", find: "li.dataset.index = index;", replace: "li.dataset.index = MOVIES.indexOf(movie);" },
      { file: "js", find: "  countLine.textContent = \"Showing \" + MOVIES.length + \" movies\";\n}", replace: "  const n = visible.length;\n  countLine.textContent = \"Showing \" + n + (n === 1 ? \" movie\" : \" movies\");\n  bindDetails();\n}" },
      { file: "js", find: "render();\nbindDetails();", replace: "render();" }
    ],
    alts: [
      {
        note: "One listener on the list (event delegation), with the movie title stored on each card",
        fixes: [
          { file: "js", find: "li.dataset.index = index;", replace: "li.dataset.title = movie.title;" },
          { file: "js", find: "  countLine.textContent = \"Showing \" + MOVIES.length + \" movies\";", replace: "  countLine.textContent = \"Showing \" + visible.length + \" \" + (visible.length === 1 ? \"movie\" : \"movies\");" },
          { file: "js", find: "render();\nbindDetails();", replace: "list.addEventListener(\"click\", function (event) {\n  const card = event.target.closest(\".details-btn\") && event.target.closest(\".movie\");\n  if (card) {\n    showDetails(MOVIES.find(function (m) { return m.title === card.dataset.title; }));\n  }\n});\n\nrender();" }
        ]
      }
    ],
    hints: [
      "Three bugs. Filter, then tap Details. Ask: are these the same buttons that bindDetails found when the page loaded?",
      "render() throws away every card and builds new ones, so listeners added once at the start are lost. The index saved on each card is its position in the filtered list, but it is looked up in the full MOVIES list. And the count line never looks at what is visible.",
      "Bind after every render, or use one listener on the list. Store something that points at the real movie, like MOVIES.indexOf(movie) or its title. Count visible.length and say movie when it is 1."
    ],
    explain: {
      what: "Listeners were added once, then render() replaced every button. The card index was a position in the filtered list, used on the full list. And the count always used MOVIES.length.",
      why: "Event listeners belong to elements. Remove the element and its listeners go with it. And an index only makes sense in the list it came from: after filtering, position 1 is Neelam, but MOVIES[1] is Signal Lost.",
      tip: "For lists that re-render, attach one listener to the container and read an id from data attributes. Store ids, not positions."
    },
    checks: `function cards() {
  return Array.from(document.querySelectorAll(".movie"));
}
function chip(lang) {
  return document.querySelector(".chip[data-lang=\\"" + lang + "\\"]");
}
function details(card) {
  card.querySelector(".details-btn").click();
  return document.getElementById("details-title").textContent;
}
test("All shows 6 movies", async (t) => {
  t.expect(cards().length === 6, "There should be 6 movie cards.");
  t.expect(t.text("#count") === "Showing 6 movies", "The count should say Showing 6 movies.");
});
test("Tamil shows 3 movies and says so", async (t) => {
  t.click(chip("Tamil"));
  t.expect(cards().length === 3, "Tamil should show 3 movies.");
  t.expect(t.text("#count") === "Showing 3 movies", "The count says " + t.text("#count") + ". It should say Showing 3 movies.");
});
test("Details works after filtering", async (t) => {
  const title = details(cards()[1]);
  t.expect(title === "Neelam", "Details on the second Tamil movie shows: " + title + ". It should show Neelam.");
});
test("One movie is 1 movie", async (t) => {
  t.click(chip("Malayalam"));
  t.expect(t.text("#count") === "Showing 1 movie", "The count says " + t.text("#count") + ". It should say Showing 1 movie.");
  const title = details(cards()[0]);
  t.expect(title === "Ammini's Kitchen", "Details shows " + title + ". It should show Ammini's Kitchen.");
});
test("Back to All, details still match", async (t) => {
  t.click(chip("All"));
  t.expect(cards().length === 6, "All should show 6 movies again.");
  const title = details(cards()[5]);
  t.expect(title === "Last Bus to Adyar", "Details on the last card shows " + title + ". It should show Last Bus to Adyar.");
  t.expect(document.querySelectorAll(".chip.is-active").length === 1, "More than one filter looks active.");
});`
  }
];
