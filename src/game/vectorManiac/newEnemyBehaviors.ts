// New Enemy AI Behaviors - 15 new enemy types

import { VectorState, VectorEnemy } from './types';
import { VM_CONFIG } from './constants';
import { createEnemyProjectile } from './entities';
import { distance, normalize, lerp } from './utils';
import { createParasite, createReplicator } from './newEnemies';

// Update all new enemy types - called from main game loop
export function updateNewEnemy(
  e: VectorEnemy,
  newState: VectorState,
  dx: number,
  dy: number,
  dist: number,
  speedScaling: number
): { enemy: VectorEnemy; state: VectorState; shouldRemove?: boolean } {
  
  switch (e.type) {
    case 'bomber': {
      // Bomber - moves slowly toward player, explodes on death (handled in collision)
      const bomberSpeed = VM_CONFIG.bomberSpeed * speedScaling;
      const dir = normalize(dx, dy);
      e.vx = lerp(e.vx, dir.x * bomberSpeed, 0.04);
      e.vy = lerp(e.vy, dir.y * bomberSpeed, 0.04);
      
      // Pulsing warning effect stored in behaviorTimer
      e.behaviorTimer = (e.behaviorTimer + 1) % 60;
      break;
    }
    
    case 'shielder': {
      // Shielder - faces player and blocks frontal attacks
      const shielderSpeed = VM_CONFIG.shielderSpeed * speedScaling;
      
      // Always face player
      e.targetAngle = Math.atan2(dy, dx);
      
      // Move toward player
      const dir = normalize(dx, dy);
      e.vx = lerp(e.vx, dir.x * shielderSpeed, 0.05);
      e.vy = lerp(e.vy, dir.y * shielderSpeed, 0.05);
      break;
    }
    
    case 'teleporter': {
      // Teleporter - blinks around, shoots after teleporting
      const teleporterSpeed = VM_CONFIG.teleporterSpeed * speedScaling;
      
      e.behaviorTimer--;
      if (e.behaviorTimer <= 0) {
        // Teleport to random position around player
        const angle = Math.random() * Math.PI * 2;
        const teleportDist = 100 + Math.random() * 100;
        e.x = newState.playerX + Math.cos(angle) * teleportDist;
        e.y = newState.playerY + Math.sin(angle) * teleportDist;
        
        // Clamp to arena
        e.x = Math.max(50, Math.min(VM_CONFIG.arenaWidth - 50, e.x));
        e.y = Math.max(50, Math.min(VM_CONFIG.arenaHeight - 50, e.y));
        
        e.vx = 0;
        e.vy = 0;
        e.behaviorTimer = VM_CONFIG.teleporterBlinkInterval;
        
        // Fire after teleporting
        const proj = createEnemyProjectile(e.x, e.y, newState.playerX, newState.playerY);
        newState.projectiles = [...newState.projectiles, proj];
      } else {
        // Slow drift
        const dir = normalize(dx, dy);
        e.vx = lerp(e.vx, dir.x * teleporterSpeed, 0.02);
        e.vy = lerp(e.vy, dir.y * teleporterSpeed, 0.02);
      }
      break;
    }
    
    case 'leech': {
      // Leech - rushes to player, attaches and drains health
      const leechSpeed = VM_CONFIG.leechSpeed * speedScaling;
      const isAttached = e.fireTimer === 1;
      
      if (isAttached) {
        // Stay on player
        e.x = newState.playerX + Math.cos(e.targetAngle) * 20;
        e.y = newState.playerY + Math.sin(e.targetAngle) * 20;
        e.vx = 0;
        e.vy = 0;
        // Damage is handled in collision detection
      } else if (dist < 25) {
        // Attach to player
        e.fireTimer = 1;
        e.targetAngle = Math.atan2(e.y - newState.playerY, e.x - newState.playerX);
      } else {
        // Chase player
        const dir = normalize(dx, dy);
        e.vx = lerp(e.vx, dir.x * leechSpeed, 0.15);
        e.vy = lerp(e.vy, dir.y * leechSpeed, 0.15);
      }
      break;
    }
    
    case 'mirror': {
      // Mirror - copies player movement, shoots back
      const mirrorSpeed = VM_CONFIG.mirrorSpeed * speedScaling;
      const centerX = VM_CONFIG.arenaWidth / 2;
      const centerY = VM_CONFIG.arenaHeight / 2;
      
      // Target is mirror position of player
      const mirrorX = centerX * 2 - newState.playerX;
      const mirrorY = centerY * 2 - newState.playerY;
      const toMirror = normalize(mirrorX - e.x, mirrorY - e.y);
      
      e.vx = lerp(e.vx, toMirror.x * mirrorSpeed, 0.06);
      e.vy = lerp(e.vy, toMirror.y * mirrorSpeed, 0.06);
      
      // Fire at player
      e.fireTimer--;
      if (e.fireTimer <= 0) {
        const proj = createEnemyProjectile(e.x, e.y, newState.playerX, newState.playerY);
        newState.projectiles = [...newState.projectiles, proj];
        e.fireTimer = VM_CONFIG.mirrorFireRate;
      }
      break;
    }
    
    case 'pulsar': {
      // Pulsar - moves slowly, emits damaging shockwaves
      const pulsarSpeed = VM_CONFIG.pulsarSpeed * speedScaling;
      const dir = normalize(dx, dy);
      e.vx = lerp(e.vx, dir.x * pulsarSpeed, 0.03);
      e.vy = lerp(e.vy, dir.y * pulsarSpeed, 0.03);
      
      // Pulse countdown
      e.fireTimer--;
      if (e.fireTimer <= 0) {
        // Start pulse expansion
        e.behaviorTimer = 1; // Pulse is expanding
        e.fireTimer = VM_CONFIG.pulsarPulseInterval;
      }
      
      // Pulse expansion animation (behaviorTimer tracks current radius)
      if (e.behaviorTimer > 0 && e.behaviorTimer < VM_CONFIG.pulsarPulseRadius) {
        e.behaviorTimer += 3; // Expand by 3 pixels per frame
        
        // Check if player is hit by expanding pulse
        const playerDist = distance(e.x, e.y, newState.playerX, newState.playerY);
        const pulseRing = e.behaviorTimer;
        if (Math.abs(playerDist - pulseRing) < 15) {
          // Player hit by pulse ring - damage handled in main collision
        }
      } else if (e.behaviorTimer >= VM_CONFIG.pulsarPulseRadius) {
        e.behaviorTimer = 0; // Reset pulse
      }
      break;
    }
    
    case 'swarm': {
      // Swarm - tiny, moves in erratic groups
      const swarmSpeed = VM_CONFIG.swarmSpeed * speedScaling;
      const dir = normalize(dx, dy);
      
      // Wobbling movement
      e.behaviorTimer += 0.2;
      const wobble = Math.sin(e.behaviorTimer) * 0.5;
      
      e.vx = lerp(e.vx, (dir.x + dir.y * wobble) * swarmSpeed, 0.08);
      e.vy = lerp(e.vy, (dir.y - dir.x * wobble) * swarmSpeed, 0.08);
      break;
    }
    
    case 'charger': {
      // Charger - stops to charge, then rushes in straight line
      const chargerSpeed = VM_CONFIG.chargerSpeed * speedScaling;
      const chargeState = e.fireTimer; // 0 = idle, 1 = charging, 2 = rushing
      
      if (chargeState === 0) {
        // Idle - move slowly and prepare to charge
        const dir = normalize(dx, dy);
        e.vx = lerp(e.vx, dir.x * chargerSpeed, 0.03);
        e.vy = lerp(e.vy, dir.y * chargerSpeed, 0.03);
        
        // Start charging when close enough
        if (dist < 250) {
          e.fireTimer = 1;
          e.behaviorTimer = VM_CONFIG.chargerChargeTime;
          e.targetAngle = Math.atan2(dy, dx);
        }
      } else if (chargeState === 1) {
        // Charging - stop and aim
        e.vx *= 0.85;
        e.vy *= 0.85;
        e.behaviorTimer--;
        
        // Update aim during charge
        e.targetAngle = Math.atan2(dy, dx);
        
        if (e.behaviorTimer <= 0) {
          e.fireTimer = 2; // Start rush
          e.behaviorTimer = 40; // Rush duration
        }
      } else if (chargeState === 2) {
        // Rushing - fast straight line
        const rushSpeed = VM_CONFIG.chargerChargeSpeed * speedScaling;
        e.vx = Math.cos(e.targetAngle) * rushSpeed;
        e.vy = Math.sin(e.targetAngle) * rushSpeed;
        
        e.behaviorTimer--;
        if (e.behaviorTimer <= 0) {
          e.fireTimer = 0; // Back to idle
        }
      }
      break;
    }
    
    case 'phaser': {
      // Phaser - periodically becomes invulnerable to bullets
      const phaserSpeed = VM_CONFIG.phaserSpeed * speedScaling;
      const dir = normalize(dx, dy);
      e.vx = lerp(e.vx, dir.x * phaserSpeed, 0.05);
      e.vy = lerp(e.vy, dir.y * phaserSpeed, 0.05);
      
      // Phase cycle (behaviorTimer counts down)
      e.behaviorTimer--;
      if (e.behaviorTimer <= 0) {
        // Toggle phase state
        if (e.behaviorTimer === 0) {
          e.behaviorTimer = -VM_CONFIG.phaserPhaseDuration; // Negative = phasing
        }
      }
      if (e.behaviorTimer < -VM_CONFIG.phaserPhaseDuration + 1) {
        e.behaviorTimer = VM_CONFIG.phaserPhaseInterval; // Reset cycle
      }
      
      // Fire at player
      e.fireTimer--;
      if (e.fireTimer <= 0 && e.behaviorTimer > 0) { // Only fire when not phasing
        const proj = createEnemyProjectile(e.x, e.y, newState.playerX, newState.playerY);
        newState.projectiles = [...newState.projectiles, proj];
        e.fireTimer = VM_CONFIG.phaserFireRate;
      }
      break;
    }
    
    case 'vortex': {
      // Vortex - pulls player and projectiles toward it
      const vortexSpeed = VM_CONFIG.vortexSpeed * speedScaling;
      const dir = normalize(dx, dy);
      e.vx = lerp(e.vx, dir.x * vortexSpeed, 0.02);
      e.vy = lerp(e.vy, dir.y * vortexSpeed, 0.02);
      
      // Rotation animation
      e.behaviorTimer += 0.08;
      
      // Pull player toward vortex (applied in main game loop)
      // This is just for tracking state
      break;
    }
    
    case 'replicator': {
      // Replicator - spawns a copy at 50% health
      const replicatorSpeed = VM_CONFIG.replicatorSpeed * speedScaling;
      const isClone = e.behaviorTimer === 1;
      const dir = normalize(dx, dy);
      
      e.vx = lerp(e.vx, dir.x * replicatorSpeed, 0.05);
      e.vy = lerp(e.vy, dir.y * replicatorSpeed, 0.05);
      
      // Check for replication (only if not already a clone)
      if (!isClone && e.health <= e.maxHealth * 0.5 && e.health > 0) {
        // Spawn clone
        const clone = createReplicator(e.x, e.y, true);
        newState.enemies = [...newState.enemies, clone];
        e.behaviorTimer = 1; // Mark as "already replicated"
      }
      
      // Fire at player
      e.fireTimer--;
      if (e.fireTimer <= 0) {
        const proj = createEnemyProjectile(e.x, e.y, newState.playerX, newState.playerY);
        newState.projectiles = [...newState.projectiles, proj];
        e.fireTimer = VM_CONFIG.replicatorFireRate;
      }
      break;
    }
    
    case 'stealth': {
      // Stealth - invisible until close, then revealed
      const stealthSpeed = VM_CONFIG.stealthSpeed * speedScaling;
      const dir = normalize(dx, dy);
      e.vx = lerp(e.vx, dir.x * stealthSpeed, 0.08);
      e.vy = lerp(e.vy, dir.y * stealthSpeed, 0.08);
      
      // Update visibility based on distance
      e.behaviorTimer = dist < VM_CONFIG.stealthRevealRadius ? 1 : 0;
      break;
    }
    
    case 'titan': {
      // Titan - huge, slow, tanky, fires spread shots
      const titanSpeed = VM_CONFIG.titanSpeed * speedScaling;
      const dir = normalize(dx, dy);
      e.vx = lerp(e.vx, dir.x * titanSpeed, 0.02);
      e.vy = lerp(e.vy, dir.y * titanSpeed, 0.02);
      
      // Fire spread shots
      e.fireTimer--;
      if (e.fireTimer <= 0) {
        for (let i = -2; i <= 2; i++) {
          const spread = i * 0.25;
          const angle = Math.atan2(dy, dx) + spread;
          const proj = createEnemyProjectile(
            e.x + Math.cos(angle) * e.size,
            e.y + Math.sin(angle) * e.size,
            e.x + Math.cos(angle) * 300,
            e.y + Math.sin(angle) * 300,
            'plasma',
            '#ff6644'
          );
          newState.projectiles = [...newState.projectiles, proj];
        }
        e.fireTimer = VM_CONFIG.titanFireRate;
      }
      break;
    }
    
    case 'parasite': {
      // Parasite - chases player, spawns mini-parasites on death (handled in collision)
      const isMini = e.fireTimer === 1;
      const speed = (isMini ? VM_CONFIG.parasiteMiniSpeed : VM_CONFIG.parasiteSpeed) * speedScaling;
      const dir = normalize(dx, dy);
      
      // Mini-parasites home in aggressively
      const acceleration = isMini ? 0.15 : 0.06;
      e.vx = lerp(e.vx, dir.x * speed, acceleration);
      e.vy = lerp(e.vy, dir.y * speed, acceleration);
      break;
    }
    
    case 'nova': {
      // Nova - moves toward player, explodes into bullet ring on death (handled in collision)
      const novaSpeed = VM_CONFIG.novaSpeed * speedScaling;
      const dir = normalize(dx, dy);
      e.vx = lerp(e.vx, dir.x * novaSpeed, 0.05);
      e.vy = lerp(e.vy, dir.y * novaSpeed, 0.05);
      
      // Glow intensity pulsing
      e.behaviorTimer = (e.behaviorTimer + 0.1) % (Math.PI * 2);
      break;
    }
  }
  
  return { enemy: e, state: newState };
}

// Check if enemy is phasing (immune to bullets)
export function isEnemyPhasing(e: VectorEnemy): boolean {
  if (e.type === 'phaser') {
    return e.behaviorTimer < 0; // Negative = phasing
  }
  return false;
}

// Check if bullet should be blocked by shielder's shield
export function isBlockedByShield(
  e: VectorEnemy, 
  bulletX: number, 
  bulletY: number
): boolean {
  if (e.type !== 'shielder') return false;
  
  // Calculate angle from enemy to bullet
  const bulletAngle = Math.atan2(bulletY - e.y, bulletX - e.x);
  
  // Check if bullet is in front of enemy (within shield arc)
  let angleDiff = bulletAngle - e.targetAngle;
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
  
  return Math.abs(angleDiff) < VM_CONFIG.shielderShieldArc / 2;
}

// Get vortex pull effect on player
export function getVortexPullEffect(
  enemies: VectorEnemy[],
  playerX: number,
  playerY: number
): { pullX: number; pullY: number } {
  let pullX = 0;
  let pullY = 0;
  
  for (const e of enemies) {
    if (e.type !== 'vortex') continue;
    
    const dist = distance(e.x, e.y, playerX, playerY);
    if (dist < VM_CONFIG.vortexPullRadius && dist > 20) {
      const strength = (1 - dist / VM_CONFIG.vortexPullRadius) * VM_CONFIG.vortexPullStrength;
      const dir = normalize(e.x - playerX, e.y - playerY);
      pullX += dir.x * strength;
      pullY += dir.y * strength;
    }
  }
  
  return { pullX, pullY };
}

// Check if leech is attached and return drain damage
export function getLeechDrainDamage(enemies: VectorEnemy[]): number {
  let totalDrain = 0;
  for (const e of enemies) {
    if (e.type === 'leech' && e.fireTimer === 1) {
      totalDrain += VM_CONFIG.leechDrainRate;
    }
  }
  return totalDrain;
}

// Check if player is hit by pulsar shockwave
export function isPulsarShockwaveHit(
  e: VectorEnemy,
  playerX: number,
  playerY: number
): boolean {
  if (e.type !== 'pulsar' || e.behaviorTimer <= 0) return false;
  
  const dist = distance(e.x, e.y, playerX, playerY);
  const pulseRadius = e.behaviorTimer;
  
  // Player is hit if they're at the edge of the expanding ring
  return Math.abs(dist - pulseRadius) < 15;
}
