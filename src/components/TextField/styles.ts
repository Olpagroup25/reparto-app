import { StyleSheet } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme/tokens';

export const styles = StyleSheet.create({
  label: {
    fontFamily: typography.labelLg.fontFamily,
    fontSize: typography.labelLg.fontSize,
    lineHeight: typography.labelLg.lineHeight,
    letterSpacing: typography.labelLg.letterSpacing,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    justifyContent: 'center',
  },
  input: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.base,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: typography.bodyMd.fontFamily,
    fontSize: typography.bodyMd.fontSize,
    color: colors.onSurface,
  },
  inputWithLeftIcon: {
    paddingLeft: spacing.xl + spacing.sm,
  },
  inputWithIcon: {
    paddingRight: spacing.xl,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
    backgroundColor: colors.errorContainer,
  },
  inputDisabled: {
    backgroundColor: colors.surfaceContainerHigh,
    color: colors.onSurfaceVariant,
  },
  leftIcon: {
    position: 'absolute',
    left: spacing.sm,
    zIndex: 1,
  },
  leftText: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
    fontFamily: typography.bodyMd.fontFamily,
    fontSize: typography.bodyMd.fontSize,
    color: colors.onSurfaceVariant,
  },
  leftTextDisabled: {
    color: colors.outline,
  },
  rightIcon: {
    position: 'absolute',
    right: spacing.xs,
  },
  errorText: {
    fontFamily: typography.labelSm.fontFamily,
    fontSize: typography.labelSm.fontSize,
    lineHeight: typography.labelSm.lineHeight,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
