import { FlatList, Text, View } from 'react-native';
import { Badge, EmptyState } from '@/components';
import { spacing } from '@/theme/tokens';
import { styles } from '@/screens/HojaDeRutaScreen/styles';
import type { SrvTecTabProps } from '@/screens/HojaDeRutaScreen/types';
import { ClientCard } from './ClientCard';

export function SrvTecTab({
  srvTec,
  marks,
  onGestiones,
  onQuitarDeRuta,
  readOnly = false,
}: SrvTecTabProps) {
  if (srvTec.length === 0) {
    return (
      <EmptyState
        icon="engineering"
        title="No hay servicios técnicos pendientes"
        message={`Marcá \u201cServicio Técnico\u201d en la tarjeta de un cliente cuando su dispenser (frío/calor) requiera gestión en la oficina.`}
      />
    );
  }

  return (
    <View style={styles.tabBody}>
      <FlatList
        data={srvTec}
        keyExtractor={(item) => String(item.partnerId)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.pendientesHeader}>
            <Text style={styles.pendientesTitle}>Servicio Técnico</Text>
            <Badge label={`${srvTec.length}`} variant="neutral" size="md" />
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        renderItem={({ item }) => (
          <ClientCard
            client={item}
            variant="todos"
            interactive
            isRepaso={marks.isRepaso(item.partnerId)}
            isSrvTec
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
