import { StyleSheet, ViewStyle } from 'react-native';
import { colors, palette, spacing, typography } from '@/theme/tokens';
import { ButtonVariant } from './types';

export const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontFamily: typography.labelLg.fontFamily,
    fontSize: typography.labelLg.fontSize,
    fontWeight: typography.labelLg.fontWeight,
    lineHeight: typography.labelLg.lineHeight,
    letterSpacing: typography.labelLg.letterSpacing,
  },
  disabledContainer: {
    backgroundColor: colors.surfaceContainerHigh,
    borderColor: colors.surfaceContainerHigh,
  },
  disabledText: {
    color: colors.outline,
  },
});

export const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: { color: string } }> = {
  primary: {
    container: { backgroundColor: colors.primary },
    text: { color: colors.onPrimary },
  },
  secondary: {
    container: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary },
    text: { color: colors.primary },
  },
  success: {
    container: { backgroundColor: colors.success },
    text: { color: colors.onSuccess },
  },
  tertiary: {
    // Matches access_screen's "Hoja de ruta" option exactly (bg-tertiary-fixed / text-on-tertiary-fixed-variant).
    container: { backgroundColor: palette.tertiaryFixed },
    text: { color: palette.onTertiaryFixedVariant },
  },
  neutral: {
    container: { backgroundColor: colors.surfaceContainerHighest },
    text: { color: colors.onSurfaceVariant },
  },
};
