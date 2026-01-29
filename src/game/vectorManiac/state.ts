// Vector Maniac State Management

import { VectorState, PlayerStats, CompanionState } from './types';
import { VM_CONFIG } from './constants';
import { getComputedStats } from '@/hooks/useShipUpgrades';
import { resetGameStartVoice } from './sounds';
import { getActiveCompanion } from '@/hooks/useBestiaryRewards';

export function createDefaultStats(): PlayerStats {
  const upgrades = getComputedStats();
  
  return {
    fireRate: VM_CONFIG.baseFireRate * (1 / upgrades.fireRateMultiplier), // Lower = faster
    bulletSpeed: VM_CONFIG.baseBulletSpeed,
    damage: VM_CONFIG.baseDamage * upgrades.damageMultiplier,
    pierce: 1 + upgrades.bonusPierce,
    magnetRange: VM_CONFIG.baseMagnetRange * upgrades.magnetRangeMultiplier,
    salvageBonus: 1.0,
    shields: upgrades.bonusShields,
    speed: VM_CONFIG.playerSpeed * upgrades.speedMultiplier,
    extraCannons: upgrades.extraCannons,
  };
}

export function getInitialHealth(): number {
  const upgrades = getComputedStats();
  return Math.floor(VM_CONFIG.playerMaxHealth * upgrades.healthMultiplier);
}

export function getRandomWavesForMap(): number {
  return Math.floor(Math.random() * (VM_CONFIG.wavesPerMapMax - VM_CONFIG.wavesPerMapMin + 1)) + VM_CONFIG.wavesPerMapMin;
}

export function createVectorManiacState(): VectorState {
  // Reset the game start voice so it plays again for new games
  resetGameStartVoice();
  
  const centerX = VM_CONFIG.arenaWidth / 2;
  const centerY = VM_CONFIG.arenaHeight / 2;
  const initialWavesInMap = getRandomWavesForMap();
  
  const initialHealth = getInitialHealth();
  const stats = createDefaultStats();
  
  // Load active companion if any
  const activeCompanion = getActiveCompanion();
  const companionState: CompanionState | null = activeCompanion ? {
    seed: activeCompanion.seed,
    name: activeCompanion.name,
    shape: activeCompanion.shape,
    hue: activeCompanion.hue,
    saturation: activeCompanion.saturation,
    behavior: activeCompanion.behavior,
    ability: activeCompanion.ability,
    x: centerX + 50,
    y: centerY + 50,
    angle: -Math.PI / 2,
    fireTimer: 0,
  } : null;
  
  return {
    phase: 'entering',
    phaseTimer: 120,
    gameTime: 0,
    
    // Player starts at center
    playerX: centerX,
    playerY: centerY,
    playerAngle: -Math.PI / 2, // Facing up
    targetX: centerX,
    targetY: centerY,
    fireTimer: 0,
    health: initialHealth,
    maxHealth: initialHealth,
    shields: stats.shields,
    invulnerableTimer: 0,
    
    stats,
    
    enemies: [],
    projectiles: [],
    particles: [],
    salvage: [],
    powerups: [],
    
    activePowerUps: {
      doublePoints: 0,
      doubleShot: 0,
      speedBoost: 0,
      warpShield: 0,
      timeWarp: 0,
      magnetPulse: 0,
    },
    
    // New map-based progression
    currentLevel: 1,
    currentMap: 1,
    currentWave: 1,
    wavesInMap: initialWavesInMap,
    totalWavesCompleted: 0,
    totalMapsCompleted: 0,
    
    // Boss tracking
    bossActive: false,
    bossDefeated: false,
    bossWarning: false,
    bossWarningTimer: 0,
    bossEnraged: false,
    bossEnragedTimer: 0,
    screenShakeIntensity: 0,
    
    // Map transition display
    showMapName: true,
    mapNameTimer: 156, // ~2.6 seconds (same as wave complete)
    
    enemiesSpawned: 0,
    enemiesDefeated: 0,
    enemiesInWave: getEnemiesForWave(0, 1, 1), // totalWaves=0, level=1, map=1
    spawnTimer: 60,
    
    score: 0,
    salvageCount: 0,
    combo: 0,
    comboTimer: 0,
    
    difficultyMultiplier: 1.0,
    upgradesPending: 0,
    availableUpgrades: [],
    
    soundQueue: [],
    inputReleased: false,
    
    // Hyperspace mode
    hyperspaceActive: false,
    hyperspaceTimer: 0,
    hyperspaceDuration: 0,
    hyperspaceScrollOffset: 0,
    hyperspaceTransitionProgress: 0,
    nextHyperspaceMap: getNextHyperspaceMapTarget(1), // Random between 2-4
    hyperspaceFormationTimer: 0,
    hyperspacePlayerBaseY: VM_CONFIG.arenaHeight - 300,
    
    // Visual anomaly system - chance to generate unique visuals
    backgroundAnomalySeed: null,
    hyperspaceAnomalySeed: null,
    
    // Companion
    companion: companionState,
  };
}

export function getEnemiesForWave(totalWaves: number, level: number, currentMap: number = 1): number {
  // Base enemies + linear wave growth
  const base = VM_CONFIG.baseEnemiesPerWave + totalWaves * VM_CONFIG.enemiesPerWaveIncrease;
  
  // Compound map scaling: +4% per map completed (e.g., map 25 = +100% enemies)
  const mapMultiplier = 1 + (currentMap - 1) * VM_CONFIG.enemiesPerMapMultiplier;
  
  // Level multiplier (after completing 50 maps)
  const levelMultiplier = 1 + (level - 1) * 0.2;
  
  return Math.floor(base * mapMultiplier * levelMultiplier);
}

export function isLastWaveInMap(state: VectorState): boolean {
  return state.currentWave >= state.wavesInMap;
}

export function isFinalMap(mapId: number): boolean {
  return mapId >= VM_CONFIG.totalMaps;
}

// Get next map when hyperspace should trigger
// Pattern: maps 2-4, then 6-9, then 11-14, then 16-19, etc.
export function getNextHyperspaceMapTarget(currentMap: number): number {
  // We group maps into 5-map cycles: 1–5, 6–10, 11–15, ...
  // Hyperspace should happen within these ranges:
  // - cycleStart+1 .. cycleStart+3  (e.g. 2–4)
  // - nextCycleStart .. nextCycleStart+3 (e.g. 6–9)
  const cycleStart = Math.floor((currentMap - 1) / 5) * 5 + 1;

  // If we're still before the end of the current cycle (maps 1–4, 6–9, 11–14, ...),
  // pick a target inside the "2nd to 4th" maps of THIS cycle.
  if (currentMap < cycleStart + 4) {
    return cycleStart + 1 + Math.floor(Math.random() * 3); // +1..+3 => 2–4 in the cycle
  }

  // If we're at the end of the cycle (map 5, 10, 15, ...), pick inside the next cycle's
  // hyperspace window (e.g. 6–9).
  return cycleStart + 5 + Math.floor(Math.random() * 4); // +5..+8 => 6–9 in the next cycle
}

// Check if we should trigger hyperspace on current map
export function shouldTriggerHyperspace(state: VectorState): boolean {
  return state.currentMap === state.nextHyperspaceMap && !state.hyperspaceActive;
}
