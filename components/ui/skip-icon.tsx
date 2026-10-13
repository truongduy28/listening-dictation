"use client";

import React from "react";

interface SkipIconProps {
  direction: "rewind" | "forward";
  seconds: number;
  size?: number;
}

export function SkipIcon({ direction, seconds, size = 28 }: SkipIconProps) {
  const isRewind = direction === "rewind";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {isRewind ? (
        <>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
        </>
      ) : (
        <>
          <path d="M21 12a9 9 0 1 1-3-6.7" />
          <path d="M21 4v5h-5" />
        </>
      )}
      <text
        x="12"
        y="15.6"
        textAnchor="middle"
        fontSize="8.5"
        fontWeight="700"
        fill="currentColor"
        stroke="none"
        fontFamily="-apple-system,system-ui,sans-serif"
      >
        {seconds}
      </text>
    </svg>
  );
}
