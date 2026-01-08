import { Stack } from 'expo-router';

export default function AddWalletLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="backup" options={{ headerShown: false }} />
    </Stack>
  );
}
