import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SHIP_MODELS, drawShipModel, getActiveShipModelId, setActiveShipModelId, ShipModel } from '@/game/shipModels';
import { usePurchases } from '@/hooks/usePurchases';

export const ShipSelector: React.FC = () => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(getActiveShipModelId());
  const [previewId, setPreviewId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const { hasSecretShip } = usePurchases();

  // Filter ships - omega_prime only visible if owned
  const availableShips = SHIP_MODELS.filter(model => {
    if (model.id === 'omega_prime') {
      return hasSecretShip();
    }
    return true;
  });

  // Draw preview ship
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    const draw = () => {
      if (!running) return;
      const time = Date.now();
      ctx.fillStyle = '#0a0a15';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 30; i++) {
        const x = (i * 137 + time * 0.01) % canvas.width;
        const y = (i * 89) % canvas.height;
        ctx.globalAlpha = 0.3 + Math.sin(time * 0.003 + i) * 0.2;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Special background for omega_prime
      const currentShipId = previewId || activeId;
      if (currentShipId === 'omega_prime') {
        // Gold radial glow
        const goldGlow = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 20, canvas.width / 2, canvas.height / 2, 150);
        goldGlow.addColorStop(0, 'rgba(255, 215, 0, 0.15)');
        goldGlow.addColorStop(0.5, 'rgba(255, 170, 0, 0.05)');
        goldGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = goldGlow;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw ship
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(2.5, 2.5);
      drawShipModel(ctx, currentShipId, 60, 30, time);
      ctx.restore();

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [activeId, previewId]);

  const handleSelect = (id: string) => {
    setActiveShipModelId(id);
    setActiveId(id);
    setPreviewId(null);
  };

  const displayModel = SHIP_MODELS.find(m => m.id === (previewId || activeId)) || SHIP_MODELS[0];
  const isOmegaPrime = displayModel.id === 'omega_prime';

  return (
    <div 
      className="min-h-screen flex flex-col items-center py-6 px-4" 
      style={{ background: 'radial-gradient(ellipse at center, #051510 0%, #020a08 70%, #010504 100%)' }}
    >
      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              background: '#00ff88',
              opacity: Math.random() * 0.4 + 0.1,
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: `-${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-lg relative z-10">
        <button 
          onClick={() => navigate('/')} 
          className="text-[11px] tracking-wider text-[#00ff88]/60 hover:text-[#00ff88] mb-4 flex items-center gap-2 transition-colors"
          style={{ fontFamily: 'Orbitron, monospace' }}
        >
          ◂ BACK TO MENU
        </button>

        <h1 
          className="text-xl text-center mb-2"
          style={{ 
            fontFamily: 'Orbitron, monospace',
            color: '#00ff88',
            textShadow: '0 0 20px #00ff88, 0 0 40px #00ff8850'
          }}
        >
          SELECT SHIP
        </h1>
        <p 
          className="text-[9px] text-[#00ff88]/50 text-center mb-4 uppercase tracking-[0.3em]"
          style={{ fontFamily: 'Orbitron, monospace' }}
        >
          {availableShips.length} AVAILABLE MODELS
        </p>

        {/* Preview */}
        <div 
          className="relative mb-4 rounded-lg overflow-hidden border-2"
          style={{ 
            borderColor: isOmegaPrime ? '#ffd700' : '#00ff88',
            background: isOmegaPrime 
              ? 'linear-gradient(135deg, #1a1a2e 0%, #0a0a12 100%)' 
              : 'linear-gradient(135deg, #051510 0%, #020a08 100%)',
            boxShadow: isOmegaPrime 
              ? '0 0 30px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(255, 215, 0, 0.05)'
              : '0 0 20px rgba(0, 255, 136, 0.2)'
          }}
        >
          <canvas ref={canvasRef} width={400} height={200} className="w-full" />
          <div className="absolute bottom-2 left-2 right-2 text-center">
            {isOmegaPrime && (
              <span 
                className="text-[8px] px-2 py-0.5 rounded mb-1 inline-block"
                style={{ 
                  fontFamily: 'Orbitron, monospace',
                  background: 'linear-gradient(90deg, #ffd700, #ffaa00)',
                  color: '#000',
                  textShadow: 'none'
                }}
              >
                ◆ LEGENDARY
              </span>
            )}
            <p 
              className="text-sm"
              style={{ 
                fontFamily: 'Orbitron, monospace',
                color: isOmegaPrime ? '#ffd700' : '#00ff88',
                textShadow: isOmegaPrime ? '0 0 15px #ffd700' : '0 0 10px #00ff88'
              }}
            >
              {displayModel.name}
            </p>
            <p 
              className="text-[8px] text-[#00ff88]/60"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              {displayModel.description}
            </p>
          </div>
        </div>

        {/* Ship grid */}
        <div className="grid grid-cols-4 gap-2 max-h-[45vh] overflow-y-auto pr-1">
          {availableShips.map((model) => (
            <ShipCard
              key={model.id}
              model={model}
              isActive={activeId === model.id}
              isPreview={previewId === model.id}
              isLegendary={model.id === 'omega_prime'}
              onPreview={() => setPreviewId(model.id)}
              onSelect={() => handleSelect(model.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const ShipCard: React.FC<{
  model: ShipModel;
  isActive: boolean;
  isPreview: boolean;
  isLegendary: boolean;
  onPreview: () => void;
  onSelect: () => void;
}> = ({ model, isActive, isPreview, isLegendary, onPreview, onSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = isLegendary ? '#0a0a12' : '#051510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Gold glow for legendary
    if (isLegendary) {
      const glow = ctx.createRadialGradient(40, 25, 5, 40, 25, 40);
      glow.addColorStop(0, 'rgba(255, 215, 0, 0.1)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(0.8, 0.8);
    drawShipModel(ctx, model.id, 60, 30, Date.now());
    ctx.restore();
  }, [model.id, isLegendary]);

  const getBorderColor = () => {
    if (isLegendary) return isActive ? '#ffd700' : isPreview ? '#ffaa00' : '#ffd70060';
    if (isActive) return '#00ff88';
    if (isPreview) return '#00ffaa';
    return 'rgba(0, 255, 136, 0.2)';
  };

  return (
    <button
      onMouseEnter={onPreview}
      onClick={onSelect}
      className="relative rounded-lg border-2 p-1 transition-all hover:scale-105"
      style={{
        borderColor: getBorderColor(),
        background: isLegendary 
          ? 'linear-gradient(135deg, #1a1a2e 0%, #0a0a12 100%)'
          : isActive 
            ? 'rgba(0, 255, 136, 0.1)' 
            : 'rgba(0, 255, 136, 0.02)',
        boxShadow: isLegendary && (isActive || isPreview)
          ? '0 0 15px rgba(255, 215, 0, 0.4)'
          : isActive 
            ? '0 0 10px rgba(0, 255, 136, 0.3)' 
            : 'none'
      }}
    >
      {isLegendary && (
        <span 
          className="absolute -top-1 -right-1 text-[6px] px-1 rounded z-10"
          style={{ 
            fontFamily: 'Orbitron, monospace',
            background: 'linear-gradient(90deg, #ffd700, #ffaa00)',
            color: '#000'
          }}
        >
          ◆
        </span>
      )}
      <canvas ref={canvasRef} width={80} height={50} className="w-full rounded" />
      <p 
        className="text-[6px] mt-1 truncate"
        style={{ 
          fontFamily: 'Orbitron, monospace',
          color: isLegendary ? '#ffd700' : isActive ? '#00ff88' : '#00ff8880'
        }}
      >
        {model.name}
      </p>
      {isActive && !isLegendary && (
        <span 
          className="absolute top-1 right-1 text-[8px] text-[#00ff88]"
          style={{ textShadow: '0 0 5px #00ff88' }}
        >
          ◆
        </span>
      )}
    </button>
  );
};
