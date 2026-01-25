import React from 'react';

interface PortalChoiceModalProps {
  onChooseSafe: () => void;
  onChooseRisk: () => void;
  segment: number;
}

export const PortalChoiceModal: React.FC<PortalChoiceModalProps> = ({
  onChooseSafe,
  onChooseRisk,
  segment
}) => {
  return (
    <div 
      className="absolute inset-0 flex flex-col items-center justify-center z-50"
      style={{ 
        background: 'radial-gradient(ellipse at center, rgba(10, 22, 40, 0.95) 0%, rgba(5, 8, 16, 0.98) 100%)'
      }}
    >
      {/* Title */}
      <h2 
        className="font-pixel text-2xl text-cyan-400 mb-2"
        style={{ textShadow: '0 0 20px #00e5ff' }}
      >
        SEGMENT {segment} COMPLETE
      </h2>
      
      <p className="font-pixel text-xs text-gray-400 mb-8">
        Choose your path forward
      </p>
      
      <div className="flex flex-col gap-4 w-[90%] max-w-[320px]">
        {/* Safe Portal */}
        <button
          className="flex flex-col items-center p-6 border-2 border-cyan-400/50 rounded-lg
                     transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-400/10
                     active:bg-cyan-400/20"
          style={{ 
            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.05) 0%, rgba(0, 100, 150, 0.1) 100%)',
            boxShadow: '0 0 30px rgba(0, 229, 255, 0.15)'
          }}
          onClick={onChooseSafe}
          onTouchEnd={(e) => { e.preventDefault(); onChooseSafe(); }}
        >
          <span className="font-pixel text-lg text-cyan-400 mb-2">⬡ SAFE PORTAL</span>
          <span className="font-pixel text-[10px] text-cyan-300">+1 Upgrade Pick</span>
          <span className="font-pixel text-[9px] text-gray-400 mt-1">
            Enemies: +5% HP, +5% Speed
          </span>
        </button>
        
        {/* Risk Portal */}
        <button
          className="flex flex-col items-center p-6 border-2 border-magenta/50 rounded-lg
                     transition-all duration-300 hover:border-magenta hover:bg-magenta/10
                     active:bg-magenta/20"
          style={{ 
            background: 'linear-gradient(135deg, rgba(255, 0, 255, 0.05) 0%, rgba(150, 0, 100, 0.1) 100%)',
            boxShadow: '0 0 30px rgba(255, 0, 255, 0.15)'
          }}
          onClick={onChooseRisk}
          onTouchEnd={(e) => { e.preventDefault(); onChooseRisk(); }}
        >
          <span className="font-pixel text-lg text-magenta mb-2">◈ RISK PORTAL</span>
          <span className="font-pixel text-[10px] text-pink-300">+2 Upgrade Picks</span>
          <span className="font-pixel text-[9px] text-gray-400 mt-1">
            Enemies: +15% HP, +10% Speed
          </span>
        </button>
      </div>
      
      <p className="font-pixel text-[8px] text-gray-500 mt-8">
        Higher risk = greater rewards
      </p>
    </div>
  );
};
