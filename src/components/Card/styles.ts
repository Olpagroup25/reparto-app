import { StyleSheet } from 'react-native';
import { colors, elevation, radii, spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...elevation.level1,
  },
  padded: {
    padding: spacing.md,
  },
});
