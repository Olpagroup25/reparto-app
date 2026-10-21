import { StyleSheet } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme/tokens';
import { BadgeVariant } from './types';

export const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: radii.base,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  md: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: {
    fontFamily: typography.labelSm.fontFamily,
    fontSize: typography.labelSm.fontSize,
    lineHeight: typography.labelSm.lineHeight,
    fontWeight: '700',
  },
  textMd: {
    fontFamily: typography.labelLg.fontFamily,
    fontSize: typography.labelLg.fontSize,
    lineHeight: typography.labelLg.lineHeight,
  },
});

export const variantStyles: Record<BadgeVariant, { backgroundColor: string; color: string }> = {
  primary: { backgroundColor: colors.primary, color: colors.onPrimary },
  secondary: { backgroundColor: colors.secondaryContainer, color: colors.onSecondaryContainer },
  error: { backgroundColor: colors.errorContainer, color: colors.onErrorContainer },
  neutral: { backgroundColor: colors.surfaceVariant, color: colors.onSurfaceVariant },
};
