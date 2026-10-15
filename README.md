# Nghe chép — Audio Dictation Player 🎧

<p align="center">
  <strong>"Nghe từng câu. Chép từng chữ."</strong><br>
  <em>The dedicated, privacy-first audio player built for intentional listening & dictation practice (ETS TOEIC, IELTS, TOEFL, Podcasts).</em>
</p>

<p align="center">
  <a href="./README.vi.md">🇻🇳 Tiếng Việt</a> •
  <a href="./README.md">🇺🇸 English</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" />
  <img src="https://img.shields.io/badge/Next.js-16.4-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.3-61dafb?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vitest-59%2F59%20Passed-6e9f18?logo=vitest" alt="Vitest Tests" />
  <img src="https://img.shields.io/badge/Coverage-89.2%25-brightgreen" alt="Coverage" />
  <img src="https://img.shields.io/badge/PWA-100%25%20Offline%20Ready-orange" alt="PWA Ready" />
</p>

---

## 📽️ Video Intro & Interactive Motion Demo

**Nghe chép** includes a built-in, standalone **Motion Graphics Intro Studio** recreating the app's real interface (Apple-style Dark Mode, 5-bar Waveform Logo, Real Player Card, A-B Region Overlay) and exports directly to 1080p HD video (`.webm` / `.mp4`).

- **Live Demo: 
- **Scenes in the Demo**:
  - **Scene 1**: Welcome Screen with title *"Nghe từng câu. Chép từng chữ."* & floating feature chips.
  - **Scene 2**: Real Workspace layout showing Sidebar with natural numerical sorting (`01, 02... 100`) and Filter tabs (*All / Unheard / Starred*).
  - **Scene 3**: Smart Audio Looping with live circular Gap Countdown timer (*"Nghỉ 3s · Chuẩn bị lặp 2/3"*).
  - **Scene 4**: Visual A–B Looping on WaveSurfer waveform with draggable handles and tinted highlight region.
  - **Scene 5**: Hands-on-keyboard shortcuts matrix (`Space`, `← / →`, `↑ / ↓`, `[ / ]`, `R`, `A / B / X`).
  - **Scene 6**: Outro & CTA with one-click **"Xuất Video HD"** button (powered by `MediaRecorder` & Web Audio synthesizer).

---

## 🌟 Why Nghe chép?

Standard media players (Spotify, VLC, QuickTime) are built for continuous, passive listening. When practicing **audio dictation** (such as ETS TOEIC Part 1, 2, 3, 4, or IELTS listening), listeners constantly reach for their mouse to pause, rewind a few seconds, and play again.

**Nghe chép solves this fundamentally:**
1. **Writing Gap Timer:** Automatically pauses between repeats (`0` to `30s`) so you have time to write down what you heard before the sentence replays.
2. **Visual A–B Looping:** Drag markers directly on the waveform to isolate and loop fast, connected speech.
3. **Hands Stay on Keyboard:** Complete keyboard navigation for all audio operations without lifting your hands.
4. **100% Private & Client-side:** Audio files are read directly from your local filesystem and never uploaded to any server. Works completely offline.

---

## ✨ Features Breakdown

### 1. 🔁 Smart Dictation Loop & Gap Interval
- **Repeat $N$ Times:** Configure repeat count freely from `1` to `99`.
- **Writing Gap ($X$ Seconds):** Visual countdown timer (`0` to `30s`) creates breathing room between repeats for transcription.
- **Auto-Advance:** Automatically moves to the next sentence once repeat iterations finish.
- **Auto-Completion:** Automatically marks a track as listened (`listened: true`) once you listen past **85%** of its duration.

### 2. 🎚️ WaveSurfer Waveform & Precision A–B Loop
- **Interactive Waveform:** Click anywhere on the wave to seek instantly.
- **Draggable A–B Region:** Highlight and loop tough phrases with draggable `[A]` and `[B]` handles and semi-transparent blue overlay.
- **Pitch Preservation:** Speed controls (`0.5x`, `0.75x`, `1.0x`, `1.25x`, `1.5x`) preserve native vocal pitch without distortion (`preservesPitch`).
- **Large File Optimization:** Automatically falls back to a lightweight seekbar for audio files > 20MB to prevent memory exhaustion.

### 3. 📂 Folder Library & Natural Numerical Sorting
- **Supported Audio Formats:** `.mp3`, `.m4a`, `.wav`, `.aac`, `.flac`, `.ogg`, `.webm`.
- **Natural Sorting:** Accurately sorts files by numbers (`1, 2, ... 9, 10, 11... 100`) rather than standard string sorting (`1, 10, 100, 2`).
- **Filters & Search:** Quick-toggle between **All**, **Unheard**, and **Starred** tracks, with instant title search.
- **Auto-Scroll:** Automatically scrolls the playlist to center on the active track when changing songs or refreshing.

### 4. ⌨️ Comprehensive Keyboard Shortcuts

| Key | Action | Description |
|---|---|---|
| `Space` | **Play / Pause** | Toggles audio playback (prevents page scrolling) |
| `←` / `→` | **Rewind / Fast Forward** | Skips by custom step (`3s`, `5s`, `10s`) |
| `↑` / `↓` | **Previous / Next Track** | Advances through playlist |
| `[` / `]` | **Speed Down / Up** | Cycles between `0.5x`, `0.75x`, `1.0x`, `1.25x`, `1.5x` |
| `R` | **Replay** | Restarts track from 0:00 (or Marker A if A–B active) |
| `A` / `B` | **Set Marker A / B** | Sets start / end timestamp for precision loop |
| `X` | **Clear A–B Loop** | Clears loop region |
| `M` | **Toggle Star** | Stars or unstars active track for review |

*Shortcuts safely suppress when focusing text input fields or when dialogs are open.*

### 5. 📱 PWA & 100% Offline Operation
- **Installable Standalone App:** Add to macOS Dock, Windows Taskbar, or mobile home screen.
- **Offline Shell:** Caches application shell via Service Worker; opens instantly without network connection.
- **Zero Audio Caching:** Audio files stream purely from disk memory and are never stored in browser Cache Storage.
- **Update Notifications:** Toast prompts when an update is available with a one-click reload button.

---

## 🛠️ Architecture & Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Static Export `output: 'export'`)
- **UI & Styling:** [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), Lucide Icons
- **Audio Engine:** [WaveSurfer.js v8](https://wavesurfer.xyz/), HTML5 Media Element, Web Audio API
- **Local Storage:** File System Access API, IndexedDB, LocalStorage
- **Testing:** [Vitest](https://vitest.dev/), React Testing Library, JSDOM, v8 Coverage
- **Modular Quality:** Max 250 lines per file across the entire codebase; clean unidirectional dependency layers.

---

## 🚀 Getting Started

### Prerequisites
- Node.js `20.x` or `22.x`
- Recommended Browsers: **Google Chrome** or **Microsoft Edge** (for File System Access API support).

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/your-username/listening-dictation-app.git
cd listening-dictation-app

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

```bash
# Run unit & integration tests (59 tests across 15 suites)
npm test

# Run tests with code coverage report (target >= 85%)
npm run test:coverage

# TypeScript static type check (0 errors)
npm run typecheck

# ESLint lint check (0 errors, 0 warnings)
npm run lint

# Build production static export (outputs to out/)
npm run build
```

---

## 🌐 Deploy to Vercel (Static Export)

The app is pre-configured for static deployment on Vercel:

```bash
npx vercel
```

- **Framework Preset:** `Next.js`
- **Build Command:** `npm run build`
- **Output Directory:** *Default (Do NOT override or set to `out` — Vercel automatically detects Next.js `output: 'export'`)*
- **Environment Variables:** *None required (100% client-side privacy)*

Includes [`vercel.json`](./vercel.json) with Service Worker no-cache headers, 1-year immutable caching for static assets, and strict CSP headers.

---

## 📖 Detailed Documentation

- [Architecture Guide (`docs/ARCHITECTURE.md`)](./docs/ARCHITECTURE.md)
- [Testing Guide (`docs/TESTING.md`)](./docs/TESTING.md)
- [Deployment Guide (`docs/DEPLOY.md`)](./docs/DEPLOY.md)
- [Refactor Plan (`docs/REFACTOR_PLAN.md`)](./docs/REFACTOR_PLAN.md)
- [Behavior Catalog (`docs/BEHAVIOR_CATALOG.md`)](./docs/BEHAVIOR_CATALOG.md)

---

## ⚠️ Browser Compatibility

- **Chrome / Edge / Chromium (Recommended):** Full support for directory handle persistence via File System Access API. Click "Grant Permission" on return to resume listening.
- **Safari (macOS / iOS):** Uses standard fallback `<input webkitdirectory>`. Due to WebKit limitations, folder handles cannot be persisted across app closures, requiring re-selecting the folder when reopened. All progress and settings remain saved.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.
