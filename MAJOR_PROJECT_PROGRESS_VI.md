# SIGNAL LOST — Tiến độ Tuần 9 (≈50% phạm vi cuối cùng)

Tài liệu này được viết để **đọc trực tiếp và dùng làm tài liệu tham khảo sống** trong buổi thuyết trình không chính thức Tuần 9. Nội dung **cực kỳ chi tiết**, được liên kết trực tiếp với ba tiêu chí đánh giá, và bao gồm **demo script hoàn chỉnh**, **file map**, và **ngân hàng Q&A** với câu trả lời gắn với source file cụ thể.

---

## Phạm vi: những gì tôi demo tại Tuần 9

Tại Tuần 9, tôi demo khoảng **50% phạm vi dự án cuối cùng**, triển khai qua **Night 1 (hoàn chỉnh)** và **Night 2 (slice hoàn chỉnh)**:

- **Prologue** — 4 slide reset state và chuyển vào Night 1
- **Night 1 Khám phá** — 5 vật thể hotspot hiển thị bằng wakeup sequence; mỗi vật mở lightbox zoom kèm tiêu đề và lore
- **Night 1 Quay số** — nhập số điện thoại với chuẩn hoá ký tự, phản hồi narrative khi sai số, số đúng mở khoá chat
- **Night 1 Chat** — đối thoại scripted với Unknown, lựa chọn của player ảnh hưởng trust, beat có điều kiện nếu đã vào Coat
- **Night 1 Signal Puzzle** — canvas noise/reveal điều khiển bằng slider; hoàn thành nhận clue 1 (idempotent)
- **Chuyển cảnh Night 1 → Night 2** — animation mi mắt đóng + chữ interstitial "Night One ends. The signal holds." + mi mắt mở ở Night 2
- **Night 2 Apps** — Photos, Notes, Browser, Voicemail; copy Voicemail đổi tại ngưỡng trust T ≥ 5
- **Night 2 Sắp xếp ký ức** — jQuery UI sortable; thứ tự đúng điền slot 5 bằng "rest" và nhận clue 2 (idempotent)
- **Night 2 Chat + Free-text** — lựa chọn ảnh hưởng trust; một ô nhập tự do khớp từ khoá; cụm từ lưu vào localStorage
- **Night 2 Hidden Thread** — tin nhắn lưu trữ trong cả Notes và Browser tiết lộ 3 tin nhắn chưa giao từ chính số của player; nhận clue 3 (idempotent)
- **State liên tục** — trust, clues, bốn cờ milestone idempotent, và một mảng phrases trong localStorage; `resetGame()` chạy khi tải index

## Những gì ngoài phạm vi Tuần 9 (có chủ đích)

- Night 3: heartbeat puzzle, timed chat, word bank
- Routing ending: SIGNAL FOUND / NOT YET / STATIC
- Night 3 milestone (cờ `signal3` đã stub trong state nhưng chưa kích hoạt)

---

## 1. Tổng quan dự án

**SIGNAL LOST** là một game tường thuật tương tác chạy trên trình duyệt, được trình bày hoàn toàn qua giao diện **điện thoại mô phỏng**. Không có HUD game truyền thống. Câu chuyện — về danh tính, ký ức, và những điều chưa được nói — được kể qua:

- Giao diện **chat** với một liên lạc tên "Unknown"
- **Hotspot môi trường** hoạt động như thám hiểm point-and-click
- **Mini-puzzle** kiêm thiết bị narrative (signal decode, sắp xếp ký ức, hidden thread)
- **State liên tục** mang theo lựa chọn của player qua các trang

Dự án được xây dựng bằng vanilla HTML, CSS, và JavaScript — không framework, không build tool — để thể hiện khả năng kiểm soát trực tiếp môi trường trình duyệt.

---

## 2. Tiêu chí đánh giá — liên kết chi tiết

---

### A) Phát triển các yếu tố đồ hoạ / giao diện / thiết kế

#### A1) Khái niệm UI tổng thể: điện thoại như khung tường thuật

Toàn bộ game được trải nghiệm qua màn hình điện thoại. Đây không phải quyết định thẩm mỹ — đây là quyết định thiết kế cốt lõi khiến narrative hoạt động:

- Player không bao giờ thấy UI game truyền thống. Mọi tương tác (hotspot, dial pad, chat, puzzle) đều được trình bày như thể player đang cầm và sử dụng điện thoại.
- "Unknown" là liên lạc trong điện thoại — không phải người dẫn chuyện vô hình — điều này khiến cược cảm xúc cảm thấy thật.
- UI điện thoại tạo ra sự gần gũi và ngột ngạt phù hợp với chủ đề câu chuyện.

**Vị trí trong code:**

- `signal-9/night1.html` — layout Night 1 (cảnh khám phá, dial pad, phone chat, signal panel)
- `signal-9/night2.html` — layout Night 2 (lưới app, app layer, giai đoạn memory, giai đoạn chat)
- `signal-9/css/base.css` — biến CSS, reset, container màn hình điện thoại
- `signal-9/css/phone.css` — khung điện thoại, thanh trạng thái, chat bubble, typing indicator, choices
- `signal-9/css/night.css` — vị trí hotspot, overlay lore, dial pad, signal panel, overlay mi mắt, lightbox, chữ chuyển cảnh, thẻ memory
- `signal-9/css/animations.css` — animation tin nhắn vào, hỗ trợ reduced-motion

**Nói gì khi chỉ vào UI:**

> "Mục tiêu thiết kế là player cảm thấy như đang dùng điện thoại thật — không phải chơi game có skin điện thoại. Mọi hotspot, overlay, và chat bubble đều củng cố khung đó."

---

#### A2) Cảnh Night 1: 5 vật thể hotspot với wakeup animation

Night 1 mở ra với cảnh phòng ngủ. Năm vật thể có thể nhấp. Mỗi vật mang một mảnh câu chuyện.

**Wakeup sequence:**

Khi `night1.html` tải, hai dải đen (`#eyeLidTop`, `#eyeLidBottom`) che phủ màn hình. Chúng animate như mi mắt — nháy ba lần rồi mở hoàn toàn trong 2.8 giây — trước khi căn phòng hiện ra. Điều này truyền đạt "player vừa thức dậy" mà không cần chữ nào.

Sau khi mi mắt mở hoàn toàn, `runWakeupSequence()` tiết lộ từng ảnh vật thể với fade-in so le (cách 400ms, theo thứ tự: window → photo → laptop → coat → note).

**Năm vật thể và vai trò của chúng:**

| Vật thể | Tiêu đề hiển thị | Vai trò câu chuyện |
|---|---|---|
| Laptop | The Unsent Draft | Một tin nhắn viết dở, con trỏ vẫn nhấp nháy. Player đang cố nói gì đó và không thể hoàn thành. |
| Cửa sổ | No Reflection | Mưa trên kính, nhưng không có phản chiếu của player — một clue cài sẵn. Hầu hết player đọc là phong cách nghệ thuật trong lần chơi đầu. |
| Mảnh giấy | The Number | Một số điện thoại viết tay, hơi mờ: 0427 318 247. Đây là số quay mục tiêu. |
| Ảnh chụp | The Photograph | Một khuôn mặt mờ trong khung ấm — gần như nhận ra được, không bao giờ hoàn toàn. |
| Áo khoác | Still Warm | Vẫn còn ấm bên cạnh cửa. Nếu vào trước cuộc gọi, Unknown sẽ nhắc đến trong chat. |

**Cả năm vật thể phải được mở trước khi giai đoạn quay số mở khoá.** Đây là gating có chủ đích: player phải trải nghiệm không gian trước khi họ có thể liên lạc ra ngoài.

**Vị trí trong code:**

- Ảnh vật thể: `signal-9/assets/images/night1/obj_*.png`
- Vị trí hotspot: `.hotspot--laptop`, `.hotspot--window`, `.hotspot--note`, `.hotspot--photo`, `.hotspot--coat` trong `signal-9/css/night.css`
- Wakeup sequence: `signal-9/js/night1.js` → `runWakeupSequence()`
- Nội dung lore: `signal-9/js/night1.js` → `var LORE = { ... }`

---

#### A3) Lightbox zoom: kiểm tra vật thể kiểu shared-element

Nhấp vào bất kỳ hotspot nào mở lightbox toàn màn hình. Ảnh vật thể **animate từ vị trí của nó trên màn hình về trung tâm viewport** — không phải fade-in chung chung từ không có gì. Điều này tạo cảm giác nhặt vật lên.

Tương tác:

1. Overlay tối xuất hiện và làm tối đến `rgba(0,0,0,0.82)`
2. Ảnh vật thể phóng to từ vị trí hotspot về trung tâm màn hình
3. Bên dưới ảnh: tiêu đề và lore text của vật thể hiện ra
4. Nút `×` hoặc nhấp overlay đóng lightbox với scale ngược lại

**Nói gì:**

> "Lightbox dùng `getBoundingClientRect()` để đọc vị trí hotspot trên màn hình, rồi bắt đầu animation từ đúng điểm đó. Cảm giác như player đang nhặt vật lên."

**Vị trí trong code:**

- `signal-9/js/night1.js` → `showLightbox(id, hotspotEl)`, `closeLightbox()`
- `signal-9/css/night.css` → `#objLightbox`, `#objLightbox__inner`, `#objLightbox__img`, `#objLightbox__title`, `#objLightbox__text`, `#objLightbox__close`

---

#### A4) Chuyển cảnh: animation mi mắt + chữ interstitial

Khi player nhấp "Continue" cuối puzzle Night 1:

1. Hai dải mi mắt animate **đóng** trong 0.55 giây (ease-in, như nhắm mắt)
2. Div `#transitionText` xuất hiện trên mi mắt đã đóng: **"Night One ends."** rồi **"The signal holds."** — hai dòng fade in cách nhau 0.25s
3. Audio mưa fade out
4. Điều hướng đến `night2.html`
5. Ở Night 2, hai dải mi mắt bắt đầu đóng và animate **mở** chậm rãi trong 2.2 giây (ease-out, mở một lần — không nháy) — truyền đạt chất lượng ý thức khác biệt

Night 1 dùng chuỗi **nháy** (thức dậy mất phương hướng). Night 2 dùng **mở chậm một lần** (có ý thức, tỉnh táo). Sự khác biệt là có chủ đích.

**Vị trí trong code:**

- Animation mi mắt Night 1: `@keyframes eyeLidTopBlink`, `@keyframes eyeLidBottomBlink` trong `signal-9/css/night.css`
- Animation mi mắt Night 2: `@keyframes eyeLidTopOpen`, `@keyframes eyeLidBottomOpen` trong `signal-9/css/night.css`
- Logic chuyển cảnh: `signal-9/js/night1.js` → `$("btnNight2").addEventListener("click", ...)`
- Styles chữ interstitial: `#transitionText`, `@keyframes fadeInText` trong `signal-9/css/night.css`
- HTML: `<div id="eyeLidTop">` và `<div id="eyeLidBottom">` trong `signal-9/night1.html` và `signal-9/night2.html`

---

#### A5) Giao diện app Night 2: bốn app + hidden thread UI

Night 2 hiển thị lưới màn hình chính điện thoại với bốn app. Mỗi app mở một lớp cuộn trong khung điện thoại:

- **Photos** — camera roll bị lỗi ngày 3 tháng 3; ảnh mờ hiện rõ một chút khi chạm
- **Notes** — danh sách công việc sẽ không hoàn thành; trích dẫn nháp; và mục "Drafts — 3 unsent [tap]" thu gọn tiết lộ hidden thread
- **Browser** — lịch sử tìm kiếm ngày cuối cùng (giờ thư viện, ghế công viên, nghe điện thoại qua cửa); và mục "Draft sync — 3 pending [sync]" tiết lộ thread tương tự
- **Voicemail** — nội dung bị khoá cho đến ngưỡng trust; ở T ≥ 5 hiện "một tin nhắn chưa nghe" (audio dành cho ending)

**Hidden thread UI:** Cả Notes và Browser đều chứa phần có thể khám phá, khi nhấp tiết lộ ba bong bóng tin nhắn căn phải từ chính số của player — tất cả đánh dấu "Not delivered" hoặc "Send failed". Những tin nhắn này không đe doạ. Chúng nói lời tạm biệt mà không dùng từ đó.

**Vị trí trong code:**

- `signal-9/night2.html` — lưới app, app layer, giai đoạn memory, giai đoạn chat
- `signal-9/js/night2.js` → `renderApp(name)` — tất cả bốn khối nội dung app bao gồm hidden thread

---

#### A6) Sắp xếp ký ức Night 2

Giao diện kéo-thả sắp xếp dùng jQuery UI. Bốn thẻ ký ức bao gồm bốn sự kiện có timestamp của ngày 3 tháng 3. Một slot thứ năm ghi "what happened next" luôn hiển thị. Khi player khoá đúng thứ tự, Unknown điền slot 5 bằng một từ: **rest**.

**Vị trí trong code:**

- `signal-9/night2.html` — `#memoryList`, `#memoryFifth`, `#memoryRest`, `#btnVerifyMemory`
- `signal-9/js/night2.js` → `initMemory()`
- `signal-9/css/night.css` → `.memory-card`, `.memory-slot--framed`
- `signal-9/css/jquery-overrides.css` — styles kéo sortable

---

### B) Phát triển các giải pháp coding tinh vi cho các vấn đề

#### B1) Chat engine tái sử dụng (script runner)

**Vấn đề:** Hội thoại cần pacing nhất quán, typing indicator, nút lựa chọn, và cập nhật trust qua nhiều night. Hardcode per-page sẽ không bảo trì được.

**Giải pháp:** `SignalLostChat.runScript(steps, opts)` — một step queue runner nhận một mảng và thực thi tuần tự:

- `{ type: "unknown", text }` — typing indicator → delay → bubble
- `{ type: "player", text }` — player bubble tức thì (không delay)
- `{ type: "choices", options }` — render nút lựa chọn; khi chọn: echo bubble, gọi `addTrust(delta)`, xoá nút
- `{ type: "wait", ms }` — tạm dừng trước step tiếp theo

Pacing được tinh chỉnh per-night qua `getDelayMul()` — Night 1 dùng `1.14`, Night 2 dùng `1.12`. Thay đổi multiplier điều chỉnh cảm giác toàn bộ night mà không cần chỉnh từng dòng.

**Tại sao tinh vi:** Night script là mảng dữ liệu thuần. Engine không được viết lại cho mỗi night — nó được gọi với script array khác. Night 3 sẽ tái sử dụng cùng engine.

**Vị trí trong code:** `signal-9/js/chat.js`

---

#### B2) State liên tục với 4-milestone idempotent awarding

**Vấn đề:** Tiến trình phải sống qua reload trang. Chơi lại phần đã hoàn thành không được làm tăng số clue hay kích hoạt lại story beat.

**Giải pháp:** `signal-9/js/state.js` — module localStorage độc lập phơi bày:

| Key | Mục đích |
|---|---|
| `signalLost_trust` | Điểm trust của player (0–10), clamp |
| `signalLost_clues` | Tổng clue đã thu thập (0–4) |
| `signalLost_doneSignal1` | Cờ: đã hoàn thành canvas puzzle Night 1 |
| `signalLost_doneMemoryDrag` | Cờ: đã hoàn thành sắp xếp ký ức Night 2 |
| `signalLost_doneHidden` | Cờ: đã khám phá hidden thread |
| `signalLost_doneSignal3` | Cờ: Night 3 milestone (stub cho Tuần 11) |
| `signalLost_phrases` | Mảng JSON các văn bản player nhập |

`tryAwardClue(kind)` kiểm tra cờ trước. Nếu đã set, trả về `false` — không award clue, không thay đổi state. Điều này làm tất cả milestone an toàn khi chơi lại.

`getFinalWords()` trả về cụm từ đầu tiên trong mảng, hoặc fallback — dùng bởi ending pages để phản chiếu lại lời của player.

`resetGame()` xoá tất cả key — được gọi bởi `index.html` khi tải để mỗi lần chạy prologue bắt đầu mới.

**Nói gì khi chỉ vào code:**

> "Mọi milestone đều là thao tác idempotent. `tryAwardClue('signal1')` an toàn để gọi 100 lần — nó award đúng một lần. Cùng pattern áp dụng cho cả 4 milestone."

**Vị trí trong code:** `signal-9/js/state.js`

---

#### B3) Chuẩn hoá input và phản hồi sai số có tính narrative

**Vấn đề:** Input quay số có thể chứa khoảng trắng hoặc dấu câu. Fail thầm lặng khi sai số phá vỡ immersion.

**Giải pháp:**

- `normalizeDialInput(str)` loại bỏ mọi ký tự không phải số: `"0427 318 247"` → `"0427318247"`
- `isCorrectNoteNumber(dialString)` chuẩn hoá rồi so sánh với `NOTE_PHONE_DIGITS`
- `wrongNumberResponse()` chọn ngẫu nhiên từ ba phản hồi: tín hiệu bận (với ba lần `playTone`), im lặng nặng nề, hoặc voicemail nói "Later" — mỗi cái là beat narrative, không phải thông báo lỗi

**Vị trí trong code:**

- Chuẩn hoá: `signal-9/js/state.js` → `normalizeDialInput()`, `isCorrectNoteNumber()`
- Phản hồi sai số: `signal-9/js/night1.js` → `wrongNumberResponse()`

---

#### B4) Bug CSS specificity — conflict vị trí overlay cố định

**Vấn đề phát hiện và giải quyết trong quá trình phát triển:** Rule:

```css
body.night-bedroom-page > *:not(#finOverlay) {
  position: relative;
  z-index: 1;
}
```

Đối số `:not(#finOverlay)` đóng góp trọng số ID vào specificity selector, làm nó **(1,1,1)**. Cao hơn `#eyeLidTop` và `#objLightbox` ở **(1,0,0)**, khiến cả hai overlay trở thành `position: relative` thay vì `position: fixed` — animation mi mắt không có hiệu lực, và lightbox xuất hiện ở cuối trang.

**Giải pháp:** Mở rộng danh sách exclusion:

```css
body.night-bedroom-page > *:not(#finOverlay):not(#eyeLidTop):not(#eyeLidBottom):not(#transitionText):not(#objLightbox):not(#loreHost) {
  position: relative;
  z-index: 1;
}
```

**Nói gì:**

> "Đây là bug thật tôi chẩn đoán và sửa trong quá trình phát triển — collision specificity giữa rule reset rộng và selector overlay riêng lẻ. Hiểu cách `:not()` đóng góp trọng số ID vào specificity là chìa khoá."

**Vị trí trong code:** `signal-9/css/night.css` — line 41

---

#### B5) Lightbox zoom kiểu shared-element qua getBoundingClientRect

**Vấn đề:** Lightbox fade-in từ trung tâm là bình thường. Vật thể phải có cảm giác được nhặt vật lý từ vị trí của nó trong phòng.

**Giải pháp:**

1. Khi click hotspot, gọi `hotspotEl.getBoundingClientRect()` để lấy vị trí màn hình hiện tại
2. Tính offset từ trung tâm viewport: `originX = rect.left + rect.width/2 - vw/2`
3. Set `transform` của lightbox inner div thành `translate(originX, originY) scale(scaleStart)` — đặt nó về mặt thị giác tại hotspot
4. Loại `transition`, force reflow bằng `lb.offsetWidth`
5. Thêm lại `transition` và set `transform: translate(0,0) scale(1)` — trình duyệt nội suy từ vị trí hotspot ra trung tâm
6. Đóng đảo ngược: scale thu nhỏ, opacity giảm, rồi áp lại class `night-hidden`

**Vị trí trong code:** `signal-9/js/night1.js` → `showLightbox(id, hotspotEl)`

---

#### B6) Hệ thống animation mi mắt kép

**Vấn đề:** Một overlay opacity-fade không truyền đạt gì về *lý do* màn hình tối. Hai dải dọc trượt ra như mi mắt truyền đạt "mắt đang mở".

**Giải pháp:** Hai div `position: fixed`, mỗi cái `height: 51vh` (overlap 1px để tránh khe hở):

- `#eyeLidTop` — gắn phía trên, animate `translateY(0)` → `translateY(-100%)`
- `#eyeLidBottom` — gắn phía dưới, animate `translateY(0)` → `translateY(100%)`

Hai cặp keyframe:

- `eyeLidTopBlink` / `eyeLidBottomBlink` (2.8s): nhiều lần mở một phần ở 10%, 32%, rồi mở hoàn toàn ở 72% — truyền đạt thức dậy mất phương hướng ở Night 1
- `eyeLidTopOpen` / `eyeLidBottomOpen` (2.2s, ease-out): mở chậm một lần — truyền đạt nhận thức có chủ đích ở Night 2

Cho chuyển cảnh Night 1 → Night 2, mi mắt đầu tiên được snap về vị trí mở hoàn toàn (qua inline style), rồi transition về đóng (0.55s ease-in) bằng JavaScript trước khi điều hướng. Night 2 sau đó bắt đầu với mi mắt ở vị trí đóng mặc định và animate mở.

**Vị trí trong code:**

- `signal-9/css/night.css` → `@keyframes eyeLidTopBlink`, `@keyframes eyeLidBottomBlink`, `@keyframes eyeLidTopOpen`, `@keyframes eyeLidBottomOpen`, `#eyeLidTop`, `#eyeLidBottom`
- Logic chuyển cảnh: `signal-9/js/night1.js` → `$("btnNight2").addEventListener`

---

#### B7) Hidden thread idempotent qua hai điểm vào app

**Vấn đề:** Hidden thread có thể tìm thấy từ app Notes hoặc app Browser. Chỉ nên award một clue bất kể player mở cái nào trước hoặc có mở cả hai hay không.

**Giải pháp:** Cả `renderApp("notes")` và `renderApp("browser")` đều gọi cùng `tryAwardClue("hidden")`. Vì `tryAwardClue` là idempotent — nó kiểm tra `getDoneHidden()` trước khi set cờ và tăng clue — award chạy đúng một lần. Cả hai app UI cũng kiểm tra `getDoneHidden()` khi render để hiển thị thread đã mở rộng nếu đã khám phá trước đó.

**Vị trí trong code:** `signal-9/js/night2.js` → `renderApp("notes")`, `renderApp("browser")`; `signal-9/js/state.js` → `tryAwardClue("hidden")`, `getDoneHidden()`

---

#### B8) Canvas signal decode puzzle

**Vấn đề:** Một puzzle thematic phù hợp với khái niệm cốt lõi "khôi phục ký ức bị lỗi từ nhiễu".

**Giải pháp:** `SignalLostSignalPuzzle.initDecode()` — canvas-based reveal:

- Ảnh `LastLocation.png` được vẽ trên canvas
- Lớp noise thủ tục được vẽ phía trên ở opacity điều khiển bởi slider (0 = nhiễu tối đa, 1 = không có nhiễu)
- Slider ánh xạ tuyến tính đến opacity nhiễu; ảnh hiện rõ khi clarity tăng
- Ở 100%, `onComplete()` kích hoạt — đúng một lần, kiểm tra ngoài qua `tryAwardClue("signal1")`
- Nếu file ảnh thiếu, dùng fallback (`Bedroom.png`)

Pixel blending thời gian thực trên canvas thú vị hơn về kỹ thuật và thematic hơn so với hoán đổi ảnh tĩnh.

**Vị trí trong code:** `signal-9/js/signalPuzzle.js`; được gọi từ `signal-9/js/night1.js` → `startSignalDecode()`

---

#### B9) Khớp từ khoá free-text và lưu trữ cụm từ

**Vấn đề:** Một ô nhập tự do ở cuối Night 2 cần cảm thấy quan trọng — Unknown nên phản hồi khác nhau dựa trên player nói gì, và văn bản nên có thể khôi phục để dùng sau trong endings.

**Giải pháp:**

- Handler keydown `freeInput` đọc văn bản của player
- Input chuyển thường được kiểm tra với từ khoá: `"sorry"`, `"love"`, `"afraid"` / `"scared"`, với fallback mặc định
- Cụm từ chính xác được lưu qua `SignalLostState.addPhrase(raw)` — mảng dedup trong localStorage
- `getFinalWords()` trả về cụm từ đầu tiên được lưu, dùng bởi ending pages để phản chiếu lại lời của player

**Vị trí trong code:** `signal-9/js/night2.js` → `initFreeInput()`; `signal-9/js/state.js` → `addPhrase()`, `getFinalWords()`

---

### C) Khả năng trả lời câu hỏi về công việc được trình bày

Các phần sau chứa demo script, file map, và Q&A bank được chuẩn bị để đáp ứng tiêu chí này.

---

## 3. Demo script (Tuần 9, 5–8 phút)

### Mở đầu (30 giây)

Nói:

> "Đây là checkpoint Tuần 9 của tôi cho SIGNAL LOST — một game narrative tương tác chạy trên trình duyệt như giao diện điện thoại mô phỏng. Tôi sẽ đi qua một Night 1 loop hoàn chỉnh và một slice Night 2 hoàn chỉnh, bao gồm khoảng 50% phạm vi dự án cuối cùng. Bao gồm cả 5 hotspot object, chuyển cảnh với animation mi mắt tuỳ chỉnh, canvas puzzle, và cơ chế hidden thread Night 2."

Làm:

- Mở `signal-9/index.html`
- Ghi chú: "index.html reset toàn bộ localStorage state khi tải"
- Click qua 4 prologue slide

---

### Bước 1 — Thức dậy và khám phá phòng ngủ (Night 1)

Làm:

- Xem animation mi mắt chạy (3 lần nháy trong 2.8s, rồi mở)
- Xem 5 vật thể fade in lần lượt sau khi mi mắt mở

Nói:

> "Khi Night 1 tải, hai dải đen animate như mi mắt — ba lần nháy nhanh, rồi mở. Điều này nói với player rằng họ vừa thức dậy mà không cần chữ nào. Sau khi mi mắt mở, năm vật thể trong phòng fade in so le, cách nhau 400 millisecond."

Làm:

- Click hotspot **Window**

Nói:

> "Mỗi vật thể mở lightbox zoom từ vị trí vật thể trên màn hình ra trung tâm — dùng `getBoundingClientRect` để đọc vị trí màn hình chính xác. Tiêu đề là 'No Reflection'. Mưa trên kính, nhưng không có phản chiếu của player. Đây là clue cài sẵn — hầu hết player đọc là phong cách nghệ thuật trong lần chơi đầu."

- Đóng. Click **Laptop**:

> "The Unsent Draft — một tin nhắn viết dở, con trỏ vẫn nhấp nháy. Player đang cố nói gì đó và không thể hoàn thành."

- Đóng. Click **Note**:

> "The Number — một số điện thoại viết tay, hơi mờ: 0427 318 247. Đây là số player sẽ quay."

- Đóng. Click **Photograph** và **Coat**:

> "The Photograph — gần như nhận ra được, không bao giờ hoàn toàn. Và Coat — vẫn ấm bên cạnh cửa. Nếu vào trước cuộc gọi, Unknown bắn ra một dòng có điều kiện thêm."

Nói:

> "Cả năm vật thể phải được đọc trước khi giai đoạn quay số mở khoá. Đây là gating có chủ đích."

Chỉ vào:

- `signal-9/js/night1.js` → `initExplore()`, `runWakeupSequence()`, `showLightbox()`
- `signal-9/css/night.css` → `@keyframes eyeLidTopBlink`, `#objLightbox`

---

### Bước 2 — Dial pad và kiểm tra

Làm:

- Nhập số sai → nhấn gọi → hiện phản hồi

Nói:

> "Số sai tạo ra phản hồi narrative — tín hiệu bận, im lặng nặng nề, hoặc voicemail nói 'Later'. Game không bao giờ fail thầm lặng. Input được chuẩn hoá chỉ còn số trước khi so sánh."

Làm:

- Quay **0427 318 247** → gọi

Nói:

> "Khi quay đúng số, Unknown nghe máy ngay lập tức — không chuông. Dòng đầu tiên: 'I have been waiting for you to call.'"

Chỉ vào:

- `signal-9/js/state.js` → `normalizeDialInput()`, `isCorrectNoteNumber()`

---

### Bước 3 — Chat với Unknown

Làm:

- Để chat chạy; chọn một lựa chọn

Nói:

> "Chat runner xếp hàng các step — typing indicator, delay, bubble. Lựa chọn được echo lại vào log để player thấy họ nói gì. Mỗi lựa chọn điều chỉnh trust trong localStorage. Vì đã vào Coat trước đó, chú ý dòng có điều kiện thêm từ Unknown."

Chỉ vào:

- `signal-9/js/chat.js` → `runScript()`
- `signal-9/js/state.js` → `addTrust()`

---

### Bước 4 — Signal decode puzzle (canvas)

Làm:

- Kéo slider từ 0 về phía 100%

Nói:

> "Cuối cuộc hội thoại Night 1, Unknown gửi một ảnh bị lỗi. Canvas puzzle blend lớp noise thủ tục lên ảnh ẩn trong thời gian thực — slider điều khiển opacity nhiễu. Ảnh hiện rõ khi clarity tăng. Hoàn thành nhận clue 1, idempotent — chơi lại Night 1 sẽ không award lần thứ hai."

Chỉ vào:

- `signal-9/js/signalPuzzle.js`
- `signal-9/js/night1.js` → `startSignalDecode()`, `tryAwardClue("signal1")`

---

### Bước 5 — Chuyển cảnh sang Night 2

Làm:

- Click "Continue"

Nói:

> "Xem chuyển cảnh: mi mắt animate đóng, chữ xuất hiện — 'Night One ends. The signal holds.' — rồi điều hướng sang Night 2, nơi mi mắt mở chậm rãi. Night 1 nháy để truyền đạt mất phương hướng. Night 2 mở mượt mà — player giờ ý thức hơn."

Chỉ vào:

- `signal-9/js/night1.js` → `$("btnNight2").addEventListener`
- `signal-9/css/night.css` → `@keyframes eyeLidTopOpen`, `#transitionText`

---

### Bước 6 — Apps Night 2

Làm:

- Mở Photos, Notes, Browser, Voicemail lần lượt

Nói:

> "Photos — ký ức bị lỗi của ngày 3 tháng 3, ảnh mờ hiện rõ một phần khi chạm. Notes — danh sách công việc sẽ không hoàn thành, một nháp. Browser — lịch sử tìm kiếm ngày cuối cùng: giờ thư viện, ghế công viên, nghe điện thoại qua cửa. Voicemail — nội dung đổi ở ngưỡng trust T ≥ 5. Nếu bị khoá ở đây, đó là có chủ đích."

---

### Bước 7 — Sắp xếp ký ức

Làm:

- Kéo thẻ vào thứ tự đúng → Khoá thứ tự

Nói:

> "Memory drag dùng jQuery UI sortable. Bốn thẻ, bốn timestamp của ngày 3 tháng 3. Thứ tự đúng điền slot 5 bằng một từ: 'rest'. Clue 2 được award, idempotent."

Chỉ vào:

- `signal-9/js/night2.js` → `initMemory()`, `tryAwardClue("memory")`

---

### Bước 8 — Chat, free-text, hidden thread

Làm:

- Chọn một lựa chọn trong chat
- Nhập một reply tự do và nhấn Enter

Nói:

> "Sau memory puzzle, Unknown quay lại chat. Reply tự do được khớp từ khoá — sorry, love, afraid — để xác định phản hồi của Unknown. Cụm từ được lưu trong localStorage và có thể xuất hiện nguyên văn trong ending NOT YET."

Làm:

- Mở Notes → nhấp "Drafts — 3 unsent"

Nói:

> "Trong Notes có một thread lưu trữ. Trong Browser có thread đồng bộ nháp. Cả hai tiết lộ cùng khám phá: tin nhắn gửi từ chính số của player trong giờ cuối mà chưa bao giờ được giao. Chúng nói lời tạm biệt mà không dùng từ đó. Tìm thấy thread award clue 3. Vì cả hai điểm vào đều gọi cùng `tryAwardClue('hidden')` idempotent, clue kích hoạt đúng một lần bất kể player mở app nào trước."

Chỉ vào:

- `signal-9/js/night2.js` → `renderApp("notes")`, `renderApp("browser")`
- `signal-9/js/state.js` → `tryAwardClue("hidden")`, `getDoneHidden()`

---

### Kết (30 giây)

Nói:

> "Tuần 9 demo tất cả hệ thống cốt lõi: Night 1 loop hoàn chỉnh với khám phá vật thể trực quan, lightbox zoom, chuyển cảnh mi mắt, kiểm tra quay số, chat runner tái sử dụng, và canvas puzzle — cộng với slice Night 2 hoàn chỉnh gồm apps, sắp xếp ký ức, free-text chat, và hidden thread. State liên tục và milestone idempotent qua cả hai night. Night 3 — heartbeat puzzle, timed chat, word bank, và ba ending phân nhánh — nằm trong phạm vi Tuần 11."

---

## 4. File map

| File | Mục đích |
|---|---|
| `signal-9/index.html` | Điểm vào; reset state; 4 prologue slide |
| `signal-9/night1.html` | UI Night 1: cảnh khám phá, dial pad, phone screen, signal panel |
| `signal-9/night2.html` | UI Night 2: lưới app, app layer, giai đoạn memory, giai đoạn chat |
| `signal-9/js/night1.js` | Hotspot, lore, wakeup sequence, lightbox, quay số, chat N1, signal decode, chuyển cảnh |
| `signal-9/js/night2.js` | Apps, sắp xếp ký ức, chat N2, free-text, hidden thread |
| `signal-9/js/chat.js` | Chat engine tái sử dụng (step queue runner) |
| `signal-9/js/state.js` | Trust, clues, 4 cờ milestone, phrases, normalizeDialInput, getFinalWords |
| `signal-9/js/signalPuzzle.js` | Canvas noise/reveal puzzle |
| `signal-9/js/audio.js` | Loop mưa, thông báo, typing tick |
| `signal-9/css/night.css` | Vị trí hotspot, overlay, animation mi mắt, lightbox, chữ chuyển cảnh |
| `signal-9/css/phone.css` | Khung điện thoại, chat bubble, choices, typing indicator |
| `signal-9/assets/images/night1/` | 5 ảnh vật thể hotspot |

---

## 5. Q&A bank

### Thiết kế / Giao diện

**H: Những yếu tố thiết kế nào đã hoàn chỉnh ở Tuần 9?**
Đ: Night 1 loop trực quan hoàn chỉnh — phòng ngủ với 5 vật thể tương tác, lightbox zoom khi click, animation mi mắt wakeup, dial pad, chat UI, canvas puzzle panel — cộng với slice Night 2 hoàn chỉnh với lưới app, sắp xếp ký ức, và hidden thread UI. Tất cả được style nhất quán theo chủ đề điện thoại.

**H: Tại sao dùng UI điện thoại thay vì giao diện game truyền thống?**
Đ: Câu chuyện về giao tiếp và sự vắng mặt. UI điện thoại làm "Unknown" trở thành một liên lạc đáng tin và các tương tác cảm thấy diegetic — player không phải nhân vật điều khiển nhân vật, họ là nhân vật đang dùng điện thoại của mình. UI hỗ trợ cược cảm xúc trực tiếp.

**H: Tại sao vật thể ở Night 1 dùng lightbox thay vì chỉ overlay văn bản?**
Đ: Hiển thị ảnh thật của vật thể khi nó zoom từ vị trí ra trung tâm củng cố ẩn dụ xúc giác — player đang nhặt nó lên và kiểm tra. Overlay chỉ văn bản đưa player ra khỏi không gian; lightbox giữ họ trong đó.

**H: Tại sao mi mắt là hai div riêng thay vì một overlay opacity đơn?**
Đ: Một opacity fade đơn không truyền đạt gì về *lý do* màn hình tối. Hai dải dọc trượt ra như mi mắt truyền đạt hành động vật lý — thức dậy, mở mắt — mà không cần chữ nào. Hành vi khác nhau (ba lần nháy vs. mở chậm một lần) giữa Night 1 và Night 2 truyền đạt sự thay đổi trạng thái ý thức của player.

**H: Tại sao Night 1 nháy ba lần nhưng Night 2 mở mượt mà?**
Đ: Night 1 biểu thị thức dậy mất phương hướng — nhiều lần nháy truyền đạt cơ thể đang vật lộn để tỉnh táo. Night 2 biểu thị nhận thức có chủ đích hơn sau khi đã xem lại các sự kiện của ngày 3 tháng 3. Easing và timing được tinh chỉnh để cảm thấy khác biệt.

---

### Coding / Kiến trúc

**H: Lightbox zoom hoạt động như thế nào về kỹ thuật?**
Đ: `showLightbox(id, hotspotEl)` gọi `hotspotEl.getBoundingClientRect()` để lấy vị trí hotspot trên màn hình. Tính offset từ trung tâm viewport, set `transform` của lightbox inner element để đặt nó tại vị trí hotspot và thu nhỏ về kích thước hotspot, sau đó force reflow bằng `lb.offsetWidth` trước khi thêm CSS transition và set `transform` về trạng thái cuối căn giữa. Trình duyệt nội suy animation đầy đủ.

**H: Làm sao ngăn chơi lại Night 1 award clue 1 hai lần?**
Đ: `tryAwardClue("signal1")` trong `state.js` kiểm tra `getDoneSignal1()` trước. Nếu cờ đã được set trong localStorage, hàm trả về `false` ngay mà không chỉnh state nào. Cùng pattern idempotent áp dụng cho cả 4 milestone.

**H: Hidden thread có thể tìm trong cả Notes và Browser. Làm sao bạn đảm bảo clue 3 chỉ award một lần?**
Đ: Cả `renderApp("notes")` và `renderApp("browser")` đều gọi `tryAwardClue("hidden")`. Vì `tryAwardClue` là idempotent — nó kiểm tra cờ `doneHidden` trước — award kích hoạt ở app đầu tiên player mở. Nếu sau đó mở app kia, thread đã hiển thị ở trạng thái mở rộng (vì `getDoneHidden()` trả về `true`), nhưng không có clue thứ hai nào được award.

**H: `normalizeDialInput` hoạt động như thế nào và tại sao quan trọng?**
Đ: Nó áp dụng `.replace(/\D/g, "")` để loại bỏ mọi ký tự không phải số. Điều này có nghĩa player có thể nhập "0427 318 247" (có khoảng trắng) hoặc "0427-318-247" và vẫn khớp với `NOTE_PHONE_DIGITS = "0427318247"`. Không có chuẩn hoá này, bất kỳ biến thể định dạng nào sẽ fail thầm lặng.

**H: Tại sao `signal3` đã có trong state.js nếu Night 3 chưa được build?**
Đ: Hệ thống milestone được thiết kế để mỗi night thêm một entry mà không thay đổi code hiện có. Stub `signal3` bây giờ có nghĩa khi Night 3 được build, `tryAwardClue("signal3")` và `resetGame()` đã xử lý đúng. Nó cũng có nghĩa comment "bao gồm tất cả bốn milestone" là chính xác trong buổi thuyết trình Tuần 9 — kiến trúc hiển thị ngay cả khi nội dung chưa có.

**H: `getFinalWords()` được dùng để làm gì?**
Đ: Nó trả về cụm từ đầu tiên được lưu bởi free-text input của player ở Night 2, hoặc fallback "still here". Ending page gọi `SignalLostState.getFinalWords()` để phản chiếu lại lời của player — một payoff narrative nơi game nhớ lời player nói và dùng nó trong ending. `ending.js` tham chiếu hàm này.

**H: Chat runner hoạt động như thế nào?**
Đ: `SignalLostChat.runScript(steps, opts)` nhận mảng step object và thực thi tuần tự. Unknown step hiển thị typing indicator trong delay ngẫu nhiên (scale bởi `getDelayMul()`), rồi append bubble và chuyển sang step tiếp theo. Choice step render nút; khi chọn một cái, lựa chọn echo thành player bubble, trust được cập nhật, nút bị xoá, và step tiếp theo bắt đầu. Engine không bao giờ được viết lại per-night — chỉ script array và pacing multiplier thay đổi.

**H: Tại sao dùng canvas cho signal puzzle thay vì CSS transition hoặc hoán đổi ảnh?**
Đ: Canvas cho phép kiểm soát chính xác thời gian thực pixel blending — lớp noise có thể được vẽ ở bất kỳ opacity nào trong một lần gọi `drawImage`, và reveal mượt mà ở bất kỳ vị trí slider nào. Hoán đổi ảnh sẽ hiển thị transition nhị phân (nhiễu → rõ). CSS opacity fade sẽ không blend hai lớp. Phương pháp canvas thú vị hơn về kỹ thuật và thematic hơn với ý tưởng "điều chỉnh tín hiệu".

---

### Tiến trình / Quy trình

**H: Dự án được cấu trúc thế nào và tại sao vanilla JS?**
Đ: Ba night là các trang HTML riêng biệt chia sẻ cùng module JS và file CSS. Không build tool, không bundler, không framework. Điều này giữ demo đáng tin (mở file, nó hoạt động), giữ code có thể đọc trong quá trình review, và thể hiện kiến thức browser API trực tiếp.

**H: Bước tiếp theo sau feedback Tuần 9 là gì?**
Đ: Night 3 — heartbeat puzzle, timed chat, word bank. Rồi routing ending: ba con đường (SIGNAL FOUND / NOT YET / STATIC) dựa trên trust và clue cuối cùng. Đánh bóng cuối cùng qua tất cả các night.

---

## 6. Những tuyên bố đã xác nhận ở Tuần 9

- Night 1 loop hoàn chỉnh: prologue → animation wakeup → 5 vật thể trực quan + lightbox → dial pad → chat với Unknown → canvas puzzle
- Night 2 loop hoàn chỉnh: chuyển cảnh mi mắt với chữ interstitial → apps (4) → memory drag → chat → free-text → hidden thread
- Chat engine tái sử dụng qua cả hai night
- Hệ thống state 4-milestone idempotent (signal1, memory, hidden, signal3 stub)
- Trust, clue, và phrase array liên tục trong localStorage
- Bug CSS specificity được chẩn đoán và giải quyết trong production code
- Hệ thống animation mi mắt với hai hành vi khác biệt cho Night 1 và Night 2

---

## 7. Kế hoạch cho Tuần 11

- Night 3: heartbeat canvas puzzle, timed chat, word bank interaction
- Ending router: ngưỡng trust + clue count → ba ending path
- Trang ending SIGNAL FOUND, NOT YET, STATIC với payoff narrative
- `tryAwardClue("signal3")` được nối với hoàn thành Night 3
- `getFinalWords()` và `getPhrases()` được dùng trong văn bản ending
