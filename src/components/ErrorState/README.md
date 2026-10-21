# ErrorState

A full-screen error feedback view that communicates failures with clear messaging and an actionable retry button.

## File Structure

```
ErrorState/
├── types.ts       # Props definition
├── styles.ts      # Error circle badge and text styles
├── utils.ts       # Default title and message constants
├── index.tsx      # Main component
└── README.md      # Documentation
```

## Types & Interfaces

```typescript
export type ErrorStateProps = {
  title?: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
};
```

## Logic & Constants

- Defaults:
  - `DEFAULT_ERROR_TITLE`: "Algo salió mal"
  - `DEFAULT_ERROR_MESSAGE`: "No pudimos completar la operación. Intenta nuevamente."
  - `DEFAULT_RETRY_LABEL`: "Reintentar"

## Usage Example

```tsx
import { ErrorState } from '@/components/ErrorState';

<ErrorState
  title="Error de sincronización"
  message="No fue posible conectar con el servidor de Odoo."
  onRetry={refetchOrders}
/>
```
