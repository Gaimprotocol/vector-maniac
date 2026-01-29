// Arena Battle Mode Renderer

import { ArenaState } from './types';
import { ARENA_CONFIG } from './constants';
import { drawMegaShip } from '../megaShipRenderer';
import { getShipProjectileStyle } from '../vectorManiac/shipProjectiles';
import { getStoredMegaShipId } from '@/hooks/useMegaShips';

export function renderArena(
  ctx: CanvasRenderingContext2D, 
  state: ArenaState,
  canvasWidth: number,
  canvasHeight: number
): void {
  // Calculate scale to fit arena in canvas
  const scaleX = canvasWidth / state.arenaWidth;
  const scaleY = canvasHeight / state.arenaHeight;
  const scale = Math.min(scaleX, scaleY);
  
  // Center arena in canvas
  const offsetX = (canvasWidth - state.arenaWidth * scale) / 2;
  const offsetY = (canvasHeight - state.arenaHeight * scale) / 2;
  
  ctx.save();
  
  // Apply screen shake
  if (state.screenShakeIntensity > 0) {
    const shakeX = (Math.random() - 0.5) * state.screenShakeIntensity;
    const shakeY = (Math.random() - 0.5) * state.screenShakeIntensity;
    ctx.translate(shakeX, shakeY);
  }
  
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);
  
  // Draw arena background
  renderArenaBackground(ctx, state);
  
  // Draw obstacles
  renderObstacles(ctx, state);
  
  // Draw projectiles
  renderProjectiles(ctx, state);
  
  // Draw particles
  renderParticles(ctx, state);
  
  // Draw opponent
  if (state.opponent && state.phase !== 'playerWon') {
    renderOpponent(ctx, state);
  }
  
  // Draw player (hide during death)
  if (state.phase !== 'playerLost' && state.phase !== 'rewards') {
    renderPlayer(ctx, state);
  }
  
  // Draw HUD
  renderArenaHUD(ctx, state);
  
  // Draw phase overlays
  renderPhaseOverlay(ctx, state);
  
  ctx.restore();
}

function renderArenaBackground(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  // Dark background
  ctx.fillStyle = ARENA_CONFIG.arenaBackgroundColor;
  ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
  
  // Grid
  ctx.strokeStyle = ARENA_CONFIG.gridColor;
  ctx.lineWidth = 1;
  
  const gridSize = 40;
  for (let x = 0; x <= state.arenaWidth; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, state.arenaHeight);
    ctx.stroke();
  }
  for (let y = 0; y <= state.arenaHeight; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(state.arenaWidth, y);
    ctx.stroke();
  }
  
  // Arena border with glow
  ctx.strokeStyle = '#ff4466';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#ff4466';
  ctx.shadowBlur = 20;
  ctx.strokeRect(5, 5, state.arenaWidth - 10, state.arenaHeight - 10);
  ctx.shadowBlur = 0;
  
  // Corner decorations
  const cornerSize = 30;
  ctx.fillStyle = '#ff4466';
  
  // Top-left
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(cornerSize, 0);
  ctx.lineTo(0, cornerSize);
  ctx.closePath();
  ctx.fill();
  
  // Top-right
  ctx.beginPath();
  ctx.moveTo(state.arenaWidth, 0);
  ctx.lineTo(state.arenaWidth - cornerSize, 0);
  ctx.lineTo(state.arenaWidth, cornerSize);
  ctx.closePath();
  ctx.fill();
  
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(0, state.arenaHeight);
  ctx.lineTo(cornerSize, state.arenaHeight);
  ctx.lineTo(0, state.arenaHeight - cornerSize);
  ctx.closePath();
  ctx.fill();
  
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(state.arenaWidth, state.arenaHeight);
  ctx.lineTo(state.arenaWidth - cornerSize, state.arenaHeight);
  ctx.lineTo(state.arenaWidth, state.arenaHeight - cornerSize);
  ctx.closePath();
  ctx.fill();
}

function renderObstacles(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  for (const obs of state.obstacles) {
    ctx.save();
    ctx.translate(obs.x, obs.y);
    
    const halfW = obs.width / 2;
    const halfH = obs.height / 2;
    
    // Shadow/glow
    ctx.shadowColor = obs.destructible ? '#ffaa00' : '#445566';
    ctx.shadowBlur = 10;
    
    // Main obstacle
    ctx.fillStyle = obs.destructible ? '#554422' : ARENA_CONFIG.obstacleColor;
    
    if (obs.type === 'pillar') {
      // Octagonal pillar
      ctx.beginPath();
      const r = halfW;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 - Math.PI / 8;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      
      // Inner detail
      ctx.fillStyle = obs.destructible ? '#665533' : '#445566';
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 - Math.PI / 8;
        const x = Math.cos(angle) * (r * 0.6);
        const y = Math.sin(angle) * (r * 0.6);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    } else {
      // Wall
      ctx.fillRect(-halfW, -halfH, obs.width, obs.height);
      
      // Inner detail
      ctx.fillStyle = '#445566';
      ctx.fillRect(-halfW + 4, -halfH + 4, obs.width - 8, obs.height - 8);
    }
    
    // Destructible indicator
    if (obs.destructible && obs.health !== undefined) {
      ctx.fillStyle = '#ffaa00';
      ctx.font = '10px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText('⚠', 0, 4);
    }
    
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

function renderProjectiles(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  for (const proj of state.projectiles) {
    ctx.save();
    ctx.translate(proj.x, proj.y);
    
    // Get style based on ship
    const style = proj.shipId ? getShipProjectileStyle(proj.shipId) : null;
    const color = style?.color || (proj.isPlayer ? ARENA_CONFIG.playerColor : ARENA_CONFIG.opponentColor);
    const glowColor = style?.glowColor || color;
    
    ctx.fillStyle = color;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 10;
    
    // Draw projectile
    ctx.beginPath();
    ctx.arc(0, 0, proj.size * (style?.size || 1), 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

function renderParticles(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  for (const p of state.particles) {
    const alpha = p.life / p.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 5;
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
}

function renderPlayer(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  ctx.save();
  ctx.translate(state.playerX, state.playerY);
  ctx.rotate(state.playerAngle);
  
  // Invulnerability flash
  if (state.playerInvulnerable > 0 && Math.floor(state.gameTime / 4) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }
  
  // Use player's ship model
  const shipId = getStoredMegaShipId();
  drawMegaShip(ctx, 0, 0, shipId, state.gameTime);
  
  ctx.restore();
  
  // Health bar under player
  const barWidth = 40;
  const barHeight = 4;
  const barX = state.playerX - barWidth / 2;
  const barY = state.playerY + 25;
  
  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
  
  // Health
  const healthPercent = state.playerHealth / state.playerMaxHealth;
  const healthColor = healthPercent > 0.5 ? ARENA_CONFIG.playerColor : 
                      healthPercent > 0.25 ? '#ffaa00' : '#ff4444';
  ctx.fillStyle = healthColor;
  ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
}

function renderOpponent(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  if (!state.opponent) return;
  
  const opp = state.opponent;
  
  ctx.save();
  ctx.translate(opp.x, opp.y);
  ctx.rotate(opp.angle);
  
  // Render opponent's ship (tinted red)
  ctx.save();
  
  // Draw a colored overlay effect
  drawMegaShip(ctx, 0, 0, opp.shipId, state.gameTime);
  
  // Red tint overlay
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = 'rgba(255, 68, 102, 0.3)';
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
  ctx.restore();
  
  // Health bar above opponent
  const barWidth = 50;
  const barHeight = 5;
  const barX = opp.x - barWidth / 2;
  const barY = opp.y - 35;
  
  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
  
  // Health
  const healthPercent = opp.health / opp.maxHealth;
  ctx.fillStyle = ARENA_CONFIG.opponentColor;
  ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
  
  // Opponent name
  ctx.fillStyle = ARENA_CONFIG.opponentColor;
  ctx.font = '10px Orbitron';
  ctx.textAlign = 'center';
  ctx.shadowColor = ARENA_CONFIG.opponentColor;
  ctx.shadowBlur = 5;
  ctx.fillText(opp.name, opp.x, barY - 5);
  ctx.shadowBlur = 0;
}

function renderArenaHUD(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  // Difficulty badge
  const diffColors: Record<string, string> = {
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    diamond: '#b9f2ff',
  };
  
  ctx.fillStyle = diffColors[state.difficulty];
  ctx.font = '12px Orbitron';
  ctx.textAlign = 'left';
  ctx.shadowColor = diffColors[state.difficulty];
  ctx.shadowBlur = 5;
  ctx.fillText(`◆ ${state.difficulty.toUpperCase()} ARENA`, 15, 25);
  ctx.shadowBlur = 0;
  
  // Match timer / phase indicator
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = '10px Orbitron';
  
  if (state.phase === 'fighting' && state.opponent) {
    const timeInSeconds = Math.floor(state.gameTime / 60);
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')}`, state.arenaWidth / 2, 25);
  }
}

function renderPhaseOverlay(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const centerX = state.arenaWidth / 2;
  const centerY = state.arenaHeight / 2;
  
  switch (state.phase) {
    case 'entering':
      // "VS" screen
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '40px Orbitron';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ff4466';
      ctx.shadowBlur = 20;
      ctx.fillText('VS', centerX, centerY);
      ctx.shadowBlur = 0;
      
      // Player label
      ctx.fillStyle = ARENA_CONFIG.playerColor;
      ctx.font = '16px Orbitron';
      ctx.fillText('YOU', centerX, centerY + 80);
      
      // Opponent label
      ctx.fillStyle = ARENA_CONFIG.opponentColor;
      ctx.fillText(state.opponent?.name || 'OPPONENT', centerX, centerY - 50);
      break;
      
    case 'countdown':
      const countdown = Math.ceil(state.phaseTimer / 60);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
      
      ctx.fillStyle = countdown === 1 ? '#00ff88' : '#ffffff';
      ctx.font = '80px Orbitron';
      ctx.textAlign = 'center';
      ctx.shadowColor = countdown === 1 ? '#00ff88' : '#ff4466';
      ctx.shadowBlur = 30;
      ctx.fillText(countdown === 0 ? 'FIGHT!' : countdown.toString(), centerX, centerY + 20);
      ctx.shadowBlur = 0;
      break;
      
    case 'playerWon':
      ctx.fillStyle = 'rgba(0, 40, 20, 0.8)';
      ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
      
      ctx.fillStyle = ARENA_CONFIG.playerColor;
      ctx.font = '36px Orbitron';
      ctx.textAlign = 'center';
      ctx.shadowColor = ARENA_CONFIG.playerColor;
      ctx.shadowBlur = 30;
      ctx.fillText('VICTORY!', centerX, centerY);
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Orbitron';
      ctx.fillText('Collecting rewards...', centerX, centerY + 40);
      break;
      
    case 'playerLost':
      ctx.fillStyle = 'rgba(40, 0, 0, 0.8)';
      ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
      
      ctx.fillStyle = ARENA_CONFIG.opponentColor;
      ctx.font = '36px Orbitron';
      ctx.textAlign = 'center';
      ctx.shadowColor = ARENA_CONFIG.opponentColor;
      ctx.shadowBlur = 30;
      ctx.fillText('DEFEATED', centerX, centerY);
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = '#888888';
      ctx.font = '14px Orbitron';
      ctx.fillText('Better luck next time...', centerX, centerY + 40);
      break;
  }
}
