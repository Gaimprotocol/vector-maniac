import React, { useRef, useEffect } from 'react';
import { getComputedStats, getStoredUpgrades } from '@/hooks/useShipUpgrades';

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
      
      const stats = getComputedStats();
      const upgrades = getStoredUpgrades();
      const centerX = width / 2;
      const centerY = height / 2;

      // Ship base size scales with hull armor
      const hullLevel = upgrades['hull_armor'] || 0;
      const baseSize = 20 + hullLevel * 2;

      // Draw shield aura if shields are upgraded
      if (stats.bonusShields > 0) {
        const pulse = Math.sin(time * 3) * 0.2 + 0.6;
        ctx.save();
        ctx.globalAlpha = pulse * 0.3;
        const gradient = ctx.createRadialGradient(centerX, centerY, baseSize, centerX, centerY, baseSize + 15 + stats.bonusShields * 3);
        gradient.addColorStop(0, 'rgba(0, 170, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 170, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseSize + 15 + stats.bonusShields * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw armor plates for high hull levels
      if (hullLevel >= 3) {
        ctx.save();
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.4)';
        ctx.lineWidth = 1.5;
        const plateCount = Math.min(hullLevel, 6);
        for (let i = 0; i < plateCount; i++) {
          const angle = (i / plateCount) * Math.PI * 2 + time * 0.5;
          const dist = baseSize + 4;
          ctx.beginPath();
          ctx.arc(
            centerX + Math.cos(angle) * dist * 0.4,
            centerY + Math.sin(angle) * dist,
            3,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }
        ctx.restore();
      }

      // Draw main ship body (pointing right)
      ctx.save();
      ctx.translate(centerX, centerY);
      
      // Engine glow
      const engineGlow = Math.sin(time * 8) * 0.3 + 0.7;
      ctx.save();
      ctx.globalAlpha = engineGlow;
      ctx.fillStyle = '#00e5ff';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(-baseSize * 0.8, -4);
      ctx.lineTo(-baseSize * 1.2 - Math.random() * 5, 0);
      ctx.lineTo(-baseSize * 0.8, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Ship hull
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 8;
      
      // Main body
      ctx.beginPath();
      ctx.moveTo(baseSize, 0); // Nose
      ctx.lineTo(-baseSize * 0.6, -baseSize * 0.5);
      ctx.lineTo(-baseSize * 0.8, 0);
      ctx.lineTo(-baseSize * 0.6, baseSize * 0.5);
      ctx.closePath();
      ctx.stroke();
      
      // Fill with gradient
      const bodyGradient = ctx.createLinearGradient(-baseSize, 0, baseSize, 0);
      bodyGradient.addColorStop(0, 'rgba(0, 50, 80, 0.8)');
      bodyGradient.addColorStop(1, 'rgba(0, 100, 150, 0.4)');
      ctx.fillStyle = bodyGradient;
      ctx.fill();

      // Cockpit
      ctx.strokeStyle = '#ff00ff';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#ff00ff';
      ctx.beginPath();
      ctx.ellipse(baseSize * 0.2, 0, baseSize * 0.25, baseSize * 0.15, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      // Draw extra cannons
      if (stats.extraCannons > 0) {
        ctx.save();
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#ff6600';
        ctx.shadowBlur = 6;

        for (let i = 0; i < Math.min(stats.extraCannons, 4); i++) {
          const yOffset = (i % 2 === 0 ? -1 : 1) * (10 + Math.floor(i / 2) * 8);
          const xOffset = -6 - Math.floor(i / 2) * 4;

          // Cannon barrel
          ctx.beginPath();
          ctx.moveTo(centerX + xOffset, centerY + yOffset);
          ctx.lineTo(centerX + xOffset + 22, centerY + yOffset);
          ctx.stroke();

          // Cannon mount
          ctx.fillStyle = '#446688';
          ctx.shadowBlur = 0;
          ctx.fillRect(centerX + xOffset - 3, centerY + yOffset - 3, 8, 6);
          ctx.shadowBlur = 6;

          // Muzzle flash effect
          const flash = Math.sin(time * 10 + i) * 0.5 + 0.5;
          if (flash > 0.7) {
            ctx.globalAlpha = (flash - 0.7) * 3;
            ctx.fillStyle = '#ffaa00';
            ctx.beginPath();
            ctx.arc(centerX + xOffset + 24, centerY + yOffset, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        }
        ctx.restore();
      }

      // Draw piercing rounds indicator
      if (stats.bonusPierce > 0) {
        ctx.save();
        ctx.fillStyle = '#ff0066';
        ctx.shadowColor = '#ff0066';
        ctx.shadowBlur = 8;
        for (let i = 0; i < Math.min(stats.bonusPierce, 3); i++) {
          ctx.beginPath();
          ctx.arc(centerX + baseSize + 8 + i * 8, centerY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Draw speed boost trails (thrusters upgrade visual)
      const thrusterLevel = upgrades['thrusters'] || 0;
      if (thrusterLevel > 0) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        for (let i = 0; i < Math.min(thrusterLevel, 4); i++) {
          const trailLength = 10 + i * 3;
          const offset = (i % 2 === 0 ? 1 : -1) * (2 + Math.floor(i / 2) * 3);
          const wave = Math.sin(time * 6 + i) * 2;
          
          ctx.strokeStyle = i % 2 === 0 ? '#00ffff' : '#ff00ff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(centerX - baseSize * 0.8, centerY + offset);
          ctx.lineTo(centerX - baseSize * 0.8 - trailLength + wave, centerY + offset);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Stats overlay
      ctx.save();
      ctx.font = '10px Orbitron, sans-serif';
      ctx.fillStyle = '#00e5ff';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 4;
      
      const statsText = [];
      if (stats.damageMultiplier > 1) statsText.push(`DMG +${Math.round((stats.damageMultiplier - 1) * 100)}%`);
      if (stats.fireRateMultiplier > 1) statsText.push(`ROF +${Math.round((stats.fireRateMultiplier - 1) * 100)}%`);
      if (stats.healthMultiplier > 1) statsText.push(`HP +${Math.round((stats.healthMultiplier - 1) * 100)}%`);
      
      statsText.forEach((text, i) => {
        ctx.fillText(text, 8, height - 8 - (statsText.length - 1 - i) * 12);
      });
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
