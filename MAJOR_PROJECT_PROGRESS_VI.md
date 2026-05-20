# SIGNAL LOST. Tài liệu dự án hoàn chỉnh

Tài liệu này bao phủ **toàn bộ phạm vi dự án** gồm Prologue, Night 1, Night 2, Night 3, và hệ thống ba nhánh ending. Nó thay thế tài liệu checkpoint Tuần 9 trước đó (50%).

---

## Phạm vi đầy đủ

| Phase | Trạng thái |
|---|---|
| Prologue (4 slide, reset state) | Hoàn chỉnh |
| Night 1. Khám phá + dial + chat + signal decode | Hoàn chỉnh |
| Night 2. Apps + memory drag + chat + free-text + hidden thread | Hoàn chỉnh |
| Night 3. Heartbeat puzzle + timed chat + reveal + word bank | Hoàn chỉnh |
| Ending routing (SIGNAL FOUND / NOT YET / STATIC) | Hoàn chỉnh |
| Game frame (viewport 1200px 16:9, centered) | Hoàn chỉnh |
| Dial decoy mechanic (số sai lần đầu, rung, rồi số đúng) | Hoàn chỉnh |

---

## 1. Tổng quan dự án

**SIGNAL LOST** là một game tường thuật tương tác chạy hoàn toàn trên trình duyệt, được trình bày qua **giao diện điện thoại mô phỏng**. Không có HUD game truyền thống. Câu chuyện về danh tính, ký ức, và những điều chưa được nói được kể qua:

- Chat với một liên lạc tên "Unknown"
- Hotspot môi trường hoạt động như thám hiểm point-and-click
- Mini-puzzle kiêm thiết bị narrative
- State liên tục mang lựa chọn qua các trang

Xây dựng bằng vanilla HTML, CSS, và JavaScript thuần. Không framework, không build tool.

---

## 2. Luồng game đầy đủ

```
index.html (Prologue, reset state)
  ↓
night1.html
  Khám phá phòng → dial pad (số decoy → rung → số đúng) → chat → signal decode
  ↓
night2.html
  Apps (Photos / Notes / Browser / Voicemail) → memory drag → chat → free-text → hidden thread
  ↓
continue-to-night3.html (cổng vào Night 3, yêu cầu hidden thread)
  ↓
night3.html
  Heartbeat puzzle → timed chat → reveal chat → word bank → nút routing
  ↓
ending-shell.html?outcome=found|static|notyet
```

---

## 3. Night 1. Khám phá phòng ngủ

### 3.1. Wakeup sequence

Khi `night1.html` tải, hai dải đen (`#eyeLidTop`, `#eyeLidBottom`) che màn hình. Chúng animate như mi mắt: nháy ba lần rồi mở hoàn toàn trong 2.8 giây. Sau khi mi mắt mở, `runWakeupSequence()` fade in từng ảnh vật thể so le 400ms theo thứ tự: window → photo → laptop → coat → note.

Điều này truyền đạt "player vừa thức dậy" mà không cần chữ.

**Code:** `signal-9/js/night1.js` → `runWakeupSequence()`

### 3.2. Năm vật thể hotspot

| Vật thể | Tiêu đề | Vai trò |
|---|---|---|
| Laptop | The Unsent Draft | Tin nhắn viết dở, con trỏ vẫn nhấp nháy |
| Cửa sổ | No Reflection | Không có phản chiếu. Clue cài sẵn về danh tính |
| Mảnh giấy | The Number | Số điện thoại 0427 318 247, hơi mờ |
| Ảnh chụp | The Photograph | Khuôn mặt gần như nhận ra được, không bao giờ hoàn toàn |
| Áo khoác | Still Warm | Vẫn ấm bên cửa. Nếu vào trước khi gọi, Unknown nhắc đến trong chat |

Phải mở cả năm mới mở khoá nút "Continue to Dial". Đây là gating có chủ đích: player phải trải nghiệm không gian trước khi liên lạc ra ngoài.

**Code:** `signal-9/js/night1.js` → `var LORE`, `initExplore()`

### 3.3. Lightbox zoom kiểu shared-element

Nhấp hotspot → lightbox zoom từ vị trí vật thể ra trung tâm màn hình (không fade-in từ không có gì). Kỹ thuật:

1. `hotspotEl.getBoundingClientRect()` đọc vị trí trên màn hình
2. Tính offset từ trung tâm viewport: `originX = rect.left + rect.width/2 - vw/2`
3. Set `transform: translate(originX, originY) scale(scaleStart)` không có transition
4. Force reflow bằng `lb.offsetWidth`
5. Thêm transition và set `transform: translate(0,0) scale(1)` → trình duyệt nội suy

**Code:** `signal-9/js/night1.js` → `showLightbox()`, `closeLightbox()`

---

## 4. Night 1. Dial pad và decoy mechanic

### 4.1. Cơ chế decoy (số sai lần đầu)

Đây là cơ chế mới nhất: số gợi ý hiển thị dưới bàn phím **không phải số đúng** ở lần đầu tiên.

**Cách hoạt động từng bước:**

**Lần đầu mở trang:** `buildDecoyDigits()` tạo số giả bằng cách tăng chữ số cuối lên 1 (mod 10). Ví dụ số đúng là `0427318247` → decoy là `0427318248`. Hint hiển thị `0427 318 248`.

**Player gọi số decoy:** `dialCall` handler kiểm tra: nếu chưa qua decoy (`!dialDecoyPassed()`) và số nhập = decoy → kích hoạt `onDecoyDialComplete()`:
- Gọi `shakeDialPad()`: thêm class `dial-shake` vào `.dial-pad` → CSS animation lắc ngang
- `navigator.vibrate([40, 30, 40, 30, 55])` nếu trình duyệt hỗ trợ
- Hai tone âm thanh thấp qua `SignalLostAudio.playTone()`
- Hiện overlay: "Wrong line. The handset trembles. Read the note again, then dial."
- Xóa ô quay số, **cập nhật hint sang số đúng** `0427 318 247`
- Lưu `sessionStorage.signalLost_dialDecoyPassed = "1"`

**Player gọi số đúng:** `isCorrectNoteNumber()` khớp → mở phase-phone, bắt đầu chat Night 1.

**Player gọi số khác hoàn toàn:** `wrongNumberResponse()` như cũ (busy tone / silence / voicemail).

**Sau refresh:** `sessionStorage` giữ trạng thái. Nếu đã rung lần trước, hint hiển thị số đúng ngay.

```
Lần đầu:      hint = "0427 318 248"  (sai 1 số)
Gọi decoy →  RUNG + overlay "Wrong line"
              hint đổi = "0427 318 247"  (đúng)
Gọi đúng  →  vào chat
```

**Code:** `signal-9/js/night1.js` → `buildDecoyDigits()`, `dialDecoyPassed()`, `onDecoyDialComplete()`, `shakeDialPad()`
**CSS animation:** `signal-9/css/animations.css` → `@keyframes dial-shake`, `.dial-pad.dial-shake`

### 4.2. Chuẩn hoá input

`normalizeDial(s)` loại bỏ mọi ký tự không phải số. Player có thể nhập `"0427 318 247"` hoặc `"0427-318-247"` và vẫn khớp. Không có chuẩn hoá này, mọi biến thể định dạng fail thầm lặng.

**Code:** `signal-9/js/night1.js` → `normalizeDial()`, `signal-9/js/state.js` → `isCorrectNoteNumber()`

---

## 5. Night 1. Chat với Unknown

Chat runner `SignalLostChat.runScript()` thực thi mảng step tuần tự:

- `{ type: "unknown", text }` — typing indicator → delay → bubble
- `{ type: "player", text }` — player bubble tức thì
- `{ type: "choices", options }` — render nút; khi chọn: echo bubble, gọi `addTrust(delta)`, xóa nút
- `{ type: "wait", ms }` — tạm dừng

**Script Night 1 gồm:**
1. Unknown chào: "I've been waiting for you to call."
2. Choice 1: "I'm listening" (+1) / "Stop talking in riddles" (-1) / "…" (0)
3. Unknown nhắc về áo khoác
4. Choice 2 về áo khoác (+1/-1/0)
5. **Beat có điều kiện:** nếu `visited.coat === true` → Unknown nói "You already touched the coat."
6. Choice 3 về 2:47 / cửa sổ không phản chiếu / gửi ảnh
7. Unknown gửi ảnh bị lỗi → mở signal panel

**Code:** `signal-9/js/night1.js` → `startNight1Chat()`

---

## 6. Night 1. Signal decode puzzle

`SignalLostSignalPuzzle.initDecode()` tạo canvas blend noise trên ảnh ẩn:

- Ảnh `LastLocation.png` (hoặc fallback `Bedroom.png`) vẽ trên canvas
- Lớp noise thủ tục phủ lên ở opacity điều khiển bởi slider
- Slider ánh xạ tuyến tính: 0 = nhiễu tối đa, 1 = ảnh hoàn toàn rõ
- Ở 100%: `onComplete()` gọi `tryAwardClue("signal1")` idempotent → clue 1

Sau khi hoàn thành, nút "Continue to Night 2" hiện ra.

**Code:** `signal-9/js/signalPuzzle.js`, `signal-9/js/night1.js` → `startSignalDecode()`

---

## 7. Chuyển cảnh Night 1 → Night 2

1. Mi mắt animate **đóng** 0.55s (ease-in)
2. Div `#transitionText` hiện: "Night One ends." rồi "The signal holds."
3. Audio mưa fade out
4. Điều hướng sang `night2.html`
5. Night 2 bắt đầu với mi mắt đóng, animate **mở chậm** 2.2s (ease-out, một lần, không nháy)

Night 1 **nháy ba lần** = thức dậy mất phương hướng. Night 2 **mở chậm một lần** = nhận thức có chủ đích. Khác biệt là có chủ đích.

**Code:** `signal-9/js/night1.js` → `$("btnNight2").addEventListener`, `signal-9/css/night.css` → `@keyframes eyeLid*`

---

## 8. Night 2. Bốn app

Night 2 là màn hình chính điện thoại với bốn app. Mỗi app mở lớp cuộn trong khung điện thoại.

| App | Nội dung |
|---|---|
| Photos | Camera roll bị lỗi ngày 3/3. Ảnh mờ hiện rõ một chút khi chạm |
| Notes | Danh sách việc sẽ không hoàn thành. Nháp. Mục "Drafts, 3 unsent" tiết lộ hidden thread |
| Browser | Lịch sử tìm kiếm ngày cuối: giờ thư viện, ghế công viên, nghe điện thoại qua cửa. Mục "Draft sync, 3 pending" tiết lộ hidden thread |
| Voicemail | Bị khoá cho đến trust T ≥ 5. Ở T ≥ 5 hiện "một tin nhắn chưa nghe" |

**Code:** `signal-9/js/night2.js` → `renderApp(name)`

---

## 9. Night 2. Sắp xếp ký ức

jQuery UI sortable. Bốn thẻ ký ức với timestamp của ngày 3/3. Một slot thứ năm luôn hiển thị "what happened next". Khi player khoá đúng thứ tự → Unknown điền slot 5: **rest** → `tryAwardClue("memory")` → clue 2.

**Code:** `signal-9/js/night2.js` → `initMemory()`

---

## 10. Night 2. Chat và free-text

Sau memory puzzle, Unknown quay lại chat. Sau chat, một ô nhập tự do:

- Input được lowercase và kiểm tra từ khoá: `"sorry"`, `"love"`, `"afraid"/"scared"`, với fallback mặc định
- Cụm từ chính xác được lưu qua `addPhrase(raw)` trong localStorage (dedup)
- `getFinalWords()` trả về cụm từ đầu tiên được lưu — dùng bởi ending pages

**Code:** `signal-9/js/night2.js` → `initFreeInput()`, `signal-9/js/state.js` → `addPhrase()`, `getFinalWords()`

---

## 11. Night 2. Hidden thread

Cả Notes và Browser chứa phần có thể mở. Khi nhấp:
- Ba bong bóng tin nhắn căn phải hiện ra — từ chính số của player
- Tất cả đánh dấu "Not delivered" hoặc "Send failed"
- Những tin nhắn này nói lời tạm biệt mà không dùng từ đó
- `tryAwardClue("hidden")` → clue 3, idempotent

**Tại sao idempotent quan trọng:** Cả hai app gọi cùng `tryAwardClue("hidden")`. Dù player mở Notes trước hay Browser trước, clue chỉ award một lần. Render cũng kiểm tra `getDoneHidden()` để hiện thread ở trạng thái đã mở nếu đã khám phá.

**`getDoneHidden()` cũng là điều kiện mở khoá Night 3.** Không tìm hidden thread → không vào Night 3.

**Code:** `signal-9/js/night2.js` → `renderApp("notes")`, `renderApp("browser")`

---

## 12. Cổng vào Night 3

`continue-to-night3.html` kiểm tra `canEnterNight3()` (= `getDoneHidden()`):
- Đúng: hiện nút "Enter Night 3"
- Sai: thông báo khoá, gợi ý tìm hidden thread trước

`night3.html` cũng tự kiểm tra đầu script — nếu chưa đủ điều kiện, redirect về `night2.html`.

---

## 13. Night 3. Heartbeat puzzle

Canvas heartbeat (`SignalLostSignalPuzzle.initHeartbeat()`):
- Vẽ sóng heartbeat liên tục trên canvas
- Player phải click vào đúng các đỉnh sóng (peak)
- Cần khóa đúng 3 đỉnh (`locksNeeded: 3`)
- Khi hoàn thành: `tryAwardClue("signal3")` → clue 4, rồi chuyển sang timed chat

**Code:** `signal-9/js/signalPuzzle.js`, `signal-9/js/night3.js` → `startHeartbeat()`

---

## 14. Night 3. Soften loop

Một `setInterval` chạy từ khi boot Night 3:

| Bước (×4.5s) | Hiệu ứng |
|---|---|
| Bước 4 | Tên liên lạc đổi sang ký hiệu `▣` |
| Bước 6+ | Phone screen thêm class `phone-screen--soften` (visual blur/fade nhẹ) |

Điều này truyền đạt sự ranh giới giữa nhân vật và Unknown đang mờ dần.

**Code:** `signal-9/js/night3.js` → `startSoftenLoop()`

---

## 15. Night 3. Timed chat (20 giây)

Đồng hồ đếm ngược 20 giây. Hai dòng của Unknown, rồi choices:

- "I hear you." (+2 trust)
- "I don't believe you." (-2 trust)
- "…" (0 trust)

Nếu hết thời gian trước khi chọn: game append bubble "…" vào log và tự chuyển tiếp.

**Tại sao có timer:** Timer không phải hình phạt, nó biểu diễn "độ rộng của sự thành thật mà player cho phép trước khi phản xạ lui lại thói quen."

**Code:** `signal-9/js/night3.js` → `startTimedChat()`

---

## 16. Night 3. Reveal chat

Ba dòng của Unknown với pacing chậm nhất (delay mul 1.65):

1. "You're not trying to remember who you are. You're trying to remember what you wanted to say before you couldn't."
2. "The voice you flinch from isn't a stranger on the line. It's the part of you that learned to speak gently so no one would leave."
3. "If you want a clean ending, you'll have to stop asking the interface to forgive you first."

Sau khi xong, tự động sang word bank.

**Code:** `signal-9/js/night3.js` → `beginReveal()`

---

## 17. Night 3. Word bank

Player xây câu từ các token:

```
I / needed / to / say / that / it / was / love / sorry / home / wait / enough
```

- Nhấp token → append vào câu đang xây
- `#wordBuilt` hiển thị câu + "…"
- Nút "Done": gọi `setFinalWords(line)` → lưu vào `localStorage.signalLost_finalWords`
- Overlay `#finOverlay` hiện câu vừa xây + nút "Reveal ending"

**Code:** `signal-9/js/night3.js` → `startWords()`

---

## 18. Ending routing. Tại sao dẫn đến ending nào?

Đây là phần quan trọng nhất của thiết kế. Khi player nhấp "Reveal ending" trong word bank:

```javascript
var T = window.SignalLostState.getTrust();
var C = window.SignalLostState.getClues();
var outcome = "notyet";
if (T >= 7 && C >= 3) outcome = "found";
else if (T >= 4 || C >= 2) outcome = "static";
window.location.href = "ending-shell.html?outcome=" + outcome;
```

### Điểm trust (T)

Trust tích lũy qua tất cả các lần chọn:

| Lần chọn | Giá trị |
|---|---|
| Night 1 chat, lựa chọn tích cực (ví dụ "I'm listening") | +1 |
| Night 1 chat, lựa chọn tiêu cực (ví dụ "Stop talking in riddles") | -1 |
| Night 1 chat, trung lập ("…") | 0 |
| Night 3 chat, "I hear you." | +2 |
| Night 3 chat, "I don't believe you." | -2 |
| Night 3 chat, "…" hoặc hết giờ | 0 |
| Trust tối thiểu / tối đa | 0 / 10 |

Night 1 có 3 lần chọn (tối đa +3). Night 2 có 1 lần chọn (tối đa +2). Night 3 có 1 lần chọn (tối đa +2). **Tổng tối đa chính xác là 7.** SIGNAL FOUND đòi hỏi perfect play: chọn tích cực trong mọi lần chat ở cả ba night.

### Số clue (C)

| Clue | Điều kiện |
|---|---|
| clue 1 (signal1) | Hoàn thành canvas decode puzzle Night 1 |
| clue 2 (memory) | Hoàn thành memory drag Night 2 đúng thứ tự |
| clue 3 (hidden) | Tìm thấy hidden thread trong Notes hoặc Browser |
| clue 4 (signal3) | Hoàn thành heartbeat puzzle Night 3 |
| Tổng tối đa | 4 |

### Ba kết quả và khi nào dẫn đến mỗi ending

---

#### SIGNAL FOUND (T ≥ 7 **VÀ** C ≥ 3)

**Điều kiện:** cả hai phải đúng — trust cao **và** đã thu thập ít nhất 3/4 clue.

**Ý nghĩa narrative:** Player đã tham gia đầy đủ với Unknown (trust cao), **và** đã khám phá đủ cảnh giới của câu chuyện (clue cao). Đây không chỉ là "chọn đúng" — đây là player đã thực sự trải nghiệm trò chơi một cách cởi mở.

**Tại sao điều kiện AND (không phải OR):** Trust cao không đủ nếu player skip đa số nội dung. Clue cao không đủ nếu player cold và phòng thủ trong chat. Cả hai phải cùng đúng.

**Màn hình:** Nền đen, chữ trắng. Hiển thị câu từ `readFinalLine()` (cụm từ player xây từ word bank). Dòng: "they'll hear it. somehow." Và: "I love you. Call me back when you can." Sau đó nền dần chuyển sáng lên (`#f5f5f8`, `#1a1a2e`) — từ tối đến sáng.

**Audio:** `playEndingFoundSequence()` — chuỗi âm thanh kết thúc đặc biệt.

---

#### STATIC (T ≥ 4 **HOẶC** C ≥ 2)

**Điều kiện:** ít nhất một trong hai — trust trung bình **hoặc** đã tìm được ít nhất 2 clue. Đây là "trung gian" — player đã có mặt nhưng không đủ mở.

**Ý nghĩa narrative:** Tín hiệu đã yếu quá, không đủ để "found" nhưng không phải không có gì. Câu chuyện tan vào tĩnh điện.

**Màn hình:** Nền gần đen (`#0a0a12`), chữ mờ. Văn bản duy nhất: "it's okay. they already know." Sau 2.8s văn bản fade ra. Sau 4.2s nền và chữ đều chuyển sang `#000000` — màn hình đen hoàn toàn.

**Audio:** `playEndingStaticProfile()` — profile nhiễu tĩnh điện.

---

#### NOT YET (T < 4 **VÀ** C < 2)

**Điều kiện:** cả hai đều thấp — player không tham gia hoặc chủ động phòng thủ trong suốt game.

**Ý nghĩa narrative:** "Chưa" là một lựa chọn. Game ghi nhận nó, không trừng phạt nó.

**Cơ chế 2-round:**

**Round 0 (lần đầu vào NOT YET):**
- Hiển thị: "Not yet is a choice, but the tape remembers how many times you said it."
- Hiển thị cụm từ cuối cùng player nhập ở Night 2 (hoặc "the kettle clicking off in an empty kitchen")
- Hai nút: "Stay longer (round 2)" và "Enough (→ STATIC now)"

**Nếu chọn "Stay longer":** `setNotYetRound(1)` — cập nhật trong localStorage. Văn bản đổi sang: "Round 2: choosing 'Not yet again' routes to STATIC, not a punishment, just where weak signal goes." Một nút duy nhất: "Not yet again → STATIC".

**Round 1 (nếu quay lại NOT YET sau khi đã ở round 1):**
- Hiển thị: "Second pass: you already chose not-yet once. The line won't keep humoring the same dodge."
- Một nút duy nhất: "Let the tape run out (→ STATIC)"

**NOT YET luôn kết thúc bằng STATIC.** Đây là thiết kế có chủ đích — không có "không hành động" vĩnh viễn.

**Audio:** `playEndingNotYetPing()` — một ping đơn giản.

---

### Bảng tóm tắt routing

| Trust (T) | Clue (C) | Outcome |
|---|---|---|
| T ≥ 7 **và** C ≥ 3 | | **SIGNAL FOUND** |
| T ≥ 4 **hoặc** C ≥ 2 | | **STATIC** |
| T < 4 **và** C < 2 | | **NOT YET** (→ cuối cùng STATIC) |

*Lưu ý: điều kiện được kiểm tra theo thứ tự ưu tiên — FOUND kiểm tra trước, rồi STATIC, rồi mới NOT YET.*

---

### Con đường đến từng ending

**Để đến SIGNAL FOUND:**
- Night 1: chọn tích cực tất cả 3 lần → +3 trust
- Night 1: hoàn thành signal decode → clue 1
- Night 2: chọn "I'm still here." → +2 trust
- Night 2: hoàn thành memory drag → clue 2
- Night 2: tìm hidden thread → clue 3 (bắt buộc để vào Night 3)
- Night 3: hoàn thành heartbeat → clue 4
- Night 3: chọn "I hear you." → +2 trust
- Kết quả: T = 7, C = 4. **Đủ điều kiện SIGNAL FOUND.**

SIGNAL FOUND **hoàn toàn đạt được** nhưng đòi hỏi perfect play: chọn tích cực trong mọi lần chat ở cả ba night. Một lần chọn tiêu cực hoặc trung lập là không đủ trust. Đây là thiết kế chính xác theo proposal.

**Để đến STATIC (đường thực tế nhất):**
- Bất kỳ người chơi hoàn thành Night 1 + Night 2 + Night 3 đều đến STATIC
- Ví dụ: T=2, C=3 → `T < 4` nhưng `C >= 2` → STATIC
- Ví dụ: T=5, C=4 → `T >= 4` → STATIC

**Để đến NOT YET:**
- Chọn tiêu cực trong mọi lần chat (Night 1 min: -3)
- Bỏ qua memory drag, bỏ qua hidden thread (nhưng hidden thread là bắt buộc để vào Night 3)
- Thực tế: nếu đã vào Night 3, clue 3 (hidden) đã được award → C ≥ 1
- Thêm heartbeat (clue 4) → C ≥ 2 → sẽ vào STATIC, không phải NOT YET
- **NOT YET chỉ xảy ra nếu player bằng cách nào đó bypass Night 3** hoặc trong edge case trust cực thấp và clue cực thấp.

---

## 19. Hệ thống state (localStorage)

| Key | Mục đích | Phạm vi |
|---|---|---|
| `signalLost_trust` | Điểm trust (0–10), clamp | localStorage |
| `signalLost_clues` | Tổng clue (0–4) | localStorage |
| `signalLost_doneSignal1` | Cờ: hoàn thành Night 1 decode | localStorage |
| `signalLost_doneMemoryDrag` | Cờ: hoàn thành memory drag | localStorage |
| `signalLost_doneHidden` | Cờ: tìm thấy hidden thread | localStorage |
| `signalLost_doneSignal3` | Cờ: hoàn thành Night 3 heartbeat | localStorage |
| `signalLost_phrases` | Mảng JSON các cụm từ từ free-text | localStorage |
| `signalLost_finalWords` | Câu từ word bank Night 3 (override phrases[0]) | localStorage |
| `signalLost_notYetRound` | Round NOT YET (0, 1, hoặc 2) | localStorage |
| `signalLost_dialDecoyPassed` | Đã rung lần đầu ở Night 1 chưa | **sessionStorage** |

`tryAwardClue(kind)` là idempotent: kiểm tra cờ trước, nếu đã set trả về `false` ngay. An toàn để gọi nhiều lần.

`resetGame()` xóa tất cả localStorage key. Được gọi bởi `index.html` khi tải.

`stateNight3Extend.js` bổ sung `setFinalWords`, `getFinalWords` (override), `getNotYetRound`, `setNotYetRound`, `canEnterNight3`, `NIGHT3_CONTACT_SYMBOL`. Không sửa `state.js`.

**Code:** `signal-9/js/state.js`, `signal-9/js/stateNight3Extend.js`

---

## 20. Game frame (viewport 1200px, 16:9)

`gameFrame.js` wrap toàn bộ nội dung body trong `.game-viewport > .game-viewport__inner`. Frame 1200px wide, aspect-ratio 16:9, căn giữa trên nền tối. Inner container nhận tất cả class gốc của body.

`fitPhoneInFrame()` scale `.phone-frame` xuống bằng `cqh` nếu chiều cao vẫn quá lớn.

Linked trên tất cả các trang HTML của signal-9.

**Code:** `signal-9/js/gameFrame.js`, `signal-9/css/game-frame.css`

---

## 21. Các giải pháp kỹ thuật đáng chú ý

### CSS specificity bug (phát hiện trong quá trình dev)

Rule:
```css
body.night-bedroom-page > *:not(#finOverlay) {
  position: relative;
  z-index: 1;
}
```
`:not(#finOverlay)` đóng góp trọng số ID vào specificity → **(1,1,1)**, cao hơn `#eyeLidTop` **(1,0,0)** → mi mắt bị `position: relative` thay vì `position: fixed`.

Giải pháp: extend danh sách exclusion:
```css
body.night-bedroom-page > *:not(#finOverlay):not(#eyeLidTop):not(#eyeLidBottom):not(#transitionText):not(#objLightbox):not(#loreHost) {
  position: relative;
  z-index: 1;
}
```

### Hidden thread idempotent qua hai app

Cả Notes và Browser gọi `tryAwardClue("hidden")`. Dù mở app nào trước, clue award đúng một lần. Cả hai cũng kiểm tra `getDoneHidden()` khi render để hiện trạng thái mở rộng nếu đã khám phá.

### Canvas noise/reveal (Night 1) vs. canvas heartbeat (Night 3)

Cùng module `signalPuzzle.js`, hai mode:
- `initDecode()`: slider điều khiển opacity noise trên ảnh
- `initHeartbeat()`: vẽ sóng heartbeat liên tục, player click peak để lock

### Dial decoy (sessionStorage, không localStorage)

Dùng `sessionStorage` (không phải `localStorage`) để decoy reset về đúng trạng thái khi player bắt đầu session mới, nhưng không reset giữa các reload trong cùng session.

---

## 22. File map đầy đủ

| File | Mục đích |
|---|---|
| `index.html` | Prologue 4 slide, reset state |
| `night1.html` | UI Night 1: cảnh khám phá, dial pad, phone screen, signal panel |
| `night2.html` | UI Night 2: lưới app, memory drag, chat |
| `night3.html` | UI Night 3: heartbeat, timed chat, reveal, word bank |
| `continue-to-night3.html` | Cổng kiểm tra điều kiện vào Night 3 |
| `ending-shell.html` | Routing ending duy nhất (nhận `?outcome=`) |
| `ending-found.html` | Standalone ending FOUND (legacy) |
| `ending-notyet.html` | Standalone ending NOT YET (legacy) |
| `ending-static.html` | Standalone ending STATIC (legacy) |
| `js/night1.js` | Hotspot, lore, wakeup, lightbox, dial decoy, chat N1, signal decode, chuyển cảnh |
| `js/night2.js` | Apps, memory drag, chat N2, free-text, hidden thread |
| `js/night3.js` | Heartbeat, soften loop, timed chat, reveal, word bank, routing |
| `js/chat.js` | Chat engine tái sử dụng (step queue runner) |
| `js/state.js` | Trust, clues, 4 milestone flags, phrases, normalizeDialInput |
| `js/stateNight3Extend.js` | setFinalWords, getFinalWords override, notYetRound, canEnterNight3 |
| `js/audio.js` | Loop mưa, typing tick, tone |
| `js/audioNight3Extend.js` | Ending audio sequences (found, static, notyet) |
| `js/signalPuzzle.js` | Canvas decode (Night 1) + canvas heartbeat (Night 3) |
| `js/ending.js` | readFinalLine(), readPhrases() cho ending pages |
| `js/gameFrame.js` | Wrap viewport 1200px, fitPhone |
| `css/base.css` | Biến CSS, reset, phone container |
| `css/phone.css` | Khung điện thoại, chat bubble, typing indicator |
| `css/night.css` | Hotspot, overlay, mi mắt, lightbox, memory card |
| `css/animations.css` | msg-enter, dial-shake |
| `css/night2-ui.css` | Nút back/continue Night 2 |
| `css/game-frame.css` | Viewport frame 1200px |

---

## 23. Q&A bank

### Về ending

**H: Làm sao để đến SIGNAL FOUND? Trust 7 có đạt được không?**
Đ: Có, đạt được chính xác với perfect play. Night 1 có 3 lần chọn tối đa +1 mỗi lần = +3. Night 2 chat có 1 lần chọn "I'm still here." = +2. Night 3 timed chat có 1 lần chọn "I hear you." = +2. Tổng: 3+2+2 = 7. Đây là ngưỡng chính xác, không phải ngẫu nhiên — FOUND đòi hỏi sự chú ý và cởi mở trong toàn bộ game.

**H: NOT YET có phải ending xấu không?**
Đ: Không. Game không phán xét. "Chưa" là lựa chọn hợp lệ. Hệ thống 2-round cho player cơ hội ở lại với cảm xúc đó mà không bị đẩy ngay sang STATIC. Nhưng cuối cùng, không có "không hành động" vĩnh viễn.

**H: Tại sao NOT YET luôn kết thúc bằng STATIC?**
Đ: STATIC là trạng thái trung tính — tín hiệu đủ yếu để không hoàn chỉnh nhưng vẫn có mặt. Nó là điểm dừng tự nhiên cho cả "chưa sẵn sàng" lẫn "đã cố nhưng không đủ".

**H: Cụm từ word bank được dùng ở đâu trong ending?**
Đ: `setFinalWords(line)` lưu câu vào `localStorage.signalLost_finalWords`. Trang ending FOUND gọi `readFinalLine()` (từ `ending.js`) → `SignalLostState.getFinalWords()` (override trong `stateNight3Extend.js`) → trả về câu từ word bank. Câu này hiển thị làm dòng chính của ending FOUND.

### Về kỹ thuật

**H: Tại sao dial decoy dùng sessionStorage thay vì localStorage?**
Đ: Decoy chỉ cần reset khi player bắt đầu session mới (tab mới / cửa sổ mới). Nếu dùng localStorage, decoy sẽ không bao giờ reset trừ khi gọi `resetGame()`. sessionStorage cho phép player trải nghiệm lại cơ chế decoy nếu họ đóng và mở lại trình duyệt, nhưng không bị bán lại trong cùng một session chơi.

**H: Tại sao Night 3 yêu cầu hidden thread (getDoneHidden) thay vì điều kiện khác?**
Đ: Hidden thread là khám phá quan trọng nhất của Night 2 về mặt narrative. Nó tiết lộ rằng player đã cố giao tiếp nhưng thất bại. Night 3 là hệ quả của sự thất bại đó. Người chơi không tìm ra sự thật đó không nên vào Night 3.

**H: Tại sao dùng ending-shell.html thay vì ba file ending riêng?**
Đ: Shell duy nhất đảm bảo `stateNight3Extend.js` và `audioNight3Extend.js` luôn được load trước khi ending render. Nếu dùng ba file riêng, mỗi file phải tự load đủ script. Shell cũng dễ dẫn link hơn: một URL duy nhất với `?outcome=`.

---

## 24. Những tuyên bố đã xác nhận (dự án hoàn chỉnh)

- Prologue → Night 1 loop → Night 2 loop → Night 3 loop đầy đủ
- Hệ thống state 4-milestone idempotent qua tất cả các trang
- Dial decoy mechanic: số sai lần đầu, rung, rồi số đúng
- Chat engine tái sử dụng (Night 1 / 2 / 3, delay mul khác nhau)
- Three-way ending routing với logic trust + clue
- NOT YET 2-round mechanism
- Word bank câu cuối phản chiếu trong ending FOUND
- Hidden thread là điều kiện cổng vào Night 3
- Game frame 1200px 16:9 centered trên tất cả trang
- Canvas decode (Night 1) và canvas heartbeat (Night 3) cùng module
- CSS specificity bug phát hiện và giải quyết trong production code
- Tất cả dấu "—" đã được thay bằng "." hoặc "," trong copy hiển thị

---

*Tài liệu phản ánh trạng thái code tại signal-9/ tính đến 20/05/2026.*
