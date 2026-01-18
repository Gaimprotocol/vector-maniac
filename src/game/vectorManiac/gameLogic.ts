// Vector Maniac Game Logic

import { VectorState, VectorEnemy, VectorProjectile, VECTOR_UPGRADES } from './types';
import { VM_CONFIG } from './constants';
import { 
  createDrone, 
  createShooter, 
  createElite, 
  createBounty,
  createPlayerProjectile, 
  createEnemyProjectile,
  createParticle,
  createSalvage 
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
  
  // Update player position (drag-to-move)
  if (input.isTouching) {
    newState.targetX = input.touchX;
    newState.targetY = input.touchY;
  }
  
  // Smooth movement towards target
  const dx = newState.targetX - newState.playerX;
  const dy = newState.targetY - newState.playerY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  // Track if player is moving (for shooting)
  const isMoving = dist > 4 && input.isTouching;
  
  if (dist > 2) {
    const moveSpeed = Math.min(newState.stats.speed, dist * 0.15);
    const dir = normalize(dx, dy);
    newState.playerX += dir.x * moveSpeed;
    newState.playerY += dir.y * moveSpeed;
    
    // Update player angle to face movement direction
    newState.playerAngle = lerpAngle(newState.playerAngle, Math.atan2(dy, dx), 0.15);
  }
  
  // Clamp to arena bounds
  const padding = VM_CONFIG.arenaPadding;
  newState.playerX = clamp(newState.playerX, padding, VM_CONFIG.arenaWidth - padding);
  newState.playerY = clamp(newState.playerY, padding, VM_CONFIG.arenaHeight - padding);
  
  // Update timers
  if (newState.fireTimer > 0) newState.fireTimer--;
  if (newState.invulnerableTimer > 0) newState.invulnerableTimer--;
  if (newState.comboTimer > 0) {
    newState.comboTimer--;
    if (newState.comboTimer <= 0) newState.combo = 0;
  }
  
  // Fire only while moving - shoot in movement direction from ship tip
  if (isMoving && newState.fireTimer <= 0) {
    // Calculate projectile spawn position at the tip of the ship
    const tipOffset = VM_CONFIG.playerSize + 8; // Spawn from ship tip
    const spawnX = newState.playerX + Math.cos(newState.playerAngle) * tipOffset;
    const spawnY = newState.playerY + Math.sin(newState.playerAngle) * tipOffset;
    
    const projectile = createPlayerProjectile(
      spawnX,
      spawnY,
      newState.playerAngle, // Shoot in movement direction
      newState.stats.bulletSpeed,
      newState.stats.damage,
      newState.stats.pierce
    );
    newState.projectiles = [...newState.projectiles, projectile];
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
  newState.particles = updateParticles(newState.particles);
  
  // Check collisions
  newState = checkCollisions(newState);
  
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
    // Spawn bounty boss
    const bounty = createBounty();
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
        // Bounty boss circles and fires patterns
        e.behaviorTimer++;
        const orbitAngle = e.behaviorTimer * 0.02;
        const orbitRadius = 100;
        const targetX = VM_CONFIG.arenaWidth / 2 + Math.cos(orbitAngle) * orbitRadius;
        const targetY = VM_CONFIG.arenaHeight / 2 + Math.sin(orbitAngle) * orbitRadius;
        
        e.vx = lerp(e.vx, (targetX - e.x) * 0.02, 0.1);
        e.vy = lerp(e.vy, (targetY - e.y) * 0.02, 0.1);
        
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
    
    // Keep in bounds (with some leeway for spawning)
    const margin = 50;
    if (e.x > -margin && e.x < VM_CONFIG.arenaWidth + margin &&
        e.y > -margin && e.y < VM_CONFIG.arenaHeight + margin) {
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
    
    // Keep if in bounds
    if (p.x > -20 && p.x < VM_CONFIG.arenaWidth + 20 &&
        p.y > -20 && p.y < VM_CONFIG.arenaHeight + 20) {
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
      
      // Score with combo bonus
      const baseScore = enemy.type === 'bounty' ? 1000 : 
                        enemy.type === 'elite' ? 200 :
                        enemy.type === 'shooter' ? 100 : 50;
      newState.score += baseScore * (1 + newState.combo * 0.1);
      
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
  
  if (choice === 'safe') {
    newState.upgradesPending = 1;
    newState.difficultyMultiplier *= 1.05;
  } else {
    newState.upgradesPending = 2;
    newState.difficultyMultiplier *= 1.15;
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
