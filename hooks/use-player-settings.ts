"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { PlaybackRate } from "@/components/toolbar-card";
import { getStoredSettings, saveStoredSettings, DEFAULT_SETTINGS } from "@/lib/storage";

export function usePlayerSettings() {
  const initialSettings = useMemo(() => getStoredSettings(), []);
  const [playbackRate, setPlaybackRate] = useState<PlaybackRate>(initialSettings.playbackRate);
  const [volume, setVolume] = useState<number>(initialSettings.volume);
  const lastNonZeroVolumeRef = useRef<number>(initialSettings.volume > 0 ? initialSettings.volume : 1);

  const handleVolumeChange = useCallback((newVol: number) => {
    setVolume(newVol);
    if (newVol > 0) {
      lastNonZeroVolumeRef.current = newVol;
    }
    saveStoredSettings({ volume: newVol });
  }, []);

  const handleToggleMute = useCallback(() => {
    setVolume((prev) => {
      let next: number;
      if (prev > 0) {
        lastNonZeroVolumeRef.current = prev;
        next = 0;
      } else {
        next = lastNonZeroVolumeRef.current > 0 ? lastNonZeroVolumeRef.current : 1;
      }
      saveStoredSettings({ volume: next });
      return next;
    });
  }, []);

  const [skipSeconds, setSkipSeconds] = useState<number>(initialSettings.skipSeconds);
  const [repeatCount, setRepeatCount] = useState<number>(initialSettings.repeatCount);
  const [gapSeconds, setGapSeconds] = useState<number>(initialSettings.gapSeconds);
  const [autoNext, setAutoNext] = useState<boolean>(initialSettings.autoNext);

  const handlePlaybackRateChange = useCallback((rate: PlaybackRate) => {
    setPlaybackRate(rate);
    saveStoredSettings({ playbackRate: rate });
  }, []);

  const handleSkipSecondsChange = useCallback((seconds: number) => {
    setSkipSeconds(seconds);
    saveStoredSettings({ skipSeconds: seconds });
  }, []);

  const handleRepeatCountChange = useCallback((count: number) => {
    setRepeatCount(count);
    saveStoredSettings({ repeatCount: count });
  }, []);

  const handleGapSecondsChange = useCallback((seconds: number) => {
    setGapSeconds(seconds);
    saveStoredSettings({ gapSeconds: seconds });
  }, []);

  const handleAutoNextChange = useCallback((next: boolean) => {
    setAutoNext(next);
    saveStoredSettings({ autoNext: next });
  }, []);

  const handleSpeedDown = useCallback(() => {
    const RATES: PlaybackRate[] = [0.5, 0.75, 1, 1.25, 1.5];
    const idx = RATES.indexOf(playbackRate);
    if (idx > 0) {
      const nextRate = RATES[idx - 1];
      setPlaybackRate(nextRate);
      saveStoredSettings({ playbackRate: nextRate });
    }
  }, [playbackRate]);

  const handleSpeedUp = useCallback(() => {
    const RATES: PlaybackRate[] = [0.5, 0.75, 1, 1.25, 1.5];
    const idx = RATES.indexOf(playbackRate);
    if (idx < RATES.length - 1) {
      const nextRate = RATES[idx + 1];
      setPlaybackRate(nextRate);
      saveStoredSettings({ playbackRate: nextRate });
    }
  }, [playbackRate]);

  const resetSettings = useCallback(() => {
    setPlaybackRate(DEFAULT_SETTINGS.playbackRate);
    setVolume(DEFAULT_SETTINGS.volume);
    setSkipSeconds(DEFAULT_SETTINGS.skipSeconds);
    setRepeatCount(DEFAULT_SETTINGS.repeatCount);
    setGapSeconds(DEFAULT_SETTINGS.gapSeconds);
    setAutoNext(DEFAULT_SETTINGS.autoNext);
  }, []);

  return {
    playbackRate,
    setPlaybackRate: handlePlaybackRateChange,
    handleSpeedDown,
    handleSpeedUp,
    volume,
    handleVolumeChange,
    handleToggleMute,
    skipSeconds,
    setSkipSeconds: handleSkipSecondsChange,
    repeatCount,
    setRepeatCount: handleRepeatCountChange,
    gapSeconds,
    setGapSeconds: handleGapSecondsChange,
    autoNext,
    setAutoNext: handleAutoNextChange,
    resetSettings,
  };
}
