"use client";

import { useEffect, useCallback } from "react";
import { isEditableElement, getShortcutAction } from "@/lib/keyboard";

export interface KeyboardShortcutsOptions {
  disabled?: boolean;
  onTogglePlay: () => void;
  onRewind: () => void;
  onForward: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSpeedDown: () => void;
  onSpeedUp: () => void;
  onReplay: () => void;
  onToggleStar?: () => void;
  onToggleMute?: () => void;
  onSetA?: () => void;
  onSetB?: () => void;
  onClearAB?: () => void;
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
  onToggleStar,
  onToggleMute,
  onSetA,
  onSetB,
  onClearAB,
}: KeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      if (isEditableElement(document.activeElement)) return;

      const action = getShortcutAction(e);
      if (!action) return;

      e.preventDefault();

      switch (action) {
        case "togglePlay":
          onTogglePlay();
          break;
        case "rewind":
          onRewind();
          break;
        case "forward":
          onForward();
          break;
        case "prev":
          onPrev();
          break;
        case "next":
          onNext();
          break;
        case "speedDown":
          onSpeedDown();
          break;
        case "speedUp":
          onSpeedUp();
          break;
        case "replay":
          onReplay();
          break;
        case "toggleStar":
          onToggleStar?.();
          break;
        case "toggleMute":
          onToggleMute?.();
          break;
        case "setA":
          onSetA?.();
          break;
        case "setB":
          onSetB?.();
          break;
        case "clearAB":
          onClearAB?.();
          break;
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
      onToggleStar,
      onToggleMute,
      onSetA,
      onSetB,
      onClearAB,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
