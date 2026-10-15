import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAbLoop } from "@/hooks/use-ab-loop";

describe("hooks/useAbLoop", () => {
  it("initializes inactive", () => {
    const { result } = renderHook(() => useAbLoop());
    expect(result.current.abLoop).toEqual({ a: null, b: null });
    expect(result.current.isActive).toBe(false);
  });

  it("sets points A and B and becomes active", () => {
    const { result } = renderHook(() => useAbLoop());

    act(() => {
      result.current.setA(2.0, 10);
    });
    expect(result.current.abLoop.a).toBe(2.0);
    expect(result.current.isActive).toBe(false);

    act(() => {
      result.current.setB(5.0, 10);
    });
    expect(result.current.abLoop).toEqual({ a: 2.0, b: 5.0 });
    expect(result.current.isActive).toBe(true);
  });

  it("clears loop", () => {
    const { result } = renderHook(() => useAbLoop());
    act(() => {
      result.current.setA(1.0, 10);
      result.current.setB(4.0, 10);
    });
    expect(result.current.isActive).toBe(true);

    act(() => {
      result.current.clear();
    });
    expect(result.current.abLoop).toEqual({ a: null, b: null });
    expect(result.current.isActive).toBe(false);
  });

  it("setExplicit updates state directly", () => {
    const { result } = renderHook(() => useAbLoop());
    act(() => {
      result.current.setExplicit({ a: 3.5, b: 7.2 });
    });
    expect(result.current.abLoop).toEqual({ a: 3.5, b: 7.2 });
    expect(result.current.isActive).toBe(true);
  });
});
