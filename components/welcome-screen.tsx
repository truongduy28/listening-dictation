"use client";

import React, { useSyncExternalStore } from "react";
import { getRecentFolders, subscribeRecentFolders, RecentFolder } from "@/lib/storage";
import { WelcomeBackground } from "@/components/welcome/welcome-background";
import { WelcomeHero } from "@/components/welcome/welcome-hero";
import { WelcomePreviewPlayer } from "@/components/welcome/welcome-preview-player";
import { WelcomeRecentFolders } from "@/components/welcome/welcome-recent-folders";
import { WelcomeFeatures } from "@/components/welcome/welcome-features";
import { WelcomeSafariBanner } from "@/components/welcome/welcome-safari-banner";

interface WelcomeScreenProps {
  onOpenFolder?: () => void;
  onOpenShortcuts?: () => void;
  isSafari?: boolean;
  isLoading?: boolean;
}

const emptyRecentFolders: RecentFolder[] = [];
const getEmptyRecentFolders = () => emptyRecentFolders;

export function WelcomeScreen({
  onOpenFolder,
  onOpenShortcuts,
  isSafari = false,
  isLoading = false,
}: WelcomeScreenProps) {
  // Read recent folders from local storage safely without hydration mismatch
  const recentFolders = useSyncExternalStore(
    subscribeRecentFolders,
    getRecentFolders,
    getEmptyRecentFolders
  );

  return (
    <div
      className="welcome-wrap"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        overflow: "hidden",
        boxSizing: "border-box",
        background: "#fbfbfd",
        color: "#1d1d1f",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <WelcomeBackground />

      {/* Main Content Flow */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", flexDirection: "column" }}>
        <WelcomeHero
          onOpenFolder={onOpenFolder}
          onOpenShortcuts={onOpenShortcuts}
          isLoading={isLoading}
        />

        <WelcomePreviewPlayer />

        <WelcomeRecentFolders
          recentFolders={recentFolders}
          onOpenFolder={onOpenFolder}
        />

        <WelcomeFeatures />

        <WelcomeSafariBanner isSafari={isSafari} />

        <div style={{ height: "48px" }} />
      </div>
    </div>
  );
}
