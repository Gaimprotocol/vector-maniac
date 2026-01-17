import { GameData, InputState, Enemy } from './types';
import { GAME_CONFIG, ENEMY_CONFIG, SPAWN_CONFIG, TERRAIN_CONFIG, TOUCH_CONFIG, AUTO_RESCUE_MIN_Y, AUTO_RESCUE_MAX_Y, AUTO_RESCUE_DISTANCE_X, SPRITE_SIZE } from './constants';
import { getDifficultyMultipliers } from '@/hooks/useDifficulty';
import { createPlayer, createBullet, createBomb, createEnemy, createCivilian, createPickup, createDebris } from './entities';
import { checkCollision, createExplosion, generateTerrain, createStar, clamp, playSound, lerp, getShipShootSound, getShipBombSound } from './utils';
import { getMap, MAP_DURATION, WARP_DURATION, QUICK_WARP_DURATION, getNextMapId, isNewWave, getTerrainType, isMapLocked, LAST_FREE_MAP } from './maps';
import { createEscortPlane, updateEscortPlanes, EscortPlane } from './escort';
import { createBunkerState, updateBunkerState, BunkerState } from './bunkerDefense';
import { createRoverState, updateRoverState, MoonRoverState } from './moonRover';
import { createUnderwaterState, updateUnderwaterState, UnderwaterState } from './underwater';
import { createArenaState, updateArenaState, ArenaState } from './arenaMode';
import { createSurvivalState, updateSurvivalState, SurvivalState, playSurvivalSound, SurvivalSoundType } from './survivalMode';
import { getStoredMegaShipId, hasLaserAbility, hasDoubleBombs, hasSpeedBoost, hasMultiDirectionalShots, hasStealthMode } from '@/hooks/useMegaShips';
import { 
  createPilotRunnerState, 
  updatePilotRunnerState, 
  PilotRunnerState 
} from './pilotRunner';
import {
  createParatrooperState,
  updateParatrooper,
  ParatrooperState
} from './paratrooper';
import {
  createForwardFlightState,
  updateForwardFlight,
  ForwardFlightState
} from './forwardFlight';

// Bonus level schedule - each bonus level appears at specific map numbers
// This prevents overlapping and ensures proper spacing with main game between bonus levels
// Pattern: 1 bonus level followed by 3 regular maps, then next bonus level
// Bonus, Regular, Regular, Regular, Bonus, Regular, Regular, Regular...
const BONUS_INTERVAL = 4; // Bonus every 4th map position after map 3

export type BonusLevelType = 'bunker' | 'pilotRunner' | 'rover' | 'underwater' | 'arena' | 'paratrooper' | 'forwardFlight' | null;

// Available bonus types (paratrooper excluded from early pool)
const EARLY_BONUS_TYPES: BonusLevelType[] = ['bunker', 'pilotRunner', 'rover', 'underwater', 'arena'];
const ALL_BONUS_TYPES: BonusLevelType[] = ['bunker', 'pilotRunner', 'rover', 'underwater', 'arena', 'paratrooper'];

// Track bonus level history to avoid repeats
let lastBonusType: BonusLevelType = null;
let bonusCount = 0;

// Reset bonus tracking (call when starting new game)
export function resetBonusTracking(): void {
  lastBonusType = null;
  bonusCount = 0;
}

// Get random bonus type that's not the same as last one (ONLY call when actually starting a bonus)
function getRandomBonusType(): BonusLevelType {
  // Use paratrooper only after 3 bonus levels have been played
  const availableTypes = bonusCount >= 3 ? ALL_BONUS_TYPES : EARLY_BONUS_TYPES;
  
  // Filter out the last bonus type to prevent repeats
  const validTypes = availableTypes.filter(t => t !== lastBonusType);
  
  // Pick random from valid types
  const randomIndex = Math.floor(Math.random() * validTypes.length);
  const selected = validTypes[randomIndex];
  
  // Track this selection
  lastBonusType = selected;
  bonusCount++;
  
  return selected;
}

// Check if a given level position should be a bonus level (NO side effects)
export function isBonusLevelPosition(totalLevelsPlayed: number): boolean {
  if (totalLevelsPlayed < 3) return false; // First two levels are always regular gameplay
  
  // Check if this level position should have a bonus level
  // Bonus at positions: 3, 7, 11, 15, 19, 23... (every 4th starting from 3)
  const positionFromStart = totalLevelsPlayed - 3;
  return positionFromStart % BONUS_INTERVAL === 0;
}

// Determine which bonus level (if any) should trigger - ONLY call when actually transitioning
// This function has side effects (tracks bonus history)
export function getBonusLevelForMap(totalLevelsPlayed: number): BonusLevelType {
  if (!isBonusLevelPosition(totalLevelsPlayed)) return null;
  return getRandomBonusType();
}

// Legacy check functions - now use the centralized getBonusLevelForMap
export function isPilotRunnerLevel(mapId: number): boolean {
  return getBonusLevelForMap(mapId) === 'pilotRunner';
}

export function isParatrooperLevel(mapId: number): boolean {
  return getBonusLevelForMap(mapId) === 'paratrooper';
}

export function isForwardFlightLevel(mapId: number): boolean {
  // DISABLED: Deep drill map temporarily disabled in main game
  return false;
}

// Helper function to transition to next level after completing current one
// Returns the new state object with proper bonus level detection
// NOTE: This should be called AFTER totalLevelsPlayed has been incremented
function transitionToNextLevel(data: GameData): { state: GameData['state'], bonusState: Partial<GameData>, isBonus: boolean } {
  // Check current level position (totalLevelsPlayed should already be incremented)
  const currentLevel = data.totalLevelsPlayed;
  
  // Only trigger bonus if bonus maps are enabled
  if (!data.bonusMapsEnabled || !isBonusLevelPosition(currentLevel)) {
    return { state: 'playing', bonusState: {}, isBonus: false };
  }
  
  // Get the actual bonus type (this has side effects - only call when actually starting bonus)
  const bonusType = getRandomBonusType();
  
  switch (bonusType) {
    case 'bunker':
      return { state: 'bunker', bonusState: { bunkerState: createBunkerState(data.currentMapId) }, isBonus: true };
    case 'rover':
      return { state: 'rover', bonusState: { roverState: createRoverState(data.currentMapId) }, isBonus: true };
    case 'underwater':
      return { state: 'underwater', bonusState: { underwaterState: createUnderwaterState(data.currentMapId) }, isBonus: true };
    case 'arena':
      return { state: 'arena', bonusState: { arenaState: createArenaState(data.currentMapId) }, isBonus: true };
    case 'pilotRunner':
      return { state: 'pilotRunner', bonusState: { pilotRunnerState: createPilotRunnerState() }, isBonus: true };
    case 'paratrooper':
      return { state: 'paratrooper', bonusState: { paratrooperState: createParatrooperState(data.rescuedCount) }, isBonus: true };
    case 'forwardFlight':
      return { state: 'forwardFlight', bonusState: { forwardFlightState: createForwardFlightState(data.rescuedCount, GAME_CONFIG) }, isBonus: true };
    default:
      return { state: 'playing', bonusState: {}, isBonus: false };
  }
}

// Helper function to safely advance to next map
// Loops back to map 1 for non-Ultimate users after map 20
function advanceToNextMap(data: GameData): { nextMapId: number, state: GameData['state'] } {
  const nextId = getNextMapId(data.currentMapId);
  
  // For non-Ultimate users, loop back to map 1 after completing map 20
  if (isMapLocked(nextId, data.hasUltimateEdition)) {
    return { nextMapId: 1, state: 'playing' };
  }
  
  return { nextMapId: nextId, state: 'playing' };
}

export function createInitialGameData(): GameData {
  const terrain = generateTerrain(0, 150, 50, 50);
  const stars: GameData['stars'] = [];
  
  // Create more stars for depth effect
  for (let i = 0; i < 200; i++) {
    stars.push(createStar(GAME_CONFIG.canvasWidth * 3, GAME_CONFIG.canvasHeight));
  }

  return {
    state: 'menu',
    score: 0,
    highScore: parseInt(localStorage.getItem('cyberRescueHighScore') || '0'),
    level: 1,
    rescuedCount: 0,
    player: createPlayer(),
    bullets: [],
    bombs: [],
    enemies: [],
    civilians: [],
    pickups: [],
    particles: [],
    terrain,
    fallingDebris: [],
    stars,
    scrollOffset: 0,
    scrollSpeed: GAME_CONFIG.scrollSpeed,
    difficulty: 1,
    screenShake: 0,
    currentMapId: 1,
    waveNumber: 1,
    totalLevelsPlayed: 1,
    mapScrollOffset: 0,
    isWarping: false,
    isBonusWarp: false,
    levelGlowTimer: 0,
    warpTimer: 0,
    escorts: [],
    bunkerState: null,
    roverState: null,
    underwaterState: null,
    arenaState: null,
    survivalState: null,
    pilotRunnerState: null,
    paratrooperState: null,
    forwardFlightState: null,
    vectorManiacState: null,
    isHyperspace: false,
    hyperspaceTimer: 0,
    hyperspaceExitTimer: 0,
    inHazardZone: false,
    terrainCollisionTimer: 0,
    collisionFlash: [],
    nextFormationId: 1,
    killsSinceLastDrop: 0,
    // Ad reward boosts (timed bonuses, set by Game.tsx when starting)
    adDoublePointsActive: false,
    adShieldActive: false,
    adSpeedActive: false,
    adDoubleBombsActive: false,
    adTripleShotsActive: false,
    adDoubleLaserActive: false,
    // Mega ship stealth
    stealthTimer: 0,
    isStealthActive: false,
    // Crimson Hawk multi-shot timer
    multiShotTimer: 0,
    // Bonus maps toggle - load from localStorage
    bonusMapsEnabled: localStorage.getItem('bonusMapsEnabled') !== 'false',
    // Ultimate Edition flag - will be updated by Game.tsx
    hasUltimateEdition: false,
  };
}

export function startGame(data: GameData): GameData {
  // Reset bonus level tracking for new game
  resetBonusTracking();
  
  return {
    ...createInitialGameData(),
    state: 'playing',
    highScore: data.highScore,
    bonusMapsEnabled: data.bonusMapsEnabled,
    hasUltimateEdition: data.hasUltimateEdition,
  };
}

export function startSurvivalGame(data: GameData): GameData {
  const survivalState = createSurvivalState();
  return {
    ...createInitialGameData(),
    state: 'survival',
    survivalState,
    highScore: survivalState.highScore, // Use survival-specific highscore
  };
}

export function startVectorManiac(data: GameData): GameData {
  const { createVectorManiacState } = require('./vectorManiac');
  const vectorManiacState = createVectorManiacState();
  return {
    ...createInitialGameData(),
    state: 'vectorManiac',
    vectorManiacState,
    highScore: data.highScore,
  };
}

export function pauseGame(data: GameData): GameData {
  return {
    ...data,
    state: data.state === 'playing' ? 'paused' : 'playing',
  };
}

export function updateGame(data: GameData, input: InputState, deltaTime: number): GameData {
  // Handle Vector Maniac mode
  if (data.state === 'vectorManiac' && data.vectorManiacState) {
    const { updateVectorManiac } = require('./vectorManiac');
    let newData = { ...data };
    const vmInput = {
      touchX: input.touchX,
      touchY: input.touchY,
      isTouching: input.isTouching,
    };
    newData.vectorManiacState = updateVectorManiac(newData.vectorManiacState, vmInput);
    
    // Update score in main game data (for high score tracking)
    newData.score = Math.floor(newData.vectorManiacState.score);
    
    // Don't change state - vectorManiac handles its own game over/victory phases
    // The VectorManiacEndScreen component will show when phase is 'gameOver' or 'victory'
    
    return newData;
  }
  
  // Handle survival mode
  if (data.state === 'survival' && data.survivalState) {
    let newData = { ...data };
    const survivalInput = {
      up: input.up,
      down: input.down,
      left: input.left,
      right: input.right,
      fire: input.fire || input.isTouching,
    };
    
    // Handle touch input for survival mode
    if (input.isTouching) {
      const targetX = input.touchX - 40; // Offset from finger (to the left)
      const targetY = input.touchY; // Ship at same Y as finger (not above)
      newData.survivalState = {
        ...newData.survivalState,
        player: {
          ...newData.survivalState.player,
          targetX,
          targetY,
        },
      };
    }
    
    newData.survivalState = updateSurvivalState(newData.survivalState as SurvivalState, survivalInput);
    
    // Play queued sounds for survival mode
    if (newData.survivalState.soundQueue && newData.survivalState.soundQueue.length > 0) {
      newData.survivalState.soundQueue.forEach(sound => {
        playSurvivalSound(sound as SurvivalSoundType);
      });
    }
    
    // Check if survival game is over
    if (newData.survivalState.phase === 'gameover') {
      newData.state = 'gameover';
      newData.score = newData.survivalState.score;
      newData.highScore = newData.survivalState.highScore; // Use survival-specific highscore
    }
    
    return newData;
  }
  
  // Handle bunker defense mode
  if (data.state === 'bunker' && data.bunkerState) {
    let newData = { ...data };
    const bunkerInput = {
      touchX: input.touchX,
      touchY: input.touchY,
      isTouching: input.isTouching,
      fire: input.fire || input.isTouching,
    };
    newData.bunkerState = updateBunkerState(data.bunkerState as BunkerState, bunkerInput);
    
    // Check if bunker is destroyed - bonus map ends (no game over on bonus maps)
    if (newData.bunkerState.bunkerDestroyed) {
      newData.score += newData.bunkerState.bonusScore;
      newData.bunkerState = null;
      newData.totalLevelsPlayed++;
      newData.mapScrollOffset = 0;
      const transition = transitionToNextLevel(newData);
      if (transition.isBonus) {
        newData.state = transition.state;
        Object.assign(newData, transition.bonusState);
      } else {
        // Transition to next regular map
        if (isNewWave(newData.currentMapId)) {
          newData.waveNumber++;
        }
        const mapTransition = advanceToNextMap(newData);
        newData.currentMapId = mapTransition.nextMapId;
        newData.state = mapTransition.state;
      }
      return newData;
    }
    
    // Check if bunker defense is complete
    if (newData.bunkerState.phase === 'complete') {
      newData.score += newData.bunkerState.bonusScore;
      newData.bunkerState = null;
      newData.totalLevelsPlayed++;
      newData.mapScrollOffset = 0;
      const transition = transitionToNextLevel(newData);
      if (transition.isBonus) {
        newData.state = transition.state;
        Object.assign(newData, transition.bonusState);
      } else {
        if (isNewWave(newData.currentMapId)) {
          newData.waveNumber++;
        }
        const mapTransition = advanceToNextMap(newData);
        newData.currentMapId = mapTransition.nextMapId;
        newData.state = mapTransition.state;
      }
    }
    
    return newData;
  }
  
  // Handle moon rover mode
  if (data.state === 'rover' && data.roverState) {
    let newData = { ...data };
    const roverInput = {
      touchX: input.touchX,
      touchY: input.touchY,
      isTouching: input.isTouching,
      fire: input.fire || input.isTouching,
    };
    newData.roverState = updateRoverState(data.roverState as MoonRoverState, roverInput);
    
    // Check if rover is destroyed - bonus map ends (no game over on bonus maps)
    if (newData.roverState.roverDestroyed) {
      newData.score += newData.roverState.bonusScore;
      newData.roverState = null;
      newData.totalLevelsPlayed++;
      newData.mapScrollOffset = 0;
      const transition = transitionToNextLevel(newData);
      if (transition.isBonus) {
        newData.state = transition.state;
        Object.assign(newData, transition.bonusState);
      } else {
        if (isNewWave(newData.currentMapId)) {
          newData.waveNumber++;
        }
        const mapTransition = advanceToNextMap(newData);
        newData.currentMapId = mapTransition.nextMapId;
        newData.state = mapTransition.state;
      }
      return newData;
    }
    
    // Check if rover mission is complete
    if (newData.roverState.phase === 'complete') {
      newData.score += newData.roverState.bonusScore;
      newData.roverState = null;
      newData.totalLevelsPlayed++;
      newData.mapScrollOffset = 0;
      const transition = transitionToNextLevel(newData);
      if (transition.isBonus) {
        newData.state = transition.state;
        Object.assign(newData, transition.bonusState);
      } else {
        if (isNewWave(newData.currentMapId)) {
          newData.waveNumber++;
        }
        const mapTransition = advanceToNextMap(newData);
        newData.currentMapId = mapTransition.nextMapId;
        newData.state = mapTransition.state;
      }
    }
    
    return newData;
  }
  
  // Handle underwater mode
  if (data.state === 'underwater' && data.underwaterState) {
    let newData = { ...data };
    const underwaterInput = {
      touchX: input.touchX,
      touchY: input.touchY,
      isTouching: input.isTouching,
      fire: input.fire || input.isTouching,
    };
    newData.underwaterState = updateUnderwaterState(data.underwaterState as UnderwaterState, underwaterInput);
    
    // Check if sub is destroyed - bonus map ends (no game over on bonus maps)
    if (newData.underwaterState.subDestroyed) {
      newData.score += newData.underwaterState.bonusScore;
      newData.underwaterState = null;
      newData.totalLevelsPlayed++;
      newData.mapScrollOffset = 0;
      const transition = transitionToNextLevel(newData);
      if (transition.isBonus) {
        newData.state = transition.state;
        Object.assign(newData, transition.bonusState);
      } else {
        if (isNewWave(newData.currentMapId)) {
          newData.waveNumber++;
        }
        newData.currentMapId = getNextMapId(newData.currentMapId);
        newData.state = 'playing';
      }
      return newData;
    }
    
    // Check if underwater mission is complete
    if (newData.underwaterState.phase === 'complete') {
      newData.score += newData.underwaterState.bonusScore;
      newData.underwaterState = null;
      newData.totalLevelsPlayed++;
      newData.mapScrollOffset = 0;
      const transition = transitionToNextLevel(newData);
      if (transition.isBonus) {
        newData.state = transition.state;
        Object.assign(newData, transition.bonusState);
      } else {
        if (isNewWave(newData.currentMapId)) {
          newData.waveNumber++;
        }
        newData.currentMapId = getNextMapId(newData.currentMapId);
        newData.state = 'playing';
      }
    }
    
    return newData;
  }
  
  // Handle arena mode
  if (data.state === 'arena' && data.arenaState) {
    let newData = { ...data };
    const arenaInput = {
      touchX: input.touchX,
      touchY: input.touchY,
      isTouching: input.isTouching,
      fire: input.fire || input.isTouching,
    };
    newData.arenaState = updateArenaState(data.arenaState as ArenaState, arenaInput);
    
    // Check if arena mode is complete
    if (newData.arenaState.phase === 'complete') {
      newData.score += newData.arenaState.bonusScore;
      
      // Reset player to good starting position for next level
      newData.player = {
        ...newData.player,
        x: newData.scrollOffset + GAME_CONFIG.canvasWidth / 4,
        y: GAME_CONFIG.canvasHeight / 2,
        targetX: newData.scrollOffset + GAME_CONFIG.canvasWidth / 4,
        targetY: GAME_CONFIG.canvasHeight / 2,
        health: Math.min(newData.player.maxHealth, newData.player.health + 30), // Bonus health
        invulnerable: true,
        invulnerableTimer: 120,
      };
      
      newData.arenaState = null;
      newData.totalLevelsPlayed++;
      newData.mapScrollOffset = 0;
      
      // Clear any lingering entities from before arena
      newData.enemies = [];
      newData.bullets = [];
      newData.civilians = [];
      
      const transition = transitionToNextLevel(newData);
      if (transition.isBonus) {
        newData.state = transition.state;
        Object.assign(newData, transition.bonusState);
      } else {
        if (isNewWave(newData.currentMapId)) {
          newData.waveNumber++;
        }
        newData.currentMapId = getNextMapId(newData.currentMapId);
        newData.state = 'playing';
      }
      return newData;
    }
    
    // Check if player died in arena - bonus map ends (no game over on bonus maps)
    if (newData.arenaState && newData.arenaState.health <= 0) {
      newData.score += newData.arenaState.bonusScore;
      
      // Reset player to good starting position for next level
      newData.player = {
        ...newData.player,
        x: newData.scrollOffset + GAME_CONFIG.canvasWidth / 4,
        y: GAME_CONFIG.canvasHeight / 2,
        targetX: newData.scrollOffset + GAME_CONFIG.canvasWidth / 4,
        targetY: GAME_CONFIG.canvasHeight / 2,
        invulnerable: true,
        invulnerableTimer: 120,
      };
      
      newData.arenaState = null;
      newData.totalLevelsPlayed++;
      newData.mapScrollOffset = 0;
      newData.enemies = [];
      newData.bullets = [];
      newData.civilians = [];
      
      const transition = transitionToNextLevel(newData);
      if (transition.isBonus) {
        newData.state = transition.state;
        Object.assign(newData, transition.bonusState);
      } else {
        if (isNewWave(newData.currentMapId)) {
          newData.waveNumber++;
        }
        newData.currentMapId = getNextMapId(newData.currentMapId);
        newData.state = 'playing';
      }
      return newData;
    }
    
    return newData;
  }
  
  // Handle pilot runner mode
  if (data.state === 'pilotRunner' && data.pilotRunnerState) {
    let newData = { ...data };
    const runnerInput = {
      left: input.left,
      right: input.right,
      up: input.up,
      down: input.down,
      fire: input.fire || input.isTouching,
      jump: input.rescue, // Use 'R' key for jump (rescue button), separate from up which is for aiming
      special: input.bomb,
      touchX: input.touchX,
      touchY: input.touchY,
      isTouching: input.isTouching,
    };
    newData.pilotRunnerState = updatePilotRunnerState(data.pilotRunnerState as PilotRunnerState, runnerInput);
    
    // Check if pilot runner is complete (includes when pilot dies - no game over on bonus maps)
    if (newData.pilotRunnerState.phase === 'complete') {
      newData.score += newData.pilotRunnerState.bonusScore || 0;
      newData.pilotRunnerState = null;
      newData.totalLevelsPlayed++;
      newData.mapScrollOffset = 0;
      
      // Use centralized bonus level detection
      const transition = transitionToNextLevel(newData);
      if (transition.isBonus) {
        newData.state = transition.state;
        Object.assign(newData, transition.bonusState);
      } else {
        if (isNewWave(newData.currentMapId)) {
          newData.waveNumber++;
        }
        newData.currentMapId = getNextMapId(newData.currentMapId);
        newData.state = 'playing';
        
        // Reset player for normal map
        newData.player = {
          ...newData.player,
          x: newData.scrollOffset + GAME_CONFIG.canvasWidth / 4,
          y: GAME_CONFIG.canvasHeight / 2,
          targetX: newData.scrollOffset + GAME_CONFIG.canvasWidth / 4,
          targetY: GAME_CONFIG.canvasHeight / 2,
          invulnerable: true,
          invulnerableTimer: 120,
        };
      }
    }
    
    return newData;
  }
  
  // Handle paratrooper mode
  if (data.state === 'paratrooper' && data.paratrooperState) {
    let newData = { ...data };
    const paraInput = {
      left: input.left,
      right: input.right,
      tap: input.fire || input.isTouching,
      tapX: input.touchX,
      tapY: input.touchY,
    };
    newData.paratrooperState = updateParatrooper(data.paratrooperState as ParatrooperState, paraInput);
    
    // Check if paratrooper mission is complete
    if (newData.paratrooperState.phase === 'complete') {
      newData.score += newData.paratrooperState.score;
      newData.pilotRunnerState = null;
      newData.paratrooperState = null;
      newData.totalLevelsPlayed++;
      newData.mapScrollOffset = 0;
      
      // Reset player position
      newData.player = {
        ...newData.player,
        x: newData.scrollOffset + GAME_CONFIG.canvasWidth / 4,
        y: GAME_CONFIG.canvasHeight / 2,
        targetX: newData.scrollOffset + GAME_CONFIG.canvasWidth / 4,
        targetY: GAME_CONFIG.canvasHeight / 2,
        invulnerable: true,
        invulnerableTimer: 120,
      };
      
      const transition = transitionToNextLevel(newData);
      if (transition.isBonus) {
        newData.state = transition.state;
        Object.assign(newData, transition.bonusState);
      } else {
        if (isNewWave(newData.currentMapId)) {
          newData.waveNumber++;
        }
        newData.currentMapId = getNextMapId(newData.currentMapId);
        newData.state = 'playing';
      }
    }
    
    // Check if mission failed
    if (newData.paratrooperState && newData.paratrooperState.phase === 'failed') {
      newData.score += newData.paratrooperState.score;
      newData.paratrooperState = null;
      newData.totalLevelsPlayed++;
      newData.mapScrollOffset = 0;
      const transition = transitionToNextLevel(newData);
      if (transition.isBonus) {
        newData.state = transition.state;
        Object.assign(newData, transition.bonusState);
      } else {
        if (isNewWave(newData.currentMapId)) {
          newData.waveNumber++;
        }
        newData.currentMapId = getNextMapId(newData.currentMapId);
        newData.state = 'playing';
      }
    }
    
    return newData;
  }
  
  // Handle forward flight (deep drill) mode
  if (data.state === 'forwardFlight' && data.forwardFlightState) {
    let newData = { ...data };
    const drillInput = {
      left: input.left,
      right: input.right,
      up: input.up,
      down: input.down,
      fire: input.fire || input.isTouching,
      special: input.bomb,
      touchX: input.touchX,
      touchY: input.touchY,
      isTouching: input.isTouching,
    };
    newData.forwardFlightState = updateForwardFlight(
      data.forwardFlightState as ForwardFlightState, 
      drillInput, 
      16.67, 
      GAME_CONFIG
    );
    
    // Check if drill mission is complete
    if (newData.forwardFlightState.phase === 'complete') {
      newData.score += newData.forwardFlightState.score;
      newData.forwardFlightState = null;
      newData.totalLevelsPlayed++;
      newData.mapScrollOffset = 0;
      
      // Reset player position
      newData.player = {
        ...newData.player,
        x: newData.scrollOffset + GAME_CONFIG.canvasWidth / 4,
        y: GAME_CONFIG.canvasHeight / 2,
        targetX: newData.scrollOffset + GAME_CONFIG.canvasWidth / 4,
        targetY: GAME_CONFIG.canvasHeight / 2,
        invulnerable: true,
        invulnerableTimer: 120,
      };
      
      const transition = transitionToNextLevel(newData);
      if (transition.isBonus) {
        newData.state = transition.state;
        Object.assign(newData, transition.bonusState);
      } else {
        if (isNewWave(newData.currentMapId)) {
          newData.waveNumber++;
        }
        newData.currentMapId = getNextMapId(newData.currentMapId);
        newData.state = 'playing';
      }
    }
    
    // Check if drill vehicle destroyed - bonus map ends (no game over)
    if (newData.forwardFlightState && newData.forwardFlightState.phase === 'failed') {
      newData.score += newData.forwardFlightState.score;
      newData.forwardFlightState = null;
      newData.totalLevelsPlayed++;
      newData.mapScrollOffset = 0;
      const transition = transitionToNextLevel(newData);
      if (transition.isBonus) {
        newData.state = transition.state;
        Object.assign(newData, transition.bonusState);
      } else {
        if (isNewWave(newData.currentMapId)) {
          newData.waveNumber++;
        }
        newData.currentMapId = getNextMapId(newData.currentMapId);
        newData.state = 'playing';
      }
    }
    
    return newData;
  }
  
  if (data.state !== 'playing') return data;

  let newData = { ...data };

  // Handle warp transition (triggered when going to a bonus level)
  if (newData.isWarping) {
    newData.warpTimer--;
    if (newData.warpTimer <= 0) {
      newData.isWarping = false;
      newData.totalLevelsPlayed++;
      newData.mapScrollOffset = 0;
      
      // Use centralized bonus level detection - we already know this is a bonus level
      const transition = transitionToNextLevel(newData);
      if (transition.isBonus) {
        newData.state = transition.state;
        Object.assign(newData, transition.bonusState);
        return newData;
      }
      
      // Fallback to regular map if for some reason no bonus
      if (isNewWave(newData.currentMapId)) {
        newData.waveNumber++;
      }
      newData.currentMapId = getNextMapId(newData.currentMapId);
      newData.enemies = [];
    }
    return newData;
  }

  // Handle hyperspace mode (fast forward)
  if (newData.isHyperspace) {
    newData.hyperspaceTimer--;
    if (newData.hyperspaceTimer <= 0) {
      newData.isHyperspace = false;
      newData.scrollSpeed = GAME_CONFIG.scrollSpeed;
      newData.hyperspaceExitTimer = 60; // 1 second exit effect
    }
  } else {
    // Trigger hyperspace at certain intervals (every 1500 scroll units)
    const hyperspaceInterval = 1500;
    if (Math.floor(newData.mapScrollOffset / hyperspaceInterval) > Math.floor((newData.mapScrollOffset - newData.scrollSpeed) / hyperspaceInterval) && 
        newData.mapScrollOffset > 500 && newData.mapScrollOffset < MAP_DURATION - 500) {
      newData.isHyperspace = true;
      newData.hyperspaceTimer = 300; // 5 seconds of hyperspace (doubled from 2.5s)
      newData.scrollSpeed = GAME_CONFIG.scrollSpeed * 3; // Triple speed
    }
  }
  
  // Handle hyperspace exit effect timer
  if (newData.hyperspaceExitTimer > 0) {
    newData.hyperspaceExitTimer--;
  }
  
  // Handle level glow timer
  if (newData.levelGlowTimer > 0) {
    newData.levelGlowTimer--;
  }

  // Check for map transition
  newData.mapScrollOffset += newData.scrollSpeed;
  if (newData.mapScrollOffset >= MAP_DURATION) {
    // Check if next level (totalLevelsPlayed + 1) would be a bonus (only if bonus maps are enabled)
    const isNextBonus = newData.bonusMapsEnabled && isBonusLevelPosition(newData.totalLevelsPlayed + 1);
    
    // Only show warp effect for bonus levels, regular levels transition instantly
    if (isNextBonus) {
      newData.isWarping = true;
      newData.isBonusWarp = true;
      newData.warpTimer = WARP_DURATION;
    } else {
      // Instant transition for regular levels - trigger level glow and switch map immediately
      newData.totalLevelsPlayed++;
      newData.levelGlowTimer = 90; // 1.5 seconds of glow
      
      // Advance to next map (only for regular maps, not bonus)
      if (isNewWave(newData.currentMapId)) {
        newData.waveNumber++;
      }
      newData.currentMapId = getNextMapId(newData.currentMapId);
      newData.mapScrollOffset = 0;
      
      // Check if new map is a space map (no terrain)
      const nextMap = getMap(newData.currentMapId);
      if (!nextMap.hasTerrain) {
        // Remove ground-based enemies that don't make sense floating in space
        newData.enemies = newData.enemies.filter(e => 
          e.type !== 'turret' && e.type !== 'hostilePerson' && e.type !== 'sniper' && e.type !== 'tank'
        );
      }
    }
    newData.level++;
    newData.isHyperspace = false;
    newData.scrollSpeed = GAME_CONFIG.scrollSpeed;
  }

  // Update scroll
  newData.scrollOffset += newData.scrollSpeed;

  // Update player with touch-follow mechanic
  newData = updatePlayer(newData, input);

  // Update escort planes
  if (newData.escorts.length > 0) {
    const escortResult = updateEscortPlanes(
      newData.escorts as EscortPlane[],
      newData.player.x,
      newData.player.y,
      newData.scrollOffset
    );
    newData.escorts = escortResult.escorts;
    newData.bullets = [...newData.bullets, ...escortResult.bullets];
  }

  // Update entities
  newData = updateBullets(newData);
  newData = updateBombs(newData);
  newData = updateEnemies(newData);
  newData = updateCivilians(newData, input);
  newData = updatePickups(newData);
  newData = updateParticles(newData);
  newData = updateFallingDebris(newData);

  // Spawn new entities
  newData = spawnEntities(newData);

  // Generate more terrain
  newData = generateMoreTerrain(newData);

  // Check collisions
  newData = checkAllCollisions(newData);

  // Update screen shake
  if (newData.screenShake > 0) {
    newData.screenShake = Math.max(0, newData.screenShake - 0.5);
  }

  // Check game over
  if (newData.player.health <= 0) {
    newData.state = 'gameover';
    if (newData.score > newData.highScore) {
      newData.highScore = newData.score;
      localStorage.setItem('cyberRescueHighScore', newData.score.toString());
    }
  }

  // Increase difficulty over time - slower scaling with cap
  const difficultyIncrement = Math.floor(newData.scrollOffset / 5000) * 0.1;
  newData.difficulty = Math.min(2.0, 1 + difficultyIncrement); // Cap at 2x difficulty

  return newData;
}

function updatePlayer(data: GameData, input: InputState): GameData {
  const player = { ...data.player };
  
  // Get mega ship speed boost
  const megaShipId = getStoredMegaShipId();
  const speedBoost = hasSpeedBoost(megaShipId);
  // Apply ad speed boost (+20%) on top of ship speed
  const adSpeedMultiplier = data.adSpeedActive ? 1.2 : 1.0;
  const speedMultiplier = (speedBoost?.speed || 1.0) * adSpeedMultiplier;
  const isStealthShip = hasStealthMode(megaShipId);
  
  // Apply ad shield boost - give player shield if active
  if (data.adShieldActive && !player.hasShield) {
    player.hasShield = true;
    player.shieldTimer = 60; // Will be refreshed each frame while ad shield is active
  } else if (data.adShieldActive && player.hasShield) {
    // Keep refreshing shield timer while ad shield is active
    player.shieldTimer = Math.max(player.shieldTimer, 60);
  }
  
  // Update stealth timer (5 second cycle: 2 seconds invisible, 3 seconds visible)
  let stealthTimer = data.stealthTimer + 1;
  const stealthCycle = 300; // 5 seconds at 60fps
  const stealthActiveFrames = 120; // 2 seconds invisible
  const isStealthActive = isStealthShip && (stealthTimer % stealthCycle) < stealthActiveFrames;
  
  // Make player temporarily invulnerable during stealth
  if (isStealthActive && !data.isStealthActive) {
    // Just became invisible - make invulnerable
    player.invulnerable = true;
    player.invulnerableTimer = stealthActiveFrames;
  }

  // Touch-follow movement with smoothing
  if (input.isTouching) {
    // Update target position (in world coordinates)
    player.targetX = data.scrollOffset + input.touchX;
    player.targetY = input.touchY;
  }

  // Smoothly move towards target with speed boost
  const targetWorldX = player.targetX;
  const targetWorldY = player.targetY;
  
  const prevX = player.x;
  const prevY = player.y;
  
  // Apply speed multiplier to smoothing (higher = faster response)
  const boostedSmoothing = Math.min(1.0, TOUCH_CONFIG.smoothing * speedMultiplier);
  player.x = lerp(player.x, targetWorldX, boostedSmoothing);
  player.y = lerp(player.y, targetWorldY, boostedSmoothing);

  // Update trail
  player.trail = [
    { x: prevX, y: prevY + player.height / 2, alpha: 1 },
    ...player.trail.map(p => ({ ...p, alpha: p.alpha * 0.92 }))
  ].filter(p => p.alpha > 0.05).slice(0, 12);

  // Keep player on screen (relative to scroll)
  const minX = data.scrollOffset + 30;
  const maxX = data.scrollOffset + GAME_CONFIG.canvasWidth - player.width - 60;
  player.x = clamp(player.x, minX, maxX);

  // Vertical bounds based on terrain
  const currentMap = getMap(data.currentMapId);
  const hasTerrain = currentMap.hasTerrain;
  
  const terrainAtPlayer = hasTerrain ? data.terrain.find(t => 
    t.x <= player.x + player.width / 2 && 
    t.x + TERRAIN_CONFIG.segmentWidth > player.x + player.width / 2
  ) : null;
  
  // On open space maps (no terrain), allow full vertical movement
  // On terrain maps, constrain to cave/terrain boundaries
  const minY = hasTerrain && terrainAtPlayer ? terrainAtPlayer.topHeight + 20 : 20;
  const maxY = hasTerrain && terrainAtPlayer 
    ? GAME_CONFIG.canvasHeight - terrainAtPlayer.bottomHeight - player.height - 10
    : GAME_CONFIG.canvasHeight - player.height - 20;
  const isHazardZone = currentMap.hasHazardousTerrain === true;
  let hitTerrain = false;
  let hitStructure = false;
  let structureHitX = 0;
  let structureHitY = 0;
  
  // Check terrain collision BEFORE clamping (using unclamped position)
  if (isHazardZone && terrainAtPlayer && !player.invulnerable && !player.hasShield) {
    const playerTop = player.y;
    const playerBottom = player.y + player.height;
    const terrainTop = terrainAtPlayer.topHeight;
    const terrainBottom = GAME_CONFIG.canvasHeight - terrainAtPlayer.bottomHeight;
    
    // Check if player would be touching terrain (within 10px of edge for better detection)
    if (playerTop < terrainTop + 10 || playerBottom > terrainBottom - 10) {
      hitTerrain = true;
    }
    
    // Check for structure collision
    if (terrainAtPlayer.hasStructure) {
      const structureX = terrainAtPlayer.x - data.scrollOffset;
      const structureGroundY = GAME_CONFIG.canvasHeight - terrainAtPlayer.bottomHeight;
      
      // Get structure bounds based on type
      let structWidth = 30;
      let structHeight = 40;
      if (terrainAtPlayer.structureType === 'tower') {
        structWidth = 20;
        structHeight = 55;
      } else if (terrainAtPlayer.structureType === 'pipe') {
        structWidth = 20;
        structHeight = 28;
      }
      
      const structLeft = structureX - structWidth / 2;
      const structRight = structureX + structWidth / 2;
      const structTop = structureGroundY - structHeight;
      const structBottom = structureGroundY;
      
      const playerLeft = player.x;
      const playerRight = player.x + player.width;
      const playerTopY = player.y;
      const playerBottomY = player.y + player.height;
      
      if (playerRight > structLeft && playerLeft < structRight &&
          playerBottomY > structTop && playerTopY < structBottom) {
        hitStructure = true;
        structureHitX = structureX;
        structureHitY = structureGroundY - structHeight / 2;
      }
    }
  }
  
  player.y = clamp(player.y, minY, maxY);
  
  // Apply terrain/structure collision damage in hazard zones
  let screenShake = data.screenShake;
  let terrainCollisionTimer = data.terrainCollisionTimer > 0 ? data.terrainCollisionTimer - 1 : 0;
  let collisionFlash = data.collisionFlash
    .map(f => ({ ...f, timer: f.timer - 1 }))
    .filter(f => f.timer > 0);
  
  if ((hitTerrain || hitStructure) && terrainCollisionTimer <= 0) {
    player.health -= 8; // Terrain/structure damage
    player.invulnerable = true;
    player.invulnerableTimer = 30;
    screenShake = 5;
    terrainCollisionTimer = 20; // Cooldown before next collision damage
    playSound('hit');
    
    // Add collision flash effect
    if (hitStructure) {
      // Flash at structure location
      collisionFlash.push({
        x: structureHitX,
        y: structureHitY,
        timer: 15,
        color: '#ff4444',
      });
    }
    // Always flash at player position
    collisionFlash.push({
      x: player.x + player.width / 2,
      y: player.y + player.height / 2,
      timer: 15,
      color: '#ff4444',
    });
  }

  // Timers
  if (player.fireTimer > 0) player.fireTimer--;
  if (player.bombTimer > 0) player.bombTimer--;
  if (player.invulnerableTimer > 0) {
    player.invulnerableTimer--;
    if (player.invulnerableTimer <= 0) {
      player.invulnerable = false;
    }
  }
  // Power-up timers
  if (player.homingMissileTimer > 0) {
    player.homingMissileTimer--;
    if (player.homingMissileTimer <= 0) {
      player.hasHomingMissiles = false;
    }
  }
  if (player.shieldTimer > 0) {
    player.shieldTimer--;
    if (player.shieldTimer <= 0) {
      player.hasShield = false;
    }
  }
  if (player.tripleShotTimer > 0) {
    player.tripleShotTimer--;
    if (player.tripleShotTimer <= 0) {
      player.hasTripleShot = false;
    }
  }
  if (player.forceFieldTimer > 0) {
    player.forceFieldTimer--;
    if (player.forceFieldTimer <= 0) {
      player.hasForceField = false;
    }
  }

  // Auto-shooting while touching
  let bullets = [...data.bullets];
  // Handle pending missile (second rocket with delay)
  if (player.pendingMissile) {
    player.pendingMissile.delay--;
    if (player.pendingMissile.delay <= 0) {
      bullets.push(
        createBullet(
          player.pendingMissile.x,
          player.pendingMissile.y,
          GAME_CONFIG.bulletSpeed * 0.6,
          0.3,
          true,
          18,
          true,
          8,
          3
        )
      );
      playSound('missile');
      player.pendingMissile = null;
    }
  }

  // Get mega ship abilities (reuse from updatePlayer scope)
  const shipId = getStoredMegaShipId();
  const shipSpeedBoost = hasSpeedBoost(shipId);
  const isLaserShip = hasLaserAbility(shipId);
  const doubleBombs = hasDoubleBombs(shipId);
  const multiShots = hasMultiDirectionalShots(shipId);
  
  // Apply speed boost to fire rate
  const shipFireRateMultiplier = shipSpeedBoost?.fireRate || 1.0;
  const shipBombRateMultiplier = shipSpeedBoost?.bombRate || 1.0;

  if (input.fire && player.fireTimer <= 0) {
    if (player.hasHomingMissiles) {
      // Fire first rocket from top wing immediately
      const wingOffset = player.height * 0.35;
      bullets.push(
        createBullet(
          player.x + player.width * 0.6,
          player.y + player.height / 2 - wingOffset - 2,
          GAME_CONFIG.bulletSpeed * 0.6,
          -0.3,
          true,
          18,
          true,
          8,
          3
        )
      );
      playSound('missile');
      
      player.pendingMissile = {
        x: player.x + player.width * 0.6,
        y: player.y + player.height / 2 + wingOffset + 2,
        delay: 8
      };
    } else if (player.hasTripleShot || data.adTripleShotsActive) {
      // Triple shot from power-up OR ad reward
      const wingOffset = player.height * 0.35;
      bullets.push(
        createBullet(player.x + player.width, player.y + player.height / 2 - 1, GAME_CONFIG.bulletSpeed, 0, true, 12),
        createBullet(player.x + player.width * 0.7, player.y + player.height / 2 - wingOffset, GAME_CONFIG.bulletSpeed * 0.95, -1, true, 10),
        createBullet(player.x + player.width * 0.7, player.y + player.height / 2 + wingOffset, GAME_CONFIG.bulletSpeed * 0.95, 1, true, 10)
      );
    } else if (data.adDoubleLaserActive) {
      // Double laser from ad reward - fire two parallel shots
      const bullet1 = createBullet(
        player.x + player.width,
        player.y + player.height / 2 - 5,
        GAME_CONFIG.bulletSpeed,
        0,
        true,
        15
      );
      bullet1.isLaser = true;
      const bullet2 = createBullet(
        player.x + player.width,
        player.y + player.height / 2 + 5,
        GAME_CONFIG.bulletSpeed,
        0,
        true,
        15
      );
      bullet2.isLaser = true;
      bullets.push(bullet1, bullet2);
    } else {
      // Normal or laser shot
      const bullet = createBullet(
        player.x + player.width,
        player.y + player.height / 2 - 1,
        GAME_CONFIG.bulletSpeed,
        0,
        true,
        isLaserShip ? 15 : 12
      );
      if (isLaserShip) {
        bullet.isLaser = true;
      }
      bullets.push(bullet);
    }
    
    let fireRateMultiplier = shipFireRateMultiplier;
    if (player.hasHomingMissiles) {
      fireRateMultiplier = 2.0;
    } else if (data.adDoubleLaserActive) {
      // Double laser reward: faster fire rate
      fireRateMultiplier = 0.5;
    }
    player.fireTimer = Math.floor(GAME_CONFIG.fireRate * fireRateMultiplier);
    if (!player.hasHomingMissiles) {
      playSound(getShipShootSound(shipId));
    }
  }
  
  // Crimson Hawk multi-directional shots (once per second = 60 frames)
  // Use separate timer so it fires exactly once per second regardless of fire rate
  let multiShotTimer = data.multiShotTimer || 0;
  if (multiShots) {
    multiShotTimer--;
    if (multiShotTimer <= 0) {
      // Fire directional shots once per second
      // Up/Down shots move slightly forward to stay on screen and hit enemies
      // (compensate for world scroll by adding scroll speed to velocityX)
      const scrollCompensation = data.scrollSpeed * 0.8; // Move forward slightly with scroll
      bullets.push(
        createBullet(player.x + player.width / 2, player.y, scrollCompensation, -GAME_CONFIG.bulletSpeed * 0.8, true, 8), // Up
        createBullet(player.x + player.width / 2, player.y + player.height, scrollCompensation, GAME_CONFIG.bulletSpeed * 0.8, true, 8), // Down
        createBullet(player.x, player.y + player.height / 2, -GAME_CONFIG.bulletSpeed * 0.6, 0, true, 8) // Back
      );
      multiShotTimer = 60; // Reset to 1 second (60 frames)
      playSound('multiShot');
    }
  }

  // Bombing
  let bombs = [...data.bombs];
  if (input.bomb && player.bombTimer <= 0) {
    bombs.push(createBomb(player.x + player.width / 2, player.y + player.height));
    // Double bombs for Arctic Wolf OR ad reward
    if (doubleBombs || data.adDoubleBombsActive) {
      bombs.push(createBomb(player.x + player.width / 2 + 15, player.y + player.height));
    }
    player.bombTimer = Math.floor(GAME_CONFIG.bombRate * shipBombRateMultiplier);
    playSound(getShipBombSound(shipId));
  }

  return { ...data, player, bullets, bombs, screenShake, inHazardZone: isHazardZone, terrainCollisionTimer, collisionFlash, stealthTimer, isStealthActive, multiShotTimer };
}

function updateBullets(data: GameData): GameData {
  const bullets = data.bullets
    .map(bullet => {
      if (bullet.isHoming && bullet.isPlayerBullet) {
        // Homing missiles track nearest enemy
        const nearestEnemy = data.enemies
          .filter(e => e.x - data.scrollOffset > 0)
          .sort((a, b) => {
            const distA = Math.abs(a.x - bullet.x) + Math.abs(a.y - bullet.y);
            const distB = Math.abs(b.x - bullet.x) + Math.abs(b.y - bullet.y);
            return distA - distB;
          })[0];
        
        if (nearestEnemy) {
          const dx = nearestEnemy.x + nearestEnemy.width / 2 - bullet.x;
          const dy = nearestEnemy.y + nearestEnemy.height / 2 - bullet.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const speed = Math.sqrt(bullet.velocityX * bullet.velocityX + bullet.velocityY * bullet.velocityY);
          
          // Gradually turn towards target
          const newVx = bullet.velocityX + (dx / dist) * 0.3;
          const newVy = bullet.velocityY + (dy / dist) * 0.3;
          const newSpeed = Math.sqrt(newVx * newVx + newVy * newVy);
          
          return {
            ...bullet,
            x: bullet.x + (newVx / newSpeed) * speed,
            y: bullet.y + (newVy / newSpeed) * speed,
            velocityX: (newVx / newSpeed) * speed,
            velocityY: (newVy / newSpeed) * speed,
          };
        }
      }
      
      return {
        ...bullet,
        x: bullet.x + bullet.velocityX,
        y: bullet.y + bullet.velocityY,
      };
    })
    .filter(bullet => {
      const screenX = bullet.x - data.scrollOffset;
      return screenX > -50 && screenX < GAME_CONFIG.canvasWidth + 50 &&
             bullet.y > 0 && bullet.y < GAME_CONFIG.canvasHeight;
    });

  return { ...data, bullets };
}

function updateBombs(data: GameData): GameData {
  let particles = [...data.particles];
  let enemies = [...data.enemies];
  let terrain = [...data.terrain];
  let screenShake = data.screenShake;
  
  // Check if we're in a hazard zone (buildings are destructible)
  const currentMap = getMap(data.currentMapId);
  const isHazardZone = currentMap.hasHazardousTerrain === true;

  const bombs = data.bombs
    .map(bomb => ({
      ...bomb,
      y: bomb.y + bomb.velocityY,
      velocityY: bomb.velocityY + 0.12,
      timer: bomb.timer - 1,
    }))
    .filter(bomb => {
      const terrainAtBomb = terrain.find(t =>
        t.x <= bomb.x && t.x + TERRAIN_CONFIG.segmentWidth > bomb.x
      );
      
      const groundY = terrainAtBomb
        ? GAME_CONFIG.canvasHeight - terrainAtBomb.bottomHeight
        : GAME_CONFIG.canvasHeight - 40;

      if (bomb.y >= groundY - bomb.height || bomb.timer <= 0) {
        particles.push(...createExplosion(bomb.x, bomb.y, 15));
        screenShake = 6;
        playSound('explosion');

        enemies = enemies.map(enemy => {
          const dist = Math.abs(enemy.x - bomb.x) + Math.abs(enemy.y - bomb.y);
          if (dist < 60) {
            return { ...enemy, health: enemy.health - bomb.damage };
          }
          return enemy;
        });
        
        // In hazard zones, bombs can destroy structures
        if (isHazardZone && terrainAtBomb && terrainAtBomb.hasStructure) {
          const structureX = terrainAtBomb.x - data.scrollOffset;
          const structureGroundY = GAME_CONFIG.canvasHeight - terrainAtBomb.bottomHeight;
          const bombScreenX = bomb.x - data.scrollOffset;
          
          // Check if bomb is near the structure
          if (Math.abs(bombScreenX - structureX) < 50 && bomb.y > structureGroundY - 60) {
            // Create bigger explosion for structure destruction
            particles.push(...createExplosion(structureX + data.scrollOffset, structureGroundY - 25, 20));
            // Remove the structure from terrain
            const terrainIndex = terrain.findIndex(t => t.x === terrainAtBomb.x);
            if (terrainIndex !== -1) {
              terrain[terrainIndex] = { ...terrain[terrainIndex], hasStructure: false, structureType: undefined };
            }
          }
        }

        return false;
      }
      return true;
    });

  enemies.forEach(enemy => {
    if (enemy.health <= 0) {
      particles.push(...createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 10));
      playSound('explosion');
    }
  });
  enemies = enemies.filter(e => e.health > 0);

  return { ...data, bombs, particles, enemies, screenShake, terrain };
}

function updateEnemies(data: GameData): GameData {
  let bullets = [...data.bullets];

  const enemies = data.enemies
    .map(enemy => {
      const newEnemy = { ...enemy };

      // Decrement shocked timer if active
      if (newEnemy.shockedTimer && newEnemy.shockedTimer > 0) {
        newEnemy.shockedTimer--;
      }

      // Slow down movement if shocked
      const speedMultiplier = (newEnemy.shockedTimer && newEnemy.shockedTimer > 0) ? 0.3 : 1;

      switch (enemy.behavior.pattern) {
        case 'static':
          break;
        case 'sine':
          newEnemy.x += enemy.velocityX * speedMultiplier;
          newEnemy.y = (enemy.behavior.startY || enemy.y) +
            Math.sin((data.scrollOffset + enemy.x) * (enemy.behavior.frequency || 0.03)) *
            (enemy.behavior.amplitude || 30) * speedMultiplier;
          break;
        case 'chase':
          newEnemy.x += enemy.velocityX * speedMultiplier;
          const dy = data.player.y - enemy.y;
          newEnemy.y += Math.sign(dy) * Math.min(Math.abs(dy) * 0.015, 0.8) * speedMultiplier;
          break;
        case 'patrol':
          newEnemy.x += enemy.velocityX * speedMultiplier;
          break;
      }

      // Calculate aim angle for ground-based enemies
      const dx = data.player.x - enemy.x;
      const dy = data.player.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (enemy.type === 'turret' || enemy.type === 'sniper' || enemy.type === 'tank') {
        newEnemy.aimAngle = Math.atan2(dy, dx);
      }

      newEnemy.fireTimer--;
      if (newEnemy.fireTimer <= 0) {
        const fireRate = enemy.type === 'turret' ? ENEMY_CONFIG.turretFireRate : 
                         enemy.type === 'sniper' ? 180 : // Snipers shoot less often
                         enemy.type === 'tank' ? 160 : // Tanks shoot less often
                         enemy.type === 'hostilePerson' ? 120 : // Increased from 70
                         ENEMY_CONFIG.droneFireRate;
        // Apply difficulty but with diminishing effect (sqrt) to prevent overwhelming fire rate
        const diffMult = getDifficultyMultipliers();
        newEnemy.fireTimer = Math.floor(fireRate / (Math.sqrt(data.difficulty) * diffMult.enemyFireRate));

        const screenX = enemy.x - data.scrollOffset;
        if (screenX > 0 && screenX < GAME_CONFIG.canvasWidth) {
          
          if (enemy.type === 'turret') {
            // Shoot from barrel tip
            const barrelLength = 22;
            const barrelX = enemy.x + enemy.width / 2 + Math.cos(newEnemy.aimAngle || 0) * barrelLength;
            const barrelY = enemy.y + 5.5 + Math.sin(newEnemy.aimAngle || 0) * barrelLength;
            bullets.push(
              createBullet(
                barrelX,
                barrelY,
                (dx / dist) * 3, // Reduced from 4 - slower bullets
                (dy / dist) * 3,
                false,
                8
              )
            );
          } else if (enemy.type === 'drone') {
            bullets.push(
              createBullet(
                enemy.x,
                enemy.y + enemy.height / 2,
                -6,
                0,
                false,
                6
              )
            );
          } else if (enemy.type === 'hostilePerson') {
            // Red hostile person shoots smaller bullets at player
            bullets.push(
              createBullet(
                enemy.x - 5,
                enemy.y + 5,
                (dx / dist) * 2.5, // Reduced from 3.5 - slower bullets
                (dy / dist) * 2.5,
                false,
                6,
                false,
                SPRITE_SIZE.bulletSmall.width,
                SPRITE_SIZE.bulletSmall.height
              )
            );
          } else if (enemy.type === 'sniper') {
            // Sniper shoots from barrel tip
            const barrelLength = 14;
            const barrelX = enemy.x + enemy.width / 2 + Math.cos(newEnemy.aimAngle || 0) * barrelLength;
            const barrelY = enemy.y + enemy.height / 2 + Math.sin(newEnemy.aimAngle || 0) * barrelLength;
            bullets.push(
              createBullet(
                barrelX,
                barrelY,
                (dx / dist) * 5, // Reduced from 8 - slower sniper bullets
                (dy / dist) * 5,
                false,
                12
              )
            );
          } else if (enemy.type === 'tank') {
            // Tank shoots from barrel tip
            const barrelLength = 18;
            const barrelX = enemy.x + enemy.width / 2 + Math.cos(newEnemy.aimAngle || 0) * barrelLength;
            const barrelY = enemy.y + enemy.height / 2 + Math.sin(newEnemy.aimAngle || 0) * barrelLength;
            bullets.push(
              createBullet(
                barrelX,
                barrelY,
                (dx / dist) * 3,
                (dy / dist) * 3,
                false,
                20
              )
            );
          } else if (enemy.type === 'bomber') {
            // Bomber drops bombs downward
            bullets.push(
              createBullet(
                enemy.x + enemy.width / 2,
                enemy.y + enemy.height,
                0,
                4,
                false,
                10
              )
            );
          }
        }
      }

      return newEnemy;
    })
    .filter(enemy => {
      const screenX = enemy.x - data.scrollOffset;
      return screenX > -80;
    });

  return { ...data, enemies, bullets };
}

function updateCivilians(data: GameData, input: InputState): GameData {
  let civilians = [...data.civilians];
  let score = data.score;
  let rescuedCount = data.rescuedCount;
  const scoreMultiplier = data.adDoublePointsActive ? 2.0 : 1.0;

  civilians = civilians.map(civilian => {
    if (civilian.rescued) return civilian;

    const dx = Math.abs(data.player.x + data.player.width / 2 - civilian.x);
    const playerBottom = data.player.y + data.player.height;
    const civilianTop = civilian.y;
    
    // Auto-rescue: player must be 5-15px above civilian (sweet spot for pickup)
    const verticalGap = civilianTop - playerBottom;
    const isInRescueRange = verticalGap >= AUTO_RESCUE_MIN_Y && verticalGap <= AUTO_RESCUE_MAX_Y;
    const isCloseHorizontally = dx < AUTO_RESCUE_DISTANCE_X;
    
    if (isCloseHorizontally && isInRescueRange) {
      playSound('rescue');
      score += Math.floor(100 * scoreMultiplier);
      rescuedCount++;
      return { ...civilian, rescued: true };
    }

    return civilian;
  }).filter(c => {
    const screenX = c.x - data.scrollOffset;
    return screenX > -80;
  });

  return { ...data, civilians, score, rescuedCount };
}

function updatePickups(data: GameData): GameData {
  let player = { ...data.player };
  let escorts = [...data.escorts];
  let enemies = [...data.enemies];
  let particles = [...data.particles];
  let screenShake = data.screenShake;
  let score = data.score;
  const scoreMultiplier = data.adDoublePointsActive ? 2.0 : 1.0;

  const pickups = data.pickups.filter(pickup => {
    if (checkCollision(player, pickup)) {
      playSound('pickup');
      
      switch (pickup.type) {
        case 'forceField':
          player.hasForceField = true;
          player.forceFieldTimer = 240; // 4 seconds at 60fps
          playSound('forceField');
          break;
        case 'health':
          player.health = Math.min(player.maxHealth, player.health + pickup.value);
          break;
        case 'homingMissile':
          player.hasHomingMissiles = true;
          player.homingMissileTimer = 360;
          playSound('homingMissilePickup');
          break;
        case 'shield':
          player.hasShield = true;
          player.shieldTimer = 480;
          break;
        case 'megaBomb':
          // Kill all enemies on screen
          enemies.forEach(enemy => {
            particles.push(...createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 12));
            score += Math.floor(30 * scoreMultiplier);
          });
          enemies = [];
          screenShake = 10;
          playSound('megaBomb');
          break;
        case 'escort':
          // Spawn escort planes
          escorts.push(createEscortPlane(player.x, player.y, 'shooter'));
          escorts.push(createEscortPlane(player.x, player.y, 'bomber'));
          break;
        case 'tripleShot':
          player.hasTripleShot = true;
          player.tripleShotTimer = 300; // 5 seconds at 60fps
          break;
        case 'electricPulse':
          // Damage all enemies on screen (half damage, doesn't kill outright)
          // Add shocked effect to all enemies
          enemies = enemies.map(enemy => {
            particles.push(...createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 6));
            return { ...enemy, health: enemy.health - 15, shockedTimer: 90 }; // 1.5 seconds of shock effect
          });
          enemies.forEach(enemy => {
            if (enemy.health <= 0) {
              particles.push(...createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 10));
              score += Math.floor(20 * scoreMultiplier);
            }
          });
          enemies = enemies.filter(e => e.health > 0);
          screenShake = 8;
          playSound('electricPulse');
          break;
      }
      return false;
    }

    const screenX = pickup.x - data.scrollOffset;
    return screenX > -40;
  });

  return { ...data, player, pickups, escorts, enemies, particles, screenShake, score };
}

function updateParticles(data: GameData): GameData {
  const particles = data.particles
    .map(p => ({
      ...p,
      x: p.x + p.velocityX,
      y: p.y + p.velocityY,
      velocityY: p.velocityY + 0.08,
      life: p.life - 1,
    }))
    .filter(p => p.life > 0);

  return { ...data, particles };
}

function spawnEntities(data: GameData): GameData {
  let enemies = [...data.enemies];
  let civilians = [...data.civilians];
  let pickups = [...data.pickups];
  let nextFormationId = data.nextFormationId;

  const spawnX = data.scrollOffset + GAME_CONFIG.canvasWidth + 80;
  
  // Get current map to check if it's a space map (no terrain)
  const currentMap = getMap(data.currentMapId);
  const terrainType = getTerrainType(currentMap);
  const isSpaceMap = !currentMap.hasTerrain;
  const isCeilingOnly = terrainType === 'ceiling'; // Only ceiling, no floor - only flying enemies

  const difficultyMult = getDifficultyMultipliers();
  if (Math.random() < SPAWN_CONFIG.enemyChance * data.difficulty * difficultyMult.enemySpawnRate && enemies.length < ENEMY_CONFIG.maxEnemies) {
    const terrainAtSpawn = data.terrain.find(t =>
      t.x <= spawnX && t.x + TERRAIN_CONFIG.segmentWidth > spawnX
    );
    
    // Choose enemy types based on map type
    let types: Enemy['type'][];
    if (isCeilingOnly) {
      // Ceiling-only maps: only flying enemies, no ground enemies, no civilians
      types = ['drone', 'bomber', 'drone', 'leech', 'missile'];
      
      if (Math.random() < SPAWN_CONFIG.formationChance) {
        // Formation of flying enemies
        const flyingTypes: Enemy['type'][] = ['drone', 'bomber', 'leech'];
        const formationType = flyingTypes[Math.floor(Math.random() * flyingTypes.length)];
        const formationSize = SPAWN_CONFIG.formationSize.min + 
          Math.floor(Math.random() * (SPAWN_CONFIG.formationSize.max - SPAWN_CONFIG.formationSize.min + 1));
        const baseY = 80 + Math.random() * (GAME_CONFIG.canvasHeight - 150);
        const currentFormationId = nextFormationId;
        nextFormationId++;
        
        for (let i = 0; i < formationSize; i++) {
          const offsetX = i * 35;
          const offsetY = (i % 2 === 0 ? 1 : -1) * (i * 12);
          const enemy = createEnemy(formationType, spawnX + offsetX, baseY + offsetY);
          enemy.formationId = currentFormationId;
          enemies.push(enemy);
        }
      } else {
        const type = types[Math.floor(Math.random() * types.length)];
        // Flying enemies in the air - full vertical range
        const minY = terrainAtSpawn ? terrainAtSpawn.topHeight + 30 : 60;
        const maxY = GAME_CONFIG.canvasHeight - 40;
        const y = minY + Math.random() * (maxY - minY);
        enemies.push(createEnemy(type, spawnX, y));
      }
    } else if (isSpaceMap) {
      // Space maps: only flying enemies, including tentacle creatures, spawn in formations
      types = ['drone', 'bomber', 'drone', 'leech', 'missile', 'jellyfish', 'kraken'];
      
      // Higher chance to spawn formation for more power-up opportunities
      if (Math.random() < SPAWN_CONFIG.formationChance) {
        const formationSize = SPAWN_CONFIG.formationSize.min + 
          Math.floor(Math.random() * (SPAWN_CONFIG.formationSize.max - SPAWN_CONFIG.formationSize.min + 1));
        const baseY = 80 + Math.random() * (GAME_CONFIG.canvasHeight - 200);
        const formationType = types[Math.floor(Math.random() * types.length)];
        const currentFormationId = nextFormationId;
        nextFormationId++;
        
        for (let i = 0; i < formationSize; i++) {
          const offsetX = i * 35;
          const offsetY = (i % 2 === 0 ? 1 : -1) * (i * 12);
          const enemy = createEnemy(formationType, spawnX + offsetX, baseY + offsetY);
          enemy.formationId = currentFormationId;
          enemies.push(enemy);
        }
      } else {
        const type = types[Math.floor(Math.random() * types.length)];
        const minY = 60;
        const maxY = GAME_CONFIG.canvasHeight - 60;
        const y = minY + Math.random() * (maxY - minY);
        enemies.push(createEnemy(type, spawnX, y));
      }
    } else {
      // Ground maps: include ground-based enemies and flying creatures, sometimes in formations
      types = ['turret', 'drone', 'leech', 'drone', 'bomber', 'sniper', 'tank', 'jellyfish', 'kraken'];
      
      // Formation for flying enemies on ground maps
      if (Math.random() < SPAWN_CONFIG.formationChance * 0.7) {
        const flyingTypes: Enemy['type'][] = ['drone', 'bomber', 'leech', 'jellyfish'];
        const formationType = flyingTypes[Math.floor(Math.random() * flyingTypes.length)];
        const formationSize = SPAWN_CONFIG.formationSize.min + 
          Math.floor(Math.random() * (SPAWN_CONFIG.formationSize.max - SPAWN_CONFIG.formationSize.min));
        const baseY = 80 + Math.random() * (GAME_CONFIG.canvasHeight - 200);
        const currentFormationId = nextFormationId;
        nextFormationId++;
        
        for (let i = 0; i < formationSize; i++) {
          const offsetX = i * 35;
          const offsetY = (i % 2 === 0 ? 1 : -1) * (i * 12);
          const enemy = createEnemy(formationType, spawnX + offsetX, baseY + offsetY);
          enemy.formationId = currentFormationId;
          enemies.push(enemy);
        }
      } else {
        const type = types[Math.floor(Math.random() * types.length)];
        
        let y: number;
        if ((type === 'turret' || type === 'sniper' || type === 'tank') && terrainAtSpawn) {
          y = GAME_CONFIG.canvasHeight - terrainAtSpawn.bottomHeight - (type === 'tank' ? 14 : 16);
        } else {
          const minY = terrainAtSpawn ? terrainAtSpawn.topHeight + 30 : 60;
          const maxY = terrainAtSpawn
            ? GAME_CONFIG.canvasHeight - terrainAtSpawn.bottomHeight - 40
            : GAME_CONFIG.canvasHeight - 60;
          y = minY + Math.random() * (maxY - minY);
        }

        enemies.push(createEnemy(type, spawnX, y));
      }
    }
  }

  // Only spawn civilians on ground maps (not on ceiling-only or space maps)
  const hasFloor = terrainType === 'cave' || terrainType === 'surface' || terrainType === 'city' || terrainType === 'mixed';
  if (hasFloor && Math.random() < SPAWN_CONFIG.civilianChance) {
    const terrainAtSpawn = data.terrain.find(t =>
      t.x <= spawnX && t.x + TERRAIN_CONFIG.segmentWidth > spawnX
    );
    
    if (terrainAtSpawn && terrainAtSpawn.bottomHeight > 0) {
      const y = GAME_CONFIG.canvasHeight - terrainAtSpawn.bottomHeight - 8;
      civilians.push(createCivilian(spawnX, y));
    }
  }

  // Spawn hostile person only on ground maps (not on ceiling-only or space maps)
  if (hasFloor && Math.random() < SPAWN_CONFIG.hostilePersonChance && enemies.length < ENEMY_CONFIG.maxEnemies) {
    const terrainAtSpawn = data.terrain.find(t =>
      t.x <= spawnX && t.x + TERRAIN_CONFIG.segmentWidth > spawnX
    );
    
    if (terrainAtSpawn && terrainAtSpawn.bottomHeight > 0) {
      const y = GAME_CONFIG.canvasHeight - terrainAtSpawn.bottomHeight - 10;
      enemies.push(createEnemy('hostilePerson', spawnX, y));
    }
  }

  // Helper function to get safe Y position for pickups (avoiding terrain)
  const getSafePickupY = (): number => {
    const terrainAtSpawn = data.terrain.find(t =>
      t.x <= spawnX && t.x + TERRAIN_CONFIG.segmentWidth > spawnX
    );
    
    // Default safe zone if no terrain found
    let minY = 60;
    let maxY = GAME_CONFIG.canvasHeight - 60;
    
    if (terrainAtSpawn) {
      // Add margin to stay away from terrain edges
      const margin = 25;
      minY = terrainAtSpawn.topHeight + margin;
      maxY = GAME_CONFIG.canvasHeight - terrainAtSpawn.bottomHeight - margin;
    }
    
    // Ensure valid range
    if (maxY <= minY) {
      return GAME_CONFIG.canvasHeight / 2; // Fallback to center
    }
    
    return minY + Math.random() * (maxY - minY);
  };

  // Only spawn forceField/health pickups randomly (power-ups come from enemy kills)
  // Pickup chance is affected by difficulty setting
  if (Math.random() < SPAWN_CONFIG.pickupChance * difficultyMult.pickupChance) {
    const type = Math.random() < 0.7 ? 'forceField' : 'health';
    pickups.push(createPickup(type as 'forceField' | 'health', spawnX, getSafePickupY()));
  }

  // Spawn falling debris in maps with falling debris
  // Works with 'cave' (from ceiling), 'surface' (meteors from sky), and 'ceiling' types
  let fallingDebris = [...data.fallingDebris];
  const debrisMap = getMap(data.currentMapId);
  const debrisTerrainType = getTerrainType(debrisMap);
  const debrisType = debrisMap.debrisType || 'rock';
  
  if (debrisMap.hasFallingDebris) {
    // Random chance to spawn debris - slightly higher for surface maps (more dramatic)
    const spawnChance = debrisTerrainType === 'surface' ? 0.02 : 0.015;
    
    if (Math.random() < spawnChance) {
      if (debrisTerrainType === 'cave' || debrisTerrainType === 'ceiling') {
        // Spawn from ceiling in caves
        const terrainAtSpawn = data.terrain.find(t =>
          t.x <= spawnX && t.x + TERRAIN_CONFIG.segmentWidth > spawnX
        );
        if (terrainAtSpawn && terrainAtSpawn.topHeight > 30) {
          fallingDebris.push(createDebris(spawnX, terrainAtSpawn.topHeight, debrisType));
        }
      } else if (debrisTerrainType === 'surface' || debrisTerrainType === 'city') {
        // Surface/city maps: debris falls from the sky (like meteors or falling rocks)
        const randomX = data.scrollOffset + GAME_CONFIG.canvasWidth * (0.3 + Math.random() * 0.7);
        fallingDebris.push(createDebris(randomX, -10, debrisType)); // Spawn above screen
      }
    }
  }

  return { ...data, enemies, civilians, pickups, fallingDebris, nextFormationId };
}

function generateMoreTerrain(data: GameData): GameData {
  const lastTerrain = data.terrain[data.terrain.length - 1];
  const currentMap = getMap(data.currentMapId);
  
  if (lastTerrain.x - data.scrollOffset < GAME_CONFIG.canvasWidth + 400) {
    const newTerrain = generateTerrain(
      lastTerrain.x + TERRAIN_CONFIG.segmentWidth,
      30,
      lastTerrain.topHeight,
      lastTerrain.bottomHeight,
      currentMap.structureTypes,
      currentMap.structureChance
    );
    
    const terrain = [...data.terrain, ...newTerrain].filter(
      t => t.x > data.scrollOffset - 150
    );

    return { ...data, terrain };
  }

  return data;
}

function updateFallingDebris(data: GameData): GameData {
  const currentMap = getMap(data.currentMapId);
  if (!currentMap.hasFallingDebris) {
    return { ...data, fallingDebris: [] };
  }

  let fallingDebris = data.fallingDebris.map(debris => {
    return {
      ...debris,
      x: debris.x + debris.velocityX,
      y: debris.y + debris.velocityY,
      velocityY: debris.velocityY + 0.1, // Gravity
      rotation: debris.rotation + debris.rotationSpeed,
    };
  });

  // Remove debris that fell off screen
  fallingDebris = fallingDebris.filter(debris => {
    const screenX = debris.x - data.scrollOffset;
    const terrainAtDebris = data.terrain.find(t =>
      t.x <= debris.x && t.x + TERRAIN_CONFIG.segmentWidth > debris.x
    );
    const groundY = terrainAtDebris 
      ? GAME_CONFIG.canvasHeight - terrainAtDebris.bottomHeight
      : GAME_CONFIG.canvasHeight;
    
    return screenX > -50 && debris.y < groundY;
  });

  return { ...data, fallingDebris };
}

function checkAllCollisions(data: GameData): GameData {
  let player = { ...data.player };
  let enemies = [...data.enemies];
  let bullets = [...data.bullets];
  let particles = [...data.particles];
  let fallingDebris = [...data.fallingDebris];
  let pickups = [...data.pickups];
  let score = data.score;
  const scoreMultiplier = data.adDoublePointsActive ? 2.0 : 1.0;
  let screenShake = data.screenShake;
  let killsSinceLastDrop = data.killsSinceLastDrop;
  let collisionFlash = [...data.collisionFlash];
  
  // Track killed enemies and their formations
  const killedEnemies: { x: number; y: number; formationId?: number }[] = [];
  const formationKills = new Map<number, number>(); // formationId -> kill count this frame

  // Check if we're in a hazard zone (buildings are destructible by bullets)
  const currentMap = getMap(data.currentMapId);
  const isHazardZone = currentMap.hasHazardousTerrain === true;
  let terrain = [...data.terrain];
  
  // Triple shots reward: 20% more damage
  const playerDamageMultiplier = data.adTripleShotsActive ? 1.2 : 1.0;
  
  bullets = bullets.filter(bullet => {
    if (!bullet.isPlayerBullet) return true;

    for (let i = 0; i < enemies.length; i++) {
      if (checkCollision(bullet, enemies[i])) {
        const boostedDamage = Math.floor(bullet.damage * playerDamageMultiplier);
        enemies[i] = { ...enemies[i], health: enemies[i].health - boostedDamage };
        
        if (enemies[i].health <= 0) {
          particles.push(...createExplosion(enemies[i].x + enemies[i].width / 2, enemies[i].y + enemies[i].height / 2, 8));
          score += Math.floor((enemies[i].type === 'turret' ? 50 : 30) * scoreMultiplier);
          playSound('explosion');
          
          // Track this kill for power-up drops
          killedEnemies.push({
            x: enemies[i].x,
            y: enemies[i].y + enemies[i].height / 2,
            formationId: enemies[i].formationId
          });
          
          // Track formation kills
          if (enemies[i].formationId !== undefined) {
            const currentCount = formationKills.get(enemies[i].formationId) || 0;
            formationKills.set(enemies[i].formationId, currentCount + 1);
          }
        }
        
        return false;
      }
    }
    
    // In hazard zones, bullets can destroy structures
    if (isHazardZone) {
      const terrainAtBullet = terrain.find(t =>
        t.x <= bullet.x && t.x + TERRAIN_CONFIG.segmentWidth > bullet.x
      );
      
      if (terrainAtBullet && terrainAtBullet.hasStructure) {
        const structureX = terrainAtBullet.x - data.scrollOffset;
        const structureGroundY = GAME_CONFIG.canvasHeight - terrainAtBullet.bottomHeight;
        const bulletScreenX = bullet.x - data.scrollOffset;
        const bulletScreenY = bullet.y;
        
        // Get structure bounds
        let structWidth = 30;
        let structHeight = 40;
        if (terrainAtBullet.structureType === 'tower') {
          structWidth = 20;
          structHeight = 55;
        } else if (terrainAtBullet.structureType === 'pipe') {
          structWidth = 20;
          structHeight = 28;
        }
        
        const structLeft = structureX - structWidth / 2;
        const structRight = structureX + structWidth / 2;
        const structTop = structureGroundY - structHeight;
        const structBottom = structureGroundY;
        
        if (bulletScreenX > structLeft && bulletScreenX < structRight &&
            bulletScreenY > structTop && bulletScreenY < structBottom) {
          // Create explosion at structure
          particles.push(...createExplosion(bullet.x, bullet.y, 12));
          playSound('explosion');
          score += Math.floor(25 * scoreMultiplier);
          
          // Remove the structure from terrain
          const terrainIndex = terrain.findIndex(t => t.x === terrainAtBullet.x);
          if (terrainIndex !== -1) {
            terrain[terrainIndex] = { ...terrain[terrainIndex], hasStructure: false, structureType: undefined };
          }
          return false;
        }
      }
    }
    
    return true;
  });

  // Apply damage multiplier when player gets hit (includes difficulty setting)
  const diffMult = getDifficultyMultipliers();
  const damageMultiplier = ENEMY_CONFIG.enemyDamageMultiplier * diffMult.enemyDamage;

  if (!player.invulnerable && !player.hasShield) {
    bullets = bullets.filter(bullet => {
      if (bullet.isPlayerBullet) return true;

      if (checkCollision(bullet, player)) {
        player.health -= Math.floor(bullet.damage * damageMultiplier);
        player.invulnerable = true;
        player.invulnerableTimer = 45;
        screenShake = 4;
        playSound('hit');
        return false;
      }
      return true;
    });

    enemies = enemies.filter(enemy => {
      if (checkCollision(player, enemy)) {
        if (player.hasForceField) {
          // Force field destroys enemy on contact
          particles.push(...createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 10));
          score += Math.floor(20 * scoreMultiplier);
          screenShake = 3;
          playSound('explosion');
          return false; // Remove enemy
        } else {
          // Normal collision damage
          player.health -= Math.floor(15 * damageMultiplier);
          player.invulnerable = true;
          player.invulnerableTimer = 45;
          screenShake = 5;
          playSound('hit');
        }
      }
      return true;
    });

    // Check debris collision with player
    fallingDebris = fallingDebris.filter(debris => {
      if (checkCollision(player, debris)) {
        player.health -= Math.floor(debris.damage * damageMultiplier);
        player.invulnerable = true;
        player.invulnerableTimer = 30;
        screenShake = 3;
        playSound('hit');
        particles.push(...createExplosion(debris.x, debris.y, 4));
        // Add collision flash effect
        collisionFlash.push({
          x: debris.x,
          y: debris.y,
          timer: 12,
          color: '#ff8844',
        });
        return false; // Remove debris after hit
      }
      return true;
    });
  }

  // Filter out dead enemies
  const deadEnemies = enemies.filter(e => e.health <= 0);
  enemies = enemies.filter(e => e.health > 0);
  
  // Check for destroyed formations and drop power-ups
  for (const [formationId, killCount] of formationKills) {
    // Check if entire formation is now destroyed
    const remainingInFormation = enemies.filter(e => e.formationId === formationId).length;
    
    if (remainingInFormation === 0 && killCount > 0) {
      // Entire formation destroyed! Drop a power-up
      const lastKill = killedEnemies.filter(k => k.formationId === formationId).pop();
      if (lastKill && Math.random() < SPAWN_CONFIG.powerUpDropChance) {
        const powerUp = getRandomPowerUp();
        pickups.push(createPickup(powerUp, lastKill.x, lastKill.y, 0));
      }
    }
  }
  
  // For non-formation kills, drop power-up every N kills
  const nonFormationKills = killedEnemies.filter(k => k.formationId === undefined);
  killsSinceLastDrop += nonFormationKills.length;
  
  if (killsSinceLastDrop >= SPAWN_CONFIG.killsForDrop) {
    const lastKill = nonFormationKills[nonFormationKills.length - 1] || killedEnemies[killedEnemies.length - 1];
    if (lastKill) {
      const powerUp = getRandomPowerUp();
      pickups.push(createPickup(powerUp, lastKill.x, lastKill.y, 0));
      killsSinceLastDrop = 0;
    }
  }

  return { ...data, player, enemies, bullets, particles, score, screenShake, fallingDebris, pickups, killsSinceLastDrop, collisionFlash, terrain };
}

// Helper function to get a random power-up type
function getRandomPowerUp(): 'shield' | 'homingMissile' | 'megaBomb' | 'escort' | 'tripleShot' | 'electricPulse' {
  const rand = Math.random();
  if (rand < 0.25) return 'shield';
  if (rand < 0.45) return 'homingMissile';
  if (rand < 0.55) return 'megaBomb';
  if (rand < 0.70) return 'escort';
  if (rand < 0.85) return 'tripleShot';
  return 'electricPulse';
}
