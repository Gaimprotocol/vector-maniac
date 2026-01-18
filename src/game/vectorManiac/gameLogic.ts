// Vector Maniac Game Logic

import { VectorState, VectorEnemy, VectorProjectile, VECTOR_UPGRADES, VectorPowerUp } from './types';
import { VM_CONFIG } from './constants';
import { 
  createDrone, 
  createShooter, 
  createElite, 
  createBounty,
  createPlayerProjectile, 
  createEnemyProjectile,
  createParticle,
  createSalvage,
  createPowerUp
} from './entities';
import { getEnemiesForWave, isLastWaveInSegment, isFinalWave } from './state';
import { distance, lerp, lerpAngle, clamp, normalize } from './utils';
import { playVectorSound } from './sounds';

interface VectorInput {
  touchX: number;
  touchY: number;
  isTouching: boolean;
}

export function updateVectorState(state: VectorState, input: VectorInput): VectorState {
  let newState: VectorState = {
    ...state,
    enemies: [...state.enemies],
    projectiles: [...state.projectiles],
    particles: [...state.particles],
    salvage: [...state.salvage],
    powerups: [...state.powerups],
    activePowerUps: { ...state.activePowerUps },
    soundQueue: [],
  };
  
  newState.gameTime++;
  
  switch (newState.phase) {
    case 'entering':
      newState = updateEnteringPhase(newState);
      break;
    case 'playing':
      newState = updatePlayingPhase(newState, input);
      break;
    case 'waveComplete':
      newState = updateWaveCompletePhase(newState);
      break;
    case 'portalChoice':
    case 'upgradePick':
      // These phases are handled by UI - just update particles
      newState.particles = updateParticles(newState.particles);
      break;
    case 'gameOver':
    case 'victory':
      // These phases are handled by UI overlays
      break;
  }
  
  // Play queued sounds
  newState.soundQueue.forEach(sound => {
    playVectorSound(sound as any);
  });
  
  return newState;
}

// Alias for external use
export const updateVectorManiac = updateVectorState;

function updateEnteringPhase(state: VectorState): VectorState {
  let newState = { ...state };
  newState.phaseTimer--;
  
  // Create entrance particles
  if (newState.phaseTimer % 3 === 0) {
    const angle = Math.random() * Math.PI * 2;
    const particles = createParticle(
      newState.playerX + Math.cos(angle) * 30,
      newState.playerY + Math.sin(angle) * 30,
      VM_CONFIG.playerColor,
      2
    );
    newState.particles = [...newState.particles, ...particles];
  }
  
  if (newState.phaseTimer <= 0) {
    newState.phase = 'playing';
    newState.spawnTimer = 30;
    newState.soundQueue = [...newState.soundQueue, 'waveComplete'];
  }
  
  newState.particles = updateParticles(newState.particles);
  
  return newState;
}

function updatePlayingPhase(state: VectorState, input: VectorInput): VectorState {
  let newState = { ...state };
  
  // Update player position + facing based on touch direction
  // Finger acts like a “steering point”: ship stays 50px in front of the finger in the direction you steer.
  const isSteering = input.isTouching;
  const shipOffset = 50;

  if (isSteering) {
    newState.targetX = input.touchX;
    newState.targetY = input.touchY;

    // Direction from ship -> finger (where you steer)
    const dx = newState.targetX - newState.playerX;
    const dy = newState.targetY - newState.playerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0.001) {
      const dir = normalize(dx, dy);

      // Ship should be 50px "ahead" of the finger (finger behind the ship)
      const desiredX = newState.targetX + dir.x * shipOffset;
      const desiredY = newState.targetY + dir.y * shipOffset;

      const toDesiredX = desiredX - newState.playerX;
      const toDesiredY = desiredY - newState.playerY;
      const distToDesired = Math.sqrt(toDesiredX * toDesiredX + toDesiredY * toDesiredY);

      if (distToDesired > 1) {
        const speedNow = newState.activePowerUps.speedBoost > 0 ? newState.stats.speed * 1.5 : newState.stats.speed;
        const moveSpeed = Math.min(speedNow, distToDesired * 0.25);
        const moveDir = normalize(toDesiredX, toDesiredY);
        newState.playerX += moveDir.x * moveSpeed;
        newState.playerY += moveDir.y * moveSpeed;
      }

      // Face exactly where you steer (no "spin" beyond this)
      newState.playerAngle = Math.atan2(dir.y, dir.x);
    }
  }

  // Track if player is touching (for shooting)
  const isShooting = input.isTouching;
  
  // Update camera to follow player smoothly
  newState.cameraX = lerp(newState.cameraX, newState.playerX, 0.1);
  newState.cameraY = lerp(newState.cameraY, newState.playerY, 0.1);
  
  // No arena bounds - player can move freely in endless world
  
  // Update timers
  if (newState.fireTimer > 0) newState.fireTimer--;
  if (newState.invulnerableTimer > 0) newState.invulnerableTimer--;
  if (newState.comboTimer > 0) {
    newState.comboTimer--;
    if (newState.comboTimer <= 0) newState.combo = 0;
  }
  
  // Update active power-up timers
  if (newState.activePowerUps.doublePoints > 0) newState.activePowerUps.doublePoints--;
  if (newState.activePowerUps.doubleShot > 0) newState.activePowerUps.doubleShot--;
  if (newState.activePowerUps.speedBoost > 0) newState.activePowerUps.speedBoost--;
  
  // Apply speed boost
  const effectiveSpeed = newState.activePowerUps.speedBoost > 0 
    ? newState.stats.speed * 1.5 
    : newState.stats.speed;
  
  // Fire while touching - shoot from ship tip in direction ship is facing
  if (isShooting && newState.fireTimer <= 0) {
    // Calculate projectile spawn position at the tip of the ship (where it's pointing)
    const tipOffset = VM_CONFIG.playerSize + 8; // Spawn from ship tip
    const shootAngle = newState.playerAngle; // Shoot in direction ship is facing
    const spawnX = newState.playerX + Math.cos(shootAngle) * tipOffset;
    const spawnY = newState.playerY + Math.sin(shootAngle) * tipOffset;
    
    // Check if double shot is active
    if (newState.activePowerUps.doubleShot > 0) {
      // Shoot two projectiles with slight angle offset
      const spreadAngle = 0.15;
      // Calculate perpendicular offset for side-by-side shots
      const perpAngle = shootAngle + Math.PI / 2;
      const offsetDist = 8;
      
      const projectile1 = createPlayerProjectile(
        spawnX + Math.cos(perpAngle) * offsetDist,
        spawnY + Math.sin(perpAngle) * offsetDist,
        shootAngle - spreadAngle,
        newState.stats.bulletSpeed,
        newState.stats.damage,
        newState.stats.pierce
      );
      const projectile2 = createPlayerProjectile(
        spawnX - Math.cos(perpAngle) * offsetDist,
        spawnY - Math.sin(perpAngle) * offsetDist,
        shootAngle + spreadAngle,
        newState.stats.bulletSpeed,
        newState.stats.damage,
        newState.stats.pierce
      );
      newState.projectiles = [...newState.projectiles, projectile1, projectile2];
    } else {
      const projectile = createPlayerProjectile(
        spawnX,
        spawnY,
        shootAngle,
        newState.stats.bulletSpeed,
        newState.stats.damage,
        newState.stats.pierce
      );
      newState.projectiles = [...newState.projectiles, projectile];
    }
    newState.fireTimer = newState.stats.fireRate;
    newState.soundQueue = [...newState.soundQueue, 'shoot'];
  }
  
  // Spawn enemies
  if (newState.spawnTimer > 0) {
    newState.spawnTimer--;
  } else if (newState.enemiesSpawned < newState.enemiesInWave) {
    newState = spawnEnemy(newState);
    newState.spawnTimer = VM_CONFIG.spawnInterval;
  }
  
  // Update entities
  newState = updateEnemies(newState);
  newState = updateProjectiles(newState);
  newState = updateSalvage(newState);
  newState = updatePowerUps(newState);
  newState.particles = updateParticles(newState.particles);
  
  // Check collisions
  newState = checkCollisions(newState);
  newState = checkPowerUpCollisions(newState);
  
  // Check wave completion
  if (newState.enemiesDefeated >= newState.enemiesInWave && newState.enemies.length === 0) {
    newState = completeWave(newState);
  }
  
  // Check game over
  if (newState.health <= 0) {
    newState.phase = 'gameOver';
  }
  
  return newState;
}

function updateWaveCompletePhase(state: VectorState): VectorState {
  let newState = { ...state };
  newState.phaseTimer--;
  
  newState.particles = updateParticles(newState.particles);
  
  if (newState.phaseTimer <= 0) {
    // Advance to next wave
    newState.currentWave++;
    newState.enemiesSpawned = 0;
    newState.enemiesDefeated = 0;
    newState.enemiesInWave = getEnemiesForWave(newState.currentWave);
    newState.spawnTimer = 30;
    newState.phase = 'playing';
  }
  
  return newState;
}

function spawnEnemy(state: VectorState): VectorState {
  let newState = { ...state };
  
  const isBountyWave = isFinalWave(state.currentWave);
  
  if (isBountyWave && state.enemiesSpawned === 0) {
    // Spawn bounty boss around player
    const bounty = createBounty(state.playerX, state.playerY);
    bounty.health *= state.difficultyMultiplier;
    bounty.maxHealth = bounty.health;
    newState.enemies = [...newState.enemies, bounty];
  } else {
    // Determine enemy type based on wave
    const roll = Math.random();
    let enemy: VectorEnemy;
    
    if (state.currentWave >= 4 && roll < 0.15) {
      // Elite enemies after wave 4
      enemy = createElite(state.playerX, state.playerY);
    } else if (roll < 0.4) {
      // Shooters
      enemy = createShooter(state.playerX, state.playerY);
    } else {
      // Drones (most common)
      enemy = createDrone(state.playerX, state.playerY);
    }
    
    // Apply difficulty scaling
    enemy.health *= state.difficultyMultiplier;
    enemy.maxHealth = enemy.health;
    
    newState.enemies = [...newState.enemies, enemy];
  }
  
  newState.enemiesSpawned++;
  return newState;
}

function updateEnemies(state: VectorState): VectorState {
  let newState = { ...state };
  const updatedEnemies: VectorEnemy[] = [];
  
  for (const enemy of newState.enemies) {
    let e = { ...enemy };
    
    // Update direction towards player
    const dx = newState.playerX - e.x;
    const dy = newState.playerY - e.y;
    const dist = distance(e.x, e.y, newState.playerX, newState.playerY);
    
    switch (e.type) {
      case 'drone':
        // Drones rush directly at player
        if (dist > 20) {
          const dir = normalize(dx, dy);
          e.vx = lerp(e.vx, dir.x * VM_CONFIG.droneSpeed, 0.05);
          e.vy = lerp(e.vy, dir.y * VM_CONFIG.droneSpeed, 0.05);
        }
        break;
        
      case 'shooter':
        // Shooters try to keep distance and shoot
        const preferredDist = 150;
        if (dist < preferredDist - 30) {
          // Too close, back off
          const dir = normalize(-dx, -dy);
          e.vx = lerp(e.vx, dir.x * VM_CONFIG.shooterSpeed, 0.03);
          e.vy = lerp(e.vy, dir.y * VM_CONFIG.shooterSpeed, 0.03);
        } else if (dist > preferredDist + 30) {
          // Too far, approach
          const dir = normalize(dx, dy);
          e.vx = lerp(e.vx, dir.x * VM_CONFIG.shooterSpeed, 0.03);
          e.vy = lerp(e.vy, dir.y * VM_CONFIG.shooterSpeed, 0.03);
        } else {
          // Good distance, slow down
          e.vx *= 0.95;
          e.vy *= 0.95;
        }
        
        // Fire at player
        e.fireTimer--;
        if (e.fireTimer <= 0) {
          const proj = createEnemyProjectile(e.x, e.y, newState.playerX, newState.playerY);
          newState.projectiles = [...newState.projectiles, proj];
          e.fireTimer = VM_CONFIG.shooterFireRate;
        }
        break;
        
      case 'elite':
        // Elites are aggressive shooters
        const dir = normalize(dx, dy);
        e.vx = lerp(e.vx, dir.x * VM_CONFIG.eliteSpeed, 0.04);
        e.vy = lerp(e.vy, dir.y * VM_CONFIG.eliteSpeed, 0.04);
        
        e.fireTimer--;
        if (e.fireTimer <= 0) {
          // Fire in a spread
          for (let i = -1; i <= 1; i++) {
            const angle = Math.atan2(dy, dx) + i * 0.3;
            const proj = createEnemyProjectile(
              e.x + Math.cos(angle) * 10,
              e.y + Math.sin(angle) * 10,
              e.x + Math.cos(angle) * 100,
              e.y + Math.sin(angle) * 100
            );
            newState.projectiles = [...newState.projectiles, proj];
          }
          e.fireTimer = 80;
        }
        break;
        
      case 'bounty':
        // Bounty boss circles around the player and fires patterns
        e.behaviorTimer++;
        const orbitAngle = e.behaviorTimer * 0.02;
        const orbitRadius = 150;
        const bossTargetX = newState.playerX + Math.cos(orbitAngle) * orbitRadius;
        const bossTargetY = newState.playerY + Math.sin(orbitAngle) * orbitRadius;
        
        e.vx = lerp(e.vx, (bossTargetX - e.x) * 0.02, 0.1);
        e.vy = lerp(e.vy, (bossTargetY - e.y) * 0.02, 0.1);
        
        e.fireTimer--;
        if (e.fireTimer <= 0) {
          // Fire ring of bullets
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const proj = createEnemyProjectile(
              e.x + Math.cos(angle) * 20,
              e.y + Math.sin(angle) * 20,
              e.x + Math.cos(angle) * 200,
              e.y + Math.sin(angle) * 200
            );
            newState.projectiles = [...newState.projectiles, proj];
          }
          e.fireTimer = 60;
        }
        break;
    }
    
    // Apply velocity
    e.x += e.vx;
    e.y += e.vy;
    
    // Remove enemies that are too far from player (endless mode cleanup)
    const distToPlayer = distance(e.x, e.y, newState.playerX, newState.playerY);
    if (distToPlayer < VM_CONFIG.enemyDespawnDistance) {
      updatedEnemies.push(e);
    }
  }
  
  newState.enemies = updatedEnemies;
  return newState;
}

function updateProjectiles(state: VectorState): VectorState {
  let newState = { ...state };
  const updatedProjectiles: VectorProjectile[] = [];
  
  for (const proj of newState.projectiles) {
    const p = {
      ...proj,
      x: proj.x + proj.vx,
      y: proj.y + proj.vy,
    };
    
    // Remove projectiles that are too far from player
    const distToPlayer = distance(p.x, p.y, newState.playerX, newState.playerY);
    if (distToPlayer < VM_CONFIG.enemyDespawnDistance) {
      updatedProjectiles.push(p);
    }
  }
  
  newState.projectiles = updatedProjectiles;
  return newState;
}

function updateSalvage(state: VectorState): VectorState {
  let newState = { ...state };
  const updatedSalvage = [];
  
  for (const s of newState.salvage) {
    const salvage = { ...s };
    
    // Check if in magnet range
    const dist = distance(newState.playerX, newState.playerY, salvage.x, salvage.y);
    
    if (dist < newState.stats.magnetRange) {
      salvage.magnetized = true;
    }
    
    if (salvage.magnetized) {
      // Pull towards player
      const dir = normalize(
        newState.playerX - salvage.x,
        newState.playerY - salvage.y
      );
      salvage.vx = lerp(salvage.vx, dir.x * 6, 0.2);
      salvage.vy = lerp(salvage.vy, dir.y * 6, 0.2);
    } else {
      // Slow drift
      salvage.vx *= 0.98;
      salvage.vy *= 0.98;
    }
    
    salvage.x += salvage.vx;
    salvage.y += salvage.vy;
    
    // Collect if close to player
    if (dist < 15) {
      const value = Math.floor(salvage.value * newState.stats.salvageBonus);
      newState.salvageCount += value;
      newState.score += value * 5;
      newState.soundQueue = [...newState.soundQueue, 'salvage'];
      
      // Create pickup particles
      const particles = createParticle(salvage.x, salvage.y, '#00ff88', 3);
      newState.particles = [...newState.particles, ...particles];
    } else {
      updatedSalvage.push(salvage);
    }
  }
  
  newState.salvage = updatedSalvage;
  return newState;
}

function updateParticles(particles: VectorState['particles']): VectorState['particles'] {
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

function updatePowerUps(state: VectorState): VectorState {
  let newState = { ...state };
  const updatedPowerUps: VectorPowerUp[] = [];
  
  for (const powerUp of newState.powerups) {
    const p = { ...powerUp };
    
    // Update position
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    
    // Slow down drift
    p.vx *= 0.99;
    p.vy *= 0.99;
    
    // Keep if still alive and near player
    const distToPlayer = distance(p.x, p.y, newState.playerX, newState.playerY);
    if (p.life > 0 && distToPlayer < VM_CONFIG.enemyDespawnDistance) {
      updatedPowerUps.push(p);
    }
  }
  
  newState.powerups = updatedPowerUps;
  return newState;
}

function checkPowerUpCollisions(state: VectorState): VectorState {
  let newState = { ...state };
  const remainingPowerUps: VectorPowerUp[] = [];
  
  for (const powerUp of newState.powerups) {
    const dist = distance(newState.playerX, newState.playerY, powerUp.x, powerUp.y);
    
    if (dist < VM_CONFIG.playerSize + VM_CONFIG.powerUpSize) {
      // Collected!
      newState = applyPowerUp(newState, powerUp.type);
      newState.soundQueue = [...newState.soundQueue, 'powerup'];
      
      // Create pickup particles
      const color = VM_CONFIG.powerUpColors[powerUp.type];
      const particles = createParticle(powerUp.x, powerUp.y, color, 10);
      newState.particles = [...newState.particles, ...particles];
    } else {
      remainingPowerUps.push(powerUp);
    }
  }
  
  newState.powerups = remainingPowerUps;
  return newState;
}

function applyPowerUp(state: VectorState, type: VectorPowerUp['type']): VectorState {
  let newState = { ...state };
  
  switch (type) {
    case 'shield':
      // Add a temporary shield (same as upgrade shield)
      newState.shields++;
      break;
      
    case 'nuke':
      // Destroy all enemies on screen
      for (const enemy of newState.enemies) {
        // Create explosion particles
        const particles = createParticle(
          enemy.x, 
          enemy.y, 
          VM_CONFIG.enemyColors[enemy.type], 
          enemy.type === 'bounty' ? 20 : 8
        );
        newState.particles = [...newState.particles, ...particles];
        
        // Give score (reduced since it's easy)
        const baseScore = enemy.type === 'bounty' ? 500 : 
                          enemy.type === 'elite' ? 100 :
                          enemy.type === 'shooter' ? 50 : 25;
        newState.score += baseScore;
        newState.enemiesDefeated++;
      }
      newState.enemies = [];
      newState.soundQueue = [...newState.soundQueue, 'explosion'];
      break;
      
    case 'doublePoints':
      newState.activePowerUps.doublePoints = VM_CONFIG.powerUpDuration;
      break;
      
    case 'doubleShot':
      newState.activePowerUps.doubleShot = VM_CONFIG.powerUpDuration;
      break;
      
    case 'speedBoost':
      newState.activePowerUps.speedBoost = VM_CONFIG.powerUpDuration;
      break;
  }
  
  return newState;
}

function checkCollisions(state: VectorState): VectorState {
  let newState = { ...state };
  
  // Player projectiles vs enemies
  const remainingProjectiles: VectorProjectile[] = [];
  
  for (const proj of newState.projectiles) {
    if (!proj.isPlayer) {
      remainingProjectiles.push(proj);
      continue;
    }
    
    let hit = false;
    let pierce = proj.pierce;
    
    for (let i = 0; i < newState.enemies.length; i++) {
      const enemy = newState.enemies[i];
      const dist = distance(proj.x, proj.y, enemy.x, enemy.y);
      
      if (dist < enemy.size + proj.size) {
        // Hit!
        newState.enemies[i] = {
          ...enemy,
          health: enemy.health - proj.damage,
        };
        
        hit = true;
        pierce--;
        newState.soundQueue = [...newState.soundQueue, 'hit'];
        
        // Create hit particles
        const particles = createParticle(proj.x, proj.y, VM_CONFIG.enemyColors[enemy.type], 3);
        newState.particles = [...newState.particles, ...particles];
        
        if (pierce <= 0) break;
      }
    }
    
    if (!hit || pierce > 0) {
      remainingProjectiles.push({ ...proj, pierce });
    }
  }
  
  newState.projectiles = remainingProjectiles;
  
  // Check dead enemies and spawn salvage
  const aliveEnemies: VectorEnemy[] = [];
  
  for (const enemy of newState.enemies) {
    if (enemy.health <= 0) {
      // Enemy killed
      newState.enemiesDefeated++;
      newState.combo++;
      newState.comboTimer = 120;
      
      // Score with combo bonus (doubled if power-up active)
      const baseScore = enemy.type === 'bounty' ? 1000 : 
                        enemy.type === 'elite' ? 200 :
                        enemy.type === 'shooter' ? 100 : 50;
      const pointMultiplier = newState.activePowerUps.doublePoints > 0 ? 2 : 1;
      newState.score += baseScore * (1 + newState.combo * 0.1) * pointMultiplier;
      
      // Chance to spawn power-up
      if (Math.random() < VM_CONFIG.powerUpSpawnChance) {
        const powerUp = createPowerUp(enemy.x, enemy.y);
        newState.powerups = [...newState.powerups, powerUp];
      }
      
      // Spawn salvage
      const dropChance = VM_CONFIG.salvageDropChance[enemy.type];
      if (Math.random() < dropChance) {
        const value = VM_CONFIG.salvageValue[enemy.type];
        const salvage = createSalvage(enemy.x, enemy.y, value);
        newState.salvage = [...newState.salvage, salvage];
      }
      
      // Extra salvage from bounty
      if (enemy.type === 'bounty') {
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2;
          const s = createSalvage(
            enemy.x + Math.cos(angle) * 20,
            enemy.y + Math.sin(angle) * 20,
            VM_CONFIG.salvageValue.bounty / 5
          );
          newState.salvage = [...newState.salvage, s];
        }
      }
      
      // Explosion particles
      const particles = createParticle(
        enemy.x, 
        enemy.y, 
        VM_CONFIG.enemyColors[enemy.type], 
        enemy.type === 'bounty' ? 20 : 8
      );
      newState.particles = [...newState.particles, ...particles];
      newState.soundQueue = [...newState.soundQueue, 'explosion'];
    } else {
      aliveEnemies.push(enemy);
    }
  }
  
  newState.enemies = aliveEnemies;
  
  // Enemy projectiles vs player
  if (newState.invulnerableTimer <= 0) {
    for (const proj of newState.projectiles) {
      if (proj.isPlayer) continue;
      
      const dist = distance(proj.x, proj.y, newState.playerX, newState.playerY);
      
      if (dist < VM_CONFIG.playerSize + proj.size) {
        newState = damagePlayer(newState, proj.damage);
        
        // Remove projectile
        newState.projectiles = newState.projectiles.filter(p => p.id !== proj.id);
        break;
      }
    }
  }
  
  // Enemies vs player (collision damage)
  if (newState.invulnerableTimer <= 0) {
    for (const enemy of newState.enemies) {
      const dist = distance(enemy.x, enemy.y, newState.playerX, newState.playerY);
      
      if (dist < VM_CONFIG.playerSize + enemy.size) {
        newState = damagePlayer(newState, 20);
        break;
      }
    }
  }
  
  return newState;
}

function damagePlayer(state: VectorState, damage: number): VectorState {
  let newState = { ...state };
  
  if (newState.shields > 0) {
    newState.shields--;
    newState.invulnerableTimer = 60;
    newState.soundQueue = [...newState.soundQueue, 'shield'];
    
    // Shield break particles
    const particles = createParticle(newState.playerX, newState.playerY, '#00aaff', 10);
    newState.particles = [...newState.particles, ...particles];
  } else {
    newState.health -= damage;
    newState.invulnerableTimer = 90;
    newState.soundQueue = [...newState.soundQueue, 'damage'];
    
    // Damage particles
    const particles = createParticle(newState.playerX, newState.playerY, '#ff0000', 5);
    newState.particles = [...newState.particles, ...particles];
  }
  
  return newState;
}

function completeWave(state: VectorState): VectorState {
  let newState = { ...state };
  
  newState.soundQueue = [...newState.soundQueue, 'waveComplete'];
  
  if (isFinalWave(state.currentWave)) {
    // Victory!
    newState.phase = 'victory';
    newState.score += 5000; // Victory bonus
  } else if (isLastWaveInSegment(state.currentWave)) {
    // Segment complete - show portal choice
    newState.phase = 'portalChoice';
    newState.currentSegment++;
    newState.score += 1000 * state.currentSegment;
  } else {
    // Wave complete - continue to next wave
    newState.phase = 'waveComplete';
    newState.phaseTimer = VM_CONFIG.waveTransitionTime;
    newState.score += 500 * state.currentWave;
  }
  
  return newState;
}

// Handle portal choice selection
export function selectPortal(state: VectorState, choice: 'safe' | 'risk'): VectorState {
  let newState = { ...state };
  
  newState.portalChoice = choice;
  
  // Difficulty scaling: more enemies and faster shooting (NOT speed increase)
  if (choice === 'safe') {
    newState.upgradesPending = 1;
    newState.difficultyMultiplier *= 1.1; // 10% more health/enemies
  } else {
    newState.upgradesPending = 2;
    newState.difficultyMultiplier *= 1.25; // 25% more health/enemies
  }
  
  newState.phase = 'upgradePick';
  newState.availableUpgrades = getRandomUpgrades(3);
  
  return newState;
}

// Handle upgrade selection
export function selectUpgrade(state: VectorState, upgradeId: string): VectorState {
  let newState = { ...state };
  
  // Find and apply the upgrade
  const upgrade = VECTOR_UPGRADES.find(u => u.id === upgradeId);
  if (upgrade) {
    newState.stats = upgrade.apply(newState.stats);
    
    // Apply shield upgrade to current shields
    if (upgradeId === 'shield') {
      newState.shields++;
    }
  }
  
  newState.upgradesPending--;
  
  if (newState.upgradesPending <= 0) {
    // All upgrades picked - continue to next wave
    newState.currentWave++;
    newState.enemiesSpawned = 0;
    newState.enemiesDefeated = 0;
    newState.enemiesInWave = getEnemiesForWave(newState.currentWave);
    newState.spawnTimer = 60;
    newState.phase = 'playing';
    newState.portalChoice = null;
  } else {
    // More upgrades to pick - refresh available upgrades
    newState.availableUpgrades = getRandomUpgrades(3);
  }
  
  return newState;
}

function getRandomUpgrades(count: number) {
  const shuffled = [...VECTOR_UPGRADES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
