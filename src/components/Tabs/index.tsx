import { Pressable, Text, View } from 'react-native';
import { Badge } from '@/components/Badge';
import { TabsProps } from './types';
import { styles } from './styles';
import { isTabActive } from './utils';

export * from './types';
export * from './styles';
export * from './utils';

export function Tabs({ tabs, activeKey, onChange }: TabsProps) {
  return (
    <View style={styles.row}>
      {tabs.map((tab) => {
        const active = isTabActive(tab.key, activeKey);
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.tab, active ? styles.tabActive : styles.tabInactive]}
          >
            <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
              {tab.label}
            </Text>
            {tab.badgeCount !== undefined ? (
              <Badge label={String(tab.badgeCount)} variant="primary" />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
