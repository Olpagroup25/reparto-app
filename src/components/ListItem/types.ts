import { ComponentProps, ReactNode } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

export type ListItemProps = {
  title: string;
  subtitle?: string;
  leadingIcon?: IconName;
  trailing?: ReactNode;
  /** Emphasis treatment used e.g. for "Cerrar Hoja" in the nav drawer. */
  highlighted?: boolean;
  onPress?: () => void;
};
