import { Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  Badge,
  Card,
  CardActionBar,
  StatBlock,
} from '@/components';
import { colors } from '@/theme/tokens';
import { styles } from '@/screens/HojaDeRutaScreen/styles';
import type { ClientCardProps } from '@/screens/HojaDeRutaScreen/types';
import { abrirEnMapa, formatFecha, isOverdue, isPriority, money } from '@/screens/HojaDeRutaScreen/utils';

export function ClientCard({
  client,
  variant,
  interactive = true,
  isRepaso = false,
  isSrvTec = false,
  onGestiones,
  onToggleRepaso,
  onToggleSrvTec,
  onQuitarDeRuta,
  onLongPress,
}: ClientCardProps) {
  const isPendientes = variant === 'pendientes';
  const priority = isPriority(client);
  const saldoFinal = client.saldoFacturas + client.consumos;
  const tuvoGestion =
    client.visitado ||
    client.resultado !== null ||
    client.cobroEfectivo > 0 ||
    Boolean(client.iconosVisita);
  const listaIconos = client.iconosVisita
    ? client.iconosVisita.trim().split(/\s+/).filter(Boolean)
    : [];

  return (
    <Card
      accentColor={
        isPendientes
          ? priority
            ? colors.primary
            : colors.outlineVariant
          : priority
            ? colors.error
            : colors.secondary
      }
      accentPosition={isPendientes ? 'top' : 'left'}
      onLongPress={onLongPress}
    >
      <View style={styles.clientTopRow}>
        <Text style={styles.clienteNro}>Nro cliente: {client.partnerId}</Text>
        <View style={styles.cardBadges}>
          {priority ? <Badge label="Prioridad" variant="error" /> : null}
          {client.fueraDeRuta ? <Badge label="Fuera de ruta" variant="neutral" /> : null}
          {client.esExtra && !client.fueraDeRuta ? <Badge label="Extra" variant="secondary" /> : null}
          {isRepaso ? <Badge label="En repaso" variant="secondary" /> : null}
          {isSrvTec ? <Badge label="Srv Téc" variant="neutral" /> : null}
          {client.fueVencido && client.fucVencido ? (
            <Badge label="FUE/FUC Vencido" variant="error" />
          ) : client.fueVencido ? (
            <Badge label="FUE Vencido" variant="error" />
          ) : client.fucVencido ? (
            <Badge label="FUC Vencido" variant="error" />
          ) : client.alDia ? (
            <Badge label="Al día" variant="secondary" />
          ) : null}
        </View>
      </View>

      <View style={styles.clientNameRow}>
        <View style={styles.nameRow}>
          <MaterialIcons name="home" size={18} color={colors.primary} />
          <Text style={styles.clientName} numberOfLines={2} ellipsizeMode="tail">
            {client.nombre}
          </Text>
        </View>
        {listaIconos.length > 0 ? (
          <View style={styles.iconosContainer}>
            {listaIconos.map((ico, idx) => (
              <Text key={idx} style={styles.iconoItem}>
                {ico}
              </Text>
            ))}
          </View>
        ) : null}
      </View>

      <Text style={styles.address}>{client.direccion}</Text>

      {isPendientes ? (
        <>
          <View style={styles.badgeRow}>
            <Badge
              label={`FUE: ${formatFecha(client.fechaUltimaEntrega)}`}
              variant={client.fueVencido ? 'error' : 'secondary'}
              size="md"
            />
            <Badge
              label={`FUC: ${formatFecha(client.fechaUltimaCobranza)}`}
              variant={client.fucVencido ? 'error' : 'neutral'}
              size="md"
            />
          </View>
          <View style={styles.statsRow}>
            <StatBlock label="Saldo Facturas" value={money(client.saldoFacturas)} valueColor={colors.primary} />
            <StatBlock label="Consumos" value={money(client.consumos)} align="right" />
          </View>
        </>
      ) : (
        <View style={styles.pairedBoxRow}>
          <View style={[styles.pairedBoxFue, client.fueVencido && styles.pairedBoxVencido]}>
            <Text style={[styles.pairedBoxLabelFue, client.fueVencido && styles.pairedBoxLabelVencido]}>
              FUE: {formatFecha(client.fechaUltimaEntrega)}
            </Text>
            <Text style={[styles.pairedBoxValueFue, client.fueVencido && styles.pairedBoxValueVencido]}>
              Saldo: {money(client.saldoFacturas)}
            </Text>
          </View>
          <View style={[styles.pairedBoxFuc, client.fucVencido && styles.pairedBoxVencido]}>
            <Text style={[styles.pairedBoxLabelFuc, client.fucVencido && styles.pairedBoxLabelVencido]}>
              FUC: {formatFecha(client.fechaUltimaCobranza)}
            </Text>
            <Text style={[styles.pairedBoxValueFuc, client.fucVencido && styles.pairedBoxValueVencido]}>
              Consumos: {money(client.consumos)}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.finalBlock}>
        <StatBlock label="Saldo Final" value={money(saldoFinal)} align="center" emphasis valueColor={colors.primary}>
          {isOverdue(client) ? (
            <Badge label="Facturas Vencidas" variant="error" size="md" />
          ) : client.consumos === 0 ? (
            <Badge label="Sin Consumos" variant="neutral" size="md" />
          ) : null}
        </StatBlock>
      </View>

      {interactive ? (
        <>
          <CardActionBar
            actions={[
              {
                key: 'ir',
                icon: 'near-me',
                label: 'Ir',
                color: colors.primary,
                onPress: () => abrirEnMapa(client.direccion),
              },
              {
                key: 'repaso',
                icon: 'history',
                label: isRepaso ? 'Quitar' : 'Repaso',
                color: isRepaso ? colors.secondary : colors.onSurfaceVariant,
                onPress: () => onToggleRepaso?.(),
              },
              {
                key: 'gestiones',
                icon: tuvoGestion ? 'check-circle' : 'pending-actions',
                label: 'Gestiones',
                color: tuvoGestion ? colors.success : colors.onSurfaceVariant,
                onPress: () => onGestiones(client),
              },
              ...(onQuitarDeRuta
                ? [
                    {
                      key: 'quitar',
                      icon: 'person-remove' as const,
                      label: 'Quitar',
                      color: colors.error,
                      onPress: () => onQuitarDeRuta(client),
                    },
                  ]
                : []),
            ]}
          />
          <Pressable style={styles.srvTecToggle} onPress={() => onToggleSrvTec?.()}>
            <MaterialIcons
              name={isSrvTec ? 'check-box' : 'check-box-outline-blank'}
              size={18}
              color={colors.primary}
            />
            <Text style={styles.srvTecToggleText}>
              {isSrvTec ? 'Marcado para Servicio Técnico' : 'Marcar Servicio Técnico (gestión en oficina)'}
            </Text>
          </Pressable>
        </>
      ) : null}
    </Card>
  );
}
