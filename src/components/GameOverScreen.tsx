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
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm scanlines" />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        {/* Game Over Title */}
        <h2 className="text-2xl font-pixel text-destructive neon-text-destructive mb-2">
          💀 MISSION FAILED
        </h2>

        {isNewHighScore && (
          <div className="font-pixel text-xs mb-4 text-accent neon-text-accent animate-pulse">
            ⭐ NEW HIGH SCORE! ⭐
          </div>
        )}

        {/* Stats */}
        <div className="font-pixel text-center space-y-3 mb-6 bg-background/30 rounded-lg p-4 border border-border/40 crt-glow">
          <div>
            <div className="text-muted-foreground text-[8px] tracking-wider">FINAL SCORE</div>
            <div className="text-primary text-xl neon-text-primary">
              {score.toString().padStart(8, '0')}
            </div>
          </div>

          {!isSurvivalMode && (
            <div>
              <div className="text-muted-foreground text-[8px] tracking-wider">RESCUED</div>
              <div className="text-foreground text-base">
                🚁 {rescuedCount} CIVILIANS
              </div>
            </div>
          )}

          <div>
            <div className="text-muted-foreground text-[8px] tracking-wider">HI-SCORE</div>
            <div className="text-foreground text-xs">
              {highScore.toString().padStart(8, '0')}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2 w-full max-w-xs">
          {canContinueWithAd && onContinue && (
            <div className="flex flex-col items-center">
              <button
                onClick={handleWatchAdToContinue}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleWatchAdToContinue();
                }}
                disabled={continueButtonDisabled}
                className="retro-button font-pixel text-xs w-full px-6 py-3 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed text-accent"
              >
                {isAdLoading ? '⏳ LOADING...' : '🎬 WATCH AD → CONTINUE'}
              </button>
              {displayError && (
                <p className="font-pixel text-[8px] text-muted-foreground mt-1 text-center animate-pulse">
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
            className="retro-button font-pixel text-xs w-full text-primary px-6 py-3 active:scale-95 transition-transform"
          >
            🔄 TRY AGAIN
          </button>

          <button
            onClick={onQuit}
            onTouchEnd={(e) => {
              e.preventDefault();
              onQuit();
            }}
            className="retro-button font-pixel text-[10px] w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground px-6 py-2 active:scale-95 transition-transform"
          >
            🚪 MAIN MENU
          </button>
        </div>

        {/* Ad overlay */}
        {isShowingAd && !isNative && <RewardedAdOverlay progress={adProgress} />}
      </div>
    </div>
  );
};
