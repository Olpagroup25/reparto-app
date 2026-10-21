# RadioButton

Accessible radio button component with selected and disabled states, designed for single-choice lists and filter options.

## File Structure

- `index.tsx`: Core component implementation and public exports.
- `types.ts`: Props interface (`RadioButtonProps`).
- `styles.ts`: StyleSheet definitions for radio circle, selected dot, and label.
- `utils.ts`: Radio dimensional constants (`RADIO_SIZE`).
- `README.md`: Component documentation and usage examples.

## Types & Interfaces

```typescript
export type RadioButtonProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
};
```

## Logic & Utils

- Accessible `radio` role and `accessibilityState`
- Touch feedback and disabled interaction handling

## Styles

- 20px outer circle with primary outline when selected
- 10px inner primary dot when active
- Dimmed appearance when disabled (`opacity: 0.5`)

## Usage Example

```tsx
import { RadioButton } from '@/components/RadioButton';

<RadioButton
  label="Efectivo"
  selected={paymentMethod === 'cash'}
  onPress={() => setPaymentMethod('cash')}
/>
```
