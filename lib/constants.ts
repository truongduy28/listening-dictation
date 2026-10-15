// Global constants for listening dictation app

export const MIN_AB_GAP_SEC = 0.3;

export const MAX_WAVEFORM_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5] as const;
export type PlaybackRate = (typeof SPEEDS)[number];

export const DEFAULT_SKIP_SECONDS = 5;
export const DEFAULT_REPEAT_COUNT = 1;
export const DEFAULT_GAP_SECONDS = 2;
export const DEFAULT_VOLUME = 0.8;

export const AUDIO_EXTENSIONS = [
  ".mp3",
  ".m4a",
  ".wav",
  ".aac",
  ".flac",
  ".ogg",
] as const;

export const LISTENED_THRESHOLD = 0.85; // 85% of track listened marks as completed

export const MAX_RECENT_FOLDERS = 3;

export const STORAGE_KEYS = {
  SETTINGS: "dictation_settings",
  SESSION: "dictation_session",
  MARKS: "dictation_marks",
  RECENT_FOLDERS: "dictation_recent_folders",
} as const;
