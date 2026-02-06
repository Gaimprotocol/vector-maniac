// Vector Maniac - Top-Down Arena Shooter Types

export type VectorPhase = 
  | 'entering'       // Ship flies to center
  | 'playing'        // Main gameplay
  | 'waveComplete'   // Wave transition
  | 'portalChoice'   // Safe vs Risk portal choice
  | 'upgradePick'    // Picking upgrades
  | 'dying'          // Player death explosion (slow motion)
  | 'gameOver'       // Player died - show end screen
  | 'victory'        // Beat the bounty boss
  | 'hyperspace'     // Vertical scrolling shooter mode
  | 'hyperspaceEnter' // Transition into hyperspace
  | 'hyperspaceExit'; // Transition out of hyperspace

export interface VectorEnemy {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  health: number;
  maxHealth: number;
  type: 'drone' | 'shooter' | 'elite' | 'bounty' | 'boss' | 'miniboss' | 'dasher' | 'splitter' | 'orbiter' | 'sniper' | 'anomaly' 
    // New enemy types (15 total)
    | 'bomber' | 'shielder' | 'teleporter' | 'leech' | 'mirror' 
    | 'pulsar' | 'swarm' | 'charger' | 'phaser' | 'vortex'
    | 'replicator' | 'stealth' | 'titan' | 'parasite' | 'nova';
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
  // Ship-specific projectile styling (player bullets only)
  shipId?: string; // The ship model that fired this projectile
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

export type PowerUpType = 'shield' | 'nuke' | 'doublePoints' | 'doubleShot' | 'speedBoost' | 'warpShield' | 'formationBreaker' | 'timeWarp' | 'magnetPulse' | 'chainLightning';

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
  warpShield: number;    // Hyperspace-only: absorbs 3 hits
  timeWarp: number;      // Hyperspace-only: slows enemies
  magnetPulse: number;   // Hyperspace-only: pulls all salvage
  chainLightning: number; // Chain lightning effect on hit
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
    icon: '◎',
    apply: (stats) => ({ ...stats, magnetRange: stats.magnetRange * 1.08 }), // Was 10%
  },
  {
    id: 'fireRate',
    name: 'Rapid Fire',
    description: '+4% fire rate',
    icon: '◇',
    apply: (stats) => ({ ...stats, fireRate: stats.fireRate * 0.96 }), // Was 6%
  },
  {
    id: 'bulletSpeed',
    name: 'Velocity',
    description: '+5% bullet speed',
    icon: '▷',
    apply: (stats) => ({ ...stats, bulletSpeed: stats.bulletSpeed * 1.05 }), // Was 8%
  },
  {
    id: 'damage',
    name: 'Power',
    description: '+3% damage',
    icon: '◈',
    apply: (stats) => ({ ...stats, damage: stats.damage * 1.03 }), // Was 5%
  },
  {
    id: 'pierce',
    name: 'Pierce',
    description: '+1 bullet penetration',
    icon: '⊕',
    maxStack: 1, // Was 2 - only 1 pierce from boss now
    apply: (stats) => ({ ...stats, pierce: stats.pierce + 1 }),
  },
  {
    id: 'shield',
    name: 'Shield',
    description: '+1 extra hit protection',
    icon: '⬡',
    maxStack: 1, // Was 2 - only 1 shield from boss now
    apply: (stats) => ({ ...stats, shields: stats.shields + 1 }),
  },
  {
    id: 'salvageBonus',
    name: 'Scavenger',
    description: '+8% salvage value',
    icon: '◆',
    apply: (stats) => ({ ...stats, salvageBonus: stats.salvageBonus * 1.08 }), // Was 10%
  },
  {
    id: 'speed',
    name: 'Thrusters',
    description: '+3% movement speed',
    icon: '⊳',
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

export interface CompanionState {
  seed: number;
  name: string;
  shape: string;
  hue: number;
  saturation: number;
  behavior: string;
  ability: string;
  x: number;
  y: number;
  angle: number;
  fireTimer: number;
  evolutionLevel: number;      // 1 = base, 2+ = evolved
  health: number;              // Current health
  maxHealth: number;           // Max health (scales with evolution)
  invulnerableTimer: number;   // Brief invulnerability after hit
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
  
  // Hyperspace mode
  hyperspaceActive: boolean;
  hyperspaceTimer: number;           // Duration remaining in frames
  hyperspaceDuration: number;        // Total duration for this hyperspace
  hyperspaceScrollOffset: number;    // Background scroll position
  hyperspaceTransitionProgress: number; // 0-1 for smooth transitions
  nextHyperspaceMap: number;         // Map number when next hyperspace triggers
  hyperspaceFormationTimer: number;  // Timer for spawning enemy formations
  hyperspacePlayerBaseY: number;     // Player's base Y position during hyperspace
  
  // Visual anomaly system
  backgroundAnomalySeed: number | null;   // Seed for procedural background (null = use normal theme)
  hyperspaceAnomalySeed: number | null;   // Seed for procedural hyperspace (null = use normal variant)

  // Power-up tracking (per map)
  chainLightningDropsThisMap: number;
  
  // Companion system
  companion: CompanionState | null;
}
