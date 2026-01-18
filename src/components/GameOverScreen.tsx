import React, { useState } from 'react';
import { useRewardedAds } from '@/hooks/useRewardedAds';
import { RewardedAdOverlay } from './RewardedAdOverlay';

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
    // Clear previous error
    setLocalError(null);
    
    // Check if ad is ready (for native) or always proceed (for web)
    if (!isAdReady && !isAdLoading) {
      console.log('[GameOverScreen] Ad not ready, preparing...');
      setLocalError('No ad available. Try again in a moment.');
      prepareAd();
      return;
    }
    
    if (isAdLoading) {
      console.log('[GameOverScreen] Ad is loading, please wait...');
      setLocalError('Loading ad, please wait...');
      return;
    }

    setIsWatchingAd(true);
    showRewardedAd(() => {
      setIsWatchingAd(false);
      onContinue?.();
    });
  };

  // Button should be disabled during loading or cooldown
  const continueButtonDisabled = isWatchingAd || isAdLoading || isAdButtonDisabled();
  
  // Show combined error
  const displayError = localError || adError;

  return (
    <div 
      className="absolute inset-0 flex flex-col items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(50, 0, 0, 0.95) 0%, rgba(20, 0, 0, 0.98) 100%)',
      }}
    >
      {/* Game Over Title */}
      <h2 
        className="text-2xl font-pixel text-red-400 mb-2"
        style={{ 
          textShadow: '0 0 20px #ff0000, 0 0 40px #ff000050',
        }}
      >
        💀 MISSION FAILED
      </h2>
      
      {isNewHighScore && (
        <div className="text-yellow-400 font-pixel text-xs mb-4 animate-pulse">
          ⭐ NEW HIGH SCORE! ⭐
        </div>
      )}

      {/* Stats */}
      <div className="font-pixel text-center space-y-3 mb-6 bg-black/30 rounded-lg p-4 border border-white/10">
        <div>
          <div className="text-gray-400 text-[8px] tracking-wider">FINAL SCORE</div>
          <div 
            className="text-cyan-400 text-xl"
            style={{ textShadow: '0 0 10px #00ffff' }}
          >
            {score.toString().padStart(8, '0')}
          </div>
        </div>

        {!isSurvivalMode && (
          <div>
            <div className="text-gray-400 text-[8px] tracking-wider">RESCUED</div>
            <div className="text-green-400 text-base">
              🚁 {rescuedCount} CIVILIANS
            </div>
          </div>
        )}

        <div>
          <div className="text-gray-400 text-[8px] tracking-wider">HI-SCORE</div>
          <div className="text-gray-300 text-xs">
            {highScore.toString().padStart(8, '0')}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-2 w-full max-w-xs">
        {/* Continue with Ad button */}
        {canContinueWithAd && onContinue && (
          <div className="flex flex-col items-center">
            <button
              onClick={handleWatchAdToContinue}
              onTouchEnd={(e) => { e.preventDefault(); handleWatchAdToContinue(); }}
              disabled={continueButtonDisabled}
              className={`font-pixel text-xs w-full px-6 py-3 rounded-full border-2
                         transition-all duration-300 active:scale-95
                         border-green-400/50 disabled:opacity-50 disabled:cursor-not-allowed
                         ${isAdLoading ? 'text-yellow-400' : 'text-green-400'} 
                         hover:bg-green-400/10 hover:border-green-400`}
              style={{ 
                boxShadow: '0 0 15px rgba(0, 255, 100, 0.2)',
              }}
            >
              {isAdLoading ? '⏳ LOADING...' : '🎬 WATCH AD → CONTINUE'}
            </button>
            {displayError && (
              <p className="font-pixel text-[8px] text-yellow-400/80 mt-1 text-center animate-pulse">
                {displayError}
              </p>
            )}
          </div>
        )}
        
        <button
          onClick={onRestart}
          onTouchEnd={(e) => { e.preventDefault(); onRestart(); }}
          className="font-pixel text-xs w-full px-6 py-3 rounded-full border-2
                     transition-all duration-300 active:scale-95
                     text-magenta border-magenta/50 hover:bg-magenta/10 hover:border-magenta"
          style={{ 
            boxShadow: '0 0 15px rgba(255, 0, 255, 0.2)',
          }}
        >
          🔄 TRY AGAIN
        </button>
        
        <button
          onClick={onQuit}
          onTouchEnd={(e) => { e.preventDefault(); onQuit(); }}
          className="font-pixel text-[10px] w-full px-6 py-2 rounded-full border
                     transition-all duration-300 active:scale-95
                     text-gray-400 border-gray-600 hover:bg-gray-800/50"
        >
          🚪 MAIN MENU
        </button>
      </div>

      {/* Ad overlay */}
      {isShowingAd && !isNative && <RewardedAdOverlay progress={adProgress} />}
    </div>
  );
};
