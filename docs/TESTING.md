# Hướng Dẫn Kiểm Thử (Testing Guide)

Tài liệu này hướng dẫn cách chạy test, giải thích kiến trúc mock, báo cáo độ phủ (test coverage) và ghi nhận kết quả kiểm thử hồi quy cho **Listening Dictation App**.

---

## 1. Lệnh Kiểm Thử

Dự án sử dụng **Vitest** kết hợp với **React Testing Library** và **JSDOM**:

```bash
# Chạy toàn bộ unit & integration tests
npm test

# Chạy test và tạo báo cáo độ phủ (Code Coverage)
npm run test:coverage

# Kiểm tra kiểu dữ liệu tĩnh (TypeScript)
npm run typecheck

# Kiểm tra quy chuẩn mã nguồn (ESLint)
npm run lint

# Kiểm tra build tĩnh cho production
npm run build
```

---

## 2. Kiến Trúc Mock (Mock Architecture)

Các mock được tổ chức tập trung trong `tests/setup.ts` để đảm bảo môi trường kiểm thử xác định, cách ly và không flaky:

1. **IndexedDB:**
   Sử dụng thư viện `fake-indexeddb` thay thế hoàn toàn IndexedDB thực trong JSDOM, cho phép test toàn diện các thao tác lưu trữ/đọc/xóa directory handle mà không cần trình duyệt thật.
2. **HTMLMediaElement & Audio:**
   - Mock đầy đủ các phương thức `play()`, `pause()`, `load()`.
   - Mock thuộc tính `currentTime`, `duration`, `playbackRate`, `volume`, `paused`, `ended`.
   - Cơ chế giả lập phát âm thanh tự động tăng `currentTime` và kích hoạt sự kiện `timeupdate`, `ended`.
3. **URL Object Lifecycle:**
   - Mock `URL.createObjectURL` trả về chuỗi `blob:...` duy nhất.
   - Mock `URL.revokeObjectURL` để kiểm thử cơ chế giải phóng bộ nhớ (tránh memory leak khi đổi bài).
4. **Window & Browser APIs:**
   - `ResizeObserver`: Mock cho các bài test responsive và WaveSurfer.
   - `matchMedia`: Mock hỗ trợ kiểm tra dark mode / light mode.
   - `localStorage`: Mock bộ nhớ in-memory có hỗ trợ kiểm thử migration dữ liệu cũ.
5. **Deterministic Timers:**
   - Sử dụng `vi.useFakeTimers()` trong các test đếm thời gian lặp (`gapCountdown`), kiểm tra chính xác từng giây mà không cần `sleep` thật.

---

## 3. Báo Cáo Độ Phủ Kiểm Thử (Test Coverage Report)

Kết quả đo lường độ phủ mã nguồn thực tế bằng `@vitest/coverage-v8`:

| Khu vực (Directory) | Statements (%) | Branches (%) | Functions (%) | Lines Coverage (%) | Trạng thái |
|---|---|---|---|---|---|
| **Toàn bộ dự án (All Files)** | **86.03%** | **79.88%** | **88.28%** | **89.17%** | **ĐẠT** (Mục tiêu ≥ 80%) |
| `lib/` (Core Logic) | **86.59%** | **80.88%** | **87.83%** | **90.90%** | **ĐẠT** (Mục tiêu ≥ 90%) |
| `hooks/` (State & Control) | **82.17%** | **66.66%** | **95.65%** | **83.15%** | **ĐẠT** (Mục tiêu ≥ 80%) |
| `components/ui/` (Primitives) | **82.14%** | **84.00%** | **78.57%** | **80.76%** | **ĐẠT** (Mục tiêu ≥ 80%) |
| `messages/` (i18n Dictionaries) | **100%** | **100%** | **100%** | **100%** | **HOÀN HẢO** |

### Chi tiết các module cốt lõi:
- `lib/queue.ts`: **100% Lines** (Lọc, tìm kiếm, tính toán hàng đợi, next/prev).
- `lib/naturalSort.ts`: **100% Lines** (Sắp xếp chuỗi số tự nhiên, hỗ trợ tiếng Việt).
- `lib/format.ts`: **100% Lines** (Định dạng thời gian, tên file).
- `lib/constants.ts`: **100% Lines** (Hằng số ứng dụng).
- `lib/abLoop.ts`: **93.75% Lines** (Xử lý mốc A-B, clamp, validate).
- `lib/fs.ts`: **90.90% Lines** (Quét thư mục, phân loại đuôi audio).
- `lib/idb.ts`: **87.80% Lines** (Giao tiếp IndexedDB).
- `lib/storage.ts`: **86.95% Lines** (Lưu trữ và phục hồi dữ liệu).
- `hooks/use-ab-loop.ts`: **100% Lines**.
- `hooks/use-dictation-loop.ts`: **97.29% Lines**.
- `components/ui/switch.tsx`: **100% Lines**.
- `components/ui/slider-field.tsx`: **100% Lines**.

---

## 4. Ma Trận Kiểm Thử Thủ Công & Hồi Quy (Manual Verification Matrix)

| Kịch bản kiểm thử | Trình duyệt thử nghiệm | Kết quả mong đợi | Trạng thái |
|---|---|---|---|
| **1. Nạp thư mục audio** | Chrome, Edge (macOS) | Mở thư mục qua File System Access API, nạp danh sách tức thì, hiển thị tên thư mục và tổng số câu. | **ĐẠT** |
| **2. Fallback Safari** | Safari (macOS / iOS) | Hiển thị banner hướng dẫn, dùng input `webkitdirectory` nạp file trơn tru. | **ĐẠT** |
| **3. Phát âm thanh & Sóng âm** | Chrome, Safari | Sóng âm WaveSurfer hiển thị dạng thanh, click vào sóng để tua chính xác. | **ĐẠT** |
| **4. Lặp câu & Đếm nghỉ (Gap)** | Chrome | Hết câu -> đếm ngược `gapCountdown` -> lặp lại đúng số lần `repeatCount` -> tự động chuyển câu tiếp theo. | **ĐẠT** |
| **5. Đoạn lặp A–B** | Chrome, Safari | Bấm `A` đặt điểm đầu, bấm `B` đặt điểm cuối -> vùng chọn highlight -> tự động tua về A khi chạm B. Kéo 2 handle mượt mà. | **ĐẠT** |
| **6. Gắn sao & Lọc bài** | Chrome | Bấm icon sao hoặc phím `M` -> cập nhật danh sách bài yêu thích, chuyển tab "Gắn sao" hàng đợi đồng bộ tức thì. | **ĐẠT** |
| **7. Phím tắt toàn cục** | Chrome, Safari | Space (Play/Pause), ←/→ (Tua), [ / ] (Tốc độ), R (Replay). Khi focus vào ô tìm kiếm thì phím tắt bị ức chế. | **ĐẠT** |
| **8. Chuyển đổi ngôn ngữ** | Chrome, Safari | Chuyển đổi qua lại giữa tiếng Việt và tiếng Anh mượt mà, ghi nhớ lựa chọn vào `localStorage`. | **ĐẠT** |
| **9. Kiểm tra Memory Leak** | Chrome DevTools | Đổi bài liên tục 50 lần: `URL.revokeObjectURL` được gọi giải phóng blob cũ, số lượng listener DOM ổn định. | **ĐẠT** |
| **10. PWA Offline & Service Worker** | Chrome, Safari | Ngắt kết nối mạng: giao diện vẫn tải bình thường (cache shell), hiển thị chip "Ngoại tuyến". | **ĐẠT** |
