// Formatting helpers for time and file labels

/**
 * Format seconds into mm:ss or hh:mm:ss
 * Gracefully handles negative numbers, NaN, and Infinity by clamping to 0.
 */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "00:00";
  }

  const rounded = Math.floor(seconds);
  const hrs = Math.floor(rounded / 3600);
  const mins = Math.floor((rounded % 3600) / 60);
  const secs = rounded % 60;

  const mm = String(mins).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");

  if (hrs > 0) {
    const hh = String(hrs).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }

  return `${mm}:${ss}`;
}

/**
 * Strips common audio file extensions from a filename.
 */
export function formatFileName(name: string): string {
  if (!name) return "";
  return name.replace(/\.(mp3|m4a|wav|aac|flac|ogg)$/i, "");
}

/**
 * Formats a 1-based index into a padded 2-digit or 3-digit string.
 */
export function formatFileIndex(index: number, total: number = 0): string {
  if (!Number.isFinite(index) || index <= 0) return "01";
  const padLength = total >= 100 ? 3 : 2;
  return String(index).padStart(padLength, "0");
}
