// Bunker Defense Mini-Game - Every 3rd map
// Inspired by Star Wars Arcade 1983 and Space Invaders
import { generateId } from './utils';
import { GAME_CONFIG } from './constants';
import { drawMegaShip } from './megaShipRenderer';
import { getStoredMegaShipId } from '@/hooks/useMegaShips';

export type BunkerPhase = 
  | 'approaching'       // Ship flying towards landing zone
  | 'landing'           // Ship landing animation
  | 'pilot_to_bunker'   // Pilot running to bunker
  | 'defense'           // Turret defense gameplay
  | 'pilot_to_ship'     // Pilot running back to ship
  | 'takeoff'           // Ship taking off
  | 'showing_results'   // Show results and wait for tap
  | 'complete';         // Return to normal gameplay

export interface BunkerEnemy {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  health: number;
  maxHealth: number;
  type: 'invader1' | 'invader2' | 'invader3' | 'mothership';
  angle: number;
  distance: number;
  frame: number; // Animation frame
  zigzagPhase: number; // For movement pattern
}

export interface LaserBeam {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  timer: number;
  hit: boolean;
}

export interface Explosion {
  id: string;
  x: number;
  y: number;
  frame: number;
  maxFrames: number;
  size: number;
}

export interface BunkerState {
  phase: BunkerPhase;
  phaseTimer: number;
  
  // Ship position during animations
  shipX: number;
  shipY: number;
  shipAngle: number;
  shipScale: number;
  
  // Pilot position
  pilotX: number;
  pilotY: number;
  pilotFrame: number;
  
  // Defense gameplay
  crosshairX: number;
  crosshairY: number;
  enemies: BunkerEnemy[];
  enemiesDefeated: number;
  enemiesToDefeat: number;
  waveNumber: number;
  maxWaves: number;
  spawnTimer: number;
  fireTimer: number;
  
  // Laser beams (Star Wars arcade style)
  laserBeams: LaserBeam[];
  explosions: Explosion[];
  
  // Visual variation
  variant: number;
  skyColor: string;
  groundColor: string;
  horizonColor: string;
  
  // Score
  bonusScore: number;
  
  // Sound triggers
  soundQueue: string[];
  
  // Bunker health
  bunkerHealth: number;
  maxBunkerHealth: number;
  bunkerDestroyed: boolean;
}

// Different bunker visual variants
const BUNKER_VARIANTS = [
  { skyColor: '#0a0515', groundColor: '#1a0a20', horizonColor: '#2a1535', name: 'Alien Wasteland' },
  { skyColor: '#000a15', groundColor: '#0a1525', horizonColor: '#153040', name: 'Frozen Station' },
  { skyColor: '#050510', groundColor: '#101025', horizonColor: '#202040', name: 'Deep Space Base' },
  { skyColor: '#100505', groundColor: '#200a0a', horizonColor: '#351515', name: 'Volcanic Outpost' },
  { skyColor: '#051005', groundColor: '#0a200a', horizonColor: '#153515', name: 'Toxic Planet' },
];

// Audio context and sounds
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

export function playBunkerSound(type: 'laser' | 'explosion' | 'hit' | 'spawn' | 'engine' | 'landing' | 'takeoff'): void {
  try {
    const ctx = getAudioContext();
    
    switch (type) {
      case 'laser': {
        // Star Wars style laser pew-pew with layered sound
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        
        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(ctx.destination);
        gain2.connect(ctx.destination);
        
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(1200, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.12);
        gain1.gain.setValueAtTime(0.12, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(600, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
        gain2.gain.setValueAtTime(0.08, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.12);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.15);
        break;
      }
        
      case 'explosion': {
        // Bigger retro explosion with multiple layers
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
        osc1.frequency.setValueAtTime(200, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.4);
        gain1.gain.setValueAtTime(0.2, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(100, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.35);
        gain2.gain.setValueAtTime(0.15, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        
        noise.type = 'triangle';
        noise.frequency.setValueAtTime(80, ctx.currentTime);
        noise.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.5);
        gainNoise.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNoise.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.4);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.35);
        noise.start(ctx.currentTime);
        noise.stop(ctx.currentTime + 0.5);
        break;
      }
        
      case 'hit': {
        // Hit marker sound
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.06);
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.06);
        break;
      }
        
      case 'spawn': {
        // Enemy spawn warning
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, ctx.currentTime);
        oscillator.frequency.setValueAtTime(500, ctx.currentTime + 0.05);
        oscillator.frequency.setValueAtTime(300, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
        break;
      }
      
      case 'engine': {
        // Continuous engine rumble sound
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        
        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(ctx.destination);
        gain2.connect(ctx.destination);
        
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(60 + Math.random() * 20, ctx.currentTime);
        gain1.gain.setValueAtTime(0.06, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(120 + Math.random() * 30, ctx.currentTime);
        gain2.gain.setValueAtTime(0.04, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.1);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.1);
        break;
      }
      
      case 'landing': {
        // Landing thrusters - descending tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
        break;
      }
      
      case 'takeoff': {
        // Takeoff thrusters - ascending tone with power
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        
        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(ctx.destination);
        gain2.connect(ctx.destination);
        
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(80, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.4);
        gain1.gain.setValueAtTime(0.12, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(40, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.35);
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

export function createBunkerState(mapId: number): BunkerState {
  const variant = mapId % BUNKER_VARIANTS.length;
  const variantData = BUNKER_VARIANTS[variant];
  const wavesCount = 2 + Math.floor(mapId / 6);
  
  return {
    phase: 'approaching',
    phaseTimer: 120,
    
    // Ship starts from LEFT, facing RIGHT (forward)
    shipX: -100,
    shipY: GAME_CONFIG.canvasHeight / 2 - 50,
    shipAngle: 0,
    shipScale: 0.3,
    
    pilotX: 0,
    pilotY: 0,
    pilotFrame: 0,
    
    crosshairX: GAME_CONFIG.canvasWidth / 2,
    crosshairY: GAME_CONFIG.canvasHeight / 2,
    enemies: [],
    enemiesDefeated: 0,
    enemiesToDefeat: 8 + Math.floor(mapId * 1.5), // Slightly fewer enemies
    waveNumber: 1,
    maxWaves: Math.min(wavesCount, 4), // Max 4 waves
    spawnTimer: 0,
    fireTimer: 0,
    
    laserBeams: [],
    explosions: [],
    
    variant,
    skyColor: variantData.skyColor,
    groundColor: variantData.groundColor,
    horizonColor: variantData.horizonColor,
    
    bonusScore: 0,
    soundQueue: [],
    
    // Bunker health
    bunkerHealth: 100,
    maxBunkerHealth: 100,
    bunkerDestroyed: false,
  };
}

export function updateBunkerState(
  state: BunkerState,
  input: { touchX: number; touchY: number; isTouching: boolean; fire: boolean }
): BunkerState {
  const newState = { ...state, soundQueue: [] as string[] };
  
  // Update laser beams
  newState.laserBeams = state.laserBeams
    .map(beam => ({ ...beam, timer: beam.timer - 1 }))
    .filter(beam => beam.timer > 0);
  
  // Update explosions
  newState.explosions = state.explosions
    .map(exp => ({ ...exp, frame: exp.frame + 0.5 }))
    .filter(exp => exp.frame < exp.maxFrames);
  
  // Update enemy animation frames
  newState.enemies = state.enemies.map(enemy => ({
    ...enemy,
    frame: (enemy.frame + 0.1) % 2,
    zigzagPhase: enemy.zigzagPhase + 0.05,
  }));
  
  switch (state.phase) {
    case 'approaching':
      // Ship flies in from LEFT to center-right
      newState.shipX = Math.min(GAME_CONFIG.canvasWidth * 0.65, state.shipX + 5);
      newState.shipY = state.shipY + Math.sin(state.phaseTimer * 0.1) * 0.5;
      newState.shipScale = Math.min(1, state.shipScale + 0.005);
      newState.phaseTimer--;
      
      // Engine sound every few frames
      if (state.phaseTimer % 8 === 0) {
        newState.soundQueue.push('engine');
      }
      
      if (newState.shipX >= GAME_CONFIG.canvasWidth * 0.65) {
        newState.phase = 'landing';
        newState.phaseTimer = 90;
        newState.soundQueue.push('landing');
      }
      break;
      
    case 'landing':
      // Ship descends and lands
      const landingTargetY = GAME_CONFIG.canvasHeight - 80;
      newState.shipY = state.shipY + (landingTargetY - state.shipY) * 0.05;
      newState.shipAngle = Math.sin(state.phaseTimer * 0.15) * 3;
      newState.phaseTimer--;
      
      // Landing thruster sounds
      if (state.phaseTimer % 12 === 0) {
        newState.soundQueue.push('landing');
      }
      
      if (state.phaseTimer <= 0) {
        newState.phase = 'pilot_to_bunker';
        newState.phaseTimer = 80;
        newState.pilotX = newState.shipX - 30;
        newState.pilotY = GAME_CONFIG.canvasHeight - 50;
        newState.shipAngle = 0;
      }
      break;
      
    case 'pilot_to_bunker':
      // Pilot runs to bunker on the left
      const bunkerX = 80;
      newState.pilotX = state.pilotX - 4;
      newState.pilotFrame = Math.floor(state.phaseTimer / 5) % 4;
      newState.phaseTimer--;
      
      if (newState.pilotX <= bunkerX) {
        newState.phase = 'defense';
        newState.phaseTimer = 0;
        newState.spawnTimer = 30;
      }
      break;
      
    case 'defense':
      // Turret defense gameplay - crosshair 100px to the right of finger
      const CROSSHAIR_OFFSET_X = 100;
      newState.crosshairX = (input.touchX ? input.touchX + CROSSHAIR_OFFSET_X : state.crosshairX);
      newState.crosshairY = input.touchY || state.crosshairY;
      
      // Fire cooldown
      if (newState.fireTimer > 0) newState.fireTimer--;
      
      // Shoot laser at crosshair position
      if (input.isTouching && newState.fireTimer <= 0) {
        newState.fireTimer = 12;
        newState.soundQueue.push('laser');
        
        // Create laser beams from bunker gun positions (attached to bunker on left side)
        const bunkerBaseX = 20;
        const bunkerY = GAME_CONFIG.canvasHeight - 65;
        
        // Left cannon (on bunker roof left side)
        newState.laserBeams.push({
          id: generateId(),
          startX: bunkerBaseX + 45,
          startY: bunkerY - 8,
          endX: newState.crosshairX,
          endY: newState.crosshairY,
          timer: 8,
          hit: false,
        });
        
        // Right cannon (on bunker roof right side)
        newState.laserBeams.push({
          id: generateId(),
          startX: bunkerBaseX + 115,
          startY: bunkerY - 8,
          endX: newState.crosshairX,
          endY: newState.crosshairY,
          timer: 8,
          hit: false,
        });
        
        // Check hits
        newState.enemies = state.enemies.map(enemy => {
          const dx = enemy.x - newState.crosshairX;
          const dy = enemy.y - newState.crosshairY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const hitRadius = 30 + enemy.size * 0.5;
          
          if (dist < hitRadius) {
            newState.soundQueue.push('hit');
            const newEnemy = { ...enemy, health: enemy.health - 30 };
            if (newEnemy.health <= 0) {
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
              const scoreMap = { mothership: 100, invader3: 50, invader2: 30, invader1: 20 };
              newState.bonusScore += scoreMap[enemy.type] || 20;
            }
            return newEnemy;
          }
          return enemy;
        }).filter(e => e.health > 0);
      }
      
      // Update enemies - all target the bunker
      const bunkerTargetX = 80;
      const bunkerTargetY = GAME_CONFIG.canvasHeight - 70;
      
      newState.enemies = newState.enemies.map(enemy => {
        // Calculate direction to bunker
        const dx = bunkerTargetX - enemy.x;
        const dy = bunkerTargetY - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const targetAngle = Math.atan2(dy, dx);
        
        // Smooth angle adjustment toward bunker
        let newAngle = enemy.angle;
        const angleDiff = targetAngle - enemy.angle;
        newAngle += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), 0.03);
        
        return {
          ...enemy,
          angle: newAngle,
          x: enemy.x + Math.cos(newAngle) * enemy.speed + Math.sin(enemy.zigzagPhase) * 0.3,
          y: enemy.y + Math.sin(newAngle) * enemy.speed,
          distance: Math.max(0, enemy.distance - enemy.speed * 0.5),
          size: Math.min(45, enemy.size + 0.12),
        };
      });
      
      // Check for enemies reaching the bunker (causing damage)
      const bunkerPosX = 80;
      const bunkerPosY = GAME_CONFIG.canvasHeight - 70;
      newState.enemies = newState.enemies.filter(enemy => {
        // Enemy reaches bunker if it's close enough
        const reachesBunker = enemy.x < bunkerPosX + 60 && enemy.y > bunkerPosY - 40 && enemy.y < GAME_CONFIG.canvasHeight;
        if (reachesBunker) {
          // Damage bunker based on enemy type
          const damageMap = { mothership: 30, invader3: 20, invader2: 15, invader1: 10 };
          newState.bunkerHealth -= damageMap[enemy.type] || 10;
          newState.soundQueue.push('explosion');
          newState.explosions.push({
            id: generateId(),
            x: enemy.x,
            y: enemy.y,
            frame: 0,
            maxFrames: 12,
            size: enemy.size * 1.5,
          });
          return false; // Remove enemy
        }
        // Also filter out enemies that go off screen
        return enemy.x > -50 && enemy.x < GAME_CONFIG.canvasWidth + 50 && 
               enemy.y > -50 && enemy.y < GAME_CONFIG.canvasHeight + 50;
      });
      
      // Check if bunker is destroyed
      if (newState.bunkerHealth <= 0) {
        newState.bunkerDestroyed = true;
        newState.bunkerHealth = 0;
      }
      
      // Spawn enemies
      newState.spawnTimer--;
      if (newState.spawnTimer <= 0 && newState.enemiesDefeated < state.enemiesToDefeat && !newState.bunkerDestroyed) {
        const remaining = state.enemiesToDefeat - newState.enemiesDefeated - newState.enemies.length;
        if (remaining > 0 && newState.enemies.length < 6) {
          newState.enemies.push(createBunkerEnemy(state.waveNumber));
          newState.spawnTimer = 45 + Math.random() * 35;
          newState.soundQueue.push('spawn');
        }
      }
      
      // Check wave/completion
      if (newState.enemiesDefeated >= state.enemiesToDefeat && !newState.bunkerDestroyed) {
        newState.phase = 'pilot_to_ship';
        newState.phaseTimer = 80;
        newState.pilotX = 80;
      }
      break;
      
    case 'pilot_to_ship':
      // Pilot runs back to ship
      newState.pilotX = state.pilotX + 4;
      newState.pilotFrame = Math.floor(state.phaseTimer / 5) % 4;
      newState.phaseTimer--;
      
      if (newState.pilotX >= newState.shipX - 30) {
        newState.phase = 'takeoff';
        newState.phaseTimer = 90;
      }
      break;
      
    case 'takeoff':
      // Ship takes off - flying forward (to the right)
      newState.shipY = state.shipY - 3;
      newState.shipX = state.shipX + 4;
      newState.shipAngle = -8;
      newState.phaseTimer--;
      
      // Takeoff engine sounds
      if (state.phaseTimer % 6 === 0) {
        newState.soundQueue.push('takeoff');
      }
      
      if (state.phaseTimer <= 0) {
        newState.phase = 'showing_results';
      }
      break;
      
    case 'showing_results':
      // Wait for tap to continue - handled via input.isTouching
      if (input.isTouching) {
        newState.phase = 'complete';
      }
      break;
  }
  
  // Play queued sounds
  newState.soundQueue.forEach(sound => {
    playBunkerSound(sound as any);
  });
  
  return newState;
}

function createBunkerEnemy(wave: number): BunkerEnemy {
  const side = Math.random();
  let x: number, y: number, angle: number;
  
  // Bunker position (target)
  const bunkerX = 80;
  const bunkerY = GAME_CONFIG.canvasHeight - 70;
  
  // 80% from right side, 20% from top-right corner
  if (side < 0.8) {
    // From right side of screen
    x = GAME_CONFIG.canvasWidth + 30;
    y = 60 + Math.random() * (GAME_CONFIG.canvasHeight - 140);
  } else {
    // From top-right corner
    x = GAME_CONFIG.canvasWidth * 0.6 + Math.random() * (GAME_CONFIG.canvasWidth * 0.4);
    y = -30;
  }
  
  // Calculate angle toward bunker
  const dx = bunkerX - x;
  const dy = bunkerY - y;
  angle = Math.atan2(dy, dx);
  
  const typeRoll = Math.random();
  const type: BunkerEnemy['type'] = typeRoll < 0.4 ? 'invader1' : typeRoll < 0.7 ? 'invader2' : typeRoll < 0.9 ? 'invader3' : 'mothership';
  
  const healthMap = { invader1: 30, invader2: 50, invader3: 70, mothership: 120 };
  const speedMap = { invader1: 2.2, invader2: 1.8, invader3: 1.4, mothership: 1 };
  
  return {
    id: generateId(),
    x,
    y,
    size: 8,
    speed: speedMap[type] + wave * 0.08,
    health: healthMap[type] + wave * 8,
    maxHealth: healthMap[type] + wave * 8,
    type,
    angle,
    distance: 300,
    frame: 0,
    zigzagPhase: Math.random() * Math.PI * 2,
  };
}

export function renderBunkerScene(
  ctx: CanvasRenderingContext2D,
  state: BunkerState
): void {
  const { canvasWidth, canvasHeight } = GAME_CONFIG;
  
  // Deep space gradient background
  const skyGrad = ctx.createRadialGradient(
    canvasWidth / 2, canvasHeight * 0.3, 0,
    canvasWidth / 2, canvasHeight * 0.3, canvasWidth
  );
  skyGrad.addColorStop(0, state.horizonColor);
  skyGrad.addColorStop(0.5, state.skyColor);
  skyGrad.addColorStop(1, '#000000');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // Stars
  renderStarfield(ctx, state);
  
  // Distant mountains/structures
  renderDistantHorizon(ctx, state);
  
  // Destroyed landscape (debris, craters)
  renderDestroyedLandscape(ctx, state);
  
  // Bunker
  renderBunker(ctx, state);
  
  // Ship (if not in defense phase)
  if (state.phase !== 'defense') {
    renderLandingShip(ctx, state);
  }
  
  // Pilot (during running phases)
  if (state.phase === 'pilot_to_bunker' || state.phase === 'pilot_to_ship') {
    renderPilot(ctx, state);
  }
  
  // Defense gameplay elements
  if (state.phase === 'defense') {
    renderDefenseView(ctx, state);
  }
  
  // Scanlines effect
  renderScanlines(ctx);
  
  // UI overlay
  renderBunkerUI(ctx, state);
}

function renderStarfield(ctx: CanvasRenderingContext2D, state: BunkerState): void {
  const { canvasWidth, canvasHeight } = GAME_CONFIG;
  const time = Date.now() * 0.001;
  
  // Static stars
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 50; i++) {
    const x = (i * 137 + state.variant * 50) % canvasWidth;
    const y = (i * 89 + state.variant * 30) % (canvasHeight - 100);
    const size = (i % 3) === 0 ? 2 : 1;
    const twinkle = Math.sin(time * 3 + i) * 0.5 + 0.5;
    ctx.globalAlpha = 0.3 + twinkle * 0.7;
    ctx.fillRect(x, y, size, size);
  }
  ctx.globalAlpha = 1;
}

function renderDistantHorizon(ctx: CanvasRenderingContext2D, state: BunkerState): void {
  const { canvasWidth, canvasHeight } = GAME_CONFIG;
  const horizonY = canvasHeight - 90;
  
  // Distant ruined structures
  ctx.fillStyle = state.horizonColor + '80';
  for (let i = 0; i < 6; i++) {
    const x = i * 150 + (state.variant * 40) % 100 - 50;
    const height = 30 + (i % 3) * 20 + state.variant * 5;
    const width = 20 + (i % 2) * 15;
    
    // Ruined building silhouette
    ctx.beginPath();
    ctx.moveTo(x, horizonY);
    ctx.lineTo(x + width * 0.2, horizonY - height * 0.7);
    ctx.lineTo(x + width * 0.4, horizonY - height);
    ctx.lineTo(x + width * 0.6, horizonY - height * 0.8);
    ctx.lineTo(x + width * 0.8, horizonY - height * 0.9);
    ctx.lineTo(x + width, horizonY);
    ctx.fill();
  }
}

function renderDestroyedLandscape(ctx: CanvasRenderingContext2D, state: BunkerState): void {
  const { canvasWidth, canvasHeight } = GAME_CONFIG;
  
  // Ground gradient
  const groundGrad = ctx.createLinearGradient(0, canvasHeight - 70, 0, canvasHeight);
  groundGrad.addColorStop(0, state.groundColor);
  groundGrad.addColorStop(1, '#000000');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, canvasHeight - 70, canvasWidth, 70);
  
  // Craters with glow
  for (let i = 0; i < 8; i++) {
    const x = 100 + i * 95 + (state.variant * 20) % 50;
    const y = canvasHeight - 60 + Math.sin(i + state.variant) * 8;
    const size = 12 + (i % 3) * 8;
    
    // Crater glow
    const craterGlow = ctx.createRadialGradient(x, y, 0, x, y, size * 1.5);
    craterGlow.addColorStop(0, 'rgba(255, 100, 50, 0.15)');
    craterGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = craterGlow;
    ctx.fillRect(x - size * 2, y - size, size * 4, size * 2);
    
    // Crater
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 0.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();
  }
  
  // Debris/rubble with variety
  for (let i = 0; i < 15; i++) {
    const x = 120 + i * 50 + (state.variant * 25) % 30;
    const y = canvasHeight - 65;
    const h = 4 + (i % 5) * 6;
    const w = 5 + (i % 4) * 3;
    
    ctx.fillStyle = i % 2 === 0 ? '#2a2a2a' : '#1a1a1a';
    ctx.fillRect(x, y - h, w, h);
  }
  
  // Animated smoke columns
  const time = Date.now() * 0.001;
  for (let i = 0; i < 4; i++) {
    const x = 180 + i * 170 + state.variant * 35;
    for (let j = 0; j < 6; j++) {
      const smokeY = canvasHeight - 85 - j * 20 - Math.sin(time + i + j * 0.5) * 4;
      const alpha = 0.12 - j * 0.015;
      const size = 10 + j * 5;
      ctx.beginPath();
      ctx.arc(x + Math.sin(time * 2 + j) * 4, smokeY, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(80, 80, 80, ${alpha})`;
      ctx.fill();
    }
    
    // Fire glow at base
    const fireGlow = ctx.createRadialGradient(x, canvasHeight - 70, 0, x, canvasHeight - 70, 20);
    fireGlow.addColorStop(0, 'rgba(255, 100, 30, 0.3)');
    fireGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = fireGlow;
    ctx.fillRect(x - 25, canvasHeight - 90, 50, 40);
  }
}

function renderBunker(ctx: CanvasRenderingContext2D, state: BunkerState): void {
  const { canvasHeight } = GAME_CONFIG;
  const bunkerX = 20;
  const bunkerY = canvasHeight - 105;
  
  // Bunker shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(bunkerX + 80, canvasHeight - 55, 80, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Bunker body with gradient
  const bunkerGrad = ctx.createLinearGradient(bunkerX, bunkerY, bunkerX, bunkerY + 50);
  bunkerGrad.addColorStop(0, '#4a4a4a');
  bunkerGrad.addColorStop(0.5, '#3a3a3a');
  bunkerGrad.addColorStop(1, '#2a2a2a');
  ctx.fillStyle = bunkerGrad;
  
  ctx.beginPath();
  ctx.moveTo(bunkerX, bunkerY + 50);
  ctx.lineTo(bunkerX + 15, bunkerY + 5);
  ctx.lineTo(bunkerX + 145, bunkerY + 5);
  ctx.lineTo(bunkerX + 160, bunkerY + 50);
  ctx.closePath();
  ctx.fill();
  
  // Bunker roof
  ctx.fillStyle = '#555';
  ctx.beginPath();
  ctx.moveTo(bunkerX + 10, bunkerY + 5);
  ctx.lineTo(bunkerX + 80, bunkerY - 20);
  ctx.lineTo(bunkerX + 150, bunkerY + 5);
  ctx.closePath();
  ctx.fill();
  
  // Antenna
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(bunkerX + 80, bunkerY - 20);
  ctx.lineTo(bunkerX + 80, bunkerY - 40);
  ctx.stroke();
  
  // Antenna light (blinking)
  const blink = Math.sin(Date.now() * 0.005) > 0;
  if (blink) {
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(bunkerX + 80, bunkerY - 42, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Window (glowing during defense)
  const windowGlow = state.phase === 'defense' ? 1 : 0.4;
  
  // Window glow effect
  const glowGrad = ctx.createRadialGradient(
    bunkerX + 80, bunkerY + 22, 0,
    bunkerX + 80, bunkerY + 22, 50
  );
  glowGrad.addColorStop(0, `rgba(0, 255, 255, ${windowGlow * 0.3})`);
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(bunkerX + 30, bunkerY - 10, 100, 70);
  
  // Window
  ctx.fillStyle = `rgba(0, 200, 255, ${windowGlow})`;
  ctx.fillRect(bunkerX + 40, bunkerY + 12, 80, 25);
  
  // Window frame
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 4;
  ctx.strokeRect(bunkerX + 40, bunkerY + 12, 80, 25);
  
  // Window crossbars
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(bunkerX + 80, bunkerY + 12);
  ctx.lineTo(bunkerX + 80, bunkerY + 37);
  ctx.moveTo(bunkerX + 40, bunkerY + 24);
  ctx.lineTo(bunkerX + 120, bunkerY + 24);
  ctx.stroke();
  
  // Reinforced door
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(bunkerX + 130, bunkerY + 18, 18, 32);
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;
  ctx.strokeRect(bunkerX + 130, bunkerY + 18, 18, 32);
  
  // Door handle
  ctx.fillStyle = '#666';
  ctx.fillRect(bunkerX + 143, bunkerY + 32, 3, 6);
}

function renderLandingShip(ctx: CanvasRenderingContext2D, state: BunkerState): void {
  ctx.save();
  ctx.translate(state.shipX, state.shipY);
  ctx.rotate((state.shipAngle * Math.PI) / 180);
  ctx.scale(state.shipScale, state.shipScale);
  
  // Ship shadow
  if (state.phase === 'landing' || state.phase === 'pilot_to_bunker' || 
      state.phase === 'pilot_to_ship') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 50 + (GAME_CONFIG.canvasHeight - 80 - state.shipY) * 0.3, 35, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Engine glow (when flying)
  
  // Draw the selected mega ship
  const megaShipId = getStoredMegaShipId();
  const time = Date.now() * 0.003;
  drawMegaShip(ctx, 0, 0, megaShipId, time);
  
  // Ship hovers above ground when landed - no landing gear
  if (state.phase === 'landing' || state.phase === 'pilot_to_bunker' || 
      state.phase === 'pilot_to_ship' || state.phase === 'takeoff') {
    // Hover effect - subtle up/down motion and glow underneath
    const hoverWave = Math.sin(Date.now() * 0.003) * 2;
    
    // Ground glow effect
    const glowGrad = ctx.createRadialGradient(0, 25 + hoverWave, 5, 0, 25 + hoverWave, 30);
    glowGrad.addColorStop(0, 'rgba(0, 200, 255, 0.4)');
    glowGrad.addColorStop(0.5, 'rgba(0, 150, 255, 0.2)');
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.ellipse(0, 25 + hoverWave, 25, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Small thruster flames pointing down
    const thrusterLen = 8 + Math.random() * 4;
    const thrusterGrad = ctx.createLinearGradient(0, 8, 0, 8 + thrusterLen);
    thrusterGrad.addColorStop(0, '#88ddff');
    thrusterGrad.addColorStop(0.3, '#00aaff');
    thrusterGrad.addColorStop(0.6, '#0066aa');
    thrusterGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = thrusterGrad;
    
    // Left thruster
    ctx.beginPath();
    ctx.moveTo(-10, 6);
    ctx.lineTo(-12, 6 + thrusterLen);
    ctx.lineTo(-8, 6 + thrusterLen);
    ctx.closePath();
    ctx.fill();
    
    // Right thruster
    ctx.beginPath();
    ctx.moveTo(10, 6);
    ctx.lineTo(8, 6 + thrusterLen);
    ctx.lineTo(12, 6 + thrusterLen);
    ctx.closePath();
    ctx.fill();
  }
  
  ctx.restore();
}

function renderPilot(ctx: CanvasRenderingContext2D, state: BunkerState): void {
  const x = state.pilotX;
  const y = state.pilotY;
  const frame = state.pilotFrame;
  
  // Running animation
  const legOffset = Math.sin(frame * Math.PI / 2) * 5;
  const armOffset = Math.cos(frame * Math.PI / 2) * 4;
  const bodyBob = Math.abs(Math.sin(frame * Math.PI / 2)) * 2;
  
  // Direction (running left to bunker, right to ship)
  const dir = state.phase === 'pilot_to_bunker' ? -1 : 1;
  
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

function renderDefenseView(ctx: CanvasRenderingContext2D, state: BunkerState): void {
  const { canvasWidth, canvasHeight } = GAME_CONFIG;
  
  // Bunker interior - darker edges
  const interiorGrad = ctx.createRadialGradient(
    canvasWidth / 2, canvasHeight / 2, 0,
    canvasWidth / 2, canvasHeight / 2, canvasWidth * 0.6
  );
  interiorGrad.addColorStop(0, 'transparent');
  interiorGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.3)');
  interiorGrad.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
  ctx.fillStyle = interiorGrad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // Window frame (thick border)
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, 45, canvasHeight);
  ctx.fillRect(canvasWidth - 45, 0, 45, canvasHeight);
  ctx.fillRect(0, 0, canvasWidth, 35);
  ctx.fillRect(0, canvasHeight - 45, canvasWidth, 45);
  
  // Frame details
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(45, 35, 8, canvasHeight - 80);
  ctx.fillRect(canvasWidth - 53, 35, 8, canvasHeight - 80);
  ctx.fillRect(45, 35, canvasWidth - 90, 6);
  ctx.fillRect(45, canvasHeight - 51, canvasWidth - 90, 6);
  
  // Window crossbars (thinner)
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(canvasWidth / 2, 35);
  ctx.lineTo(canvasWidth / 2, canvasHeight - 45);
  ctx.moveTo(45, canvasHeight / 2);
  ctx.lineTo(canvasWidth - 45, canvasHeight / 2);
  ctx.stroke();
  
  // Render enemies (Space Invaders style)
  state.enemies.forEach(enemy => {
    renderSpaceInvader(ctx, enemy);
  });
  
  // Render explosions
  state.explosions.forEach(exp => {
    renderExplosion(ctx, exp);
  });
  
  // Render laser beams (Star Wars arcade style)
  state.laserBeams.forEach(beam => {
    renderLaserBeam(ctx, beam);
  });
  
  // Targeting HUD elements
  renderTargetingHUD(ctx, state);
  
  // Crosshair (Star Wars arcade inspired)
  renderStarWarsCrosshair(ctx, state.crosshairX, state.crosshairY, state.fireTimer > 0);
  
  // Gun barrel hints at bottom
  renderGunBarrels(ctx, state);
}

function renderSpaceInvader(ctx: CanvasRenderingContext2D, enemy: BunkerEnemy): void {
  const scale = enemy.size / 20;
  const frame = Math.floor(enemy.frame) % 2;
  const time = Date.now() * 0.003;
  
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.scale(scale, scale);
  
  // Glow effect per type
  const glowColor = enemy.type === 'mothership' ? '#ff00ff' : 
                    enemy.type === 'invader3' ? '#ff0000' : 
                    enemy.type === 'invader2' ? '#00ff00' : '#00ffff';
  
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 15 + enemy.size * 0.4;
  
  if (enemy.type === 'invader1') {
    // Enhanced squid invader with gradient
    const squidGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
    squidGrad.addColorStop(0, '#66ffff');
    squidGrad.addColorStop(0.5, '#00cccc');
    squidGrad.addColorStop(1, '#006666');
    ctx.fillStyle = squidGrad;
    
    ctx.beginPath();
    if (frame === 0) {
      ctx.moveTo(0, -12);
      ctx.bezierCurveTo(10, -10, 14, -2, 12, 2);
      ctx.lineTo(14, 10);
      ctx.lineTo(6, 8);
      ctx.lineTo(4, 12);
      ctx.lineTo(0, 10);
      ctx.lineTo(-4, 12);
      ctx.lineTo(-6, 8);
      ctx.lineTo(-14, 10);
      ctx.lineTo(-12, 2);
      ctx.bezierCurveTo(-14, -2, -10, -10, 0, -12);
    } else {
      ctx.moveTo(0, -12);
      ctx.bezierCurveTo(10, -10, 14, -2, 12, 2);
      ctx.lineTo(10, 14);
      ctx.lineTo(6, 8);
      ctx.lineTo(3, 14);
      ctx.lineTo(0, 10);
      ctx.lineTo(-3, 14);
      ctx.lineTo(-6, 8);
      ctx.lineTo(-10, 14);
      ctx.lineTo(-12, 2);
      ctx.bezierCurveTo(-14, -2, -10, -10, 0, -12);
    }
    ctx.closePath();
    ctx.fill();
    
    // Glowing eyes
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-5, -3, 3, 0, Math.PI * 2);
    ctx.arc(5, -3, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000033';
    ctx.beginPath();
    ctx.arc(-5 + Math.sin(time * 2), -3, 1.5, 0, Math.PI * 2);
    ctx.arc(5 + Math.sin(time * 2), -3, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
  } else if (enemy.type === 'invader2') {
    // Enhanced crab invader
    const crabGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 18);
    crabGrad.addColorStop(0, '#88ff88');
    crabGrad.addColorStop(0.5, '#44cc44');
    crabGrad.addColorStop(1, '#226622');
    ctx.fillStyle = crabGrad;
    
    ctx.beginPath();
    if (frame === 0) {
      ctx.moveTo(-12, -10);
      ctx.lineTo(12, -10);
      ctx.bezierCurveTo(16, -8, 16, -2, 10, 0);
      ctx.lineTo(12, 4);
      ctx.lineTo(16, 10);
      ctx.lineTo(10, 8);
      ctx.lineTo(6, 6);
      ctx.lineTo(-6, 6);
      ctx.lineTo(-10, 8);
      ctx.lineTo(-16, 10);
      ctx.lineTo(-12, 4);
      ctx.lineTo(-10, 0);
      ctx.bezierCurveTo(-16, -2, -16, -8, -12, -10);
    } else {
      ctx.moveTo(-12, -10);
      ctx.lineTo(12, -10);
      ctx.bezierCurveTo(16, -8, 16, -2, 10, 0);
      ctx.lineTo(14, 8);
      ctx.lineTo(12, 12);
      ctx.lineTo(6, 8);
      ctx.lineTo(-6, 8);
      ctx.lineTo(-12, 12);
      ctx.lineTo(-14, 8);
      ctx.lineTo(-10, 0);
      ctx.bezierCurveTo(-16, -2, -16, -8, -12, -10);
    }
    ctx.closePath();
    ctx.fill();
    
    // Eye panel
    ctx.fillStyle = '#003300';
    ctx.fillRect(-8, -7, 16, 6);
    
    // Glowing eyes
    ctx.shadowBlur = 6;
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(-6, -6, 4, 4);
    ctx.fillRect(2, -6, 4, 4);
    
  } else if (enemy.type === 'invader3') {
    // Enhanced octopus invader
    const octoGrad = ctx.createRadialGradient(0, -4, 0, 0, 0, 15);
    octoGrad.addColorStop(0, '#ff6666');
    octoGrad.addColorStop(0.5, '#cc2222');
    octoGrad.addColorStop(1, '#660000');
    ctx.fillStyle = octoGrad;
    
    // Dome head
    ctx.beginPath();
    ctx.arc(0, -4, 12, Math.PI, 0);
    ctx.lineTo(12, 2);
    if (frame === 0) {
      ctx.lineTo(14, 10);
      ctx.lineTo(8, 6);
      ctx.lineTo(5, 12);
      ctx.lineTo(0, 6);
      ctx.lineTo(-5, 12);
      ctx.lineTo(-8, 6);
      ctx.lineTo(-14, 10);
    } else {
      ctx.lineTo(10, 12);
      ctx.lineTo(8, 6);
      ctx.lineTo(4, 10);
      ctx.lineTo(0, 6);
      ctx.lineTo(-4, 10);
      ctx.lineTo(-8, 6);
      ctx.lineTo(-10, 12);
    }
    ctx.lineTo(-12, 2);
    ctx.closePath();
    ctx.fill();
    
    // Angry eyes
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.ellipse(-5, -6, 4, 3, -0.3, 0, Math.PI * 2);
    ctx.ellipse(5, -6, 4, 3, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#330000';
    ctx.beginPath();
    ctx.arc(-5, -5, 2, 0, Math.PI * 2);
    ctx.arc(5, -5, 2, 0, Math.PI * 2);
    ctx.fill();
    
  } else {
    // Enhanced mothership - detailed UFO
    const motherGrad = ctx.createRadialGradient(0, -5, 0, 0, 0, 25);
    motherGrad.addColorStop(0, '#ffaaff');
    motherGrad.addColorStop(0.3, '#ff66ff');
    motherGrad.addColorStop(0.6, '#cc00cc');
    motherGrad.addColorStop(1, '#440044');
    ctx.fillStyle = motherGrad;
    
    // Main body
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 10, 0, Math.PI, 0);
    ctx.lineTo(22, 2);
    ctx.lineTo(18, 8);
    ctx.lineTo(-18, 8);
    ctx.lineTo(-22, 2);
    ctx.closePath();
    ctx.fill();
    
    // Glass dome
    const domeGrad = ctx.createRadialGradient(0, -8, 0, 0, -5, 12);
    domeGrad.addColorStop(0, 'rgba(255, 200, 255, 0.8)');
    domeGrad.addColorStop(0.5, 'rgba(200, 100, 200, 0.6)');
    domeGrad.addColorStop(1, 'rgba(100, 0, 100, 0.4)');
    ctx.fillStyle = domeGrad;
    ctx.beginPath();
    ctx.ellipse(0, -5, 10, 7, 0, Math.PI, 0);
    ctx.fill();
    
    // Running lights
    ctx.shadowBlur = 8;
    for (let i = -14; i <= 14; i += 7) {
      const lightPulse = Math.sin(time * 4 + i * 0.5) > 0;
      if (lightPulse) {
        ctx.fillStyle = i % 2 === 0 ? '#ff00ff' : '#00ffff';
        ctx.beginPath();
        ctx.arc(i, 4, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Energy beam underneath
    const beamPulse = Math.sin(time * 5) * 0.3 + 0.5;
    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(255, 0, 255, ${beamPulse * 0.3})`;
    ctx.beginPath();
    ctx.moveTo(-8, 8);
    ctx.lineTo(-15, 25);
    ctx.lineTo(15, 25);
    ctx.lineTo(8, 8);
    ctx.closePath();
    ctx.fill();
  }
  
  // Health bar for damaged enemies
  if (enemy.health < enemy.maxHealth) {
    ctx.shadowBlur = 0;
    const healthPct = enemy.health / enemy.maxHealth;
    ctx.fillStyle = '#222';
    ctx.fillRect(-18, -25, 36, 5);
    
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
    ctx.fillRect(-18, -25, 36 * healthPct, 5);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.strokeRect(-18, -25, 36, 5);
  }
  
  ctx.shadowBlur = 0;
  ctx.restore();
}

function renderExplosion(ctx: CanvasRenderingContext2D, exp: Explosion): void {
  const progress = exp.frame / exp.maxFrames;
  const size = exp.size * (1 + progress);
  const alpha = 1 - progress;
  
  ctx.save();
  ctx.translate(exp.x, exp.y);
  
  // Multiple explosion rings
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
  
  // Particles
  const particleCount = 8;
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const dist = size * progress * 1.5;
    const px = Math.cos(angle) * dist;
    const py = Math.sin(angle) * dist;
    
    ctx.fillStyle = `rgba(255, 200, 50, ${alpha})`;
    ctx.beginPath();
    ctx.arc(px, py, 3 * (1 - progress), 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
}

function renderLaserBeam(ctx: CanvasRenderingContext2D, beam: LaserBeam): void {
  const alpha = beam.timer / 8;
  
  // Outer glow
  ctx.strokeStyle = `rgba(0, 255, 0, ${alpha * 0.3})`;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(beam.startX, beam.startY);
  ctx.lineTo(beam.endX, beam.endY);
  ctx.stroke();
  
  // Middle beam
  ctx.strokeStyle = `rgba(100, 255, 100, ${alpha * 0.6})`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(beam.startX, beam.startY);
  ctx.lineTo(beam.endX, beam.endY);
  ctx.stroke();
  
  // Core beam
  ctx.strokeStyle = `rgba(200, 255, 200, ${alpha})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(beam.startX, beam.startY);
  ctx.lineTo(beam.endX, beam.endY);
  ctx.stroke();
  
  // Impact point
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
  ctx.beginPath();
  ctx.arc(beam.endX, beam.endY, 6 * alpha, 0, Math.PI * 2);
  ctx.fill();
}

function renderTargetingHUD(ctx: CanvasRenderingContext2D, state: BunkerState): void {
  const { canvasWidth, canvasHeight } = GAME_CONFIG;
  
  // Corner brackets
  ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
  ctx.lineWidth = 2;
  
  const margin = 60;
  const bracketSize = 30;
  
  // Top-left
  ctx.beginPath();
  ctx.moveTo(margin, margin + bracketSize);
  ctx.lineTo(margin, margin);
  ctx.lineTo(margin + bracketSize, margin);
  ctx.stroke();
  
  // Top-right
  ctx.beginPath();
  ctx.moveTo(canvasWidth - margin - bracketSize, margin);
  ctx.lineTo(canvasWidth - margin, margin);
  ctx.lineTo(canvasWidth - margin, margin + bracketSize);
  ctx.stroke();
  
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(margin, canvasHeight - margin - bracketSize);
  ctx.lineTo(margin, canvasHeight - margin);
  ctx.lineTo(margin + bracketSize, canvasHeight - margin);
  ctx.stroke();
  
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(canvasWidth - margin - bracketSize, canvasHeight - margin);
  ctx.lineTo(canvasWidth - margin, canvasHeight - margin);
  ctx.lineTo(canvasWidth - margin, canvasHeight - margin - bracketSize);
  ctx.stroke();
  
  // Horizontal scan line
  const scanY = (Date.now() * 0.1) % (canvasHeight - 80) + 40;
  ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(50, scanY);
  ctx.lineTo(canvasWidth - 50, scanY);
  ctx.stroke();
}

function renderStarWarsCrosshair(ctx: CanvasRenderingContext2D, x: number, y: number, firing: boolean): void {
  const time = Date.now() * 0.003;
  const pulse = Math.sin(time) * 0.2 + 0.8;
  const size = firing ? 22 : 28;
  const color = firing ? '#ff4444' : '#44ff44';
  
  ctx.save();
  ctx.translate(x, y);
  
  // Outer rotating elements
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = pulse;
  
  // Rotating outer circle segments
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI / 2) + time;
    ctx.beginPath();
    ctx.arc(0, 0, size + 8, angle, angle + 0.5);
    ctx.stroke();
  }
  
  ctx.globalAlpha = 1;
  
  // Main crosshair circle
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.stroke();
  
  // Inner circle
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
  ctx.stroke();
  
  // Crosshair lines with gaps
  const innerGap = size * 0.5;
  const outerLen = size + 15;
  
  ctx.lineWidth = 2;
  ctx.beginPath();
  // Right
  ctx.moveTo(innerGap, 0);
  ctx.lineTo(outerLen, 0);
  // Left  
  ctx.moveTo(-innerGap, 0);
  ctx.lineTo(-outerLen, 0);
  // Up
  ctx.moveTo(0, -innerGap);
  ctx.lineTo(0, -outerLen);
  // Down
  ctx.moveTo(0, innerGap);
  ctx.lineTo(0, outerLen);
  ctx.stroke();
  
  // Corner tick marks
  const cornerDist = size * 0.7;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI / 2) + Math.PI / 4;
    const cx = Math.cos(angle) * cornerDist;
    const cy = Math.sin(angle) * cornerDist;
    ctx.moveTo(cx - 4, cy);
    ctx.lineTo(cx + 4, cy);
    ctx.moveTo(cx, cy - 4);
    ctx.lineTo(cx, cy + 4);
  }
  ctx.stroke();
  
  // Center dot (pulsing when firing)
  ctx.fillStyle = firing ? '#ff0000' : color;
  ctx.beginPath();
  ctx.arc(0, 0, firing ? 4 : 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Firing flash
  if (firing) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
}

function renderGunBarrels(ctx: CanvasRenderingContext2D, state: BunkerState): void {
  const { canvasHeight } = GAME_CONFIG;
  const firing = state.fireTimer > 6;
  
  // Gun barrels attached to bunker (bunker is at x=20)
  const bunkerX = 20;
  const bunkerTopY = canvasHeight - 105;
  
  // Left gun barrel on bunker roof
  ctx.fillStyle = '#3a3a3a';
  ctx.beginPath();
  ctx.moveTo(bunkerX + 35, bunkerTopY);
  ctx.lineTo(bunkerX + 40, bunkerTopY - 25);
  ctx.lineTo(bunkerX + 55, bunkerTopY - 25);
  ctx.lineTo(bunkerX + 55, bunkerTopY);
  ctx.fill();
  
  // Right gun barrel on bunker roof
  ctx.beginPath();
  ctx.moveTo(bunkerX + 105, bunkerTopY);
  ctx.lineTo(bunkerX + 105, bunkerTopY - 25);
  ctx.lineTo(bunkerX + 120, bunkerTopY - 25);
  ctx.lineTo(bunkerX + 125, bunkerTopY);
  ctx.fill();
  
  // Barrel highlights
  ctx.fillStyle = '#4a4a4a';
  ctx.fillRect(bunkerX + 42, bunkerTopY - 22, 4, 18);
  ctx.fillRect(bunkerX + 110, bunkerTopY - 22, 4, 18);
  
  // Muzzle flash when firing
  if (firing) {
    const flashAlpha = (state.fireTimer - 6) / 6;
    
    // Left muzzle flash
    const leftFlash = ctx.createRadialGradient(
      bunkerX + 47, bunkerTopY - 28, 0,
      bunkerX + 47, bunkerTopY - 28, 20
    );
    leftFlash.addColorStop(0, `rgba(100, 255, 100, ${flashAlpha})`);
    leftFlash.addColorStop(0.5, `rgba(50, 200, 50, ${flashAlpha * 0.5})`);
    leftFlash.addColorStop(1, 'transparent');
    ctx.fillStyle = leftFlash;
    ctx.fillRect(bunkerX + 30, bunkerTopY - 50, 40, 30);
    
    // Right muzzle flash
    const rightFlash = ctx.createRadialGradient(
      bunkerX + 112, bunkerTopY - 28, 0,
      bunkerX + 112, bunkerTopY - 28, 20
    );
    rightFlash.addColorStop(0, `rgba(100, 255, 100, ${flashAlpha})`);
    rightFlash.addColorStop(0.5, `rgba(50, 200, 50, ${flashAlpha * 0.5})`);
    rightFlash.addColorStop(1, 'transparent');
    ctx.fillStyle = rightFlash;
    ctx.fillRect(bunkerX + 95, bunkerTopY - 50, 40, 30);
  }
}

function renderScanlines(ctx: CanvasRenderingContext2D): void {
  const { canvasWidth, canvasHeight } = GAME_CONFIG;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
  for (let y = 0; y < canvasHeight; y += 3) {
    ctx.fillRect(0, y, canvasWidth, 1);
  }
}

function renderBunkerUI(ctx: CanvasRenderingContext2D, state: BunkerState): void {
  const { canvasWidth, canvasHeight } = GAME_CONFIG;
  
  // Only show phase text during non-defense phases
  let phaseText = '';
  switch (state.phase) {
    case 'approaching': phaseText = 'APPROACHING OUTPOST...'; break;
    case 'landing': phaseText = 'LANDING SEQUENCE'; break;
    case 'pilot_to_bunker': phaseText = 'SECURING POSITION'; break;
    case 'pilot_to_ship': phaseText = 'MISSION COMPLETE'; break;
    case 'takeoff': phaseText = 'TAKING OFF'; break;
    // No text during defense - show stats instead
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
    ctx.fillText(`TOTAL BONUS: ${state.bonusScore}`, canvasWidth / 2, canvasHeight / 2 + 10);
    
    // Tap to continue
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px monospace';
    if (Math.floor(Date.now() / 500) % 2 === 0) {
      ctx.fillText('TAP TO CONTINUE', canvasWidth / 2, canvasHeight / 2 + 70);
    }
  } else if (state.phase === 'pilot_to_ship') {
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MISSION COMPLETE!', canvasWidth / 2, canvasHeight / 2 - 30);
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`TOTAL BONUS: ${state.bonusScore}`, canvasWidth / 2, canvasHeight / 2 + 20);
  } else if (phaseText) {
    // Text shadow
    ctx.font = 'bold 14px "Press Start 2P", monospace';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.fillText(phaseText, canvasWidth / 2 + 2, 27);
    
    // Main text
    ctx.fillStyle = '#00ffff';
    ctx.fillText(phaseText, canvasWidth / 2, 25);
  }
  
  // Defense stats with better styling - positioned at top
  if (state.phase === 'defense') {
    // Title at top center
    ctx.font = 'bold 12px "Press Start 2P", monospace';
    ctx.fillStyle = '#00ffff';
    ctx.textAlign = 'center';
    ctx.fillText('DEFEND THE OUTPOST', canvasWidth / 2, 25);
    
    // Stats panel at top left
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(55, 35, 130, 28);
    
    ctx.font = 'bold 10px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText('TARGETS', 60, 52);
    ctx.fillStyle = '#00ff00';
    ctx.fillText(`${state.enemiesDefeated}/${state.enemiesToDefeat}`, 140, 52);
    
    // Bonus panel at top right
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(canvasWidth - 185, 35, 130, 28);
    
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText('BONUS', canvasWidth - 180, 52);
    ctx.fillStyle = '#ffff00';
    ctx.fillText(`${state.bonusScore}`, canvasWidth - 105, 52);
    
    // Bunker health bar at top left (moved up to not cover bunker)
    const healthBarX = 55;
    const healthBarY = 70;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(healthBarX, healthBarY, 130, 20);
    
    const healthPct = state.bunkerHealth / state.maxBunkerHealth;
    const healthColor = healthPct > 0.5 ? '#00ff00' : healthPct > 0.25 ? '#ffff00' : '#ff0000';
    ctx.fillStyle = healthColor;
    ctx.fillRect(healthBarX + 2, healthBarY + 2, 126 * healthPct, 16);
    
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(healthBarX, healthBarY, 130, 20);
    
    ctx.font = 'bold 8px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('INTEGRITY', healthBarX + 65, healthBarY - 5);
  }
}

// Check if current map should be a bunker defense level
export function isBunkerLevel(mapId: number): boolean {
  return mapId > 1 && mapId % 3 === 0;
}
