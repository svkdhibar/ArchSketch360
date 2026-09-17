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
  doorSwing?: 'left' | 'right';
  doorInswing?: boolean;
  doorAngle?: number;
  doorShowTag?: boolean;
  doorTag?: string;
  windowTag?: string;
  windowPanes?: number;
  customMeasurement?: string;
  measurementUnit?: string;
}

export const renderDoorOrWindow = ({
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
  doorSwing,
  doorInswing = false,
  doorAngle,
  doorShowTag = false,
  doorTag,
  windowTag,
  windowPanes,
  customMeasurement,
  measurementUnit,
}: SubSymbolProps): React.ReactElement | null => {
  // Shared architectural dimensions
  const jambW = 7;
  const jambD = Math.min(16, Math.max(12, h * 0.22));
  const jambY = y2 - jambD;
  const clearW = Math.max(20, w - jambW * 2);

  // Helper to generate dynamic swing arcs at any angle (0° to 180°)
  const getSwingArc = (
    hingeX: number,
    baseY: number,
    strikeX: number,
    radius: number,
    isRightHinge: boolean,
    deg: number
  ) => {
    if (deg <= 0) return '';
    const clampedDeg = Math.min(180, deg);
    const rad = (clampedDeg * Math.PI) / 180;
    const tipX = isRightHinge
      ? hingeX - radius * Math.cos(rad)
      : hingeX + radius * Math.cos(rad);
    const tipY = baseY - radius * Math.sin(rad);
    const sweep = isRightHinge ? 1 : 0;
    return `M ${strikeX} ${baseY} A ${radius} ${radius} 0 0 ${sweep} ${tipX} ${tipY}`;
  };

  // Common Door Tag callout renderer
  const renderDoorTagCallout = () => {
    if (!doorShowTag && !doorTag && !customMeasurement) return null;
    const tag = doorTag || 'D1';
    const activeUnit = (measurementUnit as MeasurementUnit) || 'ft_in';
    const measureStr = customMeasurement || formatObjectMeasurement(w, h, activeUnit);
    return (
      <g id="door-tag-badge" transform={`translate(0, ${jambY + jambD + 13})`}>
        <circle cx={0} cy={0} r={9.5} fill="#ffffff" stroke="#4f46e5" strokeWidth={1.2} />
        <text
          x={0}
          y={3.2}
          textAnchor="middle"
          fontSize={8}
          fontWeight="bold"
          fill="#312e81"
          fontFamily="monospace"
        >
          {tag}
        </text>
        {(customMeasurement || doorShowTag) && (
          <text
            x={0}
            y={14}
            textAnchor="middle"
            fontSize={7.5}
            fontWeight="600"
            fill="#475569"
            fontFamily="monospace"
          >
            {measureStr}
          </text>
        )}
      </g>
    );
  };

  // Common Window Tag callout renderer
  const renderWindowTagCallout = () => {
    if (!windowTag && !customMeasurement) return null;
    const tag = windowTag || 'W1';
    const activeUnit = (measurementUnit as MeasurementUnit) || 'ft_in';
    const measureStr = customMeasurement || formatObjectMeasurement(w, h, activeUnit);
    return (
      <g id="window-tag-badge" transform={`translate(0, ${y2 + 13})`}>
        <polygon
          points="0,-9 9,0 0,9 -9,0"
          fill="#ffffff"
          stroke="#0284c7"
          strokeWidth={1.2}
        />
        <text
          x={0}
          y={3}
          textAnchor="middle"
          fontSize={7.5}
          fontWeight="bold"
          fill="#0369a1"
          fontFamily="monospace"
        >
          {tag}
        </text>
        <text
          x={0}
          y={14}
          textAnchor="middle"
          fontSize={7.5}
          fontWeight="600"
          fill="#475569"
          fontFamily="monospace"
        >
          {measureStr}
        </text>
      </g>
    );
  };

  switch (kind) {
    // ---------------- DOORS (SIMPLE & MINIMAL) ----------------
    case 'door_single':
    case 'door_single_rh':
    case 'door_single_45': {
      // Classic, clean, minimal single swing door - respects any doorAngle (Closed, 45, 90, etc.)
      const isRight = doorSwing ? doorSwing === 'right' : kind === 'door_single_rh';
      const hingeX = isRight ? x2 - jambW : x1 + jambW;
      const strikeX = isRight ? x1 + jambW : x2 - jambW;
      const arcRadius = clearW;
      const defaultAngle = kind === 'door_single_45' ? 45 : 90;
      const effectiveAngle = doorAngle !== undefined ? doorAngle : defaultAngle;
      const leafThickness = 6;

      return (
        <g id={`symbol-${kind}`}>
          {/* Opening cutout in wall */}
          <rect x={x1} y={jambY} width={w} height={jambD} fill="#ffffff" stroke="none" />

          {/* Clean jamb posts on left and right */}
          <rect x={x1} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          <rect x={x2 - jambW} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />

          {/* Light floor threshold line */}
          <line x1={x1 + jambW} y1={jambY + jambD / 2} x2={x2 - jambW} y2={jambY + jambD / 2} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="3 2" />

          {/* Smooth, clean dashed swing arc for active angle */}
          {effectiveAngle > 0 && (
            <path
              d={getSwingArc(hingeX, jambY, strikeX, arcRadius, isRight, effectiveAngle)}
              fill="none"
              stroke="#64748b"
              strokeWidth={1.4}
              strokeDasharray="4 3"
            />
          )}

          {/* Door Leaf: Closed (0°) or Open at effectiveAngle */}
          {effectiveAngle === 0 ? (
            // Closed door position flat across opening
            <g>
              <rect
                x={x1 + jambW}
                y={jambY + (jambD - leafThickness) / 2}
                width={clearW}
                height={leafThickness}
                rx={1.5}
                fill="#f8fafc"
                stroke={stroke}
                strokeWidth={sw + 0.2}
              />
              <circle
                cx={isRight ? x1 + jambW + 8 : x2 - jambW - 8}
                cy={jambY + jambD / 2}
                r={3}
                fill="#f59e0b"
                stroke="#b45309"
                strokeWidth={1}
              />
            </g>
          ) : (
            // Angled open leaf at exact effectiveAngle (45°, 90°, or more)
            <g transform={`translate(${hingeX}, ${jambY}) rotate(${isRight ? -effectiveAngle : effectiveAngle - 180})`}>
              <rect
                x={0}
                y={-leafThickness / 2}
                width={arcRadius}
                height={leafThickness}
                rx={2}
                fill="#f8fafc"
                stroke={stroke}
                strokeWidth={sw + 0.2}
              />
              <circle
                cx={arcRadius * 0.85}
                cy={0}
                r={3}
                fill="#f59e0b"
                stroke="#b45309"
                strokeWidth={1}
              />
            </g>
          )}

          {/* Simple hinge dot */}
          <circle cx={hingeX} cy={jambY} r={2.5} fill="#475569" />

          {renderDoorTagCallout()}
        </g>
      );
    }

    case 'door_double': {
      // Simple double door: supports Closed (0°), 45°, 90°, or more
      const leafRadius = clearW / 2;
      const effectiveAngle = doorAngle !== undefined ? doorAngle : 90;
      const leafThickness = 6;
      const leftHingeX = x1 + jambW;
      const rightHingeX = x2 - jambW;

      return (
        <g id="symbol-door-double">
          <rect x={x1} y={jambY} width={w} height={jambD} fill="#ffffff" stroke="none" />
          <rect x={x1} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          <rect x={x2 - jambW} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          <line x1={x1 + jambW} y1={jambY + jambD / 2} x2={x2 - jambW} y2={jambY + jambD / 2} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="3 2" />

          {/* Swing arcs if open */}
          {effectiveAngle > 0 && (
            <>
              <path
                d={getSwingArc(leftHingeX, jambY, 0, leafRadius, false, effectiveAngle)}
                fill="none"
                stroke="#64748b"
                strokeWidth={1.4}
                strokeDasharray="4 3"
              />
              <path
                d={getSwingArc(rightHingeX, jambY, 0, leafRadius, true, effectiveAngle)}
                fill="none"
                stroke="#64748b"
                strokeWidth={1.4}
                strokeDasharray="4 3"
              />
            </>
          )}

          {effectiveAngle === 0 ? (
            // Both leaves closed flat meeting in center
            <g>
              <rect x={leftHingeX} y={jambY + (jambD - leafThickness) / 2} width={leafRadius - 0.5} height={leafThickness} rx={1.5} fill="#f8fafc" stroke={stroke} strokeWidth={sw + 0.2} />
              <rect x={0.5} y={jambY + (jambD - leafThickness) / 2} width={leafRadius - 0.5} height={leafThickness} rx={1.5} fill="#f8fafc" stroke={stroke} strokeWidth={sw + 0.2} />
              <circle cx={-5} cy={jambY + jambD / 2} r={2.5} fill="#f59e0b" stroke="#b45309" strokeWidth={0.8} />
              <circle cx={5} cy={jambY + jambD / 2} r={2.5} fill="#f59e0b" stroke="#b45309" strokeWidth={0.8} />
            </g>
          ) : (
            // Both leaves angled open
            <g>
              {/* Left leaf */}
              <g transform={`translate(${leftHingeX}, ${jambY}) rotate(${-effectiveAngle})`}>
                <rect x={0} y={-leafThickness / 2} width={leafRadius} height={leafThickness} rx={2} fill="#f8fafc" stroke={stroke} strokeWidth={sw + 0.2} />
                <circle cx={leafRadius * 0.85} cy={0} r={3} fill="#f59e0b" stroke="#b45309" strokeWidth={1} />
              </g>
              {/* Right leaf */}
              <g transform={`translate(${rightHingeX}, ${jambY}) rotate(${effectiveAngle - 180})`}>
                <rect x={0} y={-leafThickness / 2} width={leafRadius} height={leafThickness} rx={2} fill="#f8fafc" stroke={stroke} strokeWidth={sw + 0.2} />
                <circle cx={leafRadius * 0.85} cy={0} r={3} fill="#f59e0b" stroke="#b45309" strokeWidth={1} />
              </g>
            </g>
          )}

          {/* Hinge dots */}
          <circle cx={leftHingeX} cy={jambY} r={2.5} fill="#475569" />
          <circle cx={rightHingeX} cy={jambY} r={2.5} fill="#475569" />

          {renderDoorTagCallout()}
        </g>
      );
    }

    case 'door_unequal_double': {
      // Big Door + Little Door with dynamic angle
      const activeRadius = clearW * 0.7;
      const inactiveRadius = clearW * 0.3;
      const meetingX = x1 + jambW + activeRadius;
      const effectiveAngle = doorAngle !== undefined ? doorAngle : 90;
      const leafThickness = 6;
      const leftHingeX = x1 + jambW;
      const rightHingeX = x2 - jambW;

      return (
        <g id="symbol-door-unequal-double">
          <rect x={x1} y={jambY} width={w} height={jambD} fill="#ffffff" stroke="none" />
          <rect x={x1} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          <rect x={x2 - jambW} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          <line x1={x1 + jambW} y1={jambY + jambD / 2} x2={x2 - jambW} y2={jambY + jambD / 2} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="3 2" />

          {/* Swing arcs */}
          {effectiveAngle > 0 && (
            <>
              <path
                d={getSwingArc(leftHingeX, jambY, meetingX, activeRadius, false, effectiveAngle)}
                fill="none"
                stroke="#64748b"
                strokeWidth={1.4}
                strokeDasharray="4 3"
              />
              <path
                d={getSwingArc(rightHingeX, jambY, meetingX, inactiveRadius, true, effectiveAngle)}
                fill="none"
                stroke="#64748b"
                strokeWidth={1.4}
                strokeDasharray="4 3"
              />
            </>
          )}

          {effectiveAngle === 0 ? (
            <g>
              <rect x={leftHingeX} y={jambY + (jambD - leafThickness) / 2} width={activeRadius - 0.5} height={leafThickness} rx={1.5} fill="#f8fafc" stroke={stroke} strokeWidth={sw + 0.2} />
              <rect x={meetingX + 0.5} y={jambY + (jambD - leafThickness) / 2} width={inactiveRadius - 0.5} height={leafThickness} rx={1.5} fill="#f8fafc" stroke={stroke} strokeWidth={sw + 0.2} />
              <circle cx={meetingX - 6} cy={jambY + jambD / 2} r={2.5} fill="#f59e0b" stroke="#b45309" strokeWidth={0.8} />
            </g>
          ) : (
            <g>
              {/* Large active leaf */}
              <g transform={`translate(${leftHingeX}, ${jambY}) rotate(${-effectiveAngle})`}>
                <rect x={0} y={-leafThickness / 2} width={activeRadius} height={leafThickness} rx={2} fill="#f8fafc" stroke={stroke} strokeWidth={sw + 0.2} />
                <circle cx={activeRadius * 0.85} cy={0} r={3} fill="#f59e0b" stroke="#b45309" strokeWidth={1} />
              </g>
              {/* Small inactive leaf */}
              <g transform={`translate(${rightHingeX}, ${jambY}) rotate(${effectiveAngle - 180})`}>
                <rect x={0} y={-leafThickness / 2} width={inactiveRadius} height={leafThickness} rx={2} fill="#f8fafc" stroke={stroke} strokeWidth={sw + 0.2} />
                <circle cx={inactiveRadius * 0.85} cy={0} r={2.5} fill="#f59e0b" stroke="#b45309" strokeWidth={0.8} />
              </g>
            </g>
          )}

          <circle cx={leftHingeX} cy={jambY} r={2.5} fill="#475569" />
          <circle cx={rightHingeX} cy={jambY} r={2.5} fill="#475569" />

          {renderDoorTagCallout()}
        </g>
      );
    }

    case 'door_sliding': {
      // Clean, easy-to-understand 2-panel sliding glass door
      const panelW = clearW * 0.54;
      return (
        <g id="symbol-door-sliding">
          {/* Outer door frame */}
          <rect x={x1} y={jambY} width={w} height={jambD} fill="#ffffff" stroke="none" />
          <rect x={x1} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          <rect x={x2 - jambW} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />

          {/* Fixed panel (left side, slightly higher track) */}
          <rect x={x1 + jambW} y={jambY + 2} width={panelW} height={6} rx={2} fill="#bae6fd" stroke={stroke} strokeWidth={sw} />

          {/* Sliding panel (right side, lower track) */}
          <rect x={x2 - jambW - panelW} y={jambY + jambD - 8} width={panelW} height={6} rx={2} fill="#7dd3fc" stroke={stroke} strokeWidth={sw} />

          {/* Clear, cute sliding motion arrow */}
          <line x1={-12} y1={jambY + jambD / 2} x2={12} y2={jambY + jambD / 2} stroke="#0284c7" strokeWidth={2} strokeLinecap="round" />
          <polygon points="12,0 7,-3.5 7,3.5" transform={`translate(0, ${jambY + jambD / 2})`} fill="#0284c7" />

          {renderDoorTagCallout()}
        </g>
      );
    }

    case 'door_multi_slide': {
      // 3-Panel Sliding Glass Door
      const panelW = clearW * 0.4;
      const step = (jambD - 6) / 2;
      return (
        <g id="symbol-door-multi-slide">
          <rect x={x1} y={jambY} width={w} height={jambD} fill="#ffffff" stroke="none" />
          <rect x={x1} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          <rect x={x2 - jambW} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />

          {/* Panel 1 */}
          <rect x={x1 + jambW} y={jambY + 2} width={panelW} height={5} rx={1.5} fill="#bae6fd" stroke={stroke} strokeWidth={sw} />
          {/* Panel 2 */}
          <rect x={x1 + jambW + (clearW - panelW) * 0.5} y={jambY + 2 + step} width={panelW} height={5} rx={1.5} fill="#7dd3fc" stroke={stroke} strokeWidth={sw} />
          {/* Panel 3 */}
          <rect x={x2 - jambW - panelW} y={jambY + jambD - 7} width={panelW} height={5} rx={1.5} fill="#38bdf8" stroke={stroke} strokeWidth={sw} />

          {/* Slide arrow */}
          <line x1={-15} y1={jambY + jambD / 2} x2={15} y2={jambY + jambD / 2} stroke="#0284c7" strokeWidth={2} strokeLinecap="round" />
          <polygon points="15,0 9,-3.5 9,3.5" transform={`translate(0, ${jambY + jambD / 2})`} fill="#0284c7" />

          {renderDoorTagCallout()}
        </g>
      );
    }

    case 'door_pocket': {
      // Single Pocket Door sliding into the wall
      const pocketW = clearW * 0.5;
      return (
        <g id="symbol-door-pocket">
          <rect x={x1} y={jambY} width={w} height={jambD} fill="#ffffff" stroke="none" />
          <rect x={x1} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          <rect x={x2 - jambW} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />

          {/* Hollow pocket cavity on right */}
          <rect x={0} y={jambY + 2} width={halfW - jambW} height={jambD - 4} rx={1} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 2" />

          {/* Door leaf partly hidden in pocket */}
          <rect x={-pocketW * 0.4} y={jambY + (jambD - 6) / 2} width={pocketW} height={6} rx={1.5} fill="#f8fafc" stroke={stroke} strokeWidth={sw} />

          {/* Little slide handle & arrow */}
          <circle cx={-pocketW * 0.3} cy={jambY + jambD / 2} r={2} fill="#f59e0b" />
          <path d={`M ${-10} ${jambY - 6} L 10 ${jambY - 6} M 6 ${jambY - 9} L 10 ${jambY - 6} L 6 ${jambY - 3}`} stroke="#4f46e5" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />

          {renderDoorTagCallout()}
        </g>
      );
    }

    case 'door_pocket_double': {
      // Double Pocket Doors sliding into both walls
      const pocketW = w * 0.28;
      const leafW = w * 0.25;
      return (
        <g id="symbol-door-pocket-double">
          <rect x={x1} y={jambY} width={w} height={jambD} fill="#ffffff" stroke="none" />
          <rect x={x1} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          <rect x={x2 - jambW} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />

          {/* Left pocket slot */}
          <rect x={x1 + jambW} y={jambY + 2} width={pocketW} height={jambD - 4} rx={1} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 2" />
          {/* Right pocket slot */}
          <rect x={x2 - jambW - pocketW} y={jambY + 2} width={pocketW} height={jambD - 4} rx={1} fill="#f1f5f9" stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 2" />

          {/* Left door leaf */}
          <rect x={x1 + pocketW * 0.5} y={jambY + (jambD - 6) / 2} width={leafW} height={6} rx={1.5} fill="#f8fafc" stroke={stroke} strokeWidth={sw} />
          {/* Right door leaf */}
          <rect x={x2 - pocketW * 0.5 - leafW} y={jambY + (jambD - 6) / 2} width={leafW} height={6} rx={1.5} fill="#f8fafc" stroke={stroke} strokeWidth={sw} />

          {/* Center line where they meet */}
          <line x1={0} y1={jambY + 2} x2={0} y2={jambY + jambD - 2} stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="2 2" />

          {renderDoorTagCallout()}
        </g>
      );
    }

    case 'door_bifold': {
      // Clean accordion folding closet door (V-shape) - respects doorAngle
      const effectiveAngle = doorAngle !== undefined ? doorAngle : 90;
      const segment = clearW / 2;
      const foldDepth = effectiveAngle === 0 ? 0 : (Math.min(180, effectiveAngle) / 90) * 16;
      const foldX = x1 + jambW + (effectiveAngle === 0 ? segment : segment * 0.7);

      return (
        <g id="symbol-door-bifold">
          <rect x={x1} y={jambY} width={w} height={jambD} fill="#ffffff" stroke="none" />
          <rect x={x1} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          <rect x={x2 - jambW} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          <line x1={x1 + jambW} y1={jambY + jambD / 2} x2={x2 - jambW} y2={jambY + jambD / 2} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="3 2" />

          {/* Folding accordion line */}
          <polyline
            points={`${x1 + jambW},${jambY + jambD / 2} ${foldX},${jambY + jambD / 2 - foldDepth} ${x2 - jambW},${jambY + jambD / 2}`}
            fill="none"
            stroke={stroke}
            strokeWidth={sw + 1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Golden hinge dots on the fold */}
          <circle cx={x1 + jambW} cy={jambY + jambD / 2} r={2.5} fill="#475569" />
          <circle cx={foldX} cy={jambY + jambD / 2 - foldDepth} r={3} fill="#f59e0b" stroke="#b45309" strokeWidth={1} />
          <circle cx={x2 - jambW} cy={jambY + jambD / 2} r={2.5} fill="#475569" />

          {renderDoorTagCallout()}
        </g>
      );
    }

    case 'door_bifold_double': {
      // Double accordion folding doors - respects doorAngle
      const effectiveAngle = doorAngle !== undefined ? doorAngle : 90;
      const seg = clearW / 4;
      const foldDepth = effectiveAngle === 0 ? 0 : (Math.min(180, effectiveAngle) / 90) * 14;
      const leftFoldX = x1 + jambW + (effectiveAngle === 0 ? seg : seg * 0.8);
      const rightFoldX = x2 - jambW - (effectiveAngle === 0 ? seg : seg * 0.8);

      return (
        <g id="symbol-door-bifold-double">
          <rect x={x1} y={jambY} width={w} height={jambD} fill="#ffffff" stroke="none" />
          <rect x={x1} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          <rect x={x2 - jambW} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          <line x1={x1 + jambW} y1={jambY + jambD / 2} x2={x2 - jambW} y2={jambY + jambD / 2} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="3 2" />

          {/* Left folding pair */}
          <polyline
            points={`${x1 + jambW},${jambY + jambD / 2} ${leftFoldX},${jambY + jambD / 2 - foldDepth} 0,${jambY + jambD / 2}`}
            fill="none"
            stroke={stroke}
            strokeWidth={sw + 1}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right folding pair */}
          <polyline
            points={`${x2 - jambW},${jambY + jambD / 2} ${rightFoldX},${jambY + jambD / 2 - foldDepth} 0,${jambY + jambD / 2}`}
            fill="none"
            stroke={stroke}
            strokeWidth={sw + 1}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Golden fold dots */}
          <circle cx={leftFoldX} cy={jambY + jambD / 2 - foldDepth} r={2.5} fill="#f59e0b" stroke="#b45309" strokeWidth={0.8} />
          <circle cx={rightFoldX} cy={jambY + jambD / 2 - foldDepth} r={2.5} fill="#f59e0b" stroke="#b45309" strokeWidth={0.8} />

          {renderDoorTagCallout()}
        </g>
      );
    }

    case 'door_pivot': {
      // Pivot door that spins around a pivot pin - supports Closed, 45, 60, 90, etc.
      const effectiveAngle = doorAngle !== undefined ? doorAngle : 60;
      const pivotInset = clearW * 0.25;
      const pivotX = x1 + jambW + pivotInset;
      const longLeaf = clearW * 0.75;
      const tailLeaf = pivotInset;

      return (
        <g id="symbol-door-pivot">
          <rect x={x1} y={jambY} width={w} height={jambD} fill="#ffffff" stroke="none" />
          <rect x={x1} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          <rect x={x2 - jambW} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          <line x1={x1 + jambW} y1={jambY + jambD / 2} x2={x2 - jambW} y2={jambY + jambD / 2} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="3 2" />

          {/* Swing arc when open */}
          {effectiveAngle > 0 && (
            <path
              d={getSwingArc(pivotX, jambY, x2 - jambW, longLeaf, true, effectiveAngle)}
              fill="none"
              stroke="#64748b"
              strokeWidth={1.4}
              strokeDasharray="4 3"
            />
          )}

          {/* Door Leaf: Closed (0°) or Angled */}
          {effectiveAngle === 0 ? (
            <rect
              x={x1 + jambW}
              y={jambY + (jambD - 6) / 2}
              width={clearW}
              height={6}
              rx={2}
              fill="#f8fafc"
              stroke={stroke}
              strokeWidth={sw + 0.2}
            />
          ) : (
            <g transform={`translate(${pivotX}, ${jambY}) rotate(${-effectiveAngle})`}>
              <rect x={-tailLeaf} y={-3} width={clearW} height={6} rx={2} fill="#f8fafc" stroke={stroke} strokeWidth={sw + 0.2} />
              <circle cx={longLeaf * 0.7} cy={0} r={2.5} fill="#f59e0b" />
            </g>
          )}

          {/* Pivot Circle Pin */}
          <circle cx={pivotX} cy={jambY + (effectiveAngle === 0 ? jambD / 2 : 0)} r={3.5} fill="#3b82f6" stroke="#ffffff" strokeWidth={1} />

          {renderDoorTagCallout()}
        </g>
      );
    }

    case 'door_french': {
      // French glass doors: supports Closed (0°), 45°, 90°, or more
      const leaf = clearW / 2;
      const effectiveAngle = doorAngle !== undefined ? doorAngle : 90;
      const leafThickness = 6;
      const leftHingeX = x1 + jambW;
      const rightHingeX = x2 - jambW;

      return (
        <g id="symbol-door-french">
          <rect x={x1} y={jambY} width={w} height={jambD} fill="#ffffff" stroke="none" />
          <rect x={x1} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          <rect x={x2 - jambW} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          <line x1={x1 + jambW} y1={jambY + jambD / 2} x2={x2 - jambW} y2={jambY + jambD / 2} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="3 2" />

          {/* Swing arcs if open */}
          {effectiveAngle > 0 && (
            <>
              <path d={getSwingArc(leftHingeX, jambY, 0, leaf, false, effectiveAngle)} fill="none" stroke="#64748b" strokeWidth={1.4} strokeDasharray="4 3" />
              <path d={getSwingArc(rightHingeX, jambY, 0, leaf, true, effectiveAngle)} fill="none" stroke="#64748b" strokeWidth={1.4} strokeDasharray="4 3" />
            </>
          )}

          {effectiveAngle === 0 ? (
            // Both glass leaves closed flat in center
            <g>
              <rect x={leftHingeX} y={jambY + (jambD - leafThickness) / 2} width={leaf - 0.5} height={leafThickness} rx={1.5} fill="#e0f2fe" stroke={stroke} strokeWidth={sw + 0.2} />
              <rect x={0.5} y={jambY + (jambD - leafThickness) / 2} width={leaf - 0.5} height={leafThickness} rx={1.5} fill="#e0f2fe" stroke={stroke} strokeWidth={sw + 0.2} />
              <line x1={leftHingeX + leaf * 0.4} y1={jambY + jambD / 2} x2={leftHingeX + leaf * 0.6} y2={jambY + jambD / 2} stroke="#38bdf8" strokeWidth={1.5} />
              <line x1={leaf * 0.4} y1={jambY + jambD / 2} x2={leaf * 0.6} y2={jambY + jambD / 2} stroke="#38bdf8" strokeWidth={1.5} />
            </g>
          ) : (
            // Both glass leaves open at effectiveAngle
            <g>
              {/* Left Glass Leaf */}
              <g transform={`translate(${leftHingeX}, ${jambY}) rotate(${-effectiveAngle})`}>
                <rect x={0} y={-leafThickness / 2} width={leaf} height={leafThickness} rx={1.5} fill="#e0f2fe" stroke={stroke} strokeWidth={sw + 0.2} />
                <line x1={leaf * 0.3} y1={0} x2={leaf * 0.7} y2={0} stroke="#38bdf8" strokeWidth={1.5} />
                <circle cx={leaf * 0.85} cy={0} r={2.5} fill="#f59e0b" stroke="#b45309" strokeWidth={0.8} />
              </g>

              {/* Right Glass Leaf */}
              <g transform={`translate(${rightHingeX}, ${jambY}) rotate(${effectiveAngle - 180})`}>
                <rect x={0} y={-leafThickness / 2} width={leaf} height={leafThickness} rx={1.5} fill="#e0f2fe" stroke={stroke} strokeWidth={sw + 0.2} />
                <line x1={leaf * 0.3} y1={0} x2={leaf * 0.7} y2={0} stroke="#38bdf8" strokeWidth={1.5} />
                <circle cx={leaf * 0.85} cy={0} r={2.5} fill="#f59e0b" stroke="#b45309" strokeWidth={0.8} />
              </g>
            </g>
          )}

          <circle cx={leftHingeX} cy={jambY} r={2.5} fill="#475569" />
          <circle cx={rightHingeX} cy={jambY} r={2.5} fill="#475569" />

          {renderDoorTagCallout()}
        </g>
      );
    }

    case 'door_barn': {
      // Warm sliding barn door with visible overhead rail
      const doorLeafW = clearW * 0.85;
      return (
        <g id="symbol-door-barn">
          <rect x={x1} y={jambY} width={w} height={jambD} fill="#ffffff" stroke="none" />
          <rect x={x1} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          <rect x={x2 - jambW} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />

          {/* Clean overhead guide rail */}
          <line x1={x1 - 8} y1={jambY - 6} x2={x2 + 8} y2={jambY - 6} stroke="#0f172a" strokeWidth={2.5} strokeLinecap="round" />

          {/* Wooden door leaf */}
          <g transform={`translate(${x1 + 6}, ${jambY - 10})`}>
            <rect x={0} y={0} width={doorLeafW} height={7} rx={2} fill="#d97706" stroke="#92400e" strokeWidth={1.2} />
            {/* 2 Hanging trolley wheels */}
            <circle cx={doorLeafW * 0.25} cy={-2} r={2.5} fill="#0f172a" />
            <circle cx={doorLeafW * 0.75} cy={-2} r={2.5} fill="#0f172a" />
            {/* White handle */}
            <rect x={doorLeafW * 0.82} y={1.5} width={2} height={4} rx={0.5} fill="#ffffff" />
          </g>

          {/* Slide Arrow */}
          <path d={`M ${-10} ${jambY + jambD + 5} L 10 ${jambY + jambD + 5} M 6 ${jambY + jambD + 2} L 10 ${jambY + jambD + 5} L 6 ${jambY + jambD + 8}`} stroke="#d97706" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />

          {renderDoorTagCallout()}
        </g>
      );
    }

    case 'door_fire_exit': {
      // Fire Exit Door with friendly green exit arrow & red push bar - respects doorAngle
      const arcRadius = clearW;
      const effectiveAngle = doorAngle !== undefined ? doorAngle : 90;
      const leafThickness = 6;
      const hingeX = x1 + jambW;
      const strikeX = x2 - jambW;

      return (
        <g id="symbol-door-fire-exit">
          <rect x={x1} y={jambY} width={w} height={jambD} fill="#ffffff" stroke="none" />
          <rect x={x1} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          <rect x={x2 - jambW} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          <line x1={x1 + jambW} y1={jambY + jambD / 2} x2={x2 - jambW} y2={jambY + jambD / 2} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="3 2" />

          {/* Green exit swing arc if open */}
          {effectiveAngle > 0 && (
            <path
              d={getSwingArc(hingeX, jambY, strikeX, arcRadius, false, effectiveAngle)}
              fill="none"
              stroke="#16a34a"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
          )}

          {/* Door leaf with red panic bar */}
          {effectiveAngle === 0 ? (
            <g>
              <rect x={x1 + jambW} y={jambY + (jambD - leafThickness) / 2} width={clearW} height={leafThickness} rx={2} fill="#f8fafc" stroke={stroke} strokeWidth={sw + 0.2} />
              <rect x={x1 + jambW + 10} y={jambY + (jambD - 4) / 2} width={clearW - 20} height={4} rx={1} fill="#ef4444" />
            </g>
          ) : (
            <g transform={`translate(${hingeX}, ${jambY}) rotate(${-effectiveAngle})`}>
              <rect x={0} y={-leafThickness / 2} width={arcRadius} height={leafThickness} rx={2} fill="#f8fafc" stroke={stroke} strokeWidth={sw + 0.2} />
              {/* Red push panic bar */}
              <rect x={arcRadius * 0.25} y={-leafThickness / 2 - 3} width={arcRadius * 0.5} height={3} rx={1} fill="#ef4444" />
            </g>
          )}

          {/* Friendly Green Exit Arrow */}
          <g transform={`translate(${x1 + clearW * 0.55}, ${jambY - arcRadius * 0.45})`}>
            <line x1={0} y1={12} x2={0} y2={-8} stroke="#16a34a" strokeWidth={2.2} strokeLinecap="round" />
            <polygon points="0,-12 -4,-5 4,-5" fill="#16a34a" />
          </g>

          <circle cx={hingeX} cy={jambY} r={2.5} fill="#475569" />

          {renderDoorTagCallout()}
        </g>
      );
    }

    case 'door_main': {
      // Main Entrance with side windows & double doors - respects doorAngle
      const sidelightW = 16;
      const mainOpeningW = w - sidelightW * 2 - jambW * 2;
      const leafR = mainOpeningW / 2;
      const effectiveAngle = doorAngle !== undefined ? doorAngle : 90;
      const leafThickness = 6;
      const leftHingeX = x1 + jambW + sidelightW;
      const rightHingeX = x2 - jambW - sidelightW;

      return (
        <g id="symbol-door-main">
          <rect x={x1} y={jambY} width={w} height={jambD} fill="#ffffff" stroke="none" />

          {/* Left window sidelight */}
          <rect x={x1 + jambW} y={jambY} width={sidelightW} height={jambD} fill="#e0f2fe" stroke={stroke} strokeWidth={sw} />
          {/* Right window sidelight */}
          <rect x={x2 - jambW - sidelightW} y={jambY} width={sidelightW} height={jambD} fill="#e0f2fe" stroke={stroke} strokeWidth={sw} />

          {/* Jamb posts */}
          <rect x={x1} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          <rect x={x2 - jambW} y={jambY} width={jambW} height={jambD} rx={1} fill="#1e293b" stroke={stroke} strokeWidth={sw} />

          <line x1={leftHingeX} y1={jambY + jambD / 2} x2={rightHingeX} y2={jambY + jambD / 2} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="3 2" />

          {/* Left & Right Arcs if open */}
          {effectiveAngle > 0 && (
            <>
              <path
                d={getSwingArc(leftHingeX, jambY, 0, leafR, false, effectiveAngle)}
                fill="none"
                stroke="#64748b"
                strokeWidth={1.4}
                strokeDasharray="4 3"
              />
              <path
                d={getSwingArc(rightHingeX, jambY, 0, leafR, true, effectiveAngle)}
                fill="none"
                stroke="#64748b"
                strokeWidth={1.4}
                strokeDasharray="4 3"
              />
            </>
          )}

          {effectiveAngle === 0 ? (
            // Both leaves closed flat meeting in center
            <g>
              <rect x={leftHingeX} y={jambY + (jambD - leafThickness) / 2} width={leafR - 0.5} height={leafThickness} rx={2} fill="#92400e" stroke="#451a03" strokeWidth={sw} />
              <rect x={0.5} y={jambY + (jambD - leafThickness) / 2} width={leafR - 0.5} height={leafThickness} rx={2} fill="#92400e" stroke="#451a03" strokeWidth={sw} />
              <circle cx={-4} cy={jambY + jambD / 2} r={2.5} fill="#f59e0b" />
              <circle cx={4} cy={jambY + jambD / 2} r={2.5} fill="#f59e0b" />
            </g>
          ) : (
            <g>
              {/* Left Leaf */}
              <g transform={`translate(${leftHingeX}, ${jambY}) rotate(${-effectiveAngle})`}>
                <rect x={0} y={-leafThickness / 2} width={leafR} height={leafThickness} rx={2} fill="#92400e" stroke="#451a03" strokeWidth={sw} />
                <circle cx={leafR * 0.85} cy={0} r={2.5} fill="#f59e0b" />
              </g>

              {/* Right Leaf */}
              <g transform={`translate(${rightHingeX}, ${jambY}) rotate(${effectiveAngle - 180})`}>
                <rect x={0} y={-leafThickness / 2} width={leafR} height={leafThickness} rx={2} fill="#92400e" stroke="#451a03" strokeWidth={sw} />
                <circle cx={leafR * 0.85} cy={0} r={2.5} fill="#f59e0b" />
              </g>
            </g>
          )}

          <circle cx={leftHingeX} cy={jambY} r={2.5} fill="#475569" />
          <circle cx={rightHingeX} cy={jambY} r={2.5} fill="#475569" />

          {renderDoorTagCallout()}
        </g>
      );
    }

    case 'door_revolving': {
      // Revolving door: circular drum with 4 rotating wings
      const r = Math.min(w, h) * 0.45;
      return (
        <g id="symbol-door-revolving">
          {/* Circular outer enclosure arcs */}
          <path d={`M ${-r} 0 A ${r} ${r} 0 0 1 0 ${-r}`} fill="none" stroke={stroke} strokeWidth={sw + 0.8} />
          <path d={`M ${r} 0 A ${r} ${r} 0 0 1 0 ${r}`} fill="none" stroke={stroke} strokeWidth={sw + 0.8} />

          {/* Center spindle */}
          <circle cx={0} cy={0} r={4.5} fill="#475569" stroke={stroke} strokeWidth={sw} />

          {/* 4 Rotating glass wings */}
          <line x1={0} y1={0} x2={0} y2={-r + 3} stroke={stroke} strokeWidth={sw + 0.6} strokeLinecap="round" />
          <line x1={0} y1={0} x2={r - 3} y2={0} stroke={stroke} strokeWidth={sw + 0.6} strokeLinecap="round" />
          <line x1={0} y1={0} x2={0} y2={r - 3} stroke={stroke} strokeWidth={sw + 0.6} strokeLinecap="round" />
          <line x1={0} y1={0} x2={-r + 3} y2={0} stroke={stroke} strokeWidth={sw + 0.6} strokeLinecap="round" />

          {/* Circular spin arrow */}
          <path d={`M ${r * 0.45} ${-r * 0.25} A ${r * 0.5} ${r * 0.5} 0 0 1 ${r * 0.25} ${r * 0.45}`} fill="none" stroke="#3b82f6" strokeWidth={1.8} />
          <polygon points={`${r * 0.25},${r * 0.45} ${r * 0.33},${r * 0.38} ${r * 0.26},${r * 0.32}`} fill="#3b82f6" />

          {renderDoorTagCallout()}
        </g>
      );
    }

    // ---------------- WINDOWS ----------------
    case 'window_single': {
      return (
        <g id="symbol-window-single">
          {/* Exterior masonry sill */}
          <rect x={x1 - 4} y={y1} width={w + 8} height={6} rx={1} fill="#e2e8f0" stroke={stroke} strokeWidth={1.2} />
          {/* Window frame */}
          <rect x={x1} y={y1 + 6} width={w} height={h - 6} fill="#ffffff" stroke={stroke} strokeWidth={sw} />
          {/* Glazing / glass pane */}
          <rect x={x1 + 6} y={y1 + 10} width={w - 12} height={h - 14} fill="#bae6fd" stroke="#0284c7" strokeWidth={1} />
          {/* Glass reflection highlight lines */}
          <line x1={x1 + 16} y1={y2 - 6} x2={x1 + 28} y2={y1 + 14} stroke="#ffffff" strokeWidth={1.5} strokeLinecap="round" />
          <line x1={x1 + 32} y1={y2 - 6} x2={x1 + 44} y2={y1 + 14} stroke="#ffffff" strokeWidth={1.5} strokeLinecap="round" />
          {renderWindowTagCallout()}
        </g>
      );
    }

    case 'window_double': {
      return (
        <g id="symbol-window-double">
          <rect x={x1 - 4} y={y1} width={w + 8} height={5} rx={1} fill="#e2e8f0" stroke={stroke} strokeWidth={1.2} />
          <rect x={x1} y={y1 + 5} width={w} height={h - 5} fill="#ffffff" stroke={stroke} strokeWidth={sw} />
          {/* Left & Right sashes */}
          <rect x={x1 + 4} y={y1 + 8} width={halfW - 6} height={h - 12} fill="#bae6fd" stroke="#0284c7" strokeWidth={1} />
          <rect x={2} y={y1 + 8} width={halfW - 6} height={h - 12} fill="#bae6fd" stroke="#0284c7" strokeWidth={1} />
          {/* Central mullion */}
          <rect x={-2} y={y1 + 5} width={4} height={h - 5} fill="#475569" />
          {renderWindowTagCallout()}
        </g>
      );
    }

    case 'window_sliding': {
      return (
        <g id="symbol-window-sliding">
          <rect x={x1} y={y1} width={w} height={h} fill="#ffffff" stroke={stroke} strokeWidth={sw} />
          {/* Sliding overlapping sashes */}
          <rect x={x1 + 3} y={y1 + 4} width={halfW + 4} height={h * 0.4} fill="#bae6fd" stroke={stroke} strokeWidth={1} />
          <rect x={-4} y={y1 + h * 0.45} width={halfW + 2} height={h * 0.4} fill="#bae6fd" stroke={stroke} strokeWidth={1} />
          {/* Slide arrows */}
          <path d={`M ${-w * 0.2} ${y1 + h * 0.25} L ${w * 0.15} ${y1 + h * 0.25}`} stroke="#0284c7" strokeWidth={1.5} />
          <polygon points={`${w * 0.15},${y1 + h * 0.25} ${w * 0.08},${y1 + h * 0.18} ${w * 0.08},${y1 + h * 0.32}`} fill="#0284c7" />
          {renderWindowTagCallout()}
        </g>
      );
    }

    case 'window_corner': {
      // 90-degree corner mitred glass window
      return (
        <g id="symbol-window-corner">
          {/* Corner post */}
          <rect x={x1} y={y1} width={12} height={12} fill="#334155" stroke={stroke} strokeWidth={sw} />
          {/* Horizontal glass leg */}
          <rect x={x1 + 12} y={y1 + 2} width={w - 12} height={8} fill="#bae6fd" stroke={stroke} strokeWidth={1.2} />
          <line x1={x1 + 12} y1={y1 + 6} x2={x2} y2={y1 + 6} stroke="#38bdf8" strokeWidth={1.5} />
          {/* Vertical glass leg */}
          <rect x={x1 + 2} y={y1 + 12} width={8} height={h - 12} fill="#bae6fd" stroke={stroke} strokeWidth={1.2} />
          <line x1={x1 + 6} y1={y1 + 12} x2={x1 + 6} y2={y2} stroke="#38bdf8" strokeWidth={1.5} />
          {/* Corner dimension arc */}
          <path d={`M ${x1 + 24} ${y1 + 8} A 16 16 0 0 1 ${x1 + 8} ${y1 + 24}`} fill="none" stroke="#94a3b8" strokeWidth={1} strokeDasharray="2 2" />
        </g>
      );
    }

    case 'window_bay': {
      const inset = h * 0.35;
      return (
        <g id="symbol-window-bay">
          {/* Bay polygon sill & frame */}
          <polygon
            points={`${x1},${y1 + inset} ${x1 + w * 0.25},${y1} ${x2 - w * 0.25},${y1} ${x2},${y1 + inset} ${x2},${y2} ${x1},${y2}`}
            fill="#f8fafc"
            stroke={stroke}
            strokeWidth={sw}
          />
          {/* Glazing panes */}
          <line x1={x1} y1={y1 + inset} x2={x1 + w * 0.25} y2={y1} stroke="#0284c7" strokeWidth={3} />
          <line x1={x1 + w * 0.25} y1={y1} x2={x2 - w * 0.25} y2={y1} stroke="#0284c7" strokeWidth={3} />
          <line x1={x2 - w * 0.25} y1={y1} x2={x2} y2={y1 + inset} stroke="#0284c7" strokeWidth={3} />
          {/* Mullions */}
          <circle cx={x1 + w * 0.25} cy={y1} r={3} fill="#334155" />
          <circle cx={x2 - w * 0.25} cy={y1} r={3} fill="#334155" />
        </g>
      );
    }

    case 'window_large': {
      return (
        <g id="symbol-window-large">
          <rect x={x1} y={y1} width={w} height={h} fill="#7dd3fc" stroke={stroke} strokeWidth={sw + 0.8} />
          {/* 4 Mullion divisions */}
          <line x1={-w * 0.25} y1={y1} x2={-w * 0.25} y2={y2} stroke={stroke} strokeWidth={sw} />
          <line x1={0} y1={y1} x2={0} y2={y2} stroke={stroke} strokeWidth={sw + 0.5} />
          <line x1={w * 0.25} y1={y1} x2={w * 0.25} y2={y2} stroke={stroke} strokeWidth={sw} />
          <line x1={x1} y1={0} x2={x2} y2={0} stroke="#ffffff" strokeWidth={1.5} />
        </g>
      );
    }

    case 'window_skylight': {
      // Ceiling skylight with diagonal frame cross
      return (
        <g id="symbol-window-skylight">
          <rect x={x1} y={y1} width={w} height={h} fill="#e0f2fe" stroke={stroke} strokeWidth={sw} />
          <rect x={x1 + 6} y={y1 + 6} width={w - 12} height={h - 12} fill="#bae6fd" stroke="#0284c7" strokeWidth={1} />
          {/* Diagonal architectural roof cross */}
          <line x1={x1 + 6} y1={y1 + 6} x2={x2 - 6} y2={y2 - 6} stroke="#0284c7" strokeWidth={1.2} strokeDasharray="3 3" />
          <line x1={x1 + 6} y1={y2 - 6} x2={x2 - 6} y2={y1 + 6} stroke="#0284c7" strokeWidth={1.2} strokeDasharray="3 3" />
          <text x={0} y={4} textAnchor="middle" fontSize={9} fill="#0369a1" fontWeight="bold">SKYLIGHT</text>
        </g>
      );
    }

    case 'door_dutch': {
      // Dutch door: split upper/lower stable door with 90° swing arc & center shelf
      const leafLen = Math.min(w, h) * 0.85;
      return (
        <g id="symbol-door-dutch">
          {/* Frame jambs */}
          <rect x={x1} y={y1} width={6} height={h} fill="#334155" stroke={stroke} strokeWidth={sw} />
          <rect x={x2 - 6} y={y1} width={6} height={h} fill="#334155" stroke={stroke} strokeWidth={sw} />
          {/* Dual leaf swing arc */}
          <path
            d={`M ${x1 + 6} ${y2} A ${leafLen} ${leafLen} 0 0 1 ${x1 + 6 + leafLen} ${y2 - leafLen}`}
            fill="none"
            stroke="#0284c7"
            strokeWidth={1.2}
            strokeDasharray="4 3"
          />
          {/* Lower leaf solid line */}
          <line x1={x1 + 6} y1={y2} x2={x1 + 6 + leafLen * 0.7} y2={y2 - leafLen * 0.7} stroke="#0f172a" strokeWidth={3} />
          {/* Upper leaf open further */}
          <line x1={x1 + 6} y1={y2} x2={x1 + 6} y2={y2 - leafLen} stroke="#0284c7" strokeWidth={2} />
          {/* Dutch split shelf */}
          <circle cx={x1 + 6} cy={y2} r={3.5} fill="#ca8a04" />
          <text x={x2 - 16} y={y2 - 8} fontSize={7} fill="#64748b" fontWeight="bold">DUTCH</text>
        </g>
      );
    }

    case 'door_jib': {
      // Flush jib secret door with offset pivot and wall-matching cladding
      return (
        <g id="symbol-door-jib">
          {/* Wall opening hairline boundary */}
          <line x1={x1} y1={0} x2={x2} y2={0} stroke={stroke} strokeWidth={1} strokeDasharray="3 2" />
          {/* Angled pivoted door leaf */}
          <line x1={x1 + 10} y1={4} x2={x2 - 8} y2={-halfH * 0.8} stroke="#0f172a" strokeWidth={3.5} strokeLinecap="round" />
          {/* Concealed pivot hinge */}
          <circle cx={x1 + 10} cy={4} r={3} fill="#4f46e5" />
          {/* Subtle arc */}
          <path
            d={`M ${x2} 0 Q ${x2 - 4} ${-halfH * 0.5} ${x2 - 8} ${-halfH * 0.8}`}
            fill="none"
            stroke="#6366f1"
            strokeWidth={1}
            strokeDasharray="2 2"
          />
          <text x={0} y={halfH - 4} textAnchor="middle" fontSize={7} fill="#6366f1" fontWeight="bold">JIB / SECRET</text>
        </g>
      );
    }

    case 'door_tambour': {
      // Overhead roll-up commercial security shutter door with side guide tracks
      return (
        <g id="symbol-door-tambour">
          {/* Heavy side steel guide tracks */}
          <rect x={x1} y={y1} width={8} height={h} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          <rect x={x2 - 8} y={y1} width={8} height={h} fill="#1e293b" stroke={stroke} strokeWidth={sw} />
          {/* Overhead coil canister roll */}
          <rect x={x1 + 8} y={y1} width={w - 16} height={h * 0.35} rx={3} fill="#475569" stroke={stroke} strokeWidth={1.2} />
          <circle cx={x1 + 14} cy={y1 + h * 0.17} r={4} fill="#94a3b8" />
          <circle cx={x2 - 14} cy={y1 + h * 0.17} r={4} fill="#94a3b8" />
          {/* Corrugated curtain slats */}
          {Array.from({ length: 5 }).map((_, i) => (
            <line key={i} x1={x1 + 10} y1={y1 + h * 0.42 + i * (h * 0.11)} x2={x2 - 10} y2={y1 + h * 0.42 + i * (h * 0.11)} stroke="#64748b" strokeWidth={1.5} />
          ))}
          <text x={0} y={y2 - 4} textAnchor="middle" fontSize={7} fill="#1e293b" fontWeight="bold">SHUTTER</text>
        </g>
      );
    }

    case 'window_arched': {
      // Classical Roman arched window with curved fanlight sunburst & double-hung panes
      return (
        <g id="symbol-window-arched">
          {/* Lower rectangular frame */}
          <rect x={x1} y={0} width={w} height={halfH} fill="#f8fafc" stroke={stroke} strokeWidth={sw} />
          <line x1={0} y1={0} x2={0} y2={halfH} stroke={stroke} strokeWidth={sw} />
          {/* Upper semi-circle arch */}
          <path
            d={`M ${x1} 0 A ${halfW} ${halfW} 0 0 1 ${x2} 0 Z`}
            fill="#e0f2fe"
            stroke={stroke}
            strokeWidth={sw}
          />
          {/* Sunburst radial mullions */}
          {[30, 60, 90, 120, 150].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={0}
                y1={0}
                x2={-Math.cos(rad) * halfW}
                y2={-Math.sin(rad) * halfW}
                stroke="#0284c7"
                strokeWidth={1.2}
              />
            );
          })}
        </g>
      );
    }

    case 'window_louvre': {
      // Jalousie / Louvre architectural slat window
      return (
        <g id="symbol-window-louvre">
          <rect x={x1} y={y1} width={w} height={h} fill="#f0f9ff" stroke={stroke} strokeWidth={sw} />
          {/* Angled louvre glass blades */}
          {Array.from({ length: 6 }).map((_, i) => {
            const ly = y1 + 6 + i * ((h - 12) / 5);
            return (
              <g key={i}>
                <line x1={x1 + 4} y1={ly - 2} x2={x2 - 4} y2={ly + 4} stroke="#0284c7" strokeWidth={1.8} />
                <circle cx={x1 + 4} cy={ly - 2} r={1.5} fill="#475569" />
              </g>
            );
          })}
        </g>
      );
    }

    case 'window_clerestory': {
      // High ribbon clerestory window band with continuous structural mullions
      return (
        <g id="symbol-window-clerestory">
          <rect x={x1} y={y1} width={w} height={h} fill="#e0f2fe" stroke={stroke} strokeWidth={sw} />
          {/* Glazing lines */}
          <line x1={x1} y1={0} x2={x2} y2={0} stroke="#0284c7" strokeWidth={2} />
          {/* 5 Equal ribbon panes */}
          {Array.from({ length: 4 }).map((_, i) => {
            const mx = x1 + (i + 1) * (w / 5);
            return <line key={i} x1={mx} y1={y1} x2={mx} y2={y2} stroke={stroke} strokeWidth={sw} />;
          })}
          <text x={0} y={h > 24 ? 3 : 2} textAnchor="middle" fontSize={6} fill="#0284c7" fontWeight="bold">CLERESTORY</text>
        </g>
      );
    }

    case 'window_garden': {
      // Projecting greenhouse garden box window with plant display shelf
      return (
        <g id="symbol-window-garden">
          {/* Wall cutout sill */}
          <rect x={x1} y={y1} width={w} height={h * 0.35} fill="#e2e8f0" stroke={stroke} strokeWidth={sw} />
          {/* Projecting 3-sided glass box */}
          <polygon
            points={`${x1},${y1 + h * 0.35} ${x1 + 10},${y2} ${x2 - 10},${y2} ${x2},${y1 + h * 0.35}`}
            fill="#bae6fd"
            stroke="#0284c7"
            strokeWidth={1.5}
          />
          {/* Potted herbs / plants on shelf */}
          <circle cx={-12} cy={y2 - 8} r={5} fill="#16a34a" />
          <circle cx={12} cy={y2 - 8} r={5} fill="#16a34a" />
          <circle cx={0} cy={y2 - 9} r={6} fill="#22c55e" />
        </g>
      );
    }

    default:
      return null;
  }
};
