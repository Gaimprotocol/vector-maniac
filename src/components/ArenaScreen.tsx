import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArenaDifficulty, 
  ArenaState,
  ARENA_ENTRY_COSTS,
  ARENA_DIFFICULTY_STATS,
} from '@/game/arena/types';
import { createArenaState, canAffordArena } from '@/game/arena/state';
import { updateArenaState } from '@/game/arena/gameLogic';
import { renderArena } from '@/game/arena/renderer';
import { getStoredScraps, addStoredScraps, subtractStoredScraps } from '@/hooks/useScrapCurrency';
import { ShipIcon, ScrapIcon, TargetIcon } from './VectorIcons';
import { triggerHapticFeedback } from '@/utils/popSound';

interface ArenaScreenProps {
  onBack: () => void;
}

export const ArenaScreen: React.FC<ArenaScreenProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<'lobby' | 'battle' | 'result'>('lobby');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ArenaDifficulty>('bronze');
  const [scraps, setScraps] = useState(getStoredScraps());
  const [arenaState, setArenaState] = useState<ArenaState | null>(null);
  const [battleResult, setBattleResult] = useState<'won' | 'lost' | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>();
  const touchRef = useRef({ x: 0, y: 0, touching: false });
  
  // Refresh scraps on mount
  useEffect(() => {
    setScraps(getStoredScraps());
  }, []);
  
  const difficulties: ArenaDifficulty[] = ['bronze', 'silver', 'gold', 'diamond'];
  
  const difficultyColors: Record<ArenaDifficulty, string> = {
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    diamond: '#b9f2ff',
  };
  
  const handleStartBattle = () => {
    const cost = ARENA_ENTRY_COSTS[selectedDifficulty];
    
    if (scraps < cost) {
      triggerHapticFeedback('heavy');
      return;
    }
    
    // Deduct entry cost
    subtractStoredScraps(cost);
    setScraps(getStoredScraps());
    
    // Create arena state
    const newState = createArenaState(selectedDifficulty);
    setArenaState(newState);
    setScreen('battle');
    
    triggerHapticFeedback('success');
  };
  
  // Touch handlers for battle
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    touchRef.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      touching: true,
    };
  }, []);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!canvasRef.current || !touchRef.current.touching) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    touchRef.current.x = touch.clientX - rect.left;
    touchRef.current.y = touch.clientY - rect.top;
  }, []);
  
  const handleTouchEnd = useCallback(() => {
    touchRef.current.touching = false;
  }, []);
  
  // Mouse handlers for desktop
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    touchRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      touching: true,
    };
  }, []);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current || !touchRef.current.touching) return;
    const rect = canvasRef.current.getBoundingClientRect();
    touchRef.current.x = e.clientX - rect.left;
    touchRef.current.y = e.clientY - rect.top;
  }, []);
  
  const handleMouseUp = useCallback(() => {
    touchRef.current.touching = false;
  }, []);
  
  // Game loop
  useEffect(() => {
    if (screen !== 'battle' || !arenaState || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    updateSize();
    
    const gameLoop = () => {
      // Calculate input position relative to arena
      const rect = canvas.getBoundingClientRect();
      const scaleX = arenaState.arenaWidth / rect.width;
      const scaleY = arenaState.arenaHeight / rect.height;
      const scale = Math.min(scaleX, scaleY);
      
      const offsetX = (rect.width - arenaState.arenaWidth / scale) / 2;
      const offsetY = (rect.height - arenaState.arenaHeight / scale) / 2;
      
      const input = {
        touchX: (touchRef.current.x - offsetX) * scale,
        touchY: (touchRef.current.y - offsetY) * scale,
        isTouching: touchRef.current.touching,
      };
      
      setArenaState(prev => {
        if (!prev) return prev;
        const newState = updateArenaState(prev, input);
        
        // Check for battle end
        if (newState.phase === 'rewards' && prev.phase !== 'rewards') {
          const won = prev.phase === 'playerWon';
          setBattleResult(won ? 'won' : 'lost');
          
          // Award scraps if won
          if (won && newState.earnedReward?.type === 'scraps' && newState.earnedReward.value) {
            addStoredScraps(newState.earnedReward.value);
            setScraps(getStoredScraps());
          }
          
          // Delay transition to result screen
          setTimeout(() => setScreen('result'), 500);
        }
        
        return newState;
      });
      
      // Render
      const currentState = arenaState;
      if (currentState) {
        ctx.clearRect(0, 0, rect.width, rect.height);
        renderArena(ctx, currentState, rect.width, rect.height);
      }
      
      frameRef.current = requestAnimationFrame(gameLoop);
    };
    
    frameRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [screen, arenaState]);
  
  // Lobby screen
  if (screen === 'lobby') {
    return (
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center z-30"
        style={{ background: 'radial-gradient(ellipse at center, #1a0a0a 0%, #0a0505 70%, #050202 100%)' }}
      >
        {/* Background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 2 + 1 + 'px',
                height: Math.random() * 2 + 1 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                background: '#ff4466',
                opacity: Math.random() * 0.3 + 0.1,
                animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
                animationDelay: `-${Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
        
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#ff4466 1px, transparent 1px), linear-gradient(90deg, #ff4466 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        
        {/* Title */}
        <h1 
          className="text-2xl md:text-3xl mb-2"
          style={{ 
            fontFamily: 'Orbitron, monospace',
            color: '#ff4466',
            textShadow: '0 0 20px #ff4466, 0 0 40px #ff446650',
          }}
        >
          ◆ ARENA BATTLE ◆
        </h1>
        
        <p 
          className="text-[9px] tracking-[0.2em] text-[#ff4466]/50 mb-6"
          style={{ fontFamily: 'Orbitron, monospace' }}
        >
          1V1 SHIP COMBAT
        </p>
        
        {/* Scraps display */}
        <div 
          className="flex items-center gap-2 mb-6 px-4 py-2 rounded border"
          style={{ 
            fontFamily: 'Orbitron, monospace',
            borderColor: 'rgba(250, 204, 21, 0.3)',
            background: 'rgba(0, 0, 0, 0.4)',
          }}
        >
          <ScrapIcon size={16} />
          <span className="text-sm" style={{ color: '#facc15' }}>{scraps.toLocaleString()}</span>
        </div>
        
        {/* Difficulty selection */}
        <div className="space-y-2 mb-6 w-full max-w-xs px-4">
          <p 
            className="text-[10px] text-center mb-3"
            style={{ fontFamily: 'Orbitron, monospace', color: 'rgba(255, 255, 255, 0.5)' }}
          >
            SELECT DIFFICULTY
          </p>
          
          {difficulties.map((diff) => {
            const cost = ARENA_ENTRY_COSTS[diff];
            const stats = ARENA_DIFFICULTY_STATS[diff];
            const canAfford = scraps >= cost;
            const isSelected = selectedDifficulty === diff;
            
            return (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                disabled={!canAfford}
                className={`w-full px-4 py-3 rounded border-2 transition-all duration-200
                           flex items-center justify-between
                           ${isSelected ? 'scale-[1.02]' : ''}
                           ${!canAfford ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.01]'}`}
                style={{
                  fontFamily: 'Orbitron, monospace',
                  borderColor: isSelected ? difficultyColors[diff] : `${difficultyColors[diff]}50`,
                  background: isSelected ? `${difficultyColors[diff]}15` : 'rgba(0, 0, 0, 0.3)',
                  boxShadow: isSelected ? `0 0 20px ${difficultyColors[diff]}30` : 'none',
                }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ color: difficultyColors[diff] }}>◆</span>
                  <span className="text-xs uppercase" style={{ color: difficultyColors[diff] }}>
                    {diff}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px]" style={{ color: canAfford ? '#facc15' : '#666' }}>
                  <ScrapIcon size={10} />
                  <span>{cost}</span>
                </div>
              </button>
            );
          })}
        </div>
        
        {/* Reward preview */}
        <div 
          className="mb-6 px-4 py-3 rounded border text-center"
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            borderColor: 'rgba(0, 255, 136, 0.2)',
            background: 'rgba(0, 0, 0, 0.3)',
          }}
        >
          <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: 'rgba(0, 255, 136, 0.5)' }}>
            Potential Rewards
          </p>
          <p className="text-xs" style={{ color: '#00ff88' }}>
            {ARENA_DIFFICULTY_STATS[selectedDifficulty].rewardMultiplier * 50} Scraps + Rare Loot
          </p>
        </div>
        
        {/* Buttons */}
        <div className="space-y-2 w-full max-w-xs px-4">
          <button
            onClick={handleStartBattle}
            disabled={!canAffordArena(selectedDifficulty, scraps)}
            className="text-sm border-2 rounded w-full px-6 py-3
                       transition-all duration-300 hover:bg-[#ff4466]/10 active:scale-95 uppercase tracking-wider
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
            style={{ 
              fontFamily: 'Orbitron, monospace',
              color: '#ff4466',
              borderColor: 'rgba(255, 68, 102, 0.5)',
              boxShadow: '0 0 20px rgba(255, 68, 102, 0.2)',
            }}
          >
            <TargetIcon size={16} /> ENTER ARENA
          </button>
          
          <button
            onClick={onBack}
            className="text-[11px] border rounded w-full px-6 py-2
                       transition-all duration-300 hover:bg-[#00ff88]/10 active:scale-95 uppercase tracking-wider
                       flex items-center justify-center gap-2"
            style={{ 
              fontFamily: 'Orbitron, monospace',
              color: '#00ff88',
              borderColor: 'rgba(0, 255, 136, 0.4)',
            }}
          >
            ◁ BACK
          </button>
        </div>
        
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0); }
            25% { transform: translateY(-20px) translateX(10px); }
            50% { transform: translateY(-10px) translateX(-10px); }
            75% { transform: translateY(-30px) translateX(5px); }
          }
        `}</style>
      </div>
    );
  }
  
  // Battle screen
  if (screen === 'battle') {
    return (
      <div className="absolute inset-0 bg-black">
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
    );
  }
  
  // Result screen
  if (screen === 'result') {
    const won = battleResult === 'won';
    const reward = arenaState?.earnedReward;
    
    return (
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center z-30"
        style={{ 
          background: won 
            ? 'radial-gradient(ellipse at center, #0a1a10 0%, #050a08 70%, #020504 100%)'
            : 'radial-gradient(ellipse at center, #1a0a0a 0%, #0a0505 70%, #050202 100%)'
        }}
      >
        {/* Result title */}
        <h1 
          className="text-3xl mb-4"
          style={{ 
            fontFamily: 'Orbitron, monospace',
            color: won ? '#00ff88' : '#ff4466',
            textShadow: won ? '0 0 30px #00ff88, 0 0 60px #00ff8850' : '0 0 30px #ff4466, 0 0 60px #ff446650',
          }}
        >
          {won ? '◆ VICTORY! ◆' : 'DEFEATED'}
        </h1>
        
        {/* Reward display */}
        {won && reward && (
          <div 
            className="mb-6 px-6 py-4 rounded-lg border text-center"
            style={{
              fontFamily: 'Orbitron, monospace',
              borderColor: reward.rarity === 'legendary' ? '#ffd700' : 
                          reward.rarity === 'epic' ? '#aa66ff' :
                          reward.rarity === 'rare' ? '#4488ff' : 'rgba(0, 255, 136, 0.3)',
              background: 'rgba(0, 0, 0, 0.5)',
              boxShadow: reward.rarity === 'legendary' ? '0 0 30px #ffd70050' : 
                        reward.rarity === 'epic' ? '0 0 30px #aa66ff50' : 'none',
            }}
          >
            <p className="text-[9px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              {reward.rarity.toUpperCase()} REWARD
            </p>
            <p className="text-xl mb-1" style={{ color: '#facc15' }}>
              {reward.icon} {reward.name}
            </p>
            <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {reward.description}
            </p>
          </div>
        )}
        
        {!won && (
          <p 
            className="text-sm mb-6"
            style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(255, 255, 255, 0.5)' }}
          >
            You lost {ARENA_ENTRY_COSTS[selectedDifficulty]} scraps
          </p>
        )}
        
        {/* Current scraps */}
        <div 
          className="flex items-center gap-2 mb-6 px-4 py-2 rounded border"
          style={{ 
            fontFamily: 'Orbitron, monospace',
            borderColor: 'rgba(250, 204, 21, 0.3)',
            background: 'rgba(0, 0, 0, 0.4)',
          }}
        >
          <ScrapIcon size={16} />
          <span className="text-sm" style={{ color: '#facc15' }}>{scraps.toLocaleString()} Scraps</span>
        </div>
        
        {/* Buttons */}
        <div className="space-y-2 w-full max-w-xs px-4">
          <button
            onClick={() => {
              setScreen('lobby');
              setArenaState(null);
              setBattleResult(null);
              setScraps(getStoredScraps());
            }}
            className="text-sm border-2 rounded w-full px-6 py-3
                       transition-all duration-300 hover:bg-[#ff4466]/10 active:scale-95 uppercase tracking-wider
                       flex items-center justify-center gap-2"
            style={{ 
              fontFamily: 'Orbitron, monospace',
              color: '#ff4466',
              borderColor: 'rgba(255, 68, 102, 0.5)',
              boxShadow: '0 0 20px rgba(255, 68, 102, 0.2)',
            }}
          >
            <TargetIcon size={16} /> FIGHT AGAIN
          </button>
          
          <button
            onClick={onBack}
            className="text-[11px] border rounded w-full px-6 py-2
                       transition-all duration-300 hover:bg-[#00ff88]/10 active:scale-95 uppercase tracking-wider
                       flex items-center justify-center gap-2"
            style={{ 
              fontFamily: 'Orbitron, monospace',
              color: '#00ff88',
              borderColor: 'rgba(0, 255, 136, 0.4)',
            }}
          >
            ◁ MAIN MENU
          </button>
        </div>
      </div>
    );
  }
  
  return null;
};
