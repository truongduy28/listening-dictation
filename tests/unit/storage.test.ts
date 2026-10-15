import { describe, it, expect, beforeEach } from "vitest";
import {
  DEFAULT_SETTINGS,
  getStoredSettings,
  saveStoredSettings,
  getRecentFolders,
  saveRecentFolder,
  removeRecentFolder,
  clearAllStorage,
  getStoredSession,
  saveStoredSession,
  clearStoredSession,
  getStoredMarks,
  saveMark,
} from "@/lib/storage";
import legacyFixture from "../fixtures/legacy-storage.json";

describe("lib/storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("default settings when localStorage is empty", () => {
    const settings = getStoredSettings();
    expect(settings.volume).toBe(DEFAULT_SETTINGS.volume);
    expect(settings.playbackRate).toBe(DEFAULT_SETTINGS.playbackRate);
    expect(settings.autoNext).toBe(true);
  });

  it("saves and updates settings", () => {
    saveStoredSettings({ volume: 0.5, skipSeconds: 10 });
    const updated = getStoredSettings();
    expect(updated.volume).toBe(0.5);
    expect(updated.skipSeconds).toBe(10);
  });

  it("session storage functions properly", () => {
    expect(getStoredSession()).toBeNull();
    saveStoredSession({ folderName: "My Folder", lastFile: "01.mp3" });
    expect(getStoredSession()?.folderName).toBe("My Folder");
    expect(getStoredSession()?.lastFile).toBe("01.mp3");
  });

  it("marks storage functions properly", () => {
    expect(getStoredMarks()).toEqual({});
    saveMark("Folder A", "01.mp3", { listened: true, star: true });
    const marks = getStoredMarks();
    expect(marks["Folder A"]["01.mp3"].listened).toBe(true);
    expect(marks["Folder A"]["01.mp3"].star).toBe(true);
  });

  it("recent folders capped at 3 and deduplicated", () => {
    saveRecentFolder({ folderName: "F1", lastFile: "1.mp3", totalFiles: 10, lastIndex: 1 });
    saveRecentFolder({ folderName: "F2", lastFile: "1.mp3", totalFiles: 10, lastIndex: 1 });
    saveRecentFolder({ folderName: "F3", lastFile: "1.mp3", totalFiles: 10, lastIndex: 1 });
    saveRecentFolder({ folderName: "F4", lastFile: "1.mp3", totalFiles: 10, lastIndex: 1 });

    const recents = getRecentFolders();
    expect(recents).toHaveLength(3);
    expect(recents[0].folderName).toBe("F4");
  });

  it("legacy storage data compatibility", () => {
    // Load raw legacy fixture into localStorage
    for (const [key, value] of Object.entries(legacyFixture)) {
      localStorage.setItem(key, value);
    }

    const settings = getStoredSettings();
    expect(settings.language).toBe("vi");
    expect(settings.playbackRate).toBe(0.75);
    expect(settings.repeatCount).toBe(3);

    const session = getStoredSession();
    expect(session?.folderName).toBe("ETS TOEIC Test 01");

    const marks = getStoredMarks();
    expect(marks["ETS TOEIC Test 01"]["test01_part1_01.mp3"].star).toBe(true);

    const recents = getRecentFolders();
    expect(recents).toHaveLength(1);
    expect(recents[0].folderName).toBe("ETS TOEIC Test 01");
  });

  it("clears session and removes recent folders", () => {
    saveStoredSession({ folderName: "Temp", lastFile: "test.mp3" });
    clearStoredSession();
    expect(getStoredSession()).toBeNull();

    saveRecentFolder({ folderName: "Keep", lastFile: "1.mp3", totalFiles: 1, lastIndex: 1 });
    saveRecentFolder({ folderName: "RemoveMe", lastFile: "2.mp3", totalFiles: 1, lastIndex: 1 });
    removeRecentFolder("RemoveMe");
    const recents = getRecentFolders();
    expect(recents.some((f) => f.folderName === "RemoveMe")).toBe(false);
    expect(recents.some((f) => f.folderName === "Keep")).toBe(true);
  });

  it("handles corrupted JSON gracefully", () => {
    localStorage.setItem("dictation_settings", "invalid-json{{");
    localStorage.setItem("dictation_session", "{broken");
    localStorage.setItem("dictation_marks", "corrupt");

    expect(getStoredSettings()).toEqual(DEFAULT_SETTINGS);
    expect(getStoredSession()).toBeNull();
    expect(getStoredMarks()).toEqual({});
  });

  it("clearAllStorage cleans all keys", () => {
    saveStoredSettings({ volume: 0.2 });
    saveStoredSession({ folderName: "F", lastFile: "1.mp3" });
    clearAllStorage();
    expect(getStoredSession()).toBeNull();
    expect(getStoredMarks()).toEqual({});
  });
});
