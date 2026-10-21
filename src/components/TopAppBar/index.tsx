import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme/tokens';
import { IconButton } from '@/components/IconButton';
import { TopAppBarProps } from './types';
import { styles } from './styles';

export * from './types';
export * from './styles';
export * from './utils';

/**
 * Edge-to-edge: this bar draws its navy background all the way to the top of
 * the screen (behind the status bar) instead of stopping at the safe-area
 * boundary — the top inset is applied as internal padding here, not by a
 * parent SafeAreaView, so use it as ScreenContainer's first child with the
 * 'top' edge excluded (`edges={['left', 'right']}`) to avoid double-padding.
 */
export function TopAppBar({ title, onMenuPress, right }: TopAppBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.left}>
        {onMenuPress ? <IconButton icon="menu" onPress={onMenuPress} color={colors.onPrimary} /> : null}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}
