import React from 'react';
import { StyleSheet, TouchableOpacity, StatusBar, View, ScrollView, Switch, Text } from 'react-native';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [biometricEnabled, setBiometricEnabled] = React.useState(false);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryText = colorScheme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5';
  const borderColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  const settingsSections = [
    {
      title: 'Security',
      items: [
        {
          icon: 'shield-check',
          title: 'Biometric Authentication',
          subtitle: 'Use fingerprint or face ID',
          type: 'toggle',
          value: biometricEnabled,
          onPress: () => setBiometricEnabled(!biometricEnabled),
        },
        {
          icon: 'lock',
          title: 'Change PIN',
          subtitle: 'Update your security PIN',
          type: 'navigate',
          onPress: () => {},
        },
        {
          icon: 'key',
          title: 'Backup Wallet',
          subtitle: 'Export your wallet seed phrase',
          type: 'navigate',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: 'bell',
          title: 'Notifications',
          subtitle: 'Receive transaction alerts',
          type: 'toggle',
          value: notificationsEnabled,
          onPress: () => setNotificationsEnabled(!notificationsEnabled),
        },
        {
          icon: 'currency-usd',
          title: 'Default Currency',
          subtitle: 'BTC',
          type: 'navigate',
          onPress: () => {},
        },
        {
          icon: 'theme-light-dark',
          title: 'Appearance',
          subtitle: colorScheme === 'dark' ? 'Dark' : 'Light',
          type: 'navigate',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'information',
          title: 'App Version',
          subtitle: '1.0.0',
          type: 'info',
        },
        {
          icon: 'information-outline',
          title: 'About HRZN',
          type: 'navigate',
          onPress: () => router.push('/settings/about'),
        },
        {
          icon: 'file-document',
          title: 'Terms of Service',
          type: 'navigate',
          onPress: () => {},
        },
        {
          icon: 'shield-check',
          title: 'Privacy Policy',
          type: 'navigate',
          onPress: () => {},
        },
      ],
    },
  ];

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
          <ThemedText type="title" style={styles.headerTitle}>Settings</ThemedText>
          <View style={styles.headerButton} />
        </ThemedView>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          {settingsSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: secondaryText }]}>
                {section.title}
              </ThemedText>
              <View style={[styles.sectionContent, { backgroundColor: cardBg, borderColor }]}>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.settingItem,
                      itemIndex < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor }
                    ]}
                    onPress={item.onPress}
                    disabled={item.type === 'info'}
                  >
                    <View style={styles.settingLeft}>
                      <View style={[styles.settingIcon, { backgroundColor: `${item.icon === 'shield-check' ? '#f97316' : '#3b82f6'}20` }]}>
                        <MaterialCommunityIcons 
                          name={item.icon as any} 
                          size={20} 
                          color={item.icon === 'shield-check' ? '#f97316' : '#3b82f6'} 
                        />
                      </View>
                      <View style={styles.settingInfo}>
                        <Text style={[styles.settingTitle, { color: textColor }]}>
                          {item.title}
                        </Text>
                        {item.subtitle && (
                          <Text style={[styles.settingSubtitle, { color: secondaryText }]}>
                            {item.subtitle}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.settingRight}>
                      {item.type === 'toggle' && (
                        <Switch
                          value={item.value}
                          onValueChange={item.onPress}
                          trackColor={{ false: '#767577', true: '#f97316' }}
                          thumbColor={item.value ? '#fff' : '#f4f3f4'}
                        />
                      )}
                      {item.type === 'navigate' && (
                        <MaterialCommunityIcons name="chevron-right" size={24} color={secondaryText} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
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
  sectionContent: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: {
    flex: 1,
    gap: 2,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 13,
  },
  settingRight: {
    marginLeft: 12,
  },
});

