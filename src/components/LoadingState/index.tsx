import { ActivityIndicator, Text, View } from 'react-native';
import { colors } from '@/theme/tokens';
import { LoadingStateProps } from './types';
import { styles } from './styles';
import { DEFAULT_LOADING_LABEL } from './utils';

export * from './types';
export * from './styles';
export * from './utils';

/**
 * No design file shows a loading spinner — this follows the visual language
 * (centered, generous whitespace, primary navy accent) established by the
 * empty-state screens rather than any single mockup.
 */
export function LoadingState({ label = DEFAULT_LOADING_LABEL }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
}
