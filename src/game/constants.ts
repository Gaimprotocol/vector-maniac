import { GameConfig } from './types';

// iPhone landscape aspect ratio (19.5:9)
export const GAME_CONFIG: GameConfig = {
  canvasWidth: 844,
  canvasHeight: 390,
  playerSpeed: 8,
  bulletSpeed: 10,
  scrollSpeed: 1.5,
  fireRate: 6,
  bombRate: 40,
};

export const COLORS = {
  // Player
  playerBody: '#00ffff',
  playerCockpit: '#00aaff',
  playerEngine: '#ff00ff',
  playerGlow: 'rgba(0, 255, 255, 0.4)',
  playerDetail: '#ffffff',
  
  // Enemies
  turret: '#ff4444',
  turretDetail: '#880000',
  drone: '#ff8800',
  droneDetail: '#aa4400',
  leech: '#aa00ff',
  leechDetail: '#550088',
  missile: '#ffff00',
  
  // Effects
  bulletPlayer: '#00ffff',
  bulletEnemy: '#ff4444',
  explosion: ['#ffffff', '#ffff00', '#ff8800', '#ff4444', '#ff00ff'],
  
  // Environment
  terrain: '#0a1a2a',
  terrainMid: '#1a3a4a',
  terrainLight: '#2a5a6a',
  terrainHighlight: '#4a8a9a',
  structure: '#2a4a5a',
  structureLight: '#3a6a7a',
  structureAccent: '#00ffff',
  
  // UI
  energyBar: '#00ff00',
  healthBar: '#ff4444',
  
  // Pickups
  forceFieldPickup: '#00aaff',
  healthPickup: '#ff4488',
  
  // Civilians
  civilian: '#ffff00',
  civilianDetail: '#ffaa00',
  civilianRescued: '#00ff00',
  
  // Stars - layered for depth
  starFar: 'rgba(100, 120, 180, 0.3)',
  starMid: 'rgba(180, 200, 255, 0.5)',
  starNear: 'rgba(255, 255, 255, 0.9)',
  nebula1: 'rgba(100, 0, 150, 0.03)',
  nebula2: 'rgba(0, 100, 150, 0.02)',
};

// Smaller, more detailed sprites
export const SPRITE_SIZE = {
  player: { width: 32, height: 14 }, // Larger Zaxxon-style ship
  bullet: { width: 6, height: 2 },
  bulletSmall: { width: 2, height: 2 }, // Smaller hostile person bullets
  bomb: { width: 4, height: 4 },
  enemy: { width: 16, height: 16 },
  civilian: { width: 5, height: 8 },
  pickup: { width: 6, height: 6 },
  hostilePerson: { width: 6, height: 10 },
};

export const TERRAIN_CONFIG = {
  segmentWidth: 20,
  minHeight: 40,
  maxHeight: 120,
  variationSpeed: 0.015,
  structureChance: 0.12,
};

export const ENEMY_CONFIG = {
  spawnInterval: 100,
  maxEnemies: 18, // Increased from 12 - more enemies allowed
  turretFireRate: 180, // Slower shooting for balance
  droneFireRate: 120, // Slower shooting for balance
  droneSpeed: 1.3, // Slightly slower
  missileSpeed: 2.5, // Slightly slower
  leechSpeed: 0.8, // Slightly slower
  enemyDamageMultiplier: 0.7, // Enemies deal less damage
};

export const SPAWN_CONFIG = {
  civilianChance: 0.006,
  pickupChance: 0.0018, // 40% rarer than before (was 0.003)
  enemyChance: 0.025, // Increased - more enemies spawn (was 0.012)
  hostilePersonChance: 0.003, // Slightly increased
  formationChance: 0.4, // Chance to spawn formation instead of single enemy
  formationSize: { min: 3, max: 6 }, // Formation size range
  // Power-up drop chances when formation/group is destroyed
  powerUpDropChance: 0.21, // 40% rarer (was 0.35)
  killsForDrop: 4, // Drop power-up every N kills if not in formation
};

// Auto-rescue distance (player must be within this height range above civilian)
export const AUTO_RESCUE_MIN_Y = 5; // Minimum pixels above civilian
export const AUTO_RESCUE_MAX_Y = 15; // Maximum pixels above civilian

// Horizontal rescue distance
export const AUTO_RESCUE_DISTANCE_X = 20; // Must be close horizontally

// Finger offset - ship appears ahead of finger
export const TOUCH_CONFIG = {
  shipOffsetX: 132, // Ship is 132px ahead of finger horizontally
  shipOffsetY: -40, // Ship is 40px above finger
  smoothing: 0.12, // Movement smoothing factor
};
