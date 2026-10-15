"use client";

import { useState, useCallback, useMemo } from "react";
import { AudioFile } from "@/lib/file-system";
import { clearFolderHandle } from "@/lib/idb";
import {
  getStoredSession,
  saveStoredSession,
  getStoredMarks,
  saveMark,
  saveRecentFolder,
} from "@/lib/storage";
import { buildQueue, FilterType } from "@/lib/queue";
import { useFolderLoader } from "./use-folder-loader";

export type AudioFileItem = AudioFile;

interface UseFolderLibraryOptions {
  onFileSelected?: (fileId: string) => void;
}

function applyMarks(rawFiles: AudioFile[], folderName: string): AudioFile[] {
  const allMarks = getStoredMarks();
  const folderMarks = allMarks[folderName] || {};
  return rawFiles.map((f) => {
    const mark = folderMarks[f.name];
    return {
      ...f,
      listened: mark?.listened ?? false,
      starred: mark?.star ?? false,
    };
  });
}

/**
 * Hook to manage audio folder library state, search/filter, and mark synchronization.
 */
export function useFolderLibrary(options: UseFolderLibraryOptions = {}) {
  const { onFileSelected } = options;

  const [hasFolder, setHasFolder] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>("");
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const currentFile = useMemo(() => {
    return files.find((f) => f.id === currentFileId) || files[0] || null;
  }, [files, currentFileId]);

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

      const filesWithMarks = applyMarks(rawFiles, name);
      const session = getStoredSession();

      let targetFileId = filesWithMarks[0].id;
      if (session && session.folderName === name && session.lastFile) {
        const found = filesWithMarks.find((f) => f.name === session.lastFile);
        if (found) targetFileId = found.id;
      }

      setFolderName(name);
      setFiles(filesWithMarks);
      setCurrentFileId(targetFileId);
      setHasFolder(true);

      const selectedFile = filesWithMarks.find((f) => f.id === targetFileId);
      const targetIndex = filesWithMarks.findIndex((f) => f.id === targetFileId);
      if (selectedFile) {
        saveStoredSession({ folderName: name, lastFile: selectedFile.name });
        saveRecentFolder({
          folderName: name,
          lastFile: selectedFile.name,
          totalFiles: filesWithMarks.length,
          lastIndex: targetIndex >= 0 ? targetIndex + 1 : 1,
        });
      }

      onFileSelected?.(targetFileId);
    },
    [onFileSelected]
  );

  const handlePermissionRequired = useCallback((name: string) => {
    setFolderName(name);
    setHasFolder(true);
  }, []);

  const loader = useFolderLoader({
    onFilesLoaded: processLoadedFiles,
    onPermissionRequired: handlePermissionRequired,
  });

  const selectFile = useCallback(
    (id: string) => {
      setCurrentFileId(id);
      const target = files.find((f) => f.id === id);
      const index = files.findIndex((f) => f.id === id);
      if (target && folderName) {
        saveStoredSession({ folderName, lastFile: target.name });
        saveRecentFolder({
          folderName,
          lastFile: target.name,
          totalFiles: files.length,
          lastIndex: index >= 0 ? index + 1 : 1,
        });
      }
      onFileSelected?.(id);
    },
    [files, folderName, onFileSelected]
  );

  const toggleStar = useCallback(
    (id: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id === id) {
            const newStarred = !f.starred;
            if (folderName) saveMark(folderName, f.name, { star: newStarred });
            return { ...f, starred: newStarred };
          }
          return f;
        })
      );
    },
    [folderName]
  );

  const markListened = useCallback(
    (id: string) => {
      const target = files.find((f) => f.id === id);
      if (!target || target.listened || !folderName) return;

      saveMark(folderName, target.name, { listened: true });
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, listened: true } : f)));
    },
    [files, folderName]
  );

  const resetLibrary = useCallback(async () => {
    setHasFolder(false);
    setFolderName("");
    setFiles([]);
    setCurrentFileId(null);
    loader.clearPendingHandle();
    setFilter("all");
    setSearchQuery("");
    await clearFolderHandle();
  }, [loader]);

  const filteredFiles = useMemo(() => {
    return buildQueue(files, filter, searchQuery);
  }, [files, filter, searchQuery]);

  const listenedCount = useMemo(() => {
    return files.filter((f) => f.listened).length;
  }, [files]);

  return {
    fileInputRef: loader.fileInputRef,
    hasFolder,
    folderName,
    files,
    filteredFiles,
    currentFileId,
    currentFile,
    isLoading: loader.isLoading,
    permissionNeeded: loader.permissionNeeded,
    isSafari: loader.isSafari,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    listenedCount,
    openFolder: loader.openFolder,
    handleFileInputChange: loader.handleFileInputChange,
    grantPermission: loader.grantPermission,
    selectFile,
    toggleStar,
    markListened,
    resetLibrary,
  };
}
