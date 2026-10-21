# Card

A surface container component supporting elevation level 1, rounded corners, top/left status accent borders, and optional long-press interactions.

## File Structure

```
Card/
├── types.ts       # Props and accent position types
├── styles.ts      # Surface styles and padding definitions
├── utils.ts       # Accent style computation helper
├── index.tsx      # Core Card component
└── README.md      # Documentation
```

## Types & Interfaces

```typescript
export type CardAccentPosition = 'top' | 'left';

export type CardProps = {
  children: ReactNode;
  accentColor?: string;
  accentPosition?: CardAccentPosition;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  onLongPress?: () => void;
};
```

## Logic & Utils

- `getCardAccentStyle(accentColor?, accentPosition?)`: Returns dynamic border properties (`borderTopWidth`/`borderTopColor` or `borderLeftWidth`/`borderLeftColor`).
- Automatically switches to a `Pressable` with a `400ms` delay when `onLongPress` is provided.

## Usage Example

```tsx
import { Card } from '@/components/Card';
import { colors } from '@/theme/tokens';

// Simple content card
<Card>
  <Text>Contenido principal</Text>
</Card>

// Order card with error/priority accent bar
<Card accentColor={colors.error} accentPosition="top" onLongPress={handleReorder}>
  <Text>Cliente #1024 - Entrega prioritaria</Text>
</Card>
```
