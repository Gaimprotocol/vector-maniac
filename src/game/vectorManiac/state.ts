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

export function createVectorState(): VectorState {
  const centerX = VM_CONFIG.arenaWidth / 2;
  const centerY = VM_CONFIG.arenaHeight / 2;
  
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
    
    currentWave: 1,
    currentSegment: 1,
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

export function getEnemiesForWave(wave: number): number {
  return VM_CONFIG.baseEnemiesPerWave + (wave - 1) * VM_CONFIG.enemiesPerWaveIncrease;
}

export function getWaveInSegment(wave: number): number {
  return ((wave - 1) % VM_CONFIG.wavesPerSegment) + 1;
}

export function isLastWaveInSegment(wave: number): boolean {
  return wave % VM_CONFIG.wavesPerSegment === 0;
}

export function isFinalWave(wave: number): boolean {
  return wave === VM_CONFIG.wavesPerSegment * VM_CONFIG.totalSegments;
}
