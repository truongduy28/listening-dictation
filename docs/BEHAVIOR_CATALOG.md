# BEHAVIOR CATALOG — Danh mục hành vi hiện tại (Ground Truth)

Tài liệu này ghi lại toàn bộ hành vi quan sát được của ứng dụng đang chạy trước khi thực hiện Phase 3. Đây là cơ sở để viết test đặc tả (characterization tests) và đảm bảo nguyên tắc: **Không đổi bất kỳ hành vi nhìn thấy được nào.**

---

### A. Phát âm thanh & Waveform
1. **Phát / Tạm dừng:** Nhấn Space hoặc nút Play/Pause trên PlayerCard chuyển đổi giữa trạng thái phát và tạm dừng.
2. **Tua âm thanh:**
   - Phím `←`: Lùi lại `skipSeconds` (mặc định 5s).
   - Phím `→`: Tiến tới `skipSeconds`.
   - Nút tua trên giao diện hiển thị số giây tương ứng.
   - Click trực tiếp trên sóng âm (WaveSurfer) để nhảy tới vị trí tương ứng.
3. **Tốc độ phát:**
   - 5 nấc: `0.5x`, `0.75x`, `1x`, `1.25x`, `1.5x`.
   - Phím `[`: Giảm tốc độ 1 nấc.
   - Phím `]`: Tăng tốc độ 1 nấc.
   - SegmentedControl trên ToolbarCard cập nhật ngay lập tức.
   - Giữ nguyên cao độ giọng đọc (`preservesPitch = true`).
4. **Âm lượng & Tắt tiếng (Mute):**
   - Slider âm lượng 0% – 100%.
   - Phím `M` hoặc click vào icon loa: Toggle giữa Mute (0%) và phục hồi mức âm lượng trước đó.
5. **Đổi bài:**
   - Gọi `loadFile()` tạo Object URL mới và thu hồi an toàn (`URL.revokeObjectURL`) Object URL cũ sau 3 giây.
   - Reset vị trí hiện tại về 0.
   - Tệp > 20MB (`MAX_WAVEFORM_FILE_SIZE`): Không nạp vào WaveSurfer để tránh lag bộ nhớ; hiển thị thanh tiến trình fallback và thông báo tệp lớn.
6. **Lỗi tải tệp:**
   - Khi audio bị hỏng hoặc định dạng không hỗ trợ, hiển thị thông báo lỗi màu đỏ trên vùng sóng âm và không làm đơ ứng dụng.

---

### B. Lặp, Nghỉ & Tự chuyển câu (Repetition & Gap)
1. **Lặp N lần (`repeatCount`):**
   - Giá trị từ 1 đến 99 (mặc định 1).
   - Khi hết bài, nếu số lần nghe hiện tại < `repeatCount`, tăng đếm và phát lại câu đó.
2. **Khoảng nghỉ giữa các lần lặp (`gapSeconds`):**
   - Giá trị từ 0 đến 30 giây (mặc định 2s).
   - Khi hết câu hoặc hết chu kỳ lặp A-B, nếu `gapSeconds > 0`, tạm dừng và hiển thị pill đếm ngược ("Chờ 2s...", "Chờ 1s...").
   - Hết thời gian nghỉ, tự động phát tiếp.
3. **Tự chuyển câu (`autoNext`):**
   - Bật (mặc định) / Tắt.
   - Khi đã hoàn thành đủ số lần lặp `repeatCount`, nếu bật `autoNext`, tự động chuyển sang câu tiếp theo trong hàng đợi đang kích hoạt.
   - Nếu đã ở cuối hàng đợi, dừng lại và reset chu kỳ lặp.
4. **Hủy hẹn giờ khi tương tác:**
   - Nếu đang trong khoảng đếm ngược `gapSeconds` mà người dùng bấm Play, Next, Prev, tua hoặc click chọn bài khác, bộ đếm ngược bị hủy ngay lập tức và thực hiện lệnh mới.

---

### C. A–B Repeat (Lặp đoạn con)
1. **Đặt điểm A & B:**
   - Phím `A` hoặc nút `Đặt A`: Gán thời gian hiện tại làm điểm A.
   - Phím `B` hoặc nút `Đặt B`: Gán thời gian hiện tại làm điểm B.
   - Nếu $B < A$: Tự động hoán đổi để luôn có $A < B$.
   - Khoảng cách $B - A < 0.3\text{s}$: Bị từ chối (không hợp lệ).
2. **Xóa A–B:** Phím `X` hoặc nút `Xóa A-B`: Xóa cả 2 điểm, trả về chế độ phát toàn bài bình thường.
3. **Vòng lặp rAF:**
   - Sử dụng `requestAnimationFrame` kiểm tra `currentTime >= B - 0.05s`.
   - Khi chạm mốc B: Nếu có `gapSeconds`, tạm dừng và đếm ngược; hết gap nhảy về A và phát tiếp.
4. **Giao diện vùng sóng âm (`WaveformRegion`):**
   - Vùng giữa A và B có màu nền mờ (`bg-[var(--accent-btn)]/15`) và viền biên rõ ràng.
   - 2 tay cầm A và B có thể kéo rê trực tiếp bằng chuột để tinh chỉnh thời gian.
   - Có tooltip hiển thị giây dạng `00:03.2`.
5. **Chuyển tệp:** Tự động xóa đoạn A–B; không lưu vào `localStorage`.

---

### D. Hàng đợi thông minh & Bộ lọc
1. **Bộ lọc danh sách:**
   - `Tất cả` (All)
   - `Chưa nghe` (Unheard)
   - `Đã nghe` (Listened)
   - `Gắn sao` (Starred)
   - Tìm kiếm theo từ khóa tên tệp.
2. **Hàng đợi phát:**
   - Khi đang áp dụng bộ lọc (ví dụ "Gắn sao"), hàng đợi phát chỉ gồm các bài thỏa mãn bộ lọc.
   - Khi hết bài cuối cùng của hàng đợi lọc, dừng phát.
3. **Gắn sao (`S`):**
   - Bấm `S` hoặc click icon ngôi sao: Đổi trạng thái sao của bài.
   - Nếu đang trong bộ lọc "Gắn sao" mà bỏ sao bài đang phát: Bài đó vẫn tiếp tục phát hết câu, không bị ngắt quãng.
4. **Tự động đánh dấu đã nghe:**
   - Khi phát tới $\ge 85\%$ thời lượng bài, tự động đánh dấu đã nghe.
5. **Chip Hàng đợi (`QueueChip`):**
   - Hiển thị trên thanh tiêu đề bài phát: Tên bộ lọc, số lượng câu (ví dụ `Hàng đợi: Gắn sao · 12 câu`).
   - Click vào chip mở sidebar nếu sidebar đang thu gọn.

---

### E. Thư mục & Khôi phục phiên
1. **Chọn thư mục:**
   - Chrome / Edge: Dùng File System Access API (`window.showDirectoryPicker`), quét đệ quy các tệp âm thanh hợp lệ (`.mp3`, `.m4a`, `.wav`, `.aac`, `.flac`, `.ogg`).
   - Safari / Mobile: Fallback input `<input type="file" webkitdirectory />`.
2. **Thư mục gần đây (Recent Folders):**
   - Lưu tối đa 3 thư mục gần nhất vào `localStorage` (`dictation_recent_folders`).
   - Hiển thị tên thư mục, tổng số file, câu đang nghe dở, và thời gian tương đối ("Hôm nay", "Hôm qua", "X ngày trước").
   - Click vào thư mục gần đây trên Chrome: Mở lại và yêu cầu người dùng cấp lại quyền đọc nếu cần (`requestPermission`).
   - Trên Safari: Không hỗ trợ giữ handle, có ghi chú thông tin rõ ràng.
3. **Khôi phục cài đặt & câu đang nghe:**
   - Khôi phục `playbackRate`, `volume`, `skipSeconds`, `repeatCount`, `gapSeconds`, `autoNext`, `sidebarCollapsed`, `language`.
   - Khôi phục tên tệp cuối cùng đang nghe trong thư mục (`dictation_session`).

---

### F. Phím tắt toàn cục
1. **Danh sách phím:**
   - `Space`: Phát / Tạm dừng
   - `←` / `→`: Tua lùi / Tua tới
   - `↑` / `↓`: Bài trước / Bài tiếp
   - `[` / `]`: Giảm / Tăng tốc độ
   - `R`: Phát lại từ đầu câu
   - `S`: Bật / Tắt gắn sao
   - `M`: Bật / Tắt âm thanh
   - `A`: Đặt điểm A
   - `B`: Đặt điểm B
   - `X`: Xóa đoạn A-B
2. **Nguyên tắc an toàn:**
   - Tự động bỏ qua khi focus vào `input`, `textarea`, `select`, hoặc phần tử `contentEditable`.
   - Thanh footer hiển thị gợi ý phím tắt kèm hoạt cảnh sáng phím khi nhấn.

---

### G. Giao diện người dùng & Khả năng phản hồi (Responsive)
1. **Sidebar:**
   - Màn hình rộng (> 768px): Có thể thu gọn / mở rộng; ghi nhớ trạng thái vào settings.
   - Màn hình hẹp (< 768px): Tự động thu gọn thành drawer overlay, không phá vỡ player.
2. **Welcome Screen:**
   - Hero section với tiêu đề ấn tượng ("Nghe từng câu. Chép từng chữ.").
   - Thẻ Demo Player nổi bật hiệu ứng Glassmorphism.
   - Thẻ thư mục gần đây và các tính năng nổi bật.
   - Nút chọn thư mục audio lớn, nổi bật.

---

### H. Đa ngôn ngữ (i18n)
1. Hỗ trợ tiếng Việt (`vi`) và tiếng Anh (`en`).
2. Nút chuyển đổi ngôn ngữ trên header hoạt động tức thì, lưu cấu hình vào `localStorage`.
3. 100% nội dung giao diện và ARIA labels đều được dịch tương ứng.

---

### I. PWA & Ngoại tuyến
1. Manifest hợp lệ hỗ trợ cài đặt dạng standalone.
2. Trọn bộ icons độ nét cao: 192x192, 512x512, maskable 512x512, apple-touch-icon 180x180.
3. Nút cài đặt ứng dụng ở sidebar (prompt gốc trên Chromium, modal hướng dẫn trên Safari).
4. Badge cảnh báo `Ngoại tuyến` khi ngắt kết nối mạng.
5. Service Worker: Cache tĩnh App Shell, stale-while-revalidate cho trang, toast cập nhật bản mới. Tuyệt đối **không cache file audio**.
