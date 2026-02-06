// Rendering for new enemy types (15 new enemies)

import { VectorEnemy, VectorState } from './types';
import { VM_CONFIG } from './constants';

// Render a new enemy type - returns true if handled
export function renderNewEnemy(
  ctx: CanvasRenderingContext2D,
  enemy: VectorEnemy,
  state: VectorState,
  color: string
): boolean {
  const { size } = enemy;
  
  switch (enemy.type) {
    case 'bomber':
      renderBomber(ctx, enemy, state, color);
      return true;
    case 'shielder':
      renderShielder(ctx, enemy, state, color);
      return true;
    case 'teleporter':
      renderTeleporter(ctx, enemy, state, color);
      return true;
    case 'leech':
      renderLeech(ctx, enemy, state, color);
      return true;
    case 'mirror':
      renderMirror(ctx, enemy, state, color);
      return true;
    case 'pulsar':
      renderPulsar(ctx, enemy, state, color);
      return true;
    case 'swarm':
      renderSwarm(ctx, enemy, state, color);
      return true;
    case 'charger':
      renderCharger(ctx, enemy, state, color);
      return true;
    case 'phaser':
      renderPhaser(ctx, enemy, state, color);
      return true;
    case 'vortex':
      renderVortex(ctx, enemy, state, color);
      return true;
    case 'replicator':
      renderReplicator(ctx, enemy, state, color);
      return true;
    case 'stealth':
      renderStealth(ctx, enemy, state, color);
      return true;
    case 'titan':
      renderTitan(ctx, enemy, state, color);
      return true;
    case 'parasite':
      renderParasite(ctx, enemy, state, color);
      return true;
    case 'nova':
      renderNova(ctx, enemy, state, color);
      return true;
    default:
      return false;
  }
}

// Bomber - round with warning symbol
function renderBomber(ctx: CanvasRenderingContext2D, e: VectorEnemy, state: VectorState, color: string) {
  const pulse = 1 + Math.sin(e.behaviorTimer * 0.2) * 0.15;
  
  // Outer explosive shell
  ctx.strokeStyle = '#ff6600';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, e.size * pulse, 0, Math.PI * 2);
  ctx.stroke();
  
  // Warning stripes
  ctx.save();
  ctx.rotate(state.gameTime * 0.02);
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    ctx.strokeStyle = i % 2 === 0 ? '#ff6600' : '#ffaa00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * e.size * 0.4, Math.sin(angle) * e.size * 0.4);
    ctx.lineTo(Math.cos(angle) * e.size * 0.8, Math.sin(angle) * e.size * 0.8);
    ctx.stroke();
  }
  ctx.restore();
  
  // Danger core
  ctx.fillStyle = '#ffcc00';
  ctx.beginPath();
  ctx.arc(0, 0, e.size * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

// Shielder - triangle with frontal shield
function renderShielder(ctx: CanvasRenderingContext2D, e: VectorEnemy, state: VectorState, color: string) {
  ctx.rotate(e.targetAngle);
  
  // Body
  ctx.strokeStyle = '#44aaff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(e.size, 0);
  ctx.lineTo(-e.size * 0.6, -e.size * 0.6);
  ctx.lineTo(-e.size * 0.6, e.size * 0.6);
  ctx.closePath();
  ctx.stroke();
  
  // Frontal shield arc
  ctx.strokeStyle = '#88ddff';
  ctx.lineWidth = 4;
  ctx.shadowColor = '#88ddff';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(0, 0, e.size * 1.2, -VM_CONFIG.shielderShieldArc / 2, VM_CONFIG.shielderShieldArc / 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  
  // Shield shimmer
  const shimmer = Math.sin(state.gameTime * 0.15) * 0.3 + 0.7;
  ctx.globalAlpha = shimmer * 0.3;
  ctx.fillStyle = '#88ddff';
  ctx.beginPath();
  ctx.arc(0, 0, e.size * 1.2, -VM_CONFIG.shielderShieldArc / 2, VM_CONFIG.shielderShieldArc / 2);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

// Teleporter - glitchy appearance
function renderTeleporter(ctx: CanvasRenderingContext2D, e: VectorEnemy, state: VectorState, color: string) {
  const glitch = Math.random() > 0.9 ? (Math.random() - 0.5) * 4 : 0;
  
  // Glitchy diamond
  ctx.strokeStyle = '#aa44ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0 + glitch, -e.size);
  ctx.lineTo(e.size, 0 + glitch);
  ctx.lineTo(0 - glitch, e.size);
  ctx.lineTo(-e.size, 0 - glitch);
  ctx.closePath();
  ctx.stroke();
  
  // Teleport charging indicator
  const blinkProgress = e.behaviorTimer / VM_CONFIG.teleporterBlinkInterval;
  if (blinkProgress < 0.3) {
    ctx.fillStyle = '#ff44ff';
    ctx.globalAlpha = (1 - blinkProgress / 0.3) * 0.8;
    ctx.beginPath();
    ctx.arc(0, 0, e.size * 1.5 * (1 - blinkProgress), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  
  // Core
  ctx.fillStyle = '#dd88ff';
  ctx.beginPath();
  ctx.arc(0, 0, e.size * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

// Leech - organic, pulsing
function renderLeech(ctx: CanvasRenderingContext2D, e: VectorEnemy, state: VectorState, color: string) {
  const isAttached = e.fireTimer === 1;
  const pulse = 1 + Math.sin(state.gameTime * 0.2) * 0.2;
  
  // Body segments
  ctx.strokeStyle = isAttached ? '#ff0044' : '#884488';
  ctx.lineWidth = 2;
  
  for (let i = 0; i < 3; i++) {
    const segmentSize = e.size * (1 - i * 0.2) * pulse;
    const offset = i * 4;
    ctx.beginPath();
    ctx.ellipse(offset - 4, 0, segmentSize, segmentSize * 0.6, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Sucker/mouth when attached
  if (isAttached) {
    ctx.fillStyle = '#ff0044';
    ctx.beginPath();
    ctx.arc(e.size * 0.6, 0, e.size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Drain effect
    ctx.strokeStyle = '#ff0044';
    ctx.globalAlpha = 0.5;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(e.size * 0.6, 0);
    ctx.lineTo(e.size * 2, 0);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }
}

// Mirror - reflective diamond
function renderMirror(ctx: CanvasRenderingContext2D, e: VectorEnemy, state: VectorState, color: string) {
  ctx.rotate(state.gameTime * 0.03);
  
  // Reflective diamond
  const gradient = ctx.createLinearGradient(-e.size, -e.size, e.size, e.size);
  gradient.addColorStop(0, '#88ffff');
  gradient.addColorStop(0.5, '#ffffff');
  gradient.addColorStop(1, '#ff88ff');
  
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -e.size);
  ctx.lineTo(e.size, 0);
  ctx.lineTo(0, e.size);
  ctx.lineTo(-e.size, 0);
  ctx.closePath();
  ctx.stroke();
  
  // Inner mirror
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.moveTo(0, -e.size * 0.5);
  ctx.lineTo(e.size * 0.5, 0);
  ctx.lineTo(0, e.size * 0.5);
  ctx.lineTo(-e.size * 0.5, 0);
  ctx.closePath();
  ctx.fill();
}

// Pulsar - concentric rings with shockwave
function renderPulsar(ctx: CanvasRenderingContext2D, e: VectorEnemy, state: VectorState, color: string) {
  // Core
  ctx.fillStyle = '#00ffaa';
  ctx.beginPath();
  ctx.arc(0, 0, e.size * 0.4, 0, Math.PI * 2);
  ctx.fill();
  
  // Static rings
  ctx.strokeStyle = '#00ffaa';
  ctx.lineWidth = 1.5;
  for (let i = 1; i <= 2; i++) {
    ctx.globalAlpha = 1 - i * 0.3;
    ctx.beginPath();
    ctx.arc(0, 0, e.size * (0.5 + i * 0.25), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  
  // Expanding shockwave
  if (e.behaviorTimer > 0) {
    const pulseRadius = e.behaviorTimer;
    ctx.strokeStyle = '#00ffaa';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 1 - pulseRadius / VM_CONFIG.pulsarPulseRadius;
    ctx.beginPath();
    ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

// Swarm - tiny, simple
function renderSwarm(ctx: CanvasRenderingContext2D, e: VectorEnemy, state: VectorState, color: string) {
  const wobble = Math.sin(e.behaviorTimer) * 0.2;
  
  // Tiny body
  ctx.fillStyle = '#ffff44';
  ctx.beginPath();
  ctx.arc(wobble * 2, 0, e.size, 0, Math.PI * 2);
  ctx.fill();
  
  // Antennae
  ctx.strokeStyle = '#ffff44';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -e.size);
  ctx.lineTo(-2, -e.size - 4);
  ctx.moveTo(0, -e.size);
  ctx.lineTo(2, -e.size - 4);
  ctx.stroke();
}

// Charger - arrow with charge indicator
function renderCharger(ctx: CanvasRenderingContext2D, e: VectorEnemy, state: VectorState, color: string) {
  const chargeState = e.fireTimer;
  
  if (chargeState === 2) {
    // Rushing - motion blur effect
    ctx.rotate(e.targetAngle);
    ctx.strokeStyle = '#ff4400';
    ctx.lineWidth = 3;
    
    // Speed lines
    ctx.globalAlpha = 0.5;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-e.size * i, -e.size * 0.3);
      ctx.lineTo(-e.size * i, e.size * 0.3);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    
    // Arrow body
    ctx.beginPath();
    ctx.moveTo(e.size * 1.3, 0);
    ctx.lineTo(-e.size * 0.5, -e.size * 0.6);
    ctx.lineTo(-e.size * 0.5, e.size * 0.6);
    ctx.closePath();
    ctx.stroke();
  } else {
    // Normal or charging
    ctx.rotate(e.targetAngle);
    ctx.strokeStyle = chargeState === 1 ? '#ffaa00' : '#ff8844';
    ctx.lineWidth = 2;
    
    // Arrow body
    ctx.beginPath();
    ctx.moveTo(e.size, 0);
    ctx.lineTo(-e.size * 0.5, -e.size * 0.5);
    ctx.lineTo(-e.size * 0.3, 0);
    ctx.lineTo(-e.size * 0.5, e.size * 0.5);
    ctx.closePath();
    ctx.stroke();
    
    // Charge indicator
    if (chargeState === 1) {
      const chargeProgress = 1 - e.behaviorTimer / VM_CONFIG.chargerChargeTime;
      ctx.fillStyle = '#ffaa00';
      ctx.globalAlpha = chargeProgress;
      ctx.beginPath();
      ctx.arc(0, 0, e.size * 0.5 * chargeProgress, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
}

// Phaser - ghostly, transparent
function renderPhaser(ctx: CanvasRenderingContext2D, e: VectorEnemy, state: VectorState, color: string) {
  const isPhasing = e.behaviorTimer < 0;
  
  if (isPhasing) {
    ctx.globalAlpha = 0.3 + Math.sin(state.gameTime * 0.3) * 0.2;
  }
  
  // Ghostly hexagon
  ctx.strokeStyle = '#66ffff';
  ctx.lineWidth = isPhasing ? 1 : 2;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + state.gameTime * 0.02;
    const x = Math.cos(angle) * e.size;
    const y = Math.sin(angle) * e.size;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  
  // Phase indicator
  if (!isPhasing) {
    const phaseTimer = e.behaviorTimer / VM_CONFIG.phaserPhaseInterval;
    ctx.strokeStyle = '#44ffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, e.size * 0.5, 0, Math.PI * 2 * phaseTimer);
    ctx.stroke();
  }
  
  ctx.globalAlpha = 1;
}

// Vortex - spinning spiral
function renderVortex(ctx: CanvasRenderingContext2D, e: VectorEnemy, state: VectorState, color: string) {
  ctx.rotate(e.behaviorTimer);
  
  // Spiral arms
  ctx.strokeStyle = '#aa00ff';
  ctx.lineWidth = 2;
  for (let arm = 0; arm < 3; arm++) {
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 3; a += 0.1) {
      const r = (a / (Math.PI * 3)) * e.size;
      const angle = a + (arm / 3) * Math.PI * 2;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  
  // Core singularity
  ctx.fillStyle = '#220044';
  ctx.beginPath();
  ctx.arc(0, 0, e.size * 0.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Pull effect ring
  ctx.strokeStyle = '#aa00ff';
  ctx.globalAlpha = 0.3;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(0, 0, VM_CONFIG.vortexPullRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
}

// Replicator - cell-like with division indicator
function renderReplicator(ctx: CanvasRenderingContext2D, e: VectorEnemy, state: VectorState, color: string) {
  const isClone = e.behaviorTimer === 1;
  const pulse = 1 + Math.sin(state.gameTime * 0.1) * 0.1;
  
  // Cell membrane
  ctx.strokeStyle = isClone ? '#88ff88' : '#44ff44';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, e.size * pulse, e.size * 0.7 * pulse, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // Division line (only for original)
  if (!isClone && e.health > e.maxHealth * 0.5) {
    ctx.strokeStyle = '#44ff44';
    ctx.globalAlpha = 0.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, -e.size * 0.6);
    ctx.lineTo(0, e.size * 0.6);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }
  
  // Nucleus
  ctx.fillStyle = '#88ff88';
  ctx.beginPath();
  ctx.arc(0, 0, e.size * 0.25, 0, Math.PI * 2);
  ctx.fill();
}

// Stealth - barely visible until close
function renderStealth(ctx: CanvasRenderingContext2D, e: VectorEnemy, state: VectorState, color: string) {
  const isVisible = e.behaviorTimer === 1;
  
  ctx.globalAlpha = isVisible ? 0.9 : 0.15;
  
  // Stealth drone shape
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(e.size, 0);
  ctx.lineTo(-e.size * 0.5, -e.size * 0.7);
  ctx.lineTo(-e.size * 0.3, 0);
  ctx.lineTo(-e.size * 0.5, e.size * 0.7);
  ctx.closePath();
  ctx.stroke();
  
  if (isVisible) {
    // Revealed effect
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(0, 0, e.size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.globalAlpha = 1;
}

// Titan - massive, armored
function renderTitan(ctx: CanvasRenderingContext2D, e: VectorEnemy, state: VectorState, color: string) {
  // Outer armor plating
  ctx.strokeStyle = '#ff4444';
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + state.gameTime * 0.01;
    const x = Math.cos(angle) * e.size;
    const y = Math.sin(angle) * e.size;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  
  // Inner structure
  ctx.strokeStyle = '#ff6666';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 - state.gameTime * 0.015;
    const x = Math.cos(angle) * e.size * 0.6;
    const y = Math.sin(angle) * e.size * 0.6;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  
  // Central core
  ctx.fillStyle = '#ff8888';
  ctx.beginPath();
  ctx.arc(0, 0, e.size * 0.25, 0, Math.PI * 2);
  ctx.fill();
}

// Parasite - organic, segmented
function renderParasite(ctx: CanvasRenderingContext2D, e: VectorEnemy, state: VectorState, color: string) {
  const isMini = e.fireTimer === 1;
  const wiggle = Math.sin(state.gameTime * 0.2 + e.id.charCodeAt(0)) * 0.3;
  
  ctx.rotate(Math.atan2(e.vy, e.vx) + wiggle);
  
  // Segmented body
  ctx.strokeStyle = isMini ? '#88ff44' : '#44ff00';
  ctx.lineWidth = isMini ? 1.5 : 2;
  
  for (let i = 0; i < 4; i++) {
    const offset = i * e.size * 0.4 - e.size * 0.6;
    const segSize = e.size * (1 - i * 0.15);
    ctx.beginPath();
    ctx.ellipse(offset, 0, segSize * 0.5, segSize * 0.4, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Mandibles
  ctx.strokeStyle = '#88ff44';
  ctx.beginPath();
  ctx.moveTo(e.size * 0.3, -e.size * 0.3);
  ctx.lineTo(e.size * 0.6, -e.size * 0.1);
  ctx.moveTo(e.size * 0.3, e.size * 0.3);
  ctx.lineTo(e.size * 0.6, e.size * 0.1);
  ctx.stroke();
}

// Nova - glowing, unstable
function renderNova(ctx: CanvasRenderingContext2D, e: VectorEnemy, state: VectorState, color: string) {
  const glowIntensity = Math.sin(e.behaviorTimer) * 0.3 + 0.7;
  
  // Outer glow
  ctx.fillStyle = '#ffff00';
  ctx.globalAlpha = glowIntensity * 0.3;
  ctx.beginPath();
  ctx.arc(0, 0, e.size * 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  
  // Star shape
  ctx.strokeStyle = '#ffcc00';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + state.gameTime * 0.05;
    const r = i % 2 === 0 ? e.size : e.size * 0.5;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  
  // Bright core
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, e.size * 0.3 * glowIntensity, 0, Math.PI * 2);
  ctx.fill();
  
  // Warning indicator based on health
  const healthPercent = e.health / e.maxHealth;
  if (healthPercent < 0.5) {
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 1;
    ctx.globalAlpha = (1 - healthPercent * 2) * (Math.sin(state.gameTime * 0.3) * 0.5 + 0.5);
    ctx.beginPath();
    ctx.arc(0, 0, e.size * 1.8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}
