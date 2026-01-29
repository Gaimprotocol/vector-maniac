// Bestiary Hook - Tracks discovered anomaly types
import { useState, useEffect, useCallback } from 'react';
import { AnomalyDNA, AnomalyShape, AnomalyBehavior, AnomalyAbility, getAnomalyName } from '@/game/vectorManiac/anomalyGenerator';

export interface BestiaryEntry {
  seed: number;
  name: string;
  shape: AnomalyShape;
  behavior: AnomalyBehavior;
  ability: AnomalyAbility;
  hue: number;
  saturation: number;
  discoveredAt: number; // timestamp
  timesEncountered: number;
  timesDefeated: number;
}

const BESTIARY_KEY = 'vector_maniac_bestiary';

// Get stored bestiary from localStorage
function getStoredBestiary(): BestiaryEntry[] {
  try {
    const stored = localStorage.getItem(BESTIARY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('[Bestiary] Failed to load:', e);
  }
  return [];
}

// Save bestiary to localStorage
function saveBestiary(entries: BestiaryEntry[]): void {
  try {
    localStorage.setItem(BESTIARY_KEY, JSON.stringify(entries));
  } catch (e) {
    console.warn('[Bestiary] Failed to save:', e);
  }
}

export function useBestiary() {
  const [entries, setEntries] = useState<BestiaryEntry[]>(getStoredBestiary);

  // Sync to localStorage when entries change
  useEffect(() => {
    saveBestiary(entries);
  }, [entries]);

  // Record an anomaly encounter
  const recordEncounter = useCallback((dna: AnomalyDNA) => {
    setEntries(prev => {
      const existingIndex = prev.findIndex(e => e.seed === dna.seed);
      
      if (existingIndex >= 0) {
        // Update existing entry
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          timesEncountered: updated[existingIndex].timesEncountered + 1,
        };
        return updated;
      }
      
      // Add new entry
      const newEntry: BestiaryEntry = {
        seed: dna.seed,
        name: getAnomalyName(dna),
        shape: dna.shape,
        behavior: dna.behavior,
        ability: dna.ability,
        hue: dna.hue,
        saturation: dna.saturation,
        discoveredAt: Date.now(),
        timesEncountered: 1,
        timesDefeated: 0,
      };
      
      return [...prev, newEntry];
    });
  }, []);

  // Record an anomaly defeat
  const recordDefeat = useCallback((seed: number) => {
    setEntries(prev => {
      const existingIndex = prev.findIndex(e => e.seed === seed);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          timesDefeated: updated[existingIndex].timesDefeated + 1,
        };
        return updated;
      }
      
      return prev;
    });
  }, []);

  // Get stats
  const stats = {
    totalDiscovered: entries.length,
    totalEncounters: entries.reduce((sum, e) => sum + e.timesEncountered, 0),
    totalDefeated: entries.reduce((sum, e) => sum + e.timesDefeated, 0),
  };

  // Clear bestiary (for testing)
  const clearBestiary = useCallback(() => {
    setEntries([]);
  }, []);

  return {
    entries,
    recordEncounter,
    recordDefeat,
    stats,
    clearBestiary,
  };
}

// Global functions for use in game logic (non-React context)
export function recordAnomalyEncounter(dna: AnomalyDNA): void {
  const entries = getStoredBestiary();
  const existingIndex = entries.findIndex(e => e.seed === dna.seed);
  
  if (existingIndex >= 0) {
    entries[existingIndex].timesEncountered += 1;
  } else {
    entries.push({
      seed: dna.seed,
      name: getAnomalyName(dna),
      shape: dna.shape,
      behavior: dna.behavior,
      ability: dna.ability,
      hue: dna.hue,
      saturation: dna.saturation,
      discoveredAt: Date.now(),
      timesEncountered: 1,
      timesDefeated: 0,
    });
  }
  
  saveBestiary(entries);
}

export function recordAnomalyDefeat(seed: number): void {
  const entries = getStoredBestiary();
  const existingIndex = entries.findIndex(e => e.seed === seed);
  
  if (existingIndex >= 0) {
    entries[existingIndex].timesDefeated += 1;
    saveBestiary(entries);
  }
}
