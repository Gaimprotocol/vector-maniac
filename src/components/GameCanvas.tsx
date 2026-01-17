import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { GameData } from '@/game/types';
import { GameRenderer, ShipSkinColors, DEFAULT_SHIP_COLORS } from '@/game/renderer';
import { GAME_CONFIG } from '@/game/constants';
import { renderBunkerScene, BunkerState } from '@/game/bunkerDefense';
import { renderRoverScene, MoonRoverState } from '@/game/moonRover';
import { renderUnderwaterScene, UnderwaterState } from '@/game/underwater';
import { renderArenaMode, ArenaState } from '@/game/arenaMode';
import { renderSurvivalMode, SurvivalState } from '@/game/survivalMode';
import { renderEscortPlane, EscortPlane } from '@/game/escort';
import { getMap, getTerrainType, WARP_DURATION, QUICK_WARP_DURATION } from '@/game/maps';
import { SHIP_SKINS } from '@/hooks/useEquipment';
import { renderPilotRunner, PilotRunnerState } from '@/game/pilotRunner';
import { renderParatrooper, ParatrooperState } from '@/game/paratrooper';
import { renderForwardFlight, ForwardFlightState } from '@/game/forwardFlight';
import { renderVectorManiac, VectorState } from '@/game/vectorManiac';
import { getStoredMegaShipId, hasStealthMode, hasBlueProjectiles } from '@/hooks/useMegaShips';

interface GameCanvasProps {
  gameData: GameData;
  activeShipSkin?: string | null;
}

export const GameCanvas = forwardRef<HTMLCanvasElement, GameCanvasProps>(
  ({ gameData, activeShipSkin }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<GameRenderer | null>(null);

    useImperativeHandle(ref, () => canvasRef.current!);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Initialize renderer
      if (!rendererRef.current) {
        rendererRef.current = new GameRenderer(ctx, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
      }

      const renderer = rendererRef.current;

      // Render bunker scene if in bunker mode
      if (gameData.state === 'bunker' && gameData.bunkerState) {
        renderBunkerScene(ctx, gameData.bunkerState as BunkerState);
        return;
      }
      
      // Render rover scene if in rover mode
      if (gameData.state === 'rover' && gameData.roverState) {
        renderRoverScene(ctx, gameData.roverState as MoonRoverState);
        return;
      }
      
      // Render underwater scene if in underwater mode
      if (gameData.state === 'underwater' && gameData.underwaterState) {
        renderUnderwaterScene(ctx, gameData.underwaterState as UnderwaterState);
        return;
      }
      
      // Render arena scene if in arena mode
      if (gameData.state === 'arena' && gameData.arenaState) {
        renderArenaMode(ctx, gameData.arenaState as ArenaState);
        return;
      }
      
      // Render survival scene if in survival mode
      if (gameData.state === 'survival' && gameData.survivalState) {
        try {
          renderSurvivalMode(ctx, gameData.survivalState as SurvivalState);
        } catch (e) {
          const err = e as any;
          const name = String(err?.name || 'Error');
          const message = String(err?.message || err?.toString?.() || 'Unknown error');
          const stackLines = String(err?.stack || '')
            .split('\n')
            .map((l: string) => l.trim())
            .filter(Boolean)
            .slice(0, 10);

          const safeStringify = (v: any) => {
            try {
              return JSON.stringify(v, Object.getOwnPropertyNames(v), 2);
            } catch {
              try {
                return String(v);
              } catch {
                return '[unstringifiable]';
              }
            }
          };

          console.error('renderSurvivalMode failed', e);

          const wrapText = (text: string, maxChars: number) => {
            const out: string[] = [];
            const words = text.split(' ');
            let line = '';
            for (const w of words) {
              const next = line ? `${line} ${w}` : w;
              if (next.length > maxChars) {
                if (line) out.push(line);
                line = w;
              } else {
                line = next;
              }
            }
            if (line) out.push(line);
            return out;
          };

          ctx.save();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
          ctx.clearRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
          ctx.fillStyle = 'black';
          ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);

          // Big headline (so we know overlay is drawing)
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.font = '18px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('SURVIVAL RENDER ERROR', GAME_CONFIG.canvasWidth / 2, 70);

          // Panel
          const pad = 28;
          const panelW = GAME_CONFIG.canvasWidth - pad * 2;
          const panelH = 320;
          const px = pad;
          const py = 100;

          ctx.fillStyle = 'rgba(255,255,255,0.08)';
          ctx.fillRect(px, py, panelW, panelH);
          ctx.strokeStyle = 'rgba(255,255,255,0.28)';
          ctx.lineWidth = 2;
          ctx.strokeRect(px, py, panelW, panelH);

          ctx.font = '14px monospace';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';

          let y = py + 14;
          const x = px + 14;

          ctx.fillStyle = 'rgba(255,255,255,0.95)';
          ctx.fillText('Kopiera detta:', x, y);
          y += 22;

          ctx.fillStyle = 'rgba(255, 200, 200, 0.98)';
          ctx.fillText(`${name}: ${message}`, x, y);
          y += 22;

          // Stack
          ctx.fillStyle = 'rgba(200, 220, 255, 0.95)';
          const stackToShow = stackLines.length ? stackLines : ['(ingen stack)'];
          stackToShow.slice(0, 8).forEach((line: string) => {
            wrapText(line, 95).slice(0, 2).forEach((wl) => {
              ctx.fillText(wl, x, y);
              y += 18;
            });
          });

          y += 10;
          ctx.fillStyle = 'rgba(255,255,255,0.85)';
          ctx.fillText('Raw error object (för debug):', x, y);
          y += 18;

          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          wrapText(safeStringify(err).slice(0, 600), 95).slice(0, 6).forEach((line) => {
            ctx.fillText(line, x, y);
            y += 18;
          });

          ctx.restore();
        }
        return;
      }
      
      // Render pilot runner scene
      if (gameData.state === 'pilotRunner' && gameData.pilotRunnerState) {
        renderPilotRunner(ctx, gameData.pilotRunnerState as PilotRunnerState);
        return;
      }
      
      // Render paratrooper scene
      if (gameData.state === 'paratrooper' && gameData.paratrooperState) {
        renderParatrooper(ctx, gameData.paratrooperState as ParatrooperState);
        return;
      }
      
      // Render forward flight (deep drill) scene
      if (gameData.state === 'forwardFlight' && gameData.forwardFlightState) {
        renderForwardFlight(ctx, gameData.forwardFlightState as ForwardFlightState, GAME_CONFIG);
        return;
      }
      
      // Render Vector Maniac top-down arena
      if (gameData.state === 'vectorManiac' && gameData.vectorManiacState) {
        renderVectorManiac(ctx, gameData.vectorManiacState as VectorState);
        return;
      }

      // Render frame
      ctx.save();
      
      // Apply screen shake
      renderer.applyScreenShake(gameData.screenShake);

      // Get current map for themed rendering
      const currentMap = getMap(gameData.currentMapId);

      // Clear with map-specific background
      renderMapBackground(ctx, currentMap, gameData.scrollOffset);
      
      // Render parallax background effects for open space maps (no terrain)
      const isOpenSpace = !currentMap.hasTerrain;
      
      if (isOpenSpace && currentMap.hasStars) {
        // Render distant galaxies first (furthest back)
        renderer.renderDistantGalaxies(gameData.scrollOffset);
        
        // Render parallax nebulae
        if (currentMap.nebulaColors && currentMap.nebulaColors.length > 0) {
          renderer.renderParallaxNebulae(gameData.scrollOffset, currentMap.nebulaColors);
        }
      }
      
      // Render stars if map has them
      if (currentMap.hasStars) {
        renderer.renderStars(gameData.stars, gameData.scrollOffset, gameData.isHyperspace, isOpenSpace);
      }
      
      // Render atmospheric effects (fog, haze, nebula)
      renderAtmosphericEffects(ctx, currentMap, gameData.scrollOffset);
      
      // Render terrain if map has it - use new terrainType system
      const terrainType = getTerrainType(currentMap);
      if (terrainType !== 'openSpace') {
        renderer.renderTerrain(gameData.terrain, gameData.scrollOffset, currentMap.hasHazardousTerrain === true, terrainType, currentMap.environment);
      }
      
      // (Water surface removed - ceiling maps now have open bottom)
      
      renderer.renderPickups(gameData.pickups, gameData.scrollOffset);
      renderer.renderCivilians(gameData.civilians, gameData.scrollOffset);
      renderer.renderEnemies(gameData.enemies, gameData.scrollOffset);
      
      // Render escort planes
      gameData.escorts.forEach((escort: EscortPlane) => {
        renderEscortPlane(ctx, escort, gameData.scrollOffset);
      });
      
      // Render bombs with blue color for Valkyrie
      renderBombsWithColors(ctx, gameData);
      
      // Render bullets with laser support
      renderBulletsWithLasers(ctx, gameData, currentMap);
      
      // Get active ship skin colors
      const skinData = SHIP_SKINS.find(s => s.id === activeShipSkin) || SHIP_SKINS[0];
      const skinColors: ShipSkinColors = skinData.colors;
      
      // Check for mega ship stealth effect
      const megaShipId = getStoredMegaShipId();
      const isStealthShip = hasStealthMode(megaShipId);
      const isCurrentlyStealthed = gameData.isStealthActive;
      
      // Render player with stealth effect if active
      if (isStealthShip && isCurrentlyStealthed) {
        // Draw with blue halo and transparency
        ctx.save();
        ctx.globalAlpha = 0.4;
        renderer.renderPlayer(gameData.player, gameData.scrollOffset, skinColors, megaShipId);
        ctx.restore();
        
        // Draw blue stealth halo
        const playerX = gameData.player.x - gameData.scrollOffset + gameData.player.width / 2;
        const playerY = gameData.player.y + gameData.player.height / 2;
        const haloGrad = ctx.createRadialGradient(playerX, playerY, 0, playerX, playerY, 50);
        haloGrad.addColorStop(0, 'rgba(68, 136, 255, 0)');
        haloGrad.addColorStop(0.5, 'rgba(68, 136, 255, 0.15)');
        haloGrad.addColorStop(0.8, 'rgba(68, 136, 255, 0.3)');
        haloGrad.addColorStop(1, 'rgba(68, 136, 255, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.ellipse(playerX, playerY, 50, 25, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        renderer.renderPlayer(gameData.player, gameData.scrollOffset, skinColors, megaShipId);
      }
      
      renderer.renderFallingDebris(gameData.fallingDebris, gameData.scrollOffset);
      renderer.renderParticles(gameData.particles, gameData.scrollOffset);
      
      // Render collision flash effects
      if (gameData.collisionFlash && gameData.collisionFlash.length > 0) {
        renderer.renderCollisionFlash(gameData.collisionFlash, gameData.scrollOffset);
      }
      
      // Render warp effect during transitions
      if (gameData.isWarping) {
        if (gameData.isBonusWarp) {
          renderWarpEffect(ctx, gameData.warpTimer);
        } else {
          renderQuickWarpEffect(ctx, gameData.warpTimer);
        }
      }
      
      // Render hyperspace exit effect
      if (gameData.hyperspaceExitTimer > 0) {
        renderHyperspaceExitEffect(ctx, gameData.hyperspaceExitTimer);
      }
      
      renderer.renderRadar(gameData.enemies, gameData.civilians, gameData.player, gameData.scrollOffset);

      ctx.restore();
    }, [gameData, activeShipSkin]);

    return (
      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.canvasWidth}
        height={GAME_CONFIG.canvasHeight}
        className="pixel-perfect block"
        style={{ 
          imageRendering: 'pixelated',
          touchAction: 'none',
          width: '100vw',
          height: 'var(--app-height)',
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
    );
  }
);

GameCanvas.displayName = 'GameCanvas';

// Helper functions for map-based rendering
function renderMapBackground(ctx: CanvasRenderingContext2D, map: any, scrollOffset: number): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, GAME_CONFIG.canvasHeight);
  gradient.addColorStop(0, map.backgroundColor1);
  gradient.addColorStop(0.5, map.backgroundColor2);
  gradient.addColorStop(1, map.backgroundColor3);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
  
  // Render planet in background if present
  if (map.hasPlanetInBackground) {
    const planetX = GAME_CONFIG.canvasWidth * 0.75 - (scrollOffset * 0.02) % 100;
    const planetY = 80;
    const gradient = ctx.createRadialGradient(
      planetX - map.planetSize * 0.3, planetY - map.planetSize * 0.3, 0,
      planetX, planetY, map.planetSize
    );
    gradient.addColorStop(0, map.planetColor);
    gradient.addColorStop(0.7, map.planetColor);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(planetX, planetY, map.planetSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderAtmosphericEffects(ctx: CanvasRenderingContext2D, map: any, scrollOffset: number): void {
  // Nebula clouds
  if (map.hasNebula && map.nebulaColors.length > 0) {
    const time = Date.now() * 0.0002;
    map.nebulaColors.forEach((color: string, i: number) => {
      for (let j = 0; j < 3; j++) {
        const x = (scrollOffset * (0.1 + i * 0.05) + j * 300 + i * 150) % (GAME_CONFIG.canvasWidth + 400) - 200;
        const y = GAME_CONFIG.canvasHeight * (0.2 + i * 0.3) + Math.sin(time + j) * 30;
        const size = 150 + j * 50;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }
  
  // Aurora effect
  if (map.hasAurora && map.auroraColors.length > 0) {
    const time = Date.now() * 0.001;
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 5; i++) {
      const color = map.auroraColors[i % map.auroraColors.length];
      const y = 30 + i * 15 + Math.sin(time + i) * 10;
      const gradient = ctx.createLinearGradient(0, y, 0, y + 40);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.5, color);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, y, GAME_CONFIG.canvasWidth, 40);
    }
    ctx.globalAlpha = 1;
  }
  
  // Fog overlay
  if (map.hasFog) {
    ctx.fillStyle = map.fogColor;
    ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
  }
  
  // Haze effect
  if (map.hasHaze) {
    const hazeGradient = ctx.createLinearGradient(0, 0, 0, GAME_CONFIG.canvasHeight);
    hazeGradient.addColorStop(0, 'transparent');
    hazeGradient.addColorStop(0.7, map.hazeColor);
    hazeGradient.addColorStop(1, map.hazeColor);
    ctx.fillStyle = hazeGradient;
    ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
  }
}

function renderBulletsWithLasers(ctx: CanvasRenderingContext2D, gameData: GameData, map: any): void {
  // Check if we should use blue projectiles (Valkyrie ship)
  const megaShipId = getStoredMegaShipId();
  const useBlueProjectiles = hasBlueProjectiles(megaShipId);
  
  gameData.bullets.forEach(bullet => {
    const x = bullet.x - gameData.scrollOffset;
    
    if (bullet.isPlayerBullet) {
      // Check if this is a laser bullet (Blue Hawk) or regular
      if (bullet.isLaser) {
        // Blue Hawk laser beam
        ctx.save();
        ctx.shadowColor = '#44aaff';
        ctx.shadowBlur = 15;
        
        const laserLength = 25;
        ctx.strokeStyle = '#88ddff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x, bullet.y + bullet.height / 2);
        ctx.lineTo(x + laserLength, bullet.y + bullet.height / 2);
        ctx.stroke();
        
        // Core
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, bullet.y + bullet.height / 2);
        ctx.lineTo(x + laserLength, bullet.y + bullet.height / 2);
        ctx.stroke();
        
        ctx.restore();
      } else {
        // Regular player bullet - use blue for Valkyrie
        const bulletColor = useBlueProjectiles ? '#4488ff' : '#00ffff';
        const bulletGlowColor = useBlueProjectiles ? '#2266ff' : '#00ffff';
        
        const gradient = ctx.createLinearGradient(x, bullet.y, x + bullet.width, bullet.y);
        gradient.addColorStop(0, bulletColor);
        gradient.addColorStop(1, '#ffffff');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, bullet.y, bullet.width, bullet.height);
        
        ctx.shadowColor = bulletGlowColor;
        ctx.shadowBlur = 10;
        ctx.fillRect(x, bullet.y, bullet.width, bullet.height);
        ctx.shadowBlur = 0;
      }
    } else if (bullet.isLaser) {
      // Green laser with haze effect
      ctx.save();
      
      // Laser glow
      ctx.shadowColor = '#00ff00';
      ctx.shadowBlur = 15;
      
      // Main laser beam
      const laserLength = 20;
      const angle = Math.atan2(bullet.velocityY, bullet.velocityX);
      
      ctx.strokeStyle = '#88ff88';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, bullet.y);
      ctx.lineTo(x - Math.cos(angle) * laserLength, bullet.y - Math.sin(angle) * laserLength);
      ctx.stroke();
      
      // Core
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, bullet.y);
      ctx.lineTo(x - Math.cos(angle) * laserLength, bullet.y - Math.sin(angle) * laserLength);
      ctx.stroke();
      
      // Haze around laser
      const hazeGradient = ctx.createRadialGradient(x, bullet.y, 0, x, bullet.y, 15);
      hazeGradient.addColorStop(0, 'rgba(0, 255, 0, 0.3)');
      hazeGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = hazeGradient;
      ctx.beginPath();
      ctx.arc(x, bullet.y, 15, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    } else {
      // Regular enemy bullet
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.width / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function renderBombsWithColors(ctx: CanvasRenderingContext2D, gameData: GameData): void {
  const megaShipId = getStoredMegaShipId();
  const useBlue = hasBlueProjectiles(megaShipId);
  
  gameData.bombs.forEach(bomb => {
    const x = bomb.x - gameData.scrollOffset;
    
    ctx.save();
    
    // Bomb body with metallic gradient - blue for Valkyrie
    const bombGrad = ctx.createRadialGradient(
      x + bomb.width / 2 - 2, bomb.y + bomb.height / 2 - 2, 0,
      x + bomb.width / 2, bomb.y + bomb.height / 2, bomb.width / 2
    );
    
    if (useBlue) {
      bombGrad.addColorStop(0, '#88ccff');
      bombGrad.addColorStop(0.5, '#4488ff');
      bombGrad.addColorStop(1, '#2244aa');
    } else {
      bombGrad.addColorStop(0, '#ffcc00');
      bombGrad.addColorStop(0.5, '#ff8800');
      bombGrad.addColorStop(1, '#aa4400');
    }
    
    ctx.fillStyle = bombGrad;
    ctx.beginPath();
    ctx.arc(x + bomb.width / 2, bomb.y + bomb.height / 2, bomb.width / 2 + 1, 0, Math.PI * 2);
    ctx.fill();
    
    // Blinking light with glow
    const blinkOn = Math.floor(bomb.timer / 8) % 2 === 0;
    if (blinkOn) {
      ctx.shadowColor = useBlue ? '#4488ff' : '#ff0000';
      ctx.shadowBlur = 15;
      ctx.fillStyle = useBlue ? '#88ccff' : '#ff0000';
    } else {
      ctx.shadowBlur = 0;
      ctx.fillStyle = useBlue ? '#224488' : '#660000';
    }
    ctx.beginPath();
    ctx.arc(x + bomb.width / 2, bomb.y + bomb.height / 2, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Falling trail
    ctx.shadowBlur = 0;
    const trailColor = useBlue ? 'rgba(68, 136, 255, 0.5)' : 'rgba(255, 136, 0, 0.5)';
    const trailGrad = ctx.createLinearGradient(x + bomb.width / 2, bomb.y - 15, x + bomb.width / 2, bomb.y);
    trailGrad.addColorStop(0, 'transparent');
    trailGrad.addColorStop(1, trailColor);
    ctx.strokeStyle = trailGrad;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + bomb.width / 2, bomb.y);
    ctx.lineTo(x + bomb.width / 2, bomb.y - 15);
    ctx.stroke();
    
    ctx.restore();
  });
}

function renderWarpEffect(ctx: CanvasRenderingContext2D, warpTimer: number): void {
  const rawProgress = 1 - (warpTimer / WARP_DURATION);
  // Smooth easing for more cinematic feel
  const progress = rawProgress < 0.5 
    ? 4 * rawProgress * rawProgress * rawProgress 
    : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2;
  
  const centerX = GAME_CONFIG.canvasWidth / 2;
  const centerY = GAME_CONFIG.canvasHeight / 2;
  const time = Date.now() * 0.001;
  
  ctx.save();
  
  // Background darken/color shift
  const colorShift = Math.sin(progress * Math.PI) * 0.3;
  ctx.fillStyle = `rgba(${10 + colorShift * 50}, ${5 + colorShift * 30}, ${20 + colorShift * 60}, ${progress * 0.4})`;
  ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
  
  // Outer ring glow (tunnel effect)
  const tunnelGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, GAME_CONFIG.canvasWidth * 0.8);
  tunnelGradient.addColorStop(0, 'transparent');
  tunnelGradient.addColorStop(0.3, 'transparent');
  tunnelGradient.addColorStop(0.6, `rgba(0, 255, 255, ${progress * 0.15})`);
  tunnelGradient.addColorStop(0.8, `rgba(255, 0, 255, ${progress * 0.2})`);
  tunnelGradient.addColorStop(1, `rgba(255, 255, 255, ${progress * 0.5})`);
  ctx.fillStyle = tunnelGradient;
  ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
  
  ctx.translate(centerX, centerY);
  
  // Layer 1: Distant cyan streaks
  const streakCount1 = 80;
  for (let i = 0; i < streakCount1; i++) {
    const angle = (i / streakCount1) * Math.PI * 2 + time * 0.5;
    const baseLength = 30 + progress * 300;
    const length = baseLength + Math.sin(i * 1.5 + time * 3) * 30;
    const startDist = 15 + Math.sin(i * 2) * 5;
    
    const alpha = 0.2 + progress * 0.4 + Math.sin(i * 0.5 + time * 5) * 0.1;
    ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
    ctx.lineWidth = 0.5 + progress * 1.5;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * startDist, Math.sin(angle) * startDist);
    ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
    ctx.stroke();
  }
  
  // Layer 2: Mid magenta streaks
  const streakCount2 = 60;
  for (let i = 0; i < streakCount2; i++) {
    const angle = (i / streakCount2) * Math.PI * 2 - time * 0.3;
    const baseLength = 40 + progress * 350;
    const length = baseLength + Math.cos(i * 2 + time * 4) * 40;
    const startDist = 10 + Math.cos(i * 3) * 5;
    
    const alpha = 0.15 + progress * 0.35;
    ctx.strokeStyle = `rgba(255, 100, 255, ${alpha})`;
    ctx.lineWidth = 1 + progress * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * startDist, Math.sin(angle) * startDist);
    ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
    ctx.stroke();
  }
  
  // Layer 3: Bright white core streaks
  const streakCount3 = 40;
  for (let i = 0; i < streakCount3; i++) {
    const angle = (i / streakCount3) * Math.PI * 2 + time * 0.8;
    const baseLength = 50 + progress * 450;
    const length = baseLength + Math.random() * 60 * progress;
    const startDist = 5;
    
    const alpha = 0.3 + progress * 0.6;
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 1.5 + progress * 3;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10 * progress;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * startDist, Math.sin(angle) * startDist);
    ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
    ctx.stroke();
  }
  
  ctx.shadowBlur = 0;
  
  // Floating particles/sparks
  const particleCount = Math.floor(30 * progress);
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2 + time * 2;
    const dist = 20 + progress * 200 + Math.sin(i * 3 + time * 8) * 50;
    const size = 1 + Math.random() * 3 * progress;
    
    const hue = (i * 10 + time * 100) % 360;
    ctx.fillStyle = `hsla(${hue > 180 ? 180 : hue}, 100%, 70%, ${0.5 + Math.random() * 0.5})`;
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
  
  // Central glow
  const coreGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 80 * (1 - progress * 0.5));
  coreGlow.addColorStop(0, `rgba(255, 255, 255, ${progress * 0.8})`);
  coreGlow.addColorStop(0.3, `rgba(200, 230, 255, ${progress * 0.4})`);
  coreGlow.addColorStop(0.6, `rgba(150, 100, 255, ${progress * 0.2})`);
  coreGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = coreGlow;
  ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
  
  // Chromatic aberration effect on edges
  if (progress > 0.3) {
    const aberrationStrength = (progress - 0.3) * 0.15;
    ctx.fillStyle = `rgba(255, 0, 100, ${aberrationStrength})`;
    ctx.fillRect(0, 0, 5 + progress * 10, GAME_CONFIG.canvasHeight);
    ctx.fillRect(GAME_CONFIG.canvasWidth - 5 - progress * 10, 0, 5 + progress * 10, GAME_CONFIG.canvasHeight);
    
    ctx.fillStyle = `rgba(0, 100, 255, ${aberrationStrength})`;
    ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, 3 + progress * 6);
    ctx.fillRect(0, GAME_CONFIG.canvasHeight - 3 - progress * 6, GAME_CONFIG.canvasWidth, 3 + progress * 6);
  }
  
  // Smooth flash transition at the end
  if (progress > 0.7) {
    const flashProgress = (progress - 0.7) / 0.3;
    const flashEase = flashProgress * flashProgress; // Smooth ease-in
    
    // Color transition: cyan -> white
    const r = Math.floor(100 + flashEase * 155);
    const g = Math.floor(200 + flashEase * 55);
    const b = 255;
    
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${flashEase * 0.9})`;
    ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
  }
  
  // Final white flash
  if (progress > 0.9) {
    const finalFlash = (progress - 0.9) * 10;
    ctx.fillStyle = `rgba(255, 255, 255, ${finalFlash})`;
    ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
  }
}

// Quick warp effect for regular level transitions - simple and fast
function renderQuickWarpEffect(ctx: CanvasRenderingContext2D, warpTimer: number): void {
  const progress = 1 - (warpTimer / QUICK_WARP_DURATION);
  const centerX = GAME_CONFIG.canvasWidth / 2;
  const centerY = GAME_CONFIG.canvasHeight / 2;
  
  ctx.save();
  
  // Simple speed lines radiating from center
  const lineCount = 30;
  for (let i = 0; i < lineCount; i++) {
    const angle = (i / lineCount) * Math.PI * 2;
    const startDist = 10;
    const length = 50 + progress * 200;
    
    const alpha = 0.3 + progress * 0.5;
    ctx.strokeStyle = `rgba(100, 200, 255, ${alpha})`;
    ctx.lineWidth = 1 + progress * 2;
    ctx.beginPath();
    ctx.moveTo(centerX + Math.cos(angle) * startDist, centerY + Math.sin(angle) * startDist);
    ctx.lineTo(centerX + Math.cos(angle) * length, centerY + Math.sin(angle) * length);
    ctx.stroke();
  }
  
  // Quick white flash at the end
  if (progress > 0.6) {
    const flashProgress = (progress - 0.6) / 0.4;
    ctx.fillStyle = `rgba(255, 255, 255, ${flashProgress * 0.8})`;
    ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
  }
  
  ctx.restore();
}

// Hyperspace exit effect - visual deceleration from hyperspace
function renderHyperspaceExitEffect(ctx: CanvasRenderingContext2D, exitTimer: number): void {
  const progress = 1 - (exitTimer / 60); // 0 to 1 as effect completes
  const centerX = GAME_CONFIG.canvasWidth / 2;
  const centerY = GAME_CONFIG.canvasHeight / 2;
  const time = Date.now() * 0.001;
  
  ctx.save();
  
  // Deceleration blur lines - shrinking from edges to center
  const lineCount = Math.floor(60 * (1 - progress)); // Fewer lines as we slow down
  for (let i = 0; i < lineCount; i++) {
    const angle = (i / 60) * Math.PI * 2 + time * 0.5;
    const maxLength = GAME_CONFIG.canvasWidth * 0.6;
    const length = maxLength * (1 - progress * 0.8); // Lines get shorter
    const startDist = 20 + progress * 100; // Start further as we slow
    
    // Color cycle through cyan and white
    const alpha = (0.4 - progress * 0.35) * (0.8 + Math.sin(i * 0.5 + time * 3) * 0.2);
    if (alpha <= 0) continue;
    
    const hue = i % 2 === 0 ? 180 : 200; // Cyan variations
    ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${alpha})`;
    ctx.lineWidth = 2 - progress * 1.5;
    
    ctx.beginPath();
    ctx.moveTo(
      centerX + Math.cos(angle) * startDist,
      centerY + Math.sin(angle) * startDist
    );
    ctx.lineTo(
      centerX + Math.cos(angle) * (startDist + length),
      centerY + Math.sin(angle) * (startDist + length)
    );
    ctx.stroke();
  }
  
  // Shockwave ring expanding outward
  const ringProgress = progress * 2;
  if (ringProgress < 1.5) {
    const ringRadius = 30 + ringProgress * GAME_CONFIG.canvasWidth * 0.4;
    const ringAlpha = Math.max(0, 0.6 - ringProgress * 0.4);
    
    ctx.strokeStyle = `rgba(0, 255, 255, ${ringAlpha})`;
    ctx.lineWidth = 4 - ringProgress * 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner glow ring
    ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha * 0.7})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, ringRadius * 0.9, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Central flash at the start
  if (progress < 0.3) {
    const flashIntensity = (1 - progress / 0.3) * 0.5;
    const flashGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150);
    flashGrad.addColorStop(0, `rgba(255, 255, 255, ${flashIntensity})`);
    flashGrad.addColorStop(0.3, `rgba(100, 200, 255, ${flashIntensity * 0.6})`);
    flashGrad.addColorStop(0.6, `rgba(0, 150, 255, ${flashIntensity * 0.3})`);
    flashGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = flashGrad;
    ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
  }
  
  // Speed lines on edges - fading out
  if (progress < 0.7) {
    const edgeAlpha = (0.7 - progress) * 0.4;
    
    // Left edge
    const leftGrad = ctx.createLinearGradient(0, 0, 40, 0);
    leftGrad.addColorStop(0, `rgba(0, 200, 255, ${edgeAlpha})`);
    leftGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = leftGrad;
    ctx.fillRect(0, 0, 40, GAME_CONFIG.canvasHeight);
    
    // Right edge  
    const rightGrad = ctx.createLinearGradient(GAME_CONFIG.canvasWidth, 0, GAME_CONFIG.canvasWidth - 40, 0);
    rightGrad.addColorStop(0, `rgba(0, 200, 255, ${edgeAlpha})`);
    rightGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = rightGrad;
    ctx.fillRect(GAME_CONFIG.canvasWidth - 40, 0, 40, GAME_CONFIG.canvasHeight);
  }
  
  // Scattered energy particles dissipating
  const particleCount = Math.floor(20 * (1 - progress));
  for (let i = 0; i < particleCount; i++) {
    const px = (Math.sin(i * 7.3 + time) * 0.5 + 0.5) * GAME_CONFIG.canvasWidth;
    const py = (Math.cos(i * 5.7 + time * 1.3) * 0.5 + 0.5) * GAME_CONFIG.canvasHeight;
    const size = 2 + Math.sin(i + time * 5) * 1.5;
    const alpha = (1 - progress) * 0.6;
    
    ctx.fillStyle = `rgba(100, 220, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
}
