import { StyleSheet } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme/tokens';

export const CELL_SIZE = 40;

export const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.marginMobile,
    gap: spacing.lg,
  },
  headline: {
    fontFamily: typography.headlineLg.fontFamily,
    fontSize: typography.headlineLg.fontSize,
    lineHeight: typography.headlineLg.lineHeight,
    color: colors.onSurface,
    textAlign: 'center',
  },
  dateCard: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  dateIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.secondaryContainer}33`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontFamily: typography.display.fontFamily,
    fontSize: 40,
    color: colors.primary,
    fontWeight: '700',
  },
  weekdayText: {
    fontFamily: typography.labelLg.fontFamily,
    fontSize: typography.labelLg.fontSize,
    letterSpacing: 1,
    color: colors.onSurfaceVariant,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.surfaceContainerLow,
  },
  footerButton: {
    flex: 1,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  calendarTitle: {
    fontFamily: typography.headlineMd.fontFamily,
    fontSize: typography.headlineMd.fontSize,
    color: colors.onSurface,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekdayLabel: {
    width: CELL_SIZE,
    textAlign: 'center',
    fontFamily: typography.labelSm.fontFamily,
    fontSize: typography.labelSm.fontSize,
    color: colors.onSurfaceVariant,
  },
  grid: {
    flexDirection: 'column',
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.base,
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
  },
  dayCellDisabled: {
    opacity: 0.35,
  },
  dayText: {
    fontFamily: typography.bodyMd.fontFamily,
    fontSize: typography.bodyMd.fontSize,
    color: colors.onSurface,
  },
  dayTextMuted: {
    color: colors.outlineVariant,
  },
  dayTextDisabled: {
    color: colors.outlineVariant,
  },
  dayTextSelected: {
    color: colors.onPrimary,
    fontWeight: '700',
  },
});
