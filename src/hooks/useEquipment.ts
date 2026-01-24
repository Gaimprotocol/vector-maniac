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

// Available skins from each pack - Vector Maniac theme (neon green palette)
export const SHIP_SKINS: SkinOption[] = [
  // === FREE SKINS (always available) ===
  { 
    id: 'default', 
    name: 'STANDARD GRID', 
    packId: 'default',
    colors: { primary: '#00ff88', secondary: '#00aa55', accent: '#88ffaa', glow: '#00ff88' }
  },
  { 
    id: 'void_hunter', 
    name: 'DARK VECTOR', 
    packId: 'default',
    colors: { primary: '#115533', secondary: '#0a3322', accent: '#00ff88', glow: '#00ff66' }
  },
  
  // === NEON SHIPS PACK ===
  { 
    id: 'neon_cyan', 
    name: 'CYAN WIRE', 
    packId: 'neon_ships',
    colors: { primary: '#00ffcc', secondary: '#00aa88', accent: '#88ffee', glow: '#00ffcc' }
  },
  { 
    id: 'neon_green', 
    name: 'LIME PULSE', 
    packId: 'neon_ships',
    colors: { primary: '#88ff00', secondary: '#55aa00', accent: '#ccff88', glow: '#88ff00' }
  },
  
  // === MOTHERSHIP SKINS PACK (6 skins) ===
  { 
    id: 'plasma_fury', 
    name: 'PLASMA GRID', 
    packId: 'mothership_skins',
    colors: { primary: '#00ff99', secondary: '#00aa66', accent: '#77ffbb', glow: '#00ff99' }
  },
  { 
    id: 'arctic_phantom', 
    name: 'FROST BYTE', 
    packId: 'mothership_skins',
    colors: { primary: '#66ffcc', secondary: '#44aa88', accent: '#aaffee', glow: '#66ffcc' }
  },
  { 
    id: 'crimson_viper', 
    name: 'MATRIX RED', 
    packId: 'mothership_skins',
    colors: { primary: '#22ff77', secondary: '#11aa55', accent: '#88ff99', glow: '#44ff88' }
  },
  { 
    id: 'emerald_dragon', 
    name: 'DEEP CODE', 
    packId: 'mothership_skins',
    colors: { primary: '#00ff66', secondary: '#00aa44', accent: '#66ff88', glow: '#00ff66' }
  },
  { 
    id: 'nebula_drifter', 
    name: 'VOID DRIFT', 
    packId: 'mothership_skins',
    colors: { primary: '#33ff99', secondary: '#22aa66', accent: '#99ffcc', glow: '#33ff99' }
  },
  { 
    id: 'thunder_hawk', 
    name: 'SURGE LINE', 
    packId: 'mothership_skins',
    colors: { primary: '#44ffaa', secondary: '#33aa77', accent: '#aaffcc', glow: '#44ffaa' }
  },
  
  // === LUNAR EXPANSION (Moon Variants) ===
  { 
    id: 'moon_ice', 
    name: 'CRYO LINK', 
    packId: 'lunar_expansion',
    colors: { primary: '#88ffdd', secondary: '#55aa99', accent: '#ccffee', glow: '#88ffdd' }
  },
  { 
    id: 'moon_crystal', 
    name: 'CRYSTAL NODE', 
    packId: 'lunar_expansion',
    colors: { primary: '#55ffbb', secondary: '#44aa88', accent: '#aaffdd', glow: '#55ffbb' }
  },
  
  // === ULTIMATE EDITION EXCLUSIVE ===
  { 
    id: 'golden', 
    name: 'PRIME VECTOR', 
    packId: 'ultimate_edition',
    colors: { primary: '#aaffaa', secondary: '#77cc77', accent: '#eeffee', glow: '#aaffaa' }
  },
  
  // === REMAINING FREE SKIN ===
  { 
    id: 'titanium_wraith', 
    name: 'GHOST FRAME', 
    packId: 'default',
    colors: { primary: '#55ff99', secondary: '#33aa66', accent: '#99ffcc', glow: '#55ff99' }
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
