"use client";

import React from "react";

export function WelcomeBackground() {
  return (
    <>
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
    </>
  );
}
