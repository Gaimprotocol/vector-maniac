import React, { useRef, useEffect } from 'react';
import { drawMegaShip } from '@/game/megaShipRenderer';
import { getStoredMegaShipId } from '@/hooks/useMegaShips';
import type { UpgradeState } from '@/hooks/useShipUpgrades';

interface ShipPreviewProps {
  width?: number;
  height?: number;
  upgradeVersion?: number; // Triggers re-render when upgrades change
  upgrades?: UpgradeState; // Preferred: pass current upgrades from state for immediate visuals
}

export const ShipPreview: React.FC<ShipPreviewProps> = ({ 
  width = 200, 
  height = 200,
  upgradeVersion = 0,
  upgrades,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startTime = performance.now();

    const draw = () => {
      const time = (performance.now() - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      const megaShipId = getStoredMegaShipId();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(1.8, 1.8);
      // Pass upgrades state when available so visuals update instantly on purchase
      drawMegaShip(ctx, 0, 0, megaShipId, time, undefined, upgrades);
      ctx.restore();

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [width, height, upgradeVersion, upgrades]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border border-primary/30 rounded-lg"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(0, 40, 20, 0.8) 0%, rgba(0, 15, 10, 0.9) 100%)',
        boxShadow: '0 0 20px rgba(0, 255, 100, 0.2), inset 0 0 30px rgba(0, 0, 0, 0.5)',
      }}
    />
  );
};
