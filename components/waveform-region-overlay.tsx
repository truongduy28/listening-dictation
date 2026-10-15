"use client";

import React from "react";

interface WaveformRegionOverlayProps {
  isBothSet: boolean;
  leftPercent: number;
  rightPercent: number;
  widthPercent: number;
  leftDimRef: React.RefObject<HTMLDivElement | null>;
  rightDimRef: React.RefObject<HTMLDivElement | null>;
  regionRef: React.RefObject<HTMLDivElement | null>;
}

export function WaveformRegionOverlay({
  isBothSet,
  leftPercent,
  rightPercent,
  widthPercent,
  leftDimRef,
  rightDimRef,
  regionRef,
}: WaveformRegionOverlayProps) {
  if (!isBothSet) return null;

  return (
    <>
      {/* Dim outside region: Left side */}
      {leftPercent > 0 && (
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
      {rightPercent < 100 && (
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

      {/* A-B Active Highlighted Region */}
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
    </>
  );
}
