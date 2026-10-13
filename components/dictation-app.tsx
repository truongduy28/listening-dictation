"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { I18nProvider } from "@/lib/i18n";
import { WelcomeScreen } from "@/components/welcome-screen";
import { Sidebar, FilterType } from "@/components/sidebar";
import { PlayerCard } from "@/components/player-card";
import { ToolbarCard, PlaybackRate } from "@/components/toolbar-card";
import { TrackHeader } from "@/components/track-header";
import { PermissionBanner } from "@/components/permission-banner";
import { ShortcutsFooter } from "@/components/shortcuts-footer";
import { ResetDialog } from "@/components/reset-dialog";
import { ShortcutsDialog } from "@/components/shortcuts-dialog";
import {
  AudioFile,
  readFilesFromDirectoryHandle,
  readFilesFromInput,
} from "@/lib/file-system";
import {
  saveFolderHandle,
  getFolderHandle,
  clearFolderHandle,
} from "@/lib/db";
import {
  getStoredSettings,
  saveStoredSettings,
  getStoredSession,
  saveStoredSession,
  getStoredMarks,
  saveMark,
  clearAllStorage,
  DEFAULT_SETTINGS,
} from "@/lib/storage";
import { useAudioPlayer } from "@/hooks/use-audio-player";

function DictationAppInner() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // App & Folder State
  const [hasFolder, setHasFolder] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>("");
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [permissionNeeded, setPermissionNeeded] = useState<boolean>(false);
  const pendingHandleRef = useRef<FileSystemDirectoryHandle | null>(null);

  // Playback & Settings State
  const initialSettings = useMemo(() => getStoredSettings(), []);
  const [playbackRate, setPlaybackRate] = useState<PlaybackRate>(initialSettings.playbackRate);
  const [volume, setVolume] = useState<number>(initialSettings.volume);
  const [skipSeconds, setSkipSeconds] = useState<number>(initialSettings.skipSeconds);
  const [repeatCount, setRepeatCount] = useState<number>(initialSettings.repeatCount);
  const [gapSeconds, setGapSeconds] = useState<number>(initialSettings.gapSeconds);
  const [autoNext, setAutoNext] = useState<boolean>(initialSettings.autoNext);

  // Dictation Loop State
  const [currentRepeat, setCurrentRepeat] = useState<number>(1);
  const [isWaitingGap, setIsWaitingGap] = useState<boolean>(false);
  const [gapCountdown, setGapCountdown] = useState<number>(0);
  const gapTimerRef = useRef<NodeJS.Timeout | null>(null);
  const shouldAutoPlayRef = useRef<boolean>(false);
  const lastLoadedIdRef = useRef<string | null>(null);

  // Clear any active gap countdown
  const clearGapTimer = useCallback(() => {
    if (gapTimerRef.current) {
      clearInterval(gapTimerRef.current);
      gapTimerRef.current = null;
    }
    setIsWaitingGap(false);
    setGapCountdown(0);
  }, []);

  useEffect(() => {
    return () => {
      if (gapTimerRef.current) {
        clearInterval(gapTimerRef.current);
      }
    };
  }, []);

  // Start gap countdown timer before repeat or auto-next
  const startGapWait = useCallback(
    (seconds: number, onComplete: () => void) => {
      clearGapTimer();
      if (seconds <= 0) {
        onComplete();
        return;
      }
      setIsWaitingGap(true);
      setGapCountdown(seconds);

      let remaining = seconds;
      const intervalId = setInterval(() => {
        remaining -= 1;
        if (remaining > 0) {
          setGapCountdown(remaining);
        } else {
          clearInterval(intervalId);
          gapTimerRef.current = null;
          setIsWaitingGap(false);
          setGapCountdown(0);
          onComplete();
        }
      }, 1000);

      gapTimerRef.current = intervalId;
    },
    [clearGapTimer]
  );

  // Sidebar & Filter State
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 768) return true;
      return initialSettings.sidebarCollapsed;
    }
    return false;
  });

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      saveStoredSettings({ sidebarCollapsed: next });
      return next;
    });
  }, []);

  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Dialogs State
  const [isResetOpen, setIsResetOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isSafari] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return !("showDirectoryPicker" in window);
    }
    return false;
  });

  // Current playing file reference
  const currentFile = useMemo(() => {
    return files.find((f) => f.id === currentFileId) || files[0] || null;
  }, [files, currentFileId]);

  // Audio Player Hook
  const replayRef = useRef<() => void>(() => {});

  const handleAudioEnded = useCallback(() => {
    if (!currentFile || !folderName) return;

    // Check if repeatCount is reached for the current file
    if (currentRepeat < repeatCount) {
      startGapWait(gapSeconds, () => {
        setCurrentRepeat((prev) => prev + 1);
        replayRef.current();
      });
      return;
    }

    // Finished all repeats for current file:
    // 1. Mark file as listened
    saveMark(folderName, currentFile.name, { listened: true });
    setFiles((prev) =>
      prev.map((f) => (f.id === currentFile.id ? { ...f, listened: true } : f))
    );

    // 2. Check autoNext
    if (autoNext) {
      const currentIndex = files.findIndex((f) => f.id === currentFile.id);
      if (currentIndex >= 0 && currentIndex < files.length - 1) {
        const nextFile = files[currentIndex + 1];
        startGapWait(gapSeconds, () => {
          setCurrentRepeat(1);
          shouldAutoPlayRef.current = true;
          setCurrentFileId(nextFile.id);
          saveStoredSession({ folderName, lastFile: nextFile.name });
        });
        return;
      }
    }

    // Not auto-next or reached end of list
    setCurrentRepeat(1);
  }, [
    currentFile,
    folderName,
    currentRepeat,
    repeatCount,
    gapSeconds,
    autoNext,
    files,
    startGapWait,
  ]);

  const handleAudioProgress = useCallback(
    (_percent: number, curTime: number, dur: number) => {
      if (!currentFile || !folderName || currentFile.listened) return;
      if (dur > 0 && curTime / dur >= 0.85) {
        saveMark(folderName, currentFile.name, { listened: true });
        setFiles((prev) =>
          prev.map((f) => (f.id === currentFile.id ? { ...f, listened: true } : f))
        );
      }
    },
    [currentFile, folderName]
  );

  const {
    waveformContainerRef,
    isPlaying,
    currentTimeFormatted,
    totalTimeFormatted,
    progressPercent,
    isLargeFile,
    hasError,
    loadFile,
    togglePlay,
    seekToPercent,
    skip,
    replay,
    pause,
  } = useAudioPlayer({
    playbackRate,
    volume,
    onEnded: handleAudioEnded,
    onProgress: handleAudioProgress,
  });

  useEffect(() => {
    replayRef.current = replay;
  }, [replay]);

  // Load audio file whenever currentFile changes
  useEffect(() => {
    if (currentFile && currentFile.file) {
      if (lastLoadedIdRef.current !== currentFile.id) {
        lastLoadedIdRef.current = currentFile.id;
        const autoPlay = shouldAutoPlayRef.current;
        shouldAutoPlayRef.current = false;
        loadFile(currentFile.file, autoPlay);
      }
    }
  }, [currentFile, loadFile]);

  // Apply stored marks to raw files
  const applyMarksToFiles = useCallback((rawFiles: AudioFile[], targetFolderName: string) => {
    const allMarks = getStoredMarks();
    const folderMarks = allMarks[targetFolderName] || {};

    return rawFiles.map((f) => {
      const mark = folderMarks[f.name];
      return {
        ...f,
        listened: mark?.listened ?? false,
        starred: mark?.star ?? false,
      };
    });
  }, []);

  // Process and load audio files
  const processLoadedFiles = useCallback(
    (name: string, rawFiles: AudioFile[]) => {
      if (rawFiles.length === 0) {
        setFolderName(name);
        setFiles([]);
        setCurrentFileId(null);
        setHasFolder(true);
        return;
      }

      const filesWithMarks = applyMarksToFiles(rawFiles, name);
      const session = getStoredSession();

      let targetFileId = filesWithMarks[0].id;
      if (session && session.folderName === name && session.lastFile) {
        const found = filesWithMarks.find((f) => f.name === session.lastFile);
        if (found) {
          targetFileId = found.id;
        }
      }

      setFolderName(name);
      setFiles(filesWithMarks);
      lastLoadedIdRef.current = null;
      shouldAutoPlayRef.current = false;
      clearGapTimer();
      setCurrentFileId(targetFileId);
      setCurrentRepeat(1);
      setHasFolder(true);
      setPermissionNeeded(false);

      const selectedFile = filesWithMarks.find((f) => f.id === targetFileId);
      if (selectedFile) {
        saveStoredSession({ folderName: name, lastFile: selectedFile.name });
      }
    },
    [applyMarksToFiles, clearGapTimer]
  );

  // Auto-restore previous folder handle on mount (Chrome/Edge)
  useEffect(() => {
    async function restoreSession() {
      if (!("showDirectoryPicker" in window)) {
        return;
      }

      try {
        const handle = await getFolderHandle();
        if (!handle) return;

        // @ts-expect-error queryPermission exists on FileSystemDirectoryHandle
        const perm = await handle.queryPermission({ mode: "read" });
        if (perm === "granted") {
          setIsLoading(true);
          const { folderName: name, files: scannedFiles } =
            await readFilesFromDirectoryHandle(handle);
          processLoadedFiles(name, scannedFiles);
          setIsLoading(false);
        } else {
          pendingHandleRef.current = handle;
          setFolderName(handle.name);
          setPermissionNeeded(true);
          setHasFolder(true);
        }
      } catch (err) {
        console.warn("Failed to auto-restore folder session:", err);
      }
    }

    restoreSession();
  }, [processLoadedFiles]);

  // Screen resize listener for responsive collapse
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Request permission if prompted on reopen
  const handleGrantPermission = async () => {
    const handle = pendingHandleRef.current;
    if (!handle) return;
    try {
      setIsLoading(true);
      // @ts-expect-error requestPermission exists on FileSystemDirectoryHandle
      const perm = await handle.requestPermission({ mode: "read" });
      if (perm === "granted") {
        const { folderName: name, files: scannedFiles } =
          await readFilesFromDirectoryHandle(handle);
        processLoadedFiles(name, scannedFiles);
      }
    } catch (err) {
      console.warn("Permission grant failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Folder Pick Handler
  const handleOpenFolder = async () => {
    if ("showDirectoryPicker" in window) {
      try {
        // @ts-expect-error showDirectoryPicker is global on window
        const handle: FileSystemDirectoryHandle = await window.showDirectoryPicker();
        setIsLoading(true);
        await saveFolderHandle(handle);
        const { folderName: name, files: scannedFiles } =
          await readFilesFromDirectoryHandle(handle);
        processLoadedFiles(name, scannedFiles);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        console.error("Error opening directory picker:", err);
      } finally {
        setIsLoading(false);
      }
    } else {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  // Fallback Input Change Handler (Safari)
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setIsLoading(true);
    try {
      const { folderName: name, files: scannedFiles } = readFilesFromInput(fileList);
      processLoadedFiles(name, scannedFiles);
    } catch (err) {
      console.error("Error processing input files:", err);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Filtered files list
  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      if (filter === "unheard" && f.listened) return false;
      if (filter === "listened" && !f.listened) return false;
      if (filter === "starred" && !f.starred) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return f.name.toLowerCase().includes(q) || String(f.index).includes(q);
      }
      return true;
    });
  }, [files, filter, searchQuery]);

  const listenedCount = useMemo(() => {
    return files.filter((f) => f.listened).length;
  }, [files]);

  // Actions
  const handleSelectFile = useCallback(
    (id: string, autoPlay: boolean = true) => {
      clearGapTimer();
      if (id === currentFileId) {
        replay();
        return;
      }
      setCurrentRepeat(1);
      shouldAutoPlayRef.current = autoPlay;
      setCurrentFileId(id);
      const target = files.find((f) => f.id === id);
      if (target && folderName) {
        saveStoredSession({ folderName, lastFile: target.name });
      }
    },
    [clearGapTimer, currentFileId, replay, files, folderName]
  );

  const handleToggleStar = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const newStarred = !f.starred;
          if (folderName) {
            saveMark(folderName, f.name, { star: newStarred });
          }
          return { ...f, starred: newStarred };
        }
        return f;
      })
    );
  };

  const handlePrev = useCallback(() => {
    clearGapTimer();
    if (!currentFile) return;
    const currentIndex = files.findIndex((f) => f.id === currentFile.id);
    if (currentIndex > 0) {
      handleSelectFile(files[currentIndex - 1].id, isPlaying);
    }
  }, [clearGapTimer, currentFile, files, handleSelectFile, isPlaying]);

  const handleNext = useCallback(() => {
    clearGapTimer();
    if (!currentFile) return;
    const currentIndex = files.findIndex((f) => f.id === currentFile.id);
    if (currentIndex < files.length - 1) {
      handleSelectFile(files[currentIndex + 1].id, isPlaying);
    }
  }, [clearGapTimer, currentFile, files, handleSelectFile, isPlaying]);

  const handleTogglePlay = useCallback(() => {
    clearGapTimer();
    togglePlay();
  }, [clearGapTimer, togglePlay]);

  const handleReplay = useCallback(() => {
    clearGapTimer();
    setCurrentRepeat(1);
    replay();
  }, [clearGapTimer, replay]);

  const handleRewind = useCallback(() => {
    clearGapTimer();
    skip(-skipSeconds);
  }, [clearGapTimer, skip, skipSeconds]);

  const handleForward = useCallback(() => {
    clearGapTimer();
    skip(skipSeconds);
  }, [clearGapTimer, skip, skipSeconds]);

  const handleSeekPercent = useCallback(
    (ratio: number) => {
      clearGapTimer();
      seekToPercent(ratio);
    },
    [clearGapTimer, seekToPercent]
  );

  const handleResetConfirm = async () => {
    clearGapTimer();
    pause();
    setIsResetOpen(false);
    setHasFolder(false);
    setFolderName("");
    setFiles([]);
    setCurrentFileId(null);
    lastLoadedIdRef.current = null;
    setPermissionNeeded(false);
    pendingHandleRef.current = null;

    setPlaybackRate(DEFAULT_SETTINGS.playbackRate);
    setVolume(DEFAULT_SETTINGS.volume);
    setSkipSeconds(DEFAULT_SETTINGS.skipSeconds);
    setRepeatCount(DEFAULT_SETTINGS.repeatCount);
    setGapSeconds(DEFAULT_SETTINGS.gapSeconds);
    setAutoNext(DEFAULT_SETTINGS.autoNext);
    setSidebarCollapsed(false);
    setFilter("all");
    setSearchQuery("");

    await clearFolderHandle();
    clearAllStorage();
  };

  // Keyboard Shortcuts System
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Disabled if dialog is open
      if (isResetOpen || isShortcutsOpen) return;

      // Disabled if focusing any input, textarea, select, or contenteditable
      const active = document.activeElement;
      if (
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.tagName === "SELECT" ||
          (active as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if (!hasFolder || files.length === 0) return;

      // Space: Play / Pause
      if (e.code === "Space") {
        e.preventDefault();
        handleTogglePlay();
        return;
      }

      // Left Arrow: Tua lui skipSeconds
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleRewind();
        return;
      }

      // Right Arrow: Tua toi skipSeconds
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleForward();
        return;
      }

      // Up Arrow: File truoc
      if (e.key === "ArrowUp") {
        e.preventDefault();
        handlePrev();
        return;
      }

      // Down Arrow: File sau
      if (e.key === "ArrowDown") {
        e.preventDefault();
        handleNext();
        return;
      }

      // [ : Giam toc do
      if (e.key === "[") {
        e.preventDefault();
        const RATES: PlaybackRate[] = [0.5, 0.75, 1, 1.25, 1.5];
        const idx = RATES.indexOf(playbackRate);
        if (idx > 0) {
          const nextRate = RATES[idx - 1];
          setPlaybackRate(nextRate);
          saveStoredSettings({ playbackRate: nextRate });
        }
        return;
      }

      // ] : Tang toc do
      if (e.key === "]") {
        e.preventDefault();
        const RATES: PlaybackRate[] = [0.5, 0.75, 1, 1.25, 1.5];
        const idx = RATES.indexOf(playbackRate);
        if (idx < RATES.length - 1) {
          const nextRate = RATES[idx + 1];
          setPlaybackRate(nextRate);
          saveStoredSettings({ playbackRate: nextRate });
        }
        return;
      }

      // R : Phat lai tu dau
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        handleReplay();
        return;
      }
    },
    [
      isResetOpen,
      isShortcutsOpen,
      hasFolder,
      files.length,
      handleTogglePlay,
      handleRewind,
      handleForward,
      handlePrev,
      handleNext,
      playbackRate,
      handleReplay,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // If user hasn't selected a folder, show Welcome Screen
  if (!hasFolder) {
    return (
      <>
        {/* Hidden Safari file input */}
        <input
          ref={fileInputRef}
          type="file"
          // @ts-expect-error webkitdirectory is standard for folder inputs
          webkitdirectory=""
          directory=""
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />

        <WelcomeScreen
          onOpenFolder={handleOpenFolder}
          isSafari={isSafari}
          isLoading={isLoading}
        />
      </>
    );
  }

  return (
    <div className="w-full min-h-screen box-border flex bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Hidden Safari file input */}
      <input
        ref={fileInputRef}
        type="file"
        // @ts-expect-error webkitdirectory is standard for folder inputs
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Sidebar (Desktop 320px / Collapsed 72px) */}
      <Sidebar
        folderName={folderName}
        totalFiles={files.length}
        listenedCount={listenedCount}
        files={filteredFiles}
        currentFileId={currentFileId}
        onSelectFile={handleSelectFile}
        onToggleStar={handleToggleStar}
        onChangeFolder={handleOpenFolder}
        onReset={() => setIsResetOpen(true)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        filter={filter}
        onFilterChange={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isLoading={isLoading}
      />

      {/* Main Content Area */}
      <main className="flex-[999_1_560px] min-w-0 max-w-[1120px] mx-auto w-full box-border px-6 py-7 md:px-12 md:py-9 flex flex-col gap-5">
        {/* Permission needed banner (for Chrome re-opening) */}
        {permissionNeeded && (
          <PermissionBanner
            folderName={folderName}
            onGrant={handleGrantPermission}
          />
        )}

        {/* Track Header */}
        <TrackHeader
          currentFile={currentFile}
          totalFiles={files.length}
          onToggleStar={() => currentFile && handleToggleStar(currentFile.id)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />

        {/* Player Card (WaveSurfer Waveform + Real Audio Controls) */}
        <PlayerCard
          waveformContainerRef={waveformContainerRef}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onReplay={handleReplay}
          onPrev={handlePrev}
          onNext={handleNext}
          onRewind={handleRewind}
          onForward={handleForward}
          onSeekPercent={handleSeekPercent}
          skipSeconds={skipSeconds}
          currentTimeFormatted={currentTimeFormatted}
          totalTimeFormatted={totalTimeFormatted}
          progressPercent={progressPercent}
          currentRepeat={currentRepeat}
          repeatCount={repeatCount}
          gapSeconds={gapSeconds}
          autoNext={autoNext}
          isWaitingGap={isWaitingGap}
          gapCountdown={gapCountdown}
          isLargeFile={isLargeFile}
          hasError={hasError}
        />

        {/* Toolbar Card (Speed, Volume, Seek, Repeat, Gap, Auto-next) */}
        <ToolbarCard
          playbackRate={playbackRate}
          onPlaybackRateChange={(r) => {
            setPlaybackRate(r);
            saveStoredSettings({ playbackRate: r });
          }}
          volume={volume}
          onVolumeChange={(v) => {
            setVolume(v);
            saveStoredSettings({ volume: v });
          }}
          skipSeconds={skipSeconds}
          onSkipSecondsChange={(s) => {
            setSkipSeconds(s);
            saveStoredSettings({ skipSeconds: s });
          }}
          repeatCount={repeatCount}
          onRepeatCountChange={(rc) => {
            setRepeatCount(rc);
            saveStoredSettings({ repeatCount: rc });
          }}
          gapSeconds={gapSeconds}
          onGapSecondsChange={(g) => {
            setGapSeconds(g);
            saveStoredSettings({ gapSeconds: g });
          }}
          autoNext={autoNext}
          onAutoNextChange={(an) => {
            setAutoNext(an);
            saveStoredSettings({ autoNext: an });
          }}
        />

        {/* Shortcuts Footer Hints */}
        <ShortcutsFooter />
      </main>

      {/* Confirmation Dialogs */}
      <ResetDialog
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        onConfirm={handleResetConfirm}
      />

      <ShortcutsDialog
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

export default function DictationApp() {
  return (
    <I18nProvider>
      <DictationAppInner />
    </I18nProvider>
  );
}
