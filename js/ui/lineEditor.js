// What it does: Bottom sheet line editor modal allowing single-line editing for escape rooms.
// What it uses: DOM methods.
// What uses it: js/screens/room.js.

export function createLineEditor({
  fileName,
  lineNumber,
  initialText,
  onApply,
  onCancel
}) {
  const overlay = document.createElement("div");
  overlay.className = "line-editor-overlay";

  const sheet = document.createElement("div");
  sheet.className = "line-editor-sheet";
  sheet.setAttribute("role", "dialog");
  sheet.setAttribute("aria-modal", "true");
  sheet.setAttribute("aria-label", `${fileName}, line ${lineNumber}`);

  // Header
  const header = document.createElement("div");
  header.className = "line-editor-header";

  const title = document.createElement("div");
  title.className = "line-editor-title";
  title.textContent = `${fileName}, line ${lineNumber}`;

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "line-editor-close";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `;
  closeBtn.addEventListener("click", () => handleCancel());

  header.appendChild(title);
  header.appendChild(closeBtn);

  // Body with input
  const body = document.createElement("div");
  body.className = "line-editor-body";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "line-editor-input";
  input.value = initialText || "";
  input.spellcheck = false;
  input.autocapitalize = "off";
  input.autocomplete = "off";
  input.autocorrect = "off";

  body.appendChild(input);

  // Footer Actions
  const footer = document.createElement("div");
  footer.className = "line-editor-footer";

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "btn btn-secondary";
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", () => handleCancel());

  const applyBtn = document.createElement("button");
  applyBtn.type = "button";
  applyBtn.className = "btn btn-primary";
  applyBtn.textContent = "Apply";
  applyBtn.addEventListener("click", () => handleApply());

  footer.appendChild(cancelBtn);
  footer.appendChild(applyBtn);

  sheet.appendChild(header);
  sheet.appendChild(body);
  sheet.appendChild(footer);
  overlay.appendChild(sheet);

  function handleApply() {
    const val = input.value;
    if (typeof onApply === "function") {
      onApply(val);
    }
  }

  function handleCancel() {
    if (typeof onCancel === "function") {
      onCancel();
    }
  }

  // Keyboard navigation
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApply();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      handleCancel();
    }
  });

  setTimeout(() => {
    input.focus();
    input.select();
  }, 50);

  return {
    el: overlay,
    destroy: () => overlay.remove()
  };
}
