"use client";

import React, { useMemo } from "react";
import { Folder, Repeat, Keyboard, Star, Info } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { AppBrand } from "@/components/ui/app-brand";
import { LanguageToggle } from "@/components/ui/language-toggle";

interface WelcomeScreenProps {
  onOpenFolder?: () => void;
  isSafari?: boolean;
  isLoading?: boolean;
}

export function WelcomeScreen({ onOpenFolder, isSafari = false, isLoading = false }: WelcomeScreenProps) {
  const { t } = useI18n();

  // Generate 28 decorative bars matching Template C
  const bars = useMemo(() => {
    const list = [];
    const total = 28;
    for (let i = 0; i < total; i++) {
      const env = Math.sin(((i + 1) / (total + 1)) * Math.PI);
      const v = Math.abs(Math.sin(i * 0.8) * 0.6 + Math.sin(i * 0.33 + 1) * 0.4);
      const height = Math.round(10 + (0.3 + 0.7 * v) * env * 50);
      const isPlayed = i < 12;
      list.push({ height, isPlayed });
    }
    return list;
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col box-border bg-[var(--bg-page)] text-[var(--text-primary)]">
      {/* Top Header */}
      <header className="flex items-center justify-between px-8 py-5">
        <AppBrand />
        <LanguageToggle />
      </header>

      {/* Main Hero Content */}
      <main className="flex-1 flex flex-col items-center justify-center gap-10 px-8 pt-6 pb-14 box-border text-center">
        <div className="flex flex-col items-center gap-4.5 max-w-[680px]">
          {/* Waveform graphic */}
          <div className="flex items-center gap-1 h-16" aria-hidden="true">
            {bars.map((b, idx) => (
              <div
                key={idx}
                style={{ height: `${b.height}px` }}
                className={`w-[5px] rounded-[3px] transition-all duration-300 ${
                  b.isPlayed ? "bg-[var(--waveform-played)]" : "bg-[var(--waveform-unplayed)]"
                }`}
              />
            ))}
          </div>

          <h1
            className="m-0 text-5xl md:text-[56px] leading-[1.05] font-semibold tracking-[-0.035em]"
            dangerouslySetInnerHTML={{ __html: t("welcome.headline") }}
          />
          <p className="m-0 text-lg md:text-[19px] leading-relaxed text-[var(--text-secondary)] max-w-[540px]">
            {t("welcome.description")}
          </p>
        </div>

        {/* CTA Button */}
        <div className="flex flex-col items-center gap-3.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={onOpenFolder}
            className="cta-btn h-14 px-8 border-0 rounded-[28px] bg-[var(--accent-btn)] text-[var(--accent-btn-text)] text-[17px] font-semibold flex items-center gap-2.5 shadow-[var(--shadow-cta)] cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Folder className="w-[22px] h-[22px]" strokeWidth={2} />
            )}
            {isLoading ? t("welcome.loading") : t("welcome.chooseFolder")}
          </button>
          <span className="text-[13px] text-[var(--text-secondary)]">
            {t("welcome.formatsHint")}
          </span>
        </div>

        {/* 3 Features Cards */}
        <div className="flex flex-wrap justify-center gap-4 max-w-[920px] w-full">
          <div className="flex-1 min-w-[260px] bg-[var(--bg-card)] rounded-[20px] p-5 text-left flex flex-col gap-2 shadow-[var(--shadow-subtle)]">
            <Repeat className="w-6 h-6 text-[var(--text-primary)]" strokeWidth={1.8} />
            <div className="text-base font-semibold">{t("welcome.feature1Title")}</div>
            <div className="text-sm leading-relaxed text-[var(--text-secondary)]">
              {t("welcome.feature1Desc")}
            </div>
          </div>

          <div className="flex-1 min-w-[260px] bg-[var(--bg-card)] rounded-[20px] p-5 text-left flex flex-col gap-2 shadow-[var(--shadow-subtle)]">
            <Keyboard className="w-6 h-6 text-[var(--text-primary)]" strokeWidth={1.8} />
            <div className="text-base font-semibold">{t("welcome.feature2Title")}</div>
            <div className="text-sm leading-relaxed text-[var(--text-secondary)]">
              {t("welcome.feature2Desc")}
            </div>
          </div>

          <div className="flex-1 min-w-[260px] bg-[var(--bg-card)] rounded-[20px] p-5 text-left flex flex-col gap-2 shadow-[var(--shadow-subtle)]">
            <Star className="w-6 h-6 text-[var(--text-primary)]" strokeWidth={1.8} />
            <div className="text-base font-semibold">{t("welcome.feature3Title")}</div>
            <div className="text-sm leading-relaxed text-[var(--text-secondary)]">
              {t("welcome.feature3Desc")}
            </div>
          </div>
        </div>

        {/* Safari info box */}
        {isSafari && (
          <div className="flex items-start gap-3 max-w-[620px] bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-4 text-left shadow-[var(--shadow-subtle)]">
            <Info className="w-5 h-5 text-[var(--text-secondary)] shrink-0 mt-0.5" strokeWidth={1.8} />
            <div className="text-[13.5px] leading-relaxed text-[var(--text-tertiary)]">
              <strong className="font-semibold text-[var(--text-primary)]">
                {t("welcome.safariTitle")}{" "}
              </strong>
              {t("welcome.safariDesc")}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
