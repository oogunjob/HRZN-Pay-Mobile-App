import React from 'react';
import { StyleSheet, TouchableOpacity, StatusBar, View } from 'react-native';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

const BTC_PRICE_USD = 91000; // Hardcoded Bitcoin price

export default function BitcoinPriceScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const secondaryText = colorScheme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5';
  const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  const formattedPrice = BTC_PRICE_USD.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={{ flex: 1, paddingTop: insets.top }}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>Bitcoin Price</ThemedText>
          <View style={styles.headerButton} />
        </ThemedView>

        {/* Price Display */}
        <View style={styles.priceContainer}>
          {/* Bitcoin Icon */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="bitcoin" size={64} color="#f97316" />
          </View>

          {/* Price Label */}
          <ThemedText style={[styles.priceLabel, { color: secondaryText }]}>
            Current Price
          </ThemedText>

          {/* Price Value */}
          <ThemedText style={[styles.priceValue, { color: textColor }]}>
            {formattedPrice}
          </ThemedText>

          {/* Price Info Card */}
          <View style={[styles.infoCard, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.infoRow}>
              <ThemedText style={[styles.infoLabel, { color: secondaryText }]}>
                1 BTC
              </ThemedText>
              <ThemedText style={[styles.infoValue, { color: textColor }]}>
                {formattedPrice}
              </ThemedText>
            </View>
            <View style={[styles.divider, { backgroundColor: borderColor }]} />
            <View style={styles.infoRow}>
              <ThemedText style={[styles.infoLabel, { color: secondaryText }]}>
                1 sat
              </ThemedText>
              <ThemedText style={[styles.infoValue, { color: textColor }]}>
                ${(BTC_PRICE_USD / 100000000).toFixed(6)}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  priceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 56,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  infoCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
});

