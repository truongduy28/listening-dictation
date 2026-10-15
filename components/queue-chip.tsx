"use client";

import React from "react";
import { Star, Layers, Headphones, CheckCircle2, Search } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { FilterType } from "@/components/sidebar";

interface QueueChipProps {
  filter: FilterType;
  searchQuery: string;
  count: number;
  onClick?: () => void;
}

export function QueueChip({
  filter,
  searchQuery,
  count,
  onClick,
}: QueueChipProps) {
  const { t } = useI18n();

  const isSearching = searchQuery.trim().length > 0;

  // Determine icon & label
  let icon = <Layers className="w-3.5 h-3.5 text-[var(--text-secondary)]" strokeWidth={1.8} />;
  let filterLabel = t("queue.filterAll");

  if (isSearching) {
    icon = <Search className="w-3.5 h-3.5 text-[var(--text-secondary)]" strokeWidth={1.8} />;
    filterLabel = t("queue.search", { query: searchQuery.trim() });
  } else if (filter === "starred") {
    icon = <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" strokeWidth={1.8} />;
    filterLabel = t("queue.filterStarred");
  } else if (filter === "unheard") {
    icon = <Headphones className="w-3.5 h-3.5 text-sky-500" strokeWidth={1.8} />;
    filterLabel = t("queue.filterUnheard");
  } else if (filter === "listened") {
    icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.8} />;
    filterLabel = t("queue.filterListened");
  }

  const tracksText = t("queue.tracksCount", { count });
  const displayText = `${t("queue.chipLabel")}: ${filterLabel} · ${tracksText}`;

  return (
    <button
      type="button"
      onClick={onClick}
      title={t("queue.jumpToQueue")}
      aria-label={displayText}
      className="inline-flex items-center gap-1.5 mt-2 h-7 px-3 rounded-full bg-[var(--bg-card)] border border-[var(--border-default)] text-[12.5px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:shadow-xs transition-all duration-150 cursor-pointer select-none active:scale-95"
    >
      {icon}
      <span className="truncate max-w-[280px] sm:max-w-md">{displayText}</span>
    </button>
  );
}
