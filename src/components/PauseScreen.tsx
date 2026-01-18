import React from 'react';

interface PauseScreenProps {
  onResume: () => void;
  onQuit: () => void;
  musicMuted: boolean;
  sfxMuted: boolean;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
}

export const PauseScreen: React.FC<PauseScreenProps> = ({ 
  onResume, 
  onQuit, 
  musicMuted, 
  sfxMuted,
  onToggleMusic,
  onToggleSfx
}) => {
  return (
    <div 
      className="absolute inset-0 flex flex-col items-center justify-center p-4"
      style={{
        background: 'linear-gradient(180deg, rgba(0, 5, 16, 0.95) 0%, rgba(5, 0, 21, 0.95) 50%, rgba(16, 5, 32, 0.95) 100%)',
      }}
    >
      {/* Glowing orbs background */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full opacity-10 blur-3xl pointer-events-none"
           style={{ background: 'radial-gradient(circle, #ff00ff 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full opacity-10 blur-3xl pointer-events-none"
           style={{ background: 'radial-gradient(circle, #00ffff 0%, transparent 70%)' }} />

      {/* Pause Title */}
      <h2 
        className="font-vector font-bold text-3xl text-cyan-400 mb-8"
        style={{ 
          textShadow: '0 0 40px #00ffff, 0 0 80px #00ffff60',
          letterSpacing: '0.1em',
        }}
      >
        ⏸️ PAUSED
      </h2>

      {/* Buttons Container */}
      <div className="space-y-3 w-full max-w-xs">
        {/* Resume Button */}
        <button
          onClick={onResume}
          onTouchEnd={(e) => { e.preventDefault(); onResume(); }}
          className="font-vector font-semibold text-sm text-cyan-400 border-2 border-cyan-400/60 w-full px-6 py-3
                     transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-400/10 active:scale-95 uppercase tracking-wider"
          style={{ 
            boxShadow: '0 0 25px rgba(0, 255, 255, 0.25)',
            clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
          }}
        >
          ▶️ Resume
        </button>
        
        {/* Audio controls */}
        <div className="flex gap-2 w-full">
          <button
            onClick={onToggleMusic}
            onTouchEnd={(e) => { e.preventDefault(); onToggleMusic(); }}
            className={`font-tech font-semibold text-xs flex-1 py-2.5 border
                       transition-all duration-300 active:scale-95 uppercase
                       ${musicMuted 
                         ? 'text-gray-500 border-gray-500/50' 
                         : 'text-green-400 border-green-400/50 hover:border-green-400 hover:bg-green-400/10'
                       }`}
            style={{
              boxShadow: musicMuted ? 'none' : '0 0 15px rgba(74, 222, 128, 0.2)',
              clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
            }}
          >
            {musicMuted ? '🔇 Music' : '🎵 Music'}
          </button>
          <button
            onClick={onToggleSfx}
            onTouchEnd={(e) => { e.preventDefault(); onToggleSfx(); }}
            className={`font-tech font-semibold text-xs flex-1 py-2.5 border
                       transition-all duration-300 active:scale-95 uppercase
                       ${sfxMuted 
                         ? 'text-gray-500 border-gray-500/50' 
                         : 'text-green-400 border-green-400/50 hover:border-green-400 hover:bg-green-400/10'
                       }`}
            style={{
              boxShadow: sfxMuted ? 'none' : '0 0 15px rgba(74, 222, 128, 0.2)',
              clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
            }}
          >
            {sfxMuted ? '🔇 SFX' : '🔊 SFX'}
          </button>
        </div>
        
        {/* Quit Button */}
        <button
          onClick={onQuit}
          onTouchEnd={(e) => { e.preventDefault(); onQuit(); }}
          className="font-vector font-semibold text-sm text-red-400 border-2 border-red-400/60 w-full px-6 py-3
                     transition-all duration-300 hover:border-red-400 hover:bg-red-400/10 active:scale-95 uppercase tracking-wider"
          style={{ 
            boxShadow: '0 0 25px rgba(248, 113, 113, 0.25)',
            clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
          }}
        >
          🚪 Quit Mission
        </button>
      </div>
    </div>
  );
};
