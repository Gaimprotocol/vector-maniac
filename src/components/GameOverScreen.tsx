import React, { useState } from 'react';
import { useRewardedAds } from '@/hooks/useRewardedAds';
import { RewardedAdOverlay } from './RewardedAdOverlay';
import { ShipIcon, TargetIcon } from './VectorIcons';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  rescuedCount: number;
  isNewHighScore: boolean;
  onRestart: () => void;
  onQuit: () => void;
  onContinue?: () => void;
  canContinueWithAd?: boolean;
  isSurvivalMode?: boolean;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  highScore,
  rescuedCount,
  isNewHighScore,
  onRestart,
  onQuit,
  onContinue,
  canContinueWithAd = false,
  isSurvivalMode = false,
}) => {
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

  return (
    <div className="absolute inset-0 z-50">
      <div 
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, #100505 0%, #0a0202 70%, #050101 100%)' }}
      />
      
      {/* Floating particles - red tinted */}
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
              background: '#ff4444',
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
          backgroundImage: 'linear-gradient(#ff4444 1px, transparent 1px), linear-gradient(90deg, #ff4444 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        {/* Game Over Title */}
        <h2 
          className="text-2xl mb-2 tracking-widest"
          style={{ 
            fontFamily: 'Orbitron, monospace',
            color: '#ff6666',
            textShadow: '0 0 20px #ff4444, 0 0 40px #ff444450',
          }}
        >
          MISSION FAILED
        </h2>

        {isNewHighScore && (
          <div 
            className="text-xs mb-4 animate-pulse tracking-wider"
            style={{ 
              fontFamily: 'Orbitron, monospace',
              color: '#facc15',
              textShadow: '0 0 20px #facc15, 0 0 40px #facc1550' 
            }}
          >
            ◆ NEW HIGH SCORE ◆
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
              {score.toString().padStart(8, '0')}
            </div>
          </div>

          {!isSurvivalMode && (
            <div>
              <div 
                className="text-[9px] tracking-widest uppercase mb-1"
                style={{ fontFamily: 'Orbitron, monospace', color: 'rgba(0, 255, 136, 0.5)' }}
              >
                Rescued
              </div>
              <div 
                className="text-sm"
                style={{ fontFamily: 'Rajdhani, sans-serif', color: '#00ff88' }}
              >
                🚁 {rescuedCount} Civilians
              </div>
            </div>
          )}

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
              {highScore.toString().padStart(8, '0')}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2 w-full max-w-xs relative z-10">
          {canContinueWithAd && onContinue && (
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
                {isAdLoading ? '⏳ Loading...' : '🎬 Watch Ad → Continue'}
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
            <ShipIcon size={16} /> Try Again
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
