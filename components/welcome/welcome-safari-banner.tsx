"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";

interface WelcomeSafariBannerProps {
  isSafari?: boolean;
}

export function WelcomeSafariBanner({ isSafari = false }: WelcomeSafariBannerProps) {
  const { t } = useI18n();

  if (!isSafari) {
    return null;
  }

  return (
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
  );
}
