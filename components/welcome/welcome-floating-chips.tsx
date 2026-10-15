"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";

export function WelcomeFloatingChips() {
  const { t } = useI18n();

  return (
    <>
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
    </>
  );
}
