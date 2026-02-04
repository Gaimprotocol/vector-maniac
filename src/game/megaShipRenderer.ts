// Mega Ship rendering functions - each ship matches the designs from /ships page
import { Player } from './types';
import { getStoredMegaShipId, hasWingLights } from '@/hooks/useMegaShips';
import { getStoredUpgrades, getComputedStats, type UpgradeState, type ComputedShipStats } from '@/hooks/useShipUpgrades';
import { drawShipModel, SHIP_MODELS } from '@/game/shipModels';

// Skin colors interface for color customization
export interface ShipSkinColors {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
}

// =============================================================================
// UPGRADE VISUALS - Dramatic ship modifications that grow with each upgrade
// =============================================================================

// Quality mode for rendering - 'game' = full effects, 'preview' = simplified for performance
export type RenderQuality = 'game' | 'preview';

// Draw BACK layer upgrades (behind ship body)
function drawUpgradeVisualsBack(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  time: number,
  upgradeState?: UpgradeState,
  computedStats?: ComputedShipStats,
  quality: RenderQuality = 'game'
) {
  const upgrades = upgradeState ?? getStoredUpgrades();
  const stats = computedStats ?? getComputedStats(upgrades);
  
  // ===== SHIELD AURA (energy_shields) - Visible protective bubble =====
  // OPTIMIZED: Skip expensive radial gradients and shadowBlur in game mode
  if (stats.bonusShields > 0) {
    ctx.save();
    const pulse = Math.sin(time * 2.5) * 0.3 + 0.7;
    const shieldRadius = 32 + stats.bonusShields * 8;
    
    // In game mode: simple solid ring only (no gradient, no shadow, no hexagons)
    // In preview mode: simplified ring
    ctx.strokeStyle = `rgba(0, 220, 255, ${0.6 * pulse})`;
    ctx.lineWidth = 2 + stats.bonusShields;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, shieldRadius - 2, (shieldRadius - 2) * 0.7, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
  }
  
  // ===== MAGNET FIELD (magnet_range) - Green tractor beam rings =====
  // OPTIMIZED: Single simple ring, no shadow, no particles in game mode
  const magnetLevel = upgrades['magnet_range'] || 0;
  if (magnetLevel > 0) {
    ctx.save();
    const magnetPulse = Math.sin(time * 4) * 0.3 + 0.7;
    
    // Single ring only - no shadow, no particles for performance
    const ringRadius = 20 + Math.sin(time * 3) * 3;
    ctx.strokeStyle = `rgba(0, 255, 150, ${(0.2 + magnetLevel * 0.08) * magnetPulse})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.lineDashOffset = time * 30;
    ctx.beginPath();
    ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.restore();
  }
}

// Draw FRONT layer upgrades (over ship body)
function drawUpgradeVisualsFront(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  time: number,
  upgradeState?: UpgradeState,
  computedStats?: ComputedShipStats,
  quality: RenderQuality = 'game'
) {
  const upgrades = upgradeState ?? getStoredUpgrades();
  const stats = computedStats ?? getComputedStats(upgrades);
  
  // ===== THRUSTERS (thrusters) - Bigger, more powerful engine flames =====
  // OPTIMIZED: Simplified flames, no gradient, no shadow in game mode
  const thrusterLevel = upgrades['thrusters'] || 0;
  if (thrusterLevel > 0) {
    ctx.save();
    
    // Max 2 side thrusters for performance
    const maxThrusters = quality === 'game' ? Math.min(thrusterLevel, 2) : Math.min(thrusterLevel, 4);
    for (let i = 0; i < maxThrusters; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const yOffset = side * 8;
      const xOffset = -16;
      
      // Thruster housing (simple rect)
      ctx.fillStyle = '#445566';
      ctx.fillRect(centerX + xOffset - 2, centerY + yOffset - 3, 6, 6);
      
      // Flame (solid color, no gradient for performance)
      const flameLen = 18 + thrusterLevel * 3;
      ctx.fillStyle = '#00ccff';
      ctx.beginPath();
      ctx.moveTo(centerX + xOffset, centerY + yOffset - 2);
      ctx.lineTo(centerX + xOffset - flameLen, centerY + yOffset);
      ctx.lineTo(centerX + xOffset, centerY + yOffset + 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
  
  // ===== EXTRA CANNONS - Side-mounted weapon pods =====
  // OPTIMIZED: Simple shapes, no gradients, no shadows in game mode
  if (stats.extraCannons > 0) {
    ctx.save();
    
    // Max 2 cannons for performance
    const maxCannons = quality === 'game' ? 2 : Math.min(stats.extraCannons * 2, 4);
    for (let i = 0; i < maxCannons; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const yOffset = side * 12;
      const xOffset = 2;
      
      // Cannon mount/pod (simple rect)
      ctx.fillStyle = '#3a4555';
      ctx.fillRect(centerX + xOffset - 6, centerY + yOffset - 4, 12, 8);
      
      // Cannon barrel (solid color)
      ctx.fillStyle = '#778899';
      ctx.fillRect(centerX + xOffset + 4, centerY + yOffset - 2, 18, 4);
      
      // Muzzle tip
      ctx.fillStyle = '#ff6600';
      ctx.beginPath();
      ctx.arc(centerX + xOffset + 22, centerY + yOffset, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  
  // ===== CANNON POWER - Enhanced main weapon with glow =====
  // OPTIMIZED: Simple barrel extension, no gradients, no shadows
  const cannonPowerLevel = upgrades['cannon_power'] || 0;
  if (cannonPowerLevel > 0) {
    ctx.save();
    
    // Extended cannon barrel (solid color)
    const barrelLen = 8 + cannonPowerLevel * 2;
    ctx.fillStyle = '#889900';
    ctx.fillRect(centerX + 20, centerY - 2, barrelLen, 4);
    
    // Power glow at muzzle (simple circle)
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.arc(centerX + 22 + barrelLen, centerY, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  // ===== RAPID FIRE - Energy coils along weapon =====
  // OPTIMIZED: Simple indicator dots, no animation, no shadows
  const rapidFireLevel = upgrades['rapid_fire'] || 0;
  if (rapidFireLevel > 0) {
    ctx.save();
    
    // Simple yellow indicator dots (max 3)
    ctx.fillStyle = '#ffcc00';
    const maxDots = Math.min(rapidFireLevel, 3);
    for (let i = 0; i < maxDots; i++) {
      const dotX = centerX + 10 + i * 5;
      ctx.beginPath();
      ctx.arc(dotX, centerY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
  
  // ===== PIERCING ROUNDS - Purple energy lines =====
  // OPTIMIZED: Simple line indicator, no shadow, no animation
  const pierceLevel = upgrades['piercing_rounds'] || 0;
  if (pierceLevel > 0) {
    ctx.save();
    
    // Simple purple line indicator
    ctx.strokeStyle = '#aa00ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX + 26, centerY);
    ctx.lineTo(centerX + 36 + pierceLevel * 4, centerY);
    ctx.stroke();
    
    // Pierce tip
    ctx.fillStyle = '#cc66ff';
    ctx.beginPath();
    ctx.arc(centerX + 36 + pierceLevel * 4, centerY, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  // ===== HULL ARMOR - Visible armor plates on ship =====
  // OPTIMIZED: Simple armor indicator, no gradients, no complex shapes
  const hullLevel = upgrades['hull_armor'] || 0;
  if (hullLevel > 0) {
    ctx.save();
    
    // Simple armor plate indicators (solid color)
    ctx.fillStyle = 'rgba(120, 180, 240, 0.5)';
    ctx.strokeStyle = 'rgba(180, 220, 255, 0.6)';
    ctx.lineWidth = 1;
    
    // Top wing armor (simple triangle)
    ctx.beginPath();
    ctx.moveTo(centerX + 2, centerY - 5);
    ctx.lineTo(centerX - 5, centerY - 10);
    ctx.lineTo(centerX - 5, centerY - 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Bottom wing armor (simple triangle)
    ctx.beginPath();
    ctx.moveTo(centerX + 2, centerY + 5);
    ctx.lineTo(centerX - 5, centerY + 10);
    ctx.lineTo(centerX - 5, centerY + 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  }
}

// Draw engine flame (common for all ships) with glow halo
// OPTIMIZED: Simple triangle flame, no gradients, no shadows in game mode
function drawEngineFlame(ctx: CanvasRenderingContext2D, engineX: number, centerY: number, flameColors: { inner: string; mid: string; outer: string }, boostMultiplier: number = 1, quality: RenderQuality = 'game') {
  const exhaustLen = 25 * boostMultiplier;
  const flameWidth = 3 * boostMultiplier;
  
  // Simple solid flame (no gradient, no shadow for max performance)
  ctx.fillStyle = flameColors.mid;
  ctx.beginPath();
  ctx.moveTo(engineX, centerY - flameWidth);
  ctx.lineTo(engineX - exhaustLen, centerY);
  ctx.lineTo(engineX, centerY + flameWidth);
  ctx.closePath();
  ctx.fill();
  
  // Inner core flame (simple white triangle)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.moveTo(engineX, centerY - 1.5);
  ctx.lineTo(engineX - exhaustLen * 0.4, centerY);
  ctx.lineTo(engineX, centerY + 1.5);
  ctx.closePath();
  ctx.fill();
}

// Original ship - FALCON (white/grey classic design)
export function drawFalconShip(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number, skinColors?: ShipSkinColors, upgradeState?: UpgradeState, quality: RenderQuality = 'game') {
  const primary = skinColors?.primary || '#ffffff';
  const secondary = skinColors?.secondary || '#cccccc';
  const accent = skinColors?.accent || '#ffaa00';
  const glow = skinColors?.glow || '#00ddff';
  
  const upgrades = upgradeState ?? getStoredUpgrades();
  const thrusterLevel = upgrades['thrusters'] || 0;
  const boostMultiplier = 1 + thrusterLevel * 0.15;
  
  // Engine flame - gets bigger with thrusters
  drawEngineFlame(ctx, centerX - 12, centerY, { inner: '#ffcc88', mid: '#ff8844', outer: '#ff4400' }, boostMultiplier, quality);
  
  // Main body
  ctx.fillStyle = primary;
  ctx.beginPath();
  ctx.moveTo(centerX + 27, centerY);        // Sharp nose
  ctx.lineTo(centerX + 21, centerY - 3);
  ctx.lineTo(centerX + 9, centerY - 4);
  ctx.lineTo(centerX - 6, centerY - 3);
  ctx.lineTo(centerX - 10, centerY);
  ctx.lineTo(centerX - 6, centerY + 3);
  ctx.lineTo(centerX + 9, centerY + 4);
  ctx.lineTo(centerX + 21, centerY + 3);
  ctx.closePath();
  ctx.fill();
  
  // Wings - get bigger with hull armor
  const hullLevel = upgrades['hull_armor'] || 0;
  const wingScale = 1 + hullLevel * 0.08;
  
  ctx.fillStyle = secondary;
  // Top wing
  ctx.beginPath();
  ctx.moveTo(centerX + 6, centerY - 4);
  ctx.lineTo(centerX - 3, centerY - 12 * wingScale);
  ctx.lineTo(centerX - 9, centerY - 10 * wingScale);
  ctx.lineTo(centerX - 4, centerY - 3);
  ctx.closePath();
  ctx.fill();
  
  // Bottom wing
  ctx.beginPath();
  ctx.moveTo(centerX + 6, centerY + 4);
  ctx.lineTo(centerX - 3, centerY + 12 * wingScale);
  ctx.lineTo(centerX - 9, centerY + 10 * wingScale);
  ctx.lineTo(centerX - 4, centerY + 3);
  ctx.closePath();
  ctx.fill();
  
  // Accent edge glow
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(centerX + 27, centerY);
  ctx.lineTo(centerX + 21, centerY - 3);
  ctx.lineTo(centerX + 9, centerY - 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(centerX + 27, centerY);
  ctx.lineTo(centerX + 21, centerY + 3);
  ctx.lineTo(centerX + 9, centerY + 4);
  ctx.stroke();
  
  // Cockpit (glow color)
  const cockpitGrad = ctx.createRadialGradient(centerX + 18, centerY, 0, centerX + 18, centerY, 4);
  cockpitGrad.addColorStop(0, '#ffffff');
  cockpitGrad.addColorStop(0.3, glow);
  cockpitGrad.addColorStop(0.7, glow);
  cockpitGrad.addColorStop(1, secondary);
  ctx.fillStyle = cockpitGrad;
  ctx.beginPath();
  ctx.ellipse(centerX + 18, centerY, 4, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Engine nozzle - gets bigger with thrusters
  ctx.fillStyle = '#333344';
  ctx.fillRect(centerX - 12, centerY - 3 * boostMultiplier, 3, 6 * boostMultiplier);
}

// BLUE HAWK - blue ship with orange stripes and red wingtip orbs
export function drawBlueHawkShip(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number, skinColors?: ShipSkinColors, upgradeState?: UpgradeState, quality: RenderQuality = 'game') {
  const primary = skinColors?.primary || '#2255cc';
  const secondary = skinColors?.secondary || '#1144aa';
  const accent = skinColors?.accent || '#ff6644';
  const glow = skinColors?.glow || '#dd4444';
  
  const upgrades = upgradeState ?? getStoredUpgrades();
  const thrusterLevel = upgrades['thrusters'] || 0;
  const hullLevel = upgrades['hull_armor'] || 0;
  const boostMultiplier = 1 + thrusterLevel * 0.15;
  const wingScale = 1 + hullLevel * 0.08;
  
  // Engine flame (orange/red)
  drawEngineFlame(ctx, centerX - 12, centerY, { inner: '#ffcc88', mid: '#ff6644', outer: '#cc2200' }, boostMultiplier, quality);
  
  // Main body
  ctx.fillStyle = primary;
  ctx.beginPath();
  ctx.moveTo(centerX + 27, centerY);        // Sharp nose
  ctx.lineTo(centerX + 21, centerY - 4);
  ctx.lineTo(centerX + 6, centerY - 5);
  ctx.lineTo(centerX - 8, centerY - 4);
  ctx.lineTo(centerX - 12, centerY);
  ctx.lineTo(centerX - 8, centerY + 4);
  ctx.lineTo(centerX + 6, centerY + 5);
  ctx.lineTo(centerX + 21, centerY + 4);
  ctx.closePath();
  ctx.fill();
  
  // Wings (darker, swept back)
  ctx.fillStyle = secondary;
  // Top wing
  ctx.beginPath();
  ctx.moveTo(centerX + 8, centerY - 5);
  ctx.lineTo(centerX - 5, centerY - 14 * wingScale);
  ctx.lineTo(centerX - 12, centerY - 11 * wingScale);
  ctx.lineTo(centerX - 6, centerY - 4);
  ctx.closePath();
  ctx.fill();
  
  // Bottom wing
  ctx.beginPath();
  ctx.moveTo(centerX + 8, centerY + 5);
  ctx.lineTo(centerX - 5, centerY + 14 * wingScale);
  ctx.lineTo(centerX - 12, centerY + 11 * wingScale);
  ctx.lineTo(centerX - 6, centerY + 4);
  ctx.closePath();
  ctx.fill();
  
  // Racing stripes on body
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX + 22, centerY - 2);
  ctx.lineTo(centerX + 2, centerY - 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(centerX + 22, centerY + 2);
  ctx.lineTo(centerX + 2, centerY + 2);
  ctx.stroke();
  
  // Cockpit (light blue oval)
  const cockpitGrad = ctx.createRadialGradient(centerX + 18, centerY, 0, centerX + 18, centerY, 5);
  cockpitGrad.addColorStop(0, '#aaddff');
  cockpitGrad.addColorStop(0.5, '#6699cc');
  cockpitGrad.addColorStop(1, '#335588');
  ctx.fillStyle = cockpitGrad;
  ctx.beginPath();
  ctx.ellipse(centerX + 18, centerY, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Glow orbs on wingtips
  ctx.fillStyle = glow;
  ctx.shadowColor = glow;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(centerX - 8, centerY - 12 * wingScale, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(centerX - 8, centerY + 12 * wingScale, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Engine nozzle
  ctx.fillStyle = '#222233';
  ctx.fillRect(centerX - 14, centerY - 3 * boostMultiplier, 4, 6 * boostMultiplier);
}

// ARCTIC WOLF - light blue/white with white wing lights
export function drawArcticWolfShip(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number, skinColors?: ShipSkinColors, upgradeState?: UpgradeState, quality: RenderQuality = 'game') {
  const primary = skinColors?.primary || '#aaddee';
  const secondary = skinColors?.secondary || '#88bbcc';
  const accent = skinColors?.accent || '#ffffff';
  const glow = skinColors?.glow || '#aaddff';
  
  const upgrades = upgradeState ?? getStoredUpgrades();
  const thrusterLevel = upgrades['thrusters'] || 0;
  const hullLevel = upgrades['hull_armor'] || 0;
  const boostMultiplier = 1 + thrusterLevel * 0.15;
  const wingScale = 1 + hullLevel * 0.08;
  
  // Engine flame (blue-white) - simplified in preview
  const exhaustLen = (20 + (quality === 'game' ? Math.random() * 15 : 7.5)) * boostMultiplier;
  const engineX = centerX - 14;
  
  if (quality === 'game') {
    const flameGrad = ctx.createLinearGradient(engineX, centerY, engineX - exhaustLen, centerY);
    flameGrad.addColorStop(0, '#ffffff');
    flameGrad.addColorStop(0.2, '#aaddff');
    flameGrad.addColorStop(0.4, '#66bbff');
    flameGrad.addColorStop(0.7, '#3388cc');
    flameGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = flameGrad;
  } else {
    ctx.fillStyle = '#66bbff';
  }
  ctx.beginPath();
  ctx.moveTo(engineX, centerY - 3 * boostMultiplier);
  ctx.quadraticCurveTo(engineX - exhaustLen * 0.6, centerY - 4 * boostMultiplier, engineX - exhaustLen, centerY);
  ctx.quadraticCurveTo(engineX - exhaustLen * 0.6, centerY + 4 * boostMultiplier, engineX, centerY + 3 * boostMultiplier);
  ctx.closePath();
  ctx.fill();
  
  // Main body (rounded/bomber shape)
  ctx.fillStyle = primary;
  ctx.beginPath();
  ctx.moveTo(centerX + 25, centerY);        // Rounded nose
  ctx.quadraticCurveTo(centerX + 22, centerY - 5, centerX + 12, centerY - 6);
  ctx.lineTo(centerX - 8, centerY - 5);
  ctx.lineTo(centerX - 12, centerY);
  ctx.lineTo(centerX - 8, centerY + 5);
  ctx.lineTo(centerX + 12, centerY + 6);
  ctx.quadraticCurveTo(centerX + 22, centerY + 5, centerX + 25, centerY);
  ctx.closePath();
  ctx.fill();
  
  // Body stripes
  ctx.fillStyle = secondary;
  ctx.fillRect(centerX + 2, centerY - 3, 12, 1.5);
  ctx.fillRect(centerX + 2, centerY + 1.5, 12, 1.5);
  
  // Wings (swept)
  // Top wing
  ctx.fillStyle = secondary;
  ctx.beginPath();
  ctx.moveTo(centerX + 6, centerY - 6);
  ctx.lineTo(centerX - 4, centerY - 16 * wingScale);
  ctx.lineTo(centerX - 12, centerY - 13 * wingScale);
  ctx.lineTo(centerX - 6, centerY - 5);
  ctx.closePath();
  ctx.fill();
  
  // Bottom wing
  ctx.beginPath();
  ctx.moveTo(centerX + 6, centerY + 6);
  ctx.lineTo(centerX - 4, centerY + 16 * wingScale);
  ctx.lineTo(centerX - 12, centerY + 13 * wingScale);
  ctx.lineTo(centerX - 6, centerY + 5);
  ctx.closePath();
  ctx.fill();
  
  // Wing edge highlights
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(centerX + 6, centerY - 6);
  ctx.lineTo(centerX - 4, centerY - 16 * wingScale);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(centerX + 6, centerY + 6);
  ctx.lineTo(centerX - 4, centerY + 16 * wingScale);
  ctx.stroke();
  
  // Cockpit (frosted glass look)
  const cockpitGrad = ctx.createRadialGradient(centerX + 16, centerY, 0, centerX + 16, centerY, 5);
  cockpitGrad.addColorStop(0, '#ffffff');
  cockpitGrad.addColorStop(0.4, '#ddeeff');
  cockpitGrad.addColorStop(1, '#88aacc');
  ctx.fillStyle = cockpitGrad;
  ctx.beginPath();
  ctx.ellipse(centerX + 16, centerY, 5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Wing lights (pulsing white)
  const lightPulse = Math.sin(time * 3) * 0.3 + 0.7;
  ctx.fillStyle = glow;
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 8;
  ctx.globalAlpha = lightPulse;
  ctx.beginPath();
  ctx.arc(centerX - 7, centerY - 14 * wingScale, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(centerX - 7, centerY + 14 * wingScale, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  
  // Engine housing
  ctx.fillStyle = '#556677';
  ctx.fillRect(centerX - 16, centerY - 4 * boostMultiplier, 5, 8 * boostMultiplier);
}

// DELTA PRIME - angular green/yellow ship
export function drawDeltaShip(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number, skinColors?: ShipSkinColors, upgradeState?: UpgradeState, quality: RenderQuality = 'game') {
  const primary = skinColors?.primary || '#228844';
  const secondary = skinColors?.secondary || '#115533';
  const accent = skinColors?.accent || '#aaff44';
  const glow = skinColors?.glow || '#44ff88';
  
  const upgrades = upgradeState ?? getStoredUpgrades();
  const thrusterLevel = upgrades['thrusters'] || 0;
  const hullLevel = upgrades['hull_armor'] || 0;
  const boostMultiplier = 1 + thrusterLevel * 0.15;
  const wingScale = 1 + hullLevel * 0.08;
  
  // Engine flame (green)
  drawEngineFlame(ctx, centerX - 10, centerY, { inner: '#aaffaa', mid: '#44ff44', outer: '#00aa00' }, boostMultiplier, quality);
  
  // Main body (angular delta shape)
  ctx.fillStyle = primary;
  ctx.beginPath();
  ctx.moveTo(centerX + 28, centerY);        // Sharp point
  ctx.lineTo(centerX + 18, centerY - 5);
  ctx.lineTo(centerX + 5, centerY - 6);
  ctx.lineTo(centerX - 10, centerY - 4);
  ctx.lineTo(centerX - 12, centerY);
  ctx.lineTo(centerX - 10, centerY + 4);
  ctx.lineTo(centerX + 5, centerY + 6);
  ctx.lineTo(centerX + 18, centerY + 5);
  ctx.closePath();
  ctx.fill();
  
  // Angular wings (delta shape)
  ctx.fillStyle = secondary;
  // Top wing
  ctx.beginPath();
  ctx.moveTo(centerX + 10, centerY - 6);
  ctx.lineTo(centerX - 2, centerY - 15 * wingScale);
  ctx.lineTo(centerX - 12, centerY - 10 * wingScale);
  ctx.lineTo(centerX - 8, centerY - 4);
  ctx.closePath();
  ctx.fill();
  
  // Bottom wing
  ctx.beginPath();
  ctx.moveTo(centerX + 10, centerY + 6);
  ctx.lineTo(centerX - 2, centerY + 15 * wingScale);
  ctx.lineTo(centerX - 12, centerY + 10 * wingScale);
  ctx.lineTo(centerX - 8, centerY + 4);
  ctx.closePath();
  ctx.fill();
  
  // Tech lines
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(centerX + 24, centerY);
  ctx.lineTo(centerX + 5, centerY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(centerX + 16, centerY - 4);
  ctx.lineTo(centerX - 2, centerY - 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(centerX + 16, centerY + 4);
  ctx.lineTo(centerX - 2, centerY + 4);
  ctx.stroke();
  
  // Cockpit (hexagonal)
  ctx.fillStyle = glow;
  ctx.shadowColor = glow;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(centerX + 20, centerY);
  ctx.lineTo(centerX + 17, centerY - 2.5);
  ctx.lineTo(centerX + 13, centerY - 2.5);
  ctx.lineTo(centerX + 10, centerY);
  ctx.lineTo(centerX + 13, centerY + 2.5);
  ctx.lineTo(centerX + 17, centerY + 2.5);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Wing tip thrusters
  ctx.fillStyle = '#334422';
  ctx.beginPath();
  ctx.arc(centerX - 6, centerY - 12 * wingScale, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(centerX - 6, centerY + 12 * wingScale, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Engine nozzle
  ctx.fillStyle = '#223322';
  ctx.fillRect(centerX - 14, centerY - 3 * boostMultiplier, 5, 6 * boostMultiplier);
}

// CRIMSON HAWK - red/black aggressive design
export function drawCrimsonHawkShip(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number, skinColors?: ShipSkinColors, upgradeState?: UpgradeState, quality: RenderQuality = 'game') {
  const primary = skinColors?.primary || '#aa2222';
  const secondary = skinColors?.secondary || '#661111';
  const accent = skinColors?.accent || '#ff4444';
  const glow = skinColors?.glow || '#ff6666';
  
  const upgrades = upgradeState ?? getStoredUpgrades();
  const thrusterLevel = upgrades['thrusters'] || 0;
  const hullLevel = upgrades['hull_armor'] || 0;
  const boostMultiplier = 1 + thrusterLevel * 0.15;
  const wingScale = 1 + hullLevel * 0.08;
  
  // Engine flame (red/orange)
  drawEngineFlame(ctx, centerX - 12, centerY, { inner: '#ffaa88', mid: '#ff4422', outer: '#aa0000' }, boostMultiplier, quality);
  
  // Main body (aggressive hawk shape)
  ctx.fillStyle = primary;
  ctx.beginPath();
  ctx.moveTo(centerX + 30, centerY);        // Extra sharp nose
  ctx.lineTo(centerX + 22, centerY - 4);
  ctx.lineTo(centerX + 8, centerY - 5);
  ctx.lineTo(centerX - 8, centerY - 4);
  ctx.lineTo(centerX - 12, centerY);
  ctx.lineTo(centerX - 8, centerY + 4);
  ctx.lineTo(centerX + 8, centerY + 5);
  ctx.lineTo(centerX + 22, centerY + 4);
  ctx.closePath();
  ctx.fill();
  
  // Swept back wings
  ctx.fillStyle = secondary;
  // Top wing
  ctx.beginPath();
  ctx.moveTo(centerX + 12, centerY - 5);
  ctx.lineTo(centerX - 3, centerY - 16 * wingScale);
  ctx.lineTo(centerX - 14, centerY - 12 * wingScale);
  ctx.lineTo(centerX - 6, centerY - 4);
  ctx.closePath();
  ctx.fill();
  
  // Bottom wing
  ctx.beginPath();
  ctx.moveTo(centerX + 12, centerY + 5);
  ctx.lineTo(centerX - 3, centerY + 16 * wingScale);
  ctx.lineTo(centerX - 14, centerY + 12 * wingScale);
  ctx.lineTo(centerX - 6, centerY + 4);
  ctx.closePath();
  ctx.fill();
  
  // Red accent stripes
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.moveTo(centerX + 26, centerY);
  ctx.lineTo(centerX + 10, centerY);
  ctx.stroke();
  ctx.shadowBlur = 0;
  
  // Aggressive cockpit
  const cockpitGrad = ctx.createRadialGradient(centerX + 18, centerY, 0, centerX + 18, centerY, 5);
  cockpitGrad.addColorStop(0, '#ff8888');
  cockpitGrad.addColorStop(0.5, '#992222');
  cockpitGrad.addColorStop(1, '#441111');
  ctx.fillStyle = cockpitGrad;
  ctx.beginPath();
  ctx.moveTo(centerX + 22, centerY);
  ctx.lineTo(centerX + 18, centerY - 3);
  ctx.lineTo(centerX + 12, centerY);
  ctx.lineTo(centerX + 18, centerY + 3);
  ctx.closePath();
  ctx.fill();
  
  // Wing tip weapons
  ctx.fillStyle = glow;
  ctx.shadowColor = glow;
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.arc(centerX - 8, centerY - 14 * wingScale, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(centerX - 8, centerY + 14 * wingScale, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Engine nozzle
  ctx.fillStyle = '#331111';
  ctx.fillRect(centerX - 14, centerY - 3 * boostMultiplier, 4, 6 * boostMultiplier);
}

// VALKYRIE PRIME - purple/gold royal design
export function drawValkyrieShip(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number, skinColors?: ShipSkinColors, upgradeState?: UpgradeState, quality: RenderQuality = 'game') {
  const primary = skinColors?.primary || '#6633aa';
  const secondary = skinColors?.secondary || '#442277';
  const accent = skinColors?.accent || '#ffcc44';
  const glow = skinColors?.glow || '#aa88ff';
  
  const upgrades = upgradeState ?? getStoredUpgrades();
  const thrusterLevel = upgrades['thrusters'] || 0;
  const hullLevel = upgrades['hull_armor'] || 0;
  const boostMultiplier = 1 + thrusterLevel * 0.15;
  const wingScale = 1 + hullLevel * 0.08;
  
  // Engine flame (purple/pink)
  drawEngineFlame(ctx, centerX - 12, centerY, { inner: '#ffaaff', mid: '#aa44ff', outer: '#6600aa' }, boostMultiplier, quality);
  
  // Main body (elegant curved shape)
  ctx.fillStyle = primary;
  ctx.beginPath();
  ctx.moveTo(centerX + 26, centerY);
  ctx.quadraticCurveTo(centerX + 22, centerY - 4, centerX + 14, centerY - 5);
  ctx.lineTo(centerX + 4, centerY - 6);
  ctx.lineTo(centerX - 10, centerY - 4);
  ctx.lineTo(centerX - 14, centerY);
  ctx.lineTo(centerX - 10, centerY + 4);
  ctx.lineTo(centerX + 4, centerY + 6);
  ctx.lineTo(centerX + 14, centerY + 5);
  ctx.quadraticCurveTo(centerX + 22, centerY + 4, centerX + 26, centerY);
  ctx.closePath();
  ctx.fill();
  
  // Elegant swept wings
  ctx.fillStyle = secondary;
  // Top wing
  ctx.beginPath();
  ctx.moveTo(centerX + 8, centerY - 6);
  ctx.quadraticCurveTo(centerX, centerY - 12 * wingScale, centerX - 6, centerY - 18 * wingScale);
  ctx.lineTo(centerX - 14, centerY - 14 * wingScale);
  ctx.quadraticCurveTo(centerX - 10, centerY - 8 * wingScale, centerX - 8, centerY - 4);
  ctx.closePath();
  ctx.fill();
  
  // Bottom wing
  ctx.beginPath();
  ctx.moveTo(centerX + 8, centerY + 6);
  ctx.quadraticCurveTo(centerX, centerY + 12 * wingScale, centerX - 6, centerY + 18 * wingScale);
  ctx.lineTo(centerX - 14, centerY + 14 * wingScale);
  ctx.quadraticCurveTo(centerX - 10, centerY + 8 * wingScale, centerX - 8, centerY + 4);
  ctx.closePath();
  ctx.fill();
  
  // Gold trim (no shadow in game mode for performance)
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  if (quality === 'game') {
    // Skip shadow in game mode
  } else {
    ctx.shadowColor = accent;
    ctx.shadowBlur = 6;
  }
  ctx.beginPath();
  ctx.moveTo(centerX + 24, centerY);
  ctx.lineTo(centerX + 14, centerY - 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(centerX + 24, centerY);
  ctx.lineTo(centerX + 14, centerY + 4);
  ctx.stroke();
  ctx.shadowBlur = 0;
  
  // Royal cockpit (solid color in game mode for performance)
  if (quality === 'game') {
    ctx.fillStyle = '#bb66ff';
  } else {
    const cockpitGrad = ctx.createRadialGradient(centerX + 16, centerY, 0, centerX + 16, centerY, 5);
    cockpitGrad.addColorStop(0, '#ffddff');
    cockpitGrad.addColorStop(0.4, '#bb66ff');
    cockpitGrad.addColorStop(1, '#663399');
    ctx.fillStyle = cockpitGrad;
  }
  ctx.beginPath();
  ctx.ellipse(centerX + 16, centerY, 5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Wing orbs (no shadow in game mode for performance)
  ctx.fillStyle = glow;
  if (quality === 'game') {
    // Skip shadow in game mode
  } else {
    ctx.shadowColor = glow;
    ctx.shadowBlur = 8;
  }
  ctx.beginPath();
  ctx.arc(centerX - 10, centerY - 16 * wingScale, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(centerX - 10, centerY + 16 * wingScale, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Engine nozzle
  ctx.fillStyle = '#333344';
  ctx.fillRect(centerX - 16, centerY - 3 * boostMultiplier, 4, 6 * boostMultiplier);
}

// Map MEGA_SHIPS IDs to SHIP_MODELS IDs for rendering with Vector Maniac designs
const MEGA_SHIP_TO_MODEL_MAP: Record<string, string> = {
  'original': 'default',      // GRID CORE -> ZERO POINT
  'blue_hawk': 'bluehawk',    // PHOTON EDGE -> COMPILE TIME
  'arctic_wolf': 'arctic',    // CRYO BLAST -> COLD BOOT
  'delta_prime': 'delta',     // HYPER SYNC -> DELTA MERGE
  'crimson_hawk': 'crimson',  // MULTI VECTOR -> ERROR STATE
  'valkyrie_prime': 'valkyrie', // NULL PHASE -> CHROME CAST
  'omega_prime': 'omega_prime', // Keep as is
  // Arena ships use their own IDs directly
  'hex_phantom': 'hex_phantom',
  'pulse_wraith': 'pulse_wraith',
  'grid_reaper': 'grid_reaper',
  'null_striker': 'null_striker',
};

// Main function to draw the selected mega ship with optional skin colors
export function drawMegaShip(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  megaShipId: string,
  time: number,
  skinColors?: ShipSkinColors,
  upgradeState?: UpgradeState,
  quality: RenderQuality = 'game'
) {
  const upgrades = upgradeState ?? getStoredUpgrades();
  const stats = getComputedStats(upgrades);
  
  // Draw BACK layer upgrade visuals first (shields, magnet field)
  drawUpgradeVisualsBack(ctx, centerX, centerY, time, upgrades, stats, quality);
  
  // Map mega ship ID to ship model ID
  const modelId = MEGA_SHIP_TO_MODEL_MAP[megaShipId] || megaShipId;
  
  // Check if this is a valid ship model
  const validShip = SHIP_MODELS.find(m => m.id === modelId);
  
  if (validShip) {
    // Use Vector Maniac design from shipModels.ts
    ctx.save();
    ctx.translate(centerX, centerY);
    drawShipModel(ctx, modelId, 60, 30, time * 1000, quality);
    ctx.restore();
  } else {
    // Fallback to default ship
    ctx.save();
    ctx.translate(centerX, centerY);
    drawShipModel(ctx, 'default', 60, 30, time * 1000, quality);
    ctx.restore();
  }
  
  // Draw FRONT layer upgrade visuals (cannons, weapons, armor)
  drawUpgradeVisualsFront(ctx, centerX, centerY, time, upgrades, stats, quality);
}
