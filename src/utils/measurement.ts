import { MeasurementUnit } from '../types';

/**
 * Standard Architectural CAD scale:
 * 1 px = 2.5 cm (0.025 m)
 * 40 px = 1.0 m = 100 cm
 * 12.192 px = 1 ft (30.48 cm)
 * ~1 px ≈ 1 inch
 */

export interface DimensionComponents {
  feet: number;
  inches: number;
  meters: number;
  cm: number;
  px: number;
  formatted: string;
}

export function pxToDimensionComponents(px: number, unit: MeasurementUnit = 'ft_in'): DimensionComponents {
  const cm = Math.round(px * 2.5);
  const totalInches = cm / 2.54;
  const roundedInches = Math.round(totalInches);
  const feet = Math.floor(roundedInches / 12);
  const inches = roundedInches % 12;
  const meters = Number((cm / 100).toFixed(2));

  let formatted = '';
  switch (unit) {
    case 'ft_in':
      formatted = `${feet}' ${inches}"`;
      break;
    case 'm':
      formatted = `${meters} m`;
      break;
    case 'cm':
      formatted = `${cm} cm`;
      break;
    case 'px':
    default:
      formatted = `${Math.round(px)} px`;
      break;
  }

  return {
    feet,
    inches,
    meters,
    cm,
    px: Math.round(px),
    formatted,
  };
}

export function dimensionToPx(
  unit: MeasurementUnit,
  values: { feet?: number; inches?: number; meters?: number; cm?: number; px?: number }
): number {
  switch (unit) {
    case 'ft_in': {
      const f = values.feet || 0;
      const i = values.inches || 0;
      const totalInches = f * 12 + i;
      const cm = totalInches * 2.54;
      return Math.max(10, Math.round(cm / 2.5));
    }
    case 'm': {
      const m = values.meters || 0;
      const cm = m * 100;
      return Math.max(10, Math.round(cm / 2.5));
    }
    case 'cm': {
      const c = values.cm || 0;
      return Math.max(10, Math.round(c / 2.5));
    }
    case 'px':
    default: {
      return Math.max(10, Math.round(values.px || 10));
    }
  }
}

export function formatObjectMeasurement(
  w: number,
  h: number,
  unit: MeasurementUnit = 'ft_in',
  customMeasurement?: string
): string {
  if (customMeasurement && customMeasurement.trim()) {
    return customMeasurement.trim();
  }
  const wComp = pxToDimensionComponents(w, unit);
  const hComp = pxToDimensionComponents(h, unit);
  return `${wComp.formatted} × ${hComp.formatted}`;
}
