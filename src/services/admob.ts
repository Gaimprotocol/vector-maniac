/**
 * AdMob Integration Service
 * 
 * This service handles ads using Google AdMob SDK via Capacitor.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create an AdMob account at https://admob.google.com/
 * 2. Create an app and get your App ID
 * 3. Create ad units (rewarded, interstitial) and get their IDs
 * 4. Add the App ID to your native app configuration:
 *    - iOS: Add GADApplicationIdentifier to Info.plist
 *    - Android: Add meta-data to AndroidManifest.xml
 * 5. Replace test IDs below with your production IDs before release
 */

import { Capacitor } from '@capacitor/core';

// Test Ad Unit IDs (replace with production IDs before release!)
// These are official Google test IDs that always return test ads
export const AD_UNIT_IDS = {
  // iOS Test IDs
  IOS_REWARDED: 'ca-app-pub-3940256099942544/1712485313',
  IOS_INTERSTITIAL: 'ca-app-pub-3940256099942544/4411468910',
  IOS_BANNER: 'ca-app-pub-3940256099942544/2934735716',
  
  // Android Test IDs
  ANDROID_REWARDED: 'ca-app-pub-3940256099942544/5224354917',
  ANDROID_INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  ANDROID_BANNER: 'ca-app-pub-3940256099942544/6300978111',
} as const;

// Production Ad Unit IDs
export const PRODUCTION_AD_UNIT_IDS = {
  IOS_REWARDED: 'ca-app-pub-3616241599002222/2301915963',
  IOS_INTERSTITIAL: 'YOUR_IOS_INTERSTITIAL_AD_UNIT_ID', // TODO: Add when created
  ANDROID_REWARDED: 'YOUR_ANDROID_REWARDED_AD_UNIT_ID', // TODO: Add when created
  ANDROID_INTERSTITIAL: 'YOUR_ANDROID_INTERSTITIAL_AD_UNIT_ID', // TODO: Add when created
};

export interface AdMobConfig {
  useTestAds?: boolean;
  // Your production ad unit IDs
  iosRewardedAdUnitId?: string;
  iosInterstitialAdUnitId?: string;
  androidRewardedAdUnitId?: string;
  androidInterstitialAdUnitId?: string;
}

export interface AdResult {
  success: boolean;
  rewarded?: boolean;
  error?: string;
}

// Callback types for ad events
type AdEventCallback = () => void;
type AdErrorCallback = (error: any) => void;
type RewardCallback = (reward: { type: string; amount: number }) => void;

class AdMobService {
  private isInitialized = false;
  private AdMob: any = null;
  private config: AdMobConfig = { useTestAds: true };
  private rewardedAdLoaded = false;
  private interstitialAdLoaded = false;
  private isLoadingRewardedAd = false;
  private isLoadingInterstitialAd = false;
  
  // Event callbacks
  private onRewardedAdLoadedCallbacks: AdEventCallback[] = [];
  private onRewardedAdFailedCallbacks: AdErrorCallback[] = [];
  private onRewardedAdShownCallbacks: AdEventCallback[] = [];
  private onRewardedAdClosedCallbacks: AdEventCallback[] = [];
  private onRewardEarnedCallbacks: RewardCallback[] = [];

  /**
   * Check if running on a native platform
   */
  isNativePlatform(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Get the current platform
   */
  getPlatform(): 'ios' | 'android' | 'web' {
    const platform = Capacitor.getPlatform();
    if (platform === 'ios') return 'ios';
    if (platform === 'android') return 'android';
    return 'web';
  }

  /**
   * Get the appropriate ad unit ID based on platform and ad type
   */
  private getAdUnitId(type: 'rewarded' | 'interstitial' | 'banner'): string {
    const platform = this.getPlatform();
    const useTest = this.config.useTestAds;

    if (platform === 'ios') {
      switch (type) {
        case 'rewarded':
          return useTest ? AD_UNIT_IDS.IOS_REWARDED : (this.config.iosRewardedAdUnitId || AD_UNIT_IDS.IOS_REWARDED);
        case 'interstitial':
          return useTest ? AD_UNIT_IDS.IOS_INTERSTITIAL : (this.config.iosInterstitialAdUnitId || AD_UNIT_IDS.IOS_INTERSTITIAL);
        case 'banner':
          return AD_UNIT_IDS.IOS_BANNER;
      }
    } else {
      switch (type) {
        case 'rewarded':
          return useTest ? AD_UNIT_IDS.ANDROID_REWARDED : (this.config.androidRewardedAdUnitId || AD_UNIT_IDS.ANDROID_REWARDED);
        case 'interstitial':
          return useTest ? AD_UNIT_IDS.ANDROID_INTERSTITIAL : (this.config.androidInterstitialAdUnitId || AD_UNIT_IDS.ANDROID_INTERSTITIAL);
        case 'banner':
          return AD_UNIT_IDS.ANDROID_BANNER;
      }
    }
    return '';
  }

  /**
   * Initialize AdMob SDK
   */
  async initialize(config?: AdMobConfig): Promise<boolean> {
    if (!this.isNativePlatform()) {
      console.log('[AdMob] Not on native platform, using simulated ads');
      return false;
    }

    if (config) {
      this.config = { ...this.config, ...config };
    }

    try {
      // Dynamic import to avoid errors on web
      const { AdMob } = await import('@capacitor-community/admob');
      this.AdMob = AdMob;

      await AdMob.initialize({
        testingDevices: this.config.useTestAds ? ['EMULATOR'] : [],
        initializeForTesting: this.config.useTestAds,
      });

      // Set up event listeners
      this.setupEventListeners();

      this.isInitialized = true;
      console.log('[AdMob] Initialized successfully');

      // Pre-load ads
      await this.preloadAds();

      return true;
    } catch (error) {
      console.error('[AdMob] Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Set up AdMob event listeners
   */
  private setupEventListeners(): void {
    if (!this.AdMob) return;

    // Rewarded ad events
    this.AdMob.addListener('onRewardedVideoAdLoaded', () => {
      console.log('[AdMob] STATE: Rewarded ad LOADED');
      this.rewardedAdLoaded = true;
      this.isLoadingRewardedAd = false;
      this.onRewardedAdLoadedCallbacks.forEach(cb => cb());
    });

    this.AdMob.addListener('onRewardedVideoAdFailedToLoad', (error: any) => {
      console.log('[AdMob] STATE: Rewarded ad FAILED to load:', error);
      this.rewardedAdLoaded = false;
      this.isLoadingRewardedAd = false;
      this.onRewardedAdFailedCallbacks.forEach(cb => cb(error));
    });

    this.AdMob.addListener('onRewardedVideoAdOpened', () => {
      console.log('[AdMob] STATE: Rewarded ad SHOWN');
      this.onRewardedAdShownCallbacks.forEach(cb => cb());
    });

    this.AdMob.addListener('onRewardedVideoAdClosed', () => {
      console.log('[AdMob] STATE: Rewarded ad CLOSED');
      this.rewardedAdLoaded = false;
      this.onRewardedAdClosedCallbacks.forEach(cb => cb());
      // Auto-prepare next ad
      this.prepareRewardedAd();
    });

    this.AdMob.addListener('onRewardedVideoAdReward', (reward: any) => {
      console.log('[AdMob] STATE: Reward EARNED:', reward);
      this.onRewardEarnedCallbacks.forEach(cb => cb(reward));
    });

    // Interstitial ad events
    this.AdMob.addListener('onInterstitialAdLoaded', () => {
      console.log('[AdMob] STATE: Interstitial ad LOADED');
      this.interstitialAdLoaded = true;
      this.isLoadingInterstitialAd = false;
    });

    this.AdMob.addListener('onInterstitialAdFailedToLoad', (error: any) => {
      console.log('[AdMob] STATE: Interstitial ad FAILED to load:', error);
      this.interstitialAdLoaded = false;
      this.isLoadingInterstitialAd = false;
    });

    this.AdMob.addListener('onInterstitialAdClosed', () => {
      console.log('[AdMob] STATE: Interstitial ad CLOSED');
      this.interstitialAdLoaded = false;
      // Auto-prepare next ad
      this.prepareInterstitialAd();
    });
  }

  // Event subscription methods
  onRewardedAdLoaded(callback: AdEventCallback): () => void {
    this.onRewardedAdLoadedCallbacks.push(callback);
    return () => {
      this.onRewardedAdLoadedCallbacks = this.onRewardedAdLoadedCallbacks.filter(cb => cb !== callback);
    };
  }

  onRewardedAdFailed(callback: AdErrorCallback): () => void {
    this.onRewardedAdFailedCallbacks.push(callback);
    return () => {
      this.onRewardedAdFailedCallbacks = this.onRewardedAdFailedCallbacks.filter(cb => cb !== callback);
    };
  }

  onRewardedAdShown(callback: AdEventCallback): () => void {
    this.onRewardedAdShownCallbacks.push(callback);
    return () => {
      this.onRewardedAdShownCallbacks = this.onRewardedAdShownCallbacks.filter(cb => cb !== callback);
    };
  }

  onRewardedAdClosed(callback: AdEventCallback): () => void {
    this.onRewardedAdClosedCallbacks.push(callback);
    return () => {
      this.onRewardedAdClosedCallbacks = this.onRewardedAdClosedCallbacks.filter(cb => cb !== callback);
    };
  }

  onRewardEarned(callback: RewardCallback): () => void {
    this.onRewardEarnedCallbacks.push(callback);
    return () => {
      this.onRewardEarnedCallbacks = this.onRewardEarnedCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Pre-load ads for faster display
   */
  private async preloadAds(): Promise<void> {
    await Promise.all([
      this.prepareRewardedAd(),
      this.prepareInterstitialAd(),
    ]);
  }

  /**
   * Prepare a rewarded ad
   */
  async prepareRewardedAd(): Promise<boolean> {
    if (!this.isInitialized || !this.AdMob) {
      console.log('[AdMob] Cannot prepare: not initialized');
      return false;
    }

    if (this.rewardedAdLoaded) {
      console.log('[AdMob] Rewarded ad already loaded');
      return true;
    }

    if (this.isLoadingRewardedAd) {
      console.log('[AdMob] Rewarded ad already loading');
      return false;
    }

    try {
      console.log('[AdMob] STATE: Preparing rewarded ad...');
      this.isLoadingRewardedAd = true;
      await this.AdMob.prepareRewardVideoAd({
        adId: this.getAdUnitId('rewarded'),
        isTesting: this.config.useTestAds,
      });
      return true;
    } catch (error) {
      console.error('[AdMob] STATE: FAILED to prepare rewarded ad:', error);
      this.isLoadingRewardedAd = false;
      return false;
    }
  }

  /**
   * Check if rewarded ad is currently loading
   */
  isRewardedAdLoading(): boolean {
    return this.isLoadingRewardedAd;
  }

  /**
   * Show a rewarded ad - ONLY call if isRewardedAdReady() is true!
   * Reward is granted via onRewardEarned callback, NOT the return value.
   */
  async showRewardedAd(): Promise<AdResult> {
    if (!this.isNativePlatform()) {
      // Simulate ad on web for testing
      return this.simulateRewardedAd();
    }

    if (!this.isInitialized || !this.AdMob) {
      console.log('[AdMob] STATE: Cannot show - not initialized');
      return { success: false, error: 'AdMob not initialized' };
    }

    if (!this.rewardedAdLoaded) {
      console.log('[AdMob] STATE: Cannot show - ad not ready');
      return { success: false, error: 'Ad not ready' };
    }

    try {
      console.log('[AdMob] STATE: Showing rewarded ad...');
      await this.AdMob.showRewardVideoAd();
      // Note: Reward is granted via onRewardEarned event, not here
      // The ad closed event will trigger prepareRewardedAd automatically
      return { success: true };
    } catch (error: any) {
      console.error('[AdMob] STATE: FAILED to show rewarded ad:', error);
      this.rewardedAdLoaded = false;
      // Try to prepare next ad after failure
      this.prepareRewardedAd();
      return { success: false, error: error.message || 'Failed to show ad' };
    }
  }

  /**
   * Simulate a rewarded ad for web testing
   */
  private simulateRewardedAd(): Promise<AdResult> {
    return new Promise((resolve) => {
      console.log('[AdMob] Simulating rewarded ad (5 seconds)...');
      setTimeout(() => {
        resolve({ success: true, rewarded: true });
      }, 5000);
    });
  }

  /**
   * Prepare an interstitial ad
   */
  async prepareInterstitialAd(): Promise<boolean> {
    if (!this.isInitialized || !this.AdMob) {
      return false;
    }

    try {
      await this.AdMob.prepareInterstitial({
        adId: this.getAdUnitId('interstitial'),
        isTesting: this.config.useTestAds,
      });
      return true;
    } catch (error) {
      console.error('[AdMob] Failed to prepare interstitial ad:', error);
      return false;
    }
  }

  /**
   * Show an interstitial ad
   */
  async showInterstitialAd(): Promise<AdResult> {
    if (!this.isNativePlatform()) {
      // Skip interstitial on web
      console.log('[AdMob] Skipping interstitial on web');
      return { success: true };
    }

    if (!this.isInitialized || !this.AdMob) {
      return { success: false, error: 'AdMob not initialized' };
    }

    try {
      // Prepare ad if not loaded
      if (!this.interstitialAdLoaded) {
        await this.prepareInterstitialAd();
      }

      await this.AdMob.showInterstitial();
      
      // Prepare next ad
      this.interstitialAdLoaded = false;
      this.prepareInterstitialAd();

      return { success: true };
    } catch (error: any) {
      console.error('[AdMob] Failed to show interstitial ad:', error);
      return { success: false, error: error.message || 'Failed to show ad' };
    }
  }

  /**
   * Check if rewarded ad is ready
   */
  isRewardedAdReady(): boolean {
    return this.rewardedAdLoaded || !this.isNativePlatform();
  }

  /**
   * Check if interstitial ad is ready
   */
  isInterstitialAdReady(): boolean {
    return this.interstitialAdLoaded || !this.isNativePlatform();
  }
}

// Export singleton instance
export const adMobService = new AdMobService();
