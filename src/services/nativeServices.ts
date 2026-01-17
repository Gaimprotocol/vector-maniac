/**
 * Native Services Initialization
 * 
 * This file initializes all native services (RevenueCat, AdMob) when the app starts.
 * 
 * CONFIGURATION:
 * Before releasing your app, you need to:
 * 1. Replace the RevenueCat API key with your production key
 * 2. Replace AdMob test IDs with your production ad unit IDs
 * 3. Set useTestAds to false
 */

import { revenueCatService } from './revenueCat';
import { adMobService } from './admob';

// Configuration flags
const IS_PRODUCTION = true; // Production build

// AdMob is enabled - GADApplicationIdentifier must be set in Info.plist
// App ID: ca-app-pub-3616241599002222~3878458185
const ENABLE_ADMOB = true;

// RevenueCat API Keys
const REVENUECAT_API_KEY = {
  ios: 'appl_WYUgtghbTtNmCRXZbKGhefiaTeO',
  android: 'test_rJViXzVPJPXDliAvECqwBSLYDfn', // Update when you have Android key
};

// AdMob Configuration
const ADMOB_CONFIG = {
  useTestAds: false,
  iosRewardedAdUnitId: 'ca-app-pub-3616241599002222/2301915963',
  iosInterstitialAdUnitId: '', // Not used
  androidRewardedAdUnitId: '', // Update when you have Android key
  androidInterstitialAdUnitId: '', // Not used
};

/**
 * Initialize all native services
 * Call this once when your app starts (e.g., in App.tsx or main.tsx)
 */
export async function initializeNativeServices(): Promise<void> {
  console.log('[NativeServices] Initializing...');

  // Initialize RevenueCat
  try {
    const platform = revenueCatService.isNativePlatform() 
      ? (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') ? 'ios' : 'android')
      : 'android';
    
    await revenueCatService.initialize({
      apiKey: REVENUECAT_API_KEY[platform as 'ios' | 'android'],
    });
  } catch (error) {
    console.error('[NativeServices] RevenueCat initialization failed:', error);
  }

  // Initialize AdMob
  if (ENABLE_ADMOB) {
    try {
      await adMobService.initialize(ADMOB_CONFIG);
    } catch (error) {
      console.error('[NativeServices] AdMob initialization failed:', error);
    }
  } else {
    console.log('[NativeServices] AdMob disabled (missing iOS GADApplicationIdentifier)');
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
