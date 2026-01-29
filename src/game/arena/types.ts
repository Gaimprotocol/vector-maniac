// Arena Battle Mode Types

export type ArenaPhase = 
  | 'entering'      // Pre-battle intro
  | 'countdown'     // 3-2-1 countdown
  | 'fighting'      // Active combat
  | 'playerWon'     // Victory sequence
  | 'playerLost'    // Defeat sequence
  | 'rewards';      // Showing rewards

export type ArenaDifficulty = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface ArenaObstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'pillar' | 'wall' | 'barrier' | 'laserGrid' | 'phasePlatform';
  health?: number; // Some obstacles can be destroyed
  destructible: boolean;
  
  // Laser grid specific
  rotation?: number; // Current rotation angle
  rotationSpeed?: number; // Radians per frame
  laserLength?: number; // Length of laser beams
  
  // Phase platform specific
  phaseTimer?: number; // Timer for phase cycle
  phaseDuration?: number; // How long each phase lasts
  isVisible?: boolean; // Current visibility state
}

export interface ArenaOpponent {
  id: string;
  x: number;
  y: number;
  angle: number;
  health: number;
  maxHealth: number;
  shipId: string; // Which ship model they use
  name: string;
  difficulty: ArenaDifficulty;
  
  // AI behavior
  targetX: number;
  targetY: number;
  fireTimer: number;
  behaviorTimer: number;
  behaviorState: 'chase' | 'evade' | 'strafe' | 'cover';
  
  // Stats (scaled by difficulty)
  damage: number;
  fireRate: number;
  speed: number;
  accuracy: number; // 0-1, affects aim prediction
}

export interface ArenaProjectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  isPlayer: boolean;
  size: number;
  shipId?: string;
}

export interface ArenaParticle {
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

export type ArenaRewardType = 
  | 'scraps'
  | 'unique_ship'
  | 'rare_ally'
  | 'power_upgrade';

export interface ArenaReward {
  type: ArenaRewardType;
  id: string;
  name: string;
  description: string;
  value?: number; // For scraps
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
}

export interface ArenaState {
  phase: ArenaPhase;
  phaseTimer: number;
  gameTime: number;
  
  // Arena dimensions (slightly smaller than main game)
  arenaWidth: number;
  arenaHeight: number;
  
  // Player
  playerX: number;
  playerY: number;
  playerAngle: number;
  targetX: number;
  targetY: number;
  playerHealth: number;
  playerMaxHealth: number;
  playerFireTimer: number;
  playerInvulnerable: number;
  
  // Opponent
  opponent: ArenaOpponent | null;
  
  // Environment
  obstacles: ArenaObstacle[];
  projectiles: ArenaProjectile[];
  particles: ArenaParticle[];
  
  // Match info
  difficulty: ArenaDifficulty;
  entryCost: number;
  potentialRewards: ArenaReward[];
  earnedReward: ArenaReward | null;
  
  // Visual effects
  screenShakeIntensity: number;
  
  // Sound queue
  soundQueue: string[];
}

// Entry costs per difficulty (in scraps)
export const ARENA_ENTRY_COSTS: Record<ArenaDifficulty, number> = {
  bronze: 50,
  silver: 150,
  gold: 400,
  diamond: 1000,
};

// Opponent names by difficulty
export const ARENA_OPPONENT_NAMES: Record<ArenaDifficulty, string[]> = {
  bronze: ['Rookie-7', 'Cadet Nova', 'Trainee Flux', 'Scout Delta'],
  silver: ['Veteran Pulse', 'Ace Striker', 'Hunter Zeta', 'Blade Runner'],
  gold: ['Champion Vex', 'Elite Phantom', 'Omega Hunter', 'Star Crusher'],
  diamond: ['Legendary Void', 'Apex Predator', 'The Annihilator', 'Death Vector'],
};

// Difficulty multipliers
export const ARENA_DIFFICULTY_STATS: Record<ArenaDifficulty, {
  health: number;
  damage: number;
  speed: number;
  fireRate: number;
  accuracy: number;
  rewardMultiplier: number;
}> = {
  bronze: { health: 80, damage: 8, speed: 2.5, fireRate: 35, accuracy: 0.3, rewardMultiplier: 1 },
  silver: { health: 120, damage: 12, speed: 3.5, fireRate: 28, accuracy: 0.5, rewardMultiplier: 2 },
  gold: { health: 180, damage: 18, speed: 4.5, fireRate: 22, accuracy: 0.7, rewardMultiplier: 4 },
  diamond: { health: 280, damage: 25, speed: 5.5, fireRate: 16, accuracy: 0.9, rewardMultiplier: 8 },
};
