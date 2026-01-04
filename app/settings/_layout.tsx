import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ presentation: 'fullScreenModal', headerShown: false }} />
      <Stack.Screen name="about" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}

