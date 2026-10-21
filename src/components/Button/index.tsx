import { ActivityIndicator, Pressable, Text } from 'react-native';
import { colors } from '@/theme/tokens';
import { styles } from './styles';
import { ButtonProps } from './types';
import { getButtonBorderRadius, getButtonVariantStyle } from './utils';

/**
 * Standard button component supporting design variants (primary, secondary, success, tertiary, neutral)
 * and shape tokens (pill, md, base).
 */
export function Button({
  title,
  onPress,
  variant = 'primary',
  shape = 'pill',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const variantStyle = getButtonVariantStyle(variant);
  const borderRadius = getButtonBorderRadius(shape);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        { borderRadius },
        variantStyle.container,
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabledContainer,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isDisabled ? colors.outline : variantStyle.text.color} />
      ) : (
        <Text style={[styles.label, variantStyle.text, isDisabled && styles.disabledText]}>{title}</Text>
      )}
    </Pressable>
  );
}

export * from './types';
export * from './styles';
export * from './utils';
