import { StyleSheet } from 'react-native';
import { colors, elevation, spacing, typography } from '@/theme/tokens';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.marginMobile,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...elevation.level1,
  },
  title: {
    fontFamily: typography.headlineLg.fontFamily,
    fontSize: typography.headlineLg.fontSize,
    lineHeight: typography.headlineLg.lineHeight,
    color: colors.onBackground,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    fontFamily: typography.bodyLg.fontFamily,
    fontSize: typography.bodyLg.fontSize,
    lineHeight: typography.bodyLg.lineHeight,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: spacing.xl,
  },
  action: {
    marginBottom: spacing.md,
  },
  secondaryLink: {
    fontFamily: typography.labelLg.fontFamily,
    fontSize: typography.labelLg.fontSize,
    color: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
