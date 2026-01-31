import React from 'react';
import { ArenaConsumable, ConsumableType, CONSUMABLE_DEFINITIONS } from '@/hooks/useArenaConsumables';

interface BoosterSelectionModalProps {
  consumables: ArenaConsumable[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  maxSelections?: number;
}

const RARITY_COLORS: Record<string, string> = {
  common: '#888888',
  rare: '#4488ff',
  epic: '#aa66ff',
  legendary: '#ffd700',
};

const RARITY_GLOW: Record<string, string> = {
  common: 'rgba(136, 136, 136, 0.3)',
  rare: 'rgba(68, 136, 255, 0.4)',
  epic: 'rgba(170, 102, 255, 0.5)',
  legendary: 'rgba(255, 215, 0, 0.6)',
};

export const BoosterSelectionModal: React.FC<BoosterSelectionModalProps> = ({
  consumables,
  selectedIds,
  onToggle,
  onConfirm,
  onCancel,
  maxSelections = 3,
}) => {
  // Group consumables by type for cleaner display
  const grouped = consumables.reduce((acc, c) => {
    if (!acc[c.type]) acc[c.type] = [];
    acc[c.type].push(c);
    return acc;
  }, {} as Record<ConsumableType, ArenaConsumable[]>);
  
  const types = Object.keys(grouped) as ConsumableType[];
  const selectedCount = selectedIds.length;
  
  return (
    <div 
      className="absolute inset-0 flex flex-col items-center justify-center z-50"
      style={{ background: 'rgba(0, 0, 0, 0.95)' }}
    >
      <h2 
        className="text-xl mb-2"
        style={{ 
          fontFamily: 'Orbitron, monospace',
          color: '#00ff88',
          textShadow: '0 0 20px #00ff88',
        }}
      >
        SELECT BOOSTERS
      </h2>
      
      <p 
        className="text-[10px] mb-4"
        style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(255, 255, 255, 0.5)' }}
      >
        Choose up to {maxSelections} boosters (consumed after battle)
      </p>
      
      {consumables.length === 0 ? (
        <div 
          className="text-center mb-6 px-6 py-4 rounded border"
          style={{ 
            fontFamily: 'Rajdhani, sans-serif',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          <p className="text-sm mb-2">No boosters available</p>
          <p className="text-[10px]">Win arena battles to earn consumable boosters!</p>
        </div>
      ) : (
        <div className="w-full max-w-sm px-4 mb-4 max-h-[50vh] overflow-y-auto space-y-2">
          {types.map(type => {
            const items = grouped[type];
            const definition = CONSUMABLE_DEFINITIONS[type];
            const count = items.length;
            const selectedFromType = items.filter(i => selectedIds.includes(i.id)).length;
            const firstItem = items[0];
            
            return (
              <button
                key={type}
                onClick={() => {
                  // Find first unselected item of this type, or toggle off if one is selected
                  const selectedItem = items.find(i => selectedIds.includes(i.id));
                  if (selectedItem) {
                    onToggle(selectedItem.id);
                  } else if (selectedCount < maxSelections) {
                    onToggle(items[0].id);
                  }
                }}
                disabled={selectedFromType === 0 && selectedCount >= maxSelections}
                className={`w-full px-4 py-3 rounded border-2 transition-all duration-200
                           flex items-center justify-between
                           ${selectedFromType > 0 ? 'scale-[1.02]' : ''}
                           ${selectedFromType === 0 && selectedCount >= maxSelections ? 'opacity-40' : ''}`}
                style={{
                  fontFamily: 'Orbitron, monospace',
                  borderColor: selectedFromType > 0 
                    ? RARITY_COLORS[firstItem.rarity] 
                    : `${RARITY_COLORS[firstItem.rarity]}50`,
                  background: selectedFromType > 0 
                    ? RARITY_GLOW[firstItem.rarity] 
                    : 'rgba(0, 0, 0, 0.3)',
                  boxShadow: selectedFromType > 0 
                    ? `0 0 20px ${RARITY_GLOW[firstItem.rarity]}` 
                    : 'none',
                }}
              >
                <div className="flex items-center gap-3">
                  <span 
                    className="text-lg"
                    style={{ color: RARITY_COLORS[firstItem.rarity] }}
                  >
                    {definition.icon}
                  </span>
                  <div className="text-left">
                    <p 
                      className="text-xs"
                      style={{ color: RARITY_COLORS[firstItem.rarity] }}
                    >
                      {definition.name}
                    </p>
                    <p 
                      className="text-[9px]"
                      style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                    >
                      {definition.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-[10px] px-2 py-1 rounded"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    x{count}
                  </span>
                  {selectedFromType > 0 && (
                    <span 
                      className="text-xs"
                      style={{ color: '#00ff88' }}
                    >
                      ✓
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
      
      <p 
        className="text-[10px] mb-4"
        style={{ fontFamily: 'Rajdhani, sans-serif', color: '#facc15' }}
      >
        {selectedCount} / {maxSelections} selected
      </p>
      
      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          className="px-6 py-2 rounded border-2 text-sm transition-all hover:scale-105"
          style={{ 
            fontFamily: 'Orbitron, monospace',
            borderColor: '#00ff88',
            color: '#00ff88',
            background: 'rgba(0, 255, 136, 0.1)',
          }}
        >
          {selectedCount > 0 ? 'USE & FIGHT' : 'FIGHT WITHOUT'}
        </button>
        
        <button
          onClick={onCancel}
          className="px-6 py-2 rounded border text-sm transition-all hover:scale-105"
          style={{ 
            fontFamily: 'Orbitron, monospace',
            borderColor: 'rgba(255, 68, 102, 0.5)',
            color: '#ff4466',
          }}
        >
          CANCEL
        </button>
      </div>
    </div>
  );
};
