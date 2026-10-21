# BottomNavBar

A bottom navigation bar designed for edge-to-edge screens with automatic safe-area bottom inset handling and active tab highlighting.

## File Structure

```
BottomNavBar/
├── types.ts       # BottomNavItem and BottomNavBarProps interfaces
├── styles.ts      # Tab bar and item styling
├── utils.ts       # Inset height calculations and color helpers
├── index.tsx      # Core navigation bar component
└── README.md      # Documentation
```

## Types & Interfaces

```typescript
import { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

export type BottomNavItem = {
  key: string;
  label: string;
  icon: IconName;
  showBadge?: boolean;
};

export type BottomNavBarProps = {
  items: BottomNavItem[];
  activeKey: string;
  onChange: (key: string) => void;
};
```

## Logic & Utils

- `calculateNavBarHeight(bottomInset: number)`: Calculates base 64px + safe area bottom inset to provide seamless padding for modern iOS and Android navigation bars.
- `getNavItemColor(active: boolean)`: Resolves active vs inactive icon and text colors.

## Usage Example

```tsx
import { BottomNavBar, BottomNavItem } from '@/components/BottomNavBar';

const NAV_ITEMS: BottomNavItem[] = [
  { key: 'pedidos', label: 'Pedidos', icon: 'local-shipping' },
  { key: 'pendientes', label: 'Pendientes', icon: 'assignment', showBadge: true },
  { key: 'resumen', label: 'Resumen', icon: 'insights' },
];

<BottomNavBar
  items={NAV_ITEMS}
  activeKey={currentTab}
  onChange={setCurrentTab}
/>
```
