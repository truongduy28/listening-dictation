"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";
import { PREVIEW_BARS } from "./preview-bars";
import { WelcomeFloatingChips } from "./welcome-floating-chips";
import { WelcomePreviewControls } from "./welcome-preview-controls";

export function WelcomePreviewPlayer() {
  const { t } = useI18n();

  return (
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
      <WelcomeFloatingChips />

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

        <WelcomePreviewControls />
      </div>
    </section>
  );
}
