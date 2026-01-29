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
}

export const AnomalyShapeRenderer: React.FC<AnomalyShapeRendererProps> = ({
  shape,
  hue,
  saturation,
  size = 48,
  hasAura = true,
  hasPulse = true,
  className = '',
}) => {
  const color = `hsl(${hue}, ${saturation}%, 60%)`;
  const glowColor = `hsl(${hue}, ${saturation}%, 70%)`;
  const fillColor = `hsl(${hue}, ${saturation}%, 20%)`;
  
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.35;

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

  // Add "eye" or core detail
  const renderCore = () => {
    const coreSize = r * 0.25;
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={coreSize} 
        fill={glowColor}
        style={{ filter: `drop-shadow(0 0 4px ${glowColor})` }}
      />
    );
  };

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox={`0 0 ${size} ${size}`}
      className={`${className} ${hasPulse ? 'animate-pulse' : ''}`}
      style={{ 
        filter: hasAura ? `drop-shadow(0 0 6px ${glowColor})` : undefined,
      }}
    >
      {/* Aura ring */}
      {hasAura && (
        <circle 
          cx={cx} 
          cy={cy} 
          r={r + 4} 
          fill="none" 
          stroke={glowColor} 
          strokeWidth={1} 
          opacity={0.3}
        />
      )}
      {renderShape()}
      {renderCore()}
    </svg>
  );
};
