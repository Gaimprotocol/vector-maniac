import React, { useMemo } from 'react';
import { VectorUpgrade, VECTOR_UPGRADES } from '@/game/vectorManiac/types';

interface UpgradePickModalProps {
  onSelectUpgrade: (upgradeId: string) => void;
  picksRemaining: number;
  totalPicks: number;
  currentUpgrades: Record<string, number>;
}

export const UpgradePickModal: React.FC<UpgradePickModalProps> = ({
  onSelectUpgrade,
  picksRemaining,
  totalPicks,
  currentUpgrades
}) => {
  // Generate 3 random unique upgrades
  const availableUpgrades = useMemo(() => {
    const shuffled = [...VECTOR_UPGRADES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [picksRemaining]); // Re-roll when picks change

  const getUpgradeLevel = (upgradeId: string) => currentUpgrades[upgradeId] || 0;

  return (
    <div 
      className="absolute inset-0 flex flex-col items-center justify-center z-50"
      style={{ 
        background: 'radial-gradient(ellipse at center, rgba(0, 8, 20, 0.97) 0%, rgba(0, 0, 0, 0.99) 100%)'
      }}
    >
      {/* Scanline overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'
        }}
      />
      
      {/* Outer glow frame */}
      <div 
        className="relative flex flex-col items-center p-6 w-[90%] max-w-[340px]"
        style={{
          border: '2px solid rgba(0, 255, 100, 0.6)',
          background: 'linear-gradient(180deg, rgba(0, 40, 20, 0.3) 0%, rgba(0, 20, 10, 0.5) 100%)',
          boxShadow: '0 0 30px rgba(0, 255, 100, 0.2), inset 0 0 20px rgba(0, 255, 100, 0.05)'
        }}
      >
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
        
        {/* Title */}
        <h2 
          className="font-mono text-lg font-bold tracking-widest text-center mb-1"
          style={{ 
            color: '#00ff66',
            textShadow: '0 0 10px #00ff66, 0 0 20px #00ff66, 0 0 30px #00aa44'
          }}
        >
          ▸ UPGRADE ◂
        </h2>
        
        <p 
          className="font-mono text-xs text-center mb-4 tracking-wide"
          style={{ color: '#00ccff', textShadow: '0 0 8px #00ccff' }}
        >
          SELECT 1 OF {availableUpgrades.length}
        </p>
        
        <div className="flex flex-col gap-3 w-full">
          {availableUpgrades.map((upgrade, index) => {
            const level = getUpgradeLevel(upgrade.id);
            const maxed = upgrade.maxStack && level >= upgrade.maxStack;
            
            return (
              <button
                key={upgrade.id}
                disabled={maxed}
                className={`relative flex items-start p-3 text-left transition-all duration-150 ${
                  maxed ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
                }`}
                style={{ 
                  background: maxed 
                    ? 'rgba(30, 30, 30, 0.4)' 
                    : 'linear-gradient(90deg, rgba(0, 255, 100, 0.08) 0%, rgba(0, 200, 255, 0.05) 100%)',
                  border: maxed 
                    ? '1px solid rgba(100, 100, 100, 0.3)' 
                    : '1px solid rgba(0, 255, 100, 0.5)',
                  boxShadow: maxed 
                    ? 'none' 
                    : '0 0 15px rgba(0, 255, 100, 0.15), inset 0 0 10px rgba(0, 255, 100, 0.03)'
                }}
                onClick={() => !maxed && onSelectUpgrade(upgrade.id)}
                onTouchEnd={(e) => { e.preventDefault(); !maxed && onSelectUpgrade(upgrade.id); }}
              >
                {/* Number indicator */}
                <span 
                  className="font-mono text-xs mr-2 mt-1"
                  style={{ color: maxed ? '#444' : '#00ccff', textShadow: maxed ? 'none' : '0 0 6px #00ccff' }}
                >
                  [{index + 1}]
                </span>
                
                {/* Icon */}
                <span 
                  className="text-xl mr-3"
                  style={{ 
                    filter: maxed ? 'grayscale(1)' : 'drop-shadow(0 0 4px rgba(0, 255, 100, 0.5))'
                  }}
                >
                  {upgrade.icon}
                </span>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span 
                      className="font-mono text-sm font-bold tracking-wide truncate"
                      style={{ 
                        color: maxed ? '#666' : '#00ff66',
                        textShadow: maxed ? 'none' : '0 0 8px rgba(0, 255, 100, 0.5)'
                      }}
                    >
                      {upgrade.name.toUpperCase()}
                    </span>
                    {level > 0 && (
                      <span 
                        className="font-mono text-[10px] whitespace-nowrap"
                        style={{ color: '#ffcc00', textShadow: '0 0 6px #ffcc00' }}
                      >
                        LV.{level}{upgrade.maxStack ? `/${upgrade.maxStack}` : ''}
                      </span>
                    )}
                  </div>
                  <span 
                    className="font-mono text-[10px] block mt-1 leading-tight"
                    style={{ color: maxed ? '#555' : '#88ccaa' }}
                  >
                    {upgrade.description}
                  </span>
                  {maxed && (
                    <span 
                      className="font-mono text-[9px] block mt-1 font-bold"
                      style={{ color: '#ff4444', textShadow: '0 0 6px #ff4444' }}
                    >
                      ▸ MAXED ◂
                    </span>
                  )}
                </div>
                
                {/* Selection indicator arrow */}
                {!maxed && (
                  <span 
                    className="font-mono text-sm ml-2 self-center"
                    style={{ color: '#00ff66', textShadow: '0 0 8px #00ff66' }}
                  >
                    ▶
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Bottom decoration */}
        <div 
          className="w-full h-[1px] mt-4"
          style={{ 
            background: 'linear-gradient(90deg, transparent, rgba(0, 255, 100, 0.5), transparent)'
          }}
        />
        <p 
          className="font-mono text-[9px] mt-2 tracking-widest"
          style={{ color: '#446655' }}
        >
          TAP TO SELECT
        </p>
      </div>
    </div>
  );
};
