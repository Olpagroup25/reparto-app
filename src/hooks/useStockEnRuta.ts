import { useQuery } from '@tanstack/react-query';
import { repartoApiClient } from '@/api/repartoApiClient';
import type { StockEnRutaItem } from '@/api/types';

/**
 * Per-product stock on the vehicle for the current route + the given delivery
 * date (disponibles / vacíos / fallados / total de envases).
 *
 * Consulta GET /insa/api/stock-en-ruta directamente a Odoo.
 */
export function useStockEnRuta(date: string) {
  return useQuery({
    queryKey: ['reparto', 'stock-en-ruta', date],
    queryFn: () => repartoApiClient.getStockEnRuta(date),
    staleTime: 1000 * 5,
  });
}
