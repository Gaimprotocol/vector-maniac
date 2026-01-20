// Vector Maniac Game Logic

import { VectorState, VectorEnemy, VectorProjectile, VECTOR_UPGRADES, VectorPowerUp } from './types';
import { VM_CONFIG } from './constants';
import { 
  createDrone, 
  createShooter, 
  createElite, 
  createBounty,
  createBoss,
  createPlayerProjectile, 
  createEnemyProjectile,
  createParticle,
  createSalvage,
  createPowerUp
} from './entities';
import { getEnemiesForWave, isLastWaveInMap, isFinalMap, getRandomWavesForMap } from './state';
import { distance, lerp, lerpAngle, clamp, normalize } from './utils';
import { playVectorSound, playGameStartVoice, resetGameStartVoice } from './sounds';
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
  
  // Play game start voice at the beginning of the entering phase
  if (state.phaseTimer === 120) {
    playGameStartVoice();
  }

  // Map name timer (so map info can show during the intro too)
  if (newState.mapNameTimer > 0) {
    newState.mapNameTimer--;
    if (newState.mapNameTimer <= 0) {
      newState.showMapName = false;
    }
  }
  
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
  
  // Track if player is touching (for shooting)
  const isShooting = input.isTouching;
  
  if (dist > 2) {
    // Fast response: move 50% of distance each frame for snappy controls
    const moveSpeed = Math.min(newState.stats.speed * 3, dist * 0.5);
    const dir = normalize(dx, dy);
    newState.playerX += dir.x * moveSpeed;
    newState.playerY += dir.y * moveSpeed;
    
    // Update player angle to face movement direction (faster rotation too)
    newState.playerAngle = lerpAngle(newState.playerAngle, Math.atan2(dy, dx), 0.3);
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

  // Map name timer (allows map info to stay visible into the playing phase)
  if (newState.mapNameTimer > 0) {
    newState.mapNameTimer--;
    if (newState.mapNameTimer <= 0) {
      newState.showMapName = false;
    }
  }
  
  // Update active power-up timers
  if (newState.activePowerUps.doublePoints > 0) newState.activePowerUps.doublePoints--;
  if (newState.activePowerUps.doubleShot > 0) newState.activePowerUps.doubleShot--;
  if (newState.activePowerUps.speedBoost > 0) newState.activePowerUps.speedBoost--;
  
  // Apply speed boost
  const effectiveSpeed = newState.activePowerUps.speedBoost > 0 
    ? newState.stats.speed * 1.5 
    : newState.stats.speed;
  
  // Fire while touching - shoot in facing direction from ship tip
  if (isShooting && newState.fireTimer <= 0) {
    // Calculate projectile spawn position at the tip of the ship
    const tipOffset = VM_CONFIG.playerSize + 8; // Spawn from ship tip
    const spawnX = newState.playerX + Math.cos(newState.playerAngle) * tipOffset;
    const spawnY = newState.playerY + Math.sin(newState.playerAngle) * tipOffset;
    
    const newProjectiles: VectorProjectile[] = [];
    
    // Check if double shot is active
    if (newState.activePowerUps.doubleShot > 0) {
      // Shoot two projectiles with slight angle offset (tighter spread)
      const spreadAngle = 0.08;
      newProjectiles.push(createPlayerProjectile(
        spawnX,
        spawnY,
        newState.playerAngle - spreadAngle,
        newState.stats.bulletSpeed,
        newState.stats.damage,
        newState.stats.pierce
      ));
      newProjectiles.push(createPlayerProjectile(
        spawnX,
        spawnY,
        newState.playerAngle + spreadAngle,
        newState.stats.bulletSpeed,
        newState.stats.damage,
        newState.stats.pierce
      ));
    } else {
      newProjectiles.push(createPlayerProjectile(
        spawnX,
        spawnY,
        newState.playerAngle,
        newState.stats.bulletSpeed,
        newState.stats.damage,
        newState.stats.pierce
      ));
    }
    
    // Fire extra cannons (from permanent upgrades)
    const extraCannons = newState.stats.extraCannons || 0;
    if (extraCannons > 0) {
      // Each extra cannon fires from the side of the ship
      for (let i = 0; i < Math.min(extraCannons, 4); i++) {
        // Alternate sides: even = right, odd = left
        const side = i % 2 === 0 ? 1 : -1;
        const tier = Math.floor(i / 2); // 0 for first pair, 1 for second pair
        
        // Calculate perpendicular offset from ship angle
        const perpAngle = newState.playerAngle + (Math.PI / 2) * side;
        const sideOffset = 8 + tier * 6; // Distance from center
        const backOffset = -4 - tier * 3; // How far back the cannon is
        
        // Calculate spawn position
        const cannonX = newState.playerX + 
          Math.cos(newState.playerAngle) * backOffset +
          Math.cos(perpAngle) * sideOffset;
        const cannonY = newState.playerY + 
          Math.sin(newState.playerAngle) * backOffset +
          Math.sin(perpAngle) * sideOffset;
        
        // Extra cannons fire forward with slight spread
        const cannonAngle = newState.playerAngle + (side * 0.15 * (tier + 1));
        
        newProjectiles.push(createPlayerProjectile(
          cannonX,
          cannonY,
          cannonAngle,
          newState.stats.bulletSpeed * 0.9, // Slightly slower
          newState.stats.damage * 0.7, // Less damage
          Math.max(0, newState.stats.pierce - 1) // Less pierce
        ));
      }
    }
    
    newState.projectiles = [...newState.projectiles, ...newProjectiles];
    newState.fireTimer = newState.stats.fireRate;
    newState.soundQueue = [...newState.soundQueue, 'shoot'];
  }
  
  // Spawn enemies
  if (newState.spawnTimer > 0) {
    newState.spawnTimer--;
  } else {
    const lastWave = isLastWaveInMap(newState);

    // On the last wave of a map: spawn normal enemies first, then spawn the boss as the финал.
    const shouldSpawnBossNow =
      lastWave &&
      newState.enemiesSpawned >= newState.enemiesInWave &&
      !newState.bossActive &&
      !newState.bossDefeated;

    if (shouldSpawnBossNow) {
      const boss = createBoss(newState.currentMap, newState.currentLevel);
      boss.health *= newState.difficultyMultiplier;
      boss.maxHealth = boss.health;
      newState.enemies = [...newState.enemies, boss];
      newState.bossActive = true;
      newState.spawnTimer = 30; // small breather before boss starts firing/moving fully
    } else if (!newState.bossActive && newState.enemiesSpawned < newState.enemiesInWave) {
      newState = spawnEnemy(newState);
      newState.spawnTimer = VM_CONFIG.spawnInterval;
    }
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
  // Last wave of a map: must clear the wave enemies AND defeat the boss.
  // Regular waves: clear the wave enemies.
  const isLastWave = isLastWaveInMap(newState);
  const waveComplete = isLastWave
    ? newState.bossDefeated && newState.enemiesDefeated >= newState.enemiesInWave + 1 && newState.enemies.length === 0
    : newState.enemiesDefeated >= newState.enemiesInWave && newState.enemies.length === 0;

  if (waveComplete) {
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
  
  // Update map name timer
  if (newState.mapNameTimer > 0) {
    newState.mapNameTimer--;
    if (newState.mapNameTimer <= 0) {
      newState.showMapName = false;
    }
  }
  
  newState.particles = updateParticles(newState.particles);
  
  if (newState.phaseTimer <= 0) {
    // Advance to next wave within this map
    newState.currentWave++;
    newState.enemiesSpawned = 0;
    newState.enemiesDefeated = 0;
    newState.enemiesInWave = getEnemiesForWave(newState.totalWavesCompleted, newState.currentLevel);
    newState.spawnTimer = 30;
    newState.bossActive = false;
    newState.bossDefeated = false;
    // Keep showMapName controlled by mapNameTimer so map info can remain on-screen
    newState.phase = 'playing';
  }
  
  return newState;
}

function spawnEnemy(state: VectorState): VectorState {
  let newState = { ...state };

  // Never spawn regular enemies while a boss is active
  if (state.bossActive) return newState;

  // Determine enemy type based on map progression
  const roll = Math.random();
  let enemy: VectorEnemy;

  // More variety as maps progress
  const eliteChance = Math.min(0.25, 0.05 + state.currentMap * 0.004);
  const shooterChance = Math.min(0.5, 0.3 + state.currentMap * 0.004);

  if (roll < eliteChance) {
    enemy = createElite(state.playerX, state.playerY);
  } else if (roll < shooterChance) {
    enemy = createShooter(state.playerX, state.playerY);
  } else {
    enemy = createDrone(state.playerX, state.playerY);
  }

  // Apply difficulty scaling (increases with level)
  const levelScaling = 1 + (state.currentLevel - 1) * (VM_CONFIG.levelDifficultyMultiplier - 1);
  enemy.health *= state.difficultyMultiplier * levelScaling;
  enemy.maxHealth = enemy.health;

  newState.enemies = [...newState.enemies, enemy];
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
        
      case 'boss': {
        // Map boss - varied behavior based on behaviorTimer (stores mapId)
        const mapId = Math.floor(e.behaviorTimer / 1000) || 1;
        e.behaviorTimer = (e.behaviorTimer % 1000) + 1000 * mapId;
        const bossTime = e.behaviorTimer % 1000;
        
        // Different movement patterns based on map - 10 unique patterns
        const patternType = mapId % 10;
        
        switch (patternType) {
          case 0: // Orbiting pattern - circles around center
            const bossOrbitAngle = bossTime * 0.015;
            const bossOrbitRadius = 120 + Math.sin(bossTime * 0.02) * 40;
            const bossTargetX = VM_CONFIG.arenaWidth / 2 + Math.cos(bossOrbitAngle) * bossOrbitRadius;
            const bossTargetY = VM_CONFIG.arenaHeight / 2 + Math.sin(bossOrbitAngle) * bossOrbitRadius;
            e.vx = lerp(e.vx, (bossTargetX - e.x) * 0.02, 0.1);
            e.vy = lerp(e.vy, (bossTargetY - e.y) * 0.02, 0.1);
            break;
            
          case 1: // Aggressive chase - hunts the player
            const chaseDir = normalize(dx, dy);
            e.vx = lerp(e.vx, chaseDir.x * 2.0, 0.04);
            e.vy = lerp(e.vy, chaseDir.y * 2.0, 0.04);
            break;
            
          case 2: // Figure-8 pattern - graceful sweeping
            const fig8Time = bossTime * 0.01;
            const fig8X = VM_CONFIG.arenaWidth / 2 + Math.sin(fig8Time * 2) * 150;
            const fig8Y = VM_CONFIG.arenaHeight / 2 + Math.sin(fig8Time) * 200;
            e.vx = lerp(e.vx, (fig8X - e.x) * 0.03, 0.1);
            e.vy = lerp(e.vy, (fig8Y - e.y) * 0.03, 0.1);
            break;
            
          case 3: // Teleport dash - sudden lunges
            if (bossTime % 120 < 5) {
              const dashDir = normalize(dx, dy);
              e.vx = dashDir.x * 10;
              e.vy = dashDir.y * 10;
            } else {
              e.vx *= 0.92;
              e.vy *= 0.92;
            }
            break;
            
          case 4: // Zigzag pattern - erratic movement
            const zigzagPhase = Math.floor(bossTime / 60) % 2;
            const zigDir = normalize(dx, dy);
            const perpX = -zigDir.y;
            const perpY = zigDir.x;
            const zigOffset = zigzagPhase === 0 ? 1 : -1;
            e.vx = lerp(e.vx, (zigDir.x + perpX * zigOffset * 0.5) * 2.5, 0.06);
            e.vy = lerp(e.vy, (zigDir.y + perpY * zigOffset * 0.5) * 2.5, 0.06);
            break;
            
          case 5: // Hover and strafe - stays at distance
            const distToPlayer = Math.sqrt(dx * dx + dy * dy);
            const idealDist = 180;
            const strafeAngle = Math.atan2(dy, dx) + Math.PI / 2;
            const strafeSpeed = Math.sin(bossTime * 0.03) * 2;
            if (distToPlayer < idealDist - 30) {
              e.vx = lerp(e.vx, -normalize(dx, dy).x * 1.5, 0.05);
              e.vy = lerp(e.vy, -normalize(dx, dy).y * 1.5, 0.05);
            } else if (distToPlayer > idealDist + 30) {
              e.vx = lerp(e.vx, normalize(dx, dy).x * 1.5, 0.05);
              e.vy = lerp(e.vy, normalize(dx, dy).y * 1.5, 0.05);
            } else {
              e.vx = lerp(e.vx, Math.cos(strafeAngle) * strafeSpeed, 0.08);
              e.vy = lerp(e.vy, Math.sin(strafeAngle) * strafeSpeed, 0.08);
            }
            break;
            
          case 6: // Wave motion - sinusoidal approach
            const waveApproach = normalize(dx, dy);
            const waveAmplitude = Math.sin(bossTime * 0.05) * 3;
            e.vx = lerp(e.vx, waveApproach.x * 1.2 + waveApproach.y * waveAmplitude, 0.04);
            e.vy = lerp(e.vy, waveApproach.y * 1.2 - waveApproach.x * waveAmplitude, 0.04);
            break;
            
          case 7: // Stationary turret - minimal movement, heavy fire
            const turretCenterX = VM_CONFIG.arenaWidth / 2;
            const turretCenterY = VM_CONFIG.arenaHeight / 3;
            e.vx = lerp(e.vx, (turretCenterX - e.x) * 0.01, 0.1);
            e.vy = lerp(e.vy, (turretCenterY - e.y) * 0.01, 0.1);
            break;
            
          case 8: // Meteor boss - swoops from above
            const meteorPhase = Math.floor(bossTime / 180) % 3;
            if (meteorPhase === 0) {
              // Rise up
              e.vx = lerp(e.vx, 0, 0.1);
              e.vy = lerp(e.vy, -3, 0.05);
            } else if (meteorPhase === 1) {
              // Dive at player
              const diveDir = normalize(dx, dy);
              e.vx = lerp(e.vx, diveDir.x * 5, 0.08);
              e.vy = lerp(e.vy, diveDir.y * 5, 0.08);
            } else {
              // Recover
              e.vx *= 0.95;
              e.vy *= 0.95;
            }
            break;
            
          case 9: // Spiral outward - expands then contracts
            const spiralPhase = (bossTime % 300) / 300;
            const spiralRadius = 50 + spiralPhase * 150;
            const spiralAngleM = bossTime * 0.02;
            const spiralTargetX = VM_CONFIG.arenaWidth / 2 + Math.cos(spiralAngleM) * spiralRadius;
            const spiralTargetY = VM_CONFIG.arenaHeight / 2 + Math.sin(spiralAngleM) * spiralRadius;
            e.vx = lerp(e.vx, (spiralTargetX - e.x) * 0.04, 0.1);
            e.vy = lerp(e.vy, (spiralTargetY - e.y) * 0.04, 0.1);
            break;
        }
        
        // Fire patterns based on map
        e.fireTimer--;
        if (e.fireTimer <= 0) {
          const firePattern = mapId % 10;
          const playerAngle = Math.atan2(dy, dx);
          
          switch (firePattern) {
            case 0: // Ring of bullets - expanding circle
              for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2;
                const proj = createEnemyProjectile(
                  e.x + Math.cos(angle) * 25,
                  e.y + Math.sin(angle) * 25,
                  e.x + Math.cos(angle) * 300,
                  e.y + Math.sin(angle) * 300
                );
                newState.projectiles = [...newState.projectiles, proj];
              }
              break;
              
            case 1: // Aimed spread shot - 5 bullets in a fan
              for (let i = -2; i <= 2; i++) {
                const angle = playerAngle + i * 0.15;
                const proj = createEnemyProjectile(
                  e.x, e.y,
                  e.x + Math.cos(angle) * 200,
                  e.y + Math.sin(angle) * 200
                );
                newState.projectiles = [...newState.projectiles, proj];
              }
              break;
              
            case 2: // Spiral burst - rotating pattern
              const spiralAngle = bossTime * 0.12;
              for (let i = 0; i < 4; i++) {
                const angle = spiralAngle + (i / 4) * Math.PI * 2;
                const proj = createEnemyProjectile(
                  e.x + Math.cos(angle) * 20,
                  e.y + Math.sin(angle) * 20,
                  e.x + Math.cos(angle) * 250,
                  e.y + Math.sin(angle) * 250
                );
                newState.projectiles = [...newState.projectiles, proj];
              }
              break;
              
            case 3: // Cross pattern - 4 cardinal directions
              for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2;
                const proj = createEnemyProjectile(
                  e.x + Math.cos(angle) * 20,
                  e.y + Math.sin(angle) * 20,
                  e.x + Math.cos(angle) * 250,
                  e.y + Math.sin(angle) * 250
                );
                newState.projectiles = [...newState.projectiles, proj];
              }
              break;
              
            case 4: // Shotgun blast - tight cluster aimed at player
              for (let i = 0; i < 7; i++) {
                const spreadAngle = playerAngle + (Math.random() - 0.5) * 0.4;
                const spreadDist = 150 + Math.random() * 100;
                const proj = createEnemyProjectile(
                  e.x, e.y,
                  e.x + Math.cos(spreadAngle) * spreadDist,
                  e.y + Math.sin(spreadAngle) * spreadDist
                );
                newState.projectiles = [...newState.projectiles, proj];
              }
              break;
              
            case 5: // Double helix - two intertwined spirals
              const helixAngle1 = bossTime * 0.08;
              const helixAngle2 = bossTime * 0.08 + Math.PI;
              for (const baseAngle of [helixAngle1, helixAngle2]) {
                const proj = createEnemyProjectile(
                  e.x + Math.cos(baseAngle) * 30,
                  e.y + Math.sin(baseAngle) * 30,
                  e.x + Math.cos(baseAngle) * 200,
                  e.y + Math.sin(baseAngle) * 200
                );
                newState.projectiles = [...newState.projectiles, proj];
              }
              break;
              
            case 6: // Wave attack - horizontal sweeping bullets
              const waveOffset = Math.sin(bossTime * 0.1) * 0.8;
              for (let i = -1; i <= 1; i++) {
                const angle = playerAngle + waveOffset + i * 0.3;
                const proj = createEnemyProjectile(
                  e.x, e.y,
                  e.x + Math.cos(angle) * 200,
                  e.y + Math.sin(angle) * 200
                );
                newState.projectiles = [...newState.projectiles, proj];
              }
              break;
              
            case 7: // Gatling gun - rapid single shots aimed at player
              const gatlingSpread = (Math.random() - 0.5) * 0.15;
              const gatlingProj = createEnemyProjectile(
                e.x, e.y,
                e.x + Math.cos(playerAngle + gatlingSpread) * 250,
                e.y + Math.sin(playerAngle + gatlingSpread) * 250
              );
              newState.projectiles = [...newState.projectiles, gatlingProj];
              // Faster fire rate for gatling
              e.fireTimer = Math.floor(VM_CONFIG.bossFireRate * 0.3);
              break;
              
            case 8: // Meteor shower - random positions falling down
              for (let i = 0; i < 3; i++) {
                const startX = e.x + (Math.random() - 0.5) * 200;
                const proj = createEnemyProjectile(
                  startX, e.y - 50,
                  startX + (Math.random() - 0.5) * 50,
                  e.y + 300
                );
                newState.projectiles = [...newState.projectiles, proj];
              }
              break;
              
            case 9: // Star burst - 8-pointed star pattern
              for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + bossTime * 0.02;
                const proj = createEnemyProjectile(
                  e.x + Math.cos(angle) * 25,
                  e.y + Math.sin(angle) * 25,
                  e.x + Math.cos(angle) * 280,
                  e.y + Math.sin(angle) * 280
                );
                newState.projectiles = [...newState.projectiles, proj];
              }
              break;
          }
          
          // Only reset timer if not already set (gatling gun sets its own)
          if (firePattern !== 7) {
            e.fireTimer = VM_CONFIG.bossFireRate;
          }
        }
        break;
      }
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
      
      // Heal player when collecting salvage
      if (salvage.isRare) {
        // Rare pod gives full health
        newState.health = VM_CONFIG.playerMaxHealth;
        newState.soundQueue = [...newState.soundQueue, 'rareSalvage'];
      } else {
        // Normal pod gives small heal
        const healAmount = 5;
        newState.health = Math.min(newState.health + healAmount, VM_CONFIG.playerMaxHealth);
        newState.soundQueue = [...newState.soundQueue, 'salvage'];
      }
      
      // Create pickup particles (gold for rare, green for normal)
      const particleColor = salvage.isRare ? '#ffdd44' : '#00ff88';
      const particles = createParticle(salvage.x, salvage.y, particleColor, salvage.isRare ? 8 : 3);
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
    
    // Bounce off walls
    if (p.x < VM_CONFIG.arenaPadding || p.x > VM_CONFIG.arenaWidth - VM_CONFIG.arenaPadding) {
      p.vx *= -1;
      p.x = clamp(p.x, VM_CONFIG.arenaPadding, VM_CONFIG.arenaWidth - VM_CONFIG.arenaPadding);
    }
    if (p.y < VM_CONFIG.arenaPadding || p.y > VM_CONFIG.arenaHeight - VM_CONFIG.arenaPadding) {
      p.vy *= -1;
      p.y = clamp(p.y, VM_CONFIG.arenaPadding, VM_CONFIG.arenaHeight - VM_CONFIG.arenaPadding);
    }
    
    // Keep if still alive
    if (p.life > 0) {
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
          enemy.type === 'bounty' || enemy.type === 'boss' ? 20 : 8
        );
        newState.particles = [...newState.particles, ...particles];
        
        // Check if this was the boss
        if (enemy.type === 'boss') {
          newState.bossDefeated = true;
          newState.bossActive = false;
          
          // Boss reward: spawn 5-10 salvage pieces
          const bossRewardCount = 5 + Math.floor(Math.random() * 6);
          for (let i = 0; i < bossRewardCount; i++) {
            const angle = (i / bossRewardCount) * Math.PI * 2;
            const dist = 30 + Math.random() * 20;
            const salvage = createSalvage(
              enemy.x + Math.cos(angle) * dist,
              enemy.y + Math.sin(angle) * dist,
              VM_CONFIG.salvageValue.elite,
              Math.random() < 0.3
            );
            newState.salvage = [...newState.salvage, salvage];
          }
        }
        
        // Give score (reduced since it's easy)
        const baseScore = enemy.type === 'boss' ? 1000 :
                          enemy.type === 'bounty' ? 500 : 
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
      
      // Check if this was the boss
      if (enemy.type === 'boss') {
        newState.bossDefeated = true;
        newState.bossActive = false;
        
        // Boss reward: spawn 5-10 salvage pieces
        const bossRewardCount = 5 + Math.floor(Math.random() * 6);
        for (let i = 0; i < bossRewardCount; i++) {
          const angle = (i / bossRewardCount) * Math.PI * 2;
          const distance = 30 + Math.random() * 20;
          const salvage = createSalvage(
            enemy.x + Math.cos(angle) * distance,
            enemy.y + Math.sin(angle) * distance,
            VM_CONFIG.salvageValue.elite, // Use elite value for boss reward
            Math.random() < 0.3 // 30% chance for rare salvage
          );
          newState.salvage = [...newState.salvage, salvage];
        }
      }
      
      // Score with combo bonus (doubled if power-up active)
      const baseScore = enemy.type === 'boss' ? 2000 :
                        enemy.type === 'bounty' ? 1000 : 
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
  newState.totalWavesCompleted++;
  newState.bossDefeated = true;
  newState.bossActive = false;
  
  // Check if this is the last wave in current map
  if (isLastWaveInMap(state)) {
    // Map complete! Move to next map
    newState.totalMapsCompleted++;
    newState.score += 1000 * state.currentMap;
    
    // Check if this was the final map (50)
    if (isFinalMap(state.currentMap)) {
      // All 50 maps complete - increase level and restart
      newState.currentLevel++;
      newState.currentMap = 1;
      newState.difficultyMultiplier *= VM_CONFIG.levelDifficultyMultiplier;
      newState.score += 10000 * newState.currentLevel; // Big level bonus
    } else {
      // Move to next map
      newState.currentMap++;
    }
    
    // Setup for new map
    newState.currentWave = 1;
    newState.wavesInMap = getRandomWavesForMap();
    newState.enemiesSpawned = 0;
    newState.enemiesDefeated = 0;
    newState.enemiesInWave = getEnemiesForWave(newState.totalWavesCompleted, newState.currentLevel);
    newState.spawnTimer = 60;
    newState.bossActive = false;
    newState.bossDefeated = false;
    
    // Show new map name
    newState.showMapName = true;
    newState.mapNameTimer = 156; // ~2.6 seconds (same as wave complete)
    
    // Upgrade pick after every boss (map completion)
    newState.upgradesPending = 1;
    newState.availableUpgrades = getRandomUpgrades(3);
    newState.phase = 'upgradePick';
  } else {
    // Wave complete - continue to next wave in map
    newState.phase = 'waveComplete';
    newState.phaseTimer = VM_CONFIG.waveTransitionTime;
    newState.score += 500 * newState.totalWavesCompleted;
  }
  
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
    // All upgrades picked - continue to next map
    newState.phase = 'waveComplete';
    newState.phaseTimer = VM_CONFIG.mapTransitionTime;
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
