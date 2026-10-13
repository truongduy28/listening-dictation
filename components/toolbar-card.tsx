"use client";

import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SliderField } from "@/components/ui/slider-field";
import { NumberField } from "@/components/ui/number-field";
import { Switch } from "@/components/ui/switch";

export type PlaybackRate = 0.5 | 0.75 | 1 | 1.25 | 1.5;

const SPEEDS: PlaybackRate[] = [0.5, 0.75, 1, 1.25, 1.5];

interface ToolbarCardProps {
  playbackRate: PlaybackRate;
  onPlaybackRateChange: (rate: PlaybackRate) => void;
  volume: number; // 0 - 1
  onVolumeChange: (vol: number) => void;
  skipSeconds: number; // 1 - 30
  onSkipSecondsChange: (sec: number) => void;
  repeatCount: number; // 1 - 99
  onRepeatCountChange: (count: number) => void;
  gapSeconds: number; // 0 - 30
  onGapSecondsChange: (gap: number) => void;
  autoNext: boolean;
  onAutoNextChange: (next: boolean) => void;
}

export function ToolbarCard({
  playbackRate,
  onPlaybackRateChange,
  volume,
  onVolumeChange,
  skipSeconds,
  onSkipSecondsChange,
  repeatCount,
  onRepeatCountChange,
  gapSeconds,
  onGapSecondsChange,
  autoNext,
  onAutoNextChange,
}: ToolbarCardProps) {
  const { t } = useI18n();

  const speedOptions = SPEEDS.map((s) => ({
    value: s,
    label: `${s}×`,
  }));

  return (
    <section
      aria-label="Cài đặt phát và vòng lặp"
      className="bg-[var(--bg-card)] rounded-[24px] p-6 md:px-7 md:py-6 shadow-[var(--shadow-subtle)] border border-[var(--border-card)] flex flex-wrap gap-6 md:gap-7"
    >
      {/* 1. Tốc độ (Speed) */}
      <div className="flex-[2_1_320px] flex flex-col gap-2.5">
        <span className="text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
          {t("toolbar.speed")}
        </span>
        <SegmentedControl
          variant="pill"
          options={speedOptions}
          value={playbackRate}
          onChange={onPlaybackRateChange}
        />
      </div>

      {/* 2. Âm lượng (Volume) */}
      <SliderField
        label={t("toolbar.volume")}
        min={0}
        max={100}
        value={Math.round(volume * 100)}
        displayValue={`${Math.round(volume * 100)}%`}
        onChange={(val) => onVolumeChange(val / 100)}
        icon={
          volume === 0 ? (
            <VolumeX className="w-5 h-5 shrink-0 opacity-60" strokeWidth={1.8} />
          ) : (
            <Volume2 className="w-5 h-5 shrink-0" strokeWidth={1.8} />
          )
        }
      />

      {/* 3. Tua mỗi lần (Skip step) */}
      <SliderField
        label={t("toolbar.skipStep")}
        min={1}
        max={30}
        value={skipSeconds}
        displayValue={t("toolbar.skipStepValue", { seconds: skipSeconds })}
        onChange={onSkipSecondsChange}
      />

      {/* 4. Lặp mỗi tệp (Repeat count) */}
      <NumberField
        label={t("toolbar.repeatCount")}
        min={1}
        max={99}
        value={repeatCount}
        unit={t("toolbar.times")}
        onChange={onRepeatCountChange}
      />

      {/* 5. Nghỉ giữa các lần (Gap seconds) */}
      <NumberField
        label={t("toolbar.gapSeconds")}
        min={0}
        max={30}
        value={gapSeconds}
        unit={t("toolbar.seconds")}
        onChange={onGapSecondsChange}
      />

      {/* 6. Tự chuyển câu (Auto-next) */}
      <div className="flex-[1_1_150px] flex flex-col gap-2.5">
        <span className="text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
          {t("toolbar.autoNext")}
        </span>
        <div className="flex items-center gap-2.5 h-10">
          <Switch
            checked={autoNext}
            onCheckedChange={onAutoNextChange}
            ariaLabel={t("toolbar.autoNext")}
          />
          <span className="text-sm font-medium text-[var(--text-tertiary)]">
            {autoNext ? t("toolbar.on") : t("toolbar.off")}
          </span>
        </div>
      </div>
    </section>
  );
}
