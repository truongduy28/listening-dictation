"use client";

import { useCallback } from "react";
import { AudioFile } from "@/lib/file-system";
import { getNextQueueFile } from "@/lib/queue";
import { useDictationLoop } from "./use-dictation-loop";

interface UseRepeatControllerOptions {
  repeatCount: number;
  gapSeconds: number;
  autoNext: boolean;
  currentFile: AudioFile | null;
  folderName: string;
  filteredFiles: AudioFile[];
  consumePendingFilterAdvance: () => boolean;
  setShouldAutoPlay: (val: boolean) => void;
  replayRef: React.RefObject<() => void>;
  selectFile: (id: string) => void;
  markListened: (id: string) => void;
}

export function useRepeatController({
  repeatCount,
  gapSeconds,
  autoNext,
  currentFile,
  folderName,
  filteredFiles,
  consumePendingFilterAdvance,
  setShouldAutoPlay,
  replayRef,
  selectFile,
  markListened,
}: UseRepeatControllerOptions) {
  const {
    currentRepeat,
    setCurrentRepeat,
    isWaitingGap,
    gapCountdown,
    startGapWait,
    clearGapTimer,
    resetLoop,
  } = useDictationLoop();

  const handleAudioEnded = useCallback(() => {
    if (!currentFile || !folderName) return;

    if (currentRepeat < repeatCount) {
      startGapWait(gapSeconds, () => {
        setCurrentRepeat((prev) => prev + 1);
        replayRef.current?.();
      });
      return;
    }

    markListened(currentFile.id);

    if (autoNext) {
      let nextFile: AudioFile | null = null;
      if (consumePendingFilterAdvance()) {
        nextFile = filteredFiles.length > 0 ? filteredFiles[0] : null;
      } else {
        nextFile = getNextQueueFile(filteredFiles, currentFile);
      }

      if (nextFile) {
        startGapWait(gapSeconds, () => {
          resetLoop();
          setShouldAutoPlay(true);
          selectFile(nextFile.id);
        });
        return;
      }
    }

    resetLoop();
  }, [
    currentFile,
    folderName,
    currentRepeat,
    repeatCount,
    markListened,
    autoNext,
    filteredFiles,
    consumePendingFilterAdvance,
    setShouldAutoPlay,
    startGapWait,
    gapSeconds,
    setCurrentRepeat,
    replayRef,
    resetLoop,
    selectFile,
  ]);

  const handleAudioProgress = useCallback(
    (_percent: number, curTime: number, dur: number) => {
      if (!currentFile || !folderName || currentFile.listened) return;
      if (dur > 0 && curTime / dur >= 0.85) {
        markListened(currentFile.id);
      }
    },
    [currentFile, folderName, markListened]
  );

  return {
    currentRepeat,
    isWaitingGap,
    gapCountdown,
    clearGapTimer,
    resetLoop,
    startGapWait,
    handleAudioEnded,
    handleAudioProgress,
  };
}
