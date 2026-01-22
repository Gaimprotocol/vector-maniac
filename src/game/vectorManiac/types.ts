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
  type: 'drone' | 'shooter' | 'elite' | 'bounty' | 'boss' | 'miniboss';
  fireTimer: number;
  behaviorTimer: number;
  targetAngle: number;
}

export type BossProjectileType = 'normal' | 'laser' | 'plasma' | 'energy' | 'fire' | 'ice' | 'void' | 'electric' | 'toxic' | 'pulse';

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
  bossType?: BossProjectileType; // For boss projectile visual variation
  bossColor?: string; // For boss-specific projectile colors
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

// Available upgrades - HEAVILY REDUCED BONUSES v2
export const VECTOR_UPGRADES: VectorUpgrade[] = [
  {
    id: 'magnetRange',
    name: 'Magnet+',
    description: '+8% salvage magnet range',
    icon: '🧲',
    apply: (stats) => ({ ...stats, magnetRange: stats.magnetRange * 1.08 }), // Was 10%
  },
  {
    id: 'fireRate',
    name: 'Rapid Fire',
    description: '+4% fire rate',
    icon: '🔥',
    apply: (stats) => ({ ...stats, fireRate: stats.fireRate * 0.96 }), // Was 6%
  },
  {
    id: 'bulletSpeed',
    name: 'Velocity',
    description: '+5% bullet speed',
    icon: '💨',
    apply: (stats) => ({ ...stats, bulletSpeed: stats.bulletSpeed * 1.05 }), // Was 8%
  },
  {
    id: 'damage',
    name: 'Power',
    description: '+3% damage',
    icon: '💥',
    apply: (stats) => ({ ...stats, damage: stats.damage * 1.03 }), // Was 5%
  },
  {
    id: 'pierce',
    name: 'Pierce',
    description: '+1 bullet penetration',
    icon: '🎯',
    maxStack: 1, // Was 2 - only 1 pierce from boss now
    apply: (stats) => ({ ...stats, pierce: stats.pierce + 1 }),
  },
  {
    id: 'shield',
    name: 'Shield',
    description: '+1 extra hit protection',
    icon: '🛡️',
    maxStack: 1, // Was 2 - only 1 shield from boss now
    apply: (stats) => ({ ...stats, shields: stats.shields + 1 }),
  },
  {
    id: 'salvageBonus',
    name: 'Scavenger',
    description: '+8% salvage value',
    icon: '💎',
    apply: (stats) => ({ ...stats, salvageBonus: stats.salvageBonus * 1.08 }), // Was 10%
  },
  {
    id: 'speed',
    name: 'Thrusters',
    description: '+3% movement speed',
    icon: '🚀',
    apply: (stats) => ({ ...stats, speed: stats.speed * 1.03 }), // Was 5%
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
  bossWarning: boolean;
  bossWarningTimer: number;
  bossEnraged: boolean;          // True once boss enters rage mode (< 50% health)
  bossEnragedTimer: number;      // Timer for "ENRAGED!" message display
  screenShakeIntensity: number;  // Current screen shake intensity (0 = no shake)
  
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
