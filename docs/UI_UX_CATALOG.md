# HỆ THỐNG GIAO DIỆN & CATALOG THÀNH PHẦN (UI/UX CATALOG & DESIGN SYSTEM)

> **Dự án:** Nghe chép — Audio Dictation Player (`listening-dictation-app`)  
> **Ngôn ngữ thiết kế:** Apple-inspired Minimalist (Dark/Light Mode, Bo góc lớn, Flat & Frosted Glass)  
> **Nguồn sự thật:** `app/globals.css`, `components/ui/*`, `components/*`, runtime UI và `.spec/phase-2/`

---

## 1. Danh Mục Màn Hình & Bố Cục (Screen Inventory)

Ứng dụng là một Single Page Application (SPA) điều hướng theo trạng thái:

```
                  ┌───────────────────────────────┐
                  │       Truy cập ứng dụng        │
                  │        (app/page.tsx)         │
                  └───────────────┬───────────────┘
                                  │
                 {Đã chọn thư mục âm thanh?}
                  ┌───────────────┴───────────────┐
                  ▼ (Chưa có folder)              ▼ (Đã có folder)
      ┌───────────────────────────────┐ ┌───────────────────────────────┐
      │     MÀN HÌNH CHÀO (WELCOME)   │ │    WORKSPACE CHÍNH (PLAYER)   │
      │  (DictationWelcomeView.tsx)   │ │     (DictationLayout.tsx)     │
      └───────────────────────────────┘ └───────────────────────────────┘
```

### 1.1. Màn Hình Chào (Welcome Screen View)
Hiển thị khi người dùng chưa chọn thư mục audio nào (`!hasFolder`).
- **Header:** Logo thương hiệu `AppBrand`, badge `OfflineBadge`, nút chuyển ngữ `LanguageToggle`.
- **Hero Section (`WelcomeHero`):**
  - Pill nhãn phong cách kính mờ: *"Luyện nghe chép chính tả"*.
  - Tiêu đề 84px: Dòng 1 đen mực *"Nghe từng câu."*, Dòng 2 tô gradient 3 màu *"Chép từng chữ."* (`#0071e3` ➔ `#7c4dff` ➔ `#d9480f`).
  - Nút bấm chính (CTA): *"Chọn thư mục audio"* (58px, đen, bo tròn).
  - Nút bấm phụ: *"Xem phím tắt"* (mở `ShortcutsDialog`).
  - Chú thích bảo mật: Icon ổ khóa với dòng chữ *"Không tải file lên đâu cả · Cài như ứng dụng · Dùng được khi ngoại tuyến"*.
- **Thẻ Preview Player Nổi (`WelcomePreviewPlayer`):**
  - Thẻ Glassmorphism mờ tím nhạt với 56 cột sóng âm "thở" staggered sine wave.
  - Minh họa trực quan vùng lặp A-B từ 25% đến 64.3%.
  - *Lưu ý kỹ thuật:* Các nút điều khiển trên thẻ này (`WelcomePreviewControls`) là **mockup minh họa** (`aria-hidden="true"`), không gắn kết với audio engine thật.
- **4 Chip Tính Năng Nổi (`WelcomeFloatingChips`):**
  - "Lặp 3 lần" (Icon xanh), "Tốc độ 0.75×" (Icon cam), "Ôn lại câu khó" (Icon hồng), "Lặp đoạn A–B" (Icon tím).
  - Tự động ẩn trên màn hình tablet/mobile (≤ 1040px).
- **Thư Mục Gần Đây (`WelcomeRecentFolders`):**
  - Tự động xuất hiện khi `localStorage` có dữ liệu phiên cũ (`dictation_recent_folders`).
  - Cho phép người dùng mở lại thư mục đang học dở với 1 click.
- **3 Thẻ Giới Thiệu Tính Năng (`WelcomeFeatures`):** Lặp câu & đoạn con, Thiết kế cho bàn phím, Ôn lại câu khó.
- **Banner Safari (`WelcomeSafariBanner`):** Chỉ hiển thị trên trình duyệt Safari thông báo về đặc tính sandbox của WebKit.

---

### 1.2. Màn Hình Chính (Main Workspace View)
Hiển thị ngay khi thư mục được nạp thành công (`hasFolder === true`).
- **Sidebar Trái (`Sidebar`):**
  - Header: Tên thư mục, tổng số câu, số câu đã nghe hoàn thành.
  - Nút đổi thư mục & nút Reset dữ liệu.
  - Ô tìm kiếm tệp tức thời.
  - 4 tab bộ lọc: Tất cả / Chưa nghe / Đã nghe / Gắn sao.
  - Danh sách cuộn các bài audio (`SidebarFileItem`) với STT tự nhiên, icon sao và icon đã nghe.
  - Nút Cài đặt ứng dụng PWA (`InstallButton`).
- **Workspace Phải (`AppMainWorkspace`):**
  - **PermissionBanner:** Hiện khi trình duyệt Chromium cần xin lại quyền đọc folder sau khi F5.
  - **TrackHeader:** Tên bài hiện tại, chip hàng đợi (`QueueChip`), nút ngôi sao, nút mở phím tắt.
  - **PlayerCard:**
    - Canvas sóng âm WaveSurfer (hoặc seekbar fallback nếu file > 20MB).
    - Lớp phủ A-B Loop highlight (`WaveformRegion`) với 2 tay cầm kéo rê chuột.
    - Bộ đếm thời gian thực và % tiến độ (`00:03 / 00:15 · 20%`).
    - Hàng nút điều khiển: Prev, Tua lùi, Phát/Dừng tròn 76px, Tua tới, Next, Replay.
    - Nhóm nút A-B (`Đặt A`, `Đặt B`, `✕ Xóa`) và Pill trạng thái đếm ngược nghỉ (`isWaitingGap`).
  - **ToolbarCard:**
    - 5 nút pill chọn tốc độ: `0.5x`, `0.75x`, `1.0x`, `1.25x`, `1.5x`.
    - Slider âm lượng (0% – 100%) kèm nút toggle Mute icon loa.
    - Slider bước tua nhảy (1s – 30s).
    - Ô nhập số lần lặp mỗi file (1 – 99).
    - Ô nhập khoảng nghỉ giữa các lần lặp (0s – 30s).
    - Switch bật/tắt tự chuyển câu (`autoNext`).
  - **ShortcutsFooter:** Dòng gợi ý phím tắt chân trang, phím sáng đèn khi người dùng gõ.

---

### 1.3. Hộp Thoại (Modals & Dialogs)
- **Modal Phím Tắt (`ShortcutsDialog`):** Bảng tra cứu 13 phím tắt bàn phím kèm huy hiệu kbd rõ ràng.
- **Modal Xác Nhận Đặt Lại (`ResetDialog`):** Cảnh báo hành động nguy hiểm xóa sạch lịch sử và cài đặt, có nút "Hủy" và nút "Đặt lại" màu đỏ.

---

## 2. Catalog Thành Phần Tái Sử Dụng (Canonical UI Components)

Khi phát triển tính năng mới, **BẮT BUỘC** tái sử dụng các component tại `components/ui/` thay vì viết mới:

| Component | Đường Dẫn File | Mục Đích | Props Chính | Ghi Chú A11y & Behavior |
|---|---|---|---|---|
| **Modal** | `components/ui/modal.tsx` | Hộp thoại overlay chuẩn | `isOpen`, `onClose`, `title`, `children`, `maxWidth` | Bắt phím `Escape`, bẫy focus, backdrop blur, animation `animate-modal-pop` |
| **SegmentedControl** | `components/ui/segmented-control.tsx` | Điều khiển nhóm tab / nấc chọn | `options: { value, label }[]`, `value`, `onChange`, `variant: "default" \| "pill"` | Hỗ trợ 2 kiểu giao diện: sunken tab hoặc pill button có viền |
| **SliderField** | `components/ui/slider-field.tsx` | Thanh trượt kéo kèm nhãn | `label`, `min`, `max`, `value`, `displayValue`, `onChange`, `icon` | Tùy biến thumb tròn 18px bo bóng, ẩn focus outline thô |
| **NumberField** | `components/ui/number-field.tsx` | Ô nhập số tự do kèm đơn vị | `label`, `min`, `max`, `value`, `unit`, `onChange` | Ẩn mũi tên spinner mặc định của browser, hỗ trợ gõ phím trực tiếp |
| **Switch** | `components/ui/switch.tsx` | Công tắc bật/tắt On/Off | `checked`, `onCheckedChange`, `ariaLabel`, `disabled` | Kích thước chuẩn iOS 51x31px, thumb 27px trượt mượt mà |
| **LanguageToggle** | `components/ui/language-toggle.tsx` | Nút đổi ngôn ngữ VI / EN | Không cần props (tự kết nối với `useI18n`) | Cập nhật `document.documentElement.lang` và lưu `localStorage` |
| **AppBrand** | `components/ui/app-brand.tsx` | Logo ứng dụng | `className`, `collapsed` | Tự động co giãn khi sidebar thu gọn |
| **SkipIcon** | `components/ui/skip-icon.tsx` | Icon tua kèm số giây | `direction: "forward" \| "backward"`, `seconds: number` | Hiển thị số giây thực tế bên trong mũi tên tua |

---

## 3. Hệ Thống Design Tokens (CSS Variables)

Tất cả các biến màu, bóng và bo góc được định nghĩa tập trung trong `app/globals.css`.

### 3.1. Bảng Màu (Light & Dark Palette)

| CSS Variable | Giá Trị Light Mode | Giá Trị Dark Mode | Mục Đích Sử Dụng |
|---|---|---|---|
| `--bg-page` | `#f5f5f7` | `#000000` | Nền toàn bộ trang web |
| `--bg-sidebar` | `#ffffff` | `#0d0d0f` | Nền thanh sidebar danh sách |
| `--bg-card` | `#ffffff` | `#111113` | Nền thẻ PlayerCard và ToolbarCard |
| `--bg-subtle` | `#f5f5f7` | `#1c1c1e` | Nền pill, badge, hàng hover |
| `--bg-seg-container` | `#ececf0` | `#1c1c1e` | Nền hộp chứa SegmentedControl |
| `--bg-seg-active` | `#ffffff` | `#48484a` | Nền nấc đang chọn của SegmentedControl |
| `--text-primary` | `#1d1d1f` | `#f5f5f7` | Chữ chính, tiêu đề, nút phát |
| `--text-secondary` | `#6e6e73` | `#a1a1a6` | Nhãn phụ, thời gian, chú thích |
| `--text-tertiary` | `#3a3a3c` | `#a1a1a6` | Chữ nấc chưa chọn |
| `--border-default` | `#e5e5ea` | `#1f1f22` | Viền sidebar, viền phân cách |
| `--border-card` | `rgba(0,0,0,0.04)` | `#232326` | Viền thẻ nổi |
| `--border-input` | `#d2d2d7` | `#3a3a3c` | Viền ô nhập và pill buttons |
| `--accent-btn` | `#1d1d1f` | `#f5f5f7` | Màu nền nút chính (Play, Pill on) |
| `--accent-btn-text` | `#ffffff` | `#1d1d1f` | Màu chữ trên nền nút chính |
| `--waveform-played` | `#1d1d1f` | `#f5f5f7` | Màu cột sóng đã phát qua |
| `--waveform-unplayed` | `#c7c7cc` | `#48484a` | Màu cột sóng chưa phát |
| `--danger` | `#d70015` | `#ff6961` | Màu cảnh báo, nút Đặt lại dữ liệu |
| `--danger-bg` | `#fdecee` | `#2a1215` | Nền thông báo lỗi |
| `--focus-ring` | `#0071e3` | `#64d2ff` | Vòng sáng focus bàn phím |

---

### 3.2. Hệ Thống Bo Góc & Bóng Đổ (Radii & Shadows)
- **Bo góc (Border Radius):**
  - Thẻ lớn (`PlayerCard`, `ToolbarCard`): `24px` – `28px` (`rounded-[24px]`, `rounded-[28px]`).
  - Hộp thoại modal: `24px` (`rounded-[24px]`).
  - Hàng tệp (`FileRow`): `12px` (`rounded-xl`).
  - Nút pill & Badges: `9999px` (`rounded-full`).
  - Ô nhập & công tắc: `12px` (`rounded-xl`).
- **Bóng đổ (Shadows):**
  - `--shadow-card`: `0 1px 2px rgba(0,0,0,.04), 0 12px 32px rgba(0,0,0,.05)` (chiều sâu mềm).
  - `--shadow-play`: `0 6px 18px rgba(0,0,0,.25)` (tạo độ nổi cho nút phát tròn).
  - `--shadow-dialog`: `0 24px 60px rgba(0,0,0,.28)` (cho modal hộp thoại).

---

### 3.3. Typography
- **Font chữ:** Font hệ thống Apple mượt mà:
  ```css
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, sans-serif;
  ```
- **Tabular Nums:** Mọi hiển thị số liệu thời gian (`00:05 / 00:15`), số thứ tự bài (`12 / 100`), phần trăm (`85%`) bắt buộc dùng class `tabular-nums` để tránh giật giao diện khi số thay đổi.

---

## 4. Quy Chuẩn Đáp Ứng & Breakpoints (Responsive Conventions)

| Điểm Ngắt (Breakpoint) | Kích Thước | Ứng Xử Giao Diện |
|---|---|---|
| **Desktop Rộng** | `> 1040px` | Hiển thị đầy đủ 4 chip nổi và các hiệu ứng sao lấp lánh trên Welcome Screen |
| **Desktop Tiêu Chuẩn** | `769px – 1040px` | Ẩn các chip nổi Welcome để tránh tràn ngang; Workspace chính mở rộng tối đa `1120px` căn giữa |
| **Tablet** | `768px` | Sidebar chuyển sang chế độ tự thu gọn (`collapsed = true`) hoặc hiển thị thanh icon hẹp |
| **Mobile** | `< 768px` | Sidebar chuyển thành ngăn kéo trượt (drawer) phủ lên; PlayerCard co padding xuống `20px 18px`; nút bấm giữ kích thước chạm tối thiểu `44px` |

---

## 5. Điểm Khác Biệt Giữa Thiết Kế Mẫu (Prototype) & Triển Khai Thực Tế

| Thành Phần / Tính Năng | Đặc Tả / Mockup Gốc (`.spec/phase-2/`) | Triển Khai Thực Tế Trong Mã Nguồn |
|---|---|---|
| **Dark Mode** | `DESIGN.md` §89: *"Không có dark mode, không dùng bản tối"* | **Đã hoàn thiện 100%:** Hỗ trợ tự động qua CSS variables và `useDarkMode` |
| **Nút Shuffle & Chế độ ngẫu nhiên** | `SPEC_PHASE2.md` §2: Đề xuất Shuffle nút tròn 48px, phím `M`, chip `Ngẫu nhiên` | **Chưa triển khai (Unimplemented):** Mã nguồn không có hàm shuffle, không có nút shuffle |
| **Ý nghĩa phím `M`** | `SPEC_PHASE2.md`: Gán cho Shuffle | **Triển khai thực tế:** Gán cho **Toggle Mute** (Tắt/Bật âm lượng) |
| **Interactive Preview Player** | `DESIGN.md`: Ngụ ý tương tác được trên trang chào | **Triển khai thực tế:** Là component trang trí (`aria-hidden="true"`), player thật chỉ chạy khi nạp thư mục |
| **Thư viện Icon** | `DESIGN.md` §56: *"Không dùng thư viện icon, dùng inline SVG"* | **Triển khai thực tế:** Sử dụng `lucide-react` để đảm bảo tính nhất quán và khả năng bảo trì cao |

