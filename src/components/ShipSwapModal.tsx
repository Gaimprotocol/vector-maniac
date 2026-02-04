import React, { useRef, useEffect, useState } from 'react';
import { MEGA_SHIP_STATS, getMegaShipStats, formatStatChange, getStatColor } from '@/game/megaShipStats';
import { getStoredMegaShipId, setStoredMegaShipId, MEGA_SHIPS } from '@/hooks/useMegaShips';
import { drawShipModel } from '@/game/shipModels';

interface ShipSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShipChange: (shipId: string) => void;
}

const MEGA_SHIP_TO_MODEL_MAP: Record<string, string> = {
  'original': 'default',
  'blue_hawk': 'bluehawk',
  'arctic_wolf': 'arctic',
  'delta_prime': 'delta',
  'crimson_hawk': 'crimson',
  'valkyrie_prime': 'valkyrie',
};

export const ShipSwapModal: React.FC<ShipSwapModalProps> = ({ isOpen, onClose, onShipChange }) => {
  const [selectedShip, setSelectedShip] = useState(getStoredMegaShipId());
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  
  const megaShipIds = Object.keys(MEGA_SHIP_STATS);

  // Draw all ship previews
  useEffect(() => {
    if (!isOpen) return;
    
    const time = Date.now();
    
    megaShipIds.forEach(shipId => {
      const canvas = canvasRefs.current[shipId];
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.clearRect(0, 0, 80, 60);
      
      const modelId = MEGA_SHIP_TO_MODEL_MAP[shipId] || shipId;
      ctx.save();
      ctx.translate(40, 30);
      ctx.scale(0.8, 0.8);
      drawShipModel(ctx, modelId, 60, 30, time, 'preview');
      ctx.restore();
    });
  }, [isOpen, megaShipIds]);

  const handleConfirm = () => {
    setStoredMegaShipId(selectedShip);
    onShipChange(selectedShip);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center z-60"
      style={{ background: 'rgba(0, 0, 0, 0.9)' }}
    >
      <div 
        className="w-[95%] max-w-md max-h-[85vh] overflow-y-auto rounded-lg border p-4"
        style={{ 
          background: 'radial-gradient(ellipse at center, #0a1a15 0%, #030a08 100%)',
          borderColor: 'rgba(0, 255, 136, 0.4)',
          boxShadow: '0 0 40px rgba(0, 255, 136, 0.2)',
        }}
      >
        {/* Header */}
        <h2 
          className="text-lg mb-3 text-center tracking-widest"
          style={{ 
            fontFamily: 'Orbitron, monospace',
            color: '#00ff88',
            textShadow: '0 0 15px #00ff88',
          }}
        >
          ⚡ SWITCH SHIP
        </h2>
        
        {/* Ship Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {megaShipIds.map(shipId => {
            const stats = getMegaShipStats(shipId);
            const isSelected = selectedShip === shipId;
            const megaShip = MEGA_SHIPS.find(s => s.id === shipId);
            
            return (
              <button
                key={shipId}
                onClick={() => setSelectedShip(shipId)}
                className="rounded-lg border p-2 transition-all duration-200 text-left"
                style={{
                  borderColor: isSelected ? '#00ff88' : 'rgba(0, 255, 136, 0.2)',
                  background: isSelected ? 'rgba(0, 255, 136, 0.1)' : 'rgba(0, 0, 0, 0.3)',
                  boxShadow: isSelected ? '0 0 20px rgba(0, 255, 136, 0.3)' : 'none',
                }}
              >
                {/* Ship Preview */}
                <div className="flex items-center gap-2 mb-1">
                  <canvas
                    ref={el => canvasRefs.current[shipId] = el}
                    width={80}
                    height={60}
                    className="rounded"
                    style={{ background: 'rgba(0, 10, 20, 0.5)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div 
                      className="text-[10px] font-bold truncate"
                      style={{ fontFamily: 'Orbitron, monospace', color: '#00ff88' }}
                    >
                      {megaShip?.name || stats.name}
                    </div>
                    <div 
                      className="text-[8px] opacity-70"
                      style={{ fontFamily: 'monospace', color: '#88ffaa' }}
                    >
                      {stats.projectileType.toUpperCase()}
                    </div>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-1 text-[7px]" style={{ fontFamily: 'monospace' }}>
                  <div className="flex justify-between">
                    <span style={{ color: '#888' }}>DMG</span>
                    <span style={{ color: getStatColor(stats.damage) }}>{formatStatChange(stats.damage)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#888' }}>SPD</span>
                    <span style={{ color: getStatColor(stats.speed) }}>{formatStatChange(stats.speed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#888' }}>DEF</span>
                    <span style={{ color: getStatColor(stats.defense) }}>{formatStatChange(stats.defense)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Selected Ship Details */}
        {selectedShip && (
          <div 
            className="rounded-lg border p-3 mb-3"
            style={{ 
              borderColor: 'rgba(0, 255, 136, 0.3)',
              background: 'rgba(0, 20, 15, 0.5)',
            }}
          >
            <div 
              className="text-xs mb-2"
              style={{ fontFamily: 'Orbitron, monospace', color: '#00ff88' }}
            >
              {getMegaShipStats(selectedShip).name}
            </div>
            <div 
              className="text-[9px] mb-2 opacity-80"
              style={{ color: '#88ffaa' }}
            >
              {getMegaShipStats(selectedShip).specialAbility}
            </div>
            
            {/* Detailed Stats */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[8px]" style={{ fontFamily: 'monospace' }}>
              {[
                { label: 'Damage', value: getMegaShipStats(selectedShip).damage },
                { label: 'Fire Rate', value: getMegaShipStats(selectedShip).fireRate },
                { label: 'Speed', value: getMegaShipStats(selectedShip).speed },
                { label: 'Defense', value: getMegaShipStats(selectedShip).defense },
                { label: 'Health', value: getMegaShipStats(selectedShip).maxHealth },
                { label: 'Bomb Power', value: getMegaShipStats(selectedShip).bombDamage },
              ].map(stat => (
                <div key={stat.label} className="flex justify-between">
                  <span style={{ color: '#888' }}>{stat.label}</span>
                  <span style={{ color: getStatColor(stat.value) }}>{formatStatChange(stat.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded border text-xs uppercase tracking-wider transition-all active:scale-95"
            style={{
              fontFamily: 'Orbitron, monospace',
              color: '#ff6666',
              borderColor: 'rgba(255, 100, 100, 0.4)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2 rounded border text-xs uppercase tracking-wider transition-all active:scale-95"
            style={{
              fontFamily: 'Orbitron, monospace',
              color: '#00ff88',
              borderColor: 'rgba(0, 255, 136, 0.5)',
              background: 'rgba(0, 255, 136, 0.1)',
              boxShadow: '0 0 15px rgba(0, 255, 136, 0.2)',
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
