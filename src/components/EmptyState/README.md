# EmptyState

A full-screen placeholder view indicating empty collections (e.g. no pending deliveries, no offline sync items, or empty tech service orders).

## File Structure

```
EmptyState/
├── types.ts       # Empty state props interface
├── styles.ts      # Icon bubble, typography, and CTA spacing styles
├── utils.ts       # Action detection helper
├── index.tsx      # Main component
└── README.md      # Documentation
```

## Types & Interfaces

```typescript
import { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

export type EmptyStateProps = {
  icon: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
};
```

## Features

- Modeled after Material Design 3 empty states with elevated circular icon wrapper.
- Supports a primary rounded CTA button (via `Button` component) and an optional secondary link.

## Usage Example

```tsx
import { EmptyState } from '@/components/EmptyState';

<EmptyState
  icon="inbox"
  title="Sin pedidos pendientes"
  message="No tienes entregas pendientes en esta hoja de ruta."
  actionLabel="Actualizar lista"
  onAction={handleRefresh}
  secondaryLabel="Ver historial de entregas"
  onSecondaryAction={handleGoHistory}
/>
```
