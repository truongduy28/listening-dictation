"use client";

import React from "react";
import { Keyboard, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Modal } from "@/components/ui/modal";

interface ShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsDialog({ isOpen, onClose }: ShortcutsDialogProps) {
  const { t } = useI18n();

  const shortcutsList = [
    { key: "Space", desc: t("shortcuts.space") },
    { key: "← / →", desc: t("shortcuts.arrowsLR") },
    { key: "↑ / ↓", desc: t("shortcuts.arrowsUD") },
    { key: "[ / ]", desc: t("shortcuts.brackets") },
    { key: "R", desc: t("shortcuts.keyR") },
    { key: "S", desc: t("shortcuts.keyS") },
    { key: "M", desc: t("shortcuts.keyM") },
    { key: "A / B", desc: t("shortcuts.abLoop") },
    { key: "X", desc: t("shortcuts.clearAb") },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-[380px]"
      ariaLabelledBy="shortcuts-title"
      className="flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Keyboard className="w-5 h-5 text-[var(--text-primary)]" strokeWidth={1.8} />
          <h2 id="shortcuts-title" className="m-0 text-lg font-semibold tracking-tight">
            {t("app.shortcutsAria")}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ghost w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {shortcutsList.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between py-1.5 border-b border-[var(--border-default)] last:border-b-0"
          >
            <span className="text-sm text-[var(--text-secondary)]">{item.desc}</span>
            <kbd className="font-mono text-xs px-2.5 py-1 border border-[var(--border-input)] border-b-2 rounded-md bg-[var(--bg-subtle)] text-[var(--text-primary)] shadow-sm font-semibold">
              {item.key}
            </kbd>
          </div>
        ))}
      </div>
    </Modal>
  );
}
