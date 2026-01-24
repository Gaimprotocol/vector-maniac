import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicContext } from '@/contexts/MusicContext';
import { playPopSoundsWithDelays } from '@/utils/popSound';
import { 
  ArrowBackIcon, InfoIcon, TargetIcon, ShieldIcon, ZapIcon, 
  TouchIcon, AimIcon, PauseIcon, GridIcon, ShipIcon 
} from './VectorIcons';

type TabType = 'about' | 'objectives' | 'powerups' | 'controls';

const POWERUPS = [
  { name: 'FORCE FIELD', description: 'Destroys enemies on contact for 4 seconds' },
  { name: 'HEALTH', description: 'Repairs hull damage' },
  { name: 'HOMING MISSILES', description: 'Auto-targeting missiles for 6 seconds' },
  { name: 'SHIELD', description: 'Invincibility for 8 seconds' },
  { name: 'MEGA BOMB', description: 'Destroys all enemies on screen' },
  { name: 'TRIPLE SHOT', description: 'Three projectiles for 5 seconds' },
  { name: 'ELECTRIC PULSE', description: 'Damages all visible enemies' },
  { name: 'ESCORT PLANES', description: 'Allied ships assist you for 6 seconds' },
];

const ENEMIES = [
  { name: 'TURRETS', description: 'Stationary defenses on terrain' },
  { name: 'DRONES', description: 'Flying enemies with erratic movement' },
  { name: 'BOMBERS', description: 'Drop explosives from above' },
  { name: 'SNIPERS', description: 'Precise long-range attackers' },
  { name: 'TANKS', description: 'Heavy ground units with big guns' },
  { name: 'LEECHES', description: 'Attach to civilians - rescue quickly!' },
];

export const InfoScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const { hasEnteredGalaxy, enterGalaxy } = useMusicContext();

  useEffect(() => {
    if (!hasEnteredGalaxy) {
      enterGalaxy();
    }
  }, [hasEnteredGalaxy, enterGalaxy]);

  useEffect(() => {
    playPopSoundsWithDelays([0, 50, 100, 150, 200, 250, 300, 350]);
  }, []);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'about', label: 'ABOUT' },
    { id: 'objectives', label: 'MISSION' },
    { id: 'powerups', label: 'POWER-UPS' },
    { id: 'controls', label: 'CONTROLS' },
  ];

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center pt-14 pb-16 px-4 overflow-y-auto"
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

      {/* Grid overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Header */}
      <div className="relative z-10 w-full max-w-md pt-2.5">
        <button
          onClick={() => navigate('/')}
          className="text-[11px] tracking-wider text-[#00ff88]/60 hover:text-[#00ff88] mb-4 flex items-center gap-2 transition-colors opacity-0 animate-pop-in"
          style={{ fontFamily: 'Orbitron, monospace', animationDelay: '0ms' }}
        >
          <ArrowBackIcon size={14} glow={false} /> BACK TO MENU
        </button>

        <h1 
          className="text-2xl text-center mb-2 opacity-0 animate-pop-in tracking-widest"
          style={{ fontFamily: 'Orbitron, monospace', animationDelay: '50ms' }}
        >
          <span className="text-[#00ff88]" style={{ textShadow: '0 0 20px #00ff88, 0 0 40px #00ff8850' }}>
            SYSTEM INFO
          </span>
        </h1>

        <p 
          className="text-[8px] text-[#00ff88]/40 text-center mb-6 tracking-[0.3em] opacity-0 animate-pop-in"
          style={{ fontFamily: 'Orbitron, monospace', animationDelay: '100ms' }}
        >
          VECTOR MANIAC MANUAL
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="relative z-10 w-full max-w-md flex justify-center gap-2 mb-4 flex-wrap">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-[9px] px-3 py-1.5 rounded transition-all duration-300 opacity-0 animate-pop-in ${
              activeTab === tab.id
                ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]'
                : 'text-[#00ff88]/50 border border-[#00ff88]/30 hover:border-[#00ff88]/60 hover:text-[#00ff88]/80'
            }`}
            style={{ fontFamily: 'Orbitron, monospace', animationDelay: `${150 + index * 50}ms` }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div 
        className="relative z-10 w-full max-w-md rounded-lg p-5 min-h-[300px] mb-8 opacity-0 animate-pop-in"
        style={{ animationDelay: '350ms' }}
      >
        {activeTab === 'about' && (
          <div className="space-y-4">
            <h2 
              className="text-[12px] text-[#00ff88] mb-3"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              THE STORY
            </h2>
            <p 
              className="text-[9px] text-[#00ff88]/60 leading-relaxed"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              In the digital void of the VECTOR GRID, rogue data streams threaten to 
              corrupt the core systems. As an elite Vector Pilot, you must navigate 
              infinite procedural mazes, destroy hostile code fragments, and survive 
              the endless onslaught.
            </p>
            <p 
              className="text-[9px] text-[#00ff88]/60 leading-relaxed"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              Your ship, equipped with advanced vector-based weapons, is the last 
              line of defense. Upgrade your systems, unlock new ships, and push 
              your high score to the limit.
            </p>
            
            <h2 
              className="text-[12px] text-[#00ff88] mt-6 mb-3"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              ENEMIES
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {ENEMIES.map((enemy) => (
                <div key={enemy.name} className="flex items-center gap-2">
                  <TargetIcon size={24} />
                  <div>
                    <span 
                      className="text-[9px] text-[#00ff88]"
                      style={{ fontFamily: 'Orbitron, monospace' }}
                    >
                      {enemy.name}
                    </span>
                    <p 
                      className="text-[7px] text-[#00ff88]/40"
                      style={{ fontFamily: 'Rajdhani, sans-serif' }}
                    >
                      {enemy.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'objectives' && (
          <div className="space-y-4">
            <h2 
              className="text-[12px] text-[#00ff88] mb-3"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              PRIMARY OBJECTIVES
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <ShipIcon size={24} />
                <div>
                  <h3 
                    className="text-[10px] text-[#00ff88]"
                    style={{ fontFamily: 'Orbitron, monospace' }}
                  >
                    SURVIVE THE GRID
                  </h3>
                  <p 
                    className="text-[8px] text-[#00ff88]/50"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  >
                    Navigate through endless waves of enemies. The longer you 
                    survive, the higher your score multiplier.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <TargetIcon size={24} />
                <div>
                  <h3 
                    className="text-[10px] text-[#00ff88]"
                    style={{ fontFamily: 'Orbitron, monospace' }}
                  >
                    DESTROY HOSTILES
                  </h3>
                  <p 
                    className="text-[8px] text-[#00ff88]/50"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  >
                    Eliminate enemy code fragments to earn points and collect 
                    scraps for permanent upgrades.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ZapIcon size={24} />
                <div>
                  <h3 
                    className="text-[10px] text-[#00ff88]"
                    style={{ fontFamily: 'Orbitron, monospace' }}
                  >
                    COLLECT POWER-UPS
                  </h3>
                  <p 
                    className="text-[8px] text-[#00ff88]/50"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  >
                    Grab power-ups to temporarily enhance your ship's abilities 
                    and turn the tide of battle.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <GridIcon size={24} />
                <div>
                  <h3 
                    className="text-[10px] text-[#00ff88]"
                    style={{ fontFamily: 'Orbitron, monospace' }}
                  >
                    UPGRADE YOUR SHIP
                  </h3>
                  <p 
                    className="text-[8px] text-[#00ff88]/50"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  >
                    Spend scraps in the Workshop to permanently improve your 
                    ship's weapons, armor, and systems.
                  </p>
                </div>
              </div>
            </div>

            <h2 
              className="text-[12px] text-[#ff4444] mt-5 mb-3 flex items-center gap-2"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              <ShieldIcon size={16} /> HAZARDS
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-2 rounded border border-[#ff4444]/20 bg-[#ff4444]/5">
                <ZapIcon size={24} />
                <div>
                  <h3 
                    className="text-[10px] text-[#ff6666]"
                    style={{ fontFamily: 'Orbitron, monospace' }}
                  >
                    GRID BOUNDARIES
                  </h3>
                  <p 
                    className="text-[8px] text-[#00ff88]/50"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  >
                    The edges of the vector grid are dangerous. Stay within bounds 
                    to avoid system damage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'powerups' && (
          <div className="space-y-3">
            <h2 
              className="text-[12px] text-[#00ff88] mb-3"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              COLLECTIBLE POWER-UPS
            </h2>
            
            <div className="grid gap-2">
              {POWERUPS.map((powerup) => (
                <div 
                  key={powerup.name}
                  className="flex items-center gap-3 p-2 rounded border border-[#00ff88]/20"
                  style={{ background: 'rgba(0, 255, 136, 0.03)' }}
                >
                  <ZapIcon size={24} />
                  <div>
                    <span 
                      className="text-[9px] text-[#00ff88]"
                      style={{ fontFamily: 'Orbitron, monospace' }}
                    >
                      {powerup.name}
                    </span>
                    <p 
                      className="text-[7px] text-[#00ff88]/40"
                      style={{ fontFamily: 'Rajdhani, sans-serif' }}
                    >
                      {powerup.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'controls' && (
          <div className="space-y-4">
            <h2 
              className="text-[12px] text-[#00ff88] mb-3"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              TOUCH CONTROLS
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-2 rounded border border-[#00ff88]/20 bg-[#00ff88]/5">
                <TouchIcon size={24} />
                <div>
                  <h3 
                    className="text-[10px] text-[#00ff88]"
                    style={{ fontFamily: 'Orbitron, monospace' }}
                  >
                    TOUCH & DRAG
                  </h3>
                  <p 
                    className="text-[8px] text-[#00ff88]/50"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  >
                    Touch anywhere to move your ship. The ship follows your finger 
                    with a slight offset for visibility.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 rounded border border-[#00ff88]/20 bg-[#00ff88]/5">
                <AimIcon size={24} />
                <div>
                  <h3 
                    className="text-[10px] text-[#00ff88]"
                    style={{ fontFamily: 'Orbitron, monospace' }}
                  >
                    AUTO-FIRE
                  </h3>
                  <p 
                    className="text-[8px] text-[#00ff88]/50"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  >
                    Your ship fires automatically while touching the screen. 
                    Focus on positioning and dodging!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 rounded border border-[#00ff88]/20 bg-[#00ff88]/5">
                <PauseIcon size={24} />
                <div>
                  <h3 
                    className="text-[10px] text-[#00ff88]"
                    style={{ fontFamily: 'Orbitron, monospace' }}
                  >
                    PAUSE
                  </h3>
                  <p 
                    className="text-[8px] text-[#00ff88]/50"
                    style={{ fontFamily: 'Rajdhani, sans-serif' }}
                  >
                    Tap the pause button in the top corner to pause the game 
                    at any time.
                  </p>
                </div>
              </div>
            </div>

            <h2 
              className="text-[12px] text-[#00ff88] mt-4 mb-3"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              KEYBOARD (DESKTOP)
            </h2>
            <div 
              className="grid grid-cols-2 gap-2 text-[8px] text-[#00ff88]/60"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              <div>WASD / Arrows - Move</div>
              <div>Space - Fire</div>
              <div>P / Esc - Pause</div>
            </div>
          </div>
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
          0% {
            opacity: 0;
            transform: scale(0.8);
            filter: drop-shadow(0 0 20px rgba(0, 255, 136, 0.6));
          }
          70% {
            transform: scale(1.02);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: drop-shadow(0 0 0px transparent);
          }
        }
        .animate-pop-in {
          animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
};
