import { StyleSheet } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme/tokens';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.base,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  pressed: {
    backgroundColor: colors.surfaceVariant,
  },
  highlighted: {
    backgroundColor: colors.primaryContainer,
  },
  icon: {
    width: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: typography.bodyMd.fontFamily,
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    color: colors.onSurface,
  },
  titleHighlighted: {
    color: colors.onPrimaryContainer,
    fontWeight: '700',
  },
  subtitle: {
    fontFamily: typography.labelSm.fontFamily,
    fontSize: typography.labelSm.fontSize,
    lineHeight: typography.labelSm.lineHeight,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
});
