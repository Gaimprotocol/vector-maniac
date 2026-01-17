import { useState, useEffect, useCallback } from 'react';

export interface Soundtrack {
  id: string;
  name: string;
  file: string;
  artist?: string;
}

// Free soundtracks (available without purchase)
export const FREE_SOUNDTRACKS: Soundtrack[] = [
  { id: 'default', name: 'Galactic Overdrive', file: '/audio/Galactic_Overdrive.mp3' },
  { id: 'neon_striker', name: 'Neon Striker', file: '/audio/Neon_striker_featuring_Dystopian_Dawn.mp3', artist: 'Dystopian Dawn' },
];

// Premium soundtracks (unlocked with soundtrack pack)
export const PREMIUM_SOUNDTRACKS: Soundtrack[] = [
  { id: 'alien_attack', name: 'Alien Attack', file: '/audio/Alien_attack.mp3' },
  { id: 'hypersonic_ride', name: 'Hypersonic Ride', file: '/audio/Hypersonic_ride.mp3' },
  { id: 'free_spirit', name: 'Free Spirit', file: '/audio/Free_spirit.mp3' },
  { id: 'the_last_hope', name: 'The Last Hope', file: '/audio/The_last_hope.mp3' },
  { id: 'new_moon', name: 'New Moon', file: '/audio/New_moon.mp3' },
  { id: 'soft_drifter', name: 'Soft Drifter', file: '/audio/Soft_drifter.mp3' },
  { id: 'good_times', name: 'Good Times', file: '/audio/Good_times.mp3' },
];

// All soundtracks combined for equipment panel
export const SOUNDTRACKS: Soundtrack[] = [...FREE_SOUNDTRACKS, ...PREMIUM_SOUNDTRACKS];

// Extended Soundtrack interface with optional artist
export interface SoundtrackWithArtist extends Soundtrack {
  artist?: string;
}

interface SoundtrackState {
  activeSoundtrackId: string;
}

const STORAGE_KEY = 'galactic_soundtrack';

export function useSoundtrack() {
  const [state, setState] = useState<SoundtrackState>({ activeSoundtrackId: 'default' });
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState({ activeSoundtrackId: parsed.activeSoundtrackId || 'default' });
      }
    } catch (e) {
      console.error('Failed to load soundtrack preference:', e);
    }
    setIsLoading(false);
  }, []);

  const setActiveSoundtrack = useCallback((id: string) => {
    setState({ activeSoundtrackId: id });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ activeSoundtrackId: id }));
    } catch (e) {
      console.error('Failed to save soundtrack preference:', e);
    }
  }, []);

  const getActiveSoundtrack = useCallback((): Soundtrack => {
    return SOUNDTRACKS.find(s => s.id === state.activeSoundtrackId) || SOUNDTRACKS[0];
  }, [state.activeSoundtrackId]);

  return {
    state,
    isLoading,
    setActiveSoundtrack,
    getActiveSoundtrack,
    getActiveSoundtrackId: () => state.activeSoundtrackId,
  };
}

// Helper to get the stored soundtrack file path
export function getStoredSoundtrackFile(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Search in all soundtracks (free + premium)
      const track = SOUNDTRACKS.find(s => s.id === parsed.activeSoundtrackId);
      if (track) return track.file;
    }
  } catch (e) {
    console.error('Failed to get stored soundtrack:', e);
  }
  return FREE_SOUNDTRACKS[0].file;
}

// Save soundtrack selection to storage
export function saveSelectedSoundtrack(trackId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ activeSoundtrackId: trackId }));
  } catch (e) {
    console.error('Failed to save soundtrack preference:', e);
  }
}

// Get stored soundtrack ID
export function getStoredSoundtrackId(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.activeSoundtrackId || 'default';
    }
  } catch (e) {
    console.error('Failed to get stored soundtrack id:', e);
  }
  return 'default';
}
