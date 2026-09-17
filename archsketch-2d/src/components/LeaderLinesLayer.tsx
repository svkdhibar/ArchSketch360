import React from 'react';
import { LeaderAnnotation } from '../utils/leaderLines';

export interface LeaderTheme {
  line: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  bg: string;
  border: string;
}

interface LeaderLinesLayerProps {
  annotations: LeaderAnnotation[];
  theme: LeaderTheme;
  pointerStyle?: 'dogleg' | 'arrow' | 'dot';
  content?: 'name' | 'name_dimensions' | 'keynote_tag';
  isMovable?: boolean;
  onLabelPointerDown?: (e: React.PointerEvent, item: LeaderAnnotation) => void;
  activeDraggingId?: string | null;
}

const LeaderLinesLayerComponent: React.FC<LeaderLinesLayerProps> = ({
  annotations,
  theme,
  pointerStyle = 'dogleg',
  content = 'name_dimensions',
  isMovable = false,
  onLabelPointerDown,
  activeDraggingId = null,
}) => {
  if (!annotations || annotations.length === 0) return null;

  return (
    <g
      id="leader-lines-annotations-layer"
      className={isMovable ? 'select-none' : 'pointer-events-none select-none'}
    >
      {annotations.map((item) => {
        const isDragging = activeDraggingId === item.id;
        return (
          <g
            key={`leader-anno-${item.id}`}
            id={`leader-group-${item.id}`}
            className={isMovable ? (isDragging ? 'cursor-grabbing' : 'cursor-grab group/leader-anno') : ''}
            onPointerDown={isMovable && onLabelPointerDown ? (e) => onLabelPointerDown(e, item) : undefined}
          >
            {/* Wider invisible stroke for easy line hit target when movable */}
            {isMovable && (
              <path
                d={item.pathD}
                fill="none"
                stroke="transparent"
                strokeWidth="16"
                className="pointer-events-auto"
              />
            )}

            {/* Main Leader Line (Path with shelf) */}
            <path
              d={item.pathD}
              fill="none"
              stroke={isDragging ? theme.accent : theme.line}
              strokeWidth={isDragging ? '1.8' : '1.2'}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isMovable ? 'pointer-events-auto' : ''}
            />

            {/* Anchor Dot or Arrow at Icon Boundary */}
            {pointerStyle === 'arrow' && item.arrowPoints ? (
              <polygon points={item.arrowPoints} fill={isDragging ? theme.accent : theme.line} />
            ) : (
              <g className={isMovable ? 'pointer-events-auto' : ''}>
                <circle cx={item.startX} cy={item.startY} r="3" fill={isDragging ? theme.accent : theme.line} />
                <circle cx={item.startX} cy={item.startY} r="1.5" fill={theme.bg} />
              </g>
            )}

            {/* Semi-translucent High-Contrast Backdrop Pill to guarantee 100% legibility */}
            <rect
              x={item.bgX}
              y={item.bgY}
              width={item.bgW}
              height={item.bgH}
              rx="4"
              fill={theme.bg}
              fillOpacity={isDragging ? 0.98 : 0.94}
              stroke={isDragging ? theme.accent : theme.border}
              strokeWidth={isDragging ? '1.5' : '0.8'}
              className={isMovable ? 'pointer-events-auto' : ''}
            />

            {/* Keynote Index Tag Circle */}
            {content === 'keynote_tag' ? (
              <g className="pointer-events-none">
                <circle cx={item.keynoteX} cy={item.keynoteY} r="7.5" fill={theme.accent} />
                <text
                  x={item.keynoteX}
                  y={item.keynoteY + 2.5}
                  textAnchor="middle"
                  fontSize="7"
                  fontWeight="bold"
                  fill="#ffffff"
                  fontFamily="system-ui, sans-serif"
                >
                  {item.keynoteIndex}
                </text>
                <text
                  x={item.textX}
                  y={item.elbowY + 3}
                  textAnchor={item.textAnchor}
                  fontSize="9"
                  fontWeight="700"
                  fill={theme.textPrimary}
                  fontFamily="system-ui, sans-serif"
                >
                  {item.name}
                </text>
              </g>
            ) : (
              /* Standard Name and Dimensions */
              <g className="pointer-events-none">
                <text
                  x={item.textX}
                  y={content === 'name_dimensions' ? item.elbowY - 3.5 : item.elbowY + 3}
                  textAnchor={item.textAnchor}
                  fontSize="9.5"
                  fontWeight="700"
                  fill={theme.textPrimary}
                  fontFamily="system-ui, sans-serif"
                >
                  {item.name}
                </text>

                {content === 'name_dimensions' && (
                  <text
                    x={item.textX}
                    y={item.elbowY + 8}
                    textAnchor={item.textAnchor}
                    fontSize="8"
                    fontWeight="600"
                    fill={theme.textSecondary}
                    fontFamily="system-ui, sans-serif"
                  >
                    {item.dimensionsText}
                  </text>
                )}
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};

export const LeaderLinesLayer = React.memo(LeaderLinesLayerComponent);
