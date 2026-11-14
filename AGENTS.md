<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENT ENTRY POINT — PROJECT KNOWLEDGE BASE (PKB)

Chào AI Coding Agent! Đây là repository **Nghe chép — Audio Dictation Player** (`listening-dictation-app`).  
Trước khi thực hiện bất kỳ thay đổi nào, bạn **BẮT BUỘC** phải đọc và tuân thủ các chỉ dẫn dưới đây.

---

## 1. Nguồn Sự Thật Kỹ Thuật (Single Source of Truth)

Toàn bộ tri thức kỹ thuật của dự án đã được chuẩn hóa tại thư mục `docs/`. Hãy đọc tài liệu tương ứng với tác vụ của bạn:

- **Bản đồ chỉ dẫn tổng thể & ma trận tra cứu:** [`docs/INDEX.md`](./docs/INDEX.md)
- **Quy trình 6 bước phát triển cho AI:** [`docs/AI_DEVELOPMENT_WORKFLOW.md`](./docs/AI_DEVELOPMENT_WORKFLOW.md)
- **Kiến trúc hệ thống, luồng dữ liệu & state:** [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- **Danh mục hành vi thực tế (Ground Truth):** [`docs/BEHAVIOR_CATALOG.md`](./docs/BEHAVIOR_CATALOG.md)
- **Catalog thành phần UI & Design Tokens:** [`docs/UI_UX_CATALOG.md`](./docs/UI_UX_CATALOG.md)
- **Kiến trúc lưu trữ (IndexedDB, LocalStorage):** [`docs/STORAGE.md`](./docs/STORAGE.md)
- **Quy chuẩn kiểm thử & Mock System:** [`docs/TESTING.md`](./docs/TESTING.md)
- **Hướng dẫn deploy Vercel & PWA:** [`docs/DEPLOY.md`](./docs/DEPLOY.md)
- **Báo cáo audit, sai lệch & rủi ro kỹ thuật:** [`docs/AUDIT_REPORT.md`](./docs/AUDIT_REPORT.md)

---

## 2. Các Ràng Buộc Bắt Buộc (Strict Invariants)

1. **Client-Side Only:** Ứng dụng là Static Export (`output: 'export'`). Không dùng Server Components hoặc Node.js server APIs.
2. **Quyền riêng tư:** Tuyệt đối không upload file âm thanh của người dùng lên server. Không cache file audio trong Service Worker.
3. **Tái sử dụng trước (Reuse First):**
   - Luôn kiểm tra [`components/ui/`](./components/ui/) trước khi viết UI mới (`Modal`, `SegmentedControl`, `SliderField`, `NumberField`, `Switch`).
   - Luôn kiểm tra [`lib/`](./lib/) trước khi viết hàm tiện ích mới.
   - Tuyệt đối không tạo thêm abstractions hoặc components trùng lặp.
4. **Giới hạn kích thước file:** Không file nào được vượt quá **250 dòng**. Nếu file dài, hãy tách thành sub-components hoặc sub-hooks.
5. **Không suy đoán nghiệp vụ:** Mọi business logic phải đối chiếu với [`docs/BEHAVIOR_CATALOG.md`](./docs/BEHAVIOR_CATALOG.md). Tính năng Shuffle chưa được code, phím `M` là Toggle Mute.
6. **Bảo toàn cao độ:** Đổi tốc độ phát luôn giữ `preservesPitch = true`.
7. **Chống rò rỉ bộ nhớ:** Thu hồi Object URL (`URL.revokeObjectURL`) khi chuyển bài hoặc reset audio.
8. **An toàn bàn phím:** Mọi phím tắt phải bị ức chế (`isEditableElement`) khi đang nhập liệu trong ô input hoặc khi dialog mở.

---

## 3. Quy Trình Kiểm Chứng Sau Thay Đổi (Verification Gate)

Trước khi hoàn thành turn làm việc, bạn phải chạy chuỗi lệnh kiểm tra và đảm bảo không có lỗi:

```bash
# 1. Typecheck tĩnh
npm run typecheck

# 2. Linting
npm run lint

# 3. Unit tests (64/64 tests phải pass)
npm test

# 4. Build tĩnh xuất bản
npm run build
```

Sau khi hoàn thành code và test, hãy cập nhật tài liệu tương ứng trong `docs/` nếu có thay đổi về kiến trúc, hành vi hoặc giao diện.
