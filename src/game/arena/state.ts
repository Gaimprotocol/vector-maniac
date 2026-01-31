// Arena Battle Mode State Management

import { 
  ArenaState, 
  ArenaOpponent, 
  ArenaObstacle, 
  ArenaDifficulty,
  ArenaMode,
  ArenaReward,
  ARENA_ENTRY_COSTS,
  ARENA_SCRAP_REWARDS,
  ARENA_OPPONENT_NAMES,
  ARENA_DIFFICULTY_STATS,
} from './types';
import { ARENA_CONFIG } from './constants';
import { getStoredMegaShipId } from '@/hooks/useMegaShips';
import { SHIP_MODELS } from '../shipModels';
import { getRandomArena, loadArenaImage } from './arenas';
import { 
  generatePlayerProfile, 
  getDisplayName, 
  getPlayStyleBehaviorWeights,
  FAMOUS_PLAYERS,
  PlayerProfile,
} from './playerProfiles';

function generateObstacles(): ArenaObstacle[] {
  // No obstacles - clean arena for pure ship combat
  return [];
}

// Random difficulty variance: 80-100% of base stats
function getDifficultyVariance(): number {
  return 0.8 + Math.random() * 0.2;
}

// Create AI opponent (original behavior)
function createAIOpponent(difficulty: ArenaDifficulty): ArenaOpponent {
  const stats = ARENA_DIFFICULTY_STATS[difficulty];
  const names = ARENA_OPPONENT_NAMES[difficulty];
  const name = names[Math.floor(Math.random() * names.length)];
  
  // Pick a random ship model for the opponent
  const shipIds = Object.keys(SHIP_MODELS);
  const shipId = shipIds[Math.floor(Math.random() * shipIds.length)];
  
  const spawnX = ARENA_CONFIG.arenaWidth / 2;
  const spawnY = 100; // Scaled down
  
  // Apply random variance (80-100% of base stats)
  const variance = getDifficultyVariance();
  const variedHealth = Math.floor(stats.health * variance);
  const variedDamage = Math.floor(stats.damage * variance);
  const variedSpeed = stats.speed * variance;
  const variedAccuracy = stats.accuracy * variance;
  // For fire rate, lower = faster, so we inverse the variance
  const variedFireRate = Math.ceil(stats.fireRate / variance);
  
  return {
    id: 'opponent_1',
    x: spawnX,
    y: spawnY,
    angle: Math.PI / 2,
    health: variedHealth,
    maxHealth: variedHealth,
    shipId,
    name,
    difficulty,
    isHumanPlayer: false,
    targetX: spawnX,
    targetY: spawnY,
    fireTimer: 0,
    behaviorTimer: 0,
    behaviorState: 'chase',
    damage: variedDamage,
    fireRate: variedFireRate,
    speed: variedSpeed * 0.85, // Fast AI movement
    accuracy: variedAccuracy,
  };
}

// Create "human" player opponent (fake multiplayer)
function createHumanOpponent(difficulty: ArenaDifficulty): ArenaOpponent {
  // Small chance for famous player
  const isFamous = Math.random() < 0.05;
  
  let profile: PlayerProfile;
  if (isFamous && FAMOUS_PLAYERS.length > 0) {
    profile = FAMOUS_PLAYERS[Math.floor(Math.random() * FAMOUS_PLAYERS.length)];
  } else {
    profile = generatePlayerProfile(difficulty);
  }
  
  const stats = ARENA_DIFFICULTY_STATS[difficulty];
  
  // Apply random variance (80-100% of base stats)
  const variance = getDifficultyVariance();
  
  // Pick ship - use preference or random
  const shipIds = Object.keys(SHIP_MODELS);
  const shipId = profile.shipPreference.length > 0 
    ? profile.shipPreference[Math.floor(Math.random() * profile.shipPreference.length)]
    : shipIds[Math.floor(Math.random() * shipIds.length)];
  
  const spawnX = ARENA_CONFIG.arenaWidth / 2;
  const spawnY = 100; // Scaled down
  
  // Get behavior weights for this playstyle
  const behaviorWeights = profile.playStyle 
    ? getPlayStyleBehaviorWeights(profile.playStyle as any)
    : { chase: 0.25, evade: 0.25, strafe: 0.25, cover: 0.25 };
  
  // Calculate modified stats based on player profile with variance
  const variedHealth = Math.floor(stats.health * variance);
  const modifiedAccuracy = Math.min(1, (stats.accuracy * 0.9 + profile.accuracy * 0.2) * variance);
  const modifiedSpeed = stats.speed * 0.85 * (0.9 + profile.aggressiveness * 0.2) * variance;
  const modifiedFireRate = Math.max(10, Math.ceil(stats.fireRate * (0.8 + profile.patience * 0.3) / variance));
  const variedDamage = Math.floor(stats.damage * variance);
  
  return {
    id: 'opponent_1',
    x: spawnX,
    y: spawnY,
    angle: Math.PI / 2,
    health: variedHealth,
    maxHealth: variedHealth,
    shipId,
    name: getDisplayName(profile),
    difficulty,
    isHumanPlayer: true,
    playerTag: profile.tag,
    playerLevel: profile.level,
    playerCountry: profile.country,
    playStyle: profile.playStyle,
    targetX: spawnX,
    targetY: spawnY,
    fireTimer: 0,
    behaviorTimer: 0,
    behaviorState: 'chase',
    behaviorWeights,
    damage: variedDamage,
    fireRate: modifiedFireRate,
    speed: modifiedSpeed,
    accuracy: modifiedAccuracy,
    dodgeSkill: profile.dodgeSkill,
    adaptability: profile.adaptability,
  };
}

function createOpponent(difficulty: ArenaDifficulty, mode: ArenaMode = 'ai'): ArenaOpponent {
  if (mode === 'multiplayer') {
    return createHumanOpponent(difficulty);
  }
  return createAIOpponent(difficulty);
}

function generatePotentialRewards(difficulty: ArenaDifficulty): ArenaReward[] {
  const rewards: ArenaReward[] = [];
  const scrapAmount = ARENA_SCRAP_REWARDS[difficulty];
  
  // Always include scraps reward - now properly profitable
  rewards.push({
    type: 'scraps',
    id: 'scraps_reward',
    name: 'Victory Bounty',
    description: `+${scrapAmount} scraps`,
    value: scrapAmount,
    rarity: 'common',
    icon: '◆',
  });
  
  // Expanded reward pools with rarity tiers
  const commonUpgrades = [
    { name: 'Minor Hull Patch', desc: '+5 max health in arena' },
    { name: 'Basic Targeting', desc: '+3% accuracy in arena' },
  ];
  
  const rareUpgrades = [
    { name: 'Arena Mastery I', desc: '+8% damage in arena battles' },
    { name: 'Tactical Reflexes', desc: '+10% movement speed in arena' },
    { name: 'Combat Focus', desc: '+15% fire rate in arena' },
    { name: 'Hull Reinforcement', desc: '+20 max health in arena' },
  ];
  
  const epicAllies = [
    { name: 'Combat Sentinel', desc: 'Arena guardian drone' },
    { name: 'Plasma Orb', desc: 'Orbiting energy sphere' },
    { name: 'Shadow Clone', desc: 'Holographic decoy system' },
    { name: 'Shield Bot', desc: 'Personal barrier generator' },
  ];
  
  const legendaryShips = [
    { name: 'ARENA STRIKER', desc: 'Battle-forged hull with enhanced speed' },
    { name: 'VOID HUNTER', desc: 'Stealth systems from the arena void' },
    { name: 'NEON PHANTOM', desc: 'Ghostly silhouette with evasion boost' },
    { name: 'CIRCUIT BREAKER', desc: 'EMP-resistant chassis' },
  ];
  
  const roll = Math.random();
  
  if (difficulty === 'diamond') {
    // Diamond: 45% legendary, 35% epic, 15% rare, 5% nothing extra
    if (roll < 0.45) {
      const ship = legendaryShips[Math.floor(Math.random() * legendaryShips.length)];
      rewards.push({
        type: 'unique_ship',
        id: `arena_ship_${Date.now()}_${Math.random()}`,
        name: ship.name,
        description: ship.desc,
        rarity: 'legendary',
        icon: '⬢',
      });
    } else if (roll < 0.80) {
      const ally = epicAllies[Math.floor(Math.random() * epicAllies.length)];
      rewards.push({
        type: 'rare_ally',
        id: `arena_ally_${Date.now()}_${Math.random()}`,
        name: ally.name,
        description: ally.desc,
        rarity: 'epic',
        icon: '◈',
      });
    } else if (roll < 0.95) {
      const upgrade = rareUpgrades[Math.floor(Math.random() * rareUpgrades.length)];
      rewards.push({
        type: 'power_upgrade',
        id: `arena_upgrade_${Date.now()}_${Math.random()}`,
        name: upgrade.name,
        description: upgrade.desc,
        rarity: 'rare',
        icon: '⊕',
      });
    }
  } else if (difficulty === 'gold') {
    // Gold: 30% legendary, 40% epic, 25% rare, 5% nothing extra
    if (roll < 0.30) {
      const ship = legendaryShips[Math.floor(Math.random() * legendaryShips.length)];
      rewards.push({
        type: 'unique_ship',
        id: `arena_ship_${Date.now()}_${Math.random()}`,
        name: ship.name,
        description: ship.desc,
        rarity: 'legendary',
        icon: '⬢',
      });
    } else if (roll < 0.70) {
      const ally = epicAllies[Math.floor(Math.random() * epicAllies.length)];
      rewards.push({
        type: 'rare_ally',
        id: `arena_ally_${Date.now()}_${Math.random()}`,
        name: ally.name,
        description: ally.desc,
        rarity: 'epic',
        icon: '◈',
      });
    } else if (roll < 0.95) {
      const upgrade = rareUpgrades[Math.floor(Math.random() * rareUpgrades.length)];
      rewards.push({
        type: 'power_upgrade',
        id: `arena_upgrade_${Date.now()}_${Math.random()}`,
        name: upgrade.name,
        description: upgrade.desc,
        rarity: 'rare',
        icon: '⊕',
      });
    }
  } else if (difficulty === 'silver') {
    // Silver: 15% legendary, 30% epic, 40% rare, 15% common
    if (roll < 0.15) {
      const ship = legendaryShips[Math.floor(Math.random() * legendaryShips.length)];
      rewards.push({
        type: 'unique_ship',
        id: `arena_ship_${Date.now()}_${Math.random()}`,
        name: ship.name,
        description: ship.desc,
        rarity: 'legendary',
        icon: '⬢',
      });
    } else if (roll < 0.45) {
      const ally = epicAllies[Math.floor(Math.random() * epicAllies.length)];
      rewards.push({
        type: 'rare_ally',
        id: `arena_ally_${Date.now()}_${Math.random()}`,
        name: ally.name,
        description: ally.desc,
        rarity: 'epic',
        icon: '◈',
      });
    } else if (roll < 0.85) {
      const upgrade = rareUpgrades[Math.floor(Math.random() * rareUpgrades.length)];
      rewards.push({
        type: 'power_upgrade',
        id: `arena_upgrade_${Date.now()}_${Math.random()}`,
        name: upgrade.name,
        description: upgrade.desc,
        rarity: 'rare',
        icon: '⊕',
      });
    } else {
      const upgrade = commonUpgrades[Math.floor(Math.random() * commonUpgrades.length)];
      rewards.push({
        type: 'power_upgrade',
        id: `arena_upgrade_${Date.now()}_${Math.random()}`,
        name: upgrade.name,
        description: upgrade.desc,
        rarity: 'common',
        icon: '○',
      });
    }
  } else {
    // Bronze: 5% legendary (jackpot!), 15% epic, 35% rare, 30% common, 15% nothing extra
    if (roll < 0.05) {
      const ship = legendaryShips[Math.floor(Math.random() * legendaryShips.length)];
      rewards.push({
        type: 'unique_ship',
        id: `arena_ship_${Date.now()}_${Math.random()}`,
        name: ship.name,
        description: ship.desc,
        rarity: 'legendary',
        icon: '⬢',
      });
    } else if (roll < 0.20) {
      const ally = epicAllies[Math.floor(Math.random() * epicAllies.length)];
      rewards.push({
        type: 'rare_ally',
        id: `arena_ally_${Date.now()}_${Math.random()}`,
        name: ally.name,
        description: ally.desc,
        rarity: 'epic',
        icon: '◈',
      });
    } else if (roll < 0.55) {
      const upgrade = rareUpgrades[Math.floor(Math.random() * rareUpgrades.length)];
      rewards.push({
        type: 'power_upgrade',
        id: `arena_upgrade_${Date.now()}_${Math.random()}`,
        name: upgrade.name,
        description: upgrade.desc,
        rarity: 'rare',
        icon: '⊕',
      });
    } else if (roll < 0.85) {
      const upgrade = commonUpgrades[Math.floor(Math.random() * commonUpgrades.length)];
      rewards.push({
        type: 'power_upgrade',
        id: `arena_upgrade_${Date.now()}_${Math.random()}`,
        name: upgrade.name,
        description: upgrade.desc,
        rarity: 'common',
        icon: '○',
      });
    }
  }
  
  return rewards;
}

export function createArenaState(difficulty: ArenaDifficulty, mode: ArenaMode = 'ai'): ArenaState {
  const centerX = ARENA_CONFIG.arenaWidth / 2;
  const playerY = ARENA_CONFIG.arenaHeight - 125; // Scaled down
  
  // Use base stats only - no upgrades in arena for fair matches
  const playerMaxHealth = ARENA_CONFIG.playerMaxHealth;
  
  // Select random arena
  const arena = getRandomArena();
  loadArenaImage(arena); // Preload image
  
  return {
    phase: 'entering',
    phaseTimer: ARENA_CONFIG.enteringDuration,
    gameTime: 0,
    
    arenaId: arena.id,
    arenaName: arena.name,
    
    arenaWidth: ARENA_CONFIG.arenaWidth,
    arenaHeight: ARENA_CONFIG.arenaHeight,
    
    // Player starts at bottom center
    playerX: centerX,
    playerY: playerY,
    playerAngle: -Math.PI / 2,
    targetX: centerX,
    targetY: playerY,
    playerHealth: playerMaxHealth,
    playerMaxHealth: playerMaxHealth,
    playerFireTimer: 0,
    playerInvulnerable: 0,
    
    // Opponent
    opponent: createOpponent(difficulty, mode),
    opponentStunTimer: 0,
    
    // Environment with obstacles
    obstacles: generateObstacles(),
    projectiles: [],
    particles: [],
    powerUps: [],
    
    // Active effects
    overdriveTimer: 0,
    powerUpSpawnTimer: 300,
    lastPowerUpCollected: null,
    powerUpNotificationTimer: 0,
    
    // Match info
    difficulty,
    entryCost: ARENA_ENTRY_COSTS[difficulty],
    potentialRewards: generatePotentialRewards(difficulty),
    earnedReward: null, // Deprecated
    earnedRewards: [], // New: supports multiple rewards
    
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
