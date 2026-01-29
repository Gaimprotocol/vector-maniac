import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicContext } from '@/contexts/MusicContext';
import { playPopSoundsWithDelays } from '@/utils/popSound';
import { useBestiary, BestiaryEntry } from '@/hooks/useBestiary';
import { ArrowBackIcon } from './VectorIcons';

// Shape icons as simple SVG paths
const ShapeIcon: React.FC<{ shape: string; hue: number; saturation: number; size?: number }> = ({ 
  shape, hue, saturation, size = 40 
}) => {
  const color = `hsl(${hue}, ${saturation}%, 60%)`;
  const glowColor = `hsl(${hue}, ${saturation}%, 70%)`;
  
  const renderShape = () => {
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.35;
    
    switch (shape) {
      case 'triangle':
        return (
          <polygon 
            points={`${cx},${cy - r} ${cx - r * 0.866},${cy + r * 0.5} ${cx + r * 0.866},${cy + r * 0.5}`}
            fill="none"
            stroke={color}
            strokeWidth={2}
          />
        );
      case 'square':
        return (
          <rect 
            x={cx - r * 0.7} 
            y={cy - r * 0.7} 
            width={r * 1.4} 
            height={r * 1.4}
            fill="none"
            stroke={color}
            strokeWidth={2}
          />
        );
      case 'pentagon':
        const pentPoints = Array.from({ length: 5 }, (_, i) => {
          const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        }).join(' ');
        return <polygon points={pentPoints} fill="none" stroke={color} strokeWidth={2} />;
      case 'hexagon':
        const hexPoints = Array.from({ length: 6 }, (_, i) => {
          const angle = (i * 2 * Math.PI / 6) - Math.PI / 2;
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        }).join(' ');
        return <polygon points={hexPoints} fill="none" stroke={color} strokeWidth={2} />;
      case 'star':
        const starPoints = Array.from({ length: 10 }, (_, i) => {
          const angle = (i * Math.PI / 5) - Math.PI / 2;
          const rad = i % 2 === 0 ? r : r * 0.5;
          return `${cx + rad * Math.cos(angle)},${cy + rad * Math.sin(angle)}`;
        }).join(' ');
        return <polygon points={starPoints} fill="none" stroke={color} strokeWidth={2} />;
      case 'cross':
        return (
          <g stroke={color} strokeWidth={2}>
            <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} />
            <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} />
          </g>
        );
      case 'crescent':
        return (
          <path 
            d={`M ${cx + r * 0.3},${cy - r} 
                A ${r},${r} 0 1,1 ${cx + r * 0.3},${cy + r}
                A ${r * 0.7},${r * 0.7} 0 1,0 ${cx + r * 0.3},${cy - r}`}
            fill="none"
            stroke={color}
            strokeWidth={2}
          />
        );
      case 'spiral':
        return (
          <path 
            d={`M ${cx},${cy} 
                Q ${cx + r * 0.3},${cy - r * 0.3} ${cx + r * 0.5},${cy}
                Q ${cx + r * 0.7},${cy + r * 0.5} ${cx},${cy + r * 0.6}
                Q ${cx - r * 0.8},${cy + r * 0.4} ${cx - r * 0.7},${cy - r * 0.2}
                Q ${cx - r * 0.5},${cy - r * 0.8} ${cx + r * 0.2},${cy - r * 0.9}`}
            fill="none"
            stroke={color}
            strokeWidth={2}
          />
        );
      default:
        return <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={2} />;
    }
  };

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox={`0 0 ${size} ${size}`}
      style={{ filter: `drop-shadow(0 0 4px ${glowColor})` }}
    >
      {renderShape()}
      {/* Center question mark */}
      <text 
        x={size / 2} 
        y={size / 2 + 3} 
        textAnchor="middle" 
        fill={color}
        fontSize={size * 0.25}
        fontFamily="Orbitron, monospace"
      >
        ?
      </text>
    </svg>
  );
};

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
  return (
    <span style={{ color: info.color }}>
      {info.name}
    </span>
  );
};

const AnomalyCard: React.FC<{ entry: BestiaryEntry; index: number }> = ({ entry, index }) => {
  const color = `hsl(${entry.hue}, ${entry.saturation}%, 60%)`;
  
  return (
    <div 
      className="rounded-lg p-3 border opacity-0 animate-pop-in"
      style={{ 
        borderColor: `hsl(${entry.hue}, ${entry.saturation}%, 40%)`,
        background: `linear-gradient(135deg, hsl(${entry.hue}, ${entry.saturation}%, 5%) 0%, transparent 100%)`,
        animationDelay: `${200 + index * 50}ms`,
      }}
    >
      <div className="flex items-center gap-3">
        <ShapeIcon shape={entry.shape} hue={entry.hue} saturation={entry.saturation} size={48} />
        
        <div className="flex-1 min-w-0">
          <h3 
            className="text-[11px] font-bold truncate"
            style={{ fontFamily: 'Orbitron, monospace', color }}
          >
            {entry.name}
          </h3>
          
          <div 
            className="text-[8px] text-[#00ff88]/50 flex flex-wrap gap-x-2 mt-1"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            <span className="flex items-center gap-1">
              <span className="text-[#00ff88]/30">FORM:</span>
              <span className="text-[#00ff88]/70">{entry.shape.toUpperCase()}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-[#00ff88]/30">PATTERN:</span>
              <span className="text-[#00ff88]/70"><BehaviorLabel behavior={entry.behavior} /></span>
            </span>
          </div>
          
          <div 
            className="text-[8px] flex items-center gap-1 mt-0.5"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            <span className="text-[#00ff88]/30">ABILITY:</span>
            <AbilityLabel ability={entry.ability} />
          </div>
        </div>
        
        <div className="text-right">
          <div 
            className="text-[8px] text-[#00ff88]/40"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            <div>MET: {entry.timesEncountered}</div>
            <div className="text-[#ff4444]/60">KIA: {entry.timesDefeated}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BestiaryScreen: React.FC = () => {
  const navigate = useNavigate();
  const { hasEnteredGalaxy, enterGalaxy } = useMusicContext();
  const { entries, stats } = useBestiary();
  
  // Sort by most recently discovered
  const sortedEntries = [...entries].sort((a, b) => b.discoveredAt - a.discoveredAt);

  useEffect(() => {
    if (!hasEnteredGalaxy) {
      enterGalaxy();
    }
  }, [hasEnteredGalaxy, enterGalaxy]);

  useEffect(() => {
    playPopSoundsWithDelays([0, 50, 100, 150]);
  }, []);

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center pt-14 pb-16 px-4 overflow-y-auto"
      style={{ background: 'radial-gradient(ellipse at center, #0a0515 0%, #050210 70%, #020108 100%)' }}
    >
      {/* Floating particles - purple/magenta theme for anomalies */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              background: `hsl(${280 + Math.random() * 60}, 80%, 60%)`,
              opacity: Math.random() * 0.4 + 0.1,
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: `-${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Grid overlay - purple tint */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#aa44ff 1px, transparent 1px), linear-gradient(90deg, #aa44ff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Header */}
      <div className="relative z-10 w-full max-w-md pt-2.5">
        <button
          onClick={() => navigate('/')}
          className="text-[11px] tracking-wider text-[#aa88ff]/60 hover:text-[#aa88ff] mb-4 flex items-center gap-2 transition-colors opacity-0 animate-pop-in"
          style={{ fontFamily: 'Orbitron, monospace', animationDelay: '0ms' }}
        >
          <ArrowBackIcon size={14} glow={false} /> BACK TO MENU
        </button>

        <h1 
          className="text-2xl text-center mb-2 opacity-0 animate-pop-in tracking-widest"
          style={{ fontFamily: 'Orbitron, monospace', animationDelay: '50ms' }}
        >
          <span className="text-[#aa88ff]" style={{ textShadow: '0 0 20px #aa44ff, 0 0 40px #aa44ff50' }}>
            BESTIARY
          </span>
        </h1>

        <p 
          className="text-[8px] text-[#aa88ff]/40 text-center mb-4 tracking-[0.3em] opacity-0 animate-pop-in"
          style={{ fontFamily: 'Orbitron, monospace', animationDelay: '100ms' }}
        >
          ANOMALY ARCHIVE
        </p>

        {/* Stats bar */}
        <div 
          className="flex justify-center gap-6 mb-6 opacity-0 animate-pop-in"
          style={{ animationDelay: '150ms' }}
        >
          <div className="text-center">
            <div 
              className="text-lg text-[#aa88ff]"
              style={{ fontFamily: 'Orbitron, monospace', textShadow: '0 0 10px #aa44ff' }}
            >
              {stats.totalDiscovered}
            </div>
            <div 
              className="text-[7px] text-[#aa88ff]/40"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              DISCOVERED
            </div>
          </div>
          <div className="text-center">
            <div 
              className="text-lg text-[#ff8844]"
              style={{ fontFamily: 'Orbitron, monospace', textShadow: '0 0 10px #ff4400' }}
            >
              {stats.totalEncounters}
            </div>
            <div 
              className="text-[7px] text-[#ff8844]/40"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              ENCOUNTERS
            </div>
          </div>
          <div className="text-center">
            <div 
              className="text-lg text-[#ff4444]"
              style={{ fontFamily: 'Orbitron, monospace', textShadow: '0 0 10px #ff0000' }}
            >
              {stats.totalDefeated}
            </div>
            <div 
              className="text-[7px] text-[#ff4444]/40"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              TERMINATED
            </div>
          </div>
        </div>
      </div>

      {/* Entries list */}
      <div className="relative z-10 w-full max-w-md space-y-2 pb-8">
        {sortedEntries.length === 0 ? (
          <div 
            className="text-center py-12 opacity-0 animate-pop-in"
            style={{ animationDelay: '200ms' }}
          >
            <div 
              className="text-4xl mb-4 text-[#aa88ff]/20"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              ?
            </div>
            <p 
              className="text-[10px] text-[#aa88ff]/40"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              No anomalies discovered yet.
            </p>
            <p 
              className="text-[9px] text-[#aa88ff]/30 mt-2"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              Reach Map 3+ to encounter anomalies.
            </p>
          </div>
        ) : (
          sortedEntries.map((entry, index) => (
            <AnomalyCard key={entry.seed} entry={entry} index={index} />
          ))
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
            filter: drop-shadow(0 0 20px rgba(170, 68, 255, 0.6));
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
