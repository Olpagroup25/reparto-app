import { StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme/tokens';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
});
