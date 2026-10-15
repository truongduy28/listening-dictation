import type { AudioFile } from "./file-system";

export type QueueFilter = "all" | "unheard" | "listened" | "starred";

/**
 * Filter audio files according to current filter type and search query.
 */
export function buildQueue(
  files: AudioFile[],
  filter: QueueFilter = "all",
  searchQuery: string = ""
): AudioFile[] {
  const query = searchQuery.toLowerCase().trim();

  return files.filter((f) => {
    if (filter === "unheard" && f.listened) return false;
    if (filter === "listened" && !f.listened) return false;
    if (filter === "starred" && !f.starred) return false;

    if (query) {
      const matchName = f.name.toLowerCase().includes(query);
      const matchIndex = String(f.index).includes(query);
      return matchName || matchIndex;
    }

    return true;
  });
}

/**
 * Returns 0-based index of fileId in queue, or -1 if not found.
 */
export function getQueueIndex(queue: AudioFile[], fileId: string | null): number {
  if (!fileId || queue.length === 0) return -1;
  return queue.findIndex((f) => f.id === fileId);
}

/**
 * Finds next track in queue.
 * - If current file is in queue: returns next item, or null if at the end.
 * - If current file is NOT in queue:
 *     finds the first item in queue whose original index > currentFile.index.
 *     If none found and fallbackToFirst is true, returns queue[0].
 *     Otherwise returns null.
 */
export function getNextQueueFile(
  queue: AudioFile[],
  currentFile: AudioFile | null,
  options: { fallbackToFirst?: boolean } = {}
): AudioFile | null {
  if (queue.length === 0) return null;
  if (!currentFile) return queue[0];

  const currentIndex = queue.findIndex((f) => f.id === currentFile.id);
  if (currentIndex >= 0) {
    if (currentIndex < queue.length - 1) {
      return queue[currentIndex + 1];
    }
    return null; // reached end of queue
  }

  // Not in queue: find first track with index > currentFile.index
  const nextInNaturalOrder = queue.find((f) => f.index > currentFile.index);
  if (nextInNaturalOrder) {
    return nextInNaturalOrder;
  }

  // If no track after current in natural order, check fallback
  if (options.fallbackToFirst) {
    return queue[0];
  }

  return null;
}

/**
 * Finds previous track in queue.
 * - If current file is in queue: returns previous item, or null if at the start.
 * - If current file is NOT in queue:
 *     finds the last item in queue whose original index < currentFile.index.
 *     If none found, returns queue[0].
 */
export function getPrevQueueFile(
  queue: AudioFile[],
  currentFile: AudioFile | null
): AudioFile | null {
  if (queue.length === 0) return null;
  if (!currentFile) return queue[0];

  const currentIndex = queue.findIndex((f) => f.id === currentFile.id);
  if (currentIndex > 0) {
    return queue[currentIndex - 1];
  }
  if (currentIndex === 0) {
    return null; // at beginning of queue
  }

  // Not in queue: find last track with index < currentFile.index
  for (let i = queue.length - 1; i >= 0; i--) {
    if (queue[i].index < currentFile.index) {
      return queue[i];
    }
  }

  return queue[0];
}

/**
 * Helper to compute queue status info for TrackHeader and QueueChip.
 */
export function getQueueStatus({
  queue,
  currentFile,
}: {
  queue: AudioFile[];
  currentFile: AudioFile | null;
}) {
  const total = queue.length;
  const zeroBasedIdx = getQueueIndex(queue, currentFile?.id ?? null);
  const isInQueue = zeroBasedIdx >= 0;
  const current = isInQueue ? zeroBasedIdx + 1 : 0;

  return {
    isInQueue,
    current,
    total,
    displayCounter:
      total === 0
        ? "0 / 0"
        : isInQueue
        ? `${current} / ${total}`
        : `– / ${total}`,
  };
}
