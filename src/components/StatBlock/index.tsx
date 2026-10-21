import { Text, View } from 'react-native';
import { colors } from '@/theme/tokens';
import { StatBlockProps } from './types';
import { styles } from './styles';
import { getStatBlockAlignItems } from './utils';

export * from './types';
export * from './styles';
export * from './utils';

export function StatBlock({
  label,
  value,
  align = 'left',
  emphasis = false,
  valueColor = colors.onSurface,
  children,
}: StatBlockProps) {
  const alignItems = getStatBlockAlignItems(align);

  return (
    <View style={{ alignItems }}>
      <Text style={[styles.label, { textAlign: align }]}>{label}</Text>
      <Text style={[emphasis ? styles.valueLg : styles.value, { color: valueColor, textAlign: align }]}>
        {value}
      </Text>
      {children}
    </View>
  );
}
