# ReorderModal

Bottom-sheet modal for reordering the delivery route clients list using large up/down arrow buttons suitable for one-handed/field use.

## File Structure

- `index.tsx`: Core component implementation with reordering state and public exports.
- `types.ts`: Props interface (`ReorderModalProps`) and item interface (`ReorderItem`).
- `styles.ts`: StyleSheet definitions for overlay sheet, rows, arrows, and footer buttons.
- `utils.ts`: Array manipulation helpers (`reorderItems`, `extractOrderedIds`).
- `README.md`: Component documentation and usage examples.

## Types & Interfaces

```typescript
export type ReorderItem = {
  id: number;
  label: string;
  sublabel?: string;
};

export type ReorderModalProps = {
  visible: boolean;
  items: ReorderItem[];
  onSave: (orderedIds: number[]) => void;
  onClose: () => void;
};
```

## Logic & Utils

- `reorderItems<T>(list: T[], index: number, direction: -1 | 1): T[]`: Immutably swaps elements in the list.
- `extractOrderedIds(items: ReorderItem[]): number[]`: Maps items to array of numerical IDs.
- State sync with incoming `items` upon modal opening.

## Styles

- Modal bottom-sheet layout (`borderTopLeftRadius: radii.xl`, `elevation.level2`)
- Position badge indicator and clean row separation
- Generously sized touch targets for up/down arrow controls

## Usage Example

```tsx
import { ReorderModal } from '@/components/ReorderModal';

<ReorderModal
  visible={isReorderOpen}
  items={clientList}
  onSave={(newOrderIds) => saveRouteOrder(newOrderIds)}
  onClose={() => setReorderOpen(false)}
/>
```
