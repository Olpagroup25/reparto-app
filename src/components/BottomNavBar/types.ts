import { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

export type BottomNavItem = {
  key: string;
  label: string;
  icon: IconName;
  /** Small red dot, matching the "!" indicator seen on the Pendientes tab. */
  showBadge?: boolean;
};

export type BottomNavBarProps = {
  items: BottomNavItem[];
  activeKey: string;
  onChange: (key: string) => void;
};
