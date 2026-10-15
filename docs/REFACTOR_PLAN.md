# REFACTOR PLAN — Kế hoạch tái cấu trúc Phase 3

Tài liệu này xác định các mục tiêu refactor, đánh giá rủi ro, xác định các bài test bảo vệ cần có trước khi thực hiện, và thứ tự triển khai theo nguyên tắc: **Một mục một việc, không đổi hành vi, luôn qua cổng kiểm thử**.

---

## 1. Bảng phân tích các điểm vi phạm chuẩn §3.3

| File hiện tại | Kích thước | Vi phạm | Giải pháp tái cấu trúc |
|---|---|---|---|
| `components/welcome-screen.tsx` | 1,259 dòng | Vượt giới hạn File (250) & Component (150) | Tách thành `components/welcome/`: `hero.tsx`, `floating-player.tsx`, `recent-folders-section.tsx`, `feature-cards.tsx`, `safari-banner.tsx`. |
| `components/dictation-app.tsx` | 667 dòng | Vượt giới hạn File (250) & Component (150), quá nhiều state | Tách layout sang `components/layout/app-shell.tsx`, tách hook điều khiển tổng thể, giảm logic trong view component. |
| `hooks/use-audio-player.ts` | 515 dòng | Vượt giới hạn Hook (120) & File (250), kiêm nhiệm cả AudioElement & WaveSurfer | Tách thành `hooks/use-audio-engine.ts` (quản lý AudioElement, object URL, play/pause/seek) và `hooks/use-waveform.ts` (quản lý instance WaveSurfer). |
| `components/waveform-region.tsx` | 436 dòng | Vượt giới hạn Component (150) & File (250), xử lý cả drag 2 handle | Tách thành `components/player/waveform-region.tsx`, `waveform-handle.tsx`, helper kéo thả `lib/waveformDrag.ts`. |
| `hooks/use-folder-library.ts` | 334 dòng | Vượt giới hạn Hook (120) & File (250), gọi trực tiếp FileSystem & IndexedDB | Tách hàm thuần sang `lib/fs.ts` và `lib/idb.ts`, giữ hook chỉ làm nhiệm vụ quản lý state thư viện. |
| `components/sidebar.tsx` | 311 dòng | Vượt giới hạn Component (150) & File (250) | Tách thành `components/sidebar/sidebar-header.tsx`, `sidebar-search.tsx`, `sidebar-filters.tsx`, `sidebar-file-list.tsx`. |
| `components/player-card.tsx` | 310 dòng | Vượt giới hạn Component (150) & File (250) | Tách `components/player/player-progress.tsx`, `player-transport.tsx`. |
| `hooks/use-keyboard-shortcuts.ts` | 171 dòng | Vượt giới hạn Hook (120) | Tách bảng ánh xạ phím tắt sang `lib/keyboard.ts`, hook chỉ lắng nghe sự kiện và kiểm tra focus an toàn. |

---

## 2. Danh sách mục việc (Sắp xếp theo thứ tự thực hiện)

### Bước 1: Dựng hạ tầng Test (Pha C — Lưới an toàn)
- **Mục C1 — Cấu hình Vitest, RTL, jsdom, fake-timers & v8 coverage**:
  - Cài đặt devDependencies cần thiết (`vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`, `@vitest/coverage-v8`, `fake-indexeddb`).
  - Cấu hình `vitest.config.ts` với ngưỡng coverage chuẩn theo §6.1.
  - Tạo các mock API trình duyệt tại `tests/setup/` (`HTMLMediaElement`, `AudioContext`, `showDirectoryPicker`, `IndexedDB`, `ResizeObserver`, `ServiceWorker`).
- **Mục C2 — Bộ test đặc tả bảo vệ logic thuần & hook (Characterization Tests)**:
  - Unit test cho: `lib/queue.ts`, `lib/abLoop.ts`, `lib/storage.ts`, `lib/pwa.ts`, `lib/format.ts`, `lib/naturalSort.ts`.
  - Hook test cho: `useDictationLoop`, `useAbLoop`, `useOnlineStatus`, `usePwaInstall`, `useServiceWorker`.
  - Component test cho: các UI nguyên tử (`Button`, `Modal`, `Switch`, `SegmentedControl`, `NumberField`).
  - **Kiểm tra: 100% test xanh trên code cũ trước khi bắt đầu sửa code.**

---

### Bước 2: Tách hằng số & hàm thuần (Pha D — Nhóm Rủi ro Thấp)
- **Mục D1 — Tạo `lib/constants.ts`**:
  - Gom toàn bộ số ma thuật (`0.3`, `20MB`, các giá trị mặc định, các phím tắt, các key storage).
  - Không thay đổi logic, chỉ thay thế giá trị literal bằng hằng số.
- **Mục D2 — Tách `lib/format.ts` & `lib/naturalSort.ts`**:
  - Tách các hàm format thời gian, định dạng tên file, sắp xếp tên file tự nhiên.
  - Phủ 100% unit test cho `lib/format.ts` và `lib/naturalSort.ts`.
- **Mục D3 — Tách `lib/fs.ts` & `lib/idb.ts`**:
  - Di chuyển các hàm quét thư mục, kiểm tra quyền, đọc IndexedDB ra khỏi hook.
  - Thêm xử lý lỗi dạng `{ ok: true, value } | { ok: false, reason }`.

---

### Bước 3: Tái cấu trúc Hook (Pha D — Nhóm Rủi ro Vừa)
- **Mục D4 — Tách `useAudioPlayer` thành `useAudioEngine` và `useWaveform`**:
  - `useAudioEngine.ts`: Chỉ quản lý phần tử `<audio>`, Object URL, phát/dừng, tua, tốc độ, âm lượng.
  - `useWaveform.ts`: Quản lý hiển thị WaveSurfer canvas, đồng bộ tiến trình và chủ đề (dark/light).
- **Mục D5 — Tối ưu hóa `useFolderLibrary`**:
  - Rút ngắn hook còn ≤ 120 dòng, gọi `lib/fs.ts` và `lib/idb.ts`.
- **Mục D6 — Chuẩn hóa `useKeyboardShortcuts`**:
  - Tách logic kiểm tra phím sang `lib/keyboard.ts`, hook ≤ 120 dòng.

---

### Bước 4: Tái cấu trúc Component (Pha D — Nhóm Rủi ro Thấp - Vừa)
- **Mục D7 — Tái cấu trúc `components/sidebar.tsx`**:
  - Tách thành các subcomponents trong `components/sidebar/`. Mỗi component ≤ 150 dòng.
- **Mục D8 — Tái cấu trúc `components/player-card.tsx` & `waveform-region.tsx`**:
  - Tách các subcomponents trong `components/player/`.
- **Mục D9 — Tái cấu trúc `components/welcome-screen.tsx`**:
  - Tách các section thành `components/welcome/`.
- **Mục D10 — Chuẩn hóa `components/dictation-app.tsx` & `layout/app-shell.tsx`**:
  - Tách khung layout AppShell, biến `dictation-app.tsx` thành container điều phối sạch sẽ.

---

### Bước 5: Phủ test & Kiểm tra hồi quy toàn diện (Pha E)
- **Mục E1 — Nâng độ phủ test đạt toàn bộ ngưỡng §6.1**:
  - Kiểm tra báo cáo coverage của Vitest.
  - Bổ sung test các case biên theo §6.2 và §6.3.
- **Mục E2 — Chạy toàn bộ ma trận hồi quy**:
  - Typecheck, ESLint, Unit & Integration test, Next build static export.

---

### Bước 6: Chuẩn bị Deploy Vercel & Hoàn thiện tài liệu (Pha F)
- **Mục F1 — Cấu hình Next.js static export & Vercel headers**:
  - Cập nhật `next.config.ts`: `output: 'export'`, `images.unoptimized: true`.
  - Cấu hình `vercel.json` với headers bảo mật và cache rules theo §8.
- **Mục F2 — Viết tài liệu bàn giao**:
  - `docs/ARCHITECTURE.md`
  - `docs/TESTING.md`
  - `docs/DEPLOY.md`
  - Cập nhật `README.md`
- **Mục F3 — Báo cáo hoàn thành Phase 3**:
  - Bảng so sánh trước và sau refactor theo §11.
