// Compatibility bridge to lib/idb.ts
import {
  saveFolderHandle as idbSave,
  getFolderHandle as idbGet,
  clearFolderHandle as idbClear,
} from "./idb";

export async function saveFolderHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const res = await idbSave(handle);
  if (!res.ok) console.warn("saveFolderHandle:", res.reason);
}

export async function getFolderHandle(): Promise<FileSystemDirectoryHandle | null> {
  const res = await idbGet();
  return res.ok ? res.value : null;
}

export async function clearFolderHandle(): Promise<void> {
  const res = await idbClear();
  if (!res.ok) console.warn("clearFolderHandle:", res.reason);
}
