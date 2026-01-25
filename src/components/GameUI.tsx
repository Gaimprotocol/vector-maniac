import React, { useState, useCallback, useEffect } from 'react';
import { GameData } from '@/game/types';
import { PendingReward } from '@/hooks/useRewardedAds';
import { MAPS } from '@/game/maps';
import { GameIcon } from './GameIcon';
interface GameUIProps {
  gameData: GameData;
  activeRewards?: { name: string; icon: string; timeLeft: number }[];
  pendingRewards?: PendingReward[];
  onActivatePendingReward?: (id: string) => void;
}

interface ActivationEffect {
  id: string;
  icon: string;
  name: string;
  x: number;
  y: number;
}

// Theme colors for map name display
const MAP_NAME_COLORS = [
  '#00ffff', // cyan
  '#ff00ff', // magenta
  '#00ff88', // green
  '#ffaa00', // orange
  '#ff6688', // pink
  '#88aaff', // light blue
  '#ffff00', // yellow
];

export const GameUI: React.FC<GameUIProps> = ({ 
  gameData, 
  activeRewards = [], 
  pendingRewards = [],
  onActivatePendingReward 
}) => {
  const { player, score, highScore, rescuedCount, state } = gameData;
  const [activationEffects, setActivationEffects] = useState<ActivationEffect[]>([]);
  const [mapNameVisible, setMapNameVisible] = useState(false);
  const [lastMapId, setLastMapId] = useState<number | null>(null);
  
  // Get current map info
  const currentMap = MAPS.find(m => m.id === gameData.currentMapId) || MAPS[0];
  const mapNameColor = MAP_NAME_COLORS[(gameData.currentMapId - 1) % MAP_NAME_COLORS.length];
  
  // Pop-in animation when map changes
  useEffect(() => {
    if (gameData.currentMapId !== lastMapId && state === 'playing') {
      setMapNameVisible(false);
      const timer = setTimeout(() => {
        setMapNameVisible(true);
        setLastMapId(gameData.currentMapId);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [gameData.currentMapId, lastMapId, state]);
  
  // Handle activation with visual effect
  const handleActivate = useCallback((pending: PendingReward, event: React.MouseEvent) => {
    if (!onActivatePendingReward) return;
    
    // Get button position for effect
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const effect: ActivationEffect = {
      id: `effect_${Date.now()}`,
      icon: pending.icon,
      name: pending.name,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    
    // Add effect
    setActivationEffects(prev => [...prev, effect]);
    
    // Remove effect after animation
    setTimeout(() => {
      setActivationEffects(prev => prev.filter(e => e.id !== effect.id));
    }, 600);
    
    // Activate the reward
    onActivatePendingReward(pending.id);
  }, [onActivatePendingReward]);

  return (
    <div className="absolute inset-0 pointer-events-none p-4 font-pixel text-[10px]">
      {/* Top HUD - Clean layout */}
      <div className="flex justify-between items-start" style={{ marginTop: '19px' }}>
        {/* Left side - Score & Hi-Score */}
        <div className="space-y-1">
          <div className="text-primary neon-text-primary">
            SCORE: {score.toString().padStart(8, '0')}
          </div>
          <div className="text-muted-foreground text-[8px]">
            HI: {highScore.toString().padStart(8, '0')}
          </div>
        </div>
        
        {/* Center - Map Name */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <div 
            className={`transition-all duration-300 ${
              mapNameVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
            style={{
              color: mapNameColor,
              textShadow: `0 0 5px ${mapNameColor}, 0 0 10px ${mapNameColor}, 0 0 20px ${mapNameColor}, 0 0 40px ${mapNameColor}80`,
            }}
          >
            <div className="text-[10px] font-pixel tracking-wider whitespace-nowrap">
              {currentMap.name.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Right side - Rescued count */}
        <div className="text-right">
          <div className="text-accent neon-text-accent">
            RESCUED: {rescuedCount}
          </div>
        </div>
      </div>

      {/* Pending Rewards - Activation Buttons (left side, below score) */}
      {pendingRewards.length > 0 && onActivatePendingReward && (
        <div className="absolute left-4 top-24 flex flex-col gap-1.5 pointer-events-auto">
          {pendingRewards.map((pending) => (
            <button
              key={pending.id}
              onClick={(e) => handleActivate(pending, e)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-green-400 bg-black/80 
                         hover:bg-green-900/50 active:scale-95 transition-all duration-150"
              style={{
                boxShadow: '0 0 8px rgba(0, 255, 100, 0.4)',
              }}
            >
              <span className="text-sm">{pending.icon}</span>
              <div className="text-left">
                <div className="text-green-400 text-[6px] font-bold">{pending.name}</div>
                <div className="text-gray-400 text-[5px]">TAP TO ACTIVATE</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Activation Effects - Floating animations when reward is activated */}
      {activationEffects.map((effect) => (
        <div
          key={effect.id}
          className="fixed pointer-events-none z-50"
          style={{
            left: effect.x,
            top: effect.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Expanding ring */}
          <div 
            className="absolute inset-0 rounded-full border-2 border-green-400 animate-reward-flash"
            style={{
              width: 60,
              height: 60,
              left: -30,
              top: -30,
              boxShadow: '0 0 20px rgba(0, 255, 100, 0.8)',
            }}
          />
          {/* Icon burst */}
          <div className="animate-reward-activate text-center">
            <div className="text-2xl">{effect.icon}</div>
            <div 
              className="text-green-400 text-[8px] font-bold whitespace-nowrap"
              style={{ textShadow: '0 0 10px rgba(0, 255, 100, 1)' }}
            >
              ACTIVATED!
            </div>
          </div>
        </div>
      ))}

      {/* Collision Warning for hazard zones */}
      {gameData.inHazardZone && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div 
            className="text-red-500 text-[12px] font-bold animate-pulse"
            style={{ 
              textShadow: '0 0 10px rgba(255, 0, 0, 0.8), 0 0 20px rgba(255, 0, 0, 0.5)',
              animation: 'pulse 0.5s ease-in-out infinite'
            }}
          >
            ⚠ COLLISION WARNING ⚠
          </div>
        </div>
      )}

      {/* Bottom HUD - Level & Map */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <div className="text-center">
          <div 
            className={`text-cyan-400 text-[10px] font-bold transition-all duration-300 ${
              gameData.levelGlowTimer > 0 ? 'scale-110' : ''
            }`}
            style={{ 
              textShadow: gameData.levelGlowTimer > 0
                ? '0 0 10px rgba(0, 255, 255, 0.9), 0 0 20px rgba(0, 255, 255, 0.6)'
                : '0 0 8px rgba(0, 255, 255, 0.5)'
            }}
          >
            LVL {gameData.level} · MAP {gameData.currentMapId}/50
          </div>
        </div>
      </div>
    </div>
  );
};
