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

export type ArenaMode = 'ai' | 'multiplayer';

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
  
  // Player profile (for multiplayer illusion)
  isHumanPlayer?: boolean;
  playerTag?: string;
  playerLevel?: number;
  playerCountry?: string;
  playStyle?: string;
  
  // AI behavior
  targetX: number;
  targetY: number;
  fireTimer: number;
  behaviorTimer: number;
  behaviorState: 'chase' | 'evade' | 'strafe' | 'cover';
  behaviorWeights?: Record<string, number>; // Weighted behavior selection
  
  // Stats (scaled by difficulty)
  damage: number;
  fireRate: number;
  speed: number;
  accuracy: number; // 0-1, affects aim prediction
  dodgeSkill?: number; // How well they evade
  adaptability?: number; // How quickly they change tactics
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

// Arena-specific power-ups
export type ArenaPowerUpType = 'emp' | 'teleport' | 'shield' | 'overdrive';

export interface ArenaPowerUp {
  id: string;
  x: number;
  y: number;
  type: ArenaPowerUpType;
  bobOffset: number; // For floating animation
  spawnTime: number;
}

export const ARENA_POWERUP_INFO: Record<ArenaPowerUpType, {
  name: string;
  description: string;
  color: string;
  glowColor: string;
  duration?: number; // Effect duration in frames (if applicable)
}> = {
  emp: {
    name: 'EMP Blast',
    description: 'Stuns opponent for 3 seconds',
    color: '#00ccff',
    glowColor: '#0088ff',
    duration: 180,
  },
  teleport: {
    name: 'Phase Shift',
    description: 'Instantly teleport to safety',
    color: '#cc00ff',
    glowColor: '#8800cc',
  },
  shield: {
    name: 'Shield Boost',
    description: 'Restores 30 hull integrity',
    color: '#00ff88',
    glowColor: '#00cc66',
  },
  overdrive: {
    name: 'Overdrive',
    description: 'Double fire rate for 5 seconds',
    color: '#ffaa00',
    glowColor: '#ff6600',
    duration: 300,
  },
};

// Consumable boosts applied to player for this match
export interface ArenaBoosts {
  healthBoost: number;
  damageMultiplier: number;
  speedMultiplier: number;
  fireRateMultiplier: number;
  hasStartingShield: boolean;
  powerUpDurationMultiplier: number;
  doubleScrapReward: boolean;
}

export interface ArenaState {
  phase: ArenaPhase;
  phaseTimer: number;
  gameTime: number;
  
  // Current arena
  arenaId: string;
  arenaName: string;
  
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
  playerDamage: number; // Base damage with boosts applied
  playerSpeed: number; // Base speed with boosts applied
  playerFireRate: number; // Base fire rate with boosts applied
  
  // Opponent
  opponent: ArenaOpponent | null;
  opponentStunTimer: number; // EMP stun duration
  
  // Environment
  obstacles: ArenaObstacle[];
  projectiles: ArenaProjectile[];
  particles: ArenaParticle[];
  powerUps: ArenaPowerUp[];
  
  // Active effects
  overdriveTimer: number; // Overdrive active duration
  powerUpSpawnTimer: number; // Timer until next power-up spawns
  powerUpDurationMultiplier: number; // From consumables
  lastPowerUpCollected: ArenaPowerUpType | null;
  powerUpNotificationTimer: number;
  
  // Match info
  difficulty: ArenaDifficulty;
  entryCost: number;
  potentialRewards: ArenaReward[];
  earnedReward: ArenaReward | null; // Deprecated, use earnedRewards
  earnedRewards: ArenaReward[]; // New: supports multiple rewards
  doubleScrapReward: boolean; // From consumables
  
  // Visual effects
  screenShakeIntensity: number;
  teleportFlashTimer: number;
  empFlashTimer: number;
  
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

// Scrap rewards - ALWAYS more than entry cost for profitable wins
export const ARENA_SCRAP_REWARDS: Record<ArenaDifficulty, number> = {
  bronze: 100,    // 50 cost → 100 reward = 2x return (50 profit)
  silver: 300,    // 150 cost → 300 reward = 2x return (150 profit)
  gold: 700,      // 400 cost → 700 reward = 1.75x return (300 profit)
  diamond: 1800,  // 1000 cost → 1800 reward = 1.8x return (800 profit)
};

// Opponent names by difficulty
export const ARENA_OPPONENT_NAMES: Record<ArenaDifficulty, string[]> = {
  bronze: ['Rookie-7', 'Cadet Nova', 'Trainee Flux', 'Scout Delta'],
  silver: ['Veteran Pulse', 'Ace Striker', 'Hunter Zeta', 'Blade Runner'],
  gold: ['Champion Vex', 'Elite Phantom', 'Omega Hunter', 'Star Crusher'],
  diamond: ['Legendary Void', 'Apex Predator', 'The Annihilator', 'Death Vector'],
};

// Difficulty multipliers - 10% easier across the board
export const ARENA_DIFFICULTY_STATS: Record<ArenaDifficulty, {
  health: number;
  damage: number;
  speed: number;
  fireRate: number;
  accuracy: number;
  rewardMultiplier: number;
}> = {
  bronze: { health: 162, damage: 9, speed: 3.15, fireRate: 31, accuracy: 0.50, rewardMultiplier: 1 },
  silver: { health: 234, damage: 13, speed: 3.8, fireRate: 24, accuracy: 0.63, rewardMultiplier: 2 },
  gold: { health: 342, damage: 16, speed: 4.5, fireRate: 18, accuracy: 0.77, rewardMultiplier: 4 },
  diamond: { health: 495, damage: 22, speed: 5.4, fireRate: 13, accuracy: 0.86, rewardMultiplier: 8 },
};
