/**
 * Offline read cache. TanStack Query already holds every server read in
 * memory; this persists that cache to disk (via `expo-sqlite/kv-store`, the
 * same SQLite engine as the outbox) so the app can open and render
 * — hoja de ruta, catálogo, ciudades, calles — with no connection at all.
 *
 * Wired in App.tsx through `PersistQueryClientProvider`. On web `storage` is
 * `undefined`, which makes this a no-op persister (the package handles that).
 */
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import Storage from 'expo-sqlite/kv-store';
import type { Query } from '@tanstack/react-query';
import { canUseLocalDb } from '@/db/database';

export const QUERY_CACHE_KEY = 'insa-reparto-query-cache';

/** How long a persisted entry may be restored after it was written. */
export const QUERY_CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days

export const queryPersister = createAsyncStoragePersister({
  storage: canUseLocalDb
    ? {
        getItem: (key) => Storage.getItem(key),
        setItem: (key, value) => Storage.setItem(key, value),
        removeItem: (key) => Storage.removeItem(key),
      }
    : undefined,
  key: QUERY_CACHE_KEY,
  throttleTime: 1000,
});

/**
 * Only cache the reference/list data that's useful offline. The auth probe
 * (`whoami`) and anything not prefixed `reparto` is left in memory only.
 */
export function shouldPersistQuery(query: Query): boolean {
  const key = query.queryKey;
  if (!Array.isArray(key) || key[0] !== 'reparto') return false;
  const kind = key[1];
  return (
    kind === 'hoja-de-ruta' ||
    kind === 'catalogo' ||
    kind === 'ciudades' ||
    kind === 'calles' ||
    kind === 'stock-en-ruta' ||
    kind === 'gastos-reparto' ||
    kind === 'tipos-gasto'
  );
}
