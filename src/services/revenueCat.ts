/**
 * RevenueCat Integration Service
 * 
 * This service handles in-app purchases using RevenueCat SDK.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a RevenueCat account at https://www.revenuecat.com/
 * 2. Create a project and get your API keys
 * 3. Add your products in RevenueCat dashboard
 * 4. Configure entitlements to match product IDs below
 * 5. Add API keys to your app configuration
 */

import { Capacitor } from '@capacitor/core';

// Product identifiers - must match RevenueCat dashboard
export const PRODUCT_IDS = {
  SKINS: 'skins',
  SHIPS: 'ships',
  SOUND: 'sound',
  SURVIVAL: 'survival',
  ULTIMATE: 'ultimate',
} as const;

// Entitlement identifiers - must match RevenueCat dashboard
export const ENTITLEMENT_IDS = {
  SKINS: 'skins',
  SHIPS: 'ships',
  SOUND: 'sound',
  SURVIVAL: 'survival',
  ULTIMATE: 'ultimate',
} as const;

export interface RevenueCatConfig {
  apiKey: string;
  appUserId?: string;
}

export interface PurchaseResult {
  success: boolean;
  error?: string;
  productId?: string;
}

export interface EntitlementInfo {
  isActive: boolean;
  productId: string;
  expirationDate?: string;
}

class RevenueCatService {
  private isInitialized = false;
  private Purchases: any = null;

  /**
   * Check if running on a native platform (iOS/Android)
   */
  isNativePlatform(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Initialize RevenueCat SDK
   * Call this once when your app starts
   */
  async initialize(config: RevenueCatConfig): Promise<boolean> {
    if (!this.isNativePlatform()) {
      console.log('[RevenueCat] Not on native platform, using mock purchases');
      return false;
    }

    try {
      // Dynamic import to avoid errors on web
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      this.Purchases = Purchases;

      await Purchases.configure({
        apiKey: config.apiKey,
        appUserID: config.appUserId,
      });

      this.isInitialized = true;
      console.log('[RevenueCat] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[RevenueCat] Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Get all available products/offerings
   */
  async getOfferings(): Promise<any> {
    if (!this.isInitialized || !this.Purchases) {
      console.log('[RevenueCat] Not initialized, returning empty offerings');
      return null;
    }

    try {
      const offerings = await this.Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error('[RevenueCat] Failed to get offerings:', error);
      return null;
    }
  }

  /**
   * Get localized prices for all products
   * Returns a map of product ID to localized price string (e.g., "9 kr", "€0.99")
   */
  async getLocalizedPrices(): Promise<Record<string, string>> {
    if (!this.isInitialized || !this.Purchases) {
      console.log('[RevenueCat] Not initialized, returning empty prices');
      return {};
    }

    try {
      const offerings = await this.Purchases.getOfferings();
      const packages = offerings.current?.availablePackages || [];
      const prices: Record<string, string> = {};

      packages.forEach((pkg: any) => {
        const productId = pkg.product.identifier;
        const priceString = pkg.product.priceString;
        if (productId && priceString) {
          prices[productId] = priceString;
        }
      });

      console.log('[RevenueCat] Localized prices:', prices);
      return prices;
    } catch (error) {
      console.error('[RevenueCat] Failed to get prices:', error);
      return {};
    }
  }

  /**
   * Purchase a product
   */
  async purchaseProduct(productId: string): Promise<PurchaseResult> {
    if (!this.isInitialized || !this.Purchases) {
      console.log('[RevenueCat] Not initialized, using mock purchase');
      // Return success for testing on web
      return { success: true, productId };
    }

    try {
      const offerings = await this.Purchases.getOfferings();
      const product = offerings.current?.availablePackages?.find(
        (pkg: any) => pkg.product.identifier === productId
      );

      if (!product) {
        return { success: false, error: 'Product not found' };
      }

      const { customerInfo } = await this.Purchases.purchasePackage({ aPackage: product });
      
      // Check if the entitlement is now active
      const entitlement = customerInfo.entitlements.active[productId];
      if (entitlement) {
        return { success: true, productId };
      }

      return { success: false, error: 'Purchase completed but entitlement not found' };
    } catch (error: any) {
      // Handle user cancellation
      if (error.code === 'PURCHASE_CANCELLED') {
        return { success: false, error: 'Purchase cancelled' };
      }
      console.error('[RevenueCat] Purchase failed:', error);
      return { success: false, error: error.message || 'Purchase failed' };
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<Record<string, boolean>> {
    if (!this.isInitialized || !this.Purchases) {
      console.log('[RevenueCat] Not initialized, returning empty purchases');
      return {};
    }

    try {
      const { customerInfo } = await this.Purchases.restorePurchases();
      const activeEntitlements: Record<string, boolean> = {};

      Object.keys(customerInfo.entitlements.active).forEach((key) => {
        activeEntitlements[key] = true;
      });

      console.log('[RevenueCat] Restored purchases:', activeEntitlements);
      return activeEntitlements;
    } catch (error) {
      console.error('[RevenueCat] Restore failed:', error);
      return {};
    }
  }

  /**
   * Check if user has an active entitlement
   */
  async checkEntitlement(entitlementId: string): Promise<boolean> {
    if (!this.isInitialized || !this.Purchases) {
      return false;
    }

    try {
      const { customerInfo } = await this.Purchases.getCustomerInfo();
      return !!customerInfo.entitlements.active[entitlementId];
    } catch (error) {
      console.error('[RevenueCat] Failed to check entitlement:', error);
      return false;
    }
  }

  /**
   * Get all active entitlements
   */
  async getActiveEntitlements(): Promise<Record<string, EntitlementInfo>> {
    if (!this.isInitialized || !this.Purchases) {
      return {};
    }

    try {
      const { customerInfo } = await this.Purchases.getCustomerInfo();
      const active: Record<string, EntitlementInfo> = {};

      Object.entries(customerInfo.entitlements.active).forEach(([key, value]: [string, any]) => {
        active[key] = {
          isActive: true,
          productId: value.productIdentifier,
          expirationDate: value.expirationDate,
        };
      });

      return active;
    } catch (error) {
      console.error('[RevenueCat] Failed to get entitlements:', error);
      return {};
    }
  }

  /**
   * Set user ID for tracking
   */
  async setUserId(userId: string): Promise<void> {
    if (!this.isInitialized || !this.Purchases) {
      return;
    }

    try {
      await this.Purchases.logIn({ appUserID: userId });
    } catch (error) {
      console.error('[RevenueCat] Failed to set user ID:', error);
    }
  }

  /**
   * Log out current user
   */
  async logout(): Promise<void> {
    if (!this.isInitialized || !this.Purchases) {
      return;
    }

    try {
      await this.Purchases.logOut();
    } catch (error) {
      console.error('[RevenueCat] Failed to log out:', error);
    }
  }
}

// Export singleton instance
export const revenueCatService = new RevenueCatService();
