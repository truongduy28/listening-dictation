# SPEC PHASE 2 — Phát triển tiếp trên app đang chạy

App đã được xây xong và chạy đúng theo spec đầu tiên. **Đây là bản bổ sung (brownfield), KHÔNG viết lại app.**

## Quy tắc làm việc trên codebase có sẵn
- **Bước 0 (bắt buộc, trước khi code):** đọc codebase hiện tại và báo lại ngắn gọn: cấu trúc thư mục, hook/store điều khiển audio và hàng đợi, nơi lưu settings và thư mục gần đây, đã có service worker/manifest chưa, bộ lọc sidebar hoạt động thế nào. Chỉ ra chỗ nào lệch so với giả định trong file này, rồi đề xuất kế hoạch và **chờ tôi xác nhận**.
- Giữ nguyên kiến trúc, cách đặt tên, token CSS, thư viện đang dùng. Chỉ thêm/sửa tối thiểu. Không refactor ngoài phạm vi, không đổi tên file hàng loạt.
- Mọi tính năng hiện có (phát, lặp N lần, nghỉ, auto next, phím tắt, đánh dấu, tìm kiếm, thư mục gần đây, reset, i18n) **phải chạy y như cũ**. Sau mỗi mốc chạy lại danh sách hồi quy ở cuối file.
- Nếu một thứ file này giả định đã có (ví dụ thư mục gần đây, bộ lọc "Gắn sao") mà app chưa có: **báo lại, không tự thêm** trừ khi nó cần thiết cho tính năng đang làm.
- Mockup tham chiếu: `reference/A-main-light.html` (màn hình chính đã có A-B, shuffle, chip hàng đợi, nút cài app, toast), `reference/B-welcome.html` (Welcome mới), `reference/D-folders-dialog.html`; quy tắc thiết kế trong `DESIGN.md`, `tokens.css`. Chỉ light mode.

# PHẠM VI
1. **A-B repeat:** lặp một đoạn trong file đang phát.
2. **Phát theo danh sách + Shuffle:** hàng đợi phát lấy theo bộ lọc sidebar (đặc biệt là "Gắn sao"), có chế độ ngẫu nhiên.
3. **PWA:** cài như app, mở nhanh từ Dock/màn hình, vỏ app chạy ngoại tuyến.
4. **Làm mới Welcome page** theo mockup `B-welcome.html` (xem mục 4).

**Không làm:** lưu A-B giữa các lần mở app, đồng bộ đa thiết bị, cache file audio trong service worker, push notification, background sync.

---

# 1. A-B REPEAT

## Hành vi
- Người dùng đặt điểm **A** và điểm **B** trong file đang phát. Khi đủ cả hai, app lặp đoạn A→B.
- Ba cách đặt: (a) phím `A` / `B` lấy đúng vị trí đang phát; (b) nút A, B trong thanh điều khiển; (c) kéo hai tay cầm trên sóng âm.
- Phím `X` hoặc nút ✕ xóa đoạn lặp.
- Khi A-B đang bật: phát tới B thì nhảy về A, lặp **vô hạn** cho tới khi người dùng xóa đoạn hoặc chuyển file. Nghỉ `gapSeconds` giữa các vòng. A-B **thay thế** logic `repeatCount` của file đó; auto next bị tạm dừng.
- Chuyển file (next/prev/chọn file/auto next) → xóa đoạn A-B. Không lưu vào localStorage.
- Quy tắc hợp lệ: B > A, đoạn dài tối thiểu **0.3 giây**. Đặt B nhỏ hơn A → hoán đổi A và B. Chỉ đặt A: hiện đánh dấu A, chưa lặp. Phím `A` khi chưa có B: đặt A. Phím `B` khi chưa có A: đặt A = 0.
- Tua (←/→, click sóng) trong lúc A-B bật: cho phép tua ra ngoài đoạn; khi phát lại vượt B thì nhảy về A như thường. Replay (`R`) → nhảy về A.

## Kỹ thuật
- **Không dùng `timeupdate`** (chỉ ~4 lần/giây, sai số lớn). Kiểm tra trong vòng `requestAnimationFrame` đã có của player: nếu `currentTime >= B - 0.05` thì `currentTime = A`.
- Giữ trạng thái `abLoop: { a: number | null; b: number | null }` trong `usePlaybackQueue` (hoặc hook riêng `useAbLoop`), tách logic thuần vào `lib/abLoop.ts` để test được (clamp, hoán đổi, kiểm tra độ dài tối thiểu).
- Safari/mp3 VBR: seek có thể lệch vài chục ms. Chấp nhận, nhưng ghi chú trong README.
- Khi đổi `playbackRate`, vòng lặp vẫn đúng (dựa trên `currentTime`, không dựa trên thời gian thực).

## UI
- Thanh điều khiển có nhóm 3 nút nhỏ: `A`, `B`, `✕` (nhóm chỉ hiện đầy đủ khi cần; nút ✕ chỉ hiện khi có đoạn).
- Trên sóng âm: vùng A-B tô nền `rgba(29,29,31,.08)`, hai tay cầm dọc (rộng 4px, cao toàn bộ sóng, vùng chạm 20px), nhãn thời gian nhỏ ở đầu mỗi tay cầm khi hover/kéo. Cột sóng trong vùng giữ màu bình thường; ngoài vùng mờ đi (opacity .5).
- Chip trạng thái dùng lại chip hiện có: "Lặp đoạn 0:03 – 0:09" (thay cho "Lặp 2/3").
- Animation: vùng A-B hiện bằng fade + `scaleX` từ điểm đặt 200ms; tay cầm khi kéo phóng nhẹ 1.15; xóa đoạn fade-out 150ms.
- Chỉ animate `transform`/`opacity`. Tay cầm kéo bằng pointer events, cập nhật qua ref, không re-render React mỗi frame.

---

# 2. PHÁT THEO DANH SÁCH + SHUFFLE

## Khái niệm
**Hàng đợi (queue) = danh sách đang hiển thị ở sidebar** sau khi áp bộ lọc và tìm kiếm. Không thêm khái niệm mới cho người dùng: chọn bộ lọc "Gắn sao" rồi phát là chỉ ôn các câu khó.

## Hành vi
- Next/prev/auto next đi theo hàng đợi hiện tại, không đi theo toàn bộ thư mục.
- Bộ lọc đổi trong lúc đang phát:
  - Tệp đang phát **còn** trong hàng đợi mới → tiếp tục phát, vị trí "n / tổng" cập nhật theo hàng đợi.
  - Tệp đang phát **không còn** trong hàng đợi → vẫn phát tiếp tệp đó đến hết (kể cả lặp), khi chuyển tệp thì nhảy vào hàng đợi mới (tệp đầu tiên, hoặc ngẫu nhiên nếu shuffle bật).
- Bỏ sao tệp đang phát khi đang ở bộ lọc "Gắn sao": tệp vẫn phát tiếp, rời khỏi hàng đợi sau khi chuyển. Không làm gián đoạn âm thanh.
- Hàng đợi rỗng (ví dụ lọc "Gắn sao" nhưng chưa gắn câu nào): hiện trạng thái empty "Chưa có câu nào gắn sao. Bấm ⭐ hoặc phím `S` khi nghe." Nút phát bị vô hiệu.
- Hết hàng đợi: dừng (không vòng lại), trừ khi shuffle bật.
- **Shuffle** (nút + phím `M`, lưu trong Settings):
  - Xáo trộn kiểu Fisher-Yates, **không lặp lại** tệp nào cho tới khi cả hàng đợi đã phát hết một vòng; hết vòng thì xáo lại và tiếp tục (shuffle không tự dừng).
  - Next → lấy tệp kế trong thứ tự đã xáo. Prev → quay lại tệp đã phát trước đó (ngăn xếp lịch sử, tối đa 100).
  - Tránh tệp vừa phát liền kề tệp đầu của vòng mới.
  - Tắt shuffle → quay về thứ tự tự nhiên, bắt đầu từ tệp đang phát.
- Thêm phím `S` = gắn/bỏ sao tệp đang phát (cần cho luồng ôn tập).
- Đánh dấu "đã nghe": một tệp được tính là đã nghe khi phát xong ít nhất 1 lượt (như cũ).

## Kỹ thuật
- Tách logic thuần `lib/queue.ts`: `buildQueue(files, filter, query)`, `nextIndex`, `prevIndex`, `shuffleOrder`, có test đơn vị.
- Trạng thái shuffle nằm trong `usePlaybackQueue`: `order: string[]` (tên tệp), `cursor`, `history`. Không lưu `order` vào localStorage; chỉ lưu `settings.shuffle`.
- `FileRow` vẫn `React.memo`; chỉ danh sách hàng đợi tính lại khi bộ lọc/tìm kiếm/dấu sao đổi (dùng `useMemo`), không tính lại mỗi frame.

## UI
- Nút shuffle dạng icon ở cạnh nhóm điều khiển (đối xứng với nút replay), trạng thái bật = nền `--ink`, icon trắng.
- Một chip nhỏ dưới tiêu đề tệp: "Hàng đợi: Gắn sao · 7 câu" (hoặc "Tất cả · 100 câu"); có thêm "Ngẫu nhiên" khi shuffle bật. Bấm chip → cuộn sidebar tới bộ lọc.
- Vị trí hiển thị "12 / 100" đổi thành vị trí **trong hàng đợi**.
- Animation: nút shuffle bật có đổi nền 200ms + icon xoay nhẹ 180°/280ms; chip đổi chữ bằng trượt dọc + fade 150ms; khi hàng đợi đổi, danh sách fade 150ms.
- Phím tắt: thêm `S` (gắn sao) và `M` (shuffle) vào popover/dialog phím tắt.

---

# 3. PWA

## Mục tiêu
Cài như app (Dock macOS, taskbar Windows), mở nhanh trong cửa sổ riêng, vỏ app chạy được khi **không có mạng**. Audio vẫn đọc từ thư mục trên máy như cũ, **không** đi qua service worker.

## Yêu cầu kỹ thuật
- **Manifest** (`public/manifest.webmanifest`): `name` "Nghe chép", `short_name` "Nghe chép", `display: "standalone"`, `start_url: "/"`, `scope: "/"`, `background_color` và `theme_color` = `#f5f5f7`, `lang: "vi"`, danh mục `education`. Icon: 192, 512, và bản **maskable** 512; icon `apple-touch-icon` 180. Icon dùng nền `#1d1d1f` với biểu tượng sóng âm trắng, **do bạn/agent tự thiết kế đơn giản, không dùng logo có bản quyền**.
- `<head>` thêm: `<link rel="manifest">`, `<meta name="theme-color" content="#f5f5f7">`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-title`.
- **Service worker** (`public/sw.js`, viết tay, nhỏ gọn, không thêm thư viện nặng; có thể dùng Workbox/Serwist nếu agent chứng minh bundle không phình):
  - Precache vỏ app (HTML, JS, CSS, icon) khi `install`, đặt tên cache có phiên bản (`app-shell-vN`).
  - Điều hướng: `stale-while-revalidate` cho trang chính; tài nguyên tĩnh có hash: `cache-first`.
  - **Không bao giờ cache** blob audio/object URL (vốn không đi qua mạng) và không chặn request nào ngoài cùng origin.
  - Dọn cache phiên bản cũ ở `activate`. Dùng `skipWaiting` **không tự động**: chờ người dùng đồng ý cập nhật.
- Chỉ đăng ký service worker khi `process.env.NODE_ENV === 'production'` và trên HTTPS (Vercel đã có), đăng ký lúc rảnh (`requestIdleCallback`), không chặn tải trang đầu.
- **Cập nhật:** khi có SW mới ở trạng thái `waiting`, hiện toast "Có phiên bản mới" kèm nút "Tải lại". Bấm → gửi `SKIP_WAITING` → reload.
- **Nút cài đặt** (ở chân sidebar hoặc trong dialog cài đặt):
  - Chrome/Edge: bắt sự kiện `beforeinstallprompt`, giữ lại, hiện nút "Cài đặt ứng dụng"; bấm thì gọi `prompt()`. Ẩn nút khi đã chạy ở chế độ standalone (`display-mode: standalone`) hoặc sau khi cài (`appinstalled`).
  - Safari (không có sự kiện này): hiện hướng dẫn ngắn "Chọn **Tệp → Thêm vào Dock** (macOS Sonoma trở lên)". Phát hiện bằng feature detection, không dò User-Agent.
- **Ngoại tuyến:** tắt mạng rồi mở lại app → vẫn mở được, chọn lại thư mục gần đây, phát audio. Hiện chỉ báo nhỏ "Ngoại tuyến" khi `navigator.onLine === false` (không chặn thao tác nào).
- Phím tắt và File System Access hoạt động như cũ trong cửa sổ standalone; không dùng phím tổ hợp Ctrl/Cmd để tránh xung đột với phím hệ thống/trình duyệt.

## UI/animation
- Nút "Cài đặt ứng dụng": kiểu nút phụ (nền `--bg`, bo 12px), icon tải xuống, xuất hiện bằng fade + trượt nhẹ 220ms.
- Toast cập nhật dùng lại component Toast có sẵn.
- Chip "Ngoại tuyến": viên thuốc nhỏ nền `--bg`, fade 150ms.

## Giới hạn cần ghi vào README
- PWA không cho phép đọc thư mục khi hoàn toàn ngoại tuyến **nếu quyền thư mục đã hết hiệu lực**: Chrome vẫn cần người dùng bấm lại để cấp quyền, nhưng thao tác này không cần mạng.
- Safari vẫn không nhớ thư mục dù đã cài (hạn chế của trình duyệt).

---

# 4. LÀM MỚI WELCOME PAGE
Chỉ thay đổi giao diện màn hình chào; **không đổi logic** (chọn thư mục, mở thư mục gần đây, ghi chú Safari). Làm đúng `reference/B-welcome.html` và mục WELCOME trong `DESIGN.md`.
- Welcome là ngoại lệ được dùng gradient và hiệu ứng kính; phần còn lại của app **giữ nguyên** một màu nhấn `--ink`.
- **Nền:** `#fbfbfd` + 5 quầng sáng mềm (radial-gradient tròn lớn, alpha ≤ .55, không dùng `filter: blur`), trôi chậm 16–24s bằng `transform`; 5 ngôi sao 4 cánh nhấp nháy bằng `opacity`/`scale`.
- **Hero căn giữa:** nhãn viên thuốc kính "Luyện nghe chép chính tả"; tiêu đề 84px/700, dòng "Chép từng chữ." tô gradient `#0071e3 → #7c4dff → #d9480f`; mô tả 21px; nút chính đen 58px "Chọn thư mục audio" (hover nhấc 2px) và nút phụ kính "Xem phím tắt" (mở dialog phím tắt hiện có); dòng riêng tư "Không tải file lên đâu cả · Cài như ứng dụng · Dùng được khi ngoại tuyến".
- **Player nổi:** thẻ kính (`backdrop-filter: blur(28px) saturate(1.5)`, bo 34px) minh họa player với sóng âm "thở" (`scaleY` lệch pha) và vùng A-B; 4 chip kính lơ lửng quanh thẻ (Lặp 3 lần, Tốc độ 0.75×, Ôn lại câu khó, Lặp đoạn A–B). Đây là **hình minh họa tĩnh**, không phát âm thanh, không phụ thuộc state thật.
- **"Tiếp tục nơi bạn dừng":** 3 thẻ kính từ danh sách thư mục gần đây thật (tên, "N tệp · đang ở câu X", thanh tiến độ, thời điểm mở, "Mở lại ›"). Không có thư mục gần đây → ẩn cả mục này (không để khoảng trống).
- **3 thẻ tính năng** (icon gradient kiểu iOS) và **ghi chú Safari** (chỉ hiện trên Safari, phát hiện bằng feature detection).
- **Animation:** các khối `rise` (mờ + trượt lên 18px, 800ms) so le .08s; chỉ animate `transform`/`opacity`. Dưới 1000px ẩn chip nổi và lấp lánh. `prefers-reduced-motion` tắt toàn bộ.
- **Hiệu năng:** không ảnh bitmap, `backdrop-filter` tối đa vài thẻ, không làm tăng First Load JS đáng kể (phần minh họa là CSS/SVG). Welcome chỉ tải khi chưa có thư mục, hoặc tải lười.
- **a11y:** phần minh họa `aria-hidden`; contrast chữ ≥ 4.5:1 (chữ gradient chỉ cho cỡ ≥ 24px).

# DATA MODEL (thay đổi)
```ts
type Settings = {
  // ...các trường cũ...
  shuffle: boolean;             // mặc định false
};

// Runtime (không lưu):
type AbLoop = { a: number | null; b: number | null };   // giây
type QueueState = { order: string[]; cursor: number; history: string[] };
```

# PHÍM TẮT (bổ sung)
| Phím | Hành động |
|---|---|
| `A` | Đặt điểm A tại vị trí hiện tại |
| `B` | Đặt điểm B tại vị trí hiện tại |
| `X` | Xóa đoạn A-B |
| `S` | Gắn/bỏ sao tệp đang phát |
| `M` | Bật/tắt shuffle |

Vẫn không kích hoạt khi đang focus ô nhập/tìm kiếm/dialog.

# CẤU TRÚC FILE (bổ sung)
```
src/
├─ components/
│  ├─ player/     AbLoopControls.tsx, WaveformRegion.tsx (vùng + tay cầm), QueueChip.tsx, ShuffleButton.tsx
│  └─ pwa/        InstallButton.tsx, UpdateToast.tsx, OfflineBadge.tsx
├─ hooks/         useAbLoop.ts, usePwaInstall.ts, useServiceWorker.ts, useOnlineStatus.ts
└─ lib/           abLoop.ts, queue.ts, pwa.ts
public/            manifest.webmanifest, sw.js, icons/ (192, 512, maskable-512, apple-touch-180)
```
Mỗi component ≤ ~150 dòng, logic nghiệp vụ nằm trong `lib/` và `hooks/`.

# NGÂN SÁCH HIỆU NĂNG (giữ nguyên, kiểm tra lại)
First Load JS vẫn ≤ 120KB gzip (code PWA đăng ký SW tải lười). Vòng lặp A-B không gây re-render React mỗi frame. Lighthouse Performance ≥ 95; Lighthouse PWA: installable, có service worker, có manifest hợp lệ.

# TIÊU CHÍ HOÀN THÀNH
**A-B repeat**
- [ ] Phím `A`, `B`, `X` và nút trong UI hoạt động; kéo tay cầm trên sóng âm chỉnh được điểm A/B
- [ ] Đoạn ngắn hơn 0.3s bị từ chối; B < A thì tự hoán đổi
- [ ] Lặp đoạn A→B vô hạn, nghỉ đúng `gapSeconds`; đổi tốc độ không làm lệch đoạn lặp
- [ ] Chuyển tệp thì đoạn A-B bị xóa; không lưu vào localStorage
- [ ] Sai số điểm quay về ≤ 100ms trên Chrome và Safari

**Hàng đợi + Shuffle**
- [ ] Lọc "Gắn sao" + bật auto next → chỉ phát các câu có sao, hết danh sách thì dừng
- [ ] Hàng đợi rỗng hiện trạng thái empty, nút phát bị vô hiệu
- [ ] Bỏ sao tệp đang phát không làm ngắt âm thanh
- [ ] Shuffle không lặp tệp trong một vòng; prev quay về đúng tệp trước đó; tắt shuffle quay lại thứ tự tự nhiên
- [ ] Phím `S` và `M` hoạt động; `settings.shuffle` được khôi phục khi mở lại app
- [ ] "n / tổng" và chip hàng đợi phản ánh đúng hàng đợi hiện tại

**Welcome**
- [ ] Khớp mockup `B-welcome.html` ở 1440px; ở < 1000px layout gọn, không vỡ, không cuộn ngang
- [ ] Thư mục gần đây hiện đúng dữ liệu thật; không có thì ẩn mục
- [ ] Animation mượt (kiểm tra Performance, không long task), `prefers-reduced-motion` tắt chuyển động
- [ ] Logic chọn thư mục và ghi chú Safari không đổi

**PWA**
- [ ] Lighthouse nhận diện installable, có manifest và service worker hợp lệ
- [ ] Cài được trên Chrome (Windows, macOS) và thêm được vào Dock trên Safari
- [ ] Tắt mạng, mở lại app: vẫn mở được, chọn lại thư mục gần đây và phát được
- [ ] Có phiên bản mới thì hiện toast, "Tải lại" cập nhật được mà không mất cài đặt
- [ ] Không có audio nào bị cache trong Cache Storage
- [ ] Animation mới theo đúng nguyên tắc (`transform`/`opacity`, `prefers-reduced-motion`)
- [ ] `npm run build` không lỗi, console sạch, README cập nhật (cách cài PWA, giới hạn Safari)

# DANH SÁCH HỒI QUY (chạy sau mỗi mốc)
- [ ] Phát/dừng/tua/đổi tốc độ/âm lượng như cũ
- [ ] Lặp N lần, nghỉ X giây, auto next như cũ khi **không** dùng A-B/shuffle/bộ lọc
- [ ] Toàn bộ phím tắt cũ hoạt động; không kích hoạt khi đang gõ
- [ ] Đánh dấu đã nghe/sao, tìm kiếm, lọc, thư mục gần đây, reset, đổi ngôn ngữ như cũ
- [ ] Khôi phục settings + tệp cuối sau khi mở lại; Safari vẫn chọn lại thư mục được
- [ ] `npm run build` không lỗi, console sạch, First Load JS không vượt ngân sách

# CÁCH LÀM VIỆC
0. **Khảo sát codebase và báo kế hoạch, chờ tôi xác nhận** (xem "Quy tắc làm việc trên codebase có sẵn").
1. Làm theo mốc, chạy thử và chạy danh sách hồi quy sau mỗi mốc:
   (1) hàng đợi theo bộ lọc + `lib/queue.ts` có test →
   (2) shuffle + phím `S`, `M` + chip hàng đợi →
   (3) A-B repeat: logic thuần + vòng rAF + phím →
   (4) A-B repeat: vùng và tay cầm trên sóng âm + animation →
   (5) làm mới Welcome page →
   (6) PWA: manifest, icon, service worker, nút cài, toast cập nhật, chip ngoại tuyến →
   (7) kiểm tra Lighthouse + hiệu năng + README (cách cài PWA, giới hạn Safari).
2. Không thêm tính năng ngoài phạm vi. Không đổi những phần đang chạy đúng.
3. Thiếu thông tin quan trọng → hỏi tối đa 3 câu trước khi code.
4. Kết thúc mỗi mốc: tóm tắt đã làm (file thêm/sửa), cách chạy, việc còn lại.
