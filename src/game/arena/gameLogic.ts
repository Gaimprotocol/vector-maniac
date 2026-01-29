// Arena Battle Mode Game Logic

import { 
  ArenaState, 
  ArenaProjectile, 
  ArenaParticle,
  ArenaObstacle,
  ArenaOpponent,
  ArenaReward,
  ARENA_DIFFICULTY_STATS,
} from './types';
import { ARENA_CONFIG } from './constants';
import { getStoredMegaShipId } from '@/hooks/useMegaShips';
import { getShipProjectileStyle } from '../vectorManiac/shipProjectiles';
import { playVectorSound } from '../vectorManiac/sounds';

interface ArenaInput {
  touchX: number;
  touchY: number;
  isTouching: boolean;
}

// Utility functions
function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function normalize(x: number, y: number): { x: number; y: number } {
  const len = Math.sqrt(x * x + y * y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: x / len, y: y / len };
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpAngle(a: number, b: number, t: number): number {
  let diff = b - a;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}

// Collision detection
function rectCollision(
  x1: number, y1: number, w1: number, h1: number,
  x2: number, y2: number, w2: number, h2: number
): boolean {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

function circleRectCollision(
  cx: number, cy: number, cr: number,
  rx: number, ry: number, rw: number, rh: number
): boolean {
  const closestX = clamp(cx, rx, rx + rw);
  const closestY = clamp(cy, ry, ry + rh);
  const dx = cx - closestX;
  const dy = cy - closestY;
  return (dx * dx + dy * dy) < (cr * cr);
}

// Create projectile
function createProjectile(
  x: number, y: number, angle: number, 
  speed: number, damage: number, isPlayer: boolean, shipId?: string
): ArenaProjectile {
  return {
    id: `proj_${Date.now()}_${Math.random()}`,
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    damage,
    isPlayer,
    size: ARENA_CONFIG.projectileSize,
    shipId,
  };
}

// Create particle effect
function createParticles(x: number, y: number, color: string, count: number = 5): ArenaParticle[] {
  const particles: ArenaParticle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    particles.push({
      id: `particle_${Date.now()}_${i}`,
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 3,
      color,
      life: 30 + Math.random() * 30,
      maxLife: 60,
    });
  }
  return particles;
}

// Create explosion
function createExplosion(x: number, y: number, color: string): ArenaParticle[] {
  const particles: ArenaParticle[] = [];
  
  // Core flash
  for (let i = 0; i < 10; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 6 + Math.random() * 8;
    particles.push({
      id: `exp_core_${Date.now()}_${i}`,
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 4 + Math.random() * 4,
      color: '#ffffff',
      life: 15 + Math.random() * 10,
      maxLife: 25,
    });
  }
  
  // Main color burst
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 6;
    particles.push({
      id: `exp_main_${Date.now()}_${i}`,
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 3 + Math.random() * 5,
      color,
      life: 30 + Math.random() * 30,
      maxLife: 60,
    });
  }
  
  // Debris
  for (let i = 0; i < 15; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3;
    particles.push({
      id: `exp_debris_${Date.now()}_${i}`,
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 2 + Math.random() * 2,
      color: '#888888',
      life: 40 + Math.random() * 40,
      maxLife: 80,
    });
  }
  
  return particles;
}

// Update opponent AI
function updateOpponentAI(state: ArenaState): ArenaState {
  if (!state.opponent || state.phase !== 'fighting') return state;
  
  let newState = { ...state };
  let opponent = { ...state.opponent };
  
  // Update behavior timer
  opponent.behaviorTimer--;
  if (opponent.behaviorTimer <= 0) {
    // Switch behavior randomly
    const behaviors: ArenaOpponent['behaviorState'][] = ['chase', 'evade', 'strafe', 'cover'];
    opponent.behaviorState = behaviors[Math.floor(Math.random() * behaviors.length)];
    opponent.behaviorTimer = 60 + Math.floor(Math.random() * 120);
  }
  
  const playerX = state.playerX;
  const playerY = state.playerY;
  const distToPlayer = distance(opponent.x, opponent.y, playerX, playerY);
  
  // Determine target position based on behavior
  switch (opponent.behaviorState) {
    case 'chase':
      opponent.targetX = playerX;
      opponent.targetY = playerY;
      break;
      
    case 'evade':
      // Move away from player
      const awayAngle = Math.atan2(opponent.y - playerY, opponent.x - playerX);
      opponent.targetX = opponent.x + Math.cos(awayAngle) * 100;
      opponent.targetY = opponent.y + Math.sin(awayAngle) * 100;
      break;
      
    case 'strafe':
      // Circle around player
      const circleAngle = Math.atan2(opponent.y - playerY, opponent.x - playerX) + 0.05;
      const circleRadius = 200;
      opponent.targetX = playerX + Math.cos(circleAngle) * circleRadius;
      opponent.targetY = playerY + Math.sin(circleAngle) * circleRadius;
      break;
      
    case 'cover':
      // Find nearest obstacle and move behind it relative to player
      let nearestObstacle: ArenaObstacle | null = null;
      let nearestDist = Infinity;
      
      for (const obs of state.obstacles) {
        const d = distance(opponent.x, opponent.y, obs.x, obs.y);
        if (d < nearestDist) {
          nearestDist = d;
          nearestObstacle = obs;
        }
      }
      
      if (nearestObstacle) {
        const toPlayerAngle = Math.atan2(playerY - nearestObstacle.y, playerX - nearestObstacle.x);
        opponent.targetX = nearestObstacle.x - Math.cos(toPlayerAngle) * 60;
        opponent.targetY = nearestObstacle.y - Math.sin(toPlayerAngle) * 60;
      }
      break;
  }
  
  // Move towards target
  const dx = opponent.targetX - opponent.x;
  const dy = opponent.targetY - opponent.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist > 5) {
    const dir = normalize(dx, dy);
    let newX = opponent.x + dir.x * opponent.speed;
    let newY = opponent.y + dir.y * opponent.speed;
    
    // Check obstacle collisions
    let blocked = false;
    for (const obs of state.obstacles) {
      if (circleRectCollision(newX, newY, 15, obs.x - obs.width/2, obs.y - obs.height/2, obs.width, obs.height)) {
        blocked = true;
        break;
      }
    }
    
    if (!blocked) {
      // Clamp to arena bounds
      opponent.x = clamp(newX, ARENA_CONFIG.arenaPadding, ARENA_CONFIG.arenaWidth - ARENA_CONFIG.arenaPadding);
      opponent.y = clamp(newY, ARENA_CONFIG.arenaPadding, ARENA_CONFIG.arenaHeight - ARENA_CONFIG.arenaPadding);
    }
  }
  
  // Face player
  const angleToPlayer = Math.atan2(playerY - opponent.y, playerX - opponent.x);
  opponent.angle = lerpAngle(opponent.angle, angleToPlayer, 0.1);
  
  // Fire at player
  if (opponent.fireTimer > 0) {
    opponent.fireTimer--;
  } else if (distToPlayer < 500) {
    // Predict player position based on accuracy
    const predictX = playerX + (state.targetX - playerX) * opponent.accuracy * 0.5;
    const predictY = playerY + (state.targetY - playerY) * opponent.accuracy * 0.5;
    
    const fireAngle = Math.atan2(predictY - opponent.y, predictX - opponent.x);
    // Add some inaccuracy
    const spread = (1 - opponent.accuracy) * 0.3;
    const finalAngle = fireAngle + (Math.random() - 0.5) * spread;
    
    const projectile = createProjectile(
      opponent.x + Math.cos(finalAngle) * 20,
      opponent.y + Math.sin(finalAngle) * 20,
      finalAngle,
      ARENA_CONFIG.playerBulletSpeed * 0.8,
      opponent.damage,
      false,
      opponent.shipId
    );
    
    newState.projectiles = [...newState.projectiles, projectile];
    opponent.fireTimer = opponent.fireRate;
    newState.soundQueue = [...newState.soundQueue, 'shoot_energy'];
  }
  
  newState.opponent = opponent;
  return newState;
}

// Update particles
function updateParticles(particles: ArenaParticle[]): ArenaParticle[] {
  return particles
    .map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vx: p.vx * 0.95,
      vy: p.vy * 0.95,
      life: p.life - 1,
    }))
    .filter(p => p.life > 0);
}

// Update projectiles
function updateProjectiles(state: ArenaState): ArenaState {
  let newState = { ...state };
  
  const updatedProjectiles: ArenaProjectile[] = [];
  const newParticles: ArenaParticle[] = [...state.particles];
  
  for (const proj of state.projectiles) {
    let newProj = {
      ...proj,
      x: proj.x + proj.vx,
      y: proj.y + proj.vy,
    };
    
    // Check bounds
    if (newProj.x < 0 || newProj.x > state.arenaWidth ||
        newProj.y < 0 || newProj.y > state.arenaHeight) {
      continue; // Remove projectile
    }
    
    // Check obstacle collisions
    let hitObstacle = false;
    for (const obs of state.obstacles) {
      if (circleRectCollision(newProj.x, newProj.y, newProj.size, 
          obs.x - obs.width/2, obs.y - obs.height/2, obs.width, obs.height)) {
        hitObstacle = true;
        newParticles.push(...createParticles(newProj.x, newProj.y, '#666666', 3));
        break;
      }
    }
    
    if (!hitObstacle) {
      updatedProjectiles.push(newProj);
    }
  }
  
  newState.projectiles = updatedProjectiles;
  newState.particles = newParticles;
  return newState;
}

// Check combat collisions
function checkCombatCollisions(state: ArenaState): ArenaState {
  if (state.phase !== 'fighting') return state;
  
  let newState = { ...state };
  const remainingProjectiles: ArenaProjectile[] = [];
  let newParticles = [...state.particles];
  
  for (const proj of state.projectiles) {
    let consumed = false;
    
    if (proj.isPlayer && state.opponent) {
      // Check hit on opponent
      const hitDist = distance(proj.x, proj.y, state.opponent.x, state.opponent.y);
      if (hitDist < 20) {
        consumed = true;
        newState.opponent = {
          ...state.opponent,
          health: state.opponent.health - proj.damage,
        };
        newParticles.push(...createParticles(proj.x, proj.y, ARENA_CONFIG.opponentColor, 5));
        newState.soundQueue = [...newState.soundQueue, 'hit'];
        
        // Check if opponent defeated
        if (newState.opponent.health <= 0) {
          newParticles.push(...createExplosion(state.opponent.x, state.opponent.y, ARENA_CONFIG.opponentColor));
          newState.phase = 'playerWon';
          newState.phaseTimer = ARENA_CONFIG.victoryDuration;
          newState.screenShakeIntensity = 20;
          newState.soundQueue = [...newState.soundQueue, 'bossDefeat'];
          
          // Award reward
          if (state.potentialRewards.length > 0) {
            newState.earnedReward = state.potentialRewards[Math.floor(Math.random() * state.potentialRewards.length)];
          }
        }
      }
    } else if (!proj.isPlayer && state.playerInvulnerable <= 0) {
      // Check hit on player
      const hitDist = distance(proj.x, proj.y, state.playerX, state.playerY);
      if (hitDist < 18) {
        consumed = true;
        newState.playerHealth -= proj.damage;
        newState.playerInvulnerable = ARENA_CONFIG.invulnerabilityFrames;
        newState.screenShakeIntensity = 8;
        newParticles.push(...createParticles(proj.x, proj.y, ARENA_CONFIG.playerColor, 5));
        newState.soundQueue = [...newState.soundQueue, 'playerHit'];
        
        // Check if player defeated
        if (newState.playerHealth <= 0) {
          newParticles.push(...createExplosion(state.playerX, state.playerY, ARENA_CONFIG.playerColor));
          newState.phase = 'playerLost';
          newState.phaseTimer = ARENA_CONFIG.defeatDuration;
          newState.screenShakeIntensity = 25;
          newState.soundQueue = [...newState.soundQueue, 'playerDeath'];
        }
      }
    }
    
    if (!consumed) {
      remainingProjectiles.push(proj);
    }
  }
  
  newState.projectiles = remainingProjectiles;
  newState.particles = newParticles;
  return newState;
}

// Main update function
export function updateArenaState(state: ArenaState, input: ArenaInput): ArenaState {
  let newState: ArenaState = {
    ...state,
    projectiles: [...state.projectiles],
    particles: [...state.particles],
    soundQueue: [],
  };
  
  newState.gameTime++;
  
  switch (newState.phase) {
    case 'entering':
      newState.phaseTimer--;
      if (newState.phaseTimer <= 0) {
        newState.phase = 'countdown';
        newState.phaseTimer = ARENA_CONFIG.countdownDuration;
      }
      break;
      
    case 'countdown':
      newState.phaseTimer--;
      if (newState.phaseTimer <= 0) {
        newState.phase = 'fighting';
        newState.soundQueue = [...newState.soundQueue, 'waveComplete'];
      }
      break;
      
    case 'fighting':
      // Update player - ship is positioned 180px above finger (scaled for arena size)
      const shipOffsetY = 180; // Ship flies above finger for visibility
      if (input.isTouching) {
        newState.targetX = input.touchX;
        newState.targetY = input.touchY - shipOffsetY; // Ship above finger
      }
      
      // Move player
      const dx = newState.targetX - newState.playerX;
      const dy = newState.targetY - newState.playerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 2) {
        const moveSpeed = Math.min(ARENA_CONFIG.playerSpeed * 3, dist * 0.5);
        const dir = normalize(dx, dy);
        let newX = newState.playerX + dir.x * moveSpeed;
        let newY = newState.playerY + dir.y * moveSpeed;
        
        // Check obstacle collisions
        let blocked = false;
        for (const obs of state.obstacles) {
          if (circleRectCollision(newX, newY, 15, obs.x - obs.width/2, obs.y - obs.height/2, obs.width, obs.height)) {
            blocked = true;
            break;
          }
        }
        
        if (!blocked) {
          newState.playerX = clamp(newX, ARENA_CONFIG.arenaPadding, ARENA_CONFIG.arenaWidth - ARENA_CONFIG.arenaPadding);
          newState.playerY = clamp(newY, ARENA_CONFIG.arenaPadding, ARENA_CONFIG.arenaHeight - ARENA_CONFIG.arenaPadding);
        }
        
        newState.playerAngle = lerpAngle(newState.playerAngle, Math.atan2(dy, dx), 0.3);
      }
      
      // Update timers
      if (newState.playerFireTimer > 0) newState.playerFireTimer--;
      if (newState.playerInvulnerable > 0) newState.playerInvulnerable--;
      
      // Player fires when touching and opponent exists
      if (input.isTouching && newState.playerFireTimer <= 0 && newState.opponent) {
        const shipId = getStoredMegaShipId();
        const projectileStyle = getShipProjectileStyle(shipId);
        
        const tipOffset = 20;
        const spawnX = newState.playerX + Math.cos(newState.playerAngle) * tipOffset;
        const spawnY = newState.playerY + Math.sin(newState.playerAngle) * tipOffset;
        
        const projectile = createProjectile(
          spawnX, spawnY,
          newState.playerAngle,
          ARENA_CONFIG.playerBulletSpeed,
          ARENA_CONFIG.playerDamage,
          true,
          shipId
        );
        
        newState.projectiles = [...newState.projectiles, projectile];
        newState.playerFireTimer = ARENA_CONFIG.playerFireRate;
        newState.soundQueue = [...newState.soundQueue, `shoot_${projectileStyle.sound}`];
      }
      
      // Update opponent AI
      newState = updateOpponentAI(newState);
      
      // Update projectiles
      newState = updateProjectiles(newState);
      
      // Check collisions
      newState = checkCombatCollisions(newState);
      break;
      
    case 'playerWon':
    case 'playerLost':
      newState.phaseTimer--;
      if (newState.phaseTimer <= 0) {
        newState.phase = 'rewards';
      }
      break;
      
    case 'rewards':
      // Handled by UI
      break;
  }
  
  // Update particles
  newState.particles = updateParticles(newState.particles);
  
  // Decay screen shake
  if (newState.screenShakeIntensity > 0) {
    newState.screenShakeIntensity = Math.max(0, newState.screenShakeIntensity - 0.5);
  }
  
  // Play queued sounds
  newState.soundQueue.forEach(sound => {
    playVectorSound(sound as any);
  });
  
  return newState;
}
