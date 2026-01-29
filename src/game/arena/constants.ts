// Arena Battle Mode Constants
// Scaled down 50% for tighter, more intense combat

import { VM_CONFIG } from '../vectorManiac/constants';

export const ARENA_CONFIG = {
  // 50% scaled dimensions for tighter combat
  arenaWidth: Math.floor(VM_CONFIG.arenaWidth * 0.5),   // 390
  arenaHeight: Math.floor(VM_CONFIG.arenaHeight * 0.5), // 844
  arenaPadding: Math.floor(VM_CONFIG.arenaPadding * 0.5), // 30
  
  // Player stats - scaled for smaller arena
  playerMaxHealth: 100,
  playerSpeed: Math.floor(VM_CONFIG.playerSpeed * 0.6), // Slower in smaller arena
  playerFireRate: VM_CONFIG.baseFireRate,
  playerDamage: VM_CONFIG.baseDamage,
  playerBulletSpeed: Math.floor(VM_CONFIG.baseBulletSpeed * 0.7),
  playerSize: Math.floor(VM_CONFIG.playerSize * 0.65), // Smaller ships
  
  // Ship offset (scaled down)
  shipOffsetY: 120,
  
  // Combat
  invulnerabilityFrames: 60,
  projectileSize: 4,
  
  // Obstacles - scaled for smaller arena
  minObstacles: 3,
  maxObstacles: 5,
  pillarSize: 25,
  wallWidth: 60,
  wallHeight: 12,
  
  // Timing
  countdownDuration: 180,
  enteringDuration: 120,
  victoryDuration: 180,
  defeatDuration: 180,
  
  // Colors - cyberpunk neon palette
  playerColor: '#00ff88',
  opponentColor: '#ff4466',
  obstacleColor: '#0066ff',
  arenaBackgroundColor: '#030308',
  gridColor: '#0a1428',
  accentCyan: '#00d4ff',
  accentMagenta: '#ff00aa',
  accentPurple: '#8844ff',
};
