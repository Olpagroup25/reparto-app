/**
 * Local SQLite database — the backing store for the offline-first sync layer.
 *
 * Holds the `outbox` table (queued writes; see src/db/outbox.ts and
 * src/sync/). Read caching for offline use is handled separately by TanStack
 * Query's persister (src/sync/queryPersister.ts), not here.
 *
 * Web has no usable SQLite without extra wasm/CDN setup, and the web target is
 * a compile smoke-test only (see README) — so, exactly like
 * repartoApiClient's `canPersist`, every DB call is a no-op / guarded on web.
 * Screens must check `canUseLocalDb` before relying on queued state.
 */
import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

export const canUseLocalDb = Platform.OS !== 'web';

const DB_NAME = 'insa_reparto.db';

/**
 * Ordered schema migrations. Index `i` moves the DB from `user_version === i`
 * to `user_version === i + 1`. Never edit or reorder an existing entry once it
 * has shipped — only append.
 */
const MIGRATIONS: Array<(db: SQLite.SQLiteDatabase) => Promise<void>> = [
  // v0 -> v1 : the outbox
  async (db) => {
    await db.execAsync(`
      CREATE TABLE outbox (
        id              TEXT PRIMARY KEY NOT NULL,
        type            TEXT NOT NULL,
        payload         TEXT NOT NULL,
        status          TEXT NOT NULL DEFAULT 'pending',
        attempts        INTEGER NOT NULL DEFAULT 0,
        last_error      TEXT,
        route_id        INTEGER NOT NULL,
        login           TEXT NOT NULL,
        depends_on      TEXT,
        temp_partner_id INTEGER,
        created_at      TEXT NOT NULL,
        synced_at       TEXT
      );
      CREATE INDEX idx_outbox_status ON outbox (status);
      CREATE INDEX idx_outbox_created ON outbox (created_at);
      CREATE INDEX idx_outbox_temp_partner ON outbox (temp_partner_id);
    `);
  },

  // v1 -> v2 : local client marks (Repaso / Srv Tec).
  // The backend's hoja-de-ruta endpoint has no field to distinguish these
  // buckets yet, so the repartidor's "marcar para repaso / servicio técnico"
  // decisions live here until it does. Keyed by route + delivery date so a
  // mark doesn't bleed across days.
  async (db) => {
    await db.execAsync(`
      CREATE TABLE client_marks (
        route_id      INTEGER NOT NULL,
        delivery_date TEXT NOT NULL,
        partner_id    INTEGER NOT NULL,
        mark          TEXT NOT NULL,
        note          TEXT,
        created_at    TEXT NOT NULL,
        PRIMARY KEY (route_id, delivery_date, partner_id, mark)
      );
      CREATE INDEX idx_client_marks_lookup ON client_marks (route_id, delivery_date);
    `);
  },

  // v2 -> v3 : local_dayroutes (mirror of Odoo hoja de ruta) and local_removed_clients
  async (db) => {
    await db.execAsync(`
      CREATE TABLE local_dayroutes (
        route_id        INTEGER NOT NULL,
        delivery_date   TEXT NOT NULL,
        hoja_ruta_json  TEXT,
        clientes_json   TEXT NOT NULL,
        fuc_umbral_saldo REAL NOT NULL DEFAULT 30000,
        updated_at      TEXT NOT NULL,
        PRIMARY KEY (route_id, delivery_date)
      );
      CREATE TABLE local_removed_clients (
        route_id        INTEGER NOT NULL,
        delivery_date   TEXT NOT NULL,
        partner_id      INTEGER NOT NULL,
        removed_at      TEXT NOT NULL,
        PRIMARY KEY (route_id, delivery_date, partner_id)
      );
      CREATE INDEX idx_local_dayroutes_lookup ON local_dayroutes (route_id, delivery_date);
      CREATE INDEX idx_local_removed_lookup ON local_removed_clients (route_id, delivery_date);
    `);
  },
];

export const SCHEMA_VERSION = MIGRATIONS.length;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Opens (once, memoized) the local database, applying any pending migrations.
 * Throws on web — guard with `canUseLocalDb` first.
 */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!canUseLocalDb) {
    return Promise.reject(new Error('Local DB is unavailable on web (see src/db/database.ts).'));
  }
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync('PRAGMA journal_mode = WAL;');
      await runMigrations(db);
      return db;
    })().catch((err) => {
      // Don't cache a failed open — let the next caller retry.
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
}

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;

  for (let i = current; i < MIGRATIONS.length; i++) {
    await db.withTransactionAsync(async () => {
      await MIGRATIONS[i](db);
      // PRAGMA can't be parameterized; i is a loop int, not user input.
      await db.execAsync(`PRAGMA user_version = ${i + 1};`);
    });
  }
}

/**
 * Test/debug helper — drops every row from the outbox. Not wired to any UI on
 * purpose; call it from a dev console or a throwaway button.
 */
export async function wipeLocalDb(): Promise<void> {
  if (!canUseLocalDb) return;
  const db = await getDb();
  await db.execAsync('DELETE FROM outbox; DELETE FROM client_marks;');
}
