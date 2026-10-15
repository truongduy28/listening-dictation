// Mock File System Access API for virtual testing

export interface VirtualFile {
  name: string;
  size?: number;
  type?: string;
  content?: string;
}

export function createMockFileSystem(files: VirtualFile[]) {
  const fileHandles = files.map((f) => {
    const fileObj = new File([f.content || "mock audio content"], f.name, {
      type: f.type || "audio/mpeg",
    });
    return {
      kind: "file" as const,
      name: f.name,
      getFile: async () => fileObj,
    };
  });

  const directoryHandle = {
    kind: "directory" as const,
    name: "Mock Audio Folder",
    queryPermission: async () => "granted",
    requestPermission: async () => "granted",
    values: async function* () {
      for (const handle of fileHandles) {
        yield handle;
      }
    },
    [Symbol.asyncIterator]: async function* () {
      for (const handle of fileHandles) {
        yield handle;
      }
    },
  };

  return directoryHandle;
}
