// Ship-Specific Projectile Definitions for Vector Maniac
// Each ship has unique projectile shape, color, size, and sound

export type ProjectileShape = 'circle' | 'laser' | 'diamond' | 'star' | 'triangle' | 'plasma' | 'needle' | 'crescent' | 'ring' | 'bolt';
export type ProjectileSoundType = 'shoot' | 'laser' | 'plasma' | 'energy' | 'pulse' | 'fire' | 'ice';

export interface ShipProjectileStyle {
  shape: ProjectileShape;
  color: string;        // Primary color
  glowColor: string;    // Shadow/glow color
  coreColor: string;    // Inner core color (for some shapes)
  size: number;         // Base size multiplier (1 = default 4px)
  trailLength: number;  // 0 = no trail, 1-3 = trail intensity
  sound: ProjectileSoundType;
}

// Default projectile style
const DEFAULT_STYLE: ShipProjectileStyle = {
  shape: 'circle',
  color: '#00ffff',
  glowColor: '#00ffff',
  coreColor: '#ffffff',
  size: 1,
  trailLength: 0,
  sound: 'shoot',
};

// Ship-specific projectile styles (40 ships)
export const SHIP_PROJECTILE_STYLES: Record<string, ShipProjectileStyle> = {
  // Original 20 ships
  default: { ...DEFAULT_STYLE }, // FALCON - cyan circles
  
  viper: {
    shape: 'needle',
    color: '#e94560',
    glowColor: '#ff4488',
    coreColor: '#ffffff',
    size: 1.2,
    trailLength: 2,
    sound: 'laser',
  },
  
  phantom: {
    shape: 'diamond',
    color: '#aa66ff',
    glowColor: '#8844ff',
    coreColor: '#ffffff',
    size: 1.1,
    trailLength: 1,
    sound: 'energy',
  },
  
  hammer: {
    shape: 'circle',
    color: '#ffaa00',
    glowColor: '#ff8844',
    coreColor: '#ffff00',
    size: 1.5,
    trailLength: 0,
    sound: 'pulse',
  },
  
  needle: {
    shape: 'needle',
    color: '#88ffff',
    glowColor: '#44aacc',
    coreColor: '#ffffff',
    size: 0.8,
    trailLength: 3,
    sound: 'laser',
  },
  
  trident: {
    shape: 'triangle',
    color: '#44ff44',
    glowColor: '#00ff88',
    coreColor: '#88ff88',
    size: 1.2,
    trailLength: 1,
    sound: 'energy',
  },
  
  mantis: {
    shape: 'crescent',
    color: '#ccff44',
    glowColor: '#88ff00',
    coreColor: '#ffff00',
    size: 1.1,
    trailLength: 1,
    sound: 'shoot',
  },
  
  scorpion: {
    shape: 'bolt',
    color: '#ff6600',
    glowColor: '#ff4400',
    coreColor: '#ffaa00',
    size: 1.3,
    trailLength: 2,
    sound: 'fire',
  },
  
  delta: {
    shape: 'triangle',
    color: '#6666ff',
    glowColor: '#4444ff',
    coreColor: '#aaaaff',
    size: 1.0,
    trailLength: 1,
    sound: 'energy',
  },
  
  stingray: {
    shape: 'crescent',
    color: '#44aaff',
    glowColor: '#00aaff',
    coreColor: '#88ddff',
    size: 1.2,
    trailLength: 2,
    sound: 'pulse',
  },
  
  phoenix: {
    shape: 'star',
    color: '#ff8800',
    glowColor: '#ff4400',
    coreColor: '#ffff00',
    size: 1.3,
    trailLength: 3,
    sound: 'fire',
  },
  
  shark: {
    shape: 'needle',
    color: '#88aacc',
    glowColor: '#aaccff',
    coreColor: '#ffffff',
    size: 1.1,
    trailLength: 2,
    sound: 'shoot',
  },
  
  wasp: {
    shape: 'needle',
    color: '#ffff00',
    glowColor: '#ffcc00',
    coreColor: '#ffffff',
    size: 0.9,
    trailLength: 1,
    sound: 'laser',
  },
  
  corsair: {
    shape: 'bolt',
    color: '#ff4444',
    glowColor: '#cc0000',
    coreColor: '#ffaa00',
    size: 1.4,
    trailLength: 1,
    sound: 'pulse',
  },
  
  specter: {
    shape: 'ring',
    color: '#ccccff',
    glowColor: '#aaaacc',
    coreColor: '#ffffff',
    size: 1.2,
    trailLength: 2,
    sound: 'energy',
  },
  
  raptor: {
    shape: 'triangle',
    color: '#ffaa44',
    glowColor: '#ffcc00',
    coreColor: '#ff8800',
    size: 1.2,
    trailLength: 1,
    sound: 'shoot',
  },
  
  aurora: {
    shape: 'plasma',
    color: '#88ffcc',
    glowColor: '#44ddaa',
    coreColor: '#ff88ff',
    size: 1.3,
    trailLength: 3,
    sound: 'plasma',
  },
  
  gladiator: {
    shape: 'circle',
    color: '#ffffff',
    glowColor: '#aaaaaa',
    coreColor: '#ffcc00',
    size: 1.6,
    trailLength: 0,
    sound: 'pulse',
  },
  
  eclipse: {
    shape: 'ring',
    color: '#aaaaff',
    glowColor: '#8888ff',
    coreColor: '#ffffff',
    size: 1.4,
    trailLength: 2,
    sound: 'energy',
  },
  
  basilisk: {
    shape: 'crescent',
    color: '#88ff88',
    glowColor: '#44ff44',
    coreColor: '#ffff00',
    size: 1.1,
    trailLength: 2,
    sound: 'shoot',
  },
  
  // 20 New Retro Sci-Fi Ships
  interceptor: {
    shape: 'laser',
    color: '#4488ff',
    glowColor: '#2255aa',
    coreColor: '#88ccff',
    size: 1.0,
    trailLength: 2,
    sound: 'laser',
  },
  
  valkyrie: {
    shape: 'needle',
    color: '#ffffff',
    glowColor: '#aabbcc',
    coreColor: '#cc4444',
    size: 1.1,
    trailLength: 2,
    sound: 'shoot',
  },
  
  crimson: {
    shape: 'bolt',
    color: '#ff4444',
    glowColor: '#aa2222',
    coreColor: '#ffcc00',
    size: 1.3,
    trailLength: 1,
    sound: 'fire',
  },
  
  goldwing: {
    shape: 'star',
    color: '#ffdd44',
    glowColor: '#cc9933',
    coreColor: '#ffffff',
    size: 1.4,
    trailLength: 1,
    sound: 'pulse',
  },
  
  cobalt: {
    shape: 'laser',
    color: '#66aaff',
    glowColor: '#3366cc',
    coreColor: '#aaddff',
    size: 1.0,
    trailLength: 3,
    sound: 'laser',
  },
  
  ironclad: {
    shape: 'circle',
    color: '#aabbcc',
    glowColor: '#667788',
    coreColor: '#ffaa33',
    size: 1.5,
    trailLength: 0,
    sound: 'pulse',
  },
  
  redtail: {
    shape: 'needle',
    color: '#ff6644',
    glowColor: '#cc4422',
    coreColor: '#ffcc22',
    size: 1.0,
    trailLength: 2,
    sound: 'laser',
  },
  
  sunburst: {
    shape: 'star',
    color: '#ffcc44',
    glowColor: '#ddaa22',
    coreColor: '#ff4400',
    size: 1.3,
    trailLength: 2,
    sound: 'fire',
  },
  
  steelwolf: {
    shape: 'triangle',
    color: '#aaccdd',
    glowColor: '#889999',
    coreColor: '#66ddff',
    size: 1.1,
    trailLength: 1,
    sound: 'shoot',
  },
  
  blueshift: {
    shape: 'plasma',
    color: '#66aaff',
    glowColor: '#4477cc',
    coreColor: '#ccddff',
    size: 1.2,
    trailLength: 3,
    sound: 'plasma',
  },
  
  thunderbolt: {
    shape: 'bolt',
    color: '#ff6655',
    glowColor: '#bb4433',
    coreColor: '#88ddff',
    size: 1.4,
    trailLength: 2,
    sound: 'pulse',
  },
  
  yellowjacket: {
    shape: 'needle',
    color: '#ffdd44',
    glowColor: '#ccaa22',
    coreColor: '#222222',
    size: 0.9,
    trailLength: 1,
    sound: 'laser',
  },
  
  silverfox: {
    shape: 'diamond',
    color: '#ccddee',
    glowColor: '#99aabc',
    coreColor: '#88ccff',
    size: 1.1,
    trailLength: 2,
    sound: 'energy',
  },
  
  firebird: {
    shape: 'star',
    color: '#ff5533',
    glowColor: '#dd3311',
    coreColor: '#ffcc44',
    size: 1.3,
    trailLength: 3,
    sound: 'fire',
  },
  
  arctic: {
    shape: 'diamond',
    color: '#aaddff',
    glowColor: '#88bbdd',
    coreColor: '#ffffff',
    size: 1.2,
    trailLength: 2,
    sound: 'ice',
  },
  
  commander: {
    shape: 'circle',
    color: '#99aabb',
    glowColor: '#778888',
    coreColor: '#cc9933',
    size: 1.5,
    trailLength: 0,
    sound: 'pulse',
  },
  
  scarlet: {
    shape: 'bolt',
    color: '#ff4455',
    glowColor: '#cc2233',
    coreColor: '#ffaa77',
    size: 1.2,
    trailLength: 2,
    sound: 'fire',
  },
  
  goldenrod: {
    shape: 'circle',
    color: '#ddbb44',
    glowColor: '#bb9922',
    coreColor: '#88aacc',
    size: 1.3,
    trailLength: 1,
    sound: 'shoot',
  },
  
  bluehawk: {
    shape: 'laser',
    color: '#5577cc',
    glowColor: '#3355aa',
    coreColor: '#aaccff',
    size: 1.0,
    trailLength: 3,
    sound: 'laser',
  },
  
  titanium: {
    shape: 'circle',
    color: '#aabbcc',
    glowColor: '#8899aa',
    coreColor: '#dd6633',
    size: 1.6,
    trailLength: 0,
    sound: 'pulse',
  },
};

// Get projectile style for a ship (returns default if not found)
export function getShipProjectileStyle(shipId: string): ShipProjectileStyle {
  return SHIP_PROJECTILE_STYLES[shipId] || DEFAULT_STYLE;
}
