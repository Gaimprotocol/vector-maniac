import React, { useMemo } from 'react';
import { VectorUpgrade, VECTOR_UPGRADES } from '@/game/vectorManiac/types';

interface UpgradePickModalProps {
  onSelectUpgrade: (upgradeId: string) => void;
  picksRemaining: number;
  totalPicks: number;
  currentUpgrades: Record<string, number>;
}

export const UpgradePickModal: React.FC<UpgradePickModalProps> = ({
  onSelectUpgrade,
  picksRemaining,
  totalPicks,
  currentUpgrades
}) => {
  // Generate 3 random unique upgrades
  const availableUpgrades = useMemo(() => {
    const shuffled = [...VECTOR_UPGRADES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [picksRemaining]); // Re-roll when picks change

  const getUpgradeLevel = (upgradeId: string) => currentUpgrades[upgradeId] || 0;

  return (
    <div 
      className="absolute inset-0 flex flex-col items-center justify-center z-50"
      style={{ 
        background: 'radial-gradient(ellipse at center, rgba(10, 22, 40, 0.95) 0%, rgba(5, 8, 16, 0.98) 100%)'
      }}
    >
      {/* Title */}
      <h2 
        className="font-pixel text-xl text-yellow-400 mb-2"
        style={{ textShadow: '0 0 20px #ffaa00' }}
      >
        CHOOSE UPGRADE
      </h2>
      
      <p className="font-pixel text-xs text-gray-400 mb-6">
        Pick {picksRemaining} of {totalPicks}
      </p>
      
      <div className="flex flex-col gap-3 w-[90%] max-w-[320px]">
        {availableUpgrades.map((upgrade) => {
          const level = getUpgradeLevel(upgrade.id);
          const maxed = upgrade.maxStack && level >= upgrade.maxStack;
          
          return (
            <button
              key={upgrade.id}
              disabled={maxed}
              className={`flex items-start p-4 border-2 rounded-lg text-left
                         transition-all duration-300 ${
                           maxed 
                             ? 'border-gray-600/30 opacity-50 cursor-not-allowed' 
                             : 'border-yellow-400/50 hover:border-yellow-400 hover:bg-yellow-400/10 active:bg-yellow-400/20'
                         }`}
              style={{ 
                background: maxed 
                  ? 'rgba(50, 50, 50, 0.2)' 
                  : 'linear-gradient(135deg, rgba(255, 200, 0, 0.05) 0%, rgba(150, 100, 0, 0.1) 100%)',
                boxShadow: maxed ? 'none' : '0 0 20px rgba(255, 200, 0, 0.1)'
              }}
              onClick={() => !maxed && onSelectUpgrade(upgrade.id)}
              onTouchEnd={(e) => { e.preventDefault(); !maxed && onSelectUpgrade(upgrade.id); }}
            >
              <span className="text-2xl mr-3">{upgrade.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-sm text-yellow-300">{upgrade.name}</span>
                  {level > 0 && (
                    <span className="font-pixel text-[10px] text-yellow-400/70">
                      Lv.{level}{upgrade.maxStack ? `/${upgrade.maxStack}` : ''}
                    </span>
                  )}
                </div>
                <span className="font-pixel text-[9px] text-gray-400 block mt-1">
                  {upgrade.description}
                </span>
                {maxed && (
                  <span className="font-pixel text-[8px] text-red-400 block mt-1">
                    MAX LEVEL
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
