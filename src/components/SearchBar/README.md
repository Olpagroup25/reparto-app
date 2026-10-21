# SearchBar

Text search input field with integrated search icon, quick clear button, and optional filter icon button.

## File Structure

- `index.tsx`: Core component implementation and public exports.
- `types.ts`: Props interface (`SearchBarProps`).
- `styles.ts`: StyleSheet definitions for row wrapper, input, and icon positioning.
- `utils.ts`: Default constants (`DEFAULT_SEARCH_PLACEHOLDER`).
- `README.md`: Component documentation and usage examples.

## Types & Interfaces

```typescript
export type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
};
```

## Logic & Utils

- Automatic clear button display when `value.length > 0`
- `DEFAULT_SEARCH_PLACEHOLDER`: Default value `'Buscar...'`
- Optional filter action integration via `IconButton`

## Styles

- Rounded container with `radii.md`
- Leading search icon absolute overlay with proper padding adjustments
- Clear button with generous hitSlop

## Usage Example

```tsx
import { SearchBar } from '@/components/SearchBar';

<SearchBar
  value={query}
  onChangeText={setQuery}
  placeholder="Buscar cliente..."
  onFilterPress={() => openFilterModal()}
/>
```
