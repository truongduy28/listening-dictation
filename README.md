# Nghe chép — Audio Dictation Player

Ứng dụng web chuyên dụng cho việc luyện nghe chép chính tả (dictation), tối ưu hóa trải nghiệm cho các bộ đề thi như **ETS TOEIC** (thư mục chứa hàng trăm câu audio ngắn, lặp lại câu linh hoạt, khoảng nghỉ chép bài và hệ thống phím tắt bàn phím).

---

## 🌟 Tính năng nổi bật

### 1. 🔒 100% Client-side & Chạy Offline
- **Bảo mật tuyệt đối**: Toàn bộ tệp audio được đọc và phát trực tiếp trên thiết bị của người dùng, không tải tệp lên bất kỳ máy chủ nào.
- Hoạt động mượt mà offline không cần kết nối mạng.

### 2. 📂 Quản lý thư mục & Sắp xếp tự nhiên (Natural Sort)
- **Hỗ trợ định dạng**: `.mp3`, `.m4a`, `.wav`, `.aac`, `.flac`, `.ogg`, `.webm`.
- **Natural Sort**: Sắp xếp tệp theo đúng thứ tự số học tự nhiên (`1, 2, 3... 9, 10, 11... 100`), không bị đảo thứ tự chuỗi (`1, 10, 100, 2`).
- **Tìm kiếm & Bộ lọc thông minh**:
  - Lọc: **Tất cả**, **Chưa nghe**, **Đã nghe**, **Gắn sao** (Starred).
  - Tìm kiếm tức thì theo số thứ tự hoặc từ khóa trong tên file.
  - Tự động cuộn danh sách (`auto-scroll`) đến vị trí câu đang phát khi tải lại trang (F5) hoặc đổi bài.

### 3. 🌊 Sóng âm trực quan (WaveSurfer) & Trình phát Audio
- **Dạng sóng WaveSurfer**: Hiển thị tiến độ và dạng sóng chi tiết; click để nhảy tới vị trí bất kỳ.
- **Tối ưu file lớn**: Tự động chuyển sang chế độ thanh tiến độ nhẹ (lightweight seek bar) cho các tệp âm thanh dung lượng lớn (> 20MB) để tránh lag bộ nhớ.
- **Giữ nguyên cao độ giọng**: Tích hợp `preservesPitch` giúp âm thanh không bị méo tiếng khi thay đổi tốc độ.

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
| `R` | **Phát lại từ đầu** | Tua về 0:00 và phát lại câu hiện tại |

*Lưu ý: Phím tắt tự động vô hiệu hóa an toàn khi đang focus vào ô nhập liệu hoặc khi các hộp thoại (dialog) đang mở.*

### 6. 💾 Lưu trữ trạng thái & Khôi phục phiên làm việc
- **Settings**: Tốc độ, âm lượng, bước tua, số lần lặp, thời gian nghỉ, tự chuyển câu, trạng thái thanh bên và ngôn ngữ được lưu tự động trong `localStorage`.
- **Session & Marks**: Ghi nhớ tệp đang nghe dở dang và dấu sao/đã nghe theo từng thư mục.
- **Khôi phục thư mục (Chrome / Edge)**: Caching thư mục qua `IndexedDB` (`FileSystemDirectoryHandle`). Khi mở lại trình duyệt, ứng dụng tự động nhận diện và cung cấp nút xin lại quyền nhanh chóng.
- **Hỗ trợ Safari**: Tự động nhận diện trình duyệt Safari, cung cấp fallback qua `webkitdirectory` và giữ nguyên cài đặt cùng bài đang nghe dở.
- **Xóa sạch dữ liệu (Reset)**: Hộp thoại xác nhận an toàn giúp đặt lại toàn bộ thiết lập, xóa session và dọn sạch IndexedDB + LocalStorage.

### 7. 🎨 Giao diện & Đa ngôn ngữ (i18n)
- **Thiết kế chuẩn Apple**: Tối giản, thanh lịch, bo góc mềm mại, độ tương phản cao, hỗ trợ chuyển đổi giao diện Dark / Light Mode theo hệ thống.
- **Đa ngôn ngữ**: Hỗ trợ đầy đủ **Tiếng Việt** và **English**, chuyển đổi tức thì không cần tải lại trang.

---

## 🛠️ Cài đặt & Khởi chạy

### Yêu cầu hệ thống
- Node.js 18 trở lên
- Trình duyệt khuyến nghị: **Google Chrome** hoặc **Microsoft Edge** (để tận dụng File System Access API)

### 1. Cài đặt thư viện
```bash
npm install
```

### 2. Chạy môi trường phát triển (Dev)
```bash
npm run dev
```
Truy cập [http://localhost:3000](http://localhost:3000) trên trình duyệt.

### 3. Kiểm tra mã nguồn (Lint)
```bash
npm run lint
```

### 4. Đóng gói sản phẩm (Production Build)
```bash
npm run build
npm start
```

---

## 📁 Cấu trúc thư mục

```text
listening-dictation-app/
├── app/
│   ├── globals.css            # Design tokens (colors, radii, shadows, typography)
│   ├── layout.tsx             # Root Layout (Metadata, fonts, theme)
│   └── page.tsx               # Dynamic client wrapper (ssr: false)
├── components/
│   ├── dictation-app.tsx      # Core state controller & interactive app logic
│   ├── welcome-screen.tsx     # Màn hình chào mừng khi chưa chọn thư mục
│   ├── sidebar.tsx            # Thanh điều hướng (danh sách tệp, lọc, tìm kiếm)
│   ├── sidebar-file-item.tsx  # Item hiển thị tệp âm thanh kèm ref cuộn
│   ├── track-header.tsx       # Tiêu đề bài nghe, đếm số thứ tự & gắn sao
│   ├── player-card.tsx        # Trình phát audio WaveSurfer & nút điều khiển
│   ├── toolbar-card.tsx       # Thanh công cụ tùy chỉnh tốc độ, lặp, khoảng nghỉ
│   ├── shortcuts-footer.tsx   # Gợi ý phím tắt nhanh ở chân trang
│   ├── shortcuts-dialog.tsx   # Hộp thoại hướng dẫn phím tắt chi tiết
│   ├── reset-dialog.tsx       # Hộp thoại xác nhận đặt lại dữ liệu
│   ├── permission-banner.tsx  # Banner xin lại quyền truy cập thư mục
│   └── ui/                    # Thư viện component dùng chung
│       ├── app-brand.tsx          # Logo & nhận diện thương hiệu
│       ├── language-toggle.tsx    # Nút chuyển đổi Tiếng Việt / English
│       ├── modal.tsx              # Generic Accessible Modal Dialog
│       ├── number-field.tsx       # Ô nhập số kèm nút tăng/giảm stepper
│       ├── segmented-control.tsx  # Nhóm nút chọn dạng viên thuốc (Pill)
│       ├── skip-icon.tsx          # Icon tua lùi/tới kèm số giây
│       ├── slider-field.tsx       # Slider kéo thanh trượt tùy chỉnh
│       └── switch.tsx             # Nút gạt bật/tắt (Toggle switch)
├── hooks/
│   ├── use-audio-player.ts        # Audio engine (HTMLAudioElement, WaveSurfer, Pitch)
│   ├── use-dictation-loop.ts      # Vòng lặp dictation (Lặp N lần, nghỉ X giây, đếm ngược)
│   ├── use-folder-library.ts      # Quản lý thư mục (File System API, IndexedDB, lọc & tìm kiếm)
│   └── use-keyboard-shortcuts.ts  # Hệ thống phím tắt toàn cục (Keyboard hotkeys)
├── lib/
│   ├── db.ts                  # Quản lý IndexedDB lưu Directory Handle
│   ├── file-system.ts         # Xử lý File System Access API & Natural Sort
│   ├── i18n.tsx               # Provider & Context quản lý đa ngôn ngữ (vi/en)
│   └── storage.ts             # LocalStorage helper (Settings, Session, Marks)
└── messages/
    ├── vi.json                # Bản dịch Tiếng Việt
    └── en.json                # Bản dịch Tiếng Anh
```

---

## 📜 Giấy phép
Dự án được phân phối dưới giấy phép MIT.
