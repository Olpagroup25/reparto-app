/**
 * Tiny persisted key/value for the sync layer's own preferences — "when did we
 * last sync" and "auto-sync on reconnect?". Backed by `expo-sqlite/kv-store`
 * (SQLite under the hood, same engine as the outbox, no AsyncStorage).
 *
 * Every call is guarded for web / storage failure and falls back to a sane
 * default rather than throwing.
 */
import Storage from 'expo-sqlite/kv-store';
import { canUseLocalDb } from '@/db/database';

const KEY_LAST_SYNC = 'sync.lastSyncAt';
const KEY_AUTO_SYNC = 'sync.autoSyncOnReconnect';
const KEY_LIST_MODE = 'hojaDeRuta.listMode';

export async function getLastSyncAt(): Promise<string | null> {
  if (!canUseLocalDb) return null;
  try {
    return await Storage.getItem(KEY_LAST_SYNC);
  } catch {
    return null;
  }
}

export async function setLastSyncAt(iso: string): Promise<void> {
  if (!canUseLocalDb) return;
  try {
    await Storage.setItem(KEY_LAST_SYNC, iso);
  } catch {
    /* ignore */
  }
}

/** Defaults to `true` — the recommended behaviour. */
export async function getAutoSyncOnReconnect(): Promise<boolean> {
  if (!canUseLocalDb) return false;
  try {
    return (await Storage.getItem(KEY_AUTO_SYNC)) !== 'false';
  } catch {
    return true;
  }
}

export async function setAutoSyncOnReconnect(value: boolean): Promise<void> {
  if (!canUseLocalDb) return;
  try {
    await Storage.setItem(KEY_AUTO_SYNC, value ? 'true' : 'false');
  } catch {
    /* ignore */
  }
}

export type ListMode = 'interactiva' | 'lectura';

/** Remembered read-only/interactive choice for the client list. Defaults to
 * `interactiva`. */
export async function getListMode(): Promise<ListMode> {
  if (!canUseLocalDb) return 'interactiva';
  try {
    return (await Storage.getItem(KEY_LIST_MODE)) === 'lectura' ? 'lectura' : 'interactiva';
  } catch {
    return 'interactiva';
  }
}

export async function setListMode(value: ListMode): Promise<void> {
  if (!canUseLocalDb) return;
  try {
    await Storage.setItem(KEY_LIST_MODE, value);
  } catch {
    /* ignore */
  }
}

const KEY_PREFIX_CLOSED_DATE = 'hojaDeRuta.closedDate.';

export async function isDateClosedLocally(date: string): Promise<boolean> {
  if (!canUseLocalDb) return false;
  try {
    return (await Storage.getItem(`${KEY_PREFIX_CLOSED_DATE}${date}`)) === 'true';
  } catch {
    return false;
  }
}

export async function markDateClosedLocally(date: string): Promise<void> {
  if (!canUseLocalDb) return;
  try {
    await Storage.setItem(`${KEY_PREFIX_CLOSED_DATE}${date}`, 'true');
  } catch {
    /* ignore */
  }
}

