/**
 * Reference-data reads (catálogo de productos, ciudades, calles) as TanStack
 * Query hooks so they land in the persisted cache (src/sync/queryPersister.ts)
 * and are therefore available offline — you can't register a visit or an alta
 * without them.
 *
 * `staleTime` is generous: these lists barely change during a route, and when
 * offline a stale value beats no value.
 */
import { useQuery } from '@tanstack/react-query';
import { repartoApiClient } from '@/api/repartoApiClient';

const REFERENCE_STALE_TIME = 1000 * 60 * 60; // 1h

/** product.template filtered to visible_control_playa=True. */
export function useCatalogo() {
  return useQuery({
    queryKey: ['reparto', 'catalogo'],
    queryFn: () => repartoApiClient.getCatalogo(),
    staleTime: REFERENCE_STALE_TIME,
  });
}

/** insa.city options for the alta form. */
export function useCiudades() {
  return useQuery({
    queryKey: ['reparto', 'ciudades'],
    queryFn: () => repartoApiClient.getCiudades(),
    staleTime: REFERENCE_STALE_TIME,
  });
}

/** insa.street options for one city — disabled until a city is picked. */
export function useCalles(cityId: number | null | undefined) {
  return useQuery({
    queryKey: ['reparto', 'calles', cityId ?? null],
    queryFn: () => repartoApiClient.getCalles(cityId as number),
    enabled: cityId != null,
    staleTime: REFERENCE_STALE_TIME,
  });
}

/** Control de playa (salida y entrada) para la fecha seleccionada. */
export function useControlPlaya(deliveryDate: string) {
  return useQuery({
    queryKey: ['reparto', 'control-playa', deliveryDate],
    queryFn: () => repartoApiClient.getControlPlaya(deliveryDate),
    enabled: Boolean(deliveryDate),
  });
}
