import { describe, it, expect } from "vitest";
import { naturalCompare, naturalSort } from "@/lib/naturalSort";

describe("lib/naturalSort", () => {
  it("numbers in strings order numerically (2 < 10)", () => {
    expect(naturalCompare("track2.mp3", "track10.mp3")).toBeLessThan(0);
    expect(naturalCompare("track10.mp3", "track2.mp3")).toBeGreaterThan(0);
    expect(naturalCompare("part 1", "part 1")).toBe(0);
  });

  it("handles leading zeros properly", () => {
    expect(naturalCompare("01.mp3", "001.mp3")).toBeLessThanOrEqual(0);
    expect(naturalCompare("02.mp3", "10.mp3")).toBeLessThan(0);
  });

  it("handles case-insensitivity and Unicode / Vietnamese characters", () => {
    expect(naturalCompare("Âm thanh 1", "Âm thanh 2")).toBeLessThan(0);
    expect(naturalCompare("Bài 2", "bài 10")).toBeLessThan(0);
  });

  it("handles empty strings and strings without numbers", () => {
    expect(naturalCompare("", "alpha")).toBeLessThan(0);
    expect(naturalCompare("beta", "")).toBeGreaterThan(0);
    expect(naturalCompare("apple", "banana")).toBeLessThan(0);
  });

  it("naturalSort sorts arrays stably and preserves elements", () => {
    const list = [
      { name: "track10.mp3", id: 1 },
      { name: "track2.mp3", id: 2 },
      { name: "track1.mp3", id: 3 },
      { name: "track2.mp3", id: 4 }, // duplicate name for stability check
    ];

    const sorted = naturalSort(list, (x) => x.name);
    expect(sorted.map((x) => x.id)).toEqual([3, 2, 4, 1]);

    // Empty array and single element
    expect(naturalSort([], (x) => x)).toEqual([]);
    expect(naturalSort(["only"], (x) => x)).toEqual(["only"]);
  });
});
