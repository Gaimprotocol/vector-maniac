// Vector Maniac Entity Creation

import { VectorEnemy, VectorProjectile, VectorParticle, VectorSalvage, VectorPowerUp, PowerUpType, BossProjectileType } from './types';
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

// Create a mini-boss - smaller than full boss, but tougher than elites
export function createMiniBoss(targetX: number, targetY: number, mapId: number): VectorEnemy {
  const spawn = randomFromEdge(VM_CONFIG.arenaWidth, VM_CONFIG.arenaHeight, 20);
  
  const dir = normalize(targetX - spawn.x, targetY - spawn.y);
  
  // Mini-boss uses same color theming as bosses
  const colorIndex = mapId % 10;
  
  return {
    id: generateId(),
    x: spawn.x,
    y: spawn.y,
    vx: dir.x * VM_CONFIG.minibossSpeed,
    vy: dir.y * VM_CONFIG.minibossSpeed,
    size: VM_CONFIG.minibossSize,
    health: VM_CONFIG.minibossHealth,
    maxHealth: VM_CONFIG.minibossHealth,
    type: 'miniboss',
    fireTimer: VM_CONFIG.minibossFireRate,
    behaviorTimer: colorIndex, // Store color index for rendering
    targetAngle: spawn.angle,
  };
}

// Create a Dasher - fast enemy that rushes toward player (unlocks map 5)
export function createDasher(targetX: number, targetY: number): VectorEnemy {
  const spawn = randomFromEdge(VM_CONFIG.arenaWidth, VM_CONFIG.arenaHeight, 20);
  
  const dir = normalize(targetX - spawn.x, targetY - spawn.y);
  
  return {
    id: generateId(),
    x: spawn.x,
    y: spawn.y,
    vx: dir.x * VM_CONFIG.dasherSpeed,
    vy: dir.y * VM_CONFIG.dasherSpeed,
    size: VM_CONFIG.dasherSize,
    health: VM_CONFIG.dasherHealth,
    maxHealth: VM_CONFIG.dasherHealth,
    type: 'dasher',
    fireTimer: 0,
    behaviorTimer: 0,
    targetAngle: spawn.angle,
  };
}

// Create a Splitter - splits into 2 smaller enemies on death (unlocks map 10)
export function createSplitter(targetX: number, targetY: number, isSplit: boolean = false): VectorEnemy {
  const spawn = isSplit 
    ? { x: targetX, y: targetY, angle: Math.random() * Math.PI * 2 }
    : randomFromEdge(VM_CONFIG.arenaWidth, VM_CONFIG.arenaHeight, 20);
  
  const centerX = VM_CONFIG.arenaWidth / 2;
  const centerY = VM_CONFIG.arenaHeight / 2;
  const dir = normalize(centerX - spawn.x, centerY - spawn.y);
  
  // Split versions are smaller and weaker
  const sizeMult = isSplit ? 0.6 : 1;
  const healthMult = isSplit ? 0.4 : 1;
  
  return {
    id: generateId(),
    x: spawn.x,
    y: spawn.y,
    vx: dir.x * VM_CONFIG.splitterSpeed * (isSplit ? 1.5 : 1),
    vy: dir.y * VM_CONFIG.splitterSpeed * (isSplit ? 1.5 : 1),
    size: VM_CONFIG.splitterSize * sizeMult,
    health: VM_CONFIG.splitterHealth * healthMult,
    maxHealth: VM_CONFIG.splitterHealth * healthMult,
    type: 'splitter',
    fireTimer: isSplit ? 1 : 0, // Use fireTimer to track if this is a split version (1 = split)
    behaviorTimer: 0,
    targetAngle: spawn.angle,
  };
}

// Create an Orbiter - circles around player at fixed distance (unlocks map 15)
export function createOrbiter(targetX: number, targetY: number): VectorEnemy {
  const spawn = randomFromEdge(VM_CONFIG.arenaWidth, VM_CONFIG.arenaHeight, 20);
  
  const dir = normalize(targetX - spawn.x, targetY - spawn.y);
  
  return {
    id: generateId(),
    x: spawn.x,
    y: spawn.y,
    vx: dir.x * VM_CONFIG.orbiterSpeed,
    vy: dir.y * VM_CONFIG.orbiterSpeed,
    size: VM_CONFIG.orbiterSize,
    health: VM_CONFIG.orbiterHealth,
    maxHealth: VM_CONFIG.orbiterHealth,
    type: 'orbiter',
    fireTimer: VM_CONFIG.orbiterFireRate,
    behaviorTimer: Math.random() * Math.PI * 2, // Random starting orbit angle
    targetAngle: spawn.angle,
  };
}

// Create a Sniper - stops and aims carefully before shooting (unlocks map 20)
export function createSniper(targetX: number, targetY: number): VectorEnemy {
  const spawn = randomFromEdge(VM_CONFIG.arenaWidth, VM_CONFIG.arenaHeight, 20);
  
  const dir = normalize(targetX - spawn.x, targetY - spawn.y);
  
  return {
    id: generateId(),
    x: spawn.x,
    y: spawn.y,
    vx: dir.x * VM_CONFIG.sniperSpeed,
    vy: dir.y * VM_CONFIG.sniperSpeed,
    size: VM_CONFIG.sniperSize,
    health: VM_CONFIG.sniperHealth,
    maxHealth: VM_CONFIG.sniperHealth,
    type: 'sniper',
    fireTimer: VM_CONFIG.sniperFireRate,
    behaviorTimer: 0, // Counts up to aim time
    targetAngle: spawn.angle,
  };
}

// Create a boss for each map - unique behavior based on map number
export function createBoss(mapId: number, level: number): VectorEnemy {
  const spawn = randomFromEdge(VM_CONFIG.arenaWidth, VM_CONFIG.arenaHeight, 20);
  const centerX = VM_CONFIG.arenaWidth / 2;
  const centerY = VM_CONFIG.arenaHeight / 2;
  
  const dir = normalize(centerX - spawn.x, centerY - spawn.y);
  
  // Boss health scales with map and level
  const baseHealth = VM_CONFIG.bossHealth * (1 + mapId * 0.05);
  const levelScaling = 1 + (level - 1) * 0.25;
  const finalHealth = baseHealth * levelScaling;
  
  // Boss size varies slightly per map
  const sizeVariation = VM_CONFIG.bossSize + (mapId % 10) * 2;
  
  return {
    id: generateId(),
    x: spawn.x,
    y: spawn.y,
    vx: dir.x * VM_CONFIG.bountySpeed * 0.8,
    vy: dir.y * VM_CONFIG.bountySpeed * 0.8,
    size: sizeVariation,
    health: finalHealth,
    maxHealth: finalHealth,
    type: 'boss',
    fireTimer: VM_CONFIG.bossFireRate,
    behaviorTimer: mapId * 10000, // Encode mapId in upper bits, lower bits for time counter
    targetAngle: spawn.angle,
  };
}

export function createPlayerProjectile(
  x: number, 
  y: number, 
  angle: number,
  speed: number,
  damage: number,
  pierce: number,
  shipId?: string
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
    shipId,
  };
}

export function createEnemyProjectile(
  x: number, 
  y: number, 
  targetX: number,
  targetY: number,
  bossType?: BossProjectileType,
  bossColor?: string,
  speedMultiplier: number = 1
): VectorProjectile {
  const dir = normalize(targetX - x, targetY - y);
  
  // Different sizes based on projectile type
  let size = 5;
  if (bossType === 'laser') size = 3;
  else if (bossType === 'plasma') size = 8;
  else if (bossType === 'fire') size = 7;
  else if (bossType === 'ice') size = 6;
  else if (bossType === 'pulse') size = 10;
  
  return {
    id: generateId(),
    x,
    y,
    vx: dir.x * VM_CONFIG.shooterBulletSpeed * speedMultiplier,
    vy: dir.y * VM_CONFIG.shooterBulletSpeed * speedMultiplier,
    damage: 15,
    isPlayer: false,
    size,
    pierce: 1,
    bossType,
    bossColor,
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

// Create a dramatic multi-layered explosion effect for player death
export function createPlayerDeathExplosion(x: number, y: number): VectorParticle[] {
  const particles: VectorParticle[] = [];
  
  // Layer 1: Core white flash (fast, large)
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const speed = 6 + Math.random() * 4;
    particles.push({
      id: generateId(),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 8 + Math.random() * 6,
      color: '#ffffff',
      life: 15 + Math.random() * 10,
      maxLife: 25,
    });
  }
  
  // Layer 2: Cyan energy burst
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 5;
    particles.push({
      id: generateId(),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 5 + Math.random() * 4,
      color: '#00ffff',
      life: 25 + Math.random() * 15,
      maxLife: 40,
    });
  }
  
  // Layer 3: Orange/yellow fire
  for (let i = 0; i < 25; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    const fireColors = ['#ff8800', '#ffaa00', '#ffcc00', '#ff6600'];
    particles.push({
      id: generateId(),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 4 + Math.random() * 5,
      color: fireColors[Math.floor(Math.random() * fireColors.length)],
      life: 30 + Math.random() * 20,
      maxLife: 50,
    });
  }
  
  // Layer 4: Red debris
  for (let i = 0; i < 15; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 3;
    particles.push({
      id: generateId(),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 3 + Math.random() * 3,
      color: '#ff4444',
      life: 40 + Math.random() * 25,
      maxLife: 65,
    });
  }
  
  // Layer 5: Slow-moving smoke/debris (long-lasting)
  for (let i = 0; i < 10; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 1.5;
    particles.push({
      id: generateId(),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 6 + Math.random() * 4,
      color: '#888888',
      life: 50 + Math.random() * 30,
      maxLife: 80,
    });
  }
  
  return particles;
}

export function createSalvage(x: number, y: number, value: number, forceRare?: boolean): VectorSalvage {
  const angle = Math.random() * Math.PI * 2;
  const speed = VM_CONFIG.salvageDriftSpeed;
  
  // 5% chance for rare pod (gives full health)
  const isRare = forceRare ?? Math.random() < 0.05;
  
  return {
    id: generateId(),
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    value,
    magnetized: false,
    isRare,
  };
}

export function createPowerUp(x: number, y: number, type?: PowerUpType): VectorPowerUp {
  // Chain Lightning has 15% chance - should appear 1-3 times per map
  const roll = Math.random();
  let powerUpType: PowerUpType;
  
  if (type) {
    powerUpType = type;
  } else if (roll < 0.15) {
    // 15% chance for chain lightning (uncommon but reliable)
    powerUpType = 'chainLightning';
  } else {
    // Regular power-ups
    const types: PowerUpType[] = ['shield', 'nuke', 'doublePoints', 'doubleShot', 'speedBoost'];
    powerUpType = types[Math.floor(Math.random() * types.length)];
  }
  
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

// Create hyperspace-specific power-ups
export function createHyperspacePowerUp(x: number, y: number): VectorPowerUp {
  const hyperspaceTypes: PowerUpType[] = ['warpShield', 'formationBreaker', 'timeWarp', 'magnetPulse'];
  const powerUpType = hyperspaceTypes[Math.floor(Math.random() * hyperspaceTypes.length)];
  
  return {
    id: generateId(),
    x,
    y,
    vx: 0,
    vy: 2, // Move downward with the flow
    type: powerUpType,
    life: VM_CONFIG.powerUpLifetime,
  };
}
