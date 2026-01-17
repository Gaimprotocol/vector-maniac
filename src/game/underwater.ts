// Underwater Vessel Mini-Game - Exploring underwater collecting energy pods
import { generateId } from './utils';
import { GAME_CONFIG } from './constants';
import { drawMegaShip } from './megaShipRenderer';
import { getStoredMegaShipId } from '@/hooks/useMegaShips';

export type UnderwaterPhase = 
  | 'approaching'       // Ship flying towards landing zone
  | 'landing'           // Ship landing animation
  | 'pilot_to_sub'      // Pilot running to submarine
  | 'diving'            // Submarine descending
  | 'exploring'         // Underwater gameplay
  | 'ascending'         // Submarine ascending
  | 'pilot_to_ship'     // Pilot running back to ship
  | 'takeoff'           // Ship taking off
  | 'showing_results'   // Show results and wait for tap
  | 'complete';         // Return to normal gameplay

export interface SeaMonster {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  health: number;
  maxHealth: number;
  type: 'jellyfish' | 'shark' | 'eel' | 'kraken';
  angle: number;
  frame: number;
  tentaclePhase: number;
}

export interface EnergyPod {
  id: string;
  x: number;
  y: number;
  value: number;
  collected: boolean;
  pulsePhase: number;
}

export interface Torpedo {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  timer: number;
  isPlayer: boolean;
}

export interface Bubble {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  wobble: number;
}

export interface UnderwaterExplosion {
  id: string;
  x: number;
  y: number;
  frame: number;
  maxFrames: number;
  size: number;
}

export interface Rock {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  variant: number;
}

export interface Vegetation {
  id: string;
  x: number;
  y: number;
  type: 'kelp' | 'coral' | 'anemone' | 'seagrass';
  height: number;
  phase: number;
}

export interface SplashParticle {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  size: number;
  life: number;
  maxLife: number;
}

export interface UnderwaterState {
  phase: UnderwaterPhase;
  phaseTimer: number;
  
  // Ship position (above water)
  shipX: number;
  shipY: number;
  shipAngle: number;
  shipScale: number;
  
  // Pilot position
  pilotX: number;
  pilotY: number;
  pilotFrame: number;
  pilotJumpProgress: number; // For jumping animation
  
  // Submarine gameplay
  subX: number;
  subY: number;
  subVelocityX: number;
  subVelocityY: number;
  subAngle: number;
  propellerFrame: number;
  hatchOpen: boolean; // Submarine hatch state
  
  // Enemies, pods, and combat
  monsters: SeaMonster[];
  energyPods: EnergyPod[];
  torpedoes: Torpedo[];
  bubbles: Bubble[];
  explosions: UnderwaterExplosion[];
  rocks: Rock[];
  vegetation: Vegetation[];
  splashParticles: SplashParticle[]; // Water splash effects
  
  // Collision flash effects
  collisionFlash: { x: number; y: number; timer: number }[];
  
  podsCollected: number;
  totalPods: number;
  monstersDefeated: number;
  spawnTimer: number;
  fireTimer: number;
  difficulty: number; // Difficulty scaling factor
  
  // Visual variant
  variant: number;
  waterColor: string;
  deepColor: string;
  sandColor: string;
  
  // Score and health
  bonusScore: number;
  subHealth: number;
  maxSubHealth: number;
  subDestroyed: boolean;
  
  // Sound triggers
  soundQueue: string[];
  
  // Depth
  currentDepth: number;
  maxDepth: number;
  
  // Side-scrolling
  scrollOffset: number;
  scrollSpeed: number;
  
  // Oxygen system
  oxygen: number;
  maxOxygen: number;
  isAtSurface: boolean;
  
  // Input state for results screen
  inputReleased: boolean;
}

// Different underwater visual variants
const UNDERWATER_VARIANTS = [
  { waterColor: '#0a2a4a', deepColor: '#051525', sandColor: '#8a7a5a', name: 'Ocean Blue' },
  { waterColor: '#1a3a3a', deepColor: '#0a2020', sandColor: '#6a8a6a', name: 'Alien Sea' },
  { waterColor: '#2a1a3a', deepColor: '#150a20', sandColor: '#7a6a8a', name: 'Purple Deep' },
  { waterColor: '#1a2a2a', deepColor: '#0a1515', sandColor: '#5a6a5a', name: 'Dark Waters' },
  { waterColor: '#0a3a2a', deepColor: '#051a15', sandColor: '#6a8a5a', name: 'Emerald Sea' },
];

// Audio context
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

// Underwater sounds have muffled, deeper quality
export function playUnderwaterSound(type: 'torpedo' | 'explosion' | 'hit' | 'collect' | 'engine' | 'bubble' | 'sonar' | 'monster'): void {
  try {
    const ctx = getAudioContext();
    
    // Create a lowpass filter for underwater effect
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800; // Muffled underwater sound
    filter.connect(ctx.destination);
    
    switch (type) {
      case 'torpedo': {
        // Muffled torpedo launch
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        
        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(filter);
        gain2.connect(filter);
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(400, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
        gain1.gain.setValueAtTime(0.12, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(200, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25);
        gain2.gain.setValueAtTime(0.08, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.2);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.25);
        break;
      }
        
      case 'explosion': {
        // Deep underwater explosion - more rumble
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const noise = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        const gainNoise = ctx.createGain();
        
        osc1.connect(gain1);
        osc2.connect(gain2);
        noise.connect(gainNoise);
        gain1.connect(filter);
        gain2.connect(filter);
        gainNoise.connect(filter);
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(80, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.6);
        gain1.gain.setValueAtTime(0.2, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(50, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(15, ctx.currentTime + 0.7);
        gain2.gain.setValueAtTime(0.15, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);
        
        noise.type = 'sawtooth';
        noise.frequency.setValueAtTime(40, ctx.currentTime);
        noise.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.8);
        gainNoise.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNoise.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.6);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.7);
        noise.start(ctx.currentTime);
        noise.stop(ctx.currentTime + 0.8);
        break;
      }
        
      case 'hit': {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(filter);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
        break;
      }
        
      case 'collect': {
        // Pleasant collection sound
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        
        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(ctx.destination); // Clearer sound for collect
        gain2.connect(ctx.destination);
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(400, ctx.currentTime);
        osc1.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
        osc1.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
        gain1.gain.setValueAtTime(0.1, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(500, ctx.currentTime + 0.05);
        osc2.frequency.setValueAtTime(700, ctx.currentTime + 0.15);
        gain2.gain.setValueAtTime(0.06, ctx.currentTime + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.3);
        osc2.start(ctx.currentTime + 0.05);
        osc2.stop(ctx.currentTime + 0.25);
        break;
      }
      
      case 'engine': {
        // Submarine propeller sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(filter);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(30 + Math.random() * 15, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
        break;
      }
      
      case 'bubble': {
        // Bubble pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200 + Math.random() * 400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
        break;
      }
      
      case 'sonar': {
        // Sonar ping
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
        break;
      }
      
      case 'monster': {
        // Alien creature sound
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        
        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(filter);
        gain2.connect(filter);
        
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(100, ctx.currentTime);
        osc1.frequency.setValueAtTime(150, ctx.currentTime + 0.1);
        osc1.frequency.setValueAtTime(80, ctx.currentTime + 0.2);
        gain1.gain.setValueAtTime(0.08, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(60, ctx.currentTime);
        osc2.frequency.setValueAtTime(90, ctx.currentTime + 0.15);
        gain2.gain.setValueAtTime(0.05, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.3);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.25);
        break;
      }
    }
  } catch (e) {
    // Audio context not available
  }
}

export function isUnderwaterLevel(mapId: number): boolean {
  // Underwater appears on maps 8, 14, 20, 26, etc. (every 6th map starting at 8)
  return (mapId - 8) % 6 === 0 && mapId >= 8;
}

export function createUnderwaterState(mapId: number): UnderwaterState {
  const variant = (mapId - 8) % UNDERWATER_VARIANTS.length;
  const variantData = UNDERWATER_VARIANTS[variant];
  
  // Generate initial energy pods
  const pods: EnergyPod[] = [];
  const totalPods = 8 + Math.floor(mapId / 4); // Pods required to win
  
  // Generate initial rocks
  const rocks: Rock[] = [];
  for (let i = 0; i < 15; i++) {
    rocks.push({
      id: generateId(),
      x: GAME_CONFIG.canvasWidth + i * 200 + Math.random() * 100,
      y: 100 + Math.random() * (GAME_CONFIG.canvasHeight - 180),
      width: 30 + Math.random() * 40,
      height: 25 + Math.random() * 35,
      variant: Math.floor(Math.random() * 3),
    });
  }
  
  // Generate initial vegetation
  const vegetation: Vegetation[] = [];
  const vegTypes: Vegetation['type'][] = ['kelp', 'coral', 'anemone', 'seagrass'];
  for (let i = 0; i < 25; i++) {
    vegetation.push({
      id: generateId(),
      x: GAME_CONFIG.canvasWidth + i * 120 + Math.random() * 60,
      y: GAME_CONFIG.canvasHeight - 50,
      type: vegTypes[Math.floor(Math.random() * vegTypes.length)],
      height: 30 + Math.random() * 50,
      phase: Math.random() * Math.PI * 2,
    });
  }
  
  // Calculate difficulty based on mapId (higher maps = harder)
  const difficulty = 1 + Math.floor((mapId - 8) / 6) * 0.2; // Increases every 6 maps
  
  return {
    phase: 'approaching',
    phaseTimer: 120,
    
    shipX: -100,
    shipY: GAME_CONFIG.canvasHeight * 0.3,
    shipAngle: 0,
    shipScale: 0.3,
    
    pilotX: 0,
    pilotY: 0,
    pilotFrame: 0,
    pilotJumpProgress: 0,
    
    subX: GAME_CONFIG.canvasWidth * 0.35, // Submarine position (more to the left for water scene)
    subY: 55, // At water surface
    subVelocityX: 0,
    subVelocityY: 0,
    subAngle: 0,
    propellerFrame: 0,
    hatchOpen: true, // Start with hatch open
    
    monsters: [],
    energyPods: pods,
    torpedoes: [],
    bubbles: [],
    explosions: [],
    rocks,
    vegetation,
    splashParticles: [],
    
    collisionFlash: [],
    
    podsCollected: 0,
    totalPods,
    monstersDefeated: 0,
    spawnTimer: 60,
    fireTimer: 0,
    difficulty, // Add difficulty to state
    
    variant,
    waterColor: variantData.waterColor,
    deepColor: variantData.deepColor,
    sandColor: variantData.sandColor,
    
    bonusScore: 0,
    subHealth: 100,
    maxSubHealth: 100,
    subDestroyed: false,
    
    soundQueue: [],
    
    currentDepth: 0,
    maxDepth: 250,
    
    scrollOffset: 0,
    scrollSpeed: 2,
    
    // Oxygen system
    oxygen: 100,
    maxOxygen: 100,
    isAtSurface: true,
    
    inputReleased: false,
  };
}

export function updateUnderwaterState(
  state: UnderwaterState,
  input: { touchX: number; touchY: number; isTouching: boolean; fire: boolean }
): UnderwaterState {
  const newState = { ...state, soundQueue: [] as string[], collisionFlash: state.collisionFlash.map(f => ({ ...f, timer: f.timer - 1 })).filter(f => f.timer > 0) };
  
  // Update propeller
  newState.propellerFrame = (state.propellerFrame + 0.3) % (Math.PI * 2);
  
  // Update torpedoes
  newState.torpedoes = state.torpedoes
    .map(t => ({
      ...t,
      x: t.x + t.velocityX,
      y: t.y + t.velocityY,
      timer: t.timer - 1,
    }))
    .filter(t => t.timer > 0 && t.x > -50 && t.x < GAME_CONFIG.canvasWidth + 50 &&
                 t.y > -50 && t.y < GAME_CONFIG.canvasHeight + 50);
  
  // Update explosions
  newState.explosions = state.explosions
    .map(exp => ({ ...exp, frame: exp.frame + 0.4 }))
    .filter(exp => exp.frame < exp.maxFrames);
  
  // Update bubbles
  newState.bubbles = state.bubbles
    .map(b => ({
      ...b,
      y: b.y - b.speed,
      x: b.x + Math.sin(b.wobble + b.y * 0.05) * 0.5,
    }))
    .filter(b => b.y > -20);
  
  // Random bubbles
  if (state.phase === 'exploring' && Math.random() < 0.05) {
    newState.bubbles.push({
      id: generateId(),
      x: Math.random() * GAME_CONFIG.canvasWidth,
      y: GAME_CONFIG.canvasHeight + 10,
      size: 2 + Math.random() * 4,
      speed: 0.5 + Math.random() * 1.5,
      wobble: Math.random() * Math.PI * 2,
    });
  }
  
  // Update monsters
  newState.monsters = state.monsters.map(m => ({
    ...m,
    frame: (m.frame + 0.08) % 2,
    tentaclePhase: m.tentaclePhase + 0.1,
  }));
  
  // Update energy pods pulse
  newState.energyPods = state.energyPods.map(p => ({
    ...p,
    pulsePhase: p.pulsePhase + 0.1,
  }));
  
  switch (state.phase) {
    case 'approaching':
      // Ship flies in and hovers next to submarine which is bobbing on water surface
      newState.shipX = Math.min(GAME_CONFIG.canvasWidth * 0.55, state.shipX + 5);
      newState.shipY = 45 + Math.sin(state.phaseTimer * 0.08) * 3; // Hover motion
      newState.shipScale = Math.min(1, state.shipScale + 0.005);
      newState.phaseTimer--;
      
      // Submarine bobs on water surface
      const bobPhase = Date.now() * 0.003;
      newState.subY = 50 + Math.sin(bobPhase) * 4;
      
      if (state.phaseTimer % 8 === 0) {
        newState.soundQueue.push('engine');
      }
      
      if (newState.shipX >= GAME_CONFIG.canvasWidth * 0.55) {
        newState.phase = 'landing';
        newState.phaseTimer = 60;
      }
      break;
      
    case 'landing':
      // Ship hovers in place, submarine bobs with open hatch
      const hoverY = 45 + Math.sin(state.phaseTimer * 0.1) * 2;
      newState.shipY = hoverY;
      newState.shipAngle = Math.sin(state.phaseTimer * 0.15) * 2;
      newState.phaseTimer--;
      
      // Sub continues bobbing
      const bobPhase2 = Date.now() * 0.003;
      newState.subY = 50 + Math.sin(bobPhase2) * 4;
      newState.hatchOpen = true;
      
      if (state.phaseTimer <= 0) {
        newState.phase = 'pilot_to_sub';
        newState.phaseTimer = 80;
        newState.pilotX = newState.shipX - 15;
        newState.pilotY = newState.shipY + 15;
        newState.pilotJumpProgress = 0;
        newState.shipAngle = 0;
      }
      break;
      
    case 'pilot_to_sub':
      // Pilot jumps from ship to submarine in an arc
      const jumpDuration = 80;
      newState.pilotJumpProgress = 1 - (state.phaseTimer / jumpDuration);
      newState.phaseTimer--;
      
      // Calculate arc position - from ship to sub hatch
      // Ship hovers at around y=45, pilot starts from below ship
      const startX = GAME_CONFIG.canvasWidth * 0.55;
      const startY = 55;
      
      // Sub is at waterY (0.45 * canvasHeight) + subY offset
      const waterY = GAME_CONFIG.canvasHeight * 0.45;
      const subScreenY = waterY + state.subY - 50;
      const endX = state.subX + 25; // Above hatch on conning tower
      const endY = subScreenY - 18; // Top of conning tower hatch
      
      // Parabolic arc
      const progress = newState.pilotJumpProgress;
      const arcHeight = -50; // How high the arc goes
      newState.pilotX = startX + (endX - startX) * progress;
      newState.pilotY = startY + (endY - startY) * progress + arcHeight * Math.sin(progress * Math.PI);
      
      // Animate pilot
      newState.pilotFrame = Math.floor(state.phaseTimer / 8) % 4;
      
      // Ship continues hovering
      newState.shipY = 45 + Math.sin(state.phaseTimer * 0.1) * 2;
      
      // Sub bobs
      const bobPhase3 = Date.now() * 0.003;
      newState.subY = 50 + Math.sin(bobPhase3) * 4;
      
      if (state.phaseTimer <= 0) {
        newState.phase = 'diving';
        newState.phaseTimer = 80;
        newState.hatchOpen = false; // Close hatch
        
        // Create splash particles when starting to dive
        const splashX = newState.subX + 20;
        const splashY = GAME_CONFIG.canvasHeight * 0.45; // Water surface
        for (let i = 0; i < 20; i++) {
          const angle = Math.PI + (Math.random() - 0.5) * Math.PI; // Upward arc
          const speed = 3 + Math.random() * 5;
          newState.splashParticles.push({
            id: generateId(),
            x: splashX + (Math.random() - 0.5) * 30,
            y: splashY,
            velocityX: Math.cos(angle) * speed,
            velocityY: Math.sin(angle) * speed - 2,
            size: 2 + Math.random() * 4,
            life: 40 + Math.random() * 20,
            maxLife: 60,
          });
        }
        
        // Generate pods spread out along scroll path - spawn extra pods so missing one doesn't fail the mission
        const podsToSpawn = newState.totalPods + 4; // 4 extra pods as margin
        for (let i = 0; i < podsToSpawn; i++) {
          newState.energyPods.push({
            id: generateId(),
            x: GAME_CONFIG.canvasWidth + i * 250 + Math.random() * 150,
            y: 80 + Math.random() * (GAME_CONFIG.canvasHeight - 140),
            value: 50 + Math.floor(Math.random() * 50),
            collected: false,
            pulsePhase: Math.random() * Math.PI * 2,
          });
        }
      }
      break;
      
    case 'diving':
      newState.subY = Math.min(GAME_CONFIG.canvasHeight / 2, state.subY + 2);
      newState.currentDepth = Math.min(newState.maxDepth, state.currentDepth + 3);
      newState.phaseTimer--;
      
      // Update splash particles
      newState.splashParticles = state.splashParticles
        .map(p => ({
          ...p,
          x: p.x + p.velocityX,
          y: p.y + p.velocityY,
          velocityY: p.velocityY + 0.3, // Gravity
          life: p.life - 1,
        }))
        .filter(p => p.life > 0);
      
      // Add more splash particles during early diving
      if (state.phaseTimer > 60 && state.phaseTimer % 3 === 0) {
        const splashX = newState.subX + 20;
        const splashY = GAME_CONFIG.canvasHeight * 0.45;
        for (let i = 0; i < 3; i++) {
          const angle = Math.PI + (Math.random() - 0.5) * 0.8;
          const speed = 2 + Math.random() * 3;
          newState.splashParticles.push({
            id: generateId(),
            x: splashX + (Math.random() - 0.5) * 20,
            y: splashY,
            velocityX: Math.cos(angle) * speed,
            velocityY: Math.sin(angle) * speed - 1,
            size: 2 + Math.random() * 3,
            life: 30 + Math.random() * 15,
            maxLife: 45,
          });
        }
      }
      
      // Bubbles from sub
      if (state.phaseTimer % 5 === 0) {
        newState.bubbles.push({
          id: generateId(),
          x: newState.subX + 15 + Math.random() * 5,
          y: newState.subY,
          size: 3 + Math.random() * 3,
          speed: 1 + Math.random(),
          wobble: Math.random() * Math.PI * 2,
        });
      }
      
      if (state.phaseTimer <= 0) {
        newState.phase = 'exploring';
        newState.spawnTimer = 40;
        newState.soundQueue.push('sonar');
      }
      break;
      
    case 'exploring':
      // Oxygen management - drain when underwater, refill at surface
      const waterSurfaceY = 80; // Y position of water surface during exploration
      newState.isAtSurface = newState.subY < waterSurfaceY;
      
      if (newState.isAtSurface) {
        // Refill oxygen at surface
        newState.oxygen = Math.min(newState.maxOxygen, state.oxygen + 2);
      } else {
        // Drain oxygen when underwater
        newState.oxygen = Math.max(0, state.oxygen - 0.08);
        
        // Take damage when out of oxygen
        if (newState.oxygen <= 0) {
          newState.subHealth -= 0.5;
        }
      }
      
      // Side-scrolling
      newState.scrollOffset += newState.scrollSpeed;
      
      // Scroll rocks
      newState.rocks = state.rocks.map(r => ({ ...r, x: r.x - newState.scrollSpeed }));
      // Remove off-screen rocks and spawn new ones
      newState.rocks = newState.rocks.filter(r => r.x > -100);
      if (newState.rocks.length < 15) {
        newState.rocks.push({
          id: generateId(),
          x: GAME_CONFIG.canvasWidth + 50 + Math.random() * 100,
          y: 80 + Math.random() * (GAME_CONFIG.canvasHeight - 160),
          width: 30 + Math.random() * 40,
          height: 25 + Math.random() * 35,
          variant: Math.floor(Math.random() * 3),
        });
      }
      
      // Scroll vegetation
      newState.vegetation = state.vegetation.map(v => ({ ...v, x: v.x - newState.scrollSpeed, phase: v.phase + 0.05 }));
      // Remove off-screen vegetation and spawn new ones
      newState.vegetation = newState.vegetation.filter(v => v.x > -50);
      const vegTypes: Vegetation['type'][] = ['kelp', 'coral', 'anemone', 'seagrass'];
      while (newState.vegetation.length < 25) {
        newState.vegetation.push({
          id: generateId(),
          x: GAME_CONFIG.canvasWidth + 20 + Math.random() * 60,
          y: GAME_CONFIG.canvasHeight - 50,
          type: vegTypes[Math.floor(Math.random() * vegTypes.length)],
          height: 30 + Math.random() * 50,
          phase: Math.random() * Math.PI * 2,
        });
      }
      
      // Scroll energy pods
      newState.energyPods = state.energyPods.map(p => ({ ...p, x: p.x - newState.scrollSpeed }));
      
      // Move sub based on touch (smaller sub = 20x9 instead of 40x18)
      // Sub is 150px to the right of finger
      const SUB_OFFSET_X = 150;
      const subCenterX = newState.subX + 20;
      const subCenterY = newState.subY + 9;
      
      if (input.isTouching) {
        const targetX = input.touchX + SUB_OFFSET_X;
        const dx = targetX - subCenterX;
        const dy = input.touchY - subCenterY;
        
        newState.subVelocityX += dx * 0.003;
        newState.subVelocityY += dy * 0.003;
      }
      
      // Apply friction
      newState.subVelocityX *= 0.95;
      newState.subVelocityY *= 0.95;
      
      // Clamp velocity
      newState.subVelocityX = Math.max(-4, Math.min(4, newState.subVelocityX));
      newState.subVelocityY = Math.max(-3, Math.min(3, newState.subVelocityY));
      
      // Apply velocity
      newState.subX += newState.subVelocityX;
      newState.subY += newState.subVelocityY;
      
      // Bounds (50% smaller sub)
      newState.subX = Math.max(10, Math.min(GAME_CONFIG.canvasWidth - 50, newState.subX));
      newState.subY = Math.max(60, Math.min(GAME_CONFIG.canvasHeight - 45, newState.subY));
      
      // Sub angle based on velocity
      newState.subAngle = newState.subVelocityY * 4;
      
      // Check rock collisions (smaller sub hitbox)
      for (const rock of newState.rocks) {
        const subLeft = newState.subX + 5;
        const subRight = newState.subX + 40;
        const subTop = newState.subY;
        const subBottom = newState.subY + 18;
        
        const rockLeft = rock.x;
        const rockRight = rock.x + rock.width;
        const rockTop = rock.y;
        const rockBottom = rock.y + rock.height;
        
        if (subRight > rockLeft && subLeft < rockRight && subBottom > rockTop && subTop < rockBottom) {
          newState.subHealth -= 8;
          newState.soundQueue.push('hit');
          // Add collision flash effect
          newState.collisionFlash.push({
            x: (subLeft + subRight) / 2,
            y: (subTop + subBottom) / 2,
            timer: 12,
          });
          // Push sub away from rock
          const pushX = subCenterX - (rock.x + rock.width / 2);
          const pushY = subCenterY - (rock.y + rock.height / 2);
          const pushDist = Math.sqrt(pushX * pushX + pushY * pushY) || 1;
          newState.subVelocityX = (pushX / pushDist) * 3;
          newState.subVelocityY = (pushY / pushDist) * 3;
        }
      }
      
      // Engine sound
      if (Math.abs(newState.subVelocityX) > 0.5 || Math.abs(newState.subVelocityY) > 0.5) {
        if (state.phaseTimer % 8 === 0) {
          newState.soundQueue.push('engine');
        }
        // Bubbles from propeller
        if (state.phaseTimer % 6 === 0) {
          newState.bubbles.push({
            id: generateId(),
            x: newState.subX - 3,
            y: newState.subY + 9 + Math.random() * 5,
            size: 2 + Math.random() * 2,
            speed: 0.5 + Math.random() * 0.5,
            wobble: Math.random() * Math.PI * 2,
          });
        }
      }
      
      // Fire torpedo - faster rate for better gameplay
      if (newState.fireTimer > 0) newState.fireTimer--;
      
      if ((input.isTouching || input.fire) && newState.fireTimer <= 0) {
        newState.fireTimer = 18; // Faster fire rate (was 25)
        newState.soundQueue.push('torpedo');
        
        // Fire forward (side-scrolling style)
        newState.torpedoes.push({
          id: generateId(),
          x: newState.subX + 45,
          y: newState.subY + 9,
          velocityX: 10, // Faster torpedo
          velocityY: newState.subVelocityY * 0.3, // Slight vertical aim
          timer: 90,
          isPlayer: true,
        });
      }
      
      // Check torpedo-monster collisions
      newState.torpedoes = newState.torpedoes.filter(torpedo => {
        if (!torpedo.isPlayer) return true;
        
        for (const monster of newState.monsters) {
          const dx = monster.x - torpedo.x;
          const dy = monster.y - torpedo.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < monster.size + 10) {
            monster.health -= 30;
            newState.soundQueue.push('hit');
            
            if (monster.health <= 0) {
              newState.monstersDefeated++;
              newState.soundQueue.push('explosion');
              newState.explosions.push({
                id: generateId(),
                x: monster.x,
                y: monster.y,
                frame: 0,
                maxFrames: 18,
                size: monster.size * 2,
              });
              const scoreMap = { kraken: 150, shark: 80, eel: 50, jellyfish: 30 };
              newState.bonusScore += scoreMap[monster.type] || 30;
            }
            return false;
          }
        }
        return true;
      });
      
      // Remove dead monsters
      newState.monsters = newState.monsters.filter(m => m.health > 0);
      
      // Collect energy pods (smaller collection radius for smaller sub)
      newState.energyPods = newState.energyPods.map(pod => {
        if (pod.collected) return pod;
        
        const dx = subCenterX - pod.x;
        const dy = subCenterY - pod.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 25) {
          newState.podsCollected++;
          newState.bonusScore += pod.value;
          newState.soundQueue.push('collect');
          return { ...pod, collected: true };
        }
        return pod;
      });
      
      // Update monsters (with side-scrolling offset and smaller sub center)
      newState.monsters = newState.monsters.map(monster => {
        const newMonster = { ...monster };
        // Apply scroll to all monsters
        newMonster.x -= newState.scrollSpeed;
        
        switch (monster.type) {
          case 'jellyfish':
            newMonster.y += Math.sin(monster.tentaclePhase) * 0.8;
            newMonster.x -= 0.3;
            break;
          case 'shark':
            // Chase player (smaller sub center)
            const sdx = subCenterX - monster.x;
            const sdy = subCenterY - monster.y;
            const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
            if (sdist > 40) {
              newMonster.x += (sdx / sdist) * monster.speed;
              newMonster.y += (sdy / sdist) * monster.speed;
            }
            newMonster.angle = Math.atan2(sdy, sdx);
            break;
          case 'eel':
            newMonster.x += Math.cos(monster.tentaclePhase) * 1.5;
            newMonster.y += Math.sin(monster.tentaclePhase * 2) * 1;
            break;
          case 'kraken':
            // Slowly approach
            const kdx = subCenterX - monster.x;
            const kdy = subCenterY - monster.y;
            const kdist = Math.sqrt(kdx * kdx + kdy * kdy);
            newMonster.x += (kdx / kdist) * 0.4;
            newMonster.y += (kdy / kdist) * 0.25;
            
            // Shoot ink (projectile)
            if (Math.random() < 0.005) {
              newState.torpedoes.push({
                id: generateId(),
                x: monster.x,
                y: monster.y,
                velocityX: (kdx / kdist) * 3,
                velocityY: (kdy / kdist) * 3,
                timer: 60,
                isPlayer: false,
              });
              newState.soundQueue.push('monster');
            }
            break;
        }
        
        return newMonster;
      });
      
      // Remove off-screen monsters
      newState.monsters = newState.monsters.filter(m => 
        m.x > -80 && m.x < GAME_CONFIG.canvasWidth + 80 &&
        m.y > -80 && m.y < GAME_CONFIG.canvasHeight + 80
      );
      
      // Check monster collision with sub (smaller hitbox)
      for (const monster of newState.monsters) {
        const dx = subCenterX - monster.x;
        const dy = subCenterY - monster.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < monster.size + 15) {
          newState.subHealth -= monster.type === 'kraken' ? 20 : monster.type === 'shark' ? 15 : 8;
          newState.soundQueue.push('hit');
          // Push sub away
          newState.subVelocityX += dx * 0.1;
          newState.subVelocityY += dy * 0.1;
        }
      }
      
      // Check enemy projectile collision (smaller hitbox)
      newState.torpedoes = newState.torpedoes.filter(t => {
        if (t.isPlayer) return true;
        
        const dx = subCenterX - t.x;
        const dy = subCenterY - t.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 20) {
          newState.subHealth -= 12;
          newState.soundQueue.push('hit');
          return false;
        }
        return true;
      });
      
      // Spawn monsters from right side - balanced spawn rate
      newState.spawnTimer--;
      if (newState.spawnTimer <= 0 && !newState.subDestroyed) {
        if (newState.monsters.length < 3) { // Max 3 monsters at a time for balance
          const monster = createSeaMonster(state.difficulty);
          monster.x = GAME_CONFIG.canvasWidth + 50;
          monster.y = 80 + Math.random() * (GAME_CONFIG.canvasHeight - 160);
          newState.monsters.push(monster);
          newState.spawnTimer = 80 + Math.random() * 60; // Slower spawn (was 60 + 50)
          if (Math.random() < 0.3) newState.soundQueue.push('monster');
        }
      }
      
      // Continuously spawn new pods so player can always win if they survive
      const uncollectedPods = newState.energyPods.filter(p => !p.collected && p.x > -50).length;
      if (uncollectedPods < 5 && !newState.subDestroyed) {
        // Spawn a new pod to the right
        newState.energyPods.push({
          id: generateId(),
          x: GAME_CONFIG.canvasWidth + 50 + Math.random() * 100,
          y: 80 + Math.random() * (GAME_CONFIG.canvasHeight - 140),
          value: 50 + Math.floor(Math.random() * 50),
          collected: false,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
      
      // Check sub destroyed
      if (newState.subHealth <= 0) {
        newState.subDestroyed = true;
        newState.subHealth = 0;
      }
      
      newState.phaseTimer++;
      
      // Sonar ping periodically
      if (newState.phaseTimer % 180 === 0) {
        newState.soundQueue.push('sonar');
      }
      
      // Check completion (all pods collected)
      if (newState.podsCollected >= newState.totalPods && !newState.subDestroyed) {
        newState.phase = 'ascending';
        newState.phaseTimer = 60;
      }
      break;
      
    case 'ascending':
      newState.subY = Math.max(80, state.subY - 2);
      newState.currentDepth = Math.max(0, state.currentDepth - 4);
      newState.phaseTimer--;
      
      if (state.phaseTimer % 5 === 0) {
        newState.bubbles.push({
          id: generateId(),
          x: newState.subX + 30 + Math.random() * 10,
          y: newState.subY + 30,
          size: 4 + Math.random() * 3,
          speed: 1.5 + Math.random(),
          wobble: Math.random() * Math.PI * 2,
        });
      }
      
      if (state.phaseTimer <= 0 && newState.currentDepth <= 0) {
        newState.phase = 'pilot_to_ship';
        newState.phaseTimer = 50;
        newState.pilotX = newState.subX + 35;
        newState.pilotY = 70;
      }
      break;
      
    case 'pilot_to_ship':
      newState.pilotX = state.pilotX + 4;
      newState.pilotFrame = Math.floor(state.phaseTimer / 5) % 4;
      newState.phaseTimer--;
      
      if (newState.pilotX >= newState.shipX - 25) {
        newState.phase = 'takeoff';
        newState.phaseTimer = 90;
      }
      break;
      
    case 'takeoff':
      newState.shipY = state.shipY - 3;
      newState.shipX = state.shipX + 4;
      newState.shipAngle = -8;
      newState.phaseTimer--;
      
      if (state.phaseTimer % 6 === 0) {
        newState.soundQueue.push('engine');
      }
      
      if (state.phaseTimer <= 0) {
        newState.phase = 'showing_results';
        newState.phaseTimer = 120; // 2 second lock so results can be seen
        newState.inputReleased = false; // Reset input released state
      }
      break;
      
    case 'showing_results':
      // Wait for input lock, then require release before accepting new tap
      if (newState.phaseTimer > 0) {
        newState.phaseTimer--;
      } else {
        // Track if input was released
        if (!input.isTouching) {
          newState.inputReleased = true;
        }
        // Only accept input after it was released (fresh tap)
        if (newState.inputReleased && input.isTouching) {
          newState.phase = 'complete';
        }
      }
      break;
  }
  
  // Play sounds
  newState.soundQueue.forEach(sound => {
    playUnderwaterSound(sound as any);
  });
  
  return newState;
}

function createSeaMonster(difficulty: number = 1): SeaMonster {
  const typeRoll = Math.random();
  const type: SeaMonster['type'] = typeRoll < 0.35 ? 'jellyfish' : typeRoll < 0.6 ? 'eel' : typeRoll < 0.85 ? 'shark' : 'kraken';
  
  const healthMap = { jellyfish: 30, eel: 50, shark: 70, kraken: 120 };
  const speedMap = { jellyfish: 0.5, eel: 2, shark: 1.5, kraken: 0.8 };
  const sizeMap = { jellyfish: 20, eel: 25, shark: 30, kraken: 45 };
  
  const side = Math.random();
  let x: number, y: number;
  
  if (side < 0.4) {
    x = GAME_CONFIG.canvasWidth + 40;
    y = 100 + Math.random() * (GAME_CONFIG.canvasHeight - 150);
  } else if (side < 0.7) {
    x = -40;
    y = 100 + Math.random() * (GAME_CONFIG.canvasHeight - 150);
  } else {
    x = Math.random() * GAME_CONFIG.canvasWidth;
    y = GAME_CONFIG.canvasHeight + 30;
  }
  
  // Scale stats with difficulty
  const scaledHealth = Math.floor(healthMap[type] * difficulty);
  const scaledSpeed = speedMap[type] * (0.8 + difficulty * 0.2); // Slight speed increase
  
  return {
    id: generateId(),
    x,
    y,
    size: sizeMap[type],
    speed: scaledSpeed,
    health: scaledHealth,
    maxHealth: scaledHealth,
    type,
    angle: 0,
    frame: 0,
    tentaclePhase: Math.random() * Math.PI * 2,
  };
}

export function renderUnderwaterScene(ctx: CanvasRenderingContext2D, state: UnderwaterState): void {
  const { canvasWidth, canvasHeight } = GAME_CONFIG;
  
  if (state.phase === 'approaching' || state.phase === 'landing' || 
      state.phase === 'pilot_to_sub' || state.phase === 'pilot_to_ship' || state.phase === 'takeoff') {
    // Above water scene
    renderAboveWater(ctx, state);
  } else {
    // Underwater scene
    renderUnderwaterBackground(ctx, state);
    
    // Vegetation (behind everything)
    state.vegetation.forEach(v => renderVegetation(ctx, v));
    
    // Rocks (obstacles)
    state.rocks.forEach(r => renderRock(ctx, r));
    
    // Energy pods
    state.energyPods.filter(p => !p.collected).forEach(pod => renderEnergyPod(ctx, pod));
    
    // Monsters
    state.monsters.forEach(monster => renderSeaMonster(ctx, monster));
    
    // Torpedoes
    state.torpedoes.forEach(t => renderTorpedo(ctx, t, state));
    
    // Submarine
    renderSubmarine(ctx, state);
    
    // Bubbles (in front)
    state.bubbles.forEach(b => renderBubble(ctx, b));
    
    // Explosions
    state.explosions.forEach(exp => renderUnderwaterExplosion(ctx, exp));
    
    // Collision flash effects
    state.collisionFlash.forEach(flash => {
      const alpha = flash.timer / 12;
      const size = (12 - flash.timer) * 4 + 15;
      
      ctx.save();
      ctx.strokeStyle = `rgba(255, 100, 50, ${alpha * 0.8})`;
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ff6644';
      ctx.shadowBlur = 15 * alpha;
      ctx.beginPath();
      ctx.arc(flash.x, flash.y, size, 0, Math.PI * 2);
      ctx.stroke();
      
      const innerGrad = ctx.createRadialGradient(flash.x, flash.y, 0, flash.x, flash.y, size * 0.5);
      innerGrad.addColorStop(0, `rgba(255, 200, 100, ${alpha * 0.5})`);
      innerGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.arc(flash.x, flash.y, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    
    // Depth overlay
    renderDepthOverlay(ctx, state);
    
    // HUD
    renderUnderwaterHUD(ctx, state);
  }
  
  // Scanlines
  renderUnderwaterScanlines(ctx);
  
  // UI
  renderUnderwaterUI(ctx, state);
}

function renderAboveWater(ctx: CanvasRenderingContext2D, state: UnderwaterState): void {
  const { canvasWidth, canvasHeight } = GAME_CONFIG;
  
  // Sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight * 0.5);
  skyGrad.addColorStop(0, '#1a1a3a');
  skyGrad.addColorStop(1, '#3a4a6a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight * 0.5);
  
  // Stars
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 40; i++) {
    const x = (i * 97 + state.variant * 50) % canvasWidth;
    const y = (i * 63) % (canvasHeight * 0.4);
    ctx.globalAlpha = 0.3 + Math.sin(Date.now() * 0.002 + i) * 0.3;
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.globalAlpha = 1;
  
  // Water surface
  const waterY = canvasHeight * 0.45;
  const waterGrad = ctx.createLinearGradient(0, waterY, 0, canvasHeight);
  waterGrad.addColorStop(0, state.waterColor);
  waterGrad.addColorStop(1, state.deepColor);
  ctx.fillStyle = waterGrad;
  ctx.fillRect(0, waterY, canvasWidth, canvasHeight - waterY);
  
  // Water surface waves
  ctx.strokeStyle = 'rgba(100, 150, 200, 0.5)';
  ctx.lineWidth = 2;
  const time = Date.now() * 0.002;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    for (let x = 0; x <= canvasWidth; x += 10) {
      const y = waterY + i * 8 + Math.sin(x * 0.02 + time + i) * 3;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  
  // Shore/dock removed - submarine now in water
  
  // Render submarine bobbing on water surface during intro phases
  if (state.phase === 'approaching' || state.phase === 'landing' || state.phase === 'pilot_to_sub') {
    renderSurfaceSubmarine(ctx, state);
  }
  
  // Ship always visible during intro (hovers while pilot jumps)
  if (state.phase === 'approaching' || state.phase === 'landing' || state.phase === 'pilot_to_sub') {
    renderUnderwaterShip(ctx, state);
  }
  
  // Pilot jumping
  if (state.phase === 'pilot_to_sub') {
    renderUnderwaterPilot(ctx, state);
  }
  
  // Render splash particles
  renderSplashParticles(ctx, state);
  
  // Pilot returning to ship
  if (state.phase === 'pilot_to_ship') {
    renderUnderwaterPilot(ctx, state);
    renderUnderwaterShip(ctx, state);
  }
}

function renderSplashParticles(ctx: CanvasRenderingContext2D, state: UnderwaterState): void {
  for (const splash of state.splashParticles) {
    const alpha = splash.life / splash.maxLife;
    
    // Water droplet
    ctx.save();
    ctx.globalAlpha = alpha;
    
    // Main droplet
    const gradient = ctx.createRadialGradient(splash.x, splash.y, 0, splash.x, splash.y, splash.size);
    gradient.addColorStop(0, 'rgba(150, 200, 255, 0.9)');
    gradient.addColorStop(0.5, 'rgba(100, 150, 200, 0.7)');
    gradient.addColorStop(1, 'rgba(50, 100, 150, 0.3)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(splash.x, splash.y, splash.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(splash.x - splash.size * 0.3, splash.y - splash.size * 0.3, splash.size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
}

function renderSurfaceSubmarine(ctx: CanvasRenderingContext2D, state: UnderwaterState): void {
  const { canvasHeight } = GAME_CONFIG;
  const waterY = canvasHeight * 0.45;
  
  // Position submarine at water surface with bobbing
  const x = state.subX;
  const y = waterY + state.subY - 50; // Adjust so sub sits at water line
  
  ctx.save();
  ctx.translate(x, y);
  
  // Main body - yellow submarine
  const bodyGrad = ctx.createLinearGradient(0, -10, 0, 25);
  bodyGrad.addColorStop(0, '#ffcc00');
  bodyGrad.addColorStop(0.5, '#ffaa00');
  bodyGrad.addColorStop(1, '#cc8800');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(25, 10, 35, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Conning tower (sail)
  ctx.fillStyle = '#dd9900';
  ctx.beginPath();
  ctx.moveTo(15, -4);
  ctx.lineTo(35, -4);
  ctx.lineTo(33, -18);
  ctx.lineTo(17, -18);
  ctx.closePath();
  ctx.fill();
  
  // Hatch on conning tower
  if (state.hatchOpen) {
    // Open hatch - lid tilted back
    ctx.fillStyle = '#bb8800';
    ctx.beginPath();
    ctx.ellipse(25, -18, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Hatch lid (open, tilted back)
    ctx.fillStyle = '#aa7700';
    ctx.save();
    ctx.translate(25, -18);
    ctx.rotate(-0.8);
    ctx.beginPath();
    ctx.ellipse(0, -5, 5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Interior glow
    ctx.fillStyle = 'rgba(255, 200, 100, 0.5)';
    ctx.beginPath();
    ctx.ellipse(25, -17, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Closed hatch
    ctx.fillStyle = '#aa7700';
    ctx.beginPath();
    ctx.ellipse(25, -18, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#996600';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  // Periscope
  ctx.fillStyle = '#888';
  ctx.fillRect(30, -30, 3, 12);
  ctx.fillStyle = '#666';
  ctx.fillRect(29, -32, 5, 4);
  
  // Portholes
  for (let i = 0; i < 3; i++) {
    const px = 10 + i * 15;
    ctx.fillStyle = '#aaddff';
    ctx.beginPath();
    ctx.arc(px, 10, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#bb9900';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  // Propeller at back
  ctx.fillStyle = '#666';
  ctx.beginPath();
  ctx.moveTo(-12, 5);
  ctx.lineTo(-18, -5);
  ctx.lineTo(-15, 5);
  ctx.lineTo(-18, 15);
  ctx.closePath();
  ctx.fill();
  
  // Water ripples around sub
  ctx.strokeStyle = 'rgba(150, 200, 255, 0.4)';
  ctx.lineWidth = 1;
  const time = Date.now() * 0.003;
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    ctx.ellipse(25, 15 + i * 5, 40 + i * 10 + Math.sin(time) * 3, 5 + i * 2, 0, 0, Math.PI);
    ctx.stroke();
  }
  
  ctx.restore();
}

function renderUnderwaterShip(ctx: CanvasRenderingContext2D, state: UnderwaterState): void {
  ctx.save();
  ctx.translate(state.shipX, state.shipY);
  ctx.rotate((state.shipAngle * Math.PI) / 180);
  ctx.scale(state.shipScale, state.shipScale);
  
  
  // Draw the selected mega ship
  const megaShipId = getStoredMegaShipId();
  const time = Date.now() * 0.003;
  drawMegaShip(ctx, 0, 0, megaShipId, time);
  
  ctx.restore();
}

function renderUnderwaterPilot(ctx: CanvasRenderingContext2D, state: UnderwaterState): void {
  const x = state.pilotX;
  const y = state.pilotY;
  const frame = state.pilotFrame;
  
  const legOffset = Math.sin(frame * Math.PI / 2) * 5;
  const armOffset = Math.cos(frame * Math.PI / 2) * 4;
  const bodyBob = Math.abs(Math.sin(frame * Math.PI / 2)) * 2;
  const dir = state.phase === 'pilot_to_sub' ? -1 : 1;
  
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

function renderUnderwaterBackground(ctx: CanvasRenderingContext2D, state: UnderwaterState): void {
  const { canvasWidth, canvasHeight } = GAME_CONFIG;
  
  // Water gradient
  const waterGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  waterGrad.addColorStop(0, state.waterColor);
  waterGrad.addColorStop(0.5, state.deepColor);
  waterGrad.addColorStop(1, '#000510');
  ctx.fillStyle = waterGrad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // Light rays from surface (with parallax scroll)
  ctx.save();
  const time = Date.now() * 0.0005;
  for (let i = 0; i < 6; i++) {
    const baseX = i * 150 + state.variant * 40;
    const x = ((baseX - state.scrollOffset * 0.3) % (canvasWidth + 100) + canvasWidth + 100) % (canvasWidth + 100) - 50;
    const rayGrad = ctx.createLinearGradient(x, 0, x + 80, canvasHeight);
    rayGrad.addColorStop(0, 'rgba(100, 200, 255, 0.15)');
    rayGrad.addColorStop(0.5, 'rgba(100, 200, 255, 0.05)');
    rayGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = rayGrad;
    
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 60, 0);
    ctx.lineTo(x + 120, canvasHeight);
    ctx.lineTo(x + 40, canvasHeight);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  
  // Seabed
  const seabedY = canvasHeight - 50;
  const seabedGrad = ctx.createLinearGradient(0, seabedY, 0, canvasHeight);
  seabedGrad.addColorStop(0, state.sandColor);
  seabedGrad.addColorStop(1, '#000');
  ctx.fillStyle = seabedGrad;
  ctx.fillRect(0, seabedY, canvasWidth, 50);
}

function renderVegetation(ctx: CanvasRenderingContext2D, veg: Vegetation): void {
  const { canvasHeight } = GAME_CONFIG;
  const seabedY = canvasHeight - 50;
  const waveOffset = Math.sin(veg.phase) * 8;
  
  ctx.save();
  ctx.translate(veg.x, veg.y);
  
  switch (veg.type) {
    case 'kelp':
      // Tall swaying kelp
      ctx.strokeStyle = '#2a6a3a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(waveOffset, -veg.height * 0.5, waveOffset * 0.7, -veg.height);
      ctx.stroke();
      // Leaves
      for (let i = 1; i <= 3; i++) {
        const ly = -veg.height * (i * 0.25);
        ctx.fillStyle = '#3a8a4a';
        ctx.beginPath();
        ctx.ellipse(waveOffset * (1 - i * 0.2) + 8, ly, 12, 4, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
      
    case 'coral':
      // Branching coral
      ctx.fillStyle = '#cc5566';
      for (let i = 0; i < 5; i++) {
        const angle = (i - 2) * 0.3;
        const len = veg.height * (0.6 + Math.random() * 0.4);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.sin(angle) * len * 0.5, -len * 0.5);
        ctx.lineTo(Math.sin(angle) * len, -len);
        ctx.lineTo(Math.sin(angle) * len + 5, -len);
        ctx.lineTo(Math.sin(angle) * len * 0.5 + 5, -len * 0.5);
        ctx.lineTo(5, 0);
        ctx.closePath();
        ctx.fill();
      }
      // Coral tips
      ctx.fillStyle = '#ff8899';
      for (let i = 0; i < 5; i++) {
        const angle = (i - 2) * 0.3;
        const len = veg.height * (0.6 + (i % 3) * 0.15);
        ctx.beginPath();
        ctx.arc(Math.sin(angle) * len + 2, -len, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
      
    case 'anemone':
      // Sea anemone with waving tentacles
      ctx.fillStyle = '#8844aa';
      ctx.beginPath();
      ctx.ellipse(0, 0, 15, 8, 0, Math.PI, 0);
      ctx.fill();
      // Tentacles
      for (let i = 0; i < 12; i++) {
        const tx = (i - 6) * 2.5;
        const tentacleWave = Math.sin(veg.phase + i * 0.5) * 5;
        ctx.strokeStyle = '#aa66cc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tx, -5);
        ctx.quadraticCurveTo(tx + tentacleWave, -veg.height * 0.5, tx + tentacleWave * 1.5, -veg.height * 0.7);
        ctx.stroke();
      }
      break;
      
    case 'seagrass':
      // Simple swaying grass
      for (let i = 0; i < 5; i++) {
        const gx = (i - 2) * 4;
        const grassWave = Math.sin(veg.phase + i * 0.3) * 6;
        ctx.strokeStyle = i % 2 === 0 ? '#3a7a4a' : '#4a8a5a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.quadraticCurveTo(gx + grassWave, -veg.height * 0.6, gx + grassWave * 0.8, -veg.height);
        ctx.stroke();
      }
      break;
  }
  
  ctx.restore();
}

function renderRock(ctx: CanvasRenderingContext2D, rock: Rock): void {
  ctx.save();
  ctx.translate(rock.x, rock.y);
  
  // Rock shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.beginPath();
  ctx.ellipse(rock.width / 2 + 5, rock.height + 5, rock.width / 2, rock.height / 4, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Rock body with gradient
  const rockGrad = ctx.createLinearGradient(0, 0, rock.width, rock.height);
  const colors = [
    ['#4a4a5a', '#3a3a4a', '#2a2a3a'],
    ['#5a5a6a', '#4a4a5a', '#3a3a4a'],
    ['#3a4a4a', '#2a3a3a', '#1a2a2a'],
  ];
  const c = colors[rock.variant];
  rockGrad.addColorStop(0, c[0]);
  rockGrad.addColorStop(0.5, c[1]);
  rockGrad.addColorStop(1, c[2]);
  ctx.fillStyle = rockGrad;
  
  // Irregular rock shape
  ctx.beginPath();
  ctx.moveTo(rock.width * 0.1, rock.height);
  ctx.lineTo(0, rock.height * 0.6);
  ctx.lineTo(rock.width * 0.15, rock.height * 0.2);
  ctx.lineTo(rock.width * 0.4, 0);
  ctx.lineTo(rock.width * 0.7, rock.height * 0.1);
  ctx.lineTo(rock.width, rock.height * 0.5);
  ctx.lineTo(rock.width * 0.9, rock.height);
  ctx.closePath();
  ctx.fill();
  
  // Rock highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(rock.width * 0.2, rock.height * 0.3);
  ctx.lineTo(rock.width * 0.5, rock.height * 0.1);
  ctx.stroke();
  
  // Moss/algae patches
  ctx.fillStyle = 'rgba(50, 100, 50, 0.4)';
  ctx.beginPath();
  ctx.ellipse(rock.width * 0.3, rock.height * 0.7, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function renderSubmarine(ctx: CanvasRenderingContext2D, state: UnderwaterState): void {
  const x = state.subX;
  const y = state.subY;
  const time = Date.now() * 0.001;
  
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(state.subAngle * Math.PI / 180);
  
  // Scale to 50% size
  ctx.scale(0.5, 0.5);
  
  // Enhanced outer glow - pulsing energy field
  const pulseIntensity = 0.15 + Math.sin(time * 3) * 0.1;
  const outerGlow = ctx.createRadialGradient(40, 18, 30, 40, 18, 80);
  outerGlow.addColorStop(0, `rgba(0, 200, 255, ${pulseIntensity})`);
  outerGlow.addColorStop(0.5, `rgba(0, 150, 255, ${pulseIntensity * 0.5})`);
  outerGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(40, 18, 80, 0, Math.PI * 2);
  ctx.fill();
  
  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(40, 55, 45, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Main hull - yellow submarine (matching surface version)
  const hullGrad = ctx.createLinearGradient(0, 0, 0, 40);
  hullGrad.addColorStop(0, '#ffcc00');
  hullGrad.addColorStop(0.3, '#ffaa00');
  hullGrad.addColorStop(0.7, '#dd9900');
  hullGrad.addColorStop(1, '#cc8800');
  ctx.fillStyle = hullGrad;
  
  // Streamlined hull shape
  ctx.beginPath();
  ctx.moveTo(85, 18);
  ctx.bezierCurveTo(85, 8, 70, 2, 50, 2);
  ctx.bezierCurveTo(30, 2, 10, 8, -5, 18);
  ctx.bezierCurveTo(10, 28, 30, 34, 50, 34);
  ctx.bezierCurveTo(70, 34, 85, 28, 85, 18);
  ctx.fill();
  
  // Hull panel lines
  ctx.strokeStyle = 'rgba(139, 90, 0, 0.4)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const px = 15 + i * 18;
    ctx.beginPath();
    ctx.moveTo(px, 6);
    ctx.lineTo(px, 30);
    ctx.stroke();
  }
  
  // Glowing trim line
  ctx.strokeStyle = `rgba(255, 200, 50, ${0.5 + Math.sin(time * 4) * 0.3})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(10, 18);
  ctx.lineTo(75, 18);
  ctx.stroke();
  
  // Advanced conning tower - yellow
  const towerGrad = ctx.createLinearGradient(28, -15, 54, 20);
  towerGrad.addColorStop(0, '#ffdd00');
  towerGrad.addColorStop(0.5, '#dd9900');
  towerGrad.addColorStop(1, '#bb7700');
  ctx.fillStyle = towerGrad;
  ctx.beginPath();
  ctx.moveTo(32, 5);
  ctx.lineTo(28, -8);
  ctx.bezierCurveTo(30, -15, 52, -15, 54, -8);
  ctx.lineTo(50, 5);
  ctx.closePath();
  ctx.fill();
  
  // Tower window
  ctx.fillStyle = `rgba(200, 230, 255, ${0.7 + Math.sin(time * 5) * 0.2})`;
  ctx.beginPath();
  ctx.ellipse(41, -5, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#bb9900';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Antenna array
  ctx.strokeStyle = '#88aacc';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(41, -15);
  ctx.lineTo(41, -28);
  ctx.stroke();
  
  // Antenna tip glow
  ctx.fillStyle = `rgba(255, 100, 100, ${0.5 + Math.sin(time * 8) * 0.5})`;
  ctx.beginPath();
  ctx.arc(41, -30, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Side fins
  ctx.fillStyle = '#cc8800';
  ctx.beginPath();
  ctx.moveTo(20, 8);
  ctx.lineTo(10, -5);
  ctx.lineTo(15, 8);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(20, 28);
  ctx.lineTo(10, 41);
  ctx.lineTo(15, 28);
  ctx.fill();
  
  // Rear stabilizer
  ctx.fillStyle = '#bb7700';
  ctx.beginPath();
  ctx.moveTo(-2, 10);
  ctx.lineTo(-12, 5);
  ctx.lineTo(-12, 31);
  ctx.lineTo(-2, 26);
  ctx.closePath();
  ctx.fill();
  
  // Portholes - brass/bronze style matching yellow submarine
  for (let i = 0; i < 3; i++) {
    const px = 30 + i * 18;
    const glowIntensity = 0.6 + Math.sin(time * 3 + i) * 0.3;
    
    // Outer ring - brass
    ctx.strokeStyle = `rgba(180, 140, 60, ${glowIntensity + 0.4})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(px, 18, 7, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner glass
    const portGlow = ctx.createRadialGradient(px, 18, 0, px, 18, 6);
    portGlow.addColorStop(0, `rgba(200, 230, 255, ${glowIntensity * 0.9})`);
    portGlow.addColorStop(0.7, `rgba(150, 200, 230, ${glowIntensity * 0.6})`);
    portGlow.addColorStop(1, `rgba(100, 150, 180, ${glowIntensity * 0.3})`);
    ctx.fillStyle = portGlow;
    ctx.beginPath();
    ctx.arc(px, 18, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Propulsion system - brass
  ctx.fillStyle = '#996600';
  ctx.beginPath();
  ctx.ellipse(-8, 18, 8, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Propeller blades - brass
  ctx.fillStyle = '#aa7700';
  ctx.save();
  ctx.translate(-8, 18);
  ctx.rotate(state.propellerFrame * 2);
  for (let i = 0; i < 6; i++) {
    ctx.rotate(Math.PI / 3);
    ctx.fillRect(-1, 0, 3, 12);
  }
  ctx.restore();
  
  // Engine thrust - subtle warm glow
  const thrustIntensity = 0.3 + Math.sin(time * 10) * 0.15;
  const thrustGlow = ctx.createRadialGradient(-15, 18, 0, -15, 18, 20);
  thrustGlow.addColorStop(0, `rgba(255, 200, 100, ${thrustIntensity})`);
  thrustGlow.addColorStop(0.5, `rgba(200, 150, 80, ${thrustIntensity * 0.5})`);
  thrustGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = thrustGlow;
  ctx.beginPath();
  ctx.arc(-15, 18, 20, 0, Math.PI * 2);
  ctx.fill();
  
  // Torpedo launcher - front mounted brass
  ctx.fillStyle = '#aa7700';
  ctx.fillRect(78, 12, 12, 12);
  
  // Launcher glow when ready
  const launcherReady = state.fireTimer <= 20;
  if (launcherReady) {
    ctx.fillStyle = `rgba(255, 100, 0, ${0.5 + Math.sin(time * 8) * 0.3})`;
  } else {
    ctx.fillStyle = '#002233';
  }
  ctx.fillRect(85, 15, 6, 6);
  
  // Hull highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, 6);
  ctx.bezierCurveTo(40, 4, 60, 4, 75, 8);
  ctx.stroke();
  
  ctx.restore();
}

function renderEnergyPod(ctx: CanvasRenderingContext2D, pod: EnergyPod): void {
  const pulse = Math.sin(pod.pulsePhase) * 0.3 + 0.7;
  
  ctx.save();
  ctx.translate(pod.x, pod.y);
  
  // Outer glow
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
  glow.addColorStop(0, `rgba(0, 255, 200, ${0.5 * pulse})`);
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 25, 0, Math.PI * 2);
  ctx.fill();
  
  // Core
  ctx.fillStyle = `rgba(0, 255, 200, ${pulse})`;
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner bright
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-2, -2, 4, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function renderSeaMonster(ctx: CanvasRenderingContext2D, monster: SeaMonster): void {
  const frame = Math.floor(monster.frame) % 2;
  const time = Date.now() * 0.001;
  
  ctx.save();
  ctx.translate(monster.x, monster.y);
  
  switch (monster.type) {
    case 'jellyfish':
      // Enhanced bioluminescent glow
      const jellGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, monster.size * 2);
      const jellPulse = 0.3 + Math.sin(time * 2 + monster.tentaclePhase) * 0.2;
      jellGlow.addColorStop(0, `rgba(255, 100, 255, ${jellPulse})`);
      jellGlow.addColorStop(0.3, `rgba(180, 80, 255, ${jellPulse * 0.7})`);
      jellGlow.addColorStop(0.6, `rgba(100, 50, 200, ${jellPulse * 0.3})`);
      jellGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = jellGlow;
      ctx.beginPath();
      ctx.arc(0, 0, monster.size * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Bell with gradient
      const bellGrad = ctx.createRadialGradient(0, -monster.size * 0.2, 0, 0, 0, monster.size);
      bellGrad.addColorStop(0, 'rgba(255, 200, 255, 0.9)');
      bellGrad.addColorStop(0.5, 'rgba(200, 100, 255, 0.8)');
      bellGrad.addColorStop(1, 'rgba(150, 50, 200, 0.6)');
      ctx.fillStyle = bellGrad;
      ctx.beginPath();
      ctx.arc(0, 0, monster.size, Math.PI, 0);
      ctx.fill();
      
      // Bell membrane pattern
      ctx.strokeStyle = 'rgba(255, 150, 255, 0.4)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const r = monster.size * (0.3 + i * 0.15);
        ctx.beginPath();
        ctx.arc(0, 0, r, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
      }
      
      // Glowing tentacles
      for (let i = -4; i <= 4; i++) {
        const tx = i * 3.5;
        const tPhase = monster.tentaclePhase + i * 0.4;
        const tentacleGlow = 0.4 + Math.sin(tPhase * 2) * 0.3;
        
        // Outer glow
        ctx.strokeStyle = `rgba(200, 100, 255, ${tentacleGlow * 0.5})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(tx, 0);
        ctx.bezierCurveTo(
          tx + Math.sin(tPhase) * 10, monster.size * 0.5,
          tx + Math.sin(tPhase * 1.5) * 8, monster.size,
          tx + Math.sin(tPhase * 2) * 6, monster.size * 1.8
        );
        ctx.stroke();
        
        // Inner bright
        ctx.strokeStyle = `rgba(255, 200, 255, ${tentacleGlow})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Central organ glow
      ctx.fillStyle = `rgba(255, 255, 200, ${0.5 + Math.sin(time * 4) * 0.3})`;
      ctx.beginPath();
      ctx.arc(0, -monster.size * 0.3, monster.size * 0.2, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'shark':
      ctx.rotate(monster.angle);
      
      // Cybernetic shark - enhanced design
      // Body shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 10, monster.size * 0.8, monster.size * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Main body with metallic gradient
      const sharkGrad = ctx.createLinearGradient(-monster.size, -monster.size * 0.4, monster.size, monster.size * 0.4);
      sharkGrad.addColorStop(0, '#3a4a5a');
      sharkGrad.addColorStop(0.3, '#5a6a7a');
      sharkGrad.addColorStop(0.5, '#7a8a9a');
      sharkGrad.addColorStop(0.7, '#5a6a7a');
      sharkGrad.addColorStop(1, '#3a4a5a');
      ctx.fillStyle = sharkGrad;
      ctx.beginPath();
      ctx.moveTo(monster.size * 1.1, 0);
      ctx.bezierCurveTo(monster.size * 0.8, -monster.size * 0.35, monster.size * 0.3, -monster.size * 0.4, 0, -monster.size * 0.35);
      ctx.bezierCurveTo(-monster.size * 0.5, -monster.size * 0.3, -monster.size * 0.8, -monster.size * 0.15, -monster.size, 0);
      ctx.bezierCurveTo(-monster.size * 0.8, monster.size * 0.15, -monster.size * 0.5, monster.size * 0.3, 0, monster.size * 0.35);
      ctx.bezierCurveTo(monster.size * 0.3, monster.size * 0.4, monster.size * 0.8, monster.size * 0.35, monster.size * 1.1, 0);
      ctx.fill();
      
      // Armored plates
      ctx.strokeStyle = 'rgba(100, 150, 200, 0.4)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const px = -monster.size * 0.4 + i * monster.size * 0.3;
        ctx.beginPath();
        ctx.moveTo(px, -monster.size * 0.25);
        ctx.lineTo(px, monster.size * 0.25);
        ctx.stroke();
      }
      
      // Dorsal fin - mechanical
      ctx.fillStyle = '#4a5a6a';
      ctx.beginPath();
      ctx.moveTo(-monster.size * 0.1, -monster.size * 0.35);
      ctx.lineTo(-monster.size * 0.35, -monster.size * 0.9);
      ctx.lineTo(-monster.size * 0.5, -monster.size * 0.35);
      ctx.closePath();
      ctx.fill();
      
      // Fin glow
      ctx.strokeStyle = `rgba(255, 50, 50, ${0.5 + Math.sin(time * 5) * 0.3})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-monster.size * 0.2, -monster.size * 0.5);
      ctx.lineTo(-monster.size * 0.4, -monster.size * 0.7);
      ctx.stroke();
      
      // Glowing eye - cybernetic
      const eyeGlow = ctx.createRadialGradient(monster.size * 0.65, -monster.size * 0.12, 0, monster.size * 0.65, -monster.size * 0.12, 8);
      eyeGlow.addColorStop(0, '#ff0000');
      eyeGlow.addColorStop(0.5, '#ff3300');
      eyeGlow.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = eyeGlow;
      ctx.beginPath();
      ctx.arc(monster.size * 0.65, -monster.size * 0.12, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(monster.size * 0.65, -monster.size * 0.12, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Mouth with energy glow
      ctx.fillStyle = '#1a1a2a';
      ctx.beginPath();
      ctx.moveTo(monster.size * 0.9, monster.size * 0.05);
      ctx.lineTo(monster.size * 1.1, 0);
      ctx.lineTo(monster.size * 0.9, -monster.size * 0.05);
      ctx.closePath();
      ctx.fill();
      
      // Razor teeth
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 5; i++) {
        const tx = monster.size * 0.75 + i * 4;
        ctx.beginPath();
        ctx.moveTo(tx, monster.size * 0.08);
        ctx.lineTo(tx + 2, monster.size * 0.2);
        ctx.lineTo(tx + 4, monster.size * 0.08);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(tx, -monster.size * 0.08);
        ctx.lineTo(tx + 2, -monster.size * 0.2);
        ctx.lineTo(tx + 4, -monster.size * 0.08);
        ctx.fill();
      }
      
      // Tail thruster
      ctx.fillStyle = `rgba(0, 200, 255, ${0.4 + Math.sin(time * 8) * 0.3})`;
      ctx.beginPath();
      ctx.moveTo(-monster.size * 0.9, 0);
      ctx.lineTo(-monster.size * 1.3, -monster.size * 0.15);
      ctx.lineTo(-monster.size * 1.3, monster.size * 0.15);
      ctx.closePath();
      ctx.fill();
      break;
      
    case 'eel':
      // Electric eel - enhanced bioluminescence
      const eelGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, monster.size);
      const eelPulse = 0.3 + Math.sin(time * 4 + monster.tentaclePhase) * 0.2;
      eelGlow.addColorStop(0, `rgba(100, 255, 150, ${eelPulse})`);
      eelGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = eelGlow;
      ctx.beginPath();
      ctx.arc(0, 0, monster.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Body segments with glow
      ctx.lineCap = 'round';
      for (let layer = 2; layer >= 0; layer--) {
        const width = monster.size * (0.3 + layer * 0.15);
        const alpha = layer === 0 ? 1 : 0.3;
        
        const segGrad = ctx.createLinearGradient(0, -10, 0, 10);
        segGrad.addColorStop(0, `rgba(80, 200, 120, ${alpha})`);
        segGrad.addColorStop(0.5, `rgba(50, 255, 100, ${alpha})`);
        segGrad.addColorStop(1, `rgba(80, 200, 120, ${alpha})`);
        ctx.strokeStyle = segGrad;
        ctx.lineWidth = width;
        
        ctx.beginPath();
        ctx.moveTo(monster.size * 0.3, 0);
        for (let i = 0; i <= 6; i++) {
          const segX = monster.size * 0.3 - i * 12;
          const segY = Math.sin(monster.tentaclePhase + i * 0.8) * 10;
          ctx.lineTo(segX, segY);
        }
        ctx.stroke();
      }
      
      // Electric sparks
      ctx.strokeStyle = `rgba(150, 255, 200, ${0.5 + Math.sin(time * 10) * 0.5})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const sx = -i * 15 + Math.sin(time * 5 + i) * 5;
        const sy = Math.sin(monster.tentaclePhase + i) * 8;
        ctx.beginPath();
        ctx.moveTo(sx, sy - 8);
        ctx.lineTo(sx + 3, sy);
        ctx.lineTo(sx - 3, sy + 2);
        ctx.lineTo(sx, sy + 10);
        ctx.stroke();
      }
      
      // Head
      const headGrad = ctx.createRadialGradient(monster.size * 0.2, 0, 0, monster.size * 0.2, 0, monster.size * 0.4);
      headGrad.addColorStop(0, '#80ff90');
      headGrad.addColorStop(0.5, '#50cc70');
      headGrad.addColorStop(1, '#308050');
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.ellipse(monster.size * 0.2, 0, monster.size * 0.35, monster.size * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Glowing eyes
      ctx.fillStyle = `rgba(255, 255, 100, ${0.8 + Math.sin(time * 6) * 0.2})`;
      ctx.beginPath();
      ctx.arc(monster.size * 0.35, -monster.size * 0.1, 4, 0, Math.PI * 2);
      ctx.arc(monster.size * 0.35, monster.size * 0.1, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Eye glow
      const eyeGlowEel = ctx.createRadialGradient(monster.size * 0.35, 0, 0, monster.size * 0.35, 0, 15);
      eyeGlowEel.addColorStop(0, 'rgba(255, 255, 100, 0.4)');
      eyeGlowEel.addColorStop(1, 'transparent');
      ctx.fillStyle = eyeGlowEel;
      ctx.beginPath();
      ctx.arc(monster.size * 0.35, 0, 15, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'kraken':
      // Cosmic horror kraken
      const krakenPulse = 0.4 + Math.sin(time * 1.5) * 0.2;
      
      // Multi-layered glow
      const krakenGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, monster.size * 2.5);
      krakenGlow.addColorStop(0, `rgba(200, 50, 150, ${krakenPulse})`);
      krakenGlow.addColorStop(0.3, `rgba(150, 30, 100, ${krakenPulse * 0.6})`);
      krakenGlow.addColorStop(0.6, `rgba(100, 20, 80, ${krakenPulse * 0.3})`);
      krakenGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = krakenGlow;
      ctx.beginPath();
      ctx.arc(0, 0, monster.size * 2.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Tentacles with gradient and glow
      for (let i = 0; i < 8; i++) {
        const baseAngle = (i / 8) * Math.PI * 2;
        const phase = monster.tentaclePhase + i * 0.5;
        const len = monster.size * 1.8;
        
        // Tentacle glow
        ctx.strokeStyle = `rgba(255, 100, 200, ${0.3 + Math.sin(phase) * 0.2})`;
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(
          Math.cos(baseAngle + Math.sin(phase) * 0.3) * len * 0.4,
          Math.sin(baseAngle + Math.sin(phase) * 0.3) * len * 0.4,
          Math.cos(baseAngle + Math.sin(phase + 0.5) * 0.4) * len * 0.7,
          Math.sin(baseAngle + Math.sin(phase + 0.5) * 0.4) * len * 0.7,
          Math.cos(baseAngle + Math.sin(phase + 1) * 0.5) * len,
          Math.sin(baseAngle + Math.sin(phase + 1) * 0.5) * len
        );
        ctx.stroke();
        
        // Tentacle core
        const tentGrad = ctx.createLinearGradient(0, 0, 
          Math.cos(baseAngle) * len, Math.sin(baseAngle) * len);
        tentGrad.addColorStop(0, '#cc6090');
        tentGrad.addColorStop(0.5, '#aa5080');
        tentGrad.addColorStop(1, '#884070');
        ctx.strokeStyle = tentGrad;
        ctx.lineWidth = 6;
        ctx.stroke();
        
        // Suckers
        for (let j = 1; j <= 3; j++) {
          const t = j / 4;
          const sx = Math.cos(baseAngle + Math.sin(phase + t) * 0.3) * len * t;
          const sy = Math.sin(baseAngle + Math.sin(phase + t) * 0.3) * len * t;
          ctx.fillStyle = 'rgba(150, 50, 100, 0.6)';
          ctx.beginPath();
          ctx.arc(sx, sy, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Body with texture
      const bodyGrad = ctx.createRadialGradient(0, -monster.size * 0.1, 0, 0, 0, monster.size * 0.7);
      bodyGrad.addColorStop(0, '#dd90b0');
      bodyGrad.addColorStop(0.5, '#bb7090');
      bodyGrad.addColorStop(1, '#995070');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(0, 0, monster.size * 0.65, 0, Math.PI * 2);
      ctx.fill();
      
      // Body texture
      ctx.strokeStyle = 'rgba(100, 30, 60, 0.3)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * monster.size * 0.3, Math.sin(angle) * monster.size * 0.3, 
                monster.size * 0.15, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Multiple glowing eyes
      const eyePositions = [
        { x: -monster.size * 0.25, y: -monster.size * 0.2, size: 7 },
        { x: monster.size * 0.25, y: -monster.size * 0.2, size: 7 },
        { x: 0, y: monster.size * 0.15, size: 6 },
        { x: -monster.size * 0.35, y: 0, size: 4 },
        { x: monster.size * 0.35, y: 0, size: 4 },
      ];
      
      eyePositions.forEach((eye, i) => {
        const eyePulse = 0.7 + Math.sin(time * 4 + i) * 0.3;
        
        // Eye glow
        const eGlow = ctx.createRadialGradient(eye.x, eye.y, 0, eye.x, eye.y, eye.size * 2);
        eGlow.addColorStop(0, `rgba(255, 50, 50, ${eyePulse})`);
        eGlow.addColorStop(0.5, `rgba(255, 0, 0, ${eyePulse * 0.5})`);
        eGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = eGlow;
        ctx.beginPath();
        ctx.arc(eye.x, eye.y, eye.size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye core
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(eye.x, eye.y, eye.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupil
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(eye.x + Math.sin(time + i) * 2, eye.y, eye.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
  }
  
  // Health bar
  if (monster.health < monster.maxHealth) {
    const healthPct = monster.health / monster.maxHealth;
    ctx.fillStyle = '#333';
    ctx.fillRect(-15, -monster.size - 10, 30, 4);
    ctx.fillStyle = healthPct > 0.5 ? '#00ff00' : healthPct > 0.25 ? '#ffff00' : '#ff0000';
    ctx.fillRect(-15, -monster.size - 10, 30 * healthPct, 4);
  }
  
  ctx.restore();
}

function renderTorpedo(ctx: CanvasRenderingContext2D, torpedo: Torpedo, state: UnderwaterState): void {
  ctx.save();
  ctx.translate(torpedo.x, torpedo.y);
  
  const angle = Math.atan2(torpedo.velocityY, torpedo.velocityX);
  ctx.rotate(angle);
  
  if (torpedo.isPlayer) {
    // Player torpedo
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Bubble trail
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(-8 - i * 5, Math.random() * 4 - 2, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Enemy ink projectile
    ctx.fillStyle = 'rgba(50, 0, 50, 0.8)';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Ink trail
    ctx.fillStyle = 'rgba(50, 0, 50, 0.4)';
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(-i * 6, Math.random() * 6 - 3, 5 - i, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  ctx.restore();
}

function renderBubble(ctx: CanvasRenderingContext2D, bubble: Bubble): void {
  ctx.save();
  ctx.translate(bubble.x, bubble.y);
  
  ctx.strokeStyle = 'rgba(200, 230, 255, 0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, bubble.size, 0, Math.PI * 2);
  ctx.stroke();
  
  // Highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.arc(-bubble.size * 0.3, -bubble.size * 0.3, bubble.size * 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function renderUnderwaterExplosion(ctx: CanvasRenderingContext2D, exp: UnderwaterExplosion): void {
  const progress = exp.frame / exp.maxFrames;
  const size = exp.size * (1 + progress * 0.5);
  const alpha = 1 - progress;
  
  ctx.save();
  ctx.translate(exp.x, exp.y);
  
  // Underwater explosions are more bubble-like
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const dist = size * progress;
    const bx = Math.cos(angle) * dist;
    const by = Math.sin(angle) * dist;
    const bSize = (1 - progress) * 10;
    
    ctx.fillStyle = `rgba(255, 200, 100, ${alpha * 0.8})`;
    ctx.beginPath();
    ctx.arc(bx, by, bSize, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Core flash
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.3 * (1 - progress), 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function renderDepthOverlay(ctx: CanvasRenderingContext2D, state: UnderwaterState): void {
  const { canvasWidth, canvasHeight } = GAME_CONFIG;
  
  // Vignette
  const vignette = ctx.createRadialGradient(
    canvasWidth / 2, canvasHeight / 2, canvasWidth * 0.3,
    canvasWidth / 2, canvasHeight / 2, canvasWidth * 0.7
  );
  vignette.addColorStop(0, 'transparent');
  vignette.addColorStop(1, 'rgba(0, 20, 40, 0.4)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

function renderUnderwaterHUD(ctx: CanvasRenderingContext2D, state: UnderwaterState): void {
  const { canvasWidth, canvasHeight } = GAME_CONFIG;
  
  // Sonar effect
  const sonarPhase = (Date.now() * 0.001) % (Math.PI * 2);
  const sonarRadius = (sonarPhase / (Math.PI * 2)) * 200;
  
  ctx.strokeStyle = `rgba(0, 255, 100, ${0.3 - sonarPhase / (Math.PI * 8)})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(state.subX + 20, state.subY + 9, sonarRadius, 0, Math.PI * 2);
  ctx.stroke();
  
  // Depth meter
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(15, 50, 25, 200);
  
  const depthPct = state.currentDepth / state.maxDepth;
  ctx.fillStyle = '#0066aa';
  ctx.fillRect(15, 50, 25, 200 * depthPct);
  
  ctx.strokeStyle = '#00aaff';
  ctx.lineWidth = 1;
  ctx.strokeRect(15, 50, 25, 200);
  
  ctx.font = '10px monospace';
  ctx.fillStyle = '#00ffff';
  ctx.textAlign = 'center';
  ctx.fillText('DEPTH', 27, 45);
  ctx.fillText(`${Math.floor(state.currentDepth)}m`, 27, 265);
  
  // Pod counter
  ctx.textAlign = 'right';
  ctx.font = 'bold 14px monospace';
  ctx.fillStyle = '#00ffaa';
  ctx.fillText(`PODS: ${state.podsCollected}/${state.totalPods}`, canvasWidth - 15, 50);
}

function renderUnderwaterScanlines(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = 'rgba(0, 20, 40, 0.1)';
  for (let y = 0; y < GAME_CONFIG.canvasHeight; y += 3) {
    ctx.fillRect(0, y, GAME_CONFIG.canvasWidth, 1);
  }
}

function renderUnderwaterUI(ctx: CanvasRenderingContext2D, state: UnderwaterState): void {
  const { canvasWidth, canvasHeight } = GAME_CONFIG;
  
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  
  let phaseText = '';
  switch (state.phase) {
    case 'approaching': phaseText = 'APPROACHING AQUATIC PLANET'; break;
    case 'landing': phaseText = 'LANDING SEQUENCE'; break;
    case 'pilot_to_sub': phaseText = 'BOARDING SUBMARINE'; break;
    case 'diving': phaseText = 'DESCENDING TO DEPTHS'; break;
    case 'ascending': phaseText = 'ASCENDING TO SURFACE'; break;
    case 'pilot_to_ship': phaseText = 'MISSION COMPLETE'; break;
    case 'takeoff': phaseText = 'TAKEOFF'; break;
    // No text during exploring - show stats instead
  }
  
  // Show victory screen during showing_results phase
  if (state.phase === 'showing_results') {
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Check if mission was successful (submarine not destroyed)
    const isVictory = !state.subDestroyed && state.subHealth > 0;
    
    ctx.save();
    ctx.textAlign = 'center';
    
    if (isVictory) {
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 40px monospace';
      ctx.fillText('MISSION COMPLETE!', canvasWidth / 2, canvasHeight / 2 - 60);
    } else {
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 40px monospace';
      ctx.fillText('MISSION FAILED', canvasWidth / 2, canvasHeight / 2 - 60);
      ctx.fillStyle = '#ff6600';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('SUBMARINE DESTROYED', canvasWidth / 2, canvasHeight / 2 - 20);
    }
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`TOTAL BONUS: ${state.bonusScore}`, canvasWidth / 2, canvasHeight / 2 + 15);
    ctx.fillStyle = '#00ffaa';
    ctx.font = '18px monospace';
    ctx.fillText(`Pods Collected: ${state.podsCollected}/${state.totalPods}`, canvasWidth / 2, canvasHeight / 2 + 45);
    ctx.fillText(`Monsters Defeated: ${state.monstersDefeated}`, canvasWidth / 2, canvasHeight / 2 + 70);
    
    // Tap to continue
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px monospace';
    if (Math.floor(Date.now() / 500) % 2 === 0) {
      ctx.fillText('TAP TO CONTINUE', canvasWidth / 2, canvasHeight / 2 + 110);
    }
    ctx.restore();
  } else if (state.phase === 'pilot_to_ship') {
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MISSION COMPLETE!', canvasWidth / 2, canvasHeight / 2 - 30);
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`TOTAL BONUS: ${state.bonusScore}`, canvasWidth / 2, canvasHeight / 2 + 20);
  } else if (phaseText) {
    ctx.fillStyle = '#00ffaa';
    ctx.fillText(phaseText, canvasWidth / 2, 25);
  }
  
  // During exploration - show pods and oxygen
  if (state.phase === 'exploring') {
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#00ffaa';
    ctx.textAlign = 'center';
    ctx.fillText(`PODS: ${state.podsCollected}/${state.totalPods}`, canvasWidth / 2, 25);
  }
  
  // Health bar during gameplay
  if (state.phase === 'exploring' || state.phase === 'diving' || state.phase === 'ascending') {
    ctx.fillStyle = '#333';
    ctx.fillRect(canvasWidth - 120, 15, 100, 12);
    
    const healthPct = state.subHealth / state.maxSubHealth;
    ctx.fillStyle = healthPct > 0.5 ? '#ffaa00' : healthPct > 0.25 ? '#ff6600' : '#ff0000';
    ctx.fillRect(canvasWidth - 120, 15, 100 * healthPct, 12);
    
    ctx.strokeStyle = '#ffaa00';
    ctx.lineWidth = 1;
    ctx.strokeRect(canvasWidth - 120, 15, 100, 12);
    
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffaa00';
    ctx.fillText('HULL', canvasWidth - 120, 12);
  }
  
  // Oxygen meter during exploration
  if (state.phase === 'exploring') {
    const oxygenPct = state.oxygen / state.maxOxygen;
    const oxygenBarX = canvasWidth - 120;
    const oxygenBarY = 35;
    
    // Background
    ctx.fillStyle = '#333';
    ctx.fillRect(oxygenBarX, oxygenBarY, 100, 12);
    
    // Oxygen level - blue to red as it depletes
    let oxygenColor = '#00aaff';
    if (oxygenPct < 0.3) {
      oxygenColor = '#ff3333';
      // Flash warning when low
      if (Math.floor(Date.now() / 300) % 2 === 0) {
        oxygenColor = '#ff0000';
      }
    } else if (oxygenPct < 0.5) {
      oxygenColor = '#ffaa00';
    }
    
    ctx.fillStyle = oxygenColor;
    ctx.fillRect(oxygenBarX, oxygenBarY, 100 * oxygenPct, 12);
    
    ctx.strokeStyle = '#00aaff';
    ctx.lineWidth = 1;
    ctx.strokeRect(oxygenBarX, oxygenBarY, 100, 12);
    
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = oxygenColor;
    ctx.fillText('O₂', oxygenBarX, oxygenBarY - 3);
    
    // Surface indicator when low on oxygen
    if (oxygenPct < 0.3 && !state.isAtSurface) {
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#ff3333';
      ctx.textAlign = 'center';
      ctx.fillText('↑ SURFACE FOR AIR ↑', canvasWidth / 2, 50);
    }
    
    // At surface indicator
    if (state.isAtSurface) {
      ctx.font = '10px monospace';
      ctx.fillStyle = '#00ffaa';
      ctx.textAlign = 'right';
      ctx.fillText('AT SURFACE', canvasWidth - 20, oxygenBarY + 25);
    }
  }
}