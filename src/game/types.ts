// Core game types

export interface Vector2D {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  active: boolean;
}

export interface Player extends Entity {
  health: number;
  maxHealth: number;
  isGroundMode: boolean;
  invulnerable: boolean;
  invulnerableTimer: number;
  fireTimer: number;
  bombTimer: number;
  targetX: number;
  targetY: number;
  trail: { x: number; y: number; alpha: number }[];
  // Power-ups
  hasHomingMissiles: boolean;
  homingMissileTimer: number;
  pendingMissile: { x: number; y: number; delay: number } | null;
  hasShield: boolean;
  shieldTimer: number;
  hasTripleShot: boolean;
  tripleShotTimer: number;
  hasForceField: boolean;
  forceFieldTimer: number;
}

export interface Bullet extends Entity {
  damage: number;
  isPlayerBullet: boolean;
  isHoming?: boolean;
  targetId?: string;
  isLaser?: boolean;
}

export interface Bomb extends Entity {
  damage: number;
  timer: number;
}

export interface Enemy extends Entity {
  type: 'turret' | 'drone' | 'leech' | 'missile' | 'hostilePerson' | 'bomber' | 'sniper' | 'tank' | 'jellyfish' | 'kraken' | 'seaMine' | 'gunboat';
  health: number;
  fireTimer: number;
  behavior: EnemyBehavior;
  targetId?: string;
  aimAngle?: number;
  formationId?: number; // Track which formation this enemy belongs to
  shockedTimer?: number; // Timer for electric pulse visual effect
}

export interface EnemyBehavior {
  pattern: 'static' | 'patrol' | 'chase' | 'sine';
  amplitude?: number;
  frequency?: number;
  startY?: number;
}

export interface Civilian extends Entity {
  rescued: boolean;
  hasLeech: boolean;
}

export interface Pickup extends Entity {
  type: 'forceField' | 'health' | 'shield' | 'homingMissile' | 'megaBomb' | 'escort' | 'tripleShot' | 'electricPulse';
  value: number;
}

export interface Particle extends Entity {
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

export interface TerrainSegment {
  x: number;
  topHeight: number;
  bottomHeight: number;
  hasStructure: boolean;
  structureType?: 'building' | 'pipe' | 'tower' | 'crystal' | 'rock' | 'spire' | 'skyscraper' | 'antenna' | 'dome' | 'waterfall' | 'lavafall';
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
  layer: number; // 0 = far, 1 = mid, 2 = near
}

export interface FallingDebris extends Entity {
  damage: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  debrisType?: 'rock' | 'ice' | 'lava' | 'metal';
}

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover' | 'bunker' | 'rover' | 'underwater' | 'arena' | 'survival' | 'pilotRunner' | 'paratrooper' | 'forwardFlight' | 'vectorManiac';

export interface GameData {
  state: GameState;
  previousState?: GameState; // For pause/resume functionality
  score: number;
  highScore: number;
  level: number;
  rescuedCount: number;
  player: Player;
  bullets: Bullet[];
  bombs: Bomb[];
  enemies: Enemy[];
  civilians: Civilian[];
  pickups: Pickup[];
  particles: Particle[];
  terrain: TerrainSegment[];
  fallingDebris: FallingDebris[];
  stars: Star[];
  scrollOffset: number;
  scrollSpeed: number;
  difficulty: number;
  screenShake: number;
  // Map system
  currentMapId: number;
  waveNumber: number; // How many times player has completed all 50 maps (starts at 1)
  totalLevelsPlayed: number; // Total levels including bonus (for bonus timing)
  mapScrollOffset: number;
  isWarping: boolean;
  isBonusWarp: boolean; // True if warping to a bonus level (use full effect)
  levelGlowTimer: number; // Timer for level text glow effect
  warpTimer: number;
  escorts: any[];
  bunkerState: any | null;
  roverState: any | null;
  underwaterState: any | null;
  arenaState: any | null;
  survivalState: any | null;
  pilotRunnerState: any | null;
  paratrooperState: any | null;
  forwardFlightState: any | null;
  vectorManiacState: any | null;
  // Hyperspace
  isHyperspace: boolean;
  hyperspaceTimer: number;
  hyperspaceExitTimer: number;
  // Hazard zone
  inHazardZone: boolean;
  terrainCollisionTimer: number;
  // Collision flash effects
  collisionFlash: { x: number; y: number; timer: number; color: string }[];
  // Formation tracking for power-up drops
  nextFormationId: number;
  killsSinceLastDrop: number;
  // Ad reward boosts (timed bonuses)
  adDoublePointsActive: boolean;
  adShieldActive: boolean;
  adSpeedActive: boolean;
  adDoubleBombsActive: boolean;
  adTripleShotsActive: boolean;
  adDoubleLaserActive: boolean;
  // Mega ship stealth mode
  stealthTimer: number;
  isStealthActive: boolean;
  // Crimson Hawk multi-shot timer (once per second)
  multiShotTimer: number;
  // Bonus maps toggle
  bonusMapsEnabled: boolean;
  // Ultimate Edition flag (for map locking)
  hasUltimateEdition: boolean;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  fire: boolean;
  bomb: boolean;
  rescue: boolean;
  toggleMode: boolean;
  pause: boolean;
  touchX: number;
  touchY: number;
  isTouching: boolean;
}

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  playerSpeed: number;
  bulletSpeed: number;
  scrollSpeed: number;
  fireRate: number;
  bombRate: number;
}
