import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { ArchObject, HandleType, ToolType, MeasurementUnit, TouchDragTarget } from '../types';
import { Check, X } from 'lucide-react';
import { LeaderLinesLayer } from './LeaderLinesLayer';
import { LeaderAnnotation, computeLeaderAnnotations } from '../utils/leaderLines';
import { ArchObjectItem, ERASE_CROSSHAIR_CURSOR } from './ArchObjectItem';
import { ArchSymbolGraphic } from './ArchSymbols';

const DEFAULT_LEADER_THEME = {
  line: '#4f46e5',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  accent: '#4f46e5',
  bg: '#ffffff',
  border: '#cbd5e1',
};

interface DrawingCanvasProps {
  tool: ToolType;
  setTool?: (tool: ToolType) => void;
  measurementUnit?: MeasurementUnit;
  objects: ArchObject[];
  selectedIds: string[];
  onSelectObjects: (ids: string[], isAdditive?: boolean) => void;
  onContextMenuObject?: (obj: ArchObject, e: React.MouseEvent) => void;
  onUpdateObject: (id: string, updates: Partial<ArchObject>, saveHistory?: boolean) => void;
  onBatchUpdateObjects: (updates: { id: string; updates: Partial<ArchObject> }[], saveHistory?: boolean) => void;
  onDeleteObject: (id: string) => void;
  onCreateObject: (obj: ArchObject) => void;
  onSaveHistorySnapshot: () => void;
  showGrid: boolean;
  snapToGrid: boolean;
  zoom: number;
  setZoom: (fn: (prev: number) => number) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
  canvasOffset: { x: number; y: number };
  setCanvasOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  showLeaderLines?: boolean;
  onImportGraphic?: (file: File) => void;
  touchDragTarget?: TouchDragTarget | null;
}

const DrawingCanvasComponent: React.FC<DrawingCanvasProps> = ({
  tool,
  setTool,
  measurementUnit = 'ft_in',
  objects,
  selectedIds,
  onSelectObjects,
  onContextMenuObject,
  onUpdateObject,
  onBatchUpdateObjects,
  onDeleteObject,
  onCreateObject,
  onSaveHistorySnapshot,
  showGrid,
  snapToGrid,
  zoom,
  setZoom,
  svgRef,
  canvasOffset,
  setCanvasOffset,
  showLeaderLines = false,
  onImportGraphic,
  touchDragTarget = null,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Stable references for high-frequency callbacks to prevent needless re-renders
  const objectsRef = useRef(objects);
  const selectedIdsRef = useRef(selectedIds);
  useEffect(() => {
    objectsRef.current = objects;
  }, [objects]);
  useEffect(() => {
    selectedIdsRef.current = selectedIds;
  }, [selectedIds]);

  // Set for O(1) selection lookup
  const selectedIdsSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  // RequestAnimationFrame throttling for pointermove
  const rafIdRef = useRef<number | null>(null);
  const latestPointerEventRef = useRef<{ clientX: number; clientY: number; shiftKey: boolean } | null>(null);

  // Clean up any pending RAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Line-to-Line Continuous Drawing Mode vs Drag Box Mode
  const [drawingMode, setDrawingMode] = useState<'line_to_line' | 'drag'>('line_to_line');
  const [linePoints, setLinePoints] = useState<{ x: number; y: number }[]>([]);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredObjId, setHoveredObjId] = useState<string | null>(null);

  // Interaction State
  const hasMovedRef = useRef<boolean>(false);
  const [activeAction, setActiveAction] = useState<
    | { type: 'drag'; startX: number; startY: number; initialPositions: { id: string; x: number; y: number }[] }
    | { type: 'rotate'; id: string; cx: number; cy: number; initialAngle: number }
    | { type: 'resize'; id: string; handle: HandleType; initialObj: ArchObject; startX: number; startY: number }
    | { type: 'draw_wall'; startX: number; startY: number; currentX: number; currentY: number }
    | { type: 'draw_room'; startX: number; startY: number; currentX: number; currentY: number }
    | { type: 'draw_room_circle'; startX: number; startY: number; currentX: number; currentY: number }
    | { type: 'pan'; startClientX: number; startClientY: number; initialOffset: { x: number; y: number } }
    | {
        type: 'drag_label';
        id: string;
        objX: number;
        objY: number;
        dragElbowOffsetX: number;
        dragElbowOffsetY: number;
      }
    | null
  >(null);

  // Live rotating degree indicator for tooltip/protractor
  const [liveRotatingDegree, setLiveRotatingDegree] = useState<number | null>(null);

  // Reset line-to-line points when switching tools
  useEffect(() => {
    if (tool !== 'wall' && tool !== 'room') {
      setLinePoints([]);
      setCursorPos(null);
    }
  }, [tool]);

  // Compute leader annotations when leader lines are enabled on canvas
  const leaderAnnotations = useMemo(() => {
    if (!showLeaderLines) return [];
    return computeLeaderAnnotations(objects, {
      content: 'name_dimensions',
      pointerStyle: 'dogleg',
      unit: (measurementUnit as MeasurementUnit) || 'ft_in',
    });
  }, [showLeaderLines, objects, measurementUnit]);

  // Convert screen client coordinates to Canvas (World) coordinates
  const getCanvasCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = (clientX - rect.left - canvasOffset.x) / zoom;
      const rawY = (clientY - rect.top - canvasOffset.y) / zoom;
      return { x: rawX, y: rawY };
    },
    [canvasOffset, zoom]
  );

  const snapCoord = useCallback(
    (val: number) => {
      if (!snapToGrid) return val;
      return Math.round(val / 20) * 20;
    },
    [snapToGrid]
  );

  // Non-passive wheel listener for smooth cursor-centered zoom & pan
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // Zoom centered at cursor
        const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        setZoom((currentZoom) => {
          const nextZoom = Math.max(0.2, Math.min(3.5, Number((currentZoom * zoomFactor).toFixed(2))));
          if (nextZoom === currentZoom) return currentZoom;
          const ratio = nextZoom / currentZoom;
          setCanvasOffset((prev) => ({
            x: mouseX - (mouseX - prev.x) * ratio,
            y: mouseY - (mouseY - prev.y) * ratio,
          }));
          return nextZoom;
        });
      } else {
        // Pan canvas
        setCanvasOffset((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    };

    container.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleNativeWheel);
    };
  }, [setZoom, setCanvasOffset]);

  // Multi-Touch Pinch-to-Zoom & Two-Finger Pan on Mobile / Touchscreens
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartDist: number | null = null;
    let touchStartZoom = zoom;
    let touchStartMidX = 0;
    let touchStartMidY = 0;
    let touchStartOffset = { ...canvasOffset };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        touchStartDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        touchStartZoom = zoom;
        touchStartMidX = (t1.clientX + t2.clientX) / 2;
        touchStartMidY = (t1.clientY + t2.clientY) / 2;
        touchStartOffset = { ...canvasOffset };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStartDist !== null && touchStartDist > 0) {
        if (e.cancelable) e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const currentMidX = (t1.clientX + t2.clientX) / 2;
        const currentMidY = (t1.clientY + t2.clientY) / 2;

        const scale = currentDist / touchStartDist;
        const nextZoom = Math.max(0.2, Math.min(3.5, Number((touchStartZoom * scale).toFixed(2))));

        const rect = container.getBoundingClientRect();
        const mouseX = touchStartMidX - rect.left;
        const mouseY = touchStartMidY - rect.top;
        const panDx = currentMidX - touchStartMidX;
        const panDy = currentMidY - touchStartMidY;

        const ratio = nextZoom / touchStartZoom;
        setZoom(() => nextZoom);
        setCanvasOffset({
          x: mouseX - (mouseX - touchStartOffset.x) * ratio + panDx,
          y: mouseY - (mouseY - touchStartOffset.y) * ratio + panDy,
        });
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        touchStartDist = null;
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [zoom, canvasOffset, setZoom, setCanvasOffset]);

  // Finish current Room Line-to-Line drawing session
  const handleFinishLineDrawing = useCallback(() => {
    if (tool === 'room' && linePoints.length >= 3) {
      const allPts = [...linePoints];
      const minX = Math.min(...allPts.map((p) => p.x));
      const maxX = Math.max(...allPts.map((p) => p.x));
      const minY = Math.min(...allPts.map((p) => p.y));
      const maxY = Math.max(...allPts.map((p) => p.y));
      const w = Math.max(40, maxX - minX);
      const h = Math.max(40, maxY - minY);
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;

      // Transform absolute canvas coordinates into polygon points relative to center (cx, cy)
      const polygonPoints = allPts.map((p) => ({
        x: Math.round(p.x - cx),
        y: Math.round(p.y - cy),
      }));

      onCreateObject({
        id: `room_${Date.now()}`,
        kind: 'room',
        name: 'Room',
        category: 'Structure',
        x: cx,
        y: cy,
        w,
        h,
        angle: 0,
        locked: false,
        polygonPoints,
      });
    }
    setLinePoints([]);
    setCursorPos(null);
  }, [linePoints, tool, onCreateObject]);

  // Cancel current Line-to-Line drawing session
  const handleCancelLineDrawing = useCallback(() => {
    setLinePoints([]);
    setCursorPos(null);
  }, []);

  // Keyboard shortcut listener for Enter (Finish) and Esc (Cancel)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (linePoints.length > 0) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleFinishLineDrawing();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          handleCancelLineDrawing();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [linePoints, handleFinishLineDrawing, handleCancelLineDrawing]);

  // Start Movable Leader Line Label Dragging (Active when Show Labels from TopBar is toggled)
  const handleLabelPointerDown = useCallback(
    (e: React.PointerEvent, item: LeaderAnnotation) => {
      e.stopPropagation();
      if (e.button !== 0) return; // Left click only
      if (tool === 'erase') return;

      const targetObj = objectsRef.current.find((o) => o.id === item.id);
      if (!targetObj || targetObj.locked) return;

      if (!selectedIdsSet.has(item.id)) {
        onSelectObjects([item.id]);
      }

      const { x, y } = getCanvasCoords(e.clientX, e.clientY);

      setActiveAction({
        type: 'drag_label',
        id: item.id,
        objX: targetObj.x,
        objY: targetObj.y,
        dragElbowOffsetX: item.elbowX - x,
        dragElbowOffsetY: item.elbowY - y,
      });
    },
    [tool, onSelectObjects, getCanvasCoords, selectedIdsSet]
  );

  // Pointer Down on Canvas
  const handlePointerDown = (e: React.PointerEvent) => {
    // Middle click or Pan tool or Space key: start pan
    if (e.button === 1 || tool === 'pan' || e.spaceKey) {
      setActiveAction({
        type: 'pan',
        startClientX: e.clientX,
        startClientY: e.clientY,
        initialOffset: { ...canvasOffset },
      });
      return;
    }

    if (e.button !== 0) return; // Left click only

    const { x, y } = getCanvasCoords(e.clientX, e.clientY);
    let sx = snapCoord(x);
    let sy = snapCoord(y);

    // Wall Tool: Architectural 12px clean wall (drag to draw - line-to-line removed)
    if (tool === 'wall') {
      setActiveAction({ type: 'draw_wall', startX: sx, startY: sy, currentX: sx, currentY: sy });
      return;
    }

    // Room Tool: Continuous Line-to-Line Drawing according to user drawn lines
    if (tool === 'room' && drawingMode === 'line_to_line') {
      // Soft orthogonal snap relative to last point if Shift not pressed
      if (linePoints.length > 0 && !e.shiftKey) {
        const last = linePoints[linePoints.length - 1];
        if (Math.abs(sx - last.x) < 14) sx = last.x;
        else if (Math.abs(sy - last.y) < 14) sy = last.y;
      }

      // First point of room
      if (linePoints.length === 0) {
        setLinePoints([{ x: sx, y: sy }]);
        setCursorPos({ x: sx, y: sy });
        return;
      }

      const p0 = linePoints[0];
      const distToStart = Math.hypot(sx - p0.x, sy - p0.y);

      // Closing loop back to start point (requires at least 3 points to form room area)
      if (distToStart <= 24 && linePoints.length >= 3) {
        const allPts = [...linePoints];
        const minX = Math.min(...allPts.map((p) => p.x));
        const maxX = Math.max(...allPts.map((p) => p.x));
        const minY = Math.min(...allPts.map((p) => p.y));
        const maxY = Math.max(...allPts.map((p) => p.y));
        const w = Math.max(40, maxX - minX);
        const h = Math.max(40, maxY - minY);
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;

        const polygonPoints = allPts.map((p) => ({
          x: Math.round(p.x - cx),
          y: Math.round(p.y - cy),
        }));

        onCreateObject({
          id: `room_${Date.now()}`,
          kind: 'room',
          name: 'Room',
          category: 'Structure',
          x: cx,
          y: cy,
          w,
          h,
          angle: 0,
          locked: false,
          polygonPoints,
        });

        setLinePoints([]);
        setCursorPos(null);
        return;
      }

      // Normal intermediate point placement for room perimeter
      const last = linePoints[linePoints.length - 1];
      const distToLast = Math.hypot(sx - last.x, sy - last.y);
      if (distToLast < 10) return; // ignore near-duplicate clicks

      setLinePoints((prev) => [...prev, { x: sx, y: sy }]);
      return;
    }

    // Drag Mode: Room Tool
    if (tool === 'room') {
      setActiveAction({ type: 'draw_room', startX: sx, startY: sy, currentX: sx, currentY: sy });
      return;
    }

    // Drag Mode: Circle Room Tool
    if (tool === 'room_circle') {
      setActiveAction({ type: 'draw_room_circle', startX: sx, startY: sy, currentX: sx, currentY: sy });
      return;
    }

    // Erase Tool
    if (tool === 'erase') {
      return;
    }

    // If clicking on empty canvas in select mode: clear selection
    if (!e.shiftKey) {
      onSelectObjects([]);
    }
  };

  // Process pointer movement with RAF throttling
  const processPointerAction = useCallback(
    (clientX: number, clientY: number, shiftKey: boolean) => {
      if (!activeAction) return;

      if (activeAction.type === 'pan') {
        const dx = clientX - activeAction.startClientX;
        const dy = clientY - activeAction.startClientY;
        setCanvasOffset({
          x: activeAction.initialOffset.x + dx,
          y: activeAction.initialOffset.y + dy,
        });
        return;
      }

      const { x, y } = getCanvasCoords(clientX, clientY);

      // 360° ROTATING ACTION (Core feature)
      if (activeAction.type === 'rotate') {
        const { cx, cy, id } = activeAction;
        const dx = x - cx;
        const dy = y - cy;

        // Calculate angle from center to mouse pointer:
        // Handle sits at top of object, so when dx = 0, dy < 0 => 0 degrees (top / north)
        const rad = Math.atan2(dy, dx);
        let deg = (rad * 180) / Math.PI + 90;
        if (deg < 0) deg += 360;
        deg = deg % 360;

        // Snapping support:
        // Holding Shift snaps to 15° increments (0, 15, 30, 45, ...)
        if (shiftKey) {
          deg = Math.round(deg / 15) * 15;
        } else {
          // Soft snap to cardinal directions (0, 45, 90, 135, 180, 225, 270, 315, 360) within 3°
          const cardinals = [0, 45, 90, 135, 180, 225, 270, 315, 360];
          for (const card of cardinals) {
            if (Math.abs(deg - card) <= 3) {
              deg = card % 360;
              break;
            }
          }
        }

        deg = Math.round(deg % 360);
        setLiveRotatingDegree(deg);
        onUpdateObject(id, { angle: deg }, false);
        return;
      }

      // Moving Leader Line Annotation Label
      if (activeAction.type === 'drag_label') {
        let targetElbowX = x + activeAction.dragElbowOffsetX;
        let targetElbowY = y + activeAction.dragElbowOffsetY;

        if (snapToGrid) {
          targetElbowX = snapCoord(targetElbowX);
          targetElbowY = snapCoord(targetElbowY);
        }

        const newOffsetX = Math.round(targetElbowX - activeAction.objX);
        const newOffsetY = Math.round(targetElbowY - activeAction.objY);

        onUpdateObject(activeAction.id, { labelOffset: { x: newOffsetX, y: newOffsetY } }, false);
        return;
      }

      // Moving Objects
      if (activeAction.type === 'drag') {
        const dx = x - activeAction.startX;
        const dy = y - activeAction.startY;

        if (Math.hypot(dx, dy) > 2) {
          hasMovedRef.current = true;
        }

        const isSingle = activeAction.initialPositions.length === 1;

        const batch = activeAction.initialPositions.map((pos) => {
          let newX = pos.x + dx;
          let newY = pos.y + dy;
          if (snapToGrid) {
            if (isSingle) {
              newX = snapCoord(newX);
              newY = snapCoord(newY);
            } else {
              newX = pos.x + Math.round(dx / 20) * 20;
              newY = pos.y + Math.round(dy / 20) * 20;
            }
          }
          return {
            id: pos.id,
            updates: { x: newX, y: newY },
          };
        });

        onBatchUpdateObjects(batch, false);
        return;
      }

      // Resizing Object (with local rotation math to prevent skewing and warping)
      if (activeAction.type === 'resize') {
        const { id, handle, initialObj, startX, startY } = activeAction;
        const dx = x - startX;
        const dy = y - startY;

        hasMovedRef.current = true;

        const angle = initialObj.angle || 0;
        const rad = (angle * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        // Transform mouse displacement into object's local unrotated coordinate space
        const localDx = dx * cos + dy * sin;
        const localDy = -dx * sin + dy * cos;

        const minDim = 20;
        let deltaW = 0;
        let deltaH = 0;
        let signX = 1;
        let signY = 1;

        if (handle === 'se') {
          deltaW = localDx;
          deltaH = localDy;
          signX = 1;
          signY = 1;
        } else if (handle === 'sw') {
          deltaW = -localDx;
          deltaH = localDy;
          signX = -1;
          signY = 1;
        } else if (handle === 'ne') {
          deltaW = localDx;
          deltaH = -localDy;
          signX = 1;
          signY = -1;
        } else if (handle === 'nw') {
          deltaW = -localDx;
          deltaH = -localDy;
          signX = -1;
          signY = -1;
        }

        const newW = Math.max(minDim, initialObj.w + deltaW);
        const newH = Math.max(minDim, initialObj.h + deltaH);

        const actualDeltaW = newW - initialObj.w;
        const actualDeltaH = newH - initialObj.h;

        const localShiftX = (signX * actualDeltaW) / 2;
        const localShiftY = (signY * actualDeltaH) / 2;

        const newX = initialObj.x + (localShiftX * cos - localShiftY * sin);
        const newY = initialObj.y + (localShiftX * sin + localShiftY * cos);

        if (initialObj.polygonPoints && initialObj.polygonPoints.length >= 3) {
          const scaleX = initialObj.w > 0 ? newW / initialObj.w : 1;
          const scaleY = initialObj.h > 0 ? newH / initialObj.h : 1;
          const scaledPolygonPoints = initialObj.polygonPoints.map((p) => ({
            x: Math.round(p.x * scaleX),
            y: Math.round(p.y * scaleY),
          }));
          onUpdateObject(
            id,
            {
              w: Math.round(newW),
              h: Math.round(newH),
              x: Math.round(newX),
              y: Math.round(newY),
              polygonPoints: scaledPolygonPoints,
            },
            false
          );
        } else {
          onUpdateObject(id, { w: Math.round(newW), h: Math.round(newH), x: Math.round(newX), y: Math.round(newY) }, false);
        }
        return;
      }

      // Drawing Wall
      if (activeAction.type === 'draw_wall') {
        let curX = snapToGrid ? snapCoord(x) : x;
        let curY = snapToGrid ? snapCoord(y) : y;
        const adx = Math.abs(curX - activeAction.startX);
        const ady = Math.abs(curY - activeAction.startY);
        if (shiftKey || (adx > 20 && ady < 16) || (ady > 20 && adx < 16)) {
          if (adx >= ady) {
            curY = activeAction.startY;
          } else {
            curX = activeAction.startX;
          }
        }
        setActiveAction((prev) => (prev ? { ...prev, currentX: curX, currentY: curY } : null));
        return;
      }

      // Drawing Room
      if (activeAction.type === 'draw_room') {
        setActiveAction((prev) => (prev ? { ...prev, currentX: snapCoord(x), currentY: snapCoord(y) } : null));
        return;
      }

      // Drawing Circle Room
      if (activeAction.type === 'draw_room_circle') {
        setActiveAction((prev) => (prev ? { ...prev, currentX: snapCoord(x), currentY: snapCoord(y) } : null));
        return;
      }
    },
    [activeAction, getCanvasCoords, onUpdateObject, onBatchUpdateObjects, snapCoord, snapToGrid, setCanvasOffset]
  );

  // Pointer Move (Dragging, Rotating, Resizing, Drawing, Panning)
  const handlePointerMove = (e: React.PointerEvent) => {
    // Tracking cursor position for Room Line-to-Line continuous preview
    if (tool === 'room' && drawingMode === 'line_to_line' && linePoints.length > 0) {
      const { x, y } = getCanvasCoords(e.clientX, e.clientY);
      let sx = snapCoord(x);
      let sy = snapCoord(y);
      const last = linePoints[linePoints.length - 1];
      if (!e.shiftKey) {
        if (Math.abs(sx - last.x) < 14) sx = last.x;
        else if (Math.abs(sy - last.y) < 14) sy = last.y;
      }
      setCursorPos({ x: sx, y: sy });
    }

    if (!activeAction) return;

    latestPointerEventRef.current = { clientX: e.clientX, clientY: e.clientY, shiftKey: e.shiftKey };
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        if (latestPointerEventRef.current) {
          processPointerAction(
            latestPointerEventRef.current.clientX,
            latestPointerEventRef.current.clientY,
            latestPointerEventRef.current.shiftKey
          );
        }
      });
    }
  };

  // Pointer Up
  const handlePointerUp = () => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (latestPointerEventRef.current && activeAction) {
      processPointerAction(
        latestPointerEventRef.current.clientX,
        latestPointerEventRef.current.clientY,
        latestPointerEventRef.current.shiftKey
      );
    }
    latestPointerEventRef.current = null;

    if (!activeAction) return;

    if (activeAction.type === 'rotate') {
      if (hasMovedRef.current) onSaveHistorySnapshot();
      setLiveRotatingDegree(null);
    } else if (activeAction.type === 'drag' || activeAction.type === 'resize' || activeAction.type === 'drag_label') {
      if (hasMovedRef.current) onSaveHistorySnapshot();
    } else if (activeAction.type === 'draw_wall') {
      const { startX, startY, currentX, currentY } = activeAction;
      const dx = currentX - startX;
      const dy = currentY - startY;
      const length = Math.hypot(dx, dy);
      if (length > 15) {
        const adx = Math.abs(dx);
        const ady = Math.abs(dy);
        
        let width = 0;
        let height = 0;
        let angle = 0;
        let cx = (startX + currentX) / 2;
        let cy = (startY + currentY) / 2;

        if (ady <= 8) {
          // Clean horizontal wall
          width = Math.max(24, adx);
          height = 12;
          angle = 0;
          cy = startY;
        } else if (adx <= 8) {
          // Clean vertical wall
          width = 12;
          height = Math.max(24, ady);
          angle = 0;
          cx = startX;
        } else {
          // Angled or diagonal wall
          width = Math.max(24, Math.round(length));
          height = 12;
          angle = Math.round((Math.atan2(dy, dx) * 180) / Math.PI);
          if (angle < 0) angle += 360;
        }

        const newWall: ArchObject = {
          id: `wall_${Date.now()}`,
          kind: 'wall',
          name: 'Wall',
          category: 'Structure',
          x: cx,
          y: cy,
          w: width,
          h: height,
          angle: angle,
          locked: false,
        };
        onCreateObject(newWall);
      }
    } else if (activeAction.type === 'draw_room') {
      const { startX, startY, currentX, currentY } = activeAction;
      const w = Math.abs(currentX - startX);
      const h = Math.abs(currentY - startY);
      if (w > 30 && h > 30) {
        const cx = (startX + currentX) / 2;
        const cy = (startY + currentY) / 2;
        const newRoom: ArchObject = {
          id: `room_${Date.now()}`,
          kind: 'room',
          name: 'Room',
          category: 'Structure',
          x: cx,
          y: cy,
          w,
          h,
          angle: 0,
          locked: false,
        };
        onCreateObject(newRoom);
      }
    } else if (activeAction.type === 'draw_room_circle') {
      const { startX, startY, currentX, currentY } = activeAction;
      const w = Math.abs(currentX - startX);
      const h = Math.abs(currentY - startY);
      const diameter = Math.max(w, h);
      if (diameter > 24) {
        const cx = (startX + currentX) / 2;
        const cy = (startY + currentY) / 2;
        const newCircleRoom: ArchObject = {
          id: `room_circle_${Date.now()}`,
          kind: 'room_circle',
          name: 'Circular Room',
          category: 'Structure',
          x: cx,
          y: cy,
          w: diameter,
          h: diameter,
          angle: 0,
          locked: false,
        };
        onCreateObject(newCircleRoom);
      }
    }

    hasMovedRef.current = false;
    setActiveAction(null);
  };

  const handlePointerUpRef = useRef(handlePointerUp);
  useEffect(() => {
    handlePointerUpRef.current = handlePointerUp;
  });

  // Ensure dragging/drawing moves and ends cleanly across the entire window
  useEffect(() => {
    if (!activeAction) return;

    const handleWindowPointerMove = (e: PointerEvent) => {
      latestPointerEventRef.current = { clientX: e.clientX, clientY: e.clientY, shiftKey: e.shiftKey };
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null;
          if (latestPointerEventRef.current) {
            processPointerAction(
              latestPointerEventRef.current.clientX,
              latestPointerEventRef.current.clientY,
              latestPointerEventRef.current.shiftKey
            );
          }
        });
      }
    };

    const handleWindowPointerUp = () => {
      handlePointerUpRef.current();
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
    };
  }, [activeAction, processPointerAction]);

  // Start Object Dragging
  const handleObjectPointerDown = useCallback(
    (e: React.PointerEvent, obj: ArchObject) => {
      e.stopPropagation();

      // Primary Left Click (e.button === 0) only for selection and dragging
      // Right click (e.button === 2) is reserved for opening the inspector bar via onContextMenu
      if (e.button !== 0) return;

      // If Erase tool active: delete on click
      if (tool === 'erase') {
        onDeleteObject(obj.id);
        return;
      }

      const isAdditive = e.shiftKey;
      const isAlreadySelected = selectedIdsSet.has(obj.id);

      if (!isAlreadySelected && !isAdditive) {
        onSelectObjects([obj.id]);
      } else if (isAdditive) {
        onSelectObjects([obj.id], true);
      }

      if (obj.locked) return; // Locked objects cannot be dragged or resized

      hasMovedRef.current = false;
      const { x, y } = getCanvasCoords(e.clientX, e.clientY);
      const affected = isAlreadySelected ? selectedIdsRef.current : [obj.id];
      const initialPositions = objectsRef.current
        .filter((o) => affected.includes(o.id) && !o.locked)
        .map((o) => ({ id: o.id, x: o.x, y: o.y }));

      setActiveAction({
        type: 'drag',
        startX: x,
        startY: y,
        initialPositions,
      });
    },
    [tool, onDeleteObject, onSelectObjects, getCanvasCoords, selectedIdsSet]
  );

  // Start 360° Rotation Handle Drag
  const handleRotateHandlePointerDown = useCallback((e: React.PointerEvent, obj: ArchObject) => {
    e.stopPropagation();
    if (obj.locked) return;

    hasMovedRef.current = false;
    setActiveAction({
      type: 'rotate',
      id: obj.id,
      cx: obj.x,
      cy: obj.y,
      initialAngle: obj.angle,
    });
    setLiveRotatingDegree(Math.round(obj.angle));
  }, []);

  // Start Corner Resize Handle Drag
  const handleResizeHandlePointerDown = useCallback(
    (e: React.PointerEvent, obj: ArchObject, handle: HandleType) => {
      e.stopPropagation();
      if (obj.locked) return;

      hasMovedRef.current = false;
      const { x, y } = getCanvasCoords(e.clientX, e.clientY);
      setActiveAction({
        type: 'resize',
        id: obj.id,
        handle,
        initialObj: { ...obj },
        startX: x,
        startY: y,
      });
    },
    [getCanvasCoords]
  );

  const handlePointerEnter = useCallback((id: string) => {
    setHoveredObjId(id);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setHoveredObjId(null);
  }, []);

  return (
    <div
      ref={containerRef}
      id="drawing-canvas-viewport"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={(e) => e.preventDefault()}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files && files.length > 0 && onImportGraphic) {
          const file = files[0];
          if (file.type.startsWith('image/') || /\.(png|jpe?g|svg|webp|gif|bmp)$/i.test(file.name)) {
            onImportGraphic(file);
            return;
          }
        }
        // Also handle library item drop if dropped directly onto canvas
        try {
          const raw = e.dataTransfer.getData('application/json');
          if (raw) {
            const item = JSON.parse(raw);
            const { x, y } = getCanvasCoords(e.clientX, e.clientY);
            const finalX = snapToGrid ? snapCoord(x) : x;
            const finalY = snapToGrid ? snapCoord(y) : y;
            onCreateObject({
              id: `${item.kind}_${Date.now()}`,
              kind: item.kind,
              name: item.name,
              category: item.category,
              x: finalX,
              y: finalY,
              w: item.defaultWidth,
              h: item.defaultHeight,
              angle: 0,
              locked: false,
            });
          }
        } catch (_) {}
      }}
      style={tool === 'erase' ? { cursor: ERASE_CROSSHAIR_CURSOR } : undefined}
      className={`relative w-full h-full overflow-hidden select-none bg-slate-50 touch-none ${
        tool === 'pan' || activeAction?.type === 'pan' || activeAction?.type === 'drag_label'
          ? 'cursor-grab active:cursor-grabbing'
          : tool === 'erase'
          ? ''
          : 'cursor-crosshair'
      }`}
    >
      {/* SVG Canvas Stage */}
      <svg
        ref={svgRef}
        id="arch-svg-canvas"
        className="w-full h-full touch-none"
        onDoubleClick={handleFinishLineDrawing}
      >
        <defs>
          {/* Minor Grid Pattern */}
          <pattern id="grid-pattern-minor" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
          </pattern>

          {/* Major Grid Pattern */}
          <pattern id="grid-pattern-major" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#grid-pattern-minor)" />
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#cbd5e1" strokeWidth="1.2" />
          </pattern>
        </defs>

        {/* Global Pan & Zoom Group */}
        <g transform={`translate(${canvasOffset.x}, ${canvasOffset.y}) scale(${zoom})`}>
          {/* Grid Background */}
          {showGrid && (
            <rect
              x="-20000"
              y="-20000"
              width="40000"
              height="40000"
              fill="url(#grid-pattern-major)"
              className="pointer-events-none"
            />
          )}

          {/* Canvas Center Reference Axis (Subtle crosshair at 0,0) */}
          <line x1="-50" y1="0" x2="50" y2="0" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
          <line x1="0" y1="-50" x2="0" y2="50" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />

          {/* Render All Architectural Objects (Memoized for optimal canvas rendering) */}
          {objects.map((obj) => {
            const isSelected = selectedIdsSet.has(obj.id);
            const isRotatingThis = activeAction?.type === 'rotate' && activeAction.id === obj.id;
            const isEraseHovered = tool === 'erase' && hoveredObjId === obj.id;

            return (
              <ArchObjectItem
                key={obj.id}
                obj={obj}
                isSelected={isSelected}
                isRotatingThis={isRotatingThis}
                isEraseHovered={isEraseHovered}
                liveRotatingDegree={liveRotatingDegree}
                measurementUnit={measurementUnit}
                tool={tool}
                onPointerDown={handleObjectPointerDown}
                onContextMenu={onContextMenuObject}
                onPointerEnter={handlePointerEnter}
                onPointerLeave={handlePointerLeave}
                onRotateHandlePointerDown={handleRotateHandlePointerDown}
                onResizeHandlePointerDown={handleResizeHandlePointerDown}
              />
            );
          })}

          {/* Continuous Line-to-Line Room Drawing Preview */}
          {tool === 'room' && drawingMode === 'line_to_line' && linePoints.length > 0 && (
            <g className="pointer-events-none">
              {/* Shaded Live Room Area Interior Polygon (connecting placed vertices + live cursor) */}
              {cursorPos && (
                <polygon
                  points={[...linePoints, cursorPos].map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="rgba(99, 102, 241, 0.14)"
                  stroke="#6366f1"
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                />
              )}

              {/* Guide line closing back to start point P0 */}
              {cursorPos && linePoints.length >= 2 && (
                <line
                  x1={cursorPos.x}
                  y1={cursorPos.y}
                  x2={linePoints[0].x}
                  y2={linePoints[0].y}
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  opacity="0.75"
                />
              )}

              {/* Already-placed Perimeter Wall Lines */}
              {linePoints.map((pt, i) => {
                if (i === 0) return null;
                const prevPt = linePoints[i - 1];
                const midX = (prevPt.x + pt.x) / 2;
                const midY = (prevPt.y + pt.y) / 2;
                const distPx = Math.hypot(pt.x - prevPt.x, pt.y - prevPt.y);
                const distCm = Math.round(distPx * 2.5);
                const feet = Math.floor(distCm / 30.48);
                const inches = Math.round((distCm % 30.48) / 2.54);

                return (
                  <g key={`seg-${i}`}>
                    {/* Architectural Solid Room Boundary Wall */}
                    <line
                      x1={prevPt.x}
                      y1={prevPt.y}
                      x2={pt.x}
                      y2={pt.y}
                      stroke="#1e293b"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    <line
                      x1={prevPt.x}
                      y1={prevPt.y}
                      x2={pt.x}
                      y2={pt.y}
                      stroke="#4f46e5"
                      strokeWidth="2"
                    />
                    {/* Dimension Tag on this placed wall */}
                    {distPx > 25 && (
                      <g transform={`translate(${midX}, ${midY})`}>
                        <rect
                          x="-28"
                          y="-9"
                          width="56"
                          height="18"
                          rx="4"
                          fill="#0f172a"
                          stroke="#334155"
                          strokeWidth="0.8"
                        />
                        <text
                          x="0"
                          y="3.5"
                          textAnchor="middle"
                          fontSize="9"
                          fill="#f8fafc"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {feet}' {inches}"
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Active Rubber-band Segment from last point to cursor */}
              {cursorPos && (() => {
                const lastPt = linePoints[linePoints.length - 1];
                const distPx = Math.hypot(cursorPos.x - lastPt.x, cursorPos.y - lastPt.y);
                const midX = (lastPt.x + cursorPos.x) / 2;
                const midY = (lastPt.y + cursorPos.y) / 2;
                const distCm = Math.round(distPx * 2.5);
                const feet = Math.floor(distCm / 30.48);
                const inches = Math.round((distCm % 30.48) / 2.54);
                const angle = Math.round((Math.atan2(cursorPos.y - lastPt.y, cursorPos.x - lastPt.x) * 180) / Math.PI);
                const normalizedAngle = (angle + 360) % 360;

                return (
                  <g>
                    <line
                      x1={lastPt.x}
                      y1={lastPt.y}
                      x2={cursorPos.x}
                      y2={cursorPos.y}
                      stroke="#4f46e5"
                      strokeWidth="2"
                      strokeDasharray="5 3"
                    />
                    {distPx >= 15 && (
                      <g transform={`translate(${midX}, ${midY - 14})`}>
                        <rect
                          x="-42"
                          y="-10"
                          width="84"
                          height="20"
                          rx="5"
                          fill="#0f172a"
                          fillOpacity="0.9"
                          stroke="#475569"
                          strokeWidth="0.8"
                        />
                        <text
                          x="0"
                          y="4"
                          textAnchor="middle"
                          fontSize="9.5"
                          fill="#f8fafc"
                          fontFamily="monospace"
                          fontWeight="600"
                        >
                          {feet}' {inches}" • {normalizedAngle}°
                        </text>
                      </g>
                    )}
                  </g>
                );
              })()}

              {/* Live Room Area Badge in Center of Polygon */}
              {cursorPos && linePoints.length >= 2 && (() => {
                const previewPts = [...linePoints, cursorPos];
                let shoelace = 0;
                let sumX = 0;
                let sumY = 0;
                for (let i = 0; i < previewPts.length; i++) {
                  const j = (i + 1) % previewPts.length;
                  shoelace += previewPts[i].x * previewPts[j].y - previewPts[j].x * previewPts[i].y;
                  sumX += previewPts[i].x;
                  sumY += previewPts[i].y;
                }
                const areaSqPx = Math.abs(shoelace) / 2;
                const areaSqM = Math.round((areaSqPx / 1600) * 10) / 10;
                const areaSqFt = Math.round(areaSqM * 10.7639);
                const centerPolyX = sumX / previewPts.length;
                const centerPolyY = sumY / previewPts.length;

                return (
                  <g transform={`translate(${centerPolyX}, ${centerPolyY})`}>
                    <rect
                      x="-65"
                      y="-12"
                      width="130"
                      height="24"
                      rx="6"
                      fill="#1e1b4b"
                      fillOpacity="0.92"
                      stroke="#6366f1"
                      strokeWidth="1.2"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#e0e7ff"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      Room: {areaSqM} m² ({areaSqFt} sq ft)
                    </text>
                  </g>
                );
              })()}

              {/* Placed Corner Nodes */}
              {linePoints.map((pt, i) => {
                const isStartNode = i === 0;
                const isNearStart =
                  cursorPos &&
                  linePoints.length >= 2 &&
                  Math.hypot(cursorPos.x - pt.x, cursorPos.y - pt.y) <= 24;

                return (
                  <g key={`node-${i}`}>
                    {isStartNode && isNearStart ? (
                      <g>
                        <circle cx={pt.x} cy={pt.y} r={14} fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" strokeWidth="2" />
                        <circle cx={pt.x} cy={pt.y} r={7} fill="#10b981" stroke="#ffffff" strokeWidth={2} />
                        <g transform={`translate(${pt.x}, ${pt.y - 18})`}>
                          <rect x="-65" y="-10" width="130" height="20" rx="5" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
                          <text x="0" y="4" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#6ee7b7">
                            Click to Enclose Room Area
                          </text>
                        </g>
                      </g>
                    ) : (
                      <g>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isStartNode ? 6 : 4.5}
                          fill={isStartNode ? '#4338ca' : '#4f46e5'}
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                        {isStartNode && linePoints.length >= 2 && (
                          <text x={pt.x} y={pt.y - 9} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#4338ca">
                            START
                          </text>
                        )}
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* Active Temporary Drawing Preview: Wall (Drag Mode - Refined 12px) */}
          {activeAction?.type === 'draw_wall' && (
            <g className="pointer-events-none">
              <line
                x1={activeAction.startX}
                y1={activeAction.startY}
                x2={activeAction.currentX}
                y2={activeAction.currentY}
                stroke="#334155"
                strokeWidth="12"
                strokeLinecap="square"
                opacity="0.8"
              />
              <line
                x1={activeAction.startX}
                y1={activeAction.startY}
                x2={activeAction.currentX}
                y2={activeAction.currentY}
                stroke="#6366f1"
                strokeWidth="1.2"
                strokeDasharray="4 3"
              />
            </g>
          )}

          {/* Active Temporary Drawing Preview: Room (Drag Mode - Clean 1.2px stroke) */}
          {activeAction?.type === 'draw_room' && (
            <g className="pointer-events-none">
              <rect
                x={Math.min(activeAction.startX, activeAction.currentX)}
                y={Math.min(activeAction.startY, activeAction.currentY)}
                width={Math.abs(activeAction.currentX - activeAction.startX)}
                height={Math.abs(activeAction.currentY - activeAction.startY)}
                fill="#f8fafc"
                fillOpacity="0.65"
                stroke="#334155"
                strokeWidth="1.2"
                strokeDasharray="4 3"
              />
            </g>
          )}

          {/* Active Temporary Drawing Preview: Circle Room (Drag Mode) */}
          {activeAction?.type === 'draw_room_circle' && (() => {
            const rad = Math.max(10, Math.max(Math.abs(activeAction.currentX - activeAction.startX), Math.abs(activeAction.currentY - activeAction.startY)) / 2);
            return (
              <g className="pointer-events-none">
                <circle
                  cx={(activeAction.startX + activeAction.currentX) / 2}
                  cy={(activeAction.startY + activeAction.currentY) / 2}
                  r={rad}
                  fill="#ecfdf5"
                  fillOpacity="0.65"
                  stroke="#059669"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
              </g>
            );
          })()}

          {/* Automatic Architectural Leader Lines & Identification Callouts */}
          {showLeaderLines && (
            <LeaderLinesLayer
              annotations={leaderAnnotations}
              theme={DEFAULT_LEADER_THEME}
              pointerStyle="dogleg"
              content="name_dimensions"
              isMovable={showLeaderLines}
              onLabelPointerDown={handleLabelPointerDown}
              activeDraggingId={activeAction?.type === 'drag_label' ? activeAction.id : null}
            />
          )}

          {/* Live Mobile Touch Drag Target Projection */}
          {touchDragTarget && (
            <g transform={`translate(${touchDragTarget.x}, ${touchDragTarget.y})`} className="pointer-events-none">
              {/* Pulsing Outer Reticle */}
              <rect
                x={-touchDragTarget.item.defaultWidth / 2 - 8}
                y={-touchDragTarget.item.defaultHeight / 2 - 8}
                width={touchDragTarget.item.defaultWidth + 16}
                height={touchDragTarget.item.defaultHeight + 16}
                fill="rgba(99, 102, 241, 0.12)"
                stroke="#6366f1"
                strokeWidth={1.5}
                strokeDasharray="6 4"
                rx={10}
              />
              {/* Inner Exact Box */}
              <rect
                x={-touchDragTarget.item.defaultWidth / 2}
                y={-touchDragTarget.item.defaultHeight / 2}
                width={touchDragTarget.item.defaultWidth}
                height={touchDragTarget.item.defaultHeight}
                fill="rgba(99, 102, 241, 0.22)"
                stroke="#4f46e5"
                strokeWidth={2}
                rx={6}
              />
              {/* Center Crosshair */}
              <line x1="-12" y1="0" x2="12" y2="0" stroke="#6366f1" strokeWidth="1.5" />
              <line x1="0" y1="-12" x2="0" y2="12" stroke="#6366f1" strokeWidth="1.5" />
              {/* Symbol Preview */}
              <g opacity={0.7}>
                <ArchSymbolGraphic
                  kind={touchDragTarget.item.kind}
                  w={touchDragTarget.item.defaultWidth}
                  h={touchDragTarget.item.defaultHeight}
                  name={touchDragTarget.item.name}
                  preview
                />
              </g>
              {/* Floating Drop Coordinate Tag */}
              <g transform={`translate(0, ${-touchDragTarget.item.defaultHeight / 2 - 16})`}>
                <rect
                  x="-55"
                  y="-10"
                  width="110"
                  height="20"
                  rx="5"
                  fill="#0f172a"
                  fillOpacity="0.95"
                  stroke="#6366f1"
                  strokeWidth="1.2"
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fontSize="9.5"
                  fill="#e0e7ff"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  Drop: {Math.round(touchDragTarget.x)}, {Math.round(touchDragTarget.y)}
                </text>
              </g>
            </g>
          )}
        </g>
      </svg>

      {/* On-Canvas Floating HUD for Room Controls (Unified for Rectangle, Circle, and Line-to-Line) */}
      {(tool === 'room' || tool === 'room_circle') && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 text-zinc-200 px-3.5 py-2 rounded-2xl shadow-2xl flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-semibold text-zinc-100">
              Room Tool
            </span>
          </div>

          {/* Mode Switcher: Rectangle (Drag) | Circle Room | Line-to-Line */}
          <div className="flex items-center bg-zinc-900 rounded-xl p-0.5 border border-zinc-800">
            <button
              onClick={() => {
                setTool?.('room');
                setDrawingMode('drag');
                setLinePoints([]);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                tool === 'room' && drawingMode === 'drag'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Rectangle
            </button>
            <button
              onClick={() => {
                setTool?.('room_circle');
                setLinePoints([]);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                tool === 'room_circle'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Circle Room
            </button>
            <button
              onClick={() => {
                setTool?.('room');
                setDrawingMode('line_to_line');
                setLinePoints([]);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                tool === 'room' && drawingMode === 'line_to_line'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Line-to-Line (Custom)
            </button>
          </div>

          {/* Line-to-Line Active Progress Controls */}
          {tool === 'room' && drawingMode === 'line_to_line' && linePoints.length > 0 && (
            <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
              <span className="text-[11px] text-indigo-300 font-mono">
                {linePoints.length} {linePoints.length === 1 ? 'corner' : 'corners'}
              </span>
              <button
                onClick={handleFinishLineDrawing}
                disabled={linePoints.length < 3}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1 ${
                  linePoints.length >= 3
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
                title={linePoints.length < 3 ? 'Place at least 3 corners to form an enclosed room area' : 'Complete room'}
              >
                <Check size={12} />
                Complete Area (Enter)
              </button>
              <button
                onClick={handleCancelLineDrawing}
                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs transition flex items-center gap-1 cursor-pointer"
              >
                <X size={12} />
                Cancel (Esc)
              </button>
            </div>
          )}

          <span className="text-[11px] text-zinc-400 hidden md:inline">
            {tool === 'room_circle'
              ? 'Click & drag across canvas to draw a circular room'
              : drawingMode === 'line_to_line'
              ? 'Click to place corners along lines • Click start point to enclose room area'
              : 'Click & drag across canvas to draw a room'}
          </span>
        </div>
      )}

      {/* Eraser Tool Active Banner */}
      {tool === 'erase' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-rose-950/90 backdrop-blur-md border border-rose-900/60 text-rose-200 px-3.5 py-1.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-semibold">Eraser Reticle Active:</span>
          <span>Click any wall or element to remove</span>
        </div>
      )}


    </div>
  );
};

export const DrawingCanvas = React.memo(DrawingCanvasComponent);
