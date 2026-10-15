import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

describe("hooks/useKeyboardShortcuts", () => {
  it("triggers callbacks on valid key events", () => {
    const onTogglePlay = vi.fn();
    const onRewind = vi.fn();
    const onForward = vi.fn();
    const onPrev = vi.fn();
    const onNext = vi.fn();
    const onSpeedDown = vi.fn();
    const onSpeedUp = vi.fn();
    const onReplay = vi.fn();
    const onToggleStar = vi.fn();
    const onToggleMute = vi.fn();
    const onSetA = vi.fn();
    const onSetB = vi.fn();
    const onClearAB = vi.fn();

    renderHook(() =>
      useKeyboardShortcuts({
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
      })
    );

    window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
    expect(onTogglePlay).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "s" }));
    expect(onToggleStar).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "m" }));
    expect(onToggleMute).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    expect(onSetA).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "b" }));
    expect(onSetB).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "x" }));
    expect(onClearAB).toHaveBeenCalledTimes(1);
  });

  it("does not trigger when disabled", () => {
    const onTogglePlay = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        disabled: true,
        onTogglePlay,
        onRewind: vi.fn(),
        onForward: vi.fn(),
        onPrev: vi.fn(),
        onNext: vi.fn(),
        onSpeedDown: vi.fn(),
        onSpeedUp: vi.fn(),
        onReplay: vi.fn(),
      })
    );

    window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
    expect(onTogglePlay).not.toHaveBeenCalled();
  });
});
