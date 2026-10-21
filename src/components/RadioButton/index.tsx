import { Pressable, Text, View } from 'react-native';
import { RadioButtonProps } from './types';
import { styles } from './styles';

export * from './types';
export * from './styles';
export * from './utils';

export function RadioButton({ label, selected, onPress, disabled = false }: RadioButtonProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      style={[styles.row, disabled && styles.disabled]}
    >
      <View style={[styles.outer, selected && styles.outerSelected]}>
        {selected ? <View style={styles.inner} /> : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}
