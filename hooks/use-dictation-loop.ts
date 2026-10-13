"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Hook to manage the dictation loop state and the countdown timer between repeats or files.
 */
export function useDictationLoop() {
  const [currentRepeat, setCurrentRepeat] = useState<number>(1);
  const [isWaitingGap, setIsWaitingGap] = useState<boolean>(false);
  const [gapCountdown, setGapCountdown] = useState<number>(0);
  const gapTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any active interval timer
  const clearGapTimer = useCallback(() => {
    if (gapTimerRef.current) {
      clearInterval(gapTimerRef.current);
      gapTimerRef.current = null;
    }
    setIsWaitingGap(false);
    setGapCountdown(0);
  }, []);

  // Reset repeats and timers
  const resetLoop = useCallback(() => {
    clearGapTimer();
    setCurrentRepeat(1);
  }, [clearGapTimer]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (gapTimerRef.current) {
        clearInterval(gapTimerRef.current);
      }
    };
  }, []);

  // Start gap countdown wait before repeating or auto-nexting
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

  return {
    currentRepeat,
    setCurrentRepeat,
    isWaitingGap,
    gapCountdown,
    startGapWait,
    clearGapTimer,
    resetLoop,
  };
}
