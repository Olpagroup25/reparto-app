import { StyleSheet } from 'react-native';
import { colors, elevation, radii, spacing, typography } from '@/theme/tokens';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: '88%',
    ...elevation.level2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  headerBadge: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radii.full,
    minWidth: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  headerBadgeText: {
    ...typography.labelLg,
    color: colors.onPrimaryContainer,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
  },
  hintText: {
    flex: 1,
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
  list: {
    flexGrow: 1,
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  positionBadge: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionText: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
    fontSize: 12,
  },
  rowInfo: {
    flex: 1,
  },
  rowLabel: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontFamily: typography.labelLg.fontFamily,
  },
  rowSublabel: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  arrows: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  arrowBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.base,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowBtnDisabled: {
    backgroundColor: colors.surfaceContainerLow,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surfaceContainerLow,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  footerBtn: {
    flex: 1,
  },
});
