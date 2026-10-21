import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Card, IconButton, StatBlock } from '@/components';
import { colors, spacing } from '@/theme/tokens';
import { useSync } from '@/sync/SyncProvider';
import { describeOutboxItem, statusLabel } from '@/sync/describe';
import { timeAgo } from '@/sync/timeAgo';
import type { OutboxItem } from '@/sync/types';
import type { OutboxRowProps } from './types';
import { styles } from './styles';
import { STATUS_VARIANT, getOutboxAccentColor } from './utils';

export type { OutboxRowProps };

/**
 * The "Sync" tab of HojaDeRutaScreen — the offline-first control panel.
 *
 * Everything the repartidor does without a connection is queued in a local
 * SQLite outbox (see src/sync/); this screen shows what's waiting, lets them
 * fire a sync manually, and retry or discard a single stuck item. Auto-sync on
 * reconnect is handled by SyncProvider — the toggle here just turns it off.
 */
export function SyncTab() {
  const {
    available,
    ready,
    items,
    counts,
    lastSyncAt,
    isSyncing,
    online,
    autoSync,
    setAutoSync,
    syncNow,
    retryItem,
    discardItem,
  } = useSync();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const canSync = online && !isSyncing && counts.unsynced > 0;

  // "Forzar actualización de datos": push the outbox AND re-pull the cached
  // reads (hoja de ruta, catálogo, …) from the server.
  async function forzarActualizacion() {
    setRefreshing(true);
    try {
      await syncNow();
      if (online) await queryClient.invalidateQueries({ queryKey: ['reparto'] });
    } finally {
      setRefreshing(false);
    }
  }

  const header = (
    <View style={styles.headerBlock}>
      <View style={styles.statusRow}>
        <View style={styles.statusPill}>
          <View style={[styles.dot, { backgroundColor: online ? colors.success : colors.outline }]} />
          <Text style={styles.statusText}>{online ? 'En línea' : 'Sin conexión'}</Text>
        </View>
        <Text style={styles.lastSyncText}>
          Última sincronización: {ready ? timeAgo(lastSyncAt) : '…'}
        </Text>
      </View>

      <Card style={styles.countsCard}>
        <View style={styles.countsRow}>
          <StatBlock
            label="Pendientes"
            value={String(counts.pending + counts.syncing)}
            align="center"
            valueColor={colors.primary}
          />
          <StatBlock
            label="Con error"
            value={String(counts.failed)}
            align="center"
            valueColor={counts.failed > 0 ? colors.error : colors.onSurface}
          />
          <StatBlock label="Sincroniz. hoy" value={String(counts.doneToday)} align="center" />
        </View>
      </Card>

      <Button
        title={isSyncing ? 'Sincronizando…' : 'Sincronizar ahora'}
        variant="primary"
        fullWidth
        loading={isSyncing}
        disabled={!canSync}
        onPress={() => void syncNow()}
        style={styles.syncButton}
      />
      <Button
        title="Forzar actualización de datos"
        variant="secondary"
        shape="base"
        fullWidth
        loading={refreshing}
        disabled={refreshing || isSyncing}
        onPress={() => void forzarActualizacion()}
        style={styles.syncButton}
      />
      {!online ? (
        <Text style={styles.hint}>Sin conexión: se sincronizará al recuperar el internet.</Text>
      ) : counts.unsynced === 0 ? (
        <Text style={styles.hint}>No hay nada pendiente por sincronizar.</Text>
      ) : null}

      <Pressable style={styles.toggleRow} onPress={() => setAutoSync(!autoSync)}>
        <IconButton
          icon={autoSync ? 'check-box' : 'check-box-outline-blank'}
          color={colors.primary}
          onPress={() => setAutoSync(!autoSync)}
        />
        <Text style={styles.toggleText}>Sincronizar automáticamente al reconectar</Text>
      </Pressable>

      {!available ? (
        <Text style={styles.unavailable}>
          La cola local no está disponible en la vista web — probá en un dispositivo o emulador.
        </Text>
      ) : null}

      {items.length > 0 ? <Text style={styles.listTitle}>En cola</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        ListEmptyComponent={
          ready && available ? (
            <View style={styles.emptyBlock}>
              <MaterialIcons name="cloud-done" size={48} color={colors.primary} />
              <Text style={styles.emptyTitle}>Todo sincronizado</Text>
              <Text style={styles.emptyMessage}>
                No hay operaciones pendientes. Lo que registres sin conexión aparecerá acá.
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        renderItem={({ item }) => (
          <OutboxRow
            item={item}
            expanded={expandedId === item.id}
            online={online}
            onToggle={() => setExpandedId((cur) => (cur === item.id ? null : item.id))}
            onRetry={() => void retryItem(item.id)}
            onDiscard={() => {
              setExpandedId(null);
              void discardItem(item.id);
            }}
          />
        )}
      />
    </View>
  );
}

function OutboxRow({
  item,
  expanded,
  online,
  onToggle,
  onRetry,
  onDiscard,
}: OutboxRowProps) {
  const summary = describeOutboxItem(item);
  const accent = getOutboxAccentColor(item.status);

  return (
    <Card accentColor={accent} accentPosition="left" padded={false} style={styles.rowCard}>
      <Pressable style={styles.rowMain} onPress={onToggle}>
        <MaterialIcons name={summary.icon} size={24} color={colors.primary} style={styles.rowIcon} />
        <View style={styles.rowText}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {summary.title}
          </Text>
          <Text style={styles.rowSubtitle} numberOfLines={1}>
            {summary.subtitle}
          </Text>
          <Text style={styles.rowMeta}>
            {timeAgo(item.createdAt)}
            {item.dependsOn ? ' · espera alta de cliente' : ''}
            {item.attempts > 0 ? ` · ${item.attempts} intento(s)` : ''}
          </Text>
        </View>
        <Badge label={statusLabel(item.status)} variant={STATUS_VARIANT[item.status]} size="sm" />
      </Pressable>

      {expanded ? (
        <View style={styles.rowExpanded}>
          {item.lastError ? <Text style={styles.errorText}>{item.lastError}</Text> : null}
          <View style={styles.rowActions}>
            <Button
              title="Reintentar"
              variant="secondary"
              shape="base"
              disabled={!online || item.status === 'syncing'}
              onPress={onRetry}
              style={styles.rowActionButton}
            />
            <Button
              title="Descartar"
              variant="neutral"
              shape="base"
              onPress={onDiscard}
              style={styles.rowActionButton}
            />
          </View>
        </View>
      ) : null}
    </Card>
  );
}
