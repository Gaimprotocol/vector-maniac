import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePurchases } from '@/hooks/usePurchases';

interface MenuScreenProps {
  highScore: number;
  onStart: () => void;
  onStartVectorManiac?: () => void;
  startMusicRef?: React.MutableRefObject<HTMLAudioElement | null>;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({ highScore, onStart, onStartVectorManiac, startMusicRef }) => {
  const navigate = useNavigate();
  const { hasGoldenSkin } = usePurchases();
  const [entered, setEntered] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [bonusMapsEnabled, setBonusMapsEnabled] = useState(() => {
    return localStorage.getItem('bonusMapsEnabled') !== 'false';
  });
  const fadeIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current) {
        window.clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }
    };
  }, []);

  const handleEnter = () => {
    const audio = startMusicRef?.current;

    if (audio) {
      if (fadeIntervalRef.current) {
        window.clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }

      audio.play().then(() => {
        // Fade in music
        let vol = audio.volume ?? 0;
        fadeIntervalRef.current = window.setInterval(() => {
          vol += 0.0128;
          if (!startMusicRef?.current) {
            if (fadeIntervalRef.current) window.clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
            return;
          }

          if (vol <= 0.128) {
            startMusicRef.current.volume = vol;
          } else {
            if (fadeIntervalRef.current) window.clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
            startMusicRef.current.volume = 0.128;
          }
        }, 50);
      }).catch(console.error);
    }

    setEntered(true);
    // Delay showing content for smooth transition
    setTimeout(() => setShowContent(true), 300);
  };

  const handleStart = () => {
    // Start Vector Maniac directly
    if (onStartVectorManiac) {
      onStartVectorManiac();
    } else {
      onStart();
    }
  };

  const toggleBonusMaps = () => {
    if (!hasGoldenSkin()) return;
    const newValue = !bonusMapsEnabled;
    setBonusMapsEnabled(newValue);
    localStorage.setItem('bonusMapsEnabled', String(newValue));
  };

  return (
    <div 
      className="absolute inset-0 flex flex-col items-center justify-center z-30"
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
      <h1 className="font-pixel text-3xl md:text-4xl mb-2 flex items-center gap-2">
        <span className="text-magenta" style={{ textShadow: '0 0 22px #ff00ff, 0 0 44px #ff00ff50' }}>
          VECTOR
        </span>
        <span className="text-cyan-400" style={{ textShadow: '0 0 22px #00e5ff, 0 0 44px #00e5ff50' }}>
          MANIAC
        </span>
      </h1>

      {/* Tagline */}
      <p className="font-pixel text-[9px] tracking-[0.2em] text-gray-500 mb-6">
        NAVIGATE THE INFINITE VOID
      </p>

      {/* Enter button - shown first */}
      {!entered && (
        <button
          className="font-pixel text-xs text-white/80 border border-white/30 rounded-full px-8 py-3 
                     transition-all duration-500 hover:border-cyan-400 hover:text-cyan-400 hover:bg-cyan-400/10
                     animate-pulse"
          style={{ 
            boxShadow: '0 0 30px rgba(0, 229, 255, 0.15)',
            animation: 'pulse 2s ease-in-out infinite, glow 3s ease-in-out infinite alternate',
          }}
          onClick={handleEnter}
          onTouchEnd={(e) => { e.preventDefault(); handleEnter(); }}
        >
          ▶ ENTER THE GALAXY
        </button>
      )}

      {/* Main menu content - fades in after enter */}
      <div 
        className={`flex flex-col items-center transition-all duration-700 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Start button */}
        <button
          className="font-pixel text-sm text-cyan-400 border-2 border-cyan-400/50 rounded-full px-12 py-3 mb-4 
                     transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-400/10 active:bg-cyan-400/20"
          style={{ 
            boxShadow: '0 0 20px rgba(0, 229, 255, 0.2), inset 0 0 20px rgba(0, 229, 255, 0.05)',
          }}
          onTouchEnd={(e) => { e.preventDefault(); handleStart(); }}
          onClick={handleStart}
        >
          START MISSION
        </button>


        {/* Secondary buttons row */}
        <div className="flex gap-3 mb-4">
          <button
            className="font-pixel text-[10px] text-yellow-400 border border-yellow-400/50 rounded-full px-5 py-2 
                       transition-all duration-300 hover:border-yellow-400 hover:bg-yellow-400/10"
            style={{ 
              boxShadow: '0 0 15px rgba(255, 255, 0, 0.15)',
            }}
            onClick={() => navigate('/shop')}
          >
            🛒 SHOP
          </button>
          <button
            className="font-pixel text-[10px] text-magenta border border-magenta/50 rounded-full px-5 py-2 
                       transition-all duration-300 hover:border-magenta hover:bg-magenta/10"
            style={{ 
              boxShadow: '0 0 15px rgba(255, 0, 255, 0.15)',
            }}
            onClick={() => navigate('/info')}
          >
            ℹ️ INFO
          </button>
        </div>

        {/* Bonus Maps Toggle */}
        <button
          className={`font-pixel text-[9px] border rounded-full px-5 py-2 mb-4
                      transition-all duration-300 ${
                        !hasGoldenSkin()
                          ? 'text-gray-600 border-gray-600/30 cursor-not-allowed opacity-50'
                          : bonusMapsEnabled 
                            ? 'text-green-400 border-green-400/50 hover:border-green-400 hover:bg-green-400/10' 
                            : 'text-gray-500 border-gray-500/50 hover:border-gray-500 hover:bg-gray-500/10'
                      }`}
          style={{ 
            boxShadow: hasGoldenSkin() && bonusMapsEnabled ? '0 0 15px rgba(74, 222, 128, 0.15)' : 'none',
          }}
          onClick={toggleBonusMaps}
          disabled={!hasGoldenSkin()}
          title={!hasGoldenSkin() ? 'Requires Ultimate Edition' : undefined}
        >
          {!hasGoldenSkin() ? '🔒 BONUS MAPS' : bonusMapsEnabled ? '✓ BONUS MAPS ON' : '✗ BONUS MAPS OFF'}
        </button>

        {highScore > 0 && (
          <p className="font-pixel text-[8px] text-cyan-400/60 mb-4">
            HIGH SCORE: {highScore}
          </p>
        )}

        <div className="font-pixel text-[7px] text-gray-600 text-center space-y-1">
          <p>TOUCH TO FLY • AUTO-FIRE</p>
          <p>DOUBLE-TAP FOR BOMB</p>
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
      `}</style>
    </div>
  );
};
