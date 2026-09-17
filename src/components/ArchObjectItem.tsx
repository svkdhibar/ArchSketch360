/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { ArchObject, HandleType, MeasurementUnit, ToolType } from '../types';
import { ArchSymbolGraphic } from './ArchSymbols';
import { formatObjectMeasurement } from '../utils/measurement';

export const ERASE_CROSSHAIR_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='9' fill='%23ef4444' fill-opacity='0.16' stroke='%23dc2626' stroke-width='1.5' stroke-dasharray='3 2'/%3E%3Cline x1='16' y1='2' x2='16' y2='8' stroke='%23dc2626' stroke-width='2' stroke-linecap='round'/%3E%3Cline x1='16' y1='24' x2='16' y2='30' stroke='%23dc2626' stroke-width='2' stroke-linecap='round'/%3E%3Cline x1='2' y1='16' x2='8' y2='16' stroke='%23dc2626' stroke-width='2' stroke-linecap='round'/%3E%3Cline x1='24' y1='16' x2='30' y2='16' stroke='%23dc2626' stroke-width='2' stroke-linecap='round'/%3E%3Ccircle cx='16' cy='16' r='2' fill='%23dc2626'/%3E%3Cpath d='M23 5 L27 9 L21 15 L17 11 Z' fill='%23fb7185' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E") 16 16, crosshair`;

export interface ArchObjectItemProps {
  obj: ArchObject;
  isSelected: boolean;
  isRotatingThis: boolean;
  isEraseHovered: boolean;
  tool: ToolType;
  measurementUnit: MeasurementUnit;
  liveRotatingDegree: number | null;
  onPointerDown: (e: React.PointerEvent, obj: ArchObject) => void;
  onPointerEnter: (id: string) => void;
  onPointerLeave: () => void;
  onContextMenu?: (obj: ArchObject, e: React.MouseEvent) => void;
  onResizeHandlePointerDown: (e: React.PointerEvent, obj: ArchObject, handle: HandleType) => void;
  onRotateHandlePointerDown: (e: React.PointerEvent, obj: ArchObject) => void;
}

const ArchObjectItemComponent: React.FC<ArchObjectItemProps> = ({
  obj,
  isSelected,
  isRotatingThis,
  isEraseHovered,
  tool,
  measurementUnit,
  liveRotatingDegree,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
  onContextMenu,
  onResizeHandlePointerDown,
  onRotateHandlePointerDown,
}) => {
  const longPressTimerRef = useRef<number | null>(null);

  const handlePointerDownWithLongPress = (e: React.PointerEvent) => {
    onPointerDown(e, obj);
    // On touch devices (or touch pointers), initiate a 500ms long-press to open the 360° inspector & rotation panel
    if (e.pointerType === 'touch' && onContextMenu) {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      const clientX = e.clientX;
      const clientY = e.clientY;
      longPressTimerRef.current = window.setTimeout(() => {
        // Trigger synthetic context menu event for mobile long-press
        onContextMenu(obj, {
          clientX,
          clientY,
          preventDefault: () => {},
          stopPropagation: () => {},
        } as unknown as React.MouseEvent);
      }, 550);
    }
  };

  const handlePointerUpOrLeave = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  return (
    <g
      id={`arch-object-${obj.id}`}
      transform={`translate(${obj.x}, ${obj.y}) rotate(${obj.angle})`}
      onPointerDown={handlePointerDownWithLongPress}
      onPointerUp={handlePointerUpOrLeave}
      onPointerCancel={handlePointerUpOrLeave}
      onPointerEnter={() => onPointerEnter(obj.id)}
      onPointerLeave={() => {
        handlePointerUpOrLeave();
        onPointerLeave();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu?.(obj, e);
      }}
      style={tool === 'erase' ? { cursor: ERASE_CROSSHAIR_CURSOR } : undefined}
      className={tool === 'erase' ? '' : 'cursor-move'}
    >
      {/* Visual Icon Graphic (Rotates 360 degrees and supports horizontal/vertical mirroring) */}
      <g transform={`scale(${obj.flipH ? -1 : 1}, ${obj.flipV ? -1 : 1})`}>
        <ArchSymbolGraphic
          kind={obj.kind}
          w={obj.w}
          h={obj.h}
          name={obj.name}
          color={obj.color}
          doorSwing={obj.doorSwing}
          doorInswing={obj.doorInswing}
          doorAngle={obj.doorAngle}
          doorShowTag={obj.doorShowTag}
          doorTag={obj.doorTag}
          wallThickness={obj.wallThickness}
          roomName={obj.roomName !== undefined ? obj.roomName : (obj.kind === 'room' ? obj.name : undefined)}
          showRoomLabel={obj.showRoomLabel}
          roomFloorPattern={obj.roomFloorPattern}
          windowPanes={obj.windowPanes}
          windowTag={obj.windowTag}
          polygonPoints={obj.polygonPoints}
          imageUrl={obj.imageUrl}
          imageOpacity={obj.imageOpacity}
          customMeasurement={obj.customMeasurement}
          measurementUnit={obj.measurementUnit || measurementUnit}
        />
      </g>

      {/* Eraser Target Highlight - clear crimson halo & remove badge */}
      {isEraseHovered && (
        <g className="pointer-events-none">
          <rect
            x={-obj.w / 2 - 6}
            y={-obj.h / 2 - 6}
            width={obj.w + 12}
            height={obj.h + 12}
            fill="rgba(239, 68, 68, 0.18)"
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="4 3"
            rx={6}
          />
          <g transform={`translate(${obj.w / 2 + 12}, ${-obj.h / 2 - 6})`}>
            <circle cx={0} cy={0} r={10} fill="#ef4444" stroke="#ffffff" strokeWidth={1.5} />
            <text x={0} y={3.5} textAnchor="middle" fontSize={11} fill="#ffffff" fontWeight="bold">✕</text>
          </g>
        </g>
      )}

      {/* Selection Bounding Box & 360° Rotation Controls */}
      {isSelected && (
        <g className="pointer-events-auto">
          {/* Bounding Box / Custom Polygon Outline */}
          {obj.polygonPoints && obj.polygonPoints.length >= 3 ? (
            <polygon
              points={obj.polygonPoints.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={obj.locked ? '#f59e0b' : '#4f46e5'}
              strokeWidth={2}
              strokeDasharray="4 3"
            />
          ) : (
            <rect
              x={-obj.w / 2 - 4}
              y={-obj.h / 2 - 4}
              width={obj.w + 8}
              height={obj.h + 8}
              fill="none"
              stroke={obj.locked ? '#f59e0b' : '#4f46e5'}
              strokeWidth={1.8}
              strokeDasharray="4 3"
            />
          )}

          {/* Lock Badge */}
          {obj.locked && (
            <g transform={`translate(${obj.w / 2 + 10}, ${-obj.h / 2 - 10})`}>
              <circle cx="0" cy="0" r="10" fill="#fef3c7" stroke="#d97706" strokeWidth="1.2" />
              <text x="0" y="3.5" textAnchor="middle" fontSize="10" fill="#b45309">
                🔒
              </text>
            </g>
          )}

          {/* Active Corner Resize Handles (Available when unlocked) with Touch Hit Padding */}
          {!obj.locked && (
            <>
              {/* NW */}
              <g
                id={`handle-nw-${obj.id}`}
                className="cursor-nwse-resize"
                onPointerDown={(e) => onResizeHandlePointerDown(e, obj, 'nw')}
              >
                <circle cx={-obj.w / 2 - 3.5} cy={-obj.h / 2 - 3.5} r="16" fill="transparent" />
                <rect
                  x={-obj.w / 2 - 8}
                  y={-obj.h / 2 - 8}
                  width="9"
                  height="9"
                  fill="#ffffff"
                  stroke="#4f46e5"
                  strokeWidth="2"
                  rx="1.5"
                />
              </g>
              {/* NE */}
              <g
                id={`handle-ne-${obj.id}`}
                className="cursor-nesw-resize"
                onPointerDown={(e) => onResizeHandlePointerDown(e, obj, 'ne')}
              >
                <circle cx={obj.w / 2 + 3.5} cy={-obj.h / 2 - 3.5} r="16" fill="transparent" />
                <rect
                  x={obj.w / 2 - 1}
                  y={-obj.h / 2 - 8}
                  width="9"
                  height="9"
                  fill="#ffffff"
                  stroke="#4f46e5"
                  strokeWidth="2"
                  rx="1.5"
                />
              </g>
              {/* SE */}
              <g
                id={`handle-se-${obj.id}`}
                className="cursor-nwse-resize"
                onPointerDown={(e) => onResizeHandlePointerDown(e, obj, 'se')}
              >
                <circle cx={obj.w / 2 + 3.5} cy={obj.h / 2 + 3.5} r="16" fill="transparent" />
                <rect
                  x={obj.w / 2 - 1}
                  y={obj.h / 2 - 1}
                  width="9"
                  height="9"
                  fill="#ffffff"
                  stroke="#4f46e5"
                  strokeWidth="2"
                  rx="1.5"
                />
              </g>
              {/* SW */}
              <g
                id={`handle-sw-${obj.id}`}
                className="cursor-nesw-resize"
                onPointerDown={(e) => onResizeHandlePointerDown(e, obj, 'sw')}
              >
                <circle cx={-obj.w / 2 - 3.5} cy={obj.h / 2 + 3.5} r="16" fill="transparent" />
                <rect
                  x={-obj.w / 2 - 8}
                  y={obj.h / 2 - 1}
                  width="9"
                  height="9"
                  fill="#ffffff"
                  stroke="#4f46e5"
                  strokeWidth="2"
                  rx="1.5"
                />
              </g>

              {/* Interactive Measurement & Dimension Tag */}
              {(() => {
                // Rooms have their own clean internal label & measurement system
                if (obj.kind === 'room' || obj.kind === 'room_circle' || obj.kind === 'room_l') {
                  return null;
                }
                const measureText = formatObjectMeasurement(
                  obj.w,
                  obj.h,
                  obj.measurementUnit || measurementUnit,
                  obj.customMeasurement
                );
                const tagWidth = Math.max(68, measureText.length * 7.2 + 16);
                return (
                  <g
                    transform={`translate(0, ${obj.h / 2 + 18})`}
                    className="pointer-events-none select-none"
                  >
                    <rect
                      x={-tagWidth / 2}
                      y="-9"
                      width={tagWidth}
                      height="18"
                      rx="4"
                      fill="#09090b"
                      fillOpacity="0.92"
                      stroke={obj.customMeasurement ? '#10b981' : '#6366f1'}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fontSize="9.5"
                      fill={obj.customMeasurement ? '#6ee7b7' : '#e0e7ff'}
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {measureText}
                    </text>
                  </g>
                );
              })()}

              {/* 360° ROTATION INTERACTIVE HANDLE */}
              <line
                x1="0"
                y1={-obj.h / 2 - 4}
                x2="0"
                y2={-obj.h / 2 - 32}
                stroke="#4f46e5"
                strokeWidth="1.6"
                strokeDasharray="3 2"
              />

              {/* Interactive Rotation Grip Knob */}
              <g
                id={`rotate-handle-${obj.id}`}
                transform={`translate(0, ${-obj.h / 2 - 32})`}
                onPointerDown={(e) => onRotateHandlePointerDown(e, obj)}
                className="cursor-grab active:cursor-grabbing group/rot"
              >
                {/* Large invisible touch hit area for mobile thumb */}
                <circle cx="0" cy="0" r="18" fill="transparent" />

                {/* Outer knob */}
                <circle
                  cx="0"
                  cy="0"
                  r="9"
                  fill="#4f46e5"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-transform group-hover/rot:scale-125 shadow-md shadow-indigo-500/40"
                />

                {/* Icon glyph inside knob */}
                <path
                  d="M -3 -1 A 4 4 0 1 1 3 2 M 3 -1 L 3 2 L 0 2"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>

              {/* Angle protractor overlay while actively rotating */}
              {isRotatingThis && (
                <g className="pointer-events-none">
                  <circle
                    cx="0"
                    cy="0"
                    r={Math.max(obj.w, obj.h) * 0.75 + 20}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    opacity="0.6"
                  />
                  {/* Angle readout badge */}
                  <rect
                    x="-26"
                    y={-obj.h / 2 - 58}
                    width="52"
                    height="22"
                    rx="6"
                    fill="#18181b"
                    stroke="#818cf8"
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y={-obj.h / 2 - 43}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {liveRotatingDegree ?? Math.round(obj.angle)}°
                  </text>
                </g>
              )}
            </>
          )}
        </g>
      )}
    </g>
  );
};

export const ArchObjectItem = React.memo(ArchObjectItemComponent, (prevProps, nextProps) => {
  if (prevProps.isSelected !== nextProps.isSelected) return false;
  if (prevProps.isRotatingThis !== nextProps.isRotatingThis) return false;
  if (prevProps.isEraseHovered !== nextProps.isEraseHovered) return false;
  if (prevProps.tool !== nextProps.tool) return false;
  if (prevProps.measurementUnit !== nextProps.measurementUnit) return false;
  if (nextProps.isRotatingThis && prevProps.liveRotatingDegree !== nextProps.liveRotatingDegree) return false;
  if (prevProps.obj !== nextProps.obj) return false;
  return true;
});
