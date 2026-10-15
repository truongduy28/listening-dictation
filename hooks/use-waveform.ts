"use client";

import { useEffect, useRef, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";

interface UseWaveformOptions {
  containerNode: HTMLDivElement | null;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  audioUrlRef: React.RefObject<string | null>;
  hasFile: boolean;
  isLargeFile: boolean;
  hasError: boolean;
  playbackRate: number;
  isDarkMode: boolean;
  onDurationChange: (duration: number) => void;
}

export function useWaveform({
  containerNode,
  audioRef,
  audioUrlRef,
  hasFile,
  isLargeFile,
  hasError,
  playbackRate,
  isDarkMode,
  onDurationChange,
}: UseWaveformOptions) {
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const pendingTrackRef = useRef<{ objectUrl: string; isLarge: boolean; blob?: Blob } | null>(null);

  const waveColor = isDarkMode ? "#48484a" : "#c7c7cc";
  const progressColor = isDarkMode ? "#f5f5f7" : "#1d1d1f";

  // Re-create or initialize WaveSurfer when container, file, or theme changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!containerNode || !audio || !hasFile || isLargeFile || hasError) {
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

        const pending = pendingTrackRef.current;
        const targetUrl = pending?.objectUrl || audioUrlRef.current || undefined;

        const ws = WaveSurfer.create({
          container: containerNode,
          media: audio,
          url: pending?.blob ? undefined : targetUrl,
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
            onDurationChange(dur);
          }
        });

        ws.on("ready", (dur) => {
          if (dur && dur > 0) {
            onDurationChange(dur);
          }
        });

        if (pending?.blob && !pending.isLarge) {
          ws.loadBlob(pending.blob).catch((err) => {
            if (err?.name !== "AbortError") {
              console.warn("WaveSurfer blob load failed, fallback to URL:", err);
              if (pending.objectUrl) ws.load(pending.objectUrl).catch(() => {});
            }
          });
        }
        pendingTrackRef.current = null;

        wsInstance = ws;
        waveSurferRef.current = ws;
      } catch (err) {
        console.warn("WaveSurfer creation error:", err);
      }
    };

    if (containerNode.clientWidth === 0) {
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
  }, [containerNode, audioRef, audioUrlRef, hasFile, isLargeFile, hasError, waveColor, progressColor, onDurationChange]);

  // Sync playback rate with WaveSurfer
  useEffect(() => {
    if (waveSurferRef.current) {
      waveSurferRef.current.setPlaybackRate(playbackRate);
    }
  }, [playbackRate]);

  const loadTrack = useCallback((objectUrl: string, isLarge: boolean, blob?: Blob) => {
    const ws = waveSurferRef.current;
    if (!ws) {
      pendingTrackRef.current = { objectUrl, isLarge, blob };
      return;
    }
    pendingTrackRef.current = null;
    if (!isLarge) {
      if (blob) {
        ws.loadBlob(blob).catch((err) => {
          if (err?.name !== "AbortError") {
            console.warn("WaveSurfer blob load failed, fallback to url:", err);
            ws.load(objectUrl).catch(() => {});
          }
        });
      } else {
        ws.load(objectUrl).catch((err) => {
          if (err?.name !== "AbortError") {
            console.warn("WaveSurfer track change error:", err);
          }
        });
      }
    } else {
      ws.empty();
    }
    ws.setPlaybackRate(playbackRate);
  }, [playbackRate]);

  const destroyWaveform = useCallback(() => {
    if (waveSurferRef.current) {
      try {
        waveSurferRef.current.destroy();
      } catch {}
      waveSurferRef.current = null;
    }
  }, []);

  return {
    waveSurferRef,
    loadTrack,
    destroyWaveform,
  };
}
