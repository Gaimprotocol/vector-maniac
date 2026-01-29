// Renders the actual anomaly shape like in-game (not just a question mark)
import React from 'react';
import { AnomalyShape } from '@/game/vectorManiac/anomalyGenerator';

interface AnomalyShapeRendererProps {
  shape: AnomalyShape;
  hue: number;
  saturation: number;
  size?: number;
  hasAura?: boolean;
  hasPulse?: boolean;
  className?: string;
  evolutionLevel?: number; // 1 = base, 2+ = evolved (visual enhancements)
}

export const AnomalyShapeRenderer: React.FC<AnomalyShapeRendererProps> = ({
  shape,
  hue,
  saturation,
  size = 48,
  hasAura = true,
  hasPulse = true,
  className = '',
  evolutionLevel = 1,
}) => {
  // Evolution modifies appearance
  const evolvedSaturation = Math.min(100, saturation + (evolutionLevel - 1) * 10);
  const evolvedBrightness = 60 + (evolutionLevel - 1) * 5;
  const evolvedScale = 1 + (evolutionLevel - 1) * 0.15; // 15% bigger per level
  
  const color = `hsl(${hue}, ${evolvedSaturation}%, ${evolvedBrightness}%)`;
  const glowColor = `hsl(${hue}, ${evolvedSaturation}%, ${evolvedBrightness + 10}%)`;
  const fillColor = `hsl(${hue}, ${evolvedSaturation}%, ${15 + (evolutionLevel - 1) * 5}%)`;
  
  // Secondary color for evolved units (shifted hue)
  const secondaryHue = (hue + 30 * (evolutionLevel - 1)) % 360;
  const secondaryColor = evolutionLevel > 1 ? `hsl(${secondaryHue}, ${evolvedSaturation}%, ${evolvedBrightness}%)` : undefined;
  
  const scaledSize = size * evolvedScale;
  const cx = scaledSize / 2;
  const cy = scaledSize / 2;
  const r = scaledSize * 0.35;

  const renderShape = () => {
    const commonProps = {
      fill: fillColor,
      stroke: color,
      strokeWidth: 2,
    };

    switch (shape) {
      case 'triangle':
        return (
          <polygon 
            points={`${cx},${cy - r} ${cx - r * 0.866},${cy + r * 0.5} ${cx + r * 0.866},${cy + r * 0.5}`}
            {...commonProps}
          />
        );
      case 'square':
        return (
          <rect 
            x={cx - r * 0.7} 
            y={cy - r * 0.7} 
            width={r * 1.4} 
            height={r * 1.4}
            {...commonProps}
          />
        );
      case 'pentagon': {
        const pentPoints = Array.from({ length: 5 }, (_, i) => {
          const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        }).join(' ');
        return <polygon points={pentPoints} {...commonProps} />;
      }
      case 'hexagon': {
        const hexPoints = Array.from({ length: 6 }, (_, i) => {
          const angle = (i * 2 * Math.PI / 6) - Math.PI / 2;
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        }).join(' ');
        return <polygon points={hexPoints} {...commonProps} />;
      }
      case 'star': {
        const starPoints = Array.from({ length: 10 }, (_, i) => {
          const angle = (i * Math.PI / 5) - Math.PI / 2;
          const rad = i % 2 === 0 ? r : r * 0.5;
          return `${cx + rad * Math.cos(angle)},${cy + rad * Math.sin(angle)}`;
        }).join(' ');
        return <polygon points={starPoints} {...commonProps} />;
      }
      case 'cross':
        const crossWidth = r * 0.35;
        return (
          <path
            d={`
              M ${cx - crossWidth} ${cy - r}
              L ${cx + crossWidth} ${cy - r}
              L ${cx + crossWidth} ${cy - crossWidth}
              L ${cx + r} ${cy - crossWidth}
              L ${cx + r} ${cy + crossWidth}
              L ${cx + crossWidth} ${cy + crossWidth}
              L ${cx + crossWidth} ${cy + r}
              L ${cx - crossWidth} ${cy + r}
              L ${cx - crossWidth} ${cy + crossWidth}
              L ${cx - r} ${cy + crossWidth}
              L ${cx - r} ${cy - crossWidth}
              L ${cx - crossWidth} ${cy - crossWidth}
              Z
            `}
            {...commonProps}
          />
        );
      case 'crescent':
        return (
          <>
            <circle cx={cx} cy={cy} r={r} {...commonProps} />
            <circle 
              cx={cx + r * 0.4} 
              cy={cy} 
              r={r * 0.7} 
              fill="hsl(260, 30%, 8%)"
              stroke="none"
            />
          </>
        );
      case 'spiral':
        return (
          <>
            <circle cx={cx} cy={cy} r={r} {...commonProps} />
            <path
              d={`
                M ${cx} ${cy}
                Q ${cx + r * 0.3} ${cy - r * 0.3} ${cx + r * 0.5} ${cy}
                Q ${cx + r * 0.5} ${cy + r * 0.4} ${cx} ${cy + r * 0.5}
                Q ${cx - r * 0.5} ${cy + r * 0.4} ${cx - r * 0.4} ${cy}
                Q ${cx - r * 0.3} ${cy - r * 0.5} ${cx + r * 0.1} ${cy - r * 0.4}
              `}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
            />
          </>
        );
      default:
        return <circle cx={cx} cy={cy} r={r} {...commonProps} />;
    }
  };

  // Add "eye" or core detail - enhanced for evolved units
  const renderCore = () => {
    const coreSize = r * (0.25 + (evolutionLevel - 1) * 0.05);
    return (
      <>
        <circle 
          cx={cx} 
          cy={cy} 
          r={coreSize} 
          fill={glowColor}
          style={{ filter: `drop-shadow(0 0 ${4 + evolutionLevel * 2}px ${glowColor})` }}
        />
        {/* Inner core for evolved units */}
        {evolutionLevel > 1 && (
          <circle 
            cx={cx} 
            cy={cy} 
            r={coreSize * 0.5} 
            fill={secondaryColor || glowColor}
            style={{ filter: `drop-shadow(0 0 4px ${secondaryColor || glowColor})` }}
          />
        )}
      </>
    );
  };

  // Evolution rings
  const renderEvolutionRings = () => {
    if (evolutionLevel <= 1) return null;
    const rings = [];
    for (let i = 1; i < evolutionLevel; i++) {
      rings.push(
        <circle 
          key={i}
          cx={cx} 
          cy={cy} 
          r={r + 6 + i * 4} 
          fill="none" 
          stroke={secondaryColor || glowColor} 
          strokeWidth={0.8} 
          opacity={0.4 - i * 0.1}
          strokeDasharray={`${4 + i * 2} ${2 + i}`}
        />
      );
    }
    return rings;
  };

  // Evolution spikes for level 3+
  const renderEvolutionSpikes = () => {
    if (evolutionLevel < 3) return null;
    const spikes = [];
    const spikeCount = 4 + evolutionLevel;
    for (let i = 0; i < spikeCount; i++) {
      const angle = (i * 2 * Math.PI / spikeCount);
      const innerR = r + 8;
      const outerR = r + 12 + evolutionLevel * 2;
      spikes.push(
        <line
          key={i}
          x1={cx + innerR * Math.cos(angle)}
          y1={cy + innerR * Math.sin(angle)}
          x2={cx + outerR * Math.cos(angle)}
          y2={cy + outerR * Math.sin(angle)}
          stroke={secondaryColor || glowColor}
          strokeWidth={1.5}
          opacity={0.6}
        />
      );
    }
    return spikes;
  };

  return (
    <svg 
      width={scaledSize} 
      height={scaledSize} 
      viewBox={`0 0 ${scaledSize} ${scaledSize}`}
      className={`${className} ${hasPulse ? 'animate-pulse' : ''}`}
      style={{ 
        filter: hasAura ? `drop-shadow(0 0 ${6 + evolutionLevel * 3}px ${glowColor})` : undefined,
      }}
    >
      {/* Evolution spikes (level 3+) */}
      {renderEvolutionSpikes()}
      
      {/* Evolution rings */}
      {renderEvolutionRings()}
      
      {/* Aura ring */}
      {hasAura && (
        <circle 
          cx={cx} 
          cy={cy} 
          r={r + 4} 
          fill="none" 
          stroke={glowColor} 
          strokeWidth={1 + (evolutionLevel - 1) * 0.5} 
          opacity={0.3 + (evolutionLevel - 1) * 0.1}
        />
      )}
      {renderShape()}
      {renderCore()}
      
      {/* Evolution level indicator */}
      {evolutionLevel > 1 && (
        <text 
          x={scaledSize - 8} 
          y={12} 
          fill="#ffaa00" 
          fontSize={8} 
          fontFamily="Orbitron, monospace"
          fontWeight="bold"
        >
          {evolutionLevel}
        </text>
      )}
    </svg>
  );
};
