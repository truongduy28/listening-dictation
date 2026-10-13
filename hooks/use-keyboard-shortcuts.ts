"use client";

import { useEffect, useCallback } from "react";

interface KeyboardShortcutsOptions {
  disabled?: boolean;
  onTogglePlay: () => void;
  onRewind: () => void;
  onForward: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSpeedDown: () => void;
  onSpeedUp: () => void;
  onReplay: () => void;
}

/**
 * Hook to register global keyboard shortcuts for the dictation player.
 * Automatically ignores shortcuts when focus is inside text fields or when disabled.
 */
export function useKeyboardShortcuts({
  disabled = false,
  onTogglePlay,
  onRewind,
  onForward,
  onPrev,
  onNext,
  onSpeedDown,
  onSpeedUp,
  onReplay,
}: KeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;

      // Ignore when focusing input, textarea, select, or contenteditable elements
      const active = document.activeElement;
      if (
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.tagName === "SELECT" ||
          (active as HTMLElement).isContentEditable)
      ) {
        return;
      }

      // Space: Toggle Play / Pause
      if (e.code === "Space") {
        e.preventDefault();
        onTogglePlay();
        return;
      }

      // Left Arrow: Rewind
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onRewind();
        return;
      }

      // Right Arrow: Fast-forward
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onForward();
        return;
      }

      // Up Arrow: Previous file
      if (e.key === "ArrowUp") {
        e.preventDefault();
        onPrev();
        return;
      }

      // Down Arrow: Next file
      if (e.key === "ArrowDown") {
        e.preventDefault();
        onNext();
        return;
      }

      // [: Decrease playback rate
      if (e.key === "[" || e.code === "BracketLeft") {
        e.preventDefault();
        onSpeedDown();
        return;
      }

      // ]: Increase playback rate
      if (e.key === "]" || e.code === "BracketRight") {
        e.preventDefault();
        onSpeedUp();
        return;
      }

      // R: Replay from beginning
      if (e.key === "r" || e.key === "R" || e.code === "KeyR") {
        e.preventDefault();
        onReplay();
        return;
      }
    },
    [
      disabled,
      onTogglePlay,
      onRewind,
      onForward,
      onPrev,
      onNext,
      onSpeedDown,
      onSpeedUp,
      onReplay,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
