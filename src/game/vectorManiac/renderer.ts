// Vector Maniac Renderer

import { VectorState } from './types';
import { VM_CONFIG, getMapTheme, MapTheme } from './constants';
import { drawMegaShip } from '../megaShipRenderer';
import { getStoredMegaShipId } from '@/hooks/useMegaShips';
import { getStoredSkinColors } from '@/hooks/useEquipment';
import { getStoredUpgrades } from '@/hooks/useShipUpgrades';
export function renderVectorManiac(ctx: CanvasRenderingContext2D, state: VectorState): void {
  const { arenaWidth, arenaHeight } = VM_CONFIG;
  
  // Clear and draw background
  renderBackground(ctx, state);
  
  // Draw pattern overlay
  renderPattern(ctx, state);
  
  // Draw salvage
  renderSalvage(ctx, state);
  
  // Draw power-ups
  renderPowerUps(ctx, state);
  
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
  
  // Draw boss warning overlay
  if (state.bossWarning && state.bossWarningTimer > 0) {
    renderBossWarningOverlay(ctx, state);
  }
  
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

function renderBossWarningOverlay(ctx: CanvasRenderingContext2D, state: VectorState): void {
  const { arenaWidth, arenaHeight } = VM_CONFIG;
  const timer = state.bossWarningTimer;
  
  // Get boss name and color for current map
  const bossIndex = state.currentMap % 10;
  const bossName = VM_CONFIG.bossNames[bossIndex];
  const bossColor = VM_CONFIG.bossColors[bossIndex];
  
  // Flashing red vignette effect
  const flashIntensity = Math.sin(state.gameTime * 0.3) * 0.5 + 0.5;
  const vignetteAlpha = 0.15 + flashIntensity * 0.15;
  
  // Red vignette
  const gradient = ctx.createRadialGradient(
    arenaWidth / 2, arenaHeight / 2, arenaHeight * 0.3,
    arenaWidth / 2, arenaHeight / 2, arenaHeight * 0.8
  );
  gradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
  gradient.addColorStop(1, `rgba(255, 0, 0, ${vignetteAlpha})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, arenaWidth, arenaHeight);
  
  // Flashing warning bars at top and bottom
  const barHeight = 8;
  const barFlash = Math.floor(state.gameTime / 8) % 2 === 0;
  if (barFlash) {
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 50, arenaWidth, barHeight);
    ctx.fillRect(0, arenaHeight - 50 - barHeight, arenaWidth, barHeight);
  } else {
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(0, 50, arenaWidth, barHeight);
    ctx.fillRect(0, arenaHeight - 50 - barHeight, arenaWidth, barHeight);
  }
  
  // Main warning text
  const textFlash = Math.floor(state.gameTime / 6) % 2 === 0;
  const textY = arenaHeight / 2 - 60;
  
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  if (textFlash) {
    // "WARNING" text
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 42px monospace';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 20;
    ctx.fillText('⚠ WARNING ⚠', arenaWidth / 2, textY);
    
    // Boss name in its unique color
    ctx.fillStyle = bossColor;
    ctx.font = 'bold 28px monospace';
    ctx.shadowColor = bossColor;
    ctx.shadowBlur = 15;
    ctx.fillText(bossName, arenaWidth / 2, textY + 50);
    
    // "INCOMING" text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px monospace';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 12;
    ctx.fillText('INCOMING', arenaWidth / 2, textY + 85);
  } else {
    // Dimmer version for flash effect
    ctx.fillStyle = '#aa0000';
    ctx.font = 'bold 42px monospace';
    ctx.shadowColor = '#aa0000';
    ctx.shadowBlur = 10;
    ctx.fillText('⚠ WARNING ⚠', arenaWidth / 2, textY);
    
    // Dimmer boss name
    ctx.fillStyle = bossColor;
    ctx.globalAlpha = 0.6;
    ctx.font = 'bold 28px monospace';
    ctx.shadowColor = bossColor;
    ctx.shadowBlur = 8;
    ctx.fillText(bossName, arenaWidth / 2, textY + 50);
    ctx.globalAlpha = 1;
    
    ctx.fillStyle = '#888888';
    ctx.font = 'bold 24px monospace';
    ctx.shadowColor = '#888888';
    ctx.shadowBlur = 6;
    ctx.fillText('INCOMING', arenaWidth / 2, textY + 85);
  }
  
  // Timer countdown
  const secondsLeft = Math.ceil(timer / 60);
  ctx.fillStyle = '#ffff00';
  ctx.font = 'bold 24px monospace';
  ctx.shadowColor = '#ffff00';
  ctx.shadowBlur = 10;
  ctx.fillText(`${secondsLeft}`, arenaWidth / 2, textY + 100);
  
  ctx.restore();
}

function renderBackground(ctx: CanvasRenderingContext2D, state: VectorState): void {
  const { arenaWidth, arenaHeight } = VM_CONFIG;
  
  // Get theme for current map
  const theme = getMapTheme(state.currentMap);
  
  const gradient = ctx.createRadialGradient(
    arenaWidth / 2, arenaHeight / 2, 0,
    arenaWidth / 2, arenaHeight / 2, arenaWidth / 2
  );
  gradient.addColorStop(0, theme.bg2);
  gradient.addColorStop(1, theme.bg1);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, arenaWidth, arenaHeight);
}

function renderPattern(ctx: CanvasRenderingContext2D, state: VectorState): void {
  const { arenaWidth, arenaHeight } = VM_CONFIG;
  const theme = getMapTheme(state.currentMap);
  const gridSize = 40;
  const offset = (state.gameTime * 0.5) % gridSize;
  
  ctx.strokeStyle = theme.gridColor;
  ctx.lineWidth = 1;
  
  switch (theme.pattern) {
    case 'grid':
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
      break;
      
    case 'hexagon':
      const hexSize = gridSize * 0.8;
      for (let row = 0; row < arenaHeight / (hexSize * 1.5) + 2; row++) {
        for (let col = 0; col < arenaWidth / (hexSize * 1.7) + 2; col++) {
          const cx = col * hexSize * 1.7 + (row % 2) * hexSize * 0.85 + offset;
          const cy = row * hexSize * 1.5 + offset;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
            const px = cx + Math.cos(angle) * hexSize * 0.5;
            const py = cy + Math.sin(angle) * hexSize * 0.5;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      break;
      
    case 'circles':
      for (let i = 1; i <= 8; i++) {
        const radius = i * 100 + Math.sin(state.gameTime * 0.02 + i) * 20;
        ctx.beginPath();
        ctx.arc(arenaWidth / 2, arenaHeight / 2, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
      
    case 'triangles':
      const triSize = gridSize * 1.5;
      for (let row = 0; row < arenaHeight / triSize + 2; row++) {
        for (let col = 0; col < arenaWidth / triSize + 2; col++) {
          const cx = col * triSize + offset;
          const cy = row * triSize + offset;
          const inverted = (row + col) % 2 === 0;
          ctx.beginPath();
          if (inverted) {
            ctx.moveTo(cx, cy + triSize * 0.4);
            ctx.lineTo(cx + triSize * 0.5, cy - triSize * 0.3);
            ctx.lineTo(cx - triSize * 0.5, cy - triSize * 0.3);
          } else {
            ctx.moveTo(cx, cy - triSize * 0.4);
            ctx.lineTo(cx + triSize * 0.5, cy + triSize * 0.3);
            ctx.lineTo(cx - triSize * 0.5, cy + triSize * 0.3);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      break;
      
    case 'diamonds':
      const diamSize = gridSize;
      for (let row = 0; row < arenaHeight / diamSize + 2; row++) {
        for (let col = 0; col < arenaWidth / diamSize + 2; col++) {
          const cx = col * diamSize + offset;
          const cy = row * diamSize + offset;
          ctx.beginPath();
          ctx.moveTo(cx, cy - diamSize * 0.4);
          ctx.lineTo(cx + diamSize * 0.4, cy);
          ctx.lineTo(cx, cy + diamSize * 0.4);
          ctx.lineTo(cx - diamSize * 0.4, cy);
          ctx.closePath();
          ctx.stroke();
        }
      }
      break;
      
    case 'waves':
      for (let y = 0; y < arenaHeight; y += gridSize) {
        ctx.beginPath();
        for (let x = 0; x <= arenaWidth; x += 10) {
          const wave = Math.sin((x + state.gameTime * 2) * 0.03) * 15;
          if (x === 0) ctx.moveTo(x, y + wave);
          else ctx.lineTo(x, y + wave);
        }
        ctx.stroke();
      }
      break;
      
    case 'stars':
      const starSpacing = gridSize * 2;
      for (let row = 0; row < arenaHeight / starSpacing + 1; row++) {
        for (let col = 0; col < arenaWidth / starSpacing + 1; col++) {
          const cx = col * starSpacing + offset * 2;
          const cy = row * starSpacing + offset * 2;
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
            const innerAngle = angle + Math.PI / 5;
            const outerR = 12;
            const innerR = 5;
            ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
            ctx.lineTo(cx + Math.cos(innerAngle) * innerR, cy + Math.sin(innerAngle) * innerR);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      break;
      
    case 'spiral':
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 10; a += 0.1) {
        const r = a * 30 + state.gameTime * 0.5;
        const x = arenaWidth / 2 + Math.cos(a) * r;
        const y = arenaHeight / 2 + Math.sin(a) * r;
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      break;
  }
}

function renderSalvage(ctx: CanvasRenderingContext2D, state: VectorState): void {
  for (const salvage of state.salvage) {
    const pulse = Math.sin(state.gameTime * 0.1 + salvage.x) * 0.2 + 0.8;
    
    if (salvage.isRare) {
      // Rare pod - bright white/gold glow with pulsing effect
      const rarePulse = Math.sin(state.gameTime * 0.2) * 0.3 + 0.7;
      
      // Outer glow ring
      ctx.save();
      ctx.globalAlpha = 0.6 * rarePulse;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 25;
      ctx.strokeStyle = '#ffdd44';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(salvage.x, salvage.y, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      
      // Middle glow
      ctx.save();
      ctx.globalAlpha = 0.7 * rarePulse;
      ctx.shadowColor = '#ffff88';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#ffdd44';
      ctx.beginPath();
      ctx.arc(salvage.x, salvage.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      // Bright core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(salvage.x, salvage.y, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Cross sparkle
      ctx.save();
      ctx.globalAlpha = 0.8 * rarePulse;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(salvage.x - 10, salvage.y);
      ctx.lineTo(salvage.x + 10, salvage.y);
      ctx.moveTo(salvage.x, salvage.y - 10);
      ctx.lineTo(salvage.x, salvage.y + 10);
      ctx.stroke();
      ctx.restore();
    } else {
      // Normal salvage - green glow
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
}

function renderPowerUps(ctx: CanvasRenderingContext2D, state: VectorState): void {
  for (const powerUp of state.powerups) {
    const pulse = Math.sin(state.gameTime * 0.15 + powerUp.x) * 0.3 + 0.7;
    const color = VM_CONFIG.powerUpColors[powerUp.type];
    const size = VM_CONFIG.powerUpSize;
    
    ctx.save();
    ctx.translate(powerUp.x, powerUp.y);
    
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
      ctx.arc(powerUp.x, powerUp.y, size + 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
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
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (proj.bossType && proj.bossColor) {
      // Boss projectiles - varied styles based on type
      ctx.shadowColor = proj.bossColor;
      ctx.shadowBlur = 12;
      
      switch (proj.bossType) {
        case 'laser':
          // Thin concentrated beam
          ctx.strokeStyle = proj.bossColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          const laserAngle = Math.atan2(proj.vy, proj.vx);
          ctx.moveTo(proj.x - Math.cos(laserAngle) * 15, proj.y - Math.sin(laserAngle) * 15);
          ctx.lineTo(proj.x + Math.cos(laserAngle) * 15, proj.y + Math.sin(laserAngle) * 15);
          ctx.stroke();
          // Core glow
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 2, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'plasma':
          // Large pulsing orb with rings
          const plasmaSize = proj.size + Math.sin(state.gameTime * 0.2) * 2;
          ctx.fillStyle = proj.bossColor;
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, plasmaSize * 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, plasmaSize, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'energy':
          // Diamond shape spinning
          ctx.fillStyle = proj.bossColor;
          ctx.save();
          ctx.translate(proj.x, proj.y);
          ctx.rotate(state.gameTime * 0.15);
          ctx.beginPath();
          ctx.moveTo(0, -proj.size);
          ctx.lineTo(proj.size * 0.6, 0);
          ctx.lineTo(0, proj.size);
          ctx.lineTo(-proj.size * 0.6, 0);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          break;
          
        case 'fire':
          // Flickering flame shape
          const fireFlicker = Math.random() * 3;
          ctx.fillStyle = proj.bossColor;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.size + fireFlicker, 0, Math.PI * 2);
          ctx.fill();
          // Inner core
          ctx.fillStyle = '#ffff00';
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'ice':
          // Crystal shard shape
          ctx.fillStyle = proj.bossColor;
          ctx.save();
          ctx.translate(proj.x, proj.y);
          const iceAngle = Math.atan2(proj.vy, proj.vx);
          ctx.rotate(iceAngle);
          ctx.beginPath();
          ctx.moveTo(proj.size * 1.5, 0);
          ctx.lineTo(-proj.size * 0.5, proj.size * 0.5);
          ctx.lineTo(-proj.size * 0.5, -proj.size * 0.5);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          break;
          
        case 'void':
          // Dark vortex with swirl
          ctx.fillStyle = proj.bossColor;
          ctx.globalAlpha = 0.4;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.size * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.strokeStyle = proj.bossColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let i = 0; i < 3; i++) {
            const angle = state.gameTime * 0.1 + (i / 3) * Math.PI * 2;
            ctx.moveTo(proj.x, proj.y);
            ctx.lineTo(
              proj.x + Math.cos(angle) * proj.size * 1.5,
              proj.y + Math.sin(angle) * proj.size * 1.5
            );
          }
          ctx.stroke();
          break;
          
        case 'electric':
          // Lightning bolt effect
          ctx.strokeStyle = proj.bossColor;
          ctx.lineWidth = 3;
          ctx.beginPath();
          const boltAngle = Math.atan2(proj.vy, proj.vx);
          let bx = proj.x - Math.cos(boltAngle) * 12;
          let by = proj.y - Math.sin(boltAngle) * 12;
          ctx.moveTo(bx, by);
          for (let i = 0; i < 4; i++) {
            bx += Math.cos(boltAngle) * 6 + (Math.random() - 0.5) * 6;
            by += Math.sin(boltAngle) * 6 + (Math.random() - 0.5) * 6;
            ctx.lineTo(bx, by);
          }
          ctx.stroke();
          // Glow center
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 3, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'toxic':
          // Bubbling poison
          ctx.fillStyle = proj.bossColor;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
          ctx.fill();
          // Small bubbles
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          ctx.arc(proj.x + 4, proj.y - 3, 2, 0, Math.PI * 2);
          ctx.arc(proj.x - 3, proj.y + 2, 1.5, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'pulse':
          // Expanding ring
          const pulsePhase = (state.gameTime % 30) / 30;
          ctx.strokeStyle = proj.bossColor;
          ctx.lineWidth = 3 - pulsePhase * 2;
          ctx.globalAlpha = 1 - pulsePhase * 0.5;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.size + pulsePhase * 5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.fillStyle = proj.bossColor;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        default:
          // Normal boss bullet
          ctx.fillStyle = proj.bossColor;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
          ctx.fill();
      }
    } else {
      // Regular enemy bullets - red
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
}

function renderEnemies(ctx: CanvasRenderingContext2D, state: VectorState): void {
  for (const enemy of state.enemies) {
    // Use map-specific boss color - mapId is encoded in upper bits of behaviorTimer
    const bossMapId = Math.floor((enemy.behaviorTimer ?? 0) / 10000);
    const bossColorIndex = (bossMapId > 0 ? bossMapId : state.currentMap) % 10;
    const color = enemy.type === 'boss' 
      ? VM_CONFIG.bossColors[bossColorIndex]
      : VM_CONFIG.enemyColors[enemy.type];
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
        
      case 'boss': {
        // Boss - map-specific geometry so each map feels like a new boss
        const mapSeed = Math.floor((enemy.behaviorTimer ?? 0) / 10000);
        const rotationSpeed = 0.014 + (mapSeed % 6) * 0.003;
        const bossRotation = state.gameTime * rotationSpeed;

        const outerSides = 6 + (mapSeed % 7); // 6-12
        const midSides = 5 + ((mapSeed * 3) % 6); // 5-10
        const spikes = 4 + (mapSeed % 6); // 4-9
        const style = mapSeed % 4; // 0-3
        
        // RAGE MODE visual - red pulsing aura when below 50% health
        const isRaging = healthPercent < 0.5;
        if (isRaging) {
          const ragePulse = Math.sin(state.gameTime * 0.15) * 0.3 + 0.7;
          const rageSize = enemy.size * (1.4 + ragePulse * 0.3);
          
          // Outer rage glow
          ctx.save();
          ctx.globalAlpha = 0.2 * ragePulse;
          ctx.fillStyle = '#ff0000';
          ctx.shadowColor = '#ff0000';
          ctx.shadowBlur = 40;
          ctx.beginPath();
          ctx.arc(0, 0, rageSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          
          // Inner rage ring
          ctx.save();
          ctx.globalAlpha = 0.5 * ragePulse;
          ctx.strokeStyle = '#ff0000';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#ff0000';
          ctx.shadowBlur = 20;
          ctx.setLineDash([8, 4]);
          ctx.beginPath();
          ctx.arc(0, 0, enemy.size * 1.2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          
          // Rage particles
          ctx.save();
          ctx.globalAlpha = 0.8;
          for (let i = 0; i < 6; i++) {
            const particleAngle = (i / 6) * Math.PI * 2 + state.gameTime * 0.08;
            const particleRadius = enemy.size * 1.1;
            const px = Math.cos(particleAngle) * particleRadius;
            const py = Math.sin(particleAngle) * particleRadius;
            ctx.fillStyle = '#ff4400';
            ctx.shadowColor = '#ff4400';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(px, py, 3 + Math.sin(state.gameTime * 0.2 + i) * 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        ctx.lineWidth = 4;

        // Outer ring
        ctx.beginPath();
        for (let i = 0; i < outerSides; i++) {
          const angle = (i / outerSides) * Math.PI * 2 + bossRotation;
          const r = enemy.size * (style === 2 ? (0.9 + 0.12 * Math.sin(state.gameTime * 0.06 + i)) : 1);
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        // Middle ring (counter-rotate)
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < midSides; i++) {
          const angle = (i / midSides) * Math.PI * 2 - bossRotation * (1.2 + (mapSeed % 3) * 0.35);
          const r = enemy.size * 0.65;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        // Inner core (varies per boss)
        const corePulse = 8 + Math.sin(state.gameTime * (0.08 + (mapSeed % 5) * 0.02)) * 3;
        ctx.fillStyle = color;
        ctx.beginPath();
        if (style === 1) {
          // diamond core
          ctx.moveTo(0, -corePulse);
          ctx.lineTo(corePulse, 0);
          ctx.lineTo(0, corePulse);
          ctx.lineTo(-corePulse, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.arc(0, 0, corePulse, 0, Math.PI * 2);
          ctx.fill();
        }

        // Spikes / rays (changes per boss)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        for (let i = 0; i < spikes; i++) {
          const angle = (i / spikes) * Math.PI * 2 + bossRotation * (1.8 + (mapSeed % 4) * 0.4);
          const len = enemy.size * (style === 3 ? 0.55 : 0.4);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
          ctx.stroke();
        }
        break;
      }
    }
    
    ctx.restore();
    
    // Health bar (for elites, bounty, and boss)
    if ((enemy.type === 'elite' || enemy.type === 'bounty' || enemy.type === 'boss') && healthPercent < 1) {
      const barWidth = enemy.type === 'boss' ? enemy.size * 3 : enemy.size * 2;
      const barHeight = enemy.type === 'boss' ? 6 : 3;
      const barX = enemy.x - barWidth / 2;
      const barY = enemy.y - enemy.size - 12;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      ctx.fillStyle = color;
      ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
      
      // Boss name label - unique per map
      if (enemy.type === 'boss') {
        const bossMapId = Math.floor((enemy.behaviorTimer ?? 0) / 10000);
        const bossNameIndex = (bossMapId > 0 ? bossMapId : state.currentMap) % 10;
        const bossName = VM_CONFIG.bossNames[bossNameIndex];
        
        ctx.fillStyle = color;
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fillText(bossName, enemy.x, barY - 8);
        ctx.shadowBlur = 0;
      }
    }
  }
}

function renderPlayer(ctx: CanvasRenderingContext2D, state: VectorState): void {
  // Draw power-up auras BEFORE the player (so they appear behind)
  renderPowerUpAuras(ctx, state);
  
  ctx.save();
  ctx.translate(state.playerX, state.playerY);
  ctx.rotate(state.playerAngle);
  
  // Invulnerability flash
  if (state.invulnerableTimer > 0 && Math.floor(state.invulnerableTimer / 4) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }
  
  // Shield indicator (built-in shields)
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
  const upgradeState = getStoredUpgrades();
  drawMegaShip(ctx, 0, 0, megaShipId, state.gameTime * 0.003, skinColors, upgradeState);

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

function renderPowerUpAuras(ctx: CanvasRenderingContext2D, state: VectorState): void {
  const { activePowerUps } = state;
  const baseSize = VM_CONFIG.playerSize;
  const time = state.gameTime;
  
  // Count active power-ups for layered effect
  const activeLayers: { color: string; offset: number }[] = [];
  
  if (activePowerUps.doublePoints > 0) {
    activeLayers.push({ color: VM_CONFIG.powerUpColors.doublePoints, offset: 0 });
  }
  if (activePowerUps.doubleShot > 0) {
    activeLayers.push({ color: VM_CONFIG.powerUpColors.doubleShot, offset: 1 });
  }
  if (activePowerUps.speedBoost > 0) {
    activeLayers.push({ color: VM_CONFIG.powerUpColors.speedBoost, offset: 2 });
  }
  
  if (activeLayers.length === 0) return;
  
  ctx.save();
  ctx.translate(state.playerX, state.playerY);
  
  // Draw each power-up aura layer
  activeLayers.forEach((layer, index) => {
    const pulseSpeed = 0.08 + index * 0.02;
    const pulse = Math.sin(time * pulseSpeed + layer.offset) * 0.3 + 0.7;
    const auraSize = baseSize + 12 + index * 8;
    
    // Outer glow ring
    ctx.save();
    ctx.globalAlpha = 0.15 * pulse;
    ctx.shadowColor = layer.color;
    ctx.shadowBlur = 25;
    ctx.strokeStyle = layer.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, auraSize + 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    
    // Main rotating aura ring
    ctx.save();
    ctx.globalAlpha = 0.3 * pulse;
    ctx.rotate(time * 0.02 * (index % 2 === 0 ? 1 : -1));
    ctx.strokeStyle = layer.color;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, auraSize, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    
    // Inner particle ring effect
    ctx.save();
    ctx.globalAlpha = 0.5 * pulse;
    const particleCount = 6;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + time * 0.03 * (index % 2 === 0 ? 1 : -1);
      const px = Math.cos(angle) * (auraSize - 4);
      const py = Math.sin(angle) * (auraSize - 4);
      const particleSize = 2 + Math.sin(time * 0.1 + i) * 1;
      
      ctx.fillStyle = layer.color;
      ctx.shadowColor = layer.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(px, py, particleSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
  
  // Combined glow effect when multiple power-ups active
  if (activeLayers.length >= 2) {
    ctx.save();
    const combinedPulse = Math.sin(time * 0.05) * 0.2 + 0.4;
    ctx.globalAlpha = 0.1 * combinedPulse;
    
    const gradient = ctx.createRadialGradient(0, 0, baseSize, 0, 0, baseSize + 40);
    activeLayers.forEach((layer, index) => {
      gradient.addColorStop(index / activeLayers.length, layer.color);
    });
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, baseSize + 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  
  ctx.restore();
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
  const theme = getMapTheme(state.currentMap);
  
  // Top bar
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, arenaWidth, 40);
  
  ctx.textBaseline = 'middle';
  
  // Map and Level indicator (left side)
  ctx.fillStyle = theme.accentColor;
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`MAP ${state.currentMap}/${VM_CONFIG.totalMaps}`, 10, 12);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px monospace';
  ctx.fillText(`LEVEL ${state.currentLevel}`, 10, 28);
  
  // Wave indicator (next to map)
  ctx.fillStyle = '#ffff00';
  ctx.font = 'bold 11px monospace';
  ctx.fillText(`WAVE ${state.currentWave}/${state.wavesInMap}`, 110, 20);
  
  // Score (center)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`SCORE: ${Math.floor(state.score)}`, arenaWidth / 2, 20);
  
  // Salvage (right)
  ctx.textAlign = 'right';
  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(`💎 ${state.salvageCount}`, arenaWidth - 10, 12);
  
  // Boss indicator when active
  if (state.bossActive) {
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('⚠ BOSS', arenaWidth - 10, 28);
  }
  
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
  
  // Map name display (when starting a new map)
  if (state.showMapName && state.mapNameTimer > 0) {
    const theme = getMapTheme(state.currentMap);
    // Quick fade: show for ~2.6 seconds, fade out in last 0.4 seconds
    const displayTime = 156; // ~2.6 seconds total display
    const effectiveTimer = Math.min(state.mapNameTimer, displayTime);
    const fadeOutStart = 24; // Start fading at ~0.4 seconds remaining
    const alpha = effectiveTimer < fadeOutStart ? effectiveTimer / fadeOutStart : 1;
    
    ctx.save();
    ctx.globalAlpha = alpha * 0.95;
    
    const centerX = arenaWidth / 2;
    const centerY = VM_CONFIG.arenaHeight / 2 - 160;
    
    // Glow effect behind text
    ctx.shadowColor = theme.accentColor;
    ctx.shadowBlur = 30;
    
    // "MAP X" label
    ctx.fillStyle = theme.accentColor;
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`— MAP ${state.currentMap} —`, arenaWidth / 2, centerY - 10);
    
    // Map name (large)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px monospace';
    ctx.shadowBlur = 25;
    ctx.fillText(theme.name.toUpperCase(), arenaWidth / 2, centerY + 30);
    
    // Level indicator
    ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`LEVEL ${state.currentLevel} • ${state.wavesInMap} WAVE${state.wavesInMap > 1 ? 'S' : ''}`, arenaWidth / 2, centerY + 60);
    
    ctx.restore();
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
      const barX = arenaWidth - 15 - barWidth;
      
      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, y - 6, barWidth, barHeight);
      
      // Progress bar
      const progress = powerUp.remaining / VM_CONFIG.powerUpDuration;
      ctx.fillStyle = powerUp.color;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(barX, y - 6, barWidth * progress, barHeight);
      ctx.globalAlpha = 1;
      
      // Text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(powerUp.name, arenaWidth - 20 - barWidth, y);
    });
  }
}

function renderEnteringOverlay(ctx: CanvasRenderingContext2D, state: VectorState): void {
  const { arenaWidth, arenaHeight } = VM_CONFIG;
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
  ctx.translate(centerX, centerY - 140);
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
  ctx.fillText('VECTOR', centerX, centerY - 170);
  
  // Double stroke effect
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.strokeText('VECTOR', centerX, centerY - 170);
  
  // "MANIAC" with cyan glow
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 40;
  ctx.fillStyle = '#00ffff';
  ctx.fillText('MANIAC', centerX, centerY - 115);
  ctx.strokeStyle = '#ffffff';
  ctx.strokeText('MANIAC', centerX, centerY - 115);
  ctx.restore();
  
  // Subtitle with tech style
  ctx.fillStyle = '#888888';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('[ TACTICAL ARENA COMBAT SYSTEM v2.0 ]', centerX, centerY - 70);
  
  // Animated "INITIALIZING" / "READY" text
  const phase = Math.floor(t / 60) % 3;
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
  ctx.fillText(statusTexts[phase], centerX, centerY - 20);
  ctx.restore();
  
  // Bottom status bar
  const barY = arenaHeight - 60;
  ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
  ctx.fillRect(60, barY, arenaWidth - 120, 30);
  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 1;
  ctx.strokeRect(60, barY, arenaWidth - 120, 30);
  
  // Loading bar animation
  const loadProgress = Math.min(1, t / 120);
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
