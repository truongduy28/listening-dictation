"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";

interface AppBrandProps {
  showTitle?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function AppBrand({
  showTitle = true,
  size = "sm",
  className = "",
}: AppBrandProps) {
  const { t } = useI18n();

  const iconDim = size === "md" ? "w-9 h-9 rounded-[10px]" : "w-8 h-8 rounded-[9px]";
  const svgDim = size === "md" ? 20 : 18;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`${iconDim} bg-[var(--accent-btn)] flex items-center justify-center shrink-0`}
      >
        <svg
          width={svgDim}
          height={svgDim}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M5 10v4M9 6v12M13 9v6M17 4v16M21 11v2" />
        </svg>
      </div>
      {showTitle && (
        <span className="text-[17px] font-semibold tracking-tight">
          {t("app.title")}
        </span>
      )}
    </div>
  );
}
