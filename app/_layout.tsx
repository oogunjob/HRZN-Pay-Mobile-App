import '../shim';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppProviders } from '@/providers';
import { AppInitializer } from '@/components/AppInitializer';
import DevMenu from '@/components/DevMenu';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AppProviders>
      <AppInitializer />
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          <Stack.Screen name="add-wallet" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          <Stack.Screen name="manage-wallets" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
      {__DEV__ && <DevMenu />}
    </AppProviders>
  );
}
