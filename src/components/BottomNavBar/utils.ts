import { colors } from '@/theme/tokens';

export const BASE_NAV_BAR_HEIGHT = 64;

/**
 * Calculates the total navigation bar height including safe area bottom insets.
 */
export function calculateNavBarHeight(bottomInset: number = 0): number {
  return BASE_NAV_BAR_HEIGHT + bottomInset;
}

/**
 * Resolves the icon and text color for a navigation tab item based on active state.
 */
export function getNavItemColor(active: boolean): { iconColor: string; textColor: string } {
  return {
    iconColor: active ? colors.primary : colors.onSurfaceVariant,
    textColor: active ? colors.primary : colors.onSurfaceVariant,
  };
}
