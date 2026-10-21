import { Text, View } from 'react-native';
import { styles } from './styles';
import { BadgeProps } from './types';
import { getBadgeVariantStyle } from './utils';

/**
 * Covers recurring pill patterns across designs:
 * - small solid count badges (tab counters, ".badge" class: bg-primary/white text)
 * - larger status/date chips (FUE/FUC tags, "Prioridad", "Facturas Vencidas").
 */
export function Badge({ label, variant = 'neutral', size = 'sm' }: BadgeProps) {
  const variantStyle = getBadgeVariantStyle(variant);
  return (
    <View style={[styles.base, size === 'md' && styles.md, { backgroundColor: variantStyle.backgroundColor }]}>
      <Text style={[styles.text, size === 'md' && styles.textMd, { color: variantStyle.color }]}>{label}</Text>
    </View>
  );
}

export * from './types';
export * from './styles';
export * from './utils';
