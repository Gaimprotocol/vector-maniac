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
        background: 'radial-gradient(ellipse at center, rgba(0, 30, 60, 0.95) 0%, rgba(0, 10, 30, 0.98) 100%)',
      }}
    >
      {/* Pause Title */}
      <h2 
        className="text-2xl font-pixel text-cyan-400 mb-6"
        style={{ 
          textShadow: '0 0 20px #00ffff, 0 0 40px #00ffff50',
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
          className="font-pixel text-xs w-full px-6 py-3 rounded-full border-2
                     transition-all duration-300 active:scale-95
                     border-cyan-400/50 text-cyan-400 
                     hover:bg-cyan-400/10 hover:border-cyan-400"
          style={{ 
            boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)',
          }}
        >
          ▶️ RESUME
        </button>
        
        {/* Audio controls */}
        <div className="flex gap-2 w-full">
          <button
            onClick={onToggleMusic}
            onTouchEnd={(e) => { e.preventDefault(); onToggleMusic(); }}
            className={`font-pixel text-[9px] flex-1 py-2 rounded-full border-2
                       transition-all duration-300 active:scale-95
                       ${musicMuted 
                         ? 'border-gray-500/50 text-gray-500' 
                         : 'border-green-400/50 text-green-400 hover:bg-green-400/10 hover:border-green-400'
                       }`}
            style={{
              boxShadow: musicMuted ? 'none' : '0 0 10px rgba(0, 255, 100, 0.3)',
            }}
          >
            {musicMuted ? '🔇 MUSIC' : '🎵 MUSIC'}
          </button>
          <button
            onClick={onToggleSfx}
            onTouchEnd={(e) => { e.preventDefault(); onToggleSfx(); }}
            className={`font-pixel text-[9px] flex-1 py-2 rounded-full border-2
                       transition-all duration-300 active:scale-95
                       ${sfxMuted 
                         ? 'border-gray-500/50 text-gray-500' 
                         : 'border-green-400/50 text-green-400 hover:bg-green-400/10 hover:border-green-400'
                       }`}
            style={{
              boxShadow: sfxMuted ? 'none' : '0 0 10px rgba(0, 255, 100, 0.3)',
            }}
          >
            {sfxMuted ? '🔇 SFX' : '🔊 SFX'}
          </button>
        </div>
        
        {/* Quit Button */}
        <button
          onClick={onQuit}
          onTouchEnd={(e) => { e.preventDefault(); onQuit(); }}
          className="font-pixel text-xs w-full px-6 py-3 rounded-full border-2
                     transition-all duration-300 active:scale-95
                     border-red-400/50 text-red-400 
                     hover:bg-red-400/10 hover:border-red-400"
          style={{ 
            boxShadow: '0 0 15px rgba(255, 50, 50, 0.3)',
          }}
        >
          🚪 QUIT MISSION
        </button>
      </div>
    </div>
  );
};
