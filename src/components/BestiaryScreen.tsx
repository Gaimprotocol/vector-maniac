import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicContext } from '@/contexts/MusicContext';
import { playPopSoundsWithDelays } from '@/utils/popSound';
import { useBestiary, BestiaryEntry } from '@/hooks/useBestiary';
import { useVisualBestiary, VisualBestiaryEntry } from '@/hooks/useVisualBestiary';
import { useScrapCurrency } from '@/hooks/useScrapCurrency';
import { useBestiaryRewards, Companion } from '@/hooks/useBestiaryRewards';
import { ArrowBackIcon } from './VectorIcons';
import { AnomalyCard } from './bestiary/AnomalyCard';
import { AnomalyShapeRenderer } from './bestiary/AnomalyShapeRenderer';

type TabType = 'enemies' | 'companions' | 'backgrounds' | 'hyperspace';

// Visual entry card for backgrounds/hyperspace
const VisualCard: React.FC<{ entry: VisualBestiaryEntry; index: number }> = ({ entry, index }) => {
  const isBackground = entry.type === 'background';
  
  return (
    <div 
      className="rounded-lg p-3 border opacity-0 animate-pop-in"
      style={{ 
        borderColor: `hsl(${entry.primaryHue}, 60%, 40%)`,
        background: `linear-gradient(135deg, hsl(${entry.primaryHue}, 50%, 8%) 0%, hsl(${entry.secondaryHue}, 40%, 5%) 100%)`,
        animationDelay: `${200 + index * 50}ms`,
      }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded border flex items-center justify-center"
          style={{ 
            borderColor: `hsl(${entry.primaryHue}, 60%, 40%)`,
            background: `radial-gradient(circle, hsl(${entry.secondaryHue}, 50%, 15%) 0%, hsl(${entry.primaryHue}, 40%, 8%) 100%)`,
          }}
        >
          {isBackground ? (
            <svg width={24} height={24} viewBox="0 0 24 24">
              <g stroke={`hsl(${entry.primaryHue}, 70%, 60%)`} strokeWidth={1} fill="none">
                <rect x={4} y={4} width={16} height={16} />
                <line x1={12} y1={4} x2={12} y2={20} />
                <line x1={4} y1={12} x2={20} y2={12} />
              </g>
            </svg>
          ) : (
            <svg width={24} height={24} viewBox="0 0 24 24">
              <g stroke={`hsl(${entry.primaryHue}, 70%, 60%)`} strokeWidth={2} fill="none">
                <line x1={4} y1={4} x2={4} y2={20} />
                <line x1={10} y1={6} x2={10} y2={18} />
                <line x1={16} y1={3} x2={16} y2={21} />
                <line x1={22} y1={5} x2={22} y2={19} />
              </g>
            </svg>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-[11px] font-bold truncate" style={{ fontFamily: 'Orbitron, monospace', color: `hsl(${entry.primaryHue}, 70%, 65%)` }}>
            {entry.name}
          </h3>
          
          <div className="text-[8px] text-[#888]/70 flex flex-wrap gap-x-2 mt-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            <span className="flex items-center gap-1">
              <span className="opacity-50">TYPE:</span>
              <span style={{ color: `hsl(${entry.primaryHue}, 60%, 60%)` }}>
                {isBackground ? (entry.pattern?.toUpperCase() || 'UNKNOWN') : (entry.effect?.toUpperCase() || 'UNKNOWN')}
              </span>
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-[8px]" style={{ fontFamily: 'Orbitron, monospace', color: `hsl(${entry.primaryHue}, 50%, 50%)` }}>
            <div>VISITS: {entry.timesVisited}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Companion Card with proper shape rendering
const CompanionCard: React.FC<{ 
  companion: Companion; 
  index: number; 
  isActive: boolean; 
  onSetActive: (seed: number) => void;
  isSelected?: boolean;
  onSelect?: (seed: number) => void;
  selectionMode?: boolean;
}> = ({ 
  companion, index, isActive, onSetActive, isSelected, onSelect, selectionMode 
}) => {
  const color = `hsl(${companion.hue}, ${companion.saturation}%, 60%)`;
  
  return (
    <div 
      className={`rounded-lg p-3 border opacity-0 animate-pop-in cursor-pointer transition-all ${
        isActive ? 'ring-2 ring-[#00ffaa]' : ''
      } ${isSelected ? 'ring-2 ring-[#ffaa00]' : ''}`}
      style={{ 
        borderColor: `hsl(${companion.hue}, ${companion.saturation}%, 40%)`,
        background: `linear-gradient(135deg, hsl(${companion.hue}, ${companion.saturation}%, 8%) 0%, transparent 100%)`,
        animationDelay: `${200 + index * 50}ms`,
      }}
      onClick={() => selectionMode && onSelect?.(companion.seed)}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 flex items-center justify-center">
          <AnomalyShapeRenderer
            shape={companion.shape as any}
            hue={companion.hue}
            saturation={companion.saturation}
            size={48}
            hasAura={true}
            hasPulse={false}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-[11px] font-bold truncate" style={{ fontFamily: 'Orbitron, monospace', color }}>
            {companion.name}
          </h3>
          <div className="text-[8px] text-[#00ffaa]/50" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            {companion.behavior.toUpperCase()} • {companion.ability.toUpperCase()}
          </div>
          {companion.evolutionLevel && (
            <div className="text-[7px] text-[#ffaa00]" style={{ fontFamily: 'Orbitron' }}>
              ★ EVOLVED LV.{companion.evolutionLevel}
            </div>
          )}
        </div>
        
        {selectionMode ? (
          <div 
            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              isSelected ? 'bg-[#ffaa00] border-[#ffaa00]' : 'border-[#666]'
            }`}
          >
            {isSelected && <span className="text-black text-xs">✓</span>}
          </div>
        ) : isActive ? (
          <span className="text-[8px] px-2 py-1 rounded bg-[#00ffaa]/20 text-[#00ffaa] border border-[#00ffaa]/50" style={{ fontFamily: 'Orbitron' }}>
            ACTIVE
          </span>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onSetActive(companion.seed); }}
            className="text-[8px] px-2 py-1 rounded bg-[#666]/20 text-[#aaa] border border-[#666]/50 hover:bg-[#888]/20 hover:text-white transition-colors"
            style={{ fontFamily: 'Orbitron' }}
          >
            SET ACTIVE
          </button>
        )}
      </div>
    </div>
  );
};

export const BestiaryScreen: React.FC = () => {
  const navigate = useNavigate();
  const { hasEnteredGalaxy, enterGalaxy } = useMusicContext();
  const { entries: enemyEntries, stats: enemyStats } = useBestiary();
  const { entries: visualEntries, stats: visualStats } = useVisualBestiary();
  const { scraps, addScraps, spendScraps } = useScrapCurrency();
  const { 
    companions, 
    hasBountyCollected, 
    collectBounty, 
    hasCompanion, 
    purchaseCompanion, 
    setActiveCompanion,
    activeCompanion,
    evolveCompanions,
    getEvolutionCost,
  } = useBestiaryRewards();
  const [activeTab, setActiveTab] = useState<TabType>('enemies');
  const [evolutionMode, setEvolutionMode] = useState(false);
  const [selectedForEvolution, setSelectedForEvolution] = useState<number[]>([]);
  
  const sortedEnemyEntries = [...enemyEntries].sort((a, b) => b.discoveredAt - a.discoveredAt);
  const sortedBackgroundEntries = [...visualEntries].filter(e => e.type === 'background').sort((a, b) => b.discoveredAt - a.discoveredAt);
  const sortedHyperspaceEntries = [...visualEntries].filter(e => e.type === 'hyperspace').sort((a, b) => b.discoveredAt - a.discoveredAt);

  useEffect(() => {
    if (!hasEnteredGalaxy) enterGalaxy();
  }, [hasEnteredGalaxy, enterGalaxy]);

  useEffect(() => {
    playPopSoundsWithDelays([0, 50, 100, 150]);
  }, []);

  const handleCollectBounty = (seed: number, value: number) => {
    collectBounty(seed);
    addScraps(value);
  };

  const handlePurchaseCompanion = (entry: BestiaryEntry, cost: number) => {
    if (spendScraps(cost)) {
      purchaseCompanion({
        seed: entry.seed,
        name: entry.name,
        shape: entry.shape,
        hue: entry.hue,
        saturation: entry.saturation,
        behavior: entry.behavior,
        ability: entry.ability,
      });
    }
  };

  const handleSelectForEvolution = (seed: number) => {
    setSelectedForEvolution(prev => {
      if (prev.includes(seed)) {
        return prev.filter(s => s !== seed);
      }
      if (prev.length >= 2) {
        return [prev[1], seed]; // Replace oldest selection
      }
      return [...prev, seed];
    });
  };

  const handleEvolve = () => {
    if (selectedForEvolution.length !== 2) return;
    const cost = getEvolutionCost(selectedForEvolution);
    if (spendScraps(cost)) {
      evolveCompanions(selectedForEvolution[0], selectedForEvolution[1]);
      setSelectedForEvolution([]);
      setEvolutionMode(false);
    }
  };

  const cancelEvolution = () => {
    setEvolutionMode(false);
    setSelectedForEvolution([]);
  };

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: 'enemies', label: 'CREATURES', count: enemyStats.totalDiscovered },
    { id: 'companions', label: 'ALLIES', count: companions.length },
    { id: 'backgrounds', label: 'REALMS', count: visualStats.backgroundsDiscovered },
    { id: 'hyperspace', label: 'WARP ZONES', count: visualStats.hyperspacesDiscovered },
  ];

  return (
    <div className="fixed inset-0 flex flex-col items-center pt-14 pb-16 px-4 overflow-y-auto"
         style={{ background: 'radial-gradient(ellipse at center, #0a0515 0%, #050210 70%, #020108 100%)' }}>
      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute rounded-full" style={{
            width: Math.random() * 2 + 1 + 'px',
            height: Math.random() * 2 + 1 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            background: `hsl(${280 + Math.random() * 60}, 80%, 60%)`,
            opacity: Math.random() * 0.4 + 0.1,
            animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
            animationDelay: `-${Math.random() * 10}s`,
          }} />
        ))}
      </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(#aa44ff 1px, transparent 1px), linear-gradient(90deg, #aa44ff 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Header */}
      <div className="relative z-10 w-full max-w-md pt-2.5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/')}
                  className="text-[11px] tracking-wider text-[#aa88ff]/60 hover:text-[#aa88ff] flex items-center gap-2 transition-colors opacity-0 animate-pop-in"
                  style={{ fontFamily: 'Orbitron, monospace', animationDelay: '0ms' }}>
            <ArrowBackIcon size={14} glow={false} /> BACK
          </button>
          
          {/* Scraps display */}
          <div className="text-[10px] text-[#ffaa00] opacity-0 animate-pop-in flex items-center gap-1" 
               style={{ fontFamily: 'Orbitron, monospace', animationDelay: '50ms' }}>
            <span className="text-[#ffaa00]/60">◈</span>
            <span>{scraps}</span>
          </div>
        </div>

        <h1 className="text-2xl text-center mb-2 opacity-0 animate-pop-in tracking-widest" style={{ fontFamily: 'Orbitron, monospace', animationDelay: '50ms' }}>
          <span className="text-[#aa88ff]" style={{ textShadow: '0 0 20px #aa44ff, 0 0 40px #aa44ff50' }}>BESTIARY</span>
        </h1>

        <p className="text-[8px] text-[#aa88ff]/40 text-center mb-4 tracking-[0.3em] opacity-0 animate-pop-in" style={{ fontFamily: 'Orbitron, monospace', animationDelay: '100ms' }}>
          ANOMALY ARCHIVE
        </p>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-1.5 mb-4 flex-wrap opacity-0 animate-pop-in" style={{ animationDelay: '120ms' }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`text-[7px] px-2 py-1.5 rounded transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-[#aa88ff]/10 text-[#aa88ff] border border-[#aa88ff]'
                        : 'text-[#aa88ff]/50 border border-[#aa88ff]/30 hover:border-[#aa88ff]/60 hover:text-[#aa88ff]/80'
                    }`}
                    style={{ fontFamily: 'Orbitron, monospace' }}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Stats bar */}
        <div className="flex justify-center gap-6 mb-6 opacity-0 animate-pop-in" style={{ animationDelay: '150ms' }}>
          {activeTab === 'enemies' ? (
            <>
              <div className="text-center">
                <div className="text-lg text-[#aa88ff]" style={{ fontFamily: 'Orbitron, monospace', textShadow: '0 0 10px #aa44ff' }}>{enemyStats.totalDiscovered}</div>
                <div className="text-[7px] text-[#aa88ff]/40" style={{ fontFamily: 'Rajdhani, sans-serif' }}>DISCOVERED</div>
              </div>
              <div className="text-center">
                <div className="text-lg text-[#ff8844]" style={{ fontFamily: 'Orbitron, monospace', textShadow: '0 0 10px #ff4400' }}>{enemyStats.totalEncounters}</div>
                <div className="text-[7px] text-[#ff8844]/40" style={{ fontFamily: 'Rajdhani, sans-serif' }}>ENCOUNTERS</div>
              </div>
              <div className="text-center">
                <div className="text-lg text-[#ff4444]" style={{ fontFamily: 'Orbitron, monospace', textShadow: '0 0 10px #ff0000' }}>{enemyStats.totalDefeated}</div>
                <div className="text-[7px] text-[#ff4444]/40" style={{ fontFamily: 'Rajdhani, sans-serif' }}>TERMINATED</div>
              </div>
            </>
          ) : activeTab === 'companions' ? (
            <>
              <div className="text-center">
                <div className="text-lg text-[#00ffaa]" style={{ fontFamily: 'Orbitron, monospace', textShadow: '0 0 10px #00ff88' }}>{companions.length}</div>
                <div className="text-[7px] text-[#00ffaa]/40" style={{ fontFamily: 'Rajdhani, sans-serif' }}>RECRUITED</div>
              </div>
              <div className="text-center">
                <div className="text-lg text-[#ffaa00]" style={{ fontFamily: 'Orbitron, monospace', textShadow: '0 0 10px #ff8800' }}>{activeCompanion ? 1 : 0}</div>
                <div className="text-[7px] text-[#ffaa00]/40" style={{ fontFamily: 'Rajdhani, sans-serif' }}>ACTIVE</div>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="text-lg text-[#00ffaa]" style={{ fontFamily: 'Orbitron, monospace', textShadow: '0 0 10px #00ff88' }}>
                  {activeTab === 'backgrounds' ? visualStats.backgroundsDiscovered : visualStats.hyperspacesDiscovered}
                </div>
                <div className="text-[7px] text-[#00ffaa]/40" style={{ fontFamily: 'Rajdhani, sans-serif' }}>DISCOVERED</div>
              </div>
              <div className="text-center">
                <div className="text-lg text-[#00aaff]" style={{ fontFamily: 'Orbitron, monospace', textShadow: '0 0 10px #0088ff' }}>{visualStats.totalVisits}</div>
                <div className="text-[7px] text-[#00aaff]/40" style={{ fontFamily: 'Rajdhani, sans-serif' }}>TOTAL VISITS</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Entries list */}
      <div className="relative z-10 w-full max-w-md space-y-2 pb-8">
        {activeTab === 'enemies' && (
          sortedEnemyEntries.length === 0 ? (
            <div className="text-center py-12 opacity-0 animate-pop-in" style={{ animationDelay: '200ms' }}>
              <div className="text-4xl mb-4 text-[#aa88ff]/20" style={{ fontFamily: 'Orbitron, monospace' }}>?</div>
              <p className="text-[10px] text-[#aa88ff]/40" style={{ fontFamily: 'Rajdhani, sans-serif' }}>No anomaly creatures discovered yet.</p>
              <p className="text-[9px] text-[#aa88ff]/30 mt-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Reach Map 3+ to encounter anomalies.</p>
            </div>
          ) : sortedEnemyEntries.map((entry, index) => (
            <AnomalyCard 
              key={entry.seed} 
              entry={entry} 
              index={index}
              hasBountyCollected={hasBountyCollected(entry.seed)}
              hasCompanion={hasCompanion(entry.seed)}
              scraps={scraps}
              onCollectBounty={handleCollectBounty}
              onPurchaseCompanion={handlePurchaseCompanion}
            />
          ))
        )}

        {activeTab === 'companions' && (
          companions.length === 0 ? (
            <div className="text-center py-12 opacity-0 animate-pop-in" style={{ animationDelay: '200ms' }}>
              <div className="text-4xl mb-4 text-[#00ffaa]/20" style={{ fontFamily: 'Orbitron, monospace' }}>⚔</div>
              <p className="text-[10px] text-[#00ffaa]/40" style={{ fontFamily: 'Rajdhani, sans-serif' }}>No allies recruited yet.</p>
              <p className="text-[9px] text-[#00ffaa]/30 mt-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Defeat anomalies and recruit them as companions!</p>
            </div>
          ) : (
            <>
              {/* Evolution Controls */}
              <div className="mb-4 opacity-0 animate-pop-in" style={{ animationDelay: '180ms' }}>
                {!evolutionMode ? (
                  <button
                    onClick={() => setEvolutionMode(true)}
                    disabled={companions.length < 2}
                    className={`w-full text-[9px] py-2 rounded border transition-all ${
                      companions.length >= 2 
                        ? 'border-[#ffaa00]/50 text-[#ffaa00] bg-[#ffaa00]/10 hover:bg-[#ffaa00]/20' 
                        : 'border-[#666]/30 text-[#666] bg-transparent cursor-not-allowed'
                    }`}
                    style={{ fontFamily: 'Orbitron, monospace' }}
                  >
                    ⚡ EVOLVE ALLIES {companions.length < 2 && '(need 2+)'}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="text-[8px] text-[#ffaa00] text-center" style={{ fontFamily: 'Orbitron' }}>
                      SELECT 2 ALLIES TO MERGE ({selectedForEvolution.length}/2)
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={cancelEvolution}
                        className="flex-1 text-[8px] py-2 rounded border border-[#ff4444]/50 text-[#ff4444] bg-[#ff4444]/10 hover:bg-[#ff4444]/20 transition-all"
                        style={{ fontFamily: 'Orbitron' }}
                      >
                        CANCEL
                      </button>
                      <button
                        onClick={handleEvolve}
                        disabled={selectedForEvolution.length !== 2 || scraps < getEvolutionCost(selectedForEvolution)}
                        className={`flex-1 text-[8px] py-2 rounded border transition-all ${
                          selectedForEvolution.length === 2 && scraps >= getEvolutionCost(selectedForEvolution)
                            ? 'border-[#00ffaa]/50 text-[#00ffaa] bg-[#00ffaa]/10 hover:bg-[#00ffaa]/20'
                            : 'border-[#666]/30 text-[#666] bg-transparent cursor-not-allowed'
                        }`}
                        style={{ fontFamily: 'Orbitron' }}
                      >
                        EVOLVE (◈{selectedForEvolution.length === 2 ? getEvolutionCost(selectedForEvolution) : '?'})
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Companion List */}
              {companions.map((companion, index) => (
                <CompanionCard 
                  key={companion.seed} 
                  companion={companion} 
                  index={index}
                  isActive={activeCompanion?.seed === companion.seed}
                  onSetActive={setActiveCompanion}
                  selectionMode={evolutionMode}
                  isSelected={selectedForEvolution.includes(companion.seed)}
                  onSelect={handleSelectForEvolution}
                />
              ))}
            </>
          )
        )}
        
        {activeTab === 'backgrounds' && (
          sortedBackgroundEntries.length === 0 ? (
            <div className="text-center py-12 opacity-0 animate-pop-in" style={{ animationDelay: '200ms' }}>
              <div className="text-4xl mb-4 text-[#00ffaa]/20" style={{ fontFamily: 'Orbitron, monospace' }}>◇</div>
              <p className="text-[10px] text-[#00ffaa]/40" style={{ fontFamily: 'Rajdhani, sans-serif' }}>No anomaly realms discovered yet.</p>
              <p className="text-[9px] text-[#00ffaa]/30 mt-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Reach Map 5+ to encounter unique backgrounds.</p>
            </div>
          ) : sortedBackgroundEntries.map((entry, index) => <VisualCard key={entry.seed} entry={entry} index={index} />)
        )}
        
        {activeTab === 'hyperspace' && (
          sortedHyperspaceEntries.length === 0 ? (
            <div className="text-center py-12 opacity-0 animate-pop-in" style={{ animationDelay: '200ms' }}>
              <div className="text-4xl mb-4 text-[#00aaff]/20" style={{ fontFamily: 'Orbitron, monospace' }}>≡</div>
              <p className="text-[10px] text-[#00aaff]/40" style={{ fontFamily: 'Rajdhani, sans-serif' }}>No warp zone anomalies discovered yet.</p>
              <p className="text-[9px] text-[#00aaff]/30 mt-2" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Enter Hyperspace mode to discover unique warp effects.</p>
            </div>
          ) : sortedHyperspaceEntries.map((entry, index) => <VisualCard key={entry.seed} entry={entry} index={index} />)
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
        @keyframes pop-in {
          0% { opacity: 0; transform: scale(0.8); filter: drop-shadow(0 0 20px rgba(170, 68, 255, 0.6)); }
          70% { transform: scale(1.02); }
          100% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 0px transparent); }
        }
        .animate-pop-in { animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>
    </div>
  );
};
