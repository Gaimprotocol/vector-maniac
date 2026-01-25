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
      className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 min-w-[160px]"
      style={{ pointerEvents: 'none' }}
    >
      <div 
        className="rounded-lg p-3"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 20, 15, 0.98) 0%, rgba(0, 10, 8, 0.98) 100%)',
          border: '1px solid rgba(0, 255, 136, 0.4)',
          boxShadow: '0 0 25px rgba(0, 255, 136, 0.2), 0 0 50px rgba(0, 255, 136, 0.1), inset 0 0 20px rgba(0, 255, 136, 0.05)',
        }}
      >
        {/* Header */}
        <div 
          className="text-[9px] text-[#00ff88]/80 mb-2 text-center uppercase tracking-widest"
          style={{ fontFamily: 'Orbitron, monospace' }}
        >
          {STAT_ICONS[stat]} {STAT_LABELS[stat]}
        </div>
        
        {/* Current vs Next comparison */}
        <div className="flex items-center justify-center gap-3">
          <div className="text-center">
            <div 
              className="text-[7px] text-[#00ff88]/40 uppercase tracking-wider"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              NOW
            </div>
            <div 
              className="text-[12px] text-[#00ff88]/70"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              {getCurrentValue()}
            </div>
          </div>
          
          {!isMaxed && (
            <>
              <div 
                className="text-[11px] text-[#00ff88]"
                style={{ textShadow: '0 0 10px #00ff88' }}
              >
                →
              </div>
              <div className="text-center">
                <div 
                  className="text-[7px] text-[#00ff88] uppercase tracking-wider"
                  style={{ fontFamily: 'Orbitron, monospace' }}
                >
                  NEXT
                </div>
                <div 
                  className="text-[12px] text-[#00ff88]"
                  style={{ 
                    fontFamily: 'Rajdhani, sans-serif',
                    textShadow: '0 0 10px rgba(0, 255, 136, 0.6)' 
                  }}
                >
                  {getNextValue()}
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Bonus indicator */}
        {!isMaxed && (
          <div 
            className="mt-2 pt-2"
            style={{ borderTop: '1px solid rgba(0, 255, 136, 0.15)' }}
          >
            <div 
              className="text-[8px] text-[#facc15] text-center tracking-wider"
              style={{ 
                fontFamily: 'Orbitron, monospace',
                textShadow: '0 0 8px rgba(250, 204, 21, 0.5)' 
              }}
            >
              {getBonus()} PER LEVEL
            </div>
          </div>
        )}
        
        {isMaxed && (
          <div 
            className="mt-2 text-[8px] text-[#00ff88] text-center tracking-wider"
            style={{ 
              fontFamily: 'Orbitron, monospace',
              textShadow: '0 0 10px #00ff88' 
            }}
          >
            ◆ MAX REACHED
          </div>
        )}
      </div>
      
      {/* Arrow pointing down */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
        style={{
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid rgba(0, 255, 136, 0.4)',
          filter: 'drop-shadow(0 0 5px rgba(0, 255, 136, 0.3))',
        }}
      />
    </div>
  );
};