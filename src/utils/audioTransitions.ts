/**
 * Audio transition utilities for smooth crossfades between music tracks
 */

const DEFAULT_FADE_DURATION = 1100; // ms
const TARGET_VOLUME = 0.128;

/**
 * Fade out an audio element smoothly
 */
export function fadeOut(
  audio: HTMLAudioElement | null,
  duration: number = DEFAULT_FADE_DURATION,
  resetAfter: boolean = true
): Promise<void> {
  return new Promise((resolve) => {
    if (!audio || audio.paused) {
      resolve();
      return;
    }

    const startVolume = audio.volume;
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = startVolume / steps;
    let currentStep = 0;

    const fadeInterval = setInterval(() => {
      currentStep++;
      const newVolume = Math.max(0, startVolume - volumeStep * currentStep);
      audio.volume = newVolume;

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        audio.pause();
        if (resetAfter) {
          audio.currentTime = 0;
        }
        audio.volume = 0;
        resolve();
      }
    }, stepDuration);
  });
}

/**
 * Fade in an audio element smoothly
 */
export function fadeIn(
  audio: HTMLAudioElement | null,
  targetVolume: number = TARGET_VOLUME,
  duration: number = DEFAULT_FADE_DURATION
): Promise<void> {
  return new Promise((resolve) => {
    if (!audio) {
      resolve();
      return;
    }

    audio.volume = 0;
    audio.play().then(() => {
      const steps = 20;
      const stepDuration = duration / steps;
      const volumeStep = targetVolume / steps;
      let currentStep = 0;

      const fadeInterval = setInterval(() => {
        currentStep++;
        const newVolume = Math.min(targetVolume, volumeStep * currentStep);
        audio.volume = newVolume;

        if (currentStep >= steps) {
          clearInterval(fadeInterval);
          audio.volume = targetVolume;
          resolve();
        }
      }, stepDuration);
    }).catch(() => {
      resolve();
    });
  });
}

/**
 * Crossfade from one audio track to another (simultaneous fade)
 */
export function crossfade(
  fromAudio: HTMLAudioElement | null,
  toAudio: HTMLAudioElement | null,
  targetVolume: number = TARGET_VOLUME,
  duration: number = DEFAULT_FADE_DURATION,
  resetFromAfter: boolean = true
): Promise<void> {
  // Run both fades simultaneously
  return Promise.all([
    fadeOut(fromAudio, duration, resetFromAfter),
    fadeIn(toAudio, targetVolume, duration),
  ]).then(() => {});
}

/**
 * Sequential fade - fade out first, then fade in (no overlap)
 */
export function sequentialFade(
  fromAudio: HTMLAudioElement | null,
  toAudio: HTMLAudioElement | null,
  targetVolume: number = TARGET_VOLUME,
  fadeOutDuration: number = DEFAULT_FADE_DURATION,
  fadeInDuration: number = DEFAULT_FADE_DURATION,
  resetFromAfter: boolean = true
): Promise<void> {
  return fadeOut(fromAudio, fadeOutDuration, resetFromAfter)
    .then(() => fadeIn(toAudio, targetVolume, fadeInDuration));
}

/**
 * Stop all audio tracks except the specified ones, with fade out
 */
export async function fadeOutAllExcept(
  allTracks: HTMLAudioElement[],
  keepTracks: HTMLAudioElement[],
  duration: number = DEFAULT_FADE_DURATION,
  preservePosition: HTMLAudioElement[] = []
): Promise<void> {
  const fadePromises = allTracks
    .filter((track) => !keepTracks.includes(track))
    .map((track) => {
      const shouldReset = !preservePosition.includes(track);
      return fadeOut(track, duration, shouldReset);
    });

  await Promise.all(fadePromises);
}

/**
 * Transition to a new track with crossfade, stopping all others
 */
export async function transitionToTrack(
  allTracks: HTMLAudioElement[],
  targetTrack: HTMLAudioElement,
  targetVolume: number = TARGET_VOLUME,
  duration: number = DEFAULT_FADE_DURATION,
  preservePosition: HTMLAudioElement[] = []
): Promise<void> {
  // Find currently playing track(s)
  const playingTracks = allTracks.filter((t) => !t.paused && t !== targetTrack);

  // If already playing the target, do nothing
  if (!targetTrack.paused && playingTracks.length === 0) {
    return;
  }

  // Fade out all other tracks
  const fadeOutPromises = playingTracks.map((track) => {
    const shouldReset = !preservePosition.includes(track);
    return fadeOut(track, duration, shouldReset);
  });

  // Fade in target track simultaneously
  const fadeInPromise = fadeIn(targetTrack, targetVolume, duration);

  await Promise.all([...fadeOutPromises, fadeInPromise]);
}
