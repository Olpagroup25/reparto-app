/**
 * Helper to check whether any action (primary or secondary) is attached to the empty state.
 */
export function hasEmptyStateActions(actionLabel?: string, secondaryLabel?: string): boolean {
  return Boolean(actionLabel || secondaryLabel);
}
