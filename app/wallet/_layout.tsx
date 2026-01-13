import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function WalletLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
    >
      <Stack.Screen name="[id]"  options={{ headerShown: false }} />
      <Stack.Screen
        name="options"
        options={{
          title: 'Options',
        }}
      />
    </Stack>
  );
}
