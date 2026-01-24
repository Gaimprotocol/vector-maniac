import React from 'react';

// Vector-style SVG icons for Vector Maniac UI
// All icons use neon green (#00ff88) vector aesthetic

interface VectorIconProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

// Wrench/gear icon for SHOP upgrades
export const UpgradeIcon: React.FC<VectorIconProps> = ({ size = 24, className = '', glow = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      {glow && <filter id="glow-upgrade" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>}
    </defs>
    <g filter={glow ? "url(#glow-upgrade)" : undefined} stroke="#00ff88" strokeWidth="1.5" fill="none">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </g>
  </svg>
);

// Store/cart icon for IAP store
export const StoreIcon: React.FC<VectorIconProps> = ({ size = 24, className = '', glow = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      {glow && <filter id="glow-store" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>}
    </defs>
    <g filter={glow ? "url(#glow-store)" : undefined} stroke="#00ff88" strokeWidth="1.5" fill="none">
      <polygon points="12 2 2 7 2 17 12 22 22 17 22 7 12 2" />
      <line x1="12" y1="22" x2="12" y2="12" />
      <line x1="22" y1="7" x2="12" y2="12" />
      <line x1="2" y1="7" x2="12" y2="12" />
    </g>
  </svg>
);

// Scrap/gear currency icon
export const ScrapIcon: React.FC<VectorIconProps> = ({ size = 24, className = '', glow = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      {glow && <filter id="glow-scrap" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>}
    </defs>
    <g filter={glow ? "url(#glow-scrap)" : undefined} stroke="#00ff88" strokeWidth="1.5" fill="none">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </g>
  </svg>
);

// Ship icon for equipment/mega ships
export const ShipIcon: React.FC<VectorIconProps> = ({ size = 24, className = '', glow = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      {glow && <filter id="glow-ship" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>}
    </defs>
    <g filter={glow ? "url(#glow-ship)" : undefined} stroke="#00ff88" strokeWidth="1.5" fill="none">
      <polygon points="12 2 4 20 12 16 20 20 12 2" />
    </g>
  </svg>
);

// Skin/palette icon for ship skins
export const SkinIcon: React.FC<VectorIconProps> = ({ size = 24, className = '', glow = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      {glow && <filter id="glow-skin" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>}
    </defs>
    <g filter={glow ? "url(#glow-skin)" : undefined} stroke="#00ff88" strokeWidth="1.5" fill="none">
      <circle cx="13.5" cy="6.5" r="0.5" fill="#00ff88" />
      <circle cx="17.5" cy="10.5" r="0.5" fill="#00ff88" />
      <circle cx="8.5" cy="7.5" r="0.5" fill="#00ff88" />
      <circle cx="6.5" cy="12.5" r="0.5" fill="#00ff88" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z" />
    </g>
  </svg>
);

// Music/soundtrack icon
export const MusicIcon: React.FC<VectorIconProps> = ({ size = 24, className = '', glow = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      {glow && <filter id="glow-music" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>}
    </defs>
    <g filter={glow ? "url(#glow-music)" : undefined} stroke="#00ff88" strokeWidth="1.5" fill="none">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </g>
  </svg>
);

// Settings/difficulty icon
export const SettingsIcon: React.FC<VectorIconProps> = ({ size = 24, className = '', glow = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      {glow && <filter id="glow-settings" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>}
    </defs>
    <g filter={glow ? "url(#glow-settings)" : undefined} stroke="#00ff88" strokeWidth="1.5" fill="none">
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </g>
  </svg>
);

// Info/terminal icon
export const InfoIcon: React.FC<VectorIconProps> = ({ size = 24, className = '', glow = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      {glow && <filter id="glow-info" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>}
    </defs>
    <g filter={glow ? "url(#glow-info)" : undefined} stroke="#00ff88" strokeWidth="1.5" fill="none">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <polyline points="6 8 6 8" strokeLinecap="round" />
      <line x1="6" y1="8" x2="6" y2="8" strokeWidth="2" strokeLinecap="round" />
      <line x1="10" y1="8" x2="18" y2="8" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </g>
  </svg>
);

// Arrow back icon
export const ArrowBackIcon: React.FC<VectorIconProps> = ({ size = 24, className = '', glow = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      {glow && <filter id="glow-arrow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>}
    </defs>
    <g filter={glow ? "url(#glow-arrow)" : undefined} stroke="#00ff88" strokeWidth="1.5" fill="none">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </g>
  </svg>
);

// Check/maxed icon
export const CheckIcon: React.FC<VectorIconProps> = ({ size = 24, className = '', glow = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      {glow && <filter id="glow-check" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>}
    </defs>
    <g filter={glow ? "url(#glow-check)" : undefined} stroke="#00ff88" strokeWidth="2" fill="none">
      <polyline points="20 6 9 17 4 12" />
    </g>
  </svg>
);

// Lock icon
export const LockIcon: React.FC<VectorIconProps> = ({ size = 24, className = '', glow = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <g stroke="#666666" strokeWidth="1.5" fill="none">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </g>
  </svg>
);

// Playing/sound wave icon
export const PlayingIcon: React.FC<VectorIconProps> = ({ size = 24, className = '', glow = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      {glow && <filter id="glow-playing" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>}
    </defs>
    <g filter={glow ? "url(#glow-playing)" : undefined} stroke="#00ff88" strokeWidth="1.5" fill="none">
      <rect x="4" y="14" width="3" height="6" fill="#00ff88" />
      <rect x="10" y="10" width="3" height="10" fill="#00ff88" />
      <rect x="16" y="6" width="3" height="14" fill="#00ff88" />
    </g>
  </svg>
);

// Target/crosshair icon for controls
export const TargetIcon: React.FC<VectorIconProps> = ({ size = 24, className = '', glow = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      {glow && <filter id="glow-target" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>}
    </defs>
    <g filter={glow ? "url(#glow-target)" : undefined} stroke="#00ff88" strokeWidth="1.5" fill="none">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
    </g>
  </svg>
);

// Zap/power icon
export const ZapIcon: React.FC<VectorIconProps> = ({ size = 24, className = '', glow = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      {glow && <filter id="glow-zap" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>}
    </defs>
    <g filter={glow ? "url(#glow-zap)" : undefined} stroke="#00ff88" strokeWidth="1.5" fill="none">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </g>
  </svg>
);

// Grid/data icon
export const GridIcon: React.FC<VectorIconProps> = ({ size = 24, className = '', glow = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      {glow && <filter id="glow-grid" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>}
    </defs>
    <g filter={glow ? "url(#glow-grid)" : undefined} stroke="#00ff88" strokeWidth="1.5" fill="none">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </g>
  </svg>
);

// Hand/touch icon
export const TouchIcon: React.FC<VectorIconProps> = ({ size = 24, className = '', glow = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      {glow && <filter id="glow-touch" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>}
    </defs>
    <g filter={glow ? "url(#glow-touch)" : undefined} stroke="#00ff88" strokeWidth="1.5" fill="none">
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </g>
  </svg>
);

// Shield icon
export const ShieldIcon: React.FC<VectorIconProps> = ({ size = 24, className = '', glow = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      {glow && <filter id="glow-shield" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>}
    </defs>
    <g filter={glow ? "url(#glow-shield)" : undefined} stroke="#00ff88" strokeWidth="1.5" fill="none">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </g>
  </svg>
);

// Hexagon/node icon  
export const HexIcon: React.FC<VectorIconProps> = ({ size = 24, className = '', glow = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      {glow && <filter id="glow-hex" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>}
    </defs>
    <g filter={glow ? "url(#glow-hex)" : undefined} stroke="#00ff88" strokeWidth="1.5" fill="none">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </g>
  </svg>
);

// Crosshair/aim icon
export const AimIcon: React.FC<VectorIconProps> = ({ size = 24, className = '', glow = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      {glow && <filter id="glow-aim" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>}
    </defs>
    <g filter={glow ? "url(#glow-aim)" : undefined} stroke="#00ff88" strokeWidth="1.5" fill="none">
      <circle cx="12" cy="12" r="10" />
      <line x1="22" y1="12" x2="18" y2="12" />
      <line x1="6" y1="12" x2="2" y2="12" />
      <line x1="12" y1="6" x2="12" y2="2" />
      <line x1="12" y1="22" x2="12" y2="18" />
    </g>
  </svg>
);

// Pause icon
export const PauseIcon: React.FC<VectorIconProps> = ({ size = 24, className = '', glow = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      {glow && <filter id="glow-pause" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>}
    </defs>
    <g filter={glow ? "url(#glow-pause)" : undefined} stroke="#00ff88" strokeWidth="1.5" fill="none">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </g>
  </svg>
);
