// Vector Maniac Renderer

import { VectorState } from './types';
import { VM_CONFIG } from './constants';
import { drawMegaShip } from '../megaShipRenderer';
import { getStoredMegaShipId } from '@/hooks/useMegaShips';
import { getStoredSkinColors } from '@/hooks/useEquipment';

// Convert world coordinates to screen coordinates
function worldToScreen(worldX: number, worldY: number, state: VectorState): { x: number; y: number } {
  const { viewportWidth, viewportHeight } = VM_CONFIG;
  return {
    x: worldX - state.cameraX + viewportWidth / 2,
    y: worldY - state.cameraY + viewportHeight / 2,
  };
}

export function renderVectorManiac(ctx: CanvasRenderingContext2D, state: VectorState): void {
  // Clear and draw background (follows camera for endless feel)
  renderBackground(ctx, state);
  
  // Draw infinite grid that scrolls with camera
  renderGrid(ctx, state);
  
  // Draw salvage (in world space)
  renderSalvage(ctx, state);
  
  // Draw power-ups (in world space)
  renderPowerUps(ctx, state);
  
  // Draw projectiles (in world space)
  renderProjectiles(ctx, state);
  
  // Draw enemies (in world space)
  renderEnemies(ctx, state);
  
  // Draw player (always centered on screen)
  renderPlayer(ctx, state);
  
  // Draw particles (in world space)
  renderParticles(ctx, state);
  
  // Draw HUD (screen space - fixed position)
  renderHUD(ctx, state);
  
  // Draw phase overlays (screen space)
  switch (state.phase) {
    case 'entering':
      renderEnteringOverlay(ctx, state);
      break;
    case 'waveComplete':
      renderWaveCompleteOverlay(ctx, state);
      break;
    case 'gameOver':
      renderGameOverOverlay(ctx, state);
      break;
    case 'victory':
      renderVictoryOverlay(ctx, state);
      break;
  }
}

function renderBackground(ctx: CanvasRenderingContext2D, state: VectorState): void {
  const { viewportWidth, viewportHeight, segmentBackgrounds } = VM_CONFIG;
  
  // Get colors for current segment (1-3 mapped to 0-2 index)
  const segmentIndex = Math.min(state.currentSegment - 1, segmentBackgrounds.length - 1);
  const colors = segmentBackgrounds[segmentIndex];
  
  // Fixed radial gradient centered on screen
  const gradient = ctx.createRadialGradient(
    viewportWidth / 2, viewportHeight / 2, 0,
    viewportWidth / 2, viewportHeight / 2, viewportWidth
  );
  gradient.addColorStop(0, colors.bg2);
  gradient.addColorStop(1, colors.bg1);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, viewportWidth, viewportHeight);
}

function renderGrid(ctx: CanvasRenderingContext2D, state: VectorState): void {
  const { viewportWidth, viewportHeight, segmentBackgrounds } = VM_CONFIG;
  const gridSize = 60;
  
  // Get grid color for current segment
  const segmentIndex = Math.min(state.currentSegment - 1, segmentBackgrounds.length - 1);
  const gridColor = segmentBackgrounds[segmentIndex].grid;
  
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  
  // Calculate grid offset based on camera position for endless scrolling effect
  const offsetX = ((state.cameraX % gridSize) + gridSize) % gridSize;
  const offsetY = ((state.cameraY % gridSize) + gridSize) % gridSize;
  
  // Vertical lines (scroll with camera)
  for (let x = -offsetX; x < viewportWidth + gridSize; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, viewportHeight);
    ctx.stroke();
  }
  
  // Horizontal lines (scroll with camera)
  for (let y = -offsetY; y < viewportHeight + gridSize; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(viewportWidth, y);
    ctx.stroke();
  }
}

function renderSalvage(ctx: CanvasRenderingContext2D, state: VectorState): void {
  for (const salvage of state.salvage) {
    const screen = worldToScreen(salvage.x, salvage.y, state);
    const pulse = Math.sin(state.gameTime * 0.1 + salvage.x) * 0.2 + 0.8;
    
    // Glow
    ctx.save();
    ctx.globalAlpha = 0.5 * pulse;
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Core
    ctx.fillStyle = '#88ffaa';
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderPowerUps(ctx: CanvasRenderingContext2D, state: VectorState): void {
  for (const powerUp of state.powerups) {
    const screen = worldToScreen(powerUp.x, powerUp.y, state);
    const pulse = Math.sin(state.gameTime * 0.15 + powerUp.x) * 0.3 + 0.7;
    const color = VM_CONFIG.powerUpColors[powerUp.type];
    const size = VM_CONFIG.powerUpSize;
    
    ctx.save();
    ctx.translate(screen.x, screen.y);
    
    // Outer glow ring
    ctx.globalAlpha = 0.4 * pulse;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(0, 0, size + 4, 0, Math.PI * 2);
    ctx.stroke();
    
    // Rotating hexagon
    ctx.globalAlpha = 0.8;
    ctx.rotate(state.gameTime * 0.05);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * size;
      const y = Math.sin(angle) * size;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    
    // Icon in center
    ctx.globalAlpha = 1;
    ctx.fillStyle = color;
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    let icon = '?';
    switch (powerUp.type) {
      case 'shield': icon = '🛡'; break;
      case 'nuke': icon = '💥'; break;
      case 'doublePoints': icon = '×2'; break;
      case 'doubleShot': icon = '⚡'; break;
      case 'speedBoost': icon = '🚀'; break;
    }
    ctx.fillText(icon, 0, 0);
    
    ctx.restore();
    
    // Despawn warning flash
    if (powerUp.life < 120 && powerUp.life % 20 < 10) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, size + 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

function renderProjectiles(ctx: CanvasRenderingContext2D, state: VectorState): void {
  for (const proj of state.projectiles) {
    const screen = worldToScreen(proj.x, proj.y, state);
    ctx.save();
    
    if (proj.isPlayer) {
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#00ffff';
    } else {
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#ff4444';
    }
    
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, proj.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function renderEnemies(ctx: CanvasRenderingContext2D, state: VectorState): void {
  for (const enemy of state.enemies) {
    const color = VM_CONFIG.enemyColors[enemy.type];
    const healthPercent = enemy.health / enemy.maxHealth;
    const screen = worldToScreen(enemy.x, enemy.y, state);
    
    ctx.save();
    ctx.translate(screen.x, screen.y);
    
    // Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    
    // Body
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    switch (enemy.type) {
      case 'drone':
        // Triangle drone
        ctx.beginPath();
        ctx.moveTo(enemy.size, 0);
        ctx.lineTo(-enemy.size * 0.6, enemy.size * 0.7);
        ctx.lineTo(-enemy.size * 0.6, -enemy.size * 0.7);
        ctx.closePath();
        ctx.stroke();
        break;
        
      case 'shooter':
        // Diamond shape
        ctx.beginPath();
        ctx.moveTo(0, -enemy.size);
        ctx.lineTo(enemy.size, 0);
        ctx.lineTo(0, enemy.size);
        ctx.lineTo(-enemy.size, 0);
        ctx.closePath();
        ctx.stroke();
        
        // Inner dot
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'elite':
        // Hexagon
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * enemy.size;
          const y = Math.sin(angle) * enemy.size;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        
        // Inner circle
        ctx.beginPath();
        ctx.arc(0, 0, enemy.size * 0.4, 0, Math.PI * 2);
        ctx.stroke();
        break;
        
      case 'bounty':
        // Large octagon with inner details
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 - Math.PI / 8;
          const x = Math.cos(angle) * enemy.size;
          const y = Math.sin(angle) * enemy.size;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        
        // Inner details
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, enemy.size * 0.5, 0, Math.PI * 2);
        ctx.stroke();
        
        // Core
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
    
    ctx.restore();
    
    // Health bar (for elites and bounty)
    if ((enemy.type === 'elite' || enemy.type === 'bounty') && healthPercent < 1) {
      const barWidth = enemy.size * 2;
      const barHeight = 3;
      const barX = screen.x - barWidth / 2;
      const barY = screen.y - enemy.size - 8;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      ctx.fillStyle = color;
      ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    }
  }
}

function renderPlayer(ctx: CanvasRenderingContext2D, state: VectorState): void {
  const screen = worldToScreen(state.playerX, state.playerY, state);
  
  ctx.save();
  ctx.translate(screen.x, screen.y);
  ctx.rotate(state.playerAngle + Math.PI / 2); // Rotate ship to face movement direction
  
  // Invulnerability flash
  if (state.invulnerableTimer > 0 && Math.floor(state.invulnerableTimer / 4) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }
  
  // Shield indicator
  if (state.shields > 0) {
    ctx.strokeStyle = '#00aaff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5 + Math.sin(state.gameTime * 0.1) * 0.2;
    ctx.beginPath();
    ctx.arc(0, 0, VM_CONFIG.playerSize + 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  
  // Draw the mega ship
  const megaShipId = getStoredMegaShipId();
  const skinColors = getStoredSkinColors();
  drawMegaShip(ctx, 0, 0, megaShipId, state.gameTime * 0.003, skinColors);
  
  ctx.restore();
  
  // Magnet range indicator (subtle)
  if (state.salvage.length > 0) {
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, state.stats.magnetRange, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function renderParticles(ctx: CanvasRenderingContext2D, state: VectorState): void {
  for (const particle of state.particles) {
    const screen = worldToScreen(particle.x, particle.y, state);
    const alpha = particle.life / particle.maxLife;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, particle.size * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function renderHUD(ctx: CanvasRenderingContext2D, state: VectorState): void {
  const { viewportWidth, viewportHeight } = VM_CONFIG;
  
  // Top bar
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, viewportWidth, 30);
  
  ctx.font = 'bold 14px monospace';
  ctx.textBaseline = 'middle';
  
  // Wave indicator
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText(`WAVE ${state.currentWave}/9`, 10, 15);
  
  // Score
  ctx.textAlign = 'center';
  ctx.fillText(`SCORE: ${Math.floor(state.score)}`, viewportWidth / 2, 15);
  
  // Salvage
  ctx.textAlign = 'right';
  ctx.fillStyle = '#00ff88';
  ctx.fillText(`SALVAGE: ${state.salvageCount}`, viewportWidth - 10, 15);
  
  // Health bar (bottom left)
  const healthBarWidth = 100;
  const healthBarHeight = 8;
  const healthBarX = 10;
  const healthBarY = viewportHeight - 20;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
  
  const healthPercent = state.health / state.maxHealth;
  const healthColor = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffaa00' : '#ff0000';
  ctx.fillStyle = healthColor;
  ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercent, healthBarHeight);
  
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
  
  // Shields indicator
  if (state.shields > 0) {
    ctx.fillStyle = '#00aaff';
    for (let i = 0; i < state.shields; i++) {
      ctx.beginPath();
      ctx.arc(healthBarX + healthBarWidth + 15 + i * 15, healthBarY + 4, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Combo indicator
  if (state.combo > 1) {
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${state.combo}x COMBO`, viewportWidth - 10, healthBarY + 4);
  }
  
  // Active power-ups indicator (top right area)
  const activePowerUps: { name: string; color: string; remaining: number }[] = [];
  
  if (state.activePowerUps.doublePoints > 0) {
    activePowerUps.push({ 
      name: '×2 POINTS', 
      color: VM_CONFIG.powerUpColors.doublePoints,
      remaining: state.activePowerUps.doublePoints 
    });
  }
  if (state.activePowerUps.doubleShot > 0) {
    activePowerUps.push({ 
      name: '×2 SHOT', 
      color: VM_CONFIG.powerUpColors.doubleShot,
      remaining: state.activePowerUps.doubleShot 
    });
  }
  if (state.activePowerUps.speedBoost > 0) {
    activePowerUps.push({ 
      name: 'SPEED', 
      color: VM_CONFIG.powerUpColors.speedBoost,
      remaining: state.activePowerUps.speedBoost 
    });
  }
  
  if (activePowerUps.length > 0) {
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'right';
    
    activePowerUps.forEach((powerUp, index) => {
      const y = 50 + index * 20;
      const barWidth = 60;
      const barHeight = 12;
      const barX = viewportWidth - 15 - barWidth;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, y - 6, barWidth, barHeight);
      
      const progress = powerUp.remaining / VM_CONFIG.powerUpDuration;
      ctx.fillStyle = powerUp.color;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(barX, y - 6, barWidth * progress, barHeight);
      ctx.globalAlpha = 1;
      
      ctx.fillStyle = '#ffffff';
      ctx.fillText(powerUp.name, viewportWidth - 20 - barWidth, y);
    });
  }
}

function renderEnteringOverlay(ctx: CanvasRenderingContext2D, state: VectorState): void {
  const { viewportWidth: arenaWidth, viewportHeight: arenaHeight } = VM_CONFIG;
  const centerX = arenaWidth / 2;
  const centerY = arenaHeight / 2;
  const t = state.gameTime;
  
  // Dark overlay with scanlines
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(0, 0, arenaWidth, arenaHeight);
  
  // Animated horizontal scanlines (CRT effect)
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  for (let y = (t * 3) % 4; y < arenaHeight; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(arenaWidth, y);
    ctx.stroke();
  }
  
  // TRON-style perspective grid floor
  ctx.save();
  const horizonY = centerY + 100;
  const gridPulse = Math.sin(t * 0.03) * 0.3 + 0.7;
  
  // Horizontal lines (receding)
  ctx.strokeStyle = `rgba(255, 0, 255, ${0.4 * gridPulse})`;
  ctx.lineWidth = 1;
  for (let i = 0; i < 12; i++) {
    const yOffset = i * 25;
    const fadeAlpha = 1 - (i / 12);
    ctx.globalAlpha = fadeAlpha * gridPulse;
    ctx.beginPath();
    ctx.moveTo(0, horizonY + yOffset);
    ctx.lineTo(arenaWidth, horizonY + yOffset);
    ctx.stroke();
  }
  
  // Vertical converging lines
  ctx.strokeStyle = `rgba(0, 255, 255, ${0.5 * gridPulse})`;
  for (let i = -6; i <= 6; i++) {
    const startX = centerX + i * 80;
    const endX = centerX + i * 15;
    ctx.globalAlpha = (1 - Math.abs(i) / 8) * gridPulse;
    ctx.beginPath();
    ctx.moveTo(startX, arenaHeight);
    ctx.lineTo(endX, horizonY);
    ctx.stroke();
  }
  ctx.restore();
  
  // Animated rotating hexagon frame
  ctx.save();
  ctx.translate(centerX, centerY - 40);
  ctx.rotate(t * 0.01);
  const hexSize = 120 + Math.sin(t * 0.05) * 10;
  ctx.strokeStyle = '#ff00ff';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#ff00ff';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * hexSize;
    const y = Math.sin(angle) * hexSize;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  
  // Inner counter-rotating hexagon
  ctx.rotate(-t * 0.02);
  const innerHexSize = 80 + Math.sin(t * 0.07) * 8;
  ctx.strokeStyle = '#00ffff';
  ctx.shadowColor = '#00ffff';
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const x = Math.cos(angle) * innerHexSize;
    const y = Math.sin(angle) * innerHexSize;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
  
  // Glowing corner triangles (vector style)
  const triangleSize = 50;
  const cornerOffset = 30;
  ctx.fillStyle = 'rgba(255, 0, 255, 0.3)';
  ctx.shadowColor = '#ff00ff';
  ctx.shadowBlur = 15;
  
  // Top-left triangle
  ctx.beginPath();
  ctx.moveTo(cornerOffset, cornerOffset);
  ctx.lineTo(cornerOffset + triangleSize, cornerOffset);
  ctx.lineTo(cornerOffset, cornerOffset + triangleSize);
  ctx.closePath();
  ctx.fill();
  
  // Top-right triangle
  ctx.beginPath();
  ctx.moveTo(arenaWidth - cornerOffset, cornerOffset);
  ctx.lineTo(arenaWidth - cornerOffset - triangleSize, cornerOffset);
  ctx.lineTo(arenaWidth - cornerOffset, cornerOffset + triangleSize);
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
  ctx.shadowColor = '#00ffff';
  
  // Bottom-left triangle
  ctx.beginPath();
  ctx.moveTo(cornerOffset, arenaHeight - cornerOffset);
  ctx.lineTo(cornerOffset + triangleSize, arenaHeight - cornerOffset);
  ctx.lineTo(cornerOffset, arenaHeight - cornerOffset - triangleSize);
  ctx.closePath();
  ctx.fill();
  
  // Bottom-right triangle
  ctx.beginPath();
  ctx.moveTo(arenaWidth - cornerOffset, arenaHeight - cornerOffset);
  ctx.lineTo(arenaWidth - cornerOffset - triangleSize, arenaHeight - cornerOffset);
  ctx.lineTo(arenaWidth - cornerOffset, arenaHeight - cornerOffset - triangleSize);
  ctx.closePath();
  ctx.fill();
  
  ctx.shadowBlur = 0;
  
  // Title: "VECTOR" with hard-edge vector style
  ctx.save();
  ctx.shadowColor = '#ff00ff';
  ctx.shadowBlur = 40;
  ctx.fillStyle = '#ff00ff';
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VECTOR', centerX, centerY - 70);
  
  // Double stroke effect
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.strokeText('VECTOR', centerX, centerY - 70);
  
  // "MANIAC" with cyan glow
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 40;
  ctx.fillStyle = '#00ffff';
  ctx.fillText('MANIAC', centerX, centerY - 15);
  ctx.strokeStyle = '#ffffff';
  ctx.strokeText('MANIAC', centerX, centerY - 15);
  ctx.restore();
  
  // Subtitle with tech style
  ctx.fillStyle = '#888888';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('[ TACTICAL ARENA COMBAT SYSTEM v2.0 ]', centerX, centerY + 30);
  
  // Animated "INITIALIZING" / "READY" text
  const phase = Math.floor(t / 30) % 3;
  const blink = Math.sin(t * 0.15) > 0;
  
  ctx.save();
  if (blink) {
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ffff00';
  } else {
    ctx.fillStyle = '#ffff0080';
  }
  ctx.font = 'bold 18px monospace';
  
  const statusTexts = ['>> SYSTEMS ONLINE <<', '>> WEAPONS HOT <<', '>> ENGAGE <<'];
  ctx.fillText(statusTexts[phase], centerX, centerY + 80);
  ctx.restore();
  
  // Bottom status bar
  const barY = arenaHeight - 60;
  ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
  ctx.fillRect(60, barY, arenaWidth - 120, 30);
  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 1;
  ctx.strokeRect(60, barY, arenaWidth - 120, 30);
  
  // Loading bar animation
  const loadProgress = Math.min(1, t / 60);
  ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
  ctx.fillRect(62, barY + 2, (arenaWidth - 124) * loadProgress, 26);
  
  // Status text
  ctx.fillStyle = '#ffffff';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('DRAG TO NAVIGATE // MOVEMENT = FIRE', centerX, barY + 18);
  
  // Decorative data streams on sides
  ctx.font = '8px monospace';
  ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
  ctx.textAlign = 'left';
  const dataChars = '01';
  for (let i = 0; i < 20; i++) {
    const y = 100 + i * 30 + ((t * 2) % 30);
    if (y < arenaHeight - 100) {
      const char = dataChars[Math.floor(Math.random() * 2)];
      ctx.fillText(char.repeat(8), 15, y);
      ctx.fillText(char.repeat(8), arenaWidth - 55, y);
    }
  }
}

function renderWaveCompleteOverlay(ctx: CanvasRenderingContext2D, state: VectorState): void {
  const { viewportWidth: arenaWidth, viewportHeight: arenaHeight } = VM_CONFIG;
  
  ctx.fillStyle = 'rgba(0, 255, 0, 0.9)';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`WAVE ${state.currentWave} COMPLETE`, arenaWidth / 2, arenaHeight / 2);
  
  ctx.font = '14px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`Next wave in ${Math.ceil(state.phaseTimer / 60)}...`, arenaWidth / 2, arenaHeight / 2 + 30);
}

function renderGameOverOverlay(ctx: CanvasRenderingContext2D, state: VectorState): void {
  const { viewportWidth: arenaWidth, viewportHeight: arenaHeight } = VM_CONFIG;
  
  // Darken background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, arenaWidth, arenaHeight);
  
  ctx.fillStyle = '#ff4444';
  ctx.font = 'bold 32px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GAME OVER', arenaWidth / 2, arenaHeight / 2 - 40);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = '18px monospace';
  ctx.fillText(`Final Score: ${Math.floor(state.score)}`, arenaWidth / 2, arenaHeight / 2 + 10);
  ctx.fillText(`Salvage: ${state.salvageCount}`, arenaWidth / 2, arenaHeight / 2 + 35);
  ctx.fillText(`Wave: ${state.currentWave}/9`, arenaWidth / 2, arenaHeight / 2 + 60);
}

function renderVictoryOverlay(ctx: CanvasRenderingContext2D, state: VectorState): void {
  const { viewportWidth: arenaWidth, viewportHeight: arenaHeight } = VM_CONFIG;
  
  // Celebration background
  ctx.fillStyle = 'rgba(0, 50, 0, 0.7)';
  ctx.fillRect(0, 0, arenaWidth, arenaHeight);
  
  ctx.fillStyle = '#00ff00';
  ctx.font = 'bold 32px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VICTORY!', arenaWidth / 2, arenaHeight / 2 - 40);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = '18px monospace';
  ctx.fillText(`Final Score: ${Math.floor(state.score)}`, arenaWidth / 2, arenaHeight / 2 + 10);
  ctx.fillText(`Total Salvage: ${state.salvageCount}`, arenaWidth / 2, arenaHeight / 2 + 35);
}
