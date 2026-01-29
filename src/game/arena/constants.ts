// Arena Battle Mode Constants
// Scaled down 50% with slower, more tactical combat

import { VM_CONFIG } from '../vectorManiac/constants';

export const ARENA_CONFIG = {
  // 50% scaled dimensions for tighter combat
  arenaWidth: Math.floor(VM_CONFIG.arenaWidth * 0.5),   // 390
  arenaHeight: Math.floor(VM_CONFIG.arenaHeight * 0.5), // 844
  arenaPadding: 25,
  
  // Player stats - MUCH slower for tactical combat
  playerMaxHealth: 100,
  playerSpeed: 2.5, // Very slow, tactical movement
  playerFireRate: VM_CONFIG.baseFireRate,
  playerDamage: VM_CONFIG.baseDamage,
  playerBulletSpeed: 6, // Slower bullets
  playerSize: 14, // Smaller ships
  
  // Ship offset (scaled down)
  shipOffsetY: 100,
  
  // Combat
  invulnerabilityFrames: 60,
  projectileSize: 3,
  
  // Obstacles - scaled for smaller arena
  minObstacles: 2,
  maxObstacles: 4,
  pillarSize: 20,
  wallWidth: 50,
  wallHeight: 10,
  
  // Timing
  countdownDuration: 180,
  enteringDuration: 120,
  victoryDuration: 180,
  defeatDuration: 180,
  
  // Colors - Clean minimalist palette
  playerColor: '#00ffaa',
  opponentColor: '#ff5577',
  obstacleColor: '#3366ff',
  arenaBackgroundColor: '#05080c',
  gridColor: '#0d1520',
  accentCyan: '#00ccff',
  accentMagenta: '#ff0088',
  accentPurple: '#6633ff',
};