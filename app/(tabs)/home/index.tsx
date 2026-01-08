import React from 'react';
import { StyleSheet, TouchableOpacity, StatusBar, Dimensions, View, Text, ScrollView } from 'react-native';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useStorage } from '@/providers';
import { satoshiToLocalCurrency, satoshiToBTC } from '@/blue_modules/currency';

const { width } = Dimensions.get('window');

// Wallet type to display config mapping
const WALLET_TYPE_CONFIG: Record<string, { color: string; icon: string; displayName: string }> = {
  'HDsegwitBech32': { color: '#f97316', icon: 'bitcoin', displayName: 'HD Segwit' },
  'HDlegacyP2PKH': { color: '#8b5cf6', icon: 'bitcoin', displayName: 'HD Legacy' },
  'HDsegwitP2SH': { color: '#3b82f6', icon: 'bitcoin', displayName: 'HD Segwit' },
  'HDtaproot': { color: '#10b981', icon: 'bitcoin', displayName: 'Taproot' },
  'lightningCustodianWallet': { color: '#eab308', icon: 'flash', displayName: 'Lightning' },
  'default': { color: '#6366f1', icon: 'wallet', displayName: 'Wallet' },
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { wallets } = useStorage();

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryText = colorScheme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5';
  const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  // Calculate total balance in satoshis
  const totalBalanceSats = wallets.reduce((sum, wallet) => sum + wallet.getBalance(), 0);
  const totalBalanceBTC = satoshiToBTC(totalBalanceSats);

  // Get wallet config for display
  const getWalletConfig = (walletType: string) => {
    return WALLET_TYPE_CONFIG[walletType] || WALLET_TYPE_CONFIG.default;
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
                ₿ {totalBalanceBTC}
              </ThemedText>
              <ThemedText style={[styles.usdBalance, { color: secondaryText }]}>
                {satoshiToLocalCurrency(totalBalanceSats)}
              </ThemedText>
            </View>
          </ThemedView>

          {/* Wallets Section */}
          <View style={styles.walletsSection}>
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                Wallets
              </ThemedText>
              <TouchableOpacity onPress={() => router.push('/manage-wallets')}>
                <Text style={[styles.sectionAction, { color: '#f97316' }]}>
                  Manage
                </Text>
              </TouchableOpacity>
            </View>

            {wallets.map((wallet) => {
              const config = getWalletConfig(wallet.type);
              const balanceSats = wallet.getBalance();
              const balanceBTC = satoshiToBTC(balanceSats);

              return (
                <TouchableOpacity
                  key={wallet.getID()}
                  style={[styles.walletCard, { backgroundColor: cardBg, borderColor }]}
                >
                  <View style={styles.walletLeft}>
                    <View style={[styles.walletIcon, { backgroundColor: config.color }]}>
                      <MaterialCommunityIcons
                        name={config.icon as any}
                        size={20}
                        color="#fff"
                      />
                    </View>
                    <View style={styles.walletInfo}>
                      <Text style={[styles.walletName, { color: textColor }]}>
                        {wallet.getLabel()}
                      </Text>
                      <Text style={[styles.walletType, { color: secondaryText }]}>
                        {config.displayName}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.walletRight}>
                    <Text style={[styles.walletBalance, { color: textColor }]}>
                      ₿ {balanceBTC}
                    </Text>
                    <Text style={[styles.walletBalanceUSD, { color: secondaryText }]}>
                      {satoshiToLocalCurrency(balanceSats)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Add Wallet Button */}
            <TouchableOpacity
              style={[styles.addWalletBtn, { borderColor, borderStyle: 'dashed' }]}
              onPress={() => router.push('/add-wallet')}
            >
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
