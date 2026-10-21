/**
 * Helper to determine if custom dialog header should be preferred over standard title.
 */
export function hasCustomDialogHeader(header?: unknown): boolean {
  return header !== undefined && header !== null;
}
