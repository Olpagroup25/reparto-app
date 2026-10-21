import { useQuery } from '@tanstack/react-query';
import { repartoApiClient } from '@/api/repartoApiClient';

/**
 * Declared expenses for the current route + delivery date, and the expense
 * categories for the "Declarar Nuevo Gasto" form.
 *
 * Both endpoints are **not built on the backend yet** (see README).
 * `GastosDeRepartoDialog` treats a 404 on the list as "no expenses" and falls
 * back to a fixed category list. Creating an expense goes through
 * `queuedWrites.crearGastoReparto` → the offline outbox.
 */
export function useGastosDeReparto(date: string) {
  return useQuery({
    queryKey: ['reparto', 'gastos-reparto', date],
    queryFn: () => repartoApiClient.getGastosDeReparto(date),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useTiposGasto() {
  return useQuery({
    queryKey: ['reparto', 'tipos-gasto'],
    queryFn: () => repartoApiClient.getTiposGasto(),
    staleTime: 1000 * 60 * 60,
    retry: false,
  });
}
