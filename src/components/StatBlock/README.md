# StatBlock

Displays labeled numerical or financial statistics (e.g., total sales, delivered counts, overdue invoices) with normal and emphasized display sizes, customizable alignment, and optional children like status badges.

## File Structure

- `index.tsx`: Core component implementation and public exports.
- `types.ts`: Props interface (`StatBlockProps`) and alignment type (`StatBlockAlign`).
- `styles.ts`: StyleSheet definitions for label, standard value, and emphasized display value.
- `utils.ts`: Flex alignment helper (`getStatBlockAlignItems`).
- `README.md`: Component documentation and usage examples.

## Types & Interfaces

```typescript
export type StatBlockAlign = 'left' | 'center' | 'right';

export type StatBlockProps = {
  label: string;
  value: string;
  align?: StatBlockAlign;
  emphasis?: boolean;
  valueColor?: string;
  children?: ReactNode;
};
```

## Logic & Utils

- `getStatBlockAlignItems(align?: StatBlockAlign)`: Maps alignment prop to React Native Flex alignment (`flex-start`, `center`, `flex-end`).

## Styles

- Uppercase bold label with `colors.outline`
- Standard value with `typography.headlineMd`
- Emphasized value with `typography.display` for hero numbers

## Usage Example

```tsx
import { StatBlock } from '@/components/StatBlock';

<StatBlock
  label="Saldo Total"
  value="$125.400"
  emphasis
  valueColor="#1565C0"
/>
```
