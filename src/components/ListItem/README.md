# ListItem

Interactive list item component supporting leading icons, titles, subtitles, trailing actions, and highlight states. Commonly used in navigation drawers, settings, and detail views.

## File Structure

- `index.tsx`: Core component implementation and public exports.
- `types.ts`: Props interface (`ListItemProps`) and icon name type (`IconName`).
- `styles.ts`: StyleSheet definitions for row container, text styling, and highlight states.
- `utils.ts`: Helper functions for resolving icon colors based on highlight status.
- `README.md`: Component documentation and usage examples.

## Types & Interfaces

```typescript
export type IconName = ComponentProps<typeof MaterialIcons>['name'];

export type ListItemProps = {
  title: string;
  subtitle?: string;
  leadingIcon?: IconName;
  trailing?: ReactNode;
  highlighted?: boolean;
  onPress?: () => void;
};
```

## Logic & Utils

- `getListItemIconColor(highlighted: boolean)`: Resolves primary icon color vs highlighted container icon color.

## Styles

- Row layout with spacing gap
- Highlighted mode with `colors.primaryContainer` background and emphasized title
- Pressed feedback with `colors.surfaceVariant` background

## Usage Example

```tsx
import { ListItem } from '@/components/ListItem';

<ListItem
  leadingIcon="person"
  title="Juan Pérez"
  subtitle="Cobrador"
  onPress={() => handleSelect()}
/>
```
