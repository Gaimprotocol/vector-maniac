import React from 'react';

interface RewardedAdOverlayProps {
  progress: number;
  onSkip?: () => void;
}

export const RewardedAdOverlay: React.FC<RewardedAdOverlayProps> = ({ progress }) => {
  const remainingSeconds = Math.ceil((1 - progress) * 6);
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Dark background */}
      <div className="absolute inset-0 bg-black" />
      
      {/* Simulated ad content */}
      <div 
        className="relative z-10 w-[90%] max-w-lg text-center"
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
          border: '4px solid #00e5ff',
          borderRadius: '12px',
          padding: '40px 24px',
          boxShadow: '0 0 60px rgba(0, 229, 255, 0.4), inset 0 0 30px rgba(0, 229, 255, 0.1)',
        }}
      >
        {/* Scanlines */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10 rounded-lg"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)',
          }}
        />
        
        {/* Ad icon */}
        <div 
          className="text-6xl mb-6"
          style={{ 
            filter: 'drop-shadow(0 0 20px rgba(0, 229, 255, 0.8))',
            color: '#00e5ff',
            fontFamily: 'Orbitron, monospace',
          }}
        >
          ▶▶
        </div>
        
        {/* Title */}
        <h2 
          className="font-pixel text-xl text-cyan-400 mb-4"
          style={{ textShadow: '0 0 20px #00e5ff' }}
        >
          SIMULATED AD
        </h2>
        
        {/* Description */}
        <p className="font-pixel text-[10px] text-gray-400 mb-6">
          In a real app, a video ad would play here.
          <br />
          Your reward is coming...
        </p>
        
        {/* Progress bar */}
        <div 
          className="w-full h-4 rounded-full overflow-hidden mb-4"
          style={{ 
            background: 'rgba(0, 229, 255, 0.1)',
            border: '2px solid rgba(0, 229, 255, 0.3)',
          }}
        >
          <div 
            className="h-full transition-all duration-100"
            style={{ 
              width: `${progress * 100}%`,
              background: 'linear-gradient(90deg, #00e5ff, #00ff88)',
              boxShadow: '0 0 20px rgba(0, 229, 255, 0.8)',
            }}
          />
        </div>
        
        {/* Countdown */}
        <p className="font-pixel text-lg text-yellow-400">
          {remainingSeconds > 0 ? `${remainingSeconds}s` : 'COMPLETE!'}
        </p>
        
        {/* Pixel corners */}
        <div className="absolute top-2 left-2 w-3 h-3 bg-cyan-400" />
        <div className="absolute top-2 right-2 w-3 h-3 bg-cyan-400" />
        <div className="absolute bottom-2 left-2 w-3 h-3 bg-cyan-400" />
        <div className="absolute bottom-2 right-2 w-3 h-3 bg-cyan-400" />
      </div>
    </div>
  );
};
