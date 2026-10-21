import { ReorderItem } from './types';

/**
 * Moves an item at index in the given direction (-1 for up, 1 for down).
 * Returns a new array with the items swapped, or original array if boundary reached.
 */
export function reorderItems<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const next = [...list];
  const target = index + direction;
  if (target < 0 || target >= next.length) return list;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/**
 * Extracts list of IDs from reorder items.
 */
export function extractOrderedIds(items: ReorderItem[]): number[] {
  return items.map((i) => i.id);
}
