import React, { useState } from 'react';
import { ShipIcon, SettingsIcon } from './VectorIcons';
import { ShipSwapModal } from './ShipSwapModal';

interface PauseScreenProps {
  onResume: () => void;
  onQuit: () => void;
  musicMuted: boolean;
  sfxMuted: boolean;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
  onShipChange?: (shipId: string) => void;
}

export const PauseScreen: React.FC<PauseScreenProps> = ({ 
  onResume, 
  onQuit, 
  musicMuted, 
  sfxMuted,
  onToggleMusic,
  onToggleSfx,
  onShipChange
}) => {
  const [showShipSwap, setShowShipSwap] = useState(false);

  const handleShipChange = (shipId: string) => {
    onShipChange?.(shipId);
  };

  return (
    <div 
      className="absolute inset-0 flex flex-col items-center justify-center p-4 z-50"
      style={{ background: 'radial-gradient(ellipse at center, #051510 0%, #020a08 70%, #010504 100%)' }}
    >
      {/* Ship Swap Modal */}
      <ShipSwapModal 
        isOpen={showShipSwap} 
        onClose={() => setShowShipSwap(false)}
        onShipChange={handleShipChange}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Pause Title */}
      <h2 
        className="text-2xl mb-8 tracking-widest"
        style={{ 
          fontFamily: 'Orbitron, monospace',
          color: '#00ff88',
          textShadow: '0 0 20px #00ff88, 0 0 40px #00ff8850',
        }}
      >
        ⏸ PAUSED
      </h2>

      {/* Buttons Container */}
      <div className="space-y-3 w-full max-w-xs relative z-10">
        {/* Resume Button */}
        <button
          onClick={onResume}
          onTouchEnd={(e) => { e.preventDefault(); onResume(); }}
          className="text-sm border-2 rounded w-full px-6 py-3
                     transition-all duration-300 hover:bg-[#00ff88]/10 active:scale-95 uppercase tracking-wider
                     flex items-center justify-center gap-2"
          style={{ 
            fontFamily: 'Orbitron, monospace',
            color: '#00ff88',
            borderColor: 'rgba(0, 255, 136, 0.5)',
            boxShadow: '0 0 20px rgba(0, 255, 136, 0.2)',
          }}
        >
          <ShipIcon size={16} /> Resume
        </button>
        
        {/* Switch Ship Button */}
        <button
          onClick={() => setShowShipSwap(true)}
          onTouchEnd={(e) => { e.preventDefault(); setShowShipSwap(true); }}
          className="text-sm border rounded w-full px-6 py-3
                     transition-all duration-300 hover:bg-[#44aaff]/10 active:scale-95 uppercase tracking-wider
                     flex items-center justify-center gap-2"
          style={{ 
            fontFamily: 'Orbitron, monospace',
            color: '#44aaff',
            borderColor: 'rgba(68, 170, 255, 0.4)',
            boxShadow: '0 0 15px rgba(68, 170, 255, 0.15)',
          }}
        >
          ⚡ Switch Ship
        </button>
        
        {/* Audio controls */}
        <div className="flex gap-2 w-full">
          <button
            onClick={onToggleMusic}
            onTouchEnd={(e) => { e.preventDefault(); onToggleMusic(); }}
            className={`text-[10px] flex-1 py-2.5 border rounded
                       transition-all duration-300 active:scale-95 uppercase
                       flex items-center justify-center gap-1`}
            style={{
              fontFamily: 'Orbitron, monospace',
              color: musicMuted ? 'rgba(0, 255, 136, 0.3)' : '#00ff88',
              borderColor: musicMuted ? 'rgba(0, 255, 136, 0.15)' : 'rgba(0, 255, 136, 0.4)',
              boxShadow: musicMuted ? 'none' : '0 0 15px rgba(0, 255, 136, 0.15)',
            }}
          >
            <SettingsIcon size={12} /> {musicMuted ? 'MUSIC OFF' : 'MUSIC ON'}
          </button>
          <button
            onClick={onToggleSfx}
            onTouchEnd={(e) => { e.preventDefault(); onToggleSfx(); }}
            className={`text-[10px] flex-1 py-2.5 border rounded
                       transition-all duration-300 active:scale-95 uppercase
                       flex items-center justify-center gap-1`}
            style={{
              fontFamily: 'Orbitron, monospace',
              color: sfxMuted ? 'rgba(0, 255, 136, 0.3)' : '#00ff88',
              borderColor: sfxMuted ? 'rgba(0, 255, 136, 0.15)' : 'rgba(0, 255, 136, 0.4)',
              boxShadow: sfxMuted ? 'none' : '0 0 15px rgba(0, 255, 136, 0.15)',
            }}
          >
            <SettingsIcon size={12} /> {sfxMuted ? 'SFX OFF' : 'SFX ON'}
          </button>
        </div>
        
        {/* Quit Button */}
        <button
          onClick={onQuit}
          onTouchEnd={(e) => { e.preventDefault(); onQuit(); }}
          className="text-[11px] border rounded w-full px-6 py-3
                     transition-all duration-300 hover:bg-[#ff4444]/10 active:scale-95 uppercase tracking-wider"
          style={{ 
            fontFamily: 'Orbitron, monospace',
            color: '#ff6666',
            borderColor: 'rgba(255, 68, 68, 0.4)',
            boxShadow: '0 0 15px rgba(255, 68, 68, 0.15)',
          }}
        >
          🚪 Quit Mission
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
};
