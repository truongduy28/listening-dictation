"use client";

import React from "react";
import { Star, Keyboard } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { AudioFile } from "@/lib/file-system";
import { FilterType } from "@/components/sidebar";
import { QueueChip } from "@/components/queue-chip";
import { OfflineBadge } from "@/components/pwa/offline-badge";

interface TrackHeaderProps {
  currentFile: AudioFile | null;
  queueIndex: number;
  queueTotal: number;
  filter: FilterType;
  searchQuery: string;
  onToggleStar: () => void;
  onOpenShortcuts: () => void;
  onQueueClick?: () => void;
}

export function TrackHeader({
  currentFile,
  queueIndex,
  queueTotal,
  filter,
  searchQuery,
  onToggleStar,
  onOpenShortcuts,
  onQueueClick,
}: TrackHeaderProps) {
  const { t } = useI18n();

  const counterText =
    queueTotal === 0
      ? "0 / 0"
      : queueIndex > 0
      ? t("app.playingOf", {
          current: queueIndex,
          total: queueTotal,
        })
      : `– / ${queueTotal}`;

  return (
    <header
      aria-label={t("app.trackHeaderAria")}
      className="flex items-start justify-between gap-4 flex-wrap"
    >
      <div className="flex-1 min-w-0">
        <div className="text-[13px] text-[var(--text-secondary)] font-medium tabular-nums">
          {counterText}
        </div>
        <h1 className="mt-0.5 mb-0 text-2xl md:text-[30px] leading-tight font-semibold tracking-[-0.02em] truncate">
          {currentFile?.name || t("folder.noFileActive")}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <QueueChip
            filter={filter}
            searchQuery={searchQuery}
            count={queueTotal}
            onClick={onQueueClick}
          />
          <OfflineBadge />
        </div>
      </div>

      <div className="flex gap-1.5 shrink-0 pt-1">
        {/* Star toggle */}
        <button
          type="button"
          disabled={!currentFile}
          onClick={onToggleStar}
          aria-label={t("app.starAria")}
          className={`ghost w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-150 active:scale-125 hover:scale-110 disabled:opacity-30 disabled:scale-100 ${
            currentFile?.starred ? "text-amber-500 shadow-sm bg-amber-500/10" : "hover:text-amber-500"
          }`}
        >
          <Star
            className="w-[22px] h-[22px]"
            fill={currentFile?.starred ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.8}
          />
        </button>

        {/* View keyboard shortcuts */}
        <button
          type="button"
          onClick={onOpenShortcuts}
          aria-label={t("app.shortcutsAria")}
          className="ghost w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-150 active:scale-95 hover:scale-105"
        >
          <Keyboard className="w-[22px] h-[22px]" strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}
