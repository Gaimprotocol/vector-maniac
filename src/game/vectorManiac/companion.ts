// Companion System - Recruited anomalies that fight alongside the player

import { VectorState, VectorProjectile, CompanionState, VectorEnemy } from './types';
import { VM_CONFIG } from './constants';
import { createPlayerProjectile } from './entities';
import { distance, normalize } from './utils';

// Evolution-based stat multipliers
export function getEvolutionStats(evolutionLevel: number) {
  return {
    healthMultiplier: 1 + (evolutionLevel - 1) * 1.0, // 2x, 3x, 4x... health per level
    damageMultiplier: 1 + (evolutionLevel - 1) * 0.25, // +25% damage per level
    fireRateMultiplier: 1 - (evolutionLevel - 1) * 0.1, // 10% faster per level (min 0.5)
    bulletSpeedMultiplier: 1 + (evolutionLevel - 1) * 0.15, // +15% bullet speed per level
    pierceBonus: Math.floor((evolutionLevel - 1) / 2), // +1 pierce every 2 levels
    sizeMultiplier: 1 + (evolutionLevel - 1) * 0.12, // 12% bigger per level
  };
}

// Get companion max health based on evolution level
export function getCompanionMaxHealth(evolutionLevel: number): number {
  const baseHealth = 50;
  const stats = getEvolutionStats(evolutionLevel);
  return Math.floor(baseHealth * stats.healthMultiplier);
}

// Companion follows player at an offset and attacks enemies
export function updateCompanion(state: VectorState): VectorState {
  if (!state.companion) return state;
  
  // Check if companion is dead
  if (state.companion.health <= 0) {
    return { ...state, companion: null };
  }
  
  let newState = { ...state };
  let companion = { ...state.companion };
  
  // Update invulnerability timer
  if (companion.invulnerableTimer > 0) {
    companion.invulnerableTimer--;
  }
  
  // Evolution stats
  const evoStats = getEvolutionStats(companion.evolutionLevel);
  
  // Calculate target position (orbit around player)
  const orbitRadius = 60 + (companion.evolutionLevel - 1) * 10;
  const orbitSpeed = 0.03 + (companion.evolutionLevel - 1) * 0.005;
  const orbitAngle = state.gameTime * orbitSpeed;
  const targetX = state.playerX + Math.cos(orbitAngle) * orbitRadius;
  const targetY = state.playerY + Math.sin(orbitAngle) * orbitRadius;
  
  // Smooth movement towards orbit position (faster for evolved)
  const dx = targetX - companion.x;
  const dy = targetY - companion.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist > 2) {
    const moveSpeed = Math.min(4 + companion.evolutionLevel * 0.5, dist * 0.15);
    const dir = normalize(dx, dy);
    companion.x += dir.x * moveSpeed;
    companion.y += dir.y * moveSpeed;
  }
  
  // Face nearest enemy
  const nearestEnemy = findNearestEnemy(companion.x, companion.y, state.enemies);
  if (nearestEnemy) {
    const enemyAngle = Math.atan2(nearestEnemy.y - companion.y, nearestEnemy.x - companion.x);
    // Smooth rotation (faster for evolved)
    let angleDiff = enemyAngle - companion.angle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    companion.angle += angleDiff * (0.2 + companion.evolutionLevel * 0.05);
  }
  
  // Companion firing logic
  companion.fireTimer--;
  if (companion.fireTimer <= 0 && nearestEnemy) {
    // Fire at nearest enemy
    const baseFireRate = getCompanionFireRate(companion.ability);
    const fireRate = Math.max(10, Math.floor(baseFireRate * evoStats.fireRateMultiplier));
    companion.fireTimer = fireRate;
    
    // Create companion projectile with evolution bonuses
    const baseBulletSpeed = 12;
    const bulletSpeed = baseBulletSpeed * evoStats.bulletSpeedMultiplier;
    const baseDamage = getCompanionDamage(companion.ability);
    const damage = Math.floor(baseDamage * evoStats.damageMultiplier);
    const pierce = 1 + evoStats.pierceBonus;
    
    const tipOffset = 15 * evoStats.sizeMultiplier;
    const spawnX = companion.x + Math.cos(companion.angle) * tipOffset;
    const spawnY = companion.y + Math.sin(companion.angle) * tipOffset;
    
    // Different projectile types based on evolution level
    const projectileType = getEvolvedProjectileType(companion.ability, companion.evolutionLevel);
    
    const projectile = createPlayerProjectile(
      spawnX,
      spawnY,
      companion.angle,
      bulletSpeed,
      damage,
      pierce,
      projectileType
    );
    
    newState.projectiles = [...newState.projectiles, projectile];
    
    // Level 3+ companions fire additional shots
    if (companion.evolutionLevel >= 3) {
      const spreadAngle = 0.2;
      const sideProjectile1 = createPlayerProjectile(
        spawnX, spawnY,
        companion.angle + spreadAngle,
        bulletSpeed * 0.9,
        Math.floor(damage * 0.6),
        1,
        projectileType
      );
      const sideProjectile2 = createPlayerProjectile(
        spawnX, spawnY,
        companion.angle - spreadAngle,
        bulletSpeed * 0.9,
        Math.floor(damage * 0.6),
        1,
        projectileType
      );
      newState.projectiles = [...newState.projectiles, sideProjectile1, sideProjectile2];
    }
  }
  
  newState.companion = companion;
  return newState;
}

// Damage the companion (returns updated state)
export function damageCompanion(state: VectorState, damage: number): VectorState {
  if (!state.companion || state.companion.invulnerableTimer > 0) return state;
  
  const newHealth = Math.max(0, state.companion.health - damage);
  
  if (newHealth <= 0) {
    // Companion destroyed
    return { ...state, companion: null };
  }
  
  return {
    ...state,
    companion: {
      ...state.companion,
      health: newHealth,
      invulnerableTimer: 30, // Brief invulnerability
    },
  };
}

// Get projectile type based on evolution
function getEvolvedProjectileType(ability: string, evolutionLevel: number): string {
  if (evolutionLevel >= 4) {
    // Level 4+: Plasma projectiles
    return 'companion_plasma_' + ability;
  } else if (evolutionLevel >= 2) {
    // Level 2-3: Laser projectiles
    return 'companion_laser_' + ability;
  }
  return 'companion_' + ability;
}

function findNearestEnemy(x: number, y: number, enemies: VectorEnemy[]): VectorEnemy | null {
  let nearest: VectorEnemy | null = null;
  let nearestDist = Infinity;
  
  for (const enemy of enemies) {
    const dist = distance(x, y, enemy.x, enemy.y);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = enemy;
    }
  }
  
  return nearest;
}

function getCompanionFireRate(ability: string): number {
  switch (ability) {
    case 'shooter': return 22; // Fast fire
    case 'leech': return 38;
    case 'phaser': return 30;
    case 'shield': return 45;
    case 'splitter': return 40;
    default: return 35;
  }
}

function getCompanionDamage(ability: string): number {
  switch (ability) {
    case 'shooter': return 10;
    case 'leech': return 8;
    case 'phaser': return 14;
    case 'shield': return 6;
    case 'splitter': return 9;
    default: return 8;
  }
}

// Render companion shape with evolution visuals
export function renderCompanion(
  ctx: CanvasRenderingContext2D, 
  companion: CompanionState,
  gameTime: number
): void {
  const { x, y, angle, hue, saturation, shape, evolutionLevel, health, maxHealth, invulnerableTimer } = companion;
  
  const evoStats = getEvolutionStats(evolutionLevel);
  const baseSize = 18;
  const size = baseSize * evoStats.sizeMultiplier;
  
  // Evolution color modifications
  const evolvedSaturation = Math.min(100, saturation + (evolutionLevel - 1) * 10);
  const evolvedBrightness = 60 + (evolutionLevel - 1) * 5;
  const secondaryHue = (hue + 30 * (evolutionLevel - 1)) % 360;
  
  const color = `hsl(${hue}, ${evolvedSaturation}%, ${evolvedBrightness}%)`;
  const glowColor = `hsl(${hue}, ${evolvedSaturation}%, ${evolvedBrightness + 10}%)`;
  const fillColor = `hsl(${hue}, ${evolvedSaturation}%, ${20 + (evolutionLevel - 1) * 5}%)`;
  const secondaryColor = `hsl(${secondaryHue}, ${evolvedSaturation}%, ${evolvedBrightness}%)`;
  
  // Flash when invulnerable
  if (invulnerableTimer > 0 && Math.floor(gameTime / 3) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }
  
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  
  // Pulsing glow (stronger for evolved)
  const pulse = Math.sin(gameTime * 0.1) * 0.2 + 0.8;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = (10 + evolutionLevel * 4) * pulse;
  
  // Evolution rings (level 2+)
  if (evolutionLevel > 1) {
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.4;
    for (let i = 1; i < evolutionLevel; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, size + 6 + i * 5, 0, Math.PI * 2);
      ctx.setLineDash([4 + i * 2, 2 + i]);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }
  
  // Evolution spikes (level 3+)
  if (evolutionLevel >= 3) {
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.6;
    const spikeCount = 4 + evolutionLevel;
    for (let i = 0; i < spikeCount; i++) {
      const spikeAngle = (i * 2 * Math.PI / spikeCount);
      const innerR = size + 8;
      const outerR = size + 12 + evolutionLevel * 3;
      ctx.beginPath();
      ctx.moveTo(innerR * Math.cos(spikeAngle), innerR * Math.sin(spikeAngle));
      ctx.lineTo(outerR * Math.cos(spikeAngle), outerR * Math.sin(spikeAngle));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  
  // Draw main shape
  ctx.strokeStyle = color;
  ctx.fillStyle = fillColor;
  ctx.lineWidth = 2 + (evolutionLevel - 1) * 0.5;
  
  switch (shape) {
    case 'triangle':
      ctx.beginPath();
      ctx.moveTo(size, 0);
      ctx.lineTo(-size * 0.6, -size * 0.7);
      ctx.lineTo(-size * 0.6, size * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    case 'square':
      ctx.beginPath();
      ctx.rect(-size * 0.6, -size * 0.6, size * 1.2, size * 1.2);
      ctx.fill();
      ctx.stroke();
      break;
    case 'pentagon':
      drawPolygon(ctx, 0, 0, size * 0.8, 5);
      ctx.fill();
      ctx.stroke();
      break;
    case 'hexagon':
      drawPolygon(ctx, 0, 0, size * 0.8, 6);
      ctx.fill();
      ctx.stroke();
      break;
    case 'star':
      drawStar(ctx, 0, 0, size * 0.9, size * 0.45, 5);
      ctx.fill();
      ctx.stroke();
      break;
    default:
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
  }
  
  // Core glow (larger for evolved)
  const coreSize = 4 + (evolutionLevel - 1) * 1.5;
  ctx.fillStyle = glowColor;
  ctx.shadowBlur = 5 + evolutionLevel * 2;
  ctx.beginPath();
  ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner core for evolved (level 2+)
  if (evolutionLevel > 1) {
    ctx.fillStyle = secondaryColor;
    ctx.beginPath();
    ctx.arc(0, 0, coreSize * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // "Ally" indicator with evolution level
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#00ffaa';
  ctx.font = `${6 + evolutionLevel}px monospace`;
  ctx.textAlign = 'center';
  const stars = '★'.repeat(Math.min(evolutionLevel, 5));
  ctx.fillText(stars, 0, -size - 8);
  
  ctx.restore();
  
  // Reset alpha
  ctx.globalAlpha = 1;
  
  // Render health bar above companion
  renderCompanionHealthBar(ctx, x, y - size - 16, health, maxHealth, evolutionLevel);
}

// Render companion health bar
function renderCompanionHealthBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  health: number,
  maxHealth: number,
  evolutionLevel: number
): void {
  const barWidth = 30 + evolutionLevel * 5;
  const barHeight = 4;
  const healthPercent = health / maxHealth;
  
  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight);
  
  // Health fill with color based on percentage
  let healthColor: string;
  if (healthPercent > 0.6) {
    healthColor = '#00ffaa';
  } else if (healthPercent > 0.3) {
    healthColor = '#ffaa00';
  } else {
    healthColor = '#ff4444';
  }
  
  ctx.fillStyle = healthColor;
  ctx.fillRect(x - barWidth / 2, y, barWidth * healthPercent, barHeight);
  
  // Border
  ctx.strokeStyle = '#00ffaa';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(x - barWidth / 2, y, barWidth, barHeight);
}

function drawPolygon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, sides: number) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI / sides) - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerR: number, innerR: number, points: number) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI / points) - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}
