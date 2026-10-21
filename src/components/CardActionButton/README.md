# CardActionButton

A vertical tap target pairing a Material icon above a concise label, used within card action bars.

## File Structure

```
CardActionButton/
├── types.ts       # Prop interfaces and icon type
├── styles.ts      # Centered column styling and pressed state
├── utils.ts       # Color fallback helper
├── index.tsx      # Main component
└── README.md      # Documentation
```

## Types & Interfaces

```typescript
import { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

export type CardActionButtonProps = {
  icon: IconName;
  label: string;
  color?: string;
  onPress: () => void;
};
```

## Logic & Utils

- `getActionButtonColor(color?)`: Resolves custom action colors with fallback to `colors.primary`.
- Applies responsive opacity feedback on tap (`opacity: 0.6`).

## Usage Example

```tsx
import { CardActionButton } from '@/components/CardActionButton';
import { colors } from '@/theme/tokens';

<CardActionButton
  icon="navigation"
  label="Ir al mapa"
  color={colors.primary}
  onPress={openMap}
/>
```
