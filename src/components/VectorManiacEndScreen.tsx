import React, { useState } from 'react';
import { useRewardedAds } from '@/hooks/useRewardedAds';
import { RewardedAdOverlay } from './RewardedAdOverlay';

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
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm scanlines" />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        {/* Victory/Game Over Title */}
        <h2
          className={`text-2xl font-pixel mb-2 ${isVictory ? 'text-accent neon-text-accent' : 'text-destructive neon-text-destructive'}`}
        >
          {isVictory ? '🏆 VICTORY!' : '💀 GAME OVER'}
        </h2>

        {isVictory && (
          <p className="font-pixel text-[10px] text-primary neon-text-primary mb-4 animate-pulse">
            ALL 9 WAVES COMPLETED!
          </p>
        )}

        {isNewHighScore && !isVictory && (
          <div className="text-accent font-pixel text-xs mb-4 neon-text-accent animate-pulse">
            ⭐ NEW HIGH SCORE! ⭐
          </div>
        )}

        {/* Stats */}
        <div className="font-pixel text-center space-y-3 mb-6 bg-background/30 rounded-lg p-4 border border-border/40 crt-glow">
          <div>
            <div className="text-muted-foreground text-[8px] tracking-wider">FINAL SCORE</div>
            <div className="text-primary text-xl neon-text-primary">
              {Math.floor(score).toString().padStart(8, '0')}
            </div>
          </div>

          <div className="flex gap-6 justify-center">
            <div>
              <div className="text-muted-foreground text-[8px] tracking-wider">SALVAGE</div>
              <div className="text-foreground text-base">💎 {salvageCount}</div>
            </div>

            <div>
              <div className="text-muted-foreground text-[8px] tracking-wider">WAVE</div>
              <div className="text-foreground text-base">{wave}/9</div>
            </div>
          </div>

          <div>
            <div className="text-muted-foreground text-[8px] tracking-wider">HI-SCORE</div>
            <div className="text-foreground text-xs">
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
                className="retro-button font-pixel text-xs w-full px-6 py-3 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed text-accent"
              >
                {isAdLoading ? '⏳ LOADING...' : '🎬 WATCH AD → REVIVE'}
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
            {isVictory ? '🔄 PLAY AGAIN' : '🔄 TRY AGAIN'}
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
