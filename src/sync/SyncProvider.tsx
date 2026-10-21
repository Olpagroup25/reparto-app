/**
 * App-wide state for the offline outbox: the queued items, their counts, the
 * last-sync timestamp, and the actions the Sync tab exposes (sync now, retry
 * one, discard one, toggle auto-sync).
 *
 * The outbox itself lives in SQLite (src/db/outbox.ts); this provider keeps a
 * React-friendly snapshot of it and calls `reload()` after anything that could
 * have changed it. It also owns the two automatic triggers:
 *   1. sync when the connection comes back (if auto-sync is on), and
 *   2. a backoff retry timer after a run that still leaves failed items.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { canUseLocalDb } from '@/db/database';
import * as outbox from '@/db/outbox';
import { subscribeOnline, useConnectivity } from './connectivity';
import {
  getAutoSyncOnReconnect,
  getLastSyncAt,
  setAutoSyncOnReconnect,
  setLastSyncAt,
} from './localSettings';
import { nextRetryDelayMs, runSync, type SyncRunResult } from './syncEngine';
import type { OutboxItem } from './types';

export interface SyncCounts {
  pending: number;
  failed: number;
  syncing: number;
  doneToday: number;
  /** pending + failed + syncing — what the nav badge and "hay cambios sin
   * sincronizar" checks use. */
  unsynced: number;
}

interface SyncContextValue {
  /** DB opened and first snapshot loaded. */
  ready: boolean;
  /** `false` on web — the Sync tab shows a "no disponible" note. */
  available: boolean;
  /** Not-yet-synced items, oldest first. */
  items: OutboxItem[];
  counts: SyncCounts;
  lastSyncAt: string | null;
  isSyncing: boolean;
  online: boolean;
  autoSync: boolean;
  setAutoSync: (value: boolean) => void;
  syncNow: () => Promise<SyncRunResult>;
  retryItem: (id: string) => Promise<void>;
  discardItem: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

const ZERO_COUNTS: SyncCounts = { pending: 0, failed: 0, syncing: 0, doneToday: 0, unsynced: 0 };

const SyncContext = createContext<SyncContextValue | null>(null);

/** Keep a `done` row around this long so "sincronizados hoy" stays meaningful,
 * then purge it on the next app start. */
const DONE_RETENTION_MS = 48 * 60 * 60 * 1000;

function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function SyncProvider({ children }: { children: ReactNode }) {
  const { online } = useConnectivity();
  const queryClient = useQueryClient();

  const [ready, setReady] = useState(!canUseLocalDb);
  const [items, setItems] = useState<OutboxItem[]>([]);
  const [counts, setCounts] = useState<SyncCounts>(ZERO_COUNTS);
  const [lastSyncAt, setLastSyncAtState] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSync, setAutoSyncState] = useState(true);

  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryAttempt = useRef(0);

  const reload = useCallback(async () => {
    if (!canUseLocalDb) return;
    const all = await outbox.listAll();
    const notDone = all.filter((i) => i.status !== 'done');
    const today = startOfToday();
    const doneToday = all.filter(
      (i) => i.status === 'done' && i.syncedAt != null && new Date(i.syncedAt).getTime() >= today,
    ).length;

    const next: SyncCounts = {
      pending: notDone.filter((i) => i.status === 'pending').length,
      failed: notDone.filter((i) => i.status === 'failed').length,
      syncing: notDone.filter((i) => i.status === 'syncing').length,
      doneToday,
      unsynced: notDone.length,
    };

    setItems(notDone);
    setCounts(next);
  }, []);

  const clearRetryTimer = useCallback(() => {
    if (retryTimer.current) {
      clearTimeout(retryTimer.current);
      retryTimer.current = null;
    }
  }, []);

  const syncNow = useCallback(async (): Promise<SyncRunResult> => {
    if (!canUseLocalDb) return { ran: false, reason: 'unavailable', synced: 0, failed: 0, skipped: 0, remaining: 0 };

    clearRetryTimer();
    setIsSyncing(true);
    try {
      const result = await runSync();
      if (result.synced > 0) {
        const now = new Date().toISOString();
        await setLastSyncAt(now);
        setLastSyncAtState(now);
        void queryClient.invalidateQueries({ queryKey: ['reparto'] });
      }
      await reload();

      // Schedule a backoff retry only if the run stopped with work still left
      // and it's worth trying again automatically.
      if (result.ran && result.remaining > 0 && result.reason !== 'offline' && autoSync) {
        retryAttempt.current += 1;
        const delay = nextRetryDelayMs(retryAttempt.current);
        retryTimer.current = setTimeout(() => void syncNow(), delay);
      } else {
        retryAttempt.current = 0;
      }

      return result;
    } finally {
      setIsSyncing(false);
    }
  }, [autoSync, clearRetryTimer, reload]);

  // First load: reset stuck rows, purge old `done`, read prefs, snapshot.
  useEffect(() => {
    if (!canUseLocalDb) return;
    let cancelled = false;
    (async () => {
      await outbox.resetStuckSyncing();
      await outbox.purgeDone(new Date(Date.now() - DONE_RETENTION_MS));
      const [storedLast, storedAuto] = await Promise.all([
        getLastSyncAt(),
        getAutoSyncOnReconnect(),
      ]);
      if (cancelled) return;
      setLastSyncAtState(storedLast);
      setAutoSyncState(storedAuto);
      await reload();
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  // Trigger a sync when connectivity is restored.
  useEffect(() => {
    if (!canUseLocalDb) return;
    const unsubscribe = subscribeOnline((isOnline) => {
      if (isOnline && autoSync) void syncNow();
    });
    return unsubscribe;
  }, [autoSync, syncNow]);

  useEffect(() => clearRetryTimer, [clearRetryTimer]);

  const setAutoSync = useCallback((value: boolean) => {
    setAutoSyncState(value);
    void setAutoSyncOnReconnect(value);
  }, []);

  const retryItem = useCallback(
    async (id: string) => {
      await outbox.update(id, { status: 'pending', lastError: null });
      await reload();
      await syncNow();
    },
    [reload, syncNow],
  );

  const discardItem = useCallback(
    async (id: string) => {
      await outbox.remove(id);
      await reload();
    },
    [reload],
  );

  const value = useMemo<SyncContextValue>(
    () => ({
      ready,
      available: canUseLocalDb,
      items,
      counts,
      lastSyncAt,
      isSyncing,
      online,
      autoSync,
      setAutoSync,
      syncNow,
      retryItem,
      discardItem,
      reload,
    }),
    [
      ready,
      items,
      counts,
      lastSyncAt,
      isSyncing,
      online,
      autoSync,
      setAutoSync,
      syncNow,
      retryItem,
      discardItem,
      reload,
    ],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync(): SyncContextValue {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync must be used within a SyncProvider');
  return ctx;
}
