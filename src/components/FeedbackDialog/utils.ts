import { colors, palette } from '@/theme/tokens';
import { FeedbackType, FeedbackTypeConfig } from './types';

export const TYPE_CONFIGS: Record<FeedbackType, FeedbackTypeConfig> = {
  success: {
    icon: 'check-circle',
    iconColor: '#2E7D32',
    bgColor: '#E8F5E9',
    defaultTitle: '¡Operación exitosa!',
    confirmVariant: 'success',
  },
  error: {
    icon: 'error-outline',
    iconColor: colors.error,
    bgColor: colors.errorContainer,
    defaultTitle: 'Ocurrió un error',
    confirmVariant: 'primary',
  },
  warning: {
    icon: 'warning-amber',
    iconColor: colors.warning,
    bgColor: colors.warningContainer,
    defaultTitle: 'Atención requerida',
    confirmVariant: 'primary',
  },
  info: {
    icon: 'info-outline',
    iconColor: colors.primary,
    bgColor: palette.primaryFixed,
    defaultTitle: 'Información',
    confirmVariant: 'primary',
  },
  confirm: {
    icon: 'help-outline',
    iconColor: colors.primary,
    bgColor: palette.primaryFixed,
    defaultTitle: '¿Confirmar acción?',
    confirmVariant: 'primary',
  },
  loading: {
    icon: 'hourglass-empty',
    iconColor: colors.primary,
    bgColor: palette.primaryFixed,
    defaultTitle: 'Procesando...',
    confirmVariant: 'primary',
  },
};

/**
 * Returns configuration settings for a given feedback type.
 */
export function getFeedbackConfig(type: FeedbackType = 'info'): FeedbackTypeConfig {
  return TYPE_CONFIGS[type] || TYPE_CONFIGS.info;
}
