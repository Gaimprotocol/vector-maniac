import { Game } from '@/components/Game';
import { MenuScreen } from '@/components/MenuScreen';
import { Helmet } from 'react-helmet';
import { useEffect, useState, useCallback } from 'react';
import { useMusicContext } from '@/contexts/MusicContext';

const Index = () => {
  const [isLandscape, setIsLandscape] = useState(false);
  const [waitingForLandscape, setWaitingForLandscape] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [vectorManiacStarted, setVectorManiacStarted] = useState(false);
  
  // Use global music context
  const { 
    startMusicRef, 
    primeAudio 
  } = useMusicContext();
  useEffect(() => {
    // Keep a stable, correct viewport height on mobile (fixes 100vh cropping)
    const setAppHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };

    // Check orientation
    const checkOrientation = () => {
      const isLand = window.innerWidth > window.innerHeight;
      setIsLandscape(isLand);
    };

    setAppHeight();
    checkOrientation();

    const onResize = () => {
      setAppHeight();
      checkOrientation();
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  // Auto-start game when rotating to landscape after pressing START (main + survival only)
  useEffect(() => {
    if (waitingForLandscape && isLandscape && !vectorManiacStarted) {
      setGameStarted(true);
      setWaitingForLandscape(false);
      
      // Try to lock orientation to landscape
      const lockOrientation = async () => {
        try {
          const orientation = screen.orientation as any;
          if (orientation?.lock) {
            await orientation.lock('landscape');
          }
        } catch (e) {
          // Orientation lock not supported
        }
      };
      lockOrientation();
    }
  }, [waitingForLandscape, isLandscape, vectorManiacStarted]);

  // Reset when game over (returning to menu)
  const handleGameEnd = useCallback(() => {
    setGameStarted(false);
    setVectorManiacStarted(false);
    setWaitingForLandscape(false);
    // Unlock orientation
    try {
      const orientation = screen.orientation as any;
      if (orientation?.unlock) {
        orientation.unlock();
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  const handleStart = useCallback(() => {
    primeAudio();
    if (isLandscape) {
      setGameStarted(true);
    } else {
      setWaitingForLandscape(true);
    }
  }, [isLandscape, primeAudio]);

  const handleVectorManiacStart = useCallback(() => {
    primeAudio();
    // Vector Maniac is designed for portrait mode - start immediately
    setVectorManiacStarted(true);
    setWaitingForLandscape(false);
    setGameStarted(true);
  }, [primeAudio]);


  const highScore = parseInt(localStorage.getItem('cyberRescueHighScore') || '0');

  return (
    <>
      <Helmet>
        <title>Vector Maniac | Neon Arena Shooter</title>
        <meta name="description" content="Vector Maniac is a neon vector arena shooter by GAIM Studios. Survive 9 waves, collect salvage, and upgrade your ship." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </Helmet>
      
      {/* Portrait mode - waiting for landscape after START pressed (not for Vector Maniac) */}
      {waitingForLandscape && !isLandscape && !vectorManiacStarted && (
        <div 
          className="fixed inset-0 flex flex-col items-center justify-center gap-4 z-50"
          style={{ background: 'linear-gradient(135deg, #050810 0%, #0a1020 50%, #100818 100%)' }}
        >
          <p className="font-pixel text-[8px] text-white/40">GAIM STUDIOS PRESENTS</p>
          <h1 className="font-pixel text-2xl text-cyan-400 animate-pulse">
            VECTOR MANIAC
          </h1>
          <div 
            className="text-5xl mt-4"
            style={{ 
              animation: 'rotate-phone 1.5s ease-in-out infinite',
            }}
          >
            📱
          </div>
          <p className="text-cyan-400 text-sm font-bold text-center px-4 mt-2">
            Rotate your phone to landscape
          </p>
          <p className="text-cyan-600 text-[10px] text-center px-8">
            Game will start automatically
          </p>
          <button
            className="font-pixel text-[9px] text-gray-500 mt-6 underline"
            onClick={() => setWaitingForLandscape(false)}
          >
            ← Back to menu
          </button>
          <style>{`
            @keyframes rotate-phone {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(90deg); }
            }
          `}</style>
        </div>
      )}

       {/* Menu screen */}
       {!waitingForLandscape && !gameStarted && (
         <MenuScreen
           highScore={highScore}
           onStart={handleStart}
           onStartVectorManiac={handleVectorManiacStart}
           startMusicRef={startMusicRef}
         />
       )}

      {/* Game - only when game is started */}
      {gameStarted && (
        <main 
          className="fixed left-0 top-0 w-screen overflow-hidden touch-none select-none"
          style={{ height: 'var(--app-height)', background: 'hsl(var(--space-dark))' }}
        >
          <Game 
            autoStart={gameStarted} 
            onGameEnd={handleGameEnd}
            vectorManiacMode={vectorManiacStarted}
            startMusicRef={startMusicRef}
          />
        </main>
      )}
    </>
  );
};

export default Index;
