// Arena Mode - 360° Defense Bonus Level
// Ship locked in center, rotates to face enemies attacking from all directions
import { generateId } from './utils';
import { GAME_CONFIG } from './constants';
import { drawMegaShip } from './megaShipRenderer';
import { getStoredMegaShipId } from '@/hooks/useMegaShips';
import { getStoredSkinColors } from '@/hooks/useEquipment';

export type ArenaPhase = 
  | 'entering'       // Ship flies to center
  | 'defense'        // Main gameplay - defend from all sides
  | 'boss'           // Boss wave
  | 'victory'        // Celebration
  | 'showing_results' // Show results and wait for tap
  | 'complete';      // Return to normal gameplay

export interface ArenaEnemy {
  id: string;
  x: number;
  y: number;
  angle: number;        // Angle from center
  distance: number;     // Distance from center
  speed: number;
  size: number;
  health: number;
  maxHealth: number;
  type: 'asteroid' | 'seeker' | 'spinner' | 'splitter' | 'boss';
  rotation: number;
  rotationSpeed: number;
  behaviorTimer: number;
  splitCount?: number;  // For splitters - how many times it can split
}

export interface ArenaProjectile {
  id: string;
  x: number;
  y: number;
  angle: number;
  speed: number;
  damage: number;
  isPlayer: boolean;
  size: number;
  trail: { x: number; y: number; alpha: number }[];
}

export interface ArenaExplosion {
  id: string;
  x: number;
  y: number;
  frame: number;
  maxFrames: number;
  size: number;
  color: string;
}

export interface ArenaParticle {
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

export interface ArenaState {
  phase: ArenaPhase;
  phaseTimer: number;
  
  // Ship state (centered, but rotates)
  shipAngle: number;        // Current facing angle (radians)
  targetAngle: number;      // Target angle to rotate towards
  shipScale: number;
  
  // Gameplay
  enemies: ArenaEnemy[];
  projectiles: ArenaProjectile[];
  explosions: ArenaExplosion[];
  particles: ArenaParticle[];
  
  // Wave management
  currentWave: number;
  maxWaves: number;
  enemiesDefeated: number;
  enemiesInWave: number;
  spawnTimer: number;
  waveComplete: boolean;
  waveTransitionTimer: number;
  
  // Player state
  fireTimer: number;
  health: number;
  maxHealth: number;
  invulnerableTimer: number;
  
  // Scoring
  bonusScore: number;
  combo: number;
  comboTimer: number;
  
  // Visual variation
  variant: number;
  bgColor1: string;
  bgColor2: string;
  
  // Sound triggers
  soundQueue: string[];
  
  // Input state for results screen
  inputReleased: boolean;
}

// Arena visual variants
const ARENA_VARIANTS = [
  { bgColor1: '#0a0020', bgColor2: '#200030', name: 'Void Rift' },
  { bgColor1: '#001020', bgColor2: '#002040', name: 'Deep Space' },
  { bgColor1: '#100010', bgColor2: '#300020', name: 'Crimson Nebula' },
  { bgColor1: '#002010', bgColor2: '#004030', name: 'Emerald Sector' },
];

// Audio context for sound effects
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

export function playArenaSound(type: 'shoot' | 'explosion' | 'hit' | 'powerup' | 'spawn'): void {
  try {
    const ctx = getAudioContext();
    
    switch (type) {
      case 'shoot': {
        // Laser shot sound
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        
        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(ctx.destination);
        gain2.connect(ctx.destination);
        
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(1000, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
        gain1.gain.setValueAtTime(0.12, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(500, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.12);
        gain2.gain.setValueAtTime(0.08, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.1);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.12);
        break;
      }
      
      case 'explosion': {
        // Big explosion sound
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
        osc1.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.4);
        gain1.gain.setValueAtTime(0.2, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(100, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.3);
        gain2.gain.setValueAtTime(0.15, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        noise.type = 'triangle';
        noise.frequency.setValueAtTime(80, ctx.currentTime);
        noise.frequency.exponentialRampToValueAtTime(15, ctx.currentTime + 0.5);
        gainNoise.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNoise.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.4);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.3);
        noise.start(ctx.currentTime);
        noise.stop(ctx.currentTime + 0.5);
        break;
      }
      
      case 'hit': {
        // Small hit sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.06);
        break;
      }
      
      case 'powerup': {
        // Power-up/wave complete sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
        break;
      }
      
      case 'spawn': {
        // Enemy spawn warning
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.setValueAtTime(300, ctx.currentTime + 0.05);
        osc.frequency.setValueAtTime(200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.12);
        break;
      }
    }
  } catch (e) {
    // Audio context not available
  }
}

// Check if a level should be an arena level
export function isArenaLevel(mapId: number): boolean {
  // Arena every 7th map starting at map 7
  return mapId >= 7 && (mapId - 7) % 7 === 0;
}

export function createArenaState(mapId: number): ArenaState {
  const variantIndex = Math.floor(mapId / 7) % ARENA_VARIANTS.length;
  const variant = ARENA_VARIANTS[variantIndex];
  
  // Difficulty scaling
  const difficultyMultiplier = 1 + (mapId / 14) * 0.5;
  
  return {
    phase: 'entering',
    phaseTimer: 120,
    
    shipAngle: -Math.PI / 2, // Facing up initially
    targetAngle: -Math.PI / 2,
    shipScale: 0.1,
    
    enemies: [],
    projectiles: [],
    explosions: [],
    particles: [],
    
    currentWave: 0,
    maxWaves: Math.min(3 + Math.floor(mapId / 14), 6),
    enemiesDefeated: 0,
    enemiesInWave: 0,
    spawnTimer: 0,
    waveComplete: false,
    waveTransitionTimer: 0,
    
    fireTimer: 0,
    health: 100,
    maxHealth: 100,
    invulnerableTimer: 0,
    
    bonusScore: 0,
    combo: 0,
    comboTimer: 0,
    
    variant: variantIndex,
    bgColor1: variant.bgColor1,
    bgColor2: variant.bgColor2,
    
    soundQueue: [],
    
    inputReleased: false,
  };
}

export function updateArenaState(
  state: ArenaState, 
  input: { touchX: number; touchY: number; isTouching: boolean; fire: boolean }
): ArenaState {
  // Deep copy arrays to avoid mutation issues
  let newState: ArenaState = { 
    ...state,
    enemies: [...state.enemies],
    projectiles: [...state.projectiles],
    explosions: [...state.explosions],
    particles: [...state.particles],
    soundQueue: [],
  };
  
  const centerX = GAME_CONFIG.canvasWidth / 2;
  const centerY = GAME_CONFIG.canvasHeight / 2;
  
  switch (newState.phase) {
    case 'entering':
      newState = updateEnteringPhase(newState, centerX, centerY);
      break;
    case 'defense':
      newState = updateDefensePhase(newState, input, centerX, centerY);
      break;
    case 'boss':
      newState = updateBossPhase(newState, input, centerX, centerY);
      break;
    case 'victory':
      newState = updateVictoryPhase(newState, centerX, centerY);
      break;
    case 'showing_results':
      // Wait for input lock, then require release before accepting new tap
      if (newState.phaseTimer > 0) {
        newState.phaseTimer--;
      } else {
        // Track if input was released
        if (!input.isTouching && !input.fire) {
          newState.inputReleased = true;
        }
        // Only accept input after it was released (fresh tap)
        if (newState.inputReleased && (input.isTouching || input.fire)) {
          newState.phase = 'complete';
        }
      }
      break;
    case 'complete':
      // Do nothing, game will transition back to playing state
      break;
  }
  
  // Play queued sounds
  newState.soundQueue.forEach(sound => {
    playArenaSound(sound as any);
  });
  
  return newState;
}

function updateEnteringPhase(state: ArenaState, centerX: number, centerY: number): ArenaState {
  let newState = { 
    ...state,
    particles: [...state.particles],
    soundQueue: [...state.soundQueue],
  };
  newState.phaseTimer--;
  
  // Scale up ship
  newState.shipScale = Math.min(1, newState.shipScale + 0.015);
  
  // Create entrance particles
  if (newState.phaseTimer % 3 === 0) {
    const angle = Math.random() * Math.PI * 2;
    newState.particles = [...newState.particles, {
      id: generateId(),
      x: centerX + Math.cos(angle) * 50,
      y: centerY + Math.sin(angle) * 50,
      vx: Math.cos(angle) * 2,
      vy: Math.sin(angle) * 2,
      size: 2 + Math.random() * 3,
      color: '#00ffff',
      life: 30,
      maxLife: 30,
    }];
  }
  
  if (newState.phaseTimer <= 0) {
    newState.phase = 'defense';
    newState.currentWave = 1;
    newState.spawnTimer = 60;
    newState.enemiesInWave = getWaveEnemyCount(1, state.maxWaves);
    newState.soundQueue = [...newState.soundQueue, 'powerup'];
  }
  
  newState.particles = updateParticles(newState.particles);
  
  return newState;
}

function updateDefensePhase(
  state: ArenaState, 
  input: { touchX: number; touchY: number; isTouching: boolean; fire: boolean },
  centerX: number,
  centerY: number
): ArenaState {
  let newState = { 
    ...state,
    projectiles: [...state.projectiles],
    enemies: [...state.enemies],
    explosions: [...state.explosions],
    particles: [...state.particles],
    soundQueue: [...state.soundQueue],
  };
  
  // Calculate target angle from input
  if (input.isTouching) {
    const dx = input.touchX - centerX;
    const dy = input.touchY - centerY;
    newState.targetAngle = Math.atan2(dy, dx);
  }
  
  // Smoothly rotate ship towards target
  newState.shipAngle = lerpAngle(newState.shipAngle, newState.targetAngle, 0.15);
  
  // Update timers
  if (newState.fireTimer > 0) newState.fireTimer--;
  if (newState.invulnerableTimer > 0) newState.invulnerableTimer--;
  if (newState.comboTimer > 0) {
    newState.comboTimer--;
    if (newState.comboTimer <= 0) newState.combo = 0;
  }
  
  // Fire projectiles
  if ((input.fire || input.isTouching) && newState.fireTimer <= 0) {
    newState.projectiles = [...newState.projectiles, createPlayerProjectile(centerX, centerY, newState.shipAngle)];
    newState.fireTimer = 8;
    newState.soundQueue = [...newState.soundQueue, 'shoot'];
  }
  
  // Spawn enemies
  if (newState.spawnTimer > 0) {
    newState.spawnTimer--;
  } else if (newState.enemies.length < newState.enemiesInWave && 
             newState.enemiesDefeated + newState.enemies.length < newState.enemiesInWave) {
    newState = spawnArenaEnemy(newState, centerX, centerY);
    newState.spawnTimer = 40 + Math.random() * 30;
  }
  
  // Update game objects
  const enemyUpdate = updateArenaEnemies(newState.enemies, centerX, centerY);
  newState.enemies = enemyUpdate.enemies;
  newState.enemiesDefeated += enemyUpdate.passedCount; // Count passed enemies as defeated
  newState.projectiles = updateProjectiles(newState.projectiles);
  newState.explosions = updateExplosions(newState.explosions);
  newState.particles = updateParticles(newState.particles);
  
  // Check collisions
  newState = checkArenaCollisions(newState, centerX, centerY);
  
  // Wave completion check - only trigger once when wave is just completed
  if (!newState.waveComplete && newState.enemiesDefeated >= newState.enemiesInWave && newState.enemies.length === 0) {
    if (newState.currentWave >= newState.maxWaves) {
      newState.phase = 'boss';
      newState.phaseTimer = 60;
      newState.spawnTimer = 0;
    } else {
      newState.waveComplete = true;
      newState.waveTransitionTimer = 120; // Give more time for wave complete display
      newState.bonusScore += 500 * newState.currentWave;
      newState.soundQueue = [...newState.soundQueue, 'powerup'];
    }
  }
  
  // Handle wave transition - countdown and start next wave
  if (newState.waveComplete) {
    newState.waveTransitionTimer--;
    if (newState.waveTransitionTimer <= 0) {
      const nextWave = newState.currentWave + 1;
      newState.currentWave = nextWave;
      newState.enemiesDefeated = 0;
      newState.enemiesInWave = getWaveEnemyCount(nextWave, newState.maxWaves);
      newState.spawnTimer = 60;
      newState.waveComplete = false;
    }
  }
  
  return newState;
}

function updateBossPhase(
  state: ArenaState,
  input: { touchX: number; touchY: number; isTouching: boolean; fire: boolean },
  centerX: number,
  centerY: number
): ArenaState {
  let newState = { 
    ...state,
    projectiles: [...state.projectiles],
    enemies: [...state.enemies],
    explosions: [...state.explosions],
    particles: [...state.particles],
    soundQueue: [...state.soundQueue],
  };
  
  // Spawn boss if needed
  if (newState.phaseTimer > 0) {
    newState.phaseTimer--;
    if (newState.phaseTimer <= 0 && newState.enemies.length === 0) {
      // Spawn boss - start from top, at orbit distance
      const bossStartAngle = -Math.PI / 2; // Start from top
      const bossStartDistance = 300; // Start at edge of screen
      newState.enemies = [...newState.enemies, {
        id: generateId(),
        x: centerX + Math.cos(bossStartAngle) * bossStartDistance,
        y: centerY + Math.sin(bossStartAngle) * bossStartDistance,
        angle: bossStartAngle,
        distance: bossStartDistance,
        speed: 0.5,
        size: 80,
        health: 30, // Reduced from 50 for faster kills
        maxHealth: 30,
        type: 'boss' as const,
        rotation: 0,
        rotationSpeed: 0.02,
        behaviorTimer: 0,
      }];
      newState.soundQueue = [...newState.soundQueue, 'explosion'];
    }
    return newState;
  }
  
  // Same controls as defense phase
  if (input.isTouching) {
    const dx = input.touchX - centerX;
    const dy = input.touchY - centerY;
    newState.targetAngle = Math.atan2(dy, dx);
  }
  
  newState.shipAngle = lerpAngle(newState.shipAngle, newState.targetAngle, 0.15);
  
  if (newState.fireTimer > 0) newState.fireTimer--;
  if (newState.invulnerableTimer > 0) newState.invulnerableTimer--;
  if (newState.comboTimer > 0) {
    newState.comboTimer--;
    if (newState.comboTimer <= 0) newState.combo = 0;
  }
  
  if ((input.fire || input.isTouching) && newState.fireTimer <= 0) {
    newState.projectiles = [...newState.projectiles, createPlayerProjectile(centerX, centerY, newState.shipAngle)];
    newState.fireTimer = 8;
    newState.soundQueue = [...newState.soundQueue, 'shoot'];
  }
  
  // Update game objects
  const enemyUpdate = updateArenaEnemies(newState.enemies, centerX, centerY);
  newState.enemies = enemyUpdate.enemies;
  // In boss phase, passed enemies don't count (boss shouldn't pass through)
  newState.projectiles = updateProjectiles(newState.projectiles);
  newState.explosions = updateExplosions(newState.explosions);
  newState.particles = updateParticles(newState.particles);
  
  // Check collisions
  newState = checkArenaCollisions(newState, centerX, centerY);
  
  // Boss defeated
  if (newState.enemies.length === 0) {
    newState.phase = 'victory';
    newState.phaseTimer = 180;
    newState.bonusScore += 2000;
    newState.soundQueue = [...newState.soundQueue, 'powerup'];
  }
  
  return newState;
}

function updateVictoryPhase(state: ArenaState, centerX: number, centerY: number): ArenaState {
  let newState = { 
    ...state,
    particles: [...state.particles],
    soundQueue: [...state.soundQueue],
  };
  newState.phaseTimer--;
  
  // Victory particles
  if (newState.phaseTimer % 5 === 0) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 30 + Math.random() * 50;
    const colors = ['#ffff00', '#00ffff', '#ff00ff', '#00ff00', '#ff8800'];
    newState.particles = [...newState.particles, {
      id: generateId(),
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
      vx: Math.cos(angle) * (2 + Math.random() * 3),
      vy: Math.sin(angle) * (2 + Math.random() * 3),
      size: 3 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 40,
      maxLife: 40,
    }];
  }
  
  // Slowly shrink ship
  if (newState.phaseTimer < 60) {
    newState.shipScale = Math.max(0, newState.shipScale - 0.02);
  }
  
  if (newState.phaseTimer <= 0) {
    newState.phase = 'showing_results';
    newState.phaseTimer = 120; // 2 second lock so results can be seen
    newState.inputReleased = false; // Reset input released state
  }
  
  newState.particles = updateParticles(newState.particles);
  
  return newState;
}

// Helper functions
function getWaveEnemyCount(wave: number, maxWaves: number): number {
  return 5 + wave * 3;
}

function lerpAngle(current: number, target: number, t: number): number {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return current + diff * t;
}

function createPlayerProjectile(x: number, y: number, angle: number): ArenaProjectile {
  const speed = 12;
  const offsetDistance = 35;
  return {
    id: generateId(),
    x: x + Math.cos(angle) * offsetDistance,
    y: y + Math.sin(angle) * offsetDistance,
    angle,
    speed,
    damage: 1,
    isPlayer: true,
    size: 4,
    trail: [],
  };
}

function spawnArenaEnemy(state: ArenaState, centerX: number, centerY: number): ArenaState {
  // Random spawn angle
  const angle = Math.random() * Math.PI * 2;
  const spawnDistance = Math.max(GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight) / 2 + 100;
  
  // Enemy type based on wave
  const types: ArenaEnemy['type'][] = ['asteroid', 'seeker', 'spinner'];
  if (state.currentWave >= 2) types.push('splitter');
  const type = types[Math.floor(Math.random() * types.length)];
  
  const baseSpeed = 0.8 + state.currentWave * 0.2;
  
  const enemy: ArenaEnemy = {
    id: generateId(),
    x: centerX + Math.cos(angle) * spawnDistance,
    y: centerY + Math.sin(angle) * spawnDistance,
    angle: angle + Math.PI, // Face center
    distance: spawnDistance,
    speed: baseSpeed + Math.random() * 0.5,
    size: type === 'asteroid' ? 25 + Math.random() * 20 : 20 + Math.random() * 10,
    health: type === 'splitter' ? 2 : (type === 'spinner' ? 3 : 1),
    maxHealth: type === 'splitter' ? 2 : (type === 'spinner' ? 3 : 1),
    type,
    rotation: 0,
    rotationSpeed: (Math.random() - 0.5) * 0.1,
    behaviorTimer: 0,
    splitCount: type === 'splitter' ? 1 : 0,
  };
  
  return {
    ...state,
    enemies: [...state.enemies, enemy],
  };
}

// Returns { enemies, passedCount } - passedCount is how many enemies passed through center
function updateArenaEnemies(enemies: ArenaEnemy[], centerX: number, centerY: number): { enemies: ArenaEnemy[], passedCount: number } {
  const shipRadius = 25; // Distance at which enemy has passed the player
  let passedCount = 0;
  
  const updatedEnemies = enemies.map(enemy => {
    let e = { ...enemy };
    e.rotation += e.rotationSpeed;
    e.behaviorTimer++;
    
    // Move towards center
    const dx = centerX - e.x;
    const dy = centerY - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 10) {
      const moveAngle = Math.atan2(dy, dx);
      
      switch (e.type) {
        case 'asteroid':
          // Straight line
          e.x += Math.cos(moveAngle) * e.speed;
          e.y += Math.sin(moveAngle) * e.speed;
          break;
        case 'seeker':
          // Smooth homing
          e.angle = lerpAngle(e.angle, moveAngle, 0.05);
          e.x += Math.cos(e.angle) * e.speed * 1.2;
          e.y += Math.sin(e.angle) * e.speed * 1.2;
          break;
        case 'spinner':
          // Spiral inward
          const spiralAngle = moveAngle + Math.sin(e.behaviorTimer * 0.05) * 0.5;
          e.x += Math.cos(spiralAngle) * e.speed * 0.8;
          e.y += Math.sin(spiralAngle) * e.speed * 0.8;
          break;
        case 'splitter':
          // Zigzag
          const zigzag = Math.sin(e.behaviorTimer * 0.1) * 30;
          const perpAngle = moveAngle + Math.PI / 2;
          e.x += Math.cos(moveAngle) * e.speed + Math.cos(perpAngle) * Math.cos(e.behaviorTimer * 0.1) * 0.5;
          e.y += Math.sin(moveAngle) * e.speed + Math.sin(perpAngle) * Math.cos(e.behaviorTimer * 0.1) * 0.5;
          break;
        case 'boss':
          // Orbit around center while slowly moving closer
          const orbitSpeed = 0.015; // Faster orbit
          const orbitAngle = e.behaviorTimer * orbitSpeed;
          const currentDist = Math.sqrt((e.x - centerX) ** 2 + (e.y - centerY) ** 2);
          // Slowly approach to minimum distance of 120
          const minDist = 120;
          const approachRate = 0.3;
          const newDist = Math.max(minDist, currentDist - approachRate);
          e.x = centerX + Math.cos(orbitAngle) * newDist;
          e.y = centerY + Math.sin(orbitAngle) * newDist;
          break;
      }
    }
    
    e.distance = dist;
    return e;
  });
  
  // Filter and count passed enemies
  const survivingEnemies = updatedEnemies.filter(e => {
    // Remove enemies that passed through center (missed by player) - except boss
    if (e.type === 'boss') return e.distance < 1000;
    
    // Enemy passed through center - count it
    if (e.distance <= shipRadius) {
      passedCount++;
      return false;
    }
    
    return e.distance < 1000;
  });
  
  return { enemies: survivingEnemies, passedCount };
}

function updateProjectiles(projectiles: ArenaProjectile[]): ArenaProjectile[] {
  return projectiles.map(p => {
    let proj = { ...p };
    
    // Update trail
    proj.trail = [...proj.trail, { x: proj.x, y: proj.y, alpha: 1 }]
      .map(t => ({ ...t, alpha: t.alpha - 0.15 }))
      .filter(t => t.alpha > 0)
      .slice(-8);
    
    // Move
    proj.x += Math.cos(proj.angle) * proj.speed;
    proj.y += Math.sin(proj.angle) * proj.speed;
    
    return proj;
  }).filter(p => 
    p.x > -50 && p.x < GAME_CONFIG.canvasWidth + 50 &&
    p.y > -50 && p.y < GAME_CONFIG.canvasHeight + 50
  );
}

function updateExplosions(explosions: ArenaExplosion[]): ArenaExplosion[] {
  return explosions.map(e => ({
    ...e,
    frame: e.frame + 1,
  })).filter(e => e.frame < e.maxFrames);
}

function updateParticles(particles: ArenaParticle[]): ArenaParticle[] {
  return particles.map(p => ({
    ...p,
    x: p.x + p.vx,
    y: p.y + p.vy,
    vx: p.vx * 0.98,
    vy: p.vy * 0.98,
    life: p.life - 1,
  })).filter(p => p.life > 0);
}

function checkArenaCollisions(state: ArenaState, centerX: number, centerY: number): ArenaState {
  const shipRadius = 20;
  
  // Collect new particles, explosions, enemies to add
  let newParticles: ArenaParticle[] = [];
  let newExplosions: ArenaExplosion[] = [];
  let newEnemiesFromSplit: ArenaEnemy[] = [];
  let newSoundQueue: string[] = [];
  let enemiesDefeated = state.enemiesDefeated;
  let enemiesInWave = state.enemiesInWave;
  let combo = state.combo;
  let comboTimer = state.comboTimer;
  let bonusScore = state.bonusScore;
  let health = state.health;
  let invulnerableTimer = state.invulnerableTimer;
  
  // Track which enemies and projectiles survive
  let survivingEnemies: ArenaEnemy[] = [];
  let survivingProjectiles: ArenaProjectile[] = [];
  
  // Process projectiles vs enemies
  for (const proj of state.projectiles) {
    if (!proj.isPlayer) {
      survivingProjectiles.push(proj);
      continue;
    }
    
    let hit = false;
    for (let i = 0; i < state.enemies.length; i++) {
      const enemy = state.enemies[i];
      const dx = proj.x - enemy.x;
      const dy = proj.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < enemy.size / 2 + proj.size) {
        hit = true;
        
        // Hit particles
        for (let j = 0; j < 3; j++) {
          const angle = Math.random() * Math.PI * 2;
          newParticles.push({
            id: generateId(),
            x: proj.x,
            y: proj.y,
            vx: Math.cos(angle) * 3,
            vy: Math.sin(angle) * 3,
            size: 2,
            color: '#ffaa00',
            life: 15,
            maxLife: 15,
          });
        }
        break;
      }
    }
    
    if (!hit) {
      survivingProjectiles.push(proj);
    }
  }
  
  // Process enemies - check damage from projectiles
  for (const enemy of state.enemies) {
    let enemyHealth = enemy.health;
    let wasHit = false;
    
    for (const proj of state.projectiles) {
      if (!proj.isPlayer) continue;
      
      const dx = proj.x - enemy.x;
      const dy = proj.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < enemy.size / 2 + proj.size) {
        enemyHealth -= proj.damage;
        wasHit = true;
        break;
      }
    }
    
    if (enemyHealth <= 0) {
      // Enemy destroyed
      newExplosions.push({
        id: generateId(),
        x: enemy.x,
        y: enemy.y,
        frame: 0,
        maxFrames: 20,
        size: enemy.size,
        color: enemy.type === 'boss' ? '#ff00ff' : '#ff8800',
      });
      
      // Combo and score
      combo++;
      comboTimer = 90;
      const comboMultiplier = Math.min(combo, 10);
      const baseScore = enemy.type === 'boss' ? 1000 : (enemy.type === 'spinner' ? 150 : 100);
      bonusScore += baseScore * comboMultiplier;
      
      enemiesDefeated++;
      newSoundQueue.push('explosion');
      
      // Splitter spawns smaller enemies
      if (enemy.type === 'splitter' && enemy.splitCount && enemy.splitCount > 0) {
        for (let i = 0; i < 2; i++) {
          const splitAngle = Math.random() * Math.PI * 2;
          newEnemiesFromSplit.push({
            id: generateId(),
            x: enemy.x + Math.cos(splitAngle) * 20,
            y: enemy.y + Math.sin(splitAngle) * 20,
            angle: splitAngle,
            distance: enemy.distance,
            speed: enemy.speed * 1.5,
            size: enemy.size * 0.6,
            health: 1,
            maxHealth: 1,
            type: 'asteroid',
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
            behaviorTimer: 0,
          });
        }
        enemiesInWave += 2;
      }
      
      // Explosion particles
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        newParticles.push({
          id: generateId(),
          x: enemy.x,
          y: enemy.y,
          vx: Math.cos(angle) * 5,
          vy: Math.sin(angle) * 5,
          size: 4,
          color: '#ffff00',
          life: 25,
          maxLife: 25,
        });
      }
    } else {
      survivingEnemies.push(wasHit ? { ...enemy, health: enemyHealth } : enemy);
    }
  }
  
  // Add split enemies
  survivingEnemies = [...survivingEnemies, ...newEnemiesFromSplit];
  
  // Enemies vs player ship - collision destroys enemy and damages player
  const collidedEnemyIds: string[] = [];
  if (invulnerableTimer <= 0) {
    for (const enemy of survivingEnemies) {
      const dx = enemy.x - centerX;
      const dy = enemy.y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < shipRadius + enemy.size / 2) {
        // Mark enemy for destruction
        collidedEnemyIds.push(enemy.id);
        
        // Player takes small damage
        health -= enemy.type === 'boss' ? 25 : 10;
        invulnerableTimer = 30;
        combo = 0;
        newSoundQueue.push('hit');
        newSoundQueue.push('explosion');
        
        // Create explosion for destroyed enemy
        newExplosions.push({
          id: generateId(),
          x: enemy.x,
          y: enemy.y,
          frame: 0,
          maxFrames: 20,
          size: enemy.size,
          color: '#ff4400',
        });
        
        // Damage particles
        for (let i = 0; i < 10; i++) {
          const angle = Math.random() * Math.PI * 2;
          newParticles.push({
            id: generateId(),
            x: centerX + Math.cos(angle) * 20,
            y: centerY + Math.sin(angle) * 20,
            vx: Math.cos(angle) * 4,
            vy: Math.sin(angle) * 4,
            size: 3,
            color: '#ff0000',
            life: 20,
            maxLife: 20,
          });
        }
        
        // Enemy explosion particles
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI * 2 * i) / 6;
          newParticles.push({
            id: generateId(),
            x: enemy.x,
            y: enemy.y,
            vx: Math.cos(angle) * 4,
            vy: Math.sin(angle) * 4,
            size: 3,
            color: '#ffaa00',
            life: 20,
            maxLife: 20,
          });
        }
      }
    }
  }
  
  // Remove collided enemies from surviving list
  survivingEnemies = survivingEnemies.filter(e => !collidedEnemyIds.includes(e.id));
  
  return {
    ...state,
    projectiles: survivingProjectiles,
    enemies: survivingEnemies,
    explosions: [...state.explosions, ...newExplosions],
    particles: [...state.particles, ...newParticles],
    soundQueue: [...state.soundQueue, ...newSoundQueue],
    enemiesDefeated,
    enemiesInWave,
    combo,
    comboTimer,
    bonusScore,
    health,
    invulnerableTimer,
  };
}

// Rendering
export function renderArenaMode(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const { canvasWidth, canvasHeight } = GAME_CONFIG;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  
  // Background gradient
  const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvasWidth);
  bgGradient.addColorStop(0, state.bgColor2);
  bgGradient.addColorStop(1, state.bgColor1);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // Animated background stars
  renderArenaStars(ctx, state);
  
  // Arena ring effect
  renderArenaRing(ctx, state, centerX, centerY);
  
  // Particles (behind everything)
  renderArenaParticles(ctx, state);
  
  // Enemies
  state.enemies.forEach(enemy => renderArenaEnemy(ctx, enemy));
  
  // Projectiles
  state.projectiles.forEach(proj => renderArenaProjectile(ctx, proj));
  
  // Explosions
  state.explosions.forEach(exp => renderArenaExplosion(ctx, exp));
  
  // Player ship
  if (state.phase !== 'complete') {
    renderArenaShip(ctx, state, centerX, centerY);
  }
  
  // UI
  renderArenaUI(ctx, state, canvasWidth);
}

function renderArenaStars(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  const time = Date.now() * 0.001;
  const { canvasWidth, canvasHeight } = GAME_CONFIG;
  
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 100; i++) {
    const x = (i * 137 + state.variant * 50) % canvasWidth;
    const y = (i * 89 + state.variant * 30) % canvasHeight;
    const size = (i % 3) === 0 ? 2 : 1;
    const twinkle = Math.sin(time * 3 + i) * 0.4 + 0.6;
    ctx.globalAlpha = twinkle * 0.5;
    ctx.fillRect(x, y, size, size);
  }
  ctx.globalAlpha = 1;
}

function renderArenaRing(ctx: CanvasRenderingContext2D, state: ArenaState, centerX: number, centerY: number): void {
  const time = Date.now() * 0.001;
  
  // Pulsing arena boundary
  const pulseRadius = 180 + Math.sin(time * 2) * 10;
  
  // Outer glow
  const gradient = ctx.createRadialGradient(centerX, centerY, pulseRadius - 20, centerX, centerY, pulseRadius + 30);
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.1)');
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, pulseRadius + 30, 0, Math.PI * 2);
  ctx.fill();
  
  // Ring segments
  ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 + Math.sin(time * 3) * 0.1})`;
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8 + time * 0.1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, angle, angle + Math.PI / 6);
    ctx.stroke();
  }
}

function renderArenaParticles(ctx: CanvasRenderingContext2D, state: ArenaState): void {
  state.particles.forEach(p => {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function renderArenaEnemy(ctx: CanvasRenderingContext2D, enemy: ArenaEnemy): void {
  ctx.save();
  ctx.translate(enemy.x, enemy.y);
  ctx.rotate(enemy.rotation);
  
  const healthRatio = enemy.health / enemy.maxHealth;
  
  switch (enemy.type) {
    case 'asteroid':
      // Jagged asteroid shape
      ctx.fillStyle = `rgb(${100 + healthRatio * 50}, ${80 + healthRatio * 40}, ${60 + healthRatio * 30})`;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        const r = enemy.size / 2 * (0.7 + Math.sin(i * 2.5) * 0.3);
        if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
        else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#8b7355';
      ctx.lineWidth = 2;
      ctx.stroke();
      break;
      
    case 'seeker':
      // Arrow/dart shape
      ctx.fillStyle = `rgb(${255 * healthRatio}, ${100 * healthRatio}, 50)`;
      ctx.beginPath();
      ctx.moveTo(enemy.size / 2, 0);
      ctx.lineTo(-enemy.size / 3, enemy.size / 3);
      ctx.lineTo(-enemy.size / 4, 0);
      ctx.lineTo(-enemy.size / 3, -enemy.size / 3);
      ctx.closePath();
      ctx.fill();
      // Glow
      ctx.shadowColor = '#ff4400';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      break;
      
    case 'spinner':
      // Multi-pointed star
      ctx.fillStyle = `rgb(100, ${150 + 100 * healthRatio}, 255)`;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6;
        const r1 = enemy.size / 2;
        const r2 = enemy.size / 4;
        ctx.lineTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
        ctx.lineTo(Math.cos(angle + Math.PI / 6) * r2, Math.sin(angle + Math.PI / 6) * r2);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 1;
      ctx.stroke();
      break;
      
    case 'splitter':
      // Connected spheres look
      ctx.fillStyle = `rgb(${200 * healthRatio}, 50, ${200 * healthRatio})`;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.size / 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(enemy.size / 4, enemy.size / 4, enemy.size / 5, 0, Math.PI * 2);
      ctx.arc(-enemy.size / 4, -enemy.size / 4, enemy.size / 5, 0, Math.PI * 2);
      ctx.fill();
      // Pulsing glow
      ctx.shadowColor = '#ff00ff';
      ctx.shadowBlur = 5 + Math.sin(Date.now() * 0.01) * 3;
      ctx.fill();
      ctx.shadowBlur = 0;
      break;
      
    case 'boss':
      // Large threatening shape
      const bossTime = Date.now() * 0.002;
      
      // Core
      const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, enemy.size / 2);
      coreGradient.addColorStop(0, '#ff00ff');
      coreGradient.addColorStop(0.5, '#8800aa');
      coreGradient.addColorStop(1, '#440066');
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.size / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Rotating spikes
      ctx.fillStyle = '#ff00ff';
      for (let i = 0; i < 6; i++) {
        const spikeAngle = (Math.PI * 2 * i) / 6 + bossTime;
        ctx.save();
        ctx.rotate(spikeAngle);
        ctx.beginPath();
        ctx.moveTo(enemy.size / 2, 0);
        ctx.lineTo(enemy.size * 0.7, enemy.size / 8);
        ctx.lineTo(enemy.size * 0.7, -enemy.size / 8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      
      // Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, enemy.size / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(Math.sin(bossTime * 2) * 3, Math.cos(bossTime * 2) * 3, enemy.size / 12, 0, Math.PI * 2);
      ctx.fill();
      
      // Health bar
      ctx.restore();
      ctx.save();
      ctx.translate(enemy.x, enemy.y);
      const barWidth = enemy.size * 1.2;
      const barHeight = 6;
      const barY = -enemy.size / 2 - 15;
      ctx.fillStyle = '#333';
      ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);
      ctx.fillStyle = healthRatio > 0.3 ? '#ff00ff' : '#ff0000';
      ctx.fillRect(-barWidth / 2, barY, barWidth * healthRatio, barHeight);
      break;
  }
  
  ctx.restore();
}

function renderArenaProjectile(ctx: CanvasRenderingContext2D, proj: ArenaProjectile): void {
  // Trail
  proj.trail.forEach((t, i) => {
    ctx.globalAlpha = t.alpha * 0.5;
    ctx.fillStyle = proj.isPlayer ? '#00ffff' : '#ff0000';
    ctx.beginPath();
    ctx.arc(t.x, t.y, proj.size * 0.7, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  
  // Main projectile
  ctx.save();
  ctx.translate(proj.x, proj.y);
  ctx.rotate(proj.angle);
  
  if (proj.isPlayer) {
    // Cyan laser bolt
    const gradient = ctx.createLinearGradient(-proj.size * 2, 0, proj.size * 2, 0);
    gradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
    gradient.addColorStop(0.5, '#00ffff');
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0.3)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, proj.size * 2, proj.size, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Glow
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  
  ctx.restore();
}

function renderArenaExplosion(ctx: CanvasRenderingContext2D, exp: ArenaExplosion): void {
  const progress = exp.frame / exp.maxFrames;
  const radius = exp.size * (0.5 + progress);
  
  ctx.globalAlpha = 1 - progress;
  
  // Outer ring
  ctx.strokeStyle = exp.color;
  ctx.lineWidth = 3 * (1 - progress);
  ctx.beginPath();
  ctx.arc(exp.x, exp.y, radius, 0, Math.PI * 2);
  ctx.stroke();
  
  // Inner glow
  const gradient = ctx.createRadialGradient(exp.x, exp.y, 0, exp.x, exp.y, radius);
  gradient.addColorStop(0, exp.color);
  gradient.addColorStop(0.5, `${exp.color}88`);
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(exp.x, exp.y, radius, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.globalAlpha = 1;
}

function renderArenaShip(ctx: CanvasRenderingContext2D, state: ArenaState, centerX: number, centerY: number): void {
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(state.shipAngle);
  ctx.scale(state.shipScale, state.shipScale);
  
  // Invulnerability flash
  if (state.invulnerableTimer > 0 && Math.floor(state.invulnerableTimer / 4) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }
  
  
  // Draw the selected mega ship with skin colors
  const megaShipId = getStoredMegaShipId();
  const time = Date.now() * 0.003;
  const skinColors = getStoredSkinColors();
  drawMegaShip(ctx, 0, 0, megaShipId, time, skinColors);

  
  ctx.restore();
}

function renderArenaUI(ctx: CanvasRenderingContext2D, state: ArenaState, canvasWidth: number): void {
  // Health bar
  const barWidth = 200;
  const barHeight = 12;
  const barX = 20;
  const barY = 20;
  
  ctx.fillStyle = '#333';
  ctx.fillRect(barX, barY, barWidth, barHeight);
  
  const healthRatio = state.health / state.maxHealth;
  ctx.fillStyle = healthRatio > 0.3 ? '#00ff00' : '#ff0000';
  ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);
  
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barWidth, barHeight);
  
  // Wave indicator
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'left';
  if (state.phase === 'defense') {
    ctx.fillText(`WAVE ${state.currentWave}/${state.maxWaves}`, barX, barY + 35);
    ctx.font = '14px monospace';
    ctx.fillText(`Enemies: ${state.enemiesDefeated}/${state.enemiesInWave}`, barX, barY + 55);
  } else if (state.phase === 'boss') {
    ctx.fillStyle = '#ff00ff';
    ctx.fillText('BOSS WAVE', barX, barY + 35);
  }
  
  // Combo counter
  if (state.combo > 1) {
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${state.combo}x COMBO!`, canvasWidth - 20, 40);
  }
  
  // Score
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`BONUS: ${state.bonusScore}`, canvasWidth - 20, 70);
  
  // Wave complete message
  if (state.waveComplete) {
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WAVE COMPLETE!', canvasWidth / 2, 100);
    ctx.font = '18px monospace';
    ctx.fillText(`+${500 * state.currentWave} BONUS`, canvasWidth / 2, 130);
  }
  
  // Victory message
  if (state.phase === 'victory') {
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ARENA CLEARED!', canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 - 30);
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`TOTAL BONUS: ${state.bonusScore}`, canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 + 20);
  }
  
  // Showing results - tap to continue (same as bunker defense)
  if (state.phase === 'showing_results') {
    // Dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, canvasWidth, GAME_CONFIG.canvasHeight);
    
    // Check if mission was successful (health > 0 and completed all waves)
    const isVictory = state.health > 0 && state.currentWave > state.maxWaves;
    
    ctx.save();
    ctx.textAlign = 'center';
    
    if (isVictory) {
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 40px monospace';
      ctx.fillText('MISSION COMPLETE!', canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 - 50);
    } else {
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 40px monospace';
      ctx.fillText('MISSION FAILED', canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 - 50);
      ctx.fillStyle = '#ff6600';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('SHIP DESTROYED', canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 - 10);
    }
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`TOTAL BONUS: ${state.bonusScore}`, canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 + 30);
    
    // Tap to continue
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px monospace';
    if (Math.floor(Date.now() / 500) % 2 === 0) {
      ctx.fillText('TAP TO CONTINUE', canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 + 80);
    }
    ctx.restore();
  }
  
  // Entering phase
  if (state.phase === 'entering') {
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ARENA MODE', canvasWidth / 2, 80);
    ctx.font = '18px monospace';
    ctx.fillText('SURVIVE THE ONSLAUGHT', canvasWidth / 2, 110);
  }
}
