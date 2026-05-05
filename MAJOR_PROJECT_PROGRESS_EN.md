# SIGNAL LOST — Major Project Progress (Week 9 Snapshot)

- **Student**: Nguyen Hung
- **Repo (Week 9 snapshot)**: `https://github.com/NMHx2005/Thu_Bau_04_05_2026_9.git`
- **Project path**: `signal-9/`
- **Snapshot time**: 2026-05-05 (UTC+7)

---

## 1. Project overview (what I built)

**SIGNAL LOST (Week 9 snapshot)** is a browser-based interactive narrative thriller told through a phone-like UI. In this checkpoint, the playable slice focuses on **Night 1**. It combines:

- **Scripted chat** (typing cadence, choices, trust effects)
- **Exploration and puzzles** (canvas-based signal decode)
- **Persistent state** (localStorage-based flags, trust/clues, authored player text)
- **Basic audio cues** (rain ambience + small SFX)
- **A clear stopping point** after Night 1 (Night 2 is intentionally a “Week 9 stop” page)

Core idea: the story *feels like messaging a real person* inside a phone UI. Week 9 demonstrates the core presentation systems and one full interaction loop.

---

## 2. Assessment criteria mapping (rubric-ready)

### A) Development of graphic / interface / design elements

What is demonstrated:

- **Phone OS UI framing (Night 1)**: hotspot exploration → dial pad → chat log + choices → signal decode panel.
- **Canvas puzzle as UI/interaction design**: visual noise reveal (Night 1).
- **Clear Week 9 boundary**: Night 2 is a simple stop page for the checkpoint (no Week 11 UI/features).

Key artifacts (Week 9):

- `signal-9/night1.html` + `signal-9/js/night1.js` (Night 1 interaction loop)
- `signal-9/js/chat.js` (script runner + choices)
- `signal-9/js/signalPuzzle.js` (signal decode canvas puzzle)

### B) Development of sophisticated coding solutions to problems

Problems solved and how:

- **Reusable script runner** for chat pacing and branching:
  - Central runner in `signal-9/js/chat.js` supports “unknown/player/choices/wait” steps, typing delays, and a pacing multiplier.
- **Persistent state (Week 9 minimal)**:
  - Trust/clues and Night 1 completion are stored in localStorage via `signal-9/js/state.js`.
- **Idempotent clue awarding**:
  - Clue increments are protected by flags so replaying a scene doesn’t inflate progression.
- **Audio handling (Week 9 minimal)**:
  - `signal-9/js/audio.js` provides rain ambience + small SFX for interaction feedback.

Evidence (Week 9):

- This checkpoint is a runnable snapshot in `signal-9/` and can be demoed end-to-end through Night 1.

### C) Ability to respond to questions about the presented work

I prepared:

- **A short demo script** (Week 9) to present UI + one puzzle + one state change.
- **A Q&A bank** (below) with “how/why” answers tied to specific files and decisions.

---

## 3. What I delivered by Week 9 (midpoint check-in)

### 3.1 Implemented features (Week 9 status)

- **Night 1 playable loop**
  - Exploration hotspots + chat with choices that affect trust.
  - **Signal decode puzzle** that reveals an image under noise.
- **State persistence foundation**
  - Trust/clues stored in localStorage.
  - Puzzle completion flags to prevent repeated rewards.
- **Basic audio cues**
  - Rain ambience + notification/typing cues (placeholder assets, documented in `ATTRIBUTION.txt`).

### 3.2 Week 9 demo plan (5–7 minutes)

Goal: show *UI*, *one interaction mechanic*, *one state consequence*.

1) Open `signal-9/index.html` → explain prologue reset (fresh run).
2) Enter `night1.html` → show chat pacing + one choice that changes trust.
3) Start Night 1 signal decode puzzle → reveal image under noise.
4) Finish Night 1 → continue to Night 2 (mention guard prevents skipping).

What I will say:

- “This is a phone UI framing the story; interactions are scripted like chat, but choices nudge trust.”
- “Completing the puzzle awards a clue exactly once; replaying won’t inflate progress.”

### 3.3 Questions I expected at Week 9 (and my prepared answers)

- **Q: How do choices affect the story?**  
  **A:** Choices attach a trust delta; trust is stored in localStorage and later influences voicemail lock text and ending routing (`js/state.js`, chat steps).

- **Q: How is the puzzle implemented?**  
  **A:** Canvas draw loop blends noise and a target image; user input controls the reveal threshold/opacity (`js/signalPuzzle.js`).

---

## 4. Technical architecture (what to point to during questioning)

### 5.1 Key modules

- **Chat runner**: `signal-9/js/chat.js`  
  Step queue (“unknown/player/choices/wait”), typing delays, per-night pacing.

- **State (Week 9 minimal)**: `signal-9/js/state.js`  
  localStorage keys for trust/clues and Night 1 completion (`doneSignal1`).

- **Night scripts**:
  - `signal-9/js/night1.js`

- **Puzzles**: `signal-9/js/signalPuzzle.js`  
  Night 1 decode.

- **Audio (Week 9 minimal)**: `signal-9/js/audio.js`  
  Rain ambience + simple SFX.

### 5.2 State model (high-level)

- **Trust (T)**: integer 0–10, modified by choices.
- **Clues (C)**: increments on the Night 1 milestone (`signal1`).
- **Flag**: `doneSignal1` marks the Week 9 completion point.

---

## 5. Evidence & quality (testing + documentation)

- Week 9 snapshot is designed for a **clean Night 1 demo** and stops intentionally at Night 2.

---

## 6. Project stats (for presentation)

- Stats are optional for Week 9; focus is the Night 1 loop and presentation system.

---

## 7. Q&A bank (rubric: “respond to questions”)

### Design / UX

- **Q: What UI elements are you demonstrating in Week 9?**  
  **A:** Night 1 phone UI: hotspots → dial pad → chat log + choices → signal decode panel (`night1.html`, `js/night1.js`).

### Coding / architecture

- **Q: How do you prevent replay from inflating clues?**  
  **A:** The Night 1 milestone (`signal1`) is awarded once by checking a stored flag (`doneSignal1`) in `signal-9/js/state.js`.

- **Q: Why use Web Audio gain nodes instead of just `<audio>` volume?**  
  **A:** For Week 9 I kept audio intentionally minimal (rain + small SFX) to support the demo loop without extra systems (`signal-9/js/audio.js`).

## 8. Planned for later weeks (not in this snapshot)

- Night 2 apps + memory ordering + hidden thread (lore mechanic)
- Night 3 climax + additional puzzle
- Ending routing and payoffs

---

## 9. If I had more time (next improvements)

- Replace placeholder audio/image assets with properly licensed CC0/CC-BY sources and update `ATTRIBUTION.txt`.
- Add small accessibility improvements: keyboard focus order for app buttons, optional reduced motion/typing speed setting.
- Add an in-game “debug info” toggle (non-submission build) to visualize T/C and flags for faster QA.

