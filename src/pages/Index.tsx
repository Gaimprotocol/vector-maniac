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
          className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
          style={{ 
            background: 'linear-gradient(180deg, #000510 0%, #050015 50%, #100520 100%)'
          }}
        >
          {/* Animated grid background */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 0, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 0, 255, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              animation: 'gridMove 20s linear infinite',
            }}
          />
          
          {/* Glowing orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl"
               style={{ background: 'radial-gradient(circle, #ff00ff 0%, transparent 70%)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl"
               style={{ background: 'radial-gradient(circle, #00ffff 0%, transparent 70%)' }} />

          {/* Floating vector particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  width: i % 3 === 0 ? '3px' : '2px',
                  height: i % 3 === 0 ? '3px' : '2px',
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                  background: i % 2 === 0 ? '#ff00ff' : '#00ffff',
                  boxShadow: i % 2 === 0 ? '0 0 10px #ff00ff' : '0 0 10px #00ffff',
                  opacity: Math.random() * 0.8 + 0.2,
                  animation: `floatParticle ${Math.random() * 15 + 10}s ease-in-out infinite`,
                  animationDelay: `-${Math.random() * 10}s`,
                }}
              />
            ))}
          </div>

          {/* Top decorative line */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <div className="w-24 h-px bg-gradient-to-l from-magenta to-transparent" />
            <div className="w-3 h-3 rotate-45 border-2 border-magenta" style={{ boxShadow: '0 0 10px #ff00ff' }} />
            <div className="w-24 h-px bg-gradient-to-r from-cyan-400 to-transparent" />
          </div>

          {/* Main title - VECTOR MANIAC */}
          <div className="relative mb-4">
            <h1 className="font-vector font-black text-5xl flex flex-col items-center gap-0 relative tracking-wider">
              <span 
                className="text-magenta"
                style={{ 
                  textShadow: '0 0 40px #ff00ff, 0 0 80px #ff00ff60',
                  letterSpacing: '0.15em',
                }}
              >
                VECTOR
              </span>
              <span 
                className="text-cyan-400"
                style={{ 
                  textShadow: '0 0 40px #00ffff, 0 0 80px #00ffff60',
                  letterSpacing: '0.15em',
                }}
              >
                MANIAC
              </span>
            </h1>
            {/* Underline accent */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-40 h-0.5 bg-gradient-to-r from-magenta via-white to-cyan-400" />
          </div>

          {/* Publisher */}
          <p className="font-tech text-[10px] tracking-[0.5em] text-cyan-400/50 mb-3 uppercase">
            A GAIM STUDIOS Production
          </p>
          
          {/* Subtitle */}
          <p className="font-tech text-sm tracking-[0.4em] text-gray-400 mb-1 uppercase">
            Tactical Arena Combat
          </p>
          <p className="font-tech text-xs tracking-widest text-magenta/70 mb-8">
            // SYSTEM v2.0 //
          </p>

          {/* ENTER button - shown first */}
          {!hasEnteredGalaxy && (
            <button
              className="font-vector font-bold text-sm border-2 px-12 py-4 relative overflow-hidden
                         transition-all duration-300 group uppercase tracking-wider"
              style={{ 
                background: 'linear-gradient(180deg, rgba(255,0,255,0.15) 0%, rgba(0,255,255,0.1) 100%)',
                borderColor: '#ff00ff',
                boxShadow: '0 0 30px rgba(255, 0, 255, 0.4), inset 0 0 40px rgba(255, 0, 255, 0.1)',
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
              }}
              onClick={enterGalaxy}
              onTouchEnd={(e) => { e.preventDefault(); enterGalaxy(); }}
            >
              <span className="relative z-10 text-white group-hover:text-cyan-400 transition-colors">
                ▶ Initialize
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-magenta/0 via-cyan-400/30 to-magenta/0 
                              translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
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
              className="font-vector font-semibold text-sm text-cyan-400 border-2 border-cyan-400/60 px-10 py-3 mb-3 
                         transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-400/10 active:bg-cyan-400/20 uppercase tracking-wider"
              style={{ 
                boxShadow: '0 0 25px rgba(0, 255, 255, 0.25)',
                clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
              }}
              onClick={handleVectorManiacStart}
            >
              Start Game
            </button>
            {/* Secondary buttons */}
            <div className={`flex gap-2 mb-3 ${isLandscape ? 'flex-row flex-wrap justify-center' : 'flex-col items-center'}`}>
              <div className="flex gap-2">
                <button
                  className={`font-tech font-semibold text-xs text-yellow-400 border border-yellow-400/50 px-4 py-2 
                             transition-all duration-300 hover:border-yellow-400 hover:bg-yellow-400/10 uppercase
                             ${showMenuContent ? 'animate-pop-in' : 'opacity-0 scale-0'}`}
                  style={{ 
                    boxShadow: '0 0 15px rgba(255, 255, 0, 0.15)',
                    clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
                    animationDelay: '200ms',
                    animationFillMode: 'backwards',
                  }}
                  onClick={() => navigate('/shop')}
                >
                  Shop
                </button>
                <button
                  className={`font-tech font-semibold text-xs text-purple-400 border border-purple-400/50 px-4 py-2 
                             transition-all duration-300 hover:border-purple-400 hover:bg-purple-400/10 uppercase
                             ${showMenuContent ? 'animate-pop-in' : 'opacity-0 scale-0'}`}
                  style={{ 
                    boxShadow: '0 0 15px rgba(170, 0, 255, 0.15)',
                    clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
                    animationDelay: '300ms',
                    animationFillMode: 'backwards',
                  }}
                  onClick={() => navigate('/equipment')}
                >
                  Gear
                </button>
                <button
                  className={`font-tech font-semibold text-xs text-magenta border border-magenta/50 px-4 py-2 
                             transition-all duration-300 hover:border-magenta hover:bg-magenta/10 uppercase
                             ${showMenuContent ? 'animate-pop-in' : 'opacity-0 scale-0'}`}
                  style={{ 
                    boxShadow: '0 0 15px rgba(255, 0, 255, 0.15)',
                    clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
                    animationDelay: '400ms',
                    animationFillMode: 'backwards',
                  }}
                  onClick={() => navigate('/info')}
                >
                  Info
                </button>
              </div>
              
              {/* Bonus Maps + Maps Locked indicator + Reward on same row in landscape */}
              <div className="flex gap-2 flex-wrap justify-center">
                {/* Maps locked indicator for non-Ultimate users */}
                {!hasGoldenSkin() && (
                  <button
                    className={`font-tech font-medium text-xs text-yellow-500 border border-yellow-500/50 px-4 py-2
                                transition-all duration-300 hover:border-yellow-400 hover:bg-yellow-500/10 uppercase
                                ${showMenuContent ? 'animate-pop-in' : 'opacity-0 scale-0'}`}
                    style={{ 
                      boxShadow: '0 0 15px rgba(255, 200, 0, 0.15)',
                      clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
                      animationDelay: '450ms',
                      animationFillMode: 'backwards',
                    }}
                    onClick={() => navigate('/shop')}
                  >
                    🔒 Maps 21-50
                  </button>
                )}
                
                {/* Bonus Maps button */}
                <button
                  className={`font-tech font-medium text-xs border px-4 py-2 uppercase
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
                    clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
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
                  {!hasGoldenSkin() ? '🔒 Bonus Maps' : bonusMapsEnabled ? '✓ Bonus' : '✗ Bonus'}
                </button>
                
                {canWatchAd() && (
                  <button
                    onClick={handleWatchAd}
                    disabled={isShowingAd}
                    className={`font-tech font-medium text-xs text-green-400 border border-green-400/50 px-4 py-2 uppercase
                               transition-all duration-300 hover:border-green-400 hover:bg-green-400/10 disabled:opacity-50
                               ${showMenuContent ? 'animate-pop-in' : 'opacity-0 scale-0'}`}
                    style={{ 
                      boxShadow: '0 0 15px rgba(0, 255, 100, 0.15)',
                      clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
                      animationDelay: '600ms',
                      animationFillMode: 'backwards',
                    }}
                  >
                    Reward ({remainingAdWatches()})
                  </button>
                )}
              </div>
            </div>


            {highScore > 0 && (
              <p 
                className={`font-tech text-sm text-cyan-400/60 mb-2 ${showMenuContent ? 'animate-pop-in' : 'opacity-0 scale-0'}`}
                style={{ animationDelay: '700ms', animationFillMode: 'backwards' }}
              >
                HIGH SCORE: {highScore}
              </p>
            )}

            <div 
              className={`font-tech text-xs text-gray-500 text-center space-y-0.5 ${showMenuContent ? 'animate-pop-in' : 'opacity-0 scale-0'}`}
              style={{ animationDelay: '800ms', animationFillMode: 'backwards' }}
            >
              <p>Touch to fly • Auto-fire</p>
              <p>Double-tap for bomb</p>
              <p className="text-[10px] text-gray-600 mt-2">v{__BUILD_TIME__}</p>
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
              0% { box-shadow: 0 0 20px rgba(255, 0, 255, 0.2); }
              100% { box-shadow: 0 0 40px rgba(255, 0, 255, 0.4), 0 0 60px rgba(0, 255, 255, 0.3); }
            }
            @keyframes pop-in {
              0% { 
                opacity: 0; 
                transform: scale(0.3);
                filter: drop-shadow(0 0 30px rgba(255, 0, 255, 0.8)) drop-shadow(0 0 60px rgba(0, 255, 255, 0.5));
              }
              50% { 
                transform: scale(1.1);
                filter: drop-shadow(0 0 20px rgba(255, 0, 255, 0.6)) drop-shadow(0 0 40px rgba(0, 255, 255, 0.3));
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
