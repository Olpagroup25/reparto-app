import { colors, radii } from '@/theme/tokens';
import { FabShape, FabVariant } from './types';

/**
 * Returns background and icon color for a given FAB variant.
 */
export function getFabColors(variant: FabVariant = 'primary'): { backgroundColor: string; iconColor: string } {
  if (variant === 'secondary') {
    return {
      backgroundColor: colors.secondaryContainer,
      iconColor: colors.onSecondaryContainer,
    };
  }

  return {
    backgroundColor: colors.primary,
    iconColor: colors.onPrimary,
  };
}

/**
 * Returns the border radius corresponding to the FAB shape.
 */
export function getFabBorderRadius(shape: FabShape = 'circle'): number {
  return shape === 'circle' ? radii.full : radii.lg;
}
