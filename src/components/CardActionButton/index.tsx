import { Pressable, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from './styles';
import { CardActionButtonProps } from './types';
import { getActionButtonColor } from './utils';

/**
 * Vertical icon + label tap target repeated across delivery and client cards.
 */
export function CardActionButton({ icon, label, color, onPress }: CardActionButtonProps) {
  const actionColor = getActionButtonColor(color);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <MaterialIcons name={icon} size={20} color={actionColor} />
      <Text style={[styles.label, { color: actionColor }]}>{label}</Text>
    </Pressable>
  );
}

export * from './types';
export * from './styles';
export * from './utils';
