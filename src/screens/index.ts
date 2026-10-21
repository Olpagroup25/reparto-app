// Screens
export { AccessScreen } from './AccessScreen';
export type { AccessScreenProps } from './AccessScreen/types';

export { DateSelectionScreen } from './DateSelectionScreen';
export type { DateSelectionScreenProps } from './DateSelectionScreen/types';

export { LoginScreen } from './LoginScreen';
export type { LoginScreenProps } from './LoginScreen/types';

export { HojaDeRutaScreen } from './HojaDeRutaScreen';
export type {
  HojaDeRutaScreenProps,
  TabKey,
  ClientCardVariant,
  ClientCardProps,
  TodosTabProps,
  PendientesTabProps,
  RepasoTabProps,
  SrvTecTabProps,
} from './HojaDeRutaScreen/types';

export { SyncTab } from './SyncTab';
export type { OutboxRowProps, SyncStatusVariant } from './SyncTab/types';

// Dialogs
export { ActivarClientePropioDialog } from './ActivarClientePropioDialog';
export type { ActivarClientePropioDialogProps } from './ActivarClientePropioDialog/types';

export { AltaClienteDialog } from './AltaClienteDialog';
export type { AltaClienteDialogProps } from './AltaClienteDialog/types';

export { ControlDePlayaDialog } from './ControlDePlayaDialog';
export type { ControlDePlayaDialogProps } from './ControlDePlayaDialog/types';

export { GastosDeRepartoDialog } from './GastosDeRepartoDialog';
export type { GastosDeRepartoDialogProps, VistaGasto } from './GastosDeRepartoDialog/types';

export { RegistrarVisitaDialog } from './RegistrarVisitaDialog';
export type {
  RegistrarVisitaDialogProps,
  ModoVisita,
  MedioPago,
  ResultadoVisita,
  LineaArticuloEditable,
  LineaEnvaseEditable,
  FeedbackState,
} from './RegistrarVisitaDialog/types';

export { StockEnRutaDialog } from './StockEnRutaDialog';
export type { StockEnRutaDialogProps, StockCampo, StockCampoKey } from './StockEnRutaDialog/types';
