import { StyleSheet } from 'react-native';
import { spacing, typography } from '@/theme/tokens';

export const styles = StyleSheet.create({
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    fontFamily: typography.labelSm.fontFamily,
    fontSize: typography.labelSm.fontSize,
    lineHeight: typography.labelSm.lineHeight,
    fontWeight: '700',
  },
});
