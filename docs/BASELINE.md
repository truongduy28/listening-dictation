# BASELINE METRICS — Phase 3

Ghi nhận tại thời điểm bắt đầu Phase 3 (commit `HEAD` trên nhánh `refactor/phase-3`). Đây là mốc "không được tệ hơn".

## 1. Số liệu tổng quan

| Chỉ số | Giá trị Baseline | Ngưỡng cho phép sau refactor |
|---|---|---|
| **TypeScript check (`tsc --noEmit`)** | 0 lỗi | 0 lỗi |
| **ESLint (`eslint`)** | 0 warning, 0 error | 0 warning, 0 error |
| **First Load JS (gzip)** | 108.9 KB (111,542 bytes) | ≤ 120 KB gzip |
| **Số lượng `any` (type annotation)** | 0 | 0 |
| **Số lượng `useEffect`** | 26 | Giảm hoặc bằng (tối ưu hóa, cleanup đầy đủ) |
| **Số file > 250 dòng** | 7 files | 0 files (phải chia nhỏ theo §3.3) |
| **Số test unit hiện tại** | 16 tests (node:test) | Nâng lên với Vitest + RTL (đạt ngưỡng §6.1) |

## 2. 15 File lớn nhất hiện tại

| STT | File | Số dòng | Vượt ngưỡng §3.3? |
|---|---|---|---|
| 1 | `components/welcome-screen.tsx` | 1,259 | Có (ngưỡng 150/component, 250/file) |
| 2 | `components/dictation-app.tsx` | 667 | Có (ngưỡng 150/component, 250/file) |
| 3 | `hooks/use-audio-player.ts` | 515 | Có (ngưỡng 120/hook, 250/file) |
| 4 | `components/waveform-region.tsx` | 436 | Có (ngưỡng 150/component, 250/file) |
| 5 | `hooks/use-folder-library.ts` | 334 | Có (ngưỡng 120/hook, 250/file) |
| 6 | `components/sidebar.tsx` | 311 | Có (ngưỡng 150/component, 250/file) |
| 7 | `components/player-card.tsx` | 310 | Có (ngưỡng 150/component, 250/file) |
| 8 | `lib/storage.ts` | 215 | Không (≤ 250 dòng) |
| 9 | `hooks/use-keyboard-shortcuts.ts` | 171 | Có (hook > 120 dòng) |
| 10 | `lib/__tests__/queue.test.ts` | 153 | Test file |
| 11 | `components/toolbar-card.tsx` | 143 | Không (≤ 150 dòng) |
| 12 | `lib/queue.ts` | 134 | Không (≤ 250 dòng) |
| 13 | `app/layout.tsx` | 122 | Không (≤ 250 dòng) |
| 14 | `lib/abLoop.ts` | 115 | Không (≤ 250 dòng) |
| 15 | `lib/file-system.ts` | 111 | Không (≤ 250 dòng) |

## 3. Phân bố `useEffect`

- `components/dictation-app.tsx`: 7
- `hooks/use-audio-player.ts`: 7
- `components/welcome-screen.tsx`: 2
- `components/sidebar.tsx`: 1
- `components/waveform-region.tsx`: 2
- `components/shortcuts-footer.tsx`: 1
- `hooks/use-keyboard-shortcuts.ts`: 1
- `hooks/use-folder-library.ts`: 1
- `hooks/use-service-worker.ts`: 2
- `hooks/use-pwa-install.ts`: 2
