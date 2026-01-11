import React, { useMemo, useLayoutEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  View,
  Text,
  ScrollView,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useStorage } from '@/providers';
import { satoshiToLocalCurrency, satoshiToBTC } from '@/blue_modules/currency';

// Wallet type to display config mapping
const WALLET_TYPE_CONFIG: Record<string, { color: string; icon: string; displayName: string }> = {
  'HDsegwitBech32': { color: '#f97316', icon: 'bitcoin', displayName: 'HD SegWit' },
  'HDlegacyP2PKH': { color: '#8b5cf6', icon: 'bitcoin', displayName: 'HD Legacy' },
  'HDsegwitP2SH': { color: '#3b82f6', icon: 'bitcoin', displayName: 'HD SegWit' },
  'HDtaproot': { color: '#10b981', icon: 'bitcoin', displayName: 'Taproot' },
  'lightningCustodianWallet': { color: '#eab308', icon: 'flash', displayName: 'Lightning' },
  'default': { color: '#6366f1', icon: 'wallet', displayName: 'Wallet' },
};

// Hardcoded sample transactions for demo
const SAMPLE_TRANSACTIONS = [
  {
    id: '1',
    type: 'received',
    amount: 50000,
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2),
    confirmations: 6,
    memo: 'Payment from Alice',
  },
  {
    id: '2',
    type: 'sent',
    amount: 25000,
    address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    confirmations: 144,
    memo: 'Coffee shop',
  },
  {
    id: '3',
    type: 'received',
    amount: 100000,
    address: 'bc1qc7slrfxkknqcq2jevvvkdgvrt8080852dfjewde450xdlk4ugp7szw5tk9',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    confirmations: 432,
    memo: '',
  },
  {
    id: '4',
    type: 'sent',
    amount: 15000,
    address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    confirmations: 1008,
    memo: 'Subscription',
  },
];

function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

function shortenAddress(address: string): string {
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-8)}`;
}

export default function WalletDetailScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { wallets } = useStorage();

  // Find the wallet by ID
  const wallet = useMemo(() => {
    return wallets.find(w => w.getID() === id);
  }, [wallets, id]);

  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const secondaryText = colorScheme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5';
  const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  // Get wallet config
  const config = wallet ? (WALLET_TYPE_CONFIG[wallet.type] || WALLET_TYPE_CONFIG.default) : WALLET_TYPE_CONFIG.default;

  // Get wallet balance
  const balanceSats = wallet?.getBalance() ?? 0;
  const balanceBTC = satoshiToBTC(balanceSats);
  const balanceUSD = satoshiToLocalCurrency(balanceSats);

  // // Set header options
  // useLayoutEffect(() => {
  //   navigation.setOptions({
  //     title: wallet?.getLabel() || 'Wallet',
  //     headerRight: () => (
  //       <TouchableOpacity
  //         onPress={() => router.push(`/wallet/options?id=${id}`)}
  //         style={{ marginRight: 8 }}
  //       >
  //         <MaterialCommunityIcons
  //           name="dots-horizontal"
  //           size={24}
  //           color={textColor}
  //         />
  //       </TouchableOpacity>
  //     ),
  //   });
  // }, [navigation, wallet, textColor, router, id]);

  if (!wallet) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.centerContent}>
          <MaterialCommunityIcons name="wallet-outline" size={64} color={secondaryText} />
          <ThemedText style={[styles.errorText, { color: secondaryText }]}>
            Wallet not found
          </ThemedText>
          <TouchableOpacity
            style={[styles.goBackButton, { backgroundColor: cardBg }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.goBackButtonText, { color: textColor }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  const handleSend = () => {
    // TODO: Implement send functionality
    console.log('Send pressed');
  };

  const handleReceive = () => {
    // TODO: Implement receive functionality
    console.log('Receive pressed');
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={{ flex: 1,  }}>
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          {/* Balance Section */}
          <View style={styles.balanceSection}>
            <Text style={[styles.balanceLabel, { color: secondaryText }]}>
              Balance
            </Text>
            <Text style={[styles.btcBalance, { color: textColor }]}>
              {balanceBTC} BTC
            </Text>
            <Text style={[styles.usdBalance, { color: secondaryText }]}>
              {balanceUSD}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButtonContainer}
              onPress={handleSend}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[config.color, config.color]}
                style={styles.actionButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialCommunityIcons name="arrow-up" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Send</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButtonContainer}
              onPress={handleReceive}
              activeOpacity={0.8}
            >
              <View style={[styles.actionButtonOutline, { borderColor: config.color }]}>
                <MaterialCommunityIcons name="arrow-down" size={20} color={config.color} />
                <Text style={[styles.actionButtonOutlineText, { color: config.color }]}>Receive</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Transactions Section */}
          <View style={styles.transactionsSection}>
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                Transactions
              </ThemedText>
            </View>

            {SAMPLE_TRANSACTIONS.length > 0 ? (
              <View style={[styles.transactionsList, { backgroundColor: cardBg, borderColor }]}>
                {SAMPLE_TRANSACTIONS.map((tx, index) => (
                  <TouchableOpacity
                    key={tx.id}
                    style={[
                      styles.transactionItem,
                      index < SAMPLE_TRANSACTIONS.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: borderColor,
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <View style={styles.txLeft}>
                      <View
                        style={[
                          styles.txIcon,
                          {
                            backgroundColor: tx.type === 'received' ? '#10b98120' : '#ef444420',
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={tx.type === 'received' ? 'arrow-down-left' : 'arrow-up-right'}
                          size={18}
                          color={tx.type === 'received' ? '#10b981' : '#ef4444'}
                        />
                      </View>
                      <View style={styles.txInfo}>
                        <Text style={[styles.txTitle, { color: textColor }]}>
                          {tx.memo || (tx.type === 'received' ? 'Received' : 'Sent')}
                        </Text>
                        <Text style={[styles.txDate, { color: secondaryText }]}>
                          {formatDate(tx.date)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.txRight}>
                      <Text
                        style={[
                          styles.txAmount,
                          { color: tx.type === 'received' ? '#10b981' : textColor },
                        ]}
                      >
                        {tx.type === 'received' ? '+' : '-'}{satoshiToBTC(tx.amount)}
                      </Text>
                      <Text style={[styles.txAmountLabel, { color: secondaryText }]}>
                        BTC
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={[styles.emptyState, { backgroundColor: cardBg }]}>
                <MaterialCommunityIcons
                  name="swap-horizontal"
                  size={40}
                  color={secondaryText}
                  style={{ marginBottom: 12 }}
                />
                <Text style={[styles.emptyText, { color: secondaryText }]}>
                  No transactions yet
                </Text>
                <Text style={[styles.emptySubtext, { color: secondaryText }]}>
                  Your transactions will appear here
                </Text>
              </View>
            )}
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
  },
  goBackButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  goBackButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 40,
  },
  balanceSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  balanceLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },
  btcBalance: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  usdBalance: {
    fontSize: 18,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  actionButtonContainer: {
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  actionButtonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    gap: 8,
  },
  actionButtonOutlineText: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionsSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  transactionsList: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  txIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: {
    flex: 1,
    gap: 2,
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  txDate: {
    fontSize: 13,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  txAmountLabel: {
    fontSize: 12,
    marginTop: 1,
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
