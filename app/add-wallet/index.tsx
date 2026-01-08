import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  View,
  ScrollView,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
  BackHandler,
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
import SeedWords from '@/components/SeedWords';

type WalletType = 'HD Segwit (Bech32)' | 'HD Legacy' | 'HD Taproot';
type Step = 'create' | 'backup';

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

const DEFAULT_WALLET_NAME = 'Wallet';

export default function AddWalletScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addWallet, saveToDisk, wallets } = useStorage();

  const [step, setStep] = useState<Step>('create');
  const [walletName, setWalletName] = useState('');
  const [selectedType, setSelectedType] = useState<WalletType>('HD Segwit (Bech32)');
  const [isCreating, setIsCreating] = useState(false);
  const [createdWalletID, setCreatedWalletID] = useState<string | null>(null);

  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const secondaryText = colorScheme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5';
  const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  // Get the created wallet
  const createdWallet = createdWalletID ? wallets.find(w => w.getID() === createdWalletID) : null;

  // Get all existing wallet names
  const existingWalletNames = wallets.map(w => w.getLabel().toLowerCase());

  // Check if a wallet name already exists
  const walletNameExists = useCallback((name: string) => {
    return existingWalletNames.includes(name.toLowerCase().trim());
  }, [existingWalletNames]);

  // Generate the next available default wallet name
  const getNextDefaultWalletName = useCallback(() => {
    // Check if "Wallet" is available
    if (!walletNameExists(DEFAULT_WALLET_NAME)) {
      return DEFAULT_WALLET_NAME;
    }
    
    // Find the next available number
    let counter = 1;
    while (walletNameExists(`${DEFAULT_WALLET_NAME} #${counter}`)) {
      counter++;
    }
    return `${DEFAULT_WALLET_NAME} #${counter}`;
  }, [walletNameExists]);

  const handleClose = useCallback(() => {
    if (step === 'backup') {
      Alert.alert(
        'Warning',
        'Make sure you have written down your seed phrase. Without it, you cannot recover your wallet.',
        [
          { text: 'Go Back', style: 'cancel' },
          { text: 'I Saved It', onPress: () => router.back(), style: 'destructive' },
        ]
      );
    } else {
      router.back();
    }
  }, [step, router]);

  // Handle hardware back button
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose();
      return true;
    });
    return () => subscription.remove();
  }, [handleClose]);

  const handleCreateWallet = async () => {
    try {
      const customName = walletName.trim();
      
      // If user provided a custom name, check for duplicates
      if (customName && walletNameExists(customName)) {
        Alert.alert(
          'Name Already Exists',
          `A wallet named "${customName}" already exists. Please choose a different name.`
        );
        return;
      }

      setIsCreating(true);

      const walletTypeOption = WALLET_TYPES.find(wt => wt.type === selectedType);
      if (!walletTypeOption) {
        throw new Error('Invalid wallet type selected');
      }

      const wallet = new walletTypeOption.class();
      
      // Use custom name if provided, otherwise generate default name
      const label = customName || getNextDefaultWalletName();
      wallet.setLabel(label);

      await wallet.generate();

      addWallet(wallet);
      await saveToDisk();

      // Store wallet ID and switch to backup step
      setCreatedWalletID(wallet.getID());
      setStep('backup');
    } catch (error: any) {
      console.error('Error creating wallet:', error);
      Alert.alert('Error', error.message || 'Failed to create wallet');
    } finally {
      setIsCreating(false);
    }
  };

  const handleBackupDone = useCallback(() => {
    // Simply close the modal
    router.back();
  }, [router]);

  const handleImportWallet = () => {
    Alert.alert('Coming Soon', 'Import wallet feature will be available soon!');
  };

  // Render Create Wallet Step
  const renderCreateStep = () => (
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
            placeholder={getNextDefaultWalletName()}
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
  );

  // Render Backup Step
  const renderBackupStep = () => {
    if (!createdWallet) return null;

    const seed = createdWallet.getSecret();

    return (
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Warning Card */}
        <View style={[styles.warningCard, { backgroundColor: '#ef444420', borderColor: '#ef4444' }]}>
          <View style={styles.warningIcon}>
            <MaterialCommunityIcons name="alert-circle" size={36} color="#ef4444" />
          </View>
          <View style={styles.warningContent}>
            <Text style={[styles.warningTitle, { color: '#ef4444' }]}>
              Important!
            </Text>
            <Text style={[styles.warningText, { color: textColor }]}>
              Write down these words in order and keep them safe. Never share them with anyone.
              This is the only way to recover your wallet.
            </Text>
          </View>
        </View>

        {/* Wallet Info */}
        <View style={styles.section}>
          <View style={[styles.infoCard, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: secondaryText }]}>Wallet Name</Text>
              <Text style={[styles.infoValue, { color: textColor }]}>{createdWallet.getLabel()}</Text>
            </View>
            <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: borderColor }]}>
              <Text style={[styles.infoLabel, { color: secondaryText }]}>Type</Text>
              <Text style={[styles.infoValue, { color: textColor }]}>{createdWallet.typeReadable}</Text>
            </View>
          </View>
        </View>

        {/* Seed Phrase */}
        <View style={styles.section}>
          <ThemedText style={styles.recoveryPhraseTitle}>
            Your Recovery Phrase
          </ThemedText>
          <View style={[styles.seedContainer, { backgroundColor: cardBg, borderColor }]}>
            <SeedWords seed={seed} />
          </View>
        </View>

        {/* Security Tips */}
        <View style={styles.section}>
          <ThemedText style={styles.securityTipsTitle}>
            Security Tips
          </ThemedText>
          <View style={[styles.tipsCard, { backgroundColor: cardBg, borderColor }]}>
            {[
              'Write it down on paper and store it securely',
              'Never store it digitally or take a screenshot',
              'Keep multiple copies in different safe locations',
              'Never share it with anyone, including support staff',
            ].map((tip, index) => (
              <View key={index} style={styles.tipRow}>
                <MaterialCommunityIcons name="check-circle" size={22} color="#10b981" />
                <ThemedText style={styles.tipText}>{tip}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Done Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.doneButtonContainer}
            onPress={handleBackupDone}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#f97316', '#ea580c']}
              style={styles.doneButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
              <Text style={styles.doneButtonText}>I've Written It Down</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={{ flex: 1, paddingTop: insets.top }}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleClose}
          >
            <MaterialCommunityIcons name="close" size={24} color={textColor} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>
            {step === 'create' ? 'Add Wallet' : 'Backup Wallet'}
          </ThemedText>
          <View style={styles.headerButton} />
        </ThemedView>

        {step === 'create' ? renderCreateStep() : renderBackupStep()}
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
  // Backup step styles
  warningCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 24,
    marginHorizontal: 20,
    gap: 12,
  },
  warningIcon: {
    paddingTop: 2,
  },
  warningContent: {
    flex: 1,
    gap: 4,
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  warningText: {
    fontSize: 16,
    lineHeight: 24,
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  recoveryPhraseTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  seedContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  securityTipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  tipsCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 18,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  doneButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  doneButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    gap: 8,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
