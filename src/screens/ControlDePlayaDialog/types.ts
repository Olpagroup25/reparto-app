import type { FeedbackType } from '@/components';

export interface ControlDePlayaDialogProps {
  visible: boolean;
  onClose: () => void;
  /** ISO date (YYYY-MM-DD) of the dayroute — threaded from HojaDeRutaScreen's
   * route param, never re-derived from the device clock. */
  deliveryDate: string;
  onApproved?: () => void;
  onSaved?: () => void;
}

export type TabKey = 'articulos' | 'dispensers' | 'repuestos';
export type FlowType = 'salida' | 'entrada';

export interface TabItem {
  key: TabKey;
  label: string;
  addLabel: string;
}

export interface LineaEditable {
  productId: number;
  nombre: string;
  cantidad: string;
  cantidadVacia: string;
  cantidadFallada: string;
  aCargar?: number;
}

export interface FeedbackState {
  visible: boolean;
  type: FeedbackType;
  title: string;
  message: string;
  autoCloseMs?: number;
}
