export interface GastosDeRepartoDialogProps {
  visible: boolean;
  onClose: () => void;
  /** ISO date (YYYY-MM-DD) of the dayroute — threaded from HojaDeRutaScreen's
   * route param, never re-derived from the device clock. */
  deliveryDate: string;
}

export type VistaGasto = 'list' | 'form' | 'tipoPicker';
