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
  waveTransitionTime: 30,
  mapTransitionTime: 45,
  
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

// Generate 50 unique map themes with varied backgrounds
export interface MapTheme {
  id: number;
  name: string;
  bg1: string;
  bg2: string;
  gridColor: string;
  pattern: 'grid' | 'hexagon' | 'circles' | 'triangles' | 'diamonds' | 'waves' | 'stars' | 'spiral';
  accentColor: string;
}

// Helper to generate HSL color
function hsl(h: number, s: number, l: number): string {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function hsla(h: number, s: number, l: number, a: number): string {
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

// Generate 50 unique map themes
export const VM_MAP_THEMES: MapTheme[] = Array.from({ length: 50 }, (_, i) => {
  const mapId = i + 1;
  const hue = (i * 137.5) % 360; // Golden angle distribution for variety
  const patterns: MapTheme['pattern'][] = ['grid', 'hexagon', 'circles', 'triangles', 'diamonds', 'waves', 'stars', 'spiral'];
  const pattern = patterns[i % patterns.length];
  
  // Create distinct color schemes
  const saturation = 60 + (i % 3) * 15;
  const baseLightness = 3 + (i % 5);
  
  return {
    id: mapId,
    name: getMapName(mapId),
    bg1: hsl(hue, saturation, baseLightness),
    bg2: hsl((hue + 20) % 360, saturation - 10, baseLightness + 5),
    gridColor: hsla(hue, 80, 50, 0.06),
    pattern,
    accentColor: hsl(hue, 80, 60),
  };
});

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

export function getMapTheme(mapId: number): MapTheme {
  const index = ((mapId - 1) % VM_MAP_THEMES.length);
  return VM_MAP_THEMES[index];
}
