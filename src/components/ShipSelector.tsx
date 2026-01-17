import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SHIP_MODELS, drawShipModel, getActiveShipModelId, setActiveShipModelId, ShipModel } from '@/game/shipModels';

export const ShipSelector: React.FC = () => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(getActiveShipModelId());
  const [previewId, setPreviewId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

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

      // Draw ship
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(2.5, 2.5);
      drawShipModel(ctx, previewId || activeId, 60, 30, time);
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

  return (
    <div className="min-h-screen flex flex-col items-center py-6 px-4" style={{ background: 'radial-gradient(ellipse at center, #0a1628 0%, #050810 70%, #020305 100%)' }}>
      <div className="w-full max-w-lg">
        <button onClick={() => navigate('/')} className="font-pixel text-[10px] text-cyan-400/70 hover:text-cyan-400 mb-4">
          ← TILLBAKA
        </button>

        <h1 className="font-pixel text-xl text-center mb-2 text-purple-400" style={{ textShadow: '0 0 20px #aa00ff' }}>
          VÄLJ MODERSKEPP
        </h1>
        <p className="font-pixel text-[8px] text-gray-500 text-center mb-4">40 UNIKA MODELLER</p>

        {/* Preview */}
        <div className="relative mb-4 rounded-lg overflow-hidden border-2 border-purple-500/30" style={{ background: 'linear-gradient(135deg, #0a0a20 0%, #050510 100%)' }}>
          <canvas ref={canvasRef} width={400} height={200} className="w-full" />
          <div className="absolute bottom-2 left-2 right-2 text-center">
            <p className="font-pixel text-sm text-cyan-400">{displayModel.name}</p>
            <p className="font-pixel text-[8px] text-gray-400">{displayModel.description}</p>
          </div>
        </div>

        {/* Ship grid */}
        <div className="grid grid-cols-4 gap-2 max-h-[45vh] overflow-y-auto pr-1">
          {SHIP_MODELS.map((model) => (
            <ShipCard
              key={model.id}
              model={model}
              isActive={activeId === model.id}
              isPreview={previewId === model.id}
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
  onPreview: () => void;
  onSelect: () => void;
}> = ({ model, isActive, isPreview, onPreview, onSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(0.8, 0.8);
    drawShipModel(ctx, model.id, 60, 30, Date.now());
    ctx.restore();
  }, [model.id]);

  return (
    <button
      onMouseEnter={onPreview}
      onClick={onSelect}
      className={`relative rounded-lg border-2 p-1 transition-all ${
        isActive ? 'border-green-400 bg-green-900/20' : isPreview ? 'border-cyan-400 bg-cyan-900/10' : 'border-gray-700/50 hover:border-gray-500'
      }`}
    >
      <canvas ref={canvasRef} width={80} height={50} className="w-full rounded" />
      <p className={`font-pixel text-[6px] mt-1 truncate ${isActive ? 'text-green-400' : 'text-gray-400'}`}>
        {model.name}
      </p>
      {isActive && <span className="absolute top-1 right-1 text-[8px]">✓</span>}
    </button>
  );
};
