"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";

export function ShortcutsFooter() {
  const { t } = useI18n();

  const keys = [
    { key: "Space", label: t("shortcuts.space") },
    { key: "← →", label: t("shortcuts.arrowsLR") },
    { key: "↑ ↓", label: t("shortcuts.arrowsUD") },
    { key: "[ ]", label: t("shortcuts.brackets") },
    { key: "R", label: t("shortcuts.keyR") },
  ];

  return (
    <footer className="flex flex-wrap items-center gap-x-4.5 gap-y-2 text-[13px] text-[var(--text-secondary)]">
      {keys.map((k) => (
        <span key={k.key} className="inline-flex items-center gap-1.5 font-medium">
          <kbd className="font-mono text-xs px-2 py-0.5 border border-[var(--border-input)] border-b-2 rounded-md bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm">
            {k.key}
          </kbd>
          <span>{k.label}</span>
        </span>
      ))}
    </footer>
  );
}
