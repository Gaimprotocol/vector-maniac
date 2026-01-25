import React, { useState, useEffect, useRef } from 'react';
import { useRewardedAds } from '@/hooks/useRewardedAds';
import { RewardedAdOverlay } from './RewardedAdOverlay';
import { addStoredScraps, getStoredScraps } from '@/hooks/useScrapCurrency';
import { ShipIcon, TargetIcon, ScrapIcon } from './VectorIcons';

interface VectorManiacEndScreenProps {
  isVictory: boolean;
  score: number;
  salvageCount: number;
  wave: number;
  highScore: number;
  onRestart: () => void;
  onQuit: () => void;
  onContinue?: () => void;
  canContinueWithAd?: boolean;
}

export const VectorManiacEndScreen: React.FC<VectorManiacEndScreenProps> = ({
  isVictory,
  score,
  salvageCount,
  wave,
  highScore,
  onRestart,
  onQuit,
  onContinue,
  canContinueWithAd = false,
}) => {
  const hasSavedScraps = useRef(false);
  const [totalScraps, setTotalScraps] = useState(getStoredScraps());

  // Save collected scraps to permanent storage (only once)
  useEffect(() => {
    if (!hasSavedScraps.current && salvageCount > 0) {
      hasSavedScraps.current = true;
      addStoredScraps(salvageCount);
      setTotalScraps(getStoredScraps() + salvageCount);
    }
  }, [salvageCount]);

  const { 
    isShowingAd, 
    adProgress, 
    showRewardedAd,
    isAdReady,
    isAdLoading,
    adError,
    isAdButtonDisabled,
    prepareAd,
    isNative,
  } = useRewardedAds();
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isNewHighScore = score > highScore;

  const handleWatchAdToContinue = () => {
    setLocalError(null);
    
    if (!isAdReady && !isAdLoading) {
      setLocalError('No ad available. Try again in a moment.');
      prepareAd();
      return;
    }
    
    if (isAdLoading) {
      setLocalError('Loading ad, please wait...');
      return;
    }

    setIsWatchingAd(true);
    showRewardedAd(() => {
      setIsWatchingAd(false);
      onContinue?.();
    });
  };

  const continueButtonDisabled = isWatchingAd || isAdLoading || isAdButtonDisabled();
  const displayError = localError || adError;

  // Colors based on victory/defeat
  const primaryColor = isVictory ? '#facc15' : '#ff6666';
  const bgGradient = isVictory 
    ? 'radial-gradient(ellipse at center, #151005 0%, #0a0802 70%, #050401 100%)'
    : 'radial-gradient(ellipse at center, #100505 0%, #0a0202 70%, #050101 100%)';
  const particleColor = isVictory ? '#facc15' : '#ff4444';
  const gridColor = isVictory ? '#facc15' : '#ff4444';

  return (
    <div className="absolute inset-0 z-50">
      <div 
        className="absolute inset-0"
        style={{ background: bgGradient }}
      />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              background: particleColor,
              opacity: Math.random() * 0.3 + 0.1,
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: `-${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        {/* Victory/Game Over Title */}
        <h2
          className="text-2xl mb-2 tracking-widest"
          style={{ 
            fontFamily: 'Orbitron, monospace',
            color: primaryColor,
            textShadow: `0 0 20px ${primaryColor}, 0 0 40px ${primaryColor}50`,
          }}
        >
          {isVictory ? '🏆 VICTORY!' : '💀 GAME OVER'}
        </h2>

        {isVictory && (
          <p 
            className="text-[10px] mb-4 animate-pulse tracking-wider"
            style={{ 
              fontFamily: 'Orbitron, monospace',
              color: '#ff00ff',
              textShadow: '0 0 20px #ff00ff' 
            }}
          >
            ALL 9 WAVES COMPLETED!
          </p>
        )}

        {isNewHighScore && !isVictory && (
          <div 
            className="text-xs mb-4 animate-pulse tracking-wider"
            style={{ 
              fontFamily: 'Orbitron, monospace',
              color: '#facc15',
              textShadow: '0 0 20px #facc15' 
            }}
          >
            ⭐ NEW HIGH SCORE! ⭐
          </div>
        )}

        {/* Stats */}
        <div 
          className="text-center space-y-3 mb-6 rounded-lg p-5 border"
          style={{
            borderColor: 'rgba(0, 255, 136, 0.2)',
            background: 'rgba(0, 0, 0, 0.4)',
            boxShadow: '0 0 30px rgba(0, 255, 136, 0.1)',
          }}
        >
          <div>
            <div 
              className="text-[9px] tracking-widest uppercase mb-1"
              style={{ fontFamily: 'Orbitron, monospace', color: 'rgba(0, 255, 136, 0.5)' }}
            >
              Final Score
            </div>
            <div 
              className="text-xl font-bold"
              style={{ 
                fontFamily: 'Orbitron, monospace',
                color: '#00ff88',
                textShadow: '0 0 20px #00ff88' 
              }}
            >
              {Math.floor(score).toString().padStart(8, '0')}
            </div>
          </div>

          <div className="flex gap-6 justify-center">
            <div>
              <div 
                className="text-[9px] tracking-widest uppercase mb-1"
                style={{ fontFamily: 'Orbitron, monospace', color: 'rgba(0, 255, 136, 0.5)' }}
              >
                Collected
              </div>
              <div 
                className="text-sm flex items-center justify-center gap-1"
                style={{ fontFamily: 'Rajdhani, sans-serif', color: '#facc15', textShadow: '0 0 10px #facc15' }}
              >
                +{salvageCount} <ScrapIcon size={14} />
              </div>
            </div>

            <div>
              <div 
                className="text-[9px] tracking-widest uppercase mb-1"
                style={{ fontFamily: 'Orbitron, monospace', color: 'rgba(0, 255, 136, 0.5)' }}
              >
                Wave
              </div>
              <div 
                className="text-sm"
                style={{ fontFamily: 'Rajdhani, sans-serif', color: '#00ff88' }}
              >
                {wave}/9
              </div>
            </div>
          </div>

          <div>
            <div 
              className="text-[9px] tracking-widest uppercase mb-1"
              style={{ fontFamily: 'Orbitron, monospace', color: 'rgba(0, 255, 136, 0.5)' }}
            >
              Total Scraps
            </div>
            <div 
              className="text-base font-bold flex items-center justify-center gap-1"
              style={{ fontFamily: 'Orbitron, monospace', color: '#facc15', textShadow: '0 0 15px #facc15' }}
            >
              <ScrapIcon size={16} /> {totalScraps.toLocaleString()}
            </div>
          </div>

          <div>
            <div 
              className="text-[9px] tracking-widest uppercase mb-1"
              style={{ fontFamily: 'Orbitron, monospace', color: 'rgba(0, 255, 136, 0.5)' }}
            >
              Hi-Score
            </div>
            <div 
              className="text-sm"
              style={{ fontFamily: 'Orbitron, monospace', color: 'rgba(0, 255, 136, 0.7)' }}
            >
              {Math.floor(Math.max(highScore, score)).toString().padStart(8, '0')}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2 w-full max-w-xs relative z-10">
          {!isVictory && canContinueWithAd && onContinue && (
            <div className="flex flex-col items-center">
              <button
                onClick={handleWatchAdToContinue}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleWatchAdToContinue();
                }}
                disabled={continueButtonDisabled}
                className="text-sm border-2 rounded w-full px-6 py-3
                           transition-all duration-300 hover:bg-[#facc15]/10 active:scale-95 uppercase tracking-wider
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
                style={{ 
                  fontFamily: 'Orbitron, monospace',
                  color: '#facc15',
                  borderColor: 'rgba(250, 204, 21, 0.5)',
                  boxShadow: '0 0 20px rgba(250, 204, 21, 0.2)',
                }}
              >
                {isAdLoading ? '⏳ Loading...' : '🎬 Watch Ad → Revive'}
              </button>
              {displayError && (
                <p 
                  className="text-[9px] mt-1 text-center animate-pulse"
                  style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(0, 255, 136, 0.5)' }}
                >
                  {displayError}
                </p>
              )}
            </div>
          )}

          <button
            onClick={onRestart}
            onTouchEnd={(e) => {
              e.preventDefault();
              onRestart();
            }}
            className="text-sm border-2 rounded w-full px-6 py-3
                       transition-all duration-300 hover:bg-[#00ff88]/10 active:scale-95 uppercase tracking-wider
                       flex items-center justify-center gap-2"
            style={{ 
              fontFamily: 'Orbitron, monospace',
              color: '#00ff88',
              borderColor: 'rgba(0, 255, 136, 0.5)',
              boxShadow: '0 0 20px rgba(0, 255, 136, 0.2)',
            }}
          >
            <ShipIcon size={16} /> {isVictory ? 'Play Again' : 'Try Again'}
          </button>

          <button
            onClick={onQuit}
            onTouchEnd={(e) => {
              e.preventDefault();
              onQuit();
            }}
            className="text-[11px] border rounded w-full px-6 py-3
                       transition-all duration-300 hover:bg-[#ff4444]/10 active:scale-95 uppercase tracking-wider
                       flex items-center justify-center gap-2"
            style={{ 
              fontFamily: 'Orbitron, monospace',
              color: '#ff6666',
              borderColor: 'rgba(255, 68, 68, 0.4)',
              boxShadow: '0 0 15px rgba(255, 68, 68, 0.15)',
            }}
          >
            <TargetIcon size={14} /> Main Menu
          </button>
        </div>

        {/* Ad overlay */}
        {isShowingAd && !isNative && <RewardedAdOverlay progress={adProgress} />}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
      `}</style>
    </div>
  );
};
