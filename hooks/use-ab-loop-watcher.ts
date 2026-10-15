"use client";

import { useEffect, useRef } from "react";
import { AbLoop, isAbLoopActive } from "@/lib/abLoop";

interface UseAbLoopWatcherOptions {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  abLoop?: AbLoop;
  onAbLoopReached?: () => void;
}

/**
 * High-precision rAF loop for A-B repeat boundary checking.
 */
export function useAbLoopWatcher({
  audioRef,
  isPlaying,
  abLoop,
  onAbLoopReached,
}: UseAbLoopWatcherOptions) {
  const abLoopRef = useRef<AbLoop | undefined>(abLoop);
  const onAbLoopReachedRef = useRef(onAbLoopReached);

  useEffect(() => {
    abLoopRef.current = abLoop;
  }, [abLoop]);

  useEffect(() => {
    onAbLoopReachedRef.current = onAbLoopReached;
  }, [onAbLoopReached]);

  useEffect(() => {
    if (!isPlaying) return;

    let rafId: number;
    let lastTriggerTime = 0;

    const checkLoop = () => {
      const audio = audioRef.current;
      if (!audio || audio.paused) return;

      const loop = abLoopRef.current;
      if (loop && isAbLoopActive(loop)) {
        const curTime = audio.currentTime;
        if (curTime >= loop.b! - 0.05) {
          const now = performance.now();
          if (now - lastTriggerTime > 200) {
            lastTriggerTime = now;
            onAbLoopReachedRef.current?.();
          }
        }
      }

      rafId = requestAnimationFrame(checkLoop);
    };

    rafId = requestAnimationFrame(checkLoop);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, audioRef]);
}
