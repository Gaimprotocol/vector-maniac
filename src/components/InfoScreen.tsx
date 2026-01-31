import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicContext } from '@/contexts/MusicContext';
import { playPopSoundsWithDelays } from '@/utils/popSound';
import { 
  ArrowBackIcon, InfoIcon, TargetIcon, ShieldIcon, ZapIcon, 
  TouchIcon, AimIcon, PauseIcon, GridIcon, ShipIcon 
} from './VectorIcons';

type TabType = 'about' | 'objectives' | 'powerups' | 'arena' | 'bestiary' | 'controls';

// Custom power-up icons in green vector style
const ShieldPowerUpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="#00ff88" strokeWidth="1.5" fill="none">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M12 8v4M12 16h.01" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const NukePowerUpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="#00ff88" strokeWidth="1.5" fill="none">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="2" fill="#00ff88" />
    <line x1="12" y1="2" x2="12" y2="5" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="2" y1="12" x2="5" y2="12" />
    <line x1="19" y1="12" x2="22" y2="12" />
  </svg>
);

const DoublePointsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="#00ff88" strokeWidth="1.5" fill="none">
    <text x="12" y="16" textAnchor="middle" fill="#00ff88" fontSize="14" fontFamily="Orbitron" stroke="none">×2</text>
    <rect x="3" y="5" width="18" height="14" rx="2" />
  </svg>
);

const DoubleShotIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="#00ff88" strokeWidth="1.5" fill="none">
    <line x1="8" y1="20" x2="8" y2="4" />
    <polygon points="8 4 5 10 8 8 11 10 8 4" fill="#00ff88" />
    <line x1="16" y1="20" x2="16" y2="4" />
    <polygon points="16 4 13 10 16 8 19 10 16 4" fill="#00ff88" />
  </svg>
);

const SpeedBoostIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="#00ff88" strokeWidth="1.5" fill="none">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="none" />
    <line x1="3" y1="6" x2="7" y2="6" strokeLinecap="round" />
    <line x1="2" y1="10" x2="5" y2="10" strokeLinecap="round" />
    <line x1="3" y1="18" x2="7" y2="18" strokeLinecap="round" />
  </svg>
);

const WarpShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="#00ff88" strokeWidth="1.5" fill="none">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M8 12h8M12 8v8" strokeLinecap="round" />
  </svg>
);

const TimeWarpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="#00ff88" strokeWidth="1.5" fill="none">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 4l2 2M20 4l-2 2" strokeLinecap="round" />
  </svg>
);

const MagnetPulseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="#00ff88" strokeWidth="1.5" fill="none">
    <path d="M4 12a8 8 0 0 1 16 0" />
    <line x1="4" y1="12" x2="4" y2="18" />
    <line x1="20" y1="12" x2="20" y2="18" />
    <line x1="4" y1="15" x2="6" y2="15" />
    <line x1="18" y1="15" x2="20" y2="15" />
    <circle cx="12" cy="16" r="2" fill="#00ff88" />
  </svg>
);

// Enemy icons in green vector style
const DroneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="#00ff88" strokeWidth="1.5" fill="none">
    <polygon points="12 4 20 16 12 14 4 16 12 4" />
  </svg>
);

const ShooterIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="#00ff88" strokeWidth="1.5" fill="none">
    <polygon points="12 4 18 12 12 20 6 12 12 4" />
    <circle cx="12" cy="12" r="2" fill="#00ff88" />
  </svg>
);

const EliteIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="#00ff88" strokeWidth="1.5" fill="none">
    <polygon points="12 2 15 9 22 9 17 14 19 22 12 17 5 22 7 14 2 9 9 9 12 2" />
  </svg>
);

const DasherIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="#00ff88" strokeWidth="1.5" fill="none">
    <polygon points="20 12 8 6 12 12 8 18 20 12" fill="none" />
    <line x1="2" y1="10" x2="6" y2="12" strokeLinecap="round" />
    <line x1="2" y1="14" x2="6" y2="12" strokeLinecap="round" />
  </svg>
);

const SplitterIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="#00ff88" strokeWidth="1.5" fill="none">
    <circle cx="12" cy="8" r="4" />
    <circle cx="8" cy="18" r="3" />
    <circle cx="16" cy="18" r="3" />
    <line x1="12" y1="12" x2="8" y2="15" />
    <line x1="12" y1="12" x2="16" y2="15" />
  </svg>
);

const OrbiterIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="#00ff88" strokeWidth="1.5" fill="none">
    <circle cx="12" cy="12" r="3" fill="#00ff88" />
    <circle cx="12" cy="12" r="8" strokeDasharray="4 2" />
    <circle cx="12" cy="4" r="2" />
  </svg>
);

const SniperIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="#00ff88" strokeWidth="1.5" fill="none">
    <rect x="8" y="8" width="8" height="8" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <circle cx="12" cy="12" r="2" fill="#00ff88" />
  </svg>
);

const AnomalyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" stroke="#00ff88" strokeWidth="1.5" fill="none">
    <polygon points="12 3 19 7 19 15 12 19 5 15 5 7 12 3" />
    <text x="12" y="14" textAnchor="middle" fill="#00ff88" fontSize="8" fontFamily="Orbitron" stroke="none">?</text>
  </svg>
);

// Power-ups that actually exist in Vector Maniac (from types.ts)
const POWERUPS: { name: string; description: string; icon: React.ReactNode }[] = [
  { 
    name: 'SHIELD', 
    description: 'Absorbs one hit of damage',
    icon: <ShieldPowerUpIcon />
  },
  { 
    name: 'NUKE', 
    description: 'Destroys all enemies on screen',
    icon: <NukePowerUpIcon />
  },
  { 
    name: 'DOUBLE POINTS', 
    description: 'Doubles score for a limited time',
    icon: <DoublePointsIcon />
  },
  { 
    name: 'DOUBLE SHOT', 
    description: 'Fires two projectiles at once',
    icon: <DoubleShotIcon />
  },
  { 
    name: 'SPEED BOOST', 
    description: 'Increases movement speed',
    icon: <SpeedBoostIcon />
  },
  { 
    name: 'WARP SHIELD', 
    description: 'Absorbs 3 hits during hyperspace',
    icon: <WarpShieldIcon />
  },
  { 
    name: 'TIME WARP', 
    description: 'Slows all enemies temporarily',
    icon: <TimeWarpIcon />
  },
  { 
    name: 'MAGNET PULSE', 
    description: 'Pulls all salvage towards you',
    icon: <MagnetPulseIcon />
  },
];

// Enemies that exist in Vector Maniac (from types.ts VectorEnemy type)
const ENEMIES: { name: string; description: string; icon: React.ReactNode }[] = [
  { name: 'DRONE', description: 'Basic flying enemy with erratic movement', icon: <DroneIcon /> },
  { name: 'SHOOTER', description: 'Fires projectiles at the player', icon: <ShooterIcon /> },
  { name: 'ELITE', description: 'Stronger enemy with more health', icon: <EliteIcon /> },
  { name: 'DASHER', description: 'Fast enemy that charges in zigzag patterns', icon: <DasherIcon /> },
  { name: 'SPLITTER', description: 'Splits into two smaller enemies when destroyed', icon: <SplitterIcon /> },
  { name: 'ORBITER', description: 'Circles around the player at a distance', icon: <OrbiterIcon /> },
  { name: 'SNIPER', description: 'Stops and aims with a laser before firing', icon: <SniperIcon /> },
  { name: 'ANOMALY', description: 'Procedurally generated with unique abilities', icon: <AnomalyIcon /> },
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
    { id: 'arena', label: 'ARENA' },
    { id: 'bestiary', label: 'BESTIARY' },
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
                  {enemy.icon}
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
                  {powerup.icon}
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

        {activeTab === 'arena' && (
          <div className="space-y-4">
            <h2 
              className="text-[12px] text-[#ff4466] mb-3"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              ARENA BATTLE MODE
            </h2>
            <p 
              className="text-[9px] text-[#00ff88]/60 leading-relaxed"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              Enter the Arena and face off in tactical 1v1 ship battles against 
              AI opponents of increasing skill. Test your piloting abilities in 
              intense close-quarters combat!
            </p>
            
            <h3 
              className="text-[10px] text-[#00ff88] mt-4 mb-2"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              DIFFICULTY TIERS
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded border border-[#cd7f32]/30 bg-[#cd7f32]/5">
                <div className="w-3 h-3 rounded-full bg-[#cd7f32]" />
                <div>
                  <span className="text-[9px] text-[#cd7f32]" style={{ fontFamily: 'Orbitron, monospace' }}>BRONZE</span>
                  <p className="text-[7px] text-[#00ff88]/40" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Entry level - 50 scraps to enter</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded border border-[#c0c0c0]/30 bg-[#c0c0c0]/5">
                <div className="w-3 h-3 rounded-full bg-[#c0c0c0]" />
                <div>
                  <span className="text-[9px] text-[#c0c0c0]" style={{ fontFamily: 'Orbitron, monospace' }}>SILVER</span>
                  <p className="text-[7px] text-[#00ff88]/40" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Intermediate - 150 scraps to enter</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded border border-[#ffd700]/30 bg-[#ffd700]/5">
                <div className="w-3 h-3 rounded-full bg-[#ffd700]" />
                <div>
                  <span className="text-[9px] text-[#ffd700]" style={{ fontFamily: 'Orbitron, monospace' }}>GOLD</span>
                  <p className="text-[7px] text-[#00ff88]/40" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Advanced - 400 scraps to enter</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded border border-[#b9f2ff]/30 bg-[#b9f2ff]/5">
                <div className="w-3 h-3 rounded-full bg-[#b9f2ff]" />
                <div>
                  <span className="text-[9px] text-[#b9f2ff]" style={{ fontFamily: 'Orbitron, monospace' }}>DIAMOND</span>
                  <p className="text-[7px] text-[#00ff88]/40" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Expert - 1000 scraps to enter</p>
                </div>
              </div>
            </div>

            <h3 
              className="text-[10px] text-[#00ff88] mt-4 mb-2"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              ARENA POWER-UPS
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded border border-[#00ccff]/30 bg-[#00ccff]/5">
                <span className="text-[8px] text-[#00ccff]" style={{ fontFamily: 'Orbitron, monospace' }}>EMP BLAST</span>
                <p className="text-[7px] text-[#00ff88]/40" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Stuns opponent for 3 sec</p>
              </div>
              <div className="p-2 rounded border border-[#cc00ff]/30 bg-[#cc00ff]/5">
                <span className="text-[8px] text-[#cc00ff]" style={{ fontFamily: 'Orbitron, monospace' }}>PHASE SHIFT</span>
                <p className="text-[7px] text-[#00ff88]/40" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Teleport to safety</p>
              </div>
              <div className="p-2 rounded border border-[#00ff88]/30 bg-[#00ff88]/5">
                <span className="text-[8px] text-[#00ff88]" style={{ fontFamily: 'Orbitron, monospace' }}>SHIELD BOOST</span>
                <p className="text-[7px] text-[#00ff88]/40" style={{ fontFamily: 'Rajdhani, sans-serif' }}>Restores 30 hull</p>
              </div>
              <div className="p-2 rounded border border-[#ffaa00]/30 bg-[#ffaa00]/5">
                <span className="text-[8px] text-[#ffaa00]" style={{ fontFamily: 'Orbitron, monospace' }}>OVERDRIVE</span>
                <p className="text-[7px] text-[#00ff88]/40" style={{ fontFamily: 'Rajdhani, sans-serif' }}>2x fire rate for 5 sec</p>
              </div>
            </div>

            <p 
              className="text-[8px] text-[#ff4466]/60 mt-4 p-2 rounded border border-[#ff4466]/20"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              ⚠ FAIR PLAY: Ship upgrades are disabled in Arena. Both combatants 
              have equal base stats for balanced competition.
            </p>
          </div>
        )}

        {activeTab === 'bestiary' && (
          <div className="space-y-4">
            <h2 
              className="text-[12px] text-[#aa88ff] mb-3"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              ANOMALY BESTIARY
            </h2>
            <p 
              className="text-[9px] text-[#00ff88]/60 leading-relaxed"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              The Bestiary catalogs all procedurally generated anomalies you've 
              discovered during your journeys through the Vector Grid. Each 
              encounter is unique!
            </p>
            
            <h3 
              className="text-[10px] text-[#00ff88] mt-4 mb-2"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              DISCOVERY CATEGORIES
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-2 rounded border border-[#aa88ff]/20 bg-[#aa88ff]/5">
                <AnomalyIcon />
                <div>
                  <span className="text-[9px] text-[#aa88ff]" style={{ fontFamily: 'Orbitron, monospace' }}>CREATURES</span>
                  <p className="text-[7px] text-[#00ff88]/40" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    Unique procedural enemies with random shapes, behaviors and abilities. 
                    Each has a unique DNA seed that defines its characteristics.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 rounded border border-[#00ff88]/20 bg-[#00ff88]/5">
                <ShipIcon size={24} />
                <div>
                  <span className="text-[9px] text-[#00ff88]" style={{ fontFamily: 'Orbitron, monospace' }}>ALLIES</span>
                  <p className="text-[7px] text-[#00ff88]/40" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    Companions you've recruited to fight alongside you. They can be 
                    evolved to increase their power and abilities.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 rounded border border-[#00ccff]/20 bg-[#00ccff]/5">
                <GridIcon size={24} />
                <div>
                  <span className="text-[9px] text-[#00ccff]" style={{ fontFamily: 'Orbitron, monospace' }}>REALMS</span>
                  <p className="text-[7px] text-[#00ff88]/40" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    Procedural backgrounds with unique patterns like vortex, circuit, 
                    and glitch effects. Discovered as you progress.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 rounded border border-[#ff00ff]/20 bg-[#ff00ff]/5">
                <ZapIcon size={24} />
                <div>
                  <span className="text-[9px] text-[#ff00ff]" style={{ fontFamily: 'Orbitron, monospace' }}>WARP ZONES</span>
                  <p className="text-[7px] text-[#00ff88]/40" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                    Unique hyperspace visual effects including wormholes, auroras, 
                    and data streams discovered during warp travel.
                  </p>
                </div>
              </div>
            </div>

            <h3 
              className="text-[10px] text-[#ffd700] mt-4 mb-2"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              BOUNTY SYSTEM
            </h3>
            <p 
              className="text-[8px] text-[#00ff88]/50"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              Each newly discovered anomaly has a bounty reward! Collect 15-80 scraps 
              for each unique creature you catalog. Rarer anomalies yield higher bounties.
            </p>
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
