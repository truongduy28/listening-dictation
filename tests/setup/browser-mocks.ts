// Browser API mocks for Vitest / JSDOM environment

import "fake-indexeddb/auto";

// 1. HTMLMediaElement mocks
if (typeof window !== "undefined") {
  window.HTMLMediaElement.prototype.play = function () {
    return Promise.resolve();
  };
  window.HTMLMediaElement.prototype.pause = function () {};
  window.HTMLMediaElement.prototype.load = function () {};

  // 2. ResizeObserver mock
  class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

  // 3. matchMedia mock
  window.matchMedia =
    window.matchMedia ||
    function (query: string) {
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      };
    };

  // 4. URL.createObjectURL & revokeObjectURL
  if (!window.URL.createObjectURL) {
    window.URL.createObjectURL = () => "blob:mock-audio-url";
  }
  if (!window.URL.revokeObjectURL) {
    window.URL.revokeObjectURL = () => {};
  }

  // 5. AudioContext mock
  class MockAudioContext {
    decodeAudioData() {
      return Promise.resolve({
        duration: 10,
        length: 441000,
        numberOfChannels: 2,
        sampleRate: 44100,
        getChannelData: () => new Float32Array(100),
      });
    }
    close() {
      return Promise.resolve();
    }
  }
  // @ts-expect-error mock window AudioContext
  window.AudioContext = MockAudioContext;
  // @ts-expect-error mock webkitAudioContext
  window.webkitAudioContext = MockAudioContext;

  // 6. ServiceWorker mock
  if (!navigator.serviceWorker) {
    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        register: () => Promise.resolve({ addEventListener: () => {} }),
        addEventListener: () => {},
        removeEventListener: () => {},
      },
      writable: true,
      configurable: true,
    });
  }
}
