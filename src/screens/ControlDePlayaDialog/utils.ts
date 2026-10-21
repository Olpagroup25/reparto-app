import type { LineaControlPlaya, ProductoCatalogo } from '@/api/types';
import type { FlowType, LineaEditable, TabItem } from './types';

export const TABS: TabItem[] = [
  { key: 'articulos', label: 'Artículos', addLabel: '+ Agregar Artículo' },
  { key: 'dispensers', label: 'Dispensers', addLabel: '+ Agregar Dispenser' },
  { key: 'repuestos', label: 'Repuestos', addLabel: '+ Agregar Repuesto' },
];

/**
 * Filters the product catalog by case-insensitive name match.
 */
export function filterCatalogoProducts(catalogo: ProductoCatalogo[], query: string): ProductoCatalogo[] {
  const q = query.trim().toLowerCase();
  if (!q) return catalogo;
  return catalogo.filter((p) => p.nombre.toLowerCase().includes(q));
}

/**
 * Maps existing control lines from Odoo to local editable state format.
 */
export function mapControlPlayaLineasToEditable(lineas: LineaControlPlaya[]): LineaEditable[] {
  return lineas.map((l) => ({
    productId: l.productId,
    nombre: l.producto,
    cantidad: String(l.cantidad),
    cantidadVacia: String(l.cantidadVacia),
    cantidadFallada: String(l.cantidadFallada),
    aCargar: l.aCargarPedidos ?? 0,
  }));
}

/**
 * Maps salida items to default entrada editable state (retains loaded counts, zeroes returns).
 */
export function mapSalidaToEntradaEditable(salidaLineas: LineaControlPlaya[]): LineaEditable[] {
  return salidaLineas.map((l) => ({
    productId: l.productId,
    nombre: l.producto,
    cantidad: String(l.cantidad),
    cantidadVacia: '0',
    cantidadFallada: '0',
    aCargar: l.aCargarPedidos ?? 0,
  }));
}

/**
 * Computes total loaded bottles/items from salida lines.
 */
export function calculateSalidaTotalLlenos(lineas: LineaControlPlaya[]): number {
  return lineas.reduce((acc, l) => acc + (Number(l.cantidad) || 0), 0);
}

/**
 * Calculates kilometer difference and validates direction.
 */
export function calculateKmDiff(kmEntradaStr: string, kmSalida: number): { diff: number; isLess: boolean } {
  const kmEntrada = Number(kmEntradaStr) || 0;
  return {
    diff: kmEntrada - kmSalida,
    isLess: kmEntrada < kmSalida,
  };
}

/**
 * Determines if Salida control playa is confirmed/approved and should be read-only.
 */
export function isSalidaBloqueada(controlSalida: { aprobado?: boolean; state?: string } | null): boolean {
  if (!controlSalida) return false;
  return Boolean(controlSalida.aprobado || controlSalida.state === 'confirmado');
}

/**
 * Validates that each salida line has cantidad (llenos) >= aCargar.
 */
export function validateSalidaLineas(lineas: LineaEditable[]): { valid: boolean; error?: string } {
  for (const l of lineas) {
    const aCargar = l.aCargar ?? 0;
    const llenos = Number(l.cantidad);
    if (isNaN(llenos) || llenos < aCargar) {
      return {
        valid: false,
        error: `La cantidad de llenos para "${l.nombre}" debe ser mayor o igual a ${aCargar} (a cargar).`,
      };
    }
  }
  return { valid: true };
}

/**
 * Prepares payload to save control playa locally/offline.
 */
export function buildSaveControlPlayaPayload(
  deliveryDate: string,
  flowType: FlowType,
  km: string,
  lineas: LineaEditable[],
) {
  return {
    date: deliveryDate,
    tipo: flowType,
    kilometros: Number(km) || 0,
    lineas: lineas.map((l) => ({
      productId: l.productId,
      cantidad: Number(l.cantidad) || 0,
      cantidadVacia: Number(l.cantidadVacia) || 0,
      cantidadFallada: Number(l.cantidadFallada) || 0,
      a_cargar_pedidos: l.aCargar ?? 0,
    })),
  };
}

/**
 * Format currency value to AR locale format ($1.234,56).
 */
export function formatPrecio(val: number | string): string {
  const num = typeof val === 'number' ? val : parseFloat(val) || 0;
  return num.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
