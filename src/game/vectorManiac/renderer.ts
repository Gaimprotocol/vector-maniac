// Vector Maniac Renderer

import { VectorState } from './types';
import { VM_CONFIG, getMapTheme, MapTheme } from './constants';
import { drawMegaShip } from '../megaShipRenderer';
import { getStoredMegaShipId } from '@/hooks/useMegaShips';
import { getStoredSkinColors } from '@/hooks/useEquipment';
import { getStoredUpgrades } from '@/hooks/useShipUpgrades';
import { getShipProjectileStyle, ProjectileShape } from './shipProjectiles';
import { decodeDNA, getAnomalyColor, getAnomalyGlowColor, getAnomalyName, AnomalyShape } from './anomalyGenerator';
import { 
  generateBackgroundAnomalyDNA, 
  generateHyperspaceAnomalyDNA,
  getBackgroundColors,
  getHyperspaceColors,
  BackgroundAnomalyDNA,
  HyperspaceAnomalyDNA
} from './visualAnomalyGenerator';
import { recordBackgroundAnomalyVisit, recordHyperspaceAnomalyVisit } from '@/hooks/useVisualBestiary';
import { renderCompanion } from './companion';

// Track which anomalies we've already recorded this session to avoid duplicates
let lastRecordedBgSeed: number | null = null;
let lastRecordedHsSeed: number | null = null;

export function renderVectorManiac(ctx: CanvasRenderingContext2D, state: VectorState): void {
  const { arenaWidth, arenaHeight } = VM_CONFIG;
  
  // Apply screen shake
  ctx.save();
  if (state.screenShakeIntensity > 0) {
    const shakeX = (Math.random() - 0.5) * state.screenShakeIntensity * 2;
    const shakeY = (Math.random() - 0.5) * state.screenShakeIntensity * 2;
    ctx.translate(shakeX, shakeY);
  }
  
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
  
  // Draw companion (if any)
  if (state.companion) {
    renderCompanion(ctx, state.companion, state.gameTime);
  }
  
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
  
  // Draw boss enraged overlay
  if (state.bossEnragedTimer > 0) {
    renderBossEnragedOverlay(ctx, state);
  }
  
  // Draw phase overlays
  switch (state.phase) {
    case 'entering':
      renderEnteringOverlay(ctx, state);
      break;
    case 'waveComplete':
      renderWaveCompleteOverlay(ctx, state);
      break;
    case 'hyperspaceEnter':
    case 'hyperspace':
      renderHyperspaceOverlay(ctx, state);
      break;
    case 'hyperspaceExit':
      renderHyperspaceExitOverlay(ctx, state);
      break;
    case 'gameOver':
      renderGameOverOverlay(ctx, state);
      break;
    case 'victory':
      renderVictoryOverlay(ctx, state);
      break;
  }
  
  // Restore context after screen shake
  ctx.restore();
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

function renderBossEnragedOverlay(ctx: CanvasRenderingContext2D, state: VectorState): void {
  const { arenaWidth, arenaHeight } = VM_CONFIG;
  const timer = state.bossEnragedTimer;
  
  // Calculate alpha based on timer - starts strong, fades out
  const baseAlpha = Math.min(1, timer / 60);
  const flashIntensity = Math.sin(state.gameTime * 0.4) * 0.3 + 0.7;
  
  ctx.save();
  
  // Red pulsing vignette
  const vignetteAlpha = 0.2 * baseAlpha * flashIntensity;
  const gradient = ctx.createRadialGradient(
    arenaWidth / 2, arenaHeight / 2, arenaHeight * 0.2,
    arenaWidth / 2, arenaHeight / 2, arenaHeight * 0.7
  );
  gradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
  gradient.addColorStop(1, `rgba(255, 0, 0, ${vignetteAlpha})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, arenaWidth, arenaHeight);
  
  // Main "ENRAGED!" text
  const textY = arenaHeight / 2 - 100;
  const textFlash = Math.floor(state.gameTime / 4) % 2 === 0;
  const scale = 1 + Math.sin(state.gameTime * 0.3) * 0.05;
  
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Outer glow
  ctx.save();
  ctx.translate(arenaWidth / 2, textY);
  ctx.scale(scale, scale);
  
  if (textFlash) {
    // Bright flash
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 52px monospace';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 30;
    ctx.fillText('ENRAGED!', 0, 0);
    
    // White core
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.5 * baseAlpha;
    ctx.fillText('ENRAGED!', 0, 0);
  } else {
    // Dimmer version
    ctx.fillStyle = '#aa0000';
    ctx.font = 'bold 52px monospace';
    ctx.shadowColor = '#aa0000';
    ctx.shadowBlur = 15;
    ctx.fillText('ENRAGED!', 0, 0);
  }
  
  ctx.restore();
  
  // Subtitle text
  ctx.globalAlpha = baseAlpha * 0.8;
  ctx.fillStyle = '#ff6600';
  ctx.font = 'bold 18px monospace';
  ctx.shadowColor = '#ff6600';
  ctx.shadowBlur = 8;
  ctx.fillText('BOSS SPEED & FIRE RATE INCREASED!', arenaWidth / 2, textY + 45);
  
  ctx.restore();
}

function renderBackground(ctx: CanvasRenderingContext2D, state: VectorState): void {
  const { arenaWidth, arenaHeight } = VM_CONFIG;
  
  // Get theme for current map
  const theme = getMapTheme(state.currentMap);
  
  // Check if in hyperspace mode
  const isHyperspace = state.phase === 'hyperspace' || 
                       state.phase === 'hyperspaceEnter' || 
                       state.phase === 'hyperspaceExit';
  
  if (isHyperspace) {
    // Check for hyperspace visual anomaly
    if (state.hyperspaceAnomalySeed !== null) {
      const hsDNA = generateHyperspaceAnomalyDNA(state.currentMap, state.hyperspaceAnomalySeed);
      const hsColors = getHyperspaceColors(hsDNA);
      
      // Record visit to visual bestiary (once per seed)
      if (lastRecordedHsSeed !== state.hyperspaceAnomalySeed) {
        recordHyperspaceAnomalyVisit(hsDNA);
        lastRecordedHsSeed = state.hyperspaceAnomalySeed;
      }
      
      // Anomaly hyperspace background
      const gradient = ctx.createLinearGradient(0, 0, 0, arenaHeight);
      gradient.addColorStop(0, hsColors.bg1);
      gradient.addColorStop(0.5, hsColors.bg2);
      gradient.addColorStop(1, hsColors.bg3);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, arenaWidth, arenaHeight);
      
      // Render anomaly hyperspace speed lines with custom colors
      renderAnomalyHyperspaceSpeedLines(ctx, state, hsDNA);
    } else {
      // Standard hyperspace variant
      const variantIndex = (state.currentMap - 1) % VM_CONFIG.hyperspaceVariants.length;
      const variant = VM_CONFIG.hyperspaceVariants[variantIndex];
      
      const gradient = ctx.createLinearGradient(0, 0, 0, arenaHeight);
      
      const bgColors: Record<string, [string, string, string]> = {
        '#00ffff': ['#000022', '#001144', '#002255'],
        '#ff00ff': ['#110022', '#220044', '#330066'],
        '#ffaa00': ['#221100', '#332200', '#443300'],
        '#8800ff': ['#0a0022', '#150044', '#200066'],
        '#ffff00': ['#222200', '#333300', '#444400'],
      };
      const colors = bgColors[variant.color] || bgColors['#00ffff'];
      
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(0.5, colors[1]);
      gradient.addColorStop(1, colors[2]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, arenaWidth, arenaHeight);
      
      renderHyperspaceSpeedLines(ctx, state);
    }
  } else {
    // Check for background visual anomaly
    if (state.backgroundAnomalySeed !== null) {
      const bgDNA = generateBackgroundAnomalyDNA(state.currentMap, state.backgroundAnomalySeed);
      const bgColors = getBackgroundColors(bgDNA);
      
      // Record visit to visual bestiary (once per seed)
      if (lastRecordedBgSeed !== state.backgroundAnomalySeed) {
        recordBackgroundAnomalyVisit(bgDNA);
        lastRecordedBgSeed = state.backgroundAnomalySeed;
      }
      
      // Anomaly background gradient
      const gradient = ctx.createRadialGradient(
        arenaWidth / 2, arenaHeight / 2, 0,
        arenaWidth / 2, arenaHeight / 2, arenaWidth / 2
      );
      gradient.addColorStop(0, bgColors.bg2);
      gradient.addColorStop(1, bgColors.bg1);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, arenaWidth, arenaHeight);
      
      // Render special anomaly effects
      renderAnomalyBackgroundEffects(ctx, state, bgDNA);
    } else {
      // Standard map theme
      const gradient = ctx.createRadialGradient(
        arenaWidth / 2, arenaHeight / 2, 0,
        arenaWidth / 2, arenaHeight / 2, arenaWidth / 2
      );
      gradient.addColorStop(0, theme.bg2);
      gradient.addColorStop(1, theme.bg1);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, arenaWidth, arenaHeight);
    }
  }
}

// Render anomaly-specific background effects
function renderAnomalyBackgroundEffects(ctx: CanvasRenderingContext2D, state: VectorState, dna: BackgroundAnomalyDNA): void {
  const { arenaWidth, arenaHeight } = VM_CONFIG;
  const bgColors = getBackgroundColors(dna);
  const time = state.gameTime * dna.patternSpeed * 0.01;
  
  ctx.save();
  
  // Pattern-specific rendering
  switch (dna.pattern) {
    case 'vortex':
      // Spiraling lines toward center
      const spiralCount = Math.floor(12 * dna.patternDensity);
      for (let i = 0; i < spiralCount; i++) {
        const angle = (i / spiralCount) * Math.PI * 2 + time;
        ctx.beginPath();
        for (let r = 50; r < arenaHeight * 0.8; r += 20) {
          const spiralAngle = angle + r * 0.008;
          const x = arenaWidth / 2 + Math.cos(spiralAngle) * r;
          const y = arenaHeight / 2 + Math.sin(spiralAngle) * r;
          if (r === 50) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `hsla(${dna.accentHue}, ${dna.saturation}%, 50%, 0.08)`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      break;
      
    case 'neural':
      // Neural network nodes and connections
      const nodeCount = Math.floor(20 * dna.patternDensity);
      const nodes: Array<{x: number; y: number}> = [];
      for (let i = 0; i < nodeCount; i++) {
        const seed = i * 137.5 + dna.seed;
        const x = ((Math.sin(seed) * 10000) % 1) * arenaWidth;
        const y = ((Math.sin(seed + 1) * 10000) % 1) * arenaHeight;
        nodes.push({ x, y });
        
        // Draw node
        ctx.beginPath();
        ctx.arc(x, y, 3 + Math.sin(time + i) * 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${dna.accentHue}, ${dna.saturation}%, 60%, 0.15)`;
        ctx.fill();
      }
      // Draw connections
      ctx.strokeStyle = `hsla(${dna.accentHue}, ${dna.saturation}%, 50%, 0.05)`;
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dist = Math.hypot(nodes[j].x - nodes[i].x, nodes[j].y - nodes[i].y);
          if (dist < 200) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      break;
      
    case 'quantum':
      // Floating particles with quantum-like behavior
      const particleCount = Math.floor(60 * dna.patternDensity);
      for (let i = 0; i < particleCount; i++) {
        const seed = i * 73.7 + dna.seed;
        const baseX = ((Math.sin(seed) * 10000) % 1) * arenaWidth;
        const baseY = ((Math.sin(seed + 1) * 10000) % 1) * arenaHeight;
        const wobble = Math.sin(time * 2 + seed) * 20;
        const x = baseX + wobble;
        const y = baseY + Math.cos(time * 1.5 + seed) * 15;
        const size = 2 + Math.sin(time + i) * 1.5;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${dna.primaryHue + i * 3}, ${dna.saturation}%, 60%, 0.12)`;
        ctx.fill();
      }
      break;
      
    case 'glitch':
      // Digital glitch lines
      const glitchCount = Math.floor(15 * dna.patternDensity);
      for (let i = 0; i < glitchCount; i++) {
        const seed = i * 97.3 + dna.seed + Math.floor(time * 0.1);
        const y = ((Math.sin(seed) * 10000) % 1) * arenaHeight;
        const x1 = ((Math.sin(seed + 1) * 10000) % 1) * arenaWidth;
        const width = 50 + ((Math.sin(seed + 2) * 10000) % 1) * 200;
        const height = 2 + ((Math.sin(seed + 3) * 10000) % 1) * 8;
        
        ctx.fillStyle = `hsla(${dna.accentHue}, ${dna.saturation}%, 60%, 0.08)`;
        ctx.fillRect(x1, y, width, height);
      }
      break;
      
    case 'circuit':
      // Circuit board traces
      ctx.strokeStyle = `hsla(${dna.accentHue}, ${dna.saturation}%, 50%, 0.06)`;
      ctx.lineWidth = 2;
      const traceCount = Math.floor(8 * dna.patternDensity);
      for (let i = 0; i < traceCount; i++) {
        const seed = i * 157.3 + dna.seed;
        let x = ((Math.sin(seed) * 10000) % 1) * arenaWidth;
        let y = ((Math.sin(seed + 1) * 10000) % 1) * arenaHeight;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let j = 0; j < 8; j++) {
          const dir = Math.floor(((Math.sin(seed + j * 10) * 10000) % 1) * 4);
          const len = 40 + ((Math.sin(seed + j * 20) * 10000) % 1) * 80;
          if (dir === 0) x += len;
          else if (dir === 1) x -= len;
          else if (dir === 2) y += len;
          else y -= len;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      break;
      
    case 'nebula':
      // Soft cosmic clouds
      for (let i = 0; i < 5; i++) {
        const seed = i * 237.5 + dna.seed;
        const x = ((Math.sin(seed) * 10000) % 1) * arenaWidth;
        const y = ((Math.sin(seed + 1) * 10000) % 1) * arenaHeight;
        const r = 100 + ((Math.sin(seed + 2) * 10000) % 1) * 200;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        const hue = dna.primaryHue + i * 30;
        gradient.addColorStop(0, `hsla(${hue}, ${dna.saturation}%, 40%, 0.08)`);
        gradient.addColorStop(0.5, `hsla(${hue}, ${dna.saturation}%, 30%, 0.04)`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, arenaWidth, arenaHeight);
      }
      break;
      
    default:
      // Default: subtle floating particles
      for (let i = 0; i < 30; i++) {
        const seed = i * 97.7 + dna.seed;
        const x = ((Math.sin(seed + time * 0.1) * 10000) % 1) * arenaWidth;
        const y = ((Math.sin(seed + 1 + time * 0.05) * 10000) % 1) * arenaHeight;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${dna.accentHue}, ${dna.saturation}%, 60%, 0.1)`;
        ctx.fill();
      }
  }
  
  // Starfield overlay (if enabled)
  if (dna.hasStarfield) {
    for (let i = 0; i < 50; i++) {
      const seed = i * 47.3 + dna.seed;
      const x = ((Math.sin(seed) * 10000) % 1) * arenaWidth;
      const y = ((Math.sin(seed + 1) * 10000) % 1) * arenaHeight;
      const size = 1 + ((Math.sin(seed + 2) * 10000) % 1) * 2;
      const twinkle = 0.3 + Math.sin(time * 3 + seed) * 0.3;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.3})`;
      ctx.fill();
    }
  }
  
  // Vignette (if has vignette)
  if (dna.vignetteStrength > 0.1) {
    const vignetteGradient = ctx.createRadialGradient(
      arenaWidth / 2, arenaHeight / 2, arenaHeight * 0.3,
      arenaWidth / 2, arenaHeight / 2, arenaHeight * 0.9
    );
    vignetteGradient.addColorStop(0, 'transparent');
    vignetteGradient.addColorStop(1, `hsla(${dna.primaryHue}, ${dna.saturation}%, 10%, ${dna.vignetteStrength})`);
    ctx.fillStyle = vignetteGradient;
    ctx.fillRect(0, 0, arenaWidth, arenaHeight);
  }
  
  ctx.restore();
}

// Render anomaly hyperspace speed lines with procedural colors
function renderAnomalyHyperspaceSpeedLines(ctx: CanvasRenderingContext2D, state: VectorState, dna: HyperspaceAnomalyDNA): void {
  const { arenaWidth, arenaHeight } = VM_CONFIG;
  const scrollOffset = state.hyperspaceScrollOffset * dna.lineSpeed;
  const transitionProgress = state.hyperspaceTransitionProgress;
  const hsColors = getHyperspaceColors(dna);
  
  ctx.save();
  
  // Star streaks
  const lineCount = dna.lineCount;
  for (let i = 0; i < lineCount; i++) {
    const seed = i * 137.5;
    const x = ((seed * 7.3) % arenaWidth);
    const baseY = ((seed * 11.7 + scrollOffset * (1 + (i % 3) * 0.5)) % (arenaHeight + 200)) - 100;
    const lineLength = (20 + (i % 5) * 15 + transitionProgress * 60) * dna.lineLength;
    
    // Rainbow effect if enabled
    let hue = dna.primaryHue;
    if (dna.hasRainbow) {
      hue = (dna.primaryHue + i * 5 + state.gameTime * 0.5) % 360;
    }
    
    // Pulse effect if enabled
    let alpha = 0.3 + transitionProgress * 0.4;
    if (dna.hasPulse) {
      alpha *= 0.7 + Math.sin(state.gameTime * 0.1 + i * 0.3) * 0.3;
    }
    
    const lightness = 60 + (i % 30);
    
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(x, baseY + lineLength);
    ctx.strokeStyle = `hsla(${hue}, ${dna.saturation}%, ${lightness}%, ${alpha})`;
    ctx.lineWidth = 1 + (i % 3);
    ctx.stroke();
  }
  
  // Brighter close stars
  for (let i = 0; i < 25; i++) {
    const seed = i * 97.3;
    let x = ((seed * 13.7) % arenaWidth);
    const baseY = ((seed * 17.3 + scrollOffset * 2 * dna.lineSpeed) % (arenaHeight + 300)) - 150;
    const lineLength = (80 + (i % 4) * 40 + transitionProgress * 100) * dna.lineLength;
    
    // Wave distortion if enabled
    if (dna.hasWave) {
      x += Math.sin(baseY * 0.02 + state.gameTime * 0.05) * 20;
    }
    
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(x, baseY + lineLength);
    
    const gradient = ctx.createLinearGradient(x, baseY, x, baseY + lineLength);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(0.3, `${hsColors.primary.slice(0, -1)}, ${0.5 + transitionProgress * 0.3})`);
    gradient.addColorStop(1, `${hsColors.secondary.slice(0, -1)}, 0)`);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2 + (i % 2);
    ctx.stroke();
  }
  
  // Effect-specific additions
  switch (dna.effect) {
    case 'wormhole':
      // Tunnel rings
      for (let i = 0; i < 5; i++) {
        const ringY = ((state.gameTime * 5 + i * 300) % (arenaHeight + 200)) - 100;
        const ringSize = 200 + Math.sin(state.gameTime * 0.05 + i) * 50;
        ctx.beginPath();
        ctx.ellipse(arenaWidth / 2, ringY, ringSize, 30, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${dna.primaryHue}, ${dna.saturation}%, 60%, ${0.1 * dna.effectIntensity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      break;
      
    case 'dataflow':
      // Binary-like data streams
      for (let i = 0; i < 10; i++) {
        const x = (i / 10) * arenaWidth + 20;
        for (let j = 0; j < 8; j++) {
          const y = ((state.gameTime * 3 + j * 80 + i * 50) % arenaHeight);
          const char = Math.sin(i * 17 + j * 31) > 0 ? '1' : '0';
          ctx.fillStyle = `hsla(${dna.primaryHue}, ${dna.saturation}%, 60%, ${0.15 * dna.effectIntensity})`;
          ctx.font = '12px monospace';
          ctx.fillText(char, x, y);
        }
      }
      break;
      
    case 'aurora':
      // Northern lights waves
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, arenaHeight * 0.3 + i * 100);
        for (let x = 0; x <= arenaWidth; x += 20) {
          const y = arenaHeight * 0.3 + i * 100 + 
                    Math.sin(x * 0.01 + state.gameTime * 0.02 + i) * 80 +
                    Math.sin(x * 0.005 + state.gameTime * 0.01) * 40;
          ctx.lineTo(x, y);
        }
        const gradient = ctx.createLinearGradient(0, 0, arenaWidth, 0);
        const h1 = (dna.primaryHue + i * 40) % 360;
        const h2 = (dna.secondaryHue + i * 40) % 360;
        gradient.addColorStop(0, `hsla(${h1}, ${dna.saturation}%, 50%, 0)`);
        gradient.addColorStop(0.5, `hsla(${h1}, ${dna.saturation}%, 60%, ${0.15 * dna.effectIntensity})`);
        gradient.addColorStop(1, `hsla(${h2}, ${dna.saturation}%, 50%, 0)`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.stroke();
      }
      break;
  }
  
  // Vignette
  const vignetteGradient = ctx.createRadialGradient(
    arenaWidth / 2, arenaHeight / 2, arenaHeight * 0.3,
    arenaWidth / 2, arenaHeight / 2, arenaHeight * 0.8
  );
  vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignetteGradient.addColorStop(1, `hsla(${dna.primaryHue}, ${dna.saturation * 0.5}%, 20%, ${0.3 * transitionProgress})`);
  ctx.fillStyle = vignetteGradient;
  ctx.fillRect(0, 0, arenaWidth, arenaHeight);
  
  ctx.restore();
}

// Render hyperspace speed lines effect
function renderHyperspaceSpeedLines(ctx: CanvasRenderingContext2D, state: VectorState): void {
  const { arenaWidth, arenaHeight } = VM_CONFIG;
  const scrollOffset = state.hyperspaceScrollOffset;
  const transitionProgress = state.hyperspaceTransitionProgress;
  
  ctx.save();
  
  // Star streaks that move downward
  const lineCount = 80;
  for (let i = 0; i < lineCount; i++) {
    // Use deterministic "random" based on index
    const seed = i * 137.5;
    const x = ((seed * 7.3) % arenaWidth);
    const baseY = ((seed * 11.7 + scrollOffset * (1 + (i % 3) * 0.5)) % (arenaHeight + 200)) - 100;
    
    // Line length varies based on transition progress and "speed"
    const lineLength = 20 + (i % 5) * 15 + transitionProgress * 60;
    
    // Color varies - mostly cyan/white with some variation
    const hue = 180 + (i % 40);
    const lightness = 70 + (i % 30);
    const alpha = 0.3 + transitionProgress * 0.4;
    
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(x, baseY + lineLength);
    ctx.strokeStyle = `hsla(${hue}, 100%, ${lightness}%, ${alpha})`;
    ctx.lineWidth = 1 + (i % 3);
    ctx.stroke();
  }
  
  // Add some brighter "close" stars
  for (let i = 0; i < 20; i++) {
    const seed = i * 97.3;
    const x = ((seed * 13.7) % arenaWidth);
    const baseY = ((seed * 17.3 + scrollOffset * 2) % (arenaHeight + 300)) - 150;
    const lineLength = 80 + (i % 4) * 40 + transitionProgress * 100;
    
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(x, baseY + lineLength);
    
    const gradient = ctx.createLinearGradient(x, baseY, x, baseY + lineLength);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(0.3, `rgba(0, 255, 255, ${0.5 + transitionProgress * 0.3})`);
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2 + (i % 2);
    ctx.stroke();
  }
  
  // Vignette effect for hyperspace
  const vignetteGradient = ctx.createRadialGradient(
    arenaWidth / 2, arenaHeight / 2, arenaHeight * 0.3,
    arenaWidth / 2, arenaHeight / 2, arenaHeight * 0.8
  );
  vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignetteGradient.addColorStop(1, `rgba(0, 50, 100, ${0.3 * transitionProgress})`);
  ctx.fillStyle = vignetteGradient;
  ctx.fillRect(0, 0, arenaWidth, arenaHeight);
  
  ctx.restore();
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
      case 'shield': icon = 'S'; break;
      case 'nuke': icon = 'N'; break;
      case 'doublePoints': icon = '×2'; break;
      case 'doubleShot': icon = 'D'; break;
      case 'speedBoost': icon = '>'; break;
      // Hyperspace power-ups
      case 'warpShield': icon = 'W'; break;
      case 'formationBreaker': icon = 'F'; break;
      case 'timeWarp': icon = 'T'; break;
      case 'magnetPulse': icon = 'M'; break;
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
      // Player bullets - use ship-specific styling
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
      
      // Draw projectile based on shape
      drawPlayerProjectile(ctx, proj.x, proj.y, size, style, proj.vx, proj.vy, state.gameTime);
      
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
        // Triangle drone - rotate to face player (tip pointing toward player)
        const angleToPlayer = Math.atan2(state.playerY - enemy.y, state.playerX - enemy.x);
        ctx.rotate(angleToPlayer);
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
        
      case 'dasher':
        // Fast arrow shape pointing toward movement direction
        ctx.rotate(Math.atan2(enemy.vy, enemy.vx));
        ctx.beginPath();
        ctx.moveTo(enemy.size * 1.2, 0);
        ctx.lineTo(-enemy.size * 0.4, enemy.size * 0.5);
        ctx.lineTo(-enemy.size * 0.2, 0);
        ctx.lineTo(-enemy.size * 0.4, -enemy.size * 0.5);
        ctx.closePath();
        ctx.stroke();
        
        // Speed trail effect
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(-enemy.size * 0.2, 0);
        ctx.lineTo(-enemy.size * 1.2, 0);
        ctx.stroke();
        ctx.globalAlpha = 1;
        break;
        
      case 'splitter':
        // Blob-like shape that looks like it could split
        const pulse = 1 + Math.sin(state.gameTime * 0.1) * 0.1;
        ctx.beginPath();
        ctx.ellipse(0, 0, enemy.size * pulse, enemy.size * 0.7 * pulse, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner split line
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(0, -enemy.size * 0.5);
        ctx.lineTo(0, enemy.size * 0.5);
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // Two "eyes" suggesting the split
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(-enemy.size * 0.3, 0, 2, 0, Math.PI * 2);
        ctx.arc(enemy.size * 0.3, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'orbiter':
        // Circular with orbit ring
        ctx.beginPath();
        ctx.arc(0, 0, enemy.size * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        
        // Orbiting ring
        ctx.save();
        ctx.rotate(state.gameTime * 0.05);
        ctx.beginPath();
        ctx.ellipse(0, 0, enemy.size, enemy.size * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        
        // Core dot
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'sniper':
        // Crosshair-like design with scope
        ctx.beginPath();
        ctx.arc(0, 0, enemy.size * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        
        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(-enemy.size, 0);
        ctx.lineTo(enemy.size, 0);
        ctx.moveTo(0, -enemy.size);
        ctx.lineTo(0, enemy.size);
        ctx.stroke();
        
        // Aiming indicator - glows when aiming
        const isAiming = enemy.behaviorTimer > 0;
        if (isAiming) {
          const aimProgress = Math.min(1, enemy.behaviorTimer / 60);
          ctx.globalAlpha = 0.3 + aimProgress * 0.7;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(0, 0, enemy.size * 0.4 * aimProgress, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          
          // Draw aim line toward player
          if (aimProgress > 0.5) {
            ctx.save();
            ctx.rotate(enemy.targetAngle);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = (aimProgress - 0.5) * 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(enemy.size, 0);
            ctx.lineTo(enemy.size * 4, 0);
            ctx.stroke();
            ctx.restore();
          }
        }
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
      
      case 'miniboss': {
        // Mini-boss - octagon with glowing core
        const minibossColorIndex = enemy.behaviorTimer % 10;
        const minibossColor = VM_CONFIG.bossColors[minibossColorIndex];
        const pulse = Math.sin(state.gameTime * 0.1) * 0.2 + 0.8;
        
        // Outer glow
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.shadowColor = minibossColor;
        ctx.shadowBlur = 25;
        ctx.fillStyle = minibossColor;
        ctx.beginPath();
        ctx.arc(0, 0, enemy.size * 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Rotating octagon shell
        ctx.save();
        ctx.rotate(state.gameTime * 0.03);
        ctx.strokeStyle = minibossColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = minibossColor;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const r = enemy.size * pulse;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
        
        // Inner counter-rotating pentagon
        ctx.save();
        ctx.rotate(-state.gameTime * 0.05);
        ctx.strokeStyle = minibossColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2;
          const r = enemy.size * 0.55;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
        
        // Core
        const corePulse = 6 + Math.sin(state.gameTime * 0.15) * 2;
        ctx.fillStyle = minibossColor;
        ctx.beginPath();
        ctx.arc(0, 0, corePulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Orbiting particles
        for (let i = 0; i < 4; i++) {
          const orbitAngle = (i / 4) * Math.PI * 2 + state.gameTime * 0.06;
          const orbitDist = enemy.size * 0.75;
          const px = Math.cos(orbitAngle) * orbitDist;
          const py = Math.sin(orbitAngle) * orbitDist;
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        break;
      }
      
      case 'anomaly': {
        // PROCEDURALLY GENERATED ENEMY - unique appearance based on DNA
        const dna = decodeDNA(enemy.behaviorTimer, state.currentMap);
        const anomalyColor = getAnomalyColor(dna);
        const glowColor = getAnomalyGlowColor(dna);
        
        ctx.strokeStyle = anomalyColor;
        ctx.fillStyle = anomalyColor;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = dna.hasAura ? 20 : 10;
        
        // Rotation
        const rotation = state.gameTime * dna.spinSpeed * 0.02;
        ctx.rotate(rotation);
        
        // Pulsing effect
        const pulse = dna.hasPulse ? 1 + Math.sin(state.gameTime * 0.15) * 0.15 : 1;
        const drawSize = enemy.size * pulse;
        
        // Draw shape based on DNA
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        switch (dna.shape) {
          case 'triangle':
            for (let i = 0; i < 3; i++) {
              const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
              const x = Math.cos(angle) * drawSize;
              const y = Math.sin(angle) * drawSize;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            break;
            
          case 'square':
            ctx.rect(-drawSize * 0.7, -drawSize * 0.7, drawSize * 1.4, drawSize * 1.4);
            break;
            
          case 'pentagon':
            for (let i = 0; i < 5; i++) {
              const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
              const x = Math.cos(angle) * drawSize;
              const y = Math.sin(angle) * drawSize;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            break;
            
          case 'hexagon':
            for (let i = 0; i < 6; i++) {
              const angle = (i / 6) * Math.PI * 2;
              const x = Math.cos(angle) * drawSize;
              const y = Math.sin(angle) * drawSize;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            break;
            
          case 'star':
            for (let i = 0; i < 5; i++) {
              const outerAngle = (i / 5) * Math.PI * 2 - Math.PI / 2;
              const innerAngle = outerAngle + Math.PI / 5;
              ctx.lineTo(Math.cos(outerAngle) * drawSize, Math.sin(outerAngle) * drawSize);
              ctx.lineTo(Math.cos(innerAngle) * drawSize * 0.4, Math.sin(innerAngle) * drawSize * 0.4);
            }
            ctx.closePath();
            break;
            
          case 'cross':
            const crossWidth = drawSize * 0.3;
            ctx.moveTo(-crossWidth, -drawSize);
            ctx.lineTo(crossWidth, -drawSize);
            ctx.lineTo(crossWidth, -crossWidth);
            ctx.lineTo(drawSize, -crossWidth);
            ctx.lineTo(drawSize, crossWidth);
            ctx.lineTo(crossWidth, crossWidth);
            ctx.lineTo(crossWidth, drawSize);
            ctx.lineTo(-crossWidth, drawSize);
            ctx.lineTo(-crossWidth, crossWidth);
            ctx.lineTo(-drawSize, crossWidth);
            ctx.lineTo(-drawSize, -crossWidth);
            ctx.lineTo(-crossWidth, -crossWidth);
            ctx.closePath();
            break;
            
          case 'crescent':
            ctx.arc(0, 0, drawSize, 0, Math.PI * 2);
            ctx.moveTo(drawSize * 0.6, 0);
            ctx.arc(drawSize * 0.3, 0, drawSize * 0.6, 0, Math.PI * 2, true);
            break;
            
          case 'spiral':
            for (let a = 0; a < Math.PI * 4; a += 0.2) {
              const r = (a / (Math.PI * 4)) * drawSize;
              const x = Math.cos(a) * r;
              const y = Math.sin(a) * r;
              if (a === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            break;
        }
        
        ctx.stroke();
        
        // Inner core
        ctx.beginPath();
        ctx.arc(0, 0, drawSize * 0.25, 0, Math.PI * 2);
        ctx.fill();
        
        // Trail effect
        if (dna.hasTrail) {
          ctx.globalAlpha = 0.4;
          const trailAngle = Math.atan2(enemy.vy, enemy.vx) + Math.PI;
          for (let i = 1; i <= 3; i++) {
            const trailDist = i * 8;
            const trailSize = drawSize * (1 - i * 0.2);
            ctx.beginPath();
            ctx.arc(
              Math.cos(trailAngle) * trailDist,
              Math.sin(trailAngle) * trailDist,
              trailSize * 0.3,
              0, Math.PI * 2
            );
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
        
        // Ability indicator
        if (dna.ability === 'shield') {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.5 + Math.sin(state.gameTime * 0.1) * 0.3;
          ctx.beginPath();
          ctx.arc(0, 0, drawSize * 1.3, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        } else if (dna.ability === 'phaser') {
          // Phasing indicator - flickering
          if (Math.floor(state.gameTime / 20) % 2 === 0) {
            ctx.globalAlpha = 0.3;
          }
        }
        
        // "?" symbol to indicate unknown enemy
        ctx.rotate(-rotation); // Unrotate for text
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(10, drawSize * 0.6)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.8;
        ctx.fillText('?', 0, 0);
        ctx.globalAlpha = 1;
        
        break;
      }
    }
    
    ctx.restore();
    
    // Health bar (for elites, bounty, miniboss, boss, splitter, sniper, and anomaly)
    if ((enemy.type === 'elite' || enemy.type === 'bounty' || enemy.type === 'boss' || enemy.type === 'miniboss' || enemy.type === 'splitter' || enemy.type === 'sniper' || enemy.type === 'anomaly') && healthPercent < 1) {
      const barWidth = enemy.type === 'boss' ? enemy.size * 3 : 
                       enemy.type === 'miniboss' ? enemy.size * 2.5 : enemy.size * 2;
      const barHeight = enemy.type === 'boss' ? 6 : 
                        enemy.type === 'miniboss' ? 5 : 3;
      const barX = enemy.x - barWidth / 2;
      const barY = enemy.y - enemy.size - 12;
      
      // Get proper color for miniboss and anomaly
      let barColor = color;
      if (enemy.type === 'miniboss') {
        barColor = VM_CONFIG.bossColors[enemy.behaviorTimer % 10];
      } else if (enemy.type === 'anomaly') {
        const anomalyDna = decodeDNA(enemy.behaviorTimer, state.currentMap);
        barColor = getAnomalyColor(anomalyDna);
      }
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      ctx.fillStyle = barColor;
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
      
      // Mini-boss label
      if (enemy.type === 'miniboss') {
        ctx.fillStyle = barColor;
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = barColor;
        ctx.shadowBlur = 8;
        ctx.fillText('MINI-BOSS', enemy.x, barY - 6);
        ctx.shadowBlur = 0;
      }
      
      // Anomaly label with generated name
      if (enemy.type === 'anomaly') {
        const anomalyDna = decodeDNA(enemy.behaviorTimer, state.currentMap);
        const anomalyName = getAnomalyName(anomalyDna);
        
        ctx.fillStyle = getAnomalyColor(anomalyDna);
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = getAnomalyGlowColor(anomalyDna);
        ctx.shadowBlur = 8;
        ctx.fillText(anomalyName.toUpperCase(), enemy.x, barY - 5);
        ctx.shadowBlur = 0;
      }
    }
  }
}

// Omega Prime is 35% larger than other ships (legendary premium)
const OMEGA_PRIME_SCALE = 1.35;

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
  
  // Apply 35% scale boost for Omega Prime (legendary ship)
  if (megaShipId === 'omega_prime') {
    ctx.scale(OMEGA_PRIME_SCALE, OMEGA_PRIME_SCALE);
  }
  
  // Use 'game' quality mode for optimized performance during gameplay
  drawMegaShip(ctx, 0, 0, megaShipId, state.gameTime * 0.003, skinColors, upgradeState, 'game');

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
  
  // Get high score from localStorage
  const highScore = parseInt(localStorage.getItem('cyberRescueHighScore') || '0');
  
  // Top bar background - taller to accommodate larger text and health bar
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, arenaWidth, 85);
  
  ctx.textBaseline = 'middle';
  
  // Left side: Score + Hi-Score (doubled font sizes)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#00ffff';
  ctx.font = 'bold 26px monospace';
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 10;
  ctx.fillText(`SCORE: ${Math.floor(state.score).toString().padStart(8, '0')}`, 10, 22);
  ctx.shadowBlur = 0;
  
  ctx.fillStyle = '#888888';
  ctx.font = 'bold 20px monospace';
  ctx.fillText(`HI: ${highScore.toString().padStart(8, '0')}`, 10, 50);
  
  // Center: Map & Level (doubled font sizes)
  ctx.textAlign = 'center';
  ctx.fillStyle = theme.accentColor;
  ctx.font = 'bold 24px monospace';
  ctx.shadowColor = theme.accentColor;
  ctx.shadowBlur = 12;
  ctx.fillText(`MAP ${state.currentMap}/${VM_CONFIG.totalMaps}`, arenaWidth / 2, 22);
  ctx.shadowBlur = 0;
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px monospace';
  ctx.fillText(`LEVEL ${state.currentLevel}`, arenaWidth / 2, 50);
  
  // Right side: Scraps (doubled font size)
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffcc00';
  ctx.font = 'bold 26px monospace';
  ctx.shadowColor = '#ffcc00';
  ctx.shadowBlur = 10;
  ctx.fillText(`⚙ ${state.salvageCount}`, arenaWidth - 10, 36);
  ctx.shadowBlur = 0;
  
  // Health bar with HULL label (top, below main HUD text)
  const healthBarWidth = 140;
  const healthBarHeight = 14;
  const healthLabelWidth = 50;
  const healthBarX = 10 + healthLabelWidth + 6;
  const healthBarY = 68;
  
  // HULL label
  ctx.fillStyle = '#00ff00';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'left';
  ctx.shadowColor = '#00ff00';
  ctx.shadowBlur = 6;
  ctx.fillText('HULL', 10, healthBarY + 10);
  ctx.shadowBlur = 0;
  
  // Health bar background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
  
  const healthPercent = state.health / state.maxHealth;
  const healthColor = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffaa00' : '#ff0000';
  ctx.fillStyle = healthColor;
  ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercent, healthBarHeight);
  
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
  
  // Shields indicator (next to health bar)
  if (state.shields > 0) {
    ctx.fillStyle = '#00aaff';
    for (let i = 0; i < state.shields; i++) {
      ctx.beginPath();
      ctx.arc(healthBarX + healthBarWidth + 20 + i * 20, healthBarY + 7, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Combo indicator (top right, below scraps)
  if (state.combo > 1) {
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'right';
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 8;
    ctx.fillText(`${state.combo}x COMBO`, arenaWidth - 10, 68);
    ctx.shadowBlur = 0;
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
    
    // "MAP X" label (doubled)
    ctx.fillStyle = theme.accentColor;
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`— MAP ${state.currentMap} —`, arenaWidth / 2, centerY - 10);
    
    // Map name (large, doubled)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px monospace';
    ctx.shadowBlur = 25;
    ctx.fillText(theme.name.toUpperCase(), arenaWidth / 2, centerY + 40);
    
    // Level indicator (doubled)
    ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = 'bold 28px monospace';
    ctx.fillText(`LEVEL ${state.currentLevel} • ${state.wavesInMap} WAVE${state.wavesInMap > 1 ? 'S' : ''}`, arenaWidth / 2, centerY + 90);
    
    ctx.restore();
  }
  
  // Active power-ups indicator (below top bar)
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
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'right';
    
    activePowerUps.forEach((powerUp, index) => {
      const y = 110 + index * 30;
      const barWidth = 90;
      const barHeight = 18;
      const barX = arenaWidth - 15 - barWidth;
      
      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX, y - 8, barWidth, barHeight);
      
      // Progress bar
      const progress = powerUp.remaining / VM_CONFIG.powerUpDuration;
      ctx.fillStyle = powerUp.color;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(barX, y - 8, barWidth * progress, barHeight);
      ctx.globalAlpha = 1;
      
      // Text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(powerUp.name, arenaWidth - 20 - barWidth, y + 2);
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
  
  // Corner triangles removed for cleaner look
  
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
  
  // Data streams removed for cleaner look
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

// Draw player projectile with ship-specific shape
function drawPlayerProjectile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  style: ReturnType<typeof getShipProjectileStyle>,
  vx: number,
  vy: number,
  gameTime: number
): void {
  const angle = Math.atan2(vy, vx);
  
  ctx.fillStyle = style.color;
  
  switch (style.shape) {
    case 'circle': {
      // Simple circle
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      // Core
      ctx.fillStyle = style.coreColor;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    
    case 'laser': {
      // Thin laser beam
      ctx.strokeStyle = style.color;
      ctx.lineWidth = size * 0.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x - Math.cos(angle) * size * 2, y - Math.sin(angle) * size * 2);
      ctx.lineTo(x + Math.cos(angle) * size * 2, y + Math.sin(angle) * size * 2);
      ctx.stroke();
      // Core
      ctx.strokeStyle = style.coreColor;
      ctx.lineWidth = size * 0.2;
      ctx.stroke();
      break;
    }
    
    case 'diamond': {
      // Spinning diamond
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
      // 4-pointed star
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
      // Forward-pointing triangle
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
      // Pulsing plasma orb
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
      // Long thin needle
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
      // Crescent moon shape
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
      // Hollow ring
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
      // Lightning bolt shape
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
      // Fallback circle
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
}

// Hyperspace overlay - shows "HYPERSPACE" text and timer
function renderHyperspaceOverlay(ctx: CanvasRenderingContext2D, state: VectorState): void {
  const { arenaWidth, arenaHeight } = VM_CONFIG;
  
  ctx.save();
  
  // Show dramatic "ENTERING HYPERSPACE" during enter phase (similar to boss warning)
  if (state.phase === 'hyperspaceEnter') {
    const alpha = Math.min(state.hyperspaceTransitionProgress * 1.5, 1);
    
    // Flashing cyan vignette effect
    const flashIntensity = Math.sin(state.gameTime * 0.4) * 0.5 + 0.5;
    const vignetteAlpha = 0.1 + flashIntensity * 0.15;
    
    // Cyan vignette
    const gradient = ctx.createRadialGradient(
      arenaWidth / 2, arenaHeight / 2, arenaHeight * 0.3,
      arenaWidth / 2, arenaHeight / 2, arenaHeight * 0.8
    );
    gradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
    gradient.addColorStop(1, `rgba(0, 255, 255, ${vignetteAlpha * alpha})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, arenaWidth, arenaHeight);
    
    // Flashing warning bars at top and bottom (cyan/white)
    const barHeight = 8;
    const barFlash = Math.floor(state.gameTime / 8) % 2 === 0;
    ctx.globalAlpha = alpha;
    if (barFlash) {
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(0, 50, arenaWidth, barHeight);
      ctx.fillRect(0, arenaHeight - 50 - barHeight, arenaWidth, barHeight);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 50, arenaWidth, barHeight);
      ctx.fillRect(0, arenaHeight - 50 - barHeight, arenaWidth, barHeight);
    }
    
    // Text content
    const textFlash = Math.floor(state.gameTime / 6) % 2 === 0;
    const textY = arenaHeight / 2 - 60;
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = alpha;
    
    if (textFlash) {
      // "ENTERING" text
      ctx.fillStyle = '#00ffff';
      ctx.font = 'bold 36px monospace';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 20;
      ctx.fillText('▶ ENTERING ▶', arenaWidth / 2, textY);
      
      // "HYPERSPACE" main text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 52px monospace';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 25;
      ctx.fillText('HYPERSPACE', arenaWidth / 2, textY + 55);
      
      // "HOLD ON" subtext
      ctx.fillStyle = '#00ff88';
      ctx.font = 'bold 24px monospace';
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 12;
      ctx.fillText('HOLD ON', arenaWidth / 2, textY + 95);
    } else {
      // Dimmer version for flash effect
      ctx.fillStyle = '#008888';
      ctx.font = 'bold 36px monospace';
      ctx.shadowColor = '#008888';
      ctx.shadowBlur = 10;
      ctx.fillText('▶ ENTERING ▶', arenaWidth / 2, textY);
      
      // Dimmer "HYPERSPACE"
      ctx.fillStyle = '#aaaaaa';
      ctx.font = 'bold 52px monospace';
      ctx.shadowColor = '#008888';
      ctx.shadowBlur = 15;
      ctx.fillText('HYPERSPACE', arenaWidth / 2, textY + 55);
      
      // Dimmer subtext
      ctx.fillStyle = '#006644';
      ctx.font = 'bold 24px monospace';
      ctx.shadowColor = '#006644';
      ctx.shadowBlur = 6;
      ctx.fillText('HOLD ON', arenaWidth / 2, textY + 95);
    }
  }
  
  // Show timer during hyperspace
  if (state.phase === 'hyperspace') {
    // Get hyperspace variant for visual variety
    const variantIndex = (state.currentMap - 1) % VM_CONFIG.hyperspaceVariants.length;
    const variant = VM_CONFIG.hyperspaceVariants[variantIndex];
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const secondsLeft = Math.ceil(state.hyperspaceTimer / 60);
    ctx.fillStyle = variant.color;
    ctx.font = 'bold 24px monospace';
    ctx.shadowColor = variant.color;
    ctx.shadowBlur = 10;
    ctx.globalAlpha = 0.7;
    ctx.fillText(`${secondsLeft}s`, arenaWidth / 2, 80);
    
    // Show variant name at top during the mode
    ctx.globalAlpha = 0.6;
    ctx.font = 'bold 20px monospace';
    ctx.fillText(variant.name, arenaWidth / 2, 110);
  }
  
  ctx.restore();
}

// Hyperspace exit overlay
function renderHyperspaceExitOverlay(ctx: CanvasRenderingContext2D, state: VectorState): void {
  const { arenaWidth, arenaHeight } = VM_CONFIG;
  
  ctx.save();
  
  const alpha = state.hyperspaceTransitionProgress;
  
  // Fading green vignette
  const gradient = ctx.createRadialGradient(
    arenaWidth / 2, arenaHeight / 2, arenaHeight * 0.3,
    arenaWidth / 2, arenaHeight / 2, arenaHeight * 0.8
  );
  gradient.addColorStop(0, 'rgba(0, 255, 136, 0)');
  gradient.addColorStop(1, `rgba(0, 255, 136, ${0.15 * alpha})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, arenaWidth, arenaHeight);
  
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const textY = arenaHeight / 2 - 30;
  const textFlash = Math.floor(state.gameTime / 10) % 2 === 0;
  
  ctx.globalAlpha = alpha;
  
  if (textFlash) {
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 36px monospace';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 20;
    ctx.fillText('◀ EXITING ◀', arenaWidth / 2, textY);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px monospace';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 15;
    ctx.fillText('HYPERSPACE', arenaWidth / 2, textY + 50);
  } else {
    ctx.fillStyle = '#006644';
    ctx.font = 'bold 36px monospace';
    ctx.shadowColor = '#006644';
    ctx.shadowBlur = 10;
    ctx.fillText('◀ EXITING ◀', arenaWidth / 2, textY);
    
    ctx.fillStyle = '#888888';
    ctx.font = 'bold 42px monospace';
    ctx.shadowColor = '#006644';
    ctx.shadowBlur = 8;
    ctx.fillText('HYPERSPACE', arenaWidth / 2, textY + 50);
  }
  
  ctx.restore();
}
