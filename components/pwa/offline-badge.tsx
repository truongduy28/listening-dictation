"use client";

import React from "react";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useI18n } from "@/lib/i18n";

interface OfflineBadgeProps {
  className?: string;
}

export function OfflineBadge({ className = "" }: OfflineBadgeProps) {
  const isOnline = useOnlineStatus();
  const { t } = useI18n();

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-[var(--surface-sunken)] border border-[var(--border-default)] text-xs font-semibold text-[var(--text-secondary)] shadow-xs select-none transition-opacity duration-150 animate-fadeIn ${className}`}
    >
      <WifiOff className="w-3.5 h-3.5 text-[var(--text-secondary)]" strokeWidth={2} />
      <span>{t("pwa.offline")}</span>
    </div>
  );
}
