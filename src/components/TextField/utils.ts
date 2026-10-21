import { colors } from '@/theme/tokens';

/**
 * Resolves left icon color based on editable status.
 */
export function getLeftIconColor(editable: boolean): string {
  return !editable ? colors.outline : colors.onSurfaceVariant;
}
