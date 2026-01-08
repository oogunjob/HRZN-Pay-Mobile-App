import React, { useCallback, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  View,
  ScrollView,
  Text,
  Alert,
  BackHandler,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useStorage } from '@/providers';
import SeedWords from '@/components/SeedWords';

export default function BackupScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { walletID } = useLocalSearchParams<{ walletID: string }>();
  const { wallets } = useStorage();

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryText = colorScheme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5';
  const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  // Find the wallet
  const wallet = wallets.find(w => w.getID() === walletID);

  useEffect(() => {
    if (!wallet) {
      Alert.alert('Error', 'Wallet not found');
      router.back();
    }
  }, [wallet, router]);

  const handleDone = useCallback(() => {
    // Navigate back to home, closing all modals
    router.dismissAll();
    router.replace('/(tabs)/home');
  }, [router]);

  const handleBackPress = useCallback(() => {
    Alert.alert(
      'Warning',
      'Make sure you have written down your seed phrase. Without it, you cannot recover your wallet.',
      [
        {
          text: 'Go Back',
          style: 'cancel',
        },
        {
          text: 'I Saved It',
          onPress: handleDone,
          style: 'destructive',
        },
      ]
    );
    return true;
  }, [handleDone]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => subscription.remove();
  }, [handleBackPress]);

  if (!wallet) {
    return null;
  }

  const seed = wallet.getSecret();

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={{ flex: 1, paddingTop: insets.top }}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleBackPress}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>Backup Wallet</ThemedText>
          <View style={styles.headerButton} />
        </ThemedView>

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
                <Text style={[styles.infoValue, { color: textColor }]}>{wallet.getLabel()}</Text>
              </View>
              <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: borderColor }]}>
                <Text style={[styles.infoLabel, { color: secondaryText }]}>Type</Text>
                <Text style={[styles.infoValue, { color: textColor }]}>{wallet.typeReadable}</Text>
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
              onPress={handleDone}
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
  recoveryPhraseTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  securityTipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
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
  seedContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
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
