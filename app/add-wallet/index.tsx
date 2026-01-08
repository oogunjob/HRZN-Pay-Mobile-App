import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  View,
  ScrollView,
  Text,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useStorage } from '@/providers';
import { HDSegwitBech32Wallet, HDLegacyP2PKHWallet, HDTaprootWallet } from '@/class';
import loc from '@/loc';

type WalletType = 'HD Segwit (Bech32)' | 'HD Legacy' | 'HD Taproot';

interface WalletTypeOption {
  type: WalletType;
  subtitle: string;
  icon: string;
  color: string;
  class: typeof HDSegwitBech32Wallet | typeof HDLegacyP2PKHWallet | typeof HDTaprootWallet;
}

const WALLET_TYPES: WalletTypeOption[] = [
  {
    type: 'HD Segwit (Bech32)',
    subtitle: 'p2wpkh/HD - Recommended',
    icon: 'bitcoin',
    color: '#f97316',
    class: HDSegwitBech32Wallet,
  },
  {
    type: 'HD Legacy',
    subtitle: 'p2pkh/HD - Legacy addresses',
    icon: 'bitcoin',
    color: '#8b5cf6',
    class: HDLegacyP2PKHWallet,
  },
  {
    type: 'HD Taproot',
    subtitle: 'p2tr/HD - Latest standard',
    icon: 'bitcoin',
    color: '#3b82f6',
    class: HDTaprootWallet,
  },
];

export default function AddWalletScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addWallet, saveToDisk } = useStorage();

  const [walletName, setWalletName] = useState('');
  const [selectedType, setSelectedType] = useState<WalletType>('HD Segwit (Bech32)');
  const [isCreating, setIsCreating] = useState(false);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryText = colorScheme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5';
  const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  const handleCreateWallet = async () => {
    try {
      setIsCreating(true);

      // Find the selected wallet type
      const walletTypeOption = WALLET_TYPES.find(wt => wt.type === selectedType);
      if (!walletTypeOption) {
        throw new Error('Invalid wallet type selected');
      }

      // Create new wallet instance
      const wallet = new walletTypeOption.class();

      // Set label
      const label = walletName.trim() || loc.wallets.details_title;
      wallet.setLabel(label);

      // Generate wallet
      await wallet.generate();

      // Add to storage
      addWallet(wallet);
      await saveToDisk();

      // Navigate to backup screen
      router.push({
        pathname: '/add-wallet/backup',
        params: { walletID: wallet.getID() },
      });
    } catch (error: any) {
      console.error('Error creating wallet:', error);
      Alert.alert('Error', error.message || 'Failed to create wallet');
    } finally {
      setIsCreating(false);
    }
  };

  const handleImportWallet = () => {
    // TODO: Implement import wallet flow
    Alert.alert('Coming Soon', 'Import wallet feature will be available soon!');
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
          <ThemedText type="title" style={styles.headerTitle}>Add Wallet</ThemedText>
          <View style={styles.headerButton} />
        </ThemedView>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          {/* Wallet Name Section */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: secondaryText }]}>
              Wallet Name
            </ThemedText>
            <View style={[styles.inputContainer, { backgroundColor: cardBg, borderColor }]}>
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="My Bitcoin Wallet"
                placeholderTextColor={secondaryText}
                value={walletName}
                onChangeText={setWalletName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Wallet Type Section */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: secondaryText }]}>
              Wallet Type
            </ThemedText>
            <View style={[styles.sectionContent, { backgroundColor: cardBg, borderColor }]}>
              {WALLET_TYPES.map((walletType, index) => (
                <TouchableOpacity
                  key={walletType.type}
                  style={[
                    styles.typeOption,
                    index < WALLET_TYPES.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor },
                  ]}
                  onPress={() => setSelectedType(walletType.type)}
                >
                  <View style={styles.typeLeft}>
                    <View style={[styles.typeIcon, { backgroundColor: `${walletType.color}20` }]}>
                      <MaterialCommunityIcons
                        name={walletType.icon as any}
                        size={24}
                        color={walletType.color}
                      />
                    </View>
                    <View style={styles.typeInfo}>
                      <Text style={[styles.typeTitle, { color: textColor }]}>
                        {walletType.type}
                      </Text>
                      <Text style={[styles.typeSubtitle, { color: secondaryText }]}>
                        {walletType.subtitle}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.typeRight}>
                    {selectedType === walletType.type ? (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={24}
                        color={walletType.color}
                      />
                    ) : (
                      <View style={[styles.radioOuter, { borderColor }]}>
                        <View style={styles.radioInner} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Create Button */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.createButtonContainer}
              onPress={handleCreateWallet}
              disabled={isCreating}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#f97316', '#ea580c']}
                style={styles.createButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isCreating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="plus-circle" size={20} color="#fff" />
                    <Text style={styles.createButtonText}>Create Wallet</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Import Button */}
            <TouchableOpacity
              style={[
                styles.importButton,
                {
                  backgroundColor: colorScheme === 'dark' ? '#4a4a4a' : '#e5e5e5',
                  borderColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                }
              ]}
              onPress={handleImportWallet}
              disabled={isCreating}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons
                name="import"
                size={20}
                color={colorScheme === 'dark' ? '#fff' : '#333'}
              />
              <Text style={[
                styles.importButtonText,
                { color: colorScheme === 'dark' ? '#fff' : '#333' }
              ]}>
                Import Existing Wallet
              </Text>
            </TouchableOpacity>
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
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  inputContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  input: {
    padding: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  sectionContent: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  typeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  typeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeInfo: {
    flex: 1,
    gap: 4,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  typeSubtitle: {
    fontSize: 13,
  },
  typeRight: {
    marginLeft: 12,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  createButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    gap: 8,
  },
  importButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
