// Arena Rewards - Permanent unlocks for main game
// These are NOT consumables - they unlock permanently

import { SHIP_MODELS } from '@/game/shipModels';

const STORAGE_KEY = 'arena_permanent_rewards';

export interface ArenaUnlock {
  id: string;
  type: 'ship' | 'skin' | 'companion' | 'title';
  name: string;
  description: string;
  rarity: 'rare' | 'epic' | 'legendary';
  unlockedAt: number;
  // Type-specific data
  shipId?: string;
  skinId?: string;
  companionData?: {
    name: string;
    color: string;
    shape: string;
    level: number;
  };
}

// Get all unlocked arena rewards
export function getArenaUnlocks(): ArenaUnlock[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save arena unlocks
function saveArenaUnlocks(unlocks: ArenaUnlock[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocks));
    window.dispatchEvent(new CustomEvent('arena_unlocks_changed'));
  } catch {
    // Safari private mode
  }
}

// Add a new permanent unlock
export function addArenaUnlock(unlock: Omit<ArenaUnlock, 'unlockedAt'>): void {
  const current = getArenaUnlocks();
  
  // Check if already unlocked (by name for duplicates)
  const alreadyExists = current.some(u => u.name === unlock.name && u.type === unlock.type);
  if (alreadyExists) {
    console.log('[ArenaUnlocks] Already unlocked:', unlock.name);
    return;
  }
  
  const newUnlock: ArenaUnlock = {
    ...unlock,
    unlockedAt: Date.now(),
  };
  
  current.push(newUnlock);
  saveArenaUnlocks(current);
  console.log('[ArenaUnlocks] New unlock:', newUnlock.name);
}

// Check if a specific ship is unlocked via arena
export function isArenaShipUnlocked(shipId: string): boolean {
  return getArenaUnlocks().some(u => u.type === 'ship' && u.shipId === shipId);
}

// Check if a specific skin is unlocked via arena
export function isArenaSkinUnlocked(skinId: string): boolean {
  return getArenaUnlocks().some(u => u.type === 'skin' && u.skinId === skinId);
}

// Get all arena-unlocked companions
export function getArenaCompanions(): ArenaUnlock[] {
  return getArenaUnlocks().filter(u => u.type === 'companion');
}

// Get all arena-unlocked ships
export function getArenaShips(): ArenaUnlock[] {
  return getArenaUnlocks().filter(u => u.type === 'ship');
}

// Get all arena-unlocked skins
export function getArenaSkins(): ArenaUnlock[] {
  return getArenaUnlocks().filter(u => u.type === 'skin');
}

// ============ REWARD POOLS ============

// Arena-exclusive ships (can only be obtained from arena wins)
// These are UNIQUE Vector Maniac designs - not from other games
export const ARENA_SHIPS = [
  { 
    shipId: 'hex_phantom', 
    name: 'HEX PHANTOM', 
    desc: 'Hexagonal stealth fighter with phase-shift core',
    rarity: 'legendary' as const,
  },
  { 
    shipId: 'pulse_wraith', 
    name: 'PULSE WRAITH', 
    desc: 'Spectral attacker with pulsing energy wings',
    rarity: 'legendary' as const,
  },
  { 
    shipId: 'grid_reaper', 
    name: 'GRID REAPER', 
    desc: 'Angular death machine from the data void',
    rarity: 'legendary' as const,
  },
  { 
    shipId: 'null_striker', 
    name: 'NULL STRIKER', 
    desc: 'Zero-point energy fighter with dual cores',
    rarity: 'legendary' as const,
  },
];

// Arena-exclusive skins
export const ARENA_SKINS = [
  { 
    skinId: 'arena_gold', 
    name: 'ARENA CHAMPION', 
    desc: 'Golden battle-worn finish',
    rarity: 'epic' as const,
  },
  { 
    skinId: 'arena_crimson', 
    name: 'BLOOD VICTOR', 
    desc: 'Crimson arena veteran coating',
    rarity: 'epic' as const,
  },
  { 
    skinId: 'arena_void', 
    name: 'VOID WALKER', 
    desc: 'Dark matter infused hull',
    rarity: 'legendary' as const,
  },
  { 
    skinId: 'arena_neon', 
    name: 'NEON GLADIATOR', 
    desc: 'Pulsating victory colors',
    rarity: 'rare' as const,
  },
];

// Arena-exclusive companions (powerful allies for main game)
export const ARENA_COMPANIONS = [
  { 
    name: 'Arena Sentinel', 
    desc: 'Battle-hardened guardian drone',
    color: '#ff4466',
    shape: 'hexagon',
    level: 2,
    rarity: 'epic' as const,
  },
  { 
    name: 'Void Stalker', 
    desc: 'Stealth attack companion',
    color: '#aa66ff',
    shape: 'diamond',
    level: 2,
    rarity: 'epic' as const,
  },
  { 
    name: 'Plasma Guardian', 
    desc: 'High-energy defender orb',
    color: '#ffaa00',
    shape: 'circle',
    level: 3,
    rarity: 'legendary' as const,
  },
  { 
    name: 'Quantum Echo', 
    desc: 'Reality-bending attack drone',
    color: '#00ffff',
    shape: 'triangle',
    level: 3,
    rarity: 'legendary' as const,
  },
];

// Generate a random arena reward based on difficulty
export function generateArenaReward(difficulty: 'bronze' | 'silver' | 'gold' | 'diamond'): {
  type: 'consumable' | 'ship' | 'skin' | 'companion';
  data: any;
} | null {
  const roll = Math.random();
  
  // Chance modifiers by difficulty
  const chances = {
    bronze: { ship: 0.01, skin: 0.05, companion: 0.10, consumable: 0.50 },
    silver: { ship: 0.03, skin: 0.10, companion: 0.20, consumable: 0.60 },
    gold: { ship: 0.08, skin: 0.18, companion: 0.35, consumable: 0.70 },
    diamond: { ship: 0.15, skin: 0.30, companion: 0.50, consumable: 0.80 },
  };
  
  const c = chances[difficulty];
  
  if (roll < c.ship) {
    // Legendary ship!
    const ship = ARENA_SHIPS[Math.floor(Math.random() * ARENA_SHIPS.length)];
    return { type: 'ship', data: ship };
  } else if (roll < c.skin) {
    // Skin unlock
    const skin = ARENA_SKINS[Math.floor(Math.random() * ARENA_SKINS.length)];
    return { type: 'skin', data: skin };
  } else if (roll < c.companion) {
    // Companion for main game
    const companion = ARENA_COMPANIONS[Math.floor(Math.random() * ARENA_COMPANIONS.length)];
    return { type: 'companion', data: companion };
  } else if (roll < c.consumable) {
    // Arena consumable/booster
    return { type: 'consumable', data: null }; // Handled separately
  }
  
  return null; // No extra reward
}
