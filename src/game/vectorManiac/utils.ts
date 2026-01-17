// Vector Maniac Utility Functions

let idCounter = 0;

export function generateId(): string {
  return `vm_${Date.now()}_${idCounter++}`;
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function normalize(x: number, y: number): { x: number; y: number } {
  const len = Math.sqrt(x * x + y * y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: x / len, y: y / len };
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpAngle(a: number, b: number, t: number): number {
  let diff = b - a;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function randomFromEdge(
  width: number, 
  height: number, 
  padding: number
): { x: number; y: number; angle: number } {
  const side = Math.floor(Math.random() * 4);
  let x: number, y: number, angle: number;
  
  switch (side) {
    case 0: // Top
      x = randomInRange(padding, width - padding);
      y = -padding;
      angle = Math.PI / 2; // Pointing down
      break;
    case 1: // Right
      x = width + padding;
      y = randomInRange(padding, height - padding);
      angle = Math.PI; // Pointing left
      break;
    case 2: // Bottom
      x = randomInRange(padding, width - padding);
      y = height + padding;
      angle = -Math.PI / 2; // Pointing up
      break;
    default: // Left
      x = -padding;
      y = randomInRange(padding, height - padding);
      angle = 0; // Pointing right
      break;
  }
  
  return { x, y, angle };
}
