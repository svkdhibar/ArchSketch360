import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import {
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Tag,
  DoorOpen,
  GripVertical,
  Magnet,
  ArrowLeftRight,
  X,
  Check,
  Palette,
  Sparkles,
  Square,
  TrendingUp,
  Sliders,
  Circle,
  Image as ImageIcon,
  Layers,
  Maximize2,
  Ruler,
} from 'lucide-react';
import { ArchObject, MeasurementUnit } from '../types';
import {
  pxToDimensionComponents,
  dimensionToPx,
  formatObjectMeasurement,
} from '../utils/measurement';
import {
  hasSpecializedFeatures,
  isHingedSwingDoor,
  isSlidingOrPocketDoor,
} from '../utils/specializedFeatures';

interface ObjectInspectorProps {
  selectedObjects: ArchObject[];
  zoom: number;
  canvasOffset: { x: number; y: number };
  containerRef: React.RefObject<HTMLElement | null>;
  onClose?: () => void;
  onUpdateObject: (updated: Partial<ArchObject>) => void;
  onRotateRelative: (delta: number) => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onToggleLock: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
}

const ObjectInspectorComponent: React.FC<ObjectInspectorProps> = ({
  selectedObjects,
  zoom,
  canvasOffset,
  containerRef,
  onClose,
  onUpdateObject,
  onRotateRelative,
  onFlipHorizontal,
  onFlipVertical,
  onToggleLock,
  onDuplicate,
  onDelete,
  onBringToFront,
  onSendToBack,
}) => {
  if (selectedObjects.length === 0) {
    return null;
  }

  const inspectorRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ w: number; h: number }>({ w: 520, h: 140 });
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preferredSide, setPreferredSide] = useState<'right' | 'left'>('right');
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; initialX: number; initialY: number }>({
    mouseX: 0,
    mouseY: 0,
    initialX: 0,
    initialY: 0,
  });

  const first = selectedObjects[0];
  const isMultiple = selectedObjects.length > 1;
  const isLocked = first.locked;
  const currentAngle = Math.round(first.angle ?? 0);
  const isHingedDoor = isHingedSwingDoor(first.kind);
  const isSlidingOrPocket = isSlidingOrPocketDoor(first.kind);
  const isWall = first.kind === 'wall' || first.kind === 'shear_wall' || first.kind === 'partition' || first.kind.startsWith('wall_');
  const isRoom = first.kind === 'room' || first.kind === 'room_circle' || first.kind === 'room_l';
  const isCircleRoom = first.kind === 'room_circle';
  const isGraphic = first.kind === 'imported_graphic' || !!first.imageUrl;
  const isStairs = first.kind === 'stairs_straight' || first.kind === 'stairs_l_shaped' || first.kind === 'stairs_switchback' || first.kind === 'stairs_spiral';
  const isNameTag = first.kind === 'custom_name_tag' || first.kind === 'room_tag';
  const hasExtraFeatures = hasSpecializedFeatures(first);
  const showColorPalette = isWall || isRoom || isNameTag || first.kind.startsWith('column_') || first.kind === 'beam';

  // Reset drag position when selected object changes so it snaps right to the new object's side
  const prevSelectedIdRef = useRef(first?.id);
  useEffect(() => {
    if (first?.id !== prevSelectedIdRef.current) {
      prevSelectedIdRef.current = first?.id;
      setDragOffset(null);
    }
  }, [first?.id]);

  // Measure inspector element dimensions
  useLayoutEffect(() => {
    if (inspectorRef.current) {
      const w = inspectorRef.current.offsetWidth;
      const h = inspectorRef.current.offsetHeight;
      if (w > 0 && h > 0) {
        setDimensions({ w, h });
      }
    }
  }, [selectedObjects.length, isHingedDoor, isSlidingOrPocket, isWall, isRoom, isCircleRoom, isGraphic, isStairs, showColorPalette, first?.name]);

  // Calculate target position on side of selected icon with at least a 36px clearance gap
  const GAP = 36; // Clearance gap from object boundary/handles to ensure full visibility

  // Compute bounding box in canvas coordinates
  const minX = Math.min(...selectedObjects.map((o) => o.x - o.w / 2));
  const maxX = Math.max(...selectedObjects.map((o) => o.x + o.w / 2));
  const minY = Math.min(...selectedObjects.map((o) => o.y - o.h / 2));
  const maxY = Math.max(...selectedObjects.map((o) => o.y + o.h / 2));

  // Convert to container pixel coordinates
  const screenLeft = canvasOffset.x + minX * zoom;
  const screenRight = canvasOffset.x + maxX * zoom;
  const screenTop = canvasOffset.y + minY * zoom;
  const screenBottom = canvasOffset.y + maxY * zoom;
  const screenCenterX = (screenLeft + screenRight) / 2;
  const screenCenterY = (screenTop + screenBottom) / 2;

  // Clearance borders around the object including selection handles & 36px rotation tether handle
  const clearTop = screenTop - 42;
  const clearBottom = screenBottom + 12;
  const clearLeft = screenLeft - 12;
  const clearRight = screenRight + 12;

  // Viewport container bounds
  const container = containerRef.current;
  const containerW = container ? container.clientWidth : 1200;
  const containerH = container ? container.clientHeight : 800;

  const inspectorW = dimensions.w;
  const inspectorH = dimensions.h;

  let computedX = 0;
  let computedY = 0;
  let placedSide: 'right' | 'left' | 'top' | 'bottom' = 'right';

  if (dragOffset) {
    computedX = dragOffset.x;
    computedY = dragOffset.y;
  } else {
    // Check if right side has room
    const rightCandidate = clearRight + GAP;
    const fitsRight = rightCandidate + inspectorW <= containerW - 16;

    // Check if left side has room
    const leftCandidate = clearLeft - GAP - inspectorW;
    const fitsLeft = leftCandidate >= 16;

    if (preferredSide === 'right' ? fitsRight : !fitsLeft) {
      computedX = rightCandidate;
      computedY = screenCenterY - inspectorH / 2;
      placedSide = 'right';
    } else if (preferredSide === 'left' ? fitsLeft : !fitsRight) {
      computedX = leftCandidate;
      computedY = screenCenterY - inspectorH / 2;
      placedSide = 'left';
    } else if (fitsRight) {
      computedX = rightCandidate;
      computedY = screenCenterY - inspectorH / 2;
      placedSide = 'right';
    } else if (fitsLeft) {
      computedX = leftCandidate;
      computedY = screenCenterY - inspectorH / 2;
      placedSide = 'left';
    } else {
      // If neither horizontal side fits (e.g. narrow screen): place below or above
      const belowCandidate = clearBottom + GAP;
      const fitsBelow = belowCandidate + inspectorH <= containerH - 16;
      if (fitsBelow) {
        computedX = screenCenterX - inspectorW / 2;
        computedY = belowCandidate;
        placedSide = 'bottom';
      } else {
        computedX = screenCenterX - inspectorW / 2;
        computedY = clearTop - GAP - inspectorH;
        placedSide = 'top';
      }
    }

    // Strict boundary clamping so the inspector is always fully visible inside the viewport
    computedX = Math.max(16, Math.min(containerW - inspectorW - 16, computedX));
    computedY = Math.max(16, Math.min(containerH - inspectorH - 16, computedY));
  }

  // Handle manual dragging of the inspector bar
  const handleGripPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialX: computedX,
      initialY: computedY,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      const nextX = Math.max(8, Math.min(containerW - inspectorW - 8, dragStartRef.current.initialX + dx));
      const nextY = Math.max(8, Math.min(containerH - inspectorH - 8, dragStartRef.current.initialY + dy));
      setDragOffset({ x: nextX, y: nextY });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, containerW, containerH, inspectorW, inspectorH]);

  return (
    <aside
      ref={inspectorRef}
      id="object-inspector"
      aria-label="Object controls"
      style={{
        position: 'absolute',
        left: `${computedX}px`,
        top: `${computedY}px`,
        transition: 'none',
      }}
      className="z-30 pointer-events-auto bg-zinc-900/95 backdrop-blur-md border border-zinc-800 shadow-2xl rounded-2xl p-3 flex flex-col gap-2.5 text-xs text-zinc-300 select-none ring-1 ring-white/10 max-w-[580px]"
    >
      {/* ======================================================== */}
      {/* ROW 1: Grip Drag Knob, Object Title, Lock, & Side Tools  */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          {/* Draggable Grip Knob */}
          <button
            type="button"
            onPointerDown={handleGripPointerDown}
            title="Click and drag to reposition inspector anywhere"
            className="p-1 -ml-1 text-zinc-500 hover:text-indigo-400 cursor-grab active:cursor-grabbing hover:bg-zinc-800 rounded-lg transition"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* Object Name - directly editable so user can name any icon whatever they want */}
          {isMultiple ? (
            <span className="font-semibold text-zinc-100 text-sm flex items-center gap-1.5 truncate max-w-[200px]">
              {selectedObjects.length} Objects Selected
            </span>
          ) : (
            <div className="flex items-center gap-1.5 bg-zinc-950/80 px-2 py-0.5 rounded-xl border border-zinc-800 hover:border-zinc-700 focus-within:border-indigo-500 transition">
              <Tag className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <input
                id="input-inspector-item-name"
                type="text"
                disabled={isLocked}
                value={first.name}
                onChange={(e) => onUpdateObject({ name: e.target.value, roomName: e.target.value })}
                placeholder="Name this item..."
                title="Click to rename this item to whatever you want"
                className="bg-transparent text-xs font-semibold text-zinc-100 placeholder-zinc-500 focus:outline-none w-28 sm:w-36 transition"
              />
            </div>
          )}

          {/* Lock / Unlock Toggle */}
          <button
            id="btn-toggle-lock"
            onClick={onToggleLock}
            title={isLocked ? 'Unlock object (L)' : 'Lock object (L)'}
            className={`px-2 py-1 rounded-xl transition-colors flex items-center gap-1 text-[11px] font-medium ${
              isLocked
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
                : 'bg-zinc-800/80 hover:bg-zinc-750 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60'
            }`}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{isLocked ? 'Locked' : 'Lock'}</span>
          </button>
        </div>

        {/* Position Badge & Side Switcher */}
        <div className="flex items-center gap-1.5">
          {dragOffset ? (
            <button
              onClick={() => setDragOffset(null)}
              title="Snap toolbar back to side of selected icon (36px gap)"
              className="px-2 py-0.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition"
            >
              <Magnet className="w-3 h-3" />
              Snap to Side
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <span className="px-2 py-0.5 bg-zinc-800/80 border border-zinc-700/50 rounded-lg text-[10px] text-zinc-400 font-mono">
                {placedSide === 'right' ? 'Side (Right)' : placedSide === 'left' ? 'Side (Left)' : placedSide} • 36px gap
              </span>
              <button
                onClick={() => setPreferredSide((prev) => (prev === 'right' ? 'left' : 'right'))}
                title="Switch between right and left side of icon"
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Close button (Esc / click to dismiss) */}
          {onClose && (
            <button
              id="btn-close-inspector"
              onClick={onClose}
              title="Close properties bar (Esc)"
              className="p-1 -mr-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition border border-transparent hover:border-zinc-700/50"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SPECIALIZED EXTRA FEATURES (ONLY WHEN APPLICABLE)        */}
      {/* ======================================================== */}
      {hasExtraFeatures && !isMultiple && (
        <div className="flex flex-col gap-2.5 bg-zinc-950/70 p-2.5 rounded-xl border border-emerald-500/30">
          <div className="flex items-center justify-between gap-2 px-0.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>{first.name} Specialized Features</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-emerald-400/80">
              Specialized Config
            </span>
          </div>

          {/* 1. Hinged Swing Door Extra Features (Only for genuine hinged swing doors) */}
          {isHingedDoor && (
            <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-zinc-800/60">
              <span className="font-semibold text-emerald-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                <DoorOpen className="w-3.5 h-3.5" />
                Swing Specs
              </span>

              {/* Swing Direction (LH / RH) */}
              <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                <button
                  id="btn-door-swing-left"
                  disabled={isLocked}
                  onClick={() => onUpdateObject({ doorSwing: 'left' })}
                  title="Left Hand (LH) Swing"
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                    (first.doorSwing || (first.kind === 'door_single_rh' ? 'right' : 'left')) === 'left'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  LH Swing
                </button>
                <button
                  id="btn-door-swing-right"
                  disabled={isLocked}
                  onClick={() => onUpdateObject({ doorSwing: 'right' })}
                  title="Right Hand (RH) Swing"
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                    (first.doorSwing || (first.kind === 'door_single_rh' ? 'right' : 'left')) === 'right'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  RH Swing
                </button>
              </div>

              {/* Door Open Angle Presets (Closed, 45°, 90°, or more) */}
              <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-0.5 border border-zinc-800 flex-wrap">
                {[0, 30, 45, 60, 90, 120, 180].map((angle) => {
                  const currentDoorAngle =
                    first.doorAngle !== undefined ? first.doorAngle : first.kind === 'door_single_45' ? 45 : 90;
                  return (
                    <button
                      key={angle}
                      disabled={isLocked}
                      onClick={() => onUpdateObject({ doorAngle: angle })}
                      title={angle === 0 ? 'Closed Door (0°)' : `Door Open at ${angle}°`}
                      className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition ${
                        currentDoorAngle === angle
                          ? 'bg-indigo-600 text-white font-bold shadow-xs'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {angle === 0 ? 'Closed' : `${angle}°`}
                    </button>
                  );
                })}
              </div>

              {/* Architectural Door ID Tag (D1, D2, etc.) */}
              <div className="flex items-center gap-1.5 pl-1">
                <button
                  id="btn-toggle-door-tag"
                  disabled={isLocked}
                  onClick={() => onUpdateObject({ doorShowTag: !first.doorShowTag })}
                  title="Toggle Door Schedule Tag Badge"
                  className={`p-1 rounded-md transition ${
                    first.doorShowTag
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                </button>
                <input
                  id="input-door-tag"
                  type="text"
                  disabled={isLocked}
                  placeholder="Tag (D1)"
                  value={first.doorTag || ''}
                  onChange={(e) => onUpdateObject({ doorTag: e.target.value, doorShowTag: true })}
                  className="w-14 px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-mono text-[11px] text-zinc-200 focus:border-indigo-500 outline-none"
                  title="Door Schedule Callout Tag (e.g. D1, D02, EXT-1)"
                />
              </div>
            </div>
          )}

          {/* 1b. Sliding & Pocket Door Track Specs (NO swing angles or 90° arc features) */}
          {isSlidingOrPocket && (
            <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-zinc-800/60">
              <span className="font-semibold text-emerald-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5" />
                Track Specs
              </span>

              {/* Slide Direction / Handing */}
              <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => onUpdateObject({ flipH: false })}
                  title="Slide Left-to-Right"
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                    !first.flipH
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Slide ➔ Right
                </button>
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => onUpdateObject({ flipH: true })}
                  title="Slide Right-to-Left"
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                    first.flipH
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Slide  Left
                </button>
              </div>

              {/* Standard Clear Opening Width Presets */}
              <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 px-1">Clear Width:</span>
                {[
                  { label: '32" (80)', w: 80 },
                  { label: '36" (90)', w: 90 },
                  { label: '48" (120)', w: 120 },
                  { label: '60" (150)', w: 150 },
                  { label: '72" (180)', w: 180 },
                ].map((preset) => (
                  <button
                    key={preset.w}
                    type="button"
                    disabled={isLocked}
                    onClick={() => {
                      const isHorizontal = first.w >= first.h;
                      if (isHorizontal) {
                        onUpdateObject({ w: preset.w });
                      } else {
                        onUpdateObject({ h: preset.w });
                      }
                    }}
                    className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                      Math.round(Math.max(first.w, first.h)) === preset.w
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Door Schedule Tag (D1, SL1) */}
              <div className="flex items-center gap-1.5 pl-1">
                <input
                  type="text"
                  disabled={isLocked}
                  placeholder="Tag (SD1)"
                  value={first.doorTag || ''}
                  onChange={(e) => onUpdateObject({ doorTag: e.target.value, doorShowTag: true })}
                  className="w-16 px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-mono text-[11px] text-zinc-200 focus:border-indigo-500 outline-none"
                  title="Door Schedule Callout Tag (e.g. SD1, PKT-1)"
                />
              </div>
            </div>
          )}

          {/* 2. Wall Extra Features */}
          {isWall && (
            <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-zinc-800/60">
              <span className="font-semibold text-emerald-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                <Square className="w-3.5 h-3.5" />
                Wall Specs
              </span>

              {/* Wall Thickness Presets */}
              <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 px-1.5">Thickness:</span>
                {[
                  { label: '8px (Partition)', val: 8 },
                  { label: '12px (Std Refined)', val: 12 },
                  { label: '16px (Exterior)', val: 16 },
                  { label: '24px (Poché)', val: 24 },
                ].map((th) => {
                  const activeVal = first.wallThickness || (Math.min(first.w, first.h) <= 14 ? 12 : 24);
                  return (
                    <button
                      key={th.val}
                      disabled={isLocked}
                      onClick={() => {
                        const isHorizontal = first.w >= first.h;
                        if (isHorizontal) {
                          onUpdateObject({ h: th.val, wallThickness: th.val });
                        } else {
                          onUpdateObject({ w: th.val, wallThickness: th.val });
                        }
                      }}
                      className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                        activeVal === th.val
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {th.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Room Extra Features */}
          {isRoom && (
            <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-zinc-800/60">
              <span className="font-semibold text-emerald-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                {isCircleRoom ? <Circle className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                {isCircleRoom ? 'Circle Room Specs' : 'Room Specs'}
              </span>

              {/* Room Label Toggle (Small button with tick and cross) */}
              <div className="flex items-center gap-1.5 bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 font-medium px-1">Label:</span>
                <div className="flex items-center gap-0.5 bg-zinc-950 p-0.5 rounded border border-zinc-800">
                  {/* Small Tick Button (ON) */}
                  <button
                    id="btn-room-label-tick"
                    type="button"
                    disabled={isLocked}
                    onClick={() => onUpdateObject({ showRoomLabel: true })}
                    title="Turn Room Label ON (Tick)"
                    className={`px-2 py-0.5 text-[10px] rounded font-semibold flex items-center gap-1 transition ${
                      first.showRoomLabel !== false
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[2.5]" />
                    <span>ON</span>
                  </button>

                  {/* Small Cross Button (OFF) */}
                  <button
                    id="btn-room-label-cross"
                    type="button"
                    disabled={isLocked}
                    onClick={() => onUpdateObject({ showRoomLabel: false })}
                    title="Turn Room Label OFF (Cross)"
                    className={`px-2 py-0.5 text-[10px] rounded font-semibold flex items-center gap-1 transition ${
                      first.showRoomLabel === false
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                    }`}
                  >
                    <X className="w-3 h-3 stroke-[2.5]" />
                    <span>OFF</span>
                  </button>
                </div>

                {/* When label is ON, allow editing name */}
                {first.showRoomLabel !== false && (
                  <div className="flex items-center gap-1 pl-1">
                    <input
                      id="input-room-name"
                      type="text"
                      disabled={isLocked}
                      placeholder={isCircleRoom ? 'Circle Room' : 'Room Name'}
                      value={first.roomName !== undefined ? first.roomName : (first.name || '')}
                      onChange={(e) => onUpdateObject({ name: e.target.value, roomName: e.target.value, showRoomLabel: true })}
                      className="w-24 px-1.5 py-0.5 bg-zinc-950 border border-zinc-700/80 rounded text-[11px] text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 outline-none"
                    />
                    <div className="hidden sm:flex items-center gap-0.5">
                      {(isCircleRoom
                        ? ['Rotunda', 'Sunroom', 'Lounge', 'Studio']
                        : ['Living', 'Bed', 'Kitchen', 'Bath', 'Office']
                      ).map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          disabled={isLocked}
                          onClick={() => onUpdateObject({ name: preset, roomName: preset, showRoomLabel: true })}
                          className={`px-1.5 py-0.5 text-[10px] rounded transition ${
                            (first.roomName || first.name) === preset
                              ? 'bg-indigo-600 text-white font-semibold'
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>

                    {/* Custom Measurement / Secondary Label Override */}
                    <div className="flex items-center gap-1 pl-1.5 border-l border-zinc-800">
                      <span className="text-[10px] text-zinc-400 font-medium whitespace-nowrap">Custom Label:</span>
                      <input
                        id="input-room-custom-measurement"
                        type="text"
                        disabled={isLocked}
                        placeholder="e.g. 14' 6&quot; × 12' 0&quot;"
                        value={first.customMeasurement || ''}
                        onChange={(e) => onUpdateObject({ customMeasurement: e.target.value })}
                        className="w-28 sm:w-36 px-1.5 py-0.5 bg-zinc-950 border border-zinc-700/80 rounded text-[11px] text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 outline-none font-mono"
                      />
                      {first.customMeasurement && (
                        <button
                          type="button"
                          disabled={isLocked}
                          onClick={() => onUpdateObject({ customMeasurement: '' })}
                          className="p-0.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                          title="Clear custom label"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Floor Finish */}
              <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 px-1">Floor:</span>
                {[
                  { id: 'plain', label: 'Plain' },
                  { id: 'wood', label: 'Wood' },
                  { id: 'tile', label: 'Tile' },
                  { id: 'concrete', label: 'Concrete' },
                ].map((pat) => (
                  <button
                    key={pat.id}
                    disabled={isLocked}
                    onClick={() => onUpdateObject({ roomFloorPattern: pat.id as any })}
                    className={`px-1.5 py-0.5 text-[10px] rounded ${
                      (first.roomFloorPattern || 'plain') === pat.id
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {pat.label}
                  </button>
                ))}
              </div>

              {/* Live Area Display */}
              <div className="flex items-center gap-1 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-[10px] font-mono text-emerald-400">
                <span>Area:</span>
                <span className="font-bold">
                  {isCircleRoom
                    ? `${((Math.PI * (first.w / 2) * (first.h / 2)) / 1600).toFixed(1)} m²`
                    : first.polygonPoints && first.polygonPoints.length >= 3
                    ? `${(
                        Math.abs(
                          first.polygonPoints.reduce((acc, curr, i, arr) => {
                            const next = arr[(i + 1) % arr.length];
                            return acc + (curr.x * next.y - next.x * curr.y);
                          }, 0)
                        ) / 2 / 1600
                      ).toFixed(1)} m²`
                    : `${((first.w * first.h) / 1600).toFixed(1)} m²`}
                </span>
              </div>
            </div>
          )}

          {/* 4. Imported Graphic & Blueprint Underlay Specs */}
          {isGraphic && (
            <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-zinc-800/60">
              <span className="font-semibold text-sky-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                <ImageIcon className="w-3.5 h-3.5" />
                Graphic Underlay Specs
              </span>

              {/* Opacity Slider */}
              <div className="flex items-center gap-1.5 bg-zinc-900 rounded-lg px-2 py-0.5 border border-zinc-800">
                <span className="text-[10px] text-zinc-400">Opacity:</span>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  disabled={isLocked}
                  value={first.imageOpacity ?? 1}
                  onChange={(e) => onUpdateObject({ imageOpacity: parseFloat(e.target.value) })}
                  className="w-20 accent-indigo-500 h-1 cursor-pointer"
                  title="Adjust image opacity for tracing over floor plans & blueprints"
                />
                <span className="text-[10px] font-mono text-zinc-300 w-8">
                  {Math.round((first.imageOpacity ?? 1) * 100)}%
                </span>
              </div>

              {/* Aspect Ratio Lock / Reset */}
              {first.imageAspect && (
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => {
                    const aspect = first.imageAspect!;
                    onUpdateObject({ h: Math.round(first.w / aspect) });
                  }}
                  className="px-2 py-0.5 text-[10px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-300 flex items-center gap-1 transition"
                  title="Reset to Original Aspect Ratio"
                >
                  <Maximize2 className="w-3 h-3 text-indigo-400" />
                  <span>Match Ratio</span>
                </button>
              )}

              {/* Send to Back Shortcut */}
              <button
                type="button"
                onClick={() => onSendToBack?.()}
                className="px-2 py-0.5 text-[10px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-300 flex items-center gap-1 transition"
                title="Send Behind All Walls & Furniture as Blueprint Underlay"
              >
                <Layers className="w-3 h-3 text-emerald-400" />
                <span>Send to Back</span>
              </button>
            </div>
          )}

          {/* 5. Stairs & Egress Extra Features */}
          {isStairs && (
            <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-zinc-800/60">
              <span className="font-semibold text-emerald-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5" />
                Stair & Egress Specs
              </span>

              {/* Flight Direction */}
              <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => onUpdateObject({ stairDirection: 'up' })}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                    (first.stairDirection || 'up') === 'up'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  ▲ UP Flight
                </button>
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => onUpdateObject({ stairDirection: 'down' })}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                    first.stairDirection === 'down'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  ▼ DOWN Flight
                </button>
              </div>

              {/* Step / Riser Count */}
              <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 px-1">Risers:</span>
                {[10, 12, 14, 16, 18].map((steps) => (
                  <button
                    key={steps}
                    type="button"
                    disabled={isLocked}
                    onClick={() => onUpdateObject({ stairSteps: steps })}
                    className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                      (first.stairSteps || 10) === steps
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {steps}R
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 6. Custom Name Tag & Architectural Label Specs */}
          {isNameTag && (
            <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-zinc-800/60">
              <span className="font-semibold text-indigo-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5" />
                Name & Label Text
              </span>

              {/* Text Input Field */}
              <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                <input
                  id="input-name-tag-label"
                  type="text"
                  disabled={isLocked}
                  value={first.name}
                  onChange={(e) => onUpdateObject({ name: e.target.value, roomName: e.target.value })}
                  placeholder="Type whatever name you want..."
                  className="w-full px-2.5 py-1 bg-zinc-900 border border-indigo-500/60 rounded-lg text-xs font-bold text-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none placeholder-zinc-500"
                  autoFocus
                />
              </div>

              {/* Quick Preset Badges */}
              <div className="flex items-center gap-1 flex-wrap">
                {['Living Room', 'Master Bed', 'Kitchen', 'Bathroom', 'Office', 'Balcony', 'Storage', 'Entry / Foyer', 'Pantry'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    disabled={isLocked}
                    onClick={() => onUpdateObject({ name: preset, roomName: preset })}
                    className={`px-1.5 py-0.5 text-[10px] rounded transition ${
                      first.name === preset
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* ROW 3: 360° Free Rotation, Angle Slider, Presets & Flips */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-zinc-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
          <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
          360° Rotate
        </span>

        {/* Quick rotate buttons */}
        <button
          id="btn-rotate-ccw-90"
          disabled={isLocked}
          onClick={() => onRotateRelative(-90)}
          title="Rotate -90° (Counter-clockwise)"
          className="p-1.5 rounded-lg hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 hover:text-white active:scale-95 transition"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          id="btn-rotate-cw-90"
          disabled={isLocked}
          onClick={() => onRotateRelative(90)}
          title="Rotate +90° (Clockwise) (R)"
          className="p-1.5 rounded-lg hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 hover:text-white active:scale-95 transition"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* 360 Degree Slider */}
        <div className="flex items-center gap-2 bg-zinc-950/80 border border-zinc-800 rounded-xl px-2 py-1">
          <input
            id="input-rotation-slider"
            type="range"
            min={0}
            max={359}
            step={1}
            disabled={isLocked}
            value={currentAngle}
            onChange={(e) => onUpdateObject({ angle: Number(e.target.value) })}
            title="Drag to rotate 0° to 360°"
            className="w-20 accent-indigo-500 cursor-pointer disabled:opacity-40 h-1.5"
          />

          {/* Numeric Degree Input */}
          <div className="flex items-center">
            <input
              id="input-rotation-number"
              type="number"
              min={0}
              max={360}
              disabled={isLocked}
              value={currentAngle}
              onChange={(e) => {
                const val = Number(e.target.value);
                const normalized = ((val % 360) + 360) % 360;
                onUpdateObject({ angle: normalized });
              }}
              className="w-10 text-right font-mono font-bold text-zinc-100 bg-transparent outline-none text-xs"
            />
            <span className="text-zinc-500 font-mono text-xs">°</span>
          </div>
        </div>

        {/* Cardinal Presets */}
        <div className="flex items-center gap-1">
          {[0, 90, 180, 270].map((deg) => (
            <button
              key={deg}
              disabled={isLocked}
              onClick={() => onUpdateObject({ angle: deg })}
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded-lg border transition ${
                currentAngle === deg
                  ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow-sm shadow-indigo-600/30'
                  : 'bg-zinc-800/90 hover:bg-zinc-750 border-zinc-700/80 text-zinc-300'
              }`}
            >
              {deg}°
            </button>
          ))}
        </div>

        {/* Flip tools */}
        <div className="flex items-center gap-1 border-l border-zinc-800 pl-2">
          <button
            id="btn-flip-h"
            disabled={isLocked}
            onClick={onFlipHorizontal}
            title="Flip Horizontal (Mirror)"
            className="p-1.5 rounded-lg hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 hover:text-white"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-flip-v"
            disabled={isLocked}
            onClick={onFlipVertical}
            title="Flip Vertical (Mirror)"
            className="p-1.5 rounded-lg hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 hover:text-white"
          >
            <FlipVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ROW 3.5: Color & Architectural Finish Palette            */}
      {/* (ONLY shown for Walls, Rooms, Columns, & Beams)         */}
      {/* ======================================================== */}
      {showColorPalette && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800/80 pt-2">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-zinc-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
              <Palette className="w-3.5 h-3.5 text-indigo-400" />
              {first.kind === 'wall' || first.kind === 'shear_wall' || first.kind === 'room'
                ? 'Wall Color'
                : 'Color'}
            </span>

            <div className="flex items-center gap-1.5 ml-1">
              {[
                { label: 'Architectural Charcoal (Default)', hex: '#27272a' },
                { label: 'Slate Navy', hex: '#1e293b' },
                { label: 'Concrete Gray', hex: '#475569' },
                { label: 'Warm Stone', hex: '#78716c' },
                { label: 'Brick Terracotta', hex: '#9a3412' },
                { label: 'Poché White', hex: '#e2e8f0' },
                { label: 'Solid Obsidian', hex: '#09090b' },
              ].map((swatch) => {
                const activeColor = first.color || (first.kind === 'wall' || first.kind === 'room' ? '#27272a' : first.kind === 'shear_wall' ? '#18181b' : '');
                const isActive = activeColor === swatch.hex;
                return (
                  <button
                    key={swatch.hex}
                    type="button"
                    disabled={isLocked}
                    title={swatch.label}
                    onClick={() => onUpdateObject({ color: swatch.hex })}
                    className={`w-4 h-4 rounded-full border transition-all ${
                      isActive
                        ? 'ring-2 ring-indigo-400 scale-110 border-white shadow-sm'
                        : 'border-zinc-700/80 hover:scale-110 hover:border-zinc-400'
                    }`}
                    style={{ backgroundColor: swatch.hex }}
                  />
                );
              })}
            </div>
          </div>

          {/* Custom Color Input */}
          <label
            title="Pick custom wall color"
            className="flex items-center gap-1 cursor-pointer bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg px-2 py-0.5 transition"
          >
            <span className="text-[10px] text-zinc-400 font-medium">Custom</span>
            <input
              type="color"
              disabled={isLocked}
              value={first.color || (first.kind === 'wall' || first.kind === 'room' ? '#27272a' : '#1e293b')}
              onChange={(e) => onUpdateObject({ color: e.target.value })}
              className="w-4 h-4 rounded cursor-pointer bg-transparent border-0 p-0"
            />
          </label>
        </div>
      )}

      {/* ======================================================== */}
      {/* ROW 4: Manual Measurement & Dimensions (Customizable)     */}
      {/* ======================================================== */}
      {!isMultiple && (
        <div className="flex flex-col gap-2 border-t border-zinc-800/80 pt-2">
          {/* Section Header with Unit Selector */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-zinc-300 flex items-center gap-1 text-[11px] uppercase tracking-wider">
              <Ruler className="w-3.5 h-3.5 text-indigo-400" />
              Dimensions & Measurement
            </span>

            {/* Unit Selector */}
            <div className="flex items-center bg-zinc-950/90 rounded-lg p-0.5 border border-zinc-800" title="Select Unit of Measure">
              {(['ft_in', 'm', 'cm', 'px'] as const).map((u) => {
                const activeUnit = first.measurementUnit || 'ft_in';
                const isActive = activeUnit === u;
                return (
                  <button
                    key={u}
                    type="button"
                    disabled={isLocked}
                    onClick={() => onUpdateObject({ measurementUnit: u })}
                    className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition ${
                      isActive
                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {u === 'ft_in' ? 'ft & in' : u}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dimension Inputs based on chosen unit */}
          {(() => {
            const activeUnit: MeasurementUnit = first.measurementUnit || 'ft_in';
            const wComp = pxToDimensionComponents(first.w, activeUnit);
            const hComp = pxToDimensionComponents(first.h, activeUnit);

            return (
              <div className="flex flex-wrap items-center gap-3 bg-zinc-950/60 p-2 rounded-xl border border-zinc-800/70">
                {activeUnit === 'ft_in' && (
                  <>
                    {/* Width in Feet & Inches */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-zinc-400">Width:</span>
                      <div className="flex items-center bg-zinc-900 border border-zinc-750 rounded-lg px-1.5 py-0.5">
                        <input
                          type="number"
                          min={0}
                          max={200}
                          disabled={isLocked}
                          value={wComp.feet}
                          onChange={(e) => {
                            const newFeet = Math.max(0, parseInt(e.target.value, 10) || 0);
                            const newPx = dimensionToPx('ft_in', { feet: newFeet, inches: wComp.inches });
                            onUpdateObject({ w: newPx });
                          }}
                          className="w-8 text-right font-mono text-zinc-100 text-xs bg-transparent outline-none"
                        />
                        <span className="text-[10px] text-zinc-400 font-mono ml-0.5">ft</span>
                        <input
                          type="number"
                          min={0}
                          max={11}
                          disabled={isLocked}
                          value={wComp.inches}
                          onChange={(e) => {
                            const newInches = Math.max(0, Math.min(11, parseInt(e.target.value, 10) || 0));
                            const newPx = dimensionToPx('ft_in', { feet: wComp.feet, inches: newInches });
                            onUpdateObject({ w: newPx });
                          }}
                          className="w-7 text-right font-mono text-zinc-100 text-xs bg-transparent outline-none ml-1"
                        />
                        <span className="text-[10px] text-zinc-400 font-mono ml-0.5">in</span>
                      </div>
                    </div>

                    {/* Height / Depth in Feet & Inches */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-zinc-400">Height:</span>
                      <div className="flex items-center bg-zinc-900 border border-zinc-750 rounded-lg px-1.5 py-0.5">
                        <input
                          type="number"
                          min={0}
                          max={200}
                          disabled={isLocked}
                          value={hComp.feet}
                          onChange={(e) => {
                            const newFeet = Math.max(0, parseInt(e.target.value, 10) || 0);
                            const newPx = dimensionToPx('ft_in', { feet: newFeet, inches: hComp.inches });
                            onUpdateObject({ h: newPx });
                          }}
                          className="w-8 text-right font-mono text-zinc-100 text-xs bg-transparent outline-none"
                        />
                        <span className="text-[10px] text-zinc-400 font-mono ml-0.5">ft</span>
                        <input
                          type="number"
                          min={0}
                          max={11}
                          disabled={isLocked}
                          value={hComp.inches}
                          onChange={(e) => {
                            const newInches = Math.max(0, Math.min(11, parseInt(e.target.value, 10) || 0));
                            const newPx = dimensionToPx('ft_in', { feet: hComp.feet, inches: newInches });
                            onUpdateObject({ h: newPx });
                          }}
                          className="w-7 text-right font-mono text-zinc-100 text-xs bg-transparent outline-none ml-1"
                        />
                        <span className="text-[10px] text-zinc-400 font-mono ml-0.5">in</span>
                      </div>
                    </div>
                  </>
                )}

                {activeUnit === 'm' && (
                  <>
                    {/* Width in Meters */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-zinc-400">Width:</span>
                      <div className="flex items-center bg-zinc-900 border border-zinc-750 rounded-lg px-2 py-0.5">
                        <input
                          type="number"
                          step={0.05}
                          min={0.2}
                          max={50}
                          disabled={isLocked}
                          value={wComp.meters}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0.2;
                            onUpdateObject({ w: dimensionToPx('m', { meters: val }) });
                          }}
                          className="w-14 text-right font-mono text-zinc-100 text-xs bg-transparent outline-none"
                        />
                        <span className="text-[10px] text-zinc-400 font-mono ml-1">m</span>
                      </div>
                    </div>

                    {/* Height in Meters */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-zinc-400">Height:</span>
                      <div className="flex items-center bg-zinc-900 border border-zinc-750 rounded-lg px-2 py-0.5">
                        <input
                          type="number"
                          step={0.05}
                          min={0.2}
                          max={50}
                          disabled={isLocked}
                          value={hComp.meters}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0.2;
                            onUpdateObject({ h: dimensionToPx('m', { meters: val }) });
                          }}
                          className="w-14 text-right font-mono text-zinc-100 text-xs bg-transparent outline-none"
                        />
                        <span className="text-[10px] text-zinc-400 font-mono ml-1">m</span>
                      </div>
                    </div>
                  </>
                )}

                {activeUnit === 'cm' && (
                  <>
                    {/* Width in cm */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-zinc-400">Width:</span>
                      <div className="flex items-center bg-zinc-900 border border-zinc-750 rounded-lg px-2 py-0.5">
                        <input
                          type="number"
                          step={5}
                          min={15}
                          max={5000}
                          disabled={isLocked}
                          value={wComp.cm}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 15;
                            onUpdateObject({ w: dimensionToPx('cm', { cm: val }) });
                          }}
                          className="w-14 text-right font-mono text-zinc-100 text-xs bg-transparent outline-none"
                        />
                        <span className="text-[10px] text-zinc-400 font-mono ml-1">cm</span>
                      </div>
                    </div>

                    {/* Height in cm */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-zinc-400">Height:</span>
                      <div className="flex items-center bg-zinc-900 border border-zinc-750 rounded-lg px-2 py-0.5">
                        <input
                          type="number"
                          step={5}
                          min={15}
                          max={5000}
                          disabled={isLocked}
                          value={hComp.cm}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 15;
                            onUpdateObject({ h: dimensionToPx('cm', { cm: val }) });
                          }}
                          className="w-14 text-right font-mono text-zinc-100 text-xs bg-transparent outline-none"
                        />
                        <span className="text-[10px] text-zinc-400 font-mono ml-1">cm</span>
                      </div>
                    </div>
                  </>
                )}

                {activeUnit === 'px' && (
                  <>
                    <label className="flex items-center gap-1.5 text-zinc-400">
                      <span className="text-[11px] font-semibold">Width:</span>
                      <input
                        id="input-obj-w"
                        type="number"
                        disabled={isLocked}
                        min={15}
                        max={1500}
                        value={Math.round(first.w)}
                        onChange={(e) => onUpdateObject({ w: Math.max(15, Number(e.target.value)) })}
                        className="w-16 px-2 py-0.5 bg-zinc-900 border border-zinc-750 rounded-lg font-mono text-zinc-100 text-xs focus:border-indigo-500 outline-none"
                      />
                      <span className="text-[10px] font-mono text-zinc-500">px</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-zinc-400">
                      <span className="text-[11px] font-semibold">Height:</span>
                      <input
                        id="input-obj-h"
                        type="number"
                        disabled={isLocked}
                        min={15}
                        max={1500}
                        value={Math.round(first.h)}
                        onChange={(e) => onUpdateObject({ h: Math.max(15, Number(e.target.value)) })}
                        className="w-16 px-2 py-0.5 bg-zinc-900 border border-zinc-750 rounded-lg font-mono text-zinc-100 text-xs focus:border-indigo-500 outline-none"
                      />
                      <span className="text-[10px] font-mono text-zinc-500">px</span>
                    </label>
                  </>
                )}
              </div>
            );
          })()}

          {/* User-Defined Custom Measurement Label Override */}
          <div className="flex items-center gap-2 bg-zinc-950/80 px-2.5 py-1.5 rounded-xl border border-zinc-800">
            <span className="text-[11px] text-zinc-400 shrink-0 font-medium">Custom Label:</span>
            <input
              id="input-custom-measurement"
              type="text"
              disabled={isLocked}
              placeholder="e.g. 14' 6&quot; × 12' 0&quot; or 3.2m Master Bed"
              value={first.customMeasurement || ''}
              onChange={(e) => onUpdateObject({ customMeasurement: e.target.value })}
              className="flex-1 bg-zinc-900 border border-zinc-750 focus:border-indigo-500 rounded-lg px-2 py-0.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none font-mono"
            />
            {first.customMeasurement && (
              <button
                type="button"
                disabled={isLocked}
                onClick={() => onUpdateObject({ customMeasurement: '' })}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                title="Clear custom label"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ROW 5: Layer Ordering & Action Buttons                   */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between gap-2 border-t border-zinc-800/80 pt-2">
        <span className="text-[11px] text-zinc-400">
          {isMultiple ? 'Batch Selection' : 'Layer & Object Actions'}
        </span>

        {/* Layer ordering & actions */}
        <div className="flex items-center gap-1">
          <button
            id="btn-bring-front"
            onClick={onBringToFront}
            title="Bring to Front"
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center gap-1"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-send-back"
            onClick={onSendToBack}
            title="Send to Back"
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center gap-1"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-duplicate"
            onClick={onDuplicate}
            title="Duplicate (Ctrl+D)"
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center gap-1"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-delete"
            disabled={isLocked}
            onClick={onDelete}
            title="Delete (Del / Backspace)"
            className="p-1.5 rounded-lg hover:bg-rose-950/50 text-rose-400 hover:text-rose-300 border border-transparent hover:border-rose-900/40 disabled:opacity-40 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export const ObjectInspector = React.memo(ObjectInspectorComponent);
