import { Text, View } from 'react-native';
import { ListItem } from '@/components/ListItem';
import { styles } from './styles';
import { DrawerMenuProps } from './types';

/**
 * The "Operaciones" menu content that goes inside NavigationDrawer, opened
 * from TopAppBar's hamburger button.
 */
export function DrawerMenu({ title = 'Operaciones', items, user, versionLabel }: DrawerMenuProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.list}>
        {items.map(({ key, ...item }) => (
          <ListItem
            key={key}
            leadingIcon={item.icon}
            title={item.label}
            onPress={item.onPress}
            highlighted={item.highlighted}
          />
        ))}
      </View>
      {user ? (
        <View style={styles.userFooter}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.initials}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userRole}>{user.role}</Text>
          </View>
        </View>
      ) : versionLabel ? (
        <View style={styles.versionFooter}>
          <Text style={styles.versionText}>{versionLabel}</Text>
        </View>
      ) : null}
    </View>
  );
}

export * from './types';
export * from './styles';
export * from './utils';
