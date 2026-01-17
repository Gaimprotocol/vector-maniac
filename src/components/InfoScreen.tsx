import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicContext } from '@/contexts/MusicContext';
import { ShopIcon } from './ShopIcons';
import { playPopSoundsWithDelays } from '@/utils/popSound';
import { GameIcon } from './GameIcon';

type TabType = 'about' | 'objectives' | 'powerups' | 'controls';

const POWERUPS = [
  { variant: 'forceField', name: 'FORCE FIELD', color: '#00aaff', description: 'Destroys enemies on contact for 4 seconds' },
  { variant: 'health', name: 'HEALTH', color: '#ff4488', description: 'Repairs hull damage' },
  { variant: 'homingMissile', name: 'HOMING MISSILES', color: '#ff8800', description: 'Auto-targeting missiles for 6 seconds' },
  { variant: 'shield', name: 'SHIELD', color: '#00ccff', description: 'Invincibility for 8 seconds' },
  { variant: 'megaBomb', name: 'MEGA BOMB', color: '#ffff00', description: 'Destroys all enemies on screen' },
  { variant: 'tripleShot', name: 'TRIPLE SHOT', color: '#ff00ff', description: 'Three projectiles for 5 seconds' },
  { variant: 'electricPulse', name: 'ELECTRIC PULSE', color: '#00ffff', description: 'Damages all visible enemies' },
  { variant: 'escort', name: 'ESCORT PLANES', color: '#88ff00', description: 'Allied ships assist you for 6 seconds' },
];

const ENEMIES = [
  { variant: 'turret', name: 'TURRETS', description: 'Stationary defenses on terrain' },
  { variant: 'drone', name: 'DRONES', description: 'Flying enemies with erratic movement' },
  { variant: 'bomber', name: 'BOMBERS', description: 'Drop explosives from above' },
  { variant: 'sniper', name: 'SNIPERS', description: 'Precise long-range attackers' },
  { variant: 'tank', name: 'TANKS', description: 'Heavy ground units with big guns' },
  { variant: 'leech', name: 'LEECHES', description: 'Attach to civilians - rescue quickly!' },
  { variant: 'hostilePerson', name: 'HOSTILE SOLDIERS', description: 'Ground troops that fire at you' },
];

export const InfoScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const { hasEnteredGalaxy, enterGalaxy } = useMusicContext();

  // If user navigates directly to info without entering galaxy, auto-enter
  useEffect(() => {
    if (!hasEnteredGalaxy) {
      enterGalaxy();
    }
  }, [hasEnteredGalaxy, enterGalaxy]);

  // Play pop sounds on mount for animations
  useEffect(() => {
    // Delays match the animationDelay values: 0, 50, 100, 150-300 (tabs), 350ms
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
      style={{ 
        background: 'radial-gradient(ellipse at center, #0a1628 0%, #050810 70%, #020305 100%)'
      }}
    >
      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              background: i % 3 === 0 ? '#00e5ff' : i % 3 === 1 ? '#ff00ff' : '#ffffff',
              opacity: Math.random() * 0.5 + 0.2,
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: `-${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 w-full max-w-md pt-2.5">
        <button
          onClick={() => navigate('/')}
          className="font-pixel text-[10px] text-cyan-400/70 hover:text-cyan-400 mb-4 flex items-center gap-2 opacity-0 animate-pop-in"
          style={{ animationDelay: '0ms' }}
        >
          ← BACK TO MENU
        </button>

        <h1 className="font-pixel text-2xl text-center mb-2 opacity-0 animate-pop-in" style={{ animationDelay: '50ms' }}>
          <span className="text-magenta" style={{ textShadow: '0 0 20px #ff00ff' }}>
            GALACTIC
          </span>{' '}
          <span className="text-cyan-400" style={{ textShadow: '0 0 20px #00e5ff' }}>
            INFO
          </span>
        </h1>

        <p className="font-pixel text-[8px] text-gray-500 text-center mb-6 tracking-wider opacity-0 animate-pop-in" style={{ animationDelay: '100ms' }}>
          LEARN THE WAYS OF THE VOID
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="relative z-10 w-full max-w-md flex justify-center gap-2 mb-4 flex-wrap">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`font-pixel text-[9px] px-3 py-1.5 rounded-full transition-all duration-300 opacity-0 animate-pop-in ${
              activeTab === tab.id
                ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400'
                : 'text-gray-500 border border-gray-600 hover:border-gray-400 hover:text-gray-400'
            }`}
            style={{ animationDelay: `${150 + index * 50}ms` }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div 
        className="relative z-10 w-full max-w-md rounded-lg p-5 min-h-[300px] mb-8 opacity-0 animate-pop-in"
        style={{
          animationDelay: '350ms',
        }}
      >
        {activeTab === 'about' && (
          <div className="space-y-4">
            <h2 className="font-pixel text-[12px] text-cyan-400 mb-3">THE STORY</h2>
            <p className="font-pixel text-[9px] text-gray-400 leading-relaxed">
              In the year 3087, humanity's last frontier colonies are under attack by the 
              VOID ARMADA. As an elite rescue pilot, you must navigate treacherous 
              galactic zones, rescue stranded survivors, and destroy enemy forces.
            </p>
            <p className="font-pixel text-[9px] text-gray-400 leading-relaxed">
              Your ship, the NEON STRIKER, is equipped with advanced weapons and the 
              ability to enter special combat zones including lunar surfaces, underwater 
              bases, and fortified bunkers.
            </p>
            
            <h2 className="font-pixel text-[12px] text-cyan-400 mt-6 mb-3">ENEMIES</h2>
            <div className="grid grid-cols-2 gap-3">
              {ENEMIES.map((enemy) => (
                <div key={enemy.name} className="flex items-center gap-2">
                  <GameIcon type="enemy" variant={enemy.variant} size={28} />
                  <div>
                    <span className="font-pixel text-[9px] text-magenta">{enemy.name}</span>
                    <p className="font-pixel text-[7px] text-gray-500">{enemy.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'objectives' && (
          <div className="space-y-4">
            <h2 className="font-pixel text-[12px] text-cyan-400 mb-3">PRIMARY OBJECTIVES</h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <ShopIcon type="rescue" size={24} />
                <div>
                  <h3 className="font-pixel text-[10px] text-yellow-400">RESCUE CIVILIANS</h3>
                  <p className="font-pixel text-[8px] text-gray-500">
                    Fly close to stranded survivors to rescue them. They auto-rescue when 
                    your ship passes directly above them.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShopIcon type="destroy" size={24} />
                <div>
                  <h3 className="font-pixel text-[10px] text-red-400">DESTROY ENEMIES</h3>
                  <p className="font-pixel text-[8px] text-gray-500">
                    Eliminate enemy forces to clear the path and earn points. 
                    Different enemy types require different tactics.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <GameIcon type="pickup" variant="forceField" size={24} />
                <div>
                  <h3 className="font-pixel text-[10px] text-cyan-400">USE FORCE FIELD</h3>
                  <p className="font-pixel text-[8px] text-gray-500">
                    Collect force field power-ups to destroy enemies 
                    on contact. The field lasts 4 seconds.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShopIcon type="galaxy" size={24} />
                <div>
                  <h3 className="font-pixel text-[10px] text-cyan-400">COMPLETE SPECIAL MISSIONS</h3>
                  <p className="font-pixel text-[8px] text-gray-500">
                    Every few maps, enter special zones: defend bunkers, drive 
                    moon rovers, or pilot submarines in underwater missions.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="font-pixel text-[12px] text-red-400 mt-5 mb-3 flex items-center gap-2">
              <ShopIcon type="hazard" size={16} /> HAZARDS
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-2 rounded border border-red-500/30 bg-red-500/5">
                <ShopIcon type="fire" size={24} />
                <div>
                  <h3 className="font-pixel text-[10px] text-red-400">HAZARDOUS TERRAIN</h3>
                  <p className="font-pixel text-[8px] text-gray-500">
                    Some zones have deadly walls! Look for red pulsing terrain - 
                    touching it causes damage. A "COLLISION WARNING" appears in these areas.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 rounded border border-orange-500/30 bg-orange-500/5">
                <ShopIcon type="rock" size={24} />
                <div>
                  <h3 className="font-pixel text-[10px] text-orange-400">FALLING DEBRIS</h3>
                  <p className="font-pixel text-[8px] text-gray-500">
                    In certain caves and ruins, rocks fall from above! Watch for 
                    red pulsing debris and dodge carefully to avoid damage.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 rounded border border-cyan-500/30 bg-cyan-500/5">
                <ShopIcon type="lightning" size={24} />
                <div>
                  <h3 className="font-pixel text-[10px] text-cyan-400">HYPERSPACE BURSTS</h3>
                  <p className="font-pixel text-[8px] text-gray-500">
                    Your ship periodically enters hyperspace - speed triples and 
                    stars blur past you. Stay focused during these intense moments!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'powerups' && (
          <div className="space-y-3">
            <h2 className="font-pixel text-[12px] text-cyan-400 mb-3">COLLECTIBLE POWER-UPS</h2>
            
            <div className="grid gap-2">
              {POWERUPS.map((powerup) => (
                <div 
                  key={powerup.name}
                  className="flex items-center gap-3 p-2 rounded border border-gray-700/50"
                  style={{ background: `${powerup.color}08` }}
                >
                  <GameIcon type="pickup" variant={powerup.variant} size={28} />
                  <div>
                    <span 
                      className="font-pixel text-[9px]"
                      style={{ color: powerup.color }}
                    >
                      {powerup.name}
                    </span>
                    <p className="font-pixel text-[7px] text-gray-500">{powerup.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'controls' && (
          <div className="space-y-4">
            <h2 className="font-pixel text-[12px] text-cyan-400 mb-3">TOUCH CONTROLS</h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-2 rounded border border-cyan-400/20 bg-cyan-400/5">
                <ShopIcon type="touch" size={24} />
                <div>
                  <h3 className="font-pixel text-[10px] text-cyan-400">TOUCH & DRAG</h3>
                  <p className="font-pixel text-[8px] text-gray-500">
                    Touch anywhere to move your ship. The ship follows your finger 
                    with a slight offset so you can see where you're going.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 rounded border border-yellow-400/20 bg-yellow-400/5">
                <ShopIcon type="autofire" size={24} />
                <div>
                  <h3 className="font-pixel text-[10px] text-yellow-400">AUTO-FIRE</h3>
                  <p className="font-pixel text-[8px] text-gray-500">
                    Your ship fires automatically while touching the screen. 
                    No need to tap - just focus on dodging!
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 rounded border border-magenta/20 bg-magenta/5">
                <ShopIcon type="bomb" size={24} />
                <div>
                  <h3 className="font-pixel text-[10px] text-magenta">DOUBLE-TAP</h3>
                  <p className="font-pixel text-[8px] text-gray-500">
                    Quick double-tap to drop a bomb. Bombs fall downward and 
                    explode on impact - great for ground targets.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2 rounded border border-gray-400/20 bg-gray-400/5">
                <ShopIcon type="pause" size={24} />
                <div>
                  <h3 className="font-pixel text-[10px] text-gray-400">PAUSE</h3>
                  <p className="font-pixel text-[8px] text-gray-500">
                    Tap the pause button in the top corner to pause the game 
                    at any time.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="font-pixel text-[12px] text-cyan-400 mt-4 mb-3">KEYBOARD (DESKTOP)</h2>
            <div className="grid grid-cols-2 gap-2 text-[8px] font-pixel text-gray-500">
              <div>WASD / Arrows - Move</div>
              <div>Space - Fire</div>
              <div>X - Drop Bomb</div>
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
            transform: scale(0.5);
            filter: drop-shadow(0 0 30px rgba(0, 229, 255, 0.8)) drop-shadow(0 0 60px rgba(255, 0, 255, 0.5));
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(0, 229, 255, 0.6)) drop-shadow(0 0 40px rgba(255, 0, 255, 0.3));
          }
          70% {
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: drop-shadow(0 0 0px transparent);
          }
        }
        .animate-pop-in {
          animation: pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
};