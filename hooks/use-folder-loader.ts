"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { AudioFile, readFilesFromDirectoryHandle, readFilesFromInput } from "@/lib/file-system";
import { saveFolderHandle, getFolderHandle } from "@/lib/idb";

interface UseFolderLoaderOptions {
  onFilesLoaded: (folderName: string, files: AudioFile[]) => void;
  onPermissionRequired?: (folderName: string) => void;
}

export function useFolderLoader({
  onFilesLoaded,
  onPermissionRequired,
}: UseFolderLoaderOptions) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingHandleRef = useRef<FileSystemDirectoryHandle | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [permissionNeeded, setPermissionNeeded] = useState<boolean>(false);

  const isSafari = useMemo(() => {
    if (typeof window !== "undefined") {
      return !("showDirectoryPicker" in window);
    }
    return false;
  }, []);

  // Auto-restore folder handle from IndexedDB on mount (Chrome/Edge)
  useEffect(() => {
    async function restoreSession() {
      if (!("showDirectoryPicker" in window)) return;

      try {
        const idbRes = await getFolderHandle();
        if (!idbRes.ok || !idbRes.value) return;
        const handle = idbRes.value;

        // @ts-expect-error queryPermission exists on FileSystemDirectoryHandle
        const perm = await handle.queryPermission({ mode: "read" });
        if (perm === "granted") {
          setIsLoading(true);
          const { folderName, files } = await readFilesFromDirectoryHandle(handle);
          onFilesLoaded(folderName, files);
          setIsLoading(false);
        } else {
          pendingHandleRef.current = handle;
          setPermissionNeeded(true);
          onPermissionRequired?.(handle.name);
        }
      } catch (err) {
        console.warn("Failed to auto-restore folder session:", err);
      }
    }

    restoreSession();
  }, [onFilesLoaded, onPermissionRequired]);

  const grantPermission = useCallback(async () => {
    const handle = pendingHandleRef.current;
    if (!handle) return;
    try {
      setIsLoading(true);
      // @ts-expect-error requestPermission exists on FileSystemDirectoryHandle
      const perm = await handle.requestPermission({ mode: "read" });
      if (perm === "granted") {
        setPermissionNeeded(false);
        const { folderName, files } = await readFilesFromDirectoryHandle(handle);
        onFilesLoaded(folderName, files);
      }
    } catch (err) {
      console.warn("Permission grant failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [onFilesLoaded]);

  const openFolder = useCallback(async () => {
    if ("showDirectoryPicker" in window) {
      try {
        // @ts-expect-error showDirectoryPicker is global on window
        const handle: FileSystemDirectoryHandle = await window.showDirectoryPicker();
        setIsLoading(true);
        await saveFolderHandle(handle);
        const { folderName, files } = await readFilesFromDirectoryHandle(handle);
        setPermissionNeeded(false);
        onFilesLoaded(folderName, files);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.error("Error opening directory picker:", err);
      } finally {
        setIsLoading(false);
      }
    } else {
      fileInputRef.current?.click();
    }
  }, [onFilesLoaded]);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList || fileList.length === 0) return;

      setIsLoading(true);
      try {
        const { folderName, files } = readFilesFromInput(fileList);
        setPermissionNeeded(false);
        onFilesLoaded(folderName, files);
      } catch (err) {
        console.error("Error processing input files:", err);
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [onFilesLoaded]
  );

  const clearPendingHandle = useCallback(() => {
    pendingHandleRef.current = null;
    setPermissionNeeded(false);
  }, []);

  return {
    fileInputRef,
    isLoading,
    permissionNeeded,
    isSafari,
    openFolder,
    grantPermission,
    handleFileInputChange,
    clearPendingHandle,
  };
}
