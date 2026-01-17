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
  type: 'drone' | 'shooter' | 'elite' | 'bounty';
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
}

export interface VectorUpgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  apply: (stats: PlayerStats) => PlayerStats;
}

export interface PlayerStats {
  fireRate: number;        // Lower = faster
  bulletSpeed: number;
  damage: number;
  pierce: number;
  magnetRange: number;
  salvageBonus: number;    // Multiplier
  shields: number;         // Extra hits
  speed: number;
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
  
  // Wave/Segment management
  currentWave: number;      // 1-9
  currentSegment: number;   // 1-3
  enemiesSpawned: number;
  enemiesDefeated: number;
  enemiesInWave: number;
  spawnTimer: number;
  
  // Scoring
  score: number;
  salvageCount: number;
  combo: number;
  comboTimer: number;
  
  // Portal choice (for next segment)
  portalChoice: 'safe' | 'risk' | null;
  difficultyMultiplier: number;
  upgradesPending: number;
  
  // Available upgrades for picking
  availableUpgrades: VectorUpgrade[];
  
  // Sound queue
  soundQueue: string[];
  
  // Input tracking
  inputReleased: boolean;
}
