import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SHIP_MODELS, drawShipModel, getActiveShipModelId, setActiveShipModelId, ShipModel } from '@/game/shipModels';
import { usePurchases } from '@/hooks/usePurchases';
import { setStoredMegaShipId } from '@/hooks/useMegaShips';
import { getArenaShips, ArenaUnlock, ARENA_SHIPS } from '@/hooks/useArenaUnlocks';

// Rarity colors and labels
const RARITY_CONFIG = {
  legendary: { color: '#ffd700', bg: 'linear-gradient(90deg, #ffd700, #ffaa00)', label: '◆ LEGENDARY' },
  epic: { color: '#aa66ff', bg: 'linear-gradient(90deg, #aa66ff, #8844dd)', label: '◈ EPIC' },
  rare: { color: '#00aaff', bg: 'linear-gradient(90deg, #00aaff, #0088dd)', label: '◇ RARE' },
};

export const ShipSelector: React.FC = () => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(getActiveShipModelId());
  const [previewId, setPreviewId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const { hasSecretShip } = usePurchases();
  
  const isOmegaUnlocked = hasSecretShip();
  
  // Get arena-unlocked ships
  const arenaUnlockedShips = getArenaShips();
  
  // All ships except omega_prime (handled separately) and arena-exclusive ships
  const arenaShipIds = ARENA_SHIPS.map(s => s.shipId);
  const standardShips = SHIP_MODELS.filter(model => 
    model.id !== 'omega_prime' && !arenaShipIds.includes(model.id)
  );
  const omegaShip = SHIP_MODELS.find(model => model.id === 'omega_prime');
  
  // Check if an arena ship is unlocked
  const isArenaShipUnlocked = (shipId: string) => 
    arenaUnlockedShips.some(u => u.shipId === shipId);
  
  // Get rarity for arena ship
  const getArenaShipRarity = (shipId: string) => {
    const arenaShip = ARENA_SHIPS.find(s => s.shipId === shipId);
    return arenaShip?.rarity || 'rare';
  };
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

      // Draw ship - Omega Prime is 35% larger (legendary premium)
      const isOmegaPrime = currentShipId === 'omega_prime';
      const baseScale = 2.5;
      const shipScale = isOmegaPrime ? baseScale * 1.35 : baseScale;
      
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(shipScale, shipScale);
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
    // Sync with BOTH storage systems so game renderer uses correct ship
    setActiveShipModelId(id);
    setStoredMegaShipId(id); // This is what the game renderer uses
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
          {isOmegaUnlocked ? SHIP_MODELS.length : SHIP_MODELS.length - 1} AVAILABLE MODELS
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

        {/* Ship grid - standard ships */}
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-2 max-h-[45vh] overflow-y-auto pr-1">
            {standardShips.map((model) => (
              <ShipCard
                key={model.id}
                model={model}
                isActive={activeId === model.id}
                isPreview={previewId === model.id}
                isLegendary={false}
                onPreview={() => setPreviewId(model.id)}
                onSelect={() => handleSelect(model.id)}
              />
            ))}
          </div>
          
          {/* Arena-exclusive ships section */}
          {ARENA_SHIPS.length > 0 && (
            <>
              <h3 
                className="text-[10px] mt-4 mb-2 flex items-center gap-2"
                style={{ 
                  fontFamily: 'Orbitron, monospace',
                  color: '#ff4466',
                  textShadow: '0 0 10px #ff4466'
                }}
              >
                ◆ ARENA EXCLUSIVE
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {ARENA_SHIPS.map((arenaShip) => {
                  const isUnlocked = isArenaShipUnlocked(arenaShip.shipId);
                  const rarity = arenaShip.rarity;
                  const rarityConfig = RARITY_CONFIG[rarity];
                  
                  return (
                    <ArenaShipCard
                      key={arenaShip.shipId}
                      shipId={arenaShip.shipId}
                      name={arenaShip.name}
                      description={arenaShip.desc}
                      isActive={activeId === arenaShip.shipId}
                      isPreview={previewId === arenaShip.shipId}
                      isUnlocked={isUnlocked}
                      rarity={rarity}
                      rarityConfig={rarityConfig}
                      onPreview={() => isUnlocked && setPreviewId(arenaShip.shipId)}
                      onSelect={() => isUnlocked && handleSelect(arenaShip.shipId)}
                    />
                  );
                })}
              </div>
            </>
          )}
          
          {/* Omega Prime - 3x wide card (separate row) */}
          {omegaShip && (
            <OmegaPrimeCard
              model={omegaShip}
              isActive={activeId === 'omega_prime'}
              isPreview={previewId === 'omega_prime'}
              isUnlocked={isOmegaUnlocked}
              onPreview={() => setPreviewId('omega_prime')}
              onSelect={() => handleSelect('omega_prime')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Omega Prime Premium Card - 3x width with locked state
const OmegaPrimeCard: React.FC<{
  model: ShipModel;
  isActive: boolean;
  isPreview: boolean;
  isUnlocked: boolean;
  onPreview: () => void;
  onSelect: () => void;
}> = ({ model, isActive, isPreview, isUnlocked, onPreview, onSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark background with gold accents
    const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    bgGrad.addColorStop(0, '#0a0a12');
    bgGrad.addColorStop(0.5, '#1a1a2e');
    bgGrad.addColorStop(1, '#0a0a12');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Gold radial glow
    const glow = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 10, canvas.width / 2, canvas.height / 2, 120);
    glow.addColorStop(0, 'rgba(255, 215, 0, 0.15)');
    glow.addColorStop(0.6, 'rgba(255, 170, 0, 0.05)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (isUnlocked) {
      // Show the actual ship - 35% larger (legendary)
      const baseScale = 1.2;
      const shipScale = baseScale * 1.35;
      
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(shipScale, shipScale);
      drawShipModel(ctx, 'omega_prime', 60, 30, Date.now());
      ctx.restore();
    } else {
      // Show locked silhouette
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      // Draw ship silhouette (blurred/hidden)
      ctx.globalAlpha = 0.15;
      ctx.filter = 'blur(8px)';
      ctx.scale(1.2 * 1.35, 1.2 * 1.35);
      drawShipModel(ctx, 'omega_prime', 60, 30, Date.now());
      ctx.restore();
      
      // Lock icon
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.fillStyle = '#ffd700';
      ctx.globalAlpha = 0.8;
      ctx.font = '48px Orbitron';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔒', 0, 0);
      ctx.restore();
    }
  }, [isUnlocked]);

  return (
    <button
      onMouseEnter={isUnlocked ? onPreview : undefined}
      onClick={isUnlocked ? onSelect : undefined}
      disabled={!isUnlocked}
      className="relative rounded-lg border-2 p-2 transition-all"
      style={{
        borderColor: isActive ? '#ffd700' : isPreview ? '#ffaa00' : '#ffd70060',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a12 100%)',
        boxShadow: isActive || isPreview
          ? '0 0 20px rgba(255, 215, 0, 0.4)'
          : '0 0 10px rgba(255, 215, 0, 0.1)',
        cursor: isUnlocked ? 'pointer' : 'not-allowed',
        opacity: isUnlocked ? 1 : 0.7,
        ...(isUnlocked && (isActive || isPreview) ? { transform: 'scale(1.02)' } : {})
      }}
    >
      {/* Legendary badge */}
      <span 
        className="absolute -top-2 left-4 text-[10px] px-3 py-0.5 rounded-full z-10"
        style={{ 
          fontFamily: 'Orbitron, monospace',
          background: 'linear-gradient(90deg, #ffd700, #ffaa00)',
          color: '#000',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}
      >
        ◆ LEGENDARY
      </span>
      
      <canvas ref={canvasRef} width={340} height={80} className="w-full rounded mb-2" />
      
      <div className="text-center">
        <p 
          className="text-sm font-bold mb-1"
          style={{ 
            fontFamily: 'Orbitron, monospace',
            color: '#ffd700',
            textShadow: '0 0 15px #ffd700',
            letterSpacing: '0.15em'
          }}
        >
          {isUnlocked ? model.name : '??? LOCKED ???'}
        </p>
        <p 
          className="text-[9px]"
          style={{ 
            fontFamily: 'Rajdhani, sans-serif',
            color: isUnlocked ? '#ffd700aa' : '#ffd70060',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}
        >
          {isUnlocked ? model.description : 'Unlock with Omega Pack'}
        </p>
      </div>
      
      {isActive && isUnlocked && (
        <span 
          className="absolute top-3 right-3 text-[12px]"
          style={{ 
            color: '#ffd700',
            textShadow: '0 0 10px #ffd700'
          }}
        >
          ◆
        </span>
      )}
    </button>
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
    
    // Omega Prime is 35% larger in card view too
    const baseScale = 0.8;
    const cardScale = isLegendary ? baseScale * 1.35 : baseScale;
    
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(cardScale, cardScale);
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

// Arena Ship Card - with locked/unlocked state and rarity badge
const ArenaShipCard: React.FC<{
  shipId: string;
  name: string;
  description: string;
  isActive: boolean;
  isPreview: boolean;
  isUnlocked: boolean;
  rarity: 'rare' | 'epic' | 'legendary';
  rarityConfig: { color: string; bg: string; label: string };
  onPreview: () => void;
  onSelect: () => void;
}> = ({ shipId, name, description, isActive, isPreview, isUnlocked, rarity, rarityConfig, onPreview, onSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark arena-themed background
    const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGrad.addColorStop(0, '#1a0a0a');
    bgGrad.addColorStop(1, '#0a0505');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Rarity glow
    const glow = ctx.createRadialGradient(40, 25, 5, 40, 25, 40);
    glow.addColorStop(0, `${rarityConfig.color}20`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (isUnlocked) {
      // Draw actual ship
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(0.8, 0.8);
      drawShipModel(ctx, shipId, 60, 30, Date.now());
      ctx.restore();
    } else {
      // Draw silhouette with lock
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.globalAlpha = 0.15;
      ctx.filter = 'blur(4px)';
      ctx.scale(0.8, 0.8);
      drawShipModel(ctx, 'default', 60, 30, Date.now());
      ctx.restore();
      
      // Lock icon
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.fillStyle = rarityConfig.color;
      ctx.globalAlpha = 0.8;
      ctx.font = 'bold 16px Orbitron';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔒', 0, 0);
      ctx.restore();
    }
  }, [shipId, isUnlocked, rarityConfig]);

  return (
    <button
      onMouseEnter={isUnlocked ? onPreview : undefined}
      onClick={isUnlocked ? onSelect : undefined}
      disabled={!isUnlocked}
      className="relative rounded-lg border-2 p-1 transition-all"
      style={{
        borderColor: isActive ? rarityConfig.color : isPreview ? rarityConfig.color : `${rarityConfig.color}40`,
        background: isActive || isPreview ? `${rarityConfig.color}15` : 'rgba(26, 10, 10, 0.5)',
        boxShadow: isActive || isPreview ? `0 0 15px ${rarityConfig.color}40` : 'none',
        cursor: isUnlocked ? 'pointer' : 'not-allowed',
        opacity: isUnlocked ? 1 : 0.7,
        ...(isUnlocked && (isActive || isPreview) ? { transform: 'scale(1.05)' } : {})
      }}
    >
      {/* Rarity badge */}
      <span 
        className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[5px] px-1.5 py-0.5 rounded-full z-10 whitespace-nowrap"
        style={{ 
          fontFamily: 'Orbitron, monospace',
          background: rarityConfig.bg,
          color: '#000',
          fontWeight: 'bold',
        }}
      >
        {rarity.toUpperCase()}
      </span>
      
      <canvas ref={canvasRef} width={80} height={50} className="w-full rounded" />
      
      <p 
        className="text-[6px] mt-1 truncate"
        style={{ 
          fontFamily: 'Orbitron, monospace',
          color: isUnlocked ? rarityConfig.color : `${rarityConfig.color}60`,
        }}
      >
        {isUnlocked ? name : '???'}
      </p>
      
      {isActive && isUnlocked && (
        <span 
          className="absolute top-2 right-1 text-[8px]"
          style={{ color: rarityConfig.color, textShadow: `0 0 5px ${rarityConfig.color}` }}
        >
          ◆
        </span>
      )}
      
      {!isUnlocked && (
        <p 
          className="text-[5px] text-center"
          style={{ fontFamily: 'Rajdhani', color: `${rarityConfig.color}60` }}
        >
          WIN IN ARENA
        </p>
      )}
    </button>
  );
};
