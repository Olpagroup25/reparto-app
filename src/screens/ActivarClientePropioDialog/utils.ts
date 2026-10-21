import type { Calle, Ciudad, ClienteBusqueda, ClienteVisita } from '@/api/types';

/**
 * Filters a catalog of cities or streets by a case-insensitive search term.
 */
export function filterCatalogOptions<T extends { nombre: string }>(items: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => item.nombre.toLowerCase().includes(q));
}

/**
 * Validates whether the form has enough required data to activate the client.
 */
export function canActivarCliente(
  cliente: ClienteBusqueda | ClienteVisita | null,
  ciudad: Ciudad | null,
  calle: Calle | null,
  numero: string,
): boolean {
  return cliente !== null && ciudad !== null && calle !== null && numero.trim().length > 0;
}

/**
 * Builds the activation payload to send to `repartoApiClient.activarClientePropio`.
 */
export function buildActivarClientePayload(params: {
  partnerId: number;
  cityId: number;
  streetId: number;
  streetNumber: string;
  floor?: string;
  apartment?: string;
  notes?: string;
  date?: string;
}) {
  return {
    partnerId: params.partnerId,
    cityId: params.cityId,
    streetId: params.streetId,
    streetNumber: params.streetNumber.trim(),
    floor: params.floor?.trim() || undefined,
    apartment: params.apartment?.trim() || undefined,
    notes: params.notes?.trim() || undefined,
    date: params.date,
  };
}
