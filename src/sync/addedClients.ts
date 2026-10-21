/**
 * Persists clients manually added to the day's route sheet by the repartidor.
 *
 * When a client is found outside the current route via search, the repartidor
 * can choose to add them to their route for today. These added clients are
 * persisted locally per routeId + deliveryDate so they remain visible across
 * app reloads and tabs even if the server dayroute is in 'borrador' or offline.
 */
import Storage from 'expo-sqlite/kv-store';
import { canUseLocalDb } from '@/db/database';
import * as localRouteStore from '@/db/localRouteStore';
import type { ClienteVisita } from '@/api/types';

function storageKey(routeId: number | null, date: string): string {
  return `insa_reparto:added_clients:${routeId ?? 'none'}:${date}`;
}

export async function getAddedClients(
  routeId: number | null,
  date: string,
): Promise<ClienteVisita[]> {
  if (!canUseLocalDb) return [];
  try {
    const raw = await Storage.getItem(storageKey(routeId, date));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as ClienteVisita[];
  } catch {
    return [];
  }
}

export async function addClientToDayroute(
  routeId: number | null,
  date: string,
  cliente: ClienteVisita,
): Promise<ClienteVisita[]> {
  if (routeId != null) {
    await localRouteStore.markClientAddedLocally(routeId, date, cliente);
  }
  if (!canUseLocalDb) return [cliente];
  try {
    const current = await getAddedClients(routeId, date);
    const key = `${cliente.nombre.trim().toLowerCase()}|${cliente.direccion.trim().toLowerCase()}`;
    const exists = current.some(
      (c) =>
        c.partnerId === cliente.partnerId ||
        `${c.nombre.trim().toLowerCase()}|${c.direccion.trim().toLowerCase()}` === key,
    );
    const updated = exists
      ? current.map((c) =>
          c.partnerId === cliente.partnerId ||
          `${c.nombre.trim().toLowerCase()}|${c.direccion.trim().toLowerCase()}` === key
            ? cliente
            : c,
        )
      : [...current, cliente];
    await Storage.setItem(storageKey(routeId, date), JSON.stringify(updated));
    return updated;
  } catch {
    return [cliente];
  }
}

export async function removeAddedClientFromDayroute(
  routeId: number | null,
  date: string,
  partnerId: number,
): Promise<ClienteVisita[]> {
  if (routeId != null) {
    await localRouteStore.markClientRemovedLocally(routeId, date, partnerId);
  }
  if (!canUseLocalDb) return [];
  try {
    const current = await getAddedClients(routeId, date);
    const updated = current.filter((c) => c.partnerId !== partnerId);
    await Storage.setItem(storageKey(routeId, date), JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export async function clearAddedClients(
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
