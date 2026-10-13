# VAI TRÒ
Bạn là senior front-end engineer. Hãy xây MVP hoàn chỉnh, chạy được, code sạch, dễ đọc.

# SẢN PHẨM: Trình phát audio cho nghe chép chính tả
- Vấn đề: người dùng có 1 folder chứa nhiều file audio (chủ yếu test nghe ETS TOEIC, ~100 file, mỗi file là 1 câu ngắn). Cần nghe liên tục nhiều file, lặp từng câu nhiều lần, chỉnh tốc độ, tua nhanh bằng bàn phím.
- Người dùng: người luyện nghe chép chính tả (dictation).
- Giá trị cốt lõi: chọn folder một lần, nghe lặp/auto next hoàn toàn bằng bàn phím, lần sau mở lại là tiếp tục ngay.

# PHẠM VI MVP (P0)
1. Không đăng nhập, không backend, không DB, không upload file lên server.
2. Chọn folder trên máy → tự đọc và liệt kê file audio (sắp xếp natural sort: 1, 2, 10, 100).
3. Player: phát/dừng, tua ±N giây, file trước/sau, tốc độ, âm lượng, sóng âm, hiển thị % tiến độ và thời gian hiện tại/tổng.
4. Toolbar cấu hình (xem mục TOOLBAR).
5. Auto next, lặp N lần, nghỉ giữa các lần/file.
6. Phím tắt (xem mục PHÍM TẮT).
7. Đánh dấu file ("đã nghe", "khó/nghe lại" dạng star), tìm kiếm và lọc danh sách file.
8. Lưu settings + file cuối cùng; mở lại là tiếp tục.
9. Reset state + chọn lại folder (có dialog xác nhận).
10. 2 ngôn ngữ vi/en (mặc định vi), chuyển không cần reload.
11. Dark/light theo hệ thống.

**Không làm:** đăng nhập, backend, ghi chú/gõ bài chép trong app, PWA offline, chia sẻ, A-B repeat, shuffle, lưu vị trí giây.

# TECH STACK & QUYẾT ĐỊNH KỸ THUẬT (đã chốt)
- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui. Sóng âm: wavesurfer.js.
- Toàn bộ chạy client-side. Audio không rời khỏi máy người dùng.
- Đọc folder: **File System Access API (`showDirectoryPicker`)**.
- Lưu trữ: `localStorage` cho settings/session/marks; `IndexedDB` cho folder handle.
- Trình duyệt mục tiêu: Chrome, Safari; Windows, macOS.
- **Safari không hỗ trợ `showDirectoryPicker`** → dùng fallback `<input type="file" webkitdirectory>`:
  - Không ghi nhớ được folder: mỗi lần mở lại phải chọn lại folder.
  - Sau khi chọn lại, nếu tên folder khớp session cũ thì tự chọn lại file cuối đã nghe.
  - Hiện thông báo rõ: "Trình duyệt này không nhớ folder, bạn cần chọn lại mỗi lần".
  - Tự phát hiện bằng feature detection (`'showDirectoryPicker' in window`), không dò User-Agent.
- Chrome: khi mở lại, lấy handle từ IndexedDB, gọi `queryPermission`; nếu cần thì hiện nút "Cấp quyền lại" (`requestPermission` phải gọi từ thao tác click).
- Định dạng hỗ trợ: `.mp3`, `.m4a`, và các audio phổ biến khác (`.wav`, `.aac`, `.ogg`, `.flac`) nếu trình duyệt phát được. File không phát được → đánh dấu lỗi, không crash.
- Dùng **1 phần tử audio duy nhất** cho cả phiên (đổi `src` bằng object URL, nhớ `revokeObjectURL`) để auto next không bị Safari chặn autoplay.
- Đổi tốc độ phải giữ cao độ: đặt `preservesPitch = true` (và `webkitPreservesPitch` cho Safari).
- Sóng âm với file ngắn decode bình thường; nếu file > 20MB thì bỏ qua decode, hiện thanh tiến độ đơn giản.

# DATA MODEL
```ts
type Settings = {
  language: 'vi' | 'en';        // mặc định 'vi'
  playbackRate: 0.5 | 0.75 | 1 | 1.25 | 1.5; // mặc định 1
  volume: number;               // 0–1
  skipSeconds: number;          // bước tua, mặc định 5
  autoNext: boolean;            // mặc định true
  repeatCount: number;          // số lần phát mỗi file, 1–99, mặc định 1
  gapSeconds: number;           // nghỉ giữa các lần/file, 0–30, mặc định 2
  sidebarCollapsed: boolean;
};

type Session = {
  folderName: string;
  lastFile: string;             // chỉ lưu tên file, KHÔNG lưu vị trí giây
};

type Marks = {                  // key = folderName
  [folderName: string]: {
    [fileName: string]: { listened?: boolean; star?: boolean };
  };
};

// Runtime (không lưu): files: { name: string; file: File }[]
// IndexedDB: key 'folderHandle' → FileSystemDirectoryHandle (chỉ Chrome)
```

# MÀN HÌNH: 1 PAGE DUY NHẤT
## Màn hình chào (chưa chọn folder)
Lời chào, mô tả ngắn công dụng, nút "Chọn thư mục audio". Nếu trình duyệt là Safari, hiện ghi chú về hạn chế nhớ folder.

## Layout chính
**Sidebar** (có nút thu gọn/mở rộng; tự thu gọn khi màn hình < 768px, người dùng vẫn mở/đóng thủ công được):
- Nút cài đặt → dialog chọn/đổi folder
- Tên folder hiện tại
- Ô tìm kiếm + bộ lọc: Tất cả / Đã nghe / Chưa nghe / Star
- Danh sách file (highlight file đang phát, icon trạng thái đã nghe, nút star)
- Nút Reset state
- Nút đổi ngôn ngữ

**Màn hình chính:**
- Tên file đang phát, vị trí trong danh sách ("12 / 100")
- Sóng âm (click để tua), thời gian hiện tại / tổng, % tiến độ
- Nút điều khiển: file trước, tua lùi, phát/dừng, tua tới, file sau, replay
- Toolbar cấu hình

# TOOLBAR (nhập/chỉnh trực tiếp, lưu ngay)
| Điều khiển | Kiểu | Giá trị |
|---|---|---|
| Tốc độ | nhóm nút chọn | 0.5, 0.75, 1, 1.25, 1.5 |
| Âm lượng | slider | 0–100% |
| Tua mỗi lần | slider kéo tùy chọn | 1–30 giây (bước 1) |
| Số lần lặp mỗi file | ô nhập số tự do | 1–99 |
| Nghỉ giữa các lần/file | ô nhập số tự do | 0–30 giây |
| Auto next | switch | bật/tắt |

Logic phát: phát file → hết file thì nghỉ `gapSeconds` → lặp lại đến đủ `repeatCount` → nếu `autoNext` bật thì nghỉ rồi chuyển file kế; file cuối danh sách thì dừng. Người dùng bấm tay (next/prev/replay/chọn file) thì hủy bộ đếm lặp và nghỉ hiện tại.

# PHÍM TẮT
| Phím | Hành động |
|---|---|
| `Space` | Phát / dừng |
| `←` / `→` | Tua lùi / tới theo `skipSeconds` |
| `↑` / `↓` | File trước / sau |
| `[` / `]` | Giảm / tăng tốc độ (theo các mức cố định) |
| `R` | Phát lại từ đầu |

Phím tắt **không** kích hoạt khi đang focus ô nhập/tìm kiếm/dialog. Gọi `preventDefault` cho Space và phím mũi tên để không cuộn trang. Hiển thị gợi ý phím tắt trong UI (tooltip hoặc popover).

# UI/UX
- Phong cách tối giản, tương đồng Apple (đen/trắng/xám mờ, bo góc lớn, khoảng trắng rộng, font hệ thống, hiệu ứng blur nhẹ).
- **Desktop-first**, responsive dùng được trên tablet; điện thoại chỉ cần không vỡ layout.
- Dark/light theo `prefers-color-scheme`.
- Animation đơn giản, mượt (chuyển sidebar, đổi file, hover), tôn trọng `prefers-reduced-motion`.
- Đủ trạng thái: loading (đang đọc folder), empty (folder không có audio / lọc không ra kết quả), error (file hỏng, mất quyền folder, trình duyệt không hỗ trợ).
- Dialog xác nhận cho: reset state, đổi folder khi đang có session, xóa dữ liệu.
- Hỗ trợ a11y cơ bản: nút có `aria-label`, focus ring rõ, điều hướng được bằng Tab.
- Toàn bộ chuỗi UI qua file i18n (vi/en), không hard-code.

# TIÊU CHÍ HOÀN THÀNH
- [ ] Chọn folder 100 file → danh sách đúng thứ tự tự nhiên, hiện < 2 giây
- [ ] Phát, dừng, tua, đổi 5 mức tốc độ (giữ cao độ), đổi âm lượng hoạt động
- [ ] Lặp N lần (nhập tự do) → nghỉ X giây → auto next chạy đúng, file cuối thì dừng
- [ ] Tua bước tùy chỉnh bằng slider hoạt động với `←/→`
- [ ] Toàn bộ phím tắt hoạt động và không kích hoạt khi đang gõ vào ô nhập
- [ ] Đánh dấu đã nghe/star, tìm kiếm, lọc hoạt động và được lưu theo folder
- [ ] Mở lại (F5/đóng mở trình duyệt): khôi phục settings + file cuối (Chrome tự xin lại quyền; Safari yêu cầu chọn lại folder rồi tự chọn lại file cuối)
- [ ] Reset state có dialog xác nhận, xóa sạch localStorage + IndexedDB
- [ ] Sidebar thu/mở được, tự thu khi màn hình < 768px
- [ ] Chuyển vi/en không reload; dark/light theo hệ thống
- [ ] Kiểm thử thủ công trên Chrome và Safari (macOS), Chrome (Windows)
- [ ] `npm run build` không lỗi, console sạch, có README cài đặt & chạy

# CÁCH LÀM VIỆC
1. Đưa kế hoạch + cấu trúc thư mục, chờ tôi xác nhận.
2. Làm theo mốc, chạy thử sau mỗi mốc:
   (1) khung + i18n + theme + UI tĩnh →
   (2) đọc folder + danh sách + tìm kiếm/lọc/star →
   (3) player + sóng âm →
   (4) toolbar + lặp/nghỉ/auto next + phím tắt →
   (5) lưu state + khôi phục + reset →
   (6) hoàn thiện + README.
3. Không thêm tính năng ngoài phạm vi.
4. Thiếu thông tin quan trọng → hỏi tối đa 3 câu trước khi code.
5. Kết thúc mỗi mốc: tóm tắt đã làm, cách chạy, việc còn lại.
