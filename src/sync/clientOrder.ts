/**
 * Persists the repartidor's custom ordering of clients for the day's route.
 *
 * Follows the same pattern as localSettings.ts: backed by `expo-sqlite/kv-store`
 * (SQLite, same engine as the outbox and query cache), guarded by canUseLocalDb
 * for web compat, and swallows storage errors gracefully.
 *
 * Key is scoped to routeId + date so different routes / days never collide.
 * Value is a JSON array of partnerId numbers in the desired display order.
 * Returns null when no order has been saved yet → caller falls back to the
 * server-returned sequence.
 */
import Storage from 'expo-sqlite/kv-store';
import { canUseLocalDb } from '@/db/database';

function storageKey(routeId: number | null, date: string): string {
  return `insa_reparto:client_order:${routeId ?? 'none'}:${date}`;
}

export async function getClientOrder(
  routeId: number | null,
  date: string,
): Promise<number[] | null> {
  if (!canUseLocalDb) return null;
  try {
    const raw = await Storage.getItem(storageKey(routeId, date));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as number[];
  } catch {
    return null;
  }
}

export async function setClientOrder(
  routeId: number | null,
  date: string,
  ids: number[],
): Promise<void> {
  if (!canUseLocalDb) return;
  try {
    await Storage.setItem(storageKey(routeId, date), JSON.stringify(ids));
  } catch {
    // Swallow write errors — worst outcome is losing the order on next open,
    // which is acceptable. Do not surface to the UI.
  }
}

export async function clearClientOrder(
  routeId: number | null,
  date: string,
): Promise<void> {
  if (!canUseLocalDb) return;
  try {
    await Storage.removeItem(storageKey(routeId, date));
  } catch {
    // Ignore
  }
}

/**
 * Reorders `clientes` to match the saved `order` (array of partnerIds).
 * Clients absent from `order` (e.g. added to the route after saving) are
 * appended at the end in their original relative position.
 */
export function applyClientOrder<T extends { partnerId: number }>(
  clientes: T[],
  order: number[] | null,
): T[] {
  if (!order || order.length === 0) return clientes;

  const orderIndex = new Map(order.map((id, i) => [id, i]));
  const originalIndex = new Map(clientes.map((c, i) => [c.partnerId, i]));

  return [...clientes].sort((a, b) => {
    const ia = orderIndex.get(a.partnerId) ?? Infinity;
    const ib = orderIndex.get(b.partnerId) ?? Infinity;
    if (ia !== ib) return ia - ib;
    // Preserve original relative order for unranked clients.
    return (originalIndex.get(a.partnerId) ?? 0) - (originalIndex.get(b.partnerId) ?? 0);
  });
}
