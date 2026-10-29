// What it does: Central copy dictionary and interpolation function t() for all user-facing text.
// What it uses: CONFIG from config.js.
// What uses it: All screens, UI components, links.js, selftest.js.

import { CONFIG } from "../config.js";

export const COPY = {
  // Home
  "home.eyebrow": "A debugging game",
  "home.title": "The Broken Website",
  "home.subtitle": "Three client websites are broken. Read the ticket, find the bug, fix the code.",
  "home.start": "Start fixing",
  "home.continue": "Continue",
  "home.how1": "Read the client's ticket",
  "home.how2": "Find what breaks the page",
  "home.how3": "Fix it and run the checks",
  "home.levelProgress": "{n} of {total} fixed",
  "home.result": "See my result",

  // Level picker
  "picker.title": "How much code have you written?",
  "picker.never": "I've never written code",
  "picker.neverSub": "Escape the hacked museum. No coding needed.",
  "picker.little": "I know a little HTML or CSS",
  "picker.littleSub": "Beginner: spot the bug, pick the fix.",
  "picker.some": "I've built small projects",
  "picker.someSub": "Moderate: fix real code.",
  "picker.lots": "I code regularly",
  "picker.lotsSub": "Expert: race conditions, closures and worse.",
  "picker.switch": "You can switch anytime.",
  "picker.change": "Change level",

  // Path answers (used in sales message and picker)
  "path.escape": "I have never written code",
  "path.beginner": "I know a little HTML and CSS",
  "path.moderate": "I have built small projects",
  "path.expert": "I code regularly",

  // Escape room intro
  "escape.title": "The Night Museum",
  "escape.intro": "11:02 PM. The Night Museum's website just went dark. A hacker called Glitch has locked you inside. Five rooms. Five codes. Every clue is hidden in the page's code.",
  "escape.enter": "Enter the museum",
  "escape.best": "Your best time: {time}",

  // Room
  "room.of": "Room {n} of {total}, {title}",
  "room.locked": "Locked by Glitch",
  "room.tapLine": "Tap any line to change it",
  "room.apply": "Apply",
  "room.cancel": "Cancel",
  "room.undo": "Undo",
  "room.reset": "Reset room",
  "room.resetConfirm": "Put the room back the way Glitch left it?",
  "room.skip": "Skip this room",
  "room.skipConfirm": "You will get 0 points for this room. Show the code?",
  "room.did": "What you just did",
  "room.next": "Next room",

  // Lock
  "lock.letters": "Letters",
  "lock.digits": "Digits",
  "lock.mixed": "Letters and digits",
  "lock.unlock": "Unlock",
  "lock.wrong": "That's not it.",
  "lock.decoyTag": "Glitch left that on purpose",

  // Escaped finish
  "escaped.title": "You escaped.",
  "escaped.pitch": "You just edited a website's code to escape. Developers do this every day.",
  "escaped.points": "{n} of {max} points",
  "escaped.next": "Ready for real bugs?",
  "escaped.beginner": "Try the Beginner level",

  // Level screen
  "level.restored": "Restored {n} of {total}",
  "level.progress": "{n} of {total} fixed",
  "level.locked": "Solve puzzle {n} first",
  "level.status.new": "Not started",
  "level.status.fixed": "Fixed",
  "level.status.seen": "Seen the fix",

  // Puzzle screen
  "puzzle.of": "{level}, puzzle {n} of {total}",
  "puzzle.from": "From {client}, {site}",
  "puzzle.accept": "Acceptance",
  "puzzle.pointsLeft": "{n} points available",
  "tab.page": "Page",
  "tab.code": "Code",
  "tab.checks": "Checks",

  // Spot mode
  "spot.find": "Tap the line that causes this",
  "spot.wrongLine": "Not this line",
  "spot.right": "Found it",
  "spot.pick": "Now pick the fix",

  // Edit mode
  "edit.run": "Run checks",
  "edit.running": "Running checks",
  "edit.summary": "{n} of {total} checks pass",
  "edit.summary.one": "1 of {total} checks pass",
  "edit.timeout": "Your page never finished loading. Check for a loop that never ends, or an unclosed tag or comment.",
  "edit.resetFile": "Reset this file",
  "edit.resetAll": "Reset all",
  "edit.resetConfirm": "Put back the original broken code? Your edits will be lost.",
  "edit.draftRestored": "Restored your last edits.",
  "edit.undoRestore": "Start fresh instead",
  "edit.tooLong": "This file is too long. Remove some code to keep typing.",

  // Hints
  "hint.button": "Hint",
  "hint.cost": "Hint {n} of 3 costs {cost} points",

  // Fix reveal
  "fix.show": "Show the fix",
  "fix.confirm": "You will get 0 points for this puzzle. Show the fix?",
  "fix.copy": "Copy the fix into the editor",
  "fix.changed": "{n} lines changed",
  "fix.changed.one": "1 line changed",

  // Console
  "console.title": "Console",
  "console.empty": "Nothing logged yet. Try console.log() in script.js.",

  // Solved card
  "solved.stamp": "Fixed",
  "solved.what": "What was wrong",
  "solved.why": "Why it happens",
  "solved.tip": "Pro tip",
  "solved.next": "Next puzzle",
  "solved.back": "Back to level",
  "solved.site": "See the restored site",

  // Level complete
  "done.title": "{site} is back online",
  "done.drag": "Drag to compare before and after",
  "done.next": "Next level",

  // Result screen
  "result.title": "Your result",
  "result.points": "of {max} points",
  "result.solved": "{n} of {total} puzzles solved",
  "result.escape": "Escape room: {n} of 5 rooms, best time {time}",
  "result.ctaTitle": "Want to fix bugs like this for real?",
  "result.ctaBody": "This is what developers do every day. Our program teaches you to build and fix real websites, step by step.",
  "result.second": `Prefer problem solving and DSA? See the ${CONFIG.secondProgram.name}.`,
  "result.again": "Play again",

  // Calls to action
  "cta.whatsapp": "Talk to us on WhatsApp",
  "cta.program": "See the program",
  "session.label": "Free live session",
  "session.btn": "Save my seat",

  // Sharing
  "share.title": "Challenge a friend",
  "share.image": "Share my score",
  "share.whatsapp": "Send on WhatsApp",
  "share.copy": "Copy link",
  "share.copied": "Copied",
  "share.status": "Status",
  "share.post": "Post",
  "share.ask": "Can you beat that?",

  // Presenter mode
  "presenter.end": "Questions? Ask in the chat.",

  // Footer
  "footer.built": "Built with code by Wrench Wise",
  "footer.learn": "Learn to build apps like this"
};

export function t(key, values = {}) {
  let text = COPY[key];
  if (values && values.n === 1 && COPY[`${key}.one`]) {
    text = COPY[`${key}.one`];
  }
  if (text == null) {
    return key;
  }
  return text.replace(/\{(\w+)\}/g, (match, p1) => {
    return values[p1] != null ? values[p1] : match;
  });
}
