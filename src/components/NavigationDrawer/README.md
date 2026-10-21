# NavigationDrawer

Generic slide-in navigation drawer modal container with animated entrance/exit, backdrop tap dismiss, and safe-area insets management.

## File Structure

- `index.tsx`: Core component implementation and public exports.
- `types.ts`: Props interface (`NavigationDrawerProps`).
- `styles.ts`: StyleSheet definitions for backdrop and panel container.
- `utils.ts`: Default constants (`DEFAULT_DRAWER_WIDTH`, `DRAWER_ANIMATION_DURATION`).
- `README.md`: Component documentation and usage examples.

## Types & Interfaces

```typescript
export type NavigationDrawerProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: number;
};
```

## Logic & Utils

- `DEFAULT_DRAWER_WIDTH`: Default width of 320px.
- `DRAWER_ANIMATION_DURATION`: Smooth timing duration (250ms).
- Safe area inset calculation for status bar and bottom home indicators.

## Styles

- Full-screen transparent Modal with dark overlay backdrop (`rgba(0,0,0,0.4)`)
- Slide panel with `radii.lg` right corners and `elevation.level2`

## Usage Example

```tsx
import { NavigationDrawer } from '@/components/NavigationDrawer';
import { DrawerMenu } from '@/components/DrawerMenu';

<NavigationDrawer visible={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
  <DrawerMenu onNavigate={...} />
</NavigationDrawer>
```
