"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import viMessages from "@/messages/vi.json";
import enMessages from "@/messages/en.json";
import { getStoredSettings, saveStoredSettings } from "@/lib/storage";

export type Language = "vi" | "en";

type Messages = typeof viMessages;

const translations: Record<Language, Messages> = {
  vi: viMessages,
  en: enMessages,
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

function getInitialLanguage(): Language {
  return getStoredSettings().language;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    saveStoredSettings({ language: lang });
  }, []);

  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      const keys = path.split(".");
      let val: unknown = translations[language];

      for (const k of keys) {
        if (val && typeof val === "object" && k in val) {
          val = (val as Record<string, unknown>)[k];
        } else {
          return path;
        }
      }

      if (typeof val !== "string") {
        return path;
      }

      let res = val;
      if (params) {
        for (const [pk, pv] of Object.entries(params)) {
          res = res.replace(new RegExp(`\\{${pk}\\}`, "g"), String(pv));
        }
      }
      return res;
    },
    [language]
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
