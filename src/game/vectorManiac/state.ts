// Vector Maniac State Management

import { VectorState, PlayerStats } from './types';
import { VM_CONFIG } from './constants';

export function createDefaultStats(): PlayerStats {
  return {
    fireRate: VM_CONFIG.baseFireRate,
    bulletSpeed: VM_CONFIG.baseBulletSpeed,
    damage: VM_CONFIG.baseDamage,
    pierce: 1,
    magnetRange: VM_CONFIG.baseMagnetRange,
    salvageBonus: 1.0,
    shields: 0,
    speed: VM_CONFIG.playerSpeed,
  };
}

export function getRandomWavesForMap(): number {
  return Math.floor(Math.random() * (VM_CONFIG.wavesPerMapMax - VM_CONFIG.wavesPerMapMin + 1)) + VM_CONFIG.wavesPerMapMin;
}

export function createVectorManiacState(): VectorState {
  const centerX = VM_CONFIG.arenaWidth / 2;
  const centerY = VM_CONFIG.arenaHeight / 2;
  const initialWavesInMap = getRandomWavesForMap();
  
  return {
    phase: 'entering',
    phaseTimer: 60,
    gameTime: 0,
    
    // Player starts at center
    playerX: centerX,
    playerY: centerY,
    playerAngle: -Math.PI / 2, // Facing up
    targetX: centerX,
    targetY: centerY,
    fireTimer: 0,
    health: VM_CONFIG.playerMaxHealth,
    maxHealth: VM_CONFIG.playerMaxHealth,
    shields: 0,
    invulnerableTimer: 0,
    
    stats: createDefaultStats(),
    
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
    
    enemiesSpawned: 0,
    enemiesDefeated: 0,
    enemiesInWave: getEnemiesForWave(1, 1),
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

export function getEnemiesForWave(totalWaves: number, level: number): number {
  // Scale enemies based on total waves completed and level
  const base = VM_CONFIG.baseEnemiesPerWave + totalWaves * VM_CONFIG.enemiesPerWaveIncrease;
  return Math.floor(base * (1 + (level - 1) * 0.1));
}

export function isLastWaveInMap(state: VectorState): boolean {
  return state.currentWave >= state.wavesInMap;
}

export function isFinalMap(mapId: number): boolean {
  return mapId >= VM_CONFIG.totalMaps;
}
