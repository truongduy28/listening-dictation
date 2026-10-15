"use client";

import { useSyncExternalStore } from "react";

function subscribeDarkMode(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getDarkModeSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useDarkMode(): boolean {
  return useSyncExternalStore(subscribeDarkMode, getDarkModeSnapshot, getServerSnapshot);
}
