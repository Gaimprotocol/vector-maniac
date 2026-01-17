import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { primeAudioContext } from '@/game/utils';

interface MusicContextType {
  startMusicRef: React.MutableRefObject<HTMLAudioElement | null>;
  hasEnteredGalaxy: boolean;
  showMenuContent: boolean;
  enterGalaxy: () => void;
  primeAudio: () => void;
  isAudioPrimed: boolean;
  updateStartMusicTrack: (file: string) => void;
}

const MusicContext = createContext<MusicContextType | null>(null); // v3

export const useMusicContext = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusicContext must be used within MusicProvider');
  }
  return context;
};

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const startMusicRef = useRef<HTMLAudioElement | null>(null);
  const [hasEnteredGalaxy, setHasEnteredGalaxy] = useState(false);
  const [showMenuContent, setShowMenuContent] = useState(false);
  const [isAudioPrimed, setIsAudioPrimed] = useState(false);
  const hasInitialized = useRef(false);

  // Initialize audio with Startscreen for the menu (always the same)
  // The player's chosen soundtrack is used when the game starts, not here
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    // Always use Startscreen for the menu
    startMusicRef.current = new Audio('/audio/Startscreen.mp3');
    startMusicRef.current.loop = true;
    startMusicRef.current.volume = 0;
    startMusicRef.current.preload = 'auto';
    
    return () => {
      if (startMusicRef.current) {
        startMusicRef.current.pause();
        startMusicRef.current = null;
      }
    };
  }, []);

  // Prime audio on first user interaction
  const primeAudio = useCallback(() => {
    if (isAudioPrimed) return;
    
    // Prime the game's AudioContext for sound effects
    primeAudioContext();
    
    setIsAudioPrimed(true);
  }, [isAudioPrimed]);

  const enterGalaxy = useCallback(() => {
    if (hasEnteredGalaxy) return;
    
    primeAudio();
    
    if (startMusicRef.current) {
      startMusicRef.current.play().then(() => {
        let vol = 0;
        const fadeIn = setInterval(() => {
          vol += 0.0128;
          if (startMusicRef.current && vol <= 0.128) {
            startMusicRef.current.volume = vol;
          } else {
            clearInterval(fadeIn);
          }
        }, 50);
      }).catch(console.error);
    }
    
    setHasEnteredGalaxy(true);
    setTimeout(() => setShowMenuContent(true), 300);
  }, [hasEnteredGalaxy, primeAudio]);

  // Function to update the start music track
  const updateStartMusicTrack = useCallback((file: string) => {
    if (startMusicRef.current) {
      const wasPlaying = !startMusicRef.current.paused;
      const currentVolume = startMusicRef.current.volume;
      startMusicRef.current.src = file;
      startMusicRef.current.load();
      if (wasPlaying) {
        startMusicRef.current.volume = currentVolume;
        startMusicRef.current.play().catch(console.error);
      }
    }
  }, []);

  return (
    <MusicContext.Provider value={{
      startMusicRef,
      hasEnteredGalaxy,
      showMenuContent,
      enterGalaxy,
      primeAudio,
      isAudioPrimed,
      updateStartMusicTrack,
    }}>
      {children}
    </MusicContext.Provider>
  );
};
