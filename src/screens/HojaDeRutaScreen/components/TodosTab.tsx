import { useEffect, useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import {
  Button,
  EmptyState,
  FloatingActionButton,
  SearchBar,
} from '@/components';
import { repartoApiClient } from '@/api/repartoApiClient';
import type { ClienteBusqueda } from '@/api/types';
import { AltaClienteDialog } from '@/screens/AltaClienteDialog';
import { ActivarClientePropioDialog } from '@/screens/ActivarClientePropioDialog';
import { spacing } from '@/theme/tokens';
import { styles } from '@/screens/HojaDeRutaScreen/styles';
import type { TodosTabProps } from '@/screens/HojaDeRutaScreen/types';
import { clienteBusquedaAVisita, normalizarTexto } from '@/screens/HojaDeRutaScreen/utils';
import { ClientCard } from './ClientCard';
import { ListModeToggle } from './ListModeToggle';
import { ResultRow } from './ResultRow';

export function TodosTab({
  clientes,
  mode,
  onModeChange,
  marks,
  deliveryDate,
  onGestiones,
  onAgregarARuta,
  onQuitarDeRuta,
  agregandoId,
  quitandoId,
  onOpenReorder,
  readOnly = false,
}: TodosTabProps) {
  const interactive = mode === 'interactiva';
  const [search, setSearch] = useState('');
  const raw = search.trim();
  // Accent/case-insensitive term for local filtering — "miguel" matches "Míguel".
  const q = normalizarTexto(raw);
  const searching = raw.length >= 1;

  const routeIds = useMemo(() => new Set(clientes.map((c) => c.partnerId)), [clientes]);

  const localMatches = useMemo(() => {
    if (!searching) return [];
    return clientes.filter(
      (c) => normalizarTexto(c.nombre).includes(q) || normalizarTexto(c.direccion).includes(q),
    );
  }, [clientes, q, searching]);

  // Any client in the whole base, not just today's sheet — GET
  // /insa/api/clientes/buscar-activos. Debounced; only fires from 2 chars.
  const [remote, setRemote] = useState<ClienteBusqueda[]>([]);
  const [loadingRemote, setLoadingRemote] = useState(false);
  const remoteOnly = useMemo(
    () => remote.filter((r) => !routeIds.has(r.partnerId)),
    [remote, routeIds],
  );

  useEffect(() => {
    if (raw.length < 2) {
      setRemote([]);
      setLoadingRemote(false);
      return;
    }
    let cancelled = false;
    setLoadingRemote(true);
    const timer = setTimeout(() => {
      // Send the text as typed — matching accents/case server-side is the
      // backend's job (the local list above is already accent-insensitive).
      repartoApiClient
        .buscarClientes(raw)
        .then((result) => {
          if (!cancelled) setRemote(result);
        })
        .catch(() => {
          if (!cancelled) setRemote([]);
        })
        .finally(() => {
          if (!cancelled) setLoadingRemote(false);
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [raw]);

  const [altaVisible, setAltaVisible] = useState(false);
  const [activarPropioCliente, setActivarPropioCliente] = useState<ClienteBusqueda | null>(null);

  const header = (
    <View style={styles.todosHeader}>
      <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar cualquier cliente..." />
      <ListModeToggle mode={mode} onChange={onModeChange} />
      {searching ? (
        <View style={styles.searchResults}>
          <Text style={styles.searchResultsLabel}>Resultados ({localMatches.length + remoteOnly.length})</Text>
          {localMatches.map((c) => (
            <ResultRow
              key={`r-${c.partnerId}`}
              cliente={c}
              enRuta
              onPress={() => onGestiones(c)}
              onQuitarDeRuta={() => onQuitarDeRuta(c)}
              quitando={quitandoId === c.partnerId}
            />
          ))}
          {raw.length >= 2 ? (
            loadingRemote ? (
              <Text style={styles.searchHint}>Buscando en toda la base…</Text>
            ) : remoteOnly.length === 0 && localMatches.length === 0 ? (
              <Text style={styles.searchHint}>Sin resultados.</Text>
            ) : (
              remoteOnly.map((c) => (
                <ResultRow
                  key={`f-${c.partnerId}`}
                  cliente={c}
                  enRuta={false}
                  onPress={() => onGestiones(clienteBusquedaAVisita(c))}
                  onAgregarARuta={readOnly ? undefined : () => onAgregarARuta(c)}
                  onActivarPropio={readOnly ? undefined : () => setActivarPropioCliente(c)}
                  agregando={agregandoId === c.partnerId}
                />
              ))
            )
          ) : (
            <Text style={styles.searchHint}>Escribí 2+ letras para buscar clientes fuera de la hoja.</Text>
          )}
          {!readOnly ? (
            <Button
              title="+ Dar de alta un cliente nuevo"
              variant="tertiary"
              shape="base"
              fullWidth
              onPress={() => setAltaVisible(true)}
              style={styles.altaButton}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.tabBody}>
      <FlatList
        data={searching ? [] : clientes}
        keyExtractor={(item) => String(item.partnerId)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={
          !searching ? (
            <EmptyState
              icon="people-outline"
              title="Sin clientes en la hoja de ruta"
              message={
                readOnly
                  ? `No hay clientes registrados en la hoja de ruta del ${deliveryDate}.`
                  : 'No hay ningún cliente registrado en la hoja de ruta de hoy. Podés buscar clientes fuera de ruta para agregarlos o dar de alta un nuevo cliente.'
              }
              actionLabel={readOnly ? undefined : '+ Dar de alta un cliente nuevo'}
              onAction={readOnly ? undefined : () => setAltaVisible(true)}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <ClientCard
            client={item}
            variant="todos"
            interactive={interactive}
            isRepaso={marks.isRepaso(item.partnerId)}
            isSrvTec={marks.isSrvTec(item.partnerId)}
            onGestiones={onGestiones}
            onToggleRepaso={() => marks.toggle('repaso', item.partnerId)}
            onToggleSrvTec={() => marks.toggle('srv_tec', item.partnerId)}
            onQuitarDeRuta={readOnly ? undefined : onQuitarDeRuta}
            onLongPress={interactive && !readOnly ? onOpenReorder : undefined}
          />
        )}
      />
      {/* TODO: Oculto temporalmente hasta implementar la funcionalidad del mapa */}
      {/* <FloatingActionButton icon="map" onPress={() => {}} variant="primary" style={styles.fab} /> */}

      <AltaClienteDialog
        visible={altaVisible}
        onClose={() => setAltaVisible(false)}
        deliveryDate={deliveryDate}
        onCreated={(cliente) => {
          setAltaVisible(false);
          setSearch(cliente.nombre);
        }}
      />

      <ActivarClientePropioDialog
        visible={activarPropioCliente !== null}
        onClose={() => setActivarPropioCliente(null)}
        deliveryDate={deliveryDate}
        cliente={activarPropioCliente}
        onActivated={(actualizado) => {
          setActivarPropioCliente(null);
          setSearch(actualizado.nombre);
        }}
      />
    </View>
  );
}
