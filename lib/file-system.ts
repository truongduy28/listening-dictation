// Audio file scanner & natural sorting helper

export interface AudioFile {
  id: string;
  name: string;
  index: number;
  file: File;
  listened?: boolean;
  starred?: boolean;
  error?: boolean;
}

export const SUPPORTED_AUDIO_EXTENSIONS = [
  ".mp3",
  ".m4a",
  ".wav",
  ".aac",
  ".ogg",
  ".flac",
];

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

export function isAudioFile(fileName: string): boolean {
  if (fileName.startsWith(".")) return false; // Ignore hidden files like .DS_Store
  const lower = fileName.toLowerCase();
  return SUPPORTED_AUDIO_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function naturalSort<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => collator.compare(a.name, b.name));
}

/**
 * Scan audio files using File System Access API (showDirectoryPicker)
 */
export async function readFilesFromDirectoryHandle(
  handle: FileSystemDirectoryHandle
): Promise<{ folderName: string; files: AudioFile[] }> {
  const folderName = handle.name;
  const rawFiles: File[] = [];

  // Iterate over files in the directory (non-recursive, TOEIC test folders have flat audio files)
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

  // Natural sort
  const sorted = naturalSort(rawFiles);

  const files: AudioFile[] = sorted.map((file, idx) => ({
    id: `file-${idx + 1}-${file.name}`,
    name: file.name,
    index: idx + 1,
    file,
    listened: false,
    starred: false,
  }));

  return { folderName, files };
}

/**
 * Scan audio files from HTML <input type="file" webkitdirectory> (Safari fallback)
 */
export function readFilesFromInput(fileList: FileList): {
  folderName: string;
  files: AudioFile[];
} {
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
  const sorted = naturalSort(rawFiles);

  const files: AudioFile[] = sorted.map((file, idx) => ({
    id: `file-${idx + 1}-${file.name}`,
    name: file.name,
    index: idx + 1,
    file,
    listened: false,
    starred: false,
  }));

  return { folderName, files };
}
