import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme/tokens';

export const styles = StyleSheet.create({
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  pickerTitle: {
    fontFamily: typography.headlineMd.fontFamily,
    fontSize: 18,
    fontWeight: '600',
    color: colors.onSurface,
  },
  pickerList: {
    marginTop: spacing.sm,
  },
  descriptionText: {
    fontFamily: typography.bodyMd.fontFamily,
    fontSize: typography.bodyMd.fontSize,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    fontFamily: typography.labelLg.fontFamily,
    fontSize: typography.labelLg.fontSize,
    color: colors.onSurface,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  hintText: {
    fontFamily: typography.labelSm.fontFamily,
    fontSize: typography.labelSm.fontSize,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rowItem: {
    flex: 2,
  },
  rowItemSmall: {
    flex: 1,
  },
  spaced: {
    marginTop: spacing.sm,
  },
  emptyText: {
    fontFamily: typography.bodyMd.fontFamily,
    fontSize: typography.bodyMd.fontSize,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: typography.bodyMd.fontFamily,
    fontSize: typography.bodyMd.fontSize,
    color: colors.error,
    marginBottom: spacing.md,
  },
  footerButton: {
    flex: 1,
  },
});
