import { StyleSheet } from 'react-native';
import { colors, elevation, radii, spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.surfaceContainerLow,
    borderTopRightRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
    paddingHorizontal: spacing.md,
    ...elevation.level2,
  },
});
