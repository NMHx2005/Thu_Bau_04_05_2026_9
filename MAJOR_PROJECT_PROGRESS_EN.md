# SIGNAL LOST — Week 9 Progress (≈50% of final)

This document is written to be **read aloud** during the informal Week 9 presentation. It is intentionally **hyper-detailed**, aligned to the assessment criteria, and includes a **demo script** and a **Q&A bank**.

### What I am showing (scope)

By Week 9, I am demonstrating roughly **50% of the final project scope** (from `signal-lost/`), implemented as **Night 1 + Night 2** in this snapshot:

- **Explore** a room via hotspots (story reveals through short “lore” overlays)
- **Dial** a phone number (input validation; “wrong number” responses)
- **Chat** with “Unknown” (scripted pacing + player choices)
- **Solve one puzzle** (signal decode on canvas; reveals an image)
- **Night 2 apps** exploration (Photos/Notes/Browser/Voicemail)
- **Night 2 memory ordering** (sortable timeline; awards a milestone once)
- **Night 2 chat + one free-text reply**
- **Persist progress** (trust/clues/flags in localStorage; idempotent milestones)

### What I am not showing (intentionally out of scope for Week 9)

- Night 2 hidden thread mechanic (Week 11 content)
- Night 3 climax + additional puzzle(s)
- Ending routing logic and endgame payoff sequences

This is deliberate: Week 9 is about proving the **core presentation systems** work and are extensible.

---

## 1. Project overview (what the project is)

**SIGNAL LOST** is a browser-based interactive narrative thriller presented through a **phone-like UI**. The story is told through **chat**, **UI interactions**, and **puzzles** that double as narrative devices.

Week 9 establishes the “engine” for the rest of the project and demonstrates the mid-game loop:

- A reusable **script runner** for dialogue pacing + choices
- A minimal but correct **state model** (trust/clues + one milestone)
- A first interactive “signal” puzzle that proves I can integrate **canvas** + narrative
- A minimal **audio layer** to support atmosphere and feedback

---

## 2. Assessment criteria (rubric) — detailed mapping

### A) Development of graphic / interface / design elements

#### A1) Overall interface concept: phone-like narrative UI (Night 1 + Night 2)

What staff will see on screen:

- A **full-screen scene** with hotspots that feel like “point and click” exploration.
- A **dial pad** UI that transitions into a **phone chat** UI.
- A **chat log** with “Unknown” identity framing and “typing” pacing.
- A **signal panel** with a canvas and a slider, presented as “Signal clarity”.

Where it lives:

- **Night 1 layout**: `signal-9/night1.html`
- **Night 2 layout**: `signal-9/night2.html`
- **Styles**: `signal-9/css/phone.css`, `signal-9/css/night.css`, `signal-9/css/base.css`, `signal-9/css/animations.css`

What I would say while pointing at UI:

- “My design goal is that the user feels they’re interacting with a phone interface, not a traditional game HUD.”
- “Week 9 proves the UI transitions work and feel coherent across two nights: explore → dial → chat → puzzle → apps → memory → chat/free-text.”

#### A2) Micro-interactions and feedback design

What I implemented:

- Hotspot click opens a **lore overlay** that can be dismissed by clicking — quick “read and continue”.
- Dial pad presses show real-time **display update**; delete/call actions behave like a phone.
- Chat choices appear as buttons and are appended into the chat log for continuity.
- Puzzle slider updates a **percentage label** and changes the reveal level live.
- Night 2 apps open/close, with a clear “discover apps → proceed” loop.
- Night 2 memory ordering uses drag-and-drop with visible placeholder styling.

Where it lives:

- Lore overlay + hotspots: `signal-9/js/night1.js` (`showLore`, `initExplore`)
- Dial pad: `signal-9/js/night1.js` (`initDial`, `renderDial`)
- Chat UI: `signal-9/js/chat.js` (append bubbles + step runner)
- Puzzle panel: `signal-9/js/signalPuzzle.js` + `signal-9/js/night1.js`
- Night 2 apps/memory/chat: `signal-9/night2.html` + `signal-9/js/night2.js`

Why this matters for design assessment:

- It demonstrates intentional UI/UX thinking: players always receive **visual confirmation** that their action did something.
- The UI is consistent in tone (dark palette, “phone” framing, small text, restrained highlights).

#### A3) Visual puzzle as interface design (signal decode)

What the puzzle is:

- A **canvas-based image reveal** under noise, controlled by a slider (“Signal clarity”).
- It is designed to feel like “tuning” a signal rather than solving a math puzzle.

Where it lives:

- `signal-9/js/signalPuzzle.js` (canvas draw + noise overlay)
- Hooked from `signal-9/js/night1.js` (`startSignalDecode`)

What I would say:

- “I chose a visual reveal puzzle because it matches the theme: SIGNAL LOST is about reconstructing what happened from distorted fragments.”

---

### B) Development of sophisticated coding solutions to problems

Week 9 sophistication is in **architecture decisions** that support later expansion, not in the total number of levels.

#### B1) Script presentation engine (reusable dialogue runner)

Problem:

- I need an engine that can present dialogue consistently across pages: typing pace, choice buttons, and a clean way to queue beats.

Solution:

- Implement a **step queue runner** that accepts an array of steps and executes them sequentially.
- Supported step types (Week 9): `unknown`, `player`, `choices`, `wait`
- Supports a pacing multiplier to tune the “feel” without rewriting each line.

Where it lives:

- `signal-9/js/chat.js`

What I would say:

- “This runner is my narrative ‘runtime’. Week 9 proves the core runner works; later nights can reuse it with different scripts and pacing.”

#### B2) Persistent state model (localStorage) + idempotent milestones (Night 1 + Night 2)

Problem:

- The game needs to remember progress and avoid “double rewarding” if the player reloads or repeats an interaction.

Solution (Week 9):

- Store persistent values used by Week 9:
  - **Trust (T)**: changes with choices
  - **Clues (C)**: increments on a major milestone
  - **Flag** `doneSignal1`: ensures the Night 1 milestone is awarded once
  - **Flag** `doneMemoryDrag`: ensures the Night 2 memory milestone is awarded once
  - **Phrases**: stores player-entered or tracked text in a simple list (future proofing)
- Implement **idempotent milestone awarding**:
  - `tryAwardClue("signal1")` returns false if already done.
  - `tryAwardClue("memory")` returns false if already done.

Where it lives:

- `signal-9/js/state.js`

What I would say:

- “I’m intentionally keeping state minimal in Week 9, but it’s already correct: it persists, and it prevents duplicate rewards.”

#### B3) Input validation and “wrong number” behavior

Problem:

- Dial input must be robust: allow non-digits but compare digits; wrong entries should still produce narrative feedback.

Solution:

- Normalize dial input by stripping non-digits.
- Compare against a canonical digits string (`NOTE_PHONE_DIGITS`).
- Provide multiple wrong-number narrative responses (including optional tones) to keep it diegetic.

Where it lives:

- Normalization + correctness check: `signal-9/js/state.js` (`normalizeDialInput`, `isCorrectNoteNumber`)
- Wrong-number responses: `signal-9/js/night1.js` (`wrongNumberResponse`)

#### B4) Minimal audio layer (atmosphere + interaction feedback)

Problem:

- Browser audio autoplay restrictions and the need for light feedback sounds.

Solution (Week 9):

- Provide a minimal audio API surface for Night 1:
  - `startRainLoop()` (ambient)
  - `playTypingTick()` (UI feedback)
  - `playNotification()` (moment cue)
  - `playTone()` (fallback / diegetic tones)
- Audio is kept minimal so it supports the demo without complicating Week 9 scope.

Where it lives:

- `signal-9/js/audio.js`

What I would say:

- “Week 9 audio is intentionally small: it’s here to support atmosphere and clarity, not to become a system to debug during the checkpoint.”

---

### C) Ability to respond to questions about the presented work

To meet this criterion, I prepared:

- A **structured demo script** (timeboxed)
- A **file map** (so I can point to specific code fast)
- A **Q&A bank** with “why” and “how” answers tied to real files
- A set of **likely staff questions** and concise answers

---

## 3. Presentation script (Week 9, 5–7 minutes)

### 3.1 Setup (30 seconds)

Say:

- “This is my Week 9 progress. I’m showing a complete Night 1 loop with UI transitions, a dialogue engine, one puzzle, and persistent state.”
- “This is an informal checkpoint; I’ll show the working build, then explain architecture.”

Do:

- Open `signal-9/index.html`
- Click through prologue to enter Night 1

### 3.2 Demo step-by-step (4–5 minutes)

#### Step A — Exploration UI (hotspots)

Do:

- Click 2–3 hotspots quickly (e.g. laptop, window, note)

Say:

- “Hotspots reveal short lore overlays. This establishes tone and also ensures the player interacts before the phone becomes available.”

Point to:

- `signal-9/js/night1.js` → `initExplore()`, `showLore()`

#### Step B — Dial pad and validation

Do:

- Type a wrong number → press call → show wrong-number response
- Then dial the correct one from the note: **0427 318 247** → call

Say:

- “I normalize the dial input to digits-only. Wrong numbers still give a narrative response instead of a silent failure.”

Point to:

- `signal-9/js/state.js` → `normalizeDialInput()`, `isCorrectNoteNumber()`
- `signal-9/js/night1.js` → `wrongNumberResponse()`

#### Step C — Chat engine + choices affect trust

Do:

- Let “Unknown” lines play
- Choose an option that increases or decreases trust

Say:

- “Dialogue is driven by a reusable script runner. Choices write into the log and update trust in persistent state.”

Point to:

- `signal-9/js/chat.js` (runner)
- `signal-9/js/state.js` (`addTrust`)

#### Step D — Signal decode puzzle (canvas)

Do:

- Move “Signal clarity” slider toward 100% until completion

Say:

- “This canvas puzzle proves I can integrate a mechanical interaction into the narrative theme. Completing it awards a clue once.”

Point to:

- `signal-9/js/signalPuzzle.js`
- `signal-9/js/night1.js` (`startSignalDecode`, calls `tryAwardClue("signal1")`)

#### Step E — Week 9 stopping point

Do:

- Click “Continue” → land on `signal-9/night2.html` (Night 2 continues the slice)

#### Step F — Night 2 apps → memory → chat → free text

Do:

- Open each app (Photos/Notes/Browser/Voicemail), then close the app layer.
- Continue to the memory ordering screen and lock the correct order.
- Proceed into chat, pick one choice, then type one free-text reply and press Enter.

Say:

- “Night 2 extends the phone illusion: apps exploration and a drag-and-drop memory timeline.”
- “After the memory milestone, the script asks for one free-text reply; this is stored for later use.”
- “Week 9 ends here; Week 11 adds deeper mechanics (hidden thread + Night 3 + endings).”

### 3.3 Close (30–60 seconds)

Say:

- “Week 9 proves the core systems: UI flow, dialogue runner, puzzle integration, and persistent state.”
- “Next steps after staff feedback: expand into Night 2 systems and build toward the week 11 milestone.”

---

## 4. File map (for quick navigation during Q&A)

- **Entry + reset**: `signal-9/index.html`
- **Night 1 page**: `signal-9/night1.html`
- **Night 1 logic**: `signal-9/js/night1.js`
- **Chat engine**: `signal-9/js/chat.js`
- **State**: `signal-9/js/state.js`
- **Signal puzzle**: `signal-9/js/signalPuzzle.js`
- **Audio**: `signal-9/js/audio.js`
- **Week 9 stop page**: `signal-9/night2.html`
- **Night 2 logic**: `signal-9/js/night2.js`

---

## 5. Likely questions (and prepared answers)

### Design / UI

- **Q: What design elements are completed by Week 9?**  
  **A:** A coherent Night 1 UI flow: exploration hotspots → dial pad → chat UI → puzzle panel (canvas). All are styled consistently with the phone theme (`night1.html` + `css/*`).

- **Q: Why use a phone UI?**  
  **A:** The story is about communication, absence, and reconstruction. A phone UI makes the narrative feel diegetic and supports “Unknown” as a believable presence.

### Coding / engineering

- **Q: Why did you build a script runner instead of hardcoding dialogue?**  
  **A:** Hardcoding doesn’t scale. The script runner makes pacing and branching consistent and keeps the night scripts readable (`js/chat.js`).

- **Q: How do you prevent replay from inflating progress?**  
  **A:** I store flags (`doneSignal1`, `doneMemoryDrag`) and use `tryAwardClue("signal1")` / `tryAwardClue("memory")` so each milestone only awards once (`signal-9/js/state.js`).

- **Q: How do you handle dial input robustness?**  
  **A:** I normalize input to digits-only (`normalizeDialInput`) then compare to `NOTE_PHONE_DIGITS`, so spaces/symbols don’t break the check (`js/state.js`).

- **Q: Why canvas for the puzzle?**  
  **A:** Canvas gives control over noise blending and a clean real-time reveal effect. It also matches the theme of “signal clarity” better than a static image swap (`js/signalPuzzle.js`).

### Process / progress

- **Q: What are your next steps after Week 9?**  
  **A:** Expand to Night 2 systems (apps layer, memory ordering, deeper state), then integrate a final-night climax and ending logic for Week 11.

---

## 6. Week 9 checklist (what I can confidently claim)

- A Night 1 loop that starts at `index.html` and ends at the Week 9 stop page
- A reusable chat runner with choices affecting persistent trust
- A canvas-based puzzle integrated into narrative flow
- Persistent state and idempotent milestone awarding
- Minimal audio atmosphere + feedback

---

## 7. Planned for Week 11 (not in this snapshot)

- Night 2: apps layer + memory ordering + additional narrative mechanics
- Night 3: climax pacing + additional puzzle
- Ending routing/payoffs and final polish

