import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArenaDifficulty, 
  ArenaState,
  ArenaMode,
  ArenaBoosts,
  ARENA_ENTRY_COSTS,
  ARENA_SCRAP_REWARDS,
  ARENA_DIFFICULTY_STATS,
} from '@/game/arena/types';
import { createArenaState, canAffordArena } from '@/game/arena/state';
import { updateArenaState } from '@/game/arena/gameLogic';
import { renderArena } from '@/game/arena/renderer';
import { getStoredScraps, addStoredScraps, subtractStoredScraps } from '@/hooks/useScrapCurrency';
import { 
  useArenaConsumables, 
  ArenaConsumable, 
  calculateBoosts,
  addConsumable,
  addSpecialBooster,
  rewardToConsumable,
  ConsumableType,
  ConsumableRarity,
} from '@/hooks/useArenaConsumables';
import { addArenaUnlock } from '@/hooks/useArenaUnlocks';
import { BoosterSelectionModal } from './arena/BoosterSelectionModal';
import { ShipIcon, ScrapIcon, TargetIcon } from './VectorIcons';
import { triggerHapticFeedback } from '@/utils/popSound';

interface ArenaScreenProps {
  onBack: () => void;
}

export const ArenaScreen: React.FC<ArenaScreenProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<'lobby' | 'booster_select' | 'battle' | 'result'>('lobby');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ArenaDifficulty>('bronze');
  const [selectedMode, setSelectedMode] = useState<ArenaMode>('multiplayer');
  const [scraps, setScraps] = useState(getStoredScraps());
  const [arenaState, setArenaState] = useState<ArenaState | null>(null);
  const [battleResult, setBattleResult] = useState<'won' | 'lost' | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  
  // Booster selection state
  const { consumables, consumeAll } = useArenaConsumables();
  const [selectedBoosterIds, setSelectedBoosterIds] = useState<string[]>([]);
  const [activeBoosts, setActiveBoosts] = useState<ArenaBoosts | null>(null);
  
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
  
  // Open booster selection before matchmaking
  const handleEnterArena = () => {
    const cost = ARENA_ENTRY_COSTS[selectedDifficulty];
    
    if (scraps < cost) {
      triggerHapticFeedback('heavy');
      return;
    }
    
    // Show booster selection screen
    setSelectedBoosterIds([]);
    setScreen('booster_select');
    triggerHapticFeedback('light');
  };
  
  // Toggle a booster selection
  const handleToggleBooster = (id: string) => {
    setSelectedBoosterIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
    triggerHapticFeedback('light');
  };
  
  // Confirm booster selection and start matchmaking
  const handleConfirmBoosters = () => {
    // Calculate boosts from selected consumables
    const selectedConsumables = consumables.filter(c => selectedBoosterIds.includes(c.id));
    const boosts = calculateBoosts(selectedConsumables);
    setActiveBoosts(boosts);
    
    // Consume the selected boosters now (they're used regardless of outcome)
    if (selectedBoosterIds.length > 0) {
      consumeAll(selectedBoosterIds);
    }
    
    // Start matchmaking
    if (selectedMode === 'multiplayer') {
      setScreen('lobby'); // Temporarily go back to lobby for matchmaking animation
      setIsSearching(true);
      setSearchProgress(0);
      
      const searchDuration = 2000 + Math.random() * 2000;
      const startTime = Date.now();
      
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / searchDuration) * 100);
        setSearchProgress(progress);
        
        if (progress < 100) {
          requestAnimationFrame(updateProgress);
        } else {
          setIsSearching(false);
          startBattle(boosts);
        }
      };
      
      requestAnimationFrame(updateProgress);
    } else {
      startBattle(boosts);
    }
  };
  
  const handleCancelBoosters = () => {
    setSelectedBoosterIds([]);
    setScreen('lobby');
  };
  
  const startBattle = (boosts?: ArenaBoosts) => {
    const cost = ARENA_ENTRY_COSTS[selectedDifficulty];
    
    // Deduct entry cost
    subtractStoredScraps(cost);
    setScraps(getStoredScraps());
    
    // Create arena state with selected mode and boosts
    const newState = createArenaState(selectedDifficulty, selectedMode, boosts || activeBoosts || undefined);
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
  
  // Game loop - fullscreen rendering like main game
  useEffect(() => {
    if (screen !== 'battle' || !arenaState || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match arena dimensions (same approach as main game)
    const updateSize = () => {
      // Use arena dimensions directly for internal resolution
      canvas.width = arenaState.arenaWidth;
      canvas.height = arenaState.arenaHeight;
    };
    updateSize();
    
    const gameLoop = () => {
      // Calculate input position relative to screen - scale touch input to arena coordinates
      const rect = canvas.getBoundingClientRect();
      const scaleX = arenaState.arenaWidth / rect.width;
      const scaleY = arenaState.arenaHeight / rect.height;
      
      const input = {
        touchX: touchRef.current.x * scaleX,
        touchY: touchRef.current.y * scaleY,
        isTouching: touchRef.current.touching,
      };
      
      setArenaState(prev => {
        if (!prev) return prev;
        const newState = updateArenaState(prev, input);
        
        // Check for battle end
        if (newState.phase === 'rewards' && prev.phase !== 'rewards') {
          const won = prev.phase === 'playerWon';
          setBattleResult(won ? 'won' : 'lost');
          
          // Award scraps and process rewards if won
          if (won && newState.earnedRewards) {
            // Award scraps
            const scrapsReward = newState.earnedRewards.find(r => r.type === 'scraps');
            if (scrapsReward?.value) {
              addStoredScraps(scrapsReward.value);
              setScraps(getStoredScraps());
            }
            
            // Process non-scrap rewards - add as one-time consumables!
            const otherRewards = newState.earnedRewards.filter(r => r.type !== 'scraps');
            for (const reward of otherRewards) {
              if (reward.type === 'consumable') {
                // Arena booster - add to consumable inventory
                const consumableType = rewardToConsumable(reward.name);
                if (consumableType) {
                  addConsumable(consumableType);
                }
              } else if (reward.type === 'ship_unlock') {
                // Add as one-time ship booster (not permanent!)
                addSpecialBooster(
                  'ship_boost',
                  reward.name,
                  `Use ${reward.name} for one arena battle`,
                  reward.rarity as ConsumableRarity,
                  { shipId: reward.unlockData?.shipId, shipName: reward.name }
                );
              } else if (reward.type === 'skin_unlock') {
                // Add as one-time skin booster (not permanent!)
                addSpecialBooster(
                  'skin_boost',
                  reward.name,
                  `Apply ${reward.name} skin for one arena battle`,
                  reward.rarity as ConsumableRarity,
                  { skinId: reward.unlockData?.skinId, skinName: reward.name }
                );
              } else if (reward.type === 'companion_unlock') {
                // Add as one-time companion booster (not permanent!)
                addSpecialBooster(
                  'companion_boost',
                  reward.name,
                  `${reward.name} assists for one arena battle`,
                  reward.rarity as ConsumableRarity,
                  { companionData: reward.unlockData?.companionData }
                );
              }
            }
          }
          
          // Clear active boosts
          setActiveBoosts(null);
          
          // Delay transition to result screen
          setTimeout(() => setScreen('result'), 500);
        }
        
        return newState;
      });
      
      // Render directly at arena resolution (no scaling - same as main game)
      const currentState = arenaState;
      if (currentState) {
        ctx.clearRect(0, 0, arenaState.arenaWidth, arenaState.arenaHeight);
        renderArena(ctx, currentState);
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
  
  // Booster selection screen
  if (screen === 'booster_select') {
    return (
      <BoosterSelectionModal
        consumables={consumables}
        selectedIds={selectedBoosterIds}
        onToggle={handleToggleBooster}
        onConfirm={handleConfirmBoosters}
        onCancel={handleCancelBoosters}
        maxSelections={3}
      />
    );
  }
  
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
        
        {/* Mode selection */}
        <div className="flex gap-2 mb-4 w-full max-w-xs px-4">
          <button
            onClick={() => setSelectedMode('ai')}
            className={`flex-1 px-3 py-2 rounded border-2 transition-all text-[10px] uppercase
                       ${selectedMode === 'ai' ? 'scale-[1.02]' : 'opacity-60'}`}
            style={{
              fontFamily: 'Orbitron, monospace',
              borderColor: selectedMode === 'ai' ? '#00ff88' : '#00ff8850',
              background: selectedMode === 'ai' ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
              color: '#00ff88',
            }}
          >
            ◇ VS AI
          </button>
          <button
            onClick={() => setSelectedMode('multiplayer')}
            className={`flex-1 px-3 py-2 rounded border-2 transition-all text-[10px] uppercase
                       ${selectedMode === 'multiplayer' ? 'scale-[1.02]' : 'opacity-60'}`}
            style={{
              fontFamily: 'Orbitron, monospace',
              borderColor: selectedMode === 'multiplayer' ? '#ff4466' : '#ff446650',
              background: selectedMode === 'multiplayer' ? 'rgba(255, 68, 102, 0.1)' : 'transparent',
              color: '#ff4466',
            }}
          >
            ◆ VS PLAYERS
          </button>
        </div>
        
        {selectedMode === 'multiplayer' && (
          <p 
            className="text-[8px] text-center mb-3 px-4"
            style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(255, 255, 255, 0.4)' }}
          >
            Matchmaking will find opponents at your skill level
          </p>
        )}
        
        {/* Difficulty selection */}
        <div className="space-y-2 mb-6 w-full max-w-xs px-4">
          <p 
            className="text-[10px] text-center mb-3"
            style={{ fontFamily: 'Orbitron, monospace', color: 'rgba(255, 255, 255, 0.5)' }}
          >
            SELECT TIER
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
          className="mb-4 px-4 py-3 rounded border text-center"
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
            +{ARENA_SCRAP_REWARDS[selectedDifficulty]} Scraps
          </p>
          <p className="text-[9px] mt-1" style={{ color: 'rgba(255, 215, 0, 0.7)' }}>
            {selectedDifficulty === 'diamond' ? '95% Unique Loot' :
             selectedDifficulty === 'gold' ? '95% Rare+ Loot' :
             selectedDifficulty === 'silver' ? '85% Rare+ Loot' : '85% Bonus Loot'}
          </p>
        </div>
        
        {/* Booster inventory preview */}
        {consumables.length > 0 && (
          <div 
            className="mb-6 px-4 py-2 rounded border text-center"
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              borderColor: 'rgba(170, 102, 255, 0.3)',
              background: 'rgba(0, 0, 0, 0.3)',
            }}
          >
            <p className="text-[9px] uppercase tracking-wider" style={{ color: 'rgba(170, 102, 255, 0.7)' }}>
              ✦ {consumables.length} Booster{consumables.length !== 1 ? 's' : ''} Available
            </p>
          </div>
        )}
        
        {/* Matchmaking overlay */}
        {isSearching && (
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center z-40"
            style={{ background: 'rgba(0, 0, 0, 0.9)' }}
          >
            <div 
              className="text-lg mb-4"
              style={{ 
                fontFamily: 'Orbitron, monospace',
                color: '#ff4466',
                textShadow: '0 0 20px #ff4466',
              }}
            >
              SEARCHING FOR OPPONENT...
            </div>
            
            <div 
              className="w-48 h-2 rounded-full overflow-hidden mb-4"
              style={{ background: 'rgba(255, 68, 102, 0.2)' }}
            >
              <div 
                className="h-full rounded-full transition-all duration-100"
                style={{ 
                  width: `${searchProgress}%`,
                  background: 'linear-gradient(90deg, #ff4466, #ff6688)',
                  boxShadow: '0 0 10px #ff4466',
                }}
              />
            </div>
            
            <p 
              className="text-[10px]"
              style={{ fontFamily: 'Rajdhani, sans-serif', color: 'rgba(255, 255, 255, 0.5)' }}
            >
              {searchProgress < 30 ? 'Connecting to servers...' :
               searchProgress < 60 ? 'Finding players...' :
               searchProgress < 90 ? 'Matching skill levels...' :
               'Opponent found!'}
            </p>
          </div>
        )}
        
        {/* Buttons */}
        <div className="space-y-2 w-full max-w-xs px-4">
          <button
            onClick={handleEnterArena}
            disabled={!canAffordArena(selectedDifficulty, scraps) || isSearching}
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
            <TargetIcon size={16} /> 
            {selectedMode === 'multiplayer' ? 'FIND MATCH' : 'ENTER ARENA'}
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
    const rewards = arenaState?.earnedRewards || [];
    const scrapsReward = rewards.find(r => r.type === 'scraps');
    const uniqueRewards = rewards.filter(r => r.type !== 'scraps');
    
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
        
        {/* Rewards display - show all earned rewards */}
        {won && rewards.length > 0 && (
          <div className="mb-6 space-y-3">
            {/* Scraps reward */}
            {scrapsReward && (
              <div 
                className="px-6 py-3 rounded-lg border text-center"
                style={{
                  fontFamily: 'Orbitron, monospace',
                  borderColor: 'rgba(250, 204, 21, 0.4)',
                  background: 'rgba(0, 0, 0, 0.5)',
                }}
              >
                <p className="text-lg" style={{ color: '#facc15' }}>
                  {scrapsReward.icon} +{scrapsReward.value} Scraps
                </p>
              </div>
            )}
            
            {/* Unique rewards */}
            {uniqueRewards.map((reward, index) => (
              <div 
                key={index}
                className="px-6 py-4 rounded-lg border text-center"
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
                <p className="text-xl mb-1" style={{ 
                  color: reward.rarity === 'legendary' ? '#ffd700' : 
                         reward.rarity === 'epic' ? '#aa66ff' : '#4488ff' 
                }}>
                  {reward.icon} {reward.name}
                </p>
                <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {reward.description}
                </p>
                <p className="text-[8px] mt-2" style={{ 
                  color: reward.type === 'consumable' 
                    ? 'rgba(170, 102, 255, 0.8)' 
                    : reward.type === 'ship_unlock' 
                      ? '#ffd700'
                      : reward.type === 'companion_unlock'
                        ? '#00ff88'
                        : '#4488ff'
                }}>
                  {reward.type === 'consumable' 
                    ? '✦ Added to boosters' 
                    : reward.type === 'ship_unlock' 
                      ? '⬢ PERMANENT SHIP UNLOCKED!'
                      : reward.type === 'skin_unlock'
                        ? '◎ Permanent skin unlocked!'
                        : reward.type === 'companion_unlock'
                          ? '◈ COMPANION UNLOCKED for main game!'
                          : '✦ Reward claimed'}
                </p>
              </div>
            ))}
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
