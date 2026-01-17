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
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <h2 className="text-xl font-pixel text-primary neon-text-primary mb-6">
        PAUSED
      </h2>

      <div className="space-y-3">
        <button
          onClick={onResume}
          onTouchEnd={(e) => { e.preventDefault(); onResume(); }}
          className="retro-button font-pixel text-xs block w-full text-primary px-8 py-3 active:scale-95 transition-transform"
        >
          RESUME
        </button>
        
        {/* Audio controls */}
        <div className="flex gap-2 w-full">
          <button
            onClick={onToggleMusic}
            onTouchEnd={(e) => { e.preventDefault(); onToggleMusic(); }}
            className={`retro-button font-pixel text-[9px] flex-1 py-2 active:scale-95 transition-transform ${
              musicMuted 
                ? 'text-muted-foreground border-muted-foreground' 
                : 'text-accent border-accent'
            }`}
            style={{
              textShadow: musicMuted ? 'none' : '0 0 10px hsl(var(--accent))',
              boxShadow: musicMuted ? 'none' : '0 0 10px hsl(var(--accent) / 0.3)',
            }}
          >
            {musicMuted ? '🔇 MUSIC OFF' : '🎵 MUSIC ON'}
          </button>
          <button
            onClick={onToggleSfx}
            onTouchEnd={(e) => { e.preventDefault(); onToggleSfx(); }}
            className={`retro-button font-pixel text-[9px] flex-1 py-2 active:scale-95 transition-transform ${
              sfxMuted 
                ? 'text-muted-foreground border-muted-foreground' 
                : 'text-accent border-accent'
            }`}
            style={{
              textShadow: sfxMuted ? 'none' : '0 0 10px hsl(var(--accent))',
              boxShadow: sfxMuted ? 'none' : '0 0 10px hsl(var(--accent) / 0.3)',
            }}
          >
            {sfxMuted ? '🔇 SFX OFF' : '🔊 SFX ON'}
          </button>
        </div>
        
        <button
          onClick={onQuit}
          onTouchEnd={(e) => { e.preventDefault(); onQuit(); }}
          className="retro-button font-pixel text-xs block w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground px-8 py-3 active:scale-95 transition-transform"
          style={{
            textShadow: '0 0 10px hsl(0 100% 50%)',
            boxShadow: '0 0 10px hsl(0 100% 50% / 0.3)',
          }}
        >
          QUIT MISSION
        </button>
      </div>
    </div>
  );
};
