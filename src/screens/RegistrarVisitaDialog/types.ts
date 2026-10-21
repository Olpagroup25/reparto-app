import type { FeedbackType } from '@/components';
import type { ClienteVisita } from '@/api/types';

export type RegistrarVisitaDialogProps = {
  visible: boolean;
  onClose: () => void;
  /** ISO date (YYYY-MM-DD) of the dayroute this visit belongs to. */
  deliveryDate: string;
  cliente: ClienteVisita | null;
  onSaved: (cliente: ClienteVisita) => void;
  readOnly?: boolean;
};

export type ModoVisita = 'sin_transaccion' | 'transaccion';
export type Modo = ModoVisita;

export type MedioPago = 'efectivo' | 'transferencia';

export type ResultadoVisita = 'ausente' | 'sin_gestion' | null;

export type LineaArticuloEditable = {
  productId: number;
  nombre: string;
  tipo: 'venta' | 'devolucion';
  cantidad: string;
  precioUnitario: string;
};

export type LineaEnvaseEditable = {
  productId: number;
  nombre: string;
  tipo: 'prestamo' | 'devolucion';
  cantidad: string;
};

export type FeedbackState = {
  visible: boolean;
  type: FeedbackType;
  title: string;
  message: string;
  autoCloseMs?: number;
};

export type PickerForType = 'articulo' | 'envase' | null;
