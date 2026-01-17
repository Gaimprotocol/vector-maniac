// Deep Drill Bonus Level - Underground Drilling Assault
// Drill vehicle that digs underground to destroy alien bases

import { GameConfig } from './types';
import { COLORS } from './constants';
import { drawMegaShip } from './megaShipRenderer';
import { getStoredMegaShipId } from '@/hooks/useMegaShips';

export interface DrillVehicle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  health: number;
  maxHealth: number;
  drillAngle: number;
  drillSpeed: number;
  fuel: number;
  maxFuel: number;
  isDigging: boolean;
  depth: number;
  basesDestroyed: number;
}

export interface UndergroundTile {
  x: number;
  y: number;
  type: 'dirt' | 'rock' | 'alien_base' | 'tunnel' | 'lava' | 'crystal';
  health: number;
  destroyed: boolean;
  variant: number; // For visual variation
}

export interface AlienBase {
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  destroyed: boolean;
  aliens: UndergroundAlien[];
  pulsePhase: number;
}

export interface UndergroundAlien {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  health: number;
  active: boolean;
  type: 'crawler' | 'shooter' | 'exploder';
  animPhase: number;
  tentaclePhase: number;
  leftBase: boolean; // Has left the base to attack
  targetX: number;
  targetY: number;
}

export interface DrillBullet {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  active: boolean;
  trail: { x: number; y: number; alpha: number }[];
}

export interface Debris {
  x: number;
  y: number;
  size: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  color: string;
}

export interface Particle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
}

export interface ForwardFlightInput {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  fire: boolean;
  special: boolean;
  touchX: number;
  touchY: number;
  isTouching: boolean;
}

export interface ForwardFlightState {
  vehicle: DrillVehicle;
  tiles: UndergroundTile[];
  bases: AlienBase[];
  bullets: DrillBullet[];
  debris: Debris[];
  particles: Particle[];
  stars: Star[];
  score: number;
  phase: 'landing' | 'running' | 'drilling' | 'underground' | 'ascending' | 'escaping' | 'showing_results' | 'complete' | 'failed';
  gameTime: number;
  savedCivilians: number;
  powerLevel: number;
  shieldLayers: number;
  cameraY: number;
  targetDepth: number;
  surfaceY: number;
  shipX: number;
  shipY: number;
  pilotX: number;
  pilotY: number;
  pilotRunning: boolean;
  drillVehicleX: number;
  escapeShipVisible: boolean;
  screenShake: number;
  lastFireTime: number;
  lastDirectionX: number;
  lastDirectionY: number;
  // Sound triggers
  sounds: {
    drill: boolean;
    shoot: boolean;
    explosion: boolean;
    crystalCollect: boolean;
    damage: boolean;
    baseDestroyed: boolean;
  };
}

const TILE_SIZE = 40;
const DRILL_SPEED = 1.7; // Reduced by 15%
const VEHICLE_SPEED = 3.4; // Reduced by 15%
const TOUCH_SMOOTHING = 0.12; // Slower, smoother movement
const TOUCH_OFFSET_X = 220; // 220px to the left of finger
const ALIEN_AGGRO_RANGE = 150; // Distance at which aliens leave base to attack

// Audio context for sound effects
let audioContext: AudioContext | null = null;
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

export function playDrillSound(type: 'drill' | 'shoot' | 'explosion' | 'crystal' | 'damage' | 'baseDestroyed'): void {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    switch (type) {
      case 'drill':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(80 + Math.random() * 40, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.05);
        break;
      case 'shoot':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
        break;
      case 'explosion':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
        break;
      case 'crystal':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
        break;
      case 'damage':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
        break;
      case 'baseDestroyed':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
        break;
    }
  } catch (e) {
    // Audio not supported
  }
}

export function createForwardFlightState(savedCivilians: number, config: GameConfig): ForwardFlightState {
  const powerLevel = Math.min(5, Math.floor(savedCivilians / 10) + 1);
  const shieldLayers = Math.min(3, Math.floor(savedCivilians / 20));
  
  const tiles: UndergroundTile[] = [];
  const bases: AlienBase[] = [];
  const stars: Star[] = [];
  
  // Generate stars
  for (let i = 0; i < 80; i++) {
    stars.push({
      x: Math.random() * config.canvasWidth,
      y: Math.random() * 100,
      size: 0.5 + Math.random() * 1.5,
      brightness: 0.3 + Math.random() * 0.7,
      twinkleSpeed: 1 + Math.random() * 3
    });
  }
  
  const targetDepth = 800 + Math.random() * 400;
  
  // Create underground tiles with variation - stop before black area
  // Map height = targetDepth + 100 (surface) - no extra padding
  for (let y = 100; y < targetDepth + 50; y += TILE_SIZE) {
    for (let x = 0; x < config.canvasWidth; x += TILE_SIZE) {
      const depth = y - 100;
      let type: UndergroundTile['type'] = 'dirt';
      
      if (depth > 200 && Math.random() < 0.3) type = 'rock';
      if (depth > 400 && Math.random() < 0.08) type = 'lava';
      if (Math.random() < 0.04) type = 'crystal';
      
      tiles.push({
        x,
        y,
        type,
        health: type === 'rock' ? 3 : type === 'lava' ? 999 : 1,
        destroyed: false,
        variant: Math.floor(Math.random() * 4)
      });
    }
  }
  
  // Create alien bases
  const numBases = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < numBases; i++) {
    const baseY = 300 + (targetDepth - 400) * (i / numBases);
    const baseX = 100 + Math.random() * (config.canvasWidth - 300);
    
    tiles.forEach(tile => {
      if (tile.x >= baseX - 60 && tile.x <= baseX + 160 &&
          tile.y >= baseY - 40 && tile.y <= baseY + 120) {
        tile.type = 'tunnel';
        tile.destroyed = true;
      }
    });
    
    const aliens: UndergroundAlien[] = [];
    const numAliens = 2 + Math.floor(Math.random() * 3);
    for (let j = 0; j < numAliens; j++) {
      aliens.push({
        x: baseX + 20 + Math.random() * 80,
        y: baseY + 20 + Math.random() * 40,
        width: 28,
        height: 28,
        velocityX: (Math.random() - 0.5) * 2,
        velocityY: 0,
        health: 3,
        active: true,
        type: ['crawler', 'shooter', 'exploder'][Math.floor(Math.random() * 3)] as UndergroundAlien['type'],
        animPhase: Math.random() * Math.PI * 2,
        tentaclePhase: Math.random() * Math.PI * 2,
        leftBase: false,
        targetX: baseX + 60,
        targetY: baseY + 40
      });
    }
    
    bases.push({
      x: baseX,
      y: baseY,
      width: 120,
      height: 80,
      health: 50 + powerLevel * 10,
      maxHealth: 50 + powerLevel * 10,
      destroyed: false,
      aliens,
      pulsePhase: Math.random() * Math.PI * 2
    });
  }
  
  return {
    vehicle: {
      x: config.canvasWidth / 2,
      y: 120,
      targetX: config.canvasWidth / 2,
      targetY: 120,
      width: 50,
      height: 30,
      velocityX: 0,
      velocityY: 0,
      health: 100 + shieldLayers * 25,
      maxHealth: 100 + shieldLayers * 25,
      drillAngle: 0,
      drillSpeed: DRILL_SPEED + powerLevel * 0.3,
      fuel: 100,
      maxFuel: 100,
      isDigging: false,
      depth: 0,
      basesDestroyed: 0
    },
    tiles,
    bases,
    bullets: [],
    debris: [],
    particles: [],
    stars,
    score: 0,
    phase: 'landing',
    gameTime: 0,
    savedCivilians,
    powerLevel,
    shieldLayers,
    cameraY: 0,
    targetDepth,
    surfaceY: 100,
    shipX: -100,
    shipY: 60,
    pilotX: 0,
    pilotY: 0,
    pilotRunning: false,
    drillVehicleX: config.canvasWidth / 2 + 100,
    escapeShipVisible: false,
    screenShake: 0,
    lastFireTime: 0,
    lastDirectionX: 0,
    lastDirectionY: 1,
    sounds: {
      drill: false,
      shoot: false,
      explosion: false,
      crystalCollect: false,
      damage: false,
      baseDestroyed: false
    }
  };
}

export function updateForwardFlight(
  state: ForwardFlightState,
  input: ForwardFlightInput,
  deltaTime: number,
  config: GameConfig
): ForwardFlightState {
  const dt = deltaTime / 16.67;
  let newState = { ...state };
  newState.gameTime += deltaTime;
  
  // Reset sound triggers
  newState.sounds = {
    drill: false,
    shoot: false,
    explosion: false,
    crystalCollect: false,
    damage: false,
    baseDestroyed: false
  };
  
  // Decrease screen shake
  newState.screenShake = Math.max(0, newState.screenShake - 0.5 * dt);
  
  // Phase: Landing
  if (state.phase === 'landing') {
    newState.shipX += 3 * dt;
    newState.shipY = 60 + Math.sin(state.gameTime * 0.005) * 10;
    
    // Add engine particles
    if (Math.random() < 0.5) {
      newState.particles = [...newState.particles, {
        x: newState.shipX - 10,
        y: newState.shipY + 15 + (Math.random() - 0.5) * 10,
        velocityX: -3 - Math.random() * 2,
        velocityY: (Math.random() - 0.5) * 2,
        size: 3 + Math.random() * 4,
        color: Math.random() > 0.5 ? '#ff8800' : '#ffff00',
        alpha: 1,
        life: 20
      }];
    }
    
    if (newState.shipX > config.canvasWidth / 2 - 50) {
      newState.shipX = config.canvasWidth / 2 - 50;
      newState.shipY = 80;
      newState.phase = 'running';
      newState.pilotX = newState.shipX + 20;
      newState.pilotY = 85;
      newState.pilotRunning = true;
    }
    return updateParticlesAndDebris(newState, dt);
  }
  
  // Phase: Running
  if (state.phase === 'running') {
    newState.pilotX += 4 * dt;
    newState.pilotY = 85 + Math.abs(Math.sin(state.gameTime * 0.02)) * 3;
    
    // Dust particles while running
    if (Math.random() < 0.3) {
      newState.particles = [...newState.particles, {
        x: newState.pilotX,
        y: newState.pilotY + 10,
        velocityX: -1 - Math.random(),
        velocityY: -0.5,
        size: 2 + Math.random() * 2,
        color: '#aa8866',
        alpha: 0.6,
        life: 15
      }];
    }
    
    if (newState.pilotX >= newState.drillVehicleX - 20) {
      newState.phase = 'drilling';
      newState.pilotRunning = false;
      newState.vehicle.x = newState.drillVehicleX;
      newState.vehicle.y = 90;
      newState.vehicle.targetX = newState.vehicle.x;
      newState.vehicle.targetY = newState.vehicle.y;
    }
    return updateParticlesAndDebris(newState, dt);
  }
  
  // Phase: Drilling
  if (state.phase === 'drilling') {
    newState.vehicle.drillAngle += 15 * dt;
    newState.vehicle.y += 1.5 * dt;
    newState.vehicle.isDigging = true;
    newState.sounds.drill = true;
    
    // Drilling debris
    if (Math.random() < 0.4) {
      newState.debris = [...newState.debris, createDebris(
        newState.vehicle.x + 25 + (Math.random() - 0.5) * 20,
        newState.vehicle.y + 35,
        '#8B4513'
      )];
    }
    
    if (newState.vehicle.y > newState.surfaceY + 50) {
      newState.phase = 'underground';
      newState.vehicle.depth = newState.vehicle.y - newState.surfaceY;
    }
    return updateParticlesAndDebris(newState, dt);
  }
  
  // Phase: Underground - Main gameplay with touch support
  if (state.phase === 'underground') {
    // Track movement direction for shooting
    const prevX = newState.vehicle.x;
    const prevY = newState.vehicle.y;
    
    // Touch-based movement - vehicle follows finger with improved response
    if (input.isTouching) {
      // Get canvas rect for proper coordinate calculation
      // The touch coordinates are already in canvas space from useTouchInput
      // Position ship 220px to the LEFT of finger
      const targetX = Math.max(20, Math.min(config.canvasWidth - 70, input.touchX - TOUCH_OFFSET_X));
      const targetY = input.touchY + newState.cameraY;
      
      newState.vehicle.targetX = targetX;
      newState.vehicle.targetY = targetY;
      
      // Smooth movement toward target
      const dx = newState.vehicle.targetX - newState.vehicle.x;
      const dy = newState.vehicle.targetY - newState.vehicle.y;
      
      newState.vehicle.velocityX = dx * TOUCH_SMOOTHING;
      newState.vehicle.velocityY = dy * TOUCH_SMOOTHING;
      newState.vehicle.isDigging = true;
      
      // Calculate shoot direction based on movement
      const moveX = newState.vehicle.velocityX;
      const moveY = newState.vehicle.velocityY;
      const moveMag = Math.hypot(moveX, moveY);
      
      // Update last direction if moving significantly
      if (moveMag > 0.5) {
        newState.lastDirectionX = moveX / moveMag;
        newState.lastDirectionY = moveY / moveMag;
      }
      
    } else {
      // Keyboard fallback
      const moveSpeed = VEHICLE_SPEED * dt;
      
      if (input.left) newState.vehicle.velocityX = -moveSpeed;
      else if (input.right) newState.vehicle.velocityX = moveSpeed;
      else newState.vehicle.velocityX *= 0.85;
      
      if (input.down) {
        newState.vehicle.velocityY = moveSpeed * 0.8;
        newState.vehicle.isDigging = true;
      } else if (input.up) {
        newState.vehicle.velocityY = -moveSpeed * 0.6;
        newState.vehicle.isDigging = true;
      } else {
        newState.vehicle.velocityY *= 0.85;
        newState.vehicle.isDigging = Math.abs(newState.vehicle.velocityX) > 0.5 || Math.abs(newState.vehicle.velocityY) > 0.5;
      }
      
      // Update last direction based on keyboard input
      const moveX = newState.vehicle.velocityX;
      const moveY = newState.vehicle.velocityY;
      const moveMag = Math.hypot(moveX, moveY);
      
      if (moveMag > 0.5) {
        newState.lastDirectionX = moveX / moveMag;
        newState.lastDirectionY = moveY / moveMag;
      }
      
    }
    
    // Always auto-fire in last known direction
    if (newState.gameTime - newState.lastFireTime > 150) {
      const bulletVX = newState.lastDirectionX * 10;
      const bulletVY = newState.lastDirectionY * 10;
      
      newState.bullets = [...newState.bullets, createBullet(
        newState.vehicle.x + 25,
        newState.vehicle.y + 20,
        bulletVX,
        bulletVY
      )];
      newState.lastFireTime = newState.gameTime;
      newState.sounds.shoot = true;
    }
    
    // Apply velocity
    const newX = newState.vehicle.x + newState.vehicle.velocityX;
    const newY = newState.vehicle.y + newState.vehicle.velocityY;
    
    // Max depth limit at 800 meters
    const MAX_DEPTH = 800;
    const maxY = newState.surfaceY + MAX_DEPTH;
    
    newState.vehicle.x = Math.max(20, Math.min(config.canvasWidth - 70, newX));
    newState.vehicle.y = Math.max(newState.surfaceY, Math.min(maxY, newY));
    newState.vehicle.depth = newState.vehicle.y - newState.surfaceY;
    
    // Note: Map ends at 800m but game continues - player just can't go deeper
    
    // Drill animation
    if (newState.vehicle.isDigging) {
      newState.vehicle.drillAngle += newState.vehicle.drillSpeed * 10 * dt;
      newState.sounds.drill = true;
    }
    
    // Dig through tiles
    newState.tiles = newState.tiles.map(tile => {
      if (tile.destroyed) return tile;
      
      const vehicleCenterX = newState.vehicle.x + 25;
      const vehicleFrontY = newState.vehicle.y + 30;
      
      if (vehicleCenterX > tile.x - 10 && vehicleCenterX < tile.x + TILE_SIZE + 10 &&
          vehicleFrontY > tile.y - 10 && vehicleFrontY < tile.y + TILE_SIZE + 10) {
        
        if (tile.type === 'lava') {
          newState.vehicle.health -= 0.5 * dt;
          newState.sounds.damage = true;
          newState.screenShake = 3;
        } else if (tile.type === 'crystal') {
          newState.score += 50;
          newState.sounds.crystalCollect = true;
          // Crystal sparkle particles
          for (let i = 0; i < 5; i++) {
            newState.particles = [...newState.particles, {
              x: tile.x + TILE_SIZE / 2,
              y: tile.y + TILE_SIZE / 2,
              velocityX: (Math.random() - 0.5) * 4,
              velocityY: (Math.random() - 0.5) * 4,
              size: 3 + Math.random() * 3,
              color: `hsl(${180 + Math.random() * 60}, 80%, 70%)`,
              alpha: 1,
              life: 30
            }];
          }
          return { ...tile, destroyed: true };
        } else {
          const newHealth = tile.health - (newState.vehicle.drillSpeed * 0.1 * dt);
          if (newHealth <= 0) {
            newState.debris = [...newState.debris, createDebris(
              tile.x + TILE_SIZE / 2,
              tile.y,
              tile.type === 'rock' ? '#666' : '#8B4513'
            )];
            return { ...tile, destroyed: true };
          }
          return { ...tile, health: newHealth };
        }
      }
      return tile;
    });
    
    // Update bullets with trails - now move in both X and Y
    newState.bullets = newState.bullets.map(bullet => {
      if (!bullet.active) return bullet;
      const newBullet = {
        ...bullet,
        x: bullet.x + bullet.velocityX * dt,
        y: bullet.y + bullet.velocityY * dt,
        trail: [
          { x: bullet.x, y: bullet.y, alpha: 1 },
          ...bullet.trail.map(t => ({ ...t, alpha: t.alpha - 0.15 })).filter(t => t.alpha > 0)
        ].slice(0, 8)
      };
      return newBullet;
    }).filter(b => b.active && 
      b.x > -50 && b.x < config.canvasWidth + 50 && 
      b.y > newState.cameraY - 50 && b.y < newState.cameraY + config.canvasHeight + 50);
    
    // Update bases and aliens
    newState.bases = newState.bases.map(base => {
      if (base.destroyed) return base;
      
      base.pulsePhase += 0.05 * dt;
      
      // Check bullet hits
      newState.bullets.forEach(bullet => {
        if (!bullet.active) return;
        if (bullet.x > base.x && bullet.x < base.x + base.width &&
            bullet.y > base.y && bullet.y < base.y + base.height) {
          base.health -= 10 + newState.powerLevel * 2;
          bullet.active = false;
          newState.score += 10;
          newState.screenShake = 2;
          
          // Hit particles
          for (let i = 0; i < 3; i++) {
            newState.particles = [...newState.particles, {
              x: bullet.x,
              y: bullet.y,
              velocityX: (Math.random() - 0.5) * 3,
              velocityY: (Math.random() - 0.5) * 3,
              size: 4 + Math.random() * 4,
              color: '#ff00ff',
              alpha: 1,
              life: 20
            }];
          }
        }
      });
      
      if (base.health <= 0) {
        newState.score += 500;
        newState.vehicle.basesDestroyed++;
        newState.screenShake = 8;
        newState.sounds.baseDestroyed = true;
        
        // Explosion particles
        for (let i = 0; i < 20; i++) {
          newState.particles = [...newState.particles, {
            x: base.x + base.width / 2,
            y: base.y + base.height / 2,
            velocityX: (Math.random() - 0.5) * 8,
            velocityY: (Math.random() - 0.5) * 8,
            size: 5 + Math.random() * 8,
            color: ['#ff0000', '#ff8800', '#ffff00', '#ff00ff'][Math.floor(Math.random() * 4)],
            alpha: 1,
            life: 40
          }];
        }
        
        return { ...base, destroyed: true, aliens: base.aliens.map(a => ({ ...a, active: false })) };
      }
      
      // Update aliens - they leave base and attack when player is near
      const updatedAliens = base.aliens.map(alien => {
        if (!alien.active) return alien;
        
        alien.animPhase += 0.1 * dt;
        alien.tentaclePhase += 0.15 * dt;
        
        const playerCenterX = newState.vehicle.x + 25;
        const playerCenterY = newState.vehicle.y + 15;
        const distToPlayer = Math.hypot(playerCenterX - alien.x, playerCenterY - alien.y);
        
        // Check if player is close enough to trigger aggro
        if (distToPlayer < ALIEN_AGGRO_RANGE && !alien.leftBase) {
          alien.leftBase = true;
        }
        
        let newAlienX = alien.x;
        let newAlienY = alien.y;
        
        if (alien.leftBase) {
          // Chase the player!
          alien.targetX = playerCenterX;
          alien.targetY = playerCenterY;
          
          const dx = alien.targetX - alien.x;
          const dy = alien.targetY - alien.y;
          const dist = Math.hypot(dx, dy);
          
          if (dist > 5) {
            const speed = alien.type === 'exploder' ? 2.5 : alien.type === 'shooter' ? 1.5 : 2;
            alien.velocityX = (dx / dist) * speed;
            alien.velocityY = (dy / dist) * speed;
          }
          
          newAlienX = alien.x + alien.velocityX * dt;
          newAlienY = alien.y + alien.velocityY * dt;
        } else {
          // Patrol inside base
          newAlienX = alien.x + alien.velocityX * dt;
          if (newAlienX < base.x || newAlienX > base.x + base.width - 20) {
            alien.velocityX *= -1;
            newAlienX = alien.x;
          }
        }
        
        // Check bullet hits
        newState.bullets.forEach(bullet => {
          if (!bullet.active) return;
          if (bullet.x > alien.x - 10 && bullet.x < alien.x + alien.width + 10 &&
              bullet.y > alien.y - 10 && bullet.y < alien.y + alien.height + 10) {
            alien.health--;
            bullet.active = false;
            newState.score += 25;
            if (alien.health <= 0) {
              alien.active = false;
              newState.score += 50;
              newState.sounds.explosion = true;
              // Death particles
              for (let i = 0; i < 8; i++) {
                newState.particles = [...newState.particles, {
                  x: alien.x + alien.width / 2,
                  y: alien.y + alien.height / 2,
                  velocityX: (Math.random() - 0.5) * 6,
                  velocityY: (Math.random() - 0.5) * 6,
                  size: 4 + Math.random() * 4,
                  color: alien.type === 'exploder' ? '#ff4400' : alien.type === 'shooter' ? '#00ff88' : '#aa44ff',
                  alpha: 1,
                  life: 25
                }];
              }
            }
          }
        });
        
        // Damage player on contact
        if (distToPlayer < 35) {
          const damageAmount = alien.type === 'exploder' ? 0.8 : 0.4;
          newState.vehicle.health -= damageAmount * dt;
          newState.sounds.damage = true;
          
          // Exploder explodes on contact
          if (alien.type === 'exploder' && distToPlayer < 25) {
            alien.active = false;
            newState.vehicle.health -= 15;
            newState.screenShake = 6;
            newState.sounds.explosion = true;
            for (let i = 0; i < 12; i++) {
              newState.particles = [...newState.particles, {
                x: alien.x + alien.width / 2,
                y: alien.y + alien.height / 2,
                velocityX: (Math.random() - 0.5) * 8,
                velocityY: (Math.random() - 0.5) * 8,
                size: 6 + Math.random() * 6,
                color: ['#ff4400', '#ff8800', '#ffff00'][Math.floor(Math.random() * 3)],
                alpha: 1,
                life: 30
              }];
            }
          }
        }
        
        return { ...alien, x: newAlienX, y: newAlienY };
      });
      
      return { ...base, aliens: updatedAliens };
    });
    
    // Camera follows vehicle
    newState.cameraY = Math.max(0, newState.vehicle.y - 150);
    
    if (newState.bases.every(b => b.destroyed)) {
      newState.phase = 'ascending';
    }
    
    if (newState.vehicle.health <= 0) {
      newState.phase = 'failed';
      newState.sounds.explosion = true;
    }
  }
  
  // Phase: Ascending
  if (state.phase === 'ascending') {
    if (input.isTouching) {
      const targetX = input.touchX - 25;
      const dx = targetX - newState.vehicle.x;
      newState.vehicle.velocityX = dx * TOUCH_SMOOTHING;
    } else {
      const moveSpeed = VEHICLE_SPEED * dt;
      if (input.left) newState.vehicle.velocityX = -moveSpeed;
      else if (input.right) newState.vehicle.velocityX = moveSpeed;
      else newState.vehicle.velocityX *= 0.85;
    }
    
    // Auto-ascend
    newState.vehicle.velocityY = -VEHICLE_SPEED * dt * 1.2;
    if (input.up || input.isTouching) newState.vehicle.velocityY = -VEHICLE_SPEED * dt * 1.5;
    
    newState.vehicle.x += newState.vehicle.velocityX;
    newState.vehicle.y += newState.vehicle.velocityY;
    newState.vehicle.drillAngle += 12 * dt;
    newState.vehicle.isDigging = true;
    newState.sounds.drill = true;
    
    // Dig upward
    newState.tiles = newState.tiles.map(tile => {
      if (tile.destroyed) return tile;
      
      const vehicleCenterX = newState.vehicle.x + 25;
      const vehicleTopY = newState.vehicle.y;
      
      if (vehicleCenterX > tile.x - 10 && vehicleCenterX < tile.x + TILE_SIZE + 10 &&
          vehicleTopY > tile.y && vehicleTopY < tile.y + TILE_SIZE + 20) {
        if (tile.type !== 'lava') {
          newState.debris = [...newState.debris, createDebris(tile.x + TILE_SIZE / 2, tile.y, '#8B4513')];
          return { ...tile, destroyed: true };
        }
      }
      return tile;
    });
    
    newState.cameraY = Math.max(0, newState.vehicle.y - 150);
    
    if (newState.vehicle.y <= newState.surfaceY + 20) {
      newState.phase = 'escaping';
      newState.escapeShipVisible = true;
      newState.shipX = -100;
      newState.shipY = 60;
    }
  }
  
  // Phase: Escaping
  if (state.phase === 'escaping') {
    newState.shipX += 4 * dt;
    newState.shipY = 60 + Math.sin(state.gameTime * 0.005) * 5;
    
    // Engine particles
    if (Math.random() < 0.6) {
      newState.particles = [...newState.particles, {
        x: newState.shipX - 10,
        y: newState.shipY + 15,
        velocityX: -4 - Math.random() * 3,
        velocityY: (Math.random() - 0.5) * 2,
        size: 4 + Math.random() * 5,
        color: Math.random() > 0.5 ? '#ff8800' : '#ffff00',
        alpha: 1,
        life: 25
      }];
    }
    
    const targetX = newState.shipX + 20;
    newState.vehicle.x += (targetX - newState.vehicle.x) * 0.02 * dt;
    newState.vehicle.y += (70 - newState.vehicle.y) * 0.02 * dt;
    
    if (newState.shipX > config.canvasWidth + 100) {
      newState.phase = 'showing_results';
      newState.score += 1000 + newState.savedCivilians * 10;
    }
  }
  
  // Phase: Showing Results - wait for tap
  if (state.phase === 'showing_results') {
    if (input.isTouching || input.fire) {
      newState.phase = 'complete';
    }
    return newState;
  }
  
  return updateParticlesAndDebris(newState, dt);
}

function createDebris(x: number, y: number, color: string): Debris {
  return {
    x,
    y,
    size: 4 + Math.random() * 5,
    velocityX: (Math.random() - 0.5) * 4,
    velocityY: -2 - Math.random() * 3,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10,
    alpha: 1,
    color
  };
}

function createBullet(x: number, y: number, velocityX: number = 0, velocityY: number = 8): DrillBullet {
  return {
    x,
    y,
    velocityX,
    velocityY,
    active: true,
    trail: []
  };
}

function updateParticlesAndDebris(state: ForwardFlightState, dt: number): ForwardFlightState {
  // Update particles
  state.particles = state.particles.map(p => ({
    ...p,
    x: p.x + p.velocityX * dt,
    y: p.y + p.velocityY * dt,
    alpha: p.alpha - (1 / p.life) * dt,
    size: p.size * 0.98
  })).filter(p => p.alpha > 0);
  
  // Update debris
  state.debris = state.debris.map(d => ({
    ...d,
    x: d.x + d.velocityX * dt,
    y: d.y + d.velocityY * dt,
    velocityY: d.velocityY + 0.2 * dt,
    rotation: d.rotation + d.rotationSpeed * dt,
    alpha: d.alpha - 0.02 * dt
  })).filter(d => d.alpha > 0);
  
  return state;
}

export function renderForwardFlight(
  ctx: CanvasRenderingContext2D,
  state: ForwardFlightState,
  config: GameConfig
): void {
  ctx.save();
  
  // Screen shake
  if (state.screenShake > 0) {
    ctx.translate(
      (Math.random() - 0.5) * state.screenShake * 2,
      (Math.random() - 0.5) * state.screenShake * 2
    );
  }
  
  // Deep space gradient background - matching main game style
  const skyGradient = ctx.createLinearGradient(0, 0, 0, state.surfaceY);
  skyGradient.addColorStop(0, '#020408');
  skyGradient.addColorStop(0.3, '#050a14');
  skyGradient.addColorStop(0.6, '#080612');
  skyGradient.addColorStop(1, '#0a040c');
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, config.canvasWidth, state.surfaceY);
  
  // Render stars with twinkling and depth layers
  state.stars.forEach((star, i) => {
    const twinkle = Math.sin(state.gameTime * star.twinkleSpeed * 0.003) * 0.3 + 0.7;
    const brightness = star.brightness * twinkle;
    
    // Layer-specific colors for depth
    let starColor: string;
    if (star.size < 0.8) {
      // Distant stars - cool blue/white tones
      starColor = `rgba(180, 200, 255, ${brightness})`;
    } else if (star.size < 1.2) {
      // Mid-distance stars
      starColor = `rgba(255, 255, 240, ${brightness})`;
    } else {
      // Close stars - warmer, varied
      const colors = [
        `rgba(255, 255, 240, ${brightness})`,
        `rgba(255, 200, 150, ${brightness})`,
        `rgba(150, 200, 255, ${brightness})`,
      ];
      starColor = colors[i % colors.length];
    }
    
    ctx.save();
    ctx.shadowColor = starColor;
    ctx.shadowBlur = star.size * 3;
    ctx.fillStyle = starColor;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Enhanced glow for larger stars
    if (star.size > 1.2) {
      const glowSize = star.size * 4;
      const glowGrad = ctx.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, glowSize
      );
      glowGrad.addColorStop(0, starColor);
      glowGrad.addColorStop(0.3, starColor.replace(/[\d.]+\)$/, `${brightness * 0.3})`));
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
  
  // Subtle nebula clouds - matching main game style
  const nebulaGradient1 = ctx.createRadialGradient(
    config.canvasWidth * 0.3, 30, 0,
    config.canvasWidth * 0.3, 30, 120
  );
  nebulaGradient1.addColorStop(0, 'rgba(0, 100, 150, 0.08)');
  nebulaGradient1.addColorStop(0.5, 'rgba(0, 80, 120, 0.04)');
  nebulaGradient1.addColorStop(1, 'transparent');
  ctx.fillStyle = nebulaGradient1;
  ctx.fillRect(0, 0, config.canvasWidth, state.surfaceY);
  
  const nebulaGradient2 = ctx.createRadialGradient(
    config.canvasWidth * 0.75, 50, 0,
    config.canvasWidth * 0.75, 50, 100
  );
  nebulaGradient2.addColorStop(0, 'rgba(80, 0, 120, 0.1)');
  nebulaGradient2.addColorStop(0.5, 'rgba(50, 0, 80, 0.05)');
  nebulaGradient2.addColorStop(1, 'transparent');
  ctx.fillStyle = nebulaGradient2;
  ctx.fillRect(0, 0, config.canvasWidth, state.surfaceY);
  
  // Planetary surface with atmospheric glow
  const groundY = state.surfaceY - state.cameraY;
  
  // Atmospheric haze above surface
  const hazeGrad = ctx.createLinearGradient(0, groundY - 30, 0, groundY);
  hazeGrad.addColorStop(0, 'transparent');
  hazeGrad.addColorStop(0.5, 'rgba(80, 60, 40, 0.15)');
  hazeGrad.addColorStop(1, 'rgba(60, 40, 30, 0.3)');
  ctx.fillStyle = hazeGrad;
  ctx.fillRect(0, groundY - 30, config.canvasWidth, 30);
  
  // Ground surface with enhanced styling
  ctx.save();
  ctx.shadowColor = '#ff6600';
  ctx.shadowBlur = 10;
  const surfaceGrad = ctx.createLinearGradient(0, groundY, 0, groundY + 25);
  surfaceGrad.addColorStop(0, '#3a2818');
  surfaceGrad.addColorStop(0.5, '#2a1a10');
  surfaceGrad.addColorStop(1, '#1a0f08');
  ctx.fillStyle = surfaceGrad;
  ctx.fillRect(0, groundY, config.canvasWidth, 25);
  ctx.restore();
  
  // Surface detail line
  ctx.strokeStyle = '#5a3a20';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(config.canvasWidth, groundY);
  ctx.stroke();
  
  // Underground background with rich depth gradient
  const underY = Math.max(0, groundY);
  const undergroundGradient = ctx.createLinearGradient(0, underY, 0, config.canvasHeight);
  undergroundGradient.addColorStop(0, '#2a1a0a');
  undergroundGradient.addColorStop(0.2, '#1a0f05');
  undergroundGradient.addColorStop(0.5, '#100804');
  undergroundGradient.addColorStop(1, '#080402');
  ctx.fillStyle = undergroundGradient;
  ctx.fillRect(0, underY, config.canvasWidth, config.canvasHeight - underY);
  
  // Add subtle rock texture to underground
  ctx.save();
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 20; i++) {
    const rockX = (i * 47 + state.gameTime * 0.01) % config.canvasWidth;
    const rockY = underY + 50 + (i * 31) % (config.canvasHeight - underY - 80);
    const rockSize = 20 + (i % 5) * 10;
    const rockGrad = ctx.createRadialGradient(rockX, rockY, 0, rockX, rockY, rockSize);
    rockGrad.addColorStop(0, 'rgba(80, 50, 30, 0.3)');
    rockGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = rockGrad;
    ctx.beginPath();
    ctx.arc(rockX, rockY, rockSize, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  
  // Render tiles with enhanced graphics
  state.tiles.forEach(tile => {
    if (tile.destroyed) return;
    
    const screenY = tile.y - state.cameraY;
    if (screenY < -TILE_SIZE || screenY > config.canvasHeight + TILE_SIZE) return;
    
    ctx.save();
    
    switch (tile.type) {
      case 'dirt':
        const dirtGrad = ctx.createLinearGradient(tile.x, screenY, tile.x, screenY + TILE_SIZE);
        dirtGrad.addColorStop(0, '#6b4423');
        dirtGrad.addColorStop(0.5, '#5c3a1e');
        dirtGrad.addColorStop(1, '#4a2f18');
        ctx.fillStyle = dirtGrad;
        ctx.fillRect(tile.x, screenY, TILE_SIZE - 1, TILE_SIZE - 1);
        
        // Dirt texture dots
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        for (let i = 0; i < 3; i++) {
          const dx = ((tile.variant + i) * 13) % (TILE_SIZE - 4);
          const dy = ((tile.variant + i) * 17) % (TILE_SIZE - 4);
          ctx.beginPath();
          ctx.arc(tile.x + 2 + dx, screenY + 2 + dy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
        
      case 'rock':
        const rockGrad = ctx.createLinearGradient(tile.x, screenY, tile.x + TILE_SIZE, screenY + TILE_SIZE);
        rockGrad.addColorStop(0, '#555');
        rockGrad.addColorStop(0.3, '#666');
        rockGrad.addColorStop(0.7, '#555');
        rockGrad.addColorStop(1, '#444');
        ctx.fillStyle = rockGrad;
        ctx.fillRect(tile.x, screenY, TILE_SIZE - 1, TILE_SIZE - 1);
        
        // Rock cracks
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tile.x + 5, screenY + 10);
        ctx.lineTo(tile.x + 20, screenY + 25);
        ctx.lineTo(tile.x + 35, screenY + 15);
        ctx.stroke();
        break;
        
      case 'lava':
        const lavaHue = 20 + Math.sin(state.gameTime * 0.01 + tile.x * 0.1) * 15;
        const lavaBright = 50 + Math.sin(state.gameTime * 0.02 + tile.y * 0.1) * 10;
        ctx.fillStyle = `hsl(${lavaHue}, 100%, ${lavaBright}%)`;
        ctx.fillRect(tile.x, screenY, TILE_SIZE - 1, TILE_SIZE - 1);
        
        // Lava glow
        ctx.save();
        ctx.shadowColor = '#ff4400';
        ctx.shadowBlur = 15;
        ctx.fillStyle = `hsla(${lavaHue + 20}, 100%, 70%, 0.5)`;
        ctx.beginPath();
        ctx.arc(tile.x + TILE_SIZE / 2, screenY + TILE_SIZE / 2, TILE_SIZE / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
        
      case 'crystal':
        // Neon orb instead of crystal
        const orbHue = (state.gameTime * 0.1 + tile.x * 0.5) % 360;
        const orbPulse = 0.7 + Math.sin(state.gameTime * 0.008 + tile.y * 0.1) * 0.3;
        const orbCenterX = tile.x + TILE_SIZE / 2;
        const orbCenterY = screenY + TILE_SIZE / 2;
        
        ctx.save();
        // Outer glow
        const outerGlow = ctx.createRadialGradient(orbCenterX, orbCenterY, 0, orbCenterX, orbCenterY, TILE_SIZE * 0.7);
        outerGlow.addColorStop(0, `hsla(${orbHue}, 100%, 70%, ${orbPulse * 0.4})`);
        outerGlow.addColorStop(0.5, `hsla(${orbHue}, 100%, 50%, ${orbPulse * 0.2})`);
        outerGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(orbCenterX, orbCenterY, TILE_SIZE * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        // Main orb with neon glow
        ctx.shadowColor = `hsl(${orbHue}, 100%, 60%)`;
        ctx.shadowBlur = 20 * orbPulse;
        
        const orbGrad = ctx.createRadialGradient(
          orbCenterX - 4, orbCenterY - 4, 0,
          orbCenterX, orbCenterY, TILE_SIZE / 3
        );
        orbGrad.addColorStop(0, '#ffffff');
        orbGrad.addColorStop(0.2, `hsl(${orbHue}, 100%, 80%)`);
        orbGrad.addColorStop(0.6, `hsl(${orbHue}, 100%, 55%)`);
        orbGrad.addColorStop(1, `hsl(${orbHue}, 100%, 35%)`);
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(orbCenterX, orbCenterY, TILE_SIZE / 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner bright core
        ctx.shadowBlur = 10;
        ctx.fillStyle = `hsla(${orbHue + 30}, 100%, 90%, ${orbPulse})`;
        ctx.beginPath();
        ctx.arc(orbCenterX - 3, orbCenterY - 3, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Floating sparkles around orb
        for (let s = 0; s < 3; s++) {
          const sparkAngle = (state.gameTime * 0.003 + s * 2.1) % (Math.PI * 2);
          const sparkDist = 12 + Math.sin(state.gameTime * 0.01 + s) * 3;
          const sparkX = orbCenterX + Math.cos(sparkAngle) * sparkDist;
          const sparkY = orbCenterY + Math.sin(sparkAngle) * sparkDist;
          ctx.fillStyle = `hsla(${orbHue + s * 40}, 100%, 80%, ${0.6 + Math.sin(state.gameTime * 0.02 + s) * 0.3})`;
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
        break;
    }
    
    ctx.restore();
  });
  
  // Render alien bases with enhanced graphics
  state.bases.forEach(base => {
    const screenY = base.y - state.cameraY;
    if (screenY < -100 || screenY > config.canvasHeight + 100) return;
    
    if (!base.destroyed) {
      // Base glow
      ctx.save();
      ctx.shadowColor = '#aa00ff';
      ctx.shadowBlur = 20 + Math.sin(base.pulsePhase) * 10;
      
      // Base structure with gradient
      const baseGrad = ctx.createLinearGradient(base.x, screenY, base.x, screenY + base.height);
      baseGrad.addColorStop(0, '#5a0090');
      baseGrad.addColorStop(0.5, '#4a0080');
      baseGrad.addColorStop(1, '#3a0060');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(base.x, screenY, base.width, base.height);
      
      // Tech details
      ctx.fillStyle = '#7a00c0';
      ctx.fillRect(base.x + 10, screenY + 10, 35, 25);
      ctx.fillRect(base.x + 75, screenY + 10, 35, 25);
      
      // Windows
      ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
      ctx.fillRect(base.x + 15, screenY + 15, 10, 8);
      ctx.fillRect(base.x + 28, screenY + 15, 10, 8);
      ctx.fillRect(base.x + 80, screenY + 15, 10, 8);
      ctx.fillRect(base.x + 93, screenY + 15, 10, 8);
      
      // Pulsing core
      const pulse = Math.sin(base.pulsePhase) * 0.3 + 0.7;
      const coreGrad = ctx.createRadialGradient(
        base.x + 60, screenY + 45, 0,
        base.x + 60, screenY + 45, 20
      );
      coreGrad.addColorStop(0, `rgba(255, 0, 150, ${pulse})`);
      coreGrad.addColorStop(0.5, `rgba(200, 0, 100, ${pulse * 0.6})`);
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(base.x + 60, screenY + 45, 20, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
      
      // Health bar with glow
      ctx.fillStyle = '#222';
      ctx.fillRect(base.x, screenY - 12, base.width, 8);
      const healthPercent = base.health / base.maxHealth;
      const healthColor = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#ff0' : '#f00';
      ctx.save();
      ctx.shadowColor = healthColor;
      ctx.shadowBlur = 5;
      ctx.fillStyle = healthColor;
      ctx.fillRect(base.x + 1, screenY - 11, (base.width - 2) * healthPercent, 6);
      ctx.restore();
      
      // Render aliens with tentacles
      base.aliens.forEach(alien => {
        if (!alien.active) return;
        
        const alienScreenY = alien.y - state.cameraY;
        const centerX = alien.x + alien.width / 2;
        const centerY = alienScreenY + alien.height / 2;
        const time = state.gameTime * 0.001;
        const bounce = Math.sin(alien.animPhase) * 2;
        
        ctx.save();
        ctx.translate(centerX, centerY + bounce);
        
        // Alien colors by type
        let mainColor = '#8844aa';
        let glowColor = '#cc66ff';
        let tentacleColor = '#663388';
        
        if (alien.type === 'exploder') {
          mainColor = '#aa4400';
          glowColor = '#ff6600';
          tentacleColor = '#883300';
        } else if (alien.type === 'shooter') {
          mainColor = '#228855';
          glowColor = '#44ff88';
          tentacleColor = '#116633';
        }
        
        // Glow aura when chasing
        if (alien.leftBase) {
          ctx.save();
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 15;
          ctx.strokeStyle = `${glowColor}66`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, -2, 22, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
        
        // Animated tentacles (6 tentacles)
        ctx.lineCap = 'round';
        for (let i = 0; i < 6; i++) {
          const tentacleAngle = (Math.PI * 0.35) + (i / 5) * Math.PI * 1.3;
          const wave = Math.sin(time * 6 + alien.tentaclePhase + i * 1.0) * 8;
          const wave2 = Math.cos(time * 4 + alien.tentaclePhase + i * 1.5) * 5;
          const baseX = Math.cos(tentacleAngle) * 8;
          const baseY = Math.sin(tentacleAngle) * 6 + 4;
          const midX = baseX + Math.cos(tentacleAngle) * 10 + wave;
          const midY = baseY + 6 + Math.abs(wave) * 0.3;
          const endX = midX + Math.cos(tentacleAngle + wave2 * 0.05) * 8;
          const endY = midY + 6;
          
          // Tentacle outer glow
          ctx.strokeStyle = `${glowColor}44`;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(baseX, baseY);
          ctx.quadraticCurveTo(midX, midY, endX, endY);
          ctx.stroke();
          
          // Tentacle core
          const tentGrad = ctx.createLinearGradient(baseX, baseY, endX, endY);
          tentGrad.addColorStop(0, mainColor);
          tentGrad.addColorStop(0.5, tentacleColor);
          tentGrad.addColorStop(1, mainColor);
          ctx.strokeStyle = tentGrad;
          ctx.lineWidth = 3 - i * 0.2;
          ctx.stroke();
          
          // Suction cups at ends
          ctx.fillStyle = glowColor;
          ctx.beginPath();
          ctx.arc(endX, endY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Main body with gradient
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 15;
        
        const bodyGrad = ctx.createRadialGradient(0, -2, 0, 0, -2, 14);
        bodyGrad.addColorStop(0, glowColor);
        bodyGrad.addColorStop(0.4, mainColor);
        bodyGrad.addColorStop(1, tentacleColor);
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(0, -2, 12, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Alien eyes
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(-4, -6, 4, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(4, -6, 4, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye glow
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-4, -6, 2, 0, Math.PI * 2);
        ctx.arc(4, -6, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Exploder warning pulse
        if (alien.type === 'exploder') {
          const warnPulse = Math.sin(time * 8) * 0.5 + 0.5;
          ctx.save();
          ctx.strokeStyle = `rgba(255, 100, 0, ${warnPulse * 0.6})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, -2, 16, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
        
        // Shooter type weapon
        if (alien.type === 'shooter') {
          ctx.fillStyle = glowColor;
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(0, 14, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      });
    } else {
      // Destroyed base rubble with glow
      ctx.save();
      ctx.shadowColor = '#440066';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#2a0040';
      for (let i = 0; i < 6; i++) {
        const rx = base.x + i * 20 + Math.sin(i * 1.5) * 8;
        const ry = screenY + 25 + Math.cos(i * 2) * 10;
        ctx.fillRect(rx, ry, 18 - i * 2, 12);
      }
      ctx.restore();
    }
  });
  
  // Render bullets with trails
  state.bullets.forEach(bullet => {
    if (!bullet.active) return;
    const screenY = bullet.y - state.cameraY;
    
    // Trail
    bullet.trail.forEach((t, i) => {
      ctx.fillStyle = `rgba(255, 255, 0, ${t.alpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y - state.cameraY, 3 - i * 0.3, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Bullet with glow
    ctx.save();
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(bullet.x, screenY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(bullet.x, screenY, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  
  // Render particles
  state.particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 5;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y - state.cameraY, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  
  // Render debris
  state.debris.forEach(d => {
    ctx.save();
    ctx.translate(d.x, d.y - state.cameraY);
    ctx.rotate(d.rotation * Math.PI / 180);
    ctx.globalAlpha = d.alpha;
    ctx.fillStyle = d.color;
    ctx.fillRect(-d.size / 2, -d.size / 2, d.size, d.size);
    ctx.restore();
  });
  
  // Render ship
  if (state.phase === 'landing' || state.phase === 'escaping') {
    renderShip(ctx, state.shipX, state.shipY, state.gameTime);
  }
  
  // Render pilot
  if (state.phase === 'running') {
    renderPilot(ctx, state.pilotX, state.pilotY, state.gameTime);
  }
  
  // Render drill vehicle (waiting)
  if (state.phase === 'landing' || state.phase === 'running') {
    renderDrillVehicle(ctx, state.drillVehicleX, 85, 0, false, 0);
  }
  
  // Render active drill vehicle
  if (state.phase === 'drilling' || state.phase === 'underground' || state.phase === 'ascending') {
    const vy = state.vehicle.y - state.cameraY;
    renderDrillVehicle(ctx, state.vehicle.x, vy, state.vehicle.drillAngle, state.vehicle.isDigging, state.shieldLayers);
  }
  
  // UI
  renderUI(ctx, state, config);
  
  ctx.restore();
}

function renderShip(ctx: CanvasRenderingContext2D, x: number, y: number, _time: number): void {
  ctx.save();
  ctx.translate(x, y);
  
  // Draw the selected mega ship
  const megaShipId = getStoredMegaShipId();
  const shipTime = Date.now() * 0.003;
  drawMegaShip(ctx, 0, 0, megaShipId, shipTime);
  
  ctx.restore();
}

function renderPilot(ctx: CanvasRenderingContext2D, x: number, y: number, time: number): void {
  ctx.save();
  ctx.translate(x, y);
  
  // Running animation
  const frame = time * 0.01;
  const legOffset = Math.sin(frame * Math.PI / 2) * 5;
  const armOffset = Math.cos(frame * Math.PI / 2) * 4;
  const bodyBob = Math.abs(Math.sin(frame * Math.PI / 2)) * 2;
  
  ctx.translate(0, -bodyBob);
  
  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 18, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Legs
  ctx.strokeStyle = '#0066aa';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(-legOffset, 18);
  ctx.moveTo(0, 10);
  ctx.lineTo(legOffset, 18);
  ctx.stroke();
  
  // Boots
  ctx.fillStyle = '#333';
  ctx.fillRect(-legOffset - 3, 16, 6, 4);
  ctx.fillRect(legOffset - 3, 16, 6, 4);
  
  // Body (suit)
  const suitGrad = ctx.createLinearGradient(-5, 0, 5, 12);
  suitGrad.addColorStop(0, '#00ccff');
  suitGrad.addColorStop(1, '#0088aa');
  ctx.fillStyle = suitGrad;
  ctx.fillRect(-5, 0, 10, 12);
  
  // Head with helmet
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, -5, 6, 0, Math.PI * 2);
  ctx.fill();
  
  // Helmet visor (glowing)
  const visorGrad = ctx.createLinearGradient(-4, -7, 4, -3);
  visorGrad.addColorStop(0, '#00ffff');
  visorGrad.addColorStop(1, '#00aaaa');
  ctx.fillStyle = visorGrad;
  ctx.fillRect(-4, -7, 8, 4);
  
  // Arms
  ctx.strokeStyle = '#00aadd';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(5, 3);
  ctx.lineTo(5 + armOffset, 10);
  ctx.moveTo(-5, 3);
  ctx.lineTo(-5 - armOffset, 10);
  ctx.stroke();
  
  ctx.restore();
}

function renderDrillVehicle(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  drillAngle: number,
  isDigging: boolean,
  shieldLayers: number
): void {
  ctx.save();
  
  const centerX = x + 25;
  const centerY = y + 15;
  const radius = 22;
  const time = Date.now() * 0.001;
  const enginePulse = Math.sin(time * 8) * 0.3 + 0.7;
  
  // === SPHERICAL SHADOW (3D depth) ===
  ctx.fillStyle = 'rgba(0, 10, 30, 0.4)';
  ctx.beginPath();
  ctx.ellipse(centerX + 4, centerY + radius + 8, radius * 0.9, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // === ENGINE GLOW (exhaust trail) ===
  ctx.save();
  const flameLength = 15 + Math.random() * 8;
  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur = 20 * enginePulse;
  
  const flameGrad = ctx.createLinearGradient(centerX, centerY, centerX - flameLength - 10, centerY);
  flameGrad.addColorStop(0, '#ffffff');
  flameGrad.addColorStop(0.15, '#ffff88');
  flameGrad.addColorStop(0.4, '#ffaa00');
  flameGrad.addColorStop(0.7, '#ff6600');
  flameGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = flameGrad;
  ctx.beginPath();
  ctx.moveTo(centerX - radius + 4, centerY - 3);
  ctx.quadraticCurveTo(centerX - radius - flameLength * 0.5, centerY - 4, centerX - radius - flameLength, centerY);
  ctx.quadraticCurveTo(centerX - radius - flameLength * 0.5, centerY + 4, centerX - radius + 4, centerY + 3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  
  // === MAIN SPHERE BODY ===
  ctx.save();
  ctx.shadowColor = '#4488cc';
  ctx.shadowBlur = 15;
  
  // Outer sphere gradient
  const sphereGrad = ctx.createRadialGradient(
    centerX - radius * 0.3, centerY - radius * 0.3, 0,
    centerX, centerY, radius
  );
  sphereGrad.addColorStop(0, '#cceeFF');
  sphereGrad.addColorStop(0.2, '#aaddff');
  sphereGrad.addColorStop(0.5, '#6699cc');
  sphereGrad.addColorStop(0.8, '#446699');
  sphereGrad.addColorStop(1, '#223355');
  ctx.fillStyle = sphereGrad;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  // === METALLIC RING (equator) ===
  ctx.strokeStyle = '#88aacc';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radius + 2, 6, 0, 0, Math.PI * 2);
  ctx.stroke();
  
  // === COCKPIT WINDOW ===
  ctx.save();
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 10;
  const cockpitGrad = ctx.createRadialGradient(
    centerX + 5, centerY - 4, 0,
    centerX + 4, centerY - 2, 10
  );
  cockpitGrad.addColorStop(0, '#ffffff');
  cockpitGrad.addColorStop(0.3, '#88eeff');
  cockpitGrad.addColorStop(0.6, '#00aacc');
  cockpitGrad.addColorStop(1, '#006688');
  ctx.fillStyle = cockpitGrad;
  ctx.beginPath();
  ctx.ellipse(centerX + 6, centerY - 3, 8, 7, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  // === HIGHLIGHT REFLECTION ===
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.ellipse(centerX - 6, centerY - 8, 5, 3, -0.5, 0, Math.PI * 2);
  ctx.fill();
  
  // === ACCENT STRIPE ===
  ctx.strokeStyle = '#00ddff';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - 4, Math.PI * 0.7, Math.PI * 1.3);
  ctx.stroke();
  ctx.shadowBlur = 0;
  
  // === DRILL (front of sphere) ===
  ctx.save();
  ctx.translate(centerX + radius - 2, centerY);
  ctx.rotate(drillAngle * Math.PI / 180);
  
  // Drill body with metallic effect
  const drillGrad = ctx.createLinearGradient(-4, 0, 4, 0);
  drillGrad.addColorStop(0, '#888');
  drillGrad.addColorStop(0.3, '#bbb');
  drillGrad.addColorStop(0.5, '#ddd');
  drillGrad.addColorStop(0.7, '#bbb');
  drillGrad.addColorStop(1, '#888');
  ctx.fillStyle = drillGrad;
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(14, -3);
  ctx.lineTo(20, 0);
  ctx.lineTo(14, 3);
  ctx.lineTo(0, 6);
  ctx.closePath();
  ctx.fill();
  
  // Drill tip glow when digging
  if (isDigging) {
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(18, 0, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Drill spiral grooves
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const angle = (i * 90 + drillAngle * 2) * Math.PI / 180;
    ctx.beginPath();
    ctx.moveTo(2, Math.sin(angle) * 4);
    ctx.quadraticCurveTo(10, Math.sin(angle + 1) * 2, 16, 0);
    ctx.stroke();
  }
  
  ctx.restore();
  
  // Sparks when digging
  if (isDigging && Math.random() < 0.4) {
    ctx.save();
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(
      centerX + radius + 15 + Math.random() * 8,
      centerY + (Math.random() - 0.5) * 8,
      2 + Math.random() * 2,
      0, Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }
  
  // Shield effect (spherical)
  if (shieldLayers > 0) {
    ctx.save();
    ctx.strokeStyle = `rgba(0, 200, 255, ${0.4 + Math.sin(time * 2) * 0.2})`;
    ctx.lineWidth = 2 + shieldLayers;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10 + shieldLayers * 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 8 + shieldLayers * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  
  ctx.restore();
}

function renderUI(ctx: CanvasRenderingContext2D, state: ForwardFlightState, config: GameConfig): void {
  // Score
  ctx.save();
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 5;
  ctx.fillStyle = '#00ffff';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE: ${state.score}`, 12, 28);
  ctx.restore();
  
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(`DEPTH: ${Math.floor(state.vehicle.depth)}m`, 12, 50);
  ctx.fillText(`BASES: ${state.vehicle.basesDestroyed}/${state.bases.length}`, 12, 72);
  
  // Health bar
  const barWidth = 150;
  const barX = config.canvasWidth - barWidth - 15;
  
  ctx.fillStyle = '#1a1a2a';
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.fillRect(barX, 12, barWidth, 22);
  ctx.strokeRect(barX, 12, barWidth, 22);
  
  const healthPercent = state.vehicle.health / state.vehicle.maxHealth;
  const healthColor = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
  
  ctx.save();
  ctx.shadowColor = healthColor;
  ctx.shadowBlur = 8;
  ctx.fillStyle = healthColor;
  ctx.fillRect(barX + 2, 14, (barWidth - 4) * healthPercent, 18);
  ctx.restore();
  
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('HULL', barX + barWidth / 2, 28);
  
  // Power level
  ctx.save();
  ctx.shadowColor = '#ffff00';
  ctx.shadowBlur = 5;
  ctx.fillStyle = '#ffff00';
  ctx.textAlign = 'right';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(`POWER: ${'★'.repeat(state.powerLevel)}`, config.canvasWidth - 15, 55);
  ctx.restore();
  
  // Phase messages
  ctx.textAlign = 'center';
  ctx.font = 'bold 24px monospace';
  
  if (state.phase === 'landing') {
    ctx.save();
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#00ffff';
    ctx.fillText('APPROACHING DROP ZONE...', config.canvasWidth / 2, config.canvasHeight / 2);
    ctx.restore();
  } else if (state.phase === 'running') {
    ctx.save();
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#00ffff';
    ctx.fillText('GET TO THE DRILL VEHICLE!', config.canvasWidth / 2, config.canvasHeight / 2);
    ctx.restore();
  } else if (state.phase === 'drilling') {
    ctx.save();
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffff00';
    ctx.fillText('DRILLING INTO GROUND...', config.canvasWidth / 2, 120);
    ctx.restore();
  } else if (state.phase === 'ascending') {
    ctx.save();
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#00ff00';
    ctx.fillText('RETURN TO SURFACE!', config.canvasWidth / 2, 35);
    ctx.restore();
  } else if (state.phase === 'escaping') {
    ctx.save();
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#00ff00';
    ctx.fillText('EXTRACTION IN PROGRESS!', config.canvasWidth / 2, 35);
    ctx.restore();
  } else if (state.phase === 'complete' || state.phase === 'showing_results') {
    // Dark overlay for results
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);
    
    ctx.save();
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 40px monospace';
    ctx.fillText('MISSION COMPLETE!', config.canvasWidth / 2, config.canvasHeight / 2 - 50);
    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = '#00ff00';
    ctx.fillText(`FINAL SCORE: ${state.score}`, config.canvasWidth / 2, config.canvasHeight / 2);
    ctx.font = '18px monospace';
    ctx.fillText(`Bases Destroyed: ${state.vehicle.basesDestroyed}`, config.canvasWidth / 2, config.canvasHeight / 2 + 35);
    ctx.restore();
    
    // Tap to continue
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px monospace';
    if (Math.floor(Date.now() / 500) % 2 === 0) {
      ctx.fillText('TAP TO CONTINUE', config.canvasWidth / 2, config.canvasHeight / 2 + 90);
    }
  } else if (state.phase === 'failed') {
    ctx.save();
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('MISSION FAILED', config.canvasWidth / 2, config.canvasHeight / 2 - 30);
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`SCORE: ${state.score}`, config.canvasWidth / 2, config.canvasHeight / 2 + 20);
    ctx.restore();
  }
  
  // Touch hint
  if (state.phase === 'underground' || state.phase === 'ascending') {
    ctx.font = '14px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('TOUCH TO MOVE & SHOOT', config.canvasWidth / 2, config.canvasHeight - 15);
  }
}
