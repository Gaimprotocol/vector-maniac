import React, { useRef, useEffect } from 'react';

type GameIconProps = {
  type: 'enemy' | 'pickup';
  variant: string;
  size?: number;
  className?: string;
};

// Canvas-based icon renderer for game-accurate visuals
export const GameIcon: React.FC<GameIconProps> = ({ type, variant, size = 32, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, size, size);
    const scale = size / 32;
    
    ctx.save();
    ctx.scale(scale, scale);
    
    if (type === 'enemy') {
      switch (variant) {
        case 'turret':
          ctx.fillStyle = '#555560';
          ctx.fillRect(6, 22, 20, 6);
          const domeGrad = ctx.createRadialGradient(16, 16, 0, 16, 16, 10);
          domeGrad.addColorStop(0, '#cc4444');
          domeGrad.addColorStop(1, '#661111');
          ctx.fillStyle = domeGrad;
          ctx.beginPath();
          ctx.arc(16, 18, 10, Math.PI, 0);
          ctx.fill();
          ctx.fillStyle = '#777780';
          ctx.fillRect(16, 8, 14, 5);
          ctx.fillStyle = '#ff6644';
          ctx.beginPath();
          ctx.arc(30, 10.5, 2, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'drone':
          const droneGrad = ctx.createRadialGradient(14, 14, 0, 16, 16, 12);
          droneGrad.addColorStop(0, '#cc88ff');
          droneGrad.addColorStop(1, '#442266');
          ctx.fillStyle = droneGrad;
          ctx.beginPath();
          ctx.moveTo(16, 4);
          ctx.lineTo(28, 16);
          ctx.lineTo(16, 28);
          ctx.lineTo(4, 16);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'rgba(200, 100, 255, 0.5)';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(16, 16, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#220033';
          ctx.beginPath();
          ctx.arc(18, 16, 2, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'bomber':
          const bomberGrad = ctx.createRadialGradient(14, 14, 0, 16, 16, 10);
          bomberGrad.addColorStop(0, '#ffaa44');
          bomberGrad.addColorStop(1, '#884400');
          ctx.fillStyle = bomberGrad;
          ctx.beginPath();
          ctx.ellipse(16, 16, 10, 6, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#995500';
          ctx.fillRect(8, 8, 16, 3);
          ctx.fillRect(8, 21, 16, 3);
          ctx.fillStyle = '#ff6644';
          ctx.beginPath();
          ctx.arc(6, 16, 2, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'sniper':
          ctx.fillStyle = '#666670';
          ctx.fillRect(8, 24, 16, 4);
          const sniperDome = ctx.createRadialGradient(14, 20, 0, 16, 22, 6);
          sniperDome.addColorStop(0, '#aaffaa');
          sniperDome.addColorStop(1, '#228822');
          ctx.fillStyle = sniperDome;
          ctx.beginPath();
          ctx.arc(16, 22, 6, Math.PI, 0);
          ctx.fill();
          ctx.fillStyle = '#777780';
          ctx.fillRect(16, 10, 14, 4);
          ctx.fillStyle = '#00ff00';
          ctx.beginPath();
          ctx.arc(28, 12, 2, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'tank':
          const tankGrad = ctx.createLinearGradient(4, 10, 28, 26);
          tankGrad.addColorStop(0, '#4a5a4a');
          tankGrad.addColorStop(0.5, '#5a6a5a');
          tankGrad.addColorStop(1, '#3a4a3a');
          ctx.fillStyle = tankGrad;
          ctx.fillRect(4, 14, 24, 12);
          ctx.fillStyle = '#777780';
          ctx.fillRect(14, 6, 16, 4);
          ctx.fillStyle = '#333340';
          ctx.beginPath();
          ctx.arc(8, 26, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(24, 26, 4, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'leech':
          const leechGrad = ctx.createRadialGradient(16, 14, 0, 16, 16, 10);
          leechGrad.addColorStop(0, '#00ff88');
          leechGrad.addColorStop(1, '#004422');
          ctx.fillStyle = leechGrad;
          ctx.beginPath();
          ctx.ellipse(16, 14, 10, 6, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#00ff88';
          ctx.lineWidth = 2;
          for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(8 + i * 5, 20);
            ctx.lineTo(8 + i * 5, 28);
            ctx.stroke();
          }
          break;
          
        case 'hostilePerson':
          ctx.shadowColor = '#ff0000';
          ctx.shadowBlur = 4;
          ctx.fillStyle = '#cc2222';
          ctx.beginPath();
          ctx.arc(16, 8, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(13, 12, 6, 8);
          ctx.strokeStyle = '#cc2222';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(13, 14);
          ctx.lineTo(6, 12);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(14, 20);
          ctx.lineTo(12, 28);
          ctx.moveTo(18, 20);
          ctx.lineTo(20, 28);
          ctx.stroke();
          break;
      }
    } else if (type === 'pickup') {
      ctx.shadowBlur = 8;
      
      switch (variant) {
        case 'forceField':
          ctx.shadowColor = '#00aaff';
          const ffGrad = ctx.createRadialGradient(16, 16, 0, 16, 16, 12);
          ffGrad.addColorStop(0, '#ffffff');
          ffGrad.addColorStop(0.3, '#88ddff');
          ffGrad.addColorStop(0.6, '#00aaff');
          ffGrad.addColorStop(1, '#004488');
          ctx.fillStyle = ffGrad;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3 - Math.PI / 6;
            const px = 16 + Math.cos(angle) * 10;
            const py = 16 + Math.sin(angle) * 10;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'rgba(136, 221, 255, 0.8)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(16, 16, 5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(16, 16, 2, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'health':
          ctx.shadowColor = '#ff4488';
          const heartGrad = ctx.createRadialGradient(16, 14, 0, 16, 16, 12);
          heartGrad.addColorStop(0, '#ffaacc');
          heartGrad.addColorStop(0.5, '#ff4488');
          heartGrad.addColorStop(1, '#aa1144');
          ctx.fillStyle = heartGrad;
          ctx.beginPath();
          ctx.moveTo(16, 10);
          ctx.bezierCurveTo(16, 6, 6, 4, 6, 14);
          ctx.bezierCurveTo(6, 20, 16, 26, 16, 28);
          ctx.bezierCurveTo(16, 26, 26, 20, 26, 14);
          ctx.bezierCurveTo(26, 4, 16, 6, 16, 10);
          ctx.fill();
          break;
          
        case 'homingMissile':
          ctx.shadowColor = '#ff8800';
          const missileGrad = ctx.createLinearGradient(4, 16, 28, 16);
          missileGrad.addColorStop(0, '#ffaa44');
          missileGrad.addColorStop(0.5, '#ff8800');
          missileGrad.addColorStop(1, '#cc4400');
          ctx.fillStyle = missileGrad;
          ctx.beginPath();
          ctx.moveTo(28, 16);
          ctx.lineTo(10, 10);
          ctx.lineTo(4, 16);
          ctx.lineTo(10, 22);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#ffcc00';
          ctx.beginPath();
          ctx.moveTo(10, 10);
          ctx.lineTo(6, 4);
          ctx.lineTo(6, 10);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(10, 22);
          ctx.lineTo(6, 28);
          ctx.lineTo(6, 22);
          ctx.closePath();
          ctx.fill();
          break;
          
        case 'shield':
          ctx.shadowColor = '#00ccff';
          const shieldGrad = ctx.createRadialGradient(16, 16, 0, 16, 16, 12);
          shieldGrad.addColorStop(0, '#88ffff');
          shieldGrad.addColorStop(0.5, '#00ccff');
          shieldGrad.addColorStop(1, '#0066aa');
          ctx.fillStyle = shieldGrad;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
            const px = 16 + Math.cos(angle) * 10;
            const py = 16 + Math.sin(angle) * 10;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#ffffff88';
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
            const px = 16 + Math.cos(angle) * 6;
            const py = 16 + Math.sin(angle) * 6;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
          break;
          
        case 'megaBomb':
          ctx.shadowColor = '#ffff00';
          const bombGrad = ctx.createRadialGradient(16, 16, 0, 16, 16, 12);
          bombGrad.addColorStop(0, '#ffffff');
          bombGrad.addColorStop(0.3, '#ffff00');
          bombGrad.addColorStop(0.7, '#ff8800');
          bombGrad.addColorStop(1, '#ff4400');
          ctx.fillStyle = bombGrad;
          ctx.beginPath();
          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const len = i % 2 === 0 ? 12 : 6;
            const px = 16 + Math.cos(angle) * len;
            const py = 16 + Math.sin(angle) * len;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          break;
          
        case 'tripleShot':
          ctx.shadowColor = '#ff00ff';
          ctx.fillStyle = '#ff00ff';
          ctx.beginPath();
          ctx.arc(16, 8, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(8, 20, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(24, 20, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ff88ff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(16, 12);
          ctx.lineTo(8, 16);
          ctx.moveTo(16, 12);
          ctx.lineTo(24, 16);
          ctx.stroke();
          break;
          
        case 'electricPulse':
          ctx.shadowColor = '#00ffff';
          ctx.strokeStyle = '#00ffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(16, 4);
          ctx.lineTo(12, 12);
          ctx.lineTo(20, 16);
          ctx.lineTo(10, 24);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(16, 4);
          ctx.lineTo(20, 12);
          ctx.lineTo(12, 16);
          ctx.lineTo(22, 24);
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(16, 14, 3, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'escort':
          ctx.shadowColor = '#88ff00';
          ctx.fillStyle = '#88ff00';
          ctx.beginPath();
          ctx.moveTo(10, 8);
          ctx.lineTo(4, 14);
          ctx.lineTo(10, 12);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(22, 8);
          ctx.lineTo(28, 14);
          ctx.lineTo(22, 12);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#88ff0088';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(22, 22);
          ctx.lineTo(10, 18);
          ctx.lineTo(10, 26);
          ctx.closePath();
          ctx.stroke();
          break;
      }
    }
    
    ctx.restore();
  }, [type, variant, size]);
  
  return <canvas ref={canvasRef} width={size} height={size} className={`inline-block ${className}`} />;
};
