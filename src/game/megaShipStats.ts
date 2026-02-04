// Mega Ship Stats & Abilities System
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
  
  // Bomb stats
  bombDamage: number;       // Bomb damage multiplier
  bombRate: number;         // Bomb reload speed multiplier
  
  // Projectile type and visual
  projectileType: ProjectileType;
  projectileColor: string;
  projectileGlow: string;
  
  // Special ability description
  specialAbility: string;
  
  // Sound type for projectile
  shootSoundType: 'shoot' | 'laser' | 'pulse' | 'machinegun' | 'lightning' | 'plasma';
}

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
    bombDamage: 1.0,
    bombRate: 1.0,
    projectileType: 'standard',
    projectileColor: '#00ffff',
    projectileGlow: '#00ddff',
    specialAbility: 'Balanced stats - jack of all trades',
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
    bombDamage: 0.8,       // -20% bomb damage
    bombRate: 0.9,         // -10% bomb rate
    projectileType: 'laser',
    projectileColor: '#44aaff',
    projectileGlow: '#2277ff',
    specialAbility: 'Piercing laser beams - high damage, slow rate',
    shootSoundType: 'laser',
  },
  
  // CRYO BLAST - Heavy bomber (Strong bombs, weak shots, tanky)
  'arctic_wolf': {
    id: 'arctic_wolf',
    name: 'CRYO BLAST',
    description: 'Heavy payload bomber',
    damage: 0.7,           // -30% shot damage
    fireRate: 0.8,         // -20% fire rate
    projectileSpeed: 0.85, // -15% projectile speed
    defense: 1.3,          // +30% defense (takes less damage)
    maxHealth: 1.3,        // +30% health
    speed: 0.85,           // -15% speed (heavy ship)
    bombDamage: 1.8,       // +80% bomb damage
    bombRate: 1.5,         // +50% bomb rate (double bombs)
    projectileType: 'pulse',
    projectileColor: '#aaddff',
    projectileGlow: '#88ccff',
    specialAbility: 'Double bombs, high armor, slow but deadly',
    shootSoundType: 'pulse',
  },
  
  // HYPER SYNC - Speed demon (Fast everything, glass cannon)
  'delta_prime': {
    id: 'delta_prime',
    name: 'HYPER SYNC',
    description: 'Overclocked interceptor',
    damage: 0.75,          // -25% damage
    fireRate: 1.5,         // +50% fire rate (machinegun)
    projectileSpeed: 1.3,  // +30% projectile speed
    defense: 0.65,         // -35% defense (very fragile)
    maxHealth: 0.75,       // -25% health
    speed: 1.5,            // +50% speed
    bombDamage: 0.9,       // -10% bomb damage
    bombRate: 1.3,         // +30% bomb rate
    projectileType: 'machinegun',
    projectileColor: '#88ff88',
    projectileGlow: '#44ff66',
    specialAbility: 'Rapid fire machinegun, extreme speed, glass cannon',
    shootSoundType: 'machinegun',
  },
  
  // MULTI VECTOR - Spread shot (Multi-directional, moderate stats)
  'crimson_hawk': {
    id: 'crimson_hawk',
    name: 'MULTI VECTOR',
    description: 'Omni-directional assault',
    damage: 0.65,          // -35% per shot (but more shots!)
    fireRate: 0.85,        // -15% fire rate
    projectileSpeed: 0.95, // -5% projectile speed
    defense: 1.0,          // Normal defense
    maxHealth: 1.0,        // Normal health
    speed: 1.0,            // Normal speed
    bombDamage: 1.0,       // Normal bomb damage
    bombRate: 1.0,         // Normal bomb rate
    projectileType: 'plasma',
    projectileColor: '#ff6644',
    projectileGlow: '#ff4422',
    specialAbility: 'Fires in 4 directions - excellent for swarms',
    shootSoundType: 'plasma',
  },
  
  // NULL PHASE - Stealth striker (High burst, stealth mode, specialized)
  'valkyrie_prime': {
    id: 'valkyrie_prime',
    name: 'NULL PHASE',
    description: 'Phantom stealth striker',
    damage: 1.4,           // +40% damage
    fireRate: 0.9,         // -10% fire rate
    projectileSpeed: 1.2,  // +20% projectile speed
    defense: 0.8,          // -20% defense
    maxHealth: 0.9,        // -10% health
    speed: 1.35,           // +35% speed
    bombDamage: 0.7,       // -30% bomb damage
    bombRate: 0.75,        // -25% bomb rate
    projectileType: 'lightning',
    projectileColor: '#aa88ff',
    projectileGlow: '#7755ff',
    specialAbility: 'Stealth mode - periodic invulnerability bursts',
    shootSoundType: 'lightning',
  },
};

// Get stats for a mega ship
export function getMegaShipStats(shipId: string): MegaShipStats {
  return MEGA_SHIP_STATS[shipId] || MEGA_SHIP_STATS['original'];
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
