"use client";

import React from "react";
import { Folder } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface SidebarFolderCardProps {
  folderName: string;
  totalFiles: number;
  listenedCount: number;
  progressPercent: number;
  onChangeFolder: () => void;
}

export function SidebarFolderCard({
  folderName,
  totalFiles,
  listenedCount,
  progressPercent,
  onChangeFolder,
}: SidebarFolderCardProps) {
  const { t } = useI18n();

  return (
    <div className="bg-[var(--bg-subtle)] rounded-2xl p-3.5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-[38px] h-[38px] rounded-[11px] bg-[var(--bg-card)] flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
          <Folder className="w-5 h-5 text-[var(--text-primary)]" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate">
            {folderName || t("folder.noFolder")}
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-0.5">
            {t("folder.filesCount", { count: totalFiles, listened: listenedCount })}
          </div>
        </div>
        <button
          type="button"
          onClick={onChangeFolder}
          className="ghost h-[30px] px-2.5 rounded-lg text-[13px] font-medium cursor-pointer"
        >
          {t("folder.change")}
        </button>
      </div>

      {/* Folder progress bar */}
      <div className="h-1 rounded-sm bg-[var(--border-default)] overflow-hidden">
        <div
          style={{ width: `${progressPercent}%` }}
          className="h-1 rounded-sm bg-[var(--accent-btn)] transition-all duration-300"
        />
      </div>
    </div>
  );
}
