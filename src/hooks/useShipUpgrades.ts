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

// REBALANCED: Reduced bonuses for better long-term difficulty curve
export const SHIP_UPGRADES: ShipUpgrade[] = [
  {
    id: 'cannon_power',
    name: 'CANNON POWER',
    description: 'Increases weapon damage',
    icon: '💥',
    maxLevel: 10,
    baseCost: 75,        // Was 50
    costMultiplier: 1.6, // Was 1.5
    effect: { stat: 'damage', valuePerLevel: 0.08 }, // Was 15%, now 8%
  },
  {
    id: 'rapid_fire',
    name: 'RAPID FIRE',
    description: 'Increases fire rate',
    icon: '🔥',
    maxLevel: 10,
    baseCost: 80,        // Was 60
    costMultiplier: 1.6,
    effect: { stat: 'fireRate', valuePerLevel: 0.06 }, // Was 10%, now 6%
  },
  {
    id: 'hull_armor',
    name: 'HULL ARMOR',
    description: 'Increases max health',
    icon: '🛡️',
    maxLevel: 10,
    baseCost: 100,       // Was 75
    costMultiplier: 1.6,
    effect: { stat: 'health', valuePerLevel: 0.08 }, // Was 12%, now 8%
  },
  {
    id: 'thrusters',
    name: 'THRUSTERS',
    description: 'Increases movement speed',
    icon: '🚀',
    maxLevel: 6,         // Was 8
    baseCost: 60,        // Was 40
    costMultiplier: 1.5,
    effect: { stat: 'speed', valuePerLevel: 0.05 }, // Was 8%, now 5%
  },
  {
    id: 'magnet_range',
    name: 'SALVAGE MAGNET',
    description: 'Increases scrap pickup range',
    icon: '🧲',
    maxLevel: 6,         // Was 8
    baseCost: 50,        // Was 35
    costMultiplier: 1.4,
    effect: { stat: 'magnetRange', valuePerLevel: 0.10 }, // Was 15%, now 10%
  },
  {
    id: 'energy_shields',
    name: 'ENERGY SHIELDS',
    description: 'Adds protective shields',
    icon: '⚡',
    maxLevel: 3,         // Was 5
    baseCost: 300,       // Was 200
    costMultiplier: 2.5, // Was 2.0
    effect: { stat: 'shields', valuePerLevel: 1 },
  },
  {
    id: 'piercing_rounds',
    name: 'PIERCING ROUNDS',
    description: 'Bullets penetrate enemies',
    icon: '🎯',
    maxLevel: 2,         // Was 3
    baseCost: 250,       // Was 150
    costMultiplier: 3.0, // Was 2.5
    effect: { stat: 'pierce', valuePerLevel: 1 },
  },
  {
    id: 'extra_cannons',
    name: 'EXTRA CANNONS',
    description: 'Adds side-mounted guns',
    icon: '🔫',
    maxLevel: 2,         // Was 4
    baseCost: 500,       // Was 300
    costMultiplier: 2.5, // Was 2.0
    effect: { stat: 'extraCannons', valuePerLevel: 1 },
  },
];

// Upgrade state interface
export interface UpgradeState {
  [upgradeId: string]: number; // upgrade id -> current level
}

const STORAGE_KEY = 'vector_maniac_upgrades';

const defaultUpgradeState: UpgradeState = {};

export function useShipUpgrades() {
  const [upgrades, setUpgrades] = useState<UpgradeState>(defaultUpgradeState);
  const [isLoading, setIsLoading] = useState(true);

  // Load upgrades from localStorage on mount
  useEffect(() => {
    try {
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

  // Save upgrades to localStorage
  const saveUpgrades = useCallback((newUpgrades: UpgradeState) => {
    // Always update React state first so UI updates even if persistence fails
    setUpgrades(newUpgrades);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUpgrades));
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

  // Purchase upgrade (requires external scrap spending)
  const purchaseUpgrade = useCallback((upgradeId: string): boolean => {
    const upgrade = SHIP_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return false;
    
    const currentLevel = upgrades[upgradeId] || 0;
    if (currentLevel >= upgrade.maxLevel) return false;
    
    const newUpgrades = {
      ...upgrades,
      [upgradeId]: currentLevel + 1,
    };
    saveUpgrades(newUpgrades);
    return true;
  }, [upgrades, saveUpgrades]);

  // Reset all upgrades (for testing)
  const resetUpgrades = useCallback(() => {
    saveUpgrades({});
  }, [saveUpgrades]);

  return {
    upgrades,
    isLoading,
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
