// Vector Maniac State Management

import { VectorState, PlayerStats } from './types';
import { VM_CONFIG } from './constants';
import { getComputedStats } from '@/hooks/useShipUpgrades';
import { resetGameStartVoice } from './sounds';

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
