"use client";

import { useMemo, useRef, useEffect, useCallback } from "react";
import { AudioFile } from "@/lib/file-system";
import { FilterType, getQueueStatus, getNextQueueFile, getPrevQueueFile } from "@/lib/queue";

interface UsePlaybackQueueOptions {
  filteredFiles: AudioFile[];
  currentFile: AudioFile | null;
  currentFileId: string | null;
  filter: FilterType;
  searchQuery: string;
  selectFile: (id: string) => void;
  clearGapTimer: () => void;
  clearAbLoop: () => void;
  resetLoop: () => void;
  onReplayCurrent: () => void;
}

export function usePlaybackQueue({
  filteredFiles,
  currentFile,
  currentFileId,
  filter,
  searchQuery,
  selectFile,
  clearGapTimer,
  clearAbLoop,
  resetLoop,
  onReplayCurrent,
}: UsePlaybackQueueOptions) {
  const shouldAutoPlayRef = useRef(false);
  const filterChangedPendingAdvanceRef = useRef(false);
  const prevFilterRef = useRef(filter);
  const prevSearchRef = useRef(searchQuery);

  const queueStatus = useMemo(
    () => getQueueStatus({ queue: filteredFiles, currentFile }),
    [filteredFiles, currentFile]
  );

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

  const handleSelectFile = useCallback(
    (id: string, autoPlay: boolean = true) => {
      clearGapTimer();
      clearAbLoop();
      filterChangedPendingAdvanceRef.current = false;
      if (id === currentFileId) {
        onReplayCurrent();
        return;
      }
      resetLoop();
      shouldAutoPlayRef.current = autoPlay;
      selectFile(id);
    },
    [clearGapTimer, clearAbLoop, currentFileId, onReplayCurrent, resetLoop, selectFile]
  );

  const handlePrev = useCallback(() => {
    clearGapTimer();
    filterChangedPendingAdvanceRef.current = false;
    const prev = getPrevQueueFile(filteredFiles, currentFile);
    if (prev) handleSelectFile(prev.id, true);
  }, [clearGapTimer, currentFile, filteredFiles, handleSelectFile]);

  const handleNext = useCallback(() => {
    clearGapTimer();
    const fallbackToFirst =
      filterChangedPendingAdvanceRef.current || !queueStatus.isInQueue;
    filterChangedPendingAdvanceRef.current = false;
    const next = getNextQueueFile(filteredFiles, currentFile, { fallbackToFirst });
    if (next) handleSelectFile(next.id, true);
  }, [clearGapTimer, currentFile, filteredFiles, handleSelectFile, queueStatus.isInQueue]);

  const consumeAutoPlay = useCallback(() => {
    const val = shouldAutoPlayRef.current;
    shouldAutoPlayRef.current = false;
    return val;
  }, []);

  const setShouldAutoPlay = useCallback((val: boolean) => {
    shouldAutoPlayRef.current = val;
  }, []);

  const consumePendingFilterAdvance = useCallback(() => {
    const pending = filterChangedPendingAdvanceRef.current;
    filterChangedPendingAdvanceRef.current = false;
    return pending;
  }, []);

  return {
    queueStatus,
    consumeAutoPlay,
    setShouldAutoPlay,
    consumePendingFilterAdvance,
    handleSelectFile,
    handlePrev,
    handleNext,
  };
}
