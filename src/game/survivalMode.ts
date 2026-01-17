import { Player, Enemy, Bullet, Particle, Pickup, Star } from './types';
import { createPlayer, createEnemy, createPickup } from './entities';
import { GAME_CONFIG, TOUCH_CONFIG } from './constants';
import { lerp, getAudioContext } from './utils';
import { drawMegaShip } from './megaShipRenderer';
import { getStoredMegaShipId } from '@/hooks/useMegaShips';
import { getStoredSkinColors } from '@/hooks/useEquipment';

// Survival mode sound types
export type SurvivalSoundType = 'shoot' | 'explosion' | 'hit' | 'powerup' | 'spawn' | 'wave' | 'warning';

// Dedicated sound function for survival mode with space/sci-fi theme
export function playSurvivalSound(type: SurvivalSoundType): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    switch (type) {
      case 'shoot': {
        // Futuristic laser shot
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        
        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(ctx.destination);
        gain2.connect(ctx.destination);
        
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(1400, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
        gain1.gain.setValueAtTime(0.1, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(700, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
        gain2.gain.setValueAtTime(0.06, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.08);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.1);
        break;
      }
      
      case 'explosion': {
        // Deep space explosion
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
        osc1.frequency.setValueAtTime(180, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 0.4);
        gain1.gain.setValueAtTime(0.18, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(120, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.35);
        gain2.gain.setValueAtTime(0.12, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        
        noise.type = 'triangle';
        noise.frequency.setValueAtTime(100, ctx.currentTime);
        noise.frequency.exponentialRampToValueAtTime(15, ctx.currentTime + 0.5);
        gainNoise.gain.setValueAtTime(0.08, ctx.currentTime);
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
        // Shield hit/damage sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
        break;
      }
      
      case 'powerup': {
        // Wave complete / powerup sound - triumphant ascending tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
        osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
        break;
      }
      
      case 'spawn': {
        // Enemy spawn warning blip
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.setValueAtTime(600, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
        break;
      }
      
      case 'wave': {
        // New wave incoming - dramatic rising sound
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        
        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(ctx.destination);
        gain2.connect(ctx.destination);
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(200, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);
        gain1.gain.setValueAtTime(0.1, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(100, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.5);
        gain2.gain.setValueAtTime(0.08, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.5);
        osc2.start(ctx.currentTime);
        osc2.stop(ctx.currentTime + 0.5);
        break;
      }
      
      case 'warning': {
        // Low health warning beep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.setValueAtTime(400, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
        break;
      }
    }
  } catch (e) {
    // Audio not supported or blocked
  }
}

export interface SurvivalState {
  phase: 'playing' | 'gameover';
  wave: number;
  waveTimer: number;
  waveEnemiesSpawned: number;
  waveEnemiesTotal: number;
  waveCooldown: number;
  
  player: Player;
  enemies: any[];  // SurvivalEnemy type
  bullets: Bullet[];
  particles: Particle[];
  pickups: Pickup[];
  stars: Star[];
  nebulas: { x: number; y: number; size: number; color: string; alpha: number }[];
  collisionFlash: { x: number; y: number; timer: number; color: string }[];
  speedLines: { x: number; y: number; length: number; speed: number; alpha: number }[];
  distantStars: { x: number; y: number; size: number; brightness: number; layer: number }[];
  
  score: number;
  highScore: number;
  kills: number;
  
  difficulty: number;
  spawnTimer: number;
  formationTimer: number;
  
  screenShake: { x: number; y: number };
  soundQueue: string[];
  backgroundHue: number;
  damageFlash: number; // Flash timer when taking damage
}

const SURVIVAL_STORAGE_KEY = 'galactic_overdrive_survival_highscore';

let bulletIdCounter = 0;
let particleIdCounter = 0;

// Enemy types for survival mode - Added kamikaze and swarm for difficulty without backward shots
type SurvivalEnemyType = 'scout' | 'fighter' | 'bomber' | 'elite' | 'boss' | 'kamikaze' | 'swarm';

interface SurvivalEnemy extends Enemy {
  survivalType: SurvivalEnemyType;
  shootCooldown: number;
  canShoot: boolean;
  formationIndex?: number;
  formationOffset?: { x: number; y: number };
}

function createSurvivalBullet(x: number, y: number, velocityX: number, velocityY: number, isPlayerBullet: boolean, damage: number = 10): Bullet {
  return {
    id: `survival_bullet_${bulletIdCounter++}`,
    x,
    y,
    width: isPlayerBullet ? 12 : 8,
    height: 4,
    velocityX,
    velocityY,
    active: true,
    damage,
    isPlayerBullet,
  };
}

function createSurvivalParticle(x: number, y: number, velocityX: number, velocityY: number, color: string, size: number): Particle {
  return {
    id: `survival_particle_${particleIdCounter++}`,
    x,
    y,
    width: size,
    height: size,
    velocityX,
    velocityY,
    active: true,
    color,
    life: 30,
    maxLife: 30,
    size,
  };
}

function createSurvivalEnemy(type: SurvivalEnemyType, x: number, y: number, wave: number): SurvivalEnemy {
  const configs: Record<SurvivalEnemyType, { health: number; speed: number; canShoot: boolean; width: number; height: number }> = {
    scout: { health: 8, speed: 3, canShoot: false, width: 16, height: 12 },
    fighter: { health: 15, speed: 2.5, canShoot: true, width: 20, height: 14 },
    bomber: { health: 25, speed: 1.5, canShoot: true, width: 24, height: 18 },
    elite: { health: 40, speed: 2, canShoot: true, width: 22, height: 16 },
    boss: { health: 100, speed: 1, canShoot: true, width: 40, height: 30 },
    kamikaze: { health: 5, speed: 5, canShoot: false, width: 14, height: 10 }, // Fast, low health, rams player
    swarm: { health: 3, speed: 4, canShoot: false, width: 10, height: 8 }, // Tiny, fast, comes in groups
  };
  
  const config = configs[type];
  const healthScale = 1 + (wave - 1) * 0.15;
  
  return {
    id: `survival_enemy_${bulletIdCounter++}`,
    x,
    y,
    width: config.width,
    height: config.height,
    velocityX: -config.speed * (1 + wave * 0.05),
    velocityY: 0,
    active: true,
    type: 'drone',
    health: Math.ceil(config.health * healthScale),
    fireTimer: Math.random() * 60,
    behavior: { pattern: 'sine', amplitude: 30, frequency: 0.03, startY: y },
    survivalType: type,
    shootCooldown: 60 + Math.random() * 60,
    canShoot: config.canShoot,
  };
}

export function createSurvivalState(): SurvivalState {
  const highScore = parseInt(localStorage.getItem(SURVIVAL_STORAGE_KEY) || '0');
  
  // Multi-layer stars for depth
  const stars: Star[] = [];
  for (let i = 0; i < 200; i++) {
    const layer = Math.floor(Math.random() * 5);
    stars.push({
      x: Math.random() * GAME_CONFIG.canvasWidth * 3,
      y: Math.random() * GAME_CONFIG.canvasHeight,
      size: 0.3 + layer * 0.4,
      speed: 0.05 + layer * 0.15,
      brightness: 0.2 + layer * 0.15,
      layer,
    });
  }
  
  // Distant background stars (very slow, tiny)
  const distantStars: { x: number; y: number; size: number; brightness: number; layer: number }[] = [];
  for (let i = 0; i < 100; i++) {
    distantStars.push({
      x: Math.random() * GAME_CONFIG.canvasWidth,
      y: Math.random() * GAME_CONFIG.canvasHeight,
      size: 0.5 + Math.random() * 0.5,
      brightness: 0.1 + Math.random() * 0.2,
      layer: 0,
    });
  }
  
  // Create nebula clouds for background depth
  const nebulas: { x: number; y: number; size: number; color: string; alpha: number }[] = [];
  const nebulaColors = ['#3311aa', '#1144aa', '#220066', '#003366', '#112255'];
  for (let i = 0; i < 12; i++) {
    nebulas.push({
      x: Math.random() * GAME_CONFIG.canvasWidth * 2,
      y: Math.random() * GAME_CONFIG.canvasHeight,
      size: 150 + Math.random() * 250,
      color: nebulaColors[Math.floor(Math.random() * nebulaColors.length)],
      alpha: 0.03 + Math.random() * 0.05,
    });
  }
  
  // Speed lines for motion effect
  const speedLines: { x: number; y: number; length: number; speed: number; alpha: number }[] = [];
  for (let i = 0; i < 30; i++) {
    speedLines.push({
      x: Math.random() * GAME_CONFIG.canvasWidth,
      y: Math.random() * GAME_CONFIG.canvasHeight,
      length: 30 + Math.random() * 80,
      speed: 8 + Math.random() * 12,
      alpha: 0.1 + Math.random() * 0.3,
    });
  }
  
  return {
    phase: 'playing',
    wave: 1,
    waveTimer: 0,
    waveEnemiesSpawned: 0,
    waveEnemiesTotal: 5,
    waveCooldown: 0,
    
    player: createPlayer(),
    enemies: [],
    bullets: [],
    particles: [],
    pickups: [],
    stars,
    nebulas,
    collisionFlash: [],
    speedLines,
    distantStars,
    
    score: 0,
    highScore,
    kills: 0,
    
    difficulty: 1.0,
    spawnTimer: 0,
    formationTimer: 0,
    
    screenShake: { x: 0, y: 0 },
    soundQueue: [],
    backgroundHue: Math.random() * 360,
    damageFlash: 0,
  };
}

export function updateSurvivalState(
  state: SurvivalState, 
  input: { up: boolean; down: boolean; left: boolean; right: boolean; fire: boolean }
): SurvivalState {
  if (state.phase === 'gameover') return state;
  
  const newState = { ...state };
  newState.soundQueue = [];
  
  newState.difficulty = 1.0 + (state.wave - 1) * 0.15;
  
  updateSurvivalPlayer(newState, input);
  updateSurvivalEnemies(newState);
  updateSurvivalBullets(newState);
  checkSurvivalCollisions(newState);
  updateSurvivalParticles(newState);
  updateSurvivalWave(newState);
  updateSpeedLines(newState);
  
  // Player shooting
  if (input.fire && newState.player.fireTimer <= 0) {
    newState.bullets.push(createSurvivalBullet(
      newState.player.x + newState.player.width,
      newState.player.y + newState.player.height / 2 - 2,
      12, 0, true, 10  // 10 damage per shot
    ));
    newState.player.fireTimer = 8;
    newState.soundQueue.push('shoot');
  }
  
  // Update collision flashes
  newState.collisionFlash = newState.collisionFlash.filter(flash => {
    flash.timer--;
    return flash.timer > 0;
  });
  
  newState.screenShake.x *= 0.9;
  newState.screenShake.y *= 0.9;
  
  // Decay damage flash
  if (newState.damageFlash > 0) {
    newState.damageFlash -= 1;
  }
  
  if (newState.player.health <= 0) {
    newState.phase = 'gameover';
    if (newState.score > newState.highScore) {
      newState.highScore = newState.score;
      localStorage.setItem(SURVIVAL_STORAGE_KEY, newState.score.toString());
    }
  }
  
  return newState;
}

function updateSurvivalPlayer(
  state: SurvivalState,
  input: { up: boolean; down: boolean; left: boolean; right: boolean }
) {
  const player = state.player;
  const speed = 5;

  const hasKeyboardInput = input.up || input.down || input.left || input.right;

  if (hasKeyboardInput) {
    if (input.up) player.y -= speed;
    if (input.down) player.y += speed;
    if (input.left) player.x -= speed;
    if (input.right) player.x += speed;
  } else {
    // Touch steering: move smoothly toward target (same pattern as main game)
    player.x = lerp(player.x, player.targetX, TOUCH_CONFIG.smoothing);
    player.y = lerp(player.y, player.targetY, TOUCH_CONFIG.smoothing);
  }

  player.x = Math.max(20, Math.min(GAME_CONFIG.canvasWidth - player.width - 20, player.x));
  player.y = Math.max(40, Math.min(GAME_CONFIG.canvasHeight - player.height - 40, player.y));

  if (player.fireTimer > 0) player.fireTimer--;
  if (player.invulnerableTimer > 0) player.invulnerableTimer--;
  if (player.invulnerableTimer <= 0) player.invulnerable = false;

  player.trail.unshift({ x: player.x, y: player.y + player.height / 2, alpha: 1 });
  player.trail = player.trail.slice(0, 10).map(t => ({ ...t, alpha: t.alpha * 0.85 }));
}

function updateSurvivalEnemies(state: SurvivalState) {
  const player = state.player;
  
  state.enemies = state.enemies.filter(enemy => {
    // Movement based on type
    const survivalEnemy = enemy as any;
    const type = survivalEnemy.survivalType || 'scout';
    
    // Base movement
    enemy.x += enemy.velocityX;
    
    // Different movement patterns based on type
    switch (type) {
      case 'scout':
        enemy.y += Math.sin(Date.now() * 0.008 + enemy.x * 0.02) * 2;
        break;
      case 'fighter':
        enemy.y += Math.sin(Date.now() * 0.005 + enemy.x * 0.01) * 1.5;
        // Fighters track player slightly
        if (enemy.y < player.y) enemy.y += 0.3;
        if (enemy.y > player.y) enemy.y -= 0.3;
        break;
      case 'bomber':
        enemy.y += Math.sin(Date.now() * 0.003 + enemy.x * 0.005) * 0.8;
        break;
      case 'elite':
        // Elite enemies aggressively track player
        const dy = player.y - enemy.y;
        enemy.y += Math.sign(dy) * Math.min(Math.abs(dy) * 0.02, 1.5);
        break;
      case 'boss':
        // Boss moves in a figure-8 pattern
        enemy.y += Math.sin(Date.now() * 0.002) * 1;
        break;
      case 'kamikaze':
        // Kamikaze aggressively homes in on player
        const dyKami = player.y - enemy.y;
        enemy.y += Math.sign(dyKami) * Math.min(Math.abs(dyKami) * 0.08, 3);
        // Speed up as they get closer
        enemy.velocityX = Math.min(enemy.velocityX * 1.002, -7);
        break;
      case 'swarm':
        // Swarm has erratic movement
        enemy.y += Math.sin(Date.now() * 0.015 + enemy.id.charCodeAt(enemy.id.length - 1) * 0.5) * 3;
        // Slight tracking
        if (enemy.y < player.y) enemy.y += 0.5;
        if (enemy.y > player.y) enemy.y -= 0.5;
        break;
    }
    
    // Keep enemies on screen vertically
    enemy.y = Math.max(40, Math.min(GAME_CONFIG.canvasHeight - enemy.height - 40, enemy.y));
    
    // Shooting logic for enemies that can shoot - ONLY if enemy is in front of player (not passed by)
    if (survivalEnemy.canShoot && enemy.x < GAME_CONFIG.canvasWidth - 50 && enemy.x > player.x) {
      survivalEnemy.shootCooldown--;
      if (survivalEnemy.shootCooldown <= 0) {
        const bulletSpeed = type === 'elite' ? -10 : type === 'boss' ? -8 : -6;
        const bulletDamage = type === 'boss' ? 15 : type === 'elite' ? 10 : 5;
        
        // Shoot straight left toward player (no tracking for fairness)
        state.bullets.push(createSurvivalBullet(
          enemy.x,
          enemy.y + enemy.height / 2,
          bulletSpeed, 0, false, bulletDamage
        ));
        
        // Boss fires spread
        if (type === 'boss') {
          state.bullets.push(createSurvivalBullet(enemy.x, enemy.y + enemy.height / 2, -8, -3, false, bulletDamage));
          state.bullets.push(createSurvivalBullet(enemy.x, enemy.y + enemy.height / 2, -8, 3, false, bulletDamage));
        }
        
        survivalEnemy.shootCooldown = type === 'boss' ? 40 : type === 'elite' ? 50 : type === 'bomber' ? 80 : 70;
      }
    }
    
    return enemy.x > -100;
  });
}

function updateSurvivalBullets(state: SurvivalState) {
  state.bullets = state.bullets.filter(bullet => {
    bullet.x += bullet.velocityX;
    bullet.y += bullet.velocityY;
    
    return bullet.x > -20 && bullet.x < GAME_CONFIG.canvasWidth + 20 &&
           bullet.y > -20 && bullet.y < GAME_CONFIG.canvasHeight + 20;
  });
}

function checkSurvivalCollisions(state: SurvivalState) {
  const player = state.player;
  
  // Player bullets vs enemies
  state.bullets = state.bullets.filter(bullet => {
    if (!bullet.isPlayerBullet) return true;
    
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const enemy = state.enemies[i];
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        enemy.health -= bullet.damage;
        
        if (enemy.health <= 0) {
          state.enemies.splice(i, 1);
          state.score += 100 * Math.floor(state.difficulty);
          state.kills++;
          state.soundQueue.push('explosion');
          
          for (let j = 0; j < 8; j++) {
            state.particles.push(createSurvivalParticle(
              enemy.x + enemy.width / 2,
              enemy.y + enemy.height / 2,
              (Math.random() - 0.5) * 6,
              (Math.random() - 0.5) * 6,
              ['#ff4444', '#ff8844', '#ffff44'][Math.floor(Math.random() * 3)],
              3 + Math.random() * 4
            ));
          }
          
        } else {
          state.soundQueue.push('hit');
        }
        
        return false;
      }
    }
    return true;
  });
  
  // Enemy bullets vs player
  if (!player.invulnerable) {
    state.bullets = state.bullets.filter(bullet => {
      if (bullet.isPlayerBullet) return true;
      
      if (
        bullet.x < player.x + player.width &&
        bullet.x + bullet.width > player.x &&
        bullet.y < player.y + player.height &&
        bullet.y + bullet.height > player.y
      ) {
        player.health -= bullet.damage;
        player.invulnerable = true;
        player.invulnerableTimer = 60;
        state.screenShake = { x: 5, y: 5 };
        state.damageFlash = 20; // Trigger damage flash
        state.soundQueue.push('hit');
        // Add collision flash
        state.collisionFlash.push({
          x: player.x + player.width / 2,
          y: player.y + player.height / 2,
          timer: 15,
          color: '#ff4444',
        });
        return false;
      }
      return true;
    });
  }
  
  // Player vs enemy collision
  if (!player.invulnerable) {
    for (const enemy of state.enemies) {
      if (
        player.x < enemy.x + enemy.width &&
        player.x + player.width > enemy.x &&
        player.y < enemy.y + enemy.height &&
        player.y + player.height > enemy.y
      ) {
        player.health -= 15;  // More damage from collision
        player.invulnerable = true;
        player.invulnerableTimer = 90;
        state.screenShake = { x: 10, y: 10 };
        state.damageFlash = 25; // Stronger damage flash for collision
        state.soundQueue.push('hit');
        // Add collision flash
        state.collisionFlash.push({
          x: player.x + player.width / 2,
          y: player.y + player.height / 2,
          timer: 15,
          color: '#ff6600',
        });
        break;
      }
    }
  }
}

function updateSurvivalParticles(state: SurvivalState) {
  state.particles = state.particles.filter(p => {
    p.x += p.velocityX;
    p.y += p.velocityY;
    p.velocityX *= 0.95;
    p.velocityY *= 0.95;
    p.life--;
    return p.life > 0;
  });
}

function updateSpeedLines(state: SurvivalState) {
  state.speedLines.forEach(line => {
    line.x -= line.speed;
    if (line.x < -line.length) {
      line.x = GAME_CONFIG.canvasWidth + Math.random() * 50;
      line.y = Math.random() * GAME_CONFIG.canvasHeight;
      line.length = 30 + Math.random() * 80;
      line.speed = 8 + Math.random() * 12;
      line.alpha = 0.1 + Math.random() * 0.3;
    }
  });
}

function updateSurvivalWave(state: SurvivalState) {
  // Shift background hue slowly
  state.backgroundHue = (state.backgroundHue + 0.05) % 360;
  
  // Move nebulas
  state.nebulas.forEach(nebula => {
    nebula.x -= 0.2;
    if (nebula.x < -nebula.size) {
      nebula.x = GAME_CONFIG.canvasWidth + nebula.size;
      nebula.y = Math.random() * GAME_CONFIG.canvasHeight;
    }
  });
  
  if (state.waveCooldown > 0) {
    state.waveCooldown--;
    if (state.waveCooldown === 0) {
      state.wave++;
      state.waveEnemiesSpawned = 0;
      state.waveEnemiesTotal = 5 + state.wave * 3;
      state.formationTimer = 0;
      state.soundQueue.push('powerup');
    }
    return;
  }
  
  if (state.waveEnemiesSpawned >= state.waveEnemiesTotal && state.enemies.length === 0) {
    state.waveCooldown = 120;
    state.score += 500 * state.wave;
    return;
  }
  
  // Formation spawning
  state.formationTimer--;
  
  if (state.spawnTimer <= 0 && state.waveEnemiesSpawned < state.waveEnemiesTotal) {
    // Determine spawn type based on wave
    const roll = Math.random();
    
    // Every 5 waves, spawn a boss
    if (state.wave % 5 === 0 && state.waveEnemiesSpawned === 0) {
      const boss = createSurvivalEnemy('boss', GAME_CONFIG.canvasWidth + 50, GAME_CONFIG.canvasHeight / 2, state.wave);
      state.enemies.push(boss);
      state.waveEnemiesSpawned++;
      state.spawnTimer = 120;
    }
    // Formation spawn
    else if (state.formationTimer <= 0 && roll < 0.3 && state.wave >= 2) {
      spawnFormation(state);
      state.formationTimer = 180;
    }
    // Single enemy spawn
    else {
      let type: SurvivalEnemyType = 'scout';
      const roll2 = Math.random();
      
      // Higher waves introduce more enemy variety
      if (state.wave >= 2 && roll2 < 0.35) type = 'fighter';
      if (state.wave >= 3 && roll2 < 0.25) type = 'kamikaze'; // New: kamikaze from wave 3
      if (state.wave >= 4 && roll2 < 0.30) type = 'bomber';
      if (state.wave >= 5 && roll2 < 0.20) type = 'swarm'; // New: swarm spawns multiple from wave 5
      if (state.wave >= 6 && roll2 < 0.15) type = 'elite';
      
      // Swarm spawns multiple enemies at once
      if (type === 'swarm') {
        const swarmSize = 3 + Math.floor(state.wave / 4);
        for (let i = 0; i < swarmSize; i++) {
          const enemy = createSurvivalEnemy(
            'swarm',
            GAME_CONFIG.canvasWidth + 50 + i * 20,
            50 + Math.random() * (GAME_CONFIG.canvasHeight - 100),
            state.wave
          );
          state.enemies.push(enemy);
          state.waveEnemiesSpawned++;
        }
        state.spawnTimer = Math.max(20, 60 - state.wave * 2);
      } else {
        const enemy = createSurvivalEnemy(
          type,
          GAME_CONFIG.canvasWidth + 50,
          50 + Math.random() * (GAME_CONFIG.canvasHeight - 100),
          state.wave
        );
        
        state.enemies.push(enemy);
        state.waveEnemiesSpawned++;
        state.spawnTimer = Math.max(15, 50 - state.wave * 2);
      }
    }
  }
  
  state.spawnTimer--;
}


function spawnFormation(state: SurvivalState) {
  const formations = ['v', 'line', 'diamond', 'wall'];
  const formation = formations[Math.floor(Math.random() * formations.length)];
  const baseY = GAME_CONFIG.canvasHeight / 2;
  const type: SurvivalEnemyType = state.wave >= 4 ? 'fighter' : 'scout';
  
  const formationSize = Math.min(5, 3 + Math.floor(state.wave / 3));
  
  switch (formation) {
    case 'v':
      for (let i = 0; i < formationSize; i++) {
        const offsetX = i * 30;
        const offsetY = (i - Math.floor(formationSize / 2)) * 25;
        const enemy = createSurvivalEnemy(type, GAME_CONFIG.canvasWidth + 50 + offsetX, baseY + offsetY, state.wave);
        state.enemies.push(enemy);
        state.waveEnemiesSpawned++;
      }
      break;
    case 'line':
      for (let i = 0; i < formationSize; i++) {
        const offsetY = (i - Math.floor(formationSize / 2)) * 40;
        const enemy = createSurvivalEnemy(type, GAME_CONFIG.canvasWidth + 50, baseY + offsetY, state.wave);
        state.enemies.push(enemy);
        state.waveEnemiesSpawned++;
      }
      break;
    case 'diamond':
      const positions = [[0, 0], [-30, -30], [-30, 30], [-60, 0], [30, 0]];
      for (let i = 0; i < Math.min(formationSize, positions.length); i++) {
        const enemy = createSurvivalEnemy(type, GAME_CONFIG.canvasWidth + 50 + positions[i][0], baseY + positions[i][1], state.wave);
        state.enemies.push(enemy);
        state.waveEnemiesSpawned++;
      }
      break;
    case 'wall':
      for (let i = 0; i < formationSize; i++) {
        const offsetY = (i - Math.floor(formationSize / 2)) * 35;
        const offsetX = Math.abs(i - Math.floor(formationSize / 2)) * 20;
        const enemy = createSurvivalEnemy(type, GAME_CONFIG.canvasWidth + 50 + offsetX, baseY + offsetY, state.wave);
        state.enemies.push(enemy);
        state.waveEnemiesSpawned++;
      }
      break;
  }
  
  state.spawnTimer = 90;
}

// Enemy rendering functions
function renderScoutEnemy(ctx: CanvasRenderingContext2D, enemy: any) {
  ctx.shadowColor = '#00ff00';
  ctx.shadowBlur = 10;
  
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, enemy.width / 2);
  grad.addColorStop(0, '#44ff44');
  grad.addColorStop(0.7, '#22aa22');
  grad.addColorStop(1, '#116611');
  ctx.fillStyle = grad;
  
  ctx.beginPath();
  ctx.moveTo(enemy.width / 2, 0);
  ctx.lineTo(-enemy.width / 3, -enemy.height / 2);
  ctx.lineTo(-enemy.width / 2, 0);
  ctx.lineTo(-enemy.width / 3, enemy.height / 2);
  ctx.closePath();
  ctx.fill();
}

function renderFighterEnemy(ctx: CanvasRenderingContext2D, enemy: any) {
  ctx.shadowColor = '#ff4400';
  ctx.shadowBlur = 12;
  
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, enemy.width / 2);
  grad.addColorStop(0, '#ff6644');
  grad.addColorStop(0.7, '#cc3300');
  grad.addColorStop(1, '#881100');
  ctx.fillStyle = grad;
  
  // X-wing style
  ctx.beginPath();
  ctx.moveTo(enemy.width / 2, 0);
  ctx.lineTo(0, -enemy.height / 3);
  ctx.lineTo(-enemy.width / 2, -enemy.height / 2);
  ctx.lineTo(-enemy.width / 3, 0);
  ctx.lineTo(-enemy.width / 2, enemy.height / 2);
  ctx.lineTo(0, enemy.height / 3);
  ctx.closePath();
  ctx.fill();
  
  // Cannon glow
  ctx.fillStyle = '#ffaa00';
  ctx.beginPath();
  ctx.arc(-enemy.width / 2, -enemy.height / 2, 3, 0, Math.PI * 2);
  ctx.arc(-enemy.width / 2, enemy.height / 2, 3, 0, Math.PI * 2);
  ctx.fill();
}

function renderBomberEnemy(ctx: CanvasRenderingContext2D, enemy: any) {
  ctx.shadowColor = '#8800ff';
  ctx.shadowBlur = 15;
  
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, enemy.width / 2);
  grad.addColorStop(0, '#aa44ff');
  grad.addColorStop(0.7, '#6622aa');
  grad.addColorStop(1, '#441177');
  ctx.fillStyle = grad;
  
  // Heavy bomber shape
  ctx.beginPath();
  ctx.ellipse(0, 0, enemy.width / 2, enemy.height / 3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Wings
  ctx.fillStyle = '#552288';
  ctx.beginPath();
  ctx.moveTo(-enemy.width / 4, 0);
  ctx.lineTo(-enemy.width / 2, -enemy.height / 2);
  ctx.lineTo(enemy.width / 4, -enemy.height / 4);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-enemy.width / 4, 0);
  ctx.lineTo(-enemy.width / 2, enemy.height / 2);
  ctx.lineTo(enemy.width / 4, enemy.height / 4);
  ctx.closePath();
  ctx.fill();
}

function renderEliteEnemy(ctx: CanvasRenderingContext2D, enemy: any) {
  ctx.shadowColor = '#ffff00';
  ctx.shadowBlur = 18;
  
  const pulse = Math.sin(Date.now() * 0.01) * 0.2 + 1;
  ctx.scale(pulse, pulse);
  
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, enemy.width / 2);
  grad.addColorStop(0, '#ffff44');
  grad.addColorStop(0.5, '#ffaa00');
  grad.addColorStop(1, '#cc6600');
  ctx.fillStyle = grad;
  
  // Star shape
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? enemy.width / 2 : enemy.width / 4;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function renderBossEnemy(ctx: CanvasRenderingContext2D, enemy: any) {
  ctx.shadowColor = '#ff0000';
  ctx.shadowBlur = 25;
  
  const pulse = Math.sin(Date.now() * 0.005) * 0.1 + 1;
  ctx.scale(pulse, pulse);
  
  // Main body
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, enemy.width / 2);
  grad.addColorStop(0, '#ff2222');
  grad.addColorStop(0.3, '#cc0000');
  grad.addColorStop(0.7, '#880000');
  grad.addColorStop(1, '#440000');
  ctx.fillStyle = grad;
  
  // Intimidating shape
  ctx.beginPath();
  ctx.moveTo(enemy.width / 2, 0);
  ctx.lineTo(enemy.width / 4, -enemy.height / 4);
  ctx.lineTo(0, -enemy.height / 2);
  ctx.lineTo(-enemy.width / 3, -enemy.height / 3);
  ctx.lineTo(-enemy.width / 2, 0);
  ctx.lineTo(-enemy.width / 3, enemy.height / 3);
  ctx.lineTo(0, enemy.height / 2);
  ctx.lineTo(enemy.width / 4, enemy.height / 4);
  ctx.closePath();
  ctx.fill();
  
  // Core
  const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.5, '#ff4444');
  coreGrad.addColorStop(1, '#880000');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  
  // Weapon ports
  ctx.fillStyle = '#ffaa00';
  ctx.beginPath();
  ctx.arc(-enemy.width / 2, 0, 4, 0, Math.PI * 2);
  ctx.fill();
}

// Kamikaze enemy - glowing red, aggressive look
function renderKamikazeEnemy(ctx: CanvasRenderingContext2D, enemy: any) {
  const pulse = Math.sin(Date.now() * 0.02) * 0.3 + 1;
  ctx.shadowColor = '#ff3300';
  ctx.shadowBlur = 15 * pulse;
  
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, enemy.width / 2);
  grad.addColorStop(0, '#ffff00');
  grad.addColorStop(0.4, '#ff6600');
  grad.addColorStop(1, '#cc0000');
  ctx.fillStyle = grad;
  
  // Arrow/missile shape pointing left
  ctx.beginPath();
  ctx.moveTo(-enemy.width / 2, 0);
  ctx.lineTo(0, -enemy.height / 2);
  ctx.lineTo(enemy.width / 3, -enemy.height / 3);
  ctx.lineTo(enemy.width / 2, 0);
  ctx.lineTo(enemy.width / 3, enemy.height / 3);
  ctx.lineTo(0, enemy.height / 2);
  ctx.closePath();
  ctx.fill();
  
  // Flame trail
  ctx.fillStyle = '#ff4400';
  ctx.globalAlpha = 0.6 * pulse;
  ctx.beginPath();
  ctx.moveTo(enemy.width / 2, 0);
  ctx.lineTo(enemy.width / 2 + 8, -3);
  ctx.lineTo(enemy.width / 2 + 12, 0);
  ctx.lineTo(enemy.width / 2 + 8, 3);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

// Swarm enemy - tiny, insect-like
function renderSwarmEnemy(ctx: CanvasRenderingContext2D, enemy: any) {
  ctx.shadowColor = '#88ff88';
  ctx.shadowBlur = 6;
  
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, enemy.width / 2);
  grad.addColorStop(0, '#aaffaa');
  grad.addColorStop(0.5, '#44aa44');
  grad.addColorStop(1, '#226622');
  ctx.fillStyle = grad;
  
  // Simple circular body
  ctx.beginPath();
  ctx.ellipse(0, 0, enemy.width / 2, enemy.height / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Wings (animated)
  const wingAngle = Math.sin(Date.now() * 0.03) * 0.3;
  ctx.fillStyle = 'rgba(100, 255, 100, 0.4)';
  ctx.beginPath();
  ctx.ellipse(0, -enemy.height / 2 - 2, 3, 5, wingAngle, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, enemy.height / 2 + 2, 3, 5, -wingAngle, 0, Math.PI * 2);
  ctx.fill();
}

export function renderSurvivalMode(ctx: CanvasRenderingContext2D, state: SurvivalState) {
  ctx.save();
  
  ctx.translate(state.screenShake.x * (Math.random() - 0.5), state.screenShake.y * (Math.random() - 0.5));
  
  // Deep space background with parallax layers
  const hue = state.backgroundHue;
  
  // Base deep space gradient (very dark)
  const bgGrad = ctx.createRadialGradient(
    GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2, 0,
    GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2, GAME_CONFIG.canvasWidth
  );
  bgGrad.addColorStop(0, `hsl(${(hue + 220) % 360}, 60%, 4%)`);
  bgGrad.addColorStop(0.5, `hsl(${(hue + 240) % 360}, 70%, 2%)`);
  bgGrad.addColorStop(1, '#000005');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
  
  // Distant stars (very slow, tiny - deepest layer)
  state.distantStars.forEach(star => {
    const twinkle = Math.sin(Date.now() * 0.001 + star.x * 0.1) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(180, 200, 255, ${star.brightness * twinkle})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Helper function to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  // Nebula clouds (deep background layer - subtle glow)
  state.nebulas.forEach(nebula => {
    const nebulaGrad = ctx.createRadialGradient(
      nebula.x, nebula.y, 0,
      nebula.x, nebula.y, nebula.size
    );
    nebulaGrad.addColorStop(0, hexToRgba(nebula.color, 0.08));
    nebulaGrad.addColorStop(0.5, hexToRgba(nebula.color, 0.03));
    nebulaGrad.addColorStop(1, 'transparent');
    ctx.globalAlpha = nebula.alpha;
    ctx.fillStyle = nebulaGrad;
    ctx.beginPath();
    ctx.arc(nebula.x, nebula.y, nebula.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
  
  // Foreground stars (layered by distance - closer = brighter & faster)
  state.stars.forEach(star => {
    star.x -= star.speed * 2;
    if (star.x < 0) {
      star.x = GAME_CONFIG.canvasWidth + Math.random() * 50;
      star.y = Math.random() * GAME_CONFIG.canvasHeight;
    }
    
    const twinkle = Math.sin(Date.now() * 0.004 + star.x) * 0.2 + 0.8;
    const layerColor = star.layer > 3 ? '255, 255, 255' : star.layer > 1 ? '200, 220, 255' : '150, 180, 220';
    ctx.fillStyle = `rgba(${layerColor}, ${star.brightness * twinkle})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Speed lines for motion effect
  state.speedLines.forEach(line => {
    ctx.strokeStyle = `rgba(150, 200, 255, ${line.alpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(line.x, line.y);
    ctx.lineTo(line.x + line.length, line.y);
    ctx.stroke();
  });
  
  // Enemies with varied designs
  state.enemies.forEach(enemy => {
    const survivalEnemy = enemy as any;
    const type = survivalEnemy.survivalType || 'scout';
    
    ctx.save();
    ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
    
    // Different colors and designs based on type
    switch (type) {
      case 'scout':
        renderScoutEnemy(ctx, enemy);
        break;
      case 'fighter':
        renderFighterEnemy(ctx, enemy);
        break;
      case 'bomber':
        renderBomberEnemy(ctx, enemy);
        break;
      case 'elite':
        renderEliteEnemy(ctx, enemy);
        break;
      case 'boss':
        renderBossEnemy(ctx, enemy);
        break;
      case 'kamikaze':
        renderKamikazeEnemy(ctx, enemy);
        break;
      case 'swarm':
        renderSwarmEnemy(ctx, enemy);
        break;
      default:
        renderScoutEnemy(ctx, enemy);
    }
    
    ctx.restore();
  });
  
  // Bullets
  state.bullets.forEach(bullet => {
    if (bullet.isPlayerBullet) {
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 10;
      const grad = ctx.createLinearGradient(bullet.x, bullet.y, bullet.x + bullet.width, bullet.y);
      grad.addColorStop(0, '#00ffff');
      grad.addColorStop(1, '#ffffff');
      ctx.fillStyle = grad;
    } else {
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#ff4444';
    }
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    ctx.shadowBlur = 0;
  });
  
  // Particles
  state.particles.forEach(particle => {
    const alpha = particle.life / particle.maxLife;
    ctx.fillStyle = particle.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
    if (!particle.color.includes('rgb')) {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
    }
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
  
  // Collision flash effects
  state.collisionFlash.forEach(flash => {
    const alpha = flash.timer / 15;
    const size = (15 - flash.timer) * 3 + 10;
    
    ctx.save();
    
    // Outer expanding ring
    ctx.strokeStyle = `rgba(255, 68, 68, ${alpha * 0.8})`;
    ctx.lineWidth = 3;
    ctx.shadowColor = flash.color;
    ctx.shadowBlur = 20 * alpha;
    ctx.beginPath();
    ctx.arc(flash.x, flash.y, size, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner glow
    const r = parseInt(flash.color.slice(1, 3), 16);
    const g = parseInt(flash.color.slice(3, 5), 16);
    const b = parseInt(flash.color.slice(5, 7), 16);
    const innerGrad = ctx.createRadialGradient(flash.x, flash.y, 0, flash.x, flash.y, size * 0.6);
    innerGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.6})`);
    innerGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(flash.x, flash.y, size * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  });
  
  // Player
  renderSurvivalPlayer(ctx, state.player);
  
  // UI
  renderSurvivalUI(ctx, state);
  
  // Wave announcement
  if (state.waveCooldown > 60) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, GAME_CONFIG.canvasHeight / 2 - 40, GAME_CONFIG.canvasWidth, 80);
    
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffaa00';
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 20;
    ctx.fillText(`WAVE ${state.wave} COMPLETE!`, GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 + 10);
    ctx.restore();
  }
  
  // Game over
  if (state.phase === 'gameover') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
    
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff4444';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 30;
    ctx.fillText('GAME OVER', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 - 40);
    
    ctx.font = '24px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
    ctx.fillText(`SCORE: ${state.score}`, GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 + 20);
    ctx.fillText(`WAVES: ${state.wave}  KILLS: ${state.kills}`, GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 + 50);
    
    if (state.score >= state.highScore && state.score > 0) {
      ctx.fillStyle = '#ffaa00';
      ctx.fillText('NEW HIGH SCORE!', GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2 + 90);
    }
  }
  
  ctx.restore();
}

function renderSurvivalPlayer(ctx: CanvasRenderingContext2D, player: Player) {
  if (player.invulnerable && Math.floor(player.invulnerableTimer / 4) % 2 === 0) return;
  
  const x = player.x;
  const y = player.y;
  const centerY = y + player.height / 2;
  const centerX = x + player.width / 2;
  
  ctx.save();
  
  // Trail - use mega ship's glow color
  const megaShipId = getStoredMegaShipId();
  player.trail.forEach((point, i) => {
    const alpha = point.alpha * 0.5;
    ctx.fillStyle = `rgba(255, 100, 100, ${alpha})`;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3 - i * 0.2, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Shield if active
  if (player.hasShield) {
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 35, 15, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Draw the selected mega ship with skin colors
  const time = Date.now() * 0.003;
  const skinColors = getStoredSkinColors();
  drawMegaShip(ctx, centerX, centerY, megaShipId, time, skinColors);


  ctx.restore();
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.max(0, Math.min(radius, Math.min(width, height) / 2));
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function renderSurvivalUI(ctx: CanvasRenderingContext2D, state: SurvivalState) {
  ctx.save();
  
  // Damage flash overlay (like main game)
  if (state.damageFlash > 0) {
    const flashAlpha = (state.damageFlash / 25) * 0.4;
    // Red vignette effect
    const vignetteGrad = ctx.createRadialGradient(
      GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2, 0,
      GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2, GAME_CONFIG.canvasWidth * 0.7
    );
    vignetteGrad.addColorStop(0, 'transparent');
    vignetteGrad.addColorStop(0.5, `rgba(255, 0, 0, ${flashAlpha * 0.3})`);
    vignetteGrad.addColorStop(1, `rgba(255, 0, 0, ${flashAlpha})`);
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
    
    // Red border flash
    ctx.strokeStyle = `rgba(255, 50, 50, ${flashAlpha})`;
    ctx.lineWidth = 8;
    ctx.strokeRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
  }
  
  // Low hull warning (pulsing red overlay)
  const healthPercent = Math.max(0, state.player.health / 10);
  if (healthPercent <= 0.3 && healthPercent > 0) {
    const warningAlpha = Math.sin(Date.now() * 0.015) * 0.3 + 0.5;
    // Vignette style warning
    const warningGrad = ctx.createRadialGradient(
      GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2, 0,
      GAME_CONFIG.canvasWidth / 2, GAME_CONFIG.canvasHeight / 2, GAME_CONFIG.canvasWidth * 0.6
    );
    warningGrad.addColorStop(0, 'transparent');
    warningGrad.addColorStop(0.7, `rgba(255, 0, 0, ${warningAlpha * 0.1})`);
    warningGrad.addColorStop(1, `rgba(255, 0, 0, ${warningAlpha * 0.25})`);
    ctx.fillStyle = warningGrad;
    ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
  }
  
  // Top bar background with gradient
  const topBarGrad = ctx.createLinearGradient(0, 0, 0, 50);
  topBarGrad.addColorStop(0, 'rgba(0, 10, 20, 0.9)');
  topBarGrad.addColorStop(1, 'rgba(0, 5, 15, 0)');
  ctx.fillStyle = topBarGrad;
  ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, 50);
  
  // SURVIVAL MODE title
  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = '#ff6600';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#ff4400';
  ctx.shadowBlur = 8;
  ctx.fillText('★ SURVIVAL MODE ★', GAME_CONFIG.canvasWidth / 2, 10);
  ctx.shadowBlur = 0;
  
  // Left side: Wave and enemies
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'left';
  
  // Wave indicator with glow
  ctx.shadowColor = '#ffaa00';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#ffdd00';
  ctx.fillText(`WAVE ${state.wave}`, 15, 26);
  ctx.shadowBlur = 0;
  
  const remaining = state.waveEnemiesTotal - state.waveEnemiesSpawned + state.enemies.length;
  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = '#ff6666';
  ctx.fillText(`ENEMIES: ${remaining}`, 15, 47);
  
  // Right side: Score with neon glow
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'right';
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#00ffff';
  ctx.fillText(`SCORE: ${state.score.toString().padStart(8, '0')}`, GAME_CONFIG.canvasWidth - 15, 26);
  ctx.shadowBlur = 0;
  
  ctx.font = 'bold 9px monospace';
  ctx.fillStyle = '#666688';
  ctx.fillText(`HI-SCORE: ${state.highScore.toString().padStart(8, '0')}`, GAME_CONFIG.canvasWidth - 15, 42);
  
  // Bottom HUD - Hull and Kills
  const bottomBarGrad = ctx.createLinearGradient(0, GAME_CONFIG.canvasHeight - 55, 0, GAME_CONFIG.canvasHeight);
  bottomBarGrad.addColorStop(0, 'rgba(0, 5, 15, 0)');
  bottomBarGrad.addColorStop(1, 'rgba(0, 10, 20, 0.9)');
  ctx.fillStyle = bottomBarGrad;
  ctx.fillRect(0, GAME_CONFIG.canvasHeight - 55, GAME_CONFIG.canvasWidth, 55);
  
  // Hull bar (bottom left)
  const hullBarX = 15;
  const hullBarY = GAME_CONFIG.canvasHeight - 30;
  const hullBarWidth = 120;
  const hullBarHeight = 14;
  
  ctx.font = 'bold 9px monospace';
  ctx.fillStyle = '#ff6666';
  ctx.textAlign = 'left';
  ctx.shadowColor = '#ff4444';
  ctx.shadowBlur = 5;
  ctx.fillText('HULL', hullBarX, hullBarY - 4);
  ctx.shadowBlur = 0;
  
  // Hull bar background
  ctx.fillStyle = '#1a1a2e';
  ctx.strokeStyle = healthPercent <= 0.3 ? '#ff4444' : '#334455';
  ctx.lineWidth = 1;
  ctx.beginPath();
  roundRectPath(ctx, hullBarX, hullBarY, hullBarWidth, hullBarHeight, 3);
  ctx.fill();
  ctx.stroke();
  
  // Hull bar fill
  const healthWidth = Math.max(0, (hullBarWidth - 4) * healthPercent);
  
  if (healthWidth > 0) {
    let hullColor: string;
    let hullGlowColor: string;
    if (healthPercent > 0.6) {
      hullColor = '#00dd66';
      hullGlowColor = '#00ff88';
    } else if (healthPercent > 0.3) {
      hullColor = '#ffaa00';
      hullGlowColor = '#ffcc44';
    } else {
      hullColor = '#ff3344';
      hullGlowColor = '#ff6666';
    }
    
    const hullGrad = ctx.createLinearGradient(hullBarX + 2, hullBarY, hullBarX + 2 + healthWidth, hullBarY);
    hullGrad.addColorStop(0, hullGlowColor);
    hullGrad.addColorStop(0.5, hullColor);
    hullGrad.addColorStop(1, hullColor);
    
    ctx.fillStyle = hullGrad;
    ctx.shadowColor = hullGlowColor;
    ctx.shadowBlur = healthPercent < 0.3 ? 12 + Math.sin(Date.now() * 0.02) * 6 : 6;
    ctx.beginPath();
    roundRectPath(ctx, hullBarX + 2, hullBarY + 2, healthWidth, hullBarHeight - 4, 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  
  // Kills counter (bottom right)
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#88ff88';
  ctx.shadowColor = '#44ff44';
  ctx.shadowBlur = 8;
  ctx.fillText(`KILLS: ${state.kills}`, GAME_CONFIG.canvasWidth - 15, GAME_CONFIG.canvasHeight - 18);
  ctx.shadowBlur = 0;
  
  // Wave progress indicator (bottom center)
  const centerX = GAME_CONFIG.canvasWidth / 2;
  const waveProgress = 1 - (remaining / Math.max(1, state.waveEnemiesTotal));
  const progressWidth = 100;
  
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#888899';
  ctx.fillText('WAVE PROGRESS', centerX, GAME_CONFIG.canvasHeight - 35);
  
  // Progress bar background
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  roundRectPath(ctx, centerX - progressWidth / 2, GAME_CONFIG.canvasHeight - 28, progressWidth, 10, 3);
  ctx.fill();
  
  // Progress bar fill
  const progWidth = Math.max(0, (progressWidth - 4) * waveProgress);
  if (progWidth > 0) {
    const progGrad = ctx.createLinearGradient(centerX - progressWidth / 2, 0, centerX + progressWidth / 2, 0);
    progGrad.addColorStop(0, '#4488ff');
    progGrad.addColorStop(1, '#88ccff');
    ctx.fillStyle = progGrad;
    ctx.shadowColor = '#4488ff';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    roundRectPath(ctx, centerX - progressWidth / 2 + 2, GAME_CONFIG.canvasHeight - 26, progWidth, 6, 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  
  ctx.restore();
}
