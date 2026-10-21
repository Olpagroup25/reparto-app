# Dialog

A modal dialog component presenting a centered card on a semi-transparent scrim with a scrollable body, customizable headers, and dedicated footer actions.

## File Structure

```
Dialog/
├── types.ts       # Dialog props interface
├── styles.ts      # Scrim, card panel, header, and footer styles
├── utils.ts       # Header presence helper
├── index.tsx      # Main Dialog modal component
└── README.md      # Documentation
```

## Types & Interfaces

```typescript
import { ReactNode } from 'react';

export type DialogProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};
```

## Logic & Features

- Responsive panel: capped at `maxWidth: 400` and `maxHeight: '85%'`.
- Scrollable content area allowing form inputs and keyboards without overflow clipping.
- Edge-to-edge header option for custom brand/color headers.
- Background backdrop press dismisses the dialog.

## Usage Example

```tsx
import { Dialog } from '@/components/Dialog';
import { Button } from '@/components/Button';

<Dialog
  visible={isOpen}
  onClose={() => setIsOpen(false)}
  title="Control de Playa"
  footer={
    <>
      <Button title="Cancelar" variant="secondary" onPress={() => setIsOpen(false)} />
      <Button title="Guardar" variant="primary" onPress={handleSave} />
    </>
  }
>
  <Text>Formulario o información del control de playa...</Text>
</Dialog>
```
