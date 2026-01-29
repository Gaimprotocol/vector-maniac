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
  lastPowerUpCollected: ArenaPowerUpType | null;
  powerUpNotificationTimer: number;
  
  // Match info
  difficulty: ArenaDifficulty;
  entryCost: number;
  potentialRewards: ArenaReward[];
  earnedReward: ArenaReward | null;
  
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

// Opponent names by difficulty
export const ARENA_OPPONENT_NAMES: Record<ArenaDifficulty, string[]> = {
  bronze: ['Rookie-7', 'Cadet Nova', 'Trainee Flux', 'Scout Delta'],
  silver: ['Veteran Pulse', 'Ace Striker', 'Hunter Zeta', 'Blade Runner'],
  gold: ['Champion Vex', 'Elite Phantom', 'Omega Hunter', 'Star Crusher'],
  diamond: ['Legendary Void', 'Apex Predator', 'The Annihilator', 'Death Vector'],
};

// Difficulty multipliers - Higher health, better AI
export const ARENA_DIFFICULTY_STATS: Record<ArenaDifficulty, {
  health: number;
  damage: number;
  speed: number;
  fireRate: number;
  accuracy: number;
  rewardMultiplier: number;
}> = {
  bronze: { health: 150, damage: 6, speed: 2.0, fireRate: 50, accuracy: 0.35, rewardMultiplier: 1 },
  silver: { health: 220, damage: 8, speed: 2.5, fireRate: 40, accuracy: 0.5, rewardMultiplier: 2 },
  gold: { health: 320, damage: 10, speed: 3.0, fireRate: 32, accuracy: 0.7, rewardMultiplier: 4 },
  diamond: { health: 450, damage: 14, speed: 3.5, fireRate: 25, accuracy: 0.85, rewardMultiplier: 8 },
};
