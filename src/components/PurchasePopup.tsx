import React from 'react';

interface PurchasePopupProps {
  type: 'success' | 'already_owned';
  productName: string;
  onClose: () => void;
}

export const PurchasePopup: React.FC<PurchasePopupProps> = ({
  type,
  productName,
  onClose,
}) => {
  const isSuccess = type === 'success';
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Darkened overlay */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup content */}
      <div 
        className={`relative z-10 w-[300px] border-4 rounded-lg p-6 text-center ${
          isSuccess ? 'border-green-400' : 'border-orange-400'
        }`}
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
          boxShadow: isSuccess 
            ? '0 0 40px rgba(0, 255, 100, 0.4), inset 0 0 20px rgba(0, 255, 100, 0.1)'
            : '0 0 40px rgba(255, 165, 0, 0.4), inset 0 0 20px rgba(255, 165, 0, 0.1)',
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
          className="text-5xl mb-4"
          style={{ 
            filter: `drop-shadow(0 0 20px ${isSuccess ? 'rgba(0, 255, 100, 0.8)' : 'rgba(255, 165, 0, 0.8)'})`,
          }}
        >
          {isSuccess ? '✅' : 'ℹ️'}
        </div>
        
        {/* Title */}
        <h2 
          className={`font-pixel text-lg mb-2 ${
            isSuccess ? 'text-green-400' : 'text-orange-400'
          }`}
          style={{ 
            textShadow: isSuccess 
              ? '0 0 20px rgba(0, 255, 100, 0.8)' 
              : '0 0 20px rgba(255, 165, 0, 0.8)',
          }}
        >
          {isSuccess ? 'PURCHASE SUCCESSFUL' : 'ALREADY OWNED'}
        </h2>
        
        {/* Product name */}
        <p className="font-pixel text-[10px] text-cyan-400 mb-2">
          {productName}
        </p>
        
        {/* Description */}
        <p className="font-pixel text-[9px] text-gray-400 mb-6">
          {isSuccess 
            ? 'Your purchase has been unlocked!' 
            : 'You already own this item.'}
        </p>
        
        {/* OK button */}
        <button
          onClick={onClose}
          className={`font-pixel text-sm text-black px-8 py-3 rounded-full 
                     transition-all duration-300 hover:scale-105 active:scale-95 ${
            isSuccess 
              ? 'bg-gradient-to-r from-green-400 to-green-500 hover:from-green-300 hover:to-green-400'
              : 'bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-300 hover:to-orange-400'
          }`}
          style={{
            boxShadow: isSuccess 
              ? '0 0 20px rgba(0, 255, 100, 0.5)'
              : '0 0 20px rgba(255, 165, 0, 0.5)',
          }}
        >
          OK
        </button>
        
        {/* Pixel border decoration */}
        <div className={`absolute top-2 left-2 w-2 h-2 ${isSuccess ? 'bg-green-400' : 'bg-orange-400'}`} />
        <div className={`absolute top-2 right-2 w-2 h-2 ${isSuccess ? 'bg-green-400' : 'bg-orange-400'}`} />
        <div className={`absolute bottom-2 left-2 w-2 h-2 ${isSuccess ? 'bg-green-400' : 'bg-orange-400'}`} />
        <div className={`absolute bottom-2 right-2 w-2 h-2 ${isSuccess ? 'bg-green-400' : 'bg-orange-400'}`} />
      </div>
    </div>
  );
};
