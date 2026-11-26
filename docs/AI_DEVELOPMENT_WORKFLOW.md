# QUY TRÌNH PHÁT TRIỂN DÀNH CHO AI CODING AGENT (AI DEVELOPMENT WORKFLOW)

> **Mục tiêu:** Hướng dẫn chuẩn hóa quy trình 6 bước giúp các AI Coding Agent phát triển tính năng, sửa lỗi hoặc cải tiến codebase một cách nhất quán, không gây hồi quy (regressions), tuân thủ kiến trúc và giữ vững chất lượng mã nguồn.

---

## 1. Tổng Quan Quy Trình 6 Bước

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  BƯỚC 1      │     │  BƯỚC 2      │     │  BƯỚC 3      │
│  UNDERSTAND  │ ──► │  INVESTIGATE │ ──► │  PLAN        │
│  Hiểu yêu cầu│     │  Điều tra sâu│     │  Lập kế hoạch│
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  BƯỚC 6      │     │  BƯỚC 5      │     │  BƯỚC 4      │
│  DOCUMENT    │ ◄── │  VERIFY      │ ◄── │  IMPLEMENT   │
│  Cập nhật doc│     │  Kiểm chứng  │     │  Viết mã     │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## 2. Chi Tiết Từng Bước Thực Hiện

### BƯỚC 1 — UNDERSTAND (Hiểu Rõ Phạm Vi & Yêu Cầu)
1. **Đọc tài liệu chỉ dẫn:**
   - Đọc `AGENTS.md` và `docs/INDEX.md` để nắm các ràng buộc bất khả xâm phạm.
   - Tra cứu ma trận tại `docs/INDEX.md` (§2) để mở tài liệu chuyên ngành tương ứng.
2. **Xác định phạm vi tác vụ:**
   - Tính năng mới thuộc tầng nào: UI Component (`Layer 3`), Feature View (`Layer 4`), Custom Hook (`Layer 2`), hay Pure Logic (`Layer 1`)?
   - Tính năng này có làm thay đổi bất kỳ hành vi nào đã ghi nhận trong `docs/BEHAVIOR_CATALOG.md` không?
3. **Tìm đúng source files liên quan:**
   - Dùng `git grep` hoặc tìm kiếm file cụ thể. Tuyệt đối không đoán mò cấu trúc thư mục.

---

### BƯỚC 2 — INVESTIGATE (Điều Tra Luồng Dữ Liệu & Ranh Giới)
1. **Truy vết luồng dữ liệu (Data Flow):**
   - Dữ liệu đầu vào bắt nguồn từ đâu (LocalStorage, IndexedDB, File System, hay React state)?
   - Component hoặc hook nào hiện đang là chủ sở hữu (State Owner)? Tham chiếu `docs/ARCHITECTURE.md` (§4).
2. **Tìm kiếm thành phần tái sử dụng (Reuse First):**
   - Kiểm tra `components/ui/` xem đã có component nguyên tử tương đương chưa (`Modal`, `SegmentedControl`, `SliderField`, `NumberField`, `Switch`).
   - Kiểm tra `lib/format.ts`, `lib/naturalSort.ts`, `lib/abLoop.ts`, `lib/queue.ts` xem đã có tiện ích hỗ trợ chưa.
   - **Quy tắc vàng:** Tuyệt đối không viết thêm abstraction hoặc UI component trùng lặp khi đã có sẵn.
3. **Kiểm tra bộ test hiện hữu:**
   - Xem file test liên quan trong `tests/` để hiểu các ràng buộc ngầm định và edge cases đã được bảo vệ.

---

### BƯỚC 3 — PLAN (Lập Kế Hoạch Thay Đổi Rõ Ràng)
1. **Liệt kê danh sách file cần sửa / tạo mới:**
   - Xác định rõ file nào sẽ chỉnh sửa, hàm nào sẽ được thêm.
2. **Đánh giá rủi ro (Risk Assessment):**
   - Thay đổi này có gây rò rỉ bộ nhớ (memory leak) với Object URL không?
   - Thay đổi này có ảnh hưởng đến việc bảo toàn cao độ âm thanh (`preservesPitch`) không?
   - Thay đổi này có làm file vượt quá giới hạn 250 dòng mã không?
3. **Xác định bài test cần bổ sung:**
   - Cần viết thêm unit test hay hook test nào để bảo vệ logic mới?
4. **Xác định tài liệu cần cập nhật sau khi hoàn thành.**

---

### BƯỚC 4 — IMPLEMENT (Viết Mã Nguồn Tuân Thủ Kiến Trúc)
1. **Tuân thủ quy chuẩn phân tầng:**
   - Nếu là pure logic: Viết vào `lib/`, đảm bảo không import React.
   - Nếu là state/side-effect: Viết custom hook vào `hooks/`.
   - Nếu là UI: Đặt vào `components/` hoặc `components/ui/`.
2. **Giữ kích thước file ≤ 250 dòng:**
   - Nếu file bắt đầu chạm ngưỡng 200–230 dòng, hãy chủ động phân tách các sub-components hoặc sub-hooks nhỏ hơn.
3. **Tuân thủ Design System (`docs/UI_UX_CATALOG.md`):**
   - Chỉ sử dụng các biến màu CSS có sẵn (`var(--bg-page)`, `var(--ink)`, `var(--border-default)`, v.v.).
   - Không tự ý thêm mã màu hex tùy tiện vào class Tailwind (trừ các gradient chuẩn của Welcome Screen).
   - Hỗ trợ đầy đủ Dark Mode qua CSS variables.
   - Luôn sử dụng `tabular-nums` cho số đếm, thời gian và phần trăm.
4. **Không refactor ngoài phạm vi (No Unrelated Refactoring):**
   - Chỉ sửa đúng chỗ cần thiết phục vụ yêu cầu. Không tự tiện đổi tên file, format lại file hàng loạt làm loãng git diff.

---

### BƯỚC 5 — VERIFY (Kiểm Chứng Toàn Diện & Chống Hồi Quy)
Chạy lần lượt chuỗi lệnh kiểm chứng:

```bash
# 1. Kiểm tra kiểu tĩnh (Bắt buộc 0 lỗi)
npm run typecheck

# 2. Kiểm tra linter (Bắt buộc 0 warning, 0 error)
npm run lint

# 3. Chạy toàn bộ unit test (Bắt buộc 100% test xanh)
npm test

# 4. Kiểm tra build xuất bản tĩnh (Next.js export ra out/)
npm run build
```

- **Kiểm tra tương tác thủ công / runtime:**
  - Nếu có thay đổi UI: Kiểm tra hiển thị cả trên Light Mode và Dark Mode.
  - Kiểm tra phím tắt: Đảm bảo phím tắt không bị kích hoạt ngoài ý muốn khi đang gõ vào ô tìm kiếm hoặc ô nhập số.
  - Kiểm tra tính trợ năng: Tab index, focus ring hiển thị rõ nét, `aria-label` đầy đủ.

---

### BƯỚC 6 — DOCUMENT (Cập Nhật Project Knowledge Base)
Sau khi mã nguồn đã được kiểm chứng xanh:
1. **Cập nhật `docs/BEHAVIOR_CATALOG.md`:** Nếu có hành vi mới hoặc thay đổi trạng thái quan sát được.
2. **Cập nhật `docs/ARCHITECTURE.md`:** Nếu có module mới hoặc luồng dữ liệu thay đổi.
3. **Cập nhật `docs/UI_UX_CATALOG.md`:** Nếu có thêm component UI hoặc cập nhật design token.
4. **Cập nhật `docs/TESTING.md`:** Nếu số lượng test hoặc kiến trúc test thay đổi.
5. **Cập nhật `AGENTS.md`:** Chỉ khi hướng dẫn hoặc quy tắc làm việc cho AI cần điều chỉnh.

---

## 3. Các Lỗi Thường Gặp Cần Tuyệt Đối Tránh (Common Pitfalls)

| Lỗi Phổ Biến | Hậu Quả | Cách Tránh Chuẩn Xác |
|---|---|---|
| **Xóa hoặc sửa khối `nextjs-agent-rules` trong `AGENTS.md`** | Gây dirty git tree liên tục do `next dev` tự tạo lại khối này | **Giữ nguyên 100%** khối comment `<!-- BEGIN:nextjs-agent-rules --> ... <!-- END:nextjs-agent-rules -->` |
| **Dùng Server Components hoặc gọi API Node.js** | Gãy lệnh `npm run build` vì app là Static Export (`output: 'export'`) | Toàn bộ components tương tác phải có `"use client"` và dùng browser APIs an toàn |
| **Cache file âm thanh trong Service Worker** | Làm đầy bộ nhớ trình duyệt, xung đột range requests, chậm ứng dụng | File audio **tuyệt đối không được cache** trong Service Worker |
| **Quên `URL.revokeObjectURL` khi đổi bài** | Rò rỉ bộ nhớ RAM trình duyệt khi nghe nhiều bài liên tiếp | Luôn gọi hàm dọn dẹp URL sau khi bài cũ kết thúc |
| **Không kiểm tra `isEditableElement` cho phím tắt** | Người dùng gõ chữ `a, b, r, s, space` vào ô tìm kiếm bị kích hoạt nút play/A-B | Luôn dùng `isEditableElement` lọc sự kiện trước khi xử lý phím tắt |
| **Tự ý viết thêm component Button/Modal mới** | Phá vỡ tính đồng nhất của Design System | Luôn tái sử dụng `components/ui/modal.tsx`, `.ghost`, `.pill-btn`, `.seg-btn` |
| **Viết file vượt quá 250 dòng** | Vi phạm quy chuẩn kiến trúc của dự án | Phân rã component thành các sub-components trong cùng thư mục |

