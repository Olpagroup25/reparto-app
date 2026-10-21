import { FlatList, Text, View } from 'react-native';
import { Badge, EmptyState } from '@/components';
import { spacing } from '@/theme/tokens';
import { styles } from '@/screens/HojaDeRutaScreen/styles';
import type { PendientesTabProps } from '@/screens/HojaDeRutaScreen/types';
import { ClientCard } from './ClientCard';

export function PendientesTab({
  pendientes,
  marks,
  onGestiones,
  onQuitarDeRuta,
  readOnly = false,
}: PendientesTabProps) {
  if (pendientes.length === 0) {
    return (
      <EmptyState
        icon="assignment-turned-in"
        title="No hay pedidos pendientes"
        message="Todos los clientes de la ruta ya tienen algún movimiento registrado en su cuadro de estado."
        actionLabel="Actualizar Hoja"
        onAction={() => {}}
      />
    );
  }

  return (
    <View style={styles.tabBody}>
      <FlatList
        data={pendientes}
        keyExtractor={(item) => String(item.partnerId)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.pendientesHeader}>
            <Text style={styles.pendientesTitle}>Clientes Pendientes</Text>
            <Badge label="Solo lectura" variant="neutral" size="md" />
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        renderItem={({ item }) => (
          <ClientCard
            client={item}
            variant="pendientes"
            interactive={false}
            isRepaso={marks.isRepaso(item.partnerId)}
            isSrvTec={marks.isSrvTec(item.partnerId)}
            onGestiones={onGestiones}
            onQuitarDeRuta={readOnly ? undefined : onQuitarDeRuta}
          />
        )}
      />
    </View>
  );
}
