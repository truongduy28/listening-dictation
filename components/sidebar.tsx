"use client";

import React, { useRef, useEffect } from "react";
import {
  SlidersHorizontal,
  PanelLeftClose,
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
import { InstallButton } from "@/components/pwa/install-button";
import { SidebarCollapsed } from "@/components/sidebar-collapsed";
import { SidebarFolderCard } from "@/components/sidebar-folder-card";

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
  isPlaying?: boolean;
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
  isPlaying = false,
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
      <SidebarCollapsed
        onToggleCollapse={onToggleCollapse}
        onChangeFolder={onChangeFolder}
        onFilterChange={onFilterChange}
        onReset={onReset}
      />
    );
  }

  // Render Full Expanded Sidebar (Template A & B)
  return (
    <aside className="w-80 shrink-0 max-w-full h-screen sticky top-0 box-border bg-[var(--bg-sidebar)] border-r border-[var(--border-default)] p-4 pt-5 pb-4 flex flex-col gap-4 transition-all duration-200">
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
      <SidebarFolderCard
        folderName={folderName}
        totalFiles={totalFiles}
        listenedCount={listenedCount}
        progressPercent={progressPercent}
        onChangeFolder={onChangeFolder}
      />

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
      <nav
        ref={listContainerRef}
        aria-label={t("app.audioListAria")}
        className="relative flex-1 min-h-0 overflow-y-auto flex flex-col gap-0.5 -mx-1 px-1"
      >
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-[var(--text-secondary)]">
            <div className="w-5 h-5 border-2 border-[var(--border-default)] border-t-[var(--accent-btn)] rounded-full animate-spin" />
            <span>{t("folder.loading")}</span>
          </div>
        ) : files.length === 0 ? (
          <div className="py-10 px-4 flex flex-col items-center justify-center text-center gap-2 text-xs text-[var(--text-secondary)] animate-fadeIn">
            {totalFiles === 0 ? (
              <span>{t("folder.noFiles")}</span>
            ) : searchQuery.trim() ? (
              <span>{t("folder.emptySearch")}</span>
            ) : filter === "starred" ? (
              <>
                <Star className="w-6 h-6 text-amber-500/50" strokeWidth={1.5} />
                <span className="leading-relaxed max-w-[200px]">{t("folder.emptyStarred")}</span>
              </>
            ) : filter === "unheard" ? (
              <span className="leading-relaxed max-w-[200px]">{t("folder.emptyUnheard")}</span>
            ) : filter === "listened" ? (
              <span className="leading-relaxed max-w-[200px]">{t("folder.emptyListened")}</span>
            ) : (
              <span>{t("folder.emptyList")}</span>
            )}
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
                isPlaying={isSelected && isPlaying}
                onSelect={onSelectFile}
                onToggleStar={onToggleStar}
              />
            );
          })
        )}
      </nav>

      {/* Install PWA Button (Chrome/Edge prompt or Safari Dock guide) */}
      <div className="mt-auto pt-2 pb-1">
        <InstallButton collapsed={collapsed} />
      </div>

      {/* Bottom Footer: Language & Reset */}
      <div className="flex items-center justify-between pt-1">
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
