import { StyleSheet } from 'react-native';
import { colors, elevation, spacing, typography } from '@/theme/tokens';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.marginMobile,
    gap: spacing.sm,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...elevation.level1,
  },
  title: {
    fontFamily: typography.headlineMd.fontFamily,
    fontSize: typography.headlineMd.fontSize,
    lineHeight: typography.headlineMd.lineHeight,
    color: colors.onBackground,
    textAlign: 'center',
  },
  message: {
    fontFamily: typography.bodyMd.fontFamily,
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: spacing.md,
  },
});
