# Button

A standardized button component implementing all primary, ghost, success, and soft-filled variants across the INSA design system.

## File Structure

```
Button/
├── types.ts       # Variant, shape, and prop definitions
├── styles.ts      # Stylesheet and variant appearance configurations
├── utils.ts       # Radius and variant resolver utilities
├── index.tsx      # Core button component
└── README.md      # Documentation
```

## Types & Interfaces

```typescript
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'tertiary' | 'neutral';
export type ButtonShape = 'pill' | 'base' | 'md';

export type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  shape?: ButtonShape;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};
```

## Variants & Shapes

### Variants
- `primary`: Navy fill with white text for main CTAs.
- `secondary`: Ghost button with navy outline.
- `success`: Green fill with white text for approvals and completions.
- `tertiary`: Fixed tertiary background for soft-action menus.
- `neutral`: Low-contrast surface container background for subtle/cancel actions.

### Shapes
- `pill` (`radii.full`): Standard for bottom actions and FABs.
- `md` (`radii.md` / 12px): Standard for empty state actions.
- `base` (`radii.base` / 8px): Standard for dialog and stacked menus.

## Usage Example

```tsx
import { Button } from '@/components/Button';

// Primary CTA
<Button title="Continuar" onPress={handleNext} fullWidth />

// Loading state
<Button title="Guardando..." loading />

// Secondary Ghost Button
<Button title="Cancelar" variant="secondary" shape="base" onPress={handleCancel} />
```
