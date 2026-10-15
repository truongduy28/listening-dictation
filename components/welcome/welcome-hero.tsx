"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";
import { AppBrand } from "@/components/ui/app-brand";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { OfflineBadge } from "@/components/pwa/offline-badge";

interface WelcomeHeroProps {
  onOpenFolder?: () => void;
  onOpenShortcuts?: () => void;
  isLoading?: boolean;
}

export function WelcomeHero({
  onOpenFolder,
  onOpenShortcuts,
  isLoading = false,
}: WelcomeHeroProps) {
  const { t } = useI18n();

  return (
    <>
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
    </>
  );
}
