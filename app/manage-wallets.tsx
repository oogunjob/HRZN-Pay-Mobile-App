import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  View,
  ScrollView,
  Text,
  Alert,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useStorage } from '@/providers';

// Wallet type to display config mapping
const WALLET_TYPE_CONFIG: Record<string, { color: string; icon: string; displayName: string }> = {
  'HDsegwitBech32': { color: '#f97316', icon: 'bitcoin', displayName: 'HD Segwit' },
  'HDlegacyP2PKH': { color: '#8b5cf6', icon: 'bitcoin', displayName: 'HD Legacy' },
  'HDsegwitP2SH': { color: '#3b82f6', icon: 'bitcoin', displayName: 'HD Segwit' },
  'HDtaproot': { color: '#10b981', icon: 'bitcoin', displayName: 'Taproot' },
  'lightningCustodianWallet': { color: '#eab308', icon: 'flash', displayName: 'Lightning' },
  'default': { color: '#6366f1', icon: 'wallet', displayName: 'Wallet' },
};

export default function ManageWalletsScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { wallets, handleWalletDeletion } = useStorage();
  const [deletingWalletId, setDeletingWalletId] = useState<string | null>(null);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryText = colorScheme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5';
  const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  const getWalletConfig = (walletType: string) => {
    return WALLET_TYPE_CONFIG[walletType] || WALLET_TYPE_CONFIG.default;
  };

  const confirmDeleteWallet = (walletId: string, walletLabel: string) => {
    Alert.alert(
      'Delete Wallet',
      `Are you sure you want to delete "${walletLabel}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDelete(walletId),
        },
      ],
      { cancelable: true }
    );
  };

  const handleDelete = async (walletId: string) => {
    try {
      setDeletingWalletId(walletId);
      const success = await handleWalletDeletion(walletId);

      if (success) {
        Alert.alert('Success', 'Wallet deleted successfully');
      } else {
        Alert.alert('Error', 'Failed to delete wallet');
      }
    } catch (error) {
      console.error('Error deleting wallet:', error);
      Alert.alert('Error', 'An error occurred while deleting the wallet');
    } finally {
      setDeletingWalletId(null);
    }
  };

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
            <MaterialCommunityIcons name="close" size={24} color={textColor} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>Manage Wallets</ThemedText>
          <View style={styles.headerButton} />
        </ThemedView>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          {wallets.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: cardBg }]}>
              <MaterialCommunityIcons name="wallet-outline" size={48} color={secondaryText} />
              <Text style={[styles.emptyText, { color: secondaryText }]}>No wallets yet</Text>
              <Text style={[styles.emptySubtext, { color: secondaryText }]}>
                Add a wallet to get started
              </Text>
            </View>
          ) : (
            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: secondaryText }]}>
                Your Wallets ({wallets.length})
              </ThemedText>
              <View style={[styles.sectionContent, { backgroundColor: cardBg, borderColor }]}>
                {wallets.map((wallet, index) => {
                  const config = getWalletConfig(wallet.type);
                  const isDeleting = deletingWalletId === wallet.getID();

                  return (
                    <View
                      key={wallet.getID()}
                      style={[
                        styles.walletItem,
                        index < wallets.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor },
                      ]}
                    >
                      <View style={styles.walletLeft}>
                        <View style={[styles.walletIcon, { backgroundColor: `${config.color}20` }]}>
                          <MaterialCommunityIcons
                            name={config.icon as any}
                            size={24}
                            color={config.color}
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
                      <TouchableOpacity
                        style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
                        onPress={() => confirmDeleteWallet(wallet.getID(), wallet.getLabel())}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <MaterialCommunityIcons name="loading" size={20} color="#ef4444" />
                        ) : (
                          <MaterialCommunityIcons name="delete-outline" size={20} color="#ef4444" />
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Info Card */}
          <View style={styles.section}>
            <View style={[styles.infoCard, { backgroundColor: '#3b82f620', borderColor: '#3b82f6' }]}>
              <MaterialCommunityIcons name="information" size={24} color="#3b82f6" />
              <View style={styles.infoContent}>
                <Text style={[styles.infoText, { color: textColor }]}>
                  Deleting a wallet will permanently remove it from this device. Make sure you have
                  backed up your recovery phrase before deleting.
                </Text>
              </View>
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
    paddingTop: 0,
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
    paddingBottom: 40,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sectionContent: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  walletItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletInfo: {
    flex: 1,
    gap: 4,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '600',
  },
  walletType: {
    fontSize: 13,
  },
  deleteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    borderRadius: 16,
    marginHorizontal: 20,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoText: {
    fontSize: 15,
    lineHeight: 20,
  },
});
