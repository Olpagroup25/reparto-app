import { Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ListItemProps } from './types';
import { styles } from './styles';
import { getListItemIconColor } from './utils';

export * from './types';
export * from './styles';
export * from './utils';

export function ListItem({
  title,
  subtitle,
  leadingIcon,
  trailing,
  highlighted = false,
  onPress,
}: ListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        highlighted && styles.highlighted,
        pressed && !highlighted && styles.pressed,
      ]}
    >
      {leadingIcon && (
        <MaterialIcons
          name={leadingIcon}
          size={24}
          color={getListItemIconColor(highlighted)}
          style={styles.icon}
        />
      )}
      <View style={styles.textContainer}>
        <Text
          style={[styles.title, highlighted && styles.titleHighlighted]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </Pressable>
  );
}
