# SPEC PHASE 3 — Refactor, kiểm thử toàn diện, chuẩn bị deploy

> Dành cho AI coding agent. Đây là dự án **brownfield đang chạy đúng** (MVP + Phase 2 đã xong, đã push git). Phase này **KHÔNG thêm tính năng, KHÔNG đổi giao diện, KHÔNG đổi hành vi**. Mục tiêu: code dễ đọc như do middle Next.js viết (fresher đọc hiểu), được bảo vệ bởi bộ test dày, sẵn sàng deploy Vercel.
> Tài liệu tham chiếu: `SPEC.md` (hành vi), `SPEC_PHASE2.md` (A–B, queue/shuffle, PWA), `DESIGN.md` + `tokens.css` (giao diện). Khi mâu thuẫn: hành vi hiện tại của app đang chạy là nguồn sự thật.

---

## 0. Luật bất di bất dịch

1. **Không đổi hành vi nhìn thấy được:** UI, phím tắt, thông điệp, animation, thứ tự phát, kết quả lưu trữ.
2. **Không đổi định dạng dữ liệu đã lưu** (key localStorage, schema IndexedDB, tên store). Người dùng cũ phải mở app mới mà không mất dữ liệu. Nếu buộc phải đổi → dừng, ghi `QUESTIONS.md`, chờ duyệt.
3. **Không đụng `public/sw.js` và cache key** trừ khi mục tiêu rõ ràng được duyệt. Thay đổi SW là rủi ro cao nhất.
4. **Không thêm thư viện runtime mới.** Thư viện dev (test, lint) được phép theo §5.
5. **Không xóa/làm yếu test để qua cổng.** Test đỏ = sửa code, không sửa kỳ vọng (trừ khi kỳ vọng sai so với hành vi thật, và phải ghi lý do trong commit).
6. **Không đoán.** Gặp hành vi mơ hồ → viết vào `QUESTIONS.md`, giữ nguyên code chỗ đó.
7. **Mỗi commit nhỏ, một mục đích, qua đủ cổng chất lượng (§4).** Không gộp refactor với sửa lỗi; nếu phát hiện bug thật, **viết test tái hiện (đỏ) → tách commit `fix:` riêng** và ghi vào `BUGS_FOUND.md`.
8. Làm trên nhánh `refactor/phase-3`. Trước khi bắt đầu tạo tag `pre-phase-3` để rollback.

---

## 1. Quy trình bắt buộc (làm tuần tự, dừng ở các điểm CHỐT)

### Pha A — Baseline (không sửa code)
- Chạy `tsc --noEmit`, lint, build, ghi lại: kích thước bundle (First Load JS gzip), số dòng của 15 file lớn nhất, số `any`, số warning lint, số `useEffect`, Lighthouse (Performance, PWA).
- Ghi vào `docs/BASELINE.md`. Đây là mốc "không được tệ hơn".
- Chạy app, ghi tay `docs/BEHAVIOR_CATALOG.md`: mọi hành vi quan sát được (theo mục §6.3). Đây là cơ sở viết test đặc tả.

### Pha B — Khảo sát & kế hoạch (không sửa code) → **CHỐT 1**
- Quét: file/hàm/component/hook vượt giới hạn §3.3, code lặp, `useEffect` rối hoặc thiếu cleanup, `any`, số ma thuật, code chết, import vòng, component gọi trực tiếp API trình duyệt.
- So sánh cây thư mục hiện tại với cây đích §2.
- Xuất `docs/REFACTOR_PLAN.md`: bảng mục việc (ID, vấn đề, file, cách làm, rủi ro thấp/vừa/cao, test bảo vệ cần có trước). Sắp theo thứ tự thực hiện.
- **Dừng, chờ người duyệt.**

### Pha C — Lưới an toàn (chưa refactor) → **CHỐT 2**
- Dựng hạ tầng test (§5).
- Viết **test đặc tả (characterization tests)** cho hành vi hiện tại: logic thuần (unit), hook (hook test), component (RTL), luồng chính (Playwright). Test phải **xanh trên code CŨ** chưa refactor.
- Đạt ngưỡng coverage §6.1 trên code cũ *trước khi* đụng vào cấu trúc (với phần logic thuần; phần chưa tách được thì ghi nhận, nâng sau).
- Báo cáo coverage. **Dừng, chờ duyệt.**

### Pha D — Refactor từng mục
- Mỗi lượt đúng **một mục** trong `REFACTOR_PLAN.md`. Chạy cổng §4. Commit. Đánh dấu hoàn thành trong plan.
- Quy tắc commit: `refactor(scope): ...`, `test(scope): ...`, `chore: ...`. Một mục có thể gồm 2 commit: `test:` (bổ sung bảo vệ) rồi `refactor:`.
- Sau mỗi 3–5 mục: chạy bộ regression E2E đầy đủ + smoke thủ công §6.4.

### Pha E — Phủ test & hồi quy cuối → **CHỐT 3**
- Nâng coverage tới ngưỡng cuối §6.1; bổ sung các case biên §6.2.
- Chạy toàn bộ ma trận hồi quy §6.4 (tự động + checklist thủ công).
- Mutation testing cho `lib/` (§6.5).

### Pha F — Chuẩn bị deploy
- Thực hiện §8 (Vercel). Cập nhật `README.md`, viết `docs/ARCHITECTURE.md`, `docs/TESTING.md`, `docs/DEPLOY.md`.
- Báo cáo cuối: số liệu trước/sau (so với `BASELINE.md`).

---

## 2. Cây thư mục đích

```
src/
├─ app/                        # Chỉ routing + layout, KHÔNG logic nghiệp vụ
│  ├─ layout.tsx
│  ├─ page.tsx                 # Ghép <Welcome/> hoặc <AppShell/>
│  └─ globals.css              # import styles/tokens.css
│
├─ components/                 # Chỉ hiển thị: nhận props, ít logic
│  ├─ ui/                      # Nguyên tử dùng lại
│  │  ├─ Button.tsx
│  │  ├─ IconButton.tsx
│  │  ├─ Segmented.tsx
│  │  ├─ Slider.tsx
│  │  ├─ Switch.tsx
│  │  ├─ NumberField.tsx
│  │  ├─ Dialog.tsx
│  │  ├─ Toast.tsx
│  │  └─ Kbd.tsx
│  ├─ layout/                  # AppShell, Sidebar, MainPane
│  ├─ sidebar/                 # FileList, FileRow, SearchBox, FilterTabs, FolderHeader
│  ├─ player/                  # TrackTitle, Waveform, TransportControls,
│  │                           #   AbLoopBadge, QueueChip, RepeatStatusChip
│  ├─ toolbar/                 # RepeatField, GapField, SpeedPills, SkipSlider
│  ├─ welcome/                 # Hero, FloatingPlayer, RecentFolderCards, FeatureCards
│  ├─ folders/                 # RecentFoldersDialog, FolderItem
│  ├─ pwa/                     # InstallButton, UpdateToast, OfflineChip
│  └─ dialogs/                 # ResetDialog, ShortcutsDialog
│
├─ hooks/                      # State + side effect, mỗi hook MỘT việc
│  ├─ useAudioEngine.ts        # <audio>, play/pause/seek/rate, object URL
│  ├─ usePlaybackQueue.ts      # next/prev, shuffle, history (gọi lib/queue)
│  ├─ useAbLoop.ts             # rAF kiểm tra đoạn A–B (gọi lib/abLoop)
│  ├─ useRepeatController.ts   # lặp N lần, gap, auto-next
│  ├─ useHotkeys.ts
│  ├─ useFolderLoader.ts       # chọn thư mục, quét file, fallback Safari
│  ├─ useRecents.ts
│  ├─ useWaveform.ts           # peaks + cache
│  ├─ usePersistedState.ts
│  ├─ usePwaInstall.ts
│  ├─ useServiceWorker.ts
│  └─ useOnlineStatus.ts
│
├─ lib/                        # Hàm THUẦN, không React, 100% có unit test
│  ├─ queue.ts                 # getNextIndex, getPrevIndex, shuffle (Fisher-Yates), history
│  ├─ abLoop.ts                # isLoopRangeValid, shouldJumpBack, clampRange
│  ├─ naturalSort.ts
│  ├─ format.ts                # formatTime, formatFileName, formatCount
│  ├─ peaks.ts                 # tính peaks từ AudioBuffer, LRU cache
│  ├─ fs.ts                    # showDirectoryPicker, quyền, quét thư mục, fallback
│  ├─ idb.ts                   # lưu/đọc FileSystemDirectoryHandle
│  ├─ storage.ts               # localStorage có version + try/catch
│  ├─ i18n.ts
│  ├─ pwa.ts
│  └─ constants.ts             # MIN_AB_GAP_SEC, SPEEDS, MAX_DECODE_BYTES...
│
├─ store/                      # State dùng chung
│  ├─ settingsStore.ts         # repeat, gap, speed, skip, lang
│  ├─ libraryStore.ts          # files, marks (sao/đã nghe), filter, search
│  └─ playerStore.ts           # currentIndex, isPlaying, abLoop, shuffle
│
├─ types/                      # Track, Settings, RecentFolder, AbRange, ...
└─ styles/
   └─ tokens.css

public/
├─ manifest.webmanifest
├─ sw.js
└─ icons/

tests/
├─ unit/                       # phản chiếu cấu trúc src/lib
├─ hooks/                      # test hook (renderHook)
├─ components/                 # RTL
├─ e2e/                        # Playwright
├─ fixtures/                   # audio mẫu nhỏ, file giả, dữ liệu storage cũ
└─ setup/                      # mock File System Access, AudioContext, IDB, SW
docs/
├─ BASELINE.md  BEHAVIOR_CATALOG.md  REFACTOR_PLAN.md
├─ ARCHITECTURE.md  TESTING.md  DEPLOY.md
├─ QUESTIONS.md  BUGS_FOUND.md
```

**Đây là đích hướng tới, không phải lệnh đập đi xây lại.** Nếu repo hiện tại đã gần giống, giữ nguyên. Chỉ di chuyển phần lệch, mỗi commit một nhóm file, dùng `git mv` để giữ lịch sử.

### 2.1 Quy tắc phụ thuộc (một chiều, được ESLint chặn)
`components → hooks → store → lib → types`
- `lib/` không import React, không import ngoài `types/` và chính `lib/`.
- `components/` **không** gọi trực tiếp API trình duyệt (File System Access, IndexedDB, AudioContext, localStorage, `navigator.serviceWorker`). Việc đó nằm ở `hooks/` hoặc `lib/`.
- `components/ui/` không biết gì về nghiệp vụ (không import store/hooks nghiệp vụ).
- Không import chéo giữa các thư mục con của `components/` (trừ `ui/`).
- Không import vòng (kiểm tra bằng `eslint-plugin-import/no-cycle` hoặc `madge`).

---

## 3. Chuẩn code "fresher đọc hiểu"

### 3.1 Cấu trúc
- Một file một việc. File hook/component/lib đặt tên theo đúng thứ nó export.
- Component: nhận props → trả JSX. Logic nặng đẩy xuống hook hoặc `lib/`.
- Hàm thuần đặt trong `lib/`, có tên mô tả ý định.

### 3.2 Đặt tên & dòng code
- Tên nói lên ý định: `getNextTrackIndex`, `isLoopRangeValid`. **Cấm** `data`, `handle`, `tmp`, `util`, `helper`, `obj`, `val`.
- Hàm trả boolean bắt đầu bằng `is/has/can/should`.
- Không số/chuỗi ma thuật: đưa vào `constants.ts` (`MIN_AB_GAP_SEC = 0.3`, `MAX_DECODE_BYTES = 20 * 1024 * 1024`).
- Early return thay `if` lồng sâu. Cấm toán tử ba ngôi lồng nhau.
- Comment giải thích **vì sao**, không giải thích **cái gì**. Chỗ phức tạp (rAF A–B, quyền thư mục, SW) có 1–3 dòng lý do.

### 3.3 Giới hạn (ESLint thực thi)
| Hạng mục | Giới hạn |
|---|---|
| Hàm | ≤ 40 dòng |
| Component | ≤ 150 dòng |
| Hook | ≤ 120 dòng |
| File | ≤ 250 dòng |
| Độ phức tạp cyclomatic | ≤ 10 |
| Số tham số hàm | ≤ 4 (hơn thì dùng object) |
| Độ sâu lồng | ≤ 3 |
Vượt giới hạn → tách. Ngoại lệ phải có `// eslint-disable-next-line ... -- lý do` và ghi trong plan.

### 3.4 React/Next
- Mỗi `useEffect` làm **một** việc, có cleanup (listener, rAF, timer, object URL, observer), có comment lý do.
- Không `useEffect` để tính giá trị dẫn xuất (dùng biến thường / `useMemo`).
- Dependency array đúng (bật `react-hooks/exhaustive-deps` ở mức error).
- Không tạo hàm/object mới mỗi lần render truyền xuống component đã `memo` nếu gây re-render thừa.
- **Giữ nguyên ngân sách hiệu năng:** không re-render danh sách file mỗi giây; chỉ animate `transform/opacity`.
- Directive `'use client'` đặt ở mức thấp nhất có thể.

### 3.4b TypeScript
- `strict: true`, bật `noUncheckedIndexedAccess`, `noImplicitOverride`.
- **Cấm `any`** (`@typescript-eslint/no-explicit-any` = error). Dùng `unknown` + thu hẹp kiểu.
- Kiểu tường minh cho props và giá trị trả về của hàm export.
- Dùng union literal thay enum cho trạng thái (`'idle' | 'playing' | 'paused'`).
- Không `as` ép kiểu bừa; chỉ khi có lý do và comment.

### 3.5 Xử lý lỗi
- Mọi lời gọi API trình duyệt có thể lỗi (permission, quota, decode, IDB) đều bọc try/catch tại `lib/` và trả kết quả có kiểu (`{ ok: true, value } | { ok: false, reason }`), không ném lỗi thô lên UI.
- Hành vi lỗi hiện có **giữ nguyên** (thông báo, trạng thái "cần cấp quyền", "không tìm thấy").

---

## 4. Cổng chất lượng (mọi commit phải qua)

```
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint . --max-warnings 0
pnpm test           # vitest run --coverage (có ngưỡng, §6.1)
pnpm build          # next build (static export) phải sạch
```
Cổng mở rộng (sau mỗi 3–5 mục và trước CHỐT):
```
pnpm test:e2e       # Playwright toàn bộ
pnpm audit:bundle   # so với BASELINE (không tệ hơn)
pnpm lighthouse     # Performance ≥ 95, PWA installable
```
Cấu hình `husky` + `lint-staged` chạy typecheck/lint/test liên quan trước khi commit; CI (GitHub Actions) chạy toàn bộ cổng trên mọi PR.

---

## 5. Hạ tầng test

| Mục đích | Công cụ |
|---|---|
| Unit + hook + component | **Vitest** + **@testing-library/react** + **@testing-library/user-event** + `jsdom` |
| Coverage | `@vitest/coverage-v8` |
| E2E / hồi quy | **Playwright** (Chromium, WebKit; Firefox tùy chọn) |
| Mock API trình duyệt | file trong `tests/setup/`: File System Access (`showDirectoryPicker`, handle, `queryPermission`, `requestPermission`), `AudioContext/decodeAudioData`, `HTMLMediaElement` (play/pause/currentTime/playbackRate/ended), `indexedDB` (`fake-indexeddb`), `ResizeObserver`, `matchMedia`, `requestAnimationFrame` (fake timers), `URL.createObjectURL`, `navigator.serviceWorker`, `beforeinstallprompt` |
| Mutation test | **Stryker** (chỉ cho `src/lib`) |
| A11y | `vitest-axe` (component) + `@axe-core/playwright` (E2E) |
| Hiệu năng | Lighthouse CI, `size-limit` cho bundle |

Yêu cầu:
- Test **xác định, không flaky**: dùng fake timers, không `sleep` cố định, không phụ thuộc mạng.
- Fixture audio: tệp mp3/m4a nhỏ (vài chục KB) trong `tests/fixtures/` (E2E dùng `setInputFiles` / mock picker).
- Trong E2E, mock `showDirectoryPicker` bằng thư mục ảo (qua `page.addInitScript`) vì picker thật không tự động hóa được; WebKit kiểm tra nhánh fallback `<input webkitdirectory>`.
- Mọi bug đã biết có test hồi quy riêng đặt tên `regression: <mô tả>`.

---

## 6. Chiến lược kiểm thử & độ phủ

### 6.1 Ngưỡng coverage (cấu hình trong `vitest.config.ts`, thấp hơn = build đỏ)
| Vùng | Lines | Branches | Functions |
|---|---|---|---|
| `src/lib/**` | **100%** | **≥ 95%** | **100%** |
| `src/store/**` | ≥ 95% | ≥ 90% | ≥ 95% |
| `src/hooks/**` | ≥ 90% | ≥ 85% | ≥ 90% |
| `src/components/**` | ≥ 85% | ≥ 80% | ≥ 85% |
| **Toàn dự án** | **≥ 90%** | **≥ 85%** | **≥ 90%** |

Quy tắc trung thực về coverage:
- Mục tiêu là **phủ tối đa có ý nghĩa**, không phải số đẹp. Không viết test rỗng chỉ để tăng số (mỗi test phải có assertion về hành vi).
- Loại trừ hợp lý (ghi rõ trong `coverage.exclude` kèm lý do): `app/layout.tsx` thuần cấu hình, file types, mock/setup, `sw.js` (được kiểm thử riêng §6.3-L). Mọi loại trừ khác phải được duyệt.
- Coverage chỉ là điều kiện cần. Điều kiện đủ là bảng case §6.2/6.3 và mutation score §6.5.

### 6.2 Unit test — danh mục case tối thiểu theo module

**lib/naturalSort**: số trong tên (`2` < `10`), chữ hoa/thường, tiền tố 0 (`01`, `001`), Unicode/tiếng Việt, chuỗi rỗng, trùng tên, tên không có số, mảng rỗng/1 phần tử, ổn định thứ tự (stable).

**lib/queue**: danh sách rỗng, 1 phần tử, next ở cuối (dừng hay lặp theo cài đặt hiện tại), prev ở đầu, shuffle không lặp bài cho tới khi hết vòng, shuffle bảo toàn tập phần tử (không mất/nhân đôi), seed cố định cho test xác định, history stack (quay lại bài trước theo thứ tự đã nghe), đổi bộ lọc khi đang phát (bài hiện tại không còn trong hàng đợi), hàng đợi theo "Gắn sao"/"Chưa nghe"/tìm kiếm, bài hiện tại bị bỏ sao khi đang phát trong hàng đợi sao.

**lib/abLoop**: A<B hợp lệ; B−A < `MIN_AB_GAP_SEC` bị từ chối; A=B; A>B (tự đảo hay từ chối đúng như hành vi hiện tại); chưa đặt A/B; đặt B khi chưa có A; xóa; clamp theo độ dài bài; `shouldJumpBack` ở sát biên (dung sai); đổi bài thì reset; tốc độ khác 1×.

**lib/format**: 0s, <10s, 59.9s, 60s, 3599s, ≥1h, số âm/NaN/Infinity (hành vi an toàn), làm tròn, tên tệp bỏ đuôi, tên rất dài, ký tự đặc biệt, số thứ tự 3 chữ số.

**lib/peaks**: kích thước mảng đúng, chuẩn hóa 0–1, buffer rỗng/mono/stereo, LRU đẩy phần tử cũ khi đầy, bỏ qua tệp > `MAX_DECODE_BYTES`, decode lỗi → trả `{ok:false}`.

**lib/fs**: quét chỉ nhận mp3/m4a/audio hợp lệ, bỏ qua tệp ẩn/không hỗ trợ, thư mục lồng nhau (theo hành vi hiện tại), thư mục rỗng, hàng nghìn tệp, quyền `granted/prompt/denied`, `requestPermission` thất bại, thư mục bị xóa (NotFoundError), fallback `webkitdirectory` khi không có `showDirectoryPicker` (feature detection, không UA sniffing), người dùng hủy picker (AbortError) không coi là lỗi.

**lib/idb**: lưu/đọc/xóa handle, ghi đè cùng khóa, IDB không khả dụng (private mode) → không crash, schema/phiên bản cũ mở được.

**lib/storage**: đọc key chưa có → mặc định; JSON hỏng → mặc định, không crash; `localStorage` ném lỗi (quota/blocked) → bỏ qua êm; migrate từ **dữ liệu của bản cũ** (fixture `tests/fixtures/legacy-storage.json`); không ghi thừa khi không đổi; giá trị ngoài phạm vi (speed không thuộc danh sách, repeat âm) → chuẩn hóa về hợp lệ.

**lib/i18n**: đủ key cho cả `vi` và `en` (test so khớp bộ key hai ngôn ngữ), thay tham số, key thiếu → fallback, ngôn ngữ lạ → mặc định.

**lib/pwa**: nhận diện `standalone`, trạng thái installable, hiển thị hướng dẫn "Add to Dock" cho Safari.

### 6.3 Test hook / component / E2E — danh mục hành vi (mỗi dòng ≥ 1 test)

**A. Phát âm thanh**: phát/dừng; tua (click sóng, ←/→ theo bước skip); đổi tốc độ 0.5/0.75/1/1.25/1.5 và `preservesPitch`; đổi bài hủy object URL cũ (`revokeObjectURL` được gọi); hết bài; lỗi tải tệp (hỏng) → báo lỗi và không treo hàng đợi; tab ẩn/hiện; thay thiết bị âm thanh.
**B. Lặp / nghỉ / tự chuyển**: lặp N lần rồi sang bài kế; gap giữa các lần và trước khi chuyển; N=1; N rất lớn; gap=0; nhập số không hợp lệ (rỗng, âm, chữ, thập phân) → chuẩn hóa; đổi N giữa chừng; bấm next/prev/chọn bài khi đang trong gap (hủy timer); chip trạng thái "Lặp 2/3 · chuyển câu sau 2 giây" đúng số.
**C. A–B repeat**: đặt A rồi B; nhảy về A khi chạm B (kiểm bằng rAF, không `timeupdate`); phím `A`, `B`, `X`; vùng hiển thị trên sóng; đổi tốc độ khi đang lặp A–B; tua ngoài vùng; xóa vùng; đổi bài reset; kết hợp lặp N lần + A–B (theo hành vi hiện tại); khoảng < 0.3s bị từ chối.
**D. Hàng đợi / shuffle / lọc**: lọc Tất cả/Gắn sao/Chưa nghe; tìm kiếm; hàng đợi = danh sách sau lọc; shuffle bật/tắt (phím `S`); chip "Hàng đợi: Gắn sao · 7 câu · Ngẫu nhiên"; đánh sao/bỏ sao (phím `M`/click) cập nhật hàng đợi; đánh dấu đã nghe tự động; đặt lại (reset) xóa dấu + có dialog xác nhận.
**E. Thư mục & khôi phục**: chọn thư mục; thư mục gần đây (tối đa theo hành vi hiện tại, sắp xếp mới nhất, trùng thì đưa lên đầu); mở lại cần cấp quyền (gọi `requestPermission` trong sự kiện click); quyền bị thu hồi; thư mục không còn; xóa mục gần đây; khôi phục tệp đang chọn sau khi tải lại trang; Safari fallback hiển thị ghi chú và không có "gần đây".
**F. Phím tắt**: Space, ←/→, ↑/↓, `[` `]`, R, A, B, X, S, M hoạt động; **không kích hoạt khi đang focus ô nhập/NumberField/tìm kiếm**; không trùng phím hệ thống (Cmd/Ctrl + phím); giữ phím không gây lặp lệnh ngoài ý muốn; dialog phím tắt mở/đóng.
**G. Sidebar & responsive**: thu/mở; tự thu < 768px (ngăn kéo); tablet thanh icon 72px; vùng chạm ≥ 44px; focus ring; `Esc` đóng dialog; bẫy focus trong dialog.
**H. i18n & cài đặt**: chuyển vi/en lập tức, lưu lại; cài đặt (repeat, gap, speed, skip) được lưu và khôi phục.
**I. Hiển thị**: danh sách ≥ 100 / 1000 tệp không giật (ảo hóa nếu hiện có); tên dài bị cắt `…`; sóng âm chỉ vẽ khi có peaks; tệp > 20MB không decode, vẫn phát được; `prefers-reduced-motion` tắt animation.
**J. PWA**: manifest hợp lệ (`start_url`, `scope`, icon 192/512 + maskable); nút "Cài đặt ứng dụng" xuất hiện khi có `beforeinstallprompt` và ẩn sau khi cài; chip "Ngoại tuyến" khi mất mạng; app shell tải được khi offline; **không cache audio**.
**K. Service Worker (test riêng, môi trường SW giả hoặc Playwright)**: cài đặt tạo cache có version; kích hoạt xóa cache cũ; stale-while-revalidate cho shell; không `skipWaiting` tự động; khi có bản mới → toast "Tải lại" → bấm mới gửi `SKIP_WAITING` rồi reload; yêu cầu audio/Blob không bị cache; tải bản cũ → bản mới không kẹt cache.
**L. Dữ liệu cũ (tương thích ngược)**: nạp fixture `localStorage`/IDB của **bản MVP** và **bản Phase 2** vào bản mới → settings, dấu sao/đã nghe, danh sách gần đây đọc đúng, không mất, không lỗi.
**M. Trạng thái rỗng/lỗi**: chưa chọn thư mục (Welcome), thư mục rỗng, không có tệp hợp lệ, toàn tệp hỏng, mất quyền giữa chừng.
**N. A11y**: `axe` không lỗi mức serious/critical trên Welcome, Main, Dialog; nút có `aria-label`; switch có `role="switch"` + `aria-checked`; thứ tự Tab hợp lý; màu tương phản chữ ≥ 4.5:1.

### 6.4 Ma trận hồi quy E2E (Playwright) + checklist thủ công
- **Tự động:** Chromium (Win/Linux runner) và WebKit cho các luồng A–N ở trên có thể mô phỏng. Chạy trong CI.
- **Thủ công trước deploy (ghi kết quả vào `docs/TESTING.md`):** Chrome Windows, Chrome macOS, Safari macOS × {chọn thư mục thật, thư mục 100+ tệp, tệp > 20MB, thu hồi quyền, xóa/đổi tên thư mục, đóng–mở lại, cài PWA, ngoại tuyến, cập nhật SW}.
- Smoke thủ công 5 phút sau mỗi 3–5 commit: phát → lặp → A–B → shuffle+sao → gần đây → i18n → reset → tải lại.
- **Kiểm tra rò rỉ bộ nhớ:** đổi bài 50 lần liên tiếp, số object URL còn sống ≤ 2, số listener không tăng, heap không tăng đáng kể.

### 6.5 Mutation test (chỉ `src/lib`)
- Chạy Stryker; **mutation score ≥ 85%** cho `queue`, `abLoop`, `naturalSort`, `format`, `storage`. Mutant sống phải được xử lý bằng test bổ sung hoặc ghi nhận lý do.

### 6.6 Property-based test (tùy chọn nhưng khuyến nghị)
- Dùng `fast-check` cho `queue`/`shuffle` (hoán vị bảo toàn phần tử, không lặp trong 1 vòng), `naturalSort` (sắp xếp idempotent, so sánh bắc cầu), `formatTime` (không NaN, độ dài hợp lý).

---

## 7. Hiệu năng & chất lượng (không được tệ hơn BASELINE)
- First Load JS ≤ 120KB gzip; Lighthouse Performance ≥ 95, PWA installable; LCP < 1.2s; INP < 100ms; CLS 0; không long task > 50ms.
- Số `any` = 0; warning lint = 0; không import vòng; không file > 250 dòng.
- Bundle: kiểm tra `size-limit`; refactor không được kéo thêm dependency vào bundle chính.

---

## 8. Chuẩn bị deploy Vercel (static export)

- `next.config`: `output: 'export'`, `images.unoptimized: true` (nếu dùng `next/image`), `trailingSlash` theo hành vi hiện tại.
- Vercel project: Framework Preset **Next.js**, Output Directory `out`, Node version cố định (`engines` trong `package.json` + cài đặt Vercel), `pnpm` (hoặc npm) khớp lockfile.
- **Không có biến môi trường bí mật.** Quét toàn mã: không còn `process.env.*` bị sót; nếu có thì ghi rõ trong `docs/DEPLOY.md`.
- `vercel.json` headers:
  - `/sw.js` → `Cache-Control: public, max-age=0, must-revalidate`; `Service-Worker-Allowed: /`
  - `/_next/static/*` → `public, max-age=31536000, immutable`
  - `/manifest.webmanifest` → `Content-Type: application/manifest+json`, cache ngắn
  - `/icons/*` → cache dài
  - Header bảo mật: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` tối thiểu; CSP chỉ thêm nếu không phá app (test kỹ với SW/blob audio: `media-src 'self' blob:`).
- Kiểm tra: HTTPS mặc định; `start_url`/`scope` đúng ở domain Vercel; icon đủ kích thước; `theme-color`; trang 404 hợp lý.
- Quy trình: deploy **Preview** → chạy lại checklist PWA/SW/Safari trên URL preview → mới **Production**. Ghi cách rollback (Vercel "Promote" bản trước) và tag git `v1.0.0`.
- **Rủi ro số 1:** SW cache sai làm người dùng kẹt bản cũ. Test đường cập nhật (bản N → N+1) trên Preview bằng 2 lần deploy liên tiếp trước khi lên Production.

---

## 9. Tài liệu bàn giao
- `README.md`: giới thiệu, cách chạy, scripts, hỗ trợ trình duyệt, **giới hạn đã biết** (Safari không nhớ thư mục).
- `docs/ARCHITECTURE.md`: sơ đồ thư mục, quy tắc phụ thuộc, luồng dữ liệu (chọn thư mục → hàng đợi → engine → UI), mỗi hook/store làm gì (1–2 dòng).
- `docs/TESTING.md`: cách chạy từng loại test, cách mock, bảng coverage, kết quả ma trận thủ công.
- `docs/DEPLOY.md`: các bước deploy, header, rollback, xử lý sự cố SW.
- Mỗi hook/hàm export quan trọng có JSDoc 1–2 dòng (mục đích, tham số, trả về).

---

## 10. Định nghĩa hoàn thành (DoD) — tất cả phải đạt
- [ ] `typecheck`, `lint (0 warning)`, `test`, `build`, `test:e2e` đều **xanh**.
- [ ] Coverage đạt toàn bộ ngưỡng §6.1; mutation score §6.5 đạt.
- [ ] Mọi mục §6.3 (A–N) có test; fixture dữ liệu cũ (§6.3-L) qua.
- [ ] Không còn `any`, không import vòng, không vượt giới hạn §3.3 (hoặc ngoại lệ đã duyệt).
- [ ] Cây thư mục khớp §2 (hoặc lệch có lý do trong plan); quy tắc phụ thuộc §2.1 được ESLint thực thi.
- [ ] Hành vi y hệt bản trước (đối chiếu `BEHAVIOR_CATALOG.md`); định dạng lưu trữ không đổi.
- [ ] Số liệu hiệu năng không tệ hơn `BASELINE.md`; Lighthouse đạt ngưỡng.
- [ ] Checklist thủ công đa trình duyệt hoàn tất; Preview deploy kiểm tra xong; đường cập nhật SW đã kiểm.
- [ ] Tài liệu §9 đầy đủ; `QUESTIONS.md` trống hoặc đã trả lời; `BUGS_FOUND.md` ghi rõ các lỗi đã sửa (nếu có).

## 11. Báo cáo cuối (agent nộp)
Bảng **trước/sau**: số dòng file lớn nhất, số `any`, warning lint, số test, coverage từng vùng, mutation score, bundle size, Lighthouse. Danh sách mục `REFACTOR_PLAN` đã làm/bỏ (kèm lý do), bug phát hiện, rủi ro còn lại, và các việc **chưa làm được** (nói thẳng, không che giấu).

## 12. Gợi ý phân công mô hình (tiết kiệm)
- Khảo sát/viết plan, quyết định kiến trúc: model mạnh.
- Viết test đặc tả, refactor từng mục: model trung.
- Việc cơ học (đổi tên, `git mv`, format, sửa import, viết fixture): model rẻ.
- Review diff độc lập ("có đổi hành vi không?") bởi agent khác, không để agent tự chấm bài mình.
