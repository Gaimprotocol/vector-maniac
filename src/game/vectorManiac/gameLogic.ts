// Vector Maniac Game Logic

import { VectorState, VectorEnemy, VectorProjectile, VECTOR_UPGRADES, VectorPowerUp } from './types';
import { VM_CONFIG } from './constants';
import { 
  createDrone, 
  createShooter, 
  createElite, 
  createBounty,
  createBoss,
  createMiniBoss,
  createPlayerProjectile, 
  createEnemyProjectile,
  createParticle,
  createSalvage,
  createPowerUp,
  createHyperspacePowerUp
} from './entities';
import { getEnemiesForWave, isLastWaveInMap, isFinalMap, getRandomWavesForMap, getNextHyperspaceMapTarget, shouldTriggerHyperspace } from './state';
import { distance, lerp, lerpAngle, clamp, normalize } from './utils';
import { playVectorSound, playGameStartVoice, resetGameStartVoice } from './sounds';
import { getStoredMegaShipId } from '@/hooks/useMegaShips';
import { getShipProjectileStyle } from './shipProjectiles';

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
      newState = updateWaveCompletePhase(newState, input);
      break;
    case 'hyperspaceEnter':
      newState = updateHyperspaceEnterPhase(newState, input);
      break;
    case 'hyperspace':
      newState = updateHyperspacePhase(newState, input);
      break;
    case 'hyperspaceExit':
      newState = updateHyperspaceExitPhase(newState, input);
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

// Core playing logic that can be used during wave transitions too
function updatePlayingPhaseCore(state: VectorState, input: VectorInput, spawnEnemies: boolean): VectorState {
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
  
  // Update boss enraged timer
  if (newState.bossEnragedTimer > 0) newState.bossEnragedTimer--;
  
  // Decay screen shake
  if (newState.screenShakeIntensity > 0) {
    newState.screenShakeIntensity = Math.max(0, newState.screenShakeIntensity - 0.5);
  }
  
  // Apply speed boost
  const effectiveSpeed = newState.activePowerUps.speedBoost > 0 
    ? newState.stats.speed * 1.5 
    : newState.stats.speed;
  
  // Fire while touching - shoot in facing direction from ship tip
  if (isShooting && newState.fireTimer <= 0) {
    // Get current ship ID for projectile styling
    const shipId = getStoredMegaShipId();
    const projectileStyle = getShipProjectileStyle(shipId);
    
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
        newState.stats.pierce,
        shipId
      ));
      newProjectiles.push(createPlayerProjectile(
        spawnX,
        spawnY,
        newState.playerAngle + spreadAngle,
        newState.stats.bulletSpeed,
        newState.stats.damage,
        newState.stats.pierce,
        shipId
      ));
    } else {
      newProjectiles.push(createPlayerProjectile(
        spawnX,
        spawnY,
        newState.playerAngle,
        newState.stats.bulletSpeed,
        newState.stats.damage,
        newState.stats.pierce,
        shipId
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
          Math.max(0, newState.stats.pierce - 1), // Less pierce
          shipId
        ));
      }
    }
    
    newState.projectiles = [...newState.projectiles, ...newProjectiles];
    newState.fireTimer = newState.stats.fireRate;
    // Use ship-specific shoot sound
    newState.soundQueue = [...newState.soundQueue, `shoot_${projectileStyle.sound}`];
  }
  
  // Spawn enemies (only during playing phase, not during wave transitions)
  if (spawnEnemies) {
    if (newState.spawnTimer > 0) {
      newState.spawnTimer--;
    } else {
      const lastWave = isLastWaveInMap(newState);

      // On the last wave of a map: spawn normal enemies first, then trigger boss warning, then spawn boss
      const shouldTriggerBossWarning =
        lastWave &&
        newState.enemiesSpawned >= newState.enemiesInWave &&
        !newState.bossActive &&
        !newState.bossDefeated &&
        !newState.bossWarning &&
        newState.bossWarningTimer <= 0;

      const shouldSpawnBossNow =
        lastWave &&
        newState.enemiesSpawned >= newState.enemiesInWave &&
        !newState.bossActive &&
        !newState.bossDefeated &&
        newState.bossWarning &&
        newState.bossWarningTimer <= 0;
      
      // Mini-boss spawns in mid-wave (wave 2 of 3-wave maps)
      const isMiddleWave = newState.wavesInMap >= 3 && newState.currentWave === 2;
      const minibossExists = newState.enemies.some(e => e.type === 'miniboss');
      const shouldSpawnMiniBoss = isMiddleWave && 
        newState.enemiesSpawned >= Math.floor(newState.enemiesInWave / 2) && 
        !minibossExists &&
        newState.enemiesDefeated >= Math.floor(newState.enemiesInWave / 3);

      if (shouldTriggerBossWarning) {
        // Start boss warning phase - 120 frames (~2 seconds)
        newState.bossWarning = true;
        newState.bossWarningTimer = 120;
        newState.soundQueue = [...newState.soundQueue, 'bossWarning'];
      } else if (newState.bossWarning && newState.bossWarningTimer > 0) {
        // Warning countdown in progress
        newState.bossWarningTimer--;
      } else if (shouldSpawnBossNow) {
        const boss = createBoss(newState.currentMap, newState.currentLevel);
        boss.health *= newState.difficultyMultiplier;
        boss.maxHealth = boss.health;
        newState.enemies = [...newState.enemies, boss];
        newState.bossActive = true;
        newState.bossWarning = false; // Clear warning flag
        newState.spawnTimer = 30; // small breather before boss starts firing/moving fully
      } else if (shouldSpawnMiniBoss) {
        // Spawn mini-boss in middle of longer maps
        const miniboss = createMiniBoss(newState.playerX, newState.playerY, newState.currentMap);
        // Scale with difficulty
        const levelScaling = 1 + (newState.currentLevel - 1) * (VM_CONFIG.levelDifficultyMultiplier - 1);
        const mapScaling = 1 + (newState.currentMap - 1) * VM_CONFIG.enemyHealthPerMap;
        miniboss.health *= newState.difficultyMultiplier * levelScaling * mapScaling;
        miniboss.maxHealth = miniboss.health;
        newState.enemies = [...newState.enemies, miniboss];
        newState.soundQueue = [...newState.soundQueue, 'elite']; // Use elite sound as warning
        newState.spawnTimer = VM_CONFIG.spawnInterval * 2; // Extra delay after mini-boss spawn
      } else if (!newState.bossActive && !newState.bossWarning && newState.enemiesSpawned < newState.enemiesInWave) {
        newState = spawnEnemy(newState);
        newState.spawnTimer = VM_CONFIG.spawnInterval;
      }
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
  
  return newState;
}

function updatePlayingPhase(state: VectorState, input: VectorInput): VectorState {
  let newState = updatePlayingPhaseCore(state, input, true);
  
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

function updateWaveCompletePhase(state: VectorState, input: VectorInput): VectorState {
  let newState = { ...state };
  newState.phaseTimer--;
  
  // Update map name timer
  if (newState.mapNameTimer > 0) {
    newState.mapNameTimer--;
    if (newState.mapNameTimer <= 0) {
      newState.showMapName = false;
    }
  }
  
  if (newState.phaseTimer <= 0) {
    // Advance to next wave within this map
    newState.currentWave++;
    newState.enemiesSpawned = 0;
    newState.enemiesDefeated = 0;
    newState.enemiesInWave = getEnemiesForWave(newState.totalWavesCompleted, newState.currentLevel, newState.currentMap);
    newState.spawnTimer = 30;
    newState.bossActive = false;
    newState.bossDefeated = false;
    newState.bossWarning = false;
    newState.bossWarningTimer = 0;
    newState.bossEnraged = false;      // Reset for next boss
    newState.bossEnragedTimer = 0;
    // Keep showMapName controlled by mapNameTimer so map info can remain on-screen
    newState.phase = 'playing';
  }
  
  // Continue running game logic during wave transition (player, projectiles, particles)
  // but don't spawn new enemies
  newState = updatePlayingPhaseCore(newState, input, false);
  
  return newState;
}

// ============= HYPERSPACE MODE =============

function updateHyperspaceEnterPhase(state: VectorState, input: VectorInput): VectorState {
  let newState = { ...state };
  newState.phaseTimer--;
  
  // Smooth transition progress
  const transitionDuration = VM_CONFIG.hyperspaceTransitionDuration;
  newState.hyperspaceTransitionProgress = 1 - (newState.phaseTimer / transitionDuration);
  
  // Start scrolling background during transition
  newState.hyperspaceScrollOffset += VM_CONFIG.hyperspaceScrollSpeed * newState.hyperspaceTransitionProgress;
  
  // Smoothly move player to hyperspace position (bottom center, facing up)
  const targetY = newState.hyperspacePlayerBaseY;
  const targetX = VM_CONFIG.arenaWidth / 2;
  newState.playerX = lerp(newState.playerX, targetX, 0.05);
  newState.playerY = lerp(newState.playerY, targetY, 0.05);
  newState.playerAngle = lerpAngle(newState.playerAngle, -Math.PI / 2, 0.1); // Face up
  
  // Update particles and projectiles
  newState.particles = updateParticles(newState.particles);
  newState = updateProjectiles(newState);
  
  // Create speed effect particles
  if (newState.gameTime % 2 === 0) {
    const particles = createParticle(
      Math.random() * VM_CONFIG.arenaWidth,
      0,
      '#00ffff',
      1
    );
    particles.forEach(p => {
      p.vy = 15 + Math.random() * 10; // Fast downward motion
      p.vx = 0;
      p.life = 60;
      p.maxLife = 60;
    });
    newState.particles = [...newState.particles, ...particles];
  }
  
  if (newState.phaseTimer <= 0) {
    newState.phase = 'hyperspace';
    newState.hyperspaceTransitionProgress = 1;
    newState.soundQueue = [...newState.soundQueue, 'waveComplete'];
  }
  
  return newState;
}

function updateHyperspacePhase(state: VectorState, input: VectorInput): VectorState {
  let newState = { ...state };
  
  // Count down hyperspace timer
  newState.hyperspaceTimer--;
  
  // Play periodic engine pulse sound
  if (newState.gameTime % 120 === 0) {
    newState.soundQueue = [...newState.soundQueue, 'hyperspaceLoop'];
  }
  
  // Scroll background
  newState.hyperspaceScrollOffset += VM_CONFIG.hyperspaceScrollSpeed;
  
  // Update player position - horizontal movement is free, vertical is limited
  if (input.isTouching) {
    newState.targetX = input.touchX;
    // Limit vertical movement to 250px range
    const clampedY = clamp(
      input.touchY,
      VM_CONFIG.hyperspacePlayerYMax,
      VM_CONFIG.hyperspacePlayerYMin
    );
    newState.targetY = clampedY;
  }
  
  // Smooth movement
  const dx = newState.targetX - newState.playerX;
  const dy = newState.targetY - newState.playerY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist > 2) {
    const moveSpeed = Math.min(newState.stats.speed * 3, dist * 0.5);
    const dir = normalize(dx, dy);
    newState.playerX += dir.x * moveSpeed;
    newState.playerY += dir.y * moveSpeed;
  }
  
  // Keep player facing up in hyperspace
  newState.playerAngle = lerpAngle(newState.playerAngle, -Math.PI / 2, 0.2);
  
  // Clamp horizontal position
  const padding = VM_CONFIG.arenaPadding;
  newState.playerX = clamp(newState.playerX, padding, VM_CONFIG.arenaWidth - padding);
  newState.playerY = clamp(newState.playerY, VM_CONFIG.hyperspacePlayerYMax, VM_CONFIG.hyperspacePlayerYMin);
  
  // Firing - same as normal but always facing up
  if (input.isTouching && newState.fireTimer <= 0) {
    const shipId = getStoredMegaShipId();
    const projectileStyle = getShipProjectileStyle(shipId);
    
    const tipOffset = VM_CONFIG.playerSize + 8;
    const spawnX = newState.playerX;
    const spawnY = newState.playerY - tipOffset; // Fire upward
    
    const newProjectiles: VectorProjectile[] = [];
    
    if (newState.activePowerUps.doubleShot > 0) {
      newProjectiles.push(createPlayerProjectile(spawnX - 8, spawnY, -Math.PI / 2, newState.stats.bulletSpeed, newState.stats.damage, newState.stats.pierce, shipId));
      newProjectiles.push(createPlayerProjectile(spawnX + 8, spawnY, -Math.PI / 2, newState.stats.bulletSpeed, newState.stats.damage, newState.stats.pierce, shipId));
    } else {
      newProjectiles.push(createPlayerProjectile(spawnX, spawnY, -Math.PI / 2, newState.stats.bulletSpeed, newState.stats.damage, newState.stats.pierce, shipId));
    }
    
    // Extra cannons
    const extraCannons = newState.stats.extraCannons || 0;
    for (let i = 0; i < Math.min(extraCannons, 4); i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const tier = Math.floor(i / 2);
      const sideOffset = 12 + tier * 8;
      const cannonX = newState.playerX + side * sideOffset;
      const cannonAngle = -Math.PI / 2 + (side * 0.1 * (tier + 1));
      
      newProjectiles.push(createPlayerProjectile(cannonX, spawnY, cannonAngle, newState.stats.bulletSpeed * 0.9, newState.stats.damage * 0.7, Math.max(0, newState.stats.pierce - 1), shipId));
    }
    
    newState.projectiles = [...newState.projectiles, ...newProjectiles];
    newState.fireTimer = newState.stats.fireRate;
    newState.soundQueue = [...newState.soundQueue, `shoot_${projectileStyle.sound}`];
  }
  
  if (newState.fireTimer > 0) newState.fireTimer--;
  if (newState.invulnerableTimer > 0) newState.invulnerableTimer--;
  if (newState.comboTimer > 0) {
    newState.comboTimer--;
    if (newState.comboTimer <= 0) newState.combo = 0;
  }
  
  // Update power-up timers
  if (newState.activePowerUps.doublePoints > 0) newState.activePowerUps.doublePoints--;
  if (newState.activePowerUps.doubleShot > 0) newState.activePowerUps.doubleShot--;
  if (newState.activePowerUps.speedBoost > 0) newState.activePowerUps.speedBoost--;
  if (newState.activePowerUps.warpShield > 0) newState.activePowerUps.warpShield--;
  if (newState.activePowerUps.timeWarp > 0) newState.activePowerUps.timeWarp--;
  if (newState.activePowerUps.magnetPulse > 0) newState.activePowerUps.magnetPulse--;
  
  // Spawn hyperspace-specific power-ups occasionally
  if (newState.gameTime % 300 === 0 && Math.random() < 0.5) {
    const powerUp = createHyperspacePowerUp(
      VM_CONFIG.arenaPadding + Math.random() * (VM_CONFIG.arenaWidth - VM_CONFIG.arenaPadding * 2),
      -20
    );
    newState.powerups = [...newState.powerups, powerUp];
  }
  
  // Spawn enemy formations from top
  newState.hyperspaceFormationTimer--;
  if (newState.hyperspaceFormationTimer <= 0) {
    newState = spawnHyperspaceFormation(newState);
    newState.hyperspaceFormationTimer = VM_CONFIG.hyperspaceFormationInterval;
  }
  
  // Update entities with hyperspace-specific behavior
  newState = updateHyperspaceEnemies(newState);
  newState = updateProjectiles(newState);
  newState = updateSalvage(newState);
  newState = updatePowerUps(newState);
  newState.particles = updateParticles(newState.particles);
  
  // Check collisions
  newState = checkCollisions(newState);
  newState = checkPowerUpCollisions(newState);
  
  // Create speed trail particles
  if (newState.gameTime % 3 === 0) {
    const particles = createParticle(
      Math.random() * VM_CONFIG.arenaWidth,
      0,
      '#00ffff',
      1
    );
    particles.forEach(p => {
      p.vy = 12 + Math.random() * 8;
      p.vx = 0;
      p.life = 80;
      p.maxLife = 80;
      p.size = 1 + Math.random() * 2;
    });
    newState.particles = [...newState.particles, ...particles];
  }
  
  // Check if hyperspace is complete
  if (newState.hyperspaceTimer <= 0) {
    newState.phase = 'hyperspaceExit';
    newState.phaseTimer = VM_CONFIG.hyperspaceTransitionDuration;
    newState.soundQueue = [...newState.soundQueue, 'hyperspaceExit'];
  }
  
  // Check game over
  if (newState.health <= 0) {
    newState.phase = 'gameOver';
  }
  
  return newState;
}

function updateHyperspaceExitPhase(state: VectorState, input: VectorInput): VectorState {
  let newState = { ...state };
  newState.phaseTimer--;
  
  // Transition progress (going back to normal)
  const transitionDuration = VM_CONFIG.hyperspaceTransitionDuration;
  newState.hyperspaceTransitionProgress = newState.phaseTimer / transitionDuration;
  
  // Slow down scrolling
  newState.hyperspaceScrollOffset += VM_CONFIG.hyperspaceScrollSpeed * newState.hyperspaceTransitionProgress;
  
  // Move player back to center
  const targetY = VM_CONFIG.arenaHeight / 2;
  const targetX = VM_CONFIG.arenaWidth / 2;
  newState.playerX = lerp(newState.playerX, targetX, 0.05);
  newState.playerY = lerp(newState.playerY, targetY, 0.05);
  
  // Update particles
  newState.particles = updateParticles(newState.particles);
  newState = updateProjectiles(newState);
  
  if (newState.phaseTimer <= 0) {
    // Exit hyperspace - return to normal playing mode
    newState.phase = 'playing';
    newState.hyperspaceActive = false;
    newState.hyperspaceTransitionProgress = 0;
    newState.hyperspaceScrollOffset = 0;
    
    // Set next hyperspace trigger
    newState.nextHyperspaceMap = getNextHyperspaceMapTarget(newState.currentMap);
    
    // Clear remaining hyperspace enemies
    newState.enemies = [];
    
    // Give a brief respite before enemies spawn again
    newState.spawnTimer = 90;
  }
  
  return newState;
}

// Spawn enemies in formation patterns from the top
function spawnHyperspaceFormation(state: VectorState): VectorState {
  let newState = { ...state };
  
  // Formation types
  const formationTypes = ['v', 'line', 'diamond', 'wave'];
  const formationType = formationTypes[Math.floor(Math.random() * formationTypes.length)];
  
  const formationSize = 3 + Math.floor(Math.random() * 4); // 3-6 enemies
  const centerX = VM_CONFIG.arenaWidth / 2 + (Math.random() - 0.5) * 300;
  const startY = -50;
  
  const enemies: VectorEnemy[] = [];
  
  // Calculate scaling
  const mapScaling = {
    health: 1 + (state.currentMap - 1) * VM_CONFIG.enemyHealthPerMap,
  };
  const levelScaling = 1 + (state.currentLevel - 1) * (VM_CONFIG.levelDifficultyMultiplier - 1);
  
  for (let i = 0; i < formationSize; i++) {
    let offsetX = 0;
    let offsetY = 0;
    
    switch (formationType) {
      case 'v':
        // V formation
        offsetX = (i - formationSize / 2) * 50;
        offsetY = Math.abs(i - formationSize / 2) * 30;
        break;
      case 'line':
        // Horizontal line
        offsetX = (i - formationSize / 2) * 60;
        offsetY = 0;
        break;
      case 'diamond':
        // Diamond pattern
        if (i === 0) { offsetX = 0; offsetY = -30; }
        else if (i < formationSize / 2) { offsetX = -40 * i; offsetY = i * 25; }
        else { offsetX = 40 * (i - formationSize / 2); offsetY = (i - formationSize / 2) * 25; }
        break;
      case 'wave':
        // Wave pattern
        offsetX = (i - formationSize / 2) * 55;
        offsetY = Math.sin(i * 0.8) * 40;
        break;
    }
    
    // Create enemy (mostly drones and shooters in hyperspace)
    const roll = Math.random();
    let enemy: VectorEnemy;
    
    if (roll < 0.15) {
      enemy = createElite(centerX + offsetX, startY + offsetY);
    } else if (roll < 0.5) {
      enemy = createShooter(centerX + offsetX, startY + offsetY);
    } else {
      enemy = createDrone(centerX + offsetX, startY + offsetY);
    }
    
    // Override position and velocity for hyperspace (move downward)
    enemy.x = centerX + offsetX;
    enemy.y = startY + offsetY;
    enemy.vx = 0;
    enemy.vy = 2 + Math.random() * 1.5; // Move downward
    
    // Apply scaling
    enemy.health *= state.difficultyMultiplier * levelScaling * mapScaling.health;
    enemy.maxHealth = enemy.health;
    
    enemies.push(enemy);
  }
  
  newState.enemies = [...newState.enemies, ...enemies];
  
  return newState;
}

// Update enemies specifically for hyperspace (move downward)
function updateHyperspaceEnemies(state: VectorState): VectorState {
  let newState = { ...state };
  const updatedEnemies: VectorEnemy[] = [];
  
  // Time warp slows enemies by 50%
  const timeWarpMultiplier = newState.activePowerUps.timeWarp > 0 ? 0.5 : 1;
  
  for (const enemy of newState.enemies) {
    let e = { ...enemy };
    
    // Move downward in hyperspace (affected by time warp)
    e.y += e.vy * timeWarpMultiplier;
    
    // Slight horizontal tracking toward player
    const dx = newState.playerX - e.x;
    e.x += dx * 0.01 * timeWarpMultiplier;
    
    // Face downward (toward player)
    e.targetAngle = Math.PI / 2;
    
    // Shooters fire at player (slower when time warped)
    if (e.type === 'shooter' || e.type === 'elite') {
      e.fireTimer -= timeWarpMultiplier;
      if (e.fireTimer <= 0 && e.y > 0 && e.y < VM_CONFIG.arenaHeight * 0.7) {
        const proj = createEnemyProjectile(e.x, e.y, newState.playerX, newState.playerY);
        newState.projectiles = [...newState.projectiles, proj];
        e.fireTimer = VM_CONFIG.shooterFireRate * (e.type === 'elite' ? 0.7 : 1);
      }
    }
    
    // Remove enemies that go off screen
    if (e.y < VM_CONFIG.arenaHeight + 100) {
      updatedEnemies.push(e);
    }
  }
  
  newState.enemies = updatedEnemies;
  return newState;
}

function spawnEnemy(state: VectorState): VectorState {
  let newState = { ...state };

  // Never spawn regular enemies while a boss is active
  if (state.bossActive) return newState;

  // Calculate dynamic scaling based on map progression
  const mapScaling = {
    health: 1 + (state.currentMap - 1) * VM_CONFIG.enemyHealthPerMap,
    speed: 1 + (state.currentMap - 1) * VM_CONFIG.enemySpeedPerMap,
    damage: 1 + (state.currentMap - 1) * VM_CONFIG.enemyDamagePerMap,
  };

  // Determine enemy type based on map progression - more variety and elites as game progresses
  const roll = Math.random();
  let enemy: VectorEnemy;

  // Elite chance increases faster, shooters become more common
  const eliteChance = Math.min(0.35, 0.08 + state.currentMap * 0.006);
  const shooterChance = Math.min(0.65, 0.35 + state.currentMap * 0.006);

  if (roll < eliteChance) {
    enemy = createElite(state.playerX, state.playerY);
  } else if (roll < shooterChance) {
    enemy = createShooter(state.playerX, state.playerY);
  } else {
    enemy = createDrone(state.playerX, state.playerY);
  }

  // Apply level scaling (per 50-map loop)
  const levelScaling = 1 + (state.currentLevel - 1) * (VM_CONFIG.levelDifficultyMultiplier - 1);
  
  // Apply map-based scaling
  enemy.health *= state.difficultyMultiplier * levelScaling * mapScaling.health;
  enemy.maxHealth = enemy.health;

  newState.enemies = [...newState.enemies, enemy];
  newState.enemiesSpawned++;
  
  // Formation spawning: chance to spawn additional coordinated enemies
  const formationChance = VM_CONFIG.formationChanceBase + state.currentMap * VM_CONFIG.formationChancePerMap;
  if (Math.random() < formationChance && newState.enemiesSpawned < newState.enemiesInWave) {
    // Spawn 1-2 additional enemies in formation
    const formationSize = Math.random() < 0.3 ? 2 : 1;
    for (let i = 0; i < formationSize && newState.enemiesSpawned < newState.enemiesInWave; i++) {
      // Formation enemies are usually the same type
      let formationEnemy: VectorEnemy;
      if (enemy.type === 'elite') {
        formationEnemy = createElite(state.playerX, state.playerY);
      } else if (enemy.type === 'shooter') {
        formationEnemy = createShooter(state.playerX, state.playerY);
      } else {
        formationEnemy = createDrone(state.playerX, state.playerY);
      }
      
      formationEnemy.health *= state.difficultyMultiplier * levelScaling * mapScaling.health;
      formationEnemy.maxHealth = formationEnemy.health;
      newState.enemies = [...newState.enemies, formationEnemy];
      newState.enemiesSpawned++;
    }
  }
  
  return newState;
}

function updateEnemies(state: VectorState): VectorState {
  let newState = { ...state };
  const updatedEnemies: VectorEnemy[] = [];
  
  // Calculate speed scaling based on map progression
  const speedScaling = 1 + (state.currentMap - 1) * VM_CONFIG.enemySpeedPerMap;
  
  for (const enemy of newState.enemies) {
    let e = { ...enemy };
    
    // Update direction towards player
    const dx = newState.playerX - e.x;
    const dy = newState.playerY - e.y;
    const dist = distance(e.x, e.y, newState.playerX, newState.playerY);
    
    switch (e.type) {
      case 'drone':
        // Drones rush directly at player - speed scales with map
        if (dist > 20) {
          const dir = normalize(dx, dy);
          const droneSpeed = VM_CONFIG.droneSpeed * speedScaling;
          e.vx = lerp(e.vx, dir.x * droneSpeed, 0.05);
          e.vy = lerp(e.vy, dir.y * droneSpeed, 0.05);
        }
        break;
        
      case 'shooter':
        // Shooters try to keep distance and shoot
        const preferredDist = 150;
        const shooterSpeed = VM_CONFIG.shooterSpeed * speedScaling;
        if (dist < preferredDist - 30) {
          // Too close, back off
          const dir = normalize(-dx, -dy);
          e.vx = lerp(e.vx, dir.x * shooterSpeed, 0.03);
          e.vy = lerp(e.vy, dir.y * shooterSpeed, 0.03);
        } else if (dist > preferredDist + 30) {
          // Too far, approach
          const dir = normalize(dx, dy);
          e.vx = lerp(e.vx, dir.x * shooterSpeed, 0.03);
          e.vy = lerp(e.vy, dir.y * shooterSpeed, 0.03);
        } else {
          // Good distance, slow down
          e.vx *= 0.95;
          e.vy *= 0.95;
        }
        
        // Fire at player - fire rate DECREASES as game progresses (fewer shots)
        e.fireTimer--;
        if (e.fireTimer <= 0) {
          const proj = createEnemyProjectile(e.x, e.y, newState.playerX, newState.playerY);
          newState.projectiles = [...newState.projectiles, proj];
          // REDUCED fire rate - enemies shoot less often at higher maps
          const fireRateMultiplier = 1 + (state.currentMap - 1) * 0.01; // +1% slower per map
          e.fireTimer = Math.floor(VM_CONFIG.shooterFireRate * fireRateMultiplier);
        }
        break;
        
      case 'elite':
        // Elites are aggressive shooters - speed scales with map
        const eliteSpeed = VM_CONFIG.eliteSpeed * speedScaling;
        const dir = normalize(dx, dy);
        e.vx = lerp(e.vx, dir.x * eliteSpeed, 0.04);
        e.vy = lerp(e.vy, dir.y * eliteSpeed, 0.04);
        
        e.fireTimer--;
        if (e.fireTimer <= 0) {
          // Fire in a spread - REDUCED from 3 shots to 2
          for (let i = -1; i <= 1; i += 2) {
            const angle = Math.atan2(dy, dx) + i * 0.25;
            const proj = createEnemyProjectile(
              e.x + Math.cos(angle) * 10,
              e.y + Math.sin(angle) * 10,
              e.x + Math.cos(angle) * 100,
              e.y + Math.sin(angle) * 100
            );
            newState.projectiles = [...newState.projectiles, proj];
          }
          // Slower fire rate for elites
          const eliteFireMultiplier = 1 + (state.currentMap - 1) * 0.008;
          e.fireTimer = Math.floor(100 * eliteFireMultiplier); // Was 80
        }
        break;
      
      case 'miniboss': {
        // Mini-boss - hybrid between elite and boss
        // Chases player but keeps distance, fires aimed bursts
        const preferredDistMini = 120;
        const minibossSpeed = VM_CONFIG.minibossSpeed * speedScaling;
        
        if (dist < preferredDistMini - 20) {
          // Too close, back off
          const dir = normalize(-dx, -dy);
          e.vx = lerp(e.vx, dir.x * minibossSpeed * 1.2, 0.05);
          e.vy = lerp(e.vy, dir.y * minibossSpeed * 1.2, 0.05);
        } else if (dist > preferredDistMini + 40) {
          // Too far, approach
          const dir = normalize(dx, dy);
          e.vx = lerp(e.vx, dir.x * minibossSpeed, 0.04);
          e.vy = lerp(e.vy, dir.y * minibossSpeed, 0.04);
        } else {
          // Strafe around player
          const strafeAngle = Math.atan2(dy, dx) + Math.PI / 2;
          const strafeOscillation = Math.sin(state.gameTime * 0.03);
          e.vx = lerp(e.vx, Math.cos(strafeAngle) * minibossSpeed * strafeOscillation, 0.04);
          e.vy = lerp(e.vy, Math.sin(strafeAngle) * minibossSpeed * strafeOscillation, 0.04);
        }
        
        // Fire burst of 3 aimed shots
        e.fireTimer--;
        if (e.fireTimer <= 0) {
          const colorIndex = e.behaviorTimer % 10; // stored mapId color
          const minibossColor = VM_CONFIG.bossColors[colorIndex];
          
          for (let i = -1; i <= 1; i++) {
            const spread = i * 0.12;
            const angle = Math.atan2(dy, dx) + spread;
            const proj = createEnemyProjectile(
              e.x, e.y,
              e.x + Math.cos(angle) * 200,
              e.y + Math.sin(angle) * 200,
              'energy',
              minibossColor,
              1.2
            );
            newState.projectiles = [...newState.projectiles, proj];
          }
          e.fireTimer = VM_CONFIG.minibossFireRate;
        }
        break;
      }
        
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
        // Map boss - varied behavior based on mapId stored in upper bits of behaviorTimer
        // behaviorTimer encodes: mapId * 10000 + bossTime (where bossTime counts up)
        const storedMapId = Math.floor(e.behaviorTimer / 10000);
        const mapId = storedMapId > 0 ? storedMapId : state.currentMap;
        const bossTime = e.behaviorTimer % 10000;
        e.behaviorTimer = mapId * 10000 + ((bossTime + 1) % 10000);
        
        // RAGE MODE: When health drops below 50%
        const healthPercent = e.health / e.maxHealth;
        const isRaging = healthPercent < 0.5;
        const rageSpeedMultiplier = isRaging ? 1.5 : 1.0;
        const rageFireRateMultiplier = isRaging ? 0.6 : 1.0; // Faster fire rate when raging
        
        // Trigger rage mode event (sound + message + screen shake + haptic) only once
        if (isRaging && !newState.bossEnraged) {
          newState.bossEnraged = true;
          newState.bossEnragedTimer = 120; // 2 seconds display
          newState.screenShakeIntensity = 20; // Strong screen shake
          newState.soundQueue = [...newState.soundQueue, 'bossEnraged', 'screenShakeHaptic'];
        }
        
        // Different movement patterns based on map - 10 unique patterns
        const patternType = mapId % 10;
        
        switch (patternType) {
          case 0: // Orbiting pattern - circles around center
            const orbitSpeed = isRaging ? 0.025 : 0.015;
            const bossOrbitAngle = bossTime * orbitSpeed;
            const bossOrbitRadius = 120 + Math.sin(bossTime * 0.02) * 40;
            const bossTargetX = VM_CONFIG.arenaWidth / 2 + Math.cos(bossOrbitAngle) * bossOrbitRadius;
            const bossTargetY = VM_CONFIG.arenaHeight / 2 + Math.sin(bossOrbitAngle) * bossOrbitRadius;
            e.vx = lerp(e.vx, (bossTargetX - e.x) * 0.02 * rageSpeedMultiplier, 0.1);
            e.vy = lerp(e.vy, (bossTargetY - e.y) * 0.02 * rageSpeedMultiplier, 0.1);
            break;
            
          case 1: // Aggressive chase - hunts the player
            const chaseDir = normalize(dx, dy);
            const chaseSpeed = isRaging ? 3.0 : 2.0;
            e.vx = lerp(e.vx, chaseDir.x * chaseSpeed, 0.04 * rageSpeedMultiplier);
            e.vy = lerp(e.vy, chaseDir.y * chaseSpeed, 0.04 * rageSpeedMultiplier);
            break;
            
          case 2: // Figure-8 pattern - graceful sweeping
            const fig8Speed = isRaging ? 0.015 : 0.01;
            const fig8Time = bossTime * fig8Speed;
            const fig8X = VM_CONFIG.arenaWidth / 2 + Math.sin(fig8Time * 2) * 150;
            const fig8Y = VM_CONFIG.arenaHeight / 2 + Math.sin(fig8Time) * 200;
            e.vx = lerp(e.vx, (fig8X - e.x) * 0.03 * rageSpeedMultiplier, 0.1);
            e.vy = lerp(e.vy, (fig8Y - e.y) * 0.03 * rageSpeedMultiplier, 0.1);
            break;
            
          case 3: // Teleport dash - sudden lunges
            const dashInterval = isRaging ? 80 : 120;
            if (bossTime % dashInterval < 5) {
              const dashDir = normalize(dx, dy);
              const dashSpeed = isRaging ? 14 : 10;
              e.vx = dashDir.x * dashSpeed;
              e.vy = dashDir.y * dashSpeed;
            } else {
              e.vx *= 0.92;
              e.vy *= 0.92;
            }
            break;
            
          case 4: // Zigzag pattern - erratic movement
            const zigInterval = isRaging ? 40 : 60;
            const zigzagPhase = Math.floor(bossTime / zigInterval) % 2;
            const zigDir = normalize(dx, dy);
            const perpX = -zigDir.y;
            const perpY = zigDir.x;
            const zigOffset = zigzagPhase === 0 ? 1 : -1;
            const zigSpeed = isRaging ? 3.5 : 2.5;
            e.vx = lerp(e.vx, (zigDir.x + perpX * zigOffset * 0.5) * zigSpeed, 0.06 * rageSpeedMultiplier);
            e.vy = lerp(e.vy, (zigDir.y + perpY * zigOffset * 0.5) * zigSpeed, 0.06 * rageSpeedMultiplier);
            break;
            
          case 5: // Hover and strafe - stays at distance
            const distToPlayer = Math.sqrt(dx * dx + dy * dy);
            const idealDist = isRaging ? 140 : 180; // Gets closer when raging
            const strafeAngle = Math.atan2(dy, dx) + Math.PI / 2;
            const strafeSpeed = Math.sin(bossTime * (isRaging ? 0.05 : 0.03)) * (isRaging ? 3 : 2);
            if (distToPlayer < idealDist - 30) {
              e.vx = lerp(e.vx, -normalize(dx, dy).x * 1.5 * rageSpeedMultiplier, 0.05);
              e.vy = lerp(e.vy, -normalize(dx, dy).y * 1.5 * rageSpeedMultiplier, 0.05);
            } else if (distToPlayer > idealDist + 30) {
              e.vx = lerp(e.vx, normalize(dx, dy).x * 1.5 * rageSpeedMultiplier, 0.05);
              e.vy = lerp(e.vy, normalize(dx, dy).y * 1.5 * rageSpeedMultiplier, 0.05);
            } else {
              e.vx = lerp(e.vx, Math.cos(strafeAngle) * strafeSpeed, 0.08);
              e.vy = lerp(e.vy, Math.sin(strafeAngle) * strafeSpeed, 0.08);
            }
            break;
            
          case 6: // Wave motion - sinusoidal approach
            const waveApproach = normalize(dx, dy);
            const waveFreq = isRaging ? 0.08 : 0.05;
            const waveAmplitude = Math.sin(bossTime * waveFreq) * (isRaging ? 4.5 : 3);
            const waveSpeed = isRaging ? 1.8 : 1.2;
            e.vx = lerp(e.vx, waveApproach.x * waveSpeed + waveApproach.y * waveAmplitude, 0.04 * rageSpeedMultiplier);
            e.vy = lerp(e.vy, waveApproach.y * waveSpeed - waveApproach.x * waveAmplitude, 0.04 * rageSpeedMultiplier);
            break;
            
          case 7: // Stationary turret - minimal movement, heavy fire (but moves when raging!)
            const turretCenterX = VM_CONFIG.arenaWidth / 2;
            const turretCenterY = VM_CONFIG.arenaHeight / 3;
            if (isRaging) {
              // Turret becomes mobile in rage mode!
              const turretChaseDir = normalize(dx, dy);
              e.vx = lerp(e.vx, turretChaseDir.x * 1.5, 0.03);
              e.vy = lerp(e.vy, turretChaseDir.y * 1.5, 0.03);
            } else {
              e.vx = lerp(e.vx, (turretCenterX - e.x) * 0.01, 0.1);
              e.vy = lerp(e.vy, (turretCenterY - e.y) * 0.01, 0.1);
            }
            break;
            
          case 8: // Meteor boss - swoops from above
            const meteorInterval = isRaging ? 120 : 180;
            const meteorPhase = Math.floor(bossTime / meteorInterval) % 3;
            if (meteorPhase === 0) {
              // Rise up
              e.vx = lerp(e.vx, 0, 0.1);
              e.vy = lerp(e.vy, isRaging ? -4.5 : -3, 0.05);
            } else if (meteorPhase === 1) {
              // Dive at player
              const diveDir = normalize(dx, dy);
              const diveSpeed = isRaging ? 7 : 5;
              e.vx = lerp(e.vx, diveDir.x * diveSpeed, 0.08);
              e.vy = lerp(e.vy, diveDir.y * diveSpeed, 0.08);
            } else {
              // Recover
              e.vx *= 0.95;
              e.vy *= 0.95;
            }
            break;
            
          case 9: // Spiral outward - expands then contracts
            const spiralSpeed = isRaging ? 400 : 300;
            const spiralPhase = (bossTime % spiralSpeed) / spiralSpeed;
            const spiralRadius = 50 + spiralPhase * 150;
            const spiralAngleM = bossTime * 0.02;
            const spiralTargetX = VM_CONFIG.arenaWidth / 2 + Math.cos(spiralAngleM) * spiralRadius;
            const spiralTargetY = VM_CONFIG.arenaHeight / 2 + Math.sin(spiralAngleM) * spiralRadius;
            e.vx = lerp(e.vx, (spiralTargetX - e.x) * 0.04, 0.1);
            e.vy = lerp(e.vy, (spiralTargetY - e.y) * 0.04, 0.1);
            break;
        }
        
        // Fire patterns based on map - with unique projectile types and speeds
        e.fireTimer--;
        if (e.fireTimer <= 0) {
          const firePattern = mapId % 10;
          const playerAngle = Math.atan2(dy, dx);
          
          // Get boss-specific projectile type and color
          const bossProjectileType = VM_CONFIG.bossProjectileTypes[mapId % 10];
          const bossColor = VM_CONFIG.bossColors[mapId % 10];
          
          switch (firePattern) {
            case 0: // Ring of bullets - fewer but faster
              for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const proj = createEnemyProjectile(
                  e.x + Math.cos(angle) * 25,
                  e.y + Math.sin(angle) * 25,
                  e.x + Math.cos(angle) * 300,
                  e.y + Math.sin(angle) * 300,
                  bossProjectileType,
                  bossColor,
                  1.3 // Faster
                );
                newState.projectiles = [...newState.projectiles, proj];
              }
              e.fireTimer = VM_CONFIG.bossFireRate * 1.2; // Slower fire rate
              break;
              
            case 1: // Toxic spray - 3 aimed shots, very fast
              for (let i = -1; i <= 1; i++) {
                const angle = playerAngle + i * 0.12;
                const proj = createEnemyProjectile(
                  e.x, e.y,
                  e.x + Math.cos(angle) * 200,
                  e.y + Math.sin(angle) * 200,
                  bossProjectileType,
                  bossColor,
                  1.8 // Very fast
                );
                newState.projectiles = [...newState.projectiles, proj];
              }
              e.fireTimer = VM_CONFIG.bossFireRate * 0.6; // Fast fire rate
              break;
              
            case 2: // Void vortex - slow rotating pattern, mesmerizing
              const voidAngle = bossTime * 0.06;
              for (let i = 0; i < 3; i++) {
                const angle = voidAngle + (i / 3) * Math.PI * 2;
                const proj = createEnemyProjectile(
                  e.x + Math.cos(angle) * 20,
                  e.y + Math.sin(angle) * 20,
                  e.x + Math.cos(angle) * 250,
                  e.y + Math.sin(angle) * 250,
                  bossProjectileType,
                  bossColor,
                  0.7 // Slower but constant
                );
                newState.projectiles = [...newState.projectiles, proj];
              }
              e.fireTimer = VM_CONFIG.bossFireRate * 0.4; // Very frequent
              break;
              
            case 3: // Lightning bolts - single ultra-fast shots
              const lightningProj = createEnemyProjectile(
                e.x, e.y,
                e.x + Math.cos(playerAngle) * 300,
                e.y + Math.sin(playerAngle) * 300,
                bossProjectileType,
                bossColor,
                2.5 // Ultra fast laser
              );
              newState.projectiles = [...newState.projectiles, lightningProj];
              e.fireTimer = VM_CONFIG.bossFireRate * 0.35; // Rapid single shots
              break;
              
            case 4: // Fireballs - slow but big spread
              for (let i = 0; i < 5; i++) {
                const spreadAngle = playerAngle + (Math.random() - 0.5) * 0.6;
                const proj = createEnemyProjectile(
                  e.x, e.y,
                  e.x + Math.cos(spreadAngle) * 200,
                  e.y + Math.sin(spreadAngle) * 200,
                  bossProjectileType,
                  bossColor,
                  0.8 // Slower fireballs
                );
                newState.projectiles = [...newState.projectiles, proj];
              }
              e.fireTimer = VM_CONFIG.bossFireRate * 1.4; // Slower but dangerous
              break;
              
            case 5: // Ice shards - fast diagonal bursts
              for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
                const proj = createEnemyProjectile(
                  e.x + Math.cos(angle) * 20,
                  e.y + Math.sin(angle) * 20,
                  e.x + Math.cos(angle) * 250,
                  e.y + Math.sin(angle) * 250,
                  bossProjectileType,
                  bossColor,
                  1.5
                );
                newState.projectiles = [...newState.projectiles, proj];
              }
              e.fireTimer = VM_CONFIG.bossFireRate;
              break;
              
            case 6: // Plasma orbs - slow homing-like curve
              const plasmaOffset = Math.sin(bossTime * 0.08) * 0.5;
              for (let i = -1; i <= 1; i += 2) {
                const angle = playerAngle + plasmaOffset + i * 0.2;
                const proj = createEnemyProjectile(
                  e.x, e.y,
                  e.x + Math.cos(angle) * 200,
                  e.y + Math.sin(angle) * 200,
                  bossProjectileType,
                  bossColor,
                  0.9
                );
                newState.projectiles = [...newState.projectiles, proj];
              }
              e.fireTimer = VM_CONFIG.bossFireRate * 0.7;
              break;
              
            case 7: // Energy beams - rapid single shots
              const energySpread = (Math.random() - 0.5) * 0.1;
              const energyProj = createEnemyProjectile(
                e.x, e.y,
                e.x + Math.cos(playerAngle + energySpread) * 250,
                e.y + Math.sin(playerAngle + energySpread) * 250,
                bossProjectileType,
                bossColor,
                2.0
              );
              newState.projectiles = [...newState.projectiles, energyProj];
              e.fireTimer = VM_CONFIG.bossFireRate * 0.25; // Very rapid
              break;
              
            case 8: // Pulse waves - expanding slow rings
              for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 + bossTime * 0.01;
                const proj = createEnemyProjectile(
                  e.x + Math.cos(angle) * 25,
                  e.y + Math.sin(angle) * 25,
                  e.x + Math.cos(angle) * 280,
                  e.y + Math.sin(angle) * 280,
                  bossProjectileType,
                  bossColor,
                  0.6 // Very slow pulse
                );
                newState.projectiles = [...newState.projectiles, proj];
              }
              e.fireTimer = VM_CONFIG.bossFireRate * 1.5; // Slow but dense
              break;
              
            case 9: // Concentrated laser - single devastating beam
              const laserProj = createEnemyProjectile(
                e.x, e.y,
                e.x + Math.cos(playerAngle) * 400,
                e.y + Math.sin(playerAngle) * 400,
                bossProjectileType,
                bossColor,
                3.0 // Extremely fast
              );
              newState.projectiles = [...newState.projectiles, laserProj];
              e.fireTimer = VM_CONFIG.bossFireRate * 0.3; // Rapid fire
              break;
          }
          
          // Apply rage mode fire rate boost - shoots faster when below 50% health
          if (isRaging) {
            e.fireTimer = Math.floor(e.fireTimer * rageFireRateMultiplier);
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
        // Create explosion particles - get color for miniboss
        const enemyColor = enemy.type === 'miniboss' 
          ? VM_CONFIG.bossColors[enemy.behaviorTimer % 10]
          : VM_CONFIG.enemyColors[enemy.type] || VM_CONFIG.enemyColors.elite;
        const particles = createParticle(
          enemy.x, 
          enemy.y, 
          enemyColor, 
          enemy.type === 'bounty' || enemy.type === 'boss' || enemy.type === 'miniboss' ? 20 : 8
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
                          enemy.type === 'miniboss' ? 250 :
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
      
    // Hyperspace-specific power-ups
    case 'warpShield':
      // Multi-hit shield that lasts the entire hyperspace
      newState.activePowerUps.warpShield = VM_CONFIG.powerUpDuration * 2;
      newState.shields += 3; // Add 3 shields
      newState.soundQueue = [...newState.soundQueue, 'warpShield'];
      break;
      
    case 'formationBreaker':
      // Destroys all current enemies on screen (like nuke but hyperspace-themed)
      for (const enemy of newState.enemies) {
        const particles = createParticle(
          enemy.x, 
          enemy.y, 
          '#ff8800', 
          8
        );
        newState.particles = [...newState.particles, ...particles];
        
        // Give score
        const baseScore = enemy.type === 'elite' ? 100 :
                          enemy.type === 'shooter' ? 50 : 25;
        newState.score += baseScore;
        
        // Chance to drop salvage
        if (Math.random() < 0.3) {
          const salvage = createSalvage(enemy.x, enemy.y, 10);
          newState.salvage = [...newState.salvage, salvage];
        }
      }
      newState.enemies = [];
      newState.soundQueue = [...newState.soundQueue, 'formationBreaker'];
      break;
      
    case 'timeWarp':
      // Slows all enemies for duration
      newState.activePowerUps.timeWarp = VM_CONFIG.powerUpDuration;
      newState.soundQueue = [...newState.soundQueue, 'timeWarp'];
      break;
      
    case 'magnetPulse':
      // Attracts all salvage on screen instantly
      newState.activePowerUps.magnetPulse = VM_CONFIG.powerUpDuration;
      // Magnetize all current salvage
      newState.salvage = newState.salvage.map(s => ({ ...s, magnetized: true }));
      newState.soundQueue = [...newState.soundQueue, 'magnetPulse'];
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
        
        // Create hit particles - use proper color for miniboss
        const hitColor = enemy.type === 'miniboss'
          ? VM_CONFIG.bossColors[enemy.behaviorTimer % 10]
          : VM_CONFIG.enemyColors[enemy.type] || VM_CONFIG.enemyColors.elite;
        const particles = createParticle(proj.x, proj.y, hitColor, 3);
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
      
      // Mini-boss gives extra salvage reward
      if (enemy.type === 'miniboss') {
        const minibossRewardCount = 3 + Math.floor(Math.random() * 3); // 3-5 salvage
        for (let i = 0; i < minibossRewardCount; i++) {
          const angle = (i / minibossRewardCount) * Math.PI * 2;
          const distance = 20 + Math.random() * 15;
          const salvage = createSalvage(
            enemy.x + Math.cos(angle) * distance,
            enemy.y + Math.sin(angle) * distance,
            VM_CONFIG.salvageValue.miniboss,
            Math.random() < 0.15 // 15% chance for rare
          );
          newState.salvage = [...newState.salvage, salvage];
        }
      }
      
      // Score with combo bonus (doubled if power-up active)
      const baseScore = enemy.type === 'boss' ? 2000 :
                        enemy.type === 'miniboss' ? 500 :
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
    
    // Check hyperspace trigger BEFORE changing currentMap
    const shouldHyperspace = shouldTriggerHyperspace(newState);
    
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
    newState.enemiesInWave = getEnemiesForWave(newState.totalWavesCompleted, newState.currentLevel, newState.currentMap);
    newState.spawnTimer = 60;
    newState.bossActive = false;
    newState.bossDefeated = false;
    
    // Show new map name
    newState.showMapName = true;
    newState.mapNameTimer = 156; // ~2.6 seconds (same as wave complete)
    
    // If hyperspace should trigger, go directly to hyperspace (skip upgrade)
    if (shouldHyperspace) {
      newState.phase = 'hyperspaceEnter';
      newState.phaseTimer = VM_CONFIG.hyperspaceTransitionDuration;
      newState.hyperspaceActive = true;
      newState.hyperspaceDuration = VM_CONFIG.hyperspaceDurationMin + 
        Math.floor(Math.random() * (VM_CONFIG.hyperspaceDurationMax - VM_CONFIG.hyperspaceDurationMin));
      newState.hyperspaceTimer = newState.hyperspaceDuration;
      newState.hyperspaceScrollOffset = 0;
      newState.hyperspaceTransitionProgress = 0;
      newState.hyperspaceFormationTimer = 60;
      newState.hyperspacePlayerBaseY = VM_CONFIG.arenaHeight - 300;
      newState.soundQueue = [...newState.soundQueue, 'hyperspaceEnter'];
      // Set next hyperspace target for after this one
      newState.nextHyperspaceMap = getNextHyperspaceMapTarget(newState.currentMap);
    } else {
      // Upgrade pick after every boss (map completion)
      newState.upgradesPending = 1;
      newState.availableUpgrades = getRandomUpgrades(3);
      newState.phase = 'upgradePick';
    }
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
    // Check if hyperspace should trigger on this map
    if (shouldTriggerHyperspace(newState)) {
      // Start hyperspace mode!
      newState.phase = 'hyperspaceEnter';
      newState.phaseTimer = VM_CONFIG.hyperspaceTransitionDuration;
      newState.hyperspaceActive = true;
      newState.hyperspaceDuration = VM_CONFIG.hyperspaceDurationMin + 
        Math.floor(Math.random() * (VM_CONFIG.hyperspaceDurationMax - VM_CONFIG.hyperspaceDurationMin));
      newState.hyperspaceTimer = newState.hyperspaceDuration;
      newState.hyperspaceScrollOffset = 0;
      newState.hyperspaceTransitionProgress = 0;
      newState.hyperspaceFormationTimer = 60; // Start spawning formations after 1 second
      newState.hyperspacePlayerBaseY = VM_CONFIG.arenaHeight - 300;
      newState.soundQueue = [...newState.soundQueue, 'hyperspaceEnter'];
    } else {
      // Normal transition to next wave
      newState.phase = 'waveComplete';
      newState.phaseTimer = VM_CONFIG.mapTransitionTime;
    }
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
