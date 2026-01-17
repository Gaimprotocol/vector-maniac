import { GAME_CONFIG } from './constants';
import { drawMegaShip } from './megaShipRenderer';
import { getStoredMegaShipId } from '@/hooks/useMegaShips';
import { getStoredSkinColors } from '@/hooks/useEquipment';

// Audio context for sound effects
let audioContext: AudioContext | null = null;
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

export type ParatrooperSoundType = 'drop' | 'repair' | 'activate' | 'bunker_fire' | 'explosion' | 'bunker_hit' | 'wave_clear' | 'wave_start' | 'victory' | 'teleport' | 'soldier_death';

export function playParatrooperSound(type: ParatrooperSoundType): void {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    switch (type) {
      case 'drop':
        // Parachute deploy - whoosh sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
        break;
        
      case 'repair':
        // Wrench/repair sound - metallic clinks
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.setValueAtTime(1000, ctx.currentTime + 0.05);
        oscillator.frequency.setValueAtTime(900, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
        break;
        
      case 'activate':
        // Power up sound - rising tone
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.35);
        break;
        
      case 'bunker_fire':
        // Laser/bullet shot
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.08);
        break;
        
      case 'explosion':
        // Explosion - low rumble
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.25);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.25);
        break;
        
      case 'bunker_hit':
        // Impact sound
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(300, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
        break;
        
      case 'wave_clear':
        // Victory fanfare - ascending notes
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523, ctx.currentTime); // C5
        oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.2); // G5
        oscillator.frequency.setValueAtTime(1047, ctx.currentTime + 0.3); // C6
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
        break;
        
      case 'wave_start':
        // Alert/warning tone
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        oscillator.frequency.setValueAtTime(550, ctx.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(440, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
        break;
        
      case 'victory':
        // Big victory sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(392, ctx.currentTime); // G4
        oscillator.frequency.setValueAtTime(494, ctx.currentTime + 0.15); // B4
        oscillator.frequency.setValueAtTime(587, ctx.currentTime + 0.3); // D5
        oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.45); // G5
        gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.7);
        break;
        
      case 'teleport':
        // Sci-fi teleport beam sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.15);
        oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.25);
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.25);
        break;
        
      case 'soldier_death':
        // Sad/death sound
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(300, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
        break;
    }
  } catch (e) {
    // Audio not supported
  }
}

export interface Bunker {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
  fireTimer: number;
  health: number;
  repairProgress: number; // 0-100 for repair animation
  activationProgress: number; // 0-100 for activation animation
  soldierCount: number; // Number of soldiers inside (max 4, more = more firepower)
  side: 'left' | 'right';
  groundY: number; // Ground level at bunker position
  turretAngle: number; // Angle of the turret for aiming
}

export interface Paratrooper {
  x: number;
  y: number;
  velocityY: number;
  velocityX: number;
  landed: boolean;
  targetBunkerId: number;
  walking: boolean;
  repairing: boolean;
  enteredBunker: boolean;
  dead: boolean;
  deathTimer: number;
  rescued: boolean; // For extraction phase
}

export interface AlienShip {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  health: number;
  active: boolean;
  type: 'tentacle' | 'jellyfish' | 'mothership' | 'swarm';
  tentaclePhase: number;
  fireTimer: number;
  targetBunker: number; // Index of bunker being targeted, -1 if none
}

export interface EnemyBullet {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  active: boolean;
}

export interface SpaceMine {
  x: number;
  y: number;
  radius: number;
  pulsePhase: number;
}

export interface MoonCrack {
  x: number;
  topY: number;
  bottomY: number;
  width: number;
}

export interface GroundTurret {
  x: number;
  y: number;
  active: boolean;
  fireTimer: number;
  angle: number;
}

export interface BunkerBullet {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  active: boolean;
  isRocket?: boolean; // For homing rockets
  targetId?: number; // Index of target alien ship
}

export interface MoonTerrain {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MoonCrater {
  x: number;
  y: number;
  radius: number;
  depth: number;
}

export interface MoonMountain {
  x: number;
  baseY: number;
  width: number;
  height: number;
  peaks: number[];
}

export interface TeleportBeam {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number; // 0-100
  bunkerId: number;
}

export interface ParatrooperState {
  phase: 'intro' | 'playing' | 'wave_complete' | 'extraction' | 'showing_results' | 'complete';
  currentWave: number;
  totalWaves: number;
  waveEnemiesRemaining: number;
  waveEnemiesSpawned: number;
  waveMaxEnemies: number;
  shipX: number;
  shipY: number;
  shipDirection: number;
  shipSpeed: number;
  playerControlX: number;
  bunkers: Bunker[];
  paratroopers: Paratrooper[];
  alienShips: AlienShip[];
  enemyBullets: EnemyBullet[];
  bunkerBullets: BunkerBullet[];
  spaceMines: SpaceMine[];
  moonCracks: MoonCrack[];
  groundTurrets: GroundTurret[];
  terrain: MoonTerrain[];
  craters: MoonCrater[];
  mountains: MoonMountain[];
  stars: { x: number; y: number; size: number; brightness: number; twinkle: number }[];
  nebulae: { x: number; y: number; radius: number; color: string; opacity: number }[];
  availableSoldiers: number;
  deployedSoldiers: number;
  lostSoldiers: number;
  rescuedSoldiers: number;
  score: number;
  timer: number;
  maxTime: number;
  enemySpawnTimer: number;
  extractionTimer: number;
  waveTransitionTimer: number;
  particles: { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }[];
  teleportBeams: TeleportBeam[];
  soundQueue: string[];
}

const ARENA_GROUND_Y = GAME_CONFIG.canvasHeight - 100;

function getTerrainHeightAt(terrain: MoonTerrain[], x: number): number {
  for (const segment of terrain) {
    if (x >= segment.x && x < segment.x + segment.width) {
      return segment.y;
    }
  }
  return ARENA_GROUND_Y;
}

export function createParatrooperState(savedCivilians: number): ParatrooperState {
  // Ensure minimum of 10 soldiers regardless of how many were saved
  const availableSoldierCount = Math.max(10, savedCivilians);
  const bunkers: Bunker[] = [];
  const terrain: MoonTerrain[] = [];
  const craters: MoonCrater[] = [];
  const mountains: MoonMountain[] = [];
  const spaceMines: SpaceMine[] = [];
  const moonCracks: MoonCrack[] = [];
  const groundTurrets: GroundTurret[] = [];
  
  const groundY = ARENA_GROUND_Y;
  
  // Create terrain segments with smooth height variation
  const segmentWidth = 40;
  const terrainPoints: number[] = [];
  let prevHeight = 0;
  
  for (let i = 0; i <= Math.ceil(GAME_CONFIG.canvasWidth / segmentWidth); i++) {
    const baseVariation = Math.sin(i * 0.3) * 8 + Math.sin(i * 0.7) * 4;
    const noise = (Math.random() - 0.5) * 3;
    prevHeight = prevHeight * 0.7 + (baseVariation + noise) * 0.3;
    terrainPoints.push(prevHeight);
  }
  
  for (let i = 0; i < terrainPoints.length - 1; i++) {
    terrain.push({
      x: i * segmentWidth,
      y: groundY + terrainPoints[i],
      width: segmentWidth + 2,
      height: 120
    });
  }
  
  // Create background mountains - more of them
  for (let i = 0; i < 10; i++) {
    const peaks = [];
    const peakCount = 2 + Math.floor(Math.random() * 3);
    for (let p = 0; p < peakCount; p++) {
      peaks.push(Math.random() * 0.8 + 0.2);
    }
    mountains.push({
      x: i * (GAME_CONFIG.canvasWidth / 8) + Math.random() * 40 - 20,
      baseY: groundY - 20,
      width: 80 + Math.random() * 100,
      height: 30 + Math.random() * 80,
      peaks
    });
  }
  
  // Create craters on the surface
  for (let i = 0; i < 8; i++) {
    craters.push({
      x: Math.random() * GAME_CONFIG.canvasWidth,
      y: groundY + Math.random() * 30 + 10,
      radius: 10 + Math.random() * 20,
      depth: 0.3 + Math.random() * 0.4
    });
  }
  
  // Create 1-2 moon cracks
  const crackCount = 1 + Math.floor(Math.random() * 2);
  const crackSpacing = GAME_CONFIG.canvasWidth / (crackCount + 1);
  for (let i = 0; i < crackCount; i++) {
    const crackX = crackSpacing * (i + 1) + (Math.random() - 0.5) * 60;
    const crackTopY = getTerrainHeightAt(terrain, crackX);
    moonCracks.push({
      x: crackX,
      topY: crackTopY,
      bottomY: GAME_CONFIG.canvasHeight,
      width: 12 + Math.random() * 8
    });
  }
  
  // Place bunkers - damaged initially, need repair
  const bunkerPositions = [60, 160, 280, 400, 520, 640, 720];
  bunkerPositions.forEach((bx) => {
    let side: 'left' | 'right' = 'left';
    for (const crack of moonCracks) {
      if (bx > crack.x) side = 'right';
    }
    
    const nearCrack = moonCracks.some(c => Math.abs(c.x - bx) < 45);
    if (!nearCrack && bx < GAME_CONFIG.canvasWidth - 40) {
      const bunkerGroundY = getTerrainHeightAt(terrain, bx);
      bunkers.push({
        x: bx,
        y: bunkerGroundY - 22,
        width: 42,
        height: 24,
        active: false,
        fireTimer: 0,
        health: 50, // Damaged - needs repair to 100
        repairProgress: 0,
        activationProgress: 0,
        soldierCount: 0,
        side,
        groundY: bunkerGroundY,
        turretAngle: -Math.PI / 2 // Start pointing up
      });
    }
  });
  
  // Add space mines
  for (let i = 0; i < 3; i++) {
    spaceMines.push({
      x: 120 + Math.random() * (GAME_CONFIG.canvasWidth - 240),
      y: 100 + Math.random() * 80,
      radius: 10 + Math.random() * 6,
      pulsePhase: Math.random() * Math.PI * 2
    });
  }
  
  // Ground turrets removed - bunkers now have rotating turrets
  
  // Create starfield - more stars
  const stars = [];
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: Math.random() * GAME_CONFIG.canvasWidth,
      y: Math.random() * (GAME_CONFIG.canvasHeight - 180),
      size: Math.random() * 2.5 + 0.3,
      brightness: Math.random() * 0.7 + 0.3,
      twinkle: Math.random() * Math.PI * 2
    });
  }
  
  // Create nebulae for atmosphere
  const nebulae = [];
  for (let i = 0; i < 4; i++) {
    nebulae.push({
      x: Math.random() * GAME_CONFIG.canvasWidth,
      y: Math.random() * 150 + 50,
      radius: 60 + Math.random() * 80,
      color: ['#663388', '#884466', '#446688', '#886644'][Math.floor(Math.random() * 4)],
      opacity: 0.1 + Math.random() * 0.15
    });
  }
  
  return {
    phase: 'intro',
    currentWave: 1,
    totalWaves: 2,
    waveEnemiesRemaining: 0,
    waveEnemiesSpawned: 0,
    waveMaxEnemies: 8, // Wave 1
    shipX: GAME_CONFIG.canvasWidth / 2,
    shipY: 55,
    shipDirection: 1,
    shipSpeed: 1.0,
    playerControlX: 0,
    bunkers,
    paratroopers: [],
    alienShips: [],
    enemyBullets: [],
    bunkerBullets: [],
    spaceMines,
    moonCracks,
    groundTurrets,
    terrain,
    craters,
    mountains,
    stars,
    nebulae,
    availableSoldiers: availableSoldierCount,
    deployedSoldiers: 0,
    lostSoldiers: 0,
    rescuedSoldiers: 0,
    score: 0,
    timer: 0,
    maxTime: 90 * 60,
    enemySpawnTimer: 0,
    extractionTimer: 0,
    waveTransitionTimer: 0,
    particles: [],
    teleportBeams: [],
    soundQueue: []
  };
}

export function updateParatrooper(
  state: ParatrooperState,
  input: { tap: boolean; tapX: number; tapY: number; left?: boolean; right?: boolean },
  deltaTime: number = 1
): ParatrooperState {
  const newState = { ...state };
  newState.soundQueue = [];
  
  if (state.phase === 'intro') {
    newState.timer++;
    if (newState.timer > 180) {
      newState.phase = 'playing';
      newState.timer = 0;
      newState.waveEnemiesRemaining = newState.waveMaxEnemies;
    }
    return newState;
  }
  
  if (state.phase === 'complete') {
    return newState;
  }
  
  // Showing results - wait for tap to complete
  if (state.phase === 'showing_results') {
    if (input.tap || input.left || input.right) {
      newState.phase = 'complete';
    }
    return newState;
  }
  
  // Wave complete transition
  if (state.phase === 'wave_complete') {
    newState.waveTransitionTimer++;
    if (newState.waveTransitionTimer > 180) {
      if (newState.currentWave < newState.totalWaves) {
        newState.currentWave++;
        newState.waveMaxEnemies = 12; // Wave 2 has more enemies
        newState.waveEnemiesRemaining = newState.waveMaxEnemies;
        newState.waveEnemiesSpawned = 0;
        newState.phase = 'playing';
        newState.waveTransitionTimer = 0;
        newState.soundQueue.push('wave_start');
      } else {
        // All waves complete - begin extraction
        newState.phase = 'extraction';
        newState.extractionTimer = 0;
        newState.soundQueue.push('victory');
      }
    }
    return newState;
  }
  
  // Extraction phase
  if (state.phase === 'extraction') {
    return updateExtraction(newState, deltaTime);
  }
  
  // Playing phase
  newState.timer++;
  
  // Player ship control
  newState.playerControlX = 0;
  if (input.left) newState.playerControlX = -2.5;
  if (input.right) newState.playerControlX = 2.5;
  
  newState.shipX += (newState.shipDirection * newState.shipSpeed + newState.playerControlX) * deltaTime;
  newState.shipY = 50 + Math.sin(newState.timer * 0.04) * 8;
  
  if (newState.shipX > GAME_CONFIG.canvasWidth - 45) {
    newState.shipX = GAME_CONFIG.canvasWidth - 45;
    newState.shipDirection = -1;
  } else if (newState.shipX < 45) {
    newState.shipX = 45;
    newState.shipDirection = 1;
  }
  
  // Drop paratrooper on tap
  if (input.tap && newState.availableSoldiers > 0) {
    newState.paratroopers = [...newState.paratroopers, {
      x: newState.shipX,
      y: newState.shipY + 25,
      velocityY: 0,
      velocityX: newState.shipDirection * 0.4,
      landed: false,
      targetBunkerId: -1,
      walking: false,
      repairing: false,
      enteredBunker: false,
      dead: false,
      deathTimer: 0,
      rescued: false
    }];
    newState.availableSoldiers--;
    newState.deployedSoldiers++;
    newState.soundQueue.push('drop');
  }
  
  // Update paratroopers
  const paratrooperResult = updateParatroopers(newState);
  newState.paratroopers = paratrooperResult.paratroopers;
  newState.lostSoldiers += paratrooperResult.killed;
  newState.particles = [...newState.particles, ...paratrooperResult.particles];
  if (paratrooperResult.repairSound) newState.soundQueue.push('repair');
  if (paratrooperResult.activateSound) newState.soundQueue.push('activate');
  
  // Update bunkers
  const bunkerResult = updateBunkers(newState);
  newState.bunkers = bunkerResult.bunkers;
  newState.bunkerBullets = [...newState.bunkerBullets, ...bunkerResult.newBullets];
  if (bunkerResult.fireSound) newState.soundQueue.push('bunker_fire');
  
  // Spawn alien ships based on wave
  newState.enemySpawnTimer++;
  const spawnRate = newState.currentWave === 1 ? 90 : 60;
  if (newState.enemySpawnTimer > spawnRate && newState.waveEnemiesSpawned < newState.waveMaxEnemies) {
    newState.enemySpawnTimer = 0;
    const ship = spawnAlienShip(newState.currentWave);
    newState.alienShips = [...newState.alienShips, ship];
    newState.waveEnemiesSpawned++;
  }
  
  // Update alien ships
  const alienResult = updateAlienShips(newState);
  newState.alienShips = alienResult.ships;
  newState.enemyBullets = [...newState.enemyBullets, ...alienResult.newBullets];
  
  // Ground turrets removed - bunkers have rotating turrets now
  
  // Update bullets
  newState.enemyBullets = updateEnemyBullets(newState);
  newState.bunkerBullets = updateBunkerBullets(newState);
  
  // Check collisions
  const collisionResult = checkCollisions(newState);
  newState.alienShips = collisionResult.alienShips;
  newState.bunkerBullets = collisionResult.bullets;
  newState.score = collisionResult.score;
  newState.waveEnemiesRemaining = collisionResult.enemiesRemaining;
  newState.particles = [...newState.particles, ...collisionResult.newParticles];
  if (collisionResult.hitSound) {
    newState.soundQueue.push('explosion');
  }
  
  // Check bunker damage from enemy bullets
  const bunkerDamageResult = checkBunkerDamage(newState);
  newState.bunkers = bunkerDamageResult.bunkers;
  newState.enemyBullets = bunkerDamageResult.bullets;
  newState.particles = [...newState.particles, ...bunkerDamageResult.particles];
  if (bunkerDamageResult.damageSound) {
    newState.soundQueue.push('bunker_hit');
  }
  
  // Check paratrooper collisions with enemy bullets
  const bulletHitResult = checkParatrooperBulletCollisions(newState);
  newState.paratroopers = bulletHitResult.paratroopers;
  newState.enemyBullets = bulletHitResult.bullets;
  newState.lostSoldiers += bulletHitResult.killed;
  newState.particles = [...newState.particles, ...bulletHitResult.particles];
  
  // Check paratrooper collisions with mines
  const mineResult = checkMineCollisions(newState);
  newState.paratroopers = mineResult.paratroopers;
  newState.lostSoldiers += mineResult.killed;
  newState.particles = [...newState.particles, ...mineResult.particles];
  
  // Update effects
  newState.spaceMines = newState.spaceMines.map(mine => ({
    ...mine,
    pulsePhase: mine.pulsePhase + 0.06
  }));
  
  newState.stars = newState.stars.map(star => ({
    ...star,
    twinkle: star.twinkle + 0.02
  }));
  
  newState.particles = newState.particles
    .map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vy: p.vy + 0.04,
      life: p.life - 1
    }))
    .filter(p => p.life > 0);
  
  // Check wave completion
  const activeEnemies = newState.alienShips.filter(s => s.active).length;
  if (newState.waveEnemiesSpawned >= newState.waveMaxEnemies && activeEnemies === 0) {
    newState.phase = 'wave_complete';
    newState.waveTransitionTimer = 0;
    newState.soundQueue.push('wave_clear');
  }
  
  // Time limit
  if (newState.timer >= newState.maxTime) {
    newState.phase = 'extraction';
    newState.extractionTimer = 0;
  }
  
  return newState;
}

function updateExtraction(state: ParatrooperState, deltaTime: number): ParatrooperState {
  const newState = { ...state };
  newState.extractionTimer++;
  newState.soundQueue = [];
  
  // Get ALL bunkers with soldiers inside (active or not, as long as they have soldiers)
  const occupiedBunkers = newState.bunkers
    .map((b, idx) => ({ bunker: b, index: idx }))
    .filter(({ bunker }) => bunker.soldierCount > 0);
  
  // Calculate total soldiers to extract from bunkers
  const soldiersInBunkers = occupiedBunkers.reduce((sum, { bunker }) => sum + bunker.soldierCount, 0);
  
  // Also get any walking soldiers on the ground (not in bunkers yet)
  const groundSoldiers = newState.paratroopers.filter(t => !t.dead && !t.rescued && !t.enteredBunker && t.landed);
  
  // Update teleport beams
  newState.teleportBeams = newState.teleportBeams
    .map(beam => ({ ...beam, progress: beam.progress + 3 }))
    .filter(beam => beam.progress < 100);
  
  // Phase 1: Teleport soldiers from ALL bunkers (continue until all bunkers are empty)
  if (soldiersInBunkers > 0) {
    // Move ship over bunkers to extract - find the one with most soldiers first
    const nextBunker = occupiedBunkers
      .sort((a, b) => b.bunker.soldierCount - a.bunker.soldierCount)
      .find(({ bunker }) => bunker.soldierCount > 0);
    
    if (nextBunker) {
      const dx = nextBunker.bunker.x - newState.shipX;
      newState.shipX += Math.sign(dx) * Math.min(Math.abs(dx), 3.5); // Faster movement
      newState.shipDirection = dx > 0 ? 1 : -1;
      
      // When above bunker, teleport ALL soldiers at once
      if (Math.abs(dx) < 20) {
        const soldiersToRescue = nextBunker.bunker.soldierCount;
        
        if (soldiersToRescue > 0) {
          // Create one big teleport beam effect for all soldiers
          newState.teleportBeams = [...newState.teleportBeams, {
            fromX: nextBunker.bunker.x,
            fromY: nextBunker.bunker.y - 20,
            toX: newState.shipX,
            toY: newState.shipY + 15,
            progress: 0,
            bunkerId: nextBunker.index
          }];
          
          // Remove ALL soldiers from bunker at once
          newState.bunkers = newState.bunkers.map((b, idx) => {
            if (idx === nextBunker.index) {
              return { ...b, soldierCount: 0 };
            }
            return b;
          });
          
          newState.rescuedSoldiers += soldiersToRescue;
          newState.soundQueue.push('teleport');
          
          // More particles for multiple soldiers
          for (let i = 0; i < 8 + soldiersToRescue * 4; i++) {
            newState.particles.push({
              x: nextBunker.bunker.x + (Math.random() - 0.5) * 20,
              y: nextBunker.bunker.y - 20,
              vx: (Math.random() - 0.5) * 5,
              vy: -Math.random() * 4 - 2,
              life: 35,
              color: '#00ffff',
              size: 2 + Math.random() * 2
            });
          }
        }
      }
    }
  }
  // Phase 2: Pick up any ground soldiers (after all bunkers are empty)
  else if (groundSoldiers.length > 0) {
    const nearest = groundSoldiers.reduce((a, b) => 
      Math.abs(a.x - newState.shipX) < Math.abs(b.x - newState.shipX) ? a : b
    );
    
    const dx = nearest.x - newState.shipX;
    newState.shipX += Math.sign(dx) * 3;
    newState.shipDirection = dx > 0 ? 1 : -1;
    
    // Pick up nearby troopers via teleport
    newState.paratroopers = newState.paratroopers.map(t => {
      if (!t.dead && !t.rescued && !t.enteredBunker && t.landed) {
        if (Math.abs(t.x - newState.shipX) < 30) {
          newState.rescuedSoldiers++;
          newState.soundQueue.push('teleport');
          
          // Teleport beam for ground soldiers
          newState.teleportBeams = [...newState.teleportBeams, {
            fromX: t.x,
            fromY: t.y,
            toX: newState.shipX,
            toY: newState.shipY + 15,
            progress: 0,
            bunkerId: -1
          }];
          
          return { ...t, rescued: true };
        }
      }
      return t;
    });
  }
  // Phase 3: Fly off screen (only when all soldiers are extracted)
  else {
    newState.shipY -= 2;
    if (newState.shipY < -60) {
      newState.phase = 'showing_results';
    }
  }
  
  // Update particles
  newState.particles = newState.particles
    .map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vy: p.vy + 0.04,
      life: p.life - 1
    }))
    .filter(p => p.life > 0);
  
  return newState;
}

function updateParatroopers(state: ParatrooperState): { 
  paratroopers: Paratrooper[]; 
  killed: number; 
  particles: typeof state.particles;
  repairSound: boolean;
  activateSound: boolean;
} {
  const groundY = ARENA_GROUND_Y;
  let killed = 0;
  const particles: typeof state.particles = [];
  let repairSound = false;
  let activateSound = false;
  
  // Track reserved slots per bunker (troopers walking/repairing towards it)
  const reservedByBunkerId = new Map<number, number>();
  state.paratroopers.forEach(t => {
    if (t.targetBunkerId >= 0 && (t.walking || t.repairing) && !t.enteredBunker && !t.dead && !t.rescued) {
      reservedByBunkerId.set(t.targetBunkerId, (reservedByBunkerId.get(t.targetBunkerId) ?? 0) + 1);
    }
  });
  const getReserved = (bunkerId: number) => reservedByBunkerId.get(bunkerId) ?? 0;
  // At least one free slot right now (used for new assignments)
  const hasFreeSlot = (b: Bunker, bunkerId: number) => (b.soldierCount + getReserved(bunkerId)) < 4;
  // This trooper can still fit when considering all currently-reserved troopers (includes itself)
  const canFitReservedGroup = (b: Bunker, bunkerId: number) => (b.soldierCount + getReserved(bunkerId)) <= 4;
  
  const paratroopers = state.paratroopers
    .map(trooper => {
      if (trooper.dead) {
        const newTimer = trooper.deathTimer + 1;
        if (newTimer > 30) return null;
        return { ...trooper, deathTimer: newTimer };
      }
      
      if (trooper.enteredBunker || trooper.rescued) return null;
      
      // Repairing bunker
      if (trooper.repairing && trooper.targetBunkerId >= 0) {
        const bunker = state.bunkers[trooper.targetBunkerId];
        if (bunker && bunker.health >= 100) {
          // Repair complete - check if bunker can fit this reserved group (max 4)
          if (canFitReservedGroup(bunker, trooper.targetBunkerId)) {
            activateSound = true;
            return { ...trooper, repairing: false, enteredBunker: true };
          } else {
            // Bunker full, find another bunker
            return { ...trooper, repairing: false, landed: true, targetBunkerId: -1, walking: false };
          }
        }
        repairSound = true;
        return trooper;
      }
      
      // Walking towards bunker
      if (trooper.landed && trooper.targetBunkerId >= 0) {
        const bunker = state.bunkers[trooper.targetBunkerId];
        if (!bunker) {
          // Find new bunker
          return { ...trooper, targetBunkerId: -1, walking: false };
        }
        
        // Check if bunker is now full (include other troopers heading there)
        // NOTE: getReserved includes this trooper, so > 4 means overbooked.
        if ((bunker.soldierCount + getReserved(trooper.targetBunkerId)) > 4 && bunker.health >= 100) {
          return { ...trooper, targetBunkerId: -1, walking: false };
        }
        
        const blocked = state.moonCracks.some(crack => {
          const trooperSide = trooper.x < crack.x ? 'left' : 'right';
          const bunkerSide = bunker.x < crack.x ? 'left' : 'right';
          return trooperSide !== bunkerSide;
        });
        
        if (blocked) {
          return { ...trooper, walking: false, targetBunkerId: -1 };
        }
        
        const dx = bunker.x - trooper.x;
        
        if (Math.abs(dx) < 10) {
          // Reached bunker - start repairing if damaged
          if (bunker.health < 100) {
            return { ...trooper, walking: false, repairing: true };
          } else if (bunker.soldierCount < 4) {
            // Already repaired and has room - just enter
            activateSound = true;
            return { ...trooper, walking: false, enteredBunker: true };
          } else {
            // Bunker full, find another
            return { ...trooper, walking: false, targetBunkerId: -1 };
          }
        }
        
        return {
          ...trooper,
          x: trooper.x + Math.sign(dx) * 1.5,
          walking: true
        };
      }
      
      // Falling with parachute
      if (!trooper.landed) {
        const newVelocityY = Math.min(trooper.velocityY + 0.06, 1.5);
        const newX = trooper.x + trooper.velocityX;
        const newY = trooper.y + newVelocityY;
        
        const terrainHeight = getTerrainHeightAt(state.terrain, newX);
        
        if (newY >= terrainHeight - 18) {
          const onCrack = state.moonCracks.some(crack => 
            Math.abs(newX - crack.x) < crack.width / 2
          );
          
          if (onCrack) {
            killed++;
            for (let i = 0; i < 8; i++) {
              particles.push({
                x: newX,
                y: terrainHeight,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 2,
                life: 25,
                color: '#ff4444',
                size: 3
              });
            }
            return { ...trooper, dead: true, deathTimer: 0 };
          }
          
          // Find nearest bunker in the same zone that has room considering other incoming troopers
          let nearestBunkerId = -1;
          let nearestDist = Infinity;
          
          state.bunkers.forEach((b, idx) => {
            if (b.health > 0 && hasFreeSlot(b, idx)) {
              const sameZone = !state.moonCracks.some(crack => {
                const trooperSide = newX < crack.x ? 'left' : 'right';
                const bunkerSide = b.x < crack.x ? 'left' : 'right';
                return trooperSide !== bunkerSide;
              });
              
              if (sameZone) {
                const dist = Math.abs(b.x - newX);
                if (dist < nearestDist) {
                  nearestDist = dist;
                  nearestBunkerId = idx;
                }
              }
            }
          });
          
          return {
            ...trooper,
            x: newX,
            y: terrainHeight - 18,
            velocityY: 0,
            velocityX: 0,
            landed: true,
            targetBunkerId: nearestBunkerId,
            walking: nearestBunkerId >= 0
          };
        }
        
        return { ...trooper, x: newX, y: newY, velocityY: newVelocityY };
      }
      
      return trooper;
    })
    .filter((t): t is Paratrooper => t !== null);
  
  return { paratroopers, killed, particles, repairSound, activateSound };
}

function updateBunkers(state: ParatrooperState): { bunkers: Bunker[]; newBullets: BunkerBullet[]; fireSound: boolean } {
  const newBullets: BunkerBullet[] = [];
  let fireSound = false;
  
  const bunkers = state.bunkers.map((bunker, idx) => {
    let newTurretAngle = bunker.turretAngle;
    
    // Check if a trooper is repairing this bunker
    const repairingTrooper = state.paratroopers.find(t => 
      t.repairing && t.targetBunkerId === idx && !t.dead
    );
    
    if (repairingTrooper && bunker.health < 100) {
      const newHealth = Math.min(100, bunker.health + 0.8);
      const newRepairProgress = (newHealth / 100) * 100;
      return { ...bunker, health: newHealth, repairProgress: newRepairProgress, turretAngle: newTurretAngle };
    }
    
    // Count ALL troopers that just entered this bunker (cap at 4 total)
    const troopersEnteringThisBunker = state.paratroopers.filter(t => 
      t.enteredBunker && t.targetBunkerId === idx
    ).length;
    
    if (troopersEnteringThisBunker > 0 && bunker.soldierCount < 4) {
      // Add all entering soldiers, but cap at 4 total
      const newSoldierCount = Math.min(4, bunker.soldierCount + troopersEnteringThisBunker);
      if (!bunker.active) {
        return { ...bunker, activationProgress: 1, soldierCount: newSoldierCount, turretAngle: newTurretAngle };
      }
      return { ...bunker, soldierCount: newSoldierCount, turretAngle: newTurretAngle };
    }
    
    // Continue activation animation
    if (bunker.activationProgress > 0 && bunker.activationProgress < 100) {
      const newProgress = bunker.activationProgress + 3;
      if (newProgress >= 100) {
        return { ...bunker, activationProgress: 100, active: true, turretAngle: newTurretAngle };
      }
      return { ...bunker, activationProgress: newProgress, turretAngle: newTurretAngle };
    }
    
    // Slow passive repair if bunker has soldiers inside and is damaged
    if (bunker.active && bunker.soldierCount > 0 && bunker.health < 100 && bunker.health > 0) {
      const repairRate = 0.05 * bunker.soldierCount; // More soldiers = faster repair
      return { ...bunker, health: Math.min(100, bunker.health + repairRate), fireTimer: bunker.fireTimer + 1, turretAngle: newTurretAngle };
    }
    
    if (!bunker.active || bunker.health <= 0) return bunker;
    
    // Find target for turret rotation
    const visibleAliens = state.alienShips.filter(e => 
      e.active && 
      Math.abs(e.x - bunker.x) < 350 &&
      e.y < bunker.y
    );
    
    if (visibleAliens.length > 0) {
      const target = visibleAliens.reduce((nearest, current) => {
        const currentDist = Math.hypot(current.x - bunker.x, current.y - bunker.y);
        const nearestDist = Math.hypot(nearest.x - bunker.x, nearest.y - bunker.y);
        return currentDist < nearestDist ? current : nearest;
      });
      
      // Calculate target angle and smoothly rotate turret
      const targetAngle = Math.atan2(target.y - (bunker.y - 20), target.x - bunker.x);
      // Clamp angle to upper hemisphere (-PI to 0)
      const clampedTarget = Math.max(-Math.PI, Math.min(0, targetAngle));
      // Smooth rotation towards target
      const angleDiff = clampedTarget - bunker.turretAngle;
      newTurretAngle = bunker.turretAngle + angleDiff * 0.08;
    }
    
    // Fire at enemies - rate depends on soldier count and weapon type
    // 4 soldiers = rocket launcher (slower fire rate)
    // 2-3 soldiers = dual cannon
    // 1 soldier = single cannon
    const isRocketLauncher = bunker.soldierCount >= 4;
    const isDualCannon = bunker.soldierCount >= 2 && bunker.soldierCount < 4;
    const fireRate = isRocketLauncher ? 80 : (isDualCannon ? 30 : 50);
    const newFireTimer = bunker.fireTimer + 1;
    
    if (newFireTimer >= fireRate && visibleAliens.length > 0) {
      const turretBaseY = bunker.y - 5;
      const barrelLength = isRocketLauncher ? 20 : 18;
      
      if (isRocketLauncher) {
        // Rocket launcher - fire homing rocket
        const barrelEndX = bunker.x + Math.cos(newTurretAngle) * barrelLength;
        const barrelEndY = turretBaseY + Math.sin(newTurretAngle) * barrelLength;
        
        // Find target for homing
        const target = visibleAliens.reduce((nearest, current) => {
          const currentDist = Math.hypot(current.x - bunker.x, current.y - bunker.y);
          const nearestDist = Math.hypot(nearest.x - bunker.x, nearest.y - bunker.y);
          return currentDist < nearestDist ? current : nearest;
        });
        const targetIdx = state.alienShips.findIndex(s => s === target);
        
        newBullets.push({
          x: barrelEndX,
          y: barrelEndY,
          velocityX: Math.cos(newTurretAngle) * 5,
          velocityY: Math.sin(newTurretAngle) * 5,
          active: true,
          isRocket: true,
          targetId: targetIdx
        });
        fireSound = true;
      } else if (isDualCannon) {
        // Dual cannon - fire from both barrels
        const barrelSpacing = 4;
        for (let barrel = -1; barrel <= 1; barrel += 2) {
          const perpX = Math.cos(newTurretAngle + Math.PI / 2) * barrelSpacing * barrel * 0.5;
          const perpY = Math.sin(newTurretAngle + Math.PI / 2) * barrelSpacing * barrel * 0.5;
          const barrelEndX = bunker.x + perpX + Math.cos(newTurretAngle) * barrelLength;
          const barrelEndY = turretBaseY + perpY + Math.sin(newTurretAngle) * barrelLength;
          
          newBullets.push({
            x: barrelEndX,
            y: barrelEndY,
            velocityX: Math.cos(newTurretAngle) * 8,
            velocityY: Math.sin(newTurretAngle) * 8,
            active: true
          });
        }
        fireSound = true;
      } else {
        // Single cannon
        const barrelEndX = bunker.x + Math.cos(newTurretAngle) * barrelLength;
        const barrelEndY = turretBaseY + Math.sin(newTurretAngle) * barrelLength;
        
        newBullets.push({
          x: barrelEndX,
          y: barrelEndY,
          velocityX: Math.cos(newTurretAngle) * 8,
          velocityY: Math.sin(newTurretAngle) * 8,
          active: true
        });
        fireSound = true;
      }
      
      return { ...bunker, fireTimer: 0, turretAngle: newTurretAngle };
    }
    
    return { ...bunker, fireTimer: newFireTimer, turretAngle: newTurretAngle };
  });
  
  return { bunkers, newBullets, fireSound };
}

function spawnAlienShip(wave: number): AlienShip {
  const waveTypes: ('tentacle' | 'jellyfish' | 'mothership' | 'swarm')[][] = [
    ['tentacle', 'tentacle', 'jellyfish', 'swarm'],
    ['tentacle', 'jellyfish', 'jellyfish', 'mothership', 'swarm', 'swarm']
  ];
  const types = waveTypes[Math.min(wave - 1, waveTypes.length - 1)];
  const type = types[Math.floor(Math.random() * types.length)];
  
  const fromRight = Math.random() > 0.5;
  const x = fromRight ? GAME_CONFIG.canvasWidth + 40 : -40;
  
  const configs = {
    tentacle: { width: 32, height: 22, health: 35, speed: 1.8 },
    jellyfish: { width: 40, height: 32, health: 55, speed: 1.2 },
    mothership: { width: 65, height: 40, health: 120, speed: 0.6 },
    swarm: { width: 20, height: 15, health: 20, speed: 2.5 }
  };
  
  const config = configs[type];
  
  return {
    x,
    y: 70 + Math.random() * 100,
    width: config.width,
    height: config.height,
    velocityX: fromRight ? -config.speed : config.speed,
    velocityY: 0,
    health: config.health,
    active: true,
    type,
    tentaclePhase: Math.random() * Math.PI * 2,
    fireTimer: 40 + Math.random() * 50,
    targetBunker: -1
  };
}

function updateAlienShips(state: ParatrooperState): { ships: AlienShip[]; newBullets: EnemyBullet[]; bunkerDamage: { index: number; damage: number }[] } {
  const newBullets: EnemyBullet[] = [];
  const bunkerDamage: { index: number; damage: number }[] = [];
  
  const ships = state.alienShips
    .map(ship => {
      if (!ship.active) return ship;
      
      const newTentaclePhase = ship.tentaclePhase + 0.08;
      const wobbleY = Math.sin(state.timer * 0.025 + ship.x * 0.015) * 0.6;
      
      let newFireTimer = ship.fireTimer - 1;
      let newTargetBunker = ship.targetBunker;
      
      // Find active bunker to target
      if (newTargetBunker < 0 || !state.bunkers[newTargetBunker]?.active) {
        const activeBunkers = state.bunkers
          .map((b, idx) => ({ bunker: b, idx }))
          .filter(({ bunker }) => bunker.active && bunker.health > 0);
        
        if (activeBunkers.length > 0) {
          // Target closest active bunker
          const closest = activeBunkers.reduce((a, b) => 
            Math.abs(a.bunker.x - ship.x) < Math.abs(b.bunker.x - ship.x) ? a : b
          );
          newTargetBunker = closest.idx;
        } else {
          newTargetBunker = -1;
        }
      }
      
      if (newFireTimer <= 0) {
        // Priority 1: Shoot at falling troopers
        const fallingTroopers = state.paratroopers.filter(t => !t.landed && !t.dead);
        
        if (fallingTroopers.length > 0 && Math.random() > 0.4) {
          const target = fallingTroopers[Math.floor(Math.random() * fallingTroopers.length)];
          const angle = Math.atan2(target.y - ship.y, target.x - ship.x);
          
          newBullets.push({
            x: ship.x,
            y: ship.y + ship.height / 2,
            velocityX: Math.cos(angle) * 4.5,
            velocityY: Math.sin(angle) * 4.5,
            active: true
          });
          newFireTimer = 70 + Math.random() * 50;
        }
        // Priority 2: Attack active bunkers (must be within 5 bunker lengths distance)
        else if (newTargetBunker >= 0 && state.bunkers[newTargetBunker] && Math.random() > 0.5) {
          const bunker = state.bunkers[newTargetBunker];
          const BUNKER_WIDTH = 42;
          const SHOOTING_RANGE = BUNKER_WIDTH * 5; // 5 bunker lengths
          const distanceX = Math.abs(bunker.x - ship.x);
          const distanceY = Math.abs(bunker.y - ship.y);
          const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          
          // Only fire if within shooting range
          if (distance <= SHOOTING_RANGE) {
            const angle = Math.atan2(bunker.y - ship.y, bunker.x - ship.x);
            
            newBullets.push({
              x: ship.x,
              y: ship.y + ship.height / 2,
              velocityX: Math.cos(angle) * 5,
              velocityY: Math.sin(angle) * 5,
              active: true
            });
            newFireTimer = 80 + Math.random() * 60;
          } else {
            newFireTimer = 30 + Math.random() * 30; // Check again sooner if out of range
          }
        } else {
          newFireTimer = 70 + Math.random() * 50;
        }
      }
      
      return {
        ...ship,
        x: ship.x + ship.velocityX,
        y: Math.max(55, Math.min(180, ship.y + wobbleY)),
        tentaclePhase: newTentaclePhase,
        fireTimer: newFireTimer,
        targetBunker: newTargetBunker
      };
    })
    .filter(ship => ship.active && ship.x > -70 && ship.x < GAME_CONFIG.canvasWidth + 70);
  
  return { ships, newBullets, bunkerDamage };
}

function updateGroundTurrets(state: ParatrooperState): { turrets: GroundTurret[]; newBullets: EnemyBullet[] } {
  const newBullets: EnemyBullet[] = [];
  
  const turrets = state.groundTurrets.map(turret => {
    if (!turret.active) return turret;
    
    const fallingTroopers = state.paratroopers.filter(t => !t.landed && !t.dead);
    let targetAngle = turret.angle;
    
    if (fallingTroopers.length > 0) {
      const closest = fallingTroopers.reduce((c, t) => {
        const dist = Math.hypot(t.x - turret.x, t.y - turret.y);
        const cDist = Math.hypot(c.x - turret.x, c.y - turret.y);
        return dist < cDist ? t : c;
      });
      targetAngle = Math.atan2(closest.y - turret.y, closest.x - turret.x);
    }
    
    let newAngle = turret.angle + (targetAngle - turret.angle) * 0.04;
    
    let newFireTimer = turret.fireTimer + 1;
    if (newFireTimer >= 90 && fallingTroopers.length > 0) {
      newBullets.push({
        x: turret.x + Math.cos(newAngle) * 14,
        y: turret.y + Math.sin(newAngle) * 14,
        velocityX: Math.cos(newAngle) * 4.5,
        velocityY: Math.sin(newAngle) * 4.5,
        active: true
      });
      newFireTimer = 0;
    }
    
    return { ...turret, angle: newAngle, fireTimer: newFireTimer };
  });
  
  return { turrets, newBullets };
}

function updateEnemyBullets(state: ParatrooperState): EnemyBullet[] {
  return state.enemyBullets
    .map(bullet => ({
      ...bullet,
      x: bullet.x + bullet.velocityX,
      y: bullet.y + bullet.velocityY
    }))
    .filter(bullet => 
      bullet.active &&
      bullet.x > -20 &&
      bullet.x < GAME_CONFIG.canvasWidth + 20 &&
      bullet.y > -20 &&
      bullet.y < GAME_CONFIG.canvasHeight
    );
}

function updateBunkerBullets(state: ParatrooperState): BunkerBullet[] {
  return state.bunkerBullets
    .map(bullet => {
      // Homing rockets track their target
      if (bullet.isRocket && bullet.targetId !== undefined && bullet.targetId >= 0) {
        const target = state.alienShips[bullet.targetId];
        if (target && target.active) {
          // Calculate angle to target
          const dx = target.x - bullet.x;
          const dy = target.y - bullet.y;
          const targetAngle = Math.atan2(dy, dx);
          const currentAngle = Math.atan2(bullet.velocityY, bullet.velocityX);
          
          // Smoothly turn towards target
          let angleDiff = targetAngle - currentAngle;
          // Normalize angle difference
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          
          const turnSpeed = 0.12;
          const newAngle = currentAngle + angleDiff * turnSpeed;
          const speed = 6;
          
          return {
            ...bullet,
            x: bullet.x + Math.cos(newAngle) * speed,
            y: bullet.y + Math.sin(newAngle) * speed,
            velocityX: Math.cos(newAngle) * speed,
            velocityY: Math.sin(newAngle) * speed
          };
        }
      }
      
      // Regular bullets just move straight
      return {
        ...bullet,
        x: bullet.x + bullet.velocityX,
        y: bullet.y + bullet.velocityY
      };
    })
    .filter(bullet => 
      bullet.active &&
      bullet.x > -20 &&
      bullet.x < GAME_CONFIG.canvasWidth + 20 &&
      bullet.y > 0 &&
      bullet.y < GAME_CONFIG.canvasHeight
    );
}

function checkCollisions(state: ParatrooperState): {
  alienShips: AlienShip[];
  bullets: BunkerBullet[];
  score: number;
  enemiesRemaining: number;
  newParticles: typeof state.particles;
  hitSound: boolean;
} {
  let score = state.score;
  let enemiesRemaining = state.waveEnemiesRemaining;
  const newParticles: typeof state.particles = [];
  let hitSound = false;
  
  const bullets = state.bunkerBullets.map(b => ({ ...b }));
  const alienShips = state.alienShips.map(ship => {
    if (!ship.active) return ship;
    
    for (const bullet of bullets) {
      if (!bullet.active) continue;
      
      const hit = 
        bullet.x > ship.x - ship.width / 2 &&
        bullet.x < ship.x + ship.width / 2 &&
        bullet.y > ship.y - ship.height / 2 &&
        bullet.y < ship.y + ship.height / 2;
      
      if (hit) {
        bullet.active = false;
        const newHealth = ship.health - 25;
        
        if (newHealth <= 0) {
          hitSound = true;
          enemiesRemaining--;
          const points = ship.type === 'mothership' ? 500 : 
                        ship.type === 'jellyfish' ? 300 : 
                        ship.type === 'swarm' ? 100 : 200;
          score += points;
          
          for (let i = 0; i < 18; i++) {
            newParticles.push({
              x: ship.x,
              y: ship.y,
              vx: (Math.random() - 0.5) * 7,
              vy: (Math.random() - 0.5) * 7,
              life: 30 + Math.random() * 20,
              color: Math.random() > 0.5 ? '#ff3366' : '#9933ff',
              size: 2 + Math.random() * 3
            });
          }
          
          return { ...ship, active: false };
        }
        
        for (let i = 0; i < 4; i++) {
          newParticles.push({
            x: bullet.x,
            y: bullet.y,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            life: 12,
            color: '#ffff00',
            size: 2
          });
        }
        
        return { ...ship, health: newHealth };
      }
    }
    
    return ship;
  });
  
  return { 
    alienShips, 
    bullets: bullets.filter(b => b.active), 
    score, 
    enemiesRemaining,
    newParticles,
    hitSound
  };
}

// Check enemy bullets hitting bunkers
function checkBunkerDamage(state: ParatrooperState): {
  bunkers: Bunker[];
  bullets: EnemyBullet[];
  particles: typeof state.particles;
  damageSound: boolean;
} {
  const particles: typeof state.particles = [];
  let damageSound = false;
  const bullets = state.enemyBullets.map(b => ({ ...b }));
  
  const bunkers = state.bunkers.map(bunker => {
    if (!bunker.active || bunker.health <= 0) return bunker;
    
    for (const bullet of bullets) {
      if (!bullet.active) continue;
      
      // Check if bullet hits bunker
      const hit = 
        bullet.x > bunker.x - bunker.width / 2 &&
        bullet.x < bunker.x + bunker.width / 2 &&
        bullet.y > bunker.y - 25 &&
        bullet.y < bunker.groundY;
      
      if (hit) {
        bullet.active = false;
        damageSound = true;
        
        const newHealth = bunker.health - 15;
        
        // Damage particles
        for (let i = 0; i < 6; i++) {
          particles.push({
            x: bullet.x,
            y: bullet.y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 3,
            life: 20,
            color: Math.random() > 0.5 ? '#888888' : '#666666',
            size: 2
          });
        }
        
        if (newHealth <= 0) {
          // Bunker destroyed
          for (let i = 0; i < 12; i++) {
            particles.push({
              x: bunker.x,
              y: bunker.y,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 5,
              life: 35,
              color: Math.random() > 0.5 ? '#ff6600' : '#ffaa00',
              size: 3
            });
          }
          return { ...bunker, health: 0, active: false };
        }
        
        return { ...bunker, health: newHealth };
      }
    }
    
    return bunker;
  });
  
  return { bunkers, bullets: bullets.filter(b => b.active), particles, damageSound };
}

function checkParatrooperBulletCollisions(state: ParatrooperState): {
  paratroopers: Paratrooper[];
  bullets: EnemyBullet[];
  killed: number;
  particles: typeof state.particles;
} {
  let killed = 0;
  const particles: typeof state.particles = [];
  const bullets = state.enemyBullets.map(b => ({ ...b }));
  
  const paratroopers = state.paratroopers.map(trooper => {
    if (trooper.dead || trooper.landed) return trooper;
    
    for (const bullet of bullets) {
      if (!bullet.active) continue;
      
      const dist = Math.hypot(bullet.x - trooper.x, bullet.y - trooper.y);
      if (dist < 16) {
        bullet.active = false;
        killed++;
        
        for (let i = 0; i < 10; i++) {
          particles.push({
            x: trooper.x,
            y: trooper.y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5 - 1,
            life: 28,
            color: Math.random() > 0.5 ? '#ff4444' : '#ffaa00',
            size: 3
          });
        }
        
        return { ...trooper, dead: true, deathTimer: 0 };
      }
    }
    
    return trooper;
  });
  
  return { paratroopers, bullets: bullets.filter(b => b.active), killed, particles };
}

function checkMineCollisions(state: ParatrooperState): {
  paratroopers: Paratrooper[];
  killed: number;
  particles: typeof state.particles;
} {
  let killed = 0;
  const particles: typeof state.particles = [];
  
  const paratroopers = state.paratroopers.map(trooper => {
    if (trooper.dead || trooper.landed) return trooper;
    
    for (const mine of state.spaceMines) {
      const dist = Math.hypot(mine.x - trooper.x, mine.y - trooper.y);
      if (dist < mine.radius + 10) {
        killed++;
        
        for (let i = 0; i < 14; i++) {
          particles.push({
            x: trooper.x,
            y: trooper.y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 32,
            color: Math.random() > 0.5 ? '#ff0000' : '#ff6600',
            size: 3
          });
        }
        
        return { ...trooper, dead: true, deathTimer: 0 };
      }
    }
    
    return trooper;
  });
  
  return { paratroopers, killed, particles };
}

export function renderParatrooper(
  ctx: CanvasRenderingContext2D,
  state: ParatrooperState
): void {
  // Deep space background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, GAME_CONFIG.canvasHeight);
  bgGrad.addColorStop(0, '#020208');
  bgGrad.addColorStop(0.3, '#060612');
  bgGrad.addColorStop(0.7, '#0a0a18');
  bgGrad.addColorStop(1, '#101020');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
  
  // Nebulae
  state.nebulae.forEach(nebula => {
    const grad = ctx.createRadialGradient(nebula.x, nebula.y, 0, nebula.x, nebula.y, nebula.radius);
    grad.addColorStop(0, `${nebula.color}${Math.floor(nebula.opacity * 255).toString(16).padStart(2, '0')}`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Stars
  state.stars.forEach(star => {
    const twinkle = 0.5 + Math.sin(star.twinkle) * 0.35;
    ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * twinkle})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Distant planet
  const planetGrad = ctx.createRadialGradient(
    GAME_CONFIG.canvasWidth - 70, 60, 0,
    GAME_CONFIG.canvasWidth - 70, 60, 40
  );
  planetGrad.addColorStop(0, '#775588');
  planetGrad.addColorStop(0.5, '#554466');
  planetGrad.addColorStop(1, '#332244');
  ctx.fillStyle = planetGrad;
  ctx.beginPath();
  ctx.arc(GAME_CONFIG.canvasWidth - 70, 60, 40, 0, Math.PI * 2);
  ctx.fill();
  
  // Planet rings
  ctx.strokeStyle = 'rgba(150, 130, 170, 0.4)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(GAME_CONFIG.canvasWidth - 70, 60, 55, 12, -0.2, 0, Math.PI * 2);
  ctx.stroke();
  
  // Background mountains
  state.mountains.forEach(mountain => {
    const mountainGrad = ctx.createLinearGradient(mountain.x, mountain.baseY - mountain.height, mountain.x, mountain.baseY);
    mountainGrad.addColorStop(0, '#3a3a48');
    mountainGrad.addColorStop(1, '#2a2a38');
    ctx.fillStyle = mountainGrad;
    
    ctx.beginPath();
    ctx.moveTo(mountain.x - mountain.width / 2, mountain.baseY);
    
    const peakWidth = mountain.width / (mountain.peaks.length + 1);
    mountain.peaks.forEach((peakHeight, i) => {
      const px = mountain.x - mountain.width / 2 + peakWidth * (i + 1);
      const py = mountain.baseY - mountain.height * peakHeight;
      ctx.lineTo(px, py);
    });
    
    ctx.lineTo(mountain.x + mountain.width / 2, mountain.baseY);
    ctx.closePath();
    ctx.fill();
  });
  
  // Space mines
  state.spaceMines.forEach(mine => {
    const pulse = 0.8 + Math.sin(mine.pulsePhase) * 0.2;
    
    const mineGrad = ctx.createRadialGradient(mine.x, mine.y, 0, mine.x, mine.y, mine.radius * 1.4);
    mineGrad.addColorStop(0, `rgba(255, 50, 50, ${0.35 * pulse})`);
    mineGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');
    ctx.fillStyle = mineGrad;
    ctx.beginPath();
    ctx.arc(mine.x, mine.y, mine.radius * 1.4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#660000';
    ctx.beginPath();
    ctx.arc(mine.x, mine.y, mine.radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#aa0000';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + mine.pulsePhase * 0.15;
      ctx.beginPath();
      ctx.moveTo(mine.x + Math.cos(angle) * mine.radius, mine.y + Math.sin(angle) * mine.radius);
      ctx.lineTo(mine.x + Math.cos(angle) * (mine.radius + 5), mine.y + Math.sin(angle) * (mine.radius + 5));
      ctx.stroke();
    }
    
    ctx.fillStyle = `rgba(255, 80, 80, ${pulse})`;
    ctx.beginPath();
    ctx.arc(mine.x, mine.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Moon terrain with craters
  const groundY = ARENA_GROUND_Y;
  
  // Main terrain fill
  const terrainGrad = ctx.createLinearGradient(0, groundY - 20, 0, GAME_CONFIG.canvasHeight);
  terrainGrad.addColorStop(0, '#5a5a68');
  terrainGrad.addColorStop(0.15, '#4a4a58');
  terrainGrad.addColorStop(0.4, '#3a3a48');
  terrainGrad.addColorStop(1, '#2a2a38');
  ctx.fillStyle = terrainGrad;
  
  ctx.beginPath();
  ctx.moveTo(0, GAME_CONFIG.canvasHeight);
  state.terrain.forEach((segment, i) => {
    if (i === 0) ctx.moveTo(segment.x, segment.y);
    else ctx.lineTo(segment.x, segment.y);
  });
  ctx.lineTo(GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
  ctx.lineTo(0, GAME_CONFIG.canvasHeight);
  ctx.closePath();
  ctx.fill();
  
  // Terrain surface highlight
  ctx.strokeStyle = '#6a6a78';
  ctx.lineWidth = 2;
  ctx.beginPath();
  state.terrain.forEach((segment, i) => {
    if (i === 0) ctx.moveTo(segment.x, segment.y);
    else ctx.lineTo(segment.x, segment.y);
  });
  ctx.stroke();
  
  // Craters
  state.craters.forEach(crater => {
    const craterGrad = ctx.createRadialGradient(
      crater.x - crater.radius * 0.2, crater.y - crater.radius * 0.2, 0,
      crater.x, crater.y, crater.radius
    );
    craterGrad.addColorStop(0, '#2a2a38');
    craterGrad.addColorStop(crater.depth, '#3a3a48');
    craterGrad.addColorStop(1, '#4a4a58');
    ctx.fillStyle = craterGrad;
    ctx.beginPath();
    ctx.ellipse(crater.x, crater.y, crater.radius, crater.radius * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Crater rim highlight
    ctx.strokeStyle = 'rgba(100, 100, 120, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(crater.x, crater.y - 1, crater.radius * 0.9, crater.radius * 0.35, 0, Math.PI, 0);
    ctx.stroke();
  });
  
  // Moon cracks
  state.moonCracks.forEach(crack => {
    ctx.fillStyle = '#000000';
    ctx.fillRect(crack.x - crack.width / 2, crack.topY, crack.width, crack.bottomY - crack.topY);
    
    ctx.strokeStyle = '#ff3300';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ff3300';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(crack.x - crack.width / 2, crack.topY);
    ctx.lineTo(crack.x - crack.width / 2, crack.bottomY);
    ctx.moveTo(crack.x + crack.width / 2, crack.topY);
    ctx.lineTo(crack.x + crack.width / 2, crack.bottomY);
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Lava glow from below
    const lavaGrad = ctx.createLinearGradient(crack.x, crack.topY, crack.x, crack.bottomY);
    lavaGrad.addColorStop(0, 'rgba(255, 100, 0, 0)');
    lavaGrad.addColorStop(0.7, 'rgba(255, 100, 0, 0.2)');
    lavaGrad.addColorStop(1, 'rgba(255, 50, 0, 0.5)');
    ctx.fillStyle = lavaGrad;
    ctx.fillRect(crack.x - crack.width / 2 + 2, crack.topY, crack.width - 4, crack.bottomY - crack.topY);
  });
  
  // Ground turrets removed - bunkers have rotating turrets now
  
  
  // Bunkers
  renderBunkers(ctx, state);
  
  // Paratroopers
  renderParatroopers(ctx, state);
  
  // Alien ships
  renderAlienShips(ctx, state);
  
  // Bullets
  ctx.fillStyle = '#ff3333';
  state.enemyBullets.forEach(bullet => {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 50, 50, 0.4)';
    ctx.beginPath();
    ctx.arc(bullet.x - bullet.velocityX * 0.5, bullet.y - bullet.velocityY * 0.5, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff3333';
  });
  
  state.bunkerBullets.forEach(bullet => {
    if (bullet.isRocket) {
      // Render rocket with trail
      const angle = Math.atan2(bullet.velocityY, bullet.velocityX);
      
      // Rocket trail/exhaust
      ctx.fillStyle = 'rgba(255, 150, 50, 0.6)';
      ctx.beginPath();
      ctx.moveTo(bullet.x - Math.cos(angle) * 12, bullet.y - Math.sin(angle) * 12);
      ctx.lineTo(bullet.x - Math.cos(angle + 0.3) * 8, bullet.y - Math.sin(angle + 0.3) * 8);
      ctx.lineTo(bullet.x - Math.cos(angle - 0.3) * 8, bullet.y - Math.sin(angle - 0.3) * 8);
      ctx.closePath();
      ctx.fill();
      
      // Rocket body
      ctx.fillStyle = '#ff6644';
      ctx.save();
      ctx.translate(bullet.x, bullet.y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.lineTo(-4, -3);
      ctx.lineTo(-4, 3);
      ctx.closePath();
      ctx.fill();
      
      // Rocket tip
      ctx.fillStyle = '#ffaa44';
      ctx.beginPath();
      ctx.arc(3, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      // Regular bullet
      ctx.fillStyle = '#66ff66';
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(100, 255, 100, 0.4)';
      ctx.beginPath();
      ctx.arc(bullet.x - bullet.velocityX * 0.4, bullet.y - bullet.velocityY * 0.4, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  
  // Particles
  state.particles.forEach(particle => {
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = particle.life / 35;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  
  // Player ship
  renderPlayerShip(ctx, state);
  
  // UI
  renderUI(ctx, state);
  
  // Overlays
  if (state.phase === 'intro') {
    renderIntro(ctx, state);
  } else if (state.phase === 'wave_complete') {
    renderWaveComplete(ctx, state);
  } else if (state.phase === 'showing_results') {
    renderComplete(ctx, state);
  }
}

function renderBunkers(ctx: CanvasRenderingContext2D, state: ParatrooperState) {
  state.bunkers.forEach(bunker => {
    const isRepairing = bunker.health < 100 && bunker.repairProgress > 0;
    const isActivating = bunker.activationProgress > 0 && bunker.activationProgress < 100;
    const damageLevel = bunker.health / 100;
    
    // Bunker connected to ground
    const bunkerBaseY = bunker.groundY;
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(bunker.x, bunkerBaseY + 3, bunker.width / 2 + 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Base structure - concrete look
    let baseColor: string;
    if (bunker.active) {
      baseColor = '#3a6644';
    } else if (isActivating) {
      const flash = Math.sin(bunker.activationProgress * 0.3) > 0;
      baseColor = flash ? '#4a7754' : '#3a5544';
    } else {
      // Damaged - rusty/broken appearance
      baseColor = `rgb(${100 - damageLevel * 20}, ${90 - damageLevel * 10}, ${80})`;
    }
    
    // Main bunker body - shorter, more like a base platform
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.moveTo(bunker.x - bunker.width / 2, bunkerBaseY);
    ctx.lineTo(bunker.x - bunker.width / 2, bunker.y + 5);
    ctx.lineTo(bunker.x - bunker.width / 2 + 5, bunker.y);
    ctx.lineTo(bunker.x + bunker.width / 2 - 5, bunker.y);
    ctx.lineTo(bunker.x + bunker.width / 2, bunker.y + 5);
    ctx.lineTo(bunker.x + bunker.width / 2, bunkerBaseY);
    ctx.closePath();
    ctx.fill();
    
    // Damage details
    if (bunker.health < 100) {
      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = 1;
      
      // Cracks
      if (damageLevel < 0.8) {
        ctx.beginPath();
        ctx.moveTo(bunker.x - 10, bunker.y + 2);
        ctx.lineTo(bunker.x - 5, bunker.y + 8);
        ctx.stroke();
      }
      if (damageLevel < 0.6) {
        ctx.beginPath();
        ctx.moveTo(bunker.x + 8, bunker.y + 4);
        ctx.lineTo(bunker.x + 12, bunker.y + 10);
        ctx.stroke();
      }
      
      // Rust spots
      ctx.fillStyle = 'rgba(120, 80, 50, 0.4)';
      ctx.beginPath();
      ctx.arc(bunker.x - 12, bunker.y + 8, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Reinforced edges
    ctx.strokeStyle = bunker.active ? '#2a4433' : '#4a4a4a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bunker.x - bunker.width / 2, bunkerBaseY);
    ctx.lineTo(bunker.x - bunker.width / 2, bunker.y + 5);
    ctx.moveTo(bunker.x + bunker.width / 2, bunkerBaseY);
    ctx.lineTo(bunker.x + bunker.width / 2, bunker.y + 5);
    ctx.stroke();
    
    // Rotating turret if active - different weapon types based on soldier count
    if (bunker.active) {
      const turretBaseX = bunker.x;
      const turretBaseY = bunker.y - 5;
      const turretAngle = bunker.turretAngle;
      
      const isRocketLauncher = bunker.soldierCount >= 4;
      const isDualCannon = bunker.soldierCount >= 2 && bunker.soldierCount < 4;
      
      // Turret rotating base (circular) - larger for rocket launcher
      const baseSize = isRocketLauncher ? 10 : 8;
      ctx.fillStyle = isRocketLauncher ? '#553322' : '#2a5533';
      ctx.beginPath();
      ctx.arc(turretBaseX, turretBaseY, baseSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Turret base rim
      ctx.strokeStyle = isRocketLauncher ? '#332211' : '#1a3322';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(turretBaseX, turretBaseY, baseSize, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.save();
      ctx.translate(turretBaseX, turretBaseY);
      ctx.rotate(turretAngle);
      
      if (isRocketLauncher) {
        // Rocket launcher - thick rectangular tube
        const barrelLength = 22;
        
        // Main launcher body
        ctx.fillStyle = '#442211';
        ctx.fillRect(-2, -5, barrelLength, 10);
        
        // Launcher details
        ctx.fillStyle = '#553322';
        ctx.fillRect(barrelLength - 6, -6, 6, 12);
        
        // Launcher stripes
        ctx.fillStyle = '#ff6633';
        ctx.fillRect(4, -5, 2, 10);
        ctx.fillRect(10, -5, 2, 10);
        
        // Muzzle flash
        if (bunker.fireTimer < 8) {
          ctx.fillStyle = '#ff8844';
          ctx.shadowColor = '#ff6600';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(barrelLength + 4, 0, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      } else if (isDualCannon) {
        // Dual cannon - two parallel barrels
        const barrelLength = 18;
        const barrelSpacing = 4;
        
        for (let barrel = -1; barrel <= 1; barrel += 2) {
          const yOffset = barrelSpacing * barrel * 0.5;
          
          // Barrel body
          ctx.fillStyle = '#1a3322';
          ctx.beginPath();
          ctx.moveTo(0, yOffset - 2);
          ctx.lineTo(barrelLength - 3, yOffset - 1.5);
          ctx.lineTo(barrelLength, yOffset - 2);
          ctx.lineTo(barrelLength, yOffset + 2);
          ctx.lineTo(barrelLength - 3, yOffset + 1.5);
          ctx.lineTo(0, yOffset + 2);
          ctx.closePath();
          ctx.fill();
        }
        
        // Connection piece between barrels
        ctx.fillStyle = '#2a4433';
        ctx.fillRect(-1, -barrelSpacing * 0.5, 6, barrelSpacing);
        
        // Muzzle flash
        if (bunker.fireTimer < 5) {
          ctx.fillStyle = '#ffff44';
          ctx.shadowColor = '#ffff00';
          ctx.shadowBlur = 12;
          for (let barrel = -1; barrel <= 1; barrel += 2) {
            ctx.beginPath();
            ctx.arc(barrelLength + 3, barrelSpacing * barrel * 0.5, 4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.shadowBlur = 0;
        }
      } else {
        // Single cannon (1 soldier)
        const barrelLength = 18;
        
        // Barrel body
        ctx.fillStyle = '#1a3322';
        ctx.beginPath();
        ctx.moveTo(0, -3);
        ctx.lineTo(barrelLength - 4, -2.5);
        ctx.lineTo(barrelLength, -3);
        ctx.lineTo(barrelLength, 3);
        ctx.lineTo(barrelLength - 4, 2.5);
        ctx.lineTo(0, 3);
        ctx.closePath();
        ctx.fill();
        
        // Barrel highlight
        ctx.fillStyle = '#2a4433';
        ctx.fillRect(2, -2, barrelLength - 8, 1.5);
        
        // Muzzle flash
        if (bunker.fireTimer < 5) {
          ctx.fillStyle = '#ffff44';
          ctx.shadowColor = '#ffff00';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(barrelLength + 3, 0, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      
      ctx.restore();
      
      // Soldier count and weapon type indicator
      if (bunker.soldierCount >= 1) {
        const weaponLabel = isRocketLauncher ? '🚀' : (isDualCannon ? '⚡' : '');
        ctx.fillStyle = isRocketLauncher ? '#ff6644' : (isDualCannon ? '#44aaff' : '#66ff66');
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${bunker.soldierCount}/4 ${weaponLabel}`, bunker.x, bunker.y - 22);
      }
    }
    
    // Repair progress bar
    if (isRepairing) {
      ctx.fillStyle = '#222';
      ctx.fillRect(bunker.x - 18, bunker.y - 30, 36, 6);
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(bunker.x - 18, bunker.y - 30, 36 * (bunker.health / 100), 6);
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1;
      ctx.strokeRect(bunker.x - 18, bunker.y - 30, 36, 6);
      
      // Repair text
      ctx.fillStyle = '#ffaa00';
      ctx.font = '8px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('REPAIR', bunker.x, bunker.y - 34);
    }
    
    // Activation progress bar
    if (isActivating) {
      ctx.fillStyle = '#222';
      ctx.fillRect(bunker.x - 18, bunker.y - 30, 36, 6);
      ctx.fillStyle = '#66ff66';
      ctx.fillRect(bunker.x - 18, bunker.y - 30, 36 * (bunker.activationProgress / 100), 6);
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1;
      ctx.strokeRect(bunker.x - 18, bunker.y - 30, 36, 6);
    }
  });
}

function renderParatroopers(ctx: CanvasRenderingContext2D, state: ParatrooperState) {
  state.paratroopers.forEach(trooper => {
    if (trooper.dead) {
      ctx.fillStyle = `rgba(255, 100, 100, ${1 - trooper.deathTimer / 30})`;
      ctx.beginPath();
      ctx.arc(trooper.x, trooper.y + trooper.deathTimer * 2, 4, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    
    if (!trooper.landed) {
      // Parachute
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(trooper.x, trooper.y - 20, 14, Math.PI, 0);
      ctx.fill();
      
      // Parachute stripes
      ctx.fillStyle = '#44aa44';
      ctx.beginPath();
      ctx.arc(trooper.x, trooper.y - 20, 14, Math.PI + 0.4, Math.PI + 1.0);
      ctx.lineTo(trooper.x, trooper.y - 20);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(trooper.x, trooper.y - 20, 14, -0.4, -1.0, true);
      ctx.lineTo(trooper.x, trooper.y - 20);
      ctx.fill();
      
      // Parachute lines
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(trooper.x - 14, trooper.y - 20);
      ctx.lineTo(trooper.x - 2, trooper.y - 2);
      ctx.moveTo(trooper.x + 14, trooper.y - 20);
      ctx.lineTo(trooper.x + 2, trooper.y - 2);
      ctx.moveTo(trooper.x, trooper.y - 20);
      ctx.lineTo(trooper.x, trooper.y - 2);
      ctx.stroke();
    }
    
    // Soldier body
    ctx.fillStyle = '#44aa44';
    ctx.fillRect(trooper.x - 3, trooper.y, 6, 12);
    
    // Helmet
    ctx.fillStyle = '#336633';
    ctx.beginPath();
    ctx.arc(trooper.x, trooper.y - 2, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Walking animation
    if (trooper.walking) {
      const legOffset = Math.sin(state.timer * 0.4) * 2;
      ctx.fillStyle = '#44aa44';
      ctx.fillRect(trooper.x - 3, trooper.y + 12, 2, 4 + legOffset);
      ctx.fillRect(trooper.x + 1, trooper.y + 12, 2, 4 - legOffset);
    }
    
    // Repairing animation
    if (trooper.repairing) {
      const toolOffset = Math.sin(state.timer * 0.3) * 3;
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(trooper.x + 5, trooper.y + toolOffset, 3, 6);
    }
  });
}

function renderAlienShips(ctx: CanvasRenderingContext2D, state: ParatrooperState) {
  state.alienShips.forEach(ship => {
    if (!ship.active) return;
    
    const facing = ship.velocityX > 0 ? 1 : -1;
    
    if (ship.type === 'tentacle') {
      ctx.fillStyle = '#aa3366';
      ctx.beginPath();
      ctx.ellipse(ship.x, ship.y, ship.width / 2, ship.height / 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(ship.x + facing * 7, ship.y - 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(ship.x + facing * 8, ship.y - 2, 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#883355';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const tx = ship.x - facing * 4 + (i - 1.5) * 7;
        const wave = Math.sin(ship.tentaclePhase + i * 0.7) * 6;
        ctx.beginPath();
        ctx.moveTo(tx, ship.y + ship.height / 3);
        ctx.quadraticCurveTo(tx + wave, ship.y + ship.height / 2 + 8, tx + wave * 1.3, ship.y + ship.height / 2 + 16);
        ctx.stroke();
      }
    } else if (ship.type === 'jellyfish') {
      const jellGrad = ctx.createRadialGradient(ship.x, ship.y - 4, 0, ship.x, ship.y - 4, ship.width / 2);
      jellGrad.addColorStop(0, 'rgba(150, 100, 255, 0.9)');
      jellGrad.addColorStop(1, 'rgba(100, 50, 200, 0.5)');
      ctx.fillStyle = jellGrad;
      ctx.beginPath();
      ctx.arc(ship.x, ship.y - 4, ship.width / 2, Math.PI, 0);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(200, 150, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(ship.x, ship.y - 7, ship.width / 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(150, 100, 255, 0.6)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const tx = ship.x + (i - 2) * 6;
        const wave = Math.sin(ship.tentaclePhase + i * 0.5) * 4;
        ctx.beginPath();
        ctx.moveTo(tx, ship.y);
        ctx.bezierCurveTo(tx + wave, ship.y + 12, tx - wave, ship.y + 22, tx + wave * 0.5, ship.y + 30);
        ctx.stroke();
      }
    } else if (ship.type === 'mothership') {
      ctx.fillStyle = '#552244';
      ctx.beginPath();
      ctx.ellipse(ship.x, ship.y, ship.width / 2, ship.height / 3, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#663355';
      ctx.beginPath();
      ctx.arc(ship.x, ship.y - 7, 13, Math.PI, 0);
      ctx.fill();
      
      ctx.fillStyle = '#ff3333';
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.arc(ship.x + i * 10, ship.y - 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.strokeStyle = '#442233';
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        const tx = ship.x + (i - 1) * 18;
        const wave = Math.sin(ship.tentaclePhase + i * 0.6) * 8;
        ctx.beginPath();
        ctx.moveTo(tx, ship.y + ship.height / 3);
        ctx.bezierCurveTo(tx + wave, ship.y + ship.height / 2 + 12, tx - wave, ship.y + ship.height / 2 + 22, tx + wave * 0.7, ship.y + ship.height / 2 + 35);
        ctx.stroke();
      }
      
      ctx.fillStyle = 'rgba(255, 50, 100, 0.3)';
      ctx.beginPath();
      ctx.ellipse(ship.x, ship.y + 8, 22, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (ship.type === 'swarm') {
      ctx.fillStyle = '#66aa66';
      ctx.beginPath();
      ctx.ellipse(ship.x, ship.y, ship.width / 2, ship.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(ship.x + facing * 4, ship.y, 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#448844';
      ctx.lineWidth = 1;
      for (let i = 0; i < 2; i++) {
        const tx = ship.x + (i - 0.5) * 5;
        const wave = Math.sin(ship.tentaclePhase + i) * 3;
        ctx.beginPath();
        ctx.moveTo(tx, ship.y + ship.height / 2);
        ctx.lineTo(tx + wave, ship.y + ship.height / 2 + 8);
        ctx.stroke();
      }
    }
  });
}

function renderPlayerShip(ctx: CanvasRenderingContext2D, state: ParatrooperState) {
  const { shipX, shipY, shipDirection } = state;
  
  ctx.save();
  ctx.translate(shipX, shipY);
  if (shipDirection < 0) {
    ctx.scale(-1, 1);
  }
  
  // Engine glow (orange/red for Scarlet Blade)
  if (state.phase === 'extraction' && state.extractionTimer > 350) {
    const glowGrad = ctx.createRadialGradient(-25, 0, 0, -25, 0, 40);
    glowGrad.addColorStop(0, 'rgba(255, 100, 50, 0.6)');
    glowGrad.addColorStop(0.5, 'rgba(255, 50, 50, 0.3)');
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(-65, -25, 45, 50);
  }
  
  // Draw the selected mega ship with skin colors
  const megaShipId = getStoredMegaShipId();
  const time = Date.now() * 0.003;
  const skinColors = getStoredSkinColors();
  drawMegaShip(ctx, 0, 0, megaShipId, time, skinColors);

  
  ctx.restore();
  
  // Drop zone indicator
  if (state.phase === 'playing') {
    ctx.fillStyle = 'rgba(100, 255, 100, 0.2)';
    ctx.beginPath();
    ctx.moveTo(shipX - 6, shipY + 22);
    ctx.lineTo(shipX + 6, shipY + 22);
    ctx.lineTo(shipX, ARENA_GROUND_Y - 25);
    ctx.closePath();
    ctx.fill();
  }
  
  // Teleport beams during extraction
  state.teleportBeams.forEach(beam => {
    const alpha = 1 - beam.progress / 100;
    
    // Beam line
    ctx.strokeStyle = `rgba(0, 255, 255, ${alpha * 0.8})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(beam.fromX, beam.fromY);
    ctx.lineTo(beam.toX, beam.toY);
    ctx.stroke();
    
    // Beam glow
    ctx.strokeStyle = `rgba(100, 255, 255, ${alpha * 0.4})`;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(beam.fromX, beam.fromY);
    ctx.lineTo(beam.toX, beam.toY);
    ctx.stroke();
    
    // Particles along beam
    const progress = beam.progress / 100;
    const particleX = beam.fromX + (beam.toX - beam.fromX) * progress;
    const particleY = beam.fromY + (beam.toY - beam.fromY) * progress;
    
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(particleX, particleY, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function renderUI(ctx: CanvasRenderingContext2D, state: ParatrooperState) {
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${state.score}`, 12, 25);
  
  ctx.fillStyle = state.availableSoldiers > 3 ? '#66ff66' : '#ff6666';
  ctx.fillText(`Soldiers: ${state.availableSoldiers}`, 12, 45);
  
  if (state.lostSoldiers > 0) {
    ctx.fillStyle = '#ff4444';
    ctx.font = '14px Arial';
    ctx.fillText(`Lost: ${state.lostSoldiers}`, 12, 63);
  }
  
  const activeBunkers = state.bunkers.filter(b => b.active).length;
  ctx.fillStyle = '#44aaff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`Bunkers: ${activeBunkers}/${state.bunkers.length}`, GAME_CONFIG.canvasWidth - 12, 25);
  
  // Wave indicator
  ctx.fillStyle = '#ffaa44';
  ctx.fillText(`Wave ${state.currentWave}/${state.totalWaves}`, GAME_CONFIG.canvasWidth - 12, 45);
  
  // Enemies remaining
  if (state.phase === 'playing') {
    const activeEnemies = state.alienShips.filter(s => s.active).length;
    const remaining = state.waveMaxEnemies - state.waveEnemiesSpawned + activeEnemies;
    ctx.fillStyle = '#ff6666';
    ctx.font = '14px Arial';
    ctx.fillText(`Enemies: ${remaining}`, GAME_CONFIG.canvasWidth - 12, 63);
  }
  
  // Controls hint
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.font = '11px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('← → move ship | Tap/Click to drop soldiers', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight - 8);
}

function renderIntro(ctx: CanvasRenderingContext2D, state: ParatrooperState) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('TACTICAL DEFENSE', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 - 90);
  
  ctx.font = '15px Arial';
  ctx.fillStyle = '#aaaaaa';
  ctx.fillText('Drop paratroopers to repair and activate bunkers', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 - 45);
  ctx.fillText('More soldiers per bunker = more firepower!', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 - 20);
  ctx.fillText('Soldiers can be shot down - be strategic!', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 + 5);
  ctx.fillText('Survive 2 waves of enemies', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 + 30);
  
  ctx.fillStyle = '#66ff66';
  ctx.font = 'bold 18px Arial';
  ctx.fillText(`You have ${state.availableSoldiers} soldiers`, GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 + 75);
  
  ctx.fillStyle = '#888888';
  ctx.font = '12px Arial';
  ctx.fillText('Starting soon...', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 + 105);
}

function renderWaveComplete(ctx: CanvasRenderingContext2D, state: ParatrooperState) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
  
  ctx.fillStyle = '#66ff66';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`WAVE ${state.currentWave} CLEAR!`, GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 - 30);
  
  if (state.currentWave < state.totalWaves) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial';
    ctx.fillText('Next wave incoming...', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 + 15);
  } else {
    ctx.fillStyle = '#ffaa44';
    ctx.font = '18px Arial';
    ctx.fillText('All waves defeated! Extracting survivors...', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 + 15);
  }
}

function renderComplete(ctx: CanvasRenderingContext2D, state: ParatrooperState) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
  ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
  
  ctx.fillStyle = '#ffff00';
  ctx.font = 'bold 40px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('MISSION COMPLETE!', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 - 80);
  
  ctx.font = '20px monospace';
  ctx.fillStyle = '#66ff66';
  ctx.fillText(`Bonus Score: ${state.score}`, GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 - 35);
  
  const activeBunkers = state.bunkers.filter(b => b.active).length;
  ctx.fillStyle = '#44aaff';
  ctx.fillText(`Bunkers Activated: ${activeBunkers}`, GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 - 5);
  
  ctx.fillStyle = '#ff8844';
  ctx.fillText(`Soldiers Deployed: ${state.deployedSoldiers}`, GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 + 25);
  
  if (state.rescuedSoldiers > 0) {
    ctx.fillStyle = '#66ff66';
    ctx.fillText(`Soldiers Rescued: ${state.rescuedSoldiers}`, GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 + 55);
  }
  
  // Tap to continue
  ctx.fillStyle = '#ffffff';
  ctx.font = '18px monospace';
  if (Math.floor(Date.now() / 500) % 2 === 0) {
    ctx.fillText('TAP TO CONTINUE', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 + 110);
  }
}
