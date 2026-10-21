import { StyleSheet } from 'react-native';
import { colors, elevation, radii, spacing, typography } from '@/theme/tokens';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.marginMobile,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  panel: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...elevation.level2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  title: {
    flex: 1,
    fontFamily: typography.headlineMd.fontFamily,
    fontSize: typography.headlineMd.fontSize,
    lineHeight: typography.headlineMd.lineHeight,
    color: colors.onSurface,
  },
  body: {
    padding: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surfaceContainerLow,
  },
});
