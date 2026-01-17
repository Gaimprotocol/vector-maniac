import { Player, Bullet, Bomb, Enemy, Civilian, Pickup, EnemyBehavior, FallingDebris } from './types';
import { generateId } from './utils';
import { GAME_CONFIG, SPRITE_SIZE, ENEMY_CONFIG } from './constants';

export function createPlayer(): Player {
  return {
    id: generateId(),
    x: 100,
    y: GAME_CONFIG.canvasHeight / 2,
    width: SPRITE_SIZE.player.width,
    height: SPRITE_SIZE.player.height,
    velocityX: 0,
    velocityY: 0,
    active: true,
    health: 100,
    maxHealth: 100,
    isGroundMode: false,
    invulnerable: false,
    invulnerableTimer: 0,
    fireTimer: 0,
    bombTimer: 0,
    targetX: 100,
    targetY: GAME_CONFIG.canvasHeight / 2,
    trail: [],
    hasHomingMissiles: false,
    homingMissileTimer: 0,
    pendingMissile: null,
    hasShield: false,
    shieldTimer: 0,
    hasTripleShot: false,
    tripleShotTimer: 0,
    hasForceField: false,
    forceFieldTimer: 0,
  };
}

export function createBullet(
  x: number,
  y: number,
  velocityX: number,
  velocityY: number,
  isPlayerBullet: boolean,
  damage: number = 10,
  isHoming: boolean = false,
  width?: number,
  height?: number
): Bullet {
  return {
    id: generateId(),
    x,
    y,
    width: width ?? SPRITE_SIZE.bullet.width,
    height: height ?? SPRITE_SIZE.bullet.height,
    velocityX,
    velocityY,
    active: true,
    damage,
    isPlayerBullet,
    isHoming,
  };
}

export function createBomb(x: number, y: number): Bomb {
  return {
    id: generateId(),
    x,
    y,
    width: SPRITE_SIZE.bomb.width,
    height: SPRITE_SIZE.bomb.height,
    velocityX: 0,
    velocityY: 2,
    active: true,
    damage: 40,
    timer: 100,
  };
}

export function createEnemy(
  type: Enemy['type'],
  x: number,
  y: number,
  behavior?: Partial<EnemyBehavior>
): Enemy {
  const defaultBehavior: EnemyBehavior = {
    pattern: type === 'turret' || type === 'hostilePerson' || type === 'sniper' || type === 'tank' || type === 'seaMine' ? 'static' 
           : type === 'drone' || type === 'bomber' ? 'sine' 
           : type === 'jellyfish' ? 'sine'
           : type === 'kraken' ? 'chase'
           : type === 'gunboat' ? 'patrol'
           : 'chase',
    amplitude: type === 'jellyfish' ? 50 : type === 'gunboat' ? 10 : 30,
    frequency: type === 'jellyfish' ? 0.02 : 0.03,
    startY: y,
  };

  const sizes: Record<Enemy['type'], { width: number; height: number }> = {
    turret: { width: SPRITE_SIZE.enemy.width, height: SPRITE_SIZE.enemy.height },
    drone: { width: SPRITE_SIZE.enemy.width, height: SPRITE_SIZE.enemy.height },
    leech: { width: SPRITE_SIZE.enemy.width, height: SPRITE_SIZE.enemy.height },
    missile: { width: SPRITE_SIZE.enemy.width, height: SPRITE_SIZE.enemy.height },
    hostilePerson: { width: SPRITE_SIZE.hostilePerson.width, height: SPRITE_SIZE.hostilePerson.height },
    bomber: { width: 20, height: 12 },
    sniper: { width: 14, height: 14 },
    tank: { width: 22, height: 14 },
    jellyfish: { width: 18, height: 22 },
    kraken: { width: 28, height: 28 },
    seaMine: { width: 16, height: 16 },
    gunboat: { width: 28, height: 14 },
  };

  const healthValues: Record<Enemy['type'], number> = {
    turret: 25,
    drone: 12,
    leech: 8,
    missile: 8,
    hostilePerson: 8,
    bomber: 20,
    sniper: 10,
    tank: 40,
    jellyfish: 10,
    kraken: 35,
    seaMine: 15,
    gunboat: 30,
  };

  const size = sizes[type];

  return {
    id: generateId(),
    x,
    y,
    width: size.width,
    height: size.height,
    velocityX: type === 'turret' || type === 'hostilePerson' || type === 'sniper' || type === 'tank' || type === 'seaMine' ? 0 
             : type === 'drone' || type === 'bomber' ? -ENEMY_CONFIG.droneSpeed 
             : type === 'jellyfish' ? -ENEMY_CONFIG.droneSpeed * 0.6
             : type === 'kraken' ? -ENEMY_CONFIG.leechSpeed * 0.8
             : type === 'gunboat' ? -ENEMY_CONFIG.droneSpeed * 0.4
             : -ENEMY_CONFIG.leechSpeed,
    velocityY: 0,
    active: true,
    type,
    health: healthValues[type],
    fireTimer: 0,
    behavior: { ...defaultBehavior, ...behavior },
  };
}

export function createCivilian(x: number, y: number): Civilian {
  return {
    id: generateId(),
    x,
    y,
    width: SPRITE_SIZE.civilian.width,
    height: SPRITE_SIZE.civilian.height,
    velocityX: 0,
    velocityY: 0,
    active: true,
    rescued: false,
    hasLeech: false,
  };
}

export function createPickup(
  type: Pickup['type'],
  x: number,
  y: number,
  value: number = 20
): Pickup {
  return {
    id: generateId(),
    x,
    y,
    width: SPRITE_SIZE.pickup.width,
    height: SPRITE_SIZE.pickup.height,
    velocityX: 0,
    velocityY: 0,
    active: true,
    type,
    value,
  };
}

export function createDebris(x: number, y: number, debrisType: 'rock' | 'ice' | 'lava' | 'metal' = 'rock'): FallingDebris {
  const size = 8 + Math.random() * 12; // Random size 8-20
  return {
    id: generateId(),
    x,
    y,
    width: size,
    height: size,
    velocityX: -1 + Math.random() * 2, // Slight horizontal drift
    velocityY: 2 + Math.random() * 2, // Fall speed 2-4
    active: true,
    damage: debrisType === 'lava' ? 15 : 10, // Lava does more damage
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.2,
    size,
    debrisType,
  };
}
