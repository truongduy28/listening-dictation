# DANH MỤC HÀNH VI HỆ THỐNG (BEHAVIOR CATALOG — GROUND TRUTH)

> **Dự án:** Nghe chép — Audio Dictation Player (`listening-dictation-app`)  
> **Phương pháp xác thực:** Reverse engineering mã nguồn thực tế (`lib/*`, `hooks/*`, `components/*`), bộ test Vitest (`tests/*`), và kiểm chứng runtime/UI.  
> **Nguyên tắc:** Mọi mô tả trong tài liệu này là nguồn sự thật (Ground Truth). Tuyệt đối không thay đổi hành vi quan sát được khi chưa có yêu cầu rõ ràng.

---

## 1. Hành Vi Phát Âm Thanh & Sóng Âm (Audio Engine & Waveform)

### 1.1. Phát / Tạm dừng (Play / Pause)
- **Tương tác:** Nhấn phím `Space` hoặc click nút tròn Play/Pause (76px) ở trung tâm thẻ `PlayerCard`.
- **Hành vi thực tế:**
  - Nếu đang phát: Tạm dừng phát, icon chuyển thành tam giác Play.
  - Nếu đang tạm dừng: Tiếp tục phát, icon chuyển thành 2 vạch Pause.
  - Nếu đang trong thời gian nghỉ (`isWaitingGap = true`): Huỷ ngay lập tức bộ đếm ngược nghỉ và tiếp tục phát ngay bài hiện tại.
  - Phím `Space` luôn gọi `event.preventDefault()` để tránh cuộn trang.
- **Trạng thái:** [Implemented, Observed, Tested].

### 1.2. Tua Âm Thanh (Rewind & Fast-Forward)
- **Tương tác:**
  - Phím `←` hoặc nút `-Ns` (Rewind).
  - Phím `→` hoặc nút `+Ns` (Forward).
  - Kéo hoặc click trực tiếp vào thanh trượt sóng âm (WaveSurfer) hoặc seekbar fallback.
- **Hành vi thực tế:**
  - Bước nhảy tua bằng đúng giá trị `skipSeconds` (mặc định 5s, cấu hình từ 1s đến 30s).
  - Không tua vượt quá thời lượng bài: được clamp an toàn trong khoảng `[0, duration]`.
  - Nếu người dùng click vào sóng âm trong lúc đang đếm ngược nghỉ chép bài (`gapCountdown`), bộ đếm tự động hủy và vị trí phát nhảy ngay đến điểm click.
- **Trạng thái:** [Implemented, Observed, Tested].

### 1.3. Điều Khiển Tốc Độ Phát (Playback Rate)
- **Tương tác:** 5 nút pill trên `ToolbarCard` (`0.5x`, `0.75x`, `1.0x`, `1.25x`, `1.5x`) hoặc phím tắt `[` (giảm tốc) và `]` (tăng tốc).
- **Hành vi thực tế:**
  - Thay đổi giá trị `playbackRate` của thẻ `<audio>` và đồng bộ với WaveSurfer canvas.
  - **Bảo toàn cao độ giọng đọc:** Thiết lập `preservesPitch = true` (và `webkitPreservesPitch = true`), đảm bảo giọng người nói không bị the thé (chipmunk effect) khi tăng tốc hoặc trầm đục khi giảm tốc.
  - Giá trị tốc độ được lưu ngay vào `localStorage (dictation_settings)`.
- **Trạng thái:** [Implemented, Observed, Tested].

### 1.4. Âm Lượng & Chế Độ Tắt Tiếng (Volume & Mute)
- **Tương tác:** Kéo slider âm lượng (0% – 100%) hoặc bấm phím `M` / click vào icon loa.
- **Hành vi thực tế:**
  - Khi bấm `M` hoặc click icon loa:
    - Nếu âm lượng > 0%: Tắt tiếng (đặt volume = 0), ghi nhớ mức âm lượng trước đó.
    - Nếu âm lượng = 0%: Khôi phục lại mức âm lượng trước khi tắt tiếng (nếu trước đó là 0, đặt về mặc định 0.8).
  - *Lưu ý quan trọng:* Trong spec `SPEC_PHASE2.md`, phím `M` từng được đề xuất cho tính năng Shuffle. Tuy nhiên trong mã nguồn thực tế và UI hiện hành, phím `M` được triển khai làm **Toggle Mute**.
- **Trạng thái:** [Implemented, Observed, Tested].

### 1.5. Xử Lý Tệp Âm Thanh Lớn (> 20MB)
- **Hành vi thực tế:**
  - Nếu tệp có dung lượng `file.size > 20 * 1024 * 1024` (20MB): Ứng dụng **không giải mã qua WaveSurfer** để bảo vệ bộ nhớ RAM trình duyệt.
  - Thay thế bằng một thanh tiến trình trượt nhẹ (fallback seekbar) kèm nhãn thông báo: *"Tệp lớn (>20MB) — sử dụng thanh tiến trình đơn giản"*.
  - Người dùng vẫn có thể click tua trên thanh fallback mượt mà.
- **Trạng thái:** [Implemented, Observed, Tested].

---

## 2. Vòng Lặp Luyện Nghe, Nghỉ Chép Bài & Tự Chuyển Câu

```
[Bắt đầu bài] ─── Phát audio ───► [Đạt 85% thời lượng: Đánh dấu Đã Nghe]
                                         │
                                         ▼
                                  [Hết bài: onEnded]
                                         │
              ┌──────────────────────────┴──────────────────────────┐
              ▼ (currentRepeat < repeatCount)                       ▼ (currentRepeat >= repeatCount)
    [Đếm ngược nghỉ gapSeconds]                            [Đã lặp đủ số lần cấu hình]
              │                                                     │
              ▼                                                     ▼
     [Phát lại từ 0:00]                                     {autoNext bật?}
(currentRepeat = currentRepeat + 1)                        ┌────────┴────────┐
                                                           ▼ (Có)            ▼ (Không)
                                                [Đếm ngược gapSeconds]    [Dừng phát]
                                                           │
                                                           ▼
                                                [Chuyển bài kế trong queue]
```

### 2.1. Số Lần Lặp Câu (`repeatCount`)
- **Khoảng giá trị:** `1` đến `99` (mặc định 1).
- **Hành vi thực tế:**
  - Khi hết câu, nếu `currentRepeat < repeatCount`, ứng dụng tăng biến đếm `currentRepeat = currentRepeat + 1` và phát lại câu đó.
  - Khi đã phát đủ `repeatCount` lần, ứng dụng reset `currentRepeat = 1` và xem xét chuyển bài tiếp theo.
- **Trạng thái:** [Implemented, Observed, Tested].

### 2.2. Khoảng Nghỉ Chép Bài (`gapSeconds`)
- **Khoảng giá trị:** `0` đến `30` giây (mặc định 2s).
- **Hành vi thực tế:**
  - Khi bài kết thúc hoặc đoạn A-B chạm mốc B: Nếu `gapSeconds > 0`, trình phát tạm dừng và hiển thị pill đếm ngược màu hổ phách với hiệu ứng ping động: *"Nghỉ Xs · Chuẩn bị lặp Y/Z"* hoặc *"Nghỉ Xs · Chuẩn bị câu kế tiếp"*.
  - Bộ đếm giảm đều từng giây thông qua `setInterval(1000ms)`.
  - Khi đếm về 0, âm thanh tự động phát lại hoặc nhảy sang câu tiếp theo.
  - **Hủy bộ đếm khi có thao tác tay:** Nếu người dùng bấm bất kỳ phím điều khiển nào (Play, Next, Prev, Tua, Chọn bài), bộ đếm ngược bị hủy ngay tức thì và thực hiện thao tác mới.
- **Trạng thái:** [Implemented, Observed, Tested].

### 2.3. Tự Chuyển Câu (`autoNext`)
- **Giá trị:** Bật (`true`, mặc định) / Tắt (`false`).
- **Hành vi thực tế:**
  - Khi đã hoàn thành toàn bộ số lần lặp `repeatCount`, nếu `autoNext = true`, ứng dụng tìm bài kế tiếp trong hàng đợi đang kích hoạt (`usePlaybackQueue`).
  - Nếu tìm thấy bài kế tiếp: Đợi hết `gapSeconds` rồi tự động nạp và phát bài đó.
  - Nếu đã đến bài cuối cùng trong hàng đợi: Dừng phát nhạc.
- **Trạng thái:** [Implemented, Observed, Tested].

---

## 3. Đoạn Lặp A–B (A–B Repeat)

Đoạn lặp A–B cho phép cô lập một cụm từ khó trong câu để nghe đi nghe lại vô hạn lần.

### 3.1. Thiết Lập Mốc A và B
- **Phím `A` hoặc nút `Đặt A`:** Gán thời gian hiện tại làm mốc A.
  - Nếu mốc B đã có sẵn và $A \ge B$: Tự động hoán đổi để luôn có $A < B$ (nếu khoảng cách $\ge 0.3\text{s}$).
  - Nếu khoảng cách giữa mốc mới và mốc cũ $< 0.3\text{s}$: Thao tác bị từ chối giữ nguyên vị trí cũ.
- **Phím `B` hoặc nút `Đặt B`:** Gán thời gian hiện tại làm mốc B.
  - Nếu mốc A chưa được đặt: Hệ thống tự động đặt $A = 0$ (nếu vị trí hiện tại $\ge 0.3\text{s}$).
  - Nếu $B \le A$: Tự động hoán đổi vị trí (nếu khoảng cách $\ge 0.3\text{s}$).
- **Phím `X` hoặc nút `✕`:** Xóa sạch cả hai mốc A và B, trả về trạng thái phát bình thường.
- **Trạng thái:** [Implemented, Observed, Tested].

### 3.2. Vòng Lặp requestAnimationFrame
- **Độ chính xác cao:** Thay vì dùng sự kiện `timeupdate` (chỉ kích hoạt ~4 lần/giây, dễ bị trễ âm thanh), hệ thống sử dụng vòng lặp `requestAnimationFrame` trong `hooks/use-ab-loop-watcher.ts`.
- **Ngưỡng kích hoạt:** Khi `currentTime >= loop.b - 0.05` (50ms trước khi hết đoạn), hệ thống kích hoạt sự kiện chạm mốc B.
- **Debounce:** Có chốt bảo vệ `200ms` chống kích hoạt lặp liên tục trong cùng frame.
- **Xử lý nghỉ:**
  - Nếu `gapSeconds > 0`: Tạm dừng âm thanh, đếm ngược `gapSeconds`, sau đó seek về mốc A và tiếp tục phát.
  - Nếu `gapSeconds === 0`: Seek thẳng về mốc A và tiếp tục phát không gián đoạn.
- **Tương tác khác:**
  - Bấm Replay (`R`): Tự động tua về mốc A thay vì 0:00.
  - Cho phép người dùng tua ra ngoài đoạn A-B; khi phát lại vượt qua mốc B thì tự động quay về A.
  - Khi chuyển sang bài khác: Tự động xóa đoạn A-B. Đoạn A-B **không bao giờ lưu vào localStorage**.
- **Trạng thái:** [Implemented, Observed, Tested].

---

## 4. Hàng Đợi Thông Minh, Lọc & Đánh Dấu (Smart Queue & Filters)

### 4.1. Bộ Lọc Sidebar
Bốn tab bộ lọc hoạt động tức thời trên danh sách tệp:
1. `Tất cả` (`all`): Hiển thị toàn bộ tệp âm thanh có trong thư mục.
2. `Chưa nghe` (`unheard`): Chỉ hiển thị các tệp có `listened === false`.
3. `Đã nghe` (`listened`): Chỉ hiển thị các tệp đã nghe qua $\ge 85\%$ thời lượng.
4. `Gắn sao` (`starred`): Chỉ hiển thị các tệp người dùng đã bấm đánh dấu sao.

### 4.2. Khái Niệm Hàng Đợi Phát (Active Playback Queue)
- **Hàng đợi phát = Danh sách hiển thị sau khi áp bộ lọc và tìm kiếm.**
- Khi người dùng đang ở tab "Gắn sao", hàng đợi phát chỉ gồm các bài có gắn sao. Khi bấm Next/Prev hoặc AutoNext, trình phát di chuyển trong danh sách này.
- **Trường hợp bài đang phát bị loại khỏi hàng đợi:**
  - Ví dụ: Đang ở tab "Gắn sao" và người dùng bấm bỏ sao bài đang phát.
  - *Hành vi:* Bài đó **vẫn tiếp tục phát bình thường cho đến hết câu**. Khi kết thúc hoặc khi bấm Next, trình phát sẽ chuyển sang bài đầu tiên của hàng đợi mới.
- **Vị trí hiển thị:** Chip hàng đợi và tiêu đề hiển thị dạng `n / Tổng` (vị trí bài trong hàng đợi lọc hiện tại, không phải tổng số file của toàn folder).
- **Trạng thái:** [Implemented, Observed, Tested].

### 4.3. Đánh Dấu Sao (`toggleStar`)
- Bấm phím `S` hoặc click vào icon ngôi sao cạnh tên bài hát để bật/tắt đánh dấu sao.
- Lưu trữ ngay vào `localStorage (dictation_marks)` theo cấu trúc tên thư mục và tên file.
- **Trạng thái:** [Implemented, Observed, Tested].

### 4.4. Tự Động Đánh Dấu Đã Nghe (Auto-Listened)
- Khi tiến trình phát đạt ngưỡng $\ge 85\%$ thời lượng bài (`LISTENED_THRESHOLD = 0.85`), hệ thống tự động đánh dấu `listened: true`.
- Không cần phải nghe hết 100% (phần khoảng lặng cuối file được bỏ qua).
- **Trạng thái:** [Implemented, Observed, Tested].

---

## 5. Thư Mục, Quyền Truy Cập & Khôi Phục Phiên

### 5.1. Chrome & Edge (File System Access API)
- Người dùng chọn thư mục qua `window.showDirectoryPicker()`.
- Directory handle được lưu vào IndexedDB (`dictation_db` -> `handles` -> `folderHandle`).
- Khi người dùng F5 hoặc mở lại ứng dụng:
  - Ứng dụng đọc handle từ IndexedDB và kiểm tra `queryPermission({ mode: 'read' })`.
  - Nếu đã có quyền: Tự động tải lại danh sách bài tức thì.
  - Nếu cần cấp lại quyền: Hiển thị `PermissionBanner` màu vàng ở đầu workspace để người dùng bấm nút "Cấp quyền truy cập" bằng thao tác click hợp lệ.
- **Trạng thái:** [Implemented, Observed, Tested].

### 5.2. Safari & Mobile Fallback
- Safari không hỗ trợ `showDirectoryPicker`, tự động kích hoạt input ẩn `<input type="file" webkitdirectory directory multiple />`.
- Hiển thị banner thông báo: *"Trình duyệt này không hỗ trợ lưu quyền truy cập thư mục. Bạn cần chọn lại thư mục mỗi khi mở lại ứng dụng."*
- Khi người dùng chọn lại thư mục có cùng tên với phiên trước: Ứng dụng tự động tìm lại đúng câu đang nghe dở và khôi phục toàn bộ dấu sao/đã nghe.
- **Trạng thái:** [Implemented, Observed, Tested].

### 5.3. Thư Mục Gần Đây (Recent Folders)
- Lưu tối đa 3 thư mục gần nhất vào `localStorage (dictation_recent_folders)`.
- Hiển thị trên màn hình chào (`WelcomeScreen`): Tên thư mục, tổng số file, câu đang nghe dở, thanh tiến trình % hoàn thành, và thời gian tương đối ("Hôm nay", "Hôm qua", "X ngày trước").
- Bấm vào thẻ thư mục gần đây trên Chrome sẽ tự động mở lại thư mục đó.
- **Trạng thái:** [Implemented, Observed, Tested].

### 5.4. Đặt Lại Ứng Dụng (Reset State)
- Bấm nút "Đặt lại dữ liệu" ở cuối sidebar mở modal xác nhận nguy hiểm `ResetDialog`.
- Khi xác nhận:
  - Xóa toàn bộ keys trong `localStorage` (`dictation_settings`, `dictation_session`, `dictation_marks`, `dictation_recent_folders`).
  - Xóa folder handle trong IndexedDB.
  - Reset toàn bộ state trong bộ nhớ về mặc định.
  - Đưa người dùng về `WelcomeScreen`.
  - **Tuyệt đối không xóa hay ảnh hưởng đến bất kỳ file âm thanh nào trên ổ đĩa người dùng.**
- **Trạng thái:** [Implemented, Observed, Tested].

---

## 6. Ma Trận Phím Tắt Toàn Cục (Keyboard Shortcuts Matrix)

| Phím (Key) | Hành Động | Điều Kiện Ức Chế (Suppression) | Hành Vi Thực Tế |
|---|---|---|---|
| `Space` | **Phát / Tạm dừng** | Input focused / Dialog mở / Chưa chọn folder | Chuyển đổi play/pause, hủy đếm ngược nghỉ nếu đang chờ |
| `←` | **Tua lùi** | Input focused / Dialog mở | Lùi `skipSeconds` giây, không nhỏ hơn 0:00 |
| `→` | **Tua tới** | Input focused / Dialog mở | Tiến `skipSeconds` giây, không quá `duration` |
| `↑` | **Bài trước đó** | Input focused / Dialog mở | Chuyển về bài trước trong hàng đợi hiện tại |
| `↓` | **Bài kế tiếp** | Input focused / Dialog mở | Chuyển sang bài sau trong hàng đợi hiện tại |
| `[` | **Giảm tốc độ** | Input focused / Dialog mở | Giảm 1 nấc tốc độ (`1.5x` ➔ `1.25x` ➔ `1.0x` ➔ `0.75x` ➔ `0.5x`) |
| `]` | **Tăng tốc độ** | Input focused / Dialog mở | Tăng 1 nấc tốc độ (`0.5x` ➔ `0.75x` ➔ `1.0x` ➔ `1.25x` ➔ `1.5x`) |
| `R` | **Phát lại từ đầu** | Input focused / Dialog mở | Tua về 0:00 (hoặc về mốc A nếu A-B đang bật) và phát tiếp |
| `S` | **Bật / Tắt Gắn sao** | Input focused / Dialog mở | Đổi trạng thái sao của câu đang nghe, cập nhật queue |
| `M` | **Tắt / Bật tiếng (Mute)** | Input focused / Dialog mở | Toggle âm lượng giữa 0% và mức trước đó |
| `A` | **Đặt mốc A** | Input focused / Dialog mở | Lấy `currentTime` làm điểm A của đoạn lặp |
| `B` | **Đặt mốc B** | Input focused / Dialog mở | Lấy `currentTime` làm điểm B của đoạn lặp (nếu chưa có A thì A=0) |
| `X` | **Xóa đoạn A–B** | Input focused / Dialog mở | Xóa cả 2 mốc A và B, quay về lặp câu thông thường |

- **Nguyên tắc an toàn:** Phím tắt tự động bỏ qua nếu người dùng bấm kèm phím bổ trợ (`Cmd`, `Ctrl`, `Alt`) để tránh xung đột phím tắt của trình duyệt (ví dụ `Cmd + R` để reload).
- **Trạng thái:** [Implemented, Observed, Tested].

---

## 7. Giao Diện Người Dùng & Đáp Ứng (Responsive UI)

### 7.1. Chế Độ Sáng / Tối (Dark / Light Mode)
- **Hành vi thực tế:** Tự động điều chỉnh theo cấu hình hệ điều hành thông qua `@media (prefers-color-scheme: dark)`.
- Các biến màu CSS tự động chuyển đổi tương phản hoàn hảo:
  - Nền trang: `#f5f5f7` (Light) ⟷ `#000000` (Dark).
  - Thẻ card: `#ffffff` (Light) ⟷ `#111113` (Dark).
  - Chữ chính: `#1d1d1f` (Light) ⟷ `#f5f5f7` (Dark).
  - Cột sóng: `#1d1d1f` (Light) ⟷ `#f5f5f7` (Dark).
- *Lưu ý sai lệch tài liệu cũ:* Trong `DESIGN.md` ghi *"Không có dark mode"*, nhưng mã nguồn thực tế đã hoàn thiện hỗ trợ Dark Mode 100%.
- **Trạng thái:** [Implemented, Observed, Tested].

### 7.2. Co Giãn Sidebar (Responsive Breakpoints)
- **Màn hình lớn (> 768px):** Sidebar cố định rộng 320px bên trái, có thể bấm nút thu gọn thành thanh icon hẹp 72px (`sidebar-collapsed.tsx`).
- **Màn hình nhỏ (≤ 768px / Mobile):** Sidebar tự động ẩn và chuyển thành ngăn kéo trượt (drawer) đè lên giao diện chính khi người dùng mở, không làm vỡ layout của player.
- **Trạng thái:** [Implemented, Observed, Tested].

---

## 8. PWA, Service Worker & Hoạt Động Ngoại Tuyến

### 8.1. App Shell Caching
- File `public/sw.js` đăng ký cache shell tĩnh với tên `app-shell-v1`.
- Định tuyến điều hướng HTML: Dùng chiến lược `Stale-While-Revalidate` có fallback ngoại tuyến về trang chủ `/`.
- Tài nguyên tĩnh có băm (`/_next/static/*`): Dùng chiến lược `Cache-First` tải tức thì từ bộ nhớ đệm.
- **Tuyệt đối không cache file âm thanh:** Service Worker chủ động bỏ qua toàn bộ request có đuôi audio (`.mp3`, `.m4a`, `.wav`, v.v.) hoặc `request.destination === 'audio'`.
- **Trạng thái:** [Implemented, Observed, Tested].

### 8.2. Thông Báo Cập Nhật (Update Toast)
- Khi có bản build mới được triển khai, Service Worker mới ở trạng thái `waiting`.
- Ứng dụng hiển thị `UpdateToast` ở góc dưới: *"Có bản cập nhật mới — Tải lại"*.
- Khi người dùng click: Gửi thông điệp `{ type: 'SKIP_WAITING' }` đến SW và gọi `window.location.reload()`.
- **Trạng thái:** [Implemented, Observed, Tested].

### 8.3. Nút Cài Đặt Ứng Dụng (Install Button)
- Bắt sự kiện `beforeinstallprompt` trên trình duyệt Chromium.
- Hiển thị nút "Cài đặt ứng dụng" ở chân sidebar; click kích hoạt hộp thoại cài đặt native của hệ điều hành.
- Trên Safari: Hiển thị hướng dẫn chọn "Thêm vào Dock / Màn hình chính".
- Ẩn nút cài đặt khi ứng dụng đã chạy ở chế độ standalone (`display-mode: standalone`).
- **Trạng thái:** [Implemented, Observed, Tested].
