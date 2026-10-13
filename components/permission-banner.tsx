"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface PermissionBannerProps {
  folderName: string;
  onGrant: () => void;
}

export function PermissionBanner({ folderName, onGrant }: PermissionBannerProps) {
  const { t } = useI18n();

  return (
    <div className="bg-[var(--bg-card)] border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
        <span className="text-sm text-[var(--text-primary)]">
          {t("permission.desc", { folder: folderName })}
        </span>
      </div>
      <button
        type="button"
        onClick={onGrant}
        className="cta-btn h-9 px-4 rounded-xl bg-[var(--accent-btn)] text-[var(--accent-btn-text)] text-xs font-semibold shrink-0 cursor-pointer"
      >
        {t("permission.grant")}
      </button>
    </div>
  );
}
