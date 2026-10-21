# Badge

A versatile pill badge / tag component designed for count indicators, status chips, and priority tags across the application.

## File Structure

```
Badge/
├── types.ts       # Type definitions, variants, and prop interfaces
├── styles.ts      # StyleSheet and color mapping tokens
├── utils.ts       # Variant style resolution helper
├── index.tsx      # Main component export
└── README.md      # Documentation
```

## Types & Interfaces

```typescript
export type BadgeVariant = 'primary' | 'secondary' | 'error' | 'neutral';
export type BadgeSize = 'sm' | 'md';

export type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
};
```

## Logic & Utils

- `getBadgeVariantStyle(variant?: BadgeVariant)`: Returns the background and text color tokens based on the requested variant.

## Styles

- `sm` (default): Compact badge with `radii.base` (8px), ideal for notification dots and small tab counters.
- `md`: Chip badge with `radii.full` (pill shape), suitable for tags like "Prioridad" or status indicators ("FUE", "FUC").

## Usage Example

```tsx
import { Badge } from '@/components/Badge';

// Small count badge
<Badge label="3" variant="primary" size="sm" />

// Status chip
<Badge label="Prioridad" variant="error" size="md" />
```
