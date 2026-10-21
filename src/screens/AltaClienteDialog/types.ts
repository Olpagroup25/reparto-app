import type { FeedbackType } from '@/components';
import type { ClienteBusqueda, FrecuenciaEntrega, TipoCliente } from '@/api/types';

export interface AltaClienteDialogProps {
  visible: boolean;
  onClose: () => void;
  deliveryDate?: string;
  onCreated: (cliente: ClienteBusqueda) => void;
}

export type PickerFor = 'ciudad' | 'calle' | null;

export interface FeedbackState {
  visible: boolean;
  type: FeedbackType;
  title: string;
  message: string;
  autoCloseMs?: number;
}

export interface FrecuenciaOption {
  key: FrecuenciaEntrega;
  label: string;
}

export interface AltaClienteFormData {
  nombre: string;
  telefono: string;
  cuitDni: string;
  tipoCliente: TipoCliente;
  frecuencia: FrecuenciaEntrega;
  diasSemana: string[];
  numero: string;
}
