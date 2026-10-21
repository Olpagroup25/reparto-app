/**
 * Local SQLite store for mirroring Odoo's Hoja de Ruta (fsm.route.dayroute).
 *
 * Keeps an exact offline-accessible mirror of the server sheet, and applies
 * offline additions, removals, and visits immediately so the UI responds
 * seamlessly whether online or offline.
 */
import { canUseLocalDb, getDb } from './database';
import * as outbox from './outbox';
import type {
  ClienteVisita,
  HojaDeRutaHeader,
  HojaDeRutaResponse,
} from '@/api/types';
import type { RegistrarVisitaPayload } from '@/sync/types';

interface LocalDayrouteRow {
  route_id: number;
  delivery_date: string;
  hoja_ruta_json: string | null;
  clientes_json: string;
  fuc_umbral_saldo: number;
  updated_at: string;
}

interface LocalRemovedRow {
  partner_id: number;
}

/**
 * Persists the latest full sheet returned by Odoo.sh into SQLite.
 */
export async function saveLocalDayroute(
  routeId: number,
  deliveryDate: string,
  data: HojaDeRutaResponse,
): Promise<void> {
  if (!canUseLocalDb) return;
  const db = await getDb();
  const now = new Date().toISOString();
  const hojaRutaJson = data.hojaRuta ? JSON.stringify(data.hojaRuta) : null;
  const clientesJson = JSON.stringify(data.clientes ?? []);
  const fucUmbral = data.fucUmbralSaldo ?? 30000;

  await db.runAsync(
    `INSERT INTO local_dayroutes (route_id, delivery_date, hoja_ruta_json, clientes_json, fuc_umbral_saldo, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(route_id, delivery_date) DO UPDATE SET
       hoja_ruta_json = excluded.hoja_ruta_json,
       clientes_json = excluded.clientes_json,
       fuc_umbral_saldo = excluded.fuc_umbral_saldo,
       updated_at = excluded.updated_at`,
    [routeId, deliveryDate, hojaRutaJson, clientesJson, fucUmbral, now],
  );

  // If any client previously marked removed is no longer in Odoo's response, clean up the tombstone
  const serverIds = new Set((data.clientes ?? []).map((c) => c.partnerId));
  const removedRows = await db.getAllAsync<LocalRemovedRow>(
    `SELECT partner_id FROM local_removed_clients WHERE route_id = ? AND delivery_date = ?`,
    [routeId, deliveryDate],
  );
  for (const row of removedRows) {
    if (!serverIds.has(row.partner_id)) {
      await db.runAsync(
        `DELETE FROM local_removed_clients WHERE route_id = ? AND delivery_date = ? AND partner_id = ?`,
        [routeId, deliveryDate, row.partner_id],
      );
    }
  }
}

/**
 * Retrieves the local mirrored Hoja de Ruta, merging any offline operations
 * (removals, local additions, pending visits).
 */
export async function getLocalDayroute(
  routeId: number,
  deliveryDate: string,
): Promise<HojaDeRutaResponse | null> {
  if (!canUseLocalDb) return null;
  const db = await getDb();

  const row = await db.getFirstAsync<LocalDayrouteRow>(
    `SELECT * FROM local_dayroutes WHERE route_id = ? AND delivery_date = ?`,
    [routeId, deliveryDate],
  );
  if (!row) return null;

  let hojaRuta: HojaDeRutaHeader | null = null;
  if (row.hoja_ruta_json) {
    try {
      hojaRuta = JSON.parse(row.hoja_ruta_json);
    } catch {
      hojaRuta = null;
    }
  }

  let clientes: ClienteVisita[] = [];
  try {
    clientes = JSON.parse(row.clientes_json);
    if (!Array.isArray(clientes)) clientes = [];
  } catch {
    clientes = [];
  }

  // Filter out any locally removed clients
  const removedRows = await db.getAllAsync<LocalRemovedRow>(
    `SELECT partner_id FROM local_removed_clients WHERE route_id = ? AND delivery_date = ?`,
    [routeId, deliveryDate],
  );
  const removedIds = new Set(removedRows.map((r) => r.partner_id));
  let mergedClientes = clientes.filter((c) => !removedIds.has(c.partnerId));

  // Overlay any pending offline visit registrations from outbox
  try {
    const pendingItems = await outbox.listByStatus('pending', 'failed', 'syncing');
    for (const item of pendingItems) {
      if (item.routeId === routeId && item.type === 'registrar_visita') {
        const payload = item.payload as RegistrarVisitaPayload;
        if (payload.date === deliveryDate) {
          mergedClientes = mergedClientes.map((c) => {
            if (c.partnerId === payload.partnerId) {
              return {
                ...c,
                visitado: true,
                resultado: payload.resultado ?? null,
                cobroEfectivo: payload.cobroEfectivo ?? c.cobroEfectivo,
                medioPago: payload.medioPago ?? c.medioPago,
                referenciaPago: payload.referenciaPago ?? c.referenciaPago,
                iconosVisita: c.iconosVisita || '✔️',
              };
            }
            return c;
          });
        }
      }
    }
  } catch {
    // Non-fatal
  }

  return {
    hojaRuta,
    clientes: mergedClientes,
    fucUmbralSaldo: row.fuc_umbral_saldo ?? 30000,
  };
}

/**
 * Marks a client as removed locally (offline and online).
 * Records the removal tombstone and updates the mirrored clients list.
 */
export async function markClientRemovedLocally(
  routeId: number,
  deliveryDate: string,
  partnerId: number,
): Promise<void> {
  if (!canUseLocalDb) return;
  const db = await getDb();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO local_removed_clients (route_id, delivery_date, partner_id, removed_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(route_id, delivery_date, partner_id) DO UPDATE SET removed_at = excluded.removed_at`,
    [routeId, deliveryDate, partnerId, now],
  );

  const row = await db.getFirstAsync<LocalDayrouteRow>(
    `SELECT * FROM local_dayroutes WHERE route_id = ? AND delivery_date = ?`,
    [routeId, deliveryDate],
  );
  if (row) {
    try {
      const current: ClienteVisita[] = JSON.parse(row.clientes_json);
      const filtered = current.filter((c) => c.partnerId !== partnerId);
      await db.runAsync(
        `UPDATE local_dayroutes SET clientes_json = ?, updated_at = ? WHERE route_id = ? AND delivery_date = ?`,
        [JSON.stringify(filtered), now, routeId, deliveryDate],
      );
    } catch {
      // Ignore
    }
  }
}

/**
 * Adds or updates a client in the local mirrored dayroute.
 */
export async function markClientAddedLocally(
  routeId: number,
  deliveryDate: string,
  cliente: ClienteVisita,
): Promise<void> {
  if (!canUseLocalDb) return;
  const db = await getDb();
  const now = new Date().toISOString();

  // If it was previously marked removed, clear the tombstone
  await db.runAsync(
    `DELETE FROM local_removed_clients WHERE route_id = ? AND delivery_date = ? AND partner_id = ?`,
    [routeId, deliveryDate, cliente.partnerId],
  );

  const row = await db.getFirstAsync<LocalDayrouteRow>(
    `SELECT * FROM local_dayroutes WHERE route_id = ? AND delivery_date = ?`,
    [routeId, deliveryDate],
  );

  let current: ClienteVisita[] = [];
  let hojaRutaJson: string | null = null;
  let fucUmbral = 30000;

  if (row) {
    hojaRutaJson = row.hoja_ruta_json;
    fucUmbral = row.fuc_umbral_saldo;
    try {
      current = JSON.parse(row.clientes_json);
    } catch {
      current = [];
    }
  } else {
    hojaRutaJson = JSON.stringify({
      id: 0,
      date: deliveryDate,
      state: 'borrador',
      numeroReparto: 0,
    });
  }

  const existingIdx = current.findIndex((c) => c.partnerId === cliente.partnerId);
  if (existingIdx >= 0) {
    current[existingIdx] = cliente;
  } else {
    current.push(cliente);
  }

  await db.runAsync(
    `INSERT INTO local_dayroutes (route_id, delivery_date, hoja_ruta_json, clientes_json, fuc_umbral_saldo, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(route_id, delivery_date) DO UPDATE SET
       hoja_ruta_json = excluded.hoja_ruta_json,
       clientes_json = excluded.clientes_json,
       fuc_umbral_saldo = excluded.fuc_umbral_saldo,
       updated_at = excluded.updated_at`,
    [routeId, deliveryDate, hojaRutaJson, JSON.stringify(current), fucUmbral, now],
  );
}

/**
 * Updates a client's status in the local mirror when a visit is registered offline.
 */
export async function applyLocalVisit(
  routeId: number,
  deliveryDate: string,
  payload: RegistrarVisitaPayload,
): Promise<void> {
  if (!canUseLocalDb) return;
  const db = await getDb();
  const now = new Date().toISOString();

  const row = await db.getFirstAsync<LocalDayrouteRow>(
    `SELECT * FROM local_dayroutes WHERE route_id = ? AND delivery_date = ?`,
    [routeId, deliveryDate],
  );
  if (!row) return;

  try {
    const current: ClienteVisita[] = JSON.parse(row.clientes_json);
    const updated = current.map((c) => {
      if (c.partnerId === payload.partnerId) {
        return {
          ...c,
          visitado: true,
          resultado: payload.resultado ?? null,
          cobroEfectivo: payload.cobroEfectivo ?? c.cobroEfectivo,
          medioPago: payload.medioPago ?? c.medioPago,
          referenciaPago: payload.referenciaPago ?? c.referenciaPago,
          iconosVisita: c.iconosVisita ? c.iconosVisita : '✔️',
        };
      }
      return c;
    });

    await db.runAsync(
      `UPDATE local_dayroutes SET clientes_json = ?, updated_at = ? WHERE route_id = ? AND delivery_date = ?`,
      [JSON.stringify(updated), now, routeId, deliveryDate],
    );
  } catch {
    // Ignore
  }
}

/**
 * Clears local SQLite records for a closed day's route to free device storage.
 */
export async function clearLocalDayroute(
  routeId: number,
  deliveryDate: string,
): Promise<void> {
  if (!canUseLocalDb) return;
  const db = await getDb();
  await db.runAsync(
    `DELETE FROM local_dayroutes WHERE route_id = ? AND delivery_date = ?`,
    [routeId, deliveryDate],
  );
  await db.runAsync(
    `DELETE FROM local_removed_clients WHERE route_id = ? AND delivery_date = ?`,
    [routeId, deliveryDate],
  );
}
