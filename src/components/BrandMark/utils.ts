import { BrandMarkSize } from './types';

// Logo aspect ratio: 556 / 753
export const BRANDMARK_ASPECT_RATIO = 556 / 753;

/**
 * Calculates responsive width and height for the BrandMark component.
 */
export function getBrandMarkDimensions(size: BrandMarkSize = 'lg'): { width: number; height: number } {
  const width = size === 'lg' ? 200 : 140;
  const height = Math.round(width * BRANDMARK_ASPECT_RATIO);
  return { width, height };
}
