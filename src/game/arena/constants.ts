// Arena Battle Mode Constants
// Uses the same resolution as the main game for consistency

import { VM_CONFIG } from '../vectorManiac/constants';

export const ARENA_CONFIG = {
  // Use EXACT same dimensions as main game
  arenaWidth: VM_CONFIG.arenaWidth,   // 780
  arenaHeight: VM_CONFIG.arenaHeight, // 1688
  arenaPadding: VM_CONFIG.arenaPadding, // 60
  
  // Player stats - same as main game
  playerMaxHealth: 100,
  playerSpeed: VM_CONFIG.playerSpeed, // 6
  playerFireRate: VM_CONFIG.baseFireRate, // 6
  playerDamage: VM_CONFIG.baseDamage, // 10
  playerBulletSpeed: VM_CONFIG.baseBulletSpeed, // 12
  playerSize: VM_CONFIG.playerSize, // 24
  
  // Ship offset (same as main game - 240px above finger)
  shipOffsetY: 240,
  
  // Combat
  invulnerabilityFrames: 60,
  projectileSize: 6,
  
  // Obstacles - scaled for larger arena
  minObstacles: 4,
  maxObstacles: 8,
  pillarSize: 50,
  wallWidth: 120,
  wallHeight: 25,
  
  // Timing
  countdownDuration: 180, // 3 seconds at 60fps
  enteringDuration: 120,
  victoryDuration: 180,
  defeatDuration: 180,
  
  // Colors - match main game aesthetic
  playerColor: '#00ff88',
  opponentColor: '#ff4466',
  obstacleColor: '#334455',
  arenaBackgroundColor: '#0a0f14',
  gridColor: '#1a2530',
};
