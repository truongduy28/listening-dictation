"use client";

import { useCallback } from "react";
import { AudioFile } from "@/lib/file-system";
import { AbLoop } from "@/lib/abLoop";
import { clearAllStorage } from "@/lib/storage";

export interface DictationActions {
  onTogglePlay: () => void;
  onReplay: () => void;
  onSetA: () => void;
  onSetB: () => void;
  onRewind: () => void;
  onForward: () => void;
  onClearAB: () => void;
  onUpdateAbLoop: (range: AbLoop) => void;
  onToggleStarCurrent: () => void;
}

interface UseDictationActionsOptions {
  currentFile: AudioFile | null;
  skipSeconds: number;
  isAbLoopActive: boolean;
  abLoop: AbLoop;
  player: {
    currentTime: number;
    duration: number;
    togglePlay: () => void;
    replay: () => void;
    seek: (t: number) => void;
    skip: (s: number) => void;
    play: () => void;
    resetAudio: () => void;
  };
  repeatCtrl: {
    clearGapTimer: () => void;
    resetLoop: () => void;
  };
  abLoopCtrl: {
    setA: (time: number, duration: number) => void;
    setB: (time: number, duration: number) => void;
    clear: () => void;
    setExplicit: (range: AbLoop) => void;
  };
  toggleStar: (id: string) => void;
  resetSettings: () => void;
  openSidebar: () => void;
  resetLibrary: () => Promise<void>;
  setIsResetOpen: (open: boolean) => void;
  lastLoadedIdRef: React.MutableRefObject<string | null>;
}

export function useDictationActions({
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
}: UseDictationActionsOptions) {
  const handleTogglePlay = useCallback(() => {
    repeatCtrl.clearGapTimer();
    player.togglePlay();
  }, [repeatCtrl, player]);

  const handleReplay = useCallback(() => {
    repeatCtrl.clearGapTimer();
    repeatCtrl.resetLoop();
    if (isAbLoopActive && abLoop.a !== null) {
      player.seek(abLoop.a);
      player.play();
    } else {
      player.replay();
    }
  }, [repeatCtrl, isAbLoopActive, abLoop.a, player]);

  const handleSetA = useCallback(() => {
    if (currentFile) abLoopCtrl.setA(player.currentTime, player.duration);
  }, [currentFile, abLoopCtrl, player.currentTime, player.duration]);

  const handleSetB = useCallback(() => {
    if (currentFile) abLoopCtrl.setB(player.currentTime, player.duration);
  }, [currentFile, abLoopCtrl, player.currentTime, player.duration]);

  const handleRewind = useCallback(() => {
    repeatCtrl.clearGapTimer();
    player.skip(-skipSeconds);
  }, [repeatCtrl, player, skipSeconds]);

  const handleForward = useCallback(() => {
    repeatCtrl.clearGapTimer();
    player.skip(skipSeconds);
  }, [repeatCtrl, player, skipSeconds]);

  const handleToggleStarCurrent = useCallback(() => {
    if (currentFile) toggleStar(currentFile.id);
  }, [currentFile, toggleStar]);

  const actions: DictationActions = {
    onTogglePlay: handleTogglePlay,
    onReplay: handleReplay,
    onSetA: handleSetA,
    onSetB: handleSetB,
    onRewind: handleRewind,
    onForward: handleForward,
    onClearAB: abLoopCtrl.clear,
    onUpdateAbLoop: abLoopCtrl.setExplicit,
    onToggleStarCurrent: handleToggleStarCurrent,
  };

  const handleResetConfirm = useCallback(async () => {
    repeatCtrl.clearGapTimer();
    abLoopCtrl.clear();
    player.resetAudio();
    setIsResetOpen(false);
    lastLoadedIdRef.current = null;
    resetSettings();
    openSidebar();
    await resetLibrary();
    clearAllStorage();
  }, [repeatCtrl, abLoopCtrl, player, setIsResetOpen, lastLoadedIdRef, resetSettings, openSidebar, resetLibrary]);

  return { actions, handleResetConfirm };
}
