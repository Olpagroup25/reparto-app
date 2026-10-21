# TopAppBar

Edge-to-edge top navigation bar with safe-area top inset padding, title, menu hamburger button, and optional right-aligned action / badge slot.

## File Structure

- `index.tsx`: Core component implementation and public exports.
- `types.ts`: Props interface (`TopAppBarProps`).
- `styles.ts`: StyleSheet definitions for top bar container, left items, and title text.
- `utils.ts`: Bar color theme constants (`TOP_APP_BAR_COLORS`).
- `README.md`: Component documentation and usage examples.

## Types & Interfaces

```typescript
export type TopAppBarProps = {
  title: string;
  onMenuPress?: () => void;
  right?: ReactNode;
};
```

## Logic & Utils

- Integrates `useSafeAreaInsets` to pad top status bar space internally while extending the navy background to screen top edge.

## Styles

- Primary navy background (`colors.primary`)
- Bold title typography with `typography.headlineMd` and `colors.onPrimary`

## Usage Example

```tsx
import { TopAppBar } from '@/components/TopAppBar';
import { Badge } from '@/components/Badge';

<TopAppBar
  title="Hoja de Ruta"
  onMenuPress={() => openDrawer()}
  right={<Badge label="Pendientes: 12" variant="secondary" />}
/>
```
