import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import type { ClienteBusqueda, ClienteVisita } from '@/api/types';
import type { ClientMarksApi } from '@/hooks/useClientMarks';
import type { ListMode } from '@/sync/localSettings';

export type HojaDeRutaScreenProps = NativeStackScreenProps<RootStackParamList, 'HojaDeRuta'>;

export type TabKey = 'todos' | 'pendientes' | 'repaso' | 'srv_tec' | 'sync';

export type ClientCardVariant = 'todos' | 'pendientes';

export type ListModeToggleProps = {
  mode: ListMode;
  onChange: (m: ListMode) => void;
};

export type ClientCardProps = {
  client: ClienteVisita;
  variant: ClientCardVariant;
  interactive?: boolean;
  isRepaso?: boolean;
  isSrvTec?: boolean;
  onGestiones: (client: ClienteVisita) => void;
  onToggleRepaso?: () => void;
  onToggleSrvTec?: () => void;
  onQuitarDeRuta?: (client: ClienteVisita) => void;
  onLongPress?: () => void;
};

export type ResultRowProps = {
  cliente: ClienteBusqueda | ClienteVisita;
  enRuta: boolean;
  onPress: () => void;
  onAgregarARuta?: () => void;
  onQuitarDeRuta?: () => void;
  onActivarPropio?: () => void;
  agregando?: boolean;
  quitando?: boolean;
};

export type TodosTabProps = {
  clientes: ClienteVisita[];
  mode: ListMode;
  onModeChange: (m: ListMode) => void;
  marks: ClientMarksApi;
  deliveryDate: string;
  onGestiones: (client: ClienteVisita) => void;
  onAgregarARuta: (client: ClienteBusqueda) => Promise<void>;
  onQuitarDeRuta: (client: ClienteVisita | ClienteBusqueda) => void;
  agregandoId: number | null;
  quitandoId: number | null;
  onOpenReorder: () => void;
  readOnly?: boolean;
};

export type PendientesTabProps = {
  pendientes: ClienteVisita[];
  marks: ClientMarksApi;
  onGestiones: (client: ClienteVisita) => void;
  onQuitarDeRuta?: (client: ClienteVisita) => void;
  readOnly?: boolean;
};

export type RepasoTabProps = {
  repaso: ClienteVisita[];
  marks: ClientMarksApi;
  onGestiones: (client: ClienteVisita) => void;
  onQuitarDeRuta?: (client: ClienteVisita) => void;
  readOnly?: boolean;
};

export type SrvTecTabProps = {
  srvTec: ClienteVisita[];
  marks: ClientMarksApi;
  onGestiones: (client: ClienteVisita) => void;
  onQuitarDeRuta?: (client: ClienteVisita) => void;
  readOnly?: boolean;
};
