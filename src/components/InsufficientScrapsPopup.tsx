import React from 'react';
import { useNavigate } from 'react-router-dom';

interface InsufficientScrapsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  currentScraps: number;
  requiredScraps: number;
  itemName?: string;
}

export const InsufficientScrapsPopup: React.FC<InsufficientScrapsPopupProps> = ({
  isOpen,
  onClose,
  currentScraps,
  requiredScraps,
  itemName = 'this item',
}) => {
  const navigate = useNavigate();
  const shortage = requiredScraps - currentScraps;

  if (!isOpen) return null;

  const handleGoToShop = () => {
    onClose();
    navigate('/shop');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.85)' }}
      onClick={onClose}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              background: '#ff4444',
              opacity: Math.random() * 0.5 + 0.2,
              animation: `floatUp ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `-${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div 
        className="relative bg-gradient-to-b from-[#1a0808] to-[#0a0505] border-2 border-[#ff4444]/50 
                   rounded-lg p-6 max-w-sm mx-4 text-center"
        style={{
          boxShadow: '0 0 40px rgba(255, 68, 68, 0.3), inset 0 0 30px rgba(255, 68, 68, 0.1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Warning icon */}
        <div 
          className="text-4xl mb-4"
          style={{
            textShadow: '0 0 20px #ff4444',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mx-auto">
            <path 
              d="M12 2L2 20h20L12 2z" 
              stroke="#ff4444" 
              strokeWidth="2" 
              fill="none"
            />
            <path 
              d="M12 9v4M12 16v1" 
              stroke="#ff4444" 
              strokeWidth="2" 
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 
          className="text-lg text-[#ff6666] mb-2"
          style={{ 
            fontFamily: 'Orbitron, monospace',
            textShadow: '0 0 10px #ff4444',
          }}
        >
          INSUFFICIENT SCRAPS
        </h2>

        {/* Item name */}
        <p 
          className="text-[10px] text-[#ff8888]/70 mb-4"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
        >
          Cannot afford {itemName}
        </p>

        {/* Scrap comparison */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-center">
            <p 
              className="text-[8px] text-[#888] mb-1"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              YOU HAVE
            </p>
            <p 
              className="text-lg text-[#ff6666]"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              {currentScraps}
            </p>
          </div>
          
          <div className="text-[#ff4444]/50">→</div>
          
          <div className="text-center">
            <p 
              className="text-[8px] text-[#888] mb-1"
              style={{ fontFamily: 'Rajdhani, sans-serif' }}
            >
              NEED
            </p>
            <p 
              className="text-lg text-[#ffaa00]"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              {requiredScraps}
            </p>
          </div>
        </div>

        {/* Shortage */}
        <div 
          className="bg-[#ff4444]/10 border border-[#ff4444]/30 rounded px-4 py-2 mb-5"
        >
          <p 
            className="text-[10px] text-[#ff8888]"
            style={{ fontFamily: 'Rajdhani, sans-serif' }}
          >
            Missing <span className="text-[#ffaa00] font-bold">{shortage}</span> scraps
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 text-[10px] text-[#888] border border-[#444] rounded px-4 py-2
                       transition-all duration-300 hover:border-[#666] hover:text-[#aaa]"
            style={{ fontFamily: 'Orbitron, monospace' }}
          >
            CANCEL
          </button>
          
          <button
            onClick={handleGoToShop}
            className="flex-1 text-[10px] text-[#00ff88] border-2 border-[#00ff88]/60 rounded px-4 py-2
                       transition-all duration-300 hover:border-[#00ff88] hover:bg-[#00ff88]/10
                       relative overflow-hidden"
            style={{ 
              fontFamily: 'Orbitron, monospace',
              boxShadow: '0 0 15px rgba(0, 255, 136, 0.2)',
            }}
          >
            {/* Shimmer */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00ff88]/20 to-transparent"
              style={{ animation: 'shimmer 2s infinite' }}
            />
            <span className="relative z-10">◆ GET SCRAPS</span>
          </button>
        </div>

        {/* Hint */}
        <p 
          className="text-[8px] text-[#666] mt-4"
          style={{ fontFamily: 'Rajdhani, sans-serif' }}
        >
          Visit shop for scrap packs & daily bonus
        </p>
      </div>

      <style>{`
        @keyframes floatUp {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.6; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
