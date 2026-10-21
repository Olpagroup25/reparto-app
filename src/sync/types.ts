/**
 * Offline-first sync layer — shared types.
 *
 * The app queues every write the repartidor makes while offline into a local
 * SQLite "outbox" (see src/db/outbox.ts) and replays it against the backend
 * from the Sync tab once the connection is back (see src/sync/syncEngine.ts).
 *
 * Each payload shape below mirrors, 1:1, the arguments of the matching
 * `repartoApiClient` method — the sync engine literally re-invokes that method
 * with `JSON.parse(row.payload)`, so these must stay in sync with
 * src/api/repartoApiClient.ts.
 */

/** The write operations that can be generated offline. `aprobar_control_playa`
 * is deliberately NOT here: it's a synchronous second-factor check against a
 * real Odoo user's credentials and makes no sense to defer. */
export type MutationType =
  | 'registrar_visita'
  | 'save_control_playa'
  | 'crear_cliente'
  | 'crear_gasto_reparto'
  | 'reordenar_clientes'
  | 'agregar_cliente_a_ruta'
  | 'quitar_cliente_de_ruta';

/** Lifecycle of a single queued mutation.
 * - `pending`  waiting for a sync run
 * - `syncing`  currently being replayed (transient; reset to `pending`/`failed` on app restart)
 * - `failed`   last replay attempt failed — retried automatically, or manually from the Sync tab
 * - `done`     accepted by the backend; kept briefly for the "sincronizados hoy" counter, then purged
 */
export type SyncStatus = 'pending' | 'syncing' | 'failed' | 'done';

/** Args of `repartoApiClient.registrarVisita`. */
export interface RegistrarVisitaPayload {
  date: string;
  /** A negative value is a local temp id from an offline `crear_cliente` (see
   * `Outbox.tempPartnerId`) — the sync engine rewrites it to the real
   * `partner_id` once that alta syncs. */
  partnerId: number;
  /** C-26: 'repaso' = fui y no estaba pero me dijo que volviera más tarde. */
  resultado?: 'ausente' | 'sin_gestion' | 'repaso';
  visitado?: boolean;
  cobroEfectivo?: number;
  /** C-04: solo 'efectivo' entra en la liquidación de caja. Default 'efectivo'. */
  medioPago?: 'efectivo' | 'cheque' | 'transferencia' | 'sin_transaccion';
  referenciaPago?: string;
  lineasArticulo?: Array<{
    productId: number;
    tipo: 'venta' | 'devolucion';
    cantidad: number;
    precioUnitario: number;
    /** C-06: requerido cuando tipo='devolucion'. */
    motivo?: 'pinchado' | 'hinchado' | 'calidad' | 'otro';
    /** C-06: se entrega uno nuevo en el acto. Default true en el backend. */
    cambioDirecto?: boolean;
  }>;
  lineasEnvase?: Array<{ productId: number; tipo: 'prestamo' | 'devolucion'; cantidad: number }>;
}

/** Args of `repartoApiClient.saveControlPlaya`, flattened into one object.
 * C-05: `cantidadFallada` es el tercer conteo (Fallados) — en salida siempre 0. */
export interface SaveControlPlayaPayload {
  date: string;
  tipo: 'salida' | 'entrada';
  kilometros: number;
  lineas: Array<{
    productId: number;
    cantidad: number;
    cantidadVacia: number;
    /** C-05: Fallados. En salida siempre 0; en entrada, producto no conforme. */
    cantidadFallada: number;
  }>;
}

/** Args of `repartoApiClient.crearCliente`. */
export interface CrearClientePayload {
  nombre: string;
  cityId: number;
  streetId: number;
  streetNumber: string;
  mobile?: string;
  tipoCliente?: 'person' | 'company';
  vat?: string;
  frecuenciaEntrega?: 'semanal' | 'quincenal' | 'mensual' | 'a_demanda';
  diasEntrega?: string[];
  date?: string;
}

/** Args of `repartoApiClient.crearGastoDeReparto`. */
export interface CrearGastoRepartoPayload {
  date: string;
  tipo: string;
  descripcion: string;
  monto: number;
  comprobante?: string | null;
}

/** Args of `repartoApiClient.reordenarClientes`. Idempotent — last call wins. */
export interface ReordenarClientesPayload {
  date: string;
  partnerIds: number[];
}

/** Args of `repartoApiClient.agregarClienteARuta`. */
export interface AgregarClienteARutaPayload {
  date: string;
  partnerId: number;
}

/** Args of `repartoApiClient.quitarClienteDeRuta`. */
export interface QuitarClienteDeRutaPayload {
  date: string;
  partnerId: number;
}

export interface MutationPayloadMap {
  registrar_visita: RegistrarVisitaPayload;
  save_control_playa: SaveControlPlayaPayload;
  crear_cliente: CrearClientePayload;
  crear_gasto_reparto: CrearGastoRepartoPayload;
  reordenar_clientes: ReordenarClientesPayload;
  agregar_cliente_a_ruta: AgregarClienteARutaPayload;
  quitar_cliente_de_ruta: QuitarClienteDeRutaPayload;
}

/**
 * One row of the local outbox. Column names on disk are snake_case (see the
 * migration in src/db/database.ts); this is the camelCase shape the rest of
 * the app works with.
 */
export interface OutboxItem<T extends MutationType = MutationType> {
  /** Local id (not a backend id) — `newOutboxId()`. */
  id: string;
  type: T;
  payload: MutationPayloadMap[T];
  status: SyncStatus;
  /** How many times a replay has been attempted (drives retry backoff + UI). */
  attempts: number;
  /** User-facing message from the last failed attempt, or null. */
  lastError: string | null;
  /** Route/vehicle this mutation belongs to — only items matching the active
   * session are replayed (see repartoApiClient's per-route credential). */
  routeId: number;
  login: string;
  /** id of the `crear_cliente` item this one waits for, or null. The engine
   * won't replay a dependent until its dependency is `done`. */
  dependsOn: string | null;
  /** Only set on `crear_cliente` items: the negative local id handed to the
   * UI so an alta→visita chain can proceed offline. Dependent items carry the
   * same value in `payload.partnerId` until the alta syncs. */
  tempPartnerId: number | null;
  /** ISO 8601. */
  createdAt: string;
  /** ISO 8601, set when `status` becomes `done`. */
  syncedAt: string | null;
}

/** What a caller must supply to enqueue — everything else has a default. */
export interface NewOutboxItem<T extends MutationType = MutationType> {
  type: T;
  payload: MutationPayloadMap[T];
  routeId: number;
  login: string;
  dependsOn?: string | null;
  tempPartnerId?: number | null;
}

/** A short human summary of a queued item, for the Sync tab list. */
export interface OutboxSummary {
  title: string;
  subtitle: string;
  icon:
    | 'local-shipping'
    | 'inventory'
    | 'person-add'
    | 'person-remove'
    | 'payments'
    | 'swap-vert'
    | 'sync';
}
