import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme/tokens';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  spaced: {
    marginTop: spacing.sm,
  },
  error: {
    marginTop: spacing.sm,
    fontFamily: typography.labelSm.fontFamily,
    fontSize: typography.labelSm.fontSize,
    color: colors.error,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.md,
  },
  sessionErrorBanner: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  sessionErrorText: {
    fontFamily: typography.labelSm.fontFamily,
    fontSize: typography.labelSm.fontSize,
    color: '#E65100',
    textAlign: 'center',
  },
  version: {
    marginTop: spacing.lg,
    fontFamily: typography.labelSm.fontFamily,
    fontSize: typography.labelSm.fontSize,
    color: colors.outline,
  },
});
