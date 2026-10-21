import { StyleSheet } from 'react-native';
import { colors, typography } from '@/theme/tokens';

export const styles = StyleSheet.create({
  label: {
    fontFamily: typography.labelSm.fontFamily,
    fontSize: typography.labelSm.fontSize,
    lineHeight: typography.labelSm.lineHeight,
    color: colors.outline,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 2,
  },
  value: {
    fontFamily: typography.headlineMd.fontFamily,
    fontSize: typography.headlineMd.fontSize,
    lineHeight: typography.headlineMd.lineHeight,
  },
  valueLg: {
    fontFamily: typography.display.fontFamily,
    fontSize: typography.display.fontSize,
    lineHeight: typography.display.lineHeight,
  },
});
