import { describe, it, expect } from "vitest";
import {
  clampTime,
  setPointA,
  setPointB,
  clearAbLoop,
  isAbLoopActive,
  shouldLoopBack,
  type AbLoop,
} from "@/lib/abLoop";

describe("lib/abLoop", () => {
  it("clampTime clamps properly", () => {
    expect(clampTime(-1)).toBe(0);
    expect(clampTime(2.456)).toBe(2.46);
    expect(clampTime(12.5, 10)).toBe(10);
  });

  it("setPointA basic behavior", () => {
    let loop: AbLoop = { a: null, b: null };

    // Set A when B is null
    loop = setPointA(loop, 2.5);
    expect(loop).toEqual({ a: 2.5, b: null });
    expect(isAbLoopActive(loop)).toBe(false);

    // Set A when B is set (valid difference)
    loop = { a: 1.0, b: 5.0 };
    loop = setPointA(loop, 3.0);
    expect(loop).toEqual({ a: 3.0, b: 5.0 });

    // Set A with diff < 0.3s (e.g. 4.8s when B is 5.0) -> rejected!
    const rejected = setPointA(loop, 4.8);
    expect(rejected).toEqual({ a: 3.0, b: 5.0 });

    // Set A > B -> swaps A and B! (e.g. A at 8.0s when B is 5.0s)
    const swapped = setPointA(loop, 8.0);
    expect(swapped).toEqual({ a: 5.0, b: 8.0 });
  });

  it("setPointB basic behavior", () => {
    let loop: AbLoop = { a: null, b: null };

    // Set B when A is null: sets A = 0
    loop = setPointB(loop, 4.0);
    expect(loop).toEqual({ a: 0, b: 4.0 });
    expect(isAbLoopActive(loop)).toBe(true);

    // Set B < 0.3s when A is null -> rejected (< 0.3s)
    const rejectedNullA = setPointB({ a: null, b: null }, 0.2);
    expect(rejectedNullA).toEqual({ a: null, b: null });

    // Set B when A is set (valid)
    loop = { a: 2.0, b: null };
    loop = setPointB(loop, 5.0);
    expect(loop).toEqual({ a: 2.0, b: 5.0 });

    // Set B with diff < 0.3s (e.g. 2.1s when A is 2.0) -> rejected!
    const rejectedDiff = setPointB(loop, 2.1);
    expect(rejectedDiff).toEqual({ a: 2.0, b: 5.0 });

    // Set B < A -> swaps A and B! (e.g. B at 0.5s when A is 2.0s)
    const swapped = setPointB(loop, 0.5);
    expect(swapped).toEqual({ a: 0.5, b: 2.0 });
  });

  it("clearAbLoop resets loop", () => {
    expect(clearAbLoop()).toEqual({ a: null, b: null });
  });

  it("shouldLoopBack triggers accurately", () => {
    const loop: AbLoop = { a: 2.0, b: 6.0 };

    // Before B - 0.05 (e.g. 5.90)
    expect(shouldLoopBack(5.90, loop)).toBe(false);

    // At threshold (5.95)
    expect(shouldLoopBack(5.95, loop)).toBe(true);

    // Past B (6.05)
    expect(shouldLoopBack(6.05, loop)).toBe(true);

    // When loop is inactive (e.g. only A set)
    expect(shouldLoopBack(6.05, { a: 2.0, b: null })).toBe(false);
  });
});
