// Bestiary Rewards - Tracks bounties and companions
import { useState, useEffect, useCallback } from 'react';

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
}

// Bounty values based on ability rarity
export function getBountyValue(ability: string, behavior: string): number {
  const abilityBonus: Record<string, number> = {
    none: 10,
    shooter: 25,
    splitter: 30,
    shield: 35,
    phaser: 40,
    leech: 50,
  };
  
  const behaviorBonus: Record<string, number> = {
    chase: 5,
    orbit: 10,
    zigzag: 15,
    teleport: 25,
    spiral: 15,
    strafe: 10,
    pounce: 20,
    mirror: 30,
  };
  
  return (abilityBonus[ability] || 10) + (behaviorBonus[behavior] || 5);
}

// Companion purchase cost (higher for rarer/more powerful)
export function getCompanionCost(ability: string, timesDefeated: number): number {
  const baseCost: Record<string, number> = {
    none: 100,
    shooter: 200,
    splitter: 250,
    shield: 300,
    phaser: 350,
    leech: 400,
  };
  
  // Discount based on how many times defeated (max 50% off)
  const discount = Math.min(0.5, timesDefeated * 0.05);
  const base = baseCost[ability] || 100;
  
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
  try {
    const stored = localStorage.getItem(COMPANIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('[Companions] Failed to load:', e);
  }
  return [];
}

function saveCompanions(companions: Companion[]): void {
  try {
    localStorage.setItem(COMPANIONS_KEY, JSON.stringify(companions));
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

  // Calculate evolution cost based on the companions being merged
  const getEvolutionCost = useCallback((seeds: number[]): number => {
    if (seeds.length !== 2) return 0;
    const comps = seeds.map(s => companions.find(c => c.seed === s)).filter(Boolean) as Companion[];
    if (comps.length !== 2) return 0;
    
    // Base cost + bonus for evolution levels
    const baseCost = 150;
    const levelBonus = comps.reduce((sum, c) => sum + (c.evolutionLevel || 1) * 50, 0);
    return baseCost + levelBonus;
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
