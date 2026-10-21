# BrandMark

The primary logo mark for INSA, maintaining a fixed aspect ratio across screen headers and authentication screens.

## File Structure

```
BrandMark/
├── types.ts       # Size definitions and props
├── styles.ts      # Component styling
├── utils.ts       # Aspect ratio and dimension calculations
├── index.tsx      # Main brand mark component
└── README.md      # Documentation
```

## Types & Interfaces

```typescript
export type BrandMarkSize = 'md' | 'lg';

export type BrandMarkProps = {
  size?: BrandMarkSize;
};
```

## Logic & Utils

- `BRANDMARK_ASPECT_RATIO`: Defined as `556 / 753`.
- `getBrandMarkDimensions(size)`: Returns `{ width: 200, height: 148 }` for `lg` and `{ width: 140, height: 103 }` for `md`.

## Usage Example

```tsx
import { BrandMark } from '@/components/BrandMark';

// Standard login header
<BrandMark size="lg" />

// Compact header in dialogs
<BrandMark size="md" />
```
