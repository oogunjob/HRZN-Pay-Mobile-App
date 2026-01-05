import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, StatusBar, Dimensions, View, Text, ScrollView } from 'react-native';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

const { width } = Dimensions.get('window');

// Mock data for wallets
const MOCK_WALLETS = [
  { id: '1', name: 'Main Wallet', balance: 0.05234, type: 'HD', color: '#f97316', included: true },
  { id: '2', name: 'Savings', balance: 0.15000, type: 'HD', color: '#8b5cf6', included: true },
  { id: '3', name: 'Trading', balance: 0.00891, type: 'Lightning', color: '#3b82f6', included: false },
];

const BTC_PRICE_USD = 91000; // Mock BTC price

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [wallets, setWallets] = useState(MOCK_WALLETS);
  const [showAllWallets, setShowAllWallets] = useState(false);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryText = colorScheme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5';
  const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  const totalBalance = wallets
    .filter(w => w.included)
    .reduce((sum, w) => sum + w.balance, 0);

  const totalUSD = totalBalance * BTC_PRICE_USD;

  const toggleWalletInclusion = (id: string) => {
    setWallets(wallets.map(w => 
      w.id === id ? { ...w, included: !w.included } : w
    ));
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={{ flex: 1, paddingTop: insets.top }}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/home/bitcoin')}
          >
            <MaterialCommunityIcons name="chart-timeline-variant" size={24} color={textColor} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>Home</ThemedText>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/settings')}
          >
            <MaterialCommunityIcons name="cog" size={24} color={textColor} />
          </TouchableOpacity>
        </ThemedView>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          {/* Balance Display */}
          <ThemedView style={styles.balanceContainer}>
            <ThemedText style={[styles.totalBalanceLabel, { color: secondaryText }]}>
              Total Balance
            </ThemedText>
            <View style={styles.balanceValuesContainer}>
              <ThemedText style={[styles.btcBalance, { color: textColor }]}>
                ₿ {totalBalance.toFixed(8)}
              </ThemedText>
              <ThemedText style={[styles.usdBalance, { color: secondaryText }]}>
                ${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </ThemedText>
            </View>
          </ThemedView>

          {/* Wallets Section */}
          <View style={styles.walletsSection}>
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                Wallets
              </ThemedText>
              <TouchableOpacity onPress={() => setShowAllWallets(!showAllWallets)}>
                <Text style={[styles.sectionAction, { color: '#f97316' }]}>
                  {showAllWallets ? 'Show Less' : 'Manage'}
                </Text>
              </TouchableOpacity>
            </View>

            {wallets.map((wallet) => (
              <TouchableOpacity
                key={wallet.id}
                style={[styles.walletCard, { backgroundColor: cardBg, borderColor }]}
                onLongPress={() => toggleWalletInclusion(wallet.id)}
              >
                <View style={styles.walletLeft}>
                  <View style={[styles.walletIcon, { backgroundColor: wallet.color }]}>
                    <MaterialCommunityIcons 
                      name={wallet.type === 'Lightning' ? 'flash' : 'bitcoin'} 
                      size={20} 
                      color="#fff" 
                    />
                  </View>
                  <View style={styles.walletInfo}>
                    <Text style={[styles.walletName, { color: textColor }]}>
                      {wallet.name}
                    </Text>
                    <Text style={[styles.walletType, { color: secondaryText }]}>
                      {wallet.type}
                    </Text>
                  </View>
                </View>
                <View style={styles.walletRight}>
                  <Text style={[styles.walletBalance, { color: textColor }]}>
                    ₿ {wallet.balance.toFixed(5)}
                  </Text>
                  <Text style={[styles.walletBalanceUSD, { color: secondaryText }]}>
                    ${(wallet.balance * BTC_PRICE_USD).toFixed(2)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Add Wallet Button */}
            <TouchableOpacity style={[styles.addWalletBtn, { borderColor, borderStyle: 'dashed' }]}>
              <MaterialCommunityIcons name="plus" size={24} color={secondaryText} style={{ marginBottom: 4 }} />
              <Text style={[styles.addWalletText, { color: secondaryText }]}>
                Add Wallet
              </Text>
            </TouchableOpacity>
          </View>

          {/* Recent Transactions Preview */}
          <View style={styles.transactionsSection}>
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                Recent Activity
              </ThemedText>
              <TouchableOpacity>
                <Text style={[styles.sectionAction, { color: '#f97316' }]}>
                  See All
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.emptyState, { backgroundColor: cardBg }]}>
              <MaterialCommunityIcons name="credit-card-outline" size={40} color={secondaryText} style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyText, { color: secondaryText }]}>
                No recent transactions
              </Text>
              <Text style={[styles.emptySubtext, { color: secondaryText }]}>
                Your activity will appear here
              </Text>
            </View>
          </View>
        </ScrollView>
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
  content: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingTop: 5,
  },
  balanceContainer: {
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 30,
  },
  totalBalanceLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  balanceValuesContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 5,
  },
  btcBalance: {
    fontSize: 48,
    fontWeight: 'bold',
    lineHeight: 60,
    marginBottom: 8,
  },
  usdBalance: {
    fontSize: 20,
    fontWeight: '500',
  },
  priceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
    gap: 12,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceChangeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  walletsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionAction: {
    fontSize: 15,
    fontWeight: '600',
  },
  walletCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    position: 'relative',
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletInfo: {
    gap: 2,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '600',
  },
  walletType: {
    fontSize: 13,
  },
  walletRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  walletBalance: {
    fontSize: 16,
    fontWeight: '600',
  },
  walletBalanceUSD: {
    fontSize: 13,
  },
  excludedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  excludedText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  addWalletBtn: {
    alignItems: 'center',
    paddingVertical: 24,
    borderRadius: 16,
    borderWidth: 2,
  },
  addWalletText: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionsSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
  },
});
