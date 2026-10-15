import test from "node:test";
import assert from "node:assert/strict";
import {
  buildQueue,
  getQueueIndex,
  getNextQueueFile,
  getPrevQueueFile,
  getQueueStatus,
} from "../queue.ts";
import type { AudioFile } from "../file-system.ts";

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

test("buildQueue filters correctly", () => {
  // All
  assert.equal(buildQueue(mockFiles, "all").length, 5);

  // Unheard
  const unheard = buildQueue(mockFiles, "unheard");
  assert.equal(unheard.length, 3);
  assert.deepEqual(
    unheard.map((f) => f.id),
    ["f2", "f4", "f5"]
  );

  // Listened
  const listened = buildQueue(mockFiles, "listened");
  assert.equal(listened.length, 2);
  assert.deepEqual(
    listened.map((f) => f.id),
    ["f1", "f3"]
  );

  // Starred
  const starred = buildQueue(mockFiles, "starred");
  assert.equal(starred.length, 3);
  assert.deepEqual(
    starred.map((f) => f.id),
    ["f2", "f3", "f5"]
  );

  // Search query matches name
  const searched = buildQueue(mockFiles, "all", "03");
  assert.equal(searched.length, 1);
  assert.equal(searched[0].id, "f3");

  // Search query matches index
  const searchedIdx = buildQueue(mockFiles, "all", "5");
  assert.equal(searchedIdx.length, 1);
  assert.equal(searchedIdx[0].id, "f5");
});

test("getQueueIndex returns correct index or -1", () => {
  const queue = [mockFiles[1], mockFiles[2], mockFiles[4]]; // f2, f3, f5
  assert.equal(getQueueIndex(queue, "f2"), 0);
  assert.equal(getQueueIndex(queue, "f3"), 1);
  assert.equal(getQueueIndex(queue, "f5"), 2);
  assert.equal(getQueueIndex(queue, "f1"), -1);
  assert.equal(getQueueIndex(queue, null), -1);
  assert.equal(getQueueIndex([], "f2"), -1);
});

test("getNextQueueFile when current file is in queue", () => {
  const queue = [mockFiles[1], mockFiles[2], mockFiles[4]]; // f2 (idx 2), f3 (idx 3), f5 (idx 5)

  // f2 -> f3
  assert.equal(getNextQueueFile(queue, mockFiles[1])?.id, "f3");
  // f3 -> f5
  assert.equal(getNextQueueFile(queue, mockFiles[2])?.id, "f5");
  // f5 -> null (end of queue)
  assert.equal(getNextQueueFile(queue, mockFiles[4]), null);
});

test("getNextQueueFile when current file is NOT in queue", () => {
  const queue = [mockFiles[1], mockFiles[2], mockFiles[4]]; // f2 (idx 2), f3 (idx 3), f5 (idx 5)

  // f1 (idx 1): next in queue with index > 1 is f2 (idx 2)
  assert.equal(getNextQueueFile(queue, mockFiles[0])?.id, "f2");

  // f4 (idx 4): next in queue with index > 4 is f5 (idx 5)
  assert.equal(getNextQueueFile(queue, mockFiles[3])?.id, "f5");

  // File with index 10 (after all in queue):
  const f10 = createMockFile("f10", "Track 10.mp3", 10);
  assert.equal(getNextQueueFile(queue, f10), null);
  // With fallbackToFirst:
  assert.equal(getNextQueueFile(queue, f10, { fallbackToFirst: true })?.id, "f2");
});

test("getPrevQueueFile navigation", () => {
  const queue = [mockFiles[1], mockFiles[2], mockFiles[4]]; // f2 (idx 2), f3 (idx 3), f5 (idx 5)

  // In queue: f5 -> f3
  assert.equal(getPrevQueueFile(queue, mockFiles[4])?.id, "f3");
  // In queue: f3 -> f2
  assert.equal(getPrevQueueFile(queue, mockFiles[2])?.id, "f2");
  // In queue at start: f2 -> null
  assert.equal(getPrevQueueFile(queue, mockFiles[1]), null);

  // Out of queue: f4 (idx 4): last in queue with index < 4 is f3 (idx 3)
  assert.equal(getPrevQueueFile(queue, mockFiles[3])?.id, "f3");

  // Out of queue before start: f1 (idx 1) -> returns queue[0] (f2)
  assert.equal(getPrevQueueFile(queue, mockFiles[0])?.id, "f2");
});

test("getQueueStatus formatting", () => {
  const queue = [mockFiles[1], mockFiles[2], mockFiles[4]]; // 3 items

  // Current file in queue
  const statusIn = getQueueStatus({ queue, currentFile: mockFiles[2] });
  assert.equal(statusIn.isInQueue, true);
  assert.equal(statusIn.current, 2);
  assert.equal(statusIn.total, 3);
  assert.equal(statusIn.displayCounter, "2 / 3");

  // Current file out of queue
  const statusOut = getQueueStatus({ queue, currentFile: mockFiles[0] });
  assert.equal(statusOut.isInQueue, false);
  assert.equal(statusOut.current, 0);
  assert.equal(statusOut.total, 3);
  assert.equal(statusOut.displayCounter, "– / 3");

  // Empty queue
  const statusEmpty = getQueueStatus({ queue: [], currentFile: null });
  assert.equal(statusEmpty.isInQueue, false);
  assert.equal(statusEmpty.current, 0);
  assert.equal(statusEmpty.total, 0);
  assert.equal(statusEmpty.displayCounter, "0 / 0");
});
