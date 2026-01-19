// Vector Maniac - Top-Down Arena Shooter Types

export type VectorPhase = 
  | 'entering'       // Ship flies to center
  | 'playing'        // Main gameplay
  | 'waveComplete'   // Wave transition
  | 'portalChoice'   // Safe vs Risk portal choice
  | 'upgradePick'    // Picking upgrades
  | 'gameOver'       // Player died
  | 'victory';       // Beat the bounty boss

export interface VectorEnemy {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  health: number;
  maxHealth: number;
  type: 'drone' | 'shooter' | 'elite' | 'bounty' | 'boss';
  fireTimer: number;
  behaviorTimer: number;
  targetAngle: number;
}

export interface VectorProjectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  isPlayer: boolean;
  size: number;
  pierce: number; // How many enemies it can hit
}

export interface VectorParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface VectorSalvage {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  value: number;
  magnetized: boolean;
  isRare: boolean; // 5% chance, gives full health
}

export type PowerUpType = 'shield' | 'nuke' | 'doublePoints' | 'doubleShot' | 'speedBoost';

export interface VectorPowerUp {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: PowerUpType;
  life: number; // Frames until despawn
}

export interface ActivePowerUps {
  doublePoints: number; // Frames remaining
  doubleShot: number;
  speedBoost: number;
}

export interface VectorUpgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  maxStack?: number;
  apply: (stats: PlayerStats) => PlayerStats;
}

// Available upgrades
export const VECTOR_UPGRADES: VectorUpgrade[] = [
  {
    id: 'magnetRange',
    name: 'Magnet+',
    description: '+20% salvage magnet range',
    icon: '🧲',
    apply: (stats) => ({ ...stats, magnetRange: stats.magnetRange * 1.2 }),
  },
  {
    id: 'fireRate',
    name: 'Rapid Fire',
    description: '+12% fire rate',
    icon: '🔥',
    apply: (stats) => ({ ...stats, fireRate: stats.fireRate * 0.88 }),
  },
  {
    id: 'bulletSpeed',
    name: 'Velocity',
    description: '+15% bullet speed',
    icon: '💨',
    apply: (stats) => ({ ...stats, bulletSpeed: stats.bulletSpeed * 1.15 }),
  },
  {
    id: 'damage',
    name: 'Power',
    description: '+10% damage',
    icon: '💥',
    apply: (stats) => ({ ...stats, damage: stats.damage * 1.1 }),
  },
  {
    id: 'pierce',
    name: 'Pierce',
    description: '+1 bullet penetration',
    icon: '🎯',
    maxStack: 3,
    apply: (stats) => ({ ...stats, pierce: stats.pierce + 1 }),
  },
  {
    id: 'shield',
    name: 'Shield',
    description: '+1 extra hit protection',
    icon: '🛡️',
    maxStack: 3,
    apply: (stats) => ({ ...stats, shields: stats.shields + 1 }),
  },
  {
    id: 'salvageBonus',
    name: 'Scavenger',
    description: '+20% salvage value',
    icon: '💎',
    apply: (stats) => ({ ...stats, salvageBonus: stats.salvageBonus * 1.2 }),
  },
  {
    id: 'speed',
    name: 'Thrusters',
    description: '+10% movement speed',
    icon: '🚀',
    apply: (stats) => ({ ...stats, speed: stats.speed * 1.1 }),
  },
];

export interface PlayerStats {
  fireRate: number;        // Lower = faster
  bulletSpeed: number;
  damage: number;
  pierce: number;
  magnetRange: number;
  salvageBonus: number;    // Multiplier
  shields: number;         // Extra hits
  speed: number;
  extraCannons: number;    // Side-mounted guns from permanent upgrades
}

export interface VectorState {
  phase: VectorPhase;
  phaseTimer: number;
  gameTime: number;
  
  // Player
  playerX: number;
  playerY: number;
  playerAngle: number;
  targetX: number;
  targetY: number;
  fireTimer: number;
  health: number;
  maxHealth: number;
  shields: number;
  invulnerableTimer: number;
  
  // Player stats (modified by upgrades)
  stats: PlayerStats;
  
  // Gameplay entities
  enemies: VectorEnemy[];
  projectiles: VectorProjectile[];
  particles: VectorParticle[];
  salvage: VectorSalvage[];
  powerups: VectorPowerUp[];
  
  // Active power-up timers
  activePowerUps: ActivePowerUps;
  
  // Map-based progression (50 maps, each with 1-3 waves)
  currentLevel: number;        // Increases after completing all 50 maps
  currentMap: number;          // 1-50
  currentWave: number;         // Wave within current map
  wavesInMap: number;          // Randomized 1-3 waves per map
  totalWavesCompleted: number;
  totalMapsCompleted: number;
  
  // Boss tracking
  bossActive: boolean;
  bossDefeated: boolean;
  
  // Map transition display
  showMapName: boolean;
  mapNameTimer: number;
  
  enemiesSpawned: number;
  enemiesDefeated: number;
  enemiesInWave: number;
  spawnTimer: number;
  
  // Scoring
  score: number;
  salvageCount: number;
  combo: number;
  comboTimer: number;
  
  // Difficulty scaling
  difficultyMultiplier: number;
  upgradesPending: number;
  
  // Available upgrades for picking
  availableUpgrades: VectorUpgrade[];
  
  // Sound queue
  soundQueue: string[];
  
  // Input tracking
  inputReleased: boolean;
}
