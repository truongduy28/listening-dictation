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
import { AbLoop, isAbLoopActive } from "@/lib/abLoop";
import { AbLoopControls } from "@/components/ab-loop-controls";
import { WaveformRegion } from "@/components/waveform-region";
import { formatTime } from "@/hooks/use-audio-player";

interface PlayerCardProps {
  waveformContainerRef: React.Ref<HTMLDivElement>;
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
  disabled?: boolean;
  abLoop: AbLoop;
  onSetA: () => void;
  onSetB: () => void;
  onClearAB: () => void;
  duration?: number;
  onUpdateAbLoop?: (loop: AbLoop) => void;
  onSeek?: (timeSeconds: number) => void;
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
  disabled = false,
  abLoop,
  onSetA,
  onSetB,
  onClearAB,
  duration = 0,
  onUpdateAbLoop,
  onSeek,
}: PlayerCardProps) {
  const { t } = useI18n();
  const waveformWrapperRef = React.useRef<HTMLDivElement>(null);

  const handleLargeFileClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeekPercent(ratio);
  };

  // Compute badge text
  let badgeText = "";
  if (isAbLoopActive(abLoop)) {
    if (isWaitingGap) {
      badgeText = t("player.gapRepeatAb", { countdown: gapCountdown });
    } else {
      badgeText =
        gapSeconds > 0
          ? t("player.abLoopBadgeWithGap", {
              a: formatTime(abLoop.a!),
              b: formatTime(abLoop.b!),
              gap: gapSeconds,
            })
          : t("player.abLoopBadge", {
              a: formatTime(abLoop.a!),
              b: formatTime(abLoop.b!),
            });
    }
  } else if (abLoop.a !== null) {
    badgeText = t("player.abPointASet", { a: formatTime(abLoop.a) });
  } else if (isWaitingGap) {
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
    <section
      aria-label={t("player.playerCardAria")}
      className="bg-[var(--bg-card)] rounded-[28px] p-7 md:px-8 md:pt-7 md:pb-6 shadow-[var(--shadow-card)] border border-[var(--border-card)] flex flex-col gap-3.5"
    >
      {/* Waveform Visualization / Fallback with A-B Overlay */}
      <div ref={waveformWrapperRef} className="relative pt-[22px] select-none">
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

        {/* Waveform A-B Region and Dual Draggable Handles */}
        <WaveformRegion
          abLoop={abLoop}
          duration={duration}
          containerRef={waveformWrapperRef}
          onChangeLoop={(loop) => onUpdateAbLoop?.(loop)}
          onSeek={onSeek}
        />
      </div>

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
          disabled={disabled}
          onClick={onReplay}
          aria-label={t("player.replayAria")}
          className="ghost w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 active:scale-90 hover:bg-[var(--bg-subtle)] group disabled:opacity-35 disabled:pointer-events-none"
        >
          <RotateCcw className="w-[22px] h-[22px] group-hover:-rotate-45 transition-transform duration-200" strokeWidth={1.9} />
        </button>

        {/* Prev (Up Arrow) */}
        <button
          type="button"
          disabled={disabled}
          onClick={onPrev}
          aria-label={t("player.prevAria")}
          className="ghost w-[52px] h-[52px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-[var(--bg-subtle)] group disabled:opacity-35 disabled:pointer-events-none"
        >
          <SkipBack className="w-[26px] h-[26px] group-hover:-translate-x-0.5 transition-transform duration-150" fill="currentColor" strokeWidth={1.5} />
        </button>

        {/* Rewind N seconds (Left Arrow) */}
        <button
          type="button"
          disabled={disabled}
          onClick={onRewind}
          aria-label={t("player.rewindAria", { seconds: skipSeconds })}
          className="ghost w-[52px] h-[52px] rounded-full flex items-center justify-center cursor-pointer relative transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-[var(--bg-subtle)] group disabled:opacity-35 disabled:pointer-events-none"
        >
          <SkipIcon direction="rewind" seconds={skipSeconds} />
        </button>

        {/* Play / Pause (Space) - 76x76 Central Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={onTogglePlay}
          aria-label={t("player.playPauseAria")}
          className="w-[76px] h-[76px] rounded-full border-0 bg-[var(--accent-btn)] text-[var(--accent-btn-text)] flex items-center justify-center shadow-[var(--shadow-play)] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer relative group disabled:opacity-35 disabled:pointer-events-none disabled:scale-100 disabled:shadow-none"
        >
          {isPlaying && (
            <span
              className="absolute inset-0 rounded-full bg-[var(--accent-btn)] opacity-20 animate-ping -z-10 pointer-events-none"
              style={{ animationDuration: "2s" }}
            />
          )}
          {isPlaying ? (
            <Pause className="w-[30px] h-[30px] transition-transform group-hover:scale-105" fill="currentColor" strokeWidth={0} />
          ) : (
            <Play className="w-[30px] h-[30px] ml-1 transition-transform group-hover:scale-105" fill="currentColor" strokeWidth={0} />
          )}
        </button>

        {/* Forward N seconds (Right Arrow) */}
        <button
          type="button"
          disabled={disabled}
          onClick={onForward}
          aria-label={t("player.forwardAria", { seconds: skipSeconds })}
          className="ghost w-[52px] h-[52px] rounded-full flex items-center justify-center cursor-pointer relative transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-[var(--bg-subtle)] group disabled:opacity-35 disabled:pointer-events-none"
        >
          <SkipIcon direction="forward" seconds={skipSeconds} />
        </button>

        {/* Next (Down Arrow) */}
        <button
          type="button"
          disabled={disabled}
          onClick={onNext}
          aria-label={t("player.nextAria")}
          className="ghost w-[52px] h-[52px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-[var(--bg-subtle)] group disabled:opacity-35 disabled:pointer-events-none"
        >
          <SkipForward className="w-[26px] h-[26px] group-hover:translate-x-0.5 transition-transform duration-150" fill="currentColor" strokeWidth={1.5} />
        </button>

        {/* 48px Spacer for balanced visual layout */}
        <div className="w-12 hidden md:block" />
      </div>

      {/* Loop Status Pill & A-B Controls */}
      <div className="flex items-center justify-center gap-3 flex-wrap pt-1">
        <AbLoopControls
          abLoop={abLoop}
          onSetA={onSetA}
          onSetB={onSetB}
          onClear={onClearAB}
          disabled={disabled}
        />

        <div
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] transition-all duration-300 ${
            isWaitingGap
              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-semibold shadow-sm"
              : "bg-[var(--bg-subtle)] text-[var(--text-tertiary)] hover:bg-[var(--bg-card)]"
          }`}
        >
          {isWaitingGap ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
          ) : (
            <Repeat className="w-[15px] h-[15px]" strokeWidth={2} />
          )}
          <span>{badgeText}</span>
        </div>
      </div>
    </section>
  );
}
