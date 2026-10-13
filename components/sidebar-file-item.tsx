"use client";

import React from "react";
import { CheckCircle2, Star } from "lucide-react";
import { AudioFile } from "@/lib/file-system";
import { useI18n } from "@/lib/i18n";

interface SidebarFileItemProps {
  file: AudioFile;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onToggleStar: (id: string, e: React.MouseEvent) => void;
  ref?: React.Ref<HTMLButtonElement>;
}

export function SidebarFileItem({
  file,
  isSelected,
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
      className={`row-item flex items-center gap-2.5 w-full text-left py-2 px-3 rounded-xl text-sm shrink-0 cursor-pointer ${
        isSelected ? "on" : ""
      }`}
    >
      <span className="w-7 text-xs tabular-nums opacity-60 font-mono">
        {String(file.index).padStart(3, "0")}
      </span>
      <span className="flex-1 min-w-0 truncate font-medium">{file.name}</span>

      {file.listened && (
        <CheckCircle2
          className={`w-4 h-4 shrink-0 opacity-60 ${
            isSelected ? "text-white" : "text-[var(--text-primary)]"
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
        className={`p-0.5 rounded hover:opacity-80 ${
          file.starred ? "text-amber-500" : "opacity-20 hover:opacity-100"
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
