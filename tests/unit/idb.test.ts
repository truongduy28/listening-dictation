import { describe, it, expect, beforeEach } from "vitest";
import { saveFolderHandle, getFolderHandle, clearFolderHandle } from "@/lib/idb";

describe("lib/idb", () => {
  beforeEach(async () => {
    await clearFolderHandle();
  });

  it("saves and retrieves directory handle", async () => {
    const mockHandle = {
      name: "MockDirectory",
      kind: "directory" as const,
    } as unknown as FileSystemDirectoryHandle;

    const saveRes = await saveFolderHandle(mockHandle);
    expect(saveRes.ok).toBe(true);

    const getRes = await getFolderHandle();
    expect(getRes.ok).toBe(true);
    if (getRes.ok) {
      expect(getRes.value?.name).toBe("MockDirectory");
    }
  });

  it("clears handle", async () => {
    const mockHandle = {
      name: "TestFolder",
      kind: "directory" as const,
    } as unknown as FileSystemDirectoryHandle;

    await saveFolderHandle(mockHandle);
    const clearRes = await clearFolderHandle();
    expect(clearRes.ok).toBe(true);

    const getRes = await getFolderHandle();
    expect(getRes.ok).toBe(true);
    if (getRes.ok) {
      expect(getRes.value).toBeNull();
    }
  });
});
