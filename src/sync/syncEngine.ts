/**
 * The drain side of the outbox: replay queued mutations against the backend,
 * in order, and record the outcome.
 *
 * Design notes:
 * - **FIFO, one pass per call.** `runSync()` walks `pending` + `failed` items
 *   oldest-first. Call it again to make another pass.
 * - **Stops on the first transport error.** A network drop / 5xx aborts the
 *   run and leaves the rest `pending` — no point hammering a dead link. A 4xx
 *   "business" rejection only fails that one item; the run continues.
 * - **Dependencies.** An item with `dependsOn` is skipped until its
 *   `crear_cliente` dependency is `done`; right after that alta syncs we
 *   rewrite every dependent's negative `partnerId` to the real one
 *   (`outbox.remapTempPartnerId`).
 * - **404 = "backend not ready".** `insa_reparto` doesn't expose these write
 *   endpoints yet. A 404 is treated as *not an error*: the item stays
 *   `pending` (no attempt burned) and the run stops. Flip
 *   `TREAT_404_AS_PENDING` once the endpoints exist.
 */
import { RepartoApiError, repartoApiClient } from '@/api/repartoApiClient';
import { canUseLocalDb } from '@/db/database';
import * as outbox from '@/db/outbox';
import { getIsOnline } from './connectivity';
import type { OutboxItem } from './types';
import type {
  AgregarClienteARutaPayload,
  CrearClientePayload,
  CrearGastoRepartoPayload,
  QuitarClienteDeRutaPayload,
  RegistrarVisitaPayload,
  ReordenarClientesPayload,
  SaveControlPlayaPayload,
} from './types';

const TREAT_404_AS_PENDING = true;

export interface SyncRunResult {
  ran: boolean;
  /** Why the run didn't do anything, when `ran` is false. */
  reason?: 'offline' | 'already-running' | 'no-session' | 'unavailable' | 'empty';
  synced: number;
  failed: number;
  /** Deferred this pass (dependency not ready, or backend not ready). */
  skipped: number;
  /** Still `pending`/`failed` after the run. */
  remaining: number;
}

const EMPTY: SyncRunResult = { ran: false, synced: 0, failed: 0, skipped: 0, remaining: 0 };

let running = false;

/** True while a run is in progress — the UI disables the button on this. */
export function isSyncing(): boolean {
  return running;
}

/**
 * Make one pass over the outbox for the currently authenticated route.
 * Safe to call concurrently — overlapping calls no-op with
 * `reason: 'already-running'`.
 */
export async function runSync(opts: { checkOnline?: boolean } = {}): Promise<SyncRunResult> {
  const { checkOnline = true } = opts;

  if (!canUseLocalDb) return { ...EMPTY, reason: 'unavailable' };
  if (running) return { ...EMPTY, reason: 'already-running' };

  const session = repartoApiClient.getSession();
  if (!session) return { ...EMPTY, reason: 'no-session' };

  if (checkOnline && !(await getIsOnline())) {
    return { ...EMPTY, reason: 'offline' };
  }

  running = true;
  try {
    await outbox.resetStuckSyncing();

    const queue = (await outbox.listByStatus('pending', 'failed')).filter(
      (item) => item.routeId === session.routeId,
    );
    if (queue.length === 0) return { ...EMPTY, ran: true, reason: 'empty' };

    let synced = 0;
    let failed = 0;
    let skipped = 0;

    for (const item of queue) {
      if (item.dependsOn) {
        const dep = await outbox.getById(item.dependsOn);
        if (!dep) {
          // Dependency vanished (discarded) — unblock and let it try on its own.
          await outbox.update(item.id, { dependsOn: null });
        } else if (dep.status !== 'done') {
          skipped++;
          continue;
        }
      }

      // Re-read: a dependency that just synced in this same pass may have
      // rewritten this item's payload (temp partnerId -> real id).
      const fresh = (await outbox.getById(item.id)) ?? item;

      await outbox.update(fresh.id, { status: 'syncing' });

      try {
        const outcome = await replay(fresh);

        await outbox.update(fresh.id, {
          status: 'done',
          syncedAt: new Date().toISOString(),
          lastError: null,
        });
        synced++;

        if (fresh.type === 'crear_cliente' && fresh.tempPartnerId != null && outcome?.partnerId != null) {
          await outbox.remapTempPartnerId(fresh.tempPartnerId, outcome.partnerId);
        }
      } catch (err) {
        if (TREAT_404_AS_PENDING && err instanceof RepartoApiError && err.status === 404) {
          await outbox.update(fresh.id, {
            status: 'pending',
            lastError: 'El servidor todavía no acepta esta operación.',
          });
          skipped++;
          break;
        }

        const transient = isTransient(err);
        await outbox.update(fresh.id, {
          status: 'failed',
          attempts: fresh.attempts + 1,
          lastError: humanError(err),
        });
        failed++;
        if (transient) break;
      }
    }

    const remaining = (await outbox.listByStatus('pending', 'failed')).filter(
      (i) => i.routeId === session.routeId,
    ).length;

    return { ran: true, synced, failed, skipped, remaining };
  } finally {
    running = false;
  }
}

/** Re-invoke the matching `repartoApiClient` method with the stored payload. */
async function replay(item: OutboxItem): Promise<{ partnerId?: number } | void> {
  switch (item.type) {
    case 'registrar_visita': {
      const p = item.payload as RegistrarVisitaPayload;
      if (p.partnerId < 0) {
        // Dependency ordering should have prevented this; guard anyway.
        throw new Error('El alta del cliente todavía no se sincronizó.');
      }
      await repartoApiClient.registrarVisita(p);
      return;
    }
    case 'save_control_playa': {
      const p = item.payload as SaveControlPlayaPayload;
      await repartoApiClient.saveControlPlaya(p.date, p.tipo, p.kilometros, p.lineas);
      return;
    }
    case 'crear_cliente': {
      const p = item.payload as CrearClientePayload;
      const cliente = await repartoApiClient.crearCliente(p);
      return { partnerId: cliente.partnerId };
    }
    case 'crear_gasto_reparto': {
      const p = item.payload as CrearGastoRepartoPayload;
      await repartoApiClient.crearGastoDeReparto(p);
      return;
    }
    case 'reordenar_clientes': {
      const p = item.payload as ReordenarClientesPayload;
      await repartoApiClient.reordenarClientes(p.date, p.partnerIds);
      return;
    }
    case 'agregar_cliente_a_ruta': {
      const p = item.payload as AgregarClienteARutaPayload;
      if (p.partnerId < 0) {
        throw new Error('El alta del cliente todavía no se sincronizó.');
      }
      await repartoApiClient.agregarClienteARuta(p.date, p.partnerId);
      return;
    }
    case 'quitar_cliente_de_ruta': {
      const p = item.payload as QuitarClienteDeRutaPayload;
      await repartoApiClient.quitarClienteDeRuta(p.date, p.partnerId);
      return;
    }
  }
}

/** Network failure or server error → retry later. 4xx → the request itself is
 * wrong, retrying won't help (except 408/429). */
function isTransient(err: unknown): boolean {
  if (err instanceof RepartoApiError) {
    return err.status === 0 || err.status === 408 || err.status === 429 || err.status >= 500;
  }
  // fetch() rejects with a plain TypeError when the network is unreachable.
  return true;
}

function humanError(err: unknown): string {
  if (err instanceof RepartoApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Error desconocido al sincronizar.';
}

/** Backoff for the auto-retry timer in SyncProvider: 1m, 2m, 4m … capped 15m. */
export function nextRetryDelayMs(attempts: number): number {
  const base = 60_000;
  return Math.min(base * 2 ** Math.max(0, attempts - 1), 15 * 60_000);
}
