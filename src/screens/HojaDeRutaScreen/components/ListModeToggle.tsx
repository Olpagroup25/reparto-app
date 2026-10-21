import { Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '@/theme/tokens';
import { styles } from '@/screens/HojaDeRutaScreen/styles';
import type { ListModeToggleProps } from '@/screens/HojaDeRutaScreen/types';

/**
 * The read-only / interactive switch for the client list ("organizar los
 * clientes"). Read-only drops every per-card action so the repartidor can
 * scan or hand off the phone without fat-fingering a visit.
 */
export function ListModeToggle({ mode, onChange }: ListModeToggleProps) {
  return (
    <View style={styles.modeToggle}>
      {(
        [
          { key: 'interactiva' as const, icon: 'touch-app' as const, label: 'Interactiva' },
          { key: 'lectura' as const, icon: 'visibility' as const, label: 'Solo lectura' },
        ]
      ).map((opt) => {
        const active = mode === opt.key;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={[styles.modeOption, active && styles.modeOptionActive]}
          >
            <MaterialIcons
              name={opt.icon}
              size={16}
              color={active ? colors.onPrimaryContainer : colors.onSurfaceVariant}
            />
            <Text style={[styles.modeOptionText, active && styles.modeOptionTextActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
