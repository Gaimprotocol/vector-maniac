import { GameData, Player, Enemy, Civilian, Pickup, Particle, TerrainSegment, Star, Bullet, Bomb, FallingDebris } from './types';
import { COLORS, GAME_CONFIG } from './constants';
import { drawMegaShip, ShipSkinColors } from './megaShipRenderer';
import { getStoredMegaShipId, getMegaShipById } from '@/hooks/useMegaShips';
import { getStoredUpgrades } from '@/hooks/useShipUpgrades';
// Re-export ShipSkinColors for use in other files
export type { ShipSkinColors };

// Default ship colors (matches 'default' skin in useEquipment)
export const DEFAULT_SHIP_COLORS: ShipSkinColors = {
  primary: '#ffffff',
  secondary: '#cccccc',
  accent: '#ffaa00',
  glow: '#00ddff',
};

// Helper function to adjust hex color brightness
function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + Math.round(255 * percent / 100)));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + Math.round(255 * percent / 100)));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + Math.round(255 * percent / 100)));
  return `rgb(${r}, ${g}, ${b})`;
}

// Helper to convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private time: number = 0;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  // Get environment-specific colors for structures
  private getEnvironmentColors(environment: string, isHazardous: boolean): {
    buildingTop: string;
    buildingMid: string;
    buildingBottom: string;
    windowGlow: string;
    windowColor: string;
    accentGlow: string;
    pipeColor: string;
    pipeCap: string;
    towerColor: string;
  } {
    if (isHazardous) {
      return {
        buildingTop: '#2a1a1a',
        buildingMid: '#3a2a2a',
        buildingBottom: '#1a0a0a',
        windowGlow: '#ff4444',
        windowColor: 'rgba(255, 100, 100, 1)',
        accentGlow: 'rgba(255, 50, 50, 0.5)',
        pipeColor: '#3a2a2a',
        pipeCap: '#6a4a4a',
        towerColor: '#4a2a2a',
      };
    }
    
    switch (environment) {
      case 'ice':
        return {
          buildingTop: '#1a2a3a',
          buildingMid: '#2a4a5a',
          buildingBottom: '#0a1a2a',
          windowGlow: '#88ddff',
          windowColor: 'rgba(136, 221, 255, 1)',
          accentGlow: 'rgba(136, 221, 255, 0.5)',
          pipeColor: '#2a4a5a',
          pipeCap: '#5a8a9a',
          towerColor: '#3a5a6a',
        };
      case 'lava':
        return {
          buildingTop: '#2a1808',
          buildingMid: '#3a2810',
          buildingBottom: '#1a0a05',
          windowGlow: '#ff6600',
          windowColor: 'rgba(255, 100, 0, 1)',
          accentGlow: 'rgba(255, 68, 0, 0.5)',
          pipeColor: '#3a2010',
          pipeCap: '#6a4020',
          towerColor: '#4a2810',
        };
      case 'alien':
        return {
          buildingTop: '#1a1a2a',
          buildingMid: '#2a2a4a',
          buildingBottom: '#0a0a1a',
          windowGlow: '#88ff88',
          windowColor: 'rgba(136, 255, 136, 1)',
          accentGlow: 'rgba(136, 255, 136, 0.5)',
          pipeColor: '#1a3a2a',
          pipeCap: '#3a6a4a',
          towerColor: '#2a4a3a',
        };
      case 'ocean':
        return {
          buildingTop: '#0a1828',
          buildingMid: '#1a3040',
          buildingBottom: '#050c18',
          windowGlow: '#00aaff',
          windowColor: 'rgba(0, 170, 255, 1)',
          accentGlow: 'rgba(0, 170, 255, 0.5)',
          pipeColor: '#1a3040',
          pipeCap: '#3a6080',
          towerColor: '#2a4050',
        };
      case 'city':
        return {
          buildingTop: '#2a2a3a',
          buildingMid: '#3a3a4a',
          buildingBottom: '#1a1a2a',
          windowGlow: '#ffcc00',
          windowColor: 'rgba(255, 200, 50, 1)',
          accentGlow: 'rgba(255, 200, 50, 0.5)',
          pipeColor: '#3a3a4a',
          pipeCap: '#5a5a6a',
          towerColor: '#4a4a5a',
        };
      case 'industrial':
        return {
          buildingTop: '#1a1a1a',
          buildingMid: '#2a2a2a',
          buildingBottom: '#0a0a0a',
          windowGlow: '#ffaa00',
          windowColor: 'rgba(255, 170, 0, 1)',
          accentGlow: 'rgba(255, 170, 0, 0.5)',
          pipeColor: '#2a2a2a',
          pipeCap: '#4a4a4a',
          towerColor: '#3a3a3a',
        };
      default: // space, nebula, asteroid, planet
        return {
          buildingTop: '#1a2a3a',
          buildingMid: '#2a3a4a',
          buildingBottom: '#0a1a2a',
          windowGlow: '#00ffff',
          windowColor: 'rgba(0, 255, 255, 1)',
          accentGlow: 'rgba(0, 255, 255, 0.5)',
          pipeColor: '#2a3a4a',
          pipeCap: '#5a7a8a',
          towerColor: '#3a4a5a',
        };
    }
  }

  clear(): void {
    // Deep space gradient background with more depth
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#020408');
    gradient.addColorStop(0.3, '#050a14');
    gradient.addColorStop(0.6, '#080612');
    gradient.addColorStop(1, '#0a040c');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  renderStars(stars: Star[], scrollOffset: number, isHyperspace: boolean = false, isOpenSpace: boolean = false): void {
    this.time = Date.now() * 0.001;
    
    // Sort stars by layer for proper depth rendering (back to front)
    const sortedStars = [...stars].sort((a, b) => a.layer - b.layer);
    
    sortedStars.forEach((star, i) => {
      const x = (star.x - scrollOffset * star.speed) % this.width;
      const adjustedX = x < 0 ? x + this.width : x;
      
      // Layer-specific twinkling (slower for distant stars)
      const twinkleSpeed = 1 + star.layer * 0.5;
      const twinkle = Math.sin(this.time * twinkleSpeed + i * 0.3) * 0.3 + 0.7;
      const brightness = star.brightness * twinkle;
      
      // Layer-specific colors (distant stars more blue/white, close stars more varied)
      let color: string;
      if (star.layer <= 1) {
        // Distant stars - cool blue/white tones
        const distantColors = [
          `rgba(180, 200, 255, ${brightness})`,
          `rgba(200, 210, 255, ${brightness})`,
          `rgba(170, 190, 240, ${brightness})`,
        ];
        color = distantColors[i % distantColors.length];
      } else if (star.layer === 2) {
        // Mid-distance stars
        const midColors = [
          `rgba(255, 255, 240, ${brightness})`,
          `rgba(220, 230, 255, ${brightness})`,
          `rgba(255, 240, 220, ${brightness})`,
        ];
        color = midColors[i % midColors.length];
      } else {
        // Close stars - warmer, more varied colors
        const closeColors = [
          `rgba(255, 255, 240, ${brightness})`,
          `rgba(255, 200, 150, ${brightness})`,
          `rgba(150, 200, 255, ${brightness})`,
          `rgba(255, 180, 180, ${brightness})`,
        ];
        color = closeColors[i % closeColors.length];
      }
      
      if (isHyperspace) {
        // Motion blur effect during hyperspace - draw stretched star trails
        const trailLength = 30 + star.speed * 80; // Longer trails for faster stars
        const trailBrightness = brightness * 0.6;
        
        // Create gradient for motion trail
        const gradient = this.ctx.createLinearGradient(
          adjustedX - trailLength, star.y,
          adjustedX, star.y
        );
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, color.replace(/[\d.]+\)$/, `${trailBrightness * 0.3})`));
        gradient.addColorStop(1, color.replace(/[\d.]+\)$/, `${trailBrightness})`));
        
        // Draw motion trail
        this.ctx.beginPath();
        this.ctx.moveTo(adjustedX - trailLength, star.y - star.size * 0.5);
        this.ctx.lineTo(adjustedX, star.y - star.size);
        this.ctx.lineTo(adjustedX + star.size * 2, star.y);
        this.ctx.lineTo(adjustedX, star.y + star.size);
        this.ctx.lineTo(adjustedX - trailLength, star.y + star.size * 0.5);
        this.ctx.closePath();
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Bright point at star position
        this.ctx.beginPath();
        this.ctx.arc(adjustedX, star.y, star.size * 1.5, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
      } else {
        // Normal star rendering with depth-based effects
        this.ctx.beginPath();
        this.ctx.arc(adjustedX, star.y, star.size, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        
        // Enhanced glow for larger/closer stars
        if (star.size > 1.2 || star.layer >= 3) {
          const glowSize = star.size * (3 + star.layer);
          const gradient = this.ctx.createRadialGradient(
            adjustedX, star.y, 0,
            adjustedX, star.y, glowSize
          );
          gradient.addColorStop(0, color);
          gradient.addColorStop(0.2, color.replace(/[\d.]+\)$/, `${brightness * 0.4})`));
          gradient.addColorStop(0.5, color.replace(/[\d.]+\)$/, `${brightness * 0.15})`));
          gradient.addColorStop(1, 'transparent');
          this.ctx.fillStyle = gradient;
          this.ctx.beginPath();
          this.ctx.arc(adjustedX, star.y, glowSize, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    });
  }
  
  // Render parallax nebula clouds for open space maps
  renderParallaxNebulae(scrollOffset: number, nebulaColors: string[]): void {
    const time = Date.now() * 0.0001;
    
    // Create 3 layers of nebula clouds at different depths
    const nebulaLayers = [
      { speed: 0.01, opacity: 0.08, scale: 2.5, count: 3 },
      { speed: 0.03, opacity: 0.12, scale: 1.5, count: 4 },
      { speed: 0.06, opacity: 0.15, scale: 1.0, count: 5 },
    ];
    
    nebulaLayers.forEach((layer, layerIndex) => {
      for (let i = 0; i < layer.count; i++) {
        // Deterministic positions based on index
        const baseX = (i * 400 + layerIndex * 150) % (this.width * 3);
        const x = (baseX - scrollOffset * layer.speed) % (this.width * 1.5);
        const adjustedX = x < -200 ? x + this.width * 1.5 : x;
        const y = 80 + (i * 137 + layerIndex * 89) % (this.height - 160);
        
        // Slow pulsing
        const pulse = Math.sin(time * 2 + i + layerIndex) * 0.3 + 1;
        const size = (80 + i * 30) * layer.scale * pulse;
        
        // Pick color from map's nebula colors
        const colorIndex = (i + layerIndex) % nebulaColors.length;
        const baseColor = nebulaColors[colorIndex] || 'rgba(100, 50, 150, 0.1)';
        
        // Create soft nebula gradient
        const gradient = this.ctx.createRadialGradient(adjustedX, y, 0, adjustedX, y, size);
        
        // Parse color and apply layer opacity
        const alpha = layer.opacity * (0.7 + Math.sin(time + i) * 0.3);
        gradient.addColorStop(0, baseColor.replace(/[\d.]+\)$/, `${alpha})`));
        gradient.addColorStop(0.4, baseColor.replace(/[\d.]+\)$/, `${alpha * 0.5})`));
        gradient.addColorStop(0.7, baseColor.replace(/[\d.]+\)$/, `${alpha * 0.2})`));
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(adjustedX, y, size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });
  }
  
  // Render distant galaxy clusters for extra depth
  renderDistantGalaxies(scrollOffset: number): void {
    const time = Date.now() * 0.00005;
    
    // Very slow-moving background galaxies
    const galaxies = [
      { x: 200, y: 150, size: 40, rotation: 0.3 },
      { x: 600, y: 300, size: 30, rotation: -0.5 },
      { x: 1000, y: 100, size: 50, rotation: 0.8 },
      { x: 1400, y: 400, size: 35, rotation: -0.2 },
    ];
    
    galaxies.forEach((galaxy, i) => {
      const x = (galaxy.x - scrollOffset * 0.005 + time * 10) % (this.width + 200);
      const adjustedX = x < -100 ? x + this.width + 200 : x;
      
      const rotation = galaxy.rotation + time * 0.5;
      
      this.ctx.save();
      this.ctx.translate(adjustedX, galaxy.y);
      this.ctx.rotate(rotation);
      
      // Spiral galaxy effect
      const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.size);
      gradient.addColorStop(0, 'rgba(200, 180, 255, 0.15)');
      gradient.addColorStop(0.3, 'rgba(150, 130, 200, 0.08)');
      gradient.addColorStop(0.6, 'rgba(100, 80, 150, 0.04)');
      gradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, galaxy.size, galaxy.size * 0.4, 0, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Core glow
      const coreGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.size * 0.3);
      coreGradient.addColorStop(0, 'rgba(255, 255, 240, 0.2)');
      coreGradient.addColorStop(1, 'transparent');
      this.ctx.fillStyle = coreGradient;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, galaxy.size * 0.3, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    });
  }

  renderTerrain(terrain: TerrainSegment[], scrollOffset: number, isHazardous: boolean = false, terrainType: string = 'cave', environment: string = 'space'): void {
    const visibleTerrain = terrain.filter(
      seg => seg.x - scrollOffset > -100 && seg.x - scrollOffset < this.width + 100
    );

    // Pulsing effect for hazardous terrain
    const pulseIntensity = isHazardous ? 0.3 + Math.sin(Date.now() * 0.005) * 0.2 : 0;

    // Store environment for structure rendering
    const currentEnvironment = environment;

    // Determine what to render based on terrain type
    const renderCeiling = terrainType === 'cave' || terrainType === 'ceiling' || terrainType === 'waterCeiling';
    const renderFloor = terrainType === 'cave' || terrainType === 'surface' || terrainType === 'city';

    // Top terrain (ceiling) - only for cave and ceiling types
    if (renderCeiling) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      visibleTerrain.forEach((seg, i) => {
        const x = seg.x - scrollOffset;
        this.ctx.lineTo(x, seg.topHeight);
      });
      this.ctx.lineTo(this.width, 0);
      this.ctx.closePath();

      const topGradient = this.ctx.createLinearGradient(0, 0, 0, 200);
      if (isHazardous) {
        topGradient.addColorStop(0, '#1a0a0a');
        topGradient.addColorStop(0.3, '#251010');
        topGradient.addColorStop(0.6, '#301515');
        topGradient.addColorStop(1, '#3a1a1a');
      } else {
        topGradient.addColorStop(0, '#0a1a2a');
        topGradient.addColorStop(0.3, '#102030');
        topGradient.addColorStop(0.6, '#153040');
        topGradient.addColorStop(1, '#1a4050');
      }
      this.ctx.fillStyle = topGradient;
      this.ctx.fill();

      // Top terrain edge glow
      this.ctx.save();
      this.ctx.shadowColor = isHazardous ? '#ff4444' : '#00ffff';
      this.ctx.shadowBlur = isHazardous ? 20 + pulseIntensity * 15 : 15;
      this.ctx.beginPath();
      visibleTerrain.forEach((seg, i) => {
        const x = seg.x - scrollOffset;
        if (i === 0) this.ctx.moveTo(x, seg.topHeight);
        else this.ctx.lineTo(x, seg.topHeight);
      });
      this.ctx.strokeStyle = isHazardous ? `rgb(${200 + pulseIntensity * 55}, ${50 + pulseIntensity * 50}, ${50 + pulseIntensity * 50})` : '#00ccdd';
      this.ctx.lineWidth = isHazardous ? 4 : 3;
      this.ctx.stroke();
      this.ctx.restore();
      
      // Inner glow line
      this.ctx.beginPath();
      visibleTerrain.forEach((seg, i) => {
        const x = seg.x - scrollOffset;
        if (i === 0) this.ctx.moveTo(x, seg.topHeight + 2);
        else this.ctx.lineTo(x, seg.topHeight + 2);
      });
      this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }

    // Bottom terrain (ground) - for cave, surface, and city types
    if (renderFloor) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, this.height);
      visibleTerrain.forEach(seg => {
        const x = seg.x - scrollOffset;
        this.ctx.lineTo(x, this.height - seg.bottomHeight);
      });
      this.ctx.lineTo(this.width, this.height);
      this.ctx.closePath();

      const bottomGradient = this.ctx.createLinearGradient(0, this.height, 0, this.height - 200);
      if (isHazardous) {
        bottomGradient.addColorStop(0, '#1a0a0a');
        bottomGradient.addColorStop(0.3, '#251010');
        bottomGradient.addColorStop(0.6, '#301515');
        bottomGradient.addColorStop(1, '#3a1a1a');
      } else {
        bottomGradient.addColorStop(0, '#0a1a2a');
        bottomGradient.addColorStop(0.3, '#102030');
        bottomGradient.addColorStop(0.6, '#153040');
        bottomGradient.addColorStop(1, '#1a4050');
      }
      this.ctx.fillStyle = bottomGradient;
      this.ctx.fill();

      // Bottom terrain edge glow
      this.ctx.save();
      this.ctx.shadowColor = isHazardous ? '#ff4444' : '#00ffff';
      this.ctx.shadowBlur = isHazardous ? 20 + pulseIntensity * 15 : 15;
      this.ctx.beginPath();
      visibleTerrain.forEach((seg, i) => {
        const x = seg.x - scrollOffset;
        if (i === 0) this.ctx.moveTo(x, this.height - seg.bottomHeight);
        else this.ctx.lineTo(x, this.height - seg.bottomHeight);
      });
      this.ctx.strokeStyle = isHazardous ? `rgb(${200 + pulseIntensity * 55}, ${50 + pulseIntensity * 50}, ${50 + pulseIntensity * 50})` : '#00ccdd';
      this.ctx.lineWidth = isHazardous ? 4 : 3;
      this.ctx.stroke();
      this.ctx.restore();

      // Render structures with enhanced graphics and environment-based colors
      visibleTerrain.filter(seg => seg.hasStructure).forEach(seg => {
        const x = seg.x - scrollOffset;
        this.renderStructure(x, this.height - seg.bottomHeight, seg.structureType!, isHazardous, terrainType, currentEnvironment);
      });
    }
  }

  private renderStructure(x: number, groundY: number, type: string, isHazardous: boolean = false, terrainType: string = 'cave', environment: string = 'space'): void {
    this.ctx.save();
    
    // Get environment-specific colors
    const envColors = this.getEnvironmentColors(environment, isHazardous);
    
    // Add hazard glow effect for structures in hazard zones
    if (isHazardous) {
      const pulseIntensity = 0.4 + Math.sin(Date.now() * 0.006) * 0.3;
      this.ctx.shadowColor = `rgba(255, 50, 50, ${pulseIntensity})`;
      this.ctx.shadowBlur = 15 + Math.sin(Date.now() * 0.006) * 8;
    }
    
    switch (type) {
      case 'building':
        // Building with environment-based colors
        const buildGrad = this.ctx.createLinearGradient(x - 15, groundY - 40, x + 15, groundY);
        buildGrad.addColorStop(0, envColors.buildingTop);
        buildGrad.addColorStop(0.5, envColors.buildingMid);
        buildGrad.addColorStop(1, envColors.buildingBottom);
        this.ctx.fillStyle = buildGrad;
        this.ctx.fillRect(x - 15, groundY - 40, 30, 40);
        
        // Environment-specific building details
        if (environment === 'ice') {
          // Ice crystals on building
          this.ctx.fillStyle = 'rgba(136, 221, 255, 0.3)';
          this.ctx.beginPath();
          this.ctx.moveTo(x - 15, groundY - 35);
          this.ctx.lineTo(x - 18, groundY - 25);
          this.ctx.lineTo(x - 15, groundY - 20);
          this.ctx.closePath();
          this.ctx.fill();
        } else if (environment === 'lava') {
          // Lava cracks
          this.ctx.strokeStyle = '#ff4400';
          this.ctx.lineWidth = 1;
          this.ctx.shadowColor = '#ff4400';
          this.ctx.shadowBlur = 5;
          this.ctx.beginPath();
          this.ctx.moveTo(x - 10, groundY - 35);
          this.ctx.lineTo(x - 5, groundY - 20);
          this.ctx.lineTo(x, groundY - 30);
          this.ctx.stroke();
        } else if (environment === 'alien') {
          // Organic growths
          this.ctx.fillStyle = envColors.accentGlow;
          for (let i = 0; i < 3; i++) {
            const blobX = x - 12 + i * 10;
            const blobY = groundY - 38 + Math.sin(i * 2) * 5;
            this.ctx.beginPath();
            this.ctx.arc(blobX, blobY, 3 + Math.sin(this.time * 2 + i) * 1, 0, Math.PI * 2);
            this.ctx.fill();
          }
        }
        
        // Windows with environment-specific glow
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 2; col++) {
            const winX = x - 10 + col * 15;
            const winY = groundY - 35 + row * 12;
            const winGlow = Math.sin(this.time * 2 + row + col) * 0.3 + 0.7;
            this.ctx.shadowColor = envColors.windowGlow;
            this.ctx.shadowBlur = 8 * winGlow;
            this.ctx.fillStyle = envColors.windowColor.replace('1)', `${0.6 * winGlow})`);
            this.ctx.fillRect(winX, winY, 5, 6);
          }
        }
        break;
        
      case 'pipe':
        // Industrial pipe with environment-based colors
        const pipeGrad = this.ctx.createLinearGradient(x - 8, groundY - 25, x + 8, groundY - 25);
        const pipeBase = envColors.pipeColor;
        const pipeBright = adjustColorBrightness(pipeBase, 20);
        pipeGrad.addColorStop(0, pipeBase);
        pipeGrad.addColorStop(0.3, pipeBright);
        pipeGrad.addColorStop(0.7, pipeBright);
        pipeGrad.addColorStop(1, pipeBase);
        this.ctx.fillStyle = pipeGrad;
        this.ctx.fillRect(x - 8, groundY - 25, 16, 25);
        
        // Pipe cap with environment color
        this.ctx.fillStyle = envColors.pipeCap;
        this.ctx.fillRect(x - 10, groundY - 28, 20, 6);
        
        // Environment-specific pipe effects
        const steamAlpha = Math.sin(this.time * 4) * 0.2 + 0.3;
        if (environment === 'lava') {
          // Lava drips
          this.ctx.fillStyle = `rgba(255, 100, 0, ${steamAlpha})`;
          for (let i = 0; i < 2; i++) {
            const dripY = groundY - 5 + Math.sin(this.time * 2 + i) * 3;
            this.ctx.beginPath();
            this.ctx.arc(x - 4 + i * 8, dripY, 2, 0, Math.PI * 2);
            this.ctx.fill();
          }
        } else if (environment === 'ice') {
          // Frost/ice crystals
          this.ctx.fillStyle = `rgba(200, 240, 255, ${steamAlpha})`;
          this.ctx.beginPath();
          this.ctx.moveTo(x - 8, groundY - 20);
          this.ctx.lineTo(x - 12, groundY - 15);
          this.ctx.lineTo(x - 8, groundY - 10);
          this.ctx.closePath();
          this.ctx.fill();
        } else if (environment === 'ocean') {
          // Bubbles
          this.ctx.fillStyle = `rgba(150, 220, 255, ${steamAlpha})`;
          for (let i = 0; i < 3; i++) {
            const bubbleY = groundY - 35 - i * 8 - Math.sin(this.time * 3 + i) * 3;
            this.ctx.beginPath();
            this.ctx.arc(x, bubbleY, 2 + i, 0, Math.PI * 2);
            this.ctx.fill();
          }
        } else {
          // Steam effect
          this.ctx.fillStyle = isHazardous 
            ? `rgba(255, 150, 150, ${steamAlpha})`
            : `rgba(200, 220, 240, ${steamAlpha})`;
          for (let i = 0; i < 3; i++) {
            const steamY = groundY - 35 - i * 8 - Math.sin(this.time * 3 + i) * 3;
            this.ctx.beginPath();
            this.ctx.arc(x, steamY, 3 + i * 2, 0, Math.PI * 2);
            this.ctx.fill();
          }
        }
        break;
        
      case 'tower':
        // Communication tower with environment-based colors
        const towerGrad = this.ctx.createLinearGradient(x - 5, groundY, x + 5, groundY - 50);
        const towerBase = envColors.towerColor;
        const towerBright = adjustColorBrightness(towerBase, 20);
        towerGrad.addColorStop(0, towerBase);
        towerGrad.addColorStop(0.5, towerBright);
        towerGrad.addColorStop(1, towerBase);
        this.ctx.fillStyle = towerGrad;
        this.ctx.beginPath();
        this.ctx.moveTo(x - 5, groundY);
        this.ctx.lineTo(x - 8, groundY - 50);
        this.ctx.lineTo(x + 8, groundY - 50);
        this.ctx.lineTo(x + 5, groundY);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Environment-specific tower decoration
        if (environment === 'alien') {
          // Organic tendrils
          this.ctx.strokeStyle = envColors.accentGlow;
          this.ctx.lineWidth = 2;
          for (let i = 0; i < 3; i++) {
            const tendrilY = groundY - 15 - i * 15;
            this.ctx.beginPath();
            this.ctx.moveTo(x - 5, tendrilY);
            this.ctx.quadraticCurveTo(x - 15, tendrilY - 5, x - 12, tendrilY - 10 + Math.sin(this.time * 2 + i) * 3);
            this.ctx.stroke();
          }
        } else if (environment === 'ice') {
          // Ice formations
          this.ctx.fillStyle = 'rgba(200, 240, 255, 0.4)';
          this.ctx.beginPath();
          this.ctx.moveTo(x - 8, groundY - 40);
          this.ctx.lineTo(x - 15, groundY - 30);
          this.ctx.lineTo(x - 8, groundY - 25);
          this.ctx.closePath();
          this.ctx.fill();
        }
        
        // Antenna light with environment-matching glow
        const lightPulse = Math.sin(this.time * 8) > 0 ? 1 : 0.2;
        const lightColor = environment === 'lava' ? '#ff4400' 
                        : environment === 'alien' ? '#88ff88' 
                        : environment === 'ocean' ? '#00aaff'
                        : '#ff0000';
        this.ctx.shadowColor = lightColor;
        this.ctx.shadowBlur = 15 * lightPulse;
        this.ctx.fillStyle = lightColor.replace('#', 'rgba(').replace(/(.{2})(.{2})(.{2})/, (_, r, g, b) => 
          `${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, ${lightPulse})`);
        this.ctx.beginPath();
        this.ctx.arc(x, groundY - 55, 4, 0, Math.PI * 2);
        this.ctx.fill();
        break;
      
      case 'skyscraper':
        // Tall skyscraper for city terrains
        const height = 80 + Math.sin(x * 0.1) * 30;
        const skysGrad = this.ctx.createLinearGradient(x - 20, groundY - height, x + 20, groundY);
        skysGrad.addColorStop(0, '#2a3a5a');
        skysGrad.addColorStop(0.3, '#3a4a6a');
        skysGrad.addColorStop(0.7, '#2a3a5a');
        skysGrad.addColorStop(1, '#1a2a4a');
        this.ctx.fillStyle = skysGrad;
        this.ctx.fillRect(x - 20, groundY - height, 40, height);
        
        // Windows in a grid pattern
        for (let row = 0; row < Math.floor(height / 10); row++) {
          for (let col = 0; col < 3; col++) {
            const winX = x - 15 + col * 12;
            const winY = groundY - height + 8 + row * 10;
            const winGlow = Math.sin(this.time * 1.5 + row * 0.5 + col) * 0.3 + 0.7;
            const isLit = Math.sin(row + col + x * 0.1) > -0.3;
            if (isLit) {
              this.ctx.shadowColor = '#ffcc00';
              this.ctx.shadowBlur = 6 * winGlow;
              this.ctx.fillStyle = `rgba(255, 200, 50, ${0.7 * winGlow})`;
              this.ctx.fillRect(winX, winY, 6, 5);
            }
          }
        }
        
        // Antenna on top
        this.ctx.fillStyle = '#4a5a6a';
        this.ctx.fillRect(x - 2, groundY - height - 20, 4, 20);
        const antLight = Math.sin(this.time * 6) > 0 ? 1 : 0.3;
        this.ctx.shadowColor = '#ff0000';
        this.ctx.shadowBlur = 10 * antLight;
        this.ctx.fillStyle = `rgba(255, 0, 0, ${antLight})`;
        this.ctx.beginPath();
        this.ctx.arc(x, groundY - height - 22, 3, 0, Math.PI * 2);
        this.ctx.fill();
        break;
      
      case 'waterfall':
      case 'lavafall':
        // Flowing liquid effect - dramatic vertical stream
        const isLava = type === 'lavafall';
        const flowColor = isLava ? '#ff4400' : '#00aaff';
        const flowColorLight = isLava ? '#ffaa44' : '#88ddff';
        const flowColorDark = isLava ? '#aa2200' : '#0066aa';
        const streamHeight = 70;
        
        // Background glow
        this.ctx.shadowColor = flowColor;
        this.ctx.shadowBlur = 25;
        
        // Rock formation on sides
        this.ctx.fillStyle = isLava ? '#3a2010' : '#1a3040';
        this.ctx.beginPath();
        this.ctx.moveTo(x - 18, groundY);
        this.ctx.lineTo(x - 12, groundY - streamHeight);
        this.ctx.lineTo(x - 8, groundY - streamHeight + 10);
        this.ctx.lineTo(x - 6, groundY);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(x + 18, groundY);
        this.ctx.lineTo(x + 12, groundY - streamHeight);
        this.ctx.lineTo(x + 8, groundY - streamHeight + 10);
        this.ctx.lineTo(x + 6, groundY);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Main flowing stream with animated segments
        for (let i = 0; i < 8; i++) {
          const segY = ((this.time * 4 + i * 12) % streamHeight);
          const segWidth = 6 + Math.sin(this.time * 3 + i) * 2;
          const alpha = 0.6 + Math.sin(this.time * 2 + i * 0.5) * 0.2;
          
          // Stream segment gradient
          const segGrad = this.ctx.createRadialGradient(x, groundY - streamHeight + segY, 0, x, groundY - streamHeight + segY, segWidth * 2);
          if (isLava) {
            segGrad.addColorStop(0, `rgba(255, 200, 50, ${alpha})`);
            segGrad.addColorStop(0.4, `rgba(255, 100, 0, ${alpha * 0.8})`);
            segGrad.addColorStop(1, `rgba(150, 30, 0, ${alpha * 0.3})`);
          } else {
            segGrad.addColorStop(0, `rgba(200, 240, 255, ${alpha})`);
            segGrad.addColorStop(0.4, `rgba(50, 180, 255, ${alpha * 0.8})`);
            segGrad.addColorStop(1, `rgba(0, 100, 200, ${alpha * 0.3})`);
          }
          this.ctx.fillStyle = segGrad;
          this.ctx.beginPath();
          this.ctx.ellipse(x + Math.sin(this.time * 2 + i) * 2, groundY - streamHeight + segY, segWidth, 8, 0, 0, Math.PI * 2);
          this.ctx.fill();
        }
        
        // Splash/mist at base
        for (let i = 0; i < 6; i++) {
          const splashX = x + (Math.sin(this.time * 4 + i * 1.5) * 15);
          const splashY = groundY - 5 - Math.abs(Math.sin(this.time * 5 + i)) * 12;
          const splashSize = 3 + Math.sin(this.time * 3 + i) * 1.5;
          const splashAlpha = 0.4 + Math.sin(this.time * 2 + i) * 0.2;
          
          if (isLava) {
            this.ctx.fillStyle = `rgba(255, ${150 + i * 15}, 0, ${splashAlpha})`;
          } else {
            this.ctx.fillStyle = `rgba(150, 220, 255, ${splashAlpha})`;
          }
          this.ctx.beginPath();
          this.ctx.arc(splashX, splashY, splashSize, 0, Math.PI * 2);
          this.ctx.fill();
        }
        
        // Glow pool at base
        const poolGrad = this.ctx.createRadialGradient(x, groundY, 0, x, groundY, 25);
        if (isLava) {
          poolGrad.addColorStop(0, 'rgba(255, 150, 50, 0.6)');
          poolGrad.addColorStop(0.5, 'rgba(255, 80, 0, 0.3)');
          poolGrad.addColorStop(1, 'rgba(100, 20, 0, 0)');
        } else {
          poolGrad.addColorStop(0, 'rgba(150, 220, 255, 0.5)');
          poolGrad.addColorStop(0.5, 'rgba(50, 150, 255, 0.25)');
          poolGrad.addColorStop(1, 'rgba(0, 80, 150, 0)');
        }
        this.ctx.fillStyle = poolGrad;
        this.ctx.beginPath();
        this.ctx.ellipse(x, groundY + 2, 25, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bright core line
        this.ctx.strokeStyle = flowColorLight;
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = flowColorLight;
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.moveTo(x, groundY - streamHeight + 5);
        for (let i = 0; i < 10; i++) {
          const py = groundY - streamHeight + 5 + i * (streamHeight / 10);
          const px = x + Math.sin(this.time * 3 + i * 0.8) * 2;
          this.ctx.lineTo(px, py);
        }
        this.ctx.stroke();
        break;
      
      case 'crystal':
        // Crystal formation
        const crystalColors = ['#ff00ff', '#aa00ff', '#ff44ff'];
        for (let i = 0; i < 3; i++) {
          const cHeight = 20 + i * 10;
          const cOffset = (i - 1) * 8;
          const crystalGrad = this.ctx.createLinearGradient(x + cOffset, groundY, x + cOffset, groundY - cHeight);
          crystalGrad.addColorStop(0, crystalColors[i]);
          crystalGrad.addColorStop(0.5, '#ffffff');
          crystalGrad.addColorStop(1, crystalColors[i]);
          this.ctx.fillStyle = crystalGrad;
          this.ctx.beginPath();
          this.ctx.moveTo(x + cOffset - 4, groundY);
          this.ctx.lineTo(x + cOffset, groundY - cHeight);
          this.ctx.lineTo(x + cOffset + 4, groundY);
          this.ctx.closePath();
          this.ctx.fill();
        }
        
        // Crystal glow
        const crystGlow = Math.sin(this.time * 3) * 0.3 + 0.7;
        this.ctx.shadowColor = '#ff00ff';
        this.ctx.shadowBlur = 15 * crystGlow;
        break;
      
      case 'rock':
        // Natural rock formation
        const rockGrad = this.ctx.createLinearGradient(x - 12, groundY - 25, x + 12, groundY);
        rockGrad.addColorStop(0, '#4a4a4a');
        rockGrad.addColorStop(0.5, '#5a5a5a');
        rockGrad.addColorStop(1, '#3a3a3a');
        this.ctx.fillStyle = rockGrad;
        this.ctx.beginPath();
        this.ctx.moveTo(x - 12, groundY);
        this.ctx.lineTo(x - 8, groundY - 15);
        this.ctx.lineTo(x - 3, groundY - 25);
        this.ctx.lineTo(x + 5, groundY - 20);
        this.ctx.lineTo(x + 12, groundY - 10);
        this.ctx.lineTo(x + 10, groundY);
        this.ctx.closePath();
        this.ctx.fill();
        break;
      
      case 'spire':
        // Tall alien spire
        const spireGrad = this.ctx.createLinearGradient(x, groundY, x, groundY - 70);
        spireGrad.addColorStop(0, '#2a1a4a');
        spireGrad.addColorStop(0.5, '#4a2a6a');
        spireGrad.addColorStop(1, '#6a3a8a');
        this.ctx.fillStyle = spireGrad;
        this.ctx.beginPath();
        this.ctx.moveTo(x - 8, groundY);
        this.ctx.quadraticCurveTo(x - 10, groundY - 35, x, groundY - 70);
        this.ctx.quadraticCurveTo(x + 10, groundY - 35, x + 8, groundY);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Glowing orb at top
        const orbGlow = Math.sin(this.time * 2) * 0.3 + 0.7;
        this.ctx.shadowColor = '#aa00ff';
        this.ctx.shadowBlur = 12 * orbGlow;
        this.ctx.fillStyle = `rgba(170, 0, 255, ${orbGlow})`;
        this.ctx.beginPath();
        this.ctx.arc(x, groundY - 72, 5, 0, Math.PI * 2);
        this.ctx.fill();
        break;
        
      case 'dome':
        // Sci-fi dome structure
        const domeGrad = this.ctx.createRadialGradient(x, groundY - 20, 5, x, groundY - 20, 25);
        domeGrad.addColorStop(0, 'rgba(100, 200, 255, 0.8)');
        domeGrad.addColorStop(0.7, 'rgba(50, 150, 200, 0.6)');
        domeGrad.addColorStop(1, 'rgba(30, 100, 150, 0.4)');
        this.ctx.fillStyle = domeGrad;
        this.ctx.beginPath();
        this.ctx.arc(x, groundY, 25, Math.PI, 0);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Dome frame
        this.ctx.strokeStyle = '#88ddff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, groundY, 25, Math.PI, 0);
        this.ctx.stroke();
        break;
      
      case 'antenna':
        // Large antenna array
        this.ctx.fillStyle = '#3a4a5a';
        this.ctx.fillRect(x - 3, groundY - 60, 6, 60);
        
        // Dish
        this.ctx.fillStyle = '#5a6a7a';
        this.ctx.beginPath();
        this.ctx.ellipse(x, groundY - 50, 15, 8, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Signal waves
        const signalPulse = (this.time * 2) % 1;
        for (let i = 0; i < 3; i++) {
          const waveAlpha = Math.max(0, 0.5 - ((signalPulse + i * 0.3) % 1) * 0.6);
          const waveSize = 10 + ((signalPulse + i * 0.3) % 1) * 30;
          this.ctx.strokeStyle = `rgba(0, 255, 255, ${waveAlpha})`;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.arc(x + 15, groundY - 50, waveSize, -0.3, 0.3);
          this.ctx.stroke();
        }
        break;
    }
    
    this.ctx.restore();
  }

  renderPlayer(player: Player, scrollOffset: number, skinColors: ShipSkinColors = DEFAULT_SHIP_COLORS, megaShipId?: string): void {
    const x = player.x - scrollOffset;
    const y = player.y;
    const time = Date.now() * 0.003;

    // Skip rendering if invulnerable (flicker effect)
    if (player.invulnerable && Math.floor(player.invulnerableTimer / 4) % 2 === 0) {
      return;
    }

    this.ctx.save();

    // Get the active mega ship for trail colors
    const activeShipId = megaShipId || getStoredMegaShipId();
    const megaShip = getMegaShipById(activeShipId);
    const trailColor = megaShip.colors.glow;

    // Enhanced trail with gradient using ship's glow color
    player.trail.forEach((point, i) => {
      const trailX = point.x - scrollOffset;
      const alpha = point.alpha * 0.7;
      const size = 3 + (1 - i / player.trail.length) * 4;
      
      // Parse hex color to rgba
      const hex = trailColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      const trailGrad = this.ctx.createRadialGradient(trailX, point.y, 0, trailX, point.y, size * 2);
      trailGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
      trailGrad.addColorStop(0.5, `rgba(${r * 0.7}, ${g * 0.7}, ${b * 0.7}, ${alpha * 0.5})`);
      trailGrad.addColorStop(1, 'transparent');
      
      this.ctx.beginPath();
      this.ctx.arc(trailX, point.y, size * 2, 0, Math.PI * 2);
      this.ctx.fillStyle = trailGrad;
      this.ctx.fill();
    });

    // Enhanced shield effect using ship's glow color
    if (player.hasShield) {
      const shieldPulse = Math.sin(time * 2) * 0.3 + 0.7;
      const hex = megaShip.colors.glow.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.4 * shieldPulse})`;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.ellipse(x + player.width / 2, y + player.height / 2, 42, 16, 0, 0, Math.PI * 2);
      this.ctx.stroke();
      
      const shieldGrad = this.ctx.createRadialGradient(
        x + player.width / 2, y + player.height / 2, 0,
        x + player.width / 2, y + player.height / 2, 40
      );
      shieldGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
      shieldGrad.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${0.1 * shieldPulse})`);
      shieldGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${0.35 * shieldPulse})`);
      this.ctx.fillStyle = shieldGrad;
      this.ctx.beginPath();
      this.ctx.ellipse(x + player.width / 2, y + player.height / 2, 40, 14, 0, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Force field effect - neon blue halo
    if (player.hasForceField) {
      const ffPulse = Math.sin(time * 4) * 0.3 + 0.7;
      
      // Outer neon blue glow
      this.ctx.shadowColor = '#00aaff';
      this.ctx.shadowBlur = 25 * ffPulse;
      this.ctx.strokeStyle = `rgba(0, 170, 255, ${0.7 * ffPulse})`;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.ellipse(x + player.width / 2, y + player.height / 2, 45, 18, 0, 0, Math.PI * 2);
      this.ctx.stroke();
      
      // Inner pulsing halo
      this.ctx.strokeStyle = `rgba(136, 221, 255, ${0.5 * ffPulse})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.ellipse(x + player.width / 2, y + player.height / 2, 42, 16, 0, 0, Math.PI * 2);
      this.ctx.stroke();
      
      // Electric arc particles around the field
      for (let i = 0; i < 6; i++) {
        const arcAngle = time * 3 + i * Math.PI / 3;
        const arcX = x + player.width / 2 + Math.cos(arcAngle) * 43;
        const arcY = y + player.height / 2 + Math.sin(arcAngle) * 17;
        this.ctx.fillStyle = `rgba(200, 240, 255, ${0.8 * ffPulse})`;
        this.ctx.beginPath();
        this.ctx.arc(arcX, arcY, 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      this.ctx.shadowBlur = 0;
    }

    const centerX = x + player.width / 2;
    const centerY = y + player.height / 2;

    // Draw the selected mega ship with skin colors + current upgrades
    const upgradeState = getStoredUpgrades();
    drawMegaShip(this.ctx, centerX, centerY, activeShipId, time, skinColors, upgradeState);

    // Weapon glow when triple shot active
    if (player.hasTripleShot) {
      const time2 = Date.now() * 0.003;
      const wpPulse = Math.sin(time2 * 5) * 0.3 + 0.7;
      this.ctx.shadowColor = '#ff00ff';
      this.ctx.shadowBlur = 10 * wpPulse;
      this.ctx.fillStyle = `rgba(255, 100, 255, ${wpPulse})`;
      this.ctx.beginPath();
      this.ctx.arc(centerX + 30, centerY - 2, 1.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(centerX + 30, centerY + 2, 1.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    // Homing missile indicator
    if (player.hasHomingMissiles) {
      const time2 = Date.now() * 0.003;
      const hmPulse = Math.sin(time2 * 4) * 0.3 + 0.7;
      this.ctx.shadowColor = '#ff8800';
      this.ctx.shadowBlur = 12;
      this.ctx.fillStyle = `rgba(255, 150, 0, ${hmPulse})`;
      this.ctx.beginPath();
      this.ctx.arc(centerX + 25, centerY, 3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    this.ctx.restore();
  }

  renderBullets(bullets: Bullet[], scrollOffset: number): void {
    bullets.forEach(bullet => {
      const x = bullet.x - scrollOffset;
      
      if (bullet.isPlayerBullet) {
        this.ctx.save();
        
        if (bullet.isHoming) {
          // Render homing missile with rocket-like appearance
          const cx = x + bullet.width / 2;
          const cy = bullet.y + bullet.height / 2;
          
          // Calculate angle from velocity for rotation
          const angle = Math.atan2(bullet.velocityY, bullet.velocityX);
          
          // Smoke trail - smaller and tighter
          this.ctx.save();
          const smokeLength = 20;
          const numPuffs = 5;
          for (let i = 0; i < numPuffs; i++) {
            const t = i / numPuffs;
            const smokeX = x - Math.cos(angle) * (smokeLength * t + 3);
            const smokeY = bullet.y + bullet.height / 2 - Math.sin(angle) * (smokeLength * t + 3);
            const puffSize = 1 + t * 2.5;
            const alpha = 0.35 * (1 - t);
            
            const offsetX = (Math.sin(Date.now() * 0.015 + i * 2) * 1.5) * t;
            const offsetY = (Math.cos(Date.now() * 0.015 + i * 3) * 1.5) * t;
            
            this.ctx.fillStyle = `rgba(180, 180, 180, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(smokeX + offsetX, smokeY + offsetY, puffSize, 0, Math.PI * 2);
            this.ctx.fill();
          }
          this.ctx.restore();
          
          this.ctx.translate(cx, cy);
          this.ctx.rotate(angle);
          
          // Rocket body dimensions - sleek and elongated
          const rocketLength = bullet.width * 1.8;
          const rocketWidth = bullet.height * 0.8;
          
          // Exhaust flame - bright and dynamic
          const exhaustLength = 6 + Math.random() * 3;
          const exhaustGrad = this.ctx.createLinearGradient(-rocketLength / 2, 0, -rocketLength / 2 - exhaustLength, 0);
          exhaustGrad.addColorStop(0, '#ffffff');
          exhaustGrad.addColorStop(0.15, '#ffffaa');
          exhaustGrad.addColorStop(0.4, '#ff8800');
          exhaustGrad.addColorStop(0.7, '#ff4400');
          exhaustGrad.addColorStop(1, 'transparent');
          
          this.ctx.fillStyle = exhaustGrad;
          this.ctx.beginPath();
          this.ctx.moveTo(-rocketLength / 2, 0);
          this.ctx.lineTo(-rocketLength / 2 - exhaustLength, -2);
          this.ctx.lineTo(-rocketLength / 2 - exhaustLength, 2);
          this.ctx.closePath();
          this.ctx.fill();
          
          // Rocket body - sleek metallic cylinder shape
          this.ctx.shadowColor = '#ff6600';
          this.ctx.shadowBlur = 6;
          
          // Main body gradient
          const bodyGrad = this.ctx.createLinearGradient(0, -rocketWidth / 2, 0, rocketWidth / 2);
          bodyGrad.addColorStop(0, '#999999');
          bodyGrad.addColorStop(0.2, '#eeeeee');
          bodyGrad.addColorStop(0.5, '#ffffff');
          bodyGrad.addColorStop(0.8, '#dddddd');
          bodyGrad.addColorStop(1, '#888888');
          
          this.ctx.fillStyle = bodyGrad;
          this.ctx.beginPath();
          // Pointed nose cone
          this.ctx.moveTo(rocketLength / 2 + 3, 0);
          this.ctx.lineTo(rocketLength / 2 - 2, -rocketWidth / 2);
          // Body
          this.ctx.lineTo(-rocketLength / 2 + 1, -rocketWidth / 2);
          this.ctx.lineTo(-rocketLength / 2 + 1, rocketWidth / 2);
          this.ctx.lineTo(rocketLength / 2 - 2, rocketWidth / 2);
          this.ctx.closePath();
          this.ctx.fill();
          
          // Red nose tip
          this.ctx.fillStyle = '#dd2200';
          this.ctx.beginPath();
          this.ctx.moveTo(rocketLength / 2 + 3, 0);
          this.ctx.lineTo(rocketLength / 2 - 1, -rocketWidth / 2 + 0.5);
          this.ctx.lineTo(rocketLength / 2 - 1, rocketWidth / 2 - 0.5);
          this.ctx.closePath();
          this.ctx.fill();
          
          // Tail fins - small and angular
          this.ctx.fillStyle = '#cc3300';
          // Top fin
          this.ctx.beginPath();
          this.ctx.moveTo(-rocketLength / 2 + 2, -rocketWidth / 2);
          this.ctx.lineTo(-rocketLength / 2 - 1, -rocketWidth / 2 - 2);
          this.ctx.lineTo(-rocketLength / 2, -rocketWidth / 2);
          this.ctx.closePath();
          this.ctx.fill();
          // Bottom fin
          this.ctx.beginPath();
          this.ctx.moveTo(-rocketLength / 2 + 2, rocketWidth / 2);
          this.ctx.lineTo(-rocketLength / 2 - 1, rocketWidth / 2 + 2);
          this.ctx.lineTo(-rocketLength / 2, rocketWidth / 2);
          this.ctx.closePath();
          this.ctx.fill();
          
          this.ctx.shadowBlur = 0;
        } else {
          // Enhanced player bullet with glow trail
          const gradient = this.ctx.createLinearGradient(x - 10, bullet.y, x + bullet.width, bullet.y);
          gradient.addColorStop(0, 'transparent');
          gradient.addColorStop(0.3, 'rgba(0, 255, 255, 0.3)');
          gradient.addColorStop(0.7, '#00ffff');
          gradient.addColorStop(1, '#ffffff');
          
          this.ctx.shadowColor = '#00ffff';
          this.ctx.shadowBlur = 15;
          this.ctx.fillStyle = gradient;
          this.ctx.fillRect(x - 10, bullet.y - 1, bullet.width + 10, bullet.height + 2);
          
          // Bright core
          this.ctx.fillStyle = '#ffffff';
          this.ctx.fillRect(x + bullet.width - 4, bullet.y, 4, bullet.height);
        }
        
        this.ctx.restore();
      } else {
        // Enemy bullet with glow
        this.ctx.save();
        this.ctx.shadowColor = '#ff4444';
        this.ctx.shadowBlur = 8;
        this.ctx.fillStyle = '#ff6666';
        this.ctx.beginPath();
        this.ctx.arc(x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.width / 2 + 1, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#ffaaaa';
        this.ctx.beginPath();
        this.ctx.arc(x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.width / 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    });
  }

  renderBombs(bombs: Bomb[], scrollOffset: number): void {
    bombs.forEach(bomb => {
      const x = bomb.x - scrollOffset;
      
      this.ctx.save();
      
      // Bomb body with metallic gradient
      const bombGrad = this.ctx.createRadialGradient(
        x + bomb.width / 2 - 2, bomb.y + bomb.height / 2 - 2, 0,
        x + bomb.width / 2, bomb.y + bomb.height / 2, bomb.width / 2
      );
      bombGrad.addColorStop(0, '#ffcc00');
      bombGrad.addColorStop(0.5, '#ff8800');
      bombGrad.addColorStop(1, '#aa4400');
      this.ctx.fillStyle = bombGrad;
      this.ctx.beginPath();
      this.ctx.arc(x + bomb.width / 2, bomb.y + bomb.height / 2, bomb.width / 2 + 1, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Blinking light with glow
      const blinkOn = Math.floor(bomb.timer / 8) % 2 === 0;
      if (blinkOn) {
        this.ctx.shadowColor = '#ff0000';
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = '#ff0000';
      } else {
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#660000';
      }
      this.ctx.beginPath();
      this.ctx.arc(x + bomb.width / 2, bomb.y + bomb.height / 2, 2, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Falling trail
      this.ctx.shadowBlur = 0;
      const trailGrad = this.ctx.createLinearGradient(x + bomb.width / 2, bomb.y - 15, x + bomb.width / 2, bomb.y);
      trailGrad.addColorStop(0, 'transparent');
      trailGrad.addColorStop(1, 'rgba(255, 136, 0, 0.5)');
      this.ctx.strokeStyle = trailGrad;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(x + bomb.width / 2, bomb.y);
      this.ctx.lineTo(x + bomb.width / 2, bomb.y - 15);
      this.ctx.stroke();
      
      this.ctx.restore();
    });
  }

  renderEnemies(enemies: Enemy[], scrollOffset: number): void {
    enemies.forEach(enemy => {
      const x = enemy.x - scrollOffset;
      
      switch (enemy.type) {
        case 'turret':
          this.renderTurret(x, enemy.y, enemy);
          break;
        case 'drone':
          this.renderDrone(x, enemy.y, enemy);
          break;
        case 'leech':
          this.renderLeech(x, enemy.y, enemy);
          break;
        case 'missile':
          this.renderMissile(x, enemy.y, enemy);
          break;
        case 'hostilePerson':
          this.renderHostilePerson(x, enemy.y, enemy);
          break;
        case 'bomber':
          this.renderBomber(x, enemy.y, enemy);
          break;
        case 'sniper':
          this.renderSniper(x, enemy.y, enemy);
          break;
        case 'tank':
          this.renderTank(x, enemy.y, enemy);
          break;
        case 'jellyfish':
          this.renderJellyfish(x, enemy.y, enemy);
          break;
        case 'kraken':
          this.renderKraken(x, enemy.y, enemy);
          break;
        case 'seaMine':
          this.renderSeaMine(x, enemy.y, enemy);
          break;
        case 'gunboat':
          this.renderGunboat(x, enemy.y, enemy);
          break;
      }
      
      // Render electric shock effect if enemy was hit by electric pulse
      if (enemy.shockedTimer && enemy.shockedTimer > 0) {
        this.renderShockEffect(x, enemy.y, enemy);
      }
    });
  }

  private renderShockEffect(x: number, y: number, enemy: Enemy): void {
    this.ctx.save();
    
    const cx = x + enemy.width / 2;
    const cy = y + enemy.height / 2;
    const time = Date.now() * 0.01;
    const intensity = Math.min(1, (enemy.shockedTimer || 0) / 30); // Fade out effect
    
    // Electric glow around enemy
    this.ctx.shadowColor = '#00ffff';
    this.ctx.shadowBlur = 15 * intensity;
    
    // Draw 4-6 random lightning bolts around the enemy
    const numBolts = 4 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numBolts; i++) {
      const angle = (i / numBolts) * Math.PI * 2 + time + Math.random() * 0.5;
      const startRadius = Math.max(enemy.width, enemy.height) / 2 + 2;
      const endRadius = startRadius + 8 + Math.random() * 12;
      
      // Start point on enemy edge
      const startX = cx + Math.cos(angle) * startRadius;
      const startY = cy + Math.sin(angle) * startRadius;
      
      // End point further out
      const endX = cx + Math.cos(angle) * endRadius;
      const endY = cy + Math.sin(angle) * endRadius;
      
      // Draw jagged lightning bolt
      this.ctx.strokeStyle = `rgba(0, 255, 255, ${0.6 * intensity + Math.random() * 0.4})`;
      this.ctx.lineWidth = 1 + Math.random();
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      
      // Add 2-3 segments with random offsets for jagged look
      const segments = 2 + Math.floor(Math.random() * 2);
      for (let j = 1; j <= segments; j++) {
        const t = j / (segments + 1);
        const midX = startX + (endX - startX) * t;
        const midY = startY + (endY - startY) * t;
        // Perpendicular offset for zigzag
        const perpX = -(endY - startY) / endRadius;
        const perpY = (endX - startX) / endRadius;
        const offset = (Math.random() - 0.5) * 8;
        this.ctx.lineTo(midX + perpX * offset, midY + perpY * offset);
      }
      
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
      
      // Small spark at end
      if (Math.random() > 0.5) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * intensity})`;
        this.ctx.beginPath();
        this.ctx.arc(endX, endY, 1.5, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
    
    // Occasional bright flash
    if (Math.random() > 0.85) {
      this.ctx.fillStyle = `rgba(0, 255, 255, ${0.15 * intensity})`;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, Math.max(enemy.width, enemy.height) / 2 + 5, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.restore();
  }

  private renderTurret(x: number, y: number, enemy: Enemy): void {
    this.ctx.save();
    
    const aimAngle = enemy.aimAngle ?? 0;
    const centerX = x + enemy.width / 2;
    const centerY = y + 14;
    const time = Date.now() * 0.003;
    
    // Ground shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.beginPath();
    this.ctx.ellipse(centerX + 4, y + 36, 20, 6, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Heavy armored base with metallic panels
    const baseGrad = this.ctx.createLinearGradient(x - 4, y + 22, x + enemy.width + 4, y + 34);
    baseGrad.addColorStop(0, '#1a1a28');
    baseGrad.addColorStop(0.2, '#3a3a50');
    baseGrad.addColorStop(0.4, '#5a5a70');
    baseGrad.addColorStop(0.6, '#4a4a60');
    baseGrad.addColorStop(0.8, '#3a3a50');
    baseGrad.addColorStop(1, '#1a1a28');
    this.ctx.fillStyle = baseGrad;
    this.ctx.fillRect(x - 4, y + 22, enemy.width + 8, 14);
    
    // Base panel lines
    this.ctx.strokeStyle = 'rgba(100, 100, 140, 0.5)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x + 2 + i * 12, y + 24);
      this.ctx.lineTo(x + 2 + i * 12, y + 34);
      this.ctx.stroke();
    }
    
    // Armored dome with red/crimson gradient
    this.ctx.shadowColor = '#ff4444';
    this.ctx.shadowBlur = 18;
    const domeGrad = this.ctx.createRadialGradient(
      centerX - 5, centerY - 10, 0,
      centerX, centerY, 20
    );
    domeGrad.addColorStop(0, '#ff9999');
    domeGrad.addColorStop(0.25, '#dd5555');
    domeGrad.addColorStop(0.5, '#bb3333');
    domeGrad.addColorStop(0.75, '#881111');
    domeGrad.addColorStop(1, '#440000');
    this.ctx.fillStyle = domeGrad;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 18, Math.PI, 0);
    this.ctx.fill();
    
    // Dome armor rings
    this.ctx.shadowBlur = 0;
    this.ctx.strokeStyle = 'rgba(255, 150, 150, 0.4)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 14, Math.PI * 1.1, -Math.PI * 0.1);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 10, Math.PI * 1.15, -Math.PI * 0.15);
    this.ctx.stroke();
    
    // Glowing eye sensor
    const eyePulse = Math.sin(time * 4) * 0.3 + 0.7;
    this.ctx.shadowColor = '#ffff00';
    this.ctx.shadowBlur = 12 * eyePulse;
    const eyeGrad = this.ctx.createRadialGradient(centerX, centerY - 6, 0, centerX, centerY - 6, 6);
    eyeGrad.addColorStop(0, '#ffffff');
    eyeGrad.addColorStop(0.3, '#ffff88');
    eyeGrad.addColorStop(0.6, '#ffaa00');
    eyeGrad.addColorStop(1, '#ff4400');
    this.ctx.fillStyle = eyeGrad;
    this.ctx.beginPath();
    this.ctx.ellipse(centerX, centerY - 6, 5, 4, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Eye pupil
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = '#220000';
    this.ctx.beginPath();
    this.ctx.ellipse(centerX + Math.cos(aimAngle) * 2, centerY - 6 + Math.sin(aimAngle) * 1.5, 2, 2, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Rotating gun barrel assembly
    this.ctx.save();
    this.ctx.translate(centerX, y + 6);
    this.ctx.rotate(aimAngle);
    
    // Barrel housing
    const housingGrad = this.ctx.createLinearGradient(-4, -6, -4, 6);
    housingGrad.addColorStop(0, '#555568');
    housingGrad.addColorStop(0.5, '#777790');
    housingGrad.addColorStop(1, '#444458');
    this.ctx.fillStyle = housingGrad;
    this.ctx.fillRect(-4, -5, 10, 10);
    
    // Main barrel with metallic sheen
    const barrelGrad = this.ctx.createLinearGradient(0, -5, 28, 5);
    barrelGrad.addColorStop(0, '#444450');
    barrelGrad.addColorStop(0.2, '#777788');
    barrelGrad.addColorStop(0.4, '#999999');
    barrelGrad.addColorStop(0.6, '#777788');
    barrelGrad.addColorStop(1, '#555560');
    this.ctx.fillStyle = barrelGrad;
    this.ctx.fillRect(4, -4.5, 26, 9);
    
    // Barrel cooling rings
    this.ctx.fillStyle = '#333340';
    for (let i = 0; i < 4; i++) {
      this.ctx.fillRect(8 + i * 6, -5.5, 2, 11);
    }
    
    // Muzzle with energy glow
    const muzzlePulse = Math.sin(time * 6) * 0.3 + 0.7;
    this.ctx.shadowColor = '#ff6600';
    this.ctx.shadowBlur = 15 * muzzlePulse;
    this.ctx.fillStyle = `rgba(255, 100, 50, ${muzzlePulse})`;
    this.ctx.beginPath();
    this.ctx.arc(28, 0, 5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(28, 0, 2.5, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
    this.ctx.restore();
  }

  private renderDrone(x: number, y: number, enemy: Enemy): void {
    this.ctx.save();
    const time = Date.now() * 0.003;
    const hover = Math.sin(time * 4) * 2;
    
    // Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    this.ctx.beginPath();
    this.ctx.ellipse(x + enemy.width / 2, enemy.y + enemy.height + 12, 14, 5, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    const cy = y + hover;
    const cx = x + enemy.width / 2;
    
    // Alien drone with spider-like appearance
    this.ctx.shadowColor = '#aa44ff';
    this.ctx.shadowBlur = 22;
    
    // Main body - alien organic with metallic
    const bodyGrad = this.ctx.createRadialGradient(
      cx - 4, cy + enemy.height / 2 - 4, 0,
      cx, cy + enemy.height / 2, enemy.width / 2 + 6
    );
    bodyGrad.addColorStop(0, '#ee88ff');
    bodyGrad.addColorStop(0.2, '#cc55ee');
    bodyGrad.addColorStop(0.5, '#9933bb');
    bodyGrad.addColorStop(0.8, '#551188');
    bodyGrad.addColorStop(1, '#220044');
    
    this.ctx.fillStyle = bodyGrad;
    // Diamond body shape
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - 2);
    this.ctx.quadraticCurveTo(cx + enemy.width / 2 + 4, cy + enemy.height / 3, cx + enemy.width / 2 + 2, cy + enemy.height / 2);
    this.ctx.quadraticCurveTo(cx + enemy.width / 2 + 4, cy + enemy.height * 0.67, cx, cy + enemy.height + 2);
    this.ctx.quadraticCurveTo(cx - enemy.width / 2 - 4, cy + enemy.height * 0.67, cx - enemy.width / 2 - 2, cy + enemy.height / 2);
    this.ctx.quadraticCurveTo(cx - enemy.width / 2 - 4, cy + enemy.height / 3, cx, cy - 2);
    this.ctx.fill();
    
    // Armor plating detail
    this.ctx.shadowBlur = 0;
    this.ctx.strokeStyle = 'rgba(200, 100, 255, 0.5)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy + 3);
    this.ctx.lineTo(cx + enemy.width / 2 - 2, cy + enemy.height / 2);
    this.ctx.lineTo(cx, cy + enemy.height - 3);
    this.ctx.lineTo(cx - enemy.width / 2 + 2, cy + enemy.height / 2);
    this.ctx.closePath();
    this.ctx.stroke();
    
    // Antenna spikes
    for (let i = -1; i <= 1; i += 2) {
      const spikeX = cx + i * 8;
      this.ctx.fillStyle = '#9944cc';
      this.ctx.beginPath();
      this.ctx.moveTo(spikeX, cy + 4);
      this.ctx.lineTo(spikeX + i * 4, cy - 6);
      this.ctx.lineTo(spikeX + i * 2, cy + 2);
      this.ctx.closePath();
      this.ctx.fill();
    }
    
    // Central glowing eye - menacing
    const eyePulse = Math.sin(time * 3) * 0.3 + 0.7;
    const eyeGrad = this.ctx.createRadialGradient(
      cx, cy + enemy.height / 2, 0,
      cx, cy + enemy.height / 2, 9
    );
    eyeGrad.addColorStop(0, '#ffffff');
    eyeGrad.addColorStop(0.2, '#ffff88');
    eyeGrad.addColorStop(0.5, '#ffaa00');
    eyeGrad.addColorStop(0.8, '#ff4400');
    eyeGrad.addColorStop(1, '#880000');
    
    this.ctx.shadowColor = '#ff8800';
    this.ctx.shadowBlur = 18 * eyePulse;
    this.ctx.fillStyle = eyeGrad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy + enemy.height / 2, 8, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Eye inner ring
    this.ctx.strokeStyle = 'rgba(255, 200, 100, 0.6)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy + enemy.height / 2, 5, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // Dark pupil
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = '#110000';
    this.ctx.beginPath();
    this.ctx.arc(cx + Math.sin(time * 2) * 2, cy + enemy.height / 2, 3, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Orbiting energy particles
    for (let i = 0; i < 5; i++) {
      const angle = time * 2 + i * Math.PI * 0.4;
      const dist = 16 + Math.sin(time * 3 + i) * 3;
      const px = cx + Math.cos(angle) * dist;
      const py = cy + enemy.height / 2 + Math.sin(angle) * dist * 0.6;
      const pAlpha = 0.6 + Math.sin(time * 5 + i) * 0.3;
      this.ctx.fillStyle = `rgba(200, 100, 255, ${pAlpha})`;
      this.ctx.beginPath();
      this.ctx.arc(px, py, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.restore();
  }

  private renderLeech(x: number, y: number, enemy: Enemy): void {
    this.ctx.save();
    const time = Date.now() * 0.005;
    const cx = x + enemy.width / 2;
    const cy = y + enemy.height / 2;
    
    // Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    this.ctx.beginPath();
    this.ctx.ellipse(cx, y + enemy.height + 10, 12, 4, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Alien creature body with bioluminescent pulsing
    const pulse = Math.sin(time * 2) * 0.25 + 0.75;
    const bodyGrad = this.ctx.createRadialGradient(
      cx - 4, cy - 4, 0,
      cx, cy, enemy.width / 2 + 6
    );
    bodyGrad.addColorStop(0, `rgba(150, 255, 200, ${pulse})`);
    bodyGrad.addColorStop(0.25, '#66ee99');
    bodyGrad.addColorStop(0.5, '#33bb66');
    bodyGrad.addColorStop(0.75, '#118844');
    bodyGrad.addColorStop(1, '#004422');
    
    this.ctx.shadowColor = '#00ff88';
    this.ctx.shadowBlur = 20 * pulse;
    this.ctx.fillStyle = bodyGrad;
    
    // Organic blob shape
    this.ctx.beginPath();
    this.ctx.moveTo(cx, y - 2);
    for (let i = 0; i <= 8; i++) {
      const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const wobble = Math.sin(time * 3 + i) * 2;
      const rx = (enemy.width / 2 + 3 + wobble) * (i % 2 === 0 ? 1 : 0.85);
      const ry = (enemy.height / 2 + wobble * 0.5);
      const px = cx + Math.cos(angle) * rx;
      const py = cy + Math.sin(angle) * ry * 0.7;
      if (i === 0) this.ctx.moveTo(px, py);
      else this.ctx.lineTo(px, py);
    }
    this.ctx.closePath();
    this.ctx.fill();
    
    // Internal membrane pattern
    this.ctx.shadowBlur = 0;
    this.ctx.strokeStyle = 'rgba(100, 255, 180, 0.4)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const scale = 0.4 + i * 0.2;
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy, enemy.width / 2 * scale, enemy.height / 3 * scale, 0, 0, Math.PI * 2);
      this.ctx.stroke();
    }
    
    // Multiple glowing red eyes
    const eyePositions = [
      { x: -5, y: -3 }, { x: 5, y: -3 }, { x: 0, y: 2 }
    ];
    eyePositions.forEach((pos, i) => {
      const eyePulse = Math.sin(time * 4 + i) * 0.3 + 0.7;
      this.ctx.shadowColor = '#ff0000';
      this.ctx.shadowBlur = 8 * eyePulse;
      this.ctx.fillStyle = `rgba(255, 100, 100, ${eyePulse})`;
      this.ctx.beginPath();
      this.ctx.arc(cx + pos.x, cy + pos.y, 3, 0, Math.PI * 2);
      this.ctx.fill();
      // Eye shine
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(cx + pos.x - 1, cy + pos.y - 1, 1, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    // Animated tendrils - all originating from center bottom of body
    this.ctx.shadowBlur = 0;
    const numTendrils = 5;
    for (let i = 0; i < numTendrils; i++) {
      const wave = Math.sin(time * 3 + i * 1.3) * 12;
      // All tendrils start from the center bottom of the body
      const startX = cx;
      const startY = cy + enemy.height / 3;
      // Spread outward as they go down
      const spreadAngle = ((i - (numTendrils - 1) / 2) / numTendrils) * 1.2;
      const endX = cx + spreadAngle * 25 + wave * 0.5;
      const endY = y + enemy.height + 28;
      
      const tendrilGrad = this.ctx.createLinearGradient(
        startX, startY,
        endX, endY
      );
      tendrilGrad.addColorStop(0, '#00ff88');
      tendrilGrad.addColorStop(0.5, '#00aa55');
      tendrilGrad.addColorStop(1, 'rgba(0, 80, 40, 0)');
      
      this.ctx.strokeStyle = tendrilGrad;
      this.ctx.lineWidth = 3.5 - Math.abs(i - 2) * 0.4;
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.bezierCurveTo(
        startX + spreadAngle * 10 + wave * 0.3, startY + 12,
        endX + wave * 0.5, endY - 12,
        endX + wave * 0.2, endY
      );
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  private renderMissile(x: number, y: number, enemy: Enemy): void {
    this.ctx.save();
    const time = Date.now() * 0.003;
    const cx = x + enemy.width / 2;
    const cy = y + enemy.height / 2;
    
    // Missile body with detailed metallic gradient
    const bodyGrad = this.ctx.createLinearGradient(x, y, x + enemy.width, y + enemy.height);
    bodyGrad.addColorStop(0, '#aaaaaa');
    bodyGrad.addColorStop(0.2, '#dddddd');
    bodyGrad.addColorStop(0.4, '#ffffff');
    bodyGrad.addColorStop(0.6, '#cccccc');
    bodyGrad.addColorStop(1, '#888888');
    
    this.ctx.fillStyle = bodyGrad;
    this.ctx.beginPath();
    this.ctx.moveTo(x + enemy.width + 4, cy);
    this.ctx.lineTo(x + enemy.width - 6, y);
    this.ctx.lineTo(x + 2, y + 3);
    this.ctx.lineTo(x + 2, y + enemy.height - 3);
    this.ctx.lineTo(x + enemy.width - 6, y + enemy.height);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Red nose cone
    const noseGrad = this.ctx.createLinearGradient(x + enemy.width - 4, cy, x + enemy.width + 4, cy);
    noseGrad.addColorStop(0, '#ff4444');
    noseGrad.addColorStop(0.5, '#cc2222');
    noseGrad.addColorStop(1, '#881111');
    this.ctx.fillStyle = noseGrad;
    this.ctx.beginPath();
    this.ctx.moveTo(x + enemy.width + 4, cy);
    this.ctx.lineTo(x + enemy.width - 4, cy - 3);
    this.ctx.lineTo(x + enemy.width - 4, cy + 3);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Fins with red accents
    this.ctx.fillStyle = '#cc3333';
    this.ctx.beginPath();
    this.ctx.moveTo(x + 6, y);
    this.ctx.lineTo(x + 2, y - 5);
    this.ctx.lineTo(x + 2, y);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.moveTo(x + 6, y + enemy.height);
    this.ctx.lineTo(x + 2, y + enemy.height + 5);
    this.ctx.lineTo(x + 2, y + enemy.height);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Body stripe
    this.ctx.fillStyle = '#dd4444';
    this.ctx.fillRect(x + enemy.width / 2 - 2, y + 2, 4, enemy.height - 4);
    
    // Enhanced exhaust
    const exhaustLength = 18 + Math.random() * 10;
    const exhaustGrad = this.ctx.createLinearGradient(x + 2, cy, x - exhaustLength, cy);
    exhaustGrad.addColorStop(0, '#ffffff');
    exhaustGrad.addColorStop(0.15, '#ffff88');
    exhaustGrad.addColorStop(0.35, '#ffaa00');
    exhaustGrad.addColorStop(0.6, '#ff4400');
    exhaustGrad.addColorStop(1, 'transparent');
    
    this.ctx.shadowColor = '#ff6600';
    this.ctx.shadowBlur = 18;
    this.ctx.fillStyle = exhaustGrad;
    this.ctx.beginPath();
    this.ctx.moveTo(x + 2, cy - 3);
    this.ctx.quadraticCurveTo(x - exhaustLength * 0.6, cy - 5, x - exhaustLength, cy);
    this.ctx.quadraticCurveTo(x - exhaustLength * 0.6, cy + 5, x + 2, cy + 3);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.restore();
  }

  private renderHostilePerson(x: number, y: number, enemy: Enemy): void {
    this.ctx.save();
    const time = Date.now() * 0.003;
    const cx = x + enemy.width / 2;
    
    // Robot enemy soldier
    this.ctx.shadowColor = '#ff4444';
    this.ctx.shadowBlur = 10;
    
    // Head - robotic with visor
    const headGrad = this.ctx.createRadialGradient(cx - 1, y + 2, 0, cx, y + 3, 5);
    headGrad.addColorStop(0, '#888899');
    headGrad.addColorStop(0.5, '#666677');
    headGrad.addColorStop(1, '#444455');
    this.ctx.fillStyle = headGrad;
    this.ctx.beginPath();
    this.ctx.arc(cx, y + 3, 4, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Red visor eye
    const eyePulse = Math.sin(time * 4) * 0.3 + 0.7;
    this.ctx.fillStyle = `rgba(255, 50, 50, ${eyePulse})`;
    this.ctx.fillRect(cx - 3, y + 2, 6, 2);
    
    // Armored body
    const bodyGrad = this.ctx.createLinearGradient(x, y + 6, x + enemy.width, y + 13);
    bodyGrad.addColorStop(0, '#aa3333');
    bodyGrad.addColorStop(0.5, '#cc4444');
    bodyGrad.addColorStop(1, '#882222');
    this.ctx.fillStyle = bodyGrad;
    this.ctx.fillRect(x, y + 6, enemy.width, 7);
    
    // Chest plate detail
    this.ctx.fillStyle = '#993333';
    this.ctx.fillRect(x + 2, y + 7, enemy.width - 4, 2);
    
    // Gun arm with weapon
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = '#555566';
    this.ctx.beginPath();
    this.ctx.moveTo(x - 1, y + 7);
    this.ctx.lineTo(x - 8, y + 6);
    this.ctx.lineTo(x - 8, y + 8);
    this.ctx.lineTo(x - 1, y + 9);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Gun barrel
    this.ctx.fillStyle = '#333344';
    this.ctx.fillRect(x - 12, y + 6, 5, 2);
    
    // Muzzle flash
    if (enemy.fireTimer < 5) {
      this.ctx.shadowColor = '#ffff00';
      this.ctx.shadowBlur = 18;
      this.ctx.fillStyle = '#ffff88';
      this.ctx.beginPath();
      this.ctx.arc(x - 14, y + 7, 4, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    // Legs
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = '#553333';
    this.ctx.fillRect(x + 1, y + 13, 2, 4);
    this.ctx.fillRect(x + 4, y + 13, 2, 4);
    
    this.ctx.restore();
  }

  private renderBomber(x: number, y: number, enemy: Enemy): void {
    this.ctx.save();
    const time = Date.now() * 0.003;
    const cx = x + enemy.width / 2;
    const cy = y + enemy.height / 2;
    
    // Heavy bomber with orange/red scheme
    this.ctx.shadowColor = '#ff6600';
    this.ctx.shadowBlur = 14;
    
    // Main fuselage
    const bodyGrad = this.ctx.createRadialGradient(
      cx - 4, cy - 3, 0,
      cx, cy, enemy.width / 2 + 4
    );
    bodyGrad.addColorStop(0, '#ffcc88');
    bodyGrad.addColorStop(0.3, '#ff9944');
    bodyGrad.addColorStop(0.6, '#dd6622');
    bodyGrad.addColorStop(1, '#883300');
    
    this.ctx.fillStyle = bodyGrad;
    this.ctx.beginPath();
    this.ctx.ellipse(cx, cy, enemy.width / 2 + 3, enemy.height / 2 + 1, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Wing structures
    this.ctx.shadowBlur = 0;
    const wingGrad = this.ctx.createLinearGradient(x - 2, y - 2, x + enemy.width + 2, y + 2);
    wingGrad.addColorStop(0, '#774411');
    wingGrad.addColorStop(0.5, '#995522');
    wingGrad.addColorStop(1, '#663300');
    this.ctx.fillStyle = wingGrad;
    
    // Top wing
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + 1);
    this.ctx.lineTo(x - 4, y - 4);
    this.ctx.lineTo(x + enemy.width + 4, y - 2);
    this.ctx.lineTo(x + enemy.width, y + 3);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Bottom wing
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + enemy.height - 1);
    this.ctx.lineTo(x - 4, y + enemy.height + 4);
    this.ctx.lineTo(x + enemy.width + 4, y + enemy.height + 2);
    this.ctx.lineTo(x + enemy.width, y + enemy.height - 3);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Cockpit
    const cockpitGrad = this.ctx.createRadialGradient(cx + 4, cy, 0, cx + 4, cy, 5);
    cockpitGrad.addColorStop(0, '#88ddff');
    cockpitGrad.addColorStop(0.5, '#44aadd');
    cockpitGrad.addColorStop(1, '#226699');
    this.ctx.fillStyle = cockpitGrad;
    this.ctx.beginPath();
    this.ctx.ellipse(cx + 4, cy, 4, 3, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Engine glow
    const engPulse = Math.sin(time * 4) * 0.3 + 0.7;
    this.ctx.shadowColor = '#ff4400';
    this.ctx.shadowBlur = 12 * engPulse;
    this.ctx.fillStyle = `rgba(255, 100, 50, ${engPulse})`;
    this.ctx.beginPath();
    this.ctx.arc(x - 2, cy, 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#ffcc00';
    this.ctx.beginPath();
    this.ctx.arc(x - 2, cy, 2, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }

  private renderSniper(x: number, y: number, enemy: Enemy): void {
    this.ctx.save();
    const time = Date.now() * 0.003;
    const aimAngle = enemy.aimAngle ?? 0;
    const cx = x + enemy.width / 2;
    const cy = y + enemy.height - 8;
    
    // Ground turret base
    const baseGrad = this.ctx.createLinearGradient(x, y + enemy.height - 6, x + enemy.width, y + enemy.height);
    baseGrad.addColorStop(0, '#334433');
    baseGrad.addColorStop(0.5, '#556655');
    baseGrad.addColorStop(1, '#334433');
    this.ctx.fillStyle = baseGrad;
    this.ctx.fillRect(x + 1, y + enemy.height - 6, enemy.width - 2, 6);
    
    // Green targeting dome
    this.ctx.shadowColor = '#00ff44';
    this.ctx.shadowBlur = 14;
    const domeGrad = this.ctx.createRadialGradient(
      cx - 2, cy - 3, 0,
      cx, cy, 8
    );
    domeGrad.addColorStop(0, '#aaffaa');
    domeGrad.addColorStop(0.4, '#66dd66');
    domeGrad.addColorStop(0.7, '#33aa33');
    domeGrad.addColorStop(1, '#116611');
    this.ctx.fillStyle = domeGrad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 7, Math.PI, 0);
    this.ctx.fill();
    
    // Scope eye
    const eyePulse = Math.sin(time * 3) * 0.3 + 0.7;
    this.ctx.fillStyle = `rgba(0, 255, 0, ${eyePulse})`;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy - 3, 2.5, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Long precision barrel
    this.ctx.save();
    this.ctx.translate(cx, cy - 5);
    this.ctx.rotate(aimAngle);
    
    this.ctx.shadowBlur = 0;
    const barrelGrad = this.ctx.createLinearGradient(0, -2.5, 24, 2.5);
    barrelGrad.addColorStop(0, '#445544');
    barrelGrad.addColorStop(0.3, '#667766');
    barrelGrad.addColorStop(0.7, '#556655');
    barrelGrad.addColorStop(1, '#445544');
    this.ctx.fillStyle = barrelGrad;
    this.ctx.fillRect(0, -2, 24, 4);
    
    // Scope on barrel
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(8, -4, 6, 3);
    
    // Laser sight at tip
    this.ctx.shadowColor = '#00ff00';
    this.ctx.shadowBlur = 10 * eyePulse;
    this.ctx.fillStyle = '#00ff00';
    this.ctx.beginPath();
    this.ctx.arc(22, 0, 2, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
    this.ctx.restore();
  }

  private renderTank(x: number, y: number, enemy: Enemy): void {
    this.ctx.save();
    const time = Date.now() * 0.003;
    const aimAngle = enemy.aimAngle ?? 0;
    const cx = x + enemy.width / 2;
    const cy = y + 8;
    
    // Heavy tank body
    const bodyGrad = this.ctx.createLinearGradient(x - 2, y, x + enemy.width + 2, y + enemy.height);
    bodyGrad.addColorStop(0, '#4a5a4a');
    bodyGrad.addColorStop(0.2, '#6a7a6a');
    bodyGrad.addColorStop(0.5, '#5a6a5a');
    bodyGrad.addColorStop(0.8, '#4a5a4a');
    bodyGrad.addColorStop(1, '#3a4a3a');
    this.ctx.fillStyle = bodyGrad;
    this.ctx.fillRect(x - 2, y + 4, enemy.width + 4, enemy.height - 4);
    
    // Armor panel detail
    this.ctx.strokeStyle = 'rgba(100, 120, 100, 0.5)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x + 2, y + 6, enemy.width - 4, enemy.height - 8);
    
    // Heavy turret dome
    const turretGrad = this.ctx.createRadialGradient(
      cx - 3, cy - 4, 0,
      cx, cy, 10
    );
    turretGrad.addColorStop(0, '#7a8a7a');
    turretGrad.addColorStop(0.5, '#5a6a5a');
    turretGrad.addColorStop(1, '#3a4a3a');
    this.ctx.fillStyle = turretGrad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Turret ring detail
    this.ctx.strokeStyle = 'rgba(80, 100, 80, 0.6)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // Rotating heavy cannon
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(aimAngle);
    
    const cannonGrad = this.ctx.createLinearGradient(0, -3.5, 22, 3.5);
    cannonGrad.addColorStop(0, '#555560');
    cannonGrad.addColorStop(0.3, '#777780');
    cannonGrad.addColorStop(0.7, '#666670');
    cannonGrad.addColorStop(1, '#444450');
    this.ctx.fillStyle = cannonGrad;
    this.ctx.fillRect(0, -3.5, 22, 7);
    
    // Cannon rings
    this.ctx.fillStyle = '#333340';
    this.ctx.fillRect(5, -4, 2, 8);
    this.ctx.fillRect(12, -4, 2, 8);
    
    // Muzzle
    this.ctx.fillStyle = '#222230';
    this.ctx.beginPath();
    this.ctx.arc(22, 0, 4, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
    
    // Tank treads with animated segments
    this.ctx.fillStyle = '#222230';
    this.ctx.fillRect(x - 3, y + enemy.height - 5, enemy.width + 6, 5);
    
    // Tread segments animation
    const treadOffset = (time * 20) % 6;
    for (let i = 0; i < 7; i++) {
      this.ctx.fillStyle = '#333340';
      this.ctx.fillRect(x - 1 + i * 5 - treadOffset, y + enemy.height - 4, 3, 3);
    }
    
    this.ctx.restore();
  }

  private renderJellyfish(x: number, y: number, enemy: Enemy): void {
    this.ctx.save();
    const time = Date.now() * 0.004;
    const cx = x + enemy.width / 2;
    const cy = y + enemy.height / 2;
    const pulse = Math.sin(time * 2) * 0.2 + 0.8;
    
    // Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(cx, y + enemy.height + 15, 10, 4, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Glowing dome body
    this.ctx.shadowColor = '#ff44ff';
    this.ctx.shadowBlur = 20 * pulse;
    const domeGrad = this.ctx.createRadialGradient(
      cx - 2, y + 4, 0,
      cx, y + 8, enemy.width / 2 + 4
    );
    domeGrad.addColorStop(0, `rgba(255, 200, 255, ${pulse})`);
    domeGrad.addColorStop(0.3, '#ff88ff');
    domeGrad.addColorStop(0.6, '#cc44cc');
    domeGrad.addColorStop(1, '#662266');
    this.ctx.fillStyle = domeGrad;
    
    // Bell/dome shape
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + 10);
    this.ctx.quadraticCurveTo(x, y - 2, cx, y - 2);
    this.ctx.quadraticCurveTo(x + enemy.width, y - 2, x + enemy.width, y + 10);
    this.ctx.quadraticCurveTo(cx, y + 14, x, y + 10);
    this.ctx.fill();
    
    // Inner glow pattern
    this.ctx.shadowBlur = 0;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const arcY = y + 3 + i * 3;
      this.ctx.beginPath();
      this.ctx.arc(cx, arcY, enemy.width / 3 - i * 2, Math.PI * 0.2, Math.PI * 0.8);
      this.ctx.stroke();
    }
    
    // Flowing tentacles from center bottom
    const numTentacles = 6;
    for (let i = 0; i < numTentacles; i++) {
      const wave = Math.sin(time * 3 + i * 0.8) * 8;
      const wave2 = Math.cos(time * 2.5 + i * 1.2) * 5;
      const spreadAngle = ((i - (numTentacles - 1) / 2) / numTentacles) * 0.8;
      
      const startX = cx;
      const startY = y + 10;
      const midX = cx + spreadAngle * 15 + wave * 0.5;
      const midY = y + enemy.height + 5;
      const endX = cx + spreadAngle * 20 + wave + wave2;
      const endY = y + enemy.height + 22;
      
      const tentGrad = this.ctx.createLinearGradient(startX, startY, endX, endY);
      tentGrad.addColorStop(0, '#ff88ff');
      tentGrad.addColorStop(0.5, '#cc44cc');
      tentGrad.addColorStop(1, 'rgba(100, 20, 100, 0)');
      
      this.ctx.strokeStyle = tentGrad;
      this.ctx.lineWidth = 2.5 - Math.abs(i - 2.5) * 0.3;
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.bezierCurveTo(
        midX - wave * 0.3, midY - 5,
        midX + wave * 0.3, midY + 5,
        endX, endY
      );
      this.ctx.stroke();
    }
    
    // Glowing eye
    const eyePulse = Math.sin(time * 3) * 0.3 + 0.7;
    this.ctx.shadowColor = '#ffffff';
    this.ctx.shadowBlur = 8 * eyePulse;
    this.ctx.fillStyle = `rgba(255, 255, 255, ${eyePulse})`;
    this.ctx.beginPath();
    this.ctx.arc(cx, y + 5, 3, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }

  private renderKraken(x: number, y: number, enemy: Enemy): void {
    this.ctx.save();
    const time = Date.now() * 0.003;
    const cx = x + enemy.width / 2;
    const cy = y + enemy.height / 2;
    const pulse = Math.sin(time * 1.5) * 0.15 + 0.85;
    
    // Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.beginPath();
    this.ctx.ellipse(cx, y + enemy.height + 20, 18, 6, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Main body - large menacing head
    this.ctx.shadowColor = '#8844ff';
    this.ctx.shadowBlur = 25 * pulse;
    const bodyGrad = this.ctx.createRadialGradient(
      cx - 4, cy - 6, 0,
      cx, cy, enemy.width / 2 + 6
    );
    bodyGrad.addColorStop(0, `rgba(180, 120, 255, ${pulse})`);
    bodyGrad.addColorStop(0.25, '#9955dd');
    bodyGrad.addColorStop(0.5, '#6633aa');
    bodyGrad.addColorStop(0.75, '#442277');
    bodyGrad.addColorStop(1, '#221144');
    this.ctx.fillStyle = bodyGrad;
    
    // Bulbous head shape
    this.ctx.beginPath();
    this.ctx.moveTo(cx, y - 4);
    for (let i = 0; i <= 10; i++) {
      const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const wobble = Math.sin(time * 2 + i * 0.5) * 1.5;
      const rx = (enemy.width / 2 + 2 + wobble) * (1 - Math.abs(Math.sin(angle)) * 0.1);
      const ry = (enemy.height / 2.5 + wobble * 0.5);
      const px = cx + Math.cos(angle) * rx;
      const py = cy - 4 + Math.sin(angle) * ry;
      if (i === 0) this.ctx.moveTo(px, py);
      else this.ctx.lineTo(px, py);
    }
    this.ctx.closePath();
    this.ctx.fill();
    
    // Armor ridges
    this.ctx.shadowBlur = 0;
    this.ctx.strokeStyle = 'rgba(150, 100, 200, 0.5)';
    this.ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      this.ctx.beginPath();
      this.ctx.arc(cx, cy - 4, enemy.width / 3 - i * 3, Math.PI * 0.3, Math.PI * 0.7);
      this.ctx.stroke();
    }
    
    // Menacing eyes
    const eyePositions = [{ x: -6, y: -6 }, { x: 6, y: -6 }];
    eyePositions.forEach((pos, i) => {
      const eyePulse = Math.sin(time * 3 + i) * 0.3 + 0.7;
      this.ctx.shadowColor = '#ff0000';
      this.ctx.shadowBlur = 10 * eyePulse;
      const eyeGrad = this.ctx.createRadialGradient(
        cx + pos.x, cy + pos.y, 0,
        cx + pos.x, cy + pos.y, 4
      );
      eyeGrad.addColorStop(0, '#ffffff');
      eyeGrad.addColorStop(0.3, '#ff8888');
      eyeGrad.addColorStop(0.6, '#ff0000');
      eyeGrad.addColorStop(1, '#880000');
      this.ctx.fillStyle = eyeGrad;
      this.ctx.beginPath();
      this.ctx.arc(cx + pos.x, cy + pos.y, 4, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Pupil
      this.ctx.fillStyle = '#110000';
      this.ctx.beginPath();
      this.ctx.arc(cx + pos.x + Math.sin(time + i) * 1.5, cy + pos.y, 1.5, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    // Long slinky tentacles from center bottom
    this.ctx.shadowBlur = 0;
    const numArms = 8;
    for (let i = 0; i < numArms; i++) {
      const wave = Math.sin(time * 2.5 + i * 0.9) * 15;
      const wave2 = Math.cos(time * 2 + i * 1.4) * 8;
      const spreadAngle = ((i - (numArms - 1) / 2) / numArms) * 1.4;
      
      const startX = cx;
      const startY = cy + enemy.height / 3;
      const mid1X = cx + spreadAngle * 12 + wave * 0.3;
      const mid1Y = y + enemy.height + 5;
      const mid2X = cx + spreadAngle * 25 + wave * 0.6 + wave2 * 0.3;
      const mid2Y = y + enemy.height + 20;
      const endX = cx + spreadAngle * 35 + wave + wave2;
      const endY = y + enemy.height + 35;
      
      const armGrad = this.ctx.createLinearGradient(startX, startY, endX, endY);
      armGrad.addColorStop(0, '#9955dd');
      armGrad.addColorStop(0.3, '#7744bb');
      armGrad.addColorStop(0.6, '#553388');
      armGrad.addColorStop(1, 'rgba(50, 20, 80, 0)');
      
      this.ctx.strokeStyle = armGrad;
      this.ctx.lineWidth = 4 - Math.abs(i - 3.5) * 0.4;
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.bezierCurveTo(
        mid1X, mid1Y,
        mid2X, mid2Y,
        endX, endY
      );
      this.ctx.stroke();
      
      // Suction cups on tentacles
      if (i % 2 === 0) {
        for (let j = 1; j <= 3; j++) {
          const t = j * 0.25;
          const cupX = startX + (endX - startX) * t + Math.sin(time * 2 + i + j) * 3;
          const cupY = startY + (endY - startY) * t;
          this.ctx.fillStyle = `rgba(100, 60, 140, ${0.6 - t * 0.4})`;
          this.ctx.beginPath();
          this.ctx.arc(cupX, cupY, 2 - t * 0.5, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }
    
    this.ctx.restore();
  }

  private renderSeaMine(x: number, y: number, enemy: Enemy): void {
    this.ctx.save();
    const time = Date.now() * 0.003;
    const cx = x + enemy.width / 2;
    const cy = y + enemy.height / 2;
    const bob = Math.sin(time * 2) * 3;
    
    // Chain to water surface
    this.ctx.strokeStyle = '#444455';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy + bob + enemy.height / 2);
    this.ctx.lineTo(cx + Math.sin(time) * 5, this.height - 20);
    this.ctx.stroke();
    
    // Main mine body - spiked sphere
    this.ctx.shadowColor = '#ff4444';
    this.ctx.shadowBlur = 12;
    
    const mineGrad = this.ctx.createRadialGradient(cx - 2, cy + bob - 2, 0, cx, cy + bob, 10);
    mineGrad.addColorStop(0, '#666677');
    mineGrad.addColorStop(0.4, '#444455');
    mineGrad.addColorStop(0.8, '#333344');
    mineGrad.addColorStop(1, '#222233');
    this.ctx.fillStyle = mineGrad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy + bob, 8, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Spikes
    this.ctx.fillStyle = '#555566';
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const spikeX = cx + Math.cos(angle) * 10;
      const spikeY = cy + bob + Math.sin(angle) * 10;
      this.ctx.beginPath();
      this.ctx.arc(spikeX, spikeY, 3, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    // Warning light
    const blink = Math.sin(time * 6) > 0 ? 1 : 0.2;
    this.ctx.shadowColor = '#ff0000';
    this.ctx.shadowBlur = 15 * blink;
    this.ctx.fillStyle = `rgba(255, 0, 0, ${blink})`;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy + bob, 3, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }

  private renderGunboat(x: number, y: number, enemy: Enemy): void {
    this.ctx.save();
    const time = Date.now() * 0.003;
    const cx = x + enemy.width / 2;
    const bob = Math.sin(time * 1.5 + x * 0.01) * 2;
    const tilt = Math.sin(time * 1.2 + x * 0.02) * 0.05;
    
    this.ctx.translate(cx, y + bob);
    this.ctx.rotate(tilt);
    
    // Hull
    this.ctx.shadowColor = '#4488ff';
    this.ctx.shadowBlur = 10;
    const hullGrad = this.ctx.createLinearGradient(-14, -4, -14, 8);
    hullGrad.addColorStop(0, '#556688');
    hullGrad.addColorStop(0.4, '#445577');
    hullGrad.addColorStop(1, '#334466');
    this.ctx.fillStyle = hullGrad;
    this.ctx.beginPath();
    this.ctx.moveTo(-14, 0);
    this.ctx.lineTo(-10, 6);
    this.ctx.lineTo(10, 6);
    this.ctx.lineTo(14, 0);
    this.ctx.lineTo(10, -3);
    this.ctx.lineTo(-10, -3);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Cabin
    const cabinGrad = this.ctx.createLinearGradient(-4, -8, -4, -3);
    cabinGrad.addColorStop(0, '#667799');
    cabinGrad.addColorStop(1, '#445566');
    this.ctx.fillStyle = cabinGrad;
    this.ctx.fillRect(-4, -8, 8, 5);
    
    // Gun turret
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = '#444455';
    this.ctx.beginPath();
    this.ctx.arc(6, -4, 4, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Gun barrel (aiming at player)
    const aimAngle = enemy.aimAngle || -Math.PI / 4;
    this.ctx.save();
    this.ctx.translate(6, -4);
    this.ctx.rotate(aimAngle);
    this.ctx.fillStyle = '#333344';
    this.ctx.fillRect(0, -1.5, 10, 3);
    this.ctx.restore();
    
    // Wake effect
    this.ctx.shadowBlur = 0;
    for (let i = 0; i < 3; i++) {
      const wakeAlpha = 0.3 - i * 0.1;
      const wakeOffset = i * 8 + (time * 30) % 8;
      this.ctx.fillStyle = `rgba(150, 200, 255, ${wakeAlpha})`;
      this.ctx.beginPath();
      this.ctx.arc(-14 - wakeOffset, 3, 3 - i * 0.5, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.restore();
  }

  // Render water surface for waterCeiling terrain type
  renderWaterSurface(scrollOffset: number): void {
    const waterY = this.height - 40;
    const time = this.time;
    
    // Deep water gradient
    const waterGrad = this.ctx.createLinearGradient(0, waterY, 0, this.height);
    waterGrad.addColorStop(0, 'rgba(20, 80, 120, 0.85)');
    waterGrad.addColorStop(0.3, 'rgba(15, 60, 100, 0.9)');
    waterGrad.addColorStop(0.7, 'rgba(10, 40, 80, 0.95)');
    waterGrad.addColorStop(1, 'rgba(5, 20, 50, 1)');
    
    // Draw wavy water surface
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height);
    
    for (let x = 0; x <= this.width; x += 10) {
      const waveHeight = Math.sin((x + scrollOffset) * 0.03 + time * 2) * 5 
                       + Math.sin((x + scrollOffset) * 0.07 + time * 3) * 3;
      this.ctx.lineTo(x, waterY + waveHeight);
    }
    
    this.ctx.lineTo(this.width, this.height);
    this.ctx.closePath();
    this.ctx.fillStyle = waterGrad;
    this.ctx.fill();
    
    // Animated wave highlights
    this.ctx.save();
    this.ctx.globalAlpha = 0.4;
    for (let x = 0; x < this.width; x += 40) {
      const waveX = (x + time * 50 + scrollOffset) % (this.width + 100) - 50;
      const waveHeight = Math.sin((x + scrollOffset) * 0.03 + time * 2) * 5;
      this.ctx.fillStyle = 'rgba(100, 180, 255, 0.5)';
      this.ctx.beginPath();
      this.ctx.ellipse(waveX, waterY + waveHeight - 2, 15, 3, 0, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
    
    // Surface foam/sparkle
    this.ctx.save();
    for (let i = 0; i < 20; i++) {
      const sparkleX = ((i * 73 + time * 40 + scrollOffset * 0.5) % this.width);
      const sparkleY = waterY + Math.sin((sparkleX + scrollOffset) * 0.03 + time * 2) * 5 - 1;
      const sparkleAlpha = Math.sin(time * 4 + i) * 0.3 + 0.5;
      this.ctx.fillStyle = `rgba(200, 230, 255, ${sparkleAlpha})`;
      this.ctx.beginPath();
      this.ctx.arc(sparkleX, sparkleY, 1.5, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  renderCivilians(civilians: Civilian[], scrollOffset: number): void {
    civilians.forEach(civilian => {
      const x = civilian.x - scrollOffset;
      
      if (civilian.rescued) return;
      
      this.ctx.save();
      
      const time = Date.now() * 0.003;
      const color = civilian.hasLeech ? '#ff00ff' : '#00ff00';
      const glowColor = civilian.hasLeech ? '#aa00ff' : '#00ff88';
      
      // Rescue indicator with pulsing glow
      const pulse = Math.sin(time * 2) * 0.3 + 0.7;
      this.ctx.shadowColor = glowColor;
      this.ctx.shadowBlur = 15 * pulse;
      this.ctx.fillStyle = `rgba(${civilian.hasLeech ? '255, 0, 255' : '0, 255, 136'}, ${0.2 * pulse})`;
      this.ctx.beginPath();
      this.ctx.arc(x + civilian.width / 2, civilian.y + civilian.height / 2, 12 + Math.sin(time * 3) * 2, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.shadowBlur = 8;
      
      // Head
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(x + civilian.width / 2, civilian.y + 3, 3, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Body
      this.ctx.fillRect(x + 1, civilian.y + 6, 4, 5);
      
      // Arms waving animation
      const armWave = Math.sin(time * 4) * 4;
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 2;
      
      this.ctx.beginPath();
      this.ctx.moveTo(x + 1, civilian.y + 7);
      this.ctx.lineTo(x - 2, civilian.y + 4 + armWave);
      this.ctx.stroke();
      
      this.ctx.beginPath();
      this.ctx.moveTo(x + 5, civilian.y + 7);
      this.ctx.lineTo(x + 8, civilian.y + 4 - armWave);
      this.ctx.stroke();
      
      // Legs
      this.ctx.beginPath();
      this.ctx.moveTo(x + 2, civilian.y + 11);
      this.ctx.lineTo(x + 1, civilian.y + 15);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(x + 4, civilian.y + 11);
      this.ctx.lineTo(x + 5, civilian.y + 15);
      this.ctx.stroke();
      
      this.ctx.restore();
    });
  }

  renderPickups(pickups: Pickup[], scrollOffset: number): void {
    pickups.forEach(pickup => {
      const x = pickup.x - scrollOffset;
      const time = Date.now() * 0.003;
      const pulse = Math.sin(time * 2) * 0.3 + 0.7;
      const fastPulse = Math.sin(time * 4) * 0.5 + 0.5;
      const float = Math.sin(time * 3) * 3;
      const rotate = time * 2;
      
      this.ctx.save();
      
      // Pickup glow aura colors - more vibrant
      const glowColors: Record<string, string> = {
        forceField: '#00aaff',
        health: '#ff4488',
        homingMissile: '#ff8800',
        shield: '#00ccff',
        megaBomb: '#ffff00',
        tripleShot: '#ff00ff',
        electricPulse: '#00ffff',
        escort: '#88ff00'
      };
      
      const glowColor = glowColors[pickup.type] || '#ffffff';
      const cx = x + 8;
      const cy = pickup.y + 8 + float;
      
      // Animated outer glow ring
      this.ctx.strokeStyle = `${glowColor}55`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 14 + pulse * 4, 0, Math.PI * 2);
      this.ctx.stroke();
      
      // Rotating dashed ring
      this.ctx.save();
      this.ctx.translate(cx, cy);
      this.ctx.rotate(rotate);
      this.ctx.setLineDash([5, 5]);
      this.ctx.strokeStyle = `${glowColor}44`;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 11, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
      this.ctx.restore();
      
      // Inner radial glow
      const innerGrad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, 12);
      innerGrad.addColorStop(0, `${glowColor}66`);
      innerGrad.addColorStop(0.5, `${glowColor}33`);
      innerGrad.addColorStop(1, 'transparent');
      this.ctx.fillStyle = innerGrad;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Set glow for icon
      this.ctx.shadowColor = glowColor;
      this.ctx.shadowBlur = 18 * pulse;
      
      switch (pickup.type) {
        case 'forceField':
          // Neon blue hexagonal force field icon
          const ffGrad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, 10);
          ffGrad.addColorStop(0, '#ffffff');
          ffGrad.addColorStop(0.3, '#88ddff');
          ffGrad.addColorStop(0.6, '#00aaff');
          ffGrad.addColorStop(1, '#004488');
          this.ctx.fillStyle = ffGrad;
          // Draw hexagon
          this.ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3 - Math.PI / 6;
            const hx = cx + Math.cos(angle) * 7;
            const hy = cy + Math.sin(angle) * 7 + float;
            if (i === 0) {
              this.ctx.moveTo(hx, hy);
            } else {
              this.ctx.lineTo(hx, hy);
            }
          }
          this.ctx.closePath();
          this.ctx.fill();
          // Inner glow ring
          this.ctx.strokeStyle = 'rgba(136, 221, 255, 0.8)';
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.arc(cx, cy + float, 4, 0, Math.PI * 2);
          this.ctx.stroke();
          // Bright center
          this.ctx.fillStyle = '#ffffff';
          this.ctx.beginPath();
          this.ctx.arc(cx, cy + float, 2, 0, Math.PI * 2);
          this.ctx.fill();
          break;
          
        case 'health':
          // Medical cross/heart hybrid
          const heartGrad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, 10);
          heartGrad.addColorStop(0, '#ffccdd');
          heartGrad.addColorStop(0.3, '#ff6699');
          heartGrad.addColorStop(0.7, '#dd3366');
          heartGrad.addColorStop(1, '#991133');
          this.ctx.fillStyle = heartGrad;
          // Cross shape
          this.ctx.fillRect(cx - 2, pickup.y + 2 + float, 4, 12);
          this.ctx.fillRect(x + 2, cy - 2, 12, 4);
          // Rounded caps
          this.ctx.beginPath();
          this.ctx.arc(cx, pickup.y + 2 + float, 2, 0, Math.PI * 2);
          this.ctx.arc(cx, pickup.y + 14 + float, 2, 0, Math.PI * 2);
          this.ctx.arc(x + 2, cy, 2, 0, Math.PI * 2);
          this.ctx.arc(x + 14, cy, 2, 0, Math.PI * 2);
          this.ctx.fill();
          // Shine
          this.ctx.fillStyle = '#ffffff88';
          this.ctx.beginPath();
          this.ctx.arc(cx - 1, cy - 3, 2, 0, Math.PI * 2);
          this.ctx.fill();
          break;

        case 'homingMissile':
          // Detailed missile icon with fins
          const missileGrad = this.ctx.createLinearGradient(x + 2, cy, x + 14, cy);
          missileGrad.addColorStop(0, '#ffcc66');
          missileGrad.addColorStop(0.4, '#ff9922');
          missileGrad.addColorStop(1, '#cc5500');
          this.ctx.fillStyle = missileGrad;
          // Missile body
          this.ctx.beginPath();
          this.ctx.moveTo(x + 15, cy);
          this.ctx.lineTo(x + 6, cy - 4);
          this.ctx.lineTo(x + 2, cy - 3);
          this.ctx.lineTo(x + 2, cy + 3);
          this.ctx.lineTo(x + 6, cy + 4);
          this.ctx.closePath();
          this.ctx.fill();
          // Red nose
          this.ctx.fillStyle = '#ff4444';
          this.ctx.beginPath();
          this.ctx.moveTo(x + 15, cy);
          this.ctx.lineTo(x + 12, cy - 2);
          this.ctx.lineTo(x + 12, cy + 2);
          this.ctx.closePath();
          this.ctx.fill();
          // Fins
          this.ctx.fillStyle = '#ffaa00';
          this.ctx.beginPath();
          this.ctx.moveTo(x + 4, cy - 3);
          this.ctx.lineTo(x + 1, cy - 7);
          this.ctx.lineTo(x + 1, cy - 3);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.beginPath();
          this.ctx.moveTo(x + 4, cy + 3);
          this.ctx.lineTo(x + 1, cy + 7);
          this.ctx.lineTo(x + 1, cy + 3);
          this.ctx.closePath();
          this.ctx.fill();
          // Tracking crosshair
          this.ctx.strokeStyle = '#ff880088';
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.arc(x + 10, cy, 3 + fastPulse * 2, 0, Math.PI * 2);
          this.ctx.stroke();
          break;

        case 'shield':
          // Hexagonal shield icon
          const shieldGrad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, 10);
          shieldGrad.addColorStop(0, '#aaffff');
          shieldGrad.addColorStop(0.4, '#44ddff');
          shieldGrad.addColorStop(0.8, '#0099cc');
          shieldGrad.addColorStop(1, '#005577');
          this.ctx.fillStyle = shieldGrad;
          // Shield shape
          this.ctx.beginPath();
          this.ctx.moveTo(cx, pickup.y + 1 + float);
          this.ctx.lineTo(x + 14, pickup.y + 4 + float);
          this.ctx.lineTo(x + 14, pickup.y + 10 + float);
          this.ctx.lineTo(cx, pickup.y + 15 + float);
          this.ctx.lineTo(x + 2, pickup.y + 10 + float);
          this.ctx.lineTo(x + 2, pickup.y + 4 + float);
          this.ctx.closePath();
          this.ctx.fill();
          // Inner chevron
          this.ctx.strokeStyle = '#ffffff66';
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.moveTo(cx - 3, pickup.y + 5 + float);
          this.ctx.lineTo(cx, pickup.y + 8 + float);
          this.ctx.lineTo(cx + 3, pickup.y + 5 + float);
          this.ctx.stroke();
          break;
          
        case 'megaBomb':
          // Explosive starburst
          const bombGrad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, 10);
          bombGrad.addColorStop(0, '#ffffff');
          bombGrad.addColorStop(0.2, '#ffff88');
          bombGrad.addColorStop(0.5, '#ffaa00');
          bombGrad.addColorStop(0.8, '#ff4400');
          bombGrad.addColorStop(1, '#881100');
          this.ctx.fillStyle = bombGrad;
          this.ctx.beginPath();
          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + rotate * 0.5;
            const len = i % 2 === 0 ? 10 + fastPulse * 2 : 5;
            const px = cx + Math.cos(angle) * len;
            const py = cy + Math.sin(angle) * len;
            if (i === 0) this.ctx.moveTo(px, py);
            else this.ctx.lineTo(px, py);
          }
          this.ctx.closePath();
          this.ctx.fill();
          // Bright center
          this.ctx.fillStyle = '#ffffff';
          this.ctx.beginPath();
          this.ctx.arc(cx, cy, 4, 0, Math.PI * 2);
          this.ctx.fill();
          // Inner ring
          this.ctx.strokeStyle = '#ffcc0088';
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.arc(cx, cy, 2, 0, Math.PI * 2);
          this.ctx.stroke();
          break;
          
        case 'tripleShot':
          // Three bullet spread icon
          const bulletGrad = this.ctx.createLinearGradient(x + 2, cy, x + 14, cy);
          bulletGrad.addColorStop(0, '#ffbbff');
          bulletGrad.addColorStop(0.5, '#ff44ff');
          bulletGrad.addColorStop(1, '#aa00aa');
          this.ctx.fillStyle = bulletGrad;
          // Three bullets spreading
          for (let i = -1; i <= 1; i++) {
            const offsetY = i * 4;
            const offsetX = Math.abs(i) * 2;
            this.ctx.beginPath();
            this.ctx.ellipse(cx - offsetX, cy + offsetY, 6, 2, 0, 0, Math.PI * 2);
            this.ctx.fill();
          }
          // Bullet tips
          this.ctx.fillStyle = '#ffffff88';
          for (let i = -1; i <= 1; i++) {
            const offsetY = i * 4;
            const offsetX = Math.abs(i) * 2;
            this.ctx.beginPath();
            this.ctx.ellipse(x + 12 - offsetX, cy + offsetY, 2, 1.5, 0, 0, Math.PI * 2);
            this.ctx.fill();
          }
          break;
          
        case 'electricPulse':
          // Electric orb with plasma sparks
          const pulseGrad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, 8);
          pulseGrad.addColorStop(0, '#ffffff');
          pulseGrad.addColorStop(0.25, '#aaffff');
          pulseGrad.addColorStop(0.6, '#00ddff');
          pulseGrad.addColorStop(1, '#0066aa');
          this.ctx.fillStyle = pulseGrad;
          this.ctx.beginPath();
          this.ctx.arc(cx, cy, 7, 0, Math.PI * 2);
          this.ctx.fill();
          // Electric arcs
          this.ctx.strokeStyle = '#00ffff';
          this.ctx.lineWidth = 2;
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + rotate;
            const sparkLen = 5 + fastPulse * 4;
            this.ctx.beginPath();
            this.ctx.moveTo(cx + Math.cos(angle) * 6, cy + Math.sin(angle) * 6);
            const midAngle = angle + (Math.random() - 0.5) * 0.3;
            this.ctx.lineTo(cx + Math.cos(midAngle) * (6 + sparkLen * 0.6), cy + Math.sin(midAngle) * (6 + sparkLen * 0.6));
            this.ctx.lineTo(cx + Math.cos(angle) * (6 + sparkLen), cy + Math.sin(angle) * (6 + sparkLen));
            this.ctx.stroke();
          }
          // Core glow
          this.ctx.fillStyle = '#ffffff';
          this.ctx.beginPath();
          this.ctx.arc(cx, cy, 3, 0, Math.PI * 2);
          this.ctx.fill();
          break;
          
        case 'escort':
          // Dual wing escort ships
          const escortGrad = this.ctx.createLinearGradient(x + 2, cy, x + 14, cy);
          escortGrad.addColorStop(0, '#ddff99');
          escortGrad.addColorStop(0.5, '#88ff00');
          escortGrad.addColorStop(1, '#449900');
          this.ctx.fillStyle = escortGrad;
          // Top escort ship
          this.ctx.beginPath();
          this.ctx.moveTo(x + 14, pickup.y + 4 + float);
          this.ctx.lineTo(x + 4, pickup.y + 2 + float);
          this.ctx.lineTo(x + 2, pickup.y + 4 + float);
          this.ctx.lineTo(x + 4, pickup.y + 6 + float);
          this.ctx.closePath();
          this.ctx.fill();
          // Bottom escort ship
          this.ctx.beginPath();
          this.ctx.moveTo(x + 14, pickup.y + 12 + float);
          this.ctx.lineTo(x + 4, pickup.y + 10 + float);
          this.ctx.lineTo(x + 2, pickup.y + 12 + float);
          this.ctx.lineTo(x + 4, pickup.y + 14 + float);
          this.ctx.closePath();
          this.ctx.fill();
          // Engine glows
          const engPulse = 0.7 + fastPulse * 0.3;
          this.ctx.fillStyle = `rgba(255, 200, 0, ${engPulse})`;
          this.ctx.beginPath();
          this.ctx.arc(x + 2, pickup.y + 4 + float, 2, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.beginPath();
          this.ctx.arc(x + 2, pickup.y + 12 + float, 2, 0, Math.PI * 2);
          this.ctx.fill();
          // Formation lines
          this.ctx.strokeStyle = '#88ff0044';
          this.ctx.lineWidth = 1;
          this.ctx.setLineDash([2, 2]);
          this.ctx.beginPath();
          this.ctx.moveTo(x + 8, pickup.y + 4 + float);
          this.ctx.lineTo(x + 8, pickup.y + 12 + float);
          this.ctx.stroke();
          this.ctx.setLineDash([]);
          break;
      }
      
      this.ctx.restore();
    });
  }

  renderFallingDebris(debris: FallingDebris[], scrollOffset: number): void {
    const time = Date.now() * 0.008;
    
    debris.forEach(d => {
      const x = d.x - scrollOffset;
      const y = d.y;
      const debrisType = d.debrisType || 'rock';
      
      this.ctx.save();
      this.ctx.translate(x + d.size / 2, y + d.size / 2);
      this.ctx.rotate(d.rotation);
      
      // Pulsing glow effect - color based on debris type
      const pulse = 0.5 + Math.sin(time + d.x * 0.1) * 0.3;
      const halfSize = d.size / 2;
      
      // Set colors based on debris type
      let glowColor: string;
      let fillColors: { inner: string; mid: string; outer: string };
      let edgeColor: string;
      
      switch (debrisType) {
        case 'ice':
          glowColor = `rgba(100, 200, 255, ${pulse})`;
          fillColors = {
            inner: `rgba(180, 220, 255, ${0.8 + pulse * 0.2})`,
            mid: `rgba(100, 180, 220, 0.9)`,
            outer: `rgba(60, 120, 180, 1)`
          };
          edgeColor = `rgba(150, 220, 255, ${pulse})`;
          break;
        case 'lava':
          glowColor = `rgba(255, 100, 50, ${pulse})`;
          fillColors = {
            inner: `rgba(255, 200, 50, ${0.9 + pulse * 0.1})`,
            mid: `rgba(255, 100, 20, 0.95)`,
            outer: `rgba(150, 30, 10, 1)`
          };
          edgeColor = `rgba(255, 150, 50, ${pulse * 1.2})`;
          break;
        case 'metal':
          glowColor = `rgba(150, 180, 200, ${pulse * 0.6})`;
          fillColors = {
            inner: `rgba(180, 190, 200, ${0.9})`,
            mid: `rgba(100, 110, 130, 0.95)`,
            outer: `rgba(50, 60, 70, 1)`
          };
          edgeColor = `rgba(200, 210, 220, ${pulse * 0.8})`;
          break;
        case 'rock':
        default:
          glowColor = `rgba(255, 50, 50, ${pulse})`;
          fillColors = {
            inner: `rgba(120, 60, 60, ${0.8 + pulse * 0.2})`,
            mid: `rgba(80, 40, 40, 0.9)`,
            outer: `rgba(50, 25, 25, 1)`
          };
          edgeColor = `rgba(255, 80, 80, ${pulse})`;
          break;
      }
      
      // Outer glow
      this.ctx.shadowColor = glowColor;
      this.ctx.shadowBlur = 12 + pulse * 8;
      
      // Rock/debris shape with jagged edges
      this.ctx.beginPath();
      if (debrisType === 'metal') {
        // More angular, geometric shape for metal
        this.ctx.moveTo(-halfSize * 0.7, -halfSize * 0.7);
        this.ctx.lineTo(0, -halfSize * 0.9);
        this.ctx.lineTo(halfSize * 0.7, -halfSize * 0.5);
        this.ctx.lineTo(halfSize * 0.9, halfSize * 0.2);
        this.ctx.lineTo(halfSize * 0.5, halfSize * 0.8);
        this.ctx.lineTo(-halfSize * 0.3, halfSize * 0.7);
        this.ctx.lineTo(-halfSize * 0.9, halfSize * 0.3);
        this.ctx.lineTo(-halfSize * 0.8, -halfSize * 0.4);
      } else if (debrisType === 'ice') {
        // Crystal-like shape for ice
        this.ctx.moveTo(0, -halfSize);
        this.ctx.lineTo(halfSize * 0.5, -halfSize * 0.5);
        this.ctx.lineTo(halfSize * 0.8, 0);
        this.ctx.lineTo(halfSize * 0.4, halfSize * 0.7);
        this.ctx.lineTo(-halfSize * 0.3, halfSize * 0.8);
        this.ctx.lineTo(-halfSize * 0.7, halfSize * 0.3);
        this.ctx.lineTo(-halfSize * 0.6, -halfSize * 0.4);
      } else {
        // Jagged rock shape (rock and lava)
        this.ctx.moveTo(-halfSize * 0.8, -halfSize * 0.6);
        this.ctx.lineTo(-halfSize * 0.3, -halfSize);
        this.ctx.lineTo(halfSize * 0.4, -halfSize * 0.8);
        this.ctx.lineTo(halfSize * 0.9, -halfSize * 0.2);
        this.ctx.lineTo(halfSize * 0.7, halfSize * 0.5);
        this.ctx.lineTo(halfSize * 0.2, halfSize * 0.9);
        this.ctx.lineTo(-halfSize * 0.5, halfSize * 0.7);
        this.ctx.lineTo(-halfSize, halfSize * 0.1);
      }
      this.ctx.closePath();
      
      // Debris gradient
      const debrisGrad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, halfSize);
      debrisGrad.addColorStop(0, fillColors.inner);
      debrisGrad.addColorStop(0.5, fillColors.mid);
      debrisGrad.addColorStop(1, fillColors.outer);
      this.ctx.fillStyle = debrisGrad;
      this.ctx.fill();
      
      // Pulsing edge
      this.ctx.strokeStyle = edgeColor;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      // Extra inner glow for lava
      if (debrisType === 'lava') {
        this.ctx.fillStyle = `rgba(255, 255, 100, ${pulse * 0.3})`;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, halfSize * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      // Reflection highlight for ice
      if (debrisType === 'ice') {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + pulse * 0.2})`;
        this.ctx.beginPath();
        this.ctx.ellipse(-halfSize * 0.2, -halfSize * 0.3, halfSize * 0.15, halfSize * 0.1, -0.5, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      this.ctx.restore();
    });
  }

  renderParticles(particles: Particle[], scrollOffset: number = 0): void {
    particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      const size = particle.size * (0.5 + alpha * 0.5);
      const screenX = particle.x - scrollOffset;
      
      // Skip particles off-screen
      if (screenX < -50 || screenX > this.width + 50) return;
      
      this.ctx.save();
      
      // Particle glow
      this.ctx.shadowColor = particle.color;
      this.ctx.shadowBlur = 8 * alpha;
      this.ctx.fillStyle = particle.color;
      this.ctx.globalAlpha = alpha;
      
      this.ctx.beginPath();
      this.ctx.arc(screenX, particle.y, size, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    });
  }

  renderRadar(enemies: Enemy[], civilians: Civilian[], player: Player, scrollOffset: number): void {
    const radarWidth = this.width - 40;
    const radarHeight = 22;
    const radarX = 20;
    const radarY = 10;
    const edgeFadeWidth = 30; // Width of the fade effect on each side

    this.ctx.save();
    
    // Radar background with gradient
    const bgGrad = this.ctx.createLinearGradient(radarX, radarY, radarX, radarY + radarHeight);
    bgGrad.addColorStop(0, 'rgba(0, 40, 50, 0.8)');
    bgGrad.addColorStop(0.5, 'rgba(0, 30, 40, 0.9)');
    bgGrad.addColorStop(1, 'rgba(0, 40, 50, 0.8)');
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(radarX, radarY, radarWidth, radarHeight);
    
    // Radar border with glow
    this.ctx.shadowColor = '#00ffff';
    this.ctx.shadowBlur = 5;
    this.ctx.strokeStyle = '#00ffff66';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(radarX, radarY, radarWidth, radarHeight);
    this.ctx.shadowBlur = 0;
    
    // Grid lines
    this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    for (let i = 1; i < 10; i++) {
      const lineX = radarX + (radarWidth / 10) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(lineX, radarY);
      this.ctx.lineTo(lineX, radarY + radarHeight);
      this.ctx.stroke();
    }

    // Player position with glow
    const playerRadarX = radarX + ((player.x - scrollOffset) / this.width) * radarWidth;
    this.ctx.shadowColor = '#00ffff';
    this.ctx.shadowBlur = 8;
    this.ctx.fillStyle = '#00ffff';
    this.ctx.fillRect(playerRadarX - 2, radarY + 4, 4, 14);
    this.ctx.shadowBlur = 0;

    // Enemies
    enemies.forEach(enemy => {
      const enemyScreenX = enemy.x - scrollOffset;
      if (enemyScreenX > -200 && enemyScreenX < this.width + 400) {
        const enemyRadarX = radarX + (enemyScreenX / this.width) * radarWidth;
        this.ctx.fillStyle = '#ff4444';
        this.ctx.fillRect(enemyRadarX - 1, radarY + 6, 3, 10);
      }
    });

    // Civilians
    civilians.filter(c => !c.rescued).forEach(civilian => {
      const civScreenX = civilian.x - scrollOffset;
      if (civScreenX > -200 && civScreenX < this.width + 400) {
        const civRadarX = radarX + (civScreenX / this.width) * radarWidth;
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(civRadarX - 1, radarY + 6, 3, 10);
      }
    });
    
    // Left edge fade-out effect
    const leftFadeGrad = this.ctx.createLinearGradient(radarX, radarY, radarX + edgeFadeWidth, radarY);
    leftFadeGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    leftFadeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    this.ctx.fillStyle = leftFadeGrad;
    this.ctx.fillRect(radarX, radarY, edgeFadeWidth, radarHeight);
    
    // Right edge fade-out effect
    const rightFadeGrad = this.ctx.createLinearGradient(radarX + radarWidth - edgeFadeWidth, radarY, radarX + radarWidth, radarY);
    rightFadeGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    rightFadeGrad.addColorStop(1, 'rgba(0, 0, 0, 1)');
    this.ctx.fillStyle = rightFadeGrad;
    this.ctx.fillRect(radarX + radarWidth - edgeFadeWidth, radarY, edgeFadeWidth, radarHeight);
    
    this.ctx.restore();
  }

  renderCollisionFlash(collisionFlash: { x: number; y: number; timer: number; color: string }[], scrollOffset: number): void {
    collisionFlash.forEach(flash => {
      const x = flash.x - scrollOffset;
      const alpha = flash.timer / 15;
      const size = (15 - flash.timer) * 3 + 10;
      
      // Convert color to rgba format - handle both hex and rgb formats
      let r = 255, g = 68, b = 68; // Default red
      if (flash.color.startsWith('#')) {
        r = parseInt(flash.color.slice(1, 3), 16) || 255;
        g = parseInt(flash.color.slice(3, 5), 16) || 68;
        b = parseInt(flash.color.slice(5, 7), 16) || 68;
      } else if (flash.color.startsWith('rgb')) {
        const match = flash.color.match(/(\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          r = parseInt(match[1]);
          g = parseInt(match[2]);
          b = parseInt(match[3]);
        }
      }
      
      const baseColor = `rgb(${r}, ${g}, ${b})`;
      const alphaColor = (a: number) => `rgba(${r}, ${g}, ${b}, ${a})`;
      
      this.ctx.save();
      
      // Outer expanding ring
      this.ctx.strokeStyle = alphaColor(alpha * 0.8);
      this.ctx.lineWidth = 3;
      this.ctx.shadowColor = baseColor;
      this.ctx.shadowBlur = 20 * alpha;
      this.ctx.beginPath();
      this.ctx.arc(x, flash.y, size, 0, Math.PI * 2);
      this.ctx.stroke();
      
      // Inner glow
      const gradient = this.ctx.createRadialGradient(x, flash.y, 0, x, flash.y, size * 0.6);
      gradient.addColorStop(0, alphaColor(alpha * 0.6));
      gradient.addColorStop(1, 'transparent');
      this.ctx.fillStyle = gradient;
      
      this.ctx.beginPath();
      this.ctx.arc(x, flash.y, size * 0.6, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Spark particles
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + flash.timer * 0.2;
        const dist = size * 0.8;
        const sparkX = x + Math.cos(angle) * dist;
        const sparkY = flash.y + Math.sin(angle) * dist;
        
        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        this.ctx.beginPath();
        this.ctx.arc(sparkX, sparkY, 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      this.ctx.restore();
    });
  }

  applyScreenShake(intensity: number): void {
    if (intensity > 0) {
      const shakeX = (Math.random() - 0.5) * intensity * 1.5;
      const shakeY = (Math.random() - 0.5) * intensity * 1.5;
      this.ctx.translate(shakeX, shakeY);
    }
  }
}
