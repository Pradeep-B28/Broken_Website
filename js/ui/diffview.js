// What it does: Displays line-by-line diff of broken versus fixed files with a button to copy the fix into the editor.
// What it uses: js/engine/diff.js, DOM methods.
// What uses it: js/screens/edit.js.

import { diffLines, diffStats } from "../engine/diff.js";

const FILE_LABELS = {
  html: "index.html",
  css: "styles.css",
  js: "script.js"
};

export function createDiffView({ brokenFiles = {}, fixedFiles = {}, onCopyFix = null, onClose = null }) {
  const root = document.createElement("div");
  root.className = "diff-modal-backdrop";

  const modal = document.createElement("div");
  modal.className = "diff-modal";

  // Top header
  const header = document.createElement("div");
  header.className = "diff-header";

  const titleWrap = document.createElement("div");
  titleWrap.className = "diff-title-wrap";

  const title = document.createElement("h3");
  title.className = "diff-title";
  title.textContent = "The Solution";

  const subtitle = document.createElement("span");
  subtitle.className = "diff-subtitle";
  subtitle.textContent = "Compare the broken files with the working solution.";

  titleWrap.appendChild(title);
  titleWrap.appendChild(subtitle);

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "diff-close-btn";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `;
  closeBtn.addEventListener("click", () => {
    if (typeof onClose === "function") onClose();
  });

  header.appendChild(titleWrap);
  header.appendChild(closeBtn);

  // Body with file diffs
  const body = document.createElement("div");
  body.className = "diff-body";

  const fileKeys = ["html", "css", "js"].filter((k) => brokenFiles[k] !== undefined || fixedFiles[k] !== undefined);
  let totalChanges = 0;

  fileKeys.forEach((key) => {
    const oldCode = brokenFiles[key] || "";
    const newCode = fixedFiles[key] || "";
    const ops = diffLines(oldCode, newCode);
    const stats = diffStats(ops);
    totalChanges += stats.changed;

    const hasDiff = stats.del > 0 || stats.add > 0;
    if (!hasDiff) return;

    const fileCard = document.createElement("div");
    fileCard.className = "diff-file-card";

    const fileHead = document.createElement("div");
    fileHead.className = "diff-file-head";

    const fileName = document.createElement("span");
    fileName.className = "diff-file-name";
    fileName.textContent = FILE_LABELS[key] || key;

    const fileStats = document.createElement("span");
    fileStats.className = "diff-file-stats";
    fileStats.textContent = `${stats.changed} line${stats.changed === 1 ? "" : "s"} changed (-${stats.del} +${stats.add})`;

    fileHead.appendChild(fileName);
    fileHead.appendChild(fileStats);
    fileCard.appendChild(fileHead);

    const diffLinesContainer = document.createElement("div");
    diffLinesContainer.className = "diff-lines-container";

    ops.forEach((op) => {
      const lineRow = document.createElement("div");
      lineRow.className = `diff-line diff-line--${op.type}`;

      const gutter = document.createElement("span");
      gutter.className = "diff-line-gutter";
      if (op.type === "del") {
        gutter.textContent = `-${op.a || ""}`;
      } else if (op.type === "add") {
        gutter.textContent = `+${op.b || ""}`;
      } else {
        gutter.textContent = `${op.a || op.b || ""}`;
      }

      const text = document.createElement("span");
      text.className = "diff-line-text";
      text.textContent = op.text;

      lineRow.appendChild(gutter);
      lineRow.appendChild(text);
      diffLinesContainer.appendChild(lineRow);
    });

    fileCard.appendChild(diffLinesContainer);
    body.appendChild(fileCard);
  });

  // Footer Actions
  const footer = document.createElement("div");
  footer.className = "diff-footer";

  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.className = "btn btn-primary diff-copy-btn";
  copyBtn.textContent = "Copy the fix into the editor";
  copyBtn.addEventListener("click", () => {
    if (typeof onCopyFix === "function") onCopyFix();
  });

  const backBtn = document.createElement("button");
  backBtn.type = "button";
  backBtn.className = "btn btn-secondary";
  backBtn.textContent = "Back to editor";
  backBtn.addEventListener("click", () => {
    if (typeof onClose === "function") onClose();
  });

  footer.appendChild(copyBtn);
  footer.appendChild(backBtn);

  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  root.appendChild(modal);

  return {
    el: root
  };
}