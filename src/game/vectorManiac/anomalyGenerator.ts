// Anomaly Generator - Procedurally Generated Enemies
// Creates unique, randomized enemies that the player has never seen before

import { VectorEnemy } from './types';
import { VM_CONFIG } from './constants';
import { generateId, randomFromEdge, normalize } from './utils';

// Anomaly behavior patterns
export type AnomalyBehavior = 
  | 'chase'      // Direct pursuit
  | 'orbit'      // Circles the player
  | 'zigzag'     // Erratic side-to-side
  | 'teleport'   // Short-range blinks
  | 'spiral'     // Spirals inward
  | 'strafe'     // Moves perpendicular to player
  | 'pounce'     // Waits then lunges
  | 'mirror';    // Mirrors player movement

// Anomaly special abilities
export type AnomalyAbility = 
  | 'none'
  | 'shooter'    // Can fire projectiles
  | 'splitter'   // Splits on death
  | 'shield'     // Has a damage-absorbing shield
  | 'phaser'     // Phases in/out (temporary invulnerability)
  | 'leech';     // Heals when near player

// Visual shape types
export type AnomalyShape = 
  | 'triangle'
  | 'square'
  | 'pentagon'
  | 'hexagon'
  | 'star'
  | 'cross'
  | 'crescent'
  | 'spiral';

// Anomaly DNA - stored in behaviorTimer as encoded value
export interface AnomalyDNA {
  // Core stats (all 0-255 range, normalized in use)
  hue: number;           // 0-360 color hue
  saturation: number;    // 50-100%
  sizeMultiplier: number; // 0.5-2.0x base size
  speedMultiplier: number; // 0.3-2.5x base speed
  healthMultiplier: number; // 0.5-3.0x base health
  
  // Behavior
  behavior: AnomalyBehavior;
  ability: AnomalyAbility;
  shape: AnomalyShape;
  
  // Visual modifiers
  hasAura: boolean;
  hasPulse: boolean;
  hasTrail: boolean;
  spinSpeed: number; // 0-3 (rotation speed)
  
  // Shooter properties (if ability is 'shooter')
  fireRate: number; // 60-200 frames
  projectileCount: number; // 1-5
  
  // Unique seed for this anomaly type
  seed: number;
}

// Generate a random DNA sequence for an anomaly
export function generateAnomalyDNA(mapNumber: number, seed?: number): AnomalyDNA {
  const s = seed ?? Math.floor(Math.random() * 1000000);
  
  // Seeded random function
  const seededRandom = (offset: number) => {
    const x = Math.sin(s + offset) * 10000;
    return x - Math.floor(x);
  };
  
  const behaviors: AnomalyBehavior[] = ['chase', 'orbit', 'zigzag', 'teleport', 'spiral', 'strafe', 'pounce', 'mirror'];
  const abilities: AnomalyAbility[] = ['none', 'none', 'shooter', 'shooter', 'splitter', 'shield', 'phaser', 'leech'];
  const shapes: AnomalyShape[] = ['triangle', 'square', 'pentagon', 'hexagon', 'star', 'cross', 'crescent', 'spiral'];
  
  // Higher maps unlock more dangerous combinations
  const dangerLevel = Math.min(1, mapNumber / 30);
  
  return {
    hue: Math.floor(seededRandom(1) * 360),
    saturation: 60 + Math.floor(seededRandom(2) * 40),
    sizeMultiplier: 0.6 + seededRandom(3) * 1.2 * (1 + dangerLevel * 0.5),
    speedMultiplier: 0.5 + seededRandom(4) * 1.5 * (1 + dangerLevel * 0.3),
    healthMultiplier: 0.7 + seededRandom(5) * 2.0 * (1 + dangerLevel * 0.5),
    
    behavior: behaviors[Math.floor(seededRandom(6) * behaviors.length)],
    ability: abilities[Math.floor(seededRandom(7) * abilities.length * (0.5 + dangerLevel * 0.5))],
    shape: shapes[Math.floor(seededRandom(8) * shapes.length)],
    
    hasAura: seededRandom(9) > 0.6,
    hasPulse: seededRandom(10) > 0.5,
    hasTrail: seededRandom(11) > 0.7,
    spinSpeed: seededRandom(12) * 2.5,
    
    fireRate: 80 + Math.floor(seededRandom(13) * 120),
    projectileCount: 1 + Math.floor(seededRandom(14) * 3 * dangerLevel),
    
    seed: s,
  };
}

// Encode DNA into a number for storage in enemy.behaviorTimer
// We use a simplified encoding that captures the key visual/behavior aspects
export function encodeDNA(dna: AnomalyDNA): number {
  // Format: SEED * 1000 + behavior_index * 100 + ability_index * 10 + shape_index
  const behaviors: AnomalyBehavior[] = ['chase', 'orbit', 'zigzag', 'teleport', 'spiral', 'strafe', 'pounce', 'mirror'];
  const abilities: AnomalyAbility[] = ['none', 'shooter', 'splitter', 'shield', 'phaser', 'leech'];
  const shapes: AnomalyShape[] = ['triangle', 'square', 'pentagon', 'hexagon', 'star', 'cross', 'crescent', 'spiral'];
  
  const behaviorIndex = behaviors.indexOf(dna.behavior);
  const abilityIndex = abilities.indexOf(dna.ability);
  const shapeIndex = shapes.indexOf(dna.shape);
  
  // Store seed in upper digits for reconstruction
  return (dna.seed % 10000) * 1000 + behaviorIndex * 100 + abilityIndex * 10 + shapeIndex;
}

// Decode DNA from behaviorTimer
export function decodeDNA(encoded: number, mapNumber: number): AnomalyDNA {
  const seed = Math.floor(encoded / 1000);
  return generateAnomalyDNA(mapNumber, seed);
}

// Get color from DNA
export function getAnomalyColor(dna: AnomalyDNA): string {
  return `hsl(${dna.hue}, ${dna.saturation}%, 60%)`;
}

export function getAnomalyGlowColor(dna: AnomalyDNA): string {
  return `hsl(${dna.hue}, ${dna.saturation}%, 70%)`;
}

// Create an anomaly enemy
export function createAnomaly(targetX: number, targetY: number, mapNumber: number): VectorEnemy {
  const spawn = randomFromEdge(VM_CONFIG.arenaWidth, VM_CONFIG.arenaHeight, 20);
  const dir = normalize(targetX - spawn.x, targetY - spawn.y);
  
  // Generate unique DNA
  const dna = generateAnomalyDNA(mapNumber);
  
  // Calculate stats from DNA
  const baseSize = 20;
  const baseHealth = 35;
  const baseSpeed = 1.8;
  
  const size = baseSize * dna.sizeMultiplier;
  const health = baseHealth * dna.healthMultiplier;
  const speed = baseSpeed * dna.speedMultiplier;
  
  return {
    id: generateId(),
    x: spawn.x,
    y: spawn.y,
    vx: dir.x * speed,
    vy: dir.y * speed,
    size,
    health,
    maxHealth: health,
    type: 'anomaly',
    fireTimer: dna.ability === 'shooter' ? dna.fireRate : 0,
    behaviorTimer: encodeDNA(dna),
    targetAngle: spawn.angle,
  };
}

// Create split anomaly (smaller version when original dies)
export function createSplitAnomaly(x: number, y: number, parentDNA: AnomalyDNA, mapNumber: number): VectorEnemy {
  const angle = Math.random() * Math.PI * 2;
  const speed = 2 + Math.random();
  
  // Child is smaller and weaker
  const childDNA: AnomalyDNA = {
    ...parentDNA,
    sizeMultiplier: parentDNA.sizeMultiplier * 0.6,
    healthMultiplier: parentDNA.healthMultiplier * 0.4,
    ability: 'none', // Children don't inherit special abilities
  };
  
  const baseSize = 20;
  const baseHealth = 35;
  
  return {
    id: generateId(),
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: baseSize * childDNA.sizeMultiplier,
    health: baseHealth * childDNA.healthMultiplier,
    maxHealth: baseHealth * childDNA.healthMultiplier,
    type: 'anomaly',
    fireTimer: 1, // Mark as split version (like splitter enemy)
    behaviorTimer: encodeDNA(childDNA),
    targetAngle: angle,
  };
}

// Generate a unique name for the anomaly based on its DNA
export function getAnomalyName(dna: AnomalyDNA): string {
  const prefixes = ['Void', 'Quantum', 'Chaos', 'Glitch', 'Phantom', 'Flux', 'Null', 'Echo', 'Drift', 'Pulse'];
  const suffixes = ['Walker', 'Stalker', 'Lurker', 'Hunter', 'Seeker', 'Shifter', 'Weaver', 'Bender', 'Crawler', 'Wraith'];
  
  const prefixIndex = dna.seed % prefixes.length;
  const suffixIndex = Math.floor(dna.seed / 10) % suffixes.length;
  
  return `${prefixes[prefixIndex]} ${suffixes[suffixIndex]}`;
}
