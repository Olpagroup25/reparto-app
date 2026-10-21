import { ReactNode } from 'react';

export type DialogProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  /**
   * Custom edge-to-edge header (e.g. control_de_playa's navy bar with a logo
   * chip), rendered instead of the plain `title` bar when provided.
   */
  header?: ReactNode;
  children: ReactNode;
  /** Action row, e.g. Cancelar/Guardar Buttons. */
  footer?: ReactNode;
};
