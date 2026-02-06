// New Enemy Types for Vector Maniac (15 new enemies)

import { VectorEnemy } from './types';
import { VM_CONFIG } from './constants';
import { generateId, randomFromEdge, normalize } from './utils';

// ========== ENEMY CREATION FUNCTIONS ==========

// Bomber: slow but explodes on death (Map 6)
export function createBomber(targetX: number, targetY: number): VectorEnemy {
  const spawn = randomFromEdge(VM_CONFIG.arenaWidth, VM_CONFIG.arenaHeight, 20);
  const dir = normalize(targetX - spawn.x, targetY - spawn.y);
  
  return {
    id: generateId(),
    x: spawn.x,
    y: spawn.y,
    vx: dir.x * VM_CONFIG.bomberSpeed,
    vy: dir.y * VM_CONFIG.bomberSpeed,
    size: VM_CONFIG.bomberSize,
    health: VM_CONFIG.bomberHealth,
    maxHealth: VM_CONFIG.bomberHealth,
    type: 'bomber',
    fireTimer: 0,
    behaviorTimer: 0,
    targetAngle: spawn.angle,
  };
}

// Shielder: has a frontal shield (Map 8)
export function createShielder(targetX: number, targetY: number): VectorEnemy {
  const spawn = randomFromEdge(VM_CONFIG.arenaWidth, VM_CONFIG.arenaHeight, 20);
  const dir = normalize(targetX - spawn.x, targetY - spawn.y);
  
  return {
    id: generateId(),
    x: spawn.x,
    y: spawn.y,
    vx: dir.x * VM_CONFIG.shielderSpeed,
    vy: dir.y * VM_CONFIG.shielderSpeed,
    size: VM_CONFIG.shielderSize,
    health: VM_CONFIG.shielderHealth,
    maxHealth: VM_CONFIG.shielderHealth,
    type: 'shielder',
    fireTimer: 0,
    behaviorTimer: 0, // Stores shield angle
    targetAngle: Math.atan2(dir.y, dir.x),
  };
}

// Teleporter: blinks around unpredictably (Map 12)
export function createTeleporter(targetX: number, targetY: number): VectorEnemy {
  const spawn = randomFromEdge(VM_CONFIG.arenaWidth, VM_CONFIG.arenaHeight, 20);
  const dir = normalize(targetX - spawn.x, targetY - spawn.y);
  
  return {
    id: generateId(),
    x: spawn.x,
    y: spawn.y,
    vx: dir.x * VM_CONFIG.teleporterSpeed,
    vy: dir.y * VM_CONFIG.teleporterSpeed,
    size: VM_CONFIG.teleporterSize,
    health: VM_CONFIG.teleporterHealth,
    maxHealth: VM_CONFIG.teleporterHealth,
    type: 'teleporter',
    fireTimer: VM_CONFIG.teleporterFireRate,
    behaviorTimer: VM_CONFIG.teleporterBlinkInterval,
    targetAngle: spawn.angle,
  };
}

// Leech: attaches to player and drains health (Map 14)
export function createLeech(targetX: number, targetY: number): VectorEnemy {
  const spawn = randomFromEdge(VM_CONFIG.arenaWidth, VM_CONFIG.arenaHeight, 20);
  const dir = normalize(targetX - spawn.x, targetY - spawn.y);
  
  return {
    id: generateId(),
    x: spawn.x,
    y: spawn.y,
    vx: dir.x * VM_CONFIG.leechSpeed,
    vy: dir.y * VM_CONFIG.leechSpeed,
    size: VM_CONFIG.leechSize,
    health: VM_CONFIG.leechHealth,
    maxHealth: VM_CONFIG.leechHealth,
    type: 'leech',
    fireTimer: 0, // 0 = not attached, 1 = attached
    behaviorTimer: 0,
    targetAngle: spawn.angle,
  };
}

// Mirror: copies player movement with delay (Map 16)
export function createMirror(targetX: number, targetY: number): VectorEnemy {
  const spawn = randomFromEdge(VM_CONFIG.arenaWidth, VM_CONFIG.arenaHeight, 20);
  const dir = normalize(targetX - spawn.x, targetY - spawn.y);
  
  return {
    id: generateId(),
    x: spawn.x,
    y: spawn.y,
    vx: dir.x * VM_CONFIG.mirrorSpeed,
    vy: dir.y * VM_CONFIG.mirrorSpeed,
    size: VM_CONFIG.mirrorSize,
    health: VM_CONFIG.mirrorHealth,
    maxHealth: VM_CONFIG.mirrorHealth,
    type: 'mirror',
    fireTimer: VM_CONFIG.mirrorFireRate,
    behaviorTimer: 0,
    targetAngle: spawn.angle,
  };
}

// Pulsar: emits damaging shockwaves (Map 18)
export function createPulsar(targetX: number, targetY: number): VectorEnemy {
  const spawn = randomFromEdge(VM_CONFIG.arenaWidth, VM_CONFIG.arenaHeight, 20);
  const dir = normalize(targetX - spawn.x, targetY - spawn.y);
  
  return {
    id: generateId(),
    x: spawn.x,
    y: spawn.y,
    vx: dir.x * VM_CONFIG.pulsarSpeed,
    vy: dir.y * VM_CONFIG.pulsarSpeed,
    size: VM_CONFIG.pulsarSize,
    health: VM_CONFIG.pulsarHealth,
    maxHealth: VM_CONFIG.pulsarHealth,
    type: 'pulsar',
    fireTimer: VM_CONFIG.pulsarPulseInterval,
    behaviorTimer: 0, // Current pulse expansion
    targetAngle: spawn.angle,
  };
}

// Swarm: tiny enemies in groups (Map 22)
export function createSwarm(targetX: number, targetY: number): VectorEnemy {
  const spawn = randomFromEdge(VM_CONFIG.arenaWidth, VM_CONFIG.arenaHeight, 20);
  const dir = normalize(targetX - spawn.x, targetY - spawn.y);
  
  // Add slight random offset for swarm spread
  const offsetAngle = (Math.random() - 0.5) * 0.5;
  const cos = Math.cos(offsetAngle);
  const sin = Math.sin(offsetAngle);
  const newDirX = dir.x * cos - dir.y * sin;
  const newDirY = dir.x * sin + dir.y * cos;
  
  return {
    id: generateId(),
    x: spawn.x + (Math.random() - 0.5) * 30,
    y: spawn.y + (Math.random() - 0.5) * 30,
    vx: newDirX * VM_CONFIG.swarmSpeed,
    vy: newDirY * VM_CONFIG.swarmSpeed,
    size: VM_CONFIG.swarmSize,
    health: VM_CONFIG.swarmHealth,
    maxHealth: VM_CONFIG.swarmHealth,
    type: 'swarm',
    fireTimer: 0,
    behaviorTimer: Math.random() * Math.PI * 2, // Random phase for wobble
    targetAngle: spawn.angle,
  };
}

// Charger: charges up then rushes (Map 24)
export function createCharger(targetX: number, targetY: number): VectorEnemy {
  const spawn = randomFromEdge(VM_CONFIG.arenaWidth, VM_CONFIG.arenaHeight, 20);
  const dir = normalize(targetX - spawn.x, targetY - spawn.y);
  
  return {
    id: generateId(),
    x: spawn.x,
    y: spawn.y,
    vx: dir.x * VM_CONFIG.chargerSpeed,
    vy: dir.y * VM_CONFIG.chargerSpeed,
    size: VM_CONFIG.chargerSize,
    health: VM_CONFIG.chargerHealth,
    maxHealth: VM_CONFIG.chargerHealth,
    type: 'charger',
    fireTimer: 0, // 0 = idle, 1 = charging, 2 = rushing
    behaviorTimer: VM_CONFIG.chargerChargeTime,
    targetAngle: Math.atan2(dir.y, dir.x),
  };
}

// Phaser: phases through bullets (Map 26)
export function createPhaser(targetX: number, targetY: number): VectorEnemy {
  const spawn = randomFromEdge(VM_CONFIG.arenaWidth, VM_CONFIG.arenaHeight, 20);
  const dir = normalize(targetX - spawn.x, targetY - spawn.y);
  
  return {
    id: generateId(),
    x: spawn.x,
    y: spawn.y,
    vx: dir.x * VM_CONFIG.phaserSpeed,
    vy: dir.y * VM_CONFIG.phaserSpeed,
    size: VM_CONFIG.phaserSize,
    health: VM_CONFIG.phaserHealth,
    maxHealth: VM_CONFIG.phaserHealth,
    type: 'phaser',
    fireTimer: VM_CONFIG.phaserFireRate,
    behaviorTimer: VM_CONFIG.phaserPhaseInterval, // Countdown to phase
    targetAngle: spawn.angle,
  };
}

// Vortex: pulls player and projectiles (Map 28)
export function createVortex(targetX: number, targetY: number): VectorEnemy {
  const spawn = randomFromEdge(VM_CONFIG.arenaWidth, VM_CONFIG.arenaHeight, 20);
  const dir = normalize(targetX - spawn.x, targetY - spawn.y);
  
  return {
    id: generateId(),
    x: spawn.x,
    y: spawn.y,
    vx: dir.x * VM_CONFIG.vortexSpeed,
    vy: dir.y * VM_CONFIG.vortexSpeed,
    size: VM_CONFIG.vortexSize,
    health: VM_CONFIG.vortexHealth,
    maxHealth: VM_CONFIG.vortexHealth,
    type: 'vortex',
    fireTimer: 0,
    behaviorTimer: 0, // Rotation angle
    targetAngle: spawn.angle,
  };
}

// Replicator: spawns copy at 50% health (Map 32)
export function createReplicator(targetX: number, targetY: number, isClone: boolean = false): VectorEnemy {
  const spawn = isClone 
    ? { x: targetX, y: targetY, angle: Math.random() * Math.PI * 2 }
    : randomFromEdge(VM_CONFIG.arenaWidth, VM_CONFIG.arenaHeight, 20);
  
  const centerX = VM_CONFIG.arenaWidth / 2;
  const centerY = VM_CONFIG.arenaHeight / 2;
  const dir = normalize(centerX - spawn.x, centerY - spawn.y);
  
  return {
    id: generateId(),
    x: spawn.x,
    y: spawn.y,
    vx: dir.x * VM_CONFIG.replicatorSpeed,
    vy: dir.y * VM_CONFIG.replicatorSpeed,
    size: VM_CONFIG.replicatorSize * (isClone ? 0.8 : 1),
    health: VM_CONFIG.replicatorHealth * (isClone ? 0.5 : 1),
    maxHealth: VM_CONFIG.replicatorHealth * (isClone ? 0.5 : 1),
    type: 'replicator',
    fireTimer: VM_CONFIG.replicatorFireRate,
    behaviorTimer: isClone ? 1 : 0, // 1 = is a clone (can't replicate again)
    targetAngle: spawn.angle,
  };
}

// Stealth: invisible until close (Map 36)
export function createStealth(targetX: number, targetY: number): VectorEnemy {
  const spawn = randomFromEdge(VM_CONFIG.arenaWidth, VM_CONFIG.arenaHeight, 20);
  const dir = normalize(targetX - spawn.x, targetY - spawn.y);
  
  return {
    id: generateId(),
    x: spawn.x,
    y: spawn.y,
    vx: dir.x * VM_CONFIG.stealthSpeed,
    vy: dir.y * VM_CONFIG.stealthSpeed,
    size: VM_CONFIG.stealthSize,
    health: VM_CONFIG.stealthHealth,
    maxHealth: VM_CONFIG.stealthHealth,
    type: 'stealth',
    fireTimer: 0,
    behaviorTimer: 0, // 0 = invisible, 1 = visible
    targetAngle: spawn.angle,
  };
}

// Titan: huge slow enemy (Map 40)
export function createTitan(targetX: number, targetY: number): VectorEnemy {
  const spawn = randomFromEdge(VM_CONFIG.arenaWidth, VM_CONFIG.arenaHeight, 20);
  const dir = normalize(targetX - spawn.x, targetY - spawn.y);
  
  return {
    id: generateId(),
    x: spawn.x,
    y: spawn.y,
    vx: dir.x * VM_CONFIG.titanSpeed,
    vy: dir.y * VM_CONFIG.titanSpeed,
    size: VM_CONFIG.titanSize,
    health: VM_CONFIG.titanHealth,
    maxHealth: VM_CONFIG.titanHealth,
    type: 'titan',
    fireTimer: VM_CONFIG.titanFireRate,
    behaviorTimer: 0,
    targetAngle: spawn.angle,
  };
}

// Parasite: releases mini-parasites on death (Map 44)
export function createParasite(targetX: number, targetY: number, isMini: boolean = false): VectorEnemy {
  const spawn = isMini
    ? { x: targetX, y: targetY, angle: Math.random() * Math.PI * 2 }
    : randomFromEdge(VM_CONFIG.arenaWidth, VM_CONFIG.arenaHeight, 20);
  
  const centerX = VM_CONFIG.arenaWidth / 2;
  const centerY = VM_CONFIG.arenaHeight / 2;
  const dir = normalize(centerX - spawn.x, centerY - spawn.y);
  
  const speed = isMini ? VM_CONFIG.parasiteMiniSpeed : VM_CONFIG.parasiteSpeed;
  const health = isMini ? VM_CONFIG.parasiteMiniHealth : VM_CONFIG.parasiteHealth;
  const size = isMini ? VM_CONFIG.parasiteMiniSize : VM_CONFIG.parasiteSize;
  
  return {
    id: generateId(),
    x: spawn.x,
    y: spawn.y,
    vx: dir.x * speed,
    vy: dir.y * speed,
    size,
    health,
    maxHealth: health,
    type: 'parasite',
    fireTimer: isMini ? 1 : 0, // 1 = is mini (can't spawn more)
    behaviorTimer: 0,
    targetAngle: spawn.angle,
  };
}

// Nova: explodes into bullet ring on death (Map 48)
export function createNova(targetX: number, targetY: number): VectorEnemy {
  const spawn = randomFromEdge(VM_CONFIG.arenaWidth, VM_CONFIG.arenaHeight, 20);
  const dir = normalize(targetX - spawn.x, targetY - spawn.y);
  
  return {
    id: generateId(),
    x: spawn.x,
    y: spawn.y,
    vx: dir.x * VM_CONFIG.novaSpeed,
    vy: dir.y * VM_CONFIG.novaSpeed,
    size: VM_CONFIG.novaSize,
    health: VM_CONFIG.novaHealth,
    maxHealth: VM_CONFIG.novaHealth,
    type: 'nova',
    fireTimer: 0,
    behaviorTimer: 0, // Glow intensity
    targetAngle: spawn.angle,
  };
}

// Helper to get unlock map for each enemy type
export function getEnemyUnlockMap(type: VectorEnemy['type']): number {
  switch (type) {
    case 'bomber': return VM_CONFIG.bomberUnlockMap;
    case 'shielder': return VM_CONFIG.shielderUnlockMap;
    case 'teleporter': return VM_CONFIG.teleporterUnlockMap;
    case 'leech': return VM_CONFIG.leechUnlockMap;
    case 'mirror': return VM_CONFIG.mirrorUnlockMap;
    case 'pulsar': return VM_CONFIG.pulsarUnlockMap;
    case 'swarm': return VM_CONFIG.swarmUnlockMap;
    case 'charger': return VM_CONFIG.chargerUnlockMap;
    case 'phaser': return VM_CONFIG.phaserUnlockMap;
    case 'vortex': return VM_CONFIG.vortexUnlockMap;
    case 'replicator': return VM_CONFIG.replicatorUnlockMap;
    case 'stealth': return VM_CONFIG.stealthUnlockMap;
    case 'titan': return VM_CONFIG.titanUnlockMap;
    case 'parasite': return VM_CONFIG.parasiteUnlockMap;
    case 'nova': return VM_CONFIG.novaUnlockMap;
    case 'dasher': return VM_CONFIG.dasherUnlockMap;
    case 'splitter': return VM_CONFIG.splitterUnlockMap;
    case 'orbiter': return VM_CONFIG.orbiterUnlockMap;
    case 'sniper': return VM_CONFIG.sniperUnlockMap;
    default: return 1; // Basic enemies available from start
  }
}

// Get list of unlocked enemy types for a given map
export function getUnlockedEnemyTypes(currentMap: number): VectorEnemy['type'][] {
  const types: VectorEnemy['type'][] = ['drone', 'shooter'];
  
  if (currentMap >= 3) types.push('elite');
  if (currentMap >= VM_CONFIG.dasherUnlockMap) types.push('dasher');
  if (currentMap >= VM_CONFIG.bomberUnlockMap) types.push('bomber');
  if (currentMap >= VM_CONFIG.shielderUnlockMap) types.push('shielder');
  if (currentMap >= VM_CONFIG.splitterUnlockMap) types.push('splitter');
  if (currentMap >= VM_CONFIG.teleporterUnlockMap) types.push('teleporter');
  if (currentMap >= VM_CONFIG.leechUnlockMap) types.push('leech');
  if (currentMap >= VM_CONFIG.orbiterUnlockMap) types.push('orbiter');
  if (currentMap >= VM_CONFIG.mirrorUnlockMap) types.push('mirror');
  if (currentMap >= VM_CONFIG.pulsarUnlockMap) types.push('pulsar');
  if (currentMap >= VM_CONFIG.sniperUnlockMap) types.push('sniper');
  if (currentMap >= VM_CONFIG.swarmUnlockMap) types.push('swarm');
  if (currentMap >= VM_CONFIG.chargerUnlockMap) types.push('charger');
  if (currentMap >= VM_CONFIG.phaserUnlockMap) types.push('phaser');
  if (currentMap >= VM_CONFIG.vortexUnlockMap) types.push('vortex');
  if (currentMap >= VM_CONFIG.replicatorUnlockMap) types.push('replicator');
  if (currentMap >= VM_CONFIG.stealthUnlockMap) types.push('stealth');
  if (currentMap >= VM_CONFIG.titanUnlockMap) types.push('titan');
  if (currentMap >= VM_CONFIG.parasiteUnlockMap) types.push('parasite');
  if (currentMap >= VM_CONFIG.novaUnlockMap) types.push('nova');
  
  return types;
}
