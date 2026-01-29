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
  
  // Mini-boss config (spawns mid-map on longer maps)
  minibossHealth: 120,
  minibossSize: 36,
  minibossSpeed: 1.2,
  minibossFireRate: 80,
  
  // New enemy types - unlock progressively
  // Dasher: fast enemy that rushes toward player (unlocks map 5)
  dasherSpeed: 4.5,
  dasherHealth: 15,
  dasherSize: 14,
  dasherUnlockMap: 5,
  
  // Splitter: splits into 2 smaller enemies on death (unlocks map 10)
  splitterSpeed: 1.2,
  splitterHealth: 40,
  splitterSize: 22,
  splitterUnlockMap: 10,
  
  // Orbiter: circles around player at fixed distance (unlocks map 15)
  orbiterSpeed: 2.5,
  orbiterHealth: 25,
  orbiterSize: 16,
  orbiterOrbitRadius: 150,
  orbiterFireRate: 120,
  orbiterUnlockMap: 15,
  
  // Sniper: stops and aims carefully before shooting (unlocks map 20)
  sniperSpeed: 0.6,
  sniperHealth: 20,
  sniperSize: 18,
  sniperFireRate: 180, // Slow but accurate
  sniperAimTime: 60, // Frames to aim before shooting
  sniperUnlockMap: 20,
  
  // Boss config
  bossHealth: 400,
  bossSize: 60,
  bossFireRate: 50, // Base fire rate (reduced 20% = slower shooting)
  
  // Map system - 50 unique maps
  totalMaps: 50,
  wavesPerMapMin: 1,
  wavesPerMapMax: 3,
  
  // Enemies per wave (base, scales with progression)
  baseEnemiesPerWave: 4,        // Start with more enemies
  enemiesPerWaveIncrease: 0.8,  // More linear growth
  enemiesPerMapMultiplier: 0.06, // +6% enemies per map completed (compounding)
  
  // Enemy stat scaling per map (makes enemies tougher over time)
  enemyHealthPerMap: 0.04,      // +4% health per map (was 2.5%)
  enemySpeedPerMap: 0.012,      // +1.2% speed per map (was 0.8%)
  enemyDamagePerMap: 0.025,     // +2.5% damage per map (was 1.5%)
  
  // Spawn timing
  spawnInterval: 45,            // Faster spawning
  waveTransitionTime: 156,      // ~2.6 seconds for wave complete text
  mapTransitionTime: 15,
  
  // Salvage
  salvageDropChance: {
    drone: 0.20,                // Reduced from 0.25
    shooter: 0.20,              // Reduced from 0.25
    elite: 0.40,                // Reduced from 0.50
    bounty: 1.0,
    boss: 1.0,
    miniboss: 1.0,              // Always drops salvage
    dasher: 0.15,               // Fast but weak
    splitter: 0.30,             // Medium reward
    orbiter: 0.25,              // Annoying to kill
    sniper: 0.35,               // Dangerous
    anomaly: 0.60,              // Mystery enemies drop more often
  },
  salvageValue: {
    drone: 8,                   // Reduced from 10
    shooter: 12,                // Reduced from 15
    elite: 25,                  // Reduced from 30
    bounty: 80,                 // Reduced from 100
    boss: 150,                  // Reduced from 200
    miniboss: 50,               // Decent mid-map reward
    dasher: 6,                  // Quick kill
    splitter: 18,               // Worth more due to difficulty
    orbiter: 14,                // Moderate reward
    sniper: 16,                 // Dangerous enemy
    anomaly: 30,                // Good reward for unknown threat
  },
  salvageDriftSpeed: 0.3,
  
  // Difficulty scaling per level (after completing all 50 maps)
  levelDifficultyMultiplier: 2.0, // +100% per full loop (was 50%)
  
  // Formation system - enemies spawn in coordinated groups
  formationChanceBase: 0.15,    // 15% base chance for formation spawn
  formationChancePerMap: 0.02,  // +2% per map (reaches ~100% at map 40+)
  
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
    // Hyperspace-specific power-ups
    warpShield: '#00ffff',      // Cyan - multi-hit shield
    formationBreaker: '#ff8800', // Orange - clears screen
    timeWarp: '#aa00ff',         // Purple - slows enemies
    magnetPulse: '#ffff00',      // Gold - attracts all salvage
  },
  
  // Hyperspace mode configuration
  hyperspaceDurationMin: 900, // 15 seconds at 60fps (shorter, more intense)
  hyperspaceDurationMax: 2100, // 35 seconds at 60fps
  hyperspaceScrollSpeed: 7,    // Faster background scroll for speed feeling
  hyperspacePlayerYMin: 1200,  // Player can move back to here (250px from bottom)
  hyperspacePlayerYMax: 950,   // Player can move forward to here (250px range)
  hyperspaceFormationInterval: 140, // Slower spawning (2.3s) - fewer enemies
  hyperspaceTransitionDuration: 60, // 1 second transition
  
  // Hyperspace variation per map
  hyperspaceVariants: [
    { name: 'WARP TUNNEL', speedMult: 1.0, enemyMult: 1.0, color: '#00ffff' },
    { name: 'NEBULA RUSH', speedMult: 1.2, enemyMult: 0.8, color: '#ff00ff' },
    { name: 'ASTEROID FIELD', speedMult: 0.9, enemyMult: 1.2, color: '#ffaa00' },
    { name: 'VOID CORRIDOR', speedMult: 1.4, enemyMult: 0.7, color: '#8800ff' },
    { name: 'STAR STREAM', speedMult: 1.1, enemyMult: 0.9, color: '#ffff00' },
  ] as const,
  
  // Visual
  bgColor1: '#050510',
  bgColor2: '#0a0a20',
  gridColor: 'rgba(0, 255, 255, 0.05)',
  playerColor: '#00ffff',
  enemyColors: {
    drone: '#ff6600',
    dasher: '#ff3366',    // Hot pink - fast and aggressive
    splitter: '#66ff66',  // Green - splits into more
    orbiter: '#6699ff',   // Light blue - circling
    sniper: '#ffcc00',    // Gold - precision
    shooter: '#ff0066',
    elite: '#aa00ff',
    bounty: '#ffff00',
    boss: '#ff0000', // Default, overridden per map
  },
  
  // 10 unique boss color themes - each map gets a different boss appearance
  bossColors: [
    '#ff0000', // 0: Classic Red - Crimson Destroyer
    '#00ff88', // 1: Toxic Green - Venom Lord  
    '#ff00ff', // 2: Magenta - Void Empress
    '#00aaff', // 3: Electric Blue - Storm Titan
    '#ffaa00', // 4: Orange Fire - Inferno King
    '#00ffff', // 5: Cyan Ice - Frost Warden
    '#ff0088', // 6: Hot Pink - Chaos Queen
    '#8800ff', // 7: Deep Purple - Shadow Archon
    '#ffff00', // 8: Golden - Solar Emperor
    '#ffffff', // 9: White - Cosmic Overlord
  ] as const,
  
  // Boss projectile types per map - determines visual style
  bossProjectileTypes: [
    'normal',   // 0: Standard red bullets
    'toxic',    // 1: Green poison shots
    'void',     // 2: Purple vortex blasts
    'electric', // 3: Blue lightning bolts
    'fire',     // 4: Orange fireballs
    'ice',      // 5: Cyan frost shards
    'plasma',   // 6: Pink plasma orbs
    'energy',   // 7: Purple energy beams
    'pulse',    // 8: Yellow pulse waves
    'laser',    // 9: White concentrated lasers
  ] as const,
  
  // 10 unique boss names - displayed above health bar
  bossNames: [
    'CRIMSON DESTROYER',   // 0: Classic Red
    'VENOM LORD',          // 1: Toxic Green
    'VOID EMPRESS',        // 2: Magenta
    'STORM TITAN',         // 3: Electric Blue
    'INFERNO KING',        // 4: Orange Fire
    'FROST WARDEN',        // 5: Cyan Ice
    'CHAOS QUEEN',         // 6: Hot Pink
    'SHADOW ARCHON',       // 7: Deep Purple
    'SOLAR EMPEROR',       // 8: Golden
    'COSMIC OVERLORD',     // 9: White
  ] as const,
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
