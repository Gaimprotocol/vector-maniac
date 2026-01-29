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
      if (index <= 0) return prev; // Already first or not found
      const companion = prev[index];
      const newList = [companion, ...prev.filter((_, i) => i !== index)];
      return newList;
    });
  }, []);

  return {
    rewards,
    companions,
    hasBountyCollected,
    collectBounty,
    hasCompanion,
    purchaseCompanion,
    setActiveCompanion,
    activeCompanion: companions[0] || null,
  };
}
