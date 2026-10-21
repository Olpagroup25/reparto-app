# SyncTab

## Purpose
`SyncTab` serves as the offline-first sync control center in `HojaDeRutaScreen`. It monitors connectivity status, outbox operation counts, manual flush triggers, and allows granular retry or discard of individual queued mutations (visits, customer registrations, expenses, and order updates).

## File Structure
- `index.tsx`: Main tab view and `OutboxRow` list items.
- `types.ts`: Prop definitions (`OutboxRowProps`) and badge variant types (`SyncStatusVariant`).
- `styles.ts`: Presentation styling for status pill, summary metrics card, outbox entries, and empty state.
- `utils.ts`: Variant mapping (`STATUS_VARIANT`) and card accent color resolver (`getOutboxAccentColor`).
- `README.md`: Technical documentation.

## Types & Props
- `OutboxRowProps`:
  - `item: OutboxItem`: Stored SQLite mutation item.
  - `expanded: boolean`: Expansion state showing error details & retry/discard actions.
  - `online: boolean`: Connectivity flag.
  - `onToggle: () => void`: Row accordion toggle.
  - `onRetry: () => void`: Retry trigger.
  - `onDiscard: () => void`: Discard trigger.

## Extracted Business Logic & Utils
- `STATUS_VARIANT`: Map correlating sync status (`pending`, `syncing`, `failed`, `done`) to badge variants.
- `getOutboxAccentColor(status)`: Determines the left accent border color for an outbox item card.

## Styles
- Connectivity status banner with dynamic color dot.
- FlatList with header stats for pending, failed, and completed syncs today.
- Accordion-style cards for error inspection and manual retry/discard buttons.

## Odoo / Offline Sync Integration
- Integrates with `useSync()` hook exposing the SQLite outbox.
- `forzarActualizacion()` flushes pending writes to the Odoo backend and invalidates React Query cache (`['reparto']`) to reload refreshed data.
- Handles automated reconnect synchronization when enabled.
