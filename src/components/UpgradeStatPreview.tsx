import React from 'react';
import { ShipUpgrade, getComputedStats, type UpgradeState, getStoredUpgrades } from '@/hooks/useShipUpgrades';

interface UpgradeStatPreviewProps {
  upgrade: ShipUpgrade;
  currentLevel: number;
  upgrades?: UpgradeState; // pass current state for instant preview updates
}

const STAT_LABELS: Record<string, string> = {
  damage: 'DAMAGE',
  fireRate: 'FIRE RATE',
  health: 'HEALTH',
  speed: 'SPEED',
  magnetRange: 'MAGNET',
  shields: 'SHIELDS',
  pierce: 'PIERCE',
  extraCannons: 'CANNONS',
};

const STAT_ICONS: Record<string, string> = {
  damage: '◈',
  fireRate: '◇',
  health: '♦',
  speed: '▷',
  magnetRange: '◎',
  shields: '⬡',
  pierce: '⊕',
  extraCannons: '⫸',
};

export const UpgradeStatPreview: React.FC<UpgradeStatPreviewProps> = ({ upgrade, currentLevel, upgrades }) => {
  const isMaxed = currentLevel >= upgrade.maxLevel;

  // Use passed-in upgrade state when available (shop), fallback to localStorage (in-game/other)
  const currentUpgrades = upgrades ?? getStoredUpgrades();
  const currentStats = getComputedStats(currentUpgrades);

  // Get stats after upgrade
  const nextUpgrades = { ...currentUpgrades, [upgrade.id]: currentLevel + 1 };
  const nextStats = getComputedStats(nextUpgrades);

  const stat = upgrade.effect.stat;
  const valuePerLevel = upgrade.effect.valuePerLevel;
  
  // Calculate current and next values for display
  const getCurrentValue = () => {
    switch (stat) {
      case 'damage': return `${Math.round((currentStats.damageMultiplier - 1) * 100)}%`;
      case 'fireRate': return `${Math.round((currentStats.fireRateMultiplier - 1) * 100)}%`;
      case 'health': return `${Math.round((currentStats.healthMultiplier - 1) * 100)}%`;
      case 'speed': return `${Math.round((currentStats.speedMultiplier - 1) * 100)}%`;
      case 'magnetRange': return `${Math.round((currentStats.magnetRangeMultiplier - 1) * 100)}%`;
      case 'shields': return `+${currentStats.bonusShields}`;
      case 'pierce': return `+${currentStats.bonusPierce}`;
      case 'extraCannons': return `+${currentStats.extraCannons}`;
      default: return '0';
    }
  };
  
  const getNextValue = () => {
    switch (stat) {
      case 'damage': return `${Math.round((nextStats.damageMultiplier - 1) * 100)}%`;
      case 'fireRate': return `${Math.round((nextStats.fireRateMultiplier - 1) * 100)}%`;
      case 'health': return `${Math.round((nextStats.healthMultiplier - 1) * 100)}%`;
      case 'speed': return `${Math.round((nextStats.speedMultiplier - 1) * 100)}%`;
      case 'magnetRange': return `${Math.round((nextStats.magnetRangeMultiplier - 1) * 100)}%`;
      case 'shields': return `+${nextStats.bonusShields}`;
      case 'pierce': return `+${nextStats.bonusPierce}`;
      case 'extraCannons': return `+${nextStats.extraCannons}`;
      default: return '0';
    }
  };
  
  const getBonus = () => {
    if (stat === 'shields' || stat === 'pierce' || stat === 'extraCannons') {
      return `+${valuePerLevel}`;
    }
    return `+${Math.round(valuePerLevel * 100)}%`;
  };

  return (
    <div 
      className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 min-w-[140px]"
      style={{ pointerEvents: 'none' }}
    >
      <div 
        className="bg-black/95 border-2 border-cyan-400/60 rounded-lg p-2 shadow-lg"
        style={{
          boxShadow: '0 0 20px rgba(0, 229, 255, 0.3), 0 0 40px rgba(0, 229, 255, 0.1)',
        }}
      >
        {/* Header */}
        <div className="font-pixel text-[8px] text-cyan-400/80 mb-1.5 text-center uppercase tracking-wider">
          {STAT_ICONS[stat]} {STAT_LABELS[stat]}
        </div>
        
        {/* Current vs Next comparison */}
        <div className="flex items-center justify-center gap-2">
          <div className="text-center">
            <div className="font-pixel text-[7px] text-gray-500">NOW</div>
            <div className="font-pixel text-[11px] text-gray-300">
              {getCurrentValue()}
            </div>
          </div>
          
          {!isMaxed && (
            <>
              <div className="font-pixel text-[10px] text-cyan-400">→</div>
              <div className="text-center">
                <div className="font-pixel text-[7px] text-green-400">NEXT</div>
                <div className="font-pixel text-[11px] text-green-400" style={{ textShadow: '0 0 8px rgba(0, 255, 100, 0.5)' }}>
                  {getNextValue()}
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Bonus indicator */}
        {!isMaxed && (
          <div className="mt-1.5 pt-1.5 border-t border-cyan-400/20">
            <div className="font-pixel text-[8px] text-yellow-400 text-center" style={{ textShadow: '0 0 6px rgba(255, 255, 0, 0.4)' }}>
              {getBonus()} PER LEVEL
            </div>
          </div>
        )}
        
        {isMaxed && (
          <div className="mt-1 font-pixel text-[7px] text-green-400 text-center">
            ◆ MAX REACHED
          </div>
        )}
      </div>
      
      {/* Arrow pointing down */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
        style={{
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid rgba(0, 229, 255, 0.6)',
        }}
      />
    </div>
  );
};
