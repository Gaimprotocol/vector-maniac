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
  const count = Math.floor(Math.random() * (ARENA_CONFIG.maxObstacles - ARENA_CONFIG.minObstacles + 1)) + ARENA_CONFIG.minObstacles;
  
  const padding = 80;
  const centerX = ARENA_CONFIG.arenaWidth / 2;
  const centerY = ARENA_CONFIG.arenaHeight / 2;
  
  for (let i = 0; i < count; i++) {
    const type = Math.random() < 0.6 ? 'pillar' : 'wall';
    
    let x: number, y: number;
    let attempts = 0;
    
    // Avoid spawning too close to spawn points or center
    do {
      x = padding + Math.random() * (ARENA_CONFIG.arenaWidth - padding * 2);
      y = padding + Math.random() * (ARENA_CONFIG.arenaHeight - padding * 2);
      attempts++;
    } while (
      attempts < 50 && (
        // Too close to player spawn (bottom)
        (y > ARENA_CONFIG.arenaHeight - 150) ||
        // Too close to opponent spawn (top)
        (y < 150) ||
        // Too close to center
        (Math.abs(x - centerX) < 60 && Math.abs(y - centerY) < 60) ||
        // Too close to other obstacles
        obstacles.some(o => 
          Math.abs(o.x - x) < 80 && Math.abs(o.y - y) < 80
        )
      )
    );
    
    obstacles.push({
      id: `obstacle_${i}`,
      x,
      y,
      width: type === 'pillar' ? ARENA_CONFIG.pillarSize : ARENA_CONFIG.wallWidth,
      height: type === 'pillar' ? ARENA_CONFIG.pillarSize : ARENA_CONFIG.wallHeight,
      type,
      destructible: Math.random() < 0.2, // 20% chance to be destructible
      health: Math.random() < 0.2 ? 50 : undefined,
    });
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
  const spawnY = 100; // Top of arena
  
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
  const playerY = ARENA_CONFIG.arenaHeight - 120;
  
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
    
    // Environment
    obstacles: generateObstacles(),
    projectiles: [],
    particles: [],
    
    // Match info
    difficulty,
    entryCost: ARENA_ENTRY_COSTS[difficulty],
    potentialRewards: generatePotentialRewards(difficulty),
    earnedReward: null,
    
    screenShakeIntensity: 0,
    soundQueue: [],
  };
}

// Check if player can afford arena entry
export function canAffordArena(difficulty: ArenaDifficulty, currentScraps: number): boolean {
  return currentScraps >= ARENA_ENTRY_COSTS[difficulty];
}
