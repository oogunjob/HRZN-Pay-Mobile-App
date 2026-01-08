import React from 'react';
import { StyleSheet, TouchableOpacity, StatusBar, View, ScrollView, Text, Image, Linking, Platform } from 'react-native';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Rate, { AndroidMarket } from 'react-native-rate';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function AboutScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const secondaryText = colorScheme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5';
  const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  const handleTwitterPress = () => {
    Linking.openURL('https://twitter.com/hrznbtc');
  };

  const handleInstagramPress = () => {
    Linking.openURL('https://instagram.com/hrznbtc');
  };

  const handleYoutubePress = () => {
    Linking.openURL('https://youtube.com/@hrznbtc');
  };

  const handleTiktokPress = () => {
    Linking.openURL('https://tiktok.com/@hrznbtc');
  };

  const handleGithubPress = () => {
    Linking.openURL('https://github.com/oogunjob/HRZN-Mobile-App');
  };

  const handleLicensePress = () => {
    Linking.openURL('https://github.com/oogunjob/HRZN-Mobile-App/blob/master/LICENSE');
  };

  const handleRatePress = () => {
    const options = {
      AppleAppID: '1376878040',
      GooglePackageName: 'com.hrznbtc.hrzn',
      preferredAndroidMarket: AndroidMarket.Google,
      preferInApp: Platform.OS !== 'android',
      openAppStoreIfInAppFails: true,
      fallbackPlatformURL: 'https://hrznbtc.com',
    };
    Rate.rate(options, success => {
      if (success) {
        console.log('User Rated.');
      }
    });
  };

  const socialLinks = [
    {
      name: 'X (Twitter)',
      icon: 'twitter',
      color: '#1DA1F2',
      handle: '@hrznbtc',
      onPress: handleTwitterPress,
    },
    {
      name: 'Instagram',
      icon: 'instagram',
      color: '#E4405F',
      handle: '@hrznbtc',
      onPress: handleInstagramPress,
    },
    {
      name: 'YouTube',
      icon: 'youtube',
      color: '#FF0000',
      handle: '@hrznbtc',
      onPress: handleYoutubePress,
    },
    {
      name: 'TikTok',
      icon: 'music-note',
      color: '#EE1D52',
      handle: '@hrznbtc',
      onPress: handleTiktokPress,
    },
    {
      name: 'GitHub',
      icon: 'github',
      color: colorScheme === 'dark' ? '#fff' : '#333',
      handle: 'hrznbtc',
      onPress: handleGithubPress,
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={{ flex: 1, paddingTop: Math.max(insets.top - 20, 10) }}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.headerTitle}>About</ThemedText>
          <View style={styles.headerButton} />
        </ThemedView>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          {/* Logo & Brand Section */}
          <View style={styles.brandSection}>
            <View style={[styles.logoWrapper, { borderColor: borderColor }]}>
              <Image 
                source={require('@/assets/icon.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <ThemedText style={styles.brandName}>HRZN</ThemedText>
            <Text style={[styles.description, { color: secondaryText }]}>
              A beautiful, open-source Bitcoin wallet built for simplicity and security.
            </Text>
          </View>

          {/* Review Button */}
          <TouchableOpacity
            style={styles.reviewButtonContainer}
            activeOpacity={0.85}
            onPress={handleRatePress}
          >
            <LinearGradient
              colors={['#f97316', '#ea580c']}
              style={styles.reviewButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <MaterialCommunityIcons name="star" size={20} color="#fff" />
              <Text style={styles.reviewButtonText}>Love HRZN? Leave a Review!</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Social Links */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: secondaryText }]}>
              Connect With Us
            </ThemedText>
            <View style={[styles.socialCard, { backgroundColor: cardBg, borderColor }]}>
              {socialLinks.map((social, index) => (
                <TouchableOpacity
                  key={social.name}
                  style={[
                    styles.socialItem,
                    index < socialLinks.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor }
                  ]}
                  onPress={social.onPress}
                >
                  <View style={styles.socialLeft}>
                    <View style={[styles.socialIconContainer, { backgroundColor: `${social.color}20` }]}>
                      <MaterialCommunityIcons 
                        name={social.icon as any} 
                        size={22} 
                        color={social.color} 
                      />
                    </View>
                    <View style={styles.socialInfo}>
                      <Text style={[styles.socialName, { color: textColor }]}>
                        {social.name}
                      </Text>
                      <Text style={[styles.socialHandle, { color: secondaryText }]}>
                        {social.handle}
                      </Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={secondaryText} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* License */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: secondaryText }]}>
              Legal
            </ThemedText>
            <TouchableOpacity 
              style={[styles.licenseCard, { backgroundColor: cardBg, borderColor }]}
              onPress={handleLicensePress}
            >
              <View style={styles.licenseLeft}>
                <View style={[styles.licenseIconContainer, { backgroundColor: '#8b5cf620' }]}>
                  <MaterialCommunityIcons name="scale-balance" size={22} color="#8b5cf6" />
                </View>
                <View style={styles.licenseInfo}>
                  <Text style={[styles.licenseName, { color: textColor }]}>
                    MIT License
                  </Text>
                  <Text style={[styles.licenseDescription, { color: secondaryText }]}>
                    Open source and free forever
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons name="open-in-new" size={20} color={secondaryText} />
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: secondaryText }]}>
              Made with ❤️ for the Bitcoin community
            </Text>
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
    paddingTop: 10,
    paddingBottom: 40,
  },
  brandSection: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 20,
    paddingTop: 20,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 80,      // Changed from 100
    height: 80,     // Changed from 100
  },
  brandName: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 8,
    lineHeight: 40,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  reviewButtonContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 10,
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
  socialCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  socialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  socialLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  socialIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialInfo: {
    gap: 2,
  },
  socialName: {
    fontSize: 16,
    fontWeight: '600',
  },
  socialHandle: {
    fontSize: 13,
  },
  licenseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  licenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  licenseIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  licenseInfo: {
    gap: 2,
  },
  licenseName: {
    fontSize: 16,
    fontWeight: '600',
  },
  licenseDescription: {
    fontSize: 13,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
  },
});

