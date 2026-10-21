import { colors } from '@/theme/tokens';

/**
 * Resolves the leading icon color based on highlighted state.
 */
export function getListItemIconColor(highlighted: boolean): string {
  return highlighted ? colors.onPrimaryContainer : colors.primary;
}
