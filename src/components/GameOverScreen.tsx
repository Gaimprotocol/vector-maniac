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
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm p-4">
      <h2 className="text-xl font-pixel text-destructive neon-text-secondary mb-2" style={{ textShadow: '0 0 20px hsl(0 100% 50%)' }}>
        MISSION FAILED
      </h2>
      
      {isNewHighScore && (
        <div className="text-accent neon-text-accent font-pixel text-xs mb-4 animate-pulse">
          NEW HIGH SCORE!
        </div>
      )}

      <div className="font-pixel text-center space-y-2 mb-6">
        <div>
          <div className="text-muted-foreground text-[8px]">FINAL SCORE</div>
          <div className="text-primary neon-text-primary text-lg">
            {score.toString().padStart(8, '0')}
          </div>
        </div>

        {!isSurvivalMode && (
          <div>
            <div className="text-muted-foreground text-[8px]">RESCUED</div>
            <div className="text-accent neon-text-accent text-base">
              {rescuedCount} CIVILIANS
            </div>
          </div>
        )}

        <div>
          <div className="text-muted-foreground text-[8px]">HI-SCORE</div>
          <div className="text-secondary text-xs">
            {highScore.toString().padStart(8, '0')}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {/* Continue with Ad button - only show if available */}
        {canContinueWithAd && onContinue && (
          <div className="flex flex-col items-center">
            <button
              onClick={handleWatchAdToContinue}
              onTouchEnd={(e) => { e.preventDefault(); handleWatchAdToContinue(); }}
              disabled={continueButtonDisabled}
              className={`retro-button font-pixel text-xs block w-full px-8 py-3 active:scale-95 transition-transform
                         border-green-400 disabled:opacity-50 disabled:cursor-not-allowed
                         ${isAdLoading ? 'text-yellow-400' : 'text-green-400'} hover:bg-green-400/10`}
              style={{ 
                boxShadow: '0 0 15px rgba(0, 255, 100, 0.3)',
              }}
            >
              {isAdLoading ? '⏳ LOADING AD...' : '🎬 WATCH AD → CONTINUE'}
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
          className="retro-button font-pixel text-xs block w-full text-primary px-8 py-3 active:scale-95 transition-transform"
        >
          TRY AGAIN
        </button>
        <button
          onClick={onQuit}
          onTouchEnd={(e) => { e.preventDefault(); onQuit(); }}
          className="retro-button font-pixel text-[10px] block w-full text-muted-foreground border-muted-foreground hover:bg-muted px-8 py-3 active:scale-95 transition-transform"
        >
          MAIN MENU
        </button>
      </div>

      {/* Ad overlay when watching - only show on web, native SDK handles its own UI */}
      {isShowingAd && !isNative && <RewardedAdOverlay progress={adProgress} />}
    </div>
  );
};
