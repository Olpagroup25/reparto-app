import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenContainerProps } from './types';
import { styles } from './styles';
import { DEFAULT_SCREEN_EDGES } from './utils';

export * from './types';
export * from './styles';
export * from './utils';

export function ScreenContainer({
  children,
  scroll = false,
  padded = true,
  edges = DEFAULT_SCREEN_EDGES,
  style,
}: ScreenContainerProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      {scroll ? (
        <ScrollView contentContainerStyle={[padded && styles.padded, style]}>{children}</ScrollView>
      ) : (
        <View style={[styles.flex, padded && styles.padded, style]}>{children}</View>
      )}
    </SafeAreaView>
  );
}
