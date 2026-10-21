import type { StockEnRutaItem } from '@/api/types';

export type StockEnRutaDialogProps = {
  visible: boolean;
  onClose: () => void;
  /** ISO date (YYYY-MM-DD) of the dayroute — threaded from HojaDeRutaScreen's
   * route param, never re-derived from the device clock. */
  deliveryDate: string;
};

export type StockCampoKey = 'disponibles' | 'vacios' | 'fallados' | 'totalEnvases';

export type StockCampo = {
  key: StockCampoKey;
  label: string;
  color: string;
};

export type ProductoStockCardProps = {
  item: StockEnRutaItem;
};
