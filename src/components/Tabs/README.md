# Tabs

Underlined tab bar switcher with active tab highlight indicator and optional count badges.

## File Structure

- `index.tsx`: Core component implementation and public exports.
- `types.ts`: Props interface (`TabsProps`) and tab item interface (`TabItem`).
- `styles.ts`: StyleSheet definitions for row container, tab item, and active highlight.
- `utils.ts`: Tab state helpers (`isTabActive`).
- `README.md`: Component documentation and usage examples.

## Types & Interfaces

```typescript
export type TabItem = {
  key: string;
  label: string;
  badgeCount?: number;
};

export type TabsProps = {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
};
```

## Logic & Utils

- `isTabActive(tabKey: string, activeKey: string)`: Compares keys to identify active tab.
- Integrates `Badge` component for numerical counters.

## Styles

- Segmented row layout with bottom border
- Active tab bottom indicator with `borderBottomColor: colors.primary` (4px)
- Tinted background for active tab (`primaryFixed` at 30% opacity)

## Usage Example

```tsx
import { Tabs } from '@/components/Tabs';

<Tabs
  tabs={[
    { key: 'pendientes', label: 'Pendientes', badgeCount: 5 },
    { key: 'entregados', label: 'Entregados', badgeCount: 12 },
  ]}
  activeKey={activeTab}
  onChange={(key) => setActiveTab(key)}
/>
```
