"use client";

import React from "react";
import {
  PanelLeftOpen,
  Folder,
  Search,
  Star,
  RotateCcw,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { AppBrand } from "@/components/ui/app-brand";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { InstallButton } from "@/components/pwa/install-button";
import { FilterType } from "@/lib/queue";

interface SidebarCollapsedProps {
  onToggleCollapse: () => void;
  onChangeFolder: () => void;
  onFilterChange: (filter: FilterType) => void;
  onReset: () => void;
}

export function SidebarCollapsed({
  onToggleCollapse,
  onChangeFolder,
  onFilterChange,
  onReset,
}: SidebarCollapsedProps) {
  const { t } = useI18n();

  return (
    <aside className="w-[72px] shrink-0 h-screen sticky top-0 box-border bg-[var(--bg-sidebar)] border-r border-[var(--border-default)] py-4 flex flex-col items-center gap-1.5 transition-all duration-200">
      <AppBrand showTitle={false} size="md" className="mb-2.5" />

      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label={t("app.expandSidebarAria")}
        className="ghost w-12 h-12 rounded-[14px] flex items-center justify-center cursor-pointer"
      >
        <PanelLeftOpen className="w-[22px] h-[22px]" strokeWidth={1.8} />
      </button>

      <button
        type="button"
        onClick={onChangeFolder}
        aria-label={t("app.folderSettingsAria")}
        className="ghost w-12 h-12 rounded-[14px] flex items-center justify-center cursor-pointer"
      >
        <Folder className="w-[22px] h-[22px]" strokeWidth={1.8} />
      </button>

      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label={t("folder.searchAria")}
        className="ghost w-12 h-12 rounded-[14px] flex items-center justify-center cursor-pointer"
      >
        <Search className="w-[22px] h-[22px]" strokeWidth={1.9} />
      </button>

      <button
        type="button"
        onClick={() => {
          onFilterChange("starred");
          onToggleCollapse();
        }}
        aria-label={t("folder.filterStarred")}
        className="ghost w-12 h-12 rounded-[14px] flex items-center justify-center cursor-pointer"
      >
        <Star className="w-[22px] h-[22px]" strokeWidth={1.8} />
      </button>

      <div className="mt-auto flex flex-col items-center gap-1.5">
        <LanguageToggle collapsed />

        <InstallButton collapsed />

        <button
          type="button"
          onClick={onReset}
          aria-label={t("reset.dialogTitle")}
          className="ghost w-12 h-12 rounded-[14px] flex items-center justify-center cursor-pointer text-[var(--text-secondary)] hover:text-red-500"
        >
          <RotateCcw className="w-[20px] h-[20px]" strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  );
}
