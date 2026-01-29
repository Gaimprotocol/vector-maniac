// Arena Battle Mode Game Logic

import { 
  ArenaState, 
  ArenaProjectile, 
  ArenaParticle,
  ArenaObstacle,
  ArenaOpponent,
  ArenaReward,
  ArenaPowerUp,
  ArenaPowerUpType,
  ARENA_DIFFICULTY_STATS,
  ARENA_POWERUP_INFO,
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

// Check if point intersects with a laser beam line segment
function pointNearLine(
  px: number, py: number, 
  x1: number, y1: number, x2: number, y2: number,
  threshold: number
): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return false;
  
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (len * len)));
  const nearX = x1 + t * dx;
  const nearY = y1 + t * dy;
  
  const distSq = (px - nearX) ** 2 + (py - nearY) ** 2;
  return distSq < threshold * threshold;
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
  
  // Skip AI if stunned (EMP)
  if (state.opponentStunTimer > 0) return state;
  
  let newState = { ...state };
  let opponent = { ...state.opponent };
  
  // Update behavior timer
  opponent.behaviorTimer--;
  if (opponent.behaviorTimer <= 0) {
    // Switch behavior based on weights (if human player) or randomly (if AI)
    if (opponent.behaviorWeights && opponent.isHumanPlayer) {
      // Weighted selection for more realistic "human" behavior
      const weights = opponent.behaviorWeights;
      const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
      let random = Math.random() * totalWeight;
      
      for (const [behavior, weight] of Object.entries(weights)) {
        random -= weight;
        if (random <= 0) {
          opponent.behaviorState = behavior as ArenaOpponent['behaviorState'];
          break;
        }
      }
      
      // "Human" players change tactics more variably
      const adaptability = opponent.adaptability || 0.5;
      opponent.behaviorTimer = Math.floor(40 + Math.random() * 100 * (1 - adaptability * 0.5));
    } else {
      // Standard AI behavior
      const behaviors: ArenaOpponent['behaviorState'][] = ['chase', 'evade', 'strafe', 'cover'];
      opponent.behaviorState = behaviors[Math.floor(Math.random() * behaviors.length)];
      opponent.behaviorTimer = 60 + Math.floor(Math.random() * 120);
    }
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

// Spawn a power-up at a random safe location
function spawnPowerUp(state: ArenaState): ArenaPowerUp | null {
  const types: ArenaPowerUpType[] = ['emp', 'teleport', 'shield', 'overdrive'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  const padding = 150;
  let x: number, y: number;
  let attempts = 0;
  
  // Find a safe spawn location
  do {
    x = padding + Math.random() * (state.arenaWidth - padding * 2);
    y = padding + Math.random() * (state.arenaHeight - padding * 2);
    attempts++;
    
    // Check distance from player and opponent
    const playerDist = distance(x, y, state.playerX, state.playerY);
    const opponentDist = state.opponent ? distance(x, y, state.opponent.x, state.opponent.y) : 999;
    
    if (playerDist > 150 && opponentDist > 150) {
      // Check obstacle collision
      let blocked = false;
      for (const obs of state.obstacles) {
        if (distance(x, y, obs.x, obs.y) < 80) {
          blocked = true;
          break;
        }
      }
      if (!blocked) break;
    }
  } while (attempts < 30);
  
  if (attempts >= 30) return null;
  
  return {
    id: `powerup_${Date.now()}_${Math.random()}`,
    x,
    y,
    type,
    bobOffset: Math.random() * Math.PI * 2,
    spawnTime: state.gameTime,
  };
}

// Check power-up collection
function checkPowerUpCollection(state: ArenaState): ArenaState {
  if (state.phase !== 'fighting') return state;
  
  let newState = { ...state };
  const remainingPowerUps: ArenaPowerUp[] = [];
  let newParticles = [...state.particles];
  
  for (const powerUp of state.powerUps) {
    const dist = distance(state.playerX, state.playerY, powerUp.x, powerUp.y);
    
    if (dist < 35) {
      // Collected!
      const info = ARENA_POWERUP_INFO[powerUp.type];
      newParticles.push(...createParticles(powerUp.x, powerUp.y, info.color, 15));
      newState.soundQueue = [...newState.soundQueue, 'powerUp'];
      newState.lastPowerUpCollected = powerUp.type;
      newState.powerUpNotificationTimer = 90;
      
      // Apply power-up effect
      switch (powerUp.type) {
        case 'emp':
          newState.opponentStunTimer = ARENA_POWERUP_INFO.emp.duration || 180;
          newState.empFlashTimer = 30;
          newState.screenShakeIntensity = 10;
          newParticles.push(...createExplosion(state.playerX, state.playerY, '#00ccff'));
          break;
          
        case 'teleport':
          // Teleport to a safe location
          const safeSpot = findSafeTeleportLocation(state);
          if (safeSpot) {
            newState.playerX = safeSpot.x;
            newState.playerY = safeSpot.y;
            newState.targetX = safeSpot.x;
            newState.targetY = safeSpot.y;
            newState.teleportFlashTimer = 20;
            newParticles.push(...createExplosion(powerUp.x, powerUp.y, '#cc00ff'));
            newParticles.push(...createExplosion(safeSpot.x, safeSpot.y, '#cc00ff'));
          }
          break;
          
        case 'shield':
          newState.playerHealth = Math.min(
            newState.playerMaxHealth,
            newState.playerHealth + 30
          );
          newState.playerInvulnerable = 60;
          break;
          
        case 'overdrive':
          newState.overdriveTimer = ARENA_POWERUP_INFO.overdrive.duration || 300;
          break;
      }
    } else {
      // Check if power-up expired (30 seconds)
      if (state.gameTime - powerUp.spawnTime < 1800) {
        remainingPowerUps.push(powerUp);
      } else {
        // Fade out particles
        newParticles.push(...createParticles(powerUp.x, powerUp.y, '#666666', 5));
      }
    }
  }
  
  newState.powerUps = remainingPowerUps;
  newState.particles = newParticles;
  return newState;
}

// Find a safe location for teleport
function findSafeTeleportLocation(state: ArenaState): { x: number; y: number } | null {
  const padding = 100;
  
  for (let attempts = 0; attempts < 20; attempts++) {
    const x = padding + Math.random() * (state.arenaWidth - padding * 2);
    const y = padding + Math.random() * (state.arenaHeight - padding * 2);
    
    // Check distance from opponent
    const opponentDist = state.opponent ? distance(x, y, state.opponent.x, state.opponent.y) : 999;
    if (opponentDist < 200) continue;
    
    // Check obstacle collision
    let blocked = false;
    for (const obs of state.obstacles) {
      if (obs.type === 'laserGrid') {
        if (distance(x, y, obs.x, obs.y) < (obs.laserLength || 100) + 30) {
          blocked = true;
          break;
        }
      } else if (obs.type === 'phasePlatform' && obs.isVisible) {
        if (distance(x, y, obs.x, obs.y) < 60) {
          blocked = true;
          break;
        }
      } else {
        if (distance(x, y, obs.x, obs.y) < 60) {
          blocked = true;
          break;
        }
      }
    }
    
    if (!blocked) {
      return { x, y };
    }
  }
  
  // Fallback to center-ish location
  return {
    x: state.arenaWidth / 2 + (Math.random() - 0.5) * 200,
    y: state.arenaHeight / 2 + (Math.random() - 0.5) * 200,
  };
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

// Update dynamic obstacles (laser grids and phase platforms)
function updateDynamicObstacles(state: ArenaState): ArenaState {
  let newState = { ...state };
  let newObstacles = state.obstacles.map(obs => {
    if (obs.type === 'laserGrid' && obs.rotation !== undefined && obs.rotationSpeed !== undefined) {
      return {
        ...obs,
        rotation: obs.rotation + obs.rotationSpeed,
      };
    }
    if (obs.type === 'phasePlatform' && obs.phaseTimer !== undefined && obs.phaseDuration !== undefined) {
      let newTimer = obs.phaseTimer + 1;
      let newVisible = obs.isVisible;
      
      if (newTimer >= obs.phaseDuration) {
        newTimer = 0;
        newVisible = !obs.isVisible;
      }
      
      return {
        ...obs,
        phaseTimer: newTimer,
        isVisible: newVisible,
      };
    }
    return obs;
  });
  
  newState.obstacles = newObstacles;
  return newState;
}

// Check laser damage
function checkLaserDamage(state: ArenaState): ArenaState {
  if (state.phase !== 'fighting' || state.playerInvulnerable > 0) return state;
  
  let newState = { ...state };
  
  for (const obs of state.obstacles) {
    if (obs.type === 'laserGrid' && obs.rotation !== undefined && obs.laserLength !== undefined) {
      // Check 4 laser beams (cross pattern)
      for (let i = 0; i < 4; i++) {
        const angle = obs.rotation + (i * Math.PI / 2);
        const endX = obs.x + Math.cos(angle) * obs.laserLength;
        const endY = obs.y + Math.sin(angle) * obs.laserLength;
        
        if (pointNearLine(state.playerX, state.playerY, obs.x, obs.y, endX, endY, 18)) {
          newState.playerHealth -= 5;
          newState.playerInvulnerable = 30; // Shorter invuln for laser
          newState.screenShakeIntensity = 5;
          newState.particles = [
            ...newState.particles,
            ...createParticles(state.playerX, state.playerY, '#ff0044', 8),
          ];
          newState.soundQueue = [...newState.soundQueue, 'playerHit'];
          
          if (newState.playerHealth <= 0) {
            newState.particles = [
              ...newState.particles,
              ...createExplosion(state.playerX, state.playerY, ARENA_CONFIG.playerColor),
            ];
            newState.phase = 'playerLost';
            newState.phaseTimer = ARENA_CONFIG.defeatDuration;
            newState.screenShakeIntensity = 25;
            newState.soundQueue = [...newState.soundQueue, 'playerDeath'];
          }
          break;
        }
      }
    }
  }
  
  return newState;
}

// Check if obstacle blocks movement (considers phase platforms)
function isObstacleBlocking(obs: ArenaObstacle, x: number, y: number, radius: number): boolean {
  // Phase platforms only block when visible
  if (obs.type === 'phasePlatform' && !obs.isVisible) {
    return false;
  }
  // Laser grids don't block movement (just the center hub)
  if (obs.type === 'laserGrid') {
    return distance(x, y, obs.x, obs.y) < 25 + radius;
  }
  // Standard collision for other obstacles
  return circleRectCollision(x, y, radius, obs.x - obs.width/2, obs.y - obs.height/2, obs.width, obs.height);
}

// Main update function
export function updateArenaState(state: ArenaState, input: ArenaInput): ArenaState {
  let newState: ArenaState = {
    ...state,
    projectiles: [...state.projectiles],
    particles: [...state.particles],
    obstacles: [...state.obstacles],
    powerUps: [...state.powerUps],
    soundQueue: [],
  };
  
  newState.gameTime++;
  
  // Always update dynamic obstacles
  newState = updateDynamicObstacles(newState);
  
  // Update effect timers
  if (newState.opponentStunTimer > 0) newState.opponentStunTimer--;
  if (newState.overdriveTimer > 0) newState.overdriveTimer--;
  if (newState.teleportFlashTimer > 0) newState.teleportFlashTimer--;
  if (newState.empFlashTimer > 0) newState.empFlashTimer--;
  if (newState.powerUpNotificationTimer > 0) newState.powerUpNotificationTimer--;
  
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
      // Update player - ship positioned 240px above finger (same as main game)
      if (input.isTouching) {
        newState.targetX = input.touchX;
        newState.targetY = input.touchY - ARENA_CONFIG.shipOffsetY; // 240px above finger
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
        
        // Check obstacle collisions (using new blocking check)
        let blocked = false;
        for (const obs of newState.obstacles) {
          if (isObstacleBlocking(obs, newX, newY, 15)) {
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
      
      // Determine fire rate (affected by overdrive)
      const fireRate = newState.overdriveTimer > 0 
        ? Math.floor(ARENA_CONFIG.playerFireRate / 2) 
        : ARENA_CONFIG.playerFireRate;
      
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
        newState.playerFireTimer = fireRate;
        newState.soundQueue = [...newState.soundQueue, `shoot_${projectileStyle.sound}`];
      }
      
      // Spawn power-ups periodically
      if (newState.powerUpSpawnTimer > 0) {
        newState.powerUpSpawnTimer--;
      } else if (newState.powerUps.length < 2) {
        const newPowerUp = spawnPowerUp(newState);
        if (newPowerUp) {
          newState.powerUps = [...newState.powerUps, newPowerUp];
          newState.soundQueue = [...newState.soundQueue, 'spawn'];
        }
        newState.powerUpSpawnTimer = 480 + Math.floor(Math.random() * 300); // 8-13 seconds
      }
      
      // Check power-up collection
      newState = checkPowerUpCollection(newState);
      
      // Update opponent AI
      newState = updateOpponentAI(newState);
      
      // Update projectiles
      newState = updateProjectiles(newState);
      
      // Check laser damage
      newState = checkLaserDamage(newState);
      
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
