# FeedbackDialog

An animated feedback dialog providing rich visual cues and confirmation prompts for operation results (success, error, warning, info, confirm, and loading).

## File Structure

```
FeedbackDialog/
├── types.ts       # Dialog types, props, and config interfaces
├── styles.ts      # Scrim, animated panel, and action layouts
├── utils.ts       # Icon and theme configs per feedback type
├── index.tsx      # Main animated dialog component
└── README.md      # Documentation
```

## Types & Interfaces

```typescript
export type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'confirm' | 'loading';

export type FeedbackDialogProps = {
  visible: boolean;
  type?: FeedbackType;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  confirmLoading?: boolean;
  autoCloseMs?: number;
};
```

## Feedback Types

- `success`: Green badge with `check-circle`, auto-dismissible.
- `error`: Red badge with `error-outline`.
- `warning`: Amber badge with `warning-amber`.
- `info`: Navy badge with `info-outline`.
- `confirm`: Action confirmation dialog with Cancel and Confirm buttons.
- `loading`: Indeterminate spinner modal with non-dismissible scrim.

## Usage Example

```tsx
import { FeedbackDialog } from '@/components/FeedbackDialog';

<FeedbackDialog
  visible={isSuccessVisible}
  type="success"
  message="La entrega fue registrada exitosamente."
  autoCloseMs={2500}
  onClose={() => setSuccessVisible(false)}
/>
```
