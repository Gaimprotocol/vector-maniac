// Arena definitions with background images and names

export interface ArenaDefinition {
  id: string;
  name: string;
  image: string;
}

export const ARENAS: ArenaDefinition[] = [
  { id: 'nexus-core', name: 'NEXUS CORE', image: '/arenas/nexus-core.jpeg' },
  { id: 'cyber-vault', name: 'CYBER VAULT', image: '/arenas/cyber-vault.jpeg' },
  { id: 'quantum-grid', name: 'QUANTUM GRID', image: '/arenas/quantum-grid.jpeg' },
  { id: 'data-matrix', name: 'DATA MATRIX', image: '/arenas/data-matrix.jpeg' },
  { id: 'neural-link', name: 'NEURAL LINK', image: '/arenas/neural-link.jpeg' },
  { id: 'circuit-arena', name: 'CIRCUIT ARENA', image: '/arenas/circuit-arena.jpeg' },
  { id: 'void-station', name: 'VOID STATION', image: '/arenas/void-station.jpeg' },
  { id: 'tech-dome', name: 'TECH DOME', image: '/arenas/tech-dome.jpeg' },
  { id: 'plasma-core', name: 'PLASMA CORE', image: '/arenas/plasma-core.jpeg' },
  { id: 'grid-sector', name: 'GRID SECTOR', image: '/arenas/grid-sector.jpeg' },
];

// Get a random arena
export function getRandomArena(): ArenaDefinition {
  return ARENAS[Math.floor(Math.random() * ARENAS.length)];
}

// Preload arena images
const arenaImageCache: Map<string, HTMLImageElement> = new Map();

export function preloadArenaImages(): void {
  for (const arena of ARENAS) {
    if (!arenaImageCache.has(arena.id)) {
      const img = new Image();
      img.src = arena.image;
      arenaImageCache.set(arena.id, img);
    }
  }
}

export function getArenaImage(arenaId: string): HTMLImageElement | null {
  return arenaImageCache.get(arenaId) || null;
}

// Load a specific arena image
export function loadArenaImage(arena: ArenaDefinition): HTMLImageElement {
  if (arenaImageCache.has(arena.id)) {
    return arenaImageCache.get(arena.id)!;
  }
  
  const img = new Image();
  img.src = arena.image;
  arenaImageCache.set(arena.id, img);
  return img;
}
