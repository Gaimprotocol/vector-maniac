import React from 'react';
import { CheckIcon, ScrapIcon } from './VectorIcons';

interface PurchasePopupProps {
  type: 'success' | 'already_owned' | 'not_enough';
  productName: string;
  onClose: () => void;
}

export const PurchasePopup: React.FC<PurchasePopupProps> = ({
  type,
  productName,
  onClose,
}) => {
  const isSuccess = type === 'success';
  const isNotEnough = type === 'not_enough';
  
  const getColor = () => {
    if (isSuccess) return '#00ff88';
    if (isNotEnough) return '#ff4444';
    return '#ffaa00';
  };
  
  const color = getColor();
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Darkened overlay */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup content */}
      <div 
        className="relative z-10 w-[300px] border-2 rounded-lg p-6 text-center"
        style={{
          borderColor: color,
          background: 'linear-gradient(180deg, #051510 0%, #020a08 100%)',
          boxShadow: `0 0 40px ${color}40, inset 0 0 20px ${color}10`,
        }}
      >
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        
        {/* Icon */}
        <div 
          className="flex justify-center mb-4"
          style={{ filter: `drop-shadow(0 0 20px ${color})` }}
        >
          {isSuccess ? <CheckIcon size={48} /> : isNotEnough ? <ScrapIcon size={48} /> : <ScrapIcon size={48} />}
        </div>
        
        {/* Title */}
        <h2 
          className="text-lg mb-2"
          style={{ 
            fontFamily: 'Orbitron, monospace',
            color: color,
            textShadow: `0 0 20px ${color}80`,
          }}
        >
          {isSuccess ? 'UPGRADE COMPLETE' : isNotEnough ? 'NOT ENOUGH SCRAPS' : 'ALREADY MAXED'}
        </h2>
        
        {/* Product name */}
        <p 
          className="text-[10px] text-[#00ff88]/80 mb-2"
          style={{ fontFamily: 'Orbitron, monospace' }}
        >
          {productName}
        </p>
        
        {/* Description */}
        <p 
          className="text-[9px] text-[#00ff88]/40 mb-6"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
        >
          {isSuccess 
            ? 'Upgrade installed successfully!' 
            : isNotEnough
              ? 'Collect more scraps to purchase this upgrade.'
              : 'This upgrade is already at maximum level.'}
        </p>
        
        {/* OK button */}
        <button
          onClick={onClose}
          className="text-sm text-black px-8 py-3 rounded transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            fontFamily: 'Orbitron, monospace',
            background: color,
            boxShadow: `0 0 20px ${color}50`,
          }}
        >
          OK
        </button>
        
        {/* Corner decorations */}
        <div className="absolute top-2 left-2 w-2 h-2" style={{ background: color }} />
        <div className="absolute top-2 right-2 w-2 h-2" style={{ background: color }} />
        <div className="absolute bottom-2 left-2 w-2 h-2" style={{ background: color }} />
        <div className="absolute bottom-2 right-2 w-2 h-2" style={{ background: color }} />
      </div>
    </div>
  );
};
