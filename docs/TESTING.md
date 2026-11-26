# HƯỚNG DẪN KIỂM THỬ TOÀN DIỆN (TESTING GUIDE)

> **Dự án:** Nghe chép — Audio Dictation Player (`listening-dictation-app`)  
> **Test Runner:** Vitest 5.0.4 + React Testing Library 16.3.3 + JSDOM 30.1.3  
> **Hiện trạng:** 17 test suites, 64 tests passed (100% pass rate)

---

## 1. Lệnh Kiểm Thử Hệ Thống

Chạy các lệnh kiểm thử từ thư mục gốc của repository:

```bash
# 1. Chạy toàn bộ 64 test suites (Chạy nhanh, cách ly)
npm test

# 2. Chạy test và xuất báo cáo độ phủ mã nguồn (v8 coverage)
npm run test:coverage

# 3. Kiểm tra tính toàn vẹn kiểu dữ liệu tĩnh (TypeScript strict mode)
npm run typecheck

# 4. Kiểm tra quy chuẩn mã nguồn (ESLint 9)
npm run lint

# 5. Kiểm tra build xuất bản tĩnh (Next.js Turbopack static export)
npm run build
```

---

## 2. Kiến Trúc Giả Lập Trình Duyệt (Mock Architecture)

Các giả lập API trình duyệt được tổ chức tập trung trong thư mục `tests/setup/`:

### 2.1. Giả Lập Môi Trường Web (`tests/setup/browser-mocks.ts`)
1. **IndexedDB (`fake-indexeddb`):**
   - Thay thế toàn bộ implementation `window.indexedDB` trong JSDOM bằng in-memory IndexedDB của `fake-indexeddb`.
   - Cho phép kiểm thử đầy đủ các thao tác đọc/ghi/xóa directory handle của `lib/idb.ts`.
2. **HTMLMediaElement & Audio Engine:**
   - Giả lập prototype của `HTMLMediaElement`: `play()`, `pause()`, `load()`.
   - Giả lập các thuộc tính: `currentTime`, `duration`, `playbackRate`, `volume`, `paused`, `ended`.
   - Cơ chế phát giả lập có khả năng kích hoạt đúng thứ tự các sự kiện `play`, `pause`, `timeupdate`, `ended`.
3. **URL Object & Quản lý Bộ Nhớ:**
   - `URL.createObjectURL`: Trả về chuỗi giả lập dạng `blob:mock-uuid`.
   - `URL.revokeObjectURL`: Ghi nhận các lệnh thu hồi để kiểm chứng không bị rò rỉ bộ nhớ (memory leak).
4. **Window APIs:**
   - `ResizeObserver`: Mock cho các component co giãn đáp ứng và WaveSurfer canvas.
   - `matchMedia`: Giả lập phản hồi cho Dark Mode (`prefers-color-scheme: dark`) và PWA Standalone mode.
   - `requestAnimationFrame` & `cancelAnimationFrame`: Giả lập phục vụ test vòng lặp A-B watcher.
5. **Deterministic Timers:**
   - Sử dụng `vi.useFakeTimers()` trong các test đếm thời gian lặp (`useDictationLoop`), kiểm tra chính xác từng giây đếm ngược `gapCountdown` mà không phụ thuộc vào đồng hồ thật của CPU.

### 2.2. Giả Lập Hệ Thống Tệp (`tests/setup/fs-mocks.ts`)
- Giả lập `FileSystemDirectoryHandle` và `FileSystemFileHandle` để kiểm thử hàm quét đệ quy `readFilesFromDirectoryHandle` và phân loại file audio mà không cần mở hộp thoại thực tế của hệ điều hành.

---

## 3. Danh Sách Các Bộ Test Hiện Tại (17 Test Suites / 64 Tests)

```text
tests/
├── components/
│   └── ui.test.tsx                  # 4 tests (Switch, SliderField, SegmentedControl, Modal)
├── hooks/
│   ├── useAbLoop.test.ts            # 4 tests (setPointA, setPointB, swap, clear)
│   ├── useAudioElement.test.ts      # 2 tests (Object URL creation, playback rate preservation)
│   ├── useDictationLoop.test.ts     # 5 tests (Interval countdown, cancel timer, repeat counter)
│   ├── useKeyboardShortcuts.test.ts # 2 tests (Shortcut dispatching, editable element suppression)
│   ├── useOnlineStatus.test.ts      # 1 test  (Window online/offline event listener)
│   └── useRepeatController.test.ts  # 3 tests (Audio ended repeat, gap wait, 85% auto-listened)
└── unit/
    ├── abLoop.test.ts               # 5 tests (Pure A-B loop boundary calculations, clamp, swap)
    ├── format.test.ts               # 3 tests (Time formatting mm:ss / hh:mm:ss, filename format)
    ├── fs.test.ts                   # 3 tests (Audio file extension matching, directory parsing)
    ├── i18n.test.ts                 # 2 tests (Translation lookup vi/en, dictionary completeness)
    ├── idb.test.ts                  # 2 tests (IndexedDB save, get, clear folder handle)
    ├── keyboard.test.ts             # 3 tests (Key event classification, modifier rejection)
    ├── naturalSort.test.ts          # 5 tests (Natural sort TOEIC files, Vietnamese accents)
    ├── pwa.test.ts                  # 5 tests (Standalone detection, service worker register)
    ├── queue.test.ts                # 6 tests (Queue building, filter tabs, next/prev navigation)
    └── storage.test.ts              # 9 tests (LocalStorage settings, marks, session, migration)
```

---

## 4. Báo Cáo Đo Lường Độ Phủ (Coverage Report) & Bảng Sai Lệch

### 4.1. Kết Quả Đo Lường Thực Tế Hiện Tại (`@vitest/coverage-v8`)
Được đo lường trực tiếp bằng lệnh `npm run test:coverage`:

| Khu Vực (Directory / File) | Statements (%) | Branches (%) | Functions (%) | Lines Coverage (%) | Đánh Giá Ngưỡng |
|---|---|---|---|---|---|
| **Toàn bộ dự án (All Files)** | **77.99%** | **68.67%** | **77.39%** | **80.99%** | **Chưa đạt ngưỡng toàn cục** |
| `components/ui/` | **82.14%** | **84.00%** | **78.57%** | **80.76%** | Đạt chỉ tiêu cơ sở |
| `hooks/` | **64.11%** | **33.62%** | **63.15%** | **66.79%** | Thiếu test các case rẽ nhánh |
| `lib/` (Core Logic) | **86.73%** | **80.88%** | **88.00%** | **91.01%** | **Rất tốt** (Lines > 90%) |
| `messages/` (i18n) | **100.00%** | **100.00%** | **100.00%** | **100.00%** | **Hoàn hảo** |

### 4.2. Ghi Nhận Sai Lệch Giữa Tài Liệu Cũ và Thực Tế (Audit Finding)
> [!WARNING]
> Trong tài liệu `docs/TESTING.md` phiên bản cũ ghi nhận:
> - *Statements: 86.03%, Branches: 79.88%, Functions: 88.28%, Lines: 89.17% (ĐẠT toàn bộ).*
>
> **Thực tế kiểm tra hiện tại:**
> Lệnh `npm run test:coverage` kích hoạt 3 lỗi do không vượt qua ngưỡng cấu hình trong `vitest.config.ts`:
> - `ERROR: Coverage for functions (77.39%) does not meet global threshold (80%)`
> - `ERROR: Coverage for statements (77.99%) does not meet global threshold (80%)`
> - `ERROR: Coverage for branches (68.67%) does not meet global threshold (75%)`
>
> *Nguyên nhân:* Một số file hook (`use-audio-element.ts`, `use-keyboard-shortcuts.ts`, `use-waveform.ts`) có nhiều logic xử lý sự kiện trình duyệt và fallback trình duyệt chưa được viết test giả lập đầy đủ.

### 4.3. Các Vùng Mã Cần Bổ Sung Test (Coverage Gaps)
1. `hooks/use-audio-element.ts`: Các nhánh xử lý lỗi audio (`onError`), khôi phục cao độ Safari (`webkitPreservesPitch`), và dọn dẹp hàng đợi URL.
2. `hooks/use-keyboard-shortcuts.ts`: Test các phím tắt rẽ nhánh (`[`, `]`, `A`, `B`, `X`, `R`, `S`, `M`).
3. `hooks/use-waveform.ts`: Chưa có unit test chuyên biệt do WaveSurfer phụ thuộc Web Audio API phức tạp trong JSDOM.
4. `components/ui/segmented-control.tsx`: Nhánh hiển thị kiểu `pill` vs `default`.

---

## 5. Quy Chuẩn & Chiến Lược Viết Test Cho Tính Năng Mới

Khi phát triển thêm tính năng hoặc sửa đổi mã nguồn:

### 5.1. Viết Unit Test Cho `lib/` (Bắt Buộc 100% Lines Coverage)
- Mọi hàm logic mới thêm vào `lib/` phải đi kèm file test tương ứng trong `tests/unit/*.test.ts`.
- Phải test đủ 3 nhóm trường hợp:
  1. *Happy path:* Dữ liệu đầu vào chuẩn.
  2. *Edge cases:* Mảng rỗng, chuỗi rỗng, số âm, số vượt giới hạn, ký tự Unicode đặc biệt.
  3. *Error cases:* Dữ liệu hỏng, định dạng không hỗ trợ, storage bị đầy.

### 5.2. Viết Hook Test Cho `hooks/`
- Sử dụng `renderHook` và `act` từ `@testing-library/react`.
- Luôn sử dụng `vi.useFakeTimers()` khi hook có liên quan đến `setTimeout`, `setInterval` hoặc `requestAnimationFrame`.
- Đảm bảo cleanup đúng cách khi unmount hook (không để rò rỉ listener).

### 5.3. Viết Component Test Cho `components/ui/`
- Sử dụng `render`, `screen`, `fireEvent` hoặc `@testing-library/user-event`.
- Kiểm tra tính trợ năng (Accessibility): `role`, `aria-label`, phím `Tab`, phím `Enter` / `Space`.

### 5.4. Kiểm Tra Hồi Quy Trước Khi Bàn Giao
Trước khi kết thúc tác vụ, AI Coding Agent phải chạy chuỗi lệnh kiểm tra:
```bash
npm run typecheck && npm run lint && npm test
```
Tất cả 64 test phải xanh và TypeScript/ESLint không có bất kỳ cảnh báo nào.
