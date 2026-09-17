import { ArchObject } from '../types';

/**
 * Hinged swing doors that have actual swing arc kinematics,
 * swing direction (LH / RH), and open angle presets (0° Closed, 30°, 45°, 60°, 90°, 120°, 180°).
 *
 * Sliding doors, pocket doors, stacking glass sliders, bifold doors, barn doors,
 * and revolving doors DO NOT swing and DO NOT have extra swing features.
 */
export const HINGED_SWING_DOOR_KINDS = new Set([
  'door_single',
  'door_single_rh',
  'door_single_45',
  'door_double',
  'door_unequal_double',
  'door_french',
  'door_fire_exit',
  'door_main',
  'door_pivot',
]);

/**
 * Sliding, pocket, and bi-fold doors that move along tracks.
 * They DO NOT swing on a hinge and DO NOT have 0°-180° swing angles.
 */
export const SLIDING_POCKET_DOOR_KINDS = new Set([
  'door_sliding',
  'door_multi_slide',
  'door_pocket',
  'door_pocket_double',
  'door_bifold',
  'door_bifold_double',
  'door_barn',
  'door_revolving',
  'door_tambour',
  'garage_door',
]);

/**
 * Checks whether a specific kind is a hinged swing door.
 */
export function isHingedSwingDoor(kind: string | undefined | null): boolean {
  if (!kind) return false;
  return HINGED_SWING_DOOR_KINDS.has(kind.toLowerCase());
}

/**
 * Checks whether a specific kind is a sliding or pocket door.
 */
export function isSlidingOrPocketDoor(kind: string | undefined | null): boolean {
  if (!kind) return false;
  return SLIDING_POCKET_DOOR_KINDS.has(kind.toLowerCase());
}

/**
 * Checks whether an architectural object has specialized extra features.
 */
export function hasSpecializedFeatures(obj: ArchObject | null | undefined): boolean {
  if (!obj) return false;
  const kind = obj.kind.toLowerCase();

  // 1. Hinged swing doors (LH/RH swing direction, swing angles 0°-180°, schedule badge)
  if (isHingedSwingDoor(kind)) {
    return true;
  }

  // 2. Sliding and pocket doors (Slide track direction & standard opening width presets)
  if (isSlidingOrPocketDoor(kind)) {
    return true;
  }

  // 3. Walls & Structural Enclosures (Adjustable wall thickness & poché)
  if (
    kind === 'wall' ||
    kind === 'shear_wall' ||
    kind === 'partition' ||
    kind.startsWith('wall_')
  ) {
    return true;
  }

  // 4. Rooms (Room naming, floor pattern, live floor area calculation)
  if (kind === 'room' || kind === 'room_circle' || kind === 'room_l') {
    return true;
  }

  // 5. Imported Graphics (Opacity slider, lock as background plan)
  if (kind === 'imported_graphic' || !!obj.imageUrl) {
    return true;
  }

  // 6. Stairways (Flight direction UP/DOWN & riser step count)
  if (
    kind === 'stairs_straight' ||
    kind === 'stairs_l_shaped' ||
    kind === 'stairs_switchback' ||
    kind === 'stairs_spiral'
  ) {
    return true;
  }

  // 7. Custom Name Tag & Architectural Labels
  if (kind === 'custom_name_tag' || kind === 'room_tag') {
    return true;
  }

  return false;
}
