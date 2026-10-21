import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme/tokens';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: typography.headlineMd.fontFamily,
    fontSize: typography.headlineMd.fontSize,
    lineHeight: typography.headlineMd.lineHeight,
    fontWeight: '700',
    color: colors.primary,
  },
  list: {
    gap: spacing.xs,
  },
  userFooter: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontFamily: typography.labelLg.fontFamily,
    fontSize: typography.labelLg.fontSize,
    lineHeight: typography.labelLg.lineHeight,
    color: colors.onSurface,
  },
  userRole: {
    fontFamily: typography.labelSm.fontFamily,
    fontSize: typography.labelSm.fontSize,
    lineHeight: typography.labelSm.lineHeight,
    color: colors.outline,
  },
  versionFooter: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: spacing.md,
    opacity: 0.4,
  },
  versionText: {
    fontFamily: typography.labelSm.fontFamily,
    fontSize: typography.labelSm.fontSize,
    color: colors.onSurface,
  },
});
