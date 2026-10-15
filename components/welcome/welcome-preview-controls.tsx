"use client";

import React from "react";

export function WelcomePreviewControls() {
  return (
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
  );
}
