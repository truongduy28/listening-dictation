// LocalStorage helper for Settings, Session, and Marks

export type Settings = {
  language: "vi" | "en";
  playbackRate: 0.5 | 0.75 | 1 | 1.25 | 1.5;
  volume: number;
  skipSeconds: number;
  autoNext: boolean;
  repeatCount: number;
  gapSeconds: number;
  sidebarCollapsed: boolean;
};

export type Session = {
  folderName: string;
  lastFile: string; // Tên file cuối cùng (không lưu vị trí giây)
};

export type Marks = {
  [folderName: string]: {
    [fileName: string]: { listened?: boolean; star?: boolean };
  };
};

const SETTINGS_KEY = "dictation_settings";
const SESSION_KEY = "dictation_session";
const MARKS_KEY = "dictation_marks";

export const DEFAULT_SETTINGS: Settings = {
  language: "vi",
  playbackRate: 1,
  volume: 0.8,
  skipSeconds: 5,
  autoNext: true,
  repeatCount: 1,
  gapSeconds: 2,
  sidebarCollapsed: false,
};

export function getStoredSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(updates: Partial<Settings>): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredSettings();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...updates }));
  } catch (err) {
    console.warn("Failed to save settings:", err);
  }
}

export function getStoredSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredSession(session: Session): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn("Failed to save session:", err);
  }
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore
  }
}

export function getStoredMarks(): Marks {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(MARKS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveMark(
  folderName: string,
  fileName: string,
  update: { listened?: boolean; star?: boolean }
): void {
  if (typeof window === "undefined" || !folderName || !fileName) return;
  try {
    const allMarks = getStoredMarks();
    const folderMarks = allMarks[folderName] || {};
    const existing = folderMarks[fileName] || {};

    const updatedFileMark = { ...existing };
    if (update.listened !== undefined) updatedFileMark.listened = update.listened;
    if (update.star !== undefined) updatedFileMark.star = update.star;

    allMarks[folderName] = {
      ...folderMarks,
      [fileName]: updatedFileMark,
    };

    localStorage.setItem(MARKS_KEY, JSON.stringify(allMarks));
  } catch (err) {
    console.warn("Failed to save mark:", err);
  }
}

export type RecentFolder = {
  folderName: string;
  lastFile: string;
  totalFiles: number;
  lastIndex: number;
  updatedAt: number;
};

const RECENT_FOLDERS_KEY = "dictation_recent_folders";
const RECENT_FOLDERS_EVENT = "dictation_recent_folders_changed";

let cachedRaw: string | null = null;
let cachedList: RecentFolder[] = [];

function notifyRecentFoldersChanged(): void {
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    try {
      window.dispatchEvent(new Event(RECENT_FOLDERS_EVENT));
    } catch {}
  }
}

export function subscribeRecentFolders(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(RECENT_FOLDERS_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(RECENT_FOLDERS_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function getRecentFolders(): RecentFolder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_FOLDERS_KEY);
    if (raw === cachedRaw) return cachedList;
    cachedRaw = raw;
    cachedList = raw ? JSON.parse(raw) : [];
    return cachedList;
  } catch {
    return [];
  }
}

export function saveRecentFolder(folder: Omit<RecentFolder, "updatedAt">): void {
  if (typeof window === "undefined" || !folder.folderName) return;
  try {
    const list = getRecentFolders().filter((f) => f.folderName !== folder.folderName);
    const updated: RecentFolder[] = [
      { ...folder, updatedAt: Date.now() },
      ...list,
    ].slice(0, 3);
    const serialized = JSON.stringify(updated);
    cachedRaw = serialized;
    cachedList = updated;
    localStorage.setItem(RECENT_FOLDERS_KEY, serialized);
    notifyRecentFoldersChanged();
  } catch (err) {
    console.warn("Failed to save recent folder:", err);
  }
}

export function removeRecentFolder(folderName: string): void {
  if (typeof window === "undefined") return;
  try {
    const list = getRecentFolders().filter((f) => f.folderName !== folderName);
    const serialized = JSON.stringify(list);
    cachedRaw = serialized;
    cachedList = list;
    localStorage.setItem(RECENT_FOLDERS_KEY, serialized);
    notifyRecentFoldersChanged();
  } catch (err) {
    console.warn("Failed to remove recent folder:", err);
  }
}

export function clearAllStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(MARKS_KEY);
    localStorage.removeItem(RECENT_FOLDERS_KEY);
    cachedRaw = null;
    cachedList = [];
    notifyRecentFoldersChanged();
  } catch {
    // Ignore
  }
}
