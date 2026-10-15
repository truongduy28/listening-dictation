"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MAX_WAVEFORM_FILE_SIZE } from "@/lib/constants";
import { applyPitchAndRate } from "@/lib/audio";

interface UseAudioElementOptions {
  playbackRate: number;
  volume: number;
  onEnded?: () => void;
  onProgress?: (progressPercent: number, currentTime: number, duration: number) => void;
}

export function useAudioElement({
  playbackRate,
  volume,
  onEnded,
  onProgress,
}: UseAudioElementOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentUrlRef = useRef<string | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLargeFile, setIsLargeFile] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [hasFile, setHasFile] = useState<boolean>(false);

  const optsRef = useRef({ playbackRate, volume, onEnded, onProgress });
  useEffect(() => {
    optsRef.current = { playbackRate, volume, onEnded, onProgress };
  });

  // Client mount: instantiate single HTMLAudioElement
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    applyPitchAndRate(audio, optsRef.current.playbackRate);
    audio.volume = Math.max(0, Math.min(1, optsRef.current.volume));

    const handlePlay = () => {
      applyPitchAndRate(audio, optsRef.current.playbackRate);
      setIsPlaying(true);
    };
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (optsRef.current.onProgress && audio.duration > 0) {
        optsRef.current.onProgress((audio.currentTime / audio.duration) * 100, audio.currentTime, audio.duration);
      }
    };
    const handleLoadedMetadata = () => {
      applyPitchAndRate(audio, optsRef.current.playbackRate);
      setDuration(audio.duration || 0);
    };
    const handleCanPlay = () => {
      setHasError(false);
      applyPitchAndRate(audio, optsRef.current.playbackRate);
      if (audio.duration && audio.duration > 0) setDuration(audio.duration);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      optsRef.current.onEnded?.();
    };
    const handleError = () => {
      if (!audio.src || !audio.error || audio.error.code === 1) return;
      console.warn("Audio element error on playback:", audio.error);
      setHasError(true);
      setIsPlaying(false);
    };

    const events: [keyof HTMLMediaElementEventMap, EventListener][] = [
      ["play", handlePlay as EventListener],
      ["pause", handlePause as EventListener],
      ["timeupdate", handleTimeUpdate as EventListener],
      ["loadedmetadata", handleLoadedMetadata as EventListener],
      ["durationchange", handleLoadedMetadata as EventListener],
      ["canplay", handleCanPlay as EventListener],
      ["loadeddata", handleCanPlay as EventListener],
      ["ended", handleEnded as EventListener],
      ["error", handleError as EventListener],
    ];

    events.forEach(([ev, fn]) => audio.addEventListener(ev, fn));
    audioRef.current = audio;

    return () => {
      audio.pause();
      if (currentUrlRef.current) {
        URL.revokeObjectURL(currentUrlRef.current);
        currentUrlRef.current = null;
      }
      events.forEach(([ev, fn]) => audio.removeEventListener(ev, fn));
    };
  }, []);

  // Sync playback rate with preservesPitch
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) applyPitchAndRate(audio, playbackRate);
  }, [playbackRate]);

  // Sync volume
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = Math.max(0, Math.min(1, volume));
  }, [volume]);

  // Load a new file into the audio element
  const loadFile = useCallback((file: File, autoPlay: boolean = false) => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.pause();
    } catch {}
    setIsPlaying(false);
    setHasError(false);
    setCurrentTime(0);

    const isLarge = file.size > MAX_WAVEFORM_FILE_SIZE;
    setIsLargeFile(isLarge);

    const objectUrl = URL.createObjectURL(file);
    const prevUrl = currentUrlRef.current;
    currentUrlRef.current = objectUrl;

    audio.src = objectUrl;
    audio.load();
    applyPitchAndRate(audio, optsRef.current.playbackRate);
    audio.volume = Math.max(0, Math.min(1, optsRef.current.volume));
    setHasFile(true);

    if (prevUrl && prevUrl !== objectUrl) {
      setTimeout(() => {
        try { URL.revokeObjectURL(prevUrl); } catch {}
      }, 3000);
    }

    if (autoPlay) {
      audio.play().catch((err) => {
        if (err?.name !== "AbortError") console.warn("Autoplay was prevented:", err);
      });
    }

    return objectUrl;
  }, []);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    applyPitchAndRate(audio, optsRef.current.playbackRate);
    try {
      await audio.play();
    } catch (err) {
      console.warn("Playback could not start:", err);
    }
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
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
    seek(Math.max(0, Math.min(1, ratio)) * audio.duration);
  }, [seek]);

  const skip = useCallback((deltaSeconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    seek(audio.currentTime + deltaSeconds);
  }, [seek]);

  const replay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    applyPitchAndRate(audio, optsRef.current.playbackRate);
    audio.currentTime = 0;
    setCurrentTime(0);
    audio.play().catch(() => {});
  }, []);

  const resetAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      try { audio.pause(); } catch {}
      audio.removeAttribute("src");
      audio.load();
    }
    if (currentUrlRef.current) {
      try { URL.revokeObjectURL(currentUrlRef.current); } catch {}
      currentUrlRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setHasFile(false);
    setHasError(false);
  }, []);

  return {
    audioRef,
    currentUrlRef,
    isPlaying,
    currentTime,
    duration,
    setDuration,
    isLargeFile,
    hasError,
    hasFile,
    loadFile,
    play,
    pause,
    togglePlay,
    seek,
    seekToPercent,
    skip,
    replay,
    resetAudio,
  };
}
