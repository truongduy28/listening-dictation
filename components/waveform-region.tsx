"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { AbLoop } from "@/lib/abLoop";
import { formatTime } from "@/hooks/use-audio-player";

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

  // Transient values during dragging
  const dragValuesRef = useRef<{ a: number | null; b: number | null }>({
    a: abLoop.a,
    b: abLoop.b,
  });

  // Keep transient values synced with props when not dragging
  useEffect(() => {
    if (!isDragging) {
      dragValuesRef.current = { a: abLoop.a, b: abLoop.b };
    }
  }, [abLoop, isDragging]);

  const { a, b } = abLoop;
  const hasA = a !== null;
  const hasB = b !== null;
  const isBothSet = hasA && hasB;

  // Calculate percentages based on track duration
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
      const clientX = e.clientX;
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const targetTime = ratio * duration;

      const currentA = dragValuesRef.current.a;
      const currentB = dragValuesRef.current.b;

      if (isDragging === "a") {
        let newA = targetTime;
        if (currentB !== null) {
          // Clamp with 0.3s minimum gap
          newA = Math.max(0, Math.min(newA, currentB - 0.3));
        } else {
          newA = Math.max(0, Math.min(newA, duration));
        }
        dragValuesRef.current.a = newA;

        const newAPercent = (newA / duration) * 100;
        if (handleARef.current) {
          handleARef.current.style.left = `${newAPercent}%`;
        }
        if (pillARef.current) {
          pillARef.current.textContent = `A ${formatTime(newA)}`;
        }
        if (currentB !== null) {
          const bPct = (currentB / duration) * 100;
          const wPct = Math.max(0, bPct - newAPercent);
          if (leftDimRef.current) {
            leftDimRef.current.style.width = `${newAPercent}%`;
          }
          if (regionRef.current) {
            regionRef.current.style.left = `${newAPercent}%`;
            regionRef.current.style.width = `${wPct}%`;
          }
        }
      } else if (isDragging === "b") {
        let newB = targetTime;
        if (currentA !== null) {
          // Clamp with 0.3s minimum gap
          newB = Math.max(currentA + 0.3, Math.min(newB, duration));
        } else {
          newB = Math.max(0, Math.min(newB, duration));
        }
        dragValuesRef.current.b = newB;

        const newBPercent = (newB / duration) * 100;
        if (handleBRef.current) {
          handleBRef.current.style.left = `${newBPercent}%`;
        }
        if (pillBRef.current) {
          pillBRef.current.textContent = `B ${formatTime(newB)}`;
        }
        if (currentA !== null) {
          const aPct = (currentA / duration) * 100;
          const wPct = Math.max(0, newBPercent - aPct);
          if (regionRef.current) {
            regionRef.current.style.width = `${wPct}%`;
          }
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
      } catch {
        // Ignored if pointer capture was already lost
      }

      const finalValues = { ...dragValuesRef.current };
      setIsDragging(null);

      if (finalValues.a !== null || finalValues.b !== null) {
        onChangeLoop(finalValues);
        if (onSeek) {
          const seekTarget = isDragging === "a" ? finalValues.a : finalValues.b;
          if (seekTarget !== null) {
            onSeek(seekTarget);
          }
        }
      }
    },
    [isDragging, onChangeLoop, onSeek]
  );

  const handleKeyDown = useCallback(
    (point: "a" | "b", e: React.KeyboardEvent<HTMLDivElement>) => {
      const step = e.shiftKey ? 1.0 : 0.2;
      let delta = 0;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        delta = -step;
      } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        delta = step;
      } else {
        return;
      }

      e.preventDefault();
      if (point === "a" && a !== null) {
        const maxA = b !== null ? b - 0.3 : duration;
        const newA = Math.max(0, Math.min(maxA, a + delta));
        onChangeLoop({ a: newA, b });
        onSeek?.(newA);
      } else if (point === "b" && b !== null) {
        const minB = a !== null ? a + 0.3 : 0;
        const newB = Math.max(minB, Math.min(duration, b + delta));
        onChangeLoop({ a, b: newB });
        onSeek?.(newB);
      }
    },
    [a, b, duration, onChangeLoop, onSeek]
  );

  if (duration <= 0 || (!hasA && !hasB)) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10">
      {/* Dim outside region: Left side */}
      {isBothSet && leftPercent > 0 && (
        <div
          ref={leftDimRef}
          style={{
            position: "absolute",
            left: 0,
            top: "22px",
            height: "132px",
            width: `${leftPercent}%`,
            backgroundColor: "rgba(255, 255, 255, 0.65)",
            backdropFilter: "grayscale(30%)",
            borderTopLeftRadius: "12px",
            borderBottomLeftRadius: "12px",
            pointerEvents: "none",
            transition: "width 75ms ease-out",
          }}
        />
      )}

      {/* Dim outside region: Right side */}
      {isBothSet && rightPercent < 100 && (
        <div
          ref={rightDimRef}
          style={{
            position: "absolute",
            left: `${rightPercent}%`,
            top: "22px",
            height: "132px",
            width: `${100 - rightPercent}%`,
            backgroundColor: "rgba(255, 255, 255, 0.65)",
            backdropFilter: "grayscale(30%)",
            borderTopRightRadius: "12px",
            borderBottomRightRadius: "12px",
            pointerEvents: "none",
            transition: "left 75ms ease-out, width 75ms ease-out",
          }}
        />
      )}

      {/* A-B Active Highlighted Region with visible soft background */}
      {isBothSet && (
        <div
          ref={regionRef}
          style={{
            position: "absolute",
            left: `${leftPercent}%`,
            width: `${widthPercent}%`,
            top: "22px",
            height: "132px",
            backgroundColor: "rgba(0, 0, 0, 0.08)",
            borderRadius: "8px",
            pointerEvents: "none",
          }}
          className="animate-in fade-in zoom-in-95 duration-200 shadow-inner"
        />
      )}

      {/* Handle A */}
      {hasA && (
        <div
          ref={handleARef}
          style={{
            position: "absolute",
            left: `${aPercent}%`,
            top: 0,
            width: 0,
            height: "154px",
            zIndex: isDragging === "a" ? 30 : 20,
          }}
          className="pointer-events-none"
        >
          {/* Label Pill Header */}
          <div
            ref={pillARef}
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              top: 0,
              height: "20px",
              padding: "0 8px",
              borderRadius: "10px",
              backgroundColor: "#1d1d1f",
              color: "#ffffff",
              fontSize: "11px",
              fontWeight: 600,
              lineHeight: "20px",
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.28)",
              pointerEvents: "none",
              userSelect: "none",
              transition: "transform 150ms ease",
            }}
            className={isDragging === "a" ? "scale-110 ring-2 ring-black/25" : ""}
          >
            A {formatTime(a)}
          </div>

          {/* Vertical Bar (solid black, crisp boundary line) */}
          <div
            style={{
              position: "absolute",
              left: "-1.5px",
              top: "22px",
              width: "3px",
              height: "132px",
              borderRadius: "1.5px",
              backgroundColor: "#000000",
              boxShadow: "0 0 2px rgba(0, 0, 0, 0.4)",
              pointerEvents: "none",
              transition: "transform 150ms ease",
            }}
            className={isDragging === "a" ? "scale-x-150" : ""}
          />

          {/* Interactive Touch/Drag Hitbox */}
          <div
            role="slider"
            tabIndex={0}
            aria-label={t("player.pointAHandleAria")}
            aria-valuemin={0}
            aria-valuemax={b !== null ? b - 0.3 : duration}
            aria-valuenow={a}
            aria-valuetext={`A: ${formatTime(a)}`}
            onPointerDown={(e) => handlePointerDown("a", e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onKeyDown={(e) => handleKeyDown("a", e)}
            style={{
              position: "absolute",
              left: "-14px",
              top: 0,
              width: "28px",
              height: "154px",
              cursor: isDragging === "a" ? "grabbing" : "ew-resize",
              touchAction: "none",
            }}
            className="pointer-events-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
          />
        </div>
      )}

      {/* Handle B */}
      {hasB && (
        <div
          ref={handleBRef}
          style={{
            position: "absolute",
            left: `${bPercent}%`,
            top: 0,
            width: 0,
            height: "154px",
            zIndex: isDragging === "b" ? 30 : 20,
          }}
          className="pointer-events-none"
        >
          {/* Label Pill Header */}
          <div
            ref={pillBRef}
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              top: 0,
              height: "20px",
              padding: "0 8px",
              borderRadius: "10px",
              backgroundColor: "#1d1d1f",
              color: "#ffffff",
              fontSize: "11px",
              fontWeight: 600,
              lineHeight: "20px",
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.28)",
              pointerEvents: "none",
              userSelect: "none",
              transition: "transform 150ms ease",
            }}
            className={isDragging === "b" ? "scale-110 ring-2 ring-black/25" : ""}
          >
            B {formatTime(b)}
          </div>

          {/* Vertical Bar (solid black, crisp boundary line) */}
          <div
            style={{
              position: "absolute",
              left: "-1.5px",
              top: "22px",
              width: "3px",
              height: "132px",
              borderRadius: "1.5px",
              backgroundColor: "#000000",
              boxShadow: "0 0 2px rgba(0, 0, 0, 0.4)",
              pointerEvents: "none",
              transition: "transform 150ms ease",
            }}
            className={isDragging === "b" ? "scale-x-150" : ""}
          />

          {/* Interactive Touch/Drag Hitbox */}
          <div
            role="slider"
            tabIndex={0}
            aria-label={t("player.pointBHandleAria")}
            aria-valuemin={a !== null ? a + 0.3 : 0}
            aria-valuemax={duration}
            aria-valuenow={b}
            aria-valuetext={`B: ${formatTime(b)}`}
            onPointerDown={(e) => handlePointerDown("b", e)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onKeyDown={(e) => handleKeyDown("b", e)}
            style={{
              position: "absolute",
              left: "-14px",
              top: 0,
              width: "28px",
              height: "154px",
              cursor: isDragging === "b" ? "grabbing" : "ew-resize",
              touchAction: "none",
            }}
            className="pointer-events-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
          />
        </div>
      )}
    </div>
  );
}
