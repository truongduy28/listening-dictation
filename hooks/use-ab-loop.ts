"use client";

import { useState, useCallback } from "react";
import {
  AbLoop,
  setPointA,
  setPointB,
  clearAbLoop,
  isAbLoopActive,
} from "@/lib/abLoop";

export function useAbLoop() {
  const [abLoop, setAbLoop] = useState<AbLoop>({ a: null, b: null });

  const setA = useCallback((currentTime: number, duration: number = Infinity) => {
    setAbLoop((prev) => setPointA(prev, currentTime, duration));
  }, []);

  const setB = useCallback((currentTime: number, duration: number = Infinity) => {
    setAbLoop((prev) => setPointB(prev, currentTime, duration));
  }, []);

  const clear = useCallback(() => {
    setAbLoop(clearAbLoop());
  }, []);

  const setExplicit = useCallback((loop: AbLoop) => {
    setAbLoop(loop);
  }, []);

  const isActive = isAbLoopActive(abLoop);

  return {
    abLoop,
    isActive,
    setA,
    setB,
    clear,
    setExplicit,
  };
}
