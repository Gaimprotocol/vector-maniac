import React, { useEffect, useState, useRef } from 'react';

interface LegendaryUnlockAnimationProps {
  onComplete: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  type: 'spark' | 'glow' | 'star';
}

export const LegendaryUnlockAnimation: React.FC<LegendaryUnlockAnimationProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'burst' | 'reveal' | 'text' | 'fade'>('burst');
  const [particles, setParticles] = useState<Particle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());

  // Generate initial burst particles
  useEffect(() => {
    const initialParticles: Particle[] = [];
    const colors = ['#ffd700', '#ffaa00', '#ffffff', '#00ff88', '#ffee88'];
    
    // Explosion burst
    for (let i = 0; i < 80; i++) {
      const angle = (i / 80) * Math.PI * 2;
      const speed = 3 + Math.random() * 8;
      initialParticles.push({
        id: i,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 4,
        life: 1,
        maxLife: 60 + Math.random() * 40,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: Math.random() > 0.7 ? 'star' : 'spark',
      });
    }
    
    // Floating ambient particles
    for (let i = 0; i < 40; i++) {
      initialParticles.push({
        id: 80 + i,
        x: (Math.random() - 0.5) * 400,
        y: (Math.random() - 0.5) * 400,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -0.5 - Math.random() * 1,
        size: 1 + Math.random() * 2,
        life: 1,
        maxLife: 100 + Math.random() * 100,
        color: colors[Math.floor(Math.random() * 2)],
        type: 'glow',
      });
    }
    
    setParticles(initialParticles);
  }, []);

  // Animation phases
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    timers.push(setTimeout(() => setPhase('reveal'), 300));
    timers.push(setTimeout(() => setPhase('text'), 800));
    timers.push(setTimeout(() => setPhase('fade'), 3500));
    timers.push(setTimeout(() => onComplete(), 4500));
    
    return () => timers.forEach(t => clearTimeout(t));
  }, [onComplete]);

  // Canvas particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const animate = () => {
      if (!running) return;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      setParticles(prev => {
        const updated = prev.map(p => {
          const newLife = p.life - (1 / p.maxLife);
          return {
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vx: p.vx * 0.98,
            vy: p.vy * 0.98 + (p.type === 'glow' ? -0.02 : 0),
            life: newLife,
          };
        }).filter(p => p.life > 0);

        // Draw particles
        updated.forEach(p => {
          const screenX = centerX + p.x;
          const screenY = centerY + p.y;
          const alpha = p.life;
          
          ctx.save();
          ctx.globalAlpha = alpha;
          
          if (p.type === 'star') {
            // Draw star shape
            ctx.fillStyle = p.color;
            ctx.translate(screenX, screenY);
            ctx.rotate(Date.now() * 0.005 + p.id);
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
              const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
              const outerX = Math.cos(angle) * p.size * 1.5;
              const outerY = Math.sin(angle) * p.size * 1.5;
              const innerAngle = angle + Math.PI / 5;
              const innerX = Math.cos(innerAngle) * p.size * 0.6;
              const innerY = Math.sin(innerAngle) * p.size * 0.6;
              if (i === 0) ctx.moveTo(outerX, outerY);
              else ctx.lineTo(outerX, outerY);
              ctx.lineTo(innerX, innerY);
            }
            ctx.closePath();
            ctx.fill();
          } else if (p.type === 'glow') {
            // Soft glow particle
            const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, p.size * 3);
            gradient.addColorStop(0, p.color);
            gradient.addColorStop(0.5, p.color + '80');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(screenX, screenY, p.size * 3, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Regular spark
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(screenX, screenY, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          
          ctx.restore();
        });

        // Add new floating particles
        if (Math.random() > 0.7 && updated.length < 150) {
          const colors = ['#ffd700', '#ffaa00', '#ffffff'];
          updated.push({
            id: Date.now() + Math.random(),
            x: (Math.random() - 0.5) * 500,
            y: 250,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -1 - Math.random() * 2,
            size: 1 + Math.random() * 2,
            life: 1,
            maxLife: 80 + Math.random() * 60,
            color: colors[Math.floor(Math.random() * colors.length)],
            type: 'glow',
          });
        }

        return updated;
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500 ${
        phase === 'fade' ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a12 50%, #000000 100%)' }}
    >
      {/* Canvas for particles */}
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600} 
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Radial gold glow */}
      <div 
        className={`absolute transition-all duration-1000 ${
          phase !== 'burst' ? 'opacity-60 scale-100' : 'opacity-0 scale-50'
        }`}
        style={{
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, rgba(255, 170, 0, 0.1) 40%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />

      {/* Rotating hexagon ring */}
      <svg 
        className={`absolute w-64 h-64 transition-all duration-1000 ${
          phase !== 'burst' ? 'opacity-40 scale-100' : 'opacity-0 scale-0'
        }`}
        style={{ animation: 'spin 10s linear infinite' }}
        viewBox="0 0 100 100"
      >
        <polygon 
          points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" 
          fill="none" 
          stroke="#ffd700" 
          strokeWidth="0.5"
          opacity="0.6"
        />
      </svg>

      {/* Inner rotating triangle */}
      <svg 
        className={`absolute w-40 h-40 transition-all duration-1000 ${
          phase !== 'burst' ? 'opacity-30 scale-100' : 'opacity-0 scale-0'
        }`}
        style={{ animation: 'spin 8s linear infinite reverse' }}
        viewBox="0 0 100 100"
      >
        <polygon 
          points="50,10 90,80 10,80" 
          fill="none" 
          stroke="#00ff88" 
          strokeWidth="0.5"
          opacity="0.5"
        />
      </svg>

      {/* Diamond symbol */}
      <div 
        className={`absolute transition-all duration-700 ${
          phase === 'reveal' || phase === 'text' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
        }`}
        style={{
          fontSize: '80px',
          color: '#ffd700',
          textShadow: '0 0 40px #ffd700, 0 0 80px #ffaa00, 0 0 120px #ff880050',
          animation: phase === 'text' ? 'pulse 2s ease-in-out infinite' : 'none',
        }}
      >
        ◆
      </div>

      {/* LEGENDARY UNLOCKED text */}
      <div 
        className={`absolute flex flex-col items-center transition-all duration-700 ${
          phase === 'text' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
        style={{ marginTop: '180px' }}
      >
        <h1 
          className="text-3xl tracking-[0.4em] mb-2"
          style={{ 
            fontFamily: 'Orbitron, monospace',
            background: 'linear-gradient(180deg, #ffffff 0%, #ffd700 50%, #ffaa00 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 20px #ffd700)',
          }}
        >
          LEGENDARY
        </h1>
        <h2 
          className="text-xl tracking-[0.3em]"
          style={{ 
            fontFamily: 'Orbitron, monospace',
            color: '#00ff88',
            textShadow: '0 0 20px #00ff88, 0 0 40px #00ff8850',
          }}
        >
          UNLOCKED
        </h2>
        
        {/* OMEGA PRIME subtitle */}
        <div 
          className="mt-6 px-6 py-2 rounded-full border"
          style={{
            borderColor: '#ffd700',
            background: 'linear-gradient(180deg, rgba(255, 215, 0, 0.1) 0%, transparent 100%)',
          }}
        >
          <span 
            className="text-sm tracking-widest"
            style={{ 
              fontFamily: 'Orbitron, monospace',
              color: '#ffd700',
            }}
          >
            OMEGA PRIME + 5000 SCRAPS
          </span>
        </div>

        {/* Bonus list */}
        <div 
          className="mt-4 text-center"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
        >
          <p className="text-[11px] text-[#00ff88]/70">
            ◆ All ships unlocked ◆ All skins unlocked ◆ All modes unlocked
          </p>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-[#ffd700]/30" />
      <div className="absolute top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-[#ffd700]/30" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-[#ffd700]/30" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-[#ffd700]/30" />

      {/* Skip hint */}
      <button 
        onClick={onComplete}
        className="absolute bottom-12 text-[10px] text-[#ffd700]/40 hover:text-[#ffd700]/80 transition-colors"
        style={{ fontFamily: 'Orbitron, monospace' }}
      >
        TAP TO CONTINUE
      </button>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
};