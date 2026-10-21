# IconButton

Circular tap target for icons. Used for menu toggles, close buttons, modal headers, and search filters.

## File Structure

- `index.tsx`: Core component implementation and public exports.
- `types.ts`: Props interface (`IconButtonProps`) and icon name type (`IconName`).
- `styles.ts`: StyleSheet definitions for base container, pressed, and disabled states.
- `utils.ts`: Helper functions for resolving dynamic icon colors.
- `README.md`: Component documentation and usage examples.

## Types & Interfaces

```typescript
export type IconName = ComponentProps<typeof MaterialIcons>['name'];

export type IconButtonProps = {
  icon: IconName;
  onPress?: () => void;
  color?: string;
  backgroundColor?: string;
  size?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};
```

## Logic & Utils

- `getIconButtonIconColor(disabled: boolean, color?: string)`: Returns disabled outline color or active icon color.

## Styles

- Circular shape with `radii.full`
- Pressed state feedback (`opacity: 0.7`)
- Disabled state styling (`opacity: 0.3`)

## Usage Example

```tsx
import { IconButton } from '@/components/IconButton';

<IconButton
  icon="menu"
  onPress={() => openDrawer()}
  color="#FFFFFF"
/>
```
