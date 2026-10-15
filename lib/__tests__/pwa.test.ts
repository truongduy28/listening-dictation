import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { isStandaloneMode } from "../pwa.ts";

test("isStandaloneMode returns false when window is undefined", () => {
  assert.equal(isStandaloneMode(), false);
});

test("Manifest file exists and conforms to PWA standards", () => {
  const manifestPath = path.resolve("public/manifest.webmanifest");
  assert.equal(fs.existsSync(manifestPath), true, "manifest.webmanifest must exist in public/");

  const raw = fs.readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(raw);

  assert.equal(typeof manifest.name, "string");
  assert.equal(typeof manifest.short_name, "string");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.theme_color, "#f5f5f7");
  assert.equal(manifest.background_color, "#f5f5f7");

  // Validate icons array
  assert.equal(Array.isArray(manifest.icons), true);
  assert.ok(manifest.icons.length >= 3, "Manifest must have at least 192, 512, and maskable icons");

  const has192 = manifest.icons.some(
    (i: { sizes: string; purpose?: string }) => i.sizes === "192x192" && (i.purpose === "any" || !i.purpose)
  );
  const has512 = manifest.icons.some(
    (i: { sizes: string; purpose?: string }) => i.sizes === "512x512" && (i.purpose === "any" || !i.purpose)
  );
  const hasMaskable = manifest.icons.some(
    (i: { sizes: string; purpose?: string }) => i.sizes === "512x512" && i.purpose === "maskable"
  );

  assert.equal(has192, true, "Manifest must have 192x192 icon");
  assert.equal(has512, true, "Manifest must have 512x512 icon");
  assert.equal(hasMaskable, true, "Manifest must have 512x512 maskable icon");
});

test("All PWA icons exist on disk with valid file size", () => {
  const icons = [
    "public/icons/icon-192.png",
    "public/icons/icon-512.png",
    "public/icons/icon-maskable-512.png",
    "public/icons/apple-touch-icon.png",
  ];

  for (const iconPath of icons) {
    const fullPath = path.resolve(iconPath);
    assert.equal(fs.existsSync(fullPath), true, `${iconPath} must exist`);
    const stat = fs.statSync(fullPath);
    assert.ok(stat.size > 500, `${iconPath} must have non-trivial size`);
  }
});

test("Service worker sw.js exists and implements required lifecycle events", () => {
  const swPath = path.resolve("public/sw.js");
  assert.equal(fs.existsSync(swPath), true, "sw.js must exist in public/");

  const content = fs.readFileSync(swPath, "utf8");

  assert.ok(content.includes("addEventListener('install'"), "Must have install event");
  assert.ok(content.includes("addEventListener('activate'"), "Must have activate event");
  assert.ok(content.includes("addEventListener('fetch'"), "Must have fetch event");
  assert.ok(content.includes("addEventListener('message'"), "Must have message event");
  assert.ok(content.includes("SKIP_WAITING"), "Must handle SKIP_WAITING message");
  assert.ok(content.includes("caches.delete"), "Must prune old caches on activate");
});
