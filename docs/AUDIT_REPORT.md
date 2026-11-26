# BÁO CÁO TOÀN DIỆN AUDIT HỆ THỐNG TÀI LIỆU (DOCUMENTATION AUDIT REPORT)

> **Dự án:** Nghe chép — Audio Dictation Player (`listening-dictation-app`)  
> **Thời điểm thực hiện:** 2026-11-14  
> **Kỹ sư phụ trách:** Senior Software Architect, Staff Frontend Engineer & Technical Documentation Engineer  
> **Mục tiêu:** Đánh giá tính chính xác, tính đồng nhất, lấp đầy khoảng trống tri thức và xây dựng Project Knowledge Base (PKB) cho AI & Developer.

---

## 1. Danh Mục Tài Liệu Đã Kiểm Tra & Hành Động Thực Hiện

| Tệp Tài Liệu | Trạng Thái Trước Audit | Hành Động | Lý Do & Phạm Vi Xử Lý |
|---|---|---|---|
| `AGENTS.md` | Chỉ chứa block `nextjs-agent-rules` | **Cập nhật** | Bổ sung hướng dẫn AI Agent đọc PKB, bảo tồn 100% comment block bắt buộc của Next.js |
| `docs/INDEX.md` | Chưa có | **Tạo mới** | Điểm khởi đầu định hướng (Single Entry Point), ma trận tra cứu theo loại task và 8 invariants |
| `docs/ARCHITECTURE.md` | 148 dòng (tổng quan cơ bản) | **Cập nhật & Mở rộng** | Bổ sung chi tiết 5 phân tầng, sơ đồ sequence diagram, sơ đồ data flow, state ownership matrix |
| `docs/BEHAVIOR_CATALOG.md` | 145 dòng (thiếu chi tiết kỹ thuật) | **Cập nhật & Mở rộng** | Ghi nhận chi tiết ground truth, vòng lặp A-B rAF, bộ đếm nghỉ gap, ma trận 13 phím tắt |
| `docs/UI_UX_CATALOG.md` | Chưa có | **Tạo mới** | Tổng hợp UI inventory, design tokens, responsive breakpoints, khác biệt giữa prototype và thực tế |
| `docs/STORAGE.md` | Chưa có | **Tạo mới** | Tài liệu chuyên sâu về IndexedDB (`handles`), LocalStorage (`dictation_*`), File System Access API |
| `docs/TESTING.md` | 93 dòng (sai số liệu và đường dẫn) | **Cập nhật & Sửa lỗi** | Sửa đường dẫn mock (`tests/setup/browser-mocks.ts`), ghi nhận 64 tests, báo cáo đúng lỗi coverage |
| `docs/AI_DEVELOPMENT_WORKFLOW.md` | Chưa có | **Tạo mới** | Hướng dẫn chuẩn hóa quy trình 6 bước phát triển feature cho AI Coding Agent kèm bảng pitfalls |
| `docs/AUDIT_REPORT.md` | Chưa có | **Tạo mới** | Báo cáo chi tiết audit, bảng sai lệch (discrepancies), rủi ro kỹ thuật và khuyến nghị |
| `docs/DEPLOY.md` | 89 dòng | **Giữ nguyên (Keep)** | Tài liệu hướng dẫn deploy Vercel và Service Worker update flow đã chính xác và hoạt động tốt |
| `docs/BASELINE.md` | 48 dòng | **Lưu trữ (Archive/Keep)** | Dữ liệu lịch sử đo lường trước đợt refactor Phase 3 |
| `docs/REFACTOR_PLAN.md` | 92 dòng | **Lưu trữ (Archive/Keep)** | Kế hoạch lịch sử của đợt refactor Phase 3 |
| `README.md` & `README.vi.md` | 187 dòng | **Giữ nguyên (Keep)** | README tổng quan giới thiệu sản phẩm cho người dùng cuối |
| `.spec/*` | Các bản spec và prototype HTML | **Tham chiếu (Reference)** | Lưu giữ làm tài liệu đối chiếu nguồn gốc lịch sử phát triển |

---

## 2. Bảng Tổng Hợp Các Sai Lệch Giữa Đặc Tả, Tài Liệu Cũ & Thực Tế Mã Nguồn (Discrepancies Catalog)

Mọi sai lệch dưới đây đều được chứng minh bằng bằng chứng trực tiếp từ source code hoặc lệnh kiểm tra:

| STT | Vấn Đề (Discrepancy) | Ghi Nhận Trong Tài Liệu Cũ / Spec | Thực Tế Mã Nguồn & Runtime | Bằng Chứng Kỹ Thuật (Evidence) | Phân Loại |
|:---:|---|---|---|---|:---:|
| **1** | **Số lượng Unit Tests** | `README.md` ghi 59 tests trong 15 suites | Hiện tại có **64 tests** trong **17 test suites** | Kết quả lệnh `npm test`: `Test Files 17 passed (17)`, `Tests 64 passed (64)` | **Implemented & Tested** |
| **2** | **Độ phủ kiểm thử (Coverage Thresholds)** | `docs/TESTING.md` cũ ghi 86.03% Statements, 79.88% Branches, 88.28% Functions (ĐẠT) | Lệnh `npm run test:coverage` **BỊ LỖI** do không đạt ngưỡng cấu hình trong `vitest.config.ts`: Statements 77.99% (<80%), Branches 68.67% (<75%), Functions 77.39% (<80%) | Kết quả chạy lệnh `npm run test:coverage` kích hoạt 3 dòng lỗi `ERROR: Coverage does not meet global threshold` | **Known Issue & Technical Debt** |
| **3** | **Đường dẫn Mock trong Test** | `docs/TESTING.md` cũ ghi mock nằm tại `tests/setup.ts` | File `tests/setup.ts` **không tồn tại**; các file mock thật nằm tại `tests/setup/browser-mocks.ts` và `tests/setup/fs-mocks.ts` | Lệnh `ls tests/setup/`: hiển thị `browser-mocks.ts` và `fs-mocks.ts` | **Documentation Error (Fixed)** |
| **4** | **Tính năng Shuffle (Ngẫu nhiên)** | `SPEC_PHASE2.md` §2 và `SPEC_PHASE3.md` đề xuất Shuffle nút tròn 48px, xáo trộn Fisher-Yates | **Không tồn tại trong mã nguồn:** `lib/queue.ts` không có hàm shuffle; `lib/storage.ts` không lưu `shuffle`; UI không có nút shuffle | Lệnh `git grep -i "shuffle"` trong `lib/` và `components/` trả về kết quả rỗng (0 match) | **Specified but Unimplemented** |
| **5** | **Chức năng của phím `M`** | `SPEC_PHASE2.md` gán phím `M` cho Shuffle | Trong thực tế mã nguồn và giao diện, phím `M` là **Toggle Mute** (Tắt/Bật tiếng) | `lib/keyboard.ts` dòng 90: `event.key === 'm' -> return 'toggleMute'`, `ShortcutsDialog.tsx` dòng 48: `Mute / Unmute` | **Implemented & Observed** |
| **6** | **Chế độ Dark Mode** | `DESIGN.md` §89 ghi: *"Không có dark mode, không dùng bản tối"* | **Đã hoàn thiện 100%:** Hỗ trợ dark mode đầy đủ qua CSS variables và hook `useDarkMode` | `app/globals.css` dòng 45-74: `@media (prefers-color-scheme: dark) { ... }`, `hooks/use-dark-mode.ts` | **Implemented & Observed** |
| **7** | **Bộ điều khiển Preview Player trên Welcome Screen** | `DESIGN.md` ngụ ý demo player có thể phát âm thanh | `WelcomePreviewControls` là **mockup minh họa** có thuộc tính `aria-hidden="true"`, không kết nối audio engine thật | `components/welcome/welcome-preview-controls.tsx`: icon tĩnh, không có handler `onClick` kết nối audio | **Implemented & Observed** |
| **8** | **Cảnh báo bảo mật Next.js 16.4** | Chưa được ghi nhận | Khi chạy `npm run build` lần đầu, Next.js 16.4 dừng lại và in cảnh báo bảo mật yêu cầu upgrade | Thông báo build: `Error [SecurityFatalError]: Your version of Next.js is affected by a known security vulnerability. Retry the same command to continue.` | **Observed in Runtime/Build** |
| **9** | **Module Cầu Nối Cũ (Legacy Bridges)** | Chưa được phân tích | `lib/db.ts` không còn được import ở bất kỳ đâu; `lib/file-system.ts` là bridge tương thích ngược cho `lib/fs.ts` | Lệnh `git grep "lib/db"`: 0 kết quả ngoài chính file đó; `lib/file-system.ts` re-export từ `lib/fs.ts` | **Technical Debt** |

---

## 3. Đánh Giá Các Rủi Ro Kỹ Thuật (Technical Risks Analysis)

Dựa trên bằng chứng từ mã nguồn thực tế:

1. **Rủi ro rớt CI do Coverage Thresholds:**
   - *Hiện tượng:* `npm test` thành công 100% (64/64 passed), nhưng nếu CI pipeline cấu hình chạy `npm run test:coverage`, build sẽ bị fail do các ngưỡng trong `vitest.config.ts` (Lines: 80, Statements: 80, Functions: 80, Branches: 75) cao hơn mức đo lường thực tế hiện tại (Statements 77.99%, Branches 68.67%, Functions 77.39%).
   - *Mức độ rủi ro:* **Trung bình - Cao** đối với tự động hóa CI/CD.
2. **Rủi ro vòng đời Object URL (`URL.revokeObjectURL`):**
   - *Hiện tượng:* Trong `hooks/use-audio-element.ts`, Object URL cũ được thu hồi sau `setTimeout(..., 3000)`. Nếu người dùng bấm phím Next/Prev liên tục nhanh hơn 3 giây (spam phím), nhiều timer trễ cùng chạy và có thể phát sinh race condition nếu bộ đệm âm thanh chưa giải mã xong.
   - *Mức độ rủi ro:* **Thấp - Trung bình**.
3. **Giới hạn trình duyệt Safari / iOS:**
   - *Hiện tượng:* Safari không hỗ trợ File System Access API (`showDirectoryPicker`), buộc phải dùng `<input webkitdirectory>`. Quyền truy cập không thể lưu vào IndexedDB nên người dùng phải chọn lại folder khi mở lại trang.
   - *Mức độ rủi ro:* **Đã có thông báo rõ ràng trong UI**, không gây crash.
4. **Cảnh báo bảo mật phiên bản Next.js:**
   - *Hiện tượng:* Phiên bản Next.js 16.4.0 hiện tại có thông báo an ninh từ npm advisory. Lệnh `next build` dừng ở lần chạy đầu tiên để nhắc nhở người dùng nâng cấp.
   - *Mức độ rủi ro:* **Trung bình** (đã có hướng dẫn nâng cấp từ Next.js).

---

## 4. Các Khoảng Trống Tri Thức Đã Được Lấp Đầy (Knowledge Gaps Resolved)

Trước khi thực hiện PKB, AI Coding Agent gặp các trở ngại lớn sau:
- Không biết `AGENTS.md` bắt buộc phải giữ lại comment block `nextjs-agent-rules`. ➔ **Đã làm rõ và bảo tồn nguyên vẹn.**
- Không rõ tính năng Shuffle đã code chưa, dẫn đến nguy cơ AI tự ý bịa thêm mã nguồn hoặc sửa phím `M`. ➔ **Đã chứng minh Shuffle chưa code và phím `M` là Mute.**
- Không biết `components/ui/` đã có các thành phần nào để tái sử dụng. ➔ **Đã xây dựng UI Catalog chi tiết.**
- Không biết file mock nằm ở đâu do `docs/TESTING.md` cũ dẫn sai đường dẫn. ➔ **Đã sửa về đúng `tests/setup/browser-mocks.ts`.**
- Không rõ cấu trúc lưu trữ `IndexedDB` và `LocalStorage`. ➔ **Đã tạo tài liệu chuyên sâu `docs/STORAGE.md`.**

---

## 5. Khuyến Nghị Ưu Tiên Tiếp Theo Cho Đội Ngũ Phát Triển

1. **Bổ sung test cho `use-audio-element.ts` và `use-keyboard-shortcuts.ts`:**
   - Viết thêm mock test các nhánh rẽ để nâng Branches coverage từ 68.67% lên $\ge 75\%$, giúp lệnh `npm run test:coverage` xanh hoàn toàn.
2. **Cân nhắc dọn dẹp file thừa:**
   - `lib/db.ts` hiện không có file nào import; có thể lên kế hoạch xóa trong đợt refactor tương lai.
3. **Kế hoạch nâng cấp Next.js:**
   - Khi có sự đồng ý của Product Owner, chạy lệnh nâng cấp Next.js theo khuyến nghị an ninh của Vercel/Next.js.

