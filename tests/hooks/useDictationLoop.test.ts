import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDictationLoop } from "@/hooks/use-dictation-loop";

describe("hooks/useDictationLoop", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes with default values", () => {
    const { result } = renderHook(() => useDictationLoop());
    expect(result.current.currentRepeat).toBe(1);
    expect(result.current.isWaitingGap).toBe(false);
    expect(result.current.gapCountdown).toBe(0);
  });

  it("startGapWait completes immediately if seconds <= 0", () => {
    const { result } = renderHook(() => useDictationLoop());
    const onComplete = vi.fn();

    act(() => {
      result.current.startGapWait(0, onComplete);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(result.current.isWaitingGap).toBe(false);
  });

  it("startGapWait counts down and executes onComplete", () => {
    const { result } = renderHook(() => useDictationLoop());
    const onComplete = vi.fn();

    act(() => {
      result.current.startGapWait(2, onComplete);
    });

    expect(result.current.isWaitingGap).toBe(true);
    expect(result.current.gapCountdown).toBe(2);

    // Fast forward 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.gapCountdown).toBe(1);
    expect(onComplete).not.toHaveBeenCalled();

    // Fast forward second second
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.isWaitingGap).toBe(false);
    expect(result.current.gapCountdown).toBe(0);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("clearGapTimer cancels countdown", () => {
    const { result } = renderHook(() => useDictationLoop());
    const onComplete = vi.fn();

    act(() => {
      result.current.startGapWait(5, onComplete);
    });
    expect(result.current.isWaitingGap).toBe(true);

    act(() => {
      result.current.clearGapTimer();
    });
    expect(result.current.isWaitingGap).toBe(false);
    expect(result.current.gapCountdown).toBe(0);

    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("resetLoop resets repeat and clears timer", () => {
    const { result } = renderHook(() => useDictationLoop());
    act(() => {
      result.current.setCurrentRepeat(3);
    });
    expect(result.current.currentRepeat).toBe(3);

    act(() => {
      result.current.resetLoop();
    });
    expect(result.current.currentRepeat).toBe(1);
  });
});
