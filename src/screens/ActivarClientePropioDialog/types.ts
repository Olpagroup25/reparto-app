import type { FeedbackType } from '@/components';
import type { ClienteBusqueda, ClienteVisita } from '@/api/types';

export interface ActivarClientePropioDialogProps {
  visible: boolean;
  onClose: () => void;
  deliveryDate?: string;
  cliente: ClienteBusqueda | ClienteVisita | null;
  onActivated: (cliente: ClienteBusqueda) => void;
}

export type PickerFor = 'ciudad' | 'calle' | null;

export interface FeedbackState {
  visible: boolean;
  type: FeedbackType;
  title: string;
  message: string;
  autoCloseMs?: number;
}

export interface ActivarClienteFormState {
  numero: string;
  piso: string;
  depto: string;
  notas: string;
}
