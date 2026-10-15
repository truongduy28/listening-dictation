import test from "node:test";
import assert from "node:assert/strict";
import {
  clampTime,
  setPointA,
  setPointB,
  clearAbLoop,
  isAbLoopActive,
  shouldLoopBack,
  type AbLoop,
} from "../abLoop.ts";

test("clampTime clamps properly", () => {
  assert.equal(clampTime(-1), 0);
  assert.equal(clampTime(2.456), 2.46);
  assert.equal(clampTime(12.5, 10), 10);
});

test("setPointA basic behavior", () => {
  let loop: AbLoop = { a: null, b: null };

  // Set A when B is null
  loop = setPointA(loop, 2.5);
  assert.deepEqual(loop, { a: 2.5, b: null });
  assert.equal(isAbLoopActive(loop), false);

  // Set A when B is set (valid difference)
  loop = { a: 1.0, b: 5.0 };
  loop = setPointA(loop, 3.0);
  assert.deepEqual(loop, { a: 3.0, b: 5.0 });

  // Set A with diff < 0.3s (e.g. 4.8s when B is 5.0) -> rejected!
  const rejected = setPointA(loop, 4.8);
  assert.deepEqual(rejected, { a: 3.0, b: 5.0 });

  // Set A > B -> swaps A and B! (e.g. A at 8.0s when B is 5.0s)
  const swapped = setPointA(loop, 8.0);
  assert.deepEqual(swapped, { a: 5.0, b: 8.0 });
});

test("setPointB basic behavior", () => {
  let loop: AbLoop = { a: null, b: null };

  // Set B when A is null: sets A = 0
  loop = setPointB(loop, 4.0);
  assert.deepEqual(loop, { a: 0, b: 4.0 });
  assert.equal(isAbLoopActive(loop), true);

  // Set B < 0.3s when A is null -> rejected (< 0.3s)
  const rejectedNullA = setPointB({ a: null, b: null }, 0.2);
  assert.deepEqual(rejectedNullA, { a: null, b: null });

  // Set B when A is set (valid)
  loop = { a: 2.0, b: null };
  loop = setPointB(loop, 5.0);
  assert.deepEqual(loop, { a: 2.0, b: 5.0 });

  // Set B with diff < 0.3s (e.g. 2.1s when A is 2.0) -> rejected!
  const rejectedDiff = setPointB(loop, 2.1);
  assert.deepEqual(rejectedDiff, { a: 2.0, b: 5.0 });

  // Set B < A -> swaps A and B! (e.g. B at 0.5s when A is 2.0s)
  const swapped = setPointB(loop, 0.5);
  assert.deepEqual(swapped, { a: 0.5, b: 2.0 });
});

test("clearAbLoop resets loop", () => {
  assert.deepEqual(clearAbLoop(), { a: null, b: null });
});

test("shouldLoopBack triggers accurately", () => {
  const loop: AbLoop = { a: 2.0, b: 6.0 };

  // Before B - 0.05 (e.g. 5.90)
  assert.equal(shouldLoopBack(5.90, loop), false);

  // At threshold (5.95)
  assert.equal(shouldLoopBack(5.95, loop), true);

  // Past B (6.05)
  assert.equal(shouldLoopBack(6.05, loop), true);

  // When loop is inactive (e.g. only A set)
  assert.equal(shouldLoopBack(6.05, { a: 2.0, b: null }), false);
});
