# SIGNAL LOST — Week 9 Progress (≈50% of final scope)

This document is written to be **read aloud and used as a live reference** during the Week 9 informal presentation. It is **hyper-detailed**, directly mapped to the three assessment criteria, and includes a complete **demo script**, **file map**, and **Q&A bank** with answers tied to specific source files.

---

## Scope: what I am demonstrating at Week 9

By Week 9, I am demonstrating roughly **50% of the final project scope**, implemented across **Night 1 (complete)** and **Night 2 (complete slice)**:

- **Prologue** — 4 slides that reset state and transition into Night 1
- **Night 1 Explore** — 5 visual hotspot objects revealed with a wakeup sequence; each opens a lightbox zoom overlay with title and lore
- **Night 1 Dial** — phone number input with digit normalisation, wrong-number narrative responses, correct number unlocks chat
- **Night 1 Chat** — scripted dialogue with Unknown, player choices affecting trust, conditional beat if coat was visited
- **Night 1 Signal Puzzle** — canvas noise/reveal controlled by a slider; completing awards clue 1 (idempotent)
- **Night 1 → Night 2 Transition** — eyelid-close animation + interstitial text "Night One ends. The signal holds." + eyelid-open in Night 2
- **Night 2 Apps** — Photos, Notes, Browser, Voicemail; Voicemail copy switches at trust threshold T ≥ 5
- **Night 2 Memory Ordering** — jQuery UI sortable; correct order fills slot 5 with "rest" and awards clue 2 (idempotent)
- **Night 2 Chat + Free-text** — choices affect trust; one free-text reply keyword-matched; phrase stored in localStorage
- **Night 2 Hidden Thread** — archived messages in both Notes and Browser reveal 3 undelivered messages sent from the player's own number; awards clue 3 (idempotent)
- **Persistent state** — trust, clues, four idempotent milestone flags, and a phrases array in localStorage; `resetGame()` on index load

## What is intentionally out of scope for Week 9

- Night 3: heartbeat puzzle, timed chat, word bank
- Ending routing: SIGNAL FOUND / NOT YET / STATIC endings
- Night 3 milestone (`signal3` flag is stubbed in state but not yet triggered)

---

## 1. Project overview

**SIGNAL LOST** is a browser-based interactive narrative game presented entirely through a **simulated phone interface**. There is no traditional game HUD. The story — about identity, memory, and what is left unsaid — is told through:

- A **chat interface** with a contact named "Unknown"
- **Environmental hotspots** that function as point-and-click exploration
- **Mini-puzzles** that double as narrative devices (signal decode, memory ordering, hidden thread)
- **Persistent state** that carries player choices across pages

The project is built in vanilla HTML, CSS, and JavaScript — no frameworks, no build tools — to demonstrate direct technical control over the browser environment.

---

## 2. Assessment criteria — detailed mapping

---

### A) Development of graphic / interface / design elements

#### A1) Overall UI concept: the phone as narrative frame

The entire game is experienced through what looks and feels like a phone screen. This is not cosmetic — it is the core design decision that makes the narrative work:

- The player never sees a traditional game UI. Every interaction (hotspot, dial pad, chat, puzzle) is presented as if the player is holding and using a phone.
- "Unknown" is a contact in the phone — not a disembodied narrator — which makes the emotional stakes feel real.
- The phone UI enforces intimacy and claustrophobia appropriate to the story's theme.

**Where it lives:**

- `signal-9/night1.html` — Night 1 layout (explore scene, dial pad, phone chat, signal panel)
- `signal-9/night2.html` — Night 2 layout (app grid, app layer, memory phase, chat phase)
- `signal-9/css/base.css` — CSS variables, reset, phone screen container
- `signal-9/css/phone.css` — phone frame, status bar, chat bubbles, typing indicator, choices
- `signal-9/css/night.css` — hotspot positions, lore overlay, dial pad, signal panel, eyelid overlays, lightbox, transition text, memory cards
- `signal-9/css/animations.css` — message enter animation, reduced-motion support

**What to say while pointing at the UI:**

> "The design goal is that the player feels they are using a real phone — not playing a game with a phone skin. Every hotspot, overlay, and chat bubble reinforces that frame."

---

#### A2) Night 1 visual scene: 5 hotspot objects with wakeup animation

Night 1 opens on a bedroom scene. Five physical objects are clickable. Each one carries a piece of the story.

**The wakeup sequence:**

When `night1.html` loads, two black `div` strips (`#eyeLidTop`, `#eyeLidBottom`) cover the screen. They animate like eyelids — blinking three times then opening fully over 2.8 seconds — before the room is visible. This communicates "the player just woke up" without any text.

After the eyelids fully open, `runWakeupSequence()` reveals each object image with a staggered fade-in (400ms apart, in visual order: window → photo → laptop → coat → note).

**The five objects and their roles:**

| Object | Title shown | Story role |
|---|---|---|
| Laptop | The Unsent Draft | A half-written message, cursor still blinking. The player was trying to say something and could not finish it. |
| Window | No Reflection | Rain on the glass, but no reflection of the player — a planted clue. Most players read it as art style on first playthrough. |
| Note | The Number | A handwritten phone number, slightly smudged: 0427 318 247. This is the dial target. |
| Photograph | The Photograph | A blurred face in a warm frame — almost recognisable, never quite. |
| Coat | Still Warm | Still warm by the door. If visited before the call, Unknown references it in chat. |

**All five objects must be opened before the dial phase unlocks.** This is intentional gating: the player must inhabit the space before they can reach out.

**Where it lives:**

- Object images: `signal-9/assets/images/night1/obj_*.png`
- Hotspot positions: `.hotspot--laptop`, `.hotspot--window`, `.hotspot--note`, `.hotspot--photo`, `.hotspot--coat` in `signal-9/css/night.css`
- Wakeup sequence: `signal-9/js/night1.js` → `runWakeupSequence()`
- Lore content: `signal-9/js/night1.js` → `var LORE = { ... }`

---

#### A3) Lightbox zoom: shared-element style object inspection

Clicking any hotspot opens a full-screen lightbox. The object image **animates from its position on screen toward the centre of the viewport** — not a generic fade-in from nothing. This creates a sense of picking the object up.

The interaction:

1. A dark overlay appears and darkens to `rgba(0,0,0,0.82)`
2. The object image scales up from the hotspot's position to fill the centre of the screen
3. Below the image: the object's title and lore text appear
4. A `×` button or clicking the overlay closes the lightbox with a reverse scale

**What to say:**

> "The lightbox uses `getBoundingClientRect()` to read where the hotspot sits on screen, then starts the animation from that exact point. It feels like the player physically picks up the object."

**Where it lives:**

- `signal-9/js/night1.js` → `showLightbox(id, hotspotEl)`, `closeLightbox()`
- `signal-9/css/night.css` → `#objLightbox`, `#objLightbox__inner`, `#objLightbox__img`, `#objLightbox__title`, `#objLightbox__text`, `#objLightbox__close`

---

#### A4) Scene transition: eyelid animation + interstitial text

When the player clicks "Continue" at the end of the Night 1 puzzle:

1. The two eyelid strips animate **closed** over 0.55 seconds (ease-in, like shutting eyes)
2. A `#transitionText` div appears on top of the closed eyelids: **"Night One ends."** then **"The signal holds."** — two lines fading in 0.25s apart
3. Rain audio fades out
4. Navigation to `night2.html`
5. In Night 2, the eyelid strips start closed and animate **open** slowly over 2.2 seconds (ease-out, single open — no blinks) — communicating a different quality of consciousness

Night 1 uses a **blink** sequence (disoriented waking). Night 2 uses a **slow single open** (deliberate, aware). The distinction is intentional.

**Where it lives:**

- Night 1 eyelid animation: `@keyframes eyeLidTopBlink`, `@keyframes eyeLidBottomBlink` in `signal-9/css/night.css`
- Night 2 eyelid animation: `@keyframes eyeLidTopOpen`, `@keyframes eyeLidBottomOpen` in `signal-9/css/night.css`
- Transition logic: `signal-9/js/night1.js` → `$("btnNight2").addEventListener("click", ...)`
- Interstitial text styles: `#transitionText`, `@keyframes fadeInText` in `signal-9/css/night.css`
- HTML: `<div id="eyeLidTop">` and `<div id="eyeLidBottom">` in `signal-9/night1.html` and `signal-9/night2.html`

---

#### A5) Night 2 app interface: four apps + hidden thread UI

Night 2 presents a phone home screen grid with four apps. Each app opens a scrollable layer inside the phone frame:

- **Photos** — corrupted camera roll for March 3rd; a blurred image resolves slightly on tap
- **Notes** — a to-do list that will not be completed; a draft quote; and a collapsible "Drafts — 3 unsent [tap]" section revealing the hidden thread
- **Browser** — search history from the final day (library hours, park bench, a phone through a door); and a collapsible "Draft sync — 3 pending [sync]" section revealing the same thread
- **Voicemail** — locked copy until trust threshold; at T ≥ 5 shows "one unheard message" (audio reserved for ending)

**Hidden thread UI:** Both Notes and Browser contain a discoverable section that, when tapped, reveals three right-aligned message bubbles sent from the player's own number — all marked "Not delivered" or "Send failed". The messages are not threatening. They say goodbye without using the word.

**Where it lives:**

- `signal-9/night2.html` — app grid, app layer, memory phase, chat phase
- `signal-9/js/night2.js` → `renderApp(name)` — all four app content blocks including hidden thread

---

#### A6) Night 2 memory ordering

A sortable drag-and-drop interface using jQuery UI. Four memory cards cover four timestamped events of March 3rd. A fifth slot labelled "what happened next" is always visible. When the player locks the correct order, Unknown fills slot 5 with one word: **rest**.

**Where it lives:**

- `signal-9/night2.html` — `#memoryList`, `#memoryFifth`, `#memoryRest`, `#btnVerifyMemory`
- `signal-9/js/night2.js` → `initMemory()`
- `signal-9/css/night.css` → `.memory-card`, `.memory-slot--framed`
- `signal-9/css/jquery-overrides.css` — sortable drag styling

---

### B) Development of sophisticated coding solutions to problems

#### B1) Reusable chat engine (script runner)

**Problem:** Dialogue needs consistent pacing, typing indicators, choice buttons, and trust updates across multiple nights. Hardcoding per-page would be unmaintainable.

**Solution:** `SignalLostChat.runScript(steps, opts)` — a step queue runner that accepts an array and executes sequentially:

- `{ type: "unknown", text }` — typing indicator → delay → bubble
- `{ type: "player", text }` — immediate player bubble (no delay)
- `{ type: "choices", options }` — renders choice buttons; on pick: echo bubble, call `addTrust(delta)`, remove buttons
- `{ type: "wait", ms }` — pause before next step

Pacing is tuned per-night via `getDelayMul()` — Night 1 uses `1.14`, Night 2 uses `1.12`. Changing the multiplier adjusts the entire night's feel without touching individual lines.

**Why this is sophisticated:** Night scripts are pure data arrays. The engine is not rewritten for each night — it is called with a different script. Night 3 will reuse the same engine.

**Where it lives:** `signal-9/js/chat.js`

---

#### B2) Persistent state with 4-milestone idempotent awarding

**Problem:** Progress must survive page reloads. Replaying a completed section must not inflate clue counts or re-trigger story beats.

**Solution:** `signal-9/js/state.js` — a self-contained localStorage module exposing:

| Key | Purpose |
|---|---|
| `signalLost_trust` | Player trust score (0–10), clamped |
| `signalLost_clues` | Total clues collected (0–4) |
| `signalLost_doneSignal1` | Flag: Night 1 canvas puzzle completed |
| `signalLost_doneMemoryDrag` | Flag: Night 2 memory ordering completed |
| `signalLost_doneHidden` | Flag: hidden thread discovered |
| `signalLost_doneSignal3` | Flag: Night 3 milestone (stub for Week 11) |
| `signalLost_phrases` | JSON array of player-entered text |

`tryAwardClue(kind)` checks the flag first. If already set, returns `false` — no clue awarded, no state change. This makes all milestones replay-safe.

`getFinalWords()` returns the first phrase in the array, or a fallback — used by ending pages to echo the player's own words back.

`resetGame()` clears all keys — called by `index.html` on load so every prologue run starts fresh.

**What to say when pointing at the code:**

> "Every milestone is an idempotent operation. `tryAwardClue('signal1')` is safe to call 100 times — it awards exactly once. The same pattern covers all four milestones."

**Where it lives:** `signal-9/js/state.js`

---

#### B3) Input normalisation and diegetic wrong-number responses

**Problem:** Dial input may contain spaces or punctuation. A silent fail on wrong numbers breaks immersion.

**Solution:**

- `normalizeDialInput(str)` strips all non-digits: `"0427 318 247"` → `"0427318247"`
- `isCorrectNoteNumber(dialString)` normalises then compares to `NOTE_PHONE_DIGITS`
- `wrongNumberResponse()` randomly picks from three responses: busy tone (with three `playTone` calls), heavy silence, or a voicemail that says "Later" — each is a narrative beat, not an error message

**Where it lives:**

- Normalisation: `signal-9/js/state.js` → `normalizeDialInput()`, `isCorrectNoteNumber()`
- Wrong-number responses: `signal-9/js/night1.js` → `wrongNumberResponse()`

---

#### B4) CSS specificity bug — fixed overlay position conflict

**Problem discovered and solved during development:** The rule:

```css
body.night-bedroom-page > *:not(#finOverlay) {
  position: relative;
  z-index: 1;
}
```

The `:not(#finOverlay)` argument contributes the ID's weight to the selector's specificity, making it **(1,1,1)**. This is higher than `#eyeLidTop` and `#objLightbox` at **(1,0,0)**, which caused both overlays to become `position: relative` instead of `position: fixed` — the eyelid animation had no effect, and the lightbox appeared at the bottom of the page.

**Fix:** Extend the exclusion list:

```css
body.night-bedroom-page > *:not(#finOverlay):not(#eyeLidTop):not(#eyeLidBottom):not(#transitionText):not(#objLightbox):not(#loreHost) {
  position: relative;
  z-index: 1;
}
```

**What to say:**

> "This is a real bug I diagnosed and fixed during development — a specificity collision between a broad reset rule and individual overlay selectors. Understanding how `:not()` contributes ID weight to specificity was the key."

**Where it lives:** `signal-9/css/night.css` — line 41

---

#### B5) Shared-element lightbox zoom via getBoundingClientRect

**Problem:** A lightbox that fades in from centre is generic. The object should feel like it is being physically picked up from its position in the room.

**Solution:**

1. On hotspot click, call `hotspotEl.getBoundingClientRect()` to get the element's current screen position
2. Compute the offset from the viewport centre: `originX = rect.left + rect.width/2 - vw/2`
3. Set the lightbox inner div's `transform` to `translate(originX, originY) scale(scaleStart)` — placing it visually at the hotspot
4. Remove `transition`, force a reflow with `lb.offsetWidth`
5. Re-add `transition` and set `transform: translate(0,0) scale(1)` — the browser interpolates from the hotspot position to centre
6. Closing reverses: scale shrinks, opacity drops, then `night-hidden` class re-applied

**Where it lives:** `signal-9/js/night1.js` → `showLightbox(id, hotspotEl)`

---

#### B6) Dual eyelid animation system

**Problem:** A single opacity-fade overlay communicates nothing about *why* the screen goes dark. Two vertical strips that slide apart communicate "eyes opening".

**Solution:** Two `position: fixed` divs, each `height: 51vh` (1px overlap to prevent hairline gaps):

- `#eyeLidTop` — anchored to the top, animates `translateY(0)` → `translateY(-100%)`
- `#eyeLidBottom` — anchored to the bottom, animates `translateY(0)` → `translateY(100%)`

Two keyframe pairs:

- `eyeLidTopBlink` / `eyeLidBottomBlink` (2.8s): multiple partial opens at 10%, 32%, then full open at 72% — communicates disoriented waking in Night 1
- `eyeLidTopOpen` / `eyeLidBottomOpen` (2.2s, ease-out): single slow open — communicates deliberate awareness in Night 2

For the Night 1 → Night 2 transition, the eyelids are first snapped to their fully-open position (via inline style), then transitioned back to closed (0.55s ease-in) using JavaScript before navigation. Night 2 then starts with eyelids at their default closed position and animates them open.

**Where it lives:**

- `signal-9/css/night.css` → `@keyframes eyeLidTopBlink`, `@keyframes eyeLidBottomBlink`, `@keyframes eyeLidTopOpen`, `@keyframes eyeLidBottomOpen`, `#eyeLidTop`, `#eyeLidBottom`
- Transition logic: `signal-9/js/night1.js` → `$("btnNight2").addEventListener`

---

#### B7) Idempotent hidden thread across two app entry points

**Problem:** The hidden thread can be found from either the Notes app or the Browser app. Only one clue should be awarded regardless of which the player opens first or whether they open both.

**Solution:** Both `renderApp("notes")` and `renderApp("browser")` call the same `tryAwardClue("hidden")`. Since `tryAwardClue` is idempotent — it checks `getDoneHidden()` before setting the flag and incrementing clues — the award fires exactly once. Both app UIs also check `getDoneHidden()` on render to show the thread as already-expanded if previously discovered.

**Where it lives:** `signal-9/js/night2.js` → `renderApp("notes")`, `renderApp("browser")`; `signal-9/js/state.js` → `tryAwardClue("hidden")`, `getDoneHidden()`

---

#### B8) Canvas signal decode puzzle

**Problem:** A thematic puzzle that fits the game's core concept of "recovering corrupted memory from noise".

**Solution:** `SignalLostSignalPuzzle.initDecode()` — a canvas-based reveal:

- A `LastLocation.png` image is drawn on the canvas
- A procedural noise layer is drawn on top at an opacity controlled by the slider (0 = maximum noise, 1 = no noise)
- The slider maps linearly to noise opacity; the image becomes visible as clarity increases
- At 100%, `onComplete()` fires — exactly once, checked externally via `tryAwardClue("signal1")`
- If the image file is missing, a fallback (`Bedroom.png`) is used

Real-time pixel blending on canvas is more technically interesting and more thematically appropriate than swapping static images.

**Where it lives:** `signal-9/js/signalPuzzle.js`; called from `signal-9/js/night1.js` → `startSignalDecode()`

---

#### B9) Free-text keyword matching and phrase storage

**Problem:** A single free-text input at the end of Night 2 needs to feel like it matters — Unknown should respond differently based on what the player says, and the text should be recoverable for later use in endings.

**Solution:**

- `freeInput` keydown handler reads the player's text
- Lowercased input is checked for keywords: `"sorry"`, `"love"`, `"afraid"` / `"scared"`, with a default fallback
- The exact phrase is stored via `SignalLostState.addPhrase(raw)` — a deduplicating array in localStorage
- `getFinalWords()` returns the first stored phrase, used by ending pages to echo the player's own words

**Where it lives:** `signal-9/js/night2.js` → `initFreeInput()`; `signal-9/js/state.js` → `addPhrase()`, `getFinalWords()`

---

### C) Ability to respond to questions about the presented work

The following sections contain the demo script, file map, and Q&A bank prepared to meet this criterion.

---

## 3. Demo script (Week 9, 5–8 minutes)

### Opening (30 seconds)

Say:

> "This is my Week 9 checkpoint for SIGNAL LOST — an interactive narrative game running in the browser as a simulated phone interface. I will walk through a complete Night 1 loop and a complete Night 2 slice, covering roughly 50% of the final project scope. This includes all five hotspot objects, a scene transition with a custom eyelid animation, the canvas puzzle, and the Night 2 hidden thread mechanic."

Do:

- Open `signal-9/index.html`
- Note: "index.html resets all localStorage state on load"
- Click through the 4 prologue slides

---

### Step 1 — Wakeup and bedroom exploration (Night 1)

Do:

- Watch the eyelid animation play (3 blinks over 2.8s, then open)
- Watch the 5 objects fade in one by one after the eyelids open

Say:

> "When Night 1 loads, two black strips animate like eyelids — three quick blinks, then open. This tells the player they just woke up without any text. After the eyelids open, the five objects in the room fade in staggered, 400 milliseconds apart."

Do:

- Click the **Window** hotspot

Say:

> "Each object opens a lightbox that zooms from the object's position on screen to the centre — using `getBoundingClientRect` to read the exact screen position. The title is 'No Reflection'. Rain on the glass, but no reflection of the player. This is a planted clue — most players read it as an art style choice on first playthrough."

- Close. Click **Laptop**:

> "The Unsent Draft — a half-written message, cursor still blinking. The player was trying to say something and could not finish it."

- Close. Click **Note**:

> "The Number — a handwritten phone number, slightly smudged: 0427 318 247. This is the number the player will dial."

- Close. Click **Photograph** and **Coat**:

> "The Photograph — almost recognisable, never quite. And the Coat — still warm by the door. If this is visited before the call, Unknown fires a conditional extra line."

Say:

> "All five have to be read before the dial phase unlocks. That is intentional gating."

Point to:

- `signal-9/js/night1.js` → `initExplore()`, `runWakeupSequence()`, `showLightbox()`
- `signal-9/css/night.css` → `@keyframes eyeLidTopBlink`, `#objLightbox`

---

### Step 2 — Dial pad and validation

Do:

- Type a wrong number → press call → show response

Say:

> "Wrong numbers produce a narrative response — a busy tone, heavy silence, or a voicemail that says 'Later'. The game never fails silently. Input is normalised to digits-only before comparison."

Do:

- Dial **0427 318 247** → call

Say:

> "When the correct number is dialled, Unknown picks up immediately — no ring. First line: 'I have been waiting for you to call.'"

Point to:

- `signal-9/js/state.js` → `normalizeDialInput()`, `isCorrectNoteNumber()`

---

### Step 3 — Chat with Unknown

Do:

- Let the chat run; select one choice

Say:

> "The chat runner queues steps — typing indicator, delay, bubble. Choices echo back into the log so the player sees what they said. Each choice adjusts trust in localStorage. Because the Coat was visited earlier, watch for the extra conditional line from Unknown."

Point to:

- `signal-9/js/chat.js` → `runScript()`
- `signal-9/js/state.js` → `addTrust()`

---

### Step 4 — Signal decode puzzle (canvas)

Do:

- Drag the slider from 0 toward 100%

Say:

> "At the end of the Night 1 conversation, Unknown sends a corrupted image. The canvas puzzle blends a procedural noise layer over the hidden image in real time — the slider controls noise opacity. The image resolves as signal clarity increases. Completing it awards clue 1, idempotent — replaying Night 1 will not award it a second time."

Point to:

- `signal-9/js/signalPuzzle.js`
- `signal-9/js/night1.js` → `startSignalDecode()`, `tryAwardClue("signal1")`

---

### Step 5 — Scene transition to Night 2

Do:

- Click "Continue"

Say:

> "Watch the transition: the eyelids animate closed, text appears — 'Night One ends. The signal holds.' — then navigation to Night 2, where the eyelids open slowly. Night 1 blinks to communicate disorientation. Night 2 opens smoothly — the player is now more aware."

Point to:

- `signal-9/js/night1.js` → `$("btnNight2").addEventListener`
- `signal-9/css/night.css` → `@keyframes eyeLidTopOpen`, `#transitionText`

---

### Step 6 — Night 2 apps

Do:

- Open Photos, Notes, Browser, Voicemail in turn

Say:

> "Photos — corrupted memories of March 3rd, a blurred image that partially resolves on tap. Notes — a to-do list that will not be completed, a draft. Browser — search history from the final day: library hours, a park bench, can you hear a phone ring through a door. Voicemail — copy switches at trust threshold T ≥ 5. If it is locked here, that is by design."

---

### Step 7 — Memory ordering

Do:

- Drag cards into the correct order → Lock order

Say:

> "The memory drag uses jQuery UI sortable. Four cards, four timestamps from March 3rd. Correct order fills slot 5 with one word: 'rest'. Clue 2 is awarded, idempotent."

Point to:

- `signal-9/js/night2.js` → `initMemory()`, `tryAwardClue("memory")`

---

### Step 8 — Chat, free-text, hidden thread

Do:

- Select a choice in the chat
- Type a free-text reply and press Enter

Say:

> "After the memory puzzle, Unknown returns to chat. The free-text reply is keyword-matched — sorry, love, afraid — to determine Unknown's response. The phrase is stored in localStorage and can reappear verbatim in the NOT YET ending."

Do:

- Open Notes → tap "Drafts — 3 unsent"

Say:

> "Inside Notes there is an archived thread. Inside Browser there is a draft sync thread. Both reveal the same discovery: messages sent from the player's own number in the last hour that were never delivered. They say goodbye without using the word. Finding the thread awards clue 3. Because both entry points call the same idempotent `tryAwardClue('hidden')`, the clue fires exactly once regardless of which app the player opens first."

Point to:

- `signal-9/js/night2.js` → `renderApp("notes")`, `renderApp("browser")`
- `signal-9/js/state.js` → `tryAwardClue("hidden")`, `getDoneHidden()`

---

### Close (30 seconds)

Say:

> "Week 9 demonstrates all core systems: a complete Night 1 loop with visual object exploration, lightbox zoom, the eyelid scene transition, dial validation, a reusable chat runner, and a canvas puzzle — plus a full Night 2 slice covering apps, memory ordering, free-text chat, and the hidden thread. State persists and milestones are idempotent across both nights. Night 3 — heartbeat puzzle, timed chat, word bank, and three branching endings — is scoped for Week 11."

---

## 4. File map

| File | Purpose |
|---|---|
| `signal-9/index.html` | Entry point; resets state; 4 prologue slides |
| `signal-9/night1.html` | Night 1 UI: explore scene, dial pad, phone screen, signal panel |
| `signal-9/night2.html` | Night 2 UI: app grid, app layer, memory phase, chat phase |
| `signal-9/js/night1.js` | Hotspots, lore, wakeup sequence, lightbox, dial, chat N1, signal decode, transition |
| `signal-9/js/night2.js` | Apps, memory ordering, chat N2, free-text, hidden thread |
| `signal-9/js/chat.js` | Reusable chat engine (step queue runner) |
| `signal-9/js/state.js` | Trust, clues, 4 milestone flags, phrases, normalizeDialInput, getFinalWords |
| `signal-9/js/signalPuzzle.js` | Canvas noise/reveal puzzle |
| `signal-9/js/audio.js` | Rain loop, notification, typing tick |
| `signal-9/css/night.css` | Hotspot positions, overlays, eyelid animations, lightbox, transition text |
| `signal-9/css/phone.css` | Phone frame, chat bubbles, choices, typing indicator |
| `signal-9/assets/images/night1/` | 5 hotspot object images |

---

## 5. Q&A bank

### Design / Interface

**Q: What design elements are complete at Week 9?**
A: A full Night 1 visual loop — bedroom with 5 interactive objects, lightbox zoom on click, eyelid wakeup animation, dial pad, chat UI, canvas puzzle panel — plus a full Night 2 slice with app grid, memory ordering, and hidden thread UI. All styled consistently on the phone theme.

**Q: Why use a phone UI instead of a traditional game interface?**
A: The story is about communication and absence. A phone UI makes "Unknown" a believable contact and the interactions feel diegetic — the player is not a character controlling a character, they are the character using their own phone. The UI supports the emotional stakes directly.

**Q: Why do objects in Night 1 use a lightbox instead of a text-only overlay?**
A: Showing the actual image of the object as it zooms from its position to centre reinforces the tactile metaphor — the player is picking it up and examining it. A text-only overlay removes the player from the space; the lightbox keeps them in it.

**Q: Why are the eyelids two separate divs instead of a single opacity overlay?**
A: A single opacity fade communicates nothing about *why* the screen goes dark. Two vertical strips that slide apart like eyelids communicate a physical action — waking up, opening eyes — without any text. The different behaviours (three blinks vs. single slow open) between Night 1 and Night 2 communicate a change in the player's state of consciousness.

**Q: Why does Night 1 blink three times but Night 2 opens smoothly?**
A: Night 1 represents waking up disoriented — the multiple blinks communicate the body's struggle to stay awake. Night 2 represents a more deliberate awareness after having revisited the events of March 3rd. The easing and timing were tuned to feel distinct.

---

### Coding / Architecture

**Q: How does the lightbox zoom work technically?**
A: `showLightbox(id, hotspotEl)` calls `hotspotEl.getBoundingClientRect()` to get the hotspot's position on screen. It calculates the offset from the viewport centre, sets the lightbox inner element's `transform` to position it at the hotspot's location and scale it down to the hotspot's apparent size, then forces a reflow by reading `lb.offsetWidth` before adding a CSS transition and setting `transform` to its final centred state. The browser interpolates the full animation.

**Q: How do you prevent replaying Night 1 from awarding clue 1 twice?**
A: `tryAwardClue("signal1")` in `state.js` checks `getDoneSignal1()` first. If the flag is already set in localStorage, the function returns `false` immediately without modifying any state. The same idempotent pattern applies to all four milestones.

**Q: The hidden thread can be found in both Notes and Browser. How do you make sure clue 3 is only awarded once?**
A: Both `renderApp("notes")` and `renderApp("browser")` call `tryAwardClue("hidden")`. Since `tryAwardClue` is idempotent — it checks the `doneHidden` flag first — the award fires on whichever app the player opens first. If they then open the other app, the thread is already shown in expanded state (because `getDoneHidden()` returns `true`), but no second clue is awarded.

**Q: How does `normalizeDialInput` work and why does it matter?**
A: It applies `.replace(/\D/g, "")` to strip every non-digit character. This means a player can type "0427 318 247" (with spaces) or "0427-318-247" and still match the canonical `NOTE_PHONE_DIGITS = "0427318247"`. Without this, any formatting variation would silently fail.

**Q: Why is `signal3` already in state.js if Night 3 is not built yet?**
A: The milestone system is designed so that each night adds one entry without changing existing code. Stubbing `signal3` now means that when Night 3 is built, `tryAwardClue("signal3")` and `resetGame()` already handle it correctly. It also means the comment "covers all four milestones" is accurate during the Week 9 presentation — the architecture is visible even if the content is not.

**Q: What is `getFinalWords()` used for?**
A: It returns the first phrase stored by the player's free-text input in Night 2, or a fallback of "still here". Ending pages call `SignalLostState.getFinalWords()` to echo the player's own words back to them — a narrative payoff where the game remembers what the player said and uses it in the ending. `ending.js` references this function.

**Q: How does the chat runner work?**
A: `SignalLostChat.runScript(steps, opts)` takes an array of step objects and executes them one at a time. Unknown steps show a typing indicator for a random delay (scaled by `getDelayMul()`), then append a bubble and move to the next step. Choice steps render buttons; when one is picked, the choice echoes as a player bubble, trust is updated, buttons are cleared, and the next step begins. The engine is never rewritten per night — only the script array and pacing multiplier change.

**Q: Why canvas for the signal puzzle instead of a CSS transition or image swap?**
A: Canvas gives precise real-time control over pixel blending — the noise layer can be drawn at any opacity in a single `drawImage` call, and the reveal is smooth at any slider position. An image swap would show a binary transition (noisy → clear). A CSS opacity fade would not blend the two layers. The canvas approach is more technically interesting and more thematically appropriate to the idea of "tuning a signal".

---

### Process / Progress

**Q: How is the project structured and why vanilla JS?**
A: All three nights are separate HTML pages sharing the same JS modules and CSS files. No build tools, no bundler, no framework. This keeps the demo reliable (open a file, it works), keeps the code readable during review, and demonstrates direct browser API knowledge.

**Q: What are your next steps after the Week 9 feedback?**
A: Night 3 — heartbeat puzzle, timed chat, word bank. Then ending routing: three paths (SIGNAL FOUND / NOT YET / STATIC) based on final trust and clue count. Final polish across all nights.

---

## 6. Week 9 confirmed claims

- Complete Night 1 loop: prologue → wakeup animation → 5 visual objects + lightbox → dial pad → chat with Unknown → canvas puzzle
- Complete Night 2 loop: eyelid transition with interstitial → apps (4) → memory drag → chat → free-text → hidden thread
- Reusable chat engine across both nights
- 4-milestone idempotent state system (signal1, memory, hidden, signal3 stub)
- Persistent trust, clues, and phrase array in localStorage
- CSS specificity bug diagnosed and resolved in production code
- Eyelid animation system with two distinct behaviours for Night 1 and Night 2

---

## 7. Planned for Week 11

- Night 3: heartbeat canvas puzzle, timed chat, word bank interaction
- Ending router: trust threshold + clue count → three ending paths
- SIGNAL FOUND, NOT YET, STATIC ending pages with narrative payoff
- `tryAwardClue("signal3")` wired to Night 3 completion
- `getFinalWords()` and `getPhrases()` used in ending text
