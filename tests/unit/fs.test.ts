import { describe, it, expect } from "vitest";
import { isAudioFile, readFilesFromDirectoryHandle, readFilesFromInput } from "@/lib/fs";
import { createMockFileSystem } from "../setup/fs-mocks";

describe("lib/fs", () => {
  it("isAudioFile filters supported formats and ignores hidden files", () => {
    expect(isAudioFile("lesson1.mp3")).toBe(true);
    expect(isAudioFile("track2.M4A")).toBe(true);
    expect(isAudioFile("audio.wav")).toBe(true);
    expect(isAudioFile(".DS_Store")).toBe(false);
    expect(isAudioFile(".hidden.mp3")).toBe(false);
    expect(isAudioFile("notes.txt")).toBe(false);
    expect(isAudioFile("image.png")).toBe(false);
  });

  it("readFilesFromDirectoryHandle scans and sorts files", async () => {
    const mockDir = createMockFileSystem([
      { name: "track10.mp3" },
      { name: "notes.txt" },
      { name: "track2.mp3" },
      { name: ".DS_Store" },
      { name: "track1.mp3" },
    ]);

    const res = await readFilesFromDirectoryHandle(mockDir as unknown as FileSystemDirectoryHandle);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.folderName).toBe("Mock Audio Folder");
      expect(res.files).toHaveLength(3);
      // Naturally sorted: track1, track2, track10
      expect(res.files.map((f) => f.name)).toEqual(["track1.mp3", "track2.mp3", "track10.mp3"]);
      expect(res.files[0].index).toBe(1);
      expect(res.files[1].index).toBe(2);
      expect(res.files[2].index).toBe(3);
    }
  });

  it("readFilesFromInput scans and detects folder name", () => {
    const file1 = new File(["audio"], "01.mp3");
    Object.defineProperty(file1, "webkitRelativePath", { value: "My_TOEIC/01.mp3" });
    const file2 = new File(["audio"], "02.mp3");
    Object.defineProperty(file2, "webkitRelativePath", { value: "My_TOEIC/02.mp3" });
    const file3 = new File(["text"], "readme.txt");

    const fileList = {
      0: file1,
      1: file2,
      2: file3,
      length: 3,
      item: (i: number) => [file1, file2, file3][i] || null,
    } as unknown as FileList;

    const res = readFilesFromInput(fileList);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.folderName).toBe("My_TOEIC");
      expect(res.files).toHaveLength(2);
      expect(res.files[0].name).toBe("01.mp3");
      expect(res.files[1].name).toBe("02.mp3");
    }
  });
});
