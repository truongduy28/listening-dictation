"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";

interface LanguageToggleProps {
  collapsed?: boolean;
  className?: string;
}

export function LanguageToggle({ collapsed = false, className = "" }: LanguageToggleProps) {
  const { language, setLanguage } = useI18n();

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setLanguage(language === "vi" ? "en" : "vi")}
        aria-label="Toggle language"
        className={`ghost w-12 h-12 rounded-[14px] text-[13px] font-bold cursor-pointer ${className}`}
      >
        {language.toUpperCase()}
      </button>
    );
  }

  return (
    <div
      className={`flex bg-[var(--bg-seg-container)] rounded-[9px] p-0.5 gap-0.5 ${className}`}
    >
      <button
        type="button"
        onClick={() => setLanguage("vi")}
        className={`seg-btn h-7 px-3 rounded-[7px] text-xs font-semibold cursor-pointer ${
          language === "vi" ? "on" : ""
        }`}
      >
        VI
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`seg-btn h-7 px-3 rounded-[7px] text-xs font-semibold cursor-pointer ${
          language === "en" ? "on" : ""
        }`}
      >
        EN
      </button>
    </div>
  );
}
