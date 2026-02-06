// Arena Consumables - One-time use boosters that are consumed after each battle

import { useState, useEffect, useCallback, useRef } from 'react';

export type ConsumableRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface ArenaConsumable {
  id: string;
  type: ConsumableType;
  name: string;
  description: string;
  rarity: ConsumableRarity;
  icon: string;
  // Effect values
  healthBoost?: number;
  damageBoost?: number; // Percentage
  speedBoost?: number; // Percentage
  fireRateBoost?: number; // Percentage
  startingShield?: boolean;
  powerUpDuration?: number; // Percentage multiplier
  // Special booster data (for ship/companion/skin boosts)
  specialData?: {
    shipId?: string;
    shipName?: string;
    companionData?: {
      name: string;
      color: string;
      shape: string;
      level: number;
    };
    skinId?: string;
    skinName?: string;
  };
}

export type ConsumableType = 
  | 'health_boost'
  | 'damage_boost'
  | 'speed_boost'
  | 'fire_rate_boost'
  | 'starting_shield'
  | 'extended_powerups'
  | 'double_scraps'
  // Arena-won special boosters (one-time use)
  | 'ship_boost'
  | 'companion_boost'
  | 'skin_boost';

// Extended consumable interface for special boosters
export interface SpecialBoosterData {
  // For ship_boost
  shipId?: string;
  shipName?: string;
  // For companion_boost
  companionData?: {
    name: string;
    color: string;
    shape: string;
    level: number;
  };
  // For skin_boost
  skinId?: string;
  skinName?: string;
}

// All possible consumable definitions - using geometric symbols, NO emojis
export const CONSUMABLE_DEFINITIONS: Record<ConsumableType, Omit<ArenaConsumable, 'id'>> = {
  health_boost: {
    type: 'health_boost',
    name: 'Hull Reinforcement',
    description: '+50 Max HP for this battle',
    rarity: 'common',
    icon: '◇',
    healthBoost: 50,
  },
  damage_boost: {
    type: 'damage_boost',
    name: 'Overcharged Cannons',
    description: '+25% damage for this battle',
    rarity: 'rare',
    icon: '◈',
    damageBoost: 25,
  },
  speed_boost: {
    type: 'speed_boost',
    name: 'Turbo Thrusters',
    description: '+20% speed for this battle',
    rarity: 'rare',
    icon: '▷',
    speedBoost: 20,
  },
  fire_rate_boost: {
    type: 'fire_rate_boost',
    name: 'Rapid Fire Module',
    description: '+30% fire rate for this battle',
    rarity: 'epic',
    icon: '⊕',
    fireRateBoost: 30,
  },
  starting_shield: {
    type: 'starting_shield',
    name: 'Energy Shield',
    description: 'Start with invulnerability (3s)',
    rarity: 'epic',
    icon: '⬡',
    startingShield: true,
  },
  extended_powerups: {
    type: 'extended_powerups',
    name: 'Power Amplifier',
    description: 'Power-ups last 50% longer',
    rarity: 'legendary',
    icon: '✦',
    powerUpDuration: 50,
  },
  double_scraps: {
    type: 'double_scraps',
    name: 'Salvage Scanner',
    description: 'Double scraps reward if you win',
    rarity: 'legendary',
    icon: '◆',
  },
  // Special boosters (dynamic - filled when created)
  ship_boost: {
    type: 'ship_boost',
    name: 'Arena Ship',
    description: 'Use arena-exclusive ship for this battle',
    rarity: 'legendary',
    icon: '⬢',
  },
  companion_boost: {
    type: 'companion_boost',
    name: 'Arena Companion',
    description: 'Arena companion assists this battle',
    rarity: 'epic',
    icon: '◎',
  },
  skin_boost: {
    type: 'skin_boost',
    name: 'Arena Skin',
    description: 'Arena-exclusive skin for this battle',
    rarity: 'epic',
    icon: '◐',
  },
};

const STORAGE_KEY = 'arena_consumables';

// Get stored consumables
export function getStoredConsumables(): ArenaConsumable[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save consumables
function saveConsumables(consumables: ArenaConsumable[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consumables));
  } catch {
    // Safari private mode fallback
  }
}

// Add a new consumable to inventory
export function addConsumable(type: ConsumableType): ArenaConsumable {
  const definition = CONSUMABLE_DEFINITIONS[type];
  const newConsumable: ArenaConsumable = {
    ...definition,
    id: `consumable_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  
  const current = getStoredConsumables();
  current.push(newConsumable);
  saveConsumables(current);
  
  // Dispatch event for syncing
  window.dispatchEvent(new CustomEvent('arena_consumables_changed'));
  
  return newConsumable;
}

// Add a special booster (ship/companion/skin) with custom data
export function addSpecialBooster(
  type: 'ship_boost' | 'companion_boost' | 'skin_boost',
  name: string,
  description: string,
  rarity: ConsumableRarity,
  specialData: ArenaConsumable['specialData']
): ArenaConsumable {
  const definition = CONSUMABLE_DEFINITIONS[type];
  const newConsumable: ArenaConsumable = {
    ...definition,
    id: `consumable_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    rarity,
    specialData,
  };
  
  const current = getStoredConsumables();
  current.push(newConsumable);
  saveConsumables(current);
  
  window.dispatchEvent(new CustomEvent('arena_consumables_changed'));
  
  return newConsumable;
}

// Remove a consumable by ID (when used)
export function consumeConsumable(id: string): void {
  const current = getStoredConsumables();
  const filtered = current.filter(c => c.id !== id);
  saveConsumables(filtered);
  
  window.dispatchEvent(new CustomEvent('arena_consumables_changed'));
}

// Remove multiple consumables
export function consumeMultiple(ids: string[]): void {
  const current = getStoredConsumables();
  const filtered = current.filter(c => !ids.includes(c.id));
  saveConsumables(filtered);
  
  window.dispatchEvent(new CustomEvent('arena_consumables_changed'));
}

// Convert arena reward to consumable type (if applicable)
export function rewardToConsumable(rewardName: string): ConsumableType | null {
  // Map reward names to consumable types
  const mapping: Record<string, ConsumableType> = {
    'Minor Hull Patch': 'health_boost',
    'Hull Reinforcement': 'health_boost',
    'Arena Mastery I': 'damage_boost',
    'Tactical Reflexes': 'speed_boost',
    'Combat Focus': 'fire_rate_boost',
    'Basic Targeting': 'damage_boost',
    // Epic rewards
    'Combat Sentinel': 'starting_shield',
    'Plasma Orb': 'fire_rate_boost',
    'Shadow Clone': 'speed_boost',
    'Shield Bot': 'starting_shield',
    // Legendary rewards
    'Power Amplifier': 'extended_powerups',
    'Salvage Scanner': 'double_scraps',
  };
  
  return mapping[rewardName] || null;
}

// React hook for consuming in components
export function useArenaConsumables() {
  const [consumables, setConsumables] = useState<ArenaConsumable[]>(getStoredConsumables);
  const consumablesRef = useRef(consumables);
  
  // Keep ref in sync
  useEffect(() => {
    consumablesRef.current = consumables;
  }, [consumables]);
  
  // Listen for changes
  useEffect(() => {
    const handleChange = () => {
      setConsumables(getStoredConsumables());
    };
    
    window.addEventListener('arena_consumables_changed', handleChange);
    return () => window.removeEventListener('arena_consumables_changed', handleChange);
  }, []);
  
  const add = useCallback((type: ConsumableType) => {
    const newConsumable = addConsumable(type);
    setConsumables(getStoredConsumables());
    return newConsumable;
  }, []);
  
  const consume = useCallback((id: string) => {
    consumeConsumable(id);
    setConsumables(getStoredConsumables());
  }, []);
  
  const consumeAll = useCallback((ids: string[]) => {
    consumeMultiple(ids);
    setConsumables(getStoredConsumables());
  }, []);
  
  // Get count by type
  const getCountByType = useCallback((type: ConsumableType): number => {
    return consumablesRef.current.filter(c => c.type === type).length;
  }, []);
  
  // Group consumables by type for display
  const groupedConsumables = consumables.reduce((acc, c) => {
    if (!acc[c.type]) {
      acc[c.type] = [];
    }
    acc[c.type].push(c);
    return acc;
  }, {} as Record<ConsumableType, ArenaConsumable[]>);
  
  return {
    consumables,
    groupedConsumables,
    add,
    consume,
    consumeAll,
    getCountByType,
  };
}

// Calculate combined boosts from selected consumables
export function calculateBoosts(selectedConsumables: ArenaConsumable[]): {
  healthBoost: number;
  damageMultiplier: number;
  speedMultiplier: number;
  fireRateMultiplier: number;
  hasStartingShield: boolean;
  powerUpDurationMultiplier: number;
  doubleScrapReward: boolean;
} {
  let healthBoost = 0;
  let damageBoost = 0;
  let speedBoost = 0;
  let fireRateBoost = 0;
  let hasStartingShield = false;
  let powerUpDuration = 0;
  let doubleScrapReward = false;
  
  for (const c of selectedConsumables) {
    if (c.healthBoost) healthBoost += c.healthBoost;
    if (c.damageBoost) damageBoost += c.damageBoost;
    if (c.speedBoost) speedBoost += c.speedBoost;
    if (c.fireRateBoost) fireRateBoost += c.fireRateBoost;
    if (c.startingShield) hasStartingShield = true;
    if (c.powerUpDuration) powerUpDuration += c.powerUpDuration;
    if (c.type === 'double_scraps') doubleScrapReward = true;
  }
  
  return {
    healthBoost,
    damageMultiplier: 1 + damageBoost / 100,
    speedMultiplier: 1 + speedBoost / 100,
    fireRateMultiplier: 1 + fireRateBoost / 100,
    hasStartingShield,
    powerUpDurationMultiplier: 1 + powerUpDuration / 100,
    doubleScrapReward,
  };
}
