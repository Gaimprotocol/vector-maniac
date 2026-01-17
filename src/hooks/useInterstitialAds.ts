import { useCallback, useRef } from 'react';
import { adMobService } from '@/services/admob';
import { usePurchases } from './usePurchases';

/**
 * Hook to manage interstitial ads between levels
 * Shows an interstitial ad every N levels (configurable)
 */
export function useInterstitialAds(levelsBeforeAd: number = 3) {
  const { shouldShowAds } = usePurchases();
  const levelsSinceLastAd = useRef(0);

  /**
   * Call this when a level is completed
   * Interstitial ads are currently disabled - only rewarded ads are used
   */
  const onLevelComplete = useCallback(async (): Promise<boolean> => {
    // Interstitial ads disabled - we only use rewarded ads now
    return false;
  }, []);

  /**
   * Reset the level counter (e.g., when starting a new game)
   */
  const resetCounter = useCallback(() => {
    levelsSinceLastAd.current = 0;
  }, []);

  /**
   * Force show an interstitial ad
   */
  const forceShowAd = useCallback(async (): Promise<boolean> => {
    if (!shouldShowAds()) {
      return false;
    }

    try {
      const result = await adMobService.showInterstitialAd();
      levelsSinceLastAd.current = 0;
      return result.success;
    } catch (error) {
      console.error('[InterstitialAds] Failed to show ad:', error);
      return false;
    }
  }, [shouldShowAds]);

  return {
    onLevelComplete,
    resetCounter,
    forceShowAd,
    isAdFree: !shouldShowAds(),
  };
}
