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
  const [vectorManiacStarted, setVectorManiacStarted] = useState(false);
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
    setSurvivalModeStarted(false);
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

  const handleVectorManiacStart = useCallback(() => {
    primeAudio();
    // Vector Maniac is designed for portrait mode - start immediately
    setVectorManiacStarted(true);
    setWaitingForLandscape(false);
    setGameStarted(true);
  }, [primeAudio]);


  const handleWatchAd = useCallback(() => {
    if (!canWatchAd()) return;
    primeAudio();
    showRewardedAd();
  }, [showRewardedAd, primeAudio, canWatchAd]);

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
          style={{ background: '#000000' }}
        >
          <p 
            className="font-vector text-xs tracking-[0.3em]"
            style={{ color: '#00ff66', textShadow: '0 0 10px #00ff6660' }}
          >
            GAIM STUDIOS
          </p>
          <h1 
            className="font-vector text-3xl tracking-[0.15em]"
            style={{ color: '#00ff66', textShadow: '0 0 30px #00ff66, 0 0 60px #00ff6680' }}
          >
            VECTOR MANIAC
          </h1>
          <div 
            className="text-5xl mt-4"
            style={{ 
              animation: 'rotate-phone 1.5s ease-in-out infinite',
              filter: 'drop-shadow(0 0 10px #00ff66)',
            }}
          >
            📱
          </div>
          <p 
            className="font-vector text-sm text-center px-4 mt-2"
            style={{ color: '#00ff66', textShadow: '0 0 10px #00ff6680' }}
          >
            Rotate to landscape
          </p>
          <p 
            className="font-vector text-[10px] text-center px-8"
            style={{ color: '#00ff6680' }}
          >
            Game will start automatically
          </p>
          <button
            className="font-vector text-xs mt-6 border px-4 py-2 transition-all hover:bg-[#00ff6615]"
            style={{ borderColor: '#00ff6660', color: '#00ff6680' }}
            onClick={() => setWaitingForLandscape(false)}
          >
            ← BACK
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
          className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
          style={{ background: '#000000' }}
        >
          {/* Floating neon green particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: i % 5 === 0 ? '4px' : i % 3 === 0 ? '3px' : '2px',
                  height: i % 5 === 0 ? '4px' : i % 3 === 0 ? '3px' : '2px',
                  left: `${(i * 17 + 5) % 100}%`,
                  top: `${(i * 23 + 10) % 100}%`,
                  background: '#00ff66',
                  boxShadow: '0 0 8px #00ff66, 0 0 15px #00ff6680',
                  opacity: 0.4 + (i % 5) * 0.15,
                  animation: `floatParticle ${15 + (i % 10) * 2}s ease-in-out infinite`,
                  animationDelay: `-${(i * 1.3) % 15}s`,
                }}
              />
            ))}
          </div>

          {/* Subtle radial glow in center */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0,255,102,0.08) 0%, transparent 60%)',
            }}
          />

          {/* Studio name with diamonds */}
          <div className="flex items-center gap-3 mb-6">
            <div 
              className="w-2 h-2 rotate-45" 
              style={{ 
                background: '#00ff66',
                boxShadow: '0 0 8px #00ff66',
              }} 
            />
            <p 
              className="font-vector text-sm tracking-[0.4em] uppercase"
              style={{ 
                color: '#00ff66',
                textShadow: '0 0 20px #00ff6680',
              }}
            >
              GAIM STUDIOS
            </p>
            <div 
              className="w-2 h-2 rotate-45" 
              style={{ 
                background: '#00ff66',
                boxShadow: '0 0 8px #00ff66',
              }} 
            />
          </div>

          {/* Main title - VECTOR MANIAC */}
          <h1 
            className="font-vector font-black text-5xl md:text-6xl tracking-[0.2em] mb-2"
            style={{ 
              color: '#00ff66',
              textShadow: '0 0 30px #00ff66, 0 0 60px #00ff6680, 0 0 100px #00ff6640',
            }}
          >
            VECTOR MANIAC
          </h1>

          {/* Subtitle */}
          <p 
            className="font-vector text-xl md:text-2xl tracking-[0.3em] mb-6"
            style={{ 
              color: '#00ff66',
              textShadow: '0 0 20px #00ff6680',
            }}
          >
            NEON SIEGE
          </p>

          {/* Decorative line with diamond */}
          <div className="flex items-center gap-2 mb-6">
            <div 
              className="w-28 h-0.5"
              style={{ 
                background: 'linear-gradient(90deg, transparent, #00ff66)',
                boxShadow: '0 0 10px #00ff6660',
              }} 
            />
            <div 
              className="w-3 h-3 rotate-45 border"
              style={{ 
                borderColor: '#00ff66',
                boxShadow: '0 0 10px #00ff66',
              }} 
            />
            <div 
              className="w-28 h-0.5"
              style={{ 
                background: 'linear-gradient(90deg, #00ff66, transparent)',
                boxShadow: '0 0 10px #00ff6660',
              }} 
            />
          </div>

          {/* Tagline */}
          <p 
            className="font-vector text-xs tracking-[0.3em] mb-10"
            style={{ 
              color: '#00ff66',
              textShadow: '0 0 10px #00ff6660',
            }}
          >
            INTERCEPT &nbsp;•&nbsp; DESTROY &nbsp;•&nbsp; SURVIVE
          </p>

          {/* INITIALIZE button - shown first */}
          {!hasEnteredGalaxy && (
            <button
              className="font-vector font-bold text-base tracking-[0.2em] px-14 py-5 relative overflow-hidden
                         transition-all duration-300 group uppercase border-2"
              style={{ 
                background: 'transparent',
                borderColor: '#00ff66',
                color: '#00ff66',
                boxShadow: '0 0 20px #00ff6640, inset 0 0 30px #00ff6610',
              }}
              onClick={enterGalaxy}
              onTouchEnd={(e) => { e.preventDefault(); enterGalaxy(); }}
            >
              <span className="relative z-10 flex items-center gap-3">
                <span style={{ fontSize: '0.8em' }}>▶</span>
                INITIALIZE
              </span>
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ 
                  background: 'rgba(0,255,102,0.15)',
                  boxShadow: 'inset 0 0 40px #00ff6630',
                }}
              />
            </button>
          )}

          {/* Main menu content - fades in after entering */}
          <div 
            className={`flex flex-col items-center transition-all duration-700 max-h-[60vh] overflow-y-auto px-4 ${
              showMenuContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
          >
            {/* Start button - Start Vector Maniac */}
            <button
              className="font-vector font-bold text-base tracking-[0.2em] px-14 py-5 mb-4 
                         transition-all duration-300 hover:bg-[#00ff6615] uppercase border-2"
              style={{ 
                background: 'transparent',
                borderColor: '#00ff66',
                color: '#00ff66',
                boxShadow: '0 0 20px #00ff6640, inset 0 0 30px #00ff6610',
              }}
              onClick={handleVectorManiacStart}
            >
              <span className="flex items-center gap-3">
                <span style={{ fontSize: '0.8em' }}>▶</span>
                START GAME
              </span>
            </button>
            
            {/* Secondary buttons */}
            <div className={`flex gap-3 mb-3 ${isLandscape ? 'flex-row flex-wrap justify-center' : 'flex-col items-center'}`}>
              <div className="flex gap-3">
                <button
                  className={`font-vector text-xs tracking-wider px-6 py-3 uppercase border
                             transition-all duration-300 hover:bg-[#00ff6615]
                             ${showMenuContent ? 'animate-pop-in' : 'opacity-0 scale-0'}`}
                  style={{ 
                    borderColor: '#00ff6680',
                    color: '#00ff66',
                    boxShadow: '0 0 15px #00ff6630',
                    animationDelay: '200ms',
                    animationFillMode: 'backwards',
                  }}
                  onClick={() => navigate('/shop')}
                >
                  SHOP
                </button>
                <button
                  className={`font-vector text-xs tracking-wider px-6 py-3 uppercase border
                             transition-all duration-300 hover:bg-[#00ff6615]
                             ${showMenuContent ? 'animate-pop-in' : 'opacity-0 scale-0'}`}
                  style={{ 
                    borderColor: '#00ff6680',
                    color: '#00ff66',
                    boxShadow: '0 0 15px #00ff6630',
                    animationDelay: '300ms',
                    animationFillMode: 'backwards',
                  }}
                  onClick={() => navigate('/equipment')}
                >
                  GEAR
                </button>
                <button
                  className={`font-vector text-xs tracking-wider px-6 py-3 uppercase border
                             transition-all duration-300 hover:bg-[#00ff6615]
                             ${showMenuContent ? 'animate-pop-in' : 'opacity-0 scale-0'}`}
                  style={{ 
                    borderColor: '#00ff6680',
                    color: '#00ff66',
                    boxShadow: '0 0 15px #00ff6630',
                    animationDelay: '400ms',
                    animationFillMode: 'backwards',
                  }}
                  onClick={() => navigate('/info')}
                >
                  INFO
                </button>
              </div>
              
              {/* Bonus Maps + Maps Locked indicator + Reward on same row in landscape */}
              <div className="flex gap-3 flex-wrap justify-center">
                {/* Maps locked indicator for non-Ultimate users */}
                {!hasGoldenSkin() && (
                  <button
                    className={`font-vector text-xs tracking-wider px-5 py-2.5 uppercase border
                                transition-all duration-300 hover:bg-[#00ff6615]
                                ${showMenuContent ? 'animate-pop-in' : 'opacity-0 scale-0'}`}
                    style={{ 
                      borderColor: '#00ff6650',
                      color: '#00ff6690',
                      boxShadow: '0 0 10px #00ff6620',
                      animationDelay: '450ms',
                      animationFillMode: 'backwards',
                    }}
                    onClick={() => navigate('/shop')}
                  >
                    🔒 MAPS 21-50
                  </button>
                )}
                
                {/* Bonus Maps button */}
                <button
                  className={`font-vector text-xs tracking-wider px-5 py-2.5 uppercase border
                              transition-all duration-300 hover:bg-[#00ff6615]
                              ${showMenuContent ? 'animate-pop-in' : 'opacity-0 scale-0'}`}
                  style={{ 
                    borderColor: hasGoldenSkin() && bonusMapsEnabled ? '#00ff66' : '#00ff6650',
                    color: hasGoldenSkin() && bonusMapsEnabled ? '#00ff66' : '#00ff6680',
                    boxShadow: hasGoldenSkin() && bonusMapsEnabled ? '0 0 15px #00ff6640' : '0 0 10px #00ff6620',
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
                  {!hasGoldenSkin() ? '🔒 BONUS' : bonusMapsEnabled ? '✓ BONUS' : '✗ BONUS'}
                </button>
                
                {canWatchAd() && (
                  <button
                    onClick={handleWatchAd}
                    disabled={isShowingAd}
                    className={`font-vector text-xs tracking-wider px-5 py-2.5 uppercase border
                               transition-all duration-300 hover:bg-[#00ff6615] disabled:opacity-50
                               ${showMenuContent ? 'animate-pop-in' : 'opacity-0 scale-0'}`}
                    style={{ 
                      borderColor: '#00ff66',
                      color: '#00ff66',
                      boxShadow: '0 0 15px #00ff6640',
                      animationDelay: '600ms',
                      animationFillMode: 'backwards',
                    }}
                  >
                    REWARD ({remainingAdWatches()})
                  </button>
                )}
              </div>
            </div>


            {highScore > 0 && (
              <p 
                className={`font-vector text-sm tracking-wider mb-3 ${showMenuContent ? 'animate-pop-in' : 'opacity-0 scale-0'}`}
                style={{ 
                  color: '#00ff6680',
                  textShadow: '0 0 10px #00ff6640',
                  animationDelay: '700ms', 
                  animationFillMode: 'backwards' 
                }}
              >
                HIGH SCORE: {highScore}
              </p>
            )}

            <div 
              className={`font-vector text-xs text-center space-y-1 ${showMenuContent ? 'animate-pop-in' : 'opacity-0 scale-0'}`}
              style={{ 
                color: '#00ff6650',
                animationDelay: '800ms', 
                animationFillMode: 'backwards' 
              }}
            >
              <p>Touch to fly • Auto-fire</p>
              <p>Double-tap for bomb</p>
              <p className="text-[10px] mt-2" style={{ color: '#00ff6630' }}>v{__BUILD_TIME__}</p>
            </div>
          </div>

          <style>{`
            @keyframes floatParticle {
              0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
              25% { transform: translateY(-30px) translateX(15px); opacity: 0.8; }
              50% { transform: translateY(-15px) translateX(-15px); opacity: 0.5; }
              75% { transform: translateY(-45px) translateX(8px); opacity: 0.9; }
            }
            @keyframes gridMove {
              0% { transform: translateY(0); }
              100% { transform: translateY(40px); }
            }
            @keyframes glow {
              0% { box-shadow: 0 0 20px rgba(0, 255, 100, 0.2); }
              100% { box-shadow: 0 0 40px rgba(0, 255, 100, 0.4), 0 0 60px rgba(100, 255, 0, 0.3); }
            }
            @keyframes pop-in {
              0% { 
                opacity: 0; 
                transform: scale(0.3);
                filter: drop-shadow(0 0 30px rgba(0, 255, 100, 0.8)) drop-shadow(0 0 60px rgba(100, 255, 0, 0.5));
              }
              50% { 
                transform: scale(1.1);
                filter: drop-shadow(0 0 20px rgba(0, 255, 100, 0.6)) drop-shadow(0 0 40px rgba(100, 255, 0, 0.3));
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
            vectorManiacMode={vectorManiacStarted}
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
