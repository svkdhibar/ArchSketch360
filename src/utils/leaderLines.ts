import { ArchObject, MeasurementUnit } from '../types';
import { formatObjectMeasurement } from './measurement';

export interface LeaderAnnotation {
  id: string;
  name: string;
  dimensionsText: string;
  category: string;
  keynoteIndex: number;
  // Start on object
  startX: number;
  startY: number;
  // Elbow / bend
  elbowX: number;
  elbowY: number;
  // End / shelf line
  endX: number;
  endY: number;
  // Text label anchor
  textX: number;
  textY: number;
  textAnchor: 'start' | 'end';
  direction: 'left' | 'right';
  shelfWidth: number;
  // Background pill box
  bgX: number;
  bgY: number;
  bgW: number;
  bgH: number;
  // Keynote badge center
  keynoteX: number;
  keynoteY: number;
  // Pointer path and optional arrowhead
  pathD: string;
  arrowPoints?: string;
}

export interface LeaderLineOptions {
  content?: 'name' | 'name_dimensions' | 'keynote_tag';
  pointerStyle?: 'dogleg' | 'arrow' | 'dot';
  unit?: MeasurementUnit;
}

/**
 * Automatically computes clear, non-overlapping architectural leader lines
 * pointing from placed icons to their identification names and dimensions.
 */
export function computeLeaderAnnotations(
  objects: ArchObject[],
  options?: LeaderLineOptions
): LeaderAnnotation[] {
  const content = options?.content || 'name_dimensions';
  const pointerStyle = options?.pointerStyle || 'dogleg';

  // Exclude rooms from leader annotations
  const nonRoomItems = objects.filter((o) => o.kind !== 'room' && o.kind !== 'room_circle');
  if (nonRoomItems.length === 0) return [];

  // Filter out exact duplicate / co-located stacked objects so only one leader line is generated
  const items: ArchObject[] = [];
  nonRoomItems.forEach((obj) => {
    const isDuplicate = items.some(
      (u) =>
        u.kind === obj.kind &&
        Math.abs(u.x - obj.x) < 4 &&
        Math.abs(u.y - obj.y) < 4
    );
    if (!isDuplicate) {
      items.push(obj);
    }
  });

  // Calculate overall bounding center
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  items.forEach((obj) => {
    minX = Math.min(minX, obj.x);
    minY = Math.min(minY, obj.y);
    maxX = Math.max(maxX, obj.x);
    maxY = Math.max(maxY, obj.y);
  });

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  // Group items by quadrant relative to (cx, cy)
  // Q0: Top-Right (dx >= 0, dy < 0)
  // Q1: Bottom-Right (dx >= 0, dy >= 0)
  // Q2: Bottom-Left (dx < 0, dy >= 0)
  // Q3: Top-Left (dx < 0, dy < 0)
  const quadrants: ArchObject[][] = [[], [], [], []];

  items.forEach((obj) => {
    const dx = obj.x - cx;
    const dy = obj.y - cy;
    if (dx >= 0 && dy < 0) quadrants[0].push(obj);
    else if (dx >= 0 && dy >= 0) quadrants[1].push(obj);
    else if (dx < 0 && dy >= 0) quadrants[2].push(obj);
    else quadrants[3].push(obj);
  });

  // Sort within quadrants to prevent tangled/crossing leader lines
  quadrants[0].sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
  quadrants[1].sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
  quadrants[2].sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
  quadrants[3].sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));

  const annotations: LeaderAnnotation[] = [];
  let globalKeynoteIndex = 1;

  quadrants.forEach((quadItems, qIdx) => {
    const count = quadItems.length;
    if (count === 0) return;

    quadItems.forEach((obj, k) => {
      // Determine outward angle for this item
      let theta = 0;
      const progress = count > 1 ? k / (count - 1) : 0.5;

      switch (qIdx) {
        case 0: // Top-Right (-18 deg to -72 deg)
          theta = (-18 - progress * 54) * (Math.PI / 180);
          break;
        case 1: // Bottom-Right (+18 deg to +72 deg)
          theta = (18 + progress * 54) * (Math.PI / 180);
          break;
        case 2: // Bottom-Left (+162 deg to +108 deg)
          theta = (162 - progress * 54) * (Math.PI / 180);
          break;
        case 3: // Top-Left (-162 deg to -108 deg)
          theta = (-162 + progress * 54) * (Math.PI / 180);
          break;
      }

      // Clearance radius of the item
      const rClear = Math.max(20, Math.max(obj.w, obj.h) * 0.42);

      let startX: number;
      let startY: number;
      let elbowX: number;
      let elbowY: number;
      let direction: 'left' | 'right';

      if (obj.labelOffset && typeof obj.labelOffset.x === 'number' && typeof obj.labelOffset.y === 'number') {
        elbowX = Math.round(obj.x + obj.labelOffset.x);
        elbowY = Math.round(obj.y + obj.labelOffset.y);
        const dist = Math.hypot(elbowX - obj.x, elbowY - obj.y);
        const angle = dist > 2 ? Math.atan2(elbowY - obj.y, elbowX - obj.x) : 0;
        const effectiveR = Math.min(rClear, Math.max(6, dist * 0.4));
        startX = Math.round(obj.x + Math.cos(angle) * effectiveR);
        startY = Math.round(obj.y + Math.sin(angle) * effectiveR);
        direction = elbowX >= obj.x ? 'right' : 'left';
      } else {
        startX = Math.round(obj.x + Math.cos(theta) * rClear);
        startY = Math.round(obj.y + Math.sin(theta) * rClear);
        // Stepped outward distance for staggered elbows
        const stepDist = rClear + 38 + (k % 3) * 22;
        elbowX = Math.round(obj.x + Math.cos(theta) * stepDist);
        elbowY = Math.round(obj.y + Math.sin(theta) * stepDist);
        direction = Math.cos(theta) >= 0 ? 'right' : 'left';
      }

      const labelName = obj.name || obj.kind.replace(/_/g, ' ');
      const objUnit = obj.measurementUnit || options?.unit || 'ft_in';
      const dimensionsText = formatObjectMeasurement(
        obj.w,
        obj.h,
        objUnit,
        obj.customMeasurement
      );

      // Text and shelf line dimension calculations
      const nameChars = labelName.length;
      const dimChars = dimensionsText.length;
      const maxChars = Math.max(nameChars, content === 'name_dimensions' ? dimChars : 0);
      const textWidth = Math.max(54, maxChars * 6.8);
      const shelfWidth = textWidth + 18;

      let endX = 0;
      let endY = elbowY;
      let textX = 0;
      let textY = elbowY - 4;
      let textAnchor: 'start' | 'end' = 'start';
      let bgX = 0;
      let bgY = 0;
      const bgW = textWidth + 12;
      const bgH = content === 'name_dimensions' ? 27 : 17;

      let keynoteX = 0;
      const keynoteY = elbowY;

      if (direction === 'right') {
        endX = elbowX + shelfWidth;
        textAnchor = 'start';
        textX = elbowX + 8;
        bgX = elbowX + 4;
        bgY = content === 'name_dimensions' ? elbowY - 14 : elbowY - 14;
        keynoteX = elbowX;
      } else {
        endX = elbowX - shelfWidth;
        textAnchor = 'end';
        textX = elbowX - 8;
        bgX = elbowX - bgW - 4;
        bgY = content === 'name_dimensions' ? elbowY - 14 : elbowY - 14;
        keynoteX = elbowX;
      }

      // Build path
      let pathD = '';
      if (pointerStyle === 'dot') {
        const midX = startX + (elbowX - startX) * 0.35;
        pathD = `M ${startX} ${startY} Q ${midX} ${elbowY} ${elbowX} ${elbowY} L ${endX} ${endY}`;
      } else {
        pathD = `M ${startX} ${startY} L ${elbowX} ${elbowY} L ${endX} ${endY}`;
      }

      // Compute arrowhead points if pointerStyle === 'arrow'
      let arrowPoints: string | undefined;
      if (pointerStyle === 'arrow') {
        const angleToStart = Math.atan2(startY - elbowY, startX - elbowX);
        const arrowLen = 7;
        const arrowSpread = 3.5;
        const p0x = startX;
        const p0y = startY;
        const p1x = Math.round(startX - arrowLen * Math.cos(angleToStart) + arrowSpread * Math.sin(angleToStart));
        const p1y = Math.round(startY - arrowLen * Math.sin(angleToStart) - arrowSpread * Math.cos(angleToStart));
        const p2x = Math.round(startX - arrowLen * Math.cos(angleToStart) - arrowSpread * Math.sin(angleToStart));
        const p2y = Math.round(startY - arrowLen * Math.sin(angleToStart) + arrowSpread * Math.cos(angleToStart));
        arrowPoints = `${p0x},${p0y} ${p1x},${p1y} ${p2x},${p2y}`;
      }

      annotations.push({
        id: obj.id,
        name: labelName,
        dimensionsText,
        category: obj.category,
        keynoteIndex: globalKeynoteIndex++,
        startX,
        startY,
        elbowX,
        elbowY,
        endX,
        endY,
        textX,
        textY,
        textAnchor,
        direction,
        shelfWidth,
        bgX,
        bgY,
        bgW,
        bgH,
        keynoteX,
        keynoteY,
        pathD,
        arrowPoints,
      });
    });
  });

  return annotations;
}
