# Changelog

All notable changes to The Broken Website project are documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

---

## [1.0.0] - 2026-10-29

### Added
- **Core Game Shell:**
  - Responsive layout for phone (390 x 844) and desktop (1440 x 900) screens.
  - Interactive hero preview with live repair sweep loop and 3D pointer tilt.
  - Level picker screen supporting four distinct player skill paths.
  - Game progress engine tracking points, stars, puzzle completion, and ranks.
- **The Night Museum (Escape Room):**
  - Five progressive escape rooms (The Lobby, The Gallery, The Archive, The Control Room, The Exit).
  - Single-line bottom sheet editor for pinpoint code edits without manual coding.
  - Keypad lock supporting letter, digit, and mixed passcodes with decoy feedback.
  - Animated sliding museum doors with sound effects.
  - Escape completion screen with huge clock timer and score breakdown.
- **Client Site Levels:**
  - Beginner Mode (Mylapore Kaapi Club): 5 spot-the-bug puzzles with line tapping and four-option repair cards.
  - Moderate Mode (Marina Mart): 5 code editor puzzles with live preview reload, failing check indicators, and acceptance checklist.
  - Expert Mode (Reel Seats): 5 advanced debugging puzzles covering race conditions, closures, event delegation, and asynchronous state.
- **Debugging Tooling:**
  - Handcrafted overlapping code editor with syntax highlighting and synchronized scrolling.
  - In-game console drawer showing logs and errors in real time.
  - Visual check list animating checks sequentially with audio chimes.
  - Before and after comparison slider with draggable handle and keyboard navigation.
  - Solution diff view with one-click copy fix option.
- **Audio Synthesizer:**
  - Pure Web Audio sound effects synthesizer: button clicks, wrong blips, check pass notes, door thunks, chimes, and glitch bursts.
  - Audio mute toggle in header persisted to local storage.
- **Themes & Polish:**
  - Dynamic light and dark theme switching following system preferences or manual header toggle.
  - High-resolution canvas share card generation for social media Status (1080 x 1920) and Post (1080 x 1350) sizes.
  - Automated reel demonstration mode (`?demo=1`) with interactive floating tap dot.
  - Presenter mode (`?present=1`) with 18px code font, global number keys, and shortcuts guide.
  - Accessible keyboard navigation with high-contrast focus rings and reduced-motion fallbacks.
  - WhatsApp sales link generator with tailored progress summaries.
  - PWA manifest (`manifest.json`) and Open Graph social sharing images (`og-image.png`).
