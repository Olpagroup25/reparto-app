import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/auth/AuthContext';
import { colors } from '@/theme/tokens';
import { AccessScreen } from '@/screens/AccessScreen';
import { DateSelectionScreen } from '@/screens/DateSelectionScreen';
import { HojaDeRutaScreen } from '@/screens/HojaDeRutaScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import type { RootStackParamList } from './types';

export type { RootStackParamList };

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, isRestoring } = useAuth();

  // AuthProvider is still confirming a stored session (expo-secure-store)
  // against /insa/api/whoami — hold here instead of flashing Login for an
  // already-signed-in user, or trusting an expired/revoked token.
  if (isRestoring) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/* initialRouteName is only read on first mount, which is exactly
          when isRestoring has just settled — a restored session skips
          straight to DateSelection (there's no persisted delivery date to
          skip that step too). */}
      <Stack.Navigator initialRouteName={user ? 'DateSelection' : 'Login'} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Access" component={AccessScreen} />
        <Stack.Screen name="DateSelection" component={DateSelectionScreen} />
        <Stack.Screen name="HojaDeRuta" component={HojaDeRutaScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
