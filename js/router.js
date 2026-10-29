// What it does: Hash-based screen router managing view mounting, transitions, and URL state.
// What it uses: DOM root container.
// What uses it: js/main.js, all screen components, navigation links.

let currentScreen = null;
let currentRoot = null;
let currentPath = "";

const routes = [
  {
    pattern: /^#\/?puzzle\/(b[1-5])\/?$/,
    paramKeys: ["id"],
    loader: () => import("./screens/spot.js")
  },
  {
    pattern: /^#\/?puzzle\/([me][1-5])\/?$/,
    paramKeys: ["id"],
    loader: () => import("./screens/edit.js")
  }
];

export function registerRoute(pattern, paramKeys, loader) {
  routes.push({ pattern, paramKeys, loader });
}

export async function handleRoute() {
  const hash = window.location.hash || "#/";
  currentPath = hash;

  let matched = null;
  let params = {};

  for (const r of routes) {
    const match = hash.match(r.pattern);
    if (match) {
      matched = r;
      r.paramKeys.forEach((key, idx) => {
        params[key] = match[idx + 1];
      });
      break;
    }
  }

  if (currentScreen && typeof currentScreen.leave === "function") {
    try {
      currentScreen.leave();
    } catch (err) {
      console.error("Error leaving screen:", err);
    }
  }

  if (!matched) {
    // If route is not recognized or not implemented yet in Phase 2, provide helpful fallback
    if (currentRoot) {
      currentRoot.replaceChildren();
      const div = document.createElement("div");
      div.className = "card";
      div.style.cssText = "margin: 2rem auto; max-width: 600px; text-align: center;";
      const h2 = document.createElement("h2");
      h2.textContent = "The Broken Website";
      const p = document.createElement("p");
      p.style.cssText = "color: var(--muted); margin: 1rem 0;";
      p.textContent = "Choose a puzzle to play:";
      const btnRow = document.createElement("div");
      btnRow.style.cssText = "display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;";
      ["b1", "b2", "b3", "b4", "b5", "m1", "m2", "m3", "m4", "m5", "e1", "e2", "e3", "e4", "e5"].forEach((id) => {
        const a = document.createElement("a");
        a.href = `#/puzzle/${id}`;
        a.className = "btn btn-secondary";
        a.textContent = id.toUpperCase();
        btnRow.appendChild(a);
      });
      div.appendChild(h2);
      div.appendChild(p);
      div.appendChild(btnRow);
      currentRoot.appendChild(div);
    }
    currentScreen = null;
    return;
  }

  try {
    const module = await matched.loader();
    currentScreen = module;
    if (currentRoot) {
      currentRoot.replaceChildren();
      if (typeof module.mount === "function") {
        module.mount(currentRoot);
      }
      if (typeof module.enter === "function") {
        module.enter(params);
      }
    }
  } catch (err) {
    console.error("Failed to load screen for route:", hash, err);
  }
}

export function navigate(hash) {
  if (window.location.hash === hash) {
    handleRoute();
  } else {
    window.location.hash = hash;
  }
}

export function initRouter(root) {
  currentRoot = root;
  window.addEventListener("hashchange", handleRoute);
  handleRoute();
}

export function getCurrentPath() {
  return currentPath;
}
