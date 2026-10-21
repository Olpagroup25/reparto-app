import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Badge, BrandMark, Button, IconButton, ScreenContainer } from '@/components';
import { useAuth } from '@/auth/AuthContext';
import { useSync } from '@/sync/SyncProvider';
import { ControlDePlayaDialog } from '@/screens/ControlDePlayaDialog';
import { isoDate } from '@/screens/DateSelectionScreen/utils';
import { styles } from './styles';
import type { AccessScreenProps } from './types';
import { APP_VERSION, DEFAULT_FACTORY } from './utils';

export type { AccessScreenProps, FactoryInfo } from './types';

export function AccessScreen({ navigation, route }: AccessScreenProps) {
  const { deliveryDate } = route.params;
  const isToday = deliveryDate === isoDate(new Date());
  const { user, logout } = useAuth();
  const { counts: syncCounts } = useSync();
  const [controlDePlayaVisible, setControlDePlayaVisible] = useState(false);

  const doLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  const handleLogout = () => {
    // Queued items are tagged with this route's id — logging out (and possibly
    // logging in as another route) would strand them. Warn first.
    if (syncCounts.unsynced > 0) {
      Alert.alert(
        'Hay cambios sin sincronizar',
        `Quedan ${syncCounts.unsynced} operación(es) en la cola de esta ruta. Si cerrás sesión no se enviarán hasta que vuelvas a entrar con esta misma ruta.`,
        [
          { text: 'Seguir en sesión', style: 'cancel' },
          { text: 'Cerrar sesión igual', style: 'destructive', onPress: () => void doLogout() },
        ],
      );
      return;
    }
    void doLogout();
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <BrandMark />
      </View>

      {user ? (
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.initials}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{user.displayName}</Text>
            <Badge label={user.role} variant={user.role === 'Administrator' ? 'primary' : 'secondary'} size="md" />
          </View>
        </View>
      ) : null}

      <View style={styles.factoryInfo}>
        <Text style={styles.factoryName}>{DEFAULT_FACTORY.name}</Text>
        <View style={styles.dateRow}>
          <Text style={styles.factorySubtitle}>
            ({DEFAULT_FACTORY.code}) {deliveryDate}
          </Text>
          {!isToday ? <Badge label="Solo lectura" variant="neutral" size="sm" /> : null}
          <IconButton
            icon="edit"
            size={18}
            onPress={() => navigation.navigate('DateSelection', { initialDate: deliveryDate })}
          />
        </View>
      </View>
      <View style={styles.actions}>
        <Button
          title="Control DePlaya"
          variant="primary"
          shape="base"
          fullWidth
          onPress={() => setControlDePlayaVisible(true)}
        />
        <Button
          title="Hoja de ruta"
          variant="tertiary"
          shape="base"
          fullWidth
          onPress={() => navigation.navigate('HojaDeRuta', { deliveryDate })}
          style={styles.spaced}
        />
        <Button title="Salir" variant="neutral" shape="base" fullWidth onPress={handleLogout} style={styles.spaced} />
      </View>
      <Text style={styles.version}>{APP_VERSION}</Text>
      <ControlDePlayaDialog
        visible={controlDePlayaVisible}
        onClose={() => setControlDePlayaVisible(false)}
        deliveryDate={deliveryDate}
      />
    </ScreenContainer>
  );
}
