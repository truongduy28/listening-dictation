// Audio file scanner & natural sorting helper

import { AUDIO_EXTENSIONS } from "./constants";
import { naturalSort } from "./naturalSort";

export interface AudioFile {
  id: string;
  name: string;
  index: number;
  file: File;
  listened?: boolean;
  starred?: boolean;
  error?: boolean;
}

export type ScanResult =
  | { ok: true; folderName: string; files: AudioFile[] }
  | { ok: false; reason: string };

export function isAudioFile(fileName: string): boolean {
  if (!fileName || fileName.startsWith(".")) return false; // Ignore hidden files like .DS_Store
  const lower = fileName.toLowerCase();
  return AUDIO_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/**
 * Scan audio files using File System Access API (showDirectoryPicker)
 */
export async function readFilesFromDirectoryHandle(
  handle: FileSystemDirectoryHandle
): Promise<ScanResult> {
  try {
    const folderName = handle.name;
    const rawFiles: File[] = [];

    // Iterate over files in the directory
    // @ts-expect-error - values() is async iterable in modern File System Access API
    for await (const entry of handle.values()) {
      if (entry.kind === "file" && isAudioFile(entry.name)) {
        try {
          const fileHandle = entry as FileSystemFileHandle;
          const file = await fileHandle.getFile();
          rawFiles.push(file);
        } catch (err) {
          console.warn(`Could not read file ${entry.name}:`, err);
        }
      }
    }

    const sorted = naturalSort(rawFiles, (f) => f.name);

    const files: AudioFile[] = sorted.map((file, idx) => ({
      id: `file-${idx + 1}-${file.name}`,
      name: file.name,
      index: idx + 1,
      file,
      listened: false,
      starred: false,
    }));

    return { ok: true, folderName, files };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "Failed to scan folder" };
  }
}

/**
 * Scan audio files from HTML <input type="file" webkitdirectory> (Safari fallback)
 */
export function readFilesFromInput(fileList: FileList): ScanResult {
  try {
    const rawFiles: File[] = [];
    let detectedFolder = "";

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (isAudioFile(file.name)) {
        rawFiles.push(file);
        if (!detectedFolder && file.webkitRelativePath) {
          const parts = file.webkitRelativePath.split("/");
          if (parts.length > 1) {
            detectedFolder = parts[0];
          }
        }
      }
    }

    const folderName = detectedFolder || "Audio_Folder";
    const sorted = naturalSort(rawFiles, (f) => f.name);

    const files: AudioFile[] = sorted.map((file, idx) => ({
      id: `file-${idx + 1}-${file.name}`,
      name: file.name,
      index: idx + 1,
      file,
      listened: false,
      starred: false,
    }));

    return { ok: true, folderName, files };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "Failed to read input files" };
  }
}
