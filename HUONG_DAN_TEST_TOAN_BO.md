# SIGNAL LOST — Hướng dẫn test toàn bộ dự án

Tài liệu này hướng dẫn **test thủ công end-to-end** (không thay thế ma trận ngắn trong `QA.txt` nhưng bổ sung **bước cụ thể**). Chạy game qua **HTTP** (server tĩnh local) để âm thanh và `fetch` ổn định hơn so với mở file trực tiếp `file://`.

---

## 0. Chuẩn bị

1. Mở DevTools (F12) → tab **Application** (Chrome) / **Storage** (Firefox) → **Local Storage** của origin đang chạy game.
2. Trước mỗi vòng test “sạch”: vào **`index.html`** (prologue) — **mỗi lần load prologue sẽ gọi `resetGame()`**, xóa trust, clues, cờ puzzle, phrases, finalWords, notYetRound, reachedNight2, v.v.

---

## 1. Luồng hạnh phúc (happy path) — một lượt đủ điều kiện FOUND

**Mục tiêu cuối:** `T >= 7` và `C >= 3` → `ending-found.html`.

### Bước 1 — Prologue (`index.html`)

- Click lần lượt qua 4 slide đến khi chuyển `night1.html`.
- Kiểm tra: localStorage đã được reset (không còn state cũ nếu trước đó bạn đã chơi).

### Bước 2 — Night 1

1. **Khám phá:** bấm đủ **5 hotspot** (laptop, window, note, photo, coat). Đọc lore; ý **cửa sổ không phản chiếu** xuất hiện ở hotspot `window`.
2. **Gợi ý nhánh coat:** bấm **coat** trước khi sang dial (để sau khi gọi đúng số, chat có thêm một bubble nếu đã `visited.coat`).
3. **Dial:** bấm **Continue** → nhập số **`0427318247`** (có thể có khoảng trắng vẫn được chuẩn hóa) → **Call**.
4. **Chat:** chọn các lựa chọn **thiên về +trust** khi có thể (ví dụ “I'm listening.” +1, “I remember the weight.” +1, “I hear you.” ở Night 3 +2, v.v.) để tích lũy trust.
5. **Nhánh 2:47 / cửa sổ:** chọn một trong các option “Why does the clock…”, “The window…”, hoặc “Send what you have” — thoại 2:47 + kính không phản chiếu vẫn chạy (linear).
6. **Signal decode:** kéo slider đến 100%; ảnh ưu tiên `LastLocation.png`, fallback `Bedroom.png` nếu thiếu.
7. **Ra Night 2:** bấm nút sang đêm 2 — **mưa fade** (quan sát âm lượng / tắt dần).

### Bước 3 — Night 2

1. **Guard:** nếu bạn thử mở thẳng `night2.html` khi chưa xong decode đêm 1 → phải bị **redirect về `night1.html`**.
2. **Apps:** mở lần lượt **4 app** (Photos, Notes, Browser, Voicemail). Kiểm tra voicemail: trust < 5 thì **locked**; nếu trust đã >= 5 thì copy **unlock**.
3. **Continue** (memory): sắp xếp thẻ memory đúng thứ tự thời gian (10:30 PM → … → 12:01 AM) → **Lock order** → xuất hiện chữ **`rest.`** trong slot.
4. **Chat + nhập tự do:** sau script, gõ một câu và **Enter**; thử từ khóa `sorry`, `love`, hoặc `afraid` để thấy reply khác nhau.
5. **Thread ẩn:** sau phần chat 2, màn hình về lại **Apps** + banner. Vào **Notes** hoặc **Browser** → bấm **Open archived thread** / **Open draft sync thread** → đọc thread.
6. Kiểm tra: **`Continue to Night 3`** chỉ **enabled** sau khi đã mở thread (cờ `foundHiddenThread`). Mở thread lần 2 **không** tăng clue thêm.
7. Sang **Night 3**.

### Bước 4 — Night 3

1. **Guard:** mở thẳng `night3.html` khi chưa mở thread đêm 2 → **redirect `night2.html`**.
2. **Heartbeat:** hoàn thành minigame (đủ “locks”).
3. **Timed chat:** chọn lựa chọn (hoặc để hết 20s để thấy bubble “…”).
4. **Reveal:** đọc 3 bubble twist.
5. **Word bank:** bấm vài từ → **Done** → overlay hiện câu đã ghép → **Continue** → đúng điều kiện T/C thì vào **`ending-found.html`**.
6. **Ending FOUND:** có voicemail / resolve (theo `js/audio.js`).

Ghi lại: giá trị **trust** và **clues** trong localStorage sau Night 3 (nếu cần debug routing).

---

## 2. Test routing ending (ma trận T / C)

Dùng prologue reset, sau đó **điều khiển trust** qua lựa chọn chat và **clues** qua việc làm/bỏ qua puzzle (chỉ dùng khi bạn cố ý test nhánh — cẩn thận vì cờ `tryAwardClue` một lần).

**Cách nhanh (chỉ môi trường dev):** trên trang Night 3, **trước** khi bấm **Continue** trên overlay sau word bank, mở console:

```js
SignalLostState.setTrust(7); // ví dụ: 0..10
// Số clues không có setter công khai; để ép C hãy chỉnh localStorage key signalLost_clues hoặc chơi lại có chọn bỏ puzzle (khó) — tham chiếu QA.txt
```

Khuyến nghị: test **4 điểm biên** trong `QA.txt`:

| Case | T | C | Kết quả mong đợi |
|------|---|---|------------------|
| 1 | 3 | 3 | `ending-static.html` (vì C≥2) |
| 2 | 7 | 2 | `ending-static.html` (vì T≥4) |
| 3 | 7 | 3 | `ending-found.html` |
| 4 | 3 | 1 | `ending-notyet.html` |

**Lưu ý:** `C` phụ thuộc bạn đã làm những puzzle nào (signal1, memory, hidden, signal3). Case `C=1` thường cần **bỏ qua một số puzzle** (ví dụ không mở thread / không xong memory) rồi vẫn vào được Night 3 — trong build hiện tại Night 3 **yêu cầu** đã mở thread, nên `C` tối thiểu thường đã gồm hidden; hãy đối chiếu thực tế lượt chơi với `QA.txt`.

---

## 3. Test NOT YET (`ending-notyet.html`)

1. Chơi tới routing **NOT YET** (T thấp và C thấp theo bảng).
2. Màn 1: đọc copy; thử **“Stay longer (round 2)”** → `notYetRound = 1`, xuất hiện nút **“Not yet again → STATIC”**.
3. Reset prologue, chơi lại NOT YET nhưng bấm **“Enough (→ STATIC now)”** → thẳng `ending-static.html`.
4. Load lại `ending-notyet.html` khi `notYetRound >= 1`: chỉ còn một nút kiểu **“Let the tape run out (→ STATIC)”**.

---

## 4. Test idempotency & cờ

- **Signal decode lặp:** sau khi có `doneSignal1`, quay lại Night 1 (nếu có cách vào) — clue **không** tăng lần 2.
- **Hidden thread:** mở thread hai lần — clue **không** nhân đôi.
- **Memory:** verify sai → alert “Not quite…”; verify đúng một lần.

---

## 5. Test âm thanh & UI phụ

- **Rain:** có ở Night 1; fade khi sang Night 2; Night 3 gọi `fadeRainOut` (an toàn nếu mưa đã tắt).
- **Notification / typing:** khi có file MP3 trong `assets/audio/`; nếu decode lỗi vẫn có fallback oscillator.
- **Night 2 jQuery sortable:** kéo thả mượt; placeholder có style (file `css/jquery-overrides.css`).

---

## 6. Test accessibility / motion (rà nhanh)

- `aria-live` trên vùng app body (Night 2) khi thread thay nội dung — đọc bằng screen reader nếu có thời gian.
- `css/animations.css`: không gây chóng khi tắt motion (nếu sau này thêm `prefers-reduced-motion` thì ghi chú thêm).

---

## 7. Checklist một phiên đầy đủ (tóm tắt)

- [ ] Prologue → reset state  
- [ ] Night 1: 5 hotspot, dial đúng, chat + decode, sang Night 2  
- [ ] Guard Night 2 / Night 3  
- [ ] Night 2: 4 app, memory đúng, chat + free text, mở thread trong Notes **hoặc** Browser, Night 3 enabled  
- [ ] Night 3: heartbeat, timed, reveal, words, routing ending  
- [ ] Ít nhất một nhánh: **FOUND**, một nhánh **STATIC**, một nhánh **NOT YET** (+ vòng 2 NOT YET nếu cần)  
- [ ] `ATTRIBUTION.txt` + asset paths không 404 (Network tab)

---

## 8. Tài liệu liên quan

- **`README.md`** (tiếng Anh) — mô tả chi tiết **script present**, hệ thống thoại, lore, ending.  
- **`QA.txt`** — ma trận T/C và guard ngắn gọn.
