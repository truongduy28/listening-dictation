import { describe, it, expect, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { isStandaloneMode, registerServiceWorker } from "@/lib/pwa";

describe("lib/pwa", () => {
  it("isStandaloneMode returns boolean", () => {
    expect(typeof isStandaloneMode()).toBe("boolean");

    // Mock display-mode: standalone
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === "(display-mode: standalone)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    expect(isStandaloneMode()).toBe(true);
  });

  it("registerServiceWorker registers safely", () => {
    const onUpdateFound = vi.fn();
    const mockRegistration = {
      waiting: null,
      installing: {
        addEventListener: vi.fn((event, cb) => {
          if (event === "statechange") {
            // @ts-expect-error test mock
            this.state = "installed";
            cb();
          }
        }),
        state: "installed",
      },
      addEventListener: vi.fn((event, cb) => {
        if (event === "updatefound") cb();
      }),
    };

    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        register: vi.fn().mockResolvedValue(mockRegistration),
        controller: {},
      },
      configurable: true,
      writable: true,
    });

    // Mock requestIdleCallback
    const win = window as unknown as { requestIdleCallback: (cb: () => void) => void };
    win.requestIdleCallback = (cb: () => void) => cb();

    registerServiceWorker({ onUpdateFound });
    expect(navigator.serviceWorker.register).toHaveBeenCalledWith("/sw.js", { scope: "/" });
  });

  it("Manifest file exists and conforms to PWA standards", () => {
    const manifestPath = path.resolve("public/manifest.webmanifest");
    expect(fs.existsSync(manifestPath)).toBe(true);

    const raw = fs.readFileSync(manifestPath, "utf8");
    const manifest = JSON.parse(raw);

    expect(typeof manifest.name).toBe("string");
    expect(typeof manifest.short_name).toBe("string");
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.theme_color).toBe("#f5f5f7");
    expect(manifest.background_color).toBe("#f5f5f7");

    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(3);

    const has192 = manifest.icons.some(
      (i: { sizes: string; purpose?: string }) => i.sizes === "192x192" && (i.purpose === "any" || !i.purpose)
    );
    const has512 = manifest.icons.some(
      (i: { sizes: string; purpose?: string }) => i.sizes === "512x512" && (i.purpose === "any" || !i.purpose)
    );
    const hasMaskable = manifest.icons.some(
      (i: { sizes: string; purpose?: string }) => i.sizes === "512x512" && i.purpose === "maskable"
    );

    expect(has192).toBe(true);
    expect(has512).toBe(true);
    expect(hasMaskable).toBe(true);
  });

  it("All PWA icons exist on disk with valid file size", () => {
    const icons = [
      "public/icons/icon-192.png",
      "public/icons/icon-512.png",
      "public/icons/icon-maskable-512.png",
      "public/icons/apple-touch-icon.png",
    ];

    for (const iconPath of icons) {
      const fullPath = path.resolve(iconPath);
      expect(fs.existsSync(fullPath)).toBe(true);
      const stat = fs.statSync(fullPath);
      expect(stat.size).toBeGreaterThan(500);
    }
  });

  it("Service worker sw.js exists and implements required lifecycle events", () => {
    const swPath = path.resolve("public/sw.js");
    expect(fs.existsSync(swPath)).toBe(true);

    const content = fs.readFileSync(swPath, "utf8");
    expect(content).toContain("addEventListener('install'");
    expect(content).toContain("addEventListener('activate'");
    expect(content).toContain("addEventListener('fetch'");
    expect(content).toContain("addEventListener('message'");
    expect(content).toContain("SKIP_WAITING");
    expect(content).toContain("caches.delete");
  });
});
