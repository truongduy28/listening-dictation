import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOnlineStatus } from "@/hooks/use-online-status";

describe("hooks/useOnlineStatus", () => {
  it("tracks online and offline events", () => {
    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
      writable: true,
    });

    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);

    // Trigger offline
    act(() => {
      Object.defineProperty(navigator, "onLine", { value: false });
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current).toBe(false);

    // Trigger online
    act(() => {
      Object.defineProperty(navigator, "onLine", { value: true });
      window.dispatchEvent(new Event("online"));
    });
    expect(result.current).toBe(true);
  });
});
