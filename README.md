# Nghe chép — Audio Dictation Player

Ứng dụng web chuyên dụng cho việc luyện nghe chép chính tả (dictation), tối ưu hóa trải nghiệm cho các bộ đề thi như **ETS TOEIC** (thư mục chứa hàng trăm câu audio ngắn, lặp lại câu linh hoạt, khoảng nghỉ chép bài, lặp đoạn A–B trực quan và hệ thống phím tắt bàn phím).

---

## 🌟 Tính năng nổi bật

### 1. 🔒 100% Client-side & Chạy Offline
- **Bảo mật tuyệt đối**: Toàn bộ tệp audio được đọc và phát trực tiếp trên thiết bị của người dùng, không tải tệp lên bất kỳ máy chủ nào.
- Hoạt động mượt mà offline không cần kết nối mạng.

### 2. 📂 Quản lý thư mục & Sắp xếp tự nhiên (Natural Sort)
- **Hỗ trợ định dạng**: `.mp3`, `.m4a`, `.wav`, `.aac`, `.flac`, `.ogg`, `.webm`.
- **Natural Sort**: Sắp xếp tệp theo đúng thứ tự số học tự nhiên (`1, 2, 3... 9, 10, 11... 100`), không bị đảo thứ tự chuỗi (`1, 10, 100, 2`).
- **Tìm kiếm & Bộ lọc thông minh**:
  - Lọc: **Tất cả**, **Chưa nghe**, **Gắn sao** (Starred).
  - Tìm kiếm tức thì theo số thứ tự hoặc từ khóa trong tên file.
  - Tự động cuộn danh sách (`auto-scroll`) đến vị trí câu đang phát khi tải lại trang (F5) hoặc đổi bài.

### 3. 🌊 Sóng âm trực quan (WaveSurfer) & Lặp đoạn A–B
- **Dạng sóng WaveSurfer**: Hiển thị tiến độ và dạng sóng chi tiết; click để nhảy tới vị trí bất kỳ.
- **Lặp đoạn A–B chính xác**: Đặt mốc A, B để lặp lại một cụm từ khó nghe với 2 handle kéo thả mượt mà và nền highlight trực quan.
- **Tối ưu file lớn**: Tự động chuyển sang chế độ thanh tiến độ nhẹ (lightweight seek bar) cho các tệp âm thanh dung lượng lớn (> 20MB) để tránh lag bộ nhớ.
- **Giữ nguyên cao độ giọng**: Tích hợp `preservesPitch` giúp âm thanh không bị méo tiếng khi thay đổi tốc độ (`0.5x` đến `1.5x`).

### 4. 🔁 Cơ chế lặp Dictation & Khoảng nghỉ (Gap Interval)
- **Lặp lại $N$ lần mỗi tệp**: Tùy chỉnh tự do từ `1` đến `99` lần.
- **Nghỉ giữa các lần / chuyển câu ($X$ giây)**: Đếm ngược trực quan trong khoảng nghỉ (`0` đến `30` giây) để người dùng có đủ thời gian ghi chép bài trước khi câu phát lại hoặc chuyển sang câu mới.
- **Tự động chuyển câu (Auto-next)**: Tự động chuyển tiếp câu kế tiếp khi hoàn thành đủ số lần lặp và khoảng nghỉ; tự dừng khi đến tệp cuối danh sách.
- **Quy tắc hoàn thành bài nghe**: Tự động đánh dấu đã nghe (`listened: true`) ngay khi nghe từ **85% thời lượng tệp** trở lên.

### 5. ⌨️ Hệ thống phím tắt toàn diện (Keyboard Shortcuts)
Điều khiển nghe chép mà tay không cần rời bàn phím:

| Phím tắt | Thao tác | Chi tiết |
|---|---|---|
| `Space` | **Phát / Tạm dừng** | Tự động ngăn cuộn trang |
| `←` / `→` | **Tua lùi / Tua tới** | Nhảy theo số giây tùy chỉnh (`skipSeconds`) |
| `↑` / `↓` | **Tệp trước / Tệp sau** | Chuyển bài trước hoặc bài kế tiếp trong danh sách |
| `[` / `]` | **Giảm / Tăng tốc độ** | Chuyển đổi giữa các mức: `0.5x`, `0.75x`, `1.0x`, `1.25x`, `1.5x` |
| `R` | **Phát lại từ đầu** | Tua về 0:00 (hoặc mốc A nếu đang lặp A–B) và phát lại câu |
| `A` / `B` | **Đặt mốc A / B** | Đặt điểm bắt đầu / kết thúc đoạn lặp |
| `X` | **Xóa đoạn lặp A–B** | Hủy lặp đoạn và quay lại toàn bộ file |
| `M` | **Đánh dấu sao (Star)** | Bật/tắt trạng thái yêu thích của câu đang nghe |

*Lưu ý: Phím tắt tự động vô hiệu hóa an toàn khi đang focus vào ô nhập liệu hoặc khi các hộp thoại (dialog) đang mở.*

### 6. 💾 Lưu trữ trạng thái & Khôi phục phiên làm việc
- **Settings**: Tốc độ, âm lượng, bước tua, số lần lặp, thời gian nghỉ, tự chuyển câu, trạng thái thanh bên và ngôn ngữ được lưu tự động trong `localStorage`.
- **Session & Marks**: Ghi nhớ tệp đang nghe dở dang và dấu sao/đã nghe theo từng thư mục.
- **Khôi phục thư mục (Chrome / Edge)**: Caching thư mục qua `IndexedDB` (`FileSystemDirectoryHandle`). Khi mở lại trình duyệt, ứng dụng tự động nhận diện và cung cấp nút xin lại quyền nhanh chóng.
- **Hỗ trợ Safari**: Tự động nhận diện trình duyệt Safari, cung cấp fallback qua `webkitdirectory` và giữ nguyên cài đặt cùng bài đang nghe dở.
- **Xóa sạch dữ liệu (Reset)**: Hộp thoại xác nhận an toàn giúp đặt lại toàn bộ thiết lập, xóa session và dọn sạch IndexedDB + LocalStorage.

### 7. 📱 Progressive Web App (PWA) & Ngoại tuyến (Offline)
- **Cài đặt như ứng dụng riêng (Standalone)**:
  - **Chrome / Edge**: Bấm nút **"Cài đặt ứng dụng"** ở chân thanh bên hoặc biểu tượng cài đặt trên thanh địa chỉ trình duyệt.
  - **Safari (macOS Sonoma trở lên)**: Chọn **Tệp → Thêm vào Dock** (File → Add to Dock).
- **Hoạt động khi mất mạng**: Vỏ ứng dụng (App Shell) được cache qua Service Worker, mở tức thì khi offline.
- **Không tốn dung lượng cho audio**: Toàn bộ tệp audio được phát trực tiếp từ máy, tuyệt đối không bị cache vào bộ nhớ trình duyệt (Cache Storage).
- **Thông báo cập nhật**: Khi có phiên bản mới, hiển thị thông báo với nút "Tải lại" tức thì.

---

## 🛠️ Cài đặt & Khởi chạy

### Yêu cầu hệ thống
- Node.js 20 trở lên
- Trình duyệt khuyến nghị: **Google Chrome** hoặc **Microsoft Edge** (để tận dụng File System Access API)

```bash
# 1. Cài đặt dependencies
npm install

# 2. Khởi chạy môi trường phát triển (Dev)
npm run dev

# 3. Chạy toàn bộ unit & integration tests
npm test

# 4. Kiểm tra độ phủ kiểm thử (Coverage ≥ 85%)
npm run test:coverage

# 5. Kiểm tra kiểu dữ liệu (TypeScript)
npm run typecheck

# 6. Kiểm tra quy chuẩn mã nguồn (ESLint)
npm run lint

# 7. Đóng gói bản phát hành tĩnh (Static Export)
npm run build
```

---

## 📚 Tài liệu chi tiết (Documentation)

- [Kiến trúc ứng dụng (Architecture Guide)](file:///Users/truongduy/Documents/Dev/listening-dictation-app/docs/ARCHITECTURE.md)
- [Hướng dẫn kiểm thử & Báo cáo độ phủ (Testing Guide)](file:///Users/truongduy/Documents/Dev/listening-dictation-app/docs/TESTING.md)
- [Hướng dẫn triển khai Vercel (Deployment Guide)](file:///Users/truongduy/Documents/Dev/listening-dictation-app/docs/DEPLOY.md)
- [Kế hoạch tái cấu trúc Phase 3 (Refactor Plan)](file:///Users/truongduy/Documents/Dev/listening-dictation-app/docs/REFACTOR_PLAN.md)
- [Danh mục hành vi hệ thống (Behavior Catalog)](file:///Users/truongduy/Documents/Dev/listening-dictation-app/docs/BEHAVIOR_CATALOG.md)
- [Báo cáo Baseline trước refactor (Baseline Report)](file:///Users/truongduy/Documents/Dev/listening-dictation-app/docs/BASELINE.md)

---

## ⚠️ Giới hạn hệ thống & Trình duyệt đã biết

- **Quyền đọc thư mục khi ngoại tuyến (Chrome / Edge)**: Nếu quyền truy cập thư mục của trình duyệt đã hết hiệu lực giữa các phiên, Chrome sẽ yêu cầu người dùng bấm **"Cấp quyền lại"** (thao tác này hoàn toàn cục bộ, không cần kết nối mạng).
- **Giới hạn trên Safari**: Safari hiện chưa hỗ trợ File System Access API và không lưu lại handle thư mục giữa các lần đóng/mở trình duyệt (kể cả khi đã Thêm vào Dock). Do đó, mỗi lần mở mới Safari người dùng cần chọn lại thư mục một lần; cài đặt và tiến độ nghe dở vẫn được lưu trữ đầy đủ.

---

## 📜 Giấy phép
Dự án được phân phối dưới giấy phép MIT.
