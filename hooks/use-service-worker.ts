"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { registerServiceWorker } from "@/lib/pwa";

export function useServiceWorker() {
  const [hasUpdate, setHasUpdate] = useState<boolean>(false);
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    registerServiceWorker({
      onUpdateFound: (registration) => {
        if (registration.waiting) {
          waitingWorkerRef.current = registration.waiting;
          setHasUpdate(true);
        }
      },
    });

    // When the new worker takes control, reload to show latest code
    let refreshing = false;
    const handleControllerChange = () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    };

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
    }

    return () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      }
    };
  }, []);

  const applyUpdate = useCallback(() => {
    if (waitingWorkerRef.current) {
      waitingWorkerRef.current.postMessage({ type: "SKIP_WAITING" });
    } else if (navigator.serviceWorker.controller) {
      // Fallback reload
      window.location.reload();
    }
  }, []);

  const dismissUpdate = useCallback(() => {
    setHasUpdate(false);
  }, []);

  return {
    hasUpdate,
    applyUpdate,
    dismissUpdate,
  };
}
