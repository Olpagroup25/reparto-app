import { StyleSheet } from 'react-native';
import { radii, spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  base: {
    padding: spacing.sm,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.3,
  },
});
