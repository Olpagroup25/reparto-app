# CardActionBar

A horizontal action container rendered at the bottom of client and delivery cards, displaying evenly spaced action buttons (such as Ir, Repaso, Gestiones).

## File Structure

```
CardActionBar/
├── types.ts       # Action items and bar props
├── styles.ts      # Horizontal row styles and separator border
├── utils.ts       # Action list validation helper
├── index.tsx      # Main CardActionBar component
└── README.md      # Documentation
```

## Types & Interfaces

```typescript
import { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

export type CardAction = {
  key: string;
  icon: IconName;
  label: string;
  color?: string;
  onPress: () => void;
};

export type CardActionBarProps = {
  actions: CardAction[];
};
```

## Logic & Utils

- Integrates tightly with `CardActionButton`.
- `filterValidCardActions(actions)`: Ensures all actions possess non-empty keys, labels, icons, and callbacks.

## Usage Example

```tsx
import { CardActionBar, CardAction } from '@/components/CardActionBar';

const actions: CardAction[] = [
  { key: 'ir', label: 'Ir', icon: 'navigation', onPress: handleNavigate },
  { key: 'repaso', label: 'Repaso', icon: 'replay', onPress: handleRepaso },
  { key: 'gestiones', label: 'Gestiones', icon: 'edit-note', onPress: handleGestiones },
];

<CardActionBar actions={actions} />
```
