# SIGNAL LOST. Complete Project Documentation

This document covers the **full project scope**: Prologue, Night 1, Night 2, Night 3, and the three-branch ending system. It replaces the earlier Week 9 checkpoint document (50%).

---

## Full Scope

| Phase | Status |
|---|---|
| Prologue (4 slides, state reset) | Complete |
| Night 1. Exploration + dial + chat + signal decode | Complete |
| Night 2. Apps + memory drag + chat + free-text + hidden thread | Complete |
| Night 3. Heartbeat puzzle + timed chat + reveal + word bank | Complete |
| Ending routing (SIGNAL FOUND / NOT YET / STATIC) | Complete |
| Game frame (1200px 16:9 viewport, centered) | Complete |
| Dial decoy mechanic (wrong hint first, vibrate, then correct) | Complete |

---

## 1. Project Overview

**SIGNAL LOST** is an interactive narrative game that runs entirely in the browser, presented through a **simulated phone interface**. There is no traditional game HUD. The story about identity, memory, and things left unsaid is told through:

- Chat with a contact named "Unknown"
- Environmental hotspots as point-and-click exploration
- Mini-puzzles that double as narrative devices
- Persistent state carrying player choices across pages

Built with vanilla HTML, CSS, and JavaScript. No framework, no build tool.

---

## 2. Full Game Flow

```
index.html (Prologue, reset state)
  |
night1.html
  Explore room → dial pad (decoy number → vibrate → correct number) → chat → signal decode
  |
night2.html
  Apps (Photos / Notes / Browser / Voicemail) → memory drag → chat → free-text → hidden thread
  |
continue-to-night3.html (gate, requires hidden thread)
  |
night3.html
  Heartbeat puzzle → timed chat → reveal chat → word bank → routing button
  |
ending-shell.html?outcome=found|static|notyet
```

---

## 3. Night 1. Bedroom Exploration

### 3.1. Wakeup sequence

When `night1.html` loads, two black strips (`#eyeLidTop`, `#eyeLidBottom`) cover the screen. They animate as eyelids: blinking three times then opening fully over 2.8 seconds. After they open, `runWakeupSequence()` fades in each object image in staggered intervals (400ms apart) in order: window, photo, laptop, coat, note.

This communicates "the player just woke up" without a single word.

**Code:** `signal-9/js/night1.js` → `runWakeupSequence()`

### 3.2. Five hotspot objects

| Object | Title | Story role |
|---|---|---|
| Laptop | The Unsent Draft | A half-written message, cursor still blinking |
| Window | No Reflection | No reflection in the glass. A planted clue about identity |
| Note | The Number | Phone number 0427 318 247, slightly smudged |
| Photo | The Photograph | A face almost recognisable, never completely |
| Coat | Still Warm | Still warm by the door. If visited before the call, Unknown references it in chat |

All five must be opened to unlock the "Continue to Dial" button. This gating is intentional: the player must experience the space before reaching out.

**Code:** `signal-9/js/night1.js` → `var LORE`, `initExplore()`

### 3.3. Shared-element lightbox zoom

Clicking a hotspot opens a lightbox that **zooms from the object's position to the center of the screen** rather than fading in from nowhere. Technique:

1. `hotspotEl.getBoundingClientRect()` reads the current screen position
2. Compute offset from viewport center: `originX = rect.left + rect.width/2 - vw/2`
3. Set `transform: translate(originX, originY) scale(scaleStart)` without transition
4. Force reflow via `lb.offsetWidth`
5. Re-add transition and set `transform: translate(0,0) scale(1)` — the browser interpolates

**Code:** `signal-9/js/night1.js` → `showLightbox()`, `closeLightbox()`

---

## 4. Night 1. Dial Pad and Decoy Mechanic

### 4.1. The decoy mechanic (wrong hint on first visit)

This is the most recent mechanic: the hint number shown below the dial pad is **not the correct number** on the first visit.

**Step-by-step:**

**On first page load:** `buildDecoyDigits()` creates a decoy by incrementing the last digit by 1 (mod 10). For example, if the correct number is `0427318247`, the decoy is `0427318248`. The hint displays `0427 318 248`.

**Player dials the decoy:** The `dialCall` handler checks: if the decoy has not yet been passed (`!dialDecoyPassed()`) and the input equals the decoy, it calls `onDecoyDialComplete()`:
- `shakeDialPad()` adds class `dial-shake` to `.dial-pad` → CSS animation shakes it horizontally
- `navigator.vibrate([40, 30, 40, 30, 55])` if the browser supports it
- Two low-frequency tones via `SignalLostAudio.playTone()`
- Shows overlay: "Wrong line. The handset trembles. Read the note again, then dial."
- Clears the dial display, **updates the hint to the correct number** `0427 318 247`
- Stores `sessionStorage.signalLost_dialDecoyPassed = "1"`

**Player dials the correct number:** `isCorrectNoteNumber()` matches → opens `phase-phone`, starts Night 1 chat.

**Player dials any other number:** `wrongNumberResponse()` as before (busy tone / silence / voicemail).

**After refresh:** `sessionStorage` persists within the session. If the player already triggered the shake, the hint shows the correct number immediately.

```
First visit:    hint = "0427 318 248"  (one digit off)
Dial decoy →    SHAKE + overlay "Wrong line"
                hint updates to "0427 318 247"  (correct)
Dial correct →  enter chat
```

**Code:** `signal-9/js/night1.js` → `buildDecoyDigits()`, `dialDecoyPassed()`, `onDecoyDialComplete()`, `shakeDialPad()`
**CSS animation:** `signal-9/css/animations.css` → `@keyframes dial-shake`, `.dial-pad.dial-shake`

### 4.2. Input normalisation

`normalizeDial(s)` strips all non-digit characters. A player can type `"0427 318 247"` or `"0427-318-247"` and it still matches. Without normalisation, any formatting variant would silently fail.

**Code:** `signal-9/js/night1.js` → `normalizeDial()`, `signal-9/js/state.js` → `isCorrectNoteNumber()`

---

## 5. Night 1. Chat with Unknown

Chat runner `SignalLostChat.runScript()` executes a step array sequentially:

- `{ type: "unknown", text }` — typing indicator → delay → bubble
- `{ type: "player", text }` — player bubble immediately
- `{ type: "choices", options }` — render buttons; on choice: echo bubble, call `addTrust(delta)`, clear buttons
- `{ type: "wait", ms }` — pause

**Night 1 script includes:**
1. Unknown opens: "I've been waiting for you to call."
2. Choice 1: "I'm listening." (+1) / "Stop talking in riddles." (-1) / "…" (0)
3. Unknown references the coat
4. Choice 2 about the coat (+1/-1/0)
5. **Conditional beat:** if `visited.coat === true`, Unknown says "You already touched the coat."
6. Choice 3: about 2:47 / no reflection / send what you have
7. Unknown sends a corrupted image → opens signal panel

**Code:** `signal-9/js/night1.js` → `startNight1Chat()`

---

## 6. Night 1. Signal Decode Puzzle

`SignalLostSignalPuzzle.initDecode()` creates a canvas that blends noise over a hidden image:

- `LastLocation.png` (fallback `Bedroom.png`) drawn on canvas
- Procedural noise layer drawn on top at opacity controlled by a slider
- Slider maps linearly: 0 = maximum noise, 1 = fully clear image
- At 100%: `onComplete()` calls `tryAwardClue("signal1")` idempotently → clue 1

After completion the "Continue to Night 2" button appears.

**Code:** `signal-9/js/signalPuzzle.js`, `signal-9/js/night1.js` → `startSignalDecode()`

---

## 7. Transition Night 1 → Night 2

1. Eyelids animate **closed** over 0.55s (ease-in)
2. `#transitionText` appears: "Night One ends." then "The signal holds."
3. Rain audio fades out
4. Navigate to `night2.html`
5. Night 2 starts with closed eyelids, which animate **open slowly** over 2.2s (ease-out, once, no blinking)

Night 1 **blinks three times** = disoriented waking. Night 2 **opens once, slowly** = deliberate, more conscious. The difference is intentional.

**Code:** `signal-9/js/night1.js` → `$("btnNight2").addEventListener`, `signal-9/css/night.css` → `@keyframes eyeLid*`

---

## 8. Night 2. Four Apps

Night 2 shows the phone's home screen with four apps. Each opens a scrollable layer inside the phone frame.

| App | Content |
|---|---|
| Photos | Corrupted camera roll from March 3. Blurred images become slightly clearer on touch |
| Notes | A to-do list that won't be completed. A draft. "Drafts, 3 unsent" reveals the hidden thread |
| Browser | Last-day search history: library hours, park bench, listening through the door. "Draft sync, 3 pending" reveals the hidden thread |
| Voicemail | Locked until trust T ≥ 5. At T ≥ 5 shows "one unheard message" |

**Code:** `signal-9/js/night2.js` → `renderApp(name)`

---

## 9. Night 2. Memory Drag

jQuery UI sortable. Four memory cards with timestamps from March 3. A fifth slot always showing "what happened next." When the player locks the correct order, Unknown fills slot 5 with the word **rest** → `tryAwardClue("memory")` → clue 2.

**Code:** `signal-9/js/night2.js` → `initMemory()`

---

## 10. Night 2. Chat and Free-Text

After the memory puzzle, Unknown returns to chat. Then a free-text input:

- Input is lowercased and checked against keywords: `"sorry"`, `"love"`, `"afraid"/"scared"`, with a default fallback
- The exact phrase is stored via `addPhrase(raw)` in localStorage (deduped array)
- `getFinalWords()` returns the first stored phrase — used by ending pages

**Code:** `signal-9/js/night2.js` → `initFreeInput()`, `signal-9/js/state.js` → `addPhrase()`, `getFinalWords()`

---

## 11. Night 2. Hidden Thread

Both Notes and Browser contain an expandable section. On tap:
- Three right-aligned message bubbles appear — from the player's own number
- All marked "Not delivered" or "Send failed"
- These messages say goodbye without using the word
- `tryAwardClue("hidden")` → clue 3, idempotent

**Why idempotency matters here:** Both apps call the same `tryAwardClue("hidden")`. Regardless of which app the player opens first, the clue awards exactly once. Both also check `getDoneHidden()` on render to show the thread in its expanded state if already discovered.

**`getDoneHidden()` is also the unlock condition for Night 3.** No hidden thread discovery means no Night 3 access.

**Code:** `signal-9/js/night2.js` → `renderApp("notes")`, `renderApp("browser")`

---

## 12. Gate to Night 3

`continue-to-night3.html` checks `canEnterNight3()` (= `getDoneHidden()`):
- True: shows "Enter Night 3" button
- False: displays locked message, hints at finding the hidden thread

`night3.html` also self-checks at the top of its script — if the condition is not met, it redirects back to `night2.html`.

---

## 13. Night 3. Heartbeat Puzzle

Canvas heartbeat (`SignalLostSignalPuzzle.initHeartbeat()`):
- Draws a continuous heartbeat waveform on canvas
- Player must click the correct wave peaks
- Requires 3 locked peaks (`locksNeeded: 3`)
- On completion: `tryAwardClue("signal3")` → clue 4, then transitions to timed chat

**Code:** `signal-9/js/signalPuzzle.js`, `signal-9/js/night3.js` → `startHeartbeat()`

---

## 14. Night 3. Soften Loop

A `setInterval` running from Night 3 boot:

| Step (every 4.5s) | Effect |
|---|---|
| Step 4 | Contact name changes to the symbol `▣` |
| Step 6+ | Phone screen gains class `phone-screen--soften` (subtle visual softening) |

This communicates that the boundary between the player and Unknown is dissolving.

**Code:** `signal-9/js/night3.js` → `startSoftenLoop()`

---

## 15. Night 3. Timed Chat (20 seconds)

A 20-second countdown timer. Two lines from Unknown, then choices:

- "I hear you." (+2 trust)
- "I don't believe you." (-2 trust)
- "…" (0 trust)

If time runs out before a choice: the game appends "…" to the log and proceeds automatically.

**Why a timer:** The timer isn't a punishment. It represents "the width of the honesty the player will permit before flinching back into habit."

**Code:** `signal-9/js/night3.js` → `startTimedChat()`

---

## 16. Night 3. Reveal Chat

Three lines from Unknown at the slowest pacing (delay mul 1.65):

1. "You're not trying to remember who you are. You're trying to remember what you wanted to say before you couldn't."
2. "The voice you flinch from isn't a stranger on the line. It's the part of you that learned to speak gently so no one would leave."
3. "If you want a clean ending, you'll have to stop asking the interface to forgive you first."

After completion, the word bank loads automatically.

**Code:** `signal-9/js/night3.js` → `beginReveal()`

---

## 17. Night 3. Word Bank

The player assembles a sentence from tokens:

```
I / needed / to / say / that / it / was / love / sorry / home / wait / enough
```

- Tapping a token appends it to the sentence being built
- `#wordBuilt` shows the sentence + "…"
- "Done" button: calls `setFinalWords(line)` → stores in `localStorage.signalLost_finalWords`
- `#finOverlay` reveals the assembled sentence and the "Reveal ending" button

**Code:** `signal-9/js/night3.js` → `startWords()`

---

## 18. Ending Routing. Why Each Ending Is Reached

This is the most important design section. When the player clicks "Reveal ending" in the word bank:

```javascript
var T = window.SignalLostState.getTrust();
var C = window.SignalLostState.getClues();
var outcome = "notyet";
if (T >= 7 && C >= 3) outcome = "found";
else if (T >= 4 || C >= 2) outcome = "static";
window.location.href = "ending-shell.html?outcome=" + outcome;
```

### Trust score (T)

Trust accumulates through every choice made:

| Choice | Value |
|---|---|
| Night 1 chat, positive choice (e.g. "I'm listening.") | +1 |
| Night 1 chat, negative choice (e.g. "Stop talking in riddles.") | -1 |
| Night 1 chat, neutral ("…") | 0 |
| Night 3 chat, "I hear you." | +2 |
| Night 3 chat, "I don't believe you." | -2 |
| Night 3 chat, "…" or timer runs out | 0 |
| Trust floor / ceiling | 0 / 10 |

Night 1 has 3 choices (max +3). Night 2 has 1 choice (max +2). Night 3 has 1 choice (max +2). **The exact maximum is 7.** SIGNAL FOUND requires perfect play across all three nights: every positive choice in every chat.

### Clue count (C)

| Clue | Condition |
|---|---|
| clue 1 (signal1) | Complete Night 1 canvas decode puzzle |
| clue 2 (memory) | Complete Night 2 memory drag in correct order |
| clue 3 (hidden) | Discover hidden thread in Notes or Browser |
| clue 4 (signal3) | Complete Night 3 heartbeat puzzle |
| Maximum total | 4 |

---

### The three outcomes and when each is reached

#### SIGNAL FOUND (T ≥ 7 **AND** C ≥ 3)

**Condition:** both must be true — high trust **and** at least 3 of 4 clues collected.

**Narrative meaning:** The player engaged fully with Unknown (trust) and explored enough of the story's terrain (clues). This is not just "choosing correctly" — it is the player having genuinely opened themselves to the experience.

**Why AND, not OR:** High trust alone is not enough if the player skipped most content. High clues alone are not enough if the player was cold and defensive in chat. Both must be present together.

**Screen:** Black background, white text. Shows the sentence from `readFinalLine()` (the word bank sentence). Line: "they'll hear it. somehow." And: "I love you. Call me back when you can." Background then gradually brightens to `#f5f5f8` — from dark to light.

**Audio:** `playEndingFoundSequence()` — a specific ending audio sequence.

---

#### STATIC (T ≥ 4 **OR** C ≥ 2)

**Condition:** at least one of the two — moderate trust **or** at least 2 clues. This is the middle ground: the player showed up, but not fully open.

**Narrative meaning:** The signal was too weak to be "found" but something was there. The story dissolves into static.

**Screen:** Near-black background (`#0a0a12`), muted text. Single line: "it's okay. they already know." After 2.8s text fades to invisible. After 4.2s background and text both become `#000000` — completely black screen.

**Audio:** `playEndingStaticProfile()` — a static noise profile.

---

#### NOT YET (T < 4 **AND** C < 2)

**Condition:** both are low — the player did not engage or was actively guarded throughout.

**Narrative meaning:** "Not yet" is a valid choice. The game acknowledges it without judgment.

**Two-round mechanism:**

**Round 0 (first visit to NOT YET):**
- Shows: "Not yet is a choice, but the tape remembers how many times you said it."
- Shows the last phrase the player typed in Night 2 (or "the kettle clicking off in an empty kitchen")
- Two buttons: "Stay longer (round 2)" and "Enough (→ STATIC now)"

**If "Stay longer" is chosen:** `setNotYetRound(1)` updates localStorage. Text changes to: "Round 2: choosing 'Not yet again' routes to STATIC, not a punishment, just where weak signal goes." Single button: "Not yet again → STATIC".

**Round 1 (returning to NOT YET after round 1):**
- Shows: "Second pass: you already chose not-yet once. The line won't keep humoring the same dodge."
- Single button: "Let the tape run out (→ STATIC)"

**NOT YET always ends in STATIC.** This is intentional — there is no permanent non-action.

**Audio:** `playEndingNotYetPing()` — a single, simple ping.

---

### Routing summary table

| Trust (T) | Clues (C) | Outcome |
|---|---|---|
| T ≥ 7 **and** C ≥ 3 | | **SIGNAL FOUND** |
| T ≥ 4 **or** C ≥ 2 | | **STATIC** |
| T < 4 **and** C < 2 | | **NOT YET** (→ eventually STATIC) |

*Note: conditions are evaluated in priority order — FOUND checked first, then STATIC, then NOT YET.*

---

### Paths to each ending

**To reach SIGNAL FOUND:**
- Night 1: positive choices across all 3 turns → +3 trust
- Night 1: complete signal decode → clue 1
- Night 2: choose "I'm still here." → +2 trust
- Night 2: complete memory drag → clue 2
- Night 2: find hidden thread → clue 3 (required for Night 3 access)
- Night 3: complete heartbeat → clue 4
- Night 3: choose "I hear you." → +2 trust
- Result: T = 7, C = 4. **Meets both conditions for SIGNAL FOUND.**

SIGNAL FOUND is **fully reachable** but demands perfect play: a positive choice in every single chat across all three nights. One neutral or negative choice means falling below the threshold. This is precise by design.

**To reach STATIC (the most common path):**
- Any player who completes Night 1 + Night 2 + Night 3 will reach STATIC
- Example: T=2, C=3 → `T < 4` but `C >= 2` → STATIC
- Example: T=5, C=4 → `T >= 4` → STATIC

**To reach NOT YET:**
- Negative choices in every chat (Night 1 minimum: -3)
- Skip memory drag, skip hidden thread — but hidden thread is required for Night 3 access
- In practice: completing Night 3 means clue 3 (hidden) was already awarded → C ≥ 1, plus heartbeat → C ≥ 2 → routes to STATIC, not NOT YET
- NOT YET only occurs if the player somehow bypasses Night 3 or in edge cases with extremely low trust and clue counts

---

## 19. State System (localStorage)

| Key | Purpose | Scope |
|---|---|---|
| `signalLost_trust` | Trust score (0–10), clamped | localStorage |
| `signalLost_clues` | Total clues (0–4) | localStorage |
| `signalLost_doneSignal1` | Flag: Night 1 decode complete | localStorage |
| `signalLost_doneMemoryDrag` | Flag: memory drag complete | localStorage |
| `signalLost_doneHidden` | Flag: hidden thread found | localStorage |
| `signalLost_doneSignal3` | Flag: Night 3 heartbeat complete | localStorage |
| `signalLost_phrases` | JSON array of free-text phrases | localStorage |
| `signalLost_finalWords` | Word bank sentence from Night 3 (overrides phrases[0]) | localStorage |
| `signalLost_notYetRound` | NOT YET round (0, 1, or 2) | localStorage |
| `signalLost_dialDecoyPassed` | Whether the Night 1 shake has occurred | **sessionStorage** |

`tryAwardClue(kind)` is idempotent: checks the flag first, returns `false` immediately if already set. Safe to call any number of times.

`resetGame()` removes all localStorage keys. Called by `index.html` on load.

`stateNight3Extend.js` adds `setFinalWords`, `getFinalWords` (override), `getNotYetRound`, `setNotYetRound`, `canEnterNight3`, `NIGHT3_CONTACT_SYMBOL`. Does not modify `state.js`.

**Code:** `signal-9/js/state.js`, `signal-9/js/stateNight3Extend.js`

---

## 20. Game Frame (1200px 16:9 viewport)

`gameFrame.js` wraps all body content in `.game-viewport > .game-viewport__inner`. The frame is 1200px wide with a 16:9 aspect ratio, centered on a dark background. The inner container receives all original body classes.

`fitPhoneInFrame()` scales `.phone-frame` down using `cqh` if it remains too tall.

Linked on all signal-9 HTML pages.

**Code:** `signal-9/js/gameFrame.js`, `signal-9/css/game-frame.css`

---

## 21. Notable Technical Solutions

### CSS specificity bug (caught during development)

The rule:
```css
body.night-bedroom-page > *:not(#finOverlay) {
  position: relative;
  z-index: 1;
}
```
`:not(#finOverlay)` contributes ID-weight specificity → **(1,1,1)**, outranking `#eyeLidTop` at **(1,0,0)** → eyelids became `position: relative` instead of `position: fixed`.

Fix: extend the exclusion list:
```css
body.night-bedroom-page > *:not(#finOverlay):not(#eyeLidTop):not(#eyeLidBottom):not(#transitionText):not(#objLightbox):not(#loreHost) {
  position: relative;
  z-index: 1;
}
```

### Idempotent hidden thread across two app entry points

Both Notes and Browser call `tryAwardClue("hidden")`. Whichever app the player opens first, the clue awards exactly once. Both also check `getDoneHidden()` on render to display the thread in its expanded state if already discovered.

### Canvas noise/reveal (Night 1) vs. canvas heartbeat (Night 3)

Same module `signalPuzzle.js`, two modes:
- `initDecode()`: slider controls noise opacity over an image
- `initHeartbeat()`: draws a continuous waveform, player clicks peaks to lock them

### Dial decoy uses sessionStorage, not localStorage

`sessionStorage` resets when the player opens a new session (new tab or window), so they can experience the decoy mechanic again on a fresh start. But it persists across reloads in the same session, preventing the same player from being surprised twice in the same playthrough. `localStorage` would mean the decoy could only ever trigger once across all playthroughs unless `resetGame()` was called.

---

## 22. Complete File Map

| File | Purpose |
|---|---|
| `index.html` | 4-slide prologue, state reset |
| `night1.html` | Night 1 UI: exploration scene, dial pad, phone screen, signal panel |
| `night2.html` | Night 2 UI: app grid, memory drag, chat |
| `night3.html` | Night 3 UI: heartbeat, timed chat, reveal, word bank |
| `continue-to-night3.html` | Gate: checks Night 3 unlock condition |
| `ending-shell.html` | Single ending router (accepts `?outcome=`) |
| `ending-found.html` | Standalone FOUND ending (legacy) |
| `ending-notyet.html` | Standalone NOT YET ending (legacy) |
| `ending-static.html` | Standalone STATIC ending (legacy) |
| `js/night1.js` | Hotspots, lore, wakeup, lightbox, dial decoy, Night 1 chat, signal decode, transition |
| `js/night2.js` | Apps, memory drag, Night 2 chat, free-text, hidden thread |
| `js/night3.js` | Heartbeat, soften loop, timed chat, reveal, word bank, routing |
| `js/chat.js` | Reusable chat engine (step queue runner) |
| `js/state.js` | Trust, clues, 4 milestone flags, phrases, normalizeDialInput |
| `js/stateNight3Extend.js` | setFinalWords, getFinalWords override, notYetRound, canEnterNight3 |
| `js/audio.js` | Rain loop, typing tick, tone |
| `js/audioNight3Extend.js` | Ending audio sequences (found, static, notyet) |
| `js/signalPuzzle.js` | Canvas decode (Night 1) + canvas heartbeat (Night 3) |
| `js/ending.js` | readFinalLine(), readPhrases() for ending pages |
| `js/gameFrame.js` | 1200px viewport wrap, fitPhone |
| `css/base.css` | CSS variables, reset, phone container |
| `css/phone.css` | Phone frame, chat bubbles, typing indicator |
| `css/night.css` | Hotspots, overlays, eyelids, lightbox, memory cards |
| `css/animations.css` | msg-enter, dial-shake |
| `css/night2-ui.css` | Night 2 back/continue buttons |
| `css/game-frame.css` | 1200px centered viewport frame |

---

## 23. Q&A Bank

### About endings

**Q: Is T ≥ 7 actually reachable? How?**
A: Yes, exactly reachable with perfect play. Night 1 has 3 choice points at max +1 each = +3. Night 2 chat has one choice: "I'm still here." = +2. Night 3 timed chat has one choice: "I hear you." = +2. Total: 3+2+2 = 7. The threshold is not arbitrary — it is the exact ceiling. One non-positive choice anywhere in the game means STATIC instead.

**Q: Is NOT YET a bad ending?**
A: No. The game does not judge. "Not yet" is a valid choice. The two-round system lets the player stay with that feeling rather than being immediately pushed to STATIC. But there is no permanent non-action.

**Q: Why does NOT YET always end in STATIC?**
A: STATIC is a neutral resting state — the signal is too faint for resolution but not completely absent. It is the natural landing point for both "not ready" and "tried but not enough."

**Q: Where does the word bank sentence appear in the ending?**
A: `setFinalWords(line)` stores the sentence in `localStorage.signalLost_finalWords`. The FOUND ending page calls `readFinalLine()` (via `ending.js`) which calls `SignalLostState.getFinalWords()` (overridden in `stateNight3Extend.js`) which returns the word bank sentence. This line is displayed as the main text of the FOUND ending — the game reflecting the player's own words back at them.

### About technical decisions

**Q: Why does the dial decoy use sessionStorage instead of localStorage?**
A: The decoy should reset when a player starts a new session (new browser window or tab), allowing them to experience the mechanic again on a fresh start. Using localStorage would mean the decoy could only ever trigger once across all playthroughs unless `resetGame()` was called.

**Q: Why does Night 3 require `getDoneHidden()` specifically?**
A: The hidden thread is Night 2's most important narrative discovery — it reveals that the player tried to communicate and failed. Night 3 is the consequence of that failure. A player who hasn't discovered that truth should not enter Night 3.

**Q: Why use ending-shell.html instead of three separate ending files?**
A: A single shell ensures `stateNight3Extend.js` and `audioNight3Extend.js` are always loaded before any ending renders. It also simplifies routing: one URL with `?outcome=` rather than three separate navigation targets.

**Q: How does the reusable chat engine work?**
A: `SignalLostChat.runScript(steps, opts)` takes an array of step objects and executes them sequentially. Unknown steps show a typing indicator for a randomised delay (scaled by `getDelayMul()`), then append the bubble and advance. Choice steps render buttons; selecting one echoes the choice as a player bubble, updates trust, removes the buttons, and starts the next step. The engine is never rewritten per night — only the script array and the pacing multiplier change. Night 1 uses 1.14, Night 2 uses 1.12, Night 3 uses 1.22 and 1.65.

**Q: Why use canvas for the signal puzzle instead of a CSS transition or image swap?**
A: Canvas allows precise real-time pixel blending. The noise layer can be drawn at any opacity in a single `drawImage` call, and the reveal is smooth at any slider position. An image swap would produce a binary transition (noisy to clear). A CSS opacity fade would not blend two layers. The canvas approach is both technically interesting and thematically appropriate to the idea of "tuning a signal."

---

## 24. Confirmed Statements (full project)

- Prologue → Night 1 loop → Night 2 loop → Night 3 loop, end-to-end
- 4-milestone idempotent state system across all pages
- Dial decoy mechanic: wrong number first, shake, then correct
- Reusable chat engine with per-night pacing (Night 1 / 2 / 3)
- Three-way ending routing via trust + clue thresholds
- NOT YET two-round mechanism
- Word bank sentence reflected in ending FOUND
- Hidden thread as the Night 3 gate condition
- 1200px 16:9 centered game frame on all pages
- Canvas decode (Night 1) and canvas heartbeat (Night 3) in the same module
- CSS specificity bug diagnosed and fixed in production code
- All em dashes replaced with "." or "," in player-facing copy

---

*Document reflects the state of signal-9/ as of 20 May 2026.*
