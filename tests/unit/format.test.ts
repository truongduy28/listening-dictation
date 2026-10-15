import { describe, it, expect } from "vitest";
import { formatTime, formatFileName, formatFileIndex } from "@/lib/format";

describe("lib/format", () => {
  it("formatTime handles edge cases and large values", () => {
    // 0s and negative
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(-5)).toBe("00:00");
    expect(formatTime(NaN)).toBe("00:00");
    expect(formatTime(Infinity)).toBe("00:00");

    // < 10s
    expect(formatTime(5.4)).toBe("00:05");
    expect(formatTime(9)).toBe("00:09");

    // 59.9s and 60s
    expect(formatTime(59.9)).toBe("00:59");
    expect(formatTime(60)).toBe("01:00");

    // 3599s (59 mins 59 secs)
    expect(formatTime(3599)).toBe("59:59");

    // >= 1h
    expect(formatTime(3600)).toBe("01:00:00");
    expect(formatTime(3665)).toBe("01:01:05");
    expect(formatTime(7325)).toBe("02:02:05");
  });

  it("formatFileName removes audio extensions cleanly", () => {
    expect(formatFileName("lesson1.mp3")).toBe("lesson1");
    expect(formatFileName("Track 01.M4A")).toBe("Track 01");
    expect(formatFileName("audio.wav")).toBe("audio");
    expect(formatFileName("no-extension")).toBe("no-extension");
    expect(formatFileName("")).toBe("");
  });

  it("formatFileIndex formats 2 or 3 digit numbers", () => {
    expect(formatFileIndex(5, 50)).toBe("05");
    expect(formatFileIndex(5, 120)).toBe("005");
    expect(formatFileIndex(12, 150)).toBe("012");
    expect(formatFileIndex(120, 150)).toBe("120");
    expect(formatFileIndex(-1)).toBe("01");
  });
});
