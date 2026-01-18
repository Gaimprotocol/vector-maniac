// Vector Maniac Constants

// Portrait mode dimensions with higher internal resolution.
// We render at 2x resolution so everything appears ~50% smaller but sharper.
export const VM_CONFIG = {
  // Arena bounds - PORTRAIT MODE (2x)
  arenaWidth: 780,
  arenaHeight: 1688,
  arenaPadding: 60,
  
  // Player
  playerSize: 16,
  playerSpeed: 4,
  playerMaxHealth: 100,
  baseFireRate: 12,
  baseBulletSpeed: 8,
  baseDamage: 10,
  baseMagnetRange: 60,
  
  // Enemies
  droneSpeed: 2.5,
  droneHealth: 20,
  droneSize: 12,
  
  shooterSpeed: 1.2,
  shooterHealth: 30,
  shooterSize: 14,
  shooterFireRate: 90,
  shooterBulletSpeed: 4,
  
  eliteSpeed: 1.8,
  eliteHealth: 60,
  eliteSize: 18,
  
  bountyHealth: 200,
  bountySize: 32,
  bountySpeed: 0.8,
  
  // Waves per segment
  wavesPerSegment: 3,
  totalSegments: 3,
  
  // Enemies per wave (base, scales with wave number)
  baseEnemiesPerWave: 4,
  enemiesPerWaveIncrease: 2,
  
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
