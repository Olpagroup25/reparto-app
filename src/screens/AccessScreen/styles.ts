import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme/tokens';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: typography.labelLg.fontFamily,
    fontSize: typography.labelLg.fontSize,
    fontWeight: '700',
    color: colors.onSecondaryContainer,
  },
  userName: {
    fontFamily: typography.bodyLg.fontFamily,
    fontSize: typography.bodyLg.fontSize,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 2,
  },
  factoryInfo: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  factoryName: {
    fontFamily: typography.headlineLg.fontFamily,
    fontSize: typography.headlineLg.fontSize,
    lineHeight: typography.headlineLg.lineHeight,
    fontWeight: '600',
    color: colors.primary,
  },
  factorySubtitle: {
    fontFamily: typography.bodyLg.fontFamily,
    fontSize: typography.bodyLg.fontSize,
    color: colors.info,
    marginTop: spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  actions: {
    width: '100%',
    maxWidth: 400,
  },
  spaced: {
    marginTop: spacing.md,
  },
  version: {
    marginTop: 'auto',
    paddingTop: spacing.xl,
    fontFamily: typography.labelSm.fontFamily,
    fontSize: typography.labelSm.fontSize,
    color: colors.outline,
  },
});
