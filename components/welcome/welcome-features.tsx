"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";

export function WelcomeFeatures() {
  const { t } = useI18n();

  return (
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
  );
}
