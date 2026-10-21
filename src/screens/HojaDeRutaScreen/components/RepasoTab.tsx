import { FlatList, Text, View } from 'react-native';
import { Badge, EmptyState } from '@/components';
import { spacing } from '@/theme/tokens';
import { styles } from '@/screens/HojaDeRutaScreen/styles';
import type { RepasoTabProps } from '@/screens/HojaDeRutaScreen/types';
import { ClientCard } from './ClientCard';

export function RepasoTab({
  repaso,
  marks,
  onGestiones,
  onQuitarDeRuta,
  readOnly = false,
}: RepasoTabProps) {
  if (repaso.length === 0) {
    return (
      <EmptyState
        icon="history"
        title="Sin clientes para repaso"
        message={`Cuando marqués un cliente con \u201cRepaso\u201d en su tarjeta (visita fallida, reprogramada), aparecerá acá.`}
      />
    );
  }

  return (
    <View style={styles.tabBody}>
      <FlatList
        data={repaso}
        keyExtractor={(item) => String(item.partnerId)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.pendientesHeader}>
            <Text style={styles.pendientesTitle}>En Repaso</Text>
            <Badge label={`${repaso.length}`} variant="secondary" size="md" />
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        renderItem={({ item }) => (
          <ClientCard
            client={item}
            variant="todos"
            interactive
            isRepaso={marks.isRepaso(item.partnerId) || item.resultado === 'ausente'}
            isSrvTec={marks.isSrvTec(item.partnerId)}
            onGestiones={onGestiones}
            onToggleRepaso={() => marks.toggle('repaso', item.partnerId)}
            onToggleSrvTec={() => marks.toggle('srv_tec', item.partnerId)}
            onQuitarDeRuta={readOnly ? undefined : onQuitarDeRuta}
          />
        )}
      />
    </View>
  );
}
