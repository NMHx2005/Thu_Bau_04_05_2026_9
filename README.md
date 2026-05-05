# SIGNAL LOST — Project README

Interactive narrative thriller played in the browser as a sequence of HTML pages. State persists in **`localStorage`**. This document focuses on **how the script is presented** to the player: structure, voice, branching, and mechanical coupling to trust/clues/endings.

---

## 1. How to run

- Serve the `signal-lost/` folder over **HTTP(S)** (recommended), or open `index.html` via a local static server, so `fetch`/audio decoding behave consistently.
- Entry point: **`index.html`** (prologue). The prologue calls **`SignalLostState.resetGame()`** on load, clearing a full playthrough’s flags.

---

## 2. High-level story arc

| Phase | Page | Role in the script |
|--------|------|---------------------|
| Prologue | `index.html` | Four short beats: darkness → familiar light → wrong rain → title **SIGNAL LOST**. Resets save. |
| Night 1 | `night1.html` | Bedroom exploration, dial **Unknown**, scripted chat, **signal decode** image (last location vs bedroom). |
| Night 2 | `night2.html` | Phone **apps**, **memory** timeline sort, chat + **free-text** reply, **hidden unsent thread** inside Notes/Browser. |
| Night 3 | `night3.html` | UI softening, **heartbeat** minigame, **timed** chat, **reveal** monologue, **word bank** sentence, **ending router**. |
| Endings | `ending-found.html` / `ending-static.html` / `ending-notyet.html` | Payoffs keyed to **trust (T)** and **clues (C)** plus NOT YET round state. |

**Guards (no night-skipping):** `night2.html` requires Night 1 signal completion; `night3.html` requires the hidden thread to have been opened in Night 2.

---

## 3. Script presentation systems

### 3.1 Chat runner (`js/chat.js`)

- **`SignalLostChat.runScript(steps, opts)`** queues steps: **`unknown`** (typing delay + bubble), **`player`**, **`choices`** (buttons that echo to log and may **`addTrust`**), **`wait`**.
- Pacing multiplier: **`getDelayMul()`** (e.g. `1.14` Night 1, `1.12`–`1.22` Night 2 timed block, `1.65` Night 3 reveal).

### 3.2 Voice: “Unknown”

- Presents as a phone contact **Unknown** across nights.
- Night 3: header can soften to symbol **`▣`** (`NIGHT3_CONTACT_SYMBOL` in `js/state.js`) after a timed soften loop.

### 3.3 Trust and clues (`js/state.js`)

- **Trust `T`:** integer **0–10**, changed by choice **`trust`** deltas in chat.
- **Clues `C`:** integer **0–4**, incremented once per puzzle milestone via **`tryAwardClue(kind)`**:
  - **`signal1`** — Night 1 decode complete  
  - **`memory`** — Night 2 memory order correct  
  - **`hidden`** — first open of archived thread in Notes/Browser  
  - **`signal3`** — Night 3 heartbeat puzzle complete  
- **Voicemail app (Night 2):** copy switches when **`T >= 5`** (`VOICEMAIL_TRUST_THRESHOLD`); full voicemail **audio** is reserved for **SIGNAL FOUND** ending.

### 3.4 Player-authored text

- **Night 2:** one line of free input (Enter); stored in **`phrases`**; keyword-tuned UNKNOWN reply (`sorry` / `love` / `afraid|scared` / default).
- **Night 3:** word tokens assembled into **`finalWords`**, shown on the finisher overlay and echoed on some endings.

### 3.5 Ending router (Night 3)

After **Done** on the word puzzle and **Continue** on the overlay:

| Condition | Page |
|-----------|------|
| `T >= 7` **and** `C >= 3` | `ending-found.html` |
| `T >= 4` **or** `C >= 2` | `ending-static.html` |
| else | `ending-notyet.html` |

**NOT YET:** two-step UX; **`notYetRound`** tracks first vs second pass. Second pass steers copy toward **STATIC** (see `ending-notyet.html` and `QA.txt`).

---

## 4. Night-by-night script content

### 4.1 Prologue (`index.html`)

Exact slide strings (in order):

1. *Dark. Then: a rectangle of light.*  
2. *Something familiar wakes before you do. A rectangle of light in a room you cannot name.*  
3. *The rain is wrong—too steady, too close. The phone does not care. It only waits.*  
4. *SIGNAL LOST*

### 4.2 Night 1 — exploration lore (`js/night1.js`)

Hotspots (`data-id` → short prose):

| ID | Narrative function |
|----|---------------------|
| `laptop` | Unsent draft, cursor, forgotten password. |
| `window` | Rain on glass; **no reflection** — planted “mirror” clue. |
| `note` | Smudged number **0427 318 247** (canonical dial). |
| `photo` | Almost-recognisable face, warm frame. |
| `coat` | Weight, shoulders, heat — seeds **conditional chat** if visited before the call. |

All **five** hotspots must be read before **Continue** unlocks the dial phase.

### 4.3 Night 1 — dial and wrong numbers

- Correct number (digits only): **`0427318247`** (`NOTE_PHONE_DIGITS`).
- Wrong call: one of three paraphrased outcomes (busy tone copy + optional beeps, heavy silence, or voicemail “Later.”).

### 4.4 Night 1 — phone chat (scripted)

Linear queue with **two** choice rounds, optional **coat** beat, then a **three-option** “planted clues” round (time / window / send), then image send line:

- Opening: waiting; unfinished sentence.  
- Choices: listening / riddles / ellipsis.  
- UNKNOWN: coat by door, warmth, unnamed weight.  
- Choices: how do you know / remember weight / say something useful.  
- **If `visited.coat`:** extra bubble — UNKNOWN claims not to guess the room, only what was **carried out**.  
- Choices: **Why 2:47?** / **Window shows no reflection** / **Send what you have** (all `trust: 0`).  
- UNKNOWN: **2:47** as stalled moment before admission; **glass without reflection**; then **picture** line leading to decode UI.

**Pacing:** `getDelayMul` **1.14**. Rain fades when leaving for Night 2 after decode.

### 4.5 Night 1 — signal decode

- Primary image: **`assets/images/LastLocation.png`** (“last place before bedroom,” aligned with Night 2 browser history).  
- Fallback: **`assets/images/Bedroom.png`**.  
- On 100% decode: **`tryAwardClue('signal1')`**, then button to Night 2.

### 4.6 Night 2 — apps copy

- **Photos:** March 3rd corruption, blurred bedroom image, tap-to-slightly-resolve.  
- **Notes:** to-do list, draft line about disappearing mid-sentence, hint about **SIM archive**, button **Open archived thread**.  
- **Browser:** search history (library hours, **park bench**, phone through door), **draft sync** hint, **Open draft sync thread**.  
- **Voicemail:** locked vs “one unheard message” copy per trust threshold (no playable clip here).

### 4.7 Night 2 — memory

Four cards (random order): library arrival → locked room → figure → leave. Correct order fills slot text **`rest.`** (tie-in to proposal language), awards **`tryAwardClue('memory')`**, then transitions to chat.

### 4.8 Night 2 — chat part 1

- UNKNOWN: proof in wrong places; human “receipts.”  
- Choices: still here (+2) / prove it (−2) / without theatre (0).  
- UNKNOWN: library closed, stayed anyway — **hunger**.  
- Prompt: **type** what you would have sent; **Enter** locks input and triggers keyword reply, then part 2.

### 4.9 Night 2 — chat part 2 and thread

- UNKNOWN: **unsent thread** from own number; directions **Notes → archived** or **Browser → draft sync**; short **wait**.  
- UI returns to **Apps**; banner explains **Continue to Night 3** unlocks after thread is found; **thread** body replaces app body on button click; **`tryAwardClue('hidden')`** once.

**Thread body (in-app):** header “Your number — unsent”; three short texts; line that **none** left the phone; closing line that the **line kept them** anyway.

### 4.10 Night 3 — heartbeat → timed chat

- Heartbeat canvas puzzle; on success **`tryAwardClue('signal3')`**.  
- 20s timer; script: soften edges / not stranger; timer as “width of honesty”; choices **I hear you** (+2) / **don’t believe** (−2) / ellipsis (0). Completing choices ends timer block early; at 0s player bubble **…** then reveal.

### 4.11 Night 3 — reveal

Three UNKNOWN beats: memory vs **what you wanted to say**; voice as **part of you** that learned gentleness; **interface** vs forgiveness before a “clean ending.”

### 4.12 Night 3 — word bank

Tokens: `I`, `needed`, `to`, `say`, `that`, `it`, `was`, `love`, `sorry`, `home`, `wait`, `enough` — assembled into **`finalWords`** for endings overlay.

### 4.13 Endings (presentation)

- **FOUND:** reads final line + voicemail sequence via **`SignalLostAudio.playEndingFoundSequence`**, then light visual shift.  
- **STATIC:** **`playEndingStaticProfile`** (low tone + master fade) + existing tape fade CSS.  
- **NOT YET:** explicit copy about rounds and routing to STATIC; **`playEndingNotYetPing`**.

---

## 5. Audio presentation (`js/audio.js`)

- **Web Audio:** separate **`ambientGain`** (rain), **`sfxGain`** (notification, typing, synth fallbacks), **`voiceGain`** (voicemail element via `MediaElementSource` when allowed).  
- **Rain:** starts Night 1; **`fadeRainOut`** on exit to Night 2 and at Night 3 boot.  
- **Night level** scales notification loudness in later nights.

Asset filenames: see **`ATTRIBUTION.txt`**.

---

## 6. Key source map

| Area | Files |
|------|--------|
| State | `js/state.js` |
| Chat | `js/chat.js` |
| Puzzles | `js/signalPuzzle.js` |
| Audio | `js/audio.js` |
| Nights | `js/night1.js`, `js/night2.js`, `js/night3.js` |
| Ending helpers | `js/ending.js` + inline scripts in ending HTML |
| Styles | `css/*.css` (incl. `jquery-overrides.css` on Night 2) |
| QA matrix | `QA.txt` |

---

## 7. Related docs

- **`QA.txt`** — trust/clue matrix, guards, idempotency, NOT YET steps.  
- **`HUONG_DAN_TEST_TOAN_BO.md`** — full Vietnamese walkthrough for manual testing.
