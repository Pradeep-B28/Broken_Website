// What it does: Safe localStorage wrapper restricted to allowed keys, resilient to errors and storage blockers.
// What it uses: Nothing.
// What uses it: progress.js, theme.js, sound.js, ui/editor.js, ui/lineEditor.js, selftest.js.

const ALLOWED_STATIC_KEYS = new Set([
  "tbw-theme",
  "tbw-muted",
  "tbw-progress"
]);

const DRAFT_KEY_PREFIX = "tbw-draft-";

export function isAllowedKey(key) {
  if (typeof key !== "string") return false;
  if (ALLOWED_STATIC_KEYS.has(key)) return true;
  if (key.startsWith(DRAFT_KEY_PREFIX) && key.length > DRAFT_KEY_PREFIX.length) {
    const id = key.slice(DRAFT_KEY_PREFIX.length);
    return /^[a-zA-Z0-9_-]+$/.test(id);
  }
  return false;
}

const memoryStorage = new Map();

function getStorage() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage;
    }
    if (typeof globalThis !== "undefined" && globalThis.localStorage) {
      return globalThis.localStorage;
    }
  } catch {
    // Storage access is blocked or restricted
  }
  // Memory fallback for headless / server / blocked storage
  return {
    getItem(k) {
      return memoryStorage.has(k) ? memoryStorage.get(k) : null;
    },
    setItem(k, v) {
      memoryStorage.set(k, String(v));
    },
    removeItem(k) {
      memoryStorage.delete(k);
    },
    get length() {
      return memoryStorage.size;
    },
    key(i) {
      return Array.from(memoryStorage.keys())[i] || null;
    }
  };
}

export function getItem(key) {
  if (!isAllowedKey(key)) return null;
  const storage = getStorage();
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function setItem(key, value) {
  if (!isAllowedKey(key)) {
    console.warn(`Blocked attempt to set unauthorized storage key: "${key}"`);
    return false;
  }
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, String(value));
    return true;
  } catch {
    return false;
  }
}

export function removeItem(key) {
  if (!isAllowedKey(key)) return false;
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function getJSON(key, fallback = null) {
  const raw = getItem(key);
  if (raw === null || raw === undefined) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setJSON(key, value) {
  try {
    const str = JSON.stringify(value);
    return setItem(key, str);
  } catch {
    return false;
  }
}

export function getStoredKeys() {
  const storage = getStorage();
  if (!storage) return [];
  const keys = [];
  try {
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k) keys.push(k);
    }
  } catch {
    // ignore
  }
  return keys;
}
