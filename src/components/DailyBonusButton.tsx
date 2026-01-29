import React, { useState } from 'react';
import { useDailyBonus } from '@/hooks/useDailyBonus';

interface DailyBonusButtonProps {
  onClaim?: (amount: number) => void;
}

export const DailyBonusButton: React.FC<DailyBonusButtonProps> = ({ onClaim }) => {
  const { canClaim, streak, nextBonusAmount, isLoading, claimBonus } = useDailyBonus();
  const [claimed, setClaimed] = useState(false);
  const [claimedAmount, setClaimedAmount] = useState(0);

  const handleClaim = () => {
    if (!canClaim || claimed) return;
    
    const amount = claimBonus();
    setClaimedAmount(amount);
    setClaimed(true);
    onClaim?.(amount);
  };

  if (isLoading) return null;

  // Already claimed today
  if (!canClaim && !claimed) {
    return (
      <div 
        className="text-[9px] text-[#00ff88]/40 border border-[#00ff88]/20 rounded px-4 py-2
                   flex items-center gap-2"
        style={{ fontFamily: 'Orbitron, monospace' }}
      >
        <span className="text-[#00ff88]/30">◇</span>
        <span>DAILY BONUS CLAIMED</span>
        {streak > 1 && (
          <span className="text-[#ffaa00]/50 ml-1">🔥 {streak} DAY STREAK</span>
        )}
      </div>
    );
  }

  // Just claimed - show success
  if (claimed) {
    return (
      <div 
        className="text-[10px] text-[#00ff88] border border-[#00ff88]/50 rounded px-4 py-2
                   flex items-center gap-2 animate-pulse"
        style={{ 
          fontFamily: 'Orbitron, monospace',
          boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
        }}
      >
        <span className="text-[#00ff88]">✓</span>
        <span>+{claimedAmount} SCRAPS COLLECTED!</span>
        {streak > 1 && (
          <span className="text-[#ffaa00] ml-1">🔥 {streak}</span>
        )}
      </div>
    );
  }

  // Can claim - show button
  return (
    <button
      onClick={handleClaim}
      onTouchEnd={(e) => { e.preventDefault(); handleClaim(); }}
      className="text-[10px] text-[#ffaa00] border-2 border-[#ffaa00]/60 rounded px-5 py-2
                 transition-all duration-300 hover:border-[#ffaa00] hover:bg-[#ffaa00]/10
                 flex items-center gap-2 relative overflow-hidden"
      style={{ 
        fontFamily: 'Orbitron, monospace',
        boxShadow: '0 0 20px rgba(255, 170, 0, 0.25)',
        animation: 'dailyGlow 2s ease-in-out infinite alternate',
      }}
    >
      {/* Shimmer effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffaa00]/20 to-transparent"
        style={{
          animation: 'shimmer 2s infinite',
        }}
      />
      <span className="relative z-10">◆</span>
      <span className="relative z-10">CLAIM DAILY BONUS</span>
      <span className="relative z-10 text-[#ffdd00]">+{nextBonusAmount}</span>
      {streak > 0 && (
        <span className="relative z-10 text-[#ff8800] ml-1">🔥 {streak}</span>
      )}
      
      <style>{`
        @keyframes dailyGlow {
          0% { box-shadow: 0 0 15px rgba(255, 170, 0, 0.2); }
          100% { box-shadow: 0 0 30px rgba(255, 170, 0, 0.4), 0 0 50px rgba(255, 170, 0, 0.2); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </button>
  );
};
