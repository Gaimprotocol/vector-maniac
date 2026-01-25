import { useState, useEffect, useCallback } from 'react';
import { revenueCatService, PRODUCT_IDS } from '@/services/revenueCat';

export interface PurchaseState {
  skins: boolean;
  ships: boolean;
  sound: boolean;
  survival: boolean;
  ultimate: boolean;
}

const STORAGE_KEY = 'galactic_overdrive_purchases';

const defaultPurchaseState: PurchaseState = {
  skins: false,
  ships: false,
  sound: false,
  survival: false,
  ultimate: false,
};

export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  icon: string;
  type: 'unlock' | 'cosmetic' | 'bundle' | 'mode' | 'scraps';
  scrapAmount?: number; // For scrap pack products
}

// Default prices (fallback for web/testing only)
const DEFAULT_PRICES: Record<string, string> = {
  skins: '$0.99',
  ships: '$2.99',
  sound: '$1.99',
  survival: '$1.99',
  ultimate: '$4.99',
  scraps_small: '$0.99',
  scraps_medium: '$2.99',
  scraps_large: '$4.99',
  random_evolve: '$1.99',
};

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 'ships',
    name: 'SHIPS MEGA PACK',
    description: '6 unique ships with special abilities',
    price: DEFAULT_PRICES.ships,
    icon: '▷',
    type: 'bundle',
  },
  {
    id: 'scraps_small',
    name: 'SCRAP CRATE',
    description: '500 scraps to upgrade your ship',
    price: DEFAULT_PRICES.scraps_small,
    icon: '◇',
    type: 'scraps',
    scrapAmount: 500,
  },
  {
    id: 'scraps_medium',
    name: 'SCRAP CONTAINER',
    description: '2000 scraps + 20% bonus',
    price: DEFAULT_PRICES.scraps_medium,
    icon: '◈',
    type: 'scraps',
    scrapAmount: 2400,
  },
  {
    id: 'scraps_large',
    name: 'SCRAP MOTHERLODE',
    description: '5000 scraps + 40% bonus',
    price: DEFAULT_PRICES.scraps_large,
    icon: '◆',
    type: 'scraps',
    scrapAmount: 7000,
  },
  {
    id: 'random_evolve',
    name: 'MYSTERY UPGRADE',
    description: 'Random upgrade boost (+1-3 levels)',
    price: DEFAULT_PRICES.random_evolve,
    icon: '◎',
    type: 'bundle',
  },
];

// Mutable prices that get updated from RevenueCat
let localizedPrices: Record<string, string> = { ...DEFAULT_PRICES };

// Get products with localized prices
export const getVisibleProducts = (): ShopProduct[] => {
  return SHOP_PRODUCTS.map(product => ({
    ...product,
    price: localizedPrices[product.id] || product.price,
  }));
};

// Update prices from RevenueCat offerings
export const updateLocalizedPrices = (prices: Record<string, string>) => {
  localizedPrices = { ...DEFAULT_PRICES, ...prices };
};

export function usePurchases() {
  const [purchases, setPurchases] = useState<PurchaseState>(defaultPurchaseState);
  const [isLoading, setIsLoading] = useState(true);
  const [isNative, setIsNative] = useState(false);
  const [pricesLoaded, setPricesLoaded] = useState(false);

  // Load purchases and prices from RevenueCat on mount
  useEffect(() => {
    const loadPurchases = async () => {
      try {
        // Check if we're on native platform
        const native = revenueCatService.isNativePlatform();
        setIsNative(native);

        if (native) {
          // Fetch localized prices from RevenueCat
          const prices = await revenueCatService.getLocalizedPrices();
          if (Object.keys(prices).length > 0) {
            updateLocalizedPrices(prices);
            setPricesLoaded(true);
          }

          // Load entitlements from RevenueCat
          const entitlements = await revenueCatService.getActiveEntitlements();
          const loadedPurchases: PurchaseState = {
            skins: !!entitlements[PRODUCT_IDS.SKINS],
            ships: !!entitlements[PRODUCT_IDS.SHIPS],
            sound: !!entitlements[PRODUCT_IDS.SOUND],
            survival: !!entitlements[PRODUCT_IDS.SURVIVAL],
            ultimate: !!entitlements[PRODUCT_IDS.ULTIMATE],
          };
          
          // If ultimate edition, unlock everything
          if (loadedPurchases.ultimate) {
            loadedPurchases.skins = true;
            loadedPurchases.ships = true;
            loadedPurchases.sound = true;
            loadedPurchases.survival = true;
          }
          
          setPurchases(loadedPurchases);
          // Also save to localStorage as backup
          localStorage.setItem(STORAGE_KEY, JSON.stringify(loadedPurchases));
        } else {
          // Load from localStorage (web/testing)
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            setPurchases({ ...defaultPurchaseState, ...parsed });
          }
        }
      } catch (error) {
        console.error('[Purchases] Failed to load:', error);
        // Fallback to localStorage
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            setPurchases({ ...defaultPurchaseState, ...parsed });
          }
        } catch (e) {
          console.error('[Purchases] Fallback load failed:', e);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPurchases();
  }, []);

  // Save purchases to localStorage
  const savePurchases = useCallback((newPurchases: PurchaseState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPurchases));
      setPurchases(newPurchases);
    } catch (error) {
      console.error('[Purchases] Failed to save:', error);
    }
  }, []);

  // Generic purchase handler
  const purchaseProduct = useCallback(async (productId: string): Promise<boolean> => {
    console.log(`[IAP] Processing purchase: ${productId}`);
    
    if (isNative) {
      // Use RevenueCat for native purchases
      const result = await revenueCatService.purchaseProduct(productId);
      
      if (result.success) {
        // Update local state
        let newPurchases = { ...purchases };
        
        switch (productId) {
          case 'skins':
            newPurchases.skins = true;
            break;
          case 'ships':
            newPurchases.ships = true;
            break;
          case 'sound':
            newPurchases.sound = true;
            break;
          case 'survival':
            newPurchases.survival = true;
            break;
          case 'ultimate':
            newPurchases.skins = true;
            newPurchases.ships = true;
            newPurchases.sound = true;
            newPurchases.survival = true;
            newPurchases.ultimate = true;
            break;
        }
        
        savePurchases(newPurchases);
        return true;
      }
      
      return false;
    }
    
    // Web/testing mode - simulate purchase
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let newPurchases = { ...purchases };
    let success = false;

    switch (productId) {
      case 'skins':
        newPurchases.skins = true;
        success = true;
        break;
      case 'ships':
        newPurchases.ships = true;
        success = true;
        break;
      case 'sound':
        newPurchases.sound = true;
        success = true;
        break;
      case 'survival':
        newPurchases.survival = true;
        success = true;
        break;
      case 'ultimate':
        newPurchases.skins = true;
        newPurchases.ships = true;
        newPurchases.sound = true;
        newPurchases.survival = true;
        newPurchases.ultimate = true;
        success = true;
        break;
      case 'scraps_small':
      case 'scraps_medium':
      case 'scraps_large':
      case 'random_evolve':
        // Consumable products - always allow purchase
        success = true;
        break;
      default:
        console.warn(`[IAP] Unknown product: ${productId}`);
        return false;
    }

    if (success) {
      savePurchases(newPurchases);
      console.log(`[IAP] Purchase successful: ${productId}`);
    }
    
    return success;
  }, [purchases, savePurchases, isNative]);

  // Restore purchases
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    console.log('[IAP] Restoring purchases...');
    
    if (isNative) {
      const restored = await revenueCatService.restorePurchases();
      
      const newPurchases: PurchaseState = {
        skins: !!restored[PRODUCT_IDS.SKINS],
        ships: !!restored[PRODUCT_IDS.SHIPS],
        sound: !!restored[PRODUCT_IDS.SOUND],
        survival: !!restored[PRODUCT_IDS.SURVIVAL],
        ultimate: !!restored[PRODUCT_IDS.ULTIMATE],
      };
      
      // If ultimate edition, unlock everything
      if (newPurchases.ultimate) {
        newPurchases.skins = true;
        newPurchases.ships = true;
        newPurchases.sound = true;
        newPurchases.survival = true;
      }
      
      savePurchases(newPurchases);
      return Object.values(restored).some(v => v);
    }
    
    // Web mode - just reload from localStorage
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPurchases({ ...defaultPurchaseState, ...parsed });
        console.log('[IAP] Purchases restored successfully');
        return true;
      }
    } catch (error) {
      console.error('[IAP] Restore failed:', error);
    }
    return false;
  }, [isNative, savePurchases]);

  // Check if a specific product is owned
  const isOwned = useCallback((productId: string): boolean => {
    // Ultimate edition unlocks everything
    if (purchases.ultimate && productId !== 'ultimate') {
      return true;
    }
    
    switch (productId) {
      case 'skins':
        return purchases.skins;
      case 'ships':
        return purchases.ships;
      case 'sound':
        return purchases.sound;
      case 'survival':
        return purchases.survival;
      case 'ultimate':
        return purchases.ultimate;
      default:
        return false;
    }
  }, [purchases]);

  // Check if ads should be shown (always show since no remove_ads product)
  const shouldShowAds = useCallback((): boolean => {
    return !purchases.ultimate;
  }, [purchases]);

  // Check if survival mode is available
  const hasSurvivalMode = useCallback((): boolean => {
    return purchases.survival || purchases.ultimate;
  }, [purchases]);

  // Check if ships mega pack is available
  const hasShipsMegaPack = useCallback((): boolean => {
    return purchases.ships || purchases.ultimate;
  }, [purchases]);

  // Check if golden skin is available (only with ultimate edition)
  const hasGoldenSkin = useCallback((): boolean => {
    return purchases.ultimate;
  }, [purchases]);

  // Check if soundtrack pack is available
  const hasSoundtrackPack = useCallback((): boolean => {
    return purchases.sound || purchases.ultimate;
  }, [purchases]);

  // Check if mothership skins are available
  const hasMothershipSkins = useCallback((): boolean => {
    return purchases.skins || purchases.ultimate;
  }, [purchases]);

  return {
    purchases,
    isLoading,
    isNative,
    pricesLoaded,
    purchaseProduct,
    restorePurchases,
    isOwned,
    shouldShowAds,
    hasSurvivalMode,
    hasShipsMegaPack,
    hasGoldenSkin,
    hasSoundtrackPack,
    hasMothershipSkins,
  };
}
