import { Image, Text, View } from 'react-native';
import { Card, Dialog, ErrorState, IconButton, LoadingState } from '@/components';
import { colors } from '@/theme/tokens';
import { useStockEnRuta } from '@/hooks/useStockEnRuta';
import type { StockEnRutaItem } from '@/api/types';
import type { StockEnRutaDialogProps, ProductoStockCardProps } from './types';
import { styles } from './styles';
import { STOCK_CAMPOS } from './utils';

export type { StockEnRutaDialogProps };

/**
 * "Stock en Ruta" drawer entry — a per-product read-only breakdown of what's
 * on the vehicle (disponibles / vacíos / fallados / total de envases).
 *
 * Layout follows the reference mockup (card per product, colour-dot rows with
 * dotted leaders). The header uses the app's navy dialog convention rather
 * than the mockup's lighter blue, to match ControlDePlayaDialog.
 *
 * Data source: `useStockEnRuta` → `GET /insa/api/stock-en-ruta`.
 */
export function StockEnRutaDialog({ visible, onClose, deliveryDate }: StockEnRutaDialogProps) {
  const { data, isLoading, isError, refetch } = useStockEnRuta(deliveryDate);
  const items = data ?? [];

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      header={
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Stock en Ruta</Text>
          <IconButton icon="close" onPress={onClose} color={colors.onPrimary} />
        </View>
      }
    >
      {isLoading ? (
        <LoadingState label="Cargando stock..." />
      ) : isError ? (
        <ErrorState
          message="No pudimos cargar el stock en ruta. Revisá tu conexión e intentá de nuevo."
          onRetry={refetch}
        />
      ) : (
        <View style={styles.body}>
          {items.length === 0 ? (
            <Text style={styles.empty}>
              Sin stock cargado para esta fecha. Registrá el Control de Playa (Salida) para ver el balance en vivo de tu camión.
            </Text>
          ) : (
            items.map((item) => <ProductoStockCard key={item.productId} item={item} />)
          )}
        </View>
      )}
    </Dialog>
  );
}

function ProductoStockCard({ item }: ProductoStockCardProps) {
  return (
    <Card padded={false} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.nombre}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.rowsCol}>
          {STOCK_CAMPOS.map((campo) => {
            const valor = item[campo.key];
            return (
              <View key={campo.key} style={styles.row}>
                <View style={[styles.dot, { backgroundColor: campo.color }]} />
                <Text style={styles.rowLabel}>{campo.label}:</Text>
                <View style={styles.leader} />
                <Text style={[styles.rowValue, valor < 0 && styles.rowValueNegative]}>{valor}</Text>
              </View>
            );
          })}
        </View>
        {item.imagen ? (
          <Image source={{ uri: item.imagen }} style={styles.thumb} resizeMode="cover" />
        ) : null}
      </View>
    </Card>
  );
}
