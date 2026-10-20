import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRepeatController } from "@/hooks/use-repeat-controller";
import { AudioFile } from "@/lib/file-system";

const mockFile1: AudioFile = {
  id: "file-1",
  name: "01.mp3",
  index: 1,
  file: new File(["audio1"], "01.mp3", { type: "audio/mp3" }),
  listened: false,
  starred: false,
};

const mockFile2: AudioFile = {
  id: "file-2",
  name: "02.mp3",
  index: 2,
  file: new File(["audio2"], "02.mp3", { type: "audio/mp3" }),
  listened: false,
  starred: false,
};

const mockFile3: AudioFile = {
  id: "file-3",
  name: "03.mp3",
  index: 3,
  file: new File(["audio3"], "03.mp3", { type: "audio/mp3" }),
  listened: false,
  starred: false,
};

describe("hooks/useRepeatController", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("handles autoNext correctly by advancing to next track and triggering autoplay", () => {
    const markListened = vi.fn();
    const selectFile = vi.fn();
    const setShouldAutoPlay = vi.fn();
    const clearAbLoop = vi.fn();
    const replayMock = vi.fn();
    const replayRef = { current: replayMock };

    const { result } = renderHook(() =>
      useRepeatController({
        repeatCount: 1,
        gapSeconds: 2,
        autoNext: true,
        currentFile: mockFile1,
        folderName: "TestFolder",
        filteredFiles: [mockFile1, mockFile2, mockFile3],
        consumePendingFilterAdvance: () => false,
        setShouldAutoPlay,
        replayRef,
        selectFile,
        markListened,
        clearAbLoop,
      })
    );

    // Audio ends
    act(() => {
      result.current.handleAudioEnded();
    });

    expect(markListened).toHaveBeenCalledWith("file-1");
    expect(result.current.isWaitingGap).toBe(true);
    expect(result.current.gapCountdown).toBe(2);

    // Advance 1s
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.gapCountdown).toBe(1);
    expect(selectFile).not.toHaveBeenCalled();

    // Advance 1s more (gap finishes)
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.isWaitingGap).toBe(false);
    expect(clearAbLoop).toHaveBeenCalled();
    expect(setShouldAutoPlay).toHaveBeenCalledWith(true);
    expect(selectFile).toHaveBeenCalledWith("file-2");
  });

  it("repeats current track if currentRepeat < repeatCount before autoNext", () => {
    const markListened = vi.fn();
    const selectFile = vi.fn();
    const setShouldAutoPlay = vi.fn();
    const replayMock = vi.fn();
    const replayRef = { current: replayMock };

    const { result } = renderHook(() =>
      useRepeatController({
        repeatCount: 2,
        gapSeconds: 1,
        autoNext: true,
        currentFile: mockFile1,
        folderName: "TestFolder",
        filteredFiles: [mockFile1, mockFile2],
        consumePendingFilterAdvance: () => false,
        setShouldAutoPlay,
        replayRef,
        selectFile,
        markListened,
      })
    );

    // First audio end: should repeat
    act(() => {
      result.current.handleAudioEnded();
    });

    expect(markListened).not.toHaveBeenCalled();
    expect(result.current.isWaitingGap).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.currentRepeat).toBe(2);
    expect(replayMock).toHaveBeenCalledTimes(1);
    expect(selectFile).not.toHaveBeenCalled();

    // Second audio end: should autoNext
    act(() => {
      result.current.handleAudioEnded();
    });

    expect(markListened).toHaveBeenCalledWith("file-1");

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(setShouldAutoPlay).toHaveBeenCalledWith(true);
    expect(selectFile).toHaveBeenCalledWith("file-2");
  });

  it("stops at end of queue when autoNext is on but no more files", () => {
    const markListened = vi.fn();
    const selectFile = vi.fn();
    const setShouldAutoPlay = vi.fn();
    const replayRef = { current: vi.fn() };

    const { result } = renderHook(() =>
      useRepeatController({
        repeatCount: 1,
        gapSeconds: 0,
        autoNext: true,
        currentFile: mockFile3,
        folderName: "TestFolder",
        filteredFiles: [mockFile1, mockFile2, mockFile3],
        consumePendingFilterAdvance: () => false,
        setShouldAutoPlay,
        replayRef,
        selectFile,
        markListened,
      })
    );

    act(() => {
      result.current.handleAudioEnded();
    });

    expect(markListened).toHaveBeenCalledWith("file-3");
    expect(selectFile).not.toHaveBeenCalled();
    expect(setShouldAutoPlay).not.toHaveBeenCalled();
  });
});
