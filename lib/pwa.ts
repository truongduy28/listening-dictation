// PWA helpers and Service Worker registration utilities

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function isStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function registerServiceWorker({
  onUpdateFound,
}: {
  onUpdateFound?: (registration: ServiceWorkerRegistration) => void;
} = {}): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  // Only register in production or localhost
  const isLocalhost = Boolean(
    window.location.hostname === "localhost" ||
      window.location.hostname === "[::1]" ||
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
  );

  if (process.env.NODE_ENV !== "production" && !isLocalhost) {
    return;
  }

  const register = () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        // If there's an updated worker already waiting, inform caller
        if (registration.waiting) {
          onUpdateFound?.(registration);
          return;
        }

        registration.addEventListener("updatefound", () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener("statechange", () => {
            if (
              installingWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New content is available and waiting
              onUpdateFound?.(registration);
            }
          });
        });
      })
      .catch((err) => {
        console.warn("ServiceWorker registration failed:", err);
      });
  };

  // Register when browser is idle, never blocking first paint
  const win = window as Window & { requestIdleCallback?: (cb: () => void) => void };
  if (typeof win.requestIdleCallback === "function") {
    win.requestIdleCallback(register);
  } else {
    window.addEventListener("load", () => {
      setTimeout(register, 1000);
    });
  }
}
