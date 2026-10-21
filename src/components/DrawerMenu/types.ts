import { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

export type DrawerMenuItem = {
  key: string;
  icon: IconName;
  label: string;
  onPress: () => void;
  /** "Cerrar Hoja" gets this emphasis treatment in every hoja_de_ruta drawer. */
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
  /**
   * The drawer footer isn't consistent across screens: hoja_de_ruta_pedidos
   * shows a user profile block, hoja_de_ruta_no_sync shows a version string,
   * others show neither. Pass whichever applies, or omit both.
   */
  user?: DrawerMenuUser;
  versionLabel?: string;
};
