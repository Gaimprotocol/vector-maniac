import { useState, useEffect, useCallback } from 'react';

// Ship upgrade definitions
export interface ShipUpgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number; // Cost increases per level
  effect: {
    stat: 'damage' | 'fireRate' | 'health' | 'speed' | 'magnetRange' | 'shields' | 'pierce' | 'extraCannons';
    valuePerLevel: number;
  };
}

// REBALANCED v2: Further reduced bonuses for challenging late-game
export const SHIP_UPGRADES: ShipUpgrade[] = [
  {
    id: 'cannon_power',
    name: 'CANNON POWER',
    description: 'Increases weapon damage',
    icon: '💥',
    maxLevel: 8,         // Reduced from 10
    baseCost: 100,       // Increased from 75
    costMultiplier: 1.8, // Increased from 1.6
    effect: { stat: 'damage', valuePerLevel: 0.06 }, // Was 8%, now 6% (max +48%)
  },
  {
    id: 'rapid_fire',
    name: 'RAPID FIRE',
    description: 'Increases fire rate',
    icon: '🔥',
    maxLevel: 8,         // Reduced from 10
    baseCost: 100,       // Increased from 80
    costMultiplier: 1.8,
    effect: { stat: 'fireRate', valuePerLevel: 0.05 }, // Was 6%, now 5% (max +40%)
  },
  {
    id: 'hull_armor',
    name: 'HULL ARMOR',
    description: 'Increases max health',
    icon: '🛡️',
    maxLevel: 8,         // Reduced from 10
    baseCost: 120,       // Increased from 100
    costMultiplier: 1.8,
    effect: { stat: 'health', valuePerLevel: 0.06 }, // Was 8%, now 6% (max +48%)
  },
  {
    id: 'thrusters',
    name: 'THRUSTERS',
    description: 'Increases movement speed',
    icon: '🚀',
    maxLevel: 5,         // Reduced from 6
    baseCost: 80,        // Increased from 60
    costMultiplier: 1.6,
    effect: { stat: 'speed', valuePerLevel: 0.04 }, // Was 5%, now 4% (max +20%)
  },
  {
    id: 'magnet_range',
    name: 'SALVAGE MAGNET',
    description: 'Increases scrap pickup range',
    icon: '🧲',
    maxLevel: 5,         // Reduced from 6
    baseCost: 60,        // Increased from 50
    costMultiplier: 1.5,
    effect: { stat: 'magnetRange', valuePerLevel: 0.08 }, // Was 10%, now 8% (max +40%)
  },
  {
    id: 'energy_shields',
    name: 'ENERGY SHIELDS',
    description: 'Adds protective shields',
    icon: '⚡',
    maxLevel: 2,         // Reduced from 3
    baseCost: 400,       // Increased from 300
    costMultiplier: 3.0, // Increased from 2.5
    effect: { stat: 'shields', valuePerLevel: 1 },
  },
  {
    id: 'piercing_rounds',
    name: 'PIERCING ROUNDS',
    description: 'Bullets penetrate enemies',
    icon: '🎯',
    maxLevel: 2,         // Same as before
    baseCost: 350,       // Increased from 250
    costMultiplier: 3.5, // Increased from 3.0
    effect: { stat: 'pierce', valuePerLevel: 1 },
  },
  {
    id: 'extra_cannons',
    name: 'EXTRA CANNONS',
    description: 'Adds side-mounted guns',
    icon: '🔫',
    maxLevel: 1,         // Reduced from 2 - only 1 extra pair now
    baseCost: 600,       // Increased from 500
    costMultiplier: 1,
    effect: { stat: 'extraCannons', valuePerLevel: 1 },
  },
];

// Upgrade state interface
export interface UpgradeState {
  [upgradeId: string]: number; // upgrade id -> current level
}

const STORAGE_KEY = 'vector_maniac_upgrades';

const defaultUpgradeState: UpgradeState = {};

function canUseLocalStorage(): boolean {
  try {
    const k = '__vm_ls_test__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function useShipUpgrades() {
  const [upgrades, setUpgrades] = useState<UpgradeState>(defaultUpgradeState);
  const [isLoading, setIsLoading] = useState(true);
  const [storageAvailable] = useState(() => canUseLocalStorage());

  // Load upgrades from localStorage on mount
  useEffect(() => {
    try {
      if (!storageAvailable) {
        console.warn('[Upgrades] localStorage unavailable (private mode / blocked). Upgrades will work in-session only.');
      }
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUpgrades(parsed);
      }
    } catch (error) {
      console.error('[Upgrades] Failed to load:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save upgrades to localStorage AND update React state atomically
  const persistUpgrades = useCallback((newUpgrades: UpgradeState) => {
    console.info('[Upgrades] persistUpgrades ->', newUpgrades);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUpgrades));
      window.dispatchEvent(new CustomEvent('vector_maniac_upgrades_changed', { detail: newUpgrades }));
    } catch (error) {
      console.error('[Upgrades] Failed to persist (UI still updated):', error);
    }
  }, []);

  // Get upgrade level
  const getUpgradeLevel = useCallback((upgradeId: string): number => {
    return upgrades[upgradeId] || 0;
  }, [upgrades]);

  // Get upgrade cost for next level
  const getUpgradeCost = useCallback((upgradeId: string): number => {
    const upgrade = SHIP_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return Infinity;
    
    const currentLevel = upgrades[upgradeId] || 0;
    if (currentLevel >= upgrade.maxLevel) return Infinity;
    
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
  }, [upgrades]);

  // Check if upgrade is maxed
  const isUpgradeMaxed = useCallback((upgradeId: string): boolean => {
    const upgrade = SHIP_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return true;
    
    const currentLevel = upgrades[upgradeId] || 0;
    return currentLevel >= upgrade.maxLevel;
  }, [upgrades]);

  // Purchase upgrade using FUNCTIONAL setState to avoid stale closures
  const purchaseUpgrade = useCallback((upgradeId: string): boolean => {
    const upgrade = SHIP_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return false;
    
    let success = false;
    
    // Use functional update to get FRESH state, not stale closure
    setUpgrades(prevUpgrades => {
      const currentLevel = prevUpgrades[upgradeId] || 0;
      if (currentLevel >= upgrade.maxLevel) {
        success = false;
        return prevUpgrades; // No change
      }
      
      const newUpgrades = {
        ...prevUpgrades,
        [upgradeId]: currentLevel + 1,
      };
      
      // Persist outside the setState (schedule it)
      setTimeout(() => persistUpgrades(newUpgrades), 0);
      
      success = true;
      return newUpgrades;
    });
    
    // Note: success is set synchronously within the functional update
    return true; // Always return true optimistically; the functional update handles the guard
  }, [persistUpgrades]);

  // Reset all upgrades (for testing)
  const resetUpgrades = useCallback(() => {
    setUpgrades({});
    persistUpgrades({});
  }, [persistUpgrades]);

  return {
    upgrades,
    isLoading,
    storageAvailable,
    getUpgradeLevel,
    getUpgradeCost,
    isUpgradeMaxed,
    purchaseUpgrade,
    resetUpgrades,
    allUpgrades: SHIP_UPGRADES,
  };
}

// Utility function to get upgrades without hook (for game logic)
export function getStoredUpgrades(): UpgradeState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('[Upgrades] Failed to get stored value:', error);
  }
  return {};
}

// Get computed stats based on upgrades
export interface ComputedShipStats {
  damageMultiplier: number;
  fireRateMultiplier: number;
  healthMultiplier: number;
  speedMultiplier: number;
  magnetRangeMultiplier: number;
  bonusShields: number;
  bonusPierce: number;
  extraCannons: number;
}

export function getComputedStats(upgradeState?: UpgradeState): ComputedShipStats {
  const upgrades = upgradeState || getStoredUpgrades();
  
  const stats: ComputedShipStats = {
    damageMultiplier: 1,
    fireRateMultiplier: 1,
    healthMultiplier: 1,
    speedMultiplier: 1,
    magnetRangeMultiplier: 1,
    bonusShields: 0,
    bonusPierce: 0,
    extraCannons: 0,
  };
  
  SHIP_UPGRADES.forEach(upgrade => {
    const level = upgrades[upgrade.id] || 0;
    if (level > 0) {
      const totalBonus = upgrade.effect.valuePerLevel * level;
      
      switch (upgrade.effect.stat) {
        case 'damage':
          stats.damageMultiplier += totalBonus;
          break;
        case 'fireRate':
          stats.fireRateMultiplier += totalBonus;
          break;
        case 'health':
          stats.healthMultiplier += totalBonus;
          break;
        case 'speed':
          stats.speedMultiplier += totalBonus;
          break;
        case 'magnetRange':
          stats.magnetRangeMultiplier += totalBonus;
          break;
        case 'shields':
          stats.bonusShields += totalBonus;
          break;
        case 'pierce':
          stats.bonusPierce += totalBonus;
          break;
        case 'extraCannons':
          stats.extraCannons += totalBonus;
          break;
      }
    }
  });
  
  return stats;
}
