// Companion System - Recruited anomalies that fight alongside the player

import { VectorState, VectorProjectile, CompanionState, VectorEnemy } from './types';
import { VM_CONFIG } from './constants';
import { createPlayerProjectile } from './entities';
import { distance, normalize } from './utils';

// Companion follows player at an offset and attacks enemies
export function updateCompanion(state: VectorState): VectorState {
  if (!state.companion) return state;
  
  let newState = { ...state };
  let companion = { ...state.companion };
  
  // Calculate target position (orbit around player)
  const orbitRadius = 60;
  const orbitSpeed = 0.03;
  const orbitAngle = state.gameTime * orbitSpeed;
  const targetX = state.playerX + Math.cos(orbitAngle) * orbitRadius;
  const targetY = state.playerY + Math.sin(orbitAngle) * orbitRadius;
  
  // Smooth movement towards orbit position
  const dx = targetX - companion.x;
  const dy = targetY - companion.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  if (dist > 2) {
    const moveSpeed = Math.min(4, dist * 0.15);
    const dir = normalize(dx, dy);
    companion.x += dir.x * moveSpeed;
    companion.y += dir.y * moveSpeed;
  }
  
  // Face nearest enemy
  const nearestEnemy = findNearestEnemy(companion.x, companion.y, state.enemies);
  if (nearestEnemy) {
    const enemyAngle = Math.atan2(nearestEnemy.y - companion.y, nearestEnemy.x - companion.x);
    // Smooth rotation
    let angleDiff = enemyAngle - companion.angle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    companion.angle += angleDiff * 0.2;
  }
  
  // Companion firing logic
  companion.fireTimer--;
  if (companion.fireTimer <= 0 && nearestEnemy) {
    // Fire at nearest enemy
    const fireRate = getCompanionFireRate(companion.ability);
    companion.fireTimer = fireRate;
    
    // Create companion projectile
    const bulletSpeed = 12;
    const damage = getCompanionDamage(companion.ability);
    
    const tipOffset = 15;
    const spawnX = companion.x + Math.cos(companion.angle) * tipOffset;
    const spawnY = companion.y + Math.sin(companion.angle) * tipOffset;
    
    const projectile = createPlayerProjectile(
      spawnX,
      spawnY,
      companion.angle,
      bulletSpeed,
      damage,
      1,
      'companion_' + companion.shape
    );
    
    newState.projectiles = [...newState.projectiles, projectile];
  }
  
  newState.companion = companion;
  return newState;
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
    case 'shooter': return 25; // Fast fire
    case 'leech': return 40;
    case 'phaser': return 35;
    case 'shield': return 50;
    case 'splitter': return 45;
    default: return 40;
  }
}

function getCompanionDamage(ability: string): number {
  switch (ability) {
    case 'shooter': return 8;
    case 'leech': return 6;
    case 'phaser': return 10;
    case 'shield': return 5;
    case 'splitter': return 7;
    default: return 6;
  }
}

// Render companion shape
export function renderCompanion(
  ctx: CanvasRenderingContext2D, 
  companion: CompanionState,
  gameTime: number
): void {
  const { x, y, angle, hue, saturation, shape } = companion;
  
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  
  const color = `hsl(${hue}, ${saturation}%, 60%)`;
  const glowColor = `hsl(${hue}, ${saturation}%, 70%)`;
  const fillColor = `hsl(${hue}, ${saturation}%, 25%)`;
  const size = 18;
  
  // Pulsing glow
  const pulse = Math.sin(gameTime * 0.1) * 0.2 + 0.8;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 10 * pulse;
  
  // Draw shape
  ctx.strokeStyle = color;
  ctx.fillStyle = fillColor;
  ctx.lineWidth = 2;
  
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
  
  // Core glow
  ctx.fillStyle = glowColor;
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  
  // "Ally" indicator
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#00ffaa';
  ctx.font = '6px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('★', 0, -size - 6);
  
  ctx.restore();
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
