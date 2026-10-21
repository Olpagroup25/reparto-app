import { ReactNode } from 'react';

export type StatBlockAlign = 'left' | 'center' | 'right';

export type StatBlockProps = {
  label: string;
  value: string;
  align?: StatBlockAlign;
  /** Large "display" styling for hero stats like Saldo Final; compact headline for inline pairs like Saldo Facturas/Consumos otherwise. */
  emphasis?: boolean;
  valueColor?: string;
  /** e.g. a status Badge rendered below the value. */
  children?: ReactNode;
};
