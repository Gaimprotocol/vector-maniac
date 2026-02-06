// Bestiary Rewards - Tracks bounties and companions
import { useState, useEffect, useCallback } from 'react';
import { getArenaCompanions } from './useArenaUnlocks';

const REWARDS_KEY = 'vector_maniac_bestiary_rewards';
const COMPANIONS_KEY = 'vector_maniac_companions';

export interface BestiaryRewards {
  collectedBounties: number[]; // Seeds of anomalies with collected bounties
}

export interface Companion {
  seed: number;
  name: string;
  shape: string;
  hue: number;
  saturation: number;
  behavior: string;
  ability: string;
  purchasedAt: number;
  evolutionLevel?: number; // 1 = base, 2+ = evolved
  mergedFrom?: number[]; // Seeds of companions merged to create this
  fromArena?: boolean; // True if companion was won from arena
}

// Bounty values based on ability rarity - ECONOMY v3: Reduced rewards
export function getBountyValue(ability: string, behavior: string): number {
  const abilityBonus: Record<string, number> = {
    none: 5,       // Was 10
    shooter: 10,   // Was 25
    splitter: 12,  // Was 30
    shield: 15,    // Was 35
    phaser: 18,    // Was 40
    leech: 25,     // Was 50
  };
  
  const behaviorBonus: Record<string, number> = {
    chase: 2,      // Was 5
    orbit: 4,      // Was 10
    zigzag: 6,     // Was 15
    teleport: 10,  // Was 25
    spiral: 6,     // Was 15
    strafe: 4,     // Was 10
    pounce: 8,     // Was 20
    mirror: 12,    // Was 30
  };
  
  return (abilityBonus[ability] || 5) + (behaviorBonus[behavior] || 2);
}

// Companion purchase cost - ECONOMY v3: Increased costs
export function getCompanionCost(ability: string, timesDefeated: number): number {
  const baseCost: Record<string, number> = {
    none: 200,     // Was 100
    shooter: 350,  // Was 200
    splitter: 450, // Was 250
    shield: 550,   // Was 300
    phaser: 650,   // Was 350
    leech: 800,    // Was 400
  };
  
  // Discount based on how many times defeated (max 30% off, was 50%)
  const discount = Math.min(0.3, timesDefeated * 0.03);
  const base = baseCost[ability] || 200;
  
  return Math.floor(base * (1 - discount));
}

function getStoredRewards(): BestiaryRewards {
  try {
    const stored = localStorage.getItem(REWARDS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('[BestiaryRewards] Failed to load:', e);
  }
  return { collectedBounties: [] };
}

function saveRewards(rewards: BestiaryRewards): void {
  try {
    localStorage.setItem(REWARDS_KEY, JSON.stringify(rewards));
  } catch (e) {
    console.warn('[BestiaryRewards] Failed to save:', e);
  }
}

export function getStoredCompanions(): Companion[] {
  const companions: Companion[] = [];
  
  // Load regular companions
  try {
    const stored = localStorage.getItem(COMPANIONS_KEY);
    if (stored) {
      companions.push(...JSON.parse(stored));
    }
  } catch (e) {
    console.warn('[Companions] Failed to load:', e);
  }
  
  // Merge in arena-won companions
  try {
    const arenaCompanions = getArenaCompanions();
    for (const ac of arenaCompanions) {
      if (!ac.companionData) continue;
      
      // Generate unique seed from unlock timestamp
      const seed = ac.unlockedAt;
      
      // Check if already in list (by seed or name match)
      const alreadyExists = companions.some(c => 
        c.seed === seed || 
        (c.name === ac.companionData!.name && c.fromArena)
      );
      
      if (!alreadyExists) {
        // Map arena companion data to Companion interface
        const shapeMap: Record<string, string> = {
          'hexagon': 'hexagon',
          'diamond': 'star',
          'circle': 'crescent',
          'triangle': 'triangle',
        };
        
        companions.push({
          seed,
          name: ac.companionData.name,
          shape: shapeMap[ac.companionData.shape] || 'hexagon',
          hue: parseHue(ac.companionData.color),
          saturation: 70,
          behavior: 'orbit', // Arena companions default behavior
          ability: ac.companionData.level >= 3 ? 'phaser' : 'shooter',
          purchasedAt: ac.unlockedAt,
          evolutionLevel: ac.companionData.level,
          fromArena: true,
        });
      }
    }
  } catch (e) {
    console.warn('[Companions] Failed to load arena companions:', e);
  }
  
  return companions;
}

// Helper to parse hex color to hue
function parseHue(color: string): number {
  if (!color) return 180;
  
  // Handle hex colors like #ff4466
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    if (max === min) return 0;
    
    let h = 0;
    const d = max - min;
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
    
    return Math.round(h * 360);
  }
  
  return 180;
}

function saveCompanions(companions: Companion[]): void {
  try {
    // Only save non-arena companions (arena ones are in their own storage)
    const regularCompanions = companions.filter(c => !c.fromArena);
    localStorage.setItem(COMPANIONS_KEY, JSON.stringify(regularCompanions));
  } catch (e) {
    console.warn('[Companions] Failed to save:', e);
  }
}

// Get active companion (first one for now, can expand to multiple later)
export function getActiveCompanion(): Companion | null {
  const companions = getStoredCompanions();
  return companions.length > 0 ? companions[0] : null;
}

export function useBestiaryRewards() {
  const [rewards, setRewards] = useState<BestiaryRewards>(getStoredRewards);
  const [companions, setCompanions] = useState<Companion[]>(getStoredCompanions);

  useEffect(() => {
    saveRewards(rewards);
  }, [rewards]);

  useEffect(() => {
    saveCompanions(companions);
  }, [companions]);

  // Listen for arena unlock events to refresh companions list
  useEffect(() => {
    const handleArenaUnlocksChanged = () => {
      console.log('[BestiaryRewards] Arena unlocks changed, refreshing companions...');
      setCompanions(getStoredCompanions());
    };
    
    window.addEventListener('arena_unlocks_changed', handleArenaUnlocksChanged);
    return () => window.removeEventListener('arena_unlocks_changed', handleArenaUnlocksChanged);
  }, []);

  const hasBountyCollected = useCallback((seed: number) => {
    return rewards.collectedBounties.includes(seed);
  }, [rewards.collectedBounties]);

  const collectBounty = useCallback((seed: number) => {
    setRewards(prev => {
      if (prev.collectedBounties.includes(seed)) return prev;
      return {
        ...prev,
        collectedBounties: [...prev.collectedBounties, seed],
      };
    });
  }, []);

  const hasCompanion = useCallback((seed: number) => {
    return companions.some(c => c.seed === seed);
  }, [companions]);

  const purchaseCompanion = useCallback((companion: Omit<Companion, 'purchasedAt'>) => {
    setCompanions(prev => {
      if (prev.some(c => c.seed === companion.seed)) return prev;
      return [...prev, { ...companion, purchasedAt: Date.now() }];
    });
  }, []);

  const setActiveCompanion = useCallback((seed: number) => {
    setCompanions(prev => {
      const index = prev.findIndex(c => c.seed === seed);
      if (index < 0) return prev; // Not found
      if (index === 0) return prev; // Already first
      const companion = prev[index];
      const newList = [companion, ...prev.filter((_, i) => i !== index)];
      saveCompanions(newList); // Save immediately
      return newList;
    });
  }, []);

  // Calculate evolution cost - ECONOMY v4: Exponential costs to prevent easy power creep
  const getEvolutionCost = useCallback((seeds: number[]): number => {
    if (seeds.length !== 2) return 0;
    const comps = seeds.map(s => companions.find(c => c.seed === s)).filter(Boolean) as Companion[];
    if (comps.length !== 2) return 0;
    
    // Base cost with exponential scaling for higher levels
    const maxLevel = Math.max(comps[0].evolutionLevel || 1, comps[1].evolutionLevel || 1);
    const baseCost = 500; // Was 300
    // Exponential: 500, 1000, 2000, 4000, 8000... for each level
    const levelMultiplier = Math.pow(2, maxLevel - 1);
    return Math.floor(baseCost * levelMultiplier);
  }, [companions]);

  // Evolve two companions into a stronger one
  const evolveCompanions = useCallback((seed1: number, seed2: number): Companion | null => {
    const comp1 = companions.find(c => c.seed === seed1);
    const comp2 = companions.find(c => c.seed === seed2);
    
    if (!comp1 || !comp2) return null;
    
    // Create evolved companion with combined traits
    const newLevel = Math.max(comp1.evolutionLevel || 1, comp2.evolutionLevel || 1) + 1;
    const newSeed = Date.now(); // Unique new seed
    
    // Pick stronger ability
    const abilityRank: Record<string, number> = { none: 0, shooter: 1, splitter: 2, shield: 3, phaser: 4, leech: 5 };
    const strongerAbility = (abilityRank[comp1.ability] || 0) >= (abilityRank[comp2.ability] || 0) ? comp1.ability : comp2.ability;
    
    // Pick more complex behavior
    const behaviorRank: Record<string, number> = { chase: 0, orbit: 1, zigzag: 2, strafe: 3, spiral: 4, pounce: 5, teleport: 6, mirror: 7 };
    const strongerBehavior = (behaviorRank[comp1.behavior] || 0) >= (behaviorRank[comp2.behavior] || 0) ? comp1.behavior : comp2.behavior;
    
    // Blend colors
    const newHue = Math.round((comp1.hue + comp2.hue) / 2);
    const newSat = Math.round((comp1.saturation + comp2.saturation) / 2);
    
    // Pick the more complex shape or randomly
    const shapes = ['triangle', 'square', 'pentagon', 'hexagon', 'star', 'cross', 'crescent', 'spiral'];
    const shapeRank = (s: string) => shapes.indexOf(s);
    const strongerShape = shapeRank(comp1.shape) >= shapeRank(comp2.shape) ? comp1.shape : comp2.shape;
    
    const evolvedCompanion: Companion = {
      seed: newSeed,
      name: `Evolved ${comp1.name.split(' ')[0]}`,
      shape: strongerShape,
      hue: newHue,
      saturation: newSat,
      behavior: strongerBehavior,
      ability: strongerAbility,
      purchasedAt: Date.now(),
      evolutionLevel: newLevel,
      mergedFrom: [seed1, seed2],
    };
    
    // Remove old companions and add evolved one
    setCompanions(prev => {
      const filtered = prev.filter(c => c.seed !== seed1 && c.seed !== seed2);
      const newList = [evolvedCompanion, ...filtered];
      saveCompanions(newList);
      return newList;
    });
    
    return evolvedCompanion;
  }, [companions]);

  return {
    rewards,
    companions,
    hasBountyCollected,
    collectBounty,
    hasCompanion,
    purchaseCompanion,
    setActiveCompanion,
    activeCompanion: companions[0] || null,
    evolveCompanions,
    getEvolutionCost,
  };
}
