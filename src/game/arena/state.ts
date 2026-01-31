// Arena Battle Mode State Management

import { 
  ArenaState, 
  ArenaOpponent, 
  ArenaObstacle, 
  ArenaDifficulty,
  ArenaMode,
  ArenaReward,
  ArenaBoosts,
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
  
  // Always include scraps reward
  rewards.push({
    type: 'scraps',
    id: 'scraps_reward',
    name: 'Victory Bounty',
    description: `+${scrapAmount} scraps`,
    value: scrapAmount,
    rarity: 'common',
    icon: '◆',
  });
  
  // ========== CONSUMABLE BOOSTERS (Arena only) ==========
  const consumablePool = [
    { name: 'Hull Reinforcement', desc: '+50 HP for one arena battle', icon: '◇' },
    { name: 'Overcharged Cannons', desc: '+25% damage for one battle', icon: '◈' },
    { name: 'Turbo Thrusters', desc: '+20% speed for one battle', icon: '▷' },
    { name: 'Rapid Fire Module', desc: '+30% fire rate for one battle', icon: '⊕' },
    { name: 'Energy Shield', desc: 'Start with 3s invulnerability', icon: '⬡' },
  ];
  
  // ========== PERMANENT MAIN GAME REWARDS ==========
  // Ships (very rare - permanent unlock)
  const shipPool = [
    { shipId: 'arena_striker', name: 'ARENA STRIKER', desc: 'Battle-forged vector fighter for main game' },
    { shipId: 'void_hunter', name: 'VOID HUNTER', desc: 'Stealth systems - permanent unlock' },
    { shipId: 'neon_phantom', name: 'NEON PHANTOM', desc: 'Ghostly hull - use in main game' },
    { shipId: 'circuit_breaker', name: 'CIRCUIT BREAKER', desc: 'EMP-resistant chassis - permanent' },
  ];
  
  // Skins (rare - permanent unlock)
  const skinPool = [
    { skinId: 'arena_gold', name: 'ARENA CHAMPION', desc: 'Golden battle-worn finish', rarity: 'epic' as const },
    { skinId: 'arena_crimson', name: 'BLOOD VICTOR', desc: 'Crimson arena veteran coating', rarity: 'epic' as const },
    { skinId: 'arena_void', name: 'VOID WALKER', desc: 'Dark matter infused hull', rarity: 'legendary' as const },
    { skinId: 'arena_neon', name: 'NEON GLADIATOR', desc: 'Pulsating victory colors', rarity: 'rare' as const },
  ];
  
  // Companions (epic - permanent allies for main game)
  const companionPool = [
    { name: 'Arena Sentinel', desc: 'Battle-hardened guardian for main game', color: '#ff4466', shape: 'hexagon', level: 2, rarity: 'epic' as const },
    { name: 'Void Stalker', desc: 'Stealth attack companion', color: '#aa66ff', shape: 'diamond', level: 2, rarity: 'epic' as const },
    { name: 'Plasma Guardian', desc: 'High-energy defender orb', color: '#ffaa00', shape: 'circle', level: 3, rarity: 'legendary' as const },
    { name: 'Quantum Echo', desc: 'Reality-bending attack drone', color: '#00ffff', shape: 'triangle', level: 3, rarity: 'legendary' as const },
  ];
  
  const roll = Math.random();
  
  // Reward chances by difficulty
  // Format: { ship, skin, companion, consumable }
  const chances = {
    bronze:  { ship: 0.02, skin: 0.06, companion: 0.12, consumable: 0.50 },
    silver:  { ship: 0.04, skin: 0.12, companion: 0.25, consumable: 0.65 },
    gold:    { ship: 0.10, skin: 0.22, companion: 0.40, consumable: 0.75 },
    diamond: { ship: 0.18, skin: 0.35, companion: 0.55, consumable: 0.85 },
  };
  
  const c = chances[difficulty];
  
  if (roll < c.ship) {
    // LEGENDARY SHIP (permanent unlock for main game!)
    const ship = shipPool[Math.floor(Math.random() * shipPool.length)];
    rewards.push({
      type: 'ship_unlock',
      id: `ship_unlock_${ship.shipId}`,
      name: ship.name,
      description: ship.desc,
      rarity: 'legendary',
      icon: '⬢',
      unlockData: { shipId: ship.shipId },
    });
  } else if (roll < c.skin) {
    // SKIN (permanent unlock)
    const skin = skinPool[Math.floor(Math.random() * skinPool.length)];
    rewards.push({
      type: 'skin_unlock',
      id: `skin_unlock_${skin.skinId}`,
      name: skin.name,
      description: skin.desc,
      rarity: skin.rarity,
      icon: '◎',
      unlockData: { skinId: skin.skinId },
    });
  } else if (roll < c.companion) {
    // COMPANION (permanent ally for main game!)
    const comp = companionPool[Math.floor(Math.random() * companionPool.length)];
    rewards.push({
      type: 'companion_unlock',
      id: `companion_unlock_${comp.name.replace(/\s/g, '_')}`,
      name: comp.name,
      description: comp.desc,
      rarity: comp.rarity,
      icon: '◈',
      unlockData: { 
        companionData: {
          name: comp.name,
          color: comp.color,
          shape: comp.shape,
          level: comp.level,
        }
      },
    });
  } else if (roll < c.consumable) {
    // CONSUMABLE (arena booster - one-time use)
    const item = consumablePool[Math.floor(Math.random() * consumablePool.length)];
    const isRare = Math.random() < 0.3;
    rewards.push({
      type: 'consumable',
      id: `consumable_${Date.now()}_${Math.random()}`,
      name: item.name,
      description: item.desc,
      rarity: isRare ? 'rare' : 'common',
      icon: item.icon,
    });
  }
  // Else: no extra reward beyond scraps
  
  return rewards;
}


// Default boosts (no consumables)
const DEFAULT_BOOSTS: ArenaBoosts = {
  healthBoost: 0,
  damageMultiplier: 1,
  speedMultiplier: 1,
  fireRateMultiplier: 1,
  hasStartingShield: false,
  powerUpDurationMultiplier: 1,
  doubleScrapReward: false,
};

export function createArenaState(
  difficulty: ArenaDifficulty, 
  mode: ArenaMode = 'ai',
  boosts: ArenaBoosts = DEFAULT_BOOSTS
): ArenaState {
  const centerX = ARENA_CONFIG.arenaWidth / 2;
  const playerY = ARENA_CONFIG.arenaHeight - 125; // Scaled down
  
  // Use base stats with boosts applied
  const baseHealth = ARENA_CONFIG.playerMaxHealth;
  const playerMaxHealth = baseHealth + boosts.healthBoost;
  
  // Base player stats (before boosts)
  const baseDamage = 10;
  const baseSpeed = 5;
  const baseFireRate = 14; // Lower = faster
  
  // Apply multipliers from consumables
  const playerDamage = baseDamage * boosts.damageMultiplier;
  const playerSpeed = baseSpeed * boosts.speedMultiplier;
  // For fire rate, lower is faster, so we divide
  const playerFireRate = Math.max(8, baseFireRate / boosts.fireRateMultiplier);
  
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
    playerInvulnerable: boosts.hasStartingShield ? 180 : 0, // 3 seconds of invulnerability
    playerDamage,
    playerSpeed,
    playerFireRate,
    
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
    powerUpDurationMultiplier: boosts.powerUpDurationMultiplier,
    lastPowerUpCollected: null,
    powerUpNotificationTimer: 0,
    
    // Match info
    difficulty,
    entryCost: ARENA_ENTRY_COSTS[difficulty],
    potentialRewards: generatePotentialRewards(difficulty),
    earnedReward: null, // Deprecated
    earnedRewards: [], // New: supports multiple rewards
    doubleScrapReward: boosts.doubleScrapReward,
    
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
