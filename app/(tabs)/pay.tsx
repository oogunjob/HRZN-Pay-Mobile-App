import React, { useState, useRef } from 'react';
import { StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { useColorScheme } from 'react-native';
import AnimatedBitcoinInput from '@/components/AnimatedBitcoinInput';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

const { width } = Dimensions.get('window');

// Keyboard component extracted from BitcoinKeyboard
const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'space', 0, 'delete'] as const;
type Keys = (typeof keys)[number];
const _keySize = 70; // Fixed size like original BitcoinKeyboard
const _keySpacing = 40; // Horizontal space between keys
const _keyboardWidth = _keySize * 3 + _keySpacing * 2; // Total width of keyboard
const verticalSpacing = 5; // Vertical spacing between rows

const PassCodeKeyboard = ({ onPress, onDecimalPress, textColor, iconColor }: { 
  onPress: (key: Keys) => void; 
  onDecimalPress: () => void;
  textColor: string;
  iconColor: string;
}) => {
  return (
    <ThemedView
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: _keyboardWidth,
        alignSelf: 'center',
      }}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((key, index) => {
        const isLastInRow = (index + 1) % 3 === 0;
        
        return (
          <TouchableOpacity
            onPress={() => onPress(key as Keys)}
            key={key}
            style={{
              width: _keySize,
              height: _keySize,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: isLastInRow ? 0 : _keySpacing,
              marginBottom: verticalSpacing,
            }}>
            <ThemedText style={{ fontSize: 32, fontWeight: '700', color: textColor }}>{key}</ThemedText>
          </TouchableOpacity>
        );
      })}
      
      {/* Bottom row: decimal, 0, delete */}
      <TouchableOpacity
        onPress={onDecimalPress}
        style={{
          width: _keySize,
          height: _keySize,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: _keySpacing,
        }}>
        <ThemedText style={{ fontSize: 32, fontWeight: '700', color: textColor }}>.</ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => onPress(0)}
        style={{
          width: _keySize,
          height: _keySize,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: _keySpacing,
        }}>
        <ThemedText style={{ fontSize: 32, fontWeight: '700', color: textColor }}>0</ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => onPress('delete')}
        style={{
          width: _keySize,
          height: _keySize,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <MaterialCommunityIcons
          name="keyboard-backspace"
          size={36}
          color={iconColor}
        />
      </TouchableOpacity>
    </ThemedView>
  );
};

export default function PayScreen() {
  const colorScheme = useColorScheme();
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
      <SafeAreaView style={{ flex: 1, backgroundColor }}>
        <ThemedView style={styles.content}>
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

          {/* Keyboard */}
          <ThemedView style={styles.keyboardContainer}>
            <PassCodeKeyboard 
              onPress={handleKeyPress} 
              onDecimalPress={handleDecimal}
              textColor={textColor}
              iconColor={iconColor}
            />
            
            {/* Action Buttons */}
            <ThemedView style={styles.actionButtons}>
              <TouchableOpacity style={[styles.actionButton, styles.payButton]}>
                <ThemedText style={styles.actionButtonText}>Pay</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[
                styles.actionButton,
                { backgroundColor: borderColor }
              ]}>
                <ThemedText style={[styles.actionButtonText, { color: textColor }]}>Request</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
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
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButton: {
    backgroundColor: '#00D9FF',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  keyboardContainer: {
    paddingTop: 10,
    paddingBottom: 20,
    marginTop: 'auto',
  },
});

