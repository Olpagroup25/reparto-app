/**
 * Local "this client goes in Repaso / Srv Tec" marks.
 *
 * `GET /insa/api/hoja-de-ruta` returns `resultado` ('ausente' | 'sin_gestion')
 * but nothing that says "the repartidor rescheduled this one" or "this one
 * needs a dispenser service call at the office". Until the backend models
 * those, the repartidor's choices are persisted here and merged with the
 * server data when building the tab lists (see HojaDeRutaScreen).
 *
 * Scoped by route + delivery date so a mark made on one day's sheet doesn't
 * show up on another's. No-ops on web (`canUseLocalDb`).
 */
import { canUseLocalDb, getDb } from './database';

export type ClientMark = 'repaso' | 'srv_tec';

export interface ClientMarkRow {
  routeId: number;
  deliveryDate: string;
  partnerId: number;
  mark: ClientMark;
  note: string | null;
  createdAt: string;
}

interface RawRow {
  route_id: number;
  delivery_date: string;
  partner_id: number;
  mark: string;
  note: string | null;
  created_at: string;
}

function toRow(r: RawRow): ClientMarkRow {
  return {
    routeId: r.route_id,
    deliveryDate: r.delivery_date,
    partnerId: r.partner_id,
    mark: r.mark as ClientMark,
    note: r.note,
    createdAt: r.created_at,
  };
}

/** Every mark for one route + date, newest first. */
export async function listMarks(routeId: number, deliveryDate: string): Promise<ClientMarkRow[]> {
  if (!canUseLocalDb) return [];
  const db = await getDb();
  const rows = await db.getAllAsync<RawRow>(
    'SELECT * FROM client_marks WHERE route_id = ? AND delivery_date = ? ORDER BY created_at DESC',
    [routeId, deliveryDate],
  );
  return rows.map(toRow);
}

export async function addMark(
  routeId: number,
  deliveryDate: string,
  partnerId: number,
  mark: ClientMark,
  note?: string,
): Promise<void> {
  if (!canUseLocalDb) return;
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO client_marks
       (route_id, delivery_date, partner_id, mark, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [routeId, deliveryDate, partnerId, mark, note ?? null, new Date().toISOString()],
  );
}

export async function removeMark(
  routeId: number,
  deliveryDate: string,
  partnerId: number,
  mark: ClientMark,
): Promise<void> {
  if (!canUseLocalDb) return;
  const db = await getDb();
  await db.runAsync(
    'DELETE FROM client_marks WHERE route_id = ? AND delivery_date = ? AND partner_id = ? AND mark = ?',
    [routeId, deliveryDate, partnerId, mark],
  );
}

export async function clearMarksForDate(
  routeId: number,
  deliveryDate: string,
): Promise<void> {
  if (!canUseLocalDb) return;
  const db = await getDb();
  await db.runAsync(
    'DELETE FROM client_marks WHERE route_id = ? AND delivery_date = ?',
    [routeId, deliveryDate],
  );
}
