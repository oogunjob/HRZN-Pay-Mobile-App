import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/themed-text';

import { useTheme } from './themes';
import { useLocale } from '@react-navigation/native';

const SeedWords = ({ seed }: { seed: string }) => {
  const words = seed.split(/\s/);
  const { colors } = useTheme();
  const { direction } = useLocale();
  const colorScheme = useColorScheme();

  const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
  const backgroundColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)';

  // Split words into two columns
  const halfLength = Math.ceil(words.length / 2);
  const leftColumn = words.slice(0, halfLength);
  const rightColumn = words.slice(halfLength);

  return (
    <View>
      <View style={styles.columnsContainer}>
        {/* Left Column */}
        <View style={styles.column}>
          {leftColumn.map((word, index) => (
            <View style={[styles.word, { borderColor, backgroundColor }]} key={index}>
              <ThemedText style={styles.wordNumber}>
                {index + 1}.
              </ThemedText>
              <ThemedText style={styles.wordText}>
                {word}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* Right Column */}
        <View style={styles.column}>
          {rightColumn.map((word, index) => (
            <View style={[styles.word, { borderColor, backgroundColor }]} key={index + halfLength}>
              <ThemedText style={styles.wordNumber}>
                {index + halfLength + 1}.
              </ThemedText>
              <ThemedText style={styles.wordText}>
                {word}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.hiddenText} testID="Secret">
        {seed}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  columnsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  column: {
    flex: 1,
    gap: 10,
    width: '50%',
  },
  word: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  wordNumber: {
    fontSize: 15,
    fontWeight: '600',
    minWidth: 26,
  },
  wordText: {
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
  },
  hiddenText: {
    height: 0,
    width: 0,
  },
});

export default SeedWords;
