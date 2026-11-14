# PROJECT KNOWLEDGE BASE (PKB) — INDEX & NAVIGATION MAP

> **Chuyên mục:** Hướng dẫn điều hướng toàn diện cho AI Coding Agent & Kỹ sư phát triển  
> **Dự án:** Nghe chép — Audio Dictation Player (`listening-dictation-app`)  
> **Phiên bản:** 0.1.0 (Post Phase 3 Architecture)  
> **Trạng thái:** Production-ready Static Export (Next.js 16.4 / React 19 / TypeScript / Tailwind CSS v4)

---

## 1. Mục Tiêu & Bản Đồ Tài Liệu

Project Knowledge Base (PKB) là nguồn sự thật kỹ thuật duy nhất được reverse engineer trực tiếp từ mã nguồn thực tế, các bộ test, runtime behavior và design specifications.

Mọi tác vụ phát triển, sửa lỗi, refactor hoặc viết test đều phải tham chiếu các tài liệu tương ứng bên dưới trước khi thực hiện thay đổi.

```
docs/
├── INDEX.md                     # [ĐANG ĐỌC] Bản đồ tổng thể và hướng dẫn tra cứu
├── ARCHITECTURE.md              # Kiến trúc phân lớp, module catalog, state ownership & data flow
├── BEHAVIOR_CATALOG.md          # Danh mục hành vi thực tế (Ground Truth), business rules, edge cases
├── UI_UX_CATALOG.md             # Inventory màn hình, design system, tokens, component catalog, prototype diffs
├── STORAGE.md                   # Kiến trúc lưu trữ (IndexedDB, LocalStorage, File System Access API)
├── TESTING.md                   # Kiến trúc kiểm thử, mock system, ma trận test, phân tích coverage
├── DEPLOY.md                    # Hướng dẫn deploy Vercel static export, PWA headers & SW update
├── AI_DEVELOPMENT_WORKFLOW.md   # Quy trình 6 bước phát triển feature dành cho AI Coding Agent
├── AUDIT_REPORT.md              # Báo cáo audit tài liệu, bảng discrepancies, technical risks & gaps
├── BASELINE.md                  # Số liệu kỹ thuật lịch sử mốc bắt đầu Phase 3
└── REFACTOR_PLAN.md             # Kế hoạch tái cấu trúc lịch sử Phase 3
```

---

## 2. Ma Trận Tra Cứu Theo Loại Nhiệm Vụ (Task Lookup Matrix)

Khi nhận một yêu cầu phát triển mới, hãy đọc các tài liệu theo thứ tự ưu tiên sau:

| Loại Nhiệm Vụ (Task Type) | Tài Liệu Bắt Buộc Đọc Đầu Tiên | Tài Liệu Bổ Trợ | Source Files Trọng Tâm |
|---|---|---|---|
| **Hiểu tổng quan dự án & quy tắc AI** | `AGENTS.md`, `docs/INDEX.md` | `README.md` | `app/page.tsx`, `components/dictation-app.tsx` |
| **Phát triển / sửa tính năng Audio & Lặp** | `docs/ARCHITECTURE.md` (§3, §4), `docs/BEHAVIOR_CATALOG.md` (§A, §B, §C) | `docs/TESTING.md` (§2) | `hooks/use-audio-player.ts`, `hooks/use-audio-element.ts`, `hooks/use-repeat-controller.ts`, `hooks/use-ab-loop.ts`, `lib/abLoop.ts` |
| **Thêm / sửa giao diện UI & Styling** | `docs/UI_UX_CATALOG.md`, `docs/ARCHITECTURE.md` (§2) | `.spec/phase-2/DESIGN.md`, `app/globals.css` | `components/ui/*`, `components/player-card.tsx`, `components/toolbar-card.tsx`, `components/sidebar.tsx` |
| **Quản lý danh sách file, sắp xếp, lọc** | `docs/ARCHITECTURE.md` (§3), `docs/BEHAVIOR_CATALOG.md` (§D) | `docs/TESTING.md` | `lib/queue.ts`, `lib/naturalSort.ts`, `hooks/use-playback-queue.ts`, `hooks/use-folder-library.ts` |
| **Xử lý Filesystem, IndexedDB, Storage** | `docs/STORAGE.md`, `docs/BEHAVIOR_CATALOG.md` (§E) | `docs/ARCHITECTURE.md` | `lib/fs.ts`, `lib/idb.ts`, `lib/storage.ts`, `hooks/use-folder-loader.ts` |
| **Phím tắt bàn phím (Shortcuts)** | `docs/BEHAVIOR_CATALOG.md` (§F), `docs/ARCHITECTURE.md` | `docs/TESTING.md` | `lib/keyboard.ts`, `hooks/use-keyboard-shortcuts.ts`, `components/shortcuts-dialog.tsx` |
| **PWA, Service Worker & Ngoại tuyến** | `docs/DEPLOY.md`, `docs/BEHAVIOR_CATALOG.md` (§I) | `docs/STORAGE.md` | `public/sw.js`, `lib/pwa.ts`, `hooks/use-service-worker.ts`, `hooks/use-pwa-install.ts` |
| **Viết Test / Chạy CI / Đo Coverage** | `docs/TESTING.md` | `docs/AI_DEVELOPMENT_WORKFLOW.md` | `tests/unit/*`, `tests/hooks/*`, `tests/setup/*`, `vitest.config.ts` |
| **Quy trình chuẩn AI Coding Agent** | `docs/AI_DEVELOPMENT_WORKFLOW.md` | `docs/AUDIT_REPORT.md` | Toàn bộ source liên quan |

---

## 3. Các Ràng Buộc Kiến Trúc Bất Khả Xâm Phạm (Invariants)

Mọi thay đổi trong codebase phải tuân thủ nghiêm ngặt 8 nguyên tắc sau:

1. **Client-Side Only (`output: 'export'`):**
   - Ứng dụng xuất bản tĩnh 100%, không có backend, không có database server, không có API routes Next.js.
   - Entry point `app/page.tsx` sử dụng dynamic import với `ssr: false`. Tuyệt đối không gọi các Node.js server APIs trong code ứng dụng.
2. **Quyền riêng tư tuyệt đối (Privacy First):**
   - File âm thanh của người dùng chạy trực tiếp từ đĩa cục bộ thông qua File System Access API (hoặc input tệp trên Safari) và `URL.createObjectURL`.
   - **Tuyệt đối không upload audio lên bất kỳ server nào.** Không lưu file audio vào Service Worker Cache Storage hoặc IndexedDB.
3. **Phụ thuộc một chiều (Unidirectional Dependency):**
   - `Layer 5 (Orchestration)` ➔ `Layer 4 (Features)` ➔ `Layer 3 (UI Primitives)` ➔ `Layer 2 (Custom Hooks)` ➔ `Layer 1 (Pure Domain Libs)`.
   - Layer 1 (`lib/*`, trừ `i18n.tsx`) là code TypeScript thuần túy, deterministic, không import React hay JSX.
4. **Giới hạn kích thước file (≤ 250 dòng):**
   - Mọi file `.ts` / `.tsx` không vượt quá 250 dòng mã (ngưỡng tối đa 255 dòng đối với file chứa lifecycle phức tạp như `use-audio-element.ts`).
   - Component vượt ngưỡng phải được phân tách thành sub-components hoặc sub-hooks chuyên biệt.
5. **Không suy đoán hành vi (No Speculation):**
   - Chỉ hiện thực các behavior đã được kiểm chứng bởi code hoặc test.
   - Không tự ý thêm tính năng chỉ vì nó xuất hiện trong spec cũ (ví dụ: tính năng Shuffle xuất hiện trong `SPEC_PHASE2.md` nhưng không có trong source thực tế).
6. **Bảo tồn cao độ khi đổi tốc độ (`preservesPitch`):**
   - Luôn duy trì `preservesPitch = true` trên HTMLAudioElement để giọng đọc không bị méo tiếng khi thay đổi giữa 5 mức tốc độ (`0.5x`, `0.75x`, `1.0x`, `1.25x`, `1.5x`).
7. **Thu hồi Object URL chống rò rỉ bộ nhớ:**
   - Khi chuyển bài hoặc reset audio, phải gọi `URL.revokeObjectURL(oldUrl)` (hiện đang được quản lý trễ 3 giây trong `use-audio-element.ts`).
8. **Bảo toàn phím tắt an toàn (Focus Suppression):**
   - Mọi phím tắt toàn cục phải tự động bị ức chế khi người dùng đang nhập liệu trong `input`, `textarea`, `select` hoặc khi các modal dialogs đang mở.

---

## 4. Tóm Tắt Stack Công Nghệ

- **Framework:** Next.js 16.4.0 (Turbopack, Static Export)
- **UI Library:** React 19.3.0, React DOM 19.3.0
- **Ngôn ngữ:** TypeScript 5.0 (Strict mode, ES2017 target)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`, `@tailwindcss/turbopack`), CSS Custom Properties (Design Tokens)
- **Audio Engine:** HTML5 `<audio>` element (`useAudioElement`) kết hợp WaveSurfer.js 8.0.2 (`useWaveform`)
- **Icons:** Lucide React (`lucide-react`)
- **Testing:** Vitest 5.0.4, React Testing Library 16.3.3, JSDOM 30.1.3, `@vitest/coverage-v8`, `fake-indexeddb`
- **PWA:** Handcrafted Service Worker (`public/sw.js`, Cache-first cho Next static, Stale-while-revalidate cho HTML, không cache audio)
- **Deploy:** Vercel Static Hosting (`vercel.json`)

