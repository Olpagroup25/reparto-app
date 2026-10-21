import { Linking } from 'react-native';
import type { ClienteBusqueda, ClienteVisita } from '@/api/types';

/**
 * Buscador (Paso 2.6) hands RegistrarVisitaDialog a client found outside
 * today's dayroute — it fills with neutral clean defaults. When added to the
 * route (`enRuta: true`), `fueraDeRuta` and `esExtra` are set to false so the
 * client appears cleanly integrated without the "Fuera de ruta" badge.
 */
export function clienteBusquedaAVisita(c: ClienteBusqueda, enRuta = false): ClienteVisita {
  return {
    partnerId: c.partnerId,
    nombre: c.nombre,
    direccion: c.direccion,
    saldoFacturas: c.saldoFacturas || 0,
    consumos: c.consumos || 0,
    fechaUltimaEntrega: c.fechaUltimaEntrega ?? null,
    fechaUltimaCobranza: c.fechaUltimaCobranza ?? null,
    visitado: false,
    resultado: null,
    cobroEfectivo: 0,
    lineasArticulo: [],
    lineasEnvase: [],
    iconosVisita: '',
    esExtra: !enRuta,
    fueraDeRuta: !enRuta,
    pedidoExtraId: null,
    deudaEnvases: [],
    esClientePropio: c.esClientePropio,
    fueVencido: c.fueVencido ?? false,
    fucVencido: c.fucVencido ?? false,
    alDia: c.alDia ?? (!c.fueVencido && !c.fucVencido),
    pedidoHabitual: c.pedidoHabitual,
    saldosEnvase: c.saldosEnvase,
  };
}

/**
 * Overdue invoices: the client has unpaid balance (saldoFacturas > 0)
 * and their collection due window is expired (fucVencido).
 */
export function isOverdue(client: ClienteVisita): boolean {
  return Boolean(client.saldoFacturas > 0 && client.fucVencido);
}

export function isPriority(client: ClienteVisita): boolean {
  return client.saldoFacturas > 30000;
}

/**
 * "Pendientes" = the client's status box is untouched: no visit logged, no
 * outcome recorded, no cash, no server-rendered icons. Deliberately stricter
 * than `!visitado` alone — the RN-18 "resuelto por WhatsApp sin ir" case has
 * `visitado: false` but `resultado: 'sin_gestion'`, i.e. it *did* have a
 * movement and must NOT show up here.
 */
export function sinMovimiento(c: ClienteVisita): boolean {
  return !c.visitado && c.resultado === null && c.cobroEfectivo === 0 && (c.iconosVisita ?? '') === '';
}

/** Latin fallback for engines whose `String.prototype.normalize` doesn't
 * decompose (older Hermes builds). Only the accents this app's data uses. */
const ACENTOS: Record<string, string> = {
  á: 'a', à: 'a', ä: 'a', â: 'a', ã: 'a',
  é: 'e', è: 'e', ë: 'e', ê: 'e',
  í: 'i', ì: 'i', ï: 'i', î: 'i',
  ó: 'o', ò: 'o', ö: 'o', ô: 'o', õ: 'o',
  ú: 'u', ù: 'u', ü: 'u', û: 'u',
  ñ: 'n', ç: 'c', ý: 'y', ÿ: 'y',
};

/**
 * Folds text for search: lower-cased and accent-stripped, so "Míguel",
 * "miguel" and "MIGUEL" all compare equal. Uses Unicode NFD decomposition
 * when available, with a plain Latin map as a fallback.
 */
export function normalizarTexto(input: string): string {
  const lower = input.toLowerCase();
  try {
    // NFD splits "í" into "i" + U+0301; drop every combining mark (U+0300–U+036F).
    return lower
      .normalize('NFD')
      .split('')
      .filter((ch) => {
        const code = ch.charCodeAt(0);
        return code < 0x300 || code > 0x36f;
      })
      .join('');
  } catch {
    return lower.replace(/[áàäâãéèëêíìïîóòöôõúùüûñçýÿ]/g, (ch) => ACENTOS[ch] ?? ch);
  }
}

/** "YYYY-MM-DD" -> "DD/MM/YYYY", or an em dash when the backend couldn't
 * find any matching history. */
export function formatFecha(iso: string | null): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function money(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  return `${sign}$${Math.abs(amount).toFixed(2)}`;
}

/** Opens the device's default maps app centered on the client's address —
 * "Ir" doesn't touch the backend, it's pure navigation. */
export async function abrirEnMapa(direccion: string): Promise<void> {
  const query = encodeURIComponent(direccion);
  const geoUrl = `geo:0,0?q=${query}`;
  const canOpenGeo = await Linking.canOpenURL(geoUrl).catch(() => false);
  await Linking.openURL(canOpenGeo ? geoUrl : `https://www.google.com/maps/search/?api=1&query=${query}`);
}

export const DRAWER_ITEMS = [
  { key: 'control_de_playa', icon: 'dock' as const, label: 'Control de Playa' },
  { key: 'stock_en_ruta', icon: 'local-shipping' as const, label: 'Stock en Ruta' },
  { key: 'gastos_de_reparto', icon: 'payments' as const, label: 'Gastos de Reparto' },
  { key: 'alta_cliente', icon: 'person-add' as const, label: 'Alta Cliente' },
  { key: 'cerrar_hoja', icon: 'task-alt' as const, label: 'Cerrar Hoja', highlighted: true },
  { key: 'sugerir_impresion', icon: 'print' as const, label: 'Sugerir Impresión' },
] as const;

/**
 * Combines server clients with locally added clients deduplicating by partnerId
 * and normalized name+address key.
 */
export function combineClientes(
  clientesRaw: ClienteVisita[],
  localAddedClients: ClienteVisita[],
): ClienteVisita[] {
  const serverPartnerIds = new Set(clientesRaw.map((c) => c.partnerId));
  const serverNamesAndAddresses = new Set(
    clientesRaw.map(
      (c) => `${c.nombre.trim().toLowerCase()}|${c.direccion.trim().toLowerCase()}`,
    ),
  );
  const nonDuplicateAdded = localAddedClients.filter(
    (c) =>
      !serverPartnerIds.has(c.partnerId) &&
      !serverNamesAndAddresses.has(
        `${c.nombre.trim().toLowerCase()}|${c.direccion.trim().toLowerCase()}`,
      ),
  );
  return [...clientesRaw, ...nonDuplicateAdded];
}
