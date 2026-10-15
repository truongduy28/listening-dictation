export const MIN_AB_DURATION = 0.3; // 300ms minimum duration

export interface AbLoop {
  a: number | null;
  b: number | null;
}

/**
 * Clamp a second value within [0, duration] with 2 decimal precision.
 */
export function clampTime(time: number, duration: number = Infinity): number {
  if (isNaN(time) || time < 0) return 0;
  const max = duration > 0 && isFinite(duration) ? duration : Infinity;
  const clamped = Math.min(time, max);
  return Math.round(clamped * 100) / 100;
}

/**
 * Check if A-B loop is active (both points set and valid).
 */
export function isAbLoopActive(loop: AbLoop): boolean {
  if (loop.a === null || loop.b === null) return false;
  return loop.b - loop.a >= MIN_AB_DURATION;
}

/**
 * Set point A:
 * - If B is already set and time > B, swaps A and B (if diff >= 0.3s).
 * - If diff < 0.3s, rejects the change.
 */
export function setPointA(
  current: AbLoop,
  time: number,
  duration: number = Infinity
): AbLoop {
  const t = clampTime(time, duration);

  if (current.b === null) {
    return { a: t, b: null };
  }

  // B is already set
  if (t > current.b) {
    // Swap: new A is current.b, new B is t
    if (t - current.b < MIN_AB_DURATION) {
      return current; // Rejected (< 0.3s)
    }
    return { a: current.b, b: t };
  }

  // t <= current.b
  if (current.b - t < MIN_AB_DURATION) {
    return current; // Rejected (< 0.3s)
  }

  return { a: t, b: current.b };
}

/**
 * Set point B:
 * - If A is not set, sets A = 0 (if t >= 0.3s).
 * - If t < A, swaps A and B (if diff >= 0.3s).
 * - If diff < 0.3s, rejects the change.
 */
export function setPointB(
  current: AbLoop,
  time: number,
  duration: number = Infinity
): AbLoop {
  const t = clampTime(time, duration);

  // If A is not set yet, per spec: B when no A sets A = 0
  if (current.a === null) {
    if (t < MIN_AB_DURATION) {
      return current; // Rejected (< 0.3s)
    }
    return { a: 0, b: t };
  }

  // A is set
  if (t < current.a) {
    // Swap: new A is t, new B is current.a
    if (current.a - t < MIN_AB_DURATION) {
      return current; // Rejected (< 0.3s)
    }
    return { a: t, b: current.a };
  }

  // t >= current.a
  if (t - current.a < MIN_AB_DURATION) {
    return current; // Rejected (< 0.3s)
  }

  return { a: current.a, b: t };
}

/**
 * Clear A-B loop.
 */
export function clearAbLoop(): AbLoop {
  return { a: null, b: null };
}

/**
 * Checks if current playback position should trigger loop return to A.
 * Threshold defaults to 0.05s (50ms before point B).
 */
export function shouldLoopBack(
  currentTime: number,
  loop: AbLoop,
  threshold: number = 0.05
): boolean {
  if (!isAbLoopActive(loop)) return false;
  return currentTime >= (loop.b! - threshold);
}
