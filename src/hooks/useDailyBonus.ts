import { useState, useEffect, useCallback } from 'react';
import { addStoredScraps } from './useScrapCurrency';

const STORAGE_KEY = 'vector_maniac_daily_bonus';
const MIN_BONUS = 50;
const MAX_BONUS = 100;

interface DailyBonusState {
  lastClaimDate: string | null;
  streak: number;
}

export function useDailyBonus() {
  const [canClaim, setCanClaim] = useState(false);
  const [streak, setStreak] = useState(0);
  const [nextBonusAmount, setNextBonusAmount] = useState(MIN_BONUS);
  const [isLoading, setIsLoading] = useState(true);

  // Check if a new day has started (compare dates in local timezone)
  const isNewDay = useCallback((lastDate: string | null): boolean => {
    if (!lastDate) return true;
    
    const today = new Date().toDateString();
    return today !== lastDate;
  }, []);

  // Check if streak should continue (claimed yesterday)
  const isStreakValid = useCallback((lastDate: string | null): boolean => {
    if (!lastDate) return false;
    
    const last = new Date(lastDate);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    return last.toDateString() === yesterday.toDateString();
  }, []);

  // Calculate bonus amount based on streak
  const calculateBonus = useCallback((currentStreak: number): number => {
    // Base bonus 50-100, increases slightly with streak
    const streakBonus = Math.min(currentStreak * 5, 50); // Max 50 extra from streak
    const base = MIN_BONUS + Math.floor(Math.random() * (MAX_BONUS - MIN_BONUS + 1));
    return base + streakBonus;
  }, []);

  // Load state on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state: DailyBonusState = JSON.parse(stored);
        
        const newDay = isNewDay(state.lastClaimDate);
        setCanClaim(newDay);
        
        if (newDay) {
          // Check if streak continues
          const streakContinues = isStreakValid(state.lastClaimDate);
          const newStreak = streakContinues ? state.streak : 0;
          setStreak(newStreak);
          setNextBonusAmount(calculateBonus(newStreak));
        } else {
          setStreak(state.streak);
        }
      } else {
        // First time - can claim
        setCanClaim(true);
        setNextBonusAmount(calculateBonus(0));
      }
    } catch (error) {
      console.error('[DailyBonus] Failed to load:', error);
      setCanClaim(true);
    } finally {
      setIsLoading(false);
    }
  }, [isNewDay, isStreakValid, calculateBonus]);

  // Claim the daily bonus
  const claimBonus = useCallback((): number => {
    if (!canClaim) return 0;
    
    const amount = nextBonusAmount;
    const newStreak = streak + 1;
    
    // Add scraps
    addStoredScraps(amount);
    
    // Save state
    const state: DailyBonusState = {
      lastClaimDate: new Date().toDateString(),
      streak: newStreak,
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('[DailyBonus] Failed to save:', error);
    }
    
    setCanClaim(false);
    setStreak(newStreak);
    
    // Dispatch event so scrap display updates
    window.dispatchEvent(new CustomEvent('vector_maniac_scraps_changed'));
    
    return amount;
  }, [canClaim, nextBonusAmount, streak]);

  return {
    canClaim,
    streak,
    nextBonusAmount,
    isLoading,
    claimBonus,
  };
}
