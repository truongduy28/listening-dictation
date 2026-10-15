"use client";

import React, { useState, useEffect, useRef } from "react";
import { I18nProvider } from "@/lib/i18n";
import { DictationWelcomeView } from "@/components/dictation-welcome-view";
import { DictationLayout } from "@/components/dictation-layout";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useFolderLibrary } from "@/hooks/use-folder-library";
import { useAbLoop } from "@/hooks/use-ab-loop";
import { useServiceWorker } from "@/hooks/use-service-worker";
import { usePlayerSettings } from "@/hooks/use-player-settings";
import { usePlaybackQueue } from "@/hooks/use-playback-queue";
import { useRepeatController } from "@/hooks/use-repeat-controller";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import { useDictationActions } from "@/hooks/use-dictation-actions";

function DictationAppInner() {
  const { hasUpdate, applyUpdate, dismissUpdate } = useServiceWorker();
  const settings = usePlayerSettings();
  const {
    playbackRate,
    handleSpeedDown,
    handleSpeedUp,
    handleToggleMute,
    skipSeconds,
    repeatCount,
    gapSeconds,
    autoNext,
    resetSettings,
  } = settings;

  const abLoopCtrl = useAbLoop();
  const { abLoop, isActive: isAbLoopActive, clear: clearAbLoop } = abLoopCtrl;

  const handleAbLoopReachedRef = useRef<() => void>(() => {});
  const replayRef = useRef<() => void>(() => {});

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
    isSafari,
    permissionNeeded,
    grantPermission,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    listenedCount,
    openFolder,
    handleFileInputChange,
    selectFile,
    toggleStar,
    markListened,
    resetLibrary,
  } = folderLib;

  const queue = usePlaybackQueue({
    filteredFiles,
    currentFile,
    currentFileId,
    filter,
    searchQuery,
    selectFile,
    clearGapTimer: () => repeatCtrl.clearGapTimer(),
    clearAbLoop,
    resetLoop: () => repeatCtrl.resetLoop(),
    onReplayCurrent: () => replayRef.current(),
  });

  const repeatCtrl = useRepeatController({
    repeatCount,
    gapSeconds,
    autoNext,
    currentFile,
    folderName,
    filteredFiles,
    consumePendingFilterAdvance: queue.consumePendingFilterAdvance,
    setShouldAutoPlay: queue.setShouldAutoPlay,
    replayRef,
    selectFile,
    markListened,
  });

  const { sidebarCollapsed, handleToggleSidebar, openSidebar } = useSidebarState();

  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const lastLoadedIdRef = useRef<string | null>(null);

  const player = useAudioPlayer({
    playbackRate,
    volume: settings.volume,
    abLoop,
    onEnded: repeatCtrl.handleAudioEnded,
    onProgress: repeatCtrl.handleAudioProgress,
    onAbLoopReached: () => handleAbLoopReachedRef.current?.(),
  });

  useEffect(() => {
    replayRef.current = player.replay;
  }, [player.replay]);

  useEffect(() => {
    handleAbLoopReachedRef.current = () => {
      if (abLoop.a === null) return;
      if (gapSeconds > 0) {
        player.pause();
        repeatCtrl.startGapWait(gapSeconds, () => {
          player.seek(abLoop.a!);
          player.play();
        });
      } else {
        player.seek(abLoop.a);
      }
    };
  }, [abLoop.a, gapSeconds, player, repeatCtrl]);

  useEffect(() => {
    if (currentFile && currentFile.file) {
      if (lastLoadedIdRef.current !== currentFile.id) {
        lastLoadedIdRef.current = currentFile.id;
        const autoPlay = queue.consumeAutoPlay();
        player.loadFile(currentFile.file, autoPlay);
      }
    }
  }, [currentFile, player, queue]);

  const { actions, handleResetConfirm } = useDictationActions({
    currentFile,
    skipSeconds,
    isAbLoopActive,
    abLoop,
    player,
    repeatCtrl,
    abLoopCtrl,
    toggleStar,
    resetSettings,
    openSidebar,
    resetLibrary,
    setIsResetOpen,
    lastLoadedIdRef,
  });

  useKeyboardShortcuts({
    disabled: isResetOpen || isShortcutsOpen || !hasFolder || files.length === 0,
    onTogglePlay: actions.onTogglePlay,
    onRewind: actions.onRewind,
    onForward: actions.onForward,
    onPrev: queue.handlePrev,
    onNext: queue.handleNext,
    onSpeedDown: handleSpeedDown,
    onSpeedUp: handleSpeedUp,
    onReplay: actions.onReplay,
    onToggleStar: actions.onToggleStarCurrent,
    onToggleMute: handleToggleMute,
    onSetA: actions.onSetA,
    onSetB: actions.onSetB,
    onClearAB: clearAbLoop,
  });

  if (!hasFolder) {
    return (
      <DictationWelcomeView
        fileInputRef={fileInputRef}
        handleFileInputChange={handleFileInputChange}
        openFolder={openFolder}
        isSafari={isSafari}
        isLoading={isLoading}
        hasUpdate={hasUpdate}
        applyUpdate={applyUpdate}
        dismissUpdate={dismissUpdate}
      />
    );
  }

  return (
    <DictationLayout
      fileInputRef={fileInputRef}
      handleFileInputChange={handleFileInputChange}
      folderName={folderName}
      totalFiles={files.length}
      listenedCount={listenedCount}
      files={filteredFiles}
      currentFileId={currentFileId}
      currentFile={currentFile}
      isLoading={isLoading}
      permissionNeeded={permissionNeeded}
      grantPermission={grantPermission}
      openFolder={openFolder}
      toggleStar={toggleStar}
      filter={filter}
      onFilterChange={setFilter}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      queueStatus={queue.queueStatus}
      onSelectFile={queue.handleSelectFile}
      onPrev={queue.handlePrev}
      onNext={queue.handleNext}
      player={player}
      settings={settings}
      repeatCtrl={repeatCtrl}
      actions={actions}
      abLoop={abLoop}
      sidebarCollapsed={sidebarCollapsed}
      onToggleSidebar={handleToggleSidebar}
      openSidebar={openSidebar}
      isResetOpen={isResetOpen}
      onOpenReset={() => setIsResetOpen(true)}
      onCloseReset={() => setIsResetOpen(false)}
      onConfirmReset={handleResetConfirm}
      isShortcutsOpen={isShortcutsOpen}
      onOpenShortcuts={() => setIsShortcutsOpen(true)}
      onCloseShortcuts={() => setIsShortcutsOpen(false)}
      hasUpdate={hasUpdate}
      applyUpdate={applyUpdate}
      dismissUpdate={dismissUpdate}
    />
  );
}

export function DictationApp() {
  return (
    <I18nProvider>
      <DictationAppInner />
    </I18nProvider>
  );
}

export default DictationApp;

