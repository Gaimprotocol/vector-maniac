// Arena Battle Mode Constants
// Scaled down 50% with slower, more tactical combat

import { VM_CONFIG } from '../vectorManiac/constants';

export const ARENA_CONFIG = {
  // 50% scaled dimensions for tighter combat
  arenaWidth: Math.floor(VM_CONFIG.arenaWidth * 0.5),   // 390
  arenaHeight: Math.floor(VM_CONFIG.arenaHeight * 0.5), // 844
  arenaPadding: 25,
  
  // Player stats - Higher health for longer matches
  playerMaxHealth: 200, // Doubled from 100
  playerSpeed: 2.5,
  playerFireRate: VM_CONFIG.baseFireRate,
  playerDamage: 6, // Reduced from base for longer fights
  playerBulletSpeed: 6,
  playerSize: 14,
  
  // Ship offset (scaled down)
  shipOffsetY: 100,
  
  // Combat - Reduced damage for longer matches
  invulnerabilityFrames: 45, // Shorter i-frames
  projectileSize: 3,
  
  // Obstacles - scaled for smaller arena
  minObstacles: 3,
  maxObstacles: 6,
  pillarSize: 20,
  wallWidth: 50,
  wallHeight: 10,
  
  // Energy barriers (new)
  barrierCount: 2,
  barrierWidth: 60,
  barrierHeight: 8,
  
  // Timing
  countdownDuration: 180,
  enteringDuration: 120,
  victoryDuration: 180,
  defeatDuration: 180,
  
  // Colors - Clean minimalist palette
  playerColor: '#00ffaa',
  opponentColor: '#ff5577',
  obstacleColor: '#00ffcc',
  barrierColor: '#00ffaa',
  arenaBackgroundColor: '#05080c',
  gridColor: '#0d1520',
  accentCyan: '#00ccff',
  accentMagenta: '#ff0088',
  accentPurple: '#6633ff',
};