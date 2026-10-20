import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioElement } from "@/hooks/use-audio-element";

describe("hooks/useAudioElement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls play on audio element when loadFile is invoked with autoPlay=true", () => {
    const playSpy = vi.spyOn(window.HTMLMediaElement.prototype, "play").mockImplementation(() => Promise.resolve());

    const { result } = renderHook(() =>
      useAudioElement({
        playbackRate: 1,
        volume: 1,
      })
    );

    const testFile = new File(["dummy audio"], "track.mp3", { type: "audio/mp3" });

    act(() => {
      result.current.loadFile(testFile, true);
    });

    expect(playSpy).toHaveBeenCalled();
  });

  it("does not call play when loadFile is invoked with autoPlay=false", () => {
    const playSpy = vi.spyOn(window.HTMLMediaElement.prototype, "play").mockImplementation(() => Promise.resolve());

    const { result } = renderHook(() =>
      useAudioElement({
        playbackRate: 1,
        volume: 1,
      })
    );

    const testFile = new File(["dummy audio"], "track.mp3", { type: "audio/mp3" });

    act(() => {
      result.current.loadFile(testFile, false);
    });

    expect(playSpy).not.toHaveBeenCalled();
  });
});
