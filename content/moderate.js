// LOCKED CONTENT. Moderate level: Marina Mart (a grocery store).
// Moderate puzzles are "edit the code": the player changes the real files and runs the checks.
// Each puzzle has two bugs. The checks test behaviour, so any correct fix passes.
// "alts" are other correct fixes. tools/puzzle-lab.html proves they pass too.
// Field meanings are in content/SCHEMA.md.

export const MODERATE = [
  {
    id: "m1",
    level: "moderate",
    site: "marina",
    title: "Search that finds the wrong things",
    device: "phone",
    concepts: ["String methods", "The hidden attribute"],
    ticket: "Customers type milk and only Buttermilk shows up. Typing Milk gives different results. And No products found is always on screen, even when products are listed.",
    symptom: "Search depends on capital letters and spaces, and the empty message never hides.",
    accept: [
      "milk, Milk, MILK and \" milk \" all find the same 3 products",
      "An empty search shows all 8 products",
      "No products found shows only when nothing matches"
    ],
    files: {
      html: `<div class="shop">
  <h1 class="title">Marina Mart</h1>
  <label class="search">
    <span class="sr-only">Search products</span>
    <input id="q" type="search" placeholder="Search rice, milk, coffee" autocomplete="off">
  </label>
  <p id="count" class="count"></p>
  <ul id="results" class="grid"></ul>
  <p id="empty" class="empty" hidden>No products found. Try another word.</p>
</div>`,
      css: `.shop {
  max-width: 720px;
  margin: 0 auto;
  padding: 20px 16px;
}
.title {
  margin: 0 0 12px;
  font-size: 22px;
  color: var(--mm-brand);
}
.search input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--mm-line);
  border-radius: 12px;
  background: #fff;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
.count {
  color: var(--mm-muted);
  font-size: 13px;
}
.grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.item {
  background: #fff;
  border: 1px solid var(--mm-line);
  border-radius: 12px;
  padding: 12px;
}
.item b {
  display: block;
  font-size: 14px;
}
.item span {
  color: var(--mm-brand);
  font-weight: 700;
}
.empty {
  display: block;
  margin-top: 24px;
  text-align: center;
  color: var(--mm-muted);
}`,
      js: `const PRODUCTS = [
  { name: "Ponni Rice 5 kg", price: 349 },
  { name: "Toned Milk 500 ml", price: 27 },
  { name: "Filter Coffee Powder 200 g", price: 185 },
  { name: "Buttermilk 200 ml", price: 15 },
  { name: "Idli Rice 1 kg", price: 72 },
  { name: "Milk Rusk 200 g", price: 45 },
  { name: "Coconut Oil 1 L", price: 210 },
  { name: "Curd 400 g", price: 40 }
];

const input = document.getElementById("q");
const list = document.getElementById("results");
const count = document.getElementById("count");
const empty = document.getElementById("empty");

function render(items) {
  list.textContent = "";
  for (const product of items) {
    const li = document.createElement("li");
    li.className = "item";
    const title = document.createElement("b");
    title.textContent = product.name;
    const price = document.createElement("span");
    price.textContent = "₹" + product.price;
    li.append(title, price);
    list.appendChild(li);
  }
  count.textContent = items.length + " products";
  empty.hidden = items.length > 0;
}

input.addEventListener("input", function () {
  const query = input.value;
  const matches = PRODUCTS.filter((product) => product.name.includes(query));
  render(matches);
});

render(PRODUCTS);`
    },
    fixes: [
      { file: "js", find: "const query = input.value;", replace: "const query = input.value.trim().toLowerCase();" },
      { file: "js", find: "product.name.includes(query)", replace: "product.name.toLowerCase().includes(query)" },
      { file: "css", find: ".empty {\n  display: block;\n", replace: ".empty {\n" }
    ],
    alts: [
      {
        note: "Keep display: block and add a [hidden] rule instead",
        fixes: [
          { file: "js", find: "const query = input.value;", replace: "const query = input.value.trim().toLowerCase();" },
          { file: "js", find: "product.name.includes(query)", replace: "product.name.toLowerCase().includes(query)" },
          { file: "css", find: ".empty {\n  display: block;", replace: ".empty[hidden] {\n  display: none;\n}\n.empty {\n  display: block;" }
        ]
      }
    ],
    hints: [
      "There are two separate bugs: one in script.js about matching, one in styles.css about hiding.",
      "includes() is case-sensitive. And the empty message has the hidden attribute, yet it still shows. Which CSS rule wins over hidden?",
      "Compare lowercase to lowercase and trim the spaces. Then stop .empty from forcing display: block, or add a rule for .empty[hidden]."
    ],
    explain: {
      what: "The search compared text exactly as typed, so Milk and milk were different. And .empty { display: block } beat the hidden attribute.",
      why: "includes() matches characters exactly, capitals and spaces included. The hidden attribute is only a weak browser default, so any CSS display rule overrides it.",
      tip: "Normalise both sides of a search: trim().toLowerCase(). And whenever you style an element that you hide with hidden, add [hidden] { display: none; }."
    },
    checks: `test("Typing milk finds all 3 milk products", async (t) => {
  t.type("#q", "milk");
  const n = t.$$("#results .item").length;
  t.expect(n === 3, "Searching milk shows " + n + " product" + (n === 1 ? "" : "s") + ". It should show 3: Toned Milk, Buttermilk and Milk Rusk.");
});
test("Capitals and spaces do not matter", async (t) => {
  t.type("#q", "  MILK ");
  const n = t.$$("#results .item").length;
  t.expect(n === 3, "Searching \\"  MILK \\" shows " + n + " products. It should show the same 3.");
});
test("An empty search shows everything", async (t) => {
  t.type("#q", "");
  const n = t.$$("#results .item").length;
  t.expect(n === 8, "An empty search shows " + n + " products. It should show all 8.");
  t.expect(!t.visible("#empty"), "No products found is showing while products are listed.");
});
test("No products found shows when nothing matches", async (t) => {
  t.type("#q", "pizza");
  t.expect(t.$$("#results .item").length === 0, "Searching pizza should show no products.");
  t.expect(t.visible("#empty"), "No products found should show when nothing matches.");
});`
  },

  {
    id: "m2",
    level: "moderate",
    site: "marina",
    title: "Add to cart works once",
    device: "phone",
    concepts: ["querySelector vs querySelectorAll", "Variable scope"],
    ticket: "Only the first product's Add button does anything. And the cart badge never goes past 1, however many times you add.",
    symptom: "Most Add buttons do nothing, and the cart count is stuck at 1.",
    accept: [
      "Every Add button adds to the cart",
      "The badge counts up: 1, 2, 3 and so on",
      "The button you tap says Added for a moment"
    ],
    files: {
      html: `<header class="bar">
  <strong class="brand">Marina Mart</strong>
  <span class="cart">Cart <span id="cart-count" class="badge">0</span></span>
</header>
<ul class="products">
  <li class="product">
    <b>Ponni Rice 5 kg</b>
    <span class="price">₹349</span>
    <button class="add" type="button">Add</button>
  </li>
  <li class="product">
    <b>Toned Milk 500 ml</b>
    <span class="price">₹27</span>
    <button class="add" type="button">Add</button>
  </li>
  <li class="product">
    <b>Filter Coffee Powder 200 g</b>
    <span class="price">₹185</span>
    <button class="add" type="button">Add</button>
  </li>
  <li class="product">
    <b>Curd 400 g</b>
    <span class="price">₹40</span>
    <button class="add" type="button">Add</button>
  </li>
</ul>`,
      css: `.bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: var(--mm-brand);
  color: #fff;
}
.badge {
  display: inline-grid;
  place-items: center;
  min-width: 24px;
  height: 24px;
  margin-left: 4px;
  padding: 0 6px;
  border-radius: 999px;
  background: #fff;
  color: var(--mm-brand);
  font-weight: 800;
}
.badge.bump {
  animation: bump 0.3s ease-out;
}
@keyframes bump {
  50% {
    transform: scale(1.35);
  }
}
.products {
  list-style: none;
  margin: 0;
  padding: 16px;
  display: grid;
  gap: 10px;
}
.product {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 4px 12px;
  background: #fff;
  border: 1px solid var(--mm-line);
  border-radius: 12px;
  padding: 12px 14px;
}
.price {
  grid-row: 2;
  color: var(--mm-muted);
}
.add {
  grid-row: 1 / 3;
  grid-column: 2;
  min-width: 84px;
  padding: 10px 14px;
  border: 1.5px solid var(--mm-green);
  border-radius: 999px;
  background: #fff;
  color: var(--mm-green);
  font-weight: 700;
}
.add.added {
  background: var(--mm-green);
  color: #fff;
}`,
      js: `const badge = document.getElementById("cart-count");
const addButton = document.querySelector(".add");

function addToCart(button) {
  let cartCount = 0;
  cartCount = cartCount + 1;
  badge.textContent = cartCount;
  badge.classList.remove("bump");
  void badge.offsetWidth;
  badge.classList.add("bump");
  button.textContent = "Added";
  button.classList.add("added");
  setTimeout(function () {
    button.textContent = "Add";
    button.classList.remove("added");
  }, 900);
}

addButton.addEventListener("click", function () {
  addToCart(addButton);
});`
    },
    fixes: [
      { file: "js", find: "function addToCart(button) {\n  let cartCount = 0;\n", replace: "let cartCount = 0;\n\nfunction addToCart(button) {\n" },
      { file: "js", find: "const addButton = document.querySelector(\".add\");", replace: "const addButtons = document.querySelectorAll(\".add\");" },
      { file: "js", find: "addButton.addEventListener(\"click\", function () {\n  addToCart(addButton);\n});", replace: "addButtons.forEach(function (button) {\n  button.addEventListener(\"click\", function () {\n    addToCart(button);\n  });\n});" }
    ],
    alts: [
      {
        note: "One listener on the list (event delegation)",
        fixes: [
          { file: "js", find: "function addToCart(button) {\n  let cartCount = 0;\n", replace: "let cartCount = 0;\n\nfunction addToCart(button) {\n" },
          { file: "js", find: "addButton.addEventListener(\"click\", function () {\n  addToCart(addButton);\n});", replace: "document.querySelector(\".products\").addEventListener(\"click\", function (event) {\n  const button = event.target.closest(\".add\");\n  if (button) {\n    addToCart(button);\n  }\n});" }
        ]
      }
    ],
    hints: [
      "Two bugs: one decides which buttons are listened to, the other decides what the count remembers.",
      "querySelector returns only the first match. And a variable created inside a function starts fresh every time the function runs.",
      "Use querySelectorAll and loop over the buttons, or put one listener on the list. Move let cartCount = 0 outside the function."
    ],
    explain: {
      what: "querySelector picked only the first Add button. And cartCount was created inside addToCart, so it reset to 0 on every click.",
      why: "querySelector stops at the first match. Variables declared inside a function live only for that one call. To remember a value between clicks, it must live outside the function.",
      tip: "For many similar buttons, one listener on their parent (event delegation) is simpler and also works for items added later."
    },
    checks: `test("The third product's Add button works", async (t) => {
  t.click(t.$$(".add")[2]);
  t.expect(t.text("#cart-count") === "1", "After tapping Add on Filter Coffee, the cart shows " + t.text("#cart-count") + ". It should show 1.");
  t.expect(t.$$(".add")[2].textContent === "Added", "The Filter Coffee button should say Added.");
});
test("The badge keeps counting", async (t) => {
  t.click(t.$$(".add")[0]);
  t.expect(t.text("#cart-count") === "2", "After two adds, the cart shows " + t.text("#cart-count") + ". It should show 2.");
  t.click(t.$$(".add")[3]);
  t.expect(t.text("#cart-count") === "3", "After three adds, the cart shows " + t.text("#cart-count") + ". It should show 3.");
});
test("The same product can be added twice", async (t) => {
  t.click(t.$$(".add")[2]);
  t.expect(t.text("#cart-count") === "4", "Adding Filter Coffee again should make the cart 4. It shows " + t.text("#cart-count") + ".");
});`
  },

  {
    id: "m3",
    level: "moderate",
    site: "marina",
    title: "The bill that says NaN",
    device: "phone",
    concepts: ["Numbers vs strings", "Comparison operators"],
    ticket: "The cart page shows NaN instead of money. Also, we promise free delivery from ₹500, but an order of exactly ₹500 was charged ₹40 delivery.",
    symptom: "Items, Total and the delivery note all show NaN. Orders of exactly ₹500 pay for delivery.",
    accept: [
      "The cart starts at ₹500.00 with free delivery",
      "Changing a quantity updates the line, the items total, delivery and the total",
      "Under ₹500, delivery is ₹40.00 and the note says how much more to add"
    ],
    files: {
      html: `<section class="cart-page">
  <h2>Your cart</h2>
  <ul class="cart">
    <li class="line" data-price="345.00">
      <span class="name">Ponni Rice 5 kg</span>
      <input class="qty" type="number" min="1" max="20" value="1" aria-label="Quantity">
      <span class="amount"></span>
    </li>
    <li class="line" data-price="27.50">
      <span class="name">Toned Milk 500 ml</span>
      <input class="qty" type="number" min="1" max="20" value="2" aria-label="Quantity">
      <span class="amount"></span>
    </li>
    <li class="line" data-price="100.00">
      <span class="name">Filter Coffee Powder 100 g</span>
      <input class="qty" type="number" min="1" max="20" value="1" aria-label="Quantity">
      <span class="amount"></span>
    </li>
  </ul>
  <dl class="summary">
    <div><dt>Items</dt><dd id="subtotal"></dd></div>
    <div><dt>Delivery</dt><dd id="delivery"></dd></div>
    <div class="total"><dt>Total</dt><dd id="total"></dd></div>
  </dl>
  <p id="free-note" class="note"></p>
</section>`,
      css: `.cart-page {
  padding: 20px 16px;
}
.cart {
  list-style: none;
  margin: 0 0 16px;
  padding: 0;
  display: grid;
  gap: 8px;
}
.line {
  display: grid;
  grid-template-columns: 1fr 64px 84px;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid var(--mm-line);
  border-radius: 12px;
  padding: 10px 12px;
}
.name {
  font-size: 14px;
}
.qty {
  width: 100%;
  padding: 6px;
  border: 1px solid var(--mm-line);
  border-radius: 8px;
  text-align: center;
}
.amount {
  text-align: right;
  font-weight: 700;
}
.summary {
  margin: 0;
  background: #fff;
  border: 1px solid var(--mm-line);
  border-radius: 12px;
  padding: 6px 14px;
}
.summary div {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}
.summary dd {
  margin: 0;
}
.summary .total {
  border-top: 1px solid var(--mm-line);
  font-weight: 800;
  font-size: 18px;
}
.note {
  color: var(--mm-green);
  font-size: 14px;
}`,
      js: `const DELIVERY_FEE = 40;
const FREE_DELIVERY_FROM = 500;

function formatRupees(value) {
  return "₹" + Number(value).toFixed(2);
}

function update() {
  let subtotal = 0;
  for (const line of document.querySelectorAll(".line")) {
    const price = line.dataset.price;
    const qty = line.querySelector(".qty").value;
    const amount = (price * qty).toFixed(2);
    line.querySelector(".amount").textContent = formatRupees(amount);
    subtotal += amount;
  }
  const isFree = subtotal > FREE_DELIVERY_FROM;
  const delivery = isFree ? 0 : DELIVERY_FEE;
  document.getElementById("subtotal").textContent = formatRupees(subtotal);
  document.getElementById("delivery").textContent = isFree ? "Free" : formatRupees(delivery);
  document.getElementById("total").textContent = formatRupees(subtotal + delivery);
  document.getElementById("free-note").textContent = isFree
    ? "You get free delivery."
    : "Add " + formatRupees(FREE_DELIVERY_FROM - subtotal) + " more for free delivery.";
}

document.querySelectorAll(".qty").forEach(function (input) {
  input.addEventListener("input", update);
});

update();`
    },
    fixes: [
      { file: "js", find: "const amount = (price * qty).toFixed(2);", replace: "const amount = price * qty;" },
      { file: "js", find: "subtotal > FREE_DELIVERY_FROM", replace: "subtotal >= FREE_DELIVERY_FROM" }
    ],
    alts: [
      {
        note: "Keep toFixed for display and add numbers with Number()",
        fixes: [
          { file: "js", find: "subtotal += amount;", replace: "subtotal += Number(amount);" },
          { file: "js", find: "subtotal > FREE_DELIVERY_FROM", replace: "!(subtotal < FREE_DELIVERY_FROM)" }
        ]
      }
    ],
    hints: [
      "NaN means a maths step got something that is not a number. Follow subtotal through the loop.",
      "toFixed() returns text, not a number. What does 0 + \"345.00\" give in JavaScript? And look at the free delivery comparison.",
      "Keep amount as a number and only format it when showing it. From ₹500 means 500 itself counts, so use >=."
    ],
    explain: {
      what: "toFixed(2) turned each amount into text, so subtotal += amount glued strings together (\"0345.0055.00...\") instead of adding. And > 500 left out exactly 500.",
      why: "In JavaScript, + with a string joins text. Number() of that joined text is NaN, and NaN spreads into every sum after it. Boundaries matter: from 500 means 500 and above, which is >=.",
      tip: "Keep money as numbers until the moment you display it. Format at the edge, never in the middle of a calculation."
    },
    checks: `test("The cart starts at ₹500.00", async (t) => {
  t.expect(t.text("#subtotal") === "₹500.00", "Items should be ₹500.00. It shows " + t.text("#subtotal") + ".");
});
test("Exactly ₹500 gets free delivery", async (t) => {
  t.expect(t.text("#delivery") === "Free", "Delivery should be Free at exactly ₹500. It shows " + t.text("#delivery") + ".");
  t.expect(t.text("#total") === "₹500.00", "Total should be ₹500.00. It shows " + t.text("#total") + ".");
});
test("One less milk updates everything", async (t) => {
  t.type(t.$$(".qty")[1], "1");
  t.expect(t.text(t.$$(".amount")[1]) === "₹27.50", "The milk line should show ₹27.50.");
  t.expect(t.text("#subtotal") === "₹472.50", "Items should be ₹472.50. It shows " + t.text("#subtotal") + ".");
  t.expect(t.text("#delivery") === "₹40.00", "Delivery should be ₹40.00 under ₹500.");
  t.expect(t.text("#total") === "₹512.50", "Total should be ₹512.50. It shows " + t.text("#total") + ".");
  t.expect(t.text("#free-note").includes("₹27.50"), "The note should say to add ₹27.50 more.");
});
test("Three milks is free delivery again", async (t) => {
  t.type(t.$$(".qty")[1], "3");
  t.expect(t.text("#subtotal") === "₹527.50" && t.text("#delivery") === "Free" && t.text("#total") === "₹527.50", "With 3 milks, expect ₹527.50, Free delivery and a ₹527.50 total.");
});`
  },

  {
    id: "m4",
    level: "moderate",
    site: "marina",
    title: "The header that wanders off",
    device: "phone",
    concepts: ["position: sticky", "Scroll offsets"],
    ticket: "The green header with the category links must stay at the top while you scroll. It scrolls away. Our designer also says: once it stays, tapping a category must not hide that section's title under the header.",
    symptom: "The header scrolls away. When it does stay, category jumps tuck the title under it.",
    accept: [
      "The header stays at the top of the screen while scrolling",
      "Tapping Vegetables or Dairy shows that title just below the header"
    ],
    files: {
      html: `<div class="page">
  <header class="topbar">
    <strong class="logo">Marina Mart</strong>
    <nav class="cats" aria-label="Categories">
      <a href="#fruits">Fruits</a>
      <a href="#veg">Vegetables</a>
      <a href="#dairy">Dairy</a>
    </nav>
  </header>
  <main>
    <section id="fruits" class="aisle">
      <h2>Fruits</h2>
      <ul class="shelf">
        <li>Banana, 1 dozen</li>
        <li>Guava, 500 g</li>
        <li>Pomegranate, 2 pcs</li>
        <li>Papaya, 1 pc</li>
        <li>Sapota, 500 g</li>
        <li>Mango, 1 kg</li>
      </ul>
    </section>
    <section id="veg" class="aisle">
      <h2>Vegetables</h2>
      <ul class="shelf">
        <li>Drumstick, 250 g</li>
        <li>Brinjal, 500 g</li>
        <li>Ladies finger, 250 g</li>
        <li>Tomato, 1 kg</li>
        <li>Small onion, 500 g</li>
        <li>Curry leaves, 1 bunch</li>
      </ul>
    </section>
    <section id="dairy" class="aisle">
      <h2>Dairy</h2>
      <ul class="shelf">
        <li>Toned Milk, 500 ml</li>
        <li>Curd, 400 g</li>
        <li>Paneer, 200 g</li>
        <li>Ghee, 200 ml</li>
        <li>Butter, 100 g</li>
        <li>Buttermilk, 200 ml</li>
      </ul>
    </section>
  </main>
  <footer class="foot">Marina Mart, open 7 AM to 11 PM</footer>
</div>`,
      css: `.page {
  overflow-x: hidden;
}
.topbar {
  position: sticky;
  top: 0;
  z-index: 5;
  background: var(--mm-green);
  color: #fff;
  padding: 12px 16px 0;
}
.logo {
  display: block;
  font-size: 18px;
}
.cats {
  display: flex;
  gap: 4px;
  margin-top: 8px;
}
.cats a {
  color: #fff;
  text-decoration: none;
  padding: 10px 12px;
  border-bottom: 3px solid transparent;
}
.cats a:hover {
  border-bottom-color: #fff;
}
.aisle {
  padding: 16px;
  min-height: 560px;
}
.aisle h2 {
  margin: 0 0 12px;
  font-size: 20px;
}
.shelf {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}
.shelf li {
  background: #fff;
  border: 1px solid var(--mm-line);
  border-radius: 10px;
  padding: 14px;
}
.foot {
  padding: 40px 16px 300px;
  color: var(--mm-muted);
}`,
      js: `document.querySelectorAll(".cats a").forEach(function (link) {
  link.addEventListener("click", function (event) {
    event.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});`
    },
    fixes: [
      { file: "css", find: ".page {\n  overflow-x: hidden;\n}\n", replace: "" },
      { file: "css", find: ".aisle {\n  padding: 16px;\n", replace: ".aisle {\n  scroll-margin-top: 96px;\n  padding: 16px;\n" }
    ],
    alts: [
      {
        note: "overflow-x: clip and scroll-padding-top on html",
        fixes: [
          { file: "css", find: "overflow-x: hidden;", replace: "overflow-x: clip;" },
          { file: "css", find: ".topbar {", replace: "html {\n  scroll-padding-top: 90px;\n}\n.topbar {" }
        ]
      }
    ],
    hints: [
      "position: sticky is correct on the header. Something around the header is stopping it from working.",
      "sticky only works inside the nearest ancestor that scrolls. overflow-x: hidden quietly turns .page into a scroll box. For the jump, CSS has a property that leaves a gap above a scroll target.",
      "Remove overflow-x: hidden from .page (or use overflow-x: clip). Then add scroll-margin-top to .aisle, about the header's height."
    ],
    explain: {
      what: ".page had overflow-x: hidden, which made it the header's scroll container, so sticky never kicked in. And the sections had no offset for the sticky header.",
      why: "Any overflow value other than visible or clip makes an element a scroll container, and sticky elements stick inside their nearest scroll container. scrollIntoView puts the target at the very top, under the header, unless scroll-margin-top leaves room.",
      tip: "When sticky does not stick, walk up the parents in DevTools and look for overflow. Use scroll-margin-top or scroll-padding-top whenever a fixed or sticky header exists."
    },
    checks: `function jump(t, id) {
  window.scrollTo(0, 0);
  t.click(".cats a[href=\\"#" + id + "\\"]");
}
test("The header stays at the top while scrolling", async (t) => {
  window.scrollTo(0, 900);
  await t.wait(80);
  const top = t.rect(".topbar").top;
  t.expect(Math.abs(top) <= 1, "After scrolling down, the header is " + Math.round(top) + "px from the top. It should stay at 0.");
});
test("Tapping Dairy shows its title just below the header", async (t) => {
  jump(t, "dairy");
  await t.wait(80);
  await t.settle();
  const bar = t.rect(".topbar").bottom;
  const h = t.rect("#dairy h2").top;
  t.expect(h >= bar - 1, "The Dairy title is hidden under the header.");
  t.expect(h <= bar + 64, "The Dairy title is not just below the header. Is the header still on screen?");
});
test("Tapping Vegetables works too", async (t) => {
  jump(t, "veg");
  await t.wait(80);
  await t.settle();
  const bar = t.rect(".topbar").bottom;
  const h = t.rect("#veg h2").top;
  t.expect(h >= bar - 1 && h <= bar + 64, "The Vegetables title is hidden or too far from the header.");
});`
  },

  {
    id: "m5",
    level: "moderate",
    site: "marina",
    title: "Checkout says no to good numbers",
    device: "phone",
    concepts: ["Regular expressions", "Form error states"],
    ticket: "Customers with correct mobile numbers get Enter a valid 10-digit mobile number. Some wrong PIN codes, like 6000041, are accepted. And once a red error shows, it stays even after the customer fixes the field.",
    symptom: "Valid mobile numbers fail, 7-digit PIN codes pass, and errors never clear.",
    accept: [
      "A mobile number is exactly 10 digits and starts with 6, 7, 8 or 9",
      "A PIN code is exactly 6 digits",
      "Fixing a field clears its error and its red border",
      "With all fields right, Place order shows Order placed"
    ],
    files: {
      html: `<section class="checkout">
  <h2>Delivery details</h2>
  <div id="form">
    <label class="field">
      <span>Full name</span>
      <input name="fullname" autocomplete="name">
      <small id="fullname-error" class="error" aria-live="polite"></small>
    </label>
    <label class="field">
      <span>Mobile number</span>
      <input name="phone" inputmode="numeric" autocomplete="tel">
      <small id="phone-error" class="error" aria-live="polite"></small>
    </label>
    <label class="field">
      <span>PIN code</span>
      <input name="pin" inputmode="numeric" autocomplete="postal-code">
      <small id="pin-error" class="error" aria-live="polite"></small>
    </label>
    <button id="place" class="place" type="button">Place order</button>
  </div>
  <div id="done" class="done" hidden>
    <h3>Order placed</h3>
    <p>We will deliver within 30 minutes.</p>
  </div>
</section>`,
      css: `.checkout {
  padding: 20px 16px;
}
.field {
  display: block;
  margin-bottom: 14px;
}
.field span {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 600;
}
.field input {
  width: 100%;
  padding: 12px;
  border: 1.5px solid var(--mm-line);
  border-radius: 10px;
  background: #fff;
}
.field input[aria-invalid="true"] {
  border-color: var(--mm-red);
}
.error {
  display: block;
  min-height: 18px;
  margin-top: 4px;
  color: var(--mm-red);
  font-size: 13px;
}
.place {
  width: 100%;
  padding: 14px;
  border: 0;
  border-radius: 999px;
  background: var(--mm-brand);
  color: #fff;
  font-weight: 700;
}
.done {
  padding: 24px;
  border-radius: 14px;
  background: #ecfdf5;
  color: var(--mm-green);
  text-align: center;
}`,
      js: `const form = document.getElementById("form");
const done = document.getElementById("done");

const RULES = {
  fullname: {
    test: (value) => value.length >= 2,
    message: "Please enter your name."
  },
  phone: {
    test: (value) => /^[6-9]\\d{10}$/.test(value),
    message: "Enter a valid 10-digit mobile number."
  },
  pin: {
    test: (value) => /\\d{6}/.test(value),
    message: "Enter a valid 6-digit PIN code."
  }
};

function checkField(field) {
  const input = form.querySelector("[name=\\"" + field + "\\"]");
  const error = document.getElementById(field + "-error");
  const ok = RULES[field].test(input.value.trim());
  if (!ok) {
    error.textContent = RULES[field].message;
    input.setAttribute("aria-invalid", "true");
  }
  return ok;
}

document.getElementById("place").addEventListener("click", function () {
  const results = Object.keys(RULES).map(checkField);
  if (results.every(Boolean)) {
    form.hidden = true;
    done.hidden = false;
  }
});`
    },
    fixes: [
      { file: "js", find: "/^[6-9]\\d{10}$/", replace: "/^[6-9]\\d{9}$/" },
      { file: "js", find: "/\\d{6}/.test", replace: "/^\\d{6}$/.test" },
      { file: "js", find: "    input.setAttribute(\"aria-invalid\", \"true\");\n  }\n", replace: "    input.setAttribute(\"aria-invalid\", \"true\");\n  } else {\n    error.textContent = \"\";\n    input.removeAttribute(\"aria-invalid\");\n  }\n" }
    ],
    hints: [
      "Three bugs: two in the RULES patterns, one in checkField.",
      "\\d{10} after [6-9] asks for 11 digits in total. A pattern without ^ and $ is happy to find 6 digits anywhere inside a longer number. And checkField only ever sets errors.",
      "Use ^[6-9]\\d{9}$ and ^\\d{6}$. In checkField, add an else that empties the error and removes aria-invalid."
    ],
    explain: {
      what: "The phone pattern asked for 11 digits, the PIN pattern had no ^ and $ anchors, and checkField never cleared an error once it was set.",
      why: "[6-9] already matches the first digit, so only 9 more are needed. Without ^ and $, a pattern can match part of the text, so 6000041 contains 6 digits and passes. Error states need code for both directions: showing and clearing.",
      tip: "Test patterns with edge cases: one digit short, one digit long, letters, and spaces. Anchor every validation pattern with ^ and $."
    },
    checks: `function fill(t, phone, pin) {
  t.type("[name=\\"fullname\\"]", "Priya");
  t.type("[name=\\"phone\\"]", phone);
  t.type("[name=\\"pin\\"]", pin);
  t.click("#place");
}
test("A 7-digit PIN code is rejected", async (t) => {
  fill(t, "9876543210", "6000041");
  t.expect(t.text("#pin-error") !== "", "6000041 was accepted as a PIN code. It has 7 digits.");
  t.expect(!t.visible("#done"), "The order was placed with a 7-digit PIN code.");
});
test("Numbers starting with 5 or with 9 digits are rejected", async (t) => {
  fill(t, "5876543210", "600004");
  t.expect(t.text("#phone-error") !== "", "5876543210 was accepted. Indian mobile numbers start with 6, 7, 8 or 9.");
  fill(t, "987654321", "600004");
  t.expect(t.text("#phone-error") !== "", "A 9-digit number was accepted.");
  t.expect(!t.visible("#done"), "The order was placed with a wrong number.");
});
test("Fixing the fields clears the errors and places the order", async (t) => {
  fill(t, "9876543210", "600004");
  t.expect(t.text("#phone-error") === "", "9876543210 is a valid number, but the phone error still shows: " + t.text("#phone-error"));
  t.expect(t.text("#pin-error") === "", "The PIN code error did not clear.");
  t.expect(!t.$("[aria-invalid=\\"true\\"]"), "A field still has the red error border.");
  t.expect(t.visible("#done"), "Order placed did not show.");
});`
  }
];
