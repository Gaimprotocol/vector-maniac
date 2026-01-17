import { useState, useEffect, useCallback } from 'react';

// Mega Ship definitions with unique abilities
export interface MegaShip {
  id: string;
  name: string;
  description: string;
  ability: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
    cockpit: string;
  };
}

export const MEGA_SHIPS: MegaShip[] = [
  {
    id: 'original',
    name: 'FALCON',
    description: 'Standard mothership',
    ability: 'Balanced stats',
    colors: { primary: '#ffffff', secondary: '#cccccc', accent: '#ffaa00', glow: '#00ddff', cockpit: '#00ddff' }
  },
  {
    id: 'blue_hawk',
    name: 'BLUE HAWK',
    description: 'Laser precision craft',
    ability: 'Shoots laser beams instead of bullets',
    colors: { primary: '#2255cc', secondary: '#1144aa', accent: '#00ffff', glow: '#44aaff', cockpit: '#88ddff' }
  },
  {
    id: 'arctic_wolf',
    name: 'T.E.R.J.E',
    description: 'Heavy bomber craft',
    ability: 'Blinking wing lights, drops double bombs',
    colors: { primary: '#aaddee', secondary: '#88bbcc', accent: '#ffffff', glow: '#ccffff', cockpit: '#ffffff' }
  },
  {
    id: 'delta_prime',
    name: 'DELTA',
    description: 'Speed interceptor',
    ability: 'Flies, shoots and bombs 30% faster',
    colors: { primary: '#33aa55', secondary: '#228844', accent: '#88ff88', glow: '#44ff66', cockpit: '#aaffaa' }
  },
  {
    id: 'crimson_hawk',
    name: 'CRIMSON HAWK',
    description: 'Multi-directional assault',
    ability: 'Extra shots: up, down and backward',
    colors: { primary: '#cc2222', secondary: '#991111', accent: '#ff6644', glow: '#ff4444', cockpit: '#ffaa88' }
  },
  {
    id: 'valkyrie_prime',
    name: 'VALKYRIE',
    description: 'Phantom striker',
    ability: '50% faster, blue projectiles, stealth mode',
    colors: { primary: '#3344aa', secondary: '#222288', accent: '#88aaff', glow: '#6688ff', cockpit: '#aaccff' }
  }
];

const STORAGE_KEY = 'galactic_overdrive_mega_ship';

export interface MegaShipState {
  activeMegaShipId: string;
}

const defaultState: MegaShipState = {
  activeMegaShipId: 'original'
};

export function useMegaShips() {
  const [state, setState] = useState<MegaShipState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState({ ...defaultState, ...parsed });
      }
    } catch (error) {
      console.error('[MegaShips] Failed to load:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage
  const saveState = useCallback((newState: MegaShipState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      setState(newState);
    } catch (error) {
      console.error('[MegaShips] Failed to save:', error);
    }
  }, []);

  // Set active mega ship
  const setActiveMegaShip = useCallback((shipId: string) => {
    saveState({ ...state, activeMegaShipId: shipId });
  }, [state, saveState]);

  // Get the current active mega ship
  const getActiveMegaShip = useCallback((): MegaShip => {
    const ship = MEGA_SHIPS.find(s => s.id === state.activeMegaShipId);
    return ship || MEGA_SHIPS[0];
  }, [state.activeMegaShipId]);

  // Get active ship ID for reading from localStorage directly (for game logic)
  const getActiveMegaShipId = useCallback((): string => {
    return state.activeMegaShipId;
  }, [state.activeMegaShipId]);

  return {
    state,
    isLoading,
    setActiveMegaShip,
    getActiveMegaShip,
    getActiveMegaShipId,
  };
}

// Helper functions for game logic (can be called without hook)
export function getStoredMegaShipId(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.activeMegaShipId || 'original';
    }
  } catch {
    // Ignore
  }
  return 'original';
}

export function getMegaShipById(id: string): MegaShip {
  return MEGA_SHIPS.find(s => s.id === id) || MEGA_SHIPS[0];
}

// Ship ability checks
export function hasLaserAbility(shipId: string): boolean {
  return shipId === 'blue_hawk';
}

export function hasDoubleBombs(shipId: string): boolean {
  return shipId === 'arctic_wolf';
}

export function hasSpeedBoost(shipId: string): { speed: number; fireRate: number; bombRate: number } | null {
  if (shipId === 'delta_prime') {
    return { speed: 1.3, fireRate: 0.7, bombRate: 0.7 }; // 30% faster
  }
  if (shipId === 'valkyrie_prime') {
    return { speed: 1.5, fireRate: 1.0, bombRate: 1.0 }; // 50% faster movement only
  }
  return null;
}

export function hasMultiDirectionalShots(shipId: string): boolean {
  return shipId === 'crimson_hawk';
}

export function hasStealthMode(shipId: string): boolean {
  return shipId === 'valkyrie_prime';
}

export function hasBlueProjectiles(shipId: string): boolean {
  return shipId === 'valkyrie_prime';
}

export function hasWingLights(shipId: string): boolean {
  return shipId === 'arctic_wolf';
}
