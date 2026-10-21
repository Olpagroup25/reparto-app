import { Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from './styles';
import { BottomNavBarProps } from './types';
import { calculateNavBarHeight, getNavItemColor } from './utils';

/**
 * Edge-to-edge: pads its own bottom inset so tap targets clear the home
 * indicator / Android gesture bar, instead of relying on a parent SafeAreaView.
 */
export function BottomNavBar({ items, activeKey, onChange }: BottomNavBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { height: calculateNavBarHeight(insets.bottom), paddingBottom: insets.bottom }]}>
      {items.map((item) => {
        const active = item.key === activeKey;
        const { iconColor } = getNavItemColor(active);
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            style={[styles.item, active && styles.itemActive]}
          >
            <View>
              <MaterialIcons name={item.icon} size={24} color={iconColor} />
              {item.showBadge ? <View style={styles.badgeDot} /> : null}
            </View>
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export * from './types';
export * from './styles';
export * from './utils';
