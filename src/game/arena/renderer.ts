// Arena Battle Mode Renderer - Cyberpunk High-Tech Vector Style

import { ArenaState, ArenaObstacle, ArenaPowerUp, ARENA_POWERUP_INFO } from './types';
import { ARENA_CONFIG } from './constants';
import { drawMegaShip } from '../megaShipRenderer';
import { getShipProjectileStyle, ShipProjectileStyle } from '../vectorManiac/shipProjectiles';
import { getStoredMegaShipId } from '@/hooks/useMegaShips';

// Cyberpunk neon color scheme
const ARENA_COLORS = {
  primary: '#00d4ff',
  secondary: '#0088cc',
  accent: '#ff00aa',
  glow: '#00aaff',
  dark: '#030308',
  grid: '#0a1428',
  player: '#00ff88',
  opponent: '#ff4466',
  energy: '#8844ff',
  cyan: '#00ffff',
  magenta: '#ff00ff',
  gold: '#ffaa00',
  dataStream: '#00ff8850',
};

// Animation state
let animationTime = 0;

export function renderArena(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  animationTime = state.gameTime;
  
  ctx.save();
  
  // Apply screen shake
  if (state.screenShakeIntensity > 0) {
    const shakeX = (Math.random() - 0.5) * state.screenShakeIntensity * 1.5;
    const shakeY = (Math.random() - 0.5) * state.screenShakeIntensity * 1.5;
    ctx.translate(shakeX, shakeY);
  }
  
  // Render layers
  renderCyberpunkBackground(ctx, state);
  renderPerspectiveGrid(ctx, state);
  renderDataStreams(ctx, state);
  renderHexagonField(ctx, state);
  renderScanlines(ctx, state);
  renderArenaBorder(ctx, state);
  renderObstacles(ctx, state);
  renderPowerUps(ctx, state);
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
  
  // Render effect overlays
  renderEffectOverlays(ctx, state);
  
  // Vignette effect
  renderVignette(ctx, state);
  
  ctx.restore();
}

function renderCyberpunkBackground(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const { arenaWidth, arenaHeight } = state;
  
  // Deep space gradient with color shifts
  const gradient = ctx.createRadialGradient(
    arenaWidth / 2, arenaHeight * 0.3, 0,
    arenaWidth / 2, arenaHeight / 2, arenaHeight * 0.7
  );
  gradient.addColorStop(0, '#0a0818');
  gradient.addColorStop(0.3, '#050410');
  gradient.addColorStop(0.6, '#030208');
  gradient.addColorStop(1, '#010104');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, arenaWidth, arenaHeight);
  
  // Nebula glow effects
  renderNebulaGlow(ctx, state);
  
  // Animated starfield
  renderEnhancedStarfield(ctx, state);
}

function renderNebulaGlow(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const { arenaWidth, arenaHeight } = state;
  
  // Cyan nebula top-left
  const nebula1 = ctx.createRadialGradient(
    arenaWidth * 0.2, arenaHeight * 0.15, 0,
    arenaWidth * 0.2, arenaHeight * 0.15, arenaWidth * 0.4
  );
  nebula1.addColorStop(0, 'rgba(0, 212, 255, 0.08)');
  nebula1.addColorStop(0.5, 'rgba(0, 136, 204, 0.03)');
  nebula1.addColorStop(1, 'transparent');
  ctx.fillStyle = nebula1;
  ctx.fillRect(0, 0, arenaWidth, arenaHeight);
  
  // Magenta nebula bottom-right
  const nebula2 = ctx.createRadialGradient(
    arenaWidth * 0.8, arenaHeight * 0.85, 0,
    arenaWidth * 0.8, arenaHeight * 0.85, arenaWidth * 0.5
  );
  nebula2.addColorStop(0, 'rgba(255, 0, 170, 0.06)');
  nebula2.addColorStop(0.5, 'rgba(136, 68, 255, 0.02)');
  nebula2.addColorStop(1, 'transparent');
  ctx.fillStyle = nebula2;
  ctx.fillRect(0, 0, arenaWidth, arenaHeight);
  
  // Moving energy wave
  const waveY = (animationTime * 0.5) % (arenaHeight * 1.5) - arenaHeight * 0.25;
  const waveGradient = ctx.createLinearGradient(0, waveY - 30, 0, waveY + 30);
  waveGradient.addColorStop(0, 'transparent');
  waveGradient.addColorStop(0.5, 'rgba(0, 255, 136, 0.02)');
  waveGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = waveGradient;
  ctx.fillRect(0, 0, arenaWidth, arenaHeight);
}

function renderEnhancedStarfield(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const { arenaWidth, arenaHeight } = state;
  
  // Layer 1: Distant dim stars
  for (let i = 0; i < 40; i++) {
    const seed = i * 137.5;
    const x = ((seed * 7.3) % arenaWidth);
    const y = ((seed * 11.7 + animationTime * 0.02) % arenaHeight);
    const size = 0.3 + (i % 2) * 0.2;
    const twinkle = Math.sin(animationTime * 0.03 + seed) * 0.2 + 0.5;
    
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.15 + twinkle * 0.15;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Layer 2: Medium stars with color
  for (let i = 0; i < 25; i++) {
    const seed = i * 89.3 + 500;
    const x = ((seed * 5.1) % arenaWidth);
    const y = ((seed * 9.2 + animationTime * 0.05) % arenaHeight);
    const size = 0.4 + (i % 3) * 0.3;
    const twinkle = Math.sin(animationTime * 0.05 + seed) * 0.3 + 0.7;
    
    const colors = ['#00d4ff', '#ff00aa', '#00ff88', '#8844ff'];
    ctx.fillStyle = colors[i % 4];
    ctx.globalAlpha = 0.2 + twinkle * 0.25;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Layer 3: Bright foreground stars with glow
  for (let i = 0; i < 12; i++) {
    const seed = i * 211.7 + 1000;
    const x = ((seed * 3.7) % arenaWidth);
    const y = ((seed * 7.3 + animationTime * 0.1) % arenaHeight);
    const size = 0.6 + (i % 2) * 0.4;
    const twinkle = Math.sin(animationTime * 0.08 + seed) * 0.4 + 0.6;
    
    ctx.shadowColor = '#00d4ff';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.4 + twinkle * 0.4;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

function renderPerspectiveGrid(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const { arenaWidth, arenaHeight } = state;
  const horizonY = arenaHeight * 0.15;
  const gridOffset = (animationTime * 0.8) % 40;
  
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.12)';
  ctx.lineWidth = 0.5;
  
  // Horizontal perspective lines
  const lineCount = 20;
  for (let i = 0; i <= lineCount; i++) {
    const t = i / lineCount;
    const y = horizonY + (arenaHeight - horizonY) * Math.pow(t, 1.5) + gridOffset * t;
    const perspectiveNarrow = 1 - t * 0.3;
    const startX = arenaWidth * (0.5 - 0.5 * perspectiveNarrow);
    const endX = arenaWidth * (0.5 + 0.5 * perspectiveNarrow);
    
    ctx.globalAlpha = 0.1 + t * 0.15;
    ctx.beginPath();
    ctx.moveTo(startX, y % arenaHeight);
    ctx.lineTo(endX, y % arenaHeight);
    ctx.stroke();
  }
  
  // Vertical perspective lines (converging to horizon)
  const verticalLines = 12;
  for (let i = 0; i <= verticalLines; i++) {
    const xRatio = i / verticalLines;
    const bottomX = arenaWidth * xRatio;
    const topX = arenaWidth * 0.5 + (bottomX - arenaWidth * 0.5) * 0.1;
    
    ctx.globalAlpha = 0.08;
    ctx.beginPath();
    ctx.moveTo(bottomX, arenaHeight);
    ctx.lineTo(topX, horizonY);
    ctx.stroke();
  }
  
  ctx.globalAlpha = 1;
}

function renderDataStreams(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const { arenaWidth, arenaHeight } = state;
  
  // Vertical data streams (Matrix-style but subtle)
  for (let i = 0; i < 8; i++) {
    const seed = i * 73.2;
    const x = (seed * 5.3) % arenaWidth;
    const speed = 1 + (i % 3) * 0.5;
    const offset = (animationTime * speed) % (arenaHeight * 1.5);
    
    ctx.strokeStyle = `rgba(0, 255, 136, ${0.03 + (i % 3) * 0.02})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 12]);
    
    ctx.beginPath();
    ctx.moveTo(x, offset - arenaHeight * 0.5);
    ctx.lineTo(x, offset + arenaHeight);
    ctx.stroke();
  }
  
  ctx.setLineDash([]);
}

function renderHexagonField(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const { arenaWidth, arenaHeight } = state;
  const hexSize = 30;
  const spacing = hexSize * 1.8;
  
  ctx.strokeStyle = 'rgba(136, 68, 255, 0.04)';
  ctx.lineWidth = 0.5;
  
  for (let row = 0; row < arenaHeight / spacing + 1; row++) {
    for (let col = 0; col < arenaWidth / spacing + 1; col++) {
      const offsetX = row % 2 === 0 ? 0 : spacing / 2;
      const x = col * spacing + offsetX;
      const y = row * spacing * 0.866;
      
      // Only draw some hexagons based on animation
      const distFromCenter = Math.sqrt(
        Math.pow(x - arenaWidth / 2, 2) + Math.pow(y - arenaHeight / 2, 2)
      );
      const wave = Math.sin(distFromCenter * 0.01 - animationTime * 0.03);
      
      if (wave > 0.3) {
        ctx.globalAlpha = (wave - 0.3) * 0.15;
        drawHexagon(ctx, x, y, hexSize * 0.4);
      }
    }
  }
  
  ctx.globalAlpha = 1;
}

function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const px = x + Math.cos(angle) * size;
    const py = y + Math.sin(angle) * size;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
}

function renderScanlines(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const { arenaWidth, arenaHeight } = state;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
  for (let y = 0; y < arenaHeight; y += 3) {
    ctx.fillRect(0, y, arenaWidth, 1);
  }
  
  // Occasional glitch line
  if (Math.sin(animationTime * 0.1) > 0.97) {
    const glitchY = (animationTime * 7) % arenaHeight;
    ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.fillRect(0, glitchY, arenaWidth, 2);
  }
}

function renderVignette(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const { arenaWidth, arenaHeight } = state;
  
  const gradient = ctx.createRadialGradient(
    arenaWidth / 2, arenaHeight / 2, arenaWidth * 0.3,
    arenaWidth / 2, arenaHeight / 2, arenaWidth * 0.8
  );
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.2)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, arenaWidth, arenaHeight);
}

function renderArenaBorder(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const { arenaWidth, arenaHeight } = state;
  const padding = ARENA_CONFIG.arenaPadding;
  const pulseIntensity = Math.sin(animationTime * 0.05) * 0.3 + 0.7;
  
  // Outer energy field
  ctx.strokeStyle = `rgba(255, 68, 102, ${0.4 * pulseIntensity})`;
  ctx.lineWidth = 2;
  ctx.shadowColor = '#ff4466';
  ctx.shadowBlur = 15 * pulseIntensity;
  ctx.strokeRect(padding, padding, arenaWidth - padding * 2, arenaHeight - padding * 2);
  
  // Inner border with data pattern
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.shadowBlur = 0;
  ctx.setLineDash([8, 4]);
  ctx.strokeRect(padding + 4, padding + 4, arenaWidth - padding * 2 - 8, arenaHeight - padding * 2 - 8);
  ctx.setLineDash([]);
  
  // Animated corner brackets
  renderTechCorners(ctx, state);
  
  // Energy nodes
  renderEnergyNodes(ctx, state);
}

function renderTechCorners(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const { arenaWidth, arenaHeight } = state;
  const padding = ARENA_CONFIG.arenaPadding;
  const cornerSize = 20;
  const pulseIntensity = Math.sin(animationTime * 0.08) * 0.3 + 0.7;
  
  const corners = [
    { x: padding, y: padding, rot: 0 },
    { x: arenaWidth - padding, y: padding, rot: Math.PI / 2 },
    { x: arenaWidth - padding, y: arenaHeight - padding, rot: Math.PI },
    { x: padding, y: arenaHeight - padding, rot: -Math.PI / 2 },
  ];
  
  ctx.strokeStyle = ARENA_COLORS.cyan;
  ctx.lineWidth = 2;
  ctx.shadowColor = ARENA_COLORS.cyan;
  ctx.shadowBlur = 10 * pulseIntensity;
  
  for (const corner of corners) {
    ctx.save();
    ctx.translate(corner.x, corner.y);
    ctx.rotate(corner.rot);
    
    // Main bracket
    ctx.beginPath();
    ctx.moveTo(4, cornerSize);
    ctx.lineTo(4, 4);
    ctx.lineTo(cornerSize, 4);
    ctx.stroke();
    
    // Inner accent
    ctx.strokeStyle = ARENA_COLORS.accent;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(8, cornerSize * 0.7);
    ctx.lineTo(8, 8);
    ctx.lineTo(cornerSize * 0.7, 8);
    ctx.stroke();
    
    // Corner dot
    ctx.fillStyle = ARENA_COLORS.cyan;
    ctx.beginPath();
    ctx.arc(10, 10, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  ctx.shadowBlur = 0;
}

function renderEnergyNodes(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const { arenaWidth, arenaHeight } = state;
  const padding = ARENA_CONFIG.arenaPadding;
  
  // Center nodes on each edge
  const nodes = [
    { x: arenaWidth / 2, y: padding },
    { x: arenaWidth / 2, y: arenaHeight - padding },
    { x: padding, y: arenaHeight / 2 },
    { x: arenaWidth - padding, y: arenaHeight / 2 },
  ];
  
  const pulse = Math.sin(animationTime * 0.1) * 0.4 + 0.6;
  
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const nodePulse = Math.sin(animationTime * 0.1 + i * 0.5) * 0.4 + 0.6;
    
    // Outer ring
    ctx.strokeStyle = `rgba(0, 212, 255, ${nodePulse * 0.6})`;
    ctx.lineWidth = 1;
    ctx.shadowColor = ARENA_COLORS.cyan;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner glow
    ctx.fillStyle = `rgba(0, 255, 255, ${nodePulse * 0.8})`;
    ctx.beginPath();
    ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.shadowBlur = 0;
}

function renderObstacles(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  for (const obs of state.obstacles) {
    // Skip invisible phase platforms
    if (obs.type === 'phasePlatform' && !obs.isVisible) {
      if (obs.phaseTimer !== undefined && obs.phaseDuration !== undefined) {
        const timeLeft = obs.phaseDuration - obs.phaseTimer;
        if (timeLeft < 40) {
          renderPhasePlatformGhost(ctx, obs, timeLeft / 40);
        }
      }
      continue;
    }
    
    if (obs.type === 'laserGrid') {
      renderLaserGrid(ctx, obs);
    } else if (obs.type === 'phasePlatform') {
      renderPhasePlatform(ctx, obs);
    } else if (obs.type === 'pillar') {
      renderHolographicPillar(ctx, obs);
    } else if (obs.type === 'wall') {
      renderTechWall(ctx, obs);
    }
  }
}

function renderHolographicPillar(ctx: CanvasRenderingContext2D, obs: ArenaObstacle): void {
  const pulse = Math.sin(animationTime * 0.08 + obs.x * 0.01) * 0.3 + 0.7;
  const size = obs.width / 2;
  const color = obs.destructible ? ARENA_COLORS.gold : ARENA_COLORS.cyan;
  
  ctx.save();
  ctx.translate(obs.x, obs.y);
  
  // Outer holographic ring
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12 * pulse;
  ctx.globalAlpha = 0.8;
  
  // Rotating outer hexagon
  ctx.save();
  ctx.rotate(animationTime * 0.02);
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
  ctx.restore();
  
  // Inner core
  ctx.fillStyle = ARENA_COLORS.dark;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
    const x = Math.cos(angle) * (size * 0.7);
    const y = Math.sin(angle) * (size * 0.7);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  
  // Energy core
  const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.4);
  coreGradient.addColorStop(0, color);
  coreGradient.addColorStop(0.5, `${color}80`);
  coreGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = coreGradient;
  ctx.globalAlpha = pulse;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
  ctx.fill();
  
  // Center dot
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = pulse;
  ctx.beginPath();
  ctx.arc(0, 0, 2, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function renderTechWall(ctx: CanvasRenderingContext2D, obs: ArenaObstacle): void {
  const halfW = obs.width / 2;
  const halfH = obs.height / 2;
  const pulse = Math.sin(animationTime * 0.05 + obs.x * 0.02) * 0.2 + 0.8;
  const color = obs.destructible ? ARENA_COLORS.gold : ARENA_COLORS.primary;
  
  ctx.save();
  ctx.translate(obs.x, obs.y);
  
  // Main body with gradient
  const bodyGradient = ctx.createLinearGradient(-halfW, 0, halfW, 0);
  bodyGradient.addColorStop(0, '#0a0a15');
  bodyGradient.addColorStop(0.5, '#0f0f20');
  bodyGradient.addColorStop(1, '#0a0a15');
  
  ctx.fillStyle = bodyGradient;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10 * pulse;
  
  // Draw beveled wall
  const bevel = 3;
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
  
  // Inner glow line
  ctx.strokeStyle = `${color}60`;
  ctx.lineWidth = 1;
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(-halfW + 8, 0);
  ctx.lineTo(halfW - 8, 0);
  ctx.stroke();
  
  ctx.restore();
}

function renderLaserGrid(ctx: CanvasRenderingContext2D, obs: ArenaObstacle): void {
  const rotation = obs.rotation || 0;
  const laserLength = (obs.laserLength || 100) * 0.5; // Scale down
  
  ctx.save();
  ctx.translate(obs.x, obs.y);
  
  // Laser beams (4 in cross pattern)
  for (let i = 0; i < 4; i++) {
    const angle = rotation + (i * Math.PI / 2);
    const endX = Math.cos(angle) * laserLength;
    const endY = Math.sin(angle) * laserLength;
    
    // Outer glow
    ctx.strokeStyle = 'rgba(255, 0, 68, 0.2)';
    ctx.lineWidth = 8;
    ctx.shadowColor = '#ff0044';
    ctx.shadowBlur = 15;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Core beam
    const gradient = ctx.createLinearGradient(0, 0, endX, endY);
    gradient.addColorStop(0, '#ff4466');
    gradient.addColorStop(0.5, '#ff0044');
    gradient.addColorStop(1, '#ff6688');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Inner white core
    ctx.strokeStyle = 'rgba(255, 200, 200, 0.8)';
    ctx.lineWidth = 0.5;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
  
  // Central hub
  ctx.shadowColor = '#ff0044';
  ctx.shadowBlur = 15;
  
  // Outer ring
  ctx.strokeStyle = '#ff0044';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.stroke();
  
  // Inner fill
  const hubGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
  hubGradient.addColorStop(0, '#ff2244');
  hubGradient.addColorStop(0.5, '#aa0022');
  hubGradient.addColorStop(1, '#440011');
  ctx.fillStyle = hubGradient;
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  
  // Pulsing core
  const pulse = Math.sin(animationTime * 0.15) * 0.3 + 0.7;
  ctx.fillStyle = `rgba(255, 100, 120, ${pulse})`;
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.shadowBlur = 0;
  ctx.restore();
}

function renderPhasePlatform(ctx: CanvasRenderingContext2D, obs: ArenaObstacle): void {
  const halfW = obs.width / 2;
  const halfH = obs.height / 2;
  
  let alpha = 1;
  if (obs.phaseTimer !== undefined && obs.phaseDuration !== undefined) {
    const timeLeft = obs.phaseDuration - obs.phaseTimer;
    if (timeLeft < 30) {
      alpha = timeLeft / 30;
    }
  }
  
  ctx.save();
  ctx.translate(obs.x, obs.y);
  ctx.globalAlpha = alpha;
  
  // Holographic platform effect
  ctx.shadowColor = '#00ffaa';
  ctx.shadowBlur = 12 * alpha;
  
  // Platform body
  const gradient = ctx.createLinearGradient(-halfW, -halfH, halfW, halfH);
  gradient.addColorStop(0, 'rgba(0, 180, 120, 0.6)');
  gradient.addColorStop(0.5, 'rgba(0, 255, 170, 0.7)');
  gradient.addColorStop(1, 'rgba(0, 180, 120, 0.6)');
  
  ctx.fillStyle = gradient;
  ctx.strokeStyle = '#00ffaa';
  ctx.lineWidth = 1.5;
  
  const radius = 4;
  ctx.beginPath();
  ctx.moveTo(-halfW + radius, -halfH);
  ctx.lineTo(halfW - radius, -halfH);
  ctx.quadraticCurveTo(halfW, -halfH, halfW, -halfH + radius);
  ctx.lineTo(halfW, halfH - radius);
  ctx.quadraticCurveTo(halfW, halfH, halfW - radius, halfH);
  ctx.lineTo(-halfW + radius, halfH);
  ctx.quadraticCurveTo(-halfW, halfH, -halfW, halfH - radius);
  ctx.lineTo(-halfW, -halfH + radius);
  ctx.quadraticCurveTo(-halfW, -halfH, -halfW + radius, -halfH);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Inner pattern
  ctx.strokeStyle = 'rgba(0, 255, 200, 0.3)';
  ctx.lineWidth = 0.5;
  ctx.shadowBlur = 0;
  
  const gridSize = 8;
  for (let x = -halfW + gridSize; x < halfW; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, -halfH + 3);
    ctx.lineTo(x, halfH - 3);
    ctx.stroke();
  }
  
  ctx.restore();
}

function renderPhasePlatformGhost(ctx: CanvasRenderingContext2D, obs: ArenaObstacle, alpha: number): void {
  const halfW = obs.width / 2;
  const halfH = obs.height / 2;
  
  ctx.save();
  ctx.translate(obs.x, obs.y);
  ctx.globalAlpha = alpha * 0.3;
  
  const flicker = Math.random() > 0.3 ? 1 : 0.5;
  ctx.strokeStyle = `rgba(0, 255, 170, ${flicker})`;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  
  const radius = 4;
  ctx.beginPath();
  ctx.moveTo(-halfW + radius, -halfH);
  ctx.lineTo(halfW - radius, -halfH);
  ctx.quadraticCurveTo(halfW, -halfH, halfW, -halfH + radius);
  ctx.lineTo(halfW, halfH - radius);
  ctx.quadraticCurveTo(halfW, halfH, halfW - radius, halfH);
  ctx.lineTo(-halfW + radius, halfH);
  ctx.quadraticCurveTo(-halfW, halfH, -halfW, halfH - radius);
  ctx.lineTo(-halfW, -halfH + radius);
  ctx.quadraticCurveTo(-halfW, -halfH, -halfW + radius, -halfH);
  ctx.closePath();
  ctx.stroke();
  
  ctx.setLineDash([]);
  ctx.restore();
}

function renderPowerUps(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  for (const powerUp of state.powerUps) {
    renderPowerUp(ctx, powerUp, state.gameTime);
  }
}

function renderPowerUp(ctx: CanvasRenderingContext2D, powerUp: ArenaPowerUp, gameTime: number): void {
  const info = ARENA_POWERUP_INFO[powerUp.type];
  const bobY = Math.sin(gameTime * 0.1 + powerUp.bobOffset) * 4;
  const pulse = Math.sin(gameTime * 0.12) * 0.2 + 0.8;
  const rotation = gameTime * 0.04;
  
  ctx.save();
  ctx.translate(powerUp.x, powerUp.y + bobY);
  
  // Outer glow ring
  ctx.strokeStyle = info.glowColor;
  ctx.lineWidth = 2;
  ctx.shadowColor = info.glowColor;
  ctx.shadowBlur = 15 * pulse;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.stroke();
  
  // Spinning outer ring
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 13, rotation, rotation + Math.PI);
  ctx.stroke();
  
  // Main body
  ctx.globalAlpha = 1;
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
  gradient.addColorStop(0, info.color);
  gradient.addColorStop(0.7, info.glowColor);
  gradient.addColorStop(1, 'rgba(0,0,0,0.5)');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner icon
  ctx.fillStyle = '#ffffff';
  ctx.shadowBlur = 0;
  ctx.font = 'bold 10px Orbitron';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  let icon = '';
  switch (powerUp.type) {
    case 'emp': icon = '⚡'; break;
    case 'teleport': icon = '◊'; break;
    case 'shield': icon = '+'; break;
    case 'overdrive': icon = '»'; break;
  }
  
  ctx.fillText(icon, 0, 1);
  
  ctx.restore();
}

function renderEffectOverlays(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  // EMP flash
  if (state.empFlashTimer > 0) {
    const alpha = state.empFlashTimer / 30;
    ctx.fillStyle = `rgba(0, 200, 255, ${alpha * 0.25})`;
    ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
  }
  
  // Teleport flash
  if (state.teleportFlashTimer > 0) {
    const alpha = state.teleportFlashTimer / 20;
    ctx.fillStyle = `rgba(200, 0, 255, ${alpha * 0.35})`;
    ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
  }
  
  // Power-up notification
  if (state.powerUpNotificationTimer > 0 && state.lastPowerUpCollected) {
    const info = ARENA_POWERUP_INFO[state.lastPowerUpCollected];
    const alpha = Math.min(1, state.powerUpNotificationTimer / 30);
    const y = state.arenaHeight / 2 - 100 + (90 - state.powerUpNotificationTimer) * 0.3;
    
    ctx.fillStyle = info.color;
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 14px Orbitron';
    ctx.textAlign = 'center';
    ctx.shadowColor = info.glowColor;
    ctx.shadowBlur = 15;
    ctx.fillText(info.name.toUpperCase(), state.arenaWidth / 2, y);
    
    ctx.font = '9px Orbitron';
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
    ctx.fillText(info.description, state.arenaWidth / 2, y + 16);
    
    ctx.globalAlpha = 1;
  }
  
  // Overdrive indicator
  if (state.overdriveTimer > 0) {
    const pulse = Math.sin(state.gameTime * 0.25) * 0.3 + 0.7;
    ctx.strokeStyle = `rgba(255, 170, 0, ${pulse * 0.4})`;
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 10;
    ctx.strokeRect(5, 5, state.arenaWidth - 10, state.arenaHeight - 10);
    ctx.shadowBlur = 0;
    
    const secondsLeft = Math.ceil(state.overdriveTimer / 60);
    ctx.fillStyle = '#ffaa00';
    ctx.font = 'bold 9px Orbitron';
    ctx.textAlign = 'left';
    ctx.fillText(`OVERDRIVE: ${secondsLeft}s`, 15, 55);
  }
  
  // Opponent stun indicator
  if (state.opponentStunTimer > 0 && state.opponent) {
    const secondsLeft = Math.ceil(state.opponentStunTimer / 60);
    ctx.fillStyle = '#00ccff';
    ctx.font = 'bold 9px Orbitron';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00ccff';
    ctx.shadowBlur = 8;
    ctx.fillText(`STUNNED: ${secondsLeft}s`, state.opponent.x, state.opponent.y - 35);
    ctx.shadowBlur = 0;
    
    // Stun visual
    const flickerAlpha = Math.sin(state.gameTime * 0.35) * 0.3 + 0.5;
    ctx.strokeStyle = `rgba(0, 200, 255, ${flickerAlpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(state.opponent.x, state.opponent.y, 18, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function renderProjectiles(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  for (const proj of state.projectiles) {
    ctx.save();
    
    if (proj.isPlayer) {
      const style = proj.shipId ? getShipProjectileStyle(proj.shipId) : getShipProjectileStyle('default');
      const size = proj.size * style.size * 0.7; // Scale down
      
      ctx.shadowColor = style.glowColor;
      ctx.shadowBlur = 6;
      
      if (style.trailLength > 0) {
        const angle = Math.atan2(proj.vy, proj.vx);
        ctx.globalAlpha = 0.25;
        ctx.strokeStyle = style.color;
        ctx.lineWidth = size * 0.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(proj.x, proj.y);
        ctx.lineTo(
          proj.x - Math.cos(angle) * size * style.trailLength * 2,
          proj.y - Math.sin(angle) * size * style.trailLength * 2
        );
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      
      drawPlayerProjectile(ctx, proj.x, proj.y, size, style, proj.vx, proj.vy, state.gameTime);
      
    } else {
      const size = proj.size * 0.7; // Scale down
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, size * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
}

function drawPlayerProjectile(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  size: number,
  style: ShipProjectileStyle,
  vx: number, vy: number,
  gameTime: number
): void {
  const angle = Math.atan2(vy, vx);
  ctx.fillStyle = style.color;
  
  switch (style.shape) {
    case 'circle':
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = style.coreColor;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.35, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'laser':
      ctx.strokeStyle = style.color;
      ctx.lineWidth = size * 0.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x - Math.cos(angle) * size * 1.5, y - Math.sin(angle) * size * 1.5);
      ctx.lineTo(x + Math.cos(angle) * size * 1.5, y + Math.sin(angle) * size * 1.5);
      ctx.stroke();
      break;
      
    case 'diamond':
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(gameTime * 0.18);
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.5, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size * 0.5, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
      
    case 'star':
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(gameTime * 0.12);
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
        const a2 = ((i + 0.5) / 4) * Math.PI * 2;
        ctx.lineTo(Math.cos(a2) * size * 0.35, Math.sin(a2) * size * 0.35);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
      
    case 'triangle':
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(size, 0);
      ctx.lineTo(-size * 0.5, size * 0.6);
      ctx.lineTo(-size * 0.5, -size * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
      
    default:
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      break;
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
    ctx.arc(p.x, p.y, p.size * alpha * 0.7, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
}

function renderPlayer(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  ctx.save();
  ctx.translate(state.playerX, state.playerY);
  ctx.rotate(state.playerAngle);
  
  // Scale down ship
  ctx.scale(0.55, 0.55);
  
  if (state.playerInvulnerable > 0 && Math.floor(state.gameTime / 4) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }
  
  // Player shield glow
  const shieldPulse = Math.sin(animationTime * 0.12) * 0.2 + 0.8;
  ctx.strokeStyle = ARENA_COLORS.player;
  ctx.globalAlpha = 0.15 * shieldPulse;
  ctx.lineWidth = 2;
  ctx.shadowColor = ARENA_COLORS.player;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(0, 0, 35, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  
  const shipId = getStoredMegaShipId();
  drawMegaShip(ctx, 0, 0, shipId, state.gameTime);
  
  ctx.restore();
  
  // Health bar
  renderHealthBar(ctx, state.playerX, state.playerY + 22, 35, 4, 
    state.playerHealth / state.playerMaxHealth, ARENA_COLORS.player);
}

function renderOpponent(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  if (!state.opponent) return;
  
  const opp = state.opponent;
  
  ctx.save();
  ctx.translate(opp.x, opp.y);
  ctx.rotate(opp.angle);
  
  // Scale down ship
  ctx.scale(0.55, 0.55);
  
  // Opponent shield glow
  const shieldPulse = Math.sin(animationTime * 0.12 + 2) * 0.2 + 0.8;
  ctx.strokeStyle = ARENA_COLORS.opponent;
  ctx.globalAlpha = 0.15 * shieldPulse;
  ctx.lineWidth = 2;
  ctx.shadowColor = ARENA_COLORS.opponent;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(0, 0, 35, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  
  // Render opponent's ship
  ctx.save();
  drawMegaShip(ctx, 0, 0, opp.shipId, state.gameTime);
  
  // Red tint overlay
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = 'rgba(255, 68, 102, 0.25)';
  ctx.beginPath();
  ctx.arc(0, 0, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  ctx.restore();
  
  // Health bar
  renderHealthBar(ctx, opp.x, opp.y - 25, 40, 4, 
    opp.health / opp.maxHealth, ARENA_COLORS.opponent);
  
  // Opponent name
  ctx.fillStyle = ARENA_COLORS.opponent;
  ctx.font = opp.isHumanPlayer ? '8px Orbitron' : '9px Orbitron';
  ctx.textAlign = 'center';
  ctx.shadowColor = ARENA_COLORS.opponent;
  ctx.shadowBlur = 6;
  ctx.fillText(opp.name, opp.x, opp.y - 32);
  
  if (opp.isHumanPlayer && opp.playerLevel) {
    ctx.font = '6px Rajdhani';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 0;
    ctx.fillText(`LVL ${opp.playerLevel}`, opp.x, opp.y - 40);
  }
  
  ctx.shadowBlur = 0;
}

function renderHealthBar(
  ctx: CanvasRenderingContext2D, 
  x: number, y: number, 
  width: number, height: number, 
  percent: number, color: string
): void {
  const barX = x - width / 2;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(barX - 1, y - 1, width + 2, height + 2);
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(barX - 1, y - 1, width + 2, height + 2);
  
  const healthGradient = ctx.createLinearGradient(barX, y, barX + width * percent, y);
  healthGradient.addColorStop(0, color);
  healthGradient.addColorStop(1, percent > 0.5 ? color : percent > 0.25 ? '#ffaa00' : '#ff4444');
  
  ctx.fillStyle = healthGradient;
  ctx.shadowColor = color;
  ctx.shadowBlur = 4;
  ctx.fillRect(barX, y, width * percent, height);
  ctx.shadowBlur = 0;
}

function renderArenaHUD(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const { arenaWidth, arenaHeight } = state;
  
  const diffColors: Record<string, string> = {
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    diamond: '#b9f2ff',
  };
  
  const badgeColor = diffColors[state.difficulty];
  
  // Difficulty indicator
  ctx.fillStyle = badgeColor;
  ctx.font = '10px Orbitron';
  ctx.textAlign = 'left';
  ctx.shadowColor = badgeColor;
  ctx.shadowBlur = 8;
  ctx.fillText(`◆ ${state.difficulty.toUpperCase()}`, 15, 25);
  ctx.shadowBlur = 0;
  
  // Match timer
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = '9px Orbitron';
  
  if (state.phase === 'fighting' && state.opponent) {
    const timeInSeconds = Math.floor(state.gameTime / 60);
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    ctx.fillText(`${minutes}:${seconds.toString().padStart(2, '0')}`, arenaWidth / 2, 25);
  }
  
  // Health displays
  ctx.font = '8px Orbitron';
  
  ctx.fillStyle = ARENA_COLORS.player;
  ctx.textAlign = 'right';
  const playerHealthPercent = Math.round((state.playerHealth / state.playerMaxHealth) * 100);
  ctx.fillText(`HULL: ${playerHealthPercent}%`, arenaWidth - 12, 25);
  
  if (state.opponent) {
    ctx.fillStyle = ARENA_COLORS.opponent;
    const oppHealthPercent = Math.round((state.opponent.health / state.opponent.maxHealth) * 100);
    ctx.fillText(`ENEMY: ${oppHealthPercent}%`, arenaWidth - 12, 38);
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
  ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
  ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
  
  const opp = state.opponent;
  const isHuman = opp?.isHumanPlayer;
  const scale = 1 + Math.sin(animationTime * 0.12) * 0.08;
  
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(scale, scale);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = '40px Orbitron';
  ctx.textAlign = 'center';
  ctx.shadowColor = ARENA_COLORS.opponent;
  ctx.shadowBlur = 30;
  ctx.fillText('VS', 0, 10);
  ctx.shadowBlur = 0;
  
  ctx.restore();
  
  // Decorative lines
  ctx.strokeStyle = ARENA_COLORS.opponent;
  ctx.lineWidth = 2;
  ctx.shadowColor = ARENA_COLORS.opponent;
  ctx.shadowBlur = 12;
  
  ctx.beginPath();
  ctx.moveTo(centerX - 80, centerY);
  ctx.lineTo(centerX - 35, centerY);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(centerX + 35, centerY);
  ctx.lineTo(centerX + 80, centerY);
  ctx.stroke();
  
  ctx.shadowBlur = 0;
  
  // Player label
  ctx.fillStyle = ARENA_COLORS.player;
  ctx.font = '14px Orbitron';
  ctx.shadowColor = ARENA_COLORS.player;
  ctx.shadowBlur = 12;
  ctx.fillText('YOU', centerX, centerY + 65);
  ctx.shadowBlur = 0;
  
  // Opponent
  if (opp) {
    ctx.fillStyle = ARENA_COLORS.opponent;
    ctx.font = isHuman ? '11px Orbitron' : '14px Orbitron';
    ctx.shadowColor = ARENA_COLORS.opponent;
    ctx.shadowBlur = 12;
    ctx.fillText(opp.name, centerX, centerY - 45);
    ctx.shadowBlur = 0;
    
    if (isHuman) {
      ctx.font = '8px Rajdhani';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      
      if (opp.playerLevel) {
        ctx.fillText(`Level ${opp.playerLevel}`, centerX, centerY - 58);
      }
      
      // Online indicator
      const pulse = Math.sin(animationTime * 0.18) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(0, 255, 136, ${pulse})`;
      ctx.beginPath();
      ctx.arc(centerX - 35, centerY - 47, 3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.font = '7px Rajdhani';
      ctx.fillStyle = 'rgba(0, 255, 136, 0.8)';
      ctx.textAlign = 'left';
      ctx.fillText('ONLINE', centerX - 30, centerY - 44);
      ctx.textAlign = 'center';
    }
  }
}

function renderCountdown(ctx: CanvasRenderingContext2D, state: ArenaState, centerX: number, centerY: number): void {
  const countdown = Math.ceil(state.phaseTimer / 60);
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
  
  const isGo = countdown === 0;
  const color = isGo ? ARENA_COLORS.player : '#ffffff';
  const text = isGo ? 'FIGHT!' : countdown.toString();
  
  const pulse = 1 + (60 - (state.phaseTimer % 60)) / 60 * 0.25;
  
  ctx.save();
  ctx.translate(centerX, centerY + 10);
  ctx.scale(pulse, pulse);
  
  ctx.fillStyle = color;
  ctx.font = '60px Orbitron';
  ctx.textAlign = 'center';
  ctx.shadowColor = isGo ? ARENA_COLORS.player : ARENA_COLORS.primary;
  ctx.shadowBlur = 35;
  ctx.fillText(text, 0, 0);
  ctx.shadowBlur = 0;
  
  ctx.restore();
}

function renderVictoryOverlay(ctx: CanvasRenderingContext2D, state: ArenaState, centerX: number, centerY: number): void {
  ctx.fillStyle = 'rgba(0, 35, 18, 0.92)';
  ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
  
  const pulse = Math.sin(animationTime * 0.12) * 0.08 + 1;
  
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(pulse, pulse);
  
  ctx.fillStyle = ARENA_COLORS.player;
  ctx.font = '32px Orbitron';
  ctx.textAlign = 'center';
  ctx.shadowColor = ARENA_COLORS.player;
  ctx.shadowBlur = 35;
  ctx.fillText('VICTORY!', 0, 0);
  ctx.shadowBlur = 0;
  
  ctx.restore();
  
  ctx.fillStyle = '#ffffff';
  ctx.font = '12px Orbitron';
  ctx.fillText('Collecting rewards...', centerX, centerY + 40);
}

function renderDefeatOverlay(ctx: CanvasRenderingContext2D, state: ArenaState, centerX: number, centerY: number): void {
  ctx.fillStyle = 'rgba(35, 0, 0, 0.92)';
  ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
  
  ctx.fillStyle = ARENA_COLORS.opponent;
  ctx.font = '32px Orbitron';
  ctx.textAlign = 'center';
  ctx.shadowColor = ARENA_COLORS.opponent;
  ctx.shadowBlur = 35;
  ctx.fillText('DEFEATED', centerX, centerY);
  ctx.shadowBlur = 0;
  
  ctx.fillStyle = '#666666';
  ctx.font = '12px Orbitron';
  ctx.fillText('Better luck next time...', centerX, centerY + 40);
}