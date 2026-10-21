import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme/tokens';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    paddingVertical: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontFamily: typography.headlineMd.fontFamily,
    fontSize: 20,
    fontWeight: '600',
    color: colors.onPrimary,
  },
  listWrap: {
    minHeight: 320,
  },
  empty: {
    fontFamily: typography.bodyMd.fontFamily,
    fontSize: typography.bodyMd.fontSize,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  gastoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  gastoTexts: {
    flex: 1,
  },
  gastoTitulo: {
    fontFamily: typography.labelLg.fontFamily,
    fontSize: typography.labelLg.fontSize,
    fontWeight: '700',
    color: colors.onSurface,
  },
  gastoDesc: {
    fontFamily: typography.bodyMd.fontFamily,
    fontSize: typography.bodyMd.fontSize,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  gastoMonto: {
    fontFamily: typography.labelLg.fontFamily,
    fontSize: typography.labelLg.fontSize,
    fontWeight: '700',
    color: colors.primary,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    width: '100%',
  },
  totalLabel: {
    fontFamily: typography.labelLg.fontFamily,
    fontSize: typography.labelLg.fontSize,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  totalMonto: {
    fontFamily: typography.headlineMd.fontFamily,
    fontSize: typography.headlineMd.fontSize,
    color: colors.primary,
  },
  dialogFooterContent: {
    width: '100%',
    gap: spacing.sm,
  },
  nuevoGastoButton: {
    width: '100%',
  },
  pickerList: {
    marginTop: spacing.sm,
  },
  fieldLabel: {
    fontFamily: typography.labelLg.fontFamily,
    fontSize: typography.labelLg.fontSize,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  spaced: {
    marginTop: spacing.md,
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
  comprobanteSection: {
    marginTop: spacing.md,
  },
  fotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.outline,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerLowest || colors.surface,
  },
  fotoButtonText: {
    fontFamily: typography.labelLg.fontFamily,
    fontSize: typography.labelLg.fontSize,
    color: colors.primary,
    fontWeight: '600',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 6,
    backgroundColor: colors.surfaceContainerHigh,
  },
  previewInfo: {
    flex: 1,
  },
  previewTitle: {
    fontFamily: typography.labelLg.fontFamily,
    fontSize: typography.labelLg.fontSize,
    fontWeight: '600',
    color: colors.onSurface,
  },
  previewSubtitle: {
    fontFamily: typography.bodyMd.fontFamily,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  removeFotoBtn: {
    padding: spacing.xs,
  },
});
