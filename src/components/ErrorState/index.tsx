import { Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/theme/tokens';
import { Button } from '@/components/Button';
import { styles } from './styles';
import { ErrorStateProps } from './types';
import { DEFAULT_ERROR_MESSAGE, DEFAULT_ERROR_TITLE, DEFAULT_RETRY_LABEL } from './utils';

/**
 * Screen-level error state with error container token styling and retry action.
 */
export function ErrorState({
  title = DEFAULT_ERROR_TITLE,
  message = DEFAULT_ERROR_MESSAGE,
  retryLabel = DEFAULT_RETRY_LABEL,
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <MaterialIcons name="error-outline" size={48} color={colors.error} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? <Button title={retryLabel} variant="primary" onPress={onRetry} /> : null}
    </View>
  );
}

export * from './types';
export * from './styles';
export * from './utils';
