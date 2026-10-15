"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { AbLoop } from "@/lib/abLoop";
import { MIN_AB_GAP_SEC } from "@/lib/constants";
import { formatTime } from "@/lib/format";
import { WaveformHandle } from "./waveform-handle";
import { WaveformRegionOverlay } from "./waveform-region-overlay";

interface WaveformRegionProps {
  abLoop: AbLoop;
  duration: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onChangeLoop: (loop: AbLoop) => void;
  onSeek?: (timeSeconds: number) => void;
}

export function WaveformRegion({
  abLoop,
  duration,
  containerRef,
  onChangeLoop,
  onSeek,
}: WaveformRegionProps) {
  const { t } = useI18n();
  const [isDragging, setIsDragging] = useState<"a" | "b" | null>(null);

  // Direct DOM references for 60fps drag without React re-renders
  const regionRef = useRef<HTMLDivElement>(null);
  const leftDimRef = useRef<HTMLDivElement>(null);
  const rightDimRef = useRef<HTMLDivElement>(null);
  const handleARef = useRef<HTMLDivElement>(null);
  const handleBRef = useRef<HTMLDivElement>(null);
  const pillARef = useRef<HTMLDivElement>(null);
  const pillBRef = useRef<HTMLDivElement>(null);

  const dragValuesRef = useRef<{ a: number | null; b: number | null }>({
    a: abLoop.a,
    b: abLoop.b,
  });

  useEffect(() => {
    if (!isDragging) {
      dragValuesRef.current = { a: abLoop.a, b: abLoop.b };
    }
  }, [abLoop, isDragging]);

  const { a, b } = abLoop;
  const hasA = a !== null;
  const hasB = b !== null;
  const isBothSet = hasA && hasB;

  const aPercent = hasA && duration > 0 ? Math.max(0, Math.min(100, (a / duration) * 100)) : 0;
  const bPercent = hasB && duration > 0 ? Math.max(0, Math.min(100, (b / duration) * 100)) : 100;
  const leftPercent = isBothSet ? Math.min(aPercent, bPercent) : 0;
  const rightPercent = isBothSet ? Math.max(aPercent, bPercent) : 100;
  const widthPercent = isBothSet ? Math.max(0, rightPercent - leftPercent) : 0;

  const handlePointerDown = useCallback(
    (point: "a" | "b", e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(point);
      dragValuesRef.current = { a: abLoop.a, b: abLoop.b };
    },
    [abLoop]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || !containerRef.current || duration <= 0) return;

      const rect = containerRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const targetTime = ratio * duration;

      const currentA = dragValuesRef.current.a;
      const currentB = dragValuesRef.current.b;

      if (isDragging === "a") {
        const newA = currentB !== null
          ? Math.max(0, Math.min(targetTime, currentB - MIN_AB_GAP_SEC))
          : Math.max(0, Math.min(targetTime, duration));
        dragValuesRef.current.a = newA;

        const newAPercent = (newA / duration) * 100;
        if (handleARef.current) handleARef.current.style.left = `${newAPercent}%`;
        if (pillARef.current) pillARef.current.textContent = `A ${formatTime(newA)}`;

        if (currentB !== null) {
          const bPct = (currentB / duration) * 100;
          const wPct = Math.max(0, bPct - newAPercent);
          if (leftDimRef.current) leftDimRef.current.style.width = `${newAPercent}%`;
          if (regionRef.current) {
            regionRef.current.style.left = `${newAPercent}%`;
            regionRef.current.style.width = `${wPct}%`;
          }
        }
      } else if (isDragging === "b") {
        const newB = currentA !== null
          ? Math.max(currentA + MIN_AB_GAP_SEC, Math.min(targetTime, duration))
          : Math.max(0, Math.min(targetTime, duration));
        dragValuesRef.current.b = newB;

        const newBPercent = (newB / duration) * 100;
        if (handleBRef.current) handleBRef.current.style.left = `${newBPercent}%`;
        if (pillBRef.current) pillBRef.current.textContent = `B ${formatTime(newB)}`;

        if (currentA !== null) {
          const aPct = (currentA / duration) * 100;
          const wPct = Math.max(0, newBPercent - aPct);
          if (regionRef.current) regionRef.current.style.width = `${wPct}%`;
          if (rightDimRef.current) {
            rightDimRef.current.style.left = `${newBPercent}%`;
            rightDimRef.current.style.width = `${100 - newBPercent}%`;
          }
        }
      }
    },
    [isDragging, containerRef, duration]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}

      const finalValues = { ...dragValuesRef.current };
      setIsDragging(null);

      if (finalValues.a !== null || finalValues.b !== null) {
        onChangeLoop(finalValues);
        if (onSeek) {
          const seekTarget = isDragging === "a" ? finalValues.a : finalValues.b;
          if (seekTarget !== null) onSeek(seekTarget);
        }
      }
    },
    [isDragging, onChangeLoop, onSeek]
  );

  const handleKeyDown = useCallback(
    (point: "a" | "b", e: React.KeyboardEvent<HTMLDivElement>) => {
      const step = e.shiftKey ? 1.0 : 0.2;
      let delta = 0;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") delta = -step;
      else if (e.key === "ArrowRight" || e.key === "ArrowUp") delta = step;
      else return;

      e.preventDefault();
      if (point === "a" && a !== null) {
        const maxA = b !== null ? b - MIN_AB_GAP_SEC : duration;
        const newA = Math.max(0, Math.min(maxA, a + delta));
        onChangeLoop({ a: newA, b });
        onSeek?.(newA);
      } else if (point === "b" && b !== null) {
        const minB = a !== null ? a + MIN_AB_GAP_SEC : 0;
        const newB = Math.max(minB, Math.min(duration, b + delta));
        onChangeLoop({ a, b: newB });
        onSeek?.(newB);
      }
    },
    [a, b, duration, onChangeLoop, onSeek]
  );

  if (duration <= 0 || (!hasA && !hasB)) return null;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10">
      <WaveformRegionOverlay
        isBothSet={isBothSet}
        leftPercent={leftPercent}
        rightPercent={rightPercent}
        widthPercent={widthPercent}
        leftDimRef={leftDimRef}
        rightDimRef={rightDimRef}
        regionRef={regionRef}
      />

      {/* Handle A */}
      {hasA && (
        <WaveformHandle
          point="a"
          time={a}
          percent={aPercent}
          duration={duration}
          isDragging={isDragging === "a"}
          ariaLabel={t("player.pointAHandleAria")}
          min={0}
          max={b !== null ? b - MIN_AB_GAP_SEC : duration}
          handleRef={handleARef}
          pillRef={pillARef}
          onPointerDown={(e) => handlePointerDown("a", e)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onKeyDown={(e) => handleKeyDown("a", e)}
        />
      )}

      {/* Handle B */}
      {hasB && (
        <WaveformHandle
          point="b"
          time={b}
          percent={bPercent}
          duration={duration}
          isDragging={isDragging === "b"}
          ariaLabel={t("player.pointBHandleAria")}
          min={a !== null ? a + MIN_AB_GAP_SEC : 0}
          max={duration}
          handleRef={handleBRef}
          pillRef={pillBRef}
          onPointerDown={(e) => handlePointerDown("b", e)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onKeyDown={(e) => handleKeyDown("b", e)}
        />
      )}
    </div>
  );
}
