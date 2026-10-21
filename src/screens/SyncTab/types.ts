import type { OutboxItem, SyncStatus } from '@/sync/types';

export type SyncStatusVariant = 'neutral' | 'secondary' | 'error' | 'primary';

export type OutboxRowProps = {
  item: OutboxItem;
  expanded: boolean;
  online: boolean;
  onToggle: () => void;
  onRetry: () => void;
  onDiscard: () => void;
};
