import { useCallback, useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Badge,
  BottomNavBar,
  DrawerMenu,
  EmptyState,
  ErrorState,
  FeedbackDialog,
  LoadingState,
  NavigationDrawer,
  ReorderModal,
  ScreenContainer,
  TopAppBar,
} from '@/components';
import { useAuth } from '@/auth/AuthContext';
import { useSync } from '@/sync/SyncProvider';
import { getListMode, setListMode, isDateClosedLocally, markDateClosedLocally, type ListMode } from '@/sync/localSettings';
import { getClientOrder, setClientOrder, applyClientOrder, clearClientOrder } from '@/sync/clientOrder';
import { getAddedClients, addClientToDayroute, removeAddedClientFromDayroute, clearAddedClients } from '@/sync/addedClients';
import * as localRouteStore from '@/db/localRouteStore';
import { clearMarksForDate } from '@/db/clientMarks';
import * as outbox from '@/db/outbox';
import { queuedWrites } from '@/sync/queuedWrites';
import { useHojaDeRuta } from '@/hooks/useHojaDeRuta';
import { useClientMarks } from '@/hooks/useClientMarks';
import { repartoApiClient } from '@/api/repartoApiClient';
import type { ClienteBusqueda, ClienteVisita } from '@/api/types';
import { AltaClienteDialog } from '@/screens/AltaClienteDialog';
import { ControlDePlayaDialog } from '@/screens/ControlDePlayaDialog';
import { GastosDeRepartoDialog } from '@/screens/GastosDeRepartoDialog';
import { RegistrarVisitaDialog } from '@/screens/RegistrarVisitaDialog';
import { StockEnRutaDialog } from '@/screens/StockEnRutaDialog';
import { SyncTab } from '@/screens/SyncTab';
import { isoDate } from '@/screens/DateSelectionScreen/utils';
import { colors } from '@/theme/tokens';
import type { HojaDeRutaScreenProps, TabKey } from './types';
import { styles } from './styles';
import {
  clienteBusquedaAVisita,
  combineClientes,
  DRAWER_ITEMS,
  sinMovimiento,
} from './utils';
import { PendientesTab, RepasoTab, SrvTecTab, TodosTab } from './components';

export type { HojaDeRutaScreenProps };

export function HojaDeRutaScreen({ route, navigation }: HojaDeRutaScreenProps) {
  const { deliveryDate } = route.params;
  const todayIso = isoDate(new Date());
  const isToday = deliveryDate === todayIso;
  const { user, logout } = useAuth();
  const { counts: syncCounts } = useSync();
  const routeId = repartoApiClient.getSession()?.routeId ?? null;
  const marks = useClientMarks(routeId, deliveryDate);

  const [activeTab, setActiveTab] = useState<TabKey>('todos');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [stockEnRutaVisible, setStockEnRutaVisible] = useState(false);
  const [controlDePlayaVisible, setControlDePlayaVisible] = useState(false);
  const [altaClienteVisible, setAltaClienteVisible] = useState(false);
  const [gastosVisible, setGastosVisible] = useState(false);
  const [gestionesCliente, setGestionesCliente] = useState<ClienteVisita | null>(null);
  const [reorderVisible, setReorderVisible] = useState(false);
  const [cerrarHojaConfirmVisible, setCerrarHojaConfirmVisible] = useState(false);
  const [cerrarHojaBloqueadoVisible, setCerrarHojaBloqueadoVisible] = useState(false);
  const [isClosedLocally, setIsClosedLocally] = useState(false);

  useEffect(() => {
    void isDateClosedLocally(deliveryDate).then(setIsClosedLocally);
  }, [deliveryDate]);

  const [listMode, setListModeState] = useState<ListMode>('interactiva');
  useEffect(() => {
    void getListMode().then(setListModeState);
  }, []);
  const changeListMode = (m: ListMode) => {
    setListModeState(m);
    void setListMode(m);
  };

  // Custom client order — persisted locally per route+date. null = server order.
  const [customOrder, setCustomOrder] = useState<number[] | null>(null);
  useEffect(() => {
    void getClientOrder(routeId, deliveryDate).then(setCustomOrder);
  }, [routeId, deliveryDate]);

  const handleSaveOrder = useCallback(
    (orderedIds: number[]) => {
      setCustomOrder(orderedIds);
      void setClientOrder(routeId, deliveryDate, orderedIds);
      void queuedWrites.reordenarClientes({
        date: deliveryDate,
        partnerIds: orderedIds,
      });
    },
    [routeId, deliveryDate],
  );

  const { data, isLoading, isError, refetch, isRefetching } = useHojaDeRuta(deliveryDate);
  const isReadOnly = !isToday || Boolean(data?.soloLectura) || isClosedLocally;

  const drawerItems = useMemo(() => {
    if (!isReadOnly) return DRAWER_ITEMS;
    return DRAWER_ITEMS.filter((item) => item.key !== 'alta_cliente' && item.key !== 'cerrar_hoja');
  }, [isReadOnly]);

  // Locally added clients for this route + date
  const [localAddedClients, setLocalAddedClients] = useState<ClienteVisita[]>([]);
  useEffect(() => {
    void getAddedClients(routeId, deliveryDate).then(setLocalAddedClients);
  }, [routeId, deliveryDate]);

  const [agregandoPartnerId, setAgregandoPartnerId] = useState<number | null>(null);
  const [quitandoPartnerId, setQuitandoPartnerId] = useState<number | null>(null);

  const handleAgregarARuta = useCallback(
    async (c: ClienteBusqueda) => {
      setAgregandoPartnerId(c.partnerId);
      try {
        const nuevoCliente = clienteBusquedaAVisita(c, false);
        const updated = await addClientToDayroute(routeId, deliveryDate, nuevoCliente);
        setLocalAddedClients(updated);

        try {
          await queuedWrites.agregarClienteARuta(deliveryDate, c.partnerId);
          await refetch();
        } catch {
          // Si no hay red, queda guardado en local y outbox
        }
      } finally {
        setAgregandoPartnerId(null);
      }
    },
    [routeId, deliveryDate, refetch],
  );

  const [clienteAQuitar, setClienteAQuitar] = useState<ClienteVisita | ClienteBusqueda | null>(null);

  const handleQuitarDeRuta = useCallback((c: ClienteVisita | ClienteBusqueda) => {
    setClienteAQuitar(c);
  }, []);

  const confirmarQuitarDeRuta = useCallback(async () => {
    if (!clienteAQuitar) return;
    const partnerId = clienteAQuitar.partnerId;
    setQuitandoPartnerId(partnerId);
    try {
      const updated = await removeAddedClientFromDayroute(routeId, deliveryDate, partnerId);
      setLocalAddedClients(updated);
      await queuedWrites.quitarClienteDeRuta(deliveryDate, partnerId);
      await refetch();
    } catch {
      // Silencioso o registrado en outbox
    } finally {
      setQuitandoPartnerId(null);
      setClienteAQuitar(null);
    }
  }, [clienteAQuitar, routeId, deliveryDate, refetch]);

  const clientesRaw = useMemo(() => data?.clientes ?? [], [data]);
  const combinedClientes = useMemo(
    () => combineClientes(clientesRaw, localAddedClients),
    [clientesRaw, localAddedClients],
  );

  // Apply the repartidor's saved order on top of the server-returned sequence.
  const clientes = useMemo(() => applyClientOrder(combinedClientes, customOrder), [combinedClientes, customOrder]);

  const pendientes = useMemo(() => clientes.filter(sinMovimiento), [clientes]);
  const repasoList = useMemo(
    () => clientes.filter((c) => c.resultado === 'ausente' || marks.repaso.has(c.partnerId)),
    [clientes, marks.repaso],
  );
  const srvTecList = useMemo(
    () => clientes.filter((c) => marks.srvTec.has(c.partnerId)),
    [clientes, marks.srvTec],
  );

  const pendingCount = pendientes.length;
  const enRepasoCount = repasoList.length;

  const navItems = [
    { key: 'todos', label: 'Todos', icon: 'list-alt' as const },
    { key: 'pendientes', label: 'Pendientes', icon: 'assignment-late' as const, showBadge: pendingCount > 0 },
    { key: 'repaso', label: 'Repaso', icon: 'history' as const, showBadge: enRepasoCount > 0 },
    { key: 'srv_tec', label: 'Srv Tec', icon: 'engineering' as const, showBadge: srvTecList.length > 0 },
    { key: 'sync', label: 'Sync', icon: 'sync' as const, showBadge: syncCounts.unsynced > 0 },
  ];

  function renderBody() {
    if (activeTab === 'sync') return <SyncTab />;

    if (isLoading) return <LoadingState label="Cargando hoja de ruta..." />;
    if (isError) {
      return (
        <ErrorState
          message="No pudimos cargar la hoja de ruta. Revisá tu conexión e intentá de nuevo."
          onRetry={refetch}
        />
      );
    }
    if (!data?.hojaRuta) {
      return (
        <EmptyState
          icon="event-busy"
          title="Sin hoja de ruta para esta fecha"
          message={
            isReadOnly
              ? `No hay una hoja de ruta registrada para el ${deliveryDate}. En modo consulta únicamente se pueden ver hojas ya existentes.`
              : `Todavía no hay una hoja de ruta asignada para el ${deliveryDate}.`
          }
          actionLabel="Actualizar"
          onAction={() => refetch()}
        />
      );
    }

    if (activeTab === 'todos') {
      return (
        <TodosTab
          clientes={clientes}
          mode={listMode}
          onModeChange={changeListMode}
          marks={marks}
          deliveryDate={deliveryDate}
          onGestiones={setGestionesCliente}
          onAgregarARuta={handleAgregarARuta}
          onQuitarDeRuta={handleQuitarDeRuta}
          agregandoId={agregandoPartnerId}
          quitandoId={quitandoPartnerId}
          onOpenReorder={() => setReorderVisible(true)}
          readOnly={isReadOnly}
        />
      );
    }
    if (activeTab === 'pendientes') {
      return (
        <PendientesTab
          pendientes={pendientes}
          marks={marks}
          onGestiones={setGestionesCliente}
          onQuitarDeRuta={handleQuitarDeRuta}
          readOnly={isReadOnly}
        />
      );
    }
    if (activeTab === 'repaso') {
      return (
        <RepasoTab
          repaso={repasoList}
          marks={marks}
          onGestiones={setGestionesCliente}
          onQuitarDeRuta={handleQuitarDeRuta}
          readOnly={isReadOnly}
        />
      );
    }
    return (
      <SrvTecTab
        srvTec={srvTecList}
        marks={marks}
        onGestiones={setGestionesCliente}
        onQuitarDeRuta={handleQuitarDeRuta}
        readOnly={isReadOnly}
      />
    );
  }

  const handleConfirmCerrarHoja = useCallback(async () => {
    setCerrarHojaConfirmVisible(false);
    if (syncCounts.unsynced > 0) {
      setCerrarHojaBloqueadoVisible(true);
      return;
    }
    await markDateClosedLocally(deliveryDate);
    setIsClosedLocally(true);
    if (routeId != null) {
      await localRouteStore.clearLocalDayroute(routeId, deliveryDate);
      await clearMarksForDate(routeId, deliveryDate);
      await clearAddedClients(routeId, deliveryDate);
      await clearClientOrder(routeId, deliveryDate);
    }
    await outbox.purgeDone();
    await logout();
    navigation.replace('Login');
  }, [deliveryDate, routeId, syncCounts.unsynced, logout, navigation]);

  return (
    <ScreenContainer padded={false} edges={['left', 'right']}>
      <StatusBar style="light" />
      <TopAppBar
        title={`Hoja de Ruta · ${deliveryDate}`}
        onMenuPress={() => setDrawerVisible(true)}
        right={
          <View style={styles.topBadges}>
            {isReadOnly ? (
              <Badge label="Solo lectura" variant="neutral" size="md" />
            ) : (
              <Badge label={`Pendientes: ${isRefetching ? '…' : pendingCount}`} variant="secondary" size="md" />
            )}
            {enRepasoCount > 0 ? (
              <Badge label={`En repaso: ${enRepasoCount}`} variant="neutral" size="md" />
            ) : null}
          </View>
        }
      />

      {isReadOnly ? (
        <View style={styles.readOnlyBanner}>
          <MaterialIcons name="visibility" size={16} color={colors.primary} />
          <Text style={styles.readOnlyBannerText}>
            Modo consulta ({deliveryDate}): solo lectura. No se pueden registrar visitas ni modificar la hoja.
          </Text>
        </View>
      ) : null}

      <NavigationDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)}>
        <DrawerMenu
          items={drawerItems.map((item) => ({
            ...item,
            onPress: () => {
              setDrawerVisible(false);
              if (item.key === 'stock_en_ruta') setStockEnRutaVisible(true);
              else if (item.key === 'control_de_playa') setControlDePlayaVisible(true);
              else if (item.key === 'alta_cliente') setAltaClienteVisible(true);
              else if (item.key === 'gastos_de_reparto') setGastosVisible(true);
              else if (item.key === 'cerrar_hoja') {
                if (syncCounts.unsynced > 0) {
                  setCerrarHojaBloqueadoVisible(true);
                } else {
                  setCerrarHojaConfirmVisible(true);
                }
              }
            },
          }))}
          user={user ? { name: user.displayName, role: user.role, initials: user.initials } : undefined}
        />
      </NavigationDrawer>

      <View style={styles.body}>{renderBody()}</View>

      <BottomNavBar items={navItems} activeKey={activeTab} onChange={(key) => setActiveTab(key as TabKey)} />

      <RegistrarVisitaDialog
        visible={gestionesCliente !== null}
        onClose={() => setGestionesCliente(null)}
        deliveryDate={deliveryDate}
        cliente={gestionesCliente}
        readOnly={isReadOnly}
        onSaved={async (saved) => {
          if (saved) {
            await addClientToDayroute(routeId, deliveryDate, saved);
          }
          void refetch();
          void getAddedClients(routeId, deliveryDate).then(setLocalAddedClients);
        }}
      />

      <StockEnRutaDialog
        visible={stockEnRutaVisible}
        onClose={() => setStockEnRutaVisible(false)}
        deliveryDate={deliveryDate}
      />

      <ControlDePlayaDialog
        visible={controlDePlayaVisible}
        onClose={() => {
          setControlDePlayaVisible(false);
          void refetch();
        }}
        onApproved={() => void refetch()}
        onSaved={() => void refetch()}
        deliveryDate={deliveryDate}
      />

      <AltaClienteDialog
        visible={altaClienteVisible}
        onClose={() => setAltaClienteVisible(false)}
        deliveryDate={deliveryDate}
        onCreated={() => {
          setAltaClienteVisible(false);
          void refetch();
        }}
      />

      <GastosDeRepartoDialog
        visible={gastosVisible}
        onClose={() => setGastosVisible(false)}
        deliveryDate={deliveryDate}
      />

      <ReorderModal
        visible={reorderVisible}
        items={clientes.map((c) => ({
          id: c.partnerId,
          label: c.nombre,
          sublabel: c.direccion,
        }))}
        onSave={handleSaveOrder}
        onClose={() => setReorderVisible(false)}
      />

      <FeedbackDialog
        visible={clienteAQuitar !== null}
        type="warning"
        title="Quitar de la hoja de ruta"
        message={`¿Deseas quitar a "${clienteAQuitar?.nombre}" de la hoja de ruta de hoy?`}
        confirmText="Quitar"
        cancelText="Cancelar"
        confirmLoading={quitandoPartnerId !== null}
        onConfirm={confirmarQuitarDeRuta}
        onCancel={() => setClienteAQuitar(null)}
        onClose={() => setClienteAQuitar(null)}
      />

      <FeedbackDialog
        visible={cerrarHojaBloqueadoVisible}
        type="confirm"
        title="Sincronización pendiente"
        message={`No podés cerrar la hoja de ruta porque aún tenés ${syncCounts.unsynced} cambio(s) pendiente(s) de sincronizar con el servidor.\n\nPor favor, conectate a internet y sincronizá desde la pestaña 'Sync' antes de cerrar la hoja.`}
        confirmText="Ir a Sync"
        cancelText="Entendido"
        onConfirm={() => {
          setCerrarHojaBloqueadoVisible(false);
          setActiveTab('sync');
        }}
        onCancel={() => setCerrarHojaBloqueadoVisible(false)}
        onClose={() => setCerrarHojaBloqueadoVisible(false)}
      />

      <FeedbackDialog
        visible={cerrarHojaConfirmVisible}
        type="confirm"
        title="Confirmar Cierre de Hoja"
        message="¿Está seguro de que desea cerrar la hoja de ruta? Una vez confirmada la acción, el día quedará en modo de solo lectura, se liberará el almacenamiento local del dispositivo y se cerrará su sesión."
        confirmText="Cerrar Hoja"
        cancelText="Cancelar"
        onConfirm={handleConfirmCerrarHoja}
        onCancel={() => setCerrarHojaConfirmVisible(false)}
        onClose={() => setCerrarHojaConfirmVisible(false)}
      />
    </ScreenContainer>
  );
}

