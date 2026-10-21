import { radii } from '@/theme/tokens';
import { variantStyles } from './styles';
import { ButtonShape, ButtonVariant } from './types';

/**
 * Returns the border radius in pixels corresponding to the button shape.
 */
export function getButtonBorderRadius(shape: ButtonShape = 'pill'): number {
  switch (shape) {
    case 'pill':
      return radii.full;
    case 'md':
      return radii.md;
    case 'base':
    default:
      return radii.base;
  }
}

/**
 * Returns the container and text styling for a button variant.
 */
export function getButtonVariantStyle(variant: ButtonVariant = 'primary') {
  return variantStyles[variant] || variantStyles.primary;
}
