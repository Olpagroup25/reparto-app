import type { ClienteVisita, ProductoCatalogo, StockEnRutaItem } from '@/api/types';
import type { LineaArticuloEditable, ModoVisita, PickerForType } from './types';

/**
 * Format currency value to AR locale format ($1.234,56).
 */
export function formatPrecio(val: number | string): string {
  const num = typeof val === 'number' ? val : parseFloat(val) || 0;
  return num.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Calculate the total sale amount from editable article lines (type === 'venta').
 */
export function calcularTotalVentaArticulos(lineas: LineaArticuloEditable[]): number {
  return lineas
    .filter((l) => l.tipo === 'venta')
    .reduce((sum, l) => sum + (Number(l.cantidad) || 0) * (Number(l.precioUnitario) || 0), 0);
}

/**
 * Maps available stock per product. If editing an already visited client,
 * adds back previously assigned quantities for this client.
 */
export function calcularStockDisponible(
  stockEnRuta: StockEnRutaItem[],
  cliente: ClienteVisita | null,
): Map<number, number> {
  const map = new Map<number, number>();
  for (const item of stockEnRuta) {
    let disp = item.disponibles;
    if (cliente?.visitado && cliente?.lineasArticulo) {
      const prevLinea = cliente.lineasArticulo.find(
        (l) => l.productId === item.productId && l.tipo === 'venta',
      );
      if (prevLinea) {
        disp += prevLinea.cantidad;
      }
    }
    map.set(item.productId, Math.max(0, disp));
  }
  return map;
}

/**
 * Checks if any article line exceeds available vehicle stock or has invalid quantity.
 */
export function hayLineasExcedidas(
  modo: ModoVisita,
  lineas: LineaArticuloEditable[],
  stockMap: Map<number, number>,
): boolean {
  if (modo !== 'transaccion') return false;
  return lineas.some((l) => {
    if (l.tipo !== 'venta') return false;
    const cant = Number(l.cantidad) || 0;
    const maxDisp = stockMap.get(l.productId) ?? 0;
    return cant > maxDisp || cant <= 0;
  });
}

/**
 * Finds the first invalid article line that exceeds available stock.
 */
export function buscarLineaExcedida(
  lineas: LineaArticuloEditable[],
  stockMap: Map<number, number>,
): LineaArticuloEditable | undefined {
  return lineas.find((l) => {
    if (l.tipo !== 'venta') return false;
    const cant = Number(l.cantidad) || 0;
    const maxDisp = stockMap.get(l.productId) ?? 0;
    return cant > maxDisp;
  });
}

/**
 * Filters products for the picker modal by search query.
 */
export function filtrarProductosPicker(
  productos: ProductoCatalogo[],
  query: string,
): ProductoCatalogo[] {
  const q = query.trim().toLowerCase();
  if (!q) return productos;
  return productos.filter((p) => p.nombre.toLowerCase().includes(q));
}
