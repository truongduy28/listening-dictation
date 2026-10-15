# DESIGN.md — Nghe chép (audio dictation player)

Tài liệu này mô tả **giao diện**. Chức năng và kiến trúc code nằm ở `SPEC.md`. Khi mâu thuẫn: SPEC.md quyết định hành vi, file này quyết định diện mạo.

## Cách dùng bộ handoff
1. Đọc `SPEC.md` rồi file này.2. Dùng `tokens.css` làm nền (CSS variables). Không tự bịa màu, bo góc, bóng ngoài token.
3. Mở `reference/*.html` bằng trình duyệt để xem **mẫu chuẩn**; đó là nguồn sự thật cho khoảng cách, kích thước, cấu trúc. Các file này dùng runtime riêng, nếu chạy không hiện thì đọc như mã nguồn (style inline là thông số chính xác) và xem `screenshots/`.
4. Sau khi code xong mỗi mốc, so sánh với ảnh trong `screenshots/` và sửa cho khớp.

## Triết lý
Tối giản kiểu Apple: nền xám rất nhạt, thẻ trắng bo góc lớn, **một màu nhấn duy nhất là gần-đen (#1d1d1f)**. Không gradient, không emoji, không bóng nặng, không màu thứ hai. Điểm nhấn là nút phát tròn đen lớn và hàng đang chọn nền đen. Khoảng trắng rộng, chữ có thứ bậc rõ.

## Bảng màu (xem tokens.css)
| Token | Dùng cho |
|---|---|
| `--bg` #f5f5f7 | nền trang, nền ô tìm kiếm, nền thẻ phụ |
| `--surface` #fff | sidebar, player card, toolbar card, dialog |
| `--ink` #1d1d1f | chữ chính, nút phát, hàng đang chọn, pill đang chọn, switch bật, cột sóng đã phát |
| `--ink-3` #6e6e73 | nhãn, thời gian, chú thích |
| `--wave-idle` #c7c7cc | cột sóng chưa phát |
| `--danger` #d70015 | chỉ cho "Đặt lại" và nút xác nhận nguy hiểm |
Tỉ lệ tương phản chữ ≥ 4.5:1. Không dùng màu để phân biệt trạng thái một mình (kèm icon/nền).

## Typography
Font hệ thống (`--font`). Số dùng `font-variant-numeric: tabular-nums` (thời gian, số câu, tốc độ).
| Vai trò | Cỡ / đậm | Ghi chú |
|---|---|---|
| Tiêu đề chào | 56px / 600 | letter-spacing -0.035em, line-height 1.05 |
| Tên tệp đang phát | 30px / 600 (tablet 26) | letter-spacing -0.02em |
| Logo / tiêu đề dialog | 17–19px / 600 | |
| Nội dung, hàng tệp | 14–15px / 400–500 | |
| Nhãn toolbar | 12px / 600 | `letter-spacing .02em`, màu `--ink-3` |
| Chú thích | 12–13px | |

## Khoảng cách & bố cục
- Bước 4px. Gap thường dùng: 6, 8, 10, 12, 16, 20, 24, 28.
- **Desktop 1440:** sidebar 320px cố định + vùng chính co giãn, tối đa ~1120px, căn giữa, padding 36×48.
- **Tablet ~820:** sidebar thu thành thanh icon 72px; toolbar chuyển nhiều hàng; vùng chạm ≥ 44px.
- Dưới 768px: sidebar tự thu, mở dạng ngăn kéo.
- Thứ tự dọc vùng chính: tiêu đề tệp → **Player card** → **Toolbar card** → dòng phím tắt.

## Component (thông số chính xác)
**Nút icon (ghost):** 36–52px, tròn hoặc bo 10–14px, nền trong suốt, hover `rgba(0,0,0,.06)`, `:active` scale .96.
**Nút phát/dừng:** tròn 76px (tablet 72), nền `--ink`, icon trắng 30px, `--shadow-primary`. Icon play↔pause cross-fade 180ms.
**Hàng tệp (FileRow):** cao ~40px, padding 9×12, bo 12px; trái là số 3 chữ số (12px, mờ), giữa là tên (cắt `…`), phải là icon đã nghe + sao. Hàng đang chọn: nền `--ink`, chữ trắng. Hover: `rgba(0,0,0,.05)`.
**Segmented (bộ lọc, VI/EN):** nền `--surface-sunken`, padding 2px, bo 10px; mục đang chọn nền trắng + `--shadow-seg`; indicator trượt.
**Speed pill:** 5 nút `0.5× 0.75× 1× 1.25× 1.5×`, cao 40–44px, bo 12px, viền `--line-input`; đang chọn nền `--ink` chữ trắng.
**Slider:** `accent-color: --ink`; nhãn + giá trị ("5 giây", "80%") ở trên/bên phải.
**NumberField (lặp, nghỉ):** rộng 60–64px, cao 40–44px, giữa chữ, bo 12px, viền `--line-input`, kèm đơn vị ("lần", "giây").
**Switch:** 51×31, bo tròn, bật = nền `--ink`; knob 27px trắng + bóng nhẹ.
**Sóng âm:** thanh cột (không canvas viền), cột rộng đều, bo 3px, cao 112–132px, gap 3px; cột đã phát `--ink`, chưa phát `--wave-idle`; click để tua.
**Chip trạng thái lặp:** viên thuốc nền `--bg`, icon lặp + "Lặp 2/3 · chuyển câu sau 2 giây", 13px.
**Card:** nền trắng, bo 22–28px, `--shadow-card`, padding 22–32px.
**Dialog:** rộng tối đa 360px, bo 24px, nền trắng, `--shadow-dialog`, scrim `--scrim`; icon tròn 48px ở trên, tiêu đề, mô tả, 2 nút cao 48px (Hủy xám / hành động đỏ nếu nguy hiểm).
**kbd (phím tắt):** mono 12px, viền `--line-input` với đáy dày 2px, bo 6px, nền trắng.
**Icon:** SVG inline nét 1.8–2, bo đầu nét tròn, 20–28px. Không emoji, không thư viện icon.

## Màn hình trong `reference/`
| File | Nội dung |
|---|---|
| `A-main-light.html` | Layout chính desktop, đang ở trạng thái: bộ lọc "Gắn sao" (hàng đợi 7 câu), shuffle bật, đoạn A–B đang đặt, toast cập nhật PWA, nút "Cài đặt ứng dụng" |
| `B-welcome.html` | Màn hình chào mới (xem mục WELCOME bên dưới) |
| `C-tablet-dialog.html` | Tablet, sidebar thu gọn, dialog xác nhận "Đặt lại" |
| `D-folders-dialog.html` | Dialog thư mục gần đây: 5 trạng thái (đang mở, thường + nút xóa khi hover, cần cấp quyền, lỗi không tìm thấy) |

## Thành phần V2 trong màn hình chính (xem A-main-light.html)
- **Chip hàng đợi** dưới tên tệp: viên thuốc trắng viền `--line`, icon sao, "Hàng đợi: Gắn sao · 7 câu · Ngẫu nhiên".
- **Nút shuffle** 48px tròn bên phải thanh điều khiển (đối xứng nút replay); bật = nền `--ink` icon trắng, tắt = ghost.
- **Nhóm A–B:** viên thuốc nền `--bg`, nút `A`, `B` bo tròn nền `--ink` chữ trắng (khi đã đặt) và nút ✕ ghost; nằm cạnh chip trạng thái lặp.
- **Vùng A–B trên sóng âm:** nền `rgba(29,29,31,.07)`, bo 10px; hai tay cầm dọc 4px màu `--ink`, nhãn "A 0:04" / "B 0:09" là viên thuốc đen chữ trắng 11px phía trên; cột ngoài vùng mờ còn opacity .4.
- **Nút "Cài đặt ứng dụng"** ở chân sidebar: nền `--bg`, bo 12px, icon tải xuống.
- **Toast** góc dưới phải: nền `rgba(29,29,31,.94)`, chữ trắng, bo 18px, nút "Tải lại" nền trắng.

## WELCOME — màn hình chào (B-welcome.html)
Ngoại lệ **chỉ dành cho màn hình này**: được dùng màu sắc, hiệu ứng kính và gradient. Phần còn lại của app vẫn một màu nhấn `--ink`, không gradient.
- **Nền:** `#fbfbfd` cộng 5 quầng sáng mềm (radial-gradient tròn lớn, không dùng `filter: blur` để nhẹ GPU): xanh dương, tím, cam, ngọc, hồng, mỗi quầng alpha ≤ .55, trôi chậm 16–24s bằng `transform`.
- **Lấp lánh:** 5 ngôi sao 4 cánh nhỏ (SVG) nhấp nháy bằng `opacity`/`scale`, chỉ hiện từ 1000px trở lên.
- **Hero căn giữa:** nhãn viên thuốc kính → tiêu đề 84px/700, letter-spacing -0.045em, dòng thứ hai tô gradient chữ `#0071e3 → #7c4dff → #d9480f` → đoạn mô tả 21px → 2 nút: chính (đen, 58px) và phụ (kính trắng) → dòng riêng tư có icon khóa.
- **Player nổi:** thẻ kính (`rgba(255,255,255,.74)` + `backdrop-filter: blur(28px) saturate(1.5)`, bo 34px, bóng tím nhạt lớn) hiển thị player thật với sóng âm "thở" (`scaleY` lệch pha) và vùng A–B; 4 chip kính nổi quanh thẻ ("Lặp 3 lần", "Tốc độ 0.75×", "Ôn lại câu khó", "Lặp đoạn A–B"), mỗi chip có icon trong vòng gradient, lơ lửng lên xuống 10px / 6s.
- **Thư mục gần đây:** tiêu đề "Tiếp tục nơi bạn dừng" + 3 thẻ kính, bo 26px, có icon thư mục gradient xanh, thanh tiến độ mảnh, "Mở lại ›". Hover nhấc thẻ lên 3px.
- **Ba tính năng:** thẻ kính nhạt, icon là ô gradient bo 14px kiểu icon iOS (xanh, cam, hồng) kèm bóng cùng màu.
- **Ghi chú Safari:** thẻ kính nhỏ ở cuối.
- **Animation vào trang:** các khối `rise` (mờ + trượt lên 18px, 800ms) so le .08s.
- Ở dưới 1000px ẩn chip nổi và lấp lánh. `prefers-reduced-motion` tắt mọi animation.
- Hiệu năng: chỉ animate `transform`/`opacity`; backdrop-filter dùng tối đa vài thẻ; không ảnh bitmap; tất cả là CSS và SVG.

## Phần mockup CHƯA có (agent tự thiết kế theo đúng ngôn ngữ trên)
- Dialog phím tắt, skeleton loading, trạng thái empty/error, chip "Ngoại tuyến".
- **Không có dark mode**, không dùng bản tối.

## Checklist "đẹp giống mẫu"
- [ ] Chỉ dùng màu trong token; không màu nhấn thứ hai.
- [ ] Nút phát là điểm nhấn lớn nhất, tròn, đen.
- [ ] Mọi thẻ bo ≥ 22px; nút bo ≥ 12px; không góc vuông.
- [ ] Số dùng tabular-nums; chữ phụ dùng `--ink-3`.
- [ ] Mọi nút có `:active` scale và focus ring; vùng chạm ≥ 44px trên tablet.
- [ ] Animation theo bảng trong SPEC.md, tôn trọng `prefers-reduced-motion`.
