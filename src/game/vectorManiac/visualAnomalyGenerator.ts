// Visual Anomaly Generator - Procedurally Generated Backgrounds & Hyperspace Effects
// Creates unique, randomized visual environments that the player has never seen before

// Background pattern types
export type AnomalyPattern = 
  | 'vortex'       // Spiraling lines toward center
  | 'shatter'      // Broken glass/crystalline
  | 'neural'       // Brain-like neural network
  | 'quantum'      // Quantum foam/particles
  | 'glitch'       // Digital glitch patterns
  | 'organic'      // Organic flowing shapes
  | 'circuit'      // Circuit board traces
  | 'nebula'       // Cosmic clouds
  | 'fractal'      // Self-similar patterns
  | 'void';        // Empty with sparse elements

// Hyperspace visual effects
export type HyperspaceEffect = 
  | 'wormhole'     // Tunnel effect
  | 'starstream'   // Classic star streaks
  | 'dataflow'     // Digital data streams
  | 'plasma'       // Plasma waves
  | 'rift'         // Dimensional rift
  | 'aurora';      // Northern lights style

// Background Anomaly DNA
export interface BackgroundAnomalyDNA {
  // Color scheme
  primaryHue: number;         // 0-360
  secondaryHue: number;       // 0-360
  accentHue: number;          // 0-360
  saturation: number;         // 40-100
  brightness: number;         // 10-40 (background brightness)
  
  // Pattern
  pattern: AnomalyPattern;
  patternScale: number;       // 0.5-2.0
  patternSpeed: number;       // 0.2-2.0 animation speed
  patternDensity: number;     // 0.3-1.5
  
  // Effects
  hasNebula: boolean;
  hasStarfield: boolean;
  hasGlow: boolean;
  hasDistortion: boolean;
  
  // Visual modifiers
  contrast: number;           // 0.8-1.5
  vignetteStrength: number;   // 0-0.5
  
  // Unique seed
  seed: number;
  name: string;
}

// Hyperspace Anomaly DNA
export interface HyperspaceAnomalyDNA {
  // Color scheme
  primaryHue: number;
  secondaryHue: number;
  saturation: number;
  
  // Effect type
  effect: HyperspaceEffect;
  effectIntensity: number;    // 0.5-2.0
  
  // Speed lines
  lineCount: number;          // 40-150
  lineLength: number;         // 0.5-2.0 multiplier
  lineSpeed: number;          // 0.5-2.0 multiplier
  
  // Special effects
  hasRainbow: boolean;        // Color-shifting effect
  hasPulse: boolean;          // Pulsing intensity
  hasWave: boolean;           // Wavy distortion
  
  // Unique identifiers
  seed: number;
  name: string;
}

// Background anomaly name generation
const BG_PREFIXES = ['Quantum', 'Void', 'Astral', 'Chrono', 'Flux', 'Null', 'Phase', 'Echo', 'Drift', 'Pulse'];
const BG_SUFFIXES = ['Realm', 'Domain', 'Expanse', 'Zone', 'Field', 'Sector', 'Matrix', 'Plane', 'Rift', 'Dimension'];

// Hyperspace anomaly name generation
const HS_PREFIXES = ['Hyper', 'Warp', 'Quantum', 'Trans', 'Ultra', 'Omega', 'Alpha', 'Nova', 'Astro', 'Chrono'];
const HS_SUFFIXES = ['Stream', 'Corridor', 'Tunnel', 'Channel', 'Gateway', 'Passage', 'Bridge', 'Conduit', 'Flux', 'Wave'];

// Seeded random helper
function seededRandom(seed: number, offset: number): number {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

// Generate Background Anomaly DNA
export function generateBackgroundAnomalyDNA(mapNumber: number, seed?: number): BackgroundAnomalyDNA {
  const s = seed ?? Math.floor(Math.random() * 1000000);
  
  const patterns: AnomalyPattern[] = ['vortex', 'shatter', 'neural', 'quantum', 'glitch', 'organic', 'circuit', 'nebula', 'fractal', 'void'];
  
  // Danger level increases visual intensity
  const dangerLevel = Math.min(1, mapNumber / 40);
  
  const prefixIndex = Math.floor(seededRandom(s, 100) * BG_PREFIXES.length);
  const suffixIndex = Math.floor(seededRandom(s, 101) * BG_SUFFIXES.length);
  
  return {
    primaryHue: Math.floor(seededRandom(s, 1) * 360),
    secondaryHue: Math.floor(seededRandom(s, 2) * 360),
    accentHue: Math.floor(seededRandom(s, 3) * 360),
    saturation: 50 + seededRandom(s, 4) * 50,
    brightness: 12 + seededRandom(s, 5) * 20,
    
    pattern: patterns[Math.floor(seededRandom(s, 6) * patterns.length)],
    patternScale: 0.6 + seededRandom(s, 7) * 1.2,
    patternSpeed: 0.3 + seededRandom(s, 8) * 1.5,
    patternDensity: 0.4 + seededRandom(s, 9) * 1.0,
    
    hasNebula: seededRandom(s, 10) > 0.5,
    hasStarfield: seededRandom(s, 11) > 0.3,
    hasGlow: seededRandom(s, 12) > 0.4,
    hasDistortion: seededRandom(s, 13) > 0.7 + (1 - dangerLevel) * 0.2,
    
    contrast: 0.9 + seededRandom(s, 14) * 0.5,
    vignetteStrength: seededRandom(s, 15) * 0.4,
    
    seed: s,
    name: `${BG_PREFIXES[prefixIndex]} ${BG_SUFFIXES[suffixIndex]}`,
  };
}

// Generate Hyperspace Anomaly DNA
export function generateHyperspaceAnomalyDNA(mapNumber: number, seed?: number): HyperspaceAnomalyDNA {
  const s = seed ?? Math.floor(Math.random() * 1000000);
  
  const effects: HyperspaceEffect[] = ['wormhole', 'starstream', 'dataflow', 'plasma', 'rift', 'aurora'];
  
  const prefixIndex = Math.floor(seededRandom(s, 100) * HS_PREFIXES.length);
  const suffixIndex = Math.floor(seededRandom(s, 101) * HS_SUFFIXES.length);
  
  return {
    primaryHue: Math.floor(seededRandom(s, 1) * 360),
    secondaryHue: Math.floor(seededRandom(s, 2) * 360),
    saturation: 60 + seededRandom(s, 3) * 40,
    
    effect: effects[Math.floor(seededRandom(s, 4) * effects.length)],
    effectIntensity: 0.6 + seededRandom(s, 5) * 1.2,
    
    lineCount: Math.floor(50 + seededRandom(s, 6) * 100),
    lineLength: 0.6 + seededRandom(s, 7) * 1.2,
    lineSpeed: 0.6 + seededRandom(s, 8) * 1.2,
    
    hasRainbow: seededRandom(s, 9) > 0.7,
    hasPulse: seededRandom(s, 10) > 0.5,
    hasWave: seededRandom(s, 11) > 0.6,
    
    seed: s,
    name: `${HS_PREFIXES[prefixIndex]} ${HS_SUFFIXES[suffixIndex]}`,
  };
}

// Encode DNA to number for storage
export function encodeBackgroundDNA(dna: BackgroundAnomalyDNA): number {
  return dna.seed;
}

export function encodeHyperspaceDNA(dna: HyperspaceAnomalyDNA): number {
  return dna.seed;
}

// Decode DNA from seed
export function decodeBackgroundDNA(seed: number, mapNumber: number): BackgroundAnomalyDNA {
  return generateBackgroundAnomalyDNA(mapNumber, seed);
}

export function decodeHyperspaceDNA(seed: number, mapNumber: number): HyperspaceAnomalyDNA {
  return generateHyperspaceAnomalyDNA(mapNumber, seed);
}

// Get colors from Background DNA
export function getBackgroundColors(dna: BackgroundAnomalyDNA): {
  bg1: string;
  bg2: string;
  accent: string;
  grid: string;
} {
  const l = dna.brightness;
  return {
    bg1: `hsl(${dna.primaryHue}, ${dna.saturation}%, ${l}%)`,
    bg2: `hsl(${dna.secondaryHue}, ${dna.saturation * 0.8}%, ${l * 1.3}%)`,
    accent: `hsl(${dna.accentHue}, ${dna.saturation}%, ${60}%)`,
    grid: `hsla(${dna.accentHue}, ${dna.saturation}%, 50%, 0.08)`,
  };
}

// Get colors from Hyperspace DNA
export function getHyperspaceColors(dna: HyperspaceAnomalyDNA): {
  primary: string;
  secondary: string;
  bg1: string;
  bg2: string;
  bg3: string;
} {
  return {
    primary: `hsl(${dna.primaryHue}, ${dna.saturation}%, 70%)`,
    secondary: `hsl(${dna.secondaryHue}, ${dna.saturation}%, 60%)`,
    bg1: `hsl(${dna.primaryHue}, ${dna.saturation * 0.5}%, 5%)`,
    bg2: `hsl(${dna.primaryHue}, ${dna.saturation * 0.6}%, 10%)`,
    bg3: `hsl(${dna.secondaryHue}, ${dna.saturation * 0.4}%, 15%)`,
  };
}
