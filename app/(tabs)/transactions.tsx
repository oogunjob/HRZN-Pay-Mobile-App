import { Platform, StyleSheet, TouchableOpacity, StatusBar, View, ScrollView } from 'react-native';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';

export default function TransactionsScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <ThemedView style={styles.content}>
          {/* Header */}
          <ThemedView style={styles.header}>
            <TouchableOpacity style={styles.headerButton}>
              <MaterialCommunityIcons name="qrcode-scan" size={24} color={textColor} />
            </TouchableOpacity>
            <ThemedText type="title" style={styles.headerTitle}>Transactions</ThemedText>
            <TouchableOpacity style={styles.headerButton}>
              <MaterialCommunityIcons name="cog" size={24} color={textColor} />
            </TouchableOpacity>
          </ThemedView>

          {/* Content */}
          <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer}>
            <ThemedText>This app includes example code to help you get started.</ThemedText>
            <Collapsible title="File-based routing">
              <ThemedText>
                This app has three screens:{' '}
                <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>,{' '}
                <ThemedText type="defaultSemiBold">app/(tabs)/pay.tsx</ThemedText>, and{' '}
                <ThemedText type="defaultSemiBold">app/(tabs)/transactions.tsx</ThemedText>
              </ThemedText>
              <ThemedText>
                The layout file in <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
                sets up the tab navigator.
              </ThemedText>
              <ExternalLink href="https://docs.expo.dev/router/introduction">
                <ThemedText type="link">Learn more</ThemedText>
              </ExternalLink>
            </Collapsible>
            <Collapsible title="Android, iOS, and web support">
              <ThemedText>
                You can open this project on Android, iOS, and the web. To open the web version, press{' '}
                <ThemedText type="defaultSemiBold">w</ThemedText> in the terminal running this project.
              </ThemedText>
            </Collapsible>
            <Collapsible title="Images">
              <ThemedText>
                For static images, you can use the <ThemedText type="defaultSemiBold">@2x</ThemedText> and{' '}
                <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to provide files for
                different screen densities
              </ThemedText>
              <ExternalLink href="https://reactnative.dev/docs/images">
                <ThemedText type="link">Learn more</ThemedText>
              </ExternalLink>
            </Collapsible>
            <Collapsible title="Light and dark mode components">
              <ThemedText>
                This template has light and dark mode support. The{' '}
                <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook lets you inspect
                what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
              </ThemedText>
              <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
                <ThemedText type="link">Learn more</ThemedText>
              </ExternalLink>
            </Collapsible>
            <Collapsible title="Animations">
              <ThemedText>
                This template includes an example of an animated component. The{' '}
                <ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText> component uses
                the powerful{' '}
                <ThemedText type="defaultSemiBold" style={{ fontFamily: Fonts.mono }}>
                  react-native-reanimated
                </ThemedText>{' '}
                library to create a waving hand animation.
              </ThemedText>
              {Platform.select({
                ios: (
                  <ThemedText>
                    The <ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
                    component provides a parallax effect for the header image.
                  </ThemedText>
                ),
              })}
            </Collapsible>
          </ScrollView>
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
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
});

