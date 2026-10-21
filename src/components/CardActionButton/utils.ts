import { colors } from '@/theme/tokens';

/**
 * Returns the effective icon and label color, defaulting to the primary brand color.
 */
export function getActionButtonColor(color?: string): string {
  return color || colors.primary;
}
