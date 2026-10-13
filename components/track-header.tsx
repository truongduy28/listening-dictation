"use client";

import React from "react";
import { Star, Keyboard } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { AudioFile } from "@/lib/file-system";

interface TrackHeaderProps {
  currentFile: AudioFile | null;
  totalFiles: number;
  onToggleStar: () => void;
  onOpenShortcuts: () => void;
}

export function TrackHeader({
  currentFile,
  totalFiles,
  onToggleStar,
  onOpenShortcuts,
}: TrackHeaderProps) {
  const { t } = useI18n();

  return (
    <header className="flex items-end justify-between gap-4 flex-wrap">
      <div>
        <div className="text-[13px] text-[var(--text-secondary)] font-medium">
          {totalFiles > 0
            ? t("app.playingOf", {
                current: currentFile?.index || 1,
                total: totalFiles,
              })
            : "0 / 0"}
        </div>
        <h1 className="mt-0.5 mb-0 text-2xl md:text-[30px] leading-tight font-semibold tracking-[-0.02em]">
          {currentFile?.name || t("folder.noFileActive")}
        </h1>
      </div>

      <div className="flex gap-1">
        {/* Star toggle */}
        <button
          type="button"
          disabled={!currentFile}
          onClick={onToggleStar}
          aria-label={t("app.starAria")}
          className={`ghost w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer disabled:opacity-30 ${
            currentFile?.starred ? "text-amber-500" : ""
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
          className="ghost w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer"
        >
          <Keyboard className="w-[22px] h-[22px]" strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}
