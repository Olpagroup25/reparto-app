import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '@/theme/tokens';
import { NavigationDrawerProps } from './types';
import { styles } from './styles';
import { DEFAULT_DRAWER_WIDTH, DRAWER_ANIMATION_DURATION } from './utils';

export * from './types';
export * from './styles';
export * from './utils';

/** Generic slide-in-from-left panel + backdrop. Owns no menu-specific chrome
 * itself (title/items/footer) — that's DrawerMenu's job as this component's children. */
export function NavigationDrawer({
  visible,
  onClose,
  children,
  width = DEFAULT_DRAWER_WIDTH,
}: NavigationDrawerProps) {
  const translateX = useRef(new Animated.Value(-width)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: visible ? 0 : -width,
      duration: DRAWER_ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  }, [visible, width, translateX]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View
        style={[
          styles.panel,
          {
            width,
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.lg,
            transform: [{ translateX }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </Modal>
  );
}
