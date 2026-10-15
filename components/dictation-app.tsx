"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { I18nProvider } from "@/lib/i18n";
import { WelcomeScreen } from "@/components/welcome-screen";
import { Sidebar } from "@/components/sidebar";
import { PlayerCard } from "@/components/player-card";
import { ToolbarCard, PlaybackRate } from "@/components/toolbar-card";
import { TrackHeader } from "@/components/track-header";
import { PermissionBanner } from "@/components/permission-banner";
import { ShortcutsFooter } from "@/components/shortcuts-footer";
import { ResetDialog } from "@/components/reset-dialog";
import { ShortcutsDialog } from "@/components/shortcuts-dialog";

import {
  getStoredSettings,
  saveStoredSettings,
  clearAllStorage,
  DEFAULT_SETTINGS,
} from "@/lib/storage";
import { AudioFile } from "@/lib/file-system";
import {
  getQueueStatus,
  getNextQueueFile,
  getPrevQueueFile,
} from "@/lib/queue";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { useDictationLoop } from "@/hooks/use-dictation-loop";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useFolderLibrary } from "@/hooks/use-folder-library";
import { useAbLoop } from "@/hooks/use-ab-loop";
import { useServiceWorker } from "@/hooks/use-service-worker";
import { UpdateToast } from "@/components/pwa/update-toast";
import { useI18n } from "@/lib/i18n";

function DictationAppInner() {
  const { t } = useI18n();
  const { hasUpdate, applyUpdate, dismissUpdate } = useServiceWorker();

  // 1. Playback & Settings State
  const initialSettings = useMemo(() => getStoredSettings(), []);
  const [playbackRate, setPlaybackRate] = useState<PlaybackRate>(initialSettings.playbackRate);
  const [volume, setVolume] = useState<number>(initialSettings.volume);
  const lastNonZeroVolumeRef = useRef<number>(initialSettings.volume > 0 ? initialSettings.volume : 1);

  const handleVolumeChange = useCallback((newVol: number) => {
    setVolume(newVol);
    if (newVol > 0) {
      lastNonZeroVolumeRef.current = newVol;
    }
    saveStoredSettings({ volume: newVol });
  }, []);

  const handleToggleMute = useCallback(() => {
    setVolume((prev) => {
      let next: number;
      if (prev > 0) {
        lastNonZeroVolumeRef.current = prev;
        next = 0;
      } else {
        next = lastNonZeroVolumeRef.current > 0 ? lastNonZeroVolumeRef.current : 1;
      }
      saveStoredSettings({ volume: next });
      return next;
    });
  }, []);

  const [skipSeconds, setSkipSeconds] = useState<number>(initialSettings.skipSeconds);
  const [repeatCount, setRepeatCount] = useState<number>(initialSettings.repeatCount);
  const [gapSeconds, setGapSeconds] = useState<number>(initialSettings.gapSeconds);
  const [autoNext, setAutoNext] = useState<boolean>(initialSettings.autoNext);

  // 2. Dictation Loop Controller (Repetitions & Gap Countdown)
  const {
    currentRepeat,
    setCurrentRepeat,
    isWaitingGap,
    gapCountdown,
    startGapWait,
    clearGapTimer,
    resetLoop,
  } = useDictationLoop();

  // 2.5 A-B Repeat Loop Controller
  const {
    abLoop,
    isActive: isAbLoopActive,
    setA,
    setB,
    clear: clearAbLoop,
    setExplicit: setExplicitAbLoop,
  } = useAbLoop();

  const handleAbLoopReachedRef = useRef<() => void>(() => {});

  // 3. Folder & Files Management
  const folderLib = useFolderLibrary();
  const {
    fileInputRef,
    hasFolder,
    folderName,
    files,
    filteredFiles,
    currentFileId,
    currentFile,
    isLoading,
    permissionNeeded,
    isSafari,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    listenedCount,
    openFolder,
    handleFileInputChange,
    grantPermission,
    selectFile,
    toggleStar,
    markListened,
    resetLibrary,
  } = folderLib;

  // 4. Sidebar Responsive & Collapse State
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 5. Dialogs State
  const [isResetOpen, setIsResetOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  // 6. Audio Auto-play & File Sync References
  const shouldAutoPlayRef = useRef<boolean>(false);
  const lastLoadedIdRef = useRef<string | null>(null);
  const replayRef = useRef<() => void>(() => {});

  // 6.5. Active Queue Status & Transition Tracking
  const queueStatus = useMemo(() => {
    return getQueueStatus({ queue: filteredFiles, currentFile });
  }, [filteredFiles, currentFile]);

  const prevFilterRef = useRef(filter);
  const prevSearchRef = useRef(searchQuery);
  const filterChangedPendingAdvanceRef = useRef<boolean>(false);

  useEffect(() => {
    const filterChanged =
      prevFilterRef.current !== filter || prevSearchRef.current !== searchQuery;
    prevFilterRef.current = filter;
    prevSearchRef.current = searchQuery;

    if (filterChanged) {
      const isStillInQueue =
        currentFile && filteredFiles.some((f) => f.id === currentFile.id);
      if (!isStillInQueue) {
        filterChangedPendingAdvanceRef.current = true;
      }
    }
  }, [filter, searchQuery, currentFile, filteredFiles]);

  // 7. Navigation & Track Selection Handlers
  const handleSelectFile = useCallback(
    (id: string, autoPlay: boolean = true) => {
      clearGapTimer();
      clearAbLoop();
      filterChangedPendingAdvanceRef.current = false;
      if (id === currentFileId) {
        replayRef.current();
        return;
      }
      resetLoop();
      shouldAutoPlayRef.current = autoPlay;
      selectFile(id);
    },
    [clearGapTimer, clearAbLoop, currentFileId, resetLoop, selectFile]
  );

  const handlePrev = useCallback(() => {
    clearGapTimer();
    filterChangedPendingAdvanceRef.current = false;
    const prev = getPrevQueueFile(filteredFiles, currentFile);
    if (prev) {
      handleSelectFile(prev.id, true);
    }
  }, [clearGapTimer, currentFile, filteredFiles, handleSelectFile]);

  const handleNext = useCallback(() => {
    clearGapTimer();
    const fallbackToFirst =
      filterChangedPendingAdvanceRef.current || !queueStatus.isInQueue;
    filterChangedPendingAdvanceRef.current = false;
    const next = getNextQueueFile(filteredFiles, currentFile, {
      fallbackToFirst,
    });
    if (next) {
      handleSelectFile(next.id, true);
    }
  }, [
    clearGapTimer,
    currentFile,
    filteredFiles,
    handleSelectFile,
    queueStatus.isInQueue,
  ]);

  // 8. Dictation Loop Completion Handler
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

    // Mark file as completed
    markListened(currentFile.id);

    // Auto-advance to next track in queue if enabled
    if (autoNext) {
      let nextFile: AudioFile | null = null;
      if (filterChangedPendingAdvanceRef.current) {
        filterChangedPendingAdvanceRef.current = false;
        nextFile = filteredFiles.length > 0 ? filteredFiles[0] : null;
      } else {
        nextFile = getNextQueueFile(filteredFiles, currentFile);
      }

      if (nextFile) {
        startGapWait(gapSeconds, () => {
          resetLoop();
          shouldAutoPlayRef.current = true;
          selectFile(nextFile.id);
        });
        return;
      }
    }

    // Finished without auto-next or reached end of queue
    resetLoop();
  }, [
    currentFile,
    folderName,
    currentRepeat,
    repeatCount,
    markListened,
    autoNext,
    filteredFiles,
    startGapWait,
    gapSeconds,
    setCurrentRepeat,
    resetLoop,
    selectFile,
  ]);

  // Mark file as completed when listened past 85% of duration
  const handleAudioProgress = useCallback(
    (_percent: number, curTime: number, dur: number) => {
      if (!currentFile || !folderName || currentFile.listened) return;
      if (dur > 0 && curTime / dur >= 0.85) {
        markListened(currentFile.id);
      }
    },
    [currentFile, folderName, markListened]
  );

  // 9. Audio Player Engine
  const {
    waveformContainerRef,
    isPlaying,
    currentTime,
    duration,
    currentTimeFormatted,
    totalTimeFormatted,
    progressPercent,
    isLargeFile,
    hasError,
    loadFile,
    togglePlay,
    play,
    pause,
    resetAudio,
    seek,
    seekToPercent,
    skip,
    replay,
  } = useAudioPlayer({
    playbackRate,
    volume,
    abLoop,
    onEnded: handleAudioEnded,
    onProgress: handleAudioProgress,
    onAbLoopReached: () => handleAbLoopReachedRef.current?.(),
  });

  useEffect(() => {
    replayRef.current = replay;
  }, [replay]);

  // Handle A-B loop reaching point B
  useEffect(() => {
    handleAbLoopReachedRef.current = () => {
      if (abLoop.a === null) return;
      if (gapSeconds > 0) {
        pause();
        startGapWait(gapSeconds, () => {
          seek(abLoop.a!);
          play();
        });
      } else {
        seek(abLoop.a);
      }
    };
  }, [abLoop.a, gapSeconds, pause, play, seek, startGapWait]);

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

  // 10. Playback Actions
  const handleTogglePlay = useCallback(() => {
    clearGapTimer();
    togglePlay();
  }, [clearGapTimer, togglePlay]);

  const handleReplay = useCallback(() => {
    clearGapTimer();
    resetLoop();
    if (isAbLoopActive && abLoop.a !== null) {
      seek(abLoop.a);
      play();
    } else {
      replay();
    }
  }, [clearGapTimer, resetLoop, isAbLoopActive, abLoop.a, seek, play, replay]);

  const handleSetA = useCallback(() => {
    if (!currentFile) return;
    setA(currentTime, duration);
  }, [currentFile, setA, currentTime, duration]);

  const handleSetB = useCallback(() => {
    if (!currentFile) return;
    setB(currentTime, duration);
  }, [currentFile, setB, currentTime, duration]);

  const handleClearAB = useCallback(() => {
    clearAbLoop();
  }, [clearAbLoop]);

  const handleRewind = useCallback(() => {
    clearGapTimer();
    skip(-skipSeconds);
  }, [clearGapTimer, skip, skipSeconds]);

  const handleForward = useCallback(() => {
    clearGapTimer();
    skip(skipSeconds);
  }, [clearGapTimer, skip, skipSeconds]);

  const handleSpeedDown = useCallback(() => {
    const RATES: PlaybackRate[] = [0.5, 0.75, 1, 1.25, 1.5];
    const idx = RATES.indexOf(playbackRate);
    if (idx > 0) {
      const nextRate = RATES[idx - 1];
      setPlaybackRate(nextRate);
      saveStoredSettings({ playbackRate: nextRate });
    }
  }, [playbackRate]);

  const handleSpeedUp = useCallback(() => {
    const RATES: PlaybackRate[] = [0.5, 0.75, 1, 1.25, 1.5];
    const idx = RATES.indexOf(playbackRate);
    if (idx < RATES.length - 1) {
      const nextRate = RATES[idx + 1];
      setPlaybackRate(nextRate);
      saveStoredSettings({ playbackRate: nextRate });
    }
  }, [playbackRate]);

  const handleToggleStarCurrent = useCallback(() => {
    if (currentFile) {
      toggleStar(currentFile.id);
    }
  }, [currentFile, toggleStar]);

  const handleQueueClick = useCallback(() => {
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
      saveStoredSettings({ sidebarCollapsed: false });
    }
  }, [sidebarCollapsed]);

  // 11. Global Keyboard Shortcuts
  useKeyboardShortcuts({
    disabled: isResetOpen || isShortcutsOpen || !hasFolder || files.length === 0,
    onTogglePlay: handleTogglePlay,
    onRewind: handleRewind,
    onForward: handleForward,
    onPrev: handlePrev,
    onNext: handleNext,
    onSpeedDown: handleSpeedDown,
    onSpeedUp: handleSpeedUp,
    onReplay: handleReplay,
    onToggleStar: handleToggleStarCurrent,
    onToggleMute: handleToggleMute,
    onSetA: handleSetA,
    onSetB: handleSetB,
    onClearAB: handleClearAB,
  });

  // 12. Reset Confirmation Flow
  const handleResetConfirm = useCallback(async () => {
    clearGapTimer();
    clearAbLoop();
    resetAudio();
    setIsResetOpen(false);
    lastLoadedIdRef.current = null;

    setPlaybackRate(DEFAULT_SETTINGS.playbackRate);
    setVolume(DEFAULT_SETTINGS.volume);
    setSkipSeconds(DEFAULT_SETTINGS.skipSeconds);
    setRepeatCount(DEFAULT_SETTINGS.repeatCount);
    setGapSeconds(DEFAULT_SETTINGS.gapSeconds);
    setAutoNext(DEFAULT_SETTINGS.autoNext);
    setSidebarCollapsed(false);

    await resetLibrary();
    clearAllStorage();
  }, [clearGapTimer, clearAbLoop, resetAudio, resetLibrary]);

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
          onOpenFolder={openFolder}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          isSafari={isSafari}
          isLoading={isLoading}
        />

        {/* Keyboard Shortcuts Dialog */}
        <ShortcutsDialog
          isOpen={isShortcutsOpen}
          onClose={() => setIsShortcutsOpen(false)}
        />

        {/* PWA Update Toast */}
        <UpdateToast
          isOpen={hasUpdate}
          onApplyUpdate={applyUpdate}
          onDismiss={dismissUpdate}
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

      {/* Sidebar Navigation */}
      <Sidebar
        folderName={folderName}
        totalFiles={files.length}
        listenedCount={listenedCount}
        files={filteredFiles}
        currentFileId={currentFileId}
        onSelectFile={handleSelectFile}
        onToggleStar={toggleStar}
        onChangeFolder={openFolder}
        onReset={() => setIsResetOpen(true)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        filter={filter}
        onFilterChange={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isLoading={isLoading}
        isPlaying={isPlaying}
      />

      {/* Main Player Workspace */}
      <main
        aria-label={t("app.mainPlayerAria")}
        className="flex-[999_1_560px] min-w-0 max-w-[1120px] mx-auto w-full box-border px-6 py-7 md:px-12 md:py-9 flex flex-col gap-5"
      >
        {/* Permission needed banner (for Chrome/Edge reload) */}
        {permissionNeeded && (
          <PermissionBanner
            folderName={folderName}
            onGrant={grantPermission}
          />
        )}

        {/* Current Track Header */}
        <TrackHeader
          currentFile={currentFile}
          queueIndex={queueStatus.current}
          queueTotal={queueStatus.total}
          filter={filter}
          searchQuery={searchQuery}
          onToggleStar={handleToggleStarCurrent}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onQueueClick={handleQueueClick}
        />

        {/* Audio Player Card (WaveSurfer + Transport Controls) */}
        <PlayerCard
          waveformContainerRef={waveformContainerRef}
          isPlaying={isPlaying}
          disabled={!currentFile || (filteredFiles.length === 0 && !isPlaying)}
          onTogglePlay={handleTogglePlay}
          onReplay={handleReplay}
          onPrev={handlePrev}
          onNext={handleNext}
          onRewind={handleRewind}
          onForward={handleForward}
          onSeekPercent={(ratio) => {
            clearGapTimer();
            seekToPercent(ratio);
          }}
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
          abLoop={abLoop}
          onSetA={handleSetA}
          onSetB={handleSetB}
          onClearAB={handleClearAB}
          duration={duration}
          onUpdateAbLoop={setExplicitAbLoop}
          onSeek={(t) => {
            clearGapTimer();
            seek(t);
          }}
        />

        {/* Toolbar Card (Playback Rate, Volume, Skip, Repeat, Gap, Auto-next) */}
        <ToolbarCard
          playbackRate={playbackRate}
          onPlaybackRateChange={(r) => {
            setPlaybackRate(r);
            saveStoredSettings({ playbackRate: r });
          }}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          onToggleMute={handleToggleMute}
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

        {/* Keyboard Shortcuts Footer */}
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

      {/* PWA Update Toast */}
      <UpdateToast
        isOpen={hasUpdate}
        onApplyUpdate={applyUpdate}
        onDismiss={dismissUpdate}
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
