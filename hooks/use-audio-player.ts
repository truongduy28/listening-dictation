"use client";

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import WaveSurfer from "wavesurfer.js";
import { AbLoop, isAbLoopActive } from "@/lib/abLoop";

export const MAX_WAVEFORM_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function subscribeDarkMode(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getDarkModeSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getServerSnapshot(): boolean {
  return false;
}

interface UseAudioPlayerOptions {
  playbackRate: number;
  volume: number;
  abLoop?: AbLoop;
  onEnded?: () => void;
  onProgress?: (progressPercent: number, currentTime: number, duration: number) => void;
  onAbLoopReached?: () => void;
}

export function useAudioPlayer({
  playbackRate,
  volume,
  abLoop,
  onEnded,
  onProgress,
  onAbLoopReached,
}: UseAudioPlayerOptions) {
  const isDarkMode = useSyncExternalStore(subscribeDarkMode, getDarkModeSnapshot, getServerSnapshot);

  // Single shared audio element ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentUrlRef = useRef<string | null>(null);
  const [containerNode, setContainerNode] = useState<HTMLDivElement | null>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);

  const waveformContainerRef = useCallback((node: HTMLDivElement | null) => {
    setContainerNode(node);
  }, []);
  const onEndedRef = useRef(onEnded);
  const onProgressRef = useRef(onProgress);
  const abLoopRef = useRef<AbLoop | undefined>(abLoop);
  const onAbLoopReachedRef = useRef(onAbLoopReached);

  useEffect(() => {
    abLoopRef.current = abLoop;
  }, [abLoop]);

  useEffect(() => {
    onAbLoopReachedRef.current = onAbLoopReached;
  }, [onAbLoopReached]);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLargeFile, setIsLargeFile] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [hasFile, setHasFile] = useState<boolean>(false);

  const playbackRateRef = useRef(playbackRate);
  const volumeRef = useRef(volume);

  useEffect(() => {
    playbackRateRef.current = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  // Initialize single HTMLAudioElement once on client mount
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.preservesPitch = true;
    // @ts-expect-error webkit prefix for Safari
    audio.webkitPreservesPitch = true;
    audio.defaultPlaybackRate = playbackRateRef.current;
    audio.playbackRate = playbackRateRef.current;
    audio.volume = Math.max(0, Math.min(1, volumeRef.current));

    const handlePlay = () => {
      audio.preservesPitch = true;
      audio.playbackRate = playbackRateRef.current;
      setIsPlaying(true);
    };
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (onProgressRef.current && audio.duration > 0) {
        onProgressRef.current(
          (audio.currentTime / audio.duration) * 100,
          audio.currentTime,
          audio.duration
        );
      }
    };
    const handleLoadedMetadata = () => {
      audio.preservesPitch = true;
      // @ts-expect-error webkit prefix for Safari
      audio.webkitPreservesPitch = true;
      audio.defaultPlaybackRate = playbackRateRef.current;
      audio.playbackRate = playbackRateRef.current;
      setDuration(audio.duration || 0);
    };
    const handleCanPlay = () => {
      setHasError(false);
      audio.preservesPitch = true;
      audio.playbackRate = playbackRateRef.current;
      if (audio.duration && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      if (onEndedRef.current) {
        onEndedRef.current();
      }
    };
    const handleError = () => {
      // Ignore if no source, no error, or code 1 (MEDIA_ERR_ABORTED when switching tracks)
      if (!audio.src || !audio.error || audio.error.code === 1) {
        return;
      }
      console.warn("Audio element error on playback:", audio.error);
      setHasError(true);
      setIsPlaying(false);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("durationchange", handleLoadedMetadata);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("loadeddata", handleCanPlay);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    audioRef.current = audio;

    return () => {
      audio.pause();
      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current);
        currentUrlRef.current = null;
      }
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("durationchange", handleLoadedMetadata);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("loadeddata", handleCanPlay);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, []);

  // Sync playback rate with preservesPitch
  useEffect(() => {
    playbackRateRef.current = playbackRate;
    const audio = audioRef.current;
    if (!audio) return;
    audio.preservesPitch = true;
    // @ts-expect-error webkit prefix for Safari
    audio.webkitPreservesPitch = true;
    audio.defaultPlaybackRate = playbackRate;
    audio.playbackRate = playbackRate;
    if (waveSurferRef.current) {
      waveSurferRef.current.setPlaybackRate(playbackRate);
    }
  }, [playbackRate]);

  // Sync volume
  useEffect(() => {
    volumeRef.current = volume;
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = Math.max(0, Math.min(1, volume));
  }, [volume]);

  // High-precision rAF loop for A-B repeat checking without re-rendering React every frame
  useEffect(() => {
    if (!isPlaying) return;

    let rafId: number;
    let lastTriggerTime = 0;

    const checkLoop = () => {
      const audio = audioRef.current;
      if (!audio || audio.paused) return;

      const loop = abLoopRef.current;
      if (loop && isAbLoopActive(loop)) {
        const curTime = audio.currentTime;
        // Trigger loop when reaching B - 0.05
        if (curTime >= loop.b! - 0.05) {
          const now = performance.now();
          if (now - lastTriggerTime > 200) {
            lastTriggerTime = now;
            if (onAbLoopReachedRef.current) {
              onAbLoopReachedRef.current();
            }
          }
        }
      }

      rafId = requestAnimationFrame(checkLoop);
    };

    rafId = requestAnimationFrame(checkLoop);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying]);

  // WaveSurfer colors based on theme
  const waveColor = isDarkMode ? "#48484a" : "#c7c7cc";
  const progressColor = isDarkMode ? "#f5f5f7" : "#1d1d1f";

  // Re-create or initialize WaveSurfer when container or theme changes
  useEffect(() => {
    const container = containerNode;
    const audio = audioRef.current;

    if (!container || !audio || !hasFile || isLargeFile || hasError) {
      if (waveSurferRef.current) {
        waveSurferRef.current.destroy();
        waveSurferRef.current = null;
      }
      return;
    }

    let destroyed = false;
    let wsInstance: WaveSurfer | null = null;

    const setupWaveSurfer = () => {
      if (destroyed) return;
      try {
        if (waveSurferRef.current) {
          waveSurferRef.current.destroy();
          waveSurferRef.current = null;
        }

        const ws = WaveSurfer.create({
          container,
          media: audio,
          url: currentUrlRef.current || undefined,
          height: 132,
          waveColor,
          progressColor,
          barWidth: 3,
          barGap: 3,
          barRadius: 3,
          cursorWidth: 0,
          normalize: true,
          interact: true,
        });

        ws.on("error", (err) => {
          console.warn("WaveSurfer warning:", err);
        });

        ws.on("decode", (dur) => {
          if (dur && dur > 0) {
            setDuration(dur);
          }
        });

        ws.on("ready", (dur) => {
          if (dur && dur > 0) {
            setDuration(dur);
          }
        });

        wsInstance = ws;
        waveSurferRef.current = ws;
      } catch (err) {
        console.warn("WaveSurfer creation error:", err);
      }
    };

    // If container is mounted but not yet laid out (clientWidth === 0), wait one animation frame
    if (container.clientWidth === 0) {
      const raf = requestAnimationFrame(setupWaveSurfer);
      return () => {
        destroyed = true;
        cancelAnimationFrame(raf);
        if (wsInstance) {
          wsInstance.destroy();
          waveSurferRef.current = null;
        }
      };
    } else {
      setupWaveSurfer();
      return () => {
        destroyed = true;
        if (wsInstance) {
          wsInstance.destroy();
          waveSurferRef.current = null;
        }
      };
    }
  }, [containerNode, hasFile, isLargeFile, hasError, waveColor, progressColor]);

  // Load a new file into the audio element
  const loadFile = useCallback((file: File, autoPlay: boolean = false) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Pause previous playback
    try {
      audio.pause();
    } catch {}
    setIsPlaying(false);
    setHasError(false);
    setCurrentTime(0);

    const isLarge = file.size > MAX_WAVEFORM_FILE_SIZE;
    setIsLargeFile(isLarge);

    // Create new object URL
    const objectUrl = URL.createObjectURL(file);
    const prevUrl = currentUrlRef.current;
    currentUrlRef.current = objectUrl;

    audio.src = objectUrl;
    audio.load();
    audio.preservesPitch = true;
    // @ts-expect-error webkit prefix for Safari
    audio.webkitPreservesPitch = true;
    audio.defaultPlaybackRate = playbackRateRef.current;
    audio.playbackRate = playbackRateRef.current;
    audio.volume = Math.max(0, Math.min(1, volumeRef.current));
    setHasFile(true);

    // Revoke previous URL with a safe delay to ensure browser finished unbinding
    if (prevUrl && prevUrl !== objectUrl) {
      setTimeout(() => {
        try {
          URL.revokeObjectURL(prevUrl);
        } catch {}
      }, 3000);
    }

    // Update WaveSurfer if initialized
    if (waveSurferRef.current) {
      if (!isLarge) {
        waveSurferRef.current.load(objectUrl).catch((err) => {
          if (err?.name !== "AbortError") {
            console.warn("WaveSurfer track change error:", err);
          }
        });
      } else {
        waveSurferRef.current.empty();
      }
      waveSurferRef.current.setPlaybackRate(playbackRateRef.current);
    }

    if (autoPlay) {
      audio.play().catch((err) => {
        if (err?.name !== "AbortError") {
          console.warn("Autoplay was prevented:", err);
        }
      });
    }
  }, []);

  // Controls
  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    audio.preservesPitch = true;
    // @ts-expect-error webkit prefix for Safari
    audio.webkitPreservesPitch = true;
    audio.defaultPlaybackRate = playbackRateRef.current;
    audio.playbackRate = playbackRateRef.current;
    try {
      await audio.play();
    } catch (err) {
      console.warn("Playback could not start:", err);
    }
  }, []);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const seek = useCallback((targetSeconds: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const clamped = Math.max(0, Math.min(audio.duration, targetSeconds));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
  }, []);

  const seekToPercent = useCallback((ratio: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const clamped = Math.max(0, Math.min(1, ratio));
    const target = clamped * audio.duration;
    audio.currentTime = target;
    setCurrentTime(target);
  }, []);

  const skip = useCallback((deltaSeconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const target = audio.currentTime + deltaSeconds;
    const clamped = Math.max(0, Math.min(audio.duration || 0, target));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
  }, []);

  const replay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.preservesPitch = true;
    // @ts-expect-error webkit prefix for Safari
    audio.webkitPreservesPitch = true;
    audio.defaultPlaybackRate = playbackRateRef.current;
    audio.playbackRate = playbackRateRef.current;
    audio.currentTime = 0;
    setCurrentTime(0);
    audio.play().catch(() => {});
  }, []);

  const resetAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.pause();
      } catch {}
      audio.removeAttribute("src");
      audio.load();
    }
    if (currentUrlRef.current) {
      try {
        URL.revokeObjectURL(currentUrlRef.current);
      } catch {}
      currentUrlRef.current = null;
    }
    if (waveSurferRef.current) {
      try {
        waveSurferRef.current.destroy();
      } catch {}
      waveSurferRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setHasFile(false);
    setHasError(false);
  }, []);

  const progressPercent = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;

  return {
    waveformContainerRef,
    isPlaying,
    currentTime,
    duration,
    progressPercent,
    currentTimeFormatted: formatTime(currentTime),
    totalTimeFormatted: formatTime(duration),
    isLargeFile,
    hasError,
    loadFile,
    play,
    pause,
    resetAudio,
    togglePlay,
    seek,
    seekToPercent,
    skip,
    replay,
  };
}
