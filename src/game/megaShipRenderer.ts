// Mega Ship rendering functions - each ship matches the designs from /ships page
import { Player } from './types';
import { getStoredMegaShipId, hasWingLights } from '@/hooks/useMegaShips';
import { getStoredUpgrades, getComputedStats } from '@/hooks/useShipUpgrades';

// Skin colors interface for color customization
export interface ShipSkinColors {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
}

// Draw upgrade visuals (extra cannons, shields, armor, thrusters, etc.)
function drawUpgradeVisuals(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number) {
  const stats = getComputedStats();
  const upgrades = getStoredUpgrades();
  
  // Draw thruster boost flames for speed upgrades
  const thrusterLevel = upgrades['thrusters'] || 0;
  if (thrusterLevel > 0) {
    ctx.save();
    const flameIntensity = 0.3 + thrusterLevel * 0.1;
    const flameLength = 15 + thrusterLevel * 5 + Math.random() * 8;
    
    // Extra thruster flames on sides
    for (let i = 0; i < Math.min(thrusterLevel, 4); i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const tier = Math.floor(i / 2);
      const yOffset = side * (6 + tier * 4);
      
      const flameGrad = ctx.createLinearGradient(centerX - 15, centerY, centerX - 15 - flameLength, centerY);
      flameGrad.addColorStop(0, `rgba(0, 255, 255, ${flameIntensity})`);
      flameGrad.addColorStop(0.3, `rgba(0, 200, 255, ${flameIntensity * 0.7})`);
      flameGrad.addColorStop(0.7, `rgba(100, 100, 255, ${flameIntensity * 0.3})`);
      flameGrad.addColorStop(1, 'transparent');
      
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.moveTo(centerX - 15, centerY + yOffset - 2);
      ctx.lineTo(centerX - 15 - flameLength, centerY + yOffset);
      ctx.lineTo(centerX - 15, centerY + yOffset + 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
  
  // Draw magnet field for salvage magnet upgrades
  const magnetLevel = upgrades['magnet_range'] || 0;
  if (magnetLevel > 0) {
    ctx.save();
    const magnetPulse = Math.sin(time * 3) * 0.3 + 0.4;
    ctx.globalAlpha = magnetPulse * 0.15;
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 6]);
    
    // Draw multiple magnet rings
    for (let i = 0; i < Math.min(magnetLevel, 3); i++) {
      const radius = 25 + i * 8;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  }
  
  // Draw piercing rounds glow
  const pierceLevel = upgrades['piercing_rounds'] || 0;
  if (pierceLevel > 0) {
    ctx.save();
    const pierceGlow = Math.sin(time * 4) * 0.2 + 0.6;
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 8 + pierceLevel * 3;
    ctx.strokeStyle = `rgba(255, 0, 255, ${pierceGlow * 0.4})`;
    ctx.lineWidth = 1;
    
    // Piercing energy lines from nose
    for (let i = 0; i < pierceLevel; i++) {
      const angle = ((i / pierceLevel) - 0.5) * 0.4;
      ctx.beginPath();
      ctx.moveTo(centerX + 18, centerY);
      ctx.lineTo(centerX + 28 + pierceLevel * 3, centerY + Math.sin(angle) * 8);
      ctx.stroke();
    }
    ctx.restore();
  }
  
  // Draw rapid fire energy coils
  const rapidFireLevel = upgrades['rapid_fire'] || 0;
  if (rapidFireLevel >= 3) {
    ctx.save();
    const coilPulse = Math.sin(time * 6) * 0.3 + 0.5;
    ctx.strokeStyle = `rgba(255, 200, 0, ${coilPulse * 0.4})`;
    ctx.lineWidth = 1;
    
    // Energy coils around cannon
    const coilCount = Math.min(rapidFireLevel - 2, 4);
    for (let i = 0; i < coilCount; i++) {
      const coilAngle = time * 5 + (i / coilCount) * Math.PI * 2;
      const coilX = centerX + 8 + i * 3;
      const coilY = centerY + Math.sin(coilAngle) * 3;
      ctx.beginPath();
      ctx.arc(coilX, coilY, 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
  
  // Draw cannon power glow
  const cannonPowerLevel = upgrades['cannon_power'] || 0;
  if (cannonPowerLevel >= 3) {
    ctx.save();
    const powerGlow = Math.sin(time * 2) * 0.2 + 0.5;
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 6 + cannonPowerLevel;
    ctx.fillStyle = `rgba(255, 100, 0, ${powerGlow * 0.3})`;
    
    // Glowing cannon tip
    ctx.beginPath();
    ctx.arc(centerX + 20, centerY, 3 + cannonPowerLevel * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  
  // Draw extra cannons
  if (stats.extraCannons > 0) {
    ctx.save();
    ctx.strokeStyle = '#ff6600';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ff6600';
    ctx.shadowBlur = 6;
    
    // Side cannons with muzzle flash
    for (let i = 0; i < Math.min(stats.extraCannons, 4); i++) {
      const yOffset = (i % 2 === 0 ? -1 : 1) * (8 + Math.floor(i / 2) * 6);
      const xOffset = -4 - Math.floor(i / 2) * 3;
      
      // Cannon barrel with gradient
      const barrelGrad = ctx.createLinearGradient(centerX + xOffset, centerY, centerX + xOffset + 18, centerY);
      barrelGrad.addColorStop(0, '#333355');
      barrelGrad.addColorStop(0.5, '#555577');
      barrelGrad.addColorStop(1, '#ff6600');
      ctx.strokeStyle = barrelGrad;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX + xOffset, centerY + yOffset);
      ctx.lineTo(centerX + xOffset + 18, centerY + yOffset);
      ctx.stroke();
      
      // Cannon mount
      ctx.fillStyle = '#444466';
      ctx.fillRect(centerX + xOffset - 2, centerY + yOffset - 3, 8, 6);
      
      // Muzzle glow
      const muzzleGlow = Math.sin(time * 8 + i) * 0.3 + 0.5;
      ctx.fillStyle = `rgba(255, 100, 0, ${muzzleGlow})`;
      ctx.beginPath();
      ctx.arc(centerX + xOffset + 18, centerY + yOffset, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  
  // Draw armor plating visual for hull armor upgrades
  const hullLevel = upgrades['hull_armor'] || 0;
  if (hullLevel >= 2) {
    ctx.save();
    
    // Armor plates around the ship
    const plateCount = Math.min(hullLevel, 8);
    for (let i = 0; i < plateCount; i++) {
      const angle = (i / plateCount) * Math.PI * 2 + time * 0.3;
      const dist = 18 + (i % 2) * 4;
      const plateX = centerX + Math.cos(angle) * dist * 0.4;
      const plateY = centerY + Math.sin(angle) * dist;
      
      // Plate gradient
      const plateGrad = ctx.createRadialGradient(plateX, plateY, 0, plateX, plateY, 4);
      plateGrad.addColorStop(0, 'rgba(100, 180, 255, 0.6)');
      plateGrad.addColorStop(0.5, 'rgba(60, 120, 200, 0.4)');
      plateGrad.addColorStop(1, 'rgba(40, 80, 150, 0.2)');
      
      ctx.fillStyle = plateGrad;
      ctx.beginPath();
      ctx.arc(plateX, plateY, 3 + (hullLevel > 5 ? 1 : 0), 0, Math.PI * 2);
      ctx.fill();
      
      // Plate outline
      ctx.strokeStyle = 'rgba(150, 200, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
  }
  
  // Draw shield aura for energy shield upgrades
  if (stats.bonusShields > 0) {
    ctx.save();
    const pulse = Math.sin(time * 2) * 0.2 + 0.5;
    
    // Inner shield glow
    ctx.globalAlpha = pulse * 0.2;
    const shieldGrad = ctx.createRadialGradient(centerX, centerY, 15, centerX, centerY, 30 + stats.bonusShields * 3);
    shieldGrad.addColorStop(0, 'transparent');
    shieldGrad.addColorStop(0.5, 'rgba(0, 170, 255, 0.3)');
    shieldGrad.addColorStop(1, 'rgba(0, 100, 255, 0.1)');
    ctx.fillStyle = shieldGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30 + stats.bonusShields * 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Outer shield ring
    ctx.globalAlpha = pulse * 0.5;
    ctx.strokeStyle = '#00aaff';
    ctx.lineWidth = 1 + stats.bonusShields * 0.5;
    ctx.shadowColor = '#00aaff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 28 + stats.bonusShields * 2, 0, Math.PI * 2);
    ctx.stroke();
    
    // Shield energy particles
    ctx.globalAlpha = pulse * 0.6;
    for (let i = 0; i < stats.bonusShields * 2; i++) {
      const particleAngle = time * 1.5 + (i / (stats.bonusShields * 2)) * Math.PI * 2;
      const particleX = centerX + Math.cos(particleAngle) * (26 + stats.bonusShields * 2);
      const particleY = centerY + Math.sin(particleAngle) * (26 + stats.bonusShields * 2);
      ctx.fillStyle = '#00ddff';
      ctx.beginPath();
      ctx.arc(particleX, particleY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
}

// Draw engine flame (common for all ships) with glow halo
function drawEngineFlame(ctx: CanvasRenderingContext2D, engineX: number, centerY: number, flameColors: { inner: string; mid: string; outer: string }) {
  const exhaustLen = 20 + Math.random() * 15;
  
  // Engine glow halo (radial gradient behind the flame)
  const haloGrad = ctx.createRadialGradient(engineX - 5, centerY, 0, engineX - 5, centerY, exhaustLen * 0.8);
  haloGrad.addColorStop(0, flameColors.inner + 'aa');
  haloGrad.addColorStop(0.3, flameColors.mid + '66');
  haloGrad.addColorStop(0.6, flameColors.outer + '33');
  haloGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.ellipse(engineX - exhaustLen * 0.3, centerY, exhaustLen * 0.7, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Apply shadow blur for additional glow effect
  ctx.save();
  ctx.shadowColor = flameColors.mid;
  ctx.shadowBlur = 12;
  
  // Outer flame
  const flameGrad = ctx.createLinearGradient(engineX, centerY, engineX - exhaustLen, centerY);
  flameGrad.addColorStop(0, '#ffffff');
  flameGrad.addColorStop(0.1, flameColors.inner);
  flameGrad.addColorStop(0.3, flameColors.mid);
  flameGrad.addColorStop(0.6, flameColors.outer);
  flameGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = flameGrad;
  ctx.beginPath();
  ctx.moveTo(engineX, centerY - 3);
  ctx.quadraticCurveTo(engineX - exhaustLen * 0.6, centerY - 4, engineX - exhaustLen, centerY);
  ctx.quadraticCurveTo(engineX - exhaustLen * 0.6, centerY + 4, engineX, centerY + 3);
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
export function drawFalconShip(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number, skinColors?: ShipSkinColors) {
  const primary = skinColors?.primary || '#ffffff';
  const secondary = skinColors?.secondary || '#cccccc';
  const accent = skinColors?.accent || '#ffaa00';
  const glow = skinColors?.glow || '#00ddff';
  
  // Engine flame
  drawEngineFlame(ctx, centerX - 12, centerY, { inner: '#ffcc88', mid: '#ff8844', outer: '#ff4400' });
  
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
  
  // Wings
  ctx.fillStyle = secondary;
  // Top wing
  ctx.beginPath();
  ctx.moveTo(centerX + 6, centerY - 4);
  ctx.lineTo(centerX - 3, centerY - 12);
  ctx.lineTo(centerX - 9, centerY - 10);
  ctx.lineTo(centerX - 4, centerY - 3);
  ctx.closePath();
  ctx.fill();
  
  // Bottom wing
  ctx.beginPath();
  ctx.moveTo(centerX + 6, centerY + 4);
  ctx.lineTo(centerX - 3, centerY + 12);
  ctx.lineTo(centerX - 9, centerY + 10);
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
  
  // Engine nozzle
  ctx.fillStyle = '#333344';
  ctx.fillRect(centerX - 12, centerY - 3, 3, 6);
}

// BLUE HAWK - blue ship with orange stripes and red wingtip orbs
export function drawBlueHawkShip(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number, skinColors?: ShipSkinColors) {
  const primary = skinColors?.primary || '#2255cc';
  const secondary = skinColors?.secondary || '#1144aa';
  const accent = skinColors?.accent || '#ff6644';
  const glow = skinColors?.glow || '#dd4444';
  
  // Engine flame (orange/red)
  drawEngineFlame(ctx, centerX - 12, centerY, { inner: '#ffcc88', mid: '#ff6644', outer: '#cc2200' });
  
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
  ctx.lineTo(centerX - 5, centerY - 14);
  ctx.lineTo(centerX - 12, centerY - 11);
  ctx.lineTo(centerX - 6, centerY - 4);
  ctx.closePath();
  ctx.fill();
  
  // Bottom wing
  ctx.beginPath();
  ctx.moveTo(centerX + 8, centerY + 5);
  ctx.lineTo(centerX - 5, centerY + 14);
  ctx.lineTo(centerX - 12, centerY + 11);
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
  ctx.arc(centerX - 8, centerY - 12, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(centerX - 8, centerY + 12, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Engine nozzle
  ctx.fillStyle = '#222233';
  ctx.fillRect(centerX - 14, centerY - 3, 4, 6);
}

// ARCTIC WOLF - light blue/white with white wing lights
export function drawArcticWolfShip(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number, skinColors?: ShipSkinColors) {
  const primary = skinColors?.primary || '#aaddee';
  const secondary = skinColors?.secondary || '#88bbcc';
  const accent = skinColors?.accent || '#ffffff';
  const glow = skinColors?.glow || '#aaddff';
  
  // Engine flame (blue-white)
  const exhaustLen = 20 + Math.random() * 15;
  const engineX = centerX - 14;
  
  const flameGrad = ctx.createLinearGradient(engineX, centerY, engineX - exhaustLen, centerY);
  flameGrad.addColorStop(0, '#ffffff');
  flameGrad.addColorStop(0.2, '#aaddff');
  flameGrad.addColorStop(0.4, '#66bbff');
  flameGrad.addColorStop(0.7, '#3388cc');
  flameGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = flameGrad;
  ctx.beginPath();
  ctx.moveTo(engineX, centerY - 3);
  ctx.quadraticCurveTo(engineX - exhaustLen * 0.6, centerY - 4, engineX - exhaustLen, centerY);
  ctx.quadraticCurveTo(engineX - exhaustLen * 0.6, centerY + 4, engineX, centerY + 3);
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
  ctx.fillStyle = secondary;
  // Top wing
  ctx.beginPath();
  ctx.moveTo(centerX + 5, centerY - 6);
  ctx.lineTo(centerX - 6, centerY - 14);
  ctx.lineTo(centerX - 12, centerY - 12);
  ctx.lineTo(centerX - 6, centerY - 5);
  ctx.closePath();
  ctx.fill();
  
  // Bottom wing
  ctx.beginPath();
  ctx.moveTo(centerX + 5, centerY + 6);
  ctx.lineTo(centerX - 6, centerY + 14);
  ctx.lineTo(centerX - 12, centerY + 12);
  ctx.lineTo(centerX - 6, centerY + 5);
  ctx.closePath();
  ctx.fill();
  
  // Cockpit (white oval)
  const cockpitGrad = ctx.createRadialGradient(centerX + 16, centerY, 0, centerX + 16, centerY, 5);
  cockpitGrad.addColorStop(0, '#ffffff');
  cockpitGrad.addColorStop(0.5, '#ddeeee');
  cockpitGrad.addColorStop(1, '#aacccc');
  ctx.fillStyle = cockpitGrad;
  ctx.beginPath();
  ctx.ellipse(centerX + 16, centerY, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Blinking wing lights
  const blinkOn = Math.sin(time * 8) > 0;
  if (blinkOn) {
    ctx.fillStyle = accent;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(centerX - 9, centerY - 13, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX - 9, centerY + 13, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    ctx.fillStyle = '#aabbcc';
    ctx.beginPath();
    ctx.arc(centerX - 9, centerY - 13, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX - 9, centerY + 13, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Engine nozzle
  ctx.fillStyle = '#445566';
  ctx.fillRect(centerX - 14, centerY - 3, 4, 6);
}

// DELTA - triangle/delta wing shape, purple/blue with glowing orbs
export function drawDeltaShip(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number, skinColors?: ShipSkinColors) {
  const primary = skinColors?.primary || '#5566aa';
  const secondary = skinColors?.secondary || '#4455aa';
  const accent = skinColors?.accent || '#aabbff';
  const glow = skinColors?.glow || '#6699ff';
  
  // Engine flame (blue glow)
  const exhaustLen = 25 + Math.random() * 15;
  const engineX = centerX - 8;
  
  const flameGrad = ctx.createLinearGradient(engineX, centerY, engineX - exhaustLen, centerY);
  flameGrad.addColorStop(0, '#ffffff');
  flameGrad.addColorStop(0.15, '#aaddff');
  flameGrad.addColorStop(0.4, '#6688ff');
  flameGrad.addColorStop(0.7, '#4466dd');
  flameGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = flameGrad;
  ctx.beginPath();
  ctx.moveTo(engineX, centerY - 2);
  ctx.quadraticCurveTo(engineX - exhaustLen * 0.6, centerY - 3, engineX - exhaustLen, centerY);
  ctx.quadraticCurveTo(engineX - exhaustLen * 0.6, centerY + 3, engineX, centerY + 2);
  ctx.closePath();
  ctx.fill();
  
  // Main delta body (single large triangle)
  ctx.fillStyle = primary;
  ctx.beginPath();
  ctx.moveTo(centerX + 30, centerY);          // Sharp nose point
  ctx.lineTo(centerX - 12, centerY - 16);     // Top back corner
  ctx.lineTo(centerX - 6, centerY);           // Back center indent
  ctx.lineTo(centerX - 12, centerY + 16);     // Bottom back corner
  ctx.closePath();
  ctx.fill();
  
  // Inner body
  ctx.fillStyle = secondary;
  ctx.beginPath();
  ctx.moveTo(centerX + 20, centerY);
  ctx.lineTo(centerX - 8, centerY - 10);
  ctx.lineTo(centerX - 4, centerY);
  ctx.lineTo(centerX - 8, centerY + 10);
  ctx.closePath();
  ctx.fill();
  
  // Cockpit
  const cockpitGrad = ctx.createRadialGradient(centerX + 12, centerY, 0, centerX + 12, centerY, 7);
  cockpitGrad.addColorStop(0, accent);
  cockpitGrad.addColorStop(0.5, glow);
  cockpitGrad.addColorStop(1, primary);
  ctx.fillStyle = cockpitGrad;
  ctx.beginPath();
  ctx.ellipse(centerX + 12, centerY, 7, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Glowing orbs on wingtips
  const orbPulse = Math.sin(time * 5) * 0.3 + 0.7;
  ctx.fillStyle = glow;
  ctx.shadowColor = glow;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(centerX - 10, centerY - 14, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(centerX - 10, centerY + 14, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Engine housing (small blue piece at back)
  ctx.fillStyle = '#4466bb';
  ctx.fillRect(centerX - 10, centerY - 2, 4, 4);
}

// CRIMSON HAWK - red double-hull design with twin engines
export function drawCrimsonHawkShip(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number, skinColors?: ShipSkinColors) {
  const primary = skinColors?.primary || '#cc3333';
  const secondary = skinColors?.secondary || '#aa2222';
  const accent = skinColors?.accent || '#ddaa44';
  const glow = skinColors?.glow || '#ff4444';
  
  // Twin engine flames (top and bottom hulls)
  const exhaustLen = 18 + Math.random() * 12;
  
  // Top engine
  let flameGrad = ctx.createLinearGradient(centerX - 10, centerY - 7, centerX - 10 - exhaustLen, centerY - 7);
  flameGrad.addColorStop(0, '#ffffff');
  flameGrad.addColorStop(0.15, '#ffff88');
  flameGrad.addColorStop(0.4, '#ffaa44');
  flameGrad.addColorStop(0.7, '#ff6600');
  flameGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = flameGrad;
  ctx.beginPath();
  ctx.moveTo(centerX - 10, centerY - 9);
  ctx.quadraticCurveTo(centerX - 10 - exhaustLen * 0.6, centerY - 10, centerX - 10 - exhaustLen, centerY - 7);
  ctx.quadraticCurveTo(centerX - 10 - exhaustLen * 0.6, centerY - 4, centerX - 10, centerY - 5);
  ctx.closePath();
  ctx.fill();
  
  // Bottom engine
  flameGrad = ctx.createLinearGradient(centerX - 10, centerY + 7, centerX - 10 - exhaustLen, centerY + 7);
  flameGrad.addColorStop(0, '#ffffff');
  flameGrad.addColorStop(0.15, '#ffff88');
  flameGrad.addColorStop(0.4, '#ffaa44');
  flameGrad.addColorStop(0.7, '#ff6600');
  flameGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = flameGrad;
  ctx.beginPath();
  ctx.moveTo(centerX - 10, centerY + 5);
  ctx.quadraticCurveTo(centerX - 10 - exhaustLen * 0.6, centerY + 4, centerX - 10 - exhaustLen, centerY + 7);
  ctx.quadraticCurveTo(centerX - 10 - exhaustLen * 0.6, centerY + 10, centerX - 10, centerY + 9);
  ctx.closePath();
  ctx.fill();
  
  // Main central body
  ctx.fillStyle = primary;
  ctx.beginPath();
  ctx.moveTo(centerX + 25, centerY);          // Nose point
  ctx.lineTo(centerX + 15, centerY - 5);
  ctx.lineTo(centerX - 5, centerY - 5);
  ctx.lineTo(centerX - 10, centerY);
  ctx.lineTo(centerX - 5, centerY + 5);
  ctx.lineTo(centerX + 15, centerY + 5);
  ctx.closePath();
  ctx.fill();
  
  // Top engine pod
  ctx.fillStyle = secondary;
  ctx.beginPath();
  ctx.moveTo(centerX + 5, centerY - 5);
  ctx.lineTo(centerX + 5, centerY - 10);
  ctx.lineTo(centerX - 12, centerY - 10);
  ctx.lineTo(centerX - 12, centerY - 5);
  ctx.closePath();
  ctx.fill();
  
  // Bottom engine pod
  ctx.beginPath();
  ctx.moveTo(centerX + 5, centerY + 5);
  ctx.lineTo(centerX + 5, centerY + 10);
  ctx.lineTo(centerX - 12, centerY + 10);
  ctx.lineTo(centerX - 12, centerY + 5);
  ctx.closePath();
  ctx.fill();
  
  // Accent stripes on pods
  ctx.fillStyle = accent;
  ctx.fillRect(centerX - 8, centerY - 9, 10, 2);
  ctx.fillRect(centerX - 8, centerY + 7, 10, 2);
  
  // Cockpit (white/cream oval)
  const cockpitGrad = ctx.createRadialGradient(centerX + 14, centerY, 0, centerX + 14, centerY, 5);
  cockpitGrad.addColorStop(0, '#ffffff');
  cockpitGrad.addColorStop(0.5, '#ffeeee');
  cockpitGrad.addColorStop(1, '#ddcccc');
  ctx.fillStyle = cockpitGrad;
  ctx.beginPath();
  ctx.ellipse(centerX + 14, centerY, 5, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Engine nozzles (dark)
  ctx.fillStyle = '#222222';
  ctx.fillRect(centerX - 14, centerY - 9, 3, 4);
  ctx.fillRect(centerX - 14, centerY + 5, 3, 4);
}

// VALKYRIE - grey/blue stealth fighter with red orbs on wings
export function drawValkyrieShip(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number, skinColors?: ShipSkinColors) {
  const primary = skinColors?.primary || '#8899aa';
  const secondary = skinColors?.secondary || '#667788';
  const accent = skinColors?.accent || '#aaddff';
  const glow = skinColors?.glow || '#dd4444';
  
  // Engine flame (orange/red)
  const exhaustLen = 22 + Math.random() * 15;
  const engineX = centerX - 12;
  
  const flameGrad = ctx.createLinearGradient(engineX, centerY, engineX - exhaustLen, centerY);
  flameGrad.addColorStop(0, '#ffffff');
  flameGrad.addColorStop(0.15, '#ffdd88');
  flameGrad.addColorStop(0.4, '#ff8844');
  flameGrad.addColorStop(0.7, '#cc3300');
  flameGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = flameGrad;
  ctx.beginPath();
  ctx.moveTo(engineX, centerY - 3);
  ctx.quadraticCurveTo(engineX - exhaustLen * 0.6, centerY - 4, engineX - exhaustLen, centerY);
  ctx.quadraticCurveTo(engineX - exhaustLen * 0.6, centerY + 4, engineX, centerY + 3);
  ctx.closePath();
  ctx.fill();
  
  // Main body
  ctx.fillStyle = primary;
  ctx.beginPath();
  ctx.moveTo(centerX + 28, centerY);          // Sharp pointed nose
  ctx.lineTo(centerX + 20, centerY - 4);
  ctx.lineTo(centerX + 5, centerY - 5);
  ctx.lineTo(centerX - 10, centerY - 4);
  ctx.lineTo(centerX - 14, centerY);
  ctx.lineTo(centerX - 10, centerY + 4);
  ctx.lineTo(centerX + 5, centerY + 5);
  ctx.lineTo(centerX + 20, centerY + 4);
  ctx.closePath();
  ctx.fill();
  
  // Wings (angular stealth design)
  ctx.fillStyle = secondary;
  // Top wing (angular)
  ctx.beginPath();
  ctx.moveTo(centerX + 10, centerY - 5);
  ctx.lineTo(centerX + 2, centerY - 14);
  ctx.lineTo(centerX - 8, centerY - 12);
  ctx.lineTo(centerX - 4, centerY - 4);
  ctx.closePath();
  ctx.fill();
  
  // Bottom wing
  ctx.beginPath();
  ctx.moveTo(centerX + 10, centerY + 5);
  ctx.lineTo(centerX + 2, centerY + 14);
  ctx.lineTo(centerX - 8, centerY + 12);
  ctx.lineTo(centerX - 4, centerY + 4);
  ctx.closePath();
  ctx.fill();
  
  // Tail fin
  ctx.fillStyle = '#778899';
  ctx.beginPath();
  ctx.moveTo(centerX - 6, centerY - 4);
  ctx.lineTo(centerX - 10, centerY - 8);
  ctx.lineTo(centerX - 12, centerY - 6);
  ctx.lineTo(centerX - 10, centerY - 4);
  ctx.closePath();
  ctx.fill();
  
  // Cockpit
  const cockpitGrad = ctx.createRadialGradient(centerX + 16, centerY, 0, centerX + 16, centerY, 6);
  cockpitGrad.addColorStop(0, accent);
  cockpitGrad.addColorStop(0.4, glow);
  cockpitGrad.addColorStop(1, secondary);
  ctx.fillStyle = cockpitGrad;
  ctx.beginPath();
  ctx.ellipse(centerX + 16, centerY, 6, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Glow orbs on wings
  ctx.fillStyle = glow;
  ctx.shadowColor = glow;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(centerX, centerY - 12, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(centerX, centerY + 12, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Engine nozzle
  ctx.fillStyle = '#333344';
  ctx.fillRect(centerX - 14, centerY - 3, 4, 6);
}

// Main function to draw the selected mega ship with optional skin colors
export function drawMegaShip(
  ctx: CanvasRenderingContext2D, 
  centerX: number, 
  centerY: number, 
  megaShipId: string,
  time: number,
  skinColors?: ShipSkinColors
) {
  // Draw upgrade visuals first (behind ship)
  drawUpgradeVisuals(ctx, centerX, centerY, time);
  
  switch (megaShipId) {
    case 'blue_hawk':
      drawBlueHawkShip(ctx, centerX, centerY, time, skinColors);
      break;
    case 'arctic_wolf':
      drawArcticWolfShip(ctx, centerX, centerY, time, skinColors);
      break;
    case 'delta_prime':
      drawDeltaShip(ctx, centerX, centerY, time, skinColors);
      break;
    case 'crimson_hawk':
      drawCrimsonHawkShip(ctx, centerX, centerY, time, skinColors);
      break;
    case 'valkyrie_prime':
      drawValkyrieShip(ctx, centerX, centerY, time, skinColors);
      break;
    case 'original':
    default:
      drawFalconShip(ctx, centerX, centerY, time, skinColors);
      break;
  }
}
