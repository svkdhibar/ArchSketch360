import React from 'react';
import { renderDoorOrWindow } from './symbols/DoorWindowSymbols';
import { renderFurniture } from './symbols/FurnitureSymbols';
import { renderKitchenOrBath } from './symbols/KitchenBathSymbols';
import { renderStructureOrStairs } from './symbols/StructureStairSymbols';
import { renderMepOrLandscape } from './symbols/MepLandscapeSymbols';
import { renderAnnotationVehicleOffice } from './symbols/AnnotationVehicleOfficeSymbols';

interface SymbolProps {
  kind: string;
  w: number;
  h: number;
  preview?: boolean;
  name?: string;
  color?: string;
  doorSwing?: 'left' | 'right';
  doorInswing?: boolean;
  doorAngle?: number;
  doorShowTag?: boolean;
  doorTag?: string;
  roomName?: string;
  showRoomLabel?: boolean;
  roomFloorPattern?: 'clean' | 'wood' | 'tile' | 'slate';
  windowPanes?: number;
  windowTag?: string;
  wallThickness?: number;
  polygonPoints?: { x: number; y: number }[];
  imageUrl?: string;
  imageOpacity?: number;
  customMeasurement?: string;
  measurementUnit?: string;
}

const ArchSymbolGraphicComponent: React.FC<SymbolProps> = ({
  kind,
  w,
  h,
  preview = false,
  name,
  color,
  doorSwing,
  doorInswing,
  doorAngle,
  doorShowTag,
  doorTag,
  roomName,
  showRoomLabel,
  roomFloorPattern,
  windowPanes,
  windowTag,
  wallThickness,
  polygonPoints,
  imageUrl,
  imageOpacity,
  customMeasurement,
  measurementUnit,
}) => {
  const stroke = '#1e293b';
  const sw = preview ? 1.6 : 1.3;
  const halfW = w / 2;
  const halfH = h / 2;

  // Render Imported Graphic / Image (PNG, JPG, SVG, WebP, etc.)
  if (kind === 'imported_graphic' || imageUrl) {
    return (
      <g id="symbol-imported-graphic">
        {imageUrl ? (
          <image
            href={imageUrl}
            xlinkHref={imageUrl}
            x={-halfW}
            y={-halfH}
            width={w}
            height={h}
            preserveAspectRatio="none"
            opacity={imageOpacity ?? 1}
            crossOrigin="anonymous"
          />
        ) : (
          <g>
            <rect
              x={-halfW}
              y={-halfH}
              width={w}
              height={h}
              rx={4}
              fill="#f1f5f9"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
            <text
              x={0}
              y={4}
              textAnchor="middle"
              fontSize={Math.max(9, Math.min(12, w * 0.08))}
              fill="#64748b"
              fontWeight="500"
            >
              Photo / Graphic
            </text>
          </g>
        )}
      </g>
    );
  }

  // Local coordinates centered at (0, 0):
  const subProps = {
    kind,
    w,
    h,
    stroke,
    sw,
    x1: -halfW,
    y1: -halfH,
    x2: halfW,
    y2: halfH,
    halfW,
    halfH,
    preview,
    name,
    color,
    doorSwing,
    doorInswing,
    doorAngle,
    doorShowTag,
    doorTag,
    roomName,
    showRoomLabel,
    roomFloorPattern,
    windowPanes,
    windowTag,
    wallThickness,
    polygonPoints,
    customMeasurement,
    measurementUnit,
  };

  // Try each modular symbol category renderer
  const doorOrWindow = renderDoorOrWindow(subProps);
  if (doorOrWindow) return doorOrWindow;

  const furniture = renderFurniture(subProps);
  if (furniture) return furniture;

  const kitchenOrBath = renderKitchenOrBath(subProps);
  if (kitchenOrBath) return kitchenOrBath;

  const structureOrStairs = renderStructureOrStairs(subProps);
  if (structureOrStairs) return structureOrStairs;

  const mepOrLandscape = renderMepOrLandscape(subProps);
  if (mepOrLandscape) return mepOrLandscape;

  const annotationVehicleOffice = renderAnnotationVehicleOffice(subProps);
  if (annotationVehicleOffice) return annotationVehicleOffice;

  // Architectural Fallback Box for any unhandled kind
  return (
    <g id={`symbol-fallback-${kind}`}>
      <rect
        x={-halfW}
        y={-halfH}
        width={w}
        height={h}
        rx={4}
        fill="#f8fafc"
        stroke="#64748b"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      <circle cx={0} cy={0} r={Math.min(w, h) * 0.2} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1} />
      <text
        x={0}
        y={3}
        textAnchor="middle"
        fontSize={Math.max(8, Math.min(11, w * 0.12))}
        fill="#475569"
        fontWeight="600"
      >
        {kind.replace(/_/g, ' ').toUpperCase()}
      </text>
    </g>
  );
};

export const ArchSymbolGraphic = React.memo(ArchSymbolGraphicComponent);
