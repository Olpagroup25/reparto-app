# DrawerMenu

The operations drawer content layout, featuring section titles, list items, action highlights (e.g. "Cerrar Hoja"), user profile info, and version tags.

## File Structure

```
DrawerMenu/
├── types.ts       # Items, user profile, and props definitions
├── styles.ts      # Menu layout, list container, and footer styles
├── utils.ts       # Initials parser utility
├── index.tsx      # Core drawer menu layout
└── README.md      # Documentation
```

## Types & Interfaces

```typescript
import { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

export type DrawerMenuItem = {
  key: string;
  icon: IconName;
  label: string;
  onPress: () => void;
  highlighted?: boolean;
};

export type DrawerMenuUser = {
  name: string;
  role: string;
  initials: string;
};

export type DrawerMenuProps = {
  title?: string;
  items: DrawerMenuItem[];
  user?: DrawerMenuUser;
  versionLabel?: string;
};
```

## Logic & Utils

- `getInitialsFromName(name)`: Extracts first and last initials from name strings for avatar presentation.
- Integrates with `ListItem` for consistent typography, leading icons, and hover/highlight states.

## Usage Example

```tsx
import { DrawerMenu, DrawerMenuItem } from '@/components/DrawerMenu';

const items: DrawerMenuItem[] = [
  { key: 'playa', icon: 'local-parking', label: 'Control de Playa', onPress: handlePlaya },
  { key: 'stock', icon: 'inventory', label: 'Stock en Ruta', onPress: handleStock },
  { key: 'cerrar', icon: 'lock', label: 'Cerrar Hoja', onPress: handleClose, highlighted: true },
];

<DrawerMenu
  title="Operaciones"
  items={items}
  user={{ name: 'Juan Repartidor', role: 'Conductor', initials: 'JR' }}
/>
```
