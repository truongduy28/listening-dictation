"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { BeforeInstallPromptEvent, isStandaloneMode } from "@/lib/pwa";

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  const isStandalone = useMemo(() => isStandaloneMode(), []);

  const isSafari = useMemo(() => {
    if (typeof window !== "undefined") {
      return !("showDirectoryPicker" in window);
    }
    return false;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const canInstall = !isStandalone && !isInstalled && (Boolean(deferredPrompt) || isSafari);

  const promptInstall = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      return choiceResult.outcome;
    }
    return null;
  }, [deferredPrompt]);

  return {
    canInstall,
    isStandalone,
    isInstalled,
    isSafari,
    hasNativePrompt: Boolean(deferredPrompt),
    promptInstall,
  };
}
