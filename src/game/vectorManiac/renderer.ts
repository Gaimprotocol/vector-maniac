// Vector Maniac Renderer

import { VectorState } from './types';
import { VM_CONFIG } from './constants';
import { drawMegaShip } from '../megaShipRenderer';
import { getStoredMegaShipId } from '@/hooks/useMegaShips';
import { getStoredSkinColors } from '@/hooks/useEquipment';

export function renderVectorManiac(ctx: CanvasRenderingContext2D, state: VectorState): void {
  const { arenaWidth, arenaHeight } = VM_CONFIG;
  
  // Clear and draw background
  renderBackground(ctx, state);
  
  // Draw grid
  renderGrid(ctx, state);
  
  // Draw salvage
  renderSalvage(ctx, state);
  
  // Draw projectiles
  renderProjectiles(ctx, state);
  
  // Draw enemies
  renderEnemies(ctx, state);
  
  // Draw player
  renderPlayer(ctx, state);
  
  // Draw particles
  renderParticles(ctx, state);
  
  // Draw HUD
  renderHUD(ctx, state);
  
  // Draw phase overlays
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
  const { arenaWidth, arenaHeight, bgColor1, bgColor2 } = VM_CONFIG;
  
  const gradient = ctx.createRadialGradient(
    arenaWidth / 2, arenaHeight / 2, 0,
    arenaWidth / 2, arenaHeight / 2, arenaWidth / 2
  );
  gradient.addColorStop(0, bgColor2);
  gradient.addColorStop(1, bgColor1);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, arenaWidth, arenaHeight);
}

function renderGrid(ctx: CanvasRenderingContext2D, state: VectorState): void {
  const { arenaWidth, arenaHeight, gridColor } = VM_CONFIG;
  const gridSize = 40;
  const offset = (state.gameTime * 0.5) % gridSize;
  
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  
  // Vertical lines
  for (let x = offset; x < arenaWidth; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, arenaHeight);
    ctx.stroke();
  }
  
  // Horizontal lines
  for (let y = offset; y < arenaHeight; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(arenaWidth, y);
    ctx.stroke();
  }
}

function renderSalvage(ctx: CanvasRenderingContext2D, state: VectorState): void {
  for (const salvage of state.salvage) {
    const pulse = Math.sin(state.gameTime * 0.1 + salvage.x) * 0.2 + 0.8;
    
    // Glow
    ctx.save();
    ctx.globalAlpha = 0.5 * pulse;
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.arc(salvage.x, salvage.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Core
    ctx.fillStyle = '#88ffaa';
    ctx.beginPath();
    ctx.arc(salvage.x, salvage.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderProjectiles(ctx: CanvasRenderingContext2D, state: VectorState): void {
  for (const proj of state.projectiles) {
    ctx.save();
    
    if (proj.isPlayer) {
      // Player bullets - cyan
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#00ffff';
    } else {
      // Enemy bullets - red
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#ff4444';
    }
    
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
}

function renderEnemies(ctx: CanvasRenderingContext2D, state: VectorState): void {
  for (const enemy of state.enemies) {
    const color = VM_CONFIG.enemyColors[enemy.type];
    const healthPercent = enemy.health / enemy.maxHealth;
    
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    
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
      const barX = enemy.x - barWidth / 2;
      const barY = enemy.y - enemy.size - 8;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      ctx.fillStyle = color;
      ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    }
  }
}

function renderPlayer(ctx: CanvasRenderingContext2D, state: VectorState): void {
  ctx.save();
  ctx.translate(state.playerX, state.playerY);
  ctx.rotate(state.playerAngle);
  
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
    ctx.arc(state.playerX, state.playerY, state.stats.magnetRange, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function renderParticles(ctx: CanvasRenderingContext2D, state: VectorState): void {
  for (const particle of state.particles) {
    const alpha = particle.life / particle.maxLife;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function renderHUD(ctx: CanvasRenderingContext2D, state: VectorState): void {
  const { arenaWidth } = VM_CONFIG;
  
  // Top bar
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, arenaWidth, 30);
  
  ctx.font = 'bold 14px monospace';
  ctx.textBaseline = 'middle';
  
  // Wave indicator
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText(`WAVE ${state.currentWave}/9`, 10, 15);
  
  // Score
  ctx.textAlign = 'center';
  ctx.fillText(`SCORE: ${Math.floor(state.score)}`, arenaWidth / 2, 15);
  
  // Salvage
  ctx.textAlign = 'right';
  ctx.fillStyle = '#00ff88';
  ctx.fillText(`SALVAGE: ${state.salvageCount}`, arenaWidth - 10, 15);
  
  // Health bar (bottom left)
  const healthBarWidth = 100;
  const healthBarHeight = 8;
  const healthBarX = 10;
  const healthBarY = VM_CONFIG.arenaHeight - 20;
  
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
    ctx.fillText(`${state.combo}x COMBO`, arenaWidth - 10, healthBarY + 4);
  }
}

function renderEnteringOverlay(ctx: CanvasRenderingContext2D, state: VectorState): void {
  const { arenaWidth, arenaHeight } = VM_CONFIG;
  
  ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GET READY', arenaWidth / 2, arenaHeight / 2 - 30);
  
  ctx.font = '16px monospace';
  ctx.fillText('Drag to move • Auto-fire enabled', arenaWidth / 2, arenaHeight / 2 + 10);
}

function renderWaveCompleteOverlay(ctx: CanvasRenderingContext2D, state: VectorState): void {
  const { arenaWidth, arenaHeight } = VM_CONFIG;
  
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
  const { arenaWidth, arenaHeight } = VM_CONFIG;
  
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
  const { arenaWidth, arenaHeight } = VM_CONFIG;
  
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
