"use client";

import React from "react";
import {
  RotateCcw,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Repeat,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SkipIcon } from "@/components/ui/skip-icon";

interface PlayerCardProps {
  waveformContainerRef: React.RefObject<HTMLDivElement | null>;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReplay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onRewind: () => void;
  onForward: () => void;
  onSeekPercent: (ratio: number) => void;
  skipSeconds: number;
  currentTimeFormatted: string;
  totalTimeFormatted: string;
  progressPercent: number;
  currentRepeat: number;
  repeatCount: number;
  gapSeconds: number;
  autoNext: boolean;
  isWaitingGap?: boolean;
  gapCountdown?: number;
  isLargeFile?: boolean;
  hasError?: boolean;
}

export function PlayerCard({
  waveformContainerRef,
  isPlaying,
  onTogglePlay,
  onReplay,
  onPrev,
  onNext,
  onRewind,
  onForward,
  onSeekPercent,
  skipSeconds,
  currentTimeFormatted,
  totalTimeFormatted,
  progressPercent,
  currentRepeat,
  repeatCount,
  gapSeconds,
  autoNext,
  isWaitingGap = false,
  gapCountdown = 0,
  isLargeFile = false,
  hasError = false,
}: PlayerCardProps) {
  const { t } = useI18n();

  const handleLargeFileClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeekPercent(ratio);
  };

  // Compute badge text
  let badgeText = "";
  if (isWaitingGap) {
    if (currentRepeat < repeatCount) {
      badgeText = t("player.gapRepeat", {
        countdown: gapCountdown,
        next: currentRepeat + 1,
        total: repeatCount,
      });
    } else {
      badgeText = t("player.gapNext", { countdown: gapCountdown });
    }
  } else {
    if (repeatCount > 1) {
      if (autoNext) {
        badgeText = t("player.loopBadgeWithGap", {
          current: currentRepeat,
          total: repeatCount,
          gap: gapSeconds,
        });
      } else {
        badgeText = t("player.loopBadge", {
          current: currentRepeat,
          total: repeatCount,
        });
      }
    } else {
      if (autoNext) {
        badgeText = t("player.autoNextBadge", { gap: gapSeconds });
      } else {
        badgeText = t("player.singlePlayBadge");
      }
    }
  }

  return (
    <section className="bg-[var(--bg-card)] rounded-[28px] p-7 md:px-8 md:pt-7 md:pb-6 shadow-[var(--shadow-card)] border border-[var(--border-card)] flex flex-col gap-3.5">
      {/* Waveform Visualization / Fallback */}
      {hasError ? (
        <div className="w-full h-[132px] rounded-2xl bg-[var(--danger-bg)] text-[var(--danger)] flex items-center justify-center text-sm font-medium px-4 text-center">
          {t("player.errorFormat")}
        </div>
      ) : isLargeFile ? (
        <div
          className="w-full h-[132px] flex flex-col items-center justify-center gap-3 cursor-pointer select-none px-4"
          onClick={handleLargeFileClick}
        >
          <span className="text-xs text-[var(--text-secondary)] font-medium">
            {t("player.largeFileNotice")}
          </span>
          <div className="w-full h-3 rounded-full bg-[var(--waveform-unplayed)] overflow-hidden">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-[var(--waveform-played)] rounded-full transition-all duration-100"
            />
          </div>
        </div>
      ) : (
        <div
          ref={waveformContainerRef}
          className="w-full h-[132px] overflow-hidden rounded-xl select-none cursor-pointer"
          aria-label={t("player.progressAria", { percent: progressPercent })}
        />
      )}

      {/* Time & Progress Info */}
      <div className="flex items-center justify-between text-[13px] tabular-nums text-[var(--text-secondary)] font-medium">
        <span>{currentTimeFormatted}</span>
        <span className="bg-[var(--bg-subtle)] rounded-full px-2.5 py-0.5 font-semibold text-[var(--text-primary)]">
          {progressPercent}%
        </span>
        <span>{totalTimeFormatted}</span>
      </div>

      {/* Playback Controls Row */}
      <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap py-1.5">
        {/* Replay (R) */}
        <button
          type="button"
          onClick={onReplay}
          aria-label={t("player.replayAria")}
          className="ghost w-12 h-12 rounded-full flex items-center justify-center cursor-pointer"
        >
          <RotateCcw className="w-[22px] h-[22px]" strokeWidth={1.9} />
        </button>

        {/* Prev (Up Arrow) */}
        <button
          type="button"
          onClick={onPrev}
          aria-label={t("player.prevAria")}
          className="ghost w-[52px] h-[52px] rounded-full flex items-center justify-center cursor-pointer"
        >
          <SkipBack className="w-[26px] h-[26px]" fill="currentColor" strokeWidth={1.5} />
        </button>

        {/* Rewind N seconds (Left Arrow) */}
        <button
          type="button"
          onClick={onRewind}
          aria-label={t("player.rewindAria", { seconds: skipSeconds })}
          className="ghost w-[52px] h-[52px] rounded-full flex items-center justify-center cursor-pointer relative"
        >
          <SkipIcon direction="rewind" seconds={skipSeconds} />
        </button>

        {/* Play / Pause (Space) - 76x76 Central Button */}
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={t("player.playPauseAria")}
          className="w-[76px] h-[76px] rounded-full border-0 bg-[var(--accent-btn)] text-[var(--accent-btn-text)] flex items-center justify-center shadow-[var(--shadow-play)] transition-transform active:scale-95 cursor-pointer"
        >
          {isPlaying ? (
            <Pause className="w-[30px] h-[30px]" fill="currentColor" strokeWidth={0} />
          ) : (
            <Play className="w-[30px] h-[30px] ml-1" fill="currentColor" strokeWidth={0} />
          )}
        </button>

        {/* Forward N seconds (Right Arrow) */}
        <button
          type="button"
          onClick={onForward}
          aria-label={t("player.forwardAria", { seconds: skipSeconds })}
          className="ghost w-[52px] h-[52px] rounded-full flex items-center justify-center cursor-pointer relative"
        >
          <SkipIcon direction="forward" seconds={skipSeconds} />
        </button>

        {/* Next (Down Arrow) */}
        <button
          type="button"
          onClick={onNext}
          aria-label={t("player.nextAria")}
          className="ghost w-[52px] h-[52px] rounded-full flex items-center justify-center cursor-pointer"
        >
          <SkipForward className="w-[26px] h-[26px]" fill="currentColor" strokeWidth={1.5} />
        </button>

        {/* 48px Spacer for balanced visual layout */}
        <div className="w-12 hidden md:block" />
      </div>

      {/* Loop Status Pill */}
      <div className="flex justify-center pt-1">
        <div className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${
          isWaitingGap
            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium"
            : "bg-[var(--bg-subtle)] text-[var(--text-tertiary)]"
        }`}>
          <Repeat className="w-[15px] h-[15px]" strokeWidth={2} />
          <span>{badgeText}</span>
        </div>
      </div>
    </section>
  );
}
