// Vector Maniac Entity Creation

import { VectorEnemy, VectorProjectile, VectorParticle, VectorSalvage, VectorPowerUp, PowerUpType } from './types';
import { VM_CONFIG } from './constants';
import { generateId, randomFromEdge, normalize } from './utils';

export function createDrone(targetX: number, targetY: number): VectorEnemy {
  const spawn = randomFromEdge(VM_CONFIG.arenaWidth, VM_CONFIG.arenaHeight, 20);
  
  // Calculate direction towards center/player
  const dir = normalize(targetX - spawn.x, targetY - spawn.y);
  
  return {
    id: generateId(),
    x: spawn.x,
    y: spawn.y,
    vx: dir.x * VM_CONFIG.droneSpeed,
    vy: dir.y * VM_CONFIG.droneSpeed,
    size: VM_CONFIG.droneSize,
    health: VM_CONFIG.droneHealth,
    maxHealth: VM_CONFIG.droneHealth,
    type: 'drone',
    fireTimer: 0,
    behaviorTimer: 0,
    targetAngle: spawn.angle,
  };
}

export function createShooter(targetX: number, targetY: number): VectorEnemy {
  const spawn = randomFromEdge(VM_CONFIG.arenaWidth, VM_CONFIG.arenaHeight, 20);
  
  const dir = normalize(targetX - spawn.x, targetY - spawn.y);
  
  return {
    id: generateId(),
    x: spawn.x,
    y: spawn.y,
    vx: dir.x * VM_CONFIG.shooterSpeed,
    vy: dir.y * VM_CONFIG.shooterSpeed,
    size: VM_CONFIG.shooterSize,
    health: VM_CONFIG.shooterHealth,
    maxHealth: VM_CONFIG.shooterHealth,
    type: 'shooter',
    fireTimer: VM_CONFIG.shooterFireRate / 2, // Start halfway ready
    behaviorTimer: 0,
    targetAngle: spawn.angle,
  };
}

export function createElite(targetX: number, targetY: number): VectorEnemy {
  const spawn = randomFromEdge(VM_CONFIG.arenaWidth, VM_CONFIG.arenaHeight, 20);
  
  const dir = normalize(targetX - spawn.x, targetY - spawn.y);
  
  return {
    id: generateId(),
    x: spawn.x,
    y: spawn.y,
    vx: dir.x * VM_CONFIG.eliteSpeed,
    vy: dir.y * VM_CONFIG.eliteSpeed,
    size: VM_CONFIG.eliteSize,
    health: VM_CONFIG.eliteHealth,
    maxHealth: VM_CONFIG.eliteHealth,
    type: 'elite',
    fireTimer: 60,
    behaviorTimer: 0,
    targetAngle: spawn.angle,
  };
}

export function createBounty(): VectorEnemy {
  const spawn = randomFromEdge(VM_CONFIG.arenaWidth, VM_CONFIG.arenaHeight, 20);
  const centerX = VM_CONFIG.arenaWidth / 2;
  const centerY = VM_CONFIG.arenaHeight / 2;
  
  const dir = normalize(centerX - spawn.x, centerY - spawn.y);
  
  return {
    id: generateId(),
    x: spawn.x,
    y: spawn.y,
    vx: dir.x * VM_CONFIG.bountySpeed,
    vy: dir.y * VM_CONFIG.bountySpeed,
    size: VM_CONFIG.bountySize,
    health: VM_CONFIG.bountyHealth,
    maxHealth: VM_CONFIG.bountyHealth,
    type: 'bounty',
    fireTimer: 30,
    behaviorTimer: 0,
    targetAngle: spawn.angle,
  };
}

export function createPlayerProjectile(
  x: number, 
  y: number, 
  angle: number,
  speed: number,
  damage: number,
  pierce: number
): VectorProjectile {
  return {
    id: generateId(),
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    damage,
    isPlayer: true,
    size: 4,
    pierce,
  };
}

export function createEnemyProjectile(
  x: number, 
  y: number, 
  targetX: number,
  targetY: number
): VectorProjectile {
  const dir = normalize(targetX - x, targetY - y);
  
  return {
    id: generateId(),
    x,
    y,
    vx: dir.x * VM_CONFIG.shooterBulletSpeed,
    vy: dir.y * VM_CONFIG.shooterBulletSpeed,
    damage: 15,
    isPlayer: false,
    size: 5,
    pierce: 1,
  };
}

export function createParticle(
  x: number, 
  y: number, 
  color: string,
  count: number = 1
): VectorParticle[] {
  const particles: VectorParticle[] = [];
  
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3;
    
    particles.push({
      id: generateId(),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 3,
      color,
      life: 20 + Math.random() * 20,
      maxLife: 40,
    });
  }
  
  return particles;
}

export function createSalvage(x: number, y: number, value: number): VectorSalvage {
  const angle = Math.random() * Math.PI * 2;
  const speed = VM_CONFIG.salvageDriftSpeed;
  
  return {
    id: generateId(),
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    value,
    magnetized: false,
  };
}

export function createPowerUp(x: number, y: number, type?: PowerUpType): VectorPowerUp {
  const types: PowerUpType[] = ['shield', 'nuke', 'doublePoints', 'doubleShot', 'speedBoost'];
  const powerUpType = type || types[Math.floor(Math.random() * types.length)];
  
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.5;
  
  return {
    id: generateId(),
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    type: powerUpType,
    life: VM_CONFIG.powerUpLifetime,
  };
}
