import { Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/theme/tokens';
import { IconButtonProps } from './types';
import { styles } from './styles';
import { getIconButtonIconColor } from './utils';

export * from './types';
export * from './styles';
export * from './utils';

/** Shared circular icon-tap-target — the menu button, dialog close button,
 * and search filter button all reduce to this same pattern in the designs. */
export function IconButton({
  icon,
  onPress,
  color = colors.onSurface,
  backgroundColor = 'transparent',
  size = 24,
  disabled = false,
  style,
}: IconButtonProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <MaterialIcons name={icon} size={size} color={getIconButtonIconColor(disabled, color)} />
    </Pressable>
  );
}
