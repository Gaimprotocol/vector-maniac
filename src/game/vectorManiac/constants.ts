// Vector Maniac Constants

// Portrait mode dimensions with higher internal resolution.
// We render at 2x resolution so everything appears ~50% smaller but sharper.
export const VM_CONFIG = {
  // Arena bounds - PORTRAIT MODE (2x)
  arenaWidth: 780,
  arenaHeight: 1688,
  arenaPadding: 60,
  
  // Player (scaled up 50%)
  playerSize: 24,
  playerSpeed: 6,
  playerMaxHealth: 100,
  baseFireRate: 6,
  baseBulletSpeed: 12,
  baseDamage: 10,
  baseMagnetRange: 90,
  
  // Enemies - scaled up 50%
  droneSpeed: 1.875,
  droneHealth: 20,
  droneSize: 18,
  
  shooterSpeed: 0.9,
  shooterHealth: 30,
  shooterSize: 21,
  shooterFireRate: 150, // Reduced fire frequency (higher = slower)
  shooterBulletSpeed: 5,
  
  eliteSpeed: 1.35,
  eliteHealth: 60,
  eliteSize: 27,
  
  bountyHealth: 200,
  bountySize: 48,
  bountySpeed: 0.6,
  
  // Boss config
  bossHealth: 400,
  bossSize: 60,
  bossFireRate: 40,
  
  // Map system - 50 unique maps
  totalMaps: 50,
  wavesPerMapMin: 1,
  wavesPerMapMax: 3,
  
  // Enemies per wave (base, scales gradually with wave number)
  baseEnemiesPerWave: 2,
  enemiesPerWaveIncrease: 1,
  
  // Spawn timing
  spawnInterval: 60,
  waveTransitionTime: 156, // ~2.6 seconds for wave complete text
  mapTransitionTime: 15,
  
  // Salvage
  salvageDropChance: {
    drone: 0.25,
    shooter: 0.25,
    elite: 0.50,
    bounty: 1.0,
    boss: 1.0,
  },
  salvageValue: {
    drone: 10,
    shooter: 15,
    elite: 30,
    bounty: 100,
    boss: 200,
  },
  salvageDriftSpeed: 0.3,
  
  // Difficulty scaling per level
  levelDifficultyMultiplier: 1.25,
  
  // Power-ups
  powerUpSize: 18,
  powerUpSpawnChance: 0.25, // 25% chance per enemy kill
  powerUpDuration: 600, // 10 seconds at 60fps
  powerUpLifetime: 720, // 12 seconds before despawn
  powerUpColors: {
    shield: '#00aaff',
    nuke: '#ff4400',
    doublePoints: '#ffff00',
    doubleShot: '#ff00ff',
    speedBoost: '#00ff88',
  },
  
  // Visual
  bgColor1: '#050510',
  bgColor2: '#0a0a20',
  gridColor: 'rgba(0, 255, 255, 0.05)',
  playerColor: '#00ffff',
  enemyColors: {
    drone: '#ff6600',
    shooter: '#ff0066',
    elite: '#aa00ff',
    bounty: '#ffff00',
    boss: '#ff0000',
  },
};

// Helper to generate HSL color
function hsl(h: number, s: number, l: number): string {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function hsla(h: number, s: number, l: number, a: number): string {
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

function getMapName(mapId: number): string {
  const names = [
    'Neon Abyss', 'Cyber Core', 'Void Station', 'Plasma Grid', 'Dark Matter',
    'Chrome Sector', 'Quantum Field', 'Binary Storm', 'Nova Zone', 'Pulse Array',
    'Vector Prime', 'Data Stream', 'Circuit Break', 'Synth Valley', 'Tron Highway',
    'Laser Maze', 'Digital Drift', 'Null Space', 'Wave Runner', 'Pixel Storm',
    'Gamma Ray', 'Alpha Base', 'Beta Sector', 'Delta Zone', 'Omega Point',
    'Hyper Drive', 'Warp Core', 'Ion Storm', 'Photon Grid', 'Electron Sea',
    'Neutron Star', 'Quark Field', 'Muon Ring', 'Tau Zone', 'Sigma Base',
    'Hex Matrix', 'Octal Array', 'Decimal Drift', 'Binary Blitz', 'Quad Core',
    'Penta Zone', 'Hexa Storm', 'Septa Field', 'Octa Ring', 'Nona Base',
    'Deca Prime', 'Mega Core', 'Giga Zone', 'Tera Field', 'Final Vector',
  ];
  return names[mapId - 1] || `Sector ${mapId}`;
}

// Generate 50 unique map themes with varied backgrounds
export interface MapTheme {
  id: number;
  name: string;
  bg1: string;
  bg2: string;
  gridColor: string;
  pattern: 'grid' | 'hexagon' | 'circles' | 'triangles' | 'diamonds' | 'waves' | 'stars' | 'spiral' | 'crosshatch' | 'dots' | 'scanlines' | 'radial';
  accentColor: string;
  // New visual effects
  glowIntensity: number; // 0-1 for ambient glow
  nebulaColor?: string;
  hasStars: boolean;
  pulseSpeed: number; // Pattern animation speed multiplier
}

// Color palettes for variety
const COLOR_PALETTES = [
  // Neon Cyan
  { primary: 180, secondary: 200, name: 'cyan' },
  // Hot Pink / Magenta
  { primary: 320, secondary: 340, name: 'magenta' },
  // Electric Purple
  { primary: 270, secondary: 290, name: 'purple' },
  // Toxic Green
  { primary: 120, secondary: 140, name: 'green' },
  // Solar Orange
  { primary: 30, secondary: 15, name: 'orange' },
  // Blood Red
  { primary: 0, secondary: 350, name: 'red' },
  // Golden Yellow
  { primary: 50, secondary: 40, name: 'gold' },
  // Ice Blue
  { primary: 210, secondary: 220, name: 'ice' },
  // Sunset Gradient
  { primary: 350, secondary: 30, name: 'sunset' },
  // Deep Ocean
  { primary: 240, secondary: 200, name: 'ocean' },
];

// Generate 50 unique map themes
export const VM_MAP_THEMES: MapTheme[] = Array.from({ length: 50 }, (_, i) => {
  const mapId = i + 1;
  
  // Use varied color palettes instead of golden angle
  const paletteIndex = i % COLOR_PALETTES.length;
  const palette = COLOR_PALETTES[paletteIndex];
  
  // Add variation within palette
  const hueShift = Math.floor(i / COLOR_PALETTES.length) * 15;
  const hue = (palette.primary + hueShift) % 360;
  const secondaryHue = (palette.secondary + hueShift) % 360;
  
  const patterns: MapTheme['pattern'][] = [
    'grid', 'hexagon', 'circles', 'triangles', 'diamonds', 
    'waves', 'stars', 'spiral', 'crosshatch', 'dots', 'scanlines', 'radial'
  ];
  const pattern = patterns[i % patterns.length];
  
  // Vary saturation and lightness for more contrast between maps
  const satGroup = i % 3;
  const saturation = satGroup === 0 ? 80 : satGroup === 1 ? 60 : 100;
  
  const lightGroup = i % 5;
  const baseLightness = lightGroup === 0 ? 3 : lightGroup === 1 ? 5 : lightGroup === 2 ? 2 : lightGroup === 3 ? 7 : 4;
  
  // Some maps have brighter backgrounds
  const isBrightMap = i % 7 === 0;
  const bgLightness = isBrightMap ? baseLightness + 4 : baseLightness;
  
  return {
    id: mapId,
    name: getMapName(mapId),
    bg1: hsl(hue, saturation - 20, bgLightness),
    bg2: hsl(secondaryHue, saturation, bgLightness + 6),
    gridColor: hsla(hue, 90, 55, 0.08 + (i % 4) * 0.02),
    pattern,
    accentColor: hsl(hue, 90, 60),
    glowIntensity: 0.3 + (i % 5) * 0.15,
    nebulaColor: i % 3 === 0 ? hsla(secondaryHue, 70, 40, 0.15) : undefined,
    hasStars: i % 2 === 0,
    pulseSpeed: 0.5 + (i % 4) * 0.3,
  };
});

export function getMapTheme(mapId: number): MapTheme {
  const index = ((mapId - 1) % VM_MAP_THEMES.length);
  return VM_MAP_THEMES[index];
}
