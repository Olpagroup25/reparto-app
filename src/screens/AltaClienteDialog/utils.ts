import type { Calle, Ciudad, ClienteBusqueda, FrecuenciaEntrega, TipoCliente } from '@/api/types';
import type { FrecuenciaOption } from './types';

export const FRECUENCIAS: FrecuenciaOption[] = [
  { key: 'semanal', label: 'Semanal' },
  { key: 'quincenal', label: 'Quincenal' },
  { key: 'mensual', label: 'Mensual' },
  { key: 'a_demanda', label: 'A demanda' },
];

export const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

/**
 * Filter catalog items (Ciudad / Calle) by search query.
 */
export function filterPickerOptions<T extends { nombre: string }>(options: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return options;
  return options.filter((o) => o.nombre.toLowerCase().includes(q));
}

/**
 * Strips formatting (dots, dashes, spaces) from a document/tax number.
 */
export function normalizarDocumento(doc: string): string {
  return doc.replace(/[\.\-\s\/]/g, '').trim();
}

/**
 * Validates mandatory fields and ensures no document duplication before saving.
 */
export function canSaveAltaCliente(
  nombre: string,
  ciudad: Ciudad | null,
  calle: Calle | null,
  numero: string,
  documentoDuplicado: boolean = false,
): boolean {
  return (
    nombre.trim().length > 0 &&
    ciudad !== null &&
    calle !== null &&
    numero.trim().length > 0 &&
    !documentoDuplicado
  );
}

/**
 * Constructs the client search entity representation for the created customer.
 */
export function buildClienteBusqueda(params: {
  partnerId: number;
  nombre: string;
  calleNombre: string;
  numero: string;
  ciudadNombre: string;
}): ClienteBusqueda {
  return {
    partnerId: params.partnerId,
    nombre: params.nombre.trim(),
    direccion: `${params.calleNombre} ${params.numero.trim()}, ${params.ciudadNombre}`,
    saldoFacturas: 0,
    consumos: 0,
  };
}

/**
 * Prepares the creation payload for queued writes.
 */
export function buildCrearClientePayload(params: {
  nombre: string;
  ciudad: Ciudad;
  calle: Calle;
  numero: string;
  telefono: string;
  tipoCliente: TipoCliente;
  cuitDni: string;
  frecuencia: FrecuenciaEntrega;
  diasSemana: string[];
  deliveryDate?: string;
}) {
  return {
    nombre: params.nombre.trim(),
    cityId: params.ciudad.cityId,
    streetId: params.calle.streetId,
    streetNumber: params.numero.trim(),
    mobile: params.telefono.trim() || undefined,
    tipoCliente: params.tipoCliente,
    vat: params.cuitDni.trim() || undefined,
    frecuenciaEntrega: params.frecuencia,
    diasEntrega: params.diasSemana.length > 0 ? params.diasSemana : undefined,
    date: params.deliveryDate,
  };
}
