import { StyleSheet } from 'react-native';
import { elevation } from '@/theme/tokens';

export const styles = StyleSheet.create({
  base: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.level2,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
});
