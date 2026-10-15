"use client";

import React from "react";
import { X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { AbLoop } from "@/lib/abLoop";
import { formatTime } from "@/hooks/use-audio-player";

interface AbLoopControlsProps {
  abLoop: AbLoop;
  onSetA: () => void;
  onSetB: () => void;
  onClear: () => void;
  disabled?: boolean;
}

export function AbLoopControls({
  abLoop,
  onSetA,
  onSetB,
  onClear,
  disabled = false,
}: AbLoopControlsProps) {
  const { t } = useI18n();

  const hasA = abLoop.a !== null;
  const hasB = abLoop.b !== null;
  const hasAny = hasA || hasB;

  const aLabel = hasA
    ? t("player.pointAAt", { time: formatTime(abLoop.a!) })
    : t("player.setPointA");

  const bLabel = hasB
    ? t("player.pointBAt", { time: formatTime(abLoop.b!) })
    : t("player.setPointB");

  return (
    <div
      role="group"
      aria-label={t("player.abLoopGroup")}
      className="inline-flex items-center gap-1 bg-[var(--bg-subtle)] rounded-full p-1 border border-[var(--border-default)] shadow-xs"
    >
      {/* Point A */}
      <button
        type="button"
        disabled={disabled}
        onClick={onSetA}
        title={aLabel}
        aria-label={aLabel}
        className={`h-7 px-3 rounded-full text-xs font-semibold cursor-pointer transition-all duration-150 select-none active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${
          hasA
            ? "bg-[var(--accent-btn)] text-[var(--accent-btn-text)] shadow-xs"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
        }`}
      >
        A
      </button>

      {/* Point B */}
      <button
        type="button"
        disabled={disabled}
        onClick={onSetB}
        title={bLabel}
        aria-label={bLabel}
        className={`h-7 px-3 rounded-full text-xs font-semibold cursor-pointer transition-all duration-150 select-none active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${
          hasB
            ? "bg-[var(--accent-btn)] text-[var(--accent-btn-text)] shadow-xs"
            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
        }`}
      >
        B
      </button>

      {/* Clear A-B Loop (✕) */}
      {hasAny && (
        <button
          type="button"
          disabled={disabled}
          onClick={onClear}
          title={t("player.clearAbLoop")}
          aria-label={t("player.clearAbLoop")}
          className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--bg-card)] cursor-pointer transition-all duration-150 active:scale-90 disabled:opacity-40 disabled:pointer-events-none animate-fadeIn"
        >
          <X className="w-3.5 h-3.5" strokeWidth={2.2} />
        </button>
      )}
    </div>
  );
}
