import type { GastoDeReparto, TipoGasto } from '@/api/types';

/** Used until `GET /insa/api/gastos-reparto/tipos` exists. */
export const TIPOS_FALLBACK: TipoGasto[] = [
  { codigo: 'combustible', label: 'Combustible' },
  { codigo: 'peaje', label: 'Peaje' },
  { codigo: 'libreria', label: 'Librería' },
  { codigo: 'gomeria', label: 'Gomería' },
  { codigo: 'repuestos', label: 'Repuestos' },
  { codigo: 'reparaciones', label: 'Reparaciones' },
  { codigo: 'lavado', label: 'Lavado' },
  { codigo: 'gastos_personales', label: 'Gastos Personales' },
];

/**
 * Calculates sum total of declared and server expenses.
 */
export function calculateTotalGastos(gastos: GastoDeReparto[]): number {
  return gastos.reduce((sum, g) => sum + g.monto, 0);
}

/**
 * Filters expense types by query string.
 */
export function filterTiposGasto(tipos: TipoGasto[], query: string): TipoGasto[] {
  const q = query.trim().toLowerCase();
  if (!q) return tipos;
  return tipos.filter((t) => t.label.toLowerCase().includes(q));
}

/**
 * Validates whether the expense form can be submitted.
 */
export function canSaveGasto(tipo: TipoGasto | null, monto: string): boolean {
  return tipo !== null && Number(monto) > 0;
}

/**
 * Creates an optimistic local representation for a newly declared expense.
 */
export function buildOptimisticGasto(
  deliveryDate: string,
  tipo: TipoGasto,
  descripcion: string,
  monto: number,
): GastoDeReparto {
  return {
    id: -Date.now(),
    tipo: tipo.codigo,
    tipoLabel: tipo.label,
    descripcion: descripcion.trim(),
    monto,
    fecha: deliveryDate,
  };
}
