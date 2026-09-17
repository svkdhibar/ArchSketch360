import React from 'react';
import { MeasurementUnit } from '../../types';
import { formatObjectMeasurement } from '../../utils/measurement';

interface SubSymbolProps {
  kind: string;
  w: number;
  h: number;
  stroke: string;
  sw: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  halfW: number;
  halfH: number;
  preview?: boolean;
  name?: string;
  color?: string;
  roomName?: string;
  showRoomLabel?: boolean;
  roomFloorPattern?: 'clean' | 'wood' | 'tile' | 'slate' | 'concrete';
  wallThickness?: number;
  polygonPoints?: { x: number; y: number }[];
  customMeasurement?: string;
  measurementUnit?: string;
}

export const renderStructureOrStairs = ({
  kind,
  w,
  h,
  stroke,
  sw,
  x1,
  y1,
  x2,
  y2,
  halfW,
  halfH,
  preview,
  name,
  color,
  roomName,
  showRoomLabel,
  roomFloorPattern,
  wallThickness,
  polygonPoints,
  customMeasurement,
  measurementUnit,
}: SubSymbolProps): React.ReactElement | null => {
  switch (kind) {
    // ---------------- STAIRS & VERTICAL CIRCULATION ----------------
    case 'stairs_straight': {
      const numSteps = 10;
      const stepH = h / numSteps;
      return (
        <g id="symbol-stairs-straight">
          <rect x={x1} y={y1} width={w} height={h} fill="#f8fafc" stroke={stroke} strokeWidth={sw} />
          {/* Treads */}
          {Array.from({ length: numSteps - 1 }).map((_, i) => (
            <line key={i} x1={x1} y1={y1 + (i + 1) * stepH} x2={x2} y2={y1 + (i + 1) * stepH} stroke={stroke} strokeWidth={1} />
          ))}
          {/* Handrail on right */}
          <line x1={x2 - 6} y1={y1} x2={x2 - 6} y2={y2} stroke="#64748b" strokeWidth={2.5} />
          {/* Architectural UP arrow with start circle */}
          <circle cx={0} cy={y2 - 16} r={3.5} fill="#4f46e5" />
          <line x1={0} y1={y2 - 16} x2={0} y2={y1 + 16} stroke="#4f46e5" strokeWidth={2} />
          <polygon points={`0,${y1 + 12} -5,${y1 + 22} 5,${y1 + 22}`} fill="#4f46e5" />
          <text x={12} y={y2 - 14} fontSize={8} fill="#4f46e5" fontWeight="bold">UP</text>
        </g>
      );
    }

    case 'stairs_l': {
      return (
        <g id="symbol-stairs-l">
          <path
            d={`M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y1 + h * 0.45} L ${x1 + w * 0.45} ${y1 + h * 0.45} L ${x1 + w * 0.45} ${y2} L ${x1} ${y2} Z`}
            fill="#f8fafc"
            stroke={stroke}
            strokeWidth={sw}
          />
          {/* Steps top horizontal flight */}
          {[0.15, 0.3, 0.45].map((ratio, i) => (
            <line key={`top-${i}`} x1={x1 + w * 0.45 + (w * 0.55) * ratio} y1={y1} x2={x1 + w * 0.45 + (w * 0.55) * ratio} y2={y1 + h * 0.45} stroke={stroke} strokeWidth={1} />
          ))}
          {/* Steps vertical flight */}
          {[0.6, 0.75, 0.9].map((ratio, i) => (
            <line key={`bot-${i}`} x1={x1} y1={y1 + h * ratio} x2={x1 + w * 0.45} y2={y1 + h * ratio} stroke={stroke} strokeWidth={1} />
          ))}
          {/* Landing corner square */}
          <rect x={x1} y={y1} width={w * 0.45} height={h * 0.45} fill="#e2e8f0" stroke={stroke} strokeWidth={1} />
          {/* Turn Arrow */}
          <path d={`M ${x1 + w * 0.22} ${y2 - 12} L ${x1 + w * 0.22} ${y1 + h * 0.22} L ${x2 - 12} ${y1 + h * 0.22}`} fill="none" stroke="#4f46e5" strokeWidth={2} />
          <polygon points={`${x2 - 10},${y1 + h * 0.22} ${x2 - 18},${y1 + h * 0.22 - 4} ${x2 - 18},${y1 + h * 0.22 + 4}`} fill="#4f46e5" />
        </g>
      );
    }

    case 'stairs_u': {
      // 180-degree switchback stairs with half-landing
      return (
        <g id="symbol-stairs-u">
          <rect x={x1} y={y1} width={w} height={h} fill="#f8fafc" stroke={stroke} strokeWidth={sw} />
          {/* Top landing */}
          <rect x={x1} y={y1} width={w} height={h * 0.25} fill="#e2e8f0" stroke={stroke} strokeWidth={1} />
          {/* Center wall/well divide */}
          <rect x={-4} y={y1 + h * 0.25} width={8} height={h * 0.75} fill="#475569" stroke={stroke} strokeWidth={1} />
          {/* Left flight treads */}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`lf-${i}`} x1={x1} y1={y1 + h * 0.25 + (i + 1) * (h * 0.75 / 7)} x2={-4} y2={y1 + h * 0.25 + (i + 1) * (h * 0.75 / 7)} stroke={stroke} strokeWidth={1} />
          ))}
          {/* Right flight treads */}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`rf-${i}`} x1={4} y1={y1 + h * 0.25 + (i + 1) * (h * 0.75 / 7)} x2={x2} y2={y1 + h * 0.25 + (i + 1) * (h * 0.75 / 7)} stroke={stroke} strokeWidth={1} />
          ))}
          {/* U-Turn path arrow */}
          <path d={`M ${-w * 0.25} ${y2 - 10} L ${-w * 0.25} ${y1 + h * 0.12} L ${w * 0.25} ${y1 + h * 0.12} L ${w * 0.25} ${y2 - 16}`} fill="none" stroke="#4f46e5" strokeWidth={1.8} />
          <polygon points={`${w * 0.25},${y2 - 10} ${w * 0.25 - 4},${y2 - 18} ${w * 0.25 + 4},${y2 - 18}`} fill="#4f46e5" />
        </g>
      );
    }

    case 'stairs_spiral': {
      const r = Math.min(w, h) * 0.48;
      return (
        <g id="symbol-stairs-spiral">
          <circle cx={0} cy={0} r={r} fill="#f8fafc" stroke={stroke} strokeWidth={sw} />
          {/* Center steel column */}
          <circle cx={0} cy={0} r={r * 0.22} fill="#334155" stroke={stroke} strokeWidth={sw} />
          {/* Radial steps (12 treads) */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const xInner = Math.cos(angle) * (r * 0.22);
            const yInner = Math.sin(angle) * (r * 0.22);
            const xOuter = Math.cos(angle) * r;
            const yOuter = Math.sin(angle) * r;
            return <line key={i} x1={xInner} y1={yInner} x2={xOuter} y2={yOuter} stroke={stroke} strokeWidth={1} />;
          })}
          {/* Spiral handrail arc */}
          <path d={`M ${r * 0.8} 0 A ${r * 0.8} ${r * 0.8} 0 1 1 0 ${-r * 0.8}`} fill="none" stroke="#4f46e5" strokeWidth={2} />
          <polygon points={`0,${-r * 0.8} -6,${-r * 0.8 - 4} -2,${-r * 0.8 + 5}`} fill="#4f46e5" />
        </g>
      );
    }

    case 'elevator': {
      return (
        <g id="symbol-elevator">
          {/* Structural shaft wall */}
          <rect x={x1} y={y1} width={w} height={h} fill="#f1f5f9" stroke={stroke} strokeWidth={sw + 1} />
          {/* Diagonal architectural shaft cross */}
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" />
          <line x1={x1} y1={y2} x2={x2} y2={y1} stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" />
          {/* Elevator car cabin */}
          <rect x={x1 + 10} y={y1 + 10} width={w - 20} height={h - 20} rx={3} fill="#ffffff" stroke={stroke} strokeWidth={sw} />
          {/* Sliding door opening at bottom */}
          <rect x={-w * 0.28} y={y2 - 12} width={w * 0.56} height={6} fill="#475569" />
          {/* Counterweight symbol at top */}
          <rect x={-w * 0.2} y={y1 + 3} width={w * 0.4} height={5} fill="#1e293b" />
          <text x={0} y={4} textAnchor="middle" fontSize={11} fill="#1e293b" fontWeight="bold">LIFT</text>
        </g>
      );
    }

    case 'escalator': {
      return (
        <g id="symbol-escalator">
          <rect x={x1} y={y1} width={w} height={h} fill="#f8fafc" stroke={stroke} strokeWidth={sw} />
          {/* Moving rubber handrails */}
          <rect x={x1} y={y1} width={10} height={h} rx={2} fill="#334155" stroke={stroke} strokeWidth={1} />
          <rect x={x2 - 10} y={y1} width={10} height={h} rx={2} fill="#334155" stroke={stroke} strokeWidth={1} />
          {/* Moving steps treads */}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1={x1 + 10} y1={y1 + h * 0.2 + (i + 1) * (h * 0.6 / 9)} x2={x2 - 10} y2={y1 + h * 0.2 + (i + 1) * (h * 0.6 / 9)} stroke={stroke} strokeWidth={1.5} />
          ))}
          {/* Escalator arrow */}
          <line x1={0} y1={y2 - 20} x2={0} y2={y1 + 20} stroke="#4f46e5" strokeWidth={2.5} />
          <polygon points={`0,${y1 + 14} -5,${y1 + 24} 5,${y1 + 24}`} fill="#4f46e5" />
        </g>
      );
    }

    // ---------------- STRUCTURE ----------------
    case 'wall': {
      const isHorizontal = w >= h;
      const wallFill = color || '#334155'; // Clean architectural charcoal/slate finish (not heavy black)

      return (
        <g id="symbol-wall">
          {/* Base solid wall fill - clean architectural border */}
          <rect
            x={x1}
            y={y1}
            width={w}
            height={h}
            fill={wallFill}
            stroke="#1e293b"
            strokeWidth={1.2}
            rx={0.5}
          />

          {/* Strictly clipped architectural 45° hatch & centerline */}
          <svg x={x1} y={y1} width={w} height={h} overflow="hidden">
            {/* 45-degree architectural wall hatch pattern */}
            {Array.from({ length: Math.ceil((w + h) / 14) + 2 }).map((_, i) => {
              const offset = i * 14;
              return (
                <line
                  key={i}
                  x1={offset}
                  y1={0}
                  x2={offset - h}
                  y2={h}
                  stroke="#94a3b8"
                  strokeWidth={0.7}
                  opacity={0.25}
                />
              );
            })}

            {/* Architectural core reference line */}
            {isHorizontal ? (
              <line
                x1={0}
                y1={h / 2}
                x2={w}
                y2={h / 2}
                stroke="#cbd5e1"
                strokeWidth={0.7}
                strokeDasharray="4 3"
                opacity={0.4}
              />
            ) : (
              <line
                x1={w / 2}
                y1={0}
                x2={w / 2}
                y2={h}
                stroke="#cbd5e1"
                strokeWidth={0.7}
                strokeDasharray="4 3"
                opacity={0.4}
              />
            )}
          </svg>

          {/* Clean architectural end caps */}
          {isHorizontal ? (
            <>
              <line x1={x1} y1={y1} x2={x1} y2={y2} stroke="#1e293b" strokeWidth={1.2} />
              <line x1={x2} y1={y1} x2={x2} y2={y2} stroke="#1e293b" strokeWidth={1.2} />
            </>
          ) : (
            <>
              <line x1={x1} y1={y1} x2={x2} y2={y1} stroke="#1e293b" strokeWidth={1.2} />
              <line x1={x1} y1={y2} x2={x2} y2={y2} stroke="#1e293b" strokeWidth={1.2} />
            </>
          )}
        </g>
      );
    }

    case 'shear_wall': {
      const isHorizontal = w >= h;
      const shearFill = color || '#18181b';

      return (
        <g id="symbol-shear-wall">
          <rect
            x={x1}
            y={y1}
            width={w}
            height={h}
            fill={shearFill}
            stroke="#09090b"
            strokeWidth={sw + 0.8}
          />

          {/* Strictly clipped heavy RC cross-hatch - ZERO line bleeding */}
          <svg x={x1} y={y1} width={w} height={h} overflow="hidden">
            {Array.from({ length: Math.ceil((w + h) / 12) + 2 }).map((_, i) => {
              const offset = i * 12;
              return (
                <g key={i}>
                  <line
                    x1={offset}
                    y1={0}
                    x2={offset - h}
                    y2={h}
                    stroke="#52525b"
                    strokeWidth={1.2}
                    opacity={0.5}
                  />
                  <line
                    x1={offset - h}
                    y1={0}
                    x2={offset}
                    y2={h}
                    stroke="#52525b"
                    strokeWidth={1.2}
                    opacity={0.5}
                  />
                </g>
              );
            })}
          </svg>

          {/* End caps */}
          {isHorizontal ? (
            <>
              <line x1={x1} y1={y1} x2={x1} y2={y2} stroke="#09090b" strokeWidth={sw + 1} />
              <line x1={x2} y1={y1} x2={x2} y2={y2} stroke="#09090b" strokeWidth={sw + 1} />
            </>
          ) : (
            <>
              <line x1={x1} y1={y1} x2={x2} y2={y1} stroke="#09090b" strokeWidth={sw + 1} />
              <line x1={x1} y1={y2} x2={x2} y2={y2} stroke="#09090b" strokeWidth={sw + 1} />
            </>
          )}
        </g>
      );
    }

    case 'room_circle': {
      const radius = Math.max(4, Math.min(w, h) / 2);
      const wallThick = wallThickness || Math.min(8, Math.max(3, radius * 0.05));
      const roomWallFill = color || '#334155';

      return (
        <g id="symbol-room-circle">
          {/* Proper clean circular floor wash and outer perimeter wall with no interior design */}
          <circle
            cx={0}
            cy={0}
            r={Math.max(2, radius - wallThick / 2)}
            fill={
              roomFloorPattern === 'wood'
                ? '#fef3c7'
                : roomFloorPattern === 'tile'
                ? '#e2e8f0'
                : roomFloorPattern === 'concrete'
                ? '#cbd5e1'
                : roomFloorPattern === 'slate'
                ? '#f1f5f9'
                : '#ffffff'
            }
            fillOpacity={0.92}
            stroke={roomWallFill}
            strokeWidth={wallThick}
          />

          {/* Room Label (with on/off option) */}
          {showRoomLabel !== false && !preview && (() => {
            const rawName = roomName !== undefined ? roomName : (name || '');
            const displayName = rawName.trim();
            const trimmedCustom = (customMeasurement || '').trim();

            if (!displayName && !trimmedCustom) return null;

            return (
              <g id="circle-room-label" className="pointer-events-none select-none">
                {displayName && (
                  <text
                    x={0}
                    y={trimmedCustom ? -2 : 4}
                    textAnchor="middle"
                    fontSize={Math.max(10, Math.min(15, radius * 0.14))}
                    fill="#334155"
                    fontWeight="700"
                    letterSpacing="0.06em"
                  >
                    {displayName}
                  </text>
                )}
                {trimmedCustom && (
                  <text
                    x={0}
                    y={displayName ? 14 : 4}
                    textAnchor="middle"
                    fontSize={Math.max(8.5, Math.min(11, radius * 0.09))}
                    fill="#64748b"
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    {trimmedCustom}
                  </text>
                )}
              </g>
            );
          })()}
        </g>
      );
    }

    case 'room': {
      // If drawn with polygon points, render the custom room area defined by those exact lines
      if (polygonPoints && polygonPoints.length >= 3) {
        const polyPointsStr = polygonPoints.map((p) => `${p.x},${p.y}`).join(' ');
        const wallThick = wallThickness || 6;
        const roomWallFill = color || '#334155';

        // Calculate polygon area via Shoelace formula
        let shoelace = 0;
        for (let i = 0; i < polygonPoints.length; i++) {
          const j = (i + 1) % polygonPoints.length;
          shoelace += polygonPoints[i].x * polygonPoints[j].y - polygonPoints[j].x * polygonPoints[i].y;
        }
        const areaSqPx = Math.abs(shoelace) / 2;
        const areaSqM = Math.round((areaSqPx / 1600) * 10) / 10;
        const areaSqFt = Math.round(areaSqM * 10.7639);

        return (
          <g id="symbol-room-polygon">
            {/* Subtle clean floor interior wash */}
            <polygon
              points={polyPointsStr}
              fill={roomFloorPattern === 'wood' ? '#fef3c7' : roomFloorPattern === 'slate' ? '#f1f5f9' : '#f8fafc'}
              fillOpacity={0.88}
            />
            {/* Outer Room Perimeter Boundary along the exact lines drawn */}
            <polygon
              points={polyPointsStr}
              fill="none"
              stroke={roomWallFill}
              strokeWidth={wallThick}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Subtle interior setback guideline */}
            <polygon
              points={polyPointsStr}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth={0.8}
              strokeDasharray="4 3"
            />
            {/* Room Name & Calculated Area Callout */}
            {showRoomLabel !== false && !preview && (() => {
              const rawName = roomName !== undefined ? roomName : (name || '');
              const displayName = rawName.trim();
              const trimmedCustom = (customMeasurement || '').trim();

              if (!displayName && !trimmedCustom) return null;

              return (
                <g id="room-polygon-label" className="pointer-events-none select-none">
                  {displayName && (
                    <text
                      x={0}
                      y={trimmedCustom ? -2 : 4}
                      textAnchor="middle"
                      fontSize={Math.max(10, Math.min(14, w * 0.06))}
                      fill="#334155"
                      fontWeight="700"
                      letterSpacing="0.06em"
                    >
                      {displayName}
                    </text>
                  )}
                  {trimmedCustom && (
                    <text
                      x={0}
                      y={displayName ? 13 : 4}
                      textAnchor="middle"
                      fontSize={Math.max(8.5, Math.min(11, w * 0.04))}
                      fill="#64748b"
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      {trimmedCustom}
                    </text>
                  )}
                </g>
              );
            })()}
          </g>
        );
      }

      // Sleek, refined room wall border - NOT bold
      const wallThick = Math.min(6, Math.max(3, Math.min(w, h) * 0.02));
      const roomWallFill = color || '#334155';

      return (
        <g id="symbol-room">
          {/* Subtle clean floor interior wash */}
          <rect
            x={x1}
            y={y1}
            width={w}
            height={h}
            fill={roomFloorPattern === 'wood' ? '#fef3c7' : roomFloorPattern === 'slate' ? '#f1f5f9' : '#f8fafc'}
            fillOpacity={0.85}
          />
          {/* Outer Room Perimeter Walls - clean 1.2px stroke */}
          <rect x={x1} y={y1} width={w} height={wallThick} fill={roomWallFill} stroke="#1e293b" strokeWidth={1.2} />
          <rect x={x1} y={y2 - wallThick} width={w} height={wallThick} fill={roomWallFill} stroke="#1e293b" strokeWidth={1.2} />
          <rect x={x1} y={y1} width={wallThick} height={h} fill={roomWallFill} stroke="#1e293b" strokeWidth={1.2} />
          <rect x={x2 - wallThick} y={y1} width={wallThick} height={h} fill={roomWallFill} stroke="#1e293b" strokeWidth={1.2} />
          {/* Subtle interior setback guideline */}
          <rect
            x={x1 + wallThick}
            y={y1 + wallThick}
            width={Math.max(0, w - wallThick * 2)}
            height={Math.max(0, h - wallThick * 2)}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth={0.6}
            strokeDasharray="3 3"
          />
          {/* Room Name & Area Callout */}
          {showRoomLabel !== false && !preview && (() => {
            const rawName = roomName !== undefined ? roomName : (name || '');
            const displayName = rawName.trim();
            const trimmedCustom = (customMeasurement || '').trim();

            if (!displayName && !trimmedCustom) return null;

            return (
              <g id="room-label" className="pointer-events-none select-none">
                {displayName && (
                  <text
                    x={0}
                    y={trimmedCustom ? -2 : 4}
                    textAnchor="middle"
                    fontSize={Math.max(9, Math.min(14, w * 0.055))}
                    fill="#334155"
                    fontWeight="700"
                    letterSpacing="0.06em"
                  >
                    {displayName}
                  </text>
                )}
                {trimmedCustom && (
                  <text
                    x={0}
                    y={displayName ? 13 : 4}
                    textAnchor="middle"
                    fontSize={Math.max(8, Math.min(11, w * 0.04))}
                    fill="#64748b"
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    {trimmedCustom}
                  </text>
                )}
              </g>
            );
          })()}
        </g>
      );
    }

    case 'opening_door': {
      return (
        <g id="symbol-opening-door">
          {/* Left & Right cased jambs */}
          <rect x={x1} y={y1} width={10} height={h} fill="#475569" stroke={stroke} strokeWidth={sw} />
          <rect x={x2 - 10} y={y1} width={10} height={h} fill="#475569" stroke={stroke} strokeWidth={sw} />
          {/* Clear dashed portal opening */}
          <line x1={x1 + 10} y1={y1} x2={x2 - 10} y2={y1} stroke="#94a3b8" strokeWidth={1.2} strokeDasharray="3 3" />
          <line x1={x1 + 10} y1={y2} x2={x2 - 10} y2={y2} stroke="#94a3b8" strokeWidth={1.2} strokeDasharray="3 3" />
        </g>
      );
    }

    case 'opening_window': {
      return (
        <g id="symbol-opening-window">
          <rect x={x1} y={y1} width={10} height={h} fill="#475569" stroke={stroke} strokeWidth={sw} />
          <rect x={x2 - 10} y={y1} width={10} height={h} fill="#475569" stroke={stroke} strokeWidth={sw} />
          <line x1={x1 + 10} y1={0} x2={x2 - 10} y2={0} stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" />
        </g>
      );
    }

    case 'column_square': {
      return (
        <g id="symbol-column-square">
          <rect x={x1} y={y1} width={w} height={h} fill="#1e293b" stroke={stroke} strokeWidth={sw + 1} />
          {/* Structural center cross mark */}
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#cbd5e1" strokeWidth={1.2} />
          <line x1={x1} y1={y2} x2={x2} y2={y1} stroke="#cbd5e1" strokeWidth={1.2} />
        </g>
      );
    }

    case 'column_round': {
      return (
        <g id="symbol-column-round">
          <circle cx={0} cy={0} r={Math.min(w, h) * 0.46} fill="#1e293b" stroke={stroke} strokeWidth={sw + 1} />
          <line x1={-halfW * 0.6} y1={0} x2={halfW * 0.6} y2={0} stroke="#cbd5e1" strokeWidth={1.2} />
          <line x1={0} y1={-halfH * 0.6} x2={0} y2={halfH * 0.6} stroke="#cbd5e1" strokeWidth={1.2} />
        </g>
      );
    }

    case 'column_i_beam': {
      // Structural W/H steel wide-flange section
      const flangeThick = 7;
      const webThick = 6;
      return (
        <g id="symbol-column-i-beam">
          {/* Top flange */}
          <rect x={x1} y={y1} width={w} height={flangeThick} fill="#0f172a" stroke={stroke} strokeWidth={sw} />
          {/* Bottom flange */}
          <rect x={x1} y={y2 - flangeThick} width={w} height={flangeThick} fill="#0f172a" stroke={stroke} strokeWidth={sw} />
          {/* Central web */}
          <rect x={-webThick / 2} y={y1 + flangeThick} width={webThick} height={h - flangeThick * 2} fill="#0f172a" stroke={stroke} strokeWidth={sw} />
        </g>
      );
    }

    case 'beam': {
      return (
        <g id="symbol-beam">
          {/* Overhead structural girder (dashed reference lines) */}
          <rect x={x1} y={y1} width={w} height={h} fill="none" stroke="#4f46e5" strokeWidth={1.8} strokeDasharray="6 4" />
          <line x1={x1} y1={0} x2={x2} y2={0} stroke="#4f46e5" strokeWidth={1} strokeDasharray="3 3" />
          <text x={0} y={3} textAnchor="middle" fontSize={8} fill="#4f46e5" fontWeight="bold">BEAM OVERHEAD</text>
        </g>
      );
    }

    case 'ramp_ada': {
      // ADA accessible slope ramp with continuous dual handrails, landings & directional slope arrow
      return (
        <g id="symbol-ramp-ada">
          {/* Ramp surface */}
          <rect x={x1} y={y1} width={w} height={h} fill="#f1f5f9" stroke={stroke} strokeWidth={sw} />
          {/* Handrails */}
          <line x1={x1} y1={y1 + 4} x2={x2} y2={y1 + 4} stroke="#2563eb" strokeWidth={2.5} />
          <line x1={x1} y1={y2 - 4} x2={x2} y2={y2 - 4} stroke="#2563eb" strokeWidth={2.5} />
          {/* Slope directional arrow */}
          <line x1={x1 + 16} y1={0} x2={x2 - 16} y2={0} stroke="#2563eb" strokeWidth={2} />
          <polygon points={`${x2 - 12},0 ${x2 - 20},-5 ${x2 - 20},5`} fill="#2563eb" />
          {/* ADA Wheelchair glyph */}
          <circle cx={x1 + 24} cy={0} r={4} fill="#2563eb" />
          <path d={`M ${x1 + 24} 4 L ${x1 + 24} 12 L ${x1 + 30} 12 M ${x1 + 21} 8 L ${x1 + 28} 8`} fill="none" stroke="#2563eb" strokeWidth={1.2} />
          <text x={0} y={-8} textAnchor="middle" fontSize={7} fill="#2563eb" fontWeight="bold">RAMP 1:12</text>
        </g>
      );
    }

    case 'roof_skylight_vault': {
      // Barrel vaulted glazed roof lantern / architectural ridge skylight
      return (
        <g id="symbol-roof-skylight-vault">
          {/* Outer insulated curb curb */}
          <rect x={x1} y={y1} width={w} height={h} rx={4} fill="#0284c7" stroke={stroke} strokeWidth={sw} />
          <rect x={x1 + 6} y={y1 + 6} width={w - 12} height={h - 12} rx={2} fill="#e0f2fe" stroke="#38bdf8" strokeWidth={1} />
          {/* Glazing hip ribs */}
          <line x1={x1 + 6} y1={0} x2={x2 - 6} y2={0} stroke="#0369a1" strokeWidth={2} />
          {Array.from({ length: 5 }).map((_, i) => {
            const rx = x1 + 12 + i * ((w - 24) / 4);
            return <line key={i} x1={rx} y1={y1 + 6} x2={rx} y2={y2 - 6} stroke="#0284c7" strokeWidth={1.2} strokeDasharray="4 2" />;
          })}
          <text x={0} y={-halfH + 18} textAnchor="middle" fontSize={7} fill="#0369a1" fontWeight="bold">VAULTED SKYLIGHT</text>
        </g>
      );
    }

    case 'fireplace_chimney': {
      // Heavy structural masonry chimney stack with dual terracotta clay flue liners
      return (
        <g id="symbol-fireplace-chimney">
          {/* Outer brick/stone masonry breast */}
          <rect x={x1} y={y1} width={w} height={h} rx={3} fill="#7f1d1d" stroke={stroke} strokeWidth={sw + 0.5} />
          {/* Left terracotta flue */}
          <rect x={-w * 0.38} y={-h * 0.35} width={w * 0.32} height={h * 0.7} rx={4} fill="#ea580c" stroke="#451a03" strokeWidth={1.5} />
          <circle cx={-w * 0.22} cy={0} r={4} fill="#451a03" />
          {/* Right terracotta flue */}
          <rect x={w * 0.06} y={-h * 0.35} width={w * 0.32} height={h * 0.7} rx={4} fill="#ea580c" stroke="#451a03" strokeWidth={1.5} />
          <circle cx={w * 0.22} cy={0} r={4} fill="#451a03" />
          <text x={0} y={y2 - 5} textAnchor="middle" fontSize={7} fill="#fecaca" fontWeight="bold">CHIMNEY FLUE</text>
        </g>
      );
    }

    default:
      return null;
  }
};
