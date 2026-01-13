import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  LayoutAnimation,
  Platform,
  UIManager,
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
import { HDSegwitBech32Wallet, HDLegacyP2PKHWallet, HDTaprootWallet, WatchOnlyWallet } from '@/class';
import SeedWords from '@/components/SeedWords';
import startImport, { TImport } from '@/class/wallet-import';
import type { TWallet } from '@/class/wallets/types';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type WalletType = 'HD Segwit (Bech32)' | 'HD Legacy' | 'HD Taproot';
type Step = 'create' | 'backup' | 'import-select-words' | 'import-enter-seed' | 'import-discovery';
type SeedWordCount = 12 | 20 | 24;

interface DiscoveredWallet {
  wallet: TWallet;
  subtitle: string;
  id: string;
}

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
  const { addWallet, saveToDisk, wallets, addAndSaveWallet } = useStorage();

  const [step, setStep] = useState<Step>('create');
  const [walletName, setWalletName] = useState('');
  const [selectedType, setSelectedType] = useState<WalletType>('HD Segwit (Bech32)');
  const [isCreating, setIsCreating] = useState(false);
  const [createdWalletID, setCreatedWalletID] = useState<string | null>(null);

  // Import wallet states
  const [seedWordCount, setSeedWordCount] = useState<SeedWordCount>(12);
  const [seedWords, setSeedWords] = useState<string[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredWallets, setDiscoveredWallets] = useState<DiscoveredWallet[]>([]);
  const [selectedWalletIndex, setSelectedWalletIndex] = useState(0);
  const [discoveryProgress, setDiscoveryProgress] = useState<string>('');
  const importTask = useRef<TImport | null>(null);

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
    } else if (step.startsWith('import-')) {
      // Stop any ongoing import task
      importTask.current?.stop();
      // Reset import state and go back to create step
      setSeedWords([]);
      setDiscoveredWallets([]);
      setSelectedWalletIndex(0);
      setDiscoveryProgress('');
      setStep('create');
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
    // Initialize seed words array based on count and reset wallet name
    setSeedWords(Array(seedWordCount).fill(''));
    setWalletName(''); // Reset wallet name for import
    setStep('import-select-words');
  };

  const handleSeedWordCountSelect = (count: SeedWordCount) => {
    setSeedWordCount(count);
    setSeedWords(Array(count).fill(''));
  };

  const handleContinueToSeedInput = () => {
    setStep('import-enter-seed');
  };

  const handleSeedWordChange = (index: number, value: string) => {
    const newSeedWords = [...seedWords];
    // Normalize: lowercase and trim
    newSeedWords[index] = value.toLowerCase().trim();
    setSeedWords(newSeedWords);
  };

  const handlePasteSeedPhrase = async () => {
    try {
      const Clipboard = require('@react-native-clipboard/clipboard').default;
      const text = await Clipboard.getString();
      if (text) {
        const words = text.trim().toLowerCase().split(/\s+/);
        if (words.length === seedWordCount) {
          setSeedWords(words);
        } else {
          Alert.alert(
            'Invalid Seed Phrase',
            `Expected ${seedWordCount} words but got ${words.length} words.`
          );
        }
      }
    } catch (error) {
      console.error('Failed to paste:', error);
    }
  };

  const isValidSeedPhrase = useCallback(() => {
    // Check all words are filled
    return seedWords.every(word => word.length > 0);
  }, [seedWords]);

  const handleStartDiscovery = useCallback(() => {
    if (!isValidSeedPhrase()) {
      Alert.alert('Incomplete', 'Please enter all seed words.');
      return;
    }

    const seedPhrase = seedWords.join(' ');

    // Validate the mnemonic
    const testWallet = new HDSegwitBech32Wallet();
    testWallet.setSecret(seedPhrase);
    if (!testWallet.validateMnemonic()) {
      Alert.alert('Invalid Seed Phrase', 'The seed phrase you entered is not valid. Please check your words and try again.');
      return;
    }

    // Check if a wallet with this seed phrase already exists
    const existingWallet = wallets.find(w => {
      try {
        const existingSecret = w.getSecret();
        // Normalize both secrets for comparison (lowercase, trim, single spaces)
        const normalizedExisting = existingSecret?.toLowerCase().trim().replace(/\s+/g, ' ');
        const normalizedNew = seedPhrase.toLowerCase().trim().replace(/\s+/g, ' ');
        return normalizedExisting === normalizedNew;
      } catch {
        return false;
      }
    });

    if (existingWallet) {
      Alert.alert(
        'Wallet Already Exists',
        `A wallet with this seed phrase already exists: "${existingWallet.getLabel()}". You cannot import the same wallet twice.`
      );
      return;
    }

    setStep('import-discovery');
    setIsDiscovering(true);
    setDiscoveredWallets([]);
    setSelectedWalletIndex(0);

    const onProgress = (progress: string) => {
      setDiscoveryProgress(progress);
    };

    const onWallet = (wallet: TWallet) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const id = wallet.getID();
      let subtitle: string | undefined;

      try {
        if (wallet.type === WatchOnlyWallet.type) {
          subtitle = wallet.getAddress();
        } else {
          subtitle = (wallet as any).getDerivationPath?.() || '';
        }
      } catch (e) {
        subtitle = '';
      }

      setDiscoveredWallets(prev => {
        // Avoid duplicates
        if (prev.some(w => w.id === id)) return prev;
        return [...prev, { wallet, subtitle: subtitle || '', id }];
      });
    };

    const onPassword = async (title: string, text: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        if (Platform.OS === 'ios') {
          Alert.prompt(
            title || 'Password Required',
            text || 'Enter passphrase',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => reject(new Error('Cancel Pressed')) },
              { text: 'OK', onPress: (password?: string) => resolve(password || '') },
            ],
            'secure-text'
          );
        } else {
          // For Android, we'll use a simple alert for now
          // In production, you'd want to use a modal with TextInput
          Alert.alert(
            title || 'Password Required',
            text || 'Passphrase input is not supported on this platform yet.',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => reject(new Error('Cancel Pressed')) },
              { text: 'Continue without passphrase', onPress: () => resolve('') },
            ]
          );
        }
      });
    };

    importTask.current = startImport(
      seedPhrase,
      false, // askPassphrase
      false, // searchAccounts
      false, // offline
      onProgress,
      onWallet,
      onPassword
    );

    importTask.current.promise
      .then(({ cancelled, wallets: foundWallets }) => {
        if (cancelled) return;

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsDiscovering(false);

        if (foundWallets.length === 0) {
          // If no wallets found with history, still show the default HD wallet
          Alert.alert(
            'No Wallet History Found',
            'No transaction history was found, but you can still import the wallet.'
          );
        }
      })
      .catch((error) => {
        console.error('Import error:', error);
        setIsDiscovering(false);
        if (error.message !== 'Cancel Pressed' && error.message !== 'Discovery stopped') {
          Alert.alert('Import Error', error.message);
        }
      });

    return () => {
      importTask.current?.stop();
    };
  }, [seedWords, isValidSeedPhrase]);

  const handleImportSelectedWallet = useCallback(async () => {
    if (discoveredWallets.length === 0) return;

    const selectedWallet = discoveredWallets[selectedWalletIndex].wallet;

    // Check if this wallet already exists (by ID)
    if (wallets.some(w => w.getID() === selectedWallet.getID())) {
      Alert.alert('Wallet Already Exists', 'This wallet has been previously imported.');
      return;
    }

    // Set the wallet label - use custom name if provided, otherwise use default
    const customName = walletName.trim();
    const finalLabel = customName || getNextDefaultWalletName();

    if (customName && walletNameExists(customName)) {
      Alert.alert(
        'Name Already Exists',
        `A wallet named "${customName}" already exists. Please choose a different name.`
      );
      return;
    }

    selectedWallet.setLabel(finalLabel);

    try {
      setIsCreating(true);

      // Use addWallet and saveToDisk directly to preserve our custom label
      // (addAndSaveWallet would overwrite "Wallet" label with "Imported...")
      addWallet(selectedWallet);
      await saveToDisk();

      Alert.alert('Success', 'Wallet imported successfully!');
      router.back();
    } catch (error: any) {
      console.error('Error importing wallet:', error);
      Alert.alert('Error', error.message || 'Failed to import wallet');
    } finally {
      setIsCreating(false);
    }
  }, [discoveredWallets, selectedWalletIndex, wallets, walletName, walletNameExists, getNextDefaultWalletName, addWallet, saveToDisk, router]);

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

  // Render Import Select Words Step
  const renderImportSelectWordsStep = () => {
    const wordCountOptions: { count: SeedWordCount; label: string }[] = [
      { count: 12, label: '12 Words' },
      { count: 20, label: '20 Words' },
      { count: 24, label: '24 Words' },
    ];

    return (
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Info Card */}
        <View style={[styles.infoCardImport, { backgroundColor: '#3b82f620', borderColor: '#3b82f6' }]}>
          <View style={styles.warningIcon}>
            <MaterialCommunityIcons name="key-variant" size={36} color="#3b82f6" />
          </View>
          <View style={styles.warningContent}>
            <Text style={[styles.warningTitle, { color: '#3b82f6' }]}>
              Import Your Wallet
            </Text>
            <Text style={[styles.warningText, { color: textColor }]}>
              Enter your recovery seed phrase to restore an existing wallet. Select how many words your seed phrase contains.
            </Text>
          </View>
        </View>

        {/* Seed Word Count Selection */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: secondaryText }]}>
            Seed Phrase Length
          </ThemedText>
          <View style={[styles.sectionContent, { backgroundColor: cardBg, borderColor }]}>
            {wordCountOptions.map((option, index) => (
              <TouchableOpacity
                key={option.count}
                style={[
                  styles.typeOption,
                  index < wordCountOptions.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor },
                ]}
                onPress={() => handleSeedWordCountSelect(option.count)}
              >
                <View style={styles.typeLeft}>
                  <View style={[styles.typeIcon, { backgroundColor: '#3b82f620' }]}>
                    <ThemedText style={styles.wordCountNumber}>{option.count}</ThemedText>
                  </View>
                  <View style={styles.typeInfo}>
                    <Text style={[styles.typeTitle, { color: textColor }]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.typeSubtitle, { color: secondaryText }]}>
                      {option.count === 12 ? 'Most common format' :
                       option.count === 20 ? 'Extended security' : 'Maximum security'}
                    </Text>
                  </View>
                </View>
                <View style={styles.typeRight}>
                  {seedWordCount === option.count ? (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={24}
                      color="#3b82f6"
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

        {/* Continue Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.createButtonContainer}
            onPress={handleContinueToSeedInput}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#3b82f6', '#2563eb']}
              style={styles.createButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
              <Text style={styles.createButtonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // Render Import Enter Seed Step
  const renderImportEnterSeedStep = () => {
    const columns = 2;
    const itemsPerColumn = Math.ceil(seedWordCount / columns);

    return (
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with paste button */}
        <View style={styles.section}>
          <View style={styles.seedInputHeader}>
            <ThemedText style={[styles.sectionTitle, { color: secondaryText, marginBottom: 0 }]}>
              Enter Your {seedWordCount} Words
            </ThemedText>
            <TouchableOpacity
              style={[styles.pasteButton, { backgroundColor: '#3b82f620' }]}
              onPress={handlePasteSeedPhrase}
            >
              <MaterialCommunityIcons name="content-paste" size={16} color="#3b82f6" />
              <Text style={styles.pasteButtonText}>Paste</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Seed Words Grid */}
        <View style={styles.section}>
          <View style={[styles.seedInputContainer, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.seedWordsGrid}>
              {/* Left Column */}
              <View style={styles.seedWordsColumn}>
                {Array.from({ length: itemsPerColumn }).map((_, i) => {
                  const index = i;
                  if (index >= seedWordCount) return null;
                  return (
                    <View key={index} style={styles.seedWordInputRow}>
                      <Text style={[styles.seedWordNumber, { color: secondaryText }]}>
                        {index + 1}.
                      </Text>
                      <TextInput
                        style={[
                          styles.seedWordInput,
                          {
                            color: textColor,
                            backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#fff',
                            borderColor: seedWords[index] ? '#3b82f6' : borderColor,
                          }
                        ]}
                        value={seedWords[index]}
                        onChangeText={(value) => handleSeedWordChange(index, value)}
                        placeholder={`Word ${index + 1}`}
                        placeholderTextColor={secondaryText}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="off"
                      />
                    </View>
                  );
                })}
              </View>
              {/* Right Column */}
              <View style={styles.seedWordsColumn}>
                {Array.from({ length: itemsPerColumn }).map((_, i) => {
                  const index = i + itemsPerColumn;
                  if (index >= seedWordCount) return null;
                  return (
                    <View key={index} style={styles.seedWordInputRow}>
                      <Text style={[styles.seedWordNumber, { color: secondaryText }]}>
                        {index + 1}.
                      </Text>
                      <TextInput
                        style={[
                          styles.seedWordInput,
                          {
                            color: textColor,
                            backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#fff',
                            borderColor: seedWords[index] ? '#3b82f6' : borderColor,
                          }
                        ]}
                        value={seedWords[index]}
                        onChangeText={(value) => handleSeedWordChange(index, value)}
                        placeholder={`Word ${index + 1}`}
                        placeholderTextColor={secondaryText}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="off"
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* Import Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.createButtonContainer,
              !isValidSeedPhrase() && styles.buttonDisabled,
            ]}
            onPress={handleStartDiscovery}
            disabled={!isValidSeedPhrase()}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={isValidSeedPhrase() ? ['#3b82f6', '#2563eb'] : ['#9ca3af', '#6b7280']}
              style={styles.createButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <MaterialCommunityIcons name="magnify" size={20} color="#fff" />
              <Text style={styles.createButtonText}>Find Wallet</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // Render Import Discovery Step
  const renderImportDiscoveryStep = () => {
    return (
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Discovery Status */}
        {isDiscovering && (
          <View style={styles.section}>
            <View style={[styles.discoveryCard, { backgroundColor: cardBg, borderColor }]}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <ThemedText style={styles.discoveryText}>
                Scanning for wallets...
              </ThemedText>
              <Text style={[styles.discoveryProgress, { color: secondaryText }]}>
                {discoveryProgress || 'Initializing...'}
              </Text>
            </View>
          </View>
        )}

        {/* Discovered Wallets */}
        {discoveredWallets.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: secondaryText }]}>
              {isDiscovering ? 'Found Wallets' : 'Select Wallet to Import'}
            </ThemedText>
            <View style={[styles.sectionContent, { backgroundColor: cardBg, borderColor }]}>
              {discoveredWallets.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.walletOption,
                    index < discoveredWallets.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor },
                  ]}
                  onPress={() => setSelectedWalletIndex(index)}
                >
                  <View style={styles.walletOptionLeft}>
                    <View style={[styles.typeIcon, { backgroundColor: '#10b98120' }]}>
                      <MaterialCommunityIcons name="wallet" size={24} color="#10b981" />
                    </View>
                    <View style={styles.walletOptionInfo}>
                      <Text style={[styles.typeTitle, { color: textColor }]}>
                        {item.wallet.typeReadable}
                      </Text>
                      {item.subtitle ? (
                        <Text
                          style={[styles.typeSubtitle, { color: secondaryText }]}
                          numberOfLines={1}
                          ellipsizeMode="middle"
                        >
                          {item.subtitle}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <View style={styles.typeRight}>
                    {selectedWalletIndex === index ? (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={24}
                        color="#10b981"
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
        )}

        {/* Wallet Name Input */}
        {!isDiscovering && discoveredWallets.length > 0 && (
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
        )}

        {/* No Wallets Found */}
        {!isDiscovering && discoveredWallets.length === 0 && (
          <View style={styles.section}>
            <View style={[styles.noWalletsCard, { backgroundColor: '#fbbf2420', borderColor: '#fbbf24' }]}>
              <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#fbbf24" />
              <ThemedText style={styles.noWalletsText}>
                No wallets found with transaction history.
              </ThemedText>
              <Text style={[styles.noWalletsSubtext, { color: secondaryText }]}>
                Please check your seed phrase and try again.
              </Text>
            </View>
          </View>
        )}

        {/* Import Button */}
        {!isDiscovering && discoveredWallets.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.createButtonContainer}
              onPress={handleImportSelectedWallet}
              disabled={isCreating}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.createButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isCreating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
                    <Text style={styles.createButtonText}>Import Wallet</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Try Again Button */}
        {!isDiscovering && discoveredWallets.length === 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[
                styles.importButton,
                {
                  backgroundColor: colorScheme === 'dark' ? '#4a4a4a' : '#e5e5e5',
                  borderColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                }
              ]}
              onPress={() => setStep('import-enter-seed')}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={20}
                color={colorScheme === 'dark' ? '#fff' : '#333'}
              />
              <Text style={[
                styles.importButtonText,
                { color: colorScheme === 'dark' ? '#fff' : '#333' }
              ]}>
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    );
  };

  // Get header title based on step
  const getHeaderTitle = () => {
    switch (step) {
      case 'create':
        return 'Add Wallet';
      case 'backup':
        return 'Backup Wallet';
      case 'import-select-words':
        return 'Import Wallet';
      case 'import-enter-seed':
        return 'Enter Seed Phrase';
      case 'import-discovery':
        return 'Discovering Wallets';
      default:
        return 'Add Wallet';
    }
  };

  // Render current step
  const renderCurrentStep = () => {
    switch (step) {
      case 'create':
        return renderCreateStep();
      case 'backup':
        return renderBackupStep();
      case 'import-select-words':
        return renderImportSelectWordsStep();
      case 'import-enter-seed':
        return renderImportEnterSeedStep();
      case 'import-discovery':
        return renderImportDiscoveryStep();
      default:
        return renderCreateStep();
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
            onPress={handleClose}
          >
            <MaterialCommunityIcons
              name={step.startsWith('import-') ? 'arrow-left' : 'close'}
              size={24}
              color={textColor}
            />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>
            {getHeaderTitle()}
          </ThemedText>
          <View style={styles.headerButton} />
        </ThemedView>

        {renderCurrentStep()}
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
  // Import step styles
  infoCardImport: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 24,
    marginHorizontal: 20,
    gap: 12,
  },
  wordCountNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3b82f6',
  },
  seedInputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  pasteButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  seedInputContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  seedWordsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  seedWordsColumn: {
    flex: 1,
    gap: 10,
  },
  seedWordInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  seedWordNumber: {
    width: 24,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  seedWordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  discoveryCard: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 16,
  },
  discoveryText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  discoveryProgress: {
    fontSize: 14,
    textAlign: 'center',
  },
  walletOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  walletOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  walletOptionInfo: {
    flex: 1,
    gap: 4,
  },
  noWalletsCard: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    gap: 12,
  },
  noWalletsText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  noWalletsSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
