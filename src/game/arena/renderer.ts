// Arena Battle Mode Renderer - High Quality Tron-Inspired Graphics

import { ArenaState } from './types';
import { ARENA_CONFIG } from './constants';
import { drawMegaShip } from '../megaShipRenderer';
import { getShipProjectileStyle } from '../vectorManiac/shipProjectiles';
import { getStoredMegaShipId } from '@/hooks/useMegaShips';

// Arena color scheme - Cyan/Blue Tron aesthetic
const ARENA_COLORS = {
  primary: '#00d4ff',      // Bright cyan
  secondary: '#0088cc',    // Medium blue
  accent: '#66eeff',       // Light cyan
  glow: '#00aaff',         // Glow color
  dark: '#001122',         // Dark background
  grid: '#003366',         // Grid lines
  player: '#00ff88',       // Player green
  opponent: '#ff4466',     // Opponent red
  energy: '#8866ff',       // Energy purple
};

// Store animation state
let animationTime = 0;
let stars: Array<{ x: number; y: number; size: number; brightness: number; speed: number }> = [];
let starsInitialized = false;

function initStars(width: number, height: number) {
  if (starsInitialized) return;
  stars = [];
  for (let i = 0; i < 100; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      brightness: Math.random() * 0.5 + 0.3,
      speed: Math.random() * 0.2 + 0.1,
    });
  }
  starsInitialized = true;
}

export function renderArena(
  ctx: CanvasRenderingContext2D, 
  state: ArenaState,
  canvasWidth: number,
  canvasHeight: number
): void {
  animationTime = state.gameTime;
  
  // Calculate scale to fit arena in canvas
  const scaleX = canvasWidth / state.arenaWidth;
  const scaleY = canvasHeight / state.arenaHeight;
  const scale = Math.min(scaleX, scaleY);
  
  // Center arena in canvas
  const offsetX = (canvasWidth - state.arenaWidth * scale) / 2;
  const offsetY = (canvasHeight - state.arenaHeight * scale) / 2;
  
  initStars(state.arenaWidth, state.arenaHeight);
  
  ctx.save();
  
  // Apply screen shake
  if (state.screenShakeIntensity > 0) {
    const shakeX = (Math.random() - 0.5) * state.screenShakeIntensity;
    const shakeY = (Math.random() - 0.5) * state.screenShakeIntensity;
    ctx.translate(shakeX, shakeY);
  }
  
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);
  
  // Render layers
  renderStarfield(ctx, state);
  renderArenaBackground(ctx, state);
  renderCentralCore(ctx, state);
  renderEnergyLines(ctx, state);
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
  
  // Vignette effect
  renderVignette(ctx, state);
  
  ctx.restore();
}

function renderStarfield(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  // Animate and draw stars
  for (const star of stars) {
    star.y += star.speed;
    if (star.y > state.arenaHeight) {
      star.y = 0;
      star.x = Math.random() * state.arenaWidth;
    }
    
    const twinkle = Math.sin(animationTime * 0.05 + star.x) * 0.3 + 0.7;
    ctx.globalAlpha = star.brightness * twinkle;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function renderArenaBackground(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  // Deep space gradient background
  const gradient = ctx.createRadialGradient(
    state.arenaWidth / 2, state.arenaHeight / 2, 0,
    state.arenaWidth / 2, state.arenaHeight / 2, state.arenaWidth * 0.7
  );
  gradient.addColorStop(0, '#0a1525');
  gradient.addColorStop(0.5, '#050d18');
  gradient.addColorStop(1, '#010408');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
  
  // Animated perspective grid
  renderPerspectiveGrid(ctx, state);
  
  // Arena border with animated glow
  const pulseIntensity = Math.sin(animationTime * 0.05) * 0.3 + 0.7;
  
  ctx.strokeStyle = ARENA_COLORS.primary;
  ctx.lineWidth = 2;
  ctx.shadowColor = ARENA_COLORS.primary;
  ctx.shadowBlur = 15 * pulseIntensity;
  ctx.strokeRect(8, 8, state.arenaWidth - 16, state.arenaHeight - 16);
  
  // Double border
  ctx.strokeStyle = ARENA_COLORS.secondary;
  ctx.lineWidth = 1;
  ctx.shadowBlur = 8 * pulseIntensity;
  ctx.strokeRect(15, 15, state.arenaWidth - 30, state.arenaHeight - 30);
  
  ctx.shadowBlur = 0;
  
  // Corner tech decorations
  renderCornerDecorations(ctx, state);
}

function renderPerspectiveGrid(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const centerX = state.arenaWidth / 2;
  const centerY = state.arenaHeight / 2;
  const gridSize = 50;
  const scrollOffset = (animationTime * 0.5) % gridSize;
  
  ctx.save();
  
  // Horizontal grid lines with perspective fade
  ctx.strokeStyle = ARENA_COLORS.grid;
  ctx.lineWidth = 1;
  
  for (let y = 0; y <= state.arenaHeight; y += gridSize) {
    const adjustedY = y + scrollOffset;
    if (adjustedY > state.arenaHeight) continue;
    
    const distFromCenter = Math.abs(adjustedY - centerY) / (state.arenaHeight / 2);
    const alpha = 0.3 - distFromCenter * 0.2;
    
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.beginPath();
    ctx.moveTo(0, adjustedY);
    ctx.lineTo(state.arenaWidth, adjustedY);
    ctx.stroke();
  }
  
  // Vertical grid lines with perspective
  for (let x = 0; x <= state.arenaWidth; x += gridSize) {
    const distFromCenter = Math.abs(x - centerX) / (state.arenaWidth / 2);
    const alpha = 0.3 - distFromCenter * 0.15;
    
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, state.arenaHeight);
    ctx.stroke();
  }
  
  ctx.globalAlpha = 1;
  ctx.restore();
}

function renderCentralCore(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const centerX = state.arenaWidth / 2;
  const centerY = state.arenaHeight / 2;
  
  ctx.save();
  
  // Animated concentric rings
  for (let i = 5; i >= 0; i--) {
    const baseRadius = 30 + i * 25;
    const pulse = Math.sin(animationTime * 0.03 + i * 0.5) * 5;
    const radius = baseRadius + pulse;
    
    const alpha = 0.15 - i * 0.02;
    ctx.strokeStyle = ARENA_COLORS.primary;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 2;
    ctx.shadowColor = ARENA_COLORS.glow;
    ctx.shadowBlur = 10;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Inner core glow
  const coreGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, 40
  );
  coreGradient.addColorStop(0, 'rgba(0, 212, 255, 0.3)');
  coreGradient.addColorStop(0.5, 'rgba(0, 136, 204, 0.1)');
  coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  
  ctx.globalAlpha = 0.5 + Math.sin(animationTime * 0.05) * 0.2;
  ctx.fillStyle = coreGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
  ctx.fill();
  
  // Central hexagon
  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = ARENA_COLORS.accent;
  ctx.lineWidth = 2;
  ctx.shadowColor = ARENA_COLORS.accent;
  ctx.shadowBlur = 15;
  
  const hexRadius = 15 + Math.sin(animationTime * 0.08) * 3;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2 + animationTime * 0.01;
    const x = centerX + Math.cos(angle) * hexRadius;
    const y = centerY + Math.sin(angle) * hexRadius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.restore();
}

function renderEnergyLines(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const centerX = state.arenaWidth / 2;
  const centerY = state.arenaHeight / 2;
  
  ctx.save();
  
  // Radiating energy lines from center
  const numLines = 8;
  for (let i = 0; i < numLines; i++) {
    const baseAngle = (i / numLines) * Math.PI * 2;
    const angle = baseAngle + animationTime * 0.002;
    
    // Pulsing line length
    const pulseOffset = (animationTime * 2 + i * 50) % 200;
    const lineStart = 50 + pulseOffset;
    const lineEnd = 100 + pulseOffset;
    
    if (lineEnd > 400) continue;
    
    const x1 = centerX + Math.cos(angle) * lineStart;
    const y1 = centerY + Math.sin(angle) * lineStart;
    const x2 = centerX + Math.cos(angle) * lineEnd;
    const y2 = centerY + Math.sin(angle) * lineEnd;
    
    const alpha = 1 - pulseOffset / 200;
    
    ctx.strokeStyle = ARENA_COLORS.energy;
    ctx.globalAlpha = alpha * 0.4;
    ctx.lineWidth = 2;
    ctx.shadowColor = ARENA_COLORS.energy;
    ctx.shadowBlur = 8;
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.restore();
}

function renderCornerDecorations(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const corners = [
    { x: 0, y: 0, rot: 0 },
    { x: state.arenaWidth, y: 0, rot: Math.PI / 2 },
    { x: state.arenaWidth, y: state.arenaHeight, rot: Math.PI },
    { x: 0, y: state.arenaHeight, rot: -Math.PI / 2 },
  ];
  
  ctx.save();
  ctx.strokeStyle = ARENA_COLORS.primary;
  ctx.fillStyle = ARENA_COLORS.primary;
  ctx.lineWidth = 2;
  ctx.shadowColor = ARENA_COLORS.glow;
  ctx.shadowBlur = 10;
  
  for (const corner of corners) {
    ctx.save();
    ctx.translate(corner.x, corner.y);
    ctx.rotate(corner.rot);
    
    // Tech corner bracket
    ctx.beginPath();
    ctx.moveTo(5, 40);
    ctx.lineTo(5, 5);
    ctx.lineTo(40, 5);
    ctx.stroke();
    
    // Corner triangle
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(25, 0);
    ctx.lineTo(0, 25);
    ctx.closePath();
    ctx.fill();
    
    // Decorative dot
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(12, 12, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  ctx.shadowBlur = 0;
  ctx.restore();
}

function renderObstacles(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  for (const obs of state.obstacles) {
    ctx.save();
    ctx.translate(obs.x, obs.y);
    
    const halfW = obs.width / 2;
    const halfH = obs.height / 2;
    const pulseIntensity = Math.sin(animationTime * 0.05 + obs.x * 0.01) * 0.2 + 0.8;
    
    if (obs.type === 'pillar') {
      // 3D Hexagonal pillar with glow
      renderHexPillar(ctx, halfW, pulseIntensity, obs.destructible);
    } else {
      // 3D Wall/barrier with tech details
      renderTechWall(ctx, halfW, halfH, pulseIntensity, obs.destructible);
    }
    
    ctx.restore();
  }
}

function renderHexPillar(ctx: CanvasRenderingContext2D, radius: number, pulse: number, destructible: boolean): void {
  const color = destructible ? '#ffaa00' : ARENA_COLORS.primary;
  const glowColor = destructible ? '#ff8800' : ARENA_COLORS.glow;
  
  // Outer glow
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 20 * pulse;
  
  // Main hexagon shape
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
  ctx.strokeStyle = color;
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
  
  // Center glow dot
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
  
  // Outer glow
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 15 * pulse;
  
  // Main wall body
  ctx.fillStyle = '#0a1520';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  
  // Beveled rectangle
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
  
  // Inner detail lines
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 1;
  
  // Horizontal detail
  ctx.beginPath();
  ctx.moveTo(-halfW + 10, 0);
  ctx.lineTo(halfW - 10, 0);
  ctx.stroke();
  
  // Vertical details
  ctx.beginPath();
  ctx.moveTo(-halfW * 0.5, -halfH + 6);
  ctx.lineTo(-halfW * 0.5, halfH - 6);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(halfW * 0.5, -halfH + 6);
  ctx.lineTo(halfW * 0.5, halfH - 6);
  ctx.stroke();
  
  // Corner dots
  ctx.globalAlpha = pulse * 0.8;
  ctx.fillStyle = color;
  const dotPositions = [
    [-halfW + 8, -halfH + 8],
    [halfW - 8, -halfH + 8],
    [-halfW + 8, halfH - 8],
    [halfW - 8, halfH - 8],
  ];
  
  for (const [x, y] of dotPositions) {
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

function renderProjectiles(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  for (const proj of state.projectiles) {
    ctx.save();
    ctx.translate(proj.x, proj.y);
    
    // Get style based on ship
    const style = proj.shipId ? getShipProjectileStyle(proj.shipId) : null;
    const color = style?.color || (proj.isPlayer ? ARENA_COLORS.player : ARENA_COLORS.opponent);
    const glowColor = style?.glowColor || color;
    
    // Projectile trail
    const angle = Math.atan2(proj.vy, proj.vx);
    const trailLength = 15;
    
    const trailGradient = ctx.createLinearGradient(
      -Math.cos(angle) * trailLength, -Math.sin(angle) * trailLength,
      0, 0
    );
    trailGradient.addColorStop(0, 'transparent');
    trailGradient.addColorStop(1, color);
    
    ctx.strokeStyle = trailGradient;
    ctx.lineWidth = proj.size * 0.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-Math.cos(angle) * trailLength, -Math.sin(angle) * trailLength);
    ctx.lineTo(0, 0);
    ctx.stroke();
    
    // Main projectile with glow
    ctx.fillStyle = color;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 15;
    
    ctx.beginPath();
    ctx.arc(0, 0, proj.size * (style?.size || 1), 0, Math.PI * 2);
    ctx.fill();
    
    // Inner bright core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, proj.size * 0.4, 0, Math.PI * 2);
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
  ctx.arc(0, 0, 25, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  
  // Use player's ship model
  const shipId = getStoredMegaShipId();
  drawMegaShip(ctx, 0, 0, shipId, state.gameTime);
  
  ctx.restore();
  
  // Health bar under player
  renderHealthBar(ctx, state.playerX, state.playerY + 30, 50, 5, 
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
  ctx.arc(0, 0, 25, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  
  // Render opponent's ship (with red tint overlay)
  ctx.save();
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
  renderHealthBar(ctx, opp.x, opp.y - 35, 60, 6, 
    opp.health / opp.maxHealth, ARENA_COLORS.opponent);
  
  // Opponent name with glow
  ctx.fillStyle = ARENA_COLORS.opponent;
  ctx.font = '11px Orbitron';
  ctx.textAlign = 'center';
  ctx.shadowColor = ARENA_COLORS.opponent;
  ctx.shadowBlur = 8;
  ctx.fillText(opp.name, opp.x, opp.y - 45);
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
  ctx.font = '12px Orbitron';
  ctx.textAlign = 'left';
  ctx.shadowColor = badgeColor;
  ctx.shadowBlur = 10;
  ctx.fillText(`◆ ${state.difficulty.toUpperCase()} ARENA`, 20, 30);
  ctx.shadowBlur = 0;
  
  // Match timer
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = '11px Orbitron';
  
  if (state.phase === 'fighting' && state.opponent) {
    const timeInSeconds = Math.floor(state.gameTime / 60);
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')}`, state.arenaWidth / 2, 30);
  }
  
  // Health displays in corners
  ctx.font = '10px Orbitron';
  
  // Player health indicator
  ctx.fillStyle = ARENA_COLORS.player;
  ctx.textAlign = 'right';
  const playerHealthPercent = Math.round((state.playerHealth / state.playerMaxHealth) * 100);
  ctx.fillText(`HULL: ${playerHealthPercent}%`, state.arenaWidth - 20, 30);
  
  // Opponent health indicator
  if (state.opponent) {
    ctx.fillStyle = ARENA_COLORS.opponent;
    ctx.textAlign = 'right';
    const oppHealthPercent = Math.round((state.opponent.health / state.opponent.maxHealth) * 100);
    ctx.fillText(`ENEMY: ${oppHealthPercent}%`, state.arenaWidth - 20, 45);
  }
}

function renderPhaseOverlay(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const centerX = state.arenaWidth / 2;
  const centerY = state.arenaHeight / 2;
  
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
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
  
  // Animated VS text
  const scale = 1 + Math.sin(animationTime * 0.1) * 0.1;
  
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(scale, scale);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = '50px Orbitron';
  ctx.textAlign = 'center';
  ctx.shadowColor = ARENA_COLORS.primary;
  ctx.shadowBlur = 30;
  ctx.fillText('VS', 0, 15);
  ctx.shadowBlur = 0;
  
  ctx.restore();
  
  // Decorative lines
  ctx.strokeStyle = ARENA_COLORS.primary;
  ctx.lineWidth = 2;
  ctx.shadowColor = ARENA_COLORS.primary;
  ctx.shadowBlur = 10;
  
  ctx.beginPath();
  ctx.moveTo(centerX - 100, centerY);
  ctx.lineTo(centerX - 50, centerY);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(centerX + 50, centerY);
  ctx.lineTo(centerX + 100, centerY);
  ctx.stroke();
  
  ctx.shadowBlur = 0;
  
  // Player label
  ctx.fillStyle = ARENA_COLORS.player;
  ctx.font = '16px Orbitron';
  ctx.shadowColor = ARENA_COLORS.player;
  ctx.shadowBlur = 10;
  ctx.fillText('YOU', centerX, centerY + 80);
  
  // Opponent label
  ctx.fillStyle = ARENA_COLORS.opponent;
  ctx.shadowColor = ARENA_COLORS.opponent;
  ctx.fillText(state.opponent?.name || 'OPPONENT', centerX, centerY - 50);
  ctx.shadowBlur = 0;
}

function renderCountdown(ctx: CanvasRenderingContext2D, state: ArenaState, centerX: number, centerY: number): void {
  const countdown = Math.ceil(state.phaseTimer / 60);
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
  
  const isGo = countdown === 0;
  const color = isGo ? ARENA_COLORS.player : '#ffffff';
  const text = isGo ? 'FIGHT!' : countdown.toString();
  
  // Pulsing countdown
  const pulse = 1 + (60 - (state.phaseTimer % 60)) / 60 * 0.3;
  
  ctx.save();
  ctx.translate(centerX, centerY + 20);
  ctx.scale(pulse, pulse);
  
  ctx.fillStyle = color;
  ctx.font = '80px Orbitron';
  ctx.textAlign = 'center';
  ctx.shadowColor = isGo ? ARENA_COLORS.player : ARENA_COLORS.primary;
  ctx.shadowBlur = 40;
  ctx.fillText(text, 0, 0);
  ctx.shadowBlur = 0;
  
  ctx.restore();
}

function renderVictoryOverlay(ctx: CanvasRenderingContext2D, state: ArenaState, centerX: number, centerY: number): void {
  ctx.fillStyle = 'rgba(0, 40, 20, 0.85)';
  ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
  
  const pulse = Math.sin(animationTime * 0.1) * 0.1 + 1;
  
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(pulse, pulse);
  
  ctx.fillStyle = ARENA_COLORS.player;
  ctx.font = '40px Orbitron';
  ctx.textAlign = 'center';
  ctx.shadowColor = ARENA_COLORS.player;
  ctx.shadowBlur = 40;
  ctx.fillText('VICTORY!', 0, 0);
  ctx.shadowBlur = 0;
  
  ctx.restore();
  
  ctx.fillStyle = '#ffffff';
  ctx.font = '14px Orbitron';
  ctx.fillText('Collecting rewards...', centerX, centerY + 50);
}

function renderDefeatOverlay(ctx: CanvasRenderingContext2D, state: ArenaState, centerX: number, centerY: number): void {
  ctx.fillStyle = 'rgba(40, 0, 0, 0.85)';
  ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
  
  ctx.fillStyle = ARENA_COLORS.opponent;
  ctx.font = '40px Orbitron';
  ctx.textAlign = 'center';
  ctx.shadowColor = ARENA_COLORS.opponent;
  ctx.shadowBlur = 40;
  ctx.fillText('DEFEATED', centerX, centerY);
  ctx.shadowBlur = 0;
  
  ctx.fillStyle = '#888888';
  ctx.font = '14px Orbitron';
  ctx.fillText('Better luck next time...', centerX, centerY + 50);
}

function renderVignette(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const centerX = state.arenaWidth / 2;
  const centerY = state.arenaHeight / 2;
  const radius = Math.max(state.arenaWidth, state.arenaHeight) * 0.8;
  
  const vignette = ctx.createRadialGradient(
    centerX, centerY, radius * 0.3,
    centerX, centerY, radius
  );
  vignette.addColorStop(0, 'transparent');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
  
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
}
