// Bridge to lib/fs.ts for backwards compatibility
import {
  AudioFile,
  isAudioFile,
  readFilesFromDirectoryHandle as fsReadDir,
  readFilesFromInput as fsReadInput,
} from "./fs";
import { naturalSort as sortHelper } from "./naturalSort";

export type { AudioFile };
export { isAudioFile };

export const SUPPORTED_AUDIO_EXTENSIONS = [
  ".mp3",
  ".m4a",
  ".wav",
  ".aac",
  ".ogg",
  ".flac",
];

export function naturalSort<T extends { name: string }>(items: T[]): T[] {
  return sortHelper(items, (x) => x.name);
}

export async function readFilesFromDirectoryHandle(
  handle: FileSystemDirectoryHandle
): Promise<{ folderName: string; files: AudioFile[] }> {
  const res = await fsReadDir(handle);
  if (res.ok) {
    return { folderName: res.folderName, files: res.files };
  }
  return { folderName: handle.name, files: [] };
}

export function readFilesFromInput(fileList: FileList): {
  folderName: string;
  files: AudioFile[];
} {
  const res = fsReadInput(fileList);
  if (res.ok) {
    return { folderName: res.folderName, files: res.files };
  }
  return { folderName: "Audio_Folder", files: [] };
}
