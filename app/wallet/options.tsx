import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function WalletOptionsScreen() {
  const colorScheme = useColorScheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const secondaryText = colorScheme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons
          name="cog-outline"
          size={64}
          color={secondaryText}
          style={{ marginBottom: 16 }}
        />
        <ThemedText style={styles.title}>Options</ThemedText>
        <Text style={[styles.subtitle, { color: secondaryText }]}>
          Wallet options coming soon
        </Text>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});
