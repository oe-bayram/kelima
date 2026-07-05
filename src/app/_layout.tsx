import '@/lib/amplify'; // MUSS zuerst laufen: Polyfills + Amplify.configure()
import '@/global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuthSession } from '@/features/auth/useAuthSession';
import i18n from '@/lib/i18n';
import { persistOptions, queryClient } from '@/lib/queryClient';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
          <I18nextProvider i18n={i18n}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <BottomSheetModalProvider>
                <RootNavigator />
              </BottomSheetModalProvider>
            </ThemeProvider>
          </I18nextProvider>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Auth-Gate: `Stack.Protected` (das SDK-57-Idiom) blendet abhängig vom
 * Login-Status die (app)- oder (auth)-Gruppe ein. Der Splash bleibt sichtbar,
 * bis Amplify den Auth-Status aufgelöst hat. Der Status kommt aus
 * `useAuthSession` (Amplify-Hub), damit die Navigation sofort auf unsere
 * direkten signIn/signOut-Calls reagiert.
 */
function RootNavigator() {
  const authStatus = useAuthSession();

  useEffect(() => {
    if (authStatus !== 'configuring') {
      void SplashScreen.hideAsync();
    }
  }, [authStatus]);

  const isAuthenticated = authStatus === 'authenticated';

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" />
        <Stack.Screen name="session/learn" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="session/test" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="session/summary" options={{ presentation: 'fullScreenModal' }} />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
