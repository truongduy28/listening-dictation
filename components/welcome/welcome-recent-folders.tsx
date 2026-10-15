"use client";

import React, { useSyncExternalStore } from "react";
import { useI18n } from "@/lib/i18n";
import { RecentFolder } from "@/lib/storage";

interface WelcomeRecentFoldersProps {
  recentFolders: RecentFolder[];
  onOpenFolder?: () => void;
}

let cachedNow = 0;
function subscribeNow(callback: () => void): () => void {
  const timer = setInterval(() => {
    cachedNow = Date.now();
    callback();
  }, 60000);
  return () => clearInterval(timer);
}
function getClientNow(): number {
  if (typeof window === "undefined") return 0;
  if (!cachedNow) {
    cachedNow = Date.now();
  }
  return cachedNow;
}
function getServerNow(): number {
  return 0;
}

export function WelcomeRecentFolders({
  recentFolders,
  onOpenFolder,
}: WelcomeRecentFoldersProps) {
  const { t } = useI18n();
  const clientNow = useSyncExternalStore(subscribeNow, getClientNow, getServerNow);

  if (recentFolders.length === 0) {
    return null;
  }

  const formatRecentTime = (timestamp: number) => {
    if (!clientNow) return "";
    const diffMs = clientNow - timestamp;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 24) {
      return t("welcome.today");
    } else if (diffDays === 1) {
      return t("welcome.yesterday");
    } else {
      return t("welcome.daysAgo", { days: diffDays });
    }
  };

  return (
    <section
      style={{
        maxWidth: "1000px",
        width: "100%",
        boxSizing: "border-box",
        margin: "84px auto 0",
        padding: "0 32px",
      }}
    >
      <div
        className="rise"
        style={{
          animationDelay: "0.5s",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "18px",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "30px", fontWeight: 700, letterSpacing: "-0.03em" }}>
            {t("welcome.recentHeading")}
          </h2>
          <div style={{ marginTop: "4px", fontSize: "15px", color: "#6e6e73" }}>
            {t("welcome.recentCount", { count: recentFolders.length })}
          </div>
        </div>
      </div>

      {/* Grid of Recent Folders Glass Cards */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
        {recentFolders.map((folder, idx) => {
          const progressPct =
            folder.totalFiles > 0
              ? Math.round((folder.lastIndex / folder.totalFiles) * 100)
              : 0;
          return (
            <button
              key={idx}
              type="button"
              onClick={onOpenFolder}
              className="rc"
              style={{
                flex: "1 1 280px",
                boxSizing: "border-box",
                textAlign: "left",
                border: "1px solid rgba(255,255,255,.95)",
                borderRadius: "26px",
                background: "rgba(255,255,255,.74)",
                WebkitBackdropFilter: "blur(24px) saturate(1.4)",
                backdropFilter: "blur(24px) saturate(1.4)",
                padding: "20px",
                boxShadow: "0 10px 30px rgba(60,60,140,.10)",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                color: "#1d1d1f",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "46px",
                    height: "46px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg,#7cc4ff,#2f7cf6)",
                    display: "grid",
                    placeItems: "center",
                    boxShadow: "0 6px 14px rgba(47,124,246,.35)",
                    flexShrink: 0,
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "16px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {folder.folderName}
                  </div>
                  <div style={{ fontSize: "13px", color: "#6e6e73", marginTop: "2px" }}>
                    {t("welcome.recentTrackStatus", {
                      count: folder.totalFiles,
                      index: folder.lastIndex,
                    })}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ height: "5px", borderRadius: "3px", background: "rgba(29,29,31,.1)", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${progressPct}%`,
                    height: "5px",
                    borderRadius: "3px",
                    background: "#1d1d1f",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px", color: "#6e6e73" }}>
                <span>{formatRecentTime(folder.updatedAt)}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: 600, color: "#1d1d1f" }}>
                  {t("welcome.reopen")}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
