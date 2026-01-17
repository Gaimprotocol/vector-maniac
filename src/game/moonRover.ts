// Moon Rover Mini-Game - Driving on lunar surface shooting enemy ships
import { generateId } from './utils';
import { GAME_CONFIG } from './constants';
import { drawMegaShip } from './megaShipRenderer';
import { getStoredMegaShipId } from '@/hooks/useMegaShips';

export type RoverPhase = 
  | 'approaching'       // Ship flying towards landing zone
  | 'landing'           // Ship landing animation
  | 'pilot_to_rover'    // Pilot running to rover
  | 'driving'           // Rover gameplay
  | 'pilot_to_ship'     // Pilot running back to ship
  | 'takeoff'           // Ship taking off
  | 'showing_results'   // Show results and wait for tap
  | 'complete';         // Return to normal gameplay

export interface RoverEnemy {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  health: number;
  maxHealth: number;
  type: 'fighter' | 'bomber' | 'scout' | 'destroyer' | 'speeder';
  angle: number;
  frame: number;
  swoopPhase: number;
  attacking: boolean;
  fireTimer: number;
}

export interface RoverBullet {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  timer: number;
  isPlayer: boolean;
}

export interface RoverExplosion {
  id: string;
  x: number;
  y: number;
  frame: number;
  maxFrames: number;
  size: number;
}

export interface MoonRoverState {
  phase: RoverPhase;
  phaseTimer: number;
  
  // Ship position
  shipX: number;
  shipY: number;
  shipAngle: number;
  shipScale: number;
  shipDockedOnRover: boolean;
  
  // Pilot position
  pilotX: number;
  pilotY: number;
  pilotFrame: number;
  
  // Rover gameplay
  roverX: number;
  roverY: number;
  roverSpeed: number;
  roverAngle: number;
  turretAngle: number;
  
  // Background scrolling
  backgroundScrollX: number;
  
  // Enemies and combat
  enemies: RoverEnemy[];
  bullets: RoverBullet[];
  explosions: RoverExplosion[];
  enemiesDefeated: number;
  enemiesToDefeat: number;
  waveNumber: number;
  spawnTimer: number;
  fireTimer: number;
  
  // Visual variant
  variant: number;
  moonColor: string;
  skyColor: string;
  craterColor: string;
  
  // Score and health
  bonusScore: number;
  roverHealth: number;
  maxRoverHealth: number;
  roverDestroyed: boolean;
  
  // Sound triggers
  soundQueue: string[];
}

// Different moon visual variants
const MOON_VARIANTS = [
  { skyColor: '#000510', moonColor: '#3a3a4a', craterColor: '#2a2a3a', name: 'Gray Moon' },
  { skyColor: '#050008', moonColor: '#4a3a3a', craterColor: '#3a2a2a', name: 'Red Moon' },
  { skyColor: '#000510', moonColor: '#3a4a4a', craterColor: '#2a3a3a', name: 'Ice Moon' },
  { skyColor: '#050505', moonColor: '#4a4a3a', craterColor: '#3a3a2a', name: 'Sulfur Moon' },
  { skyColor: '#080005', moonColor: '#3a3a5a', craterColor: '#2a2a4a', name: 'Crystal Moon' },
];

// Audio context
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

export function playRoverSound(type: 'shoot' | 'explosion' | 'hit' | 'spawn' | 'engine' | 'landing' | 'takeoff' | 'rover'): void {
  try {
    const ctx = getAudioContext();
    
    switch (type) {
      case 'shoot': {
        // Laser cannon sound
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        
        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(ctx.destination);
        gain2.connect(ctx.destination);
        
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(800, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
        gain1.gain.setValueAtTime(0.15, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(600, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
        gain2.gain.setValueAtTime(0.08, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.1);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.08);
        break;
      }
        
      case 'explosion': {
        // Big explosion with rumble
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const noise = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        const gainNoise = ctx.createGain();
        
        osc1.connect(gain1);
        osc2.connect(gain2);
        noise.connect(gainNoise);
        gain1.connect(ctx.destination);
        gain2.connect(ctx.destination);
        gainNoise.connect(ctx.destination);
        
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(150, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.5);
        gain1.gain.setValueAtTime(0.25, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(80, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.4);
        gain2.gain.setValueAtTime(0.18, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        
        noise.type = 'triangle';
        noise.frequency.setValueAtTime(60, ctx.currentTime);
        noise.frequency.exponentialRampToValueAtTime(15, ctx.currentTime + 0.6);
        gainNoise.gain.setValueAtTime(0.12, ctx.currentTime);
        gainNoise.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.5);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.4);
        noise.start(ctx.currentTime);
        noise.stop(ctx.currentTime + 0.6);
        break;
      }
        
      case 'hit': {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.08);
        break;
      }
        
      case 'spawn': {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.setValueAtTime(400, ctx.currentTime + 0.05);
        oscillator.frequency.setValueAtTime(200, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
        break;
      }
      
      case 'engine': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(50 + Math.random() * 20, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
        break;
      }
      
      case 'rover': {
        // Rover driving sound - low rumble
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        
        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(ctx.destination);
        gain2.connect(ctx.destination);
        
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(30 + Math.random() * 10, ctx.currentTime);
        gain1.gain.setValueAtTime(0.04, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(60 + Math.random() * 15, ctx.currentTime);
        gain2.gain.setValueAtTime(0.03, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.1);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.08);
        break;
      }
      
      case 'landing': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
        break;
      }
      
      case 'takeoff': {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        
        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(ctx.destination);
        gain2.connect(ctx.destination);
        
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(60, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.4);
        gain1.gain.setValueAtTime(0.12, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(30, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.35);
        gain2.gain.setValueAtTime(0.08, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.4);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.35);
        break;
      }
    }
  } catch (e) {
    // Audio context not available
  }
}

export function isRoverLevel(mapId: number): boolean {
  // Moon rover appears on maps 5, 11, 17, 23, etc. (every 6th map starting at 5)
  return (mapId - 5) % 6 === 0 && mapId >= 5;
}

export function createRoverState(mapId: number): MoonRoverState {
  const variant = (mapId - 5) % MOON_VARIANTS.length;
  const variantData = MOON_VARIANTS[variant];
  
  return {
    phase: 'approaching',
    phaseTimer: 120,
    
    shipX: -100,
    shipY: GAME_CONFIG.canvasHeight / 2 - 50,
    shipAngle: 0,
    shipScale: 0.3,
    shipDockedOnRover: false,
    
    pilotX: 0,
    pilotY: 0,
    pilotFrame: 0,
    
    // Rover centered horizontally
    roverX: GAME_CONFIG.canvasWidth / 2 - 40,
    roverY: GAME_CONFIG.canvasHeight - 85,
    roverSpeed: 0,
    roverAngle: 0,
    turretAngle: -90, // Start pointing straight up
    
    // Background scroll for movement illusion
    backgroundScrollX: 0,
    
    enemies: [],
    bullets: [],
    explosions: [],
    enemiesDefeated: 0,
    enemiesToDefeat: 10 + Math.floor(mapId / 4),
    waveNumber: 1,
    spawnTimer: 60,
    fireTimer: 0,
    
    variant,
    moonColor: variantData.moonColor,
    skyColor: variantData.skyColor,
    craterColor: variantData.craterColor,
    
    bonusScore: 0,
    roverHealth: 100,
    maxRoverHealth: 100,
    roverDestroyed: false,
    
    soundQueue: [],
  };
}

export function updateRoverState(
  state: MoonRoverState,
  input: { touchX: number; touchY: number; isTouching: boolean; fire: boolean }
): MoonRoverState {
  const newState = { ...state, soundQueue: [] as string[] };
  
  // Update bullets
  newState.bullets = state.bullets
    .map(bullet => ({
      ...bullet,
      x: bullet.x + bullet.velocityX,
      y: bullet.y + bullet.velocityY,
      timer: bullet.timer - 1,
    }))
    .filter(bullet => bullet.timer > 0 && bullet.x > 0 && bullet.x < GAME_CONFIG.canvasWidth &&
                      bullet.y > 0 && bullet.y < GAME_CONFIG.canvasHeight);
  
  // Update explosions
  newState.explosions = state.explosions
    .map(exp => ({ ...exp, frame: exp.frame + 0.5 }))
    .filter(exp => exp.frame < exp.maxFrames);
  
  // Update enemies
  newState.enemies = state.enemies.map(enemy => ({
    ...enemy,
    frame: (enemy.frame + 0.1) % 2,
    swoopPhase: enemy.swoopPhase + 0.05,
  }));
  
  switch (state.phase) {
    case 'approaching':
      newState.shipX = Math.min(GAME_CONFIG.canvasWidth * 0.7, state.shipX + 5);
      newState.shipY = state.shipY + Math.sin(state.phaseTimer * 0.1) * 0.5;
      newState.shipScale = Math.min(1, state.shipScale + 0.005);
      newState.phaseTimer--;
      
      if (state.phaseTimer % 8 === 0) {
        newState.soundQueue.push('engine');
      }
      
      if (newState.shipX >= GAME_CONFIG.canvasWidth * 0.7) {
        newState.phase = 'landing';
        newState.phaseTimer = 90;
        newState.soundQueue.push('landing');
      }
      break;
      
    case 'landing':
      const landingTargetY = GAME_CONFIG.canvasHeight - 90;
      newState.shipY = state.shipY + (landingTargetY - state.shipY) * 0.05;
      newState.shipAngle = Math.sin(state.phaseTimer * 0.15) * 3;
      newState.phaseTimer--;
      
      if (state.phaseTimer % 12 === 0) {
        newState.soundQueue.push('landing');
      }
      
      if (state.phaseTimer <= 0) {
        newState.phase = 'pilot_to_rover';
        newState.phaseTimer = 60;
        newState.pilotX = newState.shipX - 30;
        newState.pilotY = GAME_CONFIG.canvasHeight - 60;
        newState.shipAngle = 0;
      }
      break;
      
    case 'pilot_to_rover':
      const roverTargetX = newState.roverX + 30;
      newState.pilotX = state.pilotX - 4;
      newState.pilotFrame = Math.floor(state.phaseTimer / 5) % 4;
      newState.phaseTimer--;
      
      // Move ship towards rover to dock
      if (!newState.shipDockedOnRover) {
        const shipTargetX = newState.roverX + 40;
        const shipTargetY = newState.roverY - 60;
        newState.shipX += (shipTargetX - newState.shipX) * 0.05;
        newState.shipY += (shipTargetY - newState.shipY) * 0.05;
        newState.shipScale = Math.max(0.5, newState.shipScale - 0.005);
      }
      
      if (newState.pilotX <= roverTargetX) {
        newState.phase = 'driving';
        newState.phaseTimer = 0;
        newState.spawnTimer = 40;
        newState.shipDockedOnRover = true;
        newState.shipX = newState.roverX + 40;
        newState.shipY = newState.roverY - 55;
        newState.shipScale = 0.5;
      }
      break;
      
    case 'driving':
      // Rover is stationary in center - only turret rotates 180 degrees
      // Background scrolls to give illusion of movement
      
      // Scroll background continuously (right to left movement illusion)
      newState.backgroundScrollX = (state.backgroundScrollX + 2) % 1000;
      
      // Rover sound for driving effect
      if (state.phaseTimer % 8 === 0) {
        newState.soundQueue.push('rover');
      }
      
      // Turret aims at touch position - full 180 degree arc (including backwards)
      if (input.isTouching) {
        const dx = input.touchX - (newState.roverX + 40);
        const dy = input.touchY - (newState.roverY - 20);
        const targetAngle = Math.atan2(dy, dx) * 180 / Math.PI;
        // Allow full 180 degrees: from -180 (left/back) to 0 (right/front), clamped to upper semicircle
        const clampedTarget = Math.max(-180, Math.min(0, targetAngle));
        
        // Smooth turret rotation
        const angleDiff = clampedTarget - newState.turretAngle;
        newState.turretAngle += angleDiff * 0.15;
      } else if (newState.enemies.length > 0) {
        // Auto-aim at nearest enemy when not touching
        let nearestEnemy = newState.enemies[0];
        let nearestDist = Infinity;
        for (const enemy of newState.enemies) {
          const dist = Math.hypot(enemy.x - newState.roverX, enemy.y - newState.roverY);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestEnemy = enemy;
          }
        }
        const dx = nearestEnemy.x - (newState.roverX + 40);
        const dy = nearestEnemy.y - (newState.roverY - 20);
        const targetAngle = Math.atan2(dy, dx) * 180 / Math.PI;
        const clampedTarget = Math.max(-180, Math.min(0, targetAngle));
        const angleDiff = clampedTarget - newState.turretAngle;
        newState.turretAngle += angleDiff * 0.1;
      }
      
      // Fire - auto-fire when touching
      if (newState.fireTimer > 0) newState.fireTimer--;
      
      const shouldFire = input.isTouching || input.fire;
      
      if (shouldFire && newState.fireTimer <= 0) {
        newState.fireTimer = 8;
        newState.soundQueue.push('shoot');
        
        const angleRad = newState.turretAngle * Math.PI / 180;
        const bulletSpeed = 12;
        
        // Create main bullet
        newState.bullets.push({
          id: generateId(),
          x: newState.roverX + 40 + Math.cos(angleRad) * 25,
          y: newState.roverY - 20 + Math.sin(angleRad) * 25,
          velocityX: Math.cos(angleRad) * bulletSpeed,
          velocityY: Math.sin(angleRad) * bulletSpeed,
          timer: 70,
          isPlayer: true,
        });
      }
      
      // Check bullet-enemy collisions
      newState.bullets = newState.bullets.filter(bullet => {
        if (!bullet.isPlayer) return true;
        
        for (const enemy of newState.enemies) {
          const dx = enemy.x - bullet.x;
          const dy = enemy.y - bullet.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < enemy.size + 10) {
            enemy.health -= 25;
            newState.soundQueue.push('hit');
            
            if (enemy.health <= 0) {
              newState.enemiesDefeated++;
              newState.soundQueue.push('explosion');
              newState.explosions.push({
                id: generateId(),
                x: enemy.x,
                y: enemy.y,
                frame: 0,
                maxFrames: 15,
                size: enemy.size * 2,
              });
              const scoreMap = { destroyer: 100, bomber: 50, fighter: 30, scout: 20 };
              newState.bonusScore += scoreMap[enemy.type] || 20;
            }
            return false;
          }
        }
        return true;
      });
      
      // Remove dead enemies
      newState.enemies = newState.enemies.filter(e => e.health > 0);
      
      // Update enemies - swoop attacks and shooting
      newState.enemies = newState.enemies.map(enemy => {
        const newEnemy = { ...enemy };
        
        // Decrease fire timer
        newEnemy.fireTimer = enemy.fireTimer - 1;
        
        // Move based on type
        switch (enemy.type) {
          case 'speeder':
            // Fast enemy that rushes from right to left - must be quick to shoot!
            newEnemy.x -= enemy.speed;
            newEnemy.y += Math.sin(enemy.swoopPhase * 3) * 2;
            // Speeders shoot while passing
            if (newEnemy.fireTimer <= 0 && newEnemy.x < GAME_CONFIG.canvasWidth - 30) {
              const angleToRover = Math.atan2(
                (newState.roverY - 20) - newEnemy.y,
                (newState.roverX + 40) - newEnemy.x
              );
              newState.bullets.push({
                id: generateId(),
                x: newEnemy.x,
                y: newEnemy.y,
                velocityX: Math.cos(angleToRover) * 6,
                velocityY: Math.sin(angleToRover) * 6,
                timer: 60,
                isPlayer: false,
              });
              newEnemy.fireTimer = 40;
            }
            break;
          case 'scout':
            newEnemy.x += Math.cos(enemy.swoopPhase) * 3 - 1;
            newEnemy.y = 60 + Math.sin(enemy.swoopPhase * 2) * 40;
            // Scouts shoot occasionally
            if (newEnemy.fireTimer <= 0 && newEnemy.x < GAME_CONFIG.canvasWidth - 50) {
              const angleToRover = Math.atan2(
                (newState.roverY - 20) - newEnemy.y,
                (newState.roverX + 40) - newEnemy.x
              );
              newState.bullets.push({
                id: generateId(),
                x: newEnemy.x,
                y: newEnemy.y + 5,
                velocityX: Math.cos(angleToRover) * 4,
                velocityY: Math.sin(angleToRover) * 4,
                timer: 70,
                isPlayer: false,
              });
              newEnemy.fireTimer = 100 + Math.random() * 60;
            }
            break;
          case 'fighter':
            if (enemy.attacking) {
              newEnemy.y += 2;
              newEnemy.x += (newState.roverX + 40 - enemy.x) * 0.02;
              // Fighters shoot during attack dive
              if (newEnemy.fireTimer <= 0) {
                const angleToRover = Math.atan2(
                  (newState.roverY - 20) - newEnemy.y,
                  (newState.roverX + 40) - newEnemy.x
                );
                newState.bullets.push({
                  id: generateId(),
                  x: newEnemy.x,
                  y: newEnemy.y + 10,
                  velocityX: Math.cos(angleToRover) * 5,
                  velocityY: Math.sin(angleToRover) * 5,
                  timer: 65,
                  isPlayer: false,
                });
                newEnemy.fireTimer = 50;
              }
              if (newEnemy.y > GAME_CONFIG.canvasHeight - 100) {
                newEnemy.attacking = false;
                newEnemy.y = 50;
              }
            } else {
              newEnemy.x -= 2;
              if (Math.random() < 0.01) newEnemy.attacking = true;
            }
            break;
          case 'bomber':
            newEnemy.x -= 1.5;
            newEnemy.y = 80 + Math.sin(enemy.swoopPhase) * 20;
            // Drop bombs (unchanged)
            if (Math.random() < 0.008 && newEnemy.x < GAME_CONFIG.canvasWidth - 50) {
              newState.bullets.push({
                id: generateId(),
                x: newEnemy.x,
                y: newEnemy.y + 10,
                velocityX: 0,
                velocityY: 4,
                timer: 80,
                isPlayer: false,
              });
            }
            break;
          case 'destroyer':
            newEnemy.x += Math.cos(enemy.angle) * 1.5;
            newEnemy.y += Math.sin(enemy.angle) * 1.5;
            if (newEnemy.y < 40 || newEnemy.y > 150) newEnemy.angle = -enemy.angle;
            // Destroyers shoot aimed shots
            if (newEnemy.fireTimer <= 0 && newEnemy.x < GAME_CONFIG.canvasWidth - 30) {
              const angleToRover = Math.atan2(
                (newState.roverY - 20) - newEnemy.y,
                (newState.roverX + 40) - newEnemy.x
              );
              newState.bullets.push({
                id: generateId(),
                x: newEnemy.x,
                y: newEnemy.y,
                velocityX: Math.cos(angleToRover) * 4,
                velocityY: Math.sin(angleToRover) * 4,
                timer: 80,
                isPlayer: false,
              });
              newEnemy.fireTimer = 80 + Math.random() * 40;
            }
            break;
        }
        
        return newEnemy;
      });
      
      // Remove off-screen enemies
      newState.enemies = newState.enemies.filter(e => e.x > -50 && e.x < GAME_CONFIG.canvasWidth + 100);
      
      // Check enemy bullets hitting rover
      newState.bullets = newState.bullets.filter(bullet => {
        if (bullet.isPlayer) return true;
        
        const dx = (newState.roverX + 40) - bullet.x;
        const dy = (newState.roverY - 10) - bullet.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 40) {
          newState.roverHealth -= 15;
          newState.soundQueue.push('hit');
          newState.explosions.push({
            id: generateId(),
            x: bullet.x,
            y: bullet.y,
            frame: 0,
            maxFrames: 10,
            size: 20,
          });
          return false;
        }
        return true;
      });
      
      // Check if rover destroyed
      if (newState.roverHealth <= 0) {
        newState.roverDestroyed = true;
        newState.roverHealth = 0;
      }
      
      // Spawn enemies - balanced for better gameplay
      newState.spawnTimer--;
      if (newState.spawnTimer <= 0 && newState.enemiesDefeated < state.enemiesToDefeat && !newState.roverDestroyed) {
        const remaining = state.enemiesToDefeat - newState.enemiesDefeated - newState.enemies.length;
        if (remaining > 0 && newState.enemies.length < 4) { // Max 4 enemies at a time
          newState.enemies.push(createRoverEnemy(state.waveNumber));
          newState.spawnTimer = 60 + Math.random() * 50; // Slightly slower spawns
          newState.soundQueue.push('spawn');
        }
      }
      
      newState.phaseTimer++;
      
      // Check completion
      if (newState.enemiesDefeated >= state.enemiesToDefeat && !newState.roverDestroyed) {
        newState.phase = 'pilot_to_ship';
        newState.phaseTimer = 60;
        newState.pilotX = newState.roverX + 30;
        newState.pilotY = GAME_CONFIG.canvasHeight - 60;
      }
      break;
      
    case 'pilot_to_ship':
      // Pilot runs to docked ship on rover
      newState.pilotX = state.pilotX + 2;
      newState.pilotFrame = Math.floor(state.phaseTimer / 5) % 4;
      newState.phaseTimer--;
      
      // Ship is docked on rover, no need to move far
      if (newState.pilotX >= newState.roverX + 30) {
        newState.phase = 'takeoff';
        newState.phaseTimer = 90;
        newState.shipDockedOnRover = false;
      }
      break;
      
    case 'takeoff':
      // Ship lifts off from rover
      newState.shipY = state.shipY - 4;
      newState.shipX = state.shipX + 5;
      newState.shipAngle = -12;
      newState.shipScale = Math.min(1, state.shipScale + 0.008);
      newState.phaseTimer--;
      
      if (state.phaseTimer % 6 === 0) {
        newState.soundQueue.push('takeoff');
      }
      
      if (state.phaseTimer <= 0) {
        newState.phase = 'showing_results';
      }
      break;
      
    case 'showing_results':
      // Wait for tap to continue
      if (input.isTouching) {
        newState.phase = 'complete';
      }
      break;
  }
  
  // Play queued sounds
  newState.soundQueue.forEach(sound => {
    playRoverSound(sound as any);
  });
  
  return newState;
}

function createRoverEnemy(wave: number): RoverEnemy {
  const typeRoll = Math.random();
  // Add speeder type - fast enemies that rush from right to left
  const type: RoverEnemy['type'] = typeRoll < 0.2 ? 'speeder' : typeRoll < 0.45 ? 'scout' : typeRoll < 0.65 ? 'fighter' : typeRoll < 0.85 ? 'bomber' : 'destroyer';
  
  const healthMap = { scout: 25, fighter: 40, bomber: 60, destroyer: 100, speeder: 20 };
  const speedMap = { scout: 3, fighter: 2.5, bomber: 1.5, destroyer: 1.2, speeder: 8 };
  const sizeMap = { scout: 15, fighter: 20, bomber: 25, destroyer: 35, speeder: 12 };
  
  return {
    id: generateId(),
    x: GAME_CONFIG.canvasWidth + 30 + Math.random() * 50,
    y: type === 'speeder' ? 100 + Math.random() * 60 : 50 + Math.random() * 80,
    size: sizeMap[type],
    speed: speedMap[type] + wave * 0.1,
    health: healthMap[type] + wave * 5,
    maxHealth: healthMap[type] + wave * 5,
    type,
    angle: Math.PI + (Math.random() - 0.5) * 0.5,
    frame: 0,
    swoopPhase: Math.random() * Math.PI * 2,
    attacking: false,
    fireTimer: 60 + Math.random() * 60,
  };
}

export function renderRoverScene(ctx: CanvasRenderingContext2D, state: MoonRoverState): void {
  const { canvasWidth, canvasHeight } = GAME_CONFIG;
  
  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  skyGrad.addColorStop(0, state.skyColor);
  skyGrad.addColorStop(0.7, '#000000');
  skyGrad.addColorStop(1, state.moonColor);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // Stars
  renderMoonStars(ctx, state);
  
  // Earth in the sky
  renderEarth(ctx);
  
  // Distant mountains
  renderMoonMountains(ctx, state);
  
  // Moon surface
  renderMoonSurface(ctx, state);
  
  // Landing ship (visible during all phases - docked on rover during driving)
  if (state.phase !== 'driving' || !state.shipDockedOnRover) {
    renderRoverShip(ctx, state);
  }
  
  // Pilot
  if (state.phase === 'pilot_to_rover' || state.phase === 'pilot_to_ship') {
    renderRoverPilot(ctx, state);
  }
  
  // Rover - visible from the very start so it's always parked waiting
  if (state.phase === 'approaching' || state.phase === 'landing' || state.phase === 'pilot_to_rover' || state.phase === 'driving' || state.phase === 'pilot_to_ship') {
    renderRover(ctx, state);
    
    // Render docked ship on rover during driving
    if (state.phase === 'driving' && state.shipDockedOnRover) {
      renderDockedShip(ctx, state);
    }
  }
  
  // Combat elements only during driving
  if (state.phase === 'driving') {
    
    // Enemies
    state.enemies.forEach(enemy => renderRoverEnemy(ctx, enemy));
    
    // Bullets
    state.bullets.forEach(bullet => renderRoverBullet(ctx, bullet));
    
    // Explosions
    state.explosions.forEach(exp => renderRoverExplosion(ctx, exp));
    
    // HUD
    renderRoverHUD(ctx, state);
  }
  
  // Scanlines
  renderMoonScanlines(ctx);
  
  // UI
  renderRoverUI(ctx, state);
}

function renderMoonStars(ctx: CanvasRenderingContext2D, state: MoonRoverState): void {
  const time = Date.now() * 0.001;
  const scrollOffset = state.backgroundScrollX * 0.1; // Slow parallax for stars
  
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 80; i++) {
    const baseX = (i * 127 + state.variant * 60) % GAME_CONFIG.canvasWidth;
    const x = (baseX - scrollOffset + GAME_CONFIG.canvasWidth) % GAME_CONFIG.canvasWidth;
    const y = (i * 79 + state.variant * 40) % (GAME_CONFIG.canvasHeight * 0.6);
    const size = (i % 3) === 0 ? 2 : 1;
    const twinkle = Math.sin(time * 2 + i) * 0.4 + 0.6;
    ctx.globalAlpha = twinkle;
    ctx.fillRect(x, y, size, size);
  }
  ctx.globalAlpha = 1;
}

function renderEarth(ctx: CanvasRenderingContext2D): void {
  const earthX = GAME_CONFIG.canvasWidth * 0.85;
  const earthY = 60;
  const earthSize = 35;
  
  // Glow
  const glow = ctx.createRadialGradient(earthX, earthY, 0, earthX, earthY, earthSize * 2);
  glow.addColorStop(0, 'rgba(100, 150, 255, 0.3)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(earthX, earthY, earthSize * 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Earth
  const earthGrad = ctx.createRadialGradient(earthX - 10, earthY - 10, 0, earthX, earthY, earthSize);
  earthGrad.addColorStop(0, '#6699ff');
  earthGrad.addColorStop(0.5, '#3366cc');
  earthGrad.addColorStop(1, '#001144');
  ctx.fillStyle = earthGrad;
  ctx.beginPath();
  ctx.arc(earthX, earthY, earthSize, 0, Math.PI * 2);
  ctx.fill();
  
  // Continents hint
  ctx.fillStyle = 'rgba(50, 150, 50, 0.4)';
  ctx.beginPath();
  ctx.ellipse(earthX - 8, earthY - 5, 10, 8, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(earthX + 5, earthY + 8, 8, 6, -0.2, 0, Math.PI * 2);
  ctx.fill();
}

function renderMoonMountains(ctx: CanvasRenderingContext2D, state: MoonRoverState): void {
  const horizonY = GAME_CONFIG.canvasHeight - 70;
  const scrollOffset = state.backgroundScrollX * 0.3; // Medium parallax for mountains
  
  ctx.fillStyle = state.craterColor;
  for (let i = 0; i < 12; i++) {
    const baseX = i * 100 + (state.variant * 30) % 60;
    const x = ((baseX - scrollOffset) % (1200) + 1200) % 1200 - 200;
    const height = 25 + (i % 3) * 15;
    const width = 60 + (i % 2) * 30;
    
    ctx.beginPath();
    ctx.moveTo(x, horizonY);
    ctx.lineTo(x + width * 0.3, horizonY - height * 0.6);
    ctx.lineTo(x + width * 0.5, horizonY - height);
    ctx.lineTo(x + width * 0.7, horizonY - height * 0.7);
    ctx.lineTo(x + width, horizonY);
    ctx.fill();
  }
}

function renderMoonSurface(ctx: CanvasRenderingContext2D, state: MoonRoverState): void {
  const { canvasWidth, canvasHeight } = GAME_CONFIG;
  const groundY = canvasHeight - 70;
  const scrollOffset = state.backgroundScrollX; // Full speed for ground
  
  // Ground
  const groundGrad = ctx.createLinearGradient(0, groundY, 0, canvasHeight);
  groundGrad.addColorStop(0, state.moonColor);
  groundGrad.addColorStop(1, '#000000');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, groundY, canvasWidth, 70);
  
  // Craters - scrolling
  for (let i = 0; i < 20; i++) {
    const baseX = 60 + i * 55 + (state.variant * 25) % 40;
    const x = ((baseX - scrollOffset) % 1100 + 1100) % 1100 - 50;
    const y = groundY + 15 + (i % 3) * 12;
    const size = 10 + (i % 4) * 6;
    
    // Crater shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Crater rim highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, y - 2, size + 2, size * 0.35, 0, Math.PI, 0);
    ctx.stroke();
  }
  
  // Rocks - scrolling
  for (let i = 0; i < 25; i++) {
    const baseX = 40 + i * 45 + (state.variant * 15) % 30;
    const x = ((baseX - scrollOffset * 1.1) % 1125 + 1125) % 1125 - 50;
    const y = groundY - 5 + (i % 2) * 25;
    const size = 3 + (i % 4) * 2;
    
    ctx.fillStyle = i % 2 === 0 ? '#5a5a6a' : '#4a4a5a';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size, y - size);
    ctx.lineTo(x + size * 2, y);
    ctx.closePath();
    ctx.fill();
  }
}

function renderRoverShip(ctx: CanvasRenderingContext2D, state: MoonRoverState): void {
  ctx.save();
  ctx.translate(state.shipX, state.shipY);
  ctx.rotate((state.shipAngle * Math.PI) / 180);
  ctx.scale(state.shipScale, state.shipScale);
  
  // Shadow
  if (state.phase === 'landing' || state.phase === 'pilot_to_rover' || state.phase === 'pilot_to_ship') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 45, 30, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  
  // Draw the selected mega ship
  const megaShipId = getStoredMegaShipId();
  const time = Date.now() * 0.003;
  drawMegaShip(ctx, 0, 0, megaShipId, time);
  
  ctx.restore();
}

function renderRoverPilot(ctx: CanvasRenderingContext2D, state: MoonRoverState): void {
  const x = state.pilotX;
  const y = state.pilotY;
  const frame = state.pilotFrame;
  
  const legOffset = Math.sin(frame * Math.PI / 2) * 5;
  const armOffset = Math.cos(frame * Math.PI / 2) * 4;
  const bodyBob = Math.abs(Math.sin(frame * Math.PI / 2)) * 2;
  
  const dir = state.phase === 'pilot_to_rover' ? -1 : 1;
  
  ctx.save();
  ctx.translate(x, y - bodyBob);
  ctx.scale(dir, 1);
  
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

function renderDockedShip(ctx: CanvasRenderingContext2D, state: MoonRoverState): void {
  const x = state.roverX + 40;
  const y = state.roverY - 55;
  
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(0.5, 0.5);
  
  // === SCARLET BLADE SHIP MODEL (docked) ===
  // Blade-like body (primary red)
  ctx.fillStyle = '#cc2233';
  ctx.beginPath();
  ctx.moveTo(27, 0);        // Sharp nose
  ctx.lineTo(21, -3);
  ctx.lineTo(9, -4);
  ctx.lineTo(-6, -3);
  ctx.lineTo(-10, 0);
  ctx.lineTo(-6, 3);
  ctx.lineTo(9, 4);
  ctx.lineTo(21, 3);
  ctx.closePath();
  ctx.fill();
  
  // Blade wings (darker red)
  ctx.fillStyle = '#991122';
  // Top wing
  ctx.beginPath();
  ctx.moveTo(6, -4);
  ctx.lineTo(-3, -12);
  ctx.lineTo(-9, -10);
  ctx.lineTo(-4, -3);
  ctx.closePath();
  ctx.fill();
  
  // Bottom wing
  ctx.beginPath();
  ctx.moveTo(6, 4);
  ctx.lineTo(-3, 12);
  ctx.lineTo(-9, 10);
  ctx.lineTo(-4, 3);
  ctx.closePath();
  ctx.fill();
  
  // Metallic edge highlight
  ctx.fillStyle = '#ff4455';
  ctx.beginPath();
  ctx.moveTo(27, 0);
  ctx.lineTo(21, -2);
  ctx.lineTo(9, -2.5);
  ctx.lineTo(9, 2.5);
  ctx.lineTo(21, 2);
  ctx.closePath();
  ctx.fill();
  
  // Central dark stripe
  ctx.fillStyle = '#661122';
  ctx.fillRect(-4, -1.5, 20, 3);
  
  // Cockpit glow
  ctx.shadowBlur = 0;
  const cockpitGrad = ctx.createRadialGradient(18, 0, 0, 18, 0, 4);
  cockpitGrad.addColorStop(0, '#ffffff');
  cockpitGrad.addColorStop(0.3, '#ffcccc');
  cockpitGrad.addColorStop(0.6, '#ff6666');
  cockpitGrad.addColorStop(1, '#cc0000');
  ctx.fillStyle = cockpitGrad;
  ctx.beginPath();
  ctx.arc(18, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Engine nozzle
  ctx.fillStyle = '#333344';
  ctx.fillRect(-10, -2.5, 4, 5);
  
  // Hover effect instead of landing struts - ship hovers above rover
  const hoverWave = Math.sin(Date.now() * 0.004) * 1.5;
  
  // Glow underneath
  const glowGrad = ctx.createRadialGradient(0, 18 + hoverWave, 2, 0, 18 + hoverWave, 18);
  glowGrad.addColorStop(0, 'rgba(255, 100, 100, 0.6)');
  glowGrad.addColorStop(0.4, 'rgba(255, 50, 50, 0.3)');
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.ellipse(0, 18 + hoverWave, 15, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Hover thrusters
  const thrusterLen = 5 + Math.random() * 3;
  const thrusterGrad = ctx.createLinearGradient(0, 5, 0, 5 + thrusterLen);
  thrusterGrad.addColorStop(0, '#ff8866');
  thrusterGrad.addColorStop(0.3, '#ff4422');
  thrusterGrad.addColorStop(0.6, '#cc2200');
  thrusterGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = thrusterGrad;
  
  // Left thruster
  ctx.beginPath();
  ctx.moveTo(-6, 4);
  ctx.lineTo(-8, 4 + thrusterLen);
  ctx.lineTo(-4, 4 + thrusterLen);
  ctx.closePath();
  ctx.fill();
  
  // Right thruster
  ctx.beginPath();
  ctx.moveTo(6, 4);
  ctx.lineTo(4, 4 + thrusterLen);
  ctx.lineTo(8, 4 + thrusterLen);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
}

function renderRover(ctx: CanvasRenderingContext2D, state: MoonRoverState): void {
  const x = state.roverX;
  const y = state.roverY;
  const time = Date.now() * 0.003;
  
  ctx.save();
  ctx.translate(x, y);
  
  // Dynamic shadow based on lighting
  const shadowGrad = ctx.createRadialGradient(42, 18, 0, 42, 18, 50);
  shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
  shadowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.ellipse(42, 18, 50, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Wheels with detailed rendering (6 wheels like Mars rover)
  for (let i = 0; i < 6; i++) {
    const wx = 8 + i * 14;
    const wy = 10;
    const wSize = i === 0 || i === 5 ? 11 : 9;
    
    // Wheel shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(wx + 2, wy + 3, wSize, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Wheel rim with metallic gradient
    const wheelGrad = ctx.createRadialGradient(wx - 2, wy - 2, 0, wx, wy, wSize);
    wheelGrad.addColorStop(0, '#555555');
    wheelGrad.addColorStop(0.4, '#333333');
    wheelGrad.addColorStop(0.7, '#222222');
    wheelGrad.addColorStop(1, '#111111');
    ctx.fillStyle = wheelGrad;
    ctx.beginPath();
    ctx.arc(wx, wy, wSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Wheel tread pattern
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    const spokeTime = time + i * 0.3;
    for (let j = 0; j < 6; j++) {
      const angle = spokeTime + j * Math.PI / 3;
      ctx.beginPath();
      ctx.moveTo(wx + Math.cos(angle) * 3, wy + Math.sin(angle) * 3);
      ctx.lineTo(wx + Math.cos(angle) * (wSize - 1), wy + Math.sin(angle) * (wSize - 1));
      ctx.stroke();
    }
    
    // Hub cap
    ctx.fillStyle = '#666';
    ctx.beginPath();
    ctx.arc(wx, wy, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Main body with layered metallic effect
  const bodyGrad = ctx.createLinearGradient(0, -25, 0, 8);
  bodyGrad.addColorStop(0, '#999999');
  bodyGrad.addColorStop(0.2, '#777777');
  bodyGrad.addColorStop(0.5, '#555555');
  bodyGrad.addColorStop(0.8, '#444444');
  bodyGrad.addColorStop(1, '#333333');
  ctx.fillStyle = bodyGrad;
  
  ctx.beginPath();
  ctx.moveTo(3, 2);
  ctx.lineTo(8, -18);
  ctx.lineTo(72, -18);
  ctx.lineTo(77, 2);
  ctx.closePath();
  ctx.fill();
  
  // Body panel lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(10, -16);
  ctx.lineTo(70, -16);
  ctx.moveTo(12, -10);
  ctx.lineTo(68, -10);
  ctx.stroke();
  
  // Body detail panels
  ctx.fillStyle = '#444';
  ctx.fillRect(15, -14, 50, 10);
  ctx.fillStyle = '#555';
  ctx.fillRect(17, -12, 46, 6);
  
  // Cabin with glowing windows
  const cabinGrad = ctx.createLinearGradient(48, -28, 72, -13);
  cabinGrad.addColorStop(0, '#444');
  cabinGrad.addColorStop(0.5, '#333');
  cabinGrad.addColorStop(1, '#222');
  ctx.fillStyle = cabinGrad;
  ctx.fillRect(48, -28, 24, 15);
  
  // Glowing windshield
  const windowPulse = Math.sin(time * 2) * 0.2 + 0.8;
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 8 * windowPulse;
  const windowGrad = ctx.createLinearGradient(50, -26, 70, -16);
  windowGrad.addColorStop(0, `rgba(0, 255, 255, ${0.6 * windowPulse})`);
  windowGrad.addColorStop(0.5, `rgba(0, 200, 255, ${0.8 * windowPulse})`);
  windowGrad.addColorStop(1, `rgba(0, 150, 200, ${0.6 * windowPulse})`);
  ctx.fillStyle = windowGrad;
  ctx.fillRect(50, -26, 20, 10);
  ctx.shadowBlur = 0;
  
  // Turret base with ring detail
  ctx.fillStyle = '#666';
  ctx.beginPath();
  ctx.arc(40, -20, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#777';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(40, -20, 11, 0, Math.PI * 2);
  ctx.stroke();
  
  // Turret
  ctx.save();
  ctx.translate(40, -20);
  ctx.rotate(state.turretAngle * Math.PI / 180);
  
  // Turret head with gradient
  const turretGrad = ctx.createLinearGradient(-10, -8, 10, 8);
  turretGrad.addColorStop(0, '#777');
  turretGrad.addColorStop(0.5, '#555');
  turretGrad.addColorStop(1, '#444');
  ctx.fillStyle = turretGrad;
  ctx.fillRect(-10, -8, 20, 16);
  
  // Barrel with metallic sheen
  const barrelGrad = ctx.createLinearGradient(0, -5, 30, 5);
  barrelGrad.addColorStop(0, '#555');
  barrelGrad.addColorStop(0.3, '#666');
  barrelGrad.addColorStop(0.5, '#777');
  barrelGrad.addColorStop(0.7, '#666');
  barrelGrad.addColorStop(1, '#444');
  ctx.fillStyle = barrelGrad;
  ctx.fillRect(0, -5, 30, 10);
  
  // Barrel detail rings
  ctx.fillStyle = '#333';
  ctx.fillRect(8, -6, 3, 12);
  ctx.fillRect(18, -6, 3, 12);
  
  // Muzzle with fire effect
  const muzzleGlow = state.fireTimer > 8 ? 1 : state.fireTimer > 0 ? state.fireTimer / 8 : 0;
  if (muzzleGlow > 0) {
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 15 * muzzleGlow;
    ctx.fillStyle = `rgba(255, 255, 0, ${muzzleGlow})`;
  } else {
    ctx.fillStyle = '#333';
  }
  ctx.fillRect(28, -6, 6, 12);
  ctx.shadowBlur = 0;
  
  ctx.restore();
  
  // Antenna with blinking light
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(65, -28);
  ctx.lineTo(65, -45);
  ctx.stroke();
  
  // Antenna dish
  ctx.fillStyle = '#666';
  ctx.beginPath();
  ctx.ellipse(65, -45, 4, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Antenna light with glow
  const blink = Math.sin(time * 4) > 0;
  if (blink) {
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(65, -47, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  
  // Solar panels on sides
  ctx.fillStyle = '#223366';
  ctx.fillRect(2, -8, 8, 6);
  ctx.fillRect(70, -8, 8, 6);
  ctx.strokeStyle = '#334477';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(3 + i * 2.5, -8);
    ctx.lineTo(3 + i * 2.5, -2);
    ctx.moveTo(71 + i * 2.5, -8);
    ctx.lineTo(71 + i * 2.5, -2);
    ctx.stroke();
  }
  
  ctx.restore();
}

function renderRoverEnemy(ctx: CanvasRenderingContext2D, enemy: RoverEnemy): void {
  const frame = Math.floor(enemy.frame) % 2;
  const time = Date.now() * 0.003;
  
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  
  // Glow colors per type
  const glowColor = enemy.type === 'destroyer' ? '#ff00ff' : 
                    enemy.type === 'bomber' ? '#ff8800' : 
                    enemy.type === 'fighter' ? '#ff0000' :
                    enemy.type === 'speeder' ? '#00ffff' : '#00ff00';
  
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 20;
  
  switch (enemy.type) {
    case 'scout':
      // Sleek fast scout ship with gradient
      const scoutGrad = ctx.createLinearGradient(-enemy.size, 0, enemy.size, 0);
      scoutGrad.addColorStop(0, '#003300');
      scoutGrad.addColorStop(0.3, '#00aa00');
      scoutGrad.addColorStop(0.7, '#00ff00');
      scoutGrad.addColorStop(1, '#88ff88');
      ctx.fillStyle = scoutGrad;
      ctx.beginPath();
      ctx.moveTo(-enemy.size, 0);
      ctx.lineTo(enemy.size * 0.3, -enemy.size * 0.6);
      ctx.lineTo(enemy.size, 0);
      ctx.lineTo(enemy.size * 0.3, enemy.size * 0.6);
      ctx.closePath();
      ctx.fill();
      
      // Engine glow
      ctx.shadowBlur = 0;
      const enginePulse = Math.sin(time * 6) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(0, 255, 100, ${enginePulse})`;
      ctx.beginPath();
      ctx.arc(-enemy.size + 3, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'fighter':
      // Aggressive attack fighter with detailed body
      const fighterGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, enemy.size);
      fighterGrad.addColorStop(0, '#ff6666');
      fighterGrad.addColorStop(0.5, '#cc0000');
      fighterGrad.addColorStop(1, '#660000');
      ctx.fillStyle = fighterGrad;
      ctx.beginPath();
      ctx.moveTo(-enemy.size, 0);
      ctx.lineTo(enemy.size * 0.3, -enemy.size * 0.8);
      ctx.lineTo(enemy.size, 0);
      ctx.lineTo(enemy.size * 0.3, enemy.size * 0.8);
      ctx.closePath();
      ctx.fill();
      
      // Wing guns with glow
      ctx.shadowBlur = 5;
      ctx.fillStyle = '#888';
      ctx.fillRect(-enemy.size * 0.4, -enemy.size * 1.0, enemy.size * 0.5, enemy.size * 0.3);
      ctx.fillRect(-enemy.size * 0.4, enemy.size * 0.7, enemy.size * 0.5, enemy.size * 0.3);
      
      // Cockpit
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 200, 200, 0.6)';
      ctx.beginPath();
      ctx.ellipse(enemy.size * 0.2, 0, enemy.size * 0.3, enemy.size * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'bomber':
      // Heavy bomber with cargo bay
      const bomberGrad = ctx.createRadialGradient(-enemy.size * 0.2, 0, 0, 0, 0, enemy.size);
      bomberGrad.addColorStop(0, '#ffcc66');
      bomberGrad.addColorStop(0.4, '#cc8800');
      bomberGrad.addColorStop(1, '#664400');
      ctx.fillStyle = bomberGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, enemy.size, enemy.size * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Wings with detail
      ctx.shadowBlur = 0;
      const wingGrad = ctx.createLinearGradient(0, -enemy.size, 0, enemy.size);
      wingGrad.addColorStop(0, '#aa6600');
      wingGrad.addColorStop(0.5, '#885500');
      wingGrad.addColorStop(1, '#aa6600');
      ctx.fillStyle = wingGrad;
      ctx.fillRect(-enemy.size * 0.4, -enemy.size * 0.9, enemy.size * 0.8, enemy.size * 0.35);
      ctx.fillRect(-enemy.size * 0.4, enemy.size * 0.55, enemy.size * 0.8, enemy.size * 0.35);
      
      // Bomb bay with blinking light
      ctx.fillStyle = '#222';
      ctx.fillRect(-enemy.size * 0.3, enemy.size * 0.35, enemy.size * 0.6, enemy.size * 0.25);
      const bombBlink = Math.sin(time * 5) > 0;
      if (bombBlink) {
        ctx.fillStyle = '#ff4400';
        ctx.beginPath();
        ctx.arc(0, enemy.size * 0.45, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
      
    case 'destroyer':
      // Large destroyer with detailed hull
      const destroyerGrad = ctx.createLinearGradient(-enemy.size, 0, enemy.size, 0);
      destroyerGrad.addColorStop(0, '#330033');
      destroyerGrad.addColorStop(0.3, '#880088');
      destroyerGrad.addColorStop(0.5, '#cc44cc');
      destroyerGrad.addColorStop(0.7, '#880088');
      destroyerGrad.addColorStop(1, '#330033');
      ctx.fillStyle = destroyerGrad;
      ctx.beginPath();
      ctx.moveTo(-enemy.size, 0);
      ctx.lineTo(-enemy.size * 0.6, -enemy.size * 0.7);
      ctx.lineTo(enemy.size * 0.7, -enemy.size * 0.5);
      ctx.lineTo(enemy.size, 0);
      ctx.lineTo(enemy.size * 0.7, enemy.size * 0.5);
      ctx.lineTo(-enemy.size * 0.6, enemy.size * 0.7);
      ctx.closePath();
      ctx.fill();
      
      // Bridge with glow
      ctx.shadowBlur = 10;
      const bridgeGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, enemy.size * 0.35);
      bridgeGrad.addColorStop(0, '#ffaaff');
      bridgeGrad.addColorStop(0.5, '#ff66ff');
      bridgeGrad.addColorStop(1, '#aa00aa');
      ctx.fillStyle = bridgeGrad;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.size * 0.35, 0, Math.PI * 2);
      ctx.fill();
      
      // Shield rings
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(255, 100, 255, ${0.3 + Math.sin(time * 3) * 0.2})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.size * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      break;
      
    case 'speeder':
      // Fast speeder - small, sleek, cyan colored
      const speederGrad = ctx.createLinearGradient(-enemy.size, 0, enemy.size, 0);
      speederGrad.addColorStop(0, '#004444');
      speederGrad.addColorStop(0.3, '#00aaaa');
      speederGrad.addColorStop(0.5, '#00ffff');
      speederGrad.addColorStop(0.7, '#00aaaa');
      speederGrad.addColorStop(1, '#88ffff');
      ctx.fillStyle = speederGrad;
      
      // Streamlined arrow shape
      ctx.beginPath();
      ctx.moveTo(-enemy.size, 0);
      ctx.lineTo(-enemy.size * 0.3, -enemy.size * 0.4);
      ctx.lineTo(enemy.size, 0);
      ctx.lineTo(-enemy.size * 0.3, enemy.size * 0.4);
      ctx.closePath();
      ctx.fill();
      
      // Speed trail effect
      ctx.shadowBlur = 0;
      const speedPulse = Math.sin(time * 10) * 0.4 + 0.6;
      ctx.fillStyle = `rgba(0, 255, 255, ${speedPulse * 0.5})`;
      ctx.beginPath();
      ctx.moveTo(-enemy.size * 2, 0);
      ctx.lineTo(-enemy.size, -enemy.size * 0.2);
      ctx.lineTo(-enemy.size, enemy.size * 0.2);
      ctx.closePath();
      ctx.fill();
      
      // Engine glow
      ctx.fillStyle = `rgba(0, 255, 255, ${speedPulse})`;
      ctx.beginPath();
      ctx.arc(-enemy.size + 2, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
  
  // Health bar for damaged enemies
  if (enemy.health < enemy.maxHealth) {
    ctx.shadowBlur = 0;
    const healthPct = enemy.health / enemy.maxHealth;
    ctx.fillStyle = '#222';
    ctx.fillRect(-18, -enemy.size - 10, 36, 6);
    const healthGrad = ctx.createLinearGradient(-18, 0, 18, 0);
    if (healthPct > 0.5) {
      healthGrad.addColorStop(0, '#00aa00');
      healthGrad.addColorStop(1, '#00ff00');
    } else if (healthPct > 0.25) {
      healthGrad.addColorStop(0, '#aaaa00');
      healthGrad.addColorStop(1, '#ffff00');
    } else {
      healthGrad.addColorStop(0, '#aa0000');
      healthGrad.addColorStop(1, '#ff0000');
    }
    ctx.fillStyle = healthGrad;
    ctx.fillRect(-18, -enemy.size - 10, 36 * healthPct, 6);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.strokeRect(-18, -enemy.size - 10, 36, 6);
  }
  
  ctx.shadowBlur = 0;
  ctx.restore();
}

function renderRoverBullet(ctx: CanvasRenderingContext2D, bullet: RoverBullet): void {
  ctx.save();
  
  if (bullet.isPlayer) {
    // Player laser
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 10;
    
    ctx.beginPath();
    ctx.moveTo(bullet.x, bullet.y);
    ctx.lineTo(bullet.x - bullet.velocityX * 2, bullet.y - bullet.velocityY * 2);
    ctx.stroke();
    
    ctx.strokeStyle = '#88ff88';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bullet.x, bullet.y);
    ctx.lineTo(bullet.x - bullet.velocityX * 2, bullet.y - bullet.velocityY * 2);
    ctx.stroke();
  } else {
    // Enemy bomb
    ctx.fillStyle = '#ff4400';
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
}

function renderRoverExplosion(ctx: CanvasRenderingContext2D, exp: RoverExplosion): void {
  const progress = exp.frame / exp.maxFrames;
  const size = exp.size * (1 + progress);
  const alpha = 1 - progress;
  
  ctx.save();
  ctx.translate(exp.x, exp.y);
  
  for (let i = 0; i < 3; i++) {
    const ringProgress = Math.min(1, progress * 2 + i * 0.2);
    const ringSize = size * ringProgress * (1 + i * 0.3);
    const ringAlpha = alpha * (1 - i * 0.3);
    
    const colors = ['#ffffff', '#ffff00', '#ff8800', '#ff0000'];
    const colorIndex = Math.min(colors.length - 1, Math.floor(progress * colors.length));
    
    ctx.beginPath();
    ctx.arc(0, 0, ringSize, 0, Math.PI * 2);
    ctx.fillStyle = colors[colorIndex] + Math.floor(ringAlpha * 255).toString(16).padStart(2, '0');
    ctx.fill();
  }
  
  ctx.restore();
}

function renderRoverHUD(ctx: CanvasRenderingContext2D, state: MoonRoverState): void {
  const { canvasWidth, canvasHeight } = GAME_CONFIG;
  
  // Targeting reticle follows turret angle
  const reticleX = state.roverX + 40 + Math.cos(state.turretAngle * Math.PI / 180) * 150;
  const reticleY = state.roverY - 20 + Math.sin(state.turretAngle * Math.PI / 180) * 150;
  
  ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
  ctx.lineWidth = 1;
  
  // Aim line
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(state.roverX + 40, state.roverY - 20);
  ctx.lineTo(reticleX, reticleY);
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Reticle
  ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(reticleX, reticleY, 15, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(reticleX - 20, reticleY);
  ctx.lineTo(reticleX - 8, reticleY);
  ctx.moveTo(reticleX + 8, reticleY);
  ctx.lineTo(reticleX + 20, reticleY);
  ctx.moveTo(reticleX, reticleY - 20);
  ctx.lineTo(reticleX, reticleY - 8);
  ctx.moveTo(reticleX, reticleY + 8);
  ctx.lineTo(reticleX, reticleY + 20);
  ctx.stroke();
}

function renderMoonScanlines(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  for (let y = 0; y < GAME_CONFIG.canvasHeight; y += 3) {
    ctx.fillRect(0, y, GAME_CONFIG.canvasWidth, 1);
  }
}

function renderRoverUI(ctx: CanvasRenderingContext2D, state: MoonRoverState): void {
  const { canvasWidth, canvasHeight } = GAME_CONFIG;
  
  // Phase text - only show during non-driving phases
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  
  let phaseText = '';
  switch (state.phase) {
    case 'approaching': phaseText = 'APPROACHING LUNAR SURFACE'; break;
    case 'landing': phaseText = 'LANDING SEQUENCE'; break;
    case 'pilot_to_rover': phaseText = 'BOARDING ROVER'; break;
    case 'pilot_to_ship': phaseText = 'MISSION COMPLETE'; break;
    case 'takeoff': phaseText = 'TAKEOFF'; break;
    // No text during driving - show stats instead
  }
  
  // Show victory screen during showing_results phase
  if (state.phase === 'showing_results') {
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MISSION COMPLETE!', canvasWidth / 2, canvasHeight / 2 - 50);
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`TOTAL BONUS: ${state.bonusScore}`, canvasWidth / 2, canvasHeight / 2 - 10);
    ctx.fillStyle = '#00ff00';
    ctx.font = '18px monospace';
    ctx.fillText(`Enemies Defeated: ${state.enemiesDefeated}`, canvasWidth / 2, canvasHeight / 2 + 25);
    
    // Tap to continue
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px monospace';
    if (Math.floor(Date.now() / 500) % 2 === 0) {
      ctx.fillText('TAP TO CONTINUE', canvasWidth / 2, canvasHeight / 2 + 80);
    }
  } else if (state.phase === 'pilot_to_ship') {
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MISSION COMPLETE!', canvasWidth / 2, canvasHeight / 2 - 30);
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`TOTAL BONUS: ${state.bonusScore}`, canvasWidth / 2, canvasHeight / 2 + 20);
  } else if (phaseText) {
    ctx.fillStyle = '#00ff00';
    ctx.fillText(phaseText, canvasWidth / 2, 25);
  }
  
  // Show destroyed screen when rover is destroyed
  if (state.roverDestroyed) {
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MISSION FAILED', canvasWidth / 2, canvasHeight / 2 - 50);
    
    ctx.fillStyle = '#ff6600';
    ctx.font = 'bold 24px monospace';
    ctx.fillText('ROVER DESTROYED', canvasWidth / 2, canvasHeight / 2 - 10);
    
    ctx.fillStyle = '#ffff00';
    ctx.font = '18px monospace';
    ctx.fillText(`Enemies Defeated: ${state.enemiesDefeated}/${state.enemiesToDefeat}`, canvasWidth / 2, canvasHeight / 2 + 25);
    ctx.fillText(`Bonus Score: ${state.bonusScore}`, canvasWidth / 2, canvasHeight / 2 + 50);
    
    // Returning text
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    if (Math.floor(Date.now() / 500) % 2 === 0) {
      ctx.fillText('RETURNING TO MAIN GAME...', canvasWidth / 2, canvasHeight / 2 + 90);
    }
    return; // Don't render other UI when destroyed
  }
  
  // During driving phase - show stats
  if (state.phase === 'driving') {
    // Enemy count at top center
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#00ff00';
    ctx.textAlign = 'center';
    ctx.fillText(`ENEMIES: ${state.enemiesDefeated}/${state.enemiesToDefeat}`, canvasWidth / 2, 25);
    
    // Health bar at top right
    ctx.fillStyle = '#333';
    ctx.fillRect(canvasWidth - 120, 15, 100, 12);
    
    const healthPct = state.roverHealth / state.maxRoverHealth;
    ctx.fillStyle = healthPct > 0.5 ? '#00ff00' : healthPct > 0.25 ? '#ffff00' : '#ff0000';
    ctx.fillRect(canvasWidth - 120, 15, 100 * healthPct, 12);
    
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    ctx.strokeRect(canvasWidth - 120, 15, 100, 12);
    
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#00ff00';
    ctx.fillText('ROVER', canvasWidth - 120, 12);
    
    // Simple control hint at bottom
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('TOUCH TO AIM & FIRE', canvasWidth / 2, canvasHeight - 15);
  }
}