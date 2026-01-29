// Arena Battle Mode Constants

export const ARENA_CONFIG = {
  // Arena dimensions (compact for intense combat)
  arenaWidth: 600,
  arenaHeight: 800,
  arenaPadding: 30,
  
  // Player stats
  playerMaxHealth: 100,
  playerSpeed: 5,
  playerFireRate: 12,
  playerDamage: 15,
  playerBulletSpeed: 12,
  
  // Combat
  invulnerabilityFrames: 60,
  projectileSize: 6,
  
  // Obstacles
  minObstacles: 4,
  maxObstacles: 8,
  pillarSize: 40,
  wallWidth: 100,
  wallHeight: 20,
  
  // Timing
  countdownDuration: 180, // 3 seconds at 60fps
  enteringDuration: 120,
  victoryDuration: 180,
  defeatDuration: 180,
  
  // Colors
  playerColor: '#00ff88',
  opponentColor: '#ff4466',
  obstacleColor: '#334455',
  arenaBackgroundColor: '#0a0f14',
  gridColor: '#1a2530',
};
