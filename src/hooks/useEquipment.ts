import { useState, useEffect, useCallback } from 'react';

export interface EquipmentState {
  // Active skins
  activeShipSkin: string | null;
  
  // Active effects (from daily rewards)
  laserColor: string | null; // 'cyan' | null
  megaExplosion: boolean;
  roverSkin: string | null; // 'midnight_blue' | null
}

const STORAGE_KEY = 'galactic_overdrive_equipment';

const defaultEquipmentState: EquipmentState = {
  activeShipSkin: null,
  laserColor: null,
  megaExplosion: false,
  roverSkin: null,
};

export interface SkinOption {
  id: string;
  name: string;
  packId: string; // Which pack it belongs to
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
}

// Available skins from each pack
export const SHIP_SKINS: SkinOption[] = [
  // === FREE SKINS (always available) ===
  { 
    id: 'default', 
    name: 'STANDARD', 
    packId: 'default',
    colors: { primary: '#ffffff', secondary: '#cccccc', accent: '#ffaa00', glow: '#00ddff' }
  },
  { 
    id: 'void_hunter', 
    name: 'VOID HUNTER', 
    packId: 'default',
    colors: { primary: '#1a1a2e', secondary: '#16213e', accent: '#e94560', glow: '#e94560' }
  },
  
  // === NEON SHIPS PACK ===
  { 
    id: 'neon_cyan', 
    name: 'NEON CYAN', 
    packId: 'neon_ships',
    colors: { primary: '#00ffff', secondary: '#0088aa', accent: '#00ffff', glow: '#00ffff' }
  },
  { 
    id: 'neon_pink', 
    name: 'NEON PINK', 
    packId: 'neon_ships',
    colors: { primary: '#ff00ff', secondary: '#aa0088', accent: '#ff00ff', glow: '#ff00ff' }
  },
  { 
    id: 'neon_green', 
    name: 'NEON GREEN', 
    packId: 'neon_ships',
    colors: { primary: '#00ff00', secondary: '#008800', accent: '#00ff00', glow: '#00ff00' }
  },
  
  // === MOTHERSHIP SKINS PACK (8 skins) ===
  { 
    id: 'plasma_fury', 
    name: 'PLASMA FURY', 
    packId: 'mothership_skins',
    colors: { primary: '#ff6b35', secondary: '#f7c59f', accent: '#efefef', glow: '#ff6b35' }
  },
  { 
    id: 'arctic_phantom', 
    name: 'ARCTIC PHANTOM', 
    packId: 'mothership_skins',
    colors: { primary: '#a8d8ea', secondary: '#aa96da', accent: '#fcbad3', glow: '#a8d8ea' }
  },
  { 
    id: 'crimson_viper', 
    name: 'CRIMSON VIPER', 
    packId: 'mothership_skins',
    colors: { primary: '#8b0000', secondary: '#dc143c', accent: '#ff4444', glow: '#ff2222' }
  },
  { 
    id: 'emerald_dragon', 
    name: 'EMERALD DRAGON', 
    packId: 'mothership_skins',
    colors: { primary: '#2d5a27', secondary: '#228b22', accent: '#7cfc00', glow: '#00ff7f' }
  },
  { 
    id: 'nebula_drifter', 
    name: 'NEBULA DRIFTER', 
    packId: 'mothership_skins',
    colors: { primary: '#4a0e4e', secondary: '#812772', accent: '#c74b50', glow: '#ff69b4' }
  },
  { 
    id: 'thunder_hawk', 
    name: 'THUNDER HAWK', 
    packId: 'mothership_skins',
    colors: { primary: '#2c3e50', secondary: '#34495e', accent: '#f1c40f', glow: '#e67e22' }
  },
  { 
    id: 'cosmic_shadow', 
    name: 'COSMIC SHADOW', 
    packId: 'mothership_skins',
    colors: { primary: '#0d0d0d', secondary: '#1a1a1a', accent: '#8e44ad', glow: '#9b59b6' }
  },
  { 
    id: 'solar_phoenix', 
    name: 'SOLAR PHOENIX', 
    packId: 'mothership_skins',
    colors: { primary: '#ff8c00', secondary: '#ff4500', accent: '#ffe4b5', glow: '#ffff00' }
  },
  
  // === LUNAR EXPANSION (Moon Variants) ===
  { 
    id: 'moon_ice', 
    name: 'ICE SHARD', 
    packId: 'lunar_expansion',
    colors: { primary: '#aaddff', secondary: '#6699cc', accent: '#ffffff', glow: '#aaddff' }
  },
  { 
    id: 'moon_crystal', 
    name: 'CRYSTAL', 
    packId: 'lunar_expansion',
    colors: { primary: '#cc88ff', secondary: '#8844cc', accent: '#ff88ff', glow: '#cc88ff' }
  },
  { 
    id: 'moon_sulfur', 
    name: 'SULFUR', 
    packId: 'lunar_expansion',
    colors: { primary: '#ffdd44', secondary: '#aa8800', accent: '#ffff00', glow: '#ffdd44' }
  },
  
  // === ULTIMATE EDITION EXCLUSIVE ===
  { 
    id: 'golden', 
    name: 'GOLDEN DELUXE', 
    packId: 'ultimate_edition',
    colors: { primary: '#ffd700', secondary: '#b8860b', accent: '#ffff00', glow: '#ffd700' }
  },
  
  // === REMAINING FREE SKIN ===
  { 
    id: 'titanium_wraith', 
    name: 'TITANIUM WRAITH', 
    packId: 'default',
    colors: { primary: '#708090', secondary: '#4a4a4a', accent: '#c0c0c0', glow: '#87ceeb' }
  },
];

// Utility function to get active skin colors without hooks (for game rendering)
const EQUIPMENT_STORAGE_KEY = 'galactic_overdrive_equipment';

export function getStoredSkinColors(): { primary: string; secondary: string; accent: string; glow: string } {
  try {
    const stored = localStorage.getItem(EQUIPMENT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const skinId = parsed.activeShipSkin;
      if (skinId) {
        const skin = SHIP_SKINS.find(s => s.id === skinId);
        if (skin) return skin.colors;
      }
    }
  } catch (error) {
    console.error('[Equipment] Failed to get stored skin colors:', error);
  }
  return SHIP_SKINS[0].colors; // Default colors
}

export function useEquipment() {
  const [equipment, setEquipment] = useState<EquipmentState>(defaultEquipmentState);
  const [isLoading, setIsLoading] = useState(true);

  // Load equipment from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setEquipment({ ...defaultEquipmentState, ...parsed });
      }
    } catch (error) {
      console.error('[Equipment] Failed to load:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save equipment to localStorage
  const saveEquipment = useCallback((newEquipment: EquipmentState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newEquipment));
      setEquipment(newEquipment);
    } catch (error) {
      console.error('[Equipment] Failed to save:', error);
    }
  }, []);

  // Set active ship skin
  const setActiveShipSkin = useCallback((skinId: string | null) => {
    const newEquipment = { ...equipment, activeShipSkin: skinId };
    saveEquipment(newEquipment);
  }, [equipment, saveEquipment]);

  // Set laser color
  const setLaserColor = useCallback((color: string | null) => {
    const newEquipment = { ...equipment, laserColor: color };
    saveEquipment(newEquipment);
  }, [equipment, saveEquipment]);

  // Toggle mega explosion
  const setMegaExplosion = useCallback((enabled: boolean) => {
    const newEquipment = { ...equipment, megaExplosion: enabled };
    saveEquipment(newEquipment);
  }, [equipment, saveEquipment]);

  // Set rover skin
  const setRoverSkin = useCallback((skinId: string | null) => {
    const newEquipment = { ...equipment, roverSkin: skinId };
    saveEquipment(newEquipment);
  }, [equipment, saveEquipment]);

  // Get the current active skin details
  const getActiveSkin = useCallback((): SkinOption => {
    const skin = SHIP_SKINS.find(s => s.id === equipment.activeShipSkin);
    return skin || SHIP_SKINS[0]; // Default skin
  }, [equipment.activeShipSkin]);

  return {
    equipment,
    isLoading,
    setActiveShipSkin,
    setLaserColor,
    setMegaExplosion,
    setRoverSkin,
    getActiveSkin,
  };
}
