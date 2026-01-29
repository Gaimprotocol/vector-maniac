// Arena Battle Mode State Management

import { 
  ArenaState, 
  ArenaOpponent, 
  ArenaObstacle, 
  ArenaDifficulty,
  ArenaReward,
  ARENA_ENTRY_COSTS,
  ARENA_OPPONENT_NAMES,
  ARENA_DIFFICULTY_STATS,
} from './types';
import { ARENA_CONFIG } from './constants';
import { getComputedStats } from '@/hooks/useShipUpgrades';
import { getStoredMegaShipId } from '@/hooks/useMegaShips';
import { SHIP_MODELS } from '../shipModels';

function generateObstacles(): ArenaObstacle[] {
  const obstacles: ArenaObstacle[] = [];
  const baseCount = Math.floor(Math.random() * (ARENA_CONFIG.maxObstacles - ARENA_CONFIG.minObstacles + 1)) + ARENA_CONFIG.minObstacles;
  
  const padding = 100;
  const centerX = ARENA_CONFIG.arenaWidth / 2;
  const centerY = ARENA_CONFIG.arenaHeight / 2;
  
  // Define safe zones for spawns - larger for the bigger arena
  const playerSpawnZone = 300; // Bottom area
  const opponentSpawnZone = 300; // Top area
  
  const isValidPosition = (x: number, y: number, minDist: number = 100): boolean => {
    if (y > ARENA_CONFIG.arenaHeight - playerSpawnZone) return false;
    if (y < opponentSpawnZone) return false;
    if (Math.abs(x - centerX) < 120 && Math.abs(y - centerY) < 120) return false;
    return !obstacles.some(o => Math.abs(o.x - x) < minDist && Math.abs(o.y - y) < minDist);
  };
  
  // Regular obstacles (pillars and walls)
  for (let i = 0; i < baseCount; i++) {
    const type = Math.random() < 0.6 ? 'pillar' : 'wall';
    
    let x: number, y: number;
    let attempts = 0;
    
    do {
      x = padding + Math.random() * (ARENA_CONFIG.arenaWidth - padding * 2);
      y = padding + Math.random() * (ARENA_CONFIG.arenaHeight - padding * 2);
      attempts++;
    } while (attempts < 50 && !isValidPosition(x, y));
    
    if (attempts < 50) {
      obstacles.push({
        id: `obstacle_${i}`,
        x,
        y,
        width: type === 'pillar' ? ARENA_CONFIG.pillarSize : ARENA_CONFIG.wallWidth,
        height: type === 'pillar' ? ARENA_CONFIG.pillarSize : ARENA_CONFIG.wallHeight,
        type,
        destructible: Math.random() < 0.2,
        health: Math.random() < 0.2 ? 50 : undefined,
      });
    }
  }
  
  // Add 1-2 rotating laser grids
  const laserCount = 1 + Math.floor(Math.random() * 2);
  for (let i = 0; i < laserCount; i++) {
    let x: number, y: number;
    let attempts = 0;
    
    do {
      x = padding + 100 + Math.random() * (ARENA_CONFIG.arenaWidth - padding * 2 - 200);
      y = padding + 150 + Math.random() * (ARENA_CONFIG.arenaHeight - padding * 2 - 300);
      attempts++;
    } while (attempts < 50 && !isValidPosition(x, y, 180));
    
    if (attempts < 50) {
      obstacles.push({
        id: `laser_${i}`,
        x,
        y,
        width: 20,
        height: 20,
        type: 'laserGrid',
        destructible: false,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (0.015 + Math.random() * 0.01) * (Math.random() < 0.5 ? 1 : -1),
        laserLength: 120 + Math.random() * 60,
      });
    }
  }
  
  // Add 2-3 phase platforms
  const phaseCount = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < phaseCount; i++) {
    let x: number, y: number;
    let attempts = 0;
    
    do {
      x = padding + Math.random() * (ARENA_CONFIG.arenaWidth - padding * 2);
      y = padding + 150 + Math.random() * (ARENA_CONFIG.arenaHeight - padding * 2 - 300);
      attempts++;
    } while (attempts < 50 && !isValidPosition(x, y, 120));
    
    if (attempts < 50) {
      obstacles.push({
        id: `phase_${i}`,
        x,
        y,
        width: 70 + Math.random() * 40,
        height: 70 + Math.random() * 40,
        type: 'phasePlatform',
        destructible: false,
        phaseTimer: Math.floor(Math.random() * 180), // Stagger start times
        phaseDuration: 120 + Math.floor(Math.random() * 60), // 2-3 seconds
        isVisible: Math.random() < 0.5,
      });
    }
  }
  
  return obstacles;
}

function createOpponent(difficulty: ArenaDifficulty): ArenaOpponent {
  const stats = ARENA_DIFFICULTY_STATS[difficulty];
  const names = ARENA_OPPONENT_NAMES[difficulty];
  const name = names[Math.floor(Math.random() * names.length)];
  
  // Pick a random ship model for the opponent
  const shipIds = Object.keys(SHIP_MODELS);
  const shipId = shipIds[Math.floor(Math.random() * shipIds.length)];
  
  const spawnX = ARENA_CONFIG.arenaWidth / 2;
  const spawnY = 200; // Top of arena (larger arena needs more space)
  
  return {
    id: 'opponent_1',
    x: spawnX,
    y: spawnY,
    angle: Math.PI / 2, // Facing down
    health: stats.health,
    maxHealth: stats.health,
    shipId,
    name,
    difficulty,
    targetX: spawnX,
    targetY: spawnY,
    fireTimer: 0,
    behaviorTimer: 0,
    behaviorState: 'chase',
    damage: stats.damage,
    fireRate: stats.fireRate,
    speed: stats.speed,
    accuracy: stats.accuracy,
  };
}

function generatePotentialRewards(difficulty: ArenaDifficulty): ArenaReward[] {
  const multiplier = ARENA_DIFFICULTY_STATS[difficulty].rewardMultiplier;
  const rewards: ArenaReward[] = [];
  
  // Always include scraps reward
  rewards.push({
    type: 'scraps',
    id: 'scraps_reward',
    name: 'Scrap Bounty',
    description: `${50 * multiplier} scraps`,
    value: 50 * multiplier,
    rarity: 'common',
    icon: '◆',
  });
  
  // Chance for better rewards based on difficulty
  const roll = Math.random();
  
  if (difficulty === 'diamond' && roll < 0.15) {
    rewards.push({
      type: 'unique_ship',
      id: `arena_ship_${Date.now()}`,
      name: 'Arena Champion',
      description: 'Exclusive arena-only ship skin',
      rarity: 'legendary',
      icon: '⬢',
    });
  } else if (difficulty === 'gold' && roll < 0.2) {
    rewards.push({
      type: 'rare_ally',
      id: `arena_ally_${Date.now()}`,
      name: 'Battle Drone',
      description: 'A fierce companion forged in battle',
      rarity: 'epic',
      icon: '◈',
    });
  } else if (difficulty === 'silver' && roll < 0.25) {
    rewards.push({
      type: 'power_upgrade',
      id: `arena_upgrade_${Date.now()}`,
      name: 'Arena Boost',
      description: '+5% permanent damage in arena',
      rarity: 'rare',
      icon: '⊕',
    });
  }
  
  return rewards;
}

export function createArenaState(difficulty: ArenaDifficulty): ArenaState {
  const centerX = ARENA_CONFIG.arenaWidth / 2;
  const playerY = ARENA_CONFIG.arenaHeight - 250; // More room at bottom for larger arena
  
  const upgrades = getComputedStats();
  const playerMaxHealth = Math.floor(ARENA_CONFIG.playerMaxHealth * upgrades.healthMultiplier);
  
  return {
    phase: 'entering',
    phaseTimer: ARENA_CONFIG.enteringDuration,
    gameTime: 0,
    
    arenaWidth: ARENA_CONFIG.arenaWidth,
    arenaHeight: ARENA_CONFIG.arenaHeight,
    
    // Player starts at bottom center
    playerX: centerX,
    playerY: playerY,
    playerAngle: -Math.PI / 2, // Facing up
    targetX: centerX,
    targetY: playerY,
    playerHealth: playerMaxHealth,
    playerMaxHealth: playerMaxHealth,
    playerFireTimer: 0,
    playerInvulnerable: 0,
    
    // Opponent
    opponent: createOpponent(difficulty),
    opponentStunTimer: 0,
    
    // Environment
    obstacles: generateObstacles(),
    projectiles: [],
    particles: [],
    powerUps: [],
    
    // Active effects
    overdriveTimer: 0,
    powerUpSpawnTimer: 300, // First power-up spawns after 5 seconds
    lastPowerUpCollected: null,
    powerUpNotificationTimer: 0,
    
    // Match info
    difficulty,
    entryCost: ARENA_ENTRY_COSTS[difficulty],
    potentialRewards: generatePotentialRewards(difficulty),
    earnedReward: null,
    
    screenShakeIntensity: 0,
    teleportFlashTimer: 0,
    empFlashTimer: 0,
    soundQueue: [],
  };
}

// Check if player can afford arena entry
export function canAffordArena(difficulty: ArenaDifficulty, currentScraps: number): boolean {
  return currentScraps >= ARENA_ENTRY_COSTS[difficulty];
}
