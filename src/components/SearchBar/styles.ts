import { StyleSheet } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme/tokens';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: spacing.sm,
    zIndex: 1,
  },
  clearButton: {
    position: 'absolute',
    right: spacing.sm,
    zIndex: 1,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.xl,
    paddingRight: spacing.sm,
    fontFamily: typography.bodyMd.fontFamily,
    fontSize: typography.bodyMd.fontSize,
    color: colors.onSurface,
  },
  inputWithClear: {
    paddingRight: spacing.xl,
  },
});
