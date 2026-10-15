"use client";

import { useState, useCallback } from "react";
import { AbLoop } from "@/lib/abLoop";
import { MAX_WAVEFORM_FILE_SIZE } from "@/lib/constants";
import { formatTime } from "@/lib/format";
import { useWaveform } from "./use-waveform";
import { useDarkMode } from "./use-dark-mode";
import { useAbLoopWatcher } from "./use-ab-loop-watcher";
import { useAudioElement } from "./use-audio-element";

export { MAX_WAVEFORM_FILE_SIZE, formatTime };

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
  const isDarkMode = useDarkMode();
  const [containerNode, setContainerNode] = useState<HTMLDivElement | null>(null);

  const waveformContainerRef = useCallback((node: HTMLDivElement | null) => {
    setContainerNode(node);
  }, []);

  const engine = useAudioElement({
    playbackRate,
    volume,
    onEnded,
    onProgress,
  });

  const { loadTrack, destroyWaveform } = useWaveform({
    containerNode,
    audioRef: engine.audioRef,
    audioUrlRef: engine.currentUrlRef,
    hasFile: engine.hasFile,
    isLargeFile: engine.isLargeFile,
    hasError: engine.hasError,
    playbackRate,
    isDarkMode,
    onDurationChange: engine.setDuration,
  });

  useAbLoopWatcher({
    audioRef: engine.audioRef,
    isPlaying: engine.isPlaying,
    abLoop,
    onAbLoopReached,
  });

  const loadFile = useCallback(
    (file: File, autoPlay: boolean = false) => {
      const isLarge = file.size > MAX_WAVEFORM_FILE_SIZE;
      const objectUrl = engine.loadFile(file, autoPlay);
      if (objectUrl) {
        loadTrack(objectUrl, isLarge, file);
      }
    },
    [engine, loadTrack]
  );

  const resetAudio = useCallback(() => {
    engine.resetAudio();
    destroyWaveform();
  }, [engine, destroyWaveform]);

  const progressPercent = engine.duration > 0 ? Math.round((engine.currentTime / engine.duration) * 100) : 0;

  return {
    waveformContainerRef,
    isPlaying: engine.isPlaying,
    currentTime: engine.currentTime,
    duration: engine.duration,
    progressPercent,
    currentTimeFormatted: formatTime(engine.currentTime),
    totalTimeFormatted: formatTime(engine.duration),
    isLargeFile: engine.isLargeFile,
    hasError: engine.hasError,
    loadFile,
    play: engine.play,
    pause: engine.pause,
    resetAudio,
    togglePlay: engine.togglePlay,
    seek: engine.seek,
    seekToPercent: engine.seekToPercent,
    skip: engine.skip,
    replay: engine.replay,
  };
}
