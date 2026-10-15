"use client";

import React from "react";
import {
  RotateCcw,
  SkipBack,
  SkipForward,
  Play,
  Pause,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SkipIcon } from "@/components/ui/skip-icon";

interface PlayerControlsProps {
  isPlaying: boolean;
  disabled: boolean;
  skipSeconds: number;
  onTogglePlay: () => void;
  onReplay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onRewind: () => void;
  onForward: () => void;
}

export function PlayerControls({
  isPlaying,
  disabled,
  skipSeconds,
  onTogglePlay,
  onReplay,
  onPrev,
  onNext,
  onRewind,
  onForward,
}: PlayerControlsProps) {
  const { t } = useI18n();

  return (
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
  );
}
