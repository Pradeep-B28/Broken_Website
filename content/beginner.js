// LOCKED CONTENT. Beginner level: Mylapore Kaapi Club (a cafe website).
// Beginner puzzles are "spot and pick": tap the line that causes the bug, then pick the right fix.
// "fixes" turn the broken files into the fixed ones. tools/puzzle-lab.html proves that the broken
// files fail the checks and the fixed files pass. Field meanings are in content/SCHEMA.md.

export const BEGINNER = [
  {
    id: "b1",
    level: "beginner",
    site: "kaapi",
    title: "The flat button",
    device: "laptop",
    concepts: ["CSS class names", "Selectors"],
    ticket: "Our Order now button looks like plain text since the last update. Customers are not finding it. Please fix it today.",
    symptom: "Order now has no brown background, no padding and no rounded corners. Visit us looks fine.",
    files: {
      html: `<header class="hero">
  <div class="wrap">
    <p class="eyebrow">Mylapore, Chennai</p>
    <h1>Filter kaapi, the slow way</h1>
    <p class="lead">Fresh decoction every morning. Chicory blend, brass tumblers, no shortcuts.</p>
    <div class="actions">
      <a href="#menu" class="btn btn--primary">Order now</a>
      <a href="#visit" class="btn btn--ghost">Visit us</a>
    </div>
  </div>
</header>`,
      css: `.hero {
  background: linear-gradient(160deg, #fff7ea, #f3e2c7);
  padding: 48px 0;
}
.eyebrow {
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 12px;
  color: var(--kc-gold);
}
.lead {
  max-width: 46ch;
  font-size: 18px;
}
.actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}
.btn {
  display: inline-block;
  font: 600 15px/1 system-ui, sans-serif;
  text-decoration: none;
}
.btn-primary {
  background: var(--kc-brown);
  color: #fff;
  padding: 14px 22px;
  border-radius: 999px;
}
.btn--ghost {
  color: var(--kc-brown);
  padding: 14px 22px;
  border: 1.5px solid currentColor;
  border-radius: 999px;
}`,
      js: `// No JavaScript on this part of the page.`
    },
    answer: { css: [25], html: [7] },
    options: [
      {
        text: "Change line 25 of styles.css to .btn--primary {",
        correct: true,
        why: "The HTML says btn--primary with two dashes, like btn--ghost. The CSS rule said btn-primary with one dash, so it matched nothing."
      },
      {
        text: "Add !important to the background on line 26",
        correct: false,
        why: "!important only wins a fight between rules that both match. This rule matches no element, so there is no fight to win."
      },
      {
        text: "Move the .btn-primary rule above the .btn rule",
        correct: false,
        why: "Order only matters when two rules match the same element. This rule matches nothing, wherever it sits."
      },
      {
        text: "Change display: inline-block to display: block on line 21",
        correct: false,
        why: "That changes how the button sits in the row, not its colours. The brown background lives in a rule that never applies."
      }
    ],
    fixes: [{ file: "css", find: ".btn-primary {", replace: ".btn--primary {" }],
    hints: [
      "The ghost button works. Compare how its class is written in two places.",
      "Look at the class names in index.html, then find the rule for the primary button in styles.css.",
      "Count the dashes. btn--primary and btn-primary are different names to the browser."
    ],
    explain: {
      what: "The CSS rule was named .btn-primary, but the button's class is btn--primary.",
      why: "A selector must match the class name exactly. One missing dash means the rule silently applies to nothing. Browsers never warn you about this.",
      tip: "When a style does nothing, check the selector first. Right-click the element, choose Inspect, and see which rules actually apply."
    },
    checks: `test("Order now has the brown background", async (t) => {
  const bg = t.css(".actions .btn:first-child", "background-color");
  t.expect(bg === "rgb(107, 62, 38)", "Order now still has no brown background.");
});
test("Order now is padded and shaped like a pill", async (t) => {
  const b = ".actions .btn:first-child";
  t.expect(t.css(b, "padding-left") === "22px", "Order now still has no side padding.");
  t.expect(parseFloat(t.css(b, "border-top-left-radius")) >= 100, "Order now still has square corners.");
});
test("Visit us still looks the same", async (t) => {
  const g = ".actions .btn:last-child";
  t.expect(t.css(g, "border-top-style") === "solid", "Visit us lost its border.");
  t.expect(t.css(g, "background-color") === "rgba(0, 0, 0, 0)", "Visit us should stay see-through.");
});`
  },

  {
    id: "b2",
    level: "beginner",
    site: "kaapi",
    title: "Everything turned bold",
    device: "laptop",
    concepts: ["Closing HTML tags"],
    ticket: "Since we added Today's special, the whole page below it looks bold. Even our address in the footer.",
    symptom: "Rose Milk should be the only bold words. Everything after it is bold too.",
    files: {
      html: `<main class="wrap">
  <section class="special">
    <h2>Today's special</h2>
    <p>Try our <strong>Rose Milk<strong> with a crisp ghee roast.</p>
    <p class="note">Available 4 PM to 8 PM only.</p>
  </section>
  <section class="about">
    <h2>About us</h2>
    <p>We started as a six-seat counter near the temple tank. The tumblers are still brass.</p>
  </section>
</main>
<footer class="site-footer">
  <p>12 Temple Lane, Mylapore, Chennai</p>
  <p>Open every day, 7 AM to 10 PM</p>
</footer>`,
      css: `.special {
  background: #fff;
  border-left: 4px solid var(--kc-gold);
  padding: 16px 20px;
  border-radius: 8px;
}
.special strong {
  color: var(--kc-brown);
}
.note {
  font-size: 14px;
  opacity: 0.8;
}
.about {
  margin-top: 32px;
}
.site-footer {
  background: var(--kc-ink);
  color: #f3e2c7;
  padding: 20px;
  font-size: 14px;
}`,
      js: `// No JavaScript on this part of the page.`
    },
    answer: { html: [4] },
    options: [
      {
        text: "Line 4 of index.html: change the second <strong> to </strong>",
        correct: true,
        why: "The bold tag was opened twice and never closed. The browser keeps it open and carries it into every paragraph after it."
      },
      {
        text: "Add .about p, .site-footer p { font-weight: normal; } to styles.css",
        correct: false,
        why: "That hides the symptom. The page still has an open strong tag wrapping everything, which screen readers and search engines read as important text."
      },
      {
        text: "Line 4 of index.html: change both <strong> tags to <b>",
        correct: false,
        why: "Same problem with a different tag. Nothing closes it, so it still leaks."
      },
      {
        text: "Line 4 of index.html: add </p> right after the second <strong>",
        correct: false,
        why: "The paragraph already closes at the end of the line. The tag that is missing its partner is strong."
      }
    ],
    fixes: [{ file: "html", find: "Rose Milk<strong>", replace: "Rose Milk</strong>" }],
    hints: [
      "Bold that spreads is almost always a tag that was opened but never closed.",
      "Look at the Today's special paragraph in index.html.",
      "Every <strong> needs a matching </strong>. Check both tags on line 4."
    ],
    explain: {
      what: "The second <strong> on line 4 should have been a closing </strong>.",
      why: "When a formatting tag like strong is left open, the browser reopens it in every following paragraph to keep its promise. So the bold spreads all the way down.",
      tip: "When styling leaks across the page, look for an unclosed tag just before the point where it starts. Code editors highlight matching tags to help."
    },
    checks: `test("Only Rose Milk is bold", async (t) => {
  const strongs = t.$$("strong");
  t.expect(strongs.length === 1 && strongs[0].textContent.trim() === "Rose Milk", "The bold tag is still open, so it wraps more than the words Rose Milk.");
});
test("The note is not bold", async (t) => {
  t.expect(!t.$(".note strong") && t.css(".note", "font-weight") === "400", "Available 4 PM to 8 PM only is still bold.");
});
test("About us and the footer are not bold", async (t) => {
  t.expect(!t.$(".about p strong"), "The About us text is still bold.");
  t.expect(!t.$(".site-footer strong"), "The footer address is still bold.");
});`
  },

  {
    id: "b3",
    level: "beginner",
    site: "kaapi",
    title: "The silent Subscribe button",
    device: "phone",
    concepts: ["JavaScript events"],
    ticket: "People type their email and press Subscribe. Nothing happens. No thank-you message, no error, nothing.",
    symptom: "Pressing Subscribe does nothing, with a good email or a bad one.",
    files: {
      html: `<section class="newsletter wrap">
  <h2>Get the weekly menu</h2>
  <p>One email every Monday. Unsubscribe anytime.</p>
  <div class="row">
    <input id="email" type="email" placeholder="you@example.com" aria-label="Email">
    <button id="subscribe" type="button">Subscribe</button>
  </div>
  <p id="message" class="message" hidden></p>
</section>`,
      css: `.newsletter {
  text-align: center;
}
.row {
  display: flex;
  gap: 8px;
  max-width: 420px;
  margin: 16px auto 0;
}
#email {
  flex: 1;
  min-width: 0;
  padding: 12px 14px;
  border: 1px solid #d6c3a5;
  border-radius: 10px;
  font: inherit;
}
#subscribe {
  padding: 12px 16px;
  border: 0;
  border-radius: 10px;
  background: var(--kc-brown);
  color: #fff;
  font: 600 15px system-ui, sans-serif;
}
.message {
  margin-top: 12px;
  color: #166534;
}
.message.error {
  color: #b91c1c;
}`,
      js: `const emailInput = document.getElementById("email");
const button = document.getElementById("subscribe");
const message = document.getElementById("message");

function isValidEmail(value) {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value);
}

function showMessage(text, isError) {
  message.textContent = text;
  message.classList.toggle("error", isError);
  message.hidden = false;
}

button.addEventListener("onclick", function () {
  const email = emailInput.value.trim();
  if (!isValidEmail(email)) {
    showMessage("Please enter a valid email address.", true);
    return;
  }
  showMessage("Thanks! See you on Monday.", false);
  emailInput.value = "";
});`
    },
    answer: { js: [15] },
    options: [
      {
        text: "Line 15 of script.js: change \"onclick\" to \"click\"",
        correct: true,
        why: "addEventListener takes the event name without on. There is no event called onclick, so the function never ran."
      },
      {
        text: "Line 6 of script.js: simplify the check to /@/.test(value)",
        correct: false,
        why: "The check is fine. It never gets a chance to run, because the click is never heard."
      },
      {
        text: "Line 12 of script.js: use message.style.display = \"block\" instead",
        correct: false,
        why: "showMessage is never called, so changing how it shows the message changes nothing."
      },
      {
        text: "Line 2 of script.js: use document.querySelector(\"subscribe\")",
        correct: false,
        why: "That looks for a <subscribe> tag, which does not exist. getElementById was already finding the button."
      }
    ],
    fixes: [{ file: "js", find: "addEventListener(\"onclick\"", replace: "addEventListener(\"click\"" }],
    hints: [
      "The email check and the message code look fine. Ask yourself: does any of it run at all?",
      "Look at the line that connects the button to the function.",
      "In HTML you write onclick. In addEventListener you write the event name only."
    ],
    explain: {
      what: "The listener was added for an event named onclick, which does not exist. It should be click.",
      why: "The on prefix belongs to HTML attributes like onclick=\"...\". addEventListener wants the bare event name. A wrong name throws no error. It just waits forever.",
      tip: "When nothing happens and the console is quiet, put console.log(\"clicked\") as the first line of the function. If it never prints, the event is not wired up."
    },
    checks: `test("A wrong email shows an error", async (t) => {
  t.type("#email", "meena@kaapi");
  t.click("#subscribe");
  t.expect(t.visible("#message"), "Nothing appears when Subscribe is pressed.");
  t.expect(/valid email/i.test(t.text("#message")), "The message should ask for a valid email.");
});
test("A real email gets a thank-you", async (t) => {
  t.type("#email", "meena@kaapiclub.example");
  t.click("#subscribe");
  t.expect(/thanks/i.test(t.text("#message")), "A correct email did not get the thank-you message.");
  t.expect(!t.$("#message").classList.contains("error"), "The thank-you message is still styled as an error.");
});
test("The email box clears after subscribing", async (t) => {
  t.expect(t.$("#email").value === "", "The email is still in the box after subscribing.");
});`
  },

  {
    id: "b4",
    level: "beginner",
    site: "kaapi",
    title: "The menu forgot its columns",
    device: "laptop",
    concepts: ["CSS grid", "CSS syntax"],
    ticket: "On a laptop our menu should show three cards in a row. Now they sit one under the other and the page looks empty.",
    symptom: "On a wide screen the three menu cards stack in one column.",
    files: {
      html: `<section id="menu" class="wrap">
  <h2>Menu</h2>
  <div class="menu-grid">
    <article class="card">
      <h3>Filter Kaapi</h3>
      <p>Chicory blend, served in a brass tumbler and dabarah.</p>
      <span class="price">₹40</span>
    </article>
    <article class="card">
      <h3>Ghee Roast Dosa</h3>
      <p>Paper thin, crisp edges, coconut chutney on the side.</p>
      <span class="price">₹90</span>
    </article>
    <article class="card">
      <h3>Rava Kesari</h3>
      <p>Made with ghee and a pinch of saffron. Warm, every day.</p>
      <span class="price">₹60</span>
    </article>
  </div>
</section>`,
      css: `.menu-grid {
  display: grid;
  grid-template-columns: repeat(3 1fr);
  gap: 20px;
}
.card {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 6px 18px rgba(43, 29, 20, 0.08);
}
.card h3 {
  margin-bottom: 4px;
}
.price {
  display: inline-block;
  margin-top: 12px;
  font-weight: 700;
  color: var(--kc-brown);
}
@media (max-width: 640px) {
  .menu-grid {
    grid-template-columns: 1fr;
  }
}`,
      js: `// No JavaScript on this part of the page.`
    },
    answer: { css: [3] },
    options: [
      {
        text: "Line 3 of styles.css: write repeat(3, 1fr) with a comma",
        correct: true,
        why: "repeat() needs a comma between the count and the size. Without it the whole line is invalid, and the browser throws the line away."
      },
      {
        text: "Line 21 of styles.css: change max-width to min-width",
        correct: false,
        why: "The phone rule is correct and does not apply on a laptop. Flipping it would force one column on every wide screen."
      },
      {
        text: "Line 2 of styles.css: change display: grid to display: flex",
        correct: false,
        why: "Flex would put the cards in a row, but with uneven widths and no real grid. It hides the real mistake on line 3."
      },
      {
        text: "Line 9 of styles.css: remove the padding from .card",
        correct: false,
        why: "Padding only adds space inside each card. It has nothing to do with how many columns the grid has."
      }
    ],
    fixes: [{ file: "css", find: "repeat(3 1fr)", replace: "repeat(3, 1fr)" }],
    hints: [
      "The grid is turned on, but the browser ignores how many columns you asked for.",
      "Look closely at the grid-template-columns line.",
      "Functions like repeat() separate their parts with commas."
    ],
    explain: {
      what: "repeat(3 1fr) was missing a comma. It should be repeat(3, 1fr).",
      why: "When a CSS value is invalid, the browser drops that one line and keeps going. With no column template, a grid has one column, so the cards stacked.",
      tip: "In DevTools, an invalid CSS line shows with a line through it and a small warning icon. That is the fastest way to spot a typo."
    },
    checks: `test("Three cards sit in one row on a laptop", async (t) => {
  const tops = t.$$(".card").map((c) => Math.round(c.getBoundingClientRect().top));
  t.expect(tops.length === 3 && tops[0] === tops[1] && tops[1] === tops[2], "The cards are still stacked one under another.");
});
test("The cards share the width evenly", async (t) => {
  const w = t.$$(".card").map((c) => c.getBoundingClientRect().width);
  t.expect(Math.max(...w) - Math.min(...w) < 2, "The three cards have different widths.");
});
test("There is a 20px gap between cards", async (t) => {
  const [a, b] = t.$$(".card").map((c) => c.getBoundingClientRect());
  t.expect(Math.abs(b.left - a.right - 20) < 1.5, "The gap between the first two cards is not 20px.");
});`
  },

  {
    id: "b5",
    level: "beginner",
    site: "kaapi",
    title: "The page that slides sideways",
    device: "phone",
    concepts: ["Box model", "Mobile layout"],
    ticket: "On my phone the page wiggles left and right when I scroll. Something is wider than the screen.",
    symptom: "On a phone the Visit us card pokes out past the right edge, so the page scrolls sideways.",
    files: {
      html: `<section id="visit" class="visit">
  <h2>Visit us</h2>
  <div class="map-card">
    <p class="map-label">12 Temple Lane, Mylapore</p>
    <p>Two minutes from the tank. Parking on the side street.</p>
    <a class="call" href="tel:+910000000000">Call the cafe</a>
  </div>
</section>`,
      css: `.visit {
  padding: 32px 0;
}
.visit h2 {
  padding: 0 20px;
}
.map-card {
  width: 100%;
  padding: 24px;
  background: #fff;
  border: 1px solid #ead9bf;
  border-radius: 16px;
}
.map-label {
  font-weight: 700;
  overflow-wrap: anywhere;
}
.call {
  display: inline-block;
  margin-top: 8px;
  padding: 12px 18px;
  background: var(--kc-brown);
  color: #fff;
  border-radius: 999px;
  text-decoration: none;
}`,
      js: `// No JavaScript on this part of the page.`
    },
    answer: { css: [8, 9] },
    options: [
      {
        text: "Add box-sizing: border-box; to .map-card",
        correct: true,
        why: "By default, width: 100% means the content is full width, and the padding and border are added on top. border-box counts them inside the 100%."
      },
      {
        text: "Add body { overflow-x: hidden; }",
        correct: false,
        why: "That hides the sideways scroll but cuts off the right edge of the card. The card is still too wide."
      },
      {
        text: "Change width: 100% to width: 100vw",
        correct: false,
        why: "100vw is the full screen width, and the padding is still added on top. Still too wide."
      },
      {
        text: "Change padding: 24px to padding: 24px 0",
        correct: false,
        why: "The text would touch the card's edges, and the 1px border on each side still pushes it past the screen."
      }
    ],
    fixes: [{ file: "css", find: "  width: 100%;\n  padding: 24px;", replace: "  width: 100%;\n  box-sizing: border-box;\n  padding: 24px;" }],
    hints: [
      "Measure the card: how wide is it, and how wide is the screen?",
      "The card asks for 100% width, and then gets padding and a border too.",
      "There is one CSS property that decides whether padding counts inside the width or on top of it."
    ],
    explain: {
      what: "The card had width: 100% plus 24px padding and a 1px border on each side, so it was 50px wider than the screen.",
      why: "In the default box model, width only covers the content. Padding and border are added on top. box-sizing: border-box makes width include them.",
      tip: "Many teams add * { box-sizing: border-box; } at the top of every stylesheet so this never happens."
    },
    checks: `test("The card fits inside the phone screen", async (t) => {
  const vw = document.documentElement.clientWidth;
  const r = t.rect(".map-card");
  t.expect(r.right <= vw + 0.5, "The address card is " + Math.round(r.right - vw) + "px wider than the screen.");
  t.expect(document.documentElement.scrollWidth <= vw + 0.5, "The page can still scroll sideways.");
});
test("The card keeps its padding and border", async (t) => {
  t.expect(t.css(".map-card", "padding-left") === "24px", "The card lost its side padding.");
  t.expect(t.css(".map-card", "border-right-width") === "1px", "The card lost its border.");
});
test("The Call button is fully on screen", async (t) => {
  const vw = document.documentElement.clientWidth;
  t.expect(t.rect(".call").right <= vw + 0.5, "The Call button is cut off.");
});`
  }
];
