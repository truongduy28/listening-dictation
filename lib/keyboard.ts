// Global keyboard shortcuts helper and action classifier

export type ShortcutAction =
  | "togglePlay"
  | "rewind"
  | "forward"
  | "prev"
  | "next"
  | "speedDown"
  | "speedUp"
  | "replay"
  | "toggleStar"
  | "toggleMute"
  | "setA"
  | "setB"
  | "clearAB";

/**
 * Checks if the focused element is a text input, textarea, select, or contenteditable.
 */
export function isEditableElement(element: Element | null): boolean {
  if (!element) return false;
  const tagName = element.tagName;
  if (
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    tagName === "SELECT" ||
    (element as HTMLElement).isContentEditable ||
    element.getAttribute("contenteditable") === "true"
  ) {
    return true;
  }
  return false;
}

/**
 * Maps a KeyboardEvent to a known player action, or null if unrelated.
 */
export function getShortcutAction(event: KeyboardEvent): ShortcutAction | null {
  // Ignore with meta/ctrl modifiers (prevent interfering with browser shortcuts like Cmd+R)
  if (event.metaKey || event.ctrlKey || event.altKey) {
    return null;
  }

  // Space: Toggle Play / Pause
  if (event.code === "Space") {
    return "togglePlay";
  }

  // ArrowLeft: Rewind
  if (event.key === "ArrowLeft") {
    return "rewind";
  }

  // ArrowRight: Fast-forward
  if (event.key === "ArrowRight") {
    return "forward";
  }

  // ArrowUp: Previous file
  if (event.key === "ArrowUp") {
    return "prev";
  }

  // ArrowDown: Next file
  if (event.key === "ArrowDown") {
    return "next";
  }

  // [: Decrease playback rate
  if (event.key === "[" || event.code === "BracketLeft") {
    return "speedDown";
  }

  // ]: Increase playback rate
  if (event.key === "]" || event.code === "BracketRight") {
    return "speedUp";
  }

  // R: Replay from beginning
  if (event.key === "r" || event.key === "R" || event.code === "KeyR") {
    return "replay";
  }

  // S: Toggle Star
  if (event.key === "s" || event.key === "S" || event.code === "KeyS") {
    return "toggleStar";
  }

  // M: Toggle Mute
  if (event.key === "m" || event.key === "M" || event.code === "KeyM") {
    return "toggleMute";
  }

  // A: Set Point A
  if (event.key === "a" || event.key === "A" || event.code === "KeyA") {
    return "setA";
  }

  // B: Set Point B
  if (event.key === "b" || event.key === "B" || event.code === "KeyB") {
    return "setB";
  }

  // X: Clear A-B Loop
  if (event.key === "x" || event.key === "X" || event.code === "KeyX") {
    return "clearAB";
  }

  return null;
}
