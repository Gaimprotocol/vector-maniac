import { useState, useEffect, useCallback, useRef } from 'react';

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

// REBALANCED v3: Increased costs to encourage scrap purchases
export const SHIP_UPGRADES: ShipUpgrade[] = [
  {
    id: 'cannon_power',
    name: 'CANNON POWER',
    description: 'Increases weapon damage',
    icon: '◈',
    maxLevel: 8,
    baseCost: 150,       // Was 100
    costMultiplier: 2.0, // Was 1.8
    effect: { stat: 'damage', valuePerLevel: 0.06 },
  },
  {
    id: 'rapid_fire',
    name: 'RAPID FIRE',
    description: 'Increases fire rate',
    icon: '◇',
    maxLevel: 8,
    baseCost: 150,       // Was 100
    costMultiplier: 2.0, // Was 1.8
    effect: { stat: 'fireRate', valuePerLevel: 0.05 },
  },
  {
    id: 'hull_armor',
    name: 'HULL ARMOR',
    description: 'Increases max health',
    icon: '⬡',
    maxLevel: 8,
    baseCost: 180,       // Was 120
    costMultiplier: 2.0, // Was 1.8
    effect: { stat: 'health', valuePerLevel: 0.06 },
  },
  {
    id: 'thrusters',
    name: 'THRUSTERS',
    description: 'Increases movement speed',
    icon: '▷',
    maxLevel: 5,
    baseCost: 120,       // Was 80
    costMultiplier: 1.8, // Was 1.6
    effect: { stat: 'speed', valuePerLevel: 0.04 },
  },
  {
    id: 'magnet_range',
    name: 'SALVAGE MAGNET',
    description: 'Increases scrap pickup range',
    icon: '◎',
    maxLevel: 5,
    baseCost: 100,       // Was 60
    costMultiplier: 1.7, // Was 1.5
    effect: { stat: 'magnetRange', valuePerLevel: 0.08 },
  },
  {
    id: 'energy_shields',
    name: 'ENERGY SHIELDS',
    description: 'Adds protective shields',
    icon: '⬢',
    maxLevel: 2,
    baseCost: 600,       // Was 400
    costMultiplier: 3.5, // Was 3.0
    effect: { stat: 'shields', valuePerLevel: 1 },
  },
  {
    id: 'piercing_rounds',
    name: 'PIERCING ROUNDS',
    description: 'Bullets penetrate enemies',
    icon: '⊕',
    maxLevel: 2,
    baseCost: 500,       // Was 350
    costMultiplier: 4.0, // Was 3.5
    effect: { stat: 'pierce', valuePerLevel: 1 },
  },
  {
    id: 'extra_cannons',
    name: 'EXTRA CANNONS',
    description: 'Adds side-mounted guns',
    icon: '⫸',
    maxLevel: 1,
    baseCost: 800,       // Was 600
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
  const upgradesRef = useRef<UpgradeState>(defaultUpgradeState);

  // Keep a synchronous ref so callers can get an immediate success/fail answer
  // (important for Shop spend/refund flow on mobile Safari).
  useEffect(() => {
    upgradesRef.current = upgrades;
  }, [upgrades]);

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

  // Purchase upgrade (sync success/fail)
  const purchaseUpgrade = useCallback((upgradeId: string): boolean => {
    const upgrade = SHIP_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return false;

    const current = upgradesRef.current;
    const currentLevel = current[upgradeId] || 0;
    if (currentLevel >= upgrade.maxLevel) return false;

    const newUpgrades: UpgradeState = {
      ...current,
      [upgradeId]: currentLevel + 1,
    };

    // Update UI immediately
    setUpgrades(newUpgrades);

    // Persist best-effort (doesn't block UI)
    // Note: keep this synchronous so other tabs/components that read storage stay in sync.
    persistUpgrades(newUpgrades);

    return true;
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
