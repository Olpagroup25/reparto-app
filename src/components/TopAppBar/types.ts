import { ReactNode } from 'react';

export type TopAppBarProps = {
  title: string;
  onMenuPress?: () => void;
  /** Right-side slot, e.g. a count Badge like "Pendientes: 39". */
  right?: ReactNode;
};
