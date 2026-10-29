// What it does: Lightweight syntax tokenizer for HTML, CSS, and JS building text nodes and spans safely without innerHTML.
// What it uses: DOM DocumentFragment and text nodes.
// What uses it: js/ui/codeview.js, js/ui/editor.js, js/ui/diffview.js.

const JS_KEYWORDS = new Set([
  "async", "await", "break", "case", "catch", "class", "const", "continue",
  "debugger", "default", "delete", "do", "else", "export", "extends",
  "false", "finally", "for", "function", "if", "import", "in", "instanceof",
  "let", "new", "null", "return", "super", "switch", "this", "throw",
  "true", "try", "typeof", "undefined", "var", "void", "while", "with", "yield",
  "from", "as"
]);

function createTokenSpan(text, className) {
  const span = document.createElement("span");
  span.className = className;
  span.textContent = text;
  return span;
}

export function highlightLine(lineText, lang) {
  const frag = document.createDocumentFragment();
  if (!lineText) {
    frag.appendChild(document.createTextNode(" "));
    return frag;
  }

  if (lang === "html") {
    tokenizeHTML(lineText, frag);
  } else if (lang === "css") {
    tokenizeCSS(lineText, frag);
  } else {
    tokenizeJS(lineText, frag);
  }

  return frag;
}

function tokenizeHTML(text, frag) {
  const regex = /(<!--[\s\S]*?-->)|(<\/?[a-zA-Z0-9\-]+)|(\s+[a-zA-Z0-9\-]+(?==))|("[^"]*"|'[^']*')|([<>/=])|([^<>"'=]+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const [full, comment, tag, attr, str, punct, plain] = match;
    if (comment) {
      frag.appendChild(createTokenSpan(comment, "tok-comment"));
    } else if (tag) {
      frag.appendChild(createTokenSpan(tag, "tok-tag"));
    } else if (attr) {
      frag.appendChild(createTokenSpan(attr, "tok-attr"));
    } else if (str) {
      frag.appendChild(createTokenSpan(str, "tok-string"));
    } else if (punct) {
      frag.appendChild(createTokenSpan(punct, "tok-punct"));
    } else if (plain) {
      frag.appendChild(document.createTextNode(plain));
    }
  }
}

function tokenizeCSS(text, frag) {
  const regex = /(\/\*[\s\S]*?\*\/)|(:root|@[a-zA-Z\-]+)|([a-zA-Z\-]+(?=\s*:))|("[^"]*"|'[^']*')|(-?\d*\.?\d+(?:px|rem|em|%|ms|s|deg|fr)?)|([{};:,])|([^/{};:,\d"'\s]+|\s+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const [full, comment, atrule, prop, str, num, punct, plain] = match;
    if (comment) {
      frag.appendChild(createTokenSpan(comment, "tok-comment"));
    } else if (atrule) {
      frag.appendChild(createTokenSpan(atrule, "tok-keyword"));
    } else if (prop) {
      frag.appendChild(createTokenSpan(prop, "tok-prop"));
    } else if (str) {
      frag.appendChild(createTokenSpan(str, "tok-string"));
    } else if (num) {
      frag.appendChild(createTokenSpan(num, "tok-number"));
    } else if (punct) {
      frag.appendChild(createTokenSpan(punct, "tok-punct"));
    } else if (plain) {
      frag.appendChild(document.createTextNode(plain));
    }
  }
}

function tokenizeJS(text, frag) {
  const regex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*'|`[^`\\]*(?:\\.[^`\\]*)*`)|(\b\d+\.?\d*\b)|(\b[a-zA-Z_$][a-zA-Z0-9_$]*\b)|([{}()[\];:,.<>!=+\-*/%&|^~?])|(\s+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const [full, comment, str, num, ident, punct, space] = match;
    if (comment) {
      frag.appendChild(createTokenSpan(comment, "tok-comment"));
    } else if (str) {
      frag.appendChild(createTokenSpan(str, "tok-string"));
    } else if (num) {
      frag.appendChild(createTokenSpan(num, "tok-number"));
    } else if (ident) {
      if (JS_KEYWORDS.has(ident)) {
        frag.appendChild(createTokenSpan(ident, "tok-keyword"));
      } else {
        frag.appendChild(document.createTextNode(ident));
      }
    } else if (punct) {
      frag.appendChild(createTokenSpan(punct, "tok-punct"));
    } else if (space) {
      frag.appendChild(document.createTextNode(space));
    }
  }
}
