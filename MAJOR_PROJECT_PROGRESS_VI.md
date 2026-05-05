# SIGNAL LOST — Báo cáo tiến độ Major Project (Snapshot Tuần 9)

- **Sinh viên**: Nguyen Hung
- **Repo (snapshot tuần 9)**: `https://github.com/NMHx2005/Thu_Bau_04_05_2026_9.git`
- **Thư mục dự án**: `signal-9/`
- **Thời điểm chụp tiến độ**: 2026-05-05 (UTC+7)

---

## 1. Tổng quan dự án (mình đã làm gì)

**SIGNAL LOST (snapshot Tuần 9)** là một game kể chuyện tương tác chạy trong trình duyệt, được kể theo dạng giao diện điện thoại. Ở mốc này, phần chơi được tập trung vào **Đêm 1**. Trải nghiệm kết hợp:

- **Chat theo kịch bản** (nhịp gõ chữ, lựa chọn, ảnh hưởng trust)
- **Khám phá và puzzle** (canvas: giải mã tín hiệu)
- **Lưu trạng thái** (localStorage: cờ tiến trình, trust/clues, text người chơi nhập)
- **Âm thanh cơ bản** (rain ambience + SFX nhỏ)
- **Điểm dừng rõ ràng** sau Đêm 1 (Night 2 chỉ là trang “dừng Tuần 9”, cố ý không có nội dung Tuần 11)

Ý tưởng chính: câu chuyện *trông như đang nhắn tin với một người thật* trong UI điện thoại. Tuần 9 chủ yếu chứng minh hệ thống trình bày kịch bản + 1 vòng chơi hoàn chỉnh.

---

## 2. Mapping theo tiêu chí đánh giá (đúng rubric)

### A) Phát triển graphic / interface / design elements

Những gì thể hiện được:

- **UI Phone OS (Đêm 1)**: hotspot exploration → dial pad → chat log + choices → signal decode panel.
- **Puzzle canvas như yếu tố UI/interaction**: noise reveal (Đêm 1).
- **Boundary Tuần 9 rõ ràng**: Night 2 là trang dừng checkpoint (không chứa feature Tuần 11).

Artefact chính (Tuần 9):

- `signal-9/night1.html` + `signal-9/js/night1.js` (loop tương tác Đêm 1)
- `signal-9/js/chat.js` (script runner + choices)
- `signal-9/js/signalPuzzle.js` (canvas puzzle giải mã tín hiệu)

### B) Phát triển coding solutions “sophisticated”

Vấn đề đã giải và cách giải:

- **Chat runner tái sử dụng** cho nhịp và branching:
  - `signal-9/js/chat.js` chạy queue step “unknown/player/choices/wait”, typing delay, và pacing multiplier.
- **State persistence (Tuần 9 tối giản)**:
  - Trust/clues và mốc hoàn thành Đêm 1 được lưu trong localStorage qua `signal-9/js/state.js`.
- **Award clue theo kiểu idempotent**:
  - Clue chỉ tăng 1 lần cho mỗi mốc (replay không được “farm” tiến trình).
- **Âm thanh (Tuần 9 tối giản)**:
  - `signal-9/js/audio.js` cung cấp rain ambience + SFX nhỏ để feedback tương tác.

Bằng chứng (Tuần 9):

- Snapshot chạy được trong `signal-9/` và demo end-to-end qua Đêm 1.

### C) Khả năng trả lời câu hỏi về phần trình bày

Mình đã chuẩn bị:

- **Demo script ngắn** (Tuần 9) để trình bày UI + 1 puzzle + 1 thay đổi state.
- **Bộ Q&A** (bên dưới) trả lời theo kiểu “how/why”, gắn với file và quyết định thiết kế.

---

## 3. Mình đã hoàn thành gì đến Tuần 9 (midpoint check-in)

### 3.1 Tính năng đã có (Tuần 9)

- **Loop chơi được ở Đêm 1**
  - Hotspot exploration + chat + choice ảnh hưởng trust.
  - **Puzzle giải mã tín hiệu** (noise reveal) để lộ hình ảnh.
- **Nền tảng state persistence**
  - Trust/clues lưu localStorage.
  - Cờ hoàn thành puzzle để tránh thưởng lại nhiều lần.
- **Âm thanh cơ bản**
  - Rain ambience + notification/typing cues (asset placeholder, có ghi trong `ATTRIBUTION.txt`).

### 3.2 Kịch bản demo Tuần 9 (5–7 phút)

Mục tiêu: cho thấy **UI**, **1 cơ chế tương tác**, **1 hệ quả state**.

1) Mở `signal-9/index.html` → giải thích prologue reset (chạy mới).
2) Vào `night1.html` → show chat pacing + 1 choice thay đổi trust.
3) Làm puzzle giải mã tín hiệu Đêm 1 → thấy ảnh lộ dần.
4) Kết thúc Đêm 1 → sang Đêm 2 (nhắc guard chặn skip).

### 3.3 Câu hỏi hay gặp ở Tuần 9 (và câu trả lời)

- **Q: Choice ảnh hưởng câu chuyện thế nào?**  
  **A:** Choice gắn trust delta; trust lưu localStorage và về sau ảnh hưởng voicemail lock text + ending routing (`js/state.js`, chat steps).

- **Q: Puzzle làm ra sao?**  
  **A:** Canvas vẽ noise + ảnh mục tiêu, input điều khiển mức reveal/opacity (`js/signalPuzzle.js`).

---

## 4. Kiến trúc kỹ thuật (để trả lời khi bị hỏi)

### 5.1 Module chính

- **Chat runner**: `signal-9/js/chat.js`  
  Step queue “unknown/player/choices/wait”, delay, pacing theo đêm.

- **State (Tuần 9 tối giản)**: `signal-9/js/state.js`  
  localStorage keys cho trust/clues và mốc hoàn thành Đêm 1 (`doneSignal1`).

- **Night scripts**:
  - `signal-9/js/night1.js`

- **Puzzles**: `signal-9/js/signalPuzzle.js`  
  Decode Đêm 1.

- **Audio (Tuần 9 tối giản)**: `signal-9/js/audio.js`  
  Rain ambience + SFX đơn giản.

### 5.2 Mô hình state (tóm tắt)

- **Trust (T)**: 0–10, thay đổi bởi choice.
- **Clues (C)**: tăng ở mốc Đêm 1 (`signal1`).
- **Flag**: `doneSignal1` đánh dấu completion của snapshot Tuần 9.

---

## 5. Bằng chứng chất lượng (test + tài liệu)

- Snapshot Tuần 9 được thiết kế để **demo sạch Đêm 1** và dừng có chủ đích ở Night 2.

---

## 6. Thống kê dự án (để đưa lên slide)

- Thống kê là phần optional ở Tuần 9; trọng tâm là loop Đêm 1 và cách trình bày kịch bản.

---

## 7. Bộ Q&A (đúng rubric “respond to questions”)

### Thiết kế / UX

- **Q: Tuần 9 demo UI gì?**  
  **A:** UI Đêm 1: hotspots → dial pad → chat log + choices → signal decode panel (`night1.html`, `js/night1.js`).

### Coding / kiến trúc

- **Q: Làm sao tránh “farm clue” khi replay?**  
  **A:** Mốc Đêm 1 (`signal1`) chỉ award 1 lần bằng cách kiểm tra flag `doneSignal1` trong `signal-9/js/state.js`.

- **Q: Vì sao dùng Web Audio gain nodes thay vì chỉ chỉnh volume `<audio>`?**  
  **A:** Ở Tuần 9 mình giữ audio tối giản (rain + SFX nhỏ) để phục vụ demo loop mà không cần thêm hệ thống (`signal-9/js/audio.js`).

## 8. Dự kiến cho các tuần sau (không có trong snapshot này)

- Night 2 apps + memory ordering + hidden thread (mechanic lore)
- Night 3 climax + thêm puzzle
- Routing endings và payoff

---

## 9. Nếu có thêm thời gian (hướng nâng cấp)

- Thay asset placeholder bằng asset có license CC0/CC-BY phù hợp và cập nhật `ATTRIBUTION.txt`.
- Thêm tuỳ chọn accessibility: giảm motion/typing speed, cải thiện keyboard focus.
- (Bản debug nội bộ) thêm toggle hiển thị T/C và flags để QA nhanh hơn.

