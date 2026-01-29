// Anomaly Card - Shows enemy with actions
import React, { useState } from 'react';
import { BestiaryEntry } from '@/hooks/useBestiary';
import { AnomalyShapeRenderer } from './AnomalyShapeRenderer';
import { getBountyValue, getCompanionCost } from '@/hooks/useBestiaryRewards';

interface AnomalyCardProps {
  entry: BestiaryEntry;
  index: number;
  hasBountyCollected: boolean;
  hasCompanion: boolean;
  scraps: number;
  onCollectBounty: (seed: number, value: number) => void;
  onPurchaseCompanion: (entry: BestiaryEntry, cost: number) => void;
}

const BehaviorLabel: React.FC<{ behavior: string }> = ({ behavior }) => {
  const labels: Record<string, string> = {
    chase: 'PURSUER',
    orbit: 'ORBITER',
    zigzag: 'ERRATIC',
    teleport: 'BLINKER',
    spiral: 'SPIRALER',
    strafe: 'STRAFER',
    pounce: 'AMBUSHER',
    mirror: 'MIMIC',
  };
  return <span>{labels[behavior] || behavior.toUpperCase()}</span>;
};

const AbilityLabel: React.FC<{ ability: string }> = ({ ability }) => {
  const labels: Record<string, { name: string; color: string }> = {
    none: { name: 'NONE', color: '#666' },
    shooter: { name: 'SHOOTER', color: '#ff4444' },
    splitter: { name: 'SPLITTER', color: '#44ff44' },
    shield: { name: 'SHIELDED', color: '#4488ff' },
    phaser: { name: 'PHASER', color: '#aa44ff' },
    leech: { name: 'LEECH', color: '#ff44aa' },
  };
  const info = labels[ability] || { name: ability.toUpperCase(), color: '#888' };
  return <span style={{ color: info.color }}>{info.name}</span>;
};

export const AnomalyCard: React.FC<AnomalyCardProps> = ({
  entry,
  index,
  hasBountyCollected,
  hasCompanion,
  scraps,
  onCollectBounty,
  onPurchaseCompanion,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const color = `hsl(${entry.hue}, ${entry.saturation}%, 60%)`;
  const bountyValue = getBountyValue(entry.ability, entry.behavior);
  const companionCost = getCompanionCost(entry.ability, entry.timesDefeated);
  const canAffordCompanion = scraps >= companionCost;
  const canPurchaseCompanion = entry.timesDefeated > 0 && !hasCompanion;
  
  return (
    <div 
      className="rounded-lg border opacity-0 animate-pop-in overflow-hidden"
      style={{ 
        borderColor: `hsl(${entry.hue}, ${entry.saturation}%, 40%)`,
        background: `linear-gradient(135deg, hsl(${entry.hue}, ${entry.saturation}%, 5%) 0%, transparent 100%)`,
        animationDelay: `${200 + index * 50}ms`,
      }}
    >
      {/* Main row */}
      <div 
        className="p-3 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <AnomalyShapeRenderer 
            shape={entry.shape} 
            hue={entry.hue} 
            saturation={entry.saturation}
            size={48}
            hasAura={true}
            hasPulse={false}
          />
          
          <div className="flex-1 min-w-0">
            <h3 className="text-[11px] font-bold truncate" style={{ fontFamily: 'Orbitron, monospace', color }}>
              {entry.name}
            </h3>
            
            <div className="text-[8px] text-[#00ff88]/50 flex flex-wrap gap-x-2 mt-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              <span className="flex items-center gap-1">
                <span className="text-[#00ff88]/30">FORM:</span>
                <span className="text-[#00ff88]/70">{entry.shape.toUpperCase()}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-[#00ff88]/30">PATTERN:</span>
                <span className="text-[#00ff88]/70"><BehaviorLabel behavior={entry.behavior} /></span>
              </span>
            </div>
            
            <div className="text-[8px] flex items-center gap-1 mt-0.5" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              <span className="text-[#00ff88]/30">ABILITY:</span>
              <AbilityLabel ability={entry.ability} />
            </div>
          </div>
          
          <div className="text-right flex flex-col items-end gap-1">
            <div className="text-[8px] text-[#00ff88]/40" style={{ fontFamily: 'Orbitron, monospace' }}>
              <div>MET: {entry.timesEncountered}</div>
              <div className="text-[#ff4444]/60">KIA: {entry.timesDefeated}</div>
            </div>
            
            {/* Status badges */}
            <div className="flex gap-1">
              {hasBountyCollected && (
                <span className="text-[6px] px-1 py-0.5 rounded bg-[#ffaa00]/20 text-[#ffaa00]" style={{ fontFamily: 'Orbitron' }}>
                  CLAIMED
                </span>
              )}
              {hasCompanion && (
                <span className="text-[6px] px-1 py-0.5 rounded bg-[#00ffaa]/20 text-[#00ffaa]" style={{ fontFamily: 'Orbitron' }}>
                  ALLY
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Expanded actions */}
      {isExpanded && (
        <div 
          className="px-3 pb-3 pt-1 border-t flex flex-wrap gap-2"
          style={{ borderColor: `hsl(${entry.hue}, ${entry.saturation}%, 20%)` }}
        >
          {/* Collect Bounty Button */}
          {!hasBountyCollected ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCollectBounty(entry.seed, bountyValue);
              }}
              className="flex-1 min-w-[120px] px-3 py-2 rounded text-[9px] font-bold transition-all duration-300 
                         bg-gradient-to-r from-[#ffaa00]/20 to-[#ff8800]/20 
                         border border-[#ffaa00]/50 text-[#ffaa00]
                         hover:from-[#ffaa00]/30 hover:to-[#ff8800]/30 hover:border-[#ffaa00]
                         active:scale-95"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              <div className="flex items-center justify-center gap-2">
                <span>◈</span>
                <span>COLLECT BOUNTY</span>
                <span className="text-[#fff]">+{bountyValue}</span>
              </div>
            </button>
          ) : (
            <div 
              className="flex-1 min-w-[120px] px-3 py-2 rounded text-[9px] text-center opacity-50
                         bg-[#ffaa00]/10 border border-[#ffaa00]/20 text-[#ffaa00]/50"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              BOUNTY COLLECTED ✓
            </div>
          )}
          
          {/* Purchase Companion Button */}
          {canPurchaseCompanion && !hasCompanion ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (canAffordCompanion) {
                  onPurchaseCompanion(entry, companionCost);
                }
              }}
              disabled={!canAffordCompanion}
              className={`flex-1 min-w-[120px] px-3 py-2 rounded text-[9px] font-bold transition-all duration-300 
                         ${canAffordCompanion 
                           ? 'bg-gradient-to-r from-[#00ffaa]/20 to-[#00aaff]/20 border border-[#00ffaa]/50 text-[#00ffaa] hover:from-[#00ffaa]/30 hover:to-[#00aaff]/30 hover:border-[#00ffaa] active:scale-95'
                           : 'bg-[#333]/20 border border-[#666]/30 text-[#666] cursor-not-allowed'
                         }`}
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              <div className="flex items-center justify-center gap-2">
                <span>⚔</span>
                <span>RECRUIT ALLY</span>
                <span className={canAffordCompanion ? 'text-[#fff]' : 'text-[#ff4444]'}>-{companionCost}</span>
              </div>
            </button>
          ) : hasCompanion ? (
            <div 
              className="flex-1 min-w-[120px] px-3 py-2 rounded text-[9px] text-center
                         bg-[#00ffaa]/10 border border-[#00ffaa]/20 text-[#00ffaa]/50"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              ALLIED ✓
            </div>
          ) : (
            <div 
              className="flex-1 min-w-[120px] px-3 py-2 rounded text-[9px] text-center opacity-50
                         bg-[#666]/10 border border-[#666]/20 text-[#666]/50"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              DEFEAT TO RECRUIT
            </div>
          )}
        </div>
      )}
    </div>
  );
};
