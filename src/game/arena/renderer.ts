// Arena Battle Mode Renderer - Clean with image backgrounds

import { ArenaState, ArenaObstacle, ArenaPowerUp, ARENA_POWERUP_INFO } from './types';
import { drawMegaShip } from '../megaShipRenderer';
import { getShipProjectileStyle } from '../vectorManiac/shipProjectiles';
import { getStoredMegaShipId } from '@/hooks/useMegaShips';
import { getArenaImage } from './arenas';

const COLORS = {
  player: '#00ffaa',
  opponent: '#ff5577',
  white: '#ffffff',
  barrier: '#00ffcc',
  obstacle: '#00ddaa',
};

let animTime = 0;

export function renderArena(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  animTime = state.gameTime;
  
  ctx.save();
  
  // Screen shake
  if (state.screenShakeIntensity > 0) {
    ctx.translate(
      (Math.random() - 0.5) * state.screenShakeIntensity,
      (Math.random() - 0.5) * state.screenShakeIntensity
    );
  }
  
  // Render layers
  renderBackground(ctx, state);
  renderPowerUps(ctx, state);
  renderProjectiles(ctx, state);
  renderParticles(ctx, state);
  
  if (state.opponent && state.phase !== 'playerWon') {
    renderOpponent(ctx, state);
  }
  
  if (state.phase !== 'playerLost' && state.phase !== 'rewards') {
    renderPlayer(ctx, state);
  }
  
  renderHUD(ctx, state);
  renderPhaseOverlay(ctx, state);
  renderEffects(ctx, state);
  
  ctx.restore();
}

function renderBackground(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const { arenaWidth: w, arenaHeight: h } = state;
  
  // Get the arena background image
  const bgImage = getArenaImage(state.arenaId);
  
  if (bgImage && bgImage.complete && bgImage.naturalWidth > 0) {
    // Draw background image covering the whole arena
    ctx.drawImage(bgImage, 0, 0, w, h);
  } else {
    // Fallback dark background
    ctx.fillStyle = '#050a0f';
    ctx.fillRect(0, 0, w, h);
  }
  
  // Very subtle vignette - keeps background sharp
  const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.5, w / 2, h / 2, h * 0.85);
  vignette.addColorStop(0, 'transparent');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}

function renderPulsingGlow(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const { arenaWidth: w, arenaHeight: h } = state;
  
  // Slow pulsing center glow
  const pulse1 = Math.sin(animTime * 0.02) * 0.5 + 0.5;
  const pulse2 = Math.sin(animTime * 0.015 + 1) * 0.5 + 0.5;
  
  // Center glow - cyan tint
  const glow1 = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, h * 0.5);
  glow1.addColorStop(0, `rgba(0, 255, 170, ${0.03 * pulse1})`);
  glow1.addColorStop(0.5, `rgba(0, 200, 150, ${0.02 * pulse1})`);
  glow1.addColorStop(1, 'transparent');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, w, h);
  
  // Top edge glow
  const glow2 = ctx.createLinearGradient(0, 0, 0, h * 0.3);
  glow2.addColorStop(0, `rgba(0, 255, 200, ${0.08 * pulse2})`);
  glow2.addColorStop(1, 'transparent');
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, w, h * 0.3);
  
  // Bottom edge glow
  const glow3 = ctx.createLinearGradient(0, h, 0, h * 0.7);
  glow3.addColorStop(0, `rgba(0, 255, 200, ${0.08 * pulse2})`);
  glow3.addColorStop(1, 'transparent');
  ctx.fillStyle = glow3;
  ctx.fillRect(0, h * 0.7, w, h * 0.3);
  
  // Corner accents - pulsing
  const cornerPulse = Math.sin(animTime * 0.03) * 0.3 + 0.7;
  const cornerSize = 80;
  
  // Top-left corner
  const tlGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, cornerSize);
  tlGrad.addColorStop(0, `rgba(0, 255, 170, ${0.15 * cornerPulse})`);
  tlGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = tlGrad;
  ctx.fillRect(0, 0, cornerSize, cornerSize);
  
  // Top-right corner
  const trGrad = ctx.createRadialGradient(w, 0, 0, w, 0, cornerSize);
  trGrad.addColorStop(0, `rgba(0, 255, 170, ${0.15 * cornerPulse})`);
  trGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = trGrad;
  ctx.fillRect(w - cornerSize, 0, cornerSize, cornerSize);
  
  // Bottom-left corner
  const blGrad = ctx.createRadialGradient(0, h, 0, 0, h, cornerSize);
  blGrad.addColorStop(0, `rgba(0, 255, 170, ${0.15 * cornerPulse})`);
  blGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = blGrad;
  ctx.fillRect(0, h - cornerSize, cornerSize, cornerSize);
  
  // Bottom-right corner
  const brGrad = ctx.createRadialGradient(w, h, 0, w, h, cornerSize);
  brGrad.addColorStop(0, `rgba(0, 255, 170, ${0.15 * cornerPulse})`);
  brGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = brGrad;
  ctx.fillRect(w - cornerSize, h - cornerSize, cornerSize, cornerSize);
}

function renderScanlines(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const { arenaWidth: w, arenaHeight: h } = state;
  
  // Subtle moving scanlines
  const scanlineSpacing = 3;
  const scanlineOffset = (animTime * 0.5) % scanlineSpacing;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  
  for (let y = scanlineOffset; y < h; y += scanlineSpacing) {
    ctx.fillRect(0, y, w, 1);
  }
  
  // Occasional bright scanline sweep
  const sweepY = ((animTime * 2) % (h + 100)) - 50;
  if (sweepY >= 0 && sweepY < h) {
    const sweepGrad = ctx.createLinearGradient(0, sweepY - 20, 0, sweepY + 20);
    sweepGrad.addColorStop(0, 'transparent');
    sweepGrad.addColorStop(0.5, 'rgba(0, 255, 200, 0.03)');
    sweepGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sweepGrad;
    ctx.fillRect(0, sweepY - 20, w, 40);
  }
  
  // Subtle noise/static effect (very light)
  if (Math.random() < 0.3) {
    const noiseCount = 5;
    ctx.fillStyle = 'rgba(0, 255, 170, 0.02)';
    for (let i = 0; i < noiseCount; i++) {
      const nx = Math.random() * w;
      const ny = Math.random() * h;
      const nw = 2 + Math.random() * 10;
      ctx.fillRect(nx, ny, nw, 1);
    }
  }
}

// Render obstacles that blend with the tech background
function renderObstacles(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  for (const obs of state.obstacles) {
    // Phase platforms - only render when visible or fading
    if (obs.type === 'phasePlatform') {
      if (!obs.isVisible) {
        // Ghost effect when about to appear
        if (obs.phaseTimer !== undefined && obs.phaseDuration !== undefined) {
          const timeLeft = obs.phaseDuration - obs.phaseTimer;
          if (timeLeft < 40) {
            renderGhostPlatform(ctx, obs, timeLeft / 40);
          }
        }
        continue;
      }
      renderPhasePlatform(ctx, obs);
    } else if (obs.type === 'laserGrid') {
      renderLaserGrid(ctx, obs);
    } else if (obs.type === 'barrier') {
      renderEnergyBarrier(ctx, obs);
    } else if (obs.type === 'pillar') {
      renderTechPillar(ctx, obs);
    } else if (obs.type === 'wall') {
      renderTechWall(ctx, obs);
    }
  }
}

function renderEnergyBarrier(ctx: CanvasRenderingContext2D, obs: ArenaObstacle): void {
  const hw = obs.width / 2;
  const hh = obs.height / 2;
  const pulse = Math.sin(animTime * 0.08 + obs.x * 0.01) * 0.3 + 0.7;
  
  ctx.save();
  ctx.translate(obs.x, obs.y);
  
  // Outer glow
  ctx.strokeStyle = COLORS.barrier;
  ctx.lineWidth = 4;
  ctx.globalAlpha = 0.2 * pulse;
  ctx.beginPath();
  ctx.moveTo(-hw, 0);
  ctx.lineTo(hw, 0);
  ctx.stroke();
  
  // Main barrier line
  ctx.strokeStyle = COLORS.barrier;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.8 * pulse;
  ctx.beginPath();
  ctx.moveTo(-hw, 0);
  ctx.lineTo(hw, 0);
  ctx.stroke();
  
  // Core bright line
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.6 * pulse;
  ctx.beginPath();
  ctx.moveTo(-hw, 0);
  ctx.lineTo(hw, 0);
  ctx.stroke();
  
  // End caps
  ctx.fillStyle = COLORS.barrier;
  ctx.globalAlpha = pulse;
  ctx.beginPath();
  ctx.arc(-hw, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(hw, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function renderTechPillar(ctx: CanvasRenderingContext2D, obs: ArenaObstacle): void {
  const r = obs.width / 2;
  const pulse = Math.sin(animTime * 0.05 + obs.x * 0.02) * 0.2 + 0.8;
  const color = obs.destructible ? '#ffaa00' : COLORS.obstacle;
  
  ctx.save();
  ctx.translate(obs.x, obs.y);
  
  // Outer glow
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.15 * pulse;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * (r + 3);
    const y = Math.sin(angle) * (r + 3);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  
  // Main hexagon
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = pulse;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  
  // Fill
  ctx.fillStyle = 'rgba(0, 20, 30, 0.8)';
  ctx.fill();
  
  // Center dot
  ctx.fillStyle = color;
  ctx.globalAlpha = pulse;
  ctx.beginPath();
  ctx.arc(0, 0, 2, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function renderTechWall(ctx: CanvasRenderingContext2D, obs: ArenaObstacle): void {
  const hw = obs.width / 2;
  const hh = obs.height / 2;
  const color = obs.destructible ? '#ffaa00' : COLORS.obstacle;
  const pulse = Math.sin(animTime * 0.04 + obs.y * 0.02) * 0.15 + 0.85;
  
  ctx.save();
  ctx.translate(obs.x, obs.y);
  
  // Fill
  ctx.fillStyle = 'rgba(0, 20, 30, 0.8)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = pulse;
  
  ctx.beginPath();
  ctx.rect(-hw, -hh, obs.width, obs.height);
  ctx.fill();
  ctx.stroke();
  
  // Center line detail
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.5 * pulse;
  ctx.beginPath();
  ctx.moveTo(-hw + 3, 0);
  ctx.lineTo(hw - 3, 0);
  ctx.stroke();
  
  ctx.restore();
}

function renderLaserGrid(ctx: CanvasRenderingContext2D, obs: ArenaObstacle): void {
  const rotation = obs.rotation || 0;
  const len = (obs.laserLength || 50) * 0.5;
  
  ctx.save();
  ctx.translate(obs.x, obs.y);
  
  // 4 laser beams
  for (let i = 0; i < 4; i++) {
    const angle = rotation + (i * Math.PI / 2);
    const ex = Math.cos(angle) * len;
    const ey = Math.sin(angle) * len;
    
    // Glow
    ctx.strokeStyle = 'rgba(255, 50, 80, 0.25)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    
    // Core
    ctx.strokeStyle = '#ff3355';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    
    // Inner
    ctx.strokeStyle = '#ffaaaa';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }
  
  // Hub
  ctx.fillStyle = '#ff3355';
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#220008';
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function renderPhasePlatform(ctx: CanvasRenderingContext2D, obs: ArenaObstacle): void {
  const hw = obs.width / 2;
  const hh = obs.height / 2;
  
  let alpha = 1;
  if (obs.phaseTimer !== undefined && obs.phaseDuration !== undefined) {
    const timeLeft = obs.phaseDuration - obs.phaseTimer;
    if (timeLeft < 30) alpha = timeLeft / 30;
  }
  
  ctx.save();
  ctx.translate(obs.x, obs.y);
  ctx.globalAlpha = alpha;
  
  // Fill
  ctx.fillStyle = 'rgba(0, 180, 120, 0.4)';
  ctx.strokeStyle = '#00ffaa';
  ctx.lineWidth = 1.5;
  
  ctx.beginPath();
  ctx.rect(-hw, -hh, obs.width, obs.height);
  ctx.fill();
  ctx.stroke();
  
  // Grid pattern inside
  ctx.strokeStyle = 'rgba(0, 255, 170, 0.25)';
  ctx.lineWidth = 0.5;
  const gs = 8;
  for (let x = -hw + gs; x < hw; x += gs) {
    ctx.beginPath();
    ctx.moveTo(x, -hh + 2);
    ctx.lineTo(x, hh - 2);
    ctx.stroke();
  }
  
  ctx.restore();
}

function renderGhostPlatform(ctx: CanvasRenderingContext2D, obs: ArenaObstacle, alpha: number): void {
  const hw = obs.width / 2;
  const hh = obs.height / 2;
  
  ctx.save();
  ctx.translate(obs.x, obs.y);
  ctx.globalAlpha = alpha * 0.3;
  ctx.strokeStyle = '#00ffaa';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.strokeRect(-hw, -hh, obs.width, obs.height);
  ctx.setLineDash([]);
  ctx.restore();
}

// Render power-ups
function renderPowerUps(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  for (const pu of state.powerUps) {
    const info = ARENA_POWERUP_INFO[pu.type];
    const bob = Math.sin(animTime * 0.08 + pu.bobOffset) * 3;
    const pulse = Math.sin(animTime * 0.1) * 0.2 + 0.8;
    
    ctx.save();
    ctx.translate(pu.x, pu.y + bob);
    
    // Outer glow
    ctx.strokeStyle = info.glowColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3 * pulse;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.stroke();
    
    // Outer ring
    ctx.strokeStyle = info.color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.6 * pulse;
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner fill
    ctx.globalAlpha = 1;
    ctx.fillStyle = info.color;
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    
    // Icon
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 7px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const icons: Record<string, string> = { emp: '⚡', teleport: '◊', shield: '+', overdrive: '»' };
    ctx.fillText(icons[pu.type] || '?', 0, 0);
    
    ctx.restore();
  }
}

function renderProjectiles(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  for (const p of state.projectiles) {
    if (p.isPlayer) {
      const style = getShipProjectileStyle(p.shipId || 'default');
      
      // Glow
      ctx.fillStyle = style.color;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Core
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Enemy projectile
      ctx.fillStyle = COLORS.opponent;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function renderParticles(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  for (const p of state.particles) {
    const alpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function renderPlayer(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  ctx.save();
  ctx.translate(state.playerX, state.playerY);
  ctx.rotate(state.playerAngle);
  ctx.scale(0.45, 0.45);
  
  if (state.playerInvulnerable > 0 && Math.floor(animTime / 4) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }
  
  drawMegaShip(ctx, 0, 0, getStoredMegaShipId(), animTime);
  
  ctx.restore();
}

function renderOpponent(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const opp = state.opponent;
  if (!opp) return;
  
  ctx.save();
  ctx.translate(opp.x, opp.y);
  ctx.rotate(opp.angle);
  ctx.scale(0.45, 0.45);
  
  ctx.save();
  drawMegaShip(ctx, 0, 0, opp.shipId, animTime);
  
  // Red tint
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = 'rgba(255, 50, 80, 0.2)';
  ctx.beginPath();
  ctx.arc(0, 0, 35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  ctx.restore();
}

function renderHealthBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, pct: number, color: string): void {
  const bx = x - w / 2;
  
  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(bx, y, w, h);
  
  // Health
  ctx.fillStyle = pct > 0.5 ? color : pct > 0.25 ? '#ffaa00' : '#ff4444';
  ctx.fillRect(bx, y, w * pct, h);
  
  // Border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(bx, y, w, h);
}

function renderHUD(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const { arenaWidth: w, arenaHeight: h } = state;
  
  const diffColors: Record<string, string> = {
    bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', diamond: '#b9f2ff'
  };
  
  // Arena name (top left)
  ctx.fillStyle = '#00ffaa';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(state.arenaName, 10, 18);
  
  // Difficulty below name
  ctx.fillStyle = diffColors[state.difficulty] || '#fff';
  ctx.font = '7px sans-serif';
  ctx.fillText(`◆ ${state.difficulty.toUpperCase()}`, 10, 30);
  
  // Timer (top center)
  if (state.phase === 'fighting') {
    const secs = Math.floor(state.gameTime / 60);
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${mins}:${s.toString().padStart(2, '0')}`, w / 2, 18);
  }
  
  // Health bars at bottom of screen
  const barWidth = 120;
  const barHeight = 8;
  const barY = h - 25;
  const barPadding = 15;
  
  // Player health bar (bottom left)
  ctx.fillStyle = COLORS.player;
  ctx.font = 'bold 8px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('YOU', barPadding, barY - 4);
  renderHealthBar(ctx, barPadding + barWidth / 2, barY, barWidth, barHeight, 
    state.playerHealth / state.playerMaxHealth, COLORS.player);
  
  // Opponent health bar (bottom right)
  if (state.opponent) {
    ctx.fillStyle = COLORS.opponent;
    ctx.textAlign = 'right';
    ctx.fillText(state.opponent.name, w - barPadding, barY - 4);
    
    if (state.opponent.isHumanPlayer && state.opponent.playerLevel) {
      ctx.fillStyle = '#668';
      ctx.font = '6px sans-serif';
      ctx.fillText(`LV${state.opponent.playerLevel}`, w - barPadding - 50, barY - 4);
    }
    
    renderHealthBar(ctx, w - barPadding - barWidth / 2, barY, barWidth, barHeight, 
      state.opponent.health / state.opponent.maxHealth, COLORS.opponent);
  }
}

function renderPhaseOverlay(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const { arenaWidth: w, arenaHeight: h } = state;
  const cx = w / 2, cy = h / 2;
  
  switch (state.phase) {
    case 'entering':
      renderVS(ctx, state, cx, cy);
      break;
    case 'countdown':
      renderCountdown(ctx, state, cx, cy);
      break;
    case 'playerWon':
      renderVictory(ctx, state, cx, cy);
      break;
    case 'playerLost':
      renderDefeat(ctx, state, cx, cy);
      break;
  }
}

function renderVS(ctx: CanvasRenderingContext2D, state: ArenaState, cx: number, cy: number): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
  
  const opp = state.opponent;
  const scale = 1 + Math.sin(animTime * 0.1) * 0.05;
  
  // Arena name
  ctx.fillStyle = '#00ffaa';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(state.arenaName, cx, cy - 70);
  
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VS', 0, 8);
  
  ctx.restore();
  
  // Lines
  ctx.strokeStyle = COLORS.opponent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 60, cy);
  ctx.lineTo(cx - 30, cy);
  ctx.moveTo(cx + 30, cy);
  ctx.lineTo(cx + 60, cy);
  ctx.stroke();
  
  // Player label
  ctx.fillStyle = COLORS.player;
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('YOU', cx, cy + 50);
  
  // Opponent
  if (opp) {
    ctx.fillStyle = COLORS.opponent;
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(opp.name, cx, cy - 38);
    
    if (opp.isHumanPlayer) {
      const pulse = Math.sin(animTime * 0.15) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(0, 255, 136, ${pulse})`;
      ctx.beginPath();
      ctx.arc(cx - 30, cy - 40, 3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(0, 255, 136, 0.8)';
      ctx.font = '7px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('ONLINE', cx - 25, cy - 38);
      ctx.textAlign = 'center';
    }
  }
}

function renderCountdown(ctx: CanvasRenderingContext2D, state: ArenaState, cx: number, cy: number): void {
  const count = Math.ceil(state.phaseTimer / 60);
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
  
  const isGo = count === 0;
  const text = isGo ? 'FIGHT!' : count.toString();
  const color = isGo ? COLORS.player : '#fff';
  
  ctx.fillStyle = color;
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, cx, cy + 15);
}

function renderVictory(ctx: CanvasRenderingContext2D, state: ArenaState, cx: number, cy: number): void {
  ctx.fillStyle = 'rgba(0, 30, 20, 0.9)';
  ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
  
  ctx.fillStyle = COLORS.player;
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VICTORY!', cx, cy);
  
  ctx.fillStyle = '#aaa';
  ctx.font = '11px sans-serif';
  ctx.fillText('Collecting rewards...', cx, cy + 30);
}

function renderDefeat(ctx: CanvasRenderingContext2D, state: ArenaState, cx: number, cy: number): void {
  ctx.fillStyle = 'rgba(30, 0, 0, 0.9)';
  ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
  
  ctx.fillStyle = COLORS.opponent;
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DEFEATED', cx, cy);
  
  ctx.fillStyle = '#666';
  ctx.font = '11px sans-serif';
  ctx.fillText('Better luck next time...', cx, cy + 30);
}

function renderEffects(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  // EMP flash
  if (state.empFlashTimer > 0) {
    ctx.fillStyle = `rgba(0, 200, 255, ${(state.empFlashTimer / 30) * 0.2})`;
    ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
  }
  
  // Teleport flash
  if (state.teleportFlashTimer > 0) {
    ctx.fillStyle = `rgba(200, 0, 255, ${(state.teleportFlashTimer / 20) * 0.3})`;
    ctx.fillRect(0, 0, state.arenaWidth, state.arenaHeight);
  }
  
  // Power-up notification
  if (state.powerUpNotificationTimer > 0 && state.lastPowerUpCollected) {
    const info = ARENA_POWERUP_INFO[state.lastPowerUpCollected];
    const alpha = Math.min(1, state.powerUpNotificationTimer / 30);
    const y = state.arenaHeight / 2 - 80;
    
    ctx.fillStyle = info.color;
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(info.name.toUpperCase(), state.arenaWidth / 2, y);
    ctx.globalAlpha = 1;
  }
  
  // Overdrive border
  if (state.overdriveTimer > 0) {
    const pulse = Math.sin(animTime * 0.2) * 0.2 + 0.6;
    ctx.strokeStyle = `rgba(255, 170, 0, ${pulse})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(3, 3, state.arenaWidth - 6, state.arenaHeight - 6);
    
    ctx.fillStyle = '#ffaa00';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`OVERDRIVE ${Math.ceil(state.overdriveTimer / 60)}s`, 10, 45);
  }
  
  // Stun indicator
  if (state.opponentStunTimer > 0 && state.opponent) {
    ctx.fillStyle = '#00ccff';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`STUNNED ${Math.ceil(state.opponentStunTimer / 60)}s`, state.opponent.x, state.opponent.y - 40);
  }
}
