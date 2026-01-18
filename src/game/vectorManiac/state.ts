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

export function getRandomWavesForSegment(): number {
  return Math.floor(Math.random() * 3) + 1; // 1-3 waves
}

export function createVectorManiacState(): VectorState {
  const centerX = VM_CONFIG.arenaWidth / 2;
  const centerY = VM_CONFIG.arenaHeight / 2;
  const initialWavesInSegment = getRandomWavesForSegment();
  
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
    
    currentWave: 1,
    currentSegment: 1,
    wavesInSegment: initialWavesInSegment,
    totalWavesCompleted: 0,
    enemiesSpawned: 0,
    enemiesDefeated: 0,
    enemiesInWave: getEnemiesForWave(1),
    spawnTimer: 60,
    
    score: 0,
    salvageCount: 0,
    combo: 0,
    comboTimer: 0,
    
    portalChoice: null,
    difficultyMultiplier: 1.0,
    upgradesPending: 0,
    availableUpgrades: [],
    
    soundQueue: [],
    inputReleased: false,
  };
}

export function getEnemiesForWave(totalWaves: number): number {
  // Scale enemies based on total waves completed
  return VM_CONFIG.baseEnemiesPerWave + totalWaves * VM_CONFIG.enemiesPerWaveIncrease;
}

export function isLastWaveInSegment(state: VectorState): boolean {
  return state.currentWave >= state.wavesInSegment;
}

export function isFinalSegment(segment: number): boolean {
  return segment >= VM_CONFIG.totalSegments;
}
