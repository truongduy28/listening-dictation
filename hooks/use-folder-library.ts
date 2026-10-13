"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  AudioFile,
  readFilesFromDirectoryHandle,
  readFilesFromInput,
} from "@/lib/file-system";
import {
  saveFolderHandle,
  getFolderHandle,
  clearFolderHandle,
} from "@/lib/db";
import {
  getStoredSession,
  saveStoredSession,
  getStoredMarks,
  saveMark,
} from "@/lib/storage";
import { FilterType } from "@/components/sidebar";

interface UseFolderLibraryOptions {
  onFileSelected?: (fileId: string) => void;
}

/**
 * Hook to manage audio folder access, files state, search/filter, and mark synchronization.
 */
export function useFolderLibrary(options: UseFolderLibraryOptions = {}) {
  const { onFileSelected } = options;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingHandleRef = useRef<FileSystemDirectoryHandle | null>(null);

  const [hasFolder, setHasFolder] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>("");
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [permissionNeeded, setPermissionNeeded] = useState<boolean>(false);

  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const isSafari = useMemo(() => {
    if (typeof window !== "undefined") {
      return !("showDirectoryPicker" in window);
    }
    return false;
  }, []);

  // Currently selected audio file reference
  const currentFile = useMemo(() => {
    return files.find((f) => f.id === currentFileId) || files[0] || null;
  }, [files, currentFileId]);

  // Apply stored marks (listened, starred) to raw files
  const applyMarksToFiles = useCallback(
    (rawFiles: AudioFile[], targetFolderName: string) => {
      const allMarks = getStoredMarks();
      const folderMarks = allMarks[targetFolderName] || {};

      return rawFiles.map((f) => {
        const mark = folderMarks[f.name];
        return {
          ...f,
          listened: mark?.listened ?? false,
          starred: mark?.star ?? false,
        };
      });
    },
    []
  );

  // Process raw loaded files and restore active track from session
  const processLoadedFiles = useCallback(
    (name: string, rawFiles: AudioFile[]) => {
      if (rawFiles.length === 0) {
        setFolderName(name);
        setFiles([]);
        setCurrentFileId(null);
        setHasFolder(true);
        return;
      }

      const filesWithMarks = applyMarksToFiles(rawFiles, name);
      const session = getStoredSession();

      let targetFileId = filesWithMarks[0].id;
      if (session && session.folderName === name && session.lastFile) {
        const found = filesWithMarks.find((f) => f.name === session.lastFile);
        if (found) {
          targetFileId = found.id;
        }
      }

      setFolderName(name);
      setFiles(filesWithMarks);
      setCurrentFileId(targetFileId);
      setHasFolder(true);
      setPermissionNeeded(false);

      const selectedFile = filesWithMarks.find((f) => f.id === targetFileId);
      if (selectedFile) {
        saveStoredSession({ folderName: name, lastFile: selectedFile.name });
      }

      if (onFileSelected) {
        onFileSelected(targetFileId);
      }
    },
    [applyMarksToFiles, onFileSelected]
  );

  // Auto-restore folder handle from IndexedDB on mount (Chrome/Edge)
  useEffect(() => {
    async function restoreSession() {
      if (!("showDirectoryPicker" in window)) {
        return;
      }

      try {
        const handle = await getFolderHandle();
        if (!handle) return;

        // @ts-expect-error queryPermission exists on FileSystemDirectoryHandle
        const perm = await handle.queryPermission({ mode: "read" });
        if (perm === "granted") {
          setIsLoading(true);
          const { folderName: name, files: scannedFiles } =
            await readFilesFromDirectoryHandle(handle);
          processLoadedFiles(name, scannedFiles);
          setIsLoading(false);
        } else {
          pendingHandleRef.current = handle;
          setFolderName(handle.name);
          setPermissionNeeded(true);
          setHasFolder(true);
        }
      } catch (err) {
        console.warn("Failed to auto-restore folder session:", err);
      }
    }

    restoreSession();
  }, [processLoadedFiles]);

  // Request directory permission if prompted
  const grantPermission = useCallback(async () => {
    const handle = pendingHandleRef.current;
    if (!handle) return;
    try {
      setIsLoading(true);
      // @ts-expect-error requestPermission exists on FileSystemDirectoryHandle
      const perm = await handle.requestPermission({ mode: "read" });
      if (perm === "granted") {
        const { folderName: name, files: scannedFiles } =
          await readFilesFromDirectoryHandle(handle);
        processLoadedFiles(name, scannedFiles);
      }
    } catch (err) {
      console.warn("Permission grant failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [processLoadedFiles]);

  // Open directory picker (Chrome/Edge) or trigger hidden input (Safari)
  const openFolder = useCallback(async () => {
    if ("showDirectoryPicker" in window) {
      try {
        // @ts-expect-error showDirectoryPicker is global on window
        const handle: FileSystemDirectoryHandle = await window.showDirectoryPicker();
        setIsLoading(true);
        await saveFolderHandle(handle);
        const { folderName: name, files: scannedFiles } =
          await readFilesFromDirectoryHandle(handle);
        processLoadedFiles(name, scannedFiles);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        console.error("Error opening directory picker:", err);
      } finally {
        setIsLoading(false);
      }
    } else {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  }, [processLoadedFiles]);

  // Fallback file input change handler for Safari
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList || fileList.length === 0) return;

      setIsLoading(true);
      try {
        const { folderName: name, files: scannedFiles } = readFilesFromInput(fileList);
        processLoadedFiles(name, scannedFiles);
      } catch (err) {
        console.error("Error processing input files:", err);
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [processLoadedFiles]
  );

  // Select an audio file from the list
  const selectFile = useCallback(
    (id: string) => {
      setCurrentFileId(id);
      const target = files.find((f) => f.id === id);
      if (target && folderName) {
        saveStoredSession({ folderName, lastFile: target.name });
      }
      if (onFileSelected) {
        onFileSelected(id);
      }
    },
    [files, folderName, onFileSelected]
  );

  // Toggle star status on a track
  const toggleStar = useCallback(
    (id: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id === id) {
            const newStarred = !f.starred;
            if (folderName) {
              saveMark(folderName, f.name, { star: newStarred });
            }
            return { ...f, starred: newStarred };
          }
          return f;
        })
      );
    },
    [folderName]
  );

  // Mark a track as listened
  const markListened = useCallback(
    (id: string) => {
      const target = files.find((f) => f.id === id);
      if (!target || target.listened || !folderName) return;

      saveMark(folderName, target.name, { listened: true });
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, listened: true } : f))
      );
    },
    [files, folderName]
  );

  // Reset entire folder library state
  const resetLibrary = useCallback(async () => {
    setHasFolder(false);
    setFolderName("");
    setFiles([]);
    setCurrentFileId(null);
    setPermissionNeeded(false);
    pendingHandleRef.current = null;
    setFilter("all");
    setSearchQuery("");
    await clearFolderHandle();
  }, []);

  // Filtered files list according to search & filter criteria
  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      if (filter === "unheard" && f.listened) return false;
      if (filter === "listened" && !f.listened) return false;
      if (filter === "starred" && !f.starred) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return f.name.toLowerCase().includes(q) || String(f.index).includes(q);
      }
      return true;
    });
  }, [files, filter, searchQuery]);

  // Total count of listened tracks
  const listenedCount = useMemo(() => {
    return files.filter((f) => f.listened).length;
  }, [files]);

  return {
    fileInputRef,
    hasFolder,
    folderName,
    files,
    filteredFiles,
    currentFileId,
    currentFile,
    isLoading,
    permissionNeeded,
    isSafari,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    listenedCount,
    openFolder,
    handleFileInputChange,
    grantPermission,
    selectFile,
    toggleStar,
    markListened,
    resetLibrary,
  };
}
