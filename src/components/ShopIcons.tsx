import React from 'react';

// Icon types for shop, equipment, and info panels
type ShopIconType = 'mothership_skins' | 'ships_mega_pack' | 'soundtrack_pack' | 'survival_mode' | 
                    'ultimate_edition' | 'neon_ships' | 'remove_ads' | 'mega_ships_header' | 
                    'soundtracks_header' | 'skins_header' | 'locked' | 'playing' |
                    'rescue' | 'destroy' | 'galaxy' | 'hazard' | 'fire' | 'rock' | 'lightning' |
                    'touch' | 'autofire' | 'bomb' | 'pause';

interface ShopIconProps {
  type: string;
  size?: number;
  owned?: boolean;
}

export const ShopIcon: React.FC<ShopIconProps> = ({ type, size = 32, owned = false }) => {
  const opacity = owned ? 0.6 : 1;
  
  // Higher resolution pixel art icons (16x16 grid for better detail)
  const renderPixelIcon = () => {
    switch (type) {
      case 'mothership_skins':
        // Palette/paint icon
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity, imageRendering: 'pixelated' }}>
            <rect x="2" y="2" width="12" height="12" rx="2" fill="#ff00ff" opacity="0.3" />
            <rect x="3" y="3" width="4" height="4" fill="#00ffff" />
            <rect x="8" y="3" width="4" height="4" fill="#ffff00" />
            <rect x="3" y="8" width="4" height="4" fill="#00ff00" />
            <rect x="8" y="8" width="4" height="4" fill="#ff6600" />
            <rect x="5" y="5" width="2" height="2" fill="#ffffff" opacity="0.5" />
            <rect x="10" y="5" width="1" height="1" fill="#ffffff" opacity="0.5" />
          </svg>
        );
        
      case 'ships_mega_pack':
        // Spaceship icon
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity, imageRendering: 'pixelated' }}>
            <rect x="6" y="1" width="4" height="2" fill="#00ffff" />
            <rect x="5" y="3" width="6" height="2" fill="#00ddff" />
            <rect x="3" y="5" width="10" height="3" fill="#00bbff" />
            <rect x="4" y="8" width="8" height="3" fill="#0099ff" />
            <rect x="1" y="10" width="3" height="4" fill="#ff6600" />
            <rect x="12" y="10" width="3" height="4" fill="#ff6600" />
            <rect x="6" y="11" width="4" height="4" fill="#ff4400" />
            <rect x="7" y="4" width="2" height="1" fill="#ffffff" opacity="0.6" />
          </svg>
        );
        
      case 'soundtrack_pack':
        // Music note icon
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity, imageRendering: 'pixelated' }}>
            <rect x="10" y="1" width="4" height="2" fill="#ff66ff" />
            <rect x="12" y="3" width="2" height="6" fill="#ff00ff" />
            <rect x="6" y="4" width="6" height="2" fill="#ff88cc" />
            <rect x="6" y="6" width="2" height="5" fill="#ff00ff" />
            <rect x="2" y="10" width="5" height="4" fill="#ff00ff" />
            <rect x="9" y="8" width="5" height="4" fill="#ff00ff" />
            <rect x="3" y="11" width="2" height="2" fill="#ff66ff" />
            <rect x="10" y="9" width="2" height="2" fill="#ff66ff" />
          </svg>
        );
        
      case 'survival_mode':
        // Infinity symbol
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity, imageRendering: 'pixelated' }}>
            <rect x="2" y="5" width="2" height="2" fill="#ff9900" />
            <rect x="1" y="7" width="2" height="3" fill="#ff9900" />
            <rect x="2" y="10" width="2" height="2" fill="#ff9900" />
            <rect x="4" y="7" width="2" height="3" fill="#ffaa00" />
            <rect x="6" y="5" width="4" height="2" fill="#ff9900" />
            <rect x="6" y="10" width="4" height="2" fill="#ff9900" />
            <rect x="10" y="7" width="2" height="3" fill="#ffaa00" />
            <rect x="12" y="5" width="2" height="2" fill="#ff9900" />
            <rect x="13" y="7" width="2" height="3" fill="#ff9900" />
            <rect x="12" y="10" width="2" height="2" fill="#ff9900" />
          </svg>
        );
        
      case 'ultimate_edition':
        // Crown icon
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity, imageRendering: 'pixelated' }}>
            <rect x="1" y="4" width="2" height="2" fill="#ffdd00" />
            <rect x="6" y="2" width="4" height="2" fill="#ffdd00" />
            <rect x="13" y="4" width="2" height="2" fill="#ffdd00" />
            <rect x="1" y="6" width="14" height="2" fill="#ffcc00" />
            <rect x="2" y="8" width="12" height="4" fill="#ffaa00" />
            <rect x="2" y="12" width="12" height="2" fill="#ff8800" />
            <rect x="4" y="9" width="2" height="2" fill="#ff0000" />
            <rect x="7" y="9" width="2" height="2" fill="#00ff00" />
            <rect x="10" y="9" width="2" height="2" fill="#0088ff" />
          </svg>
        );
        
      case 'neon_ships':
        // Rainbow/neon burst
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity, imageRendering: 'pixelated' }}>
            <rect x="6" y="1" width="4" height="3" fill="#ff0000" />
            <rect x="10" y="3" width="3" height="3" fill="#ff8800" />
            <rect x="12" y="6" width="3" height="4" fill="#ffff00" />
            <rect x="10" y="10" width="3" height="3" fill="#00ff00" />
            <rect x="6" y="12" width="4" height="3" fill="#0088ff" />
            <rect x="3" y="10" width="3" height="3" fill="#8800ff" />
            <rect x="1" y="6" width="3" height="4" fill="#ff00ff" />
            <rect x="3" y="3" width="3" height="3" fill="#ff0088" />
            <rect x="6" y="6" width="4" height="4" fill="#ffffff" />
          </svg>
        );
        
      case 'remove_ads':
        // No-ads icon
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity, imageRendering: 'pixelated' }}>
            <rect x="4" y="1" width="8" height="2" fill="#ff4444" />
            <rect x="2" y="3" width="2" height="2" fill="#ff4444" />
            <rect x="12" y="3" width="2" height="2" fill="#ff4444" />
            <rect x="1" y="5" width="2" height="6" fill="#ff4444" />
            <rect x="13" y="5" width="2" height="6" fill="#ff4444" />
            <rect x="2" y="11" width="2" height="2" fill="#ff4444" />
            <rect x="12" y="11" width="2" height="2" fill="#ff4444" />
            <rect x="4" y="13" width="8" height="2" fill="#ff4444" />
            <rect x="4" y="4" width="2" height="2" fill="#ff6666" />
            <rect x="10" y="4" width="2" height="2" fill="#ff6666" />
            <rect x="6" y="6" width="4" height="4" fill="#ff6666" />
            <rect x="4" y="10" width="2" height="2" fill="#ff6666" />
            <rect x="10" y="10" width="2" height="2" fill="#ff6666" />
          </svg>
        );
        
      case 'mega_ships_header':
        // Rocket ship for equipment header
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity, imageRendering: 'pixelated' }}>
            <rect x="6" y="1" width="4" height="2" fill="#ffdd00" />
            <rect x="5" y="3" width="6" height="2" fill="#ffcc00" />
            <rect x="3" y="5" width="10" height="4" fill="#ffaa00" />
            <rect x="4" y="9" width="8" height="3" fill="#ff8800" />
            <rect x="1" y="11" width="4" height="4" fill="#ff4400" />
            <rect x="11" y="11" width="4" height="4" fill="#ff4400" />
            <rect x="6" y="12" width="4" height="4" fill="#ff2200" />
            <rect x="7" y="4" width="2" height="2" fill="#ffffff" opacity="0.4" />
          </svg>
        );
        
      case 'soundtracks_header':
        // Music notes for equipment header
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity, imageRendering: 'pixelated' }}>
            <rect x="10" y="1" width="4" height="2" fill="#ff66aa" />
            <rect x="12" y="3" width="2" height="6" fill="#ff44aa" />
            <rect x="6" y="4" width="6" height="2" fill="#ff88cc" />
            <rect x="6" y="6" width="2" height="5" fill="#ff44aa" />
            <rect x="2" y="10" width="5" height="4" fill="#ff00aa" />
            <rect x="9" y="8" width="5" height="4" fill="#ff00aa" />
            <rect x="3" y="11" width="2" height="2" fill="#ff66cc" />
            <rect x="10" y="9" width="2" height="2" fill="#ff66cc" />
          </svg>
        );
        
      case 'skins_header':
        // Paint palette for equipment header
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity, imageRendering: 'pixelated' }}>
            <rect x="2" y="2" width="12" height="12" rx="2" fill="#00ddff" opacity="0.3" />
            <rect x="3" y="3" width="4" height="4" fill="#ff00ff" />
            <rect x="8" y="3" width="4" height="4" fill="#ffff00" />
            <rect x="3" y="8" width="4" height="4" fill="#00ff00" />
            <rect x="8" y="8" width="4" height="4" fill="#ff6600" />
            <rect x="4" y="4" width="2" height="2" fill="#ff66ff" />
            <rect x="9" y="4" width="2" height="2" fill="#ffff88" />
          </svg>
        );
        
      case 'locked':
        // Lock icon
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity, imageRendering: 'pixelated' }}>
            <rect x="4" y="2" width="2" height="5" fill="#666677" />
            <rect x="10" y="2" width="2" height="5" fill="#666677" />
            <rect x="6" y="1" width="4" height="2" fill="#666677" />
            <rect x="2" y="7" width="12" height="8" fill="#888899" />
            <rect x="6" y="9" width="4" height="4" fill="#444455" />
            <rect x="7" y="10" width="2" height="2" fill="#666677" />
          </svg>
        );
        
      case 'playing':
        // Speaker/sound icon
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity, imageRendering: 'pixelated' }}>
            <rect x="1" y="5" width="3" height="6" fill="#00ff88" />
            <rect x="4" y="3" width="2" height="10" fill="#00ff88" />
            <rect x="6" y="1" width="2" height="14" fill="#00ff88" />
            <rect x="10" y="4" width="2" height="2" fill="#00ff88" />
            <rect x="10" y="10" width="2" height="2" fill="#00ff88" />
            <rect x="12" y="2" width="2" height="2" fill="#00ff88" />
            <rect x="12" y="12" width="2" height="2" fill="#00ff88" />
            <rect x="14" y="6" width="2" height="4" fill="#00ff88" />
          </svg>
        );
        
      // Info screen icons
      case 'rescue':
        // People/rescue icon
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity, imageRendering: 'pixelated' }}>
            <circle cx="5" cy="4" r="2" fill="#ffdd00" />
            <rect x="3" y="7" width="4" height="5" fill="#ffdd00" />
            <rect x="2" y="12" width="2" height="3" fill="#ffdd00" />
            <rect x="5" y="12" width="2" height="3" fill="#ffdd00" />
            <circle cx="11" cy="4" r="2" fill="#ffdd00" />
            <rect x="9" y="7" width="4" height="5" fill="#ffdd00" />
            <rect x="8" y="12" width="2" height="3" fill="#ffdd00" />
            <rect x="11" y="12" width="2" height="3" fill="#ffdd00" />
          </svg>
        );
        
      case 'destroy':
        // Skull icon
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity, imageRendering: 'pixelated' }}>
            <rect x="4" y="2" width="8" height="2" fill="#ff4444" />
            <rect x="3" y="4" width="10" height="6" fill="#ff4444" />
            <rect x="4" y="10" width="8" height="2" fill="#ff4444" />
            <rect x="4" y="5" width="3" height="3" fill="#220000" />
            <rect x="9" y="5" width="3" height="3" fill="#220000" />
            <rect x="5" y="6" width="1" height="1" fill="#ff6666" />
            <rect x="10" y="6" width="1" height="1" fill="#ff6666" />
            <rect x="6" y="12" width="1" height="2" fill="#ff4444" />
            <rect x="9" y="12" width="1" height="2" fill="#ff4444" />
          </svg>
        );
        
      case 'galaxy':
        // Galaxy/stars icon
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity, imageRendering: 'pixelated' }}>
            <rect x="7" y="1" width="2" height="2" fill="#00ffff" />
            <rect x="6" y="3" width="4" height="2" fill="#00ddff" />
            <rect x="3" y="5" width="10" height="2" fill="#00bbff" />
            <rect x="1" y="7" width="14" height="2" fill="#0099ff" />
            <rect x="3" y="9" width="10" height="2" fill="#00bbff" />
            <rect x="6" y="11" width="4" height="2" fill="#00ddff" />
            <rect x="7" y="13" width="2" height="2" fill="#00ffff" />
            <rect x="2" y="3" width="1" height="1" fill="#ffffff" />
            <rect x="13" y="4" width="1" height="1" fill="#ffffff" />
            <rect x="12" y="11" width="1" height="1" fill="#ffffff" />
          </svg>
        );
        
      case 'hazard':
        // Warning triangle
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity, imageRendering: 'pixelated' }}>
            <rect x="7" y="2" width="2" height="2" fill="#ff4444" />
            <rect x="6" y="4" width="4" height="2" fill="#ff4444" />
            <rect x="5" y="6" width="6" height="2" fill="#ff4444" />
            <rect x="4" y="8" width="8" height="2" fill="#ff4444" />
            <rect x="3" y="10" width="10" height="2" fill="#ff4444" />
            <rect x="2" y="12" width="12" height="2" fill="#ff4444" />
            <rect x="7" y="6" width="2" height="4" fill="#ffff00" />
            <rect x="7" y="11" width="2" height="1" fill="#ffff00" />
          </svg>
        );
        
      case 'fire':
        // Fire icon
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity, imageRendering: 'pixelated' }}>
            <rect x="7" y="1" width="2" height="2" fill="#ff4400" />
            <rect x="6" y="3" width="4" height="2" fill="#ff6600" />
            <rect x="5" y="5" width="6" height="2" fill="#ff8800" />
            <rect x="4" y="7" width="8" height="3" fill="#ffaa00" />
            <rect x="3" y="10" width="10" height="3" fill="#ffcc00" />
            <rect x="4" y="13" width="8" height="2" fill="#ffdd00" />
            <rect x="7" y="8" width="2" height="3" fill="#ffff00" />
            <rect x="6" y="11" width="4" height="2" fill="#ffff88" />
          </svg>
        );
        
      case 'rock':
        // Rock/debris icon
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity, imageRendering: 'pixelated' }}>
            <rect x="5" y="2" width="6" height="2" fill="#886644" />
            <rect x="3" y="4" width="10" height="3" fill="#aa8866" />
            <rect x="2" y="7" width="12" height="4" fill="#996655" />
            <rect x="3" y="11" width="10" height="3" fill="#775544" />
            <rect x="5" y="5" width="2" height="2" fill="#bbaa88" />
            <rect x="9" y="8" width="3" height="2" fill="#664433" />
          </svg>
        );
        
      case 'lightning':
        // Lightning bolt
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity, imageRendering: 'pixelated' }}>
            <rect x="8" y="1" width="4" height="2" fill="#00ffff" />
            <rect x="6" y="3" width="4" height="2" fill="#00ffff" />
            <rect x="4" y="5" width="6" height="2" fill="#00ffff" />
            <rect x="6" y="7" width="6" height="2" fill="#00ffff" />
            <rect x="8" y="9" width="4" height="2" fill="#00ffff" />
            <rect x="6" y="11" width="4" height="2" fill="#00ffff" />
            <rect x="4" y="13" width="4" height="2" fill="#00ffff" />
            <rect x="7" y="5" width="2" height="6" fill="#88ffff" />
          </svg>
        );
        
      case 'touch':
        // Touch/finger icon
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity, imageRendering: 'pixelated' }}>
            <rect x="6" y="1" width="4" height="6" fill="#00ddff" />
            <rect x="4" y="7" width="8" height="2" fill="#00ddff" />
            <rect x="3" y="9" width="10" height="3" fill="#00bbff" />
            <rect x="4" y="12" width="8" height="3" fill="#0099ff" />
            <rect x="7" y="2" width="2" height="3" fill="#88ffff" />
          </svg>
        );
        
      case 'autofire':
        // Gun/autofire icon
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity, imageRendering: 'pixelated' }}>
            <rect x="1" y="6" width="10" height="4" fill="#ffdd00" />
            <rect x="11" y="7" width="4" height="2" fill="#ffaa00" />
            <rect x="3" y="10" width="4" height="3" fill="#ff8800" />
            <rect x="2" y="4" width="2" height="2" fill="#ff4400" />
            <rect x="5" y="3" width="2" height="2" fill="#ff4400" />
            <rect x="8" y="2" width="2" height="3" fill="#ff4400" />
          </svg>
        );
        
      case 'bomb':
        // Bomb icon
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity, imageRendering: 'pixelated' }}>
            <rect x="5" y="5" width="6" height="8" fill="#ff00ff" />
            <rect x="4" y="6" width="8" height="6" fill="#dd00dd" />
            <rect x="6" y="2" width="4" height="3" fill="#888888" />
            <rect x="7" y="1" width="2" height="2" fill="#ff8800" />
            <rect x="6" y="7" width="2" height="2" fill="#ff88ff" />
          </svg>
        );
        
      case 'pause':
        // Pause icon
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity, imageRendering: 'pixelated' }}>
            <rect x="2" y="2" width="12" height="12" rx="2" fill="#666688" opacity="0.5" />
            <rect x="4" y="4" width="3" height="8" fill="#aaaacc" />
            <rect x="9" y="4" width="3" height="8" fill="#aaaacc" />
          </svg>
        );
        
      default:
        // Default star icon
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" style={{ opacity, imageRendering: 'pixelated' }}>
            <rect x="7" y="1" width="2" height="3" fill="#ffff00" />
            <rect x="1" y="6" width="14" height="3" fill="#ffff00" />
            <rect x="3" y="9" width="4" height="5" fill="#ffff00" />
            <rect x="9" y="9" width="4" height="5" fill="#ffff00" />
            <rect x="6" y="4" width="4" height="6" fill="#ffdd00" />
          </svg>
        );
    }
  };
  
  return (
    <div 
      className="flex items-center justify-center flex-shrink-0"
      style={{ 
        width: size, 
        height: size,
        filter: owned ? 'grayscale(0.3)' : `drop-shadow(0 0 ${size / 8}px rgba(255, 255, 255, 0.3))`,
      }}
    >
      {renderPixelIcon()}
    </div>
  );
};
