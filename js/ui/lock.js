// What it does: Museum keypad styled lock component verifying codes, displaying decoys and error feedback.
// What it uses: copy.js, js/engine/lock.js, js/sound.js.
// What uses it: js/screens/room.js.

import { t } from "../copy.js";
import { checkCode } from "../engine/lock.js";
import { playClick, playWrong } from "../sound.js";

export function createLock({ room, onUnlock, onTry }) {
  const root = document.createElement("div");
  root.className = "room-lock";

  const label = document.createElement("div");
  label.className = "lock-format-label";
  const formatText = room.format === "digits" ? t("lock.digits") : t("lock.letters");
  label.textContent = `Keypad: ${formatText}`;
  root.appendChild(label);

  const form = document.createElement("form");
  form.className = "lock-form";
  form.setAttribute("onsubmit", "return false;");

  const inputGroup = document.createElement("div");
  inputGroup.className = "lock-input-group";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "lock-input";
  input.placeholder = room.format === "digits" ? "0000" : "CODE";
  input.spellcheck = false;
  input.autocapitalize = "characters";
  input.autocomplete = "off";
  input.autocorrect = "off";

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.className = "btn btn-primary lock-submit-btn";
  submitBtn.textContent = t("lock.unlock");

  inputGroup.appendChild(input);
  inputGroup.appendChild(submitBtn);
  form.appendChild(inputGroup);
  root.appendChild(form);

  // Feedback area (decoy note or wrong message)
  const feedback = document.createElement("div");
  feedback.className = "lock-feedback";
  root.appendChild(feedback);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSubmit();
  });

  function handleSubmit() {
    const rawVal = input.value;
    const { result, reply } = checkCode(room, rawVal);

    playClick();

    if (result === "empty") {
      return;
    }

    if (typeof onTry === "function") {
      onTry(result, rawVal);
    }

    feedback.replaceChildren();

    if (result === "right") {
      feedback.className = "lock-feedback lock-feedback--right";
      input.disabled = true;
      submitBtn.disabled = true;
      if (typeof onUnlock === "function") {
        onUnlock();
      }
    } else if (result === "decoy") {
      playWrong();
      feedback.className = "lock-feedback lock-feedback--decoy";
      const tag = document.createElement("span");
      tag.className = "lock-decoy-tag";
      tag.textContent = t("lock.decoyTag");

      const text = document.createElement("span");
      text.className = "lock-decoy-text";
      text.textContent = reply;

      feedback.appendChild(tag);
      feedback.appendChild(text);
      shakeInput();
    } else if (result === "wrong") {
      playWrong();
      feedback.className = "lock-feedback lock-feedback--wrong";
      const text = document.createElement("span");
      text.className = "lock-wrong-text";
      text.textContent = t("lock.wrong");
      feedback.appendChild(text);
      shakeInput();
    }
  }

  function shakeInput() {
    input.classList.remove("is-shaking");
    void input.offsetWidth; // force reflow
    input.classList.add("is-shaking");
    setTimeout(() => input.classList.remove("is-shaking"), 500);
  }

  return {
    el: root,
    clear: () => {
      input.value = "";
      feedback.replaceChildren();
    },
    focus: () => input.focus(),
    setDisabled: (disabled) => {
      input.disabled = Boolean(disabled);
      submitBtn.disabled = Boolean(disabled);
    }
  };
}
