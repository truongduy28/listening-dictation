"use client";

import React, { useState } from "react";
import { Download, Info, X } from "lucide-react";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { useI18n } from "@/lib/i18n";
import { Modal } from "@/components/ui/modal";

interface InstallButtonProps {
  collapsed?: boolean;
  className?: string;
}

export function InstallButton({ collapsed = false, className = "" }: InstallButtonProps) {
  const { canInstall, hasNativePrompt, isSafari, promptInstall } = usePwaInstall();
  const { t } = useI18n();
  const [showSafariGuide, setShowSafariGuide] = useState<boolean>(false);

  if (!canInstall) {
    return null;
  }

  const handleClick = async () => {
    if (hasNativePrompt) {
      await promptInstall();
    } else if (isSafari) {
      setShowSafariGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        title={t("pwa.installApp")}
        aria-label={t("pwa.installApp")}
        className={`w-full h-9 px-3 rounded-[12px] bg-[var(--surface-sunken)] hover:bg-[var(--line)] border border-[var(--border-default)] flex items-center ${
          collapsed ? "justify-center" : "justify-start gap-2"
        } text-[13px] font-medium text-[var(--text-primary)] transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-2xs select-none ${className}`}
      >
        <Download className="w-4 h-4 text-[var(--text-secondary)] shrink-0" strokeWidth={2} />
        {!collapsed && <span className="truncate">{t("pwa.installApp")}</span>}
      </button>

      {/* Safari Add to Dock Guidance Modal */}
      {isSafari && (
        <Modal
          isOpen={showSafariGuide}
          onClose={() => setShowSafariGuide(false)}
          maxWidth="max-w-[380px]"
          ariaLabelledBy="safari-install-title"
          className="flex flex-col gap-4 text-[var(--text-primary)]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-[var(--focus)]" strokeWidth={2} />
              <h2 id="safari-install-title" className="m-0 text-base font-semibold tracking-tight">
                {t("pwa.installSafariTitle")}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowSafariGuide(false)}
              className="ghost w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-sm leading-relaxed text-[var(--text-secondary)] bg-[var(--bg-subtle)] p-3.5 rounded-xl border border-[var(--border-default)]">
            {t("pwa.installPromptSafari")}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowSafariGuide(false)}
              className="h-8 px-4 rounded-xl bg-[var(--accent-btn)] text-[var(--accent-btn-text)] text-xs font-semibold cursor-pointer active:scale-95"
            >
              OK
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
