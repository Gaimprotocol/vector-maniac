/**
 * Demo Mode Hook
 * 
 * Detects if the app is running in demo mode (no API keys configured)
 * and provides UI-friendly messaging.
 */

import { isDemoMode } from '@/services/nativeServices';
import { useMemo } from 'react';

export interface DemoModeInfo {
  isDemo: boolean;
  storeMessage: string;
  adsMessage: string;
  purchaseButtonText: string;
}

export function useDemoMode(): DemoModeInfo {
  return useMemo(() => {
    const isDemo = isDemoMode();
    
    return {
      isDemo,
      storeMessage: isDemo ? 'Demo Build — Purchases simulated' : '',
      adsMessage: isDemo ? 'Not available in demo build' : '',
      purchaseButtonText: isDemo ? 'DEMO' : 'BUY',
    };
  }, []);
}
