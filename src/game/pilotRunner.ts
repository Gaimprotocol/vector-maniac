// Pilot Runner Mode - Side-scrolling run-and-gun bonus level
// Ship lands, pilot exits and runs through space landscape shooting enemies
import { generateId } from './utils';
import { GAME_CONFIG } from './constants';
import { drawMegaShip } from './megaShipRenderer';
import { getStoredMegaShipId } from '@/hooks/useMegaShips';

export type PilotRunnerPhase = 
  | 'approaching'       // Ship flying in
  | 'landing'           // Ship landing
  | 'pilot_exit'        // Pilot jumps out
  | 'running'           // Main gameplay - run and gun
  | 'pilot_return'      // Pilot runs back to ship
  | 'takeoff'           // Ship takes off
  | 'showing_results'   // Show results and wait for tap
  | 'complete';         // Return to normal gameplay

export interface RunnerEnemy {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  health: number;
  type: 'grunt' | 'jumper' | 'flyer' | 'turret' | 'mech';
  frame: number;
  facingLeft: boolean;
  fireTimer: number;
  onGround: boolean;
  state: 'idle' | 'walking' | 'attacking' | 'jumping';
}

export interface RunnerBullet {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  isPlayer: boolean;
  damage: number;
}

export interface RunnerPlatform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ground' | 'rock' | 'metal' | 'floating';
}

export interface RunnerExplosion {
  id: string;
  x: number;
  y: number;
  frame: number;
  maxFrames: number;
  size: number;
}

export interface RunnerMine {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  blinkPhase: number;
}

export interface RunnerParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface PilotRunnerState {
  phase: PilotRunnerPhase;
  phaseTimer: number;
  
  // Ship position during animations
  shipX: number;
  shipY: number;
  shipAngle: number;
  shipScale: number;
  
  // Pilot state
  pilotX: number;
  pilotY: number;
  pilotVelocityX: number;
  pilotVelocityY: number;
  pilotFrame: number;
  pilotFacingRight: boolean;
  pilotOnGround: boolean;
  pilotHealth: number;
  maxPilotHealth: number;
  pilotInvulnerable: number;
  
  // Aim angle (0 = forward, -90 = straight up)
  aimAngle: number;
  
  // World
  scrollOffset: number;
  scrollSpeed: number;
  groundLevel: number;
  platforms: RunnerPlatform[];
  
  // Combat
  enemies: RunnerEnemy[];
  bullets: RunnerBullet[];
  mines: RunnerMine[];
  explosions: RunnerExplosion[];
  particles: RunnerParticle[];
  fireTimer: number;
  
  // Progress
  distance: number;
  targetDistance: number;
  enemiesDefeated: number;
  
  // Scoring
  bonusScore: number;
  
  // Visual
  stars: { x: number; y: number; size: number; brightness: number; layer: number }[];
  mountains: { x: number; height: number; width: number; layer: number }[];
  craters: { x: number; y: number; size: number }[];
  rocks: { x: number; size: number; type: number }[];
  
  // Environment variant
  variant: number;
  skyColorTop: string;
  skyColorBottom: string;
  groundColor: string;
  accentColor: string;
  
  // Sound triggers
  soundQueue: string[];
  
  // Input state for results screen
  inputReleased: boolean;
}

// Visual variants for different environments
const RUNNER_VARIANTS = [
  { skyColorTop: '#050510', skyColorBottom: '#1a1030', groundColor: '#2a1a3a', accentColor: '#4a2a5a' },
  { skyColorTop: '#000a15', skyColorBottom: '#0a1a2a', groundColor: '#1a2535', accentColor: '#2a4555' },
  { skyColorTop: '#100505', skyColorBottom: '#2a1515', groundColor: '#3a1a1a', accentColor: '#5a2a2a' },
  { skyColorTop: '#050a05', skyColorBottom: '#1a2a1a', groundColor: '#2a3a2a', accentColor: '#3a5a3a' },
];

// Audio context
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

export function playRunnerSound(type: 'shoot' | 'jump' | 'explosion' | 'hit' | 'land' | 'footstep' | 'engine' | 'landing' | 'takeoff' | 'hover' | 'enemy_spawn' | 'powerup'): void {
  try {
    const ctx = getAudioContext();
    
    switch (type) {
      case 'shoot': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
        break;
      }
      case 'jump': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
        break;
      }
      case 'explosion': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
        break;
      }
      case 'hit': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
        break;
      }
      case 'land': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
        break;
      }
      case 'footstep': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(80 + Math.random() * 40, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
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
      case 'hover': {
        // Subtle electronic hum for hoverboard
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120 + Math.random() * 30, ctx.currentTime);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
        break;
      }
      case 'enemy_spawn': {
        // Warbling alert sound for enemy spawn
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.05);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
        break;
      }
      case 'powerup': {
        // Ascending chime for powerup
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
        break;
      }
    }
  } catch (e) {
    // Audio context not available
  }
}

export function createPilotRunnerState(): PilotRunnerState {
  const variant = Math.floor(Math.random() * RUNNER_VARIANTS.length);
  const variantData = RUNNER_VARIANTS[variant];
  
  // Generate stars with layers for parallax
  const stars: PilotRunnerState['stars'] = [];
  for (let i = 0; i < 150; i++) {
    stars.push({
      x: Math.random() * GAME_CONFIG.canvasWidth * 4,
      y: Math.random() * GAME_CONFIG.canvasHeight * 0.6,
      size: Math.random() * 2 + 0.5,
      brightness: 0.3 + Math.random() * 0.7,
      layer: Math.floor(Math.random() * 3),
    });
  }
  
  // Generate mountains with layers
  const mountains: PilotRunnerState['mountains'] = [];
  for (let i = 0; i < 30; i++) {
    mountains.push({
      x: i * 150 + Math.random() * 80,
      height: 40 + Math.random() * 100,
      width: 80 + Math.random() * 120,
      layer: Math.floor(Math.random() * 2),
    });
  }
  
  // Generate craters
  const craters: PilotRunnerState['craters'] = [];
  for (let i = 0; i < 40; i++) {
    craters.push({
      x: i * 120 + Math.random() * 80,
      y: Math.random() * 15,
      size: 8 + Math.random() * 20,
    });
  }
  
  // Generate rocks
  const rocks: PilotRunnerState['rocks'] = [];
  for (let i = 0; i < 60; i++) {
    rocks.push({
      x: i * 80 + Math.random() * 60,
      size: 3 + Math.random() * 8,
      type: Math.floor(Math.random() * 3),
    });
  }
  
  const groundY = GAME_CONFIG.canvasHeight - 60;
  
  // Only ground platform - no floating platforms
  const platforms: RunnerPlatform[] = [
    {
      id: generateId(),
      x: 0,
      y: groundY,
      width: GAME_CONFIG.canvasWidth * 10,
      height: 60,
      type: 'ground',
    },
  ];
  
  return {
    phase: 'approaching',
    phaseTimer: 120,
    
    shipX: -100,
    shipY: GAME_CONFIG.canvasHeight * 0.4,
    shipAngle: 0,
    shipScale: 0.4,
    
    pilotX: 0,
    pilotY: 0,
    pilotVelocityX: 0,
    pilotVelocityY: 0,
    pilotFrame: 0,
    pilotFacingRight: true,
    pilotOnGround: false,
    pilotHealth: 100,
    maxPilotHealth: 100,
    pilotInvulnerable: 0,
    
    aimAngle: 0, // 0 = forward, -90 = up
    
    scrollOffset: 0,
    scrollSpeed: 0,
    groundLevel: groundY,
    platforms,
    
    enemies: [],
    bullets: [],
    mines: [],
    explosions: [],
    particles: [],
    fireTimer: 0,
    
    distance: 0,
    targetDistance: 3000,
    enemiesDefeated: 0,
    
    bonusScore: 0,
    stars,
    mountains,
    craters,
    rocks,
    
    variant,
    skyColorTop: variantData.skyColorTop,
    skyColorBottom: variantData.skyColorBottom,
    groundColor: variantData.groundColor,
    accentColor: variantData.accentColor,
    
    soundQueue: [],
    
    inputReleased: false,
  };
}

export function updatePilotRunnerState(
  state: PilotRunnerState,
  input: { left: boolean; right: boolean; up: boolean; down: boolean; fire: boolean; jump?: boolean; special?: boolean; touchX?: number; touchY?: number; isTouching?: boolean }
): PilotRunnerState {
  let newState = { 
    ...state, 
    soundQueue: [] as string[],
    bullets: [...state.bullets],
    enemies: [...state.enemies],
    explosions: [...state.explosions],
    particles: [...state.particles],
  };
  
  switch (newState.phase) {
    case 'approaching':
      newState = updateApproachingPhase(newState);
      break;
    case 'landing':
      newState = updateLandingPhase(newState);
      break;
    case 'pilot_exit':
      newState = updatePilotExitPhase(newState);
      break;
    case 'running':
      newState = updateRunningPhase(newState, input);
      break;
    case 'pilot_return':
      newState = updatePilotReturnPhase(newState);
      break;
    case 'takeoff':
      newState = updateTakeoffPhase(newState);
      break;
    case 'showing_results':
      newState = updateShowingResultsPhase(newState, input);
      break;
  }
  
  // Play queued sounds
  newState.soundQueue.forEach(sound => {
    playRunnerSound(sound as any);
  });
  
  return newState;
}

function updateApproachingPhase(state: PilotRunnerState): PilotRunnerState {
  const newState = { ...state };
  newState.shipX = Math.min(GAME_CONFIG.canvasWidth * 0.3, state.shipX + 5);
  newState.shipY = state.shipY + Math.sin(state.phaseTimer * 0.1) * 0.5;
  newState.shipScale = Math.min(1, state.shipScale + 0.005);
  newState.phaseTimer--;
  
  if (newState.phaseTimer % 8 === 0) {
    newState.soundQueue = [...newState.soundQueue, 'engine'];
  }
  
  if (newState.shipX >= GAME_CONFIG.canvasWidth * 0.3) {
    newState.phase = 'landing';
    newState.phaseTimer = 90;
    newState.soundQueue = [...newState.soundQueue, 'landing'];
  }
  return newState;
}

function updateLandingPhase(state: PilotRunnerState): PilotRunnerState {
  const newState = { ...state };
  const targetY = state.groundLevel - 45;
  newState.shipY = state.shipY + (targetY - state.shipY) * 0.06;
  newState.shipAngle = Math.sin(state.phaseTimer * 0.15) * 2;
  newState.phaseTimer--;
  
  if (newState.phaseTimer % 12 === 0) {
    newState.soundQueue = [...newState.soundQueue, 'landing'];
  }
  
  if (state.phaseTimer <= 0) {
    newState.phase = 'pilot_exit';
    newState.phaseTimer = 50;
    newState.pilotX = newState.shipX + 20;
    newState.pilotY = state.groundLevel - 30;
    newState.pilotVelocityY = -10;
    newState.pilotVelocityX = 4;
    newState.soundQueue = [...newState.soundQueue, 'jump'];
  }
  return newState;
}

function updatePilotExitPhase(state: PilotRunnerState): PilotRunnerState {
  const newState = { ...state };
  
  // Pilot jumps out with arc
  newState.pilotVelocityY += 0.5; // gravity
  newState.pilotY += newState.pilotVelocityY;
  newState.pilotX += newState.pilotVelocityX;
  newState.pilotVelocityX *= 0.98;
  newState.pilotFrame = (state.pilotFrame + 0.3) % 4;
  
  if (newState.pilotY >= state.groundLevel - 25) {
    newState.pilotY = state.groundLevel - 25;
    newState.pilotVelocityY = 0;
    newState.pilotOnGround = true;
    newState.phase = 'running';
    newState.scrollSpeed = 4; // Reduced by 20%
    newState.soundQueue = [...newState.soundQueue, 'land'];
    
    // Spawn initial enemies
    for (let i = 0; i < 3; i++) {
      newState.enemies = [...newState.enemies, spawnEnemy(GAME_CONFIG.canvasWidth + 200 + i * 200, state.groundLevel)];
    }
  }
  
  return newState;
}

function updateRunningPhase(
  state: PilotRunnerState,
  input: { left: boolean; right: boolean; up: boolean; down: boolean; fire: boolean; jump?: boolean; touchX?: number; touchY?: number; isTouching?: boolean }
): PilotRunnerState {
  let newState = { 
    ...state,
    bullets: [...state.bullets],
    enemies: [...state.enemies],
    mines: [...state.mines],
    explosions: [...state.explosions],
    particles: [...state.particles],
    platforms: [...state.platforms],
    soundQueue: [...state.soundQueue],
  };
  
  // Touch controls - aiming and shooting based on touch position
  let shoot = input.fire;
  let aimAngle = newState.aimAngle;
  
  if (input.isTouching && input.touchX !== undefined && input.touchY !== undefined) {
    // Auto-shoot when touching
    shoot = true;
    
    // Calculate aim angle based on touch position relative to pilot
    const dx = input.touchX - newState.pilotX;
    const dy = input.touchY - newState.pilotY;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    // Clamp to 90 degrees: 0 (forward) to -90 (straight up)
    const targetAngle = Math.max(-90, Math.min(0, angle));
    // Smooth interpolation for aim angle
    aimAngle = aimAngle + (targetAngle - aimAngle) * 0.15;
  } else {
    // Keyboard aim: Up/Down keys aim up/down
    if (input.up) {
      const targetAngle = Math.max(-90, aimAngle - 5);
      aimAngle = aimAngle + (targetAngle - aimAngle) * 0.2;
    } else if (input.down) {
      const targetAngle = Math.min(45, aimAngle + 5); // Allow aiming slightly down too
      aimAngle = aimAngle + (targetAngle - aimAngle) * 0.2;
    } else {
      // Return to forward aim gradually with smooth interpolation
      aimAngle = aimAngle + (0 - aimAngle) * 0.08;
    }
  }
  
  newState.aimAngle = aimAngle;
  
  // Pilot is locked in position (no horizontal movement - like buggy)
  // Always facing right (forward)
  newState.pilotFacingRight = true;
  newState.pilotVelocityX = 0;
  
  // Jump - dedicated jump button or keyboard up (only when not already aiming up)
  const shouldJump = input.jump || (input.up && !input.isTouching);
  if (shouldJump && newState.pilotOnGround) {
    newState.pilotVelocityY = -12;
    newState.pilotOnGround = false;
    newState.soundQueue = [...newState.soundQueue, 'jump'];
  }
  
  // Gravity
  newState.pilotVelocityY += 0.6;
  newState.pilotY += newState.pilotVelocityY;
  newState.pilotX += newState.pilotVelocityX;
  
  // Keep pilot at 10% left of center (40% from left edge)
  const targetX = GAME_CONFIG.canvasWidth * 0.4;
  newState.pilotX = targetX;
  
  // Ground collision
  if (newState.pilotY >= state.groundLevel - 25) {
    newState.pilotY = state.groundLevel - 25;
    newState.pilotVelocityY = 0;
    if (!newState.pilotOnGround) {
      newState.soundQueue = [...newState.soundQueue, 'land'];
    }
    newState.pilotOnGround = true;
  }
  
  // Animation - hoverboard hover sound instead of footsteps
  if (newState.pilotOnGround) {
    newState.pilotFrame = (state.pilotFrame + 0.15) % 8;
    // Play hover sound periodically
    if (Math.floor(state.pilotFrame * 2) !== Math.floor(newState.pilotFrame * 2) && Math.floor(newState.pilotFrame * 2) % 4 === 0) {
      newState.soundQueue = [...newState.soundQueue, 'hover'];
    }
  } else if (!newState.pilotOnGround) {
    newState.pilotFrame = 2; // Jump frame
  } else {
    newState.pilotFrame = 0;
  }
  
  // Shooting - 90 degree arc (forward to straight up)
  if (newState.fireTimer > 0) newState.fireTimer--;
  if (shoot && newState.fireTimer <= 0) {
    const bulletSpeed = 14;
    const angleRad = newState.aimAngle * Math.PI / 180;
    const dir = newState.pilotFacingRight ? 1 : -1;
    
    // Calculate bullet velocity based on aim angle
    const vx = Math.cos(angleRad) * bulletSpeed * dir;
    const vy = Math.sin(angleRad) * bulletSpeed;
    
    newState.bullets = [...newState.bullets, {
      id: generateId(),
      x: newState.pilotX + dir * 15,
      y: newState.pilotY - 5,
      velocityX: vx,
      velocityY: vy,
      isPlayer: true,
      damage: 25,
    }];
    newState.fireTimer = 10;
    newState.soundQueue = [...newState.soundQueue, 'shoot'];
    
    // Muzzle flash particle
    for (let i = 0; i < 3; i++) {
      newState.particles = [...newState.particles, {
        id: generateId(),
        x: newState.pilotX + dir * 18,
        y: newState.pilotY - 5,
        vx: vx * 0.3 + (Math.random() - 0.5) * 2,
        vy: vy * 0.3 + (Math.random() - 0.5) * 2,
        size: 2 + Math.random() * 2,
        color: '#ffff00',
        life: 8,
        maxLife: 8,
      }];
    }
  }
  
  // Scroll world
  newState.scrollOffset += newState.scrollSpeed;
  newState.distance += newState.scrollSpeed;
  
  // Invulnerability timer
  if (newState.pilotInvulnerable > 0) newState.pilotInvulnerable--;
  
  // Update bullets
  newState.bullets = newState.bullets
    .map(b => ({ ...b, x: b.x + b.velocityX, y: b.y + b.velocityY }))
    .filter(b => b.x > -50 && b.x < GAME_CONFIG.canvasWidth + 50 && b.y > -50 && b.y < GAME_CONFIG.canvasHeight + 50);
  
  // Update enemies
  newState.enemies = updateEnemies(newState.enemies, newState, newState.scrollSpeed);
  
  // Spawn new enemies (both ground and flying)
  if (Math.random() < 0.025 && newState.enemies.length < 10) {
    newState.enemies = [...newState.enemies, spawnEnemy(GAME_CONFIG.canvasWidth + 100, state.groundLevel)];
    newState.soundQueue = [...newState.soundQueue, 'enemy_spawn'];
  }
  
  // Spawn mines on the ground
  if (Math.random() < 0.015 && newState.mines.length < 8) {
    newState.mines = [...newState.mines, {
      id: generateId(),
      x: GAME_CONFIG.canvasWidth + 50,
      y: state.groundLevel - 8,
      width: 16,
      height: 10,
      blinkPhase: Math.random() * Math.PI * 2,
    }];
  }
  
  // Update mines (scroll with world)
  newState.mines = newState.mines
    .map(m => ({ ...m, x: m.x - newState.scrollSpeed, blinkPhase: m.blinkPhase + 0.1 }))
    .filter(m => m.x > -50);
  
  // Check mine-pilot collision (only when on ground and not jumping over)
  if (newState.pilotInvulnerable <= 0 && newState.pilotOnGround) {
    for (const mine of newState.mines) {
      const dx = Math.abs(mine.x - newState.pilotX);
      const dy = Math.abs(mine.y - (newState.pilotY + 15)); // Check feet position
      if (dx < 18 && dy < 15) {
        // Hit mine!
        newState.pilotHealth -= 25;
        newState.pilotInvulnerable = 60;
        newState.soundQueue = [...newState.soundQueue, 'explosion'];
        
        // Remove the mine and create explosion
        newState.mines = newState.mines.filter(m => m.id !== mine.id);
        newState.explosions = [...newState.explosions, {
          id: generateId(),
          x: mine.x,
          y: mine.y,
          frame: 0,
          maxFrames: 20,
          size: 25,
        }];
        
        // Knockback
        newState.pilotVelocityY = -8;
        newState.pilotOnGround = false;
        break;
      }
    }
  }
  
  // Check bullet-enemy collisions
  const bulletEnemyResult = checkBulletEnemyCollisions(newState.bullets, newState.enemies, newState.explosions, newState.particles);
  newState.bullets = bulletEnemyResult.bullets;
  newState.enemies = bulletEnemyResult.enemies;
  newState.explosions = bulletEnemyResult.explosions;
  newState.particles = bulletEnemyResult.particles;
  newState.enemiesDefeated += bulletEnemyResult.defeated;
  newState.bonusScore += bulletEnemyResult.defeated * 50;
  if (bulletEnemyResult.defeated > 0) {
    newState.soundQueue = [...newState.soundQueue, 'explosion'];
  }
  
  // Check enemy-pilot collision
  if (newState.pilotInvulnerable <= 0) {
    for (const enemy of newState.enemies) {
      const dx = enemy.x - newState.pilotX;
      const dy = enemy.y - newState.pilotY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 30) {
        newState.pilotHealth -= 20;
        newState.pilotInvulnerable = 60;
        newState.soundQueue = [...newState.soundQueue, 'hit'];
        // Knockback
        newState.pilotVelocityX = dx > 0 ? -5 : 5;
        newState.pilotVelocityY = -5;
        newState.pilotOnGround = false;
        break;
      }
    }
  }
  
  // Check enemy bullets hitting pilot
  const enemyBullets = newState.bullets.filter(b => !b.isPlayer);
  for (const bullet of enemyBullets) {
    const dx = bullet.x - newState.pilotX;
    const dy = bullet.y - newState.pilotY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 20 && newState.pilotInvulnerable <= 0) {
      newState.pilotHealth -= bullet.damage;
      newState.pilotInvulnerable = 30;
      newState.bullets = newState.bullets.filter(b => b.id !== bullet.id);
      newState.soundQueue = [...newState.soundQueue, 'hit'];
    }
  }
  
  // Update explosions
  newState.explosions = newState.explosions
    .map(e => ({ ...e, frame: e.frame + 0.5 }))
    .filter(e => e.frame < e.maxFrames);
  
  // Update particles
  newState.particles = newState.particles
    .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.15, life: p.life - 1 }))
    .filter(p => p.life > 0);
  
  // Check win/lose conditions
  if (newState.distance >= newState.targetDistance) {
    newState.phase = 'pilot_return';
    newState.phaseTimer = 120;
    newState.bonusScore += 1000;
  }
  
  if (newState.pilotHealth <= 0) {
    newState.phase = 'complete';
  }
  
  return newState;
}

function updatePilotReturnPhase(state: PilotRunnerState): PilotRunnerState {
  const newState = { ...state };
  
  // Pilot runs back to ship
  const targetX = newState.shipX + 20;
  const shipBoardingY = newState.shipY;
  
  newState.pilotX += (targetX - newState.pilotX) * 0.12;
  newState.pilotFacingRight = newState.pilotX < targetX;
  newState.pilotFrame = (state.pilotFrame + 0.25) % 8;
  newState.phaseTimer--;
  
  const distanceToShip = Math.abs(newState.pilotX - targetX);
  
  if (distanceToShip < 40) {
    // Smooth arc jump into ship using easing
    const jumpProgress = 1 - (distanceToShip / 40);
    const arcHeight = Math.sin(jumpProgress * Math.PI) * 60; // Smooth arc
    const targetY = shipBoardingY - arcHeight;
    newState.pilotY += (targetY - newState.pilotY) * 0.15;
    
    // Fade out pilot as they enter the ship
    if (distanceToShip < 15) {
      newState.pilotY = shipBoardingY;
    }
  }
  
  if (newState.phaseTimer <= 0) {
    newState.phase = 'takeoff';
    newState.phaseTimer = 60;
    newState.soundQueue = [...newState.soundQueue, 'takeoff'];
  }
  
  return newState;
}

function updateTakeoffPhase(state: PilotRunnerState): PilotRunnerState {
  const newState = { ...state };
  
  newState.shipY -= 6;
  newState.shipX += 5;
  newState.shipAngle -= 0.8;
  newState.phaseTimer--;
  
  if (newState.phaseTimer % 8 === 0) {
    newState.soundQueue = [...newState.soundQueue, 'engine'];
  }
  
  if (newState.phaseTimer <= 0) {
    newState.phase = 'showing_results';
    newState.phaseTimer = 120; // 2 second lock so results can be seen
    newState.inputReleased = false; // Reset input released state
  }
  
  return newState;
}

function updateShowingResultsPhase(state: PilotRunnerState, input: { fire: boolean; isTouching?: boolean }): PilotRunnerState {
  const newState = { ...state };

  // Wait for input lock, then require release before accepting new tap
  if (newState.phaseTimer > 0) {
    newState.phaseTimer--;
  } else {
    // Track if input was released
    if (!input.isTouching && !input.fire) {
      newState.inputReleased = true;
    }
    // Only accept input after it was released (fresh tap)
    if (newState.inputReleased && (input.fire || input.isTouching)) {
      newState.phase = 'complete';
    }
  }

  return newState;
}

function spawnEnemy(x: number, groundLevel: number): RunnerEnemy {
  const types: RunnerEnemy['type'][] = ['grunt', 'grunt', 'jumper', 'flyer'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  const enemyConfig = {
    grunt: { width: 20, height: 30, health: 50, y: groundLevel - 30 },
    jumper: { width: 18, height: 25, health: 40, y: groundLevel - 25 },
    flyer: { width: 25, height: 20, health: 30, y: groundLevel - 100 - Math.random() * 80 },
    turret: { width: 25, height: 20, health: 80, y: groundLevel - 20 },
    mech: { width: 35, height: 45, health: 150, y: groundLevel - 45 },
  };
  
  const config = enemyConfig[type];
  
  return {
    id: generateId(),
    x,
    y: config.y,
    width: config.width,
    height: config.height,
    velocityX: type === 'turret' ? 0 : -1.5 - Math.random(),
    velocityY: 0,
    health: config.health,
    type,
    frame: 0,
    facingLeft: true,
    fireTimer: 60 + Math.random() * 60,
    onGround: type !== 'flyer',
    state: 'walking',
  };
}

function updateEnemies(enemies: RunnerEnemy[], state: PilotRunnerState, scrollSpeed: number): RunnerEnemy[] {
  return enemies
    .map(enemy => {
      let newEnemy = { ...enemy, x: enemy.x - scrollSpeed };
      
      // Behavior based on type
      switch (enemy.type) {
        case 'grunt':
          newEnemy.x += enemy.velocityX;
          newEnemy.frame = (enemy.frame + 0.15) % 4;
          break;
        case 'jumper':
          newEnemy.x += enemy.velocityX;
          if (enemy.onGround && Math.random() < 0.02) {
            newEnemy.velocityY = -10;
            newEnemy.onGround = false;
          }
          newEnemy.velocityY += 0.5;
          newEnemy.y += newEnemy.velocityY;
          if (newEnemy.y >= state.groundLevel - 25) {
            newEnemy.y = state.groundLevel - 25;
            newEnemy.velocityY = 0;
            newEnemy.onGround = true;
          }
          newEnemy.frame = (enemy.frame + 0.2) % 4;
          break;
        case 'flyer':
          newEnemy.y += Math.sin(enemy.frame * 0.08) * 1.5;
          newEnemy.x += enemy.velocityX;
          newEnemy.frame++;
          break;
        case 'turret':
          // Stationary but rotates to aim
          newEnemy.frame = (enemy.frame + 0.1) % 2;
          break;
      }
      
      // Shooting
      if (newEnemy.fireTimer > 0) {
        newEnemy.fireTimer--;
      } else if (Math.abs(newEnemy.x - state.pilotX) < 400) {
        // Fire at player
        newEnemy.fireTimer = 90 + Math.random() * 60;
        newEnemy.state = 'attacking';
      }
      
      return newEnemy;
    })
    .filter(enemy => enemy.x > -100);
}

function checkBulletEnemyCollisions(
  bullets: RunnerBullet[],
  enemies: RunnerEnemy[],
  explosions: RunnerExplosion[],
  particles: RunnerParticle[]
): { bullets: RunnerBullet[]; enemies: RunnerEnemy[]; explosions: RunnerExplosion[]; particles: RunnerParticle[]; defeated: number } {
  let defeated = 0;
  const newBullets: RunnerBullet[] = [];
  let newEnemies = [...enemies];
  const newExplosions = [...explosions];
  const newParticles = [...particles];
  
  for (const bullet of bullets) {
    if (!bullet.isPlayer) {
      newBullets.push(bullet);
      continue;
    }
    
    let bulletHit = false;
    newEnemies = newEnemies.map(enemy => {
      if (bulletHit) return enemy;
      
      // Generous bounding box collision - entire enemy hitbox
      const bulletSize = 10; // Larger bullet hitbox for better hit detection
      const bulletLeft = bullet.x - bulletSize;
      const bulletRight = bullet.x + bulletSize;
      const bulletTop = bullet.y - bulletSize;
      const bulletBottom = bullet.y + bulletSize;
      
      // Use full enemy dimensions for hitbox
      const enemyHalfWidth = enemy.width;
      const enemyHalfHeight = enemy.height;
      const enemyLeft = enemy.x - enemyHalfWidth;
      const enemyRight = enemy.x + enemyHalfWidth;
      const enemyTop = enemy.y - enemyHalfHeight;
      const enemyBottom = enemy.y + enemyHalfHeight;
      
      const isColliding = bulletRight > enemyLeft && 
                          bulletLeft < enemyRight && 
                          bulletBottom > enemyTop && 
                          bulletTop < enemyBottom;
      
      if (isColliding) {
        bulletHit = true;
        const newHealth = enemy.health - bullet.damage;
        
        // Hit spark particles
        for (let i = 0; i < 4; i++) {
          newParticles.push({
            id: generateId(),
            x: bullet.x,
            y: bullet.y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            size: 2,
            color: '#ffaa00',
            life: 10,
            maxLife: 10,
          });
        }
        
        if (newHealth <= 0) {
          defeated++;
          newExplosions.push({
            id: generateId(),
            x: enemy.x,
            y: enemy.y,
            frame: 0,
            maxFrames: 18,
            size: enemy.width * 1.8,
          });
          
          // Spawn explosion particles
          for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            newParticles.push({
              id: generateId(),
              x: enemy.x,
              y: enemy.y,
              vx: Math.cos(angle) * (2 + Math.random() * 2),
              vy: Math.sin(angle) * (2 + Math.random() * 2) - 2,
              size: 3 + Math.random() * 2,
              color: i % 2 === 0 ? '#ff6600' : '#ffaa00',
              life: 25,
              maxLife: 25,
            });
          }
          
          return { ...enemy, health: 0 };
        }
        return { ...enemy, health: newHealth };
      }
      return enemy;
    }).filter(e => e.health > 0);
    
    if (!bulletHit) {
      newBullets.push(bullet);
    }
  }
  
  return { bullets: newBullets, enemies: newEnemies, explosions: newExplosions, particles: newParticles, defeated };
}

// Rendering function
export function renderPilotRunner(ctx: CanvasRenderingContext2D, state: PilotRunnerState): void {
  const { canvasWidth, canvasHeight } = GAME_CONFIG;
  const time = Date.now() * 0.001;
  
  // Background gradient (enhanced)
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(0, state.skyColorTop);
  gradient.addColorStop(0.5, state.skyColorBottom);
  gradient.addColorStop(0.8, state.groundColor);
  gradient.addColorStop(1, '#000000');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // Nebula/cosmic dust effect
  renderNebulae(ctx, state);
  
  // Stars with parallax layers
  for (const star of state.stars) {
    const parallaxSpeed = 0.1 + star.layer * 0.1;
    const x = ((star.x - state.scrollOffset * parallaxSpeed) % (canvasWidth * 2) + canvasWidth * 2) % (canvasWidth * 2);
    if (x > canvasWidth) continue;
    
    const twinkle = Math.sin(time * 2 + star.x) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * twinkle})`;
    ctx.beginPath();
    ctx.arc(x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Add glow to brighter stars
    if (star.brightness > 0.7 && star.size > 1.5) {
      const glowGrad = ctx.createRadialGradient(x, star.y, 0, x, star.y, star.size * 4);
      glowGrad.addColorStop(0, `rgba(200, 220, 255, ${star.brightness * 0.3})`);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(x, star.y, star.size * 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Distant mountains (far layer - parallax)
  renderMountains(ctx, state, 0, 0.15, 'rgba(30, 20, 40, 0.6)');
  
  // Closer mountains (near layer)
  renderMountains(ctx, state, 1, 0.3, state.accentColor + '80');
  
  // Ground surface with detail
  renderGround(ctx, state);
  
  // Ship (during approach/landing/takeoff phases)
  if (state.phase === 'approaching' || state.phase === 'landing' || state.phase === 'pilot_exit' || 
      state.phase === 'pilot_return' || state.phase === 'takeoff') {
    renderShip(ctx, state);
  }
  
  // Mines
  for (const mine of state.mines) {
    renderMine(ctx, mine, time);
  }
  
  // Enemies
  for (const enemy of state.enemies) {
    renderEnemy(ctx, enemy, time);
  }
  
  // Pilot (during gameplay phases)
  if (state.phase === 'pilot_exit' || state.phase === 'running' || state.phase === 'pilot_return') {
    renderPilot(ctx, state, time);
  }
  
  // Bullets with enhanced rendering
  for (const bullet of state.bullets) {
    if (bullet.isPlayer) {
      ctx.save();
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 12;
      
      // Bullet trail
      const angle = Math.atan2(bullet.velocityY, bullet.velocityX);
      const trailLen = 15;
      const trailGrad = ctx.createLinearGradient(
        bullet.x - Math.cos(angle) * trailLen, bullet.y - Math.sin(angle) * trailLen,
        bullet.x, bullet.y
      );
      trailGrad.addColorStop(0, 'transparent');
      trailGrad.addColorStop(0.5, 'rgba(0, 255, 255, 0.3)');
      trailGrad.addColorStop(1, '#00ffff');
      
      ctx.strokeStyle = trailGrad;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bullet.x - Math.cos(angle) * trailLen, bullet.y - Math.sin(angle) * trailLen);
      ctx.lineTo(bullet.x, bullet.y);
      ctx.stroke();
      
      // Bullet core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.save();
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#ff6666';
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  
  // Explosions with enhanced effects
  for (const explosion of state.explosions) {
    const progress = explosion.frame / explosion.maxFrames;
    const radius = explosion.size * (0.3 + progress * 0.7);
    
    // Outer glow
    const outerGrad = ctx.createRadialGradient(explosion.x, explosion.y, 0, explosion.x, explosion.y, radius * 1.5);
    outerGrad.addColorStop(0, `rgba(255, 200, 100, ${0.5 * (1 - progress)})`);
    outerGrad.addColorStop(0.5, `rgba(255, 100, 0, ${0.3 * (1 - progress)})`);
    outerGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(explosion.x, explosion.y, radius * 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Core
    ctx.beginPath();
    ctx.arc(explosion.x, explosion.y, radius * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, ${Math.floor(200 * (1 - progress))}, ${(1 - progress) * 0.9})`;
    ctx.fill();
  }
  
  // Particles
  for (const particle of state.particles) {
    const alpha = particle.life / particle.maxLife;
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  
  // Scanlines effect
  renderScanlines(ctx);
  
  // UI
  renderUI(ctx, state);
}

function renderNebulae(ctx: CanvasRenderingContext2D, state: PilotRunnerState): void {
  const time = Date.now() * 0.0001;
  
  // Create subtle nebula clouds
  for (let i = 0; i < 4; i++) {
    const baseX = (i * 300 + state.variant * 100) % (GAME_CONFIG.canvasWidth * 2);
    const x = ((baseX - state.scrollOffset * 0.02) % (GAME_CONFIG.canvasWidth * 1.5) + GAME_CONFIG.canvasWidth * 1.5) % (GAME_CONFIG.canvasWidth * 1.5);
    const y = 50 + (i * 80) % 200;
    const size = 80 + i * 30;
    const pulse = Math.sin(time * 2 + i) * 0.2 + 0.8;
    
    const nebulaGrad = ctx.createRadialGradient(x, y, 0, x, y, size);
    const hue = (state.variant * 60 + i * 30) % 360;
    nebulaGrad.addColorStop(0, `hsla(${hue}, 60%, 40%, ${0.08 * pulse})`);
    nebulaGrad.addColorStop(0.5, `hsla(${hue}, 50%, 30%, ${0.04 * pulse})`);
    nebulaGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = nebulaGrad;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderMountains(ctx: CanvasRenderingContext2D, state: PilotRunnerState, layer: number, parallaxSpeed: number, color: string): void {
  ctx.fillStyle = color;
  
  for (const mountain of state.mountains) {
    if (mountain.layer !== layer) continue;
    
    const x = ((mountain.x - state.scrollOffset * parallaxSpeed) % (GAME_CONFIG.canvasWidth * 3) + GAME_CONFIG.canvasWidth * 3) % (GAME_CONFIG.canvasWidth * 3) - 200;
    if (x > GAME_CONFIG.canvasWidth + 200) continue;
    
    ctx.beginPath();
    ctx.moveTo(x, state.groundLevel);
    ctx.lineTo(x + mountain.width * 0.3, state.groundLevel - mountain.height * 0.6);
    ctx.lineTo(x + mountain.width * 0.5, state.groundLevel - mountain.height);
    ctx.lineTo(x + mountain.width * 0.7, state.groundLevel - mountain.height * 0.7);
    ctx.lineTo(x + mountain.width, state.groundLevel);
    ctx.closePath();
    ctx.fill();
  }
}

function renderGround(ctx: CanvasRenderingContext2D, state: PilotRunnerState): void {
  const { canvasWidth, canvasHeight } = GAME_CONFIG;
  
  // Ground base with gradient
  const groundGrad = ctx.createLinearGradient(0, state.groundLevel, 0, canvasHeight);
  groundGrad.addColorStop(0, state.groundColor);
  groundGrad.addColorStop(0.3, state.accentColor);
  groundGrad.addColorStop(1, '#000000');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, state.groundLevel, canvasWidth, canvasHeight - state.groundLevel);
  
  // Ground edge highlight
  ctx.strokeStyle = state.accentColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, state.groundLevel);
  ctx.lineTo(canvasWidth, state.groundLevel);
  ctx.stroke();
  
  // Craters
  for (const crater of state.craters) {
    const x = ((crater.x - state.scrollOffset) % (canvasWidth * 3) + canvasWidth * 3) % (canvasWidth * 3) - 100;
    if (x > canvasWidth + 100 || x < -100) continue;
    
    const y = state.groundLevel + 10 + crater.y;
    
    // Crater shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x, y, crater.size, crater.size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Crater rim highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, y - 2, crater.size + 2, crater.size * 0.3, 0, Math.PI, 0);
    ctx.stroke();
  }
  
  // Rocks
  for (const rock of state.rocks) {
    const x = ((rock.x - state.scrollOffset * 1.1) % (canvasWidth * 3) + canvasWidth * 3) % (canvasWidth * 3) - 50;
    if (x > canvasWidth + 50 || x < -50) continue;
    
    const y = state.groundLevel - 2;
    
    ctx.fillStyle = rock.type === 0 ? '#4a4a5a' : rock.type === 1 ? '#5a5a6a' : '#3a3a4a';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + rock.size * 0.5, y - rock.size);
    ctx.lineTo(x + rock.size, y - rock.size * 0.6);
    ctx.lineTo(x + rock.size * 1.2, y);
    ctx.closePath();
    ctx.fill();
  }
  
  // Ground texture lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i < canvasWidth; i += 25) {
    const offset = (i + state.scrollOffset) % 25;
    ctx.beginPath();
    ctx.moveTo(i - offset, state.groundLevel + 5);
    ctx.lineTo(i - offset, state.groundLevel + 15);
    ctx.stroke();
  }
}

function renderShip(ctx: CanvasRenderingContext2D, state: PilotRunnerState): void {
  ctx.save();
  ctx.translate(state.shipX, state.shipY);
  ctx.rotate((state.shipAngle * Math.PI) / 180);
  ctx.scale(state.shipScale, state.shipScale);
  
  // Shadow
  if (state.phase === 'landing' || state.phase === 'pilot_exit' || state.phase === 'pilot_return') {
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

function renderPilot(ctx: CanvasRenderingContext2D, state: PilotRunnerState, time: number): void {
  const x = state.pilotX;
  const y = state.pilotY;
  const frame = Math.floor(state.pilotFrame);
  
  // Flash when invulnerable
  if (state.pilotInvulnerable > 0 && Math.floor(state.pilotInvulnerable / 4) % 2 === 0) {
    return;
  }
  
  ctx.save();
  ctx.translate(x, y);
  
  const dir = state.pilotFacingRight ? 1 : -1;
  ctx.scale(dir, 1);
  
  // Hover animation (no walking since on hoverboard)
  const hoverBob = Math.sin(time * 8) * 2;
  const tiltAngle = state.pilotOnGround ? Math.sin(time * 3) * 0.05 : -0.15; // Tilt back when jumping
  
  ctx.translate(0, hoverBob);
  ctx.rotate(tiltAngle);
  
  // === HOVERBOARD ===
  ctx.save();
  ctx.translate(0, 18);
  
  // Hoverboard glow underneath
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 15;
  const glowGrad = ctx.createRadialGradient(0, 8, 0, 0, 8, 25);
  glowGrad.addColorStop(0, 'rgba(0, 255, 255, 0.6)');
  glowGrad.addColorStop(0.5, 'rgba(0, 200, 255, 0.3)');
  glowGrad.addColorStop(1, 'rgba(0, 100, 255, 0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.ellipse(0, 6, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Hoverboard main body
  const boardGrad = ctx.createLinearGradient(-20, -4, 20, 4);
  boardGrad.addColorStop(0, '#1a1a2e');
  boardGrad.addColorStop(0.3, '#4a4a6e');
  boardGrad.addColorStop(0.5, '#6a6a9e');
  boardGrad.addColorStop(0.7, '#4a4a6e');
  boardGrad.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = boardGrad;
  ctx.beginPath();
  ctx.moveTo(-20, 0);
  ctx.quadraticCurveTo(-22, -3, -18, -4);
  ctx.lineTo(18, -4);
  ctx.quadraticCurveTo(22, -3, 20, 0);
  ctx.quadraticCurveTo(22, 3, 18, 4);
  ctx.lineTo(-18, 4);
  ctx.quadraticCurveTo(-22, 3, -20, 0);
  ctx.closePath();
  ctx.fill();
  
  // Hoverboard top surface
  const topGrad = ctx.createLinearGradient(-15, -4, 15, 0);
  topGrad.addColorStop(0, '#2a2a4e');
  topGrad.addColorStop(0.5, '#5a5abe');
  topGrad.addColorStop(1, '#2a2a4e');
  ctx.fillStyle = topGrad;
  ctx.fillRect(-15, -3, 30, 3);
  
  // Hoverboard energy strips
  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-12, 0);
  ctx.lineTo(12, 0);
  ctx.stroke();
  
  // Front and back thrusters
  const thrusterPulse = 0.5 + Math.sin(time * 20) * 0.3;
  ctx.fillStyle = `rgba(0, 255, 255, ${thrusterPulse})`;
  ctx.beginPath();
  ctx.ellipse(-16, 1, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(16, 1, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Thruster flames
  ctx.fillStyle = `rgba(100, 200, 255, ${thrusterPulse * 0.8})`;
  for (let i = 0; i < 3; i++) {
    const flameLen = 3 + Math.random() * 4;
    ctx.beginPath();
    ctx.moveTo(-16 - 2 + i * 2, 3);
    ctx.lineTo(-16 - 1 + i * 2, 3 + flameLen);
    ctx.lineTo(-16 + i * 2, 3);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(16 - 2 + i * 2, 3);
    ctx.lineTo(16 - 1 + i * 2, 3 + flameLen);
    ctx.lineTo(16 + i * 2, 3);
    ctx.fill();
  }
  
  ctx.shadowBlur = 0;
  ctx.restore();
  
  // === PILOT ON HOVERBOARD ===
  
  // Legs (bent, standing on board)
  ctx.strokeStyle = '#0066aa';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-3, 8);
  ctx.lineTo(-5, 14);
  ctx.lineTo(-4, 18);
  ctx.moveTo(3, 8);
  ctx.lineTo(5, 14);
  ctx.lineTo(4, 18);
  ctx.stroke();
  
  // Boots on board
  ctx.fillStyle = '#333344';
  ctx.fillRect(-7, 16, 6, 4);
  ctx.fillRect(1, 16, 6, 4);
  
  // Body (space suit)
  const suitGrad = ctx.createLinearGradient(-6, -2, 6, 12);
  suitGrad.addColorStop(0, '#00ddff');
  suitGrad.addColorStop(0.5, '#00aacc');
  suitGrad.addColorStop(1, '#008899');
  ctx.fillStyle = suitGrad;
  ctx.fillRect(-6, -2, 12, 12);
  
  // Suit detail lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-4, 0);
  ctx.lineTo(-4, 8);
  ctx.moveTo(4, 0);
  ctx.lineTo(4, 8);
  ctx.stroke();
  
  // Helmet
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, -8, 7, 0, Math.PI * 2);
  ctx.fill();
  
  // Helmet visor (glowing)
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 6;
  const visorGrad = ctx.createLinearGradient(-5, -11, 5, -6);
  visorGrad.addColorStop(0, '#00ffff');
  visorGrad.addColorStop(0.5, '#00ddee');
  visorGrad.addColorStop(1, '#00aaaa');
  ctx.fillStyle = visorGrad;
  ctx.fillRect(-5, -11, 10, 5);
  ctx.shadowBlur = 0;
  
  // Visor reflection
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillRect(-4, -10, 3, 2);
  
  // Arms
  ctx.strokeStyle = '#00aadd';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  
  // Back arm (relaxed)
  ctx.beginPath();
  ctx.moveTo(-5, 1);
  ctx.lineTo(-8, 6);
  ctx.stroke();
  
  // Gun arm with aim angle
  ctx.save();
  ctx.translate(5, 0);
  ctx.rotate(state.aimAngle * Math.PI / 180);
  
  // Arm
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(8, 0);
  ctx.stroke();
  
  // Gun
  ctx.fillStyle = '#555566';
  ctx.fillRect(6, -3, 12, 6);
  ctx.fillStyle = '#777788';
  ctx.fillRect(16, -2, 6, 4);
  
  // Gun barrel
  ctx.fillStyle = '#333344';
  ctx.fillRect(20, -1.5, 4, 3);
  
  // Muzzle flash when shooting
  if (state.fireTimer > 6) {
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffff88';
    ctx.beginPath();
    ctx.arc(24, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  
  ctx.restore();
  
  ctx.restore();
}

function renderMine(ctx: CanvasRenderingContext2D, mine: RunnerMine, time: number): void {
  ctx.save();
  ctx.translate(mine.x, mine.y);
  
  // Mine body - metallic cylinder
  const mineGrad = ctx.createLinearGradient(-8, -6, 8, 6);
  mineGrad.addColorStop(0, '#555555');
  mineGrad.addColorStop(0.3, '#888888');
  mineGrad.addColorStop(0.5, '#666666');
  mineGrad.addColorStop(0.7, '#444444');
  mineGrad.addColorStop(1, '#333333');
  ctx.fillStyle = mineGrad;
  
  // Main body
  ctx.beginPath();
  ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Top cap
  ctx.fillStyle = '#777777';
  ctx.beginPath();
  ctx.ellipse(0, -3, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Spikes around the mine
  ctx.fillStyle = '#444444';
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const sx = Math.cos(angle) * 9;
    const sy = Math.sin(angle) * 4;
    ctx.beginPath();
    ctx.moveTo(sx - 1, sy);
    ctx.lineTo(sx + Math.cos(angle) * 4, sy + Math.sin(angle) * 2);
    ctx.lineTo(sx + 1, sy);
    ctx.fill();
  }
  
  // Blinking warning light
  const blinkIntensity = Math.sin(mine.blinkPhase + time * 8) * 0.5 + 0.5;
  if (blinkIntensity > 0.3) {
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 10 * blinkIntensity;
    ctx.fillStyle = `rgba(255, ${50 * (1 - blinkIntensity)}, 0, ${blinkIntensity})`;
    ctx.beginPath();
    ctx.arc(0, -4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  
  // Danger stripes
  ctx.strokeStyle = '#ffaa00';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-5, 0);
  ctx.lineTo(-3, 0);
  ctx.moveTo(3, 0);
  ctx.lineTo(5, 0);
  ctx.stroke();
  
  ctx.restore();
}

function renderEnemy(ctx: CanvasRenderingContext2D, enemy: RunnerEnemy, time: number): void {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  
  switch (enemy.type) {
    case 'grunt':
      // Enhanced alien soldier with armor and glowing core
      const gruntScale = 1 + Math.sin(time * 4) * 0.02;
      ctx.scale(gruntScale, gruntScale);
      
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 5, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Legs with armor
      const gruntLegOff = Math.sin(enemy.frame) * 5;
      ctx.fillStyle = '#442222';
      ctx.fillRect(-9, 2, 7, 14 + gruntLegOff);
      ctx.fillRect(2, 2, 7, 14 - gruntLegOff);
      
      // Leg armor plates
      ctx.fillStyle = '#663333';
      ctx.fillRect(-8, 4, 5, 4);
      ctx.fillRect(3, 4, 5, 4);
      
      // Body with layered armor
      const gruntBodyGrad = ctx.createLinearGradient(-12, -22, 12, 5);
      gruntBodyGrad.addColorStop(0, '#dd5555');
      gruntBodyGrad.addColorStop(0.3, '#cc4444');
      gruntBodyGrad.addColorStop(0.7, '#aa3333');
      gruntBodyGrad.addColorStop(1, '#772222');
      ctx.fillStyle = gruntBodyGrad;
      ctx.beginPath();
      ctx.moveTo(-11, 3);
      ctx.lineTo(-13, -8);
      ctx.lineTo(-10, -20);
      ctx.lineTo(10, -20);
      ctx.lineTo(13, -8);
      ctx.lineTo(11, 3);
      ctx.closePath();
      ctx.fill();
      
      // Armor chest plate
      ctx.fillStyle = '#993333';
      ctx.beginPath();
      ctx.moveTo(-6, -5);
      ctx.lineTo(-8, -15);
      ctx.lineTo(8, -15);
      ctx.lineTo(6, -5);
      ctx.closePath();
      ctx.fill();
      
      // Glowing core
      ctx.shadowColor = '#ff6600';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ff8844';
      ctx.beginPath();
      ctx.arc(0, -10, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Head with helmet
      const headGrad = ctx.createRadialGradient(-2, -28, 0, 0, -26, 12);
      headGrad.addColorStop(0, '#ee7777');
      headGrad.addColorStop(0.7, '#bb4444');
      headGrad.addColorStop(1, '#882222');
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.arc(0, -26, 9, 0, Math.PI * 2);
      ctx.fill();
      
      // Helmet ridge
      ctx.strokeStyle = '#663333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -26, 9, -Math.PI * 0.8, -Math.PI * 0.2);
      ctx.stroke();
      
      // Angry glowing eyes
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.ellipse(-4, -28, 3, 2, -0.2, 0, Math.PI * 2);
      ctx.ellipse(4, -28, 3, 2, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Eye pupils
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(-4, -28, 1, 0, Math.PI * 2);
      ctx.arc(4, -28, 1, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'jumper':
      // Alien blob creature with animated tentacles
      const stretch = enemy.onGround ? 1 : 0.7;
      const squish = enemy.onGround ? 1 : 1.4;
      ctx.scale(squish, stretch);
      
      // Tentacles (animated)
      ctx.strokeStyle = '#33aa33';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      for (let i = 0; i < 6; i++) {
        const tentacleAngle = (Math.PI * 0.6) + (i / 5) * Math.PI * 0.8;
        const wave = Math.sin(time * 6 + i * 1.5) * 8;
        const wave2 = Math.cos(time * 4 + i * 2) * 5;
        const baseX = Math.cos(tentacleAngle) * 10;
        const baseY = Math.sin(tentacleAngle) * 8 + 5;
        const midX = baseX + Math.cos(tentacleAngle) * 12 + wave;
        const midY = baseY + 8 + Math.abs(wave) * 0.3;
        const endX = midX + Math.cos(tentacleAngle + wave2 * 0.05) * 10;
        const endY = midY + 6;
        
        // Tentacle gradient
        const tentGrad = ctx.createLinearGradient(baseX, baseY, endX, endY);
        tentGrad.addColorStop(0, '#44cc44');
        tentGrad.addColorStop(0.5, '#33aa33');
        tentGrad.addColorStop(1, '#228822');
        ctx.strokeStyle = tentGrad;
        ctx.lineWidth = 4 - i * 0.3;
        
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.quadraticCurveTo(midX, midY, endX, endY);
        ctx.stroke();
        
        // Suction cups
        ctx.fillStyle = '#55dd55';
        ctx.beginPath();
        ctx.arc(endX, endY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Main body
      const jumperGrad = ctx.createRadialGradient(0, -5, 0, 0, -5, 18);
      jumperGrad.addColorStop(0, '#88ff88');
      jumperGrad.addColorStop(0.4, '#55cc55');
      jumperGrad.addColorStop(0.8, '#33aa33');
      jumperGrad.addColorStop(1, '#227722');
      ctx.fillStyle = jumperGrad;
      ctx.beginPath();
      ctx.ellipse(0, -5, 14, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Body texture spots
      ctx.fillStyle = 'rgba(0, 80, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(-5, -8, 4, 0, Math.PI * 2);
      ctx.arc(6, -3, 3, 0, Math.PI * 2);
      ctx.arc(-2, 2, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Large alien eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-5, -12, 5, 6, -0.2, 0, Math.PI * 2);
      ctx.ellipse(5, -12, 5, 6, 0.2, 0, Math.PI * 2);
      ctx.fill();
      
      // Glowing red pupils
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#ff3333';
      ctx.beginPath();
      const pupilMove = Math.sin(time * 3) * 1.5;
      ctx.arc(-5 + pupilMove, -12, 2.5, 0, Math.PI * 2);
      ctx.arc(5 + pupilMove, -12, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Pupil highlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-6 + pupilMove, -13, 1, 0, Math.PI * 2);
      ctx.arc(4 + pupilMove, -13, 1, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'flyer':
      // Alien drone with energy wings and tentacle appendages
      const flyerBob = Math.sin(time * 8) * 3;
      ctx.translate(0, flyerBob);
      
      // Energy wing trails
      ctx.globalAlpha = 0.4;
      const wingPulse = Math.sin(time * 15) * 0.3 + 0.7;
      const wingGrad = ctx.createLinearGradient(-25, 0, 25, 0);
      wingGrad.addColorStop(0, 'transparent');
      wingGrad.addColorStop(0.3, `rgba(100, 150, 255, ${wingPulse})`);
      wingGrad.addColorStop(0.5, `rgba(150, 180, 255, ${wingPulse})`);
      wingGrad.addColorStop(0.7, `rgba(100, 150, 255, ${wingPulse})`);
      wingGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = wingGrad;
      ctx.fillRect(-30, -8, 60, 16);
      ctx.globalAlpha = 1;
      
      // Dangling tentacles
      ctx.strokeStyle = '#6666aa';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const tX = -8 + i * 5;
        const wave = Math.sin(time * 5 + i * 1.2) * 4;
        ctx.beginPath();
        ctx.moveTo(tX, 8);
        ctx.quadraticCurveTo(tX + wave, 18, tX + wave * 0.5, 25);
        ctx.stroke();
        
        // Tentacle tips
        ctx.fillStyle = '#8888cc';
        ctx.beginPath();
        ctx.arc(tX + wave * 0.5, 25, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Main body
      const flyerGrad = ctx.createLinearGradient(-18, -12, 18, 12);
      flyerGrad.addColorStop(0, '#aaaaee');
      flyerGrad.addColorStop(0.3, '#8888cc');
      flyerGrad.addColorStop(0.7, '#6666aa');
      flyerGrad.addColorStop(1, '#444488');
      ctx.fillStyle = flyerGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Body segments
      ctx.strokeStyle = '#444466';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 12, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-10, -10);
      ctx.lineTo(-10, 10);
      ctx.moveTo(10, -10);
      ctx.lineTo(10, 10);
      ctx.stroke();
      
      // Central glowing eye
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 15;
      const eyeGrad = ctx.createRadialGradient(12, 0, 0, 12, 0, 8);
      eyeGrad.addColorStop(0, '#ffffff');
      eyeGrad.addColorStop(0.3, '#ff6666');
      eyeGrad.addColorStop(0.7, '#ff0000');
      eyeGrad.addColorStop(1, '#880000');
      ctx.fillStyle = eyeGrad;
      ctx.beginPath();
      ctx.arc(12, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Eye detail
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(14, -2, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Propulsion glow
      ctx.shadowColor = '#00aaff';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#00ccff';
      const propSize = 4 + Math.sin(time * 20) * 2;
      ctx.beginPath();
      ctx.arc(-18, 0, propSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      break;
      
    case 'turret':
      // Enhanced mechanical turret with energy core
      const turretPulse = Math.sin(time * 3) * 0.1 + 1;
      
      // Base with treads
      ctx.fillStyle = '#333333';
      ctx.fillRect(-18, 0, 36, 8);
      
      // Tread details
      ctx.fillStyle = '#222222';
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(-16 + i * 6, 1, 4, 6);
      }
      
      // Main body
      const baseGrad = ctx.createLinearGradient(-16, -12, 16, 8);
      baseGrad.addColorStop(0, '#888888');
      baseGrad.addColorStop(0.3, '#666666');
      baseGrad.addColorStop(0.7, '#555555');
      baseGrad.addColorStop(1, '#333333');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(-16, -10, 32, 14);
      
      // Armored panels
      ctx.fillStyle = '#777777';
      ctx.beginPath();
      ctx.moveTo(-14, -10);
      ctx.lineTo(-18, -4);
      ctx.lineTo(-18, 2);
      ctx.lineTo(-14, 4);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(14, -10);
      ctx.lineTo(18, -4);
      ctx.lineTo(18, 2);
      ctx.lineTo(14, 4);
      ctx.closePath();
      ctx.fill();
      
      // Rotating dome
      const domeGrad = ctx.createRadialGradient(0, -14, 0, 0, -12, 14);
      domeGrad.addColorStop(0, '#aaaaaa');
      domeGrad.addColorStop(0.5, '#777777');
      domeGrad.addColorStop(1, '#444444');
      ctx.fillStyle = domeGrad;
      ctx.beginPath();
      ctx.arc(0, -10, 12 * turretPulse, 0, Math.PI * 2);
      ctx.fill();
      
      // Barrel housing
      ctx.fillStyle = '#555555';
      ctx.fillRect(-5, -28, 10, 18);
      
      // Double barrel
      ctx.fillStyle = '#333333';
      ctx.fillRect(-4, -32, 3, 22);
      ctx.fillRect(1, -32, 3, 22);
      
      // Barrel tips with glow
      ctx.shadowColor = '#ff4400';
      ctx.shadowBlur = 6;
      ctx.fillStyle = '#ff6644';
      ctx.fillRect(-4, -34, 3, 3);
      ctx.fillRect(1, -34, 3, 3);
      ctx.shadowBlur = 0;
      
      // Energy core
      const coreGlow = Math.sin(time * 6) > 0;
      if (coreGlow) {
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(0, -10, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      
      // Warning indicator
      const blink = Math.sin(time * 8) > 0.5;
      if (blink) {
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(0, -22, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      break;
  }
  
  ctx.restore();
}

function renderScanlines(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
  for (let y = 0; y < GAME_CONFIG.canvasHeight; y += 4) {
    ctx.fillRect(0, y, GAME_CONFIG.canvasWidth, 2);
  }
}

function renderUI(ctx: CanvasRenderingContext2D, state: PilotRunnerState): void {
  const { canvasWidth, canvasHeight } = GAME_CONFIG;
  
  // Health bar background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(18, 18, 154, 24);
  
  // Health bar
  const healthPercent = state.pilotHealth / state.maxPilotHealth;
  const healthColor = healthPercent > 0.5 ? '#44dd44' : healthPercent > 0.25 ? '#dddd44' : '#dd4444';
  ctx.fillStyle = healthColor;
  ctx.fillRect(20, 20, 150 * healthPercent, 20);
  
  // Health bar border
  ctx.strokeStyle = healthColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(18, 18, 154, 24);
  
  // Health text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(`HEALTH: ${state.pilotHealth}`, 25, 35);
  
  // Distance progress background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(canvasWidth - 172, 18, 154, 24);
  
  // Distance progress
  const progress = Math.min(1, state.distance / state.targetDistance);
  ctx.fillStyle = '#4488ff';
  ctx.fillRect(canvasWidth - 170, 20, 150 * progress, 20);
  
  // Distance progress border
  ctx.strokeStyle = '#4488ff';
  ctx.strokeRect(canvasWidth - 172, 18, 154, 24);
  
  // Distance text
  ctx.fillText(`${Math.floor(state.distance)}m / ${state.targetDistance}m`, canvasWidth - 165, 35);
  
  // Score
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = '#ffcc00';
  ctx.textAlign = 'center';
  ctx.fillText(`SCORE: ${state.bonusScore}`, canvasWidth / 2, 35);
  
  // Enemies defeated
  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = '#ff8866';
  ctx.fillText(`ENEMIES: ${state.enemiesDefeated}`, canvasWidth / 2, 52);
  ctx.textAlign = 'left';
  
  // Aim indicator (small arc showing current aim angle)
  if (state.phase === 'running') {
    const indicatorX = 50;
    const indicatorY = GAME_CONFIG.canvasHeight - 50;
    
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, 25, -Math.PI/2, 0);
    ctx.stroke();
    
    // Current aim
    const aimRad = (state.aimAngle - (state.pilotFacingRight ? 0 : 180)) * Math.PI / 180;
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(indicatorX, indicatorY);
    ctx.lineTo(indicatorX + Math.cos(aimRad) * 25, indicatorY + Math.sin(aimRad) * 25);
    ctx.stroke();
    
    ctx.fillStyle = '#00ffff';
    ctx.font = '10px monospace';
    ctx.fillText('AIM', indicatorX - 10, indicatorY + 35);
  }
  
  // Phase indicators
  if (state.phase === 'approaching' || state.phase === 'landing') {
    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('LANDING...', canvasWidth / 2, 100);
    ctx.textAlign = 'left';
  }
  
  if (state.phase === 'running' && state.distance < 150) {
    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = '#00ff00';
    ctx.textAlign = 'center';
    ctx.fillText('RUN & GUN!', canvasWidth / 2, 100);
    ctx.font = '14px monospace';
    ctx.fillStyle = '#88ff88';
    ctx.fillText('Aim with touch or arrow keys', canvasWidth / 2, 120);
    ctx.textAlign = 'left';
  }
  
  if (state.phase === 'pilot_return' || state.phase === 'takeoff') {
    ctx.font = 'bold 26px monospace';
    ctx.fillStyle = '#00ff00';
    ctx.textAlign = 'center';
    ctx.fillText('MISSION COMPLETE!', canvasWidth / 2, 100);
    ctx.font = '18px monospace';
    ctx.fillText(`BONUS: +${state.bonusScore}`, canvasWidth / 2, 130);
    ctx.textAlign = 'left';
  }
  
  // Show results screen during showing_results phase
  if (state.phase === 'showing_results') {
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Check if mission was successful (pilot survived and reached target distance)
    const isVictory = state.pilotHealth > 0 && state.distance >= state.targetDistance;
    
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
      ctx.fillText('PILOT DOWN', canvasWidth / 2, canvasHeight / 2 - 20);
    }
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`TOTAL BONUS: ${state.bonusScore}`, canvasWidth / 2, canvasHeight / 2 + 15);
    ctx.font = '18px monospace';
    ctx.fillText(`Distance: ${Math.floor(state.distance)}m`, canvasWidth / 2, canvasHeight / 2 + 45);
    ctx.fillText(`Enemies Defeated: ${state.enemiesDefeated}`, canvasWidth / 2, canvasHeight / 2 + 70);
    
    // Tap to continue
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px monospace';
    if (Math.floor(Date.now() / 500) % 2 === 0) {
      ctx.fillText('TAP TO CONTINUE', canvasWidth / 2, canvasHeight / 2 + 110);
    }
    ctx.restore();
  }
}
