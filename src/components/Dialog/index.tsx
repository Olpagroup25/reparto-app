import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { colors } from '@/theme/tokens';
import { IconButton } from '@/components/IconButton';
import { styles } from './styles';
import { DialogProps } from './types';
import { hasCustomDialogHeader } from './utils';

/**
 * Centered modal card on a dimmed backdrop — matches the "rounded white
 * panel over a scrim" framing used for control_de_playa_* screens and date pickers.
 *
 * The body scrolls and the panel is capped at 85% of the screen height.
 */
export function Dialog({ visible, onClose, title, header, children, footer }: DialogProps) {
  const isCustomHeader = hasCustomDialogHeader(header);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.panel}>
          {isCustomHeader ? (
            header
          ) : title ? (
            <View style={styles.header}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              <IconButton icon="close" onPress={onClose} color={colors.onSurfaceVariant} />
            </View>
          ) : null}
          <ScrollView contentContainerStyle={styles.body}>{children}</ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}

export * from './types';
export * from './styles';
export * from './utils';
