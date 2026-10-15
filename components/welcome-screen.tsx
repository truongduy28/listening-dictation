"use client";

import React, { useSyncExternalStore } from "react";
import { useI18n } from "@/lib/i18n";
import { AppBrand } from "@/components/ui/app-brand";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { OfflineBadge } from "@/components/pwa/offline-badge";
import { getRecentFolders, subscribeRecentFolders, RecentFolder } from "@/lib/storage";

interface WelcomeScreenProps {
  onOpenFolder?: () => void;
  onOpenShortcuts?: () => void;
  isSafari?: boolean;
  isLoading?: boolean;
}

const emptyRecentFolders: RecentFolder[] = [];
const getEmptyRecentFolders = () => emptyRecentFolders;

// Exact 56 waveform bars from reference 02-man-hinh-chao.html
const PREVIEW_BARS = [
  // 0..13: Played outside A-B (opacity 0.45, color #1d1d1f)
  { height: 15, bg: "#1d1d1f", opacity: 0.45, delay: "0.00s" },
  { height: 21, bg: "#1d1d1f", opacity: 0.45, delay: "0.09s" },
  { height: 25, bg: "#1d1d1f", opacity: 0.45, delay: "0.18s" },
  { height: 22, bg: "#1d1d1f", opacity: 0.45, delay: "0.27s" },
  { height: 21, bg: "#1d1d1f", opacity: 0.45, delay: "0.36s" },
  { height: 27, bg: "#1d1d1f", opacity: 0.45, delay: "0.45s" },
  { height: 25, bg: "#1d1d1f", opacity: 0.45, delay: "0.54s" },
  { height: 27, bg: "#1d1d1f", opacity: 0.45, delay: "0.63s" },
  { height: 36, bg: "#1d1d1f", opacity: 0.45, delay: "0.72s" },
  { height: 31, bg: "#1d1d1f", opacity: 0.45, delay: "0.81s" },
  { height: 36, bg: "#1d1d1f", opacity: 0.45, delay: "0.90s" },
  { height: 58, bg: "#1d1d1f", opacity: 0.45, delay: "0.99s" },
  { height: 68, bg: "#1d1d1f", opacity: 0.45, delay: "1.08s" },
  { height: 57, bg: "#1d1d1f", opacity: 0.45, delay: "1.17s" },
  // 14..24: Played inside A-B (opacity 1, color #1d1d1f)
  { height: 32, bg: "#1d1d1f", opacity: 1, delay: "1.26s" },
  { height: 44, bg: "#1d1d1f", opacity: 1, delay: "1.35s" },
  { height: 45, bg: "#1d1d1f", opacity: 1, delay: "1.44s" },
  { height: 33, bg: "#1d1d1f", opacity: 1, delay: "1.53s" },
  { height: 54, bg: "#1d1d1f", opacity: 1, delay: "1.62s" },
  { height: 55, bg: "#1d1d1f", opacity: 1, delay: "1.71s" },
  { height: 32, bg: "#1d1d1f", opacity: 1, delay: "1.80s" },
  { height: 68, bg: "#1d1d1f", opacity: 1, delay: "1.89s" },
  { height: 92, bg: "#1d1d1f", opacity: 1, delay: "1.98s" },
  { height: 87, bg: "#1d1d1f", opacity: 1, delay: "2.07s" },
  { height: 57, bg: "#1d1d1f", opacity: 1, delay: "2.16s" },
  // 25..35: Unplayed inside A-B (opacity 1, color #c7c7cc)
  { height: 42, bg: "#c7c7cc", opacity: 1, delay: "2.25s" },
  { height: 55, bg: "#c7c7cc", opacity: 1, delay: "2.34s" },
  { height: 40, bg: "#c7c7cc", opacity: 1, delay: "0.03s" },
  { height: 54, bg: "#c7c7cc", opacity: 1, delay: "0.12s" },
  { height: 66, bg: "#c7c7cc", opacity: 1, delay: "0.21s" },
  { height: 51, bg: "#c7c7cc", opacity: 1, delay: "0.30s" },
  { height: 52, bg: "#c7c7cc", opacity: 1, delay: "0.39s" },
  { height: 85, bg: "#c7c7cc", opacity: 1, delay: "0.48s" },
  { height: 92, bg: "#c7c7cc", opacity: 1, delay: "0.57s" },
  { height: 71, bg: "#c7c7cc", opacity: 1, delay: "0.66s" },
  { height: 37, bg: "#c7c7cc", opacity: 1, delay: "0.75s" },
  // 36..55: Unplayed outside A-B (opacity 0.45, color #c7c7cc)
  { height: 47, bg: "#c7c7cc", opacity: 0.45, delay: "0.84s" },
  { height: 43, bg: "#c7c7cc", opacity: 0.45, delay: "0.93s" },
  { height: 39, bg: "#c7c7cc", opacity: 0.45, delay: "1.02s" },
  { height: 56, bg: "#c7c7cc", opacity: 0.45, delay: "1.11s" },
  { height: 53, bg: "#c7c7cc", opacity: 0.45, delay: "1.20s" },
  { height: 29, bg: "#c7c7cc", opacity: 0.45, delay: "1.29s" },
  { height: 53, bg: "#c7c7cc", opacity: 0.45, delay: "1.38s" },
  { height: 66, bg: "#c7c7cc", opacity: 0.45, delay: "1.47s" },
  { height: 59, bg: "#c7c7cc", opacity: 0.45, delay: "1.56s" },
  { height: 38, bg: "#c7c7cc", opacity: 0.45, delay: "1.65s" },
  { height: 27, bg: "#c7c7cc", opacity: 0.45, delay: "1.74s" },
  { height: 30, bg: "#c7c7cc", opacity: 0.45, delay: "1.83s" },
  { height: 21, bg: "#c7c7cc", opacity: 0.45, delay: "1.92s" },
  { height: 30, bg: "#c7c7cc", opacity: 0.45, delay: "2.01s" },
  { height: 31, bg: "#c7c7cc", opacity: 0.45, delay: "2.10s" },
  { height: 24, bg: "#c7c7cc", opacity: 0.45, delay: "2.19s" },
  { height: 20, bg: "#c7c7cc", opacity: 0.45, delay: "2.28s" },
  { height: 24, bg: "#c7c7cc", opacity: 0.45, delay: "2.37s" },
  { height: 21, bg: "#c7c7cc", opacity: 0.45, delay: "0.06s" },
  { height: 15, bg: "#c7c7cc", opacity: 0.45, delay: "0.15s" },
];

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

export function WelcomeScreen({
  onOpenFolder,
  onOpenShortcuts,
  isSafari = false,
  isLoading = false,
}: WelcomeScreenProps) {
  const { t } = useI18n();

  // Read recent folders from local storage safely without hydration mismatch
  const recentFolders = useSyncExternalStore(
    subscribeRecentFolders,
    getRecentFolders,
    getEmptyRecentFolders
  );

  const clientNow = useSyncExternalStore(subscribeNow, getClientNow, getServerNow);

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
      {/* Inline styles guarantee keyframe animations and media queries run across dev & production */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .welcome-wrap button {
              font-family: inherit;
              cursor: pointer;
              transition: transform 0.12s cubic-bezier(0.22, 1, 0.36, 1), background 0.12s, box-shadow 0.22s;
            }
            .welcome-wrap button:active {
              transform: scale(0.96);
            }
            .welcome-wrap button:focus-visible {
              outline: 2px solid #0071e3;
              outline-offset: 2px;
            }
            .welcome-wrap .cta:hover {
              transform: translateY(-2px);
              box-shadow: 0 16px 36px rgba(0, 0, 0, 0.26) !important;
            }
            .welcome-wrap .glassbtn:hover {
              background: rgba(255, 255, 255, 0.96) !important;
            }
            .welcome-wrap .rc {
              transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.22s;
            }
            .welcome-wrap .rc:hover {
              transform: translateY(-3px);
              box-shadow: 0 20px 44px rgba(40, 40, 100, 0.14) !important;
            }
            @keyframes rise {
              from { opacity: 0; transform: translateY(18px); }
              to { opacity: 1; transform: none; }
            }
            @keyframes drift1 {
              from { transform: translate3d(0, 0, 0); }
              to { transform: translate3d(70px, 40px, 0); }
            }
            @keyframes drift2 {
              from { transform: translate3d(0, 0, 0); }
              to { transform: translate3d(-60px, 50px, 0); }
            }
            @keyframes drift3 {
              from { transform: translate3d(0, 0, 0); }
              to { transform: translate3d(50px, -40px, 0); }
            }
            @keyframes floaty {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            @keyframes breathe {
              0%, 100% { transform: scaleY(1); }
              50% { transform: scaleY(0.7); }
            }
            @keyframes twinkle {
              0%, 100% { opacity: 0.2; transform: scale(0.6); }
              50% { opacity: 1; transform: scale(1); }
            }
            .welcome-wrap .rise {
              animation: rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
            }
            .welcome-wrap .fl {
              position: absolute;
              z-index: 2;
              animation: floaty 6s ease-in-out infinite;
            }
            .welcome-wrap .sp {
              position: absolute;
              animation: twinkle 3.2s ease-in-out infinite;
              pointer-events: none;
            }
            @media (max-width: 1040px) {
              .welcome-wrap .fl, .welcome-wrap .sp {
                display: none !important;
              }
            }
            @media (max-width: 768px) {
              .welcome-wrap .hero-title {
                font-size: clamp(38px, 10vw, 56px) !important;
              }
              .welcome-wrap .hero-desc {
                font-size: 17px !important;
              }
              .welcome-wrap .welcome-header {
                padding: 16px 20px !important;
              }
              .welcome-wrap .player-section {
                margin-top: 40px !important;
                padding: 0 16px !important;
              }
              .welcome-wrap .player-card-box {
                padding: 20px 18px 18px !important;
                border-radius: 24px !important;
              }
            }
            @media (prefers-reduced-motion: reduce) {
              .welcome-wrap * {
                animation: none !important;
                transition: none !important;
              }
            }
          `,
        }}
      />

      {/* 5 Ambient radial gradients drifting smoothly */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-6%",
          top: "-220px",
          width: "760px",
          height: "760px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 50% 50%, rgba(110,170,255,0.55), rgba(110,170,255,0) 68%)",
          animation: "drift1 16s ease-in-out infinite alternate",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: "-8%",
          top: "-160px",
          width: "720px",
          height: "720px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 50% 50%, rgba(190,140,255,0.50), rgba(190,140,255,0) 68%)",
          animation: "drift2 19s ease-in-out infinite alternate",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "30%",
          top: "360px",
          width: "680px",
          height: "680px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 50% 50%, rgba(255,170,130,0.42), rgba(255,170,130,0) 68%)",
          animation: "drift3 22s ease-in-out infinite alternate",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-10%",
          top: "900px",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 50% 50%, rgba(110,220,205,0.38), rgba(110,220,205,0) 68%)",
          animation: "drift1 24s ease-in-out infinite alternate",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: "-6%",
          top: "1000px",
          width: "680px",
          height: "680px",
          borderRadius: "50%",
          background: "radial-gradient(circle at 50% 50%, rgba(255,140,180,0.34), rgba(255,140,180,0) 68%)",
          animation: "drift2 21s ease-in-out infinite alternate",
          pointerEvents: "none",
        }}
      />

      {/* 5 Twinkling 4-pointed stars */}
      <svg
        className="sp"
        aria-hidden="true"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        style={{ left: "15%", top: "170px", animationDelay: "0.2s" }}
      >
        <path d="M12 2c.6 5 2.5 8.4 10 10-7.5 1.6-9.4 5-10 10-.6-5-2.5-8.4-10-10 7.5-1.6 9.4-5 10-10z" fill="#8e5cf7" />
      </svg>
      <svg
        className="sp"
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        style={{ left: "25%", top: "330px", animationDelay: "1.1s" }}
      >
        <path d="M12 2c.6 5 2.5 8.4 10 10-7.5 1.6-9.4 5-10 10-.6-5-2.5-8.4-10-10 7.5-1.6 9.4-5 10-10z" fill="#0a84ff" />
      </svg>
      <svg
        className="sp"
        aria-hidden="true"
        width="26"
        height="26"
        viewBox="0 0 24 24"
        style={{ right: "16%", top: "130px", animationDelay: "0.7s" }}
      >
        <path d="M12 2c.6 5 2.5 8.4 10 10-7.5 1.6-9.4 5-10 10-.6-5-2.5-8.4-10-10 7.5-1.6 9.4-5 10-10z" fill="#ff7a45" />
      </svg>
      <svg
        className="sp"
        aria-hidden="true"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        style={{ right: "24%", top: "300px", animationDelay: "1.8s" }}
      >
        <path d="M12 2c.6 5 2.5 8.4 10 10-7.5 1.6-9.4 5-10 10-.6-5-2.5-8.4-10-10 7.5-1.6 9.4-5 10-10z" fill="#ff5c8a" />
      </svg>
      <svg
        className="sp"
        aria-hidden="true"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        style={{ left: "8%", top: "290px", animationDelay: "2.3s" }}
      >
        <path d="M12 2c.6 5 2.5 8.4 10 10-7.5 1.6-9.4 5-10 10-.6-5-2.5-8.4-10-10 7.5-1.6 9.4-5 10-10z" fill="#14a89a" />
      </svg>

      {/* Main Content Flow */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", flexDirection: "column" }}>
        {/* Top Header */}
        <header
          className="welcome-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 40px",
          }}
        >
          <AppBrand />
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <OfflineBadge />
            <LanguageToggle />
          </div>
        </header>

        {/* Hero Section */}
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "36px 32px 0",
            gap: "22px",
          }}
        >
          {/* Glass Tagline Pill */}
          <div
            className="rise"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              height: "34px",
              padding: "0 16px 0 12px",
              borderRadius: "999px",
              background: "rgba(255,255,255,.7)",
              border: "1px solid rgba(255,255,255,.95)",
              boxShadow: "0 6px 20px rgba(60,60,140,.08)",
              fontSize: "14px",
              fontWeight: 500,
              color: "#3a3a3c",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2c.6 5 2.5 8.4 10 10-7.5 1.6-9.4 5-10 10-.6-5-2.5-8.4-10-10 7.5-1.6 9.4-5 10-10z" fill="#8e5cf7" />
            </svg>
            <span>{t("welcome.tagline")}</span>
          </div>

          {/* Large Title with Gradient Accent */}
          <h1
            className="rise hero-title"
            style={{
              animationDelay: "0.08s",
              margin: 0,
              fontSize: "84px",
              lineHeight: 1.02,
              fontWeight: 700,
              letterSpacing: "-0.045em",
            }}
          >
            {t("welcome.headline1")}
            <br />
            <span
              style={{
                background: "linear-gradient(100deg, #0071e3 0%, #7c4dff 48%, #d9480f 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {t("welcome.headline2")}
            </span>
          </h1>

          {/* Subtitle Description */}
          <p
            className="rise hero-desc"
            style={{
              animationDelay: "0.16s",
              margin: 0,
              fontSize: "21px",
              lineHeight: 1.5,
              color: "#515154",
              maxWidth: "600px",
            }}
          >
            {t("welcome.description")}
          </p>

          {/* CTA Buttons Row */}
          <div
            className="rise"
            style={{
              animationDelay: "0.24s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginTop: "6px",
            }}
          >
            {/* Primary Action Button: Choose Folder */}
            <button
              type="button"
              disabled={isLoading}
              onClick={onOpenFolder}
              className="cta"
              style={{
                height: "58px",
                padding: "0 32px",
                border: 0,
                borderRadius: "29px",
                background: "#1d1d1f",
                color: "#fff",
                fontSize: "17px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 10px 28px rgba(0,0,0,.22)",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? (
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "twinkle 1s linear infinite",
                  }}
                />
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
              )}
              <span>{isLoading ? t("welcome.loading") : t("welcome.chooseFolder")}</span>
            </button>

            {/* Secondary Glass Button: View Shortcuts */}
            <button
              type="button"
              onClick={onOpenShortcuts}
              className="glassbtn"
              style={{
                height: "58px",
                padding: "0 26px",
                border: "1px solid rgba(255,255,255,.95)",
                borderRadius: "29px",
                background: "rgba(255,255,255,.7)",
                color: "#1d1d1f",
                fontSize: "17px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 6px 20px rgba(60,60,140,.08)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
                <path d="M6.5 10h.01M10 10h.01M14 10h.01M17.5 10h.01M7.5 14h9" />
              </svg>
              <span>{t("welcome.viewShortcuts")}</span>
            </button>
          </div>

          {/* Privacy Footnote Badge */}
          <div
            className="rise"
            style={{
              animationDelay: "0.3s",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              color: "#6e6e73",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="5" y="11" width="14" height="9" rx="2.5" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            <span>{t("welcome.privacyBadge")}</span>
          </div>
        </section>

        {/* Floating Player Preview Section */}
        <section
          className="rise player-section"
          style={{
            animationDelay: "0.4s",
            position: "relative",
            maxWidth: "880px",
            width: "100%",
            boxSizing: "border-box",
            margin: "56px auto 0",
            padding: "0 32px",
          }}
        >
          {/* Floating Chip 1: Repeat 3x */}
          <div className="fl" style={{ left: "-56px", top: "84px", animationDelay: "0s" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                height: "46px",
                padding: "0 18px 0 10px",
                borderRadius: "23px",
                background: "rgba(255,255,255,.88)",
                border: "1px solid #fff",
                boxShadow: "0 14px 34px rgba(40,40,100,.16)",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #64b5ff, #0a6cff)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17 3l3 3-3 3" />
                  <path d="M4 11V9a3 3 0 0 1 3-3h13" />
                  <path d="M7 21l-3-3 3-3" />
                  <path d="M20 13v2a3 3 0 0 1-3 3H4" />
                </svg>
              </span>
              <span>{t("welcome.chipLoop")}</span>
            </div>
          </div>

          {/* Floating Chip 2: Speed 0.75x */}
          <div className="fl" style={{ right: "-56px", top: "-22px", animationDelay: "1.2s" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                height: "46px",
                padding: "0 18px 0 10px",
                borderRadius: "23px",
                background: "rgba(255,255,255,.88)",
                border: "1px solid #fff",
                boxShadow: "0 14px 34px rgba(40,40,100,.16)",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #ffb347, #ff6a3d)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M12 7.5V12l3 2" />
                </svg>
              </span>
              <span>{t("welcome.chipSpeed")}</span>
            </div>
          </div>

          {/* Floating Chip 3: Star Review */}
          <div className="fl" style={{ left: "-56px", bottom: "110px", animationDelay: "2.1s" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                height: "46px",
                padding: "0 18px 0 10px",
                borderRadius: "23px",
                background: "rgba(255,255,255,.88)",
                border: "1px solid #fff",
                boxShadow: "0 14px 34px rgba(40,40,100,.16)",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #ff8fb1, #ff3d71)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8L3.5 9.7l5.9-.8z" />
                </svg>
              </span>
              <span>{t("welcome.chipStarred")}</span>
            </div>
          </div>

          {/* Floating Chip 4: A-B Repeat */}
          <div className="fl" style={{ right: "-56px", bottom: "84px", animationDelay: "3s" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                height: "46px",
                padding: "0 18px 0 10px",
                borderRadius: "23px",
                background: "rgba(255,255,255,.88)",
                border: "1px solid #fff",
                boxShadow: "0 14px 34px rgba(40,40,100,.16)",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #b388ff, #6c4cf0)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M9 5H6v14h3M15 5h3v14h-3" />
                </svg>
              </span>
              <span>{t("welcome.chipAbLoop")}</span>
            </div>
          </div>

          {/* Central Glass Player Illustration Card */}
          <div
            className="player-card-box"
            style={{
              background: "rgba(255,255,255,.74)",
              WebkitBackdropFilter: "blur(28px) saturate(1.5)",
              backdropFilter: "blur(28px) saturate(1.5)",
              border: "1px solid rgba(255,255,255,.95)",
              borderRadius: "34px",
              padding: "28px 34px 26px",
              boxShadow: "0 34px 90px rgba(60,60,140,.18), 0 2px 6px rgba(0,0,0,.05)",
            }}
          >
            {/* Header info */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "13px", color: "#6e6e73" }}>{t("welcome.previewPlaying")}</div>
                <div style={{ marginTop: "2px", fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em" }}>
                  Test03_Q012.mp3
                </div>
              </div>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: "rgba(29,29,31,.06)",
                  display: "grid",
                  placeItems: "center",
                  color: "#1d1d1f",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8L3.5 9.7l5.9-.8z" />
                </svg>
              </div>
            </div>

            {/* Waveform illustration with 56 Breathing bars & A-B region */}
            <div style={{ position: "relative", paddingTop: "22px", marginTop: "6px", userSelect: "none" }} aria-hidden="true">
              {/* 56 Breathing Waveform Bars */}
              <div style={{ display: "flex", alignItems: "center", gap: "3px", height: "104px" }}>
                {PREVIEW_BARS.map((bar, idx) => (
                  <div
                    key={idx}
                    style={{
                      flex: "1 1 0",
                      minWidth: "2px",
                      height: `${bar.height}px`,
                      borderRadius: "3px",
                      background: bar.bg,
                      opacity: bar.opacity,
                      animation: `breathe 2.4s ease-in-out ${bar.delay} infinite`,
                    }}
                  />
                ))}
              </div>

              {/* Shaded A-B Region Overlay */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "25%",
                  width: "39.3%",
                  top: "22px",
                  height: "104px",
                  background: "rgba(29,29,31,.06)",
                  borderRadius: "10px",
                }}
              />

              {/* Marker Handle A */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "25%",
                  top: 0,
                  width: 0,
                  height: "126px",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "-20px",
                    top: 0,
                    height: "18px",
                    padding: "0 7px",
                    borderRadius: "9px",
                    background: "#1d1d1f",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: 600,
                    lineHeight: "18px",
                  }}
                >
                  A 0:04
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: "-2px",
                    top: "22px",
                    width: "4px",
                    height: "104px",
                    borderRadius: "2px",
                    background: "#1d1d1f",
                  }}
                />
              </div>

              {/* Marker Handle B */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "64.3%",
                  top: 0,
                  width: 0,
                  height: "126px",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "-20px",
                    top: 0,
                    height: "18px",
                    padding: "0 7px",
                    borderRadius: "9px",
                    background: "#1d1d1f",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: 600,
                    lineHeight: "18px",
                  }}
                >
                  B 0:09
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: "-2px",
                    top: "22px",
                    width: "4px",
                    height: "104px",
                    borderRadius: "2px",
                    background: "#1d1d1f",
                  }}
                />
              </div>
            </div>

            {/* Transport Controls Preview Row with Exact Vector SVGs */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "14px",
                marginTop: "14px",
              }}
              aria-hidden="true"
            >
              {/* Prev */}
              <div style={{ width: "46px", height: "46px", borderRadius: "50%", display: "grid", placeItems: "center", color: "#1d1d1f" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 5v14" fill="none" />
                  <path d="M19 5.5v13L9 12z" />
                </svg>
              </div>

              {/* Rewind 5s */}
              <div style={{ width: "46px", height: "46px", borderRadius: "50%", display: "grid", placeItems: "center", color: "#1d1d1f" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 12a9 9 0 1 0 3-6.7" />
                  <path d="M3 4v5h5" />
                  <text x="12" y="15.6" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="currentColor" stroke="none" fontFamily="-apple-system,system-ui,sans-serif">
                    5
                  </text>
                </svg>
              </div>

              {/* Play / Pause button */}
              <div
                style={{
                  width: "68px",
                  height: "68px",
                  borderRadius: "50%",
                  background: "#1d1d1f",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 8px 22px rgba(0,0,0,.28)",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="6.5" y="5" width="3.8" height="14" rx="1.2" />
                  <rect x="13.7" y="5" width="3.8" height="14" rx="1.2" />
                </svg>
              </div>

              {/* Forward 5s */}
              <div style={{ width: "46px", height: "46px", borderRadius: "50%", display: "grid", placeItems: "center", color: "#1d1d1f" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12a9 9 0 1 1-3-6.7" />
                  <path d="M21 4v5h-5" />
                  <text x="12" y="15.6" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="currentColor" stroke="none" fontFamily="-apple-system,system-ui,sans-serif">
                    5
                  </text>
                </svg>
              </div>

              {/* Next */}
              <div style={{ width: "46px", height: "46px", borderRadius: "50%", display: "grid", placeItems: "center", color: "#1d1d1f" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 5v14" fill="none" />
                  <path d="M5 5.5v13L15 12z" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Section: "Tiếp tục nơi bạn dừng" (Shown ONLY when real recent folders exist per spec) */}
        {recentFolders.length > 0 && (
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
        )}

        {/* 3 iOS-Style Feature Glass Cards */}
        <section
          style={{
            maxWidth: "1000px",
            width: "100%",
            boxSizing: "border-box",
            margin: "72px auto 0",
            padding: "0 32px",
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          {/* Feature 1 */}
          <div
            style={{
              flex: "1 1 280px",
              boxSizing: "border-box",
              border: "1px solid rgba(255,255,255,.95)",
              borderRadius: "26px",
              background: "rgba(255,255,255,.62)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "linear-gradient(135deg,#64b5ff,#0a6cff)",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 8px 18px rgba(10,108,255,.3)",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M17 3l3 3-3 3" />
                <path d="M4 11V9a3 3 0 0 1 3-3h13" />
                <path d="M7 21l-3-3 3-3" />
                <path d="M20 13v2a3 3 0 0 1-3 3H4" />
              </svg>
            </div>
            <div style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.01em" }}>
              {t("welcome.feature1Title")}
            </div>
            <div style={{ fontSize: "15px", lineHeight: 1.5, color: "#6e6e73" }}>
              {t("welcome.feature1Desc")}
            </div>
          </div>

          {/* Feature 2 */}
          <div
            style={{
              flex: "1 1 280px",
              boxSizing: "border-box",
              border: "1px solid rgba(255,255,255,.95)",
              borderRadius: "26px",
              background: "rgba(255,255,255,.62)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "linear-gradient(135deg,#ffb347,#ff6a3d)",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 8px 18px rgba(255,106,61,.3)",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
                <path d="M6.5 10h.01M10 10h.01M14 10h.01M17.5 10h.01M7.5 14h9" />
              </svg>
            </div>
            <div style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.01em" }}>
              {t("welcome.feature2Title")}
            </div>
            <div style={{ fontSize: "15px", lineHeight: 1.5, color: "#6e6e73" }}>
              {t("welcome.feature2Desc")}
            </div>
          </div>

          {/* Feature 3 */}
          <div
            style={{
              flex: "1 1 280px",
              boxSizing: "border-box",
              border: "1px solid rgba(255,255,255,.95)",
              borderRadius: "26px",
              background: "rgba(255,255,255,.62)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "linear-gradient(135deg,#ff8fb1,#ff3d71)",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 8px 18px rgba(255,61,113,.3)",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8L3.5 9.7l5.9-.8z" />
              </svg>
            </div>
            <div style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.01em" }}>
              {t("welcome.feature3Title")}
            </div>
            <div style={{ fontSize: "15px", lineHeight: 1.5, color: "#6e6e73" }}>
              {t("welcome.feature3Desc")}
            </div>
          </div>
        </section>

        {/* Safari Feature Notice */}
        {isSafari && (
          <section
            style={{
              maxWidth: "680px",
              width: "100%",
              boxSizing: "border-box",
              margin: "48px auto 0",
              padding: "0 32px 64px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                background: "rgba(255,255,255,.7)",
                border: "1px solid rgba(255,255,255,.95)",
                borderRadius: "18px",
                padding: "14px 18px",
                textAlign: "left",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6e6e73"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flex: "0 0 auto", marginTop: "1px" }}
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 8h.01" />
              </svg>
              <div style={{ fontSize: "14px", lineHeight: 1.5, color: "#3a3a3c" }}>
                <strong style={{ fontWeight: 600 }}>{t("welcome.safariTitle")} </strong>
                {t("welcome.safariDesc")}
              </div>
            </div>
          </section>
        )}

        <div style={{ height: "48px" }} />
      </div>
    </div>
  );
}
