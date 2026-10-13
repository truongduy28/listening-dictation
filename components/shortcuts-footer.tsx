"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";

export function ShortcutsFooter() {
  const { t } = useI18n();
  const [activeKey, setActiveKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const active = document.activeElement;
      if (
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.tagName === "SELECT" ||
          (active as HTMLElement).isContentEditable)
      ) {
        return;
      }

      let keyId: string | null = null;
      if (e.code === "Space") keyId = "Space";
      else if (e.key === "ArrowLeft" || e.key === "ArrowRight") keyId = "← →";
      else if (e.key === "ArrowUp" || e.key === "ArrowDown") keyId = "↑ ↓";
      else if (e.key === "[" || e.key === "]" || e.code === "BracketLeft" || e.code === "BracketRight") keyId = "[ ]";
      else if (e.key === "r" || e.key === "R" || e.code === "KeyR") keyId = "R";

      if (keyId) {
        setActiveKey(keyId);
        setTimeout(() => setActiveKey(null), 250);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const keys = [
    { key: "Space", label: t("shortcuts.space") },
    { key: "← →", label: t("shortcuts.arrowsLR") },
    { key: "↑ ↓", label: t("shortcuts.arrowsUD") },
    { key: "[ ]", label: t("shortcuts.brackets") },
    { key: "R", label: t("shortcuts.keyR") },
  ];

  return (
    <footer
      aria-label="Gợi ý phím tắt điều khiển"
      className="flex flex-wrap items-center gap-x-4.5 gap-y-2 text-[13px] text-[var(--text-secondary)] select-none"
    >
      {keys.map((k) => {
        const isHot = activeKey === k.key;
        return (
          <span key={k.key} className="inline-flex items-center gap-1.5 font-medium transition-colors">
            <kbd
              className={`font-mono text-xs px-2 py-0.5 border rounded-md transition-all duration-150 ${
                isHot
                  ? "bg-[var(--accent-btn)] text-[var(--accent-btn-text)] border-[var(--accent-btn)] scale-110 shadow-md ring-2 ring-[var(--accent-btn)]/25"
                  : "border-[var(--border-input)] border-b-2 bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
              }`}
            >
              {k.key}
            </kbd>
            <span className={isHot ? "text-[var(--text-primary)] font-semibold" : ""}>
              {k.label}
            </span>
          </span>
        );
      })}
    </footer>
  );
}
