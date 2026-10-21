import { StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  padded: {
    padding: spacing.marginMobile,
  },
});
