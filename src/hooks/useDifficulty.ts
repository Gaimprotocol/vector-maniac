import { useState, useEffect, useCallback } from 'react';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

const STORAGE_KEY = 'galactic_overdrive_difficulty';

export interface DifficultyMultipliers {
  enemySpawnRate: number;
  enemyDamage: number;
  enemyFireRate: number;
  enemySpeed: number;
  pickupChance: number;
}

// Difficulty multipliers relative to medium (1.0)
// Base damage +25%, base speed +15%, easy/hard scaled proportionally
const DIFFICULTY_SETTINGS: Record<DifficultyLevel, DifficultyMultipliers> = {
  easy: {
    enemySpawnRate: 0.7,    // 30% fewer enemies
    enemyDamage: 0.875,     // Base 1.25 * 0.7 = 0.875
    enemyFireRate: 0.7,     // 30% slower shooting
    enemySpeed: 0.98,       // Base 1.15 * 0.85 = 0.98
    pickupChance: 1.3,      // 30% more pickups
  },
  medium: {
    enemySpawnRate: 1.0,
    enemyDamage: 1.25,      // 25% more damage than before
    enemyFireRate: 1.0,
    enemySpeed: 1.15,       // 15% faster than before
    pickupChance: 1.0,
  },
  hard: {
    enemySpawnRate: 1.4,    // 40% more enemies
    enemyDamage: 1.75,      // Base 1.25 * 1.4 = 1.75
    enemyFireRate: 1.4,     // 40% faster shooting
    enemySpeed: 1.38,       // Base 1.15 * 1.2 = 1.38
    pickupChance: 0.7,      // 30% fewer pickups
  },
};

export function getDifficultyMultipliers(): DifficultyMultipliers {
  const stored = localStorage.getItem(STORAGE_KEY) as DifficultyLevel | null;
  const level = stored || 'medium';
  return DIFFICULTY_SETTINGS[level] || DIFFICULTY_SETTINGS.medium;
}

export function getStoredDifficulty(): DifficultyLevel {
  const stored = localStorage.getItem(STORAGE_KEY) as DifficultyLevel | null;
  return stored || 'medium';
}

export function useDifficulty() {
  const [difficulty, setDifficultyState] = useState<DifficultyLevel>(() => {
    return getStoredDifficulty();
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as DifficultyLevel | null;
    if (stored && ['easy', 'medium', 'hard'].includes(stored)) {
      setDifficultyState(stored);
    }
  }, []);

  const setDifficulty = useCallback((level: DifficultyLevel) => {
    localStorage.setItem(STORAGE_KEY, level);
    setDifficultyState(level);
  }, []);

  const multipliers = DIFFICULTY_SETTINGS[difficulty];

  return {
    difficulty,
    setDifficulty,
    multipliers,
  };
}
