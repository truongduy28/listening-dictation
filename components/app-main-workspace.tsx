"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";
import { PermissionBanner } from "@/components/permission-banner";
import { TrackHeader } from "@/components/track-header";
import { PlayerCard } from "@/components/player-card";
import { ToolbarCard, PlaybackRate } from "@/components/toolbar-card";
import { ShortcutsFooter } from "@/components/shortcuts-footer";
import { AudioFile } from "@/lib/file-system";
import { FilterType } from "@/components/sidebar";
import { AbLoop } from "@/lib/abLoop";

interface AppMainWorkspaceProps {
  folderName: string | null;
  permissionNeeded: boolean;
  grantPermission: () => Promise<void>;
  currentFile: AudioFile | null;
  queueStatus: { current: number; total: number; isInQueue: boolean };
  filter: FilterType;
  searchQuery: string;
  onToggleStarCurrent: () => void;
  onOpenShortcuts: () => void;
  onQueueClick: () => void;

  waveformContainerRef: React.RefCallback<HTMLDivElement | null>;
  isPlaying: boolean;
  isPlayerDisabled: boolean;
  onTogglePlay: () => void;
  onReplay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onRewind: () => void;
  onForward: () => void;
  onSeekPercent: (ratio: number) => void;
  onSeek: (seconds: number) => void;

  currentTimeFormatted: string;
  totalTimeFormatted: string;
  progressPercent: number;
  duration: number;
  isLargeFile: boolean;
  hasError: boolean;

  currentRepeat: number;
  repeatCount: number;
  gapSeconds: number;
  autoNext: boolean;
  isWaitingGap: boolean;
  gapCountdown: number;

  abLoop: AbLoop;
  onSetA: () => void;
  onSetB: () => void;
  onClearAB: () => void;
  onUpdateAbLoop: (range: AbLoop) => void;

  playbackRate: PlaybackRate;
  onPlaybackRateChange: (r: PlaybackRate) => void;
  volume: number;
  onVolumeChange: (v: number) => void;
  onToggleMute: () => void;
  skipSeconds: number;
  onSkipSecondsChange: (s: number) => void;
  onRepeatCountChange: (rc: number) => void;
  onGapSecondsChange: (g: number) => void;
  onAutoNextChange: (an: boolean) => void;
}

export function AppMainWorkspace(props: AppMainWorkspaceProps) {
  const { t } = useI18n();

  return (
    <main
      aria-label={t("app.mainPlayerAria")}
      className="flex-[999_1_560px] min-w-0 max-w-[1120px] mx-auto w-full box-border px-6 py-7 md:px-12 md:py-9 flex flex-col gap-5"
    >
      {/* Permission needed banner (for Chrome/Edge reload) */}
      {props.permissionNeeded && props.folderName && (
        <PermissionBanner
          folderName={props.folderName}
          onGrant={props.grantPermission}
        />
      )}

      {/* Current Track Header */}
      <TrackHeader
        currentFile={props.currentFile}
        queueIndex={props.queueStatus.current}
        queueTotal={props.queueStatus.total}
        filter={props.filter}
        searchQuery={props.searchQuery}
        onToggleStar={props.onToggleStarCurrent}
        onOpenShortcuts={props.onOpenShortcuts}
        onQueueClick={props.onQueueClick}
      />

      {/* Audio Player Card (WaveSurfer + Transport Controls) */}
      <PlayerCard
        waveformContainerRef={props.waveformContainerRef}
        isPlaying={props.isPlaying}
        disabled={props.isPlayerDisabled}
        onTogglePlay={props.onTogglePlay}
        onReplay={props.onReplay}
        onPrev={props.onPrev}
        onNext={props.onNext}
        onRewind={props.onRewind}
        onForward={props.onForward}
        onSeekPercent={props.onSeekPercent}
        skipSeconds={props.skipSeconds}
        currentTimeFormatted={props.currentTimeFormatted}
        totalTimeFormatted={props.totalTimeFormatted}
        progressPercent={props.progressPercent}
        currentRepeat={props.currentRepeat}
        repeatCount={props.repeatCount}
        gapSeconds={props.gapSeconds}
        autoNext={props.autoNext}
        isWaitingGap={props.isWaitingGap}
        gapCountdown={props.gapCountdown}
        isLargeFile={props.isLargeFile}
        hasError={props.hasError}
        abLoop={props.abLoop}
        onSetA={props.onSetA}
        onSetB={props.onSetB}
        onClearAB={props.onClearAB}
        duration={props.duration}
        onUpdateAbLoop={props.onUpdateAbLoop}
        onSeek={props.onSeek}
      />

      {/* Toolbar Card (Playback Rate, Volume, Skip, Repeat, Gap, Auto-next) */}
      <ToolbarCard
        playbackRate={props.playbackRate}
        onPlaybackRateChange={props.onPlaybackRateChange}
        volume={props.volume}
        onVolumeChange={props.onVolumeChange}
        onToggleMute={props.onToggleMute}
        skipSeconds={props.skipSeconds}
        onSkipSecondsChange={props.onSkipSecondsChange}
        repeatCount={props.repeatCount}
        onRepeatCountChange={props.onRepeatCountChange}
        gapSeconds={props.gapSeconds}
        onGapSecondsChange={props.onGapSecondsChange}
        autoNext={props.autoNext}
        onAutoNextChange={props.onAutoNextChange}
      />

      {/* Keyboard Shortcuts Footer */}
      <ShortcutsFooter />
    </main>
  );
}
