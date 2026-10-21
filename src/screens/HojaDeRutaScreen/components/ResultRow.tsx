import { Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Badge, Card } from '@/components';
import { colors } from '@/theme/tokens';
import { styles } from '@/screens/HojaDeRutaScreen/styles';
import type { ResultRowProps } from '@/screens/HojaDeRutaScreen/types';

/** Card enriquecida para resultados de búsqueda con datos clave, saldo y acciones rápidas. */
export function ResultRow({
  cliente,
  enRuta,
  onPress,
  onAgregarARuta,
  onQuitarDeRuta,
  onActivarPropio,
  agregando = false,
  quitando = false,
}: ResultRowProps) {
  const tieneDeuda = cliente.saldoFacturas > 0;

  return (
    <Card style={styles.searchResultCard}>
      {/* Cabecera: Nombre y Badges */}
      <View style={styles.searchCardHeader}>
        <Text style={styles.searchCardTitle} numberOfLines={1}>
          {cliente.nombre}
        </Text>
        <View style={styles.searchCardBadges}>
          <Badge
            label={enRuta ? 'En ruta' : 'Fuera de ruta'}
            variant={enRuta ? 'secondary' : 'neutral'}
          />
          {cliente.esClientePropio ? (
            <Badge label="Propio" variant="primary" />
          ) : null}
        </View>
      </View>

      {/* Dirección */}
      <View style={styles.searchCardAddressRow}>
        <MaterialIcons name="place" size={15} color={colors.onSurfaceVariant} />
        <Text style={styles.searchCardAddressText} numberOfLines={2}>
          {cliente.direccion || 'Sin dirección cargada'}
        </Text>
      </View>

      {/* Indicadores de Saldo y Consumo */}
      <View style={styles.searchCardStatsRow}>
        <View style={[styles.statChip, tieneDeuda ? styles.statChipDebt : styles.statChipOk]}>
          <MaterialIcons
            name={tieneDeuda ? 'error-outline' : 'check-circle-outline'}
            size={13}
            color={tieneDeuda ? colors.error : colors.success}
          />
          <Text style={[styles.statChipText, tieneDeuda ? styles.statChipTextDebt : styles.statChipTextOk]}>
            Saldo: ${Math.round(cliente.saldoFacturas).toLocaleString()}
          </Text>
        </View>

        {cliente.consumos > 0 ? (
          <View style={[styles.statChip, styles.statChipNeutral]}>
            <MaterialIcons name="receipt-long" size={13} color={colors.onSurfaceVariant} />
            <Text style={[styles.statChipText, styles.statChipTextNeutral]}>
              Facturado: ${Math.round(cliente.consumos).toLocaleString()}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Botones de acción rápida */}
      <View style={styles.searchCardActions}>
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [styles.btnActionSecondary, pressed && styles.btnActionPressed]}
          hitSlop={6}
        >
          <MaterialIcons name="edit-document" size={14} color={colors.primary} />
          <Text style={styles.btnActionSecondaryText}>Registrar visita</Text>
        </Pressable>

        {enRuta && onQuitarDeRuta ? (
          <Pressable
            onPress={onQuitarDeRuta}
            disabled={quitando}
            style={({ pressed }) => [
              styles.btnQuitarRuta,
              pressed && styles.btnActionPressed,
              quitando && styles.btnActionDisabled,
            ]}
            hitSlop={6}
          >
            <MaterialIcons name="person-remove" size={14} color={colors.error} />
            <Text style={styles.btnQuitarRutaText}>
              {quitando ? 'Quitando…' : 'Quitar de ruta'}
            </Text>
          </Pressable>
        ) : null}

        {!enRuta && onAgregarARuta ? (
          <Pressable
            onPress={onAgregarARuta}
            disabled={agregando}
            style={({ pressed }) => [
              styles.btnAgregarRuta,
              pressed && styles.btnActionPressed,
              agregando && styles.btnActionDisabled,
            ]}
            hitSlop={6}
          >
            <MaterialIcons name="person-add" size={14} color={colors.onPrimaryContainer} />
            <Text style={styles.btnAgregarRutaText}>
              {agregando ? 'Agregando…' : '+ A mi ruta'}
            </Text>
          </Pressable>
        ) : null}

        {!enRuta && !cliente.esClientePropio && onActivarPropio ? (
          <Pressable
            onPress={onActivarPropio}
            style={({ pressed }) => [styles.btnActivarPropio, pressed && styles.btnActionPressed]}
            hitSlop={6}
          >
            <MaterialIcons name="how-to-reg" size={14} color={colors.primary} />
            <Text style={styles.btnActivarPropioText}>Activar propio</Text>
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}
