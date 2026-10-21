/**
 * React access to the local Repaso / Srv Tec marks (src/db/clientMarks.ts).
 *
 * Keeps two `Set<partnerId>` in state, reloads them when the route or the
 * delivery date changes, and exposes a `toggle` that flips a mark and
 * refreshes. Used once in HojaDeRutaScreen and threaded down to the cards.
 */
import { useCallback, useEffect, useState } from 'react';
import { addMark, type ClientMark, listMarks, removeMark } from '@/db/clientMarks';

export interface ClientMarksApi {
  /** First load done. */
  ready: boolean;
  repaso: Set<number>;
  srvTec: Set<number>;
  isRepaso: (partnerId: number) => boolean;
  isSrvTec: (partnerId: number) => boolean;
  /** Flip a mark for a client, then reload. */
  toggle: (mark: ClientMark, partnerId: number) => Promise<void>;
  reload: () => Promise<void>;
}

const EMPTY = new Set<number>();

export function useClientMarks(routeId: number | null, deliveryDate: string): ClientMarksApi {
  const [repaso, setRepaso] = useState<Set<number>>(EMPTY);
  const [srvTec, setSrvTec] = useState<Set<number>>(EMPTY);
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    if (routeId == null) {
      setRepaso(EMPTY);
      setSrvTec(EMPTY);
      setReady(true);
      return;
    }
    const rows = await listMarks(routeId, deliveryDate);
    setRepaso(new Set(rows.filter((r) => r.mark === 'repaso').map((r) => r.partnerId)));
    setSrvTec(new Set(rows.filter((r) => r.mark === 'srv_tec').map((r) => r.partnerId)));
    setReady(true);
  }, [routeId, deliveryDate]);

  useEffect(() => {
    setReady(false);
    void reload();
  }, [reload]);

  const toggle = useCallback(
    async (mark: ClientMark, partnerId: number) => {
      if (routeId == null) return;
      const set = mark === 'repaso' ? repaso : srvTec;
      if (set.has(partnerId)) {
        await removeMark(routeId, deliveryDate, partnerId, mark);
      } else {
        await addMark(routeId, deliveryDate, partnerId, mark);
      }
      await reload();
    },
    [routeId, deliveryDate, repaso, srvTec, reload],
  );

  return {
    ready,
    repaso,
    srvTec,
    isRepaso: useCallback((id: number) => repaso.has(id), [repaso]),
    isSrvTec: useCallback((id: number) => srvTec.has(id), [srvTec]),
    toggle,
    reload,
  };
}
