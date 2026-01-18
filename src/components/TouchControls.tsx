import React, { useCallback, useRef, useEffect } from 'react';
import { InputState, GameState } from '@/game/types';
import { GAME_CONFIG, TOUCH_CONFIG } from '@/game/constants';
import { VM_CONFIG } from '@/game/vectorManiac/constants';

interface TouchControlsProps {
  onInputChange: (input: Partial<InputState>) => void;
  gameState: GameState;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const DOUBLE_TAP_DELAY = 300; // ms

export const TouchControls: React.FC<TouchControlsProps> = ({ 
  onInputChange, 
  gameState,
  canvasRef 
}) => {
  const movementTouchId = useRef<number | null>(null);
  const lastTapTime = useRef<number>(0);

  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Use Vector Maniac dimensions for that mode
    const isVectorManiac = gameState === 'vectorManiac';
    const canvasWidth = isVectorManiac ? VM_CONFIG.arenaWidth : GAME_CONFIG.canvasWidth;
    const canvasHeight = isVectorManiac ? VM_CONFIG.arenaHeight : GAME_CONFIG.canvasHeight;
    
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, [canvasRef, gameState]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (gameState !== 'playing' && gameState !== 'bunker' && gameState !== 'rover' && gameState !== 'underwater' && gameState !== 'arena' && gameState !== 'survival' && gameState !== 'pilotRunner' && gameState !== 'paratrooper' && gameState !== 'forwardFlight' && gameState !== 'vectorManiac') return;
    e.preventDefault();

    const now = Date.now();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const coords = getCanvasCoords(touch.clientX, touch.clientY);
      
      // Check for double-tap to drop bomb
      if (now - lastTapTime.current < DOUBLE_TAP_DELAY) {
        onInputChange({ bomb: true });
        // Reset bomb after a short delay
        setTimeout(() => onInputChange({ bomb: false }), 100);
      }
      lastTapTime.current = now;
      
      // Use touch for movement
      if (movementTouchId.current === null) {
        movementTouchId.current = touch.identifier;
        
        // Set target position with offset (ship ahead of finger)
        // For Vector Maniac (portrait), ship is ~14mm (53px) above finger
        const isVectorManiac = gameState === 'vectorManiac';
        const offsetX = isVectorManiac ? 0 : TOUCH_CONFIG.shipOffsetX;
        const offsetY = isVectorManiac ? -53 : TOUCH_CONFIG.shipOffsetY;
        
        onInputChange({
          isTouching: true,
          touchX: coords.x + offsetX,
          touchY: coords.y + offsetY,
          fire: true,
        });
      }
    }
  }, [gameState, getCanvasCoords, onInputChange]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (gameState !== 'playing' && gameState !== 'bunker' && gameState !== 'rover' && gameState !== 'underwater' && gameState !== 'arena' && gameState !== 'survival' && gameState !== 'pilotRunner' && gameState !== 'paratrooper' && gameState !== 'forwardFlight' && gameState !== 'vectorManiac') return;
    e.preventDefault();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      
      if (touch.identifier === movementTouchId.current) {
        const coords = getCanvasCoords(touch.clientX, touch.clientY);
        
        // Use appropriate offset for game mode
        // For Vector Maniac (portrait), ship is ~14mm (53px) above finger
        const isVectorManiac = gameState === 'vectorManiac';
        const offsetX = isVectorManiac ? 0 : TOUCH_CONFIG.shipOffsetX;
        const offsetY = isVectorManiac ? -53 : TOUCH_CONFIG.shipOffsetY;
        
        onInputChange({
          touchX: coords.x + offsetX,
          touchY: coords.y + offsetY,
        });
      }
    }
  }, [gameState, getCanvasCoords, onInputChange]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      
      if (touch.identifier === movementTouchId.current) {
        movementTouchId.current = null;
        onInputChange({
          isTouching: false,
          fire: false,
        });
      }
    }
  }, [onInputChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [canvasRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  const handleButtonPulse = useCallback(
    (action: keyof InputState) => (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onInputChange({ [action]: true });
      // make it a reliable "tap" action (not dependent on touchend firing)
      window.setTimeout(() => onInputChange({ [action]: false }), 50);
    },
    [onInputChange]
  );

  const handleJumpPress = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Use rescue key for jump in pilot runner mode
    onInputChange({ rescue: true });
    window.setTimeout(() => onInputChange({ rescue: false }), 100);
  }, [onInputChange]);

  if (gameState !== 'playing' && gameState !== 'bunker' && gameState !== 'rover' && gameState !== 'underwater' && gameState !== 'arena' && gameState !== 'survival' && gameState !== 'pilotRunner' && gameState !== 'paratrooper' && gameState !== 'forwardFlight' && gameState !== 'vectorManiac') return null;

  const showJumpButton = gameState === 'pilotRunner';

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Top right - Pause button */}
      <button
        className="absolute w-10 h-10 rounded-lg border-2 border-primary/60 active:bg-primary/30 flex items-center justify-center pointer-events-auto touch-none"
        style={{
          top: 80,
          right: 18,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%)',
          boxShadow: '0 0 10px hsl(var(--primary) / 0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
        onPointerDown={handleButtonPulse('pause')}
      >
        <span 
          className="font-pixel text-sm text-primary"
          style={{ textShadow: '0 0 8px hsl(var(--primary))' }}
        >
          II
        </span>
      </button>

      {/* Jump button for Pilot Runner mode */}
      {showJumpButton && (
        <button
          className="absolute w-16 h-16 rounded-full border-2 border-cyan-400/80 active:bg-cyan-400/40 flex items-center justify-center pointer-events-auto touch-none"
          style={{
            bottom: 40,
            left: 30,
            background: 'linear-gradient(180deg, rgba(0,200,255,0.3) 0%, rgba(0,100,200,0.4) 100%)',
            boxShadow: '0 0 20px rgba(0,200,255,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
          onPointerDown={handleJumpPress}
        >
          <span 
            className="font-pixel text-lg text-cyan-300"
            style={{ textShadow: '0 0 10px rgba(0,255,255,0.8)' }}
          >
            ↑
          </span>
        </button>
      )}
    </div>
  );
};
