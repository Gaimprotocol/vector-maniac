import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'vector_maniac_scraps';

export function useScrapCurrency() {
  const [scraps, setScraps] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load scraps from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const value = parseInt(stored, 10);
        if (!isNaN(value) && value >= 0) {
          setScraps(value);
        }
      }
    } catch (error) {
      console.error('[Scraps] Failed to load:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save scraps to localStorage
  const saveScraps = useCallback((newValue: number) => {
    try {
      const safeValue = Math.max(0, Math.floor(newValue));
      localStorage.setItem(STORAGE_KEY, safeValue.toString());
      setScraps(safeValue);
    } catch (error) {
      console.error('[Scraps] Failed to save:', error);
    }
  }, []);

  // Add scraps (from game or purchase)
  const addScraps = useCallback((amount: number) => {
    setScraps(current => {
      const newValue = current + amount;
      localStorage.setItem(STORAGE_KEY, newValue.toString());
      return newValue;
    });
  }, []);

  // Spend scraps (returns true if successful)
  const spendScraps = useCallback((amount: number): boolean => {
    let success = false;
    setScraps(current => {
      if (current >= amount) {
        const newValue = current - amount;
        localStorage.setItem(STORAGE_KEY, newValue.toString());
        success = true;
        return newValue;
      }
      return current;
    });
    return success;
  }, []);

  // Check if can afford
  const canAfford = useCallback((amount: number): boolean => {
    return scraps >= amount;
  }, [scraps]);

  return {
    scraps,
    isLoading,
    addScraps,
    spendScraps,
    canAfford,
    saveScraps,
  };
}

// Utility function to get scraps without hook (for game logic)
export function getStoredScraps(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const value = parseInt(stored, 10);
      if (!isNaN(value) && value >= 0) {
        return value;
      }
    }
  } catch (error) {
    console.error('[Scraps] Failed to get stored value:', error);
  }
  return 0;
}

// Utility function to add scraps without hook (for game over screen)
export function addStoredScraps(amount: number): void {
  try {
    const current = getStoredScraps();
    const newValue = current + amount;
    localStorage.setItem(STORAGE_KEY, newValue.toString());
  } catch (error) {
    console.error('[Scraps] Failed to add:', error);
  }
}
