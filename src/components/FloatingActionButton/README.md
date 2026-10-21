# FloatingActionButton

A floating action button (FAB) component featuring elevation level 2, scale feedback animation on press, and customizable shape/variant presets.

## File Structure

```
FloatingActionButton/
├── types.ts       # Variants, shapes, and props
├── styles.ts      # Fixed 56x56 layout and pressed transform styles
├── utils.ts       # Theme colors and border radius helpers
├── index.tsx      # Main component
└── README.md      # Documentation
```

## Types & Interfaces

```typescript
import { ComponentProps } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];
export type FabVariant = 'primary' | 'secondary';
export type FabShape = 'circle' | 'rounded';

export type FloatingActionButtonProps = {
  icon: IconName;
  onPress: () => void;
  variant?: FabVariant;
  shape?: FabShape;
  style?: StyleProp<ViewStyle>;
};
```

## Shapes & Variants

- `shape`:
  - `circle` (`radii.full`): Standard circular FAB (e.g. Map view button).
  - `rounded` (`radii.lg`): Squircle FAB (e.g. Search button).
- `variant`:
  - `primary`: Navy fill with white icon.
  - `secondary`: Secondary container fill with matching container text/icon color.

## Usage Example

```tsx
import { FloatingActionButton } from '@/components/FloatingActionButton';

<FloatingActionButton
  icon="map"
  variant="primary"
  shape="circle"
  onPress={handleOpenMap}
  style={{ position: 'absolute', bottom: 80, right: 16 }}
/>
```
