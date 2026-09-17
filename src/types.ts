export type ToolType = 'select' | 'wall' | 'room' | 'room_circle' | 'erase' | 'pan';

export type MeasurementUnit = 'ft_in' | 'm' | 'cm' | 'px';

export type SaveAsFormat = 'PDF' | 'PNG' | 'JPEG' | 'SVG' | 'ARCHCAD' | 'CSV';

export type CategoryName =
  | 'Doors'
  | 'Windows'
  | 'Furniture'
  | 'Kitchen'
  | 'Bathroom'
  | 'Stairs'
  | 'Structure'
  | 'Electrical'
  | 'Landscape'
  | 'Annotation'
  | 'Vehicles'
  | 'Office';

export interface LibraryItemDef {
  kind: string;
  name: string;
  category: CategoryName;
  description: string;
  defaultWidth: number;
  defaultHeight: number;
}

export interface ArchObject {
  id: string;
  kind: string;
  name: string;
  category: CategoryName | string;
  x: number; // center X
  y: number; // center Y
  w: number; // width
  h: number; // height
  angle: number; // rotation in degrees: 0 to 360
  locked: boolean;
  color?: string;
  flipH?: boolean;
  flipV?: boolean;
  wallPoints?: { x1: number; y1: number; x2: number; y2: number };
  doorSwing?: 'left' | 'right';
  doorInswing?: boolean;
  doorAngle?: number;
  doorShowTag?: boolean;
  doorTag?: string;
  // Specialized Extra Features
  wallThickness?: number;
  wallHatch?: 'hatch45' | 'solid' | 'cavity' | 'stipple';
  wallShowCenterline?: boolean;
  roomName?: string;
  showRoomLabel?: boolean;
  roomBorderWidth?: number;
  roomFloorPattern?: 'clean' | 'wood' | 'tile' | 'slate';
  windowPanes?: number;
  windowShowTag?: boolean;
  windowTag?: string;
  stairDirection?: 'up' | 'down';
  stairSteps?: number;
  polygonPoints?: { x: number; y: number }[];
  // Measurement & Dimension Override Settings
  customMeasurement?: string;
  measurementUnit?: MeasurementUnit;
  // Graphic & Imported Image Fields
  imageUrl?: string;
  imageOpacity?: number;
  imageAspect?: number;
  // Movable Leader Line Label Offset
  labelOffset?: { x: number; y: number };
}

export interface SavedDocument {
  id: string;
  title: string;
  updatedAt: string;
  objectCount: number;
  objects: ArchObject[];
  previewThumbnail?: string;
  isCloud?: boolean;
}

export type CloudSyncStatus = 'not_signed_in' | 'signing_in' | 'synced' | 'saving' | 'error';

export interface CloudUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface CloudProjectRecord {
  id: string;
  userId: string;
  title: string;
  objectCount: number;
  objects: ArchObject[];
  updatedAt: string;
  createdAt: string;
}

export type LibraryPosition = 'bottom' | 'left' | 'right';

export type HandleType =
  | 'nw'
  | 'ne'
  | 'sw'
  | 'se'
  | 'n'
  | 's'
  | 'e'
  | 'w'
  | 'rotate';

export type PaperSize = 'letter' | 'a4' | 'a3' | 'tabloid' | 'arch_d';
export type PageOrientation = 'landscape' | 'portrait';
export type MarginOption = 'normal' | 'narrow' | 'wide' | 'none';
export type ColorMode = 'color' | 'monochrome' | 'blueprint' | 'blueprint_white' | 'grayscale';
export type ScaleMode = 'fit' | '100' | '75' | '50' | '150' | 'custom';

export interface PrintSettings {
  copies: number;
  printer: string;
  scope: 'all' | 'selection';
  orientation: PageOrientation;
  paperSize: PaperSize;
  margins: MarginOption;
  scaleMode: ScaleMode;
  customScale: number; // percentage, e.g. 100
  colorMode: ColorMode;
  showTitleBlock: boolean;
  projectTitle: string;
  sheetTitle: string;
  architectName: string;
  contactEmail?: string;
  sheetNumber: string;
  scaleText: string;
  showDate: boolean;
  showGrid: boolean;
  showDimensions: boolean;
  showNorthArrow: boolean;
  showLeaderLines: boolean;
  leaderContent: 'name' | 'name_dimensions' | 'keynote_tag';
  leaderPointerStyle: 'dogleg' | 'arrow' | 'dot';
}

export interface TouchDragInfo {
  item: LibraryItemDef;
  clientX: number;
  clientY: number;
}

export interface TouchDragTarget {
  item: LibraryItemDef;
  x: number;
  y: number;
  isValid: boolean;
}
