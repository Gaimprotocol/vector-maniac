import React, { useState, useEffect, useRef } from 'react';
import { useRewardedAds } from '@/hooks/useRewardedAds';
import { RewardedAdOverlay } from './RewardedAdOverlay';
import { addStoredScraps, getStoredScraps } from '@/hooks/useScrapCurrency';

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

  return (
    <div className="absolute inset-0">
      <div 
        className="absolute inset-0 backdrop-blur-sm"
        style={{
          background: 'linear-gradient(180deg, rgba(0, 5, 16, 0.95) 0%, rgba(5, 0, 21, 0.95) 50%, rgba(16, 5, 32, 0.95) 100%)',
        }}
      />
      
      {/* Glowing orbs background */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full opacity-10 blur-3xl pointer-events-none"
           style={{ background: 'radial-gradient(circle, #ff00ff 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full opacity-10 blur-3xl pointer-events-none"
           style={{ background: 'radial-gradient(circle, #00ffff 0%, transparent 70%)' }} />

      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        {/* Victory/Game Over Title */}
        <h2
          className={`font-vector font-bold text-3xl mb-2 ${isVictory ? 'text-yellow-400' : 'text-red-400'}`}
          style={{ 
            textShadow: isVictory ? '0 0 40px #facc15, 0 0 80px #facc1560' : '0 0 40px #f87171, 0 0 80px #f8717160',
            letterSpacing: '0.1em',
          }}
        >
          {isVictory ? '🏆 VICTORY!' : '💀 GAME OVER'}
        </h2>

        {isVictory && (
          <p 
            className="font-vector text-sm text-magenta mb-4 animate-pulse"
            style={{ textShadow: '0 0 20px #ff00ff' }}
          >
            ALL 9 WAVES COMPLETED!
          </p>
        )}

        {isNewHighScore && !isVictory && (
          <div 
            className="font-vector text-sm text-yellow-400 mb-4 animate-pulse"
            style={{ textShadow: '0 0 20px #facc15' }}
          >
            ⭐ NEW HIGH SCORE! ⭐
          </div>
        )}

        {/* Stats */}
        <div 
          className="text-center space-y-3 mb-6 rounded-lg p-4 border border-white/10"
          style={{
            background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.5) 100%)',
            boxShadow: '0 0 30px rgba(0, 255, 255, 0.1)',
          }}
        >
          <div>
            <div className="font-tech text-gray-400 text-[10px] tracking-widest uppercase">Final Score</div>
            <div 
              className="font-vector font-bold text-cyan-400 text-2xl"
              style={{ textShadow: '0 0 20px #00ffff' }}
            >
              {Math.floor(score).toString().padStart(8, '0')}
            </div>
          </div>

          <div className="flex gap-6 justify-center">
            <div>
              <div className="font-tech text-gray-400 text-[10px] tracking-widest uppercase">Collected</div>
              <div className="font-tech text-yellow-400 text-base" style={{ textShadow: '0 0 10px #facc15' }}>
                +{salvageCount} ⚙️
              </div>
            </div>

            <div>
              <div className="font-tech text-gray-400 text-[10px] tracking-widest uppercase">Wave</div>
              <div className="font-tech text-white text-base">{wave}/9</div>
            </div>
          </div>

          <div>
            <div className="font-tech text-gray-400 text-[10px] tracking-widest uppercase">Total Scraps</div>
            <div className="font-tech text-yellow-400 text-lg font-bold" style={{ textShadow: '0 0 15px #facc15' }}>
              ⚙️ {totalScraps.toLocaleString()}
            </div>
          </div>

          <div>
            <div className="font-tech text-gray-400 text-[10px] tracking-widest uppercase">Hi-Score</div>
            <div className="font-tech text-white/80 text-sm">
              {Math.floor(Math.max(highScore, score)).toString().padStart(8, '0')}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2 w-full max-w-xs">
          {!isVictory && canContinueWithAd && onContinue && (
            <div className="flex flex-col items-center">
              <button
                onClick={handleWatchAdToContinue}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleWatchAdToContinue();
                }}
                disabled={continueButtonDisabled}
                className="font-vector font-semibold text-sm text-yellow-400 border-2 border-yellow-400/60 w-full px-6 py-3
                           transition-all duration-300 hover:border-yellow-400 hover:bg-yellow-400/10 active:scale-95 uppercase tracking-wider
                           disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  boxShadow: '0 0 25px rgba(250, 204, 21, 0.25)',
                  clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
                }}
              >
                {isAdLoading ? '⏳ Loading...' : '🎬 Watch Ad → Revive'}
              </button>
              {displayError && (
                <p className="font-tech text-xs text-gray-400 mt-1 text-center animate-pulse">
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
            className="font-vector font-semibold text-sm text-cyan-400 border-2 border-cyan-400/60 w-full px-6 py-3
                       transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-400/10 active:scale-95 uppercase tracking-wider"
            style={{ 
              boxShadow: '0 0 25px rgba(0, 255, 255, 0.25)',
              clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
            }}
          >
            {isVictory ? '🔄 Play Again' : '🔄 Try Again'}
          </button>

          <button
            onClick={onQuit}
            onTouchEnd={(e) => {
              e.preventDefault();
              onQuit();
            }}
            className="font-vector font-semibold text-sm text-red-400 border-2 border-red-400/60 w-full px-6 py-3
                       transition-all duration-300 hover:border-red-400 hover:bg-red-400/10 active:scale-95 uppercase tracking-wider"
            style={{ 
              boxShadow: '0 0 25px rgba(248, 113, 113, 0.25)',
              clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
            }}
          >
            🚪 Main Menu
          </button>
        </div>

        {/* Ad overlay */}
        {isShowingAd && !isNative && <RewardedAdOverlay progress={adProgress} />}
      </div>
    </div>
  );
};
