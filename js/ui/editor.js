// What it does: Hand-built overlapping code editor with syntax highlighting, synchronized scrolling, and indentation.
// What it uses: js/ui/highlight.js, config.js, DOM elements.
// What uses it: js/screens/edit.js.

import { CONFIG } from "../../config.js";
import { highlightText } from "./highlight.js";

const FILE_DEFS = [
  { key: "html", label: "index.html", lang: "html" },
  { key: "css", label: "styles.css", lang: "css" },
  { key: "js", label: "script.js", lang: "javascript" }
];

export function createEditor({
  initialFiles = {},
  originalFiles = {},
  onChange = null,
  maxChars = CONFIG.limits.maxFileChars
}) {
  const root = document.createElement("div");
  root.className = "editor-panel code-panel";

  const files = {
    html: initialFiles.html ?? "",
    css: initialFiles.css ?? "",
    js: initialFiles.js ?? ""
  };

  const orig = {
    html: originalFiles.html ?? "",
    css: originalFiles.css ?? "",
    js: originalFiles.js ?? ""
  };

  let activeKey = "html";
  if (!files.html && files.css) activeKey = "css";
  if (!files.html && !files.css && files.js) activeKey = "js";

  // Top Bar with tabs and reset buttons
  const topBar = document.createElement("div");
  topBar.className = "code-tabs-bar";

  const tabsGroup = document.createElement("div");
  tabsGroup.className = "code-tabs";

  const tabElements = {};
  const dotElements = {};

  FILE_DEFS.forEach((def) => {
    if (files[def.key] === undefined && orig[def.key] === undefined) return;

    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = `code-tab ${def.key === activeKey ? "is-active" : ""}`;

    const label = document.createElement("span");
    label.textContent = def.label;
    tab.appendChild(label);

    const dot = document.createElement("span");
    dot.className = "code-tab-dot";
    dot.style.display = isDirty(def.key) ? "inline-block" : "none";
    tab.appendChild(dot);

    tab.addEventListener("click", () => {
      switchTab(def.key);
    });

    tabsGroup.appendChild(tab);
    tabElements[def.key] = tab;
    dotElements[def.key] = dot;
  });

  const actionsGroup = document.createElement("div");
  actionsGroup.className = "editor-actions-bar";

  const resetFileBtn = document.createElement("button");
  resetFileBtn.type = "button";
  resetFileBtn.className = "editor-action-btn";
  resetFileBtn.textContent = "Reset file";
  resetFileBtn.title = "Revert this file to original";
  resetFileBtn.addEventListener("click", () => {
    resetActiveFile();
  });

  const resetAllBtn = document.createElement("button");
  resetAllBtn.type = "button";
  resetAllBtn.className = "editor-action-btn";
  resetAllBtn.textContent = "Reset all";
  resetAllBtn.title = "Revert all files to original";
  resetAllBtn.addEventListener("click", () => {
    if (window.confirm("Revert all files to their original state?")) {
      resetAllFiles();
    }
  });

  actionsGroup.appendChild(resetFileBtn);
  actionsGroup.appendChild(resetAllBtn);

  topBar.appendChild(tabsGroup);
  topBar.appendChild(actionsGroup);
  root.appendChild(topBar);

  // Character limit banner
  const limitBanner = document.createElement("div");
  limitBanner.className = "editor-limit-banner";
  limitBanner.style.display = "none";
  limitBanner.textContent = `File exceeds maximum limit of ${maxChars.toLocaleString()} characters.`;
  root.appendChild(limitBanner);

  // Editor Workspace
  const editorWorkspace = document.createElement("div");
  editorWorkspace.className = "editor-body";

  const gutter = document.createElement("div");
  gutter.className = "editor-gutter";

  const canvas = document.createElement("div");
  canvas.className = "editor-canvas";

  const pre = document.createElement("pre");
  pre.className = "editor-pre";
  pre.setAttribute("aria-hidden", "true");

  const textarea = document.createElement("textarea");
  textarea.className = "editor-textarea";
  textarea.setAttribute("spellcheck", "false");
  textarea.setAttribute("autocapitalize", "off");
  textarea.setAttribute("autocomplete", "off");
  textarea.setAttribute("autocorrect", "off");

  canvas.appendChild(pre);
  canvas.appendChild(textarea);
  editorWorkspace.appendChild(gutter);
  editorWorkspace.appendChild(canvas);
  root.appendChild(editorWorkspace);

  // Sync scrolling
  textarea.addEventListener("scroll", () => {
    pre.scrollTop = textarea.scrollTop;
    pre.scrollLeft = textarea.scrollLeft;
    gutter.scrollTop = textarea.scrollTop;
  });

  // Indent & tab key handling
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      if (!e.shiftKey) {
        document.execCommand("insertText", false, "  ");
      } else {
        dedentCurrentLine();
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleEnterIndent();
    }
  });

  textarea.addEventListener("input", () => {
    let val = textarea.value;
    if (val.length > maxChars) {
      val = val.slice(0, maxChars);
      textarea.value = val;
      limitBanner.style.display = "block";
    } else {
      limitBanner.style.display = "none";
    }

    files[activeKey] = val;
    renderHighlight();
    updateGutter();
    updateDirtyDots();

    if (typeof onChange === "function") {
      onChange({ ...files });
    }
  });

  function isDirty(key) {
    return (files[key] ?? "") !== (orig[key] ?? "");
  }

  function updateDirtyDots() {
    FILE_DEFS.forEach((def) => {
      if (dotElements[def.key]) {
        dotElements[def.key].style.display = isDirty(def.key) ? "inline-block" : "none";
      }
    });
  }

  function dedentCurrentLine() {
    const start = textarea.selectionStart;
    const val = textarea.value;
    const lineStart = val.lastIndexOf("\n", start - 1) + 1;
    const lineSub = val.slice(lineStart, lineStart + 2);
    if (lineSub.startsWith("  ")) {
      textarea.setSelectionRange(lineStart, lineStart + 2);
      document.execCommand("delete");
      textarea.setSelectionRange(Math.max(lineStart, start - 2), Math.max(lineStart, start - 2));
    } else if (lineSub.startsWith(" ")) {
      textarea.setSelectionRange(lineStart, lineStart + 1);
      document.execCommand("delete");
      textarea.setSelectionRange(Math.max(lineStart, start - 1), Math.max(lineStart, start - 1));
    }
  }

  function handleEnterIndent() {
    const start = textarea.selectionStart;
    const val = textarea.value;
    const lineStart = val.lastIndexOf("\n", start - 1) + 1;
    const currentLine = val.slice(lineStart, start);
    const match = currentLine.match(/^[ ]+/);
    const indent = match ? match[0] : "";
    document.execCommand("insertText", false, "\n" + indent);
  }

  function switchTab(key) {
    activeKey = key;
    Object.keys(tabElements).forEach((k) => {
      tabElements[k].classList.toggle("is-active", k === key);
    });
    textarea.value = files[key] || "";
    renderHighlight();
    updateGutter();
  }

  function renderHighlight() {
    const code = files[activeKey] || "";
    const def = FILE_DEFS.find((d) => d.key === activeKey);
    const lang = def ? def.lang : "javascript";
    pre.replaceChildren();
    pre.appendChild(highlightText(code, lang));
  }

  function updateGutter() {
    const code = files[activeKey] || "";
    const count = Math.max(1, code.split("\n").length);
    gutter.replaceChildren();
    for (let i = 1; i <= count; i++) {
      const num = document.createElement("span");
      num.className = "gutter-num";
      num.textContent = String(i);
      gutter.appendChild(num);
    }
  }

  function resetActiveFile() {
    files[activeKey] = orig[activeKey] || "";
    textarea.value = files[activeKey];
    renderHighlight();
    updateGutter();
    updateDirtyDots();
    if (typeof onChange === "function") onChange({ ...files });
  }

  function resetAllFiles() {
    Object.keys(orig).forEach((k) => {
      files[k] = orig[k] || "";
    });
    textarea.value = files[activeKey] || "";
    renderHighlight();
    updateGutter();
    updateDirtyDots();
    if (typeof onChange === "function") onChange({ ...files });
  }

  // Initial load
  switchTab(activeKey);

  return {
    el: root,
    getFiles: () => ({ ...files }),
    setFiles: (newFiles) => {
      Object.assign(files, newFiles);
      textarea.value = files[activeKey] || "";
      renderHighlight();
      updateGutter();
      updateDirtyDots();
    },
    switchTab,
    resetActiveFile,
    resetAllFiles
  };
}