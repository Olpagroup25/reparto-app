import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ButtonVariant } from '@/components/Button';

export type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'confirm' | 'loading';

export type FeedbackDialogProps = {
  visible: boolean;
  type?: FeedbackType;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  /** Permite mostrar un loader en el botón de confirmación si hay un proceso en curso */
  confirmLoading?: boolean;
  /** Cierre automático tras X milisegundos (opcional, p.ej. en éxitos) */
  autoCloseMs?: number;
};

export interface FeedbackTypeConfig {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  bgColor: string;
  defaultTitle: string;
  confirmVariant: ButtonVariant;
}
