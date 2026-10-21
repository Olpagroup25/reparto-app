/**
 * The single entry point every screen uses to persist a write.
 *
 * Estrategia por operación:
 *
 * **Network-first con fallback a outbox** (ENQUEUE_FIRST = false):
 *   Se intenta el endpoint del backend inmediatamente. Si el llamado tiene
 *   éxito, la UI recibe confirmación en el momento. Si falla por red, 404 o
 *   5xx, la operación se guarda en el outbox local (src/db/outbox.ts) y el
 *   sync engine la reintenta cuando vuelve la conectividad. Un 4xx de negocio
 *   (ej. 400 "La hoja de ruta no está en reparto") se propaga directamente
 *   — no tiene sentido reintentar.
 *
 * **Enqueue-first** (ENQUEUE_FIRST = true):
 *   La operación va directo al outbox sin intentar la red. Usado para
 *   endpoints que todavía no existen en el backend (gastos de reparto,
 *   reordenar_clientes como fallback).
 *
 * Cuando un endpoint nuevo llega al backend: solo hay que verificar que su
 * flag esté en `false` — los dialogs no cambian.
 */
import { RepartoApiError, repartoApiClient } from '@/api/repartoApiClient';
import * as outbox from '@/db/outbox';
import * as localRouteStore from '@/db/localRouteStore';
import type { MutationType, OutboxItem } from './types';
import type {
  CrearClientePayload,
  CrearGastoRepartoPayload,
  RegistrarVisitaPayload,
  ReordenarClientesPayload,
  SaveControlPlayaPayload,
} from './types';

/**
 * Por-operación: `false` = network-first (endpoint existe en el backend);
 * `true` = enqueue-first (endpoint todavía no existe o es puramente offline).
 */
export const ENQUEUE_FIRST: Record<MutationType, boolean> = {
  // ✅ Backend implementado — network-first con fallback a outbox
  registrar_visita: false,
  save_control_playa: false,
  crear_cliente: false,
  agregar_cliente_a_ruta: false,
  quitar_cliente_de_ruta: false,
  crear_gasto_reparto: false,
  // Network-first manejado directamente en reordenarClientes()
  reordenar_clientes: false,
};

function requireSession(): { routeId: number; login: string } {
  const session = repartoApiClient.getSession();
  if (!session) {
    throw new Error('No hay una sesión activa. Volvé a iniciar sesión.');
  }
  return { routeId: session.routeId, login: session.login };
}

/**
 * Determina si un error debe encolarse para reintento (true) o propagarse
 * directamente al caller (false).
 *   - Sin red / timeout / 5xx → encolar (error transitorio)
 *   - 404 → el endpoint no está desplegado todavía → encolar
 *   - 4xx de negocio (400, 422, etc.) → propagar (reintentar no va a ayudar)
 */
function isEnqueueable(err: unknown): boolean {
  if (err instanceof RepartoApiError) {
    return err.status === 0 || err.status === 404 || err.status >= 500;
  }
  // fetch() rechaza con TypeError cuando no hay red
  return true;
}

export const queuedWrites = {
  /**
   * Registra o actualiza la visita a un cliente.
   *
   * Network-first: el backend tiene POST /insa/api/visita implementado.
   * Si `payload.partnerId` es negativo, es un id temporal de un alta offline
   * — se enlaza al `crear_cliente` correspondiente en el outbox para que el
   * sync engine los replaye en orden y reescriba el id real.
   *
   * En ese caso no se intenta la red directamente (el cliente real todavía
   * no existe en el servidor), y se encola con dependencia.
   */
  async registrarVisita(payload: RegistrarVisitaPayload): Promise<OutboxItem | null> {
    const { routeId, login } = requireSession();

    // Actualizar inmediatamente el espejo local de SQLite para que la UI responda al instante
    await localRouteStore.applyLocalVisit(routeId, payload.date, payload);

    // Partner temporal (alta offline): encolar con dependencia, sin intentar la red.
    if (payload.partnerId < 0) {
      const alta = await outbox.findByTempPartnerId(payload.partnerId);
      const dependsOn = alta?.id ?? null;
      return outbox.enqueue({ type: 'registrar_visita', payload, routeId, login, dependsOn });
    }

    // Network-first: intentar el backend directamente.
    try {
      await repartoApiClient.registrarVisita(payload);
      return null; // Éxito en red: no hay item en el outbox.
    } catch (err) {
      if (!isEnqueueable(err)) throw err;
      return outbox.enqueue({ type: 'registrar_visita', payload, routeId, login });
    }
  },

  /**
   * Agrega un cliente fuera de ruta a la hoja de ruta del día actual en Odoo.
   * Network-first: envía POST /insa/api/clientes/agregar-a-ruta para que Odoo
   * cree el fsm.order en fsm.route.dayroute.
   */
  async agregarClienteARuta(date: string, partnerId: number): Promise<OutboxItem | null> {
    const { routeId, login } = requireSession();
    try {
      await repartoApiClient.agregarClienteARuta(date, partnerId);
      return null;
    } catch (err) {
      if (!isEnqueueable(err)) throw err;
      return outbox.enqueue({
        type: 'agregar_cliente_a_ruta',
        payload: { date, partnerId },
        routeId,
        login,
      });
    }
  },

  /**
   * Quita un cliente de la hoja de ruta del día actual en Odoo.
   * Network-first: envía POST /insa/api/clientes/quitar-de-ruta para que Odoo
   * desvincule el fsm.order en fsm.route.dayroute.
   */
  async quitarClienteDeRuta(date: string, partnerId: number): Promise<OutboxItem | null> {
    const { routeId, login } = requireSession();

    // Actualizar inmediatamente el espejo local de SQLite para que la UI responda al instante (offline y online)
    await localRouteStore.markClientRemovedLocally(routeId, date, partnerId);

    try {
      await repartoApiClient.quitarClienteDeRuta(date, partnerId);
      return null;
    } catch (err) {
      if (!isEnqueueable(err)) throw err;
      return outbox.enqueue({
        type: 'quitar_cliente_de_ruta',
        payload: { date, partnerId },
        routeId,
        login,
      });
    }
  },

  /**
   * Guarda un control de playa (salida o entrada).
   *
   * Network-first: el backend tiene POST /insa/api/control-playa implementado.
   */
  async saveControlPlaya(payload: SaveControlPlayaPayload): Promise<OutboxItem | null> {
    const { routeId, login } = requireSession();
    try {
      await repartoApiClient.saveControlPlaya(
        payload.date,
        payload.tipo,
        payload.kilometros,
        payload.lineas,
      );
      return null;
    } catch (err) {
      if (!isEnqueueable(err)) throw err;
      return outbox.enqueue({ type: 'save_control_playa', payload, routeId, login });
    }
  },

  /**
   * Crea un nuevo gasto de reparto.
   *
   * Network-first: el backend tiene POST /insa/api/gasto implementado.
   */
  async crearGastoReparto(payload: CrearGastoRepartoPayload): Promise<OutboxItem | null> {
    const { routeId, login } = requireSession();
    try {
      await repartoApiClient.crearGastoDeReparto({
        date: payload.date,
        tipo: payload.tipo,
        descripcion: payload.descripcion,
        monto: payload.monto,
        comprobante: payload.comprobante,
      });
      return null;
    } catch (err) {
      if (!isEnqueueable(err)) throw err;
      return outbox.enqueue({ type: 'crear_gasto_reparto', payload, routeId, login });
    }
  },

  /**
   * Da de alta un nuevo cliente.
   *
   * Network-first: el backend tiene POST /insa/api/clientes implementado.
   * Devuelve siempre un `tempPartnerId` negativo para que el caller pueda
   * navegar a "Registrar visita" de inmediato, incluso si la operación
   * terminó en el outbox por falta de red. Si tuvo éxito en la red, el
   * `partnerId` real llega por otro canal (la respuesta de la API se descarta
   * acá, quien la necesita es el sync engine en su path de `crear_cliente`).
   *
   * Nota sobre el id temporal: en caso de éxito online, el partnerId real
   * NO se inyecta en el tempPartnerId — el caller debe refrescar la lista
   * de clientes (invalida la query de hoja-de-ruta) para obtener el partner_id
   * real. El tempPartnerId negativo solo sirve para la cadena offline
   * alta → visita cuando no hay red.
   */
  async crearCliente(
    payload: CrearClientePayload,
  ): Promise<{ item: OutboxItem | null; tempPartnerId: number; partnerId?: number }> {
    const { routeId, login } = requireSession();
    const tempPartnerId = -Date.now();

    // Validación de unicidad de documento antes de proceder
    if (payload.vat && payload.vat.trim().length >= 5) {
      try {
        const existing = await repartoApiClient.verificarDocumentoExistente(payload.vat.trim());
        if (existing) {
          throw new RepartoApiError(
            400,
            `No se puede crear el cliente: ya existe "${existing.nombre}" con el documento ${payload.vat.trim()}.`,
          );
        }
      } catch (err) {
        if (err instanceof RepartoApiError && err.status === 400) {
          throw err;
        }
        // Continuar si fue error de red/fallback
      }
    }

    try {
      const cliente = await repartoApiClient.crearCliente(payload);
      // Éxito en red: devolver el partnerId real directamente.
      return { item: null, tempPartnerId, partnerId: cliente.partnerId };
    } catch (err) {
      if (!isEnqueueable(err)) throw err;
      // Sin red: encolar con tempPartnerId para cadena offline.
      const item = await outbox.enqueue({
        type: 'crear_cliente',
        payload,
        routeId,
        login,
        tempPartnerId,
      });
      return { item, tempPartnerId };
    }
  },

  /**
   * Persiste el orden custom del repartidor.
   *
   * Network-first: intenta el backend inmediatamente; encola solo si no hay
   * red o el endpoint no está desplegado (404). Idempotente — si hay un
   * `reordenar_clientes` pendiente para la misma ruta, se reemplaza por el
   * nuevo (solo importa el último orden conocido, no la secuencia de cambios).
   */
  async reordenarClientes(
    payload: ReordenarClientesPayload,
  ): Promise<{ synced: boolean }> {
    const { routeId, login } = requireSession();

    try {
      await repartoApiClient.reordenarClientes(payload.date, payload.partnerIds);
      await supersedePendingReorders(routeId);
      return { synced: true };
    } catch (err) {
      if (!isEnqueueable(err)) throw err;
    }

    await supersedePendingReorders(routeId);
    await outbox.enqueue({ type: 'reordenar_clientes', payload, routeId, login });
    return { synced: false };
  },
};

/**
 * Elimina los `reordenar_clientes` pendientes para la misma ruta — solo el
 * último orden importa (reemplazo idempotente, no acumulación).
 */
async function supersedePendingReorders(routeId: number): Promise<void> {
  const pending = await outbox.listByStatus('pending', 'failed');
  for (const item of pending) {
    if (item.type === 'reordenar_clientes' && item.routeId === routeId) {
      await outbox.remove(item.id);
    }
  }
}
