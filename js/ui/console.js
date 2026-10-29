// What it does: Collapsible console panel displaying preview console logs and errors with an error count badge.
// What it uses: DOM methods.
// What uses it: js/screens/edit.js, js/screens/room.js.

export function createConsole() {
  const root = document.createElement("div");
  root.className = "console-panel is-collapsed";

  let isCollapsed = true;
  let errorCount = 0;
  const entries = [];

  // Header / toggle bar
  const header = document.createElement("button");
  header.type = "button";
  header.className = "console-header";
  header.setAttribute("aria-expanded", "false");

  const headerLeft = document.createElement("div");
  headerLeft.className = "console-header-left";

  const chevron = document.createElement("span");
  chevron.className = "console-chevron";
  chevron.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `;

  const title = document.createElement("span");
  title.className = "console-title";
  title.textContent = "Console";

  headerLeft.appendChild(chevron);
  headerLeft.appendChild(title);

  const headerRight = document.createElement("div");
  headerRight.className = "console-header-right";

  const badge = document.createElement("span");
  badge.className = "console-badge";
  badge.textContent = "0 errors";
  badge.style.display = "none";

  const clearBtn = document.createElement("span");
  clearBtn.className = "console-clear-btn";
  clearBtn.title = "Clear console";
  clearBtn.innerHTML = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
    </svg>
  `;
  clearBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    clear();
  });

  headerRight.appendChild(badge);
  headerRight.appendChild(clearBtn);

  header.appendChild(headerLeft);
  header.appendChild(headerRight);

  // Content body
  const body = document.createElement("div");
  body.className = "console-body";

  const list = document.createElement("div");
  list.className = "console-list";
  body.appendChild(list);

  header.addEventListener("click", () => {
    toggle();
  });

  root.appendChild(header);
  root.appendChild(body);

  function toggle() {
    isCollapsed = !isCollapsed;
    root.classList.toggle("is-collapsed", isCollapsed);
    header.setAttribute("aria-expanded", String(!isCollapsed));
  }

  function setCollapsed(collapsed) {
    isCollapsed = Boolean(collapsed);
    root.classList.toggle("is-collapsed", isCollapsed);
    header.setAttribute("aria-expanded", String(!isCollapsed));
  }

  function addLog(msg) {
    const text = typeof msg === "string" ? msg : (msg && msg.text ? msg.text : JSON.stringify(msg));
    entries.push({ type: "log", text });

    const row = document.createElement("div");
    row.className = "console-row console-row--log";

    const icon = document.createElement("span");
    icon.className = "console-row-icon";
    icon.textContent = "›";

    const content = document.createElement("span");
    content.className = "console-row-text";
    content.textContent = text;

    row.appendChild(icon);
    row.appendChild(content);
    list.appendChild(row);

    // Auto-scroll to bottom
    body.scrollTop = body.scrollHeight;
  }

  function addError(err) {
    const text = typeof err === "string" ? err : (err?.message || JSON.stringify(err));
    errorCount++;
    entries.push({ type: "error", text });

    updateBadge();

    const row = document.createElement("div");
    row.className = "console-row console-row--error";

    const icon = document.createElement("span");
    icon.className = "console-row-icon";
    icon.textContent = "✕";

    const content = document.createElement("span");
    content.className = "console-row-text";
    content.textContent = text;

    row.appendChild(icon);
    row.appendChild(content);
    list.appendChild(row);

    // Open console automatically on first error
    if (isCollapsed) {
      setCollapsed(false);
    }
    body.scrollTop = body.scrollHeight;
  }

  function clear() {
    entries.length = 0;
    errorCount = 0;
    list.replaceChildren();
    updateBadge();
  }

  function updateBadge() {
    if (errorCount > 0) {
      badge.textContent = `${errorCount} error${errorCount === 1 ? "" : "s"}`;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  }

  function getErrorCount() {
    return errorCount;
  }

  return {
    el: root,
    addLog,
    addError,
    clear,
    toggle,
    setCollapsed,
    getErrorCount
  };
}