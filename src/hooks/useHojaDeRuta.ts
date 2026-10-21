import { useQuery } from '@tanstack/react-query';
import { repartoApiClient } from '@/api/repartoApiClient';
import * as localRouteStore from '@/db/localRouteStore';
import type { HojaDeRutaResponse } from '@/api/types';

/**
 * Fetches the day's route sheet + client stops for the currently
 * authenticated route/vehicle credential.
 *
 * Keeps the local SQLite database as an exact mirror of Odoo.sh,
 * and falls back to SQLite immediately in offline mode.
 */
export function useHojaDeRuta(date: string) {
  const session = repartoApiClient.getSession();
  const routeId = session?.routeId ?? null;

  return useQuery<HojaDeRutaResponse>({
    queryKey: ['reparto', 'hoja-de-ruta', date],
    queryFn: async (): Promise<HojaDeRutaResponse> => {
      try {
        const remote = await repartoApiClient.getHojaDeRuta(date);
        if (routeId != null) {
          await localRouteStore.saveLocalDayroute(routeId, date, remote);
          const mirrored = await localRouteStore.getLocalDayroute(routeId, date);
          if (mirrored) return mirrored;
        }
        return remote;
      } catch (err) {
        if (routeId != null) {
          const local = await localRouteStore.getLocalDayroute(routeId, date);
          if (local) return local;
        }
        throw err;
      }
    },
    refetchInterval: (query) => {
      const state = query.state.data?.hojaRuta?.state;
      return state === 'borrador' ? 10000 : false;
    },
  });
}
