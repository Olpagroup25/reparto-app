# ScreenContainer

Base layout container wrapping screens with safe-area handling, standard mobile background, optional scrolling, and configurable edge padding.

## File Structure

- `index.tsx`: Core component implementation and public exports.
- `types.ts`: Props interface (`ScreenContainerProps`).
- `styles.ts`: StyleSheet definitions for safe area wrapper and content padding.
- `utils.ts`: Default constants (`DEFAULT_SCREEN_EDGES`).
- `README.md`: Component documentation and usage examples.

## Types & Interfaces

```typescript
export type ScreenContainerProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
};
```

## Logic & Utils

- `DEFAULT_SCREEN_EDGES`: Default edge array `['top', 'left', 'right']`.
- If top/bottom app bars are used, edges can be adjusted (e.g. `['left', 'right']`) to prevent double padding.

## Styles

- `colors.background` background fill
- Standard mobile margin padding (`spacing.marginMobile`)

## Usage Example

```tsx
import { ScreenContainer } from '@/components/ScreenContainer';

<ScreenContainer scroll padded>
  <Text>Screen Content</Text>
</ScreenContainer>
```
