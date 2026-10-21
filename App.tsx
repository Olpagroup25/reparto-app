import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import {
  SourceSans3_400Regular,
  SourceSans3_500Medium,
  SourceSans3_600SemiBold,
  SourceSans3_700Bold,
  useFonts,
} from '@expo-google-fonts/source-sans-3';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/auth/AuthContext';
import { SyncProvider } from './src/sync/SyncProvider';
import {
  QUERY_CACHE_MAX_AGE,
  queryPersister,
  shouldPersistQuery,
} from './src/sync/queryPersister';
import { RootNavigator } from './src/navigation/RootNavigator';
import { BrandMark } from './src/components';
import { colors } from './src/theme/tokens';

// Keep native splash screen visible while fonts and storage initialize
SplashScreen.preventAutoHideAsync().catch(() => { });

// gcTime must be >= how long we persist, or restored entries get evicted
// immediately on load (see src/sync/queryPersister.ts).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: QUERY_CACHE_MAX_AGE,
      retry: 2,
    },
  },
});

export default function App() {
  const [fontsLoaded] = useFonts({
    SourceSans3_400Regular,
    SourceSans3_500Medium,
    SourceSans3_600SemiBold,
    SourceSans3_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => { });
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <BrandMark size="lg" />
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: queryPersister,
          maxAge: QUERY_CACHE_MAX_AGE,
          dehydrateOptions: {
            shouldDehydrateQuery: (query) =>
              defaultShouldDehydrateQuery(query) && shouldPersistQuery(query),
          },
        }}
      >
        <AuthProvider>
          <SyncProvider>
            <RootNavigator />
            <StatusBar style="dark" />
          </SyncProvider>
        </AuthProvider>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
