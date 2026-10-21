import { colors } from '@/theme/tokens';
import type { StockCampo } from './types';

export const STOCK_CAMPOS: readonly StockCampo[] = [
  { key: 'disponibles', label: 'Disponibles', color: colors.success },
  { key: 'vacios', label: 'Vacíos', color: colors.warning },
  { key: 'fallados', label: 'Fallados', color: colors.error },
  { key: 'totalEnvases', label: 'Total Envases', color: colors.onSurface },
] as const;
