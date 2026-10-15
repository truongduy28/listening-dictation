"use client";

import React from "react";
import { formatTime } from "@/lib/format";

interface WaveformHandleProps {
  point: "a" | "b";
  time: number;
  percent: number;
  duration: number;
  isDragging: boolean;
  ariaLabel: string;
  min: number;
  max: number;
  handleRef: React.RefObject<HTMLDivElement | null>;
  pillRef: React.RefObject<HTMLDivElement | null>;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export function WaveformHandle({
  point,
  time,
  percent,
  isDragging,
  ariaLabel,
  min,
  max,
  handleRef,
  pillRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onKeyDown,
}: WaveformHandleProps) {
  const label = point.toUpperCase();

  return (
    <div
      ref={handleRef}
      style={{
        position: "absolute",
        left: `${percent}%`,
        top: 0,
        width: 0,
        height: "154px",
        zIndex: isDragging ? 30 : 20,
      }}
      className="pointer-events-none"
    >
      {/* Label Pill Header */}
      <div
        ref={pillRef}
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
        className={isDragging ? "scale-110 ring-2 ring-black/25" : ""}
      >
        {label} {formatTime(time)}
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
        className={isDragging ? "scale-x-150" : ""}
      />

      {/* Interactive Touch/Drag Hitbox */}
      <div
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={time}
        aria-valuetext={`${label}: ${formatTime(time)}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        style={{
          position: "absolute",
          left: "-14px",
          top: 0,
          width: "28px",
          height: "154px",
          cursor: isDragging ? "grabbing" : "ew-resize",
          touchAction: "none",
        }}
        className="pointer-events-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
      />
    </div>
  );
}
