"use client";

import React from "react";
import { Sparkles, RefreshCw, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface UpdateToastProps {
  isOpen: boolean;
  onApplyUpdate: () => void;
  onDismiss: () => void;
}

export function UpdateToast({
  isOpen,
  onApplyUpdate,
  onDismiss,
}: UpdateToastProps) {
  const { t } = useI18n();

  if (!isOpen) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-[calc(100vw-3rem)] rounded-2xl bg-[var(--bg-card)]/95 backdrop-blur-xl border border-[var(--border-default)] p-4 shadow-[0_12px_36px_rgba(0,0,0,0.18)] flex items-center justify-between gap-3.5 animate-modal-pop text-[var(--text-primary)]"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[var(--accent-btn)]/10 text-[var(--text-primary)] flex items-center justify-center shrink-0">
          <Sparkles className="w-4.5 h-4.5" strokeWidth={2} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[14px] font-semibold tracking-tight truncate">
            {t("pwa.updateAvailable")}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onApplyUpdate}
          className="h-8 px-3.5 rounded-xl bg-[var(--accent-btn)] text-[var(--accent-btn-text)] text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" strokeWidth={2.2} />
          <span>{t("pwa.reload")}</span>
        </button>

        <button
          type="button"
          onClick={onDismiss}
          title={t("pwa.dismiss")}
          aria-label={t("pwa.dismiss")}
          className="ghost w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
