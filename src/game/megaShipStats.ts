// Mega Ship Stats & Abilities System for Vector Maniac
// Each ship has unique trade-offs for different playstyles

export type ProjectileType = 'standard' | 'laser' | 'pulse' | 'machinegun' | 'lightning' | 'plasma';

export interface MegaShipStats {
  id: string;
  name: string;
  description: string;
  
  // Combat stats (1.0 = baseline)
  damage: number;           // Projectile damage multiplier
  fireRate: number;         // Fire rate multiplier (higher = faster)
  projectileSpeed: number;  // Bullet speed multiplier
  
  // Defense stats
  defense: number;          // Damage reduction (1.0 = normal, 0.8 = takes 20% less)
  maxHealth: number;        // Max health multiplier
  
  // Movement stats
  speed: number;            // Movement speed multiplier
  
  // Projectile type and visual
  projectileType: ProjectileType;
  projectileColor: string;
  projectileGlow: string;
  
  // Special ability description
  specialAbility: string;
  
  // Sound type for projectile (maps to shipProjectiles.ts sounds)
  shootSoundType: 'shoot' | 'laser' | 'pulse' | 'energy' | 'fire' | 'ice' | 'plasma';
}

// Map mega ship IDs to their corresponding ship model IDs for projectile styling
export const MEGA_SHIP_TO_PROJECTILE_MAP: Record<string, string> = {
  'original': 'default',      // GRID CORE -> cyan circles
  'blue_hawk': 'bluehawk',    // PHOTON EDGE -> laser beams
  'arctic_wolf': 'arctic',    // CRYO BLAST -> ice diamonds
  'delta_prime': 'needle',    // HYPER SYNC -> fast needles
  'crimson_hawk': 'phoenix',  // MULTI VECTOR -> plasma stars
  'valkyrie_prime': 'phantom', // NULL PHASE -> energy diamonds
};

// The 6 Mega Ships with balanced trade-offs
// Total "power score" for each ship should be roughly equal
export const MEGA_SHIP_STATS: Record<string, MegaShipStats> = {
  // GRID CORE - The balanced all-rounder
  'original': {
    id: 'original',
    name: 'GRID CORE',
    description: 'Balanced vector fighter',
    damage: 1.0,
    fireRate: 1.0,
    projectileSpeed: 1.0,
    defense: 1.0,
    maxHealth: 1.0,
    speed: 1.0,
    projectileType: 'standard',
    projectileColor: '#00ffff',
    projectileGlow: '#00ddff',
    specialAbility: 'Balanced stats across all attributes',
    shootSoundType: 'shoot',
  },
  
  // PHOTON EDGE - Precision laser cutter (High damage, slow fire, fragile)
  'blue_hawk': {
    id: 'blue_hawk',
    name: 'PHOTON EDGE',
    description: 'Precision beam cutter',
    damage: 1.8,           // +80% damage per shot
    fireRate: 0.6,         // -40% fire rate (slower)
    projectileSpeed: 1.5,  // +50% projectile speed
    defense: 0.7,          // -30% defense (takes more damage)
    maxHealth: 0.85,       // -15% health
    speed: 0.9,            // -10% speed
    projectileType: 'laser',
    projectileColor: '#44aaff',
    projectileGlow: '#2277ff',
    specialAbility: 'Piercing laser beams with high damage but slower rate',
    shootSoundType: 'laser',
  },
  
  // CRYO BLAST - Tank build (Strong defense, weak offense)
  'arctic_wolf': {
    id: 'arctic_wolf',
    name: 'CRYO BLAST',
    description: 'Heavy armored tank',
    damage: 0.7,           // -30% shot damage
    fireRate: 0.8,         // -20% fire rate
    projectileSpeed: 0.85, // -15% projectile speed
    defense: 1.4,          // +40% defense (takes less damage)
    maxHealth: 1.4,        // +40% health
    speed: 0.8,            // -20% speed (heavy ship)
    projectileType: 'pulse',
    projectileColor: '#aaddff',
    projectileGlow: '#88ccff',
    specialAbility: 'Maximum armor and health - survives the longest',
    shootSoundType: 'ice',
  },
  
  // HYPER SYNC - Speed demon (Fast everything, glass cannon)
  'delta_prime': {
    id: 'delta_prime',
    name: 'HYPER SYNC',
    description: 'Overclocked interceptor',
    damage: 0.75,          // -25% damage
    fireRate: 1.6,         // +60% fire rate (machinegun)
    projectileSpeed: 1.4,  // +40% projectile speed
    defense: 0.6,          // -40% defense (very fragile)
    maxHealth: 0.7,        // -30% health
    speed: 1.5,            // +50% speed
    projectileType: 'machinegun',
    projectileColor: '#88ff88',
    projectileGlow: '#44ff66',
    specialAbility: 'Extreme speed and fire rate - dodge everything',
    shootSoundType: 'shoot',
  },
  
  // MULTI VECTOR - Spread shot (Multi-directional, moderate stats)
  'crimson_hawk': {
    id: 'crimson_hawk',
    name: 'MULTI VECTOR',
    description: 'Omni-directional assault',
    damage: 0.65,          // -35% per shot (but more shots!)
    fireRate: 0.9,         // -10% fire rate
    projectileSpeed: 1.0,  // Normal projectile speed
    defense: 1.0,          // Normal defense
    maxHealth: 1.0,        // Normal health
    speed: 1.0,            // Normal speed
    projectileType: 'plasma',
    projectileColor: '#ff6644',
    projectileGlow: '#ff4422',
    specialAbility: 'Fires in 4 directions - excellent vs swarms',
    shootSoundType: 'fire',
  },
  
  // NULL PHASE - Stealth striker (High burst, fast, specialized)
  'valkyrie_prime': {
    id: 'valkyrie_prime',
    name: 'NULL PHASE',
    description: 'Phantom stealth striker',
    damage: 1.4,           // +40% damage
    fireRate: 0.85,        // -15% fire rate
    projectileSpeed: 1.3,  // +30% projectile speed
    defense: 0.75,         // -25% defense
    maxHealth: 0.85,       // -15% health
    speed: 1.4,            // +40% speed
    projectileType: 'lightning',
    projectileColor: '#aa88ff',
    projectileGlow: '#7755ff',
    specialAbility: 'High burst damage with superior mobility',
    shootSoundType: 'energy',
  },
};

// Get stats for a mega ship
export function getMegaShipStats(shipId: string): MegaShipStats {
  return MEGA_SHIP_STATS[shipId] || MEGA_SHIP_STATS['original'];
}

// Get the projectile model ID for a mega ship (for visual styling)
export function getMegaShipProjectileModelId(shipId: string): string {
  return MEGA_SHIP_TO_PROJECTILE_MAP[shipId] || 'default';
}

// Calculate effective damage considering stats
export function calculateDamage(baseDamage: number, shipId: string): number {
  const stats = getMegaShipStats(shipId);
  return Math.round(baseDamage * stats.damage);
}

// Calculate effective fire rate
export function calculateFireRate(baseRate: number, shipId: string): number {
  const stats = getMegaShipStats(shipId);
  return baseRate / stats.fireRate; // Lower = faster
}

// Calculate damage received with defense
export function calculateDamageReceived(incomingDamage: number, shipId: string): number {
  const stats = getMegaShipStats(shipId);
  return Math.round(incomingDamage / stats.defense);
}

// Get all ship IDs
export function getAllMegaShipIds(): string[] {
  return Object.keys(MEGA_SHIP_STATS);
}

// Format stat for display (percentage change from baseline)
export function formatStatChange(value: number): string {
  const percent = Math.round((value - 1) * 100);
  if (percent > 0) return `+${percent}%`;
  if (percent < 0) return `${percent}%`;
  return '—';
}

// Get color for stat display (green = good, red = bad)
export function getStatColor(value: number): string {
  if (value > 1.05) return '#44ff88'; // Green for buffs
  if (value < 0.95) return '#ff6666'; // Red for debuffs
  return '#aaaaaa'; // Gray for neutral
}
