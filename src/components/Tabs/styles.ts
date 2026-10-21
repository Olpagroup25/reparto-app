import { StyleSheet } from 'react-native';
import { colors, palette, spacing, typography } from '@/theme/tokens';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderBottomWidth: 4,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
    backgroundColor: `${palette.primaryFixed}4D`, // ~30% opacity, matches bg-primary-fixed/30
  },
  tabInactive: {},
  label: {
    fontFamily: typography.bodyMd.fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: `${colors.primary}B3`, // ~70% opacity, matches text-primary/70
  },
  labelActive: {
    fontWeight: '700',
    color: colors.primary,
  },
});
