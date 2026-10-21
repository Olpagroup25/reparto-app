import { Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from './styles';
import { FloatingActionButtonProps } from './types';
import { getFabBorderRadius, getFabColors } from './utils';

/**
 * Floating Action Button component with primary/secondary variants and circle/rounded shapes.
 */
export function FloatingActionButton({
  icon,
  onPress,
  variant = 'primary',
  shape = 'circle',
  style,
}: FloatingActionButtonProps) {
  const { backgroundColor, iconColor } = getFabColors(variant);
  const borderRadius = getFabBorderRadius(shape);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor, borderRadius },
        pressed && styles.pressed,
        style,
      ]}
    >
      <MaterialIcons name={icon} size={28} color={iconColor} />
    </Pressable>
  );
}

export * from './types';
export * from './styles';
export * from './utils';
