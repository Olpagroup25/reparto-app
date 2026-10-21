import { colors } from '@/theme/tokens';
import type { SyncStatus } from '@/sync/types';
import type { SyncStatusVariant } from './types';

export const STATUS_VARIANT: Record<SyncStatus, SyncStatusVariant> = {
  pending: 'neutral',
  syncing: 'primary',
  failed: 'error',
  done: 'secondary',
};

/**
 * Derives the accent border color for an outbox row card based on sync status.
 */
export function getOutboxAccentColor(status: SyncStatus): string {
  if (status === 'failed') return colors.error;
  if (status === 'syncing') return colors.primary;
  return colors.outlineVariant;
}
