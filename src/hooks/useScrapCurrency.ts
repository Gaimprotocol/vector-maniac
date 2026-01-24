import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'vector_maniac_scraps';

export function useScrapCurrency() {
  const [scraps, setScraps] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  // Keep a synchronous ref so callers can get immediate success/fail answers.
  // This avoids relying on React state update timing (important on mobile Safari / concurrent rendering).
  const scrapsRef = useRef<number>(0);

  useEffect(() => {
    scrapsRef.current = scraps;
  }, [scraps]);

  // Load scraps from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const value = parseInt(stored, 10);
        if (!isNaN(value) && value >= 0) {
          setScraps(value);
          scrapsRef.current = value;
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
      scrapsRef.current = safeValue;
    } catch (error) {
      console.error('[Scraps] Failed to save:', error);
    }
  }, []);

  // Add scraps (from game or purchase)
  const addScraps = useCallback((amount: number) => {
    const next = Math.max(0, Math.floor(scrapsRef.current + amount));
    scrapsRef.current = next;
    try {
      localStorage.setItem(STORAGE_KEY, next.toString());
    } catch (error) {
      console.error('[Scraps] Failed to persist add (UI still updated):', error);
    }
    setScraps(next);
  }, []);

  // Spend scraps (returns true if successful)
  const spendScraps = useCallback((amount: number): boolean => {
    const current = scrapsRef.current;
    if (current < amount) return false;

    const next = Math.max(0, Math.floor(current - amount));
    scrapsRef.current = next;
    try {
      localStorage.setItem(STORAGE_KEY, next.toString());
    } catch (error) {
      console.error('[Scraps] Failed to persist spend (UI still updated):', error);
    }
    setScraps(next);
    return true;
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
