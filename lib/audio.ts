// Pure audio helpers

export function applyPitchAndRate(audio: HTMLAudioElement, rate: number): void {
  audio.preservesPitch = true;
  // @ts-expect-error webkit prefix for Safari
  audio.webkitPreservesPitch = true;
  audio.defaultPlaybackRate = rate;
  audio.playbackRate = rate;
}
