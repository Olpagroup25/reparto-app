import { Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/theme/tokens';
import { Button } from '@/components/Button';
import { styles } from './styles';
import { EmptyStateProps } from './types';

/**
 * Modeled directly on the four "vacío" screens (no_sync, pedidos, repaso, srv_tec):
 * icon-in-a-circle, headline, supporting body copy, primary action, optional secondary text link.
 */
export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <MaterialIcons name={icon} size={48} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} variant="primary" shape="md" onPress={onAction} style={styles.action} />
      ) : null}
      {secondaryLabel && onSecondaryAction ? (
        <Text style={styles.secondaryLink} onPress={onSecondaryAction}>
          {secondaryLabel}
        </Text>
      ) : null}
    </View>
  );
}

export * from './types';
export * from './styles';
export * from './utils';
