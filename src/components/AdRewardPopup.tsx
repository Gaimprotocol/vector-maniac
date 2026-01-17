import React from 'react';
import { AdReward } from '@/hooks/useRewardedAds';

interface AdRewardPopupProps {
  reward: AdReward;
  onClose: () => void;
}

export const AdRewardPopup: React.FC<AdRewardPopupProps> = ({ reward, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Darkened overlay */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup content */}
      <div 
        className="relative z-10 w-[300px] border-4 border-green-400 rounded-lg p-6 text-center"
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
          boxShadow: '0 0 40px rgba(0, 255, 100, 0.4), inset 0 0 20px rgba(0, 255, 100, 0.1)',
        }}
      >
        {/* Scanlines overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          }}
        />
        
        {/* Icon */}
        <div 
          className="text-5xl mb-4 animate-bounce"
          style={{ 
            filter: 'drop-shadow(0 0 20px rgba(0, 255, 100, 0.8))',
          }}
        >
          {reward.icon}
        </div>
        
        {/* Title */}
        <h2 
          className="font-pixel text-lg text-green-400 mb-2"
          style={{ textShadow: '0 0 20px rgba(0, 255, 100, 0.8)' }}
        >
          FREE REWARD!
        </h2>
        
        {/* Reward name */}
        <p className="font-pixel text-sm text-cyan-400 mb-2">
          {reward.name}
        </p>
        
        {/* Description */}
        <p className="font-pixel text-[9px] text-gray-400 mb-6">
          {reward.description}
        </p>
        
        {/* OK button */}
        <button
          onClick={onClose}
          className="font-pixel text-sm text-black bg-gradient-to-r from-green-400 to-green-500 
                     px-8 py-3 rounded-full transition-all duration-300 
                     hover:from-green-300 hover:to-green-400 hover:scale-105 active:scale-95"
          style={{
            boxShadow: '0 0 20px rgba(0, 255, 100, 0.5)',
          }}
        >
          AWESOME!
        </button>
        
        {/* Pixel border decoration */}
        <div className="absolute top-2 left-2 w-2 h-2 bg-green-400" />
        <div className="absolute top-2 right-2 w-2 h-2 bg-green-400" />
        <div className="absolute bottom-2 left-2 w-2 h-2 bg-green-400" />
        <div className="absolute bottom-2 right-2 w-2 h-2 bg-green-400" />
      </div>
    </div>
  );
};
