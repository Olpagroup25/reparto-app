import { variantStyles } from './styles';
import { BadgeVariant } from './types';

/**
 * Retrieves the background and text color styling for a given Badge variant.
 */
export function getBadgeVariantStyle(variant: BadgeVariant = 'neutral') {
  return variantStyles[variant] || variantStyles.neutral;
}
