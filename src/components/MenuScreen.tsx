import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePurchases } from '@/hooks/usePurchases';
import { StoreIcon, SettingsIcon, InfoIcon, ShipIcon, CheckIcon, BestiaryIcon } from './VectorIcons';

interface MenuScreenProps {
  highScore: number;
  onStart: () => void;
  onStartVectorManiac?: () => void;
  startMusicRef?: React.MutableRefObject<HTMLAudioElement | null>;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({ highScore, onStart, onStartVectorManiac, startMusicRef }) => {
  const navigate = useNavigate();
  const { hasGoldenSkin } = usePurchases();
  
  // Persist "entered" state in sessionStorage so it survives navigation to shop/gear/info
  const [entered, setEntered] = useState(() => {
    return sessionStorage.getItem('menuEntered') === 'true';
  });
  const [showContent, setShowContent] = useState(() => {
    return sessionStorage.getItem('menuEntered') === 'true';
  });
  const [bonusMapsEnabled, setBonusMapsEnabled] = useState(() => {
    return localStorage.getItem('bonusMapsEnabled') !== 'false';
  });
  const fadeIntervalRef = useRef<number | null>(null);
  
  // Sync entered state to sessionStorage
  useEffect(() => {
    if (entered) {
      sessionStorage.setItem('menuEntered', 'true');
    }
  }, [entered]);

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
    setTimeout(() => setShowContent(true), 300);
  };

  const handleStart = () => {
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
      style={{ background: 'radial-gradient(ellipse at center, #051510 0%, #020a08 70%, #010504 100%)' }}
    >
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              background: '#00ff88',
              opacity: Math.random() * 0.4 + 0.1,
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: `-${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* GAIM STUDIOS with diamonds */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[#00ff88] text-xs">◆</span>
        <p 
          className="text-[10px] tracking-[0.3em] text-[#00ff88]/50"
          style={{ fontFamily: 'Orbitron, monospace' }}
        >
          GAIM STUDIOS
        </p>
        <span className="text-[#00ff88] text-xs">◆</span>
      </div>

      {/* Main title */}
      <h1 
        className="text-3xl md:text-4xl mb-2 flex items-center gap-2"
        style={{ fontFamily: 'Orbitron, monospace' }}
      >
        <span className="text-[#00ff88]" style={{ textShadow: '0 0 22px #00ff88, 0 0 44px #00ff8850' }}>
          VECTOR
        </span>
        <span className="text-[#88ffaa]" style={{ textShadow: '0 0 22px #88ffaa, 0 0 44px #88ffaa50' }}>
          MANIAC
        </span>
      </h1>

      {/* Tagline */}
      <p 
        className="text-[9px] tracking-[0.2em] text-[#00ff88]/40 mb-6"
        style={{ fontFamily: 'Orbitron, monospace' }}
      >
        NAVIGATE THE INFINITE GRID
      </p>

      {/* Enter button */}
      {!entered && (
        <button
          className="text-xs text-[#00ff88]/80 border border-[#00ff88]/30 rounded px-8 py-3 
                     transition-all duration-500 hover:border-[#00ff88] hover:text-[#00ff88] hover:bg-[#00ff88]/10"
          style={{ 
            fontFamily: 'Orbitron, monospace',
            boxShadow: '0 0 30px rgba(0, 255, 136, 0.15)',
            animation: 'glow 3s ease-in-out infinite alternate',
          }}
          onClick={handleEnter}
          onTouchEnd={(e) => { e.preventDefault(); handleEnter(); }}
        >
          ▶ ENTER THE GRID
        </button>
      )}

      {/* Main menu content */}
      <div 
        className={`flex flex-col items-center transition-all duration-700 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Start button */}
        <button
          className="text-sm text-[#00ff88] border-2 border-[#00ff88]/50 rounded px-12 py-3 mb-4 
                     transition-all duration-300 hover:border-[#00ff88] hover:bg-[#00ff88]/10 active:bg-[#00ff88]/20
                     flex items-center gap-2"
          style={{ 
            fontFamily: 'Orbitron, monospace',
            boxShadow: '0 0 20px rgba(0, 255, 136, 0.2), inset 0 0 20px rgba(0, 255, 136, 0.05)',
          }}
          onTouchEnd={(e) => { e.preventDefault(); handleStart(); }}
          onClick={handleStart}
        >
          <ShipIcon size={16} /> START MISSION
        </button>

        {/* Secondary buttons row */}
        <div className="flex gap-3 mb-4">
          <button
            className="text-[10px] text-[#00ff88] border border-[#00ff88]/40 rounded px-5 py-2 
                       transition-all duration-300 hover:border-[#00ff88] hover:bg-[#00ff88]/10
                       flex items-center gap-2"
            style={{ 
              fontFamily: 'Orbitron, monospace',
              boxShadow: '0 0 15px rgba(0, 255, 136, 0.15)',
            }}
            onClick={() => navigate('/shop')}
          >
            <StoreIcon size={14} /> SHOP
          </button>
          <button
            className="text-[10px] text-[#00ff88] border border-[#00ff88]/40 rounded px-5 py-2 
                       transition-all duration-300 hover:border-[#00ff88] hover:bg-[#00ff88]/10
                       flex items-center gap-2"
            style={{ 
              fontFamily: 'Orbitron, monospace',
              boxShadow: '0 0 15px rgba(0, 255, 136, 0.15)',
            }}
            onClick={() => navigate('/equipment')}
          >
            <SettingsIcon size={14} /> GEAR
          </button>
          <button
            className="text-[10px] text-[#00ff88] border border-[#00ff88]/40 rounded px-5 py-2 
                       transition-all duration-300 hover:border-[#00ff88] hover:bg-[#00ff88]/10
                       flex items-center gap-2"
            style={{ 
              fontFamily: 'Orbitron, monospace',
              boxShadow: '0 0 15px rgba(0, 255, 136, 0.15)',
            }}
            onClick={() => navigate('/info')}
          >
            <InfoIcon size={14} /> INFO
          </button>
        </div>

        {/* Bestiary button */}
        <button
          className="text-[9px] border rounded px-5 py-2 mb-4
                     transition-all duration-300 flex items-center gap-2
                     text-[#aa88ff]/70 border-[#aa88ff]/30 hover:border-[#aa88ff]/60 hover:text-[#aa88ff] hover:bg-[#aa88ff]/10"
          style={{ 
            fontFamily: 'Orbitron, monospace',
            boxShadow: '0 0 10px rgba(170, 136, 255, 0.1)',
          }}
          onClick={() => navigate('/bestiary')}
        >
          <BestiaryIcon size={12} /> BESTIARY
        </button>

        {/* Bonus Maps Toggle */}
        <button
          className={`text-[9px] border rounded px-5 py-2 mb-4
                      transition-all duration-300 flex items-center gap-2 ${
                        !hasGoldenSkin()
                          ? 'text-[#00ff88]/30 border-[#00ff88]/15 cursor-not-allowed opacity-50'
                          : bonusMapsEnabled 
                            ? 'text-[#00ff88] border-[#00ff88]/50 hover:border-[#00ff88] hover:bg-[#00ff88]/10' 
                            : 'text-[#00ff88]/50 border-[#00ff88]/30 hover:border-[#00ff88]/60'
                      }`}
          style={{ 
            fontFamily: 'Orbitron, monospace',
            boxShadow: hasGoldenSkin() && bonusMapsEnabled ? '0 0 15px rgba(0, 255, 136, 0.15)' : 'none',
          }}
          onClick={toggleBonusMaps}
          disabled={!hasGoldenSkin()}
          title={!hasGoldenSkin() ? 'Requires Ultimate Edition' : undefined}
        >
          {!hasGoldenSkin() ? (
            <>BONUS MAPS</>
          ) : bonusMapsEnabled ? (
            <><CheckIcon size={10} /> BONUS MAPS ON</>
          ) : (
            <>BONUS MAPS OFF</>
          )}
        </button>

        {highScore > 0 && (
          <p 
            className="text-[8px] text-[#00ff88]/50 mb-4"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            HIGH SCORE: {highScore}
          </p>
        )}

        <div 
          className="text-[7px] text-[#00ff88]/30 text-center space-y-1"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
        >
          <p>TOUCH TO FLY • AUTO-FIRE</p>
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
          0% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.15); }
          100% { box-shadow: 0 0 40px rgba(0, 255, 136, 0.35), 0 0 60px rgba(0, 255, 136, 0.2); }
        }
      `}</style>
    </div>
  );
};
