import { StyleSheet } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme/tokens';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    paddingVertical: spacing.sm,
  },
  headerTitle: {
    fontFamily: typography.headlineMd.fontFamily,
    fontSize: 20,
    fontWeight: '600',
    color: colors.onPrimary,
  },
  body: {
    gap: spacing.md,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.infoContainer,
    borderRadius: radii.base,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  noticeText: {
    flex: 1,
    fontFamily: typography.labelSm.fontFamily,
    fontSize: typography.labelSm.fontSize,
    lineHeight: typography.labelSm.lineHeight,
    color: colors.onInfoContainer,
  },
  empty: {
    fontFamily: typography.bodyMd.fontFamily,
    fontSize: typography.bodyMd.fontSize,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  cardHeader: {
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  cardTitle: {
    fontFamily: typography.labelLg.fontFamily,
    fontSize: typography.labelLg.fontSize,
    fontWeight: '700',
    color: colors.onSurface,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  rowsCol: {
    flex: 1,
    gap: spacing.sm,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: radii.base,
    backgroundColor: colors.surfaceContainerHigh,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  rowLabel: {
    fontFamily: typography.bodyMd.fontFamily,
    fontSize: typography.bodyMd.fontSize,
    color: colors.onSurfaceVariant,
  },
  leader: {
    flex: 1,
    borderBottomWidth: 1,
    borderStyle: 'dotted',
    borderColor: colors.outlineVariant,
    marginHorizontal: spacing.sm,
  },
  rowValue: {
    fontFamily: typography.bodyMd.fontFamily,
    fontSize: typography.bodyMd.fontSize,
    fontWeight: '600',
    color: colors.onSurface,
    minWidth: 32,
    textAlign: 'right',
  },
  rowValueNegative: {
    color: colors.error,
  },
});
