import { Game } from '@/components/Game';
import { Helmet } from 'react-helmet';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePurchases } from '@/hooks/usePurchases';
import { useRewardedAds } from '@/hooks/useRewardedAds';
import { RewardedAdOverlay } from '@/components/RewardedAdOverlay';
import { AdRewardPopup } from '@/components/AdRewardPopup';
import { useMusicContext } from '@/contexts/MusicContext';
import { playPopSoundsWithDelays } from '@/utils/popSound';

const Index = () => {
  const [isLandscape, setIsLandscape] = useState(false);
  const [waitingForLandscape, setWaitingForLandscape] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [survivalModeStarted, setSurvivalModeStarted] = useState(false);
  const [bonusMapsEnabled, setBonusMapsEnabled] = useState(() => {
    return localStorage.getItem('bonusMapsEnabled') !== 'false';
  });
  const navigate = useNavigate();
  const { shouldShowAds, hasSurvivalMode, hasGoldenSkin } = usePurchases();
  const { 
    isShowingAd, 
    adProgress, 
    pendingReward, 
    showRewardPopup, 
    showRewardedAd, 
    closeRewardPopup,
    canWatchAd,
    remainingAdWatches,
    getActiveRewardsList,
    getPendingRewardsList,
    activatePendingReward,
    isNative,
  } = useRewardedAds();
  
  // Use global music context
  const { 
    startMusicRef, 
    hasEnteredGalaxy, 
    showMenuContent, 
    enterGalaxy,
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

  // Play pop sounds when menu content appears
  const hasPlayedPopSounds = useRef(false);
  useEffect(() => {
    if (showMenuContent && !hasPlayedPopSounds.current) {
      hasPlayedPopSounds.current = true;
      // Delays match button animationDelays: 100, 200, 300, 400ms
      playPopSoundsWithDelays([100, 200, 300, 400]);
    }
  }, [showMenuContent]);

  // Auto-start game when rotating to landscape after pressing START
  useEffect(() => {
    if (waitingForLandscape && isLandscape) {
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
  }, [waitingForLandscape, isLandscape]);

  // Reset when game over (returning to menu)
  const handleGameEnd = useCallback(() => {
    setGameStarted(false);
    setSurvivalModeStarted(false);
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

  const handleSurvivalStart = useCallback(() => {
    primeAudio();
    if (isLandscape) {
      setSurvivalModeStarted(true);
      setGameStarted(true);
    } else {
      setSurvivalModeStarted(true);
      setWaitingForLandscape(true);
    }
  }, [isLandscape, primeAudio]);


  const handleWatchAd = useCallback(() => {
    if (!canWatchAd()) return;
    primeAudio();
    showRewardedAd();
  }, [showRewardedAd, primeAudio, canWatchAd]);

  const highScore = parseInt(localStorage.getItem('cyberRescueHighScore') || '0');

  return (
    <>
      <Helmet>
        <title>Galactic Overdrive | Retro Arcade Shooter</title>
        <meta name="description" content="A retro 8-bit cyberpunk side-scrolling shooter by GAIM Studios. Rescue civilians, destroy enemies, and survive the hostile terrain." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="screen-orientation" content="landscape" />
      </Helmet>
      
      {/* Portrait mode - waiting for landscape after START pressed */}
      {waitingForLandscape && !isLandscape && (
        <div 
          className="fixed inset-0 flex flex-col items-center justify-center gap-4 z-50"
          style={{ background: 'linear-gradient(135deg, #050810 0%, #0a1020 50%, #100818 100%)' }}
        >
          <p className="font-pixel text-[8px] text-white/40">GAIM STUDIOS PRESENTS</p>
          <h1 className="font-pixel text-2xl text-cyan-400 animate-pulse">
            GALACTIC OVERDRIVE
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

      {/* Menu screen - shown in both portrait and landscape when not in game */}
      {!waitingForLandscape && !gameStarted && (
        <div 
          className="fixed inset-0 flex flex-col items-center justify-center z-50"
          style={{ 
            background: 'radial-gradient(ellipse at center, #0a1628 0%, #050810 70%, #020305 100%)'
          }}
        >
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: Math.random() * 3 + 1 + 'px',
                  height: Math.random() * 3 + 1 + 'px',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                  background: i % 3 === 0 ? '#00e5ff' : i % 3 === 1 ? '#ff00ff' : '#ffffff',
                  opacity: Math.random() * 0.5 + 0.2,
                  animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
                  animationDelay: `-${Math.random() * 10}s`,
                }}
              />
            ))}
          </div>

          {/* GAIM STUDIOS with diamonds */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-cyan-400 text-xs">◆</span>
            <p className="font-pixel text-[10px] tracking-[0.3em] text-gray-400">
              GAIM STUDIOS
            </p>
            <span className="text-cyan-400 text-xs">◆</span>
          </div>

          {/* Main title - two tone */}
          <h1 className="font-pixel text-2xl mb-2 flex flex-col items-center gap-1">
            <span className="text-cyan-400" style={{ textShadow: '0 0 20px #00e5ff, 0 0 40px #00e5ff50' }}>
              GALACTIC
            </span>
            <span className="text-magenta" style={{ textShadow: '0 0 20px #ff00ff, 0 0 40px #ff00ff50' }}>
              OVERDRIVE
            </span>
          </h1>

          {/* Tagline */}
          <p className="font-pixel text-[8px] tracking-[0.2em] text-gray-500 mb-8">
            NAVIGATE THE INFINITE VOID
          </p>

          {/* ENTER THE GALAXY button - shown first */}
          {!hasEnteredGalaxy && (
            <button
              className="font-pixel text-xs text-white/80 border border-white/30 rounded-full px-8 py-3 
                         transition-all duration-500 hover:border-cyan-400 hover:text-cyan-400 hover:bg-cyan-400/10"
              style={{ 
                boxShadow: '0 0 30px rgba(0, 229, 255, 0.15)',
                animation: 'pulse 2s ease-in-out infinite, glow 3s ease-in-out infinite alternate',
              }}
              onClick={enterGalaxy}
              onTouchEnd={(e) => { e.preventDefault(); enterGalaxy(); }}
            >
              ▶ ENTER THE GALAXY
            </button>
          )}

          {/* Main menu content - fades in after entering */}
          <div 
            className={`flex flex-col items-center transition-all duration-700 max-h-[60vh] overflow-y-auto px-4 ${
              showMenuContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
          >
            {/* Start button */}
            <button
              className="font-pixel text-sm text-cyan-400 border-2 border-cyan-400/50 rounded-full px-12 py-3 mb-3 
                         transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-400/10 active:bg-cyan-400/20"
              style={{ 
                boxShadow: '0 0 20px rgba(0, 229, 255, 0.2), inset 0 0 20px rgba(0, 229, 255, 0.05)',
              }}
              onClick={handleStart}
            >
              START MISSION
            </button>

            {/* Survival Mode button - always shown, locked style when not purchased */}
            <button
              className={`font-pixel text-[11px] border-2 rounded-full px-8 py-2 mb-3 
                         transition-all duration-300 
                         ${hasSurvivalMode() 
                           ? 'text-orange-400 border-orange-400/50 hover:border-orange-400 hover:bg-orange-400/10 active:bg-orange-400/20'
                           : 'text-orange-400 border-orange-400/50 hover:border-orange-300 hover:bg-orange-400/10'
                         }
                         ${showMenuContent ? 'animate-pop-in' : 'opacity-0 scale-0'}`}
              style={{ 
                boxShadow: '0 0 20px rgba(255, 150, 0, 0.2), inset 0 0 20px rgba(255, 150, 0, 0.05)',
                animationDelay: '100ms',
                animationFillMode: 'backwards',
              }}
              onClick={hasSurvivalMode() ? handleSurvivalStart : () => navigate('/shop')}
            >
              {hasSurvivalMode() ? '♾️ SURVIVAL MODE' : '🔒 SURVIVAL MODE'}
            </button>

            {/* Secondary buttons - single row in landscape, stacked in portrait */}
            <div className={`flex gap-2 mb-3 ${isLandscape ? 'flex-row flex-wrap justify-center' : 'flex-col items-center'}`}>
              <div className="flex gap-2">
                <button
                  className={`font-pixel text-[9px] text-yellow-400 border border-yellow-400/50 rounded-full px-4 py-1.5 
                             transition-all duration-300 hover:border-yellow-400 hover:bg-yellow-400/10
                             ${showMenuContent ? 'animate-pop-in' : 'opacity-0 scale-0'}`}
                  style={{ 
                    boxShadow: '0 0 15px rgba(255, 255, 0, 0.15)',
                    animationDelay: '200ms',
                    animationFillMode: 'backwards',
                  }}
                  onClick={() => navigate('/shop')}
                >
                  🛒 SHOP
                </button>
                <button
                  className={`font-pixel text-[9px] text-purple-400 border border-purple-400/50 rounded-full px-4 py-1.5 
                             transition-all duration-300 hover:border-purple-400 hover:bg-purple-400/10
                             ${showMenuContent ? 'animate-pop-in' : 'opacity-0 scale-0'}`}
                  style={{ 
                    boxShadow: '0 0 15px rgba(170, 0, 255, 0.15)',
                    animationDelay: '300ms',
                    animationFillMode: 'backwards',
                  }}
                  onClick={() => navigate('/equipment')}
                >
                  ⚙️ GEAR
                </button>
                <button
                  className={`font-pixel text-[9px] text-magenta border border-magenta/50 rounded-full px-4 py-1.5 
                             transition-all duration-300 hover:border-magenta hover:bg-magenta/10
                             ${showMenuContent ? 'animate-pop-in' : 'opacity-0 scale-0'}`}
                  style={{ 
                    boxShadow: '0 0 15px rgba(255, 0, 255, 0.15)',
                    animationDelay: '400ms',
                    animationFillMode: 'backwards',
                  }}
                  onClick={() => navigate('/info')}
                >
                  ℹ️ INFO
                </button>
              </div>
              
              {/* Bonus Maps + Maps Locked indicator + Reward on same row in landscape */}
              <div className="flex gap-2 flex-wrap justify-center">
                {/* Maps locked indicator for non-Ultimate users */}
                {!hasGoldenSkin() && (
                  <button
                    className={`font-pixel text-[8px] text-yellow-500 border border-yellow-500/50 rounded-full px-4 py-1.5
                                transition-all duration-300 hover:border-yellow-400 hover:bg-yellow-500/10
                                ${showMenuContent ? 'animate-pop-in' : 'opacity-0 scale-0'}`}
                    style={{ 
                      boxShadow: '0 0 15px rgba(255, 200, 0, 0.15)',
                      animationDelay: '450ms',
                      animationFillMode: 'backwards',
                    }}
                    onClick={() => navigate('/shop')}
                  >
                    🔒 MAPS 21-50
                  </button>
                )}
                
                {/* Bonus Maps button - always shown, locked style when not purchased */}
                <button
                  className={`font-pixel text-[8px] border rounded-full px-4 py-1.5
                              transition-all duration-300 ${
                                hasGoldenSkin()
                                  ? bonusMapsEnabled 
                                    ? 'text-green-400 border-green-400/50 hover:border-green-400 hover:bg-green-400/10' 
                                    : 'text-gray-500 border-gray-500/50 hover:border-gray-500 hover:bg-gray-500/10'
                                  : 'text-purple-400 border-purple-400/50 hover:border-purple-300 hover:bg-purple-400/10'
                              } ${showMenuContent ? 'animate-pop-in' : 'opacity-0 scale-0'}`}
                  style={{ 
                    boxShadow: hasGoldenSkin() 
                      ? (bonusMapsEnabled ? '0 0 15px rgba(74, 222, 128, 0.15)' : 'none')
                      : '0 0 15px rgba(170, 0, 255, 0.15)',
                    animationDelay: '500ms',
                    animationFillMode: 'backwards',
                  }}
                  onClick={() => {
                    if (!hasGoldenSkin()) {
                      navigate('/shop');
                      return;
                    }
                    const newValue = !bonusMapsEnabled;
                    setBonusMapsEnabled(newValue);
                    localStorage.setItem('bonusMapsEnabled', String(newValue));
                  }}
                >
                  {!hasGoldenSkin() ? '🔒 BONUS MAPS' : bonusMapsEnabled ? '✓ BONUS MAPS' : '✗ BONUS MAPS'}
                </button>
                
                {canWatchAd() && (
                  <button
                    onClick={handleWatchAd}
                    disabled={isShowingAd}
                    className={`font-pixel text-[9px] text-green-400 border border-green-400/50 rounded-full px-4 py-1.5
                               transition-all duration-300 hover:border-green-400 hover:bg-green-400/10 disabled:opacity-50
                               ${showMenuContent ? 'animate-pop-in' : 'opacity-0 scale-0'}`}
                    style={{ 
                      boxShadow: '0 0 15px rgba(0, 255, 100, 0.15)',
                      animationDelay: '600ms',
                      animationFillMode: 'backwards',
                    }}
                  >
                    🎬 REWARD ({remainingAdWatches()})
                  </button>
                )}
              </div>
            </div>


            {highScore > 0 && (
              <p 
                className={`font-pixel text-[7px] text-cyan-400/60 mb-2 ${showMenuContent ? 'animate-pop-in' : 'opacity-0 scale-0'}`}
                style={{ animationDelay: '700ms', animationFillMode: 'backwards' }}
              >
                HIGH SCORE: {highScore}
              </p>
            )}

            <div 
              className={`font-pixel text-[6px] text-gray-600 text-center space-y-0.5 ${showMenuContent ? 'animate-pop-in' : 'opacity-0 scale-0'}`}
              style={{ animationDelay: '800ms', animationFillMode: 'backwards' }}
            >
              <p>TOUCH TO FLY • AUTO-FIRE</p>
              <p>DOUBLE-TAP FOR BOMB</p>
              <p className="text-[5px] text-gray-700">BUILD: {__BUILD_TIME__}</p>
            </div>
          </div>

          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0) translateX(0); }
              25% { transform: translateY(-20px) translateX(10px); }
              50% { transform: translateY(-10px) translateX(-10px); }
              75% { transform: translateY(-30px) translateX(5px); }
            }
            @keyframes glow {
              0% { box-shadow: 0 0 20px rgba(0, 229, 255, 0.15); }
              100% { box-shadow: 0 0 40px rgba(0, 229, 255, 0.35), 0 0 60px rgba(255, 0, 255, 0.2); }
            }
            @keyframes pop-in {
              0% { 
                opacity: 0; 
                transform: scale(0.3);
                filter: drop-shadow(0 0 30px rgba(0, 229, 255, 0.8)) drop-shadow(0 0 60px rgba(255, 0, 255, 0.5));
              }
              50% { 
                transform: scale(1.1);
                filter: drop-shadow(0 0 20px rgba(0, 229, 255, 0.6)) drop-shadow(0 0 40px rgba(255, 0, 255, 0.3));
              }
              100% { 
                opacity: 1; 
                transform: scale(1);
                filter: drop-shadow(0 0 0px transparent);
              }
            }
            .animate-pop-in {
              animation: pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
          `}</style>
        </div>
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
            survivalMode={survivalModeStarted}
            startMusicRef={startMusicRef}
            externalPendingRewards={getPendingRewardsList()}
            externalActiveRewardsList={getActiveRewardsList()}
            onActivatePendingReward={activatePendingReward}
          />
        </main>
      )}

      {/* Rewarded Ad Overlay - only show on web, native SDK handles its own UI */}
      {isShowingAd && !isNative && <RewardedAdOverlay progress={adProgress} />}

      {/* Ad Reward Popup */}
      {showRewardPopup && pendingReward && (
        <AdRewardPopup reward={pendingReward} onClose={closeRewardPopup} />
      )}
    </>
  );
};

export default Index;
