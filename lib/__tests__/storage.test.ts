import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_SETTINGS,
  getStoredSettings,
  saveStoredSettings,
  getRecentFolders,
  saveRecentFolder,
  clearAllStorage,
} from "../storage.ts";

test("storage: default settings when localStorage is empty", () => {
  const store = new Map<string, string>();
  globalThis.window = {} as unknown as Window & typeof globalThis;
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, val: string) => {
      store.set(key, val);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    length: store.size,
  };

  const settings = getStoredSettings();
  assert.equal(settings.volume, DEFAULT_SETTINGS.volume);
  assert.equal(settings.playbackRate, DEFAULT_SETTINGS.playbackRate);
  assert.equal(settings.autoNext, true);

  // Update volume & check persistence
  saveStoredSettings({ volume: 0.5 });
  const updated = getStoredSettings();
  assert.equal(updated.volume, 0.5);

  // Recent folder save & cap at 3
  saveRecentFolder({
    folderName: "ETS 2024 Test 1",
    lastFile: "track-01.mp3",
    totalFiles: 100,
    lastIndex: 5,
  });
  saveRecentFolder({
    folderName: "ETS 2024 Test 2",
    lastFile: "track-01.mp3",
    totalFiles: 50,
    lastIndex: 2,
  });
  saveRecentFolder({
    folderName: "ETS 2024 Test 3",
    lastFile: "track-01.mp3",
    totalFiles: 30,
    lastIndex: 1,
  });
  saveRecentFolder({
    folderName: "ETS 2024 Test 4",
    lastFile: "track-01.mp3",
    totalFiles: 40,
    lastIndex: 1,
  });

  const recents = getRecentFolders();
  assert.equal(recents.length, 3);
  assert.equal(recents[0].folderName, "ETS 2024 Test 4");

  // Clear all
  clearAllStorage();
  assert.equal(store.size, 0);

  // Clean up global mocks
  // @ts-expect-error cleanup
  delete globalThis.window;
  // @ts-expect-error cleanup
  delete globalThis.localStorage;
});
