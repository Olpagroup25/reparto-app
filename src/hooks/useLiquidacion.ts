import { useQuery } from '@tanstack/react-query';
import { repartoApiClient } from '@/api/repartoApiClient';

/**
 * Liquidación completa de la hoja de ruta del día (Paso 1.9 / GET /insa/api/liquidacion).
 *
 * Solo lectura — los cuadros de artículos, envases y fallados los calcula el
 * backend server-side al pasar la hoja a 'consolidando' (action_registrar_caja).
 *
 * `disponible` es False hasta que:
 *   1. La hoja esté en 'consolidando' o 'cerrada'.
 *   2. El control de entrada esté aprobado por un controlador (RN-23 / C-08).
 *
 * El hook devuelve `null` para `data` mientras está cargando — la pantalla
 * de liquidación debe mostrar un estado de "pendiente" hasta que `disponible`
 * sea True.
 *
 * `staleTime` de 30 segundos: la liquidación puede actualizarse si el
 * supervisor re-calcula (action_recalcular_liquidacion) — un TTL corto
 * permite que el repartidor vea cambios sin forzar un refetch manual.
 */
export function useLiquidacion(date: string) {
  return useQuery({
    queryKey: ['reparto', 'liquidacion', date],
    queryFn: () => repartoApiClient.getLiquidacion(date),
    staleTime: 1000 * 30,
    retry: false,
  });
}
