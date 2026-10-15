# Nghe chép — Audio Dictation Player 🎧

<p align="center">
  <strong>"Nghe từng câu. Chép từng chữ."</strong><br>
  <em>Trình phát audio chuyên dụng, bảo mật và ngoại tuyến cho phương pháp luyện nghe chép chính tả (ETS TOEIC, IELTS, TOEFL, Podcasts).</em>
</p>

<p align="center">
  <a href="./README.vi.md">🇻🇳 Tiếng Việt</a> •
  <a href="./README.md">🇺🇸 English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="Giấy phép: MIT" />
  <img src="https://img.shields.io/badge/Next.js-16.4-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.3-61dafb?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vitest-59%2F59%20Passed-6e9f18?logo=vitest" alt="Vitest Tests" />
  <img src="https://img.shields.io/badge/Coverage-89.2%25-brightgreen" alt="Độ phủ test" />
  <img src="https://img.shields.io/badge/PWA-100%25%20Ngoại%20tuyến-orange" alt="PWA Ready" />
</p>

---

## 📽️ Video Intro & Trình Tạo Animation Tương Tác

**Nghe chép** tích hợp sẵn một công cụ **Motion Graphics Studio** độc lập, tái hiện chính xác 100% giao diện thực tế của ứng dụng (Dark Mode chuẩn Apple, Logo 5 vạch sóng âm, Player Card, vùng chọn A–B trực quan) và có thể xuất thẳng thành tệp video HD 1080p (`.webm` / `.mp4`).

- **Xem trực tiếp & Xuất video:** Mở tệp [`public/intro-video.html`](./public/intro-video.html) trên trình duyệt (hoặc truy cập `/intro-video.html` khi đang chạy dev server).
- **Các phân cảnh trong video:**
  - **Cảnh 1:** Màn hình chào mừng (Welcome Screen) với tiêu đề lớn *"Nghe từng câu. Chép từng chữ."*, nút chọn thư mục và các chip tính năng nổi bật.
  - **Cảnh 2:** Không gian làm việc thực tế gồm Sidebar bên trái (sắp xếp số học tự nhiên `01, 02... 100`, bộ lọc *Tất cả / Chưa nghe / Gắn sao*).
  - **Cảnh 3:** Cơ chế lặp câu thông minh kèm đồng hồ đếm ngược khoảng nghỉ (*"Nghỉ 3s · Chuẩn bị lặp 2/3"*).
  - **Cảnh 4:** Lặp đoạn A–B chính xác trên sóng âm WaveSurfer với 2 mốc kéo thả `A`, `B` và vùng phủ màu xanh mờ.
  - **Cảnh 5:** Lưới phím tắt điều khiển nhanh không rời tay khỏi bàn phím (`Space`, `← / →`, `↑ / ↓`, `[ / ]`, `R`, `A / B / X`).
  - **Cảnh 6:** Outro nhận diện thương hiệu kèm nút bấm **"Xuất Video HD"** một chạm (sử dụng `MediaRecorder` và bộ tổng hợp âm thanh Web Audio).

---

## 🌟 Tại Sao Nên Dùng Nghe chép?

Các trình phát nhạc thông thường (Spotify, VLC, QuickTime) được thiết kế cho việc nghe liên tục, thụ động. Khi luyện **nghe chép chính tả** (đặc biệt là các bộ đề ETS TOEIC Part 1, 2, 3, 4 hoặc IELTS Listening), người học liên tục phải dùng chuột bấm dừng, tua lùi 3 giây rồi lại bấm phát rất mất tập trung và mỏi tay.

**Nghe chép giải quyết triệt để vấn đề này:**
1. **Khoảng nghỉ tự động (Gap Timer):** Tự động đếm ngược thời gian nghỉ (`0` đến `30` giây) giữa các lần lặp để bạn kịp ghi chép trước khi câu phát lại.
2. **Lặp đoạn A–B trực quan:** Kéo thả mốc trực tiếp trên sóng âm để khoanh vùng và lặp đi lặp lại những cụm từ nói lướt, nối âm khó.
3. **Không rời tay khỏi bàn phím:** Điều khiển toàn bộ thao tác phát, tua, đổi tốc độ bằng hệ thống phím tắt toàn diện.
4. **Bảo mật 100% & Hoạt động Ngoại tuyến:** Toàn bộ tệp audio được đọc trực tiếp từ máy tính của bạn, không tải lên bất kỳ máy chủ nào.

---

## ✨ Chi Tiết Các Tính Năng

### 1. 🔁 Vòng Lặp Dictation & Khoảng Nghỉ (Gap Interval)
- **Lặp lại $N$ lần:** Tùy chỉnh tự do số lần lặp từ `1` đến `99` lần cho mỗi câu.
- **Nghỉ giữa các lần ($X$ giây):** Đồng hồ đếm ngược trực quan (`0` đến `30` giây) tạo khoảng lặng để người học kịp ghi chép bài.
- **Tự động chuyển câu (Auto-next):** Tự động chuyển tiếp câu tiếp theo khi hoàn thành đủ số lần lặp và khoảng nghỉ.
- **Quy tắc hoàn thành:** Tự động đánh dấu đã nghe (`listened: true`) ngay khi nghe từ **85% thời lượng** của tệp.

### 2. 🎚️ Sóng Âm Trực Quan (WaveSurfer) & Lặp Đoạn A–B
- **Dạng sóng chi tiết:** Thanh tiến độ sóng âm mượt mà, click để nhảy tới vị trí bất kỳ.
- **Kéo thả mốc A–B:** Đặt mốc bắt đầu `[A]` và kết thúc `[B]` để khoanh vùng đoạn nói khó nghe với viền và nền highlight màu xanh.
- **Bảo toàn cao độ giọng:** Thay đổi tốc độ (`0.5x`, `0.75x`, `1.0x`, `1.25x`, `1.5x`) mà không làm méo tiếng (`preservesPitch`).
- **Tối ưu file lớn:** Tự động chuyển sang thanh tua nhẹ cho file dung lượng lớn (> 20MB) để tránh tràn bộ nhớ trình duyệt.

### 3. 📂 Quản Lý Thư Mục & Sắp Xếp Tự Nhiên (Natural Sort)
- **Định dạng hỗ trợ:** `.mp3`, `.m4a`, `.wav`, `.aac`, `.flac`, `.ogg`, `.webm`.
- **Sắp xếp số học tự nhiên:** Sắp xếp chuẩn xác theo số thứ tự (`1, 2, ... 9, 10, 11... 100`), không bị đảo chuỗi (`1, 10, 100, 2`).
- **Bộ lọc & Tìm kiếm:** Lọc theo **Tất cả**, **Chưa nghe**, **Gắn sao**, tìm kiếm tức thì theo số câu hoặc tên file.
- **Tự động cuộn:** Tự động cuộn danh sách đến vị trí câu đang phát khi tải lại trang hoặc đổi bài.

### 4. ⌨️ Hệ Thống Phím Tắt Toàn Diện

| Phím tắt | Thao tác | Mô tả chi tiết |
|---|---|---|
| `Space` | **Phát / Tạm dừng** | Bật/tắt âm thanh (tự động ngăn cuộn trang) |
| `←` / `→` | **Tua lùi / Tua tới** | Nhảy theo số giây cài đặt (`3s`, `5s`, `10s`) |
| `↑` / `↓` | **Câu trước / Câu sau** | Chuyển bài trong danh sách hàng đợi |
| `[` / `]` | **Giảm / Tăng tốc độ** | Đổi giữa các mức: `0.5x`, `0.75x`, `1.0x`, `1.25x`, `1.5x` |
| `R` | **Phát lại từ đầu** | Tua về 0:00 (hoặc mốc A nếu đang lặp A–B) |
| `A` / `B` | **Đặt mốc A / B** | Đặt điểm bắt đầu / kết thúc đoạn lặp |
| `X` | **Xóa đoạn lặp A–B** | Hủy lặp đoạn và quay lại toàn bộ file |
| `M` | **Đánh dấu sao** | Bật/tắt trạng thái yêu thích câu đang nghe |

*Phím tắt tự động vô hiệu hóa an toàn khi người dùng đang nhập trong ô tìm kiếm hoặc khi mở hộp thoại.*

### 5. 📱 PWA & Ngoại Tuyến (Offline 100%)
- **Cài đặt như ứng dụng riêng:** Thêm vào Dock trên macOS, Taskbar trên Windows hoặc màn hình chính điện thoại.
- **Khởi chạy không cần mạng:** Vỏ ứng dụng (App Shell) được lưu qua Service Worker, mở lên tức thì khi offline.
- **Không tốn dung lượng ổ cứng cho audio:** File âm thanh đọc trực tiếp từ máy, tuyệt đối không bị cache vào bộ nhớ trình duyệt.
- **Thông báo cập nhật:** Tự động phát hiện phiên bản mới và thông báo với nút "Tải lại" tức thì.

---

## 🛠️ Công Nghệ & Kiến Trúc Dự Án

- **Framework cốt lõi:** [Next.js 16](https://nextjs.org/) (App Router, Static Export `output: 'export'`)
- **Giao diện & UI:** [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), Lucide Icons
- **Xử lý âm thanh:** [WaveSurfer.js v8](https://wavesurfer.xyz/), HTML5 Media Element, Web Audio API
- **Lưu trữ cục bộ:** File System Access API, IndexedDB, LocalStorage
- **Hạ tầng kiểm thử:** [Vitest](https://vitest.dev/), React Testing Library, JSDOM, v8 Coverage
- **Kiến trúc phân tầng:** Tuân thủ giới hạn nghiêm ngặt (mỗi file tối đa 250 dòng, phụ thuộc 1 chiều sạch sẽ).

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy

### Yêu cầu môi trường
- Node.js phiên bản `20.x` hoặc `22.x`
- Trình duyệt khuyến nghị: **Google Chrome** hoặc **Microsoft Edge** (để hỗ trợ đầy đủ File System Access API).

### Cài đặt & Khởi chạy

```bash
# 1. Clone repository
git clone https://github.com/your-username/listening-dictation-app.git
cd listening-dictation-app

# 2. Cài đặt các thư viện phụ thuộc
npm install

# 3. Chạy môi trường phát triển cục bộ
npm run dev
```

Mở trình duyệt và truy cập [http://localhost:3000](http://localhost:3000).

---

## 🧪 Kiểm Thử & Tiêu Chuẩn Chất Lượng

Dự án sở hữu bộ test toàn diện với 59 bài kiểm thử:

```bash
# Chạy toàn bộ unit & integration tests
npm test

# Chạy test và tạo báo cáo độ phủ (đạt >= 85%)
npm run test:coverage

# Kiểm tra tĩnh kiểu dữ liệu TypeScript (0 lỗi)
npm run typecheck

# Kiểm tra quy chuẩn mã nguồn ESLint (0 lỗi, 0 warning)
npm run lint

# Đóng gói xuất bản tĩnh cho production
npm run build
```

---

## 🌐 Hướng Dẫn Triển Khai Lên Vercel

Dự án đã được cấu hình tối ưu để xuất bản tĩnh trên Vercel hoặc bất kỳ nền tảng CDN tĩnh nào (GitHub Pages, Cloudflare Pages, Netlify).

### Triển khai nhanh qua Vercel CLI:
```bash
npx vercel
```

### Cấu hình trên Vercel Dashboard:
- **Framework Preset:** `Next.js`
- **Build Command:** `npm run build`
- **Output Directory:** `out`
- **Environment Variables:** *Không cần (bảo mật tuyệt đối, chạy 100% phía client)*

Kho lưu trữ đã có sẵn tệp [`vercel.json`](./vercel.json) với cấu hình chuẩn cho Service Worker (`max-age=0, must-revalidate`), bộ nhớ đệm tài nguyên tĩnh (1 năm `immutable`) và các header bảo mật CSP chặt chẽ.

---

## 📖 Tài Liệu Bàn Giao Chuyên Sâu

Xem chi tiết kiến trúc và hướng dẫn kỹ thuật trong thư mục [`docs/`](./docs):
- [Kiến trúc ứng dụng (`docs/ARCHITECTURE.md`)](./docs/ARCHITECTURE.md) — Sơ đồ phân tầng, luồng dữ liệu và danh mục module.
- [Hướng dẫn kiểm thử (`docs/TESTING.md`)](./docs/TESTING.md) — Kiến trúc mock, lệnh test và ma trận kiểm thử hồi quy.
- [Hướng dẫn triển khai (`docs/DEPLOY.md`)](./docs/DEPLOY.md) — Hướng dẫn Vercel, vòng đời Service Worker và quy trình rollback.
- [Kế hoạch tái cấu trúc Phase 3 (`docs/REFACTOR_PLAN.md`)](./docs/REFACTOR_PLAN.md) — Chiến lược refactor sạch sẽ.
- [Danh mục hành vi hệ thống (`docs/BEHAVIOR_CATALOG.md`)](./docs/BEHAVIOR_CATALOG.md) — Đặc tả hành vi chuẩn của toàn bộ app.

---

## ⚠️ Khả Năng Tương Thích & Giới Hạn Trình Duyệt

- **Chrome / Edge / Trình duyệt nhân Chromium (Khuyên dùng):** Hỗ trợ lưu trữ handle thư mục qua File System Access API. Khi mở lại trang chỉ cần bấm "Cấp quyền lại" là tiếp tục phiên nghe trước đó.
- **Safari (macOS / iOS):** Sử dụng cơ chế fallback `<input webkitdirectory>`. Do chính sách bảo mật của WebKit, Safari không hỗ trợ lưu handle thư mục giữa các lần đóng/mở trình duyệt, vì vậy bạn cần chọn lại thư mục một lần khi mở mới. Mọi tiến độ nghe dở, đánh dấu sao và cài đặt đều được lưu lại đầy đủ.

---

## 📄 Giấy Phép (License)

Dự án được phân phối dưới giấy phép **MIT** — chi tiết xem tại tệp [LICENSE](./LICENSE).
