// Escort plane system - helper planes that fight alongside the player
import { Entity, Bullet } from './types';
import { generateId } from './utils';
import { GAME_CONFIG } from './constants';

export interface EscortPlane extends Entity {
  type: 'shooter' | 'bomber';
  timer: number;
  fireTimer: number;
  offsetY: number;
}

export function createEscortPlane(
  playerX: number,
  playerY: number,
  type: 'shooter' | 'bomber'
): EscortPlane {
  const offsetY = type === 'shooter' ? -30 : 30;
  return {
    id: generateId(),
    x: playerX - 40,
    y: playerY + offsetY,
    width: 20,
    height: 10,
    velocityX: 0,
    velocityY: 0,
    active: true,
    type,
    timer: 360, // 6 seconds at 60fps
    fireTimer: 0,
    offsetY,
  };
}

export function updateEscortPlanes(
  escorts: EscortPlane[],
  playerX: number,
  playerY: number,
  scrollOffset: number
): { escorts: EscortPlane[]; bullets: Bullet[] } {
  const newBullets: Bullet[] = [];
  
  const updatedEscorts = escorts
    .map(escort => {
      const newEscort = { ...escort };
      
      // Follow player
      const targetX = playerX - 40;
      const targetY = playerY + escort.offsetY;
      newEscort.x = newEscort.x + (targetX - newEscort.x) * 0.1;
      newEscort.y = newEscort.y + (targetY - newEscort.y) * 0.1;
      
      // Decrease timer
      newEscort.timer--;
      newEscort.fireTimer--;
      
      // Fire
      if (newEscort.fireTimer <= 0) {
        if (escort.type === 'shooter') {
          // Shooter fires bullets forward
          newBullets.push({
            id: generateId(),
            x: newEscort.x + 20,
            y: newEscort.y + 5,
            width: 5,
            height: 2,
            velocityX: 12,
            velocityY: 0,
            active: true,
            damage: 8,
            isPlayerBullet: true,
          });
          newEscort.fireTimer = 15;
        } else {
          // Bomber drops bombs downward
          newBullets.push({
            id: generateId(),
            x: newEscort.x + 10,
            y: newEscort.y + 10,
            width: 4,
            height: 4,
            velocityX: 0,
            velocityY: 4,
            active: true,
            damage: 15,
            isPlayerBullet: true,
          });
          newEscort.fireTimer = 45;
        }
      }
      
      return newEscort;
    })
    .filter(escort => escort.timer > 0);
  
  return { escorts: updatedEscorts, bullets: newBullets };
}

export function renderEscortPlane(
  ctx: CanvasRenderingContext2D,
  escort: EscortPlane,
  scrollOffset: number
): void {
  const x = escort.x - scrollOffset;
  const y = escort.y;
  
  // Glow effect
  const gradient = ctx.createRadialGradient(
    x + escort.width / 2, y + escort.height / 2, 0,
    x + escort.width / 2, y + escort.height / 2, 20
  );
  gradient.addColorStop(0, 'rgba(0, 255, 255, 0.3)');
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.fillRect(x - 10, y - 10, escort.width + 20, escort.height + 20);
  
  // Body
  ctx.fillStyle = escort.type === 'shooter' ? '#00ccff' : '#ff8800';
  ctx.beginPath();
  ctx.moveTo(x + escort.width, y + escort.height / 2);
  ctx.lineTo(x + escort.width - 8, y);
  ctx.lineTo(x, y + 2);
  ctx.lineTo(x, y + escort.height - 2);
  ctx.lineTo(x + escort.width - 8, y + escort.height);
  ctx.closePath();
  ctx.fill();
  
  // Highlight
  ctx.fillStyle = escort.type === 'shooter' ? '#88eeff' : '#ffcc88';
  ctx.fillRect(x + 5, y + escort.height / 2 - 1, 8, 2);
  
  // Engine
  const exhaustLength = 5 + Math.random() * 3;
  ctx.fillStyle = escort.type === 'shooter' ? '#00ffff' : '#ffaa00';
  ctx.beginPath();
  ctx.moveTo(x, y + escort.height / 2 - 2);
  ctx.lineTo(x - exhaustLength, y + escort.height / 2);
  ctx.lineTo(x, y + escort.height / 2 + 2);
  ctx.closePath();
  ctx.fill();
  
  // Flashing indicator when about to expire
  if (escort.timer < 60 && Math.floor(escort.timer / 10) % 2 === 0) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(x, y, escort.width, escort.height);
  }
}
