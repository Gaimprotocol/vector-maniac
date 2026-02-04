import { Entity, Vector2D, Particle, Star, TerrainSegment } from './types';
import { TERRAIN_CONFIG, COLORS } from './constants';

let idCounter = 0;

export function generateId(): string {
  return `entity_${++idCounter}_${Date.now()}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function distance(a: Vector2D, b: Vector2D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function normalize(v: Vector2D): Vector2D {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

export function checkCollision(a: Entity, b: Entity): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function createParticle(
  x: number,
  y: number,
  color: string,
  velocityX: number,
  velocityY: number,
  life: number = 30,
  size: number = 2
): Particle {
  return {
    id: generateId(),
    x,
    y,
    width: size,
    height: size,
    velocityX,
    velocityY,
    active: true,
    color,
    life,
    maxLife: life,
    size,
  };
}

export function createExplosion(x: number, y: number, count: number = 10): Particle[] {
  const particles: Particle[] = [];
  // Enhanced explosion colors matching survival mode
  const explosionColors = ['#ff4444', '#ff8844', '#ffff44', '#ffffff', '#ff6600', '#ffcc00'];
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 2 + Math.random() * 4; // Faster particles
    const color = explosionColors[Math.floor(Math.random() * explosionColors.length)];
    particles.push(
      createParticle(
        x,
        y,
        color,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        20 + Math.random() * 15, // Longer life
        1 + Math.random() * 2    // Small particles (1-3px)
      )
    );
  }
  return particles;
}

export function createStar(canvasWidth: number, canvasHeight: number, x?: number): Star {
  // 5 layers for better parallax depth
  const layer = Math.floor(Math.random() * 5); // 0-4 for more depth layers
  const layerSpeeds = [0.02, 0.08, 0.2, 0.45, 0.8]; // Very slow to fast
  const layerSizes = [0.3, 0.5, 1, 1.5, 2.5]; // Tiny distant to large close
  const layerBrightness = [0.15, 0.25, 0.5, 0.75, 1.0]; // Dim distant to bright close
  
  return {
    x: x ?? Math.random() * canvasWidth * 3,
    y: Math.random() * canvasHeight,
    size: layerSizes[layer] + Math.random() * (layer * 0.2),
    speed: layerSpeeds[layer] + Math.random() * 0.02,
    brightness: layerBrightness[layer] + Math.random() * 0.1,
    layer,
  };
}

export function generateTerrain(
  startX: number,
  count: number,
  prevTop: number,
  prevBottom: number,
  mapStructureTypes?: string[],
  mapStructureChance?: number
): TerrainSegment[] {
  const segments: TerrainSegment[] = [];
  let topHeight = prevTop;
  let bottomHeight = prevBottom;
  
  // Use map-specific structure types or fallback to defaults
  const structureTypes = mapStructureTypes && mapStructureTypes.length > 0 
    ? mapStructureTypes 
    : ['building', 'pipe', 'tower'];
  const structureChance = mapStructureChance ?? TERRAIN_CONFIG.structureChance;

  for (let i = 0; i < count; i++) {
    // Smoothly vary terrain heights
    topHeight += (Math.random() - 0.5) * 15;
    bottomHeight += (Math.random() - 0.5) * 15;
    
    topHeight = clamp(topHeight, TERRAIN_CONFIG.minHeight, TERRAIN_CONFIG.maxHeight);
    bottomHeight = clamp(bottomHeight, TERRAIN_CONFIG.minHeight, TERRAIN_CONFIG.maxHeight);

    const hasStructure = Math.random() < structureChance;

    segments.push({
      x: startX + i * TERRAIN_CONFIG.segmentWidth,
      topHeight,
      bottomHeight,
      hasStructure,
      structureType: hasStructure ? structureTypes[Math.floor(Math.random() * structureTypes.length)] as TerrainSegment['structureType'] : undefined,
    });
  }

  return segments;
}

// Audio context singleton
let audioContext: AudioContext | null = null;
let audioContextResumePromise: Promise<void> | null = null;

export function getAudioContext(): AudioContext | null {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      return null;
    }
  }
  
  // Resume context if suspended (required for mobile after user interaction)
  if (audioContext.state === 'suspended') {
    if (!audioContextResumePromise) {
      audioContextResumePromise = audioContext.resume().then(() => {
        audioContextResumePromise = null;
      }).catch(() => {
        audioContextResumePromise = null;
      });
    }
  }
  
  return audioContext;
}

// Call this early on user interaction to prime audio
export function primeAudioContext(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}

// Global SFX mute state
let sfxMuted = false;

export function setSfxMuted(muted: boolean): void {
  sfxMuted = muted;
}

export function isSfxMuted(): boolean {
  return sfxMuted;
}

export function playSound(type: 'shoot' | 'laser' | 'iceBomb' | 'rapidFire' | 'multiShot' | 'stealthShot' | 'explosion' | 'pickup' | 'rescue' | 'hit' | 'bomb' | 'missile' | 'electricPulse' | 'megaBomb' | 'homingMissilePickup' | 'forceField'): void {
  // Check if SFX is muted
  if (sfxMuted) return;
  
  const ctx = getAudioContext();
  if (!ctx) return;
  
  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    const now = ctx.currentTime;
    
    switch (type) {
      case 'shoot':
        // Falcon - standard shot
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(1200, now);
        oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.06);
        gainNode.gain.setValueAtTime(0.096, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        oscillator.start(now);
        oscillator.stop(now + 0.06);
        break;
        
      case 'laser':
        // Blue Hawk - high-pitched laser zap
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(2400, now);
        oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        gainNode.gain.setValueAtTime(0.12, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        oscillator.start(now);
        oscillator.stop(now + 0.08);
        break;
        
      case 'iceBomb':
        // Arctic Wolf - deep icy thud for heavy bomber
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(180, now);
        oscillator.frequency.exponentialRampToValueAtTime(60, now + 0.15);
        gainNode.gain.setValueAtTime(0.144, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        oscillator.start(now);
        oscillator.stop(now + 0.15);
        break;
        
      case 'rapidFire':
        // Delta - quick high-pitched burst for speed ship
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(1800, now);
        oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.04);
        gainNode.gain.setValueAtTime(0.084, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        oscillator.start(now);
        oscillator.stop(now + 0.04);
        break;
        
      case 'multiShot':
        // Crimson Hawk - aggressive burst sound
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(900, now);
        oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.07);
        gainNode.gain.setValueAtTime(0.108, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        oscillator.start(now);
        oscillator.stop(now + 0.07);
        break;
        
      case 'stealthShot':
        // Valkyrie - muffled/subtle stealth sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.1);
        gainNode.gain.setValueAtTime(0.06, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
        break;
        
      case 'explosion':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.exponentialRampToValueAtTime(20, now + 0.25);
        gainNode.gain.setValueAtTime(0.18, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        oscillator.start(now);
        oscillator.stop(now + 0.25);
        break;
        
      case 'pickup':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.setValueAtTime(800, now + 0.04);
        oscillator.frequency.setValueAtTime(1000, now + 0.08);
        gainNode.gain.setValueAtTime(0.12, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        oscillator.start(now);
        oscillator.stop(now + 0.15);
        break;
        
      case 'rescue':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(500, now);
        oscillator.frequency.setValueAtTime(650, now + 0.08);
        oscillator.frequency.setValueAtTime(800, now + 0.16);
        oscillator.frequency.setValueAtTime(1000, now + 0.24);
        gainNode.gain.setValueAtTime(0.144, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
        break;
        
      case 'hit':
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.exponentialRampToValueAtTime(40, now + 0.1);
        gainNode.gain.setValueAtTime(0.144, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
        break;
        
      case 'bomb':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(300, now);
        oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.12);
        gainNode.gain.setValueAtTime(0.12, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        oscillator.start(now);
        oscillator.stop(now + 0.12);
        break;
        
      case 'missile':
        // Rocket launch sound - whooshing with ignition
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(80, now);
        oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.05);
        oscillator.frequency.exponentialRampToValueAtTime(120, now + 0.2);
        gainNode.gain.setValueAtTime(0.144, now);
        gainNode.gain.linearRampToValueAtTime(0.096, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
        break;
        
      case 'electricPulse':
        // Electric zap/shock sound - crackling high frequency burst
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(3000, now);
        oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.05);
        oscillator.frequency.setValueAtTime(2500, now + 0.06);
        oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.15);
        oscillator.frequency.setValueAtTime(1800, now + 0.16);
        oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.25);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.linearRampToValueAtTime(0.08, now + 0.05);
        gainNode.gain.linearRampToValueAtTime(0.12, now + 0.06);
        gainNode.gain.linearRampToValueAtTime(0.06, now + 0.15);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 0.16);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        oscillator.start(now);
        oscillator.stop(now + 0.25);
        break;
        
      case 'megaBomb':
        // Massive explosion - deep rumbling boom
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.exponentialRampToValueAtTime(30, now + 0.1);
        oscillator.frequency.setValueAtTime(100, now + 0.12);
        oscillator.frequency.exponentialRampToValueAtTime(15, now + 0.4);
        gainNode.gain.setValueAtTime(0.25, now);
        gainNode.gain.linearRampToValueAtTime(0.18, now + 0.1);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.12);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        oscillator.start(now);
        oscillator.stop(now + 0.4);
        break;
        
      case 'homingMissilePickup':
        // Weapon lock-on activation beep
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.setValueAtTime(1200, now + 0.05);
        oscillator.frequency.setValueAtTime(800, now + 0.1);
        oscillator.frequency.setValueAtTime(1600, now + 0.15);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.setValueAtTime(0.12, now + 0.05);
        gainNode.gain.setValueAtTime(0.1, now + 0.1);
        gainNode.gain.setValueAtTime(0.14, now + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        oscillator.start(now);
        oscillator.stop(now + 0.25);
        break;
        
      case 'forceField':
        // Buzz humming sound for force field activation
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(120, now);
        oscillator.frequency.linearRampToValueAtTime(180, now + 0.1);
        oscillator.frequency.linearRampToValueAtTime(150, now + 0.3);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.1);
        gainNode.gain.linearRampToValueAtTime(0.12, now + 0.25);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        oscillator.start(now);
        oscillator.stop(now + 0.35);
        break;
    }
  } catch (e) {
    // Audio not supported or blocked
  }
}

// Helper to get the correct shoot sound for each mega ship
export function getShipShootSound(shipId: string): 'shoot' | 'laser' | 'rapidFire' | 'multiShot' | 'stealthShot' {
  switch (shipId) {
    case 'blue_hawk': return 'laser';       // PHOTON EDGE - precision laser
    case 'arctic_wolf': return 'shoot';     // CRYO BLAST - pulse handled separately
    case 'delta_prime': return 'rapidFire'; // HYPER SYNC - machinegun
    case 'crimson_hawk': return 'multiShot'; // MULTI VECTOR - plasma spread
    case 'valkyrie_prime': return 'stealthShot'; // NULL PHASE - lightning
    default: return 'shoot';                // GRID CORE - standard
  }
}

// Helper to get bomb sound for ships
export function getShipBombSound(shipId: string): 'bomb' | 'iceBomb' {
  return shipId === 'arctic_wolf' ? 'iceBomb' : 'bomb';
}

// Get shoot sound type for Vector Maniac sounds system
export function getShipShootSoundType(shipId: string): string {
  switch (shipId) {
    case 'blue_hawk': return 'laser';
    case 'arctic_wolf': return 'pulse';
    case 'delta_prime': return 'machinegun';
    case 'crimson_hawk': return 'plasma';
    case 'valkyrie_prime': return 'lightning';
    default: return 'shoot';
  }
}
