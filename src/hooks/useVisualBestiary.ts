// Visual Bestiary Hook - Tracks discovered background and hyperspace anomalies
import { useState, useEffect, useCallback } from 'react';
import { 
  BackgroundAnomalyDNA, 
  HyperspaceAnomalyDNA,
  generateBackgroundAnomalyDNA,
  generateHyperspaceAnomalyDNA
} from '@/game/vectorManiac/visualAnomalyGenerator';

export interface VisualBestiaryEntry {
  seed: number;
  name: string;
  type: 'background' | 'hyperspace';
  discoveredAt: number;
  timesVisited: number;
  // Store key visual properties for display
  primaryHue: number;
  secondaryHue: number;
  pattern?: string;  // For backgrounds
  effect?: string;   // For hyperspace
}

const VISUAL_BESTIARY_KEY = 'vector_maniac_visual_bestiary';

// Get stored visual bestiary from localStorage
function getStoredVisualBestiary(): VisualBestiaryEntry[] {
  try {
    const stored = localStorage.getItem(VISUAL_BESTIARY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('[VisualBestiary] Failed to load:', e);
  }
  return [];
}

// Save visual bestiary to localStorage
function saveVisualBestiary(entries: VisualBestiaryEntry[]): void {
  try {
    localStorage.setItem(VISUAL_BESTIARY_KEY, JSON.stringify(entries));
  } catch (e) {
    console.warn('[VisualBestiary] Failed to save:', e);
  }
}

export function useVisualBestiary() {
  const [entries, setEntries] = useState<VisualBestiaryEntry[]>(getStoredVisualBestiary);

  // Sync to localStorage when entries change
  useEffect(() => {
    saveVisualBestiary(entries);
  }, [entries]);

  // Record a background anomaly visit
  const recordBackgroundVisit = useCallback((dna: BackgroundAnomalyDNA) => {
    setEntries(prev => {
      const existingIndex = prev.findIndex(e => e.seed === dna.seed && e.type === 'background');
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          timesVisited: updated[existingIndex].timesVisited + 1,
        };
        return updated;
      }
      
      const newEntry: VisualBestiaryEntry = {
        seed: dna.seed,
        name: dna.name,
        type: 'background',
        discoveredAt: Date.now(),
        timesVisited: 1,
        primaryHue: dna.primaryHue,
        secondaryHue: dna.secondaryHue,
        pattern: dna.pattern,
      };
      
      return [...prev, newEntry];
    });
  }, []);

  // Record a hyperspace anomaly visit
  const recordHyperspaceVisit = useCallback((dna: HyperspaceAnomalyDNA) => {
    setEntries(prev => {
      const existingIndex = prev.findIndex(e => e.seed === dna.seed && e.type === 'hyperspace');
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          timesVisited: updated[existingIndex].timesVisited + 1,
        };
        return updated;
      }
      
      const newEntry: VisualBestiaryEntry = {
        seed: dna.seed,
        name: dna.name,
        type: 'hyperspace',
        discoveredAt: Date.now(),
        timesVisited: 1,
        primaryHue: dna.primaryHue,
        secondaryHue: dna.secondaryHue,
        effect: dna.effect,
      };
      
      return [...prev, newEntry];
    });
  }, []);

  // Get stats
  const stats = {
    backgroundsDiscovered: entries.filter(e => e.type === 'background').length,
    hyperspacesDiscovered: entries.filter(e => e.type === 'hyperspace').length,
    totalVisits: entries.reduce((sum, e) => sum + e.timesVisited, 0),
  };

  // Clear bestiary (for testing)
  const clearVisualBestiary = useCallback(() => {
    setEntries([]);
  }, []);

  return {
    entries,
    recordBackgroundVisit,
    recordHyperspaceVisit,
    stats,
    clearVisualBestiary,
  };
}

// Global functions for use in game logic (non-React context)
export function recordBackgroundAnomalyVisit(dna: BackgroundAnomalyDNA): void {
  const entries = getStoredVisualBestiary();
  const existingIndex = entries.findIndex(e => e.seed === dna.seed && e.type === 'background');
  
  if (existingIndex >= 0) {
    entries[existingIndex].timesVisited += 1;
  } else {
    entries.push({
      seed: dna.seed,
      name: dna.name,
      type: 'background',
      discoveredAt: Date.now(),
      timesVisited: 1,
      primaryHue: dna.primaryHue,
      secondaryHue: dna.secondaryHue,
      pattern: dna.pattern,
    });
  }
  
  saveVisualBestiary(entries);
}

export function recordHyperspaceAnomalyVisit(dna: HyperspaceAnomalyDNA): void {
  const entries = getStoredVisualBestiary();
  const existingIndex = entries.findIndex(e => e.seed === dna.seed && e.type === 'hyperspace');
  
  if (existingIndex >= 0) {
    entries[existingIndex].timesVisited += 1;
  } else {
    entries.push({
      seed: dna.seed,
      name: dna.name,
      type: 'hyperspace',
      discoveredAt: Date.now(),
      timesVisited: 1,
      primaryHue: dna.primaryHue,
      secondaryHue: dna.secondaryHue,
      effect: dna.effect,
    });
  }
  
  saveVisualBestiary(entries);
}
