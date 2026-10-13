"use client";

import React, { useRef, useEffect } from "react";
import {
  SlidersHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Folder,
  Search,
  Star,
  RotateCcw,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { AudioFile } from "@/lib/file-system";
import { AppBrand } from "@/components/ui/app-brand";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SidebarFileItem } from "@/components/sidebar-file-item";

export type FilterType = "all" | "unheard" | "listened" | "starred";

interface SidebarProps {
  folderName: string;
  totalFiles: number;
  listenedCount: number;
  files: AudioFile[];
  currentFileId: string | null;
  onSelectFile: (id: string) => void;
  onToggleStar: (id: string, e: React.MouseEvent) => void;
  onChangeFolder: () => void;
  onReset: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  filter: FilterType;
  onFilterChange: (f: FilterType) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isLoading?: boolean;
}

export function Sidebar({
  folderName,
  totalFiles,
  listenedCount,
  files,
  currentFileId,
  onSelectFile,
  onToggleStar,
  onChangeFolder,
  onReset,
  collapsed,
  onToggleCollapse,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  isLoading = false,
}: SidebarProps) {
  const { t } = useI18n();

  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  // Automatically scroll active file into view
  useEffect(() => {
    if (collapsed || !currentFileId) return;

    const timer = setTimeout(() => {
      const container = listContainerRef.current;
      const item = activeItemRef.current;
      if (!container || !item) return;

      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      const itemTop = item.offsetTop;
      const itemBottom = itemTop + item.offsetHeight;

      // If item is out of view, scroll smoothly to center it
      if (itemTop < containerTop || itemBottom > containerBottom) {
        const targetScroll = itemTop - container.clientHeight / 2 + item.offsetHeight / 2;
        container.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: "smooth",
        });
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [currentFileId, files.length, collapsed, filter, searchQuery]);

  const progressPercent = totalFiles > 0 ? Math.round((listenedCount / totalFiles) * 100) : 0;

  const filterOptions = [
    { value: "all" as FilterType, label: t("folder.filterAll") },
    { value: "unheard" as FilterType, label: t("folder.filterUnheard") },
    { value: "listened" as FilterType, label: t("folder.filterListened") },
    { value: "starred" as FilterType, label: t("folder.filterStarred") },
  ];

  // Render Collapsed Sidebar (Template D)
  if (collapsed) {
    return (
      <aside className="w-[72px] shrink-0 box-border bg-[var(--bg-sidebar)] border-r border-[var(--border-default)] py-4 flex flex-col items-center gap-1.5 transition-all duration-200">
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

          <button
            type="button"
            onClick={onReset}
            aria-label={t("reset.button")}
            className="ghost w-12 h-12 rounded-[14px] flex items-center justify-center text-[var(--danger)] cursor-pointer"
          >
            <RotateCcw className="w-[22px] h-[22px]" strokeWidth={1.9} />
          </button>
        </div>
      </aside>
    );
  }

  // Render Full Expanded Sidebar (Template A & B)
  return (
    <aside className="w-80 shrink-0 max-w-full box-border bg-[var(--bg-sidebar)] border-r border-[var(--border-default)] p-4 pt-5 pb-4 flex flex-col gap-4 transition-all duration-200">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between">
        <AppBrand />

        <div className="flex gap-0.5">
          <button
            type="button"
            onClick={onChangeFolder}
            aria-label={t("app.folderSettingsAria")}
            className="ghost w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer"
          >
            <SlidersHorizontal className="w-5 h-5" strokeWidth={1.8} />
          </button>
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={t("app.collapseSidebarAria")}
            className="ghost w-9 h-9 rounded-[10px] flex items-center justify-center cursor-pointer"
          >
            <PanelLeftClose className="w-5 h-5" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Folder status card */}
      <div className="bg-[var(--bg-subtle)] rounded-2xl p-3.5 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-[38px] h-[38px] rounded-[11px] bg-[var(--bg-card)] flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
            <Folder className="w-5 h-5 text-[var(--text-primary)]" strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">
              {folderName || t("folder.noFolder")}
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">
              {t("folder.filesCount", { count: totalFiles, listened: listenedCount })}
            </div>
          </div>
          <button
            type="button"
            onClick={onChangeFolder}
            className="ghost h-[30px] px-2.5 rounded-lg text-[13px] font-medium cursor-pointer"
          >
            {t("folder.change")}
          </button>
        </div>

        {/* Folder progress bar */}
        <div className="h-1 rounded-sm bg-[var(--border-default)] overflow-hidden">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-1 rounded-sm bg-[var(--accent-btn)] transition-all duration-300"
          />
        </div>
      </div>

      {/* Search Input */}
      <label className="flex items-center gap-2 h-[38px] px-3 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
        <Search className="w-4 h-4 shrink-0" strokeWidth={2} />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("folder.searchPlaceholder")}
          aria-label={t("folder.searchAria")}
          className="flex-1 min-w-0 border-0 bg-transparent outline-none font-inherit text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
        />
      </label>

      {/* Filter Tabs (Segmented control) */}
      <SegmentedControl
        options={filterOptions}
        value={filter}
        onChange={onFilterChange}
      />

      {/* File List */}
      <div
        ref={listContainerRef}
        className="relative flex-1 min-h-0 max-h-[470px] overflow-y-auto flex flex-col gap-0.5 -mx-1 px-1"
      >
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-[var(--text-secondary)]">
            <div className="w-5 h-5 border-2 border-[var(--border-default)] border-t-[var(--accent-btn)] rounded-full animate-spin" />
            <span>{t("folder.loading")}</span>
          </div>
        ) : files.length === 0 ? (
          <div className="py-10 text-center text-xs text-[var(--text-secondary)]">
            {totalFiles === 0 ? t("folder.noFiles") : t("folder.emptyList")}
          </div>
        ) : (
          files.map((f) => {
            const isSelected = f.id === currentFileId;
            return (
              <SidebarFileItem
                key={f.id}
                ref={isSelected ? activeItemRef : undefined}
                file={f}
                isSelected={isSelected}
                onSelect={onSelectFile}
                onToggleStar={onToggleStar}
              />
            );
          })
        )}
      </div>

      {/* Bottom Footer: Language & Reset */}
      <div className="mt-auto flex items-center justify-between pt-1">
        <LanguageToggle />

        <button
          type="button"
          onClick={onReset}
          className="ghost h-[34px] px-3 rounded-[10px] flex items-center gap-1.5 text-[13px] font-medium text-[var(--danger)] cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" strokeWidth={2} />
          {t("reset.button")}
        </button>
      </div>
    </aside>
  );
}
