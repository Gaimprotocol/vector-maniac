// Arena Battle Mode Renderer - Clean with image backgrounds

import { ArenaState, ARENA_POWERUP_INFO } from './types';
import { drawMegaShip } from '../megaShipRenderer';
import { getShipProjectileStyle } from '../vectorManiac/shipProjectiles';
import { getStoredMegaShipId } from '@/hooks/useMegaShips';
import { getArenaImage } from './arenas';

const COLORS = {
  player: '#00ffaa',
  opponent: '#ff5577',
  white: '#ffffff',
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
  
  // Subtle vignette overlay
  const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.7);
  vignette.addColorStop(0, 'transparent');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
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
  
  // Health bar
  renderHealthBar(ctx, state.playerX, state.playerY + 18, 28, 3, 
    state.playerHealth / state.playerMaxHealth, COLORS.player);
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
  
  // Health bar
  renderHealthBar(ctx, opp.x, opp.y - 22, 32, 3, 
    opp.health / opp.maxHealth, COLORS.opponent);
  
  // Name
  ctx.fillStyle = COLORS.opponent;
  ctx.font = '8px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(opp.name, opp.x, opp.y - 28);
  
  if (opp.isHumanPlayer && opp.playerLevel) {
    ctx.fillStyle = '#668';
    ctx.font = '6px sans-serif';
    ctx.fillText(`LV${opp.playerLevel}`, opp.x, opp.y - 35);
  }
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
  const { arenaWidth: w } = state;
  
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
  
  // Timer
  if (state.phase === 'fighting') {
    const secs = Math.floor(state.gameTime / 60);
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${mins}:${s.toString().padStart(2, '0')}`, w / 2, 18);
  }
  
  // Health %
  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.player;
  ctx.font = '8px sans-serif';
  ctx.fillText(`HULL ${Math.round((state.playerHealth / state.playerMaxHealth) * 100)}%`, w - 10, 18);
  
  if (state.opponent) {
    ctx.fillStyle = COLORS.opponent;
    ctx.fillText(`ENEMY ${Math.round((state.opponent.health / state.opponent.maxHealth) * 100)}%`, w - 10, 30);
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
