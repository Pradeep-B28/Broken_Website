// What it does: Read-only code viewer with tappable line buttons, syntax highlighting, and fix typing animation.
// What it uses: js/ui/highlight.js, DOM elements.
// What uses it: js/screens/spot.js, js/screens/room.js.

import { highlightLine } from "./highlight.js";

const FILE_ORDER = [
  { key: "html", name: "index.html" },
  { key: "css", name: "styles.css" },
  { key: "js", name: "script.js" }
];

export function createCodeView({ files = {}, onLineTap = null }) {
  const root = document.createElement("div");
  root.className = "code-panel";

  const tabsBar = document.createElement("div");
  tabsBar.className = "code-tabs";

  const viewContainer = document.createElement("div");
  viewContainer.className = "code-view-container";

  const linesWrapper = document.createElement("div");
  linesWrapper.className = "code-lines-wrapper";
  viewContainer.appendChild(linesWrapper);

  root.appendChild(tabsBar);
  root.appendChild(viewContainer);

  let currentFile = "html";
  const lineButtonsByFile = { html: [], css: [], js: [] };
  const currentFiles = { ...files };

  function renderTabs() {
    tabsBar.replaceChildren();
    FILE_ORDER.forEach(({ key, name }) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `code-tab-btn ${key === currentFile ? "is-active" : ""}`;
      btn.textContent = name;
      btn.addEventListener("click", () => {
        switchFile(key);
      });
      tabsBar.appendChild(btn);
    });
  }

  function renderLines() {
    linesWrapper.replaceChildren();
    lineButtonsByFile[currentFile] = [];

    const text = currentFiles[currentFile] || "";
    const lines = text.split("\n");

    lines.forEach((lineText, index) => {
      const lineNum = index + 1;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "code-line";
      btn.dataset.line = String(lineNum);
      btn.dataset.file = currentFile;

      const gutter = document.createElement("span");
      gutter.className = "code-gutter-num";
      gutter.textContent = String(lineNum);

      const content = document.createElement("span");
      content.className = "code-line-content";
      content.appendChild(highlightLine(lineText, currentFile));

      btn.appendChild(gutter);
      btn.appendChild(content);

      if (typeof onLineTap === "function") {
        btn.addEventListener("click", () => {
          onLineTap(currentFile, lineNum, btn);
        });
      }

      linesWrapper.appendChild(btn);
      lineButtonsByFile[currentFile].push(btn);
    });
  }

  function switchFile(key) {
    if (currentFile === key) return;
    currentFile = key;
    renderTabs();
    renderLines();
  }

  function markLineRight(file, line) {
    if (currentFile !== file) {
      switchFile(file);
    }
    const btn = lineButtonsByFile[file]?.[line - 1];
    if (btn) {
      btn.classList.add("is-right");
      btn.classList.remove("is-wrong");
    }
  }

  function markLineWrong(file, line) {
    if (currentFile !== file) {
      switchFile(file);
    }
    const btn = lineButtonsByFile[file]?.[line - 1];
    if (btn) {
      btn.classList.add("is-wrong");
      setTimeout(() => {
        btn.classList.remove("is-wrong");
      }, 800);
    }
  }

  async function animateLineReplacement(file, oldLineNum, newText) {
    if (currentFile !== file) {
      switchFile(file);
    }
    const btn = lineButtonsByFile[file]?.[oldLineNum - 1];
    if (!btn) return;

    btn.classList.add("is-struck");
    await new Promise((r) => setTimeout(r, 250));

    const content = btn.querySelector(".code-line-content");
    if (!content) return;

    content.replaceChildren();
    btn.classList.remove("is-struck");
    btn.classList.add("is-right");

    // Type in new characters
    for (let i = 0; i < newText.length; i++) {
      content.textContent = newText.slice(0, i + 1);
      await new Promise((r) => setTimeout(r, 20));
    }
    // Re-highlight once done
    content.replaceChildren(highlightLine(newText, file));
  }

  renderTabs();
  renderLines();

  return {
    el: root,
    switchFile,
    getCurrentFile: () => currentFile,
    markLineRight,
    markLineWrong,
    animateLineReplacement,
    updateFiles: (newFiles) => {
      Object.assign(currentFiles, newFiles);
      renderLines();
    }
  };
}
