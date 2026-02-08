/**
 * Native Services Initialization
 * 
 * This file initializes all native services (RevenueCat, AdMob) when the app starts.
 * 
 * CONFIGURATION:
 * Set environment variables in .env file (see .env.example for template).
 * The app will work in demo mode if keys are not provided.
 */

import { revenueCatService } from './revenueCat';
import { adMobService } from './admob';

// Check if we have valid configuration from environment
const getEnvVar = (key: string): string => {
  const value = import.meta.env[key];
  return typeof value === 'string' && value.length > 0 && !value.startsWith('your_') ? value : '';
};

// RevenueCat API Keys from environment
const REVENUECAT_IOS_KEY = getEnvVar('VITE_REVENUECAT_IOS_KEY');
const REVENUECAT_ANDROID_KEY = getEnvVar('VITE_REVENUECAT_ANDROID_KEY');

// AdMob Configuration from environment
const ADMOB_IOS_REWARDED = getEnvVar('VITE_ADMOB_IOS_REWARDED_ID');
const ADMOB_ANDROID_REWARDED = getEnvVar('VITE_ADMOB_ANDROID_REWARDED_ID');
const ENABLE_ADS = getEnvVar('VITE_ENABLE_ADS') !== 'false';
const USE_TEST_ADS = getEnvVar('VITE_USE_TEST_ADS') === 'true';

// Demo mode detection
export const isDemoMode = (): boolean => {
  // Demo mode if no RevenueCat keys are configured
  const hasRevenueCat = REVENUECAT_IOS_KEY || REVENUECAT_ANDROID_KEY;
  const hasAdMob = ADMOB_IOS_REWARDED || ADMOB_ANDROID_REWARDED;
  return !hasRevenueCat && !hasAdMob;
};

/**
 * Initialize all native services
 * Call this once when your app starts (e.g., in App.tsx or main.tsx)
 * 
 * Fails gracefully if keys are not configured - app will work in demo mode.
 */
export async function initializeNativeServices(): Promise<void> {
  console.log('[NativeServices] Initializing...');
  
  if (isDemoMode()) {
    console.log('[NativeServices] Running in demo mode (no API keys configured)');
    return;
  }

  // Initialize RevenueCat if key is available
  const revenueCatKey = navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')
    ? REVENUECAT_IOS_KEY
    : REVENUECAT_ANDROID_KEY;
    
  if (revenueCatKey) {
    try {
      await revenueCatService.initialize({ apiKey: revenueCatKey });
    } catch (error) {
      console.warn('[NativeServices] RevenueCat initialization skipped:', error);
    }
  } else {
    console.log('[NativeServices] RevenueCat: No API key configured');
  }

  // Initialize AdMob if enabled and keys available
  if (ENABLE_ADS) {
    const hasAdMobKeys = ADMOB_IOS_REWARDED || ADMOB_ANDROID_REWARDED;
    if (hasAdMobKeys) {
      try {
        await adMobService.initialize({
          useTestAds: USE_TEST_ADS,
          iosRewardedAdUnitId: ADMOB_IOS_REWARDED,
          androidRewardedAdUnitId: ADMOB_ANDROID_REWARDED,
        });
      } catch (error) {
        console.warn('[NativeServices] AdMob initialization skipped:', error);
      }
    } else {
      console.log('[NativeServices] AdMob: No ad unit IDs configured');
    }
  } else {
    console.log('[NativeServices] AdMob: Disabled via VITE_ENABLE_ADS');
  }

  console.log('[NativeServices] Initialization complete');
}

/**
 * Check if native services are available
 */
export function isNativeServicesAvailable(): boolean {
  return revenueCatService.isNativePlatform();
}

// Export services for direct access
export { revenueCatService, adMobService };
