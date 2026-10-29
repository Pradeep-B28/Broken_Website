// What it does: Tiny pub/sub event bus for decoupled communication between screens, sounds, analytics, and sharing.
// What it uses: Nothing.
// What uses it: All screens, sound.js, analytics.js, share.js, selftest.js.

const listeners = new Map();

export const ALLOWED_EVENTS = [
  "app:ready",
  "level:open",
  "path:choose",
  "room:start",
  "room:edit",
  "code:try",
  "room:escaped",
  "room:skip",
  "escape:done",
  "puzzle:start",
  "spot:tap",
  "fix:pick",
  "hint:open",
  "checks:run",
  "puzzle:solved",
  "solution:reveal",
  "level:done",
  "result:shown",
  "cta:sales",
  "cta:program",
  "cta:website",
  "cta:session",
  "share:image",
  "share:whatsapp",
  "share:copy",
  "theme:change",
  "sound:toggle"
];

export function on(event, handler) {
  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }
  listeners.get(event).add(handler);
  return () => off(event, handler);
}

export function off(event, handler) {
  const set = listeners.get(event);
  if (set) {
    set.delete(handler);
    if (set.size === 0) {
      listeners.delete(event);
    }
  }
}

export function emit(event, data) {
  const set = listeners.get(event);
  if (set) {
    set.forEach((handler) => {
      try {
        handler(data);
      } catch (err) {
        console.error(`Error in event listener for ${event}:`, err);
      }
    });
  }
}

export function clearAllListeners() {
  listeners.clear();
}
