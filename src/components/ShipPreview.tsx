import React, { useRef, useEffect } from 'react';
import { drawMegaShip } from '@/game/megaShipRenderer';
import { getStoredMegaShipId } from '@/hooks/useMegaShips';

interface ShipPreviewProps {
  width?: number;
  height?: number;
}

export const ShipPreview: React.FC<ShipPreviewProps> = ({ 
  width = 200, 
  height = 200 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const draw = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);
      
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Get the currently selected ship
      const megaShipId = getStoredMegaShipId();

      // Draw the actual selected mega ship with upgrades
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(1.8, 1.8); // Scale up for better visibility
      drawMegaShip(ctx, 0, 0, megaShipId, time);
      ctx.restore();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border border-cyan-400/30 rounded-lg"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(0, 30, 60, 0.8) 0%, rgba(0, 10, 20, 0.9) 100%)',
        boxShadow: '0 0 20px rgba(0, 229, 255, 0.2), inset 0 0 30px rgba(0, 0, 0, 0.5)',
      }}
    />
  );
};
