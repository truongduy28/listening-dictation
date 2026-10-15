import { describe, it, expect } from "vitest";
import {
  buildQueue,
  getQueueIndex,
  getNextQueueFile,
  getPrevQueueFile,
  getQueueStatus,
} from "@/lib/queue";
import type { AudioFile } from "@/lib/file-system";

function createMockFile(
  id: string,
  name: string,
  index: number,
  listened = false,
  starred = false
): AudioFile {
  return {
    id,
    name,
    index,
    file: {} as File,
    listened,
    starred,
  };
}

const mockFiles: AudioFile[] = [
  createMockFile("f1", "Track 01.mp3", 1, true, false),
  createMockFile("f2", "Track 02.mp3", 2, false, true),
  createMockFile("f3", "Track 03.mp3", 3, true, true),
  createMockFile("f4", "Track 04.mp3", 4, false, false),
  createMockFile("f5", "Track 05.mp3", 5, false, true),
];

describe("lib/queue", () => {
  it("buildQueue filters correctly", () => {
    // All
    expect(buildQueue(mockFiles, "all")).toHaveLength(5);

    // Unheard
    const unheard = buildQueue(mockFiles, "unheard");
    expect(unheard).toHaveLength(3);
    expect(unheard.map((f) => f.id)).toEqual(["f2", "f4", "f5"]);

    // Listened
    const listened = buildQueue(mockFiles, "listened");
    expect(listened).toHaveLength(2);
    expect(listened.map((f) => f.id)).toEqual(["f1", "f3"]);

    // Starred
    const starred = buildQueue(mockFiles, "starred");
    expect(starred).toHaveLength(3);
    expect(starred.map((f) => f.id)).toEqual(["f2", "f3", "f5"]);

    // Search query matches name
    const searched = buildQueue(mockFiles, "all", "03");
    expect(searched).toHaveLength(1);
    expect(searched[0].id).toBe("f3");

    // Search query matches index
    const searchedIdx = buildQueue(mockFiles, "all", "5");
    expect(searchedIdx).toHaveLength(1);
    expect(searchedIdx[0].id).toBe("f5");
  });

  it("getQueueIndex returns correct index or -1", () => {
    const queue = [mockFiles[1], mockFiles[2], mockFiles[4]]; // f2, f3, f5
    expect(getQueueIndex(queue, "f2")).toBe(0);
    expect(getQueueIndex(queue, "f3")).toBe(1);
    expect(getQueueIndex(queue, "f5")).toBe(2);
    expect(getQueueIndex(queue, "f1")).toBe(-1);
    expect(getQueueIndex(queue, null)).toBe(-1);
    expect(getQueueIndex([], "f2")).toBe(-1);
  });

  it("getNextQueueFile when current file is in queue", () => {
    const queue = [mockFiles[1], mockFiles[2], mockFiles[4]]; // f2 (idx 2), f3 (idx 3), f5 (idx 5)

    // f2 -> f3
    expect(getNextQueueFile(queue, mockFiles[1])?.id).toBe("f3");
    // f3 -> f5
    expect(getNextQueueFile(queue, mockFiles[2])?.id).toBe("f5");
    // f5 -> null (end of queue)
    expect(getNextQueueFile(queue, mockFiles[4])).toBeNull();
  });

  it("getNextQueueFile when current file is NOT in queue", () => {
    const queue = [mockFiles[1], mockFiles[2], mockFiles[4]]; // f2 (idx 2), f3 (idx 3), f5 (idx 5)

    // f1 (idx 1): next in queue with index > 1 is f2 (idx 2)
    expect(getNextQueueFile(queue, mockFiles[0])?.id).toBe("f2");

    // f4 (idx 4): next in queue with index > 4 is f5 (idx 5)
    expect(getNextQueueFile(queue, mockFiles[3])?.id).toBe("f5");

    // File with index 10 (after all in queue):
    const f10 = createMockFile("f10", "Track 10.mp3", 10);
    expect(getNextQueueFile(queue, f10)).toBeNull();
    // With fallbackToFirst:
    expect(getNextQueueFile(queue, f10, { fallbackToFirst: true })?.id).toBe("f2");
  });

  it("getPrevQueueFile navigation", () => {
    const queue = [mockFiles[1], mockFiles[2], mockFiles[4]]; // f2 (idx 2), f3 (idx 3), f5 (idx 5)

    // In queue: f5 -> f3
    expect(getPrevQueueFile(queue, mockFiles[4])?.id).toBe("f3");
    // In queue: f3 -> f2
    expect(getPrevQueueFile(queue, mockFiles[2])?.id).toBe("f2");
    // In queue at start: f2 -> null
    expect(getPrevQueueFile(queue, mockFiles[1])).toBeNull();

    // Out of queue: f4 (idx 4): last in queue with index < 4 is f3 (idx 3)
    expect(getPrevQueueFile(queue, mockFiles[3])?.id).toBe("f3");

    // Out of queue before start: f1 (idx 1) -> returns queue[0] (f2)
    expect(getPrevQueueFile(queue, mockFiles[0])?.id).toBe("f2");
  });

  it("getQueueStatus formatting", () => {
    const queue = [mockFiles[1], mockFiles[2], mockFiles[4]]; // 3 items

    // Current file in queue
    const statusIn = getQueueStatus({ queue, currentFile: mockFiles[2] });
    expect(statusIn.isInQueue).toBe(true);
    expect(statusIn.current).toBe(2);
    expect(statusIn.total).toBe(3);
    expect(statusIn.displayCounter).toBe("2 / 3");

    // Current file out of queue
    const statusOut = getQueueStatus({ queue, currentFile: mockFiles[0] });
    expect(statusOut.isInQueue).toBe(false);
    expect(statusOut.current).toBe(0);
    expect(statusOut.total).toBe(3);
    expect(statusOut.displayCounter).toBe("– / 3");

    // Empty queue
    const statusEmpty = getQueueStatus({ queue: [], currentFile: null });
    expect(statusEmpty.isInQueue).toBe(false);
    expect(statusEmpty.current).toBe(0);
    expect(statusEmpty.total).toBe(0);
    expect(statusEmpty.displayCounter).toBe("0 / 0");
  });
});
