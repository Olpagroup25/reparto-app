# LoadingState

Full-container or inline loading indicator centered with an optional status label.

## File Structure

- `index.tsx`: Core component implementation and public exports.
- `types.ts`: Props interface (`LoadingStateProps`).
- `styles.ts`: StyleSheet definitions for centered container and label text.
- `utils.ts`: Default constants such as `DEFAULT_LOADING_LABEL`.
- `README.md`: Component documentation and usage examples.

## Types & Interfaces

```typescript
export type LoadingStateProps = {
  label?: string;
};
```

## Logic & Utils

- `DEFAULT_LOADING_LABEL`: Default string value `'Cargando...'`.

## Styles

- Centered flex layout
- Large `ActivityIndicator` styled with `colors.primary`
- Typography styled with `colors.onSurfaceVariant`

## Usage Example

```tsx
import { LoadingState } from '@/components/LoadingState';

<LoadingState label="Sincronizando datos..." />
```
