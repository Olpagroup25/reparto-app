import { colors } from '@/theme/tokens';

/**
 * Resolves the icon color based on disabled state.
 */
export function getIconButtonIconColor(disabled: boolean, color: string = colors.onSurface): string {
  return disabled ? colors.outlineVariant : color;
}
