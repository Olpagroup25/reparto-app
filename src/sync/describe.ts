/**
 * Turns a raw `OutboxItem` into the short, human-readable summary the Sync tab
 * list renders. Kept out of the components so the wording lives in one place.
 */
import type { OutboxItem, OutboxSummary, SyncStatus } from './types';
import type {
  AgregarClienteARutaPayload,
  CrearClientePayload,
  CrearGastoRepartoPayload,
  QuitarClienteDeRutaPayload,
  RegistrarVisitaPayload,
  ReordenarClientesPayload,
  SaveControlPlayaPayload,
} from './types';

export function describeOutboxItem(item: OutboxItem): OutboxSummary {
  switch (item.type) {
    case 'registrar_visita': {
      const p = item.payload as RegistrarVisitaPayload;
      const detalle =
        p.resultado === 'ausente'
          ? 'Cliente ausente'
          : p.resultado === 'sin_gestion'
            ? 'Sin gestión'
            : (p.cobroEfectivo ?? 0) > 0
              ? `Cobro $${p.cobroEfectivo}`
              : 'Con transacción';
      return {
        icon: 'local-shipping',
        title: 'Registrar visita',
        subtitle: `${p.partnerId < 0 ? 'Cliente nuevo' : `Cliente #${p.partnerId}`} · ${detalle}`,
      };
    }
    case 'save_control_playa': {
      const p = item.payload as SaveControlPlayaPayload;
      return {
        icon: 'inventory',
        title: `Control de Playa · ${p.tipo === 'salida' ? 'Salida' : 'Entrada'}`,
        subtitle: `${p.lineas.length} artículo(s) · ${p.kilometros} km`,
      };
    }
    case 'crear_cliente': {
      const p = item.payload as CrearClientePayload;
      return {
        icon: 'person-add',
        title: 'Alta de cliente',
        subtitle: p.nombre,
      };
    }
    case 'crear_gasto_reparto': {
      const p = item.payload as CrearGastoRepartoPayload;
      return {
        icon: 'payments',
        title: 'Gasto de reparto',
        subtitle: `${p.descripcion || p.tipo} · $${p.monto}`,
      };
    }
    case 'reordenar_clientes': {
      const p = item.payload as ReordenarClientesPayload;
      return {
        icon: 'swap-vert',
        title: 'Reordenar clientes',
        subtitle: `${p.partnerIds.length} cliente(s) ordenado(s)`,
      };
    }
    case 'agregar_cliente_a_ruta': {
      const p = item.payload as AgregarClienteARutaPayload;
      return {
        icon: 'person-add',
        title: 'Agregar a la hoja de ruta',
        subtitle: `Cliente #${p.partnerId}`,
      };
    }
    case 'quitar_cliente_de_ruta': {
      const p = item.payload as QuitarClienteDeRutaPayload;
      return {
        icon: 'person-remove',
        title: 'Quitar de la hoja de ruta',
        subtitle: `Cliente #${p.partnerId}`,
      };
    }
    default:
      return { icon: 'sync', title: 'Operación', subtitle: '' };
  }
}

export function statusLabel(status: SyncStatus): string {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'syncing':
      return 'Sincronizando…';
    case 'failed':
      return 'Con error';
    case 'done':
      return 'Sincronizado';
  }
}
