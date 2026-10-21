/**
 * Data-access layer for the local `outbox` table — the queue of writes made
 * offline, waiting to be replayed against the backend.
 *
 * Everything here works in camelCase `OutboxItem`s (src/sync/types.ts); the
 * snake_case columns and the JSON-encoded `payload` never leak past this file.
 * Higher layers: src/sync/queuedWrites.ts (enqueue side),
 * src/sync/syncEngine.ts (drain side).
 */
import { getDb } from './database';
import type {
  MutationType,
  NewOutboxItem,
  OutboxItem,
  SyncStatus,
} from '@/sync/types';

/** Local, collision-safe-enough id for a queued item (no `uuid` dep needed —
 * these are generated at human speed, one per user action). */
export function newOutboxId(): string {
  return `obx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

interface OutboxRow {
  id: string;
  type: string;
  payload: string;
  status: string;
  attempts: number;
  last_error: string | null;
  route_id: number;
  login: string;
  depends_on: string | null;
  temp_partner_id: number | null;
  created_at: string;
  synced_at: string | null;
}

function rowToItem(row: OutboxRow): OutboxItem {
  return {
    id: row.id,
    type: row.type as MutationType,
    payload: JSON.parse(row.payload),
    status: row.status as SyncStatus,
    attempts: row.attempts,
    lastError: row.last_error,
    routeId: row.route_id,
    login: row.login,
    dependsOn: row.depends_on,
    tempPartnerId: row.temp_partner_id,
    createdAt: row.created_at,
    syncedAt: row.synced_at,
  };
}

/** Appends a new mutation to the queue and returns the stored row. */
export async function enqueue(input: NewOutboxItem): Promise<OutboxItem> {
  const db = await getDb();
  const item: OutboxItem = {
    id: newOutboxId(),
    type: input.type,
    payload: input.payload,
    status: 'pending',
    attempts: 0,
    lastError: null,
    routeId: input.routeId,
    login: input.login,
    dependsOn: input.dependsOn ?? null,
    tempPartnerId: input.tempPartnerId ?? null,
    createdAt: new Date().toISOString(),
    syncedAt: null,
  };

  await db.runAsync(
    `INSERT INTO outbox
       (id, type, payload, status, attempts, last_error, route_id, login, depends_on, temp_partner_id, created_at, synced_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item.id,
      item.type,
      JSON.stringify(item.payload),
      item.status,
      item.attempts,
      item.lastError,
      item.routeId,
      item.login,
      item.dependsOn,
      item.tempPartnerId,
      item.createdAt,
      item.syncedAt,
    ],
  );

  return item;
}

/** All queued items, oldest first (FIFO replay order). */
export async function listAll(): Promise<OutboxItem[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<OutboxRow>('SELECT * FROM outbox ORDER BY created_at ASC');
  return rows.map(rowToItem);
}

/** Queued items in any of the given statuses, oldest first. */
export async function listByStatus(...statuses: SyncStatus[]): Promise<OutboxItem[]> {
  if (statuses.length === 0) return [];
  const db = await getDb();
  const placeholders = statuses.map(() => '?').join(', ');
  const rows = await db.getAllAsync<OutboxRow>(
    `SELECT * FROM outbox WHERE status IN (${placeholders}) ORDER BY created_at ASC`,
    statuses,
  );
  return rows.map(rowToItem);
}

/** Items belonging to a specific route/session, oldest first. */
export async function listByRoute(routeId: number): Promise<OutboxItem[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<OutboxRow>(
    'SELECT * FROM outbox WHERE route_id = ? ORDER BY created_at ASC',
    [routeId],
  );
  return rows.map(rowToItem);
}

export async function getById(id: string): Promise<OutboxItem | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<OutboxRow>('SELECT * FROM outbox WHERE id = ?', [id]);
  return row ? rowToItem(row) : null;
}

/** The `crear_cliente` item that was assigned this negative local id, if any. */
export async function findByTempPartnerId(tempPartnerId: number): Promise<OutboxItem | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<OutboxRow>(
    'SELECT * FROM outbox WHERE temp_partner_id = ? LIMIT 1',
    [tempPartnerId],
  );
  return row ? rowToItem(row) : null;
}

type Patchable = Partial<
  Pick<OutboxItem, 'payload' | 'status' | 'attempts' | 'lastError' | 'dependsOn' | 'syncedAt'>
>;

const COLUMN: Record<keyof Patchable, string> = {
  payload: 'payload',
  status: 'status',
  attempts: 'attempts',
  lastError: 'last_error',
  dependsOn: 'depends_on',
  syncedAt: 'synced_at',
};

/** Partial update by id. `payload` is re-serialized automatically. */
export async function update(id: string, patch: Patchable): Promise<void> {
  const keys = Object.keys(patch) as Array<keyof Patchable>;
  if (keys.length === 0) return;

  const db = await getDb();
  const sets = keys.map((k) => `${COLUMN[k]} = ?`).join(', ');
  const values = keys.map((k) => {
    const v = patch[k];
    return k === 'payload' ? JSON.stringify(v) : (v as string | number | null);
  });

  await db.runAsync(`UPDATE outbox SET ${sets} WHERE id = ?`, [...values, id]);
}

/** Rewrites `payload.partnerId` on every pending/failed item that still points
 * at a temp id, once the real `partner_id` is known. Returns the ids touched. */
export async function remapTempPartnerId(tempId: number, realId: number): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<OutboxRow>(
    `SELECT * FROM outbox WHERE status IN ('pending', 'failed')`,
  );
  const touched: string[] = [];

  for (const row of rows) {
    const payload = JSON.parse(row.payload) as { partnerId?: number };
    if (payload.partnerId === tempId) {
      payload.partnerId = realId;
      await db.runAsync('UPDATE outbox SET payload = ?, depends_on = NULL WHERE id = ?', [
        JSON.stringify(payload),
        row.id,
      ]);
      touched.push(row.id);
    }
  }

  return touched;
}

export async function remove(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM outbox WHERE id = ?', [id]);
}

/** Purges items that synced before `before` (default: all `done`). Returns the
 * count removed. Keeps recently-synced rows so the Sync tab can still show a
 * "sincronizados hoy" figure. */
export async function purgeDone(before?: Date): Promise<number> {
  const db = await getDb();
  const result = before
    ? await db.runAsync(`DELETE FROM outbox WHERE status = 'done' AND synced_at < ?`, [
        before.toISOString(),
      ])
    : await db.runAsync(`DELETE FROM outbox WHERE status = 'done'`);
  return result.changes;
}

/** `{ pending, syncing, failed, done }` counts in one query. */
export async function countByStatus(): Promise<Record<SyncStatus, number>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ status: string; n: number }>(
    'SELECT status, COUNT(*) AS n FROM outbox GROUP BY status',
  );
  const counts: Record<SyncStatus, number> = { pending: 0, syncing: 0, failed: 0, done: 0 };
  for (const r of rows) counts[r.status as SyncStatus] = r.n;
  return counts;
}

/**
 * On app start any `syncing` row is a leftover from a run that was killed
 * mid-flight — move it back so it gets picked up again.
 */
export async function resetStuckSyncing(): Promise<void> {
  const db = await getDb();
  await db.runAsync(`UPDATE outbox SET status = 'pending' WHERE status = 'syncing'`);
}
