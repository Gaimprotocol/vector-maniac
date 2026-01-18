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

const angularClipPath = 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))';
const angularClipPathSmall = 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))';

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
    <div 
      className="absolute inset-0 flex flex-col items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(10, 0, 20, 0.97) 0%, rgba(0, 0, 0, 0.99) 100%)',
      }}
    >
      {/* Decorative lines */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <div className="w-16 h-px bg-gradient-to-l from-magenta to-transparent" />
        <div 
          className="w-2 h-2 rotate-45 border border-magenta" 
          style={{ boxShadow: '0 0 8px #ff00ff' }} 
        />
        <div className="w-16 h-px bg-gradient-to-r from-cyan-400 to-transparent" />
      </div>

      {/* Victory/Game Over Title */}
      <h2 
        className={`font-vector font-black text-3xl tracking-wider mb-1 ${isVictory ? 'text-cyan-400' : 'text-magenta'}`}
        style={{ 
          textShadow: isVictory 
            ? '0 0 30px #00ffff, 0 0 60px #00ffff50' 
            : '0 0 30px #ff00ff, 0 0 60px #ff00ff50',
        }}
      >
        {isVictory ? 'VICTORY' : 'GAME OVER'}
      </h2>
      
      {isVictory && (
        <p className="font-tech text-xs tracking-[0.3em] text-cyan-400/70 mb-4 uppercase">
          // ALL 9 WAVES CLEARED //
        </p>
      )}
      
      {isNewHighScore && !isVictory && (
        <div 
          className="font-tech text-sm tracking-wider text-yellow-400 mb-4 animate-pulse"
          style={{ textShadow: '0 0 15px #ffff00' }}
        >
          ★ NEW HIGH SCORE ★
        </div>
      )}

      {/* Stats Panel */}
      <div 
        className="font-tech text-center space-y-3 mb-6 p-5 border border-white/20 relative"
        style={{
          background: 'linear-gradient(180deg, rgba(255,0,255,0.05) 0%, rgba(0,255,255,0.03) 100%)',
          clipPath: angularClipPath,
          boxShadow: '0 0 20px rgba(255, 0, 255, 0.1), inset 0 0 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-magenta/50" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyan-400/50" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyan-400/50" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-magenta/50" />

        <div>
          <div className="text-gray-500 text-[10px] tracking-[0.4em] uppercase">Final Score</div>
          <div 
            className="text-cyan-400 text-2xl font-vector font-bold tracking-wide"
            style={{ textShadow: '0 0 15px #00ffff' }}
          >
            {Math.floor(score).toString().padStart(8, '0')}
          </div>
        </div>

        <div className="flex gap-8 justify-center pt-2">
          <div>
            <div className="text-gray-500 text-[10px] tracking-[0.3em] uppercase">Salvage</div>
            <div 
              className="text-green-400 text-lg font-vector"
              style={{ textShadow: '0 0 10px #00ff00' }}
            >
              {salvageCount}
            </div>
          </div>
          
          <div>
            <div className="text-gray-500 text-[10px] tracking-[0.3em] uppercase">Wave</div>
            <div 
              className="text-magenta text-lg font-vector"
              style={{ textShadow: '0 0 10px #ff00ff' }}
            >
              {wave}/9
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-white/10">
          <div className="text-gray-500 text-[10px] tracking-[0.3em] uppercase">Hi-Score</div>
          <div className="text-gray-400 text-sm font-tech tracking-wider">
            {Math.floor(Math.max(highScore, score)).toString().padStart(8, '0')}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-3 w-full max-w-xs">
        {/* Continue with Ad button */}
        {!isVictory && canContinueWithAd && onContinue && (
          <div className="flex flex-col items-center">
            <button
              onClick={handleWatchAdToContinue}
              onTouchEnd={(e) => { e.preventDefault(); handleWatchAdToContinue(); }}
              disabled={continueButtonDisabled}
              className="font-vector font-bold text-sm w-full px-6 py-3 border-2
                         transition-all duration-300 active:scale-95 uppercase tracking-wider
                         disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              style={{ 
                background: 'linear-gradient(180deg, rgba(0,255,100,0.1) 0%, rgba(0,100,50,0.05) 100%)',
                borderColor: '#00ff66',
                boxShadow: '0 0 20px rgba(0, 255, 100, 0.3), inset 0 0 30px rgba(0, 255, 100, 0.05)',
                clipPath: angularClipPath,
                color: isAdLoading ? '#ffff00' : '#00ff66',
              }}
            >
              <span className="relative z-10">
                {isAdLoading ? '⏳ Loading...' : '▶ Watch Ad → Revive'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent 
                              translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
            </button>
            {displayError && (
              <p className="font-tech text-[10px] text-yellow-400/80 mt-2 text-center animate-pulse tracking-wide">
                {displayError}
              </p>
            )}
          </div>
        )}
        
        <button
          onClick={onRestart}
          onTouchEnd={(e) => { e.preventDefault(); onRestart(); }}
          className="font-vector font-bold text-sm w-full px-6 py-3 border-2
                     transition-all duration-300 active:scale-95 uppercase tracking-wider
                     text-white relative overflow-hidden group"
          style={{ 
            background: 'linear-gradient(180deg, rgba(255,0,255,0.15) 0%, rgba(0,255,255,0.08) 100%)',
            borderColor: '#ff00ff',
            boxShadow: '0 0 25px rgba(255, 0, 255, 0.35), inset 0 0 30px rgba(255, 0, 255, 0.08)',
            clipPath: angularClipPath,
          }}
        >
          <span className="relative z-10 group-hover:text-cyan-400 transition-colors">
            {isVictory ? '▶ Play Again' : '▶ Try Again'}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent 
                          translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
        </button>
        
        <button
          onClick={onQuit}
          onTouchEnd={(e) => { e.preventDefault(); onQuit(); }}
          className="font-tech text-xs w-full px-6 py-2 border
                     transition-all duration-300 active:scale-95 uppercase tracking-[0.2em]
                     text-gray-500 border-gray-700 hover:text-gray-300 hover:border-gray-500"
          style={{ 
            clipPath: angularClipPathSmall,
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          ◀ Main Menu
        </button>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-magenta via-white/30 to-cyan-400" />

      {/* Ad overlay */}
      {isShowingAd && !isNative && <RewardedAdOverlay progress={adProgress} />}
    </div>
  );
};
