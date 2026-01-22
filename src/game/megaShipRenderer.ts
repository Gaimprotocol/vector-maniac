// Mega Ship rendering functions - each ship matches the designs from /ships page
import { Player } from './types';
import { getStoredMegaShipId, hasWingLights } from '@/hooks/useMegaShips';
import { getStoredUpgrades, getComputedStats, type UpgradeState, type ComputedShipStats } from '@/hooks/useShipUpgrades';

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

// Draw BACK layer upgrades (behind ship body)
function drawUpgradeVisualsBack(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  time: number,
  upgradeState?: UpgradeState,
  computedStats?: ComputedShipStats
) {
  const upgrades = upgradeState ?? getStoredUpgrades();
  const stats = computedStats ?? getComputedStats(upgrades);
  
  // ===== SHIELD AURA (energy_shields) - Visible protective bubble =====
  if (stats.bonusShields > 0) {
    ctx.save();
    const pulse = Math.sin(time * 2.5) * 0.3 + 0.7;
    const shieldRadius = 32 + stats.bonusShields * 8;
    
    // Outer shield bubble
    const shieldGrad = ctx.createRadialGradient(centerX, centerY, shieldRadius * 0.6, centerX, centerY, shieldRadius);
    shieldGrad.addColorStop(0, 'transparent');
    shieldGrad.addColorStop(0.7, `rgba(0, 200, 255, ${0.15 * pulse})`);
    shieldGrad.addColorStop(0.9, `rgba(0, 150, 255, ${0.3 * pulse})`);
    shieldGrad.addColorStop(1, `rgba(100, 200, 255, ${0.1 * pulse})`);
    ctx.fillStyle = shieldGrad;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, shieldRadius, shieldRadius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Shield ring
    ctx.strokeStyle = `rgba(0, 220, 255, ${0.6 * pulse})`;
    ctx.lineWidth = 2 + stats.bonusShields;
    ctx.shadowColor = '#00ddff';
    ctx.shadowBlur = 15 + stats.bonusShields * 5;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, shieldRadius - 2, (shieldRadius - 2) * 0.7, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Hexagon shield pattern
    ctx.globalAlpha = pulse * 0.4;
    ctx.strokeStyle = '#00aaff';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + time * 0.3;
      const x1 = centerX + Math.cos(angle) * shieldRadius * 0.5;
      const y1 = centerY + Math.sin(angle) * shieldRadius * 0.35;
      const x2 = centerX + Math.cos(angle + Math.PI / 6) * shieldRadius * 0.8;
      const y2 = centerY + Math.sin(angle + Math.PI / 6) * shieldRadius * 0.56;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();
  }
  
  // ===== MAGNET FIELD (magnet_range) - Green tractor beam rings =====
  const magnetLevel = upgrades['magnet_range'] || 0;
  if (magnetLevel > 0) {
    ctx.save();
    const magnetPulse = Math.sin(time * 4) * 0.3 + 0.7;
    const maxRadius = 35 + magnetLevel * 10;
    
    // Pulsing field rings
    for (let i = 0; i < magnetLevel; i++) {
      const ringRadius = 20 + i * 12 + Math.sin(time * 3 + i) * 3;
      ctx.strokeStyle = `rgba(0, 255, 150, ${(0.2 + magnetLevel * 0.08) * magnetPulse * (1 - i * 0.15)})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 8;
      ctx.setLineDash([8, 6]);
      ctx.lineDashOffset = time * 30;
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Magnet particles
    ctx.setLineDash([]);
    ctx.fillStyle = '#00ff88';
    for (let i = 0; i < magnetLevel * 2; i++) {
      const pAngle = time * 2 + (i / (magnetLevel * 2)) * Math.PI * 2;
      const pDist = 25 + Math.sin(time * 4 + i) * 8;
      const px = centerX + Math.cos(pAngle) * pDist;
      const py = centerY + Math.sin(pAngle) * pDist;
      ctx.globalAlpha = magnetPulse * 0.6;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }
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
  computedStats?: ComputedShipStats
) {
  const upgrades = upgradeState ?? getStoredUpgrades();
  const stats = computedStats ?? getComputedStats(upgrades);
  
  // ===== THRUSTERS (thrusters) - Bigger, more powerful engine flames =====
  const thrusterLevel = upgrades['thrusters'] || 0;
  if (thrusterLevel > 0) {
    ctx.save();
    
    // Additional side thrusters
    for (let i = 0; i < Math.min(thrusterLevel, 4); i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const tier = Math.floor(i / 2);
      const yOffset = side * (8 + tier * 5);
      const xOffset = -16 - tier * 3;
      
      // Thruster housing
      ctx.fillStyle = '#445566';
      ctx.beginPath();
      ctx.roundRect(centerX + xOffset - 2, centerY + yOffset - 3, 6, 6, 1);
      ctx.fill();
      ctx.strokeStyle = '#00ccff';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Flame
      const flameLen = 18 + thrusterLevel * 3 + Math.random() * 6;
      const flameGrad = ctx.createLinearGradient(centerX + xOffset, centerY + yOffset, centerX + xOffset - flameLen, centerY + yOffset);
      flameGrad.addColorStop(0, '#ffffff');
      flameGrad.addColorStop(0.15, '#00ffff');
      flameGrad.addColorStop(0.4, '#0088ff');
      flameGrad.addColorStop(0.7, '#0044aa');
      flameGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = flameGrad;
      ctx.shadowColor = '#00aaff';
      ctx.shadowBlur = 10;
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
  if (stats.extraCannons > 0) {
    ctx.save();
    
    for (let i = 0; i < Math.min(stats.extraCannons * 2, 4); i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const tier = Math.floor(i / 2);
      const yOffset = side * (12 + tier * 6);
      const xOffset = 2 - tier * 4;
      
      // Cannon mount/pod
      ctx.fillStyle = '#3a4555';
      ctx.beginPath();
      ctx.roundRect(centerX + xOffset - 6, centerY + yOffset - 4, 12, 8, 2);
      ctx.fill();
      ctx.strokeStyle = '#ff6600';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Cannon barrel
      const barrelGrad = ctx.createLinearGradient(centerX + xOffset + 6, centerY + yOffset, centerX + xOffset + 22, centerY + yOffset);
      barrelGrad.addColorStop(0, '#556677');
      barrelGrad.addColorStop(0.6, '#778899');
      barrelGrad.addColorStop(1, '#ff6600');
      ctx.fillStyle = barrelGrad;
      ctx.beginPath();
      ctx.roundRect(centerX + xOffset + 4, centerY + yOffset - 2.5, 18, 5, 1);
      ctx.fill();
      
      // Muzzle glow
      const muzzlePulse = Math.sin(time * 10 + i * 2) * 0.4 + 0.6;
      ctx.fillStyle = `rgba(255, 120, 0, ${muzzlePulse})`;
      ctx.shadowColor = '#ff6600';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(centerX + xOffset + 22, centerY + yOffset, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  
  // ===== CANNON POWER - Enhanced main weapon with glow =====
  const cannonPowerLevel = upgrades['cannon_power'] || 0;
  if (cannonPowerLevel > 0) {
    ctx.save();
    const powerPulse = Math.sin(time * 3) * 0.3 + 0.7;
    
    // Extended cannon barrel
    const barrelLen = 8 + cannonPowerLevel * 2;
    const barrelGrad = ctx.createLinearGradient(centerX + 22, centerY, centerX + 22 + barrelLen, centerY);
    barrelGrad.addColorStop(0, '#667788');
    barrelGrad.addColorStop(0.5, '#889900');
    barrelGrad.addColorStop(1, '#ff6600');
    ctx.fillStyle = barrelGrad;
    ctx.beginPath();
    ctx.roundRect(centerX + 20, centerY - 2, barrelLen, 4, 1);
    ctx.fill();
    
    // Power glow at muzzle
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 12 + cannonPowerLevel * 3;
    ctx.fillStyle = `rgba(255, 100, 0, ${powerPulse * 0.8})`;
    ctx.beginPath();
    ctx.arc(centerX + 22 + barrelLen, centerY, 3 + cannonPowerLevel * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Energy charging effect
    ctx.strokeStyle = `rgba(255, 150, 0, ${powerPulse * 0.6})`;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < cannonPowerLevel; i++) {
      const ringX = centerX + 22 + i * 3;
      ctx.beginPath();
      ctx.arc(ringX, centerY, 2.5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
  
  // ===== RAPID FIRE - Energy coils along weapon =====
  const rapidFireLevel = upgrades['rapid_fire'] || 0;
  if (rapidFireLevel > 0) {
    ctx.save();
    const coilPulse = Math.sin(time * 8) * 0.4 + 0.6;
    
    // Yellow energy coils spinning around cannon
    ctx.strokeStyle = `rgba(255, 220, 0, ${0.6 * coilPulse})`;
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 8;
    
    for (let i = 0; i < rapidFireLevel; i++) {
      const coilAngle = time * (10 + rapidFireLevel * 2) + i * (Math.PI * 2 / rapidFireLevel);
      const coilX = centerX + 10 + i * 4;
      const coilRadius = 4 + rapidFireLevel * 0.5;
      const coilY = centerY + Math.sin(coilAngle) * coilRadius * 0.6;
      
      ctx.beginPath();
      ctx.arc(coilX, coilY, 2 + rapidFireLevel * 0.3, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Energy arc
    ctx.globalAlpha = coilPulse * 0.5;
    ctx.beginPath();
    ctx.moveTo(centerX + 8, centerY);
    ctx.quadraticCurveTo(centerX + 14, centerY - 4 - rapidFireLevel, centerX + 20, centerY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX + 8, centerY);
    ctx.quadraticCurveTo(centerX + 14, centerY + 4 + rapidFireLevel, centerX + 20, centerY);
    ctx.stroke();
    ctx.restore();
  }
  
  // ===== PIERCING ROUNDS - Purple energy lines =====
  const pierceLevel = upgrades['piercing_rounds'] || 0;
  if (pierceLevel > 0) {
    ctx.save();
    const piercePulse = Math.sin(time * 5) * 0.3 + 0.7;
    
    ctx.strokeStyle = `rgba(180, 0, 255, ${piercePulse * 0.7})`;
    ctx.lineWidth = 2 + pierceLevel;
    ctx.shadowColor = '#aa00ff';
    ctx.shadowBlur = 12;
    
    // Energy spear projecting from nose
    for (let i = 0; i < pierceLevel; i++) {
      const spread = ((i / Math.max(pierceLevel - 1, 1)) - 0.5) * 8;
      ctx.beginPath();
      ctx.moveTo(centerX + 26, centerY);
      ctx.lineTo(centerX + 36 + pierceLevel * 4, centerY + spread);
      ctx.stroke();
    }
    
    // Pierce glow orb
    ctx.fillStyle = `rgba(200, 100, 255, ${piercePulse * 0.6})`;
    ctx.beginPath();
    ctx.arc(centerX + 36 + pierceLevel * 4, centerY, 3 + pierceLevel, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  
  // ===== HULL ARMOR - Visible armor plates on ship =====
  const hullLevel = upgrades['hull_armor'] || 0;
  if (hullLevel > 0) {
    ctx.save();
    const armorPulse = Math.sin(time * 1.5) * 0.1 + 0.9;
    
    // Armor plates on wings
    const plateGrad = ctx.createLinearGradient(centerX - 10, centerY - 15, centerX + 5, centerY);
    plateGrad.addColorStop(0, `rgba(100, 150, 200, ${0.5 * armorPulse})`);
    plateGrad.addColorStop(0.5, `rgba(150, 180, 220, ${0.7 * armorPulse})`);
    plateGrad.addColorStop(1, `rgba(80, 120, 180, ${0.4 * armorPulse})`);
    
    // Top wing armor
    ctx.fillStyle = plateGrad;
    ctx.beginPath();
    ctx.moveTo(centerX + 2, centerY - 5);
    ctx.lineTo(centerX - 3, centerY - 10 - hullLevel);
    ctx.lineTo(centerX - 8, centerY - 9 - hullLevel);
    ctx.lineTo(centerX - 5, centerY - 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `rgba(180, 220, 255, ${0.6 * armorPulse})`;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Bottom wing armor
    ctx.beginPath();
    ctx.moveTo(centerX + 2, centerY + 5);
    ctx.lineTo(centerX - 3, centerY + 10 + hullLevel);
    ctx.lineTo(centerX - 8, centerY + 9 + hullLevel);
    ctx.lineTo(centerX - 5, centerY + 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Body reinforcement stripe
    if (hullLevel >= 3) {
      ctx.fillStyle = `rgba(120, 180, 240, ${0.4 * armorPulse})`;
      ctx.beginPath();
      ctx.roundRect(centerX - 8, centerY - 3, 20, 6, 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(180, 220, 255, ${0.5 * armorPulse})`;
      ctx.stroke();
    }
    
    // Heavy armor shoulder pads at high levels
    if (hullLevel >= 5) {
      ctx.fillStyle = plateGrad;
      ctx.beginPath();
      ctx.ellipse(centerX + 5, centerY - 6, 6, 3, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(centerX + 5, centerY + 6, 6, 3, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
}

// Draw engine flame (common for all ships) with glow halo
function drawEngineFlame(ctx: CanvasRenderingContext2D, engineX: number, centerY: number, flameColors: { inner: string; mid: string; outer: string }, boostMultiplier: number = 1) {
  const exhaustLen = (20 + Math.random() * 15) * boostMultiplier;
  const flameWidth = 3 * boostMultiplier;
  
  // Engine glow halo (radial gradient behind the flame)
  const haloGrad = ctx.createRadialGradient(engineX - 5, centerY, 0, engineX - 5, centerY, exhaustLen * 0.8);
  haloGrad.addColorStop(0, flameColors.inner + 'aa');
  haloGrad.addColorStop(0.3, flameColors.mid + '66');
  haloGrad.addColorStop(0.6, flameColors.outer + '33');
  haloGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.ellipse(engineX - exhaustLen * 0.3, centerY, exhaustLen * 0.7, 8 * boostMultiplier, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Apply shadow blur for additional glow effect
  ctx.save();
  ctx.shadowColor = flameColors.mid;
  ctx.shadowBlur = 12 * boostMultiplier;
  
  // Outer flame
  const flameGrad = ctx.createLinearGradient(engineX, centerY, engineX - exhaustLen, centerY);
  flameGrad.addColorStop(0, '#ffffff');
  flameGrad.addColorStop(0.1, flameColors.inner);
  flameGrad.addColorStop(0.3, flameColors.mid);
  flameGrad.addColorStop(0.6, flameColors.outer);
  flameGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = flameGrad;
  ctx.beginPath();
  ctx.moveTo(engineX, centerY - flameWidth);
  ctx.quadraticCurveTo(engineX - exhaustLen * 0.6, centerY - flameWidth - 1, engineX - exhaustLen, centerY);
  ctx.quadraticCurveTo(engineX - exhaustLen * 0.6, centerY + flameWidth + 1, engineX, centerY + flameWidth);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
  
  // Inner core flame (no shadow for crisp look)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.moveTo(engineX, centerY - 1.5);
  ctx.lineTo(engineX - exhaustLen * 0.5, centerY);
  ctx.lineTo(engineX, centerY + 1.5);
  ctx.closePath();
  ctx.fill();
}

// Original ship - FALCON (white/grey classic design)
export function drawFalconShip(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number, skinColors?: ShipSkinColors, upgradeState?: UpgradeState) {
  const primary = skinColors?.primary || '#ffffff';
  const secondary = skinColors?.secondary || '#cccccc';
  const accent = skinColors?.accent || '#ffaa00';
  const glow = skinColors?.glow || '#00ddff';
  
  const upgrades = upgradeState ?? getStoredUpgrades();
  const thrusterLevel = upgrades['thrusters'] || 0;
  const boostMultiplier = 1 + thrusterLevel * 0.15;
  
  // Engine flame - gets bigger with thrusters
  drawEngineFlame(ctx, centerX - 12, centerY, { inner: '#ffcc88', mid: '#ff8844', outer: '#ff4400' }, boostMultiplier);
  
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
export function drawBlueHawkShip(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number, skinColors?: ShipSkinColors, upgradeState?: UpgradeState) {
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
  drawEngineFlame(ctx, centerX - 12, centerY, { inner: '#ffcc88', mid: '#ff6644', outer: '#cc2200' }, boostMultiplier);
  
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
export function drawArcticWolfShip(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number, skinColors?: ShipSkinColors, upgradeState?: UpgradeState) {
  const primary = skinColors?.primary || '#aaddee';
  const secondary = skinColors?.secondary || '#88bbcc';
  const accent = skinColors?.accent || '#ffffff';
  const glow = skinColors?.glow || '#aaddff';
  
  const upgrades = upgradeState ?? getStoredUpgrades();
  const thrusterLevel = upgrades['thrusters'] || 0;
  const hullLevel = upgrades['hull_armor'] || 0;
  const boostMultiplier = 1 + thrusterLevel * 0.15;
  const wingScale = 1 + hullLevel * 0.08;
  
  // Engine flame (blue-white)
  const exhaustLen = (20 + Math.random() * 15) * boostMultiplier;
  const engineX = centerX - 14;
  
  const flameGrad = ctx.createLinearGradient(engineX, centerY, engineX - exhaustLen, centerY);
  flameGrad.addColorStop(0, '#ffffff');
  flameGrad.addColorStop(0.2, '#aaddff');
  flameGrad.addColorStop(0.4, '#66bbff');
  flameGrad.addColorStop(0.7, '#3388cc');
  flameGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = flameGrad;
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
export function drawDeltaShip(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number, skinColors?: ShipSkinColors, upgradeState?: UpgradeState) {
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
  drawEngineFlame(ctx, centerX - 10, centerY, { inner: '#aaffaa', mid: '#44ff44', outer: '#00aa00' }, boostMultiplier);
  
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
export function drawCrimsonHawkShip(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number, skinColors?: ShipSkinColors, upgradeState?: UpgradeState) {
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
  drawEngineFlame(ctx, centerX - 12, centerY, { inner: '#ffaa88', mid: '#ff4422', outer: '#aa0000' }, boostMultiplier);
  
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
export function drawValkyrieShip(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number, skinColors?: ShipSkinColors, upgradeState?: UpgradeState) {
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
  drawEngineFlame(ctx, centerX - 12, centerY, { inner: '#ffaaff', mid: '#aa44ff', outer: '#6600aa' }, boostMultiplier);
  
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
  
  // Gold trim
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(centerX + 24, centerY);
  ctx.lineTo(centerX + 14, centerY - 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(centerX + 24, centerY);
  ctx.lineTo(centerX + 14, centerY + 4);
  ctx.stroke();
  ctx.shadowBlur = 0;
  
  // Royal cockpit
  const cockpitGrad = ctx.createRadialGradient(centerX + 16, centerY, 0, centerX + 16, centerY, 5);
  cockpitGrad.addColorStop(0, '#ffddff');
  cockpitGrad.addColorStop(0.4, '#bb66ff');
  cockpitGrad.addColorStop(1, '#663399');
  ctx.fillStyle = cockpitGrad;
  ctx.beginPath();
  ctx.ellipse(centerX + 16, centerY, 5, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Wing orbs
  ctx.fillStyle = glow;
  ctx.shadowColor = glow;
  ctx.shadowBlur = 8;
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

// Main function to draw the selected mega ship with optional skin colors
export function drawMegaShip(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  megaShipId: string,
  time: number,
  skinColors?: ShipSkinColors,
  upgradeState?: UpgradeState
) {
  const upgrades = upgradeState ?? getStoredUpgrades();
  const stats = getComputedStats(upgrades);
  
  // Draw BACK layer upgrade visuals first (shields, magnet field)
  drawUpgradeVisualsBack(ctx, centerX, centerY, time, upgrades, stats);
  
  // Draw the ship itself (with built-in scaling from upgrades)
  switch (megaShipId) {
    case 'blue_hawk':
      drawBlueHawkShip(ctx, centerX, centerY, time, skinColors, upgrades);
      break;
    case 'arctic_wolf':
      drawArcticWolfShip(ctx, centerX, centerY, time, skinColors, upgrades);
      break;
    case 'delta_prime':
      drawDeltaShip(ctx, centerX, centerY, time, skinColors, upgrades);
      break;
    case 'crimson_hawk':
      drawCrimsonHawkShip(ctx, centerX, centerY, time, skinColors, upgrades);
      break;
    case 'valkyrie_prime':
      drawValkyrieShip(ctx, centerX, centerY, time, skinColors, upgrades);
      break;
    case 'original':
    default:
      drawFalconShip(ctx, centerX, centerY, time, skinColors, upgrades);
      break;
  }
  
  // Draw FRONT layer upgrade visuals (cannons, weapons, armor)
  drawUpgradeVisualsFront(ctx, centerX, centerY, time, upgrades, stats);
}
