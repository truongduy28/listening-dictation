"use client";

import React from "react";
import { Sidebar } from "@/components/sidebar";
import { AppMainWorkspace } from "@/components/app-main-workspace";
import { ResetDialog } from "@/components/reset-dialog";
import { ShortcutsDialog } from "@/components/shortcuts-dialog";
import { UpdateToast } from "@/components/pwa/update-toast";
import { AudioFile } from "@/lib/file-system";
import { FilterType, QueueStatus } from "@/lib/queue";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { usePlayerSettings } from "@/hooks/use-player-settings";
import { useRepeatController } from "@/hooks/use-repeat-controller";
import { AbLoop } from "@/lib/abLoop";
import { DictationActions } from "@/hooks/use-dictation-actions";

export type { DictationActions };

export interface DictationLayoutProps {
  // Folder / file library
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  folderName: string;
  totalFiles: number;
  listenedCount: number;
  files: AudioFile[];
  currentFileId: string | null;
  currentFile: AudioFile | null;
  isLoading: boolean;
  permissionNeeded: boolean;
  grantPermission: () => Promise<void>;
  openFolder: () => void;
  toggleStar: (id: string) => void;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;

  // Queue
  queueStatus: QueueStatus;
  onSelectFile: (id: string, autoPlay?: boolean) => void;
  onPrev: () => void;
  onNext: () => void;

  // Player & controllers
  player: ReturnType<typeof useAudioPlayer>;
  settings: ReturnType<typeof usePlayerSettings>;
  repeatCtrl: ReturnType<typeof useRepeatController>;
  actions: DictationActions;
  abLoop: AbLoop;

  // Sidebar & dialogs
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  openSidebar: () => void;
  isResetOpen: boolean;
  onOpenReset: () => void;
  onCloseReset: () => void;
  onConfirmReset: () => void;
  isShortcutsOpen: boolean;
  onOpenShortcuts: () => void;
  onCloseShortcuts: () => void;
  hasUpdate: boolean;
  applyUpdate: () => void;
  dismissUpdate: () => void;
}

export function DictationLayout({
  fileInputRef,
  handleFileInputChange,
  folderName,
  totalFiles,
  listenedCount,
  files,
  currentFileId,
  currentFile,
  isLoading,
  permissionNeeded,
  grantPermission,
  openFolder,
  toggleStar,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  queueStatus,
  onSelectFile,
  onPrev,
  onNext,
  player,
  settings,
  repeatCtrl,
  actions,
  abLoop,
  sidebarCollapsed,
  onToggleSidebar,
  openSidebar,
  isResetOpen,
  onOpenReset,
  onCloseReset,
  onConfirmReset,
  isShortcutsOpen,
  onOpenShortcuts,
  onCloseShortcuts,
  hasUpdate,
  applyUpdate,
  dismissUpdate,
}: DictationLayoutProps) {
  return (
    <div className="w-full min-h-screen box-border flex bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-200">
      <input
        ref={fileInputRef}
        type="file"
        // @ts-expect-error webkitdirectory is standard for folder inputs
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      <Sidebar
        folderName={folderName}
        totalFiles={totalFiles}
        listenedCount={listenedCount}
        files={files}
        currentFileId={currentFileId}
        onSelectFile={onSelectFile}
        onToggleStar={toggleStar}
        onChangeFolder={openFolder}
        onReset={onOpenReset}
        collapsed={sidebarCollapsed}
        onToggleCollapse={onToggleSidebar}
        filter={filter}
        onFilterChange={onFilterChange}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        isLoading={isLoading}
        isPlaying={player.isPlaying}
      />

      <AppMainWorkspace
        folderName={folderName}
        permissionNeeded={permissionNeeded}
        grantPermission={grantPermission}
        currentFile={currentFile}
        queueStatus={queueStatus}
        filter={filter}
        searchQuery={searchQuery}
        onToggleStarCurrent={actions.onToggleStarCurrent}
        onOpenShortcuts={onOpenShortcuts}
        onQueueClick={openSidebar}
        waveformContainerRef={player.waveformContainerRef}
        isPlaying={player.isPlaying}
        isPlayerDisabled={!currentFile || (files.length === 0 && !player.isPlaying)}
        onTogglePlay={actions.onTogglePlay}
        onReplay={actions.onReplay}
        onPrev={onPrev}
        onNext={onNext}
        onRewind={actions.onRewind}
        onForward={actions.onForward}
        onSeekPercent={(ratio) => {
          repeatCtrl.clearGapTimer();
          player.seekToPercent(ratio);
        }}
        onSeek={(t) => {
          repeatCtrl.clearGapTimer();
          player.seek(t);
        }}
        currentTimeFormatted={player.currentTimeFormatted}
        totalTimeFormatted={player.totalTimeFormatted}
        progressPercent={player.progressPercent}
        duration={player.duration}
        isLargeFile={player.isLargeFile}
        hasError={player.hasError}
        currentRepeat={repeatCtrl.currentRepeat}
        repeatCount={settings.repeatCount}
        gapSeconds={settings.gapSeconds}
        autoNext={settings.autoNext}
        isWaitingGap={repeatCtrl.isWaitingGap}
        gapCountdown={repeatCtrl.gapCountdown}
        abLoop={abLoop}
        onSetA={actions.onSetA}
        onSetB={actions.onSetB}
        onClearAB={actions.onClearAB}
        onUpdateAbLoop={actions.onUpdateAbLoop}
        playbackRate={settings.playbackRate}
        onPlaybackRateChange={settings.setPlaybackRate}
        volume={settings.volume}
        onVolumeChange={settings.handleVolumeChange}
        onToggleMute={settings.handleToggleMute}
        skipSeconds={settings.skipSeconds}
        onSkipSecondsChange={settings.setSkipSeconds}
        onRepeatCountChange={settings.setRepeatCount}
        onGapSecondsChange={settings.setGapSeconds}
        onAutoNextChange={settings.setAutoNext}
      />

      <ResetDialog
        isOpen={isResetOpen}
        onClose={onCloseReset}
        onConfirm={onConfirmReset}
      />

      <ShortcutsDialog
        isOpen={isShortcutsOpen}
        onClose={onCloseShortcuts}
      />

      <UpdateToast
        isOpen={hasUpdate}
        onApplyUpdate={applyUpdate}
        onDismiss={dismissUpdate}
      />
    </div>
  );
}
