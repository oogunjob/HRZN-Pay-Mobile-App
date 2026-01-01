import React, { useState, useRef } from 'react';
import { StyleSheet, TouchableOpacity, StatusBar, Dimensions, View, Text } from 'react-native';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedBitcoinInput from '@/components/AnimatedBitcoinInput';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

const { width } = Dimensions.get('window');

// Keyboard constants - matching original OriginalKeyboard.tsx structure
const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'decimal', 0, 'delete'] as const;
type Keys = (typeof keys)[number];
const _keySize = width / 4; // Width of each key
const _keyHeight = 78; // Height of each key (reduced for less vertical spacing)
const _passcodeSpacing = 20; // Reduced padding to move columns closer to screen edges

const PassCodeKeyboard = ({ onPress, onDecimalPress, textColor, iconColor }: { 
  onPress: (key: Keys) => void; 
  onDecimalPress: () => void;
  textColor: string;
  iconColor: string;
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: _passcodeSpacing,
        justifyContent: 'space-between',
      }}>
      {keys.map((key) => {
        if (key === 'decimal') {
          return (
            <TouchableOpacity
              onPress={onDecimalPress}
              key="decimal"
              style={{
                width: _keySize,
                height: _keyHeight,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View>
                <Text style={{ color: textColor, fontSize: 32, fontWeight: '700' }}>
                  .
                </Text>
              </View>
            </TouchableOpacity>
          );
        }
        return (
          <TouchableOpacity
            onPress={() => key === 'delete' ? onPress(key) : onPress(key)}
            key={key}
            style={{
              width: _keySize,
              height: _keyHeight,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View>
              {key === 'delete' ? (
                <MaterialCommunityIcons
                  name="keyboard-backspace"
                  size={42}
                  color={iconColor}
                />
              ) : (
                <Text style={{ color: textColor, fontSize: 32, fontWeight: '700' }}>
                  {key}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default function PayScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('0');
  const inputRef = useRef<any>(null);
  const [currency, setCurrency] = useState<'BTC' | 'USD'>('BTC');
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({ light: 'rgba(0,0,0,0.3)', dark: 'rgba(255,255,255,0.6)' }, 'text');
  const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const activeBorderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';

  const handleKeyPress = (key: Keys) => {
    if (key === 'delete') {
      setAmount((prev) => {
        if (prev.length <= 1 || prev === '0') return '0';
        const newAmount = prev.slice(0, -1);
        return newAmount === '' ? '0' : newAmount;
      });
      return;
    }

    setAmount((prev) => {
      // Count total digits (excluding decimal point)
      const digitCount = prev.replace('.', '').replace(/^0+/, '').length;
      
      // Limit to 9 digits total
      if (digitCount >= 9) {
        return prev;
      }
      
      // Limit to 8 decimal places for both currencies
      const parts = prev.split('.');
      
      // If we're in the decimal part and at max decimals, don't add more
      if (parts.length > 1 && parts[1].length >= 8) {
        return prev;
      }
      
      // If current value is "0", replace it
      if (prev === '0') {
        return String(key);
      }
      
      return prev + String(key);
    });
  };

  const handleDecimal = () => {
    setAmount((prev) => {
      if (prev.includes('.')) return prev;
      // If it's just "0", replace with "0."
      if (prev === '0') return '0.';
      return prev + '.';
    });
  };

  const formatCurrency = (value: string) => {
    if (currency === 'BTC') {
      return `₿ ${value}`;
    }
    return `$ ${value}`;
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <ThemedView style={styles.content}>
          {/* Top Section: Header + Amount */}
          <View>
            {/* Header */}
            <ThemedView style={styles.header}>
              <TouchableOpacity style={styles.headerButton}>
                <MaterialCommunityIcons name="close" size={24} color={textColor} />
              </TouchableOpacity>
              <ThemedText type="title" style={styles.headerTitle}>Pay</ThemedText>
              <TouchableOpacity style={styles.headerButton}>
                <MaterialCommunityIcons name="qrcode-scan" size={24} color={textColor} />
              </TouchableOpacity>
            </ThemedView>

            {/* Amount Display */}
            <ThemedView style={styles.amountContainer}>
            <AnimatedBitcoinInput
              ref={inputRef}
              value={amount}
              onChangeText={setAmount}
              style={{ ...styles.amountText, color: textColor }}
              gradientColors={colorScheme === 'dark' ? ['#000000', 'transparent'] : ['#ffffff', 'transparent']}
              autoFocus={false}
              formatter={new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 8,
              })}
            />
            {/* <ThemedView style={styles.currencyContainer}>
              <TouchableOpacity
                onPress={() => setCurrency('BTC')}
                style={[
                  styles.currencyButton,
                  { backgroundColor: borderColor },
                  currency === 'BTC' && { backgroundColor: activeBorderColor }
                ]}>
                <ThemedText style={[
                  styles.currencyText,
                  { color: currency === 'BTC' ? textColor : iconColor }
                ]}>
                  BTC
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setCurrency('USD')}
                style={[
                  styles.currencyButton,
                  { backgroundColor: borderColor },
                  currency === 'USD' && { backgroundColor: activeBorderColor }
                ]}>
                <ThemedText style={[
                  styles.currencyText,
                  { color: currency === 'USD' ? textColor : iconColor }
                ]}>
                  USD
                </ThemedText>
              </TouchableOpacity>
            </ThemedView> */}
          </ThemedView>
          </View>

          {/* Keyboard */}
          <View style={styles.keyboardContainer}>
            <PassCodeKeyboard 
              onPress={handleKeyPress} 
              onDecimalPress={handleDecimal}
              textColor={textColor}
              iconColor={iconColor}
            />
            
            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {/* Request Button */}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { 
                    backgroundColor: colorScheme === 'dark' ? '#4a4a4a' : '#e5e5e5',
                    borderWidth: 2,
                    borderColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                  }
                ]}
                activeOpacity={0.85}
              >
                <Text style={[
                  styles.actionButtonText,
                  { color: colorScheme === 'dark' ? '#fff' : '#333' }
                ]}>Request</Text>
              </TouchableOpacity>
              
              {/* Pay Button */}
              <TouchableOpacity
                style={styles.payButtonContainer}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#f97316', '#ea580c']}
                  style={styles.payButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.payButtonText}>Pay</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
        </View>
        </ThemedView>
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
    justifyContent: 'space-between',
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
  amountContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 0,
  },
  amountText: {
    fontSize: 72,
    fontWeight: 'bold',
  },
  currencyContainer: {
    flexDirection: 'row',
    marginTop: 25,
    gap: 12,
  },
  currencyButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  currencyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    paddingTop: 20,
    paddingBottom: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  payButtonContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  payButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  keyboardContainer: {
    paddingTop: 10,
    paddingBottom: 80,
  },
});

