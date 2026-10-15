"use client";

import React from "react";
import { CheckCircle2, Star } from "lucide-react";
import { AudioFile } from "@/lib/file-system";
import { useI18n } from "@/lib/i18n";

interface SidebarFileItemProps {
  file: AudioFile;
  isSelected: boolean;
  isPlaying?: boolean;
  onSelect: (id: string) => void;
  onToggleStar: (id: string, e: React.MouseEvent) => void;
  ref?: React.Ref<HTMLButtonElement>;
}

export function SidebarFileItem({
  file,
  isSelected,
  isPlaying = false,
  onSelect,
  onToggleStar,
  ref,
}: SidebarFileItemProps) {
  const { t } = useI18n();

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onSelect(file.id)}
      className={`row-item flex items-center gap-2.5 w-full text-left py-2 px-3 rounded-xl text-sm shrink-0 cursor-pointer transition-all duration-150 active:scale-[0.99] ${
        isSelected ? "on shadow-sm" : "hover:bg-[var(--bg-subtle)]"
      }`}
    >
      <span className="w-7 flex items-center justify-start shrink-0">
        {isSelected && isPlaying ? (
          <span className="flex items-end gap-[2px] h-3.5 w-3.5 shrink-0 pb-0.5" aria-label={t("app.nowPlaying")}>
            <span className="w-[2px] bg-current rounded-full animate-eq-1" />
            <span className="w-[2px] bg-current rounded-full animate-eq-2" />
            <span className="w-[2px] bg-current rounded-full animate-eq-3" />
          </span>
        ) : (
          <span className="text-xs tabular-nums opacity-60 font-mono">
            {String(file.index).padStart(3, "0")}
          </span>
        )}
      </span>
      <span className="flex-1 min-w-0 truncate font-medium">{file.name}</span>

      {file.listened && (
        <CheckCircle2
          className={`w-4 h-4 shrink-0 transition-opacity ${
            isSelected ? "text-white opacity-90" : "text-[var(--text-secondary)] opacity-60"
          }`}
          strokeWidth={2}
        />
      )}

      <span
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          onToggleStar(file.id, e);
        }}
        className={`p-1 rounded-md transition-all duration-150 active:scale-125 cursor-pointer ${
          file.starred
            ? "text-amber-500 hover:scale-110"
            : "opacity-25 hover:opacity-100 hover:text-amber-500"
        }`}
        aria-label={t("app.starAria")}
      >
        <Star
          className="w-4 h-4 shrink-0"
          fill={file.starred ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.8}
        />
      </span>
    </button>
  );
}
