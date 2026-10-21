import { ReactNode } from 'react';

export type NavigationDrawerProps = {
  visible: boolean;
  onClose: () => void;
  /** Menu content — typically a <DrawerMenu />, but kept generic so this
   * container isn't coupled to one specific piece of content. */
  children: ReactNode;
  width?: number;
};
