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
  
  // Segment backgrounds (colors per segment 1-3)
  segmentBackgrounds: [
    { bg1: '#050510', bg2: '#0a0a20', grid: 'rgba(0, 255, 255, 0.05)' },   // Segment 1: Deep blue/cyan
    { bg1: '#100505', bg2: '#200a0a', grid: 'rgba(255, 100, 50, 0.05)' },  // Segment 2: Red/orange
    { bg1: '#051005', bg2: '#0a200a', grid: 'rgba(100, 255, 100, 0.05)' }, // Segment 3: Green
  ],
  
  // Waves per segment
  wavesPerSegment: 3,
  totalSegments: 3,
  
  // Enemies per wave (base, scales gradually with wave number)
  baseEnemiesPerWave: 2,
  enemiesPerWaveIncrease: 1,
  
  // Spawn timing
  spawnInterval: 60,
  waveTransitionTime: 90,
  
  // Salvage
  salvageDropChance: {
    drone: 0.25,
    shooter: 0.25,
    elite: 0.50,
    bounty: 1.0,
  },
  salvageValue: {
    drone: 10,
    shooter: 15,
    elite: 30,
    bounty: 100,
  },
  salvageDriftSpeed: 0.3,
  
  // Difficulty scaling
  safeDifficultyIncrease: 1.05,
  riskDifficultyIncrease: 1.15,
  
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
  },
};
