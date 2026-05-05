# SIGNAL LOST — Tiến độ Tuần 9 (≈50% dự án final)

Tài liệu này được viết để **đọc lên và thuyết trình trực tiếp** trong buổi demo tuần 9. Mình viết **siêu chi tiết**, bám sát 3 tiêu chí chấm, có **kịch bản demo 5–7 phút**, file-map, và **Q&A** kèm câu trả lời gắn với source.

### Mình sẽ show gì (phạm vi tuần 9)

Đến tuần 9, mình show được khoảng **50% scope của dự án final** (từ `signal-lost/`), thể hiện bằng **Đêm 1 + Đêm 2** trong snapshot này:

- **Explore** căn phòng bằng hotspot (mỗi hotspot mở 1 “lore overlay” ngắn)
- **Dial** số điện thoại (validate input; “wrong number” vẫn có phản hồi narrative)
- **Chat** với “Unknown” (typing/pacing + choices)
- **1 puzzle** (signal decode trên canvas: kéo slider để lộ ảnh)
- **Đêm 2 apps** (Photos/Notes/Browser/Voicemail) + vòng khám phá
- **Đêm 2 memory ordering** (sortable timeline; milestone idempotent)
- **Đêm 2 chat + 1 free-text reply**
- **Lưu state** (trust/clues/flags trong localStorage; milestone idempotent)

### Những thứ chưa show ở tuần 9 (cố ý để tuần sau)

- Hidden thread mechanic của Đêm 2 (nội dung Tuần 11)
- Night 3 climax + puzzle bổ sung
- Ending routing + endgame payoff sequences

Lý do: tuần 9 tập trung chứng minh **core systems** (UI flow + script runner + puzzle integration + state).

---

## 1. Tổng quan dự án (dự án là gì)

**SIGNAL LOST** là game kể chuyện tương tác chạy trên trình duyệt, trình bày theo dạng **UI điện thoại**. Câu chuyện được kể qua:

- **Chat** (nhịp gõ chữ, lựa chọn)
- **Tương tác UI** (hotspot, dial pad)
- **Puzzle** (cơ chế “tín hiệu” gắn chủ đề: mảnh ký ức bị nhiễu)

Tuần 9 mình xây xong “khung xương” để triển khai về sau và demo được mid-game loop:

- **Chat runner** tái sử dụng
- **State tối thiểu nhưng đúng** (trust/clues + 1 milestone)
- **Puzzle canvas** chứng minh khả năng kỹ thuật + đúng vibe
- **Audio tối thiểu** để tạo không khí và feedback

---

## 2. Mapping tiêu chí chấm (rubric) — chi tiết từng ý

### A) Development of graphic/interface/design elements

#### A1) Ý tưởng UI: kể chuyện bằng “phone-like interface” (Đêm 1 + Đêm 2)

Thầy/cô sẽ thấy:

- **Explore scene** với hotspot (giống point-and-click).
- **Dial pad** chuyển cảnh sang **phone chat UI**.
- **Chat log** với header “Unknown”, bubble, choices.
- **Signal panel**: canvas + slider + % “Signal clarity”.

Source liên quan:

- Layout Night 1: `signal-9/night1.html`
- Layout Night 2: `signal-9/night2.html`
- CSS: `signal-9/css/phone.css`, `signal-9/css/night.css`, `signal-9/css/base.css`, `signal-9/css/animations.css`

Cách mình nói khi chỉ vào UI:

- “Mục tiêu thiết kế là người chơi cảm giác đang dùng điện thoại thật, không phải HUD game truyền thống.”
- “Tuần 9 chứng minh UI transition liền mạch qua 2 đêm: explore → dial → chat → puzzle → apps → memory → chat/free-text.”

#### A2) Micro-interactions: hành động nào cũng có feedback

Mình làm:

- Click hotspot → mở **lore overlay** ngắn, click để đóng (nhanh, không làm chậm nhịp).
- Bấm dial pad → display update realtime; delete/call rõ ràng.
- Choice trong chat → hiện button, sau khi chọn thì **echo lại vào chat log** để người chơi thấy “mình đã nói gì”.
- Puzzle slider → update % label và reveal theo thời gian thực.
- Đêm 2: mở/đóng app layer rõ ràng; khám phá đủ app mới được “Continue”.
- Đêm 2: memory ordering drag-and-drop có placeholder/feel đồng nhất palette.

Source:

- Hotspot + overlay: `signal-9/js/night1.js` (`showLore`, `initExplore`)
- Dial pad: `signal-9/js/night1.js` (`initDial`, `renderDial`)
- Chat UI: `signal-9/js/chat.js`
- Puzzle: `signal-9/js/signalPuzzle.js` + `signal-9/js/night1.js`
- Đêm 2 apps/memory/chat: `signal-9/night2.html` + `signal-9/js/night2.js`

Vì sao liên quan rubric:

- Nó thể hiện tư duy UI/UX: người chơi luôn có **tín hiệu phản hồi** cho mỗi hành động, tránh cảm giác “bấm mà không biết có tác dụng không”.

#### A3) Puzzle như một phần của UI kể chuyện (signal decode)

Mô tả puzzle:

- Canvas reveal ảnh dưới lớp noise, điều khiển bởi slider “Signal clarity”.
- Cảm giác “tuning signal” đúng chủ đề hơn là puzzle kiểu toán.

Source:

- `signal-9/js/signalPuzzle.js`
- Gọi puzzle: `signal-9/js/night1.js` (`startSignalDecode`)

Lời thuyết trình gợi ý:

- “Mình chọn puzzle dạng reveal vì SIGNAL LOST nói về việc ‘khôi phục’ mảnh ký ức bị nhiễu.”

---

### B) Development of sophisticated coding solutions to problems

Tuần 9 “sophisticated” nằm ở **kiến trúc và quyết định thiết kế** để scale về sau (chứ không phải số lượng màn chơi).

#### B1) Engine trình bày kịch bản: chat runner tái sử dụng

Vấn đề:

- Mình cần 1 cách chạy dialogue có pacing, choices, và dễ mở rộng sang các night khác.

Giải pháp:

- Xây **runner chạy theo step queue**: đưa vào danh sách step rồi chạy tuần tự.
- Step type (tuần 9): `unknown`, `player`, `choices`, `wait`
- Có pacing multiplier để chỉnh “feel” nhanh/chậm mà không rewrite từng line.

Source:

- `signal-9/js/chat.js`

Câu nói khi bị hỏi:

- “Chat runner là ‘runtime’ của narrative. Tuần 9 chứng minh runner chạy ổn; về sau chỉ thay script/opts.”

#### B2) State persistence + milestone idempotent (tránh cộng điểm 2 lần) (Đêm 1 + Đêm 2)

Vấn đề:

- Reload/replay có thể làm tăng clue nhiều lần nếu không chặn, khiến logic hỏng.

Giải pháp (tuần 9 đủ cho 50%):

- Lưu:
  - **Trust (T)**: tăng/giảm theo choice
  - **Clues (C)**: tăng khi qua mốc lớn
  - **Flag** `doneSignal1`: đánh dấu đã qua puzzle Đêm 1
  - **Flag** `doneMemoryDrag`: đánh dấu đã qua mốc memory Đêm 2
  - **Phrases**: list text (chuẩn bị cho cơ chế text về sau)
- Award clue theo kiểu idempotent:
  - `tryAwardClue("signal1")` trả về false nếu đã done.
  - `tryAwardClue("memory")` trả về false nếu đã done.

Source:

- `signal-9/js/state.js`

Câu nói:

- “Tuần 9 mình giữ state ít nhưng đúng: lưu được, và không bị ‘farm clue’ khi replay.”

#### B3) Validate input ở dial pad + wrong-number vẫn có narrative response

Vấn đề:

- Người chơi có thể nhập ký tự không phải số; cần so sánh digits-only.
- Nếu sai số, vẫn cần phản hồi “diegetic” (đúng vibe), không được im lặng.

Giải pháp:

- Normalize dial input: bỏ ký tự không phải số.
- So sánh với digits chuẩn `NOTE_PHONE_DIGITS`.
- Wrong number có nhiều response (và có thể kèm tone) để vẫn là một “beat” của story.

Source:

- `signal-9/js/state.js` (`normalizeDialInput`, `isCorrectNoteNumber`)
- `signal-9/js/night1.js` (`wrongNumberResponse`)

#### B4) Audio tối thiểu (đủ cho demo, tránh over-scope)

Vấn đề:

- Autoplay policy của browser; audio phải nhẹ, không gây lỗi khi demo.

Giải pháp:

- API audio tối thiểu cho Night 1:
  - `startRainLoop()` (ambient)
  - `playTypingTick()` (feedback)
  - `playNotification()` (cue)
  - `playTone()` (fallback / tone)

Source:

- `signal-9/js/audio.js`

Câu nói:

- “Tuần 9 audio intentionally minimal: phục vụ atmosphere/feedback, không biến demo thành debug session.”

---

### C) Ability to respond to questions about the presented work

Mình chuẩn bị để đáp ứng tiêu chí này:

- **Demo script** có timebox rõ (5–7 phút)
- **File-map** để trỏ code nhanh
- **Q&A bank** dạng “why/how”, mỗi câu trả lời gắn vào file cụ thể

---

## 3. Kịch bản thuyết trình Tuần 9 (5–7 phút)

### 3.1 Mở đầu (30s)

Nói:

- “Đây là checkpoint tuần 9. Em sẽ demo vòng chơi Đêm 1 hoàn chỉnh: UI transitions, chat runner, 1 puzzle, và state persistence.”

Làm:

- Mở `signal-9/index.html`
- Click qua prologue để vào Night 1

### 3.2 Demo theo từng bước (4–5 phút)

#### Bước A — Explore + lore overlay

Làm:

- Click 2–3 hotspot (laptop, window, note…)

Nói:

- “Hotspot mở lore overlay ngắn để xây tone và buộc người chơi tương tác trước khi mở phone.”

Trỏ code:

- `signal-9/js/night1.js` → `initExplore()`, `showLore()`

#### Bước B — Dial pad + validate

Làm:

- Nhập 1 số sai → call → thấy phản hồi
- Nhập đúng số từ note: **0427 318 247** → call

Nói:

- “Em chuẩn hoá input về digits-only. Sai số vẫn có narrative response, không bị ‘fail silently’.”

Trỏ code:

- `signal-9/js/state.js` → `normalizeDialInput()`, `isCorrectNoteNumber()`
- `signal-9/js/night1.js` → `wrongNumberResponse()`

#### Bước C — Chat runner + choices ảnh hưởng trust

Làm:

- Đợi Unknown nhắn
- Chọn 1 option (tăng hoặc giảm trust)

Nói:

- “Chat chạy theo step queue. Choice sẽ echo vào chat log và cập nhật trust trong localStorage.”

Trỏ code:

- `signal-9/js/chat.js`
- `signal-9/js/state.js` → `addTrust()`

#### Bước D — Puzzle signal decode (canvas)

Làm:

- Kéo slider đến gần 100% để hoàn thành puzzle

Nói:

- “Puzzle này là canvas reveal, đúng chủ đề ‘tuning signal’. Hoàn thành sẽ award clue 1 lần.”

Trỏ code:

- `signal-9/js/signalPuzzle.js`
- `signal-9/js/night1.js` → `startSignalDecode()` gọi `tryAwardClue(\"signal1\")`

#### Bước E — Điểm dừng tuần 9

Làm:

Click “Continue” → tới `signal-9/night2.html` (Đêm 2 tiếp tục slice)

#### Bước F — Đêm 2 apps → memory → chat → free text

Làm:

- Mở đủ 4 app (Photos/Notes/Browser/Voicemail), đóng app layer.
- Continue → vào màn memory ordering, lock đúng thứ tự.
- Vào chat, chọn 1 choice, rồi nhập 1 free-text reply và nhấn Enter.

Nói:

- “Đêm 2 mở rộng ‘ảo giác điện thoại’: apps + timeline ký ức kéo thả.”
- “Sau mốc memory, script yêu cầu 1 free-text reply; text này được lưu để dùng cho các tuần sau.”
- “Tuần 9 kết thúc ở đây; Tuần 11 sẽ bổ sung hidden thread + Night 3 + endings.”

### 3.3 Kết (30–60s)

Nói:

- “Tuần 9 chứng minh core systems: UI flow, script runner, puzzle integration và state.”
- “Sau khi nhận feedback, em sẽ mở rộng sang Night 2 systems và hướng tới milestone tuần 11.”

---

## 4. File-map (để trả lời Q&A nhanh)

- Entry + reset: `signal-9/index.html`
- Night 1 UI: `signal-9/night1.html`
- Night 1 logic: `signal-9/js/night1.js`
- Chat engine: `signal-9/js/chat.js`
- State: `signal-9/js/state.js`
- Puzzle: `signal-9/js/signalPuzzle.js`
- Audio: `signal-9/js/audio.js`
- Trang dừng tuần 9: `signal-9/night2.html`
- Night 2 logic: `signal-9/js/night2.js`

---

## 5. Q&A dự đoán (và câu trả lời mẫu)

### Design / UI

- **Q: Tuần 9 đã hoàn thiện UI gì?**  
  **A:** Hoàn thiện UI flow Đêm 1: explore hotspots → dial pad → chat UI → puzzle panel (canvas). Style thống nhất “phone theme” qua `night1.html` + `css/*`.

- **Q: Vì sao chọn UI điện thoại?**  
  **A:** Câu chuyện xoay quanh liên lạc/đứt gãy/tái dựng ký ức. UI điện thoại tạo cảm giác “diegetic” và làm “Unknown” hợp lý hơn trong trải nghiệm.

### Coding / kiến trúc

- **Q: Vì sao làm chat runner thay vì hardcode thoại?**  
  **A:** Hardcode không scale. Runner giúp pacing/choices nhất quán, và night scripts gọn hơn (`signal-9/js/chat.js`).

- **Q: Làm sao tránh replay cộng clue 2 lần?**  
  **A:** Lưu các flag (`doneSignal1`, `doneMemoryDrag`) và dùng `tryAwardClue(\"signal1\")` / `tryAwardClue(\"memory\")` để mỗi mốc chỉ award 1 lần (`signal-9/js/state.js`).

- **Q: Dial input làm sao cho robust?**  
  **A:** Normalize về digits-only (`normalizeDialInput`) rồi so với `NOTE_PHONE_DIGITS`, nên dấu cách/ký tự lạ không làm hỏng check (`signal-9/js/state.js`).

- **Q: Vì sao puzzle dùng canvas?**  
  **A:** Canvas cho phép blend noise + reveal realtime, hợp chủ đề “signal clarity” hơn việc đổi ảnh tĩnh (`signal-9/js/signalPuzzle.js`).

### Process / tiến độ

- **Q: Sau tuần 9 sẽ làm gì?**  
  **A:** Mở rộng sang Night 2 systems (apps layer/memory ordering/đào sâu state) và hướng tới milestone tuần 11 (climax + endings).

---

## 6. Checklist Tuần 9 (những thứ mình chắc chắn claim được)

- Chạy được vòng Night 1 từ `index.html` → kết thúc ở `night2.html` (trang dừng)
- Chat runner chạy ổn, choice ảnh hưởng trust và persist
- 1 puzzle canvas tích hợp vào narrative flow
- State persist + idempotent milestone (không farm)
- Audio tối thiểu: ambience + feedback

---

## 7. Dự kiến cho Tuần 11 (không có trong snapshot này)

- Night 2: apps layer + memory ordering + narrative mechanic sâu hơn
- Night 3: climax pacing + thêm puzzle
- Routing endings/payoffs và polish tổng thể

