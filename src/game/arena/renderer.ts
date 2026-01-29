// Arena Battle Mode Renderer - High Quality (Matches Main Game)

import { ArenaState } from './types';
import { ARENA_CONFIG } from './constants';
import { drawMegaShip } from '../megaShipRenderer';
import { getShipProjectileStyle, ShipProjectileStyle } from '../vectorManiac/shipProjectiles';
import { getStoredMegaShipId } from '@/hooks/useMegaShips';
import { VM_CONFIG, getMapTheme } from '../vectorManiac/constants';

// Arena color scheme - matches main game aesthetic
const ARENA_COLORS = {
  primary: '#00d4ff',
  secondary: '#0088cc',
  accent: '#66eeff',
  glow: '#00aaff',
  dark: '#001122',
  grid: '#003366',
  player: '#00ff88',
  opponent: '#ff4466',
  energy: '#8866ff',
};

// Animation state
let animationTime = 0;

export function renderArena(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  animationTime = state.gameTime;
  
  ctx.save();
  
  // Apply screen shake
  if (state.screenShakeIntensity > 0) {
    const shakeX = (Math.random() - 0.5) * state.screenShakeIntensity * 2;
    const shakeY = (Math.random() - 0.5) * state.screenShakeIntensity * 2;
    ctx.translate(shakeX, shakeY);
  }
  
  // Render layers (same order as main game)
  renderBackground(ctx, state);
  renderPattern(ctx, state);
  renderObstacles(ctx, state);
  renderProjectiles(ctx, state);
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

function renderBackground(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const { arenaWidth, arenaHeight } = state;
  
  // Arena-specific theme (red tint for battle)
  const gradient = ctx.createRadialGradient(
    arenaWidth / 2, arenaHeight / 2, 0,
    arenaWidth / 2, arenaHeight / 2, arenaWidth / 2
  );
  gradient.addColorStop(0, '#0a0815');
  gradient.addColorStop(0.5, '#050408');
  gradient.addColorStop(1, '#020203');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, arenaWidth, arenaHeight);
  
  // Starfield
  renderStarfield(ctx, state);
}

function renderStarfield(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const { arenaWidth, arenaHeight } = state;
  
  // Use deterministic stars based on seed
  for (let i = 0; i < 80; i++) {
    const seed = i * 137.5;
    const x = ((seed * 7.3) % arenaWidth);
    const y = ((seed * 11.7) % arenaHeight);
    const size = 0.5 + (i % 3) * 0.5;
    const twinkle = Math.sin(animationTime * 0.05 + seed) * 0.3 + 0.7;
    
    ctx.globalAlpha = 0.3 + twinkle * 0.4;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function renderPattern(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const { arenaWidth, arenaHeight } = state;
  const gridSize = 40;
  const offset = (animationTime * 0.3) % gridSize;
  
  ctx.strokeStyle = 'rgba(255, 68, 102, 0.04)';
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
  
  // Central arena marker
  renderArenaBorder(ctx, state);
}

function renderArenaBorder(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const { arenaWidth, arenaHeight } = state;
  const padding = ARENA_CONFIG.arenaPadding;
  const pulseIntensity = Math.sin(animationTime * 0.05) * 0.3 + 0.7;
  
  // Outer glow border
  ctx.strokeStyle = ARENA_COLORS.opponent;
  ctx.lineWidth = 2;
  ctx.shadowColor = ARENA_COLORS.opponent;
  ctx.shadowBlur = 15 * pulseIntensity;
  ctx.strokeRect(padding, padding, arenaWidth - padding * 2, arenaHeight - padding * 2);
  
  // Inner border
  ctx.strokeStyle = `rgba(255, 68, 102, 0.3)`;
  ctx.lineWidth = 1;
  ctx.shadowBlur = 0;
  ctx.strokeRect(padding + 5, padding + 5, arenaWidth - padding * 2 - 10, arenaHeight - padding * 2 - 10);
  
  // Corner decorations
  renderCornerDecorations(ctx, state);
}

function renderCornerDecorations(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const { arenaWidth, arenaHeight } = state;
  const padding = ARENA_CONFIG.arenaPadding;
  
  const corners = [
    { x: padding, y: padding, rot: 0 },
    { x: arenaWidth - padding, y: padding, rot: Math.PI / 2 },
    { x: arenaWidth - padding, y: arenaHeight - padding, rot: Math.PI },
    { x: padding, y: arenaHeight - padding, rot: -Math.PI / 2 },
  ];
  
  ctx.strokeStyle = ARENA_COLORS.opponent;
  ctx.lineWidth = 2;
  ctx.shadowColor = ARENA_COLORS.opponent;
  ctx.shadowBlur = 10;
  
  for (const corner of corners) {
    ctx.save();
    ctx.translate(corner.x, corner.y);
    ctx.rotate(corner.rot);
    
    // Tech corner bracket
    ctx.beginPath();
    ctx.moveTo(5, 35);
    ctx.lineTo(5, 5);
    ctx.lineTo(35, 5);
    ctx.stroke();
    
    ctx.restore();
  }
  
  ctx.shadowBlur = 0;
}

function renderObstacles(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  for (const obs of state.obstacles) {
    ctx.save();
    ctx.translate(obs.x, obs.y);
    
    const halfW = obs.width / 2;
    const halfH = obs.height / 2;
    const pulseIntensity = Math.sin(animationTime * 0.05 + obs.x * 0.01) * 0.2 + 0.8;
    
    if (obs.type === 'pillar') {
      renderHexPillar(ctx, halfW, pulseIntensity, obs.destructible);
    } else {
      renderTechWall(ctx, halfW, halfH, pulseIntensity, obs.destructible);
    }
    
    ctx.restore();
  }
}

function renderHexPillar(ctx: CanvasRenderingContext2D, radius: number, pulse: number, destructible: boolean): void {
  const color = destructible ? '#ffaa00' : ARENA_COLORS.primary;
  const glowColor = destructible ? '#ff8800' : ARENA_COLORS.glow;
  
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 20 * pulse;
  
  // Main hexagon
  ctx.fillStyle = '#0a1520';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Inner hexagon
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * (radius * 0.6);
    const y = Math.sin(angle) * (radius * 0.6);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  
  // Center glow
  ctx.globalAlpha = pulse;
  const dotGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
  dotGradient.addColorStop(0, color);
  dotGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = dotGradient;
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

function renderTechWall(ctx: CanvasRenderingContext2D, halfW: number, halfH: number, pulse: number, destructible: boolean): void {
  const color = destructible ? '#ffaa00' : ARENA_COLORS.primary;
  const glowColor = destructible ? '#ff8800' : ARENA_COLORS.glow;
  
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 15 * pulse;
  
  // Wall body
  ctx.fillStyle = '#0a1520';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  
  const bevel = 5;
  ctx.beginPath();
  ctx.moveTo(-halfW + bevel, -halfH);
  ctx.lineTo(halfW - bevel, -halfH);
  ctx.lineTo(halfW, -halfH + bevel);
  ctx.lineTo(halfW, halfH - bevel);
  ctx.lineTo(halfW - bevel, halfH);
  ctx.lineTo(-halfW + bevel, halfH);
  ctx.lineTo(-halfW, halfH - bevel);
  ctx.lineTo(-halfW, -halfH + bevel);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

function renderProjectiles(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  for (const proj of state.projectiles) {
    ctx.save();
    
    if (proj.isPlayer) {
      // Player bullets - use ship-specific styling (SAME AS MAIN GAME)
      const style = proj.shipId ? getShipProjectileStyle(proj.shipId) : getShipProjectileStyle('default');
      const size = proj.size * style.size;
      
      ctx.shadowColor = style.glowColor;
      ctx.shadowBlur = 8;
      
      // Draw trail if enabled
      if (style.trailLength > 0) {
        const angle = Math.atan2(proj.vy, proj.vx);
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = style.color;
        ctx.lineWidth = size * 0.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(proj.x, proj.y);
        ctx.lineTo(
          proj.x - Math.cos(angle) * size * style.trailLength * 3,
          proj.y - Math.sin(angle) * size * style.trailLength * 3
        );
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      
      // Draw projectile based on shape (SAME AS MAIN GAME)
      drawPlayerProjectile(ctx, proj.x, proj.y, size, style, proj.vx, proj.vy, state.gameTime);
      
    } else {
      // Enemy bullets - red
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Core
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.size * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
}

// Draw player projectile with ship-specific shape - EXACT COPY FROM MAIN GAME
function drawPlayerProjectile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: ShipProjectileStyle,
  vx: number,
  vy: number,
  gameTime: number
): void {
  const angle = Math.atan2(vy, vx);
  
  ctx.fillStyle = style.color;
  
  switch (style.shape) {
    case 'circle': {
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = style.coreColor;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    
    case 'laser': {
      ctx.strokeStyle = style.color;
      ctx.lineWidth = size * 0.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x - Math.cos(angle) * size * 2, y - Math.sin(angle) * size * 2);
      ctx.lineTo(x + Math.cos(angle) * size * 2, y + Math.sin(angle) * size * 2);
      ctx.stroke();
      ctx.strokeStyle = style.coreColor;
      ctx.lineWidth = size * 0.2;
      ctx.stroke();
      break;
    }
    
    case 'diamond': {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(gameTime * 0.15);
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.6, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size * 0.6, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
    }
    
    case 'star': {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(gameTime * 0.1);
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        ctx.lineTo(Math.cos(a) * size * 1.2, Math.sin(a) * size * 1.2);
        const a2 = ((i + 0.5) / 4) * Math.PI * 2;
        ctx.lineTo(Math.cos(a2) * size * 0.4, Math.sin(a2) * size * 0.4);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
    }
    
    case 'triangle': {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(size * 1.2, 0);
      ctx.lineTo(-size * 0.6, size * 0.8);
      ctx.lineTo(-size * 0.6, -size * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
    }
    
    case 'plasma': {
      const pulseSize = size + Math.sin(gameTime * 0.2) * size * 0.3;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(x, y, pulseSize * 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = style.coreColor;
      ctx.beginPath();
      ctx.arc(x, y, pulseSize * 0.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    
    case 'needle': {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(size * 2, 0);
      ctx.lineTo(-size, size * 0.3);
      ctx.lineTo(-size, -size * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
    }
    
    case 'crescent': {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.arc(0, 0, size, -Math.PI * 0.6, Math.PI * 0.6);
      ctx.arc(size * 0.4, 0, size * 0.7, Math.PI * 0.5, -Math.PI * 0.5, true);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
    }
    
    case 'ring': {
      ctx.strokeStyle = style.color;
      ctx.lineWidth = size * 0.4;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = style.coreColor;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    
    case 'bolt': {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(size * 1.5, 0);
      ctx.lineTo(size * 0.2, size * 0.4);
      ctx.lineTo(size * 0.5, 0);
      ctx.lineTo(-size, size * 0.3);
      ctx.lineTo(-size * 0.3, 0);
      ctx.lineTo(-size, -size * 0.3);
      ctx.lineTo(size * 0.5, 0);
      ctx.lineTo(size * 0.2, -size * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
    }
    
    default: {
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
}

function renderParticles(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  for (const p of state.particles) {
    const alpha = p.life / p.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    
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
  
  // Player shield glow
  const shieldPulse = Math.sin(animationTime * 0.1) * 0.2 + 0.8;
  ctx.strokeStyle = ARENA_COLORS.player;
  ctx.globalAlpha = 0.2 * shieldPulse;
  ctx.lineWidth = 2;
  ctx.shadowColor = ARENA_COLORS.player;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  
  // Use player's ship model (SAME AS MAIN GAME)
  const shipId = getStoredMegaShipId();
  drawMegaShip(ctx, 0, 0, shipId, state.gameTime);
  
  ctx.restore();
  
  // Health bar under player
  renderHealthBar(ctx, state.playerX, state.playerY + 40, 60, 6, 
    state.playerHealth / state.playerMaxHealth, ARENA_COLORS.player);
}

function renderOpponent(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  if (!state.opponent) return;
  
  const opp = state.opponent;
  
  ctx.save();
  ctx.translate(opp.x, opp.y);
  ctx.rotate(opp.angle);
  
  // Opponent shield glow
  const shieldPulse = Math.sin(animationTime * 0.1 + 2) * 0.2 + 0.8;
  ctx.strokeStyle = ARENA_COLORS.opponent;
  ctx.globalAlpha = 0.2 * shieldPulse;
  ctx.lineWidth = 2;
  ctx.shadowColor = ARENA_COLORS.opponent;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(0, 0, 30, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  
  // Render opponent's ship (with red tint)
  ctx.save();
  drawMegaShip(ctx, 0, 0, opp.shipId, state.gameTime);
  
  // Red tint overlay
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = 'rgba(255, 68, 102, 0.3)';
  ctx.beginPath();
  ctx.arc(0, 0, 35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  ctx.restore();
  
  // Health bar above opponent
  renderHealthBar(ctx, opp.x, opp.y - 45, 70, 7, 
    opp.health / opp.maxHealth, ARENA_COLORS.opponent);
  
  // Opponent name with glow
  ctx.fillStyle = ARENA_COLORS.opponent;
  ctx.font = '14px Orbitron';
  ctx.textAlign = 'center';
  ctx.shadowColor = ARENA_COLORS.opponent;
  ctx.shadowBlur = 8;
  ctx.fillText(opp.name, opp.x, opp.y - 55);
  ctx.shadowBlur = 0;
}

function renderHealthBar(
  ctx: CanvasRenderingContext2D, 
  x: number, y: number, 
  width: number, height: number, 
  percent: number, color: string
): void {
  const barX = x - width / 2;
  
  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(barX - 1, y - 1, width + 2, height + 2);
  
  // Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX - 1, y - 1, width + 2, height + 2);
  
  // Health gradient
  const healthGradient = ctx.createLinearGradient(barX, y, barX + width * percent, y);
  healthGradient.addColorStop(0, color);
  healthGradient.addColorStop(1, percent > 0.5 ? color : percent > 0.25 ? '#ffaa00' : '#ff4444');
  
  ctx.fillStyle = healthGradient;
  ctx.shadowColor = color;
  ctx.shadowBlur = 5;
  ctx.fillRect(barX, y, width * percent, height);
  ctx.shadowBlur = 0;
}

function renderArenaHUD(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const { arenaWidth, arenaHeight } = state;
  
  // Difficulty badge
  const diffColors: Record<string, string> = {
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    diamond: '#b9f2ff',
  };
  
  const badgeColor = diffColors[state.difficulty];
  
  // Difficulty indicator with glow
  ctx.fillStyle = badgeColor;
  ctx.font = '16px Orbitron';
  ctx.textAlign = 'left';
  ctx.shadowColor = badgeColor;
  ctx.shadowBlur = 10;
  ctx.fillText(`◆ ${state.difficulty.toUpperCase()} ARENA`, 25, 40);
  ctx.shadowBlur = 0;
  
  // Match timer
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = '14px Orbitron';
  
  if (state.phase === 'fighting' && state.opponent) {
    const timeInSeconds = Math.floor(state.gameTime / 60);
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')}`, arenaWidth / 2, 40);
  }
  
  // Health displays in corners
  ctx.font = '14px Orbitron';
  
  // Player health indicator
  ctx.fillStyle = ARENA_COLORS.player;
  ctx.textAlign = 'right';
  const playerHealthPercent = Math.round((state.playerHealth / state.playerMaxHealth) * 100);
  ctx.fillText(`HULL: ${playerHealthPercent}%`, arenaWidth - 25, 40);
  
  // Opponent health indicator
  if (state.opponent) {
    ctx.fillStyle = ARENA_COLORS.opponent;
    const oppHealthPercent = Math.round((state.opponent.health / state.opponent.maxHealth) * 100);
    ctx.fillText(`ENEMY: ${oppHealthPercent}%`, arenaWidth - 25, 60);
  }
}

function renderPhaseOverlay(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const { arenaWidth, arenaHeight } = state;
  const centerX = arenaWidth / 2;
  const centerY = arenaHeight / 2;
  
  switch (state.phase) {
    case 'entering':
      renderVSScreen(ctx, state, centerX, centerY);
      break;
      
    case 'countdown':
      renderCountdown(ctx, state, centerX, centerY);
      break;
      
    case 'playerWon':
      renderVictoryOverlay(ctx, state, centerX, centerY);
      break;
      
    case 'playerLost':
      renderDefeatOverlay(ctx, state, centerX, centerY);
      break;
  }
}

function renderVSScreen(ctx: CanvasRenderingContext2D, state: ArenaState, centerX: number, centerY: number): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
  
  const scale = 1 + Math.sin(animationTime * 0.1) * 0.1;
  
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(scale, scale);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = '72px Orbitron';
  ctx.textAlign = 'center';
  ctx.shadowColor = ARENA_COLORS.opponent;
  ctx.shadowBlur = 40;
  ctx.fillText('VS', 0, 20);
  ctx.shadowBlur = 0;
  
  ctx.restore();
  
  // Decorative lines
  ctx.strokeStyle = ARENA_COLORS.opponent;
  ctx.lineWidth = 3;
  ctx.shadowColor = ARENA_COLORS.opponent;
  ctx.shadowBlur = 15;
  
  ctx.beginPath();
  ctx.moveTo(centerX - 150, centerY);
  ctx.lineTo(centerX - 60, centerY);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(centerX + 60, centerY);
  ctx.lineTo(centerX + 150, centerY);
  ctx.stroke();
  
  ctx.shadowBlur = 0;
  
  // Player label
  ctx.fillStyle = ARENA_COLORS.player;
  ctx.font = '24px Orbitron';
  ctx.shadowColor = ARENA_COLORS.player;
  ctx.shadowBlur = 15;
  ctx.fillText('YOU', centerX, centerY + 120);
  
  // Opponent label
  ctx.fillStyle = ARENA_COLORS.opponent;
  ctx.shadowColor = ARENA_COLORS.opponent;
  ctx.fillText(state.opponent?.name || 'OPPONENT', centerX, centerY - 80);
  ctx.shadowBlur = 0;
}

function renderCountdown(ctx: CanvasRenderingContext2D, state: ArenaState, centerX: number, centerY: number): void {
  const countdown = Math.ceil(state.phaseTimer / 60);
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
  
  const isGo = countdown === 0;
  const color = isGo ? ARENA_COLORS.player : '#ffffff';
  const text = isGo ? 'FIGHT!' : countdown.toString();
  
  const pulse = 1 + (60 - (state.phaseTimer % 60)) / 60 * 0.3;
  
  ctx.save();
  ctx.translate(centerX, centerY + 20);
  ctx.scale(pulse, pulse);
  
  ctx.fillStyle = color;
  ctx.font = '120px Orbitron';
  ctx.textAlign = 'center';
  ctx.shadowColor = isGo ? ARENA_COLORS.player : ARENA_COLORS.primary;
  ctx.shadowBlur = 50;
  ctx.fillText(text, 0, 0);
  ctx.shadowBlur = 0;
  
  ctx.restore();
}

function renderVictoryOverlay(ctx: CanvasRenderingContext2D, state: ArenaState, centerX: number, centerY: number): void {
  ctx.fillStyle = 'rgba(0, 40, 20, 0.9)';
  ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
  
  const pulse = Math.sin(animationTime * 0.1) * 0.1 + 1;
  
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(pulse, pulse);
  
  ctx.fillStyle = ARENA_COLORS.player;
  ctx.font = '60px Orbitron';
  ctx.textAlign = 'center';
  ctx.shadowColor = ARENA_COLORS.player;
  ctx.shadowBlur = 50;
  ctx.fillText('VICTORY!', 0, 0);
  ctx.shadowBlur = 0;
  
  ctx.restore();
  
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px Orbitron';
  ctx.fillText('Collecting rewards...', centerX, centerY + 70);
}

function renderDefeatOverlay(ctx: CanvasRenderingContext2D, state: ArenaState, centerX: number, centerY: number): void {
  ctx.fillStyle = 'rgba(40, 0, 0, 0.9)';
  ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
  
  ctx.fillStyle = ARENA_COLORS.opponent;
  ctx.font = '60px Orbitron';
  ctx.textAlign = 'center';
  ctx.shadowColor = ARENA_COLORS.opponent;
  ctx.shadowBlur = 50;
  ctx.fillText('DEFEATED', centerX, centerY);
  ctx.shadowBlur = 0;
  
  ctx.fillStyle = '#888888';
  ctx.font = '20px Orbitron';
  ctx.fillText('Better luck next time...', centerX, centerY + 70);
}